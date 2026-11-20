# Mercedes-Benz diagnostics and coding in practice: what the evidence actually supports

Status: PARTIAL. This run did not meet the brief. The web search budget (200 per turn, shared across all agents) ran out before my first search, so I could not discover any forum thread, app review, vendor page or conference talk. I fetched 18 pages by direct URL. All are general reference pages (Wikipedia, GitHub READMEs, one forum index). None is a real practitioner source. Everything the brief asked about DIY practice (Vediamo, DTS Monaco, SCN, coding goals, bricking stories, licence prices, independent shop workflows) is therefore NOT evidenced here. I have not filled the gap with unsourced claims. Where I mention such topics, they are marked as unverified questions to research next.

The brief asked for 3000-6000 words and 35+ pages. This document is shorter than the usual depth because inventing detail would break the "every claim has a ledger reference" rule.

Ledger references look like [L7]. The ledger is at the end.

---

## 1. Summary (10 bullets)

1. **Research coverage is thin.** 18 pages read, 0 forum threads, 0 app reviews, 0 vendor pricing pages. The practice questions remain open. [L1-L18]
2. **Search was blocked.** No search could be run, so source discovery failed. A follow-up run needs a fresh search budget.
3. **The standards layer is solid.** Mercedes coding on modern cars is, at the wire level, standard Unified Diagnostic Services (UDS): session control, read and write of data identifiers, security access with seed and key, and reset. [L3]
4. **Open-source building blocks exist and are permissive.** python-udsoncan (MIT) implements UDS, and the Linux ISO-TP module is in the mainline kernel since 5.10. [L11, L14]
5. **Security access is the gate.** Restricted functions need a seed and key exchange using a secret algorithm held by the manufacturer. Public sources describe the mechanism only, not the algorithms. [L3, L17]
6. **Model years are now pinned down.** W204 2007-2014, W212 2008-2016, W205 2014-2021, W213 2016-2023, W222 2013-2020, X253 2015-2022, W177 2018 onward. [L5-L9, L15, L16]
7. **MBUX arrived in different years per model.** W177 launched with it in 2018. W213 got it with the 2020-21 facelift, replacing COMAND. X253 got it in the 2019 facelift. W205 had a 2018 facelift with new displays. [L5-L8]
8. **Legal footing is mixed.** US right-to-repair has a Massachusetts law and a 2014 industry agreement, but a 2023 federal position disputes the newer data rules. Warranty law says brand-only parts cannot be forced, but says nothing about software. [L4, L18]
9. **The one forum index fetched shows coding is a side topic.** MBWorld has a general Tech Talk area, no dedicated coding board in the visible portion. [L2]
10. **Nothing here supports a build decision yet.** Treat section 4 as hypotheses to test, not conclusions.

---

## 2. What I found

### 2.1 Protocol layer (what a coding tool does on the wire)

The UDS overview lists the services any open tool would need. [L3]

- **Session control (0x10).** The ECU is always in one session. Each session unlocks a different set of services, so coding may need a specific session first.
- **Writing configuration (0x2E).** WriteDataByIdentifier is the main way stored configuration is changed. WriteMemoryByAddress (0x3D) exists but is lower level.
- **Reading back (0x22, 0x24).** ReadDataByIdentifier and ReadScalingDataByIdentifier let a tool confirm a value and learn how to interpret it (encoding, units).
- **Security access (0x27).** The client asks for a seed, the ECU returns a random seed, both sides compute a key with a secret algorithm, and the ECU compares. A match unlocks that security level. A newer service, Authentication (0x29), lets a client prove identity instead.
- **Rejection codes worth surfacing to users.** securityAccessDenied (0x33), invalidKey (0x35), exceedNumberOfAttempts (0x36), requiredTimeDelayNotExpired (0x37). The attempts limit and the time delay matter for safety: a tool that retries blindly can lock an ECU out for a period. [L3]
- **Flashing.** RequestDownload (0x34), TransferData (0x36), RequestTransferExit (0x37), ECUReset (0x11). Failure codes include generalProgrammingFailure (0x72) and wrongBlockSequenceCounter (0x73). Code 0x78 means "response pending", which a tool must wait through rather than treat as an error. [L3]

The ISO-TP transport that carries these messages over CAN is available as a Linux kernel module. Its README says it is in mainline since 5.10, is described as unreliable (it does not report dropped messages to userspace), and recommends raising the interface transmit queue length (example given: 4000) because large messages produce many frames. [L14] I could not confirm the licence of that repo from the page. Per project rules I read only the README.

The python-udsoncan README shows a client that changes session, unlocks security access, writes the VIN identifier and resets the ECU, using ISO-TP over SocketCAN. It is MIT licensed. Its security example labels the level "Fictive" and gives no key guidance. [L11] That fits the project's rule that we describe security at an architectural level only.

The CAN article adds context: classic CAN carries up to 8 data bytes, CAN FD up to 64, and standard CAN has no built-in authentication or encryption, so protection is left to the application layer such as seed and key. [L17] It also notes seed and key schemes are not universal and give a limited number of key pairs. This is a single general source and it is not Mercedes-specific.

OBD-II basics: five signalling protocols, with CAN (ISO 15765) required on US vehicles from 2008. Only pins 4 and 16 are standardised across all connectors. Manufacturers may route diagnosis and programming for all systems through the same port, though the standard only requires emissions data. The article gives Mercedes K-line functions as an example of manufacturer-specific pin use. [L13] Implication: an off-the-shelf OBD-II reader sees only a small slice of a Mercedes. Coding needs enhanced diagnostics on the manufacturer's own addresses.

### 2.2 Model landscape (which cars matter and what electronics changed)

All from Wikipedia. Treat dates as reliable for production windows and medium for details, since the pages themselves carry "citation needed" tags in places. [L9]

| Chassis | Production | Notes relevant to coding tools |
|---|---|---|
| W204 C-Class | Sedan 2007-2014 | Facelift 2011 added COMAND Online; eCall from mid-2012. [L15] |
| W212 E-Class | 2008-2016 | Facelift for 2014 model year. New instrument cluster. COMAND base system. [L16] |
| W222 S-Class | 2013-2020 | Facelift 2017: 48 V starter/alternator, new inline-six engines. Magic Body Control uses a stereo camera. [L9] |
| W205 C-Class | Sedan 2014-2021, coupe/cabrio 2016-2023 | 2018 facelift: 12.3 in displays, touchpads on steering wheel, driver assist additions. [L5] |
| X253 GLC | 2015-2022 | 2019 facelift: updated MBUX, 12.3 in cockpit. [L8] |
| W213 E-Class | 2016-2023 | Facelift (model year 2021): COMAND replaced by MBUX, new steering wheel. [L6] |
| W177 A-Class | 2018 onward | MBUX standard from launch, "Hey Mercedes", 2023 facelift updated MBUX. [L7] |

Not covered by any page I could read: W166 (ML/GLE). The fetch returned a 404. I did not substitute other information.

What this means in practice (inference, not sourced): "older" cars (W204, W212) and "newer" cars (W177, W213 facelift onwards) differ in head unit generation, and plausibly in diagnostic network and security generation. The pages say nothing about diagnostic network changes, so I cannot say where the generation boundaries for coding tools fall. That needs forum evidence.

### 2.3 Forums and community

The only forum page that loaded was the MBWorld front page. [L2] From the visible first 100,000 characters (of about 167,000):

- There is a "Mercedes Tech Talk" area for general technical questions.
- There are sections for audio and electronics, vendor classifieds for technical assistance, tools such as a TSB list and recall list, and a VIN decoder.
- I saw no dedicated coding, Xentry or Vediamo board. Visible thread titles touched on a keyless-go diagnosis, CAN bus fault codes on a B-Class, engine coding on an A-Class, and an EQB charging port swap asking what needs coding.
- I did not read the last 67,000 characters, so a coding board could exist there.

Attempts to read the Tech Talk section directly returned a "page not found" template. Benzworld redirected to a third-party gate (tollbit.benzworld.org), which I did not follow. Reddit is blocked to the fetch tool. So: zero threads read. All forum-based claims in the brief (popular coding goals by model, bricking stories, what DIYers do) are unsupported by this run.

### 2.4 Apps and tools

OBDeleven returned HTTP 403. Carly and the Daimler XENTRY portal returned only a page title with no content. So no vendor claims about features, models, subscriptions or prices were obtained. I have no app-store reviews either.

### 2.5 Official access, cost and independent shops

- The J2534 article says SAE set universal passthrough requirements in 2004 and that manufacturers selling in the US and Europe must allow powertrain reprogramming through the standard interface. It does not discuss independent shops or Mercedes. [L1]
- The Right to Repair article describes the Massachusetts law of 2012 (owners and independents get the same diagnostic and repair information as dealers), the January 2014 industry memorandum of understanding meant to apply nationwide from model year 2018, and the 2020 ballot measure extending it to vehicle data. In June 2023 the US vehicle safety regulator told manufacturers to disregard the update, citing federal preemption and hacking risk. Massachusetts disputes both in court. [L4]
- The same article does not mention EU Regulation 715/2007. The EUR-Lex page I tried to read came back empty, so I have no primary source for EU independent-operator access rules. [L4, plus failed fetch]
- Pricing for XENTRY access, licences, or passthrough subscriptions: no source obtained. I will not quote figures.

### 2.6 Legal and risk context

- The US warranty law summary says warrantors cannot require branded parts to keep a warranty. It does not address software, and it says full-warranty protection does not apply where the maker shows damage or unreasonable use. Whether a coding change counts as misuse is untested in this source. Any link to coding is the writer's inference. [L18]
- The immobiliser article describes the key-to-ECU check: the ECU compares the key code and blocks fuel and ignition on a mismatch. Later systems use rolling codes or cryptography. It says programming a new key is faster than cloning on modern cars, with no citation, and it never mentions Mercedes. [L10] Relevance: modules that hold key data are the places where a wrong write can leave a car unable to start. That risk is plausible in general. I have no Mercedes-specific bricking evidence.

---

## 3. Evidence quality and disagreements

- **Quality.** All 18 sources are general reference. Wikipedia pages are medium reliability for dates and weak for technical detail. GitHub READMEs are high reliability for what the project says about itself.
- **Fetch tool summaries.** The fetch tool answers through a small model, so details come through a summariser. I treated figures from it as reported, not verified against raw text.
- **Truncation.** Seven Wikipedia pages and the MBWorld page were longer than the 100,000 characters read. Missing tails could hold relevant material.
- **Disagreements found.** One small one: the W213 article lists the facelift as model year 2021 in the infobox yet says "2020" in some sections. [L6] No disagreements on coding practice because there are no practice sources.
- **Single-source claims.** Every claim here has one source. None was cross-checked.
- **Failed fetches (not counted as read):** OBDeleven Mercedes page (403), Reddit search (blocked), Carly home (title only), XENTRY portal (title only), Wikipedia W166 (404), Wikipedia MBUX (404), Wikipedia Diagnostics over IP (404), EUR-Lex 715/2007 (empty), MBWorld Tech Talk section (not found), Benzworld (redirect to third-party gate, not followed).

---

## 4. Implications for OpenDiag (hypotheses, not findings)

These follow from the protocol sources only. Test each against real forum evidence before committing.

**Build**
- A UDS client core on top of standard transports. Use python-udsoncan-style session, read, write and reset flows. MIT licensing makes reuse clean. [L3, L11]
- Strict handling of ECU rejection codes. Back off on "too many attempts" and "wait before retry" instead of retrying. Treat "pending" as normal. [L3]
- Read-before-write and read-back-after-write for every configuration change, using the read and scaling services, plus a saved copy of the original value so a change can be undone. [L3]
- Load and queue awareness on the transport. ISO-TP is described as unreliable and large transfers need queue tuning, so detect drops and verify rather than assume. [L14]

**Avoid**
- Anything that needs manufacturer secret algorithms. Public sources describe the exchange only. Our rules already forbid reproducing them. [L3]
- Flashing in the first release. The service set exists, but failure codes show it is the dangerous path. [L3]
- Promising "works on all Mercedes". The generation boundaries are unproven. [Section 2.2]
- Marketing language implying warranty safety. The only legal source does not address software. [L18]

**Measure**
- Share of writes that read back correctly.
- Count of ECU lockouts or "too many attempts" responses per 1,000 sessions.
- Per-chassis success rate once real forum coding lists are collected.

---

## 5. Open questions (all unanswered by this run)

1. What do DIYers actually code on W205, W213, W177, X253, W222, W166, W204, W212? Need forum threads.
2. How does Vediamo / DTS Monaco style work differ from app-based coding, and what do owners say about risk? Need practitioner sources. (I know these tool names from the brief, not from a source here.)
3. What is SCN coding in practice, and does it require a factory server connection? No source read.
4. What are real bricking and recovery stories, and which modules fail?
5. What do OBDeleven, Carly, iCarsoft and Autel claim and charge, and what do reviews say?
6. What does official XENTRY access cost for owners and independents, and what does the passthrough route require?
7. Where is the diagnostic network generation boundary (older CAN, newer faster or IP-based)? The Diagnostics over IP page failed to load.
8. What does EU law require manufacturers to give independent operators, and at what charge?
9. Does a coding board exist in the unread tail of the MBWorld front page?

Next step: rerun with a restored search budget (or raise CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION) and target MBWorld, Benzworld, Reddit r/mercedes_benz and r/CarHacking, vendor support pages and conference talks.

---

## 6. Source ledger

All rows below were fetched and read (summarised via the fetch tool). Count: 18.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| L1 | https://en.wikipedia.org/wiki/SAE_J2534 | Encyclopedia | Passthrough standard set 2004; US and EU makers must allow powertrain reprogramming via it. No shop or Mercedes detail. | med |
| L2 | https://mbworld.org/forums/ | Forum index (first 100k of 167k chars) | Tech Talk, electronics, TSBs, vendor classifieds. No visible coding board. | med |
| L3 | https://en.wikipedia.org/wiki/Unified_Diagnostic_Services | Encyclopedia | UDS services for sessions, data write, security access, flashing, rejection codes. | med-high |
| L4 | https://en.wikipedia.org/wiki/Right_to_repair | Encyclopedia (first 100k of 178k) | Massachusetts law, 2014 MOU, 2023 federal stance; no EU 715/2007 coverage. | med |
| L5 | https://en.wikipedia.org/wiki/Mercedes-Benz_C-Class_(W205) | Encyclopedia | Production years, 2018 facelift displays, driver assist. | med |
| L6 | https://en.wikipedia.org/wiki/Mercedes-Benz_E-Class_(W213) | Encyclopedia | 2016-2023; facelift swaps COMAND for MBUX; year inconsistency noted. | med |
| L7 | https://en.wikipedia.org/wiki/Mercedes-Benz_A-Class_(W177) | Encyclopedia | 2018 on; MBUX standard; no OTA mention. | med |
| L8 | https://en.wikipedia.org/wiki/Mercedes-Benz_GLC-Class_(X253) | Encyclopedia | 2015-2022; 2019 facelift with updated MBUX. | med |
| L9 | https://en.wikipedia.org/wiki/Mercedes-Benz_S-Class_(W222) | Encyclopedia | 2013-2020; 2017 facelift, 48 V, MBC; page carries citation and quality tags. | low-med |
| L10 | https://en.wikipedia.org/wiki/Immobiliser | Encyclopedia | Key-to-ECU check, rolling codes; no Mercedes mention. | med |
| L11 | https://github.com/pylessard/python-udsoncan | GitHub README | MIT Python UDS client; ISO-TP over SocketCAN example; no key guidance. | high |
| L12 | https://github.com/commaai/opendbc | GitHub README | MIT; DBC files and CAN parsing for openpilot; README names no brands. | high |
| L13 | https://en.wikipedia.org/wiki/On-board_diagnostics | Encyclopedia (first 100k of 130k) | OBD-II protocols, EOBD dates, manufacturer-specific pins and diagnostics. | med |
| L14 | https://github.com/hartkopp/can-isotp | GitHub README | ISO-TP kernel module, mainline since 5.10, unreliable by design, tuning advice; licence not confirmed. | high |
| L15 | https://en.wikipedia.org/wiki/Mercedes-Benz_C-Class_(W204) | Encyclopedia | 2007-2014; facelift 2011; COMAND Online and eCall. | med |
| L16 | https://en.wikipedia.org/wiki/Mercedes-Benz_E-Class_(W212) | Encyclopedia | 2008-2016; facelift for 2014 model year; COMAND options. | med |
| L17 | https://en.wikipedia.org/wiki/Controller_Area_Network | Encyclopedia | CAN and CAN FD basics; no built-in security; seed/key limits. | med |
| L18 | https://en.wikipedia.org/wiki/Magnuson%E2%80%93Moss_Warranty_Act | Encyclopedia | Brand-only parts cannot be required; software not addressed. | med |

Attempted but not read (not in the ledger): obdeleven.com/mercedes, reddit.com search, carly.co, xentry.mercedes-benz.com, Wikipedia W166, MBUX and Diagnostics over IP pages, EUR-Lex 715/2007, mbworld Tech Talk section, benzworld.org.
