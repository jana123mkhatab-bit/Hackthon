import { notFound } from "next/navigation";
import { requireStudentId } from "@/lib/server-session";
import { getCourseForStudent } from "@/lib/server-course";
import { getAssessmentHistoryForCourse } from "@/lib/assessment-mapper";
import { ExamAnalysisView } from "@/components/course/exam-analysis-view";

export default async function ExamAnalysisPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const studentId = await requireStudentId();
  const course = await getCourseForStudent(studentId, courseId);
  if (!course) notFound();

  const history = await getAssessmentHistoryForCourse(studentId, courseId);

  return (
    <div className="pt-2">
      <ExamAnalysisView course={course} history={history} />
    </div>
  );
}
