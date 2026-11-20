# OpenDiag Data Strategy (12 weeks, clean-room)

Status: plan, not built. Not legal advice. Facts marked "(unverified)" were not confirmed from a primary source. Facts about OSS repos were fetched from the GitHub API on 2026-11-19. Grounded in `docs/design/data-schema.md`, `docs/design/roadmap.md`, `docs/research/*.md` and the code in `packages/core/src`.

## 1. Summary

- ISTA-class value is data (what an identifier means, which bit does what), not protocol code. We already have the protocol code (ISO-TP, UDS, HSFZ, DoIP, ELM327, simulator, `backup.ts`, `diff.ts`, `pack.ts`).
- We get data from five legitimate channels only: public standards and regulations, vendor public docs, open datasets under compatible licences, owner captures (diff the car's own menu, read-only), and reviewed community reports.
- 12-week target on two chassis families: **200 DTCs, 30 DIDs, 20 coding options**, plus module address maps for both families. Every entry has provenance, `tested_on` and a confidence level.
- Coding options come only from owner captures. The diff method needs reads only, no writes. The tool already has the pieces (`diffBackups`, `suggestField`); missing are a capture recorder, a field-suggester UI, a pack linter and a contribution intake.
- Manufacturer-specific DTC text cannot be captured from the bus (the car sends a number, not words). Our sources are: induced-fault testing on harmless circuits, public repair knowledge rewritten in our own words, and community reports. Expect these to be the slowest data type.
- Paid manufacturer portals may be used by a paying customer to understand, never to copy. A "tainted reader" rule (section 8) separates people who read OEM material from people who author entries.
- Biggest risk: no cars, no contributors. Week 1 decision needed: which two chassis families, and whose cars.

## 2. Decisions needed from the owner (week 1)

| # | Decision | Recommendation | Why |
|---|---|---|---|
| D1 | Two chassis families for the bootstrap | BMW F-series (F30/F10 era) plus BMW G-series (G20/G05 era), if owner or a friend has one of each. Fallback: one BMW plus one Toyota hybrid (Prius XW30/XW50 era) | BimmerCode-style catalogue is the proven demand (`bimmerlink-bimmercode-analysis.md`); Toyota hybrid data is better covered by public PID knowledge (`toyota-lexus-techstream.md`) |
| D2 | Language of data tooling | **TypeScript on Node 24**, same repo as core. Supersedes the Python `opendiag-pack` in `data-schema.md` section 6 | One runtime, no build step, reuses `pack.ts`, `diff.ts`, `backup.ts`. Rust is not installed; the Rust-core plan in `architecture.md` is deferred, and pack format is language-neutral JSON so a later Rust port reads the same files |
| D3 | Pack repo | Create `opendiag-packs` (CC-BY-4.0 data, CC0 for pure facts) now, separate from code (Apache-2.0) | Roadmap community plan; keeps data rules out of code |
| D4 | Budget for paid manufacturer info | Cap at about USD 150 total for 12 weeks (estimate, see section 4.7) | Short-term subscriptions only, used to understand and cross-check |
| D5 | Legal review before any public data release | Book a 1-hour counsel review in weeks 2-3 on: owner-capture bitmaps, paraphrased DTC text, tainted-reader rule | Open questions 1 and 2 in `data-schema.md` |

## 3. Data types: what we need and what is legitimate

Legend for status: **G** green (safe now), **A** amber (needs rules or counsel), **R** red (do not do).

| Data type | Why it matters | Legitimate sources | Licence / legal status | Status |
|---|---|---|---|---|
| Generic OBD-II PIDs (mode 01/09) | Live data on every car | SAE J1979 summaries, CARB regulation 13 CCR 1968.2 (public), our own `obd.ts`; cross-check only against Wikipedia page | Formulas are facts. Wikipedia text is CC BY-SA 4.0 (fetched): do not copy its text into a CC-BY pack; use as a cross-check | G |
| Generic DTC text (P0, P2, P3, B0, C0, U0, U3) | Fault explanation | OBDex (CC0 data, MIT code, rewritten from regulations and bulletins, 9,533 codes); our own rewrite; CARB regulation | SAE J2012 title wording is paid and copyrighted. OBDex states its text is independently written. Rewrite again in our own words anyway; keep OBDex as a cross-check, with attribution as a courtesy | G/A |
| Manufacturer DTC text (BMW 3-byte, Toyota P1xxx etc.) | The "ISTA value" for faults | Induced-fault tests, vendor public docs, owner experience, reviewed community reports | No clean open dataset found. A web search for open DTC data found only generic-code sets with permissive licences | A |
| UDS standard DIDs (F1xx identification) | Identify module, variant, software for applicability matching | ISO 14229-1 Annex C as summarised publicly; `udsoncan` docs (MIT); our captures | Identifiers and meanings are interoperability facts; do not copy paid standard text | G |
| Manufacturer DIDs (live data, status) | Live data panels | Owner captures with a known stimulus (open door, change gear), community traces | Owner capture is our data. Community trace needs attestation | A |
| Module address maps per chassis | Module scan, naming | Active scan of own car (probe address range, read F1xx DIDs), HSFZ/DoIP routing responses, public ISO 13400 facts | Observed on the owner's own car: green. Copying a forum table: treat as a hint to test, not a source | G/A |
| Coding option catalogue | The BimmerCode product | Owner capture: read coding block, change one setting in the car's own menu, read again, diff (`diffBackups` + `suggestField`) | Strongest clean-room story. Still open to counsel (open question 1 in `data-schema.md`) | A |
| Coding semantics (labels, warnings) | Usable catalogue | Written from our own observation of the menu text on the owner's car, in own words | Menu text is the car's UI; short factual labels are paraphrased | A |
| Service procedures (oil reset, battery registration) | Guided functions | UDS routine capture from owner doing the procedure through a legit path; owner manual text (read, rewrite); Toyota/BMW public owner docs | Owner manual: read and rewrite, never copy | A |
| Wiring diagrams, repair manuals, test plans | ISTA's real bulk | Not buildable in 12 weeks. Link out to OEM portals; offer "where to look" pointers | Copyrighted OEM content | R (out of scope) |
| SGBD/PRG, PSdZData, CAFD, CBF/SMR-D, Techstream tables, seed-key algorithms | Fast shortcut | None | Leaked or licensed-only OEM data. Banned by `data-schema.md` rule 3 and the roadmap refusal list | R |

## 4. Source-by-source detail

### 4.1 Public standards and regulations

- **ISO 14229 (UDS), 15765-2 (ISO-TP), 13400 (DoIP), SAE J1979/J2012**: paid documents. We implement from public summaries and open implementations, as the repo already does. We do not copy tables of text from the standards.
- **CARB 13 CCR 1968.2** (OBD II requirements): public regulation, cited in OBDex as a primary source. Use it to understand monitor logic and code purposes. Source: https://govt.westlaw.com/calregs (page not fetched, unverified URL form). Search for "13 CCR 1968.2" on the CARB site before citing.
- **EU 2018/858 Art 61**: manufacturers must give independent operators repair and maintenance information, for a reasonable fee. Source in `open-source-landscape-and-legal.md`.
- Output: pure-fact entries (PID formulas, standard DID names, DTC format) go in `generic/` under CC0-1.0.

### 4.2 Open datasets and repos (verified 2026-11-19 via api.github.com)

| Project | Licence | Last push | Use |
|---|---|---|---|
| foerbsnavi/OBDex | Data CC0-1.0 (LICENSE-DATA), code MIT (LICENSE-CODE); GitHub shows NOASSERTION because of the split | 2026-11-07, 308 commits, 18 stars | Cross-check list of 9,533 generic DTCs and 132 PIDs. We rewrite text ourselves; keep as the baseline for "does this code exist". Small project, one maintainer (unverified), so do not depend on it |
| todrobbins/dtcdb | MIT | 2013-07-30 (stale) | Reference only; text quality and provenance unknown |
| commaai/opendbc | MIT | 2026-11-19 | Signal-level CAN DBC files, not diagnostics. Useful for live-data cross-checks on Toyota/Lexus. Per-file provenance must be checked before bundling (`open-source-landscape-and-legal.md`) |
| mercedes-benz/odxtools | MIT | 2026-11-17 | Reader for ODX/PDX the user legally holds; local overlay only, never uploaded. OEM ODX is usually under a licence or EULA that may bar this use, so counsel checks it (D5) and the user who loads it becomes a tainted reader for that family |
| pylessard/python-udsoncan | MIT | 2026-10-26 | Reference for UDS service semantics and DID codecs; read for behaviour |
| collin80/SavvyCAN | MIT | 2026-11-17 | Companion for sniffing; we read its log formats |
| uholeschak/ediabaslib | GPL-3.0 | 2026-11-19 | Study public docs for behaviour only. Do not copy code or its data tables into core or packs |
| OpenVehicles/Open-Vehicle-Monitoring-System-3 | NOASSERTION on GitHub (mixed) | 2026-11-15 | Vehicle-specific PIDs for EVs; licence unclear. Hints only, never copy |
| fenugrec/freediag | GPL-3.0 | 2024-09-09 | Older diagnostics knowledge; reference only |
| iDoka/awesome-canbus | CC0-1.0 | 2026-11-16 | Link list to find more sources; each linked project needs its own licence check |

Rule: no dataset enters a pack until a `SOURCES.md` row records URL, licence, date checked, and what was taken (nothing / fact only / text). GitHub's licence field is not enough; read the LICENSE files (the OBDex case shows why).

### 4.3 Vendor public documentation

- Public owner manuals, press-kit technical sheets, and vendor web pages (for example BimmerCode's public per-model page lists categories, values, and the required control unit). We may read these to learn what kinds of options exist and which modules hold them. We write our own labels and never copy their option lists or order. The list itself is the competitor's compiled catalogue. Treat "what exists" as inspiration and require our own capture to prove each entry.
- Output: leads for the capture backlog, not data.

### 4.4 Owner captures (the main engine)

**Diff-the-car-menu method (read-only, no writes):**

1. Owner connects with a qualified adapter. Tool records identity: part number, software, hardware, VIN (hashed in public output), I-level if readable.
2. `backup` reads the module's coding block(s) and hashes them (`createBackup`, `verifyBackupHash`).
3. Owner changes exactly one setting in the car's own menu (iDrive vehicle settings, cluster settings, key settings), ignition cycle if the menu says so.
4. `backup` again. `diffBackups` lists changed bytes and bits. `suggestField` proposes `byte_offset`, `bit_offset`, `bit_length`.
5. Owner toggles back and takes a third read to confirm the same bits flip back (round trip).
6. Tool emits a draft pack entry with provenance `owner_capture`, the method text, `tested_on`, and the raw three blocks as an attachment (5 MB cap).

Limits: works only where the coding block is readable without security access and where the car's menu exposes the setting. If the module answers NRC 0x33 (security access denied), the tool records "not capturable" and moves on. Checksum bytes will also change; the field-suggester must exclude them (`ignoreOffsets` exists) and the checksum rule must be separately proved (`crc16_ccitt_false` and `sum8` are implemented in `pack.ts`).

**Other capture types:**

| Capture | Method | Yields |
|---|---|---|
| Module scan | Probe addresses with a safe read (`22 F1 90`, `22 F1 87`); record who answers | Address map per chassis, module names from DID F197 where present |
| Stimulus-response live data | Record DID values while owner does one thing (door open, gear, light on) | Candidate live DIDs with scaling hypothesis |
| Fault-induced DTC | Owner disconnects a harmless, non-safety connector with ignition off (see 4.4a), reads DTC, reconnects, clears | Manufacturer DTC code plus a verified meaning |
| Service procedure | Owner runs the procedure with the car's own menu or a legit path while the tool listens passively | Routine IDs and sequence (read-only sniff on the diagnostic link) |
| Adapter-independent trace | HSFZ/DoIP/CAN recording to JSON lines | Test vectors for the simulator and pack tests |

**4.4a Induced-fault whitelist** (lower risk, still owner decision): rear washer pump connector, interior lamp, number-plate lamp, door contact switch on a closed door. Never: airbag/SRS, brakes, steering, immobilizer, fuel, high-voltage battery, anything with ignition on and the connector energised that could short. Ignition off during disconnect and reconnect.

### 4.5 Community reports

- Accepted: a pull request or in-app submission with a capture file, `tested_on`, own-words text, attestation.
- Weight: a report without a capture is `low` confidence and cannot reach `verified`. A forum post is a lead, not a source. Reviewers must retest or find a second capture.
- Forum material (bimmerpost, priuschat, bmw-syndikat) is secondhand (`docs/README.md` known gaps). Do not paste forum text or tables.

### 4.6 EU right-to-repair information (RMI) and SERMI

- **Right**: Reg (EU) 2018/858 Art 61 gives independent operators access to OBD and repair information at a reasonable fee (`open-source-landscape-and-legal.md`). It is a right to the information, not a licence to republish it. Terms of each portal apply (unverified for each OEM; read them before subscribing).
- **SERMI**: scheme for access to security-related information (keys, immobiliser). Requires company and each technician to be certified through an accredited body (DEKRA, Kiwa, Digidentity, Applus+ named in search results). UK launch 1 April 2026 (Digidentity announcement). Sources: https://www.dekra.com/en/security-related-vehicle-repair-maintenance-information , https://www.digidentity.eu/sermi-cab . **We do not pursue SERMI**: security data is on our refusal list, and the scheme is aimed at businesses.
- **Our use**: only as a paying customer to understand a procedure or confirm a fact we captured ourselves. Notes taken are facts and questions, never copied text or screenshots. See tainted-reader rule (section 8).

### 4.7 Manufacturer technical-information portals (paid customer, understand not copy)

| OEM | Portal | Price | Notes |
|---|---|---|---|
| Toyota/Lexus | TIS, https://techinfo.toyota.com | Not shown on the public page (fetched). Tiers: Standard, Professional Diagnostic, Security Professional, Keycode (page is inconsistent about tier count). Subscribe goes to a third-party payment site | Terms of Use not read; assume no redistribution (unverified). Plan: one short-term subscription for a week only if needed to settle a hybrid PID or procedure question |
| BMW | BMW Aftersales Online / ISTA data access for independent workshops | Search found nothing usable. Price unknown | Do not budget until a primary page is read. (unverified) |
| Mercedes-Benz | B2B Connect / XENTRY access | Price unknown | Authorization model blocks writes for non-partners (`mercedes-xentry-das.md`). Out of 12-week scope |

Budget line: USD 0 until a task blocked on one fact exists. Owner approves each purchase.

## 5. Extraction tooling to build (maps to existing code)

| Tool | Purpose | Exists today | Gap | Effort (est) |
|---|---|---|---|---|
| **Capture recorder** (`opendiag capture`) | Log every frame and request/response to JSONL with identity, adapter, voltage, timestamps; passive mode and guided mode | `client.ts`, `transport.ts`, `sim.ts`, CLI | Recording layer, session metadata, redaction of VIN to hash, upload bundle | 3-4 days |
| **Block backup** | Read and hash coding blocks | `backup.ts`: `createBackup`, `verifyBackupHash` | Block spec list per module (which DIDs hold coding) comes from captures | done, extend 1 day |
| **Diff tool** | Show byte and bit changes between two backups | `diff.ts`: `diffBytes`, `diffBackups` | Round-trip check (A to B to A), noise filter for counters and checksum bytes, multi-DID report | 2 days |
| **Field suggester** | Turn diff into a draft coding entry | `diff.ts`: `suggestField` | Handle multi-byte fields, enum value discovery across several states, ask the user for labels | 3 days |
| **Checksum prover** | Find which checksum rule validates a block (CRC16, sum8, others) | `pack.ts` has `crc16CcittFalse`, `sum8`, `verifyIntegrity` | Brute-force search over covers/store position on a captured block; report "unknown" and block writes | 2-3 days |
| **Pack linter** (`opendiag pack lint`) | Enforce schema and rules | `parsePack` | Full rules from `data-schema.md` section 6 (overlap, fit, provenance, deny classes, banned strings, tested_on), in TypeScript | 4-5 days |
| **Pack test** | Replay golden vectors on simulator | `sim.ts`, tests | Pack-driven fake ECU from captures | 3 days |
| **Intake** | Submissions to review | none | Phase A: GitHub PR templates and issue forms (free). Phase B: Supabase table from `data-schema.md` section 7, only after 50 contributors (`roadmap.md` guess) | PR templates 1 day; Supabase later |
| **DTC rewrite helper** | Show our draft next to the OBDex cross-check; flag text similarity | none | Similarity check (n-gram overlap) against OBDex and a local-only denylist; blocks near-copies | 2 days |
| **Source ledger** | `SOURCES.md` per pack | none | Template and CI check that each entry's `ref` is in the ledger | 1 day |

Total about 22-26 engineering days (estimate), fitted into weeks 1-8 alongside capture work. Two-person split is not assumed; the owner is solo with Claude.

## 6. Quality control

### 6.1 Rules

1. **Two reviewers** for every merged entry. The author cannot review their own. Reviewer 1 checks provenance and wording; reviewer 2 checks safety class and tests. While there are fewer than three people, maintainers count and Claude's pre-review does not count as a reviewer.
2. `tested_on` required for any entry with `risk_tier` T1 or above (matches `data-schema.md` section 5 and rule 5).
3. **Confidence**: `low` = single capture or report; `medium` = one full round-trip capture on one car by the author plus reviewer inspection; `high` = two independent testers on two different cars with matching software ranges (`data-schema.md` section 5).
4. **Trust level in app** (from `roadmap.md`): verified (=high), community-reported (=medium), experimental (=low, hidden behind an expert switch).
5. **Identity gate**: an option applies only if module identity (hardware, software, I-level range) matches. A chassis label never enables a write.
6. **Unknown means read-only.**
7. **Provenance ledger**: every `ref` resolves to a row in `SOURCES.md`.
8. **Regression**: `pack test` replays the author's capture and must decode the same values.
9. **Quarterly audit**: random 10% of entries re-tested by a reviewer or dropped to `low`.

### 6.2 Review checklist (one box per line, stored with the review)

- [ ] Provenance source type is allowed and a capture or ref is attached
- [ ] Text is in contributor's own words; similarity check passed
- [ ] No deny-class content (airbag/SRS, immobilizer, key learn, odometer, speed limiter, emissions defeat, ADAS bypass)
- [ ] Applicability matches capture (hw/sw/I-level)
- [ ] Fields do not overlap; values fit bit length; checksum rule proved or entry is read-only
- [ ] Round trip A-B-A confirmed
- [ ] `tested_on` plausible; contributor attestation true
- [ ] Licence is CC0-1.0 or CC-BY-4.0

## 7. Bootstrap plan: 200 DTCs, 30 DIDs, 20 coding options on 2 chassis families

Assumes D1 resolves to two BMW families (F-series and G-series). If it resolves to BMW plus Toyota, swap per-chassis counts as noted.

### 7.1 Targets

| Item | Target | Split | Source mix |
|---|---|---|---|
| DTCs | 200 | 120 generic powertrain/network codes common to both families (P0xxx, U0xxx) rewritten from regulation and OBDex cross-check; 30 U-code "lost communication" entries tied to modules found in the address map; 50 manufacturer-specific from induced faults and owner experience (25 per family) | public_standard 150, owner_capture 30, community_report 20 |
| DIDs | 30 | 22 ISO 14229 F1xx identification DIDs verified per module type on each family; 8 manufacturer live-data DIDs (battery voltage, odometer read only, temperatures) from stimulus captures | public_standard 22, owner_capture 8 |
| Coding options | 20 | 10 per family. All comfort class (T1): lighting, warning chimes, display units, door/lock behaviour, mirror folding | owner_capture only |
| Module address maps | 2 | One per family, from active scan, with module names and addresses | owner_capture |

Note on "odometer": reading is allowed; no write or edit entries exist (deny class).

### 7.2 Candidate coding-option categories (not offsets; offsets only from captures)

Comfort and display options visible in the car's own settings menu: ambient light mode, daytime running light behaviour, welcome light duration, seatbelt chime, door-lock on drive-away, mirror fold on lock, units of measure, language/date format, key-fob lock confirmation, rain-closing windows. Each becomes one capture session. Not all will be capturable (module may refuse reads). Plan 30 attempts for 20 successes (66% yield is an estimate).

### 7.3 12-week schedule

| Week | Data work | Tooling | Exit check |
|---|---|---|---|
| 1 | Decisions D1-D5; SOURCES.md; create `opendiag-packs`; list cars and adapters; legal booking | Pack linter skeleton; PR templates; contribution guide update | Cars and adapter named; repo exists |
| 2 | Module scan on both families; address map v0; 22 F1xx DIDs read per module type | Capture recorder v1 | Two address maps with at least 8 modules each (estimate) |
| 3 | 60 generic DTCs rewritten and reviewed; first live-data stimulus captures | Linter rules 1-6; DTC similarity helper | 60 DTCs merged, two reviews each |
| 4 | First 5 coding captures (family A) | Diff round-trip check; field suggester v2; checksum prover | 5 draft entries with round trip |
| 5 | 5 more coding (family A); 60 more DTCs | Pack test with capture replay | 10 coding drafts; 120 DTCs total |
| 6 | Family B coding 5; induced-fault DTCs (family A, 12); counsel review feedback | Linter rules 7-9; banned-content scan | Review feedback applied |
| 7 | Family B coding 5 more; induced-fault DTCs family B (13) | Intake via GitHub forms | 20 coding drafts total |
| 8 | 8 live-data DIDs; 30 U-code entries; community DTC reports opened | Signed pack build (Ed25519, owner decision on key per DEVBOX rules) | Pack v0.1 builds in CI |
| 9 | Second-tester retests (friend or forum volunteer) on 10 entries to reach `high` | Reviewer dashboard (simple list view) | At least 10 entries at `high` or reasoned gap |
| 10 | Fix failures, drop unprovable entries, finish DTC counts | Adapter-qualification notes feed data | 200 / 30 / 20 counts hit or gap logged |
| 11 | Public beta of data pack, read-only use; announce contribution call | Release process rehearsal | Pack v0.1 downloadable, signed |
| 12 | Retrospective; plan next 3 months of data growth; audit 10% | Backlog automation | Retro doc, next-quarter targets |

If cars arrive late, weeks 2-10 slip day for day. DTC rewriting (non-car work) fills slack.

### 7.4 Capacity math (estimates)

- DTC rewrite: 6 minutes each for the generic set plus review 2 minutes = 8 minutes. 150 codes = 20 hours.
- Coding capture: about 45 minutes per option including round trip. 30 attempts = 22 hours car time.
- Induced-fault DTCs: about 30 minutes each, 50 entries = 25 hours car time.
- Total about 90 hours of owner time plus tooling days in section 5. Over 12 weeks that is about 8 hours per week.

## 8. Rule set: what contributions are rejected

Each rule has an ID so reviews cite it. Automated where possible (linter, scan); the rest reviewer-enforced.

### 8.1 Rejected: source and provenance

| ID | Rejected if |
|---|---|
| R1 | Any entry whose evidence is a file or table from OEM software: SGBD/PRG, PSdZData, CAFD/FA/FSW, Mercedes CBF/SMR-D/ODX, Techstream or TIS data files, ISTA/E-Sys/XENTRY exports, DTC lists exported from them |
| R2 | Any content from a leaked, cracked or unlicensed copy of OEM software or documentation, or from a link to one |
| R3 | Text copied or closely paraphrased from a copyrighted manual, paid standard, competitor catalogue, or forum post. Similarity above the linter threshold fails |
| R4 | Entry with `source_type` missing or `user_supplied_odx` (never allowed in shared packs) |
| R5 | No attachment or capture for coding, DID or routine entries |
| R6 | Contributor attestation false or missing |
| R7 | Licence other than CC0-1.0 or CC-BY-4.0, or a source with a licence we have not checked (ShareAlike content such as Wikipedia text included). Applies to `opendiag-packs`. Single exception: converted OBDb data (CC-BY-SA-4.0) may live only in a separate `opendiag-packs-obdb` repo and `.odpack`, licensed CC-BY-SA-4.0, off by default, never merged into or copied from the CC-BY packs, and not shipped before counsel review (D5) |
| R8 | Evidence taken by someone who read OEM portal content in the same area, unless the "tainted reader" declaration is on file and they act only as reviewer, not author |

**Tainted-reader rule (for 4.6 and 4.7):** anyone who accessed a paid OEM portal, ISTA/E-Sys/XENTRY/Techstream software, or ODX data for a given module family declares it in `READERS.md`. For that family they may review for safety but may not author data entries. Facts are only entered from our own captures. This keeps the "understand, not copy" line auditable. Whether it is legally sufficient is a question for counsel (D5).

### 8.2 Rejected: content (deny classes, matches `data-schema.md` rule 7 and the roadmap refusal list)

| ID | Rejected if it touches |
|---|---|
| R9 | Airbag/SRS, seat-belt pretensioners, crash modules: disabling, deletion, fault masking |
| R10 | Immobilizer, key learning without proof of ownership, anti-theft defeat, EWS/CAS/FEM key data |
| R11 | Emissions systems: DPF, EGR, SCR/AdBlue, catalyst, O2 monitors, readiness editing, clearing codes to hide a fault |
| R12 | Odometer, mileage, service-history rewriting |
| R13 | Speed limiter removal, speed unlock, ADAS calibration bypass |
| R14 | Seed-key algorithms, SecOC keys, authentication bypass, any secret value or byte string that looks like one |
| R15 | Flash or firmware modification, tuning maps, power or torque changes |
| R16 | Brake, steering, or other safety-system coding beyond read-only |

### 8.3 Rejected: quality

| ID | Rejected if |
|---|---|
| R17 | Applicability missing or too broad (a chassis label with no hardware/software match) |
| R18 | Coding field overlaps another field without `shared: true`, or lacks a known checksum rule and is not marked read-only |
| R19 | No round trip (A to B to A) on a coding entry |
| R20 | `tested_on` absent for T1+ entries, or testers include the author twice |
| R21 | Text claims results ("fixes check engine light", "removes limit") instead of describing the setting |
| R22 | Brand names, logos or lookalike wording used beyond stating compatibility |
| R23 | Personal data: VIN in clear text, owner names, location, plate; contributor is asked to strip it and the linter scans for 17-char VIN patterns |

Enforcement: linter blocks R4-R7, R14, R17-R19, R23 mechanically; banned-content scan blocks R1, R2, R9-R16 by names and fields; reviewers enforce R3, R8, R20-R22. Every rejection is logged with the rule ID so the public "what we refuse" page can be generated from the log.

## 9. Community growth and incentives

Reality check: the roadmap names "not enough contributors with cars" as a High likelihood, High impact risk. A solo developer cannot own a car park.

### 9.1 Funnel

| Stage | Target by week 12 | Tactic |
|---|---|---|
| Aware | 2,000 site visits (estimate) | Launch post with the "what we refuse" page and one worked example (diff-the-menu demo on the simulator); share on Reddit r/BimmerCode and r/CarHacking, bimmerpost, priuschat (check each forum's self-promotion rules first) |
| Try | 100 people run read-only scan | Free tool, no account, works with a $20 adapter class that is qualified (`hardware-adapters.md`) |
| Contribute | 15 people submit a capture or DTC | "Good first issue" labels: DTC rewrites (no car needed), DID verification with trace |
| Review | 3 reviewers | Promote active contributors; two-reviewer rule needs them |

Numbers are targets set by guess, not benchmarks.

### 9.2 Incentives (all free or cheap)

- Public credit: contributor name on each entry (CC-BY gives attribution), a contributors page, and a per-chassis "verified by" list. Handle only, no personal data.
- Level system: Contributor (1 merged entry), Verified tester (3 round trips), Reviewer (10 merged plus invited). Reviewers choose what to work on.
- Early access: contributors get pack updates and beta builds first.
- Scarcity-driven requests: a public board "we need a G20 coding capture" shows exactly what is missing. People with the exact car feel useful.
- Recognition in release notes.
- Optional (when money exists): lend-a-cable fund, or contribute-and-get-a-qualified-adapter. Not budgeted in 12 weeks.
- No payments for entries: payment attracts copying from paid tools.

### 9.3 Making contribution easy

- One command: `opendiag capture --menu-diff` walks the user through steps 1-6 of 4.4 and emits the entry.
- Pre-flight reuses the safety rules: read-only, no writes during capture.
- A contribution PR template with the attestation line, checklist and attachment hints.
- A weekly 30-minute "review hour" published in advance, so contributors see progress.
- Respond to every submission within 7 days (target). Burnout is a named risk; cap the maintainer's review load at 5 entries per week until a second maintainer exists (roadmap: second maintainer by Phase 2).

### 9.4 Metrics (track in a simple CSV in the packs repo)

Entries by type and confidence; merged per week; median review time; rejection reasons by rule ID; contributors active in last 30 days; cars covered (chassis x year x module); percentage of coding entries with round trip.

## 10. How incumbents are believed to have built catalogues

Only what public sources support. Everything else is labelled hypothesis. We are not accusing anyone; we draw lessons that stay clean-room.

| Observation (public) | Source | Lesson for us |
|---|---|---|
| BimmerCode publishes per-model pages listing categories, allowed values, required control unit, equipment and I-level notes | https://bimmercode.app/cars/g05 | Their catalogue is organised per model and per unit; software level matters. The same keys appear in our schema (`applicability`, `i_level`) |
| BimmerCode's FAQ says availability depends on vehicle, software and configuration; it blocks coding for modified or unhealthy head units (BCE-006 to 012) | https://bimmercode.app/faq/ | Field experience produces guard rules; our identity gate and state checks do the same |
| Deep OBD docs describe a server-side flow that builds a work list for BMW coding using the open ediabaslib library, which interprets BMW's own description files that the user or the project supplies | https://uholeschak.github.io/ediabaslib/docs/BMW_Coding.html | Open tools interpret vendor description files; those files are the legally sensitive part. We never ship them |
| ediabaslib is GPL-3.0 and actively maintained (pushed 2026-11-19) | GitHub API | Study docs only; do not mix code or data into an Apache core |
| OBDeleven and Carista sell one-click presets and credits; OBDeleven publishes plan prices | `bimmerlink-bimmercode-analysis.md` (price pages partly blocked, unverified) | Presets are a product layer over the same catalogue idea |
| Community guides say newer BMW coding data lost descriptive text, making manual research harder | `bimmerlink-bimmercode-analysis.md` (secondhand, unverified) | Capture and diff remains the clean path; labels come from the car's own menu |

**Hypotheses about how catalogues get built (none confirmed from a primary source):**

- H1: Paid-for or licensed workshop data, translated into their own format. Plausible for any vendor but no public proof for any named vendor.
- H2: Diffing coding data before and after changing a setting in the car's menu, which is exactly our method. Plausible; no vendor has said so in the sources we read.
- H3: Community crowd-sourcing from forums and user reports, then curation and testing. Plausible; BimmerCode public pages mention I-level notes consistent with field reports.
- H4: Interpreting vendor description files with open readers like ediabaslib. Documented for Deep OBD; not shown for others.
- H5: Reverse engineering of each module's coding and testing on bench ECUs and owned cars.

What we copy: structure (category, values, module, equipment and software notes, warnings), safety design (back up first, block unknown states), and update flow (version-keyed rules). What we do not copy: any option list, wording, or order from a vendor page, and any data derived from OEM description files.

## 11. Risks specific to the data plan

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| No second car family available in week 2 | Medium | High | Fall back to one BMW + one Toyota; or run 200 DTC / 30 DID targets on one family and keep coding at 20 on that one |
| Coding blocks need security access to read | Medium | High | Detect NRC 0x33 early (week 2), pick modules that allow reads, document "not capturable" modules honestly |
| Checksum rule unknown | Medium | Medium | Checksum prover; entry stays read-only until proved |
| Contamination (a contributor pastes OEM data) | Medium | Very high | Rules R1-R8, linter, two reviewers, public attestation, quick removal and history rewrite policy |
| Copyright claim on bit maps | Low-Medium | High | Counsel review (D5); entries are facts from the owner's own car; keep raw captures attached for provenance; be ready to take down |
| Wrong data causes a bad write later | Low in this plan (read-only) | Very high later | No writes in 12 weeks; entries default to read-only display; writes only after Phase 4 safety proof |
| Reviewer bottleneck | High | Medium | Cap throughput; automate lint; recruit reviewers from week 8 |
| Free-tier limits change | Medium | Low | Start with GitHub-only intake; Supabase deferred |

## 12. What this plan does not do

- No ISTA-class repair manuals, wiring diagrams or guided test trees. We link out.
- No flash, no security-access, no key programming, no Mercedes or Toyota coding in 12 weeks.
- No bulk import from any third party dataset without a licence ledger row.
- No claim that any entry is safe to write until the Phase 4 write pipeline passes its tests.

## 13. Sources

Fetched or checked in this pass (2026-11-19):
- OBDex repo page (licences, counts, sourcing statement): https://github.com/foerbsnavi/OBDex
- GitHub repo metadata for opendbc, odxtools, python-udsoncan, OBDex, dtcdb, ediabaslib, SavvyCAN, OVMS3, awesome-canbus, freediag: https://api.github.com/repos/{owner}/{repo}
- Wikipedia OBD-II PIDs (CC BY-SA 4.0 text licence, formula tables): https://en.wikipedia.org/wiki/OBD-II_PIDs
- Toyota TIS tiers, no public price: https://techinfo.toyota.com
- SERMI overview (certification bodies, UK launch): https://www.dekra.com/en/security-related-vehicle-repair-maintenance-information , https://www.digidentity.eu/sermi-cab , https://catmag.co.uk/article/sermi-goes-live-in-uk-with-backing-of-22-manufacturers
- Open DTC dataset search result (generic codes only, manufacturer codes gated): web search 2026-11-19, including https://github.com/todrobbins/dtcdb and https://datahub.io/obd2hq-open-automotive-diagnostic-resources/obd2hq-diagnostic-resources (OBD2HQ licence not checked, unverified)

From earlier OpenDiag research (not re-fetched): `docs/research/open-source-landscape-and-legal.md` (DMCA 1201, EPA, EU 2018/858, UN R155/R156), `docs/research/bimmerlink-bimmercode-analysis.md` (BimmerCode FAQ, per-model page, Deep OBD docs), `docs/design/data-schema.md`, `docs/design/roadmap.md`.

Unverified or not found: BMW aftersales/ISTA access price and terms for independent operators; Mercedes B2B Connect price; per-portal redistribution terms; CARB 13 CCR 1968.2 canonical URL; ISO 14229 Annex C DID list (use udsoncan docs and captures to confirm each DID).
