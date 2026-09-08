// Paste this into the "Build message" Code node in n8n (replaces the old code).
// It outputs: to, subject, html (rich email), slackBlocks (Block Kit), slackText (fallback).

const j = $input.first().json;
const body = j.body ?? j;
const students = body.students ?? [];
const recipients = (body.recipients ?? []).filter(Boolean);
const n = students.length;
const now = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

// ---------- Email (HTML) ----------
const rows = students
  .map(
    (s) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #eef0f4;font-weight:600;color:#0f172a;">${s.id}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eef0f4;color:#475569;">Batch ${s.batch}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eef0f4;text-align:right;font-weight:700;color:#dc2626;">${s.riskScore}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eef0f4;color:#64748b;font-size:13px;">${(s.concerns || []).join(", ")}</td>
    </tr>`,
  )
  .join("");

const html = `
<div style="margin:0;background:#f1f5f9;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#0b1120;padding:18px 24px;">
      <div style="color:#ffffff;font-size:16px;font-weight:800;">SST Student Success &middot; At-Risk Alert</div>
      <div style="color:#94a3b8;font-size:12px;margin-top:3px;">Scaler School of Technology &middot; ${now}</div>
    </div>
    <div style="padding:22px 24px;">
      <span style="display:inline-block;background:#fee2e2;color:#b91c1c;font-weight:700;font-size:13px;padding:6px 12px;border-radius:999px;">${n} student${n === 1 ? "" : "s"} flagged Red</span>
      <p style="color:#334155;font-size:14px;line-height:1.6;margin:14px 0 18px;">The following students have crossed the high-risk threshold and need mentor intervention. Full context and history are in the SSTProgs dashboard.</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #eef0f4;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#64748b;">Student</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#64748b;">Batch</th>
            <th style="padding:10px 14px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#64748b;">Risk</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#64748b;">Concerns</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="padding:14px 24px;border-top:1px solid #eef0f4;color:#94a3b8;font-size:12px;">
      Sent automatically by <strong style="color:#475569;">SSTProgs</strong> &middot; Scaler SST Student Success. Please do not reply to this email.
    </div>
  </div>
</div>`;

// ---------- Slack (Block Kit) ----------
const slackBlocks = [
  { type: "header", text: { type: "plain_text", text: `🚨 SST At-Risk Alert — ${n} student${n === 1 ? "" : "s"}`, emoji: true } },
  { type: "section", text: { type: "mrkdwn", text: `*${n}* student${n === 1 ? "" : "s"} flagged *Red* and need mentor intervention.  _as of ${now}_` } },
  { type: "divider" },
  ...students.map((s) => ({
    type: "section",
    text: { type: "mrkdwn", text: `*${s.id}*  ·  Batch ${s.batch}  ·  Risk *${s.riskScore}*\n:small_orange_diamond: ${(s.concerns || []).join(", ")}` },
  })),
  { type: "context", elements: [{ type: "mrkdwn", text: "SSTProgs · Scaler SST Student Success" }] },
];

const slackText = `SST At-Risk Alert: ${n} student(s) flagged Red.`;

return [{ json: { to: recipients.join(","), subject: `🚨 SST At-Risk Alert — ${n} Red student${n === 1 ? "" : "s"}`, html, slackText, slackBlocks } }];
