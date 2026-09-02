"use client";

import { Panel } from "@/components/ui/card";
import { ChipButton } from "@/components/ui/chip";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useAccessibility, type LearningPreference } from "@/lib/accessibility-context";

const LEARNING_PREFS: { id: LearningPreference; label: string }[] = [
  { id: "step-by-step", label: "Step-by-step explanations" },
  { id: "simplified", label: "Simpler language" },
  { id: "examples-first", label: "Examples before theory" },
  { id: "short-sessions", label: "Shorter study sessions" },
  { id: "frequent-quizzes", label: "Frequent low-stakes quizzes" },
  { id: "active-recall", label: "Active recall over re-reading" },
  { id: "practice-heavy", label: "Practice problems over notes" },
  { id: "visual", label: "Visual / diagram-first" },
];

/**
 * The live, shared adaptive-learning controls — used both in onboarding
 * step 5 and on the standalone Accessibility settings page. Every toggle
 * here writes straight into AccessibilityProvider, so it takes effect
 * app-wide immediately, from either place.
 */
export function AccessibilityPanel() {
  const acc = useAccessibility();

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(
          [
            {
              id: "dyslexia" as const,
              title: "Dyslexia-Friendly",
              blurb: "Wider spacing, shorter paragraphs, simpler sentences, and read-aloud support.",
            },
            {
              id: "adhd" as const,
              title: "ADHD Focus",
              blurb: "Shorter sessions, one task on screen at a time, and built-in breaks.",
            },
          ]
        ).map((mode) => {
          const active = acc.hasMode(mode.id);
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => acc.toggleSupportMode(mode.id)}
              className={cn(
                "flex flex-col gap-1.5 rounded-[6px] border p-5 text-left transition-colors",
                active ? "border-terracotta bg-terracotta-tint" : "border-border bg-paper hover:border-faint"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-serif-display text-xl">{mode.title}</span>
                <Switch id={`mode-${mode.id}`} checked={active} onChange={() => acc.toggleSupportMode(mode.id)} />
              </div>
              <span className="text-sm text-body">{mode.blurb}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-faint">Interface adjustments</span>
        <Panel className="flex flex-col divide-y divide-border !p-0">
          {(
            [
              { id: "larger-text" as const, label: "Larger text" },
              { id: "high-contrast" as const, label: "High contrast" },
              { id: "reduced-clutter" as const, label: "Reduced visual density" },
              { id: "text-to-speech" as const, label: "Text-to-speech available" },
              { id: "low-connectivity" as const, label: "Low-connectivity mode (downloadable, lighter pages)" },
            ]
          ).map((row) => (
            <div key={row.id} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm">{row.label}</span>
              <Switch id={row.id} checked={acc.has(row.id)} onChange={() => acc.toggleAccessibilityPreference(row.id)} />
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm">Reduced motion</span>
            <Switch id="reduced-motion" checked={acc.state.reducedMotion} onChange={(v) => acc.setReducedMotion(v)} />
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-faint">Learning preferences</span>
        <div className="flex flex-wrap gap-2">
          {LEARNING_PREFS.map((p) => (
            <ChipButton key={p.id} active={acc.hasLearning(p.id)} onClick={() => acc.toggleLearningPreference(p.id)}>
              {p.label}
            </ChipButton>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-faint">Language</span>
        <div className="flex flex-wrap gap-2">
          {([
            { id: "en" as const, label: "English" },
            { id: "ar" as const, label: "العربية" },
            { id: "both" as const, label: "English + العربية" },
          ]).map((lang) => (
            <ChipButton key={lang.id} active={acc.state.language === lang.id} onClick={() => acc.setLanguage(lang.id)}>
              {lang.label}
            </ChipButton>
          ))}
        </div>
      </div>

      <p className="rounded-[6px] border border-border bg-bg-warm p-4 text-xs leading-relaxed text-faint">
        StudyPilot AI does not diagnose, treat, or medically manage ADHD, dyslexia, or any other
        condition. Every option above is a learning preference you control — it adjusts your
        interface and study materials, nothing more.
      </p>
    </div>
  );
}
