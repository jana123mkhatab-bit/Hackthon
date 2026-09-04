import { notFound } from "next/navigation";
import { requireStudentId } from "@/lib/server-session";
import { getCourseForStudent } from "@/lib/server-course";
import { LectureAnalyzer } from "@/components/course/lecture-analyzer";

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const studentId = await requireStudentId();
  const course = await getCourseForStudent(studentId, courseId);
  if (!course) notFound();

  return (
    <div className="pt-2">
      <LectureAnalyzer course={course} />
    </div>
  );
}
