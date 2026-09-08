// Google Sheets access via a service account, implemented on Node's native https + crypto.
// (We avoid the googleapis SDK here because its undici-based fetch throws "Premature close"
// against Google's token endpoint in this Node build; native https works reliably.)
// The private key JSON is read from a gitignored file, never committed.
import { readFileSync, existsSync } from "node:fs";
import https from "node:https";
import crypto from "node:crypto";
import "dotenv/config";

const SHEET_ID = process.env.SHEET_ID || "1MVY0sbANUKl1KrZ0cshNyHyQCT-54JwTw63r5O2eSEU";
const CRED_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || "server/credentials.json";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

interface Creds {
  client_email: string;
  private_key: string;
}

function loadCreds(): Creds {
  if (!existsSync(CRED_PATH)) {
    throw new Error(
      `Service-account key not found at "${CRED_PATH}".\n` +
        `Download the JSON key for your service account and save it there (it is gitignored),\n` +
        `and share the sheet with the service-account email as Editor.`,
    );
  }
  return JSON.parse(readFileSync(CRED_PATH, "utf8"));
}

interface HttpResult {
  status: number;
  body: string;
}

function request(options: https.RequestOptions, body?: string): Promise<HttpResult> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, body: data }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function signJwt(creds: Creds): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: creds.client_email,
    scope: SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${enc(header)}.${enc(claim)}`;
  const signature = crypto.createSign("RSA-SHA256").update(unsigned).sign(creds.private_key).toString("base64url");
  return `${unsigned}.${signature}`;
}

let cachedToken: { token: string; exp: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() + 60_000) return cachedToken.token;
  const creds = loadCreds();
  const assertion = signJwt(creds);
  const payload = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  }).toString();
  const res = await request(
    {
      method: "POST",
      hostname: "oauth2.googleapis.com",
      path: "/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(payload),
      },
    },
    payload,
  );
  if (res.status !== 200) throw new Error(`Token request failed (${res.status}): ${res.body}`);
  const token = JSON.parse(res.body).access_token as string;
  cachedToken = { token, exp: Date.now() + 3500 * 1000 };
  return token;
}

/** Read a whole tab as a 2D array of strings (first row is headers). */
export async function readTab(tabName: string): Promise<string[][]> {
  const token = await getToken();
  const range = encodeURIComponent(`'${tabName}'`);
  const res = await request({
    method: "GET",
    hostname: "sheets.googleapis.com",
    path: `/v4/spreadsheets/${SHEET_ID}/values/${range}`,
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status !== 200) throw new Error(`Read "${tabName}" failed (${res.status}): ${res.body}`);
  return (JSON.parse(res.body).values as string[][]) ?? [];
}

async function ensureTab(tabName: string, token: string) {
  const body = JSON.stringify({ requests: [{ addSheet: { properties: { title: tabName } } }] });
  const res = await request(
    {
      method: "POST",
      hostname: "sheets.googleapis.com",
      path: `/v4/spreadsheets/${SHEET_ID}:batchUpdate`,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    },
    body,
  );
  // 400 = already exists, which is fine.
  if (res.status !== 200 && !res.body.includes("already exists")) {
    // ignore, the update below will surface a real problem
  }
}

/** Overwrite a tab with values (creates it if missing). Used for write-back of results. */
export async function writeTab(tabName: string, values: (string | number)[][]) {
  const token = await getToken();
  await ensureTab(tabName, token);
  const range = encodeURIComponent(`'${tabName}'`);
  // clear then update
  await request(
    {
      method: "POST",
      hostname: "sheets.googleapis.com",
      path: `/v4/spreadsheets/${SHEET_ID}/values/${range}:clear`,
      headers: { Authorization: `Bearer ${token}`, "Content-Length": 0 },
    },
    "",
  );
  const body = JSON.stringify({ values });
  const res = await request(
    {
      method: "PUT",
      hostname: "sheets.googleapis.com",
      path: `/v4/spreadsheets/${SHEET_ID}/values/${range}?valueInputOption=RAW`,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    },
    body,
  );
  if (res.status !== 200) throw new Error(`Write "${tabName}" failed (${res.status}): ${res.body}`);
}

export { SHEET_ID };
