"use client";

import { useMemo, useState } from "react";
import { Network, ArrowRight } from "lucide-react";
import { Card, Panel } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MasteryBadge } from "@/components/ui/mastery-badge";
import { ProgressBar, TickMeter } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Concept, Course, MasteryState } from "@/lib/types";

const LEGEND: MasteryState[] = ["strong", "practicing", "weak", "untested"];

interface ConceptRow {
  concept: Concept;
  course: Course;
}

export function KnowledgeDnaView({ courses }: { courses: Course[] }) {
  const rows = useMemo<ConceptRow[]>(
    () =>
      courses
        .filter((course) => course.hasMaterials)
        .flatMap((course) => course.concepts.map((concept) => ({ concept, course }))),
    [courses]
  );

  const [selectedId, setSelectedId] = useState<string | null>(rows[0]?.concept.id ?? null);
  const selected = rows.find((r) => r.concept.id === selectedId) ?? null;

  if (rows.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <Network className="size-7 text-faint" />
        <p className="max-w-sm text-sm text-faint">
          Your Knowledge DNA fills in once you&rsquo;ve uploaded material and taken an assessment
          in at least one course.
        </p>
        <Button href="/courses" variant="secondary" className="normal-case font-semibold">
          Go to Courses <ArrowRight className="size-4" />
        </Button>
      </Card>
    );
  }

  const requiresFor = (row: ConceptRow) => {
    if (!row.concept.dependsOn?.length) return [];
    const byId = new Map(row.course.concepts.map((c) => [c.id, c]));
    return row.concept.dependsOn.map((id) => byId.get(id)?.name ?? id);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {LEGEND.map((state) => (
          <MasteryBadge key={state} state={state} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => {
            const active = row.concept.id === selectedId;
            return (
              <button
                key={`${row.course.id}-${row.concept.id}`}
                type="button"
                onClick={() => setSelectedId(row.concept.id)}
                className={cn(
                  "flex flex-col gap-2.5 rounded-[6px] border p-4 text-left transition-colors",
                  active ? "border-terracotta bg-terracotta-tint/40" : "border-border bg-paper hover:border-faint"
                )}
                aria-pressed={active}
              >
                <span className="text-sm font-semibold leading-snug">{row.concept.name}</span>
                <TickMeter
                  value={row.concept.mastery}
                  state={row.concept.state === "untested" ? "practicing" : row.concept.state}
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">
                    {row.course.code}
                  </span>
                  <MasteryBadge state={row.concept.state} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-6">
          {selected ? (
            <Card className="flex flex-col gap-5 p-5 sm:p-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif-display text-xl">{selected.concept.name}</h3>
                  <MasteryBadge state={selected.concept.state} />
                </div>
                <span className="text-xs font-semibold text-faint">
                  {selected.course.code} — {selected.course.name} · {selected.course.professor}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wide text-faint">Mastery</span>
                <div className="flex items-center gap-3">
                  <ProgressBar
                    value={selected.concept.mastery}
                    state={selected.concept.state}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold">{selected.concept.mastery}%</span>
                </div>
              </div>

              {requiresFor(selected).length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-faint">Requires</span>
                  <div className="flex flex-wrap gap-1.5">
                    {requiresFor(selected).map((name) => (
                      <span
                        key={name}
                        className="rounded-[4px] border border-border px-2 py-1 text-[11px] text-body"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button href={`/courses/${selected.course.id}/tutor`} className="normal-case font-semibold">
                  Ask Tutor <ArrowRight className="size-4" />
                </Button>
                <Button
                  href={`/courses/${selected.course.id}/knowledge-map`}
                  variant="secondary"
                  className="normal-case font-semibold"
                >
                  Open Course Map
                </Button>
              </div>
            </Card>
          ) : (
            <Panel className="flex flex-col items-center gap-2 text-center">
              <Network className="size-6 text-faint" />
              <p className="text-sm text-faint">
                Select a topic to see its mastery, dependencies, and recommended next step.
              </p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
