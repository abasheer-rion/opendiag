import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const src = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

function all(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? all(join(dir, e.name)) : [join(dir, e.name)]));
}

test("app: nothing that writes files or clears faults is imported", () => {
  const banned = /client-clear|node:fs|core\/src\/(store|backup-export|pack-load)|core\/src\/index|cli\/src/;
  for (const f of all(src).filter((x) => /\.(ts|tsx)$/.test(x))) {
    const imports = readFileSync(f, "utf8").split("\n").filter((l) => /^\s*(import|export)\b.*\bfrom\b/.test(l));
    for (const l of imports) assert.ok(!banned.test(l), `${f}: ${l}`);
  }
});

test("app: loads packs only through the checked loader", () => {
  const text = all(src).filter((x) => /\.(ts|tsx)$/.test(x)).map((f) => readFileSync(f, "utf8")).join("\n");
  assert.ok(!/JSON\.parse\([^)]*pack/i.test(text) || /parsePack/.test(text));
});
