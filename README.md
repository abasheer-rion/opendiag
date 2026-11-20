# OpenDiag

A free, open-source alternative to paywalled car diagnostic and coding tools.

OpenDiag aims to read faults, show live sensor data, run service resets and (later, behind strict safety checks) change coding options on BMW, Mercedes-Benz and Toyota/Lexus vehicles, using affordable OBD-II, ENET and DoIP adapters.

> **Status: Phase 0 (research and design).** No vehicle-writing code exists yet. See [docs/](docs/).

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
