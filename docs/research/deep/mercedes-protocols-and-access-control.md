# Mercedes-Benz protocols and access control (public, architectural level)

Status: PARTIAL. Read this first.

This run could not meet the volume bar set for it. The web search tool hit its call limit before it returned a single result, so no Mercedes-specific page (forum thread, vendor page, talk, regulation text) was discovered through search. I then fetched 25 pages by direct URL from my own knowledge of well-known sites. Those 25 pages are solid on the generic layers (CAN, ISO-TP, UDS, KWP2000, DoIP client libraries, OBD) and almost silent on Mercedes. About 20 further fetches failed or were empty (listed below the ledger).

So this document is honest about two tiers of claim:

- **Evidenced** claims carry a ledger reference like [S2].
- **Unevidenced background** claims are marked [BG]. They come from general model knowledge, were not confirmed by any page fetched in this run, and must be verified before they drive any decision. Several are central to the topic (SFD, XENTRY login, SERMI). Treat them as hypotheses.

No OEM security details, seed-key material, bypass steps, or leaked data are included, and none were sought.

---

## Summary (10 bullets)

1. Mercedes diagnostics, like most European makes, sit on top of the generic stack: CAN or CAN FD at the bottom, ISO-TP framing above it, UDS (ISO 14229) as the application protocol. All three layers are well documented publicly [S1][S2][S3].
2. UDS has a built-in gatekeeping idea: sessions, plus a seed-and-key "SecurityAccess" service that restricts sensitive functions to approved tools [S2][S3]. The standard defines the handshake shape. It does not define the secret, which is each maker's own.
3. KWP2000 (ISO 14230) is the older application protocol. UDS evolved from it and the older one is described as largely obsolete [S2][S4]. Older Mercedes models may still speak it [BG].
4. Newer cars add Ethernet. The DoIP (Diagnostics over IP) mechanics are public: UDP discovery on port 13400, a routing-activation step, then diagnostic messages over TCP [S14]. Open-source clients exist [S5][S14].
5. Classic OBD-II is a thin, standardised slice (emissions-related) on CAN with fixed request IDs such as 0x7DF [S23]. Many newer cars use gateways that block anything beyond that slice [S23].
6. Mercedes-specific facts I could not confirm from any fetched page: the exact bus layout (CAN-C, CAN-B, CAN-D naming), the central gateway behaviour, SFD and SFD2 online authorisation, XENTRY personal login, and the SERMI route. All are [BG] in this document.
7. Open-source building blocks for an independent tool already exist and are permissively licensed: Linux ISO-TP kernel module, can-utils, python-can-isotp, udsoncan, python-doipclient [S5][S6][S7][S12][S13][S18].
8. A cheap ELM327-style adapter speaks OBD-II protocols only. It is not a full diagnostic path, and clones are unreliable [S20].
9. The EU legal route for independents exists in principle (type-approval rules mention repair information access) [S21], but no fetched page described how SERMI works. That gap is the biggest in this document.
10. Recommendation: build Mercedes support as read-only, standards-based diagnostics first. Do not plan any feature that needs a manufacturer's authorisation until the legal route has been researched properly.

---

## What I found, by sub-question

### 1. What are the bus layers underneath?

**CAN basics.** CAN is a shared two-wire bus standardised as ISO 11898. High-speed CAN (ISO 11898-2) runs up to 1 Mbit/s in classic form. Low-speed fault-tolerant CAN (ISO 11898-3) runs up to 125 kbit/s and allows star and multi-star wiring [S10]. A modern car can carry dozens of control units on CAN [S10][S17]. Mercedes-Benz's W140 (1991) is named as the first production car with a CAN-based multiplex wiring system [S10], which is a nice fact for the Mercedes story, though single-source.

**CAN FD.** Bosch's second-generation CAN, released 2012, grows payload from 8 to 64 bytes and speeds up the data phase to roughly 5 to 8 Mbit/s, while arbitration stays at 1 Mbit/s for compatibility [S17]. Daimler is named among the supporters [S17]. One source says it is used in high-performance control units, and that is as far as the adoption evidence goes [S17].

**What "CAN-C, CAN-B, CAN-D" mean.** The labels in the task brief are Mercedes-style names for separate buses (a fast powertrain bus, a slower body or comfort bus, and so on). None of the 25 pages I read uses those labels. What I can say from evidence is the generic split: a fast bus for powertrain, a slow fault-tolerant bus for body nodes, plus LIN for cheap subnetworks [S10][S15]. Mapping those onto C, B and D is [BG] and unverified. This needs a primary Mercedes technical source.

**Other buses.** Vehicle bus overviews list CAN, LIN, FlexRay, and MOST/D2B (the multimedia buses) [S15]. D2B in that list is a hint that "D" naming might relate to a different bus family in some contexts. I could not resolve whether Mercedes' "CAN-D" is a diagnostic bus. Do not rely on any guess here.

**Ethernet.** Automotive Ethernet is a family of single-pair standards (100BASE-T1 up to 10GBASE-T1) [S16]. The page I read said nothing about diagnostics or flashing, so the link from Ethernet to DoIP is made by other sources, below.

### 2. How do messages move on CAN? (ISO-TP)

Classic CAN frames hold 8 bytes, so longer messages need segmentation. ISO 15765-2 (ISO-TP) provides it with four frame types: single, first, consecutive and flow control [S1][S3]. Key facts:

- A single frame carries up to 7 bytes in normal addressing, 6 in extended addressing [S1].
- A receiver can tell the sender to continue, wait or abort, and can set block size and minimum spacing [S1].
- Payload limit was 4095 bytes before the 2016 version, and can be far larger afterwards. Real limits come from buffers [S1].
- Linux has had a native ISO-TP kernel module in mainline since version 5.10 [S7]. Its README says PDUs up to 4095 bytes, and lists current limitations, for example that a write blocks until the transfer completes [S7].
- User-space alternatives exist: python-can-isotp (MIT) either implements ISO-TP itself or wraps the kernel module [S18].
- can-utils ships ISO-TP send, receive, sniffer and dump tools [S12].

This layer is entirely open and uncontroversial. No access control lives here.

### 3. What does UDS give an independent tool, and where does the lock sit?

UDS (ISO 14229) is a request and response protocol between a tester and a control unit [S2][S3]. Relevant parts:

- **Sessions.** DiagnosticSessionControl switches the unit between sessions, each enabling a different set of services. Non-default sessions time out unless the tester keeps sending a "tester present" message [S2][S3]. Which services each session allows is up to the maker [S3].
- **Security access.** The unit sends a seed, both sides compute a key through an algorithm the unit's maker chooses, and the unit grants a security level only on a match [S2][S3]. A later service (0x29, authentication) is an alternative mechanism [S2].
- **Negative responses.** Rejections use 0x7F plus a code. Two named examples are securityAccessDenied and invalidKey [S2]. Those codes are how a tool can honestly tell a user "this unit refused you", which matters for UX.
- **Other uses.** Reading fault memory, firmware update, output control and routines [S2].

The architectural point for OpenDiag: UDS defines the shape of the lock, not the key. A generic tool can implement the handshake client side. It cannot unlock anything without the maker's secret, and this project will not try to obtain or reproduce one.

**Reuse.** python-udsoncan (MIT) implements the client, including session change, ECU reset, read and write by identifier, and an unlock call that takes a level [S6][S13]. It reports negative responses as exceptions [S6].

### 4. KWP2000 and older models

KWP2000 (ISO 14230) is an application protocol that originally ran on a single-wire K-line (1.2 to 10.4 kbaud, with timing-sensitive wake-up) and also on CAN with ISO-TP [S4]. UDS evolved from it [S2]. Practical consequences:

- A K-line path needs a hardware interface that can do the wake-up timing. A cheap BLE OBD dongle may not [S20 shows what ELM-class chips support, including ISO 9141-2 and 14230-4, but only at the emissions-slice level].
- Older Mercedes cars with K-line diagnostics are [BG] within scope for classic diagnostics but not for the first release. No fetched source covers a specific Mercedes model range.

### 5. DoIP on newer models

DoIP carries UDS over Ethernet (ISO 13400). From the python-doipclient documentation [S14]:

1. **Discovery.** A control unit announces itself by UDP broadcast on port 13400 at power-up, and a tester can send a vehicle identification request, broadcast or direct, optionally filtered by VIN.
2. **Routing activation.** Most units require an activation request before answering diagnostics. A failed activation raises a refusal.
3. **Messages.** Diagnostic traffic runs over TCP, and UDS payloads ride inside.
4. **Housekeeping.** Alive checks, entity status and power-mode queries exist.

The client library implements most of ISO 13400 (2019) and is designed as a transport for udsoncan [S5][S14]. A logical address example (0x00E0) appears in the README [S5].

What I could not verify: which Mercedes models use DoIP, whether the diagnostic socket is the OBD connector with an activation line, and whether routing activation is gated by a login or certificate on those cars. All [BG].

### 6. Gateways and what they block

Evidence on gateway behaviour is generic:

- Many newer cars use gateways that block proprietary traffic and leave only standard OBD-II requests reachable [S23].
- OBD-II was never designed with authentication. One overview attributes port-based attacks partly to "security through obscurity" and the absence of authorisation in the specifications [S9].
- Researchers showed in 2012 that components could be controlled and firmware uploaded through the port [S9]. Manufacturer responses since then include tightening network access [S22, loosely].
- opendbc's approach to its own hardware is instructive: its safety firmware defaults to a silent mode and controls what may be transmitted [S11]. This is a design pattern, not Mercedes evidence.

Mercedes specifics ([BG], unverified): a central gateway that separates the diagnostic socket from internal buses, and that behaves differently on newer cars with more restrictive filtering. I found no fetched confirmation.

### 7. Standard OBD-II as the always-open slice

OBD-II over CAN uses fixed IDs. Requests go to a functional address (0x7DF with 11-bit IDs), engine unit replies on 0x7E8, and 29-bit variants exist for some vehicles [S23]. CAN is mandatory in US vehicles since 2008 [S9]. EOBD in Europe uses the same connector and protocols, mandatory for petrol cars from 2001 and diesel from 2004 [S9]. The J1962 connector must sit near the steering wheel [S9].

Two cautions from the same sources: OBD-II is standardised and emissions-focused and does not expose a car's full internal data [S23], and many electric vehicles do not support it at all and use maker-specific UDS instead [S23].

For OpenDiag, this is the safe baseline for a Mercedes car: standard OBD-II reads work regardless of any gateway.

### 8. Adapters

An ELM327-class adapter translates OBD protocols (J1850, ISO 9141-2, ISO 14230-4, ISO 15765-4 CAN, J1939) into a serial command set [S20]. Fake chips are widespread, copying a leaked version 1.4 firmware, and clones often report newer version numbers falsely [S20]. The owner's OBDLink CX (BLE) and WiFi ENET adapters were not researched in this run. I did not fetch any vendor page. The ENET adapter, being Ethernet, is the natural hardware for DoIP work on BMW and, if the car supports it, Mercedes [BG].

### 9. XENTRY, SFD/SFD2, and personal login

I fetched no page that describes XENTRY, Star Diagnosis, SFD or SFD2 (the Wikipedia article on Star Diagnosis returned a 404). Everything below is [BG] and must be checked:

- [BG] XENTRY is the dealer and workshop diagnostic suite, with a multiplexer interface and online connection to the maker's servers.
- [BG] Newer models require some functions (programming, certain coding and resets) to be authorised online per session, tied to a personal account. This is the idea behind SFD ("Secure Diagnostic Flash") and its successor.
- [BG] The effect for third parties is that a tool must either be authorised by the maker or stick to functions that do not require authorisation.

I will not describe how these checks work internally, and the project should not research that.

The generic parallel is documented: UN Regulation 155 (cyber security) and 156 (software updates) push makers toward stricter access control on vehicle networks. I could not read either page (403 and 404), so the regulatory link is [BG] only.

### 10. The EU independent-operator route (RMI, SERMI)

What the fetched evidence supports:

- Regulation (EC) No 715/2007 is cited, in the Euro 7 article, as the type-approval rule that includes access to vehicle repair and maintenance information [S21]. The article itself explains nothing else on the topic [S21].
- The EU Right to Repair Directive 2024/1799 (adopted 30 May 2024) exists but the article does not say whether vehicles are in its annex [S8]. It is also a consumer-goods instrument, so it likely does not displace the vehicle-specific rules [BG].

What I could not read: the Regulation (EU) 2018/858 text (two attempts returned empty content), the SERMI site (domain did not resolve), and any maker's own independent-operator portal. So the following is [BG]:

- Type-approval law obliges makers to give independent operators access to OBD and repair information on non-discriminatory terms, usually for a fee.
- A scheme called SERMI vets independent operators for access to security-related information.
- Mercedes-Benz runs its own portal for independents.

None of these were verified, and fee levels, eligibility, and whether an open-source tool (as opposed to a company) can qualify are open questions.

### 11. What independent tools can legally do

I have no fetched legal source on this. The only direct evidence is that standards and open-source stacks are public. What I can say with evidence is limited to this: reading standard OBD-II data and speaking UDS to a unit through the car's diagnostic socket uses public, permissively licensed software [S6][S13][S12]. Whether specific actions (coding, reprogramming) are lawful in a given country, and under which terms, is not established here and needs a lawyer plus the primary legal texts.

---

## Evidence quality and disagreements

**Volume.** 25 pages read. The target was 35 to 50+. Reason: search budget exhausted at the first call, so discovery failed.

**Source types.** 11 Wikipedia pages (medium reliability, secondary), 10 GitHub or documentation pages for open-source libraries (high for what the library does, no value for Mercedes facts), 2 vendor tutorials (CSS Electronics, Kvaser), 1 OpenXC repo. Zero pages from Mercedes, zero regulator pages, zero forums, zero talks or papers.

**Single-source claims.**
- W140 as first CAN production car [S10].
- Gateway blocking of OEM traffic on newer cars [S23].
- Kernel ISO-TP mainline since 5.10 [S7].

**Disagreements.** Only minor ones, none Mercedes-related:
- CAN FD data rate is given as 5 Mbit/s in one section and 8 Mbit/s in another within the same CAN bus page [S10], and as 5 to 8 in the CAN FD page [S17]. Treat as "several Mbit/s, hardware dependent".
- ISO-TP maximum size: 4095 bytes in older versions, much larger since 2016 [S1], versus 4095 as the stated limit in the Linux module [S7]. These reconcile: the standard allows more, the kernel implementation caps it.
- python-can license: LGPL [S19]. Other libraries here are MIT [S13][S18]. Note for licensing: LGPL is usable as a dependency but not as copied code in an Apache-2.0 repo without care.

**Fetch tool caveat.** The fetch tool summarises pages through a smaller model, so what I recorded is that model's reading, not the raw text. Where the summary said a page "does not mention" something (for example DoIP on the CSS UDS page), I took it at face value.

**Not read (failed).** SERMI site (DNS failure, two forms), EUR-Lex Regulation 2018/858 (empty, two URL forms), EUR-Lex 2021/392 (empty, and I guessed that regulation number, which may be unrelated), UNECE R155 page (403), UNECE R156 page (403), Wikipedia pages for Mercedes Star Diagnosis, Diagnostics over IP, ISO 13400, ODX, AUTOSAR, Vehicle Information Access, Vehicle regulations (all 404), SavvyCAN GitHub (404).

---

## Implications for OpenDiag

### Build

1. **A clean three-layer transport stack** that mirrors the evidence: CAN driver, ISO-TP, UDS client. Reuse permissive libraries (udsoncan, can-isotp) or mirror their design rather than invent one [S6][S13][S18].
2. **A DoIP transport** as a pluggable alternative under the same UDS client: discover by UDP, activate routing, then TCP diagnostics [S14]. This is what the owner's WiFi ENET adapter would need on cars that support it.
3. **Standard OBD-II first for Mercedes.** Fixed IDs, no authorisation, works through gateways that pass the emissions slice [S23]. Ship live data, stored fault codes and readiness before anything deeper.
4. **Honest refusal handling.** When a unit answers "access denied" or "invalid key", show a plain message: this function needs the maker's authorisation [S2]. Never loop on guesses.
5. **A read-only default mode** with transmit allow-lists, borrowing the "silent unless allowed" pattern [S11].
6. **A capability probe per car**, recording what answered on which path (OBD-II slice, UDS on CAN, DoIP). This builds a public, user-contributed compatibility table without any proprietary data.

### Avoid

- Any seed-key, SFD, or login-circumvention feature. It is outside the project rules, and no source here suggests it is needed for useful read-only diagnostics.
- Claiming Mercedes coding or flashing support in the README before the legal route (SERMI or maker portals) is understood.
- Copying LGPL or GPL code into the Apache-2.0 tree. Using python-can as a dependency is a separate matter [S19].
- Trusting ELM327 clones for anything beyond basic reads [S20].
- Writing the CAN-C/B/D mapping into docs as fact until a primary source confirms it.

### Measure

- Share of test cars where standard OBD-II answers: target 100 percent.
- Share where UDS on CAN answers an identification read through the diagnostic socket: record, do not target.
- Share of DoIP discovery attempts that find a unit, per model year.
- Rate of "access denied" responses per function, to show users honestly what is locked.
- Time to first answer over BLE versus WiFi ENET (once the owner's adapters are tested).

### Process

This topic needs a real second pass. The plan: raise the web search cap, then read (a) the regulation text for 2018/858 Chapter XIV and Annex X, (b) the SERMI scheme's own pages, (c) Mercedes' independent-operator portal terms, (d) long Mercedes forum threads on SFD and gateway behaviour (discussion level only), (e) conference talks on automotive gateway design, and (f) UN R155 and R156 explainers.

---

## Open questions

1. What exactly do Mercedes CAN-C, CAN-B and CAN-D name, and which ones reach the OBD connector?
2. Which model years introduced DoIP on the diagnostic socket, and is there an activation gate?
3. How does a central gateway on recent Mercedes cars filter diagnostic traffic from the OBD socket?
4. What did SFD and SFD2 change for independent workshops, in plain terms, and what remains possible without authorisation?
5. Does XENTRY's personal login mean per-technician accountability, per-vehicle online checks, or both?
6. Can an individual enthusiast, or an open-source project rather than a company, obtain SERMI-style access? At what cost?
7. What does Mercedes-Benz actually provide independents through its own portal, in which formats?
8. Do any enthusiast hardware or software projects already speak Mercedes UDS legitimately and openly, and under which licenses?
9. How do UN R155 and R156 change what a diagnostic socket may allow in future model years?
10. What do the owner's OBDLink CX (BLE) and WiFi ENET adapters support in practice (CAN FD, ISO-TP timing, DoIP)?
11. Are there legal differences between EU, UK and US for aftermarket coding and reprogramming?

---

## Source ledger

All rows are pages actually fetched and read in this run. Summaries came through the fetch tool's own summariser.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| S1 | https://en.wikipedia.org/wiki/ISO_15765-2 | Encyclopedia | ISO-TP frame types, addressing, size limits | med |
| S2 | https://en.wikipedia.org/wiki/Unified_Diagnostic_Services | Encyclopedia | UDS sessions, SecurityAccess concept, negative response codes, KWP2000 lineage | med |
| S3 | https://www.csselectronics.com/pages/uds-protocol-tutorial-unified-diagnostic-services | Vendor tutorial | UDS over CAN, ISO-TP, sessions, tester present, security access; no DoIP | med |
| S4 | https://en.wikipedia.org/wiki/Keyword_Protocol_2000 | Encyclopedia | KWP2000 on K-line and CAN, speeds, wake-up | med |
| S5 | https://github.com/jacobschaer/python-doipclient | GitHub README | Pure-Python DoIP client, ISO 13400-2019 coverage, udsoncan transport | high (for the library) |
| S6 | https://udsoncan.readthedocs.io/en/latest/ | Library docs | UDS client features, ISO-TP socket connection, security unlock call | high (for the library) |
| S7 | https://github.com/hartkopp/can-isotp | GitHub README | Kernel ISO-TP module, limits. The "mainline since 5.10" line is on the repo About box, not the README (fact-check 2026-11-20) | high |
| S8 | https://en.wikipedia.org/wiki/Right_to_repair | Encyclopedia | EU Directive 2024/1799, repair platform 2028, no EU auto RMI detail | med |
| S9 | https://en.wikipedia.org/wiki/On-board_diagnostics | Encyclopedia | OBD-II/EOBD protocols, dates, connector, security criticism | med |
| S10 | https://en.wikipedia.org/wiki/CAN_bus | Encyclopedia | High-speed vs low-speed CAN, bit rates, W140 first CAN car | med |
| S11 | https://github.com/commaai/opendbc | GitHub README | MIT, safety firmware silent by default, no Mercedes mention | high (for what it says) |
| S12 | https://github.com/hartkopp/can-utils | GitHub README | SocketCAN tools incl. ISO-TP tools and cangw | high |
| S13 | https://github.com/pylessard/python-udsoncan | GitHub README | MIT UDS client, unlock method, ISO-TP connection | high |
| S14 | https://python-doipclient.readthedocs.io/en/latest/ | Library docs | DoIP discovery (UDP 13400), routing activation, TCP diagnostics | high |
| S15 | https://en.wikipedia.org/wiki/Vehicle_bus | Encyclopedia | Bus family overview (CAN, LIN, FlexRay, MOST, D2B) | med |
| S16 | https://en.wikipedia.org/wiki/Automotive_Ethernet | Encyclopedia | Single-pair Ethernet family; thin, no diagnostics | med |
| S17 | https://en.wikipedia.org/wiki/CAN_FD | Encyclopedia | CAN FD payload and speed, Daimler among supporters | med |
| S18 | https://github.com/pylessard/python-can-isotp | GitHub README | MIT ISO-TP package, user-space or kernel wrapper | high |
| S19 | https://github.com/hardbyte/python-can | GitHub README | LGPL-3.0 CAN abstraction with many backends, CAN FD | high |
| S20 | https://en.wikipedia.org/wiki/ELM327 | Encyclopedia | Protocols supported, clone problem, company closure | med |
| S21 | https://en.wikipedia.org/wiki/Euro_7 | Encyclopedia | Only a citation to Reg 715/2007 on repair information access | low (for this topic) |
| S22 | https://en.wikipedia.org/wiki/Automotive_hacking | Encyclopedia | Attack history and manufacturer responses; no port or gateway detail | low to med |
| S23 | https://www.csselectronics.com/pages/obd2-explained-simple-intro | Vendor tutorial | OBD-II CAN IDs, gateways blocking non-OBD traffic, EVs on UDS | med |
| S24 | https://www.kvaser.com/about-can/ | Vendor page | CAN basics; no automotive protocol detail | med |
| S25 | https://github.com/openxc/openxc-message-format | GitHub README | OpenXC signal format; diagnostic-derived signals | med |
