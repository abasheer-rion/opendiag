import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const MAIN = join(here, "..", "src", "main.ts");
const FIX = join(here, "..", "..", "core", "test", "fixtures", "packs");
const VIN = "WBA00000000000001";

function cli(args: string[]): { code: number | null; out: string; err: string } {
  const r = spawnSync(process.execPath, [MAIN, ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

const tmp = () => mkdtempSync(join(tmpdir(), "od-cli-"));

function twoBackups(): string {
  const store = join(tmp(), "store");
  for (const adapter of ["sim:welcome=0", "sim:welcome=1"]) {
    const r = cli(["backup", "--adapter", adapter, "--pack", "demo", "--store", store]);
    assert.equal(r.code, 0, r.err);
  }
  return store;
}

test("cli: backup saves into the store, backups list and verify work", () => {
  const store = twoBackups();
  const l = cli(["backups", "list", "--store", store, "--json"]);
  assert.equal(l.code, 0, l.err);
  assert.equal(JSON.parse(l.out).length, 2);
  assert.ok(!l.out.includes(VIN), "list never prints the VIN");
  const v = cli(["backups", "verify", "--store", store]);
  assert.equal(v.code, 0, v.err);
  assert.match(v.out, /ok: 2 backup/);
  assert.equal(statSync(store).mode & 0o777, 0o700);
});

test("cli: backups verify fails with exit code 1 after a file is edited", () => {
  const store = twoBackups();
  const entry = JSON.parse(cli(["backups", "list", "--store", store, "--json"]).out)[0];
  const p = join(store, entry.file);
  writeFileSync(p, readFileSync(p, "utf8").replace("verified\": true", "verified\": false"));
  const v = cli(["backups", "verify", "--store", store]);
  assert.equal(v.code, 1);
  assert.match(v.out, /PROBLEM/);
  const one = cli(["backups", "verify", entry.id, "--store", store]);
  assert.equal(one.code, 1);
});

test("cli: backups show prints the car and blocks", () => {
  const store = twoBackups();
  const id = JSON.parse(cli(["backups", "list", "--store", store, "--json"]).out)[0].id as string;
  const s = cli(["backups", "show", id.slice(0, 8), "--store", store]);
  assert.equal(s.code, 0, s.err);
  assert.match(s.out, /block 0x3000/);
  assert.match(s.out, /two identical reads: yes/);
  assert.equal(cli(["backups", "show", "zzzzzz", "--store", store]).code, 1);
});

test("cli: backups export hides the VIN and refuses to overwrite", () => {
  const store = twoBackups();
  const id = JSON.parse(cli(["backups", "list", "--store", store, "--json"]).out)[0].id as string;
  const out = join(tmp(), "export.json");
  const r = cli(["backups", "export", id, "--store", store, "--out", out]);
  assert.equal(r.code, 0, r.err);
  const text = readFileSync(out, "utf8");
  assert.ok(!text.includes(VIN));
  assert.ok(!/"serial:/.test(text));
  assert.equal(statSync(out).mode & 0o777, 0o600);
  assert.equal(cli(["backups", "export", id, "--store", store, "--out", out]).code, 1);
  const withSerial = join(tmp(), "e2.json");
  assert.equal(cli(["backups", "export", id, "--store", store, "--out", withSerial, "--include-serials"]).code, 0);
  assert.match(readFileSync(withSerial, "utf8"), /"serial:/);
  assert.equal(cli(["backups", "export", id, "--store", store]).code, 1);
});

test("cli: restore-plan is a dry run and changes nothing", () => {
  const store = twoBackups();
  const ids = (JSON.parse(cli(["backups", "list", "--store", store, "--json"]).out) as { id: string; file: string }[]);
  const before = readdirSync(store).sort().join();
  const r = cli(["backups", "restore-plan", ids[0]!.id, "--store", store, "--current", ids[1]!.id, "--pack", "demo"]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /DRY RUN/);
  assert.match(r.out, /write block 0x3000/);
  assert.equal(readdirSync(store).sort().join(), before);
  const j = JSON.parse(cli(["backups", "restore-plan", ids[0]!.id, "--store", store, "--json"]).out);
  assert.equal(j.executable, false);
  assert.equal(j.writes_performed, 0);
});

test("cli: backups with no store is empty, and an unknown subcommand shows usage", () => {
  const store = join(tmp(), "none");
  assert.match(cli(["backups", "list", "--store", store]).out, /no backups/);
  assert.equal(existsSync(store), false, "listing does not create the store");
  const r = cli(["backups", "frobnicate", "--store", store]);
  assert.equal(r.code, 1);
  assert.match(r.err, /usage/);
});

test("cli: pack lint passes good packs and fails bad and blocked ones", () => {
  const good = cli(["pack", "lint", join(FIX, "good", "main-cc0.json")]);
  assert.equal(good.code, 0, good.out + good.err);
  const bad = cli(["pack", "lint", join(FIX, "bad", "unknown-licence.json")]);
  assert.equal(bad.code, 1);
  assert.match(bad.out, /unknown licence/);
  const blocked = cli(["pack", "lint", join(FIX, "blocked", "dpf.json")]);
  assert.equal(blocked.code, 1);
  assert.match(blocked.out, /blocked by project policy/);
});

test("cli: pack lint treats a share-alike folder as its own kind of pack", () => {
  const sa = join(FIX, "tree", "share-alike", "sa.json");
  assert.equal(cli(["pack", "lint", sa]).code, 0);
  assert.equal(cli(["pack", "lint", join(FIX, "good", "main-cc0.json"), "--share-alike"]).code, 1);
});

test("cli: a blocked pack cannot be loaded by any command that takes --pack", () => {
  const store = join(tmp(), "store");
  const r = cli(["backup", "--adapter", "sim", "--pack", join(FIX, "blocked", "egr.json"), "--store", store]);
  assert.equal(r.code, 1);
  assert.match(r.err, /blocked by project policy/);
  assert.equal(existsSync(store), false);
});

test("cli: pack init from a real diff writes a skeleton that fails lint until filled in", () => {
  const d = tmp();
  const a = cli(["backup", "--adapter", "sim:welcome=0", "--pack", "demo", "--store", join(d, "s")]);
  const b = cli(["backup", "--adapter", "sim:welcome=1", "--pack", "demo", "--store", join(d, "s")]);
  assert.deepEqual([a.code, b.code], [0, 0]);
  const ids = (JSON.parse(cli(["backups", "list", "--store", join(d, "s"), "--json"]).out) as { id: string }[]).map((e) => e.id);
  const ex = (id: string, n: string) => {
    assert.equal(cli(["backups", "export", id, "--store", join(d, "s"), "--out", join(d, n)]).code, 0);
    return join(d, n);
  };
  const diff = cli(["diff", ex(ids[0]!, "a.json"), ex(ids[1]!, "b.json"), "--json"]);
  assert.equal(diff.code, 0, diff.err);
  writeFileSync(join(d, "diff.json"), diff.out);
  const out = join(d, "pack.json");
  const init = cli(["pack", "init", "--from-diff", join(d, "diff.json"), "--ignore", "62,63", "--out", out]);
  assert.equal(init.code, 0, init.err);
  assert.match(init.out, /TODO_FILL_IN/);
  const lint = cli(["pack", "lint", out]);
  assert.equal(lint.code, 1);
  assert.match(lint.out, /TODO_FILL_IN/);
  assert.equal(cli(["pack", "init", "--from-diff", join(d, "diff.json"), "--ignore", "62,63", "--out", out]).code, 1);
  assert.equal(cli(["pack", "init"]).code, 1);
});
