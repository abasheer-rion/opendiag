// Browser-safe parts of core only. Do not import core's index.ts here: it also pulls in node:net.
export { DiagClient } from "../../../core/src/client.ts";
export { SimTransport, demoVehicle } from "../../../core/src/sim.ts";
export type { DiagTransport } from "../../../core/src/transport.ts";
export { readOnly, WriteBlockedError } from "../../../core/src/transport.ts";
export { createBackup, verifyBackupHash } from "../../../core/src/backup.ts";
export type { Backup } from "../../../core/src/backup.ts";
export { diffBackups } from "../../../core/src/diff.ts";
export type { DidDiff } from "../../../core/src/diff.ts";
export { DEMO_PACK } from "../../../core/src/demo.ts";
export { decodeOption } from "../../../core/src/pack.ts";
export type { DecodedOption } from "../../../core/src/pack.ts";
export { blockBytes } from "../../../core/src/backup.ts";
export { NegativeResponse } from "../../../core/src/uds.ts";
export { TimeoutError, toHex } from "../../../core/src/util.ts";
export type { PidValue } from "../../../core/src/obd.ts";
