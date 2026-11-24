import { test } from "node:test";
import assert from "node:assert/strict";
import type { CodingOption } from "../../core/src/index.ts";
import { LAB_PACK, blockedWord, tierProblem } from "../src/index.ts";

const opt = (o: Record<string, unknown>): CodingOption => ({ ...LAB_PACK.coding[0], ...o }) as CodingOption;

test("policy: the simulator options are clear", () => {
  for (const o of LAB_PACK.coding) assert.equal(blockedWord(o), undefined, o.id);
});

test("policy: emissions and check-engine options are blocked by id, label, category, module or tag", () => {
  assert.equal(blockedWord(opt({ id: "dpf-off" })), "dpf");
  assert.equal(blockedWord(opt({ label: "Turn off the EGR valve" })), "egr");
  assert.equal(blockedWord(opt({ category: "emissions" })), "emissions");
  assert.equal(blockedWord(opt({ module: "catalyst-ctrl" })), "catalyst");
  assert.equal(blockedWord(opt({ tags: ["readiness"] })), "readiness");
  assert.equal(blockedWord(opt({ label: "Hide the check engine light" })), "check_engine");
  assert.equal(blockedWord(opt({ id: "MIL-off" })), "mil");
});

test("policy: matching is by whole word, case-insensitive, and the list fails closed", () => {
  assert.equal(blockedWord(opt({ label: "Familiar welcome" })), undefined, "'mil' inside 'familiar' is not a hit");
  assert.equal(blockedWord(opt({ label: "ABS light on start" })), "abs");
});

test("policy: tiers", () => {
  assert.equal(tierProblem(opt({ risk_tier: "T1" }), "T1"), undefined);
  assert.equal(tierProblem(opt({ risk_tier: "GREEN" }), "T1"), undefined);
  assert.match(tierProblem(opt({ risk_tier: "T2" }), "T1") ?? "", /above/);
  assert.match(tierProblem(opt({ risk_tier: "AMBER" }), "T1") ?? "", /above/);
  assert.equal(tierProblem(opt({ risk_tier: "AMBER" }), "T2"), undefined);
  assert.match(tierProblem(opt({ risk_tier: "T0" }), "T3") ?? "", /read-only/);
  assert.match(tierProblem(opt({ risk_tier: undefined }), "T3") ?? "", /no risk tier/);
});
