import type { DidDiff } from "./diff.ts";
import { suggestField } from "./diff.ts";
import { PLACEHOLDER } from "./pack-lint.ts";

export interface InitOptions {
  /** Which DID to use when more than one changed. */
  did?: number;
  /** Byte offsets to ignore (checksum bytes that moved with the change). */
  ignore?: number[];
}

export class AuthorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorError";
  }
}

/**
 * Turn the result of `opendiag diff --json` (one setting toggled between two backups) into a pack
 * skeleton. What the diff proves is filled in: block, byte, bit, length, the two raw values.
 * Everything only a human knows is left as TODO_FILL_IN, so lint fails until it is written.
 */
export function packFromDiff(diffs: DidDiff[], opts: InitOptions = {}): unknown {
  if (!Array.isArray(diffs)) throw new AuthorError("expected the JSON list written by `opendiag diff --json`");
  const ignore = opts.ignore ?? [];
  const changed = diffs.filter((d) => d.status === "changed" && d.changes.some((c) => !ignore.includes(c.offset)));
  const odd = diffs.filter((d) => d.status === "length_differs" || d.status === "only_in_a" || d.status === "only_in_b");
  if (odd.length) throw new AuthorError(`the two backups do not hold the same blocks (${odd.map((d) => "0x" + d.did.toString(16)).join(", ")}). Compare backups of the same module.`);
  const pool = opts.did === undefined ? changed : changed.filter((d) => d.did === opts.did);
  if (pool.length === 0) throw new AuthorError("no changed block found in the diff");
  if (pool.length > 1) throw new AuthorError(`more than one block changed (${pool.map((d) => "0x" + d.did.toString(16)).join(", ")}). Pick one with --did.`);
  const d = pool[0] as DidDiff;
  const f = suggestField(d.changes, ignore);
  if (!f) {
    throw new AuthorError("the change is not a single byte. Either several settings changed, or a checksum moved (use --ignore with its byte offsets). Toggle exactly one setting and back up again.");
  }
  const c = d.changes.find((x) => !ignore.includes(x.offset));
  if (!c) throw new AuthorError("no changed byte");
  const mask = 2 ** f.bit_length - 1;
  const raw = (b: number) => (b >> f.bit_offset) & mask;
  return {
    schema_version: 1,
    pack_id: PLACEHOLDER,
    version: "0.0.1",
    license: PLACEHOLDER,
    coding: [
      {
        id: PLACEHOLDER,
        label: PLACEHOLDER,
        category: PLACEHOLDER,
        module: PLACEHOLDER,
        block: { did: d.did, length: d.lengthA },
        field: f,
        values: [
          { raw: raw(c.before), label: PLACEHOLDER },
          { raw: raw(c.after), label: PLACEHOLDER },
        ],
        default_raw: raw(c.before),
        risk_tier: "T0",
        provenance: {
          source_type: "owner_capture",
          capture_id: PLACEHOLDER,
          confidence: "low",
          tested_on: [{ date: PLACEHOLDER, result: "pass", chassis: PLACEHOLDER }],
        },
        license: PLACEHOLDER,
        unknown_fields: ["id", "label", "category", "module", "values[].label", "default_raw", "provenance.capture_id", "provenance.tested_on", "license"],
      },
    ],
  };
}
