import {
  IDENTITY_DIDS,
  NegativeResponse,
  TimeoutError,
  applyChecksum,
  ascii,
  at,
  diffBytes,
  expectPositive,
  fromHex,
  hashDids,
  obdRequest,
  readField,
  toHex,
  verifyBackupHash,
  verifyIntegrity,
} from "../../core/src/index.ts";
import type { Backup, Bytes, CodingOption, DiagClient, DidRecord, Pack } from "../../core/src/index.ts";
import { HardStop, LabRefusal } from "./errors.ts";
import type { Gate } from "./errors.ts";
import { writeField } from "./field.ts";
import { blockedWord, tierProblem } from "./policy.ts";
import type { WriteTransport } from "./write-transport.ts";

export interface LabConfig {
  /** Module addresses that may be written. Empty means nothing may be written. */
  allowedModules: number[];
  /** Lowest battery voltage that allows a write (spec 6.5 says keep it configurable). */
  minVolts: number;
  /** Highest risk tier that may be written: T1 (green) by default. */
  maxTier: string;
  /** A backup older than this is stale. */
  maxBackupAgeMs: number;
  /** Most blocks one change may write. */
  maxWrites: number;
  /** Extra rewrite attempts while restoring a backup (spec 6.10 says 2). */
  rollbackAttempts: number;
  /** Answers a security-access seed. Test double only in this build. */
  keyProvider?: (seed: Bytes) => Bytes | undefined;
}

export const DEFAULT_CONFIG: LabConfig = {
  allowedModules: [],
  minVolts: 12.5,
  maxTier: "T1",
  maxBackupAgeMs: 60 * 60 * 1000,
  maxWrites: 4,
  rollbackAttempts: 2,
};

export interface ChangeRequest {
  target: number;
  backup: Backup;
  changes: { id: string; raw: number }[];
}

export interface PreviewChange {
  id: string;
  label: string;
  did: number;
  tier: string;
  beforeRaw: number;
  afterRaw: number;
  before: string | undefined;
  after: string | undefined;
  warnings: string[];
}

export interface PreviewByte {
  did: number;
  offset: number;
  before: number;
  after: number;
  kind: "field" | "checksum";
}

/** What would change, as data. A front end renders it; the engine only hashes it. */
export interface DiffPreview {
  module: number;
  changes: PreviewChange[];
  bytes: PreviewByte[];
  volts: number;
  backupSha256: string;
  /** Hash of the whole module state after the change (same encoding as the backup hash). */
  intendedSha256: string;
}

export const CONSENT_KIND = "opendiag-lab-consent/1";

/** The user's yes, as a value. It names the exact before and after state it covers. */
export interface Consent {
  kind: typeof CONSENT_KIND;
  module: number;
  backupSha256: string;
  intendedSha256: string;
  grantedBy: string;
  grantedAt: string;
}

export function consentFor(p: DiffPreview, grantedBy: string, now: Date = new Date()): Consent {
  return {
    kind: CONSENT_KIND,
    module: p.module,
    backupSha256: p.backupSha256,
    intendedSha256: p.intendedSha256,
    grantedBy,
    grantedAt: now.toISOString(),
  };
}

export function consentProblem(c: Consent | undefined, p: DiffPreview): string | undefined {
  if (!c || typeof c !== "object") return "no consent given";
  if (c.kind !== CONSENT_KIND) return "consent is not a lab consent";
  if (typeof c.grantedBy !== "string" || !c.grantedBy.trim()) return "consent has no name on it";
  if (c.module !== p.module) return "consent is for a different module";
  if (c.backupSha256 !== p.backupSha256) return "consent is for a different backup";
  if (c.intendedSha256 !== p.intendedSha256) return "consent is for a different change than the one shown";
  return undefined;
}

export interface Plan {
  req: ChangeRequest;
  preview: DiffPreview;
  /** Module bytes per block before and after, keyed by DID. */
  original: Map<number, Bytes>;
  intended: Map<number, Bytes>;
}

export interface PlanContext {
  client: DiagClient;
  transport: WriteTransport;
  pack: Pack;
  cfg: LabConfig;
  now: () => Date;
}

const hex = (n: number): string => "0x" + n.toString(16);
const same = (a: Bytes, b: Bytes): boolean => a.length === b.length && a.every((x, i) => x === b[i]);

/** Live identity DIDs, keyed the same way createBackup keys them. */
export async function readIdentity(client: DiagClient, target: number): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const [name, did] of Object.entries(IDENTITY_DIDS)) {
    try {
      const v = await client.readDataByIdentifier(target, did);
      const key = `${name}:F${did.toString(16).slice(1).toUpperCase()}`;
      out[key] = v.length > 0 && v.every((x) => x >= 0x20 && x < 0x7f) ? ascii(v) : toHex(v, "");
    } catch (e) {
      if (!(e instanceof NegativeResponse) && !(e instanceof TimeoutError)) throw e;
    }
  }
  return out;
}

/** Why the live module is not the one in the backup, or undefined when identity matches on every field. */
export async function identityProblem(client: DiagClient, target: number, backup: Backup): Promise<string | undefined> {
  if (backup.module_addr !== target) return "backup is for a different module address";
  if (backup.vin === null || Object.keys(backup.identity).length === 0) return "backup has no identity to match";
  const live = await readIdentity(client, target);
  if (Object.keys(live).length === 0) return "module did not report any identity";
  for (const [k, v] of Object.entries(backup.identity)) if (live[k] !== v) return `identity ${k} differs from the backup`;
  return undefined;
}

/** Battery voltage in volts from OBD PID 0x42. Throws when the module will not say. */
export async function readVolts(t: WriteTransport, target: number): Promise<number> {
  const body = expectPositive(0x01, await t.request(target, obdRequest(0x01, 0x42)));
  if (body.length < 3 || at(body, 0) !== 0x42) throw new Error("battery voltage reply was malformed");
  return ((at(body, 1) << 8) | at(body, 2)) / 1000;
}

function liveFailure(e: unknown): string {
  if (e instanceof HardStop) throw e;
  return e instanceof Error ? e.message : String(e);
}

/**
 * Preflight and diff in one: every gate must pass, nothing is written. Static gates run first and
 * a failure there stops before any traffic. Then read-only gates talk to the module.
 */
export async function buildPlan(ctx: PlanContext, req: ChangeRequest): Promise<Plan> {
  const { cfg, pack, client } = ctx;
  const { backup, target } = req;
  const gates: Gate[] = [];
  const gate = (name: string, ok: boolean, detail: string): boolean => {
    gates.push({ name, ok, detail: ok ? "ok" : detail });
    return ok;
  };
  const check = (): void => {
    if (gates.some((g) => !g.ok)) throw new LabRefusal(gates);
  };

  gate("module allowed", cfg.allowedModules.includes(target) && backup.module_addr === target, `module ${hex(target)} is not on the allowed list, or the backup is for another module`);
  gate("adapter fits pack", !pack.simulator_only || ctx.transport.name.startsWith("simulator"), "a simulator-only pack cannot be used on a real adapter");
  gate("changes present", req.changes.length > 0, "nothing to change");
  const hashOk = backup.verified === true && Array.isArray(backup.dids) && backup.dids.length > 0 && (await verifyBackupHash(backup).catch(() => false));
  gate("verified backup", hashOk, "no verified backup with a matching hash");
  const age = ctx.now().getTime() - Date.parse(backup.created_utc);
  gate("backup fresh", age >= 0 && age <= cfg.maxBackupAgeMs, "backup is too old (or dated in the future)");
  if (!hashOk) check();

  const opts: CodingOption[] = [];
  const seen = new Set<string>();
  for (const c of req.changes) {
    const o = pack.coding.find((x) => x.id === c.id);
    if (!gate(`option ${c.id} known`, o !== undefined && !seen.has(c.id), "not in the pack, or listed twice")) continue;
    if (!o) continue;
    seen.add(c.id);
    opts.push(o);
    const bw = blockedWord(o);
    gate(`option ${c.id} policy`, bw === undefined, `blocked by policy (${bw})`);
    const tp = tierProblem(o, cfg.maxTier);
    gate(`option ${c.id} tier`, tp === undefined, tp ?? "");
    gate(`option ${c.id} checksum rule`, o.integrity?.checksum !== undefined, "no checksum rule, no write");
    const okValue = Number.isInteger(c.raw) && (o.values ? o.values.some((v) => v.raw === c.raw) : c.raw >= 0 && c.raw < 2 ** o.field.bit_length);
    gate(`option ${c.id} value`, okValue, `${c.raw} is not an allowed value`);
    const rec = backup.dids.find((d) => d.did === o.block.did);
    gate(`option ${c.id} block in backup`, rec !== undefined && rec.len === o.block.length, `backup does not hold a ${o.block.length}-byte block at ${hex(o.block.did)}`);
  }
  const dids = [...new Set(opts.map((o) => o.block.did))].sort((a, b) => a - b);
  gate("write cap", dids.length <= cfg.maxWrites, `${dids.length} blocks is more than the cap of ${cfg.maxWrites}`);
  check();

  // Build the intended bytes from the backup, with checksums recalculated by the pack's own rule.
  const original = new Map<number, Bytes>();
  const intended = new Map<number, Bytes>();
  for (const did of dids) {
    const rec = backup.dids.find((d) => d.did === did) as DidRecord;
    const before = fromHex(rec.hex);
    const after = Uint8Array.from(before);
    const mine = opts.filter((o) => o.block.did === did);
    for (const o of mine) writeField(after, o.field, (req.changes.find((c) => c.id === o.id) as { raw: number }).raw);
    const rules = new Map(mine.map((o) => [JSON.stringify((o.integrity as NonNullable<CodingOption["integrity"]>).checksum), o]));
    for (const o of rules.values()) applyChecksum((o.integrity as NonNullable<CodingOption["integrity"]>).checksum, after);
    for (const o of mine) {
      gate(`option ${o.id} checksum before`, verifyIntegrity(o, before)?.ok === true, "the backup block fails its own checksum");
      gate(`option ${o.id} checksum after`, verifyIntegrity(o, after)?.ok === true, "recalculated checksum did not verify");
    }
    original.set(did, before);
    intended.set(did, after);
  }
  gate("changes something", dids.some((d) => !same(original.get(d) as Bytes, intended.get(d) as Bytes)), "the module already holds these values");
  check();

  // Read-only gates against the live module.
  let volts = 0;
  try {
    volts = await readVolts(ctx.transport, target);
    gate("battery voltage", volts >= cfg.minVolts, `${volts.toFixed(1)} V is below the ${cfg.minVolts} V minimum`);
  } catch (e) {
    gate("battery voltage", false, `could not read battery voltage (${liveFailure(e)})`);
  }
  try {
    const p = await identityProblem(client, target, backup);
    gate("identity matches backup", p === undefined, p ?? "");
  } catch (e) {
    gate("identity matches backup", false, `could not read identity (${liveFailure(e)})`);
  }
  try {
    for (const did of dids) {
      const live = await client.readDataByIdentifier(target, did);
      gate(`block ${hex(did)} unchanged since backup`, same(live, original.get(did) as Bytes), "module differs from the backup, so the backup is stale");
    }
  } catch (e) {
    gate("block readable", false, `could not read the block (${liveFailure(e)})`);
  }
  check();

  const preview = await makePreview(req, opts, original, intended, volts);
  return { req, preview, original, intended };
}

/** Hash of the module state after the change: the backup records with the intended blocks swapped in. */
export function stateHash(backup: Backup, intended: Map<number, Bytes>): Promise<string> {
  return hashDids(
    backup.dids.map((d) => {
      const b = intended.get(d.did);
      return b ? { did: d.did, len: b.length, hex: toHex(b, "") } : d;
    }),
  );
}

async function makePreview(req: ChangeRequest, opts: CodingOption[], original: Map<number, Bytes>, intended: Map<number, Bytes>, volts: number): Promise<DiffPreview> {
  const label = (o: CodingOption, raw: number): string | undefined => o.values?.find((v) => v.raw === raw)?.label;
  const changes: PreviewChange[] = opts.map((o) => {
    const afterRaw = (req.changes.find((c) => c.id === o.id) as { raw: number }).raw;
    const rec = req.backup.dids.find((d) => d.did === o.block.did) as DidRecord;
    const beforeRaw = readField(fromHex(rec.hex), o.field);
    return {
      id: o.id,
      label: o.label,
      did: o.block.did,
      tier: o.risk_tier ?? "",
      beforeRaw,
      afterRaw,
      before: label(o, beforeRaw),
      after: label(o, afterRaw),
      warnings: o.warnings ?? [],
    };
  });
  const bytes: PreviewByte[] = [];
  for (const [did, after] of intended) {
    const sums = opts.filter((o) => o.block.did === did).map((o) => (o.integrity as NonNullable<CodingOption["integrity"]>).checksum);
    for (const c of diffBytes(original.get(did) as Bytes, after)) {
      const isSum = sums.some((s) => c.offset >= s.store_at && c.offset < s.store_at + s.store_len);
      bytes.push({ did, offset: c.offset, before: c.before, after: c.after, kind: isSum ? "checksum" : "field" });
    }
  }
  return {
    module: req.target,
    changes,
    bytes,
    volts,
    backupSha256: req.backup.sha256,
    intendedSha256: await stateHash(req.backup, intended),
  };
}
