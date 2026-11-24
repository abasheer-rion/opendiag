import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ClearingClient,
  DiagClient,
  DoipTransport,
  Elm327Transport,
  HsfzTransport,
  NegativeResponse,
  SimElm,
  SimTransport,
  SimVehicle,
  demoVehicle,
  startSimDoipServer,
  startSimHsfzServer,
} from "../src/index.ts";

const VIN = "WBA00000000000001";

test("simulator: VIN, DTCs, PIDs, clear", async () => {
  const c = new ClearingClient(new SimTransport());
  assert.equal(await c.readVinObd(), VIN);
  assert.deepEqual(await c.readObdDtcs(), { stored: ["P0301", "P0171"], pending: ["P0301", "P0171"], permanent: ["P0301", "P0171"] });
  assert.equal((await c.readPid(0x0c))?.value, 1726);
  assert.ok((await c.supportedPids()).includes(0x0c));
  await c.clearObdDtcs();
  assert.deepEqual((await c.readObdDtcs()).stored, []);
});

test("simulator: UDS DTCs and scan", async () => {
  const c = new DiagClient(new SimTransport());
  const dtcs = await c.readUdsDtcs(0x12);
  assert.deepEqual(dtcs.map((d) => d.code), ["P0301", "P0171"]);
  assert.equal(await c.readVinUds(0x12), VIN);
  assert.deepEqual(await c.scanUds([0x10, 0x12, 0x40, 0x7f]), [0x12, 0x40]);
});

test("simulator: unsupported DID gives a negative response", async () => {
  const c = new DiagClient(new SimTransport(new SimVehicle().add(0x12, {})));
  await assert.rejects(() => c.readVinUds(0x12), (e: unknown) => e instanceof NegativeResponse && e.nrc === 0x31);
});

test("ELM327: init, header switch, multi-line VIN, NO DATA", async () => {
  const t = new Elm327Transport(new SimElm(demoVehicle()));
  await t.open();
  assert.match(t.banner, /ELM327/);
  const c = new DiagClient(t);
  assert.equal(await c.readVinObd(0x7e0), VIN);
  assert.deepEqual((await c.readObdDtcs(0x7e0)).stored, ["P0301", "P0171"]);
  await assert.rejects(() => c.readVinObd(0x7e1), /NO DATA/);
  assert.equal((await c.readPid(0x05, 0x7e0))?.value, 83);
});

test("ENET/HSFZ transport against fake gateway, with response-pending", async () => {
  const srv = await startSimHsfzServer(demoVehicle(), { pendingFirst: true });
  const t = new HsfzTransport({ host: "127.0.0.1", port: srv.port });
  await t.open();
  try {
    const c = new DiagClient(t);
    assert.equal(await c.readVinUds(0x12), VIN);
    assert.deepEqual((await c.readUdsDtcs(0x12)).map((d) => d.raw), ["030100", "017100"]);
    assert.deepEqual(await c.scanUds([0x99, 0x12]), [0x12]);
  } finally {
    await t.close();
    await srv.close();
  }
});

test("DoIP transport: routing activation then diagnostics", async () => {
  const srv = await startSimDoipServer(demoVehicle());
  const t = new DoipTransport({ host: "127.0.0.1", port: srv.port });
  await t.open();
  try {
    const c = new ClearingClient(t);
    assert.equal(await c.readVinUds(0x12), VIN);
    await c.clearUdsDtcs(0x12);
    assert.deepEqual(await c.readUdsDtcs(0x12), []);
  } finally {
    await t.close();
    await srv.close();
  }
});

test("the plain client has no clear methods", () => {
  const c = new DiagClient(new SimTransport()) as unknown as Record<string, unknown>;
  assert.equal(c["clearObdDtcs"], undefined);
  assert.equal(c["clearUdsDtcs"], undefined);
});
