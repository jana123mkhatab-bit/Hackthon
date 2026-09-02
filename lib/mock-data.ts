import type {
  AssessmentQuestion,
  AssessmentResult,
  Course,
  ProfessorFocusItem,
  ResourceRecommendation,
  StudySession,
  Technique,
} from "./types";

function stateFor(mastery: number) {
  if (mastery >= 75) return "strong" as const;
  if (mastery >= 45) return "practicing" as const;
  return "weak" as const;
}

/**
 * Deliberately spans multiple majors (CS, Business, Medicine/Science,
 * Humanities) so the product never reads as "built for one subject."
 */
export const COURSES: Course[] = [
  {
    id: "algorithms",
    code: "CS 301",
    name: "Algorithms",
    professor: "Prof. Ibrahim",
    subject: "Computer Science",
    color: "terracotta",
    progressPct: 68,
    hasMaterials: true,
    examDate: addDays(12),
    concepts: [
      { id: "dp", name: "Dynamic Programming", mastery: 48, state: stateFor(48), dependsOn: ["recursion"] },
      { id: "recursion", name: "Recursion", mastery: 81, state: stateFor(81) },
      { id: "graph-traversal", name: "Graph Traversal", mastery: 61, state: stateFor(61), dependsOn: ["recursion"] },
      { id: "greedy", name: "Greedy Algorithms", mastery: 57, state: stateFor(57) },
      { id: "sorting", name: "Sorting & Complexity", mastery: 88, state: stateFor(88) },
    ],
  },
  {
    id: "os",
    code: "CS 350",
    name: "Operating Systems",
    professor: "Prof. Whitfield",
    subject: "Computer Science",
    color: "sage",
    progressPct: 54,
    hasMaterials: true,
    examDate: addDays(21),
    concepts: [
      { id: "processes", name: "Processes", mastery: 90, state: stateFor(90) },
      { id: "threads", name: "Threads", mastery: 72, state: stateFor(72), dependsOn: ["processes"] },
      { id: "scheduling", name: "CPU Scheduling", mastery: 48, state: stateFor(48), dependsOn: ["processes"] },
      { id: "deadlocks", name: "Deadlocks", mastery: 35, state: stateFor(35), dependsOn: ["scheduling"] },
      { id: "memory", name: "Memory Management", mastery: 81, state: stateFor(81) },
    ],
  },
  {
    id: "biochem",
    code: "BIO 214",
    name: "Biochemistry",
    professor: "Dr. Aris",
    subject: "Science",
    color: "gold",
    progressPct: 40,
    hasMaterials: true,
    examDate: addDays(9),
    concepts: [
      { id: "enzyme-kinetics", name: "Enzyme Kinetics", mastery: 39, state: stateFor(39) },
      { id: "glycolysis", name: "Glycolysis", mastery: 66, state: stateFor(66) },
      { id: "protein-folding", name: "Protein Folding", mastery: 52, state: stateFor(52) },
      { id: "membrane-transport", name: "Membrane Transport", mastery: 74, state: stateFor(74) },
    ],
  },
  {
    id: "strategy",
    code: "BUS 220",
    name: "Business Strategy",
    professor: "Prof. Okonkwo",
    subject: "Business",
    color: "sage",
    progressPct: 77,
    hasMaterials: true,
    concepts: [
      { id: "porters-five", name: "Porter's Five Forces", mastery: 84, state: stateFor(84) },
      { id: "swot", name: "SWOT Analysis", mastery: 91, state: stateFor(91) },
      { id: "blue-ocean", name: "Blue Ocean Strategy", mastery: 58, state: stateFor(58) },
      { id: "value-chain", name: "Value Chain Analysis", mastery: 63, state: stateFor(63) },
    ],
  },
  {
    id: "signals",
    code: "ENGR 301",
    name: "Signals & Systems",
    professor: "Prof. Delacroix",
    subject: "Engineering",
    color: "terracotta",
    progressPct: 0,
    hasMaterials: false,
    concepts: [
      { id: "fourier", name: "Fourier Transforms", mastery: 0, state: "untested" },
      { id: "convolution", name: "Convolution", mastery: 0, state: "untested" },
      { id: "laplace", name: "Laplace Transforms", mastery: 0, state: "untested" },
    ],
  },
  {
    id: "physiology",
    code: "MED 210",
    name: "Human Physiology",
    professor: "Dr. Achebe",
    subject: "Medicine",
    color: "gold",
    progressPct: 0,
    hasMaterials: false,
    concepts: [
      { id: "cardiac-cycle", name: "Cardiac Cycle", mastery: 0, state: "untested" },
      { id: "renal-filtration", name: "Renal Filtration", mastery: 0, state: "untested" },
      { id: "action-potentials", name: "Action Potentials", mastery: 0, state: "untested" },
    ],
  },
  {
    id: "political-phil",
    code: "HIST 240",
    name: "20th-Century Political Philosophy",
    professor: "Prof. Lindqvist",
    subject: "Humanities",
    color: "sage",
    progressPct: 0,
    hasMaterials: false,
    concepts: [
      { id: "social-contract", name: "Social Contract Theory", mastery: 0, state: "untested" },
      { id: "critical-theory", name: "Critical Theory", mastery: 0, state: "untested" },
    ],
  },
];

export const SUBJECT_CATEGORIES: import("./types").SubjectCategory[] = [
  "Computer Science",
  "Engineering",
  "Business",
  "Medicine",
  "Science",
  "Humanities",
];

export function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

export const PROFESSOR_FOCUS: Record<string, ProfessorFocusItem[]> = {
  algorithms: [
    {
      conceptId: "dp",
      conceptName: "Dynamic Programming",
      stars: 5,
      evidence: ["Appears in 4 lectures", "Appears in 3 past assessments", "Repeated concept across midterms"],
      rationale:
        "Referenced in weeks 5, 6, 7 and 9, and both midterm review sessions return to the overlapping-subproblems / optimal-substructure pairing directly.",
    },
    {
      conceptId: "graph-traversal",
      conceptName: "Graph Traversal",
      stars: 4,
      evidence: ["Appears in 3 lectures", "Appears in 2 past assessments"],
      rationale:
        "Weeks 3, 4 and 8 cover BFS/DFS and shortest-path variants; Dijkstra's non-negative-weight constraint has shown up on two past quizzes.",
    },
    {
      conceptId: "greedy",
      conceptName: "Greedy Algorithms",
      stars: 3,
      evidence: ["Appears in 2 lectures", "Appears in 1 past assessment"],
      rationale:
        "Mostly introduced as a contrast case against dynamic programming in weeks 2-3 — lower recurrence than DP, but still tested once.",
    },
    {
      conceptId: "sorting",
      conceptName: "Sorting & Complexity",
      stars: 2,
      evidence: ["Appears in 1 lecture", "Foundational, assumed known"],
      rationale:
        "Covered early as prerequisite material rather than exam-weighted content in the materials you've uploaded so far.",
    },
  ],
  os: [
    {
      conceptId: "scheduling",
      conceptName: "CPU Scheduling",
      stars: 5,
      evidence: ["Appears in 5 lectures", "Appears in 2 past assessments", "Densest lecture in the unit"],
      rationale:
        "Week 4's slides run 10-24 on preemptive vs. cooperative scheduling alone — by far the most slide-time of any topic this unit.",
    },
    {
      conceptId: "deadlocks",
      conceptName: "Deadlocks",
      stars: 4,
      evidence: ["Appears in 3 lectures", "New this unit"],
      rationale:
        "Week 5 introduces all four necessary conditions in detail; historically Prof. Whitfield tests at least one deadlock-detection question per midterm.",
    },
    {
      conceptId: "threads",
      conceptName: "Threads",
      stars: 3,
      evidence: ["Appears in 2 lectures"],
      rationale: "Covered as a bridge topic between processes and scheduling.",
    },
  ],
  biochem: [
    {
      conceptId: "enzyme-kinetics",
      conceptName: "Enzyme Kinetics",
      stars: 5,
      evidence: ["Appears in 4 lectures", "Appears in 3 past assessments"],
      rationale:
        "Michaelis-Menten derivations recur across nearly every problem set Dr. Aris has assigned this semester.",
    },
    {
      conceptId: "protein-folding",
      conceptName: "Protein Folding",
      stars: 3,
      evidence: ["Appears in 2 lectures"],
      rationale: "Discussed conceptually, with lighter numerical emphasis so far.",
    },
  ],
  strategy: [
    {
      conceptId: "blue-ocean",
      conceptName: "Blue Ocean Strategy",
      stars: 4,
      evidence: ["Appears in 3 lectures", "Case study heavy"],
      rationale:
        "Three separate case studies this term center on blue-ocean repositioning — a strong signal for the final case exam.",
    },
    {
      conceptId: "porters-five",
      conceptName: "Porter's Five Forces",
      stars: 3,
      evidence: ["Appears in 2 lectures", "Foundational framework"],
      rationale: "Used as a recurring analytical lens rather than a standalone tested topic.",
    },
  ],
};

/**
 * Signature "what does my professor want me to learn?" feature.
 * Flagship courses get hand-authored, evidence-backed rankings; any other
 * course falls back to a hedged, concept-derived estimate so the feature
 * still works once a student uploads material for a course we don't have
 * curated data for. Language stays deliberately uncertain either way —
 * this is a pattern read from materials, never a claim about intent.
 */
export function getProfessorFocus(courseId: string): ProfessorFocusItem[] {
  if (PROFESSOR_FOCUS[courseId]) return PROFESSOR_FOCUS[courseId];
  const course = COURSES.find((c) => c.id === courseId);
  if (!course || !course.hasMaterials) return [];
  return course.concepts.slice(0, 4).map((c, i) => ({
    conceptId: c.id,
    conceptName: c.name,
    stars: Math.max(2, 5 - i) as 1 | 2 | 3 | 4 | 5,
    evidence: ["Appears repeatedly in your uploaded material"],
    rationale: `${c.name} shows up early and often in what you've uploaded so far. This is a first read based on limited material — upload more lectures or a past assessment to sharpen it.`,
  }));
}

export const TODAYS_FOCUS = {
  courseId: "algorithms",
  conceptName: "Dynamic Programming",
  minutes: 45,
  reason:
    "You scored 52% on your latest assessment and this topic appears in 4 of your uploaded lecture sets — the strongest emphasis signal in your materials right now.",
};

export const SAMPLE_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "q1",
    type: "multiple-choice",
    conceptId: "dp",
    prompt:
      "Why does memoizing the naive Fibonacci recursion reduce it from exponential to linear time?",
    choices: [
      "Because recursion is always slower than iteration.",
      "Because it caches results of overlapping subproblems so each is computed once.",
      "Because it changes the recurrence relation itself.",
      "Because the base case is reached sooner.",
    ],
    correctIndex: 1,
    difficulty: "medium",
  },
  {
    id: "q2",
    type: "true-false",
    conceptId: "dp",
    prompt:
      "A problem needs BOTH overlapping subproblems and optimal substructure for dynamic programming to guarantee a correct answer.",
    choices: ["True", "False"],
    correctIndex: 0,
    difficulty: "easy",
  },
  {
    id: "q3",
    type: "problem-solving",
    conceptId: "dp",
    prompt:
      "Given weights [2, 3, 4, 5] and values [3, 4, 5, 6] and a knapsack capacity of 5, what is the maximum achievable value?",
    choices: ["7", "8", "9", "10"],
    correctIndex: 1,
    difficulty: "hard",
  },
  {
    id: "q4",
    type: "conceptual",
    conceptId: "graph-traversal",
    prompt:
      "Why does Dijkstra's algorithm fail to guarantee correctness when edge weights can be negative?",
    choices: [
      "It runs out of memory on negative weights.",
      "Its greedy choice assumes the shortest path so far can never be improved later.",
      "Negative weights are mathematically undefined in graphs.",
      "It only works on directed graphs.",
    ],
    correctIndex: 1,
    difficulty: "medium",
  },
  {
    id: "q5",
    type: "scenario",
    conceptId: "greedy",
    prompt:
      "You're making change for $0.41 using US coins with a greedy algorithm. Does the greedy approach give the optimal (fewest-coin) answer here, and why?",
    choices: [
      "Yes — US coin denominations happen to make greedy optimal.",
      "No — greedy always fails on currency problems.",
      "Only if you start from the smallest coin.",
      "It depends on the number of coins in circulation.",
    ],
    correctIndex: 0,
    difficulty: "medium",
  },
];

/**
 * The flagship "algorithms" course gets the hand-authored question bank
 * above. Any other course gets a lighter, still-real generated set so the
 * assessment flow works for every subject, not just the demo path.
 */
export function getAssessmentQuestions(courseId: string): AssessmentQuestion[] {
  if (courseId === "algorithms") return SAMPLE_QUESTIONS;

  const course = COURSES.find((c) => c.id === courseId);
  const concepts = (course?.concepts ?? []).slice(0, 3);

  return concepts.flatMap((c, i) => [
    {
      id: `${courseId}-tf-${i}`,
      type: "true-false" as const,
      conceptId: c.id,
      prompt: `${c.name} builds directly on ${c.dependsOn?.length ? concepts.find((x) => x.id === c.dependsOn![0])?.name ?? "an earlier concept" : "material introduced earlier in the course"}.`,
      choices: ["True", "False"],
      correctIndex: c.dependsOn?.length ? 0 : 1,
      difficulty: "easy" as const,
    },
    {
      id: `${courseId}-mc-${i}`,
      type: "conceptual" as const,
      conceptId: c.id,
      prompt: `Which best describes ${c.name} in ${course?.code ?? "this course"}?`,
      choices: [
        `The core mechanism behind how ${c.name.toLowerCase()} actually works`,
        "A minor footnote with no real application",
        "A synonym for an unrelated topic",
        "Something outside the scope of this course",
      ],
      correctIndex: 0,
      difficulty: "medium" as const,
    },
  ]);
}

export const RECENT_ASSESSMENTS: AssessmentResult[] = [
  {
    id: "a1",
    courseId: "algorithms",
    date: addDays(-2),
    scorePct: 52,
    strengths: ["Recursion base cases", "Big-O comparisons"],
    gaps: ["Recurrence relations", "Memoization vs. tabulation"],
    aiExplanation:
      "Your reasoning about recursive structure is solid, but calculations involving the recurrence relation itself suggest the overlapping-subproblems idea hasn't fully clicked yet.",
  },
  {
    id: "a2",
    courseId: "os",
    date: addDays(-5),
    scorePct: 74,
    strengths: ["Process states", "Context switching"],
    gaps: ["Round Robin quantum calculations"],
    aiExplanation:
      "You understand the definition of Round Robin scheduling, but your calculations suggest you need more practice applying the algorithm under time pressure.",
  },
  {
    id: "a3",
    courseId: "biochem",
    date: addDays(-8),
    scorePct: 61,
    strengths: ["Substrate concentration effects"],
    gaps: ["Lineweaver-Burk plot interpretation"],
    aiExplanation:
      "Conceptually you're tracking Michaelis-Menten kinetics well, but reading Km and Vmax off a Lineweaver-Burk plot is where points were lost.",
  },
];

export const STUDY_PLAN: StudySession[] = [
  { id: "s1", day: "Monday", time: "4:00 PM", courseId: "algorithms", conceptName: "Dynamic Programming", minutes: 45, kind: "focus" },
  { id: "s2", day: "Monday", time: "4:45 PM", courseId: "algorithms", conceptName: "Break", minutes: 15, kind: "break" },
  { id: "s3", day: "Tuesday", time: "5:00 PM", courseId: "os", conceptName: "CPU Scheduling", minutes: 40, kind: "focus" },
  { id: "s4", day: "Wednesday", time: "4:00 PM", courseId: "algorithms", conceptName: "Practice Problems", minutes: 60, kind: "practice" },
  { id: "s5", day: "Thursday", time: "6:00 PM", courseId: "biochem", conceptName: "Enzyme Kinetics", minutes: 35, kind: "focus" },
  { id: "s6", day: "Friday", time: "3:00 PM", courseId: "algorithms", conceptName: "Quick Assessment", minutes: 20, kind: "assessment" },
];

export const TECHNIQUES: Technique[] = [
  { id: "active-recall", name: "Active Recall", blurb: "Retrieve the answer from memory before checking it — closes the gap assessments keep finding." },
  { id: "spaced-repetition", name: "Spaced Repetition", blurb: "Revisit at increasing intervals so it survives past exam day." },
  { id: "feynman", name: "Feynman Technique", blurb: "Explain it in plain language — gaps in explanation reveal gaps in understanding." },
  { id: "practice-problems", name: "Practice Problems", blurb: "Build procedural fluency, not just recognition." },
  { id: "flashcards", name: "Flashcards", blurb: "Fast recall drilling for discrete facts and definitions." },
  { id: "self-explanation", name: "Self-Explanation", blurb: "Narrate your own reasoning while solving to catch faulty logic early." },
  { id: "retrieval-practice", name: "Retrieval Practice", blurb: "Low-stakes recall testing, spaced across several short sessions." },
];

export function recommendTechnique(conceptMastery: number, _difficulty: "easy" | "medium" | "hard") {
  if (conceptMastery < 45) {
    return {
      technique: TECHNIQUES.find((t) => t.id === "feynman")!,
      why: "Mastery is still low here — explaining the concept in your own words tends to surface exactly which part isn't clicking yet, before you spend time drilling.",
    };
  }
  if (conceptMastery < 70) {
    return {
      technique: TECHNIQUES.find((t) => t.id === "practice-problems")!,
      why: "You understand the idea but the numbers are shaky — worked problems build the procedural fluency that's currently missing.",
    };
  }
  return {
    technique: TECHNIQUES.find((t) => t.id === "spaced-repetition")!,
    why: "This is already a strength. A light spaced-repetition pass is enough to keep it from fading before the exam.",
  };
}

export const RESOURCES: ResourceRecommendation[] = [
  {
    id: "r1",
    gapConceptId: "scheduling",
    title: "Round Robin Scheduling — Worked Numerical Problems",
    type: "video",
    why: "Focuses specifically on numerical scheduling calculations, not the whole CPU scheduling unit.",
    durationMinutes: 14,
  },
  {
    id: "r2",
    gapConceptId: "dp",
    title: "Recurrence Relations for Dynamic Programming",
    type: "interactive",
    why: "Walks through writing the recurrence step by step — the exact gap your last assessment flagged.",
    durationMinutes: 20,
  },
  {
    id: "r3",
    gapConceptId: "enzyme-kinetics",
    title: "Reading a Lineweaver-Burk Plot",
    type: "article",
    why: "Targets plot interpretation directly, which is where your points were lost, not general enzyme kinetics theory.",
    durationMinutes: 8,
  },
  {
    id: "r4",
    gapConceptId: "deadlocks",
    title: "Deadlock Detection Practice Set (12 problems)",
    type: "practice-set",
    why: "Untested ground for you so far — short, graded practice before you attempt a full assessment.",
    durationMinutes: 25,
  },
];

export const STUDENT = {
  firstName: "Jana",
  streakDays: 6,
  focusMinutesThisWeek: 245,
  weeklyGoalMinutes: 360,
};
