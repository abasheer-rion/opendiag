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
  /** DIDs that accept 0x2E (simulated coding blocks). Absent means the ECU accepts no writes. */
  writableDids?: number[];
  /** When set, 0x2E also needs 0x27 security access (test double: see simTestKey). */
  securityLevel?: number;
}

/** Fault injection for tests. Every field is optional and the ECU consumes counters as it goes. */
export interface SimFaults {
  /** Write lands, but the reply is lost (the tester sees a timeout). */
  dropNextReplies?: number;
  /** Positive reply, but the stored bytes differ from what was sent. */
  corruptNextWrites?: number;
  /** Answer 0x2E with this NRC and store nothing. */
  nrcOnWrite?: number;
  /** How many times nrcOnWrite applies (default: always). */
  nrcOnWriteTimes?: number;
  /** Send this many 0x78 (response pending) frames before the real reply. Infinity = never reply. */
  pendingReplies?: number;
  /** Next write lands only half its bytes, then the ECU goes offline. */
  disconnectDuringWrite?: boolean;
  /** Ignore every request (a dead link). */
  offline?: boolean;
  /** Ignore this many more requests, then answer again. */
  silentRequests?: number;
  /** Battery voltage the ECU reports (PID 0x42). Below 10.5 V it refuses writes with NRC 0x93. */
  voltage?: number;
}

/**
 * Seed-key TEST DOUBLE for the simulator. It is not a real OEM algorithm and never will be.
 * The simulated ECU wants each seed byte XOR 0xA5.
 */
export function simTestKey(seed: Bytes): Bytes {
  return Uint8Array.from(seed, (b) => b ^ 0xa5);
}

const PENDING = (sid: number): Bytes => Uint8Array.of(0x7f, sid, 0x78);

/** A tiny fake ECU: OBD-II modes 01/03/04/07/09/0A and UDS 0x10/0x14/0x19/0x22/0x3E. */
export class SimEcu {
  readonly cfg: SimEcuConfig;
  private cleared = false;
  private session = 1;
  private unlocked = false;
  private seed: Bytes | undefined;
  private seeds = 0;
  private keyFails = 0;
  private pend: { left: number; final: Bytes | undefined } | undefined;
  readonly faults: SimFaults = {};
  /** Number of 0x2E requests that reached this ECU and were accepted for processing. */
  writeCount = 0;
  /** Called after each write is stored, with the running write count (tests use it to inject faults). */
  onWrite?: (n: number) => void;

  constructor(cfg: SimEcuConfig) {
    this.cfg = cfg;
  }

  private dtcs(): SimDtc[] {
    return this.cleared ? [] : (this.cfg.dtcs ?? []);
  }

  /** Next frame of a reply that started with 0x78 (response pending). */
  poll(): Bytes | undefined {
    const p = this.pend;
    if (!p) return undefined;
    if (p.left > 0) {
      p.left--;
      return PENDING(0x2e);
    }
    this.pend = undefined;
    return p.final;
  }

  handle(req: Bytes): Bytes | undefined {
    const f = this.faults;
    if (f.offline) return undefined;
    if (f.silentRequests && f.silentRequests > 0) {
      f.silentRequests--;
      return undefined;
    }
    const sid = at(req, 0);
    const neg = (nrc: number) => Uint8Array.of(0x7f, sid, nrc);
    switch (sid) {
      case 0x01: {
        const pid = at(req, 1);
        if (pid === 0x42 && f.voltage !== undefined) {
          const mv = Math.round(f.voltage * 1000);
          return Uint8Array.of(0x41, pid, mv >> 8, mv & 0xff);
        }
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
        this.session = at(req, 1) & 0x7f;
        if (this.session === 1) this.unlocked = false;
        return Uint8Array.of(0x50, at(req, 1), 0x00, 0x32, 0x01, 0xf4);
      case 0x11:
        if (!this.cfg.writableDids) return neg(0x11);
        this.session = 1;
        this.unlocked = false;
        return Uint8Array.of(0x51, at(req, 1));
      case 0x27:
        return this.securityAccess(req, neg);
      case 0x2e:
        return this.writeDid(req, neg);
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

  private securityAccess(req: Bytes, neg: (nrc: number) => Bytes): Bytes {
    if (this.cfg.securityLevel === undefined) return neg(0x11);
    const sub = at(req, 1);
    if (this.session === 1) return neg(0x7f);
    if (sub === 0x01) {
      this.seeds++;
      this.seed = Uint8Array.of(0x12, 0x34, this.seeds >> 8, this.seeds & 0xff);
      return Uint8Array.of(0x67, 0x01, ...this.seed);
    }
    if (sub !== 0x02) return neg(0x12);
    if (!this.seed) return neg(0x24);
    const want = simTestKey(this.seed);
    const got = req.subarray(2);
    this.seed = undefined;
    if (want.length !== got.length || want.some((b, i) => b !== got[i])) {
      this.keyFails++;
      return neg(this.keyFails >= 3 ? 0x36 : 0x35);
    }
    this.unlocked = true;
    return Uint8Array.of(0x67, 0x02);
  }

  private writeDid(req: Bytes, neg: (nrc: number) => Bytes): Bytes | undefined {
    const f = this.faults;
    const writable = this.cfg.writableDids;
    if (!writable) return neg(0x11);
    if (req.length < 4) return neg(0x13);
    const did = (at(req, 1) << 8) | at(req, 2);
    if (!writable.includes(did)) return neg(0x31);
    if (this.session !== 0x03) return neg(0x7f);
    if (this.cfg.securityLevel !== undefined && !this.unlocked) return neg(0x33);
    if (f.voltage !== undefined && f.voltage < 10.5) return neg(0x93);
    const cur = this.cfg.dids?.[did];
    const data = Array.from(req.subarray(3));
    if (!cur || cur.length !== data.length) return neg(0x13);
    this.writeCount++;
    if (f.nrcOnWrite !== undefined) {
      const reply = neg(f.nrcOnWrite);
      if (f.nrcOnWriteTimes !== undefined && --f.nrcOnWriteTimes <= 0) delete f.nrcOnWrite;
      return reply;
    }
    const store = this.cfg.dids as Record<number, number[]>;
    if (f.disconnectDuringWrite) {
      store[did] = [...data.slice(0, data.length >> 1), ...cur.slice(data.length >> 1)];
      f.offline = true;
      delete f.disconnectDuringWrite;
      return undefined;
    }
    if (f.corruptNextWrites && f.corruptNextWrites > 0) {
      f.corruptNextWrites--;
      data[data.length - 1] = (data[data.length - 1] ?? 0) ^ 0x01;
    }
    store[did] = data;
    this.onWrite?.(this.writeCount);
    let reply: Bytes | undefined = Uint8Array.of(0x6e, at(req, 1), at(req, 2));
    if (f.dropNextReplies && f.dropNextReplies > 0) {
      f.dropNextReplies--;
      reply = undefined;
    }
    if (f.pendingReplies && f.pendingReplies > 0) {
      this.pend = { left: f.pendingReplies - 1, final: reply };
      delete f.pendingReplies;
      return PENDING(0x2e);
    }
    return reply;
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

  poll(target: number): Bytes | undefined {
    return this.ecus.get(target)?.poll();
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
    let resp = this.vehicle.respond(target, data);
    // The simulator hides 0x78 (response pending) frames like the real transports do, within a budget.
    for (let i = 0; resp && resp.length === 3 && resp[0] === 0x7f && resp[2] === 0x78; i++) {
      resp = i < 8 ? this.vehicle.poll(target) : undefined;
    }
    if (!resp) throw new TimeoutError(`no response from 0x${target.toString(16)}`);
    return resp;
  }
}
