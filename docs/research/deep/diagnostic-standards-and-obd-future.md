# Diagnostic standards and where OBD is going

Research for OpenDiag, a free Apache-2.0 alternative to paywalled car diagnostic, coding and tuning tools. Scope: ISO 14229 UDS, ISO 15765, ISO 13400 DoIP, ISO 22900/22901, ISO 13209 OTX, SAE J2534, J1979 and J1979-2, WWH-OBD, the OBD to OBDonUDS transition, CARB/EPA rules, SAE J3138, SOVD (ISO 17978), the AUTOSAR diagnostic stack and remote diagnostics.

Bracketed numbers like [7] point to the Source ledger at the end.

## A note on how thorough this run was

Read this first, because it limits how far the findings can be trusted.

- The web search tool hit its per-turn budget (200 searches, shared across all agents in the workflow) before this task ran any search. Every search this task attempted was refused.
- Because of that, every page below was reached by fetching an address I already expected to exist, not by discovery. Anything a search would have surfaced, such as a news article, a forum thread, or a conference talk I did not know about, is missing.
- 38 pages were read successfully. About 20 more fetches failed (not found, forbidden, or redirected to an unverified block page). The failures are listed in "Evidence quality".
- The most important gaps are: no price for any ISO or SAE standard could be confirmed (the ISO store returned 403, the SAE pages returned only a logo); no CARB or EPA primary text was read; nothing on SAE J3138 was read at all; no forum threads were read.
- Where I use background knowledge that no fetched page supports, it is marked **[unverified, background]**. Treat those as leads to check, not facts.

---

## Summary

1. UDS (ISO 14229) is the one protocol that matters most. It is a request and response protocol where the tool is the client and the car's module is the server, and it is what most modern ECUs speak [1][7]. Its message layout is public knowledge from many open-source projects [13][12]. What is not public is each carmaker's own data identifiers, routines and security keys [7].
2. ISO 15765-2 (ISO-TP) is how UDS messages longer than one CAN frame travel on a CAN bus. Linux has had it built in since kernel 5.10 [15], and the open tooling for it is mature [29][6].
3. The old emissions-only OBD-II protocol and UDS are converging. Two UDS-based emissions standards exist: WWH-OBD (ISO 27145, used in EU heavy trucks since 2014) and OBDonUDS (SAE J1979-2), which one source says becomes mandatory in the US in 2027 [7]. That date is from a single secondary source and was not confirmed against CARB or EPA text.
4. The practical effect for a hobby tool: from roughly model year 2027, a tool that only speaks classic J1979 over CAN will stop working on new US cars. A tool needs an OBDonUDS mode. A probe exists: ask for data identifier 0xF810 [8].
5. Many modern electric cars already do not answer standard OBD-II and use OEM-specific UDS instead [8]. A free tool that stays inside "OBD-II" will miss them.
6. DoIP (ISO 13400) is diagnostics over Ethernet. It carries the same UDS messages, so a tool that has a clean split between "UDS messages" and "how they are carried" gets DoIP almost for free. A pure-Python DoIP client claims coverage of most of the 2019 edition [14]. That matters for BMW, whose ENET cable is a DoIP-style Ethernet link.
7. SOVD (ISO 17978, ASAM SOVD 1.0.0, released 30 June 2022) is the next generation: diagnostics as a web API (HTTP, REST, JSON, OAuth) [3]. AUTOSAR Adaptive already builds a diagnostic server that speaks both UDS and SOVD [23].
8. An open-source SOVD stack exists today under Apache-2.0 (Eclipse OpenSOVD, funded partly by German and EU money). It translates SOVD calls into UDS over DoIP for older ECUs [9][11][27]. It is early: no releases yet [9][11][27].
9. Cost of reading the rules is uneven. ASAM standards are "free of charge for members" with online viewing free, but no non-member price is shown [3][24][25]. AUTOSAR files are free to download for information only, with a licence needed for commercial use [19][23]. ISO and SAE prices could not be confirmed.
10. The legal ground is moving. US right-to-repair rules exist at state level (Massachusetts 2012, updated by a 2020 vote with about 75% support), and federal regulators have pushed back on the data-access part [20][38]. The industry also wants to limit OBD port access while driving [8].

---

## What I found

### 1. UDS (ISO 14229): the protocol everyone builds on

- UDS is defined by ISO 14229; the application-layer part is 14229-1:2020. It replaced KWP2000 (ISO 14230), which is now largely obsolete [1][22].
- It sits at the application layer and can run on CAN, LIN, Ethernet, FlexRay or K-line, so the carrier is separate from the message set [1].
- Each request has a service ID, and the positive reply is that ID plus 0x40 [1][7]. Services named in the sources include session control (0x10), read data by identifier (0x22), write data by identifier (0x2E), read fault codes (0x19), clear fault codes (0x14), routine control (0x31), ECU reset (0x11), the download/transfer trio for flashing (0x34, 0x36, 0x37), and tester present (0x3E) [1].
- Every module is in exactly one session at a time. A default session always exists and needs no authentication; other sessions drop back to default unless the tool keeps sending "tester present" [1][7].
- Data identifiers are two-byte values. Most are carmaker-specific; a few are standard, for example 0xF190 for the VIN [7].
- Security access (service 0x27) is a seed and key exchange: the car sends a challenge, the tool answers with a value computed from it. The sources say only designated tools can pass this, which limits aftermarket access to critical functions [1][7]. Service 0x29 (authentication) is an alternative that the Wikipedia article lists [1].
- Per the CSS Electronics tutorial, service IDs 0x00 to 0x0F are reserved for legislated OBD [7]. Wikipedia makes a related point: non-OBD UDS services start at 0x10 so they do not overlap [2].

What is free to read versus not:

- The shape of UDS (services, error codes, session logic) is thoroughly documented in free sources and open-source libraries [1][7][12][13].
- The actual ISO document is a paid standard. I could not load the ISO store page to see the price (HTTP 403) [unverified, background: ISO standards of this type typically list in the low hundreds of Swiss francs].
- What no free standard gives you is the carmaker-specific part: which identifiers exist on a given module, what they mean, which routines do what, and the seed-key rules [7]. That is the gap OpenDiag cannot close from standards alone, and per the task rules this document does not cover circumvention of it.

Open-source UDS libraries read for this run:

| Library | Language | Licence | Transports | Maturity signal |
|---|---|---|---|---|
| udsoncan [13] | Python | MIT | ISO-TP over CAN in the example | about 746 stars, 433 commits |
| py-uds [12][10] | Python | MIT | CAN full; LIN, Ethernet, K-line, FlexRay planned | "early development"; client done, server and sniffer planned |

Both are MIT, so reading their READMEs is fine and their ideas can be reimplemented without licence trouble. I read only READMEs and doc landing pages, not source.

### 2. ISO 15765 (ISO-TP) and the CAN layer

- ISO 15765-2 splits a long message into frames: single frame (up to 7 bytes in normal addressing), first frame (carries total length), consecutive frames (4-bit counter) and flow control (the receiver paces the sender) [6].
- Classic length field is 12 bits (up to 4095 bytes); editions from 2016 allow up to 2^32-1 bytes [6]. CAN FD extended the single and first frame formats, backward compatible [6].
- Flow control has three statuses: continue, wait, overflow. It also carries block size and a minimum gap between frames (STmin) in milliseconds or 100 to 900 microseconds [6].
- Linux ships an ISO-TP kernel module in mainline since version 5.10 [15]. The `can-utils` package has command-line ISO-TP tools to send, receive and sniff [29].
- On the CAN bus underneath: Classical CAN up to 1 Mbit/s with 8-byte frames; CAN FD (2012) up to 64 bytes and 8 Mbit/s; CAN XL is described as a future Bosch specification up to 20 Mbit/s [31]. The article states that CAN has no built-in security or encryption [31].
- For OBD, ISO 15765-4 has been mandatory on US cars since model year 2008, at 250 or 500 kbit/s with 11-bit or 29-bit IDs; 0x7DF is the common broadcast request ID and 0x7E8 the first response ID [5][8].

### 3. J1979 (classic OBD-II) and what is changing

- Classic J1979 defines ten services (called modes before 2002): live data, freeze frame, stored codes, clear codes, oxygen sensor results (non-CAN), other test results, pending codes, component control, vehicle info (VIN, calibration IDs) and permanent codes [2].
- Carmakers may add services above the standard ones; Wikipedia gives service 22 (defined by J2190 for Ford and GM) and service 21 (Toyota) as examples [2]. Wikipedia also notes that most PIDs in real use are non-standard and that detailed documentation of them is restricted [2].
- CSS Electronics says roughly 200 standard PIDs exist in mode 01 and most cars support a subset [8].
- Mandate history: CARB required basic OBD from 1988 and the OBD-II spec from model year 1996; all US petrol vehicles up to 14,000 lb from 2004; ISO 15765-4 CAN on all US cars from 2008; heavy-duty phase-in from 2010 to 2013 [5]. Europe: EOBD for petrol cars from 1 January 2001 and diesel from 1 January 2004 [5]. CSS gives slightly different years for some US items (for example 1991 for CARB in new California cars, 2005 for medium duty) [8]. See "Evidence quality".
- A separate source reports the same "J1979" family now has a second part, J1979-2, which is the OBDonUDS version [7][8]. I could not load the SAE page for it (the page returned only a logo) so I have no title, edition date or price [unverified, background: J1979-2 first appeared in 2021].

### 4. OBDonUDS, WWH-OBD and the transition dates

This is the part that shapes OpenDiag most, and it is the weakest-sourced.

- Two UDS-based emissions standards are described together in the CSS tutorial [7]:
  - **WWH-OBD (ISO 27145)**: built on UDS, with two-byte data identifiers and three-byte extended fault codes; required for EU heavy-duty vehicles since 2014; wider rollout limited; the article says US regulators have not accepted it [7].
  - **OBDonUDS (SAE J1979-2)**: the US route. The article says a transition begins in 2023 and becomes mandatory for US vehicles in 2027 [7]. **Single source, secondary, not confirmed against CARB or EPA.**
- The article expects the two may coexist, similar to the ISO versus SAE split in old OBD, or one may become the standard in practice [7].
- A tool can test for OBDonUDS by sending service 0x22 for data identifier 0xF810 [8].
- Both CSS pages link OBDonUDS to ISO 27145-3 and SAE J1979-2 [8].
- Wikipedia's OBD article lists ISO 15765-3 as the implementation of UDS on CAN, but does not explain OBDonUDS [5]. The Wikipedia PID page does not mention J1979-2 at all [2]. So the free encyclopaedia coverage of the transition is nil, which is itself a finding: documentation for tool authors is thin.
- I attempted the US federal rule text (eCFR, Federal Register) and the CARB program page. The eCFR and Federal Register requests redirected to an unverified "unblock" address which I did not follow; the CARB page returned 404. **I therefore cannot state the legal text, which model years phase in which vehicle classes, or which part of the regulation references J1979-2.**

What this means in plain terms: the 2027 claim is plausible and consistent with the single source, but until someone reads the CARB regulation (section 1968.2) and the EPA light-duty OBD rule directly, OpenDiag should treat "2027" as the working date, not a fact. **[unverified, background: CARB's regulation is titled OBD II 1968.2 and I recall J1979-2 being incorporated into it; I did not confirm this from a page.]**

### 5. SAE J2534 (pass-through) and the hardware boundary

- J2534 defines a standard way for a PC program to reprogram vehicle modules through a pass-through device on the OBD port [4]. Wikipedia says SAE standardised the requirements in 2004 and that the latest version listed is 05.00 (January 2022) [4]. That page is a short stub with one source; version 04.04 is not mentioned there.
- The Checkoway et al. paper (USENIX Security 2011) describes the real-world pattern: carmaker dealer tools such as Ford's VCM, Toyota's TIS, Nissan Consult 3 and Honda HDS run on a Windows PC and talk to the car through a J2534 pass-through device, usually over USB or WiFi [34]. The same paper shows this ecosystem is an attack surface: the authors compromised a car through a mechanic's pass-through tool, including a case reached over WiFi or a wired link to the advertised device, with no user visibility in the table's "visible to user" column [34].
- That paper is from 2011, so its specifics may be dated. The structural point (a PC-centric tool plus pass-through device) has not been contradicted by anything I read.
- J2534 text itself is a paid SAE document; the SAE page returned only a logo [unverified, background: J2534-1 is a priced SAE standard].

OpenDiag impact: an OBDLink CX (BLE) is not a J2534 device; it is an ELM327-style serial adapter. The ENET cable is Ethernet. A J2534 shim is an optional bridge, not the core.

### 6. DoIP (ISO 13400) and automotive Ethernet

- Wikipedia's Diagnostics over IP pages did not load (two attempts, 404). CSS Electronics' DoIP intro also returned 404. So the main source for DoIP is a client library README and indirect mentions.
- python-doipclient describes itself as a pure Python DoIP client for ECUs over automotive Ethernet that "implements most of ISO 13400 (2019)" from a short-lived synchronous client's point of view, and serves as a transport for udsoncan [14]. Its README does not cover discovery or routing activation, so I cannot tell from that source how complete it is [14].
- The ISO-TP/CAN fragmentation problem goes away on Ethernet because the transport is IP. Wikipedia's UDS page lists Ethernet (ISO 13400) as a UDS transport [1].
- AUTOSAR Adaptive can run UDS over DoIP (ISO 13400-2) or a custom transport [23].
- The Eclipse OpenSOVD adapter sends UDS to ECUs over DoIP [11].
- **[unverified, background]** DoIP uses TCP and UDP on port 13400, vehicles announce themselves, and a tool must "activate routing" before sending UDS. I know this from general knowledge; none of the fetched pages confirm it.
- Automotive Ethernet itself: the pages I could read cover only the physical layer (100BASE-T1, 1000BASE-T1, 2.5/5/10GBASE-T1 up to 15 metres) [21]. Nothing I read gives adoption numbers.

### 7. ODX (ISO 22901), MVCI (ISO 22900) and OTX (ISO 13209)

- ODX (ASAM MCD-2 D) is the vendor-neutral data model for describing an ECU's diagnostic capabilities: requests and responses, fault codes, communication parameters, memory programming, variant coding. Stored as XML in `.odx` and `.pdx` files [24].
- Current ASAM MCD-2 D version is 2.2.0 from 18 May 2008; it covers KWP2000 on CAN, KWP2000 on K-line and UDS on CAN [24]. That is an old spec; it predates DoIP. The ASAM page does not mention ISO 22901 [24].
- ASAM MCD-3 D describes a diagnostic kernel that interprets ECU hex messages using ODX; version 3.0.0 from 31 October 2011 added ODX 2.2.0 support and DoIP integration [25]. The page does not say ISO 22900-3 or "D-server" [25].
- Licensing for both: download is "free of charge for members", online viewing is free, no non-member price shown [24][25].
- ODX files can be huge. The Eclipse OpenSOVD converter report says a 132 MB raw ODX set shrinks to about 1.5 MB in its own MDD format; it needs the ODX schema files supplied by the user because they are not included "for copyright reasons" [16].
- OTX (ISO 13209): the ASAM OTX page returned 404, so I have no source on it. **Gap.**
- Real-world relevance: ODX and MVCI are what carmaker workshop tools are built from, but carmakers rarely publish their ODX files. For BMW, Mercedes and Toyota, OpenDiag would have to create its own description data, not import official ones. Importing a user-supplied PDX could be a later feature; the CDA project shows the pattern [11].

### 8. SOVD (ISO 17978, ASAM SOVD) and what it replaces

- ASAM SOVD defines an API for diagnosing software-based vehicles, covering high-performance computers and classic ECUs [3]. It is HTTP/REST, JSON and OAuth, delivered as an API description plus OpenAPI YAML [3].
- Version 1.0.0 released 30 June 2022; a project for 1.2.0 (P_2025_05) is listed as ongoing [3]. No previous versions exist [26].
- The ASAM page says the download is "free of charge for members" and the table of contents and release presentation can be viewed online free; no non-member price is shown [3].
- The ASAM pages I read do not mention ISO 17978. The only source tying SOVD to ISO 17978 is the Eclipse OpenSOVD README, which says it implements ISO 17978; the core repo says "ISO 17978-3:2026" [9][27]. So the existence of a 2026 ISO edition is **single source** and I have not seen the ISO page.
- Eclipse OpenSOVD (Apache-2.0) has components: a SOVD gateway with REST endpoints for diagnostics, logging and software updates; protocol adapters bridging modern HPCs (AUTOSAR Adaptive) and legacy UDS ECUs; a diagnostic manager [9]. Partly funded by the German federal ministry (BMWK) and the Shift2SDV project supported by the Chips Joint Undertaking [9]. It complements Eclipse S-CORE [9]; S-CORE's repo is Apache-2.0 and under active development (1,777 commits) [17].
- Maturity: opensovd main repo 30 commits, no releases [9]; Classic Diagnostic Adapter (Rust) 654 commits, 97 open issues, no releases, README still in future tense [11]; opensovd-core vendor version 0.1.1, 146 commits, no releases [27]; ODX converter explicitly warns its format may break before 1.0.0 [16]. None is production-ready.
- The CDA is the most relevant piece for OpenDiag: it maps SOVD calls to UDS requests over DoIP, using an ODX-derived description, where an ECU's component path comes from the ODX layer name and resource IDs come from service names [11].

### 9. AUTOSAR diagnostics

- AUTOSAR has two platforms. Classic is for embedded real-time ECUs; Adaptive is for high-performance computers, POSIX-based, C++, using SOME/IP over Ethernet [18].
- The Adaptive diagnostic management cluster provides a diagnostic server that supports UDS (ISO 14229-1) and SOVD (ASAM 1.0.0); UDS can run over DoIP (ISO 13400-2) or custom transport; SOVD uses HTTP and REST [23]. Each software cluster gets its own diagnostic endpoint [23].
- Release cadence: virtual releases R23-11, R24-11, R25-11; current is R25-11 [18][19][23]. 309 member companies as of February 2026; core partners include BMW, Mercedes-Benz and Toyota (the three brands OpenDiag targets), plus Bosch, Denso, GM, Vector, VW and others [18].
- Spec licensing: files are published "for the purpose of INFORMATION ONLY"; commercial use needs a licence, and the site points to partnership applications [19][23]. For an open-source tool this means reading the specs for understanding is allowed, but copying or implementing them commercially is a legal grey area. **[unverified, background: this needs a lawyer or at least the Terms of Use PDF, which I did not read.]**

### 10. SAE J3138 and OBD port security

- I found nothing on SAE J3138 in any fetched page. **Gap.**
- Related evidence: Wikipedia says researchers in 2012 showed control of many vehicle components through the OBD interface and ECU firmware upload, and that the OBD specs lack authentication and authorisation, relying on obscurity [5]. Thieves have used OBD reprogramming devices [5]. Checkoway et al. call OBD-II the most significant physical interface and discuss the pass-through tool risk [34].
- CSS Electronics says industry moves to restrict OBD2 access while driving are under discussion [8].
- **[unverified, background]** J3138 is meant to define which diagnostic services need protection on the OBD port, and security gateways on newer cars (gateway modules that filter port traffic) are the real-world version of it. I did not verify either claim.

### 11. Remote diagnostics and OTA

- Wikipedia says remote diagnostics is used in automotive for ECU programming, software updates and ADAS calibration, often where manufacturer-level tools, security access or specialist knowledge are needed [36]. This is a descriptive page with no legal or security detail.
- OTA updates are described as installing software on ECUs over cellular, with authenticity checks and post-install integrity checks; the page lists "arbitrary flashings" as a risk and says carmakers responded with bug bounty programmes [37]. It does not mention the UN regulations that govern this, and the UN R155 page returned 404, so regulatory context is missing.
- AUTOSAR Adaptive and OpenSOVD both list software update as part of the diagnostic surface, which is the design direction: diagnostics, updates and logging behind one authenticated web API [9][23].

### 12. Right to repair and legal access

- Massachusetts voters passed the first US automotive right-to-repair law in 2012, requiring carmakers to give owners and independent shops the same diagnostic and repair information given to dealers [20]. A January 2014 trade agreement was modelled on it, meant to apply nationwide from model year 2018 [20].
- 2020 update (Question 1) extended it to electronic vehicle data (telematics) and passed with 74.97% (2,599,182 yes, 867,674 no) [38]. In 2023 NHTSA told carmakers to disregard it, citing federal preemption and hacking risk; Massachusetts disputes this and is suing [20]. I did not read anything on how the case ended [20][38].
- DMCA exemptions for vehicle modification were expanded in 2018 and 2021 [20].
- EU: only the general 2024 Right to Repair Directive is covered in the article, not vehicle-specific data access [20].

### 13. Free and open tooling that already speaks these standards

- `python-can` supports many interfaces: SocketCAN, slcan, PCAN, Kvaser, Vector, IXXAT, candleLight and more; OBD-II port monitoring is an example use [32]. The page did not say anything about ELM327 or OBDLink [32].
- `python-OBD` works with ELM327 adapters but is GPL-2.0, and reports that Bluetooth adapters can have connection problems [33]. Under the task rules, GPL code is README-only and its code must not be copied.
- `opendbc` (MIT) is a CAN/DBC library for driver assistance; it does not touch OBD or UDS [28].
- `can-utils` (Linux SocketCAN tools) includes ISO-TP tools and J1939 tools; licence not stated on the page [29].
- J1939 is the heavy-duty counterpart: CAN 29-bit IDs, 250 or 500 kbit/s, parameter group and suspect parameter numbers; not relevant to the three passenger-car brands [30].
- Vehicle bus overview: manufacturers mix open and proprietary protocols [35].

---

## Evidence quality and disagreements

**What is strong**

- The UDS service list, session logic and security-access shape are consistent across two independent sources (Wikipedia and CSS Electronics) and match the open-source libraries [1][7][13].
- ISO-TP frame details: one source, but consistent with the kernel module and the can-utils tool set [6][15][29].
- Eclipse OpenSOVD facts come straight from the repository READMEs, which are primary [9][11][16][27].
- ASAM version numbers and licence wording come from ASAM's own pages [3][24][25][26].

**What is weak**

- **The 2027 OBDonUDS date is single-source and secondary [7].** The other CSS page only links the standards and gives no date [8]. No regulator text was read.
- **ISO 17978 versus ASAM SOVD:** the ASAM pages never mention ISO 17978 [3][26]; the open-source READMEs do [9][27]. These are not in conflict, but the ISO number-and-edition link rests on those READMEs alone.
- No price for any standard was confirmed. ISO store pages returned 403 [ISO 85133, 72439: not in ledger as they failed]; SAE pages returned only a logo; ASAM states member-free but no non-member price [3][24][25]; AUTOSAR is free for information only [19][23].
- Wikipedia articles are used heavily (nine of 38 rows). Several were stubs or flagged as single-source, notably J2534 [4] and Vehicle bus [35].

**Disagreements and inconsistencies**

- OBD mandate years differ in places: Wikipedia says CARB required basic OBD from 1988 and OBD-II from model year 1996 [5]; CSS says 1991 for CARB in new California cars [8]. The same CSS page says medium-duty US OBD from 2005 and heavy-duty 2010; Wikipedia gives a heavy-duty phase-in from 2010 to 2013 [5][8]. I did not resolve these.
- WWH-OBD: CSS says it is mainly EU trucks and buses and has been required for EU heavy-duty since 2014, and US regulators have not accepted it [7][8]. I could not find a second source.
- Checkoway et al. is a 2011 paper [34]; its tool list is dated and BMW tooling is not covered.

**Fetches that failed or returned nothing useful (so nothing is claimed from them)**

Wikipedia pages for Diagnostics over IP, Service-oriented vehicle diagnostics, Open Diagnostic Data Exchange, ISO 27145, WWH-OBD, UNECE R155, OBD-II connector, Tactrix: 404. ISO store pages: 403. SAE J1979-2 and J2534-1 pages: logo only. CARB OBD program page: 404. eCFR and Federal Register: redirect to an unverified block page, not followed. CSS DoIP intro: 404. ASAM OTX page: 404. Vector diagnostics know-how page: 404. The OpenSOVD docs repo: 404. The UNECE GTR page: 403. The ASAM SOVD wiki page: navigation only.

---

## Implications for OpenDiag

### Build

1. **Split the stack into three layers and keep them separate.**
   - Layer A is the carrier: ELM327-style adapter over BLE or USB, ENET/DoIP over TCP, SocketCAN, and a possible J2534 bridge. See [32][29][15][14].
   - Layer B is the message set: UDS (ISO 14229) plus classic J1979. See [1][2].
   - Layer C is the vehicle description: what identifiers and routines a given car has.
   This split is what lets DoIP, CAN FD and later SOVD plug in without rewriting the app. The AUTOSAR and OpenSOVD designs have the same shape [11][23].

2. **Write the transport layer to be thin and replaceable.** ISO-TP is already in Linux [15]; on iOS and Android, ISO-TP is the adapter's job or must be implemented in the app. Keep it in one module with unit tests against known frame sequences from [6].

3. **Ship an OBDonUDS probe early.** On connect, send the 0xF810 identifier request [8] and record whether the car answers as classic J1979, OBDonUDS or neither. That gives you real data on the 2027 transition from owner cars and the single source [7] becomes testable.

4. **Support classic J1979 fully and first.** It covers all cars to about 2026 [2][5]. Put its PIDs in an open table.

5. **Plan a description format of our own.** ODX 2.2.0 is old (2008) and predates DoIP [24]; the converter project shows ODX files are huge and licensing sensitive [16]. A compact, readable, open format (JSON or similar), with provenance on each entry (who contributed it, from what observed behaviour), is the safer path. Keep an importer for user-supplied ODX or PDX as a later, optional feature, following the pattern in [11].

6. **Prepare a SOVD-shaped API for any future "remote" or "shop" mode.** If OpenDiag ever offers a local web service (for example a phone app driving a laptop UI), model it on SOVD resources (data, faults, operations, updates) [3][9][23] so it can interoperate with the Eclipse OpenSOVD tools rather than invent another dialect. Do not take a dependency on OpenSOVD now: no releases exist [9][11][27].

7. **Do one thing for DoIP, not five.** BMW's ENET path is the owner's own hardware. Implement discovery, routing activation and UDS over TCP once, with UDS messages passing through unchanged [14]. Verify the exact message flow against a real car before trusting any library README, since the README of python-doipclient does not describe discovery [14].

### Avoid

- **Do not copy or bundle anything from the closed standards.** ISO and SAE documents are paid; ASAM is member-oriented; AUTOSAR is information-only [3][19][23][24][25]. Use public knowledge from libraries, papers and observed behaviour. Do not include seed-key algorithms or carmaker identifier tables from unofficial sources, matching the task rules.
- **Do not use GPL code as a base.** python-OBD is GPL-2.0 [33]; OpenDiag is Apache-2.0. The MIT-licensed UDS libraries [12][13][14] and Apache-licensed OpenSOVD [9][11][16][27] are compatible, but this note only read their READMEs.
- **Do not promise "works on all 2027+ cars"** until the OBDonUDS probe has run on real vehicles and someone has read the regulation text.
- **Do not build flashing or security-access features into a general release path** without a separate review. Every source that discusses it treats it as the risk area [1][5][7][34].
- **Do not assume standard OBD on EVs.** Many do not answer it and use OEM-specific UDS [8].

### Measure

- Share of test cars that answer: classic J1979 only, OBDonUDS (0xF810), UDS only, nothing [8].
- Per transport: success rate, retries and time for a standard read (VIN, fault codes) on BLE adapter versus ENET.
- Count of OEM-specific identifiers reached per car and how many came from owner-recorded sessions versus any other source.
- Time to add a new transport (target: a few days, if layer A is truly separate).

### Timeline reasoning for 2027 to 2030

- **Now to 2026:** classic J1979, UDS on CAN, UDS on DoIP via ENET.
- **About 2027:** new US cars that must use OBDonUDS (**single source, unconfirmed**) [7]. Start collecting probe results in 2026.
- **2027 to 2030:** Adaptive platform cars carry both UDS and SOVD servers [23]; open SOVD tooling may reach releases [9][11][27]; more cars restrict OBD access, via security gateways and port limits [8]. **[unverified, background on the gateways.]** A free tool must expect "no access without a carmaker credential" on some models and fail clearly instead of guessing.

---

## Open questions

1. What exactly do CARB's OBD II regulation and EPA's light-duty rule say about J1979-2: which model year, which vehicle classes, optional or mandatory? This is the key unconfirmed fact.
2. What are the actual prices of ISO 14229-1, ISO 15765-2, ISO 13400-2, ISO 17978-1/-2/-3, SAE J1979, J1979-2, J2534-1 and J3138, and the ASAM non-member price? None confirmed.
3. What does SAE J3138 require, and how many cars implement it? Nothing read.
4. What is ISO 13209 OTX used for in practice outside carmakers, and is there any open implementation?
5. How do BMW, Mercedes and Toyota each use DoIP and UDS on their current cars, and does BMW's ENET follow ISO 13400 closely? This needs forum, paper and conference sources, which could not be searched.
6. When will Eclipse OpenSOVD publish a first release, and will its gateway accept user-supplied descriptions without a carmaker's ODX?
7. How did the Massachusetts telematics data case end, and does any federal rule now touch OBD port access?
8. Do the AUTOSAR terms of use allow an open-source project to implement from the public information-only specs?
9. A follow-up run with search enabled should add: conference talks (DEF CON Car Hacking Village, escar), UN R155/R156 text, forum threads on J1979-2 rollout, and the Wikipedia/ASAM gaps listed above.

---

## Source ledger

All rows were fetched and read successfully in this run. Failed fetches are listed under "Evidence quality" and are not counted. Reliability: high, med or low.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| 1 | https://en.wikipedia.org/wiki/Unified_Diagnostic_Services | Encyclopaedia | UDS = ISO 14229-1:2020; services; sessions; security access; transports | med |
| 2 | https://en.wikipedia.org/wiki/OBD-II_PIDs | Encyclopaedia | J1979 ten services; OEM extensions (21, 22); no J1979-2 mention | med |
| 3 | https://www.asam.net/standards/detail/sovd/ | Standards body page | SOVD 1.0.0, 30 Jun 2022; REST/JSON/OAuth; free for members; 1.2.0 project | high |
| 4 | https://en.wikipedia.org/wiki/SAE_J2534 | Encyclopaedia | J2534 purpose; version 05.00 Jan 2022; stub, single source | low |
| 5 | https://en.wikipedia.org/wiki/On-board_diagnostics | Encyclopaedia | OBD history, mandate dates, EOBD, security weaknesses (first 100k chars only) | med |
| 6 | https://en.wikipedia.org/wiki/ISO_15765-2 | Encyclopaedia | ISO-TP frame types, limits, flow control, CAN FD extension | med |
| 7 | https://www.csselectronics.com/pages/uds-protocol-tutorial-unified-diagnostic-services | Vendor tutorial | UDS basics; WWH-OBD vs OBDonUDS; 2027 US date (single source) | med |
| 8 | https://www.csselectronics.com/pages/obd2-explained-simple-intro | Vendor tutorial | OBD2 connector, CAN, modes, 0xF810 OBDonUDS probe, EV note, access restriction | med |
| 9 | https://github.com/eclipse-opensovd/opensovd | Project README | OpenSOVD goals, components, Apache-2.0, no releases, public funding | high |
| 10 | https://uds.readthedocs.io/en/latest/ | Project docs | py-uds status: CAN full, client done, MIT, early development | med |
| 11 | https://github.com/eclipse-opensovd/classic-diagnostic-adapter | Project README | SOVD to UDS over DoIP; ODX via mdd; Rust; Apache-2.0; no releases | high |
| 12 | https://github.com/mdabrowski1990/uds | Project README | py-uds scope, MIT, transports, maturity | med |
| 13 | https://github.com/pylessard/python-udsoncan | Project README | udsoncan: MIT; ISO-TP over CAN example; maturity | med |
| 14 | https://github.com/jacobschaer/python-doipclient | Project README | DoIP client, "most of ISO 13400 (2019)", MIT | med |
| 15 | https://github.com/hartkopp/can-isotp | Project README | Linux ISO-TP module, mainline since kernel 5.10 | high |
| 16 | https://github.com/eclipse-opensovd/odx-converter | Project README | ODX to MDD; 132 MB to 1.5 MB; schema not included; early | high |
| 17 | https://github.com/eclipse-score/score | Project README | S-CORE repo: Apache-2.0, active, goals not stated | med |
| 18 | https://en.wikipedia.org/wiki/AUTOSAR | Encyclopaedia | Classic vs Adaptive; releases R23-11 to R25-11; 309 members; core partners | med |
| 19 | https://www.autosar.org/standards/classic-platform | Standards body page | Files "information only"; commercial use needs licence; release list | high |
| 20 | https://en.wikipedia.org/wiki/Right_to_repair | Encyclopaedia | MA 2012, MOU 2014, MA 2020, NHTSA 2023 pushback, DMCA exemptions, EU directive | med |
| 21 | https://en.wikipedia.org/wiki/Automotive_Ethernet | Encyclopaedia | Only PHY standards (802.3ch etc.); no DoIP or adoption data | low |
| 22 | https://en.wikipedia.org/wiki/Keyword_Protocol_2000 | Encyclopaedia | KWP2000 / ISO 14230 parts; relation to UDS not explained | med |
| 23 | https://www.autosar.org/standards/adaptive-platform | Standards body page | Adaptive diagnostics: UDS over DoIP, SOVD 1.0.0; R25-11; information-only licence | high |
| 24 | https://www.asam.net/standards/detail/mcd-2-d/ | Standards body page | ODX 2.2.0 (18 May 2008); free for members; no non-member price | high |
| 25 | https://www.asam.net/standards/detail/mcd-3-d/ | Standards body page | MCD-3 D 3.0.0 (31 Oct 2011); ODX 2.2.0 + DoIP; free for members | high |
| 26 | https://www.asam.net/standards/detail/sovd/older/ | Standards body page | No previous SOVD versions; no ISO 17978 mention | high |
| 27 | https://github.com/eclipse-opensovd/opensovd-core | Project README | Rust; cites ISO 17978-3:2026; version 0.1.1; Apache-2.0 | med |
| 28 | https://github.com/commaai/opendbc | Project README | DBC/CAN library; MIT; no OBD/UDS; safety firmware model | med |
| 29 | https://github.com/linux-can/can-utils | Project README | SocketCAN tools incl. ISO-TP and J1939; licence not named on page | med |
| 30 | https://en.wikipedia.org/wiki/SAE_J1939 | Encyclopaedia | J1939 CAN 29-bit, 250/500 kbit/s; no J1939-73 or OBD detail | med |
| 31 | https://en.wikipedia.org/wiki/CAN_bus | Encyclopaedia | CAN, CAN FD, CAN XL, ISO 11898; no security built in | med |
| 32 | https://python-can.readthedocs.io/en/stable/ | Project docs | Interface list; no ELM327/OBDLink mention | med |
| 33 | https://github.com/brendan-w/python-OBD | Project README | ELM327 library; GPL-2.0; Bluetooth issues | med |
| 34 | https://www.usenix.org/legacy/event/sec11/tech/full_papers/Checkoway.pdf | Academic paper (2011) | OBD-II and pass-through tools as attack surface; dealer tool model (read pages 1-6) | high (dated) |
| 35 | https://en.wikipedia.org/wiki/Vehicle_bus | Encyclopaedia | Bus protocol list; flagged single-source, uncertain dates | low |
| 36 | https://en.wikipedia.org/wiki/Remote_diagnostics | Encyclopaedia | Remote diagnostics uses; no legal/security detail | low |
| 37 | https://en.wikipedia.org/wiki/Over-the-air_update | Encyclopaedia | Automotive OTA benefits and risks; no regulations | low |
| 38 | https://en.wikipedia.org/wiki/2020_Massachusetts_Question_1 | Encyclopaedia | Vote result 74.97% yes; no court or telematics detail on read portion | med |
