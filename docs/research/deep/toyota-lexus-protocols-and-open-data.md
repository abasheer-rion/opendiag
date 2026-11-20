# Toyota/Lexus technical landscape from public sources

Research for OpenDiag, a free Apache-2.0 diagnostic, coding and tuning tool. Date of research: 2026-11-20. Scope: Toyota and Lexus protocols, open signal data, security, and the BMW-derived GR Supra.

## Method and honesty note (read first)

- The web search tool hit its per-turn budget before I could run any discovery search. Every page below came from a URL I already knew or derived from a page I had just read. I did not invent URLs. Pages that failed are listed in the ledger footer, not counted.
- Because discovery search was unavailable, **forum coverage is zero**. No Bimmerpost, Supra forum, ClubLexus, PriusChat, Toyota Nation or Reddit threads were read (Reddit is blocked to the fetch tool; two Supra forum hosts redirected or refused). No conference talk other than the Miller and Valasek paper was read. Claims that would normally rest on forum evidence are marked UNVERIFIED or left as open questions.
- Page content came through a summarising fetch tool, so it is a second-hand reading of each page. Where it said a page was truncated, I say so. I read the two PDF papers directly (Miller and Valasek in part, Koscher et al. first three pages).
- I did not read GPL or non-commercial source code. opendbc and panda are MIT, python-udsoncan is MIT, OBDb data is CC BY-SA 4.0. No leaked OEM software, seed-key algorithms or reflash procedures were opened or reproduced.
- Claims are tagged with ledger numbers like [S12]. "Single-source" means one ledger row only.

## Summary

1. Toyota and Lexus use the standard OBD-II stack on the DLC3 connector: ISO 15765-4 CAN on pins 6 and 14, 11-bit IDs, with functional requests on 7DF and engine replies on 7E8 [S5][S12][S6].
2. Beyond the standard modes, Toyota uses its own diagnostic service 0x21 (read local identifier) and service 0x22 (read data by identifier), spread over many ECU addresses [S12][S51][S52][S53].
3. The best open Toyota diagnostic data is OBDb: 60 Toyota repos matched a search of the organisation, no Lexus repo [S11]. It is CC BY-SA 4.0, which matters for an Apache-2.0 project [S2].
4. OBDb coverage is very uneven. Prius has 905 parameters, Corolla 1,060, GR Supra only 89 [S45][S54][S48]. Pelican's own counts for the Supra disagree with each other [S48].
5. comma.ai opendbc has 6 Toyota DBC files and covers about 80 Toyota and Lexus rows, but it describes the car's internal CAN, not what the OBD port exposes [S10][S8].
6. Toyota models from about 2021-2022 onward (Tundra, Sequoia, bZ4x, 2025 Camry, and a Lexus row labelled "NS" 2022-25, probably the NX) are marked "not compatible" by opendbc under a "CAN Bus Security" heading that names SecOC as one example [S8]. (The link to message authentication is the page's wording plus common knowledge; fact-check 2026-11-20 re-verified rows and years.) This is about message authentication, not about locking the OBD port.
7. I found no public source saying Toyota blocks the DLC3 with an FCA-style secure gateway. That is unknown, not "no" [open question 1].
8. Old Toyota research (Miller and Valasek, 2013) shows Toyota ECUs on a Prius used KWP/UDS-style services over CAN with security access and reprogramming support [S33]. This is a 2010 car and not representative of 2022+.
9. The A90 GR Supra is on BMW's CLAR platform with the Z4 G29 [S49][S24]. OBDb's Supra signalset uses the single request address 0x6F1, which looks like BMW-style diagnostic addressing, not Toyota's 7Bx or 7Cx scheme [S47].
10. BimmerCode states it supports the 2019 Toyota Supra [S25][S28]. I could not verify BootMod3 or ISTA Supra support from any fetched page.

## What I found

### 1. The physical and link layer (DLC3, OBD-II, CAN)

The DLC3 is Toyota's name for the standard 16-pin SAE J1962 connector. The generic connector facts are well sourced. Pin 6 is CAN high, pin 14 CAN low, pin 16 battery voltage, pin 4 chassis ground, pin 5 signal ground [S5]. CAN at 250 or 500 kbit/s has been mandatory for US cars since 2008 [S5]. Pins 1, 3, 8, 9, 11, 12 and 13 are manufacturer-defined [S5]. I did not find a page that specifically describes Toyota's use of the spare pins. The name "DLC3" itself is not defined on any page I read; I use it because the project brief does.

CAN has no built-in authentication or encryption, so any node that can transmit can be believed by receivers [S50][S34]. CAN FD raises the payload to 64 bytes and the data rate to 5 to 8 Mbit/s while keeping 1 Mbit/s arbitration, and has its own ISO-TP single and first frame formats [S43]. Which Toyota models use CAN FD on the OBD port is not stated by anything I read (open question 2).

### 2. Transport and services (ISO 15765, KWP2000, UDS)

ISO-TP splits long messages into single, first, consecutive and flow-control frames, with a flow-control frame carrying block size and minimum separation time [S6]. KWP2000 (ISO 14230) is most commonly run over CAN using ISO 15765 transport [S36]. UDS (ISO 14229) uses services such as session control 0x10, read data by identifier 0x22, security access 0x27, routine control 0x31 and the download and transfer services 0x34 to 0x37, and defines standard negative response codes like 0x33 (security access denied) and 0x78 (response pending) [S7].

The Miller and Valasek paper shows a 2010 Prius using ISO-TP and a diagnostic service list that includes a Toyota-flavoured variant: service 0x30, input/output control by local identifier, which Toyota's tool uses for active tests such as the pre-collision seat belt test [S33]. The paper also notes that some ECUs want the ISO 14230 form of session control rather than the ISO 14229 form [S33]. The same paper uses 11-bit tester and ECU ID pairs where the ECU reply ID is the request ID plus 8, for example 0x781 and 0x789 [S33]. This matches the OBDb data in section 4.

### 3. Standard PIDs and Toyota's extra service 0x21

The OBD-II PIDs page confirms the generic layout. A reader sends to 7DF, ECUs listen on 7E0 to 7E7 and reply on their ID plus 8, a positive reply adds 0x40 to the service, and 7F means refused [S12]. The same page names "service 21 for Toyota" as an example of a manufacturer-specific service [S12]. It also says most PIDs in use are non-standard and public documentation is limited [S12]. Single source for the Toyota 0x21 statement, but the OBDb data (section 4) independently shows 0x21 in use on Toyota addresses [S51][S52][S53].

SAE J1979 defines services 01 to 0A, including 01 live data, 03 stored codes, 04 clear, 09 vehicle information [S12][S5].

### 4. Toyota enhanced PIDs in practice: what OBDb tells us

OBDb stores one repo per model with `signalsets/v3/default.json` plus optional year-range override files [S2]. Each command has a request header, an optional response address, a service and identifier, a polling frequency, and one or more signals with formula, unit and description [S23]. Year gating is done with filters [S51][S52][S53].

What the Toyota files actually contain, from the raw JSON I could read (each one truncated by the fetch tool at about 100,000 characters, so counts are lower bounds):

- **Prius**: ECU list names engine 7E0, hybrid control 7E2, battery 7E3 and TPMS 750. Other request headers are 700, 701, 747, 750, 780, 7B0, 7B3, 7C0, 7C4, with responses at the request ID plus 8. Services used are 0x21 and 0x22, and Mode 01 does not appear in the visible portion. About 155 commands visible, hundreds of signals, including 96 hybrid battery cell voltages in one block [S51].
- **Camry**: ECU list names 7E0 as engine and 7E1 as transmission. Headers 700, 701, 750, 780, 7B0, 7B1, 7B3, 7C0, 7C4, 7D0, 7E0. Services 0x22, 0x21 and one Mode 01 command. About 176 commands and 400 signals visible [S52].
- **GR Corolla**: headers 700, 701, 750, 780, 7B0, 7B1, 7B3, 7C0, 7C4, 7D0. About 159 commands and 312 signals plus two derived odometer signals. The ECU roles are my inference from how the same addresses behave on other Toyotas, not stated in the file [S53].
- **Pelican's view of coverage**: Prius, 905 parameters across 15 control modules, support recorded for 757 [S54]. Corolla 1,060, Camry 582, RAV4 Hybrid 1,018, Tundra 623, Tacoma 572, bZ4x 101, Mirai 169 and GR Supra 89 [S45]. Pelican says it knows 105 Toyota models and OBDb has data for 64 of them [S45].

Reading this together: Toyota's diagnostic address plan, as seen from the community data, is a set of fixed 11-bit physical addresses in the 0x700 to 0x7DF range, answered at +8, using services 0x21 and 0x22 with a mix of one-byte and two-byte identifiers. This is the architecture that the 2010 Prius paper also shows [S33]. The Camry and Corolla data suggest it persisted into the TNGA era, but I have no source saying anything about 2022+ behaviour at the port (open question 1).

Pelican flags many Toyota models with a suspicious figure of 1,555 parameters, which the page does not explain; it may be a shared placeholder [S45]. OBDb data is crowdsourced from real drives [S22], so the long tail is thin and unverified.

### 5. comma.ai opendbc and panda

opendbc is MIT-licensed and described as a Python API for cars whose aim is steering, gas and brake control for openpilot [S1]. DBC files live in `opendbc/dbc/`, and per-brand code in `opendbc/car/` [S1]. Toyota files: `toyota_2017_ref_pt.dbc`, `toyota_adas.dbc`, `toyota_iQ_2009_can.dbc`, `toyota_prius_2010_pt.dbc`, `toyota_radar_dsu_tssp.dbc`, `toyota_tss2_adas.dbc` [S10]. No Lexus-specific file; Lexus models are handled inside the Toyota code [S26]. A `bmw_e9x_e8x.dbc` and a `mercedes_benz_e350_2010.dbc` also exist [S10], which is relevant for the other brands on our roadmap.

Support table [S8]: about 80 Toyota and Lexus rows of roughly 405 total, roughly 20 percent. Of those, 68 are upstream supported, 3 need "custom" SecOC key recovery (RAV4 Prime 2021-23, Sienna 2021-26, Yaris), and 9 are "not compatible" because of CAN bus security: bZ4x 2023-25, Camry 2025, Corolla Cross 2022-25, Highlander 2025, RAV4 Prime 2024-25, Sequoia 2023-25, Tundra 2022-25, Venza 2021-25 and the Lexus NS 2022-25 [S8].

Code-level facts from the Toyota folder, read at README level and paraphrased [S26][S27][S29]:

- Platform flags include TSS2, no-DSU, SecOC, radar-based ACC and angle-based lateral control [S26].
- The firmware-query code asks forward camera, radar, DSU, ABS, EPS, airbag, transmission, HVAC, engine and hybrid ECUs using three request styles: a Toyota-specific KWP request, a standard OBD request, and standard UDS [S26]. This confirms KWP-style requests are still in use on the 2016+ cars comma supports.
- The comments list modules that exist but are not queried, including the instrument cluster, hybrid battery, second ABS, parking brake and body control module, and say the central gateway and telematics are reached by a sub-addressed form on a shared address [S26]. This is the only evidence I found of Toyota gateway modules answering diagnostic requests.
- Car state messages read from the powertrain bus include wheel speeds, steering angle, cruise state and gear, with different gear and pedal messages used on SecOC cars [S27].
- The Toyota checksum on normal CAN frames is a simple 8-bit sum over length, ID bytes and data [S29]. Miller and Valasek list a Toyota checksum too [S33]. A simple sum is a data-integrity check, not security.

Important limit: opendbc describes buses as seen where comma's device sits (camera and powertrain buses, labelled bus 0 and 2) [S27]. I did not find a page saying that the same frames are visible at the OBD port. On gateway-equipped cars they often are not. That is background knowledge, UNVERIFIED here (open question 2).

panda is the MIT-licensed CAN and CAN FD interface firmware; vehicle safety logic comes from opendbc [S3].

### 6. Security research relevant to Toyota

- **Koscher et al. (2010)** showed that an attacker with access to any ECU on an internal network can disable brakes, stop the engine and more, and that OBD-II gives direct access to internal networks [S41]. It also says a "tuner" culture exists and is not the adversary [S41]. Not Toyota-specific, first three pages read.
- **Miller and Valasek (2013)** did a Prius and Ford Escape. The contents list shows Toyota sections on Techstream, security access, braking, engine kill, lights, horn, doors, fuel gauge and "Toyota reprogramming via the CAN bus" including calibration files and ECM reprogramming [S33]. I read the table of contents, the service list and the generic explanations of session control, security access, routine control and download. I did not read or reproduce any Toyota-specific key derivation or reflash steps, and OpenDiag should not either. The paper describes security access as a seed and key exchange with a shared secret function [S33].
- **Tindell (2023), RAV4 "CAN injection"**: thieves reached the control CAN bus through a headlight connector, impersonated the smart-key receiver, and the gateway copied messages without checking them. The proposed permanent fix is cryptographic message authentication with per-vehicle keys [S34]. This is the link between 2022+ SecOC on Toyota and the opendbc "not compatible" rows, though neither source states it directly. My connection of the two is inference.
- Right-to-repair context: a 2014 US industry agreement extended repair-information access nationally from model year 2018, while the federal government told manufacturers in 2023 to ignore Massachusetts' 2020 data law on preemption and security grounds [S42]. SAE J2534 is the common "pass-thru" reprogramming interface [S13]; its latest part 1 version is 05.00, January 2022 [S13].
- Toyota's own tool channel: the TIS portal lists Techstream under "Diagnostics/Reprogramming", plus a Techstream Lite kit for use with your own PC, and a link to scan tools and reprogramming. Pricing is not shown and J2534 is not mentioned on the page [S40].

### 7. Hybrids and Toyota-specific behaviours

The Prius data shows separate hybrid-control and battery ECUs at 7E2 and 7E3, in line with the general PID page remark that Prius hybrid and battery controllers reply at 7E9 to 7EB [S51][S12]. Per-cell battery voltage appears in OBDb [S51]. Pelican shows battery cell data and charging state as "no data" in every generation, which suggests those signals were defined but never confirmed [S54]. Prius recalls in 2014 and 2018 involved hybrid control software [S37], which is context for why flashing hybrid controllers is risky.

TSS and Lexus Safety System+ reached standard fitment around 2017, TSS 2.0 launched 2018, and Lexus Safety System+ 3.0 in 2021 [S35]. These roughly line up with the opendbc TSS2 generation [S10][S26].

### 8. Tuning and the GR Yaris and GR Corolla

The GR Yaris is on the TNGA GA-B and GA-C platforms with a 1.6 litre turbo three-cylinder [S38]. The page says nothing about ECU tuning or locks [S38]. I found no source describing how the GR Yaris or GR Corolla ECUs are flashed or protected. GR Corolla has an OBDb repo with 7B1, which looks like the four-wheel-drive module (inference) [S53]. Tuning of Toyota-badged non-BMW cars is an unresearched area for this document.

### 9. GR Supra and Z4: overlap with BMW tooling

Verified facts:

- The A90 Supra and the Z4 (G29) share the Toyota-BMW sports car architecture and are both built by Magna Steyr in Graz [S4][S24]. The CLAR platform page lists the Z4 (G29) and "Toyota GR Supra (J29/DB)" together under the small CLAR variant [S49].
- The 3.0 litre uses BMW's B58 and the 2.0 litre uses BMW's B48; Toyota recalibrated the ZF 8HP and added its own transmission software; infotainment and safety suites are Toyota-branded [S4][S24].
- BimmerCode's home page says it codes "BMW, MINI or Toyota Supra", and its FAQ says it supports "the 2019 Toyota Supra" [S25][S28]. Its Toyota vehicle list has a Supra entry but the page did not show option counts [S32]. Single vendor source.
- BimmerCode's adapter list is mostly ENET and Wi-Fi for F and G series; only two Veepeak units are labelled BLE; the OBDLink CX is listed as "Made for BimmerCode" with all series, but the page does not say whether it is BLE [S30]. Two adapter product URLs mention the A90/A91 Supra [S30].
- OBDb's GR Supra signalset is a single `default.json` with 51 commands and 90 signals, all service 0x22, and all with request header 0x6F1 and different response addresses such as 0x612, 0x618, 0x619, 0x629, 0x640 and 0x660 [S47]. Signal groups include boost, ignition timing, lambda, oil temperature, fuel rail pressure, four-wheel speeds, tyre pressures, gear, transmission fluid temperature and door states [S47]. Thirteen commands are debug-gated for 2023-24 [S47].

My interpretation, not stated by any page: 0x6F1 is the tester source address in BMW's extended-addressing diagnostic scheme, with the ECU address in the first data byte and replies at 0x600 plus the ECU address, so 0x612 would be the engine controller. This is my background knowledge of BMW diagnostics, not checked against any page I read, so it is UNVERIFIED here (the BMW ENET research doc in this folder may confirm it). If right, it means the Supra engine, transmission and body modules speak BMW-style UDS, not Toyota's 7Bx and 7Cx scheme. That is the main architectural fact for scope.

Not found: whether BootMod3 supports the Supra (the vendor site returned a "check internet connection" shell or 403), whether ISTA works on a Supra (no source), what Toyota-only modules exist on the Supra, and whether Toyota's Techstream is required for any Supra function. The MHD page lists B58 but did not mention the Supra or Z4 specifically on the page as fetched [S39]. That is absence of evidence only. Supra forum content was blocked behind a redirect.

Related coverage quirk: Pelican lists Supra support for model years 1996 to 2026 but says recorded support covers 2020 to 2022 and 2025 to 2026; its own coverage figures for the Supra (89 parameters across 1 control module, 18 recorded supported; versus 109 supported, 9 not supported and 62 needing testers) do not agree [S48]. OBDb's Supra `generations.yaml` lists generations back to 1978, so the repo template covers all Supras, not only the A90 [S20].

## Evidence quality and disagreements

- **Strong, multiple independent pages**: generic OBD-II, CAN, ISO-TP, UDS facts [S5][S6][S7][S12][S50]. Based on Wikipedia, so reliable for basics but not authoritative on Toyota.
- **Moderate**: opendbc support table and code structure [S8][S26][S27]. First-hand from the project, but read through a summariser and from file listings. The CARS table counts are approximate (the tool said it did not count every row).
- **Moderate, crowdsourced**: OBDb and Pelican. Real drive data, but verification is uneven, and numbers disagree within a single page for the Supra [S48]. The raw JSON reads were truncated at about 100,000 characters for Prius, Camry and GR Corolla [S51][S52][S53], so command counts are minimums. ECU role labels in the GR Corolla read are my inference.
- **Weak or single-source**: BimmerCode Supra support (vendor claim, single source) [S28]. The Supra address interpretation (my inference). Hybrid-specific claims (one Wikipedia page).
- **Disagreement 1**: opendbc lists 2025 Camry as not compatible due to security [S8] while its Camry platform entries cover 2021-24 [S8]. Not a contradiction, but it shows the cut-off is by model generation, not by year alone.
- **Disagreement 2**: the OBD-II PIDs page says the hybrid controller and battery controller answer at 7E9 to 7EB [S12], while the Prius OBDb ECU list uses request addresses 7E2 and 7E3 [S51], which would reply at 7EA and 7EB. Consistent in spirit; the exact mapping needs a car.
- **Disagreement 3**: Pelican counts for the Supra [S48]; Wikipedia's ISO 15765-2 page does not mention 7DF or 7E0 to 7E8 while the PIDs page does [S6][S12]; this is a gap, not a conflict.
- **Not covered by any source**: TNGA architecture documentation, DoIP on Toyota, Toyota secure gateway, Techstream protocol details, any 2022+ reflash research, forum experience of anyone coding or tuning a Supra.

## Implications for OpenDiag

### Build

1. **Tier 1 for Toyota and Lexus: read-only generic OBD-II.** Services 01, 03, 07, 09, 0A over ISO 15765-4. Works on every car since 2008 in the US [S5]. Lowest risk and widest coverage.
2. **Tier 2: Toyota enhanced data, read-only, data-driven.** Import OBDb signalsets as data, not code. Support services 0x21 and 0x22 with per-ECU physical addressing (request ID plus 8 reply) [S12][S51][S52]. Ship a per-model "probe" that tries each command once, records which answer, and feeds that back as a coverage report. This directly attacks the thin and unverified long tail seen in Pelican [S45][S48].
3. **Licence handling.** OBDb is CC BY-SA 4.0 and asks for attribution and share-alike on changed signal definitions [S2]. Keep it as a separate data package with its own licence and attribution file, loaded at run time, so the Apache-2.0 code stays clean. Get a legal read before bundling it in the app binary (open question 6).
4. **Model "profiles" by ECU address plan.** Two families: Toyota-native (7Ex, 7Bx, 7Cx, 70x, 75x, 78x) and BMW-style (0x6F1 with ECU byte) for the GR Supra [S51][S47]. Detect family by VIN and a safe probe, not by badge.
5. **Reuse the BMW stack for the A90 GR Supra.** Treat it as a BMW G-series target first (ENET or BLE adapter, same addressing, same coding file concepts) with a Toyota overlay for Toyota-specific modules. BimmerCode already claims 2019 Supra support, which is a market proof point [S28].
6. **Passive CAN decode as an optional advanced mode**, using opendbc DBCs (MIT) for Toyota TSS2 and older cars, with a clear "needs a tap on the right bus" warning [S1][S10][S26]. Not a v1 feature.
7. **Use mature open libraries** for UDS and ISO-TP, such as python-udsoncan (MIT) [S44], rather than writing new stacks. Check licence per library.

### Avoid

1. **No write or flash for Toyota in the first phase.** The security access, reprogramming and calibration paths exist [S33][S7] but are exactly where bricking and legal risk sit. Do not reproduce key derivation. Do not ship anything that defeats SecOC or any security gateway.
2. **Do not promise 2022+ Toyota support.** opendbc marks them not compatible on the internal bus [S8]; we do not know the OBD-port side (open question 1).
3. **Do not claim Lexus has its own data.** OBDb has no Lexus repos [S11] and opendbc has no Lexus DBC [S10]. Lexus models mostly share Toyota platform code [S26]. Coverage must be proven per model.
4. **Do not bundle Pelican's or Techstream's proprietary data or tools.** Pelican is a commercial app that adapts OBDb under CC BY-SA [S22].
5. **Do not assume the Supra works with BMW tools for all functions.** Toyota software on the transmission and infotainment is its own [S4]. Treat each function as untested until a car confirms it.

### Measure

- Per model: number of OBDb commands that answer on a real car, divided by number defined (target above 80 percent for Prius, Camry, Corolla, GR Supra A90 before calling them supported).
- Per model: a "confirmed years" list, since OBDb year filters are partly guesses [S52][S53].
- Supra: count of BMW-style ECU addresses answering via ENET versus a BLE adapter, with the OBDLink CX specifically (BimmerCode does not say whether it is BLE [S30]).
- Failure rate: negative responses (0x7F with 0x33 or 0x31) per session [S7].
- Data contribution rate: how many users opt in to send back probe results.

## Open questions

1. Does any 2022+ Toyota (Tundra, Sequoia, bZ4x, a Lexus row labelled "NS" 2022-25) block, filter or authenticate diagnostic traffic at the DLC3? What do third-party scan tools see? Needs forum threads and a car.
2. Which Toyota and Lexus models put CAN FD on the OBD port, and which internal buses are visible from the port at all?
3. Does BootMod3 support the A90 Supra and Z4 G29 B58 and B48 variants, what does it require, and what does it write? Vendor pages failed to load.
4. Does ISTA or any BMW dealer tool recognise a Supra, and are any Supra functions locked to Techstream?
5. Is the 0x6F1 interpretation correct, and which Supra modules answer at which addresses?
6. Can OBDb CC BY-SA data be bundled with an Apache-2.0 app without relicensing the app? Needs legal advice.
7. What Toyota-specific DTC and freeze-frame extensions exist beyond J1979, and who documents them openly?
8. How do GR Yaris, GR Corolla and GR86 ECUs handle tuning protection, and what is the public state of research?
9. What does Techstream Lite cost and what protocol does it use over J2534? The TIS page showed no prices [S40].
10. What do real owner forums say about Mode 21 pitfalls, ECU sleep, and BLE adapter issues on Toyotas?

## Source ledger

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| S1 | https://github.com/commaai/opendbc | GitHub README | opendbc purpose, DBC layout, MIT licence | high |
| S2 | https://github.com/OBDb | GitHub org page | OBDb layout, per-model repos, CC BY-SA 4.0, attribution terms | high |
| S3 | https://github.com/commaai/panda | GitHub README | panda firmware, CAN and CAN FD, MIT, safety from opendbc | high |
| S4 | https://en.wikipedia.org/wiki/Toyota_Supra_(A90) | Wikipedia | Shared platform with Z4, B58 and B48, Magna Steyr, Toyota-recalibrated ZF 8HP, recall references (both text halves read) | med |
| S5 | https://en.wikipedia.org/wiki/On-board_diagnostics | Wikipedia | J1962 pinout, five protocols, CAN mandate 2008, J1979 services | med |
| S6 | https://en.wikipedia.org/wiki/ISO_15765-2 | Wikipedia | ISO-TP frame types, flow control, addressing | med |
| S7 | https://en.wikipedia.org/wiki/Unified_Diagnostic_Services | Wikipedia | UDS services, security access flow, negative response codes | med |
| S8 | https://github.com/commaai/opendbc/blob/master/docs/CARS.md | Project doc | Toyota and Lexus rows, SecOC "not compatible" list | high (counts approximate) |
| S9 | https://github.com/commaai/opendbc/tree/master/opendbc/car/toyota | GitHub folder listing | Toyota support file names (inferred roles only) | med |
| S10 | https://github.com/commaai/opendbc/tree/master/opendbc/dbc | GitHub folder listing | Six Toyota DBC names, other brand DBCs including BMW E9x and Mercedes E350 | high |
| S11 | https://github.com/orgs/OBDb/repositories?q=toyota | GitHub search | 60 Toyota repos, 30 shown, no Lexus | high |
| S12 | https://en.wikipedia.org/wiki/OBD-II_PIDs | Wikipedia | 7DF and 7E0-7EF scheme, service 21 for Toyota, non-standard PIDs poorly documented | med |
| S13 | https://en.wikipedia.org/wiki/SAE_J2534 | Wikipedia | J2534 pass-thru, version 05.00 (Jan 2022) | med |
| S14 | https://github.com/OBDb/Toyota-GR-Supra | GitHub repo | Supra repo exists, 38 commits, one signalset | high |
| S15 | https://github.com/OBDb/Toyota-Prius | GitHub repo | 216 commits, five generations in README | high |
| S16 | https://github.com/OBDb/Toyota-Camry | GitHub repo | 812 commits, 1 open issue | high |
| S17 | https://github.com/OBDb/Toyota | GitHub repo | Make-level fallback repo, 75 commits | high |
| S18 | https://github.com/OBDb/Toyota-GR86 | GitHub repo | GR86 repo exists, single template, no Subaru content visible | med |
| S19 | https://github.com/OBDb/Toyota-GR-Supra/tree/main/signalsets/v3 | GitHub folder | Only `default.json` present | high |
| S20 | https://github.com/OBDb/Toyota-GR-Supra/blob/main/generations.yaml | GitHub file | Generations list from 1978; A90 dates inconsistent | med |
| S21 | https://github.com/OBDb/Toyota-Prius/tree/main/signalsets/v3 | GitHub folder | Only `default.json` visible | med |
| S22 | https://pelican.clutch.engineering/cars | Commercial app site | Pelican builds on OBDb, about 2,720 models (my tally), CC BY-SA credit | med |
| S23 | https://github.com/OBDb/SAEJ1979 | GitHub README | Command and signal schema, JSON example | high |
| S24 | https://en.wikipedia.org/wiki/BMW_Z4_(G29) | Wikipedia | Z4 shares architecture with Supra, B48 and B58, ZF 8-speed | med |
| S25 | https://bimmercode.app/ | Vendor site | Header names BMW, MINI and Toyota Supra | med |
| S26 | https://github.com/commaai/opendbc/blob/master/opendbc/car/toyota/values.py | Project source (MIT) | Platforms, flags, ECU query styles, gateway sub-addressing note | high |
| S27 | https://github.com/commaai/opendbc/blob/master/opendbc/car/toyota/carstate.py | Project source (MIT) | Message names read, SecOC differences | high |
| S28 | https://bimmercode.app/faq | Vendor FAQ | Supports "the 2019 Toyota Supra", backup and expert mode limits | med (vendor claim) |
| S29 | https://github.com/commaai/opendbc/blob/master/opendbc/car/toyota/toyotacan.py | Project source (MIT) | Messages built, 8-bit sum checksum | high |
| S30 | https://bimmercode.app/adapters/ | Vendor page | Supported adapters, BLE labelled only on two Veepeak units, OBDLink CX listed | med |
| S31 | https://bimmercode.app/vehicles/ | Vendor page | Four manufacturer categories, no model detail | low |
| S32 | https://bimmercode.app/vehicles/toyota | Vendor page | Supra listed as a Toyota model, no option detail | low |
| S33 | https://illmatics.com/car_hacking.pdf | Research paper (PDF, partly read) | Prius and Escape CAN and diagnostic research, service list, Toyota sections in contents | high |
| S34 | https://kentindell.github.io/2023/04/03/can-injection/ | Expert blog | RAV4 CAN injection, gateway does not authenticate, fix is cryptographic authentication | med-high |
| S35 | https://en.wikipedia.org/wiki/Toyota_Safety_Sense | Wikipedia | TSS and Lexus Safety System+ timeline | med |
| S36 | https://en.wikipedia.org/wiki/Keyword_Protocol_2000 | Wikipedia | KWP2000 over CAN with ISO 15765 most common | med |
| S37 | https://en.wikipedia.org/wiki/Toyota_Prius_(XW30) | Wikipedia | 2014 and 2018 hybrid control software recalls | med |
| S38 | https://en.wikipedia.org/wiki/Toyota_GR_Yaris | Wikipedia | Platform and drivetrain, no ECU tuning information | med |
| S39 | https://www.mhdtuning.com/ | Vendor site | Lists B58 flasher, no Supra or Z4 mention on page as fetched | low |
| S40 | https://techinfo.toyota.com/ | Toyota portal | TIS levels, Techstream and Techstream Lite listed, no prices, no J2534 mention | med |
| S41 | https://www.autosec.org/pubs/cars-oakland2010.pdf | Academic paper (PDF, first 3 pages) | Internal-network attack model, OBD-II access, tuner subculture note | high |
| S42 | https://en.wikipedia.org/wiki/Right_to_repair | Wikipedia | 2014 US agreement, Massachusetts 2020, NHTSA 2023 stance | med |
| S43 | https://en.wikipedia.org/wiki/CAN_FD | Wikipedia | CAN FD payload and rate, ISO-TP formats for FD | med |
| S44 | https://github.com/pylessard/python-udsoncan | GitHub README | MIT UDS client library over ISO-TP | high |
| S45 | https://pelican.clutch.engineering/cars/toyota | Commercial app page | 105 Toyota models, parameter counts for 64, 1,555 oddity | med |
| S46 | https://www.carscanner.info/ | App site | Adapter types, VAG and Hyundai features, no Toyota content | low |
| S47 | https://raw.githubusercontent.com/OBDb/Toyota-GR-Supra/main/signalsets/v3/default.json | Raw data | 51 commands, 90 signals, header 6F1, service 22 | high (data), med (my reading) |
| S48 | https://pelican.clutch.engineering/cars/toyota/gr-supra | Commercial app page | 89 parameters, 1 module, internally inconsistent counts | med |
| S49 | https://en.wikipedia.org/wiki/BMW_CLAR_platform | Wikipedia | Z4 G29 and GR Supra on CLAR LK | med |
| S50 | https://en.wikipedia.org/wiki/Controller_Area_Network | Wikipedia | IDs, no intrinsic security, diagnostic role | med |
| S51 | https://raw.githubusercontent.com/OBDb/Toyota-Prius/main/signalsets/v3/default.json | Raw data (truncated) | ECUs 7E0, 7E2, 7E3, 750, headers 700-7C4, services 21 and 22 | high (data), med (counts) |
| S52 | https://raw.githubusercontent.com/OBDb/Toyota-Camry/main/signalsets/v3/default.json | Raw data (truncated) | Headers, 176 commands, 400 signals, year gating | high (data), med (counts) |
| S53 | https://raw.githubusercontent.com/OBDb/Toyota-GR-Corolla/main/signalsets/v3/default.json | Raw data (truncated) | 159 commands, 312 signals, headers including 7B1 | high (data), med (counts) |
| S54 | https://pelican.clutch.engineering/cars/toyota/prius | Commercial app page | 905 parameters across 15 modules, 757 recorded, no cell data | med |

Pages tried that failed or returned nothing usable (not counted above): bootmod3.net (needs JavaScript), bootmod3.com (403), bimmerpost.com (403), Reddit and old Reddit (blocked), supraforums.com (redirect to an unfetched paywall host), gr-supra.com (host not found), Wikipedia ISO 14229 and Diagnostics over IP (404), bimmercode.app/supported-vehicles (404), opendbc docs/SAFETY.md (404), UN R155 pages (403 and 404). A web-search budget limit prevented all discovery searches.
