"use client";

import React, { useState } from "react";
import { Send, Sparkles, User, Scale } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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
      text: "Hello Anil. I am your LegalAI Assistant. Ask me any question about your case, statutory provisions, or court procedures.",
      citations: [],
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMsg = { id: Date.now().toString(), sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const aiReply: ChatMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Based on Indian property jurisprudence, a landlord cannot withhold security deposit arbitrarily without providing itemized repair invoices. Under Section 108(m) of the Transfer of Property Act, normal wear and tear is excluded from damages.",
        citations: ["(2018) SCC Online Del 942"],
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 600);
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
              <p>{m.text}</p>
              {m.citations && m.citations.length > 0 && (
                <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--border-color)]">
                  <Scale className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Citation: {m.citations.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </Card>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="relative shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask follow-up questions..."
          className="w-full pl-4 pr-14 py-3.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="absolute right-2 top-2 p-2 rounded-xl"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
