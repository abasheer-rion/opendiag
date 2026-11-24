import { useState } from "react";
import { SimSession, backupLabel, hexAddr } from "./data/session.ts";
import type { Comparison, ModuleRow } from "./data/session.ts";
import type { Backup } from "./data/core.ts";
import { Header, List, Note, Row, Section, Status, useLoad, usePoll } from "./ui.tsx";

type Screen =
  | { name: "connect" }
  | { name: "vehicle" }
  | { name: "modules" }
  | { name: "faults"; mod: ModuleRow }
  | { name: "settings"; mod: ModuleRow }
  | { name: "live" }
  | { name: "backups" }
  | { name: "compare"; a: Backup; b: Backup };

const AMBIENT = ["Off", "Standard", "Extended"];

export function App() {
  const [session] = useState(() => new SimSession());
  const [stack, setStack] = useState<Screen[]>([{ name: "connect" }]);
  const screen = stack[stack.length - 1] as Screen;
  const go = (s: Screen) => {
    setStack((st) => [...st, s]);
    window.scrollTo(0, 0);
  };
  const back = stack.length > 1 ? () => setStack((st) => st.slice(0, -1)) : undefined;

  return (
    <main>
      {screen.name === "connect" && <Connect go={go} />}
      {screen.name === "vehicle" && <Vehicle s={session} go={go} back={back} />}
      {screen.name === "modules" && <Modules s={session} go={go} back={back} />}
      {screen.name === "faults" && <Faults s={session} mod={screen.mod} go={go} back={back} />}
      {screen.name === "settings" && <Settings s={session} mod={screen.mod} back={back} />}
      {screen.name === "live" && <Live s={session} back={back} />}
      {screen.name === "backups" && <Backups s={session} go={go} back={back} />}
      {screen.name === "compare" && <Compare s={session} a={screen.a} b={screen.b} back={back} />}
    </main>
  );
}

interface Nav {
  go: (s: Screen) => void;
  back: (() => void) | undefined;
}

function Connect({ go }: Pick<Nav, "go">) {
  return (
    <>
      <Header title="OpenDiag" />
      <Section title="Adapter" />
      <List>
        <Row label="Simulator" value="ready" sub="Pretend car for trying things" onOpen={() => go({ name: "vehicle" })} />
        <Row label="Bluetooth adapter" value="not available" sub="Not available in the browser build" />
        <Row label="WiFi ENET" value="not available" sub="Not available in the browser build" />
      </List>
      <Note>Pick an adapter. Nothing is sent to the car until you open a screen that reads.</Note>
    </>
  );
}

function Vehicle({ s, go, back }: { s: SimSession } & Nav) {
  const vin = useLoad(() => s.readVin(), [s]);
  return (
    <>
      <Header title="Vehicle" onBack={back} />
      <Section title="Car" />
      <List>
        <Row label="VIN" value={vin.error ? "unreadable" : (vin.data ?? "...")} />
        <Row label="Adapter" value={s.adapter} />
      </List>
      <Section title="Read" />
      <List>
        <Row label="Modules and fault codes" onOpen={() => go({ name: "modules" })} />
        <Row label="Live data" onOpen={() => go({ name: "live" })} />
        <Row label="Backups" value={`${s.backups.length} saved`} onOpen={() => go({ name: "backups" })} />
      </List>
    </>
  );
}

function Modules({ s, go, back }: { s: SimSession } & Nav) {
  const mods = useLoad(() => s.scan(), [s]);
  return (
    <>
      <Header title="Modules" onBack={back} />
      <Status s={mods}>
        {(rows) => (
          <>
            <List>
              {rows.map((m) => (
                <Row
                  key={m.address}
                  label={m.name}
                  sub={hexAddr(m.address)}
                  value={m.faultCount ? <span className="bad">{m.faultCount} faults</span> : "OK"}
                  onOpen={() => go({ name: "faults", mod: m })}
                />
              ))}
            </List>
            <Note>{rows.length} modules answered. Open one to see its fault codes and settings.</Note>
          </>
        )}
      </Status>
    </>
  );
}

function Faults({ s, mod, go, back }: { s: SimSession; mod: ModuleRow } & Nav) {
  const faults = useLoad(() => s.faults(mod.address), [s, mod]);
  const reason = "Clearing faults is not available in this read-only build.";
  return (
    <>
      <Header title={mod.name} onBack={back} />
      <Section title="Fault codes" />
      <Status s={faults}>
        {(rows) => (
          <List>
            {rows.length === 0 && <Row label="No fault codes" />}
            {rows.map((f) => (
              <Row
                key={f.code}
                label={`${f.code}  ${f.info?.meaning ?? "No description yet"}`}
                value={f.kind}
                sub={
                  f.info
                    ? `Meaning in our own words (${f.info.confidence} confidence). Generic code, may differ by make.`
                    : "Not in the starter dictionary."
                }
              />
            ))}
          </List>
        )}
      </Status>
      <Section title="Settings" />
      <List>
        <Row label="Read settings (coding)" sub="Read only." onOpen={() => go({ name: "settings", mod })} />
      </List>
      <button className="act" disabled aria-describedby="clear-reason">Clear faults</button>
      <Note><span id="clear-reason">{reason}</span></Note>
    </>
  );
}

function Settings({ s, mod, back }: { s: SimSession; mod: ModuleRow; back: Nav["back"] }) {
  const rows = useLoad(() => s.settings(mod.address), [s, mod]);
  return (
    <>
      <Header title="Settings" onBack={back} />
      <Status s={rows}>
        {(r) =>
          r === null ? (
            <Note>This module has no settings we can read.</Note>
          ) : (
            <>
              <Section title="Current values (read only)" />
              <List>
                {r.map((x) => (
                  <Row
                    key={x.label}
                    label={x.label}
                    value={x.value}
                    sub={x.checksumOk === undefined ? undefined : x.checksumOk ? "Checksum ok" : "Checksum does not match"}
                  />
                ))}
              </List>
              <Note>Decoded with the built-in demo pack. Its offsets are made up for the simulator and mean nothing on a real car. Changing settings is not part of this build.</Note>
            </>
          )
        }
      </Status>
    </>
  );
}

function Live({ s, back }: { s: SimSession; back: Nav["back"] }) {
  const live = usePoll(() => s.live(), 500);
  return (
    <>
      <Header title="Live data" onBack={back} />
      <Status s={live}>
        {(rows) => (
          <List>
            {rows.map((r) => (
              <Row key={r.name} label={r.name} value={r.value} />
            ))}
          </List>
        )}
      </Status>
      <Note>Plain numbers. Reads twice a second.</Note>
    </>
  );
}

function Backups({ s, go, back }: { s: SimSession } & Nav) {
  const [, redraw] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [err, setErr] = useState<string>();
  const toggle = (i: number) => setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i].slice(-2)));
  const make = async () => {
    try {
      setErr(undefined);
      await s.makeBackup();
      redraw((n) => n + 1);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };
  const [ia, ib] = picked;
  const a = ia === undefined ? undefined : s.backups[ia];
  const b = ib === undefined ? undefined : s.backups[ib];
  const nextAmbient = (s.ambientValue + 1) % AMBIENT.length;
  return (
    <>
      <Header title="Backups" onBack={back} />
      <List>
        {s.backups.length === 0 && <Row label="No backups yet" />}
        {s.backups.map((x, i) => (
          <label className="row" key={x.txn_id}>
            <input type="checkbox" checked={picked.includes(i)} onChange={() => toggle(i)} />
            <div className="l">
              {backupLabel(x)}
              <div className="sub">{x.verified ? "Verified: read twice, hash matches" : "Not verified"}</div>
            </div>
          </label>
        ))}
      </List>
      <button className="act" onClick={make}>Make new backup</button>
      <button className="act" disabled={!(a && b)} onClick={() => a && b && go({ name: "compare", a, b })}>
        Compare the two ticked backups
      </button>
      {err && <p className="note bad" role="alert">{err}</p>}
      <Section title="Simulator only" />
      <List>
        <Row
          label="Pretend ambient light was changed in the car's own menu"
          sub={`Now: ${AMBIENT[s.ambientValue]}. Tap to set ${AMBIENT[nextAmbient]}, then make another backup to compare.`}
          onOpen={() => {
            s.simulateAmbient(nextAmbient);
            redraw((n) => n + 1);
          }}
        />
      </List>
      <Note>Backups live in this page only and are lost when you reload.</Note>
    </>
  );
}

const h2 = (n: number) => n.toString(16).toUpperCase().padStart(2, "0");

function diffText(c: Comparison): string {
  return c.diffs
    .map((d) => {
      const head = `Block 0x${d.did.toString(16).toUpperCase()}`;
      if (d.status === "same") return `${head}: identical`;
      if (d.status !== "changed") return `${head}: ${d.status.replace(/_/g, " ")}`;
      const rows = d.changes.map((x) => `  ${String(x.offset).padEnd(8)}${h2(x.before)}   ${h2(x.after)}`);
      return [`${head} (${d.lengthA} bytes)`, "", "  offset  was  now", ...rows, "", `${d.changes.length} bytes differ.`].join("\n");
    })
    .join("\n\n");
}

function Compare({ s, a, b, back }: { s: SimSession; a: Backup; b: Backup; back: Nav["back"] }) {
  const c = s.compare(a, b);
  return (
    <>
      <Header title="Compare" onBack={back} />
      <Section title="Settings that changed" />
      <List>
        {c.settings.length === 0 && <Row label="No settings changed" />}
        {c.settings.map((x) => (
          <Row key={x.label} label={x.label} value={`${x.before} > ${x.after}`} />
        ))}
      </List>
      <Section title="Bytes" />
      <pre>{diffText(c)}</pre>
    </>
  );
}
