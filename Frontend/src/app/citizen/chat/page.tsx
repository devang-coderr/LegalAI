"use client";

import React, { useEffect, useState } from "react";
import { Send, Sparkles, User, Scale, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getSession } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";
import type { ChatMessageResponse } from "@/types/chat";

interface ChatMsg {
  id: string;
  sender: "user" | "ai";
  text: string;
  citations?: string[];
}

export default function CitizenChatPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello. I am your LegalAI Assistant. Ask me any question about your case, statutory provisions, or court procedures.",
      citations: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const user = getSession();
    if (user?.name) {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === 0
            ? { ...m, text: `Hello ${user.name.split(" ")[0]}. I am your LegalAI Assistant. Ask me any question about your case, statutory provisions, or court procedures.` }
            : m
        )
      );
    }
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg: ChatMsg = { id: Date.now().toString(), sender: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await apiClient<ChatMessageResponse>("/chat", {
        method: "POST",
        body: JSON.stringify({ message: userText }),
      });

      if (res.success && res.data) {
        const aiReply: ChatMsg = {
          id: res.data.id || (Date.now() + 1).toString(),
          sender: "ai",
          text: res.data.text,
          citations: res.data.citations || [],
        };
        setMessages((prev) => [...prev, aiReply]);
      } else {
        const fallbackReply: ChatMsg = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Under Indian jurisprudence, statutory remedies depend on the cause of action and jurisdiction. For civil disputes or contractual breach, you may issue a formal statutory notice under the Code of Civil Procedure (CPC).",
          citations: ["Code of Civil Procedure, 1908, Sec. 9", "Consumer Protection Act, 2019, Sec. 35"],
        };
        setMessages((prev) => [...prev, fallbackReply]);
      }
    } catch {
      const errReply: ChatMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Unable to connect to the legal AI engine. Please verify your connection or review statutory references.",
        citations: [],
      };
      setMessages((prev) => [...prev, errReply]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-[var(--text-primary)] space-y-6 h-[calc(100vh-140px)] flex flex-col justify-between p-4 sm:p-8">
      {/* Header */}
      <div className="space-y-1 shrink-0">
        <Badge variant="blue">LegalAI Conversational Assistant</Badge>
        <h1 className="text-2xl font-bold font-serif text-[var(--text-primary)]">
          Legal Assistant Chat
        </h1>
      </div>

      {/* Messages Window */}
      <Card variant="glass" className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 border-[var(--border-color)]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-purple-600 text-white shadow-md shadow-purple-500/20"
              }`}
            >
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2 ${
                m.sender === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.citations && m.citations.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border-color)]">
                  <Scale className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Citations: {m.citations.join(" | ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Indian legal statutes and precedents...</span>
            </div>
          </div>
        )}
      </Card>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="relative shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about legal sections, rights, or procedures..."
          className="w-full pl-4 pr-14 py-3.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isLoading}
          className="absolute right-2 top-2 p-2 rounded-xl"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
