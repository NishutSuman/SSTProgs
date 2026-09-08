import type { StudentResult } from "../engine/types";
import { FlagBadge } from "./ui";

export function StudentTable({ rows, onSelect, selectedId }: { rows: StudentResult[]; onSelect: (s: StudentResult) => void; selectedId?: string }) {
  return (
    <div className="scroll-thin max-h-[560px] overflow-auto rounded-lg border border-slate-800">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-slate-900 text-left text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2 font-semibold">Student</th>
            <th className="px-3 py-2 font-semibold">Batch</th>
            <th className="px-3 py-2 text-right font-semibold">Att %</th>
            <th className="px-3 py-2 text-right font-semibold">Grade</th>
            <th className="px-3 py-2 text-right font-semibold">Eng %</th>
            <th className="px-3 py-2 text-right font-semibold">Fails</th>
            <th className="px-3 py-2 text-right font-semibold">Risk</th>
            <th className="px-3 py-2 font-semibold">Flag</th>
            <th className="px-3 py-2 font-semibold">Concerns</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr
              key={s.id}
              onClick={() => onSelect(s)}
              className={`cursor-pointer border-t border-slate-800/70 transition ${
                selectedId === s.id ? "bg-indigo-500/10" : "hover:bg-slate-800/50"
              }`}
            >
              <td className="px-3 py-2 font-semibold text-slate-100">{s.id}</td>
              <td className="px-3 py-2 text-slate-400">{s.batch}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-300">{s.overallAttendance}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-300">{s.overallGrade}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-300">{s.engagement}</td>
              <td className="px-3 py-2 text-right tabular-nums">{s.fails > 0 ? <span className="font-semibold text-red-400">{s.fails}</span> : <span className="text-slate-500">0</span>}</td>
              <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-200">{s.riskScore}</td>
              <td className="px-3 py-2"><FlagBadge flag={s.flag} /></td>
              <td className="px-3 py-2 text-xs text-slate-500">{s.concerns.join(", ") || "-"}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} className="px-3 py-10 text-center text-slate-500">
                No students match.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
