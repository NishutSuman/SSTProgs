// Validation for the risk engine. Proves the logic matches the sheet's real rows
// and that the attendance/grade/flag rules behave correctly.
// Run: npm run validate

import { DEFAULT_CONFIG } from "./config";
import {
  subjectAttendancePct,
  subjectGrade,
  computeRiskScore,
  computeStudent,
  computeCohort,
} from "./engine";
import type { RawStudent, AttendanceStatus } from "./types";

let passed = 0;
let failed = 0;

function ok(name: string, cond: boolean, detail = "") {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}   ${detail}`);
  }
}
function close(a: number, b: number, tol = 0.15) {
  return Math.abs(a - b) <= tol;
}
const rep = (s: AttendanceStatus, n: number): AttendanceStatus[] => Array<AttendanceStatus>(n).fill(s);

console.log("\n=== Risk engine validation ===\n");

// --- 1. Attendance rule: (P + 0.5*Lt) / sessions * 100 ---
console.log("1. Attendance calculation");
ok(
  "9 sessions, 5 Present + 2 Late = 66.67%",
  close(subjectAttendancePct([...rep("P", 5), ...rep("Lt", 2), ...rep("A", 2)], 9), 66.67),
);
ok("11 sessions, all Present = 100%", close(subjectAttendancePct(rep("P", 11), 11), 100));

// --- 2. Grade rule: 0.3*mid + 0.7*(end - penalty), penalty if att < 40 ---
console.log("\n2. Grade calculation");
ok("no penalty (att 80): 0.3*70 + 0.7*80 = 77", close(subjectGrade(70, 80, 80), 77));
ok("penalty (att 30): 0.3*70 + 0.7*(80-10) = 70", close(subjectGrade(70, 80, 30), 70));

// --- 3. Risk formula vs the SHEET'S REAL ROWS (the key proof) ---
console.log("\n3. Risk score vs real sheet rows");
const row1 = computeRiskScore(53.6, 43.7, true, 58.5); // sheet row -> 59.6 Red
ok("att 53.6, grade 43.7, remedial, eng 58.5 -> 59.6", close(row1.score, 59.6, 0.2), `got ${row1.score.toFixed(2)}`);
const row2 = computeRiskScore(88.5, 77.6, false, 76.2); // sheet row -> 13.7 Green
ok("att 88.5, grade 77.6, no remedial, eng 76.2 -> 13.7", close(row2.score, 13.7, 0.2), `got ${row2.score.toFixed(2)}`);

// --- 4. Full student computation: a clear Green and a clear Red ---
console.log("\n4. Full student computation");

const green: RawStudent = {
  id: "G1",
  batch: "A",
  attendance: [
    { subject: "DSA", statuses: [...rep("P", 8), ...rep("Lt", 1)] }, // 94.4%
    { subject: "ProbStats", statuses: [...rep("P", 10), ...rep("A", 1)] }, // 90.9%
  ],
  grades: [
    { subject: "DSA", mid: 80, end: 85 },
    { subject: "ProbStats", mid: 75, end: 80 },
  ],
  eventsParticipated: 10,
  remedialHistory: [],
};
const gr = computeStudent(green);
ok("Green: flag = Green", gr.flag === "Green", `got ${gr.flag}`);
ok("Green: 0 fails", gr.fails === 0);
ok("Green: overall attendance ~92.5", close(gr.overallAttendance, 92.5, 0.3), `got ${gr.overallAttendance}`);
ok("Green: overall grade ~81", close(gr.overallGrade, 81, 0.3), `got ${gr.overallGrade}`);
ok("Green: opt-in ML/Eng excluded (null)", gr.subjects.find((s) => s.subject === "ML")?.attendancePct === null);

const red: RawStudent = {
  id: "R1",
  batch: "B",
  attendance: [
    { subject: "DSA", statuses: [...rep("P", 3), ...rep("A", 6)] }, // 33.3%
    { subject: "ProbStats", statuses: [...rep("P", 4), ...rep("A", 7)] }, // 36.4%
  ],
  grades: [
    { subject: "DSA", mid: 40, end: 45 },
    { subject: "ProbStats", mid: 30, end: 35 },
  ],
  eventsParticipated: 2,
  remedialHistory: ["Prob Stats 1"],
};
const rd = computeStudent(red);
ok("Red: flag = Red", rd.flag === "Red", `got ${rd.flag}`);
ok("Red: 2 fails (grade < 40)", rd.fails === 2, `got ${rd.fails}`);
ok("Red: risk score ~75.4", close(rd.riskScore, 75.4, 0.3), `got ${rd.riskScore}`);
ok("Red: 4 concern areas", rd.concerns.length === 4, `got ${rd.concerns.join(",")}`);
ok("Red: interventions mandatory", rd.interventions.supervision === "Mandatory");

// --- 5. Auto-Red rule: 2+ fails forces Red even when the score is low ---
console.log("\n5. Auto-Red on 2+ fails");
const autoRed: RawStudent = {
  id: "AR1",
  batch: "C",
  attendance: [
    { subject: "DSA", statuses: rep("P", 9) }, // 100%
    { subject: "ProbStats", statuses: rep("P", 11) }, // 100%
  ],
  grades: [
    { subject: "DSA", mid: 30, end: 35 }, // 33.5 -> fail (< 40)
    { subject: "ProbStats", mid: 30, end: 38 }, // 35.6 -> fail (< 40)
  ],
  eventsParticipated: 15,
  remedialHistory: [],
};
const ar = computeStudent(autoRed);
ok("AutoRed: flag = Red despite low score", ar.flag === "Red", `got ${ar.flag}`);
ok("AutoRed: score is below Red cutoff", ar.riskScore < DEFAULT_CONFIG.flags.redCutoff, `score ${ar.riskScore}`);

// --- 6. Cohort distribution ---
console.log("\n6. Cohort distribution");
const cohort = computeCohort([green, red, autoRed]);
ok("cohort: 1 Green, 2 Red, 0 Amber", cohort.green === 1 && cohort.red === 2 && cohort.amber === 0,
  `G${cohort.green}/A${cohort.amber}/R${cohort.red}`);

// --- Sample output table ---
console.log("\n=== Sample computed rows ===");
console.table(
  cohort.results.map((r) => ({
    id: r.id,
    batch: r.batch,
    att: r.overallAttendance,
    grade: r.overallGrade,
    eng: r.engagement,
    fails: r.fails,
    score: r.riskScore,
    flag: r.flag,
    concerns: r.concerns.join(", ") || "-",
  })),
);

console.log(`\n=== ${passed} passed, ${failed} failed ===\n`);
process.exit(failed === 0 ? 0 : 1);
