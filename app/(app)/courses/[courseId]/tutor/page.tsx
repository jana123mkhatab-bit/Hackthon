import { notFound } from "next/navigation";
import { requireStudentId } from "@/lib/server-session";
import { getCourseForStudent } from "@/lib/server-course";
import { TutorChat } from "@/components/course/tutor-chat";

export default async function TutorPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const studentId = await requireStudentId();
  const course = await getCourseForStudent(studentId, courseId);
  if (!course) notFound();

  return (
    <div className="max-w-2xl pt-2">
      <TutorChat course={course} />
    </div>
  );
}
