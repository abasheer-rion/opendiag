import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AuthorError,
  DEMO_PACK,
  PackError,
  PackRegistry,
  ShareAlikeError,
  diffBytes,
  lintPack,
  loadPackDir,
  mergePacks,
  namespaceOf,
  packFromDiff,
  parsePack,
  policyHits,
} from "../src/index.ts";
import type { CodingOption, DidDiff, Pack } from "../src/index.ts";

const here = dirname(fileURLToPath(import.meta.url));
const FIX = join(here, "fixtures", "packs");
const load = (...p: string[]): unknown => JSON.parse(readFileSync(join(FIX, ...p), "utf8"));
const files = (d: string) => readdirSync(join(FIX, d)).filter((n) => n.endsWith(".json")).sort();

test("lint: every good fixture passes", () => {
  const names = files("good");
  assert.ok(names.length >= 3);
  for (const n of names) assert.deepEqual(lintPack(load("good", n)).errors, [], n);
});

test("lint: every bad fixture fails with a message", () => {
  const names = files("bad");
  assert.ok(names.length >= 9);
  for (const n of names) {
    const r = lintPack(load("bad", n));
    assert.equal(r.ok, false, n);
    assert.ok(r.errors.length > 0 && r.errors.every((e) => e.length > 10), n);
  }
});

const EXPECT: Record<string, RegExp> = {
  "unknown-licence.json": /unknown licence "MIT"/,
  "no-licence.json": /licence missing/,
  "share-alike-in-main.json": /share-alike/,
  "no-confidence.json": /confidence must be/,
  "no-source.json": /source_url or capture_id/,
  "no-tested-on.json": /tested_on needs/,
  "no-provenance.json": /provenance missing/,
  "odx-source.json": /user_supplied_odx/,
  "placeholder.json": /TODO_FILL_IN/,
  "high-one-tester.json": /two independent/,
};
for (const [n, re] of Object.entries(EXPECT)) {
  test(`lint: ${n} fails for the right reason`, () => {
    const r = lintPack(load("bad", n));
    assert.ok(r.errors.some((e) => re.test(e)), r.errors.join(" | "));
  });
}

test("lint: provenance fields are all required one by one", () => {
  const base = load("good", "main-cc0.json") as { coding: { provenance: Record<string, unknown>; license?: string }[] };
  for (const k of ["source_type", "confidence", "tested_on"]) {
    const copy = structuredClone(base);
    delete copy.coding[0]!.provenance[k];
    assert.equal(lintPack(copy).ok, false, k);
  }
  const copy = structuredClone(base);
  delete copy.coding[0]!.license;
  assert.equal(lintPack(copy).ok, false, "license");
});

test("lint: CC0 and CC-BY pass in main; CC-BY-SA and others fail in main", () => {
  const base = load("good", "main-cc0.json") as { coding: { license: string }[] };
  for (const [lic, ok] of [["CC0-1.0", true], ["CC-BY-4.0", true], ["CC-BY-SA-4.0", false], ["MIT", false], ["GPL-3.0", false], ["", false]] as const) {
    const c = structuredClone(base);
    c.coding[0]!.license = lic;
    assert.equal(lintPack(c, "main").ok, ok, lic);
  }
});

test("lint: share-alike folder takes CC-BY-SA-4.0 only", () => {
  assert.equal(lintPack(load("tree", "share-alike", "sa.json"), "share-alike").ok, true);
  assert.equal(lintPack(load("tree", "share-alike", "bad-permissive.json"), "share-alike").ok, false);
  assert.equal(lintPack(load("tree", "share-alike", "sa.json"), "main").ok, false);
});

test("lint: a pack that is not an object fails cleanly", () => {
  for (const x of [null, 5, "x", [], {}]) assert.equal(lintPack(x).ok, false);
});

test("policy: every blocked fixture fails lint and cannot be parsed", () => {
  const names = files("blocked");
  assert.ok(names.length >= 16);
  for (const n of names) {
    const j = load("blocked", n);
    const r = lintPack(j);
    assert.equal(r.ok, false, n);
    assert.ok(r.errors.some((e) => /blocked by project policy/.test(e)), n);
    assert.throws(() => parsePack(j), PackError, n);
  }
});

test("policy: covers every area in the brief", () => {
  const covered = new Set(files("blocked").map((n) => n.replace(".json", "")));
  for (const w of ["dpf", "catalyst", "egr", "evap", "o2", "readiness", "mil", "check-engine", "airbag", "abs", "brakes", "steering", "immobiliser", "key", "odometer", "mileage", "speed-limiter"]) {
    assert.ok(covered.has(w), w);
  }
});

test("policy: matches tags and value labels, not just the name", () => {
  const o = (extra: Partial<CodingOption>): CodingOption => ({ id: "x", label: "Harmless", category: "lighting", module: "m", block: { did: 1, length: 1 }, field: { byte_offset: 0, bit_offset: 0, bit_length: 1 }, ...extra }) as CodingOption;
  assert.equal(policyHits(o({})).length, 0);
  assert.ok(policyHits(o({ tags: ["DPF"] })).length > 0);
  assert.ok(policyHits(o({ values: [{ raw: 0, label: "Check engine light off" }] })).length > 0);
  assert.ok(policyHits(o({ label: "Turn off the O2 sensor check" })).length > 0);
  assert.ok(policyHits(o({ label: "Raise the top speed" })).length > 0);
  assert.equal(policyHits(o({ label: "Comfort mode" })).length, 0);
});

test("policy: the built-in demo pack is clean", () => {
  assert.doesNotThrow(() => parsePack(DEMO_PACK));
});

test("policy: seed and key fields are refused", () => {
  const j = structuredClone(load("good", "main-cc0.json")) as { coding: Record<string, unknown>[] };
  j.coding[0]!.seed_key = "00";
  assert.ok(lintPack(j).errors.some((e) => /secret or seed\/key/.test(e)));
});

test("loader: share-alike packs live in their own namespace", () => {
  const { registry, rejected } = loadPackDir(join(FIX, "tree"));
  assert.equal(registry.list("main").length, 1);
  assert.equal(registry.list("share-alike").length, 1);
  const saId = registry.list("share-alike")[0]!.pack_id;
  assert.equal(registry.get("main", saId), undefined);
  assert.ok(registry.get("share-alike", saId));
  const names = rejected.map((r) => r.file.split("/").slice(-1)[0]).sort();
  assert.deepEqual(names, ["bad-blocked.json", "bad-permissive.json", "bad-sa-in-main.json"]);
  assert.ok(rejected.every((r) => r.errors.length > 0));
});

test("loader: a share-alike pack dropped in the main folder is rejected", () => {
  const root = mkdtempSync(join(tmpdir(), "od-packs-"));
  writeFileSync(join(root, "sa.json"), readFileSync(join(FIX, "tree", "share-alike", "sa.json")));
  const { registry, rejected } = loadPackDir(root);
  assert.equal(registry.list("main").length, 0);
  assert.equal(rejected.length, 1);
});

test("loader: a main pack dropped in the share-alike folder is rejected", () => {
  const root = mkdtempSync(join(tmpdir(), "od-packs-"));
  mkdirSync(join(root, "share-alike"));
  writeFileSync(join(root, "share-alike", "m.json"), readFileSync(join(FIX, "good", "main-cc0.json")));
  const { registry, rejected } = loadPackDir(root);
  assert.equal(registry.list("share-alike").length, 0);
  assert.equal(rejected.length, 1);
});

test("loader: broken JSON is rejected, symlinks and non-JSON are skipped, missing folder is empty", () => {
  const root = mkdtempSync(join(tmpdir(), "od-packs-"));
  writeFileSync(join(root, "broken.json"), "{nope");
  writeFileSync(join(root, "notes.txt"), "hi");
  symlinkSync(join(FIX, "good", "main-cc0.json"), join(root, "link.json"));
  const { registry, rejected } = loadPackDir(root);
  assert.equal(registry.list("main").length, 0);
  assert.equal(rejected.length, 1);
  assert.equal(loadPackDir(join(root, "nope")).rejected.length, 0);
});

test("loader: a blocked pack in the folder is rejected, never loaded", () => {
  const root = mkdtempSync(join(tmpdir(), "od-packs-"));
  writeFileSync(join(root, "dpf.json"), readFileSync(join(FIX, "blocked", "dpf.json")));
  const { registry, rejected } = loadPackDir(root);
  assert.equal(registry.list("main").length, 0);
  assert.match(rejected[0]!.errors.join(" "), /blocked by project policy/);
});

test("loader: namespaceOf follows the folder name", () => {
  assert.equal(namespaceOf("/x/packs/share-alike/a.json"), "share-alike");
  assert.equal(namespaceOf("/x/packs/a.json"), "main");
});

test("registry: the same id twice in one namespace is refused, but may exist in both", () => {
  const r = new PackRegistry();
  r.add("main", load("good", "main-cc0.json"));
  assert.throws(() => r.add("main", load("good", "main-cc0.json")), /already loaded/);
  const sa = structuredClone(load("tree", "share-alike", "sa.json")) as { pack_id: string };
  r.add("share-alike", sa);
  assert.equal(r.list("share-alike").length, 1);
});

test("merge: share-alike data is never merged into a main pack, either way round", () => {
  const main = parsePack(load("good", "main-cc0.json")) as Pack;
  const sa = parsePack(load("tree", "share-alike", "sa.json")) as Pack;
  assert.throws(() => mergePacks(main, sa), ShareAlikeError);
  assert.throws(() => mergePacks(sa, main), ShareAlikeError);
});

test("merge: two main packs can be merged", () => {
  const a = parsePack(load("good", "main-cc0.json")) as Pack;
  const b = structuredClone(a);
  b.coding[0]!.id = "another-option";
  b.coding[0]!.field = { byte_offset: 5, bit_offset: 0, bit_length: 2 };
  assert.equal(mergePacks(a, b).coding.length, 2);
});

// --- authoring from a diff ---

function diffOf(before: number[], after: number[], did = 0x3000): DidDiff[] {
  const changes = diffBytes(Uint8Array.from(before), Uint8Array.from(after));
  return [{ did, status: changes.length ? "changed" : "same", lengthA: before.length, lengthB: after.length, changes }];
}

test("author: proposes byte, bit, length and values, and marks the unknown parts", () => {
  const p = packFromDiff(diffOf([0, 0, 0b0100, 0], [0, 0, 0b0110, 0])) as { coding: Record<string, unknown>[] };
  const o = p.coding[0] as Record<string, any>;
  assert.deepEqual(o.field, { byte_offset: 2, bit_offset: 1, bit_length: 1 });
  assert.equal(o.block.did, 0x3000);
  assert.equal(o.block.length, 4);
  assert.deepEqual(o.values.map((v: { raw: number }) => v.raw), [0, 1]);
  assert.ok(Array.isArray(o.unknown_fields) && o.unknown_fields.includes("label"));
  assert.equal(o.label, "TODO_FILL_IN");
});

test("author: the proposal fails lint until a human fills it in", () => {
  const p = packFromDiff(diffOf([0, 1], [0, 3]));
  const r = lintPack(p);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /TODO_FILL_IN/.test(e)));
});

test("author: a filled-in proposal passes lint", () => {
  const p = packFromDiff(diffOf([0, 0, 0, 0], [0, 0, 1, 0])) as any;
  p.pack_id = "mine";
  p.license = "CC0-1.0";
  const o = p.coding[0];
  Object.assign(o, { id: "cabin-light-long", label: "Cabin light stays on longer", category: "lighting", module: "body-example", license: "CC0-1.0" });
  delete o.unknown_fields;
  o.values[0].label = "Short";
  o.values[1].label = "Long";
  o.provenance = { source_type: "owner_capture", capture_id: "cap-7", confidence: "medium", tested_on: [{ date: "2026-11-01", result: "pass", chassis: "EXAMPLE", contributors: ["gh:me"] }] };
  assert.deepEqual(lintPack(p).errors, []);
});

test("author: refuses several changed bytes, but --ignore skips a checksum byte", () => {
  const d = diffOf([0, 0, 0, 0], [0, 1, 0, 9]);
  assert.throws(() => packFromDiff(d), AuthorError);
  const p = packFromDiff(d, { ignore: [3] }) as { coding: { field: { byte_offset: number } }[] };
  assert.equal(p.coding[0]!.field.byte_offset, 1);
});

test("author: refuses an empty diff, a non-list, and backups of different shape", () => {
  assert.throws(() => packFromDiff(diffOf([1, 2], [1, 2])), /no changed block/);
  assert.throws(() => packFromDiff({} as unknown as DidDiff[]), AuthorError);
  const odd: DidDiff[] = [{ did: 0x3000, status: "length_differs", lengthA: 2, lengthB: 3, changes: [] }];
  assert.throws(() => packFromDiff(odd), /do not hold the same blocks/);
});

test("author: with two changed blocks the caller must choose one", () => {
  const a = diffOf([0, 0], [0, 1], 0x3000)[0]!;
  const b = diffOf([0, 0], [1, 0], 0x3001)[0]!;
  assert.throws(() => packFromDiff([a, b]), /--did/);
  const p = packFromDiff([a, b], { did: 0x3001 }) as { coding: { block: { did: number } }[] };
  assert.equal(p.coding[0]!.block.did, 0x3001);
});
