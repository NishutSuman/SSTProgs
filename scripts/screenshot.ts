import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 1400, deviceScaleFactor: 2 });
  page.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));

  await page.goto("http://localhost:5173", { waitUntil: "load", timeout: 30000 });
  await page.waitForSelector("nav button", { timeout: 15000 });
  await page.waitForSelector("svg.recharts-surface", { timeout: 10000 }).catch(() => {});
  await sleep(1500);
  await page.screenshot({ path: "shot-top.png", clip: { x: 0, y: 0, width: 1500, height: 520 } });
  console.log("saved shot-top.png");

  // open config modal
  await page.evaluate(() => (document.querySelector('button[aria-label="App configuration"]') as HTMLButtonElement)?.click());
  await sleep(700);
  await page.screenshot({ path: "shot-config.png" });
  console.log("saved shot-config.png");
  // close it
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.trim() === "✕");
    (b as HTMLButtonElement)?.click();
  });
  await sleep(400);

  // Trends page
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("nav button")].find((x) => x.textContent?.trim() === "Trends");
    (b as HTMLButtonElement)?.click();
  });
  await sleep(1600);
  await page.screenshot({ path: "shot-trends.png", fullPage: true });
  console.log("saved shot-trends.png");

  await browser.close();
}
main().catch((e) => { console.error("screenshot failed:", e.message); process.exit(1); });
