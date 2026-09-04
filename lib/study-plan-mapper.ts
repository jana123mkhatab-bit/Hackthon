import "server-only";
import type { StudySession } from "@/lib/types";
import type { StudySessionDoc } from "@/lib/models";

const ACTIVITY_LABEL: Record<StudySession["kind"], string> = {
  focus: "Focused Study",
  practice: "Practice Problems",
  review: "Review",
  assessment: "Practice Assessment",
  break: "Break",
};

export function toStudySessionDocs(sessions: StudySession[]): StudySessionDoc[] {
  return sessions.map((s) => ({
    courseId: s.courseId,
    topic: s.conceptName,
    startTime: `${s.day} ${s.time}`,
    duration: s.minutes,
    activity: ACTIVITY_LABEL[s.kind] ?? "Focused Study",
    reason: s.kind === "assessment" ? "Upcoming exam readiness check" : "Knowledge gap detected",
    status: s.done ? "done" : "pending",
    day: s.day,
    time: s.time,
    kind: s.kind,
  }));
}

export function toStudySessions(docs: StudySessionDoc[]): StudySession[] {
  return docs.map((doc, index) => ({
    id: `session-${index + 1}`,
    day: doc.day ?? doc.startTime.split(" ")[0] ?? "Monday",
    time: doc.time ?? doc.startTime.split(" ").slice(1).join(" ") ?? "4:00 PM",
    courseId: doc.courseId,
    conceptName: doc.topic,
    minutes: doc.duration,
    kind: doc.kind ?? "focus",
    done: doc.status === "done",
  }));
}
