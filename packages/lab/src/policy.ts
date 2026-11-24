import type { CodingOption } from "../../core/src/index.ts";

/**
 * Words that mark an option as off limits. Matched against the option's tags, category, id, label
 * and module (as whole words, and as joined word pairs such as "check_engine"). The list fails
 * closed: a harmless option that happens to use one of these words is refused too.
 * Policy (owner-reviewed): no feature disables or hides emissions faults or the check-engine lamp,
 * and safety-critical systems are never written. See failsafe-coding-spec section 8.
 */
export const BLOCKED_WORDS: ReadonlySet<string> = new Set([
  // emissions and the check-engine lamp
  "emissions", "emission", "dpf", "fap", "egr", "scr", "adblue", "catalyst", "catalytic", "o2", "lambda",
  "evap", "readiness", "monitor", "monitors", "mil", "check_engine", "malfunction_indicator", "dtc_masking",
  "fault_masking", "suppress_fault", "engine_map", "tune", "tuning", "defeat",
  // airbag, brakes, steering, immobilizer, odometer, gateway, flash, limiter, driver assist
  "airbag", "srs", "restraint", "pretensioner", "occupant", "abs", "esc", "dsc", "brake", "brakes", "steering", "eps",
  "immobilizer", "immobiliser", "ews", "cas", "fbs", "key", "keys", "transponder", "odometer", "mileage",
  "gateway", "firewall", "flash", "reflash", "bootloader", "speed_limiter", "speedlimiter", "adas", "radar",
  "safety", "safety_critical",
]);

function words(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/** Returns the blocked word that matched, or undefined when the option is clear. */
export function blockedWord(opt: CodingOption): string | undefined {
  const tags = (opt as { tags?: unknown }).tags;
  const parts = [opt.category ?? "", opt.id, opt.label, opt.module ?? "", ...(Array.isArray(tags) ? tags.map(String) : [])];
  for (const p of parts) {
    const w = words(p);
    const whole = w.join("_");
    if (BLOCKED_WORDS.has(whole)) return whole;
    for (let i = 0; i < w.length; i++) {
      const one = w[i] as string;
      if (BLOCKED_WORDS.has(one)) return one;
      const two = i + 1 < w.length ? `${one}_${w[i + 1]}` : "";
      if (two && BLOCKED_WORDS.has(two)) return two;
    }
  }
  return undefined;
}

const TIER_RANK: Record<string, number> = { T1: 1, GREEN: 1, T2: 2, AMBER: 2, T3: 3, RED: 3 };

/** Why this option's tier cannot be written under `maxTier`, or undefined when it can. */
export function tierProblem(opt: CodingOption, maxTier: string): string | undefined {
  const t = opt.risk_tier;
  if (!t) return "no risk tier (no tier, no write)";
  const rank = TIER_RANK[t.toUpperCase()];
  if (rank === undefined) return `tier ${t} is read-only or blocked`;
  const limit = TIER_RANK[maxTier.toUpperCase()] ?? 1;
  return rank > limit ? `tier ${t} is above the allowed ${maxTier}` : undefined;
}
