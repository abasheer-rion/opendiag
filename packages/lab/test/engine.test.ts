import { test } from "node:test";
import assert from "node:assert/strict";
import { verifyIntegrity } from "../../core/src/index.ts";
import { HardStop, LAB_MODULE, LAB_PACK, RecoveryRequired, RollbackFailed, consentFor } from "../src/index.ts";
import { makeRig } from "./helpers.ts";

const T = LAB_MODULE;
const AMBIENT = { id: "ambient-colour-count", raw: 2 };
const LAMP = { id: "sim-lamp-delay", raw: 2 };

test("write: preview, consent, 0x2E, read back, committed", async () => {
  const r = makeRig();
  const backup = await r.backup();
  const req = { target: T, backup, changes: [AMBIENT] };
  const plan = await r.engine.plan(req);
  assert.equal(r.writes(), 0, "planning sends no write");
  assert.equal(plan.preview.changes[0]?.before, "Standard");
  assert.equal(plan.preview.changes[0]?.after, "Extended");
  const kinds = plan.preview.bytes.map((b) => b.kind).sort();
  assert.deepEqual(kinds, ["checksum", "checksum", "field"]);

  const out = await r.engine.apply(req, consentFor(plan.preview, "test"));
  assert.equal(out.state, "COMMITTED");
  assert.equal(r.writes(), 1);
  const block = Uint8Array.from(r.ecu.cfg.dids?.[0x3000] ?? []);
  const opt = LAB_PACK.coding[0]!;
  assert.equal(verifyIntegrity(opt, block)?.ok, true, "checksum was recalculated by the pack rule");
  assert.equal(r.journal.openTxns().length, 0);
});

test("write: two blocks are written in order and committed", async () => {
  const r = makeRig();
  const backup = await r.backup();
  const req = { target: T, backup, changes: [LAMP, AMBIENT] };
  const plan = await r.engine.plan(req);
  const out = await r.engine.apply(req, consentFor(plan.preview, "test"));
  assert.equal(out.state, "COMMITTED");
  const dids = r.sent.filter((d) => d[0] === 0x2e).map((d) => (d[1]! << 8) | d[2]!);
  assert.deepEqual(dids, [0x3000, 0x3001]);
});

test("write: a module without security access needs no key provider", async () => {
  const r = makeRig({ unlock: false, cfg: { keyProvider: undefined as never } });
  const backup = await r.backup();
  const req = { target: T, backup, changes: [AMBIENT] };
  const out = await r.engine.apply(req, consentFor((await r.engine.plan(req)).preview, "t"));
  assert.equal(out.state, "COMMITTED");
});

test("write: a module that wants an unlock and has no key provider is rolled back, nothing lands", async () => {
  const r = makeRig({ cfg: { keyProvider: undefined as never } });
  const backup = await r.backup();
  const req = { target: T, backup, changes: [AMBIENT] };
  const out = await r.engine.apply(req, consentFor((await r.engine.plan(req)).preview, "t"));
  assert.equal(out.state, "ABORTED");
  assert.match(out.reason ?? "", /key provider/);
  assert.equal(r.writes(), 0);
  assert.equal(await r.stateHash(), backup.sha256);
});

test("fault: lost reply is not a failure when the read-back matches", async () => {
  const r = makeRig();
  const backup = await r.backup();
  r.ecu.faults.dropNextReplies = 1;
  const req = { target: T, backup, changes: [AMBIENT] };
  const out = await r.engine.apply(req, consentFor((await r.engine.plan(req)).preview, "t"));
  assert.equal(out.state, "COMMITTED");
  assert.ok(r.journal.records().some((x) => x.ev === "result" && x.outcome === "no reply"));
});

test("fault: corrupted write is caught by the read-back and rolled back with a second verify", async () => {
  const r = makeRig();
  const backup = await r.backup();
  r.ecu.faults.corruptNextWrites = 1;
  const req = { target: T, backup, changes: [AMBIENT] };
  const out = await r.engine.apply(req, consentFor((await r.engine.plan(req)).preview, "t"));
  assert.equal(out.state, "ROLLED_BACK");
  assert.equal(await r.stateHash(), backup.sha256);
  assert.equal(r.writes(), 2, "one write, one restore");
  const evs = r.journal.records().map((x) => x.ev);
  assert.ok(evs.includes("rollback_verified"));
  assert.equal(evs.at(-1), "terminal");
});

test("fault: restore that is itself corrupted is retried, then verified", async () => {
  const r = makeRig();
  const backup = await r.backup();
  r.ecu.faults.corruptNextWrites = 2;
  const req = { target: T, backup, changes: [AMBIENT] };
  const out = await r.engine.apply(req, consentFor((await r.engine.plan(req)).preview, "t"));
  assert.equal(out.state, "ROLLED_BACK");
  assert.equal(r.writes(), 3);
  assert.equal(await r.stateHash(), backup.sha256);
});

for (const nrc of [0x22, 0x31, 0x33, 0x72]) {
  test(`fault: module answers write with NRC 0x${nrc.toString(16)}, nothing changes`, async () => {
    const r = makeRig();
    const backup = await r.backup();
    r.ecu.faults.nrcOnWrite = nrc;
    r.ecu.faults.nrcOnWriteTimes = 1;
    const req = { target: T, backup, changes: [AMBIENT] };
    const out = await r.engine.apply(req, consentFor((await r.engine.plan(req)).preview, "t"));
    assert.ok(out.state === "ABORTED" || out.state === "ROLLED_BACK");
    assert.match(out.reason ?? "", new RegExp(`0x${nrc.toString(16)}`));
    assert.equal(await r.stateHash(), backup.sha256);
  });
}

test("fault: response pending (0x78) is waited out, a never-ending one is read back and decided", async () => {
  const a = makeRig();
  const ba = await a.backup();
  a.ecu.faults.pendingReplies = 3;
  const reqA = { target: T, backup: ba, changes: [AMBIENT] };
  assert.equal((await a.engine.apply(reqA, consentFor((await a.engine.plan(reqA)).preview, "t"))).state, "COMMITTED");

  const b = makeRig();
  const bb = await b.backup();
  b.ecu.faults.pendingReplies = Infinity;
  const reqB = { target: T, backup: bb, changes: [AMBIENT] };
  const out = await b.engine.apply(reqB, consentFor((await b.engine.plan(reqB)).preview, "t"));
  assert.equal(out.state, "COMMITTED", "the write landed, the read-back proves it");
});

test("fault: voltage drops between two block writes, the first block is put back", async () => {
  const r = makeRig();
  const backup = await r.backup();
  const req = { target: T, backup, changes: [AMBIENT, LAMP] };
  const plan = await r.engine.plan(req);
  r.hooks.after = (d) => {
    if (d[0] === 0x2e) r.ecu.faults.voltage = 11.0; // above the module's own limit, below ours
  };
  const out = await r.engine.apply(req, consentFor(plan.preview, "t"));
  assert.equal(out.state, "ROLLED_BACK");
  assert.match(out.reason ?? "", /voltage/);
  assert.equal(await r.stateHash(), backup.sha256);
  assert.equal(r.sent.filter((d) => d[0] === 0x2e && d[1] === 0x30 && d[2] === 0x01).length, 0, "second block never sent");
});

test("fault: brown-out deep enough that the module refuses the restore, then recovery after power returns", async () => {
  const r = makeRig();
  const backup = await r.backup();
  const req = { target: T, backup, changes: [AMBIENT, LAMP] };
  const plan = await r.engine.plan(req);
  r.hooks.after = (d) => {
    if (d[0] === 0x2e) r.ecu.faults.voltage = 9.0;
  };
  await assert.rejects(() => r.engine.apply(req, consentFor(plan.preview, "t")), RollbackFailed);
  assert.notEqual(await r.stateHash(), backup.sha256);
  await assert.rejects(() => r.restart().plan(req), RecoveryRequired);
  r.hooks.after = undefined;
  r.ecu.faults.voltage = 13.8;
  const done = await r.restart().recover([backup]);
  assert.equal(done[0]?.state, "ROLLED_BACK");
  assert.equal(await r.stateHash(), backup.sha256);
  assert.equal(r.journal.openTxns().length, 0);
});

test("fault: disconnect mid-write leaves a half-written block, recovery restores it", async () => {
  const r = makeRig();
  const backup = await r.backup();
  r.ecu.faults.disconnectDuringWrite = true;
  const req = { target: T, backup, changes: [AMBIENT] };
  const consent = consentFor((await r.engine.plan(req)).preview, "t");
  await assert.rejects(() => r.engine.apply(req, consent), RollbackFailed);
  assert.notEqual(await r.stateHash(), backup.sha256, "block is left half written");
  await assert.rejects(() => r.restart().apply(req, undefined), RecoveryRequired);

  r.ecu.faults.offline = false; // cable back
  const done = await r.restart().recover([backup]);
  assert.equal(done[0]?.state, "ROLLED_BACK");
  assert.equal(await r.stateHash(), backup.sha256);
  // and writing works again
  const fresh = await r.backup();
  const req2 = { target: T, backup: fresh, changes: [AMBIENT] };
  const e2 = r.restart();
  assert.equal((await e2.apply(req2, consentFor((await e2.plan(req2)).preview, "t"))).state, "COMMITTED");
});

test("kill: process dies after the write landed, restart finds it committed", async () => {
  const r = makeRig();
  const backup = await r.backup();
  const req = { target: T, backup, changes: [AMBIENT] };
  const plan = await r.engine.plan(req);
  r.hooks.after = (d) => {
    if (d[0] === 0x2e) throw new HardStop();
  };
  await assert.rejects(() => r.engine.apply(req, consentFor(plan.preview, "t")), HardStop);
  r.hooks.after = undefined;
  const last = r.journal.records().at(-1);
  assert.equal(last?.ev, "intent", "intent was written, no result");
  await assert.rejects(() => r.restart().plan(req), RecoveryRequired);
  const done = await r.restart().recover([backup]);
  assert.equal(done[0]?.state, "COMMITTED");
  assert.notEqual(await r.stateHash(), backup.sha256);
});

test("kill: process dies before the write reached the module, restart finds nothing changed", async () => {
  const r = makeRig();
  const backup = await r.backup();
  const req = { target: T, backup, changes: [AMBIENT] };
  const plan = await r.engine.plan(req);
  r.hooks.before = (d) => {
    if (d[0] === 0x2e) throw new HardStop();
  };
  await assert.rejects(() => r.engine.apply(req, consentFor(plan.preview, "t")), HardStop);
  r.hooks.before = undefined;
  const done = await r.restart().recover([backup]);
  assert.equal(done[0]?.state, "ABORTED");
  assert.equal(await r.stateHash(), backup.sha256);
});

test("kill: process dies between two blocks, restart puts the first one back", async () => {
  const r = makeRig();
  const backup = await r.backup();
  const req = { target: T, backup, changes: [AMBIENT, LAMP] };
  const plan = await r.engine.plan(req);
  let n = 0;
  r.hooks.after = (d) => {
    if (d[0] === 0x2e && ++n === 1) throw new HardStop();
  };
  await assert.rejects(() => r.engine.apply(req, consentFor(plan.preview, "t")), HardStop);
  r.hooks.after = undefined;
  const done = await r.restart().recover([backup]);
  assert.equal(done[0]?.state, "ROLLED_BACK");
  assert.equal(await r.stateHash(), backup.sha256);
});

test("kill during rollback: restart finishes the rollback", async () => {
  const r = makeRig();
  const backup = await r.backup();
  r.ecu.faults.corruptNextWrites = 1;
  const req = { target: T, backup, changes: [AMBIENT] };
  const plan = await r.engine.plan(req);
  let n = 0;
  r.hooks.after = (d) => {
    if (d[0] === 0x2e && ++n === 2) throw new HardStop(); // the restore write
  };
  await assert.rejects(() => r.engine.apply(req, consentFor(plan.preview, "t")), HardStop);
  r.hooks.after = undefined;
  const done = await r.restart().recover([backup]);
  assert.equal(await r.stateHash(), backup.sha256);
  assert.ok(done[0]?.state === "ROLLED_BACK" || done[0]?.state === "ABORTED");
});

test("recovery refuses when the backup for the open write was not supplied", async () => {
  const r = makeRig();
  const backup = await r.backup();
  const req = { target: T, backup, changes: [AMBIENT] };
  const plan = await r.engine.plan(req);
  r.hooks.before = (d) => {
    if (d[0] === 0x2e) throw new HardStop();
  };
  await assert.rejects(() => r.engine.apply(req, consentFor(plan.preview, "t")), HardStop);
  await assert.rejects(() => r.restart().recover([]), /backup for/);
  assert.equal(r.journal.openTxns().length, 1, "still open");
});

test("journal that cannot be written: refuse before anything is sent", async () => {
  const r = makeRig();
  const backup = await r.backup();
  const req = { target: T, backup, changes: [AMBIENT] };
  const plan = await r.engine.plan(req);
  const bad = r.restart("/nonexistent-dir-for-lab-test/j.ndjson");
  await assert.rejects(() => bad.apply(req, consentFor(plan.preview, "t")));
  assert.equal(r.writes(), 0);
});

test("restore: puts the backup back and verifies", async () => {
  const r = makeRig();
  const backup = await r.backup();
  const req = { target: T, backup, changes: [AMBIENT, LAMP] };
  await r.engine.apply(req, consentFor((await r.engine.plan(req)).preview, "t"));
  assert.notEqual(await r.stateHash(), backup.sha256);
  const res = await r.engine.restore(backup, T);
  assert.equal(res.state, "ROLLED_BACK");
  assert.equal(await r.stateHash(), backup.sha256);
});

test("restore: refuses on a wrong module or an unverified backup, sends no write", async () => {
  const r = makeRig();
  const backup = await r.backup();
  await assert.rejects(() => r.engine.restore(backup, 0x40), /refused/);
  await assert.rejects(() => r.engine.restore({ ...backup, verified: false }, T), /refused/);
  await assert.rejects(() => r.engine.restore({ ...backup, sha256: "0".repeat(64) }, T), /refused/);
  assert.equal(r.nonReads().length, 0);
});

test("round trip: 100 write-then-restore cycles end with identical hashes (KPI G4)", async () => {
  let ok = 0;
  const r = makeRig();
  for (let i = 0; i < 100; i++) {
    const backup = await r.backup();
    const raw = i % 2 === 0 ? 2 : 0;
    const req = { target: T, backup, changes: i % 3 === 0 ? [{ id: AMBIENT.id, raw }, { id: LAMP.id, raw: 1 + (i % 2) }] : [{ id: "welcome-light", raw: 1 }] };
    const e = i % 10 === 0 ? r.restart() : r.engine; // fresh journal path reuse is fine; engine is stateless
    const plan = await e.plan(req);
    const out = await e.apply(req, consentFor(plan.preview, "t"));
    assert.equal(out.state, "COMMITTED", `cycle ${i}`);
    assert.notEqual(await r.stateHash(), backup.sha256);
    await e.restore(backup, T);
    assert.equal(await r.stateHash(), backup.sha256, `cycle ${i}`);
    ok++;
    // reset the module to the same starting point for the next cycle (it already is: restored)
    r.ecu.faults.voltage = undefined;
    delete r.ecu.faults.voltage;
  }
  assert.equal(ok, 100);
});

test("write is a no-op refusal when the module already holds the value", async () => {
  const r = makeRig();
  const backup = await r.backup();
  await assert.rejects(() => r.engine.plan({ target: T, backup, changes: [{ id: "ambient-colour-count", raw: 1 }] }), /changes something/);
  assert.equal(r.nonReads().length, 0);
});
