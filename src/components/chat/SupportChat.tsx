'use client';

import { useEffect, useRef, useState } from "react";
import { MessageRole } from "@prisma/client";

type ChatMessage = {
  id?: string;
  role: MessageRole;
  content: string;
  feedback?: number | null;
};

type SupportChatProps = {
  initialChatId?: string;
  initialMessages: ChatMessage[];
};

export function SupportChat({ initialChatId, initialMessages }: SupportChatProps) {
  const [chatId, setChatId] = useState(initialChatId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    const userMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, chatId }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Chat request failed");
      }

      const newChatId = response.headers.get("x-chat-id");
      const assistantId = response.headers.get("x-assistant-message-id") ?? `temp-assistant-${Date.now()}`;
      if (newChatId) setChatId(newChatId);

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
        },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: `${msg.content}${chunk}` } : msg,
          ),
        );
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFeedback = async (messageId: string | undefined, value: 1 | -1) => {
    if (!messageId || messageId.startsWith("temp")) return;
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, value }),
      });
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, feedback: value } : msg)),
      );
    } catch {
      console.error("Feedback failed");
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg text-slate-500 font-semibold">SupportBot</p>
          <p className="text-sm text-slate-500">Ask any product question.</p>
        </div>
        <div className="text-xs text-slate-500">
          {chatId ? `Chat ID: ${chatId}` : "New chat"}
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto rounded-lg bg-slate-50 p-3"
      >
        {messages.length === 0 && (
          <p className="text-center text-sm text-slate-500">
            Start the conversation with a question about the product.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id ?? `${msg.role}-${Math.random()}`}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-900 border border-slate-200"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.role === "assistant" && msg.id && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleFeedback(msg.id, 1)}
                    className={`rounded-full border px-2 py-1 transition hover:bg-slate-100 ${
                      msg.feedback === 1 ? "border-blue-500 text-blue-600" : "border-slate-200"
                    }`}
                  >
                    👍
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback(msg.id, -1)}
                    className={`rounded-full border px-2 py-1 transition hover:bg-slate-100 ${
                      msg.feedback === -1 ? "border-red-500 text-red-600" : "border-slate-200"
                    }`}
                  >
                    👎
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask about pricing, features, or support..."
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-500 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          disabled={isSending}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={isSending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

