import type { CodingOption } from "./pack.ts";

/**
 * Built-in block list. OpenDiag does not ship options that hide emissions faults or the check-engine
 * lamp, or that touch safety systems, keys, mileage or speed limits. Matching is on plain words, so it is
 * deliberately blunt: a false alarm is fine, a miss is not. This list lives in code and cannot be switched off.
 */
const BLOCKED: { area: string; words: RegExp }[] = [
  {
    area: "emissions or check-engine lamp",
    words: /\b(dpf|gpf|fap|catalyst|catalytic|egr|evap|o2|lambda|oxygen|readiness|mil|emission|emissions|adblue|nox|scr|particulate|malfunction indicator|check engine|engine light|engine lamp)\b/,
  },
  { area: "airbag", words: /\b(airbag|airbags|air bag|srs|pretensioner|pretensioners|seatbelt|seat belt)\b/ },
  { area: "ABS or brakes", words: /\b(abs|brake|brakes|braking|dsc|esp|epb|stability|traction)\b/ },
  { area: "steering", words: /\b(steering|eps)\b/ },
  { area: "immobiliser or key", words: /\b(immobiliser|immobilizer|immo|key|keys|transponder|ews)\b/ },
  { area: "odometer or mileage", words: /\b(odometer|odo|mileage|kilometre counter|kilometer counter)\b/ },
  { area: "speed limiter removal", words: /\b(limiter|vmax|governor|top speed|speed limit removal)\b/ },
];

const BLOCKED_FIELD_NAMES = ["seed", "key", "algorithm", "seed_key", "secret"];

export interface PolicyHit {
  area: string;
  word: string;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** The plain-word texts of an option that the policy looks at. */
function textsOf(o: CodingOption): string[] {
  const t = [o.id, o.label, o.category, o.module, ...(o.tags ?? []), ...(o.values ?? []).map((v) => v.label)];
  return t.filter((x): x is string => typeof x === "string");
}

export function policyHits(o: CodingOption): PolicyHit[] {
  const hits: PolicyHit[] = [];
  const text = textsOf(o).map(norm).join(" | ");
  for (const b of BLOCKED) {
    const m = text.match(b.words);
    if (m) hits.push({ area: b.area, word: m[0] });
  }
  for (const k of Object.keys(o)) {
    if (BLOCKED_FIELD_NAMES.includes(k.toLowerCase())) hits.push({ area: "secret or seed/key material", word: k });
  }
  return hits;
}

export function policyMessage(o: CodingOption, h: PolicyHit): string {
  return `option "${o.id}" is blocked by project policy (${h.area}, matched "${h.word}"). OpenDiag does not build or load options in this area.`;
}
