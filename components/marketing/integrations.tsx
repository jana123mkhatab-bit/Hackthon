import { CalendarDays, Download, Mic } from "lucide-react";

const ITEMS = [
  {
    Icon: CalendarDays,
    title: "Google Calendar",
    body: "Push study blocks, revision sessions, and exam countdowns straight onto your real calendar.",
  },
  {
    Icon: Mic,
    title: "Text-to-speech",
    body: "Every explanation and lecture excerpt can be read aloud, not just displayed as text.",
  },
  {
    Icon: Download,
    title: "Downloadable everything",
    body: "Study plans, summaries, and assessments export for offline review in low-connectivity mode.",
  },
];

export function Integrations() {
  return (
    <section className="border-y border-border bg-paper py-20">
      <div className="mx-auto max-w-[1180px] px-6 md:px-20">
        <div className="mb-12 flex flex-col items-center gap-2 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-faint">
            Fits into how you already work
          </span>
          <h2 className="font-serif-display text-3xl md:text-[38px]">Connected, not closed off</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {ITEMS.map(({ Icon, title, body }) => (
            <div key={title} className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-bg-sage-tint text-sage">
                <Icon className="size-6" strokeWidth={1.75} />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-body">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
