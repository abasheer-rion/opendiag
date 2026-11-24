import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SimTransport, demoVehicle } from "../../core/src/index.ts";
import { collectDtcReport, explainReport, formatDtcReport } from "../src/dtc-cmd.ts";

const main = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "main.ts");

test("UDS report shows exact bytes, status flags with plain lines, meaning with source, and module", async () => {
  const r = await collectDtcReport(new SimTransport(demoVehicle()), "uds", 0x12, { freeze: false, readiness: false });
  const text = formatDtcReport(r);
  assert.match(text, /P0301 {3}module 0x12/);
  assert.match(text, /bytes: {4}03 01 00 09 {3}\(UDS code 030100\)/);
  assert.match(text, /status: {3}0x09 {2}testFailed, confirmed/);
  assert.match(text, /- The check is failing right now\./);
  assert.match(text, /Cylinder 1 is misfiring {2}\[own-words, high confidence, not reviewed yet\]/);
  assert.match(text, /status: {3}0x04 {2}pending/);
  assert.match(text, /trust the UDS code/);
  assert.doesNotMatch(text, /snapshot/);
});

test("--freeze on UDS adds snapshot and extended data, keeping raw bytes when lengths are unknown", async () => {
  const r = await collectDtcReport(new SimTransport(demoVehicle()), "uds", 0x12, { freeze: true, readiness: false });
  const text = formatDtcReport(r);
  assert.match(text, /snapshot raw bytes \(lengths not known\): F4 05 7B F4 0C 1A F8/);
  assert.match(text, /extended raw bytes \(lengths not known\): 01 03/);
  assert.match(text, /snapshot: not offered by this module/); // second fault has no snapshot in the simulator
});

test("OBD report with --freeze and --readiness; readiness is information only", async () => {
  const r = await collectDtcReport(new SimTransport(demoVehicle()), "obd", 0x7e0, { freeze: true, readiness: true });
  const text = formatDtcReport(r);
  assert.match(text, /bytes: {4}03 01\n/);
  assert.match(text, /listed: {3}stored/);
  assert.match(text, /freeze frame 0 \(caused by P0301\)/);
  assert.match(text, /Engine speed: 1726 rpm/);
  assert.match(text, /readiness since codes were cleared \(information only\)/);
  assert.match(text, /Catalyst: not complete/);
  assert.equal(JSON.parse(JSON.stringify(r)).faults[0].detail.code, "P0301");
});

test("a module with no faults says so", async () => {
  const r = await collectDtcReport(new SimTransport(demoVehicle()), "uds", 0x40, { freeze: false, readiness: false });
  assert.equal(formatDtcReport(r), "no faults reported by module 0x40");
});

test("--explain works offline for known, generic-unknown and manufacturer codes", () => {
  const a = explainReport("P0420");
  assert.ok(a.ok);
  assert.match(a.text, /Catalytic converter/);
  assert.match(a.text, /own-words, high confidence/);
  const b = explainReport("P0399");
  assert.match(b.text, /No plain-English line for this exact code yet/);
  const c = explainReport("P1234");
  assert.match(c.text, /not known yet/);
  assert.match(c.text, /P1234/);
  assert.equal(explainReport("nonsense").ok, false);
});

test("the command line: dtc --explain needs no car, and --json is valid JSON", () => {
  const run = (...a: string[]) => execFileSync("node", [main, "dtc", ...a], { encoding: "utf8" });
  const j = JSON.parse(run("--explain", "030100", "--json")) as { code: string; level: number };
  assert.equal(j.code, "P0301");
  assert.equal(j.level, 2);
  const live = JSON.parse(run("--json", "--freeze", "--readiness")) as { faults: unknown[]; readiness: unknown };
  assert.equal(live.faults.length, 6); // the simulator repeats its list for stored, pending and permanent
  assert.ok(live.readiness);
});
