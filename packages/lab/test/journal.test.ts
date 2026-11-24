import { test, mock } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { mkdtempSync, readFileSync, statSync, writeFileSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Journal, JournalError, LAB_MODULE, consentFor } from "../src/index.ts";
import { makeRig } from "./helpers.ts";

const fresh = (): string => join(mkdtempSync(join(tmpdir(), "lab-journal-")), "j.ndjson");

test("journal: records chain together and read back in order", () => {
  const j = new Journal(fresh());
  j.append("a", "txn_open");
  j.append("a", "intent", { did: 1 });
  j.append("a", "terminal", { state: "COMMITTED" });
  const r = j.records();
  assert.deepEqual(r.map((x) => x.seq), [1, 2, 3]);
  assert.equal(r[1]?.prev.length, 64);
  assert.equal(j.openTxns().length, 0);
});

test("journal: a transaction without a terminal record is open", () => {
  const j = new Journal(fresh());
  j.append("a", "txn_open");
  j.append("b", "txn_open");
  j.append("a", "terminal");
  assert.deepEqual(j.openTxns(), ["b"]);
});

test("journal: every append is fsynced and the file is private", () => {
  const spy = mock.method(fs, "fsyncSync");
  syncBuiltinESMExports();
  try {
    const path = fresh();
    const j = new Journal(path);
    j.append("a", "txn_open");
    j.append("a", "intent");
    assert.equal(spy.mock.callCount(), 2);
    assert.equal(statSync(path).mode & 0o077, 0, "no group or world access");
  } finally {
    spy.mock.restore();
    syncBuiltinESMExports();
  }
});

test("journal: an edited record breaks the chain", () => {
  const path = fresh();
  const j = new Journal(path);
  j.append("a", "txn_open");
  j.append("a", "intent", { did: 1 });
  j.append("a", "terminal");
  writeFileSync(path, readFileSync(path, "utf8").replace('"did":1', '"did":2'));
  assert.throws(() => j.records(), JournalError);
});

test("journal: a deleted record breaks the chain", () => {
  const path = fresh();
  const j = new Journal(path);
  for (const ev of ["txn_open", "intent", "terminal"]) j.append("a", ev);
  const lines = readFileSync(path, "utf8").split("\n");
  writeFileSync(path, [lines[0], lines[2], ""].join("\n"));
  assert.throws(() => j.records(), JournalError);
});

test("journal: a torn last line (crash mid-append) is ignored and cleaned up on the next append", () => {
  const path = fresh();
  const j = new Journal(path);
  j.append("a", "txn_open");
  appendFileSync(path, '{"seq":2,"txn":"a","ev":"inte');
  assert.equal(j.records().length, 1);
  j.append("a", "terminal");
  assert.equal(j.records().length, 2);
  assert.ok(readFileSync(path, "utf8").endsWith("\n"));
});

test("journal: the intent record is on disk before the 0x2E leaves, the result after", async () => {
  const r = makeRig();
  const backup = await r.backup();
  const req = { target: LAB_MODULE, backup, changes: [{ id: "ambient-colour-count", raw: 2 }, { id: "sim-lamp-delay", raw: 1 }] };
  const plan = await r.engine.plan(req);
  const seen: string[] = [];
  r.hooks.before = (d) => {
    if (d[0] !== 0x2e) return;
    const last = new Journal(r.journalPath).records().at(-1);
    seen.push(`${last?.ev}:${last?.did}`);
  };
  await r.engine.apply(req, consentFor(plan.preview, "t"));
  assert.deepEqual(seen, [`intent:${0x3000}`, `intent:${0x3001}`]);
  const evs = r.journal.records().map((x) => x.ev);
  assert.deepEqual(evs.filter((e) => e === "intent" || e === "result"), ["intent", "result", "intent", "result"]);
  assert.equal(evs[0], "txn_open");
  assert.equal(evs.at(-1), "terminal");
});

test("journal: holds hashes and values, never raw block bytes or the VIN", async () => {
  const r = makeRig();
  const backup = await r.backup();
  const req = { target: LAB_MODULE, backup, changes: [{ id: "ambient-colour-count", raw: 2 }] };
  await r.engine.apply(req, consentFor((await r.engine.plan(req)).preview, "t"));
  const text = readFileSync(r.journalPath, "utf8");
  assert.ok(!text.includes(backup.dids[0]!.hex));
  assert.ok(!text.includes("WBA0000"));
});

test("journal: a write after an unfinished one is refused until recovery has run", async () => {
  const r = makeRig();
  const backup = await r.backup();
  r.journal.append("stuck", "txn_open", { module: LAB_MODULE });
  await assert.rejects(() => r.engine.plan({ target: LAB_MODULE, backup, changes: [{ id: "ambient-colour-count", raw: 2 }] }), /unfinished write stuck/);
  assert.equal(r.nonReads().length, 0);
});
