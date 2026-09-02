# StudyPilot AI — Gen AI Academic Copilot

A subject-agnostic academic copilot: it reads what you upload (lectures, notes, past
assessments), figures out what your professor actually emphasizes, tests you on it, finds your
real knowledge gaps, and builds a study plan and interface around how you personally learn best.

This is a hackathon-grade prototype. The frontend, UX flows, accessibility engine, and
scheduling logic are fully real and interactive. The AI layer (`lib/ai-mock.ts`) and the Google
Calendar integration (`lib/calendar-mock.ts`) are clearly-labeled, realistic mocks — see
**What's real vs. mocked** below.

## Getting started

Requires Node.js 18.18+ (Node 20 LTS recommended).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The marketing site is the `/` route;
`/onboarding` starts the setup flow, and everything past that lives behind the app shell
(`/dashboard`, `/courses`, `/plan`, `/techniques`, `/settings/accessibility`).

For a production build:

```bash
npm run build
npm start
```

## Suggested demo flow

1. **Landing page** (`/`) — scroll through the interactive "Live Preview" widget (Professor
   Focus / Knowledge Map / Study Plan tabs) to show the product's core idea before logging in.
2. **Onboarding** (`/onboarding`) — pick subjects/courses across multiple majors (Computer
   Science, Engineering, Business, Medicine, Science, Humanities are all represented), set an
   exam vs. normal study mode, set weekly study hours, and optionally turn on accessibility /
   learning preferences (framed as preferences, never a diagnosis).
3. **Dashboard** (`/dashboard`) — the daily hub: recommended next action, streak, weekly plan,
   course progress, upcoming exams, knowledge gaps, recent assessments, an AI technique
   recommendation.
4. **A course with no material yet** (`/courses/signals`, `/courses/physiology`, or
   `/courses/political-phil`) — click **Upload Material** on the Overview tab to watch the
   analysis pipeline run (reading material → identifying concepts → mapping professor emphasis →
   building the knowledge map), then see the generated Learning Objectives, Important Concepts,
   Assessment Patterns, and Knowledge Dependencies — all derived from that course's own
   concepts, not hard-coded to one subject.
5. **Professor Focus** (`/courses/algorithms/professor-focus`) — the signature feature: a
   star-ranked, evidence-backed read on what a professor emphasizes, written in deliberately
   hedged language ("a pattern read from what you've uploaded," never a claim about intent).
6. **Take an assessment** (`/courses/algorithms/assessment`) — mixed question types
   (multiple-choice, true/false, conceptual, problem-solving, scenario-based), real scoring, and
   — if you score under 70% — a live message showing your study plan being adjusted in response.
7. **Knowledge Map** (`/courses/algorithms/knowledge-map` or `/courses/os/knowledge-map`) — a
   dependency-tiered visual of strong/practicing/weak concepts.
8. **Ask My Lecture** (`/courses/algorithms/tutor`) — a retrieval-grounded tutor chat that always
   cites what it's grounded in and never pretends to have independent knowledge of the course.
9. **Study Plan** (`/plan`) — switch between Exam Mode and Normal Study Mode, regenerate the
   plan (it's a real deterministic scheduler, not random), and connect the mock Google Calendar.
10. **Accessibility** (`/settings/accessibility`) — toggle Dyslexia-Friendly or ADHD Focus, or
    any individual preference, and watch the interface genuinely change app-wide (typography,
    density, motion, the status bar at the very top of every page) — not just a settings page
    that does nothing.

## What's real vs. mocked

**Real and fully interactive:**
- The entire UI, every page, every flow, all responsive breakpoints (375–1440px)
- The accessibility & adaptive-learning engine (`lib/accessibility-context.tsx`) — toggles set
  `data-*` attributes on `<html>` that `app/globals.css` reads to make real, app-wide interface
  changes (typography, contrast, density, motion, chunking)
- The scheduling engine (`lib/scheduling-engine.ts`) — deterministic plan generation and
  adaptive re-planning after a poor assessment result
- Assessment scoring, knowledge-gap detection, and technique recommendation logic
- Onboarding, course selection, and plan preferences (persisted to `localStorage`)

**Realistic mocks, clearly labeled in the UI and in code:**
- `lib/ai-mock.ts` — stands in for an LLM + embeddings + RAG pipeline. Every function is shaped
  the way a real implementation would be called (async, structured input/output, simulated
  latency) specifically so swapping in a real provider later is a body-only change — see the
  comment at the top of the file.
- `lib/calendar-mock.ts` — a mock Google Calendar connection. The UI explicitly labels every
  button and status message "(mock)" so it's never mistaken for a real integration.

## Project structure

```
app/                    Next.js App Router pages
  (app)/                Authenticated app shell: dashboard, courses, plan, techniques, settings
  onboarding/           5-step setup wizard
components/
  marketing/            Landing page sections
  onboarding/           Onboarding wizard
  app/                  Sidebar, mobile bottom nav, page header
  course/                Lecture analyzer, professor focus, knowledge map, assessment, tutor
  dashboard/             Dashboard widgets
  plan/                  Calendar mock connect card
  settings/              Shared accessibility panel
  ui/                    Design-system primitives (Button, Card, Chip, Switch, Progress, ...)
lib/
  mock-data.ts           Sample courses, concepts, assessments, professor focus data
  ai-mock.ts              Mock AI service layer
  calendar-mock.ts        Mock Google Calendar integration
  scheduling-engine.ts     Deterministic study-plan generator
  accessibility-context.tsx  The adaptive-learning / accessibility engine
  onboarding-store.ts      Onboarding state persistence
```

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · lucide-react
