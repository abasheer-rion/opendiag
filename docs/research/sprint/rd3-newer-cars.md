# RD-3 (Q7): G-series gateway behaviour, iDrive 8 and 8.5 coding limits, "gateway locked" reports, HSFZ versus DoIP by chassis

Written 2026-11-24 (sprint day 2). Research only: nothing was sent to a car. Extends `docs/research/deep/bmw-newer-cars-gateway-and-secure-diag.md` and `docs/research/deep2/bmw-g-series-coding-reality.md` (deep2). Sibling notes: `rd1-hsfz.md` (framing, discovery, pin 8) and `rd2-bm3-adapters.md`. Facts those notes already hold are cited, not repeated.

Status: **PARTIAL.** Bimmerpost still refuses every request, including through the browser tool (403, "Access Denied"). Reddit and Bimmerfest stayed blocked or paid-crawl. So the forum layer is again thin: 3 workshop-forum threads read in full (one German, two diag.net), and the owner-forum picture rests on search-tool summaries only. What replaced the forums: BMW's own service bulletins (7 read, 5 in full), BimmerCode's public option pages (measured today, 22 pages), two open-source READMEs and docs, and vendor pages (marked as such).

Clean-room status: no leaked, cracked or pirated OEM file, key or database was opened. A decompilation-derived write-up (the "xenet32" page) was opened once, judged to be derived from a proprietary driver, and is **excluded** from every claim below. Vendor pages that sell signing or bypass services were read only for what they say about scope; no procedure from them is repeated. GPL code: README and docs only.

---

## ANSWER FIRST

1. **Reading is open, writing is not, and the catalogue cut follows car platform more than iDrive version (inference).** BimmerCode's public option pages list 106 to 197 coding options for G20, G22/G26, G29, G30, G11, G01/G02, G08, G42 and pre-LCI G05/G06/G07 (about 25 to 40 of them in the head unit), but only 3 to 4 options, all audio, for G05 LCI, G60, G70, U11, U10, U06, G09 and iX (I20). Those cars largely match the list in one BMW fault bulletin that names a "Basic Central Platform" (BCP) with a secure chip and "service pack 21". That bulletin is about a start-up fault, not about coding limits, so the link is my inference (low-medium). Measured 2026-11-24; no source states the reason.
2. **iDrive 8 versus 8.5 is a software step, not a hardware wall.** BMW's bulletin says cars built before July 2023 with head unit HU-H5 shipped on OS 8 and move to OS 8.5 when updated to I-level 23-07-523 or higher. BMW planned an over-the-air release for about September 2023; workshops hit it only during a separate repair. The coding limit follows the car platform. A G20 on iDrive 8 still shows a full option list; an X5 LCI on 8.5 does not.
3. **"Gateway locked" is not a phrase any BMW source uses.** Two search passes found it only for Tesla. What does exist: head-unit "lock mode" after a swap (BMW bulletin), modules that stop answering after a head-unit software fault (BMW bulletin), and gateway programming sessions that die mid-way and leave a car stranded (3 workshop threads). All three are about writing or software faults, not about a reader being refused.
4. **Readable on a G-series car without proof of identity, as far as any source shows:** discovery and VIN, module list, fault codes, identification values, software levels, vehicle order, live values, and coding-data reads. Standard emissions data always works on the OBD socket. Which module answers on which path varies by model and software level (one open-source author, medium).
5. **HSFZ versus DoIP by chassis: still not settled by any public table.** Best available: one open-source author says most G cars still answer HSFZ and the newest U and G gateways use DoIP on 13400; vendors say "DoIP for G-series" without chassis. The Ethernet gateway exists on the G30 since at least 2017. Detect at run time; the owner's capture decides for the owner's car.
6. **Needs-authorisation list: section C.** OpenDiag should never send: security access or authentication requests, any coding or flash write, head-unit feature activation, component-protection reset, key or module adaptation, routing activation beyond the default, or session changes. It should stop and log on any refusal.
7. **What needs you:** (a) tell us the chassis and head-unit generation of your car so P3 can be decided; (b) approve one extra passive probe in CAP-A (a DoIP identification broadcast, section D3); (c) if you can open Bimmerpost in your own browser, save the G05, G60 and G70 "coding" threads as text for the private folder.

---

## 1. Claims table

Confidence: high = BMW primary text, a standard, or two or more independent sources; medium = one clear source or two weakly independent; low = vendor tone, single anecdote or inference. "Single" = single-source flag. Source ids are in the ledger (section 5). "deep2 Sxx" points at the earlier note's own source list.

### 1.1 What is readable, and by which path

| # | Claim | Source | Conf. | Single |
|---|---|---|---|---|
| R1 | An open-source G-series scanner (MIT) read module list, part numbers, fault codes with details, live data and coding on a 2025 G20 through a J2534 cable on the OBD CAN pins. Tested on one car, a 2025 G20, through a Tactrix OpenPort 2.0 on macOS. Its ENET path was tested only against its own built-in simulator. | N10 https://raw.githubusercontent.com/Unblonded/bmwGxx/main/README.md | medium | yes |
| R2 | Same author: how much the G-series gateway passes from the OBD CAN pins varies by model and software level; some modules answer over ENET but not over CAN. | N10 | medium | yes |
| R3 | Same author: standard emissions requests always work; many engine units do not answer them over ENET, so those gauges show a dash. | N10 | medium | yes |
| R4 | The CAN route on the OBD socket uses request id 0x6F1 with the module address as the first data byte (README, re-read 2026-11-24). The reply id 0x600 plus module address and the 0xF1 tester byte were not re-found in the README today; they rest on deep2 S57 only. | N10, deep2 S57 | medium (request side), low (reply side) | no |
| R5 | Fault codes can be read and live data seen in all modules on newer BMW with consumer apps; one vendor says it still scans 2024+ BMW while withholding coding apps. | deep2 S34, S21 (not re-fetched; OBDeleven page returned 403 today) | medium | no |
| R6 | BimmerCode reads and backs up a module's coding data as part of normal use; reading is separate from writing. | deep2 S2; N9 FAQ (head unit must be unmodified; head units under 4 GB RAM are blocked) | high | no |
| R7 | A BMW bulletin on a G30 shows a Central Gateway Module (ZGW) with an Ethernet link and a link-down fault entry in March 2017. | N5 https://static.nhtsa.gov/odi/tsbs/2017/MC-10146590-9999.pdf | high | no |
| R8 | If a head-unit software fault hits an HU-H5 car, the receiver audio module, instrument cluster, telematics unit and head unit can all stop answering ISTA; the fix is a 30-minute battery reset, then programming the head unit. | N2 https://static.nhtsa.gov/odi/tsbs/2023/MC-10244502-0001.pdf | high | no |
| R9 | A broken Ethernet bus on the body controller can take down amplifier, camera assist, head unit, cluster and telematics (deep2 S25). Silence from several modules can therefore be a car fault, not a refusal. | deep2 S25; N2 | high | no |

### 1.2 Locks, signatures and the "new platform"

| # | Claim | Source | Conf. | Single |
|---|---|---|---|---|
| L1 | BMW's Feb 2026 bulletin (SIB 61 01 26, titled "Secure element failure during engine start") lists G05, G06 and G07 LCI, G45, G60, G70, I20, F74, U10 and U11, and says all cars with service pack 21 are affected. The Secure Element of the BCP may fail at start-up; stored faults include "coding data not released, signature" in the vehicle integration platform and the DSC unit, and "not qualified" in two others. The fix is programming the BCP. The bulletin is a fault repair, not a statement about coding locks. | N7 https://static.nhtsa.gov/odi/tsbs/2026/MC-11029070-0001.pdf | high | no (deep2 S22 read the same page) |
| L2 | The 2024 bulletin on comfort-access faults after an over-the-air update names the same families (G05, G06, G07, G09, G60, G70, I20, U10, U11) and the BCP module. | N6 https://static.nhtsa.gov/odi/tsbs/2024/MC-10252135-0001.pdf | medium (not re-opened in the fact check) | no |
| L3 | Head-unit "component protection" (trusted VIN): a swapped head unit or body controller (BDC or BCP) locks all feature codes (FSC) in HU-H2, H3, H4 and B2 units and stores fault B7F87A (bulletin rev 6, 2023-07-24); BMW's fix needs a technical-support case, new codes and certificates, then an ISTA initialisation. | N3 https://static.nhtsa.gov/odi/tsbs/2023/MC-10241369-9999.pdf | high | no |
| L4 | HU-H5 is the first head unit to replace feature codes with a "secure feature activation token"; activation is automatic via ISTA or over the air; no manual path; not swappable with an HU-H4. | search-tool summary of BMW attachment B65 24 23 (September 2023); the page itself returned 404 when fetched | medium-low | yes |
| L5 | Vendors say signed coding files ("NCD 2.0") started at integration level 21-03, 23-03 or 23-07, covering head unit, body controller, cluster; dates disagree. | N19 (vendor); deep2 S47 to S49 | low | no |
| L6 | One German workshop thread (2023, F48) and two diag.net threads (F-chassis and a 2010 535i) report a gateway programming session that aborted or froze and left the car partly dead; fixes were remote expert help or a replacement gateway. | N13, N14, N15 | medium (anecdotes) | no (three, different cars) |
| L7 | BMW's own sources say programming needs ISTA 4, a battery charger or supply, a measures plan, and often an online connection; "ISTA will automatically reprogram and code all programmable modules" below the latest software. | N1 https://static.nhtsa.gov/odi/tsbs/2026/MC-11026963-0001.pdf; deep2 S26 | high | no |
| L8 | A UK trade article (9 Sept 2024) says one aftermarket vendor (Hella Gutmann) gives access to "security gateways" on 7 Series, X1, newer 5 Series and X2 after a one-time free authentication with that vendor, and that more BMW coverage is expected. What functions it unlocks was not confirmed on re-read. | N20 https://garagewire.co.uk/?p=245710 | low-medium | yes (vendor claim) |
| L9 | A US aftermarket vendor's gateway page lists Stellantis, Nissan, Mercedes-Benz and VW/Audi, not BMW. | N21 https://autel.us/security-gateways/ | medium (text); low (meaning) | yes |
| L10 | No BMW document, forum summary or search result found in two passes uses "gateway locked" for a BMW. The phrase appears for Tesla. | search tool, negative result | low (absence) | n/a |

### 1.3 iDrive 8 and 8.5

| # | Claim | Source | Conf. | Single |
|---|---|---|---|---|
| I1 | HU-H5 cars built before July 2023 shipped with OS 8; moving them to software level 23-07-523 or higher makes them OS 8.5. This is delivered over the air (planned for September 2023) or in the workshop. Scope in the bulletin: G05, G06, G07 and F95/F96 from April 2023; G70 from July 2022. | N4 https://static.nhtsa.gov/odi/tsbs/2023/MC-10242531-9999.pdf | high | no |
| I2 | A 2025 bulletin covers head units HU-H4, H5 and H6 across F74, F95, F96, G05, G06, G07, G09, G20, G22, G23, G26, G42, G45, G60, G70, G80, G82, G83, G87, G90, G99, I20, U10 and U11. It does not say which OS each runs. | N1 | high (list) | no |
| I3 | BimmerCode's catalogue pages (measured today): see table in section B2. 106 to 197 options on every older-platform page checked; 3 or 4 audio-only options on G05 LCI, G60 family, G70, U11, U10, U06, G09, I20. | N8 | high (counts), medium (what it means) | no |
| I4 | G20 family page: 142 options (143 entries, one an info note), 53 of them marked as only possible with a listed adapter; the OBDLink CX appears on the adapter page as "Made for BimmerCode", all series. | N8 | high | no |
| I5 | BimmerCode's FAQ does not mention iDrive 8, 8.5 or secure coding. It blocks head-unit coding if the unit is modified (error BCE-009), has under 4 GB RAM (BCE-011), or, on NBT EVO units only, has a critical I-level (BCE-010). | N9 https://bimmercode.app/faq/ | high | no |
| I6 | Owner-forum summaries say 8.5 is locked "pretty tight" and that heated-seat coding differs from 8.0. Anecdote, not read in full. | search-tool summaries of Bimmerpost G05, G20 threads | low | no |
| I7 | The head unit "must be in original state"; third-party CarPlay or navigation unlocks must be reverted before BimmerCode will code it. | N9 | high | no |

### 1.4 HSFZ versus DoIP

| # | Claim | Source | Conf. | Single |
|---|---|---|---|---|
| P1 | EdiabasLib's own docs: vehicle protocol is an ordered list of HSFZ and DoIP; HSFZ uses 6801 (diagnostic) and 6811 (control) with tester 0xF4; DoIP uses 13400 with tester 0x0EF3 and gateway 0x0010 by default. | N11 https://raw.githubusercontent.com/uholeschak/ediabaslib/master/docs/EdiabasLib.config_file.md (same facts in deep2 S40) | high | no |
| P2 | Maintainer docs: without DHCP, the car falls back to a link-local address, so the laptop adapter must be set to automatic address. | N11 (ENET WiFi page); N10 README says the same | high | no |
| P3 | An open-source author says the newest U and G gateways use DoIP on 13400 while most models still answer HSFZ; his scanner does not implement DoIP, so the statement is a belief, not a test. | N10 | medium-low | yes |
| P4 | Vendors say G-series needs DoIP, ICOM Next is "preferred" for G programming, and ENET is fine for diagnosis and basic coding. None gives a chassis table. One admits it found no coverage matrix for the U-series. | N16, N17, N18 (all vendor or affiliate) | low | no |
| P5 | Scapy's HSFZ module lists control words: 0x01 diagnostic, 0x02 acknowledge, 0x10 terminal 15, 0x11 vehicle ident, 0x12 alive check, 0x13 status inquiry, 0x40 to 0x45 error words (tester address, control word, format, destination, too large, application not ready), 0xFF out of memory. Default port 6801; scan default source 0xF4. | N12 https://scapy.readthedocs.io/en/latest/api/scapy.contrib.automotive.bmw.hsfz.html | medium-high | no (consistent with rd1) |
| P6 | ISO 13400-2 DoIP has three phases (vehicle announcement and identification, routing activation, diagnostic messages), three protocol versions (0x01 draft, 0x02 2012, 0x03 2019), and TLS and client authentication are optional in the standard. | N22 https://www.arxiv.org/pdf/2211.12177 | high (for the standard) | no |
| P7 | An open-source scanner author says G-series cars "need the activation resistor between OBD pins 8 and 16", present in nearly every ENET cable. | N10 | low | yes |

---

## 2. Detail sections

### A. What is readable on a G-series car

"Readable" below means a consumer tool or open-source scanner does it without a login or certificate, per the sources. It does not mean no limits. Session type is rarely stated, so every row is a lead for the owner capture, not a guarantee.

| What | Over ENET (HSFZ or DoIP) | Over the OBD socket (CAN pins 6 and 14, for example OBDLink CX) | Evidence | Conf. |
|---|---|---|---|---|
| Find the car (broadcast), VIN, gateway address | Yes, UDP 6811 discovery; gateway 0x10; VIN by identifier F190 | Not applicable. VIN by standard emissions mode 09 works | deep2 S30; N10 | medium |
| Standard emissions data (modes 01, 03, 07, 09, 0A) | Often no: many engine units do not answer it over ENET | Yes, always (legal requirement) | N10 | medium, single |
| Module list (which units answer) | Yes | Yes on the 2025 G20 tested; some modules may not answer on CAN | N10 R1, R2 | medium, single |
| Fault codes, per module, with status | Yes (workshop tools, BimmerLink, OBDeleven) | Yes on the 2025 G20 (open-source scanner) | N10; deep2 S34, S21 | medium |
| Identification values (part numbers, hardware and software ids) | Yes | Yes on the 2025 G20 | N10 | medium, single |
| Software list and level (SVK, I-level) | Yes | Yes (BimmerCode shows I-level over listed adapters) | N10; deep2 S3 | medium |
| Vehicle order (FA, option codes) | Yes | Yes on the 2025 G20 | N10 | medium, single |
| Live values from the engine unit | Not tested by that author | Yes, via manufacturer identifiers on the 2025 G20 (one value unconfirmed) | N10 | medium, single |
| Coding data (read) | Yes (BimmerCode, ENET Wi-Fi boxes) | Yes on the 2025 G20; BimmerCode via CX for most options | N10; N8; deep2 S2 | medium |
| Same on a BCP car (G60, G70, U11, X5 LCI, iX) | **Unknown.** No source says what a reader sees there. BimmerLink lists these models for fault codes; OBDeleven says it still scans 2024+ BMW. | **Unknown.** | deep2 S34, S21 (listing only) | low |
| Whether a "secure" module returns trimmed or full coding data | Unknown | Unknown | deep2 S36 summary (low) | low |

What the sources do **not** cover and the capture must answer: which reads need an extended session, whether the CX over CAN reaches the head unit, telematics and BCP on a 2023+ car, and whether an unknown tester address is accepted by the gateway (rd1 notes the gateway has an "incorrect tester address" word, 0x40).

### B. iDrive 8 and 8.5: what changed and what the coding limit tracks

**B1. What BMW says (primary).**
- OS 8 shipped on HU-H5 cars before July 2023. Updating to a 2023-07 software level makes the car OS 8.5. BMW told dealers to warn customers because the change surprised them (N4).
- OS 8.5 therefore reached existing cars as a software update, not as new hardware. The deep note's "8.5 first on the G60" (Wikipedia) and "G20 gets 8.5 in model year 2025" are both compatible with this; the bulletin settles that existing X5, X6, X7 and G70 cars were upgradable from September 2023.
- Head-unit generations H4, H5 and H6 sit on current chassis (N1). OS 8 and 8.5 run on more than one hardware generation; the bulletins I read do not map OS to hardware beyond "HU-H5 comes with OS 8, then 8.5".
- Head-unit component protection and feature codes exist for HU-H2 to H4 (N3). HU-H5 reportedly moves to token-based activation (L4, single, search summary).
- Over-the-air upgrades and workshop programming rewrite software levels and can leave side faults (N6). Retail sources say an upgrade can undo a tune or coding (deep2 S32, S33, anecdotal).

**B2. BimmerCode catalogue, measured 2026-11-24.** Fact-check 2026-11-24: G20 (143 entries, 53 adapter-flagged), G60, G05 LCI (4 each) and I20 (3) were re-fetched and match; none of those catalogue pages shows a support banner, so the "Banner" column comes from the separate vehicle pages and was not re-checked. Method: downloaded the public option page for each chassis and counted entries marked with a "Requirements" line; counted entries whose requirement is a head unit (HU_MGU or HU_NBT_EVO). Counts can be off by a few. The page is a catalogue of what the app offers; it is not proof of what a given car accepts.

| Page (chassis group) | Options listed | Of which head unit | Banner on vehicle page | Notes |
|---|---|---|---|---|
| G30, G31, G38, F90 (5 Series) | 197 | 40 | supported (deep2) | |
| G11, G12 (7 Series) | 176 | 39 | not re-fetched | |
| G01/F97, G02/F98 (X3, X4) | 176 | not counted | supported (deep2) | |
| G08 (iX3) | 165 | 35 | supported (deep2) | A 2021 electric car on the same page family as the older cars |
| G20, G21, G80 (3 Series) | 142 | 15 (HU_MGU) plus 13 (HU_NBT_EVO) plus 12 (either) | supported | 53 options flagged "only with a listed adapter" |
| G22, G23, G26, G82, G83 (4 Series, includes i4) | 141 | 40 | supported | i4 has iDrive 8 and still has a full list |
| G42, G87 (2 Series Coupe, M2) | 128 | 38 | not re-fetched | |
| F40 (1 Series) | 113 | 38 | supported | |
| G29 (Z4) | 106 | 25 | not re-fetched | |
| G05, F95 pre-LCI; G06, F96 pre-LCI; G07 | 106 | 25 | supported (X5 pre-LCI) | |
| **G05 LCI** (2023+) | **4** | 0 | **limited support** | audio module only |
| **G60, G61, G90, G99** (5 Series, M5) | **4** | 0 | limited support | audio module only |
| **G70** (7 Series) | **4** | 0 | limited support | audio module only |
| **U11** (X1), **U10** (X2), **U06** (2 Series Active Tourer) | **4** | 0 | limited support (U11) | audio module only |
| **G09** (XM) | **4** | 0 | not fetched | audio module only |
| **I20** (iX) | **3** | 0 | limited support | audio module only |
| G45 (X3, 2024+) | page returned 404 | 0 | "not supported" (deep2) | |
| G80/G87/G12/F70/F95 separate pages | 404 | n/a | n/a | Pages folded into other groups |

**B3. What the measurement says, and how sure.**
- The sharp line is between cars with the older body controller and cars with the new central platform. On the older side there are 100+ options even on iDrive 8 cars (G20, G26, G42, G08). On the newer side there are 3 or 4 audio options.
- The newer side overlaps BMW's platform lists in the 2024 and 2026 fault bulletins (L1, L2) for G05/G06/G07 LCI, G60, G70, I20, U10, U11. G09 and U06 are not named in the 2026 list (G09 is in the 2024 list) but follow the same pattern on BimmerCode. G45 is named by BMW and is "not supported" on BimmerCode. **This match is my inference** (low-medium). Those bulletins repair faults; they say nothing about coding limits, and no BMW or BimmerCode text says the platform causes the limit.
- So "iDrive 8.5 is locked" in owner threads (I6) is probably "BCP cars are locked, and most BCP cars also run 8.5". A G20 LCI on 8.5 (model year 2025) still sits on a page with 142 options; the page does not split the LCI (deep2 G16). Whether that LCI is open or closed is **unknown**.
- Contradicts nothing in deep2; sharpens its "limited support" table with counts and the platform link.

**B4. What this means for OpenDiag.** Classify the car at connect by what its module list shows (does it have the new central platform module, which head-unit generation, what software level), never by model year. On older-platform cars: read, back up, diff coding. On new-platform cars: read faults and software levels, and show "this car signs its coding; OpenDiag does not write to it" in plain words. This keeps the product honest and matches decision 2 in `decisions.md` (no real-car writes).

### C. Needs-authorisation list (explicit)

Policy for OpenDiag, not a claim that the car refuses all of these. "Evidence" says what the sources show. Everything on this list is **blocked in code**, whether or not the car would accept it. The sprint allow-list in `research-sprint.md` section 4.2 already excludes all of it.

| # | Do not send | Why it is on the list | Evidence | Conf. |
|---|---|---|---|---|
| 1 | Security access (service 0x27, seed and key) | Standard gate for write, flash and some reads; lock-out timers on repeated tries | deep note L4 (UDS article) | high (standard) |
| 2 | Authentication (service 0x29) and any certificate flow | Newer cars ask the tester to prove identity; open tools carry workshop certificates | deep2 S39 to S41 | high that it exists, nothing on which services |
| 3 | Writing coding data to any module on a signed-coding car (BCP list in L1, L2) | Modules log "coding data not released, signature"; vendors say signing is online at BMW | N7; deep2 S20, S47 to S50 | medium |
| 4 | Writing coding data to older-platform cars | Technically possible with BimmerCode and E-Sys, but out of scope: decision 2 bans real-car writes | decisions.md | n/a |
| 5 | Flash or programming (download and transfer services, ISTA programming) | BMW's route needs ISTA, an interface, a charger or supply, a measures plan and often an online session; gateway aborts have stranded cars | N1; N13 to N15; deep2 S26 | high |
| 6 | Head-unit feature activation: feature codes (HU-H2 to H4) or activation tokens (HU-H5) | BMW generates codes or tokens; manipulation is not re-activated by BMW | N3; L4; search summary of another bulletin | high (H2 to H4), low (H5) |
| 7 | Component-protection or trusted-VIN initialisation | Needs a BMW technical-support case first | N3 | high |
| 8 | Component swaps and adaptations: body controller, central platform, engine unit, key learning, vehicle-order matching, Digital Key pairing | Workshop procedures with measures plans and online parts | N3; N6; vendor claim in deep2 | medium |
| 9 | Over-the-air or workshop software upgrades | BMW-side; can change OS level and side-effect faults | N4; N6 | high |
| 10 | Any non-default diagnostic session, ECU reset, clear faults, communication control, control-DTC-setting, routine control, actuator tests, input/output control | Not security-proven as gated, but they change car state; outside the read-only allow-list | deep note L4; research-sprint 4.1 | policy |
| 11 | DoIP routing activation other than the default type, DoIP over TLS, any ISTA-derived certificate or key container | ISO 13400 lets the car require extra checks; certificates come from OEM workshop software | N22; deep2 S41 | high (standard); policy |
| 12 | Anything from a refusal: negative replies "security access denied", "authentication required", "invalid key", "too many attempts", "delay not expired" | Stop, log, do not retry; retries trigger lock-out timers | deep note L4 | high |
| 13 | Retrying after a module goes silent | May be a car fault (N2, R9), not a lock; repeating wakes modules and can add faults | N2; rd2 | medium |

**Unknown whether authorisation is needed (do not probe in the sprint):** reads outside the standard identification range; extended-session reads; reads from the central platform, telematics and head unit on new-platform cars; reading coding data of signed modules (trimmed or full). Gap G4 from deep2 stands.

### D. HSFZ versus DoIP by chassis

**D1. What the evidence supports.** Both exist, both are tried by one open tool in a set order, and no public page maps chassis to protocol (rd1 and deep EVIDENCE agree).

| Chassis group | Evidence for Ethernet path | Protocol evidence | Conf. |
|---|---|---|---|
| F-series (2010 to 2019) | Workshop ENET cables and Wi-Fi boxes named for F in EdiabasLib docs and BimmerCode | HSFZ per Quantex, EdiabasLib defaults, rd1. One vendor search summary calls F-series ENET "DoIP/Ethernet" (low) | medium |
| G30, G11, G12 (2016 to 2023) | Ethernet central gateway module in March 2017 (R7) | Not stated | medium (gateway), none (protocol) |
| G20, G05 pre-LCI, G29, G01 | Wi-Fi ENET boxes and cable listed for G in BimmerCode adapters | One scanner author: most G models answer HSFZ (P3). Not tested on ENET by him | medium-low |
| G05 LCI, G60, G70, G45, U10, U11, I20, F74 (new platform) | BimmerCode shows ENET boxes as the adapters; BMW bulletins show these cars have Ethernet-linked head unit and telematics | One author: DoIP on 13400 "newest U and G gateways" (P3, belief); vendors: DoIP for G-series, ICOM Next preferred (P4, vendor) | low |
| i-series (i3, i4, iX) | Listed ENET in BimmerCode adapters | None | none |

**D2. Why the address defaults matter.** HSFZ uses a 1-byte tester address (0xF4 on ENET). DoIP uses 2-byte logical addresses (EdiabasLib default tester 0x0EF3, gateway 0x0010). A wrong DoIP tester address gets "routing activation denied" in the standard's reply codes (Quantex page via search summary, low). OpenDiag must not assume either.

**D3. Detection recipe (for CAP-A, owner decision).**
1. Join the dongle or cable network; note link-local address (P2).
2. Existing plan: UDP 6811 broadcast (HSFZ identification) and TCP 6801. Passive capture already covers this.
3. **Proposed add:** one UDP vehicle-identification request on 13400 (DoIP), read-only broadcast, no routing activation, no TCP connect. Record whether the car answers, what it says, and whether HSFZ still answers too. This adds one frame to the session and nothing else; it is optional and needs the owner's yes.
4. Only after step 3 answers, decide if a DoIP client is a week 2 task.

**D4. Pin 8 side note.** One more claim joins the voltage disagreement in rd1: a scanner author says G-series cars need a resistor from pin 8 to pin 16 (battery positive), which fits the "about 12 V" forum report and not a 5 V source (P7, single). Unresolved; a multimeter reading of a cable at rest does not settle it.

### E. "Gateway locked" reports: what exists

| Report type | What it says | Source | Reading |
|---|---|---|---|
| Head unit "lock mode" | After a head unit or body controller swap, features turn off and fault B7F87A stores | N3 | A designed theft and swap protection; needs BMW support |
| Modules stop answering ISTA | Receiver audio, cluster, telematics, head unit silent on HU-H5 cars; fixed by battery reset and head-unit programming | N2 | A software fault, not a lock |
| Gateway programming abort (F48, 2023) | Other units flashed, then the gateway session aborted; other units unreachable; an expert rebuilt the gateway table remotely | N13 | Write-path failure |
| Gateway froze during programming (535i) | Gateway left dead; replaced | N14 | Write-path failure |
| X3 central gateway damaged in programming | Replacement still would not take programming; dealer fixed; stored configuration cleared | N15 | Write-path failure |
| Ethernet link-down fault stored in the gateway | G30, harmless, BMW says ignore | N5 | Harmless fault entry, wrongly alarming |
| Aftermarket tool unlocks "security gateways" on 7 Series, X1, new 5 Series, X2 | Vendor registration, then automatic | N20 | Confirms some functions on new BMWs sit behind a gateway check. The article does not say which |
| Search for the exact phrase | No BMW hit | search tool, 2 passes | Likely a term from other brands (Tesla's gateway; US makers' secure gateways) |

Read-only consequence: a reader that sends only allow-listed requests is not the group that gets stranded in these reports. Every stranded case was a write.

---

## 3. Disagreements between sources

| Topic | Source A | Source B | Verdict |
|---|---|---|---|
| Which cars use DoIP | G-Diag: most models still answer HSFZ; DoIP only newest U and G (N10) | Vendors: G-series needs DoIP (N16 to N18); one search summary calls F-series ENET "DoIP/Ethernet" | Unresolved. Vendors do not give chassis; the open-source author tested no ENET car. Capture decides |
| When secure coding began | Vendor: integration level 21-03 | Other vendors: 23-03 or 23-07 (N19, deep2 S48 to S49) | Unresolved. BMW's own bulletins show the central-platform cars and "service pack 21", which fits a 2021 platform start with later enforcement. Not proven |
| Does "limited support" equal "audio only"? | deep2: banner text does not say what limited means | N8 count: 3 to 4 audio options on every limited page checked | Sharpened, not contradicted. The catalogue is what the app offers; the banner meaning is still the vendor's to state |
| 8.5 start | Wikipedia (deep): G60 first with 8.5; G20 on 8.5 only in model year 2025 | BMW bulletin: HU-H5 cars from April 2023 (and G70 from July 2022) move 8 to 8.5 by update from 2023-07 | Compatible. 8.5 is a software level on existing HU-H5 cars |
| iDrive 8.5 "locked tight" | Owner forums (summary only) | G20 and G26 pages on iDrive 8 show full option lists | Probably platform, not OS. Not tested on a G20 LCI with 8.5 |
| ENET versus ICOM | bmw-syndikat poster used ISTA+ over ENET with the ENET restriction removed (N13) | BMW: independent links are ICOM or J2534 (deep2 S26); vendor guides: ICOM "preferred" (N16, N17) | BMW's official route is ICOM; unofficial ENET exists. Not a read-path issue |
| Pin 8 | +5 V applied (python-doipclient, rd1) | Resistor to pin 16 / about 12 V forum report (N10; rd1 notes a 510 ohm pull-up claim) | Unresolved |
| Alive check | rd1: sources split | Scapy lists word 0x12 (N12) but no timing | Unresolved; capture decides |
| Gateway filtering | N10: CAN routing "varies by model and software level" | deep: one source says generic OBD requests marshalled through the gateway on a G29 | Compatible. Neither gives rules |

---

## 4. Implications for OpenDiag (short)

1. **Chassis decision P3:** do not pick a chassis by "G-series". Pick by platform: older central controller (open to read and diff coding) versus new central platform (read only). The owner's car decides which of the two OpenDiag proves first.
2. **Scan design:** scan reports "answered, silent, refused" per module and per path. A silent group of modules is logged as "no answer", not "locked" (R8, R9).
3. **Allow-list as code:** section C is the deny-list; keep it as a constant set with tests, as the deep notes already recommend (deep EVIDENCE fact 30).
4. **Protocol:** run-time detection with a user-changeable order; add a DoIP vehicle-identification probe to the capture plan; keep tester addresses configurable.
5. **Vehicle class badge:** show the platform class and software level at connect; link to a plain-words page "why this car is read-only".
6. **Honest copy:** never write "locked by BMW" unless the car returns a documented refusal; say "this app does not write to this car".
7. **Data to collect from the owner capture:** which of the 12 rows in section A answered on each path; how long each took; any new faults after the scan.

---

## 5. Source ledger

Fetched 2026-11-24 unless stated. "Read" = opened and read. "SS" = search-tool summary only. IDs N1 to N25 are new this run; deep2 ids (S1 to S59) refer to `docs/research/deep2/bmw-g-series-coding-reality.md`.

| ID | URL | Type | What it gave | Reliability |
|---|---|---|---|---|
| N1 | https://static.nhtsa.gov/odi/tsbs/2026/MC-11026963-0001.pdf (revision 1 link not re-checked in the fact check) | BMW NA bulletin 65 27 25, Dec 2025, PDF text extracted locally | HU-H4 to H6 chassis list; programming needs ISTA 4, charger, measures plan; RSU friendly | high (primary), read in full |
| N2 | https://static.nhtsa.gov/odi/tsbs/2023/MC-10244502-0001.pdf | BMW NA bulletin 65 31 23, Oct 2023 | Modules silent in ISTA on HU-H5 cars; battery reset 30 min, program head unit | high, read in full |
| N3 | https://static.nhtsa.gov/odi/tsbs/2023/MC-10241369-9999.pdf | BMW NA bulletin 65 13 16, Jul 2023 | Component protection, trusted VIN, fault B7F87A, fix needs BMW support | high, read in full |
| N4 | https://static.nhtsa.gov/odi/tsbs/2023/MC-10242531-9999.pdf | BMW NA bulletin 65 20 23, Aug 2023 | OS 8 to OS 8.5 as update to level 23-07-523; scope and delivery | high, read in full |
| N5 | https://static.nhtsa.gov/odi/tsbs/2017/MC-10146590-9999.pdf | BMW NA bulletin B61 09 17, Mar 2017 | G30 central gateway Ethernet link-down entry is harmless | high, read in full |
| N6 | https://static.nhtsa.gov/odi/tsbs/2024/MC-10252135-0001.pdf | BMW NA bulletin 61 11 24, Mar 2024 | Fault entries in the central platform after an over-the-air upgrade; model list | high, read in full (first page) |
| N7 | https://static.nhtsa.gov/odi/tsbs/2026/MC-11029070-0001.pdf | BMW NA bulletin 61 01 26, Feb 2026 (also deep2 S22) | Platform model list, service pack 21 note, signature fault texts. Re-read for the model list | high, read (first two pages) |
| N8 | https://bimmercode.app/cars/{g20, g22, g30, g11, g01, g02, g08, g29, f40, g42, g05, g06, g07, g05-lci, g60, g70, u11, u10, u06, g09, i20, a90}; https://bimmercode.app/vehicles/bmw/... for G05 LCI, G70, G20; https://bimmercode.app/adapters | Vendor catalogue pages, downloaded and counted by script | Option counts, module requirements, adapter flags, banners | high for the page content; medium for meaning |
| N9 | https://bimmercode.app/faq/ | Vendor FAQ (also deep2 S1) | Head unit rules; no mention of iDrive 8, 8.5 or secure coding | high |
| N10 | https://raw.githubusercontent.com/Unblonded/bmwGxx/main/README.md (MIT) | Open-source scanner README, full | Gateway routing varies; CAN framing; HSFZ and DoIP statements; tested only on one 2025 G20 via J2534 | medium (author's claims) |
| N11 | https://raw.githubusercontent.com/uholeschak/ediabaslib/master/docs/EdiabasLib.config_file.md and .../ENET_WiFi_Adapter.md and .../Deep_OBD_for_BMW_and_VAG.md (GPL project, docs only) | Maintainer docs | Protocol order, ports, addresses; link-local fallback; certificate import note (not used) | high (docs) |
| N12 | https://scapy.readthedocs.io/en/latest/api/scapy.contrib.automotive.bmw.hsfz.html | Library API docs | HSFZ control words, port, scan defaults | medium-high |
| N13 | https://www.bmw-syndikat.de/bmwsyndikatforum/topic_p400561_Programmierabbruch_Gateway-Modul_F48_Codierung__Diagnose_und_Programmierung.html | German owner forum thread, June 2023 | F48 gateway programming abort and remote repair | medium (anecdote), read via page summary |
| N14 | https://diag.net/discussion/sj3vhbqjghevx52b7xfdxmcyjw | Workshop forum thread | 2010 535i gateway froze in programming; replaced | medium (anecdote), read via page summary |
| N15 | https://diag.net/discussion/sqxlmvitx5ez2ofljx1sdtaue8 | Workshop forum thread | X3 central gateway damaged; replacement; dealer fix | medium (anecdote), read via page summary |
| N16 | https://bimmertalk.com/articles/bmw-ista-diagnostic-software-guide | Affiliate guide, updated 2026-11-05 | ENET versus ICOM Next; "DoIP wrinkle"; no chassis matrix | low |
| N17 | https://kdrcoding.com/bmw-cable-compatibility-chart-kdcan-enet-icom/ | Vendor chart | Cable by series; DoIP mentioned, HSFZ not | low |
| N18 | https://vccartool.com/knowledge-share/what-bmw-models-are-compatible-with-icom-next/ | Vendor article | "DoIP for G-series" claim, no chassis | low |
| N19 | https://mtriupgrade.com/bmw-ncd-2-secure-coding-explained/ | Vendor sales article | NCD 2.0 start dates conflict inside the page; module list. Procedure details omitted | low |
| N20 | https://garagewire.co.uk/?p=245710 | Trade news article, 2024-09-09 | Aftermarket gateway unlock on 7 Series, X1, 5 Series, X2 | low-medium |
| N21 | https://autel.us/security-gateways/ | Vendor page | Brands covered; BMW absent | medium (text) |
| N22 | https://www.arxiv.org/pdf/2211.12177 | Academic paper (Mercedes-Benz Tech Innovation authors, 2022), PDF text extracted | DoIP phases, versions, optional TLS and client authentication | high (for the standard) |
| N23 | https://emdzej.github.io/ediabasx-docs/reference/interfaces/xenet32-analysis.html | Reverse-engineering write-up from a proprietary driver | **Opened once, excluded** (decompilation provenance). Nothing from it is used | excluded |
| N24 | Search-tool summaries: Turner Motorsport, UroTuning, ECS Tuning product pages for the bootmod3 adapter; Quantex HSFZ page | Retail and vendor pages | BM3 on all F and G cars via ENET cable or its own adapter; V2A adapter trips alarm on G cars; Quantex: HSFZ no routing activation | low; SS only |
| N25 | Search-tool summary of BMW attachment B65 24 23 (bmwtechinfo) | BMW document, not opened | Token-based activation on HU-H5 (L4) | medium-low; SS only |

### Failed or blocked

- Bimmerpost G20 thread (p=32734960) and G05 thread (p=32549313): 403 by plain fetch and 403 "Access Denied" in the browser pane (one retry as per sprint rule). G60 thread 403. Not read.
- `https://bmwtechinfo.bmwgroup.com/sib_attachments/B65 24 23 Attachment 1.pdf` and `B65 09 16 Attachment.pdf`: 404 on fetch. Only search summaries exist.
- BM3 help centre pages (bootmod3.atlassian.net, two ids): returned empty content to the fetch tool. rd2 reports the help centre did load on another route; see rd2.
- BMW ISTA Independent Operators user manual (German): redirected to a BMW login; not read.
- OBDeleven November 2024 apps page: 403.
- GitHub page for the Deep OBD document: 503; raw copy read instead.
- BimmerCode pages for G45, G80, G87, G12, F70, F95, i01, G26: 404 (their groups live on other pages).
- Reddit, Bimmerfest, Wayback: not attempted again (blocked in earlier runs, see deep2 method box).

Page counts: 7 BMW bulletins read (5 in full); 22 BimmerCode catalogue pages plus 3 vehicle pages and the adapter page; 2 open-source READMEs or docs sets; 1 library API page; 3 workshop forum threads; 5 vendor or trade pages; 1 academic paper; 1 excluded. About 25 distinct sources, 15 of them first read this run.

---

## 6. Open questions

1. Which protocol does the owner's car answer, and does it answer both? CAP-A with the optional DoIP identification probe (D3) answers it for one car only.
2. Does the OBDLink CX over the OBD socket reach the head unit, telematics and the central platform module on a 2023+ car, or only the engine, transmission and body groups? (Needs CAP-B.)
3. What does BimmerCode's "limited support" actually do at run time on a car like the G05 LCI: read-only everywhere, or write to the audio module only? Asked of the vendor or read from the owner's own app.
4. Primary text for the HU-H5 activation-token bulletin (SIB 65 24 23). Owner could save it if a BMW dealer or retailer shares it; otherwise stay with L4's low confidence.
5. Is a G20 LCI (iDrive 8.5, model year 2025) open or closed? The catalogue page does not split it.
6. What "service pack 21" means in dates and whether older-platform cars get the secure element in later software.
7. Owner-forum text for the G05 LCI, G60, G70, i4 coding threads, saved as text by the owner (Gap G17 in deep2 stays open).
8. Which reads need an extended diagnostic session, and which reads of signed modules return full data (Gap G4).
9. Pin 8 level and the resistor claim (rd1 and D4).
10. Do over-the-air upgrades undo coding or tunes, and how often? Anecdotes only (deep2 S32, S33, N6 side faults).
11. Whether the DoIP in newest gateways uses TLS (port 3496 in the standard's later version) or plain 13400. No BMW source.
12. Does a failed or silent module group on a new-platform car return any documented refusal reply, or just time out? Needs the capture.
