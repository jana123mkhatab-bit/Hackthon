import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { SUBJECT_CATEGORIES } from "@/lib/mock-data";
import { requireStudentId } from "@/lib/server-session";
import { getCoursesForStudent } from "@/lib/server-course";
import { daysUntil } from "@/lib/scheduling-engine";
import { cn } from "@/lib/utils";

export const metadata = { title: "Courses — StudyPilot AI" };

export default async function CoursesPage() {
  const studentId = await requireStudentId();
  const courses = await getCoursesForStudent(studentId);

  if (courses.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          eyebrow="Your Academic Context"
          title="Courses"
          subtitle="Every course StudyPilot is grounded in — any major, any professor. Open one to upload material and see what it actually emphasizes."
        />
        <Card className="p-8 text-center text-sm text-faint">
          No courses yet — add one from onboarding or the dashboard to get started.
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Your Academic Context"
        title="Courses"
        subtitle="Every course StudyPilot is grounded in — any major, any professor. Open one to upload material and see what it actually emphasizes."
      />

      {SUBJECT_CATEGORIES.map((subject) => {
        const inSubject = courses.filter((c) => c.subject === subject);
        if (inSubject.length === 0) return null;
        return (
          <div key={subject} className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wide text-faint">{subject}</span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inSubject.map((c) => {
                const gaps = c.concepts.filter((con) => con.state === "weak").length;
                const days = daysUntil(c.examDate);
                return (
                  <Link key={c.id} href={`/courses/${c.id}`}>
                    <Card className="flex h-full flex-col gap-3 p-5 transition-colors hover:border-faint">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold uppercase tracking-wide text-faint">{c.code}</span>
                          <span className="font-serif-display text-xl">{c.name}</span>
                        </div>
                        {days !== null && (
                          <span className="shrink-0 rounded-[4px] bg-gold-bg px-2 py-1 text-[11px] font-bold text-[#8a6a1a]">
                            {days}d
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-faint">{c.professor}</span>
                      {c.hasMaterials ? (
                        <>
                          <ProgressBar value={c.progressPct} />
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-faint">{c.progressPct}% coverage</span>
                            {gaps > 0 && (
                              <span className={cn("font-bold text-[#a8402c]")}>
                                {gaps} gap{gaps === 1 ? "" : "s"}
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="rounded-[4px] border border-dashed border-border px-2.5 py-2 text-center text-[11px] font-semibold text-faint">
                          No material uploaded yet — open to add your first lecture
                        </span>
                      )}
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
