import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function sources(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...sources(p));
    else if (/\.(ts|tsx|js|mjs|html)$/.test(name)) out.push(p);
  }
  return out;
}

const FRONT_ENDS = ["packages/app/src", "packages/cli/src"].flatMap((d) => sources(join(root, d)));

/** Anything that would pull the write engine, or a write service, into a read-only front end. */
const FORBIDDEN: [string, RegExp][] = [
  ["an import of packages/lab", /(from|import\s*\(|require\()\s*["'][^"']*\/lab\/[^"']*["']/],
  ["a path into packages/lab", /packages\/lab/],
  ["the lab engine", /\b(LabEngine|WriteTransport|opendiag-lab)\b/],
  ["the write transport file", /write-transport/],
  ["a WriteDataByIdentifier call", /\bwriteDid\b|\bWRITE_DID\b/],
  ["a 0x2E service id", /0x2e\b/i],
];

test("the app and the default CLI never reference the lab package or a write service", () => {
  assert.ok(FRONT_ENDS.length >= 5 && FRONT_ENDS.some((f) => f.endsWith("cli/src/main.ts")) && FRONT_ENDS.some((f) => f.endsWith("app/src/App.tsx")), "scanner found the source files");
  const hits: string[] = [];
  for (const f of FRONT_ENDS) {
    const text = readFileSync(f, "utf8");
    for (const [what, re] of FORBIDDEN) {
      if (re.test(text)) hits.push(`${f.slice(root.length + 1)}: ${what}`);
    }
  }
  assert.deepEqual(hits, []);
});

test("front ends only open a write door for DTC clearing (0x14), nothing else", () => {
  for (const f of FRONT_ENDS) {
    const text = readFileSync(f, "utf8");
    for (const m of text.matchAll(/readOnlyExcept\(([^)]*)\)/g)) {
      assert.match(m[1] as string, /\[0x14\]\s*$/, `${f}: readOnlyExcept with something other than 0x14`);
    }
  }
});

test("the lab is reachable only through its own script, not from the default scripts", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { scripts: Record<string, string> };
  for (const [name, cmd] of Object.entries(pkg.scripts)) {
    if (name === "lab") assert.match(cmd, /packages\/lab\/src\/cli\.ts/);
    else assert.doesNotMatch(cmd, /lab/, `script ${name} must not touch the lab`);
  }
  const app = JSON.parse(readFileSync(join(root, "packages/app/package.json"), "utf8")) as { dependencies?: Record<string, string> };
  assert.ok(!Object.keys(app.dependencies ?? {}).some((d) => /lab/.test(d)));
});

test("the lab refuses emissions and safety options in code: the block list covers the policy classes", async () => {
  const { BLOCKED_WORDS } = await import("../src/policy.ts");
  for (const w of ["dpf", "egr", "scr", "adblue", "catalyst", "o2", "evap", "readiness", "mil", "check_engine", "airbag", "abs", "immobilizer", "odometer", "gateway", "flash"]) {
    assert.ok(BLOCKED_WORDS.has(w), w);
  }
});
