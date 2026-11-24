import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BANNER, adapterProblem, run } from "../src/cli.ts";

function capture() {
  const out: string[] = [];
  const err: string[] = [];
  return { out, err, io: { out: (s: string) => out.push(s), err: (s: string) => err.push(s) } };
}

test("cli: says it is a bench tool every time", async () => {
  const c = capture();
  await run(["help"], c.io);
  assert.equal(c.err[0], BANNER);
  assert.match(BANNER, /BENCH TOOL/);
});

test("cli: only the simulator, or an adapter named in the allowlist", () => {
  assert.equal(adapterProblem("sim", undefined), undefined);
  assert.match(adapterProblem("enet:192.168.0.50", undefined) ?? "", /refused/);
  assert.match(adapterProblem("enet:192.168.0.50", "# bench\ndoip:10.0.0.9\n") ?? "", /not in the bench allowlist/);
  assert.equal(adapterProblem("doip:10.0.0.9", "# bench\ndoip:10.0.0.9\n"), undefined);
  assert.match(adapterProblem("elm:192.168.0.10", "doip:10.0.0.9 # elm is not here\n") ?? "", /refused/);
});

test("cli: a real adapter that is not allowlisted is refused before anything connects", async () => {
  const c = capture();
  const code = await run(["apply", "--adapter", "enet:192.168.0.10", "--change", "welcome-light=1"], c.io);
  assert.equal(code, 2);
  assert.match(c.err.join("\n"), /refused/);
});

test("cli: an allowlisted adapter is still not connected in this build", async () => {
  const dir = mkdtempSync(join(tmpdir(), "lab-cli-"));
  try {
    const list = join(dir, "bench.txt");
    writeFileSync(list, "doip:10.0.0.9\n");
    const c = capture();
    const code = await run(["preview", "--adapter", "doip:10.0.0.9", "--bench-allowlist", list, "--change", "welcome-light=1"], c.io);
    assert.equal(code, 2);
    assert.match(c.err.join("\n"), /not wired up/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("cli: preview on the simulator shows the diff and writes nothing", async () => {
  const c = capture();
  assert.equal(await run(["preview", "--change", "welcome-light=1"], c.io), 0);
  assert.match(c.out.join("\n"), /Welcome light on unlock \[T1\]: Off -> On/);
});

test("cli: apply needs a name and --yes, then writes on the simulator and journals it", async () => {
  const dir = mkdtempSync(join(tmpdir(), "lab-cli-"));
  try {
    const journal = join(dir, "j.ndjson");
    const a = capture();
    assert.equal(await run(["apply", "--journal", journal, "--change", "welcome-light=1"], a.io), 2);
    assert.match(a.err.join("\n"), /--consent-by/);
    const b = capture();
    assert.equal(await run(["apply", "--journal", journal, "--consent-by", "bench", "--yes", "--change", "welcome-light=1"], b.io), 0);
    assert.match(b.out.join("\n"), /COMMITTED/);
    const s = capture();
    assert.equal(await run(["status", "--journal", journal], s.io), 0);
    assert.match(s.out.join("\n"), /no unfinished writes/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("cli: a blocked option is refused with the reason", async () => {
  const c = capture();
  assert.equal(await run(["preview", "--change", "dpf-delete=1"], c.io), 2);
  assert.match(c.err.join("\n"), /not in the pack|known/);
});
