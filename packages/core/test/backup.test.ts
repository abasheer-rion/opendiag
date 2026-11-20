import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BackupError,
  DEMO_PACK,
  DiagClient,
  PackError,
  SimTransport,
  WriteBlockedError,
  blockBytes,
  createBackup,
  crc16CcittFalse,
  decodeOption,
  demoCodingBlock,
  demoVehicle,
  diffBackups,
  fromHex,
  parsePack,
  readOnly,
  suggestField,
  verifyBackupHash,
} from "../src/index.ts";
import type { Bytes, DiagTransport } from "../src/index.ts";

const BLOCKS = [{ did: 0x3000, length: 64 }];

async function backupOf(opts: { ambient?: number; welcome?: number } = {}) {
  const c = new DiagClient(readOnly(new SimTransport(demoVehicle(opts))));
  return createBackup(c, { target: 0x12, blocks: BLOCKS, now: new Date("2026-11-20T00:00:00Z") });
}

test("CRC-16/CCITT-FALSE check value", () => {
  assert.equal(crc16CcittFalse(new TextEncoder().encode("123456789")), 0x29b1);
});

test("backup: identity, hash, verified by second read", async () => {
  const b = await backupOf();
  assert.equal(b.vin, "WBA00000000000001");
  assert.equal(b.verified, true);
  assert.equal(b.dids[0]?.len, 64);
  assert.ok(Object.keys(b.identity).some((k) => k.startsWith("serial")));
  assert.equal(await verifyBackupHash(b), true);
  assert.equal(await verifyBackupHash({ ...b, dids: [{ ...b.dids[0]!, hex: "00" + b.dids[0]!.hex.slice(2) }] }), false);
});

test("backup refuses a block of the wrong length", async () => {
  const c = new DiagClient(readOnly(new SimTransport(demoVehicle())));
  await assert.rejects(() => createBackup(c, { target: 0x12, blocks: [{ did: 0x3000, length: 32 }] }), /Wrong variant/);
});

test("backup refuses a module that answers inconsistently", async () => {
  const inner = new SimTransport(demoVehicle());
  let reads = 0;
  const flaky: DiagTransport = {
    name: "flaky",
    open: () => inner.open(),
    close: () => inner.close(),
    async request(target: number, data: Bytes) {
      const r = await inner.request(target, data);
      if (data[0] === 0x22 && data[1] === 0x30) {
        reads++;
        if (reads === 2) return Uint8Array.from(r, (x, i) => (i === 10 ? x ^ 1 : x));
      }
      return r;
    },
  };
  await assert.rejects(() => createBackup(new DiagClient(flaky), { target: 0x12, blocks: BLOCKS }), BackupError);
});

test("read-only guard blocks writes, routines, security access, clear and programming sessions", async () => {
  const t = readOnly(new SimTransport());
  for (const req of ["2EF190AA", "3101FF00", "2701", "14FFFFFF", "1002", "04", "1101"]) {
    assert.throws(() => t.request(0x12, fromHex(req)), WriteBlockedError, req);
  }
  await t.request(0x12, fromHex("22F190")); // reads still work
  await t.request(0x12, fromHex("1001")); // default session is allowed
});

test("inspect: decode options and checksum from a backup", async () => {
  const b = await backupOf({ ambient: 2, welcome: 1 });
  const block = blockBytes(b, 0x3000) as Uint8Array;
  const [amb, wel] = DEMO_PACK.coding.map((o) => decodeOption(o, block));
  assert.equal(amb?.raw, 2);
  assert.equal(amb?.value, "Extended");
  assert.equal(amb?.isDefault, false);
  assert.equal(wel?.value, "On");
  assert.equal(amb?.integrity?.ok, true);
  const bad = block.slice();
  bad[5] = (bad[5] as number) ^ 0xff;
  assert.equal(decodeOption(DEMO_PACK.coding[0]!, bad).integrity?.ok, false);
  assert.throws(() => decodeOption(DEMO_PACK.coding[0]!, block.subarray(0, 32)), /wrong variant/);
});

test("diff and field suggestion: toggle one setting between two backups", async () => {
  const a = await backupOf({ ambient: 1 });
  const b = await backupOf({ ambient: 2 });
  const [d] = diffBackups(a, b);
  assert.equal(d?.status, "changed");
  // changes are the setting byte (12) plus the two checksum bytes (62, 63)
  assert.deepEqual(d?.changes.map((c) => c.offset), [12, 62, 63]);
  assert.deepEqual(suggestField(d?.changes ?? [], [62, 63]), { byte_offset: 12, bit_offset: 4, bit_length: 2 });
  assert.equal(suggestField(d?.changes ?? []), undefined); // checksum bytes not ignored: ambiguous
  assert.equal(diffBackups(a, a)[0]?.status, "same");
});

test("pack validation catches overlap, bad ranges and missing checksums", () => {
  assert.equal(parsePack(structuredClone(DEMO_PACK)).pack_id, "demo-sim");
  const overlap = structuredClone(DEMO_PACK);
  overlap.coding[1]!.field = { byte_offset: 12, bit_offset: 5, bit_length: 1 };
  assert.throws(() => parsePack(overlap), (e: unknown) => e instanceof PackError && /overlap/.test(e.message));
  const past = structuredClone(DEMO_PACK);
  past.coding[0]!.field.byte_offset = 64;
  assert.throws(() => parsePack(past), /past the end/);
  const noCrc = structuredClone(DEMO_PACK);
  delete noCrc.coding[0]!.integrity;
  assert.throws(() => parsePack(noCrc), /need a checksum/);
  assert.throws(() => parsePack({ schema_version: 2 }), PackError);
});

test("demo block has a valid checksum", () => {
  const block = Uint8Array.from(demoCodingBlock());
  assert.equal(decodeOption(DEMO_PACK.coding[0]!, block).integrity?.ok, true);
});
