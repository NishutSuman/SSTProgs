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

      <Card title="How the model works" subtitle="Same logic as the sheet, explained step by step">
        <div className="space-y-6 text-sm text-slate-300">
          {/* the big idea, in plain English */}
          <p className="max-w-3xl leading-relaxed text-slate-300">
            Every student gets a single <span className="font-semibold text-slate-100">risk score</span>. The score adds up four "deficit" contributions, one per factor, so a student who is behind on more things scores higher. Each factor is scaled by its <span className="font-semibold text-slate-100">weight</span> (how much it matters) above, so the four weights on the left directly change the score below.
          </p>

          {/* the four factors, one at a time */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">The four factors</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { name: "Attendance", weight: Math.round(config.weights.attendance * 100), color: "#f87171", formula: "weight x (100 - attendance %)", note: "Lower attendance -> bigger deficit." },
                { name: "Academics", weight: Math.round(config.weights.academics * 100), color: "#60a5fa", formula: "weight x (100 - grade)", note: "Lower grade -> bigger deficit." },
                { name: "Remedial history", weight: Math.round(config.weights.remedial * 100), color: "#a78bfa", formula: "weight x (100 if remedial, else 0)", note: "Took Term 1 remedial -> full deficit." },
                { name: "Engagement", weight: Math.round(config.weights.engagement * 100), color: "#38bdf8", formula: "weight x (100 - engagement %)", note: "Fewer events attended -> bigger deficit." },
              ].map((f) => (
                <div key={f.name} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: f.color }} />
                    <span className="text-sm font-semibold text-slate-100">{f.name}</span>
                    <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">{f.weight}%</span>
                  </div>
                  <code className="block rounded bg-slate-900 px-2 py-1.5 text-[11px] leading-relaxed text-slate-300">{f.formula}</code>
                  <p className="mt-1.5 text-xs text-slate-500">{f.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* how they combine */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Adding it together</p>
            <pre className="overflow-auto rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs leading-relaxed text-slate-300">
{`Risk score  =  (Attendance weight  x  (100 - attendance %))
            +  (Academics weight   x  (100 - grade))
            +  (Remedial weight    x  (100 if remedial, else 0))
            +  (Engagement weight  x  (100 - engagement %))`}
            </pre>
            <p className="mt-2 text-slate-400">A student who is perfect everywhere (100% attendance, 100 grade, no remedial history, 100% engagement) scores <span className="font-semibold text-slate-200">0</span>. A student who is at 0 on every factor scores <span className="font-semibold text-slate-200">100</span>. Higher score always means higher risk.</p>
          </div>

          {/* worked example */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Worked example</p>
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
              <p className="mb-2 text-slate-400">Take a student with <span className="text-slate-200">54% attendance</span>, a <span className="text-slate-200">44 grade</span>, <span className="text-slate-200">remedial history</span>, and <span className="text-slate-200">59% engagement</span>, at the default weights (40 / 30 / 20 / 10):</p>
              <div className="scroll-thin overflow-auto">
                <table className="w-full min-w-[420px] text-xs">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="py-1 pr-3 font-semibold">Factor</th>
                      <th className="py-1 pr-3 font-semibold">Calculation</th>
                      <th className="py-1 text-right font-semibold">Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-400">
                    <tr className="border-t border-slate-800"><td className="py-1.5 pr-3 text-slate-300">Attendance</td><td className="py-1.5 pr-3">0.40 x (100 - 54)</td><td className="py-1.5 text-right tabular-nums text-slate-200">18.4</td></tr>
                    <tr className="border-t border-slate-800"><td className="py-1.5 pr-3 text-slate-300">Academics</td><td className="py-1.5 pr-3">0.30 x (100 - 44)</td><td className="py-1.5 text-right tabular-nums text-slate-200">16.8</td></tr>
                    <tr className="border-t border-slate-800"><td className="py-1.5 pr-3 text-slate-300">Remedial</td><td className="py-1.5 pr-3">0.20 x 100</td><td className="py-1.5 text-right tabular-nums text-slate-200">20.0</td></tr>
                    <tr className="border-t border-slate-800"><td className="py-1.5 pr-3 text-slate-300">Engagement</td><td className="py-1.5 pr-3">0.10 x (100 - 59)</td><td className="py-1.5 text-right tabular-nums text-slate-200">4.1</td></tr>
                    <tr className="border-t border-slate-700 font-semibold"><td className="py-1.5 pr-3 text-slate-100">Total risk score</td><td /><td className="py-1.5 text-right tabular-nums text-red-400">59.3 -&gt; Red</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* flag rule */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Turning the score into a flag</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-slate-200"><span className="font-semibold text-red-300">Red</span> if score &ge; {config.flags.redCutoff}, or the student is failing 2 or more subjects (regardless of score)</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-slate-200"><span className="font-semibold text-amber-300">Amber</span> if score &ge; {config.flags.amberCutoff}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-slate-200"><span className="font-semibold text-emerald-300">Green</span> otherwise</span>
              </div>
            </div>
          </div>

          {/* how the inputs themselves are computed */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Where each input comes from</p>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-slate-400 sm:grid-cols-2">
              <li><span className="font-medium text-slate-300">Attendance %</span> = (Present + 0.5 x Late) / total sessions, session-weighted across enrolled subjects. Opt-in subjects the student never took are excluded, not counted as zero.</li>
              <li><span className="font-medium text-slate-300">Grade</span> = 0.3 x mid-term + 0.7 x end-term, with a &minus;10 point penalty on the end-term when that subject's attendance is below 40%.</li>
              <li><span className="font-medium text-slate-300">Fail</span> = a subject grade below 40 (matches the sheet).</li>
              <li><span className="font-medium text-slate-300">Engagement %</span> = events attended out of 17 cultural/club events.</li>
              <li className="sm:col-span-2"><span className="font-medium text-slate-300">Concern tags</span> (shown per student) fire independently of the score: Attendance below 65%, Academics below 50, or Engagement below 40.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
