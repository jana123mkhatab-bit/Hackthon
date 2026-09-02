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
} from "@/components/dashboard/dashboard-widgets";
import { STUDENT } from "@/lib/mock-data";

export const metadata = { title: "Dashboard — StudyPilot AI" };

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        eyebrow="Dashboard"
        title={`Good to see you, ${STUDENT.firstName}.`}
        subtitle="Here's what actually matters across your courses right now."
        actions={
          <Button href="/courses" variant="secondary" className="normal-case font-semibold">
            Upload New Material
          </Button>
        }
      />

      <RecommendedNextAction />
      <StatsRow />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <WeeklyPlan />
          <CourseProgressList />
        </div>
        <div className="flex flex-col gap-6">
          <UpcomingExams />
          <KnowledgeGapsSummary />
          <RecentAssessmentsList />
          <AIRecommendationCard />
        </div>
      </div>
    </div>
  );
}
