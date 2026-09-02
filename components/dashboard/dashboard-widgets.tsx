"use client";

import Link from "next/link";
import {
  Flame,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { AccentCard, Card, StickyNote } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { MasteryBadge } from "@/components/ui/mastery-badge";
import {
  COURSES,
  STUDENT,
  STUDY_PLAN,
  RECENT_ASSESSMENTS,
  TODAYS_FOCUS,
  recommendTechnique,
  RESOURCES,
} from "@/lib/mock-data";
import { daysUntil } from "@/lib/scheduling-engine";
import { cn } from "@/lib/utils";

/* ---------------- Hero: recommended next action ---------------- */

export function RecommendedNextAction() {
  const course = COURSES.find((c) => c.id === TODAYS_FOCUS.courseId)!;
  return (
    <AccentCard accent="terracotta" className="p-6 md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-[4px] bg-terracotta-tint px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-terracotta">
            <Sparkles className="size-3" /> Recommended next
          </span>
          <h2 className="font-serif-display text-2xl md:text-[28px]">
            {TODAYS_FOCUS.minutes} min on {TODAYS_FOCUS.conceptName}
          </h2>
          <p className="max-w-xl text-sm text-body">{TODAYS_FOCUS.reason}</p>
          <span className="text-xs font-semibold text-faint">
            {course.code} — {course.name}
          </span>
        </div>
        <Button href={`/courses/${course.id}/assessment`} size="lg" className="shrink-0">
          Start Session <ArrowRight className="size-4" />
        </Button>
      </div>
    </AccentCard>
  );
}

/* ---------------- Stats row ---------------- */

export function StatsRow() {
  const overallProgress = Math.round(
    COURSES.filter((c) => c.hasMaterials).reduce((sum, c) => sum + c.progressPct, 0) /
      COURSES.filter((c) => c.hasMaterials).length
  );
  const gapCount = COURSES.flatMap((c) => c.concepts).filter((c) => c.state === "weak").length;
  const focusPct = Math.round((STUDENT.focusMinutesThisWeek / STUDENT.weeklyGoalMinutes) * 100);

  const stats = [
    { label: "Study Streak", value: `${STUDENT.streakDays} days`, icon: Flame, accent: "text-terracotta" },
    {
      label: "Focus Time This Week",
      value: `${STUDENT.focusMinutesThisWeek}m / ${STUDENT.weeklyGoalMinutes}m`,
      icon: Clock,
      accent: "text-sage",
      sub: `${focusPct}% of weekly goal`,
    },
    { label: "Overall Progress", value: `${overallProgress}%`, icon: TrendingUp, accent: "text-[#8a6a1a]" },
    { label: "Active Knowledge Gaps", value: `${gapCount}`, icon: AlertTriangle, accent: "text-[#a8402c]" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="flex flex-col gap-2 p-4 sm:p-5">
          <s.icon className={cn("size-4", s.accent)} strokeWidth={2.25} />
          <span className="font-serif-display text-xl sm:text-2xl">{s.value}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">{s.label}</span>
          {s.sub && <span className="text-[11px] text-faint">{s.sub}</span>}
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Today's / weekly plan ---------------- */

const TODAY_NAME = new Date().toLocaleDateString("en-US", { weekday: "long" });

export function WeeklyPlan() {
  const byDay = STUDY_PLAN.reduce<Record<string, typeof STUDY_PLAN>>((acc, s) => {
    (acc[s.day] ??= []).push(s);
    return acc;
  }, {});

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif-display text-xl">This Week&rsquo;s Study Plan</h3>
        <Link href="/plan" className="flex items-center gap-1 text-xs font-semibold text-terracotta">
          Full plan <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {Object.entries(byDay).map(([day, sessions]) => (
          <div key={day} className="flex flex-col gap-2">
            <span
              className={cn(
                "text-[11px] font-bold uppercase tracking-wide",
                day === TODAY_NAME ? "text-terracotta" : "text-faint"
              )}
            >
              {day} {day === TODAY_NAME && "· Today"}
            </span>
            <div className="flex flex-col gap-1.5">
              {sessions.map((s) => {
                const course = COURSES.find((c) => c.id === s.courseId);
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-[4px] border px-3 py-2 text-sm",
                      s.kind === "break" ? "border-dashed border-border text-faint" : "border-border bg-bg-warm/60"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="w-[64px] shrink-0 text-xs text-faint">{s.time}</span>
                      <span className="min-w-0 truncate font-medium">
                        {s.conceptName}
                        {course && s.kind !== "break" && (
                          <span className="ml-1.5 text-xs font-normal text-faint">· {course.code}</span>
                        )}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-faint">{s.minutes}m</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- Course progress ---------------- */

export function CourseProgressList() {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif-display text-xl">Your Courses</h3>
        <Link href="/courses" className="flex items-center gap-1 text-xs font-semibold text-terracotta">
          View all <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {COURSES.filter((c) => c.hasMaterials).map((c) => {
          const gaps = c.concepts.filter((con) => con.state === "weak").length;
          return (
            <Link
              key={c.id}
              href={`/courses/${c.id}`}
              className="flex flex-col gap-2 rounded-[6px] border border-border p-4 transition-colors hover:border-faint"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold">
                    {c.code} — {c.name}
                  </span>
                  <span className="text-xs text-faint">{c.professor}</span>
                </div>
                {gaps > 0 && (
                  <span className="shrink-0 rounded-[4px] bg-[rgba(193,80,62,0.14)] px-2 py-1 text-[11px] font-bold text-[#a8402c]">
                    {gaps} gap{gaps === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <ProgressBar value={c.progressPct} />
              <span className="text-[11px] text-faint">{c.progressPct}% syllabus coverage</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------------- Upcoming exams ---------------- */

export function UpcomingExams() {
  const withExams = COURSES.filter((c) => c.examDate)
    .map((c) => ({ course: c, days: daysUntil(c.examDate) }))
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0));

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock className="size-4 text-terracotta" />
        <h3 className="font-serif-display text-lg">Upcoming Exams</h3>
      </div>
      <div className="flex flex-col gap-3">
        {withExams.map(({ course, days }) => (
          <div key={course.id} className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold">{course.code}</span>
              <span className="truncate text-xs text-faint">{course.name}</span>
            </div>
            <span className="shrink-0 rounded-[4px] bg-gold-bg px-2 py-1 text-[11px] font-bold text-[#8a6a1a]">
              {days} day{days === 1 ? "" : "s"}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- Knowledge gaps summary ---------------- */

export function KnowledgeGapsSummary() {
  const gaps = COURSES.filter((c) => c.hasMaterials)
    .flatMap((c) => c.concepts.filter((con) => con.state === "weak").map((con) => ({ course: c, concept: con })))
    .sort((a, b) => a.concept.mastery - b.concept.mastery)
    .slice(0, 4);

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif-display text-lg">Knowledge Gaps</h3>
        {gaps[0] && (
          <Link href={`/courses/${gaps[0].course.id}/knowledge-map`} className="text-xs font-semibold text-terracotta">
            See map
          </Link>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {gaps.map(({ course, concept }) => (
          <div key={concept.id} className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{concept.name}</span>
              <span className="truncate text-xs text-faint">{course.code}</span>
            </div>
            <MasteryBadge state={concept.state} />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- Recent assessments ---------------- */

export function RecentAssessmentsList() {
  return (
    <Card className="p-5 sm:p-6">
      <h3 className="mb-4 font-serif-display text-lg">Recent Assessments</h3>
      <div className="flex flex-col gap-3">
        {RECENT_ASSESSMENTS.map((a) => {
          const course = COURSES.find((c) => c.id === a.courseId);
          return (
            <div key={a.id} className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{course?.code}</span>
                <span className="truncate text-xs text-faint">{a.gaps[0]}</span>
              </div>
              <span
                className={cn(
                  "shrink-0 font-serif-display text-lg",
                  a.scorePct >= 70 ? "text-sage" : "text-[#a8402c]"
                )}
              >
                {a.scorePct}%
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------------- AI recommendation ---------------- */

export function AIRecommendationCard() {
  const weakest = COURSES.flatMap((c) => c.concepts.filter((con) => con.state === "weak")).sort(
    (a, b) => a.mastery - b.mastery
  )[0];
  if (!weakest) return null;
  const { technique, why } = recommendTechnique(weakest.mastery, "medium");
  const resource = RESOURCES.find((r) => r.gapConceptId === weakest.id);

  return (
    <StickyNote tone="gold" rotate="rotate-0">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-terracotta">
        <BookOpen className="size-3.5" /> AI recommends
      </div>
      <p className="mb-2 text-base">
        Try <strong>{technique.name}</strong> for {weakest.name}.
      </p>
      <p className="mb-3 text-sm leading-snug">{why}</p>
      {resource && (
        <Link href="/techniques" className="text-sm font-semibold underline decoration-dotted underline-offset-2">
          {resource.title} ({resource.durationMinutes} min) →
        </Link>
      )}
    </StickyNote>
  );
}
