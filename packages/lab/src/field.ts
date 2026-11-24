import { at } from "../../core/src/index.ts";
import type { Bytes, FieldLoc } from "../../core/src/index.ts";

export const fieldByteCount = (f: FieldLoc): number => Math.ceil((f.bit_offset + f.bit_length) / 8);

/** Inverse of core readField: set a bit field in place (same bit layout). */
export function writeField(block: Bytes, f: FieldLoc, raw: number): void {
  const n = fieldByteCount(f);
  let v = 0;
  for (let i = 0; i < n; i++) v = v * 256 + at(block, f.byte_offset + i);
  const cur = Math.floor(v / 2 ** f.bit_offset) % 2 ** f.bit_length;
  v += (raw - cur) * 2 ** f.bit_offset;
  for (let i = n - 1; i >= 0; i--) {
    block[f.byte_offset + i] = v % 256;
    v = Math.floor(v / 256);
  }
}
