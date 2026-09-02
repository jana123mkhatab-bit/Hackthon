import { notFound } from "next/navigation";
import { COURSES } from "@/lib/mock-data";
import { KnowledgeMapView } from "@/components/course/knowledge-map-view";

export default async function KnowledgeMapPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) notFound();

  return (
    <div className="pt-2">
      <KnowledgeMapView course={course} />
    </div>
  );
}
