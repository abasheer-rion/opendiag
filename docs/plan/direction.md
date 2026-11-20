# OpenDiag product direction

Written 2026-11-20 for the 12-week window (Mon 2026-11-23 to Fri 2027-02-12). Not legal advice.

**How this was built.** It draws on the 24 deep research docs in `docs/research/deep/`, the 8 plan docs, and the 8 older notes in `docs/research/`. I read the Summary and Implications sections of every deep doc, and the plan docs in full where they set scope, KPIs, decisions and risks. I did not re-read every body paragraph and did not re-check any source ledger. Where I say "evidence", I mean what those docs say, with their own reliability caveats. Deep-doc names are cited in square brackets, for example [user-demand-and-pain-points].

**The main caveat, up front.** Most deep docs report that web search was blocked during their runs. They read between 11 and 47 pages, mostly vendor pages, Wikipedia and GitHub READMEs, and almost no forum threads or reviews [user-demand-and-pain-points, bmw-newer-cars-gateway-and-secure-diag, mercedes-forums-and-practice, bmw-coding-demand-and-practice]. So nothing here rests on measured demand counts. Every ranking below is reasoned from indirect signals and is labelled with an evidence grade: **A** = several independent sources, **B** = vendor or single-source, **C** = inference. Where the owner's own habits are the only signal, I say so.

---

## 1. Who the users are

| # | Segment | What they do today | Evidence | Grade |
|---|---|---|---|---|
| S1 | **BMW enthusiast who codes and tunes** (the owner) | Flashes with bootmod3, codes with BimmerCode, shares one adapter family across both | BM3 users also run BimmerCode through the same adapters; vendor lists tested third-party apps [bootmod3-platform, bm3-adapters-and-flashing-transport]. BimmerCode shows 4.7 on iOS from about 22K ratings (vendor-quoted) [bmw-coding-demand-and-practice, obd-app-market-and-reviews] | B (market), A (the owner exists) |
| S2 | **BMW DIY owner, light jobs** | Fault codes, service reset, battery registration, simple coding, from a phone with a cheap adapter | Apps "have taken over the simple jobs" from ISTA [bmw-ista-real-world-usage]. Battery registration is called the most common DIY service job (forum-sourced, disputed on necessity) | B |
| S3 | **Cost-resentful scanner user** (any brand) | Uses free generic apps, burned by subscriptions or credits | Carista 1.7/5 (n=46), Carly 2.6/5 (n=17,650) on Trustpilot; both cite recurring fees [obd-app-market-and-reviews] | A for the complaint, C for how many are BMW owners |
| S4 | **Tinkerer / contributor** | Builds open tools, maintains vehicle data for the car they own | OBDb has about 897 vehicle repos; maintainers support "the car they own"; opendbc pays bounties of $2,000 per brand and $250 per model [user-demand-and-pain-points, open-source-ecu-tools-lessons, open-source-automotive-code-survey] | A |
| S5 | **Independent shop / technician** | Rents ISTA by the hour to year, or uses unofficial copies; owns ICOM or J2534 | Rental prices from one undated source [bmw-ista-real-world-usage]. Needs flashing and programming, which is out of our scope | B. **Not a target.** |
| S6 | **Toyota/Lexus and Mercedes owners** | Techstream Lite Kit (Toyota), XENTRY or DAS (Mercedes) | Both research docs say they are thin and mostly hypotheses [toyota-lexus-forums-and-practice, mercedes-forums-and-practice] | C. **Not a 12-week target**, except the A90 Supra, which sits on BMW's platform [toyota-lexus-protocols-and-open-data] |

**What this means.** The only segment with real evidence of both need and fit is S1, plus the S2 light-job crowd that overlaps it. Everything else is either inferred or out of scope. The owner is user number one, which is a strength for testing and a weakness for evidence. One person's habits are not a market.

---

## 2. Top 10 jobs to be done, ranked by evidence

"Can we serve it in 12 weeks" respects owner decision 2: no real-car writes in the window, bench modules only.

| Rank | Job | Evidence | Grade | Serve in 12 wk? |
|---|---|---|---|---|
| 1 | **See every fault on the whole car, in plain words, fast, without a Windows VM.** | ISTA's guided flow starts here; the VM, 250 GB disk and cable pain is the loudest ISTA complaint [bmw-ista-real-world-usage]. Free readers read codes but tell users to see a shop [user-demand-and-pain-points]. | A | **Yes. Core.** |
| 2 | **Customise comfort, lights and display options (coding).** | BimmerCode catalogs run about 25 to 60 option groups per chassis; lights, displays and comfort are the bulk [bmw-coding-demand-and-practice]. | A | **No writes. Read, inspect, diff only.** |
| 3 | **Turn off start-stop.** | Strongest single-goal signal: first thing users mention, has its own how-to, and BMW broke it on petrol cars from i-level 23-3, with a minority of owners disputing this [bmw-coding-demand-and-practice]. | A (demand), B (the i-level fact) | **Show the setting; cannot change it.** |
| 4 | **Unlock features such as video in motion.** | Three independent sellers charge for it: $25 shop, about 188 euro dongle, an app tool [bmw-coding-demand-and-practice]. Legal disclaimers on all. | A | **No.** Legal edge too. |
| 5 | **Back up my coding and be able to undo a change; know what an update changed.** | Restore failing ("coding data invalid") needing a remote developer session [bmw-coding-failures-and-recovery]; a new i-level can silently undo a coding [bmw-coding-demand-and-practice]. | B | **Partly.** Verified read-only snapshots and diffs on real cars. Restore proven on simulator and bench only. |
| 6 | **Do DIY service jobs: battery registration, service reset.** | Named as the most common DIY service job; one complaint is a lapsed subscription blocking a battery registration [bmw-ista-real-world-usage]. | B | **No.** These are writes. Say so plainly. |
| 7 | **Log live engine data while driving (tuners).** | BM3 and MHD advertise 40 to 80+ channels, logs stay in their own stores [bootmod3-platform, other-bmw-tuners-mhd-jb4-xhp]. Demand beyond the vendors' own feature lists is inferred. | B/C | **Yes, read-only.** Plan has it in week 9. |
| 8 | **Make my adapter work without guessing.** | Connection and adapter trouble is the biggest cluster in a popular OBD library's open issues (about 7 of 25) [user-demand-and-pain-points]. Cable confusion, CarPlay hijacking WiFi, non-MFi Ethernet drops [bmw-ista-real-world-usage, bm3-adapters-and-flashing-transport]. Clone ELM327 failures [adapter-hardware-and-protocol-teardown]. | A | **Yes.** |
| 9 | **Know whether it is safe to proceed (voltage, link, interference).** | Every vendor names low battery voltage; BMW's own bulletins say so; no failure rates published anywhere [bmw-coding-failures-and-recovery, bm3-adapters-and-flashing-transport]. | A (cause), none (rates) | **Yes**, as read-time health display. |
| 10 | **Own the tool: no subscription, no credits, no silent feature removal.** | Subscription pushback is the loudest review complaint; updates removing features also reported [obd-app-market-and-reviews]. | A | **Yes, by licence.** |

Two honesty points.

1. **Ranks 2, 3, 4 and 6 are the jobs people pay for, and we cannot serve any of them in the window.** What we can serve (1, 5 partly, 7, 8, 9, 10) are jobs people complain about or tolerate, not the ones that sell. That is a real tension, and section 5 deals with it.
2. **Rank order inside the top 4 is not measured.** I placed whole-car fault reading first because the ISTA pain evidence is the broadest. A different analyst could rank coding first.

---

## 3. What incumbents do well and badly

| Incumbent | Does well | Does badly | Source |
|---|---|---|---|
| **BimmerCode / BimmerLink** | Curated per-chassis option catalog (their moat, not the protocol work). One-time purchase. Auto backup, one-tap restore, hard blocks on risky states (modified head unit), "basic" mode. 4.7-4.8 store ratings. No account. | Refuses unlisted adapters. Closed catalog. Restore sometimes fails. Codings can revert after an update. Reviewer reports of disabled brake lights and reverted codings (single reviews). Catalog tied to i-level with little public explanation. | [bimmerlink-bimmercode-analysis, bmw-coding-failures-and-recovery, bmw-coding-demand-and-practice] |
| **ISTA (BMW)** | Complete: guided test plans, service functions, programming. | 250 GB, Windows, Java, 100 ms to Munich. German screens. Rental fees. Cable and ICOM confusion. Fear of bricking. Wireless pass-thru forbidden. | [bmw-ista-real-world-usage] |
| **bootmod3 / MHD** | Fast flashing (about 3 minutes first flash, seconds for map changes, vendor-quoted). Backup of stock file. Cloud maps (BM3). Stops a flash if the adapter agent drops (BM3 3.3.8). | BM3 $595 per car, maps extra. Newer cars need a mail-in unlock costing roughly $800 to $1,600 and one to two weeks. Logs stay in their own stores. No success-rate data. No official statement on the OBDLink CX. | [bootmod3-platform, other-bmw-tuners-mhd-jb4-xhp, bm3-adapters-and-flashing-transport, bmw-ecu-flash-security-public] |
| **OBDeleven / Carly / Carista** | Polished phone UX; one-click changes; bundled adapters. | Subscriptions and credits; lost credits; unclear refunds; polarised ratings (Carly 40% five-star and 40% one-star); one unverified brick allegation. | [obd-app-market-and-reviews] |
| **Car Scanner, OBDLink app, Torque** | Free or one-time; standard OBD is public; large user bases. | Shallow on BMW modules; manufacturer data is the paid layer. | [obd-app-market-and-reviews] |
| **Open source** | Strong protocol libraries (udsoncan, can-isotp, doipclient, odxtools) under permissive licences. Wireshark already dissects HSFZ and DoIP. A read-only-by-code norm has emerged. | Fragmented. Everything BMW-specific with real depth is GPL. Mostly read-only. Newcomers are tiny: svietlik has 23 stars. No polished BMW app. | [open-source-automotive-code-survey, open-source-ecu-tools-lessons] |

**Closest overlap to watch: Boostline** (MIT, TypeScript, ENET logging, read-only, lists the MHD and bootmod3 WiFi adapters). Its BMW channels need a one-time import of data from a third-party source it does not name [open-source-automotive-code-survey]. I did not read its code or verify how complete it is. See assumption A6.

---

## 4. The real market gap

Stated as narrowly as the evidence allows:

> Nothing that is **free, open, permissively licensed and not tied to one vendor's adapter** gives a BMW owner a **whole-car fault read with plain explanations, a verifiable snapshot of what is coded, and honest information about which adapter and link will hold up**.

Evidence for each part:

- **Free and open:** the open-source scan finds nothing free that covers BMW coding with a polished app; everything with depth is GPL [obd-app-market-and-reviews, open-source-automotive-code-survey]. (Grade A for the survey, but it was a GitHub-centred survey, not exhaustive.)
- **Verifiable snapshot:** failure docs show restore failing and updates reverting codings, and nobody publishes frequencies [bmw-coding-failures-and-recovery]. A tool that records what changed is an unclaimed position (Grade B, inference).
- **Honest adapter information:** no source publishes a flash or coding success rate for any adapter, and no tuner lists the OBDLink CX for flashing [bm3-adapters-and-flashing-transport]. Vendors publish marketing tables; nobody publishes measured ones (Grade A for the absence).

**Where the gap is weak.** BimmerCode costs about $50 once and is rated 4.7. "Free" alone does not beat a good $50 tool. The gap is trust, transparency and portability, which are real but not what most owners search for. We do not have evidence that BMW owners switch for those reasons. That is assumption A5.

**The moat is data, not code.** Every incumbent's defensible asset is the curated catalog of what each identifier and option means [bimmerlink-bimmercode-analysis, data-strategy.md]. We cannot copy it and the best public sources are uneven: the best open module address list is about 38 entries from one 2016 car [bmw-modules-dtcs-and-addressing]; BMW fault-code text has no clean public source [same]; OBDb BMW coverage varies from 243 signals (3 Series) to 3 (i4) [open-source-automotive-code-survey]. Whoever builds a legitimate, well-attributed catalog owns the long-term position. That is slow, which shapes the recommendation.

---

## 5. Three strategic options, plus one more

### Option A. BMW-first read, verify and explain companion (with coding inspection)

Whole-car scan, plain-English faults, live values, verified snapshots and diffs of coding, adapter capability reports. Writes come later and stay gated.

- **Pros:** Matches the owner's cars and adapters, so we can test it for real. Serves the broadest evidenced job (rank 1) and the safety jobs no one serves (5, 8, 9). Low legal exposure: reading is the safest ground in the law [legal-regulatory-landscape-deep]. Fits the "read-only by code" norm. Builds the data catalog from owner captures as a by-product.
- **Cons:** Does not serve the jobs people pay for (coding, start-stop, video in motion). Has to coexist with BimmerCode rather than replace it, so the pitch is "use it alongside". Data bottleneck (fault text) can stall the "plain words" promise. One test car family means narrow coverage.

### Option B. Cross-brand free scanner

Generic OBD plus manufacturer data from OBDb, for any car.

- **Pros:** Biggest audience. Standard OBD data is public, no licensing risk. A coming change (OBDonUDS, said to become mandatory in the US around 2027, single secondary source) may break classic-only tools [diagnostic-standards-and-obd-future].
- **Cons:** Crowded: Car Scanner, the OBDLink app and others are free already [obd-app-market-and-reviews]. No moat. We would test on the owner's BMW only, so "cross-brand" would be untested claims. Toyota and Mercedes evidence is thin [toyota-lexus-forums-and-practice, mercedes-forums-and-practice]. Dilutes the 12 weeks.

### Option C. Open data platform / pack ecosystem

The product is the community catalog (DTC text, DIDs, coding options with provenance), with tools as the reference client.

- **Pros:** Data is the real moat. Open projects that last have a data model and contributors (opendbc, OBDb) [open-source-ecu-tools-lessons]. Fits the plan's pack and signing work.
- **Cons:** Cold start: no contributors yet, and the research found no verified channel to recruit them. Share-alike data (OBDb, CC-BY-SA-4.0) must stay in a separate pack [decisions.md]. Unproven that anyone contributes without a good tool first. A platform with no users is a spreadsheet.

### Option D. Tuning-adjacent logging

A free, open-format datalogger for BM3/MHD users.

- **Pros:** The owner is the user. Portable logs are a clear complaint against vendor stores. Read-only. Low legal risk if no delete-map handling.
- **Cons:** Boostline already overlaps and is MIT. Needs an adapter that the tuner is not using at the same time, and BLE CX throughput is untested [speed-and-latency-engineering]. BMW engine channel definitions are a data problem: Boostline needs an unnamed third-party import. Demand beyond the owner is inferred. Tuning draws the strongest legal attention (Clean Air Act, "defeat device") [legal-regulatory-landscape-deep], so being "tuning-adjacent" invites scrutiny even if we never touch calibrations.

---

## 6. Recommended direction

**Option A, with D as its first "hook" and C as the quiet long-term asset.** One sentence:

> OpenDiag is the free, open, honest second tool for BMW owners who already code and tune: it reads everything, explains it, records exactly what is coded, and tells you the truth about your adapter and link, so the paid tools you use afterwards are safer.

### Why this one

1. **It is the only option we can test on real cars in 12 weeks.** A needs the owner's ENET and BLE adapters and one or two BMWs. B needs cars we do not have. C needs people we do not have.
2. **It is where the evidence is consistent.** Whole-car fault reading (job 1), adapter pain (8), safety awareness (9) and subscription fatigue (10) are Grade A. The failure docs say nobody has measured failure rates or restore reliability, so our own logs would be new information [bmw-coding-failures-and-recovery, bm3-adapters-and-flashing-transport].
3. **It sits next to the incumbents, not on them.** Owners will keep BimmerCode and BM3. We make them safer (snapshot before, diff after), which avoids a head-on fight we would lose on catalog size.
4. **The legal ground is firm.** Reading and diagnosis is the safest area; the repair exemption has been renewed four times, though it protects the person, not the tool maker [legal-regulatory-landscape-deep].
5. **It builds the moat as a by-product.** Each scan and snapshot, with provenance, is a pack entry for option C. Logging (D) is the feature most likely to bring in enthusiasts, and uses the same transport.

### Cost of this choice (be clear-eyed)

- In week 12 the owner still opens BimmerCode to code. We do not replace the part people pay for.
- The value story depends on "second tool" behaviour, which is untested (A5, A8).
- The owner decision "no real-car writes in 12 weeks" caps what a snapshot is worth: we can prove a restore on the simulator and bench module, not on the car. We must not imply restore-on-car works.

---

## 7. What we explicitly will not do

| Will not | Why | Source |
|---|---|---|
| Flash engine or transmission software, or build unlock paths | Newer BMW engine computers are locked by design; unlocks are the costliest, riskiest part of the tuning journey; a route would be a circumvention tool | [bmw-ecu-flash-security-public, bootmod3-platform] |
| Emissions-related features (DPF/EGR/catalyst deletes, defeat presets) | Clean Air Act penalties per part; the likeliest trigger for store, payment and legal trouble | [legal-regulatory-landscape-deep, business-models-and-sustainability] |
| Immobiliser, key, airbag/SRS, odometer, speed-limiter work | Key programming over the port is a known theft route; refusal list in ADR-010 | [security-research-and-misuse-prevention, architecture-12wk.md] |
| Head unit, gateway or full-car programming | The worst recorded outcomes and the least public recovery; the factory process itself kills modules | [bmw-coding-failures-and-recovery] |
| Ship, link or read OEM software, seed-key material, leaked data, or GPL/non-commercial source | Clean-room rule and trafficking law; Apple has removed GPL apps | [legal-regulatory-landscape-deep, open-source-automotive-code-survey] |
| Copy BimmerCode's catalog or wording | It is their product; build from tested behaviour | [bmw-coding-demand-and-practice] |
| Subscriptions, credits, silent feature removal | The loudest complaint category in the market, and against the project promise | [obd-app-market-and-reviews] |
| Claim "cannot brick", a flash success rate, or an "approved" adapter list we have not measured | Nobody has the numbers; BimmerCode's phrasing is defensible only with a definition | [bmw-coding-failures-and-recovery, bm3-adapters-and-flashing-transport] |
| Name or logo that implies an OEM link | Nominative use only, with a disclaimer | [legal-regulatory-landscape-deep] |
| Cloud accounts, default-on telemetry | Trust is the pitch; the biggest brand weak points are accounts and servers | [security-research-and-misuse-prevention] |
| Mercedes or Toyota features beyond a documented read-only "not yet" | Evidence too thin to commit; A90 Supra is the only low-cost bridge | [mercedes-protocols-and-access-control, toyota-lexus-protocols-and-open-data] |
| Real-car writes in this window | Owner decision 2 | [decisions.md] |

---

## 8. What to build first for the biggest user value

Order is by value per week of effort, assuming the plan's existing transport work (ENET/HSFZ, ELM/STN, simulator).

1. **Plug in, tap scan, get every module and every fault with a plain sentence, in seconds.** Jobs 1, 8. Over ENET first, then the owner's BLE CX if it can reach the modules (A2). Show unknown faults honestly ("no description yet") rather than guessing [bmw-modules-dtcs-and-addressing]. Pre-work: collect the owner's actual fault codes in week 1 to size the description gap.
2. **Link and power truth on every connect.** Jobs 8, 9. Show adapter identity (clone detection by reported strings, not chip names [adapter-hardware-and-protocol-teardown]), connection type, battery voltage and link quality. Warn on known problems: CarPlay hijacking WiFi, non-MFi Ethernet, other devices on the port [bm3-adapters-and-flashing-transport]. Cheap, and no competitor shows it.
3. **Read-only coding snapshot and diff.** Jobs 5, 2, 3. Snapshot all readable modules twice, hash-compare, save. After the owner's next BimmerCode change, diff and show what changed in plain words. This is the feature that makes us useful beside BimmerCode on day one, and the first real data for the catalog (owner captures, per data-strategy.md).
4. **Open-format live logging with named channels.** Job 7. Use OBDb signals (separate share-alike pack) for the owner's engine; log to a documented, portable file. Check what Boostline already does first (A6).
5. **Capability reports per adapter, from our own sessions.** Job 8. Publish measured read speed, drops and failure reasons for the owner's three adapters. Nobody publishes this [bm3-adapters-and-flashing-transport].
6. **Pack and contribution flow.** Option C seed: provenance, `tested_on`, linter. This already exists in the plan and stays.

Writes (coding changes) come after 1 to 5 and only on simulator and bench in this window.

---

## 9. How this changes the 12-week plan and the KPIs

### 9.1 Plan changes (proposals; the owner decides, per decision 3)

| Area | Today | Proposed | Why |
|---|---|---|---|
| Weeks 5 to 8 (store, backup, packs, write engine, fault injection, M3) | Heavy write-engine investment (about 13 scenarios, journal, token) | Keep the verified-backup and "no write without backup" guard (it is cheap and G5 needs it). Trim the write engine to what the bench trial needs. Release hours to scan quality, snapshot/diff and logging | Real-car writes are dropped, so most of the engine pays off only after week 12. The safety features are our trust claim, so do not cut them to zero |
| Live data (plan week 9) | Late | Pull a minimal version to weeks 5 to 6 | It is the hook (D) and the only job where the owner can feel progress during the dark middle of the plan |
| Mobile (spike only, week 10) | Desktop first; BLE only via desktop noble | Ask in week 1 whether the owner uses phone or laptop in the car. If phone, a mobile read-only path moves up | BimmerCode's market is phone-first. A desktop-only tool may miss the audience (A9) |
| Data targets (200 DTC, 30 DID, 20 coding options) | Fixed numbers | Keep, but add a week-2 measurement: what share of the owner's actual codes have a legitimate source | The "plain words" promise depends on this and the deep docs found no clean BMW fault-text source |
| Hardware | $100 to $150 bench module around week 7 | Unchanged | Bench trial still proves restore on a module |
| Outreach | S14 volunteers by Dec 18 | Move first contact to week 1 and track replies | Contributors are the C dependency, and no channel is verified |
| Legal | Scoping call week 3 | Keep. Add a question on OBDb share-alike packaging and the app name | Decisions 1 and plan risk R7 |

### 9.2 KPI changes

Existing KPIs G1 to G12 in `kpis.md` stay. Changes and additions:

| KPI | Change | Target | How measured |
|---|---|---|---|
| **G6** | Redefine denominator. Keep 80% of codes seen **in real sessions** having a description, but report it per source (standard, OBDb, owner-written) and split engine from body modules | Wk 4 report baseline; wk 12 80% on the owner's own cars | Session logs |
| **N1 Time to first useful answer** | New | Plug-in to full fault list with text under 2 minutes after setup (matches the ISTA doc's target) | Stopwatch, owner and one outsider |
| **N2 Adapter reality** | New | Capability report for each of the owner's 3 adapters: scan time, drops, reachable module count | Report in repo |
| **N3 Snapshot trust** | New | Two consecutive read-only snapshots hash-identical on at least 8 real modules; one real BimmerCode change diffed correctly | Automated plus one manual |
| **N4 Preference** | New (honest dogfood) | Owner uses OpenDiag instead of BimmerLink/ISTA for fault scans in at least 10 real sessions | Session log count |
| **N5 Logging soak** | New | 30-minute drive log, 10+ named channels, under 1% dropped samples, exports to open CSV | Drive log |
| **G9 Others help** | Keep at 10 but add: 3 non-owner scans reported | Wk 12 | Issues |
| **G4 / G5** | Unchanged | Keep | Keep |

Milestone M2 (Jan 8) pass rule gets one addition: N3 first half (two identical snapshots on 3+ modules). M3 stays on the simulator but with a smaller scenario set; the plan's G4 and G5 numbers do not change.

---

## 10. The 10 riskiest assumptions and a week-1 test for each

Owner time is about 12 h per week; each test below is one evening or less unless noted.

| # | Assumption | Why risky | Week-1 test | Kill or change signal |
|---|---|---|---|---|
| A1 | The owner's cars answer whole-car reads over ENET without special authorisation | G-series and 2019+ cars use gateways and secure diagnostics; evidence unverified [bmw-newer-cars-gateway-and-secure-diag, bmw-enet-hsfz-wire-protocol] | With ENET cable, discover the car, read VIN and identity from every module that answers; count answers | Fewer than half of modules answer reads: switch to an older chassis or reduce scope to what answers (plan risk R10) |
| A2 | The OBDLink CX over BLE can reach non-engine modules fast enough to be useful | CX is high-speed CAN and ISO/KWP only; MTU 247, nothing measures BMW over it [adapter-hardware-and-protocol-teardown, bm3-adapters-and-flashing-transport] | Same scan over CX; record time, modules reached, errors. First, confirm the model of each of the owner's 3 adapters (open item in decisions.md) | CX reaches engine module only: recommend ENET WiFi first, drop BLE from week 4 targets |
| A3 | We can read coding data the way BimmerCode shows it, read-only, without proprietary data | Layouts differ by chassis and i-level; data comes only from owner captures [data-strategy.md] | Read raw coding from 3 modules twice; compare | Reads unstable or refused: the snapshot feature falls back to raw, un-named fields |
| A4 | Enough BMW fault codes have a legitimate plain-text source | No clean public BMW fault-text list; best lists scattered, partial, confused decimal vs hex [bmw-modules-dtcs-and-addressing] | Collect all fault codes from the owner's cars (including stored history). For each, record source: standard, OBDb, none | Under 30% sourced: lower G6, make description writing a contributor task, lead with "what module, what status" over text |
| A5 | BMW owners want a free "second tool" beside BimmerCode | No demand count exists. BimmerCode is cheap and highly rated [user-demand-and-pain-points, obd-app-market-and-reviews] | Owner asks 5 people who use BimmerCode or BM3 (club, forum, friends): what do you wish it did, would you try a free read tool? Record answers verbatim | Fewer than 2 of 5 interested: reposition toward tuner logging (D) or data (C) |
| A6 | Boostline does not already do what we want | Same stack, same adapters, MIT [open-source-automotive-code-survey] | Read its README and issues (not run on a car); list overlaps and gaps. Run it only if it passes the licence and safety check | It covers scan and logging well: contribute upstream and narrow to snapshot/diff and adapter truth |
| A7 | Live channels for the owner's engine are readable at a useful rate | Channel definitions come from OBDb (uneven) or unnamed third parties; BLE rate unmeasured [open-source-automotive-code-survey, speed-and-latency-engineering] | Pull the OBDb signal set for the owner's engine; try 5 channels over ENET and over the CX; measure samples per second | Under 2 Hz on CX or no usable signals: logging is ENET-only or parked |
| A8 | Reads are repeatable and an update-induced change would be visible in a diff | Whole premise of snapshot value; update revert reports are anecdotal [bmw-coding-demand-and-practice] | Two snapshots a day apart without changes must match exactly; look for any field that changes on its own (counters, timestamps) | Volatile fields everywhere: add field masking before the diff is useful |
| A9 | The audience is on a phone, not a laptop | BimmerCode and BimmerLink are phone-and-desktop; plan assumes laptop and desktop BLE [bmw-ista-real-world-usage, project-plan.md C12] | Owner states how they actually code today (device, adapter, in-car or garage). Ask the same of the 5 people in A5 | Mostly phone: promote mobile read-only path in weeks 5 to 8 |
| A10 | Legal and name posture holds: "OpenDiag" is clear; OBDb share-alike pack is fine; no store blocks a read-only BMW tool | Trademark and licence mixing not yet checked [legal-regulatory-landscape-deep, decisions.md] | Book the 1 h scoping call; run a name search; read OBDb licence text and contribution rules; decide the pack split on paper | Name conflict or counsel flags share-alike mixing: rename now (cheap in week 1, costly later) |

Also worth saying: **owner time and car access** (plan R1 and R2) is the single largest assumption, but is already tracked in the plan, so I do not repeat it here.

---

## 11. Weak spots in this document

- **No demand counts.** Everything about "how many people want X" is inference. A5 is the first real data.
- **Vendor-quoted ratings** (BimmerCode 4.7 and the review counts) come from vendor pages [obd-app-market-and-reviews], not independent store checks.
- **Start-stop i-level 23-3** is single-vendor and disputed by a minority of owners [bmw-coding-demand-and-practice].
- **Failure frequency:** no source publishes it. Our claim "nobody has the numbers" is an absence in the sources we could read, not proof.
- **Mercedes and Toyota:** the two forum-practice docs say themselves that they do not support a build decision. I treated them as out of scope for that reason.
- **Newer-car lock-down (G-series, iDrive 8/8.5):** mostly background knowledge in the deep doc, labelled unverified [bmw-newer-cars-gateway-and-secure-diag]. A1 is the test that matters.
- **My own reading:** summaries and implication sections of the deep docs, not every paragraph. A detail lower down could change a ranking.

## 12. Decisions this document needs from the owner

1. Accept Option A as the direction, with logging as the hook and the pack catalog as the long-term asset.
2. Confirm the three adapters (model names) and whether the car is used with phone or laptop (A2, A9).
3. Agree the new KPIs N1 to N5 and the G6 redefinition for the Friday scoreboard.
4. Agree to trim write-engine hours in favour of snapshot/diff, scan quality and early logging, to be settled at the first Friday scoreboard (decision 3).
