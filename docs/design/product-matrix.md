# OpenDiag product matrix: feature parity against paywalled tools

Clean-room note: built from the research notes in `docs/research/` plus public vendor pages. OpenDiag is an independent alternative with original code and original data packs. It copies no incumbent's data, UI or branding. Claims not backed by a source are marked "(unverified)". Not legal advice.

## Summary

- The incumbents split into three groups: OEM workshop suites (ISTA, XENTRY/DAS, Techstream), engineer tools (E-Sys, INPA), and consumer apps (BimmerLink/BimmerCode, OBDeleven, Car Scanner).
- Wire protocols are easy and public. The paywall is per-ECU data, coding maps and OEM authorization (`protocols.md`, `bmw-ista-architecture.md`).
- OpenDiag can reach real parity for reading: identification, fault codes, live data, service resets. These need little proprietary data.
- Coding writes are possible only for a small, community-verified set of BMW modules. Anything needing OEM keys, online tokens or signed flash is out of scope (`coding-security-failsafe.md`, `mercedes-xentry-das.md`).
- The product is a safe engine plus an open, versioned data pack. The pack is the moat and the hard work.

## Incumbent snapshot

| Tool | Maker / class | Cars | What it is | Gate | Source |
|---|---|---|---|---|---|
| ISTA (ISTA/D, ISTA+, ISTA/P) | BMW workshop | E to G series | Guided diagnosis, repair info, programming on top of EDIABAS and PSdZ | BMW licence, huge data install | `bmw-ista-architecture.md` |
| E-Sys | BMW engineering | F/G/I | Read FA/SVT, edit coding values, flash | Needs PSdZ data and CAFD files | `bmw-ista-architecture.md` |
| INPA / Tool32 | BMW engineering | Mostly E-series | Scripted screens and raw jobs over EDIABAS | Needs SGBD/PRG files | `bmw-ista-architecture.md` |
| BimmerLink / BimmerCode | Third-party app | BMW/MINI/Supra 2005+ | Service functions and curated coding catalogue | Paid app, approved adapters | `bimmerlink-bimmercode-analysis.md` |
| XENTRY / DAS | Mercedes workshop | All, newer need login | Guided diagnosis, SCN coding, flash | Personal login, online checks | `mercedes-xentry-das.md` |
| Techstream | Toyota/Lexus dealer | All | Codes, live data, customize, active tests, reflash | TIS subscription | `toyota-lexus-techstream.md` |
| OBDeleven | Third-party app and adapter | VAG first, BMW/Toyota extra | One-click coding presets | Own adapter, credits or plans | `bimmerlink-bimmercode-analysis.md` |
| Car Scanner ELM | Third-party app | Any (generic) | OBD-II dashboards, custom PIDs | Free with paid unlock (unverified) | `bimmerlink-bimmercode-analysis.md` |

## Coverage grid (what each incumbent does today)

Y = yes, p = partial or limited, - = no. Based on the research notes; per-app details marked partial where sources were thin.

| Capability | ISTA | E-Sys | INPA | BimmerLink/Code | XENTRY/DAS | Techstream | OBDeleven | Car Scanner | OpenDiag target |
|---|---|---|---|---|---|---|---|---|---|
| Generic OBD-II (J1979) | Y | - | p | p | Y | Y | p | Y | Phase 0 |
| Full-vehicle DTC read and clear | Y | p | Y | Y | Y | Y | Y | - | Phase 1 (BMW) |
| Live data (non-generic) | Y | - | Y | Y | Y | Y | p | p | Phase 2 |
| Service resets, battery registration | Y | - | p | Y | Y | p | p | - | Phase 2 |
| Coding backup and read | Y | Y | - | Y | Y | p | p | - | Phase 3 |
| Coding write | Y | Y | - | Y | Y (gated) | p | Y | - | Phase 4 (small set) |
| Guided repair procedures and manuals | Y | - | - | - | Y | Y | - | - | Out of scope |
| ECU flash | Y | Y | - | - | Y (gated) | Y (gated) | - | - | Not planned |
| Immobilizer, keys | p | - | - | - | Y (gated) | Y (gated) | - | - | Refused |
| Works on phone | - | - | - | Y | - | - | Y | Y | Phase 2 onward |

## Capability matrix

Difficulty: 1 trivial, 2 routine, 3 needs hardware testing, 4 needs community data and hardware, 5 needs OEM cooperation or likely infeasible.

| Capability | How the incumbent does it | Diff. | Data needed | OpenDiag plan | Phase |
|---|---|---|---|---|---|
| Adapter connection and probing | BimmerCode enforces an approved adapter list; Car Scanner warns about clones. Techstream uses J2534 boxes | 3 | Adapter capability profiles | Probe AT/ST behaviour, score the adapter, store a profile. Tiers 1 to 3 as in `hardware-adapters.md` | 0 |
| Generic OBD-II modes 01 to 0A | Any ELM327 app; formulas are public (RPM = (256A+B)/4) | 1 | SAE J1979 PID tables, own text | Original implementation. No GPL code (python-OBD is GPL-2.0) | 0 |
| Simulator and replay | None consumer-facing; tuners use bench ECUs | 2 | Scripted ECU answers | Fake ECU on virtual CAN with fault injection (power drop, 0x37, 0x72) | 0 |
| ISO-TP, UDS client, NRC handling | ISTA and XENTRY hide it behind job runtimes | 2 | Standards, public summaries | Own client; use udsoncan (MIT) and python-can-isotp (MIT) as dependencies | 1 |
| BMW ENET/HSFZ transport | EDIABAS interface driver; BimmerCode via ENET cable | 3 | Header layout (0x01 request, 0x02 ack), tester address 0xF4 on ENET (0xF1 is the CAN-route tester; corrected 2026-11-20) | Configurable tester address; confirm against a real capture before release | 1 |
| Standard DoIP transport | XENTRY and Techstream on newer cars | 3 | ISO 13400 header (`02 FD`, type, length), routing activation 0x0005 | python-doipclient (MIT) or own; needed for Mercedes and newest Toyota | 1 (BMW if needed), 6 |
| ECU discovery by address scan | ISTA identifies the vehicle then picks per-ECU data | 3 | Candidate address ranges, no static tables | Scan, read 0xF1xx identification DIDs, build per-VIN map | 1 |
| VIN, ECU identification | Standard DID 0xF190 and friends | 1 | Public DID list | Generic UDS identification | 1 |
| Fault read and clear with text | SGBD tables turn DTC bytes to text | 4 | DTC text per ECU | Own descriptions, contributed under open licence, provenance field per entry | 1 |
| Freeze frame and DTC status bits | Standard; Techstream shows all five frames | 2 | Status byte layout (public) | Decode bits 0 to 7 from the standard | 1 |
| Live data (manufacturer DIDs) | ISTA via jobs; INPA screens; Car Scanner custom PIDs | 4 | DID, scaling, unit per ECU and version | Declarative YAML entries, bench-verified, ODX-inspired | 2 |
| CSV logging, dashboards | BimmerLink, Car Scanner | 2 | None | Local log files, export CSV | 2 |
| Service resets (oil, brake pad) | BimmerLink; ISTA service functions | 3 | Routine IDs and conditions | Sandboxed step scripts with preconditions and postconditions | 2 |
| Battery registration | BimmerLink, ISTA | 3 | Routine or write sequence per chassis | Same scripts; only chassis with a bench-verified recipe | 2 |
| Hybrid battery health (Toyota) | Techstream; community Torque PID lists | 3 | Per-generation PIDs, header, formula | Community pack with verification status per entry | 5 |
| Coding read and backup | E-Sys "Read Coding Data"; BimmerCode auto-backup | 3 | Block DID per module | Raw block read, hash, save locally, export bundle | 3 |
| Coding inspect (named options) | CAFD/FDL in E-Sys; curated catalogue in BimmerCode | 5 | Per-module, per-software bit maps | Open option catalogue from owner diffs; unknown module means raw bytes only | 3 |
| Coding write | E-Sys, BimmerCode, OBDeleven | 5 | Verified map, checksum rule, unlock rule | Transaction with backup, diff, journal, read-back, auto-revert (`coding-security-failsafe.md`) | 4 |
| SecurityAccess (0x27) | Per-ECU secret algorithms in tool data | 5 | Secret keys | Pluggable key provider; ship none. Stop at NRC 0x35/0x36 | 4 |
| Mercedes SCN and online coding | XENTRY with personal login and server tokens | 5 | Mercedes server | Not supported; detect NRC 0x33 and say why | 6 |
| ECU flashing | ISTA/P, PSdZ, Techstream, XENTRY Flash | 5 | OEM-signed software | Not planned | None |
| Test plans and repair content | ISTA authored content | 5 | Authored text | Link to public sources; community short guides later | None |
| Immobilizer, airbag, odometer, emissions defeat | Gated or absent | 5 | n/a | Refused in code and docs (`open-source-landscape-and-legal.md`) | None |
| Browser or phone UI | BimmerLink, Car Scanner | 3 | n/a | Web UI over a local bridge first; BLE and Wi-Fi adapters on mobile | 2 |
| Pack distribution and updates | Bundled or server-fetched (unverified) | 2 | Signed packs | Signed releases from GitHub, offline update | 3 |

## Where OpenDiag is different on purpose

| Area | Incumbents | OpenDiag |
|---|---|---|
| Price | Subscription, credits, or one-off paid app | Free, Apache-2.0 code, CC-BY data |
| Data | Closed, vendor-owned | Open packs with per-entry provenance and "tested on" fields |
| Writes | Often one tap | Backup, diff, read-back, revert every time |
| Unknown module | Often hidden or blocked | Read-only with raw bytes shown |
| Cloud | Required for Mercedes and Toyota security | None required |

## Not covered, on purpose

- Guided repair manuals, wiring diagrams, parts catalogues. These are authored content; copying is infringement.
- Anything that bypasses OEM authorization, emissions controls or safety systems.
- Truck protocols (RP1210/J1939). Revisit after Phase 6.

## Open questions

1. Which BMW modules accept coding without an unlock key on F/G series? Needs bench testing (`coding-security-failsafe.md`).
2. Does a real F-series car accept tester address 0xF4 or 0xF1 (`hardware-adapters.md`)? Update 2026-11-20: 0xF4 has three sources for ENET; capture to confirm.
3. Which legal route covers publishing owner-derived option maps? Needs counsel.
4. Phone coding on iOS: BLE and Wi-Fi only, Ethernet needs a dongle (unverified).

## Sources

Internal research (all in `docs/research/`): `bmw-ista-architecture.md`, `bimmerlink-bimmercode-analysis.md`, `coding-security-failsafe.md`, `hardware-adapters.md`, `mercedes-xentry-das.md`, `open-source-landscape-and-legal.md`, `protocols.md`, `toyota-lexus-techstream.md`.

External pages those notes rely on:
- BimmerCode FAQ, manual and adapter list: https://bimmercode.app/faq/ , https://bimmercode.app/manual , https://bimmercode.app/adapters/
- BimmerLink: https://bimmerlink.app
- Mercedes XENTRY Pass Thru EU: https://b2bconnect.mercedes-benz.com/LT/shop/workshop-solutions/xentry-pass-thru-eu
- Techstream known issues: https://one.tis.toyota.com/techInfoPortal/staticcontent/en/techinfo/html/prelogin/tsrss/ts_known_bugs.html
- Scapy HSFZ: https://scapy.readthedocs.io/en/latest/api/scapy.contrib.automotive.bmw.hsfz.html
- odxtools: https://github.com/mercedes-benz/odxtools
- OBDeleven pricing (search summary only; direct fetch failed): https://obdeleven.com/pricing-changes-july-2025
- Car Scanner listing: https://apps.apple.com/app/id6461049378
