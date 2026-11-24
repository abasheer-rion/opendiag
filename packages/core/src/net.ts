import net from "node:net";
import { Inbox, TimeoutError, at } from "./util.ts";
import type { Bytes } from "./util.ts";
import { DEFAULT_TIMEOUT_MS } from "./transport.ts";
import type { DiagTransport } from "./transport.ts";
import { HSFZ_CTRL, HSFZ_DEFAULT_TESTER, HSFZ_PORT, HsfzDecoder, diagFrame, parseDiagPayload } from "./hsfz.ts";
import type { HsfzFrame } from "./hsfz.ts";
import { DOIP_PORT, DOIP_TYPE, DoipDecoder, diagMessage, parseDiagMessage, routingActivationRequest } from "./doip.ts";
import type { DoipFrame } from "./doip.ts";
import { isResponsePending } from "./uds.ts";
import type { ByteStream } from "./elm327.ts";

/** A car that keeps saying "wait" for ever must not keep us waiting for ever. */
export const MAX_PENDING_FRAMES = 100;

function connect(host: string, port: number, timeoutMs: number): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const s = net.connect({ host, port });
    s.setNoDelay(true);
    const timer = setTimeout(() => {
      s.destroy();
      reject(new TimeoutError(`connect to ${host}:${port} timed out`));
    }, timeoutMs);
    s.once("connect", () => {
      clearTimeout(timer);
      resolve(s);
    });
    s.once("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
  });
}

/** TCP text stream for WiFi ELM327 adapters (commonly 192.168.0.10:35000). */
export async function connectTcpStream(host: string, port: number): Promise<ByteStream> {
  const s = await connect(host, port, 5000);
  s.setEncoding("latin1");
  return {
    write: (d) => void s.write(d, "latin1"),
    onData: (cb) => void s.on("data", (c) => cb(String(c))),
    onClose: (cb) => void s.on("close", cb),
    close: () => void s.destroy(),
  };
}

export interface NetOptions {
  host: string;
  port?: number;
  tester?: number;
}

/** BMW ENET (HSFZ over TCP 6801). Wire layout still to be confirmed with a live capture. */
export class HsfzTransport implements DiagTransport {
  readonly name: string;
  private opts: NetOptions;
  private socket: net.Socket | undefined;
  private decoder = new HsfzDecoder();
  private inbox = new Inbox<HsfzFrame>();

  constructor(opts: NetOptions) {
    this.opts = opts;
    this.name = `hsfz://${opts.host}:${opts.port ?? HSFZ_PORT}`;
  }

  async open(): Promise<void> {
    const s = await connect(this.opts.host, this.opts.port ?? HSFZ_PORT, 5000);
    s.on("data", (chunk) => {
      for (const f of this.decoder.push(chunk)) if (f.control === HSFZ_CTRL.DIAG) this.inbox.push(f);
    });
    const fail = () => this.inbox.fail(new Error("ENET connection closed"));
    s.on("close", fail);
    s.on("error", fail);
    this.socket = s;
  }

  async close(): Promise<void> {
    this.socket?.destroy();
  }

  async request(target: number, data: Bytes, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Bytes> {
    if (!this.socket) throw new Error("transport not open");
    const tester = this.opts.tester ?? HSFZ_DEFAULT_TESTER;
    this.inbox.clear();
    this.socket.write(diagFrame(tester, target, data));
    for (let pending = 0; ; pending++) {
      const f = await this.inbox.next((x) => at(x.payload, 0) === target, timeoutMs);
      const { uds } = parseDiagPayload(f.payload);
      if (!isResponsePending(uds)) return uds;
      if (pending >= MAX_PENDING_FRAMES) throw new TimeoutError(`gave up after ${MAX_PENDING_FRAMES} response-pending answers`);
    }
  }
}

/** ISO 13400 DoIP transport (most non-BMW Ethernet diagnostics). */
export class DoipTransport implements DiagTransport {
  readonly name: string;
  private opts: NetOptions;
  private socket: net.Socket | undefined;
  private decoder = new DoipDecoder();
  private inbox = new Inbox<DoipFrame>();

  constructor(opts: NetOptions) {
    this.opts = opts;
    this.name = `doip://${opts.host}:${opts.port ?? DOIP_PORT}`;
  }

  private get tester(): number {
    return this.opts.tester ?? 0x0e80;
  }

  async open(): Promise<void> {
    const s = await connect(this.opts.host, this.opts.port ?? DOIP_PORT, 5000);
    s.on("data", (chunk) => {
      for (const f of this.decoder.push(chunk)) this.inbox.push(f);
    });
    const fail = () => this.inbox.fail(new Error("DoIP connection closed"));
    s.on("close", fail);
    s.on("error", fail);
    this.socket = s;
    s.write(routingActivationRequest(this.tester));
    const res = await this.inbox.next((f) => f.type === DOIP_TYPE.ROUTING_ACTIVATION_RES, 3000);
    const code = at(res.payload, 4);
    if (code !== 0x10 && code !== 0x11) throw new Error(`DoIP routing activation refused (code 0x${code.toString(16)})`);
  }

  async close(): Promise<void> {
    this.socket?.destroy();
  }

  async request(target: number, data: Bytes, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Bytes> {
    if (!this.socket) throw new Error("transport not open");
    this.inbox.clear();
    this.socket.write(diagMessage(this.tester, target, data));
    for (let pending = 0; ; pending++) {
      const f = await this.inbox.next(
        (x) =>
          x.type === DOIP_TYPE.DIAG_NACK ||
          (x.type === DOIP_TYPE.DIAG_MESSAGE && parseDiagMessage(x.payload).source === target),
        timeoutMs,
      );
      if (f.type === DOIP_TYPE.DIAG_NACK) throw new Error(`DoIP diagnostic NACK (code 0x${at(f.payload, 4).toString(16)})`);
      const { uds } = parseDiagMessage(f.payload);
      if (!isResponsePending(uds)) return uds;
      if (pending >= MAX_PENDING_FRAMES) throw new TimeoutError(`gave up after ${MAX_PENDING_FRAMES} response-pending answers`);
    }
  }
}
