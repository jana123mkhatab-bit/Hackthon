import { notFound } from "next/navigation";
import { COURSES, RECENT_ASSESSMENTS } from "@/lib/mock-data";
import { ExamAnalysisView } from "@/components/course/exam-analysis-view";

export default async function ExamAnalysisPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) notFound();

  const history = RECENT_ASSESSMENTS.filter((a) => a.courseId === courseId);

  return (
    <div className="pt-2">
      <ExamAnalysisView course={course} history={history} />
    </div>
  );
}
