"use client";

import { useEffect, useRef, useState } from "react";
import { UploadCloud, Check, FileText, Loader2, Star } from "lucide-react";
import { AccentCard, Card, Panel } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ANALYSIS_STEPS, analyzeUploadedLecture } from "@/lib/ai-client";
import { cacheCourseMaterial } from "@/lib/course-material";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";

type AnalysisResult = Awaited<ReturnType<typeof analyzeUploadedLecture>>;

const ANALYSIS_KEY = "studypilot.analysis.";

export function LectureAnalyzer({ course }: { course: Course }) {
  const [phase, setPhase] = useState<"idle" | "analyzing" | "done">("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadSavedMaterial() {
      try {
        const response = await fetch(`/api/materials?courseId=${encodeURIComponent(course.id)}`);
        const payload = (await response.json()) as {
          material?: { file_name?: string; extracted_text?: string; analysis?: AnalysisResult | null } | null;
        };
        if (!cancelled && payload.material?.extracted_text) {
          setFileName(payload.material.file_name ?? "Uploaded material");
          if (payload.material.analysis) {
            setResult({ ...payload.material.analysis, material: payload.material.extracted_text });
            setPhase("done");
          }
        }
      } catch {
        // Local fallback below remains available when the database is absent.
      }
      try {
        const saved = window.localStorage.getItem(`${ANALYSIS_KEY}${course.id}`);
        if (saved) {
          const parsed = JSON.parse(saved) as AnalysisResult;
          if (!cancelled && parsed.courseId === course.id && typeof parsed.material === "string") {
            setResult(parsed);
            setFileName(parsed.fileName);
            setPhase("done");
          }
        }
      } catch {
        // Local storage is best effort; an upload can still proceed.
      }
    }
    void loadSavedMaterial();
    return () => { cancelled = true; };
  }, [course.id]);

  async function startAnalysis(file: File) {
    setFileName(file.name);
    setPhase("analyzing");
    setStepIndex(0);
    setError(null);

    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, ANALYSIS_STEPS.length - 1));
    }, 480);

    try {
      const res = await analyzeUploadedLecture(course.id, file, course);
      clearInterval(stepTimer);
      setStepIndex(ANALYSIS_STEPS.length - 1);
      setResult(res);
      // The analyze endpoint persists both the extracted text and its analysis.
      // Keep only an offline cache here to avoid inserting duplicate materials.
      cacheCourseMaterial(course.id, res.material);
      window.localStorage.setItem(`${ANALYSIS_KEY}${course.id}`, JSON.stringify(res));
      setTimeout(() => setPhase("done"), 350);
    } catch (caught) {
      clearInterval(stepTimer);
      setPhase("idle");
      setError(caught instanceof Error ? caught.message : "Unable to analyze this file.");
    }
  }

  if (phase === "idle") {
    return (
      <Card
        className="flex cursor-pointer flex-col items-center gap-3 border-dashed p-10 text-center transition-colors hover:border-terracotta"
        onClick={() => fileInput.current?.click()}
      >
        <input
          ref={fileInput}
          type="file"
          className="hidden"
          accept=".txt,.md,.csv,.json,.rtf,.xml,.html,.pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void startAnalysis(f);
          }}
        />
        <UploadCloud className="size-8 text-terracotta" strokeWidth={1.75} />
        <p className="font-serif-display text-xl">Upload your first lecture for {course.code}</p>
        <p className="max-w-sm text-sm text-body">
          Upload text, notes, or a text-based PDF/DOCX/PPTX. StudyPilot extracts the readable
          material and builds objectives, concepts, assessment patterns, and dependencies.
        </p>
        {error && <p className="max-w-sm text-sm text-terracotta">{error}</p>}
        <Button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInput.current?.click();
          }}
        >
          Upload Material
        </Button>
      </Card>
    );
  }

  if (phase === "analyzing") {
    return (
      <Card className="flex flex-col gap-5 p-8">
        <div className="flex items-center gap-3">
          <FileText className="size-5 text-terracotta" />
          <span className="text-sm font-semibold">{fileName}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {ANALYSIS_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2.5 text-sm">
              {i < stepIndex ? (
                <Check className="size-4 shrink-0 text-sage" strokeWidth={2.5} />
              ) : i === stepIndex ? (
                <Loader2 className="size-4 shrink-0 animate-spin text-terracotta" />
              ) : (
                <span className="size-4 shrink-0 rounded-full border border-border" />
              )}
              <span className={cn(i <= stepIndex ? "text-ink" : "text-faint")}>{step.label}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!result) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-faint">
          <Check className="size-4 text-sage" /> Analyzed from your uploaded material
        </span>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="text-xs font-semibold text-terracotta"
        >
          Upload another lecture
        </button>
        <input
          ref={fileInput}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void startAnalysis(f);
          }}
          accept=".txt,.md,.csv,.json,.rtf,.xml,.html,.pdf"
        />
      </div>

      <AccentCard accent="gold" className="p-6">
        <h3 className="mb-4 font-serif-display text-xl">Learning Objectives</h3>
        <ol className="flex flex-col gap-2.5">
          {result.learningObjectives.map((obj, i) => (
            <li key={obj} className="flex items-start gap-3 text-sm text-body">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold-bg text-[11px] font-bold text-[#8a6a1a]">
                {i + 1}
              </span>
              {obj}
            </li>
          ))}
        </ol>
      </AccentCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 font-serif-display text-lg">Important Concepts</h3>
          <div className="flex flex-col gap-3">
            {result.importantConcepts.map((c) => (
              <div key={c.name} className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{c.name}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn("size-3.5", i < c.importance ? "fill-terracotta text-terracotta" : "text-border")}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-serif-display text-lg">Assessment Patterns</h3>
          <ul className="flex flex-col gap-3">
            {result.assessmentPatterns.map((p) => (
              <li key={p} className="border-l-2 border-gold-border pl-3 text-sm text-body">
                {p}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {result.dependencies.length > 0 && (
        <Panel className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-faint">Knowledge Dependencies</span>
          <div className="flex flex-col gap-2">
            {result.dependencies.map((d) => (
              <div key={d.concept} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-[4px] bg-paper px-2.5 py-1 font-semibold">{d.concept}</span>
                <span className="text-faint">requires</span>
                {d.requires.map((r) => (
                  <span key={r} className="rounded-[4px] border border-border bg-paper px-2.5 py-1 text-xs">
                    {r}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
