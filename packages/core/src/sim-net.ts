import net from "node:net";
import { fromHex, toHex, u8 } from "./util.ts";
import type { Bytes } from "./util.ts";
import type { SimVehicle } from "./sim.ts";
import type { ByteStream } from "./elm327.ts";
import { HSFZ_CTRL, HsfzDecoder, diagFrame, encodeHsfz, parseDiagPayload } from "./hsfz.ts";
import { DOIP_TYPE, DoipDecoder, diagMessage, encodeDoip, parseDiagMessage, u16 } from "./doip.ts";

export interface SimServer {
  port: number;
  close(): Promise<void>;
}

export interface SimServerOptions {
  port?: number;
  /** Send a "response pending" (NRC 0x78) before every real response. */
  pendingFirst?: boolean;
}

function listen(server: net.Server, port: number): Promise<SimServer> {
  const sockets = new Set<net.Socket>();
  server.on("connection", (s) => {
    sockets.add(s);
    s.on("close", () => sockets.delete(s));
  });
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      const addr = server.address() as net.AddressInfo;
      resolve({
        port: addr.port,
        close: () =>
          new Promise<void>((r) => {
            server.close(() => r());
            for (const s of sockets) s.destroy();
          }),
      });
    });
  });
}

const pending = (sid: number): Bytes => Uint8Array.of(0x7f, sid, 0x78);

/** Fake ENET gateway speaking HSFZ on 127.0.0.1. */
export function startSimHsfzServer(vehicle: SimVehicle, opts: SimServerOptions = {}): Promise<SimServer> {
  const server = net.createServer((sock) => {
    const dec = new HsfzDecoder();
    sock.on("data", (chunk) => {
      for (const f of dec.push(chunk)) {
        if (f.control !== HSFZ_CTRL.DIAG) continue;
        const { source, target, uds } = parseDiagPayload(f.payload);
        sock.write(encodeHsfz(HSFZ_CTRL.ACK, f.payload.subarray(0, 2)));
        if (opts.pendingFirst) sock.write(diagFrame(target, source, pending(u8(uds, 0))));
        const resp = vehicle.respond(target, uds);
        if (resp) sock.write(diagFrame(target, source, resp));
      }
    });
    sock.on("error", () => {});
  });
  return listen(server, opts.port ?? 0);
}

/** Fake DoIP entity on 127.0.0.1. */
export function startSimDoipServer(vehicle: SimVehicle, opts: SimServerOptions = {}): Promise<SimServer> {
  const server = net.createServer((sock) => {
    const dec = new DoipDecoder();
    sock.on("data", (chunk) => {
      for (const f of dec.push(chunk)) {
        if (f.type === DOIP_TYPE.ROUTING_ACTIVATION_REQ) {
          const tester = (u8(f.payload, 0) << 8) | u8(f.payload, 1);
          sock.write(
            encodeDoip(
              DOIP_TYPE.ROUTING_ACTIVATION_RES,
              new Uint8Array([...u16(tester), ...u16(0x1000), 0x10, 0, 0, 0, 0]),
            ),
          );
        } else if (f.type === DOIP_TYPE.DIAG_MESSAGE) {
          const { source, target, uds } = parseDiagMessage(f.payload);
          sock.write(encodeDoip(DOIP_TYPE.DIAG_ACK, new Uint8Array([...u16(target), ...u16(source), 0x00])));
          if (opts.pendingFirst) sock.write(diagMessage(target, source, pending(u8(uds, 0))));
          const resp = vehicle.respond(target, uds);
          if (resp) sock.write(diagMessage(target, source, resp));
        }
      }
    });
    sock.on("error", () => {});
  });
  return listen(server, opts.port ?? 0);
}

/** In-memory ELM327 emulator (echo on until ATE0, multi-line ISO-TP style output). */
export class SimElm implements ByteStream {
  private vehicle: SimVehicle;
  private dataCb: (c: string) => void = () => {};
  private header = 0x7e0;
  private echo = true;
  private partial = "";

  constructor(vehicle: SimVehicle) {
    this.vehicle = vehicle;
  }

  onData(cb: (chunk: string) => void): void {
    this.dataCb = cb;
  }
  onClose(): void {}
  close(): void {}

  write(data: string): void {
    this.partial += data;
    let i: number;
    while ((i = this.partial.indexOf("\r")) >= 0) {
      const line = this.partial.slice(0, i).trim();
      this.partial = this.partial.slice(i + 1);
      const out = this.run(line);
      setImmediate(() => this.dataCb((this.echo ? line + "\r" : "") + out + "\r\r>"));
    }
  }

  private run(line: string): string {
    const l = line.toUpperCase().replace(/\s+/g, "");
    if (l === "ATZ") {
      this.echo = true;
      return "\r\rELM327 v1.5";
    }
    if (l === "ATE0") {
      this.echo = false;
      return "OK";
    }
    if (l.startsWith("ATSH")) {
      this.header = parseInt(l.slice(4), 16);
      return "OK";
    }
    if (l.startsWith("AT")) return "OK";
    let req: Bytes;
    try {
      req = fromHex(l);
    } catch {
      return "?";
    }
    const target = this.header === 0x7df ? 0x7e0 : this.header;
    const resp = this.vehicle.respond(target, req);
    if (!resp) return "NO DATA";
    if (resp.length <= 7) return toHex(resp, "");
    const rows: string[] = [resp.length.toString(16).toUpperCase().padStart(3, "0")];
    rows.push(`0: ${toHex(resp.subarray(0, 6), " ")}`);
    for (let o = 6, n = 1; o < resp.length; o += 7, n++) {
      rows.push(`${(n & 0xf).toString(16).toUpperCase()}: ${toHex(resp.subarray(o, o + 7), " ")}`);
    }
    return rows.join("\r");
  }
}
