import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SimTransport,
  decodeMonitors,
  demoVehicle,
  describeStatus,
  detailFromObd,
  detailFromUds,
  explainCode,
  fromHex,
  lintEntries,
  lintShippedData,
  loadDtcEntries,
  obdPairs,
  parseDtcInput,
  parseExtendedData,
  parseSnapshot,
  readObdDtcDetails,
  readObdFreezeFrame,
  readReadiness,
  readUdsDtcDetails,
  readUdsExtendedData,
  readUdsSnapshot,
  similarity,
  structuralMeaning,
} from "../src/index.ts";
import type { DtcTextEntry, DiagTransport } from "../src/index.ts";

// ---- fault detail

test("UDS record: raw bytes, 3-byte form, SAE code and status flags with plain lines", () => {
  const d = detailFromUds(fromHex("03 01 00 09"), "0x12");
  assert.equal(d.code, "P0301");
  assert.equal(d.rawHex, "03 01 00 09");
  assert.equal(d.udsHex, "030100");
  assert.equal(d.status, 0x09);
  assert.deepEqual(d.flags.map((f) => f.name), ["testFailed", "confirmed"]);
  assert.ok(d.flags.every((f) => f.line.length > 10));
  assert.equal(d.module, "0x12");
});

test("all eight status bits have a name and a line", () => {
  const all = describeStatus(0xff);
  assert.equal(all.length, 8);
  assert.ok(all.every((f) => f.set && f.line.endsWith(".")));
  assert.equal(describeStatus(0x80)[7]?.name, "warningIndicatorRequested");
  assert.equal(describeStatus(0x00).filter((f) => f.set).length, 0);
});

test("a 3-byte record without status is kept, and a short one is refused", () => {
  const d = detailFromUds(fromHex("C1 40 08"), "0x40");
  assert.equal(d.code, "U0140");
  assert.equal(d.status, undefined);
  assert.deepEqual(d.flags, []);
  assert.throws(() => detailFromUds(fromHex("0301"), "x"), RangeError);
});

test("OBD-II record keeps two raw bytes and which list it came from", () => {
  const d = detailFromObd(0x01, 0x71, "pending", "0x7E0");
  assert.equal(d.code, "P0171");
  assert.equal(d.rawHex, "01 71");
  assert.equal(d.listedAs, "pending");
  assert.equal(d.udsHex, undefined);
});

test("obdPairs handles the CAN count byte and 00 00 padding", () => {
  assert.deepEqual(obdPairs(fromHex("02 0301 0171")), [[3, 1], [1, 0x71]]);
  assert.deepEqual(obdPairs(fromHex("0301 0000")), [[3, 1]]);
});

test("readers against the simulator keep the bytes as received", async () => {
  const t = new SimTransport(demoVehicle());
  const obd = await readObdDtcDetails(t, 0x7e0);
  assert.equal(obd[0]?.rawHex, "03 01");
  const uds = await readUdsDtcDetails(t, 0x12);
  assert.deepEqual(uds.map((d) => [d.udsHex, d.status]), [["030100", 0x09], ["017100", 0x04]]);
  assert.equal(uds[1]?.flags[0]?.name, "pending");
});

test("parseDtcInput takes P-codes and hex", () => {
  assert.equal(parseDtcInput("p0301")?.code, "P0301");
  assert.equal(parseDtcInput("0301")?.code, "P0301");
  assert.equal(parseDtcInput("c14000")?.code, "U0140");
  assert.equal(parseDtcInput("U0140")?.hi, 0xc1);
  assert.equal(parseDtcInput("hello"), undefined);
  assert.equal(parseDtcInput("P4000"), undefined);
});

// ---- freeze frame and snapshots (byte fixtures)

test("OBD mode 02 freeze frame from the simulator", async () => {
  const ff = await readObdFreezeFrame(new SimTransport(demoVehicle()), 0x7e0);
  assert.equal(ff?.dtc, "P0301");
  assert.equal(ff?.values.find((v) => v.name === "Engine speed")?.value, 1726);
  assert.equal(ff?.values.find((v) => v.name === "Coolant temperature")?.value, 83);
});

test("freeze frame: a module with none gives undefined, an unknown PID stays raw", async () => {
  const none: DiagTransport = { name: "x", open: async () => {}, close: async () => {}, request: async (_t, d) => Uint8Array.of(0x7f, d[0] ?? 0, 0x31) };
  assert.equal(await readObdFreezeFrame(none), undefined);
  const odd: DiagTransport = {
    name: "x", open: async () => {}, close: async () => {},
    async request(_t, d) {
      const pid = d[1] ?? 0;
      if (pid === 0x02) return fromHex("42 02 00 01 71");
      if (pid === 0x00) return fromHex("42 00 00 00 00 00 10"); // only PID 0x1C is listed
      if (pid === 0x1c) return fromHex("42 1C 00 06");
      return Uint8Array.of(0x7f, 0x02, 0x31);
    },
  };
  const ff = await readObdFreezeFrame(odd);
  assert.equal(ff?.dtc, "P0171");
  assert.deepEqual(ff?.unknown, [{ pid: 0x1c, hex: "06" }]);
  assert.deepEqual(ff?.values, []);
});

test("0x19 04 snapshot with known lengths", () => {
  const body = fromHex("04 030100 09  01 02  F405 7B  F40C 1AF8");
  const s = parseSnapshot(body, new Map([[0xf405, 1], [0xf40c, 2]]));
  assert.equal(s.dtcHex, "030100");
  assert.deepEqual(s.statusFlags, ["testFailed", "confirmed"]);
  assert.deepEqual(s.records[0]?.identifiers, [{ did: 0xf405, hex: "7B" }, { did: 0xf40c, hex: "1A F8" }]);
  assert.equal(s.leftoverHex, undefined);
});

test("0x19 04 snapshot with unknown lengths keeps the rest raw and never guesses", () => {
  const s = parseSnapshot(fromHex("04 030100 09 01 02 F405 7B F40C 1AF8"));
  assert.deepEqual(s.records[0]?.identifiers, []);
  assert.equal(s.leftoverHex, "F4 05 7B F4 0C 1A F8");
});

test("0x19 04 snapshot, two records and a truncated tail", () => {
  const lengths = new Map([[0xf405, 1]]);
  const two = parseSnapshot(fromHex("04 030100 09 01 01 F405 7B 02 01 F405 7C"), lengths);
  assert.deepEqual(two.records.map((r) => r.recordNumber), [1, 2]);
  const cut = parseSnapshot(fromHex("04 030100 09 01 01 F405"), lengths);
  assert.equal(cut.leftoverHex, "F4 05");
  assert.throws(() => parseSnapshot(fromHex("02 030100 09")), /not a snapshot/);
});

test("0x19 06 extended data: specific record, known lengths, unknown lengths", () => {
  const one = parseExtendedData(fromHex("06 030100 09 01 03"), 0x01);
  assert.deepEqual(one.records, [{ recordNumber: 1, hex: "03" }]);
  const many = parseExtendedData(fromHex("06 030100 09 01 03 02 0A0B"), 0xff, new Map([[1, 1], [2, 2]]));
  assert.deepEqual(many.records.map((r) => r.hex), ["03", "0A 0B"]);
  const raw = parseExtendedData(fromHex("06 030100 09 01 03 02 0A0B"), 0xff);
  assert.equal(raw.records.length, 0);
  assert.equal(raw.leftoverHex, "01 03 02 0A 0B");
});

test("UDS snapshot and extended data readers: simulator, and a module without them", async () => {
  const t = new SimTransport(demoVehicle());
  const dtc = fromHex("030100");
  const s = await readUdsSnapshot(t, 0x12, dtc, 0xff, new Map([[0xf405, 1], [0xf40c, 2]]));
  assert.equal(s?.records[0]?.identifiers.length, 2);
  const e = await readUdsExtendedData(t, 0x12, dtc, 0x01);
  assert.equal(e?.records[0]?.hex, "03");
  assert.equal(await readUdsSnapshot(t, 0x12, fromHex("999999")), undefined);
});

// ---- readiness

test("readiness: spark ignition fixture", () => {
  const r = decodeMonitors(fromHex("81 07 E5 45"));
  assert.equal(r.lampOn, true);
  assert.equal(r.storedFaultCount, 1);
  assert.equal(r.ignition, "spark");
  const by = Object.fromEntries(r.monitors.map((m) => [m.name, m]));
  assert.deepEqual(by["Misfire"], { name: "Misfire", available: true, complete: true });
  assert.deepEqual(by["Catalyst"], { name: "Catalyst", available: true, complete: false });
  assert.equal(by["Secondary air"]?.available, false);
  assert.equal(by["Oxygen sensor"]?.complete, true);
});

test("readiness: continuous monitor not complete, compression ignition names", () => {
  const r = decodeMonitors(fromHex("00 4F 62 00"));
  assert.equal(r.lampOn, false);
  assert.equal(r.ignition, "compression");
  assert.equal(r.monitors.find((m) => m.name === "Other components")?.complete, false);
  assert.ok(r.monitors.some((m) => m.name === "Particulate filter" && m.available && m.complete));
  assert.ok(!r.monitors.some((m) => m.name === "Reserved"));
});

test("readiness from the simulator; PID 41 absent is fine", async () => {
  const r = await readReadiness(new SimTransport(demoVehicle()), 0x7e0);
  assert.equal(r.sinceClear.lampOn, true);
  assert.equal(r.thisDrive, undefined);
});

// ---- text

test("explain: our own line, with source and confidence", () => {
  const m = explainCode("P0301");
  assert.equal(m?.level, 2);
  assert.equal(m?.source, "own-words");
  assert.equal(m?.reviewed, false);
  assert.match(m?.text ?? "", /Cylinder 1/);
  assert.equal(explainCode("0301")?.code, "P0301");
});

test("structural meaning for generic codes without a line", () => {
  const m = explainCode("P0399");
  assert.equal(m?.level, 1);
  assert.equal(m?.known, false);
  assert.match(m?.text ?? "", /ignition or misfire/);
  assert.match(m?.text ?? "", /P0399/);
});

test("manufacturer-specific codes say honestly they are not known", () => {
  for (const c of ["P1234", "P3000", "B1000", "C1234", "U1000", "U2100"]) {
    const m = structuralMeaning(c);
    assert.equal(m.scope, "manufacturer", c);
    assert.equal(m.known, false);
    assert.match(m.text, /not known yet/);
    assert.ok(m.text.includes(c));
  }
  assert.equal(structuralMeaning("P3400").scope, "reserved");
  assert.equal(structuralMeaning("U3000").scope, "reserved");
});

test("a table entry is never overridden by a guess, and unknown input is refused", () => {
  assert.equal(explainCode("P0A80")?.system, "hybrid");
  assert.equal(explainCode("not a code"), undefined);
  const custom = new Map<string, DtcTextEntry>();
  assert.equal(explainCode("P0301", custom)?.level, 1);
});

test("shipped data: about 300 or more entries across all four families, lint clean", () => {
  const all = loadDtcEntries();
  assert.ok(all.length >= 300, `only ${all.length}`);
  for (const letter of "PCBU") assert.ok(all.some((e) => e.code.startsWith(letter)), letter);
  assert.deepEqual(lintShippedData(), []);
});

// ---- linter

const good: DtcTextEntry = { code: "P0100", text: "Air flow sensor circuit problem", system: "fuel-air", source: "own-words", confidence: "high", reviewed: false, added: "2026-11-24" };

test("lint passes a clean entry", () => assert.deepEqual(lintEntries([good]), []));

test("lint: duplicates, missing source or confidence, long text, bad code", () => {
  const p = lintEntries([
    good,
    good,
    { ...good, code: "P0101", source: "x" as "own-words" },
    { ...good, code: "P0102", confidence: undefined as unknown as "high" },
    { ...good, code: "P0103", text: "x".repeat(161) },
    { ...good, code: "P9999" },
    { ...good, code: "P0104", reviewed: true },
  ]);
  assert.ok(p.some((x) => /P0100: duplicate/.test(x)));
  assert.ok(p.some((x) => /P0101: missing or wrong source/.test(x)));
  assert.ok(p.some((x) => /P0102: missing confidence/.test(x)));
  assert.ok(p.some((x) => /P0103: text is 161/.test(x)));
  assert.ok(p.some((x) => /P9999: not a valid code/.test(x)));
  assert.ok(p.some((x) => /P0104: reviewed/.test(x)));
});

test("lint: 160 characters is allowed", () => {
  assert.deepEqual(lintEntries([{ ...good, text: "y".repeat(160) }]), []);
});

test("lint: denylist similarity catches identical and lightly edited text, not unrelated text", () => {
  const bad = "Mass or volume air flow circuit malfunction";
  assert.equal(similarity(bad, bad), 1);
  assert.ok(similarity(bad, "Mass or volume air flow circuit malfunction.") >= 0.8);
  assert.ok(similarity(bad, "Air flow sensor circuit problem") < 0.8);
  assert.ok(lintEntries([{ ...good, text: bad }], [bad]).some((x) => /denylist/.test(x)));
  assert.ok(lintEntries([{ ...good, text: "MASS OR VOLUME AIR FLOW CIRCUIT MALFUNCTION!" }], [bad]).some((x) => /denylist/.test(x)));
  assert.deepEqual(lintEntries([good], [bad]), []);
  assert.deepEqual(lintEntries([good], []), []);
});
