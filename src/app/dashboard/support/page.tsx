import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { SupportChat } from "@/components/chat/SupportChat";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { StartNewChatButton } from "@/components/chat/StartNewChatButton";

type SearchParams = {
  new?: string;
};

export default async function SupportPage({ searchParams }: { searchParams?: SearchParams }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const startNew = searchParams?.new === "1";

  const latestChat = startNew
    ? null
    : await prisma.chat.findFirst({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 50,
            include: { feedback: true },
          },
        },
      });

  const initialMessages =
    latestChat?.messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      feedback: msg.feedback?.value ?? null,
    })) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Support Chat</h1>
          <p className="text-sm text-slate-600">
            Ask product questions. Answers come strictly from the FAQ knowledge base.
          </p>
        </div>
        <StartNewChatButton className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300" />
      </div>

      <SupportChat initialChatId={latestChat?.id} initialMessages={initialMessages} />
    </div>
  );
}

