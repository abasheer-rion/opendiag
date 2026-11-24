import { at, fromHex, toHex } from "./util.ts";
import type { Bytes } from "./util.ts";
import { decodeObdDtc } from "./dtc.ts";
import { NegativeResponse, expectPositive, parseDtcByStatusMask, readDtcByStatusMask } from "./uds.ts";
import { obdRequest } from "./obd.ts";
import { readOnly } from "./transport.ts";
import type { DiagTransport } from "./transport.ts";

/** One bit of the ISO 14229 DTC status byte, with a plain-English line. */
export interface StatusFlag {
  name: string;
  bit: number;
  set: boolean;
  line: string;
}

const STATUS_TABLE: readonly { name: string; line: string }[] = [
  { name: "testFailed", line: "The check is failing right now." },
  { name: "testFailedThisOperationCycle", line: "The check has failed at some point during this drive." },
  { name: "pending", line: "Seen once but not confirmed yet. It becomes a stored fault if it happens again." },
  { name: "confirmed", line: "The fault was confirmed and is kept in the module's memory." },
  { name: "testNotCompletedSinceLastClear", line: "The check has not finished running since the codes were last cleared." },
  { name: "testFailedSinceLastClear", line: "The check has failed at least once since the codes were last cleared." },
  { name: "testNotCompletedThisOperationCycle", line: "The check has not finished running yet this drive." },
  { name: "warningIndicatorRequested", line: "The module is asking for a warning lamp for this fault." },
];

/** All eight status bits, set or not. */
export function describeStatus(status: number): StatusFlag[] {
  return STATUS_TABLE.map((s, bit) => ({ ...s, bit, set: (status & (1 << bit)) !== 0 }));
}

export type ListedAs = "stored" | "pending" | "permanent";

/** One fault exactly as the car reported it. */
export interface DtcDetail {
  /** SAE-style code read from the first two bytes, e.g. "P0301". Other makes may number their own faults differently. */
  code: string;
  /** The bytes as received, hex with spaces (2 bytes from OBD-II, 4 from UDS). */
  rawHex: string;
  /** UDS 3-byte form (two code bytes plus failure type), when the car sent one. */
  udsHex?: string;
  failureType?: number;
  /** ISO 14229 status byte, when the car sent one. */
  status?: number;
  /** Only the flags that are set. */
  flags: StatusFlag[];
  /** OBD-II lists carry no status byte; this says which list the code came from. */
  listedAs?: ListedAs;
  /** Where it came from, e.g. "0x12". */
  module: string;
}

export const moduleLabel = (target: number): string => "0x" + target.toString(16).toUpperCase().padStart(2, "0");

/** Build a detail from a 3-byte UDS code, or 4 bytes when the status byte is included. */
export function detailFromUds(b: Bytes, module: string): DtcDetail {
  if (b.length < 3) throw new RangeError("a UDS fault record needs at least 3 bytes");
  const d: DtcDetail = {
    code: decodeObdDtc(at(b, 0), at(b, 1)),
    rawHex: toHex(b),
    udsHex: toHex(b.subarray(0, 3), ""),
    failureType: at(b, 2),
    flags: [],
    module,
  };
  if (b.length >= 4) {
    d.status = at(b, 3);
    d.flags = describeStatus(d.status).filter((f) => f.set);
  }
  return d;
}

/** Build a detail from a 2-byte OBD-II code. */
export function detailFromObd(hi: number, lo: number, listedAs: ListedAs, module: string): DtcDetail {
  return { code: decodeObdDtc(hi, lo), rawHex: toHex(Uint8Array.of(hi, lo)), flags: [], listedAs, module };
}

/** Split a mode 03/07/0A body into raw byte pairs, skipping 00 00 padding. Same count-byte rule as parseDtcList. */
export function obdPairs(body: Bytes): [number, number][] {
  const pairs = body.length % 2 === 1 ? body.subarray(1) : body;
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < pairs.length; i += 2) {
    const hi = at(pairs, i);
    const lo = at(pairs, i + 1);
    if (hi !== 0 || lo !== 0) out.push([hi, lo]);
  }
  return out;
}

/** Read stored, pending and permanent OBD-II faults, keeping the raw bytes. Read-only by construction. */
export async function readObdDtcDetails(t: DiagTransport, target = 0x7e0): Promise<DtcDetail[]> {
  const ro = readOnly(t);
  const module = moduleLabel(target);
  const out: DtcDetail[] = [];
  for (const [mode, kind] of [[0x03, "stored"], [0x07, "pending"], [0x0a, "permanent"]] as const) {
    try {
      const body = expectPositive(mode, await ro.request(target, obdRequest(mode)));
      for (const [hi, lo] of obdPairs(body)) out.push(detailFromObd(hi, lo, kind, module));
    } catch (e) {
      // Older cars have no pending or permanent list. A refused stored list must not read as "no faults".
      if (!(e instanceof NegativeResponse) || mode === 0x03) throw e;
    }
  }
  return out;
}

/** Read UDS faults (0x19 0x02), keeping the raw bytes and decoding the status byte. Read-only by construction. */
export async function readUdsDtcDetails(t: DiagTransport, target: number, mask = 0xff): Promise<DtcDetail[]> {
  const ro = readOnly(t);
  const body = expectPositive(0x19, await ro.request(target, readDtcByStatusMask(mask)));
  const module = moduleLabel(target);
  return parseDtcByStatusMask(body).dtcs.map((d) => detailFromUds(Uint8Array.of(...fromHex(d.raw), d.status ?? 0), module));
}

/** Parse "P0301" into its two bytes, or 4/6 hex digits ("0301", "030100") into an SAE-style code. */
export function parseDtcInput(text: string): { code: string; hi: number; lo: number } | undefined {
  const s = text.trim().toUpperCase().replace(/[\s-]/g, "");
  const m = s.match(/^([PCBU])([0-3])([0-9A-F])([0-9A-F]{2})$/);
  if (m) {
    const hi = ("PCBU".indexOf(m[1] as string) << 6) | (Number(m[2]) << 4) | parseInt(m[3] as string, 16);
    return { code: s, hi, lo: parseInt(m[4] as string, 16) };
  }
  if (/^([0-9A-F]{4}|[0-9A-F]{6})$/.test(s)) {
    const hi = parseInt(s.slice(0, 2), 16);
    const lo = parseInt(s.slice(2, 4), 16);
    return { code: decodeObdDtc(hi, lo), hi, lo };
  }
  return undefined;
}
