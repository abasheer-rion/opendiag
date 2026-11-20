import { test } from "node:test";
import assert from "node:assert/strict";
import {
  Reassembler,
  DoipDecoder,
  HsfzDecoder,
  NegativeResponse,
  decodeObdDtc,
  decodePid,
  decodeUdsDtc,
  diagFrame,
  diagMessage,
  expectPositive,
  fromHex,
  parseDiagMessage,
  parseDiagPayload,
  parseDtcByStatusMask,
  parseDtcList,
  parseSupported,
  parseVin,
  segment,
  toHex,
} from "../src/index.ts";

test("decodeObdDtc maps the two high bits to P/C/B/U", () => {
  assert.equal(decodeObdDtc(0x03, 0x01), "P0301");
  assert.equal(decodeObdDtc(0x41, 0x23), "C0123");
  assert.equal(decodeObdDtc(0x81, 0x00), "B0100");
  assert.equal(decodeObdDtc(0xc1, 0x00), "U0100");
  assert.equal(decodeObdDtc(0x21, 0xab), "P21AB");
});

test("decodeUdsDtc keeps raw bytes and status flags", () => {
  const d = decodeUdsDtc(fromHex("480A12 09"), 0, true);
  assert.equal(d.raw, "480A12");
  assert.equal(d.status, 0x09);
  assert.deepEqual(d.flags, ["testFailed", "confirmed"]);
});

test("PID formulas", () => {
  assert.equal(decodePid(0x0c, fromHex("1AF8"))?.value, 1726);
  assert.equal(decodePid(0x05, fromHex("7B"))?.value, 83);
  assert.equal(decodePid(0x0d, fromHex("3C"))?.value, 60);
  assert.equal(decodePid(0x42, fromHex("384E"))?.value, 14.41);
  assert.equal(decodePid(0xff, fromHex("00")), undefined);
});

test("supported PID bitmap", () => {
  assert.deepEqual(parseSupported(0x00, fromHex("BE1FA813")), [
    1, 3, 4, 5, 6, 7, 12, 13, 14, 15, 16, 17, 19, 21, 28, 31, 32,
  ]);
});

test("DTC list with and without count byte", () => {
  assert.deepEqual(parseDtcList(fromHex("02 0301 0171")), ["P0301", "P0171"]);
  assert.deepEqual(parseDtcList(fromHex("0301 0171")), ["P0301", "P0171"]);
  assert.deepEqual(parseDtcList(fromHex("00")), []);
});

test("VIN parsing drops the count byte", () => {
  const body = new Uint8Array([0x01, ...Buffer.from("WBA00000000000001")]);
  assert.equal(parseVin(body), "WBA00000000000001");
});

test("expectPositive", () => {
  assert.deepEqual([...expectPositive(0x22, fromHex("62F190AA"))], [0xf1, 0x90, 0xaa]);
  assert.throws(() => expectPositive(0x22, fromHex("7F2231")), (e: unknown) => e instanceof NegativeResponse && e.nrc === 0x31);
  assert.throws(() => expectPositive(0x22, fromHex("5001")), /unexpected response/);
});

test("parse 0x19 0x02 body", () => {
  const body = fromHex("02 FF 480A12 09 010100 04").subarray(0);
  const { dtcs, statusAvailabilityMask } = parseDtcByStatusMask(body);
  assert.equal(statusAvailabilityMask, 0xff);
  assert.equal(dtcs.length, 2);
  assert.equal(dtcs[1]?.raw, "010100");
});

test("ISO-TP segment and reassemble round trip", () => {
  for (const n of [1, 7, 8, 13, 14, 15, 100, 4095]) {
    const payload = Uint8Array.from({ length: n }, (_, i) => (i * 7) & 0xff);
    const r = new Reassembler();
    let got: Uint8Array | undefined;
    const frames = segment(payload);
    for (const f of frames) {
      assert.ok(f.length <= 8);
      const res = r.feed(f);
      if (res.payload) got = res.payload;
    }
    assert.equal(toHex(got ?? new Uint8Array()), toHex(payload), `length ${n}`);
  }
});

test("ISO-TP detects a sequence error", () => {
  const frames = segment(new Uint8Array(30));
  const r = new Reassembler();
  r.feed(frames[0] as Uint8Array);
  assert.throws(() => r.feed(frames[2] as Uint8Array), /sequence/);
});

test("HSFZ encode/decode across split TCP chunks", () => {
  const frame = diagFrame(0xf4, 0x12, fromHex("22F190"));
  assert.equal(toHex(frame), "00 00 00 05 00 01 F4 12 22 F1 90".replace("00 00 00 05", "00 00 00 05"));
  const dec = new HsfzDecoder();
  assert.equal(dec.push(frame.subarray(0, 4)).length, 0);
  const frames = dec.push(frame.subarray(4));
  assert.equal(frames.length, 1);
  const p = parseDiagPayload(frames[0]?.payload as Uint8Array);
  assert.equal(p.source, 0xf4);
  assert.equal(p.target, 0x12);
  assert.equal(toHex(p.uds), "22 F1 90");
});

test("DoIP encode/decode", () => {
  const msg = diagMessage(0x0e80, 0x1000, fromHex("3E00"));
  assert.equal(toHex(msg.subarray(0, 8)), "02 FD 80 01 00 00 00 06");
  const [f] = new DoipDecoder().push(msg);
  const p = parseDiagMessage(f?.payload as Uint8Array);
  assert.deepEqual([p.source, p.target, toHex(p.uds)], [0x0e80, 0x1000, "3E 00"]);
  assert.throws(() => new DoipDecoder().push(fromHex("02 00 80 01 00 00 00 00")), /bad DoIP header/);
});
