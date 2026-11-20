import { at, concat } from "./util.ts";
import type { Bytes } from "./util.ts";

/** ISO 15765-2 (ISO-TP) segmentation for classic CAN, 8-byte frames, payload up to 4095 bytes. */
export function segment(payload: Bytes): Bytes[] {
  const n = payload.length;
  if (n === 0) throw new Error("empty payload");
  if (n <= 7) return [concat(Uint8Array.of(n), payload)];
  if (n > 4095) throw new Error("payload too long for classic ISO-TP");
  const frames: Bytes[] = [concat(Uint8Array.of(0x10 | (n >> 8), n & 0xff), payload.subarray(0, 6))];
  let sn = 1;
  for (let o = 6; o < n; o += 7) {
    frames.push(concat(Uint8Array.of(0x20 | sn), payload.subarray(o, o + 7)));
    sn = (sn + 1) & 0xf;
  }
  return frames;
}

/** Flow control frame: continue to send, block size 0 (no limit), separation time `st` ms. */
export function flowControl(st = 0): Bytes {
  return Uint8Array.of(0x30, 0x00, st);
}

export interface FeedResult {
  payload?: Bytes;
  /** True after a first frame: the sender is waiting for our flow control frame. */
  sendFlowControl?: boolean;
}

export class Reassembler {
  private buf: Uint8Array | undefined;
  private len = 0;
  private got = 0;
  private nextSn = 1;

  feed(frame: Bytes): FeedResult {
    const pci = at(frame, 0);
    const type = pci >> 4;
    if (type === 0) {
      const n = pci & 0xf;
      if (n === 0 || n > frame.length - 1) throw new Error("bad single frame length");
      this.reset();
      return { payload: frame.slice(1, 1 + n) };
    }
    if (type === 1) {
      this.len = ((pci & 0xf) << 8) | at(frame, 1);
      this.buf = new Uint8Array(this.len);
      const first = frame.subarray(2, 8);
      this.buf.set(first.subarray(0, this.len));
      this.got = Math.min(first.length, this.len);
      this.nextSn = 1;
      return { sendFlowControl: true };
    }
    if (type === 2) {
      if (!this.buf) throw new Error("consecutive frame without first frame");
      const sn = pci & 0xf;
      if (sn !== this.nextSn) {
        this.reset();
        throw new Error(`ISO-TP sequence error: expected ${this.nextSn}, got ${sn}`);
      }
      const chunk = frame.subarray(1, 1 + Math.min(7, this.len - this.got));
      this.buf.set(chunk, this.got);
      this.got += chunk.length;
      this.nextSn = (this.nextSn + 1) & 0xf;
      if (this.got >= this.len) {
        const payload = this.buf;
        this.reset();
        return { payload };
      }
      return {};
    }
    return {}; // flow control frames are for the sender side
  }

  private reset(): void {
    this.buf = undefined;
    this.len = 0;
    this.got = 0;
    this.nextSn = 1;
  }
}
