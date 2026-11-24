import { PackError, parsePack } from "./pack.ts";
import type { CodingOption, Pack } from "./pack.ts";

/** Which folder a pack lives in. Share-alike packs are kept apart from the main pack. */
export type Namespace = "main" | "share-alike";

const MAIN_LICENCES = ["CC0-1.0", "CC-BY-4.0"];
const SHARE_ALIKE = "CC-BY-SA-4.0";
const SOURCE_TYPES = ["public_standard", "vendor_public_doc", "owner_capture", "community_report", "maintainer_lab"];
const CONFIDENCE = ["low", "medium", "high"];
export const PLACEHOLDER = "TODO_FILL_IN";

export interface LintResult {
  ok: boolean;
  errors: string[];
}

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);
const str = (x: unknown): x is string => typeof x === "string" && x.trim() !== "";

function placeholders(x: unknown, path: string, out: string[]): void {
  if (typeof x === "string" && x.includes(PLACEHOLDER)) out.push(path);
  else if (Array.isArray(x)) x.forEach((v, i) => placeholders(v, `${path}[${i}]`, out));
  else if (isObj(x)) for (const [k, v] of Object.entries(x)) placeholders(v, `${path}.${k}`, out);
}

function licenceErrors(where: string, lic: unknown, ns: Namespace): string[] {
  if (!str(lic)) return [`${where}: licence missing. Use ${ns === "main" ? MAIN_LICENCES.join(" or ") : SHARE_ALIKE}.`];
  if (ns === "main") {
    if (MAIN_LICENCES.includes(lic)) return [];
    if (lic === SHARE_ALIKE) return [`${where}: ${SHARE_ALIKE} is share-alike. It is only allowed in the separate packs/share-alike/ folder, never in the main pack.`];
    return [`${where}: unknown licence "${lic}". The main pack accepts ${MAIN_LICENCES.join(" or ")} only.`];
  }
  return lic === SHARE_ALIKE ? [] : [`${where}: the share-alike folder takes ${SHARE_ALIKE} only, found "${lic}".`];
}

function provenanceErrors(o: CodingOption, pack: Pack): string[] {
  const where = `option "${o.id}"`;
  const p = o.provenance;
  if (!isObj(p)) return [`${where}: provenance missing (source_type, source_url or capture_id, confidence, tested_on).`];
  const e: string[] = [];
  const st = p.source_type;
  if (st === "user_supplied_odx") e.push(`${where}: source_type user_supplied_odx is never accepted in a shared pack.`);
  else if (st === "simulator" && pack.simulator_only === true) {
    /* the built-in simulator pack only */
  } else if (typeof st !== "string" || !SOURCE_TYPES.includes(st)) e.push(`${where}: source_type must be one of ${SOURCE_TYPES.join(", ")}.`);
  if (!str(p.source_url) && !str(p.capture_id)) e.push(`${where}: give source_url or capture_id.`);
  if (st === "owner_capture" && !str(p.capture_id)) e.push(`${where}: an owner_capture needs a capture_id.`);
  if ((st === "public_standard" || st === "vendor_public_doc") && !str(p.source_url)) e.push(`${where}: ${String(st)} needs a source_url.`);
  if (str(p.source_url) && !/^https?:\/\//.test(p.source_url)) e.push(`${where}: source_url must start with http:// or https://.`);
  if (typeof p.confidence !== "string" || !CONFIDENCE.includes(p.confidence)) e.push(`${where}: confidence must be low, medium or high.`);
  const t = p.tested_on;
  if (!Array.isArray(t) || t.length === 0) e.push(`${where}: tested_on needs at least one entry (date, result, chassis).`);
  else {
    const passers = new Set<string>();
    t.forEach((r, i) => {
      if (!isObj(r) || !str(r.date) || !/^\d{4}-\d{2}-\d{2}$/.test(r.date) || (r.result !== "pass" && r.result !== "fail")) {
        e.push(`${where}: tested_on[${i}] needs date (YYYY-MM-DD) and result (pass or fail).`);
      } else if (r.result === "pass") {
        const who = Array.isArray(r.contributors) ? r.contributors.join(",") : `anon-${i}`;
        passers.add(who);
      }
    });
    if (o.risk_tier && o.risk_tier !== "T0" && passers.size === 0) e.push(`${where}: tier ${o.risk_tier} needs at least one passing test.`);
    if (p.confidence === "high" && passers.size < 2) e.push(`${where}: confidence high needs two independent passing testers.`);
  }
  return e;
}

/** Lint untrusted JSON as a pack for the given folder. Never throws on bad packs; read `errors`. */
export function lintPack(json: unknown, ns: Namespace = "main"): LintResult {
  const errors: string[] = [];
  let pack: Pack | undefined;
  try {
    pack = parsePack(json);
  } catch (e) {
    if (!(e instanceof PackError)) throw e;
    errors.push(...e.problems);
  }
  if (isObj(json)) {
    const ph: string[] = [];
    placeholders(json, "pack", ph);
    for (const p of ph) errors.push(`${p}: still has the ${PLACEHOLDER} placeholder. Fill it in.`);
    if (json.license !== undefined) errors.push(...licenceErrors("pack licence", json.license, ns));
  }
  if (pack) {
    for (const o of pack.coding) {
      errors.push(...provenanceErrors(o, pack));
      errors.push(...licenceErrors(`option "${o.id}"`, o.license ?? pack.license, ns));
    }
  }
  return { ok: errors.length === 0, errors };
}

/** All licences used in a pack (pack-wide and per option). */
export function packLicences(p: Pack): Set<string> {
  const s = new Set<string>();
  if (p.license) s.add(p.license);
  for (const o of p.coding) if (o.license) s.add(o.license);
  return s;
}

export class ShareAlikeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShareAlikeError";
  }
}

/** Merge two packs' coding options. Refuses to mix share-alike data with anything else. */
export function mergePacks(base: Pack, extra: Pack): Pack {
  const sa = (p: Pack) => [...packLicences(p)].some((l) => l === SHARE_ALIKE);
  const allSa = (p: Pack) => [...packLicences(p)].every((l) => l === SHARE_ALIKE) && packLicences(p).size > 0;
  if ((sa(base) || sa(extra)) && !(allSa(base) && allSa(extra))) {
    throw new ShareAlikeError(`refusing to merge "${extra.pack_id}" into "${base.pack_id}": ${SHARE_ALIKE} data must stay in its own pack.`);
  }
  return parsePack({ ...base, coding: [...base.coding, ...extra.coding] });
}

/** Loaded packs, kept in two separate namespaces. Nothing here ever combines them. */
export class PackRegistry {
  private readonly spaces: Record<Namespace, Map<string, Pack>> = { main: new Map(), "share-alike": new Map() };

  /** Lint and add. Throws PackError when the pack fails lint for this namespace. */
  add(ns: Namespace, json: unknown): Pack {
    const r = lintPack(json, ns);
    if (!r.ok) throw new PackError(r.errors.join("; "), r.errors);
    const p = parsePack(json);
    if (this.spaces[ns].has(p.pack_id)) throw new PackError(`pack_id "${p.pack_id}" already loaded in ${ns}`);
    this.spaces[ns].set(p.pack_id, p);
    return p;
  }

  get(ns: Namespace, id: string): Pack | undefined {
    return this.spaces[ns].get(id);
  }

  list(ns: Namespace): Pack[] {
    return [...this.spaces[ns].values()];
  }
}
