// Generates a realistic 299-student seed so the UI works before live sync.
// Real data replaces this when you run `npm run sync` against the Google Sheet.
// Deterministic (seeded), so the demo is stable.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RawStudent, SubjectKey, AttendanceStatus } from "../src/engine/types";
import { DEFAULT_CONFIG } from "../src/engine/config";
import { computeCohort } from "../src/engine/engine";

// --- seeded RNG (mulberry32) ---
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260909);
const between = (a: number, b: number) => a + (b - a) * rnd();
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

const batches = [
  { name: "A", count: 100 },
  { name: "B", count: 99 },
  { name: "C", count: 100 },
];
const MANDATORY: SubjectKey[] = ["DSA", "ProbStats"];
const term1Subjects = ["ML 2", "Intro to CS", "Prob Stats 1"];

function attendanceFor(sessions: number, diligence: number): AttendanceStatus[] {
  const pPresent = clamp(0.48 + 0.46 * diligence, 0, 1);
  const out: AttendanceStatus[] = [];
  for (let i = 0; i < sessions; i++) {
    const r = rnd();
    if (r < pPresent) out.push("P");
    else if (r < pPresent + 0.1) out.push("Lt");
    else out.push("A");
  }
  return out;
}

const students: RawStudent[] = [];
let n = 100;
for (const b of batches) {
  for (let i = 0; i < b.count; i++) {
    const id = `L${n++}`;
    // hidden traits (sqrt skews toward higher diligence, so most students are okay)
    const diligence = Math.pow(rnd(), 0.62);
    const engagementTrait = clamp(diligence * 0.6 + rnd() * 0.55, 0, 1);

    // enrolled subjects: mandatory + opt-in
    const enrolled: SubjectKey[] = [...MANDATORY];
    if (rnd() < 0.55) enrolled.push("ML");
    if (rnd() < 0.5) enrolled.push("Eng");

    const attendance = enrolled.map((sub) => ({
      subject: sub,
      statuses: attendanceFor(DEFAULT_CONFIG.sessions[sub], diligence),
    }));

    const grades = enrolled.map((sub) => {
      const base = 40 + 47 * diligence;
      return {
        subject: sub,
        mid: Math.round(clamp(base + between(-12, 12))),
        end: Math.round(clamp(base + between(-12, 14))),
      };
    });

    const eventsParticipated = Math.round(clamp(engagementTrait * 17 + between(-2, 2), 0, 17));

    // ~30% took a term-1 remedial, more likely if low diligence
    const remedialHistory: string[] = [];
    if (rnd() < 0.45 - 0.25 * diligence) {
      remedialHistory.push(term1Subjects[Math.floor(rnd() * term1Subjects.length)]);
    }

    // ~13% in a live project; some completed with a grade (ProbStats upgrade path)
    let liveProject: RawStudent["liveProject"] | undefined;
    if (rnd() < 0.134) {
      const completed = rnd() < 0.7;
      liveProject = { completed, grade: completed ? Math.round(between(55, 95)) : 0 };
    }

    students.push({ id, batch: b.name, attendance, grades, eventsParticipated, remedialHistory, liveProject });
  }
}

// write it
const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, "../src/data/students.json");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(students, null, 2));

// report the resulting distribution
const cohort = computeCohort(students);
const pct = (x: number) => `${Math.round((x / cohort.total) * 100)}%`;
console.log(`\nSeed written: ${outPath}`);
console.log(`Students: ${cohort.total} (A/B/C = ${batches.map((b) => b.count).join("/")})`);
console.log(`Risk mix -> Red ${cohort.red} (${pct(cohort.red)}), Amber ${cohort.amber} (${pct(cohort.amber)}), Green ${cohort.green} (${pct(cohort.green)})`);
console.log(`(Target from real sheet: Red 38 / Amber 90 / Green 171)\n`);
