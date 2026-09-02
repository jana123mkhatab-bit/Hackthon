const QUOTES = [
  {
    quote:
      "For my biochemistry final I had over 600 slides. StudyPilot found exactly where Dr. Aris focused during past midterms and I ignored the rest. Studied 8 hours instead of 40.",
    name: "Liam Vance",
    sub: "Biology, UW Madison",
    initials: "LV",
  },
  {
    quote:
      "The ADHD focus mode is the first study tool that didn't just add another dashboard to stare at. One task, one timer, done.",
    name: "Priya Nandan",
    sub: "Computer Science, Georgia Tech",
    initials: "PN",
  },
  {
    quote:
      "I switched between English and Arabic mid-session for a networking class and it kept every protocol name intact. Small thing, huge difference.",
    name: "Omar Haddad",
    sub: "Business Strategy, AUC",
    initials: "OH",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-[1180px] px-6 py-24 md:px-20">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {QUOTES.map((q, i) => (
          <div
            key={q.name}
            className={`relative rounded-[4px] border border-border bg-paper p-7 shadow-[0_4px_8px_rgba(44,43,41,0.07)] ${
              i === 1 ? "md:-translate-y-3" : ""
            }`}
          >
            <div className="absolute left-6 top-0 bottom-0 w-px bg-rule-pink" />
            <p className="font-serif-display text-lg leading-snug">&ldquo;{q.quote}&rdquo;</p>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-terracotta text-sm font-bold text-paper">
                {q.initials}
              </div>
              <div>
                <p className="text-sm font-bold">{q.name}</p>
                <p className="text-xs text-body">{q.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
