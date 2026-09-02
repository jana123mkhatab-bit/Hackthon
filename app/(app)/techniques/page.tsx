import { PageHeader } from "@/components/app/page-header";
import { Card, StickyNote } from "@/components/ui/card";
import { MasteryBadge } from "@/components/ui/mastery-badge";
import { COURSES, TECHNIQUES, RESOURCES, recommendTechnique } from "@/lib/mock-data";
import { Clock, Video, FileText, Layers, Sparkles } from "lucide-react";

export const metadata = { title: "Techniques & Resources — StudyPilot AI" };

const RESOURCE_ICON = { video: Video, article: FileText, "practice-set": Layers, interactive: Sparkles };

export default function TechniquesPage() {
  const gaps = COURSES.filter((c) => c.hasMaterials)
    .flatMap((c) => c.concepts.filter((con) => con.state === "weak").map((con) => ({ course: c, concept: con })))
    .sort((a, b) => a.concept.mastery - b.concept.mastery);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Study Technique Recommender"
        title="Techniques & Resources"
        subtitle="Matched to your actual gaps, with a reason attached — not just the most popular technique."
      />

      {gaps.length === 0 ? (
        <Card className="p-8 text-center text-sm text-faint">
          No active gaps right now — take an assessment to surface where to focus next.
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          {gaps.map(({ course, concept }) => {
            const { technique, why } = recommendTechnique(concept.mastery, "medium");
            const resource = RESOURCES.find((r) => r.gapConceptId === concept.id);
            const Icon = resource ? RESOURCE_ICON[resource.type] : Sparkles;
            return (
              <Card key={concept.id} className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{concept.name}</span>
                    <MasteryBadge state={concept.state} />
                    <span className="text-xs text-faint">{course.code}</span>
                  </div>
                  <p className="max-w-xl text-sm text-body">
                    Try <strong>{technique.name}</strong> — {why}
                  </p>
                </div>
                {resource && (
                  <div className="flex shrink-0 items-center gap-3 rounded-[6px] border border-border bg-bg-warm p-3 lg:w-[280px]">
                    <Icon className="size-5 shrink-0 text-terracotta" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold leading-snug">{resource.title}</span>
                      <span className="flex items-center gap-1 text-[11px] text-faint">
                        <Clock className="size-3" /> {resource.durationMinutes} min · {resource.why}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-faint">All Techniques</span>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TECHNIQUES.map((t, i) => (
            <StickyNote key={t.id} tone={i % 2 === 0 ? "gold" : "terracotta"} rotate={i % 3 === 0 ? "-rotate-1" : i % 3 === 1 ? "rotate-1" : "-rotate-2"}>
              <p className="mb-1.5 text-lg font-bold not-italic">{t.name}</p>
              <p className="text-sm leading-snug">{t.blurb}</p>
            </StickyNote>
          ))}
        </div>
      </div>
    </div>
  );
}
