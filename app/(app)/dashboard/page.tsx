import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  RecommendedNextAction,
  StatsRow,
  WeeklyPlan,
  CourseProgressList,
  UpcomingExams,
  KnowledgeGapsSummary,
  RecentAssessmentsList,
  AIRecommendationCard,
  QuickActions,
  type RecommendedFocus,
} from "@/components/dashboard/dashboard-widgets";
import { requireStudentId } from "@/lib/server-session";
import { getCoursesForStudent } from "@/lib/server-course";
import { getRecentAssessmentsForStudent } from "@/lib/assessment-mapper";
import { toStudySessions } from "@/lib/study-plan-mapper";
import { getCollection } from "@/lib/db";
import type { Student } from "@/lib/models/student";
import { defaultStats } from "@/lib/models/student";
import type { StudyPlanDoc } from "@/lib/models";

export const metadata = { title: "Dashboard — StudyPilot AI" };

function pickRecommendedFocus(courses: Awaited<ReturnType<typeof getCoursesForStudent>>): RecommendedFocus | null {
  const candidates = courses
    .filter((c) => c.hasMaterials)
    .flatMap((course) => course.concepts.filter((con) => con.state === "weak").map((concept) => ({ course, concept })))
    .sort((a, b) => a.concept.mastery - b.concept.mastery);
  const top = candidates[0];
  if (!top) return null;
  return {
    course: top.course,
    conceptName: top.concept.name,
    minutes: 30,
    reason: `Your mastery on ${top.concept.name} is at ${top.concept.mastery}% — the lowest signal across your uploaded material right now.`,
  };
}

export default async function DashboardPage() {
  const studentId = await requireStudentId();

  const students = await getCollection<Student>("students");
  const [student, courses, recentAssessments, studyPlans] = await Promise.all([
    students?.findOne({ _id: studentId }),
    getCoursesForStudent(studentId),
    getRecentAssessmentsForStudent(studentId, 5),
    getCollection<StudyPlanDoc>("studyPlans"),
  ]);

  const latestPlan = await studyPlans?.find({ studentId }).sort({ createdAt: -1 }).limit(1).next();
  const sessions = latestPlan ? toStudySessions(latestPlan.sessions) : [];
  const stats = student?.stats ?? defaultStats();
  const focus = pickRecommendedFocus(courses);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        eyebrow="Dashboard"
        title={`Good to see you, ${student?.firstName ?? "there"}.`}
        subtitle="Here's what actually matters across your courses right now."
        actions={
          <Button href="/courses" variant="secondary" className="normal-case font-semibold">
            Upload New Material
          </Button>
        }
      />

      <RecommendedNextAction focus={focus} />
      <StatsRow
        courses={courses}
        streakDays={stats.streakDays}
        focusMinutesThisWeek={stats.focusMinutesThisWeek}
        weeklyGoalMinutes={stats.weeklyGoalMinutes}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <WeeklyPlan sessions={sessions} courses={courses} />
          <CourseProgressList courses={courses} />
        </div>
        <div className="flex flex-col gap-6">
          <UpcomingExams courses={courses} />
          <KnowledgeGapsSummary courses={courses} />
          <RecentAssessmentsList assessments={recentAssessments} courses={courses} />
          <AIRecommendationCard courses={courses} />
          <QuickActions courses={courses} />
        </div>
      </div>
    </div>
  );
}
