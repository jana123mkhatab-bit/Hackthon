"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChipButton } from "@/components/ui/chip";
import { askTutor, type TutorMessage } from "@/lib/ai-mock";
import { useAccessibility } from "@/lib/accessibility-context";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";

const QUICK_PROMPTS = [
  "Explain this simply",
  "Give me an example",
  "Quiz me",
  "What is important for my exam?",
  "Why is my answer wrong?",
  "Compare two concepts",
];

export function TutorChat({ course }: { course: Course }) {
  const acc = useAccessibility();
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      role: "assistant",
      content: `I only answer using what you've uploaded for ${course.code} — ask me anything about it, or try a prompt below.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    const reply = await askTutor(question, acc.explanationSettings());
    setMessages((m) => [...m, reply]);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-start gap-3 border-gold-border bg-gold-bg p-4">
        <BookOpen className="mt-0.5 size-4 shrink-0 text-[#8a6a1a]" />
        <p className="text-sm text-[#5c4711]">
          Ask My Lecture answers only from your uploaded material for {course.code} — not general
          knowledge about the topic. If it isn&rsquo;t in your material, it&rsquo;ll say so.
        </p>
      </Card>

      <Card className="flex h-[480px] flex-col p-0">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "flex max-w-[85%] flex-col gap-1.5 rounded-[8px] px-4 py-3 text-sm",
                  m.role === "user"
                    ? "bg-terracotta text-paper"
                    : "border border-border bg-bg-warm text-ink"
                )}
              >
                {m.role === "assistant" && (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-terracotta">
                    <Sparkles className="size-3" /> AI Tutor
                  </span>
                )}
                <p className={cn("leading-relaxed", m.role === "assistant" && acc.hasMode("dyslexia") && "dys-copy")}>
                  {m.content}
                </p>
                {m.groundedIn && (
                  <span className="text-[11px] italic text-faint">Grounded in: {m.groundedIn}</span>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-[8px] border border-border bg-bg-warm px-4 py-3 text-sm text-faint">
                <Loader2 className="size-3.5 animate-spin" /> Reading your material...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border p-3">
          {QUICK_PROMPTS.map((p) => (
            <ChipButton key={p} onClick={() => send(p)} disabled={loading}>
              {p}
            </ChipButton>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-border p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${course.name}...`}
            className="flex-1 rounded-[4px] border border-border bg-paper px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex size-10 shrink-0 items-center justify-center rounded-[4px] bg-terracotta text-paper disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="size-4" />
          </button>
        </form>
      </Card>
    </div>
  );
}
