import { at, toHex } from "./util.ts";
import type { Bytes } from "./util.ts";

const LETTERS = ["P", "C", "B", "U"] as const;
const hex = (n: number) => n.toString(16).toUpperCase();

/** Decode a 2-byte SAE J2012 / ISO 15031-6 trouble code, e.g. 0x0301 -> "P0301". */
export function decodeObdDtc(hi: number, lo: number): string {
  const letter = LETTERS[(hi >> 6) & 3];
  return `${letter}${(hi >> 4) & 3}${hex(hi & 0xf)}${hex(lo >> 4)}${hex(lo & 0xf)}`;
}

export interface UdsDtc {
  /** Powertrain-style code when the first two bytes follow SAE J2012 (not valid for all makes). */
  code: string;
  /** Third byte: failure type. */
  failureType: number;
  /** Full 3-byte code as hex, always reliable for manufacturer-specific DTCs. */
  raw: string;
  /** Status byte, when the record carried one. */
  status?: number;
  flags?: string[];
}

const STATUS_BITS = [
  "testFailed",
  "testFailedThisOperationCycle",
  "pending",
  "confirmed",
  "testNotCompletedSinceLastClear",
  "testFailedSinceLastClear",
  "testNotCompletedThisOperationCycle",
  "warningIndicatorRequested",
] as const;

export function decodeStatus(status: number): string[] {
  return STATUS_BITS.filter((_, i) => (status & (1 << i)) !== 0);
}

/** Decode one UDS DTC (3 bytes) with an optional status byte. */
export function decodeUdsDtc(b: Bytes, offset = 0, withStatus = false): UdsDtc {
  const hi = at(b, offset);
  const lo = at(b, offset + 1);
  const ft = at(b, offset + 2);
  const dtc: UdsDtc = {
    code: decodeObdDtc(hi, lo),
    failureType: ft,
    raw: toHex(b.subarray(offset, offset + 3), ""),
  };
  if (withStatus) {
    const status = at(b, offset + 3);
    dtc.status = status;
    dtc.flags = decodeStatus(status);
  }
  return dtc;
}
