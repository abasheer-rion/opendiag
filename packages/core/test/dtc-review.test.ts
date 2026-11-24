import { test } from "node:test";
import assert from "node:assert/strict";
import { NegativeResponse, fromHex, isAboutHidingFaults, lintShippedData, readObdDtcDetails, readReadiness } from "../src/index.ts";
import type { Bytes, DiagTransport } from "../src/index.ts";

/** A fake car that answers by hex prefix. Unlisted requests get "service not supported". */
const car = (answers: Record<string, string>): DiagTransport => ({
  name: "fake", open: async () => {}, close: async () => {},
  async request(_t, d: Bytes) {
    const key = [...d].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
    for (const [k, v] of Object.entries(answers)) if (key.startsWith(k)) return fromHex(v);
    return Uint8Array.of(0x7f, d[0] ?? 0, 0x11);
  },
});

test("a refused stored-fault read is an error, never 'no faults'", async () => {
  const t = car({ "03": "7F 03 22", "07": "47 00", "0A": "4A 00" });
  await assert.rejects(() => readObdDtcDetails(t, 0x7e0), NegativeResponse);
});

test("a car with no pending or permanent list still gives its stored faults", async () => {
  const t = car({ "03": "43 01 03 01", "07": "7F 07 11", "0A": "7F 0A 11" });
  const d = await readObdDtcDetails(t, 0x7e0);
  assert.deepEqual(d.map((x) => [x.code, x.listedAs]), [["P0301", "stored"]]);
});

test("readiness this-drive keeps the ignition type and lamp from PID 01, not from PID 41's unused bits", async () => {
  // PID 01: lamp on, 2 faults, diesel (bit 3 of byte B). PID 41 repeats the monitor layout but leaves byte A and bit 3 unused.
  const t = car({ "0101": "41 01 82 4F 62 00", "0141": "41 41 00 47 62 00" });
  const r = await readReadiness(t, 0x7e0);
  assert.equal(r.sinceClear.ignition, "compression");
  assert.equal(r.thisDrive?.ignition, "compression");
  assert.ok(r.thisDrive?.monitors.some((m) => m.name === "Particulate filter" && m.available));
  assert.equal(r.thisDrive?.lampOn, true);
  assert.equal(r.thisDrive?.storedFaultCount, 2);
});

test("suppression wording is caught in more phrasings", () => {
  for (const s of [
    "Turn the check engine lamp off",
    "Switch the warning light off for this code",
    "Remove the check engine light",
    "Get rid of the fault",
    "Erase the code from memory",
    "Clear the fault so it stays gone",
    "Cheat the particulate filter test",
    "Tamper with the oxygen sensor signal",
    "Eliminate the catalyst code",
    "Kill the warning lamp",
  ]) assert.ok(isAboutHidingFaults(s), s);
});

test("normal fault descriptions, including 'switched itself off', are not flagged and the shipped data stays clean", () => {
  for (const s of ["Data bus A has switched itself off", "Brake light switch circuit problem", "Engine computer power relay control circuit problem"]) {
    assert.equal(isAboutHidingFaults(s), false, s);
  }
  assert.deepEqual(lintShippedData(), []);
});
