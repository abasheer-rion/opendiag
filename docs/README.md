# OpenDiag docs index

Clean-room rule for every doc here: public sources only, original wording, no OEM data files, no leaked software, no links to pirated or unlicensed copies. Claims marked "(unverified)" are not backed by a source we could fetch.

## Research (what exists and how it works)

| Doc | What it covers |
|---|---|
| [research/protocols.md](research/protocols.md) | OBD-II, UDS, ISO-TP, KWP2000, DoIP and BMW HSFZ, with public byte examples. |
| [research/hardware-adapters.md](research/hardware-adapters.md) | ELM327/STN clones, J2534, ENET cables, CAN adapters; which are safe for writes. |
| [research/bmw-ista-architecture.md](research/bmw-ista-architecture.md) | How the BMW toolchain (ISTA, E-Sys, EDIABAS) is organised and what is hard to replace. |
| [research/mercedes-xentry-das.md](research/mercedes-xentry-das.md) | How Mercedes DAS/XENTRY works, the authorization wall, and what stays out of scope. |
| [research/toyota-lexus-techstream.md](research/toyota-lexus-techstream.md) | Techstream, TIS paywall, hybrid battery PIDs, reflash and key limits. |
| [research/bimmerlink-bimmercode-analysis.md](research/bimmerlink-bimmercode-analysis.md) | What the consumer apps offer, their limits, and competitor pricing. |
| [research/coding-security-failsafe.md](research/coding-security-failsafe.md) | Seed/key security, SecOC, secure gateways, bricking causes, capability tiers T0 to T4. |
| [research/open-source-landscape-and-legal.md](research/open-source-landscape-and-legal.md) | Open-source tools and licences, DMCA 1201, emissions and safety law, refusal list. |

## Design (what we will build)

| Doc | What it covers |
|---|---|
| [design/architecture.md](design/architecture.md) | Layers, Rust core plus TypeScript UI, data-pack model, security model, simulator-first testing, milestones M0 to M6. |
| [design/roadmap.md](design/roadmap.md) | Phases 0 to 6 with acceptance tests, risks, community plan, free-tier hosting. Schedule of record. |
| [design/product-matrix.md](design/product-matrix.md) | Feature-by-feature comparison with the paywalled tools and where OpenDiag differs on purpose. |
| [design/data-schema.md](design/data-schema.md) | Data-pack file format, provenance and licence fields, community database and review flow. |
| [design/fault-handling.md](design/fault-handling.md) | Reading, explaining and clearing fault codes, and the local-only "ignore a fault" policy. |
| [design/failsafe-coding-spec.md](design/failsafe-coding-spec.md) | The write pipeline: backup, diff, consent, journal, verify, rollback; GREEN/AMBER/RED/BLOCKED tiers. |

## Terminology note

Two tier systems exist. T0 to T4 are capability tiers (architecture, coding-security doc). GREEN, AMBER, RED and BLOCKED are per-option risk tiers (failsafe spec); the mapping is in failsafe-coding-spec.md section 4. Adapter "Tier 1 to 3" is a separate hardware-quality scale.

## Review log (this pass)

- Removed links to likely unlicensed copies: a third-party-hosted BMW training PDF, four Scribd/SlideShare uploads, a hosted per-ECU SGBD page (derived from BMW data), forum threads about unlicensed Mercedes engineering tools, and clone-cable/reseller pages.
- Claims that relied on the removed BMW training PDF are marked unverified (programming flow, ICOM roles, 13 V charger rule).
- Aligned the minimum battery voltage (12.5 V) between the failsafe spec and the adapter research.
- Added the tier-name mapping; softened the HSFZ "no routing activation" claim to match the BMW doc.

## Known gaps

- No re-sourcing yet for the BMW programming flow and the 13 V rule; needs a public BMW or standards document.
- HSFZ header length semantics and routing-activation behaviour need a real-car capture.
- Not covered: VIN decoding, CAN FD, TPMS and DPF-regeneration service functions, actuator tests (UDS 0x2F) design, localisation, accessibility beyond one mention.
- Odometer, speed-limiter and ADAS calibration law is not researched (marked unverified in the failsafe spec).
- Mercedes SecOC/authentication on newer cars and BMW G-series coding authentication are open questions.
- Toyota 2022+ (GTS+, DoIP, ECU security) behaviour rests on vendor claims only.
- Adapter certification needs bench tests; nothing has been run on real hardware.
- Legal review (DMCA 1201, EPA, trademark and name search) is still a launch blocker; the legal doc is research, not legal advice.
- Free-tier limits (Workers, Supabase, Actions) were fetched in Nov 2026 and must be rechecked.
- Remaining forum and enthusiast sources (bimmerpost, priuschat, bmw-syndikat) are secondhand and should be corroborated by captures.
