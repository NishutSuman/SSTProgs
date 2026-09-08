// Core types for the SST risk engine.
// The engine is a set of pure functions: raw student data + config -> computed result.

export type SubjectKey = "DSA" | "ProbStats" | "ML" | "Eng";
export type AttendanceStatus = "P" | "A" | "Lt";
export type RiskFlag = "Red" | "Amber" | "Green";

/** All tunable constants live here, so the UI can retune the model live. */
export interface Config {
  /** Risk-score weights (fractions that sum to 1): attendance/academics/remedial/engagement. */
  weights: { attendance: number; academics: number; remedial: number; engagement: number };
  /** Flag cutoffs on the risk score, plus the auto-Red fail count. */
  flags: { redCutoff: number; amberCutoff: number; autoRedFails: number };
  /** Thresholds that raise a concern tag. */
  concern: { attendanceBelow: number; gradeBelow: number; engagementBelow: number };
  /** Grade weighting: mid vs end term. */
  grade: { midWeight: number; endWeight: number };
  /** Attendance rules: a "Late" counts as this fraction of Present; below the
   *  threshold attendance %, subtract penaltyPoints from that subject's end term. */
  attendance: { lateWeight: number; penaltyThreshold: number; penaltyPoints: number };
  /** Total sessions per subject (classes + workshops), the attendance denominator. */
  sessions: Record<SubjectKey, number>;
  /** A subject grade below this counts as a fail. */
  passMark: number;
  /** Total cultural/club events, the engagement denominator. */
  totalEvents: number;
  /** Whether a completed live-project grade can upgrade the ProbStats grade.
   *  The sheet describes this in the SOP but does not apply it, so default is false. */
  applyProjectUpgrade: boolean;
}

export interface SubjectAttendance {
  subject: SubjectKey;
  /** One status per session; length should match config.sessions[subject]. */
  statuses: AttendanceStatus[];
}

export interface SubjectGrade {
  subject: SubjectKey;
  mid: number;
  end: number;
}

/** Raw per-student input, the shape our ingestion layer will produce from the sheet or CSV. */
export interface RawStudent {
  id: string;
  batch: string;
  /** Only the subjects the student is enrolled in (opt-in handling by omission). */
  attendance: SubjectAttendance[];
  grades: SubjectGrade[];
  /** Count of events attended, 0..totalEvents. */
  eventsParticipated: number;
  /** Term-1 subjects the student took remedial in ([] if none). */
  remedialHistory: string[];
  /** For the ProbStats live-project grade upgrade. */
  liveProject?: { grade: number; completed: boolean };
}

export interface SubjectResult {
  subject: SubjectKey;
  /** null = not enrolled (opt-in). */
  attendancePct: number | null;
  grade: number | null;
}

export interface StudentResult {
  id: string;
  batch: string;
  subjects: SubjectResult[];
  overallAttendance: number;
  overallGrade: number;
  engagement: number;
  remedial: boolean;
  fails: number;
  riskScore: number;
  /** How much each factor contributed to the score, for the drill-down UI. */
  riskBreakdown: { attendance: number; academics: number; remedial: number; engagement: number };
  flag: RiskFlag;
  concerns: string[];
  interventions: { remedial: string; supervision: string; liveProject: string; mentor1on1: string };
}

export interface CohortSummary {
  total: number;
  red: number;
  amber: number;
  green: number;
  results: StudentResult[];
}
