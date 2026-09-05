import { PageHeader } from "@/components/app/page-header";
import { KnowledgeDnaView } from "@/components/course/knowledge-dna-view";
import { requireStudentId } from "@/lib/server-session";
import { getCoursesForStudent } from "@/lib/server-course";

export const metadata = { title: "Knowledge DNA — StudyPilot AI" };

export default async function KnowledgePage() {
  const studentId = await requireStudentId();
  const courses = await getCoursesForStudent(studentId);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        eyebrow="Knowledge DNA"
        title="Your personal knowledge map."
        subtitle="Every concept you've been assessed on, across every course, in one place."
      />
      <KnowledgeDnaView courses={courses} />
    </div>
  );
}
