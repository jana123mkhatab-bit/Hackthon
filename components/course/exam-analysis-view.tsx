import { ArrowRight, Minus, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { AccentCard, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AssessmentResult, Course } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ExamAnalysisView({ course, history }: { course: Course; history: AssessmentResult[] }) {
  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sorted.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <Sparkles className="size-6 text-terracotta" />
        <p className="font-serif-display text-lg">No exams taken yet</p>
        <p className="max-w-sm text-sm text-body">
          Study {course.code} on the Overview tab, then generate a practice exam - your results
          and progress over time will show up here.
        </p>
        <Button href={`/courses/${course.id}`}>
          Go to Overview <ArrowRight className="size-4" />
        </Button>
      </Card>
    );
  }

  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const delta = latest.scorePct - first.scorePct;

  const gapCounts = new Map<string, number>();
  for (const a of sorted) {
    for (const g of a.gaps) gapCounts.set(g, (gapCounts.get(g) ?? 0) + 1);
  }
  const recurringGaps = [...gapCounts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <AccentCard accent="terracotta" className="p-5">
          <span className="text-xs font-bold uppercase tracking-wide text-faint">Latest Score</span>
          <p className="font-serif-display text-4xl">{latest.scorePct}%</p>
          <span className="text-xs text-faint">{formatDate(latest.date)}</span>
        </AccentCard>

        <Card className="p-5">
          <span className="text-xs font-bold uppercase tracking-wide text-faint">
            {sorted.length > 1 ? "Change since first exam" : "Exams taken"}
          </span>
          {sorted.length > 1 ? (
            <p
              className={cn(
                "flex items-center gap-1.5 font-serif-display text-4xl",
                delta > 0 ? "text-sage" : delta < 0 ? "text-terracotta" : "text-faint"
              )}
            >
              {delta > 0 ? (
                <TrendingUp className="size-6" />
              ) : delta < 0 ? (
                <TrendingDown className="size-6" />
              ) : (
                <Minus className="size-6" />
              )}
              {delta > 0 ? "+" : ""}
              {delta}%
            </p>
          ) : (
            <p className="font-serif-display text-4xl">1</p>
          )}
          <span className="text-xs text-faint">
            {sorted.length} exam{sorted.length > 1 ? "s" : ""} taken
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-bold uppercase tracking-wide text-faint">Persistent Gaps</span>
          <p className="font-serif-display text-4xl">{recurringGaps.length}</p>
          <span className="text-xs text-faint">appeared in more than one exam</span>
        </Card>
      </div>

      {recurringGaps.length > 0 && (
        <AccentCard accent="gold" className="p-6">
          <h3 className="mb-3 font-serif-display text-lg">Keep focusing on</h3>
          <div className="flex flex-wrap gap-2">
            {recurringGaps.map((g) => (
              <span key={g} className="rounded-[4px] bg-gold-bg px-2.5 py-1 text-xs font-bold text-[#8a6a1a]">
                {g}
              </span>
            ))}
          </div>
        </AccentCard>
      )}

      <Card className="p-6">
        <h3 className="mb-4 font-serif-display text-lg">Exam History</h3>
        <div className="flex flex-col divide-y divide-border">
          {[...sorted].reverse().map((a) => (
            <div key={a.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{formatDate(a.date)}</span>
                <span
                  className={cn(
                    "font-serif-display text-xl",
                    a.scorePct >= 70 ? "text-sage" : "text-terracotta"
                  )}
                >
                  {a.scorePct}%
                </span>
              </div>
              <p className="text-sm text-body">{a.aiExplanation}</p>
              {a.gaps.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {a.gaps.map((g) => (
                    <span
                      key={g}
                      className="rounded-[4px] border border-border px-2 py-0.5 text-[11px] text-faint"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div>
        <Button href={`/courses/${course.id}/assessment`}>
          Take Another Practice Exam <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
