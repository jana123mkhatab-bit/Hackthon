/**
 * Idempotent demo-data seed for LearnLoop's MongoDB collections.
 * Run with: npm run seed
 *
 * Safe to re-run — every document is upserted by a deterministic id, never
 * dropped/deleted, so running this against a live database never destroys
 * anything a real user has created.
 *
 * Student content (names, universities, majors, preferences, courses, exam
 * dates) comes from the user-supplied dataset. Two adjustments were made:
 *  - `passwordHash` values in that dataset were placeholder strings, not
 *    real bcrypt hashes, so every student is instead given a real hash of a
 *    shared demo password (printed at the end of the run).
 *  - Each course's embedded `exam` is split out into a separate `exams`
 *    document (studentId + courseId keyed), per the spec's "separate
 *    collections, not one large student document" requirement.
 */
/* eslint-disable no-console */
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import type {
  Student,
  AcademicInfo,
  LearningPreferences,
  StudentSettings,
  StudyPreferences,
} from "../lib/models/student";
import type {
  CourseDoc,
  ExamDoc,
  MaterialDoc,
  LectureAnalysisDoc,
  AssessmentDoc,
  AssessmentQuestionDoc,
  KnowledgeProfileDoc,
  KnowledgeTopic,
  StudyPlanDoc,
  StudySessionDoc,
} from "../lib/models";

const DEMO_PASSWORD = "Passw0rd!";

interface RawCourse {
  courseId: string;
  courseName: string;
  instructor: string;
  credits: number;
  confidenceLevel: number; // 1-5
  priority: "low" | "medium" | "high";
  exam: { date: string; type: string };
}

interface RawStudent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: "male" | "female";
  academicInfo: AcademicInfo;
  learningPreferences: LearningPreferences;
  settings: StudentSettings;
  studyPreferences: StudyPreferences;
  courses: RawCourse[];
}

const STUDENTS: RawStudent[] = [
  {
    _id: "student_001",
    firstName: "Ahmed",
    lastName: "Hassan",
    email: "ahmed.hassan@studypilot.demo",
    gender: "male",
    academicInfo: { university: "Egypt University of Informatics", faculty: "Computer Science", major: "Artificial Intelligence", academicYear: 3, semester: 1 },
    learningPreferences: { language: "ar-en", preferredContent: ["text"], explanationStyle: "step-by-step", visualLearning: true, audioLearning: false, preferredSessionDuration: 45, preferredStudyTechniques: ["active_recall", "practice_problems"] },
    settings: { dyslexiaMode: false, focusMode: false, largerText: false, highContrast: false, reducedMotion: false, textToSpeech: false, speechToText: false, lowConnectivityMode: false },
    studyPreferences: { availableHoursPerDay: 3, preferredStudyTime: "evening", preferredDays: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"] },
    courses: [
      { courseId: "CS301", courseName: "Algorithms", instructor: "Dr. Ahmed Samir", credits: 3, confidenceLevel: 3, priority: "high", exam: { date: "2026-09-20", type: "midterm" } },
      { courseId: "CS302", courseName: "Database Systems", instructor: "Dr. Mona Adel", credits: 3, confidenceLevel: 4, priority: "medium", exam: { date: "2026-09-24", type: "midterm" } },
      { courseId: "CS303", courseName: "Operating Systems", instructor: "Dr. Karim Nabil", credits: 3, confidenceLevel: 2, priority: "high", exam: { date: "2026-09-28", type: "midterm" } },
    ],
  },
  {
    _id: "student_002",
    firstName: "Mariam",
    lastName: "Mohamed",
    email: "mariam.mohamed@studypilot.demo",
    gender: "female",
    academicInfo: { university: "Ain Shams University", faculty: "Engineering", major: "Computer Engineering", academicYear: 2, semester: 1 },
    learningPreferences: { language: "ar-en", preferredContent: ["text_and_audio"], explanationStyle: "simple", visualLearning: true, audioLearning: true, preferredSessionDuration: 25, preferredStudyTechniques: ["spaced_repetition", "active_recall"] },
    settings: { dyslexiaMode: true, focusMode: false, largerText: true, highContrast: false, reducedMotion: true, textToSpeech: true, speechToText: false, lowConnectivityMode: false },
    studyPreferences: { availableHoursPerDay: 2, preferredStudyTime: "afternoon", preferredDays: ["Saturday", "Sunday", "Monday", "Wednesday", "Thursday"] },
    courses: [
      { courseId: "CE201", courseName: "Data Structures", instructor: "Dr. Hany Ibrahim", credits: 3, confidenceLevel: 3, priority: "high", exam: { date: "2026-09-18", type: "midterm" } },
      { courseId: "CE202", courseName: "Digital Logic", instructor: "Dr. Salma Youssef", credits: 3, confidenceLevel: 2, priority: "high", exam: { date: "2026-09-22", type: "midterm" } },
    ],
  },
  {
    _id: "student_003",
    firstName: "Omar",
    lastName: "Mahmoud",
    email: "omar.mahmoud@studypilot.demo",
    gender: "male",
    academicInfo: { university: "Cairo University", faculty: "Computers and Artificial Intelligence", major: "Computer Science", academicYear: 4, semester: 1 },
    learningPreferences: { language: "en", preferredContent: ["text"], explanationStyle: "detailed", visualLearning: false, audioLearning: false, preferredSessionDuration: 50, preferredStudyTechniques: ["practice_problems", "feynman_technique"] },
    settings: { dyslexiaMode: false, focusMode: true, largerText: false, highContrast: true, reducedMotion: true, textToSpeech: false, speechToText: true, lowConnectivityMode: false },
    studyPreferences: { availableHoursPerDay: 4, preferredStudyTime: "morning", preferredDays: ["Saturday", "Sunday", "Monday", "Tuesday", "Thursday"] },
    courses: [
      { courseId: "CS401", courseName: "Machine Learning", instructor: "Dr. Youssef Khalil", credits: 3, confidenceLevel: 4, priority: "high", exam: { date: "2026-09-21", type: "midterm" } },
      { courseId: "CS402", courseName: "Computer Networks", instructor: "Dr. Reem Tarek", credits: 3, confidenceLevel: 3, priority: "medium", exam: { date: "2026-09-26", type: "midterm" } },
    ],
  },
  {
    _id: "student_004",
    firstName: "Salma",
    lastName: "Ahmed",
    email: "salma.ahmed@studypilot.demo",
    gender: "female",
    academicInfo: { university: "Helwan University", faculty: "Computers and Information", major: "Information Systems", academicYear: 3, semester: 1 },
    learningPreferences: { language: "ar-en", preferredContent: ["text_and_audio"], explanationStyle: "step-by-step", visualLearning: true, audioLearning: true, preferredSessionDuration: 30, preferredStudyTechniques: ["active_recall", "spaced_repetition"] },
    settings: { dyslexiaMode: false, focusMode: true, largerText: true, highContrast: false, reducedMotion: true, textToSpeech: true, speechToText: true, lowConnectivityMode: false },
    studyPreferences: { availableHoursPerDay: 2, preferredStudyTime: "evening", preferredDays: ["Saturday", "Sunday", "Tuesday", "Wednesday", "Thursday"] },
    courses: [
      { courseId: "IS301", courseName: "Database Systems", instructor: "Dr. Ahmed Fathy", credits: 3, confidenceLevel: 3, priority: "high", exam: { date: "2026-09-19", type: "midterm" } },
      { courseId: "IS302", courseName: "Systems Analysis", instructor: "Dr. Dina Mostafa", credits: 3, confidenceLevel: 4, priority: "medium", exam: { date: "2026-09-25", type: "midterm" } },
    ],
  },
  {
    _id: "student_005",
    firstName: "Youssef",
    lastName: "Hussein",
    email: "youssef.hussein@studypilot.demo",
    gender: "male",
    academicInfo: { university: "Alexandria University", faculty: "Engineering", major: "Computer and Communications Engineering", academicYear: 3, semester: 1 },
    learningPreferences: { language: "ar", preferredContent: ["audio"], explanationStyle: "simple", visualLearning: false, audioLearning: true, preferredSessionDuration: 30, preferredStudyTechniques: ["feynman_technique", "active_recall"] },
    settings: { dyslexiaMode: true, focusMode: false, largerText: true, highContrast: true, reducedMotion: false, textToSpeech: true, speechToText: true, lowConnectivityMode: true },
    studyPreferences: { availableHoursPerDay: 2, preferredStudyTime: "evening", preferredDays: ["Saturday", "Monday", "Tuesday", "Wednesday"] },
    courses: [
      { courseId: "CCE301", courseName: "Computer Networks", instructor: "Dr. Mostafa Hassan", credits: 3, confidenceLevel: 2, priority: "high", exam: { date: "2026-09-17", type: "midterm" } },
      { courseId: "CCE302", courseName: "Signals and Systems", instructor: "Dr. Rania Ahmed", credits: 3, confidenceLevel: 2, priority: "high", exam: { date: "2026-09-23", type: "midterm" } },
    ],
  },
  {
    _id: "student_006",
    firstName: "Nourhan",
    lastName: "Khaled",
    email: "nourhan.khaled@studypilot.demo",
    gender: "female",
    academicInfo: { university: "Mansoura University", faculty: "Medicine", major: "Medicine", academicYear: 2, semester: 1 },
    learningPreferences: { language: "ar-en", preferredContent: ["text"], explanationStyle: "step-by-step", visualLearning: true, audioLearning: false, preferredSessionDuration: 40, preferredStudyTechniques: ["active_recall", "spaced_repetition", "flashcards"] },
    settings: { dyslexiaMode: false, focusMode: false, largerText: false, highContrast: false, reducedMotion: false, textToSpeech: false, speechToText: false, lowConnectivityMode: false },
    studyPreferences: { availableHoursPerDay: 5, preferredStudyTime: "morning", preferredDays: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] },
    courses: [
      { courseId: "MED201", courseName: "Anatomy", instructor: "Dr. Hala Mahmoud", credits: 5, confidenceLevel: 3, priority: "high", exam: { date: "2026-09-16", type: "midterm" } },
      { courseId: "MED202", courseName: "Physiology", instructor: "Dr. Amr Nabil", credits: 4, confidenceLevel: 3, priority: "high", exam: { date: "2026-09-21", type: "midterm" } },
    ],
  },
  {
    _id: "student_007",
    firstName: "Karim",
    lastName: "Tarek",
    email: "karim.tarek@studypilot.demo",
    gender: "male",
    academicInfo: { university: "German International University", faculty: "Business Informatics", major: "Business Informatics", academicYear: 2, semester: 1 },
    learningPreferences: { language: "en", preferredContent: ["text"], explanationStyle: "example_based", visualLearning: true, audioLearning: false, preferredSessionDuration: 25, preferredStudyTechniques: ["practice_problems", "active_recall"] },
    settings: { dyslexiaMode: false, focusMode: true, largerText: false, highContrast: false, reducedMotion: true, textToSpeech: false, speechToText: true, lowConnectivityMode: false },
    studyPreferences: { availableHoursPerDay: 2, preferredStudyTime: "afternoon", preferredDays: ["Saturday", "Sunday", "Monday", "Thursday"] },
    courses: [
      { courseId: "BI201", courseName: "Business Analytics", instructor: "Dr. Sara Adel", credits: 3, confidenceLevel: 3, priority: "high", exam: { date: "2026-09-20", type: "midterm" } },
      { courseId: "BI202", courseName: "Programming Fundamentals", instructor: "Dr. Omar Hany", credits: 3, confidenceLevel: 2, priority: "high", exam: { date: "2026-09-27", type: "midterm" } },
    ],
  },
  {
    _id: "student_008",
    firstName: "Menna",
    lastName: "Mostafa",
    email: "menna.mostafa@studypilot.demo",
    gender: "female",
    academicInfo: { university: "October 6 University", faculty: "Pharmacy", major: "Pharmacy", academicYear: 3, semester: 1 },
    learningPreferences: { language: "ar-en", preferredContent: ["text_and_audio"], explanationStyle: "simple", visualLearning: true, audioLearning: true, preferredSessionDuration: 25, preferredStudyTechniques: ["flashcards", "spaced_repetition"] },
    settings: { dyslexiaMode: true, focusMode: true, largerText: true, highContrast: false, reducedMotion: true, textToSpeech: true, speechToText: false, lowConnectivityMode: false },
    studyPreferences: { availableHoursPerDay: 3, preferredStudyTime: "evening", preferredDays: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"] },
    courses: [
      { courseId: "PH301", courseName: "Pharmacology", instructor: "Dr. Hossam Ahmed", credits: 4, confidenceLevel: 2, priority: "high", exam: { date: "2026-09-18", type: "midterm" } },
      { courseId: "PH302", courseName: "Medicinal Chemistry", instructor: "Dr. Reham Khalil", credits: 3, confidenceLevel: 3, priority: "medium", exam: { date: "2026-09-24", type: "midterm" } },
    ],
  },
  {
    _id: "student_009",
    firstName: "Abdelrahman",
    lastName: "Ibrahim",
    email: "abdelrahman.ibrahim@studypilot.demo",
    gender: "male",
    academicInfo: { university: "Assiut University", faculty: "Science", major: "Computer Science", academicYear: 4, semester: 1 },
    learningPreferences: { language: "ar-en", preferredContent: ["text"], explanationStyle: "detailed", visualLearning: true, audioLearning: false, preferredSessionDuration: 50, preferredStudyTechniques: ["feynman_technique", "practice_problems"] },
    settings: { dyslexiaMode: false, focusMode: false, largerText: false, highContrast: false, reducedMotion: false, textToSpeech: false, speechToText: false, lowConnectivityMode: true },
    studyPreferences: { availableHoursPerDay: 3, preferredStudyTime: "morning", preferredDays: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"] },
    courses: [
      { courseId: "CS401", courseName: "Artificial Intelligence", instructor: "Dr. Mahmoud Sameh", credits: 3, confidenceLevel: 4, priority: "high", exam: { date: "2026-09-19", type: "midterm" } },
      { courseId: "CS402", courseName: "Computer Vision", instructor: "Dr. Nada Hassan", credits: 3, confidenceLevel: 2, priority: "high", exam: { date: "2026-09-26", type: "midterm" } },
    ],
  },
  {
    _id: "student_010",
    firstName: "Farida",
    lastName: "Ali",
    email: "farida.ali@studypilot.demo",
    gender: "female",
    academicInfo: { university: "British University in Egypt", faculty: "Business Administration", major: "Management Information Systems", academicYear: 3, semester: 1 },
    learningPreferences: { language: "en", preferredContent: ["text_and_audio"], explanationStyle: "example_based", visualLearning: true, audioLearning: true, preferredSessionDuration: 30, preferredStudyTechniques: ["active_recall", "feynman_technique"] },
    settings: { dyslexiaMode: false, focusMode: true, largerText: false, highContrast: true, reducedMotion: true, textToSpeech: true, speechToText: true, lowConnectivityMode: false },
    studyPreferences: { availableHoursPerDay: 3, preferredStudyTime: "afternoon", preferredDays: ["Saturday", "Sunday", "Tuesday", "Wednesday", "Thursday"] },
    courses: [
      { courseId: "MIS301", courseName: "Information Systems", instructor: "Dr. Mohamed Emad", credits: 3, confidenceLevel: 4, priority: "medium", exam: { date: "2026-09-22", type: "midterm" } },
      { courseId: "MIS302", courseName: "Data Analytics", instructor: "Dr. Laila Samir", credits: 3, confidenceLevel: 3, priority: "high", exam: { date: "2026-09-29", type: "midterm" } },
    ],
  },
];

/** Topic lists keyed by course name, used to synthesize realistic materials/analyses/assessments/knowledge profiles. */
const COURSE_TOPICS: Record<string, string[]> = {
  Algorithms: ["Recursion", "Dynamic Programming", "Graph Traversal", "Sorting & Complexity"],
  "Database Systems": ["Normalization", "SQL Query Optimization", "Transactions & ACID", "Indexing"],
  "Operating Systems": ["Process Scheduling", "Deadlocks", "Memory Management"],
  "Data Structures": ["Linked Lists", "Binary Trees", "Hash Tables", "Stacks & Queues"],
  "Digital Logic": ["Boolean Algebra", "Karnaugh Maps", "Flip-Flops", "Combinational Circuits"],
  "Machine Learning": ["Gradient Descent", "Overfitting & Regularization", "Decision Trees", "Neural Networks"],
  "Computer Networks": ["TCP/IP Model", "Routing Algorithms", "Network Layer Addressing"],
  "Systems Analysis": ["Requirements Gathering", "Data Flow Diagrams", "Use Case Modeling"],
  "Signals and Systems": ["Fourier Transforms", "Convolution", "Laplace Transforms"],
  Anatomy: ["Skeletal System", "Muscular System", "Cardiovascular Anatomy"],
  Physiology: ["Cardiac Cycle", "Renal Filtration", "Action Potentials"],
  "Business Analytics": ["Descriptive Statistics", "Regression Analysis", "Data Visualization"],
  "Programming Fundamentals": ["Variables & Control Flow", "Functions & Recursion", "Arrays"],
  Pharmacology: ["Drug Metabolism", "Receptor Theory", "Dose-Response Curves"],
  "Medicinal Chemistry": ["Functional Groups", "Drug Stability", "Stereochemistry"],
  "Artificial Intelligence": ["Search Algorithms", "Knowledge Representation", "Heuristics"],
  "Computer Vision": ["Image Filtering", "Edge Detection", "Convolutional Neural Networks"],
  "Information Systems": ["System Architecture", "Requirements Analysis", "ERP Concepts"],
  "Data Analytics": ["Descriptive Statistics", "Data Cleaning", "Predictive Modeling"],
};

const EXAM_TYPE_MAP: Record<string, ExamDoc["examType"]> = {
  midterm: "midterm",
  final: "final",
  quiz: "quiz",
};

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  if (!uri || !dbName) {
    console.error("MongoDB is not configured (MONGODB_URI / MONGODB_DB missing). Aborting seed.");
    process.exit(1);
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
  await client.connect();
  const db = client.db(dbName);

  const students = db.collection<Student>("students");
  const courses = db.collection<CourseDoc>("courses");
  const exams = db.collection<ExamDoc>("exams");
  const materials = db.collection<MaterialDoc>("materials");
  const lectureAnalyses = db.collection<LectureAnalysisDoc>("lectureAnalyses");
  const assessments = db.collection<AssessmentDoc>("assessments");
  const knowledgeProfiles = db.collection<KnowledgeProfileDoc>("knowledgeProfiles");
  const studyPlans = db.collection<StudyPlanDoc>("studyPlans");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const timestamp = new Date();

  for (let i = 0; i < STUDENTS.length; i++) {
    const raw = STUDENTS[i];
    const studentId = raw._id;

    const studentDoc: Student = {
      _id: studentId,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      passwordHash,
      gender: raw.gender,
      academicInfo: raw.academicInfo,
      learningPreferences: raw.learningPreferences,
      settings: raw.settings,
      studyPreferences: raw.studyPreferences,
      stats: {
        streakDays: 2 + (i % 10),
        focusMinutesThisWeek: 90 + i * 20,
        weeklyGoalMinutes: raw.studyPreferences.availableHoursPerDay * raw.studyPreferences.preferredDays.length * 60,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await students.replaceOne({ _id: studentId }, studentDoc, { upsert: true });

    const sessions: StudySessionDoc[] = [];

    for (let c = 0; c < raw.courses.length; c++) {
      const raw_course = raw.courses[c];
      const courseId = `${studentId}_${raw_course.courseId}`;
      const topics = COURSE_TOPICS[raw_course.courseName] ?? [raw_course.courseName];

      const courseDoc: CourseDoc = {
        _id: courseId,
        studentId,
        courseName: raw_course.courseName,
        courseCode: raw_course.courseId,
        instructor: raw_course.instructor,
        credits: raw_course.credits,
        confidenceLevel: raw_course.confidenceLevel,
        priority: raw_course.priority,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await courses.replaceOne({ _id: courseId }, courseDoc, { upsert: true });

      // Exam — split out of the course, per the spec's separate-collections requirement.
      const examId = `${courseId}_exam`;
      const readinessScore = Math.min(100, Math.max(0, raw_course.confidenceLevel * 20 - 10));
      const examDoc: ExamDoc = {
        _id: examId,
        studentId,
        courseId,
        examType: EXAM_TYPE_MAP[raw_course.exam.type] ?? "exam",
        examDate: raw_course.exam.date,
        priority: raw_course.priority,
        readinessScore,
        createdAt: timestamp,
      };
      await exams.replaceOne({ _id: examId }, examDoc, { upsert: true });

      // Material + lecture analysis
      const materialId = `${courseId}_material`;
      const extractedText = `Lecture notes for ${raw_course.courseName}: an overview of ${topics.join(", ")}. ${raw_course.instructor} emphasized worked examples and recurring exam-style questions on ${topics[0]}.`;
      const materialDoc: MaterialDoc = {
        _id: materialId,
        studentId,
        courseId,
        fileName: `${raw_course.courseId} - Lecture ${c + 1}.pdf`,
        fileType: "application/pdf",
        fileUrl: null,
        materialType: "lecture",
        uploadDate: timestamp,
        processingStatus: "completed",
        extractedText,
      };
      await materials.replaceOne({ _id: materialId }, materialDoc, { upsert: true });

      const analysisId = `${materialId}_analysis`;
      const analysisDoc: LectureAnalysisDoc = {
        _id: analysisId,
        materialId,
        courseId,
        learningObjectives: topics.map((topic) => `Understand ${topic} and apply it to representative problems.`),
        keyTopics: topics,
        importantConcepts: topics.map((topic, idx) => ({ name: topic, importance: Math.max(1, 5 - idx) })),
        professorFocus: topics.slice(0, Math.max(1, topics.length - 1)),
        difficultyLevels: Object.fromEntries(topics.map((topic, idx) => [topic, idx === 0 ? "hard" : idx === 1 ? "medium" : "easy"])),
        generatedAt: timestamp,
        assessmentPatterns: [`Questions frequently connect back to ${topics[0]}.`, "Expect a mix of conceptual and applied questions."],
        dependencies: [],
      };
      await lectureAnalyses.replaceOne({ _id: analysisId }, analysisDoc, { upsert: true });

      // Assessment (completed) — deterministically mark some questions wrong so mastery varies.
      const assessmentId = `${courseId}_assessment`;
      const questionDocs: AssessmentQuestionDoc[] = topics.map((topic, idx) => {
        const options = [`The core mechanism behind ${topic}`, "An unrelated formatting convention", "A concept outside this course's scope", "A synonym with no independent meaning"];
        const correctAnswer = options[0];
        const wrong = (idx + i) % 3 === 0;
        const studentAnswer = wrong ? options[1] : correctAnswer;
        return {
          id: `${assessmentId}_q${idx + 1}`,
          conceptId: topic.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          question: `Which statement best describes ${topic}?`,
          type: "conceptual",
          options,
          correctAnswer,
          studentAnswer,
          isCorrect: !wrong,
          topic,
          difficulty: idx === 0 ? "hard" : idx === 1 ? "medium" : "easy",
        };
      });
      const correctCount = questionDocs.filter((q) => q.isCorrect).length;
      const score = Math.round((correctCount / questionDocs.length) * 100);
      const assessmentDoc: AssessmentDoc = {
        _id: assessmentId,
        studentId,
        courseId,
        type: "assessment",
        difficulty: "medium",
        questions: questionDocs,
        score,
        completedAt: timestamp,
        aiFeedback:
          score >= 70
            ? `Strong pass across ${raw_course.courseName} — keep up a light review pace.`
            : `${topics[0]} is the clearest gap surfaced by this assessment — review it before your next attempt.`,
        createdAt: timestamp,
      };
      await assessments.replaceOne({ _id: assessmentId }, assessmentDoc, { upsert: true });

      // Knowledge profile derived from the graded assessment
      const kpTopics: KnowledgeTopic[] = questionDocs.map((q) => ({
        topic: q.topic,
        mastery: q.isCorrect ? 70 + ((i + c) % 25) : 25 + ((i + c) % 20),
        status: q.isCorrect ? "practicing" : "weak",
        lastAssessed: timestamp,
        attempts: 1,
      }));
      const kpId = `${studentId}_${courseId}_kp`;
      const kpDoc: KnowledgeProfileDoc = { _id: kpId, studentId, courseId, topics: kpTopics };
      await knowledgeProfiles.replaceOne({ _id: kpId }, kpDoc, { upsert: true });

      // Study session for this course's weakest topic
      const weakest = [...kpTopics].sort((a, b) => a.mastery - b.mastery)[0];
      if (weakest) {
        const time = ["3:00 PM", "4:00 PM", "5:00 PM"][c % 3];
        sessions.push({
          courseId,
          topic: weakest.topic,
          startTime: `Monday ${time}`,
          duration: 30,
          activity: "Practice Problems",
          reason: "Knowledge gap detected",
          status: "pending",
          day: "Monday",
          time,
          kind: "practice",
        });
      }
    }

    // Study plan
    const planId = `${studentId}_plan`;
    const endDate = new Date(timestamp);
    endDate.setDate(endDate.getDate() + 14);
    const planDoc: StudyPlanDoc = {
      _id: planId,
      studentId,
      mode: i % 2 === 0 ? "exam" : "normal",
      startDate: timestamp.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      status: "active",
      sessions,
      createdAt: timestamp,
    };
    await studyPlans.replaceOne({ _id: planId }, planDoc, { upsert: true });

    console.log(`Seeded ${raw.firstName} ${raw.lastName} (${raw.email}) with ${raw.courses.length} course(s).`);
  }

  console.log("\nSeed complete.");
  console.log(`Demo password for every seeded student: ${DEMO_PASSWORD}`);
  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
