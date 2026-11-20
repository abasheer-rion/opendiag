import { ascii, at, concat, toHex, fromHex } from "./util.ts";
import type { Bytes } from "./util.ts";
import type { DiagClient } from "./client.ts";
import { NegativeResponse } from "./uds.ts";
import { TimeoutError } from "./util.ts";

export const TOOL_VERSION = "0.1.0";

/** Standard ISO 14229 identification DIDs read for the identity record (best effort). */
export const IDENTITY_DIDS = {
  partNumber: 0xf187,
  softwareNumber: 0xf188,
  softwareVersion: 0xf189,
  serial: 0xf18c,
  vin: 0xf190,
  hardwareNumber: 0xf191,
  ecuSoftwareNumber: 0xf194,
  ecuSoftwareVersion: 0xf195,
} as const;

export interface DidRecord {
  did: number;
  len: number;
  hex: string;
}

export interface Backup {
  schema_version: 1;
  txn_id: string;
  tool_version: string;
  vin: string | null;
  module_addr: number;
  /** DID (hex string) -> ASCII text when printable, else hex. */
  identity: Record<string, string>;
  adapter: { name: string };
  dids: DidRecord[];
  sha256: string;
  created_utc: string;
  /** True only when the block was read twice with identical bytes. */
  verified: boolean;
  pack?: string;
  /** Set by the store: true for the oldest backup of this module (the "factory coding" entry). */
  first_seen?: boolean;
}

export interface BlockSpec {
  did: number;
  /** When set, a different length is a hard error (wrong module variant symptom). */
  length?: number;
}

export class BackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackupError";
  }
}

export async function sha256Hex(b: Bytes): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new Uint8Array(b));
  return toHex(new Uint8Array(d), "").toLowerCase();
}

/** Canonical encoding from the failsafe spec 6.3: for each DID in order, u16 length then raw bytes. */
export function canonicalBytes(dids: DidRecord[]): Bytes {
  const parts: Bytes[] = [];
  for (const d of dids) parts.push(Uint8Array.of(d.len >> 8, d.len & 0xff), fromHex(d.hex));
  return concat(...parts);
}

export async function hashDids(dids: DidRecord[]): Promise<string> {
  return sha256Hex(canonicalBytes(dids));
}

export async function verifyBackupHash(b: Backup): Promise<boolean> {
  return (await hashDids(b.dids)) === b.sha256;
}

async function readDid(client: DiagClient, target: number, did: number): Promise<Bytes> {
  return client.readDataByIdentifier(target, did);
}

function printable(b: Bytes): boolean {
  return b.length > 0 && b.every((x) => x >= 0x20 && x < 0x7f);
}

export interface BackupOptions {
  target: number;
  blocks: BlockSpec[];
  /** Name stored in the file (adapter / transport). */
  adapterName?: string;
  pack?: string;
  now?: Date;
}

/**
 * Read-only backup of coding blocks: identity check, read each block twice, require identical bytes,
 * hash, return the record. Nothing is written to the car.
 */
export async function createBackup(client: DiagClient, opts: BackupOptions): Promise<Backup> {
  const identity: Record<string, string> = {};
  let vin: string | null = null;
  for (const [name, did] of Object.entries(IDENTITY_DIDS)) {
    try {
      const v = await readDid(client, opts.target, did);
      const key = `${name}:F${did.toString(16).slice(1).toUpperCase()}`;
      identity[key] = printable(v) ? ascii(v) : toHex(v, "");
      if (did === IDENTITY_DIDS.vin) vin = printable(v) ? ascii(v) : null;
    } catch (e) {
      if (!(e instanceof NegativeResponse) && !(e instanceof TimeoutError)) throw e;
    }
  }

  const dids: DidRecord[] = [];
  for (const block of opts.blocks) {
    const first = await readDid(client, opts.target, block.did);
    if (block.length !== undefined && first.length !== block.length) {
      throw new BackupError(
        `DID 0x${block.did.toString(16)}: expected ${block.length} bytes, module returned ${first.length}. Wrong variant? Refusing.`,
      );
    }
    const second = await readDid(client, opts.target, block.did);
    if (toHex(first) !== toHex(second)) {
      throw new BackupError(`DID 0x${block.did.toString(16)}: two reads returned different bytes. The module answers inconsistently, refusing.`);
    }
    dids.push({ did: block.did, len: first.length, hex: toHex(first, "") });
  }

  const backup: Backup = {
    schema_version: 1,
    txn_id: crypto.randomUUID(),
    tool_version: TOOL_VERSION,
    vin,
    module_addr: opts.target,
    identity,
    adapter: { name: opts.adapterName ?? client.transport.name },
    dids,
    sha256: await hashDids(dids),
    created_utc: (opts.now ?? new Date()).toISOString(),
    verified: dids.length > 0,
  };
  if (opts.pack) backup.pack = opts.pack;
  return backup;
}

export function blockBytes(b: Backup, did: number): Bytes | undefined {
  const r = b.dids.find((d) => d.did === did);
  return r ? fromHex(r.hex) : undefined;
}

export function assertBackupShape(x: unknown): Backup {
  const b = x as Backup;
  if (!b || b.schema_version !== 1 || !Array.isArray(b.dids) || typeof b.sha256 !== "string") {
    throw new BackupError("not an OpenDiag backup file");
  }
  for (const d of b.dids) at(fromHex(d.hex), 0 === d.len ? 0 : 0); // throws on bad hex length
  return b;
}
