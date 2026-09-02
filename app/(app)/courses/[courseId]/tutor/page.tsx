import { notFound } from "next/navigation";
import { COURSES } from "@/lib/mock-data";
import { TutorChat } from "@/components/course/tutor-chat";

export default async function TutorPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) notFound();

  return (
    <div className="max-w-2xl pt-2">
      <TutorChat course={course} />
    </div>
  );
}
