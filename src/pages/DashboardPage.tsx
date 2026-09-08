import type { CohortSummary, StudentResult } from "../engine/types";
import type { Analytics } from "../lib/analytics";
import { Card, Kpi, FlagBadge } from "../components/ui";
import { RiskDonut, RiskByBatch, AttendanceBands, ConcernBars, InterventionWorkload } from "../components/Charts";

export function DashboardPage({ cohort, analytics, grievanceCount, onSelectStudent }: { cohort: CohortSummary; analytics: Analytics; grievanceCount: number; onSelectStudent: (s: StudentResult) => void }) {
  const pct = (x: number) => `${Math.round((x / cohort.total) * 100)}%`;
  const topReds = cohort.results.filter((s) => s.flag === "Red").sort((a, b) => b.riskScore - a.riskScore).slice(0, 8);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-50">Cohort dashboard</h2>
          <p className="text-sm text-slate-500">Term 2 · {cohort.total} students across {analytics.byBatch.length} batches</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3.5 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" /></svg>
          Download report
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Students" value={cohort.total} sub={`${analytics.byBatch.length} batches`} tone="brand" />
        <Kpi label="High (Red)" value={cohort.red} sub={pct(cohort.red)} tone="red" />
        <Kpi label="Medium (Amber)" value={cohort.amber} sub={pct(cohort.amber)} tone="amber" />
        <Kpi label="Low (Green)" value={cohort.green} sub={pct(cohort.green)} tone="green" />
        <Kpi label="Avg attendance" value={`${analytics.kpi.avgAtt}%`} tone="slate" />
        <Kpi label="Avg grade" value={analytics.kpi.avgGrade} tone="slate" />
        <Kpi label="Failing (>=1 subject)" value={analytics.kpi.failing} tone="red" />
        <Kpi label="Open grievances" value={grievanceCount} tone="amber" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Cohort risk share">
          <RiskDonut share={analytics.share} />
        </Card>
        <Card title="Risk by batch" subtitle="Stacked counts per batch">
          <RiskByBatch byBatch={analytics.byBatch} />
        </Card>
        <Card title="Attendance distribution" subtitle="Students per band">
          <AttendanceBands bands={analytics.attendanceBands} />
        </Card>
        <Card title="Concern areas" subtitle="Students carrying each deficit">
          <ConcernBars concerns={analytics.concerns} />
        </Card>
        <Card title="Intervention workload" subtitle="Slots to schedule by type" className="lg:col-span-2">
          <InterventionWorkload interventions={analytics.interventions} />
        </Card>
      </div>

      <Card title="Needs attention now" subtitle="Highest-risk Red students, click to open">
        <div className="divide-y divide-slate-800">
          {topReds.map((s) => (
            <button key={s.id} onClick={() => onSelectStudent(s)} className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-slate-800/40">
              <span className="w-16 font-semibold text-slate-100">{s.id}</span>
              <span className="w-14 text-sm text-slate-500">Batch {s.batch}</span>
              <FlagBadge flag={s.flag} />
              <span className="ml-2 text-sm tabular-nums text-slate-400">risk {s.riskScore}</span>
              <span className="ml-auto truncate text-xs text-slate-500">{s.concerns.join(", ")}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
