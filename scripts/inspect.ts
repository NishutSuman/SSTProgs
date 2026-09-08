import { readTab } from "../server/sheets";

async function main() {
  const tabs = ["GradeSheet", "DSA 1 Attn", "Cultural Event Participation", "Term 1 - Remedial", "Live Projects Enrollment", "Project Grading"];
  for (const tab of tabs) {
    const rows = await readTab(tab);
    console.log(`\n===== ${tab} (${rows.length} rows) =====`);
    rows.slice(0, 5).forEach((r, i) => console.log(`  [${i}] ${JSON.stringify(r.slice(0, 14))}`));
  }
}
main().catch((e) => console.error(e.message));
