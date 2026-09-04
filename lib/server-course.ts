import "server-only";
import type { Concept, Course, MasteryState, SubjectCategory } from "@/lib/types";
import { getCollection } from "@/lib/db";
import type { CourseDoc, ExamDoc, KnowledgeProfileDoc, KnowledgeTopic } from "@/lib/models";

const SUBJECTS: SubjectCategory[] = [
  "Computer Science",
  "Engineering",
  "Business",
  "Medicine",
  "Science",
  "Humanities",
];
const COLORS: Course["color"][] = ["terracotta", "sage", "gold"];

export function slugifyTopic(topic: string): string {
  return topic.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "topic";
}

function masteryState(status: KnowledgeTopic["status"]): MasteryState {
  return status;
}

function topicsToConcepts(topics: KnowledgeTopic[]): Concept[] {
  return topics.map((topic) => ({
    id: slugifyTopic(topic.topic),
    name: topic.topic,
    mastery: topic.mastery,
    state: masteryState(topic.status),
  }));
}

/** Reconstructs the frontend Course shape from the courses/knowledgeProfiles/exams collections. */
export function mapCourseDoc(
  courseDoc: CourseDoc,
  topics: KnowledgeTopic[],
  latestExamDate: string | undefined,
  hasMaterials: boolean
): Course {
  const subject = SUBJECTS.includes(courseDoc.subject as SubjectCategory)
    ? (courseDoc.subject as SubjectCategory)
    : "Humanities";
  const color = COLORS.includes(courseDoc.color as Course["color"]) ? (courseDoc.color as Course["color"]) : "sage";
  const concepts = topicsToConcepts(topics);
  // confidenceLevel is a 1-5 self-reported scale, not 0-100 — only used as a fallback until real assessments exist.
  const progressPct = concepts.length
    ? Math.round(concepts.reduce((sum, c) => sum + c.mastery, 0) / concepts.length)
    : Math.max(0, Math.min(100, Math.round(((courseDoc.confidenceLevel ?? 0) / 5) * 100)));

  return {
    id: courseDoc._id,
    code: courseDoc.courseCode,
    name: courseDoc.courseName,
    professor: courseDoc.instructor,
    subject,
    color,
    concepts,
    examDate: latestExamDate,
    progressPct,
    hasMaterials,
    priority: courseDoc.priority,
  };
}

async function latestExamDateFor(courseId: string): Promise<string | undefined> {
  const exams = await getCollection<ExamDoc>("exams");
  if (!exams) return undefined;
  const upcoming = await exams.find({ courseId }).sort({ examDate: 1 }).limit(1).toArray();
  return upcoming[0]?.examDate;
}

/** Resolve a single course owned by the given student, joined with its knowledge profile and next exam. */
export async function getCourseForStudent(studentId: string, courseId: string): Promise<Course | null> {
  const courses = await getCollection<CourseDoc>("courses");
  if (!courses) return null;
  const courseDoc = await courses.findOne({ _id: courseId, studentId });
  if (!courseDoc) return null;

  const [knowledgeProfiles, materials, examDate] = await Promise.all([
    getCollection<KnowledgeProfileDoc>("knowledgeProfiles"),
    getCollection("materials"),
    latestExamDateFor(courseId),
  ]);
  const profile = await knowledgeProfiles?.findOne({ studentId, courseId });
  const materialCount = (await materials?.countDocuments({ courseId })) ?? 0;

  return mapCourseDoc(courseDoc, profile?.topics ?? [], examDate, materialCount > 0);
}

/** Resolve every course owned by the given student, joined with knowledge profiles and next exam dates. */
export async function getCoursesForStudent(studentId: string): Promise<Course[]> {
  const courses = await getCollection<CourseDoc>("courses");
  if (!courses) return [];
  const courseDocs = await courses.find({ studentId }).sort({ createdAt: 1 }).toArray();
  if (courseDocs.length === 0) return [];

  const [knowledgeProfiles, materials, exams] = await Promise.all([
    getCollection<KnowledgeProfileDoc>("knowledgeProfiles"),
    getCollection<{ courseId: string }>("materials"),
    getCollection<ExamDoc>("exams"),
  ]);
  const courseIds = courseDocs.map((c) => c._id);
  const [profiles, materialRows, examRows] = await Promise.all([
    knowledgeProfiles?.find({ studentId, courseId: { $in: courseIds } }).toArray() ?? [],
    materials?.find({ courseId: { $in: courseIds } }, { projection: { courseId: 1 } }).toArray() ?? [],
    exams?.find({ courseId: { $in: courseIds } }).sort({ examDate: 1 }).toArray() ?? [],
  ]);

  const profileByCourseId = new Map(profiles.map((p) => [p.courseId, p.topics]));
  const materialCountByCourseId = new Map<string, number>();
  for (const row of materialRows) {
    materialCountByCourseId.set(row.courseId, (materialCountByCourseId.get(row.courseId) ?? 0) + 1);
  }
  const nextExamByCourseId = new Map<string, string>();
  for (const exam of examRows) {
    if (!nextExamByCourseId.has(exam.courseId)) nextExamByCourseId.set(exam.courseId, exam.examDate);
  }

  return courseDocs.map((courseDoc) =>
    mapCourseDoc(
      courseDoc,
      profileByCourseId.get(courseDoc._id) ?? [],
      nextExamByCourseId.get(courseDoc._id),
      (materialCountByCourseId.get(courseDoc._id) ?? 0) > 0
    )
  );
}
