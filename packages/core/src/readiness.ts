import { at } from "./util.ts";
import type { Bytes } from "./util.ts";
import { NegativeResponse, expectPositive } from "./uds.ts";
import { obdRequest } from "./obd.ts";
import { readOnly } from "./transport.ts";
import type { DiagTransport } from "./transport.ts";
import { TimeoutError } from "./util.ts";

export interface MonitorState {
  name: string;
  /** PID 01: the car has this monitor. PID 41: the monitor is enabled for this drive. */
  available: boolean;
  /** True when the car reports the test as finished. Only meaningful when available. */
  complete: boolean;
}

export interface Readiness {
  /** Warning lamp state as the car reports it. Information only; nothing here can change it. */
  lampOn: boolean;
  storedFaultCount: number;
  ignition: "spark" | "compression";
  monitors: MonitorState[];
}

const CONTINUOUS = ["Misfire", "Fuel system", "Other components"] as const;
const SPARK = ["Catalyst", "Heated catalyst", "Evaporative system", "Secondary air", "A/C refrigerant", "Oxygen sensor", "Oxygen sensor heater", "EGR or VVT"] as const;
const COMPRESSION = ["NMHC catalyst", "NOx or SCR after-treatment", "Reserved", "Boost pressure", "Reserved", "Exhaust gas sensor", "Particulate filter", "EGR or VVT"] as const;

/**
 * Decode the four data bytes of mode 01 PID 01 (or PID 41, same layout; byte A is then unused).
 * A set "not complete" bit in the car's data means the test has not finished.
 * For PID 41 pass the ignition type learned from PID 01: byte A and bit 3 of byte B are unused there.
 */
export function decodeMonitors(d: Bytes, ignitionKnown?: "spark" | "compression"): Readiness {
  const a = at(d, 0);
  const b = at(d, 1);
  const c = at(d, 2);
  const e = at(d, 3);
  const ignition = ignitionKnown ?? ((b & 0x08) !== 0 ? "compression" : "spark");
  const monitors: MonitorState[] = CONTINUOUS.map((name, i) => ({
    name,
    available: (b & (1 << i)) !== 0,
    complete: (b & (0x10 << i)) === 0,
  }));
  const names = ignition === "spark" ? SPARK : COMPRESSION;
  names.forEach((name, i) => {
    if (name === "Reserved") return;
    monitors.push({ name, available: (c & (1 << i)) !== 0, complete: (e & (1 << i)) === 0 });
  });
  return { lampOn: (a & 0x80) !== 0, storedFaultCount: a & 0x7f, ignition, monitors };
}

/** Read monitor status since codes were cleared (PID 01) and, when the car answers, this drive (PID 41). Read-only. */
export async function readReadiness(
  t: DiagTransport,
  target = 0x7e0,
): Promise<{ sinceClear: Readiness; thisDrive?: Readiness }> {
  const ro = readOnly(t);
  const get = async (pid: number) => expectPositive(0x01, await ro.request(target, obdRequest(0x01, pid))).subarray(1);
  const sinceClear = decodeMonitors((await get(0x01)).subarray(0, 4));
  try {
    const drive = decodeMonitors((await get(0x41)).subarray(0, 4), sinceClear.ignition);
    // lamp and fault count only exist in PID 01; do not show PID 41's unused byte as if it were them
    return { sinceClear, thisDrive: { ...drive, lampOn: sinceClear.lampOn, storedFaultCount: sinceClear.storedFaultCount } };
  } catch (e) {
    if (e instanceof NegativeResponse || e instanceof TimeoutError || e instanceof RangeError) return { sinceClear };
    throw e;
  }
}
