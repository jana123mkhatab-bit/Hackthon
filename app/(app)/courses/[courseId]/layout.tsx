import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { COURSES } from "@/lib/mock-data";
import { daysUntil } from "@/lib/scheduling-engine";
import { CourseSubnav } from "@/components/course/course-subnav";

export default async function CourseLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) notFound();

  const days = daysUntil(course.examDate);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-wide text-faint">{course.code}</span>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif-display text-[28px] sm:text-[34px]">{course.name}</h1>
          {days !== null && (
            <span className="rounded-[4px] bg-gold-bg px-2.5 py-1 text-xs font-bold text-[#8a6a1a]">
              Exam in {days} days
            </span>
          )}
        </div>
        <span className="text-sm text-body">{course.professor}</span>
      </div>
      <CourseSubnav courseId={courseId} />
      {children}
    </div>
  );
}
