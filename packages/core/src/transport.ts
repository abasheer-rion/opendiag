import type { Bytes } from "./util.ts";

/**
 * A diagnostic link to a vehicle. `target` is the ECU address in the transport's own scheme
 * (CAN request id for ELM327, 1-byte logical address for ENET/HSFZ, 2-byte for DoIP).
 * `request` resolves with the final response (response-pending frames are handled inside).
 */
export interface DiagTransport {
  readonly name: string;
  open(): Promise<void>;
  close(): Promise<void>;
  request(target: number, data: Bytes, timeoutMs?: number): Promise<Bytes>;
}

export const DEFAULT_TIMEOUT_MS = 2000;

export class WriteBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WriteBlockedError";
  }
}

/** Services that only read: OBD modes 01/02/03/07/09/0A and UDS 0x19, 0x22, 0x3E. */
const READ_SIDS = new Set([0x01, 0x02, 0x03, 0x07, 0x09, 0x0a, 0x19, 0x22, 0x3e]);

function isReadRequest(data: Bytes): boolean {
  const sid = data[0];
  return sid !== undefined && (READ_SIDS.has(sid) || (sid === 0x10 && data[1] === 0x01));
}

function guarded(t: DiagTransport, label: string, extra: ReadonlySet<number>): DiagTransport {
  return {
    name: `${t.name} (${label})`,
    open: () => t.open(),
    close: () => t.close(),
    request(target, data, timeoutMs) {
      const sid = data[0];
      if (!isReadRequest(data) && !(sid !== undefined && extra.has(sid))) {
        throw new WriteBlockedError(`read-only mode: service 0x${(sid ?? 0).toString(16)} is not allowed`);
      }
      return t.request(target, data, timeoutMs);
    },
  };
}

/**
 * Wrap a transport so it can only send read requests. Anything else (writes, routines, security
 * access, resets, DTC clearing, non-default sessions) throws before reaching the wire.
 */
export function readOnly(t: DiagTransport): DiagTransport {
  return guarded(t, "read-only", new Set());
}

/**
 * Like readOnly, but also lets the listed service ids through. Use it around a single call
 * and drop it afterwards; the base read rules are unchanged.
 */
export function readOnlyExcept(t: DiagTransport, allowedSids: Iterable<number>): DiagTransport {
  const extra = new Set<number>();
  for (const s of allowedSids) {
    if (!Number.isInteger(s) || s < 0 || s > 0xff) throw new RangeError(`bad service id ${s}`);
    extra.add(s);
  }
  return guarded(t, "read-only except " + [...extra].map((s) => "0x" + s.toString(16)).join(","), extra);
}
