import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import {
  DEMO_PACK,
  ClearingClient,
  DoipTransport,
  Elm327Transport,
  HsfzTransport,
  SimTransport,
  assertBackupShape,
  blockBytes,
  connectTcpStream,
  createBackup,
  decodeOption,
  demoVehicle,
  diffBackups,
  parsePack,
  readOnly,
  suggestField,
  verifyBackupHash,
} from "../../core/src/index.ts";
import type { BlockSpec, DiagTransport, Pack } from "../../core/src/index.ts";
import { SessionRefused, runSession } from "./session.ts";

const HELP = `opendiag - open-source vehicle diagnostics

usage: opendiag <command> [--adapter <spec>] [--target <addr>] [--json]

commands
  vin             read the VIN
  dtc             read fault codes
  clear --yes     clear fault codes (erases freeze frame data too)
  live [--count N] live engine data (OBD-II PIDs)
  pids            list supported OBD-II PIDs
  scan [--range 0x10-0x7f]  find modules that answer (UDS, ENET/DoIP)

capture session (one command for the research sprint, see docs/research/sprint/session-runbook.md)
  session --adapter enet:HOST --out DIR [--idle SECONDS] [--backup]
          [--clear-target 0xNN --battery-volts N --yes-clear]
                                     reads only: vin, faults, pids, module scan with timing,
                                     identifiers, a second timing sample, an idle gap, and a
                                     trace. DIR must be new and outside the git repo (mode 700).
                                     --backup saves identification data for up to 5 modules.
                                     The optional clear runs once, last, on ONE module, only if
                                     the battery is 12.4 V or more, its faults are saved first,
                                     and you type CLEAR when asked.

read-only coding tools (never write to the car)
  did --target A --did 0xF190        read one data identifier
  probe --target A [--range 0xF180-0xF19F]   list readable data identifiers
  backup --target A (--did 0x3000[:LEN] ... | --pack FILE|demo) [--out DIR]
                                     save a verified, hashed copy of coding data
  inspect BACKUP.json --pack FILE|demo    show option values and checksum status
  diff A.json B.json [--suggest] [--ignore 62,63]
                                     show what changed between two backups
                                     (toggle ONE setting in the car's own menu between
                                     backups, then --suggest proposes the pack entry)

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
  rangeSet: boolean;
  files: string[];
  dids: string[];
  did?: number;
  pack?: string;
  out?: string;
  suggest: boolean;
  ignore: number[];
  idle: number;
  backup: boolean;
  clearTargets: string[];
  batteryVolts?: string;
  yesClear: boolean;
}

function parseArgs(argv: string[]): Args {
  const a: Args = {
    cmd: "", adapter: "sim", json: false, yes: false, count: 5, range: [0x10, 0x7f],
    rangeSet: false, files: [], dids: [], suggest: false, ignore: [],
    idle: 0, backup: false, clearTargets: [], yesClear: false,
  };
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
      a.rangeSet = true;
    } else if (t === "--did") {
      const v = val();
      a.dids.push(v);
      a.did = Number(v.split(":")[0]);
    } else if (t === "--pack") a.pack = val();
    else if (t === "--out") a.out = val();
    else if (t === "--idle") a.idle = Number(val());
    else if (t === "--backup") a.backup = true;
    else if (t === "--clear-target") a.clearTargets.push(val());
    else if (t === "--battery-volts") a.batteryVolts = val();
    else if (t === "--yes-clear") a.yesClear = true;
    else if (t === "--suggest") a.suggest = true;
    else if (t === "--ignore") a.ignore = val().split(",").map(Number);
    else if (!a.cmd) a.cmd = t;
    else a.files.push(t);
  }
  return a;
}

async function makeTransport(spec: string): Promise<{ t: DiagTransport; kind: "obd" | "uds"; target: number }> {
  const [kind, host, port] = spec.split(":");
  const p = (d: number) => (port ? Number(port) : d);
  if (kind === "sim") {
    // sim or sim:ambient=2,welcome=1 (lets you try backup/diff by "changing a setting")
    const o = Object.fromEntries((host ?? "").split(",").filter(Boolean).map((kv) => kv.split("=")));
    const v = demoVehicle({ ambient: Number(o.ambient ?? 1), welcome: Number(o.welcome ?? 0) });
    return { t: new SimTransport(v), kind: "obd", target: 0x12 };
  }
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

async function loadPack(spec: string): Promise<Pack> {
  if (spec === "demo") return DEMO_PACK;
  return parsePack(JSON.parse(await readFile(spec, "utf8")));
}

async function loadBackup(path: string | undefined) {
  if (!path) throw new Error("backup file required");
  const b = assertBackupShape(JSON.parse(await readFile(path, "utf8")));
  if (!(await verifyBackupHash(b))) throw new Error(`${path}: check code does not match contents (file was edited or damaged)`);
  return b;
}

async function inspect(args: Args): Promise<void> {
  const b = await loadBackup(args.files[0]);
  if (!args.pack) throw new Error("--pack FILE|demo required");
  const pack = await loadPack(args.pack);
  if (pack.simulator_only) console.log("note: this pack is simulator-only; its offsets mean nothing on a real car\n");
  const rows = [];
  for (const o of pack.coding) {
    const block = blockBytes(b, o.block.did);
    if (!block) continue;
    rows.push(decodeOption(o, block));
  }
  out(args, rows, rows.map((r) => `${r.label}: ${r.value ?? "raw " + r.raw}${r.isDefault === false ? " (changed from default)" : ""}${r.integrity ? (r.integrity.ok ? "  [checksum ok]" : "  [CHECKSUM MISMATCH]") : ""}`).join("\n") || "no options in this pack match the backup");
}

async function diff(args: Args): Promise<void> {
  const [a, b] = await Promise.all([loadBackup(args.files[0]), loadBackup(args.files[1])]);
  const res = diffBackups(a, b);
  const lines: string[] = [];
  for (const d of res) {
    const id = "0x" + d.did.toString(16);
    if (d.status === "same") lines.push(`${id}: identical`);
    else if (d.status !== "changed") lines.push(`${id}: ${d.status}`);
    else {
      lines.push(`${id}: ${d.changes.length} byte(s) changed`);
      for (const c of d.changes) lines.push(`  byte ${c.offset}: ${c.before.toString(16).padStart(2, "0")} -> ${c.after.toString(16).padStart(2, "0")}  bits ${c.bits.join(",")}`);
      if (args.suggest) {
        const f = suggestField(d.changes, args.ignore);
        lines.push(f ? `  suggested field: byte_offset ${f.byte_offset}, bit_offset ${f.bit_offset}, bit_length ${f.bit_length}` : "  no single-byte field to suggest (several bytes changed; pass --ignore for checksum bytes)");
      }
    }
  }
  out(args, res, lines.join("\n"));
}

function typedLine(): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise<string>((resolve) => {
    rl.once("close", () => resolve(""));
    rl.question("> ", (a) => {
      resolve(a);
      rl.close();
    });
  });
}

async function sessionCmd(args: Args): Promise<void> {
  const kind = args.adapter.split(":")[0] ?? "";
  if (kind !== "enet" && kind !== "sim") throw new Error("session needs --adapter enet:HOST (sim works for practice)");
  const host = args.adapter.split(":")[1] ?? "";
  if (kind === "enet" && !host) throw new Error("session needs --adapter enet:HOST");
  const { t, target } = await makeTransport(args.adapter);
  const wantsClear = args.clearTargets.length > 0 || args.batteryVolts !== undefined || args.yesClear;
  try {
    const r = await runSession({
      transport: t,
      adapter: kind,
      redact: [host],
      outDir: args.out ?? "",
      target: args.target ?? target,
      idleSeconds: args.idle,
      backup: args.backup,
      ...(wantsClear ? { clear: { targets: args.clearTargets, batteryVolts: args.batteryVolts, yes: args.yesClear } } : {}),
      confirm: typedLine,
      log: (l) => console.log(l),
    });
    console.log(`done: ${r.counts.requests} requests, ${r.counts.modules} modules, ${r.counts.errors} errors. Files are in ${args.out}`);
    if (r.stopped) process.exitCode = 1;
    else if (r.clear && !r.clear.done) process.exitCode = 2;
  } catch (e) {
    if (!(e instanceof SessionRefused)) throw e;
    console.error("refused, nothing was sent to the car:");
    for (const why of e.reasons) console.error(`  - ${why}`);
    process.exitCode = 2;
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (!args.cmd || args.cmd === "help") return void console.log(HELP);
  if (args.cmd === "inspect") return void (await inspect(args));
  if (args.cmd === "diff") return void (await diff(args));
  if (args.cmd === "session") return void (await sessionCmd(args));

  const { t: rawT, kind, target: defaultTarget } = await makeTransport(args.adapter);
  const READ_ONLY_CMDS = ["did", "probe", "backup"];
  const t = READ_ONLY_CMDS.includes(args.cmd) ? readOnly(rawT) : rawT;
  const target = args.target ?? defaultTarget;
  await t.open();
  const c = new ClearingClient(t);
  try {
    switch (args.cmd) {
      case "did": {
        if (args.did === undefined) throw new Error("--did required");
        const d = await c.readDataByIdentifier(target, args.did);
        const text = d.every((x) => x >= 0x20 && x < 0x7f) ? ` "${Buffer.from(d).toString("ascii")}"` : "";
        out(args, { did: args.did, hex: Buffer.from(d).toString("hex"), length: d.length }, `0x${args.did.toString(16)} [${d.length}] ${Buffer.from(d).toString("hex")}${text}`);
        break;
      }
      case "probe": {
        const [lo, hi] = args.rangeSet ? args.range : [0xf180, 0xf19f];
        const found: { did: string; length: number }[] = [];
        for (let did = lo; did <= hi; did++) {
          try {
            const d = await c.readDataByIdentifier(target, did, 300);
            found.push({ did: "0x" + did.toString(16), length: d.length });
          } catch {
            /* not readable */
          }
        }
        out(args, found, found.map((f) => `${f.did} (${f.length} bytes)`).join("\n") || "no readable data identifiers in range");
        break;
      }
      case "backup": {
        const pack = args.pack ? await loadPack(args.pack) : undefined;
        const blocks = new Map<number, BlockSpec>();
        for (const o of pack?.coding ?? []) blocks.set(o.block.did, { did: o.block.did, length: o.block.length });
        for (const s of args.dids) {
          const [d, l] = s.split(":");
          const spec: BlockSpec = { did: Number(d) };
          if (l) spec.length = Number(l);
          blocks.set(spec.did, spec);
        }
        if (!blocks.size) throw new Error("nothing to back up: give --did 0x3000[:LEN] or --pack FILE");
        const b = await createBackup(c, { target, blocks: [...blocks.values()], ...(pack ? { pack: pack.pack_id } : {}) });
        const dir = join(args.out ?? join(homedir(), ".opendiag", "shadow"), b.vin ?? "unknown-vin", "0x" + target.toString(16));
        await mkdir(dir, { recursive: true });
        const first = (await readdir(dir)).length === 0;
        const file = join(dir, `${b.created_utc.replace(/[:.]/g, "-")}-${b.txn_id.slice(0, 8)}.json`);
        await writeFile(file, JSON.stringify({ ...b, first_seen: first }, null, 2), { flag: "wx", mode: 0o444 });
        out(args, { file, ...b }, `saved ${file}\nVIN ${b.vin ?? "unknown"}  blocks ${b.dids.length}  check ${b.sha256.slice(0, 12)}  verified by second read${first ? "  (first backup of this module)" : ""}`);
        break;
      }
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
