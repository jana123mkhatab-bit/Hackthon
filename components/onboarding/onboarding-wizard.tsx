"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccentCard, Panel } from "@/components/ui/card";
import { ChipButton } from "@/components/ui/chip";
import { AccessibilityPanel } from "@/components/settings/accessibility-panel";
import { COURSES, SUBJECT_CATEGORIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  loadOnboarding,
  saveOnboarding,
  type OnboardingData,
} from "@/lib/onboarding-store";
import { useAccessibility } from "@/lib/accessibility-context";

const STEPS = [
  "Welcome",
  "Courses",
  "Exams",
  "Study Time",
  "Accessibility",
] as const;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function OnboardingWizard() {
  const router = useRouter();
  const acc = useAccessibility();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(loadOnboarding());
  const [activeCategory, setActiveCategory] = useState<string>("Computer Science");
  const [customName, setCustomName] = useState("");

  useEffect(() => {
    saveOnboarding(data);
  }, [data]);

  const selectedCourses = useMemo(
    () => COURSES.filter((c) => data.selectedCourseIds.includes(c.id)),
    [data.selectedCourseIds]
  );

  const allSelectedForExams = [
    ...selectedCourses.map((c) => ({ id: c.id, name: `${c.code} — ${c.name}` })),
    ...data.customCourses.map((c) => ({ id: c.id, name: c.name })),
  ];

  function toggleCourse(id: string) {
    setData((d) => ({
      ...d,
      selectedCourseIds: d.selectedCourseIds.includes(id)
        ? d.selectedCourseIds.filter((x) => x !== id)
        : [...d.selectedCourseIds, id],
    }));
  }

  function addCustomCourse() {
    const name = customName.trim();
    if (!name) return;
    const id = `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
    setData((d) => ({
      ...d,
      customCourses: [...d.customCourses, { id, name, subject: activeCategory }],
    }));
    setCustomName("");
  }

  function toggleDay(day: string) {
    setData((d) => ({
      ...d,
      preferredDays: d.preferredDays.includes(day)
        ? d.preferredDays.filter((x) => x !== day)
        : [...d.preferredDays, day],
    }));
  }

  function finish() {
    const finalData: OnboardingData = { ...data, completed: true };
    saveOnboarding(finalData);
    acc.setState({ ...acc.state, onboarded: true });
    router.push("/dashboard");
  }

  const canContinue =
    step !== 1 || data.selectedCourseIds.length + data.customCourses.length > 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-[760px] flex-col gap-8 px-6 py-12 md:py-16">
      <div className="flex items-center gap-2 text-sm font-bold text-ink">
        <span className="font-serif-display text-xl">StudyPilot AI</span>
      </div>

      {/* progress rail */}
      <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={5}>
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full border text-[11px] font-bold transition-colors",
                i < step && "border-sage bg-sage text-paper",
                i === step && "border-terracotta bg-terracotta text-paper",
                i > step && "border-border bg-paper text-faint"
              )}
            >
              {i < step ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </div>
            <span
              className={cn(
                "hidden text-center text-[11px] font-semibold uppercase tracking-wide sm:block",
                i === step ? "text-ink" : "text-faint"
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1"
        >
          {step === 0 && <WelcomeStep />}
          {step === 1 && (
            <CoursesStep
              data={data}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              toggleCourse={toggleCourse}
              customName={customName}
              setCustomName={setCustomName}
              addCustomCourse={addCustomCourse}
              removeCustom={(id) =>
                setData((d) => ({ ...d, customCourses: d.customCourses.filter((c) => c.id !== id) }))
              }
            />
          )}
          {step === 2 && (
            <ExamsStep
              data={data}
              setData={setData}
              allSelectedForExams={allSelectedForExams}
            />
          )}
          {step === 3 && (
            <StudyTimeStep data={data} setData={setData} toggleDay={toggleDay} />
          )}
          {step === 4 && <AccessibilityStep />}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between border-t border-border pt-6">
        <div>
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="size-4" /> Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {step === 4 && (
            <Button variant="ghost" onClick={finish} className="normal-case font-semibold">
              Skip for now
            </Button>
          )}
          {step < 4 ? (
            <Button disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={finish}>
              Build My Study Plan <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function StepHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mb-8 flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-terracotta">{eyebrow}</span>
      <h1 className="font-serif-display text-[32px] leading-tight md:text-[38px]">{title}</h1>
      <p className="max-w-lg text-body">{subtitle}</p>
    </div>
  );
}

function WelcomeStep() {
  const items = [
    "Tell us what you're studying — any major, any course.",
    "Flag your upcoming exams, or skip and just build a roadmap.",
    "Tell us how much time you actually have each week.",
    "Optionally tune the interface to how you learn best.",
  ];
  return (
    <div className="flex flex-col gap-8">
      <StepHeading
        eyebrow="Gen AI Academic Copilot"
        title="Let's set up your copilot."
        subtitle="Four short steps, about two minutes. Everything here is editable later from Settings — nothing is permanent."
      />
      <AccentCard accent="gold" className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="size-4 text-terracotta" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-faint">
            What happens next
          </span>
        </div>
        <ol className="flex flex-col gap-3">
          {items.map((item, i) => (
            <li key={item} className="flex items-start gap-3 text-sm text-body">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-terracotta-tint text-[11px] font-bold text-terracotta">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </AccentCard>
    </div>
  );
}

function CoursesStep({
  data,
  activeCategory,
  setActiveCategory,
  toggleCourse,
  customName,
  setCustomName,
  addCustomCourse,
  removeCustom,
}: {
  data: OnboardingData;
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  toggleCourse: (id: string) => void;
  customName: string;
  setCustomName: (v: string) => void;
  addCustomCourse: () => void;
  removeCustom: (id: string) => void;
}) {
  const coursesInCategory = COURSES.filter((c) => c.subject === activeCategory);
  const totalSelected = data.selectedCourseIds.length + data.customCourses.length;

  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        eyebrow="Step 2 of 5"
        title="What are you studying?"
        subtitle="StudyPilot isn't built around one major — pick a field, then your specific courses. Add one we don't have yet at any time."
      />

      <div className="flex flex-wrap gap-2">
        {SUBJECT_CATEGORIES.map((cat) => (
          <ChipButton key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)}>
            {cat}
          </ChipButton>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {coursesInCategory.map((c) => {
          const active = data.selectedCourseIds.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCourse(c.id)}
              className={cn(
                "flex flex-col gap-1 rounded-[6px] border p-4 text-left transition-colors",
                active
                  ? "border-terracotta bg-terracotta-tint"
                  : "border-border bg-paper hover:border-faint"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-faint">{c.code}</span>
                {active && <Check className="size-4 text-terracotta" strokeWidth={2.5} />}
              </div>
              <span className="font-serif-display text-lg">{c.name}</span>
              <span className="text-xs text-body">{c.professor}</span>
            </button>
          );
        })}
        {coursesInCategory.length === 0 && (
          <p className="text-sm text-faint sm:col-span-2">
            No sample courses loaded for {activeCategory} yet — add your own below.
          </p>
        )}
      </div>

      <Panel className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-faint">
          Don&rsquo;t see your course?
        </span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCourse())}
            placeholder={`e.g. "${activeCategory} — Intro Seminar"`}
            className="w-full rounded-[4px] border border-border bg-paper px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          />
          <Button type="button" variant="secondary" onClick={addCustomCourse} className="shrink-0 normal-case font-semibold">
            <Plus className="size-4" /> Add course
          </Button>
        </div>
        {data.customCourses.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {data.customCourses.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-2 rounded-[4px] border border-border bg-paper px-2.5 py-1.5 text-xs"
              >
                {c.name}
                <button type="button" onClick={() => removeCustom(c.id)} className="text-faint hover:text-terracotta" aria-label={`Remove ${c.name}`}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </Panel>

      <p className="text-sm text-faint">
        {totalSelected === 0 ? "Select at least one course to continue." : `${totalSelected} course${totalSelected === 1 ? "" : "s"} selected.`}
      </p>
    </div>
  );
}

function ExamsStep({
  data,
  setData,
  allSelectedForExams,
}: {
  data: OnboardingData;
  setData: (fn: (d: OnboardingData) => OnboardingData) => void;
  allSelectedForExams: { id: string; name: string }[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        eyebrow="Step 3 of 5"
        title="Are you prepping for an exam?"
        subtitle="Exam Mode builds a countdown plan around real dates. Normal Study Mode builds a steady roadmap with no deadline pressure."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(["exam", "normal"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setData((d) => ({ ...d, mode: m }))}
            className={cn(
              "flex flex-col gap-1.5 rounded-[6px] border p-5 text-left transition-colors",
              data.mode === m ? "border-terracotta bg-terracotta-tint" : "border-border bg-paper hover:border-faint"
            )}
          >
            <span className="font-serif-display text-xl">
              {m === "exam" ? "Exam Mode" : "Normal Study Mode"}
            </span>
            <span className="text-sm text-body">
              {m === "exam"
                ? "Adaptive countdown plan for one or more specific exams."
                : "Ongoing roadmap that builds mastery without a fixed deadline."}
            </span>
          </button>
        ))}
      </div>

      {data.mode === "exam" && (
        <div className="flex flex-col gap-3">
          {allSelectedForExams.map((c) => (
            <div key={c.id} className="flex flex-col gap-2 rounded-[6px] border border-border bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-semibold">{c.name}</span>
              <input
                type="date"
                value={data.examDates[c.id]?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    examDates: { ...d.examDates, [c.id]: e.target.value },
                  }))
                }
                className="rounded-[4px] border border-border bg-paper px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
              />
            </div>
          ))}
          {allSelectedForExams.length === 0 && (
            <p className="text-sm text-faint">No courses selected yet — go back to add some.</p>
          )}
        </div>
      )}

      {data.mode === "normal" && (
        <Panel>
          <p className="text-sm text-body">
            No problem — StudyPilot will build a steady, gap-driven roadmap across your courses
            instead of a countdown. You can switch into Exam Mode for any course later once a
            date is announced.
          </p>
        </Panel>
      )}
    </div>
  );
}

function StudyTimeStep({
  data,
  setData,
  toggleDay,
}: {
  data: OnboardingData;
  setData: (fn: (d: OnboardingData) => OnboardingData) => void;
  toggleDay: (day: string) => void;
}) {
  const perDay = data.preferredDays.length
    ? Math.round((data.weeklyHours * 60) / data.preferredDays.length)
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <StepHeading
        eyebrow="Step 4 of 5"
        title="How much time do you actually have?"
        subtitle="Be realistic — your plan adapts to this, not the other way around."
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold">Weekly study hours</span>
          <span className="font-serif-display text-2xl text-terracotta">{data.weeklyHours} hrs</span>
        </div>
        <input
          type="range"
          min={2}
          max={30}
          value={data.weeklyHours}
          onChange={(e) => setData((d) => ({ ...d, weeklyHours: Number(e.target.value) }))}
          className="w-full accent-[#d46a43]"
        />
        <div className="flex justify-between text-xs text-faint">
          <span>2 hrs</span>
          <span>30 hrs</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold">Which days work?</span>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <ChipButton key={day} active={data.preferredDays.includes(day)} onClick={() => toggleDay(day)}>
              {day}
            </ChipButton>
          ))}
        </div>
      </div>

      <AccentCard accent="sage" className="p-5">
        <p className="text-sm text-body">
          That&rsquo;s roughly <span className="font-bold text-ink">{perDay} minutes</span> per
          session across {data.preferredDays.length || 0} day{data.preferredDays.length === 1 ? "" : "s"} a
          week — your plan will chunk that into focused sessions with breaks built in.
        </p>
      </AccentCard>
    </div>
  );
}

function AccessibilityStep() {
  return (
    <div className="flex flex-col gap-8">
      <StepHeading
        eyebrow="Step 5 of 5 — Optional"
        title="Tune how you learn best."
        subtitle="Completely optional, and nothing here requires a diagnosis — just pick what tends to help. You can change any of this later from Settings."
      />
      <AccessibilityPanel />
    </div>
  );
}
