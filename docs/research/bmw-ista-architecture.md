# BMW diagnostic ecosystem: architecture from public information

Clean-room note: this document describes how the BMW toolchain is organised, using standards, BMW training material, forum documentation and open-source projects. It reproduces no proprietary data files, and it links to no leaked software or data packs. Claims not backed by a source are marked "(unverified)" and must be checked against a real vehicle trace before OpenDiag relies on them.

## Summary

BMW's workshop stack is a pipeline of separate products. It is not one program.

- **Diagnosis layer.** ISTA/D (internal name Rheingold, now branded ISTA+) is the guided diagnosis front end. It sits on EDIABAS, an interpreter that runs per-ECU job scripts (SGBD/PRG files) to talk to the car.
- **Programming layer.** ISTA/P and the developer tool E-Sys sit on PSdZ ("Programmiersystem der Zukunft"), which flashes and codes ECUs. PSdZ works from the vehicle order (FA), the installed-software table (SVT) and a target integration level (I-level), plus a large library of software and coding data (PSdZData).
- **Vehicle side.** Since the F-series, the car exposes a central gateway (ZGW) that speaks BMW's HSFZ protocol over Ethernet (ENET cable) and routes UDS to ECUs on CAN, FlexRay, MOST and Ethernet.
- **The hard part is data, not protocol.** The wire protocols are small and mostly documented in public. The value, and the difficulty, is in thousands of per-ECU job descriptions, coding data and repair content that BMW maintains per model and release.

OpenDiag can reproduce the capability (read faults, identify the car, read and change coding, run service functions) with original code and an original data format. It cannot and should not copy BMW's data. A community-built data pack is the realistic route.

## How it works

### Tool map

| Tool | Role | Era / vehicles | Notes |
|---|---|---|---|
| ISTA/D, ISTA+, "Rheingold" | Guided diagnosis, test plans, repair info, service functions | E-series through G-series | Names are used interchangeably by enthusiast sources [4] |
| ISTA/P | Programming and coding front end | F01 on, replaced Progman | BMW training doc describes it [1] (unverified, source link removed) |
| EDIABAS | Diagnostic runtime and API layer | All | Runs SGBD jobs, owns interface drivers [5][6] |
| SGBD / PRG / GRP | Per-ECU job description files (group files select a PRG by ECU identity) | All | Compiled bytecode, see below [6][7] |
| INPA, Tool32 | Engineer tools over EDIABAS | E-series era (INPA); all (Tool32) | INPA runs scripted screens; Tool32 calls raw jobs (unverified detail) |
| NCS Expert | Coding for E-series | Pre-F-series | Works on vehicle-order driven coding (unverified detail) |
| E-Sys | Coding and flashing for F/G/I | F-series on | Shows FA, FP, SVT panes [2] |
| PSdZ | Programming engine behind ISTA/P and E-Sys | F-series on | Not a user tool; a library plus data |
| ICOM A/B/C | BMW's own vehicle interfaces | All | A for CAN/Ethernet, B for MOST, C for round-connector cars [1] (unverified) |

### Diagnosis path: ISTA to ECU

1. ISTA identifies the vehicle (VIN, FA, installed ECUs) and picks the matching ECU description for each module.
2. For each ECU it asks EDIABAS to run named jobs. An SGBD holds callable jobs. Each job turns arguments into diagnostic telegrams, and turns the reply into named, typed results [5].
3. EDIABAS sends the telegrams through an interface driver: ICOM, a serial K+DCAN cable, or ENET.
4. Results flow back to ISTA, which uses them in test plans and displays.

An SGBD begins with an info header (ECU name, origin, revision, author) and a job list. Typical jobs are INFO, INITIALISIERUNG (run automatically on first access), IDENT (read identification data, for example by service 0x22 with a data identifier), fault memory read and clear, status read and actuator control [5].

### EDIABAS job files at the byte level

BEST/2 is a C-like language for describing ECUs. Source (`.b2v`) is compiled to `.prg` bytecode that the EDIABAS runtime executes (forum report, treat as unverified) [8]. An open-source reimplementation's reverse-engineered notes describe [7]:

| Element | Description |
|---|---|
| Containers | A legacy PRG/GRP format with a fixed 32-byte header, and an "EDIABAS OBJECT" format with metadata as text plus binary lists; data from offset 0xA0 is XOR-encoded in the second format |
| Sections | String table (null-terminated CP1252), job table, bytecode, and table/job lists |
| Job entry | Name, bytecode start offset, argument and result counts; names, types and comments for each argument and result |
| Virtual machine | Register machine with 8-bit (B/A), 16-bit (I), 32-bit (L), string (S) and 64-bit float (F) registers, flags Z/C/V/S, three stacks |
| Instructions | Opcode, addressing-mode byte, operands; 16 addressing modes; about 184 opcodes (arithmetic, jumps, string and binary handling, result emission, communication, table lookup) |
| Result types | Unsigned byte/word/dword, signed char/int/long, real, string, binary |

An SGBD therefore contains real code, not just tables. Each job can branch on ECU variant, split multi-frame replies, scale raw values to engineering units and look up text for fault codes. The open-source interpreter ediabaslib reads `.GRP` and `.PRG` files directly and implements most BEST/1 commands. Its author notes some commands are guessed because no BEST/1 specification was available [6].

### Wire protocols under EDIABAS

ediabaslib's supported list is a fair map of what BMW used over time: D-CAN, BMW-FAST, KWP-2000 (and a BMW variant), DS2, DS1, Concept 1, 2 and 3, ISO 9141 [6]. For modern cars the relevant ones are UDS over D-CAN (ISO 14229 on CAN) and UDS over Ethernet (HSFZ).

### HSFZ over ENET

HSFZ is BMW's TCP framing for diagnostics, distinct from standard DoIP (ISO 13400) [3][9]. Public facts:

| Item | Value | Source |
|---|---|---|
| Diagnostic port | TCP 6801 | [3][9] |
| Discovery | UDP 6811 | [9] (another source calls 6811 a "control port" [10]) |
| Header | 4-byte length, 2-byte control word | [9] |
| Addresses | 1 byte each; tester default 0xF4; ZGW typically 0x10; engine ECU example 0x12 | [9] |
| Control words | 0x01 diagnostic request/response, 0x02 acknowledge, 0x10 terminal 15, 0x11 vehicle ident, 0x12 alive check, 0x13 status inquiry, 0x40 to 0x45 error replies (bad tester address, control word, format, destination address, message too large, app not ready), 0xFF out of memory | [3] |
| Cable | Standard OBD pins with activation line on pin 8 (Ethernet pinout option 1) | [11] |

Illustrative request, read VIN (DID 0xF190) from the ECU at 0x12 (my construction from the above, length semantics unverified):

```
00 00 00 05  00 01  F4 12  22 F1 90
 length=5    ctrl   src dst  UDS ReadDataByIdentifier
```

Here length counts the two address bytes plus the three UDS bytes. Expect a 0x02 acknowledge frame first, then a 0x01 frame with `62 F1 90 <17 bytes>` (unverified; confirm with a capture). One public example frame shows a response beginning `10 00 F4 00 62 F1 90`, which contradicts the vendor's own description, so the exact header layout needs a capture to settle [9].

## The programming and coding data model

### Vocabulary (public definitions)

| Term | Meaning | Source |
|---|---|---|
| FA / VO | Vehicle order (Fahrzeugauftrag): the list of options the car was built with | [2][12] |
| FP | Vehicle profile, derived from the FA by "calculate FP" | [2] |
| SVT | System installation table: which ECUs and software the car has. Exists as SVT_IST (actual, read from car) and SVT_SOLL (target, calculated) | [2][12] |
| SWE | Software entry (a unit of software on an ECU) | [12] |
| TAL | Transaction list (what to flash, code, delete) | [12] |
| I-level / I-step | Integration level, e.g. F020-17-03-500: system reference, production date (year-month), level number | [13] |
| CAF / CAFD | Coding application file; the data file that describes one ECU's coding | [12] |
| FDL | Function data list: the named coding values inside a CAFD | [12] |
| PSdZ | The programming engine | [12] |
| ZGW | Central gateway | [12] |

### Programming flow (from BMW training material; unverified, source link removed in review)

BMW's ISTA/P training document describes three kinds of change [1]:

- **Programming (flash):** loads new program and/or data into an ECU.
- **Coding:** activates functions already in the ECU according to the vehicle order.
- **Customizing:** customer settings, either saved and restored automatically (CBS/CKM data, personal profile) or entered by the customer.

ISTA/P builds a measures plan (a configurable list of steps, shown as chart or table) for vehicles bound to an I-level. The eight-step process is: identify vehicle and read ECUs; produce the plan; prepare and export CBS/CKM data; carry out repairs and swaps; recheck identity and update the plan; program (with automatic coding afterwards); follow-up and re-import CBS/CKM; finish [1].

The document also states operational rules worth copying into any open tool. The battery must stay above 13 V on an approved charger in external-supply mode. Diagnosis must show no faults first. Nothing should be touched in the car during the run. The car must sleep for at least 5 minutes afterwards on the 2020-era electrical system [1].

### E-Sys coding in practice

Community guides describe the sequence: read and activate the FA, calculate the FP (an error means the FA is inconsistent), read the SVT, select the ECU's CAFD, edit FDL values, then code. They warn against "Code Default Values", which overwrites customisations [2]. A reported failure, "SVK-Ist does not match expected SGBMIDs", comes from building SVT_SOLL with the wrong I-step; the suggested fix is to recalculate it taking hardware IDs from SVT_IST [2]. This is anecdotal.

### SVK, SGBM-ID and I-step composition

Each ECU reports a software version key (SVK) listing the software entries it holds. Each entry is identified by a process class (such as hardware, bootloader, flash software, coding data) plus an identifier and version (unverified; no public specification found). The I-step is a bill of materials: for a given I-step, it fixes which version of each entry every ECU should carry. SVT_SOLL is that bill of materials applied to this car's FA and ECU list. No public source documents the SVK wire format. OpenDiag must derive it from traces of a car it owns.

### Architecture generations

The F01 introduced Ethernet on the OBD connector (unverified) and a new ECU architecture [1]. Later BN2020 cars (the 2020-era electrical system) keep the gateway model [1]. Details of BN2020 bus topology beyond that are not in the sources I could read (unverified).

## Fault code to repair mapping and test plans

I found no public description of ISTA's content database. What is documented is the user-visible behaviour. A vehicle test reads each ECU's fault memory, ISTA proposes test plans, and follow-up work such as calibrations, initialisations and service functions must be confirmed one by one after programming [1]. Enthusiast listings mention SQLite databases bundled with the software, with unknown schema (unverified) [4]. I assume the structure is: fault code, then a test plan (a scripted decision tree calling EDIABAS jobs), then repair instructions and wiring documents (unverified). The pieces ISTA binds together are:

| Piece | What it does |
|---|---|
| Fault decode | ECU DTC bytes to text via SGBD tables |
| Test plan | Scripted procedure: ask questions, run jobs, measure, branch |
| Service function | A guided, often safety-gated procedure (reset adaptation, bleed brakes, register battery, calibrate steering angle) built from jobs |
| Repair content | Text, diagrams, torque values, parts, localised |

## What is hard

| Problem | Why it is hard |
|---|---|
| Per-ECU job data | Thousands of ECU variants across about 25 years. Each needs correct service IDs, scaling, units and fault texts. Nobody can legally copy BMW's. |
| No public specification of the SGBD/PRG format | Open implementations are reverse-engineered and partly guessed [6][7]. |
| CAFD structure | The data file maps named options to bit positions per ECU per software version. Format and contents are proprietary; community guides show that even trimmed data breaks coding [2]. |
| Software and I-step data | Flashing needs signed ECU software from BMW. It cannot be redistributed, and cannot be generated. |
| Security access | Many writes need seed-key unlock or authenticated sessions; newer cars tighten this (unverified). |
| Safe flashing | Power, sleep, ordering and rollback rules are many. A failed flash can brick an ECU [1]. |
| Test plans and repair text | Large authored content. Copying is infringement; rewriting needs real expertise. |
| Version drift | A coding map valid for one ECU software release may shift in the next [2]. |
| Content volume | Mirrors of the full ISTA install exceed 280 GB per a forum report, dominated by documentation and media [4]. |

## Open-source options

| Project | What it gives | License / caveat |
|---|---|---|
| ediabaslib (uholeschak) | .NET interpreter for GRP/PRG, ENET and K+DCAN adapter support, Android app [6] | GPL-3.0, incompatible with copying into an Apache-2.0 codebase; use only as behavioural reference. It needs the ECU files from elsewhere and does not say where they come from [6]. |
| EdiabasX (emdzej) | Reverse-engineered PRG/OBJECT format notes and interpreter [7] | Licence not stated on the page I read [7]; its hosted SGBD documentation pages are derived from BMW data files, so OpenDiag should not use them as a source |
| Scapy HSFZ contrib | Packet definitions, control words, scanning [3] | GPL-2.0 (unverified); reference only |
| python-doipclient | Standard DoIP (ISO 13400) client [11] | Standard protocol; check licence before depending on it |
| odxtools | Python tooling for ODX (ISO 22901) diagnostic descriptions [14] | Useful as a model for an open description format |
| Commercial apps (BimmerLink, BimmerCode) | Prior art in phone-based coding | Closed; used for feature comparison only |

## Implications for OpenDiag

- **Do not build an EDIABAS clone.** Reimplementing the bytecode VM is possible but pointless without the PRG files, and we cannot ship them. Define an original, declarative description format instead (YAML or JSON, ODX-inspired [14]): DID or routine, scaling, units, enums, fault-text tables.
- **Write the transport once, from the standards.** UDS (ISO 14229) over CAN, plus an HSFZ transport (TCP 6801, UDP 6811, 6-byte header, 1-byte addresses) [3][9], plus standard DoIP for other makes [11]. Verify against a captured session before trusting the field layout.
- **Build the data pack from public and first-party sources.** Candidates: UDS standard identifiers (0xF1xx identification data); user-contributed traces from their own cars; community-authored descriptions under an open licence; BMW's published training and workshop-info pages. Each entry gets a provenance field.
- **Identification and fault reading first.** These need only standard UDS and ZGW routing, and give most of the value. VIN, ECU address scan (the Scapy scan model [3]), DTC read and clear.
- **Coding as read, diff, write.** Read an ECU's coding block, let the user change one named option, write back, with an automatic backup and a one-click restore. Option maps are learned by diffing blocks across known states on cars the contributor owns. This yields an original FDL-equivalent without touching CAFD files. Safety rules are covered in `coding-security-failsafe.md` in this folder.
- **Skip flashing in v1.** It depends on BMW-signed software and the SVT/TAL machinery. Offer only coding, adaptations and service functions. Copy the safety preconditions from BMW's own procedure (voltage above 13 V, no faults, car asleep afterwards) [1].
- **Service functions as scripts.** A small, sandboxed step language: precondition checks, jobs, user prompts, postconditions.
- **Licence hygiene.** Contributors must attest that they did not use ripped ISTA, PSdZData, SGBD or CAFD content. Keep ediabaslib and Scapy as read-only references and do not paste code.

## Open questions

1. Exact HSFZ length semantics and the acknowledge sequence. One public example frame contradicts its own text [9]. Needs a capture.
2. SVK/SGBM-ID wire format and the DID that returns it.
3. Whether UDS-level coding reads and writes on G-series require authentication (and whether that is bypassable only through BMW's own servers).
4. Whether the legal position on reading proprietary file formats for interoperability applies for each jurisdiction. Needs counsel, not guesswork.
5. How ISTA content is stored (SQLite schema, documents). No public description found.
6. What fraction of useful coding can be learned from owner-contributed diffs, and how reliable those maps are across software versions [2].
7. Which cars use plain DoIP instead of HSFZ, and whether routing activation is required (reports conflict) [9][11].

> Evidence update 2026-11-20 (deep pass, see `research/deep/`): (1) HSFZ framing now has four agreeing sources and big-endian length one (Black Hat paper); the length-includes-addresses question and the example frame that contradicts its text still need a capture. (2) For independent shops BMW's official ISTA links are ICOM or an SAE J2534 pass-thru; ENET and K+DCAN are not in the official requirement lists (they work unofficially). (3) Open-source options are wider than listed above: two MIT TypeScript projects (svietlik, Boostline) already speak HSFZ and DoIP and enforce read-only in code; both are small and single-source. (4) Open question 7 stays open per model.

## Sources

1. BMW technical training material on ISTA/P (third-party hosted; link removed in review because the upload is likely an unlicensed copy of BMW internal material). Every claim citing [1] is unverified until re-sourced from a public BMW or standards document.
2. Coding guides and forum threads (FA/FP/SVT/CAFD/FDL workflow, SVT_SOLL error): https://www.bmw-syndikat.de/bmwsyndikatforum/topic_p359056_E-Sys_Fehlermeldung_PSdZ_Error_Baureihenuebergreifendes.html
3. Scapy HSFZ contrib (control words, port 6801, default source 244): https://scapy.readthedocs.io/en/latest/api/scapy.contrib.automotive.bmw.hsfz.html
4. Enthusiast descriptions of ISTA-D, ISTA-P, ISTA+ and Rheingold (secondhand; vendor pages): https://techroute66.com/de/?p=16615 and https://www.bmw-syndikat.de/bmwsyndikatforum/topic399318_How_to_Use_BMW_ISTA_P_to_Program_and_Code__Codierung__Diagnose_und_Programmierung.html
5. EDIABAS job/SGBD conventions: general description only. A hosted per-ECU SGBD page previously cited here was removed because it is derived from BMW data files.
6. ediabaslib repository: https://github.com/uholeschak/ediabaslib
7. EdiabasX interpreter and PRG format reference: https://emdzej.github.io/ediabasx-docs/reference/interpreter.html
8. BEST/2 compile pipeline: forum report, unverified; link removed (user-uploaded Scribd document).
9. Quantex ELM327 HSFZ notes (ports, header, addresses): https://quantexlab.com/en/develop/elm327_hsfz.html
10. EDIABAS XEnet32 analysis: https://emdzej.github.io/ediabasx-docs/reference/interfaces/xenet32-analysis.html
11. python-doipclient automotive Ethernet primer: https://python-doipclient.readthedocs.io/en/latest/automotive_ethernet.html
12. BMW hacking glossary (FA, FDL, PSdZ, SVT, SWE, TAL, ZGW): https://antoniovazquezblanco.github.io/BMW-Hacking/glossary
13. Integration level format (NHTSA-hosted BMW bulletins): https://static.nhtsa.gov/odi/tsbs/2024/MC-11002658-0001.pdf
14. odxtools: https://pypi.org/project/odxtools
