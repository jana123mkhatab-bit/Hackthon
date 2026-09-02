import { Check, BookOpen, Accessibility, Languages } from "lucide-react";

const FEATURES = [
  {
    Icon: BookOpen,
    title: "Built on your actual materials",
    body: "Every explanation, question, and study block traces back to something you uploaded — not generic subject trivia.",
  },
  {
    Icon: Accessibility,
    title: "Adaptive, not just accessible",
    body: "ADHD-friendly focus mode and dyslexia-friendly reading support change the interface and the content — in real time, app-wide.",
  },
  {
    Icon: Languages,
    title: "Learn in the language you think in",
    body: "English, Arabic, or both at once — with technical terms preserved when you need them to be.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-bg-sage-tint py-24">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-16 px-6 md:px-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="font-serif-display text-3xl md:text-[42px]">
            Engineered for high-stakes courses — in any major
          </h2>
          <p className="text-body">
            Computer science, medicine, business, humanities. StudyPilot doesn&rsquo;t assume
            everything in a textbook has equal weight — and neither should your study time.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-[8px] border border-border bg-paper p-7">
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-[6px] bg-terracotta-tint text-terracotta">
                <Icon className="size-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif-display text-xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{body}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            "Direct syllabus correlation",
            "Intelligent slide highlighting",
            "Real-time calendar sync",
            "Retrieval-grounded AI tutor",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-sm font-semibold">
              <Check className="size-4 text-sage" strokeWidth={2.5} />
              {f}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
