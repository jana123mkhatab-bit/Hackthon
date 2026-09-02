import { notFound } from "next/navigation";
import { COURSES, getAssessmentQuestions } from "@/lib/mock-data";
import { AssessmentRunner } from "@/components/course/assessment-runner";

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) notFound();

  const questions = getAssessmentQuestions(courseId);

  return (
    <div className="max-w-2xl pt-2">
      <AssessmentRunner course={course} questions={questions} />
    </div>
  );
}
