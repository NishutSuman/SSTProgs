import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import type { CohortSummary } from "../engine/types";
import type { Analytics } from "../lib/analytics";
import { buildTrend } from "../lib/trends";
import { Card } from "../components/ui";
import { AXIS, GRID, TOOLTIP, COLORS } from "../components/ui";

export function TrendsPage({ cohort, analytics }: { cohort: CohortSummary; analytics: Analytics }) {
  const data = buildTrend({ red: cohort.red, amber: cohort.amber, green: cohort.green, avgAtt: analytics.kpi.avgAtt, avgGrade: analytics.kpi.avgGrade });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Trends over time</h2>
        <p className="text-sm text-slate-500">Week-over-week movement in risk and performance.</p>
      </div>

      {/* clear illustrative-data notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#fbbf24" className="mt-0.5 shrink-0">
          <path d="M12 2L1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z" />
        </svg>
        <p className="text-sm text-amber-200/90">
          <span className="font-semibold text-amber-200">Illustrative data.</span> The prior weeks shown here are sample data for the demo. This section runs on dummy data and does not affect the real assignment data or analytics anywhere else in the app. Real trends will populate automatically as each weekly sheet sync is captured. The final "This week" point is the real current cohort.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Risk mix over time" subtitle="Students by flag, per week">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="week" tick={AXIS} />
              <YAxis tick={AXIS} />
              <Tooltip {...TOOLTIP} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#cbd5e1" }} />
              <Line type="monotone" dataKey="red" name="Red" stroke={COLORS.red} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="amber" name="Amber" stroke={COLORS.amber} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="green" name="Green" stroke={COLORS.green} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Attendance & grade over time" subtitle="Cohort averages, per week">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="week" tick={AXIS} />
              <YAxis tick={AXIS} domain={[40, 100]} />
              <Tooltip {...TOOLTIP} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#cbd5e1" }} />
              <Line type="monotone" dataKey="avgAtt" name="Avg attendance %" stroke={COLORS.sky} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="avgGrade" name="Avg grade" stroke={COLORS.brand} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
