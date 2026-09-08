import type { ReactNode } from "react";
import type { RiskFlag } from "../engine/types";

/** Dark card surface used across the app. */
export function Card({ title, subtitle, children, className = "", right }: { title?: string; subtitle?: string; children: ReactNode; className?: string; right?: ReactNode }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/20 ${className}`}>
      {(title || right) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-bold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

const KPI_TONE: Record<string, { dot: string; text: string }> = {
  red: { dot: "bg-red-400", text: "text-red-400" },
  amber: { dot: "bg-amber-400", text: "text-amber-400" },
  green: { dot: "bg-emerald-400", text: "text-emerald-400" },
  brand: { dot: "bg-indigo-400", text: "text-indigo-300" },
  slate: { dot: "bg-slate-400", text: "text-slate-300" },
};

export function Kpi({ label, value, sub, tone = "brand" }: { label: string; value: number | string; sub?: string; tone?: keyof typeof KPI_TONE }) {
  const t = KPI_TONE[tone];
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        <span className={`h-2 w-2 rounded-full ${t.dot}`} />
        {label}
      </div>
      <div className="mt-1 text-3xl font-extrabold text-slate-50 tabular-nums">{value}</div>
      {sub && <div className={`text-xs ${t.text}`}>{sub}</div>}
    </div>
  );
}

const FLAG: Record<RiskFlag, string> = {
  Red: "bg-red-500/15 text-red-300 ring-red-500/30",
  Amber: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  Green: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
};

export function FlagBadge({ flag }: { flag: RiskFlag }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${FLAG[flag]}`}>{flag}</span>;
}

/** Recharts shared dark styles. */
export const AXIS = { fontSize: 12, fill: "#94a3b8" };
export const GRID = "#1e293b";
export const TOOLTIP = {
  contentStyle: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#e2e8f0", fontSize: 12 },
  labelStyle: { color: "#e2e8f0" },
  itemStyle: { color: "#cbd5e1" },
};
export const COLORS = { red: "#f87171", amber: "#fbbf24", green: "#34d399", brand: "#818cf8", sky: "#38bdf8" };
