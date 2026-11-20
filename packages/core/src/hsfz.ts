import { concat } from "./util.ts";
import type { Bytes } from "./util.ts";

/**
 * BMW HSFZ framing over TCP port 6801 (ENET). Layout from public sources, NOT yet verified
 * against a live capture (see docs/research/bmw-ista-architecture.md, open question 1):
 *   [length u32 BE][control word u16 BE][payload]
 * Diagnostic payload: [source u8][target u8][UDS bytes...]. Length is assumed to count payload bytes.
 */
export const HSFZ_PORT = 6801;
export const HSFZ_DEFAULT_TESTER = 0xf4;
export const HSFZ_CTRL = { DIAG: 0x0001, ACK: 0x0002 } as const;

export interface HsfzFrame {
  control: number;
  payload: Bytes;
}

export function encodeHsfz(control: number, payload: Bytes): Bytes {
  const head = new Uint8Array(6);
  const v = new DataView(head.buffer);
  v.setUint32(0, payload.length);
  v.setUint16(4, control);
  return concat(head, payload);
}

export function diagFrame(source: number, target: number, uds: Bytes): Bytes {
  return encodeHsfz(HSFZ_CTRL.DIAG, concat(Uint8Array.of(source, target), uds));
}

export function parseDiagPayload(p: Bytes): { source: number; target: number; uds: Bytes } {
  if (p.length < 3) throw new Error("short HSFZ diagnostic payload");
  return { source: p[0] as number, target: p[1] as number, uds: p.subarray(2) };
}

/** Incremental decoder for a TCP byte stream. */
export class HsfzDecoder {
  private buf: Bytes = new Uint8Array(0);

  push(chunk: Bytes): HsfzFrame[] {
    this.buf = concat(this.buf, chunk);
    const out: HsfzFrame[] = [];
    for (;;) {
      if (this.buf.length < 6) break;
      const v = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
      const len = v.getUint32(0);
      if (len > 0x10000) throw new Error(`implausible HSFZ length ${len}`);
      if (this.buf.length < 6 + len) break;
      out.push({ control: v.getUint16(4), payload: this.buf.slice(6, 6 + len) });
      this.buf = this.buf.slice(6 + len);
    }
    return out;
  }
}
