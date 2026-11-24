import assert from "node:assert/strict";
import { test } from "node:test";
import { DTC_GENERIC, explainDtc } from "../src/data/dtc-generic.ts";
import { ENGINE, SimSession } from "../src/data/session.ts";
import { WriteBlockedError } from "../src/data/core.ts";

test("dictionary: about 40 own-words entries, no duplicates", () => {
  assert.ok(DTC_GENERIC.length >= 40);
  assert.equal(new Set(DTC_GENERIC.map((d) => d.code)).size, DTC_GENERIC.length);
  for (const d of DTC_GENERIC) {
    assert.equal(d.source, "own-words");
    assert.ok(["high", "medium", "low"].includes(d.confidence));
    assert.match(d.code, /^[PCBU][0-9A-F]{4}$/);
    assert.ok(d.meaning.length > 5);
  }
  assert.equal(explainDtc("p0301")?.code, "P0301");
  assert.equal(explainDtc("P9999"), undefined);
});

test("session: vin and module scan with fault counts", async () => {
  const s = new SimSession();
  assert.equal(await s.readVin(), "WBA00000000000001");
  const mods = await s.scan();
  assert.deepEqual(mods.map((m) => [m.address, m.faultCount]), [[0x12, 2], [0x40, 0]]);
});

test("session: faults carry plain-English meaning and stored/pending", async () => {
  const f = await new SimSession().faults(ENGINE);
  assert.deepEqual(f.map((x) => [x.code, x.kind]), [["P0301", "stored"], ["P0171", "pending"]]);
  assert.equal(f[0]?.info?.meaning, "Cylinder 1 is misfiring");
});

test("session: live data rows", async () => {
  const rows = await new SimSession().live();
  assert.ok(rows.length >= 5);
  assert.deepEqual(rows[0], { name: "Engine speed", value: "1726 rpm" });
});

test("session: settings decode with the demo pack; module without coding gives null", async () => {
  const s = new SimSession();
  const rows = await s.settings(ENGINE);
  assert.deepEqual(rows?.map((r) => [r.label, r.value, r.checksumOk]), [
    ["Ambient light colours available", "Standard", true],
    ["Welcome light on unlock", "Off", true],
  ]);
  assert.equal(await s.settings(0x40), null);
});

test("session: backups list and compare", async () => {
  const s = new SimSession();
  const a = await s.makeBackup();
  assert.equal(a.verified, true);
  s.simulateAmbient(2);
  const b = await s.makeBackup();
  assert.equal(s.backups.length, 2);
  const c = s.compare(a, b);
  assert.deepEqual(c.settings, [{ label: "Ambient light colours available", before: "Standard", after: "Extended" }]);
  assert.equal(c.diffs[0]?.status, "changed");
  const same = s.compare(a, a);
  assert.equal(same.diffs[0]?.status, "same");
  assert.equal(same.settings.length, 0);
});

test("session: every write is refused by the read-only guard", async () => {
  const s = new SimSession();
  await assert.rejects(async () => s.transport.request(ENGINE, Uint8Array.of(0x14, 0xff, 0xff, 0xff)), WriteBlockedError);
  await assert.rejects(async () => s.transport.request(ENGINE, Uint8Array.of(0x2e, 0x30, 0x00, 0x01)), WriteBlockedError);
  await assert.rejects(async () => s.transport.request(ENGINE, Uint8Array.of(0x04)), WriteBlockedError);
});
