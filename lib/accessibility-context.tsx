"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * The Accessibility & Adaptive Learning Engine.
 *
 * This is intentionally NOT a diagnosis. Every field here is a stated
 * preference the student picked ("I prefer step-by-step explanations"),
 * never a medical label. The engine's job is to translate those
 * preferences into real interface and content changes app-wide:
 *
 *  - toggles here set data-* attributes on <html>, which globals.css
 *    reads to change typography, density, motion, and contrast
 *    everywhere in the app (not just on a settings page)
 *  - `explanationSettings()` below is sent to the server-side AI tutor
 *    to change explanation length, sentence
 *    complexity, and structure
 *  - `studySettings()` is consulted by the scheduling engine
 *    (lib/scheduling-engine.ts) to change session length and break
 *    cadence
 */

export type LearningPreference =
  | "text"
  | "audio"
  | "text-audio"
  | "simplified"
  | "step-by-step"
  | "visual"
  | "examples-first"
  | "short-sessions"
  | "frequent-quizzes"
  | "active-recall"
  | "practice-heavy";

export type AccessibilityPreference =
  | "larger-text"
  | "high-contrast"
  | "reduced-clutter"
  | "text-to-speech"
  | "speech-to-text"
  | "captions"
  | "keyboard-nav"
  | "downloadable"
  | "low-connectivity";

export type SupportMode = "dyslexia" | "adhd";

export type Language = "en" | "ar" | "both";

export interface AccessibilityState {
  learningPreferences: LearningPreference[];
  accessibilityPreferences: AccessibilityPreference[];
  supportModes: SupportMode[];
  language: Language;
  reducedMotion: boolean;
  onboarded: boolean;
}

const DEFAULT_STATE: AccessibilityState = {
  learningPreferences: [],
  accessibilityPreferences: [],
  supportModes: [],
  language: "en",
  reducedMotion: false,
  onboarded: false,
};

const STORAGE_KEY = "studypilot.accessibility.v1";

interface AccessibilityContextValue {
  state: AccessibilityState;
  toggleLearningPreference: (p: LearningPreference) => void;
  toggleAccessibilityPreference: (p: AccessibilityPreference) => void;
  toggleSupportMode: (m: SupportMode) => void;
  setLanguage: (l: Language) => void;
  setReducedMotion: (v: boolean) => void;
  setState: (s: AccessibilityState) => void;
  has: (p: AccessibilityPreference) => boolean;
  hasLearning: (p: LearningPreference) => boolean;
  hasMode: (m: SupportMode) => boolean;
  /** Sent to the server-side AI tutor to shape explanation text. */
  explanationSettings: () => {
    length: "brief" | "standard" | "detailed";
    stepByStep: boolean;
    simplifiedVocabulary: boolean;
    examplesFirst: boolean;
    chunked: boolean;
  };
  /** Consulted by the scheduling engine to shape session structure. */
  studySettings: () => {
    sessionMinutes: number;
    breaksEvery: number;
    singleTaskView: boolean;
  };
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null
);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<AccessibilityState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  // hydrate from localStorage once on mount — localStorage is unavailable
  // during SSR, so this can only run client-side, after mount.
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      let next = DEFAULT_STATE;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) next = { ...next, ...JSON.parse(raw) };
      } catch {
        // ignore — best effort only
      }
      try {
        const response = await fetch("/api/preferences");
        const payload = (await response.json()) as { preferences?: { accessibility?: AccessibilityState } | null };
        if (payload.preferences?.accessibility) next = { ...next, ...payload.preferences.accessibility };
      } catch {
        // The local state is sufficient for offline/demo mode.
      }
      if (!cancelled) {
        setStateRaw(next);
        setHydrated(true);
      }
    }
    void hydrate();
    return () => { cancelled = true; };
  }, []);

  // persist + reflect onto <html data-*> whenever state changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // best effort only
    }
    void fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferences: { accessibility: state } }),
    }).catch(() => undefined);
    const root = document.documentElement;
    const has = (p: AccessibilityPreference) =>
      state.accessibilityPreferences.includes(p);

    root.setAttribute("data-larger-text", String(has("larger-text")));
    root.setAttribute("data-high-contrast", String(has("high-contrast")));
    root.setAttribute("data-reduced-density", String(has("reduced-clutter")));
    root.setAttribute("data-low-connectivity", String(has("low-connectivity")));
    root.setAttribute(
      "data-adhd-mode",
      String(state.supportModes.includes("adhd"))
    );
    root.setAttribute(
      "data-dyslexia-mode",
      String(state.supportModes.includes("dyslexia"))
    );
    root.setAttribute("data-reduced-motion", String(state.reducedMotion));
    root.setAttribute("lang", state.language === "ar" ? "ar" : "en");
    root.setAttribute(
      "dir",
      state.language === "ar" ? "rtl" : "ltr"
    );
  }, [state, hydrated]);

  const setState = (s: AccessibilityState) => setStateRaw(s);

  const toggleLearningPreference = (p: LearningPreference) =>
    setStateRaw((prev) => ({
      ...prev,
      learningPreferences: prev.learningPreferences.includes(p)
        ? prev.learningPreferences.filter((x) => x !== p)
        : [...prev.learningPreferences, p],
    }));

  const toggleAccessibilityPreference = (p: AccessibilityPreference) =>
    setStateRaw((prev) => ({
      ...prev,
      accessibilityPreferences: prev.accessibilityPreferences.includes(p)
        ? prev.accessibilityPreferences.filter((x) => x !== p)
        : [...prev.accessibilityPreferences, p],
    }));

  const toggleSupportMode = (m: SupportMode) =>
    setStateRaw((prev) => ({
      ...prev,
      supportModes: prev.supportModes.includes(m)
        ? prev.supportModes.filter((x) => x !== m)
        : [...prev.supportModes, m],
    }));

  const setLanguage = (l: Language) =>
    setStateRaw((prev) => ({ ...prev, language: l }));

  const setReducedMotion = (v: boolean) =>
    setStateRaw((prev) => ({ ...prev, reducedMotion: v }));

  const value = useMemo<AccessibilityContextValue>(() => {
    const has = (p: AccessibilityPreference) =>
      state.accessibilityPreferences.includes(p);
    const hasLearning = (p: LearningPreference) =>
      state.learningPreferences.includes(p);
    const hasMode = (m: SupportMode) => state.supportModes.includes(m);

    return {
      state,
      toggleLearningPreference,
      toggleAccessibilityPreference,
      toggleSupportMode,
      setLanguage,
      setReducedMotion,
      setState,
      has,
      hasLearning,
      hasMode,
      explanationSettings: () => ({
        length: hasMode("dyslexia")
          ? "brief"
          : hasLearning("simplified")
          ? "brief"
          : "standard",
        stepByStep: hasMode("dyslexia") || hasLearning("step-by-step"),
        simplifiedVocabulary: hasLearning("simplified") || hasMode("dyslexia"),
        examplesFirst: hasLearning("examples-first"),
        chunked: hasMode("dyslexia") || has("reduced-clutter"),
      }),
      studySettings: () => ({
        sessionMinutes: hasMode("adhd") || hasLearning("short-sessions") ? 15 : 25,
        breaksEvery: hasMode("adhd") ? 15 : 45,
        singleTaskView: hasMode("adhd"),
      }),
    };
  }, [state]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx)
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  return ctx;
}
