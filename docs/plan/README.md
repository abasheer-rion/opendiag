# OpenDiag plan docs (12 weeks, 2026-11-23 to 2027-02-12)

Written 2026-11-19. Clean-room rule applies to all of these: public standards, public docs, owner captures, open-source projects only.

| Doc | What it answers | Read it when |
|---|---|---|
| [project-plan.md](project-plan.md) | Master schedule: vision, metrics, week-by-week tasks with hours, milestones M1 to M4 with acceptance tests and demos, decision dates, top 15 risks, budget, cut list, rituals, first 48 hours. Also lists where the other four docs conflict and how it resolves them (section 0). | Start here. Re-read every Monday. |
| [architecture-12wk.md](architecture-12wk.md) | ADR-001 to ADR-012, package layout, interfaces, performance budget, threat model, gates G-A to G-F. | Before writing or reviewing code. |
| [resources.md](resources.md) | Hardware list with prices, test-car plan, services, people and hours, cash by month, open-source reuse map. | Before buying anything or asking someone for time. |
| [data-strategy.md](data-strategy.md) | Where data legitimately comes from, extraction tools, 200 DTC / 30 DID / 20 coding-option bootstrap, rejection rules, community growth. | Before adding or reviewing any pack entry. |
| [oss-leverage.md](oss-leverage.md) | What we adopt, wrap, port or only read (60 candidates, licences, maintenance dates), upstream contribution list. | Before adding a dependency or copying an idea. |

Related: [../design/roadmap.md](../design/roadmap.md) (phase list, acceptance tests, still the long-term schedule of record), [../README.md](../README.md) (research and design index).

## Precedence when documents disagree

1. `project-plan.md` section 0 (explicit resolutions) wins for scheduling, hours and what ships when.
2. `architecture-12wk.md` wins for architecture and gate definitions, except G-F real-car write wording, amended in project-plan.md C3.
3. `resources.md` wins for prices and purchasing; `data-strategy.md` wins for data rules; `oss-leverage.md` wins for licence verdicts.
4. `../design/architecture.md` section 4 (Rust core) is superseded by ADR-001 until a Rust trigger fires.

## Naming

- Milestones M1 to M4 are plan milestones (project-plan.md section 6). Resources months are written Dec, Jan, Feb. Roadmap ids like M1.1 always carry their phase prefix.
- Gates G-A to G-F are architecture quality gates. Decisions P1 to P13 are owner decision points with dates.
- Hours: O owner, C Claude, R reviewer, V volunteer.

## Status

Plan v0.1, nothing built against it yet. Update the weekly status table at the end of `project-plan.md` every Friday.
