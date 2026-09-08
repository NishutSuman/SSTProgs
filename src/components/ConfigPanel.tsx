import type { Config } from "../engine/types";

function Slider(props: { label: string; value: number; min: number; max: number; suffix?: string; accent?: string; onChange: (v: number) => void }) {
  const { label, value, min, max, suffix = "", accent = "#818cf8", onChange } = props;
  return (
    <label className="block">
      <div className="flex items-center justify-between text-xs font-medium text-slate-400">
        <span>{label}</span>
        <span className="tabular-nums font-semibold text-slate-100">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full cursor-pointer"
        style={{ accentColor: accent }}
      />
    </label>
  );
}

export function ConfigPanel({ config, onChange, onReset }: { config: Config; onChange: (c: Config) => void; onReset: () => void }) {
  const w = config.weights;
  const sumPct = Math.round((w.attendance + w.academics + w.remedial + w.engagement) * 100);
  const setWeight = (k: keyof Config["weights"], pct: number) => onChange({ ...config, weights: { ...w, [k]: pct / 100 } });
  const setFlag = (k: keyof Config["flags"], v: number) => onChange({ ...config, flags: { ...config.flags, [k]: v } });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sumPct === 100 ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
          Weights sum: {sumPct}%
        </span>
        <button onClick={onReset} className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-800">
          Reset to sheet defaults
        </button>
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        <Slider label="Attendance weight" value={Math.round(w.attendance * 100)} min={0} max={100} suffix="%" accent="#f87171" onChange={(v) => setWeight("attendance", v)} />
        <Slider label="Academics weight" value={Math.round(w.academics * 100)} min={0} max={100} suffix="%" accent="#60a5fa" onChange={(v) => setWeight("academics", v)} />
        <Slider label="Remedial weight" value={Math.round(w.remedial * 100)} min={0} max={100} suffix="%" accent="#a78bfa" onChange={(v) => setWeight("remedial", v)} />
        <Slider label="Engagement weight" value={Math.round(w.engagement * 100)} min={0} max={100} suffix="%" accent="#38bdf8" onChange={(v) => setWeight("engagement", v)} />
        <Slider label="Red cutoff (score >=)" value={config.flags.redCutoff} min={0} max={100} accent="#f87171" onChange={(v) => setFlag("redCutoff", v)} />
        <Slider label="Amber cutoff (score >=)" value={config.flags.amberCutoff} min={0} max={100} accent="#fbbf24" onChange={(v) => setFlag("amberCutoff", v)} />
      </div>
    </div>
  );
}
