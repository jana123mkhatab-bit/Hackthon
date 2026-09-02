import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { AccentCard, Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { Chip } from "@/components/ui/chip";
import { COURSES, getProfessorFocus } from "@/lib/mock-data";

export default async function ProfessorFocusPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) notFound();

  const focus = getProfessorFocus(courseId);

  return (
    <div className="flex flex-col gap-6 pt-2">
      <AccentCard accent="terracotta" className="p-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-terracotta">
          <Sparkles className="size-3.5" /> Signature feature
        </div>
        <h2 className="mb-2 font-serif-display text-2xl">What does {course.professor} want you to learn?</h2>
        <p className="max-w-2xl text-sm text-body">
          This is a pattern read from what you&rsquo;ve uploaded — how often a concept recurs across
          lectures and past assessments — not a claim about what&rsquo;s inside your professor&rsquo;s
          head. Treat higher stars as &ldquo;shows up a lot,&rdquo; not &ldquo;guaranteed on the exam.&rdquo;
        </p>
      </AccentCard>

      {focus.length === 0 ? (
        <Card className="p-8 text-center text-sm text-faint">
          No material uploaded for {course.code} yet — head to Overview to upload a lecture first.
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {focus.map((item, i) => (
            <Card key={item.conceptId} className="flex flex-col gap-3 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-serif-display text-3xl text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif-display text-xl">{item.conceptName}</span>
                </div>
                <StarRating value={item.stars} />
              </div>
              <div className="flex flex-wrap gap-2">
                {item.evidence.map((e) => (
                  <Chip key={e}>{e}</Chip>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-body">{item.rationale}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
