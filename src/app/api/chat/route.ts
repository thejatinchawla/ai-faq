import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { FAQ_ENTRIES } from "@/lib/faq";
import { MessageRole } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatRequest = {
  message?: string;
  chatId?: string;
};

function selectFaqContext(query: string, limit = 4) {
  const normalized = query.toLowerCase();
  const scored = FAQ_ENTRIES.map((entry) => {
    const haystack = `${entry.question} ${entry.answer} ${(entry.keywords ?? []).join(" ")}`.toLowerCase();
    const keywords = normalized.split(/\s+/).filter(Boolean);
    const score = keywords.reduce((acc, word) => (haystack.includes(word) ? acc + 1 : acc), 0);
    return { entry, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => entry);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const userMessage = typeof body.message === "string" ? body.message.trim() : "";
  if (!userMessage) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const existingChat = body.chatId
    ? await prisma.chat.findFirst({
        where: { id: body.chatId, userId: session.user.id },
      })
    : null;

  const chat =
    existingChat ??
    (await prisma.chat.create({
      data: {
        userId: session.user.id,
        title: userMessage.slice(0, 80) || "New chat",
      },
    }));

  await prisma.message.create({
    data: {
      chatId: chat.id,
      role: MessageRole.user,
      content: userMessage,
    },
  });

  await prisma.chat.update({
    where: { id: chat.id },
    data: { updatedAt: new Date() },
  });

  const history = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: "asc" },
    take: 30,
  });

  const assistantMessage = await prisma.message.create({
    data: {
      chatId: chat.id,
      role: MessageRole.assistant,
      content: "",
    },
  });

  const faqContext = selectFaqContext(userMessage, 4);
  const faqText = faqContext
    .map(
      (entry, idx) =>
        `${idx + 1}. Question: ${entry.question}\nAnswer: ${entry.answer}${
          entry.keywords ? `\nKeywords: ${entry.keywords.join(", ")}` : ""
        }`,
    )
    .join("\n\n");

  const systemPrompt = `You are SupportBot for a SaaS product. You must answer ONLY using the FAQ context provided. If the answer is not clearly in the context, say you are not sure and will hand off to a human. Keep replies concise and friendly.`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    { role: "system" as const, content: `FAQ Context:\n${faqText}` },
    ...history
      .filter((msg) => msg.id !== assistantMessage.id)
      .map((msg) => ({ role: msg.role, content: msg.content })),
    { role: "user" as const, content: userMessage },
  ];

  const encoder = new TextEncoder();
  let assistantContent = "";

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    stream: true,
    messages,
  });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const part of completion) {
          const token = part.choices[0]?.delta?.content || "";
          assistantContent += token;
          controller.enqueue(encoder.encode(token));
        }

        await prisma.message.update({
          where: { id: assistantMessage.id },
          data: { content: assistantContent },
        });

        await prisma.chat.update({
          where: { id: chat.id },
          data: { updatedAt: new Date() },
        });

        controller.close();
      } catch (error) {
        await prisma.message.update({
          where: { id: assistantMessage.id },
          data: { content: "Sorry, I ran into an issue. Please try again." },
        });
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "x-chat-id": chat.id,
      "x-assistant-message-id": assistantMessage.id,
    },
  });
}

