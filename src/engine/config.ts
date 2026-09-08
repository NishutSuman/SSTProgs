import type { Config, SubjectKey } from "./types";

/** Subject catalogue, mirrors the sheet (2 mandatory, 2 opt-in). */
export const SUBJECTS: { key: SubjectKey; label: string; type: "mandatory" | "opt_in" }[] = [
  { key: "DSA", label: "DSA 1", type: "mandatory" },
  { key: "ProbStats", label: "Prob Stats 2", type: "mandatory" },
  { key: "ML", label: "ML 3", type: "opt_in" },
  { key: "Eng", label: "Eng 1", type: "opt_in" },
];

/** Default RISK MODEL config, the exact numbers from your sheet's config block. */
export const DEFAULT_CONFIG: Config = {
  weights: { attendance: 0.4, academics: 0.3, remedial: 0.2, engagement: 0.1 },
  flags: { redCutoff: 50, amberCutoff: 35, autoRedFails: 2 },
  concern: { attendanceBelow: 65, gradeBelow: 50, engagementBelow: 40 },
  grade: { midWeight: 0.3, endWeight: 0.7 },
  attendance: { lateWeight: 0.5, penaltyThreshold: 40, penaltyPoints: 10 },
  sessions: { DSA: 9, ProbStats: 11, ML: 8, Eng: 11 },
  passMark: 40,
  totalEvents: 17,
  applyProjectUpgrade: false,
};
