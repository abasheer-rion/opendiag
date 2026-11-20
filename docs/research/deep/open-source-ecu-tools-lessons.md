# Lessons from open-source and community ECU tools

Status: research note for OpenDiag. Date of research: 2026-11-20.

**Read this first: coverage limits.** The web search budget ran out before any search could run. All 38 pages below were fetched directly from addresses I already knew. That left real holes. I have no fetched source for ECUFlash, EcuTek, Hondata, COBB, EFI Live, the BimmerPost/Bimmerfest style forums, the RomRaider forum, or the XDA/HP Tuners forums. Several attempted pages returned errors (see end of ledger). Anything about those tools in this document is labelled "not sourced" and must not be treated as evidence. The pages I did read are mostly GitHub landing pages and issue lists, so I saw titles and maintainer-written docs, not long discussion threads. Treat the depth as moderate for RomRaider, rusEFI, Speeduino, opendbc and OBDb, and thin for everything else.

Ledger references look like [L12].

---

## 1. Summary (10 bullets)

1. RomRaider (Subaru, GPL-2.0) keeps its ECU definitions as XML files described by DTD schemas, and its format has kept growing for roughly 20 years: endianness flags, multiple scaling units, XInclude, subcategories, XDF import [L15][L32].
2. Definitions are fragile. A two-byte difference between a ROM file and the size a definition declared made RomRaider shift every table read by two bytes and show corrupted values. The maintainers said the behaviour must stay for backward compatibility, and a per-definition opt-out flag was the workaround [L23] (single issue thread).
3. Checksums are a recurring bug source, not a solved problem. RomRaider's release notes list checksum fixes for 32-bit ROMs, 16-bit variants, Nissan, BRZ and "improved checksum fix processing" across more than a decade [L15]. An open PR touches custom checksum modules [L33].
4. rusEFI treats breaking tune changes as normal and documents them. About half of its dated changelog sections carry a "Breaking Changes" note, mostly renamed settings, changed defaults and table changes, sometimes with advice to back up first [L13].
5. rusEFI and Speeduino both depend on a separate tuning-definition (INI) file that must match the firmware. User issues about "which .ini do I need" appear in rusEFI [L26], and Speeduino release notes tell users when to update the INI inside their tune [L19].
6. The "unknown firmware must not silently pick the wrong platform" rule is written down in opendbc's port checklist [L24]. That is the cleanest statement of the matching problem in anything I read.
7. opendbc and OBDb show two working models for community vehicle data. opendbc is code plus tests plus paid bounties and a company doing final validation [L16][L31]. OBDb is one repo per vehicle, JSON signal sets with year-range overrides, and a published schema with strict validation rules [L17][L29][L30][L38].
8. Licensing choices vary widely and matter: GPL (RomRaider, FreeSSM, rusEFI, Speeduino), MIT (OVMS, opendbc), CC BY-SA 4.0 for data (OBDb), and a restrictive "official hardware only" licence on MegaSquirt firmware [L1][L4][L6][L16][L17][L9].
9. Sustainability comes from hardware sales, donations, paid support, and in one case a company sponsor. RusEFI sells boards and paid support [L12]. Speeduino resellers send back a share of sales [L3][L36]. OVMS is a non-profit funded by hardware and donations [L6]. opendbc is backed by comma [L16]. Pure-software volunteer tools (RomRaider, FreeSSM) show signs of thin maintenance [L1][L27][L33].
10. Every project in this set puts liability disclaimers up front. Nobody I read offered a built-in recovery path in the docs I could see, so a stock-file backup and recovery story is a gap OpenDiag can own.

---

## 2. What I found, by sub-question

### 2.1 How did these tools represent ECU knowledge (definition files)?

**RomRaider: XML plus DTD, one definition per ROM family.**
The repository's definitions folder pairs XML data files with DTD schema files (`ecu_defs.dtd`, `logger.dtd`, `profile.dtd`, `cars_def.xml`, `log_defs.xml`) [L32]. Only six files were visible and the listing said more existed, so I cannot say how many ECU definitions ship. The release notes show the format being extended in many small steps [L15]:

- 0.5.8: multiple scaling units per table, including a raw option.
- 0.5.9: a global endian attribute on the memory model, overriding table-level settings.
- 0.8.0: a Bosch axis layout, subcategories using a `//` separator, and XInclude support.
- 0.9.x/1.0.0/1.1.0: XDF (TunerPro format) import, JDF/VDF conversion, and detection of XDF offsets in hex or decimal.
- Logger definitions have their own minimum-version gates (for example a minimum logger.xml version of 155 for new parameters in 0.5.7, and 352 for BMW DS2 telegram logging in 0.7.0).

Two lessons from this: format growth is constant, and the logger definitions are versioned separately from ROM definitions. RomRaider also added BMW DS2 logging for MS41, MS42 and MS43 in 0.5.9 RC1 [L15], so a BMW-adjacent codebase exists, though I read only its release notes.

**RomRaider definitions are inheritance-based.** In issue 238 the child definition `T6E_P138E0009` is "based on" a parent `LOTUS_T6E`, and tables use fixed `storageaddress` values such as 0x28DE [L23]. That shows definitions inherit from a parent and override addresses per ROM revision. One source only, from a single bug report.

**TunerPro: bins plus XDF/ADX definitions.** The site says an XDF matching the ECU is required to edit a bin, and ADX is a second definition format with its own features. It also warns that definitions saved in V6 using new XDF/ADX features will not open in earlier versions, and recommends backing up definitions and bins before using V6 [L5]. That is a direct example of forward-incompatible definition formats hurting users. RomRaider adding XDF import [L15] means XDF has become something of a shared interchange format between tools (inference from two sources).

**rusEFI and Speeduino: INI definitions for TunerStudio.** rusEFI ships a bundle with firmware, a console, drivers and a TunerStudio definition [L12]. Its own tuner ("rusEFI tuner") is promoted first, with TunerStudio optional [L18]. The rusEFI issue tracker has reports such as "Load tune, why do I need original ini?" (#10611) and a Windows report about where the tuner looks for .ini files (#10667) [L26]. Speeduino's release notes distinguish releases that need no INI change from those where the INI "should" be updated in the tune [L19]. So the pattern is: firmware version, definition file and saved tune are three separate things users must keep aligned.

**OVMS: per-vehicle modules plus generic DBC support.** The docs split support into native vehicle modules and general support (DBC-based decoding, standard OBD-II, tracking-only) [L6][L14]. Most features come from reverse engineering, not OEM documentation [L6].

**OBDb: one repository per vehicle, JSON signal sets with year overrides.** Each repo has `signalsets/v3/default.json` plus year-range files like `2012-2020.json` that override the default for those years. A new generation can lock the old config into a range file and let `default.json` move to the latest [L17]. The Prius repo adds `generations.yaml`, a `tests/` folder and CI workflows [L38]. The schema is strict: unknown signal properties are rejected, each command needs header, command, frequency and signals, each signal needs an id, a name and a decoding spec that includes either a value map or both max and unit, and there is a fixed unit list of about 90 values and about 60 "suggested metric" values [L30]. Paths must begin with one of a fixed list of categories (Airbags, Battery, Brakes, Climate, DTCs, Engine, Transmission and others) [L30]. Year filters take from/to bounds or a list of years [L30]. One notable validation rule: a command for `F190` is rejected because it returns the VIN [L30].

**opendbc: code, not data.** A port lives in `opendbc/car/<brand>/` and contains CAN parsing, message building, fingerprints and interface code [L16]. This is closer to "a plugin per vehicle" than "a data file per vehicle."

### 2.2 Checksums

- RomRaider's changelog is the best evidence I have. Checksum items appear for 32-bit ROMs (0.5.3b), ALT2 16-bit checksums (0.8.0), Nissan (0.9.2), BRZ (0.5.8) and an improved fix process (1.1.0) [L15]. An open pull request (#248) targets "Custom Checksum Modules" [L33]. Reading: checksums are per-ECU-family code, not something a data format alone can describe, which is why RomRaider has "custom checksum modules."
- The Wikipedia chip-tuning article does not mention checksums at all [L20], so it is no help. I found no source that explains checksum algorithms for any BMW ECU, and per the research rules I would not reproduce such details anyway.
- opendbc's checklist covers a different checksum: CAN message checksums and counters, including wraparound handling, and "invalid counters, checksums, or stale inputs" must disable control [L24]. A reminder that "checksum" means two things here: ROM integrity and message integrity.

### 2.3 Backups, bricking and recovery

This is the weakest area in my evidence, so I keep claims narrow.

- RomRaider issue 238 is not bricking, but it is silent data corruption on load because the definition and the file disagreed on size by two bytes [L23]. The user-visible symptom was wrong values in tables, with no warning. That is the failure OpenDiag most wants to prevent: showing plausible-looking wrong numbers.
- TunerPro tells users to back up definitions and bins before moving to V6 [L5].
- rusEFI's changelog advises backing up before an update in one case (November 2020, a table/calibration replacement) [L13]. Issue titles in the rusEFI tracker mention tune changes lost when unplugged on a running engine (#10675) and a tune that would not burn until the engine was off (#10674) [L26]. I only saw titles, so I cannot say what was confirmed.
- OVMS issue #1475 reports a module that no longer starts after a firmware build; the page does not say it was an OTA update [L28]. I cannot claim OTA bricking is a documented pattern there.
- Neither the Speeduino tracker nor the FreeSSM tracker titles I saw mentioned bricking [L25][L27]. The Speeduino tracker titles did show a call for validation of serial frames and calibration bounds and a tracking item for "configuration, migration and resource validation" (#1619, #1629) [L25]. Titles only.
- The rusEFI firmware readme says nothing about recovery and tells end users to use pre-built firmware [L35].
- HP Tuners' site says its interface can "read, edit, save, and write" modules, but the page says nothing about backup or recovery [L10].
- The FreeSSM README says use is at your own risk and disclaims liability for unexpected vehicle behaviour [L4].

**Not sourced:** how ECUFlash, EcuTek, COBB or HP Tuners handle stock-file backup and recovery. Anything the owner knows from bootmod3 practice is not evidence in this document.

### 2.4 Licensing

| Project | Licence (what I read) | Source |
|---|---|---|
| RomRaider | GPL-2.0 | [L1] |
| FreeSSM | GPL-3.0 (TinyXML under zlib) | [L4] |
| rusEFI | "GPL" on the repo page; exact version not stated there; website says no licence fee | [L2][L12] |
| Speeduino | Sidebar says GPL-2.0, README badge says GPLv3. This is a disagreement within the same repo | [L3][L36] |
| OVMS3 | MIT, third-party parts keep their own licences | [L6][L34] |
| opendbc | MIT | [L16][L31] |
| OBDb | Mostly CC BY-SA 4.0; derived changed definitions must be shared under the same terms, app code unaffected | [L17] |
| MegaSquirt | Firmware and hardware copyrighted and patented; source and derivatives licensed only for use on official MegaSquirt hardware | [L9] |
| TunerPro | Free to use; optional paid registration (RT fee quoted as rising from $39 to $47) | [L5] |

The OBDb term is the most interesting for OpenDiag: it splits data from code, so an app can stay under its own licence while shared definitions stay open [L17]. MegaSquirt shows the opposite risk, where hardware-restricted licensing leads to unlicensed clones [L9].

Note for OpenDiag's own rules: we treat GPL and non-commercial source as README-only. This research followed that. I read repository landing pages, issue lists and release notes, not source code.

### 2.5 Community definition contributions

- **opendbc** asks for a full workflow: connect hardware, reverse engineer in a CAN viewer tool, work through a long checklist, add per-car safety tests, and pass CI [L16][L24]. It pays bounties ($2000 per brand/platform, $250 per model, $300 per new actuation message) and the company decides which community ports it picks up [L16]. Its supported-cars list has 405 cars, a four-column table (make, model, package, support level) and tiers: Upstream, Under Review, Custom, Dashcam mode, Community, Not compatible [L37]. The page says there is no formal roadmap and most new support comes from users [L37].
- **OBDb** invites contributions through forks and pull requests, and new vehicle repos are requested through an issue template on a meta repo [L17][L38]. The page I read did not describe review of submissions [L17]. I cannot say how well its quality control works in practice. The Prius repo showed 7 stars and 4 forks, which suggests small contributor numbers there [L38].
- **OVMS** wants contributors to introduce themselves on a mailing list, keep one vehicle or issue per pull request, add user-guide text, and state manufacturer warnings and warranty exclusions up front. It rejects "vibe" coded, unvalidated AI submissions [L6][L34].
- **rusEFI**: discuss changes before opening a PR; unfinished PRs must be marked "[WIP]"; incomplete PRs get closed [L7]. It has a tracker of about 1,300 open issues with labels such as "waiting-for-test" [L26].
- **RomRaider**: the visible PR queue was small (6 open, 117 closed) with several open since 2022 [L33]. I saw no contribution guide in the capture [L1]. Definition contributions were not visible in the PR list I read [L33], so I cannot say how the community actually shares definitions today.

### 2.6 Governance and release practice

- rusEFI: single "stable master" with no release branches, CI with limited automated testing, and a stated need to make its gate check more reliable [L7]. Hardware-in-the-loop CI existed for one platform as of the note's date (2019) [L7]. Releases use month names and "Day N" labels about every two to four months, with one six-month gap [L13].
- Speeduino: `YYYYMM` base versions with `.N` patch releases and one older line marked LTS. Release notes do not label breaking changes explicitly, though some describe behaviour changes [L19].
- RomRaider: semantic-looking numbers from 0.2 in 2006 to 1.1.0 in November 2025. The 0.5.x series had many release candidates over 2006 to 2016 [L15]. Release notes carry some date inconsistencies [L15]. 1,940 commits [L1].
- OVMS: stable ("main") and nightly ("edge") firmware channels documented side by side [L14].
- opendbc: company-led final validation, strict CI (static analysis, MISRA C check, 100% line coverage on safety tests, mutation testing of the tests) [L16][L31].
- Formal governance text (maintainer roles, voting, succession) was absent from every page I read [L1][L2][L3][L6][L16]. Treat "how decisions get made" as unknown, except that opendbc says comma decides priorities [L16].

### 2.7 Sustainability

- RomRaider: 378 stars, 145 forks, 28 open issues, 6 PRs [L1]; the release list shows a steady if slow cadence (1.0.0 in December 2023, 1.1.0 in November 2025) [L15]. One-person or few-person maintenance is my inference, not stated.
- FreeSSM: describes itself as an independent reengineering project not supported by any company. Build instructions reference Qt4 (discontinued) as well as Qt5/Qt6, and the page did not show recent commit dates [L4]. Its issue list shows repeated J2534 adapter problems and many unsupported-vehicle reports [L27]. One issue is a contributor offering to port to macOS and 32-bit Windows [L27].
- rusEFI: hardware shop, paid support from $110, PayPal and Patreon, plus sponsor button [L2][L12]. About 1,300 open issues shows both heavy use and heavy triage load [L26].
- Speeduino: maintainer sponsor page, resellers who give back part of sales, over 1,000 installs reported, Discord/forum/Facebook [L3][L36].
- OVMS: non-profit funded by hardware sales and donations [L6]. Its issue list shows heavy vehicle-request volume (many Nissan Leaf issues) and one issue about a security flaw in a packet-capture parser [L28].
- TunerPro: one author, free tool with optional registration, an RT fee unchanged since 2009 until recently; seeking translators [L5]. Single-maintainer risk is visible but not stated.
- MegaSquirt: sold through distributors, history from 2001 to 2017 revisions [L9].

---

## 3. Evidence quality and disagreements

**Strong enough to rely on**
- RomRaider format growth and checksum-fix history: from the project's own release notes [L15]. Reliability high for "what shipped," though the notes have internal date conflicts that the summariser flagged [L15].
- rusEFI breaking-change practice: from the changelog [L13]. High, but the summary was produced by a fetch model, so counts like "about half" are approximate.
- opendbc and OBDb structure: from maintainer-written docs and schema [L16][L24][L30][L37]. High.
- OBDb validation rules: from the schema file [L30]. High, though I did not see the CI that enforces them [L29].

**Single-source claims**
- The RomRaider size-mismatch behaviour and the maintainer's "intentional for RAM offset" reply: one issue thread, issue still open at capture time [L23].
- OVMS boot failure: one issue title [L28].
- rusEFI tune-loss reports: titles only [L26].

**Disagreements and inconsistencies**
- Speeduino licence: GPL-2.0 in the sidebar versus a GPLv3 badge in the README [L3][L36]. Unresolved. Do not rely on either.
- RomRaider release notes: 0.8.x and 0.7.1 dates conflict inside the same file [L15].
- rusEFI licence: repo says GPL without a version; website names no licence [L2][L12].
- RomRaider's PR queue is small but old [L33], while releases continue [L15]. These are consistent with a slow, low-staff project but I cannot prove it.

**What I could not confirm**
- ECUFlash, EcuTek, Hondata, COBB, HP Tuners behaviour. Not researched (search budget). The HP Tuners and Hondata and EcuTek pages I tried either returned errors or gave only marketing navigation [L10].
- Speeduino's own docs wiki returned only navigation, so its INI/firmware pairing rules come from release notes only [L8][L19].
- Anything about forum culture, bricking war stories, or how many people lost ECUs. I read GitHub trackers, which are developer-facing, not user forums.
- Legal: the copyright.gov page I read describes the DMCA 1201 rulemaking process and says nothing about vehicle software [L21]. I do not have a source on whether vehicle repair or modification exemptions currently apply. Do not state a legal position from this note.
- The chip-tuning Wikipedia article is general and omits checksums, bricking and legal points [L20]. Low value.

---

## 4. Implications for OpenDiag

These are design suggestions drawn from the evidence above. Where evidence is thin I say so.

### 4.1 Build

1. **Separate three things and version each: the pack format, the pack content, and the app.** TunerPro's V6 definitions that old versions cannot open [L5], RomRaider's logger definition minimum versions [L15], and rusEFI/Speeduino INI mismatches [L19][L26] all show what happens otherwise. Every pack should declare a schema version, and the app should refuse a newer schema with a clear message rather than guessing.

2. **Match packs to the car by hard identifiers, and refuse on unknown.** Copy opendbc's rule: unknown firmware must not silently select an incompatible platform, and firmware queries must not trigger dashboard faults [L24]. For OpenDiag that means a pack lists the identifiers it is valid for (module type, software/calibration identifiers as read from the car), the app checks them before any write, and "no match" means read-only, not "closest match."

3. **Check size and layout before showing or writing anything.** RomRaider's two-byte slip silently corrupted every displayed value [L23]. Rule: a pack declares expected image size and anchor markers. The app verifies them and stops with an explanation, not a warning dialog.

4. **Treat checksum handling as code with tests, not data.** RomRaider's decade of checksum fixes and "custom checksum modules" [L15][L33] point the same way. Packs should name which verified checksum routine applies; the routine lives in reviewed code with fixtures. Note: for anything that touches OEM security, OpenDiag only works at the behavioural level, per the research rules.

5. **Read-only first, and write only after a verified backup.** No source I read shows a good recovery story. The app should refuse any write until a full stock read is stored, hash-verified, and re-read for consistency. Offer a "restore to stock" path as a first-class feature. This is a design choice, not something I saw working elsewhere.

6. **Pack structure to borrow from OBDb.** Default plus year-range overrides, a generations file, strict schema with no unknown fields, and mandatory units or value maps [L17][L30][L38]. Add a "reject" list for dangerous requests (OBDb bans a VIN query in command definitions [L30]; OpenDiag can ban write-class services in diagnostic-only packs).

7. **Support tiers for vehicles, publicly.** opendbc's Upstream / Custom / Dashcam / Community / Not compatible table [L37] is clear. OpenDiag could use read-only, coding-tested, flash-tested, and community-reported levels, each tied to evidence (who tested, on which car and software version).

8. **Release notes with a "Breaking changes" section from day one**, like rusEFI [L13], plus migration steps for saved user data.

9. **Strict contribution gate for packs.** Combine OBDb's schema validation [L30], opendbc's checklist idea [L24], and OVMS's "one vehicle per PR, state warnings up front" rule [L34]. Add a fixture rule: every pack needs a recorded real-car capture (or stated lack of one) so reviewers can replay it.

10. **Keep licence layers separate.** Code under Apache-2.0 as planned. Pack data: decide between a permissive data licence and CC BY-SA 4.0 (OBDb's choice [L17]). Important: our own rules say never copy GPL or non-commercial material into the pack repo, so contributor guidelines need an explicit "no derived content from proprietary or GPL sources" statement and a provenance field in each pack. Apache-2.0 code cannot take GPL code (general principle, not from my sources).

### 4.2 Avoid

- A single giant definitions repo with no per-pack ownership. RomRaider's PR list shows few definition contributions in review and some pull requests waiting years [L33].
- Letting format changes outrun tooling (TunerPro warning [L5]).
- Silent fallback to defaults.
- Relying on volunteer maintenance alone. Every project that looked healthy had a revenue or company backer [L2][L3][L6][L12][L16].
- Unlabelled AI-written packs. OVMS rejects unvalidated AI submissions [L34]; OpenDiag should require a human to say they replayed it on a car or a recorded capture.
- Licence ambiguity (Speeduino's GPL-2.0 versus GPLv3 mismatch [L3][L36]).

### 4.3 Measure

- Share of packs with at least one real-car capture attached.
- Number of "pack refused: no match" events versus "pack applied" events, to see whether matching is too strict or too loose.
- Time from a pack PR opening to merge (RomRaider's old open PRs [L33] are the negative example).
- Count of breaking-change notes per release (rusEFI's roughly half of sections [L13] is a baseline to beat).
- Backup verification rate: percentage of writes preceded by a verified stock read. Target 100%.
- Issue categories: share of tracker issues that are adapter problems (FreeSSM's J2534 issues [L27] suggest adapter support will dominate early support load).

### 4.4 Mapped to the owner's setup

The owner's adapters and tools (OBDLink CX BLE, WiFi ENET, BM3, BimmerCode) were not covered by anything I read here. The applicable lessons are indirect: adapter compatibility becomes the top support burden [L27], and a coding/flash tool needs backup and match rules before it needs features.

---

## 5. Open questions

1. How do ECUFlash, EcuTek, COBB and Hondata structure definitions, protect their definition data, and handle recovery? Not researched; needs search.
2. How many ECU definitions does RomRaider actually ship today, and who contributes them? The definitions folder listing was truncated [L32].
3. What does the Speeduino and rusEFI documentation say about recovery from a bad flash (bootloader, DFU)? I could not find it in the pages fetched [L18][L35].
4. What are the real bricking rates and causes in community forums? Only developer trackers were read.
5. Is the OBDb review process effective? The documentation I read does not describe review [L17]; its CI workflows were not visible [L29][L38].
6. Which of the gaps in section 3 matter legally (emissions tampering, DMCA 1201 for vehicle software)? [L21] gives the process only.
7. Is a data licence of CC BY-SA 4.0 compatible with the way OpenDiag wants vendors and tuners to use packs? Needs a licence decision.
8. Which governance model fits: company-led validation (opendbc) or volunteer maintainers (RomRaider)? The sources do not describe formal governance for any project.

---

## 6. Source ledger

All rows were fetched successfully. Content was returned through a summarising fetch tool, so details are secondhand from the page, and numbers (stars, counts) were as of 2026-11-20.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| L1 | https://github.com/RomRaider/RomRaider | Repo page | GPL-2.0, Subaru tuning suite, 1,940 commits, 28 issues, 6 PRs; no governance or contribution text visible | high (facts), low (depth) |
| L2 | https://github.com/rusefi/rusefi | Repo page | GPL, STM32 firmware, Java console, sponsor/Patreon links, 1.3k issues, process doc link | high |
| L3 | https://github.com/noisymime/speeduino | Repo page | GPL-2.0 in sidebar, resellers fund project, Discord for discussion, 1,000+ installs | high |
| L4 | https://github.com/Comer352L/FreeSSM | Repo page | GPL-3.0, Subaru diagnostic tool, J2534, use at own risk, Qt build notes | high |
| L5 | https://www.tunerpro.net/ | Vendor site | XDF/ADX definitions, V6 forward-incompatibility warning, backup advice, optional paid registration | high |
| L6 | https://github.com/openvehicles/Open-Vehicle-Monitoring-System-3 | Repo page | MIT, non-profit, native vs generic vehicle support, contribution rules | high |
| L7 | https://github.com/rusefi/rusefi/blob/master/misc/SoftwareDevelopmentProcess.md | Project doc | Stable master model, WIP rule, weak gate check, one HIL platform as of 2019 | high (dated) |
| L8 | https://wiki.speeduino.com/en/home | Wiki | Returned navigation only, no usable content | low |
| L9 | https://en.wikipedia.org/wiki/MegaSquirt | Encyclopedia | History 2001-2017, firmware variants, restrictive licence, clones | med |
| L10 | https://www.hptuners.com/ | Vendor site | Credits per vehicle, MPVI4 read/edit/write; nothing on backup or recovery | med |
| L11 | https://www.tunerstudio.com/ | Vendor site | Mostly a dash product page; nothing on INI or licensing terms | low |
| L12 | https://rusefi.com/ | Project site | Founded 2012, hardware shop, paid support from $110, competition-use disclaimer, no licence named | high |
| L13 | https://github.com/rusefi/rusefi/blob/master/firmware/CHANGELOG.md | Changelog | Frequent breaking tune changes, release cadence, backup advice | high |
| L14 | https://docs.openvehicles.com/en/latest/ | Docs | Vehicle guides list, stable vs edge channels, warnings page flagged | high |
| L15 | https://github.com/RomRaider/RomRaider/blob/master/release_notes.txt | Release notes | Definition format history, checksum fixes, protocol support, known issues, date conflicts | high (some date errors) |
| L16 | https://github.com/commaai/opendbc | Repo page | MIT, community ports, bounties, safety modes, CI rigour | high |
| L17 | https://github.com/OBDb | Org page | Per-vehicle repos, default plus year overrides, CC BY-SA 4.0, no review process described | high |
| L18 | https://wiki.rusefi.com/ | Wiki home | Own tuner promoted, TunerStudio optional; nothing on recovery | med |
| L19 | https://github.com/noisymime/speeduino/releases | Release list | YYYYMM versioning, LTS line, INI update notes, no breaking labels | med (dates lack years) |
| L20 | https://en.wikipedia.org/wiki/Chip_tuning | Encyclopedia | General remapping description; no checksums, bricking or legal content | low |
| L21 | https://www.copyright.gov/1201/ | Government | DMCA 1201 process only; no vehicle content | high (but not on topic) |
| L22 | https://github.com/RomRaider/RomRaider/issues | Issue list | Titles only: logger, editor, platform issues; one definition/ROM mismatch | med |
| L23 | https://github.com/RomRaider/RomRaider/issues/238 | Issue thread | 2-byte file size mismatch corrupts table display; maintainer says intentional; flag workaround | med (single thread) |
| L24 | https://github.com/commaai/opendbc/blob/master/docs/CAR_PORTING_CHECKLIST.md | Project doc | Identification, checksum, safety and regression checklist | high |
| L25 | https://github.com/noisymime/speeduino/issues | Issue list | Titles only: compatibility, validation tracking items | med |
| L26 | https://github.com/rusefi/rusefi/issues | Issue list | 1,302 open; INI and tune handling titles | med |
| L27 | https://github.com/Comer352L/FreeSSM/issues | Issue list | Unsupported vehicles, J2534 adapter issues, macOS port offer | med |
| L28 | https://github.com/openvehicles/Open-Vehicle-Monitoring-System-3/issues | Issue list | Vehicle requests dominate; one security issue; one boot failure | med |
| L29 | https://github.com/OBDb/.schemas | Repo page | Schema repo has CLI, tests and workflows; contents not shown | low |
| L30 | https://github.com/OBDb/.schemas/blob/main/signals.json | Schema file | Full field list, enums, path categories, validation rules | high |
| L31 | https://github.com/commaai/opendbc/blob/master/README.md | Repo doc | Safety firmware, bounties, contribution flow | high |
| L32 | https://github.com/RomRaider/RomRaider/tree/master/definitions | Repo folder | DTD plus XML pairing; listing truncated; no README seen | med |
| L33 | https://github.com/RomRaider/RomRaider/pulls | PR list | 6 open, 117 closed, slow open PRs, checksum module PR | med |
| L34 | https://github.com/openvehicles/Open-Vehicle-Monitoring-System-3/blob/master/README.md | Repo doc | Contribution rules, hobbyist warnings, MIT | high |
| L35 | https://github.com/rusefi/rusefi/blob/master/firmware/readme.md | Repo doc | Build info only; no recovery or INI generation text | med |
| L36 | https://github.com/noisymime/speeduino/blob/master/README.md | Repo doc | GPLv3 badge, resellers give back, no safety text | med |
| L37 | https://github.com/commaai/opendbc/blob/master/docs/CARS.md | Project doc | 405 cars, four columns, six support tiers, no roadmap | high |
| L38 | https://github.com/OBDb/Toyota-Prius | Repo page | Structure: signalsets/v3, generations.yaml, tests, CI, CC BY-SA 4.0, 7 stars | med |

**Fetches that failed (not in ledger, not counted):** romraider.com (403); en.wikipedia.org TunerStudio, HP Tuners, Hondata and Open Vehicle Monitoring System pages (404); ecutek.com (500); Speeduino and rusEFI CONTRIBUTING files (404); RomRaider Building_RomRaider.txt (404); FreeSSM README (404); rusEFI CONTRIBUTING.md (404); opendbc docs/CONTRIBUTING.md (404).
