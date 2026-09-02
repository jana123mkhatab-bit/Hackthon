"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, CalendarClock, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, AccentCard } from "@/components/ui/card";
import { ChipButton } from "@/components/ui/chip";
import { CalendarConnect } from "@/components/plan/calendar-connect";
import { COURSES, STUDY_PLAN } from "@/lib/mock-data";
import { generatePlan, daysUntil } from "@/lib/scheduling-engine";
import { useAccessibility } from "@/lib/accessibility-context";
import { loadOnboarding, saveOnboarding, type OnboardingData } from "@/lib/onboarding-store";
import { cn } from "@/lib/utils";
import type { StudySession } from "@/lib/types";

export default function PlanPage() {
  const acc = useAccessibility();
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [plan, setPlan] = useState<StudySession[]>(STUDY_PLAN);
  const [generating, setGenerating] = useState(false);

  // read localStorage after mount to avoid an SSR/client hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOnboarding(loadOnboarding());
    void fetch("/api/study-plans")
      .then((response) => response.json())
      .then((payload: { plans?: { sessions?: StudySession[] }[] }) => {
        const saved = payload.plans?.[0]?.sessions;
        if (Array.isArray(saved) && saved.length) setPlan(saved);
      })
      .catch(() => undefined);
  }, []);

  const activeCourses = useMemo(
    () => COURSES.filter((c) => c.hasMaterials && (!onboarding || onboarding.selectedCourseIds.includes(c.id))),
    [onboarding]
  );

  const examCourses = activeCourses.filter((c) => c.examDate);

  function setMode(mode: "exam" | "normal") {
    if (!onboarding) return;
    const next = { ...onboarding, mode };
    setOnboarding(next);
    saveOnboarding(next);
  }

  function regenerate() {
    setGenerating(true);
    const settings = acc.studySettings();
    const courses = onboarding?.mode === "normal" ? activeCourses.map((c) => ({ ...c, examDate: undefined })) : activeCourses;
    setTimeout(() => {
      const generated = generatePlan({
        courses,
        availableHoursPerWeek: onboarding?.weeklyHours ?? 8,
        sessionMinutes: settings.sessionMinutes,
        breaksEvery: settings.breaksEvery,
      });
      setPlan(generated.length ? generated : STUDY_PLAN);
      void fetch("/api/study-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: onboarding?.mode === "normal" ? "normal" : "exam",
          preferences: { weeklyHours: onboarding?.weeklyHours ?? 8, sessionMinutes: settings.sessionMinutes },
          sessions: generated,
        }),
      }).catch(() => undefined);
      setGenerating(false);
    }, 500);
  }

  const byDay = plan.reduce<Record<string, StudySession[]>>((acc2, s) => {
    (acc2[s.day] ??= []).push(s);
    return acc2;
  }, {});

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Adaptive Scheduling"
        title="Study Plan"
        subtitle="Built from your weak concepts, your available hours, and how you study best — not a generic calendar block."
        actions={
          <Button onClick={regenerate} variant="secondary" className="normal-case font-semibold">
            <RefreshCw className={cn("size-4", generating && "animate-spin")} /> Regenerate Plan
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <ChipButton active={onboarding?.mode !== "normal"} onClick={() => setMode("exam")}>
            Exam Mode
          </ChipButton>
          <ChipButton active={onboarding?.mode === "normal"} onClick={() => setMode("normal")}>
            Normal Study Mode
          </ChipButton>
        </div>
        {onboarding && (
          <span className="text-xs text-faint">
            {onboarding.weeklyHours} hrs/week across {onboarding.preferredDays.length} days · sessions
            tuned to {acc.studySettings().sessionMinutes} min
            {acc.hasMode("adhd") && " (ADHD Focus)"}
          </span>
        )}
      </div>

      {onboarding?.mode !== "normal" && examCourses.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {examCourses.map((c) => (
            <AccentCard key={c.id} accent="gold" className="p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-faint">
                <CalendarClock className="size-3.5" /> {c.code}
              </div>
              <p className="mt-1 font-serif-display text-2xl">{daysUntil(c.examDate)} days</p>
              <p className="text-sm text-body">{c.name}</p>
            </AccentCard>
          ))}
        </div>
      )}

      <CalendarConnect sessionCount={plan.length} />

      {onboarding?.mode === "normal" && (
        <Card className="flex items-start gap-3 p-5">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-sage" />
          <p className="text-sm text-body">
            Normal Study Mode — building a steady roadmap across your courses based on where your
            gaps are, without a deadline countdown.
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-5">
        {Object.entries(byDay).map(([day, sessions]) => (
          <Card key={day} className="p-5 sm:p-6">
            <span className="mb-3 block text-[11px] font-bold uppercase tracking-wide text-faint">{day}</span>
            <div className="flex flex-col gap-2">
              {sessions.map((s) => {
                const course = COURSES.find((c) => c.id === s.courseId);
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-2 rounded-[4px] border px-3 py-2.5 text-sm",
                      s.kind === "break" ? "border-dashed border-border text-faint" : "border-border bg-bg-warm/60"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="w-[68px] shrink-0 text-xs text-faint">{s.time}</span>
                      <span className="min-w-0 truncate font-medium">
                        {s.conceptName}
                        {course && <span className="ml-1.5 text-xs font-normal text-faint">· {course.code}</span>}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-faint">{s.minutes}m</span>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
