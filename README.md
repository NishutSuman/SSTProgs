# SSTProg — SST Student Success App

Rebuild of the Scaler SST academic-operations tracker (originally a Google Sheet) as a live analytics app plus an n8n automation layer. Same risk logic, presented far better, fed from the sheet, with results synced back and at-risk alerts automated.

## What's built
- **Risk engine** (`src/engine`) — same logic as the sheet, config-driven. `npm run validate` runs 19 checks (reproduces the sheet's real rows).
- **Analytics UI** (React + Vite + Tailwind + Recharts) — dashboard (risk share, risk by batch, attendance bands, concerns, intervention workload), student tracker with filters, per-student **risk breakdown** drill-down, and an **interactive config** panel (drag weights/thresholds, the cohort recomputes live).
- **Live Google Sheets sync** (`server/`) — fetches the sheet via a service account, computes, writes `students.json` for the UI, writes results back to a "Risk Results (app)" tab, and triggers the n8n at-risk workflow.
- **n8n automation layer** — see `N8N_WORKFLOWS.md` (at-risk Slack alert, monthly 1:1 + calendar blocking, weekly/monthly digests).

## Run the UI (uses the seed data)
```bash
npm install
npm run dev        # http://localhost:5173
```
The seed is a realistic 299-student dataset so you can see everything immediately. Regenerate it with `npm run seed`.

## Go live with the real sheet
1. In Google Cloud, open the service account `drive-downloader@oauth-practice-345013.iam.gserviceaccount.com`, create a **JSON key**, download it.
2. Save it as `server/credentials.json` (gitignored, never commit).
3. `cp .env.example .env` (the SHEET_ID is already set; the sheet is already shared with the service account).
4. Pull the real cohort and write results back:
   ```bash
   npm run sync            # fetch -> compute -> students.json -> write-back -> n8n alert
   npm run sync -- --dump  # if parsing looks off, prints each tab's headers so we can fix mappings
   ```
5. `npm run dev` now shows the real 299 students (target risk mix 38 / 90 / 171).

## The API (for the UI proxy and n8n)
```bash
npm run server     # http://localhost:8787
```
- `GET /api/cohort` — full computed cohort
- `GET /api/at-risk?flag=Red` — at-risk students (n8n uses this for alerts, 1:1s, calendar)

## n8n
Set `N8N_WEBHOOK_URL` in `.env` to your n8n Webhook node. See `N8N_WORKFLOWS.md` for the four workflows and setup.

## Structure
```
src/engine/       risk engine (types, config, engine, validate)
src/lib/          analytics derivation
src/components/   ConfigPanel, Charts, StudentTable, StudentDrawer, FlagBadge
src/App.tsx       the dashboard
src/data/         students.json (seed or synced)
server/           sheets.ts, transform.ts, sync.ts, api.ts
scripts/          generateSeed.ts
```

## Deploy
Frontend on Vercel (`npm run build`), the sync/API + n8n on Railway or n8n cloud.
