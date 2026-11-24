import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SimTransport,
  WriteBlockedError,
  demoVehicle,
  fromHex,
  lintEntries,
  isAboutHidingFaults,
  readObdDtcDetails,
  readObdFreezeFrame,
  readReadiness,
  readUdsDtcDetails,
  readUdsExtendedData,
  readUdsSnapshot,
  readOnly,
} from "../src/index.ts";
import type { Bytes, DiagTransport, DtcTextEntry } from "../src/index.ts";
import * as detail from "../src/dtc-detail.ts";
import * as freeze from "../src/freeze.ts";
import * as readiness from "../src/readiness.ts";
import * as text from "../src/dtc-text.ts";
import * as lint from "../src/dtc-lint.ts";

/**
 * Policy: nothing in the fault-reading code can hide a fault, switch off the warning lamp or
 * touch emissions monitors. Clearing stored codes stays in the clearing client, behind its own gates.
 */

const here = dirname(fileURLToPath(import.meta.url));
const src = (f: string) => readFileSync(join(here, "..", "src", f), "utf8");

/** Every request that could change what the car reports, per emissions or lamp topic. */
const REQUESTS: [topic: string, request: string][] = [
  ["warning lamp: clear codes (mode 04)", "04"],
  ["warning lamp: clear codes (UDS 0x14)", "14 FF FF FF"],
  ["warning lamp: stop fault logging (control DTC setting off)", "85 02"],
  ["warning lamp: write a DID", "2E F1 90 41"],
  ["particulate filter: start a routine", "31 01 F0 00"],
  ["particulate filter: IO control", "2F 40 00 03"],
  ["catalyst: write a DID", "2E 40 20 00"],
  ["EGR: IO control", "2F 41 00 03 00"],
  ["EGR: routine control", "31 01 02 00"],
  ["EVAP: IO control", "2F 41 10 03"],
  ["EVAP: routine control (leak test)", "31 01 03 00"],
  ["oxygen sensor: write a DID", "2E 41 30 01"],
  ["readiness monitors: clear (mode 04 resets them)", "04"],
  ["readiness monitors: extended session then write", "10 03"],
  ["any module: security access", "27 01"],
  ["any module: reset", "11 01"],
  ["any module: download", "34 00 44 00 00 00 00 00 10"],
];

test("every emissions or lamp request is refused by the read-only guard", async () => {
  for (const [topic, hex] of REQUESTS) {
    const sent: Bytes[] = [];
    const inner: DiagTransport = { name: "spy", open: async () => {}, close: async () => {}, request: async (_t, d) => (sent.push(d), d) };
    assert.throws(() => readOnly(inner).request(0x12, fromHex(hex)), WriteBlockedError, topic);
    assert.equal(sent.length, 0, `${topic}: reached the wire`);
  }
});

test("the new readers send only read services, even when handed a raw transport", async () => {
  const sent: Bytes[] = [];
  const sim = new SimTransport(demoVehicle());
  const t: DiagTransport = {
    name: "spy", open: async () => {}, close: async () => {},
    request: (target, d, ms) => (sent.push(d), sim.request(target, d)),
  };
  const dtc = fromHex("030100");
  await readObdDtcDetails(t, 0x7e0);
  await readUdsDtcDetails(t, 0x12);
  await readObdFreezeFrame(t, 0x7e0);
  await readReadiness(t, 0x7e0);
  await readUdsSnapshot(t, 0x12, dtc);
  await readUdsExtendedData(t, 0x12, dtc);
  assert.ok(sent.length > 10);
  const allowed = new Set([0x01, 0x02, 0x03, 0x07, 0x0a, 0x19]);
  for (const d of sent) assert.ok(allowed.has(d[0] ?? -1), `unexpected service 0x${(d[0] ?? 0).toString(16)}`);
  // the only 0x19 subfunctions are the three read ones
  for (const d of sent.filter((x) => x[0] === 0x19)) assert.ok([0x02, 0x04, 0x06].includes(d[1] ?? -1));
});

test("the new modules cannot import or build a write", () => {
  const files = ["dtc-detail.ts", "freeze.ts", "readiness.ts", "dtc-text.ts", "dtc-lint.ts"];
  const forbidden = [
    /client-clear/, /ClearingClient/, /clearDtc/, /CLEAR_DTC/, /WRITE_DID/, /ROUTINE\b/, /SECURITY_ACCESS/, /ECU_RESET/,
    /readOnlyExcept/, /obdRequest\(\s*0x04/, /Uint8Array\.of\(\s*0x(14|85|2e|2f|31|27|11|34|36|3d)\b/i,
  ];
  for (const f of files) for (const re of forbidden) assert.doesNotMatch(src(f), re, `${f} matches ${re}`);
});

test("no exported function in the new modules is about clearing, hiding or switching things off", () => {
  const names = [detail, freeze, readiness, text, lint].flatMap((m) => Object.keys(m));
  assert.ok(names.length > 20);
  for (const n of names) assert.doesNotMatch(n, /^(clear|reset|suppress|disable|hide|mask|bypass|write)|Clear|Suppress|Disable|Bypass|Write/, n);
});

const SUPPRESSION_TEXTS = [
  "Hides the particulate filter warning",
  "Turn off the check engine lamp for this code",
  "Disable the EGR monitor",
  "Suppress P0420 so it never shows",
  "Delete the catalyst fault",
  "Bypass the oxygen sensor check",
  "Mask the readiness monitors",
  "Emulate a working evap monitor",
  "Switch off the warning light",
  "Deactivate the diesel particulate filter check",
  "Remove the lamp request for this fault",
  "Ignore the fault and keep driving",
];

test("data entries about suppressing emissions or lamp faults are rejected by the linter", () => {
  for (const t of SUPPRESSION_TEXTS) {
    assert.ok(isAboutHidingFaults(t), t);
    const e: DtcTextEntry = { code: "P0420", text: t, system: "emission", source: "own-words", confidence: "high", reviewed: false, added: "2026-11-24" };
    assert.ok(lintEntries([e]).some((p) => /hiding or switching off/.test(p)), t);
  }
});

test("ordinary descriptions are not flagged", () => {
  for (const t of ["Catalytic converter is working below the expected level, bank 1", "Warning lamp control circuit problem", "Diesel particulate filter is clogged with soot"]) {
    assert.equal(isAboutHidingFaults(t), false, t);
  }
});
