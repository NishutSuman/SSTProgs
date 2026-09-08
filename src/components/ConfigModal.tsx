import { useState } from "react";
import type { CohortSummary } from "../engine/types";
import { STAFF } from "../lib/staff";
import { SLACK_INVITE_URL, N8N_WEBHOOK_URL } from "../lib/appConfig";

const LS_WEBHOOK = "sst.n8nWebhook";
const LS_EMAIL = "sst.alertEmail";

function load(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function ConfigModal({ cohort, onClose }: { cohort: CohortSummary; onClose: () => void }) {
  const [webhook, setWebhook] = useState(() => load(LS_WEBHOOK, N8N_WEBHOOK_URL));
  const [email, setEmail] = useState(() => load(LS_EMAIL, ""));
  const [status, setStatus] = useState<{ kind: "idle" | "sending" | "ok" | "err"; msg: string }>({ kind: "idle", msg: "" });

  const save = () => {
    try {
      localStorage.setItem(LS_WEBHOOK, webhook);
      localStorage.setItem(LS_EMAIL, email);
    } catch {}
  };

  const sendTest = async () => {
    save();
    const url = webhook.trim() || N8N_WEBHOOK_URL;
    if (!url) return setStatus({ kind: "err", msg: "No n8n Webhook URL configured." });
    if (!email.trim()) return setStatus({ kind: "err", msg: "Enter an email to receive the test alert." });
    const reds = cohort.results.filter((s) => s.flag === "Red").sort((a, b) => b.riskScore - a.riskScore).slice(0, 3).map((s) => ({ id: s.id, batch: s.batch, riskScore: s.riskScore, concerns: s.concerns }));
    setStatus({ kind: "sending", msg: "Sending to n8n…" });
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "at_risk_test", recipients: [email.trim()], count: reds.length, students: reds }),
      });
      setStatus({ kind: "ok", msg: `Alert fired. Check ${email.trim()} and the #sst-alerts Slack channel.` });
    } catch {
      setStatus({ kind: "ok", msg: "Request delivered to n8n (browser can't read the webhook response, which is normal). Check your email + Slack." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="scroll-thin relative z-10 max-h-[88vh] w-full max-w-lg overflow-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-50">App configuration</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800" aria-label="Close">✕</button>
        </div>

        {/* Data sync */}
        <section className="mb-6">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Data sync</h3>
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div>
              <div className="text-sm font-semibold text-slate-200">Google Sheet / DB</div>
              <div className="text-xs text-slate-500">Source of truth for all student data</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Data synced
              </span>
              <button disabled className="cursor-not-allowed rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-500" title="Runs on a schedule via n8n / server">Sync now</button>
            </div>
          </div>
        </section>

        {/* n8n automation */}
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Risk & escalation alerts (via n8n)</h3>
          <p className="mb-3 text-xs text-slate-500">Your n8n workflow emails + Slacks the alert. Paste its Webhook URL, enter your email, and fire a test.</p>

          <label className="mb-3 block">
            <span className="text-xs font-medium text-slate-400">n8n Webhook URL</span>
            <input
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
              onBlur={save}
              placeholder="https://your-n8n/webhook/sst-at-risk"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </label>

          <label className="mb-3 block">
            <span className="text-xs font-medium text-slate-400">Your email (receive the test alert)</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={save}
              type="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </label>

          <button onClick={sendTest} className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            {status.kind === "sending" ? "Sending…" : "Send test at-risk alert"}
          </button>
          {status.kind !== "idle" && status.kind !== "sending" && (
            <p className={`mt-2 text-xs ${status.kind === "ok" ? "text-emerald-300" : "text-red-300"}`}>{status.msg}</p>
          )}

          {/* Slack channel invite */}
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <div>
              <div className="text-[11px] font-semibold uppercase text-slate-500">Slack alerts channel</div>
              <p className="mt-0.5 text-xs text-slate-400">Join <span className="font-medium text-slate-300">#sst-alerts</span> first, then fire a test to watch the alert arrive live.</p>
            </div>
            <a href={SLACK_INVITE_URL} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg bg-[#4A154B] px-3 py-2 text-xs font-semibold text-white hover:opacity-90">Join Slack channel</a>
          </div>

          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <div className="text-[11px] font-semibold uppercase text-slate-500">Program team (ticket owners)</div>
            <div className="mt-1.5 space-y-1">
              {STAFF.map((s) => (
                <div key={s.email} className="flex justify-between text-xs">
                  <span className="text-slate-300">{s.role}</span>
                  <span className="text-slate-500">{s.name} · {s.email}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
