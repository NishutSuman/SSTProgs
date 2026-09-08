import type { CohortSummary, StudentResult } from "../engine/types";
import { Card, FlagBadge } from "../components/ui";
import { SLACK_INVITE_URL } from "../lib/appConfig";

const WORKFLOWS = [
  { name: "At-risk alert (Email + Slack)", trigger: "On sync / manual, new Red", desc: "When a student turns Red, the app POSTs to an n8n webhook that emails and Slacks the recipients set in App Config. Fire a live test from the gear menu.", status: "Ready (webhook)" },
  { name: "Monthly mentor 1:1 + calendar", trigger: "Schedule, monthly", desc: "Pulls /api/at-risk?flag=Red and books a 30-min 1:1, blocking the mentor's Google Calendar for each Red student.", status: "Planned" },
  { name: "Weekly leadership digest", trigger: "Schedule, Mon 08:00", desc: "Pulls /api/cohort and sends leadership new Reds, risk mix by batch, and attendance dips.", status: "Planned" },
  { name: "Monthly outcome digest", trigger: "Schedule, monthly", desc: "R/A/G movement, remedial conversion, grade trends and ticket resolution.", status: "Planned" },
  { name: "Ticket SLA escalation", trigger: "Schedule, 15 min", desc: "Escalates grievance tickets past FRT/ART up the ladder (intern → Junior PM → PM).", status: "Planned" },
];

export function AutomationPage({ cohort, onSelectStudent }: { cohort: CohortSummary; onSelectStudent: (s: StudentResult) => void }) {
  const reds = cohort.results.filter((s) => s.flag === "Red").sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Automation</h2>
        <p className="text-sm text-slate-500">The app owns the risk engine; n8n owns the actions. Flags become alerts, 1:1s, and digests automatically.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#4A154B]/40 bg-[#4A154B]/10 p-4">
        <div>
          <div className="text-sm font-semibold text-slate-100">Watch alerts land live in Slack</div>
          <div className="text-xs text-slate-400">Join the #sst-alerts channel, then fire a test alert from App Config to see the notification arrive in real time.</div>
        </div>
        <a href={SLACK_INVITE_URL} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#4A154B] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          Join Slack channel
        </a>
      </div>

      <Card title="How it connects">
        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 font-mono text-xs text-slate-400">
          Google Sheet ──sync──▶ App (risk engine) ──webhook──▶ n8n ──▶ Slack / Google Calendar / Email
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▲ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ n8n pulls /api/at-risk &amp; /api/cohort
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──────────────────────────┘
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {WORKFLOWS.map((w) => (
          <Card key={w.name} title={w.name}>
            <div className="mb-2 flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${w.status.startsWith("Ready") ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700/50 text-slate-300"}`}>{w.status}</span>
              <span className="text-[11px] text-slate-500">{w.trigger}</span>
            </div>
            <p className="text-sm text-slate-400">{w.desc}</p>
          </Card>
        ))}
      </div>

      <Card title={`At-risk queue (${reds.length})`} subtitle="Red students the alert workflow would notify on the next sync">
        <div className="scroll-thin max-h-[420px] overflow-auto divide-y divide-slate-800">
          {reds.map((s) => (
            <button key={s.id} onClick={() => onSelectStudent(s)} className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-slate-800/40">
              <span className="w-16 font-semibold text-slate-100">{s.id}</span>
              <span className="w-14 text-sm text-slate-500">Batch {s.batch}</span>
              <FlagBadge flag={s.flag} />
              <span className="ml-2 text-sm tabular-nums text-slate-400">risk {s.riskScore}</span>
              <span className="ml-auto truncate text-xs text-slate-500">→ notify mentor + PM · {s.concerns.join(", ")}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
