import { test } from "node:test";
import assert from "node:assert/strict";
import { SimEcu, simTestKey, fromHex } from "../../core/src/index.ts";
import type { Bytes } from "../../core/src/index.ts";
import { labVehicle, LAB_MODULE } from "../src/index.ts";

function ecu(unlock = true): SimEcu {
  return labVehicle({ unlock }).ecus.get(LAB_MODULE) as SimEcu;
}
const h = (e: SimEcu, hex: string): string => {
  const r = e.handle(fromHex(hex));
  return r ? Array.from(r, (b) => b.toString(16).padStart(2, "0")).join("") : "none";
};
function unlocked(e: SimEcu): void {
  h(e, "1003");
  const seed = e.handle(fromHex("2701")) as Bytes;
  const key = simTestKey(seed.subarray(2));
  assert.equal(Array.from(e.handle(Uint8Array.of(0x27, 0x02, ...key)) as Bytes).join(","), "103,2");
}
const WRITE = "2E3001" + "00".repeat(16);

test("sim 0x2E: needs the extended session (NRC 0x7F), a known DID (0x31) and the right length (0x13)", () => {
  const e = ecu(false);
  assert.equal(h(e, WRITE), "7f2e7f");
  h(e, "1003");
  assert.equal(h(e, "2E4000" + "00"), "7f2e31");
  assert.equal(h(e, "2E3001" + "00"), "7f2e13");
  assert.equal(e.writeCount, 0);
});

test("sim 0x2E: security access is required when configured (NRC 0x33), test-double key unlocks it", () => {
  const e = ecu();
  h(e, "1003");
  assert.equal(h(e, WRITE), "7f2e33");
  unlocked(e);
  assert.equal(h(e, WRITE), "6e3001");
  assert.equal(e.writeCount, 1);
});

test("sim 0x27: wrong key gives 0x35, third wrong key 0x36, default session refuses (0x7F)", () => {
  const e = ecu();
  assert.equal(h(e, "2701"), "7f277f");
  h(e, "1003");
  const codes: string[] = [];
  for (let i = 0; i < 3; i++) {
    e.handle(fromHex("2701"));
    codes.push(h(e, "270200000000"));
  }
  assert.deepEqual(codes, ["7f2735", "7f2735", "7f2736"]);
});

test("sim: ECU without write support answers 0x2E with serviceNotSupported", () => {
  const e = new SimEcu({ vin: "X" });
  assert.equal(h(e, WRITE), "7f2e11");
});

test("sim faults: injected NRCs 0x22 and 0x72, counted and cleared", () => {
  const e = ecu(false);
  h(e, "1003");
  e.faults.nrcOnWrite = 0x22;
  e.faults.nrcOnWriteTimes = 1;
  assert.equal(h(e, WRITE), "7f2e22");
  assert.equal(h(e, WRITE), "6e3001");
  e.faults.nrcOnWrite = 0x72;
  assert.equal(h(e, WRITE), "7f2e72");
});

test("sim faults: dropped reply still stores the data, corrupt write stores other bytes", () => {
  const e = ecu(false);
  h(e, "1003");
  e.faults.dropNextReplies = 1;
  assert.equal(h(e, "2E3001" + "01".repeat(16)), "none");
  assert.deepEqual(e.cfg.dids?.[0x3001], Array(16).fill(1));
  e.faults.corruptNextWrites = 1;
  assert.equal(h(e, "2E3001" + "02".repeat(16)), "6e3001");
  assert.equal(e.cfg.dids?.[0x3001]?.at(-1), 3);
});

test("sim faults: brown-out voltage is reported on PID 0x42 and refuses writes below 10.5 V (NRC 0x93)", () => {
  const e = ecu(false);
  h(e, "1003");
  assert.equal(h(e, "0142"), "4142384e");
  e.faults.voltage = 9;
  assert.equal(h(e, "0142"), "41422328");
  assert.equal(h(e, WRITE), "7f2e93");
});

test("sim faults: disconnect mid-write lands half the bytes and the module goes silent", () => {
  const e = ecu(false);
  h(e, "1003");
  const before = [...(e.cfg.dids?.[0x3001] ?? [])];
  e.faults.disconnectDuringWrite = true;
  assert.equal(h(e, "2E3001" + "ff".repeat(16)), "none");
  const now = e.cfg.dids?.[0x3001] ?? [];
  assert.deepEqual(now.slice(0, 8), Array(8).fill(0xff));
  assert.deepEqual(now.slice(8), before.slice(8));
  assert.equal(h(e, "22F190"), "none");
  e.faults.offline = false;
  assert.notEqual(h(e, "22F190"), "none");
});

test("sim faults: response pending frames come through poll(), silent requests are ignored", () => {
  const e = ecu(false);
  h(e, "1003");
  e.faults.pendingReplies = 2;
  assert.equal(h(e, WRITE), "7f2e78");
  assert.equal(Array.from(e.poll() as Bytes).join(","), "127,46,120");
  assert.equal(Array.from(e.poll() as Bytes).join(","), "110,48,1");
  e.faults.silentRequests = 1;
  assert.equal(h(e, "22F190"), "none");
  assert.notEqual(h(e, "22F190"), "none");
});

test("sim: returning to the default session locks security access again", () => {
  const e = ecu();
  unlocked(e);
  h(e, "1001");
  h(e, "1003");
  assert.equal(h(e, WRITE), "7f2e33");
});
