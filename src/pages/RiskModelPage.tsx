import type { Config, CohortSummary } from "../engine/types";
import { Card, Kpi } from "../components/ui";
import { ConfigPanel } from "../components/ConfigPanel";
import { RiskDonut } from "../components/Charts";

export function RiskModelPage({ config, onChange, onReset, cohort }: { config: Config; onChange: (c: Config) => void; onReset: () => void; cohort: CohortSummary }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Risk model</h2>
        <p className="text-sm text-slate-500">Tune the weights and thresholds. The whole cohort recomputes live, so leadership can see the impact of a policy change instantly.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Weights &amp; thresholds" subtitle="Drag to re-tune the model" className="lg:col-span-2">
          <ConfigPanel config={config} onChange={onChange} onReset={onReset} />
        </Card>
        <Card title="Live impact">
          <RiskDonut share={{ red: cohort.red, amber: cohort.amber, green: cohort.green }} />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Kpi label="Red" value={cohort.red} tone="red" />
            <Kpi label="Amber" value={cohort.amber} tone="amber" />
            <Kpi label="Green" value={cohort.green} tone="green" />
          </div>
        </Card>
      </div>

      <Card title="How the model works" subtitle="Same logic as the sheet, in code">
        <div className="grid grid-cols-1 gap-5 text-sm text-slate-300 md:grid-cols-2">
          <div className="space-y-2">
            <p className="font-semibold text-slate-100">Risk score (weighted-deficit index)</p>
            <pre className="overflow-auto rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
{`score = W_att · (100 - attendance)
      + W_acad · (100 - grade)
      + W_rem · (remedial ? 100 : 0)
      + W_eng · (100 - engagement)`}
            </pre>
            <p className="text-slate-400">Higher score = higher risk. Flag: <span className="text-red-400">Red</span> if score ≥ {config.flags.redCutoff} or 2+ fails; <span className="text-amber-400">Amber</span> if ≥ {config.flags.amberCutoff}; else <span className="text-emerald-400">Green</span>.</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-slate-100">Inputs</p>
            <ul className="list-inside list-disc space-y-1 text-slate-400">
              <li>Attendance: (Present + 0.5·Late) / sessions, session-weighted, opt-in subjects excluded when not taken.</li>
              <li>Grade: 0.3·mid + 0.7·end, with a −10 penalty when a subject's attendance is below 40%.</li>
              <li>A subject grade below 40 counts as a fail (matches the sheet).</li>
              <li>Engagement: events attended / 17.</li>
              <li>Concerns tag when attendance &lt; 65, grade &lt; 50, or engagement &lt; 40.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
