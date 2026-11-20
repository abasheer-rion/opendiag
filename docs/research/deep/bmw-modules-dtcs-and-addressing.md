# BMW modules, fault codes and addressing: what an independent tool can legitimately read

Research run: 2026-11-20. Scope: BMW E, F and G series module landscape, bus structure, diagnostic addressing, fault code (DTC) formats, and what is public versus locked behind OEM tools.

How to read this document: every claim carries a ledger reference like [S4]. "Single-source" means only one fetched page said it. Items marked "background" are general knowledge not backed by a fetched page, and should be treated as unverified until sourced. Ledger rows are only for pages that actually loaded. Pages that failed are listed separately at the end.

Two honest limits up front:

1. The web search budget for this session ran out after five searches. Everything after that was fetched directly from URLs surfaced by those searches or from well-known reference pages. No forum thread (Bimmerpost, Bimmerfest, F30Post and so on) was successfully read. Forum coverage, which the brief asked for, is therefore missing and is the biggest gap.
2. I deliberately did not open BMW training documents mirrored on archive.org and Scribd, third-party mirrors of BMW workshop information, or EDIABAS description-file documentation sites. They are copies of OEM material, and the brief says not to open leaked OEM data. This costs us bus speeds and gateway detail that only those documents give, so those items stay open questions rather than guesses.

---

## Summary (10 bullets)

1. **There is no complete, authoritative public module-address table for BMW F or G series.** The best open one is a community list of 37 entries (re-counted on fact-check) taken from a single 2016 F-series car, with 8 addresses still unknown. It was published in two near-identical repos [S1][S2].
2. **Address format is simple.** Diagnostic addresses on F and G series are one byte. The engine computer (DME) is 0x12 and the gateway-style front electronics module is 0x10, across three independent mentions [S1][S4][S9].
3. **Two request routes exist.** Over the OBD socket, tools send on CAN ID 0x600 plus the tester address, and the module answers on 0x600 plus its own address. Over Ethernet, BMW's older wrapper (HSFZ) uses TCP port 6801 with a 6-byte header [S9][S4]. The Ethernet details are vendor-claimed and single-source.
4. **Module names change by generation.** E-series cars use CAS, FRM and JBE for body and access. F-series cars use FEM. G-series cars use BDC [S17][S10]. A tool needs a name map, not one fixed list.
5. **Bus mix changed over time.** CAN (fast and slow variants), MOST (ring), FlexRay (first used on E70 at the end of 2006, wider use on the 2008 F01), and Ethernet toward the head unit [S26][S27][S11][S10][S44]. Exact K-CAN and PT-CAN speeds are not confirmed by any page I read.
6. **Fault codes come in at least three shapes.** Six hex digits (for example 48082F on the stability control unit) [S22][S21], four hex digits (for example 2E85) [S6], and a short numeric style shown in a 2024 bulletin ("S 0219") [S10]. No fetched page defines the prefix scheme.
7. **The standard UDS fault format is open.** Three code bytes plus one status byte, with defined subfunctions for status filtering, snapshots and counters [S13][S25][S37]. BMW's exact use of the status byte and its extra data layout is not documented in anything I could read.
8. **Descriptions of fault codes are the weak spot.** Public lists are scattered, partial, often decimal-versus-hex confused, and several of the best ones failed to load [S14][S6]. A legitimate open database must be built from observation and contribution, not copied.
9. **What is locked is the write side and the data files.** Key learning, module replacement, flashing and central coding need OEM data, online servers or unlock steps [S23]. Reading identity, fault memory and live values is what the commercial hobby apps and even unofficial testers advertise [S31][S15].
10. **Reading is lower risk than writing, but not risk-free.** A technician forum lists specific F-series modules (FEM, HU-H, KOMBI) with high failure rates during programming [S17]. OpenDiag should keep flashing out of scope for modules that brick.

---

## What I found

### 1. How BMW generations are organised (E, F, G)

**Chassis codes.** The chassis letter is the generation family: E-series covers roughly 1968 to the early 2010s, F-series starts with the F01/F02 7 Series (2008) and runs through the F30 3 Series (2011 to 2020), and G-series covers cars like G20, G05 and G30 [S28]. The page I read for this is a Wikipedia list whose extraction was visibly garbled (it listed some G chassis with start years that do not look right). I therefore use it only for chassis-to-family mapping, not for dates. Reliability: low.

**Platform names.** One service bulletin refers to "BN2000 E-Series vehicles" in the context of a replacement engine computer (MEVD172) failing during programming [S34]. That is the only mention of BN2000 in anything I read, and it confirms only that BMW itself ties the BN2000 label to E-series cars. **I found no page that defines BN2020**, and none that says what BN stands for. I will not guess. See Open questions.

**Module naming drift.** A technician forum post (diag.net) lists modules by generation [S17]:

- E and R series: FRM (footwell), CAS (car access), JBE (junction box), CCC (head unit)
- E, F and R series: CIC (head unit)
- F series: FEM (front electronics), HU-H (head unit), KOMBI (cluster)

A G-series bulletin names BDC (body domain controller) as the carrier of the Ethernet link to audio, camera, head unit, telematics and cluster [S10]. A 2016 bulletin lists "ZGW, FEM, BDC" together as the central vehicle gateway options depending on the car [S11]. So the central gateway role moved: standalone box (ZGW) on E and early F cars, folded into FEM on later F cars, folded into BDC on G cars. The F-series community list says exactly this about FEM: it combines gateway, footwell, access and junction functions in one box [S1].

**A 37-entry module legend.** A Dutch workshop site publishes a legend of 37 ISTA control unit abbreviations with plain-English meanings [S7]. It mixes generations (CAS, FRM, JBE, HU-H, KOMBI, ICM, DSC, EGS, VTG, EMF, ACC, KAFAS, TRSVC and others). It is a naming aid, not an address table, and the network diagram on that page is an image that I could not read.

**A vendor's coverage matrix for one E-series car.** OBDtester's page for the 2011 E63/E64 6 Series groups ECUs into Powertrain, Chassis, Body and Multimedia, and marks per ECU whether identification, fault codes, freeze frame, live data, actuator tests and coding are supported [S15]. Names there include DME/DDE, EGS, DSC, KOMBI, CAS, ZGW/ZGM/KGM, IHKA, HUD, CCC, CIC, MOSTGW and others. Interface tags shown are BMW-FAST, D-CAN and CAN. This is a useful template for how to present coverage honestly, per module, per function.

### 2. Diagnostic addresses

**F-series list (community).** Two GitHub repos carry the same README-style table, "taken from a MY2016" and described by their authors as incomplete and partly deduced [S1][S2]. They are not independent. They appear to be forks of one source. Notable entries (hex, as written):

| Module | Address | Module | Address |
|---|---|---|---|
| DME2 (engine) | 12 | KOMBI (cluster) | 60 |
| DSC (stability) | 29 | HU_NBT2 (head unit) | 63 |
| EPS (steering) | 30 | ZBE3 (iDrive controller) | 67 |
| ICM (chassis mgmt) | 1c | IHKA3 (climate) | 78 |
| FEM_BODY | 40 | REM (rear electronics) | 72 |
| FEM_GW | 10 | KAFAS2 (camera assist) | 5d |
| ACSM (airbag) | 1 | EKPM2 (fuel pump) | 17 |
| AMPT (amplifier) | 37 | FZD (roof) | 56 |

Gaps stated by the source: EGS (transmission), ZGW, ACC, AMP and several others show "XX" (unknown). LHM, TMS and SM2 each appear twice with different addresses and no explanation. The README gives no bus information at all [S1][S2]. The README also warns not to code the DME and not to publish others' intellectual property. Single source family. Reliability: medium for the values (they are consistent with the two other address mentions below), low for completeness.

**Independent confirmations of two values.**

- A data-logging site for the G29 Z4 shows the DME at 0x12, the OBD tester at 0xF1, requests on 0x6F1 (0x600 plus tester address) and replies on 0x612 (0x600 plus module address) [S9]. It uses 16-bit data identifiers with service 0x22 and ISO-TP extended addressing. It says the generic OBD-II requests are "marshaled through the ZGM". Single page, but it matches the community table for the DME.
- The Quantex ELM327-to-HSFZ page uses 0x12 for the engine ECU and 0x10 for the gateway in examples, and 0xF4 as the default tester address [S4]. Vendor documentation of its own adapter, not BMW. Medium reliability.

**Disagreement worth noting.** The tester address appears as 0xF1 on the OBD socket [S9] and 0xF4 on Ethernet [S4]. These are not contradictory. They are different access routes with different tester identities. But a tool must support both, and neither page says which modules respond to which tester address.

**Older bus addressing is a different world.** The wilhelm-docs project documents the I-bus, K-bus and D-bus used from 1989 to 2013, with 8-bit device addresses such as 0x80 (instrument cluster), 0x68 (radio), 0xD0 (lighting module), and 0x00 (general module) [S3]. The D-bus engine addresses sit at 0x10 to 0x14. It covers cars up to E87 and E83/E85, not CAN-era F and G cars. Do not mix these tables with the F and G addresses above: the same number means different things.

**Ethernet and the G-series.** I found no page listing G-series logical addresses. What I did find: HSFZ (BMW's wrapper) uses a 6-byte header, TCP port 6801 and UDP port 6811 for discovery, and one-byte source and target addresses, with no routing activation step [S4]. Standard DoIP (ISO 13400) uses a 8-byte header, two-byte addresses and a routing activation step [S4][S38][S8]. Whether current G-series cars still answer HSFZ on the ENET socket, or have moved to DoIP, is not settled by anything I read. One vendor page that came up in the search (not fetched) claimed the BMW ENET cable is DoIP only; that conflicts with [S4] and is unverified. The python-doipclient docs say BMW's ENET cable appears to use OBD socket pin option 1 (pins 3, 11, 12, 13) with the activation line on pin 8 [S8]. Medium reliability, hedged by the page itself.

### 3. Bus structure

I could not read BMW's own bus-system documents (see limits above), so confidence here is lower than for addresses.

- **CAN.** High-speed CAN is specified up to 1 Mbit/s and low-speed fault-tolerant CAN up to 125 kbit/s [S44]. Which BMW bus runs which variant is not confirmed by a page I read. The G29 logging page confirms a powertrain bus (called PT-CAN there) carrying broadcast frames such as coolant temperature on ID 0x3F9, plus a diagnostic CAN reachable via the OBD socket [S9]. Reliability for naming: medium.
- **FlexRay.** Up to 10 Mbit/s, two channels, a static time-slotted part and a dynamic part. The BMW X5 (E70) was the first production car with it at the end of 2006, with fuller use in the 2008 7 Series (F01) [S26]. Another Wikipedia page lists BMW FlexRay with a start year of "2008?", marked uncertain [S32]. That is a mild disagreement on first use (2006 versus 2008) and likely a difference between first appearance and broad use. Reliability: medium.
- **MOST.** A ring of up to 64 devices with one timing master. MOST25 is about 23 Mbaud over fibre, MOST50 doubles it, MOST150 adds an Ethernet channel [S27]. BMW is named among users [S27][S32]. The head-unit bulletin refers to the "MOST ring" in the test plan structure and says control units on the MOST bus may stay unprogrammed if the head unit has an invalid IP address [S11][S16]. So on cars with MOST, the head unit also acts as a bridge toward Ethernet. Reliability: medium.
- **Ethernet.** On F and G cars, an Ethernet line links the central gateway (ZGW, FEM or BDC) to the head unit [S11][S16]. On recent G cars the BDC itself has an Ethernet controller that connects audio amplifier, driver-assist camera, head unit, surround camera, cluster and telematics; a 2024 bulletin says a voltage spike from the driver's door lock motor can overload it and drop all of those at once [S10]. That bulletin covers F90/F91/F92/F93 and G01, G02, G05, G06, G07, G12, G14, G15, G16, G20, G26, G30, G32 and G80, which gives a decent list of cars where this architecture is confirmed.
- **Other.** Sub-buses (LIN and so on) exist on BMW but I have no fetched confirmation. The general vehicle-bus page only says LIN is a low-cost sub-network [S32].

**Practical meaning for a tool.** On an OBD-socket adapter such as the OBDLink CX, the tool reaches the gateway, which forwards diagnostic requests to the other buses. On ENET the tool talks IP to the gateway or directly to some modules. The tool does not need to know the bus of each module to talk to it, as long as the gateway routes. It does need to know which modules are reachable on which route, because the "everything through the OBD socket" claim is only supported for the DME in one example [S9].

### 4. Fault code (DTC) formats

**Standard OBD-II.** Five characters: a letter for P, B, C or U, then four hex digits. The second character separates generic from manufacturer-specific [S33]. SAE J2012 defines the standard definitions and ISO 15031-6 the related parts [S33]. A tool such as BimmerLink, and the vendor pages I read, treat these generic codes as the minority of what BMW stores [S35][S6].

**BMW's own codes.** Three shapes show up:

| Shape | Examples | Where seen |
|---|---|---|
| 6 hex digits | 48082F (stability control, internal flash/ROM error) | [S21][S22] |
| 4 hex digits | 2E85 (cooling, water pump communication), 2F44 (immobilizer), 5E19 (stability control, brake pressure sensor), CF15 (transmission), A0B5 (access module) | [S6] |
| Short number with "S" prefix | S 0219 to S 0394, all of the form "No communication with: <module>" | [S10] |

Observations:

- The 6-digit example is consistent with the UDS three-byte DTC. The thread on the PEAK forum shows a real UDS response carrying a three-byte DTC (0x07111E in a non-BMW example) followed by a status byte [S36]. The 4-digit examples are consistent with an older engine-computer style that also reports in hex. One older fault-code list says codes are decimal on earlier modules and hex from the DDE4 diesel computer and the ME9 petrol generation onward [S14]. **Inference, not stated by any source:** the 4-digit codes are mostly from engine and gearbox computers and the 6-digit codes come from UDS-style computers such as DSC and ICM.
- A search result snippet (not fetched, so not usable as evidence) showed ICM codes in the 4801xx range. I cannot confirm that a 48xxxx prefix maps to a module. The only 48xxxx value I could verify, 48082F, is on the DSC [S21][S22]. The brief asked about "480xxx" and "2Exx" formats. My finding is: 2E85 is real and is an engine/cooling code [S6], 48082F is real and is a DSC code [S21], and **no source explains the numbering scheme**.
- The "S 0219" style comes from a BMW North America service bulletin, which calls them "permanent SAE faults" [S10]. Their format and decimal-or-hex status are unclear from the text. Single source.
- One bulletin says the DTC clears when you repeat the DSC self-test [S21]. Another says the fault is checked in "IB fault memory" after reprogramming [S22]. IB is not expanded in the page.
- The Ultimate Systems blog says BMW codes need BMW software to "fully interpret" and gives no source for any meaning [S6]. Its meanings should be treated as unverified. Its code table mixes the standard letter style and hex, without saying which.
- A mass-market scanner vendor page lists 25 "common BMW codes" that are all generic P-codes plus one (P112F), and is heavily promotional [S35]. Low reliability, and useful mainly as a sign of what generic scanners can see.

**Decimal versus hex confusion** is a real hazard. The tag-parts reference says codes on older modules are decimal and on newer ones hex, and that it includes a primer on hex for the reader [S14]. Any database must store the code as bytes plus a type tag, not as text.

### 5. What a fault memory entry contains

**The open standard (UDS, ISO 14229).** Each DTC record is a three-byte code and one status byte [S13][S25]. The read service is 0x19 with subfunctions [S13][S25]:

- 0x01 count by status mask, 0x02 list by status mask
- 0x03 list snapshot (freeze frame) record numbers, 0x04 read a snapshot for one DTC
- 0x06 read extended data for one DTC
- 0x0A list all supported DTCs
- 0x14 read fault detection counters

Clearing uses service 0x14 with a three-byte group, where 0xFFFFFF means all [S25]. Control of DTC storage uses 0x85 [S25]. Some of the older subfunctions (0x0F, 0x10 to 0x13) were withdrawn in the 2020 edition [S25].

**Status byte bits** (as given by one explanatory site and consistent with the AUTOSAR specification's list of status bits 0 to 3 and the TestFailedSinceLastClear bit [S13][S37]):

- bit 0 test failed, bit 1 failed this operation cycle, bit 2 pending, bit 3 confirmed
- bit 4 test not completed since last clear, bit 5 failed since last clear, bit 6 not completed this cycle, bit 7 warning indicator requested

Typical values: 0x08 stored but not active, 0x09 stored and active [S13]. Reliability: medium, because the explainer is a simulator site, but it agrees with the AUTOSAR text for the bits I checked.

**Environmental data.** The explainer says snapshots hold DID and value pairs at the time of first confirmation, and gives extended data record types (occurrence counter, aging counter, aged counter, cumulative active time, odometer first and last) [S13]. The AUTOSAR event manager specification confirms the existence of an occurrence counter incremented on test-failed transitions, an aging mechanism, freeze frames, extended data and a fault detection counter [S37]. **Neither tells us how BMW lays these out.** AUTOSAR leaves the record content to the vendor, and the explainer admits it gives no byte layout [S13]. Single-source for any BMW-specific claim: none found.

**Practical clue from BMW's side.** BMW service bulletins describe stored faults as having "current fault patterns" in ISTA test plans [S11][S16], and describe an ECU storing a fault that clears after a self-test [S21]. That suggests BMW tools present a status-driven view, but the bulletins do not show raw bytes.

**Real-world UDS quirks.** A PEAK forum thread shows an ECU sending a first-frame declaring seven bytes where a single frame would do, which broke a tester that expected the status byte [S36]. The PEAK engineer called it an ECU bug and said to check the result before reading data. Not BMW, but it is a fair warning that ISO-TP handling must be tolerant [S42].

### 6. Where the public data stops

**Open and readable by an independent tool (as claimed by shipping products):**

- Control unit list and fault counts per module ("Scan"), reading and clearing faults across modules, live values, and some actuator tests. Seen in a commercial service tool manual [S23], a hobby app [S31] and a tester vendor's coverage matrix [S15].
- Identification strings. The Cobb wiki for N54 and N55 describes a 17-character ROM ID split into a 7-character hardware ID, 5-character software family and 5-character calibration ID, which a tuner reads to decide support [S5]. That page covers only N54 and N55 and says nothing on newer families, though the format is a useful model.
- Coding on F and G cars through consumer apps. BimmerCode shows coding screens for FEM, head unit and cluster, and lists BMW, MINI and Toyota Supra [S30]. It does not say what is read or its limits.

**Locked or gated:**

- Key learning, module replacement, virgin-module marriage, arbitrary firmware flashing, central coding by vehicle order, and mileage functions need OEM-derived data, online servers or unlock steps. The Abrites manual says units above a given software version must be unlocked first and that some features rely on its online server [S23]. I do not describe how.
- Seed-and-key security access is part of the standard (service 0x27), with a secret algorithm per ECU [S12][S24]. I did not research the algorithms and will not.
- The description files that name every job, signal and fault text for each module (the EDIABAS-style data) belong to BMW. The ediabaslib project reads .GRP and .PRG files but does not ship them [S29]. Its license is GPL-3.0 [S29], so the code cannot be copied into an Apache-2.0 project.

**Legal context.** The right-to-repair page notes the 2012 Massachusetts law giving owners and independents the same diagnostic and repair information as dealers, an extension in 2020, and a federal challenge in 2023 [S47]. It did not mention the EU rules. EU and US positions vary by year and I did not verify current status. Background (unsourced): in the EU, repair information access is required by type-approval rules.

### 7. Existing open tools and what they tell us

- **udsoncan** (MIT, Python) implements UDS; its README does not discuss DTC handling or manufacturer specifics [S40].
- **CaringCaribou** (GPL-3.0) has an ECU discovery scan, service enumeration, seed collection and DoIP discovery [S41]. It is an exploration tool. The same README-level capability list shows that scanning to find ECUs is a normal technique. For OpenDiag it implies a "discover which addresses answer" function, with a strict list of what it may ask. Do not copy its seed fuzzing features.
- **opendbc** (MIT) covers broadcast CAN signals, not diagnostics, and does not mention BMW or DTCs [S45].
- **RAMN** documentation shows the normal UDS flow, ISO-TP addressing and DTC read and clear in a clean teaching form [S24]. Useful as a test target.
- **BimmerLink** lists BMW models from 2003 to 2024 and says it reads and clears codes in all control units, but it does not list modules or code counts [S31]. **BimmerCode** gives no limits on its page [S30].

---

## Evidence quality and disagreements

**Evidence strength by sub-question**

| Sub-question | Strength | Why |
|---|---|---|
| F-series module addresses | Medium-low | One source family, one 2016 car, 8 unknowns [S1][S2] |
| DME 0x12 / gateway 0x10 | Medium | Three mentions [S1][S4][S9], though [S1] and [S2] count as one |
| G-series addresses | None | Nothing found |
| Bus speeds per BMW bus | Low | Only generic CAN and FlexRay figures [S44][S26] |
| Bus roles (Ethernet to head unit) | Medium-high | BMW bulletins [S10][S11] |
| BMW DTC prefix scheme | None | Examples only [S6][S21][S22] |
| UDS DTC and status format | High | Several agreeing technical sources [S13][S25][S36][S37] |
| BMW fault-memory byte layout | None | Not found |
| Locked versus open | Medium | Vendor manuals and app pages, which describe features, not mechanisms [S23][S31] |

**Disagreements and tensions**

1. **HSFZ versus DoIP on the ENET socket.** [S4] describes HSFZ as BMW's own protocol with no routing activation. [S38] and [S8] describe standard DoIP with activation. A search snippet claimed ENET is DoIP only. These are not resolved. The likely truth is that both exist depending on the car and gateway generation, but that is my reading, not a sourced statement.
2. **FlexRay start.** End of 2006 on E70 [S26] versus "2008?" [S32]. Likely first fitting versus wide adoption.
3. **Tester address.** 0xF1 [S9] versus 0xF4 [S4]. Different routes, not an error.
4. **Head unit naming.** HU_NBT2 in the community list [S1], HU-H in BMW bulletins and the module legend [S7][S11][S17]. Same role, different generation or naming convention.
5. **Dates and models.** The Wikipedia chassis list [S28] shows start and end years that look unreliable. Do not use it for date ranges.

**Source reliability notes**

- BMW service bulletins relayed by NHTSA and trade magazines [S10][S11][S16][S21][S22][S34] are the highest-quality BMW-specific evidence, but they are short, concern single faults, and show no raw data.
- Vendor pages [S4][S23][S31][S15] describe their own products and have a reason to sound capable.
- Community GitHub tables [S1][S2] say they are incomplete.
- The promotional pages [S6][S35] should not be used for code meanings.
- Several sources are the same chain: [S1] and [S2] are near-duplicates; [S13] and [S25] and [S37] agree because they all derive from the same ISO standard.

**What is missing entirely:** forum threads from real owners reading real fault memory, any conference talk or paper about BMW diagnostic internals, any app store review analysis, and any official BMW statement of public diagnostic interfaces. These need a second pass with working search.

---

## Implications for OpenDiag

### What to build

1. **A module registry as data, not code.** One table keyed by chassis family and I-level where known, with fields: short name, plain-English name, address, route (OBD socket, Ethernet), role, and a provenance tag per row: "seen on a real car", "community list", "unverified". Seed it from [S1] and the legend [S7], mark every row as community-sourced, and let user-contributed scans upgrade rows to "seen". Never present a guess as fact.
2. **A name-translation layer.** Map CAS/FRM/JBE (E), FEM (F) and BDC (G) to the same user-facing functions (access, lights, doors, gateway) [S17][S10][S1]. Users think in functions, not abbreviations.
3. **Read-only discovery first.** A scan that asks each candidate address for a small, standard identification set and records who answers. This mirrors what discovery tools do [S41] and what commercial scans do [S23]. Keep the probe list short and fixed. Do not sweep arbitrary requests at safety modules (airbag, brakes, steering).
4. **Fault memory reader built on the open UDS format.** Use the 0x19 subfunctions in [S25] and the status bits in [S13][S37]. Store every record as raw bytes (three code bytes, status byte, raw snapshot, raw extended data) plus a decoded view. When we do not know the layout (we do not, for BMW), show hex and flag it as undecoded rather than inventing fields.
5. **A tolerant transport.** Handle multi-frame ISO-TP quirks, odd single-frame versus first-frame behavior [S36][S42], timeouts and padding differences [S24]. Support both OBD-socket CAN (BLE adapter) and Ethernet (WiFi ENET), since F and G cars with Ethernet exist [S10][S11].
6. **Both Ethernet dialects, detected not assumed.** Discovery over UDP first, then try the BMW wrapper and standard DoIP behind a feature probe [S4][S38]. Record which one each car answered, and publish that back as data.
7. **A DTC knowledge base with an honest licence.** Store code, module, chassis, I-level range, observed status, and a description field with an author and a licence (CC0 or similar). Seed with the few facts we have from BMW bulletins ([S21][S22]) written in our own words. Do not import lists scraped from OEM tools or forum lists derived from them.
8. **Coverage matrix per module.** Copy the idea of per-module capability flags (identify, faults, freeze frame, live, actuators, coding) from [S15], but fill it with what OpenDiag has verified, not what it hopes.

### What to avoid

- **Flashing and module programming in v1.** The programming-failure list for FEM, HU-H, KOMBI, FRM, CAS and others [S17] and the BDC Ethernet fragility [S10] make this high risk. The user already uses BM3 for the DME, so there is no reason to compete.
- **Anything near key learning, ISN, mileage and security access.** Described in the locked section above; out of scope [S23].
- **Copying GPL code.** ediabaslib and CaringCaribou are GPL-3.0 [S29][S41]. Read-the-README only, as instructed. Prefer MIT-licensed libraries like udsoncan [S40] as references.
- **Mixing old bus tables with new ones.** The I/K/D-bus table [S3] uses the same numbers for different devices.
- **Showing guessed fault descriptions.** The one blog with a hex table does not cite its meanings [S6].
- **Writing to the DME through the diagnostic route.** The community list itself flags it [S1][S2].

### What to measure

- **Address coverage:** share of scanned cars where each registry row is confirmed by a live response, per chassis.
- **Decode rate:** share of stored fault records with a known description versus raw hex.
- **Format census:** counts of 4-digit, 6-digit and other fault shapes by module, to settle the open prefix question from real data.
- **Route matrix:** which cars answer on the OBD socket, on HSFZ, on DoIP.
- **Safety record:** zero writes to modules in read-only mode; log every request sent.
- **Transport robustness:** retry and malformed-frame counts per adapter (CX BLE versus WiFi ENET).

---

## Open questions

1. What does BN2020 mean, and how does it differ from BN2000? Nothing I read defines it.
2. What is the full F-series and G-series address list, including EGS, ZGW, ACC and the 8 unknown F entries? Needs live scans of real cars.
3. What are the real speeds of K-CAN, K-CAN2, PT-CAN and PT-CAN2? Needs a non-OEM-copy source such as a conference talk, a paper, or logged captures.
4. Do G-series cars answer HSFZ, DoIP, or both on ENET? Which address do they use for the BDC and head unit?
5. Is there any structure in BMW's DTC numbering (48xxxx per module, 2Exx per engine area)? A data census from many cars could answer this.
6. How does BMW lay out its snapshot and extended data records? Not documented in open sources I could reach.
7. What does "IB fault memory" mean, and what does BMW call its fault sources (current, stored, history)? [S22]
8. How does the OBDLink CX (BLE) route to the gateway versus ENET, and are any modules unreachable on the OBD socket?
9. Which fault-description lists exist legitimately? The Haynes RTA French database, a minimania page and a Spoolstreet N55 thread failed to load and should be retried [failed rows below].
10. What do forum users report on F30/F10/G20 fault reading, and what mistakes do they make? Needs a working search to find Bimmerpost, Bimmerfest and F30Post threads.
11. What is the exact legal position in the EU and US for reading diagnostic data from your own car? Sources read were partial [S47].

---

## Pages that did not load or were skipped (not ledger rows)

| URL | Result |
|---|---|
| https://bootmod3.atlassian.net/wiki/x/AoC_mQ | Empty content returned |
| https://www.spoolstreet.com/threads/n55-codes-list.580 | HTTP 403 |
| https://www.revue-technique-auto.fr/codes-defauts-obd/23-bmw/code-specifique-constructeur?p=34 and the Haynes redirect | Page loaded only as navigation; no code list read |
| https://racechrono.com/forum/d/2681-2681 | Page error, no thread text |
| https://miniracing.minimania.com/Mini_Cooper_Fault_Error_Codes | HTTP 522 |
| https://www.go-parts.com/garage/serial-data-gateway-module-bmw-m5-bmw-750i-bmw-740i-2009-2019 | HTTP 403 |
| https://en.wikipedia.org/wiki/Diagnostics_over_IP | HTTP 404 |
| https://github.com/driftregion/python-doipclient | HTTP 404 |
| BMW training PDFs on archive.org, Scribd copies, workshop-manual mirrors, EDIABAS description-file doc sites | Deliberately not opened (OEM material) |

---

## Source ledger

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| S1 | https://github.com/jokinawa/bmw-f | Community GitHub README | F-series ECU list with hex addresses from a MY2016 car, 8 unknown, no bus info | medium |
| S2 | https://github.com/brodee227/bmw-f | Community GitHub README | Near-identical copy of S1 (same table, same warnings) | medium (not independent of S1) |
| S3 | https://github.com/piersholt/wilhelm-docs | Community GitHub docs | I/K/D-bus 8-bit device addresses for 1989 to 2013 cars | medium |
| S4 | https://quantexlab.com/en/develop/elm327_hsfz.html | Vendor documentation | HSFZ framing: TCP 6801, UDP 6811, 6-byte header, tester 0xF4, ECU 0x12, gateway 0x10, no routing activation | medium (vendor claim) |
| S5 | https://cobbtuning.atlassian.net/wiki/spaces/PRS/pages/407535894/BMW+DME+ECU+ROM+Identification+and+Break+Down | Tuner wiki | 17-char ROM ID structure for N54/N55 DMEs | medium |
| S6 | https://blog.usro.net/2025/04/bmw-fault-dtc-codes-complete-list-explained/ | Commercial blog | BMW hex fault examples (2E85 etc.), no prefix scheme, no sources | low |
| S7 | https://www.mvwautomotive.com/bmw-ista-list-of-control-units-and-legend/ | Workshop site | 37 control unit abbreviations with meanings | medium |
| S8 | https://python-doipclient.readthedocs.io/en/latest/automotive_ethernet.html | Open-source docs | OBD socket Ethernet pins, activation line, BMW ENET appears to use option 1 | medium-high |
| S9 | https://thesecretingredient.neocities.org/bmw | Hobbyist site (G29 Z4) | 0x600+address scheme, DME 0x12, tester 0xF1, PT-CAN broadcast example | medium |
| S10 | https://static.nhtsa.gov/odi/tsbs/2024/MC-11010762-0001.pdf | BMW bulletin via NHTSA | BDC Ethernet fault, affected F/G models, "S 02xx" no-communication faults | high |
| S11 | https://static.nhtsa.gov/odi/tsbs/2016/MC-10150900-9999.pdf | BMW bulletin via NHTSA | Gateway (ZGW/FEM/BDC) to head unit Ethernet link; MOST ring test plan | high |
| S12 | https://en.wikipedia.org/wiki/Unified_Diagnostic_Services | Encyclopedia | UDS service IDs, security access concept, negative response codes | medium-high |
| S13 | https://uds-simulation.vercel.app/docs/sid_0x19 | Explainer site | 0x19 subfunctions, status byte bits, snapshot and extended data types | medium |
| S14 | https://www.tag-parts.com/tips-info/13115.html | Parts retailer reference | Older BMW fault lists, decimal before DDE4/ME9, hex after | low-medium |
| S15 | https://www.obdtester.com/bimcom-eculist/bmw/6/2011_e63_e64 | Tool vendor | E63/E64 ECU list with per-function support matrix, BMW-FAST/D-CAN tags | medium |
| S16 | https://www.vehicleservicepros.com/industry-news/article/53090597/bmw-programming-bummer-2021-03-19 | Trade press (BMW bulletin) | "Invalid IP address" head unit problem on 2015 528i; Ethernet gateway link | medium-high |
| S17 | https://diag.net/discussion/sm89qmjarl4ngrojwziz3jukn2 | Technician forum | List of modules likely to fail during programming (FEM, HU-H, KOMBI, FRM, CAS and others) | medium |
| S18 | https://automotive.softing.com/fileadmin/sof-files/pdf/ae/articles/2015/Standard_Vehicle_Diagnostics_over_Ethernet.pdf | Trade article (vendor) | DoIP in ISO 13400, 100 Mbit/s versus 500 kbit/s CAN, activation line, switch topology | medium |
| S19 | https://www.autopi.io/blog/diagnostics-over-internet-protocol-explained/ | Vendor blog | DoIP discovery over UDP, diagnostics over TCP, routing activation, UDS relationship | medium |
| S20 | https://etools.org/wp-content/uploads/2024/09/OBDonUDS.pdf | Industry slides (SAE/CARB) | Move of OBD to UDS: 3-byte DTCs, multiple freeze frames, J1979-2 | medium-high |
| S21 | https://www.vehicleservicepros.com/tsbs/article/55273859/mitchell-1-fixing-faulty-bmw-code | Trade press (BMW bulletin) | DTC 48082F on DSC, cause, ISTA fix, self-test clears | medium-high |
| S22 | https://www.vehicleservicepros.com/tsbs/article/55318337/mitchell-1-verifying-bmw-current-i-level | Trade press (BMW bulletin) | I-level format (S18A-21-07-520), 48082F, "IB fault memory" | medium-high |
| S23 | https://abrites.com/media/user_manuals/html/abrites-diagnostics-for-bmw-mini-user-manual/index.html | Vendor manual | Capabilities and gated operations (key, ISN, FEM/BDC, flashing), online server dependence | medium |
| S24 | https://ramn.readthedocs.io/en/latest/userguide/diag_tutorial.html | Open-source docs | UDS over ISO-TP flow, sessions, DTC services, seed-key concept | high (generic) |
| S25 | https://uds.readthedocs.io/en/latest/pages/knowledge_base/service.html | Open-source docs | UDS SID table, 0x19 and 0x14 subfunctions, 2020 changes | medium-high |
| S26 | https://en.wikipedia.org/wiki/FlexRay | Encyclopedia | FlexRay speed, channels, E70 first use (end 2006), F01 wider use | medium |
| S27 | https://en.wikipedia.org/wiki/Media_Oriented_Systems_Transport | Encyclopedia | MOST ring, speeds, BMW named among users | medium |
| S28 | https://en.wikipedia.org/wiki/List_of_BMW_vehicles | Encyclopedia | Chassis code families (E, F, G); extracted dates unreliable | low |
| S29 | https://github.com/uholeschak/ediabaslib | GPL project README | Reimplements EDIABAS API, reads .GRP/.PRG, adapter list, GPL-3.0 | medium-high |
| S30 | https://www.bimmercode.app/ | Vendor site | Supported brands, coding screens for FEM/HU/KOMBI, no limits stated | medium |
| S31 | https://www.bimmerlink.app/ | Vendor site | Reads and clears faults in all control units, model year coverage | medium |
| S32 | https://en.wikipedia.org/wiki/Vehicle_bus | Encyclopedia | CAN, LIN, FlexRay, MOST overview; BMW FlexRay "2008?" | low-medium |
| S33 | https://en.wikipedia.org/wiki/On-board_diagnostics | Encyclopedia | OBD-II five-character DTC format, SAE J2012, ISO 15031, EOBD | medium-high |
| S34 | https://www.carcomplaints.com/BMW/X5/2012/tsb/tsb-b121116.shtml | TSB aggregator | "BN2000 E-Series" label; MEVD172 replacement programming failure | medium |
| S35 | https://www.youcanic.com/read-and-clear-the-dtcs-fault-codes-of-your-bmw/ | Promotional blog | Generic P-codes only, no BMW hex coverage | low |
| S36 | https://forum.peak-system.com/viewtopic.php?p=9610 | Vendor forum | Real UDS 0x19 exchange, 3-byte DTC plus status, first-frame ECU quirk | medium |
| S37 | https://www.autosar.org/fileadmin/standards/R19-11/CP/AUTOSAR_SWS_DiagnosticEventManager.pdf | Industry specification | UDS status bits, occurrence counter, aging, freeze frame, extended data, fault detection counter | high (generic) |
| S38 | https://www.ime-actia.de/en/?p=5053 | Vendor page | DoIP gateway routing activation, vehicle announcement, pin 8 activation | medium |
| S39 | https://www.blackduck.com/fuzz-testing/defensics/protocols/doip.html | Vendor page | DoIP message types a test suite exercises | medium-low |
| S40 | https://github.com/pylessard/python-udsoncan | MIT project README | UDS client library scope; no DTC or manufacturer notes | medium |
| S41 | https://github.com/CaringCaribou/caringcaribou | GPL project README | ECU discovery, UDS and DoIP modules, scope | medium |
| S42 | https://en.wikipedia.org/wiki/ISO_15765-2 | Encyclopedia | ISO-TP frame types, addressing modes, flow control | medium-high |
| S43 | https://en.wikipedia.org/wiki/BMW_7_Series_(F01) | Encyclopedia | Checked for architecture content; found none (negative result) | low |
| S44 | https://en.wikipedia.org/wiki/CAN_bus | Encyclopedia | CAN speeds, frame format, 11/29-bit IDs | medium-high |
| S45 | https://github.com/commaai/opendbc | MIT project README | DBC repository scope; no BMW or DTC content | medium |
| S46 | https://en.wikipedia.org/wiki/BMW_iX | Encyclopedia | Checked for architecture content; found none useful (negative result) | low |
| S47 | https://en.wikipedia.org/wiki/Right_to_repair | Encyclopedia | Massachusetts law, 2014 MOU, 2023 federal preemption dispute, DMCA exemptions | medium |

Count: 47 pages fetched and read (S10, S11, S18, S20 and S37 via local PDF text extraction). Rows S18 to S20, S39, S43 and S46 were read but add little beyond what is cited elsewhere.
