import type { Analytics } from "../lib/analytics";
import { Card } from "../components/ui";
import { SubjectBars } from "../components/Charts";

export function BatchesPage({ analytics }: { analytics: Analytics }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Batches &amp; Subjects</h2>
        <p className="text-sm text-slate-500">Comparative performance across batches and subjects, for staffing and focus.</p>
      </div>

      <Card title="Batch comparison">
        <div className="scroll-thin overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Batch</th>
                <th className="px-3 py-2 text-right font-semibold">Students</th>
                <th className="px-3 py-2 text-right font-semibold">Red</th>
                <th className="px-3 py-2 text-right font-semibold">Amber</th>
                <th className="px-3 py-2 text-right font-semibold">Green</th>
                <th className="px-3 py-2 text-right font-semibold">Avg Att %</th>
                <th className="px-3 py-2 text-right font-semibold">Avg Grade</th>
                <th className="px-3 py-2 text-right font-semibold">Failing</th>
                <th className="px-3 py-2 text-right font-semibold">Remedial</th>
              </tr>
            </thead>
            <tbody>
              {analytics.byBatch.map((b) => (
                <tr key={b.batch} className="border-t border-slate-800/70">
                  <td className="px-3 py-2 font-semibold text-slate-100">{b.batch}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-300">{b.total}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-red-400">{b.Red}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-amber-400">{b.Amber}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-emerald-400">{b.Green}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-300">{b.avgAtt}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-300">{b.avgGrade}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-300">{b.failing}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-300">{b.remedial}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Subject performance" subtitle="Average attendance and grade per subject">
          <SubjectBars subjects={analytics.subjects} />
        </Card>
        <Card title="Subject detail">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Subject</th>
                <th className="px-3 py-2 text-right font-semibold">Enrolled</th>
                <th className="px-3 py-2 text-right font-semibold">Avg Att %</th>
                <th className="px-3 py-2 text-right font-semibold">Avg Grade</th>
                <th className="px-3 py-2 text-right font-semibold">Pass rate</th>
              </tr>
            </thead>
            <tbody>
              {analytics.subjects.map((s) => (
                <tr key={s.subject} className="border-t border-slate-800/70">
                  <td className="px-3 py-2 text-slate-200">{s.subject}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-300">{s.enrolled}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-300">{s.avgAtt}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-300">{s.avgGrade}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-300">{s.passRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
