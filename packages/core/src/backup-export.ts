import { sha256Hex } from "./backup.ts";
import type { Backup } from "./backup.ts";
import { diffBytes } from "./diff.ts";
import type { ByteChange } from "./diff.ts";
import { decodeOption } from "./pack.ts";
import type { Pack } from "./pack.ts";
import { asciiBytes, fromHex } from "./util.ts";

const DID_VIN = 0xf190;
const DID_SERIAL = 0xf18c;

export class ExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExportError";
  }
}

export interface ExportOptions {
  includeSerials?: boolean;
}

export type SanitisedBackup = Omit<Backup, "first_seen"> & {
  sanitised: { vin_hashed: boolean; serials_removed: boolean };
};

async function hashed(vin: string): Promise<string> {
  return "sha256:" + (await sha256Hex(Uint8Array.from(asciiBytes(`opendiag-export-v1\0${vin}`)))).slice(0, 16);
}

/**
 * A copy that is safe to share: the VIN is replaced by a short one-way hash, serial numbers are dropped
 * unless asked for, and the adapter name loses any address. The coding data is kept as it is, so the
 * check code still matches. A backup that holds the VIN or serial block itself cannot be cleaned and is refused.
 */
export async function exportSanitised(b: Backup, opts: ExportOptions = {}): Promise<SanitisedBackup> {
  const holds = (did: number) => b.dids.some((d) => d.did === did);
  if (holds(DID_VIN)) throw new ExportError("this backup contains the VIN data block itself, so it cannot be sanitised");
  if (holds(DID_SERIAL) && !opts.includeSerials) throw new ExportError("this backup contains the serial number block itself; use --include-serials or do not share it");
  const identity: Record<string, string> = {};
  for (const [k, v] of Object.entries(b.identity)) {
    if (k.startsWith("vin:")) identity[k] = await hashed(v);
    else if (k.startsWith("serial:") && !opts.includeSerials) continue;
    else identity[k] = v;
  }
  const { first_seen: _drop, ...rest } = b;
  return {
    ...rest,
    vin: b.vin ? await hashed(b.vin) : null,
    identity,
    adapter: { name: (b.adapter.name.split(":")[0] ?? "").slice(0, 16) },
    sanitised: { vin_hashed: b.vin !== null, serials_removed: !opts.includeSerials },
  };
}

export interface RestoreStep {
  order: number;
  action: "write_block" | "skip_unchanged";
  did: number;
  length: number;
  /** Bytes that would change compared with the car's current coding (when a current backup is given). */
  changes?: ByteChange[];
}

export interface RestorePlan {
  dry_run: true;
  /** Always 0. Nothing in OpenDiag writes to a car. */
  writes_performed: 0;
  executable: false;
  backup_id: string;
  module: number;
  steps: RestoreStep[];
  preconditions: string[];
  /** Reasons a real restore must not run. Empty means none were found. */
  blocked: string[];
  options?: { id: string; label: string; value: string }[];
}

const PRECONDITIONS = [
  "battery at 12.4 V or more, ideally on a charger",
  "ignition on, engine off, nothing plugged in or unplugged during the write",
  "read the module's current coding and back it up first",
  "module part and software numbers match the ones in this backup",
  "stable cable connection (not WiFi if avoidable)",
];

/**
 * Dry run of restoring a backup. Describes what a restore would write and what would stop it.
 * It never talks to a car. It is the input for a later lab-only package that is not part of this tool.
 */
export function restorePlan(b: Backup, opts: { pack?: Pack; current?: Backup } = {}): RestorePlan {
  const blocked: string[] = [];
  if (!b.verified) blocked.push("this backup was not confirmed by two identical reads");
  const cur = opts.current;
  if (cur) {
    if (cur.module_addr !== b.module_addr) blocked.push("the current backup is from a different module");
    if (cur.vin !== b.vin) blocked.push("the current backup is from a different car (VIN differs)");
  }
  const steps: RestoreStep[] = [];
  for (const d of b.dids) {
    const now = cur?.dids.find((x) => x.did === d.did);
    if (cur && !now) blocked.push(`block 0x${d.did.toString(16)} is not in the current backup, cannot compare`);
    if (now && now.len !== d.len) {
      blocked.push(`block 0x${d.did.toString(16)} has length ${now.len} now but ${d.len} in the backup (different variant?)`);
      continue;
    }
    const changes = now ? diffBytes(fromHex(now.hex), fromHex(d.hex)) : undefined;
    const step: RestoreStep = { order: steps.length + 1, action: changes && changes.length === 0 ? "skip_unchanged" : "write_block", did: d.did, length: d.len };
    if (changes) step.changes = changes;
    steps.push(step);
  }
  const plan: RestorePlan = { dry_run: true, writes_performed: 0, executable: false, backup_id: b.txn_id, module: b.module_addr, steps, preconditions: PRECONDITIONS, blocked };
  if (opts.pack) {
    plan.options = [];
    for (const o of opts.pack.coding) {
      const blk = b.dids.find((d) => d.did === o.block.did);
      if (!blk) continue;
      let dec;
      try {
        dec = decodeOption(o, fromHex(blk.hex));
      } catch (e) {
        blocked.push((e as Error).message);
        continue;
      }
      if (dec.integrity && !dec.integrity.ok) blocked.push(`"${o.id}": checksum in the backup does not match, the backup block looks damaged`);
      plan.options.push({ id: o.id, label: o.label, value: dec.value ?? `raw ${dec.raw}` });
    }
  }
  return plan;
}
