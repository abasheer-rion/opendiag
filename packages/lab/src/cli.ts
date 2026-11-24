import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DiagClient, SimTransport, createBackup, readOnly, simTestKey, toHex } from "../../core/src/index.ts";
import type { DiagTransport } from "../../core/src/index.ts";
import { LabEngine } from "./engine.ts";
import { LabRefusal, RecoveryRequired } from "./errors.ts";
import { Journal } from "./journal.ts";
import { consentFor } from "./plan.ts";
import type { DiffPreview } from "./plan.ts";
import { LAB_MODULE, LAB_PACK, labVehicle } from "./sim-lab.ts";

export const BANNER =
  "opendiag-lab: BENCH TOOL. It writes to modules. It runs on the simulator, or on a bench adapter named in your allowlist file. Never use it on a car you drive.";

const HELP = `usage: opendiag-lab <command> [options]

commands
  preview --change ID=RAW ...        show what would change (reads only)
  apply   --change ID=RAW ... --journal FILE --consent-by NAME --yes
                                     back up, write, verify, roll back on any problem
  status  --journal FILE             list writes that never finished

options
  --adapter sim                      default; anything else must be in the allowlist
  --bench-allowlist FILE             one adapter spec per line (# for comments)
`;

/** Why this adapter may not be used, or undefined when it may. The simulator is always fine. */
export function adapterProblem(spec: string, allowlist: string | undefined): string | undefined {
  if (spec === "sim" || spec.startsWith("sim:")) return undefined;
  if (allowlist === undefined) return `adapter "${spec}" refused: this tool only runs on the simulator unless --bench-allowlist names the adapter`;
  const names = allowlist.split("\n").map((l) => l.replace(/#.*/, "").trim()).filter(Boolean);
  return names.includes(spec) ? undefined : `adapter "${spec}" refused: it is not in the bench allowlist`;
}

interface Args {
  cmd: string;
  adapter: string;
  allowlist?: string;
  journal?: string;
  changes: { id: string; raw: number }[];
  consentBy?: string;
  yes: boolean;
}

function parse(argv: string[]): Args {
  const a: Args = { cmd: "", adapter: "sim", changes: [], yes: false };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i] as string;
    const val = () => argv[++i] ?? "";
    if (t === "--adapter") a.adapter = val();
    else if (t === "--bench-allowlist") a.allowlist = val();
    else if (t === "--journal") a.journal = val();
    else if (t === "--consent-by") a.consentBy = val();
    else if (t === "--yes") a.yes = true;
    else if (t === "--change") {
      const [id, raw] = val().split("=");
      a.changes.push({ id: id ?? "", raw: Number(raw) });
    } else if (!a.cmd) a.cmd = t;
  }
  return a;
}

function show(p: DiffPreview): string {
  const lines = ["will change:"];
  for (const c of p.changes) lines.push(`  ${c.label} [${c.tier}]: ${c.before ?? c.beforeRaw} -> ${c.after ?? c.afterRaw}`);
  lines.push("bytes:");
  for (const b of p.bytes) lines.push(`  block 0x${b.did.toString(16)} +${b.offset} (${b.kind}): ${toHex(Uint8Array.of(b.before))} -> ${toHex(Uint8Array.of(b.after))}`);
  lines.push(`battery ${p.volts.toFixed(1)} V`);
  return lines.join("\n");
}

export interface Io {
  out(s: string): void;
  err(s: string): void;
}

/** Runs the command and returns the exit code. */
export async function run(argv: string[], io: Io): Promise<number> {
  io.err(BANNER);
  const a = parse(argv);
  if (!a.cmd || a.cmd === "help") {
    io.out(HELP);
    return a.cmd ? 0 : 1;
  }
  if (a.cmd === "status") {
    if (!a.journal) return fail(io, "status needs --journal FILE");
    const open = new Journal(a.journal).openTxns();
    io.out(open.length ? `unfinished writes: ${open.join(", ")}` : "no unfinished writes");
    return open.length ? 3 : 0;
  }
  if (a.cmd !== "preview" && a.cmd !== "apply") return fail(io, `unknown command "${a.cmd}"`);

  let list: string | undefined;
  if (a.allowlist) {
    if (!existsSync(a.allowlist)) return fail(io, `allowlist file ${a.allowlist} not found`);
    list = readFileSync(a.allowlist, "utf8");
  }
  const bad = adapterProblem(a.adapter, list);
  if (bad) return fail(io, bad);
  if (!a.adapter.startsWith("sim")) return fail(io, "bench adapters are allowed by the list but not wired up in this build");
  if (a.changes.length === 0) return fail(io, "give at least one --change ID=RAW");

  const transport: DiagTransport = new SimTransport(labVehicle());
  const journal = new Journal(a.journal ?? "/dev/null");
  if (a.cmd === "apply" && !a.journal) return fail(io, "apply needs --journal FILE");
  const engine = new LabEngine({ transport, pack: LAB_PACK, journal, config: { allowedModules: [LAB_MODULE], keyProvider: simTestKey } });
  try {
    const backup = await createBackup(new DiagClient(readOnly(transport)), {
      target: LAB_MODULE,
      blocks: [{ did: 0x3000, length: 64 }, { did: 0x3001, length: 16 }],
      pack: LAB_PACK.pack_id,
    });
    const req = { target: LAB_MODULE, backup, changes: a.changes };
    if (a.cmd === "preview") {
      io.out(show((await engine.plan(req)).preview));
      return 0;
    }
    const plan = await engine.plan(req);
    io.out(show(plan.preview));
    if (!a.yes || !a.consentBy) return fail(io, "not written: add --consent-by NAME and --yes to confirm this exact change");
    const out = await engine.apply(req, consentFor(plan.preview, a.consentBy));
    io.out(`${out.state}${out.reason ? ": " + out.reason : ""} (write ${out.txn})`);
    return out.state === "COMMITTED" ? 0 : 4;
  } catch (e) {
    if (e instanceof LabRefusal || e instanceof RecoveryRequired) return fail(io, e.message);
    throw e;
  }
}

function fail(io: Io, m: string): number {
  io.err(`error: ${m}`);
  return 2;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run(process.argv.slice(2), { out: (s) => console.log(s), err: (s) => console.error(s) }).then(
    (code) => process.exit(code),
    (e: unknown) => {
      console.error(`error: ${e instanceof Error ? e.message : String(e)}`);
      process.exit(1);
    },
  );
}
