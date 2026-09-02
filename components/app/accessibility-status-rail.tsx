"use client";

import { useAccessibility } from "@/lib/accessibility-context";

/**
 * A persistent, site-wide strip that appears whenever an accessibility
 * or support mode is active, so the effect is never invisible — the
 * student can always see (and undo) what's currently adapting the app.
 */
export function AccessibilityStatusRail() {
  const { state } = useAccessibility();

  const active: string[] = [];
  if (state.accessibilityPreferences.includes("larger-text")) active.push("Larger text");
  if (state.accessibilityPreferences.includes("high-contrast")) active.push("High contrast");
  if (state.accessibilityPreferences.includes("reduced-clutter")) active.push("Reduced density");
  if (state.accessibilityPreferences.includes("low-connectivity")) active.push("Low connectivity");
  if (state.reducedMotion) active.push("Reduced motion");
  if (state.supportModes.includes("adhd")) active.push("ADHD focus mode");
  if (state.supportModes.includes("dyslexia")) active.push("Dyslexia-friendly");
  if (state.language !== "en") active.push(state.language === "ar" ? "العربية" : "English + Arabic");

  if (active.length === 0) return null;

  return (
    <div className="sticky top-0 z-[200] flex flex-wrap items-center gap-x-4 gap-y-1 bg-[#1f2d3d] px-4 py-1.5 text-[11px] text-gold-border">
      {active.map((label) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-gold-border" />
          {label}
        </span>
      ))}
      <a href="/settings/accessibility" className="ml-auto underline decoration-dotted underline-offset-2">
        Adjust
      </a>
    </div>
  );
}
