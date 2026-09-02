import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Semester Flyer",
    price: "$29",
    period: "/one-off payment",
    features: [
      "Upload up to 10 courses",
      "Full past-assessment matching",
      "Custom syllabus runway",
      "Active notifications",
    ],
    cta: "Fly Solo",
    highlight: false,
  },
  {
    name: "Co-Pilot Pro",
    price: "$49",
    period: "/semester",
    features: [
      "Unlimited course pilots",
      "Priority past-exam crawling",
      "Adaptive revision rescheduling",
      "Full accessibility & language suite",
      "Dedicated AI tutor access",
    ],
    cta: "Secure Your Runway",
    highlight: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-bg-warm py-24">
      <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-14 px-6 lg:px-0">
        <div className="flex max-w-lg flex-col items-center gap-2 text-center">
          <h2 className="font-serif-display text-3xl md:text-[42px]">Simple, honest pricing</h2>
          <p className="text-body">Choose the plan that fits your semester. No recurring trap.</p>
        </div>
        <div className="grid w-full min-w-0 grid-cols-1 place-items-center gap-8 sm:grid-cols-2">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={cn(
                "relative flex w-full max-w-[380px] flex-col gap-6 rounded-[4px] bg-paper p-9 shadow-[0_4px_8px_rgba(44,43,41,0.07)]",
                p.highlight ? "border-[1.5px] border-terracotta rotate-1" : "border border-border -rotate-1"
              )}
            >
              {p.highlight && <span className="pin-dot bg-terracotta" />}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-bold uppercase tracking-wide",
                    p.highlight ? "text-terracotta" : "text-faint"
                  )}
                >
                  {p.name}
                </span>
                {p.highlight && (
                  <span className="rounded-[4px] bg-terracotta-tint px-2 py-1 text-[11px] font-semibold text-terracotta">
                    Popular
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif-display text-5xl">{p.price}</span>
                <span className="text-sm text-body">{p.period}</span>
              </div>
              <hr className="border-border" />
              <ul className="flex flex-col gap-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-body">
                    <Check className="size-3.5 shrink-0 text-faint" strokeWidth={2} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button href="/onboarding" className="mt-1">
                {p.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
