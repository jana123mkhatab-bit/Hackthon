export * from "./student";

export interface CourseDoc {
  _id: string;
  studentId: string;
  courseName: string;
  courseCode: string;
  instructor: string;
  credits: number;
  confidenceLevel: number; // 1-5 self-reported confidence scale
  priority: "low" | "medium" | "high";
  /** Not in the spec's required field list — kept for UI theming/categorization, same rationale as MaterialDoc.extractedText. */
  subject?: string;
  color?: "terracotta" | "sage" | "gold";
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamDoc {
  _id: string;
  studentId: string;
  courseId: string;
  examType: "quiz" | "midterm" | "final" | "exam";
  examDate: string; // ISO date
  priority: "low" | "medium" | "high";
  readinessScore: number; // 0-100
  createdAt: Date;
}

export type ProcessingStatus = "pending" | "processing" | "completed" | "failed";
export type MaterialType = "lecture" | "assignment" | "previous_exam" | "quiz" | "notes";

export interface MaterialDoc {
  _id: string;
  studentId: string;
  courseId: string;
  fileName: string;
  fileType: string;
  fileUrl: string | null;
  materialType: MaterialType;
  uploadDate: Date;
  processingStatus: ProcessingStatus;
  /** Derived/processed text used for AI features — not the original file, so it doesn't violate the "no large files in Mongo" rule. */
  extractedText?: string;
}

export interface LectureAnalysisDoc {
  _id: string;
  materialId: string;
  courseId: string;
  learningObjectives: string[];
  keyTopics: string[];
  importantConcepts: { name: string; importance: number }[];
  professorFocus: string[];
  difficultyLevels: Record<string, "easy" | "medium" | "hard">;
  generatedAt: Date;
  /** Not in the spec's required field list — preserves the original AI analysis for a lossless round-trip to the frontend's AnalysisResult shape. */
  assessmentPatterns?: string[];
  dependencies?: { concept: string; requires: string[] }[];
  analysisSource?: "gemini" | "fallback";
}

export type AssessmentQuestionType =
  | "multiple-choice"
  | "true-false"
  | "short-answer"
  | "conceptual"
  | "problem-solving"
  | "scenario";

export interface AssessmentQuestionDoc {
  question: string;
  type: AssessmentQuestionType;
  options?: string[];
  correctAnswer: string;
  studentAnswer?: string;
  isCorrect?: boolean;
  topic: string;
  /** Not in the spec's required field list — kept so grading/UI can round-trip without a rewrite. */
  id: string;
  conceptId: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface AssessmentDoc {
  _id: string;
  studentId: string;
  courseId: string;
  type: "quiz" | "practice-exam" | "assessment";
  difficulty: "easy" | "medium" | "hard";
  questions: AssessmentQuestionDoc[];
  score: number | null;
  completedAt: Date | null;
  aiFeedback: string | null;
  createdAt: Date;
}

export type MasteryStatus = "weak" | "practicing" | "strong" | "untested";

export interface KnowledgeTopic {
  topic: string;
  mastery: number; // 0-100
  status: MasteryStatus;
  lastAssessed: Date;
  attempts: number;
}

export interface KnowledgeProfileDoc {
  _id: string;
  studentId: string;
  courseId: string;
  topics: KnowledgeTopic[];
}

export interface StudySessionDoc {
  courseId: string;
  topic: string;
  startTime: string;
  duration: number;
  activity: string;
  reason: string;
  status: "pending" | "done" | "skipped";
  /** Not in the spec's required field list — preserves the frontend's day/time/kind for a lossless round-trip. */
  day?: string;
  time?: string;
  kind?: "focus" | "practice" | "review" | "assessment" | "break";
}

export interface StudyPlanDoc {
  _id: string;
  studentId: string;
  mode: "exam" | "normal";
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "archived";
  sessions: StudySessionDoc[];
  createdAt: Date;
}
