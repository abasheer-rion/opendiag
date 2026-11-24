import { readOnlyExcept } from "../../core/src/index.ts";
import type { Bytes, DiagTransport } from "../../core/src/index.ts";

/** Session control, ECU reset, security access and WriteDataByIdentifier. Nothing else gets through. */
const WRITE_SIDS = [0x10, 0x11, 0x27, 0x2e];

/**
 * The only door to a module's write services. It lives in packages/lab and nothing in the app or
 * the default CLI may import it. Flash services (0x34 to 0x37), routines (0x31), DTC clearing (0x14)
 * and everything else are refused before they reach the wire.
 */
export class WriteTransport implements DiagTransport {
  readonly name: string;
  private readonly inner: DiagTransport;

  private constructor(inner: DiagTransport) {
    this.inner = readOnlyExcept(inner, WRITE_SIDS);
    this.name = this.inner.name;
  }

  static open(inner: DiagTransport): WriteTransport {
    return new WriteTransport(inner);
  }

  open(): Promise<void> {
    return this.inner.open();
  }

  close(): Promise<void> {
    return this.inner.close();
  }

  request(target: number, data: Bytes, timeoutMs?: number): Promise<Bytes> {
    return this.inner.request(target, data, timeoutMs);
  }

  writeDid(target: number, did: number, value: Bytes): Promise<Bytes> {
    return this.inner.request(target, Uint8Array.of(0x2e, did >> 8, did & 0xff, ...value));
  }
}
