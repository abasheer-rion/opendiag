import { createHash } from "node:crypto";
import { chmodSync, closeSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, renameSync, unlinkSync, writeSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { assertBackupShape, verifyBackupHash } from "./backup.ts";
import type { Backup } from "./backup.ts";

/**
 * On-disk backup store.
 *
 *   ROOT/index.json                                       list of every backup, with check codes
 *   ROOT/v1/<vehicle-hash>/0x<module>/<time>-<id>.json    one file per module per time
 *
 * "v1" is the layout version. A folder from a newer layout, or an index from a newer tool, is refused
 * rather than guessed at. Files are never edited after they are written.
 * The check codes catch damage and accidental edits. They are not a signature: someone who can write
 * to the folder and knows the format can rewrite both a file and its code.
 */
export const STORE_LAYOUT = 1;
export const STORE_INDEX_VERSION = 1;

export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreError";
  }
}

export interface IndexEntry {
  id: string;
  vehicle: string;
  module: number;
  /** Path relative to the store root. */
  file: string;
  /** SHA-256 of the file bytes. */
  file_sha256: string;
  /** The backup's own data hash. */
  data_sha256: string;
  created_utc: string;
  first_seen: boolean;
  blocks: number;
}

interface IndexFile {
  schema_version: 1;
  entries: IndexEntry[];
  entries_sha256: string;
}

export interface StoreProblem {
  id?: string;
  file?: string;
  problem: string;
}

const sha = (data: string | Uint8Array): string => createHash("sha256").update(data).digest("hex");

/** Short, one-way id of a car. The VIN itself is never used in a path. */
export function vehicleHash(vin: string | null): string {
  return sha(`opendiag-vehicle-v1\0${vin ?? "unknown"}`).slice(0, 16);
}

const hex2 = (n: number) => "0x" + n.toString(16).padStart(2, "0");
const indexPath = (root: string) => join(root, "index.json");
const entriesHash = (e: IndexEntry[]) => sha(JSON.stringify(e));

function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  chmodSync(dir, 0o700);
}

/** Write a file so readers see either the old or the new content, never half. Mode 0600. */
export function atomicWrite(path: string, text: string): void {
  const tmp = `${path}.tmp-${process.pid}-${Date.now()}`;
  const fd = openSync(tmp, "wx", 0o600);
  try {
    writeSync(fd, text);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  try {
    renameSync(tmp, path);
  } catch (e) {
    unlinkSync(tmp);
    throw e;
  }
}

/** Refuse a store written by a newer layout. */
function guardLayout(root: string): void {
  let names: string[] = [];
  try {
    names = readdirSync(root);
  } catch {
    return;
  }
  for (const n of names) {
    const m = n.match(/^v(\d+)$/);
    if (m && Number(m[1]) > STORE_LAYOUT) throw new StoreError(`this store has a newer layout (${n}). Update OpenDiag; nothing was changed.`);
  }
}

function parseIndex(text: string): IndexFile {
  let j: IndexFile;
  try {
    j = JSON.parse(text) as IndexFile;
  } catch {
    throw new StoreError("index.json is not readable (damaged). Run `backups verify`.");
  }
  if (typeof j?.schema_version !== "number" || !Array.isArray(j.entries)) throw new StoreError("index.json is not an OpenDiag index.");
  if (j.schema_version > STORE_INDEX_VERSION) throw new StoreError(`index.json was written by a newer OpenDiag (index version ${j.schema_version}). Update OpenDiag; nothing was changed.`);
  if (j.schema_version !== STORE_INDEX_VERSION) throw new StoreError(`index.json has unknown version ${j.schema_version}.`);
  if (entriesHash(j.entries) !== j.entries_sha256) throw new StoreError("index.json was edited or damaged (its check code does not match). Run `backups verify`.");
  return j;
}

function loadIndex(root: string): IndexFile {
  guardLayout(root);
  let text: string;
  try {
    text = readFileSync(indexPath(root), "utf8");
  } catch {
    return { schema_version: 1, entries: [], entries_sha256: entriesHash([]) };
  }
  return parseIndex(text);
}

function saveIndex(root: string, entries: IndexEntry[]): void {
  const idx: IndexFile = { schema_version: 1, entries, entries_sha256: entriesHash(entries) };
  atomicWrite(indexPath(root), JSON.stringify(idx, null, 2));
}

/** Save a verified backup. Refuses a backup whose data hash is wrong, and never overwrites. */
export async function saveBackup(root: string, backup: Backup): Promise<IndexEntry> {
  assertBackupShape(backup);
  if (!(await verifyBackupHash(backup))) throw new StoreError("refusing to store a backup whose check code does not match its data");
  ensureDir(root);
  const idx = loadIndex(root);
  if (idx.entries.some((e) => e.id === backup.txn_id)) throw new StoreError(`backup ${backup.txn_id} is already stored`);
  const vehicle = vehicleHash(backup.vin);
  const first = !idx.entries.some((e) => e.vehicle === vehicle && e.module === backup.module_addr);
  const layout = join(root, `v${STORE_LAYOUT}`);
  const dir = join(layout, vehicle, hex2(backup.module_addr));
  ensureDir(layout);
  ensureDir(join(layout, vehicle));
  ensureDir(dir);
  const name = `${backup.created_utc.replace(/[:.]/g, "-")}-${backup.txn_id.slice(0, 8)}.json`;
  const text = JSON.stringify({ ...backup, first_seen: first }, null, 2);
  atomicWrite(join(dir, name), text);
  const entry: IndexEntry = {
    id: backup.txn_id,
    vehicle,
    module: backup.module_addr,
    file: relative(root, join(dir, name)).split(sep).join("/"),
    file_sha256: sha(text),
    data_sha256: backup.sha256,
    created_utc: backup.created_utc,
    first_seen: first,
    blocks: backup.dids.length,
  };
  saveIndex(root, [...idx.entries, entry]);
  return entry;
}

export function listBackups(root: string): IndexEntry[] {
  return [...loadIndex(root).entries].sort((a, b) => a.created_utc.localeCompare(b.created_utc));
}

/** Find an entry by full id or a unique prefix of at least 4 characters. */
export function findEntry(entries: IndexEntry[], id: string): IndexEntry {
  const hits = entries.filter((e) => e.id === id || (id.length >= 4 && e.id.startsWith(id)));
  if (hits.length === 1) return hits[0] as IndexEntry;
  throw new StoreError(hits.length ? `"${id}" matches ${hits.length} backups. Use more characters.` : `no backup with id "${id}"`);
}

function safePath(root: string, rel: string): string {
  const abs = resolve(root, rel);
  if (!abs.startsWith(resolve(root) + sep)) throw new StoreError(`index points outside the store (${rel})`);
  return abs;
}

/** Read one backup and check everything: file code, data hash, id, car. Throws StoreError on any mismatch. */
export async function readBackup(root: string, id: string): Promise<Backup> {
  return readEntry(root, findEntry(loadIndex(root).entries, id));
}

async function readEntry(root: string, entry: IndexEntry): Promise<Backup> {
  const path = safePath(root, entry.file);
  let text: string;
  try {
    if (lstatSync(path).isSymbolicLink()) throw new StoreError(`${entry.file} is a symbolic link, refusing`);
    text = readFileSync(path, "utf8");
  } catch (e) {
    if (e instanceof StoreError) throw e;
    throw new StoreError(`backup file is missing: ${entry.file}`);
  }
  if (sha(text) !== entry.file_sha256) throw new StoreError(`${entry.file}: file was changed after it was saved (check code does not match the index)`);
  let b: Backup;
  try {
    b = assertBackupShape(JSON.parse(text));
  } catch {
    throw new StoreError(`${entry.file}: not a readable OpenDiag backup`);
  }
  if (!(await verifyBackupHash(b))) throw new StoreError(`${entry.file}: data does not match its own check code`);
  if (b.sha256 !== entry.data_sha256 || b.txn_id !== entry.id) throw new StoreError(`${entry.file}: does not match the index entry`);
  if (vehicleHash(b.vin) !== entry.vehicle || b.module_addr !== entry.module) throw new StoreError(`${entry.file}: filed under the wrong car or module`);
  return b;
}

function walkFiles(dir: string, out: string[] = []): string[] {
  let names: string[] = [];
  try {
    names = readdirSync(dir);
  } catch {
    return out;
  }
  for (const n of names) {
    const p = join(dir, n);
    if (lstatSync(p).isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}

export interface VerifyReport {
  checked: number;
  ok: boolean;
  problems: StoreProblem[];
}

/** Check the whole store, or one backup. Reports every problem instead of stopping at the first. */
export async function verifyStore(root: string, id?: string): Promise<VerifyReport> {
  const problems: StoreProblem[] = [];
  guardLayout(root);
  let text: string | undefined;
  try {
    text = readFileSync(indexPath(root), "utf8");
  } catch {
    /* no index yet */
  }
  let entries: IndexEntry[] = [];
  if (text !== undefined) {
    try {
      entries = parseIndex(text).entries;
    } catch (e) {
      problems.push({ file: "index.json", problem: (e as Error).message });
      return { checked: 0, ok: false, problems };
    }
  }
  const pick = id === undefined ? entries : [findEntry(entries, id)];
  for (const e of pick) {
    try {
      await readEntry(root, e);
    } catch (err) {
      problems.push({ id: e.id, file: e.file, problem: (err as Error).message });
    }
    try {
      const mode = lstatSync(safePath(root, e.file)).mode & 0o777;
      if (mode & 0o077) problems.push({ id: e.id, file: e.file, problem: `permissions too open (${mode.toString(8)}), expected 600` });
    } catch {
      /* already reported as missing */
    }
  }
  if (id === undefined) {
    const known = new Set(entries.map((e) => resolve(root, e.file)));
    for (const f of walkFiles(join(root, `v${STORE_LAYOUT}`))) {
      if (!known.has(resolve(f))) problems.push({ file: relative(root, f), problem: "file is not in the index (leftover or added by hand)" });
    }
    try {
      const mode = lstatSync(root).mode & 0o777;
      if (mode & 0o077) problems.push({ file: ".", problem: `store folder permissions too open (${mode.toString(8)}), expected 700` });
    } catch {
      /* empty store */
    }
  }
  return { checked: pick.length, ok: problems.length === 0, problems };
}
