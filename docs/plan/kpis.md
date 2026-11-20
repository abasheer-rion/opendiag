# KPIs and goals

Outcomes, not features. Each has a number today, a target at weeks 4, 8 and 12, and one way to measure it. Reviewed every Friday; a KPI that is behind decides what gets cut.

Baseline (2026-11-20): simulator only, 27 tests, nothing tried on a real car. The research sprint (Nov 23 to 25, `research-sprint.md`) adds a first real timing for G2 and G3 on Nov 25; targets are unchanged.

## Goals (what must be true at week 12)

| # | Goal | KPI | Today | Wk 4 | Wk 8 | Wk 12 | How measured |
|---|---|---|---|---|---|---|---|
| G1 | **It works on a real car.** | Real-car sessions that read all fault codes without error (sprint sessions count only with a saved trace) | 0 | 3 | 10 | 25 | Session log files |
| G2 | **It is fast.** | Full module scan over ENET, median seconds | measured Nov 25 (sprint) | sim under 2 s | real under 6 s | real under 4 s (stretch 2 s) | `scan --timing` on 5 runs |
| G3 | **It is fast on cheap adapters too.** | Quick read (VIN, all faults, 10 live values) over WiFi ELM327, median seconds | measured Nov 25 (sprint, if an ELM adapter was used) | under 6 | under 4 | under 3 | `quick` timing, 5 runs |
| G4 | **It never loses your settings.** | Write then restore round trips with identical hash (simulator through wk 8, bench module from wk 11) | 0 | sim 50 | sim 100 | bench 20 of 20 | Automated test |
| G5 | **It cannot write unsafely.** | Writes that run without a verified backup | 0 possible | 0 | 0 | 0 | Test that tries 100 bypasses |
| G6 | **It explains faults in plain English.** | Share of fault codes seen in real sessions that have a description | 0% | 30% | 60% | 80% | Count over captured sessions |
| G7 | **It reads module settings.** | Distinct real modules backed up and decoded | 0 | 3 | 8 | 15 | Backup store count |
| G8 | **Others can use it.** | New user from clone to first fault read, minutes | untested | 15 | 10 | 5 | Timed by a person who is not the author |
| G9 | **Others are helping.** | Outside people who ran it on their car and reported back | 0 | 1 | 4 | 10 | Issues and reports |
| G10 | **It is reliable.** | Scans and reads that finish without a retry, across all adapters | n/a | 90% | 95% | 98% | Session log success rate |
| G11 | **It stays clean.** | Contributions with source and license recorded | n/a | 100% | 100% | 100% | Pack linter in CI |
| G12 | **It stays cheap.** | Cash spent | $0 | under $50 | under $150 | under $200 | Receipts list |

> Evidence update 2026-11-20: (a) G2 and G3 have no public baseline. No source gives a scan time for ISTA, BimmerCode, Carly or OBDeleven, so "faster than the incumbents" needs us to time them on the owner's car first. (b) G3 says WiFi ELM327; per the owner brief the owner's adapters are an OBDLink CX (BLE) and a WiFi ENET adapter, which is not an ELM device, so G3 needs a BLE run on the CX or a WiFi ELM dongle.

## Quality gates (checked every week, not goals)

- Tests green on Node 24 and Node 26. Test count only goes up.
- No dependency with a GPL, AGPL or non-commercial license in the shipped code.
- No write capability reachable from a public build.

## Friday scoreboard

Copy this table into each Friday status note.

| KPI | Target this week | Actual | Status (on track / behind) | If behind: cut or fix |
|---|---|---|---|---|
| G1 | | | | |
| G2 | | | | |
| G3 | | | | |
| G4 | | | | |
| G5 | | | | |
| G6 | | | | |
| G7 | | | | |
| G8 | | | | |
| G9 | | | | |
| G10 | | | | |
| G11 | | | | |
| G12 | | | | |

## Milestones

| Milestone | Date | Passed when |
|---|---|---|
| M1 Fast read | Fri Dec 18 | G1 at least 3, G2 and G3 week-4 targets met |
| M2 Inspect and back up | **Fri Jan 8** | G7 at least 3, G5 holds, G6 at least 30% |
| M3 Write engine proven (simulator) | Fri Jan 15 | G4 at 100 of 100 on simulator, G5 holds |
| M4 Real hardware beta | Fri Feb 12 | Week-12 column met or explained; bench write and restore 20 of 20 |

Dates match `project-plan.md` section 6.0 with M2 moved to Jan 8.

## Why these

They measure what a user feels: it works, it is quick, it never loses settings, it explains faults, strangers can use it. Features are only the means.
