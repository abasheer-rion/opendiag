# OpenDiag evidence index and corrections

Status: curated 2026-11-20, branch `deep-research`. Scope: the 24 deep notes in this folder, checked against the 8 older research notes, 6 design docs, the plan docs and the code in `packages/core`.

**How this was made, stated plainly.** I fetched no new web pages. This is a synthesis of local files. Search was unavailable to most of the 24 runs, so the underlying evidence is thinner than the brief asked for. The Source ledger at the end lists the local files I read, not web pages. Reference tags like D06 point to the index in section 1. Tags like S4 or L12 inside a deep note point to that note's own ledger.

## Summary

1. **The deep set is strong on protocols and weak on people.** Standards, wire formats, vendor docs and GitHub READMEs are well covered. Forum threads, store reviews and measured demand are almost entirely missing. About 630 distinct URLs sit in the 24 ledgers (872 pages read in total), and the notes report zero forum threads read.
2. **Nine of 24 notes read fewer than 35 pages**, against the brief. The smallest are 11 (D24), 14 (D22), 17 (D09), 18 (D14), 19 (D19). Their conclusions are hypotheses, not findings.
3. **BMW ENET framing is now well supported.** Four sources agree on length, control word, source, target, then UDS, over TCP 6801. It matches `hsfz.ts`. Discovery bytes, length semantics, acknowledge handling and keepalive are still unknown. Only a capture from the owner's car settles them.
4. **The 0xF4 versus 0xF1 puzzle is mostly a route difference.** 0xF4 is the ENET tester (three sources). 0xF1 is the tester on the CAN route (ID 0x6F1). Four design docs treated it as an unresolved conflict. They are corrected.
5. **Nobody publishes a flash or coding failure rate.** Four independent notes looked. The only agreed cause is low battery voltage. Voltage thresholds disagree (11.9 V to 13.8 V). OpenDiag has to collect its own numbers.
6. **For the owner's gear, the CX is a diagnostics and coding adapter, not a flashing adapter.** OBDLink limits flashing to supported third-party apps. bootmod3 lists its own WiFi adapter and wired ENET. No tuner doc lists the CX (one review, single source).
7. **Newer BMW ECUs are locked by design.** Bosch MG1 and MD1 use a security module and secure boot. A second lock level appeared in mid-2020. Writing engine calibration is out of scope, and so is any unlock route.
8. **A permissive TypeScript starting point exists.** Svietlik and Boostline (both MIT) already speak HSFZ and DoIP. Both enforce read-only in code. The plan's "no TypeScript library" claim needed a caveat.
9. **The legal picture is favourable to reading and risky for tuning.** The DMCA vehicle exemption protects the person circumventing, not the tool maker. The Clean Air Act is the biggest tuning risk. App-store rules are the nearest day-to-day gate.
10. **I made 37 dated edits across 17 earlier docs** (24 corrections, C1 to C24). Six code assumptions (K1 to K6) are listed in section 3 and not applied.

## What I found

### 1. Index of the 24 deep notes

Pages are ledger rows that loaded and were read, as counted from each note's ledger. Flag: **thin** means under 35 pages or no practitioner sources.

| ID | Note | Pages | Top 3 findings |
|---|---|---|---|
| D01 | adapter-hardware-and-protocol-teardown | 55 | CX is STN2310-based BLE 5.1, HS-CAN and ISO/KWP only. ELM version strings are untrusted (v1.5 was never released). BMW ENET WiFi adapters are not ELM devices. |
| D02 | bm3-adapters-and-flashing-transport | 40 | No source gives any flash failure rate. bootmod3 recommends its own WiFi adapter and wired ENET, and lists no BLE adapter. CX MTU ceiling is 247 bytes with no queued writes. |
| D03 | bmw-coding-demand-and-practice | 36 | BimmerCode is the mainstream path (about $50, 4.7 from about 22K ratings). Start-stop disable is the strongest demand signal. A new software level can silently undo a coding. |
| D04 | bmw-coding-failures-and-recovery | 37 | Low voltage is BMW's own named cause. BMW's dealer programming fails too, and it has a recovery team. Backup restore can itself fail. |
| D05 | bmw-ecu-flash-security-public | 23 thin | Modern engine computers are locked by security module and secure boot. BMW built tuning detection and a readable flash counter. Seed-and-key weaknesses recur in academic work. |
| D06 | bmw-enet-hsfz-wire-protocol | 22 thin | Framing confirmed by four sources, TCP 6801. 0x0001 is diagnostic, 0x0002 is acknowledge. Discovery bytes and keepalive unknown. |
| D07 | bmw-ista-real-world-usage | 40 | Independents rent ISTA and use ICOM or J2534 officially. DIYers use ENET or K+DCAN with unofficial copies. Setup, not protocol, is the main complaint. |
| D08 | bmw-modules-dtcs-and-addressing | 47 | No complete public F or G address table exists. DME is 0x12 on three mentions. The write side and the data files are what is locked. |
| D09 | bmw-newer-cars-gateway-and-secure-diag | 17 thin | Gateway and UDS 0x27 and 0x29 design is documented in general terms. Nothing verified on iDrive 8 or 8.5. Open projects start silent and require an explicit mode. |
| D10 | bootmod3-platform | 22 thin | One licence per VIN with one map included, $595 for a B58. Own WiFi adapter $99. Post-June-2020 cars need an unlock costing roughly $800 to $1,600. |
| D11 | business-models-and-sustainability | 45 | Paid tools earn from hardware plus per-vehicle unlocks. Donations alone look thin. Platform rules are a bigger day-to-day risk than lawyers. |
| D12 | diagnostic-standards-and-obd-future | 38 | UDS, ISO-TP and DoIP are public enough to implement. OBDonUDS may become mandatory in the US in 2027 (single secondary source). SOVD and Eclipse OpenSOVD are early. |
| D13 | legal-regulatory-landscape-deep | 56 | Reading is safest. The exemption does not cover tool makers or emissions law. Right to repair helps diagnostics, not tuning. |
| D14 | mercedes-forums-and-practice | 18 thin | Failed to reach any practitioner source. Only model years and the standards layer are sourced. |
| D15 | mercedes-protocols-and-access-control | 25 thin | Generic CAN, ISO-TP, UDS and DoIP stack is sourced. SFD, XENTRY login and SERMI are background only. |
| D16 | obd-app-market-and-reviews | 37 | Four business models. Subscription pushback is the loudest complaint (Carista 1.7 of 5, Carly 2.6 of 5 on Trustpilot). Paid conversion starts at write access. |
| D17 | open-source-automotive-code-survey | 89 | Svietlik and Boostline are the closest code. Careful projects enforce read-only. OBDb has 897 repos under CC-BY-SA-4.0. |
| D18 | open-source-ecu-tools-lessons | 38 | Definition files are fragile and checksums are a recurring bug source. Breaking changes are documented in rusEFI. Nobody documents a built-in recovery path. |
| D19 | other-bmw-tuners-mhd-jb4-xhp | 19 thin | Flash tools versus piggyback tools. MHD and bootmod3 overlap on N55, S55, B58, S58. "Undetectable" is contested. |
| D20 | security-research-and-misuse-prevention | 42 | Diagnostics has weak locks. Real attacks arrive through the head unit or phone module first. Open safety architecture exists (comma.ai). |
| D21 | speed-and-latency-engineering | 47 | Waiting, not radio, is the biggest lever on ELM adapters. ISO-TP pacing can cap transfers near 7 kB/s. No real scan time for any incumbent exists. |
| D22 | toyota-lexus-forums-and-practice | 14 thin | Failed to reach practitioners. Techstream Lite Kit and three TIS levels are sourced. Everything about owner behaviour is unsourced. |
| D23 | toyota-lexus-protocols-and-open-data | 54 | Standard OBD-II on DLC3. Toyota uses services 0x21 and 0x22. About 2021 to 2022 and later internal CAN is authenticated, so opendbc marks those cars incompatible. |
| D24 | user-demand-and-pain-points | 11 thin | No frequency counts. Connection trouble and manufacturer-specific data are the visible themes. It says itself that it does not meet the brief. |

### 2. The 40 most decision-relevant facts

Confidence: **2+** means two or more sources that are at least partly independent. Several "2+" rows rest on vendor docs and libraries that may share a lineage, so read it as soft. **1** means single source. **Disputed** means sources conflict.

| # | Fact | Confidence | Doc |
|---|---|---|---|
| 1 | HSFZ frame is a 4-byte length, 2-byte control word, 1-byte source, 1-byte target, then plain UDS. | 2+ (four sources) | D06 |
| 2 | HSFZ diagnostics run over TCP port 6801. | 2+ | D06, D08 |
| 3 | Control word 0x0001 is diagnostic traffic and 0x0002 is acknowledge. | 2+ | D06 |
| 4 | The ENET tester address is 0xF4. The CAN route uses a tester byte of 0xF1 on ID 0x6F1. | 2+ for 0xF4, 1 for the 0xF1 CAN route | D06, D08, D23 |
| 5 | Big-endian length, and whether the length counts the two address bytes. | 1 and unconfirmed | D06 |
| 6 | UDP 6811 is a discovery or control channel. Its request and reply bytes are unknown. | 2+ for the port, none for the bytes | D06 |
| 7 | HSFZ needs no routing activation step. | 1 (indirect support) | D06 |
| 8 | An "alive check" control word (0x0012) exists. Who sends it and when is unknown. | 1 | D06 |
| 9 | OBD pin 8 is the Ethernet activation line. A +5 V level is single-source and a forum report said 12 V. | 2+ for function, disputed for voltage | D06, hardware-adapters.md |
| 10 | Which BMW chassis use HSFZ, DoIP or both is unknown. Tools support both and run detection. | Disputed | D06, D08, D09 |
| 11 | DoIP uses port 13400, UDP discovery, then routing activation, then diagnostic messages. | 2+ | D06, D15 |
| 12 | BMW CAN diagnostics use ID 0x600 plus tester or ECU address (0x6F1 for the tester). | 2+ (soft) | D08, D23 |
| 13 | DME is 0x12 and a gateway-style module is 0x10. No public G-series address table exists. | 2+ (soft, near-duplicate lists) | D08 |
| 14 | BMW fault-code prefixes and snapshot layouts are undocumented. UDS 3-byte code plus status byte is public. | 2+ | D08 |
| 15 | The CX is STN2310-based, BLE 5.1, HS-CAN and ISO/KWP only, no MS-CAN or SW-CAN. | 2+ (vendor pages) | D01, D02 |
| 16 | CX BLE: maximum MTU 247, no queued writes, bonding open only for 5 minutes after power-on. | 1 (primary vendor page) | D02, hardware-adapters.md |
| 17 | OBDLink says its adapters flash only via supported third-party apps (BimmerCode named). No tuner doc read lists the CX. | 1 for each half | D02 |
| 18 | bootmod3 recommends its own WiFi adapter and wired ENET and lists no BLE adapter for flashing. | 2+ | D02, D10 |
| 19 | No source publishes a flash, coding or brick failure rate for any tool. | 2+ (absence) | D02, D04, D10, D19 |
| 20 | Low battery voltage is the cause every source agrees on. Thresholds do not agree (11.9 V, 12.6 V, 13.2 V to 13.8 V). | 2+ for cause, disputed for numbers | D02, D04 |
| 21 | BMW's own dealer programming fails and BMW runs a recovery team. The head unit is the most documented failing module. | 2+ | D04 |
| 22 | Restore from backup can fail ("coding data invalid") and then needed a remote developer session. | 2+ (user reports) | D04, bimmerlink doc |
| 23 | Phone networking (CarPlay, mobile data, iOS local network permission) causes more "won't connect" cases than adapters. | 2+ | D02 |
| 24 | A non-MFi Ethernet adapter on iPhone can drop mid-flash and fail the flash. | 1 (bootmod3 page) | D02 |
| 25 | Other devices on the OBD port (piggyback boxes, gauges) break flashes. | 2+ | D02 |
| 26 | Modern Bosch MG1 and MD1 units use a security module and secure boot. A second lock level appeared mid-2020. | 2+ for the lock, disputed for the date | D05, D10, D19 |
| 27 | A BMW bulletin describes a "suspicion of engine tuning" check, and a flash counter exists. What resets it is unclear. | 1 for the bulletin, 2+ for the counter | D05 |
| 28 | Seed-and-key weaknesses recur: short or repeated seeds, home-made ciphers, weak lockouts. | 2+ | D05, D20, D23 |
| 29 | Diagnostic writes may be accepted at road speed. Behaviour differs by vehicle. | Disputed | D20 |
| 30 | Careful open projects enforce read-only in code and start silent. | 2+ | D09, D17, D20 |
| 31 | Svietlik (MIT, TypeScript, HSFZ, DoIP, UDS, 23 stars) and Boostline (MIT, BMW logging over ENET) exist. | 1 each (READMEs) | D17 |
| 32 | There is no general-purpose permissive TypeScript UDS or ISO-TP library. | 1 (method-limited search) | D17 |
| 33 | OBDb has 897 repos under CC-BY-SA-4.0. BMW depth is uneven (3 Series 243 signals, i4 3). | 2+ | D17, D23 |
| 34 | opendbc is MIT and holds broadcast CAN, not diagnostic reads. Toyota models from about 2021 to 2022 are marked incompatible (SecOC). | 2+ | D17, D23 |
| 35 | ELM adapters wait 200 ms by default. Tuning timeout and expected reply count lifted one example from about 6 to 10 or 12 reads a second. | 1 (vendor datasheet) | D21 |
| 36 | ISO-TP pacing can cap transfers near 7 kB/s. Unlimited pacing on 500 kbit/s CAN gives about 27 to 31 kB/s. | 2+ (derived plus one tool report) | D21 |
| 37 | iOS BLE minimum connection interval is 15 ms (some 30 ms). A round trip costs one to two intervals. | 2+ | D02, D21 |
| 38 | The DMCA vehicle exemption (renewed 2015, 2018, 2021, 2024) protects the circumventing person, not tool makers, and is not a shield from EPA rules. | 2+ (statute, Copyright Office) | D13, D11 |
| 39 | The Clean Air Act is the largest tuning risk. EPA quotes up to $4,527 per event, the statute's base caps are lower. | Disputed (figures) | D13 |
| 40 | BimmerCode is a one-time purchase near $50 with 4.7 from about 22K iOS ratings. Subscription tools draw the loudest complaints. | 2+ (vendor-quoted) | D03, D16 |

### 3. Where the new research contradicts or corrects earlier material

"Applied" means I edited the doc with a dated one-line note. "Not applied" means code or a decision I should not change unilaterally.

**Docs (applied unless stated)**

| # | Where | Was | Evidence says | Status |
|---|---|---|---|---|
| C1 | hardware-adapters.md, HSFZ table | 0x02 is "diagnostic response" | 0x02 is acknowledge (two sources) | Applied |
| C2 | hardware-adapters.md, tester address | 0xF4 vs 0xF1 "real discrepancy" | 0xF4 on ENET (three sources). 0xF1 is the CAN-route tester | Applied |
| C3 | hardware-adapters.md, 0x10 | "vehicle ID request" | Scapy says terminal 15, one low-reliability write-up says ident request. Disputed | Applied |
| C4 | hardware-adapters.md, DoIP port | 13400 "unverified" | Two sources agree | Applied |
| C5 | architecture.md, product-matrix.md, roadmap.md, failsafe T38, project-plan W3.10, architecture-12wk | Capture "decides" 0xF4 vs 0xF1 | Capture confirms 0xF4 and settles length, discovery and ack bytes | Applied (7 docs) |
| C6 | protocols.md, open-source-landscape-and-legal.md, bmw-ista-architecture.md | "G-series and newer use DoIP" or "newer cars DoIP" | Per-model use is unconfirmed. Detect at run time | Applied |
| C7 | protocols.md, FlexRay row | "F-series" | First fitted on E70, end 2006. Wider from 2008 (F01). Sources differ on the start | Applied |
| C8 | protocols.md, addresses | EGS 0x18 and DME 0x12 both unverified | DME 0x12 and 0x10 have three mentions. EGS 0x18 still unconfirmed | Applied |
| C9 | hardware-adapters.md, ELM bullets | Versions "meaningless" only | v1.5 never released. ELM327 reaches BMW only over D-CAN from about March 2007 (single source) | Applied |
| C10 | hardware-adapters.md, CX bullets | Tiering by assumption | Add chip, flashing statement, no tuner lists CX | Applied |
| C11 | oss-leverage.md row 2 and HSFZ row | No permissive TS library; HSFZ only in GPL code | Svietlik (MIT, HSFZ, DoIP, UDS) and Boostline exist. Wireshark has an HSFZ dissector from 4.2 | Applied |
| C12 | oss-leverage.md OBDb row | "Including Toyota and Lexus" | One note found no Lexus repo, another counts Lexus by name. BMW depth uneven | Applied (flagged) |
| C13 | resources.md N4 | CX $80 estimate, not on a page | $79.95 on OBDLink's page, out of stock at fetch. Owner reportedly owns one | Applied |
| C14 | bimmerlink-bimmercode-analysis.md | Prices not captured | About $50 US, 4.7 iOS from about 22K, 4.8 Android from about 12K | Applied |
| C15 | bmw-ista-architecture.md | ENET and K+DCAN implied official | Official independent links are ICOM or J2534 only. ENET works unofficially | Applied |
| C16 | coding-security-failsafe.md | Backup and restore assumed enough | Restore can fail. Keep two backups and an exported bundle | Applied |
| C17 | failsafe-coding-spec.md, voltage anchors | 12.5 V GREEN anchored to tuning guides | No source gives 12.5 V. Range 11.9 V to 13.8 V. Keep configurable | Applied |
| C18 | docs/README.md, "13 V rule" gap | Needs a BMW source | Deep pass found none. BMW says "approved charger". Others give 13.2 to 13.8 V setpoints | Applied |
| C19 | open-source-landscape-and-legal.md, penalties | $4,454 | EPA page says $4,527. Statute base caps $2,500 and $25,000. Different inflation years | Applied |
| C20 | toyota-lexus-techstream.md | Newest Toyotas use DoIP (vendor claim) | No public source for Toyota DoIP or a DLC3 gateway. SecOC marks 2021 to 2022 and later cars | Applied |
| C21 | architecture-12wk.md, WiFi ELM address | "192.168.0.10:35000" | Port 35000 is common. Default IP unconfirmed. Other adapters use 192.168.4.1 port 23 or 192.168.100.1 | Applied |
| C22 | architecture-12wk.md, parallel scan | Parallel is safe because replies correlate by address | No source shows gateway concurrency or second-tester behaviour. Hypothesis to measure | Applied |
| C23 | kpis.md, G2 and G3 | "Faster than incumbents"; WiFi ELM327 | No public baseline exists. Owner's adapters are a BLE CX and a WiFi ENET bridge, not ELM | Applied |
| C24 | design/architecture.md open questions | 0xF4 vs 0xF1 unresolved | Updated with three-source support | Applied |

**Code assumptions in `packages/core` (not applied)**

| # | Where | What it assumes | Evidence says | Exact correction |
|---|---|---|---|---|
| K1 | `hsfz.ts` header comment | Layout "NOT yet verified"; length counts the payload | Framing has four sources, big-endian from one. Length-counts-addresses is still unconfirmed | Update the comment to cite D06. Keep byte order and length semantics in one flippable constant |
| K2 | `net.ts`, `HsfzTransport.open` | Only control 0x0001 frames reach the inbox | Control words 0x0002, 0x0040 to 0x0045 and 0x00FF exist (single source). An "incorrect tester address" reply is dropped, so the caller sees a timeout | Route other control words to a typed event, log unknown words, map error words to named errors |
| K3 | `hsfz.ts`, `HSFZ_CTRL` | Only DIAG and ACK defined | Seven further words are documented by one source | Add them as constants marked unverified |
| K4 | `elm327.ts`, `request` | `target` is a plain CAN request ID set with `ATSH` | BMW's CAN route uses ID 0x6F1 with the target in the first data byte and replies on 0x600 plus the ECU address | Add an extended-address mode and prove it on the owner's car before claiming BMW module reads via the CX |
| K5 | `net.ts`, no discovery | Host must be supplied | UDP 6811 discovery exists. Bytes unknown | Add discovery only after the capture. Offer explicit IP, all interfaces, named interface |
| K6 | `net.ts`, no keepalive | Session kept alive by caller | HSFZ keepalive rules unknown | Capture idle behaviour, then decide |

## Evidence quality and disagreements

**What is strong.** Wire formats, UDS and ISO-TP mechanics, vendor-published adapter limits (ELM327 datasheet, OBDLink manual, CX developer notes), statute and Copyright Office text, bootmod3 and xHP support pages, and GitHub READMEs and API listings.

**What is weak.** Everything that depends on people: demand ranking, failure rates, forum experience, G-series behaviour, Mercedes and Toyota practice. Wikipedia carries a lot of load (12 of 17 pages in D09, 9 of 38 in D12, 14 of 42 in D20). The fetch tool summarised pages through a smaller model, so exact figures are second-hand.

**Shortfalls against the brief.**
- 9 of 24 notes are under 35 pages (D05, D06, D09, D10, D14, D15, D19, D22, D24).
- No note read a single forum thread of substance. Bimmerpost, Bimmerfest, Reddit, ClubLexus and PriusChat returned 403 or were blocked.
- D09 says 17 distinct pages but its ledger has 18 rows (two rows are one page). D24 lists 13 failed rows beside 11 read rows. I used the stated read counts.

**Disagreements between the deep notes themselves**
- **Tester address.** D08 reports 0xF1 and 0xF4 as "different routes". D06 treats 0xF1 as an unreliable decompilation claim. They are compatible: ENET 0xF4, CAN 0xF1.
- **HSFZ or DoIP on ENET.** D08 cites sources for both and a snippet saying DoIP only. D06 says both exist. Unresolved per chassis.
- **OBDb Lexus coverage.** D23 found no Lexus repo among 60 Toyota repos. D17 counts 163 repos named BMW, Toyota, Lexus or Mercedes. Unresolved.
- **Supra tune support.** D10 says bootmod3 targets the 2020+ Supra (store page and vendor). D23 could not verify it from a fetched page.
- **CX transport details.** D01 says the CX's service layout was not found. D02 and the earlier hardware note have it from OBDLink's developer page. D01's open question 1 is answered.
- **Unlock boundary.** June 2020, July 2020 or model year 2021, depending on the seller. Probably labelling.
- **Voltage.** bootmod3's "not above 12 V" conflicts with 13.8 V (xHP) and 13.2 to 13.5 V. Do not repeat it.
- **Adapter buffer.** 512 bytes (ELM datasheet) against 256 (OBDLink manual).
- **Polite polling.** 300 to 500 ms between requests against "immediately after a complete reply". Different contexts, unresolved.
- **BLE throughput.** About 12 kB/s calculated against about 50 kB/s measured. Packet size and phone age probably explain it.
- **Legal figures.** D13 and the older legal note quote different EPA penalty numbers. Both could be right for different years.

**Mercedes.** I made no Mercedes corrections. D14 and D15 found nothing that contradicts the older note, and they could not verify SFD, XENTRY login or SERMI. Those stay unverified.

## Implications for OpenDiag

**Build**
1. **A capture recorder first.** Every unknown in D06 becomes a fixture once the owner records a read-VIN on the ENET adapter. Wireshark 4.2 and later can decode HSFZ for comparison.
2. **HSFZ that surfaces what it does not understand.** Log and expose unknown control words and map error words. Keep byte order and length semantics behind one constant (K1 to K3).
3. **Run-time protocol detection.** Try HSFZ, then DoIP, in an order the user can change. Never key on chassis codes (facts 10, 11).
4. **A BLE layer written to the CX's documented limits.** Request the largest MTU, wait for each write response, buffer notifications, expect one client at a time (facts 15 to 17, 37). Use it for reads and coding. Block flashing over BLE with a plain message.
5. **An extended-address mode for the ELM and STN path**, proven on the owner's car (K4).
6. **ELM tuning as data.** Timeout, expected reply count and adaptive timing per adapter family. Treat the version string as untrusted (facts 35, C9).
7. **A voltage gate that is configurable and read live.** Default conservative. Show the range and "use a regulated supply, not a trickle charger" (facts 20, 21).
8. **Two verified backups and an exportable bundle**, because restore can fail (fact 22).
9. **Version-keyed rules for coding options.** A new software level can undo a coding (D03).
10. **A single-client check.** Warn if another app holds the adapter. The owner's bootmod3 app must not be connected during an OpenDiag session, and OpenDiag must never be attached during a bootmod3 flash (facts 23, 25).
11. **Read-only enforced in code**, matching the norm in svietlik, Boostline and comma.ai (fact 30). Writes stay compiled out of public builds.
12. **OBDb as a separate share-alike pack**, with our own fault text built from observation (facts 33, 14).

**Avoid**
- Flashing or engine calibration writes. The locks are by design and the Clean Air Act is the largest legal risk (facts 26, 39).
- Any unlock route, seed-and-key material or bypass (facts 28, 38).
- Quoting any adapter, tool or flash "success rate". None exists (fact 19).
- Hard-coding single-source numbers: the 11.9 V figure, a +5 V pin level, the 4095-byte HSFZ limit, the 0x0012 alive-check meaning.
- Per-chassis address tables copied from forums. Observe them on cars instead.
- Reading GPL or non-commercial source for the missing byte layouts. Capture and write clean-room.
- Claiming "faster than ISTA or BimmerCode" until we have timed them (C23).

**Measure**
- On the owner's car: discovery request and reply bytes, whether the length counts addresses, ack body, idle-connection lifetime, whether the gateway sends an alive check, and which protocol each car answers.
- Through the WiFi ENET adapter: whether it passes HSFZ unchanged, its default address and open ports.
- Over the CX: negotiated MTU, round-trip time, which modules answer on the OBD socket, and whether extended addressing works.
- Scan and read times for OpenDiag, ISTA and BimmerCode on the same car.
- Battery voltage sag during a read session.
- Later and opt-in: transport failure telemetry by adapter, firmware and platform. That produces the failure rates nobody publishes.

## Open questions

Ranked by how much they block building. "Sprint" refers to `docs/plan/research-sprint.md`.

| Rank | Question | Why it blocks | How to answer |
|---|---|---|---|
| 1 | HSFZ discovery bytes, length semantics, acknowledge body, alive check, idle timeout (OQ D06 1 to 4) | Blocks the first real transport and gate G-B | Capture read-only on the owner's car with the ENET cable and the WiFi adapter (sprint Q1). Decode with Wireshark 4.2 or later |
| 2 | Which protocol each owner car answers (HSFZ, DoIP, both) and which addresses (D06 6, D08 4) | Decides transport order and the module scan | Same capture. Forum query afterwards for the G-series gateway |
| 3 | Does the WiFi ENET adapter pass HSFZ unchanged, and with what address and ports (D06 7, D01 4) | Decides whether one transport covers the owner's WiFi path | Capture plus a short port check of the dongle (sprint Q2) |
| 4 | CX behaviour on a BMW: negotiated MTU, latency, which modules answer, extended addressing (D01 1, D08 8) | Decides what the BLE path can read | Read-only session with BLE inspection (sprint Q3) |
| 5 | Real scan and read times for OpenDiag and the incumbents (D21) | KPIs G2 and G3 have no baseline | Stopwatch plus traces on the owner's car, including ISTA and BimmerCode (sprint Q4) |
| 6 | Gateway handling of parallel requests and a second tester (D06 8, D21) | The 16-way parallel scan budget depends on it | Measure on the car after the first capture |
| 7 | Minimum safe voltage and why some failures happen with a charger attached (D04 3, 4) | Sets the write gate defaults | Log our own voltage readings on the bench and car. Read BM3 and BimmerCode support pages (sprint Q8) |
| 8 | Does bootmod3 work with the CX, and what are its counter and dealer-visibility rules (D10 1, 2; D19) | Matters to the owner's tuned car, not to reading | Ask bootmod3 support or the owner's own knowledge (sprint Q5) |
| 9 | BMW fault-memory byte layout, snapshots and prefix scheme (D08 5, 6) | Limits plain-language fault text | Census from owner reads. ISO 14229-1 purchase is already budgeted |
| 10 | G-series and iDrive 8 and 8.5: gateway behaviour, BimmerCode limits (D09 1 to 4) | Chassis decision for the second car | Forum reading through the owner's browser, then a capture if a G-series car is available (sprint Q7) |
| 11 | Pin 8 level, 5 V or 12 V (D06 5) | Only matters for DIY hardware | Multimeter on the owner's cable at rest (sprint Q6) |
| 12 | OBDonUDS mandate date and whether CARB or EPA text confirms 2027 (D12 3) | Future-proofing, not current build | Primary regulator pages and the SAE J1979-2 purchase decision (sprint Q9) |
| 13 | Legal: OBDb share-alike reach, EU 2018/858 Articles 61 to 66, SERMI, project name (D13, D09 5) | Blocks public release, not building | Primary sources, then the counsel call (sprint Q10) |
| 14 | Real brick and failure rates (D02, D04) | No external answer exists | Own opt-in telemetry later |
| 15 | Demand ranking by frequency (D24, D03 1) | Shapes the feature order after week 4 | Owner-assisted forum export or thread sampling (sprint Q12) |
| 16 | Toyota DLC3 gateway behaviour and Mercedes SFD, XENTRY login, SERMI (D22, D23, D15) | Not before the later phases | Defer. Retry with working search after BMW read-only works |
| 17 | OBDb Lexus repo coverage (D23 vs D17) | Minor data-source planning | One GitHub organisation listing call |

## Source ledger

Web pages fetched by me: **0**. Rows below are local files I read. "Part" means I read the summary, evidence-quality, implications and open-question sections and searched the rest. Reliability describes the file as evidence: high means it states its ledger and limits, med means thin or partly background, low means largely unsourced.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| 1 | docs/research/deep/adapter-hardware-and-protocol-teardown.md | Deep note (part) | D01 | med |
| 2 | docs/research/deep/bm3-adapters-and-flashing-transport.md | Deep note (part) | D02 | high |
| 3 | docs/research/deep/bmw-coding-demand-and-practice.md | Deep note (part) | D03 | med |
| 4 | docs/research/deep/bmw-coding-failures-and-recovery.md | Deep note (part) | D04 | high |
| 5 | docs/research/deep/bmw-ecu-flash-security-public.md | Deep note (part) | D05 | med |
| 6 | docs/research/deep/bmw-enet-hsfz-wire-protocol.md | Deep note (most) | D06, framing, control words, open bytes | high |
| 7 | docs/research/deep/bmw-ista-real-world-usage.md | Deep note (part) | D07 | med |
| 8 | docs/research/deep/bmw-modules-dtcs-and-addressing.md | Deep note (part) | D08 | high |
| 9 | docs/research/deep/bmw-newer-cars-gateway-and-secure-diag.md | Deep note (part) | D09, partial run | low |
| 10 | docs/research/deep/bootmod3-platform.md | Deep note (part) | D10 | med |
| 11 | docs/research/deep/business-models-and-sustainability.md | Deep note (part) | D11 | med |
| 12 | docs/research/deep/diagnostic-standards-and-obd-future.md | Deep note (part) | D12 | med |
| 13 | docs/research/deep/legal-regulatory-landscape-deep.md | Deep note (part) | D13 | high |
| 14 | docs/research/deep/mercedes-forums-and-practice.md | Deep note (part) | D14, no practitioner sources | low |
| 15 | docs/research/deep/mercedes-protocols-and-access-control.md | Deep note (part) | D15 | low |
| 16 | docs/research/deep/obd-app-market-and-reviews.md | Deep note (part) | D16 | med |
| 17 | docs/research/deep/open-source-automotive-code-survey.md | Deep note (part) | D17 | high |
| 18 | docs/research/deep/open-source-ecu-tools-lessons.md | Deep note (part) | D18 | med |
| 19 | docs/research/deep/other-bmw-tuners-mhd-jb4-xhp.md | Deep note (part) | D19 | med |
| 20 | docs/research/deep/security-research-and-misuse-prevention.md | Deep note (part) | D20 | high |
| 21 | docs/research/deep/speed-and-latency-engineering.md | Deep note (part) | D21 | med |
| 22 | docs/research/deep/toyota-lexus-forums-and-practice.md | Deep note (part) | D22, no practitioner sources | low |
| 23 | docs/research/deep/toyota-lexus-protocols-and-open-data.md | Deep note (part) | D23 | med |
| 24 | docs/research/deep/user-demand-and-pain-points.md | Deep note (part) | D24, self-declared failure | low |
| 25 | docs/research/protocols.md | Earlier research | Byte examples and HSFZ claims checked | med |
| 26 | docs/research/hardware-adapters.md | Earlier research | Adapter and HSFZ claims checked | med |
| 27 | docs/research/bmw-ista-architecture.md | Earlier research | Tool map, open questions checked | med |
| 28 | docs/research/bimmerlink-bimmercode-analysis.md | Earlier research | Prices and restore claims checked | med |
| 29 | docs/research/coding-security-failsafe.md | Earlier research (part) | Backup and voltage claims checked | med |
| 30 | docs/research/open-source-landscape-and-legal.md | Earlier research (part) | Licences, penalties, protocol statement checked | med |
| 31 | docs/research/mercedes-xentry-das.md | Earlier research (part) | Checked, no correction | low |
| 32 | docs/research/toyota-lexus-techstream.md | Earlier research (part) | DoIP and gateway claims checked | low |
| 33 | docs/design/architecture.md | Design (part) | HSFZ rows and open questions | med |
| 34 | docs/design/roadmap.md | Design (part) | Transport and risk lines | med |
| 35 | docs/design/product-matrix.md | Design (part) | HSFZ row and questions | med |
| 36 | docs/design/failsafe-coding-spec.md | Design (part) | Voltage gates and T38 | med |
| 37 | docs/design/data-schema.md | Design (part) | Transport example only | med |
| 38 | docs/design/fault-handling.md | Design (searched only) | Voltage mentions, nothing to correct | med |
| 39 | docs/plan/decisions.md | Plan | Owner decisions and hardware owned | high |
| 40 | docs/plan/kpis.md | Plan | G2 and G3 wording | high |
| 41 | docs/plan/README.md | Plan | Precedence rules | high |
| 42 | docs/plan/project-plan.md | Plan (searched) | Capture tasks, adapter plan | med |
| 43 | docs/plan/architecture-12wk.md | Plan (part) | Budget, parallel scan, WiFi ELM address | med |
| 44 | docs/plan/oss-leverage.md | Plan (part) | Library and OBDb claims | med |
| 45 | docs/plan/resources.md | Plan (searched) | Hardware prices | med |
| 46 | docs/plan/research-sprint.md | Plan | Sprint question list, used for ranking | high |
| 47 | docs/plan/direction.md | Plan (part) | Cross-check of user segments and caveats | med |
| 48 | docs/README.md | Index | Known gaps edited | high |
| 49 | packages/core/src/hsfz.ts | Code | Framing assumptions | high |
| 50 | packages/core/src/net.ts | Code | Control-word filtering, no discovery | high |
| 51 | packages/core/src/elm327.ts | Code | Target as CAN request ID | high |
| 52 | packages/core/src/transport.ts and doip.ts | Code | Read-only gate, DoIP defaults | high |
