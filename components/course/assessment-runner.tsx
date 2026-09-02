"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { AccentCard, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MasteryBadge } from "@/components/ui/mastery-badge";
import { gradeAssessment } from "@/lib/ai-mock";
import { adaptPlanAfterAssessment } from "@/lib/scheduling-engine";
import { STUDY_PLAN } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { AssessmentQuestion, Course } from "@/lib/types";

type Phase = "intro" | "question" | "grading" | "results";

const TYPE_LABEL: Record<string, string> = {
  "multiple-choice": "Multiple Choice",
  "true-false": "True / False",
  "short-answer": "Short Answer",
  conceptual: "Conceptual",
  "problem-solving": "Problem Solving",
  scenario: "Scenario-Based",
};

type GradeResult = Awaited<ReturnType<typeof gradeAssessment>>;

export function AssessmentRunner({
  course,
  questions,
}: {
  course: Course;
  questions: AssessmentQuestion[];
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<GradeResult | null>(null);
  const [adaptMessage, setAdaptMessage] = useState<string | null>(null);

  const current = questions[index];

  function selectAnswer(choiceIndex: number) {
    setAnswers((a) => ({ ...a, [current.id]: choiceIndex }));
  }

  function next() {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
    } else {
      finish();
    }
  }

  async function finish() {
    setPhase("grading");
    const res = await gradeAssessment(course.id, questions, answers);
    setResult(res);
    if (res.scorePct < 70 && res.gaps[0]) {
      const { message } = adaptPlanAfterAssessment(STUDY_PLAN, course.id, res.gaps[0], 30);
      setAdaptMessage(message);
    }
    setPhase("results");
  }

  function restart() {
    setPhase("intro");
    setIndex(0);
    setAnswers({});
    setResult(null);
    setAdaptMessage(null);
  }

  if (questions.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-faint">
        Upload material for {course.code} on the Overview tab first — assessments are generated
        from what you&rsquo;ve actually studied.
      </Card>
    );
  }

  if (phase === "intro") {
    return (
      <AccentCard accent="terracotta" className="p-8 text-center">
        <Sparkles className="mx-auto mb-3 size-6 text-terracotta" />
        <h2 className="mb-2 font-serif-display text-2xl">AI Assessment — {course.code}</h2>
        <p className="mx-auto mb-6 max-w-md text-sm text-body">
          {questions.length} questions grounded in what you&rsquo;ve uploaded, mixing question
          types and difficulty. Your results update your knowledge map and adjust your study plan
          automatically.
        </p>
        <Button size="lg" onClick={() => setPhase("question")}>
          Start Assessment <ArrowRight className="size-4" />
        </Button>
      </AccentCard>
    );
  }

  if (phase === "grading") {
    return (
      <Card className="flex flex-col items-center gap-3 p-12 text-center">
        <Loader2 className="size-6 animate-spin text-terracotta" />
        <p className="text-sm text-body">Grading and comparing against your knowledge map...</p>
      </Card>
    );
  }

  if (phase === "results" && result) {
    return (
      <div className="flex flex-col gap-6">
        <AccentCard accent={result.scorePct >= 70 ? "sage" : "terracotta"} className="p-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wide text-faint">Your Score</span>
          <p
            className={cn(
              "font-serif-display text-6xl",
              result.scorePct >= 70 ? "text-sage" : "text-terracotta"
            )}
          >
            {result.scorePct}%
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm text-body">{result.aiExplanation}</p>
        </AccentCard>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-faint">Strengths</h3>
            <div className="flex flex-col gap-2">
              {result.strengths.length === 0 && <span className="text-sm text-faint">None yet — that&rsquo;s okay.</span>}
              {result.strengths.map((s) => (
                <div key={s} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{s}</span>
                  <MasteryBadge state="strong" />
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-faint">Gaps found</h3>
            <div className="flex flex-col gap-2">
              {result.gaps.length === 0 && <span className="text-sm text-faint">No gaps surfaced this time.</span>}
              {result.gaps.map((g) => (
                <div key={g} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{g}</span>
                  <MasteryBadge state="weak" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {adaptMessage && (
          <Card className="flex items-start gap-3 border-gold-border bg-gold-bg p-4">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-[#8a6a1a]" />
            <p className="text-sm text-[#5c4711]">{adaptMessage}</p>
          </Card>
        )}

        <div className="flex flex-wrap gap-3">
          <Button href={`/courses/${course.id}/exam-analysis`}>
            View Exam Analysis <ArrowRight className="size-4" />
          </Button>
          <Button href={`/courses/${course.id}/knowledge-map`} variant="secondary" className="normal-case font-semibold">
            View Knowledge Map
          </Button>
          <Button href="/plan" variant="secondary" className="normal-case font-semibold">
            See Updated Study Plan
          </Button>
          <Button variant="ghost" onClick={restart} className="normal-case font-semibold">
            <RotateCcw className="size-3.5" /> Retake
          </Button>
        </div>
      </div>
    );
  }

  const selected = answers[current.id];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-1.5">
        {questions.map((q, i) => (
          <span
            key={q.id}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < index ? "bg-sage" : i === index ? "bg-terracotta" : "bg-border"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.22 }}
        >
          <Card className="p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-[4px] bg-terracotta-tint px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-terracotta">
                {TYPE_LABEL[current.type]}
              </span>
              <span className="text-xs text-faint">
                Question {index + 1} of {questions.length} · {current.difficulty}
              </span>
            </div>
            <p className="mb-6 text-lg font-medium leading-snug">{current.prompt}</p>
            <div className="flex flex-col gap-2.5">
              {current.choices?.map((choice, i) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => selectAnswer(i)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-[6px] border px-4 py-3 text-left text-sm transition-colors",
                    selected === i
                      ? "border-terracotta bg-terracotta-tint font-semibold"
                      : "border-border hover:border-faint"
                  )}
                >
                  {choice}
                  {selected === i && <Check className="size-4 shrink-0 text-terracotta" strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-end">
        <Button onClick={next} disabled={selected === undefined}>
          {index < questions.length - 1 ? "Next Question" : "Submit Assessment"} <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
