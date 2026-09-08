// Derives dashboard aggregates from a computed cohort.
import type { CohortSummary } from "../engine/types";
import { SUBJECTS } from "../engine/config";

const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export interface Analytics {
  share: { red: number; amber: number; green: number };
  kpi: { avgAtt: number; avgGrade: number; failing: number; remedial: number };
  byBatch: { batch: string; total: number; Red: number; Amber: number; Green: number; avgAtt: number; avgGrade: number; remedial: number; failing: number }[];
  subjects: { subject: string; enrolled: number; avgAtt: number; avgGrade: number; passRate: number }[];
  attendanceBands: { band: string; count: number }[];
  concerns: { name: string; count: number }[];
  interventions: { name: string; Mandatory: number; Optional: number }[];
}

export function deriveAnalytics(cohort: CohortSummary): Analytics {
  const r = cohort.results;

  const batches = [...new Set(r.map((s) => s.batch))].sort();
  const byBatch = batches.map((b) => {
    const rows = r.filter((s) => s.batch === b);
    return {
      batch: `Batch ${b}`,
      total: rows.length,
      Red: rows.filter((s) => s.flag === "Red").length,
      Amber: rows.filter((s) => s.flag === "Amber").length,
      Green: rows.filter((s) => s.flag === "Green").length,
      avgAtt: round(avg(rows.map((s) => s.overallAttendance))),
      avgGrade: round(avg(rows.map((s) => s.overallGrade))),
      remedial: rows.filter((s) => s.remedial).length,
      failing: rows.filter((s) => s.fails > 0).length,
    };
  });

  const subjects = SUBJECTS.map((sub) => {
    const rows = r.map((s) => s.subjects.find((x) => x.subject === sub.key)).filter((x) => x && x.grade !== null) as { grade: number; attendancePct: number | null }[];
    const grades = rows.map((x) => x.grade);
    const atts = rows.map((x) => x.attendancePct).filter((x): x is number => x !== null);
    return {
      subject: sub.label,
      enrolled: rows.length,
      avgAtt: round(avg(atts)),
      avgGrade: round(avg(grades)),
      passRate: rows.length ? round((grades.filter((g) => g >= 40).length / rows.length) * 100) : 0,
    };
  });

  const bandsDef = [
    { band: "<40%", lo: -1, hi: 40 },
    { band: "40-60%", lo: 40, hi: 60 },
    { band: "60-75%", lo: 60, hi: 75 },
    { band: "75-85%", lo: 75, hi: 85 },
    { band: "85%+", lo: 85, hi: 1e9 },
  ];
  const attendanceBands = bandsDef.map((d) => ({ band: d.band, count: r.filter((s) => s.overallAttendance >= d.lo && s.overallAttendance < d.hi).length }));

  const concerns = ["Attendance", "Academics", "Engagement", "Remedial History"].map((name) => ({ name, count: r.filter((s) => s.concerns.includes(name)).length }));

  const interventions = [
    { name: "Remedial", Mandatory: r.filter((s) => s.interventions.remedial === "Mandatory").length, Optional: 0 },
    { name: "Supervision", Mandatory: r.filter((s) => s.interventions.supervision === "Mandatory").length, Optional: r.filter((s) => s.interventions.supervision === "Optional").length },
    { name: "Live Project", Mandatory: r.filter((s) => s.interventions.liveProject === "Mandatory").length, Optional: r.filter((s) => s.interventions.liveProject === "Recommended").length },
    { name: "Monthly 1:1", Mandatory: r.filter((s) => s.interventions.mentor1on1 === "Monthly (mandatory)").length, Optional: r.filter((s) => s.interventions.mentor1on1 === "On request").length },
  ];

  return {
    share: { red: cohort.red, amber: cohort.amber, green: cohort.green },
    kpi: {
      avgAtt: round(avg(r.map((s) => s.overallAttendance))),
      avgGrade: round(avg(r.map((s) => s.overallGrade))),
      failing: r.filter((s) => s.fails > 0).length,
      remedial: r.filter((s) => s.remedial).length,
    },
    byBatch,
    subjects,
    attendanceBands,
    concerns,
    interventions,
  };
}
