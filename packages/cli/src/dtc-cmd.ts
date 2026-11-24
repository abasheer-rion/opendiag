import {
  NegativeResponse,
  TimeoutError,
  explainCode,
  fromHex,
  moduleLabel,
  readObdDtcDetails,
  readObdFreezeFrame,
  readReadiness,
  readUdsDtcDetails,
  readUdsExtendedData,
  readUdsSnapshot,
  structuralMeaning,
} from "../../core/src/index.ts";
import type { DiagTransport, DtcDetail, DtcMeaning, ObdFreezeFrame, Readiness, UdsExtendedData, UdsSnapshot } from "../../core/src/index.ts";

export interface DtcOptions {
  freeze: boolean;
  readiness: boolean;
}

export interface DtcFinding {
  detail: DtcDetail;
  meaning: DtcMeaning;
  freeze?: ObdFreezeFrame | UdsSnapshot | undefined;
  extended?: UdsExtendedData | undefined;
}

export interface DtcReport {
  kind: "obd" | "uds";
  module: string;
  faults: DtcFinding[];
  /** Freeze frame for the whole module (OBD-II mode 02), when asked for and the car has one. */
  freezeFrame?: ObdFreezeFrame | undefined;
  readiness?: { sinceClear: Readiness; thisDrive?: Readiness } | { unavailable: string };
}

const tag = (m: DtcMeaning) => `${m.source}, ${m.confidence} confidence${m.level === 2 ? (m.reviewed ? ", reviewed" : ", not reviewed yet") : ""}`;

/** Read everything the car says about its faults. Reads only. */
export async function collectDtcReport(t: DiagTransport, kind: "obd" | "uds", target: number, opts: DtcOptions): Promise<DtcReport> {
  const details = kind === "obd" ? await readObdDtcDetails(t, target) : await readUdsDtcDetails(t, target);
  const report: DtcReport = {
    kind,
    module: moduleLabel(target),
    faults: details.map((detail) => ({ detail, meaning: explainCode(detail.code) ?? structuralMeaning(detail.code) })),
  };
  if (opts.freeze) {
    if (kind === "obd") report.freezeFrame = await readObdFreezeFrame(t, target);
    else {
      for (const f of report.faults) {
        if (!f.detail.udsHex) continue;
        const dtc = fromHex(f.detail.udsHex);
        f.freeze = await readUdsSnapshot(t, target, dtc);
        f.extended = await readUdsExtendedData(t, target, dtc);
      }
    }
  }
  if (opts.readiness) {
    try {
      report.readiness = await readReadiness(t, target);
    } catch (e) {
      if (!(e instanceof NegativeResponse || e instanceof TimeoutError || e instanceof RangeError)) throw e;
      report.readiness = { unavailable: "this module did not answer the readiness request" };
    }
  }
  return report;
}

function faultText(f: DtcFinding): string[] {
  const { detail: d, meaning: m } = f;
  const lines = [`${d.code}   module ${d.module}`];
  lines.push(`  bytes:    ${d.rawHex}${d.udsHex ? `   (UDS code ${d.udsHex})` : ""}`);
  if (d.status !== undefined) {
    lines.push(`  status:   0x${d.status.toString(16).toUpperCase().padStart(2, "0")}  ${d.flags.map((x) => x.name).join(", ") || "no flags set"}`);
    for (const fl of d.flags) lines.push(`            - ${fl.line}`);
  } else if (d.listedAs) {
    lines.push(`  listed:   ${d.listedAs} (OBD-II lists carry no status byte)`);
  }
  lines.push(`  meaning:  ${m.text}  [${tag(m)}]`);
  return lines;
}

function snapshotText(f: DtcFinding): string[] {
  const out: string[] = [];
  const s = f.freeze as UdsSnapshot | undefined;
  if (s) {
    for (const r of s.records) {
      out.push(`  snapshot record ${r.recordNumber}: ${r.identifiers.map((i) => `0x${i.did.toString(16).toUpperCase()}=${i.hex}`).join("  ") || "(nothing readable)"}`);
    }
    if (s.leftoverHex) out.push(`  snapshot raw bytes (lengths not known): ${s.leftoverHex}`);
  } else out.push("  snapshot: not offered by this module");
  if (f.extended) {
    for (const r of f.extended.records) out.push(`  extended record ${r.recordNumber}: ${r.hex}`);
    if (f.extended.leftoverHex) out.push(`  extended raw bytes (lengths not known): ${f.extended.leftoverHex}`);
  } else out.push("  extended data: not offered by this module");
  return out;
}

function readinessText(r: Readiness, title: string): string[] {
  const rows = r.monitors.map((m) => `  ${m.name}: ${!m.available ? "not supported" : m.complete ? "complete" : "not complete"}`);
  return [`${title} (${r.ignition} ignition; warning lamp reported ${r.lampOn ? "on" : "off"}; ${r.storedFaultCount} stored fault(s))`, ...rows];
}

export function formatDtcReport(r: DtcReport): string {
  const out: string[] = [];
  if (r.kind === "uds" && r.faults.length) {
    out.push("note: the letter code is read from the first two bytes. Makes can number their own faults differently, so trust the UDS code.");
  }
  if (!r.faults.length) out.push(`no faults reported by module ${r.module}`);
  for (const f of r.faults) {
    out.push(...faultText(f));
    if (r.kind === "uds" && "freeze" in f) out.push(...snapshotText(f));
    out.push("");
  }
  if (r.freezeFrame) {
    const ff = r.freezeFrame;
    out.push(`freeze frame ${ff.frame}${ff.dtc ? ` (caused by ${ff.dtc})` : ""}`);
    for (const v of ff.values) out.push(`  ${v.name}: ${v.value} ${v.unit}`);
    for (const u of ff.unknown) out.push(`  PID 0x${u.pid.toString(16).toUpperCase()}: ${u.hex} (no formula yet)`);
    out.push("");
  } else if (r.kind === "obd" && r.freezeFrame === undefined && "freezeFrame" in r) {
    out.push("no freeze frame stored", "");
  }
  if (r.readiness) {
    if ("unavailable" in r.readiness) out.push(`readiness: ${r.readiness.unavailable}`);
    else {
      out.push(...readinessText(r.readiness.sinceClear, "readiness since codes were cleared (information only)"));
      if (r.readiness.thisDrive) out.push(...readinessText(r.readiness.thisDrive, "readiness this drive (information only)"));
    }
  }
  return out.join("\n").trimEnd();
}

/** Offline lookup for --explain. */
export function explainReport(input: string): { data: DtcMeaning | { error: string }; text: string; ok: boolean } {
  const m = explainCode(input);
  if (!m) return { data: { error: `"${input}" is not a fault code. Use a form like P0301, or hex like 0301 or 030100.` }, text: `"${input}" is not a fault code. Use a form like P0301, or hex like 0301 or 030100.`, ok: false };
  return { data: m, text: `${m.code}\n  ${m.text}\n  [${tag(m)}${m.scope === "manufacturer" ? "" : ", " + m.scope + " code"}]`, ok: true };
}
