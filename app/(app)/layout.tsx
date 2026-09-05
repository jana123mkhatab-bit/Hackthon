import type { ReactNode } from "react";
import { Sidebar } from "@/components/app/sidebar";
import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { Topbar } from "@/components/app/topbar";
import { CommandPaletteProvider } from "@/components/app/command-palette-context";
import { getStudentId } from "@/lib/server-session";
import { getCoursesForStudent } from "@/lib/server-course";
import { getCollection } from "@/lib/db";
import type { Student } from "@/lib/models/student";
import { defaultStats } from "@/lib/models/student";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const studentId = await getStudentId();
  const students = studentId ? await getCollection<Student>("students") : null;
  const [student, courses] = await Promise.all([
    students?.findOne({ _id: studentId! }) ?? Promise.resolve(null),
    studentId ? getCoursesForStudent(studentId) : Promise.resolve([]),
  ]);
  const stats = student?.stats ?? defaultStats();

  return (
    <CommandPaletteProvider courses={courses}>
      <div className="flex min-h-screen bg-bg-warm">
        <Sidebar firstName={student?.firstName ?? "Student"} streakDays={stats.streakDays} courses={courses} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar firstName={student?.firstName ?? "Student"} streakDays={stats.streakDays} />
          <main className="flex-1 px-5 pb-28 pt-5 md:px-10 md:pt-8 lg:pb-12">
            <div className="mx-auto w-full max-w-[1160px]">{children}</div>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </CommandPaletteProvider>
  );
}
