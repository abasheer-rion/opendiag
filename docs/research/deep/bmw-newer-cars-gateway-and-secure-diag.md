# BMW G-series and newer (2019+): gateway security, secure diagnostics and the lock-down trend

Status: PARTIAL. This run did not meet the brief's volume target. Read the "Honesty about volume" box first.

## Honesty about volume

- The brief asked for 35 to 50+ pages read. This run read **17 distinct pages** (see the ledger).
- The web search tool refused every query ("budget used up", limit 200 per turn, shared across the workflow). Zero searches succeeded. So no forum threads (Bimmerpost, Bimmerfest, G20 forums, Reddit), no conference talks, no academic papers, no app-store reviews, no news and no legal texts were discovered or read.
- All 17 pages came from URLs I could reasonably guess (Wikipedia, vendor home pages, GitHub READMEs). 13 other guessed URLs failed (404, 403, DNS failure or empty page). They are listed under "Fetch failures" and are not in the ledger.
- Therefore this document is strong on general architecture and weak on the exact questions the owner cares about: what BimmerCode and bootmod3 do on iDrive 8 and 8.5 cars, and what the forums are reporting. Those are marked UNVERIFIED and sit in Open questions.
- Where I state something from general background knowledge (not read this run) I label it **[background, unverified]**. Treat those as hypotheses to check, not findings.
- No leaked OEM software, seed-key material or circumvention steps were opened or are described here.

## 1. Summary (10 bullets)

1. Plain CAN has no built-in authentication or encryption, so every modern lock-down measure is a layer added on top (gateways, authenticated diagnostics, message authentication). [L10, L13]
2. Gateways that split a car into network segments and filter what crosses them are the standard defensive design described in the literature. A BMW central gateway fits that pattern. [L10] The BMW-specific details are **[background, unverified]**.
3. The diagnostic protocol itself (UDS) has two built-in ways to restrict access: a seed-and-key challenge (service 0x27) and a newer certificate-style authentication service (0x29). Both have standard "denied" replies. A tool that wants to be future-proof must handle both. [L4]
4. The 2020 United Nations rules R155 (cybersecurity management) and R156 (software updates) are the regulatory push behind tighter gateways and signed updates. [L10] Primary text was not reached this run (UNECE page returned 403).
5. Over-the-air updates are now normal. Cars check that an update is authentic before installing it and verify the car afterwards. [L9] This means the software on a car can change without the owner visiting a dealer, which is a risk for any tuner or coder whose changes depend on a fixed software version.
6. The G20 3-series facelift (2022 onward) and the 2019+ G-series that gained iDrive 8 run "Operating System 8". The 2025 model year moved to 8.5. [L7, L12] The G60 5-series is described as the first car with 8.5, on a Linux-based OS. [L15]
7. BimmerCode's public home page says it supports BMW, MINI and Toyota Supra, on iOS, Android, Windows and macOS, with a separate supported-vehicles page. [L1] I could not read that page. What it can and cannot do on iDrive 8 and 8.5 is UNVERIFIED.
8. The bootmod3 home page returned no content to the fetcher (offline-mode message only). Nothing about its newer-car support was verified. [L6]
9. US right-to-repair law exists (Massachusetts 2012 and 2020) but the 2020 update on vehicle data is contested. Federal regulators told carmakers in June 2023 to disregard it, citing hacking risk. [L2] The EU side (Regulation 2018/858, SERMI) is **[background, unverified]** this run.
10. Open-source projects already show a workable pattern for hardware that must not misbehave on a vehicle bus: start silent, require an explicit mode before any transmit. [L17, L18] OpenDiag should copy that safety posture.

## 2. What I found, by sub-question

### 2.1 Why cars are locking down: the basic weakness of the car network

Evidence (high reliability, general reference):

- Standard CAN has no authentication and no encryption. If an attacker can put messages on the bus, they can cause harm. Applications therefore add their own protections, and some safety-critical functions (firmware updates, key programming, anti-lock brake actuators) use password-style checks that are not used everywhere. [L13]
- The automotive-security overview describes the defensive pattern: split the vehicle network into sub-networks, keep the most critical units off segments reachable from outside, and place gateways or firewalls between segments to block messages not meant to cross. Intrusion-detection nodes can watch critical segments. A higher-layer protocol can embed authentication data into part of a message because CAN itself has no authentication. Hardware security modules can handle the cryptography for slow units. [L10]
- The same source puts OBD-II in the "local attack surface" category, meaning it needs physical access to the car. [L10]
- The OBD article notes the original OBD specifications lack authentication and authorisation and rely largely on obscurity. Dealer-grade tools reach manufacturer-specific control units and parameters that generic tools usually cannot. It also reports that thieves have used OBD reprogramming devices against keyless cars. [L8]
- The car-hacking article records the research history that drove the industry response: 2010 and 2011 academic work showing control of brakes and engine, first with physical access and then remotely (Bluetooth, cellular), and the 2015 remote Jeep Cherokee demonstration. It also describes CAN-injection theft devices, where thieves reach the bus through the headlight wiring and simulate the signals that allow the car to start. [L14]

What this means in plain terms: from a security engineer's viewpoint, an open diagnostic port that can talk to everything is a liability. That is the motivation for every restriction OpenDiag will meet on newer BMWs. The theft stories matter as well, because they are the argument manufacturers and regulators use against open access (see 2.7).

Single-source note: the theft and CAN-injection claims come only from Wikipedia pages ([L8], [L14]). They are plausible and widely reported elsewhere, but I did not read the underlying news sources.

### 2.2 Secure diagnostic access: what the standard protocol offers

Evidence from the UDS article [L4] (high reliability for the standard, medium for Wikipedia as a channel):

- **Security access (0x27):** a challenge and response. The tester asks for a seed, the unit replies with a random seed, both sides derive a key using a secret method, the tester sends its key, and the unit compares. A match unlocks that security level.
- **Authentication (0x29):** an alternative where the tester proves its identity to reach data or services restricted for security, emissions or safety reasons. Unlike seed-and-key it does not depend on a shared secret method baked into every tool.
- **Secured data transmission (0x84):** protects the diagnostic messages by encryption or signing.
- **Session control (0x10):** the active session decides which services are enabled.
- **Standard refusals:** access denied (0x33), authentication required (0x34), invalid key (0x35), too many attempts (0x36), and a required delay not yet expired (0x37).

Architectural implication for OpenDiag (no circumvention involved): a diagnostic tool should read these refusal codes and report them to the user in plain words ("this car wants proof of who you are before it will let you do this"). It should never loop on retries, because 0x36 and 0x37 indicate lock-out timers.

Gap: BMW's specific implementation (which functions sit behind which level, what the gateway does) was not found in any read source. **[background, unverified]**: BMW has been reported to require dealer-authenticated sessions for certain functions on newer cars.

### 2.3 The central gateway and the in-vehicle network

- General gateway design is covered above [L10]. The specific BMW unit (often called the central gateway module) and its behaviour on G-series cars was **not** found in any page I read.
- Diagnostics over IP (the Ethernet-based diagnostic transport that the owner's WiFi ENET adapter uses) is a standard topic, but the Wikipedia page for it returned 404 and I did not locate an alternative. The OBD article only notes in passing that Ethernet diagnostics over IP exist on some connector pins and that J2534 pass-through adapters exist. [L8]
- The ediabaslib README (a GPL-3.0 project; README only was read, no source) lists the BMW protocols it handles: D-CAN, BMW-FAST, KWP-2000 variants, DS2, DS1 and older. It lists ENET WiFi adapters for F-series BMWs and does not name G-series. [L11] That absence is a weak hint that the open-source diagnostic-file route is aimed at older cars. It is not proof of anything about G-series support, because READMEs go stale.

### 2.4 Message authentication on the bus (SecOC)

- The AUTOSAR article does not mention SecOC by name. It says the newer Adaptive Platform (started 2016, C++, Ethernet with SOME/IP) needs secure on-board communication and secure cloud interaction, but does not say how. [L5]
- The security overview describes the generic idea (authentication data inside the message payload) without naming it. [L10]
- Conclusion: **SecOC on BMW G-series is UNVERIFIED this run.** What I can say from [L10] and [L5] is that the industry direction is toward authenticated messages. What I cannot say is which BMW messages are protected, since which model years, or whether it affects any coding or tuning feature.
- **[background, unverified]** SecOC is an AUTOSAR specification that adds a freshness value and a message authentication code to selected messages. If a tool only reads (listens), it is not affected. If it injects messages that a protected receiver expects to be authenticated, those messages would be ignored. This is the single most important technical question for any tool that plans to do live "actuator tests" on new cars, and it needs primary-source confirmation.

### 2.5 Remote software upgrade, ConnectedDrive and Digital Key

- Over-the-air update in general: updates reach infotainment, maps, the telematics unit and control units. The car checks authenticity before installing, verifies afterwards, and cannot be driven during install. Reported risks: spoofing, tampering, replay, denial of service, and interrupted updates that corrupt a unit. Benefits for makers: avoiding dealer-visit recalls, lower warranty cost. [L9] The article does not cover regulation or BMW.
- G70 7-series: the infotainment system receives wireless updates, and the ConnectedDrive suite includes Remote Software Update and Remote Services. [L16] (single-source, Wikipedia)
- G20 3-series pre-facelift: the article ties over-the-air updates to iDrive 7.0 for maps and the operating system, and does not confirm it for iDrive 8. [L12] **Disagreement/inconsistency:** [L16] says the G70 on iDrive 8 gets wireless updates; [L12] is silent for the G20 on iDrive 8. These do not contradict (different cars and the G20 article is just silent), but nobody read here confirms G20 LCI behaviour.
- Digital Key: on the G20 an optional system lets a phone lock and unlock the car over NFC, and placing the phone in the wireless charging tray starts the engine. [L12] The wider Digital Key standard page returned 404, so I have no read source on how it is secured or whether it interacts with coding.
- The "features on demand" and subscription topic (heated seats as a paid unlock) was not reached: that Wikipedia page 404ed. I know of the 2022 public controversy **[background, unverified]** and nothing here is sourced.

Why this matters to coding and tuning (hypotheses, **[background, unverified]**): if a car can be updated remotely, then (a) a coded value may be overwritten or become invalid after an update, (b) a tuned engine file may be replaced or flagged, and (c) the gateway or head unit may start rejecting tool behaviour it accepted before. Forum evidence for each of these is the thing to collect next.

### 2.6 iDrive 8 and 8.5: what changed in 2023 to 2026 model years

Read evidence:

- iDrive 8 was unveiled in 2021, first on the iX then the i4. It uses a 12.3-inch cluster and 14.9-inch control display as a single curved unit. Models listed include the F70 1-series, U06 and G42 2-series, G20 facelift 3-series, G60 5-series, G70 7-series, iX1, i4, iX, XM, U11 X1, and the facelifted G05, G06 and G07 SUVs. [L7]
- The G20 LCI (announced May 2022) ships with iDrive 8 ("Operating System 8"). For the 2025 model year it moved to Operating System 8.5. [L12]
- The G60 is the first BMW with 8.5, stated to run a Linux-based OS, with a redesigned touch interface, video streaming, in-car games and Plug & Charge authentication at compatible chargers. [L15]
- iDrive 9 is described as Android-based (AOSP); iDrive 7 as "BMW Operating System 7.0". The article does not state the OS of iDrive 8. [L7]

**Disagreement/ambiguity:** the iDrive article [L7] says it does not mention 8.5, while [L12] and [L15] do. [L15] calls the G60 the first car with 8.5 and Linux-based; [L12] says the G20 moved to 8.5 only in the 2025 model year. These fit together (8.5 debuted on the G60 in 2023/24 and reached the G20 later), but the exact first model year is not pinned down by any page read. Treat "8.5 starts in a specific year" as unverified.

What was not found: any concrete list of "this function is no longer codable on iDrive 8 or 8.5", any change to the diagnostic stack in a specific model year, and any statement on how head-unit coding differs from iDrive 7/NBT. This is the biggest gap against the brief.

### 2.7 BimmerCode, bootmod3 and independent tools

- BimmerCode (home page, [L1]): supports BMW, MINI and Toyota Supra. Platforms: iOS, Android, Windows 10 and later, macOS 12 and later (Intel and Apple-silicon builds). Needs a supported OBD adapter, sold through the site. Screenshots show coding for the Front Electronic Module (FEM), Headunit (HU) and Instrument Cluster (KOMBI). It states it is not connected to BMW AG. Supported-vehicles and per-model coding lists were not readable (404). Single-source.
- Notably, the owner's own stack (OBDLink CX over BLE, WiFi ENET) was not verified against any BimmerCode compatibility statement this run. **[background, unverified]**: BimmerCode has historically documented specific adapter families, and ENET is often described as required or recommended for newer cars. Check the vendor's adapter page.
- bootmod3 ([L6]): the fetch returned only a message about checking the internet connection or offline mode. No claims about supported cars, hardware or locked units were obtained. The site appears to be a web app. Nothing verified.
- ediabaslib ([L11]): independent open-source implementation of the BMW diagnostic-file interpreter, GPL-3.0, expert-level, no detailed support. Relevant as proof that an independent route exists for older protocols, and relevant as a licence warning: OpenDiag is Apache-2.0, so GPL code must not be linked or copied. README-only reading was respected.
- commaai opendbc and panda ([L17], [L18]): MIT-licensed, safe to learn architecture from. They establish a pattern: the hardware starts in a silent mode that blocks all transmission, a safety mode must be explicitly selected, and some modes are excluded from release firmware. Both are about a different goal (driver assistance, not diagnostics) but the safety model transfers.

### 2.8 Legal and regulatory pressure for OEM access (right to repair)

Read evidence, US ([L2], [L3]):

- Massachusetts voters passed the first US automotive right-to-repair law in 2012. It required manufacturers to give owners and independent shops the same diagnostic and repair information given to dealers.
- In 2014 major automaker trade groups signed a memorandum of understanding based on it, extending similar access nationwide from model year 2018.
- A 2020 Massachusetts update covered electronic vehicle data. In June 2023 the federal highway-safety regulator told manufacturers to disregard it, arguing federal law pre-empts it and that opening telematics could raise hacking risk. Massachusetts disputes both points in litigation.
- Reference list items show a 2021 US Federal Trade Commission report criticising manufacturers for restricting repair, including automakers. [L3] (only the reference entry was read, not the report)
- The article notes hybrid vehicles needed special tools that manufacturers shared only with authorised repairers. [L2]

EU: none of the pages read covered it. EUR-Lex's Regulation 2018/858 returned an empty body, and the SERMI site did not resolve. **[background, unverified]**: the EU type-approval regulation requires manufacturers to give independent operators access to repair and maintenance information, with security-related information gated by an accreditation scheme (SERMI) that vets independent operators. Whether and how a hobbyist or an open-source project could become accredited is a key open question for OpenDiag, and is entirely unresearched here.

Note on tension: the regulator's own words in the US case frame data access as a hacking risk [L2], which is the same argument used to justify tighter gateways [L10]. So legal pressure for openness and technical pressure for lock-down are growing at the same time. Both are evidenced here; their net effect on a free tool is not.

## 3. Evidence quality and disagreements

Quality:

- 12 of 17 distinct pages are Wikipedia articles. They are fine for orientation and weak as citations for car-specific claims. None were cross-checked against a second independent source.
- Primary sources reached: two project home pages ([L1] BimmerCode, [L6] bootmod3, the latter empty) and three GitHub READMEs ([L11], [L17], [L18]).
- No forum threads, no conference talks, no papers, no regulator text, no news. So there is no direct evidence on actual user experience on 2023 to 2026 cars.
- The page summariser used by the fetch tool answers from a model reading the page, which can omit things. Several answers stated explicitly what the page did not contain. I report those absences as "not in this page", not as "does not exist".

Single-source claims (flagged): BimmerCode platform and adapter statement [L1]; G70 remote software update [L16]; G20 NFC Digital Key behaviour [L12]; Massachusetts 2023 federal pushback [L2]; theft device descriptions [L14]; ediabaslib protocol list [L11].

Disagreements and tensions:

- iDrive 8.5 first appearance: see 2.6. Not resolved.
- OTA on iDrive 8: G70 yes [L16], G20 not stated [L12]. Not resolved.
- Gateway as defence versus open access as a legal right: not a factual disagreement but the central policy tension. [L2], [L10]

Not verifiable this run: anything about what currently works or fails on a specific G-series car with a specific tool.

## 4. Implications for OpenDiag

What to build:

1. **Read-first design.** Everything that only listens or reads should work on every car with no special access. Reading is not affected by message authentication in any model I can reason about. Make "read everything the car lets us read" the first milestone for G-series. [L10]
2. **A refusal translator.** Map the standard negative replies (0x33 to 0x37) to plain-language messages and stop retrying on lock-out. Log every refusal with the car, the function and the reply, so the community builds a real map of what is locked where. [L4]
3. **Safety posture copied from open projects.** Adapter and app start in a transmit-blocked state. Writes need an explicit user-chosen mode, per car, per function, with confirmation. [L17, L18]
4. **Capability reporting per car.** On connect, the tool should report: what protocols respond, what sessions open, and which functions are refused. Present that as a "what this car allows" screen. It is both a feature and the data collection engine for the compatibility matrix.
5. **Adapter honesty.** Recommend ENET on G-series for diagnostics speed and compatibility, and document what BLE (OBDLink CX) can and cannot do, once verified. The owner's two adapters make this directly testable on his own car.
6. **Version-awareness.** Record the head unit OS generation (7, 8, 8.5) and software build in every session log, because OTA can change behaviour. [L9, L12, L15]

What to avoid:

- Any attempt to defeat seed-and-key or authenticated diagnostics. It is outside the brief and the legal risk is high. Support legitimate paths only (owner-authorised sessions where the car allows).
- Any live message injection to protected parts of the bus on newer cars without a safety model. Panda's approach shows why. [L18]
- Linking or copying GPL code (ediabaslib) into an Apache-2.0 project. [L11]
- Claims of G-series coding support before testing on a real car.
- Treating Wikipedia summaries as ground truth for BMW behaviour.

What to measure (concrete):

- Per car and per head-unit generation: percentage of ECUs that answer a basic identification request; percentage of read-only functions that succeed; count of refusals by reply code.
- Per adapter (OBDLink CX BLE, WiFi ENET): connect success rate, round-trip time, drop rate over a 10-minute session.
- Before and after an over-the-air update on the owner's car, if one occurs: which readings or settings changed. This is a cheap natural experiment.
- Compatibility matrix coverage: number of chassis and model years with at least one verified read session.

## 5. Open questions (this is the real to-do list for the research days)

Each item below is UNVERIFIED and needs a primary or forum source.

1. What exactly can BimmerCode change on iDrive 8 and 8.5 cars, per chassis, and what do users report as removed or blocked since 2023? (BimmerCode supported-vehicles page, Bimmerpost, Reddit.)
2. Does bootmod3 support G-series cars and the newest ECU generations, and what do owners report about OTA updates breaking a tune or flash? Is a hardware cable, WiFi or an account lock involved?
3. How does the BMW central gateway treat unauthenticated diagnostic sessions on G-series, and does it differ by model year? Are there reports of "gateway locked" errors? (Forum threads, conference talks.)
4. Which G-series messages are authenticated with SecOC, and since when? Any public talk or paper?
5. EU: precise text of Regulation 2018/858 Articles 61 to 66 and Annex X, how SERMI accreditation works, who pays, whether an individual or open-source project can qualify, and BMW's implementation (its RMI portal).
6. UN R155 and R156: primary text, the dates they became mandatory for new types and all new vehicles in the EU, and whether they require manufacturers to restrict diagnostics.
7. US: current state of the Massachusetts litigation and any federal bill (the MOTOR Act and a newer one) as of late 2026.
8. Digital Key: how is it secured and does it interact with key coding or immobiliser functions?
9. Features on demand and subscriptions: which functions are now remotely enabled by BMW, and can coded values coexist with them?
10. Facts about the ENET versus BLE adapter limits on G-series.
11. What have independent tool makers (Autel, Launch, Foxwell, ISTA-compatible tools, and open projects) said about adapting to gateways? Not touched here.
12. DoIP standard details (ISO 13400) for the WiFi ENET path. Its Wikipedia page returned 404.

## 6. Source ledger

Only pages that were actually fetched and returned content are listed. The pagesRead figure reported is the number of distinct pages below (17; L2 and L3 are one page).

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| L1 | https://www.bimmercode.app/ | Vendor home page | Supports BMW, MINI, Supra; iOS/Android/Windows/macOS; needs supported adapter; shows FEM, HU, KOMBI coding; not affiliated with BMW. No per-model detail | high for what it states, low coverage |
| L2 | https://en.wikipedia.org/wiki/Right_to_repair (chars 0-100000) | Encyclopedia | Massachusetts 2012 and 2020 laws; 2014 industry MOU; June 2023 federal pushback on telematics access; EU coverage was appliances only | medium |
| L3 | (same page as L2, second read window from char 100000; counted as one page, not a separate row in the page count) | Encyclopedia (reference list) | Pointers to 2014 Atlantic piece, 2020 NextCity, 2023 Boston Globe, 2021 FTC report. Only citation entries seen | low-medium |
| L4 | https://en.wikipedia.org/wiki/Unified_Diagnostic_Services | Encyclopedia | Security access seed-key flow; authentication service; secured transmission; negative reply codes | medium-high |
| L5 | https://en.wikipedia.org/wiki/AUTOSAR | Encyclopedia | AUTOSAR scope, Classic vs Adaptive; no SecOC detail | medium |
| L6 | https://www.bootmod3.net/ | Vendor home page | Returned only an offline-mode message; no useful content | low (no content) |
| L7 | https://en.wikipedia.org/wiki/BMW_iDrive | Encyclopedia | iDrive 8 unveiled 2021, hardware, model list; no 8.5 or OS for 8 | medium |
| L8 | https://en.wikipedia.org/wiki/On-board_diagnostics | Encyclopedia (first 100k chars) | OBD regulation history; no authentication in original spec; OEM-only access to proprietary data; J2534; theft via reprogramming devices | medium |
| L9 | https://en.wikipedia.org/wiki/Over-the-air_update | Encyclopedia | Vehicle OTA process, benefits, attack types; no regulation or BMW | medium |
| L10 | https://en.wikipedia.org/wiki/Automotive_security | Encyclopedia | Segmentation, gateways, intrusion detection, in-payload authentication, R155/R156 issued June 2020, notable attacks | medium |
| L11 | https://github.com/uholeschak/ediabaslib | GitHub README (GPL-3.0, README only) | BMW protocols list, supported adapters, ENET for F-series, GPL licence | medium-high |
| L12 | https://en.wikipedia.org/wiki/BMW_3_Series_(G20) | Encyclopedia | LCI May 2022; iDrive 8; 8.5 from 2025 MY; OTA tied to iDrive 7; NFC Digital Key | medium |
| L13 | https://en.wikipedia.org/wiki/Controller_Area_Network | Encyclopedia | CAN has no authentication or encryption; CAN FD info; password-style checks on some functions | medium-high |
| L14 | https://en.wikipedia.org/wiki/Car_hacking | Encyclopedia (redirected title Automotive hacking) | 2010/2011 research, CAN injection theft, relay attack mention, defences | medium |
| L15 | https://en.wikipedia.org/wiki/BMW_5_Series_(G60) | Encyclopedia | G60 first with iDrive 8.5, Linux-based, Plug & Charge; no OTA/Digital Key info | medium |
| L16 | https://en.wikipedia.org/wiki/BMW_G70 | Encyclopedia | G70 on iDrive 8; wireless updates; Remote Software Update in ConnectedDrive | medium (single-source) |
| L17 | https://github.com/commaai/opendbc | GitHub README (MIT) | DBC-based CAN parsing, reverse-engineering workflow, safety model | medium-high |
| L18 | https://github.com/commaai/panda | GitHub README (MIT) | CAN/CAN FD interface firmware; silent-by-default safety mode; testing practice | medium-high |

### Fetch failures (not in ledger, not counted)

- https://sermi.eu/ : DNS failure.
- https://unece.org/transport/documents/2021/03/standards/un-regulation-no-155-cyber-security-and-cyber-security : HTTP 403.
- https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32018R0858 : returned an empty body.
- https://www.bimmercode.app/supported-vehicles : 404.
- https://en.wikipedia.org/wiki/Diagnostics_over_IP, UNECE_WP.29, Digital_Key_(automotive), ISO/SAE_21434, BMW_ConnectedDrive, Features_on_demand, Vehicle_security_system : 404.
- https://github.com/Open-Diagnostic-Systems/DoIP : 404 (guessed, and likely does not exist).
- All web searches: refused (budget exhausted); none succeeded.
