import { test } from "node:test";
import assert from "node:assert/strict";
import type { Backup, CodingOption, Pack } from "../../core/src/index.ts";
import { BLOCKED_WORDS, Journal, LAB_MODULE, LAB_PACK, LabEngine, LabRefusal, consentFor } from "../src/index.ts";
import type { ChangeRequest, Consent } from "../src/index.ts";
import { makeRig } from "./helpers.ts";
import type { Rig } from "./helpers.ts";

/**
 * KPI G5: no write without a verified backup, matching identity, enough battery, an allowed option,
 * consent and a fresh backup. Every attempt below must be refused AND send nothing that could change
 * the module: no 0x2E, no 0x27, no ECU reset, no extended session.
 */

const T = LAB_MODULE;
const AMBIENT = [{ id: "ambient-colour-count", raw: 2 }];
const HOUR = 60 * 60 * 1000;

interface Case {
  name: string;
  expect: RegExp;
  rig?: Parameters<typeof makeRig>[0];
  /** Returns the request to try. `consent` defaults to a good consent for the untouched module. */
  go: (r: Rig, b: Backup) => Promise<{ req?: Partial<ChangeRequest>; consent?: Consent | undefined | "good" }> | { req?: Partial<ChangeRequest>; consent?: Consent | undefined | "good" };
}

const cases: Case[] = [];
const add = (c: Case): void => void cases.push(c);

// 1. No verified backup (hash, flag, contents)
add({ name: "backup not marked verified", expect: /verified backup/, go: (_r, b) => ({ req: { backup: { ...b, verified: false } } }) });
add({ name: "backup with no blocks", expect: /verified backup/, go: (_r, b) => ({ req: { backup: { ...b, dids: [] } } }) });
add({ name: "backup hash all zeros", expect: /verified backup/, go: (_r, b) => ({ req: { backup: { ...b, sha256: "0".repeat(64) } } }) });
add({ name: "backup hash empty", expect: /verified backup/, go: (_r, b) => ({ req: { backup: { ...b, sha256: "" } } }) });
for (let i = 0; i < 12; i++) {
  add({
    name: `backup hash digit ${i} flipped`,
    expect: /verified backup/,
    go: (_r, b) => ({ req: { backup: { ...b, sha256: b.sha256.slice(0, i) + (b.sha256[i] === "a" ? "b" : "a") + b.sha256.slice(i + 1) } } }),
  });
}
for (const i of [0, 5, 20, 63]) {
  add({
    name: `backup block byte ${i} edited, hash kept`,
    expect: /verified backup/,
    go: (_r, b) => {
      const d = b.dids[0]!;
      const hex = d.hex.slice(0, 2 * i) + (d.hex.slice(2 * i, 2 * i + 2) === "00" ? "01" : "00") + d.hex.slice(2 * i + 2);
      return { req: { backup: { ...b, dids: [{ ...d, hex }, ...b.dids.slice(1)] } } };
    },
  });
}
add({ name: "second block dropped from backup", expect: /verified backup/, go: (_r, b) => ({ req: { backup: { ...b, dids: b.dids.slice(0, 1) } } }) });

// 2. Wrong identity
add({ name: "backup has no vin", expect: /identity/, go: (_r, b) => ({ req: { backup: { ...b, vin: null } } }) });
add({ name: "backup has no identity", expect: /identity/, go: (_r, b) => ({ req: { backup: { ...b, identity: {} } } }) });
add({ name: "backup is for another module address", expect: /module allowed/, go: (_r, b) => ({ req: { backup: { ...b, module_addr: 0x40 } } }) });
add({ name: "target differs from backup module", expect: /module allowed/, go: () => ({ req: { target: 0x7e0 } }) });
for (let i = 0; i < 10; i++) {
  add({
    name: `live serial number byte ${i} differs`,
    expect: /identity/,
    go: (r) => {
      const id = r.ecu.cfg.dids?.[0xf18c] as number[];
      id[i] = (id[i] ?? 0) ^ 0x01;
      return {};
    },
  });
}
add({ name: "live hardware number differs", expect: /identity/, go: (r) => ((r.ecu.cfg.dids as Record<number, number[]>)[0xf191] = [0x41, 0x42], {}) });
add({ name: "live software version differs", expect: /identity/, go: (r) => ((r.ecu.cfg.dids as Record<number, number[]>)[0xf195] = [0x41, 0x42], {}) });
add({ name: "live module reports no identity", expect: /identity/, go: (r) => { for (const d of [0xf18c, 0xf191, 0xf195]) delete (r.ecu.cfg.dids as Record<number, number[]>)[d]; return {}; } });
add({ name: "backup identity value forged", expect: /identity/, go: (_r, b) => ({ req: { backup: { ...b, identity: Object.fromEntries(Object.keys(b.identity).map((k) => [k, "FORGED"])) } } }) });

// 3. Low or unreadable voltage
for (const v of [0, 3, 6, 8, 9, 10, 10.5, 11, 11.5, 11.9, 12, 12.4, 12.49]) {
  add({ name: `battery at ${v} V`, expect: /battery voltage/, go: (r) => ((r.ecu.faults.voltage = v), {}) });
}
add({ name: "battery voltage unreadable", expect: /battery voltage/, go: (r) => (delete (r.ecu.cfg.pids as Record<number, number[]>)[0x42], {}) });
add({ name: "battery voltage reply is garbage", expect: /battery voltage/, go: (r) => ((r.ecu.cfg.pids as Record<number, number[]>)[0x42] = [0], {}) });
add({ name: "battery fine but minimum raised above it", expect: /battery voltage/, rig: { cfg: { minVolts: 15 } }, go: () => ({}) });

// 4. Blocked or unsuitable options
const base = LAB_PACK.coding[0] as CodingOption;
const packWith = (o: Partial<CodingOption> & { tags?: string[] }): Pack => ({ ...LAB_PACK, coding: [{ ...base, id: "opt", ...o } as CodingOption] });
for (const w of BLOCKED_WORDS) {
  add({ name: `option tagged "${w}"`, expect: /policy/, rig: { pack: packWith({ tags: [w] } as never) }, go: () => ({ req: { changes: [{ id: "opt", raw: 2 }] } }) });
}
for (const [id, label] of [
  ["disable-dpf-warning", "Turn off particulate filter warning"],
  ["egr-delete", "EGR off"],
  ["hide-mil", "Turn off check engine light"],
  ["readiness-ready", "Set readiness monitors to complete"],
  ["adblue-off", "Disable AdBlue warning"],
  ["odo", "Odometer offset"],
  ["airbag-lamp", "Airbag lamp off"],
] as const) {
  add({ name: `option "${id}"`, expect: /policy/, rig: { pack: packWith({ id, label }) }, go: () => ({ req: { changes: [{ id, raw: 2 }] } }) });
}
for (const tier of ["T0", "T2", "T3", "RED", "AMBER", "BLOCKED", "", "x"]) {
  add({ name: `option tier "${tier}" with limit T1`, expect: /tier/, rig: { pack: packWith({ risk_tier: tier }) }, go: () => ({ req: { changes: [{ id: "opt", raw: 2 }] } }) });
}
{
  const { integrity: _drop, ...noSum } = base;
  void _drop;
  add({ name: "option without a checksum rule", expect: /checksum rule/, rig: { pack: { ...LAB_PACK, coding: [{ ...noSum, id: "opt" } as CodingOption] } }, go: () => ({ req: { changes: [{ id: "opt", raw: 2 }] } }) });
}
add({ name: "option not in the pack", expect: /known/, go: () => ({ req: { changes: [{ id: "raw-write-anything", raw: 1 }] } }) });
add({ name: "value not in the option's list", expect: /value/, go: () => ({ req: { changes: [{ id: "ambient-colour-count", raw: 3 }] } }) });
add({ name: "value is not an integer", expect: /value/, go: () => ({ req: { changes: [{ id: "ambient-colour-count", raw: 1.5 }] } }) });
add({ name: "option listed twice", expect: /known/, go: () => ({ req: { changes: [...AMBIENT, ...AMBIENT] } }) });

// 5. No (or wrong) consent
const goodConsent = async (r: Rig, changes = AMBIENT): Promise<Consent> => {
  const pristine = makeRig();
  void r;
  return consentFor((await pristine.engine.plan({ target: T, backup: await pristine.backup(), changes })).preview, "tester");
};
add({ name: "no consent", expect: /consent/, go: () => ({ consent: undefined }) });
add({ name: "consent is null", expect: /consent/, go: () => ({ consent: null as never }) });
add({ name: "consent is a string", expect: /consent/, go: () => ({ consent: "yes" as never }) });
add({ name: "consent is an empty object", expect: /consent/, go: () => ({ consent: {} as never }) });
add({ name: "consent of the wrong kind", expect: /consent/, go: async (r) => ({ consent: { ...(await goodConsent(r)), kind: "ok" as never } }) });
add({ name: "consent for another module", expect: /consent/, go: async (r) => ({ consent: { ...(await goodConsent(r)), module: 0x40 } }) });
add({ name: "consent for another backup", expect: /consent/, go: async (r) => ({ consent: { ...(await goodConsent(r)), backupSha256: "1".repeat(64) } }) });
add({ name: "consent for another change", expect: /consent/, go: async (r) => ({ consent: await goodConsent(r, [{ id: "ambient-colour-count", raw: 0 }]) }) });
add({ name: "consent hash tampered", expect: /consent/, go: async (r) => ({ consent: { ...(await goodConsent(r)), intendedSha256: "2".repeat(64) } }) });
add({ name: "consent with no name", expect: /consent/, go: async (r) => ({ consent: { ...(await goodConsent(r)), grantedBy: "  " } }) });

// 6. Stale backup
add({ name: "backup two hours old", expect: /backup fresh/, rig: { now: () => new Date(Date.now() + 2 * HOUR) }, go: () => ({}) });
add({ name: "backup a day old", expect: /backup fresh/, rig: { now: () => new Date(Date.now() + 24 * HOUR) }, go: () => ({}) });
add({ name: "backup dated in the future", expect: /backup fresh/, rig: { now: () => new Date(Date.now() - HOUR) }, go: () => ({}) });
add({ name: "backup date is garbage", expect: /backup fresh/, go: (_r, b) => ({ req: { backup: { ...b, created_utc: "yesterday-ish" } } }) });
for (const [did, i] of [[0x3000, 0], [0x3000, 12], [0x3000, 20], [0x3000, 40], [0x3000, 63], [0x3001, 3]] as const) {
  add({
    name: `module block ${did.toString(16)} byte ${i} changed after the backup`,
    expect: /unchanged since backup/,
    go: (r) => {
      const blk = r.ecu.cfg.dids?.[did] as number[];
      blk[i] = (blk[i] ?? 0) ^ 0x80;
      return { req: { changes: did === 0x3001 ? [{ id: "sim-lamp-delay", raw: 2 }] : AMBIENT } };
    },
  });
}

// 7. Other ways in
add({ name: "module not on the allowed list", expect: /module allowed/, rig: { cfg: { allowedModules: [] } }, go: () => ({}) });
add({ name: "module list names another module", expect: /module allowed/, rig: { cfg: { allowedModules: [0x40] } }, go: () => ({}) });
add({ name: "empty change list", expect: /changes present/, go: () => ({ req: { changes: [] } }) });
add({ name: "write cap of zero blocks", expect: /write cap/, rig: { cfg: { maxWrites: 0 } }, go: () => ({}) });
add({ name: "change that matches what the module already holds", expect: /changes something/, go: () => ({ req: { changes: [{ id: "ambient-colour-count", raw: 1 }] } }) });

test("bypass table has at least 100 attempts", () => {
  assert.ok(cases.length >= 100, `only ${cases.length}`);
});

test("every bypass attempt is refused with the right reason and sends nothing that writes (KPI G5)", async () => {
  let refused = 0;
  for (const c of cases) {
    const r = makeRig(c.rig);
    const backup = await r.backup();
    const step = await c.go(r, backup);
    const before = await r.stateHash();
    const req: ChangeRequest = { target: T, backup, changes: AMBIENT, ...step.req };
    const consent = "consent" in step && step.consent !== "good" ? step.consent : await goodConsent(r);
    await assert.rejects(
      () => r.engine.apply(req, consent),
      (e: unknown) => {
        assert.ok(e instanceof LabRefusal, `${c.name}: expected a refusal, got ${String(e)}`);
        assert.match((e as Error).message, c.expect, c.name);
        return true;
      },
      c.name,
    );
    assert.equal(r.nonReads().length, 0, `${c.name}: sent ${r.nonReads().length} non-read requests`);
    assert.equal(r.ecu.writeCount, 0, c.name);
    assert.equal(await r.stateHash(), before, c.name);
    assert.equal(r.journal.openTxns().length, 0, c.name);
    refused++;
  }
  assert.equal(refused, cases.length);
});

test("simulator pack is refused on a real adapter name, with zero traffic", async () => {
  const r = makeRig();
  const backup = await r.backup();
  const sent: number[] = [];
  const e = new LabEngine({
    transport: { name: "enet:192.0.2.1", open: async () => {}, close: async () => {}, request: async (_t, d) => (sent.push(d[0] ?? 0), new Uint8Array()) },
    pack: LAB_PACK,
    journal: new Journal(r.journalPath),
    config: { allowedModules: [T] },
  });
  await assert.rejects(() => e.apply({ target: T, backup, changes: AMBIENT }, undefined), /adapter fits pack/);
  assert.equal(sent.length, 0);
});

test("a refusal leaves a journal note and no open write", async () => {
  const r = makeRig();
  const backup = await r.backup();
  await assert.rejects(() => r.engine.apply({ target: T, backup, changes: AMBIENT }, undefined), LabRefusal);
  const recs = r.journal.records();
  assert.equal(recs.at(-1)?.ev, "refused");
  assert.equal(r.journal.openTxns().length, 0);
});
