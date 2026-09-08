import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import type { Analytics } from "../lib/analytics";
import { AXIS, GRID, TOOLTIP, COLORS } from "./ui";

export function RiskDonut({ share }: { share: Analytics["share"] }) {
  const data = [
    { name: "Red", value: share.red, color: COLORS.red },
    { name: "Amber", value: share.amber, color: COLORS.amber },
    { name: "Green", value: share.green, color: COLORS.green },
  ];
  const total = share.red + share.amber + share.green;
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="none">
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip {...TOOLTIP} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#cbd5e1" }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 -mt-6 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-slate-50">{total}</span>
        <span className="text-xs text-slate-500">students</span>
      </div>
    </div>
  );
}

export function RiskByBatch({ byBatch }: { byBatch: Analytics["byBatch"] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={byBatch} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
        <XAxis dataKey="batch" tick={AXIS} />
        <YAxis tick={AXIS} />
        <Tooltip {...TOOLTIP} cursor={{ fill: "#1e293b55" }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#cbd5e1" }} />
        <Bar dataKey="Red" stackId="a" fill={COLORS.red} />
        <Bar dataKey="Amber" stackId="a" fill={COLORS.amber} />
        <Bar dataKey="Green" stackId="a" fill={COLORS.green} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AttendanceBands({ bands }: { bands: Analytics["attendanceBands"] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={bands} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
        <XAxis dataKey="band" tick={AXIS} />
        <YAxis tick={AXIS} />
        <Tooltip {...TOOLTIP} cursor={{ fill: "#1e293b55" }} />
        <Bar dataKey="count" fill={COLORS.brand} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ConcernBars({ concerns }: { concerns: Analytics["concerns"] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={concerns} layout="vertical" margin={{ top: 8, right: 16, left: 34, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={GRID} />
        <XAxis type="number" tick={AXIS} />
        <YAxis type="category" dataKey="name" tick={AXIS} width={96} />
        <Tooltip {...TOOLTIP} cursor={{ fill: "#1e293b55" }} />
        <Bar dataKey="count" fill={COLORS.sky} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function InterventionWorkload({ interventions }: { interventions: Analytics["interventions"] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={interventions} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
        <XAxis dataKey="name" tick={{ ...AXIS, fontSize: 11 }} />
        <YAxis tick={AXIS} />
        <Tooltip {...TOOLTIP} cursor={{ fill: "#1e293b55" }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#cbd5e1" }} />
        <Bar dataKey="Mandatory" stackId="a" fill={COLORS.brand} />
        <Bar dataKey="Optional" stackId="a" fill="#3730a3" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SubjectBars({ subjects }: { subjects: { subject: string; avgAtt: number; avgGrade: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={subjects} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
        <XAxis dataKey="subject" tick={AXIS} />
        <YAxis tick={AXIS} domain={[0, 100]} />
        <Tooltip {...TOOLTIP} cursor={{ fill: "#1e293b55" }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#cbd5e1" }} />
        <Bar dataKey="avgAtt" name="Avg attendance %" fill={COLORS.sky} radius={[4, 4, 0, 0]} />
        <Bar dataKey="avgGrade" name="Avg grade" fill={COLORS.brand} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
