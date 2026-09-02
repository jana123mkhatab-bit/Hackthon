import { ArrowRight, Layers } from "lucide-react";
import { Card, Panel } from "@/components/ui/card";
import { MasteryBadge } from "@/components/ui/mastery-badge";
import { TickMeter } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { Course } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Groups concepts into dependency tiers (foundation first) for a simple, honest map layout. */
function tierConcepts(course: Course) {
  const byId = new Map(course.concepts.map((c) => [c.id, c]));
  const tierOf = new Map<string, number>();

  function depth(id: string, seen = new Set<string>()): number {
    if (tierOf.has(id)) return tierOf.get(id)!;
    if (seen.has(id)) return 0; // guard against cycles
    const c = byId.get(id);
    if (!c || !c.dependsOn?.length) {
      tierOf.set(id, 0);
      return 0;
    }
    const d = 1 + Math.max(...c.dependsOn.map((dep) => depth(dep, new Set(seen).add(id))));
    tierOf.set(id, d);
    return d;
  }

  course.concepts.forEach((c) => depth(c.id));

  const tiers: (typeof course.concepts)[] = [];
  course.concepts.forEach((c) => {
    const t = tierOf.get(c.id) ?? 0;
    (tiers[t] ??= []).push(c);
  });
  return { tiers: tiers.filter(Boolean), byId };
}

export function KnowledgeMapView({ course }: { course: Course }) {
  if (!course.hasMaterials || course.concepts.every((c) => c.state === "untested")) {
    return (
      <Card className="p-8 text-center text-sm text-faint">
        Your knowledge map fills in once you&rsquo;ve uploaded material and taken an assessment
        for {course.code}.
      </Card>
    );
  }

  const { tiers, byId } = tierConcepts(course);
  const counts = {
    strong: course.concepts.filter((c) => c.state === "strong").length,
    practicing: course.concepts.filter((c) => c.state === "practicing").length,
    weak: course.concepts.filter((c) => c.state === "weak").length,
    untested: course.concepts.filter((c) => c.state === "untested").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["strong", "practicing", "weak", "untested"] as const).map((s) => (
          <Card key={s} className="flex flex-col gap-1.5 p-4">
            <MasteryBadge state={s} />
            <span className="font-serif-display text-2xl">{counts[s]}</span>
          </Card>
        ))}
      </div>

      <Panel className="flex items-start gap-3">
        <Layers className="mt-0.5 size-4 shrink-0 text-sage" />
        <p className="text-sm text-body">
          Foundational concepts are on the left; concepts that build on them are stacked to the
          right, connected by &ldquo;requires.&rdquo; A weak concept upstream is usually why a
          concept downstream feels shaky too.
        </p>
      </Panel>

      <div className="flex flex-col gap-6 overflow-x-auto pb-2 md:flex-row md:items-start">
        {tiers.map((tier, i) => (
          <div key={i} className="flex min-w-[240px] flex-1 flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wide text-faint">
              {i === 0 ? "Foundation" : `Builds on tier ${i}`}
            </span>
            {tier.map((c) => (
              <Card key={c.id} className="flex flex-col gap-2.5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{c.name}</span>
                  <MasteryBadge state={c.state} />
                </div>
                <TickMeter value={c.mastery} state={c.state === "untested" ? "practicing" : c.state} />
                {c.dependsOn && c.dependsOn.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-faint">
                    <span>requires</span>
                    {c.dependsOn.map((dep) => (
                      <span key={dep} className="rounded-[4px] border border-border px-1.5 py-0.5">
                        {byId.get(dep)?.name ?? dep}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ))}
      </div>

      {course.concepts.some((c) => c.state === "weak") && (
        <Card className={cn("flex flex-wrap items-center justify-between gap-3 p-5")}>
          <span className="text-sm text-body">
            Turn your weakest concepts into a focused study plan and matched resources.
          </span>
          <Button href="/techniques" variant="secondary" className="normal-case font-semibold">
            Get Recommendations <ArrowRight className="size-4" />
          </Button>
        </Card>
      )}
    </div>
  );
}
