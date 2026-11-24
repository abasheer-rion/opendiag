import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { HsfzTransport, SimTransport, demoVehicle, startSimHsfzServer, toHex } from "../../core/src/index.ts";
import type { Bytes, DiagTransport } from "../../core/src/index.ts";
import { SessionRefused, checkClearFlags, runSession } from "../src/session.ts";
import type { SessionOptions, SessionResult } from "../src/session.ts";

const here = dirname(fileURLToPath(import.meta.url));
const VIN = "WBA00000000000001";
const VIN_HEX = Buffer.from(VIN).toString("hex").toUpperCase();

interface Spy extends DiagTransport {
  sent: Bytes[];
  opens: number;
}

function spy(inner: DiagTransport, hook?: (n: number, data: Bytes) => Bytes | undefined): Spy {
  const s: Spy = {
    name: inner.name,
    sent: [],
    opens: 0,
    async open() {
      s.opens++;
      await inner.open();
    },
    close: () => inner.close(),
    async request(target, data, timeoutMs) {
      s.sent.push(data);
      const forced = hook?.(s.sent.length, data);
      if (forced) return forced;
      return inner.request(target, data, timeoutMs);
    },
  };
  return s;
}

function scratch(): { base: string; out: string; done: () => void } {
  const base = mkdtempSync(join(tmpdir(), "opendiag-session-"));
  return { base, out: join(base, "cap"), done: () => rmSync(base, { recursive: true, force: true }) };
}

const goodClear = { targets: ["0x12"], batteryVolts: "12.6", yes: true };

async function run(extra: Partial<SessionOptions> & { out: string }, t: DiagTransport = new SimTransport()): Promise<SessionResult> {
  const { out, ...rest } = extra;
  return runSession({ transport: t, adapter: "sim", outDir: out, ...rest });
}

const sids = (s: Spy): number[] => s.sent.map((d) => d[0] ?? -1);
const json = <T>(p: string): T => JSON.parse(readFileSync(p, "utf8")) as T;

test("full session on the simulator: steps, counts, files, no VIN in clear text", async () => {
  const d = scratch();
  try {
    const t = spy(new SimTransport());
    const r = await run({ out: d.out, backup: true }, t);
    assert.equal(r.stopped, null);
    assert.deepEqual(r.modules, [0x12, 0x40]);
    assert.equal(r.modules_stable, true);
    assert.equal(r.vin_stable, true);
    const by = (n: string) => r.steps.find((s) => s.name === n);
    assert.equal(by("vin")?.requests, 1);
    assert.equal(by("scan")?.requests, 112);
    // the second timing sample repeats exactly one VIN read and one full scan
    assert.equal(by("vin_2")?.requests, 1);
    assert.equal(by("scan_2")?.requests, 112);
    assert.equal(by("vin_after_idle")?.requests, 1);
    assert.equal(by("probe_0x12")?.requests, 32);
    assert.equal(r.scans.length, 2);
    assert.equal(r.scans[0]?.timings.length, 112);
    assert.equal(r.probes.length, 2);
    assert.equal(r.dids.length, 2);
    assert.equal(r.dids.every((x) => x.ok && x.matches_vin !== false), true);
    assert.equal(r.counts.requests, t.sent.length);
    assert.equal(r.steps.reduce((n, s) => n + s.requests, 0), t.sent.length);
    assert.equal(r.backups.filter((b) => b.verified).length, 2);
    assert.match(r.notes.join(" "), /identification data only/);
    const traceLines = readFileSync(join(d.out, "session.odtrace"), "utf8").trim().split("\n");
    assert.equal(traceLines.length, t.sent.length);
    // everything sent was a read
    assert.ok(sids(t).every((s) => [0x01, 0x19, 0x22, 0x3e].includes(s)));
    // session.json and the shareable trace carry no VIN
    const sj = readFileSync(join(d.out, "session.json"), "utf8");
    assert.ok(!sj.includes(VIN) && !sj.includes(VIN_HEX));
    assert.equal(r.vin_hash?.length, 16);
    const shareable = readFileSync(join(d.out, "session.shareable.odtrace"), "utf8");
    assert.ok(!shareable.includes(VIN_HEX));
    assert.ok(readFileSync(join(d.out, "session.odtrace"), "utf8").includes(VIN_HEX));
    assert.deepEqual(Object.keys(json<object>(join(d.out, "dtc.json"))), ["0x12"]);
    assert.equal(existsSync(join(d.out, "clear.json")), false);
    assert.ok(readdirSync(join(d.out, "backups")).includes("0x12"));
  } finally {
    d.done();
  }
});

test("output folder is created with mode 700, files are private", async () => {
  const d = scratch();
  try {
    await run({ out: join(d.base, "a", "b", "cap"), backup: true });
    const dir = join(d.base, "a", "b", "cap");
    assert.equal(statSync(dir).mode & 0o777, 0o700);
    assert.equal(statSync(join(dir, "backups")).mode & 0o777, 0o700);
    for (const f of ["session.json", "dtc.json", "session.odtrace", "salt.private"]) assert.equal(statSync(join(dir, f)).mode & 0o077, 0, f);
    // an existing empty folder is tightened too
    const loose = join(d.base, "loose");
    mkdirSync(loose, { mode: 0o755 });
    await run({ out: loose });
    assert.equal(statSync(loose).mode & 0o777, 0o700);
  } finally {
    d.done();
  }
});

test("refuses a folder inside the git repo, a non-empty folder, and a missing --out; sends nothing", async () => {
  const d = scratch();
  try {
    const inRepo = join(here, "..", "..", "..", "captures-should-not-exist");
    const t = spy(new SimTransport());
    for (const p of [inRepo, join(inRepo, "deep", "er"), join(here, "x"), join(d.base, "..", "..", "..", "..", "..", "..", "..", "..", "..", here)]) {
      if (!existsSync(join(here, "..", "..", "..", ".git"))) continue; // not a checkout: nothing to test
      await assert.rejects(() => run({ out: p }, t), (e: unknown) => e instanceof SessionRefused && /git repository/.test(e.message), p);
    }
    assert.equal(existsSync(inRepo), false);
    mkdirSync(d.out);
    writeFileSync(join(d.out, "old.txt"), "x");
    await assert.rejects(() => run({ out: d.out }, t), /not empty/);
    await assert.rejects(() => run({ out: "" }, t), SessionRefused);
    assert.equal(t.opens, 0);
    assert.equal(t.sent.length, 0);
  } finally {
    d.done();
  }
});

test("clear flags: every bad combination is refused", () => {
  const bad: [string, Partial<typeof goodClear> & { targets?: string[]; batteryVolts?: string | undefined }][] = [
    ["no target", { targets: [] }],
    ["two targets", { targets: ["0x12", "0x40"] }],
    ["range", { targets: ["0x10-0x7f"] }],
    ["list", { targets: ["0x12,0x40"] }],
    ["all", { targets: ["all"] }],
    ["functional address", { targets: ["0xdf"] }],
    ["tester address", { targets: ["0xf4"] }],
    ["zero", { targets: ["0"] }],
    ["no volts", { batteryVolts: undefined }],
    ["volts not a number", { batteryVolts: "abc" }],
    ["volts low", { batteryVolts: "12.3" }],
    ["volts just low", { batteryVolts: "12.39" }],
    ["volts silly", { batteryVolts: "124" }],
    ["no yes", { yes: false }],
  ];
  for (const [name, over] of bad) assert.ok(checkClearFlags({ ...goodClear, ...over }).reasons.length > 0, name);
  assert.deepEqual(checkClearFlags(goodClear), { target: 0x12, reasons: [] });
  assert.equal(checkClearFlags({ ...goodClear, batteryVolts: "12.4" }).reasons.length, 0);
  assert.equal(checkClearFlags({ ...goodClear, targets: ["18"] }).target, 18);
});

test("clear gating: a missing flag refuses before the car is even opened", async () => {
  const d = scratch();
  try {
    const cases: Record<string, SessionOptions["clear"]> = {
      "no battery": { targets: ["0x12"], yes: true },
      "low battery": { targets: ["0x12"], batteryVolts: "12.3", yes: true },
      "no yes flag": { targets: ["0x12"], batteryVolts: "12.6", yes: false },
      "no target": { targets: [], batteryVolts: "12.6", yes: true },
      "range": { targets: ["0x10-0x7f"], batteryVolts: "12.6", yes: true },
      "two": { targets: ["0x12", "0x13"], batteryVolts: "12.6", yes: true },
      "stray yes only": { targets: [], yes: true },
    };
    for (const [name, clear] of Object.entries(cases)) {
      const t = spy(new SimTransport());
      let asked = 0;
      await assert.rejects(() => run({ out: join(d.base, name), clear, confirm: async () => (asked++, "CLEAR") }, t), SessionRefused, name);
      assert.equal(t.opens, 0, name);
      assert.equal(t.sent.length, 0, name);
      assert.equal(asked, 0, name);
      assert.equal(existsSync(join(d.base, name)), false, name);
    }
  } finally {
    d.done();
  }
});

test("clear gating: typed word, saved faults and answering module are checked; nothing is cleared", async () => {
  const d = scratch();
  try {
    const baseline = spy(new SimTransport());
    await run({ out: join(d.base, "base") }, baseline);

    const refused = async (name: string, over: Partial<SessionOptions>, clear = goodClear, t: Spy = spy(new SimTransport())) => {
      const r = await run({ out: join(d.base, name), clear, ...over }, t);
      assert.equal(r.clear?.done, false, name);
      assert.ok((r.clear?.refused?.length ?? 0) > 0, name);
      assert.ok(!sids(t).includes(0x14), name);
      assert.equal(existsSync(join(d.base, name, "clear.json")), false, name);
      return { r, t };
    };

    for (const [i, typed] of ["", "clear", "Clear", "yes", "CLEAR!", "y"].entries()) {
      const { t } = await refused(`typed-${i}`, { confirm: async () => typed });
      assert.equal(t.sent.length, baseline.sent.length, "no extra request");
    }
    await refused("no-confirm", {});
    // module with no saved faults: nothing to clear
    const none = await refused("no-faults", { confirm: async () => "CLEAR" }, { ...goodClear, targets: ["0x40"] });
    assert.match(none.r.clear?.refused?.join(" ") ?? "", /nothing to clear/);
    // module that does not answer
    const silent = await refused("silent", { confirm: async () => "CLEAR" }, { ...goodClear, targets: ["0x55"] });
    assert.match(silent.r.clear?.refused?.join(" ") ?? "", /did not answer/);
    // dtc.json is re-read from disk: if it has been emptied the clear is refused
    const out = join(d.base, "emptied");
    const wiped = spy(new SimTransport(), (n) => (n === 3 ? (writeFileSync(join(out, "dtc.json"), "{}"), undefined) : undefined));
    const r = await run({ out, clear: goodClear, confirm: async () => "CLEAR" }, wiped);
    assert.equal(r.clear?.done, false);
    assert.match(r.clear?.refused?.join(" ") ?? "", /dtc\.json/);
    assert.ok(!sids(wiped).includes(0x14));
  } finally {
    d.done();
  }
});

test("clear: all conditions met sends one 0x14 FFFFFF to one module, then re-reads once", async () => {
  const d = scratch();
  try {
    const baseline = spy(new SimTransport());
    await run({ out: join(d.base, "base") }, baseline);
    const t = spy(new SimTransport());
    let asked = 0;
    const r = await run({ out: d.out, clear: goodClear, confirm: async () => (asked++, " CLEAR\n") }, t);
    assert.equal(asked, 1);
    assert.equal(r.clear?.done, true);
    assert.equal(r.clear?.before, 2);
    assert.equal(r.clear?.after, 0);
    const clears = t.sent.filter((s) => s[0] === 0x14);
    assert.equal(clears.length, 1);
    assert.equal(toHex(clears[0] as Bytes, ""), "14FFFFFF");
    // exactly two extra requests: the clear and one re-read, and the clear is not the first write-like thing
    assert.equal(t.sent.length, baseline.sent.length + 2);
    assert.deepEqual(t.sent.slice(-2).map((s) => toHex(s, "")), ["14FFFFFF", "1902FF"]);
    const rec = json<{ target: string; before: unknown[]; after: unknown[] }>(join(d.out, "clear.json"));
    assert.equal(rec.target, "0x12");
    assert.equal(rec.before.length, 2);
    assert.equal(rec.after.length, 0);
    // the trace shows it
    assert.equal(readFileSync(join(d.out, "session.odtrace"), "utf8").split("\n").filter((l) => l.includes('"req":"14FFFFFF"')).length, 1);
    // dtc.json still holds the faults from BEFORE
    assert.equal(json<Record<string, unknown[]>>(join(d.out, "dtc.json"))["0x12"]?.length, 2);
  } finally {
    d.done();
  }
});

test("stop rules: connection error, unexpected negative response; no clear after a stop", async () => {
  const d = scratch();
  try {
    let asked = 0;
    const confirm = async () => (asked++, "CLEAR");
    // link dies on the 4th request
    const dead = spy(new SimTransport(), (n) => {
      if (n === 4) throw new Error("ENET connection closed");
      return undefined;
    });
    const r1 = await run({ out: join(d.base, "dead"), clear: goodClear, confirm }, dead);
    assert.match(r1.stopped?.reason ?? "", /connection closed/);
    assert.equal(dead.sent.length, 4);
    assert.equal(r1.clear, null);
    assert.ok(existsSync(join(d.base, "dead", "session.json")));
    assert.ok(existsSync(join(d.base, "dead", "dtc.json")));
    // unexpected negative response (conditionsNotCorrect to the DTC read)
    const nrc = spy(new SimTransport(), (_n, data) => (data[0] === 0x19 ? Uint8Array.of(0x7f, 0x19, 0x22) : undefined));
    const r2 = await run({ out: join(d.base, "nrc"), clear: goodClear, confirm }, nrc);
    assert.match(r2.stopped?.reason ?? "", /unexpected negative response 0x22/);
    assert.equal(nrc.sent.length, 2);
    // "not supported" style answers are fine
    const ok = spy(new SimTransport(), (_n, data) => (data[0] === 0x01 ? Uint8Array.of(0x7f, 0x01, 0x11) : undefined));
    const r3 = await run({ out: join(d.base, "ok") }, ok);
    assert.equal(r3.stopped, null);
    assert.equal(r3.steps.find((s) => s.name === "pids")?.ok, false);
    // no answer at all to the first VIN read
    const mute = spy(new SimTransport(new (await import("../../core/src/index.ts")).SimVehicle()));
    const r4 = await run({ out: join(d.base, "mute") }, mute);
    assert.match(r4.stopped?.reason ?? "", /no answer/);
    // cannot connect
    const closed: DiagTransport = { name: "x", open: async () => { throw new Error("connect to 192.168.0.10:6801 timed out"); }, close: async () => {}, request: async () => new Uint8Array() };
    const r5 = await run({ out: join(d.base, "closed") }, closed);
    assert.match(r5.stopped?.reason ?? "", /could not connect/);
    assert.ok(!readFileSync(join(d.base, "closed", "session.json"), "utf8").includes("192.168"));
    assert.equal(asked, 0);
  } finally {
    d.done();
  }
});

test("idle gap sends nothing; backup off means no backups folder", async () => {
  const d = scratch();
  try {
    const slept: number[] = [];
    const t = spy(new SimTransport());
    let during = -1;
    const r = await run({ out: d.out, idleSeconds: 300, sleep: async (ms) => { slept.push(ms); during = t.sent.length; } }, t);
    assert.deepEqual(slept, [300000]);
    assert.equal(r.steps.find((s) => s.name === "idle")?.requests, 0);
    assert.equal(r.idle_seconds, 300);
    assert.equal(r.steps.at(-1)?.name, "vin_after_idle");
    assert.ok(during > 0 && during < t.sent.length);
    assert.equal(existsSync(join(d.out, "backups")), false);
    await assert.rejects(() => run({ out: join(d.base, "n"), idleSeconds: -1 }), SessionRefused);
  } finally {
    d.done();
  }
});

test("session over the HSFZ fake gateway: no address in the output, adapter is a label", async () => {
  const d = scratch();
  const srv = await startSimHsfzServer(demoVehicle());
  try {
    const t = new HsfzTransport({ host: "127.0.0.1", port: srv.port });
    const r = await run({ out: d.out, adapter: "enet", range: [0x10, 0x14], quickTimeoutMs: 40, backup: true, clear: goodClear, confirm: async () => "CLEAR" }, t);
    assert.equal(r.stopped, null, r.stopped?.reason);
    assert.deepEqual(r.modules, [0x12]);
    assert.equal(r.clear?.done, true);
    assert.equal(r.clear?.after, 0);
    assert.equal(r.steps.find((s) => s.name === "scan_2")?.requests, 5);
    for (const f of ["session.json", "session.shareable.odtrace"]) {
      const txt = readFileSync(join(d.out, f), "utf8");
      assert.ok(!txt.includes("127.0.0.1") && !txt.includes(VIN_HEX), f);
    }
    assert.equal(r.adapter, "enet");
    const backup = readFileSync(join(d.out, "backups", "0x12", readdirSync(join(d.out, "backups", "0x12"))[0] as string), "utf8");
    assert.ok(!backup.includes("127.0.0.1"));
  } finally {
    await srv.close();
    d.done();
  }
});
