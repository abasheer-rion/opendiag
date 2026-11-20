# OpenDiag: 12-week project plan

Status: plan v0.1, written 2026-11-19 (before more code). Window: Mon 2026-11-23 to Fri 2027-02-12, 12 weeks. Clean-room rule unchanged: public standards, public docs, owner captures and open-source projects only; no leaked OEM software or data. Not legal advice. Prices marked (est) are estimates; the rest come from `resources.md` (which marks its own sources).

This is the master schedule. It sits on four inputs and does not repeat them:

| Input | Role in this plan |
|---|---|
| [architecture-12wk.md](architecture-12wk.md) | Architecture, ADR-001..012, interfaces, gates G-A..G-F, performance budget. Source of the week skeleton. |
| [resources.md](resources.md) | Hardware, services, people, cash by month. |
| [data-strategy.md](data-strategy.md) | Data channels, extraction tools, 200 DTC / 30 DID / 20 coding-option bootstrap. |
| [oss-leverage.md](oss-leverage.md) | What we adopt, wrap, port or only read. |
| [../design/roadmap.md](../design/roadmap.md) | Phase list and acceptance tests that milestones here reuse. |

Verified again on 2026-11-19/20 for this pass (GitHub REST API): OBDb/BMW-3-Series CC-BY-SA-4.0, pushed 2026-11-20; pylessard/python-udsoncan MIT, pushed 2026-10-26; pylessard/python-can-isotp MIT, pushed 2026-11-10; mercedes-benz/odxtools MIT, pushed 2026-11-17; stoprocent/noble MIT, pushed 2026-11-10; Wal33D/dtc-database MIT, pushed 2026-02-16 (stale, audit before use). Source: `https://api.github.com/repos/<owner>/<repo>`. Code baseline: `node --test` 27 pass on Node 26.5.0; tree clean at commit `864d2c2` (local Node 26.5.0, CI pinned to Node 24: run the suite on both in W1.6) (the in-flight work noted in architecture-12wk.md section 1 is now committed).

## 0. Conflicts between inputs, and how this plan resolves them

| # | Conflict | Resolution used here |
|---|---|---|
| C1 | `design/architecture.md` says Rust core; code is TypeScript; Rust not installed. | ADR-001 stands: TypeScript through week 12, sans-IO seams, language-neutral test vectors. Rust spike only on the four triggers in ADR-001. Banner on `architecture.md` section 4 is task W1.9. Owner approves at decision P1. |
| C2 | Owner hours: 15 h/wk (architecture), 10 h/wk (resources D2), about 8 h/wk of that for data (data-strategy 7.4). | Plan for **12 h/wk = 144 h**. Below 10 h/wk for two weeks running triggers the cut list (section 10). Claude capacity assumed 25 to 40 agent-hours/wk (resources 4.2); this plan books about 41 on average (section 5.13), so it is over capacity by design and relies on the cut list and float. |
| C3 | Goal includes gated writes. Roadmap Phase 4 allows real-car writes; architecture-12wk.md G-F says no real-car write exists in any build. | Writes land in three steps: engine on simulator (M3, wk 8); on a **bench ECU** only (wk 11); on the owner's own car for at most **3 allowlisted comfort options**, only inside a separate `v0.2.0-beta.2`, only if decision P11 passes (human reviewer signed off, bench revert proven). `beta.1` ships with real-car writes compiled out. G-F wording is amended accordingly. |
| C4 | Legal timing: data-strategy wants a 1 h consult in wk 2-3; architecture says "before wk 12"; resources budgets $750 in Feb. | Two touches: 1 h scoping call in wk 3 (data rules, name search), full review wk 11 before any public pack. Both fit the $750 line (split about $250 / $500, est). |
| C5 | Signing keys: architecture wants them before wk 6; data-strategy builds a signed pack wk 8; resources buys YubiKeys in M3 (D6). | Dev Ed25519 key in macOS Keychain, created wk 6 after owner approval at P5 (dev-box rule: ask first, add a row in `~/.claude/CREDENTIALS.md` in the same step). Packs signed with it are marked `dev`. Release root on a YubiKey bought wk 10, used wk 11 for beta tag and pack v0.1. |
| C6 | Bench ECU: resources says buy M2 W1 (Jan 4); architecture says decide wk 8. | Decide wk 5 (P6), order by Dec 28, so it arrives by Jan 8 and is wired in wk 7 with the electronics advisor. Wk 8 is too late for wk 9 to 11 use. |
| C7 | Pack tooling language: data-schema.md section 6 says Python; data-strategy D2 says TypeScript. | TypeScript (data-strategy D2, ADR-001). Pack JSON stays language-neutral. |
| C8 | Data-strategy wants a downloadable public pack in wk 11; architecture puts a public pack index out of scope. | Pack v0.1 is a signed GitHub Release asset on `opendiag-packs`. No index, no accounts, no Supabase. |
| C9 | Month vs week labels: resources uses M1/M2/M3 for Dec/Jan/Feb; roadmap uses M0.1..M4.5 for phase milestones; architecture uses G-A..G-F. | This plan: milestones **M1..M4** (section 6) are new and map to gates (table 6.0). Resources months are written "Dec/Jan/Feb". Roadmap milestone ids are always written with the phase prefix (M1.1 etc.) and appear only as acceptance-test references. |
| C10 | Hardware ordering: resources "Week 0" buys vs architecture "order in week 1". | Everything Must is ordered in the first 48 hours (Mon 23 and Tue 24 Nov). Arrival of the ENET cable by Dec 4 gates the first real capture (wk 2 stretch, wk 3 firm). |
| C11 | Pi 5 HIL runner (resources S5, wk of Jan 11) vs HIL only on trusted branches (architecture T9). | Order S5 wk 8 (Jan 8), set up wk 10; first on the cut list because wk 11 qualification can run from the Mac. |
| C12 | Phone/BT: Classic-BT clones unreachable from Capacitor BLE plugin (oss-leverage R3). | Mobile in this window is spike only (wk 10). Supported adapter paths for users in 12 weeks: ENET, WiFi ELM/STN, USB ELM/STN on desktop, BLE on desktop via noble. |

## 1. Vision and non-goals

Vision (12 weeks): one open tool, runnable from a laptop with `node` and a cable, that is faster than the incumbent apps at finding faults, shows the car the way ISTA does (vehicle tree, modules, faults with plain text, live values with names, coding blocks with named options), and can safely back up, inspect and diff coding. Writes exist but are gated, journalled and revertible, and enabled for a tiny verified allowlist only.

Four product goals, each with a one-line definition of "done" at week 12:

| Goal | Done means |
|---|---|
| G1 Fast and modern fault reading | Plug in, tap scan, see every module and its faults with plain text in 2 s p50 over ENET and 12 s p50 over WiFi ELM (budget from architecture-12wk.md 6.1, replaced by measured numbers in wk 11). Works as CLI, local web UI and desktop shell. |
| G2 ISTA-style module data | Vehicle tree; per module: identity (part number, software, hardware), fault memory with status bits, named live values, raw and named coding view, all from signed packs with provenance. Unknown software level shows raw bytes and "no description", never a guess. |
| G3 Safe coding | Backup with re-read and hash match, bundle export/import, diff of two backups, field suggestion from diffs, gated write of an allowlist (at most 3 options) with journal, read-back and auto-revert. Proven on simulator (wk 8) and bench ECU (wk 11). |
| G4 Adapters and links | ENET (HSFZ) and DoIP, WiFi and USB ELM327/STN, desktop BLE; a published capability report per qualified adapter (at least 2 models; targets OBDLink MX+, vLinker MC+, generic clone as negative test, ENET cable). |

Non-goals (do not work on these in the window; they stay on the roadmap):

- Flash or reprogramming (ECU software), FDL-style free-form coding, Mercedes writes or authorisation, Toyota customise writes, K-line / K+DCAN support (cable bought for later only), J2534 and SocketCAN as shipped backends, cloud accounts, sync, public pack index, store releases on iOS or Android, third-party code plugins.
- Anything on the refusal list: airbag/SRS, immobiliser and key defeat, emissions defeat, odometer or speed-limiter changes, leaked seed/key algorithms.
- Copying anything from GPL tools (EdiabasLib, python-OBD, OpenVehicleDiag) or from the non-commercial ELM327-emulator; reading OEM portals to copy text (tainted-reader rule, data-strategy section 8).
- Beating paid tools on breadth of cars. We aim for depth on two chassis families.

## 2. Success metrics

Measured at the milestone named. "Sim" means simulator with injected latency; "real" means the physical adapter and car or bench ECU.

| # | Metric | Target at wk 12 | Floor (cut-list outcome) | Measured | Source of target |
|---|---|---|---|---|---|
| S1 | ENET full module scan, p50 / p95 | 2 s / 4 s real; sim 40 ECUs, 20 ms latency under 2 s p50 in CI | 4 s / 8 s real | wk 3 sim, wk 11 real | architecture-12wk.md 6.1 |
| S2 | WiFi ELM module scan p50 | 12 s | 25 s | wk 3 sim, wk 11 real | same |
| S3 | Quick OBD read (VIN + 3 DTC kinds + 10 PIDs), WiFi ELM, p50 | 3 s | 6 s | wk 11 | same |
| S4 | Connect and init, WiFi ELM/STN, p50 | 1.5 s | 3 s | wk 11 | same |
| S5 | Data pack content | 200 DTC, 30 DID, 20 coding options, 2 address maps | 120 DTC, 20 DID, 10 options, 1 map | wk 11 | data-strategy 7.1 |
| S6 | Every pack entry has provenance and a `tested_on` or an explicit `unverified` | 100% (lint-enforced) | 100% | every PR | data-schema.md |
| S7 | Entries at `high` confidence (two testers) | 10 | 5 | wk 9 | data-strategy 7.3 |
| S8 | Write-path gate G-D scenarios (8 fault scenarios + 5 roadmap Phase 4 cases) | 13 of 13 green; property test never ends in "unknown" | same, no cut | wk 8 | architecture-12wk.md 8.3 |
| S9 | Real-car writes without a valid WriteToken | 0 possible (tested) | 0 | wk 8 onward | ADR-010 |
| S10 | Fuzz: decoders, journal parser, pack loader | 1M inputs each, no crash | 100k each | wk 3 (100k), wk 12 (1M) | roadmap Phase 0 |
| S11 | Test count / coverage | at least 250 tests (est; baseline 27); safety package at least 90% lines | 150 tests; 80% | weekly | estimate |
| S12 | Adapters qualified with published capability report | 4 reports (MX+, vLinker, clone, ENET) | 2 | wk 11 | G-F |
| S13 | Real-car sessions captured and stored as `.odtrace` | 8 sessions on 2 chassis, 2+ cars each | 4 sessions, 1 chassis | wk 12 | resources 2.4 |
| S14 | External humans engaged | 1 safety reviewer signed off; 1 second-maintainer candidate; 5 volunteers contacted by Dec 18; 3 external PRs or pack reports merged (stretch) | reviewer only | wk 12 | resources 4.2 |
| S15 | Web UI initial JS | under 150 KB gzip | 250 KB | CI from wk 4 | architecture-12wk.md 6.1 |
| S16 | Cash spent | at most $2,203 (recommended) plus contingency $200 | Must-only $638 | monthly | resources section 6 |
| S17 | Beta shipped | `v0.2.0-beta.1` with checksums, user guide, contributor guide, pack-authoring guide | tag and checksums only | wk 12 | G-F |

## 3. Capacity and assumptions

| Item | Value | Note |
|---|---|---|
| Owner | 12 h/wk, 144 h total | Needs: cars, bench, review, decisions. About 24 h of that is car time (resources 4.3). |
| Claude | about 41 agent-hours/wk booked (495 total; 25 to 40 assumed capacity, unmeasured) | Sized in agent-hours, not elapsed time. Each task has a written interface (architecture-12wk.md section 5) before it starts. |
| Reviewer (write path) | 6 h in Jan, 10 h in Feb | Name by Jan 4 (P7). If none: paid review $50 to $100/h (est) inside the $750 legal/review line is not enough; fall back to rule "writes stay off". |
| Electronics advisor | 4 h in Dec, 2 h/month after | Required before the bench supply powers any module. |
| Community | unpaid, from wk 4 | Hour totals in the weekly tables count volunteers as `V` but they are not relied on. |
| Calendar | Holiday risk wks 5 and 6 (Dec 21 to Jan 1) | Wk 5 is booked at 8 owner hours; wk 6 at 10. Claude-heavy tasks fill the slack. |
| Hours in tables | `O` owner, `C` Claude, `R` reviewer or advisor, `V` volunteers | Per task estimates, summed per week and in section 5.13. |

## 4. Tracks, critical path and parallelism

### 4.1 Tracks

| Track | Scope | Primary doer | Packages / repos |
|---|---|---|---|
| T-core | Errors, transport v2, scheduler, session, discovery, scan, safety engine, live data, step language | Claude | `core`, `session`, `safety`, `sim`, `bench` |
| T-adapt | ELM tuning, ENET/HSFZ/DoIP real framing, BLE, qualification, capability reports | Claude + owner (hardware) | `adapters-node`, `adapters-web`, `docs/hardware` |
| T-data | Captures, linter, pack schema, resolver, signing, DTC/DID/coding entries, `opendiag-packs` | Owner (captures) + Claude (tooling, drafts) | `packs`, `opendiag-packs` repo |
| T-ui | Daemon, web UI (vehicle tree, scan, faults, live, coding diff, txn progress), desktop shell, mobile spike | Claude | `daemon`, `api`, `apps/web`, `apps/desktop`, `apps/mobile` |
| T-infra | CI gates, licence scan, bench in CI, release train, keys, signing, repo hygiene | Claude + owner approvals | `.github/`, `scripts/` |
| T-comm | Reviewer, volunteers, forum posts, contribution guide, second maintainer, counsel | Owner | `CONTRIBUTING.md`, Discussions |

### 4.2 Weekly track map (what is in flight; `G` = gate)

| Wk | T-core | T-adapt | T-data | T-ui | T-infra | T-comm |
|---|---|---|---|---|---|---|
| 1 | errors, split, `.odtrace` | order hardware | repo `opendiag-packs`, SOURCES.md | | boundary script, licence scan, coverage (G-A) | cars/adapters list, reviewer outreach |
| 2 | transport v2, scheduler, session | ENET cable arrives, pin-8 check | capture recorder v1, linter skeleton | | CI bench stub | forum post 1 |
| 3 | discovery, scan, cache (G-B) | ELM probe and profiles; first real HSFZ capture | address maps, 60 DTCs | | bench in CI, fuzz 100k | counsel scoping call |
| 4 | | `opendiag` real ELM and ENET runs | 5 coding captures | daemon v0, web skeleton (M1) | daemon security tests | 5 volunteers contacted |
| 5 | store, audit, backup/restore | | 5 more coding, 60 DTCs | diff view | bundle format | holiday, light |
| 6 | | | pack v1, loader, signing, resolver (G-C) | vehicle tree v1 | dev key, pack CI | counsel feedback |
| 7 | WritePlan, Journal, Gate, token | | family B coding, induced faults | | `GuardedTransport` rule in boundary check | reviewer named, bench wired |
| 8 | FaultScript, 8 scenarios (G-D) | | live-data DIDs, U-codes, pack build in CI | | review package, S5 order | reviewer starts |
| 9 | live data, voltage gate, step engine | | retests to reach `high` | coding diff and txn UI | | volunteer retests |
| 10 | | web and mobile spikes | fixes, counts | desktop shell (G-E) | YubiKey bought, Pi 5 HIL | go/no-go memos |
| 11 | bench write trials | qualification run (G-F pt 1) | pack v0.1 signed, beta data | | release rehearsal | counsel review, P11 |
| 12 | hardening, fuzz 1M | capability reports published | audit 10%, retro data | docs | `v0.2.0-beta.1` (G-F) | retro, next plan |

### 4.3 Critical path

The path that sets the finish date is the safety path plus the one human dependency it needs:

```
W1 errors+split (G-A) -> W2 transport v2 + scheduler -> W3 scan (G-B) -> W6 pack v1 + resolver (G-C)
  -> W7 WritePlan/Journal/Gate -> W8 FaultScript + kill-recover (G-D)    [needs reviewer named by Jan 4]
  -> W11 bench write trials                                              [needs bench ECU wired wk 7, PSU, advisor]
  -> W12 beta.1 (and beta.2 only if P11 passes)
```

Parallel chain that gates data quality: owner decisions (cars, 2 chassis) wk 1 -> ENET cable wk 2 -> first real capture wk 3 -> coding captures wk 4 to 7 -> linter and resolver wk 6 -> `high` retests wk 9 -> pack v0.1 wk 11.

Float: T-ui has about 2 weeks of float (nothing downstream depends on it except the M1 demo and the G-E spikes). Platform spikes (wk 10) have 1 week of float. Pack counts have float down to the floor in S5. The critical path has none: a slip of more than one week at G-B or G-D triggers the cut list.

Known hard dependencies on people or objects:

| Dependency | Needed by | If late |
|---|---|---|
| A BMW F or G car and an owner who can spend car time | wk 3 | Switch D1 fallback (one BMW + one Toyota hybrid, data-strategy D1); data weeks slip day for day, tooling work continues. |
| ENET cable ($25, est) | wk 3 | Sim-only G-B; real capture in wk 4. HSFZ length question stays open and gets a roadmap-style risk flag. |
| OBDLink MX+ and vLinker MC+ | wk 3 (ELM profiles), wk 11 | ELM profiles written against SimElm only; qualification slips into wk 12 and the report count floor is 2. |
| Safety reviewer | wk 8 | Write code is merged but real-car and bench write stay disabled (decision P8). |
| Bench ECU + PSU + advisor | wk 7 wiring, wk 11 trials | Bench trials replaced by a documented simulator-only result; no real-car write (P11 fails). |

## 5. Work breakdown by week

Task id = week.number. `Who`: O owner, C Claude, R reviewer or advisor, V volunteer. `Hrs` is effort for that doer. `Deps` are task ids or named items. "Exit" is the check that closes the week. Gates G-A..G-F are defined in architecture-12wk.md 8.3.

### Week 1: Mon Nov 23 to Fri Nov 27. Foundation and orders

Goal: clean base, error model, package split step 1, orders placed, decisions answered. Gate G-A.

| ID | Task | Who | Hrs | Deps |
|---|---|---|---|---|
| W1.1 | First-48-hours checklist (section 12): orders, decisions P1 to P3 | O | 3 | none |
| W1.2 | Run `pnpm typecheck && pnpm test`; commit plan docs (`docs/plan/*`); remove `repos1.txt` or move to `_to_delete` after owner approval | C | 1 | none |
| W1.3 | `OdError` with stable codes, severity, retryable flag; convert `NegativeResponse`, `TimeoutError`, `BackupError`, `PackError`, `WriteBlockedError` | C | 4 | W1.2 |
| W1.4 | Package split step 1: core (pure) / adapters-node / sim; keep `core` re-exports so CLI and tests do not break (ADR-002) | C | 8 | W1.2 |
| W1.5 | `scripts/check-boundaries.ts` (node: imports, upward deps, safety internals) in CI | C | 3 | W1.4 |
| W1.6 | Licence scan script (fail on any GPL/AGPL/SSPL variant, NonCommercial or unknown licence in shipped deps; flag LGPL for review; dev-only tools are checked separately), coverage via `--experimental-test-coverage`, record baseline | C | 3 | W1.2 |
| W1.7 | `.odtrace` JSONL format (request, response, timestamps, adapter, voltage, VIN hash) plus recorder and replay transport | C | 6 | W1.4 |
| W1.8 | `SOURCES.md` template, PR and issue templates, `opendiag-packs` repo (create after owner approval), CC-BY-4.0 data licence file | C | 3 | P3 |
| W1.9 | Banner on `docs/design/architecture.md` section 4 pointing to ADR-001 and ADR-004; link this plan from `docs/README.md` | C | 0.5 | none |
| W1.10 | Capture-night protocol and consent sheet (what we read, what we never write, what leaves the machine: nothing without consent) | C | 2 | none |
| W1.11 | Answer owner questions: cars, chassis, adapters on hand, bench gear, real weekly hours (feeds P1, P2) | O | 1 | none |
| W1.12 | Post 1 request for a safety reviewer and 2 bench or ENET volunteers (friends, forum); no private data in posts | O | 2 | W1.10 |
| W1.13 | Review ADR-001 and the package split PR | O | 2 | W1.4 |
| W1.14 | Run existing CLI against own car with any ELM adapter if one exists; save raw output (first real data point, optional) | O | 2 | W1.7 |

Exit: G-A (27 tests still pass after split; boundary and licence scripts run in CI; `OdError` covers all old classes; coverage baseline recorded). Hours: O 10, C 30.5.

### Week 2: Mon Nov 30 to Fri Dec 4. Transport v2, scheduler, session

Goal: concurrency and keepalive on all four transports. No gate; exit is the passing parallel and keepalive tests.

| ID | Task | Who | Hrs | Deps |
|---|---|---|---|---|
| W2.1 | Transport v2: capabilities, per-request options, cancellation (`AbortSignal`), event stream, voltage read (architecture-12wk.md 5.1) on ELM, HSFZ, DoIP, Sim | C | 10 | W1.4 |
| W2.2 | Correlated multi-in-flight for HSFZ and DoIP (stop `inbox.clear()`); unsolicited frames to the event stream | C | 6 | W2.1 |
| W2.3 | Scheduler: priorities, injectable clock, retry policy, NRC 0x78 handling, per-target timeouts | C | 8 | W2.1 |
| W2.4 | Session: TesterPresent keepalive, loss detection, session state (10 01 / 10 03), reconnect hooks | C | 6 | W2.3 |
| W2.5 | Capture recorder v1 (`opendiag capture`: passive and guided; VIN hashed) | C | 12 | W1.7 |
| W2.6 | Pack linter skeleton (`opendiag pack lint`, rules 1 to 3: schema, provenance present, source in ledger) | C | 4 | W1.8 |
| W2.7 | Receive ENET cable, USB-C Ethernet, multimeter, breakout box; measure OBD pin 8 on the car before any wiring (sources conflict 5 V vs 12 V, resources H8) | O | 3 | W1.1 |
| W2.8 | Capture night 1 (Wed Dec 2): own car, existing adapter if any, passive scan, saved as `.odtrace`; follow protocol W1.10 | O | 3 | W2.5 draft |
| W2.9 | Bench PSU and wire list ready; ask electronics advisor for a 2 h session in wk 4 or 5 | O | 2 | none |
| W2.10 | Review transport v2 and scheduler PRs; answer what the car did in capture night 1 | O | 3 | W2.1, W2.3 |
| W2.11 | Forum post 1 and DM to 3 friends with cars (ask for capture night volunteers) | O | 1.5 | W1.10 |

Exit: keepalive holds a 60 s virtual-time session with at most 1 missed cycle; parallel request tests pass on sim for HSFZ and DoIP. Hours: O 12.5, C 46 (heavy; see risk R12; slip the linter skeleton to wk 3 first).

### Week 3: Mon Dec 7 to Fri Dec 11. Discovery, parallel scan, ELM profiles. Gate G-B

Goal: fast scan on sim, first real captures, legal scoping call.

| ID | Task | Who | Hrs | Deps |
|---|---|---|---|---|
| W3.1 | Discovery: HSFZ UDP broadcast, DoIP vehicle identification; listen window per architecture-12wk.md 6.1 | C | 6 | W2.2 |
| W3.2 | Parallel module scan (16-way, 150 ms silence ENET, 300 ms ELM), candidate pruning from pack ranges and last scan | C | 8 | W2.3, W3.1 |
| W3.3 | Scan cache keyed by VIN hash; ELM capability cache per adapter model and firmware | C | 4 | W3.2 |
| W3.4 | ELM probe and tuning profiles (`ATE0 ATL0 ATS0 ATAT ATST ATCRA ATSP`, clone detection incl. `BUFFER FULL`, version string untrusted) as data | C | 8 | W2.1 |
| W3.5 | `packages/bench`: scenarios from the performance budget, sim with 20 ms injected latency, regress-fail threshold 20% (est); CI job | C | 6 | W3.2 |
| W3.6 | Fuzz harness (`fast-check`, plus `jazzer.js` evaluation) over ISO-TP, UDS, OBD, DTC, HSFZ, DoIP decoders, 100k each | C | 6 | W1.4 |
| W3.7 | Pack linter rules 1 to 6 (overlap, fit, provenance, deny classes, banned strings, `tested_on`) | C | 5 | W2.6 |
| W3.8 | Draft 60 generic DTC entries from public regulation text in own wording, similarity check against cross-check source, one source tag per entry | C | 6 | W3.7 |
| W3.9 | Review 60 DTCs (2 min each, second pass by a volunteer if available); tainted-reader rule: no OEM portal material seen by authors | O | 2 | W3.8 |
| W3.10 | Capture night 2 (Wed Dec 9): ENET cable on a BMW. Read VIN over HSFZ, capture raw frames. Resolves HSFZ length semantics and tester address 0xF4 vs 0xF1 | O | 4 | W2.7, W2.5 |
| W3.11 | Module scan on family A car (active scan, address map v0); store traces | O | 3 | W3.2 |
| W3.12 | Counsel scoping call (1 h): owner-capture bitmaps, paraphrased DTC text, tainted-reader rule, name search for "OpenDiag" (P4) | O | 1.5 | booking by Dec 4 |
| W3.13 | Decide ISO 14229-1 / 15765-2 purchase (default: no) | O | 0.5 | none |

Exit: G-B (40-ECU sim car scanned over loopback ENET under 2 s p50 at 20 ms latency, ELM scan under 12 s in sim, keepalive and fake-clock tests, 100k fuzz clean, one real HSFZ capture stored if cable arrived). Hours: O 11, C 49 (reduce by dropping W3.8 to wk 4 if behind).

### Week 4: Mon Dec 14 to Fri Dec 18. Daemon, web skeleton. Milestone M1

Goal: fast read demo on real hardware and a phone-width UI.

| ID | Task | Who | Hrs | Deps |
|---|---|---|---|---|
| W4.1 | `opendiagd` v0: JSON-RPC over WebSocket, bearer token, Origin/Host checks, rate limit, bind 127.0.0.1 only (ADR-003, dev-box rule) | C | 8 | W2.4 |
| W4.2 | Daemon security tests T1 and T2 (hostile origin page, DNS-rebinding style Host header) | C | 4 | W4.1 |
| W4.3 | CLI becomes a daemon client (`opendiag scan`, `faults`, `live`) | C | 4 | W4.1 |
| W4.4 | `apps/web` skeleton (React + Vite versions pinned this week): connect, scan, vehicle tree, VIN, faults list, 10 live PIDs; bundle-size check in CI | C | 10 | W4.1 |
| W4.5 | Fault display: DTC code, status bits, plain text from pack or "no description" | C | 3 | W3.8 |
| W4.6 | Field suggester v2 and diff round-trip check (A to B to A) for coding captures | C | 6 | W2.5 |
| W4.7 | Capture night 3 (Wed Dec 16): 5 coding-option diffs on family A: change one option in the car's own menu, read before and after (read-only) | O | 4 | W4.6 draft, W2.5 |
| W4.8 | M1 demo on a real car over ENET and over WiFi ELM, recorded screen capture and `.odtrace` (section 6.1) | O | 3 | W4.4, W3.4 |
| W4.9 | Order bench-ECU shortlist research with advisor (module families that match captured options, per resources 1.4) | O | 1.5 | W3.11 |
| W4.10 | Forum post 2 with the demo clip and safety page; 5 volunteers contacted by Dec 18 (S14) | O | 2 | W4.8 |
| W4.11 | Decide P5: dev signing key and public subdomain approval | O | 0.5 | none |
| W4.12 | Review daemon PR (auth, token handling) | O | 2 | W4.1 |

Exit: M1 acceptance (section 6.1); decision gate P6 date moved to Dec 21. Hours: O 13, C 35.

### Week 5: Mon Dec 21 to Fri Dec 25. Store, audit, backup. Holiday week, reduced

Goal: backups that restore-read and bundle; scope held small. Gate G-C part 1.

| ID | Task | Who | Hrs | Deps |
|---|---|---|---|---|
| W5.1 | `@opendiag/store`: `Store` interface, file and memory impls, SQLite index (node:sqlite if stable on Node 24; verify, else `better-sqlite3` check per ADR-007) | C | 8 | W1.4 |
| W5.2 | Audit log with hash chain; tamper test fails as expected | C | 4 | W5.1 |
| W5.3 | Move `backup.ts` into `safety`; restore-read flow (re-read and hash match, truncated read refused) | C | 6 | W5.1 |
| W5.4 | Export and import bundle (raw blocks, hashes, journal, human report); import on clean dir verifies hashes | C | 5 | W5.3 |
| W5.5 | Web diff view: two backups, changed bytes, field suggestion | C | 6 | W4.4, W5.3 |
| W5.6 | Draft next 60 DTCs (120 total) | C | 4 | W3.8 |
| W5.7 | Capture night 4 (Wed Dec 23): 5 more coding diffs on family A (10 drafts), plus 6 live-data stimulus captures | O | 4 | W4.7 |
| W5.8 | Review 60 DTCs | O | 2 | W5.6 |
| W5.9 | P6 decision: buy the bench ECU (go/no-go, module family, budget $100 per resources H10) | O | 1 | W4.9 |
| W5.10 | Review backup and store PRs | O | 1 | W5.4 |

Exit: backup, export, import on a clean directory, hashes verify; audit tamper test. Hours: O 8, C 33. If owner is away, only C tasks proceed.

### Week 6: Mon Dec 28 to Fri Jan 1. Pack v1, signing, resolver. Milestone M2, gate G-C

Goal: signed, linted, provenance-checked packs and a resolver that never guesses. Target close Thu Dec 31.

| ID | Task | Who | Hrs | Deps |
|---|---|---|---|---|
| W6.1 | Pack v1 schema (zod plus JSON Schema): DTC, DID, live-data, coding option with `software_range`, `tested_on`, confidence, provenance (data-schema.md, architecture-12wk.md 5.3) | C | 8 | W3.7 |
| W6.2 | Loader and verifier: Ed25519 signature, expiry, rollback protection, refusal-list deny classes, unsigned pack rejected | C | 8 | W6.1 |
| W6.3 | Signing CLI (`opendiag pack sign`); create dev key in Keychain, add registry row (dev-box rule) | C | 3 | P5 approved |
| W6.4 | Resolver: `exact`, `family`, `unknown`; changed software level yields `unknown` and no write option | C | 6 | W6.1 |
| W6.5 | Linter rules 7 to 9 (banned strings, similarity, deny classes in text) | C | 4 | W3.7 |
| W6.6 | Bootstrap `opendiag-packs`: generic OBD-II PIDs, UDS common DIDs (own wording), module address map v0 | C | 4 | W1.8, W6.1 |
| W6.7 | Vehicle tree v1 in web: module list with names from address map, per-module fault and identity | C | 5 | W6.4 |
| W6.8 | OBDb importer design note (CC-BY-SA kept in a separate pack repo path, counsel question carried to wk 11) | C | 2 | W3.12 |
| W6.9 | Approve key creation; order the bench ECU by Dec 28; store receipt reference only | O | 1 | W5.9 |
| W6.10 | Family B (second chassis) capture night 5 (Wed Dec 30): 5 coding diffs; or Toyota hybrid fallback | O | 4 | D1 chosen |
| W6.11 | Induced-fault DTC attempts family A (12), harmless circuits only, with notes | O | 3 | W3.12 |
| W6.12 | Counsel feedback applied to SOURCES.md and rules | O | 1.5 | W3.12 |
| W6.13 | Review pack schema and resolver PRs | O | 1.5 | W6.1 |

Exit: G-C (backup, export, import round trip; audit tamper; unsigned, expired, tampered, rolled-back and refusal-list packs rejected; every `generic` entry has provenance; resolver returns `unknown` on changed software). M2 acceptance (section 6.2). Hours: O 11, C 40.

### Week 7: Mon Jan 4 to Fri Jan 8. Write engine core

Goal: WritePlan, Journal, Gate, token, GuardedTransport against sim write services. Reviewer named by Jan 4 (P7).

| ID | Task | Who | Hrs | Deps |
|---|---|---|---|---|
| W7.1 | Sim write services: 0x10, 0x11, 0x27 (test key only, in `sim`), 0x2E, 0x31 with realistic NRCs (0x22, 0x33, 0x35, 0x36, 0x37, 0x72, 0x78) | C | 8 | W2.1 |
| W7.2 | `WritePlan`, `Journal` (fsync per record, append-only), `Gate` (voltage, identity, software level, battery), `WriteToken` | C | 12 | W5.3, W6.4 |
| W7.3 | `GuardedTransport`: rejects any write SID without a valid token; boundary check forbids importing safety internals | C | 5 | W7.2 |
| W7.4 | Transaction state machine against sim (architecture-12wk.md 4.3, failsafe spec): identity check, shadow copy, diff confirm, preflight, journal open, extended session, write, reset, read-back, commit or auto-revert, capped retries (2), never loop on 0x27 | C | 12 | W7.2 |
| W7.5 | Happy-path transaction test and token tests | C | 4 | W7.4 |
| W7.6 | Refusal list as data and tests (SRS, immobiliser, odometer, speed limiter, leaked key algorithms) | C | 3 | W6.2 |
| W7.7 | Wire bench ECU with advisor (2 h) and PSU, current limit set; first power-up read-only; photo of wiring in repo | O | 4 | bench arrives, W2.9 |
| W7.8 | Name the safety reviewer (P7); send review brief (failsafe spec, ADR-009, ADR-010) | O | 2 | W1.12 |
| W7.9 | Family B capture night 6 (Wed Jan 6): 5 more coding; induced-fault DTCs family B (13) | O | 4 | W6.10 |
| W7.10 | Review write path design PRs (every change, owner rule from resources 4.2) | O | 2.5 | W7.4 |
| R7.1 | Advisor session: bench wiring check, ECU wake-up, safe-harbor limits | R | 2 | W7.7 |

Exit: happy path on sim; token tests. Hours: O 12.5, C 44, R 2.

### Week 8: Mon Jan 11 to Fri Jan 15. Fault injection. Milestone M3, gate G-D

Goal: the engine survives every scripted failure on the simulator and the kill test; review package out.

| ID | Task | Who | Hrs | Deps |
|---|---|---|---|---|
| W8.1 | `FaultScript` and 8 scenarios (architecture.md 9.3): power drop mid-write, 0x37 timer, 0x72 general programming failure, link loss, short read-back, bad checksum, NRC 0x33, timeout storm | C | 10 | W7.4 |
| W8.2 | Roadmap Phase 4 cases: kill app between write and read-back and recover; forced mismatch gives at most 2 reverts; unknown software level hides write button; low voltage blocks before any 0x2E; NRC 0x33 plain message, zero retries | C | 8 | W8.1 |
| W8.3 | Kill-and-recover test: spawn process, `SIGKILL`, restart, offer revert, restore bytes | C | 5 | W8.2 |
| W8.4 | Property tests (fast-check): any fault script ends in COMMIT with match, original restored, or RECOVERY with exportable bundle; never unknown | C | 6 | W8.1 |
| W8.5 | Journal parser fuzz 100k; write-path coverage at least 90% with every edge exercised | C | 3 | W8.1 |
| W8.6 | Safety review package: threat table T1..T13 status, state machine diagram, test list, known gaps | C | 4 | W8.4 |
| W8.7 | Live-data and U-code entries: 8 live-data DIDs from stimulus captures, 30 U-code entries tied to address map; signed pack build in CI (dev key) | C | 6 | W6.2, W5.7 |
| W8.8 | Order Pi 5 + CAN HAT (S5, if cash allows) | O | 0.5 | P2 |
| W8.9 | Capture night 7 (Wed Jan 13): live-data stimulus on family B; retest 5 family A entries | O | 4 | W8.7 draft |
| W8.10 | Reviewer starts (3 h): reads spec, review package, runs `pnpm test` | R | 3 | W8.6 |
| W8.11 | Review fault-injection suite; accept or reject G-D | O | 3 | W8.6 |
| W8.12 | P8 decision: reviewer sign-off or recorded "not yet"; if not yet, writes stay off in all builds | O | 0.5 | W8.10 |

Exit: G-D (all 8 + 5 cases green, property test, token rejection 100%, review signed or "not yet" recorded). M3 acceptance (section 6.3). Hours: O 8, C 42, R 3.

### Week 9: Mon Jan 18 to Fri Jan 22. Live data, voltage, step language, coding UI

Goal: named live values, safe preconditions, coding diff and transaction UI (sim).

| ID | Task | Who | Hrs | Deps |
|---|---|---|---|---|
| W9.1 | Live-data engine driven by pack entries (DID, length, scaling, unit, enum, ECU, software range); CSV logging; rate control per link | C | 10 | W6.4, W8.7 |
| W9.2 | Voltage reading through adapter (`AT RV` or `ST` equivalent) and voltage gate; unreadable voltage blocks | C | 4 | W2.1 |
| W9.3 | Step-language engine (preconditions, jobs, prompts, postconditions), DID allow-list, dry-run that reports the first blocker | C | 10 | W7.4 |
| W9.4 | Web UI: coding diff, option list from resolver, transaction progress, revert button, "needs manufacturer authorization" message | C | 10 | W5.5, W8.2 |
| W9.5 | ELM scan benchmark improvements from W3.4 profile data; bundle size check | C | 3 | W3.5 |
| W9.6 | Second-tester retests of 10 entries to reach `high` (friend or forum volunteer; trace required) | O | 3 | W8.7 |
| W9.7 | Bench ECU read-only trials: identity DIDs, backup twice, hash match, voltage drop observation on PSU | O | 4 | W7.7 |
| W9.8 | Reviewer round 2 (3 h): reads diffs since wk 8, asks for scenarios | R | 3 | W8.10 |
| W9.9 | Order CTEK MXS 5.0 (S7) so it arrives by Feb 3; re-check price | O | 0.5 | P2 |
| W9.10 | Pi 5 HIL runner set up (trusted branches only, T9) | O+C | 3 + 3 | W8.8 |
| W9.11 | Review step-language and UI PRs; decide any scope cut for wk 10 (P9) | O | 3 | W9.3 |

Exit: dry-run blocker report test passes; live data runs on sim and bench read-only. Hours: O 14 (incl. 3 shared), C 43 (incl. 3 shared), R 3.

### Week 10: Mon Jan 25 to Fri Jan 29. Platform spikes. Gate G-E

Goal: one-page go/no-go per platform with measured numbers. No new features.

| ID | Task | Who | Hrs | Deps |
|---|---|---|---|---|
| W10.1 | `adapters-web`: Web Serial and Web Bluetooth read-only on Chromium desktop; WebSocket-to-daemon transport | C | 8 | W4.1 |
| W10.2 | `apps/desktop`: Electron shell around daemon and web UI (ADR-004); unsigned build; checksum | C | 8 | W4.4 |
| W10.3 | `apps/mobile`: Capacitor BLE and TCP spike on one iPhone and one Android (ADR-005); scan time measured | C | 8 | W4.4 |
| W10.4 | Browser tests for daemon T1 and T2 in Chrome and Firefox against a hostile origin page | C | 4 | W4.2 |
| W10.5 | Go/no-go memos (web, desktop, mobile) with numbers | C | 3 | W10.1 to W10.3 |
| W10.6 | Decide P10: Apple Developer Program ($99/yr, not re-fetched), Google Play ($25), Windows signing; default defer all | O | 1 | W10.5 |
| W10.7 | Test spikes on own phones (iPhone and Android if owned) | O | 3 | W10.3 |
| W10.8 | Buy 2 YubiKeys ($116 per resources) for release root; do not create the key yet | O | 1 | P2 |
| W10.9 | Review coverage and fuzz; fix list for hardware week | C | 4 | W9.x |
| W10.10 | Capture night 8 (Wed Jan 27): fill gaps in coding drafts; retests | O | 3 | W9.6 |
| W10.11 | Pin down counts vs targets (S5), drop unprovable entries, finish DTC counts | O + C | 2 + 5 | W8.7 |
| W10.12 | Reviewer round 3 (3 h), bench write dry-run plan drafted with reviewer | R | 3 | W9.8 |
| W10.13 | Contributor guide and pack-authoring guide drafts | C | 5 | W6.6 |

Exit: G-E (T1 and T2 pass in browsers; each platform has a go/no-go with measured scan time; web bundle under 150 KB gzip). Hours: O 11 (+2 shared), C 44 (+5 shared), R 3.

### Week 11: Mon Feb 1 to Fri Feb 5. Real hardware week. Gate G-F part 1, decision P11

Goal: every estimate replaced by a measurement; bench write trials; pack v0.1.

| ID | Task | Who | Hrs | Deps |
|---|---|---|---|---|
| W11.1 | Adapter qualification run: OBDLink MX+, vLinker MC+, generic clone, ENET cable; scripted suite producing capability reports (framing, flow control, voltage read, timing, `BUFFER FULL`, long-run stability) | C | 10 | all adapters arrived |
| W11.2 | Run qualification with the owner at the car and bench; save traces; publish capability reports | O | 6 | W11.1 |
| W11.3 | Benchmarks on real links: p50 and p95 replace every estimate in architecture-12wk.md 6.1; budget misses go to the owner as exceptions | C | 6 | W11.2 |
| W11.4 | HSFZ and DoIP framing confirmed on captures; tester address decided; update `hsfz.ts` tests and docs | C | 4 | W3.10 |
| W11.5 | Bench write trials, one allowlisted option on bench ECU: backup, write, read-back, forced power drop on PSU, auto-revert, hash match; reviewer present or reading logs | O + R | 4 + 3 | W9.7, W10.12 |
| W11.6 | Optional: SocketCAN `vcan` cross-check in a Linux VM against python-can-isotp as oracle | C | 3 | W3.6 |
| W11.7 | Pack v0.1 signed with the YubiKey release root; GitHub Release asset on `opendiag-packs`; counts vs S5 | C + O | 4 + 2 | W6.3 |
| W11.8 | Create YubiKey-backed release root key with owner present; registry row (dev-box rule) | O | 1.5 | W10.8 |
| W11.9 | Counsel review (full): refusal list, DMCA 1201, Clean Air Act exposure, trademark, CC-BY-SA data separation | O | 2 | W3.12 |
| W11.10 | Decision P11: real-car writes in beta.2 yes/no (conditions in section 7) | O | 1 | W11.5, W8.12 |
| W11.11 | Threat-model walkthrough T1..T13 against the build | C | 4 | W10.4 |
| W11.12 | Fix list triage | O + C | 2 + 6 | W11.2 |
| W11.13 | Capture night 9 (Wed Feb 3): a second owner car or friend's car, retests | O | 4 | none |

Exit: G-F part 1. Hours: O 22.5 (peak; the one week where 12 h is exceeded, planned: compensates for wk 5), C 43, R 3.

### Week 12: Mon Feb 8 to Fri Feb 12. Hardening and beta. Milestone M4, gate G-F

Goal: ship `v0.2.0-beta.1`; beta.2 only if P11 passed; retro and next plan.

| ID | Task | Who | Hrs | Deps |
|---|---|---|---|---|
| W12.1 | Fuzz 1M inputs per decoder, journal parser and pack loader; fix findings | C | 8 | W3.6 |
| W12.2 | Dependency and licence review (scan clean, no new GPL), `pnpm audit`, pin actions by SHA | C | 3 | W1.6 |
| W12.3 | User guide, contributor guide, pack-authoring guide final; `SAFETY.md` and in-app disclaimers updated | C | 8 | W10.13 |
| W12.4 | Beta release: tag `v0.2.0-beta.1`, GitHub Release with checksums and provenance attestation (details unverified), signed with release root; real-car writes compiled out | C + O | 4 + 2 | W11.8 |
| W12.5 | If P11 = yes: allowlist of at most 3 verified options, owner's own car, CTEK connected, reviewer reads journal remotely; tag `v0.2.0-beta.2` | O + C + R | 3 + 3 + 2 | W11.10 |
| W12.6 | Publish capability reports and measured performance doc; update S1..S17 table | C | 4 | W11.3 |
| W12.7 | Audit 10% of pack entries (data-strategy 7.3) | O | 2 | W11.7 |
| W12.8 | Retrospective, plan for the next 12 weeks, update `roadmap.md` mapping | O + C | 2 + 4 | all |
| W12.9 | Announce the beta and pack v0.1 (forum posts, Discussions); contribution call | O | 2 | W12.4 |
| W12.10 | Counsel follow-ups; second maintainer outreach | O | 1.5 | W11.9 |

Exit: G-F (2+ adapters qualified, measured numbers in place, fuzz clean, licence scan clean, checksums, no real-car write in beta.1). M4 acceptance (section 6.4). Hours: O 8.5 (+3), C 31 (+3), R 2.

### 5.13 Hour totals

| Wk | Dates | Owner (O) | Claude (C) | Reviewer / advisor (R) | Notes |
|---|---|---|---|---|---|
| 1 | Nov 23 | 10 | 30.5 | 0 | |
| 2 | Nov 30 | 12.5 | 46 | 0 | Claude overload; see cut rule |
| 3 | Dec 7 | 11 | 49 | 0 | Claude overload |
| 4 | Dec 14 | 13 | 35 | 0 | |
| 5 | Dec 21 | 8 | 33 | 0 | Holiday |
| 6 | Dec 28 | 11 | 40 | 0 | Holiday |
| 7 | Jan 4 | 12.5 | 44 | 2 | |
| 8 | Jan 11 | 8 | 42 | 3 | |
| 9 | Jan 18 | 14 | 43 | 3 | |
| 10 | Jan 25 | 12 | 50 | 3 | |
| 11 | Feb 1 | 22.5 | 47 | 3 | Peak owner week |
| 12 | Feb 8 | 12.5 | 36 | 2 | |
| Total | | about 147 | about 495 | 16 | Owner within 144 h plan (+2%); Claude averages 41 agent-hours/wk (about 40 to 50 in weeks 2, 3, 10, 11), above the 25 to 40 assumption: expect about 15% of Claude tasks to move one week later, which is why the cut list and float exist. |

## 6. Milestones, acceptance tests and demo scripts

### 6.0 Milestone map

| Milestone | Date | Gates closed | Roadmap phases covered | What a stranger can see |
|---|---|---|---|---|
| M1 Fast read | Fri Dec 18 | G-B (wk 3) plus daemon and web skeleton | Phase 0 complete, Phase 1 generic UDS and scan | Plug in, scan, faults and live values in seconds |
| M2 Inspect and back up (lands in holiday week 6; slip to Fri Jan 8 without penalty if wk 5 to 6 owner hours are under plan) | Thu Dec 31 | G-C | Phase 3 groundwork (backup, packs) | Vehicle tree with named data; backup, bundle, diff, signed packs |
| M3 Write engine proven (simulator) | Fri Jan 15 | G-D | Phase 4 engine | Fault injection on screen, kill and recover |
| M4 Real hardware beta | Fri Feb 12 | G-E, G-F | Phases 2 and 3 on hardware; Phase 4 bench only | Beta download, capability reports, measured numbers, bench write demo |

### 6.1 M1: Fast read (Fri Dec 18)

Acceptance tests (all must pass):

| # | Test | Pass condition |
|---|---|---|
| M1-1 | Simulated 40-ECU car, loopback ENET, 20 ms injected latency | Full scan under 2 s p50 in `pnpm bench` |
| M1-2 | Simulated ELM scan | Under 12 s p50 |
| M1-3 | Roadmap Phase 0: request `7DF 02 01 0C`, reply `7E8 04 41 0C 1A F8` | UI and CLI show 1726 rpm |
| M1-4 | Roadmap Phase 0: VIN across first frame `10 14 62 F1 90 ...` and flow control `30 00 00` | 17 characters |
| M1-5 | Clone returning `BUFFER FULL` | Detected, downgraded, no crash |
| M1-6 | Daemon from a page on another origin or with a wrong Host | Rejected |
| M1-7 | Real car, ENET, one scan | At least 6 modules listed with identity strings; VIN equals the car's plate; trace saved |
| M1-8 | Real car, WiFi ELM or STN, quick read | VIN, stored/pending/permanent DTCs, 10 PIDs, under 6 s p95 on the first try (floor, not yet budget) |
| M1-9 | Fuzz 100k each decoder | No crash |
| M1-10 | Unknown DTC | Shows the raw code and "no description" |

Demo script (3 minutes, screen-recorded, owner at the car, laptop on the ENET cable and phone on WiFi):
1. `opendiag scan` in the terminal: modules appear within seconds, show the elapsed time.
2. Open the web UI on the phone: connect, scan, tap a module, show faults with status bits and plain text.
3. Pull the cable; show the session lost message within 10 s; reconnect.
4. Switch to the WiFi ELM; show 10 live PIDs updating; show the adapter capability line (model, tier, voltage).
5. Open the recorded `.odtrace` and replay it with the cable unplugged.

### 6.2 M2: Inspect and back up (Thu Dec 31)

| # | Test | Pass condition |
|---|---|---|
| M2-1 | Backup, re-read, hash match on 5 modules across the cars available (roadmap M3.1 target is 2 chassis; floor is 1 chassis) | Valid only after hash match; truncated read refused |
| M2-2 | Bundle export, import on clean dir | All hashes verify |
| M2-3 | Audit log chain edited | Verification fails and names the first bad record |
| M2-4 | Unsigned, tampered, expired, rolled-back, refusal-list pack | Each rejected with its own error code |
| M2-5 | Resolver on a changed software level | `unknown`, option names disappear, raw view shown, no write option |
| M2-6 | Coding entry without `tested_on` | Lint fails in CI |
| M2-7 | Diff of two backups made around a change in the car's own menu (round trip A to B to A) | Reports the changed bytes; field suggester proposes offset, mask and values; checksum rule reported or "unknown" |
| M2-8 | Pack coverage | At least 120 DTCs, 10 coding drafts, 1 address map in `opendiag-packs` main |

Demo script (4 minutes):
1. In the car's own menu, note setting X; run `opendiag backup` on the module; change X in the car's menu; run backup again.
2. `opendiag diff a.json b.json`: show the changed byte and the suggested field; confirm the round trip by changing it back.
3. Open the web vehicle tree: module, identity, named options from the pack; show the same module with a wrong software level and the fallback.
4. Corrupt one byte of the pack file; show the loader refusing it.

### 6.3 M3: Write engine proven on the simulator (Fri Jan 15)

| # | Test | Pass condition |
|---|---|---|
| M3-1 | 8 fault scenarios (architecture.md 9.3) | All green |
| M3-2 | Kill between write and read-back (roadmap Phase 4) | Next start shows the open transaction, offers revert, revert restores saved bytes |
| M3-3 | Forced read-back mismatch | Auto-revert runs, at most 2 retries, then stops with recovery steps |
| M3-4 | Unknown software level | Write button absent, not just disabled |
| M3-5 | Voltage under profile minimum, or unreadable | Blocked before any 0x2E is sent |
| M3-6 | Module answers NRC 0x33 | Plain "needs manufacturer authorization", zero retries |
| M3-7 | Any write SID without a valid token | Rejected 100% by `GuardedTransport` |
| M3-8 | Property test, random fault scripts | End state is COMMIT with match, original restored, or RECOVERY with a bundle; never unknown |
| M3-9 | Write-path coverage and journal fuzz | At least 90% lines, every edge exercised; 100k journal inputs, no crash |
| M3-10 | Reviewer | Signed off, or "not yet" recorded and writes stay off |

Demo script (4 minutes, no car):
1. Sim vehicle with a coding block; propose a change; show the diff and preflight; apply.
2. Re-run with the power-drop fault; show auto-revert and the hash match.
3. Re-run and `kill -9` the process mid-write; restart and show the recovery offer; accept.
4. Show the refusal: attempt a write with an SRS module id; show the refusal message and the audit record.

### 6.4 M4: Real hardware beta (Fri Feb 12)

| # | Test | Pass condition |
|---|---|---|
| M4-1 | Adapters | At least 2 qualified, each with a published capability report; negative test: clone detected and capped |
| M4-2 | Performance | Table in architecture-12wk.md 6.1 replaced by measured p50/p95; exceptions approved by owner |
| M4-3 | Data | S5 met or the gap logged; pack v0.1 signed and downloadable; 10% audit complete |
| M4-4 | Security | T1..T13 each have a passing test or a recorded reason; daemon tests pass in Chrome and Firefox |
| M4-5 | Fuzz and licences | 1M inputs per decoder, no crash; licence scan clean |
| M4-6 | Bench write | One allowlisted option written to the bench ECU, read-back matches, forced power drop auto-reverts with hash match, reviewer saw the logs |
| M4-7 | Beta artifacts | `v0.2.0-beta.1` with checksums; no real-car write path enabled |
| M4-8 | Optional (P11 yes) | `v0.2.0-beta.2`: at most 3 options on the owner's own car, CTEK connected, journal exported and reviewed |

Demo script (6 minutes):
1. Download beta, verify checksum, install on a clean user account.
2. Scan the real car over ENET, then WiFi; show measured times next to the budget.
3. Open the capability report page for each adapter.
4. Bench ECU on the PSU: backup, write the allowlisted option, pull PSU power mid-write, power back, watch auto-revert and hash match.
5. If P11 = yes: same option on the car, the journal shown at the end.

## 7. Decision points

All answers are owner decisions unless marked. Defaults apply if the owner does not answer by the date.

| # | Date | Decision | Default if unanswered | Consequence |
|---|---|---|---|---|
| P1 | Mon Nov 23 (in first 48 h) | Approve ADR-001 (TypeScript through wk 12); approve edit of `architecture.md`; approve budget scenario (Must $638 / recommended $2,203 / full $3,076) | TypeScript; recommended | Unblocks W1.4, W1.9, orders |
| P2 | Tue Nov 24 | Approve the hardware order list (H1 to H11 plus S1 to S3); confirm real weekly hours | Order H1 to H9, H11 and S1, S2 only; 12 h/wk planned, 10 h/wk is the floor | ENET cable and ELM adapters en route by Dec 4 |
| P3 | Fri Nov 27 | Which two chassis families (data-strategy D1); create `opendiag-packs` repo | F-series + G-series BMW; fallback BMW + Toyota hybrid | Fixes the bootstrap data targets |
| P4 | Fri Dec 4 | Book legal scoping call for wk 3 and name search for "OpenDiag" | Book anyway | Data rules fixed before captures are published |
| P5 | Mon Dec 14 | Approve dev signing key creation (Keychain, registry row), and a public subdomain on `endyland.com` for docs/pack downloads (DNS note recorded first) | Create key; no subdomain until wk 10 | Unblocks W6.3 |
| P6 | Mon Dec 21 | Buy the bench ECU: which module family, cap $100 (H10) | Buy a non-safety comfort or cluster module matching the captured family | Needed wired by wk 7 |
| P7 | Mon Jan 4 | Name the safety reviewer | Recruit paid review at $50 to $100/h (est) for 6 h (about $300 to $600 for Jan, $800 to $1,600 for all 16 h; not in the $2,203 total, needs an owner yes); else writes stay off | Gate G-D sign-off |
| P8 | Fri Jan 15 | Accept G-D; accept reviewer sign-off or record "not yet" | If "not yet": writes stay off in all builds | Decides whether wk 11 bench trials proceed |
| P9 | Fri Jan 22 | Cut or hold scope for wk 10 to 12 (section 10) | Apply cut list level 1 if any gate was late | Protects the safety and hardware weeks |
| P10 | Fri Jan 29 | Apple Developer ($99/yr), Google Play ($25), Windows code signing | Defer all; ship checksums and provenance | Decides store work after wk 12 |
| P11 | Thu Feb 4 | Real-car write in `beta.2`: yes only if (a) reviewer signed off, (b) bench write and revert proven with hash match, (c) at most 3 comfort options, each verified on the bench module family or on the owner's car with a round-trip diff, (d) CTEK or equivalent connected, (e) counsel review done, (f) refusal list tests green | No | beta.2 skipped; roadmap Phase 4 continues after wk 12 |
| P12 | Wed Feb 10 | Approve the release root key use and the beta tag | Approve | `v0.2.0-beta.1` |
| P13 | Fri Feb 12 | Next 12-week scope (Toyota hybrid, Mercedes read-only, desktop signing, Rust spike triggers) | Plan in retro | Next plan |

## 8. Risk register (top 15)

L = likelihood, I = impact (H, M, L). Triggers are observable and dated. Owner of the risk is the person who watches the trigger.

| # | Risk | L | I | Mitigation | Trigger | Watch |
|---|---|---|---|---|---|---|
| R1 | No car or too little car time for captures | H | H | Decide chassis in wk 1; sim-first plan keeps wks 2 to 9 code work independent; ask volunteers from wk 1; use Toyota fallback | No real capture by Dec 11 (end of wk 3) | O |
| R2 | Owner hours fall below 10 h/wk | H | H | Claude-heavy tasks fill gaps; cut list; hours reported weekly | Two weeks in a row under 10 h | O |
| R3 | Hardware arrives late or is wrong (marketplace items, clones) | H | M | Order in first 48 h; buy spares; time-box returns; verify chip behaviour by test, not by listing | ENET cable not here by Dec 4; adapter missing Dec 18 | O |
| R4 | Simulator too forgiving, so safety tests give false confidence | M | VH | Real-trace replay, python-udsoncan and python-can-isotp as cross-implementation oracles in CI, bench ECU wk 11, no real-car writes until P11 | Bench write behaves differently from sim in any scenario | C |
| R5 | Write-path bug could brick a module | L | VH | Bench ECU only; T4 modules refused; token; journal; read-back; at most 3 allowlisted options; independent reviewer | Any unexplained read-back mismatch on the bench | R |
| R6 | No independent safety reviewer | M | H | Outreach from wk 1; paid fallback; writes stay off if none | No name by Jan 4 | O |
| R7 | Legal exposure (DMCA 1201, emissions law, trademark of name "OpenDiag", data copyright) | M | H | Counsel scoping wk 3, full review wk 11; refusal list in code; clean-room rules; no OEM data | Counsel flags a blocker; any complaint | O |
| R8 | Data provenance contamination (OBDb CC-BY-SA, Wal33D/dtc-database stale since 2026-02-16 and SAE J2012 text, forum-derived claims) | M | H | OBDb in a separate pack path, never merged into CC-BY packs; DTC text rewritten in own words; similarity check; tainted-reader rule; takedown process | Similarity score above threshold in lint; counsel objects | C |
| R9 | HSFZ/DoIP assumptions wrong (tester address, length semantics, routing activation) | M | M | Capture early (wk 3); keep transport configurable; mark `hsfz.ts` behaviour unverified until captures | Capture contradicts the code | C |
| R10 | Newer cars use secured gateways or authentication, so reads or captures fail | M | M | Report plainly; mark module "needs authorisation"; no bypass; choose cars on F/G generation first | More than half of modules refuse reads on the chosen car | O |
| R11 | Local daemon web exposure (CSRF, DNS rebinding, Local Network Access changes in browsers) | M | M | Token, Origin/Host checks, 127.0.0.1 only, same-origin UI; browser tests wk 10 | A failing T1 or T2 test in any browser | C |
| R12 | Claude capacity exceeded (weeks 2, 3, 10 booked above 45 agent-h) or interface drift between packages | H | M | Written interfaces first; boundary checks; defer lowest-value tasks (linter skeleton, optional spikes); one package per session | Any week ends with more than 30% of tasks unfinished | C |
| R13 | Adapter quality: clone ELM behaviour, BLE flakiness (noble fork is young), classic BT unreachable | H | M | Clone probing and tier caps; WiFi and ENET first; pin noble; BLE behind transport interface; mobile only a spike | Qualification shows over 5% dropped frames on a tier-1 adapter | C |
| R14 | Free tier or service changes (GitHub Actions minutes, Cloudflare Workers limits, Supabase pausing) | L | M | Nothing runs on Supabase in this window; static hosting only; keep CI under 10 minutes; recheck limits wk 1 | CI over 30 min or billing notice | C |
| R15 | Single-maintainer burnout and bus factor | M | H | Weekly 12 h cap, rituals, second maintainer search from wk 6, all decisions in repo docs | Missed two weekly rituals in a row | O |

## 9. Budget summary

Source: [resources.md](resources.md) sections 1, 3 and 6; all line prices there are marked (src) or (est). Plan scenario: **Must + Should recommended, $2,203** plus contingency $200 and shipping/tax uplift (resources 6.4: add 10 to 15%, est). Cash is spent when the date column says; nothing is bought before P1 and P2.

| Month (resources label) | Items | Cash by resources 6.2 | Plan timing note |
|---|---|---|---|
| Dec (M1) incl. Nov 23 to 30 | H1 to H9, H11 ($410), S1 OBDLink EX $60, S2 vLinker BM+/FS $70, S3 K+DCAN $25, domain $12 not needed if subdomain (resources D8) | $577 | Orders Nov 23 and 24; S3 can slip to the cut list |
| Jan (M2) | H10 bench ECU $100 (ordered Dec 28, cost lands Dec), S4 lab PSU $130, S5 Pi 5 + HAT $225, S6 two more bench ECUs $200 | $655 | S6 and S5 only if wk 8 gate G-D is green |
| Feb (M3) | YubiKey x2 $116 (bought Jan 29), CTEK MXS 5.0 $105 (ordered Jan 29), legal review $750 (est; scoping call $250 in Dec, full review $500 in Feb) | $971 | The Jan 29 buys shift about $221 from Feb into Jan; the total does not change |
| Total recommended | | **$2,203** | |
| Must-only floor | H1 to H11, YubiKey x2, domain | **$638** | The plan still completes S12 with 2 adapter reports and bench trials |
| Add-ons not planned | Tactrix, PEAK, oscilloscope, Toyota module, Apple, Google Play, signing | up to $873 more to reach $3,076 | Only by P10 or if contributors fund |
| Standards (ISO 14229-1 + 15765-2) | about $450 (est, CHF 402) | not in total | P-decision W3.13, default no |

Not in the total: paid safety review if no volunteer (est $800 to $1,600 for 16 h) and electronics advisor if not a favour (est up to $200). Free services (all $0): GitHub public repos and Actions, Cloudflare Pages and Workers (domain `endyland.com` held), Sentry/Crowdin free tiers (not required in the window), Supabase deferred. Free-tier limits were fetched Nov 2026 in resources.md and must be rechecked in wk 1.

Cash gates: after $638 is spent (Must), further spend needs a sentence from the owner naming the line; contingency $200 covers a failed module, wrong cable or mechanic time.

## 10. What to cut if behind

Trigger: a gate (G-B, G-C, G-D) closes more than 1 working week late, or two weeks of owner hours under 10, or hardware not here by Dec 18. Apply levels in order; each level lists what is dropped and what it saves. The safety engine, fault-injection suite and refusal list are never cut. Decision at P9 (Jan 22), or earlier at P6.

| Level | Cut | Hours saved (O / C) | What stays |
|---|---|---|---|
| 1 | Web UI polish (animations, themes), Electron spike, mobile spike, K+DCAN cable, S5 Pi 5 HIL, S6 extra bench ECUs, optional SocketCAN cross-check (W11.6) | 3 / 25 | CLI, daemon, web basics, desktop only as a documented build |
| 2 | Step-language engine (service functions), CSV logging UI, desktop BLE, `adapters-web` | 2 / 24 | Live data in CLI; Web read-only |
| 3 | Data targets drop to the floor: 120 DTC, 20 DID, 10 coding options, 1 address map; second chassis dropped | 20 / 8 | Provenance rules, 5 `high` entries |
| 4 | Real-car write beta.2 and bench write trials; ship `beta.1` with writes compiled out; wk 11 becomes qualification and data week only | 7 / 6 | M3 (sim) still complete |
| 5 | Move beta from Feb 12 to Feb 26 (2-week slip) and use the extra time for items cut at levels 2 and 3 | n/a | Everything above |

Rule: only the owner chooses a level, never silently; the choice is recorded in the weekly status table (ritual W-Fri).

## 11. Weekly rituals

| Ritual | When | Who | What |
|---|---|---|---|
| Monday brief (30 min) | Mon 09:00 | O + C | Read last week's exit check and risk triggers (section 8), confirm this week's tasks and owner hours, assign each Claude task a package and written interface. Output: a 10-line "week brief" at the top of the weekly status note. |
| Capture night | Wed evening, 90 min | O (+ V) | One car session per week from wk 2: follow the protocol in W1.10, record `.odtrace`, run one coding diff (read-only), one live-data stimulus or one retest. After: Thursday Claude turns the capture into pack drafts and linter output; Friday owner reviews. Skip a week only by naming a replacement night. |
| Review hour | Thu, 60 min | O | Review all safety-relevant changes (rule: nothing under `safety/`, `packs/` verification or daemon auth merges without owner review; resources 4.2) |
| Reviewer hour | Fri from wk 8, 60 min | R | Walk the week's write-path diffs and the test list. |
| Release train | Fri 16:00 | C | Tag a `nightly` of `main` (unsigned; sim writes only); run bench, fuzz smoke, licence and boundary checks; post the changelog line. Pack channel `nightly` follows. Beta tags only at W12 (and `beta.2` conditionally). |
| Friday status | Fri 16:30 | O + C | Update the status table in this file's PR (planned vs done, owner hours, gate state, risk triggers, cash spent) and decide any cut-list level. |
| Docs sync | Fri | C | `ayan-documentation` style update of docs touched that week; one-line CHANGELOG entry. |

## 12. First 48 hours checklist (Mon Nov 23 and Tue Nov 24)

Owner (about 5 h):
- [ ] Answer W1.11: cars you can use (make, model, year), adapters you already own, bench gear, real weekly hours.
- [ ] Approve P1: TypeScript through week 12; approve budget scenario.
- [ ] Approve P2: place the hardware order (H1 ENET cable, H6 USB-C Ethernet, H7 breakout, H8 multimeter first; H2 OBDLink MX+, H3 vLinker MC+, H4 two clones, H5 CANable, H9 PSU, H11 wire next). Re-check prices before paying; marketplace prices move weekly (resources, price convention).
- [ ] Do the 5-minute check: is any ELM adapter already in a drawer? Note model and where it is.
- [ ] Message 2 friends or 1 forum thread for a safety-reviewer candidate and ENET car access (W1.12). No personal data in posts.
- [ ] Approve creating `opendiag-packs` repo, branch protection and Discussions on `opendiag`.
- [ ] Pick the chassis families (P3) or defer to Friday.
- [ ] Read this plan's section 0 and say "no" to any resolution you disagree with.

Claude (about 12 h):
- [ ] Run `pnpm typecheck && pnpm test` and record baseline: expected 27 pass.
- [ ] Commit `docs/plan/` after owner OK on repos1.txt (untracked; ask before deleting; if no answer move to `_to_delete`).
- [ ] Add banner to `docs/design/architecture.md` section 4 and link plan docs from `docs/README.md`.
- [ ] Start W1.3 (`OdError`) on a branch; no package moves until W1.2 is green.
- [ ] Draft the capture-night protocol and consent sheet (W1.10).
- [ ] Draft the `SOURCES.md` template and PR templates (W1.8).
- [ ] Re-check free-tier limits (GitHub Actions, Cloudflare Workers) against resources.md section 3 and note changes.
- [ ] Put the first Monday brief in the status note.

Done when: orders are placed, P1 to P3 are answered or defaulted, baseline tests pass, and the first status note exists.

## 13. Weekly status table (fill in each Friday)

| Wk | Planned exit | Done? | Owner h | Claude h | Gate | Cut level | Cash to date |
|---|---|---|---|---|---|---|---|
| 1 | G-A | | | | | | |
| 2 | Keepalive and parallel tests | | | | | | |
| 3 | G-B | | | | | | |
| 4 | M1 | | | | | | |
| 5 | G-C part 1 | | | | | | |
| 6 | M2 / G-C | | | | | | |
| 7 | Happy path on sim | | | | | | |
| 8 | M3 / G-D | | | | | | |
| 9 | Dry-run blocker test | | | | | | |
| 10 | G-E | | | | | | |
| 11 | G-F part 1 | | | | | | |
| 12 | M4 / G-F | | | | | | |

## 14. Sources

- Inputs: [architecture-12wk.md](architecture-12wk.md), [resources.md](resources.md), [data-strategy.md](data-strategy.md), [oss-leverage.md](oss-leverage.md), [../design/roadmap.md](../design/roadmap.md), [../design/failsafe-coding-spec.md](../design/failsafe-coding-spec.md), [../design/architecture.md](../design/architecture.md).
- GitHub REST API, fetched 2026-11-19/20: https://api.github.com/repos/OBDb/BMW-3-Series, https://api.github.com/repos/pylessard/python-udsoncan, https://api.github.com/repos/pylessard/python-can-isotp, https://api.github.com/repos/mercedes-benz/odxtools, https://api.github.com/repos/stoprocent/noble, https://api.github.com/repos/Wal33D/dtc-database. Other repo facts are as verified in oss-leverage.md section 3; re-check at the moment of adoption.
- Prices, hardware and service limits: as sourced in resources.md Sources. Not re-fetched in this pass.
- Unverified in this plan: GitHub build provenance attestation details (W12.4), Node `node:sqlite` stability on Node 24 (W5.1), Apple and Google fees (not re-fetched), counsel cost, owner car list.
