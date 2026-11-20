import { applyChecksum } from "./pack.ts";
import type { Pack } from "./pack.ts";

/**
 * Simulator-only pack. The offsets are made up for the built-in fake car and match nothing real.
 * Real packs come from owner captures (see docs/design/data-schema.md).
 */
export const DEMO_PACK: Pack = {
  schema_version: 1,
  pack_id: "demo-sim",
  version: "0.0.1",
  simulator_only: true,
  coding: [
    {
      id: "ambient-colour-count",
      label: "Ambient light colours available",
      category: "lighting",
      module: "sim-body",
      block: { did: 0x3000, length: 64 },
      field: { byte_offset: 12, bit_offset: 4, bit_length: 2 },
      values: [
        { raw: 0, label: "Off" },
        { raw: 1, label: "Standard" },
        { raw: 2, label: "Extended" },
      ],
      default_raw: 1,
      integrity: { checksum: { kind: "crc16_ccitt_false", covers: [0, 61], store_at: 62, store_len: 2 } },
      risk_tier: "T1",
      provenance: { source_type: "simulator", note: "illustrative only" },
      license: "CC0-1.0",
    },
    {
      id: "welcome-light",
      label: "Welcome light on unlock",
      category: "lighting",
      module: "sim-body",
      block: { did: 0x3000, length: 64 },
      field: { byte_offset: 20, bit_offset: 0, bit_length: 1 },
      values: [
        { raw: 0, label: "Off" },
        { raw: 1, label: "On" },
      ],
      default_raw: 0,
      integrity: { checksum: { kind: "crc16_ccitt_false", covers: [0, 61], store_at: 62, store_len: 2 } },
      risk_tier: "T1",
      provenance: { source_type: "simulator", note: "illustrative only" },
      license: "CC0-1.0",
    },
  ],
};

/** A 64-byte fake coding block with the demo options set and a valid checksum. */
export function demoCodingBlock(ambient = 1, welcome = 0): number[] {
  const b = new Uint8Array(64);
  for (let i = 0; i < 62; i++) b[i] = (i * 13 + 7) & 0xff;
  b[12] = ((b[12] ?? 0) & ~0x30) | ((ambient & 3) << 4);
  b[20] = ((b[20] ?? 0) & ~0x01) | (welcome & 1);
  const c = DEMO_PACK.coding[0]?.integrity?.checksum;
  if (c) applyChecksum(c, b);
  return [...b];
}
