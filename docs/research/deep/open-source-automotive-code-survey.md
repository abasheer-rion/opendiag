# Open-source automotive diagnostic code: a GitHub-scale survey for OpenDiag

Retrieved 2026-11-20. Numbers in square brackets point to the Source ledger at the end. Stars, licences and last-push dates come from the GitHub REST API [89] unless a row says otherwise, and they will drift.

**Method note, read first.** The web-search quota ran out partway through this run, so discovery did not use keyword searches. I used three substitutes instead:

- GitHub topic pages (doip, uds, elm327, hsfz, bmw-diagnostics, obd2 filtered to TypeScript) [56-58, 66-68].
- Organisation repository listings (Mercedes-Benz, Eclipse OpenSOVD, COVESA, comma.ai, OBDb) [82, 84-87].
- Awesome-list curation [72] plus repositories I already knew by name.

Topic pages only show the first 20 entries, so coverage of TypeScript, Go and Java is incomplete. Treat "no library found" as "not found by this method". No GPL or non-commercial source code was read, only READMEs and file listings. No proprietary data was opened.

## Summary

- **The closest existing code to OpenDiag is small, new and TypeScript.** Svietlik (MIT) speaks BMW HSFZ for F-series and DoIP for G-series, then UDS. Its core has no Node imports and the caller supplies the socket [59]. It has 23 stars and 15 commits, so it is an example to learn from, not a dependency to trust.
- **Boostline (MIT, TypeScript/Electron/Capacitor) already logs BMW engines over ENET.** It lists the MHD WiFi adapter as confirmed and the bootmod3 WiFi adapter as supported, and its UDS client is read-only by design with an allowlist [75]. It is the nearest product overlap with the owner's own setup.
- **Every careful newcomer project enforces read-only at the code level.** Klartext-obd, Boostline, svietlik, polestar-diag and headless-ista all do [59, 73, 75, 76, 80]. This is now an observable community norm that OpenDiag should match or exceed.
- **There is no general-purpose TypeScript UDS or ISO-TP library.** The mature ones are Python (udsoncan, can-isotp, doipclient), C (iso14229, uds-c) and Rust (I-CAN-hack/automotive, ecu_diagnostics under GPL). OpenDiag will likely write its own TypeScript UDS core, using udsoncan's design and timing model as the reference [3, 4, 48, 49].
- **OBDb is the biggest reusable signal database for UDS-style reads.** About 897 vehicle repos exist, 163 of them named BMW, Toyota, Lexus or Mercedes [82]. It is licensed CC-BY-SA-4.0, which has share-alike consequences for an Apache-2.0 project [1, 26].
- **BMW coverage in OBDb is uneven.** Counts from the signal files [81]: BMW 3 Series has 122 command blocks and 243 signals. BMW M3 has 92 and 168. BMW i4 has 2 and 3. Toyota Camry has 217 and 584. Mercedes C-Class has 17 and 27.
- **Opendbc (MIT) has BMW, Mercedes and Toyota DBC files, but they describe broadcast CAN traffic, not diagnostic reads.** The BMW file is named for E9x/E8x, the Mercedes file for a 2010 E350, and there are several Toyota files [83].
- **Wireshark already ships dissectors for ISO-TP, UDS, DoIP and HSFZ.** The field references show HSFZ from Wireshark 4.2.0 [17-20]. No BMW-specific extension plugin turned up. Wireshark is a free debugging aid for us, not something to rebuild.
- **Copyleft dominates the app layer.** AndrOBD, OBDium, ReDrive, EdiabasLib, python-OBD, OpenVehicleDiag and ecu_diagnostics are all GPL [9-12, 32, 69, 71]. Permissive mobile code exists mainly as libraries: SwiftOBD2, LTSupportAutomotive, kotlin-obd-api and edu-amr/elm327 [13, 14, 37, 78].
- **Test doubles are an open gap and an opportunity.** The best ELM327 emulator carries a non-commercial licence [15, 88]. The permissive options are young: elmulator (BLE and TCP, scenario JSON, CI harness) and doip-sim-ecu-dsl [61, 79]. The BMW simulator "fake-car" needs the user's own proprietary data and has a restrictive licence [60].

## What I found

### 1. UDS, ISO-TP and DoIP libraries by language

**Python (the reference tier)**

- **python-udsoncan** (MIT, 746 stars, last push 2026-10-26) implements ISO 14229 as a client. It takes a pluggable connection object and a configuration with data-identifier codecs [3].
  - The docs list timing settings: p2 default 1 s, p2* default 5 s, an overall request timeout of 5 s, and an optional use of server-advertised timing [49].
  - A callback fires on every "response pending" reply (NRC 0x78).
  - Security access is a user-supplied callback that receives level, seed and parameters and returns the key, so the library itself carries no algorithm [49]. That is the right place for the line OpenDiag should hold.
  - Standard version can be 2006, 2013 or 2020, default 2020. Services listed include session control, ECU reset, read and write by identifier, read DTC information, routine control, I/O control, communication control, request download/upload and transfer exit [49].
- **python-can-isotp** (MIT, 316 stars, push 2026-11-10) offers a pure user-space stack and a wrapper over the Linux kernel ISO-TP socket [4]. The docs expose the parameter set a serious implementation needs [48]:
  - Flow control: stmin, block size, wait-frame limit.
  - Framing: padding, tx data length 8 to 64, maximum frame size 4095 by default.
  - Timers: flow-control and consecutive-frame timeouts, both 1000 ms by default.
  - Addressing: physical versus functional.
  - Modes: listen-only (passive), blocking send, rate limiting.
- **python-doipclient** (MIT, 217 stars, push 2026-11-09) covers discovery (wait for the UDP announcement or send a request), routing activation with selectable type, and raw diagnostic send and receive [5, 50]. It plugs into udsoncan as a connection. Two version facts:
  - The README says it implements "the majority" of ISO 13400 (2019).
  - The docs say the protocol version defaults to 2, the 2012 revision [5, 50].
- **mdabrowski1990/uds** (MIT, 153 stars) claims one UDS API over CAN, Ethernet, LIN, FlexRay and K-Line. The README is vague on what is finished [70].
- **odxtools** (Mercedes-Benz, MIT, 332 stars, push 2026-11-17) parses ODX/PDX diagnostic databases and encodes and decodes requests and responses [6]. It matters for the Mercedes phase. It does not help with BMW's own description format (see section 6).

**C and C++**

- **iso14229** (MIT, 380 stars, push 2026-09-29) is a UDS server and client in two files with no heap allocation. It brings its own ISO-TP, runs on ESP32, STM32, Zephyr and others, and is still version 0.x [7]. The README cites a 2024 SAE paper comparing open-source UDS stacks by fuzzing. I did not read that paper.
- **uds-c and isotp-c** (BSD-3, Ford copyright, 835 and 364 stars) were last pushed in August 2021 [30]. Treat as stale. Their design is dependency-injected: you hand in a CAN send shim and feed received frames back.
- **DoIP-Lib** (MIT, 89 stars) is serialisation-only, C++14, last push 2023 [62].
- **diag-client-lib** (MPL-2.0, 69 stars) is archived [89].

**Rust**

- **I-CAN-hack/automotive** (MIT, 107 stars, push 2026-11-17) is the most complete permissive stack I found [65]. It has async CAN, ISO-TP, DoIP, UDS, XCP and CCP, with adapters for SocketCAN, comma panda, PEAK, J2534 and Vector, plus Python bindings. It shows a DoIP VIN read example.
- **doip-codec** (MIT, 12 stars, v1.0.0) is a Tokio encoder and decoder for DoIP [39].
- **ecu_diagnostics** is GPL-3.0 and covers UDS, KWP2000, J2534, SocketCAN and others; DoIP is "in progress" [9]. README only.
- **can-dbc** and **dbc-codegen** (Apache-2.0/MIT, 114 and 81 stars) parse DBC and generate typed structs, with range-checked setters in the generated code [40, 51].
- **socketcan-rs** is MIT (213 stars) [89]. **tokio-socketcan-isotp** is a Mercedes-Benz fork that warns about a write-path busy-wait on some kernels [36].

**Go, Java, Kotlin, Swift**

- **Go:** can-go (MIT, 241 stars) does SocketCAN and DBC code generation. The README does not mention ISO-TP [24]. elmobd (MIT, 251 stars) is ELM327-only, v0.8.0, last push 2024. It does sensor reads only; trouble codes are listed as not implemented [38]. I found no Go UDS or DoIP library.
- **Kotlin/Java:**
  - doip-sim-ecu-dsl (Apache-2.0, Kotlin) is a simulator DSL, not a client [61].
  - Eclipse's odx-converter is Kotlin [46].
  - kotlin-obd-api (Apache-2.0, 237 stars, push 2026-11-06) is the maintained OBD-II option [37].
  - pires/obd-java-api and android-obd-reader are archived since 2017 [45, 89].
  - I found no Java or Kotlin UDS client library.
- **Swift/Objective-C:**
  - SwiftOBD2 (MIT, 163 stars, push 2026-01-26) targets ELM327 over Bluetooth LE and WiFi, with a built-in emulator [13].
  - LTSupportAutomotive (MIT, 256 stars, push 2024-07) bridges BLE characteristics to streams [14].
  - Its author reports that planned UDS support "proved unworkable", and development stopped there [14]. That is a cautionary single-source data point about UDS over cheap ELM327 adapters.
- **TypeScript:** see section 2 and section 3. The notable thing is the absence of a standalone UDS or ISO-TP package.

**Standards direction (Eclipse OpenSOVD)**

- OpenSOVD implements ISO 17978 (SOVD), a REST-style successor to UDS [8]. The pieces:
  - Core server, client and gateway, in Rust [53].
  - The Classic Diagnostic Adapter: SOVD REST to UDS over DoIP, driven by per-ECU ODX-derived MDD files, with a Docker integration-test setup including an ECU simulator [33].
  - UDS2SOVD proxy, which has 5 commits [35].
  - ODX-to-MDD converter, in Kotlin. It excludes the ODX schemas "for copyright reasons" [46].
- All Apache-2.0 and early. The core README says vendor version 0.1.1 with no releases [53].
- Mercedes-Benz's ARDEP (Apache-2.0, 588 stars) is a Zephyr-based board and framework with UDS-based firmware update, aimed at embedded developers [34].

### 2. ELM327 over BLE, serial and TCP

| Library | Licence | Transports (per README) | Notes |
|---|---|---|---|
| edu-amr/elm327 (TS) | MIT | Serial, WiFi TCP, Web Bluetooth LE, simulator | v2.1, 7 stars, 105 commits. Mode 01 only (67 PIDs). Auto-reconnect with backoff [78] |
| evanshortiss/obd-parser (TS) | unclear | Serial only | Last push 2017, four PIDs [77] |
| node-bluetooth-obd (JS) | Apache-2.0 | Classic Bluetooth serial | Last push 2022. No BLE [16] |
| kotlin-obd-api | Apache-2.0 | Any InputStream/OutputStream | Mutex-guarded command channel, adaptive timing, retries [37] |
| SwiftOBD2 | MIT | BLE and WiFi | Combine publishers, demo mode [13] |
| LTSupportAutomotive | MIT | BLE bridged to streams | Notes that classic Bluetooth does not work on iOS except MFi devices [14] |
| ELMduino (Arduino) | MIT | Classic Bluetooth, serial | Non-blocking state machine. Warns not to query more than one PID at a time [55] |
| AndrOBD (GPL-3.0) | GPL | Bluetooth, USB, WiFi; BLE not mentioned | 2.2k stars, push 2026-11-08. README only [11] |
| python-OBD (GPL-2.0) | GPL | USB and RF serial | Last push 2025-04 [32] |

Two independent sources agree that classic Bluetooth adapters do not work on iPhone: LTSupportAutomotive [14] and openbimmer [74]. Openbimmer names the OBDLink CX among adapters that work, because it uses BLE [74]. That matches the owner's hardware.

Two practical hints came out of the READMEs:

- Klartext-obd notes that one BLE adapter (Carly) accepts a single connection, so the vendor phone app must be closed [80].
- ELM327-emulator's feature list includes strict adapter timing, latency injection and "NO DATA" overrides [15]. These are the failure modes a transport layer must tolerate.

### 3. BMW-specific open code (new finding)

This is the most relevant cluster, and it is all recent.

- **svietlik** [59] (MIT, TypeScript, Node 22.6+, zero runtime dependencies):
  - HSFZ for F-series and DoIP for G-series to the gateway, then UDS to modules. It names UDP 6811 for HSFZ discovery and UDP 13400 for DoIP; I did not check the HSFZ port against another source.
  - A `guard()` wrapper allows only reads and a known set of light commands, and only to modules that identified themselves.
  - The author notes that an address alone does not prove identity: a G-series body controller can answer at the address an F-series module uses [59]. That matters for any "which car am I connected to" logic.
  - Tested on one F82 M4 LCI. G-series scanning works, light control does not. E-series is unsupported. ELM327 adapters "do not work" for this path.
  - Documentation lives in PROTOCOL.md, which I did not fetch. Fetch it next.
- **Boostline** [75] (MIT):
  - Logs BMW engines (B38, B48, B58, S58, S55, N63, S63) and produces road-dyno and drag-timer estimates.
  - Transports: ENET cable, MHD WiFi adapter (confirmed), bootmod3 WiFi adapter (supported). K+DCAN and ELM327 are not yet supported.
  - Full BMW channels need a one-time import of engine-control data from a third-party repository, which Boostline does not bundle. I did not identify that repository and did not open it. This is a design lesson: keep the proprietary-adjacent data out of the repo and out of the installer.
  - Electron app plus a Capacitor iOS app; 35 commits.
  - It states it is not affiliated with bootmod3, MHD or BMW.
- **openbimmer** [74] (MIT, React Native/Expo, 4 stars, 8 commits):
  - Live gauges and logging for N54, N55, B58, S55, N13, S58 and S63. Fault codes can be read and cleared.
  - Standard OBD-II (J1979) over BLE ELM327 only, no UDS identifiers, no ENET.
- **headless-ista** [76] (licence field not machine-readable; README says MIT):
  - An MCP server that lets an AI agent operate BMW's ISTA+ application on the user's own Windows laptop through UI automation.
  - Reads and navigation are free. Any write needs typed user approval, and input tools are only registered when an environment flag is set.
  - It ships no BMW software or data.
  - It removed its E-Sys coding feature from the main branch.
  - Relevant as a pattern for agent-assisted diagnosis with a human gate. It also shows demand for guided repair flows.
- **fake-car** [60] (custom licence: free to use, no sharing of modified versions; 13 stars):
  - A Windows simulator of a BMW gateway that E-Sys connects to at tcp://127.0.0.1:6801, with a "practice mode" that injects faults such as erased coding data, silent modules, refused writes, dropped connection and low battery.
  - It builds its cars from the user's own PSdZData, so it only works for people who already hold BMW's proprietary files.
  - Do not depend on it. Do copy the idea of a fault-injection practice mode, built from our own mock data.
- **EdiabasLib** [12] (GPL-3.0, 964 stars, last push today): a .NET reimplementation of the EDIABAS job interpreter. It reads BMW's proprietary description files and powers the Deep OBD Android app. Adapter notes: ENET WiFi for F-series, plus specific ELM327 chip variants for D-CAN only. It also states that BMW's original licensing terms are not described in the README. README only; GPL; the format it reads is proprietary BMW data.
- Others on the hsfz topic: a BMW service-history Android app with "experimental ENET/CBS diagnostics" (2 stars) [66]. I did not open its source.

### 4. Signal databases

- **OBDb** [1, 26, 81, 82]:
  - One GitHub repo per vehicle model. The shared schemas repo is CC-BY-SA-4.0 and includes a Python CLI and examples [1].
  - A vehicle repo holds `signalsets/v3/default.json`, `generations.yaml` (human-readable generation history) and test cases [26, 81].
  - A command block has a request header (`hdr`), response address (`rax`), an extended-address byte (`eax`), a service-and-identifier command such as `{"22": "6335"}`, a polling frequency and year filters [81]. Signals inside carry a bit index, length, divisor, signedness, unit and an optional standard metric name, with the shared schema defining the fields.
  - The first BMW 3 Series entries I saw are plug-in-hybrid battery readings. My count is a regex over the file text, so treat the counts in the summary as approximate.
  - The BMW 3 Series repo has 709 commits and 5 stars [26]. The repo-level maintenance looks healthy (pushed 2026-11-20 [89]), but the community is small.
  - The organisation's GitHub profile links to clutch.engineering [89]. Clutch's own page lists apps (ELMCheck, CAN Studio) but does not mention OBDb [25]. So the connection is only implied by the GitHub profile link. Treat "who runs OBDb" as unverified.
- **opendbc** [2, 83] (MIT, 3.6k stars, pushed 2026-11-19):
  - Car ports, a DBC-driven CAN parser, and safety firmware logic for comma's hardware. 61 entries in the DBC directory, including `bmw_e9x_e8x.dbc`, `mercedes_benz_e350_2010.dbc` and several Toyota files (Prius 2010, iQ 2009, TSS2).
  - The car directory contains modules named for UDS, ISO-TP, ECU address discovery and firmware version queries [83]. Filenames only; I did not read the code, which is MIT and may be read later.
- **cantools** (MIT, 2.3k stars) parses DBC, KCD, SYM, ARXML and CDD, and has diagnostics data-identifier encode/decode [21]. **canmatrix** (BSD-2, 1.1k) converts between formats and can export a Wireshark Lua script [41]. **dbcppp** (MIT) is a C++ parser [89].
- **COVESA VSS** (MPL-2.0, 455 stars) is a vocabulary of vehicle signal names, with the `vss-tools` exporter (MPL-2.0) [22, 54]. It does not say whether it covers diagnostics. It is useful for naming, not for addresses.
- **awesome-canbus** [72] curates the list above and mentions elmulator, elmcan (a Linux kernel driver for ELM327) and CANBabel.

### 5. Simulators and test doubles

| Project | Licence | What it simulates | Fit |
|---|---|---|---|
| ELM327-emulator (Python, 707 stars) | CC BY-NC-SA 4.0 (checked in LICENSE file [88]) | ELM327 with multi-ECU, UDS with ISO-TP flow control, DTCs, timing and error injection [15] | Best features, wrong licence for embedding. Possible as an external dev tool only after a legal check |
| elmulator (Swift and Python, MIT) | MIT | ELM327 over BLE and TCP, scenario JSON with chunking, delays, stalls, disconnects, plus a GitHub Action [79] | Best licence fit. Tiny (2 stars), BLE peripheral is macOS and Swift only for now |
| doip-sim-ecu-dsl (Kotlin, Apache-2.0) | Apache-2.0 | DoIP gateways and ECUs, also CAN with ISO-TP, Maven Central [61] | Good model for a DoIP mock; JVM-only |
| UDS-Server / UDSim (C and C++) | GPL | UDS ECU simulator and fuzzer [29, 89] | README only |
| ICSim, CANdevStudio, lbenthins/ecu-simulator (archived) | GPL-3.0 / MPL-2.0 / MIT | Cluster, node-based and OBD dongle simulators [31, 52, 89] | Not diagnostic-focused or dormant |
| svietlik's in-memory gateway | MIT | HSFZ/DoIP gateway for tests [59] | Pattern to copy |

I found no open, permissively licensed BMW HSFZ simulator that does not need proprietary data.

### 6. Wireshark dissectors

- Wireshark's field reference pages show built-in dissectors for ISO-TP, UDS, DoIP and HSFZ [17-20]:
  - **ISO-TP** exposes flow control, reassembly state and error fields [20].
  - **UDS** exposes services (including read and write by identifier, routine control, session control, security access, read DTC information, communication control and download/transfer), plus a few DIDs such as VIN [19].
  - **DoIP** exposes routing activation, diagnostic message and acknowledge fields, plus vehicle identification fields such as VIN and EID [18].
  - **HSFZ** exposes address, control word, length and data, with a field reference covering 4.2.0 to 4.6.10 [17]. The page expands HSFZ as a German term for "high-speed vehicle access" and does not mention BMW.
- I did not read any dissector source (GPL). No third-party BMW-specific dissector plugin turned up in the topic pages.
- canmatrix can emit a Wireshark Lua script from a CAN database [41]. That is one route to showing signal names in captures.
- **Implication:** capture-based debugging of ENET sessions is already free. OpenDiag's session logs could use a pcapng-compatible export instead of a custom format. This is my inference, not a finding.

### 7. Open-source mobile and desktop apps (licence, activity, architecture)

| App | Licence | Stars | Last push | Architecture from README |
|---|---|---|---|---|
| AndrOBD (Android, Java) | GPL-3.0 | 2.2k | 2026-11-08 | App, library and plugin modules; MQTT, GPS and sensor plugins; demo mode [11] |
| OBDium (Tauri/Rust) | GPL-3.0 | 478 | 2026-09-10 | ELM327 serial only, offline VIN decode via SQLite, replay demo mode [69] |
| ReDrive (Flutter) | no licence field (README says GPLv3) | 157 | 2026-11-18 | Bluetooth, WiFi, USB, ELM327 emulator link [71] |
| aa-torque (Android Auto, Kotlin) | GPL-3.0 | 558 | 2025-03-04 | Performance monitor [57] |
| OnboardPi (TS web app) | GPL-2.0 | 78 | 2024-12-22 | Raspberry Pi web diagnostics [68, 89] |
| EcuBus-Pro (Electron, TS likely) | Apache-2.0 | 911 | 2026-11-05 | UDS, CAN-TP, DoIP, LIN, scripting, DBC viewer, PEAK/Kvaser/Vector/SLCAN/gs_usb adapters [63] |
| OpenVehicleDiag (Rust) | GPL-3.0 | 1.0k | 2025-07-25 | J2534 and SocketCAN. Its Mercedes parser tool was removed after a DMCA notice [10] |
| polestar-diag (Rust, egui) | MPL-2.0 | 15 | 2026-07-29 | Read-only DoIP/UDS, mock replay, crate split into DTC logic, platform data, transport, CLI and GUI [73] |
| Caruspex (Rust) | MIT | 7 | 2026-11-20 | Cross-brand OBD-II, UDS, BMW ENET and DoIP, per the topic listing only [56] |

EcuBus-Pro stands out as the largest Apache-2.0 TypeScript-based tool and a possible source of transport and UDS ideas. Its README does not state the stack directly [63], so check the repo before assuming reuse is possible.

The OpenVehicleDiag DMCA note [10] and Boostline's "download it yourself" data approach [75] both point at the same legal pressure point: description files from the OEM.

### 8. Security-research tools (reference only)

Caringcaribou (GPL-3.0) enumerates services, harvests security seeds and dumps memory over UDS and DoIP [28]. Gallia (Apache-2.0) is a UDS pentest framework whose README warns of irreversible damage [64]. An enthusiast tool should deliberately leave these features out.

## Ranking by usefulness to OpenDiag

Scoring is my judgement: fit to the TypeScript, BMW-first, read-first plan, weighted by licence freedom and maintenance. A hyphen means not a candidate.

| Rank | Project | Use | Licence | Why |
|---|---|---|---|---|
| 1 | svietlik | Study, maybe vendor protocol code with credit | MIT | Same language, same BMW transports, platform-free core. Small and single-car-tested |
| 2 | Boostline | Study; compare design and adapter notes | MIT | BMW ENET plus the owner's adapter families, allowlist read-only UDS, Capacitor mobile path |
| 3 | klartext-obd | Pattern: policy gate, core/CLI split | Apache-2.0 | Allowlist is enforced before the adapter, with no override switch [80] |
| 4 | python-udsoncan and can-isotp | Behaviour spec and test vectors | MIT | Timing and pending-response model, parameter list [3, 4, 48, 49] |
| 5 | OBDb schemas and signal sets | Data source (subject to licence review) | CC-BY-SA-4.0 | Only large open BMW/Toyota/Lexus/Mercedes read database, but share-alike |
| 6 | openbimmer and edu-amr/elm327 | BLE client patterns | MIT | Both are TypeScript and cover BLE ELM327 (React Native; Web Bluetooth) |
| 7 | elmulator, doip-sim-ecu-dsl | Test harness ideas | MIT / Apache-2.0 | Scenario files and CI action fit our test plan |
| 8 | python-doipclient, doip-codec | DoIP behaviour reference | MIT | Discovery, activation and error handling |
| 9 | opendbc, cantools, canmatrix | Later: broadcast-signal decode | MIT / BSD | Needed only for live broadcast data, not for diagnostics |
| 10 | I-CAN-hack/automotive, iso14229 | Optional native core and simulation | MIT | Rust or C routes if a native layer is needed |
| - | AndrOBD, EdiabasLib, OBDium, ReDrive, ecu_diagnostics, caringcaribou, UDS-Server, python-OBD | README only | GPL | Do not copy code |
| - | ELM327-emulator | Dev tool at most | CC BY-NC-SA | Non-commercial, do not embed |
| - | fake-car | Avoid | Custom, proprietary inputs | Needs user's own BMW data |

## Evidence quality and disagreements

- **Reliability of numbers.** Stars, licences and push dates come from the API on one day [89]. Commit and issue counts come from README page captures that are summarised by a model, not parsed; I list them as approximate. Where two page captures disagree on a count (for example odxtools "1,625 commits" [6]), I did not rely on it.
- **Single-source claims.**
  - Svietlik's port and gateway notes [59] and its module-identity warning.
  - Boostline's adapter statuses [75].
  - Openbimmer's claim of no UDS use [74].
  - Fake-car's feature list [60].
  - LTSupportAutomotive's remark on UDS being unworkable [14].
  - Headless-ista's design [76].
  - OBDb command counts [81]. These are my own regex counts over one file per vehicle.
- **Disagreements and inconsistencies.**
  - ELM327-emulator licence: the GitHub API reports "NOASSERTION" and the README badge points to CC BY-NC-SA 4.0. I checked the LICENSE file head, which names Attribution-NonCommercial-ShareAlike 4.0 [15, 88, 89]. Treat as non-commercial.
  - ReDrive: no licence in the API, README says GPLv3 [71, 89]. Treat as GPL.
  - doipclient: the README claims ISO 13400 (2019) coverage while the docs default to protocol version 2 (2012) [5, 50].
  - HSFZ ports: svietlik says UDP 6811 for HSFZ; fake-car uses tcp port 6801 as the gateway address [59, 60]. These may be discovery versus data ports, but I did not confirm that from a third source.
  - Wireshark's HSFZ page does not mention BMW, while svietlik and fake-car tie HSFZ to BMW ENET [17, 59, 60]. They are not in conflict; the attribution just comes from different sources.
  - OBDb's affiliation: GitHub profile links to Clutch; Clutch's own site does not mention OBDb [25, 89].
  - Boostline says BMW channels require a one-time import of third-party data and does not name the source [75]; I did not verify which repository it means or its licence status.
- **Coverage gaps from the method.**
  - No keyword search was possible, so TypeScript, Go and Java coverage rests on topic pages that show 20 entries each of 47, 256, 301 and 43 listed [56-58, 68].
  - No app-store review mining.
  - No forum evidence on reliability of these projects with real cars.
  - I did not run or build any project.
- **Maintenance reading.** "Last push" does not equal "works". Many small BMW projects have under 50 stars and one tested car. The credible signal is whether tests run against a simulator (svietlik, elmulator, edu-amr/elm327, klartext-obd say they do [59, 78, 79, 80]).

## Implications for OpenDiag

**Build**

1. **A platform-free TypeScript core.** Copy the svietlik and klartext-obd shape: protocol logic imports nothing from Node or the browser, and the caller supplies the transport (TCP socket, BLE characteristic, serial, Web Bluetooth) [59, 80]. This gives one codebase for Node CLI, Electron, React Native and browser.
2. **A UDS client that mirrors udsoncan's behaviour.** Per-request timeouts, p2 and p2* handling, a response-pending hook, negative-response mapping, and a pluggable security-access callback that the core never fills in [3, 49]. Add an ISO-TP layer with the parameter set from can-isotp, used for the ELM327 path where the adapter does its own framing and for any raw CAN adapter later [48].
3. **Transport adapters in this order.** ENET over HSFZ for F-series, DoIP for G-series, BLE ELM327 for the OBDLink CX, then WiFi ELM327. Note svietlik's finding that plain ELM327 adapters do not carry the ENET path [59]; that means two different capability tiers, and the UI should say which tier a connection is.
4. **A policy gate that sits in front of every adapter.** Allowlist of services and identifiers, enforced before bytes leave the machine, with no off switch in the read-only build [75, 80]. Write-capable features, if ever built, live in a separate build and require typed confirmation, as headless-ista does for its writes [76]. Identify modules by what they report, not by address alone [59].
5. **A test and replay rig from day one.** Scenario files like elmulator's (chunking, delays, stalls, disconnects) and a mock HSFZ/DoIP gateway like svietlik's in-memory one. Add a demo or replay mode, which OBDium, SwiftOBD2, Boostline and polestar-diag all ship [13, 69, 73, 75]. Add a fault-injection mode inspired by fake-car's practice mode, using only our own mock data [60].
6. **Pcapng-compatible session export**, so Wireshark's existing ISO-TP, UDS, DoIP and HSFZ dissectors can read OpenDiag captures [17-20]. Needs a feasibility check (see Open questions).
7. **A signal-definition layer separate from the protocol core.** Use an OBDb-like JSON shape (header, address, extended byte, service and identifier, bit index, length, divisor, unit, year filters) as the in-memory model [81]. Keep the data package separate so the licence question stays contained.

**Avoid**

- Copying any GPL or non-commercial code. That excludes AndrOBD, EdiabasLib, OBDium, ReDrive, ecu_diagnostics, python-OBD and ELM327-emulator.
- Bundling OBDb data into the Apache-2.0 code tree until a lawyer or the maintainers clarify share-alike scope. Prefer a downloadable data pack with its own licence and attribution.
- Shipping or fetching proprietary description files, as OpenVehicleDiag's DMCA removal and Boostline's download-it-yourself approach both illustrate [10, 75].
- Security-research features: seed harvesting, memory dumping, fuzzing [28, 64].
- Depending on single-author tiny repos as libraries. Read them, credit them, re-implement or vendor with their MIT notice.
- Building on LTSupportAutomotive's missing UDS ambitions: cheap ELM327 adapters are a poor UDS carrier, so keep them to OBD-II and limited UDS reads [14].

**Measure**

- Number of BMW modules answered over ENET on the owner's own car versus over BLE ELM327, per chassis, and the time per full scan.
- Percent of requests rejected by the policy gate in a normal session (should be zero for read-only flows).
- Simulator coverage: how many documented adapter failure modes (stall, chunking, NO DATA, disconnect, latency) have a test.
- OBDb signal yield: for the owner's chassis, how many OBDb signals actually return values, and how many return errors.
- Licence audit: for every dependency, licence, last push date and tests-in-CI, recorded in a table in the repo.

## Open questions

1. Does OBDb's CC-BY-SA-4.0 force the whole OpenDiag data bundle, or just the data files, to be share-alike if we ship it? Needs legal reading or a direct question to the maintainers.
2. What is the exact HSFZ framing and which ports are used, confirmed from two independent sources? Fetch svietlik's PROTOCOL.md and compare with earlier OpenDiag notes.
3. Which third-party repository does Boostline import its BMW channel list from, and under what licence?
4. Does EcuBus-Pro's TypeScript core separate from Electron enough to reuse its UDS or DoIP code under Apache-2.0?
5. Can a read-only service allowlist cover enough useful BMW identifiers over a BLE ELM327, or do the interesting reads need ENET?
6. Is there a permissive TypeScript ISO-TP implementation I missed? The topic-page method showed only 20 of 43 TypeScript OBD-II repositories and none for ISO-TP.
7. Do the Mercedes and Toyota phases have equivalents of svietlik and Boostline? Not found with this method; OBDb has 163 repos named BMW, Toyota, Lexus or Mercedes, which is the likely starting point [82].

## Source ledger

All rows were fetched on 2026-11-20. "README" means the repository front page. Reliability reflects how authoritative the source is for the claim I used it for. Row 1 is the OBDb schemas repository, not the data.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| 1 | https://github.com/OBDb/.schemas | README | OBDb schema repo, CC-BY-SA-4.0, CLI and examples; little prose | med |
| 2 | https://github.com/commaai/opendbc | README | Repo layout, MIT, safety model, DBC parser | high |
| 3 | https://github.com/pylessard/python-udsoncan | README | UDS client, MIT, connection and codec design | high |
| 4 | https://github.com/pylessard/python-can-isotp | README | ISO-TP stack, MIT, two implementations | high |
| 5 | https://github.com/jacobschaer/python-doipclient | README | DoIP client, MIT, 2019 claim | high |
| 6 | https://github.com/mercedes-benz/odxtools | README | ODX/PDX tooling, MIT | high |
| 7 | https://github.com/driftregion/iso14229 | README | C UDS client and server, MIT, SAE paper cited | high |
| 8 | https://github.com/eclipse-opensovd/opensovd | README | SOVD project scope and status | high |
| 9 | https://github.com/rnd-ash/ecu_diagnostics | README | Rust UDS/KWP crate, GPL-3.0, transports | high |
| 10 | https://github.com/rnd-ash/OpenVehicleDiag | README | Rust app, GPL-3.0, DMCA removal note, last release 2021 | high |
| 11 | https://github.com/fr3ts0n/AndrOBD | README | Android app, GPL-3.0, adapters, plugins | high |
| 12 | https://github.com/uholeschak/ediabaslib | README | .NET EDIABAS reimplementation, GPL-3.0, BMW adapters | high |
| 13 | https://github.com/kkonteh97/SwiftOBD2 | README | Swift OBD2 library, MIT, BLE and WiFi | high |
| 14 | https://github.com/mickeyl/LTSupportAutomotive | README | iOS OBD2 library, MIT, BLE bridge, UDS abandoned | high |
| 15 | https://github.com/Ircama/ELM327-emulator | README | Emulator features, interfaces, UDS and ISO-TP, NC badge | high |
| 16 | https://github.com/EricSmekens/node-bluetooth-obd | README | Node classic Bluetooth OBD, Apache-2.0, no BLE | high |
| 17 | https://www.wireshark.org/docs/dfref/h/hsfz.html | Docs | HSFZ dissector fields, versions 4.2.0 to 4.6.10 | high |
| 18 | https://www.wireshark.org/docs/dfref/d/doip.html | Docs | DoIP dissector fields | high |
| 19 | https://www.wireshark.org/docs/dfref/u/uds.html | Docs | UDS dissector fields and services | high |
| 20 | https://www.wireshark.org/docs/dfref/i/iso15765.html | Docs | ISO-TP dissector fields | high |
| 21 | https://github.com/cantools/cantools | README | DBC and other formats, DID encoding, MIT | high |
| 22 | https://github.com/COVESA/vehicle_signal_specification | README | VSS vocabulary, MPL-2.0 | high |
| 23 | https://github.com/collin80/SavvyCAN | README | Qt CAN tool, MIT, adapters | high |
| 24 | https://github.com/einride/can-go | README | Go SocketCAN and DBC codegen, MIT | high |
| 25 | https://clutch.engineering | Vendor site | Company products; no OBDb mention | med |
| 26 | https://github.com/OBDb/BMW-3-Series | Repo page | Per-vehicle layout, CC-BY-SA-4.0, 709 commits | high |
| 27 | https://github.com/hardbyte/python-can | README | CAN abstraction, LGPL-3.0, active | high |
| 28 | https://github.com/CaringCaribou/caringcaribou | README | Security tool modules for UDS, DoIP, XCP, GPL-3.0 | high |
| 29 | https://github.com/zombieCraig/UDS-Server | README | UDS simulator and fuzzer, GPL-2.0, alpha | high |
| 30 | https://github.com/openxc/uds-c | README | C UDS library, BSD-3, dependency injection | high |
| 31 | https://github.com/GENIVI/CANdevStudio | README | CAN simulation GUI, MPL-2.0 | high |
| 32 | https://github.com/brendan-w/python-OBD | README | Python OBD-II, GPL-2.0 | high |
| 33 | https://github.com/eclipse-opensovd/classic-diagnostic-adapter | README | SOVD to UDS over DoIP adapter, Apache-2.0, Rust | high |
| 34 | https://github.com/mercedes-benz/ardep | README | Zephyr platform, Apache-2.0, UDS DFU | high |
| 35 | https://github.com/eclipse-opensovd/uds2sovd-proxy | README | Proxy, 5 commits, placeholders | med |
| 36 | https://github.com/mercedes-benz/tokio-socketcan-isotp | README | Async ISO-TP fork, kernel warning | med |
| 37 | https://github.com/eltonvs/kotlin-obd-api | README | Kotlin OBD-II, Apache-2.0, stream abstraction | high |
| 38 | https://github.com/rzetterberg/elmobd | README | Go ELM327, MIT, partial features | high |
| 39 | https://github.com/samp-reston/doip-codec | README | Rust DoIP codec, MIT, v1.0.0 | med |
| 40 | https://github.com/marcelbuesing/can-dbc | README | Rust DBC parser | high |
| 41 | https://github.com/ebroecker/canmatrix | README | Format converter, BSD-2, Wireshark Lua export | high |
| 42 | https://github.com/commaai/panda | README | CAN FD firmware, MIT, safety modes | high |
| 43 | https://github.com/openvehicles/Open-Vehicle-Monitoring-System-3 | README | ESP32 monitor, vehicles incl. BMW i3, MIT | high |
| 44 | https://github.com/linux-can/can-utils | README | SocketCAN and ISO-TP tools | high |
| 45 | https://github.com/pires/android-obd-reader | README | Archived 2017, Apache-2.0, two-layer design | high |
| 46 | https://github.com/eclipse-opensovd/odx-converter | README | ODX to MDD, Kotlin, schemas excluded | high |
| 47 | https://github.com/sebi2k1/node-can | README | Node SocketCAN, MIT, KCD, no ISO-TP | high |
| 48 | https://can-isotp.readthedocs.io/en/latest/isotp/implementation.html | Docs | ISO-TP parameter list | high |
| 49 | https://udsoncan.readthedocs.io/en/latest/udsoncan/client.html | Docs | Client config, timing, services (partly read) | high |
| 50 | https://python-doipclient.readthedocs.io/en/latest/ | Docs | DoIP API, default protocol version 2 | high |
| 51 | https://github.com/technocreatives/dbc-codegen | README | Rust codegen, no_std, dual licence | high |
| 52 | https://github.com/zombieCraig/ICSim | README | Cluster simulator, GPL-3.0 | high |
| 53 | https://github.com/eclipse-opensovd/opensovd-core | README | SOVD server and gateway, Apache-2.0, v0.1.1 | high |
| 54 | https://github.com/COVESA/vss-tools | README | VSS exporters, MPL-2.0 | high |
| 55 | https://github.com/PowerBroker2/ELMduino | README | Arduino ELM327, non-blocking, MIT | high |
| 56 | https://github.com/topics/doip | Topic page | First 20 of 47 DoIP repos incl. svietlik, EcuBus-Pro | med |
| 57 | https://github.com/topics/elm327 | Topic page | First 20 of 256 ELM327 repos | med |
| 58 | https://github.com/topics/uds | Topic page | First 20 of 301 UDS repos | med |
| 59 | https://github.com/egzey0/svietlik | README | TypeScript HSFZ, DoIP and UDS for BMW, guard, warnings | high |
| 60 | https://github.com/kdrcoding/fake-car | README | BMW gateway simulator for E-Sys, custom licence, needs PSdZData | high |
| 61 | https://github.com/doip-sim-ecu/doip-sim-ecu-dsl | README | Kotlin DoIP and CAN ECU simulator DSL | high |
| 62 | https://github.com/langroodi/DoIP-Lib | README | C++14 DoIP serialisation, MIT | high |
| 63 | https://github.com/ecubus/EcuBus-Pro | README | UDS, DoIP, LIN tool, Apache-2.0, adapters | high |
| 64 | https://github.com/Fraunhofer-AISEC/gallia | README | UDS pentest framework, Apache-2.0, warning | high |
| 65 | https://github.com/I-CAN-hack/automotive | README | Rust CAN, ISO-TP, DoIP, UDS, XCP, MIT | high |
| 66 | https://github.com/topics/hsfz | Topic page | Three HSFZ repos | med |
| 67 | https://github.com/topics/bmw-diagnostics | Topic page | One repo (headless-ista) | med |
| 68 | https://github.com/topics/obd2?l=typescript | Topic page | First 20 of 43 TypeScript OBD2 repos | med |
| 69 | https://github.com/provrb/obdium | README | Tauri/Rust OBD app, GPL-3.0 | high |
| 70 | https://github.com/mdabrowski1990/uds | README | Multi-bus Python UDS, MIT, vague on status | med |
| 71 | https://github.com/iUnreallx/ReDrive | README | Flutter OBD2 app, GPLv3 per README | med |
| 72 | https://github.com/iDoka/awesome-canbus | List | Curated tools by category | med |
| 73 | https://github.com/martti/polestar-diag | README | Read-only DoIP/UDS, crate layout, MPL-2.0 | high |
| 74 | https://github.com/openbimmer/openbimmer | README | BMW turbo app, MIT, BLE, OBD-II only | high |
| 75 | https://github.com/clucraft/Boostline | README | BMW ENET logger, MIT, adapters, read-only allowlist | high |
| 76 | https://github.com/chrisbray85/headless-ista | README | MCP server over ISTA+, write confirmation | med |
| 77 | https://github.com/evanshortiss/obd-parser | README | TS OBD parser, serial only, stale | high |
| 78 | https://github.com/edu-amr/elm327 | README | TS ELM327 with Web Bluetooth, TCP, simulator, MIT | med |
| 79 | https://github.com/qadanm/elmulator | README | BLE and TCP ELM327 emulator, scenarios, MIT | med |
| 80 | https://github.com/max-achleitner/klartext-obd | README | Read-only policy gate, BLE ELM327, Apache-2.0 | med |
| 81 | GitHub API: OBDb/BMW-3-Series signalsets/v3/default.json, generations.yaml, README; also default.json of BMW-M3, Toyota-Camry, Mercedes-Benz-C-Class, BMW-i4 | API file reads | Signal-set format; my regex counts of commands and signals | high for format, med for counts |
| 82 | GitHub API: orgs/OBDb/repos | API listing | 897 repos, 163 BMW/Toyota/Lexus/Mercedes by name | high |
| 83 | GitHub API: commaai/opendbc contents of dbc and car directories | API listing | 61 DBC entries; BMW, Mercedes, Toyota files; UDS and ISO-TP module names | high |
| 84 | GitHub API: orgs/mercedes-benz/repos | API listing | odxtools, ardep, tokio-socketcan-isotp, CDA | high |
| 85 | GitHub API: orgs/eclipse-opensovd/repos | API listing | OpenSOVD repo set and stars | high |
| 86 | GitHub API: orgs/COVESA/repos | API listing | VSS tools, other COVESA repos | high |
| 87 | GitHub API: orgs/commaai/repos | API listing | panda, opendbc stars and licences | high |
| 88 | GitHub API: LICENSE heads of ELM327-emulator, OVMS3; can-utils LICENSES directory | API file reads | CC BY-NC-SA 4.0; MIT; BSD-3 plus GPL-2.0 files | high |
| 89 | GitHub REST API: repository metadata for about 110 repos (stars, SPDX licence, last push, archived, language) | API metadata | Figures quoted throughout | high |
