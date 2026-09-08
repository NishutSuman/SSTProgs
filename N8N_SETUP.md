# n8n At-Risk Alert — Setup (Email + Slack)

Goal: when "Send test at-risk alert" is clicked in the app (or a new Red appears on sync), n8n emails and Slacks the recipients. This must keep working when Pavan tries the deployed app, so the workflow has to be **Activated** (Production webhook), on a reachable n8n.

## 1. Get an n8n with a public URL (pick one)
- **n8n Cloud free trial (easiest, always-on for the trial):** sign up at n8n.io, you get a hosted instance with a public HTTPS URL. Best if Pavan may try it on his own.
- **Local + Cloudflare Tunnel (fully free, live demos):**
  ```bash
  npx n8n           # runs n8n at http://localhost:5678
  # in another terminal, expose it publicly (no signup needed):
  brew install cloudflared   # or download it
  cloudflared tunnel --url http://localhost:5678
  ```
  Cloudflared prints a public `https://xxxx.trycloudflare.com` URL. Your webhook is reachable there while both run.
- **Render (free, self-host):** deploy the `n8nio/n8n` Docker image as a Web Service, add a free Postgres for persistence, set `WEBHOOK_URL` to the Render URL. Note: free tier cold-starts after 15 min idle.

## 2. Import the workflow
In n8n: top-right menu → **Import from File** → choose `n8n/at-risk-workflow.json` (in this repo). You'll see 4 nodes: Webhook → Build message → Send Email + Slack.

## 3. Set the two credentials
- **Email (Gmail OAuth2 — you already have this):** open the **Gmail - Send** node and select your existing **"Gmail account" (Gmail OAuth2 API)** credential from the dropdown. On import the node shows "credential not found" (the id won't match) — just pick your credential and it's done. No App Password needed. It sends from your Gmail to the recipients in the payload.
- **Slack:** create a Slack **Incoming Webhook** (api.slack.com/apps → your app → Incoming Webhooks → Add to a channel → copy the URL). Paste that URL into the **Slack (incoming webhook)** node's `url` field.

## 4. Activate + copy the Production URL
- Toggle the workflow **Active** (top-right). This is what makes the **Production** webhook live.
- Open the **Webhook** node → copy the **Production URL** (looks like `https://<your-n8n>/webhook/sst-at-risk`). NOT the Test URL.

## 5. Wire it to the app
- Open the app → gear (App Config) → paste the Production URL into **n8n Webhook URL**, set the recipient emails, **Send test at-risk alert**.
- A real email + Slack message land for the top Red students. That's the live moment.

## Payload the app sends
```json
{
  "event": "at_risk_test",
  "recipients": ["aarav.mehta@sst.demo", "priya.nair@sst.demo"],
  "count": 3,
  "students": [
    { "id": "L206", "batch": "C", "riskScore": 60.5, "concerns": ["Attendance", "Academics", "Remedial History"] }
  ]
}
```
In n8n the parsed body is at `{{ $json.body }}` (the Build message node already handles this).

## Notes
- **CORS:** the browser POST from the deployed app may show a CORS console warning, but the request still reaches n8n and the workflow fires. The Webhook node's `allowedOrigins: "*"` (already set) clears it.
- **Server-driven alerts too:** `server/sync.ts` also POSTs new Reds to `N8N_WEBHOOK_URL` (set it in `.env`) on each sync, so alerts can fire automatically, not just from the button.
- **Escalation reuse:** the same workflow shape (Webhook → format → Email/Slack) is how the ticket-SLA escalation would notify the next owner.
