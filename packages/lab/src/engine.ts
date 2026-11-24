import { DiagClient, NegativeResponse, TimeoutError, expectPositive, fromHex, hashDids, toHex, verifyBackupHash } from "../../core/src/index.ts";
import type { Backup, Bytes, DiagTransport, Pack } from "../../core/src/index.ts";
import { HardStop, LabRefusal, RecoveryRequired, RollbackFailed } from "./errors.ts";
import type { Gate } from "./errors.ts";
import type { Journal } from "./journal.ts";
import { buildPlan, consentProblem, DEFAULT_CONFIG, identityProblem, readVolts } from "./plan.ts";
import type { ChangeRequest, Consent, DiffPreview, LabConfig, Plan } from "./plan.ts";
import { WriteTransport } from "./write-transport.ts";

export type TxnState = "COMMITTED" | "ROLLED_BACK" | "ABORTED";

export interface Outcome {
  txn: string;
  state: TxnState;
  /** Why the write was undone, when it was. */
  reason?: string;
  preview: DiffPreview;
}

const same = (a: Bytes, b: Bytes): boolean => a.length === b.length && a.every((x, i) => x === b[i]);
const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e));
const didHash = (did: number, b: Bytes): Promise<string> => hashDids([{ did, len: b.length, hex: toHex(b, "") }]);

export interface EngineOptions {
  transport: DiagTransport;
  pack: Pack;
  journal: Journal;
  config?: Partial<LabConfig>;
  now?: () => Date;
}

/**
 * The guarded write engine (failsafe spec sections 6 and 7), simulator only for now. Order of play:
 * recovery check, preflight, diff, consent, journal intent, 0x2E, read back, automatic rollback.
 */
export class LabEngine {
  private readonly wt: WriteTransport;
  private readonly client: DiagClient;
  private readonly pack: Pack;
  private readonly journal: Journal;
  private readonly cfg: LabConfig;
  private readonly now: () => Date;

  constructor(o: EngineOptions) {
    this.wt = WriteTransport.open(o.transport);
    this.client = new DiagClient(this.wt);
    this.pack = o.pack;
    this.journal = o.journal;
    this.cfg = { ...DEFAULT_CONFIG, ...o.config };
    this.now = o.now ?? (() => new Date());
  }

  private requireRecovered(): void {
    const open = this.journal.openTxns();
    if (open.length) throw new RecoveryRequired(open);
  }

  /** Preflight and diff preview. Sends reads only. */
  async plan(req: ChangeRequest): Promise<Plan> {
    this.requireRecovered();
    return buildPlan({ client: this.client, transport: this.wt, pack: this.pack, cfg: this.cfg, now: this.now }, req);
  }

  /** Plan, check consent, write, verify. Undoes itself on any mismatch, error or disconnect. */
  async apply(req: ChangeRequest, consent: Consent | undefined): Promise<Outcome> {
    let plan: Plan;
    try {
      plan = await this.plan(req);
      const bad = consentProblem(consent, plan.preview);
      if (bad) throw new LabRefusal([{ name: "consent", ok: false, detail: bad }]);
      // The bytes about to be sent must hash to what the user agreed to.
      const sent = await hashDids(
        req.backup.dids.map((d) => {
          const b = plan.intended.get(d.did);
          return b ? { did: d.did, len: b.length, hex: toHex(b, "") } : d;
        }),
      );
      if (sent !== (consent as Consent).intendedSha256) throw new LabRefusal([{ name: "consent", ok: false, detail: "bytes to send do not match the consent" }]);
    } catch (e) {
      if (e instanceof LabRefusal) this.noteRefusal(e);
      throw e;
    }

    const target = req.target;
    const dids = [...plan.intended.keys()].sort((a, b) => a - b);
    const txn = crypto.randomUUID();
    const hashes = async (m: Map<number, Bytes>) => Promise.all(dids.map(async (did) => ({ did, sha256: await didHash(did, m.get(did) as Bytes) })));
    // Journal first. If this throws, nothing has been sent to the module.
    this.journal.append(txn, "txn_open", {
      module: target,
      backup_sha256: req.backup.sha256,
      intended_sha256: plan.preview.intendedSha256,
      original: await hashes(plan.original),
      intended: await hashes(plan.intended),
      changes: plan.preview.changes.map((c) => ({ id: c.id, from: c.beforeRaw, to: c.afterRaw })),
      consent_by: (consent as Consent).grantedBy,
    });

    const written: number[] = [];
    let fault: string | undefined;
    try {
      await this.unlock(target);
      for (const did of dids) {
        const volts = await readVolts(this.wt, target);
        if (volts < this.cfg.minVolts) throw new Error(`battery voltage fell to ${volts.toFixed(1)} V`);
        written.push(did); // counted before the send: a lost reply must still be undone
        await this.writeBlock(txn, target, did, plan.intended.get(did) as Bytes, "write");
        const back = await this.client.readDataByIdentifier(target, did);
        if (!same(back, plan.intended.get(did) as Bytes)) throw new Error(`read-back of ${"0x" + did.toString(16)} differs from what was written`);
      }
      const after = await this.stateOf(target, req.backup);
      if (after !== plan.preview.intendedSha256) throw new Error("final read-back does not match the agreed state");
    } catch (e) {
      if (e instanceof HardStop) throw e;
      fault = msg(e);
    }

    if (fault === undefined) {
      this.journal.append(txn, "terminal", { state: "COMMITTED", after_sha256: plan.preview.intendedSha256 });
      await this.endSession(target);
      return { txn, state: "COMMITTED", preview: plan.preview };
    }

    this.journal.append(txn, "fault", { reason: fault });
    const restores = await this.rollback(txn, target, req.backup, [...written].reverse());
    const state: TxnState = restores > 0 ? "ROLLED_BACK" : "ABORTED";
    this.journal.append(txn, "terminal", { state, reason: fault, after_sha256: req.backup.sha256 });
    await this.endSession(target);
    return { txn, state, reason: fault, preview: plan.preview };
  }

  /**
   * Put a verified backup back on the module ("restore my coding"). Needs no consent: the user already
   * accepted the risk when the backup was made. Same gates as a write, same journal, same second verify.
   */
  async restore(backup: Backup, target: number): Promise<{ txn: string; state: TxnState }> {
    this.requireRecovered();
    const gates: Gate[] = [];
    const gate = (name: string, ok: boolean, detail: string) => gates.push({ name, ok, detail: ok ? "ok" : detail });
    gate("module allowed", this.cfg.allowedModules.includes(target) && backup.module_addr === target, "module is not allowed, or the backup is for another module");
    const hashOk = backup.verified === true && Array.isArray(backup.dids) && backup.dids.length > 0 && (await verifyBackupHash(backup).catch(() => false));
    gate("verified backup", hashOk, "no verified backup with a matching hash");
    if (gates.some((g) => !g.ok)) throw new LabRefusal(gates);
    try {
      const p = await identityProblem(this.client, target, backup);
      gate("identity matches backup", p === undefined, p ?? "");
      const volts = await readVolts(this.wt, target);
      gate("battery voltage", volts >= this.cfg.minVolts, `${volts.toFixed(1)} V is below the ${this.cfg.minVolts} V minimum`);
    } catch (e) {
      if (e instanceof HardStop) throw e;
      gate("module readable", false, msg(e));
    }
    if (gates.some((g) => !g.ok)) throw new LabRefusal(gates);

    const txn = crypto.randomUUID();
    const state = await Promise.all(backup.dids.map(async (d) => ({ did: d.did, sha256: await didHash(d.did, fromHex(d.hex)) })));
    this.journal.append(txn, "txn_open", { kind: "restore", module: target, backup_sha256: backup.sha256, original: state, intended: state });
    const restores = await this.rollback(txn, target, backup, backup.dids.map((d) => d.did).reverse());
    const result: TxnState = restores > 0 ? "ROLLED_BACK" : "ABORTED";
    this.journal.append(txn, "terminal", { state: result, kind: "restore", after_sha256: backup.sha256 });
    await this.endSession(target);
    return { txn, state: result };
  }

  /**
   * Finish every unfinished write found in the journal. Always reads before it writes: the module is
   * either still the original (nothing to do), already the agreed state (committed), or restored.
   * `backups` must include the backup each unfinished write used.
   */
  async recover(backups: Backup[]): Promise<{ txn: string; state: TxnState }[]> {
    const done: { txn: string; state: TxnState }[] = [];
    for (const txn of this.journal.openTxns()) {
      const open = this.journal.forTxn(txn).find((r) => r.ev === "txn_open");
      const backup = backups.find((b) => b.sha256 === open?.backup_sha256);
      if (!open || !backup) throw new LabRefusal([{ name: "recovery", ok: false, detail: `the backup for ${txn} was not supplied` }]);
      const target = open.module as number;
      const bad = await identityProblem(this.client, target, backup);
      if (bad) throw new LabRefusal([{ name: "recovery identity", ok: false, detail: bad }]);
      const original = open.original as { did: number; sha256: string }[];
      const intended = open.intended as { did: number; sha256: string }[];
      this.journal.append(txn, "recovery_start", {});
      const live = await Promise.all(original.map(async (o) => didHash(o.did, await this.client.readDataByIdentifier(target, o.did))));
      let state: TxnState;
      if (live.every((h, i) => h === original[i]?.sha256)) state = "ABORTED";
      else if (live.every((h, i) => h === intended[i]?.sha256)) state = "COMMITTED";
      else {
        const restores = await this.rollback(txn, target, backup, original.map((o) => o.did).reverse());
        state = restores > 0 ? "ROLLED_BACK" : "ABORTED";
      }
      this.journal.append(txn, "terminal", { state, recovered: true });
      await this.endSession(target);
      done.push({ txn, state });
    }
    return done;
  }

  private noteRefusal(e: LabRefusal): void {
    try {
      this.journal.append(crypto.randomUUID(), "refused", { gates: e.gates.filter((g) => !g.ok).map((g) => g.name) });
    } catch {
      // A broken journal must not hide the refusal itself.
    }
  }

  /** Extended session, then security access if the module asks for it. One key attempt, never retried. */
  private async unlock(target: number): Promise<void> {
    expectPositive(0x10, await this.wt.request(target, Uint8Array.of(0x10, 0x03)));
    const r = await this.wt.request(target, Uint8Array.of(0x27, 0x01));
    if (r.length === 3 && r[0] === 0x7f && r[2] === 0x11) return; // module has no security access
    const seed = expectPositive(0x27, r).subarray(1);
    if (seed.every((b) => b === 0)) return; // already unlocked
    const key = this.cfg.keyProvider?.(seed);
    if (!key) throw new Error("the module wants an unlock and no key provider is configured");
    expectPositive(0x27, await this.wt.request(target, Uint8Array.of(0x27, 0x02, ...key)));
  }

  private async endSession(target: number): Promise<void> {
    try {
      await this.wt.request(target, Uint8Array.of(0x10, 0x01));
    } catch (e) {
      if (e instanceof HardStop) throw e;
    }
  }

  /** One 0x2E with a journal record before and after. A lost reply is not an error: the read-back decides. */
  private async writeBlock(txn: string, target: number, did: number, bytes: Bytes, purpose: "write" | "restore"): Promise<void> {
    this.journal.append(txn, "intent", { purpose, did, len: bytes.length, sha256: await didHash(did, bytes) });
    let outcome = "positive";
    let failure: unknown;
    try {
      const body = expectPositive(0x2e, await this.wt.writeDid(target, did, bytes));
      if (body.length < 2 || ((body[0] as number) << 8 | (body[1] as number)) !== did) throw new Error("write reply named the wrong DID");
    } catch (e) {
      if (e instanceof HardStop) throw e;
      if (e instanceof TimeoutError) outcome = "no reply";
      else {
        outcome = e instanceof NegativeResponse ? `nrc 0x${e.nrc.toString(16)}` : "error";
        failure = e;
      }
    }
    this.journal.append(txn, "result", { purpose, did, outcome });
    if (failure) throw failure;
  }

  /** Hash of the module's state across every block in the backup, read fresh. */
  private async stateOf(target: number, backup: Backup): Promise<string> {
    const recs = [];
    for (const d of backup.dids) {
      const b = await this.client.readDataByIdentifier(target, d.did);
      recs.push({ did: d.did, len: b.length, hex: toHex(b, "") });
    }
    return hashDids(recs);
  }

  private async readRetry(target: number, did: number): Promise<Bytes> {
    for (let i = 0; ; i++) {
      try {
        return await this.client.readDataByIdentifier(target, did);
      } catch (e) {
        if (!(e instanceof TimeoutError) || i >= 2) throw e;
      }
    }
  }

  /**
   * Put the backup bytes back, newest block first, then read everything again and compare with the
   * backup hash (the second verify). Returns how many blocks had to be rewritten. Throws RollbackFailed
   * and leaves the journal open if the backup cannot be restored.
   */
  private async rollback(txn: string, target: number, backup: Backup, dids: number[]): Promise<number> {
    this.journal.append(txn, "rollback_start", { dids });
    let restores = 0;
    try {
      for (const did of dids) {
        const want = fromHex((backup.dids.find((d) => d.did === did) as { hex: string }).hex);
        for (let attempt = 0; ; attempt++) {
          if (same(await this.readRetry(target, did), want)) break;
          if (attempt >= this.cfg.rollbackAttempts) throw new Error(`block 0x${did.toString(16)} would not go back after ${attempt} tries`);
          await this.unlock(target);
          try {
            await this.writeBlock(txn, target, did, want, "restore");
          } catch (e) {
            if (e instanceof HardStop) throw e;
            if (!(e instanceof NegativeResponse)) throw e;
          }
          restores++;
        }
      }
      if ((await this.stateOf(target, backup)) !== backup.sha256) throw new Error("second verify: module does not match the backup hash");
    } catch (e) {
      if (e instanceof HardStop) throw e;
      this.journal.append(txn, "rollback_failed", { reason: msg(e) });
      throw new RollbackFailed(`could not restore the backup: ${msg(e)}. Run recovery before anything else is written.`);
    }
    this.journal.append(txn, "rollback_verified", { restores });
    return restores;
  }
}
