# OSS leverage map: what OpenDiag adopts, wraps, ports or only reads

Facts for GitHub repos (license, stars, last push, archived flag, latest release) were pulled from the GitHub REST API on 2026-11-20 (`api.github.com/repos/<owner>/<repo>`). npm and crates.io versions were pulled from `npm view` and `crates.io/api/v1`. Browser and signing facts were fetched from MDN, tauri.app and signpath.org. Anything not fetched is marked **(unverified)**. Not legal advice; the licence verdicts need a lawyer pass before the first release.

Clean-room rule (from `docs/README.md`): public standards, public docs, owner captures, open source only. No leaked OEM data. A REFERENCE-ONLY verdict means: never copy code, never link, never ship. For GPL/AGPL/NonCommercial projects (EdiabasLib, OpenVehicleDiag, ecu_diagnostics, python-OBD, AndrOBD, ELM327-emulator) read only their README and public docs. Do not read their source files for the area we are implementing (HSFZ, BMW job logic, PID decoding): an implementation written after reading GPL source is open to a derivative-work claim. If someone does read such source for a module family, they log it in `READERS.md` under the tainted-reader rule (data-strategy section 8) and do not author that code or data. Claude sessions are told not to open or recall GPL source for these areas. Not legal advice; counsel confirms at D5.

## 1. Headline findings

| # | Finding | Consequence |
|---|---|---|
| 1 | **OBDb** (github.com/OBDb) holds 897 repos of community signal sets, including 100+ BMW, Mercedes-Benz, MINI, Toyota and Lexus models. Licence CC-BY-SA-4.0. Pushed daily (2026-11-20). | Biggest free data source for live data (UDS 0x22 DIDs, scalings, units). Adopt as a separate share-alike data pack, contribute back. Coverage is uneven (BMW-3-Series 72 KB, Mercedes C-Class 7 KB, Lexus-LS 21 bytes). |
| 2 | No maintained, permissively licensed **TypeScript UDS, ISO-TP or DoIP library** turned up in GitHub searches (best hits: 1-7 stars). | Our `packages/core` is itself the gap-filler. Publish it as standalone npm packages; that is an upstream contribution. |
| 3 | The strong UDS/ISO-TP/ODX libraries are Python (udsoncan, python-can-isotp, odxtools, python-doipclient), all MIT or LGPL. | Port ideas and use them as **test oracles** in CI, not as runtime dependencies. |
| 4 | Every BMW-specific open tool is GPL-3.0 (EdiabasLib, rnd-ash/OpenVehicleDiag, ecu_diagnostics). | Reference-only. Nothing from them enters the tree. |
| 5 | **Ircama/ELM327-emulator** has a CC BY-NC-SA 4.0 LICENSE file (GitHub shows NOASSERTION). Non-commercial clause. | Not usable even as a bundled test tool. Our own simulator (`sim.ts`) stays. |
| 6 | The architecture doc says "Rust core"; the code is TypeScript. Rust is not installed. | Decision D1 below: TypeScript core for the 3-month plan, with a sans-IO boundary so a Rust port stays possible. |

## 2. Decisions per layer

| Layer | Decision | Depend on | Build ourselves | Why |
|---|---|---|---|---|
| CAN frame I/O (Linux) | ADOPT `socketcan` npm (optional adapter) + kernel SocketCAN/vcan | `socketcan` 4.3.2 (MIT) | thin adapter in `transport.ts` | Native addon, Linux only; keep optional. |
| ISO-TP | BUILD (done in `isotp.ts`), PORT edge cases, oracle-test against python-can-isotp | none at runtime | yes | No TS library; spec is paid, behaviour documented by MIT code. |
| UDS | BUILD (done in `uds.ts`), oracle-test against udsoncan; PORT NRC and service tables from automotive_diag (Apache-2.0) | none at runtime | yes | Same. |
| OBD-II | BUILD from public SAE J1979 PID tables (done in `obd.ts`) | none | yes | python-OBD is GPL-2.0, do not touch. |
| DoIP | BUILD (done in `doip.ts`), oracle-test against python-doipclient; PORT state-machine ideas from AVL libdoip (Apache-2.0) | none | yes | No TS library. |
| HSFZ (BMW ENET) | BUILD from owner captures (done in `hsfz.ts`) | none | yes | No permissive open library found (unverified). Only GPL EdiabasLib covers it, so reference-only. |
| ELM327/STN | BUILD (done in `elm327.ts`); read ELMduino (MIT) and SwiftOBD2 (MIT) for clone quirks | none | yes | Quirk lists are the value; port as test cases. |
| Serial/BLE/WiFi/USB: Node and desktop | ADOPT `serialport` 13.0.0, `@stoprocent/noble` 2.8.0, Node `node:net`/`node:dgram` | yes | thin adapters | Mature, MIT. |
| Serial/BLE: browser | ADOPT Web Serial + Web Bluetooth (platform APIs) | browser | adapters | Chromium desktop only; BLE only (no Classic). See section 5. |
| Serial/BLE: mobile | ADOPT Capacitor + `@capacitor-community/bluetooth-le` | yes | adapter | Runs the same TS core in a WebView. Classic-BT ELM327 clones need a custom plugin (risk R3). |
| ODX/PDX | WRAP `odxtools` (MIT) as an offline converter for owner-supplied PDX into our pack format | CLI only, dev/power-user | pack importer | Never bundle OEM ODX. |
| DBC/signals | WRAP `cantools` (MIT) offline DBC to pack converter; use `opendbc` (MIT) per-file after provenance check | CLI only | importer | Signal-level CAN is secondary to diagnostics. |
| Live-data signal definitions | ADOPT OBDb data (CC-BY-SA-4.0) as a separate share-alike pack; map its schema to ours | data only | schema mapper | Largest legal source of per-model DIDs. |
| DTC descriptions | ADOPT `Wal33D/dtc-database` (MIT) as seed after provenance audit; extend with OBDb DTC data and community PRs | data | normaliser | See risk R5: SAE J2012 text. |
| Simulators | BUILD (done: `sim.ts`, `sim-net.ts`); use vcan + can-utils in Linux CI; ICSim for demos | external tools only | yes | ELM327-emulator is non-commercial. |
| GUI/app | ADOPT Electron for desktop, Capacitor for mobile, static PWA for browser | yes | UI | Decision D2. |
| Packaging | ADOPT `electron-builder` 14.7k stars (MIT) | yes | CI config | Free. |
| Signing | Windows: apply to SignPath Foundation (free for OSS per signpath.org). macOS: Apple Developer Program (about 99 USD/yr, estimate, unverified). Data packs: `minisign` (ISC) or `cosign` (Apache-2.0) | yes | release script | Budget small. |
| Test tooling | ADOPT `node:test` (built in), `fast-check` 4.10.3 (MIT), `jazzer.js` (Apache-2.0) for fuzzing parsers | yes | tests | Rust fuzzing (cargo-fuzz) only if Rust returns. |

### D1. Core language: TypeScript now, Rust later only if a gate trips

`docs/design/architecture.md` chose a Rust core with WASM and UniFFI. Reality: Rust is not installed, and 3 months of one-developer work already exist in TypeScript (Phase 0 commit `cf43488`).

| Option | Cost to 3-month goal | Verdict |
|---|---|---|
| A. Keep TypeScript core; Electron + Capacitor + PWA all run it unchanged | Lowest. No rewrite. Contributors need only TS. | **Chosen** |
| B. Rewrite to Rust now (Tauri 2, WASM) | Weeks lost; Tauri BLE plugin for mobile unverified (tauri.app start page lists no BLE plugin) | Rejected for this horizon |
| C. TS now, Rust only for the write/flash safety engine | Possible later; needs sans-IO design | **Escape hatch** |

Conditions that reopen the decision (record in an ADR): a fuzzing campaign finds memory-safety-class bugs the TS runtime cannot prevent (unlikely in a managed language); latency on BLE traffic cannot be met in a WebView; or a funded contributor volunteers to own Rust. Action: update `architecture.md` to say "TypeScript core, sans-IO state machines; Rust optional" and keep all protocol modules free of `node:` imports except in adapter files, so the same code runs in browser, Node and WebView.

### D2. Shell: Electron (desktop) + Capacitor (mobile) + static PWA (browser)

| Shell | Strength | Weakness | Verdict |
|---|---|---|---|
| Electron 45.4.1 (MIT) | Runs Node directly: raw TCP for ENET/DoIP, `serialport`, `noble`, `socketcan`. Same TS core, zero bridges. | 100+ MB installer | **Desktop primary** |
| Tauri 2 (2.12.7, Apache-2.0, 113k stars) | Small installer | Web UI cannot open raw TCP; core would need a sidecar or a Rust rewrite; BLE and mobile plugins not confirmed | Revisit if D1 flips |
| Capacitor (MIT, 17k stars) + bluetooth-le | Same TS in a WebView on Android/iOS | Classic Bluetooth not covered by BLE plugin (unverified); iOS BLE only | **Mobile** |
| PWA with Web Serial/Bluetooth | Zero install, demo and read-only use | Chromium desktop only; no TCP; Web Serial absent on Android Chrome (per architecture.md) | **Browser tier** |

## 3. Candidate register (60 entries)

Columns: Lang, Licence (SPDX per GitHub API unless noted), Stars, Last push (the API field `pushed_at`, 2026-11-20 snapshot), Latest release, Maturity (H = widely used and active, M = usable, L = niche or stale), Compat with Apache-2.0, Verdict. Verdicts: ADOPT, WRAP, EXTEND (fork or contribute upstream), PORT (idea only, rewrite), REF (reference-only).

### 3.1 Protocol stacks (CAN, ISO-TP, UDS, OBD, DoIP)

| # | Project (URL under github.com) | Lang | Licence | Stars | Last push | Release | Mat. | Compat | Verdict and use |
|---|---|---|---|---|---|---|---|---|---|
| 1 | pylessard/python-udsoncan | Python | MIT | 746 | 2026-10-26 | v1.26.1 (2026-06-25) | H | Yes | PORT + test oracle: replay our UDS vectors through it in CI. |
| 2 | pylessard/python-can-isotp | Python | MIT | 316 | 2026-11-10 | not fetched | M | Yes | PORT + oracle for ISO-TP timing and padding edge cases. |
| 3 | hardbyte/python-can | Python | LGPL-3.0 | 1614 | 2026-11-15 | v4.6.1 (2025-08-12) | H | Dependency only | REF; dev-time tool for bench scripts, never linked. |
| 4 | hartkopp/can-isotp | C | NOASSERTION (COPYING says BSD-style, GPL when built in kernel) | 288 | 2023-10-24 | none | M | n/a | REF; use the mainline Linux kernel ISO-TP on Linux (kernel merge since 5.10 per earlier doc, unverified). |
| 5 | linux-can/can-utils | C | BSD-3-Clause + GPL-2.0-only (mixed, LICENSES dir) | 2961 | 2026-10-14 | v2025.01 | H | Process only | WRAP as external CLI in Linux CI (candump, isotpsend, canplayer). Never copy. |
| 6 | secdev/scapy | Python | GPL-2.0 | 12704 | 2026-11-19 | not fetched | H | No (GPL-2) | REF; run as a separate test generator only. Automotive (UDS/DoIP) contrib exists (unverified). |
| 7 | jacobschaer/python-doipclient | Python | MIT | 217 | 2026-11-09 | v1.3.0 (2026-11-09) | M | Yes | PORT + oracle against our DoIP simulator. |
| 8 | AVL-DiTEST-DiagDev/libdoip | C++ | Apache-2.0 | 148 | 2023-12-31 | none | M, stale | Yes | PORT (copy allowed with notice; prefer rewrite) of DoIP state machine. |
| 9 | langroodi/DoIP-Lib | C++ | MIT | 89 | 2023-08-20 | none | L | Yes | PORT; second opinion on routing activation. |
| 10 | openxc/uds-c | C | BSD-3-Clause | 835 | 2021-08-16 | none | L, stale | Yes | PORT; compact request/response structs. |
| 11 | openxc/isotp-c | C | BSD-3-Clause | 364 | 2021-08-16 | none | L, stale | Yes | PORT; flow-control logic. |
| 12 | richClubb/python-uds | Python | MIT | 123 | 2026-06-02 | not fetched | L, **archived** | Yes | REF. |
| 13 | brendan-w/python-OBD | Python | GPL-2.0 | 1334 | 2025-04-07 | not fetched | M | **No** | REF-ONLY. PID tables come from public SAE J1979 summaries instead. |
| 14 | oxibus/automotive_diag | Rust | Apache-2.0 | 104 | 2026-11-09 | crate 0.1.29 (2026-08-19), 235k downloads | M | Yes | PORT constants (service IDs, NRC, session types) into TS with notice; EXTEND upstream (see section 6). |
| 15 | I-CAN-hack/automotive | Rust | MIT | 107 | 2026-11-17 | crate 0.6.0 (2026-11-06) | M | Yes | REF for the Rust escape hatch (D1). |
| 16 | rnd-ash/ecu_diagnostics | Rust | GPL-3.0 | 238 | 2026-08-21 | not fetched | M | **No** | REF-ONLY. |
| 17 | rnd-ash/OpenVehicleDiag | Rust | GPL-3.0 | 1034 | 2025-07-25 | not fetched | M | **No** | REF-ONLY (UX ideas). |
| 18 | marcelbuesing/socketcan-isotp | Rust | none stated | 31 | 2024-06-19 | none | L | **No** (no licence = all rights reserved) | REF-ONLY. |
| 19 | openxc/openxc-python | Python | BSD-3-Clause | 119 | 2022-03-24 | none | L, stale | Yes | REF. |
| 20 | evanshortiss/obd-parser | TS | NOASSERTION | 43 | 2017-10-19 | none | L, stale | Unclear | REF-ONLY (licence unclear). |
| 21 | max-achleitner/klartext-obd | TS | Apache-2.0 | 1 | 2026-11-16 | none | L | Yes | REF; look, do not depend. |
| 22 | edu-amr/elm327 | TS | MIT | 7 | 2026-10-13 | none | L | Yes | REF. |

### 3.2 Adapters, ELM327, J2534

| # | Project | Lang | Licence | Stars | Last push | Release | Mat. | Compat | Verdict and use |
|---|---|---|---|---|---|---|---|---|---|
| 23 | PowerBroker2/ELMduino | C++ | MIT | 949 | 2025-05-20 | not fetched | M | Yes | PORT quirk handling (AT command order, timeouts) into test cases. |
| 24 | kkonteh97/SwiftOBD2 | Swift | MIT | 163 | 2026-01-26 | not fetched | M | Yes | PORT BLE ELM327 quirks for iOS. |
| 25 | fr3ts0n/AndrOBD | Java | GPL-3.0 | 2196 | 2026-11-08 | not fetched | H | **No** | REF-ONLY (UX and PID coverage ideas). |
| 26 | Ircama/ELM327-emulator | Python | CC BY-NC-SA 4.0 (LICENSE text; API says NOASSERTION) | 707 | 2026-09-17 | v4.0.0 (2026-09-17) | H | **No** (NonCommercial) | REF-ONLY. Do not ship or call it from CI that we redistribute. |
| 27 | jakka351/OpenJ2534 | n/a | GPL-3.0 | 443 | 2026-05-19 | not fetched | M | **No** | REF-ONLY for J2534-on-Linux ideas. |
| 28 | commaai/panda | C | MIT | 1708 | 2026-11-19 | not fetched | H | Yes | REF; candidate "Tier 1" CAN adapter and firmware example. WebUSB access unverified. |
| 29 | openvehicles/Open-Vehicle-Monitoring-System-3 | C | NOASSERTION | 880 | 2026-11-15 | not fetched | H | Unclear | REF (EV signal knowledge); check licence files per directory before reading closely. |

### 3.3 Transport access in Node, browser and mobile

| # | Project | Lang | Licence | Stars | Last push | Release | Mat. | Compat | Verdict and use |
|---|---|---|---|---|---|---|---|---|---|
| 30 | serialport/node-serialport | TS | MIT | 5996 | 2026-01-17 | npm 13.0.0 (2025-10-16) | H | Yes | ADOPT for USB-serial and Bluetooth-SPP ports on desktop and CLI. |
| 31 | sebi2k1/node-can (npm `socketcan`) | JS | MIT | 249 | 2026-11-09 | npm 4.3.2 (2026-10-03) | M | Yes | ADOPT as optional Linux SocketCAN adapter. |
| 32 | stoprocent/noble | JS | MIT | 78 | 2026-11-10 | npm 2.8.0 (2026-11-10) | M | Yes | ADOPT for desktop BLE; EXTEND by testing macOS/Windows with real ELM BLE dongles. |
| 33 | abandonware/noble | JS | MIT | 601 | 2025-02-09 | npm 1.9.2-26 (2025-02-09) | M, stale | Yes | Superseded by #32. Do not depend. |
| 34 | node-usb (`usb` npm) | JS | MIT | not fetched | not fetched | npm 3.3.1 (2026-11-18) | H | Yes | ADOPT only if we support raw USB CAN adapters (gs_usb style); defer. |
| 35 | capacitor-community/bluetooth-le | TS | MIT | 358 | 2026-11-18 | not fetched | M | Yes | ADOPT for Android and iOS BLE. |
| 36 | ionic-team/capacitor | TS | MIT | 17123 | 2026-11-19 | not fetched | H | Yes | ADOPT mobile shell. |
| 37 | dotintent/react-native-ble-plx | Java/TS | Apache-2.0 | 3444 | 2026-03-09 | not fetched | H | Yes | Alternative if we leave Capacitor. Not chosen. |
| 38 | google/web-serial-polyfill | TS | Apache-2.0 | 145 | 2023-11-21 | none | L, **archived** | Yes | PORT idea (Web Serial over WebUSB CDC-ACM for Android, unverified). Small enough to own. |
| 39 | whatwg/bluetooth (Web Bluetooth spec) | spec | NOASSERTION | 1445 | 2026-06-03 | n/a | M | n/a | REF. MDN: "Limited availability", secure context, user gesture, BLE only, not in workers. |
| 40 | deviceplug/btleplug | Rust | BSD-3-Clause (LICENSE.md; API shows NOASSERTION) | 1193 | 2026-10-10 | crate 0.13.5 | H | Yes | Only if D1 flips to Rust. |
| 41 | socketcan-rs/socketcan-rs | Rust | MIT | 213 | 2026-09-05 | crate 4.0.0 | M | Yes | Only if D1 flips. |
| 42 | MnlPhlp/tauri-plugin-blec | Rust | Apache-2.0 | 230 | 2026-11-11 | not fetched | M | Yes | Only with Tauri. Mobile support unverified. |

### 3.4 Data formats, signal databases, DTC and PID datasets

| # | Project | Format | Licence | Stars | Last push | Mat. | Compat | Verdict and use |
|---|---|---|---|---|---|---|---|---|
| 43 | **OBDb** (github.com/OBDb, 897 repos) | JSON signal sets (hdr, UDS cmd, signal bit offsets, scaling, units), per model | CC-BY-SA-4.0 | n/a | 2026-11-20 | H, uneven | Data only; share-alike | ADOPT as separate data pack. Keep its licence and attribution; our converted packs stay CC-BY-SA-4.0. EXTEND by contributing. |
| 44 | OBDb/.schemas | JSON schema + Python CLI | CC-BY-SA-4.0 | n/a | 2026-11-15 | M | Data/schema, not code | REF; write our own validator, mirror field names. |
| 45 | mercedes-benz/odxtools | Python lib + CLI | MIT | 332 | 2026-11-17 | 11.7.1 (2026-10-20) | H | Yes | WRAP as offline PDX/ODX to JSON converter for owner-supplied files. EXTEND upstream. |
| 46 | commaai/opendbc | DBC + Python | MIT | 3572 | 2026-11-19 | v0.3.1 | H | Code yes; per-file provenance unverified | ADOPT selectively for Toyota/Lexus signal-level CAN after reading each DBC header. |
| 47 | cantools/cantools | Python lib + CLI | MIT | 2323 | 2026-11-17 | not fetched | H | Yes | WRAP as offline DBC/KCD/ARXML converter. |
| 48 | Wal33D/dtc-database | SQLite | MIT | 64 | 2026-02-16 | M | Yes for code; **text provenance unaudited** | ADOPT as DTC seed (README claims 28,220 codes: 9,415 generic, 18,805 manufacturer; unverified count). |
| 49 | mytrile/obd-trouble-codes | data | MIT | 61 | 2014-05-20 | L, stale | Same provenance caveat | REF; cross-check generic P0xxx wording only. |
| 50 | todrobbins/dtcdb | data | MIT | 34 | 2013-07-30 | L, stale | Same | REF. |
| 51 | dsoprea/DtcLookup | Python | GPL-2.0 | 12 | 2013-09-09 | L | **No** | REF-ONLY. |
| 52 | GENIVI/CANdevStudio | C++/Qt | MPL-2.0 | 1153 | 2025-07-21 | M | File-level copyleft | REF (CAN simulation GUI). |
| 53 | julietkilo/Kayak | Java | LGPL-3.0 | 4 | 2018-11-08 | L, dead | Dependency only | REF; KCD format is the useful part (earlier doc said archived; the API says not archived, last push 2018). |

### 3.5 Analysis, simulators, GUIs, BMW-specific

| # | Project | Lang | Licence | Stars | Last push | Release | Mat. | Compat | Verdict and use |
|---|---|---|---|---|---|---|---|---|---|
| 54 | collin80/SavvyCAN | C++/Qt | MIT | 1933 | 2026-11-17 | V220 (2025-05-09) | H | Yes | Interop: export and import its log formats; recommend as companion. EXTEND upstream with an OpenDiag log reader. |
| 55 | zombieCraig/ICSim | C | GPL-3.0 | 1010 | 2025-09-18 | not fetched | M | Process only | Use as separate demo tool on vcan, never bundled. |
| 56 | uholeschak/EdiabasLib | C# | GPL-3.0 | 964 | 2026-11-19 | binaries_20260607 | H | **No** | REF-ONLY. Its data (SGBD/PRG) is BMW proprietary; we neither run nor ship it. |
| 57 | CaringCaribou/caringcaribou | Python | GPL-3.0 | 974 | 2026-06-12 | not fetched | M | **No** | REF-ONLY; security-research scope is outside our product. |

### 3.6 Packaging, signing, test tooling

| # | Project | Lang | Licence | Stars | Last push | Release | Mat. | Compat | Verdict and use |
|---|---|---|---|---|---|---|---|---|---|
| 58 | electron/electron | C++ | MIT | 124014 | 2026-11-20 | v45.4.1 | H | Yes | ADOPT desktop shell. |
| 59 | electron-userland/electron-builder | TS | MIT | 14722 | 2026-11-19 | not fetched | H | Yes | ADOPT installers and auto-update feed. |
| 60 | tauri-apps/tauri | Rust | Apache-2.0 | 113009 | 2026-11-19 | tauri-v2.12.7 (2026-11-18) | H | Yes | Defer (D2). |
| 61 | tauri-apps/tauri-action | TS | MIT | 1632 | 2026-11-18 | not fetched | M | Yes | Only with Tauri. |
| 62 | sigstore/cosign | Go | Apache-2.0 | 6452 | 2026-11-20 | not fetched | H | Yes | ADOPT option for signing release artifacts and packs. |
| 63 | jedisct1/minisign | C | ISC | 2896 | 2026-10-11 | not fetched | H | Yes | ADOPT for offline-key signing of data packs (simplest). |
| 64 | SignPath Foundation (service, signpath.org) | service | free for OSS ("For OSS projects, our services are free of charge") | n/a | n/a | n/a | n/a | n/a | Apply for Windows code signing. Eligibility rules not stated on the page; check before applying. |
| 65 | dubzzz/fast-check | TS | MIT | not fetched | not fetched | v4.10.3 (2026-11-18) | H | Yes | ADOPT property tests for ISO-TP reassembly and codecs. |
| 66 | CodeIntelligenceTesting/jazzer.js | TS | Apache-2.0 | 368 | 2026-11-09 | not fetched | M | Yes | ADOPT to fuzz every decoder (HSFZ, DoIP, ISO-TP, UDS, ELM replies). |
| 67 | rust-fuzz/cargo-fuzz | Rust | Apache-2.0 | 1937 | 2026-07-20 | not fetched | H | Yes | Only if D1 flips. |
| 68 | vitest-dev/vitest | TS | MIT | 17411 | 2026-11-19 | not fetched | H | Yes | Not needed; `node --test` is enough. |

Count: 68 rows (40+ target met). Rows 34 and 68 ("not fetched" stars) were checked via npm or not at all; treat their popularity as unverified.

## 4. Licence compatibility rules used

| Source licence | What we may do | Notes |
|---|---|---|
| MIT, BSD-3, ISC, Apache-2.0 | Depend, vendor or port with notice | Keep NOTICE entries. |
| LGPL-3.0 | Use as a separately installed tool; do not copy source into tree | python-can, Kayak. |
| GPL-2.0-only, GPL-3.0, AGPL (and -or-later) | Docs-only reference (see rule above). Separate process only if it is a dev tool and not redistributed | Apache ASF compatibility page not fetched, unverified. |
| MPL-2.0 | File-level copyleft; reference only unless we need it | CANdevStudio. |
| CC-BY-SA-4.0 (OBDb) | Ship as data with attribution; adaptations stay CC-BY-SA-4.0; code that reads the data stays Apache-2.0 | Whether data-driven reading triggers share-alike on code is a legal question (unverified). Keep packs in a separate repo and package. |
| CC BY-NC-SA 4.0 | Do not use | Ircama emulator. |
| No licence stated | All rights reserved; do not use | socketcan-isotp (Rust). |

## 5. Platform facts that shape the layer decisions

| Fact | Source |
|---|---|
| Web Serial: "Limited availability", secure context, needs a user gesture; covers USB CDC-ACM and Bluetooth SPP devices; Chrome/Edge only from general knowledge. | https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API (browser table not in fetched text; unverified) |
| Web Bluetooth: experimental, limited availability, BLE/GATT only, secure context, not available in workers. | https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API |
| Tauri lists mobile plugins (biometric, barcode, geolocation, haptics, NFC); no BLE plugin on the start page. | https://v2.tauri.app/start/ |
| SignPath Foundation: free for OSS; cert issued to project; key in SignPath HSM; verifies the binary came from the open repo. | https://signpath.org/ |
| Raw TCP (ENET/DoIP) is not available to web pages; needs Electron/Node or a localhost bridge. | architecture.md section on browser limits |

## 6. Upstream contribution short list

| # | Target | Contribution | Effort | Benefit |
|---|---|---|---|---|
| 1 | OBDb (BMW, MINI, Mercedes, Toyota, Lexus repos) | Add owner-captured UDS 0x22 DIDs; fix thin Mercedes and Lexus repos; add test fixtures | Ongoing, S per PR | Fills our coverage gap, builds goodwill, keeps data share-alike clean. |
| 2 | OBDb/.schemas | Propose DTC and routine fields; TypeScript validator | M | One schema instead of two. |
| 3 | mercedes-benz/odxtools | Issues and PRs from real-PDX edge cases; JSON export for packs | M | Clean importer path. |
| 4 | oxibus/automotive_diag | Missing NRC and session names; OpenDiag cross-test vectors | S | Shared tables. |
| 5 | stoprocent/noble | macOS and Windows reports with real ELM BLE dongles; fixes | M | Reliable desktop BLE. |
| 6 | Wal33D/dtc-database | Provenance column, source citations, removal of text of doubtful origin | M | Safe DTC seed. |
| 7 | collin80/SavvyCAN | OpenDiag trace import/export | M | Analysis tooling for users. |
| 8 | python-udsoncan, python-doipclient | Bug reports with failing wire captures from our fuzz corpus | S | Cross-validation both ways. |
| 9 | opendbc | Toyota/Lexus signal additions from owner logs | S | Only after provenance check. |
| 10 | Our own packages | Publish `@opendiag/isotp`, `uds`, `doip`, `hsfz`, `elm327` on npm under Apache-2.0 | M | Fills the TS gap found in section 1. |

## 7. Gaps with no open source answer (we build)

| Gap | Plan |
|---|---|
| BMW per-ECU job data (replacement for SGBD/PRG) | Owner captures + OBDb + community packs. Never EdiabasLib data. |
| Mercedes per-ECU data | OBDb thin; owner-supplied PDX via odxtools. |
| Security-access seed/key algorithms | Out of scope for core; owner-authorised research only, per `coding-security-failsafe.md`. |
| Maintained HSFZ library | Own `hsfz.ts` plus real-car captures. |
| Permissive ELM327 emulator | Own `sim.ts`. |
| DTC text with clean provenance | Audit Wal33D set; community rewrite of descriptions in original wording. |

## 8. Risks

| ID | Risk | Mitigation |
|---|---|---|
| R1 | OBDb accuracy or provenance of BMW/Mercedes signals (some may derive from proprietary tools; unknown) | Per-file spot checks, keep OBDb pack read-only tier, takedown process. |
| R2 | Share-alike reading of CC-BY-SA data | Separate pack repo; legal review before first release. |
| R3 | Classic-Bluetooth ELM327 clones not reachable from Capacitor BLE plugin (unverified) | Android SPP plugin spike in week 1 of the mobile track; WiFi and BLE adapters first. |
| R4 | `stoprocent/noble` is a young fork (78 stars) | Pin version; abstract BLE behind our transport interface; fallback abandonware/noble. |
| R5 | SAE J2012 code descriptions are SAE copyright; MIT on a list does not clear them | Provenance audit; ship generic wording we rewrite. |
| R6 | Single-maintainer upstreams (udsoncan, odxtools) change or stall | We only use them as oracles and offline tools, not runtime. |

## 9. Sources

- GitHub REST API per repo, fetched 2026-11-20, e.g. https://api.github.com/repos/pylessard/python-udsoncan
- OBDb: https://github.com/OBDb (897 repos by org listing), https://github.com/OBDb/BMW-3-Series, https://github.com/OBDb/Toyota-Corolla, https://github.com/OBDb/.schemas
- npm registry (`npm view`), crates.io API (`https://crates.io/api/v1/crates/<name>`)
- Ircama LICENSE: https://github.com/Ircama/ELM327-emulator/blob/master/LICENSE (header read: Attribution-NonCommercial-ShareAlike 4.0)
- btleplug LICENSE.md: https://github.com/deviceplug/btleplug/blob/master/LICENSE.md (BSD-3-Clause)
- can-utils LICENSES: https://github.com/linux-can/can-utils/tree/master/LICENSES
- https://signpath.org/ , https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API , https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API , https://v2.tauri.app/start/
