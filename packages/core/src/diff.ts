import type { Bytes } from "./util.ts";
import type { Backup } from "./backup.ts";
import { fromHex } from "./util.ts";
import type { FieldLoc } from "./pack.ts";

export interface ByteChange {
  offset: number;
  before: number;
  after: number;
  /** Bit indexes that flipped, 0 = least significant. */
  bits: number[];
}

export function diffBytes(a: Bytes, b: Bytes): ByteChange[] {
  const out: ByteChange[] = [];
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x === y) continue;
    const bits: number[] = [];
    for (let k = 0; k < 8; k++) if (((x ^ y) >> k) & 1) bits.push(k);
    out.push({ offset: i, before: x, after: y, bits });
  }
  return out;
}

export interface DidDiff {
  did: number;
  status: "changed" | "same" | "only_in_a" | "only_in_b" | "length_differs";
  lengthA?: number;
  lengthB?: number;
  changes: ByteChange[];
}

export function diffBackups(a: Backup, b: Backup): DidDiff[] {
  const out: DidDiff[] = [];
  const bMap = new Map(b.dids.map((d) => [d.did, d]));
  for (const da of a.dids) {
    const db = bMap.get(da.did);
    if (!db) {
      out.push({ did: da.did, status: "only_in_a", lengthA: da.len, changes: [] });
      continue;
    }
    bMap.delete(da.did);
    if (da.len !== db.len) {
      out.push({ did: da.did, status: "length_differs", lengthA: da.len, lengthB: db.len, changes: [] });
      continue;
    }
    const changes = diffBytes(fromHex(da.hex), fromHex(db.hex));
    out.push({ did: da.did, status: changes.length ? "changed" : "same", lengthA: da.len, lengthB: db.len, changes });
  }
  for (const db of bMap.values()) out.push({ did: db.did, status: "only_in_b", lengthB: db.len, changes: [] });
  return out;
}

/**
 * Discovery helper: after toggling ONE setting in the car's own menu between two captures,
 * propose a pack field. Returns undefined if the change spans more than one byte or is empty
 * (then the change is a checksum update or several settings changed; inspect by hand).
 */
export function suggestField(changes: ByteChange[], ignoreOffsets: number[] = []): FieldLoc | undefined {
  const real = changes.filter((c) => !ignoreOffsets.includes(c.offset));
  if (real.length !== 1) return undefined;
  const c = real[0] as ByteChange;
  const lo = Math.min(...c.bits);
  const hi = Math.max(...c.bits);
  return { byte_offset: c.offset, bit_offset: lo, bit_length: hi - lo + 1 };
}
