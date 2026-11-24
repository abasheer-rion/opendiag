import { randomBytes } from "node:crypto";
import { appendFileSync, chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve, sep } from "node:path";
import {
  BackupError,
  ClearingClient,
  DiagClient,
  NegativeResponse,
  TOOL_VERSION,
  TimeoutError,
  anonymiseTrace,
  createBackup,
  readOnly,
  readOnlyExcept,
  scrubText,
  traceTransport,
  vinFingerprint,
} from "../../core/src/index.ts";
import type { DiagTransport, UdsDtc } from "../../core/src/index.ts";

/** Refusals that happen before anything is sent to the car. */
export class SessionRefused extends Error {
  readonly reasons: string[];
  constructor(reasons: string[]) {
    super(reasons.join("; "));
    this.name = "SessionRefused";
    this.reasons = reasons;
  }
}

class Stop extends Error {}

export const MIN_CLEAR_VOLTS = 12.4;
const PROBE_FIRST = 0xf180;
const PROBE_LAST = 0xf19f;
const MAX_PROBED_MODULES = 5;
/** Answers that only mean "this module does not offer that" or "locked". Anything else stops the session. */
const EXPECTED_NRC = new Set([0x11, 0x12, 0x31, 0x33, 0x7e, 0x7f]);

export interface ClearFlags {
  /** Every --clear-target value given, as typed. */
  targets: string[];
  batteryVolts?: string | undefined;
  yes: boolean;
}

export interface SessionOptions {
  /** The raw transport. The session wraps it in the read-only guard itself. */
  transport: DiagTransport;
  /** Short adapter label for the output files, never an address (for example "enet"). */
  adapter: string;
  outDir: string;
  target?: number;
  range?: [number, number];
  idleSeconds?: number;
  backup?: boolean;
  clear?: ClearFlags | undefined;
  /** Returns the line the owner typed for the clear confirmation. */
  confirm?: () => Promise<string>;
  /** Words (host names, addresses) that must never appear in the output files or the shareable trace. */
  redact?: string[];
  /** Timeout for scan pings and probe reads. */
  quickTimeoutMs?: number;
  log?: (line: string) => void;
  sleep?: (ms: number) => Promise<void>;
  clock?: () => number;
}

interface StepRecord {
  name: string;
  ms: number;
  requests: number;
  ok: boolean;
  error?: string;
}

export interface SessionResult {
  schema_version: 1;
  tool_version: string;
  adapter: string;
  vin_hash: string | null;
  vin_stable: boolean | null;
  steps: StepRecord[];
  modules: number[];
  modules_stable: boolean | null;
  /** Per scan pass: total ms and [address, ms, answered] for every address tried. */
  scans: { name: string; ms: number; timings: [number, number, boolean][] }[];
  dids: { module: number; ok: boolean; length?: number; matches_vin?: boolean; ms: number; error?: string }[];
  probes: { module: number; ms: number; readable: { did: string; length: number }[]; timeouts: number; refused: number }[];
  idle_seconds: number;
  backups: { module: number; file?: string; dids?: string[]; sha256?: string; verified?: boolean; error?: string }[];
  clear: null | { target: number; done: boolean; refused?: string[]; before?: number; after?: number; error?: string };
  counts: { requests: number; modules: number; errors: number };
  errors: { step: string; text: string }[];
  stopped: null | { step: string; reason: string };
  notes: string[];
}

const hex2 = (n: number): string => "0x" + n.toString(16).padStart(2, "0");

/** Check the clear flags alone. Returns the target and a list of what is wrong. */
export function checkClearFlags(c: ClearFlags): { target?: number; reasons: string[] } {
  const reasons: string[] = [];
  let target: number | undefined;
  if (c.targets.length === 0) reasons.push("--clear-target is required (one module, for example 0x12)");
  else if (c.targets.length > 1) reasons.push("exactly one --clear-target is allowed");
  else {
    const raw = c.targets[0] ?? "";
    if (!/^(0x[0-9a-f]{1,2}|[0-9]{1,3})$/i.test(raw)) reasons.push(`--clear-target must be one module address, not "${raw}" (no ranges, lists or "all")`);
    else {
      const n = Number(raw);
      if (n < 0x01 || n >= 0xf0 || n === 0xdf) reasons.push(`--clear-target ${raw} is not a single module address`);
      else target = n;
    }
  }
  if (c.batteryVolts === undefined) reasons.push("--battery-volts N is required (measure the battery first)");
  else if (!/^[0-9]{1,2}(\.[0-9]+)?$/.test(c.batteryVolts)) reasons.push(`--battery-volts "${c.batteryVolts}" is not a number`);
  else {
    const v = Number(c.batteryVolts);
    if (v < MIN_CLEAR_VOLTS) reasons.push(`battery ${v} V is below ${MIN_CLEAR_VOLTS} V`);
    else if (v > 16) reasons.push(`battery ${v} V is not a plausible reading`);
  }
  if (!c.yes) reasons.push("--yes-clear is required");
  return target === undefined ? { reasons } : { target, reasons };
}

function nearestRealPath(p: string): string {
  const parts: string[] = [];
  let cur = p;
  while (!existsSync(cur)) {
    parts.unshift(basename(cur));
    cur = dirname(cur);
  }
  return join(realpathSync(cur), ...parts);
}

function insideGitRepo(p: string): boolean {
  let cur = p;
  for (;;) {
    if (existsSync(join(cur, ".git"))) return true;
    const up = dirname(cur);
    if (up === cur) return false;
    cur = up;
  }
}

/** Create the output folder with mode 0700. Refuses a path inside any git repository or a non-empty folder. */
export function prepareOutDir(dir: string): string {
  if (!dir) throw new SessionRefused(["--out DIR is required (a private folder outside the repo)"]);
  const abs = resolve(dir);
  const real = nearestRealPath(abs);
  if (insideGitRepo(real) || real.split(sep).includes(".git")) {
    throw new SessionRefused(["output folder is inside a git repository; use a private folder outside the repo"]);
  }
  if (existsSync(abs)) {
    if (!statSync(abs).isDirectory()) throw new SessionRefused(["output path exists and is not a folder"]);
    if (readdirSync(abs).length > 0) throw new SessionRefused(["output folder is not empty; use a new folder"]);
  }
  mkdirSync(abs, { recursive: true, mode: 0o700 });
  chmodSync(abs, 0o700);
  return abs;
}

/**
 * The capture session. Everything goes through the read-only guard except the single optional
 * clear, which is gated and sent through readOnlyExcept for that one call.
 */
export async function runSession(opts: SessionOptions): Promise<SessionResult> {
  const log = opts.log ?? (() => {});
  const clock = opts.clock ?? (() => performance.now());
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const target = opts.target ?? 0x12;
  const [lo, hi] = opts.range ?? [0x10, 0x7f];
  const quick = opts.quickTimeoutMs ?? 300;
  const idleSeconds = opts.idleSeconds ?? 0;

  // 1. Refuse bad clear flags before anything else happens.
  let clearTarget: number | undefined;
  if (opts.clear && (opts.clear.targets.length > 0 || opts.clear.batteryVolts !== undefined || opts.clear.yes)) {
    const chk = checkClearFlags(opts.clear);
    if (chk.reasons.length > 0) throw new SessionRefused(chk.reasons);
    clearTarget = chk.target;
  }
  if (!Number.isInteger(target) || target < 0 || target > 0xffff) throw new SessionRefused([`--target ${target} is not a module address`]);
  if (!Number.isFinite(idleSeconds) || idleSeconds < 0 || idleSeconds > 3600) throw new SessionRefused(["--idle must be 0 to 3600 seconds"]);

  // 2. Private output folder.
  const out = prepareOutDir(opts.outDir);
  const redact = opts.redact ?? [];
  const salt = randomBytes(16).toString("hex");
  const file = (name: string) => join(out, name);
  writeFileSync(file("salt.private"), salt + "\n", { mode: 0o600 });
  const tracePath = file("session.odtrace");
  writeFileSync(tracePath, "", { mode: 0o600 });

  const traced = traceTransport(opts.transport, (line) => appendFileSync(tracePath, line + "\n"), clock);
  const client = new DiagClient(readOnly(traced));

  const r: SessionResult = {
    schema_version: 1,
    tool_version: TOOL_VERSION,
    adapter: opts.adapter,
    vin_hash: null,
    vin_stable: null,
    steps: [],
    modules: [],
    modules_stable: null,
    scans: [],
    dids: [],
    probes: [],
    idle_seconds: idleSeconds,
    backups: [],
    clear: null,
    counts: { requests: 0, modules: 0, errors: 0 },
    errors: [],
    stopped: null,
    notes: [],
  };

  const clean = (e: unknown): string => scrubText(e instanceof Error ? e.message : String(e), salt, redact);
  const noteError = (step: string, e: unknown) => r.errors.push({ step, text: clean(e) });

  /** Decide what an error means: return to carry on, or throw Stop. */
  const judge = (step: string, e: unknown, timeoutIsFatal: boolean): void => {
    noteError(step, e);
    if (e instanceof TimeoutError) {
      if (timeoutIsFatal) throw new Stop(`${step}: no answer (${clean(e)})`);
      return;
    }
    if (e instanceof NegativeResponse && EXPECTED_NRC.has(e.nrc)) return;
    if (e instanceof NegativeResponse) throw new Stop(`${step}: unexpected negative response 0x${e.nrc.toString(16)} (${clean(e)})`);
    throw new Stop(`${step}: ${clean(e)}`);
  };

  const step = async <T>(name: string, fn: () => Promise<T>, timeoutIsFatal = false): Promise<T | undefined> => {
    const t0 = clock();
    const n0 = traced.count;
    const rec: StepRecord = { name, ms: 0, requests: 0, ok: true };
    r.steps.push(rec);
    try {
      const v = await fn();
      return v;
    } catch (e) {
      rec.ok = false;
      rec.error = clean(e);
      if (e instanceof Stop) throw e;
      judge(name, e, timeoutIsFatal);
      return undefined;
    } finally {
      rec.ms = Math.round(clock() - t0);
      rec.requests = traced.count - n0;
      log(`${name}: ${rec.ok ? "ok" : "failed"} (${rec.ms} ms, ${rec.requests} requests)`);
    }
  };

  const dtcPath = file("dtc.json");
  const dtcSaved: Record<string, UdsDtc[]> = {};
  const saveDtc = (module: number, dtcs: UdsDtc[]) => {
    dtcSaved[hex2(module)] = dtcs;
    writeFileSync(dtcPath, JSON.stringify(dtcSaved, null, 2), { mode: 0o600 });
  };

  let vin: string | undefined;
  const readVin = async (name: string): Promise<void> => {
    const v = await step(name, () => client.readVinUds(target), true);
    if (v === undefined) return;
    if (vin === undefined) {
      vin = v;
      r.vin_hash = vinFingerprint(v, salt);
    } else r.vin_stable = (r.vin_stable ?? true) && v === vin;
  };

  const scanPass = async (name: string): Promise<number[] | undefined> => {
    const pass: SessionResult["scans"][number] = { name, ms: 0, timings: [] };
    r.scans.push(pass);
    const alive: number[] = [];
    const t0 = clock();
    const res = await step(name, async () => {
      for (let a = lo; a <= hi; a++) {
        const a0 = clock();
        const got = (await client.scanUds([a], quick)).length > 0;
        pass.timings.push([a, Math.round(clock() - a0), got]);
        if (got) alive.push(a);
      }
      return alive;
    });
    pass.ms = Math.round(clock() - t0);
    return res;
  };

  let lastScan: number[] | undefined;
  const probeable = (): number[] => [...r.modules].sort((a, b) => Number(b === target) - Number(a === target) || a - b).slice(0, MAX_PROBED_MODULES);
  const readable = new Map<number, { did: number; length: number }[]>();

  try {
    log(`adapter: ${opts.adapter}, output folder is private (mode 700)`);
    try {
      await opts.transport.open();
    } catch (e) {
      r.steps.push({ name: "open", ms: 0, requests: 0, ok: false, error: clean(e) });
      noteError("open", e);
      throw new Stop(`could not connect: ${clean(e)}`);
    }

    await readVin("vin");

    await step("dtc", async () => {
      saveDtc(target, await client.readUdsDtcs(target));
    }, true);
    if (clearTarget !== undefined && clearTarget !== target) {
      await step("dtc_clear_target", async () => {
        saveDtc(clearTarget as number, await client.readUdsDtcs(clearTarget as number));
      });
    }

    await step("pids", () => client.supportedPids(target));

    const first = await scanPass("scan");
    if (first) {
      lastScan = first;
      r.modules = first;
      log(`modules answered: ${first.map(hex2).join(" ") || "none"}`);
    }

    for (const m of r.modules) {
      const t0 = clock();
      const entry: SessionResult["dids"][number] = { module: m, ok: false, ms: 0 };
      r.dids.push(entry);
      await step(`did_f190_${hex2(m)}`, async () => {
        const d = await client.readDataByIdentifier(m, 0xf190);
        entry.ok = true;
        entry.length = d.length;
        if (vin !== undefined) entry.matches_vin = Buffer.from(d).toString("ascii") === vin;
      });
      entry.ms = Math.round(clock() - t0);
      if (!entry.ok) entry.error = r.errors[r.errors.length - 1]?.text ?? "failed";
    }

    for (const m of probeable()) {
      const entry: SessionResult["probes"][number] = { module: m, ms: 0, readable: [], timeouts: 0, refused: 0 };
      r.probes.push(entry);
      const found: { did: number; length: number }[] = [];
      readable.set(m, found);
      const t0 = clock();
      await step(`probe_${hex2(m)}`, async () => {
        for (let did = PROBE_FIRST; did <= PROBE_LAST; did++) {
          try {
            const d = await client.readDataByIdentifier(m, did, quick);
            found.push({ did, length: d.length });
            entry.readable.push({ did: "0x" + did.toString(16), length: d.length });
          } catch (e) {
            if (e instanceof TimeoutError) entry.timeouts++;
            else if (e instanceof NegativeResponse && EXPECTED_NRC.has(e.nrc)) entry.refused++;
            else throw e;
          }
        }
      });
      entry.ms = Math.round(clock() - t0);
    }

    await readVin("vin_2");
    const second = await scanPass("scan_2");
    if (second) lastScan = second;
    if (second) r.modules_stable = second.length === r.modules.length && second.every((a, i) => a === r.modules[i]);

    if (idleSeconds > 0) {
      await step("idle", async () => {
        log(`idle for ${idleSeconds} s, sending nothing`);
        await sleep(idleSeconds * 1000);
      });
    }
    await readVin("vin_after_idle");

    if (opts.backup) await runBackups();
    if (opts.clear && clearTarget !== undefined) await runClear(clearTarget);
  } catch (e) {
    if (e instanceof Stop) {
      r.stopped = { step: r.steps[r.steps.length - 1]?.name ?? "start", reason: e.message };
    } else {
      r.stopped = { step: "internal", reason: clean(e) };
    }
    log(`STOPPED: ${r.stopped.reason}`);
  } finally {
    r.counts = { requests: traced.count, modules: r.modules.length, errors: r.errors.length };
    writeFileSync(file("session.json"), JSON.stringify(r, null, 2), { mode: 0o600 });
    try {
      const anon = anonymiseTrace(readFileSync(tracePath, "utf8"), salt, redact);
      writeFileSync(file("session.shareable.odtrace"), anon, { mode: 0o600 });
    } catch (e) {
      log(`could not write shareable trace: ${clean(e)}`);
    }
    try {
      await opts.transport.close();
    } catch {
      /* already closed */
    }
  }
  return r;

  async function runBackups(): Promise<void> {
    mkdirSync(file("backups"), { recursive: true, mode: 0o700 });
    r.notes.push("Real coding block identifiers are not known yet, so the backup saves identification data only (the readable F180-F19F identifiers).");
    log("backup: real coding block identifiers are unknown, so this saves identification data only");
    for (const m of probeable()) {
      const found = readable.get(m) ?? [];
      if (found.length === 0) {
        r.backups.push({ module: m, error: "no readable identifiers" });
        continue;
      }
      const entry: SessionResult["backups"][number] = { module: m };
      r.backups.push(entry);
      await step(`backup_${hex2(m)}`, async () => {
        try {
          const b = await createBackup(client, { target: m, blocks: found.map((f) => ({ did: f.did, length: f.length })), adapterName: opts.adapter });
          const dir = join(file("backups"), hex2(m));
          mkdirSync(dir, { recursive: true, mode: 0o700 });
          const name = `${b.created_utc.replace(/[:.]/g, "-")}-${b.txn_id.slice(0, 8)}.json`;
          writeFileSync(join(dir, name), JSON.stringify(b, null, 2), { flag: "wx", mode: 0o400 });
          entry.file = `backups/${hex2(m)}/${name}`;
          entry.dids = b.dids.map((d) => "0x" + d.did.toString(16));
          entry.sha256 = b.sha256;
          entry.verified = b.verified;
        } catch (e) {
          if (!(e instanceof BackupError)) throw e;
          entry.error = clean(e);
          noteError(`backup_${hex2(m)}`, e);
        }
      });
    }
  }

  async function runClear(tgt: number): Promise<void> {
    const reasons: string[] = [];
    if (!r.modules.includes(tgt) || !lastScan?.includes(tgt)) reasons.push(`module ${hex2(tgt)} did not answer every scan`);
    if (r.vin_stable === false) reasons.push("the VIN changed during the session, so this may not be the car whose faults were saved");
    let before: unknown[] = [];
    try {
      const saved = JSON.parse(readFileSync(dtcPath, "utf8")) as Record<string, unknown>;
      const e = saved[hex2(tgt)];
      if (Array.isArray(e) && e.length > 0) before = e;
      else reasons.push(`dtc.json has no saved faults for ${hex2(tgt)}, so there is nothing to clear`);
    } catch {
      reasons.push("dtc.json is missing or unreadable");
    }
    if (reasons.length === 0) {
      log(`About to clear ${before.length} stored fault(s) on module ${hex2(tgt)} (saved in dtc.json).`);
      log("This is the one write of the sprint. Type CLEAR (capitals) and press Enter to go ahead; anything else cancels:");
      const typed = opts.confirm ? (await opts.confirm()).trim() : "";
      if (typed !== "CLEAR") reasons.push(opts.confirm ? "the word CLEAR was not typed" : "no way to read the typed confirmation");
    }
    if (reasons.length > 0) {
      r.clear = { target: tgt, done: false, refused: reasons };
      for (const why of reasons) log(`clear refused: ${why}. Nothing was sent.`);
      return;
    }
    const entry: NonNullable<SessionResult["clear"]> = { target: tgt, done: false, before: before.length };
    r.clear = entry;
    const clearer = new ClearingClient(readOnlyExcept(traced, [0x14]));
    let after: UdsDtc[] | undefined;
    try {
      await step("clear", () => clearer.clearUdsDtcs(tgt));
      const last = r.steps[r.steps.length - 1];
      entry.done = last?.name === "clear" && last.ok;
      if (!entry.done) entry.error = last?.error ?? "failed";
      await step("dtc_after_clear", async () => {
        after = await client.readUdsDtcs(tgt);
      });
    } catch (e) {
      entry.error ??= clean(e);
      throw e;
    } finally {
      if (after) entry.after = (after as UdsDtc[]).length;
      writeFileSync(file("clear.json"), JSON.stringify({ target: hex2(tgt), done: entry.done, before, after: after ?? null, error: entry.error ?? null }, null, 2), { mode: 0o600 });
    }
  }
}
