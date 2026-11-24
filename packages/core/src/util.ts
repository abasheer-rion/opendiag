export type Bytes = Uint8Array;

export function toHex(b: Bytes, sep = " "): string {
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join(sep).toUpperCase();
}

export function fromHex(s: string): Bytes {
  const c = s.replace(/[^0-9a-fA-F]/g, "");
  if (c.length % 2 !== 0) throw new Error("odd number of hex digits");
  const out = new Uint8Array(c.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(c.slice(2 * i, 2 * i + 2), 16);
  return out;
}

export function concat(...parts: Bytes[]): Bytes {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** Bounds-checked byte read. */
export function at(b: Bytes, i: number): number {
  const v = b[i];
  if (v === undefined) throw new RangeError(`index ${i} out of range (length ${b.length})`);
  return v;
}

export const u8 = at;

export function ascii(b: Bytes): string {
  return String.fromCharCode(...b.filter((x) => x >= 0x20 && x < 0x7f));
}

/** ASCII text to bytes. Portable (no Node Buffer). */
export function asciiBytes(s: string): number[] {
  return Array.from(s, (c) => c.charCodeAt(0) & 0x7f);
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

interface Waiter<T> {
  pred: (t: T) => boolean;
  resolve: (t: T) => void;
  reject: (e: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/** Async queue: push items in, await the next one matching a predicate. */
export class Inbox<T> {
  private items: T[] = [];
  private waiters: Waiter<T>[] = [];

  push(item: T): void {
    const i = this.waiters.findIndex((w) => w.pred(item));
    if (i >= 0) {
      const [w] = this.waiters.splice(i, 1);
      if (w) {
        clearTimeout(w.timer);
        w.resolve(item);
        return;
      }
    }
    this.items.push(item);
  }

  next(pred: (t: T) => boolean, timeoutMs: number): Promise<T> {
    const i = this.items.findIndex(pred);
    if (i >= 0) return Promise.resolve(this.items.splice(i, 1)[0] as T);
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiters = this.waiters.filter((w) => w.timer !== timer);
        reject(new TimeoutError(`no response within ${timeoutMs} ms`));
      }, timeoutMs);
      this.waiters.push({ pred, resolve, reject, timer });
    });
  }

  fail(err: Error): void {
    for (const w of this.waiters) {
      clearTimeout(w.timer);
      w.reject(err);
    }
    this.waiters = [];
  }

  clear(): void {
    this.items = [];
  }
}
