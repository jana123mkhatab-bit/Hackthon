import { notFound } from "next/navigation";
import { requireStudentId } from "@/lib/server-session";
import { getCourseForStudent } from "@/lib/server-course";
import { KnowledgeMapView } from "@/components/course/knowledge-map-view";

export default async function KnowledgeMapPage({
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
      <KnowledgeMapView course={course} />
    </div>
  );
}
