# OpenDiag roadmap

Clean-room note: grounded in `docs/research/` (file names cited inline) and public pricing pages. Phases are ordered by risk. No phase depends on proprietary data, leaked software or OEM keys. Not legal advice. Dates are deliberately absent; the gates are tests, not calendar.

## Summary

- Seven phases. Each ends with acceptance tests that must pass before the next starts.
- Phases 0 to 3 are read-only. Writes arrive in Phase 4, on a small list of chassis and modules, with a full safety wrapper.
- Toyota/Lexus (Phase 5) and Mercedes (Phase 6) come last. Both rely on data we do not have and, for Mercedes, authorization we will not bypass.
- Everything runs on free tiers: GitHub Actions, Cloudflare Pages/Workers, Supabase free.
- The binding constraint is people with cars and a bench, not code.

## Principles (apply to every phase)

1. Read-only by default. A write needs an explicit unlock, a backup, a diff and a log (`coding-security-failsafe.md`).
2. Original code, original data. GPL projects (python-OBD, EdiabasLib, ICSim) stay out of the core (`open-source-landscape-and-legal.md`).
3. Hardware claims are tested, not assumed. An adapter is "supported" only after passing the qualification suite (`hardware-adapters.md`).
4. Every pack entry carries provenance and a "verified on" list. Unknown means read-only.
5. Refusal list in code: airbag/SRS, immobilizer and key defeat, emissions defeat, odometer, speed limiter, leaked seed/key algorithms.

## Phase 0: OBD-II reader and simulator

Goal: a working reader on any decent adapter, and a simulator so the rest of the project can be built without a car.

- ELM/STN backend over Wi-Fi TCP and BLE, with clone probing (version string is untrusted, test behaviour).
- Mode 01, 02, 03, 07, 09, 0A decode from public J1979 tables, own wording.
- Virtual-CAN fake ECU that answers `22 F1 90` with multi-frame flow control and supports fault injection.
- Recorded-trace replay for bug reports.

Milestones:

| ID | Milestone |
|---|---|
| M0.1 | ISO-TP codec passes all frame types (single, first, consecutive, flow control) |
| M0.2 | Fake ECU and CI job on virtual CAN |
| M0.3 | Adapter probe and capability profile file |
| M0.4 | CLI reads VIN, DTCs and 10 live PIDs from the simulator and a real car |

Acceptance tests:

- Request `7DF 02 01 0C`, simulator replies `7E8 04 41 0C 1A F8`, tool shows 1726 rpm.
- VIN read across first frame `10 14 62 F1 90 ...` and tester flow control `30 00 00` returns 17 characters.
- A clone that returns `BUFFER FULL` is detected and downgraded to Tier 3, not crashed.
- Fuzz test on the parser: 1M random frames, no crash (a 2026 UDS stack CVE came from a short 0x27 request; see `coding-security-failsafe.md`).

Exit: any contributor can run the full test suite with no hardware.

## Phase 1: generic UDS and DTC for BMW

Goal: identify a BMW, list its modules, read and clear faults with readable text.

- UDS client: sessions (0x10), TesterPresent (0x3E), ReadDataByIdentifier (0x22), ReadDTCInformation (0x19), Clear (0x14), correct handling of NRC 0x78 pending replies.
- Transports: BMW extended-address CAN (ID 0x6F1 style, unverified), HSFZ over ENET (TCP 6801, UDP 6811) with configurable tester address, DoIP where the car speaks it (`protocols.md`, `hardware-adapters.md`).
- Module scan using the address range and 0xF1xx identification DIDs. No static address table.
- DTC text pack v0: community-written, one source tag per entry.

Milestones:

| ID | Milestone |
|---|---|
| M1.1 | HSFZ transport tested against a captured session |
| M1.2 | Module scan on one F-series and one G-series car |
| M1.3 | DTC read and clear with status-bit decode |
| M1.4 | Pack format v0 with schema validation |

Acceptance tests:

- Capture of a real HSFZ read-VIN resolves the length-semantics question (`bmw-ista-architecture.md` open question 1).
- Status mask `0x08` returns only confirmed codes on the simulator; `59 02 FF 03 01 00 09` decodes to one DTC with status 0x09.
- Clearing codes on a real car is followed by a re-read that matches expectation.
- Unknown DTC shows the raw code and "no description", never a guess.

Risk gate: tester address (0xF4 vs 0xF1) decided from real captures before release.

## Phase 2: live data and service resets

Goal: parity with the free half of BimmerLink and Car Scanner, plus guided service functions.

- Manufacturer live data via declarative entries: DID, length, scaling, unit, enum, ECU, valid software range, verification status.
- Logging to CSV, simple dashboard in a web UI served from a local bridge.
- Service function engine: a small step language with preconditions (voltage, ignition, speed zero), jobs, user prompts, postconditions. First functions: oil service reset, brake pad reset, battery registration, on chassis with a bench-verified recipe.
- Voltage reading through the adapter (`AT RV` or ST equivalent) and a gate.

Milestones:

| ID | Milestone |
|---|---|
| M2.1 | 30 verified live-data entries across 3 ECU families |
| M2.2 | Step-script engine with sandbox and dry-run |
| M2.3 | Three service functions verified on real cars |
| M2.4 | Web UI usable on phone width |

Acceptance tests:

- Dry run executes every step except the final write and reports the first blocker.
- Script that requests a write outside its declared DIDs is rejected by the engine.
- Voltage below profile minimum blocks the function; unreadable voltage blocks it too.
- Each live entry has a trace from a real car in the pack repo.

## Phase 3: read-only coding backup and inspect

Goal: users can safely read and archive coding data, and see named options where a map exists.

- Read full coding block per module, hash it, store with identity metadata (part number, software, hardware, VIN, tool version, timestamp).
- Export bundle: raw blocks, hashes, journal, human report.
- Inspect: diff two backups, show changed bytes, show names from the community option catalogue when the module and software level match.
- Learning mode: record a session of the owner's own car to propose catalogue entries. No import of OEM files.
- Signed pack distribution; offline update.

Milestones:

| ID | Milestone |
|---|---|
| M3.1 | Backup, re-read and hash-match on 5 modules across 2 chassis |
| M3.2 | Option catalogue schema (series, module, software range, option, values, requirements, warnings, tested-by, trust level) |
| M3.3 | Contributor tool: diff before and after changing an option in the car's own menu |
| M3.4 | Pack signing and verification |

Acceptance tests:

- A backup is "valid" only after re-read and hash match; a truncated read is refused.
- Changing module identity (different software level) disables named options and falls back to raw view.
- Bundle restores on a clean machine: files open, hashes verify.
- Catalogue entry without a "tested on" car fails CI.

## Phase 4: gated coding writes, small chassis set

Goal: write coding on a short list of modules where all of these hold: no unlock key needed, checksum rule known, read-back verified, revert tested on a bench.

Scope rule: start with one or two chassis and comfort-class options only (tier T1 in `coding-security-failsafe.md`). Safety modules and immobilizer stay blocked (T4).

Transaction (from the failsafe note): identity check, shadow copy, diff confirm, preflight, journal open, extended session, write, reset if required, read-back, commit or auto-revert, capped retries, respect NRC 0x36/0x37 timers, never loop on 0x27.

Milestones:

| ID | Milestone |
|---|---|
| M4.1 | Fault-injection suite green (power drop mid-write, 0x37, 0x72, link loss) |
| M4.2 | Journal recovery on restart after a killed process |
| M4.3 | Five options verified on a bench ECU and a real car |
| M4.4 | Per-profile "revertable" flag shown in UI |
| M4.5 | Independent review of the write path |

Acceptance tests:

- Kill the app between write and read-back: next start shows an open transaction and offers revert; revert restores the saved bytes.
- Force a read-back mismatch in the simulator: auto-revert runs, retries at most 2, then stops with recovery steps.
- Module with unknown software level: write button absent, not just disabled.
- Write attempt with voltage under threshold is blocked before any 0x2E is sent.
- A module that answers NRC 0x33 produces a plain "needs manufacturer authorization" message and no retries.

Release rule: ship Phase 4 as "beta, experimental" until at least 20 successful community write reports exist and zero unrecovered failures.

## Phase 5: Toyota/Lexus

Goal: best-in-class free hybrid battery view and standard diagnostics, then a few vetted actions (`toyota-lexus-techstream.md`).

- J2534 backend (Windows) plus SocketCAN and vetted ELM/STN for read-only.
- ECU discovery per VIN (addresses 7E0, 7E2, 7E3, 747, 7D2 conflict across sources, so no hard-coding).
- Hybrid pack: SOC, block voltages, temperatures, per generation and chemistry, each entry verified on a car. Cross-check Mode 21 vs 22 per generation.
- Battery health summary: block spread and trend.
- Later: DTC clear, small number of customize items and active tests, each reviewed per model with stored revert value.
- Not planned: ECU security key, key registration, reflash.

Acceptance tests:

- Same car on two adapters gives the same block voltages; a mismatch (such as -330 V on a bad adapter) flags the adapter, not the battery.
- Pack entry without a verification record fails CI.
- Alert thresholds differ for NiMH and Li-ion packs.

## Phase 6: Mercedes

Goal: honest, limited support (`mercedes-xentry-das.md`).

- DoIP transport (routing activation, logical addresses), SocketCAN ISO-TP for older cars.
- UDS reads, DTCs, live data from community entries.
- Optional user-supplied ODX/PDX read through odxtools. We never ship OEM ODX.
- Low-risk writes only where no SCN, flash role or SERMI authorization is needed, and only after Phase 4 safety proof.
- Detect authorization failures and explain. No seed-key calculators, no SCN emulation, no remote-session integration.
- Investigate a certified partner route only if the project gets legal support.

Acceptance tests:

- Routing activation response 0x10 handled; other codes show a clear message.
- NRC 0x33 on any write ends the session cleanly.
- Pack builds without any Mercedes-origin file (CI provenance check).

## Cross-cutting acceptance gates

| Gate | Test |
|---|---|
| Provenance | Every pack entry has source type (public standard, owner capture, community report) and contributor attestation |
| Licence | CI scans dependencies; GPL-2.0-only or GPL-3.0 in core fails |
| Safety | Fault-injection suite required for any release touching writes |
| Adapters | Qualification suite results published per adapter and firmware |
| Docs | Affiliation disclaimer in app, README and site; no OEM logos |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Not enough contributors with cars | High | High | Phase 0 needs none; learning mode; small target list; recruit on BMW forums |
| Bricked module in the wild | Medium | Very high | Phase 4 rules, beta label, tier system, refuse unknown modules |
| Data provenance contamination (ripped SGBD, CAFD) | Medium | Very high | Attestation, CI checks, reviewer sign-off, never accept files only entries |
| Legal: tool trafficking under DMCA 1201 | Medium | High | No key algorithms, no bypass; counsel review before Phase 4 |
| Legal: emissions defeat (Clean Air Act) | Low if enforced | High | Refusal list; block DPF/EGR/SCR changes |
| Trademark | Medium | Medium | Nominative use only; search "OpenDiag" before launch |
| Adapter variance | High | Medium | Qualification suite, tiering, voltage gate |
| HSFZ and addressing facts wrong | Medium | Medium | Capture before ship; configurable addresses |
| Maintainer burnout | High | High | Small scope, written contribution guide, second maintainer by Phase 2 |
| OEM tightens gateways (authentication) | Medium | High | Detect and stop; stay read-first |

## Community plan

- Repos: `opendiag` (code, Apache-2.0) and `opendiag-packs` (data, CC-BY, separate licence). Keep them apart so data rules cannot leak into code rules.
- Contribution flow: pull request with a pack entry, trace file, "tested on" car, and a signed-off attestation that no proprietary file was used.
- Trust levels per entry: verified, community-reported, experimental. Experimental hidden behind an expert switch.
- Roles: maintainer, pack reviewer (needs a car and bench), safety reviewer for write paths.
- Channels: GitHub Discussions first. Add a chat server only after 50 active contributors (unverified threshold, a guess).
- Good first issues: DTC text, live-data entries with traces, adapter qualification reports.
- Code of conduct, security policy, disclosure address for write-path bugs.
- Public "what we refuse" page, so expectations are clear.

## Hosting plan on free tiers

Needs are small: a static site, a pack download endpoint, optional bug-report intake, CI. Limits below were fetched in November 2026 and change; recheck before relying on them.

| Need | Service | Free limits | Plan |
|---|---|---|---|
| Landing page and docs | Cloudflare Pages | Static hosting (limits not re-fetched) | Host the existing landing page; docs built in CI |
| Pack index and signed downloads | Cloudflare Workers + Pages | Workers: 100,000 requests/day, 10 ms CPU per request, 50 subrequests, 64 MiB script | Serve a small JSON index; packs themselves as static files or GitHub Releases |
| Optional contributor accounts, trace uploads, entry voting | Supabase free | 500 MB database, 1 GB files, 5 GB egress, 50,000 MAU; projects pause after 1 week of inactivity, 2 active projects | Defer until needed; use a keep-alive job or accept pause; rely on GitHub for submissions first |
| CI and releases | GitHub Actions | Public repos: standard runners free. Private repos: $12 of included compute per month on the Free plan | Keep repos public; simulator tests run on virtual CAN in CI |
| Hardware-in-loop tests | Self-hosted runner (free) on a maintainer's bench machine | Free | Run write-path suite against a bench ECU, off the public internet |

Rules from the dev-box policy: services listen on 127.0.0.1, public access through Cloudflare, anything public has a cap and a log, no secrets in repos. Pack signing key goes in a secret store with a registry row, never in the repo. Public endpoints only serve static, signed data; no write endpoint is public without a login and rate limit.

Capacity check: 100,000 requests/day covers about 100,000 pack-index fetches; clients should cache and check at most once a day (design choice).

## Open questions

1. Who owns the first test cars and bench ECU? Phase order should follow them.
2. Which BMW modules are in the first write list? Needs bench evidence.
3. Does UNECE R155/R156 pressure change what gateways allow on new cars (unverified impact)?
4. How should emissions-adjacent options be handled in the EU vs the US?
5. Is a certified-partner route for Mercedes viable for a non-profit?
6. Does Cloudflare Pages free tier have limits that matter for pack size? Not fetched.

## Sources

Internal research: `docs/research/bmw-ista-architecture.md`, `bimmerlink-bimmercode-analysis.md`, `coding-security-failsafe.md`, `hardware-adapters.md`, `mercedes-xentry-das.md`, `open-source-landscape-and-legal.md`, `protocols.md`, `toyota-lexus-techstream.md`.

External:
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Supabase pricing: https://supabase.com/pricing
- GitHub Actions billing: https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions
- Linux can327 clone notes: https://docs.kernel.org/networking/device_drivers/can/can327.html
- python-doipclient primer: https://python-doipclient.readthedocs.io/en/latest/automotive_ethernet.html
- Scapy HSFZ: https://scapy.readthedocs.io/en/latest/api/scapy.contrib.automotive.bmw.hsfz.html
- Toyota hybrid PID threads: https://www.priuschat.com/goto/post?id=2489140
- Mercedes XENTRY Pass Thru EU: https://b2bconnect.mercedes-benz.com/LT/shop/workshop-solutions/xentry-pass-thru-eu
- 37 CFR 201.40 vehicle exemptions: https://www.ecfr.gov/current/title-37/chapter-II/subchapter-A/part-201/section-201.40
