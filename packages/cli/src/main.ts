import {
  DiagClient,
  DoipTransport,
  Elm327Transport,
  HsfzTransport,
  SimTransport,
  connectTcpStream,
} from "../../core/src/index.ts";
import type { DiagTransport } from "../../core/src/index.ts";

const HELP = `opendiag - open-source vehicle diagnostics

usage: opendiag <command> [--adapter <spec>] [--target <addr>] [--json]

commands
  vin             read the VIN
  dtc             read fault codes
  clear --yes     clear fault codes (erases freeze frame data too)
  live [--count N] live engine data (OBD-II PIDs)
  pids            list supported OBD-II PIDs
  scan [--range 0x10-0x7f]  find modules that answer (UDS, ENET/DoIP)

adapter specs
  sim                       built-in simulated car (default)
  elm:HOST[:PORT]           WiFi ELM327 adapter (default 192.168.0.10:35000)
  enet:HOST[:PORT]          BMW ENET cable, HSFZ (default port 6801)
  doip:HOST[:PORT]          ISO 13400 DoIP (default port 13400)
`;

interface Args {
  cmd: string;
  adapter: string;
  target?: number;
  json: boolean;
  yes: boolean;
  count: number;
  range: [number, number];
}

function parseArgs(argv: string[]): Args {
  const a: Args = { cmd: "", adapter: "sim", json: false, yes: false, count: 5, range: [0x10, 0x7f] };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i] as string;
    const val = () => argv[++i] ?? "";
    if (t === "--adapter") a.adapter = val();
    else if (t === "--target") a.target = Number(val());
    else if (t === "--json") a.json = true;
    else if (t === "--yes") a.yes = true;
    else if (t === "--count") a.count = Number(val());
    else if (t === "--range") {
      const [lo, hi] = val().split("-").map(Number);
      a.range = [lo ?? 0x10, hi ?? 0x7f];
    } else if (!a.cmd) a.cmd = t;
  }
  return a;
}

async function makeTransport(spec: string): Promise<{ t: DiagTransport; kind: "obd" | "uds"; target: number }> {
  const [kind, host, port] = spec.split(":");
  const p = (d: number) => (port ? Number(port) : d);
  if (kind === "sim") return { t: new SimTransport(), kind: "obd", target: 0x7e0 };
  if (kind === "elm") {
    const stream = await connectTcpStream(host || "192.168.0.10", p(35000));
    return { t: new Elm327Transport(stream), kind: "obd", target: 0x7e0 };
  }
  if (kind === "enet") return { t: new HsfzTransport({ host: host ?? "", port: p(6801) }), kind: "uds", target: 0x12 };
  if (kind === "doip") return { t: new DoipTransport({ host: host ?? "", port: p(13400) }), kind: "uds", target: 0x1000 };
  throw new Error(`unknown adapter "${spec}"`);
}

function out(args: Args, data: unknown, text: string): void {
  console.log(args.json ? JSON.stringify(data, null, 2) : text);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (!args.cmd || args.cmd === "help") return void console.log(HELP);

  const { t, kind, target: defaultTarget } = await makeTransport(args.adapter);
  const target = args.target ?? defaultTarget;
  await t.open();
  const c = new DiagClient(t);
  try {
    switch (args.cmd) {
      case "vin": {
        const vin = kind === "obd" ? await c.readVinObd(target) : await c.readVinUds(target);
        out(args, { vin }, `VIN: ${vin}`);
        break;
      }
      case "dtc": {
        if (kind === "obd") {
          const r = await c.readObdDtcs(target);
          out(args, r, `stored: ${r.stored.join(" ") || "none"}\npending: ${r.pending.join(" ") || "none"}\npermanent: ${r.permanent.join(" ") || "none"}`);
        } else {
          const r = await c.readUdsDtcs(target);
          out(args, r, r.length ? r.map((d) => `${d.raw}  (${d.code})  ${d.flags?.join(", ")}`).join("\n") : "no faults");
        }
        break;
      }
      case "clear": {
        if (!args.yes) throw new Error("clearing faults also erases freeze frame data and resets readiness; re-run with --yes");
        if (kind === "obd") await c.clearObdDtcs(target);
        else await c.clearUdsDtcs(target);
        console.log("cleared");
        break;
      }
      case "live": {
        for (let i = 0; i < args.count; i++) {
          const row: Record<string, number | string> = {};
          for (const pid of [0x0c, 0x0d, 0x05, 0x04, 0x42]) {
            try {
              const v = await c.readPid(pid, target);
              if (v) row[v.name] = `${v.value} ${v.unit}`;
            } catch {
              /* PID not supported on this ECU */
            }
          }
          out(args, row, Object.entries(row).map(([k, v]) => `${k}: ${v}`).join("  |  "));
        }
        break;
      }
      case "pids": {
        const p = await c.supportedPids(target);
        out(args, p, p.map((x) => "0x" + x.toString(16).padStart(2, "0")).join(" "));
        break;
      }
      case "scan": {
        const list = [];
        for (let a = args.range[0]; a <= args.range[1]; a++) list.push(a);
        const alive = await c.scanUds(list);
        out(args, alive, alive.map((x) => "0x" + x.toString(16).padStart(2, "0")).join(" ") || "no modules answered");
        break;
      }
      default:
        console.log(HELP);
    }
  } finally {
    await t.close();
  }
}

main().catch((e: unknown) => {
  console.error(`error: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
