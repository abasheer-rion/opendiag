import { at } from "./util.ts";
import type { Bytes } from "./util.ts";
import type { DiagTransport } from "./transport.ts";
import { TimeoutError } from "./util.ts";
import { decodePid, obdRequest, parseDtcList, parseSupported, parseVin } from "./obd.ts";
import type { PidValue } from "./obd.ts";
import {
  NegativeResponse,
  clearDtc,
  expectPositive,
  parseDtcByStatusMask,
  readDid,
  readDtcByStatusMask,
  testerPresent,
} from "./uds.ts";
import type { UdsDtc } from "./dtc.ts";

export interface ObdDtcs {
  stored: string[];
  pending: string[];
  permanent: string[];
}

/** High-level operations on top of any transport. */
export class DiagClient {
  readonly transport: DiagTransport;

  constructor(transport: DiagTransport) {
    this.transport = transport;
  }

  private async call(target: number, req: Bytes, timeoutMs?: number): Promise<Bytes> {
    const resp = await this.transport.request(target, req, timeoutMs);
    return expectPositive(at(req, 0), resp);
  }

  /** Read the VIN with OBD-II mode 09 (generic, CAN ECU ids 0x7E0..). */
  async readVinObd(target = 0x7e0): Promise<string> {
    const body = await this.call(target, obdRequest(0x09, 0x02));
    return parseVin(body.subarray(2));
  }

  /** Read the VIN with UDS DID 0xF190 (works on most modern ECUs, including BMW over ENET). */
  async readVinUds(target: number): Promise<string> {
    const body = await this.call(target, readDid(0xf190));
    return parseVin(body.subarray(2));
  }

  /** UDS ReadDataByIdentifier. Returns only the data bytes (the DID echo is checked and removed). */
  async readDataByIdentifier(target: number, did: number, timeoutMs?: number): Promise<Bytes> {
    const body = await this.call(target, readDid(did), timeoutMs);
    if (body.length < 2 || ((at(body, 0) << 8) | at(body, 1)) !== did) {
      throw new Error(`response echoed the wrong DID (wanted 0x${did.toString(16)})`);
    }
    return body.subarray(2);
  }

  async readObdDtcs(target = 0x7e0): Promise<ObdDtcs> {
    const get = async (mode: number): Promise<string[]> => {
      try {
        return parseDtcList(await this.call(target, obdRequest(mode)));
      } catch (e) {
        if (e instanceof NegativeResponse) return [];
        throw e;
      }
    };
    return { stored: await get(0x03), pending: await get(0x07), permanent: await get(0x0a) };
  }

  async readUdsDtcs(target: number, mask = 0xff): Promise<UdsDtc[]> {
    const body = await this.call(target, readDtcByStatusMask(mask));
    return parseDtcByStatusMask(body).dtcs;
  }

  async clearObdDtcs(target = 0x7e0): Promise<void> {
    await this.call(target, obdRequest(0x04));
  }

  async clearUdsDtcs(target: number, group = 0xffffff): Promise<void> {
    await this.call(target, clearDtc(group));
  }

  async readPid(pid: number, target = 0x7e0): Promise<PidValue | undefined> {
    const body = await this.call(target, obdRequest(0x01, pid));
    return decodePid(pid, body.subarray(1));
  }

  async supportedPids(target = 0x7e0): Promise<number[]> {
    const out: number[] = [];
    for (const base of [0x00, 0x20, 0x40, 0x60]) {
      const body = await this.call(target, obdRequest(0x01, base));
      const found = parseSupported(base, body.subarray(1));
      out.push(...found);
      if (!found.includes(base + 0x20)) break;
    }
    return out.filter((p) => p % 0x20 !== 0);
  }

  /** Find which of `targets` answer a UDS TesterPresent. Short timeout per address. */
  async scanUds(targets: number[], timeoutMs = 300): Promise<number[]> {
    const alive: number[] = [];
    for (const t of targets) {
      try {
        await this.call(t, testerPresent(), timeoutMs);
        alive.push(t);
      } catch (e) {
        if (e instanceof NegativeResponse) alive.push(t); // it answered, even if "not supported"
        else if (!(e instanceof TimeoutError)) throw e;
      }
    }
    return alive;
  }
}
