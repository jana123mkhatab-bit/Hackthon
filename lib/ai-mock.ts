/**
 * MOCK AI SERVICE LAYER
 * ---------------------------------------------------------------
 * This file stands in for a real LLM + embeddings + RAG pipeline.
 * Every export below is written the way a real implementation would
 * be called (async, takes structured input, returns structured
 * output) so swapping in a real provider later means replacing the
 * function body, not the call sites.
 *
 * A production version of each function would:
 *   - chunk + embed uploaded materials (lib/rag/ingest.ts)
 *   - retrieve top-k relevant chunks for the request
 *   - call an LLM with a grounded prompt + the retrieved chunks
 *   - parse/validate the structured response
 *
 * For this demo, responses are deterministic sample data with a
 * simulated network delay so loading states are demonstrable.
 */

export interface ExplanationSettings {
  length: "brief" | "standard" | "detailed";
  stepByStep: boolean;
  simplifiedVocabulary: boolean;
  examplesFirst: boolean;
  chunked: boolean;
}

function delay<T>(value: T, ms = 900): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface AnalysisStep {
  label: string;
}

export const ANALYSIS_STEPS: AnalysisStep[] = [
  { label: "Reading uploaded material..." },
  { label: "Identifying concepts..." },
  { label: "Comparing against past assessments..." },
  { label: "Finding learning objectives..." },
  { label: "Mapping professor emphasis..." },
  { label: "Building your knowledge map..." },
];

/**
 * Grounded in the selected course's own concepts so the flow works for
 * any subject, not just the flagship algorithms demo path. Courses with
 * curated PROFESSOR_FOCUS entries (the four flagship demo courses) surface
 * that hand-authored evidence; any other course gets a still-plausible,
 * concept-derived analysis so uploading material "works" everywhere.
 */
export async function analyzeLecture(courseId: string, fileName: string) {
  // deferred import to avoid a cycle at module-eval time
  const { COURSES, PROFESSOR_FOCUS } = await import("./mock-data");
  const course = COURSES.find((c) => c.id === courseId);
  const concepts = course?.concepts ?? [];
  const focus = PROFESSOR_FOCUS[courseId];

  const importantConcepts = focus
    ? focus.map((f) => ({ name: f.conceptName, importance: f.stars }))
    : concepts.slice(0, 4).map((c, i) => ({ name: c.name, importance: Math.max(2, 5 - i) }));

  const learningObjectives = concepts
    .slice(0, 3)
    .map((c) => `Explain the core mechanics of ${c.name} and where it tends to be tested.`);

  const assessmentPatterns = focus
    ? focus.slice(0, 2).map((f) => f.rationale)
    : [
        `${concepts[0]?.name ?? "This unit's core idea"} recurs across the material you uploaded — the strongest repetition signal so far.`,
        "Both conceptual and applied/numerical questions appear in patterns similar to this course's past material.",
      ];

  const dependencies = concepts
    .filter((c) => c.dependsOn?.length)
    .map((c) => ({
      concept: c.name,
      requires: c.dependsOn!.map((id) => concepts.find((x) => x.id === id)?.name ?? id),
    }));

  return delay(
    {
      fileName,
      courseId,
      learningObjectives: learningObjectives.length
        ? learningObjectives
        : ["Learning objectives will appear here once more material is uploaded."],
      importantConcepts,
      assessmentPatterns,
      dependencies,
    },
    1100
  );
}

/**
 * Generates a short assessment grounded in a course's concepts.
 * In production this would retrieve relevant chunks per concept and
 * ask the LLM to write questions from them; here it returns curated
 * sample questions that already live in lib/mock-data.ts.
 */
export async function generateAssessment(courseId: string) {
  return delay({ courseId, generated: true }, 700);
}

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
  groundedIn?: string; // which source excerpt this answer drew from
}

const CANNED_TUTOR_REPLIES: Record<string, string> = {
  "explain this simply":
    "Think of it like remembering answers to homework you've already solved. Instead of re-solving fib(2) a thousand times, you write the answer down the first time and just glance at it after that.",
  "give me an example":
    "fib(5) without memoization makes 15 recursive calls. With a cache, it makes 5 — and that gap widens fast as the input grows.",
  "quiz me":
    "Quick one: if a problem has overlapping subproblems but NOT optimal substructure, does memoization still guarantee the correct answer? Think it through, then try the assessment to check.",
  "what is important for my exam?":
    "The pairing itself. DP only works when both overlapping subproblems and optimal substructure hold — your professor's materials return to that pairing more than any other idea this unit.",
  "why is my answer wrong?":
    "Most students miss that memoization alone doesn't guarantee correctness — it only guarantees you're not redoing work. Correctness comes from optimal substructure being true in the first place.",
  "compare two concepts":
    "Memoization stores results top-down, as recursive calls happen. Tabulation builds the answer bottom-up, iteratively, usually without recursion overhead — same idea, different direction.",
};

export async function askTutor(
  question: string,
  settings: ExplanationSettings
): Promise<TutorMessage> {
  const key = question.trim().toLowerCase();
  let content =
    CANNED_TUTOR_REPLIES[key] ??
    "Based on this excerpt, that connects back to the overlapping-subproblems idea your professor keeps returning to. Want me to point to where it shows up in the slides?";

  if (settings.simplifiedVocabulary) {
    content = content.replace(/optimal substructure/g, "the 'best answer is built from smaller best answers' rule");
  }
  if (settings.length === "brief") {
    content = content.split(". ").slice(0, 1).join(". ") + ".";
  }

  return delay(
    { role: "assistant", content, groundedIn: "CS 301, Week 6 lecture slides" },
    650
  );
}

/**
 * Grades against whichever question set was actually shown (curated for
 * the flagship courses, generated for any other course) so the feedback
 * always references real concepts from that course rather than a fixed
 * hard-coded example.
 */
export async function gradeAssessment(
  courseId: string,
  questions: import("./types").AssessmentQuestion[],
  answers: Record<string, number>
) {
  const { COURSES } = await import("./mock-data");
  const course = COURSES.find((c) => c.id === courseId);

  const strengthsSet = new Set<string>();
  const gapsSet = new Set<string>();
  let correct = 0;
  let scored = 0;

  for (const q of questions) {
    if (q.correctIndex === undefined) continue;
    scored++;
    const conceptName = course?.concepts.find((c) => c.id === q.conceptId)?.name ?? q.conceptId;
    if (answers[q.id] === q.correctIndex) {
      correct++;
      strengthsSet.add(conceptName);
    } else {
      gapsSet.add(conceptName);
    }
  }

  const scorePct = scored ? Math.round((correct / scored) * 100) : 0;
  const gaps = [...gapsSet];
  const strengths = [...strengthsSet].filter((s) => !gapsSet.has(s));
  const weakest = gaps[0];

  const aiExplanation = weakest
    ? `Your reasoning holds up on what you got right, but ${weakest} is where the pattern breaks down — that's the clearest gap this assessment surfaced. Worth a focused pass before anything else.`
    : "Strong pass across everything this assessment covered — no clear gap surfaced this time.";

  return delay({ scorePct, strengths, gaps, aiExplanation }, 900);
}
