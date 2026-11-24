import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DiagClient, SimTransport, createBackup, hashDids, readOnly, simTestKey, toHex } from "../../core/src/index.ts";
import type { Backup, Bytes, DiagTransport, Pack, SimEcu } from "../../core/src/index.ts";
import { Journal, LAB_MODULE, LAB_PACK, LabEngine, labVehicle } from "../src/index.ts";
import type { LabConfig } from "../src/index.ts";

const ROOT = mkdtempSync(join(tmpdir(), "lab-test-"));
process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));

export const BLOCKS = [
  { did: 0x3000, length: 64 },
  { did: 0x3001, length: 16 },
];

export interface Rig {
  ecu: SimEcu;
  sent: Bytes[];
  hooks: { before?: (data: Bytes) => void | Promise<void>; after?: (data: Bytes) => void | Promise<void> };
  journalPath: string;
  journal: Journal;
  engine: LabEngine;
  /** A second engine over the same module and journal, as after an app restart. */
  restart(journalPath?: string): LabEngine;
  backup(): Promise<Backup>;
  /** Hash of the module's coding blocks, same encoding as the backup hash. */
  stateHash(): Promise<string>;
  writes(): number;
  /** Requests that are not plain reads or a default-session request. */
  nonReads(): Bytes[];
}

export function makeRig(o: { cfg?: Partial<LabConfig>; now?: () => Date; pack?: Pack; unlock?: boolean } = {}): Rig {
  const vehicle = labVehicle({ unlock: o.unlock ?? true });
  const ecu = vehicle.ecus.get(LAB_MODULE) as SimEcu;
  const sim = new SimTransport(vehicle);
  const sent: Bytes[] = [];
  const hooks: Rig["hooks"] = {};
  const spy: DiagTransport = {
    name: sim.name,
    open: () => sim.open(),
    close: () => sim.close(),
    async request(target, data) {
      sent.push(data);
      await hooks.before?.(data);
      const r = await sim.request(target, data);
      await hooks.after?.(data);
      return r;
    },
  };
  const journalPath = join(mkdtempSync(join(ROOT, "rig-")), "journal.ndjson");
  const journal = new Journal(journalPath);
  const make = (path: string = journalPath): LabEngine =>
    new LabEngine({
      transport: spy,
      pack: o.pack ?? LAB_PACK,
      journal: new Journal(path),
      config: { allowedModules: [LAB_MODULE], keyProvider: simTestKey, ...o.cfg },
      ...(o.now ? { now: o.now } : {}),
    });
  const client = new DiagClient(readOnly(sim));
  return {
    ecu,
    sent,
    hooks,
    journalPath,
    journal,
    engine: make(),
    restart: make,
    backup: () => createBackup(client, { target: LAB_MODULE, blocks: BLOCKS }),
    stateHash: () =>
      hashDids(BLOCKS.map((b) => {
        const v = Uint8Array.from(ecu.cfg.dids?.[b.did] ?? []);
        return { did: b.did, len: v.length, hex: toHex(v, "") };
      })),
    writes: () => sent.filter((d) => d[0] === 0x2e).length,
    nonReads: () => sent.filter((d) => d[0] === 0x2e || d[0] === 0x27 || d[0] === 0x11 || (d[0] === 0x10 && d[1] !== 0x01)),
  };
}
