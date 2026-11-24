# Owner decisions (2026-11-20)

These override anything in the other plan files that says otherwise.

| # | Decision | Effect on the plan |
|---|---|---|
| 1 | **Use share-alike data (OBDb, CC-BY-SA-4.0).** | OBDb-derived data goes in a separate pack that stays CC-BY-SA and is never mixed into our CC-BY/CC0 packs. Our code stays Apache-2.0. A short legal check is still worth doing before the first public release of that pack. |
| 2 | **Bench modules only for writes. Backups are mandatory.** | No write ever runs on a real car in the 12-week window. The write pipeline refuses to start without a verified backup (read twice, hashed). Real-car writes (old decision P11) are dropped, not deferred. |
| 3 | **Cut scope as we go.** | No cuts now. Each Friday the scoreboard in `kpis.md` decides what to drop. Hour targets are goals, not promises. |
| 4 | **Goals are outcomes (KPIs), not features.** | See `kpis.md`. Milestones are passed by hitting KPI targets. |
| 5 | **Milestone M2 moves from Dec 31 to Fri Jan 8.** | Holiday week no longer breaks the plan. |
| 6 | **Safety reviewer.** | Because writes are bench-only, a reviewer is wanted but not blocking. Writes stay compiled out of public builds until one signs off. |
| 7 | **First 3 days are research only (Nov 23 to 25).** | See `research-sprint.md`. Owner captures on own car are read-only. Coding starts Thu Nov 26. G-A moves to Tue Dec 1. P3 and P4 are decided inside the sprint. |

## What the owner already has

3 OBD adapters (WiFi and Bluetooth), the cables, and a bench power supply. This removes most of the hardware list in `resources.md`.

| Item (resources.md) | Status |
|---|---|
| H1 ENET cable, H2 OBDLink, H3 vLinker, H4 generic ELM327, H9 power supply | Owned (confirm which adapters exactly, see below) |
| H5 CANable, H6 USB-C Ethernet, H7 breakout box, H8 multimeter, H11 wiring | Buy only when a week needs it |
| H10 bench module | **Not owned. The one real purchase.** |

New cash plan: about $100 to $150 (bench module and wiring), bought around week 7. Everything else waits until a KPI needs it. The old $638 and $2,203 scenarios are retired. Free-tier services stay free.

To confirm: model names of the three adapters (it decides which adapter reports we can write) and whether one cable is an ENET cable.

## What a bench module is

A spare car control unit (for example a seat, mirror, light or comfort module bought used for roughly $30 to $100) sitting on your desk, powered by your power supply and connected to your laptop. It is a safe place to practise writing settings and restoring them, because breaking it costs a used part, not your car. It must be a non-safety module (never airbag, brakes or steering). Until it arrives, the simulator stands in.

## Sprint additions (2026-11-24)

| # | Decision | Effect |
|---|---|---|
| 8 | **Owner approved the UDP 6811 discovery probe and the DoIP vehicle-identification probe for CAP-A.** | Added to the allowed list in `research-sprint.md` 4.2. Single UDP packets only; no TCP, no routing activation. |
