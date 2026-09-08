import { useMemo, useState } from "react";
import type { CohortSummary, StudentResult } from "../engine/types";
import { GRIEVANCES } from "../lib/data";
import { ownerForBatch } from "../lib/staff";
import { Card, FlagBadge } from "../components/ui";

export function GrievancesPage({ cohort, onSelectStudent }: { cohort: CohortSummary; onSelectStudent: (s: StudentResult) => void }) {
  const [subject, setSubject] = useState("All");
  const byId = useMemo(() => new Map(cohort.results.map((s) => [s.id, s])), [cohort]);

  const subjects = useMemo(() => ["All", ...[...new Set(GRIEVANCES.map((g) => g.subject))].sort()], []);
  const bySubject = useMemo(() => {
    const m = new Map<string, number>();
    for (const g of GRIEVANCES) m.set(g.subject, (m.get(g.subject) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, []);
  const rows = GRIEVANCES.filter((g) => (subject === "All" ? true : g.subject === subject));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Grievances</h2>
        <p className="text-sm text-slate-500">{GRIEVANCES.length} student grievances from the sheet, linked to each student's risk.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {bySubject.map(([s, n]) => (
          <span key={s} className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-sm">
            <span className="font-semibold text-slate-200">{s}</span>
            <span className="ml-2 text-slate-500">{n}</span>
          </span>
        ))}
      </div>

      <Card
        title="All grievances"
        right={
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-200">
            {subjects.map((s) => (
              <option key={s} value={s}>{s === "All" ? "All subjects" : s}</option>
            ))}
          </select>
        }
      >
        <div className="scroll-thin max-h-[560px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-900 text-left text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Student</th>
                <th className="px-3 py-2 font-semibold">Flag</th>
                <th className="px-3 py-2 font-semibold">Class</th>
                <th className="px-3 py-2 font-semibold">Subject</th>
                <th className="px-3 py-2 font-semibold">Assigned to (L1)</th>
                <th className="px-3 py-2 font-semibold">Comment</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g, i) => {
                const s = byId.get(g.studentId);
                return (
                  <tr key={i} className="border-t border-slate-800/70 hover:bg-slate-800/40">
                    <td className="px-3 py-2">
                      {s ? (
                        <button onClick={() => onSelectStudent(s)} className="font-semibold text-indigo-300 hover:underline">{g.studentId}</button>
                      ) : (
                        <span className="font-semibold text-slate-300">{g.studentId}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{s ? <FlagBadge flag={s.flag} /> : <span className="text-slate-600">-</span>}</td>
                    <td className="px-3 py-2 text-slate-400">{g.classNo}</td>
                    <td className="px-3 py-2 text-slate-300">{g.subject}</td>
                    <td className="px-3 py-2 text-slate-400">
                      {(() => {
                        const owner = s ? ownerForBatch(s.batch) : undefined;
                        return owner ? <span title={owner.email}>{owner.name}</span> : <span className="text-slate-600">-</span>;
                      })()}
                    </td>
                    <td className="px-3 py-2 text-slate-400">{g.comment}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
