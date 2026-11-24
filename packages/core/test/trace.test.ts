import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SimTransport,
  TimeoutError,
  WriteBlockedError,
  anonymiseTrace,
  fromHex,
  hashVin,
  readOnly,
  readOnlyExcept,
  scrubText,
  traceTransport,
  vinFingerprint,
} from "../src/index.ts";
import type { Bytes, DiagTransport, TraceRecord } from "../src/index.ts";

const VIN = "WBA00000000000001";

function recorder(): { t: DiagTransport; sent: Bytes[] } {
  const sent: Bytes[] = [];
  const t: DiagTransport = {
    name: "rec",
    async open() {},
    async close() {},
    async request(_target, data) {
      sent.push(data);
      return Uint8Array.of(0x7f, data[0] ?? 0, 0x11);
    },
  };
  return { t, sent };
}

test("trace: records request, response, error and timing", async () => {
  const lines: string[] = [];
  let now = 1000;
  const clock = () => (now += 5);
  const t = traceTransport(new SimTransport(), (l) => lines.push(l), clock);
  await t.request(0x12, Uint8Array.of(0x22, 0xf1, 0x90));
  await assert.rejects(() => t.request(0x55, Uint8Array.of(0x3e, 0)), TimeoutError);
  assert.equal(t.count, 2);
  const [a, b] = lines.map((l) => JSON.parse(l) as TraceRecord);
  assert.equal(a?.target, 0x12);
  assert.equal(a?.req, "22F190");
  assert.ok(a?.res?.startsWith("62F190"));
  assert.equal(a?.err, undefined);
  assert.equal(b?.req, "3E00");
  assert.match(b?.err ?? "", /no response/);
  assert.equal(b?.res, undefined);
  assert.ok((b?.ts ?? 0) > (a?.ts ?? 0));
  assert.equal(a?.ms, 5);
});

test("trace: a request blocked by the guard is never recorded", async () => {
  const lines: string[] = [];
  const t = readOnly(traceTransport(new SimTransport(), (l) => lines.push(l)));
  assert.throws(() => t.request(0x12, Uint8Array.of(0x14, 0xff, 0xff, 0xff)), WriteBlockedError);
  assert.equal(lines.length, 0);
});

test("anonymise: VIN in bytes and text is hashed, same VIN gives same pseudonym", async () => {
  const lines: string[] = [];
  const t = traceTransport(new SimTransport(), (l) => lines.push(l));
  await t.request(0x12, Uint8Array.of(0x22, 0xf1, 0x90));
  await t.request(0x12, Uint8Array.of(0x22, 0xf1, 0x90));
  lines.push(JSON.stringify({ ts: 9, target: 1, req: "3E00", err: `connect to 192.168.0.10:6801 failed for ${VIN} aa:bb:cc:dd:ee:ff`, ms: 1 }));
  const raw = lines.join("\n");
  assert.ok(raw.includes(Buffer.from(VIN).toString("hex").toUpperCase()));
  const anon = anonymiseTrace(raw, "salt-1");
  assert.ok(!anon.includes(VIN));
  assert.ok(!anon.includes(Buffer.from(VIN).toString("hex").toUpperCase()));
  assert.ok(!anon.includes("192.168"));
  assert.ok(!/aa:bb/i.test(anon));
  const recs = anon.trim().split("\n").map((l) => JSON.parse(l) as TraceRecord);
  assert.equal(recs.length, 3);
  assert.equal(recs[0]?.res, recs[1]?.res);
  const pseudo = hashVin(VIN, "salt-1");
  assert.ok(Buffer.from(fromHex(recs[0]?.res ?? "")).toString("latin1").includes(pseudo));
  assert.ok((recs[2]?.err ?? "").includes(pseudo));
  assert.notEqual(anonymiseTrace(raw, "salt-2"), anon);
  assert.equal(recs[0]?.req, "22F190");
});

test("anonymise: leaves short identifiers and non-VIN text alone, drops junk lines", () => {
  const line = JSON.stringify({ ts: 1, target: 18, req: "22F18C", res: "62F18C" + Buffer.from("SIM0000123").toString("hex").toUpperCase(), ms: 2 });
  const out = anonymiseTrace(`${line}\nnot json\n\n`, "s");
  assert.equal(out, line + "\n");
  assert.equal(scrubText("hello 10.0.0.1 world", "s"), "hello [ip removed] world");
  assert.equal(scrubText("ABCDEFGHJKLMNPRST", "s"), "ABCDEFGHJKLMNPRST"); // letters only: not a VIN
  assert.notEqual(vinFingerprint(VIN, "a"), VIN);
  assert.equal(vinFingerprint(VIN, "a").length, 16);
});

test("readOnlyExcept: allows the listed service, reads, and nothing else (bypass table)", () => {
  const { t, sent } = recorder();
  const g = readOnlyExcept(t, [0x14]);
  const allowed: number[][] = [[0x14, 0xff, 0xff, 0xff], [0x22, 0xf1, 0x90], [0x19, 0x02, 0xff], [0x3e, 0x00], [0x10, 0x01], [0x09, 0x02]];
  for (const r of allowed) g.request(0x12, Uint8Array.from(r));
  assert.equal(sent.length, allowed.length);
  const blocked: number[][] = [
    [], [0x04], [0x10, 0x02], [0x10, 0x03], [0x10], [0x11, 0x01], [0x27, 0x01], [0x2e, 0xf1, 0x90, 0x00],
    [0x2f, 0x00, 0x00], [0x31, 0x01, 0xff, 0x00], [0x34], [0x36], [0x37], [0x85, 0x02], [0x28, 0x03], [0x24], [0x3d], [0xff], [0x94],
  ];
  for (const r of blocked) assert.throws(() => g.request(0x12, Uint8Array.from(r)), WriteBlockedError, `0x${r[0]?.toString(16)}`);
  assert.equal(sent.length, allowed.length);
});

test("readOnlyExcept: base readOnly still refuses clear, and bad ids are rejected", () => {
  const { t, sent } = recorder();
  assert.throws(() => readOnly(t).request(0x12, Uint8Array.of(0x14, 0xff, 0xff, 0xff)), WriteBlockedError);
  assert.throws(() => readOnlyExcept(t, [0x14]).request(0x12, Uint8Array.of(0x2e, 1, 2)), WriteBlockedError);
  assert.throws(() => readOnlyExcept(t, [0x100]), RangeError);
  assert.throws(() => readOnlyExcept(t, [-1]), RangeError);
  assert.throws(() => readOnlyExcept(t, [1.5]), RangeError);
  assert.equal(sent.length, 0);
  assert.match(readOnlyExcept(t, [0x14]).name, /0x14/);
});

test("scrubText: VIN next to an underscore or in lower case, and IPv6, are removed", () => {
  const out = scrubText(`vin_${VIN} ${VIN.toLowerCase()} fe80::1 [::1]`, "salt");
  assert.ok(!out.toUpperCase().includes(VIN));
  assert.ok(!out.includes("fe80"));
  assert.ok(!out.includes("::1"));
});
