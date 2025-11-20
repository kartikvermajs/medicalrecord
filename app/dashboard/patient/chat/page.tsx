"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2, Trash2 } from "lucide-react";

type ChatMessage = {
  id: string;
  from: "user" | "assistant";
  text: string;
  createdAt: string;
};

export default function PatientChatPage() {
  const { data: session, status } = useSession();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? sessionStorage.getItem("CuraVault_chat")
          : null;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // ⬇ Auto-scroll when messages update
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }

    try {
      sessionStorage.setItem("CuraVault_chat", JSON.stringify(messages));
    } catch {}
  }, [messages]);

  if (status === "loading") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      from: "user",
      text: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });

      const json = await res.json();
      const replyText = json.reply ?? "I'm not sure how to answer that.";

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        from: "assistant",
        text: replyText,
        createdAt: new Date().toISOString(),
      };

      setMessages((m) => [...m, botMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  function clearChat() {
    setMessages([]);
    sessionStorage.removeItem("CuraVault_chat");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* HEADER */}
      <header
        className="
        sticky top-0 z-20
        bg-card/80 backdrop-blur-lg border-b border-border
        px-4 py-3 flex items-center justify-between
      "
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none">
              CuraVault AI Assistant
            </h1>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={clearChat}
          aria-label="Clear conversation"
        >
          <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
        </Button>
      </header>

      {/* CHAT CONTAINER */}
      <main
        ref={listRef}
        className="
          flex-1 overflow-y-auto px-4 py-4 space-y-4
          scrollbar-thin scrollbar-thumb-muted/50
        "
      >
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm mt-10">
            Start chatting — ask about your checkups, past doctor notes, health
            concerns, or follow-up advice.
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`
              flex w-full 
              ${m.from === "user" ? "justify-end" : "justify-start"}
            `}
          >
            <div
              className={`
                max-w-[80%] px-4 py-3 rounded-2xl shadow-sm text-sm
                animate-[fadeIn_0.3s_ease]
                ${
                  m.from === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none"
                }
              `}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>

              <p
                className="
                  text-[10px] mt-1 text-muted
                  text-right
                "
              >
                {new Date(m.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin h-4 w-4" />
            Thinking…
          </div>
        )}
      </main>

      {/* FOOTER INPUT BAR */}
      <footer
        className="
        sticky bottom-0 z-10 
        bg-card/90 backdrop-blur-lg
        border-t border-border
        px-4 py-3 flex items-center gap-3
      "
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
          className="flex-1 h-11 rounded-full px-4"
        />

        <Button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="h-11 w-11 rounded-full p-0 flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </footer>
    </div>
  );
}
