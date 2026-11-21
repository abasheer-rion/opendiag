# Open-source reuse map for OpenDiag: what to depend on, vendor, or only learn from

Retrieved 2026-11-20. Status: **PARTIAL** (see "How each field was verified" and Gaps). Builds on `docs/research/deep/open-source-automotive-code-survey.md` and `open-source-ecu-tools-lessons.md`. This document does not repeat their prose. It re-verifies the key rows from the repos themselves, adds new candidates, corrects two earlier readings, and turns the whole thing into a decision per project.

## Executive summary

- **Biggest correction:** python-can is **LGPL-3.0**, not a permissive licence (LICENSE.txt in the repo). Use it as an unmodified dependency, never copy code out of it. [S1]
- **Safe to depend on or vendor (MIT, Apache-2.0, BSD):** udsoncan, python-can-isotp, python-doipclient, odxtools, iso14229, I-CAN-hack/automotive, cantools, opendbc (code and DBC files), SavvyCAN, kotlin-obd-api, ELMduino, SwiftOBD2, bleak, btleplug, capacitor bluetooth-le, react-native-ble-plx, svietlik, Boostline, openbimmer.
- **Learn-only (GPL, AGPL, non-commercial, no licence file):** EdiabasLib (GPL-3.0), AndrOBD, python-OBD, OpenVehicleDiag, ecu_diagnostics, Wireshark and Scapy, freediag, uds-server, BMWeb, ELM327-emulator (repo page badge says CC-BY-NC-SA-4.0, **non-commercial**), the F-Droid ELM327 emulator (GPL-3.0), (headless-ista is MIT but drives proprietary ISTA+: do not depend).
- **Data we can use but must keep separate:** OBDb (CC-BY-SA-4.0, share-alike). Ship it as a separate data pack, with attribution, never merged into Apache-2.0 source files.
- **No properly licensed BMW or VAG coding database exists.** Searches found only GPL scrapes, forum scans and vendor-proprietary label files. Treat "coding database" as something OpenDiag builds from owner captures and its own words.
- **No permissive ELM327 emulator with BLE exists.** The best-known one is non-commercial. We should write our own small emulator (about 1 to 2 days) and borrow only ideas.
- **No TypeScript UDS or ISO-TP library exists** that we could find. svietlik (MIT, 23 stars, one author, one car) is the only TS code speaking HSFZ and DoIP. Plan to write our own thin core and learn the frame details from udsoncan and python-can-isotp.
- **Activity is healthy for the core Python and C libraries** (all pushed within 2 months of 2026-11-20) and **stale for uds-c, isotp-c (2021), kayak (archived), python-uds (archived), obd-java-api (archived)**.

## How each field was verified (read this first)

| Field | Method | Confidence | Limit |
|---|---|---|---|
| Licence | Fetched the repo's own LICENSE or COPYING file from raw.githubusercontent.com and matched its text against known licence wording [S2]. Cross-checked with GitHub API SPDX ids for 12 repos before the unauthenticated API quota ran out. | high where a file was found | Files with no root licence file are marked "NO FILE". A repo may still carry per-file headers (see can-utils). Dual-licence text can match two names. |
| Stars | Count embedded in the GitHub repo page (stargazerCount) [S2]. Matches API values on every repo checked both ways. | high | Drifts daily. |
| Last commit | Date of newest entry in each repo's public commits.atom feed (default branch) [S2]. | high | A last-push date from the API can differ by days (for example SwiftOBD2: last commit 2025-10-21 vs last push 2026-01-26 reported by the earlier survey). |
| Language | GitHub API where it succeeded; otherwise README or the earlier survey. Marked "(R)" when read from a README and "(S)" when taken from the earlier survey. | medium | Not independently counted for every repo. |
| "What we would take" and "risk" | My judgement from READMEs and licence terms. No code from any GPL, AGPL or non-commercial repo was read or copied. | medium | Not legal advice. A counsel check is already planned (A10 in direction.md). |

Tool limits this run: the GitHub API allowed 60 unauthenticated calls per hour and the quota ran out early, so the API was used for roughly the first 20 repos only. Web search worked but returned snippets, not repo pages, so every search-derived fact was re-checked against the repo files where I could.

## Licence tiers and what each means for OpenDiag

OpenDiag is Apache-2.0. The tier decides how a project may be used.

| Tier | Licences | Allowed use | Rule |
|---|---|---|---|
| **A. Free to vendor** | MIT, BSD-2/3, Apache-2.0, ISC | Copy code into the repo, keep the notice | Add to a NOTICE or THIRD_PARTY file. Pin the commit. |
| **B. Depend, do not copy** | LGPL-2.1/3.0, MPL-2.0 | Use as an unmodified library. Do not paste code into our files | Keep it replaceable (for example a normal package dependency). For MPL, changes to MPL files must be shared. For LGPL-3 on mobile or iOS, static linking raises extra questions: avoid. |
| **C. Data with share-alike** | CC-BY-SA-4.0 | Use the data, credit the authors, share changes to the data under the same licence | Keep as a separate "data pack". Never mix into Apache source files. Counsel to confirm that an app reading the pack is not itself an adaptation. |
| **D. Learn-only** | GPL-2/3, AGPL, CC-BY-NC, "free to use, no sharing", custom, **no licence file** | Read the public docs, protocol notes and READMEs. Restate facts in our own words | Do not read the source with the intent to port it. Do not copy structure, tables or comments. A repo with no licence file is all-rights-reserved by default. |

Clean-room reminder: forum-documented facts and public protocol behaviour may be restated in our own words. Nothing here recommends leaked OEM files, keys or databases, and none were used.

## Master table

Dates are last commit on the default branch. "Verified" means the licence was read from the repo file. Stars are as of 2026-11-20.

### Tier A and B: code we can depend on or vendor

| Project | URL | Licence | Last commit | Stars | Lang | Decision |
|---|---|---|---|---|---|---|
| python-udsoncan | github.com/pylessard/python-udsoncan | MIT | 2026-10-26 | 746 | Python (S) | **Depend** for the Python bench tools and as the behaviour reference for our own client |
| python-can-isotp | github.com/pylessard/python-can-isotp | MIT | 2026-11-10 | 316 | Python (S) | **Depend** (bench) and **study** for timing parameters |
| python-doipclient | github.com/jacobschaer/python-doipclient | MIT | 2026-11-09 | 217 | Python (S) | **Depend** (bench) and reference for ISO 13400 flow |
| python-can | github.com/hardbyte/python-can | **LGPL-3.0** | 2026-11-15 | 1614 | Python | **Depend only**, unmodified |
| odxtools (Mercedes-Benz) | github.com/mercedes-benz/odxtools | MIT | 2026-11-17 | 332 | Python (S) | **Depend** for the Mercedes phase |
| iso14229 | github.com/driftregion/iso14229 | MIT | 2026-09-29 | 380 | C (S) | **Vendor or study** for a UDS server in our simulator or an embedded probe |
| I-CAN-hack/automotive | github.com/I-CAN-hack/automotive | MIT | 2026-11-17 | 107 | Rust (S) | **Depend** if the core is Rust; otherwise study |
| cantools | github.com/cantools/cantools | MIT | 2026-11-20 | 2323 | Python (S) | **Depend** (bench) to read DBC and KCD files |
| marcelbuesing/can-dbc | github.com/marcelbuesing/can-dbc | MIT (LICENSE-MIT file) | 2026-07-15 | 114 | Rust (S) | **Depend** if Rust |
| socketcan-rs | github.com/socketcan-rs/socketcan-rs | MIT | 2026-09-05 | 213 | Rust | **Depend** if Rust on Linux |
| opendbc | github.com/commaai/opendbc | MIT | 2026-11-18 | 3573 | Python and DBC (S) | **Vendor DBC files** (with notice) and **study** the tooling |
| openpilot | github.com/commaai/openpilot | MIT | 2026-11-20 | 64187 | Python, C++ (S) | **Learn** how car ports are structured. Do not take code: it is driver-assist software tied to its own hardware |
| comma panda | github.com/commaai/panda | MIT | 2026-11-19 | 1708 | C (S) | **Learn** (CAN adapter firmware). Optional adapter later |
| SavvyCAN | github.com/collin80/SavvyCAN | MIT | 2026-11-17 | 1934 | C++ | **Use as a free analysis tool**, not a dependency |
| svietlik | github.com/egzey0/svietlik | MIT | 2026-10-08 | 23 | TypeScript | **Study closely**, maybe vendor the HSFZ and DoIP framing after review |
| Boostline | github.com/clucraft/Boostline | MIT | 2026-11-06 | 5 | TypeScript (S) | **Study and contribute**; potential overlap in logging |
| openbimmer | github.com/openbimmer/openbimmer | MIT | 2026-10-09 | 4 | TypeScript (S) | **Study** BMW PID lists and UI ideas |
| headless-ista | github.com/chrisbray85/headless-ista | MIT | 2026-09-02 | 9 | TypeScript (S) | **Study** the read-only gate pattern only |
| kotlin-obd-api | github.com/eltonvs/kotlin-obd-api | Apache-2.0 | 2026-11-03 | 237 | Kotlin | **Depend or vendor** for an Android client |
| SwiftOBD2 | github.com/kkonteh97/SwiftOBD2 | MIT | 2025-10-21 | 163 | Swift (S) | **Vendor or study** for iOS BLE and demo mode |
| LTSupportAutomotive | github.com/mickeyl/LTSupportAutomotive | MIT | 2023-06-14 | 256 | Obj-C (S) | **Study only** (stale; author reports UDS over cheap adapters did not work out) |
| ELMduino | github.com/PowerBroker2/ELMduino | MIT | 2025-05-20 | 951 | C++ (S) | **Study** the non-blocking command state machine |
| edu-amr/elm327 | github.com/edu-amr/elm327 | MIT | 2026-10-13 | 7 | TypeScript (S) | **Study** (mode 01 only, tiny) |
| pires/obd-java-api | github.com/pires/obd-java-api | Apache-2.0 | 2017-07-16 | 627 | Java | **Skip** (ARCHIVED) |
| python-uds (richClubb) | github.com/richClubb/python-uds | MIT | 2026-06-02 | 123 | Python | **Skip** (ARCHIVED) |
| openxc uds-c | github.com/openxc/uds-c | BSD (Ford) | 2021-08-09 | 835 | C (S) | **Study** dependency-injection design only (stale) |
| openxc isotp-c | github.com/openxc/isotp-c | BSD (Ford) | 2021-08-09 | 364 | C (S) | **Study** only (stale) |
| lbenthins/ecu-simulator | github.com/lbenthins/ecu-simulator | MIT | 2023-06-02 | 142 | Python (S) | **Study** ideas for a CAN OBD and UDS simulator (ARCHIVED) |
| doip-sim-ecu-dsl | github.com/doip-sim-ecu/doip-sim-ecu-dsl | Apache-2.0 | 2026-11-19 | 12 | Kotlin | **Use or study** as a DoIP test ECU for G-series style tests |
| mdabrowski1990/uds | github.com/mdabrowski1990/uds | MIT | 2026-11-16 | 153 | Python (S) | **Study** (broad but vague on maturity) |
| Eclipse OpenSOVD (opensovd) | github.com/eclipse-opensovd/opensovd | Apache-2.0 | 2026-11-19 | 49 | Rust (S) | **Watch** (standards direction) |
| classic-diagnostic-adapter | github.com/eclipse-opensovd/classic-diagnostic-adapter | Apache-2.0 | 2026-11-20 | 31 | Rust (S) | **Study** SOVD to UDS and DoIP design |
| odx-converter | github.com/eclipse-opensovd/odx-converter | Apache-2.0 | 2026-09-24 | 13 | Kotlin (S) | **Watch** |
| ARDEP | github.com/mercedes-benz/ARDEP | Apache-2.0 | 2026-11-16 | 588 | C (S) | **Study** only (embedded firmware update framework) |
| bleak | github.com/hbldh/bleak | MIT | 2026-11-07 | 2580 | Python | **Depend** (bench BLE) |
| btleplug | github.com/deviceplug/btleplug | Apache-2.0 or MIT (dual, text includes BSD) | 2026-10-10 | 1193 | Rust (S) | **Depend** if Rust desktop BLE |
| @capacitor-community/bluetooth-le | github.com/capacitor-community/bluetooth-le | MIT | 2026-11-18 | 358 | TypeScript (S) | **Depend** if Capacitor mobile |
| react-native-ble-plx | github.com/dotintent/react-native-ble-plx | Apache-2.0 | 2026-03-09 | 3444 | TypeScript, native (S) | **Depend** if React Native |
| noble (abandonware) | github.com/abandonware/noble | MIT | 2025-02-09 | 601 | JavaScript (S) | **Depend** for Node desktop BLE (slower pace) |
| node-can | github.com/sebi2k1/node-can | MIT | 2026-10-26 | 249 | JS and C++ (S) | **Depend** for SocketCAN from Node on Linux only |
| esp32-obd-simulator | github.com/AugustinVoiMa/esp32-obd-simulator | Apache-2.0 | 2025-01-17 | 3 | C++ (S) | **Study** only (3 stars) |
| ObdGraphsGiulia | github.com/simieng/ObdGraphsGiulia | Apache-2.0 | 2024-02-22 | 0 | Kotlin (S) | **Study** (repo is a fork-like app, tiny) |
| myOBC | github.com/F4de78/myOBC | MIT | 2025-11-03 | 6 | Kotlin (S) | **Skip** (tiny) |
| dzid26/opendbc-BMW-E8x-E9x | github.com/dzid26/opendbc-BMW-E8x-E9x | MIT | 2025-06-23 | 99 | DBC and Python (S) | **Study** BMW E8x/E9x DBC |

### Tier C: data with share-alike

| Project | URL | Licence | Last commit | Stars | Lang | Decision |
|---|---|---|---|---|---|---|
| OBDb SAEJ1979 | github.com/OBDb/SAEJ1979 | CC-BY-SA-4.0 | 2026-11-12 | 47 | JSON data | **Use as separate data pack** |
| OBDb BMW-3-Series | github.com/OBDb/BMW-3-Series | CC-BY-SA-4.0 | 2026-11-20 | 5 | JSON data | **Use as separate data pack** |
| OBDb Toyota-Camry | github.com/OBDb/Toyota-Camry | CC-BY-SA-4.0 | 2026-11-19 | 6 | JSON data | **Use as separate data pack** |
| OBDb .schemas | github.com/OBDb/.schemas | CC-BY-SA-4.0 | 2026-11-15 | 10 | Python | **Read for schema**, validate our own files against it |
| ~897 OBDb vehicle repos | github.com/OBDb | CC-BY-SA-4.0 per repo | daily | 5 to 47 | JSON | **Pull per car on demand** |

### Tier D: learn-only (do not copy, do not port)

| Project | URL | Licence (verified) | Last commit | Stars | Why learn-only |
|---|---|---|---|---|---|
| EdiabasLib | github.com/uholeschak/ediabaslib | **GPL-3.0** (license.md) | 2026-11-20 | 965 | Copyleft. Reads BMW's proprietary description files. Study the public docs only |
| AndrOBD | github.com/fr3ts0n/AndrOBD | GPL-3.0 | 2026-11-08 | 2198 | Copyleft app |
| python-OBD | github.com/brendan-w/python-OBD | GPL-2.0 | 2025-04-07 | 1334 | Copyleft |
| OpenVehicleDiag | github.com/rnd-ash/OpenVehicleDiag | GPL-3.0 | 2025-07-25 | 1034 | Copyleft |
| ecu_diagnostics | github.com/rnd-ash/ecu_diagnostics | GPL-3.0 | 2026-08-21 | 238 | Copyleft |
| freediag | github.com/fenugrec/freediag | GPL-3.0 | 2024-09-09 | 499 | Copyleft |
| Wireshark | github.com/wireshark/wireshark | GPL-2.0 (COPYING) | 2026-11-20 | 10255 | Copyleft. **Use the program, do not copy dissector code** |
| Scapy | github.com/secdev/scapy | GPL-2.0 | 2026-11-19 | 12705 | Copyleft. Use as a test tool |
| BMWeb | github.com/dader34/BMWeb | GPL-3.0 | 2026-11-14 | 29 | Copyleft |
| Telltale (Codeberg) | codeberg.org/ImL1s/telltale | GPL-3.0 (per search result, not fetched) | not checked | not checked | Copyleft |
| uds-server | github.com/zombieCraig/uds-server | GPL-2.0 | 2025-10-08 | 366 | Copyleft simulator |
| can-isotp (kernel module) | github.com/hartkopp/can-isotp | GPL-2 and BSD text in COPYING (dual) | 2022-05-20 | 288 | Mainline Linux has ISO-TP built in. Use the kernel socket, not this repo |
| cannelloni | github.com/mguentner/cannelloni | GPL-2.0 (README) | 2026-11-20 | 476 | Copyleft |
| ELM327-emulator (Ircama) | github.com/Ircama/ELM327-emulator | **CC-BY-NC-SA-4.0** (badge on repo page, re-checked in the fact-check pass; full licence text not re-read) | 2026-09-17 | 708 | **Non-commercial and share-alike.** Hard no for code. Read the README only for the list of failure modes |
| ELM327SimAndroid (F-Droid app) | github.com/autodiag2/ELM327SimAndroid | GPL-3.0 | 2026-11-15 | 25 | Copyleft |
| OpenOBD | github.com/Foadsf/OpenOBD | GPL-3.0 | 2026-11-01 | 32 | Copyleft |
| PyVCDS | github.com/MartijnD92/PyVCDS | GPL-2.0+ (placeholder text in file) | 2022-12-03 | 5 | Copyleft. Also names Ross-Tech label rules |
| Korni22/VAG-Coding | github.com/Korni22/VAG-Coding | GPL-3.0 | 2021-08-05 | 4 | Copyleft, stale |
| jokinawa/bmw-f | github.com/jokinawa/bmw-f | GPL-3.0 | 2019-09-30 | 1 | Copyleft, stale |
| Flutter-OBD2 (pub.dev obd2) | github.com/AceBurgundy/Flutter-OBD2 | pub.dev lists MPL-2.0; repo LICENSE file text matches several licences (GPL-2, LGPL-2.1, AGPL, MPL-2) | 2026-03-02 | 1 | Ambiguous licence: treat as learn-only until the author clarifies |
| ediabaslib fork | github.com/spadge4711/ediabaslib | not checked | not checked | not checked | Fork of a GPL project |
| awesome-automotive-can-id | github.com/iDoka/awesome-automotive-can-id | **NO FILE** | 2026-11-16 | 1031 | A link list. No licence, and it links to a Toyota document ripper: avoid following those |
| Kayak | github.com/dschanoeh/Kayak | **NO FILE** | 2019-08-09 | 340 | ARCHIVED, no licence |
| socketcan-isotp (Rust crate repo) | github.com/marcelbuesing/socketcan-isotp | **NO FILE** (crate page says BSD-3-Clause per search) | 2023-06-28 | 31 | Unclear in repo; check crates.io metadata before use |
| can-utils | github.com/linux-can/can-utils | **No root licence file; source headers say GPL-2.0-only OR BSD-3-Clause** (SPDX line in candump.c and isotpsend.c; LICENSES folder present) | 2026-10-14 | 2961 | Dual. Use the binaries as dev tools. Because it is per-file dual, only take BSD-3 if a counsel check agrees |
| python-doipclient fork | github.com/noamraph/python-doipclient | MIT | 2023-08-27 | 0 | A stale fork of the MIT original. Use the original |
| DoIP-Lib (AVL) | github.com/AVL-DiTEST/DoIP-Lib | not retrievable at this URL | n/a | n/a | Moved or renamed. Earlier survey said MIT, not re-verified |
| evanshortiss/obd-parser | github.com/evanshortiss/obd-parser | licence text could not be matched (file starts with a README-like description) | 2017-10-19 | 43 | Stale. Skip |

## Detail by area

### 1. Transport and bus tools

**python-can** (hardbyte/python-can, LGPL-3.0, 1614 stars, last commit 2026-11-15) [S1]
- What we take: nothing in source form. As a dependency it gives one API over SocketCAN, PEAK, Vector, slcan and others for bench scripts.
- Risk: **licence is LGPL-3.0, not MIT.** Fine as a normal installed dependency. Do not vendor. Do not statically combine into a mobile app binary without counsel. Also note that python-can-isotp and udsoncan (both MIT) build on it, which keeps the whole stack replaceable.

**can-utils** (linux-can/can-utils, 2961 stars, last commit 2026-10-14)
- Verified: sampled source files carry an SPDX line of GPL-2.0-only OR BSD-3-Clause.
- What we take: the tools themselves (candump, cansend, isotpsend, isotprecv, isotpsniffer) as free bench utilities for the owner's Linux and CI.
- Risk: low if we only run them. Do not copy code. Linux only, so no help on the owner's Mac or on phones.

**SavvyCAN** (collin80/SavvyCAN, MIT, 1934 stars, last commit 2026-11-17)
- What we take: a free GUI for looking at CAN captures and DBC decodes during research. It is MIT, but a Qt desktop app is not a library we would embed.
- Risk: low. Build branch name shows a Qt6 work-in-progress branch is the default, so builds may need care.

**cannelloni, hartkopp can-isotp, Kayak, can-utils forks:** all D tier above. Mainline Linux already ships an ISO-TP socket (kernel docs describe it) [S9], so the separate module repo is not needed.

### 2. UDS, ISO-TP and DoIP libraries

| Need | Best permissive option | Confidence it will fit | What is missing |
|---|---|---|---|
| UDS client behaviour (timers, NRC 0x78, session handling) | udsoncan (MIT) [S3] | high for Python | No TS or Swift or Kotlin port exists that we found |
| ISO-TP framing parameters (stmin, block size, padding, timeouts) | python-can-isotp (MIT) [S4] | high | Pure reference for our own implementation |
| DoIP discovery, routing activation, diagnostic message | python-doipclient (MIT) [S5] | high | Its README says it implements most of ISO 13400 (2019). The default protocol version is **UNVERIFIED** (earlier text said 2; the README does not say). Check what a given G-series gateway accepts |
| HSFZ (BMW F-series) framing | svietlik (MIT) [S6], Scapy HSFZ layer (GPL-learn-only) [S10], Wireshark dissector (GPL-learn-only) [S11], Quantex public write-up (document) [S12] | medium | A second independent check on header layout. Our own wire notes already exist in `bmw-enet-hsfz-wire-protocol.md` |
| UDS server for a simulator | iso14229 (MIT) [S7], doip-sim-ecu-dsl (Apache) [S8] | medium | Neither knows BMW module behaviour |
| ODX reading (Mercedes later) | odxtools (MIT) [S13] | medium-high | Mercedes ODX files are not public. We would only read a file the owner already has |

**udsoncan** (746 stars, last commit 2026-10-26): UNVERIFIED that security access is a user-supplied callback. The README example only calls an unlock method with a level "from a fictive lib", which suggests the algorithm lives outside the library, but check the docs before relying on this boundary. Take: the timer defaults and the NRC 0x78 handling as a spec to match. Risk: Python only. If the shipped app is TS or Rust, we re-implement and keep udsoncan as the oracle in tests (record a conversation with our code, replay it into udsoncan's server-side test suite or compare frames).

**python-can-isotp** (316 stars, last commit 2026-11-10): take: parameter list as our config surface. Risk: it targets CAN, not ENET. For ENET and DoIP there is no ISO-TP at all because the TCP stream carries the UDS payload directly. Only ELM327 and CAN adapters need ISO-TP.

**python-doipclient** (217 stars, last commit 2026-11-09): take: discovery and routing-activation order. Risk: the library's default protocol version is UNVERIFIED (not stated in the README); check it against BMW gateways. The stale fork noamraph/python-doipclient (0 stars, 2023) has no value.

**iso14229** (380 stars, last commit 2026-09-29): MIT, two-file C, no heap. Take: use as the UDS server in an ESP32 or Linux simulator so the simulator is not hand-rolled. Risk: still 0.x. Bring-your-own ISO-TP is included, but its API may change.

**I-CAN-hack/automotive** (107 stars, last commit 2026-11-17, MIT): the most complete permissive Rust stack the earlier survey found (CAN, ISO-TP, DoIP, UDS). Take: if the core is Rust, depend on it. Risk: small community (contributor count UNVERIFIED, taken from the earlier survey), young API. Per the repo page it is a Rust crate with Python bindings covering CAN adapters, ISO-TP, DoIP and a UDS client.

**uds-c / isotp-c** (BSD, Ford, last commit 2021-08-09): stale. Their design (inject a CAN send function, feed received frames back) is worth copying as a pattern, with the licence notice kept if any code is reused.

**Archived or stale:** python-uds (archived, MIT), obd-java-api (archived, Apache), lbenthins/ecu-simulator (archived, MIT), Kayak (archived, no licence).

### 3. BMW-specific open code

**svietlik** (egzey0, MIT, 23 stars, last commit 2026-10-08) [S6]
- Verified from the README: speaks HSFZ and DoIP to the gateway, UDS to modules, no runtime dependencies, core avoids Node imports so it can bundle for React Native, the caller brings the TCP socket, scan mode is read-only.
- What we take: after our own review, the HSFZ and DoIP framing as a vendored module with notice. Its PROTOCOL notes are the nearest thing to a second source for our wire doc.
- Risk: **bus factor 1, one author, validated on one car (F82 M4 LCI) per the earlier survey.** Its other half is a light-show writer, which OpenDiag should not copy. Pin a commit.

**Boostline** (clucraft, MIT, 5 stars, last commit 2026-11-06)
- Per its README (via search page): logs ECU data on B38, B48, B58, S58, S55, N63, S63 engines over ENET, MHD and bootmod3 WiFi adapters, with road-dyno and drag-timer estimates.
- Take: learn what the logging tools already do, so OpenDiag does not duplicate it (decision A6 in direction.md). Possible upstream contribution.
- Risk: tiny, 5 stars. Needs imported engine data from a third party per the earlier survey, which we did not fetch.

**openbimmer** (openbimmer org, MIT, 4 stars, last commit 2026-10-09)
- Standard OBD-II over BLE ELM327 for N54, N55, B58, S55, N13, S58, S63. Read and clear codes.
- Take: its BMW PID list and UI ideas. Risk: tiny. Contains nothing UDS-level.

**headless-ista** (chrisbray85, MIT, 9 stars, last commit 2026-09-02)
- An MCP server that lets an AI agent operate the user's own installed ISTA+ with a human gate on writes.
- Take: only the pattern (read-only by default, typed approval for writes, tools hidden unless a flag is set).
- Risk: it drives BMW's proprietary software, which is a different legal and ToS posture from OpenDiag. Do not depend.

**EdiabasLib** (uholeschak, GPL-3.0, 965 stars, last commit 2026-11-20): the deepest BMW open project and it is GPL-3.0. Its public docs (ENET WiFi adapter page, coding page) are fine to read for facts. Do not port its code. It needs the user's own BMW data files, and OpenDiag must not.

**BMWeb** (dader34, GPL-3.0, 29 stars, last commit 2026-11-14): browser BMW diagnostics. Learn-only.

**dzid26/opendbc-BMW-E8x-E9x** (MIT, 99 stars, last commit 2025-06-23): a DBC fork for E8x and E9x. Broadcast signals, not diagnostics. Study only, and upstream opendbc already has bmw_e9x_e8x.dbc.

**BMW coding databases: none properly licensed.** What turned up:
| Item | Licence status | Verdict |
|---|---|---|
| bmw-f repos (jokinawa, brodee227) | GPL-3.0 (jokinawa); the README warns against putting BMW IP in a public repo | Learn-only. Also a warning sign |
| Forum and Scribd coding lists | Copyright of authors, not licensed for reuse | Do not copy |
| PSdZData and CAFD files | BMW proprietary, text trimmed by BMW from some versions | **Never use** |
| ediabaslib coding service | A hosted service plus GPL code | Do not depend |

Conclusion: OpenDiag's BMW "coding facts" must come from (a) owner-captured reads of their own car, (b) our own wording of forum-documented facts, (c) a contributor-submitted pack under a licence we choose (Apache-2.0 or CC0 for data we author). Plan a schema now so contributions do not need BMW files.

### 4. ELM327 and OBD-II clients

| Project | Lang | Transports | Licence | Take | Risk |
|---|---|---|---|---|---|
| kotlin-obd-api | Kotlin | Any stream | Apache-2.0 | Command channel and retry design | Mode 01 oriented, no UDS |
| SwiftOBD2 | Swift | BLE, WiFi | MIT | Demo mode, Combine publishers | Last commit 2025-10 |
| LTSupportAutomotive | Obj-C | BLE bridge | MIT | Cautionary data point | Stale since 2023-06 |
| ELMduino | C++ | BT serial | MIT | Non-blocking state machine | Single-PID guidance |
| edu-amr/elm327 | TS | Serial, TCP, Web BLE | MIT | Reconnect backoff idea | 7 stars |
| python-OBD | Python | Serial | GPL-2.0 | none | Copyleft |
| AndrOBD | Java | BT, USB, WiFi | GPL-3.0 | none | Copyleft |
| obd2 (pub.dev) | Dart | BLE ELM327 | MPL-2.0 per pub.dev | none | pub.dev says it does not implement UDS; repo licence text ambiguous |

Nothing here handles BMW UDS over ELM327, and the earlier survey and svietlik's README agree that ELM327 does not support the ENET path.

### 5. Emulators, simulators and test doubles (a real gap)

| Candidate | Licence | Fits our need | Verdict |
|---|---|---|---|
| ELM327-emulator (Ircama) | **CC-BY-NC-SA-4.0** (badge) | Most complete (scenarios, latency injection, TCP and serial and Bluetooth) | **Cannot use the code.** Non-commercial. We may read its public README for the list of behaviours and write our own emulator in our own code |
| ELM327SimAndroid (autodiag2) | GPL-3.0 | BLE and TCP, CAN and KWP2000 | Learn-only. Useful to know such a thing exists for manual testing with the owner's phone |
| doip-sim-ecu-dsl | Apache-2.0 | DoIP ECU in Kotlin | **Use for DoIP integration tests** |
| iso14229 server | MIT | UDS server logic | **Use inside our own simulator** |
| uds-server and UDSim | GPL-2.0 | CAN UDS | Learn-only |
| lbenthins/ecu-simulator | MIT, archived | OBD and UDS over CAN | Study |
| esp32-obd-simulator | Apache-2.0 | BLE ELM327 on ESP32 | Study |

Plan: build a small **OpenDiag mock adapter** that replays recorded conversations, injects latency and "NO DATA", and presents both an ELM327 text interface and an HSFZ/DoIP gateway. Rely on iso14229 and doip-sim-ecu-dsl as parts. This also supports the rule that writes stay off until a bench module exists (decision 6).

### 6. Signal and DBC databases

**OBDb** (github.com/OBDb, 897 public repos per the org page, CC-BY-SA-4.0) [S14]
- Verified: SAEJ1979 is JSON (`commands` with `hdr`, `cmd`, `freq`, `signals`; each signal has `id`, `name`, `fmt` with len, max, mul, unit), under `signalsets/v3`. Org text says most of the text is CC BY-SA 4.0, contributors keep copyright, and apps should credit the data and share changes to changed definitions under CC BY-SA 4.0.
- Take: the data as a separate package, plus its schema to validate our own signal files.
- Risk: **share-alike.** Any modification we make to OBDb signal definitions must be shared under CC-BY-SA-4.0. Keep the data pack in its own folder and repo path, mark it clearly, and never fold it into Apache source. Coverage per BMW model is uneven (survey: BMW 3 Series has 243 signals, i4 only 3). Decision A10 already schedules a counsel check.

**opendbc** (commaai, MIT, 3573 stars, last commit 2026-11-18)
- Verified file names on the dbc folder: `bmw_e9x_e8x.dbc`, `mercedes_benz_e350_2010.dbc`, and six Toyota files (`toyota_2017_ref_pt`, `toyota_adas`, `toyota_iQ_2009_can`, `toyota_prius_2010_pt`, `toyota_radar_dsu_tssp`, `toyota_tss2_adas`). The folder listing ended with "view all", so more may exist. No Lexus file shown.
- Take: broadcast CAN decoding for a future live-dashboard feature. The README states no licence note beyond the repo MIT file.
- Risk: DBC content describes broadcast traffic of specific old cars, not ENET diagnostic reads. Not useful for G-series ENET. A forum post reports decoding about 56 percent of IDs on a North American XU50 Toyota (single source) [S15].

**Other lists:** CSS Electronics data packs are commercial products, not licensed for redistribution (not fetched, so low confidence). The OBD-II PID table on Wikipedia is CC-BY-SA, but I did not fetch it this run.

### 7. Standards direction

Eclipse OpenSOVD is the strongest Apache-2.0 body of work in the field. Search results said Mercedes-Benz leads the classic diagnostic adapter workstream and BMW is working on a SOVD-to-UDS proxy [S16]. **UNVERIFIED:** the governance page fetched in the fact-check pass names neither company; it only lists SOVD-to-UDS translation via adapters as in scope. Repos are young (opensovd 49 stars, classic-diagnostic-adapter 31). Take: watch. Possible later benefit if cars expose SOVD. No impact on the first release.

### 8. BLE layer

| Library | Platform | Licence | Last commit | Stars |
|---|---|---|---|---|
| bleak | Python desktop | MIT | 2026-11-07 | 2580 |
| btleplug | Rust desktop and mobile | Apache-2.0 or MIT | 2026-10-10 | 1193 |
| capacitor-community/bluetooth-le | Capacitor | MIT | 2026-11-18 | 358 |
| react-native-ble-plx | React Native | Apache-2.0 | 2026-03-09 | 3444 |
| abandonware/noble | Node | MIT | 2025-02-09 | 601 |

All permissive. Choice follows the UI framework decision (still open). The claim that classic Bluetooth adapters do not work on iPhone is **UNVERIFIED here**: tag [S17] only points at the opendbc file list and does not support it. It rests on the earlier survey; re-source before relying on it.

### 9. Car Scanner-like apps

Car Scanner itself is closed (not examined here). Open apps found: AndrOBD (GPL-3.0), OpenOBD (GPL-3.0), Telltale (GPL-3.0 per search), ObdGraphs (not checked), myOBC (MIT but 6 stars), openbimmer (MIT, 4 stars). **No permissively licensed, maintained, polished, cross-platform OBD app exists.** That matches the earlier "gap" finding in direction.md.

## Recommended reuse plan

| Layer | Use | How |
|---|---|---|
| Protocol reference and test oracle | udsoncan, python-can-isotp, python-doipclient | Pip dev dependencies. Record our own sessions and replay into them. Never ship |
| Protocol core (ours) | Own code, informed by svietlik and the Python MIT libs | Apache-2.0, copy only notice-tracked MIT pieces |
| Simulator | iso14229, doip-sim-ecu-dsl, our own mock adapter | Bench and CI |
| Signal data | OBDb pack (separate), opendbc DBC (MIT) | Keep OBDb apart. Add THIRD_PARTY.md |
| BLE | Whatever matches the UI stack | All options permissive |
| Capture analysis | Wireshark, SavvyCAN, can-utils, Scapy | Tools only, not linked |
| Learn-only | EdiabasLib, AndrOBD, python-OBD, OpenVehicleDiag, ELM327-emulator, ecu_diagnostics | Read public docs only. No source copied |

Process rules to adopt now:
1. Add a `THIRD_PARTY.md` listing each vendored item, commit hash, licence, date added.
2. Add a CI check that fails if a GPL, AGPL or CC-NC licence appears in any dependency manifest.
3. Mark the OBDb data pack as its own licence zone in the repo layout.
4. Write a one-page "clean-room log": who read what, and a rule that anyone who read GPL source for porting purposes does not write the matching module.

## Risks summary

| Risk | Where | Mitigation |
|---|---|---|
| LGPL treated as MIT | python-can | Dynamic dependency only |
| Share-alike spreading | OBDb | Separate pack. Counsel call |
| Non-commercial licence | ELM327-emulator | Do not use code |
| Single-maintainer upstream | svietlik, Boostline, openbimmer, headless-ista | Pin commits. Own the fork |
| Stale upstream | uds-c, isotp-c, LTSupportAutomotive | Study patterns only |
| Ambiguous licence | Flutter-OBD2, DoIP-Lib, socketcan-isotp (crate), PyVCDS | Treat as learn-only until clarified |
| Proprietary-data projects | EdiabasLib, headless-ista, fake-car | Do not depend; no BMW files in our repo or tests |
| Per-file dual licence | can-utils | Use as tool; no copying |

## Gaps

- Fact-check pass 2026-11-20: 12 claims re-tested. Confirmed: python-can LGPL-3.0, svietlik README, OBDb licence and 897 repos, opendbc file names, iso14229, kernel ISO-TP, HSFZ ports. Corrected: ELM327-emulator is CC-BY-NC-SA-4.0 per repo badge. Marked UNVERIFIED: doipclient default version, udsoncan callback boundary, OpenSOVD Mercedes/BMW roles, iPhone classic-Bluetooth claim, I-CAN-hack contributor count.
- Star counts, commit dates and licences for rows not re-fetched in that pass were not re-checked.

- GitHub API quota ran out, so languages for about 35 repos are from the earlier survey or READMEs, not re-counted.
- Stars were read from the repo HTML; GitHub's licence badge was not available, so licences come from raw file text. A few rows have no root licence file (marked NO FILE) and might have a licence elsewhere.
- Not fetched: PROTOCOL notes in svietlik, Boostline README beyond the search snippet, Telltale licence, doip-server (PyPI) licence, uds-rs source, DoIP-Lib new location, OBDb BMW coverage counts (taken from the earlier survey), CSS Electronics data licence, Wikipedia PID licence.
- No code from any GPL or non-commercial project was read.
- Toyota and Lexus: only OBDb and opendbc are properly licensed. No open diagnostic (UDS) database found for Toyota or Mercedes.
- VAG: no licensed coding database found. PyVCDS and VAG-Coding are GPL and tiny. Ross-Tech label files are proprietary. Out of current scope but noted.
- Counsel has not reviewed the OBDb share-alike or the LGPL reading.

## Sources

Retrieved 2026-11-20. Repository facts come from the repo pages, raw LICENSE files and commit feeds on github.com and raw.githubusercontent.com (pattern: `https://github.com/<owner>/<repo>`, `https://raw.githubusercontent.com/<owner>/<repo>/HEAD/LICENSE`, `https://github.com/<owner>/<repo>/commits.atom`).

- [S1] https://github.com/hardbyte/python-can (LICENSE.txt matched LGPL-3; confidence high)
- [S2] Method: raw licence files plus GitHub page and Atom feeds, per repo above (high)
- [S3] https://github.com/pylessard/python-udsoncan (MIT, high)
- [S4] https://github.com/pylessard/python-can-isotp (MIT, high)
- [S5] https://github.com/jacobschaer/python-doipclient (MIT, high)
- [S6] https://github.com/egzey0/svietlik (MIT, README read, high)
- [S7] https://github.com/driftregion/iso14229 (MIT, high)
- [S8] https://github.com/doip-sim-ecu/doip-sim-ecu-dsl (Apache-2.0, high)
- [S9] https://docs.kernel.org/networking/iso15765-2.html (re-fetched: ISO-TP is built into the kernel CAN stack via CAN_ISOTP sockets; first kernel version not stated, high)
- [S10] https://scapy.readthedocs.io/en/latest/api/scapy.contrib.automotive.bmw.hsfz.html (HSFZ layer exists, medium)
- [S11] https://gitea.osmocom.org/osmocom/wireshark/src/branch/master/epan/dissectors/packet-hsfz.c (GPL-2.0-or-later header per search result, medium)
- [S12] https://quantexlab.com/en/develop/elm327_hsfz.html (re-fetched: HSFZ TCP 6801, UDP discovery 6811, high)
- [S13] https://github.com/mercedes-benz/odxtools (MIT, high)
- [S14] https://github.com/OBDb, https://github.com/OBDb/SAEJ1979 (CC-BY-SA-4.0, 897 repos, schema, high)
- [S15] https://community.home-assistant.io/t/project-decoding-my-toyotas-can-bus-from-scratch-to-rebuild-the-factory-app-read-only-in-ha/1020667 (single forum source, low)
- [S16] https://projects.eclipse.org/projects/automotive.opensovd/governance and https://github.com/eclipse-opensovd/opensovd (Apache-2.0, high; Mercedes and BMW workstream roles from search result only, governance page did not confirm, low)
- [S17] https://github.com/commaai/opendbc/tree/master/opendbc/dbc (DBC file names, high; re-fetched and confirmed. Not a source for any Bluetooth or iPhone claim)
- https://github.com/uholeschak/ediabaslib (GPL-3.0 via license.md, high)
- https://github.com/Ircama/ELM327-emulator (repo page shows a CC-BY-NC-SA-4.0 badge, fact-check pass 2026-11-20, medium-high; earlier text here said plain CC-BY-NC)
- https://f-droid.org/en/packages/com.github.autodiag2.elm327emu/ (GPL-3.0, high)
- https://pub.dev/packages/obd2 (MPL-2.0 on pub.dev, no UDS, high)
- https://github.com/clucraft/Boostline, https://github.com/openbimmer/openbimmer, https://github.com/chrisbray85/headless-ista (MIT, high; descriptions from search pages, medium)
- https://github.com/eclipse-opensovd/classic-diagnostic-adapter (Apache-2.0, high). odx-converter and uds2sovd-proxy were named without full URLs and not re-fetched (UNVERIFIED)
- https://github.com/linux-can/can-utils (per-file SPDX GPL-2.0-only OR BSD-3-Clause, high)
- https://github.com/commaai/openpilot, https://github.com/commaai/panda (MIT, high)
