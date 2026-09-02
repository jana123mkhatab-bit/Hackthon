"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Do I have to disclose a diagnosis to use accessibility features?",
    a: "No. Every accessibility and learning-support setting is a preference you choose — dyslexia-friendly mode and ADHD focus mode are named for who tends to find them useful, but anyone can turn them on, and nothing requires a diagnosis or medical information.",
  },
  {
    q: "Does StudyPilot work for majors outside computer science?",
    a: "Yes — the whole platform is built subject-agnostic. It's demoed here with algorithms, operating systems, biochemistry, and business strategy on purpose, so it's obvious it isn't hard-coded to one field.",
  },
  {
    q: "What happens to the materials I upload?",
    a: "Your slides, notes, and past assessments are used only to ground your own explanations, assessments, and study plan — retrieval-based, from your material, not treated as generic training data for other students.",
  },
  {
    q: "Is the Google Calendar integration real?",
    a: "In this prototype it's a realistic mock — clearly labeled — so the full flow is demoable end-to-end. The architecture is built so a real Google Calendar connection can be dropped in without changing the surrounding UI.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-[840px] px-6 py-24 md:px-0">
      <div className="mb-10 text-center">
        <h2 className="font-serif-display text-3xl md:text-[38px]">Questions, answered plainly</h2>
      </div>
      <div className="flex flex-col divide-y divide-border rounded-[8px] border border-border bg-paper">
        {FAQS.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={open}
              >
                <span className="font-semibold">{item.q}</span>
                <ChevronDown
                  className={cn("size-5 shrink-0 text-faint transition-transform", open && "rotate-180")}
                />
              </button>
              {open && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-body">{item.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
