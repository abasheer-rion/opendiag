# OpenDiag feature plan (ranked, 60 features, R0 to R4)

Written 2026-11-20 for the 12-week window (Mon 2026-11-23 to Fri 2027-02-12). Not legal advice. Inputs: `decisions.md`, `direction.md`, `kpis.md`, `architecture-v2.md`, `dtc-coverage-strategy.md`, `docs/research/deep/EVIDENCE.md`, and the 14 notes in `docs/research/deep2/`.

**How this was made.** No new web pages were fetched. This is a synthesis of the repo's own research. Every external fact carries the confidence tag of the repo note that read it. Where I say "evidence" I mean what those notes say, with their own caveats. Effort numbers and the capacity estimate are mine (low confidence). Clean-room: nothing here needs, requests or uses leaked OEM files, keys or databases.

## Executive summary

1. **60 features, 5 releases.** R0 read-only now (24), R1 backup and inspect (15), R2 bench-write, lab build only (11), R3 real-car guarded (4), R4 other brands (6).
2. **R3 is not built in this window.** Owner decision 2 drops real-car writes. The four R3 items are listed so the demand is visible and the refusal is explicit, not hidden.
3. **Must is about 104 engineering days. Capacity is about 65.** Estimated total for all 60 is 229.5 days; Must 104.5, Should 58.5, Could 32.5, Won't this window 34. The gap is real. The Friday cut ladder (section 7) is the mechanism, and the first two Fridays will tell us whether my day counts are too high.
4. **The jobs people pay for are all writes** (start-stop, battery registration, hidden options). We serve their read half: "what is set", "did it change", "why is it acting up". This is the direction.md tension, unchanged.
5. **Ranked first in every release:** whole-car scan with plain-English faults (G1, G2, G6), then snapshot and diff (G7), then the safety core (G5). Demand for them is grade A or B; none is measured against paying users.
6. **Cheapest wins:** link and power truth, capability report, connection troubleshooter, read-only banner, export bundle. Each is 1 to 4 days and answers a documented complaint.
7. **Biggest feature-level risks:** CX reach (A2) decides F07 and G3; fault-text data decides G6; coding-read identifiers for battery, service and start-stop are not established anywhere (F25 is speculative).
8. **Owner decision needed:** clear fault codes (F50). legal-safety-liability says reader build may include it; architecture-v2 says lab-only. This plan follows architecture-v2.

---

## 1. How to read this document

### 1.1 Releases

| Release | Meaning | Window | Writes to a car | Build |
|---|---|---|---|---|
| R0 | Read-only now: connect, scan, faults, live data, logging, demo | Weeks 1 to 4 (M1 Dec 18), spill to week 6 | None | Public |
| R1 | Backup and inspect: snapshot, diff, packs, catalog, export | Weeks 4 to 8 (M2 Jan 8, M3 Jan 15 for the pack side) | None | Public |
| R2 | Bench-write: write engine, backup gate, recovery, bench trial | Weeks 7 to 11 (M3 Jan 15 sim, M4 Feb 12 bench) | Bench module or simulator only | Lab build only, never in public artifacts |
| R3 | Real-car guarded writes | After the window | Real car | Not built; needs reviewer sign-off and a new owner decision |
| R4 | Other brands: cross-brand generic, Toyota/Lexus, Mercedes, MINI, Supra | Mostly after week 8 | None in window | Public, read-only |

### 1.2 Columns

| Column | Meaning |
|---|---|
| Job | What it does for the person, in plain words |
| Who wants it | Segment and evidence. Segments S1 to S6 are from `direction.md`. Evidence codes in 1.4 |
| Class | **R** = read only. **W** = writes to a module. **-** = no car contact |
| Adapters | ENET = WiFi or wired ENET (HSFZ, TCP 6801). CX = OBDLink CX over BLE. ELM = ELM327 or STN over WiFi, BLE or USB. DoIP = TCP/UDP 13400. SIM = simulator only. Any = every link |
| Risk tier | T0 no car contact. T1 read only, standard services. T2 read only but near gateway or session limits, or with data-licence exposure. T3 write to a bench module. T4 write to a real car (not allowed in the window) |
| Days | Focused engineer-days (6 hours) including review and test, with Claude drafting most code. **Low confidence on every number.** See 1.3 |
| KPI | Goals from `kpis.md` it moves (G1 to G12). N1 to N5 are the new KPIs proposed in `direction.md` section 9.2 and not yet accepted |
| Cut | MoSCoW letter and a cut rank. Rank **1 = cut first, 5 = never cut** |

### 1.3 Effort honesty

- My day counts have no measurement behind them. The repo has 27 tests and a simulator, nothing tried on a real car (`kpis.md` baseline). Real-car work is slower than lab work because of car access, adapter pairing and re-tries.
- Capacity assumption (low confidence): owner 12 to 15 hours per week, about 27 owner-days of 6 hours, plus Claude drafting in parallel. I assume Claude lets one owner supervise roughly 2.4 engineer-days per owner-day, giving about 65 engineer-days. That ratio is a guess. The first measured burn rate is the Dec 18 M1 scoreboard; rescale this whole file then.
- Every feature that touches a real car carries a real-world tax I have only partly included: pairing failures, car in the garage at night, one car only (owner decision, `direction.md` A1).
- If the ratio is 1.5 instead of 2.4, capacity is about 40 days and the ladder goes down to rung 8.

### 1.4 Evidence codes

| Code | Source note | What it gives |
|---|---|---|
| UJ | `deep2/user-jobs-and-demand.md` | Ranked jobs, YouTube views and comment tallies, read vs write classification |
| CF | `deep2/competitor-feature-inventory.md` | 15-tool matrix, ranked gap list (section 10) |
| UX | `deep2/ux-teardown-and-safety-ux.md` | Do/do-not patterns D1 to D20, X1 to X18, write flow |
| LG | `deep2/legal-safety-liability.md` | Gating matrix 12.1, deny-list 12.2 |
| GS | `deep2/bmw-g-series-coding-reality.md` | What newer cars allow |
| AT | `deep2/adapter-and-transport-constraints.md` | CX, BLE, ENET, phone limits |
| MT | `deep2/mercedes-and-toyota-reality.md` | Access to Mercedes and Toyota |
| OS | `deep2/open-source-reuse-map.md` | What can be reused and under which licence |
| DC | `plan/dtc-coverage-strategy.md` plus `deep2/dtc-*.md` | Fault-text levels L0 to L3, hour estimates |
| UI | `deep2/ui-library-landscape.md` | UI stack |
| DR | `plan/direction.md` | Segments S1 to S6, jobs 1 to 10, grades A/B/C |
| AV2 | `plan/architecture-v2.md` | Packages, safety layers, cut order, never-cut list |
| EV | `deep/EVIDENCE.md` | Corrections and index; summary points 1 to 10 |

Demand grades follow `direction.md`: **A** several independent sources, **B** vendor or single source, **C** inference. A view count is audience size, not purchase intent; a comment tally is my predecessor's own count, not a full-thread count (UJ section 1.1).

### 1.5 Ranking method

Within each release, rank = (demand grade) x (KPI weight) / (days), then adjusted by dependencies (a feature cannot rank above what it needs) and by the never-cut list in AV2 section 12. This is judgement, not a formula. A different person could swap neighbours.

---

## 2. R0: read-only now (24 features)

Goal: a stranger can plug in, scan the whole car, see every fault in plain words, and see how healthy the link is, in seconds. Milestone M1 Fri Dec 18 (G1 at least 3, G2 and G3 week-4 targets).

| Rank | ID | Feature | Job (plain English) | Who wants it, evidence | Class | Adapters | Risk | Days | KPI | Depends on | Cut |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | F06 | Whole-car scan | Find every control unit on the car and say which ones answered, fast | S1, S2, S3. Whole-car fault read is job 1 in DR (A). ISTA's pain is a VM and a 250 GB disk (DR §3, B). Fault-read videos 105k to 188k views (UJ §3.1, medium) | R | ENET, DoIP | T1 | 6 | G1, G2, G7, G10 | F01, F17 | M5 |
| 2 | F09 | Fault read per module | Show stored, pending and history faults with status, per module | Same as F06; "read and understand fault codes in every module" is UJ rank 5, the one top job fully read-only (A for audience, B BMW-specific) | R | Any | T1 | 3 | G1, G6, G10 | F06 | M5 |
| 3 | F10 | Plain-English fault explanations | Tell the person what a code means, where the text came from, and say "no description yet" when we do not know | S1, S2, S3. Fault text has no clean public BMW source (EV, DC). Status level L0 to L3 in DC §1.1 | R | none | T0 | 4 | G6, G8 | F09, F33 | M4 |
| 4 | F01 | Adapter discovery and connect | Find the adapter and connect without typing addresses | Adapter trouble is the biggest cluster in a popular library's open issues, about 7 of 25 (DR §2 rank 8, A). CF gap rank 2: no lock-in, any adapter | R | ENET, CX, ELM | T1 | 4 | G1, G8, G10 | none | M5 |
| 5 | F17 | Simulator, 40-ECU fixture, record and replay | Let every screen and test run without a car; turn each real trace into a regression test | AV2 §11.2. Needed by G2 sim, G4, G5. Not user-visible, so no demand grade | - | SIM | T0 | 6 | G2, G4, G5, G8 | none | M5 |
| 6 | F02 | Capability report | Show what this adapter and car can and cannot do, and why | CF gap rank 2 and rank 11; UX D15 (BimmerCode's adapter page gives no reason, medium). AV2 never-cut | R | Any | T1 | 3 | G8, G9, G10 | F01 | M5 |
| 7 | F05 | VIN and identity read | Read VIN, chassis, software level where readable, so we know what car this is | Required for any pack lookup; unknown identity means read-only (AV2 §8.4) | R | Any | T1 | 1.5 | G1, G6 | F01 | M5 |
| 8 | F18 | Session log and trace save | Save every session as a file that counts toward G1 and can be replayed | `kpis.md` G1 counts only sessions with a saved trace; AV2 L5 | R | Any | T0 | 2 | G1, G10 | F01 | M5 |
| 9 | F03 | Link and power truth | Show adapter identity, link type, battery voltage and link quality on every connect; warn on known problems | DR §8 item 2. Low voltage is the one agreed cause of coding and flash trouble (EV #5, A). CarPlay hijacking WiFi, non-MFi Ethernet (DR §8, medium) | R | Any (voltage where reported) | T1 | 3 | G8, G10, N2 | F01 | M4 |
| 10 | F08 | Timing mode (`scan --timing`, `quick`) | Measure scan and quick-read times, five runs, so G2 and G3 are numbers not claims | `kpis.md` G2, G3. No public baseline for incumbents (kpis.md evidence update, high that it is absent) | R | ENET, CX | T1 | 1.5 | G2, G3 | F06 | M4 |
| 11 | F12 | Live data, 10 standard values | Show ten standard live values (RPM, coolant, etc.) | Part of the G3 quick read (VIN, faults, 10 live values) | R | Any | T1 | 2 | G3, G1 | F01 | M4 |
| 12 | F07 | Scan over the CX (BLE) | Do the same scan over the phone-style BLE adapter | Owner's CX is BLE only, MTU 247, one write in flight, bonding window 5 min (AT exec 1, high). Whether it reaches body modules is open (A2, F8, low) | R | CX | T1 | 5 | G3, G7, G10 | F01, F06 | M4 |
| 13 | F19 | Desktop app shell and CLI | A double-clickable Mac app and a command-line client over one service | AV2 §4.1. Electron brought forward to a working shell by week 4 to 5. G8 needs a downloadable app | R | Any | T1 | 6 | G8, G9 | F06 | M4 (CLI itself M5) |
| 14 | F22 | Read-only mode banner and first-run | A persistent "Read only" banner; new users start with scan, faults, live data | UX D16, D19; DR §6 | - | none | T0 | 1 | G5, G8 | F19 | M4 |
| 15 | F11 | Generic OBD-II suite | Codes (03, 07, 0A), freeze frame, readiness monitors, for any car | Generic scans: 135k to 492k views (UJ §3.1, medium). Readiness monitors are the one trick every source repeats (UJ §2.3, low-medium). Crowded: free apps already do this (DR §5 option B) | R | Any | T1 | 3 | G1, G3 | F01 | S3 |
| 16 | F13 | Named live channels from the OBDb pack | Show real names and units for engine values, from the share-alike pack | S1 tuners. Datalog how-tos 27k to 84k views (UJ §3.1). OBDb BMW coverage is uneven: 243 signals for 3 Series, 3 for i4 (DR §3, medium) | R | ENET, CX | T2 (licence zone) | 4 | G3, G7, N5 | F12, F35 | S3 |
| 17 | F14 | Open-format log export | Save logs as plain CSV the person owns | Logs stay in vendor stores (DR §3); CF gap rank 10 | R | Any | T0 | 2 | G9, N5 | F12 | S3 |
| 18 | F16 | Demo car in the browser | Try the whole app with a pretend car, no hardware | AV2 §5, T3. Serves G8, G9 at $0 | - | SIM | T0 | 3 | G8, G9 | F17, F19 | S2 |
| 19 | F23 | Data sources and licences screen | Show every value's source, licence and zone | AV2 §9.2 (required control); CF gap rank 5 | - | none | T0 | 1 | G11 | F35 | S3 |
| 20 | F04 | Connection troubleshooter | Guided pairing and a checklist: airplane mode, CarPlay, other apps on the adapter | UX §5: wrong radio state is a top failure cause (high). BimmerCode FAQ routine is the template. CF gap rank 9 | R | Any | T1 | 2 | G8, G10, G9 | F01 | S3 |
| 21 | F20 | Newer-car transparency page | Say plainly what this car does not let us read or change, and why | CF gap rank 11. GS exec 1 to 9: reading works almost everywhere; writing cliff on G05/G07 facelift, G70, G60, i5, iX (high for labels, low for reason) | - | none | T0 | 1.5 | G9, G8 | F02 | S2 |
| 22 | F24 | Preflight checklist screen | Record answers (car running? charger? other apps?) before long operations | UX D1; BimmerCode quick start lists about ten conditions (high) | - | none | T0 | 1.5 | G10 | F03 | C2 |
| 23 | F21 | Pre-purchase report | One shareable file: faults, pending, readiness, VIN match, voltage | UJ rank 8: audience large, BMW-specific demand nearly invisible (generic 135k to 492k views, BMW under 500). Segment is unfocused (C) | R | Any | T1 | 3 | G9 | F09, F11 | C1 |
| 24 | F15 | Live chart and table | Plot live traces with a table view of the same data | UI: uPlot (22 KB gzip, no accessibility story, last npm release 2025-03-14, medium). AV2 cut order puts chart polish 5th | R | Any | T0 | 3 | G9 | F12 | C1 |

Notes on R0:

- **F06 and F07 are one feature on two links.** The transport is different (parallel on HSFZ, one in flight on the CX), so the days are separate. If A2 shows the CX reaches only the engine module, F07 shrinks to a capability statement (F02) and G3 is measured on the CX engine read only. Do not hide that (AV2 R2).
- **F10 is the only R0 feature that depends on data we do not have.** DC estimates 100 to 250 BMW manufacturer codes explained after 12 weeks (est., low). The honest KPI is G6 per source and per module class (direction.md §9.2).
- **F11 is Should, not Must.** Generic OBD-II is public and free apps do it. It matters for R4 and as a fallback on ELM adapters, but it does not differentiate us (DR §5 option B cons).
- **F21 and F15 are the first cuts.** F21 is the weakest evidence in UJ §6.1. F15 is on the AV2 cut order.

---

## 3. R1: backup and inspect (15 features)

Goal: a person can snapshot what is coded, see exactly what changed after another tool or an update touched the car, and trust the record. Milestone M2 Fri Jan 8 (G7 at least 3 modules, G5 holds, G6 at least 30%).

| Rank | ID | Feature | Job (plain English) | Who wants it, evidence | Class | Adapters | Risk | Days | KPI | Depends on | Cut |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | F26 | Read-only coding snapshot | Read a module's coding twice, hash both, keep only if identical | S1, S2. Restore failing and updates reverting coding (DR §2 rank 5, B; start-stop revert from i-level 23-3 is vendor-sourced, disputed, B). CF gap rank 1 is backup, which starts with a verified read | R | ENET, CX | T2 (extended session may be needed; see note) | 6 | G7, G5, N3 | F06, F27 | M5 |
| 2 | F27 | Snapshot store and audit chain | Keep snapshots as local files with a tamper-evident log; no account | UX D13, X6, X7, X8: backups vanish with the app (BimmerCode, high); do not expire snapshots | - | none | T0 | 4 | G7, G5, G9 | none | M5 |
| 3 | F28 | Snapshot diff with volatile-field masking | Show what changed between two snapshots in names and raw bytes | Nobody in the teardown shows a before/after diff (UX exec 2, medium). Assumption A8: counters may change on their own | R | none | T0 | 4 | G7, N3 | F26, F27 | M4 |
| 4 | F30 | Export bundle with redaction | Save a snapshot or session as one file, VIN removed on request | AV2 never-cut. LG 12.1 row 2: backups contain VIN and coding; share only after redaction (medium). Also how outside people report back (G9) | - | none | T0 | 3 | G9, G11 | F27 | M4 |
| 5 | F31 | Pack loader, verifier, signer, linter | Load data packs only if signed, in-date, correct zone and sourced | AV2 §9; G11. Signing keys need owner approval and a registry row (dev-box rules) | - | none | T0 | 8 | G11, G6, G5 | none | M4 |
| 6 | F32 | Licence-zone tooling and three repos | Keep Apache code, own-wording data and share-alike data in separate repos and keys | Owner decision 1. CC BY can feed CC BY-SA, never the reverse (high, CC FAQ via DC) | - | none | T0 | 3 | G11 | F31 | M4 |
| 7 | F33 | Generic fault-text pack (L0 and L1) | Every generic code gets at least a structural meaning in our own template | DC §0: about 9,500 generic codes exist as a public-domain-style list; work left is our wording (medium) | - | none | T0 | 4 | G6 | F31, F32 | M4 |
| 8 | F29 | Coding option names from owner captures | Name coded options in plain words, only from our own captures and wording | The moat is the catalog (DR §4, B). No licensed BMW coding database exists (OS exec, medium). DC target 20 coding options in 12 weeks | R | none | T0 | 5 | G7, G6 | F26, F31 | S3 |
| 9 | F36 | Published adapter capability reports | Publish measured scan time, drops and reachable modules for the owner's adapters | N2. Nobody publishes measured adapter results (DR §4, A for the absence) | - | Any | T1 | 2 | G10, G9 | F08, F02 | S3 |
| 10 | F39 | Link conformance suite and hardware qualification | One test file run against loopback TCP, BLE, serial and sim | AV2 §8.1, §11.1 L4. Written before the second link implementation | R | Any | T1 | 5 | G10, G2, G3 | F01 | S3 |
| 11 | F37 | Snapshot timeline and module row status chips | See each module's coding state (verified, unknown, invalid), last snapshot, fault count | UX D11 and IA pattern 4; red dot in BimmerCode (high) | R | none | T0 | 4 | G7, G9 | F27, F19 | S2 |
| 12 | F34 | BMW fault-text contributor pipeline | Accept fault descriptions with a source, similarity check and two reviewers | DC §6: biggest danger is accidentally copying paid or leaked text (medium). Needs contributor terms before the first outside PR (AV2 §9.2) | - | none | T0 | 5 | G6, G11, G9 | F31, F33 | S2 |
| 13 | F38 | Guided before-and-after compare | "Snapshot now, make a change in your other tool, snapshot again, see what moved" | The one workflow that makes us useful beside BimmerCode on day one (DR §8 item 3). Untested that owners want it (A5) | R | ENET, CX | T1 | 3 | G7, G9 | F28 | C2 |
| 14 | F35 | In-app "help us name this code" | One tap turns an unknown fault into a redacted submission | DC: when a code is unknown the app asks for help. Cold-start risk: no contributors yet (DR §5 option C cons) | - | none | T0 | 3 | G9, G6 | F30, F34 | C2 |
| 15 | F25 | "Why is start-stop or the battery warning acting up" read screen | Voltage, battery state and related faults shown together | Start-stop is the highest-help-seeking job (about 38 to 40 of 60 top comments are questions, UJ §4, A for demand). **Identifiers for battery registration data are not established in any source** (UJ §6 R6, low) | R | ENET | T1 | 5 | G9 | F26, F10 | C1 |

Notes on R1:

- **Read-allow-list tension (F26).** AV2 §10.1 L1 lets only SIDs 01 02 03 07 09 0A 19 22 3E and `10 01` through the public guard. Coding reads on some modules may need an extended session (`10 03`). Whether that is true on the owner's cars is not established. If it is, adding `10 03` to the public allow-list is a safety-reviewer decision, not a feature tweak. Flagged in Gaps.
- **F26 and F27 sit together on the critical path** for G7, N3 and for everything in R2 (the backup gate needs the same read-twice-hash code). Cut neither.
- **F31 at 8 days is the largest R1 line.** It carries G11. Keep the loader and linter; the signing CLI can wait until week 6 because keys need approval (AV2 Q3).
- **F29 is the moat and the slowest.** Each entry depends on a real capture from a real car; the owner has one car (DR A1). Expect 20 entries, not 200.
- **F25 is speculative.** It is ranked last in R1 because the one thing it needs (where the data lives) is unknown. Do it only if a capture in week 2 to 4 shows the identifiers.

---

## 4. R2: bench-write, lab build only (11 features)

Goal: prove that a write can be planned, backed up, applied, verified and reverted, on the simulator first and on one bench module second, without any write code in a public build. Milestones M3 Fri Jan 15 (G4 sim 100 of 100, G5 holds) and M4 Fri Feb 12 (bench 20 of 20).

Everything here is invisible to a normal user. None of it ships in the app, the Demo car or the CLI (AV2 L0). Demand evidence is indirect: the safety core serves the fear of a dead module (CF gap rank 1, UX exec 2), but we cannot show that anyone wants writes from us in this window. The reason these rank high is KPI G4 and G5, not demand.

| Rank | ID | Feature | Job (plain English) | Who wants it, evidence | Class | Adapters | Risk | Days | KPI | Depends on | Cut |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | F42 | Verified-backup gate | Refuse to start any write unless two reads matched and the hash is recorded | Owner decision 2; G5 "0 possible". CF gap rank 1; UX D2 | W (gate) | SIM, bench | T3 | 3 | G5, G4 | F26, F27 | M5 |
| 2 | F40 | Lab build split and public-artifact audit | Keep write code out of every public artifact and prove it with a scan of the built output | AV2 L0; `kpis.md` quality gate "no write reachable from a public build". LG exec 8: reader build with no write code (medium) | - | none | T0 | 3 | G5 | none | M5 |
| 3 | F44 | Journal and kill-and-recover | Log "step sent" before sending; after a crash, show the unfinished change and offer revert | AV2 never-cut; ADR-009 rules. Recovery on start refuses new writes while a transaction is open | W | SIM, bench | T3 | 5 | G4, G5 | F42 | M5 |
| 4 | F41 | Write plan, diff and dry run | Build an immutable hashed plan, show old vs new, run the path up to but not into the transport | UX D3, D5 (Terraform, kubectl, AWS dry-run patterns, medium to high). No tool in the teardown shows a diff (medium) | W | SIM | T3 | 4 | G4, G5 | F28 | M4 |
| 5 | F48 | Read-back verify and one-tap revert | After a write and reset, re-read and compare; one tap restores the snapshot, with the same diff screen in reverse | UX D9, D10. Commit means read-back matched, not a positive reply (AV2 §10.2). Restore can itself fail (EV, DR) | W | SIM, bench | T3 | 4 | G4 | F44, F41 | M4 |
| 6 | F46 | Voltage gate | Refuse writes unless voltage is readable and at least the profile minimum | Low voltage is BMW's own named risk (EV #5, A). Thresholds disagree (11.9 to 13.8 V, EV #5, high for the disagreement); default 12.5 V from AV2 (medium) | W (gate) | Any | T3 | 1.5 | G5, G10 | F03 | M4 |
| 7 | F45 | Fault-injection scenarios (8) | Drop the link, go silent, corrupt a read-back, cut power, delay replies, on the simulator | AV2 §11.1 L2: 8 scenarios by week 8. Needed for G4 100 of 100 | - | SIM | T0 | 4 | G4, G5 | F44, F17 | M4 (can drop to 4 scenarios) |
| 8 | F43 | Separate writer process | Re-check plan, backup hash, voltage and refusal list in a child process the UI cannot reach | AV2 L3: replaces Tauri's Rust gate. Evidence on whether a reviewer accepts same-language isolation: none (AV2 gap 8) | W | SIM, bench | T3 | 6 | G5 | F42, F40 | S3 |
| 9 | F49 | Bench write and restore trial | Write and restore a settings change on a real bench module 20 times; hashes match every time | `kpis.md` G4 wk 12 "bench 20 of 20". Needs the bench module (the one real purchase, $100 to $150, `decisions.md`) | W | Any (link to bench) | T3 | 6 | G4, G12 | F44, F48, F43 | S3 |
| 10 | F47 | Typed confirm, outcome-named buttons, stepper | A confirm that names the target, buttons that say what happens | UX D7, D8, X1 to X3: typed confirm only for rare severe actions (NN/g via UX, medium) | W | none | T3 | 3 | G5, G9 | F41 | S2 |
| 11 | F50 | Clear faults (lab-only, bench-only) | Clear stored faults on the bench module, with an honest note on what stays | Most users expect a clear button (AV2 §10.4). Clear resets readiness monitors (LG 12.1 row 3, medium) | W | SIM, bench | T3 | 2 | G5 | F42 | C1 |

Notes on R2:

- **The safety core is F40, F42, F44, F46.** AV2 lists the simulator safety suite, verified-backup rule, kill-and-recover test, built-artifact bypass test and capability screen as never-cut. Add up F40, F42, F44, F46 = 12.5 days; that is the floor.
- **F43 is the first R2 line to cut.** AV2 R4 accepts a same-language writer is weaker than a compiled gate. Cutting it saves 6 days and the G5 claim stands on absence from the public build (F40) plus the backup gate (F42), with one fewer layer.
- **F49 depends on money and shipping time.** The bench module is bought around week 7. A bench module may not arrive until week 9. If so, G4 stays at simulator numbers and the Friday note says "bench not reached".
- **F50 conflict.** LG 12.1 row 3 allows clear faults in the public build with a confirm dialog. AV2 §10.4 keeps it lab-only. This file follows AV2. If the owner prefers the public build, F50 moves to R0 as "F09b", needs 2 days, T3 becomes T2, and it must carry the plain-words warning in LG 12.3. Decision Q5.

---

## 5. R3: real-car guarded writes (4 features, not built in this window)

Owner decision 2 dropped these ("dropped, not deferred"). They are here because the demand is the strongest in the whole research, and a plan that omits them hides the main tension. **Do not schedule.** Revisit only with: a safety reviewer (decision 6), at least one real-car read-only snapshot restored on a bench twin, a new owner decision, and legal sign-off per LG 12.1.

| Rank | ID | Feature | Job (plain English) | Who wants it, evidence | Class | Adapters | Risk | Days | KPI | Depends on | Cut |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | F53 | Start-stop mode and service resets | Turn off auto start-stop; reset service and brake counters | Start-stop: five videos at 67k to 280k views, an official BMW how-to, about 38 to 40 of 60 top comments are questions (UJ §4 rank 1, A on demand, B on method). BMW broke it on petrol cars from i-level 23-3, disputed (DR §2, B) | W | ENET | T4 | 6 | none in window | F54 | W |
| 2 | F52 | Battery registration write | Tell the engine computer a new battery was fitted | Largest single-topic videos: 448k, 263k views (UJ §4 rank 2, A). Necessity disputed (UJ §4, B). Cost-resentment is loud (S3) | W | ENET | T4 | 5 | none in window | F54 | W |
| 3 | F51 | Real-car single-option coding write | Change one comfort or display option with a verified backup | Hidden-options bundle: 4.6M and 1.25M views (UJ §4 rank 3, A). BimmerCode, about $50, about 22K iOS ratings (vendor-quoted, medium) already serves this well | W | ENET | T4 | 10 | none in window | F54, F43, F49 | W |
| 4 | F54 | Restore on a real car | Put back an earlier snapshot on a real module | The fear is a dead module (CF gap rank 1). We have no data that restore works on real cars (UX exec 2); proving it on a bench module is the precondition | W | ENET | T4 | 5 | none in window | F49 | W |

Reasons these stay out, beyond the decision:

- GS exec 9: nothing public supports writing to G-series cars from an open tool. Signature checks and gateway authentication exist (GS exec 3, 5; high that they exist, low for exact reach).
- LG exec 2: EU delegated act lets carmakers demand tool authentication for anything that changes the car; a free tool will not get credentials by default (high, primary text read).
- The owner has one car family (DR A1). R3 evidence would come from one test car.

---

## 6. R4: other brands (6 features)

Goal: do not promise Toyota or Mercedes. Ship honest, read-only, cross-brand basics and a clear "locked" message. DR §7: no Mercedes or Toyota features beyond a documented read-only "not yet", except the A90 Supra on BMW's platform. MT confirms the evidence is thin.

| Rank | ID | Feature | Job (plain English) | Who wants it, evidence | Class | Adapters | Risk | Days | KPI | Depends on | Cut |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | F58 | Locked-car explainer | Tell Mercedes 206 and 223 series, and newest Toyotas, what is not readable and why | MT exec 3: "pure DoIP" series from 206 and 223 with personal login for workshop tool (medium); CF gap rank 11 | - | none | T0 | 2 | G9 | F20 | S2 |
| 2 | F55 | Cross-brand generic pack and OBDb signal import | Basic faults and named live values on any OBD-II car | CF gap rank 6: free Mercedes and Toyota basics. Crowded (DR §5 B). OBDb is CC-BY-SA, Z3 only | R | Any | T2 (licence zone) | 4 | G9, G11 | F11, F32, F13 | S2 |
| 3 | F57 | A90 Supra and MINI on the BMW stack | Same scan and snapshot on BMW's platform cars | DR §1 S6: A90 Supra sits on BMW's platform (medium). BimmerCode and BimmerLink list Supra and MINI (CF §3.4, high). No test car | R | ENET | T1 | 3 | G9 | F06, F26 | C2 |
| 4 | F56 | Toyota and Lexus enhanced reads | Read hybrid, ABS, EPS, SRS values on older Toyotas | Forum users report enhanced reads on a 2006 Prius with common apps (MT exec 4, medium to low). Techstream: $80 for 2 days or $1,500 a year (MT exec 2, medium) | R | ELM, CX | T2 | 5 | G9 | F55 | C1 |
| 5 | F60 | Toyota and Mercedes fault-text seed packs | Seed 60 to 100 Toyota/Lexus and 30 to 100 Mercedes codes in our own words | DC §0 est. (low). Needs sources; no clean public text | - | none | T0 | 4 | G6 | F33, F34 | C1 |
| 6 | F59 | Mercedes older-series module fault read | Read faults on older Mercedes modules | MT exec 8: only if clean-room data can be sourced; not established. One open Mercedes project lists a component removed after a DMCA notice (MT exec 7, medium) | R | ELM | T2 | 8 | none | F55 | W |

Notes on R4:

- No test car for any of this. Each feature would be a claim we cannot back with a saved trace (G1 counts only traced sessions). Treat F55 to F60 as "documented not-yet", not product.
- F58 is the only R4 feature that is both cheap and honest on day one.

---

## 7. MoSCoW summary

| Class | Count | Days | What it holds |
|---|---|---|---|
| **Must** | 28 | 104.5 | R0 core (F01, F02, F03, F05, F06, F07, F08, F09, F10, F12, F17, F18, F19, F22), R1 core (F26, F27, F28, F30, F31, F32, F33), R2 safety and proof (F40, F41, F42, F44, F45, F46, F48) |
| **Should** | 17 | 58.5 | F04, F11, F13, F14, F16, F20, F23, F29, F34, F36, F37, F39, F43, F47, F49, F55, F58 |
| **Could** | 10 | 32.5 | F15, F21, F24, F25, F35, F38, F50, F56, F57, F60 |
| **Won't (this window)** | 5 | 34 | F51, F52, F53, F54, F59 |
| **Total** | 60 | 229.5 | Check: 104.5 + 58.5 + 32.5 + 34 = 229.5 |

Must by release:

| Release | Must IDs | Days |
|---|---|---|
| R0 | F01, F02, F03, F05, F06, F07, F08, F09, F10, F12, F17, F18, F19, F22 | 48 |
| R1 | F26, F27, F28, F30, F31, F32, F33 | 32 |
| R2 | F40, F41, F42, F44, F45, F46, F48 | 24.5 |
| Total | 28 | 104.5 |

Load against capacity:

| Period | Must work due | Capacity at about 65 engineer-days over 12 weeks | Verdict |
|---|---|---|---|
| By M1 Dec 18 (3.5 working weeks) | R0 Must, 48 days | about 19 days | Over by about 29. M1 as written will not hold at my estimates |
| By M2 Jan 8 | adds R1 Must, 32 days (80 total) | about 35 days | Over by about 45 |
| By M3 Jan 15 | adds F40, F41, F42, F44, F45, F46 (about 20) | about 43 days | Over by about 57 |
| By M4 Feb 12 | adds F48, then F49 if the bench arrives | 65 days | Over by about 40 |

Plain reading: either my estimates are about 60% too high once Claude drafts the code, or the milestones slip, or the ladder below fires early. I do not know which. This is the single most important number in this file to re-measure on Dec 4 (end of week 2) rather than Dec 18.

---

## 8. Friday cut ladder

Decision 3: no cuts now; each Friday the `kpis.md` scoreboard decides. This ladder says what goes first, in what order, what each cut frees, and which KPI pays. Rule: cut from the top of the ladder down; never skip a rung without writing down why in the Friday note. Fire the next rung when any Must KPI is behind on two Fridays running.

| Rung | Cut | Days freed | Cumulative days left in scope | Which KPI or milestone suffers |
|---|---|---|---|---|
| 0 | Starting point (60 features minus the 5 Won't, plus 5 days of plan extras: Capacitor memo, Windows and Linux CI builds) | 0 | 200.5 | none |
| 1 | The plan extras: Capacitor read-only memo, Windows and Linux builds (AV2 cut order 1 and 2) | 5 | 195.5 | Platform memo; G9 reach beyond Mac |
| 2 | All Could: F15, F21, F24, F25, F35, F38, F50, F56, F57, F60 (also covers the AV2 cut items "chart polish" and part of "Demo polish") | 32.5 | 163 | No chart view (table stays); no pre-purchase report; no clear faults on bench; no feedback loop |
| 3 | R4 Should: F55, F58 | 6 | 157 | G9 "other brands" story; keep a one-line "not yet" in the README |
| 4 | UI polish and cheap extras: F37, F47, F20, F36 | 10.5 | 146.5 | N2 reports; typed confirm becomes a plain confirm on the bench |
| 5 | Data and quality-of-life: F39, F29, F34 | 15 | 131.5 | G6 slows (no contributor pipeline); G7 drops to unnamed raw fields; link tests fewer |
| 6 | Write engine extras: F43, F49, F16 | 15 | 116.5 | G4 stays sim-only (bench not reached); G5 claim loses the writer-process layer; no Demo car (G8, G9 hurt) |
| 7 | Read-side Shoulds: F13, F14, F11, F04, F23 | 12 | 104.5 | Named live channels and CSV (the hook); troubleshooter; G3 on generic only |
| 8 | Reduce Must: F19 desktop app to CLI plus browser tab on the daemon (-6), F45 to 4 scenarios (-2), F07 to capability statement if A2 fails (-5) | 13 | 91.5 | G8 (app for non-engineers) and G3 slip; G4 trial thinner |
| Floor | Never cut (AV2 §12): F17 simulator, F42 verified-backup gate, F44 kill-and-recover, F40 built-artifact audit, F02 capability report, F30 export bundle. Plus F06, F09, F26, F27 | n/a | about 55 to 60 days | If these do not fit, the milestone dates move, not the safety rules |

Rung 8 still leaves about 91 days of Must against 65. That is deliberate: I will not shrink the list below what the KPIs need on paper. If rung 8 fires and the burn rate still says "behind", the choice is to move M3 and M4 dates, not to cut F42, F44 or F40.

Ladder triggers worth pre-agreeing:

| Signal | Do this |
|---|---|
| CX reaches engine module only (A2, week 1) | Fire rung 8 item F07 now; G3 re-defined on the engine read; recommend ENET first |
| Fewer than 30% of the owner's fault codes have any source (A4) | Fire rung 5 F34 early; lead with module and status over text; lower G6 |
| First two snapshots a day apart do not match (A8) | Keep F28 volatile-field masking; slip F38 and F37 |
| Bench module not delivered by Jan 29 | Fire rung 6 F49 and F43; say "sim only" in M4 |
| Electron prompts for Bluetooth or local-network permissions behave differently from Terminal (AV2 R3) | Rung 8 F19 to CLI plus browser tab on the daemon, earlier than week 4 |

---

## 9. KPI coverage

Which features serve which KPI. A KPI with only one or two features is fragile.

| KPI | Serving features (Must in bold) | Fragile? |
|---|---|---|
| G1 real-car sessions | **F01, F05, F06, F09, F12, F18**, F11 | No, but depends on car access |
| G2 ENET scan under 4 s | **F06, F08, F17**, F39 | F08 is tiny but essential; no incumbent baseline exists |
| G3 quick read on cheap adapters | **F07, F08, F12**, F11, F13 | Yes: A2 unresolved; the WiFi ENET adapter is not an ELM device so G3 uses the CX (`kpis.md` evidence update) |
| G4 write-restore round trips | **F41, F44, F45, F48**, F49 | Bench module arrives late; sim fidelity |
| G5 cannot write unsafely | **F40, F42, F44, F46**, F43 | Same-language writer accepted (AV2 R4) |
| G6 faults in plain English | **F10, F33**, F29, F34, F35, F60 | Yes: data-bound; no clean BMW source (EV, DC) |
| G7 modules backed up | **F26, F27, F28**, F29, F37 | Needs real cars and CX reach |
| G8 clone to first read | **F19, F22**, F04, F16, F23 | Two timed paths (AV2 D-17) |
| G9 outside people | **F30**, F02, F16, F36, F35, F20 | Weak: no verified outreach channel (DR §12) |
| G10 finish without retry | **F01, F03, F18, F46**, F39, F36 | Unmeasured everywhere; measured from week 2 |
| G11 clean contributions | **F31, F32, F30**, F23, F34 | Native BLE module licence scan |
| G12 cash under $200 | F49 (bench $100 to $150); no feature costs cash | n/a |

Two honest observations:

- **G9 has no Must feature that is a feature of the product.** Outside users come from the Demo car (F16, Should) and the export bundle (F30). If rung 6 fires, G9 loses its easiest door. Consider moving F16 up one rung in the ladder if the scoreboard says G9 is the KPI at risk.
- **G6 is the only KPI mostly outside engineering.** DC estimated 280 to 545 hours for fault coverage in 12 weeks against about 45 budgeted (DC §0 point 9, est., low). F10 and F33 deliver the machinery and generic text; BMW manufacturer text comes from captures and contributors, not code.

---

## 10. What we will NOT build

Each line has a reason and a source. These are refusals, not deferrals, unless the reason says "this window".

| # | Not building | Why | Source |
|---|---|---|---|
| 1 | Engine or transmission flashing, tune files, unlock paths | Newer BMW engine computers are locked by design; an unlock path is a circumvention tool; tuning draws the strongest legal attention | EV #7 (high), DR §7, LG 12.1 row 12 |
| 2 | Emissions-related features: DPF, EGR, SCR or catalyst changes, readiness spoofing, delete maps | Clean Air Act penalties (up to $4,527 per violation per EPA, page updated May 2026, medium-high); likeliest trigger for store and payment trouble | LG exec 3, LG 12.1 row 11 |
| 3 | Immobiliser, key learning, gateway or secure-diagnostic bypass | Theft route; trafficking exposure; protected in the EU | LG 12.1 row 13, DR §7 |
| 4 | Airbag, restraint, brake, steering, stability, driver-assist coding | Physical injury and "make inoperative" risk | LG 12.1 row 8, deny-list 12.2 |
| 5 | Odometer or mileage write | Federal and EU odometer rules. A read-only mileage cross-check is not in R0 to R4 either: no identifiers established and the demand is one comment | LG 12.1 row 10, UJ §2.3 (low) |
| 6 | Speed limiter and speed-warning removal | Strong legal and safety edge; 70k and 55k views are not worth it | UJ §4 rank 11 (C), LG |
| 7 | Video in motion and similar unlocks | Distraction and road-use law; three sellers already do it with disclaimers; stays out unless a later decision says lab only | UJ §4 rank 7, LG 12.1 row 9 |
| 8 | Head unit, gateway or full-car programming | Worst recorded outcomes and least public recovery | DR §7 |
| 9 | Shipping, linking, reading or requiring OEM software, seed-key material, leaked data or GPL and non-commercial source | Clean-room rule; trafficking law; EdiabasLib and others are learn-only | OS exec, LG deny-list 4 |
| 10 | Copying BimmerCode's catalog or wording | It is their product; we build from our own captures | DR §7 |
| 11 | Subscriptions, credits, ads, silent feature removal, accounts | Loudest complaint category (Carly 40% one-star of 17,650 Trustpilot reviews; credits deducted for failed jobs in OBDeleven; medium) and against the project promise | CF exec 4, DR §7 |
| 12 | Cloud upload or default-on telemetry | Trust is the pitch; VIN is personal data in the EU; off by default and opt-in per upload at most | LG 12.1 row 14, DR §7 |
| 13 | Claims of "cannot brick", an approved-adapter list or flash success rate we have not measured | Nobody publishes the numbers; BimmerCode's phrasing is defensible only with a definition | EV #5, UX X4 |
| 14 | A severity score or AI fault verdict without a source | We have no clean fault text; a new entrant (BimmerFix, iPhone only, one listing review) sells AI fault analysis at high price (low-medium) | UX X11, CF §8 |
| 15 | "Expert mode" raw editing without a typed gate and hard-block list | BimmerCode withholds it on safety units | UX X12, UX 2.1 |
| 16 | Auto-update of packs into write-capable state | Staged rollout lesson | UX X15 |
| 17 | Names, logos or look-alike icons that imply an OEM link | Nominative use only | LG deny-list 5, DR §7 |
| 18 | Repair manuals, wiring diagrams, guided test plans | ISTA and its data sit behind BMW licensing; cannot be done cleanly | CF §10 closing note |
| 19 | VAG, Ford and other brands' coding | No test cars; DR §7 scope | CF §3.4, DR §7 |
| 20 | A phone app, iPhone app or TestFlight in this window | ENET weakest on phones; $99 fee breaks G12; owner answer to D0 pending | AV2 §4.2 |
| 21 | Real-car writes, including clear fault codes on a real car, in this window | Owner decision 2 | `decisions.md` |
| 22 | A tune-file hosting or link directory | Legal deny-list | LG 12.2 point 6 |
| 23 | Remote-started writes (a cloud message triggers a write) | A person at the machine must start every write | LG 12.2 point 7 |
| 24 | Short-term "pre-purchase buyer" marketing to non-BMW buyers | Evidence for a BMW pre-purchase wedge is weak; audience is unfocused | UJ §6.2 |

---

## 11. Dependency map

```
F01 connect --+--> F06 scan --> F09 faults --> F10 plain English <-- F33 generic text <-- F31 packs <-- F32 zones
              |        |            |
              |        |            +--> F25 start-stop view (speculative)
              |        +--> F08 timing
              |        +--> F26 snapshot --> F27 store --> F28 diff --> F38 compare, F41 plan
              |                                  |
              |                                  +--> F42 backup gate --> F44 journal --> F48 verify and revert --> F49 bench
              +--> F03 link and power --> F46 voltage gate
              +--> F07 CX scan (A2 risk)
F17 simulator ---> F45 scenarios, F16 demo, every test
F40 lab split ---> F43 writer process
F31 packs --> F13 OBDb channels --> F55 cross-brand
```

Critical chain for the KPIs that matter most: F01, F17, F06, F09, F26, F27, F42, F44, F48. If any of these slips, M3 slips.

---

## 12. Risks specific to this plan

| # | Risk | Effect | Mitigation |
|---|---|---|---|
| FR1 | Must load is about 40 days over capacity at my estimates | Milestones slip or ladder fires | Re-measure burn at Dec 4; rescale; ladder section 8 |
| FR2 | No demand count exists for any feature | Ranking is inference (grade B or C) | Owner asks 5 BimmerCode or BM3 users in week 1 (A5); re-rank R1 after answers |
| FR3 | Fault-text data bottleneck | G6 misses | F10 shows "no description yet"; report G6 per source |
| FR4 | CX reach (A2) | F07 and G3 shrink | F02 reports it plainly; ENET-first story |
| FR5 | Newer cars refuse some reads | G7 low | F20 and F02 explain; use older chassis if the owner has one |
| FR6 | Read allow-list may need `10 03` for coding reads | Safety decision on the public build | Capture first; reviewer decides; default no |
| FR7 | Owner is a single test user | G1 and G7 numbers from one car | G9 target 3 non-owner scans (direction.md §9.2) |
| FR8 | Clear-faults placement unsettled | Scope change of 2 days | Q5 decision; this file follows AV2 |
| FR9 | OBDb-derived channels (F13, F55) pull in share-alike data | Licence mixing | Zone checks F32; Z3 never in installer; counsel check before release |
| FR10 | Boostline (MIT, TypeScript, ENET logging, read-only) overlaps R0 live logging | Duplicate work | Read its README and issues in week 1 (A6); contribute upstream if it covers scan |

---

## 13. Suggested build order (weeks 1 to 4)

This is the order inside R0 that gets M1 earliest, not a commitment.

| Week | Features | Exit check |
|---|---|---|
| 1 (Nov 26 to Nov 30) | F17 baseline (exists), F01 on loopback, F05, F18; CX probe for A2 | G-A Dec 1; owner answers D0 and adapter models |
| 2 (Dec 1 to Dec 7) | F06 sim, F09, F08, F02 skeleton; first real CX and ENET sessions | First G1 traces; burn-rate check |
| 3 (Dec 8 to Dec 14) | F03, F10 with generic text path, F12, F19 shell skeleton, F07 | G-B Dec 11: sim 40-ECU scan under 2 s |
| 4 (Dec 15 to Dec 18) | F22, F04 if time, F16 if time, F26 start | **M1 Dec 18**: G1 at least 3, G2 and G3 week-4 targets |

---

## Sources

No new external pages were fetched for this document. External facts are relayed from repo research notes at the confidence those notes gave them. URLs below are ones those notes list; I did not reopen them.

| ID | Source | Used for | Confidence |
|---|---|---|---|
| S1 | `docs/plan/decisions.md` | Owner decisions 1 to 7, hardware, bench module | high |
| S2 | `docs/plan/kpis.md` | G1 to G12, milestones, quality gates | high |
| S3 | `docs/plan/direction.md` | Segments, jobs, evidence grades, assumptions A1 to A10, will-not list | high for the doc; medium for its inputs |
| S4 | `docs/plan/architecture-v2.md` | Packages, safety layers L0 to L5, cut order, never-cut list, plan weeks | high (judge's synthesis, medium for its scores) |
| S5 | `docs/plan/dtc-coverage-strategy.md` | Fault-text levels, hour estimates, 12-week and 1-year targets | medium (estimates are low) |
| S6 | `docs/research/deep/EVIDENCE.md` | Corrections; summary points 1 to 10 | high |
| S7 | `docs/research/deep2/user-jobs-and-demand.md` | Ranked jobs, view counts, comment tallies, read/write table. Primary sources it lists include public YouTube search pages (counts as seen 2026-11-20) | medium |
| S8 | `docs/research/deep2/competitor-feature-inventory.md` | Feature matrix, gap list. URLs it lists: https://apps.apple.com/us/app/id1130787459 (BimmerCode store), https://www.bimmercode.app/adapters/ (adapters), https://www.trustpilot.com/review/obdeleven.com and https://nz.trustpilot.com/review/www.mycarly.com (review themes) | medium (affiliate and store pages) |
| S9 | `docs/research/deep2/ux-teardown-and-safety-ux.md` | Do/do-not patterns D1 to D20, X1 to X18, write flow. Text-only sources; apps were not run | medium |
| S10 | `docs/research/deep2/legal-safety-liability.md` | Gating matrix, deny-list, EU delegated act, DMCA, Clean Air Act | medium to high |
| S11 | `docs/research/deep2/bmw-g-series-coding-reality.md` | Newer-car limits | medium (low for reasons) |
| S12 | `docs/research/deep2/adapter-and-transport-constraints.md` | CX limits, browser limits, phone limits | high to medium |
| S13 | `docs/research/deep2/mercedes-and-toyota-reality.md` | Access to Mercedes and Toyota | medium to low |
| S14 | `docs/research/deep2/open-source-reuse-map.md` | Licence classes; no licensed BMW coding database | medium |
| S15 | `docs/research/deep2/ui-library-landscape.md` | UI stack and uPlot facts | medium |
| S16 | `docs/research/deep2/dtc-*.md` (executive parts) | Coverage levels and datasets (only the BMW and generic parts skimmed) | medium |

Not read for this file: `deep2/dtc-crowd-curation-model.md` body, `deep2/dtc-mercedes-coverage.md`, `deep2/dtc-toyota-lexus-coverage.md`, the three proposal files in `docs/plan/proposals/`, and the 24 older `docs/research/deep/*.md` notes beyond what EVIDENCE.md relays.

## Gaps (what could not be established)

1. **No measured demand.** Every "who wants it" cell is a view count, a comment tally, a vendor listing or inference. UJ could not reach Reddit, Bimmerpost, Google Trends or Google Play counts (UJ §1.2). A5 (ask 5 users) is the first real data.
2. **No measured effort.** Day counts and the 65-day capacity are my estimates. The ratio of 2.4 engineer-days per owner-day is a guess. First measurement: Dec 4.
3. **CX reach (A2).** Whether the CX talks to body modules is unmeasured. F07, G3 and G7 hang on it.
4. **Extended session need.** Whether coding reads on the owner's cars need session control beyond `10 01` is unknown; it decides F26's risk tier and a public-allow-list change.
5. **Battery, service and start-stop identifiers.** UJ §6 found none in any source. F25 is speculative and R3 items F52 and F53 would need them.
6. **BMW fault-text sources.** No clean public text. DC numbers are estimates (low).
7. **Newer cars (G-series, iDrive 8 and 8.5).** Mostly background knowledge, labelled unverified (GS, EV). F20 text depends on a real capture.
8. **ENET framing details.** Discovery bytes, acknowledge handling and keepalive unknown until a capture (EV #3). F01 and F06 timing assume they can be captured on Nov 25.
9. **Writer-process acceptance.** No evidence that a reviewer accepts same-language isolation (AV2 gap 8). F43 stays Should.
10. **Clear faults policy.** LG and AV2 disagree; owner decision Q5 outstanding.
11. **Demand for a "second tool".** The whole R1 value story rests on owners wanting a free read tool beside BimmerCode (DR A5), untested.
12. **UI details.** Component choices come from the UI landscape note and are locked by a later UI design doc, not here.
13. **Mercedes and Toyota.** Both notes say their forum and practice evidence is thin. R4 is documentation, not a commitment.
