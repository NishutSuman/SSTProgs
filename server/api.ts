// Thin API the UI proxies to and n8n pulls from.
// Run: npm run server   (port 8787)
import express from "express";
import cors from "cors";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { computeCohort } from "../src/engine/engine";
import { DEFAULT_CONFIG } from "../src/engine/config";
import type { RawStudent } from "../src/engine/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STUDENTS_PATH = resolve(__dirname, "../src/data/students.json");

function loadStudents(): RawStudent[] {
  if (!existsSync(STUDENTS_PATH)) return [];
  return JSON.parse(readFileSync(STUDENTS_PATH, "utf8"));
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/config", (_req, res) => res.json(DEFAULT_CONFIG));

/** Full computed cohort, what n8n or the UI can read. */
app.get("/api/cohort", (_req, res) => {
  const cohort = computeCohort(loadStudents(), DEFAULT_CONFIG);
  res.json(cohort);
});

/** At-risk students for n8n (alerts, calendar, 1:1). ?flag=Red|Amber (default Red). */
app.get("/api/at-risk", (req, res) => {
  const flag = (req.query.flag as string) || "Red";
  const cohort = computeCohort(loadStudents(), DEFAULT_CONFIG);
  const students = cohort.results.filter((r) => r.flag === flag);
  res.json({ flag, count: students.length, students });
});

const PORT = Number(process.env.PORT) || 8787;
app.listen(PORT, () => console.log(`SST API on http://localhost:${PORT}`));
