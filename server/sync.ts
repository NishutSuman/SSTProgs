// Live sync: fetch the Google Sheet -> transform -> compute -> write students.json,
// write results back to the sheet, and trigger the n8n at-risk workflow for new Reds.
//
// Run:  npm run sync           (full sync)
//       npm run sync -- --dump (just print each tab's headers, to check mappings)

import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { readTab, writeTab } from "./sheets";
import { TABS, transform, transformGrievances, type RawTabs } from "./transform";
import { computeCohort } from "../src/engine/engine";
import { DEFAULT_CONFIG } from "../src/engine/config";
import type { SubjectKey } from "../src/engine/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../src/data");
const STUDENTS_PATH = resolve(DATA_DIR, "students.json");
const PREV_REDS_PATH = resolve(DATA_DIR, "prev-reds.json");
const RESULTS_TAB = "Risk Results (app)";

const SUBJECT_KEYS: SubjectKey[] = ["DSA", "ProbStats", "ML", "Eng"];

async function fetchTabs(): Promise<RawTabs> {
  const [batch, grades, events, remedial, projectEnrollment, projectGrading, dsa, ps, ml, eng] = await Promise.all([
    readTab(TABS.batch),
    readTab(TABS.grades),
    readTab(TABS.events),
    readTab(TABS.remedial),
    readTab(TABS.projectEnrollment),
    readTab(TABS.projectGrading),
    readTab(TABS.attendance.DSA),
    readTab(TABS.attendance.ProbStats),
    readTab(TABS.attendance.ML),
    readTab(TABS.attendance.Eng),
  ]);
  return {
    batch,
    grades,
    events,
    remedial,
    projectEnrollment,
    projectGrading,
    attendance: { DSA: dsa, ProbStats: ps, ML: ml, Eng: eng },
  };
}

async function dumpHeaders() {
  const names = [TABS.batch, TABS.grades, TABS.events, TABS.remedial, TABS.projectEnrollment, TABS.projectGrading, ...Object.values(TABS.attendance)];
  for (const name of names) {
    try {
      const rows = await readTab(name);
      console.log(`\n[${name}] rows=${rows.length}`);
      console.log("  headers:", (rows[0] ?? []).join(" | "));
      if (rows[1]) console.log("  row1:   ", rows[1].join(" | "));
    } catch (e) {
      console.log(`\n[${name}] ERROR: ${(e as Error).message}`);
    }
  }
}

async function triggerN8n(newReds: { id: string; batch: string; riskScore: number; concerns: string[] }[]) {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) {
    console.log("N8N_WEBHOOK_URL not set, skipping at-risk alert.");
    return;
  }
  if (newReds.length === 0) {
    console.log("No new Red students, no alert sent.");
    return;
  }
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "at_risk", count: newReds.length, students: newReds }),
    });
    console.log(`Sent at-risk alert to n8n for ${newReds.length} new Red student(s).`);
  } catch (e) {
    console.log(`Failed to reach n8n webhook: ${(e as Error).message}`);
  }
}

async function main() {
  if (process.argv.includes("--dump")) {
    await dumpHeaders();
    return;
  }

  console.log("Fetching sheet tabs...");
  const tabs = await fetchTabs();
  const students = transform(tabs);
  console.log(`Transformed ${students.length} students.`);

  const cohort = computeCohort(students, DEFAULT_CONFIG);
  console.log(`Risk mix -> Red ${cohort.red} / Amber ${cohort.amber} / Green ${cohort.green}  (target 38 / 90 / 171)`);

  // write students.json for the UI
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STUDENTS_PATH, JSON.stringify(students, null, 2));
  console.log(`Wrote ${STUDENTS_PATH}`);

  // grievances for the support view
  const grievances = transformGrievances(await readTab(TABS.grievances));
  writeFileSync(resolve(DATA_DIR, "grievances.json"), JSON.stringify(grievances, null, 2));
  console.log(`Wrote ${grievances.length} grievances.`);

  // detect NEW reds vs last sync
  const prevReds: string[] = existsSync(PREV_REDS_PATH) ? JSON.parse(readFileSync(PREV_REDS_PATH, "utf8")) : [];
  const currentReds = cohort.results.filter((r) => r.flag === "Red").map((r) => r.id);
  const newReds = cohort.results
    .filter((r) => r.flag === "Red" && !prevReds.includes(r.id))
    .map((r) => ({ id: r.id, batch: r.batch, riskScore: r.riskScore, concerns: r.concerns }));
  writeFileSync(PREV_REDS_PATH, JSON.stringify(currentReds, null, 2));

  // write results back to the sheet
  try {
    const header = ["Student", "Batch", "Overall Att%", "Overall Grade", "Engagement%", "Risk Score", "Flag", "Concern Areas"];
    const values: (string | number)[][] = [
      header,
      ...cohort.results.map((r) => [r.id, r.batch, r.overallAttendance, r.overallGrade, r.engagement, r.riskScore, r.flag, r.concerns.join(", ")]),
    ];
    await writeTab(RESULTS_TAB, values);
    console.log(`Wrote results back to the sheet tab "${RESULTS_TAB}".`);
  } catch (e) {
    console.log(`Write-back skipped: ${(e as Error).message}`);
  }

  // fire the n8n at-risk workflow
  await triggerN8n(newReds);

  console.log("Sync complete.");
}

main().catch((e) => {
  console.error("\nSync failed:", e.message);
  process.exit(1);
});
