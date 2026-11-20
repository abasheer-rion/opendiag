# Toyota/Lexus diagnostics and customization in practice

Status: **INCOMPLETE. This run hit a hard web-search limit before any search ran.** Zero searches succeeded. Only pages at URLs I already knew could be fetched. Forum threads (ClubLexus, PriusChat, Toyota Nation, GR86 and GR Corolla, Tacoma/Tundra/4Runner), Reddit, app store reviews and conference talks were NOT read. Everything about what owners do, what fails and what they wish for is therefore unsourced background knowledge, labelled **[UNSOURCED]**, and must be verified before anyone relies on it. The 14 pages that were read are in the ledger, and each sourced claim cites a ledger row as [S#].

Why the gap matters: the owner asked for evidence from real owners. This document cannot supply that. It does supply (a) verified facts about the standards and ecosystem around Toyota diagnostics, (b) an honest map of what is unverified, and (c) a research plan to close the gap.

Fetch failures, stated plainly:
- priuschat.com returned HTTP 522 (server error).
- drprius.com had an expired TLS certificate and could not be opened.
- reddit.com is blocked for the fetch tool.
- toyotanation.com and gr86.org redirect to a bot-paywall host (tollbit), so I did not fetch them.
- The openpilot supported-cars page (GitHub) returned only page navigation, no list.

## Summary (10 bullets)

1. Search was unavailable, so this is a thin document. Forum and app-review evidence is absent. Treat all owner-behaviour claims as hypotheses.
2. Toyota's official site confirms the official tool is Techstream, sold as a "Techstream Lite Kit" that lets an owner use their own PC [S1][S4]. The pages fetched give no prices. The price question is open.
3. Toyota's technical information site (TIS) says it has three subscription levels, but its feature table shows more than three column headings, so the level count is unclear (fact-check 2026-11-20) [S1]. Price and duration are not published on the pages fetched, and payment is on a third-party site [S1] (single source).
4. J2534 is the standard pass-through interface for reprogramming modules, standardised by SAE in 2004. The latest version listed is 05.00, from January 2022 [S3]. The Wikipedia article is a stub, so details are weak.
5. UDS (ISO 14229) is the common language for modern diagnostics. Reading data, clearing codes, writing values and controlling outputs are all separate services. Security access uses a seed and key [S12]. A safe tool can treat the write and control services as the dangerous ones.
6. Standard OBD-II only mandates emissions data. Manufacturers use the same port for proprietary functions that standard readers cannot reach [S15]. This is the gap that customization tools like Techstream fill.
7. Cheap ELM327 adapters are often clones. Clones copy a buggy firmware version and are limited to its faults [S14]. Clone USB chips have also been bricked by driver updates [S6]. This is the verified backbone of the "cloned cables fail" story.
8. The Toyota hybrid battery is held between about 40% and 80% charge by the car itself [S13]. Any "battery health" feature must read what the car reports and not claim more than that.
9. Open projects exist for the non-diagnostic side: opendbc (MIT) defines CAN messages for many cars, with a strict safety layer [S5][S10]. The licence is permissive, which makes it a safe reference for message definitions, though Toyota coverage was not confirmed.
10. Right-to-repair law gives independent owners some legal footing, but the federal picture is contested as of the sources read [S8].

## What I found (organised by sub-question)

### 1. Techstream (official) and Toyota information subscriptions

Verified:
- Toyota's technical information site says it has three levels of subscription, yet the table lists more headings than that [S1]. The feature table names Standard, Professional Diagnostic, Security Professional and Keycode columns, and includes "Techstream Scantool Software" as a row [S1]. Which level includes Techstream was not readable from the extracted text.
- A "Techstream Lite Kit" is offered for diagnosing and repairing Toyota, Scion and Lexus vehicles. The page says it lets you use your own PC with the Techstream software [S4]. No price appeared [S4].
- Subscribing sends you to a third-party payment site, and there is a "Manage Account" area for current or expired accounts [S1].

Not verified (open): actual prices, durations (daily, monthly, yearly), what the Lite Kit hardware is, which model years it covers, and whether Lite is allowed to change customize settings. Do not quote any price from memory.

**[UNSOURCED]** Common owner belief is that a short-term TIS plus a compatible cable is the legitimate route, while many owners use cheaper clone cables with unlicensed software. I did not read any thread that confirms either. The legal and licensing risk of unlicensed Techstream is a reason OpenDiag should not touch or redistribute Toyota's software at all.

### 2. Cables, J2534 and clones

Verified:
- J2534 describes a pass-through device that lets a PC reprogram vehicle modules over the OBD port. SAE standardised universal requirements in 2004. J2534-1 version 05.00 dates from January 2022 [S3]. Caveat: the source is a stub citing a 2003 reference [S3].
- Regulation in the US and Europe requires manufacturers to allow powertrain reprogramming through universal parameters [S3]. This is a basis for third-party tools. It applies to powertrain reprogramming, not to every customize setting.
- ELM327 clones: the original chip's firmware version 1.4 was not copy-protected, so clones are widespread and inherit that version's bugs [S14]. Clones frequently claim a version number that is current or even non-existent [S14].
- Clone USB-serial chips: in 2014 an FTDI Windows driver changed the product ID of counterfeit chips to "0000", making them unusable. FTDI withdrew it within weeks [S6]. In 2016 another driver replaced data on fake chips with a looped message instead [S6].
- ELM Electronics said in 2020 it would close in June 2022 [S14]. Clone supply is therefore the only supply for many users.

**[UNSOURCED]** Mini-VCI cables are widely reported to use clone chips that need old drivers, Windows-only, and have no firmware updates. I did not read any page confirming driver or chip specifics. The specific fake-chip failure mode on Mini-VCI is a hypothesis.

Implication that is well grounded: a Toyota-capable adapter strategy cannot assume the genuine hardware is present, and cannot assume the OS driver will behave.

### 3. What a modern diagnostic session looks like (standards level)

Verified [S12]:
- UDS defines separate services for reading data (0x22), reading fault codes (0x19), clearing codes (0x14), writing data (0x2E), controlling outputs (0x2F), routines (0x31), and security access (0x27).
- A session is always in exactly one diagnostic session, and a TesterPresent message keeps a non-default session alive.
- Negative response codes are standard. "Response pending" means keep waiting. Others report wrong conditions, denied access and too many attempts.
- UDS usually runs over CAN with ISO 15765-2 transport, and also over Ethernet.

Verified [S15]:
- Standard OBD-II modes cover live data, freeze frame, fault codes, clearing, sensor tests, vehicle info and permanent codes. All US vehicles have had CAN since 2008.
- Only emissions-related data is mandated. Manufacturers add proprietary codes and parameters, and often use the port as the only way to diagnose and program every system [S15].

Disagreement or gap: the Wikipedia pages do not say which Toyota ECUs use UDS and which use the older KWP2000. Toyota is not described at ECU level anywhere I read. Open.

### 4. Customize settings people change (DRL, door lock, chimes, mirrors)

**Nothing in this section is sourced.** The searches that would have found it did not run.

**[UNSOURCED] Likely popular, low risk:** daytime running lights on or off, auto door lock by speed or shift, auto unlock on park or key-off, seatbelt chime delay, auto-fold mirrors on lock, wiper and light-sensor sensitivity, welcome light and interior light timing, key fob confirmation beeps, reverse beep volume.

**[UNSOURCED] Likely to treat as unsafe or restricted for OpenDiag:** anything that disables or weakens airbags and occupant sensing, seatbelt warnings tied to safety systems, brake, steering, stability control, tyre pressure warning logic, emissions or speed limiters, immobiliser and key programming, and anything that touches the hybrid high-voltage system. The reason is a reasoning one, not a sourced one: these change safety-critical behaviour, and legal exposure sits with the tool.

Required follow-up: read real owner lists for each model line and record which items are reversible, which need a specific ECU, and which owners report problems. This is the largest hole in this document.

### 5. Hybrid battery health tools (Dr. Prius, Hybrid Assistant, Car Scanner)

Verified:
- Car Scanner's home page lists vehicle-specific coding pages for Volkswagen group and Hyundai/Kia only, with no Toyota or hybrid-battery mention, and links to Wi-Fi and Bluetooth ELM327 setup guides [S2]. That page did not list prices [S2].
- Prius generation 2 and 3 packs are 201.6 V nickel-metal hydride. The car limits use to about 40% of rated capacity, between roughly 40% and 80% charge [S13]. Third-generation Prius packs were boosted to about 500 V for the motor inverters [S13]. The Prius Plug-in Hybrid pack is 4.4 kWh lithium-ion [S7].
- Power capability changes with temperature [S13]. A health reading taken on a cold pack will look worse. A good tool should record temperature with every test.
- Toyota recalls on hybrid system software affected third-generation Prius (2014 inverter heating) and a 2018 fail-safe recall of about 2.4 million cars [S7]. Users may arrive with a recall question as well as a battery question.

Not verified: Dr. Prius (site failed to load), Hybrid Assistant (not fetched), what data they read, how they compute health, their prices, and review sentiment. **[UNSOURCED]** The common method is to read per-block voltages and compare internal resistance between blocks, using an ELM-style adapter. That needs checking against actual vendor pages.

### 6. Open source starting points

Verified:
- opendbc is described as a Python API for cars. It holds DBC files (CAN message definitions), a parser library and per-brand message builders. Its README does not mention Toyota or Lexus, and points to a separate supported list [S5]. Licence is MIT [S5].
- panda firmware handles CAN and CAN FD, starts in a silent safety mode, and cannot send until a safety mode is chosen. Some unrestricted modes are disabled in release firmware [S5][S10]. Its safety code has a stated 100% line-coverage test requirement [S5]. The panda README does not mention UDS or J2534 [S10].
- A silent-by-default, allow-list send model is a verified design to copy.

Not verified: which Toyota messages opendbc defines, and whether its definitions help with body-side customization (they target driver-assist signals).

### 7. Legal and access context

Verified [S8]:
- Massachusetts passed a 2012 law requiring automakers to give owners and independent shops the same diagnostic and repair information as dealers, and updated it in 2020 to cover vehicle data.
- A 2014 industry agreement was meant to extend this to all 50 states for the 2018 model year.
- In June 2023 NHTSA told makers to ignore the 2020 law, claiming federal preemption and cyber risk. Massachusetts disputes this and sued.
- The article says hybrids needed special tools that makers shared only with authorised shops [S8].
- The US Copyright Office exemption lets owners use third parties for changes to land vehicles [S8].

I did not confirm the lawsuit outcome. The Wikipedia text stops at what was read, and later developments are unknown here.

## Evidence quality and disagreements

- All 14 sources are either official front pages, open-source READMEs or Wikipedia. None is a forum thread, app review or talk. That is the opposite of what the owner asked for.
- Wikipedia pages were summarised by the fetch tool, and several were truncated at 100,000 characters (Prius, Hybrid System, Right to repair, OBD). Details beyond that were not read.
- Toyota's pages (S1, S4) were read through a summariser, and the price table may exist but not have been extracted. I did not see the prices, and I cannot say they are unpublished.
- Single-source claims: TIS three levels [S1]; Techstream Lite wording [S4]; FTDI incidents [S6]; panda behaviour [S10].
- No disagreement between sources was found, because there were too few overlapping sources to disagree.
- Every [UNSOURCED] statement is background knowledge, not evidence. Treat as low reliability.

## Implications for OpenDiag

Grounded in sources:
- **Build a safe-send layer first.** Copy the silent-by-default, allow-list approach used in panda [S10][S5]. Writes and output controls (UDS 0x2E, 0x2F, 0x31) should be off until the user opts in per setting [S12].
- **Build around standard services.** Reading fault codes and live data through OBD-II and UDS is standard and documented [S12][S15]. This gives value without touching proprietary secrets.
- **Handle security access as a boundary.** UDS security access exists so that only authorised tools write [S12]. OpenDiag should not attempt to bypass it. Anything needing seed-key access stays out of scope.
- **Detect bad adapters.** Check the adapter's reported version and behaviour, and warn on likely clones [S14]. Do not depend on chip IDs that drivers may change [S6].
- **Record temperature with every hybrid battery test**, because capability changes with it [S13].
- **Avoid shipping or reading Toyota's Techstream software or data.** The official route is a paid kit [S4]. Mirroring or cracking it is out of scope for this project's own rules.
- **Measure:** success rate of connecting across adapter types, reads that complete without negative responses, and the number of blocked write attempts.

Hypotheses to test once forum evidence exists:
- A curated list of low-risk customize settings per model, shown with a revert option.
- Read-only hybrid battery health with a clear, plain-language report.
- A "blocked by design" list for safety-related settings, with the reason shown to the user.

## Open questions

1. What do TIS subscription levels cost, and for how long? Which level covers Techstream and customize functions?
2. What exactly is in the Techstream Lite Kit, and which cables does Toyota sell or approve?
3. Which customize items do owners change most, per model (Camry, RAV4, Tacoma, Tundra, 4Runner, GR86, GR Corolla, Supra, Prius, Lexus lines)?
4. Which customize changes have caused real problems, and what recovery worked?
5. How reliable are Mini-VCI and other clone cables, and what fails (drivers, firmware, FTDI, voltage)?
6. Which Toyota ECUs speak UDS versus older protocols, and which need a J2534 device versus plain CAN?
7. How do Dr. Prius, Hybrid Assistant and Car Scanner compute battery health? What do owners trust and complain about?
8. What do owners say they wish existed?
9. What is the current outcome of the federal versus Massachusetts data-access dispute?
10. Are Toyota's newer models (security gateway, secured diagnostic access) blocking third-party tools?

## Research plan to finish this topic

Re-run after search is available or after the search limit is raised (the env variable CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION). Needed: about 40 searches across ClubLexus, PriusChat, Toyota Nation, GRCorolla, GR86, Tacoma/Tundra/4Runner forums, Reddit r/prius, r/Lexus, r/GR86, app store pages for Car Scanner, Dr. Prius and Hybrid Assistant, and the Toyota TIS subscription page. Then read at least 35 pages.

## Source ledger

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| S1 | https://techinfo.toyota.com | Official vendor | Three TIS subscription levels, feature table incl. Techstream and keycode, third-party payment, no prices shown | High for existence, low for completeness |
| S2 | https://www.carscanner.info | App vendor site | Coding pages for VW group and Hyundai/Kia only, links to adapter setup, no Toyota or prices | Medium |
| S3 | https://en.wikipedia.org/wiki/SAE_J2534 | Encyclopedia (stub) | J2534 purpose, 2004 standard, version 05.00 Jan 2022 | Medium-low (stub) |
| S4 | https://techinfo.toyota.com/techInfoPortal/appmanager/t3/ti?_nfpb=true&_pageLabel=ti_techstream_lite | Official vendor | Techstream Lite Kit description, own PC, no price | High for wording, low for completeness |
| S5 | https://github.com/commaai/opendbc | Open-source README | Purpose, DBC layout, safety model, MIT licence, no Toyota mention in README | High |
| S6 | https://en.wikipedia.org/wiki/FTDI | Encyclopedia | 2014 and 2016 counterfeit chip driver incidents | Medium-high |
| S7 | https://en.wikipedia.org/wiki/Toyota_Prius_(XW30) | Encyclopedia | Battery specs, 2014 and 2018 recalls | Medium |
| S8 | https://en.wikipedia.org/wiki/Right_to_repair | Encyclopedia | Massachusetts law, 2014 MOU, 2023 NHTSA stance, Copyright exemption | Medium |
| S10 | https://github.com/commaai/panda | Open-source README | CAN firmware, silent default, MIT, no UDS or J2534 | High |
| S11 | https://www.clublexus.com/ | Forum front page | Section list only, no Techstream content | Low for this topic |
| S12 | https://en.wikipedia.org/wiki/Unified_Diagnostic_Services | Encyclopedia | UDS service list, security access, negative codes, transport | Medium-high |
| S13 | https://en.wikipedia.org/wiki/Toyota_Hybrid_System | Encyclopedia | Pack voltages, 40-80% window, temperature effect | Medium |
| S14 | https://en.wikipedia.org/wiki/ELM327 | Encyclopedia | Clone origin, protocols, company closure | Medium |
| S15 | https://en.wikipedia.org/wiki/On-board_diagnostics | Encyclopedia | OBD-II modes, protocols, proprietary extensions | Medium-high |

Notes on the ledger: the numbering skips S9 because that fetch (openpilot CARS.md on GitHub) returned only page navigation and no content, so it is not counted. 14 pages were read, which is far below the 35 required.
