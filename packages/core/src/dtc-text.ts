import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDtcInput } from "./dtc-detail.ts";

/** One fault description from packages/core/data/dtc. Every line is written by us, never copied. */
export interface DtcTextEntry {
  code: string;
  text: string;
  system: string;
  source: "own-words";
  confidence: "high" | "medium" | "low";
  reviewed: boolean;
  added: string;
}

export interface DtcMeaning {
  code: string;
  text: string;
  /** 2: our own line for this exact code. 1: structure only, from the shape of the code. */
  level: 1 | 2;
  source: "own-words" | "structure";
  confidence: "high" | "medium" | "low";
  /** False when the honest answer is "we do not know yet". */
  known: boolean;
  scope: "generic" | "manufacturer" | "reserved";
  system?: string;
  reviewed: boolean;
}

export const DTC_DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "dtc");

export function loadDtcEntries(dir = DTC_DATA_DIR): DtcTextEntry[] {
  const out: DtcTextEntry[] = [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".json")).sort()) {
    out.push(...(JSON.parse(readFileSync(join(dir, f), "utf8")) as DtcTextEntry[]));
  }
  return out;
}

let cached: Map<string, DtcTextEntry> | undefined;
function defaultTable(): Map<string, DtcTextEntry> {
  cached ??= new Map(loadDtcEntries().map((e) => [e.code, e]));
  return cached;
}

const LETTER_NAME: Record<string, string> = { P: "powertrain", C: "chassis", B: "body", U: "network" };

function scopeOf(code: string): DtcMeaning["scope"] {
  const letter = code.charAt(0);
  const d = code.charAt(1);
  if (letter === "P") {
    if (d === "0" || d === "2") return "generic";
    if (d === "1") return "manufacturer";
    return code.charAt(2) <= "3" ? "manufacturer" : "reserved"; // P30xx to P33xx are the make's own
  }
  return d === "0" ? "generic" : d === "3" ? "reserved" : "manufacturer";
}

const POWERTRAIN_GROUP: Record<string, string> = {
  "0": "fuel and air metering", "1": "fuel and air metering", "2": "fuel and air metering",
  "3": "ignition or misfire", "4": "emission controls", "5": "vehicle speed, idle control or inputs",
  "6": "engine computer or its outputs", "7": "transmission", "8": "transmission", "9": "transmission",
  A: "hybrid drive", B: "hybrid drive", C: "hybrid drive",
};

function networkGroup(code: string): string | undefined {
  const g = code.slice(2, 3);
  if (g === "0") return "network power or bus problem";
  if (g === "1" || g === "2") return "lost communication with a module";
  if (g === "3") return "software or setup mismatch";
  if (g === "4") return "invalid data received from a module";
  return undefined;
}

/** Level-1 meaning: only what the shape of the code says. Never invents a specific fault. */
export function structuralMeaning(code: string): DtcMeaning {
  const scope = scopeOf(code);
  const kind = LETTER_NAME[code.charAt(0)] ?? "unknown";
  const base = { code, level: 1 as const, source: "structure" as const, scope, reviewed: false };
  if (scope === "manufacturer") {
    return { ...base, known: false, confidence: "high", text: `Manufacturer-specific ${kind} code. Its meaning is not known yet. Raw code: ${code}.` };
  }
  if (scope === "reserved") {
    return { ...base, known: false, confidence: "medium", text: `${code} is in a range the standard keeps in reserve. Its meaning is not known. Raw code: ${code}.` };
  }
  const group = code.charAt(0) === "P" ? POWERTRAIN_GROUP[code.charAt(2)] : code.charAt(0) === "U" ? networkGroup(code) : undefined;
  const where = group ? ` Area: ${group}.` : "";
  return {
    ...base,
    known: false,
    confidence: code.charAt(1) === "0" ? "medium" : "low",
    text: `Standard ${kind} code.${where} No plain-English line for this exact code yet. Raw code: ${code}.`,
  };
}

/** Explain a code offline. Accepts "P0301", "p0301", "0301" or "030100". Undefined when the text is not a fault code. */
export function explainCode(input: string, table: ReadonlyMap<string, DtcTextEntry> = defaultTable()): DtcMeaning | undefined {
  const parsed = parseDtcInput(input);
  if (!parsed) return undefined;
  const e = table.get(parsed.code);
  if (!e) return structuralMeaning(parsed.code);
  return {
    code: e.code, text: e.text, level: 2, source: e.source, confidence: e.confidence,
    known: true, scope: scopeOf(e.code), system: e.system, reviewed: e.reviewed,
  };
}
