import { createHmac } from "node:crypto";
import { fromHex, toHex } from "./util.ts";
import type { Bytes } from "./util.ts";
import type { DiagTransport } from "./transport.ts";

/** One line of an .odtrace file (JSONL). */
export interface TraceRecord {
  /** Milliseconds since the trace started, when the request was sent. */
  ts: number;
  target: number;
  /** Request bytes, hex, no separators. */
  req: string;
  /** Response bytes, hex, no separators. Absent when the request failed. */
  res?: string;
  /** Error text when the request failed (timeout, closed link, ...). */
  err?: string;
  /** Milliseconds from send to answer or failure. */
  ms: number;
}

export interface TracedTransport extends DiagTransport {
  /** Number of requests recorded so far. */
  readonly count: number;
}

/**
 * Wrap a transport so every request and its outcome is passed to `sink` as one JSON line.
 * Wrap the OUTSIDE of the transport and put any guard around this wrapper, so blocked
 * requests (never sent) are not recorded.
 */
export function traceTransport(
  t: DiagTransport,
  sink: (line: string) => void,
  clock: () => number = () => performance.now(),
): TracedTransport {
  const start = clock();
  let count = 0;
  return {
    name: t.name,
    open: () => t.open(),
    close: () => t.close(),
    get count() {
      return count;
    },
    async request(target, data, timeoutMs) {
      const sent = clock();
      const rec: TraceRecord = { ts: Math.round(sent - start), target, req: toHex(data, ""), ms: 0 };
      count++;
      try {
        const resp = await t.request(target, data, timeoutMs);
        rec.res = toHex(resp, "");
        return resp;
      } catch (e) {
        rec.err = e instanceof Error ? e.message : String(e);
        throw e;
      } finally {
        rec.ms = Math.round(clock() - sent);
        sink(JSON.stringify(rec));
      }
    },
  };
}

const VIN_CHARS = /[A-HJ-NPR-Z0-9]/;
const isVinChar = (b: number): boolean => VIN_CHARS.test(String.fromCharCode(b));
const VIN_TEXT = /\b[A-HJ-NPR-Z0-9]{17}\b/g;
const IPV4 = /\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b/g;
const MAC = /\b[0-9a-f]{2}(?:[:-][0-9a-f]{2}){5}\b/gi;

/** Stable salted pseudonym for a VIN: 17 characters that still look like a VIN. */
export function hashVin(vin: string, salt: string): string {
  return createHmac("sha256", salt).update(vin).digest("hex").slice(0, 17).toUpperCase();
}

/** Short salted hash for storing next to results (no VIN in clear text). */
export function vinFingerprint(vin: string, salt: string): string {
  return createHmac("sha256", salt).update(vin).digest("hex").slice(0, 16);
}

/** Replace 17-character VINs in text and drop IP and MAC addresses. */
export function scrubText(s: string, salt: string): string {
  return s
    .replace(MAC, "[mac removed]")
    .replace(IPV4, "[ip removed]")
    .replace(VIN_TEXT, (v) => (/[0-9]/.test(v) && /[A-Z]/.test(v) ? hashVin(v, salt) : v));
}

/** Replace any 17-byte run of VIN characters inside a hex string with its salted pseudonym. */
function scrubHex(hex: string, salt: string): string {
  let b: Bytes;
  try {
    b = fromHex(hex);
  } catch {
    return hex;
  }
  const out = Uint8Array.from(b);
  for (let i = 0; i + 17 <= b.length; ) {
    let all = true;
    for (let j = 0; j < 17; j++) if (!isVinChar(b[i + j] as number)) all = false;
    if (!all) {
      i++;
      continue;
    }
    const vin = String.fromCharCode(...b.subarray(i, i + 17));
    if (/[0-9]/.test(vin) && /[A-Z]/.test(vin)) out.set(Buffer.from(hashVin(vin, salt), "ascii"), i);
    i += 17;
  }
  return toHex(out, "");
}

/**
 * Make a trace safe to share: salted-hash VINs (in the bytes and in error text), drop IP and
 * MAC-looking tokens. Timestamps are already relative to the start, so no dates remain.
 * Lines that are not trace records are dropped.
 */
export function anonymiseTrace(jsonl: string, salt: string): string {
  const lines: string[] = [];
  for (const line of jsonl.split("\n")) {
    if (!line.trim()) continue;
    let rec: TraceRecord;
    try {
      rec = JSON.parse(line) as TraceRecord;
    } catch {
      continue;
    }
    const out: TraceRecord = { ...rec, req: scrubHex(rec.req, salt) };
    if (rec.res !== undefined) out.res = scrubHex(rec.res, salt);
    if (rec.err !== undefined) out.err = scrubText(rec.err, salt);
    lines.push(JSON.stringify(out));
  }
  return lines.length ? lines.join("\n") + "\n" : "";
}
