import type { RawStudent, StudentResult, AttendanceStatus } from "../engine/types";
import { SUBJECTS } from "../engine/config";
import type { Grievance } from "../lib/data";
import { ownerForBatch } from "../lib/staff";
import { FlagBadge } from "./ui";

const STATUS_STYLE: Record<AttendanceStatus, string> = {
  P: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  A: "bg-red-500/15 text-red-300 ring-red-500/30",
  Lt: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
};

const BREAKDOWN = [
  { key: "attendance", label: "Attendance", color: "#f87171" },
  { key: "academics", label: "Academics", color: "#60a5fa" },
  { key: "remedial", label: "Remedial history", color: "#a78bfa" },
  { key: "engagement", label: "Engagement", color: "#38bdf8" },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">{title}</h4>
      {children}
    </div>
  );
}

export function StudentDetail({ raw, result, grievances }: { raw: RawStudent; result: StudentResult; grievances: Grievance[] }) {
  const maxC = Math.max(...BREAKDOWN.map((b) => result.riskBreakdown[b.key]), 1);
  const label = (k: string) => SUBJECTS.find((s) => s.key === k)?.label ?? k;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xl font-extrabold text-slate-50">{raw.id}</h3>
          <FlagBadge flag={result.flag} />
          <span className="text-sm text-slate-500">Batch {raw.batch}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-slate-50">{result.riskScore}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">risk score</div>
        </div>
      </div>

      {/* risk breakdown */}
      <Section title="Why this flag, by factor">
        <div className="space-y-2">
          {BREAKDOWN.map((b) => {
            const v = result.riskBreakdown[b.key];
            return (
              <div key={b.key}>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{b.label}</span>
                  <span className="font-semibold tabular-nums text-slate-200">{v}</span>
                </div>
                <div className="mt-0.5 h-2 w-full rounded-full bg-slate-800">
                  <div className="h-2 rounded-full" style={{ width: `${(v / maxC) * 100}%`, background: b.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* RAW attendance, session by session */}
      <Section title="Raw attendance (from sheet)">
        <div className="space-y-2.5">
          {raw.attendance.map((a) => {
            const computed = result.subjects.find((s) => s.subject === a.subject)?.attendancePct;
            return (
              <div key={a.subject}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{label(a.subject)}</span>
                  <span className="tabular-nums text-slate-400">{computed}% ({a.statuses.length} sessions)</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {a.statuses.map((st, i) => (
                    <span key={i} className={`grid h-6 w-6 place-items-center rounded text-[10px] font-bold ring-1 ${STATUS_STYLE[st]}`} title={`Session ${i + 1}: ${st}`}>
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* RAW grades */}
      <Section title="Raw grades (from sheet)">
        <div className="overflow-hidden rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-left text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Subject</th>
                <th className="px-3 py-2 text-right font-semibold">Mid</th>
                <th className="px-3 py-2 text-right font-semibold">End</th>
                <th className="px-3 py-2 text-right font-semibold">Computed</th>
              </tr>
            </thead>
            <tbody>
              {raw.grades.map((g) => {
                const computed = result.subjects.find((s) => s.subject === g.subject)?.grade;
                return (
                  <tr key={g.subject} className="border-t border-slate-800/70">
                    <td className="px-3 py-2 text-slate-300">{label(g.subject)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-400">{g.mid}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-400">{g.end}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {computed !== null && computed !== undefined && computed < 40 ? <span className="font-semibold text-red-400">{computed}</span> : <span className="text-slate-200">{computed}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* other raw signals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-800 p-3">
          <div className="text-[11px] uppercase text-slate-500">Engagement</div>
          <div className="text-sm font-semibold text-slate-200">{raw.eventsParticipated} / 17 events · {result.engagement}%</div>
        </div>
        <div className="rounded-lg border border-slate-800 p-3">
          <div className="text-[11px] uppercase text-slate-500">Remedial history</div>
          <div className="text-sm font-semibold text-slate-200">{raw.remedialHistory.length ? raw.remedialHistory.join(", ") : "None"}</div>
        </div>
        <div className="rounded-lg border border-slate-800 p-3">
          <div className="text-[11px] uppercase text-slate-500">Live project</div>
          <div className="text-sm font-semibold text-slate-200">{raw.liveProject ? `${raw.liveProject.completed ? "Completed" : "In progress"} · grade ${raw.liveProject.grade}` : "Not enrolled"}</div>
        </div>
        <div className="rounded-lg border border-slate-800 p-3">
          <div className="text-[11px] uppercase text-slate-500">Fails (grade &lt; 40)</div>
          <div className="text-sm font-semibold text-slate-200">{result.fails}</div>
        </div>
      </div>

      {/* concerns + interventions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Section title="Concern areas">
          <div className="flex flex-wrap gap-1.5">
            {result.concerns.length ? result.concerns.map((c) => <span key={c} className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-300 ring-1 ring-red-500/20">{c}</span>) : <span className="text-sm text-slate-500">None</span>}
          </div>
        </Section>
        <Section title="Assigned interventions">
          <div className="grid grid-cols-2 gap-2">
            {[["Remedial", result.interventions.remedial], ["Supervision", result.interventions.supervision], ["Live Project", result.interventions.liveProject], ["Monthly 1:1", result.interventions.mentor1on1]].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-slate-800 p-2">
                <div className="text-[11px] text-slate-500">{l}</div>
                <div className="text-xs font-semibold text-slate-200">{v}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* grievances */}
      {grievances.length > 0 && (
        <Section title={`Grievances (${grievances.length})`}>
          <div className="space-y-2">
            {grievances.map((g, i) => (
              <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 font-medium text-slate-300">{g.subject}</span>
                  <span>Class {g.classNo}</span>
                  {ownerForBatch(raw.batch) && <span className="ml-auto">→ {ownerForBatch(raw.batch)!.name} (L1)</span>}
                </div>
                <p className="text-sm text-slate-300">{g.comment}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
