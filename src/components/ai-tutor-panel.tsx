"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export function AiTutorPanel({
  lessonId,
  open,
  onClose,
}: {
  lessonId: string;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("player");
  const locale = useLocale();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    const history = messages.slice(-6);
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, question: q, history, locale }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { answer?: string };
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.answer || t("aiError") },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: t("aiError") }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() =>
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }),
      );
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:absolute">
      <div
        className="absolute inset-0 bg-black/40 lg:hidden"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-medium">{t("assistant")}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeAssistant")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Sparkles className="h-6 w-6" />
              </span>
              <p className="mt-3 text-sm text-muted-foreground">
                {t("assistantIntro")}
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm",
                  m.role === "user"
                    ? "bg-brand text-brand-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("thinking")}
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={send}
          className="flex items-center gap-2 border-t border-border p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("askPlaceholder")}
            className="h-10 w-full min-w-0 flex-1 rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label={t("send")}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
