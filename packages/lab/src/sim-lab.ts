import { DEMO_PACK, SimVehicle, applyChecksum, asciiBytes, demoCodingBlock } from "../../core/src/index.ts";
import type { Pack } from "../../core/src/index.ts";

export const LAB_MODULE = 0x12;
export const LAB_VIN = "WBA00000000000001";

/** A second, smaller simulated coding block (sum8 checksum) so tests can write more than one block. */
function lampBlock(delay = 0): number[] {
  const b = new Uint8Array(16);
  for (let i = 0; i < 15; i++) b[i] = (i * 5 + 1) & 0xff;
  b[3] = ((b[3] ?? 0) & ~0x07) | (delay & 7);
  applyChecksum({ kind: "sum8", covers: [0, 14], store_at: 15, store_len: 1 }, b);
  return [...b];
}

/** Simulator-only pack: the demo options plus one option in a second block. Offsets are made up. */
export const LAB_PACK: Pack = {
  ...DEMO_PACK,
  pack_id: "lab-sim",
  coding: [
    ...DEMO_PACK.coding,
    {
      id: "sim-lamp-delay",
      label: "Simulated lamp delay",
      category: "lighting",
      module: "sim-body",
      block: { did: 0x3001, length: 16 },
      field: { byte_offset: 3, bit_offset: 0, bit_length: 3 },
      values: [
        { raw: 0, label: "None" },
        { raw: 1, label: "Short" },
        { raw: 2, label: "Long" },
      ],
      default_raw: 0,
      integrity: { checksum: { kind: "sum8", covers: [0, 14], store_at: 15, store_len: 1 } },
      risk_tier: "T1",
      provenance: { source_type: "simulator", note: "illustrative only" },
      license: "CC0-1.0",
    },
  ],
};

/** A simulated body module at 0x12 that accepts writes to the two coding blocks, behind a test-double unlock. */
export function labVehicle(opts: { ambient?: number; welcome?: number; unlock?: boolean } = {}): SimVehicle {
  return new SimVehicle().add(LAB_MODULE, {
    vin: LAB_VIN,
    dids: {
      0xf18c: asciiBytes("SIM0000123"),
      0xf191: asciiBytes("HW-SIM-01"),
      0xf195: asciiBytes("SW-0.1.0"),
      0x3000: demoCodingBlock(opts.ambient ?? 1, opts.welcome ?? 0),
      0x3001: lampBlock(),
    },
    pids: { 0x42: [0x38, 0x4e] },
    writableDids: [0x3000, 0x3001],
    ...(opts.unlock === false ? {} : { securityLevel: 1 }),
  });
}
