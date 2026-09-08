// SST risk engine, pure functions. Same logic as the Google Sheet, driven by Config
// so the UI can retune the model and recompute live.

import type {
  RawStudent,
  StudentResult,
  Config,
  SubjectKey,
  RiskFlag,
  CohortSummary,
  AttendanceStatus,
} from "./types";
import { DEFAULT_CONFIG } from "./config";

const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

/** Attendance % for one subject: (Present + lateWeight*Late) / sessions * 100. */
export function subjectAttendancePct(
  statuses: AttendanceStatus[],
  sessions: number,
  cfg: Config = DEFAULT_CONFIG,
): number {
  const present = statuses.filter((s) => s === "P").length;
  const late = statuses.filter((s) => s === "Lt").length;
  return ((present + cfg.attendance.lateWeight * late) / sessions) * 100;
}

/** Grade for one subject: midWeight*mid + endWeight*(end - penalty),
 *  penalty applied when that subject's attendance is below the threshold. */
export function subjectGrade(
  mid: number,
  end: number,
  attendancePct: number | null,
  cfg: Config = DEFAULT_CONFIG,
): number {
  const penalty =
    attendancePct !== null && attendancePct < cfg.attendance.penaltyThreshold
      ? cfg.attendance.penaltyPoints
      : 0;
  return cfg.grade.midWeight * mid + cfg.grade.endWeight * (end - penalty);
}

/** The core risk formula as a standalone helper (weighted-deficit index, higher = worse).
 *  Exposed so it can be tested directly against the sheet's real rows. */
export function computeRiskScore(
  overallAttendance: number,
  overallGrade: number,
  remedial: boolean,
  engagement: number,
  cfg: Config = DEFAULT_CONFIG,
) {
  const attendance = cfg.weights.attendance * (100 - overallAttendance);
  const academics = cfg.weights.academics * (100 - overallGrade);
  const remedialC = cfg.weights.remedial * (remedial ? 100 : 0);
  const engagementC = cfg.weights.engagement * (100 - engagement);
  return {
    score: attendance + academics + remedialC + engagementC,
    breakdown: { attendance, academics, remedial: remedialC, engagement: engagementC },
  };
}

/** Compute the full tracker row for one student. */
export function computeStudent(raw: RawStudent, cfg: Config = DEFAULT_CONFIG): StudentResult {
  const subjectKeys = Object.keys(cfg.sessions) as SubjectKey[];

  // --- attendance per subject + session-weighted overall ---
  const attBySubject = new Map<SubjectKey, number | null>();
  let weightedPresent = 0;
  let weightedSessions = 0;
  for (const sub of subjectKeys) {
    const rec = raw.attendance.find((a) => a.subject === sub);
    if (!rec || rec.statuses.length === 0) {
      attBySubject.set(sub, null); // not enrolled (opt-in)
      continue;
    }
    const pct = subjectAttendancePct(rec.statuses, cfg.sessions[sub], cfg);
    attBySubject.set(sub, pct);
    const present = rec.statuses.filter((s) => s === "P").length;
    const late = rec.statuses.filter((s) => s === "Lt").length;
    weightedPresent += present + cfg.attendance.lateWeight * late;
    weightedSessions += cfg.sessions[sub];
  }
  const overallAttendance = weightedSessions > 0 ? (weightedPresent / weightedSessions) * 100 : 0;

  // --- grades per subject + overall + fails ---
  const subjects: StudentResult["subjects"] = [];
  const gradeVals: number[] = [];
  let fails = 0;
  for (const sub of subjectKeys) {
    const g = raw.grades.find((x) => x.subject === sub);
    const attPct = attBySubject.get(sub) ?? null;
    let grade: number | null = null;
    if (g) {
      grade = subjectGrade(g.mid, g.end, attPct, cfg);
      // ProbStats live-project upgrade (off by default to match the sheet).
      if (sub === "ProbStats" && cfg.applyProjectUpgrade && raw.liveProject?.completed && raw.liveProject.grade > grade) {
        grade = raw.liveProject.grade;
      }
      gradeVals.push(grade);
      if (grade < cfg.passMark) fails++;
    }
    subjects.push({
      subject: sub,
      attendancePct: attPct === null ? null : round(attPct),
      grade: grade === null ? null : round(grade),
    });
  }
  const overallGrade = gradeVals.length
    ? gradeVals.reduce((a, b) => a + b, 0) / gradeVals.length
    : 0;

  // --- engagement + remedial ---
  const engagement = (raw.eventsParticipated / cfg.totalEvents) * 100;
  const remedial = raw.remedialHistory.length > 0;

  // --- risk score + flag ---
  const { score, breakdown } = computeRiskScore(overallAttendance, overallGrade, remedial, engagement, cfg);
  let flag: RiskFlag;
  if (score >= cfg.flags.redCutoff || fails >= cfg.flags.autoRedFails) flag = "Red";
  else if (score >= cfg.flags.amberCutoff) flag = "Amber";
  else flag = "Green";

  // --- concern tags ---
  const concerns: string[] = [];
  if (overallAttendance < cfg.concern.attendanceBelow) concerns.push("Attendance");
  if (overallGrade < cfg.concern.gradeBelow) concerns.push("Academics");
  if (engagement < cfg.concern.engagementBelow) concerns.push("Engagement");
  if (remedial) concerns.push("Remedial History");

  // --- interventions by tier ---
  const interventions =
    flag === "Red"
      ? { remedial: "Mandatory", supervision: "Mandatory", liveProject: "Mandatory", mentor1on1: "Monthly (mandatory)" }
      : flag === "Amber"
      ? { remedial: "Mandatory", supervision: "Optional", liveProject: "Recommended", mentor1on1: "On request" }
      : { remedial: "-", supervision: "-", liveProject: "Recommended", mentor1on1: "-" };

  return {
    id: raw.id,
    batch: raw.batch,
    subjects,
    overallAttendance: round(overallAttendance),
    overallGrade: round(overallGrade),
    engagement: round(engagement),
    remedial,
    fails,
    riskScore: round(score),
    riskBreakdown: {
      attendance: round(breakdown.attendance),
      academics: round(breakdown.academics),
      remedial: round(breakdown.remedial),
      engagement: round(breakdown.engagement),
    },
    flag,
    concerns,
    interventions,
  };
}

/** Compute every student and the cohort risk distribution. */
export function computeCohort(students: RawStudent[], cfg: Config = DEFAULT_CONFIG): CohortSummary {
  const results = students.map((s) => computeStudent(s, cfg));
  return {
    total: results.length,
    red: results.filter((r) => r.flag === "Red").length,
    amber: results.filter((r) => r.flag === "Amber").length,
    green: results.filter((r) => r.flag === "Green").length,
    results,
  };
}
