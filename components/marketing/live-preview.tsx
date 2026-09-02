"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COURSES, PROFESSOR_FOCUS } from "@/lib/mock-data";
import { MasteryBadge } from "@/components/ui/mastery-badge";
import { ProgressBar } from "@/components/ui/progress";
import { StarRating } from "@/components/ui/star-rating";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "focus", label: "Professor Focus" },
  { id: "map", label: "Knowledge Map" },
  { id: "plan", label: "Study Plan" },
] as const;

const algorithms = COURSES.find((c) => c.id === "algorithms")!;
const focusItems = PROFESSOR_FOCUS.algorithms;

export function LivePreview() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("focus");

  return (
    <section className="mx-auto max-w-[1180px] px-6 pb-24 md:px-20">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-faint">
          Not another chatbot
        </span>
        <h2 className="font-serif-display text-3xl md:text-[40px]">This is what StudyPilot actually shows you</h2>
        <p className="max-w-lg text-body">Real widgets, built from real course data — try the tabs.</p>
      </div>

      <div className="mx-auto flex w-fit gap-1 rounded-[6px] border border-border bg-paper p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-[4px] px-4 py-2 text-sm font-semibold transition-colors",
              tab === t.id ? "bg-ink text-paper" : "text-body hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-[10px] border border-border bg-paper p-6 shadow-[0_8px_24px_rgba(44,43,41,0.08)] md:p-10">
        <AnimatePresence mode="wait">
          {tab === "focus" && (
            <motion.div
              key="focus"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-3"
            >
              <p className="mb-1 text-sm text-faint">
                CS 301 · Algorithms — based on patterns across your uploaded lectures &amp; past assessments
              </p>
              {focusItems.map((item) => (
                <div
                  key={item.conceptId}
                  className="flex flex-col gap-2 rounded-[6px] border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{item.conceptName}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {item.evidence.slice(0, 2).map((e) => (
                        <Chip key={e}>{e}</Chip>
                      ))}
                    </div>
                  </div>
                  <StarRating value={item.stars} />
                </div>
              ))}
            </motion.div>
          )}

          {tab === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4"
            >
              <p className="mb-1 text-sm text-faint">
                {algorithms.code} · {algorithms.name} — updates automatically after every assessment
              </p>
              {algorithms.concepts.map((c) => (
                <div key={c.id} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex w-full items-center justify-between sm:w-44">
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className="text-xs text-faint sm:hidden">{c.mastery}%</span>
                  </div>
                  <div className="flex flex-1 items-center gap-3">
                    <ProgressBar value={c.mastery} state={c.state} className="flex-1" />
                    <span className="hidden w-10 text-right text-xs text-faint sm:inline">{c.mastery}%</span>
                    <MasteryBadge state={c.state} />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {tab === "plan" && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-3"
            >
              <p className="mb-1 text-sm text-faint">
                Adjusted after this week&rsquo;s assessment — extra Dynamic Programming block added
              </p>
              {[
                { day: "Mon", time: "4:00 PM", subject: "Algorithms", topic: "Dynamic Programming", mins: 45, added: true },
                { day: "Tue", time: "5:00 PM", subject: "Networks", topic: "Routing", mins: 40 },
                { day: "Wed", time: "4:00 PM", subject: "Algorithms", topic: "Practice Problems", mins: 60 },
                { day: "Fri", time: "3:00 PM", subject: "Algorithms", topic: "Quick Assessment", mins: 20 },
              ].map((s) => (
                <div
                  key={s.day + s.topic}
                  className={cn(
                    "flex items-center justify-between rounded-[6px] border p-3.5",
                    s.added ? "border-terracotta bg-terracotta-tint/40" : "border-border"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 text-xs text-faint">
                      {s.day}
                      <br />
                      {s.time}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{s.subject}</p>
                      <p className="text-xs text-body">
                        {s.topic} · {s.mins} min
                      </p>
                    </div>
                  </div>
                  {s.added && (
                    <span className="rounded-[4px] bg-terracotta px-2 py-1 text-[10px] font-bold uppercase text-paper">
                      Added
                    </span>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
