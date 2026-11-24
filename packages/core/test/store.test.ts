import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  DEMO_PACK,
  DiagClient,
  ExportError,
  SimTransport,
  StoreError,
  createBackup,
  demoVehicle,
  exportSanitised,
  listBackups,
  readBackup,
  readOnly,
  restorePlan,
  saveBackup,
  vehicleHash,
  verifyBackupHash,
  verifyStore,
} from "../src/index.ts";
import type { Backup } from "../src/index.ts";

const dir = () => join(mkdtempSync(join(tmpdir(), "od-store-")), "store");

async function backupOf(opts: { ambient?: number; welcome?: number } = {}, when = "2026-11-20T00:00:00Z"): Promise<Backup> {
  const c = new DiagClient(readOnly(new SimTransport(demoVehicle(opts))));
  return createBackup(c, { target: 0x12, blocks: [{ did: 0x3000, length: 64 }], now: new Date(when) });
}

const mode = (p: string) => statSync(p).mode & 0o777;

test("store: save, list, read back, modes 700 and 600", async () => {
  const root = dir();
  const b = await backupOf();
  const e = await saveBackup(root, b);
  assert.equal(e.first_seen, true);
  assert.equal(listBackups(root).length, 1);
  assert.equal((await readBackup(root, b.txn_id)).sha256, b.sha256);
  assert.equal((await readBackup(root, b.txn_id.slice(0, 6))).txn_id, b.txn_id);
  assert.equal(mode(root), 0o700);
  assert.equal(mode(join(root, "v1")), 0o700);
  assert.equal(mode(dirname(join(root, e.file))), 0o700);
  assert.equal(mode(join(root, "index.json")), 0o600);
  assert.equal(mode(join(root, e.file)), 0o600);
  assert.ok(!e.file.includes(b.vin as string), "VIN never appears in a path");
  assert.ok(e.file.includes(vehicleHash(b.vin)));
});

test("store: a second backup of the same module is not first_seen, and the same id is refused", async () => {
  const root = dir();
  const a = await backupOf({}, "2026-11-20T00:00:00Z");
  const b = await backupOf({ welcome: 1 }, "2026-11-21T00:00:00Z");
  await saveBackup(root, a);
  assert.equal((await saveBackup(root, b)).first_seen, false);
  await assert.rejects(() => saveBackup(root, a), /already stored/);
  assert.equal((await verifyStore(root)).ok, true);
  assert.deepEqual(listBackups(root).map((e) => e.id), [a.txn_id, b.txn_id]);
});

test("store: refuses a backup whose own check code is wrong", async () => {
  const b = await backupOf();
  const bad = { ...b, dids: [{ ...b.dids[0]!, hex: "ff" + b.dids[0]!.hex.slice(2) }] };
  await assert.rejects(() => saveBackup(dir(), bad), StoreError);
});

test("store: no temporary files are left behind", async () => {
  const root = dir();
  const e = await saveBackup(root, await backupOf());
  const left = readdirSync(dirname(join(root, e.file))).concat(readdirSync(root));
  assert.ok(!left.some((n) => n.includes(".tmp-")));
});

test("store: an edited backup file is caught on read and by verify", async () => {
  const root = dir();
  const b = await backupOf();
  const e = await saveBackup(root, b);
  const p = join(root, e.file);
  const j = JSON.parse(readFileSync(p, "utf8"));
  j.dids[0].hex = "ab" + j.dids[0].hex.slice(2);
  writeFileSync(p, JSON.stringify(j, null, 2));
  await assert.rejects(() => readBackup(root, b.txn_id), /changed after it was saved/);
  const r = await verifyStore(root);
  assert.equal(r.ok, false);
  assert.match(r.problems[0]?.problem ?? "", /changed after/);
});

test("store: a forged check code inside the file is still caught", async () => {
  const root = dir();
  const b = await backupOf();
  const e = await saveBackup(root, b);
  const p = join(root, e.file);
  const j = JSON.parse(readFileSync(p, "utf8")) as Backup;
  const forged = { ...j, sha256: "0".repeat(64) };
  writeFileSync(p, JSON.stringify(forged, null, 2));
  assert.equal(await verifyBackupHash(forged), false);
  await assert.rejects(() => readBackup(root, b.txn_id), StoreError);
});

test("store: an edited index is caught", async () => {
  const root = dir();
  await saveBackup(root, await backupOf());
  const p = join(root, "index.json");
  const j = JSON.parse(readFileSync(p, "utf8"));
  j.entries[0].module = 0x99;
  writeFileSync(p, JSON.stringify(j));
  assert.throws(() => listBackups(root), /edited or damaged/);
  const r = await verifyStore(root);
  assert.equal(r.ok, false);
  assert.equal(r.problems[0]?.file, "index.json");
});

test("store: a damaged index is reported, not crashed on", async () => {
  const root = dir();
  await saveBackup(root, await backupOf());
  writeFileSync(join(root, "index.json"), "{not json");
  assert.throws(() => listBackups(root), /damaged/);
  assert.equal((await verifyStore(root)).ok, false);
});

test("store: missing file, loose file and open permissions are all reported", async () => {
  const root = dir();
  const e = await saveBackup(root, await backupOf());
  chmodSync(join(root, e.file), 0o644);
  writeFileSync(join(root, "v1", "stray.json"), "{}");
  let r = await verifyStore(root);
  assert.ok(r.problems.some((p) => /permissions too open/.test(p.problem)));
  assert.ok(r.problems.some((p) => /not in the index/.test(p.problem)));
  unlinkSync(join(root, e.file));
  r = await verifyStore(root);
  assert.ok(r.problems.some((p) => /missing/.test(p.problem)));
});

test("store: a symbolic link in place of a backup is refused", async () => {
  const root = dir();
  const b = await backupOf();
  const e = await saveBackup(root, b);
  const p = join(root, e.file);
  const copy = join(root, "elsewhere.json");
  writeFileSync(copy, readFileSync(p));
  unlinkSync(p);
  symlinkSync(copy, p);
  await assert.rejects(() => readBackup(root, b.txn_id), /symbolic link/);
});

test("store: an index that points outside the store is refused", async () => {
  const root = dir();
  const b = await backupOf();
  await saveBackup(root, b);
  const p = join(root, "index.json");
  const j = JSON.parse(readFileSync(p, "utf8"));
  j.entries[0].file = "../../etc/passwd";
  j.entries_sha256 = createHash("sha256").update(JSON.stringify(j.entries)).digest("hex");
  writeFileSync(p, JSON.stringify(j));
  await assert.rejects(() => readBackup(root, b.txn_id), /outside the store/);
});

test("store: a newer layout or newer index version is refused", async () => {
  const root = dir();
  await saveBackup(root, await backupOf());
  mkdirSync(join(root, "v2"));
  assert.throws(() => listBackups(root), /newer layout/);
  await assert.rejects(async () => saveBackup(root, await backupOf({}, "2026-11-22T00:00:00Z")), /newer layout/);
  const root2 = dir();
  await saveBackup(root2, await backupOf());
  const p = join(root2, "index.json");
  const j = JSON.parse(readFileSync(p, "utf8"));
  j.schema_version = 2;
  writeFileSync(p, JSON.stringify(j));
  assert.throws(() => listBackups(root2), /newer OpenDiag/);
});

test("store: unknown id gives a clear error", async () => {
  const root = dir();
  await saveBackup(root, await backupOf());
  await assert.rejects(() => readBackup(root, "nope"), /no backup with id/);
});

test("store: an empty store lists nothing and verifies clean", async () => {
  const root = dir();
  assert.deepEqual(listBackups(root), []);
  const r = await verifyStore(root);
  assert.equal(r.ok, true);
  assert.equal(r.checked, 0);
});

test("export: VIN is hashed, serials dropped by default, data and check code kept", async () => {
  const b = await backupOf();
  const x = await exportSanitised(b);
  assert.match(x.vin ?? "", /^sha256:[0-9a-f]{16}$/);
  assert.ok(!JSON.stringify(x).includes(b.vin as string));
  assert.ok(!Object.keys(x.identity).some((k) => k.startsWith("serial")));
  assert.deepEqual(x.dids, b.dids);
  assert.equal(x.sha256, b.sha256);
  assert.equal(x.sanitised.serials_removed, true);
  const y = await exportSanitised(b, { includeSerials: true });
  assert.ok(Object.keys(y.identity).some((k) => k.startsWith("serial")));
  assert.ok(!JSON.stringify(y).includes(b.vin as string));
});

test("export: the same car gets the same hash, another car another", async () => {
  const a = await exportSanitised(await backupOf());
  const b = await exportSanitised(await backupOf({}, "2026-11-25T00:00:00Z"));
  assert.equal(a.vin, b.vin);
  const other = { ...(await backupOf()), vin: "WBA00000000000002" };
  assert.notEqual((await exportSanitised(other)).vin, a.vin);
});

test("export: a backup that holds the VIN block itself is refused", async () => {
  const b = await backupOf();
  const bad = { ...b, dids: [...b.dids, { did: 0xf190, len: 1, hex: "41" }] };
  await assert.rejects(() => exportSanitised(bad), ExportError);
});

test("restore plan: dry run, never executable, lists steps and preconditions", async () => {
  const plan = restorePlan(await backupOf());
  assert.equal(plan.dry_run, true);
  assert.equal(plan.writes_performed, 0);
  assert.equal(plan.executable, false);
  assert.equal(plan.steps.length, 1);
  assert.equal(plan.steps[0]?.action, "write_block");
  assert.ok(plan.preconditions.length >= 3);
});

test("restore plan: against the car's current coding shows the changed bytes", async () => {
  const old = await backupOf({ welcome: 0 }, "2026-11-20T00:00:00Z");
  const now = await backupOf({ welcome: 1 }, "2026-11-21T00:00:00Z");
  const plan = restorePlan(old, { current: now, pack: DEMO_PACK });
  assert.equal(plan.steps[0]?.action, "write_block");
  assert.ok((plan.steps[0]?.changes?.length ?? 0) >= 1);
  assert.ok((plan.options?.length ?? 0) >= 1);
  assert.equal(restorePlan(old, { current: old }).steps[0]?.action, "skip_unchanged");
});

test("restore plan: blocks on a different car or an unconfirmed backup", async () => {
  const a = await backupOf();
  const other = { ...a, vin: "WBA00000000000002" };
  assert.ok(restorePlan(a, { current: other }).blocked.some((m) => /different car/.test(m)));
  assert.ok(restorePlan({ ...a, verified: false }).blocked.some((m) => /two identical reads/.test(m)));
});
