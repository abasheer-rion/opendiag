import { at, toHex } from "./util.ts";
import type { Bytes } from "./util.ts";
import { decodeObdDtc } from "./dtc.ts";
import { decodePid, parseSupported } from "./obd.ts";
import type { PidValue } from "./obd.ts";
import { NegativeResponse, expectPositive } from "./uds.ts";
import { readOnly } from "./transport.ts";
import type { DiagTransport } from "./transport.ts";
import { describeStatus } from "./dtc-detail.ts";

/** Freeze frame and snapshot readers. All of them go through the read-only guard. */

export interface ObdFreezeFrame {
  frame: number;
  /** The fault that caused this frame (mode 02 PID 02), when the car says. */
  dtc?: string;
  values: PidValue[];
  /** Supported PIDs this build has no formula for, kept raw. */
  unknown: { pid: number; hex: string }[];
}

const freezeRequest = (pid: number, frame: number): Bytes => Uint8Array.of(0x02, pid, frame);

/** Read OBD-II mode 02 freeze frame `frame`. Returns undefined when the car has none. */
export async function readObdFreezeFrame(t: DiagTransport, target = 0x7e0, frame = 0): Promise<ObdFreezeFrame | undefined> {
  const ro = readOnly(t);
  /** Data bytes after "42 PID FRAME", or undefined when the car refuses that PID. */
  const get = async (pid: number): Promise<Bytes | undefined> => {
    try {
      return expectPositive(0x02, await ro.request(target, freezeRequest(pid, frame))).subarray(2);
    } catch (e) {
      if (e instanceof NegativeResponse) return undefined;
      throw e;
    }
  };
  const cause = await get(0x02);
  if (!cause || cause.length < 2 || (at(cause, 0) === 0 && at(cause, 1) === 0)) return undefined;
  const out: ObdFreezeFrame = { frame, dtc: decodeObdDtc(at(cause, 0), at(cause, 1)), values: [], unknown: [] };
  const supported: number[] = [];
  for (const base of [0x00, 0x20, 0x40, 0x60]) {
    const map = await get(base);
    if (!map || map.length < 4) break;
    const found = parseSupported(base, map);
    supported.push(...found);
    if (!found.includes(base + 0x20)) break;
  }
  for (const pid of supported) {
    if (pid % 0x20 === 0 || pid === 0x02) continue;
    const data = await get(pid);
    if (!data) continue;
    const v = decodePid(pid, data);
    if (v) out.values.push(v);
    else out.unknown.push({ pid, hex: toHex(data) });
  }
  return out;
}

export interface SnapshotIdentifier {
  did: number;
  hex: string;
}

export interface SnapshotRecord {
  recordNumber: number;
  identifiers: SnapshotIdentifier[];
}

export interface UdsSnapshot {
  /** The 3 code bytes the car echoed, hex. */
  dtcHex: string;
  status: number;
  statusFlags: string[];
  records: SnapshotRecord[];
  /** Bytes that could not be split because a data identifier's length is not known. Never guessed. */
  leftoverHex?: string;
}

/** Data lengths by data identifier. The car does not say how long each value is, so the caller must. */
export type LengthTable = ReadonlyMap<number, number>;

const setNames = (status: number) => describeStatus(status).filter((f) => f.set).map((f) => f.name);

/**
 * Parse a positive 0x19 0x04 body (after the 0x59 byte). Tolerant: stops at the first
 * identifier whose length is unknown and returns what is left as raw hex.
 */
export function parseSnapshot(body: Bytes, lengths: LengthTable = new Map()): UdsSnapshot {
  if (at(body, 0) !== 0x04) throw new Error("not a snapshot response");
  const snap: UdsSnapshot = {
    dtcHex: toHex(body.subarray(1, 4), ""),
    status: at(body, 4),
    statusFlags: setNames(at(body, 4)),
    records: [],
  };
  let i = 5;
  outer: while (i + 1 < body.length) {
    const rec: SnapshotRecord = { recordNumber: at(body, i), identifiers: [] };
    const count = at(body, i + 1);
    let j = i + 2;
    for (let n = 0; n < count; n++) {
      if (j + 1 >= body.length) break outer;
      const did = (at(body, j) << 8) | at(body, j + 1);
      const len = lengths.get(did);
      if (len === undefined || j + 2 + len > body.length) {
        snap.records.push(rec);
        snap.leftoverHex = toHex(body.subarray(j));
        return snap;
      }
      rec.identifiers.push({ did, hex: toHex(body.subarray(j + 2, j + 2 + len)) });
      j += 2 + len;
    }
    snap.records.push(rec);
    i = j;
  }
  if (i < body.length) snap.leftoverHex = toHex(body.subarray(i));
  return snap;
}

export interface ExtendedRecord {
  recordNumber: number;
  hex: string;
}

export interface UdsExtendedData {
  dtcHex: string;
  status: number;
  statusFlags: string[];
  records: ExtendedRecord[];
  leftoverHex?: string;
}

/**
 * Parse a positive 0x19 0x06 body (after the 0x59 byte). `lengths` maps record number to data length.
 * When one specific record was asked for and its length is unknown, everything after its number is that record.
 */
export function parseExtendedData(body: Bytes, requestedRecord: number, lengths: ReadonlyMap<number, number> = new Map()): UdsExtendedData {
  if (at(body, 0) !== 0x06) throw new Error("not an extended data response");
  const out: UdsExtendedData = {
    dtcHex: toHex(body.subarray(1, 4), ""),
    status: at(body, 4),
    statusFlags: setNames(at(body, 4)),
    records: [],
  };
  let i = 5;
  const specific = requestedRecord !== 0xff && requestedRecord !== 0xfe;
  while (i < body.length) {
    const recordNumber = at(body, i);
    const len = lengths.get(recordNumber) ?? (specific ? body.length - i - 1 : undefined);
    if (len === undefined || i + 1 + len > body.length) {
      out.leftoverHex = toHex(body.subarray(i));
      return out;
    }
    out.records.push({ recordNumber, hex: toHex(body.subarray(i + 1, i + 1 + len)) });
    i += 1 + len;
  }
  return out;
}

const dtcRequest = (sub: number, dtc: Bytes, record: number): Bytes => Uint8Array.of(0x19, sub, at(dtc, 0), at(dtc, 1), at(dtc, 2), record);

/** 0x19 0x04: snapshot records for one fault (3 code bytes). Returns undefined if the module does not offer it. */
export async function readUdsSnapshot(t: DiagTransport, target: number, dtc: Bytes, record = 0xff, lengths?: LengthTable): Promise<UdsSnapshot | undefined> {
  try {
    return parseSnapshot(expectPositive(0x19, await readOnly(t).request(target, dtcRequest(0x04, dtc, record))), lengths);
  } catch (e) {
    if (e instanceof NegativeResponse) return undefined;
    throw e;
  }
}

/** 0x19 0x06: extended data records for one fault (3 code bytes). Returns undefined if the module does not offer it. */
export async function readUdsExtendedData(t: DiagTransport, target: number, dtc: Bytes, record = 0xff, lengths?: ReadonlyMap<number, number>): Promise<UdsExtendedData | undefined> {
  try {
    return parseExtendedData(expectPositive(0x19, await readOnly(t).request(target, dtcRequest(0x06, dtc, record))), record, lengths);
  } catch (e) {
    if (e instanceof NegativeResponse) return undefined;
    throw e;
  }
}
