import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  DEMO_PACK,
  exportSanitised,
  findEntry,
  lintPack,
  listBackups,
  namespaceOf,
  packFromDiff,
  parsePack,
  readBackup,
  restorePlan,
  verifyStore,
} from "../../core/src/index.ts";
import type { DidDiff, IndexEntry, Namespace, Pack } from "../../core/src/index.ts";

/** What these commands need from the command line. Kept small so they can be tested without a car. */
export interface StoreArgs {
  sub: string;
  rest: string[];
  json: boolean;
  store?: string;
  out?: string;
  pack?: string;
  current?: string;
  includeSerials: boolean;
  shareAlike: boolean;
  fromDiff?: string;
  did?: number;
  ignore: number[];
}

export const defaultStore = (): string => join(homedir(), ".opendiag", "backups");

const hex = (n: number) => "0x" + n.toString(16);

function emit(a: StoreArgs, data: unknown, text: string): void {
  console.log(a.json ? JSON.stringify(data, null, 2) : text);
}

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    throw new Error(`cannot read ${path} as JSON: ${(e as Error).message}`);
  }
}

function loadPackFile(spec: string): Pack {
  return spec === "demo" ? DEMO_PACK : parsePack(readJson(spec));
}

const line = (e: IndexEntry) => `${e.id.slice(0, 8)}  ${e.created_utc}  module ${hex(e.module)}  car ${e.vehicle}  ${e.blocks} block(s)${e.first_seen ? "  first" : ""}`;

export async function backupsCommand(a: StoreArgs): Promise<void> {
  const root = a.store ?? defaultStore();
  const id = a.rest[0];
  switch (a.sub) {
    case "list": {
      const l = listBackups(root);
      emit(a, l, l.map(line).join("\n") || `no backups in ${root}`);
      return;
    }
    case "verify": {
      const r = await verifyStore(root, id);
      const text = r.ok ? `ok: ${r.checked} backup(s) checked, nothing wrong found` : r.problems.map((p) => `PROBLEM ${p.file ?? ""} ${p.problem}`).join("\n");
      emit(a, r, text);
      if (!r.ok) process.exitCode = 1;
      return;
    }
    case "show": {
      if (!id) throw new Error("usage: backups show ID");
      const b = await readBackup(root, id);
      const text = [
        `id ${b.txn_id}`,
        `car VIN ${b.vin ?? "unknown"}   module ${hex(b.module_addr)}   saved ${b.created_utc}`,
        `confirmed by two identical reads: ${b.verified ? "yes" : "NO"}`,
        `check code ${b.sha256.slice(0, 16)}... matches`,
        ...b.dids.map((d) => `block ${hex(d.did)}  ${d.len} bytes`),
      ].join("\n");
      emit(a, b, text);
      return;
    }
    case "export": {
      if (!id || !a.out) throw new Error("usage: backups export ID --out FILE [--include-serials]");
      const b = await readBackup(root, id);
      const x = await exportSanitised(b, { includeSerials: a.includeSerials });
      try {
        writeFileSync(a.out, JSON.stringify(x, null, 2), { flag: "wx", mode: 0o600 });
      } catch {
        throw new Error(`cannot create ${a.out} (it must not exist yet)`);
      }
      emit(a, { file: a.out, vin_hashed: x.sanitised.vin_hashed, serials_removed: x.sanitised.serials_removed }, `wrote ${a.out}\nVIN replaced by a one-way hash${x.sanitised.serials_removed ? ", serial numbers removed" : ", serial numbers kept"}`);
      return;
    }
    case "restore-plan": {
      if (!id) throw new Error("usage: backups restore-plan ID [--current ID] [--pack FILE|demo]");
      const b = await readBackup(root, id);
      const current = a.current ? await readBackup(root, findEntry(listBackups(root), a.current).id) : undefined;
      const plan = restorePlan(b, { ...(a.pack ? { pack: loadPackFile(a.pack) } : {}), ...(current ? { current } : {}) });
      const text = [
        "DRY RUN. Nothing was sent to any car. OpenDiag cannot write coding.",
        `restore of ${plan.backup_id.slice(0, 8)} to module ${hex(plan.module)} would write:`,
        ...plan.steps.map((s) => `  ${s.order}. ${s.action === "skip_unchanged" ? "skip (already the same)" : "write"} block ${hex(s.did)} (${s.length} bytes)${s.changes ? `, ${s.changes.length} byte(s) differ` : ""}`),
        ...(plan.options?.length ? ["options in this backup:", ...plan.options.map((o) => `  ${o.label}: ${o.value}`)] : []),
        "before any real restore:",
        ...plan.preconditions.map((p) => `  - ${p}`),
        ...(plan.blocked.length ? ["BLOCKED:", ...plan.blocked.map((p) => `  - ${p}`)] : []),
      ].join("\n");
      emit(a, plan, text);
      if (plan.blocked.length) process.exitCode = 2;
      return;
    }
    default:
      throw new Error("usage: backups list | verify [ID] | show ID | export ID --out FILE | restore-plan ID");
  }
}

export async function packCommand(a: StoreArgs): Promise<void> {
  switch (a.sub) {
    case "lint": {
      const file = a.rest[0];
      if (!file) throw new Error("usage: pack lint FILE [--share-alike]");
      const ns: Namespace = a.shareAlike ? "share-alike" : namespaceOf(file);
      const r = lintPack(readJson(file), ns);
      emit(a, { file, namespace: ns, ...r }, r.ok ? `ok: ${file} passes lint (${ns} pack)` : [`FAILED: ${file} (${ns} pack)`, ...r.errors.map((e) => `  - ${e}`)].join("\n"));
      if (!r.ok) process.exitCode = 1;
      return;
    }
    case "init": {
      if (!a.fromDiff) throw new Error("usage: pack init --from-diff DIFF.json [--did 0x3000] [--ignore 62,63] [--out FILE]");
      const diffs = readJson(a.fromDiff) as DidDiff[];
      const p = packFromDiff(diffs, { ...(a.did !== undefined ? { did: a.did } : {}), ignore: a.ignore });
      const text = JSON.stringify(p, null, 2);
      if (a.out) {
        try {
          writeFileSync(a.out, text, { flag: "wx", mode: 0o600 });
        } catch {
          throw new Error(`cannot create ${a.out} (it must not exist yet)`);
        }
        console.log(`wrote ${a.out}. Every TODO_FILL_IN must be replaced before \`pack lint\` passes.`);
      } else console.log(text);
      return;
    }
    default:
      throw new Error("usage: pack lint FILE | pack init --from-diff DIFF.json");
  }
}
