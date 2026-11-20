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
