import { useMemo, useState } from "react";
import type { CohortSummary, RiskFlag, StudentResult } from "../engine/types";
import { STUDENTS, GRIEVANCES } from "../lib/data";
import { Card } from "../components/ui";
import { StudentTable } from "../components/StudentTable";
import { StudentDetail } from "../components/StudentDetail";

export function StudentsPage({ cohort, selected, onSelect }: { cohort: CohortSummary; selected: StudentResult | null; onSelect: (s: StudentResult | null) => void }) {
  const [batch, setBatch] = useState("All");
  const [flag, setFlag] = useState("All");
  const [search, setSearch] = useState("");

  const batches = useMemo(() => ["All", ...[...new Set(cohort.results.map((s) => s.batch))].sort()], [cohort]);
  const rows = useMemo(
    () =>
      cohort.results
        .filter((s) => (batch === "All" ? true : s.batch === batch))
        .filter((s) => (flag === "All" ? true : s.flag === (flag as RiskFlag)))
        .filter((s) => (search ? s.id.toLowerCase().includes(search.toLowerCase()) : true))
        .sort((a, b) => b.riskScore - a.riskScore),
    [cohort, batch, flag, search],
  );

  const raw = selected ? STUDENTS.find((s) => s.id === selected.id) : null;
  const studentGrievances = selected ? GRIEVANCES.filter((g) => g.studentId === selected.id) : [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Students</h2>
        <p className="text-sm text-slate-500">Search by ID and open any student to see their raw sheet data and computed risk.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* list */}
        <div className="xl:col-span-3">
          <Card title="Student tracker" subtitle={`${rows.length} students`}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student ID (e.g. L118)"
                className="w-52 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
              />
              <select value={batch} onChange={(e) => setBatch(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-200">
                {batches.map((b) => (
                  <option key={b} value={b}>{b === "All" ? "All batches" : `Batch ${b}`}</option>
                ))}
              </select>
              <select value={flag} onChange={(e) => setFlag(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-200">
                {["All", "Red", "Amber", "Green"].map((f) => (
                  <option key={f} value={f}>{f === "All" ? "All flags" : f}</option>
                ))}
              </select>
            </div>
            <StudentTable rows={rows} onSelect={onSelect} selectedId={selected?.id} />
          </Card>
        </div>

        {/* detail */}
        <div className="xl:col-span-2">
          <Card title="Student detail" subtitle={selected ? "Raw sheet data and computed risk" : undefined}>
            {selected && raw ? (
              <div className="scroll-thin max-h-[620px] overflow-auto pr-1">
                <StudentDetail raw={raw} result={selected} grievances={studentGrievances} />
              </div>
            ) : (
              <div className="grid h-64 place-items-center text-center text-sm text-slate-500">
                Select a student from the list to see their raw attendance, grades, engagement, and grievances.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
