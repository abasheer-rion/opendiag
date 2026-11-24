# OpenDiag

A free, open-source alternative to paywalled car diagnostic and coding tools.

OpenDiag aims to read faults, show live sensor data, run service resets and (later, behind strict safety checks) change coding options on BMW, Mercedes-Benz and Toyota/Lexus vehicles, using affordable OBD-II, ENET and DoIP adapters.

> **Status: Phase 0.** Read-only diagnostics work against a built-in simulator and are unit-tested over ELM327, BMW ENET (HSFZ) and DoIP. Not yet verified on a real car. Read-only coding backup, inspect and diff exist; no vehicle-writing code exists. See [docs/](docs/).

## Try it

Needs Node 22.18+ and pnpm.

```bash
pnpm install
pnpm cli dtc                              # simulated car
pnpm cli live --count 3
pnpm cli vin --adapter elm:192.168.0.10:35000      # WiFi ELM327
pnpm cli dtc --adapter enet:169.254.1.1 --target 0x12   # BMW ENET cable
pnpm cli scan --adapter enet:169.254.1.1 --range 0x10-0x7f
```

Read-only coding tools (these refuse to send any write, by construction):

```bash
pnpm cli probe  --adapter enet:169.254.1.1 --target 0x12          # which data identifiers answer
pnpm cli backup --adapter enet:169.254.1.1 --target 0x12 --did 0x3000:64   # hashed, double-read backup
pnpm cli inspect backup.json --pack my-pack.json                  # decode options + checksum status
pnpm cli diff before.json after.json --suggest --ignore 62,63     # change ONE setting in the car's menu between backups
```

Research capture session (reads only, plus an optional one-time clear that refuses unless every safety check passes). Steps for the owner are in [docs/research/sprint/session-runbook.md](docs/research/sprint/session-runbook.md):

```bash
pnpm cli session --adapter enet:HOST --out ~/private/capA --idle 300 --backup
pnpm cli session --adapter enet:HOST --out ~/private/capA-clear --clear-target 0x12 --battery-volts 12.6 --yes-clear   # asks you to type CLEAR
```

`--pack demo` and `--adapter sim:ambient=2` let you try the whole flow on the simulator.

ENET and DoIP framing follow public sources and still need confirming against a real capture. Please report results (never post VINs).

## What this is, and is not

- **Is:** an original, clean-room implementation built from public standards (SAE J1979, ISO 15765, ISO 14229, ISO 13400), public documentation and community-contributed data.
- **Is not:** a copy of ISTA, XENTRY, Techstream, BimmerLink or similar. We do not use leaked software, leaked data files or keygens, and we do not accept contributions that do.
- **Is not** affiliated with BMW, Mercedes-Benz, Toyota or Lexus. Brand names are used only to describe compatibility.

## Goals

1. Generic OBD-II: codes, freeze frame, live data, readiness. Works on any car.
2. Brand-level diagnostics: all modules, fault descriptions, service resets.
3. Read-only coding inspection and full backups.
4. Coding writes, gated by a failsafe pipeline (backup, diff, voltage check, verify, rollback).
5. Open community data packs with provenance and review.

## Safety policy

Some things are blocked by design: airbag/restraint disabling, immobilizer or key bypass, odometer changes, and hiding emissions faults inside the ECU. See [SAFETY.md](SAFETY.md).

## Layout

| Path | Purpose |
|---|---|
| `docs/research/` | Research on protocols, hardware, incumbent tools, security, law |
| `docs/design/` | Architecture, failsafe spec, data schema, roadmap |
| `web/` | Project website (Cloudflare Pages) |
| `.github/workflows/` | CI |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Licensed under [Apache-2.0](LICENSE).
