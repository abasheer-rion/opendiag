import { concat } from "./util.ts";
import type { Bytes } from "./util.ts";

/** ISO 13400-2 DoIP over TCP port 13400. Header: [version][~version][type u16][length u32]. */
export const DOIP_PORT = 13400;
export const DOIP_VERSION = 0x02;
export const DOIP_TYPE = {
  ROUTING_ACTIVATION_REQ: 0x0005,
  ROUTING_ACTIVATION_RES: 0x0006,
  DIAG_MESSAGE: 0x8001,
  DIAG_ACK: 0x8002,
  DIAG_NACK: 0x8003,
} as const;

export interface DoipFrame {
  type: number;
  payload: Bytes;
}

export function encodeDoip(type: number, payload: Bytes): Bytes {
  const head = new Uint8Array(8);
  const v = new DataView(head.buffer);
  v.setUint8(0, DOIP_VERSION);
  v.setUint8(1, DOIP_VERSION ^ 0xff);
  v.setUint16(2, type);
  v.setUint32(4, payload.length);
  return concat(head, payload);
}

export const u16 = (n: number): Bytes => Uint8Array.of((n >> 8) & 0xff, n & 0xff);

export function routingActivationRequest(source: number, activationType = 0x00): Bytes {
  return encodeDoip(
    DOIP_TYPE.ROUTING_ACTIVATION_REQ,
    concat(u16(source), Uint8Array.of(activationType, 0, 0, 0, 0)),
  );
}

export function diagMessage(source: number, target: number, uds: Bytes): Bytes {
  return encodeDoip(DOIP_TYPE.DIAG_MESSAGE, concat(u16(source), u16(target), uds));
}

export function parseDiagMessage(p: Bytes): { source: number; target: number; uds: Bytes } {
  if (p.length < 5) throw new Error("short DoIP diagnostic message");
  const v = new DataView(p.buffer, p.byteOffset, p.byteLength);
  return { source: v.getUint16(0), target: v.getUint16(2), uds: p.subarray(4) };
}

export class DoipDecoder {
  private buf: Bytes = new Uint8Array(0);

  push(chunk: Bytes): DoipFrame[] {
    this.buf = concat(this.buf, chunk);
    const out: DoipFrame[] = [];
    for (;;) {
      if (this.buf.length < 8) break;
      const v = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
      if (v.getUint8(0) ^ v.getUint8(1) ^ 0xff) throw new Error("bad DoIP header (version/inverse mismatch)");
      const len = v.getUint32(4);
      if (len > 0x100000) throw new Error(`implausible DoIP length ${len}`);
      if (this.buf.length < 8 + len) break;
      out.push({ type: v.getUint16(2), payload: this.buf.slice(8, 8 + len) });
      this.buf = this.buf.slice(8 + len);
    }
    return out;
  }
}
