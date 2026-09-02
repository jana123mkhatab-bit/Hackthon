import { notFound } from "next/navigation";
import { COURSES } from "@/lib/mock-data";
import { LectureAnalyzer } from "@/components/course/lecture-analyzer";

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) notFound();

  return (
    <div className="pt-2">
      <LectureAnalyzer course={course} />
    </div>
  );
}
