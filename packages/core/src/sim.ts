import { asciiBytes, at } from "./util.ts";
import type { Bytes } from "./util.ts";
import type { DiagTransport } from "./transport.ts";
import { TimeoutError } from "./util.ts";
import { demoCodingBlock } from "./demo.ts";

export interface SimDtc {
  /** 3 bytes: SAE-style high/low then failure type. */
  bytes: [number, number, number];
  status: number;
}

export interface SimEcuConfig {
  vin?: string;
  dtcs?: SimDtc[];
  /** Raw mode-01 PID data (bytes after the PID) by PID number. */
  pids?: Record<number, number[]>;
  /** UDS DIDs by number. */
  dids?: Record<number, number[]>;
}

/** A tiny fake ECU: OBD-II modes 01/03/04/07/09/0A and UDS 0x10/0x14/0x19/0x22/0x3E. */
export class SimEcu {
  readonly cfg: SimEcuConfig;
  private cleared = false;

  constructor(cfg: SimEcuConfig) {
    this.cfg = cfg;
  }

  private dtcs(): SimDtc[] {
    return this.cleared ? [] : (this.cfg.dtcs ?? []);
  }

  handle(req: Bytes): Bytes | undefined {
    const sid = at(req, 0);
    const neg = (nrc: number) => Uint8Array.of(0x7f, sid, nrc);
    switch (sid) {
      case 0x01: {
        const pid = at(req, 1);
        if (pid % 0x20 === 0) return this.supportedBitmap(pid);
        const d = this.cfg.pids?.[pid];
        return d ? Uint8Array.of(0x41, pid, ...d) : neg(0x31);
      }
      case 0x03:
      case 0x07:
      case 0x0a: {
        const list = this.dtcs();
        const pairs = list.flatMap((d) => [d.bytes[0], d.bytes[1]]);
        return Uint8Array.of(sid + 0x40, list.length, ...pairs);
      }
      case 0x04:
        this.cleared = true;
        return Uint8Array.of(0x44);
      case 0x09: {
        if (at(req, 1) !== 0x02 || !this.cfg.vin) return neg(0x31);
        return Uint8Array.of(0x49, 0x02, 0x01, ...asciiBytes(this.cfg.vin));
      }
      case 0x10:
        return Uint8Array.of(0x50, at(req, 1), 0x00, 0x32, 0x01, 0xf4);
      case 0x3e:
        return at(req, 1) & 0x80 ? undefined : Uint8Array.of(0x7e, 0x00);
      case 0x14:
        this.cleared = true;
        return Uint8Array.of(0x54);
      case 0x19: {
        if (at(req, 1) !== 0x02) return neg(0x12);
        const mask = at(req, 2);
        const rows = this.dtcs().filter((d) => d.status & mask);
        return Uint8Array.of(0x59, 0x02, 0xff, ...rows.flatMap((d) => [...d.bytes, d.status]));
      }
      case 0x22: {
        const did = (at(req, 1) << 8) | at(req, 2);
        if (did === 0xf190 && this.cfg.vin) {
          return Uint8Array.of(0x62, 0xf1, 0x90, ...asciiBytes(this.cfg.vin));
        }
        const d = this.cfg.dids?.[did];
        return d ? Uint8Array.of(0x62, at(req, 1), at(req, 2), ...d) : neg(0x31);
      }
      default:
        return neg(0x11);
    }
  }

  private supportedBitmap(base: number): Bytes {
    const have = Object.keys(this.cfg.pids ?? {}).map(Number);
    const bits = new Uint8Array(4);
    for (const p of have) {
      if (p > base && p <= base + 0x20) {
        const i = p - base - 1;
        bits[i >> 3] = (bits[i >> 3] ?? 0) | (0x80 >> (i & 7));
      }
    }
    if (have.some((p) => p > base + 0x20)) bits[3] = (bits[3] ?? 0) | 0x01;
    return Uint8Array.of(0x41, base, ...bits);
  }
}

export class SimVehicle {
  readonly ecus = new Map<number, SimEcu>();

  add(address: number, cfg: SimEcuConfig): this {
    this.ecus.set(address, new SimEcu(cfg));
    return this;
  }

  respond(target: number, req: Bytes): Bytes | undefined {
    return this.ecus.get(target)?.handle(req);
  }
}

/** A demo car: engine ECU at 0x7E0 (OBD-II) and mirrored at 0x12 (BMW-style logical address). */
export function demoVehicle(opts: { ambient?: number; welcome?: number } = {}): SimVehicle {
  const ascii = asciiBytes;
  const engine: SimEcuConfig = {
    dids: {
      0xf18c: ascii("SIM0000123"),
      0xf191: ascii("HW-SIM-01"),
      0xf195: ascii("SW-0.1.0"),
      0x3000: demoCodingBlock(opts.ambient ?? 1, opts.welcome ?? 0),
    },
    vin: "WBA00000000000001",
    dtcs: [
      { bytes: [0x03, 0x01, 0x00], status: 0x09 }, // P0301 confirmed + testFailed
      { bytes: [0x01, 0x71, 0x00], status: 0x04 }, // P0171 pending
    ],
    pids: {
      0x04: [0x4d],
      0x05: [0x7b],
      0x0c: [0x1a, 0xf8],
      0x0d: [0x3c],
      0x0f: [0x41],
      0x11: [0x33],
      0x42: [0x38, 0x4e],
    },
  };
  return new SimVehicle().add(0x7e0, engine).add(0x12, engine).add(0x40, { vin: "WBA00000000000001" });
}

export class SimTransport implements DiagTransport {
  readonly name = "simulator";
  readonly vehicle: SimVehicle;

  constructor(vehicle: SimVehicle = demoVehicle()) {
    this.vehicle = vehicle;
  }

  async open(): Promise<void> {}
  async close(): Promise<void> {}

  async request(target: number, data: Bytes): Promise<Bytes> {
    const resp = this.vehicle.respond(target, data);
    if (!resp) throw new TimeoutError(`no response from 0x${target.toString(16)}`);
    return resp;
  }
}
