// Checks packages/core/data/dtc. Run: pnpm lint:dtc
import { loadDtcEntries } from "../packages/core/src/dtc-text.ts";
import { lintShippedData } from "../packages/core/src/dtc-lint.ts";

const problems = lintShippedData();
if (problems.length) {
  for (const p of problems) console.error(p);
  console.error(`${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`ok: ${loadDtcEntries().length} entries`);
