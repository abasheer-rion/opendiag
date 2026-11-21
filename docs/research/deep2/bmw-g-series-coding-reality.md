# BMW G-series and newer (2017+): what coding and diagnostics are really possible over ENET and OBD

Status: PARTIAL (revision 2, 2026-11-20; see "Method and honesty box"). Written for the OpenDiag research sprint. Clean-room: no leaked OEM files, keys or databases were opened, requested or used. Forum facts are restated in my own words.

## Executive summary

1. Reading works almost everywhere. Fault codes, VIN and the list of control units can be read on G-series and newer with consumer adapters. No vendor says a login is needed for that. [S10, S30, S34, S21, S53] (medium)
2. Writing (coding) is where the cliff is. BimmerCode's per-chassis pages show about 106 to 210 options for F-series and 2017 to 2023 G-series cars. Its model pages label G05 and G07 facelift cars, G70, G60, i5 and iX "limited support", and the 2024+ X3 (G45) "not supported". [S3, S5, S7, S9, S11, S12, S16, S38] (high for the labels, low for the reason)
3. BMW's own 2026 bulletin shows that, on the newest platforms, some modules log "Coding data not released, signature" faults. The bulletin blames a software error in the central platform's secure element, not outside tools. So it shows signature checks exist, not that they block third-party coding. [S22] (high for the text, low for any wider meaning). Vendors say coding files must be signed by BMW's back end. Forum owners relay the same from BimmerCode support for G60 and the 2024 X5. [S20, S37, S47, S59] (medium, never from BMW)
4. BMW has had a certificate scheme between head unit, telematics box, rear screens and cluster since at least late 2018. The bulletin was first issued November 2018 and revised 2020-08-26. It matters when one of those parts is replaced. [S23] (high)
5. The open-source EdiabasLib added UDS authentication ("S29") with ISTA certificates for DoIP in 2025 and 2026. That is the strongest public sign that newer cars ask the tester to prove who it is. [S39, S41] (high that it exists, nothing public on exactly which services are gated)
6. BimmerCode backs up a unit each time (iOS) or the first time (Android, desktop) it reads it. Restores can fail, and a dealer reflash can make an old backup useless. [S2, S59] (high design, low to medium failure reports)
7. Dealer and over-the-air updates can undo coding. Evidence is forum stories only. [S33, S59] (low to medium)
8. Newer cars also ignore some codings even when the write succeeds, for example start-stop disable from software level 23-3. [S3, S5, S7] (high)
9. For OpenDiag (read-only on cars, writes bench-only): read, snapshot, diff, and plain "this car does not allow it" messages. Nothing here supports writing to G-series cars from an open tool.
10. Biggest unknowns: exact gateway filter rules, which reads need a session or authentication on 2023+ cars, and why some options need a listed adapter. See Gaps.

## What is new in revision 2

- Per-model support labels and year ranges from BimmerCode's vehicle pages (section 4.5).
- EdiabasLib release notes on S29 authentication and DoIP certificates (section 3.4).
- BMW-cooperating security research (Keen Lab and BMW, 2018 and 2019) describing the gateway and diagnostic tester addresses (section 1.5).
- Vendor claims on NCD 2.0 and 3.0, with dates that disagree (section 3.2).
- Forum evidence through search summaries for LCI X5, G60, G70, i4 (section 3.5). Forum pages themselves stayed blocked.
- BimmerCode's own refusal checks (section 7.4) and an open-source G-series scanner that never writes coding (section 5).

## Method and honesty box

- Searches that returned results: about 35 in total across both revisions. Pages I opened and read: about 70 (bimmercode.app pages, App Store listing, vendor pages, BMW North America service bulletins hosted by NHTSA, a BMW user guide, EdiabasLib docs, an ISO 13400 primer, forum and shop pages).
- Revision 2 note: Bimmerfest and i4talk now redirect crawlers to a pay-per-crawl host that answers 402 Payment Required, so I did not pay or read them. Bimmerpost still returns 403, and the Wayback Machine is blocked in this tool. Forum evidence is therefore again search-summary only.
- Bimmerpost, Bimmerfest, SupraMKV and Reddit mirrors returned 403 or redirects when opened. For those I only have the search tool's own summaries of snippets. Every claim that rests only on that is tagged "search summary" and capped at low or medium confidence. I did not read a single forum thread end to end. This is the main weakness of this document.
- BMW service bulletins came back as raw PDF. I extracted the text with a local PDF text tool, so those four are real primary text.
- I did not open the copies of BMW training manuals on archive.org, because their provenance as authorised copies is unclear and the rules here say avoid leaked OEM material. I also did not open any page that sells signing or "bypass" services beyond reading their titles in search results.
- Chassis option counts in section 4 are tallies made by the fetch tool's summariser from each page, not hand counts. Treat them as plus or minus 10 percent.
- Today is 2026-11-20. Vendor pages dated 2026 (Abrites, July 2026 and the HIDPlanet check date) are recent, but I cannot confirm that they are still live in the same form.

## 1. How a car with a central gateway is reached over ENET and OBD

### 1.1 What the plug gives you

| Item | What the sources say | Confidence |
|---|---|---|
| Ethernet on the OBD port | ISO 13400 style pinout. Pin 8 is the activation line. Two layouts exist, differing only in where the receive pair sits (pins 3 and 11, or 1 and 9). Transmit is on 12 and 13. BMW's ENET cable appears to use the first layout. [S27] | high (standard), medium (BMW detail) |
| Activation voltage | The primer says the tester applies +5 V on pin 8. A forum report seen only in a search summary says an ENET cable showed about 12 V there. The two disagree. Verify on a real car with a meter before relying on either. [S27, S36] | low |
| Speed | 100BASE-TX (two pairs). [S27] | high |
| Discovery | A UDP broadcast on port 6811 returns, per car, the VIN, a logical address, IP and MAC. Up to 16 unique answers are deduplicated by address. [S30] | medium (single vendor doc) |
| Diagnostic channel | TCP port 6801. The vendor says no DoIP-style "routing activation" step is needed for this BMW framing. [S30] | medium |
| Gateway address | The same vendor example talks to the gateway at logical address 0x10 and reads the VIN with a standard read-by-identifier request for F190. [S30] | medium |
| Message limits | UDS payload up to 4095 bytes. No TLS. One target at a time in that vendor's bridge. [S30] | medium |

Existing OpenDiag notes already cover the HSFZ framing in depth (see `bmw-enet-hsfz-wire-protocol.md`). I only add what is new here: the vendor-documented discovery fields and the "no routing activation" statement, both single-source.

### 1.2 What the gateway does

- BMW calls it the ZGM or ZGW (central gateway). A forum-derived search summary describes it as the module that translates between the buses including Ethernet, so a fault in it can kill the Ethernet path. [S36] (low)
- A parts-guide summary says the gateway routes K-CAN, K-CAN2, PT-CAN, MOST, FlexRay and Ethernet traffic. This is about F-series parts. Nothing I read described the G30 or later gateway in detail. [S36] (low)
- An existing deep note records that generic OBD-II requests are "marshaled through the ZGM" on a G29, with the DME at 0x12 and the tester at 0xF1 on the CAN route (see `bmw-modules-dtcs-and-addressing.md`).
- Newer cars carry an Ethernet backbone with many modules on it. BMW's 2024 bulletin lists, as victims of an interrupted Body Domain Controller Ethernet bus, the amplifier, camera-based driver assistance, head unit, all-round camera, instrument panel and telematics unit. [S25] (high). The bulletin says which faults may appear "dependent upon vehicle equipment", so this shows modules that can sit behind the BDC's Ethernet controller, not that every car has all of them. Chassis on the bulletin: G01, G02, G05, G06, G07, G12, G14, G15, G16, G20, G26, G30, G32, G80, F90 to F93.
- A 2022 bulletin says some F/G cars built from 2021-09-20 to 2022-06-29 could not do Remote Software Upgrade or Remote Support until the BDC was reprogrammed, which shows the BDC takes part in the update path. [S24] (high)

What I could not establish: which requests the gateway filters from the OBD port, whether it drops traffic from an unknown tester, and what changed between G-series generations. No public source I could open states the filter rules. [Gap G1]

### 1.3 Two ways in, and why apps list adapters

- BimmerCode accepts only adapters on its own list and refuses others. Its list for F/G/I cars has ENET-based Wi-Fi boxes (UniCarScan UCSI-3000, MHD, bm3, DITUPA, Exctool, BMDiag, KIES), a plain ENET cable with an Ethernet dongle, "xA Ultra" (F and G only), and several universal adapters: OBDLink CX, MX+, LX, SX, EX, vLinker BM, BM+, MC, MC+, UniCarScan UCSI-2100, MHD Universal. [S4] (high)
- The same page lists Veepeak BLE, NEXAS NexLink, MHD Wi-Fi, THOR Wi-Fi and a DCAN USB cable for older series only, not G. [S4] (high)
- The page has two adapter sections that do not fully match each other (for example, vLinker BM+ Bluetooth is shown for E/F/G/I/R in one and "All Series" in another). [S4] (high for the inconsistency)
- The Quick Start guide says some control units in newer G-series cars can be reached only with specific adapters, and does not say which adapters or why. [S2] (high)
- BimmerCode's changelog: January 2019 (v2.17) added body-domain and crash-module coding for G-series and said it needed a UniCarScan adapter for those modules. July 2020 (v3.6) added Body Domain Controller coding for all G-series. [S10] (high)
- Option pages say many BDC_BODY2 and BDC_BODY3 options, plus some crash-module (ACSM_5) options, work only with "one of the adapters listed" for G-series. [S5, S7, S14, S15, S17, S13] (high)

Why? Not stated anywhere I read. Possible reasons (all my inference, tag low): payload size, timing, the way the adapter reaches the module through the gateway, or simply what the developer tested. Do not build on any of them. Measure it: capture the same coding read through an ENET adapter and through the OBDLink CX and compare. [Gap G2]

### 1.4 Reaching the car's own service stack

- BMW's North America user guide (copyright 2022, so possibly dated; fact-checked against the PDF text) says ISTA programs all F and G series and newer cars, and that the workshop route is an ICOM (ICOM Next recommended) or an SAE J2534 pass-through tool, with a wired LAN of at least 100 Mbit per second, an internet link to BMW's server in Munich, and an external power supply. It says a battery charger is not the same as a vehicle power supply and that programming failures or module damage can happen without stable power. [S26] (high)
- The official route therefore needs online access to BMW. Open tools do not have it. That is the core asymmetry.

### 1.5 What BMW-cooperating research says about the gateway (new)

Keen Security Lab tested BMW cars in 2017 to 2018 and published a summary report and a 2019 Black Hat paper written with BMW security staff. The cars were F02, F18, F49 and the i3 (I01), not G-series, so this is background, not proof for 2020+ cars. [S44, S45] (high that the papers say this)

| Point | What the papers say | Confidence |
|---|---|---|
| Two gateway generations | Older cars have a standalone gateway ECU (ZGW). Newer ones, the i3 given as the example, fold the gateway into the body controller (BDC or FEM). | high |
| ENET reaches the gateway | The ENET link on the OBD port connects an engineer to the central gateway for offline diagnosis and for head-unit firmware work. | high |
| Gateway relays diagnostics | The gateway takes diagnostic messages from the head unit and the telematics box and forwards them to modules on other buses. | high |
| Tester source ids on the car bus | 0xF2 head-unit teleservice, 0xF3 telematics teleservice, 0xF4 OBD, 0xF5 E-NET, 0xDF broadcast. These appear in the 2019 Black Hat paper [S45], not in the 2018 summary report [S44]. | medium (reverse-engineered by the researchers) |
| No speed limit on diagnostics | On the i3 most modules still answered diagnostic messages at normal driving speed. | high (for that car) |
| Head-unit diagnostics use signed commands | The NBT head unit checks a signature on one diagnostic "tunnelling" job. The researchers could not forge it, and found a timing flaw instead. | high |
| Fixes | BMW rolled out countermeasures in summer 2018, with software updates at dealers or by USB. | high |

What this tells OpenDiag: even in 2018 the gateway was a router with a notion of who is calling (tester id), and head-unit actions were already signature-gated. Nothing in these papers describes 2020+ filter rules. [Gap G1 stays open]

A community page says F and G cars use extended addressing on the car bus, with request id 0x600 plus tester address and the target module in the first data byte. Example: tester 0xF1 asking the engine unit 0x12. The same page has an arithmetic error in its own example, so treat its detail as low confidence. [S57] (low)

### 1.6 Two network protocols on the same plug (new)

- EdiabasLib's config doc lists both HSFZ (TCP 6801, control port 6811, default tester id 0xF4) and DoIP (port 13400, tester 0x0EF3, gateway 0x0010) as options, tried in an order you can set. [S40] (high)
- Its adapter list defines the ENET type as "F series or higher with HSFZ or DoIP". G-series is not named. [S43] (high)
- An open-source scanner for F and G cars says DoIP on 13400 is used by the newest U and G series gateways, but most models still answer HSFZ. Its author tested one 2025 G20, over a J2534 cable, not ENET, and the scanner does not implement DoIP yet. [S53] (medium for the claim, low for coverage)
- A cable seller's FAQ is contradictory about whether G20 programming works over the cable. [S59 note, vendor] (low)

Plain version: there is no public table saying which G-series cars answer which protocol. Measuring it on the owner's car is a cheap, read-only test (Gap G5).

## 2. Vocabulary that matters (FA, SVT, I-level, CAFD, NCD, FSC)

| Term | Plain meaning | Evidence | Confidence |
|---|---|---|---|
| FA / VO (vehicle order) | The car's factory option list. Tools read it, edit it, save it and activate it. VO coding applies the full module configuration from the current FA. | A coding guide says VO coding usually overwrites all individually coded values and does not change the software. [S19] | medium (shop page, marketing flavour) |
| FDL coding | Editing single parameters in a module's coding file. | [S19] | medium |
| SVT | The list of software versions per module, compared against the target after a flash. | [S19] | medium |
| I-level (integration level) | A software release label for the whole car. Format seen in BMW bulletins: a series code, then year-month, then a build number, for example "S18A-25-11-560". | [S22, S24]. The pattern is my reading of the examples. | high (examples), medium (pattern) |
| CAFD | Per-module coding data file. The I-level decides which firmware and CAFD files fit, so tool data sets must match the car. | [S19] | medium |
| NCD | Coding data package on newer cars. Vendors say version 2.0 must be signed by BMW's back end. | [S20, S37] | medium |
| FSC | A feature licence in a module, for example the Active Sound Design licence in the audio module. BimmerCode tells users to deactivate it if sound coding has no effect. | [S3, S11, S12] | high |
| Coding versus programming | Coding changes data. Programming (flashing) changes software. ISTA reprograms and codes every module that is not at the latest software. | [S22, S24] | high |

Two I-level facts users hit in practice:
- From I-level 23-3, petrol cars ignore a coded start-stop disable "even if transmitted successfully". Workaround given by BimmerCode: default driving mode SPORT INDIVIDUAL. [S3, S5, S7, S14, S15] (high)
- Full-screen CarPlay coding works only with head-unit software labelled NBTevo_X or NBTevo_Y. Others need a software update at a BMW partner first. [S5, S8, S9, S13] (high)

## 3. Secure diagnostics and signing on G-series and newer

### 3.1 What BMW itself documents (primary)

1. **2018/2020, certificate between modules.** Bulletin SIB 09 02 18 (revision dated 2020-08-26, replacing an original dated November 2018; fact-checked against the PDF text) covers F90, F97, F98, G01, G02, G12 (from 03/2019), G30, G32, F44, F91 to F93, F96, G05, G06, G07, G14 to G16, G20, G29. With the new MGU head unit there is a new protection against tampering. If the MGU, the telematics box, the rear seat entertainment or the instrument cluster is replaced, the secure link between them must be set up again, and a certificate must first be created in BMW's back end. ISTA 4.14.1x made this automatic, with a manual route as fallback. [S23] (high)
2. **2022, update path depends on the BDC.** SIB 61 33 22 (2022-12-21). A software fault in the BDC made Remote Software Upgrade and Remote Support impossible on some 2021 to 2022 builds. Fix: program and code the BDC to a target I-level with ISTA 4.38.3x or later. The bulletin says ISTA reprograms and codes every module not at the latest software, and that an approved charger is required. [S24] (high)
3. **2024, Ethernet bus overloaded.** SIB 51 27 24 (2024-11-04). A voltage surge from the driver door lock motor overloads the BDC's Ethernet controller and drops audio, camera and driver assistance. Fix: replace the door lock. It spans G01 to G32, G80 and F90 to F93. [S25] (high)
4. **2026, secure element and signed coding data.** SIB 61 01 26 (revision 2026-02-20). Models include G05, G06, G07 (LCI), G45, G60, G70, I20, F74, U10, U11. During start-up the Secure Element of the "BCP" (Basic Central Platform) may fail. Several modules then log faults such as "Coding data not released, signature" (VIP, IB) or "Coding data not qualified" (ACSM, HKFM). Cause: software errors in the BCP. Fix: program and code the BCP with ISTA 4.58.2x or higher to target I-levels listed per chassis. The bulletin flags the repair as friendly to Remote Software Upgrade. It also refers to an "IRAP Control Unit Recovery" for units that fail during reprogramming. [S22] (high)

What the four tell us together: on cars built roughly 2019 and later, modules check that they belong together (certificates), that their coding data is acceptable (signature or qualification), and the central platform on the newest cars holds a secure element. Whether a third-party tool that writes coding data without BMW's blessing runs into these checks is NOT shown by any of the four bulletins. They describe repair cases (replaced parts, software faults), and the 2026 bulletin names a software error in the BCP as the cause of the "Coding data not released" faults. Treat the link to third-party coding as inference from vendor claims in 3.2 (UNVERIFIED).

### 3.2 What vendors and forums claim (secondary)

| Claim | Source | Confidence |
|---|---|---|
| NCD 2.0 introduced late 2019, coding files (CAFD and NCD) must be signed by BMW's back end, rolled out on G-series after 2021. | A retrofit shop's page, seen only in a search summary [S37]. Abrites quotes the same idea, dated July 2026, and says its tool adds "NCD2" coding support (release called upcoming, no method described). [S20] | medium (two vendors agree, no BMW text) |
| Some forum threads say paid services sign your coding file through BMW's own workshop systems. | Search summary of a 2024 forum thread [S36]. I did not open it and do not describe methods. | low |
| G-series coding with older E-Sys setups fails because trimmed coding files hide parameter names. | Search summary of forum posts [S36] | low |
| BMW added "secure feature activation" protections in 2022 with the G70 and third-generation X1. | Industry article seen in a search summary, not opened [S36] | low |
| G-chassis cars use a secured gateway and key programming needs a paid token per use (about 120 USD per token). | Retail listing for an Autel tool seen in a search summary. The page itself returned truncated text when opened. [S36] | low |
| OBDeleven: BMW introduced new restrictions in 2024+ models, so One-Click Apps are not available for them. OBDeleven "is monitoring". | OBDeleven's own support article. [S21] Fact-check note: the article's address and title are about VAG cars built from 2024, and BMW is mentioned inside it. The article gives no detail on what the restrictions are. | high (that they say it), medium (scope of "2024+") |
| NCD 2.0 began around integration level 21-03, for cars built from about mid-2021, affecting G20, G30, G05, G01, iX, i4. Writes are rejected with a signature or MAC style error while reads work. Fix sold: send FA and SVT, receive signed files. | Coding-service vendor page [S48] | medium-low (vendor sells the fix; no BMW text) |
| NCD arrived "around 2021"; NCD 2.0 covers about 95 percent of modules on 2021 to 2024 G and i cars; "NCD 3.0" is stricter and tied to 2024+ cars with iDrive 8.5 and 9. | Another coding-service vendor, published 2026-04-09 [S47] | low (unsourced figures, "3.0" is not in any BMW text I found) |
| Secure Coding 2 is a validation layer on certain ECUs, not a new E-Sys version. It depends on the ECU, coding file and software state, not on the chassis name. No dates given. | Helper-site article dated 2026-08-31 [S49] | low-medium |
| Another tool vendor says a signed coding package is produced from an FA and SVT export, one file set per module, and warns against reusing another car's files. | [S50] | low-medium |
| A "Sec4Diag" label is used by a remote-coding shop for BMW's secure diagnostic environment: protected DoIP plus authenticated UDS (service 0x29), with separate gates for diagnostic access, coding data, feature licence and module validation. The article itself says no public BMW document defines the term and the permission policy is not public. | [S46] (dated 2026-08-21) | low (inference, vendor) |
| Dates for secure coding disagree across vendors: 2018 onward, 21-03, 23-03, 23-07. | [S47, S48, S59 summaries] | low |

Disagreement worth noting: [S20] and [S37] say signing started with 2019 to 2021 cars, while [S21] puts the new restriction at 2024+. These are not necessarily in conflict. The signing may exist earlier, while mainstream coding apps worked around it or only hit it on newer platforms. Which chassis and model years are actually signed is unproven. [Gap G3]

### 3.3 How this lines up with the BimmerCode catalogue

The pattern in section 4 (rich lists for 2017 to 2021 platforms, 4 options for the newest) is consistent with the secure-platform story. It is not proof. BimmerCode never says why a page is short. It could be developer effort, a deliberate pause, or a real lock. [S11, S12, S16] (low on cause)

### 3.4 Public evidence that newer cars authenticate the tester (new)

- EdiabasLib release notes: 2025-07-30 "support for S29 authentication" plus a beta offline generator for ISTA S29 certificates. 2025-08-21 support for S29 over ICOM DoIP. 2026-02-27 the generator can export and import ISTA certificates. 2026-03-13 and 2026-06-07 improved DoIP S29 certificate handling. [S39] (high)
- The Deep OBD docs say the app wants an external DoIP sub-CA certificate chain and key container taken from ISTA, with the ISTA default password if none is given. If no valid certificate exists it makes a temporary chain "that has to be accepted by the vehicle". [S41] (high that the doc says this)
- Reading: "S29" is UDS service 0x29 (authentication). The EdiabasLib text does not say which cars or which services need it, and it does not say what happens when the temporary chain is refused. The mapping "S29 = UDS 0x29" is my reading, not stated on the page. [Gap G4, G14] (medium)
- The same project's online coding feature is a web service that relays car messages over the internet, needs a 60 A charger, and is described as comparable to ISTA vehicle-order coding. It says it is "only available for F series vehicles or higher". [S42] (high for the statements)

Why it matters: this is the one place where open-source tooling openly has to carry certificates from BMW's own workshop software to talk to the newest cars. OpenDiag should not do that (see section 9).

### 3.5 Forum picture by chassis (search summaries only)

All rows below rest on search-tool summaries of forum threads. I did not read any thread. Treat each as a lead, low confidence, and recheck by hand. [S59]

| Platform | What posters are reported to say |
|---|---|
| G05 / G06 / G07 facelift (2023-24 on, "SP21") | Several threads say third-party coding is largely closed. One relays a BimmerCode support reply that the model uses secure coding and will probably never be codable. Another says the only module outside the secure list is RAM. A 2026 X5 thread says most head-unit functions are locked but ambient colours in the body domain controller usually still work. One poster claims a software level from 03/2023 locked the engine control unit. |
| G60 / G61 (2024 on) | A thread relays the app developer saying BMW added safety measures that block third-party coding of these models, and that most control units can only be coded with BMW software. Others say BMW moved some checks to its servers. A 2024 date, so it may be stale. |
| G70 | Posters say every coding event needs the BMW server. The guide in [S51] says some G70 modules need server-side authentication or Ethernet that Bluetooth cannot reach, with no data behind it. |
| G26 i4 and iDrive 8.5 cars | Mixed. One thread claims individual values can now be coded on secure modules by editing a coding file, having a vendor sign it, and writing it back, and warns every BMW update will overwrite it. Other i4 posters say the iDrive 8.5 head unit cannot be coded by any app. |
| G20 / G30 | Many owners report that a dealer or over-the-air update wiped coding. Some report "cannot read code data" on the body domain controller after an update. |

Signal worth keeping: the "limited support" labels on BimmerCode (section 4.5) line up with the forum picture, which raises confidence that the boundary is real and sits roughly at the 2023-24 facelift and 2022+ new platforms. The cause is still not stated by BimmerCode or BMW. [S38, S59] (medium for the boundary, low for the cause)

## 4. What BimmerCode exposes, chassis by chassis

Source: the per-chassis pages on bimmercode.app (opened 2026-11-20). Counts are rough tallies from the fetch tool.

### 4.1 Summary table

| Family (BimmerCode page) | Chassis on the page | About options / categories | Main control units named | Notes |
|---|---|---|---|---|
| F30 family [S9] | F30, F31, F34, F35, F80 | ~210 / 44 | FEM_01, REM_01, FLE_02, TMS_03, CANS2, FZD__07, KOMBI variants, HU_CIC, HU_NBT, HU_NBT_EVO, ICMQL, PMA_PDC, ACSM_4B/4C, TRSVC | Older architecture with separate front and rear electronic modules. Largest catalogue. |
| F40 [S17] | F40 | not counted | BDC_BODY3, HU_NBT_EVO, HU_MGU, RAM, DME, KOMBI_CT_RD1, DKOMBI4, IHKA_PRO2, ACSM_5, ASD_01 | Already uses the newer BDC. Same adapter caveat for BDC and ACSM options. |
| I01 (i3) [S8] | I01 | ~165 / 37 | BDC_BODY (most items), HU_NBT, HU_NBT_EVO, FZD__08, KOMBI_I01_F56, IHKA_VA02, KAFAS, ACSM_4i, FLE_02, VSG01, SAS, iCAM | Includes range-extender and Welcome Lights lists (22 items). Page is titled i3. The /cars/i01 address returned 404, the /cars/i3 address worked. |
| G30 family [S7] | G30, G31, G38, F90 | ~195 / 38 | HU_NBT_EVO, HU_MGU, BDC_BODY2, BDC_BODY3, DKOMBI2, DKOMBI4, FZD__35, RAM, SAS10, SAS2, DME, IHKA_PRO1, ACSM_5, KAFAS, ASD_01, FLM, HKFM2, CFAS_S15, CBFS_S15 | Largest G-series catalogue. Includes LED conversion (~18) and ambient lighting (~10). |
| G01 / F97 (X3) [S14] | G01, F97 | ~170 / 39 | Same set as G30 family | BDC_BODY2 options need a listed adapter. |
| G05 / F95 (X5) pre-LCI [S3] | G05, F95 (pre-LCI) | ~106 / 29 | FZD__35, HU_MGU, RAM, BDC_BODY3, DKOMBI4, DME, ACSM_5, SAS2, HKFM2, CFAS_S15, CBFS_S15 | The page says "pre-LCI". Whether LCI cars are covered is not stated. |
| G20 / G21 / G80 [S5] | G20, G21, G80 | ~140 / 32 | HU_MGU, HU_NBT_EVO, FZD__35, RAM, BDC_BODY3, KOMBI_CT_RD1, DKOMBI4, IHKA_PRO2, DME, ACSM_5, HKFM_2015, SAS2, CFAS_S15, CBFS_S15 | Seat, tailgate, display, audio, lighting. ASD Plus for M3/M4 only. |
| G22 / G23 / G26 / G82 / G83 [S15] | 4-series family and i4 | ~130 to 140 / 32 | Similar to G20 | Start-stop notice from I-level 23-3 (petrol). |
| G08 (iX3) [S13] | G08 | ~165 / 36 | HU_NBT_EVO, HU_MGU, BDC_BODY2 (BODY3 mentioned), DKOMBI2/4, KAFAS, FLM | Many BDC_BODY2 options need a G-series adapter. |
| G70 (7-series) [S11] | G70 | 4 / 3 | RAM, plus BDC for one setting | Pedestrian warning sound, Active Sound Design, ready-to-drive sound, signal tones. |
| G60 / G61 / G90 / G99 (5-series, M5) [S12] | G60, G61, G90, G99 | 4 / 3 | RAM, BDC for one setting | Same four options as G70. |
| U11 (X1) [S16] | U11 | 4 | RAM | Same four options. |

Note the page for the 5-series is split: G30, G31, G38 and F90 sit on one page, while G60, G61, G90, G99 sit on another. [S7, S12] The BimmerCode vehicles overview lists model names (29 entries from 1 Series to iX) without chassis codes. [S6]

### 4.2 What the options actually are

For the rich catalogues, the bulk is comfort and display settings. Examples named on the pages: seat heating and cooling levels (16 to 22 entries), instrument cluster display options (13 to 14), iDrive display options (about 11), tailgate (about 9), audio (about 8 to 9), lighting (about 6), doors and windows (6 to 7), ambient lighting, LED conversion (about 18), headlight cleaning (about 7), acoustical lock confirmation, welcome lights, mirror tilt and fold, seat-belt reminder, rear-view camera, PDC, Auto Start Stop, Sport displays, video in motion (iDrive display). [S5, S7, S9, S14] (high for the lists)

Caveats the pages themselves print (all high confidence, they are the vendor's own text):
- Many items need a second change in another module. Examples: Lane Change Assistant needs three modules, close-roof-automatically and SPORT+ need two, seat and steering wheel heating automation need the head unit and the BDC. [S5, S7, S14]
- Lane Change Assistant needs Driving Assistant Professional and a specific vehicle order entry. [S3, S5]
- Active Sound Design cannot be enabled on cars that did not have it from the factory. If coding does nothing, deactivate the ASD feature licence in the audio module. [S3, S5, S7, S11]
- Sport displays may show but do nothing if the engine unit does not send the values. [S5, S7, S9]
- Battery capacity and type coding must be followed by registering the new battery with BimmerLink. [S3, S5, S9]
- Some regional rules apply to Lane Change Assistant and Speed Limit Warning (EU named). [S3, S5, S7]
- The pages themselves contain mistakes: duplicated entries with different values and a steering wheel heating item filed under Mirrors on the 5-series page. [S7]

### 4.3 App-level scope and release history (App Store listing)

Fact-check note: in the verification pass the App Store fetch returned only the latest notes (4.4), the price and the vehicle summary. The older version rows below (2.15 to 4.3) were NOT re-confirmed and stay UNVERIFIED until someone reads the full version history. Price (49.99 USD) and the 4.4 note were confirmed.

| Version (date as shown) | What changed that matters here | Source |
|---|---|---|
| 2.15 (2018-11-16) | Auto Start Stop coding for G-series | [S10] |
| 2.17 (2019-01-29) | BDC and ACSM coding for G-series, "requires a UniCarScan adapter for these modules" | [S10] |
| 2.17.1 (2019-02-02) | Fixed X5 (G05) start-stop coding, added missing G BDC data | [S10] |
| 3.6 (2020-07-12) | Body Domain Controller coding for all G-series | [S10] |
| 3.6.1 (2020-07-16) | vLinker adapter support, MGU head unit expert mode | [S10] |
| 4.1 (2021-08-16) | 2020+ G22 and older E-series support, OBDLink CX, MHD, THOR adapters | [S10] |
| 4.2 (2023-01-20) | G26 i4, option to ignore the head unit when a third-party MMI is installed, backup file export | [S10] |
| 4.3 (2023-10-23) | G42, G87, G08 added, adapter error handling improved, fixed reads for front right light and NBT EVO head unit | [S10] |
| 4.4 (April, year not shown, after Oct 2023) | Motorcycle support, more ambient lighting options for many G-series, fix for a connection failure when the BDC does not answer, fixed model selection for new cars such as the 5-series | [S10] |

Price shown: full version 49.99 USD in the US store. Supported cars listed in the store text include 7 Series 2008+, 8 Series 2018+, X7 2019+, i4 2021+, iX 2021+, iX1 2022+, iX2 2024+. The store text does not list the 2023 or newer 5-series or i5 under their own entries beyond the "5 Series (2003+)" line, and says the detailed list is on the website. [S10] (high)

One oddity: the store text shows the 4.4 notes a second time under "2.10 (May 21, 2018)". That is a page extraction artefact, so ignore it.

### 4.4 What BimmerCode does not do (per a reseller)

A reseller page (HIDPlanet, checked against developer pages on 29 July 2026) says BimmerCode does not clear faults, run service functions, edit vehicle orders, or work coding packages (those belong to BimmerLink and BimmerUtility), and does not guarantee every option on every car. [S18] (medium, reseller)

### 4.5 Support labels and year ranges on BimmerCode vehicle pages (new, fetched 2026-11-20)

BimmerCode's model pages print one banner. Two values were seen: "Your vehicle is supported!" and "Your vehicle has limited support!". The page does not say what "limited" means. It only links to the option list and the adapter list. A third case, "Your vehicle is not supported.", appeared on the 2024+ X3. [S38] (high for the text, low for meaning)

| Generation (page) | Years shown | Banner |
|---|---|---|
| G20, G21, G80, G81 (3 Series, M3) | 2019+ | supported |
| G22, G23, G26, G82, G83 (4 Series family) | 2020+ | supported |
| G29 (Z4) | 2018+ | supported |
| F40 (1 Series) | 2019-2024 | supported |
| G30, G31, F90 (5 Series pre-G60) | 2017-2023 | supported |
| G01, F97 (X3) | 2017-2024 | supported |
| G05, F95 pre-LCI (X5) | 2018-2023 | supported |
| G07 pre-LCI (X7) | 2019-2022 | supported |
| G08 (iX3) | 2021+ | supported |
| G05, F95 LCI (X5) | 2023+ | limited support |
| G60, G61, G90, G99 (5 Series, M5) | 2023+ (fact-check fetch) | limited support |
| i5 (G60E page) | newest | limited support |
| G70 (7 Series) | 2022+ | limited support |
| i7 (G70E page) | newest | limited support |
| U11 (X1) | 2022+ | limited support |
| I20 (iX) | 2021+ | limited support |
| G45 (X3) | 2024+ | not supported |

Notes:
- Fact-check pass (2026-11-20): I re-fetched the G70, G05 LCI, G60, U11 and I20 pages and each printed "limited support". The G45 page printed "Your vehicle is not supported." (a first fetch missed it because the summariser only reported the cookie text, so these banners are easy to miss). I did not re-fetch the i5 and i7 pages, so those two rows stay as first reported.
- The i4 (G26) page printed no banner at all when fetched. The G26 sits in the supported 4 Series page, and the forum reports for iDrive 8.5 are mixed. Treat i4 as "partly". [S38, S59] (low)
- Year ranges are the page's own. "2019+" for G20 includes the 2022 facelift, which the page does not split out. Facelift is split only for the X5 and X7.
- The pattern: platforms before about 2023 are labelled supported, even those from 2021 like iX3. Facelifts from 2023 on, and the new 2022+ platforms, are labelled limited. This matches a security cutover, but the vendor has not said so. (medium for the pattern, low for the cause)
- BimmerCode's FAQ lists safeguards that block coding: a damaged boot sector on one older body module, a modified head unit, low head-unit memory (under 4 GB), and an air-conditioning pressure error. It also withholds expert mode from modules with safety functions. [S1] (high)

## 5. Other public tools and what they reach

| Tool | What it does on newer cars | Evidence | Confidence |
|---|---|---|---|
| BimmerLink | Read and clear fault codes in all control units, live data and logging, battery registration, parking brake service mode, service reset, ASD muting, exhaust flap, DPF regeneration. Model list runs by name and start year, including 8 Series 2018+, X7 2019+, i4, i5, i7, iX1, iX2 and iX3. No per-chassis limits stated. | [S34] | high (listing), low (works on all) |
| BimmerUtility | FDL, FA/VO and NCD editing. Needs ENET cable or ENET Wi-Fi. Bluetooth and BLE adapters including vLinker BM+ are not supported. | Reseller summary [S18] and App Store snippet in a search summary [S36] | medium |
| E-Sys family (ESysUltra, Esysx) | Needs ENET cable. The helper page says ESysUltra supports E-Sys up to 25.10 and PSdZData 4.58.20+. Mismatched data sets produce "No CAFD found" errors. | [S19] (shop page with marketing tone) | medium |
| OBDeleven | Scan, read, clear on all. One-click coding apps not offered on 2024+ BMW. | [S21] | high |
| Abrites (professional) | Coding on E, F and G series with a pass-through or ENET cable, charged by tokens (2 tokens per run, pack prices from 25 EUR for 25). July 2026 news says NCD2 coding is coming. | [S35, S20] | medium |
| EdiabasLib | Open source. The adapter table groups ENET under F-series and newer using HSFZ or DoIP. The listed ENET Wi-Fi box is for F-models and is discontinued. G-series is not named. | [S28, S29] | high (what is on the page) |
| OBDeleven | Scan, read and clear on BMW F, G and I cars, plus one-click coding apps for many G cars up to 2022-23 era lists; 2024+ coding apps withheld. Its own help page for BMW coverage was last updated over a year ago. | [S21] and a search summary of its support list [S59] | medium |
| BimmerUtility (iOS, free in the App Store) | Edits FDL, NCD and FA files and compares SVT and NCD files. Supported adapters on the listing: ICOM, Orange MHD, THOR. Release notes 2023 to 2025 are about data mappings, VO calculation fixes and an ambient lighting editor for the body domain controller. No secure-coding or G-series statements. A forum report says it reset a G30's values to default on each connect. | [S52], search summary [S59] | medium (listing), low (bug report) |
| G-Diag open-source scanner (MIT) | Reads modules, faults, live data and coding for F and G cars. Does not write coding or flash (README says no coding writes and no flashing). Tested on one 2025 G20 over a J2534 cable (Tactrix OpenPort 2.0 on macOS). The ENET path was only tested against its built-in simulator, and DoIP is not implemented yet (fact-check pass). The "clears faults with a two-step confirm" detail was not re-checked (UNVERIFIED). | [S53] | medium (author's own claims) |
| Deep OBD (EdiabasLib) | Android diagnostics; ENET WiFi adapters listed for F-models; online coding feature "F series or higher"; DoIP with ISTA-derived certificates. | [S41, S42, S43] | high (docs), low (real-car coverage) |
| BMW ISTA with ICOM Next or J2534 | Official programming and coding, online to BMW. | [S26] | high |

## 6. What can be read without any proof of identity

Be careful here. "Without authentication" means no seed-and-key or certificate step that I could find documented. It does not mean no limits.

| Read | Evidence | Confidence |
|---|---|---|
| Discover the car and its VIN over ENET | Vendor doc: UDP broadcast on 6811, answer includes VIN, address, IP, MAC. [S30] | medium |
| Read VIN from the gateway with a plain read-by-identifier request | Same vendor example, gateway address 0x10, identifier F190. [S30] | medium |
| Read fault codes from all modules | BimmerLink and OBDeleven both do this on current cars, and OBDeleven says it still scans on 2024+ BMW while blocking coding. [S34, S21] | medium (they do it, but session type is not stated) |
| List which control units exist and which options they support | BimmerCode's free version does this. [S2] | high |
| Read each module's coding data | BimmerCode reads coding data and saves a backup on each read (iOS). Reading is part of its normal flow, and writing is separate. [S2] | high |
| Live data / sensor values | BimmerLink does it. [S34] | medium |
| Read software versions and I-level | BimmerCode shows "I-Level, Current" in the app. [S3] | high |

Not established:
- Which read services need an extended or programming session on G-series. Not found in any source I could open. [Gap G4]
- Whether the gateway answers an unknown tester that has never shown a vendor ID or certificate. Consumer apps work, so the answer for basic reads looks like yes. [Gap G1]
- Whether reading a module that has secure coding data returns the full data or a trimmed version. A forum summary says coding files on new ECUs are "trimmed", which hides names, not values. [S36] (low)

Plain-language rule for OpenDiag: treat everything as read-only, ask for explicit confirmation before any request outside a short allow-list of read services, and report refusals (security access denied, authentication required) in plain words instead of retrying. The existing note `bmw-newer-cars-gateway-and-secure-diag.md` already covers the standard refusal codes.

## 7. What fails, what bricks, and what recovery looks like

### 7.1 Failure modes with evidence

| Failure | What happens | Evidence | Confidence |
|---|---|---|---|
| Connection drops mid-coding | App says a restore from backup returns the unit to normal. | BimmerCode FAQ. [S1] | high (vendor claim) |
| Expert mode misuse | The vendor says wrong use can need a control unit reflash and gives no support for it. | [S1, S2] | high (vendor statement) |
| "Cannot be bricked" claim | The FAQ states a unit cannot be bricked. Treat as a vendor claim with an unstated definition. The existing OpenDiag direction document already says not to copy this phrasing. | [S1] | high (the claim exists), low (that it is true in general) |
| Screen stays dark after failed coding (G30) | A poster restored the backup and the screen came back. Another G30 poster said maps were gone and an activation code was asked for after a restore. | Search summaries of two threads. [S36] | low |
| Restore fails after reaching 100 percent | A Supra owner's ECU and BDC restores failed. It worked after hard-resetting and updating the OBDLink adapter, reinstalling the app and re-importing backups. BimmerCode support pointed to the adapter, not the backup. The Supra shares BMW platform parts, so this is loosely relevant. | Search summary of a SupraMKV thread. [S36] | low to medium |
| Low battery voltage | A shop page says a low battery during coding can brick a module and recommends staying above 12.5 V. A flash can take 30 to 40 minutes. | [S19] | medium |
| "Code Default Values" | The same page says this button can wipe retrofits. | [S19] | medium |
| Mixed data versions | "No CAFD found" errors from old PSdZData. | [S19] | medium |
| Third-party head-unit mods | BimmerCode warns to restore any modified head unit before coding. | [S2] | high |
| Weak adapter or power | Without stable power, BMW itself says programming failures or damage can happen. | [S26] | high |
| ENET will not connect | App advice: lock the car and wait, or disconnect the battery negative terminal for a few minutes. | [S2] | high (the advice), low (its cause) |
| BDC "does not answer" | A BimmerCode release fixed a connection failure when the BDC was unresponsive. | [S10] | high |
| Hard brick | A vendor blog (not opened, expired certificate) describes recovering a dead G-series BDC2 with a pro tool. A 2026 G20 forum thread (search summary) lists "soft brick beyond recovery" or hardware failure with replacement and programming as possibilities. | [S36] | low |

BMW's own repair path exists: its bulletins refer to "IRAP Control Unit Recovery" for modules that fail during reprogramming, to be done before other claims. [S22] (high that it exists, nothing public on how it works)

### 7.2 Things that quietly undo or ignore coding

- Dealer or over-the-air software update: several forum owners say coding came back to factory values after an update. A G87 owner said a BimmerCode start-stop change had changed after an update and was re-coded from a backup of head unit data. A G20 owner said a 03/2021 dealer update wiped most of their coding. All through search summaries. [S36] (low to medium; several independent reports, none read in full)
- OBDeleven staff are reported by a forum poster as saying a BMW update could likely remove app changes. [S33] (low, relayed)
- BMW's remote software upgrade is described by a dealer page as delivering updates for the iDrive operating system, navigation and infotainment, installed while parked in about 20 minutes, available on most cars shipped with iDrive 7 or 8, with hardware that cannot be added later. It says nothing about coding. [S31] (medium, dealer marketing)
- A tuning shop advises turning RSU off to protect a flash tune. Menu paths differ for "Gen 1" and "Gen 2" cars. It does not say how RSU affects coding. [S32] (low, retailer)
- A new I-level can make a coded setting have no effect (start-stop from 23-3). [S3] (high)
- Method matters: a 2026 G20 forum reply (search summary) says VO coding with E-Sys or BimmerUtility overrides all codings, while FDL coding preserves existing ones and changes only what you edit. [S36] (low). It matches the shop page's description of VO coding. [S19]

### 7.3 Frequency

Nobody publishes a failure rate, as earlier notes already found. I found none either. Do not quote a number.

### 7.4 What BimmerCode refuses to do, by design (new)

Its FAQ and manual describe blocks that act like guard rails: refuse head-unit coding when third-party modifications are present, refuse when head-unit memory is under 4 GB, refuse on a flagged air-conditioning pressure error, refuse a damaged boot sector on one older body module, hide expert mode on safety modules. It also says some body-domain-controller failures are a BMW-side fault and that a 12 V battery disconnect is the only known remedy. [S1, S2] (high)

Plain read for OpenDiag: pre-flight checks are a normal part of a coding app. Our write pipeline (bench only) should have a similar visible list, and our read mode should say which checks it ran.

Forum extras (search summaries, low): a dealer reflash of one module makes that module's old backup unusable, backups can be tied to the phone that made them, and on Android a backup file may appear only after a failed write. [S59]

## 8. Backups and restores in public tools

### 8.1 BimmerCode (primary, vendor manual)

| Item | Detail |
|---|---|
| When a backup is made | iOS: each time a control unit is read. Android and desktop: the first time a control unit is read. [S2] |
| Where | iOS Files app under BimmerCode, Backups. Android: app data folder under `Android/data/de.appomotive.bimmercode/files/Backups`. Desktop: a "backups" folder opened via "Manage files". [S2] |
| Export / import | iOS: through Files or computer transfer. Android: "Backup files" menu to export or import. Desktop: no export or import described. Export was added in version 4.2 (January 2023). [S2, S10] |
| Danger | Backups are deleted if the app is uninstalled. Export first. [S2] |
| Restore (iOS) | Select unit, Backups, pick one, Done, Start coding. The last entry in the list undoes all coding. [S2] |
| Restore (Android, desktop) | Select unit, icon top right, Recovery. [S2] |
| If coding keeps failing | Restore a backup or contact support. [S2] |
| Head unit licences | Version 2.14 (2018) added a backup of the head unit's feature licence. [S10] |
| After coding | Expect temporary errors, clock reset, reset of average consumption, odd range or outside temperature readings. [S2] |
| Before coding | Engine off, third-party CAN hardware disconnected, modified head units restored. [S2] |

What the backup is: the coding data of one control unit. Not the whole car, and not software. The manual does not describe a car-wide FA or SVT backup. [S2] (high)

### 8.2 E-Sys style backups (secondary)

- Save the original FA before any change, save CAFD files per module, save the SVT when flashing. [S19] (medium)
- A forum summary says loading a backup FA does not by itself undo changes, because you must VO code the modules again. [S36] (low)
- Another summary says the CAFD folder is overwritten by default, so copy files elsewhere first. [S36] (low)
- BimmerUtility: save FA and NCD, compare offline. [S18] (medium)

### 8.3 Comparison and gaps

| Question | BimmerCode | E-Sys / BimmerUtility style | ISTA |
|---|---|---|---|
| Automatic? | Yes, on read | No, user does it | Not described in my sources |
| Scope | One module's coding data | FA, SVT, CAFD/NCD, per module or whole car | Whole car programming |
| Verified after saving? | Not described | Not described | Not described |
| Restore proven? | Reports of failures exist (adapter blamed) | Reports say VO coding needed after FA restore | n/a |

No public source I read says backups are hashed or checked by reading twice. OpenDiag decision 2 (backups mandatory, read twice, hashed) goes beyond what BimmerCode documents. That is a product advantage that can be claimed only after it is tested.

## 9. Implications for OpenDiag

Given the owner decisions (no writes on real cars in the 12-week window; bench modules only; writes compiled out of public builds), the findings fit this plan:

1. **Build for read and diff first.** Read-only functions are available on every chassis family covered: discovery, VIN, I-level, module list, fault codes, coding-data reads. The product story "snapshot before, diff after" is supported by how BimmerCode already saves data on read. [S2, S10]
2. **Show I-level prominently.** It decides what works: start-stop from 23-3, CarPlay needs NBTevo_X or _Y, ambient items from 22-07. [S3, S5, S9]
3. **Say plainly when a car is locked.** Newest platforms (G70, G60, U11 and similar) show 4 coding options on the market leader. A tool that says "this car does not allow outside coding on this module" earns trust. [S11, S12, S16, S22]
4. **Do not touch signing or certificates.** BMW's own bulletins describe them as protection against tampering. [S22, S23] Out of scope, same as the earlier bootmod3 finding for engine units.
5. **Treat power as a hard gate in software.** BMW stresses stable power and a real supply. [S26] Refuse to start any bench write below a set voltage, and warn on reads when voltage drops.
6. **Do not claim "cannot brick".** Quote what is measured. [S1] says it, no definition is given.
7. **Treat "listed adapter" as data.** The adapter page in [S4] is a compatibility table by series. OpenDiag can publish measured results per adapter and per chassis, with the owner's adapters (OBDLink CX and others) as the first rows. The CX is on BimmerCode's G-series list. [S4]
8. **Measure before promising.** Tests that would settle open questions with the owner's own car, read-only:

| Test | Question it answers | Gap |
|---|---|---|
| Same ENET capture on the owner's car: discovery, VIN, module list | Is the discovery answer shape as documented? | G5 |
| Pin 8 voltage with a meter | 5 V or 12 V | G6 |
| Same read via ENET and via OBDLink CX | Does the BDC read differ by adapter? | G2 |
| Read I-level before and after a dealer or OTA update, then diff coding data | Does an update change coding data? | G7 |
| Note refusal codes for services outside the allow-list | Where does the gateway say no? | G1, G4 |
| Capture the protocol the gateway offers (HSFZ on 6801, DoIP on 13400, or both) | Which protocol does the owner's car use? | G5, G14 |
| Record which services return "authentication required" or "security access denied" in a short read-only allow-list | Where is the S29 boundary on this car? | G4, G14 |

9. **Use capability tiers, not a yes/no.** A proposed tier per car family, built from the evidence above. The tier is data in OpenDiag's car profile and is shown to the user before any action:

| Tier | Cars (evidence) | OpenDiag read features | Write (bench only, decision 2) |
|---|---|---|---|
| A: open-style | F-series, I01, and G cars up to about 2022-23 that BimmerCode marks "supported" [S38] | Discovery, VIN, I-level, module list, faults, coding reads, snapshot and diff | Bench module only, after verified backup |
| B: partly closed | 2023+ facelifts, i4 and iDrive 8.5 cars, early G60 and G70 reports [S38, S59] | Same reads, with a "some modules may refuse" notice | Not offered |
| C: closed or unknown | 2024+ new platforms (G45, G60/G61, G70, U11), cars with secure-element faults [S22, S38] | Basic reads only until measured; show refusals in plain words | Not offered |

   Tiers are labelled "measured", "vendor-stated" or "forum-reported", in that order of trust. Never infer a tier from model year alone.
10. **Ship a plain explainer for "limited support".** Users meet that banner on the market leader without any explanation. A short page in OpenDiag that says what is known (signatures, certificates, server checks) and what is not (which modules, why) is real value. [S38, S22, S23]
11. **Do not copy the certificate path.** EdiabasLib can carry certificates exported from the workshop software. Doing the same would put OpenDiag in the position the bulletins call tampering protection, and the clean-room rule forbids using BMW workshop material. [S39, S41, S23] (policy, not a legal opinion; see `legal-regulatory-landscape-deep.md`)
12. **Use more than one protocol in the scanner.** Plan for HSFZ first and DoIP second, with the tester ids in the open docs, but treat the order as a measured setting, not a belief. [S40, S53]

## 10. Source quality and disagreements

| Topic | Strongest source | Weakness |
|---|---|---|
| Option lists per chassis | The vendor's own pages [S3 to S16] | Vendor-only. Counts are tallies. Some pages are short for unknown reasons. |
| Secure coding behaviour | BMW service bulletins [S22 to S25] | Only symptoms and fixes, not design. |
| NCD signing | Two vendor claims [S20, S37] | No BMW text. One page not opened, only a search summary. |
| Update undoes coding | Forum anecdotes [S36, S33] | Not read in full. No BMW statement. |
| Backups | Vendor manual [S2] | No failure rate. |
| Gateway filter | Nothing | Gap. |

Conflicts found:
- Pin 8 voltage: primer says +5 V, a forum summary says about 12 V. [S27 vs S36]
- BimmerCode adapter sections are inconsistent in places. [S4]
- BimmerCode says an adapter list limits BDC coding, but its list includes Bluetooth universal adapters such as the OBDLink CX, so "ENET only" is not the rule. [S4]
- Signing start date: 2019 to 2021 per vendors, 2024+ per OBDeleven. [S20, S37 vs S21]
- Further dates: "21-03" [S48], "around 2021" [S47], "23-03" and "23-07" in other summaries [S59]. None come from BMW.
- Coverage: a 2026 guide rates G70 and G60 "good and expanding" for BimmerCode, while the vendor's own pages say "limited support" and 2024 forum posts say blocked. The vendor page wins on what the app does; the guide has no data. [S51, S38, S59]
- ENET cable and G-series: one seller says G20 programming may not work over the cable, others list G60, G70 and iX as compatible. Unresolved. [S59]

## 11. Gaps (what could not be established)

| ID | Gap | Why |
|---|---|---|
| G1 | What the central gateway filters or blocks from the OBD port, and what changed between G-series generations. | No public primary text. No forum thread opened. |
| G2 | Why some BDC and crash-module options need a listed adapter. | Vendor does not say. Only my guesses, untested. |
| G3 | Which chassis and model years have signed NCD data, and what exactly is signed. | Two vendor claims only. |
| G4 | Which read services need an extended session on G-series. | No source. |
| G5 | Exact shape of the discovery reply and any keepalive on a real car. | One vendor doc only. |
| G6 | Pin 8 voltage on BMW ENET cables. | Sources disagree. |
| G7 | Whether and how often updates undo coding. | Anecdotes only. |
| G8 | Failure and restore success rates for backups. | Nobody publishes them. |
| G9 | Full contents of BimmerCode's expert mode and which modules it excludes for safety. FAQ says some are excluded. | Not named. [S1] |
| G10 | G05 LCI, G60 and later per-module coding on the market leader. Revision 2 found only the banners ("limited support"), not option lists for the LCI X5. | Page content only. |
| G11 | Forum evidence in depth (Bimmerpost G20, G30, G05, G70 subforums, Reddit r/BimmerCode). | All blocked or reduced to search summaries. A human or a browser-based pass is needed. |
| G12 | Whether SecOC-style message protection on newer BMWs affects live actuator tests. | Not covered by any source I opened. |
| G13 | Chinese, Japanese and other market differences. | Not searched. |
| G14 | Which UDS services on 2023+ cars need authentication (service 0x29) and with what certificate role. | Only EdiabasLib release notes and one vendor article; no BMW text. |
| G15 | What exactly "limited support" means on each BimmerCode page (blocked modules, missing data sets, or developer effort). | Vendor does not say. |
| G16 | Whether G20, G30 and G01 facelift cars (2022 to 2024) tighten over time under the same "supported" label. | Pages do not split the facelift except for X5 and X7. |
| G17 | Original forum text for the G05 LCI, G60, G70, i4 and iDrive 8.5 threads. | Bimmerpost 403, Bimmerfest and i4talk pay-per-crawl 402, Wayback blocked. A browser session by the owner is needed. |
| G18 | Any BMW statement on the 2024+ "secure diagnostics" design. | None found. "Sec4Diag" appears only in one vendor article, which says it is a label. |
| G19 | Whether the S29 certificate ties to a workshop identity or to a vehicle, and who revokes it. | Not in any source opened. |
| G20 | Whether any BMW text links third-party coding to the signature or certificate faults in the four bulletins. | The bulletins describe repair cases only; the 2026 one names a software error in the central platform as the cause. The link is vendor inference. |
| G21 | Older BimmerCode version history rows (2.15 to 4.3), including the "needs UniCarScan" note for 2.17. | Not re-confirmed in the fact-check pass; App Store fetch showed only the latest notes. |
| G22 | Banners for the i5, i7 and i4 pages, and whether the G45 "not supported" text is a deliberate banner or a template default. | Not re-fetched, or only seen through a summariser. |
| G23 | Several claims in 3.2 and 3.5 that rest on vendor pages and search summaries (NCD dates, "NCD 3.0", token prices). | Not re-fetched in the fact-check pass; they keep their low or medium tags. |

## 12. Sources

All opened 2026-11-20 unless stated. "SS" means only a search-tool summary of the page was available.

| ID | Source | URL |
|---|---|---|
| S1 | BimmerCode FAQ | https://bimmercode.app/faq/ |
| S2 | BimmerCode Quick Start Guide (manual) | https://bimmercode.app/manual |
| S3 | BimmerCode option page, X5 G05 / F95 | https://bimmercode.app/cars/g05 |
| S4 | BimmerCode adapters page | https://bimmercode.app/adapters |
| S5 | BimmerCode option page, 3 Series G20 family | https://bimmercode.app/cars/g20 |
| S6 | BimmerCode BMW vehicle overview | https://bimmercode.app/vehicles/bmw |
| S7 | BimmerCode option page, 5 Series G30 family | https://bimmercode.app/cars/g30 |
| S8 | BimmerCode option page, i3 I01 | https://bimmercode.app/cars/i3 |
| S9 | BimmerCode option page, 3 Series F30 family | https://bimmercode.app/cars/f30 |
| S10 | BimmerCode App Store listing and version history | https://apps.apple.com/us/app/id1130787459 |
| S11 | BimmerCode option page, 7 Series G70 | https://bimmercode.app/cars/g70 |
| S12 | BimmerCode option page, 5 Series G60 family | https://bimmercode.app/cars/g60 |
| S13 | BimmerCode option page, iX3 G08 | https://bimmercode.app/cars/g08 |
| S14 | BimmerCode option page, X3 G01 / F97 | https://bimmercode.app/cars/g01 |
| S15 | BimmerCode option page, 4 Series G22 family | https://bimmercode.app/cars/g22 |
| S16 | BimmerCode option page, X1 U11 | https://bimmercode.app/cars/u11 |
| S17 | BimmerCode option page, 1 Series F40 | https://bimmercode.app/cars/f40 |
| S18 | HIDPlanet reseller guide (vendor tone) | https://hidplanet.lv/en/useful-information/diagnostics/encoding-in-bimmercode |
| S19 | BMWHelper coding guide (promotes a launcher) | https://bmwhelper.com/coding |
| S20 | Abrites BMW NCD2 news (dated July 30, 2026) | https://abrites.com/news/abrites-diagnostics-for-bmw-rolls-royce-mini-update-ncd2-secure-coding-and-expanded-i-series-diagnostics |
| S21 | OBDeleven support article on 2024+ restrictions | https://support.obdeleven.com/en/articles/9187989-does-obdeleven-work-with-vag-vehicles-manufactured-from-2024 |
| S22 | BMW NA SIB 61 01 26, secure element failure (2026-02-20), via NHTSA | https://static.nhtsa.gov/odi/tsbs/2026/MC-11029070-0001.pdf |
| S23 | BMW NA SIB 09 02 18, ECU validation (2020-08-26), via NHTSA | https://static.nhtsa.gov/odi/tsbs/2020/MC-10179748-9999.pdf |
| S24 | BMW NA SIB 61 33 22, program the BDC (2022-12-21), via NHTSA | https://static.nhtsa.gov/odi/tsbs/2022/MC-10230734-9999.pdf |
| S25 | BMW NA SIB 51 27 24, door lock corrupting Ethernet bus (2024-11-04), via NHTSA | https://static.nhtsa.gov/odi/tsbs/2024/MC-11010762-0001.pdf |
| S26 | BMW Group Techinfo user guide (system requirements) | https://bmwtechinfo.bmwgroup.com/assets/system_requirements.pdf |
| S27 | python-doipclient, Automotive Ethernet primer | https://python-doipclient.readthedocs.io/en/latest/automotive_ethernet.html |
| S28 | EdiabasLib supported adapter types | https://uholeschak.github.io/ediabaslib/docs/AdapterTypes.html |
| S29 | EdiabasLib ENET WiFi adapter page | https://uholeschak.github.io/ediabaslib/docs/ENET_WiFi_Adapter.html |
| S30 | Quantex ELM327 HSFZ documentation (vendor) | https://quantexlab.com/en/develop/elm327_hsfz.html |
| S31 | BMW dealer page on Remote Software Upgrade (marketing) | https://www.bmwoffremont.com/research/remote-software-upgrade.htm |
| S32 | Mode Auto Concepts, disable RSU (retailer) | https://modeautoconcepts.com/de/pages/how-to-disable-remote-software-upgrade-on-your-bmw-to-prevent-loss-of-aftermarket-flash-tune |
| S33 | OBDeleven forum thread on BMW updates removing coding | https://forum.obdeleven.com/thread/20688/bmw-software-update-remove-coding |
| S34 | BimmerLink site | https://bimmerlink.app/ |
| S35 | Abrites BMW coding feature page (token prices) | https://shop-nodes.abrites.com/features/bmw-coding |
| S36 | Search-summary only (not opened, blocked or unread): Bimmerpost G20, G30, G05, G87, F30 threads, SupraMKV recovery thread, Autel G-chassis listing, industry article on 2022 feature activation, EdiabasLib/ENET listing text, G-series BDC2 recovery blog (certificate expired) | via search results. Examples: https://www.supramkv.com/threads/2023-supra-mt-bimmercode-recovery-failing.18674/ , https://g20.bimmerpost.com/forums/showthread.php?p=32734960 |
| S37 | Retrofit shop page on NCD 2.0 (SS only, redirected to a login) | https://sites.google.com/view/phadmotorrad/ncd-2-0-retrofit-coding |
| S38 | BimmerCode vehicle pages (support banners and year ranges), fetched 2026-11-20 | https://bimmercode.app/vehicles/bmw/ and per model, for example https://bimmercode.app/vehicles/bmw/7-series/g70/ , https://bimmercode.app/vehicles/bmw/x5-x5-m/g05-lci/ , https://bimmercode.app/vehicles/bmw/x3-x3-m/g45/ , https://bimmercode.app/vehicles/bmw/x1/u11/ |
| S39 | EdiabasLib release notes (S29, DoIP certificates, 2025 to 2026) | https://github.com/uholeschak/ediabaslib/releases |
| S40 | EdiabasLib config file doc (HSFZ and DoIP settings) | https://github.com/uholeschak/ediabaslib/blob/master/docs/EdiabasLib.config_file.md |
| S41 | Deep OBD for BMW and VAG doc (certificates, ENET) | https://github.com/uholeschak/ediabaslib/blob/master/docs/Deep_OBD_for_BMW_and_VAG.md |
| S42 | EdiabasLib BMW online coding doc | https://github.com/uholeschak/ediabaslib/blob/master/docs/BMW_Coding.md |
| S43 | EdiabasLib adapter types (ENET definition) | https://github.com/uholeschak/ediabaslib/blob/master/docs/AdapterTypes.md |
| S44 | Keen Security Lab, Experimental Security Assessment of BMW Cars (summary report, 2018) | https://keenlab.tencent.com/en/whitepapers/Experimental_Security_Assessment_of_BMW_Cars_by_KeenLab.pdf |
| S45 | Black Hat USA 2019 paper, 0-days and mitigations, Connected BMW cars (Keen Lab with BMW) | https://i.blackhat.com/USA-19/Thursday/us-19-Cai-0-Days-And-Mitigations-Roadways-To-Exploit-And-Secure-Connected-BMW-Cars-wp.pdf |
| S46 | TempaDrive, 2026+ Sec4Diag article (vendor, 2026-08-21) | https://tempadrive.com/en/blog/bmw-2026-sec4diag-coding-software-updates |
| S47 | TempaDrive, NCD secure coding explainer (vendor, 2026-04-09) | https://tempadrive.com/en/blog/what-is-ncd-secure-coding-bmw-anti-tampering-explained |
| S48 | KDR Coding, secure coding and NCD 2.0 (vendor) | https://kdrcoding.com/bmw-secure-coding-ncd-explained/ |
| S49 | BMWHelper, Secure Coding 2 article (2026-08-31, vendor tone) | https://bmwhelper.com/news/bmw-secure-coding-2-what-it-is-why-it-exists-and-how-to-work-with-it |
| S50 | BMW Online Tool, secure coding guide (vendor) | https://www.bmwonlinetool.com/en/guides/secure-coding/ |
| S51 | BimmerTalk OBDLink and BimmerCode guide (affiliate tone, unsourced numbers) | https://bimmertalk.com/articles/obdlink-bimmercode-bmw-coding-guide |
| S52 | BimmerUtility App Store listing | https://apps.apple.com/ky/app/bimmerutility/id1659309891 |
| S53 | G-Diag (bmwGxx) open-source F/G scanner | https://github.com/Unblonded/bmwGxx |
| S54 | API International, BMW Online Service System page (reseller) | https://www.dealer-pc.com/independent/oss |
| S55 | CodeKrew, ISTA access options for independents (reseller) | https://codekrew.com/blogs/news/bmw-ista-access-options-for-independent-shops |
| S56 | BMW Group press page on remote diagnosis (2020) | https://www.bmwgroup.com/en/news/general/2020/remote-diagnosis.html |
| S57 | Community page on BMW diagnostic architecture (contains an arithmetic slip) | https://thesecretingredient.neocities.org/bmw |
| S58 | ZGW search example repo | https://github.com/Viaszx/BMW_ZGW_Search_forwarding_and_logging |
| S59 | Search-summary only, revision 2 (threads not opened: blocked or paywalled for crawlers). Leads: G05 LCI coding threads on g05.bimmerpost.com (thread ids 2031230, 2086673, 2028189, 2219770); G60 thread 2085036 on g60.bimmerpost.com; Bimmerfest threads 1469035, 1464226, 1478100, 1478180; i4talk threads 6363, 1985, 13422; G20 threads 1906082, 1741470, 2236283 on g20.bimmerpost.com; OBDeleven BMW support list https://support.obdeleven.com/en/articles/6234249-which-bmw-models-are-supported-by-obdeleven ; GODIAG ENET FAQ https://godiagshop.blogspot.com/2024/06/godiag-gt109-doip-enet-faqs-for-bmw.html | via search results |

Pages that failed when opened (revision 1 and 2): bimmercode.app/cars/i01, /cars/f40 (worked), /cars/g12 and /cars/g26 (404), BMW newsroom press links (301 to a landing page), Bimmerpost and xbimmers and Bimmerfest threads (403 or redirect), Reddit mirror (403), Turner Motorsport bm3 adapter page (403), BMW training manual URL (404), obdii365 blog (expired certificate), reach.dog (410). Revision 2 additions: Bimmerfest and i4talk (402 pay-per-crawl redirect), Bimmerpost G05 and G20 and G60 threads (403), web.archive.org (blocked), a guessed BimmerCode page address for the G42 (404).
