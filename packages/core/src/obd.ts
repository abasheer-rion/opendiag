import { at, ascii } from "./util.ts";
import type { Bytes } from "./util.ts";
import { decodeObdDtc } from "./dtc.ts";

/** CAN 11-bit functional (broadcast) request id. Physical ECU ids are 0x7E0..0x7E7. */
export const OBD_FUNCTIONAL_ID = 0x7df;

export function obdRequest(mode: number, pid?: number): Bytes {
  return pid === undefined ? Uint8Array.of(mode) : Uint8Array.of(mode, pid);
}

export interface PidDef {
  pid: number;
  name: string;
  unit: string;
  bytes: number;
  decode: (d: Bytes) => number;
}

const a = (d: Bytes) => at(d, 0);
const ab = (d: Bytes) => at(d, 0) * 256 + at(d, 1);

/** Standard SAE J1979 mode 01 PIDs. Formulas are public (J1979 / Wikipedia OBD-II PIDs). */
export const PIDS: PidDef[] = [
  { pid: 0x04, name: "Engine load", unit: "%", bytes: 1, decode: (d) => (a(d) * 100) / 255 },
  { pid: 0x05, name: "Coolant temperature", unit: "°C", bytes: 1, decode: (d) => a(d) - 40 },
  { pid: 0x06, name: "Short fuel trim bank 1", unit: "%", bytes: 1, decode: (d) => (a(d) - 128) * (100 / 128) },
  { pid: 0x07, name: "Long fuel trim bank 1", unit: "%", bytes: 1, decode: (d) => (a(d) - 128) * (100 / 128) },
  { pid: 0x0b, name: "Intake manifold pressure", unit: "kPa", bytes: 1, decode: a },
  { pid: 0x0c, name: "Engine speed", unit: "rpm", bytes: 2, decode: (d) => ab(d) / 4 },
  { pid: 0x0d, name: "Vehicle speed", unit: "km/h", bytes: 1, decode: a },
  { pid: 0x0e, name: "Timing advance", unit: "°", bytes: 1, decode: (d) => a(d) / 2 - 64 },
  { pid: 0x0f, name: "Intake air temperature", unit: "°C", bytes: 1, decode: (d) => a(d) - 40 },
  { pid: 0x10, name: "Mass air flow", unit: "g/s", bytes: 2, decode: (d) => ab(d) / 100 },
  { pid: 0x11, name: "Throttle position", unit: "%", bytes: 1, decode: (d) => (a(d) * 100) / 255 },
  { pid: 0x1f, name: "Run time since start", unit: "s", bytes: 2, decode: ab },
  { pid: 0x2f, name: "Fuel level", unit: "%", bytes: 1, decode: (d) => (a(d) * 100) / 255 },
  { pid: 0x33, name: "Barometric pressure", unit: "kPa", bytes: 1, decode: a },
  { pid: 0x42, name: "Control module voltage", unit: "V", bytes: 2, decode: (d) => ab(d) / 1000 },
  { pid: 0x46, name: "Ambient air temperature", unit: "°C", bytes: 1, decode: (d) => a(d) - 40 },
  { pid: 0x5c, name: "Engine oil temperature", unit: "°C", bytes: 1, decode: (d) => a(d) - 40 },
];

export function pidDef(pid: number): PidDef | undefined {
  return PIDS.find((p) => p.pid === pid);
}

export interface PidValue {
  pid: number;
  name: string;
  value: number;
  unit: string;
}

/** `data` is the bytes after the "41 <pid>" header. */
export function decodePid(pid: number, data: Bytes): PidValue | undefined {
  const def = pidDef(pid);
  if (!def || data.length < def.bytes) return undefined;
  return { pid, name: def.name, value: Math.round(def.decode(data) * 100) / 100, unit: def.unit };
}

/** Decode a "supported PIDs" bitmap (PIDs base+1 .. base+0x20). */
export function parseSupported(base: number, data: Bytes): number[] {
  const out: number[] = [];
  for (let i = 0; i < 32; i++) {
    const byte = at(data, i >> 3);
    if (byte & (0x80 >> (i & 7))) out.push(base + i + 1);
  }
  return out;
}

/** Parse a mode 03/07/0A response (after the positive-response SID is verified). */
export function parseDtcList(body: Bytes): string[] {
  // CAN (ISO 15765) responses carry a count byte first; older protocols do not.
  const pairs = body.length % 2 === 1 ? body.subarray(1) : body;
  const out: string[] = [];
  for (let i = 0; i + 1 < pairs.length; i += 2) {
    const hi = at(pairs, i);
    const lo = at(pairs, i + 1);
    if (hi === 0 && lo === 0) continue;
    out.push(decodeObdDtc(hi, lo));
  }
  return out;
}

/** Parse mode 09 PID 02 body (after "49 02"). */
export function parseVin(body: Bytes): string {
  const vin = body.length > 17 ? body.subarray(body.length - 17) : body;
  return ascii(vin);
}
