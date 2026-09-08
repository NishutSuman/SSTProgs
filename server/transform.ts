// Maps the raw Google Sheet tabs into RawStudent[] for the engine.
// Layouts confirmed against the live sheet (see scripts/inspect.ts): several tabs have a
// blank/legend row before the real header, GradeSheet has a two-row header, and an opt-in
// subject "not taken" shows as 0/0 (not blank).

import type { RawStudent, SubjectKey, AttendanceStatus, SubjectAttendance, SubjectGrade } from "../src/engine/types";

export const TABS = {
  batch: "Batch Details",
  attendance: { DSA: "DSA 1 Attn", ProbStats: "ProbStats 2 Attn", ML: "ML 3 Attn", Eng: "Eng 1 Attn" } as Record<SubjectKey, string>,
  grades: "GradeSheet",
  events: "Cultural Event Participation",
  remedial: "Term 1 - Remedial",
  projectEnrollment: "Live Projects Enrollment",
  projectGrading: "Project Grading",
  grievances: "Grievance Form Input",
};

export interface Grievance {
  studentId: string;
  classNo: string;
  subject: string;
  comment: string;
}

/** Grievance Form Input -> Grievance[]. Header row is "Student ID". */
export function transformGrievances(rows: string[][]): Grievance[] {
  const h = headerRowIndex(rows, "Student ID");
  if (h < 0) return [];
  return rows
    .slice(h + 1)
    .map((r) => ({ studentId: norm(r[0]), classNo: norm(r[1]), subject: norm(r[2]), comment: norm(r[3]) }))
    .filter((g) => g.studentId);
}

/** Subject label as it appears in the GradeSheet's subject row (row 0). */
const GRADE_LABEL: Record<SubjectKey, string> = { DSA: "dsa 1", ProbStats: "prob stats 2", ML: "ml 3", Eng: "eng 1" };
const SUBJECT_KEYS: SubjectKey[] = ["DSA", "ProbStats", "ML", "Eng"];
const MANDATORY: SubjectKey[] = ["DSA", "ProbStats"];

const norm = (s: unknown) => String(s ?? "").trim();
const lower = (s: unknown) => norm(s).toLowerCase();
const num = (s: unknown) => {
  const n = Number(norm(s));
  return Number.isFinite(n) ? n : 0;
};
/** Index of the first row whose first cell (trimmed) matches `first`. */
const headerRowIndex = (rows: string[][], first: string) =>
  rows.findIndex((r) => lower(r[0]) === first.toLowerCase());

/** Attendance tab -> Map<studentId, statuses[]>. Header row is "Student", data follows. */
function parseAttendance(rows: string[][]): Map<string, AttendanceStatus[]> {
  const map = new Map<string, AttendanceStatus[]>();
  const h = headerRowIndex(rows, "Student");
  if (h < 0) return map;
  for (const row of rows.slice(h + 1)) {
    const id = norm(row[0]);
    if (!id) continue;
    const statuses = row.slice(1).map(norm).filter((v): v is AttendanceStatus => v === "P" || v === "A" || v === "Lt");
    if (statuses.length) map.set(id, statuses);
  }
  return map;
}

/** GradeSheet (two-row header) -> Map<studentId, Map<subject, {mid,end}>>.
 *  Opt-in subjects with 0/0 are treated as not taken (excluded). */
function parseGrades(rows: string[][]): Map<string, Map<SubjectKey, { mid: number; end: number }>> {
  const map = new Map<string, Map<SubjectKey, { mid: number; end: number }>>();
  const studentRow = headerRowIndex(rows, "Student");
  if (studentRow < 1) return map;
  const labelRow = rows[studentRow - 1].map(lower); // subject labels sit one row above "Student"

  const cols: Partial<Record<SubjectKey, { mid: number; end: number }>> = {};
  for (const key of SUBJECT_KEYS) {
    const col = labelRow.findIndex((c) => c.includes(GRADE_LABEL[key]));
    if (col >= 0) cols[key] = { mid: col, end: col + 1 }; // Mid-term col, End-term is the next col
  }

  for (const row of rows.slice(studentRow + 1)) {
    const id = norm(row[0]);
    if (!id) continue;
    const perSubject = new Map<SubjectKey, { mid: number; end: number }>();
    for (const key of SUBJECT_KEYS) {
      const c = cols[key];
      if (!c) continue;
      const mid = num(row[c.mid]);
      const end = num(row[c.end]);
      const optIn = !MANDATORY.includes(key);
      if (optIn && mid === 0 && end === 0) continue; // not taken
      perSubject.set(key, { mid, end });
    }
    map.set(id, perSubject);
  }
  return map;
}

/** Cultural events -> Map<studentId, count participated>. */
function parseEvents(rows: string[][]): Map<string, number> {
  const map = new Map<string, number>();
  const h = headerRowIndex(rows, "Student");
  if (h < 0) return map;
  for (const row of rows.slice(h + 1)) {
    const id = norm(row[0]);
    if (!id) continue;
    map.set(id, row.slice(1).reduce((acc, c) => acc + (num(c) >= 1 ? 1 : 0), 0));
  }
  return map;
}

/** Term-1 remedial -> Map<studentId, subject names[]>. Header row lists the term-1 subjects. */
function parseRemedial(rows: string[][]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const h = rows.findIndex((r) => r.some((c) => norm(c) !== "")); // first non-empty row is the header
  if (h < 0) return map;
  const headers = rows[h].map(norm);
  for (const row of rows.slice(h + 1)) {
    row.forEach((cell, col) => {
      const id = norm(cell);
      if (!id) return;
      const subject = headers[col] || `col${col}`;
      map.set(id, [...(map.get(id) ?? []), subject]);
    });
  }
  return map;
}

/** Live projects -> Map<studentId, {grade, completed}> for the ProbStats upgrade. */
function parseLiveProjects(enroll: string[][], grading: string[][]): Map<string, { grade: number; completed: boolean }> {
  const projects = new Map<string, { grade: number; completed: boolean }>();
  const gh = headerRowIndex(grading, "Project Name");
  for (const row of grading.slice(gh < 0 ? 1 : gh + 1)) {
    const name = norm(row[0]);
    if (!name) continue;
    projects.set(name, { grade: num(row[2]), completed: lower(row[1]).includes("complete") });
  }
  const map = new Map<string, { grade: number; completed: boolean }>();
  const eh = headerRowIndex(enroll, "Student");
  for (const row of enroll.slice(eh < 0 ? 1 : eh + 1)) {
    const id = norm(row[0]);
    const proj = norm(row[1]);
    if (!id || !proj) continue;
    const p = projects.get(proj);
    if (p) map.set(id, p);
  }
  return map;
}

export interface RawTabs {
  batch: string[][];
  attendance: Record<SubjectKey, string[][]>;
  grades: string[][];
  events: string[][];
  remedial: string[][];
  projectEnrollment: string[][];
  projectGrading: string[][];
}

export function transform(tabs: RawTabs): RawStudent[] {
  const attendanceMaps = {} as Record<SubjectKey, Map<string, AttendanceStatus[]>>;
  for (const key of SUBJECT_KEYS) attendanceMaps[key] = parseAttendance(tabs.attendance[key] ?? []);
  const grades = parseGrades(tabs.grades);
  const events = parseEvents(tabs.events);
  const remedial = parseRemedial(tabs.remedial);
  const liveProjects = parseLiveProjects(tabs.projectEnrollment, tabs.projectGrading);

  const students: RawStudent[] = [];
  for (const row of tabs.batch.slice(1)) {
    // Batch Details: [Batch, Student Name]
    const batch = norm(row[0]);
    const id = norm(row[1]);
    if (!id) continue;

    const gr = grades.get(id) ?? new Map<SubjectKey, { mid: number; end: number }>();
    const enrolled: SubjectKey[] = SUBJECT_KEYS.filter((k) => MANDATORY.includes(k) || gr.has(k));

    const attendance: SubjectAttendance[] = [];
    const gradeList: SubjectGrade[] = [];
    for (const key of enrolled) {
      const st = attendanceMaps[key].get(id);
      if (st && st.length) attendance.push({ subject: key, statuses: st });
      const g = gr.get(key);
      gradeList.push({ subject: key, mid: g?.mid ?? 0, end: g?.end ?? 0 });
    }

    students.push({
      id,
      batch,
      attendance,
      grades: gradeList,
      eventsParticipated: events.get(id) ?? 0,
      remedialHistory: remedial.get(id) ?? [],
      liveProject: liveProjects.get(id),
    });
  }
  return students;
}
