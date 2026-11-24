import { closeSync, existsSync, fsyncSync, openSync, readFileSync, statSync, truncateSync, writeSync } from "node:fs";
import { createHash } from "node:crypto";

const ZERO = "0".repeat(64);

export interface JournalRecord {
  seq: number;
  txn: string;
  ev: string;
  t: string;
  prev: string;
  [k: string]: unknown;
}

export class JournalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JournalError";
  }
}

const sha = (s: string): string => createHash("sha256").update(s).digest("hex");

/**
 * Append-only, hash-chained NDJSON journal. Every append is fsynced before it returns, so a record
 * written "before the write" is on disk before the bytes leave for the adapter.
 */
export class Journal {
  readonly path: string;
  private readonly now: () => Date;

  constructor(path: string, now: () => Date = () => new Date()) {
    this.path = path;
    this.now = now;
  }

  /** Read and verify the whole chain. A torn last line (crash mid-append) is ignored. */
  records(): JournalRecord[] {
    return this.load().records;
  }

  private load(): { records: JournalRecord[]; goodBytes: number; last: string } {
    if (!existsSync(this.path)) return { records: [], goodBytes: 0, last: ZERO };
    const text = readFileSync(this.path, "utf8");
    const records: JournalRecord[] = [];
    let prev = ZERO;
    let pos = 0;
    let good = 0;
    while (pos < text.length) {
      const nl = text.indexOf("\n", pos);
      if (nl < 0) break; // torn tail
      const line = text.slice(pos, nl);
      let rec: JournalRecord;
      try {
        rec = JSON.parse(line) as JournalRecord;
      } catch {
        throw new JournalError(`journal record ${records.length + 1} is not valid JSON`);
      }
      if (rec.seq !== records.length + 1 || rec.prev !== prev) {
        throw new JournalError(`journal chain broken at record ${records.length + 1}`);
      }
      prev = sha(line);
      records.push(rec);
      pos = nl + 1;
      good = pos;
    }
    return { records, goodBytes: Buffer.byteLength(text.slice(0, good)), last: prev };
  }

  /** Append one record and fsync. Throws if the journal cannot be written, so the caller must not continue. */
  append(txn: string, ev: string, data: Record<string, unknown> = {}): JournalRecord {
    const st = this.load();
    if (existsSync(this.path) && statSync(this.path).size !== st.goodBytes) truncateSync(this.path, st.goodBytes);
    const rec: JournalRecord = { seq: st.records.length + 1, txn, ev, t: this.now().toISOString(), prev: st.last, ...data };
    const fd = openSync(this.path, "a", 0o600);
    try {
      writeSync(fd, JSON.stringify(rec) + "\n");
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    return rec;
  }

  /** Transactions that opened but never reached a terminal record. */
  openTxns(): string[] {
    const open = new Set<string>();
    for (const r of this.records()) {
      if (r.ev === "txn_open") open.add(r.txn);
      else if (r.ev === "terminal") open.delete(r.txn);
    }
    return [...open];
  }

  forTxn(txn: string): JournalRecord[] {
    return this.records().filter((r) => r.txn === txn);
  }
}
