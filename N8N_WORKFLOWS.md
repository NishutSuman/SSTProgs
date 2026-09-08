# n8n Automation Layer

The app owns the **risk engine and analytics**; n8n owns the **actions** that follow from the risk state. This is the "and workflow" half of the assignment, and it keeps automation logic out of the app so ops can change it without a redeploy.

## How they connect

Two integration directions:
- **App -> n8n (push):** `npm run sync` fetches the sheet, recomputes, and when a student **newly turns Red** it POSTs them to an n8n **Webhook** node (`N8N_WEBHOOK_URL`). Real-time alerting.
- **n8n -> App (pull):** scheduled n8n workflows call the app's API for the current state:
  - `GET /api/at-risk?flag=Red` -> Red students (for alerts, calendar, 1:1s)
  - `GET /api/at-risk?flag=Amber` -> Amber students
  - `GET /api/cohort` -> full computed cohort (for digests)

```
  Google Sheet ──sync──▶  App (risk engine)  ──webhook──▶  n8n  ──▶ Slack / Calendar / Email
                              ▲                            │
                              └──────── /api pull ─────────┘
```

## Workflow 1 — At-risk alert to Slack (the showcase)
- **Trigger:** Webhook node, receives `{ event: "at_risk", students: [...] }` from `sync`.
- **Steps:** format a message → **Slack** node posts to the batch mentor and PM channel: "L142 (Batch B) just turned Red. Concerns: Attendance, Academics. Risk 62." → optionally create a task.
- **Why:** turns a red flag into an action the moment it happens, no one has to watch a dashboard.

## Workflow 2 — Monthly mentor 1:1 scheduling + calendar blocking
- **Trigger:** Schedule node (monthly, e.g. 1st at 07:00 IST).
- **Steps:** `GET /api/at-risk?flag=Red` → for each Red student, **Google Calendar** node creates a 30-minute mentor 1:1 and blocks the mentor's slot; email/Slack the invite.
- **Why:** the Red tier requires a monthly 1:1 (your model). This schedules them automatically instead of by hand.

## Workflow 3 — Weekly leadership digest
- **Trigger:** Schedule node (Monday 08:00 IST).
- **Steps:** `GET /api/cohort` → build a summary (new Reds, risk mix by batch, attendance dips) → **Slack/Email** to leadership.
- **Why:** the weekly leading-indicator review from your cadence, delivered automatically.

## Workflow 4 — Monthly outcome digest
- **Trigger:** Schedule node (monthly).
- **Steps:** `GET /api/cohort` (optionally compare to a stored snapshot) → R/A/G movement, remedial conversion, grade trends → leadership.
- **Why:** the monthly outcome review.

## Optional — Ticket SLA escalation
If the ticket/grievance module is added later, an n8n Schedule node every 15-30 min pulls open tickets past FRT/ART, auto-escalates to the next owner, and alerts on Slack (mirrors the sheet's escalation ladder: L1 intern 1h/8h → L2 Junior PM 24h → L3 PM).

## Setup checklist
1. Run n8n (n8n cloud, or self-host: `npx n8n`).
2. Create Workflow 1 with a **Webhook** node; copy its URL into `.env` as `N8N_WEBHOOK_URL`.
3. Add a **Slack** credential (or email) and wire the alert message.
4. For Workflows 2 to 4, add **Schedule** nodes + an **HTTP Request** node hitting the app's `/api/...` endpoints, then Calendar/Slack/Email nodes.
5. Run `npm run server` so the API is reachable, and `npm run sync` (or a cron) to drive the push alert.

## Demo tip
For the Loom, trigger one live: run `npm run sync`, show a Slack message arriving for a new Red student. That single moment proves the "app plus workflow" story.
