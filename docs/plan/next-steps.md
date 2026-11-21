# Next steps (2026-11-21)

## What we now know
- Platform: Mac app first (Electron, React, shadcn on Base UI); phone and web-only deferred. See `platform-decision.md`.
- No clean free list of manufacturer fault codes exists. We build our own from public sources, own-car scans and reviewed contributions (`dtc-coverage-strategy.md`, `dtc-source-catalogue.md`).
- Copying vendor databases (BimmerCode, ISTA, scanner apps) is excluded by owner-reviewed policy. Counsel hour pending.

## Still unknown
- Real timings and ENET/BLE behaviour on the owner's car (sprint capture, Nov 25).
- Whether the CX reaches all modules.
- Fault-code effort: plan needs about 280 to 545 hours, budget is about 45.
- Scores in the architecture and UI docs are judgement, not measurements.
- The final consistency review of these docs did not run (usage limit). Treat cross-doc contradictions as possible.

## Decisions needed from the owner
1. Laptop or phone at the car? (Needed Nov 25; could change the platform.)
2. Exact adapter model names, and whether one cable is an ENET cable.
3. Clearing fault codes waits for bench modules: agree?
4. Skip Apple's $99 fee: agree?
5. One bounded NHTSA download to start fault-code ingestion: yes or no?
6. Book the 1-hour counsel review (weeks 2 to 3).

## First 5 build tasks after the sprint (Thu Nov 26)
1. Electron plus Vite shell with the simulator and a connect screen.
2. Proof-of-fit checklist for the UI stack (`ui-library-decision.md` section 11).
3. BLE transport for the OBDLink CX.
4. Fault list with plain-English text for the first 60 generic codes.
5. `scan --timing` and session log files to start measuring G1 to G3.
