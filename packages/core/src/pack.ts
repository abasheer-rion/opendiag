import { at } from "./util.ts";
import type { Bytes } from "./util.ts";

/**
 * Data packs describe coding options as plain data (no code). See docs/design/data-schema.md.
 * v0 reads JSON only. Real offsets must come from owner captures (see CONTRIBUTING.md).
 */
export interface FieldLoc {
  byte_offset: number;
  bit_offset: number;
  bit_length: number;
}

export interface Checksum {
  kind: "crc16_ccitt_false" | "sum8";
  /** Inclusive byte range covered. */
  covers: [number, number];
  store_at: number;
  store_len: number;
}

export interface CodingOption {
  id: string;
  label: string;
  category?: string;
  module?: string;
  block: { did: number; length: number };
  field: FieldLoc;
  values?: { raw: number; label: string }[];
  default_raw?: number;
  integrity?: { checksum: Checksum };
  risk_tier?: string;
  warnings?: string[];
  provenance?: Record<string, unknown>;
  license?: string;
}

export interface Pack {
  schema_version: 1;
  pack_id: string;
  version: string;
  /** True for the built-in simulator pack: offsets are illustrative, never apply to a real car. */
  simulator_only?: boolean;
  coding: CodingOption[];
}

export class PackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PackError";
  }
}

export function crc16CcittFalse(data: Bytes): number {
  let crc = 0xffff;
  for (const byte of data) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc;
}

function checksumOf(c: Checksum, block: Bytes): number {
  const covered = block.subarray(c.covers[0], c.covers[1] + 1);
  if (c.kind === "crc16_ccitt_false") return crc16CcittFalse(covered);
  return covered.reduce((s, b) => (s + b) & 0xff, 0);
}

/** Write a fresh checksum into a block (used by the simulator and tests; never on a car in v0). */
export function applyChecksum(c: Checksum, block: Bytes): void {
  const v = checksumOf(c, block);
  for (let i = 0; i < c.store_len; i++) block[c.store_at + i] = (v >> (8 * (c.store_len - 1 - i))) & 0xff;
}

export function verifyIntegrity(opt: CodingOption, block: Bytes): { ok: boolean; expected: number; actual: number } | undefined {
  const c = opt.integrity?.checksum;
  if (!c) return undefined;
  let actual = 0;
  for (let i = 0; i < c.store_len; i++) actual = (actual << 8) | at(block, c.store_at + i);
  const expected = checksumOf(c, block);
  return { ok: expected === actual, expected, actual };
}

/** Read a bit field: big-endian across bytes, bit_offset counted from the LSB of the last byte spanned. */
export function readField(block: Bytes, f: FieldLoc): number {
  const nBytes = Math.ceil((f.bit_offset + f.bit_length) / 8);
  let v = 0;
  for (let i = 0; i < nBytes; i++) v = v * 256 + at(block, f.byte_offset + i);
  return Math.floor(v / 2 ** f.bit_offset) % 2 ** f.bit_length;
}

export interface DecodedOption {
  id: string;
  label: string;
  raw: number;
  value?: string;
  isDefault?: boolean;
  integrity?: { ok: boolean; expected: number; actual: number };
}

export function decodeOption(opt: CodingOption, block: Bytes): DecodedOption {
  if (block.length !== opt.block.length) {
    throw new Error(`block length ${block.length} does not match pack length ${opt.block.length} for "${opt.id}" (wrong variant?)`);
  }
  const raw = readField(block, opt.field);
  const out: DecodedOption = { id: opt.id, label: opt.label, raw };
  const hit = opt.values?.find((v) => v.raw === raw);
  if (hit) out.value = hit.label;
  if (opt.default_raw !== undefined) out.isDefault = opt.default_raw === raw;
  const integrity = verifyIntegrity(opt, block);
  if (integrity) out.integrity = integrity;
  return out;
}

const isInt = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0;

/** Validate untrusted JSON as a pack. Throws PackError listing every problem found. */
export function parsePack(json: unknown): Pack {
  const errs: string[] = [];
  const p = json as Partial<Pack> | null;
  if (!p || typeof p !== "object") throw new PackError("pack must be an object");
  if (p.schema_version !== 1) errs.push("schema_version must be 1");
  if (typeof p.pack_id !== "string" || !p.pack_id) errs.push("pack_id required");
  if (typeof p.version !== "string") errs.push("version required");
  if (!Array.isArray(p.coding)) errs.push("coding must be an array");
  const seen = new Set<string>();
  for (const o of Array.isArray(p.coding) ? p.coding : []) {
    const where = `coding[${o?.id ?? "?"}]`;
    if (typeof o?.id !== "string" || seen.has(o.id)) errs.push(`${where}: id missing or duplicate`);
    else seen.add(o.id);
    if (!isInt(o?.block?.did) || !isInt(o?.block?.length)) errs.push(`${where}: block.did and block.length required`);
    const f = o?.field;
    if (!isInt(f?.byte_offset) || !isInt(f?.bit_offset) || !isInt(f?.bit_length) || (f?.bit_length ?? 0) < 1 || (f?.bit_length ?? 0) > 32) {
      errs.push(`${where}: field needs byte_offset, bit_offset, bit_length (1..32)`);
    } else if (isInt(o?.block?.length) && f.byte_offset + Math.ceil((f.bit_offset + f.bit_length) / 8) > o.block.length) {
      errs.push(`${where}: field runs past the end of the block`);
    }
    const c = o?.integrity?.checksum;
    if (c && (!["crc16_ccitt_false", "sum8"].includes(c.kind) || !isInt(c.store_at) || !isInt(c.store_len))) {
      errs.push(`${where}: unsupported or malformed checksum`);
    }
    if (o?.risk_tier && o.risk_tier !== "T0" && !c) errs.push(`${where}: tier ${o.risk_tier} entries need a checksum definition`);
  }
  // overlapping fields in the same block are errors
  const list = (Array.isArray(p.coding) ? p.coding : []).filter((o) => isInt(o?.field?.byte_offset) && isInt(o?.block?.did));
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i] as CodingOption;
      const b = list[j] as CodingOption;
      if (a.block.did !== b.block.did) continue;
      const [a0, a1] = bitRange(a.field);
      const [b0, b1] = bitRange(b.field);
      if (a0 <= b1 && b0 <= a1) errs.push(`fields "${a.id}" and "${b.id}" overlap`);
    }
  }
  if (errs.length) throw new PackError(errs.join("; "));
  return p as Pack;
}

function bitRange(f: FieldLoc): [number, number] {
  const lowFromTop = f.byte_offset * 8;
  const nBytes = Math.ceil((f.bit_offset + f.bit_length) / 8);
  const end = lowFromTop + nBytes * 8 - 1 - f.bit_offset; // last bit index (MSB-first numbering)
  return [end - f.bit_length + 1, end];
}
