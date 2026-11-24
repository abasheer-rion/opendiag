import {
  DEMO_PACK,
  DiagClient,
  NegativeResponse,
  SimTransport,
  blockBytes,
  createBackup,
  decodeOption,
  demoVehicle,
  diffBackups,
  readOnly,
  verifyBackupHash,
} from "./core.ts";
import type { Backup, DidDiff, DiagTransport } from "./core.ts";
import { explainDtc } from "./dtc-generic.ts";
import type { DtcInfo } from "./dtc-generic.ts";

/** The engine module of the simulated car (BMW-style logical address). */
export const ENGINE = 0x12;

const MODULE_NAMES: Record<number, string> = {
  0x12: "Engine control",
  0x40: "Body module",
};

const LIVE_PIDS = [0x0c, 0x05, 0x0f, 0x42, 0x11, 0x0d, 0x04];

export interface ModuleRow {
  address: number;
  name: string;
  faultCount: number;
}

export interface FaultRow {
  code: string;
  kind: "stored" | "pending";
  info: DtcInfo | undefined;
}

export interface LiveRow {
  name: string;
  value: string;
}

export interface SettingRow {
  label: string;
  value: string;
  checksumOk: boolean | undefined;
}

export interface Comparison {
  diffs: DidDiff[];
  /** Settings (decoded with the demo pack) whose value differs between the two backups. */
  settings: { label: string; before: string; after: string }[];
}

export const hexAddr = (a: number): string => "0x" + a.toString(16).toUpperCase().padStart(2, "0");

export function backupLabel(b: Backup): string {
  return `${MODULE_NAMES[b.module_addr] ?? hexAddr(b.module_addr)} · ${b.created_utc.slice(0, 16).replace("T", " ")}`;
}

/** Everything the screens need, over the built-in simulator. Every request goes through the read-only guard. */
export class SimSession {
  readonly adapter = "Simulator";
  readonly backups: Backup[] = [];
  /** Exposed so tests can prove writes are refused. */
  transport: DiagTransport;
  private client: DiagClient;
  private ambient = 1;

  constructor() {
    this.transport = this.build();
    this.client = new DiagClient(this.transport);
  }

  private build(): DiagTransport {
    return readOnly(new SimTransport(demoVehicle({ ambient: this.ambient })));
  }

  /** Simulator only: pretend the owner changed ambient light in the car's own menu (0..2), so two backups can differ. */
  simulateAmbient(value: number): void {
    this.ambient = value;
    this.transport = this.build();
    this.client = new DiagClient(this.transport);
  }

  get ambientValue(): number {
    return this.ambient;
  }

  async readVin(): Promise<string> {
    return this.client.readVinUds(ENGINE);
  }

  async scan(): Promise<ModuleRow[]> {
    const list: number[] = [];
    for (let a = 0x10; a <= 0x7f; a++) list.push(a);
    const alive = await this.client.scanUds(list);
    const rows: ModuleRow[] = [];
    for (const address of alive) {
      const dtcs = await this.client.readUdsDtcs(address);
      rows.push({ address, name: MODULE_NAMES[address] ?? `Module ${hexAddr(address)}`, faultCount: dtcs.length });
    }
    return rows;
  }

  async faults(address: number): Promise<FaultRow[]> {
    const dtcs = await this.client.readUdsDtcs(address);
    return dtcs.map((d) => {
      const flags = d.flags ?? [];
      const kind = flags.includes("pending") && !flags.includes("confirmed") ? "pending" : "stored";
      return { code: d.code, kind, info: explainDtc(d.code) };
    });
  }

  async live(): Promise<LiveRow[]> {
    const rows: LiveRow[] = [];
    for (const pid of LIVE_PIDS) {
      try {
        const v = await this.client.readPid(pid, ENGINE);
        if (v) rows.push({ name: v.name, value: `${v.value} ${v.unit}` });
      } catch (e) {
        if (!(e instanceof NegativeResponse)) throw e;
      }
    }
    return rows;
  }

  /** Current coding values from the car, decoded with the demo pack. null: this module has no coding block. */
  async settings(address: number): Promise<SettingRow[] | null> {
    const rows: SettingRow[] = [];
    for (const did of new Set(DEMO_PACK.coding.map((o) => o.block.did))) {
      let block: Uint8Array;
      try {
        block = await this.client.readDataByIdentifier(address, did);
      } catch (e) {
        if (e instanceof NegativeResponse) return null;
        throw e;
      }
      for (const o of DEMO_PACK.coding.filter((x) => x.block.did === did)) {
        const d = decodeOption(o, block);
        rows.push({ label: d.label, value: d.value ?? `raw ${d.raw}`, checksumOk: d.integrity?.ok });
      }
    }
    return rows;
  }

  async makeBackup(address = ENGINE): Promise<Backup> {
    const blocks = [...new Set(DEMO_PACK.coding.map((o) => o.block.did))].map((did) => {
      const length = DEMO_PACK.coding.find((o) => o.block.did === did)?.block.length;
      return length === undefined ? { did } : { did, length };
    });
    const b = await createBackup(this.client, { target: address, blocks, pack: DEMO_PACK.pack_id });
    if (!(await verifyBackupHash(b))) throw new Error("backup check code does not match");
    this.backups.push(b);
    return b;
  }

  compare(a: Backup, b: Backup): Comparison {
    const settings: Comparison["settings"] = [];
    for (const o of DEMO_PACK.coding) {
      const x = blockBytes(a, o.block.did);
      const y = blockBytes(b, o.block.did);
      if (!x || !y) continue;
      const da = decodeOption(o, x);
      const db = decodeOption(o, y);
      if (da.raw !== db.raw) {
        settings.push({ label: o.label, before: da.value ?? `raw ${da.raw}`, after: db.value ?? `raw ${db.raw}` });
      }
    }
    return { diffs: diffBackups(a, b), settings };
  }
}
