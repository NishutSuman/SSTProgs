// Fixed app-level config for the demo.
// Slack workspace invite so a viewer (e.g. Pavan) can join and watch alerts land in #sst-alerts.
export const SLACK_INVITE_URL = "https://join.slack.com/t/nishut-n8n/shared_invite/zt-491enh7it-ruQ2gINyxUfs0fbShAPqxA";

// n8n PRODUCTION webhook (workflow must be Activated). Baked in so anyone using the
// deployed app (Pavan) can fire the alert without pasting a URL. A build-time Vite env
// VITE_N8N_WEBHOOK_URL overrides it if set (e.g. in Vercel), otherwise this default is used.
export const N8N_WEBHOOK_URL =
  (import.meta.env?.VITE_N8N_WEBHOOK_URL as string | undefined) ||
  "https://nishutsuman.app.n8n.cloud/webhook/sst-at-risk";
