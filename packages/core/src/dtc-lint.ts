import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DTC_DATA_DIR, loadDtcEntries } from "./dtc-text.ts";
import type { DtcTextEntry } from "./dtc-text.ts";

export const MAX_TEXT = 160;
/** Entries at or above this similarity to a denylist line are rejected. */
export const SIMILARITY_LIMIT = 0.8;

/**
 * Policy: this project does not help hide or switch off faults, lamps or emissions checks.
 * No data entry may talk about doing that.
 */
const SUPPRESSION = /\b(?:suppress\w*|disabl\w*|deactivat\w*|defeat\w*|bypass\w*|delet\w*|hid(?:e|es|ing|den)|mask\w*|silenc\w*|emulat\w*|eliminat\w*|cheat\w*|tamper\w*|erase\w*|clear(?:s|ed|ing)?|kill\w*|(?:switch|turn|shut)\w*\s+(?!itself\b)(?:\w+\s+){0,4}off|(?:remov\w*|ignor\w*|get rid of)\s+(?:\w+\s+){0,3}(?:codes?|faults?|lamps?|lights?|warnings?|monitors?|indicators?))\b/i;

export const isAboutHidingFaults = (text: string): boolean => SUPPRESSION.test(text);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

/** Set of character 4-grams of the normalised text. */
export function ngrams(s: string, n = 4): Set<string> {
  const t = norm(s);
  const out = new Set<string>();
  for (let i = 0; i + n <= t.length; i++) out.add(t.slice(i, i + n));
  if (t.length > 0 && t.length < n) out.add(t);
  return out;
}

/** Jaccard similarity of 4-gram sets, 0 to 1. */
export function similarity(a: string, b: string): number {
  const x = ngrams(a);
  const y = ngrams(b);
  if (x.size === 0 || y.size === 0) return 0;
  let both = 0;
  for (const g of x) if (y.has(g)) both++;
  return both / (x.size + y.size - both);
}

export function loadDenylist(dir = DTC_DATA_DIR): string[] {
  return readFileSync(join(dir, "denylist.txt"), "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
}

const CONFIDENCE = new Set(["high", "medium", "low"]);
const CODE = /^[PCBU][0-3][0-9A-F]{3}$/;

/** Returns a list of problems, empty when the data is clean. */
export function lintEntries(entries: readonly DtcTextEntry[], denylist: readonly string[] = []): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const e of entries) {
    const at = e.code;
    if (!CODE.test(e.code ?? "")) problems.push(`${at}: not a valid code`);
    if (seen.has(e.code)) problems.push(`${at}: duplicate code`);
    seen.add(e.code);
    if (e.source !== "own-words") problems.push(`${at}: missing or wrong source`);
    if (!CONFIDENCE.has(e.confidence)) problems.push(`${at}: missing confidence`);
    if (e.reviewed !== false) problems.push(`${at}: reviewed must start as false`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.added ?? "")) problems.push(`${at}: missing added date`);
    if (!e.system) problems.push(`${at}: missing system`);
    if (typeof e.text !== "string" || e.text.trim() === "") {
      problems.push(`${at}: empty text`);
      continue;
    }
    if (e.text.length > MAX_TEXT) problems.push(`${at}: text is ${e.text.length} characters, limit ${MAX_TEXT}`);
    if (isAboutHidingFaults(e.text)) problems.push(`${at}: text is about hiding or switching off a fault, which this project does not do`);
    for (const bad of denylist) {
      if (similarity(e.text, bad) >= SIMILARITY_LIMIT) problems.push(`${at}: text is too close to a denylisted line`);
    }
  }
  return problems;
}

/** Lint the shipped data. */
export function lintShippedData(): string[] {
  return lintEntries(loadDtcEntries(), loadDenylist());
}
