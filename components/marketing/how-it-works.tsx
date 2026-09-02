import { Card } from "@/components/ui/card";

const STEPS = [
  {
    n: "01",
    title: "Upload your materials",
    body: "Slides, syllabi, notes, and past assessments. StudyPilot reads them the way a diligent classmate would — cover to cover.",
    rotate: "-rotate-1",
    color: "text-sage",
  },
  {
    n: "02",
    title: "It finds the emphasis + your gaps",
    body: "The AI flags concepts your professor returns to again and again, then checks which ones your own assessments say you're shaky on.",
    rotate: "rotate-1",
    color: "text-terracotta",
  },
  {
    n: "03",
    title: "Get a plan built around your exam",
    body: "A short list of focus blocks, scheduled before the dates that matter — and it keeps adjusting as you keep learning.",
    rotate: "-rotate-2",
    color: "text-gold-border",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1280px] px-6 py-24 md:px-20">
      <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-3 text-center">
        <h2 className="font-serif-display text-3xl md:text-[42px]">
          A step-by-step pilot to ace your course
        </h2>
        <p className="text-body">
          Instead of a static syllabus checklist, your journey is plotted onto an
          active study board that changes as you do.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        {STEPS.map((s) => (
          <Card key={s.n} className={`w-[360px] max-w-full p-8 ${s.rotate}`}>
            <p className={`font-serif-display text-5xl opacity-45 ${s.color}`}>{s.n}</p>
            <h3 className="mt-4 font-serif-display text-2xl">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-body">{s.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
