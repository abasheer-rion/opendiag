import { TimeoutError, fromHex, toHex } from "./util.ts";
import type { Bytes } from "./util.ts";
import { DEFAULT_TIMEOUT_MS } from "./transport.ts";
import type { DiagTransport } from "./transport.ts";

/** Text duplex stream to an ELM327-style adapter (TCP for WiFi adapters, serial/BLE wrappers later). */
export interface ByteStream {
  write(data: string): void;
  onData(cb: (chunk: string) => void): void;
  onClose(cb: () => void): void;
  close(): void;
}

const ERROR_LINES = /^(NO DATA|UNABLE TO CONNECT|CAN ERROR|BUS ERROR|BUS BUSY|BUFFER FULL|DATA ERROR|FB ERROR|LV RESET|STOPPED|\?)/;

/** Turn the adapter's text lines into response bytes. Handles ELM327 multi-line ISO-TP output. */
export function parseElmResponse(lines: string[]): Bytes {
  const idx = lines.findIndex((l) => /^[0-9A-F]:/i.test(l));
  const lenLine = idx >= 1 ? (lines[idx - 1] ?? "") : "";
  if (idx >= 1 && /^[0-9A-F]{3}$/i.test(lenLine)) {
    const len = parseInt(lenLine, 16);
    const body = lines
      .slice(idx)
      .filter((l) => /^[0-9A-F]:/i.test(l))
      .map((l) => l.replace(/^[0-9A-F]:/i, ""))
      .join("");
    return fromHex(body).slice(0, len);
  }
  const hexLine = lines.find((l) => /^[0-9A-F ]+$/i.test(l));
  if (!hexLine) throw new Error(`unparseable adapter response: ${lines.join(" | ")}`);
  return fromHex(hexLine);
}

export class Elm327Transport implements DiagTransport {
  readonly name = "elm327";
  /** Adapter banner from ATZ/ATI, set after open(). */
  banner = "";
  private stream: ByteStream;
  private buf = "";
  private waiting: ((text: string) => void) | undefined;
  private closed: (() => void) | undefined;
  private chain: Promise<unknown> = Promise.resolve();
  private header: number | undefined;

  constructor(stream: ByteStream) {
    this.stream = stream;
    stream.onData((c) => this.onChunk(c));
    stream.onClose(() => this.closed?.());
  }

  async open(): Promise<void> {
    const z = await this.command("ATZ", 4000);
    this.banner = z.find((l) => /ELM|STN|OBD/i.test(l)) ?? "";
    for (const c of ["ATE0", "ATL0", "ATS0", "ATH0", "ATCAF1", "ATSP0"]) await this.command(c);
  }

  async close(): Promise<void> {
    this.stream.close();
  }

  async request(target: number, data: Bytes, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Bytes> {
    if (this.header !== target) {
      await this.command(`ATSH${target.toString(16).toUpperCase().padStart(3, "0")}`);
      this.header = target;
    }
    const lines = await this.command(toHex(data, ""), timeoutMs);
    const bad = lines.find((l) => ERROR_LINES.test(l));
    if (bad) {
      if (bad.startsWith("NO DATA")) throw new TimeoutError("adapter: NO DATA");
      throw new Error(`adapter error: ${bad}`);
    }
    return parseElmResponse(lines);
  }

  private onChunk(chunk: string): void {
    this.buf += chunk;
    const i = this.buf.indexOf(">");
    if (i >= 0 && this.waiting) {
      const text = this.buf.slice(0, i);
      this.buf = this.buf.slice(i + 1);
      const w = this.waiting;
      this.waiting = undefined;
      w(text);
    }
  }

  private command(line: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string[]> {
    const run = () =>
      new Promise<string[]>((resolve, reject) => {
        const timer = setTimeout(() => {
          this.waiting = undefined;
          this.closed = undefined;
          reject(new TimeoutError(`adapter did not answer "${line}"`));
        }, timeoutMs);
        this.closed = () => {
          clearTimeout(timer);
          reject(new Error("adapter connection closed"));
        };
        this.waiting = (text) => {
          clearTimeout(timer);
          this.closed = undefined;
          const lines = text
            .split(/[\r\n]+/)
            .map((l) => l.trim())
            .filter((l) => l && l !== line && !/^SEARCHING/.test(l));
          resolve(lines);
        };
        this.buf = "";
        this.stream.write(line + "\r");
      });
    const p = this.chain.then(run, run);
    this.chain = p.catch(() => undefined);
    return p;
  }
}
