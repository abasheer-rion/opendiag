# OpenDiag resource plan: next 3 months

Status: plan v0.1, written 2026-11-19. Window = M1 Dec 2026, M2 Jan 2027, M3 Feb 2027 (plus Week 0, 19 to 30 Nov 2026). Clean-room rule applies to every item here: public standards, public docs, owner captures, open-source projects only. No leaked or pirated OEM software or data, and no links to any. Not legal advice.

Price convention: `$` = USD. "(src)" = seen on a fetched or searched page on 2026-11-19, link in Sources. "(est)" = my estimate, not seen on a page. Marketplace prices move weekly; re-check before buying. Anything unverified says so.

## 0. Summary

- Must-only cash need over 3 months: **$638** (hardware $510, services $128). Recommended (Must + Should): **$2,203**. Everything incl. Nice: **$3,076**.
- Most cost is not hardware. The big variable lines are a bench ECU, a lawyer review before any write feature (Phase 4), and standards purchases (about CHF 800 if we bought all four; we recommend buying only 2 to 3).
- Software and hosting cost $0 on free tiers. Pack-signing hardware keys ($116) are the only mandatory services spend.
- The binding constraint is access to cars and a bench, not money or code (same conclusion as `docs/design/roadmap.md`).
- Architecture decision needed now: the repo is TypeScript, the design doc says Rust. Section 7 recommends staying on TypeScript for these 3 months.

## 1. Hardware shopping list

Why each item exists is tied to a phase in `docs/design/roadmap.md`. Qualification rule from `docs/research/hardware-adapters.md`: an adapter is "supported" only after passing our qualification suite, so we buy a spread of tiers on purpose.

### 1.1 Must (needed to finish Phases 0 to 2 against real hardware)

| # | Item | Why | Price | Where | Needed by |
|---|---|---|---|---|---|
| H1 | BMW ENET cable, 2 m, OBD to RJ45 (generic, F/G/I-series) | Full-access path for HSFZ/DoIP; resolves tester address 0xF4 vs 0xF1 and pin 8 voltage | $18 to $23 + shipping; budget $25 (src) | Walmart, Fruugo, Bimmergroup (19.89 EUR + 7.07 EUR ship), Newegg marketplace | Week 0 |
| H2 | OBDLink MX+ | Tier 1 STN reference adapter; BT + BLE | $139.95 Newegg; GBP 129.95 Gendan (src) | Newegg, scantool.net, Amazon | M1 W1 |
| H3 | Vgate vLinker MC+ (BLE) | Tier 2 comparison; BLE path for iOS testing | $49.99 on vgatemall, was $59.99, undated (src) | vgatemall.com, Amazon | M1 W1 |
| H4 | Generic ELM327 clone x2 (one Bluetooth, one WiFi) | Tier 3 baseline. Our clone-probing must detect `BUFFER FULL` and bad version strings on real junk | $15 each (est) | Amazon, AliExpress | M1 W1 |
| H5 | CANable 2.0 (or any candleLight-firmware USB-CAN) | Sniff and replay CAN on the bench; SocketCAN-style access on Linux | $19 to $35 marketplace (src); budget $30 | Newegg, reach.dog, Tindie | M1 W2 |
| H6 | USB-C gigabit Ethernet adapter | ENET from a laptop with no RJ45 port | $15 (est) | Amazon | Week 0 |
| H7 | OBD-II breakout box or 16-pin Y-cable with test points | Measure pin 8, pins 3/11/12/13, battery voltage, with the car on | $25 (est) | Amazon | M1 W1 |
| H8 | Basic digital multimeter | Pin 8 voltage (sources conflict: 5 V vs 12 V); never build an activation adapter before measuring | $25 (est) | Any | Week 0 |
| H9 | 12 V, 10 A regulated bench supply (13.8 V) | Powers bench modules. A weak supply causes failed writes (same failure as low car battery) | $40 (est) | Amazon, Mean Well type | M1 W2 |
| H10 | One bench ECU: cheap non-safety module | Real device for the Phase 2 and 3 acceptance tests. See 1.4 for what to avoid | $100 (est) | eBay, breaker yards | M2 W1 |
| H11 | Connectors, pigtails, fuses, wire | Wire the module to PSU, CAN and ENET | $30 (est) | Amazon, DigiKey | M1 W2 |

Must total: 25 + 140 + 50 + 30 + 30 + 15 + 25 + 25 + 40 + 100 + 30 = **$510**.

### 1.2 Should (raises quality; bought as cash allows)

| # | Item | Why | Price | Where | Needed by |
|---|---|---|---|---|---|
| S1 | OBDLink EX (USB) | Desktop wired STN adapter; also tests the unverified claim in our adapter matrix | $59.95 (src) | scantool.net, Newegg | M1 W3 |
| S2 | Vgate vLinker BM+ and FS (one each) | Tier 2 spread. Vendor claims STN command set; chip not documented, so test it | BM+ $36.99, FS USB $32.99 on vgatemall (src, undated). Budget $70 total | vgatemall.com | M1 W3 |
| S3 | K+DCAN FTDI cable | E-series BMW (pre-2012) coverage; test FTDI latency setting | $25 (est) | Turner Motorsport sells a style listing (src); Amazon | M1 W4 |
| S4 | Lab bench PSU, Korad KA3005P class (30 V, 5 A, current limit) | Current limit protects a bench module when wiring is wrong; programmable for power-drop fault tests | $100 to $165 new marketplace (src); budget $130 | eBay, Amazon | M2 W1 |
| S5 | Raspberry Pi 5 4GB + CAN HAT + case, PSU, SD | Always-on hardware-in-loop runner and CAN bridge, off the public internet | Pi 5 4GB official $110 after 2026 memory price rises (src). HAT $75 (est, not found). Case/PSU/SD $40 (est). Total $225 | Raspberry Pi approved resellers; Waveshare or SK Pang for HAT | M2 W2 |
| S6 | Bench ECU #2 and #3 (different module families) | Phase 2 needs 3 ECU families for M2.1 | $100 each (est) | eBay | M2 W2 |
| S7 | CTEK MXS 5.0 battery maintainer | Stable 13.x V during in-car sessions; precondition for any write test later | $103 to $114 US; GBP 75 to 95 UK (src). Budget $105 | Amazon, CTEK | M3 W1 |

Should total: 60 + 70 + 25 + 130 + 225 + 200 + 105 = **$815**.

### 1.3 Nice (Phase 5/6 prep, or luxury)

| # | Item | Why | Price | Where |
|---|---|---|---|---|
| N1 | Tactrix OpenPort 2.0 (J2534) | Windows J2534 backend test. Stock is unreliable: one retailer $199 backordered, others $26 to $76 and some are clones (src). Genuine availability unconfirmed | $150 budget | Tactrix direct; resellers |
| N2 | PEAK PCAN-USB | Gold-standard CAN reference to compare against CANable | $235 to $239 (src) | Digi-Key, reach.dog, PEAK resellers |
| N3 | Toyota hybrid battery ECU or used Prius/Lexus module | Phase 5 bench for Mode 21 vs 22 entries | $150 (est) | eBay, breakers |
| N4 | OBDLink CX (BLE-only) | Documented GATT behavior (FFF0/FFF1/FFF2, MTU 247); needed to test BLE on iOS | $80 (est; not found on a page) | scantool.net |
| N5 | 2-channel USB oscilloscope | Look at CAN levels and K-line on the bench | $120 (est) | Hantek, Amazon |

Nice hardware total: 150 + 239 + 150 + 80 + 120 = **$739**.

### 1.4 Bench ECU rules (applies to H10, S6, N3)

- Buy modules that are safe to experiment on: instrument cluster, infotainment head unit, lighting or comfort module, HVAC. Check the seller's photo for the part number and match it to a known donor car.
- Do not buy: airbag/SRS, immobilizer or key modules (CAS/FEM/EWS), ABS or engine controllers for write testing. These are on the refusal list (T4 in `docs/research/coding-security-failsafe.md`).
- Used modules may be VIN-locked or need a second module on the network to wake. Budget for one failure: buy a spare from the same family before assuming the bench works.
- Never buy anything labelled "unlocked", "virgin" or "cloned" for key or immobilizer purposes.

### 1.5 Hardware budget by tier

| Tier | Items | Total |
|---|---|---|
| Must | H1 to H11 | $510 |
| Should | S1 to S7 | $815 |
| Nice | N1 to N5 | $739 |
| All hardware | | $2,064 |

## 2. Test vehicle access plan

Goal by end of M3: captures from at least 2 BMW chassis (one F-series, one G-series) for Phase 1 gates M1.2, plus read-only captures from 1 Toyota hybrid and 1 Mercedes for protocol sanity. Phase 2 needs three verified service functions on real cars.

### 2.1 Sources of cars

| Source | Likely cars | How to ask | Risk | Cost |
|---|---|---|---|---|
| Owner's own cars | Unknown (open question, see Section 8) | Run `pnpm cli` scans, save captures | Lowest | Time |
| Friends and family | Mixed | 30 minute read-only session, written consent, one-page "what we do" sheet | Medium: do not touch their car with writes | Coffee |
| Forum volunteers (BimmerPost, Bimmerforums, MBWorld, PriusChat, ClubLexus, r/BMW, r/CarHacking; names from our research docs) | F/G BMW, Toyota hybrids | Public post with the safety page; read-only only; they run the capture, we receive a file | Medium: files can contain a VIN or location | Free; maybe small thanks gift |
| Independent garage or mechanic | Any | Pay for 1 hour of bay time to run scans on customer cars, with customer consent | Insurance and liability: garage rules | $50 to $100/hr (est) |
| Used or scrapped donor car | Single known chassis | Low cost way to get a powered module cluster | Large | Not in 3 month budget |

### 2.2 Right-to-repair angle (for recruiting and for legal stance, not for bypassing anything)

- US: the DMCA section 1201 exemption for vehicle diagnosis, repair and lawful modification is in 37 CFR 201.40. It gives no defense under EPA or DOT rules. Source: https://www.ecfr.gov/current/title-37/chapter-II/subchapter-A/part-201/section-201.40 (cited in `docs/design/roadmap.md`).
- EU: Regulation (EU) 2018/858 requires manufacturers to give independent operators repair and maintenance information. It does not give a free tool any right to OEM software. Security functions run through a separate vetting scheme (`docs/research/open-source-landscape-and-legal.md`).
- Use in outreach: "owner-controlled diagnostics, read-only first, no OEM files". Do not present this as legal clearance.

### 2.3 What we ask for from each volunteer

| Ask | Detail | Privacy rule |
|---|---|---|
| Car description | Make, model, model year, chassis code, engine, market, transmission, options-relevant notes | No plate, no owner name |
| VIN | Not shared. Tool hashes it locally (salted) and shows only the first 8 characters (WMI + VDS) if the volunteer opts in | Never in repo, never in issue text |
| Capture log | Output of `opendiag capture` (raw frames plus timing): adapter ID, firmware, ISO-TP frames, module scan, no free-text | Tool strips VIN, GPS, and file paths before export; volunteer reviews before sending |
| Scenario | Ignition on, engine off. Battery maintainer connected. Which adapter | Never ask for a write session in M1 to M3 except on the owner's car |
| Consent | Short text: what is captured, how it is stored, how to delete | Written, per session |
| Attestation | "I did not use any proprietary OEM file in this capture" | Required for pack entries (roadmap gate) |

Retention: captures stay in a private bucket (Cloudflare R2, section 3) until redacted; only redacted traces go in the public `opendiag-packs` repo.

### 2.4 Recruiting timeline

| When | Action | Target |
|---|---|---|
| Week 0 | Finalize consent sheet and capture instructions; owner scans own cars | 1 to 2 captures |
| M1 | Post on 3 forums with the safety page; ask 3 friends | 5 volunteers contacted, 2 sessions |
| M2 | Second wave; offer public credit in contributor list | 4 more sessions, 1 Toyota, 1 Mercedes |
| M3 | Review sessions, decide Phase 4 chassis shortlist | 8 total sessions, 2 chassis with 2+ cars each |

## 3. Software, accounts and services

Free-tier limits below were fetched 2026-11-19 unless marked. Check before relying on them.

### 3.1 Services

| Service | Use | Free limits | Cost for us | Trigger to pay |
|---|---|---|---|---|
| GitHub (public repos) | Code, issues, Discussions, Actions CI, Releases | Standard runners free on public repos. Private repos get $12 included Actions compute per month (from `roadmap.md`) | $0 | Never in 3 months. Keep repos public |
| GitHub self-hosted runner | Hardware-in-loop on the Pi | Free | $0 | n/a |
| Cloudflare Pages | Landing page, docs | 500 builds/month, 1 build at a time, 20,000 files/site, 25 MiB max file, 100 custom domains/project (src) | $0 | Pack files over 25 MiB (use R2) |
| Cloudflare Workers | Pack index API, bug intake | 100,000 requests/day, 10 ms CPU, 50 subrequests, 64 MiB script (src: workers limits page, per roadmap) | $0 | Over 100k req/day: clients should cache 24 h |
| Cloudflare R2 | Signed pack files, private capture bucket | 10 GB-month storage, 1M Class A ops, 10M Class B ops, free egress (src) | $0 | More than 10 GB of captures |
| Cloudflare D1 | Pack index metadata, contributor ledger (alternative to Supabase) | 5M rows read/day, 100k rows written/day, 5 GB, 10 databases (src) | $0 | n/a |
| Supabase free | Contributor accounts, trace upload metadata, votes. Migrations already in `supabase/migrations` | 500 MB DB, 1 GB files, 5 GB egress, 50,000 MAU, pauses after 1 week of inactivity, 2 active projects (src) | $0 | Pro is $25/month (src). Defer; prefer D1 + GitHub until accounts are needed |
| Sentry | Crash reports from CLI and web | Developer plan: 1 user, 5k errors, 5M spans, 5 GB logs, 30-day lookback (src). No open-source sponsorship stated on the pricing page | $0 | Team is $29/month ($26 annual) (src). Note: telemetry is off by default in the design; Sentry would be opt-in only |
| Crowdin | Translations | Free option for non-profit open-source projects, unlimited projects, strings, members; request an Open Source License (src) | $0 | Not needed before M3; apply in M3 |
| Domain | Project domain | Subdomain of endyland.com per dev-box policy costs $0. A standalone opendiag domain is optional | $0 or about $12/year (est) | Before public launch |
| Cloudflare tunnel | Expose local services if any | Free | $0 | n/a. DNS and tunnel changes need owner approval per dev-box rules |

### 3.2 Signing and distribution

| Item | What it is | Cost | When needed | Notes |
|---|---|---|---|---|
| Pack signing key | Signs data packs (design: M3.4 Pack signing and verification) | Hardware token: YubiKey 5 NFC, about $58 each, buy 2 (primary + offline backup) = $116 (src: Amazon US $58.00 Feb 2026; EU shops EUR 67 to 80) | M3 (before M3.4) | Per dev-box rules: key goes in the token or Keychain, registry row in `~/.claude/CREDENTIALS.md` in the same step, never in the repo. Ask owner before creating any key |
| Windows code signing (primary) | SignPath Foundation certificate | **$0** if eligible (src: signpath.org/terms). Needs OSI license (Apache-2.0 qualifies), automated build from source, MFA for all team members, manual approval for every release, code signing policy on the home page | When the first Windows binary ships (not in 3 months unless a desktop app lands) | Risk: their rules say no "tools that identify or exploit security vulnerabilities". A diagnostics and coding tool is probably fine but ask them before applying. Unverified |
| Windows code signing (fallback) | Azure Artifact Signing, Basic | $9.99/month, 5,000 signatures, public trust (src: Microsoft doc snippet; official page rendered without prices, so verify). Identity validation rules for individuals vary by country (unverified) | If SignPath refuses | Certum open-source certificates exist but I did not verify price or availability |
| macOS | Developer ID signing + notarization | Apple Developer Program $99/year (src: developer.apple.com). Nonprofit fee waiver exists (src) but needs a legal entity | Only when shipping a native macOS or iOS app. The CLI and web app need none | Defer past M3 unless TestFlight is a goal |
| Google Play | Android listing | $25 one-time (src). Personal accounts have testing requirements before publishing (count and duration not confirmed on the page I fetched) | Only if Android app is in scope | Defer past M3 |
| Apple MFi | Classic Bluetooth on iOS | Program cost unverified. Not planned | Never in 3 months | See `hardware-adapters.md` open question |

### 3.3 Development tooling

| Item | Status | Cost |
|---|---|---|
| Node 24 with type stripping (current core) | Installed; no build step | $0 |
| pnpm, TypeScript 5.9 | In repo (`pnpm-lock.yaml`, `typescript ^5.9.0`) | $0 |
| Rust toolchain (rustup) | Not installed. Install only if the Rust decision (section 7) flips | $0 |
| Virtual CAN (`vcan`) | Linux only. The Mac cannot run SocketCAN; use the Pi or a Linux VM for CI-style CAN tests | $0 |
| Claude (Claude Code and Anthropic API) | Existing owner plan. API cost for in-product features: none planned (offline-first). Cost of Claude subscription is outside this budget | not counted |

### 3.4 Services budget

| Line | Must | Should | Nice |
|---|---|---|---|
| Domain | $12 | | |
| YubiKey x2 | $116 | | |
| Legal review (1 to 2 hours with a software or IP lawyer before Phase 4; est $500 to $1,500, midpoint $750; ask EFF, SFLC or a law school clinic for pro bono first) | | $750 | |
| Apple Developer | | | $99 |
| Google Play | | | $25 |
| Azure Artifact Signing, one month, if SignPath refuses | | | $10 |
| **Total** | **$128** | **$750** | **$134** |

## 4. People, roles and time budget

### 4.1 Time assumptions

- Owner: 10 hours/week (assumption; replace with the real number). 13 weeks = 130 hours.
- Claude: does most implementation, doc drafting, test writing and research under owner review. Claude work is not billed in hours here but needs owner review time (counted below).
- Community and advisors are unpaid unless noted.

### 4.2 Roles

| Role | Who | Hours | What they do | Cost |
|---|---|---|---|---|
| Product owner and car access | Owner | 130 h over 13 weeks (see 4.3) | Decisions, review of every write-path change, bench work, captures | $0 |
| Implementation | Claude (Claude Code), owner reviews | Continuous; assume 25 to 40 agent-hours/week | Code, tests, docs, pack tooling, CI | Subscription |
| Safety reviewer (write path) | Second human | 6 h in M2, 10 h in M3 | Review the transaction design and fault-injection suite before Phase 4 starts (roadmap M4.5 "independent review") | Volunteer; budget $0, fall back to paid review $50 to $100/h (est) |
| Pack reviewer (needs car and bench) | 1 to 2 community reviewers | 2 h per week each from M2 | Check provenance attestations, trace files, "tested on" fields | Volunteers |
| Electronics advisor / mechanic | One friend or local garage | 4 h in M1 (pin 8 measurement, bench wiring), 2 h/month after | Check bench wiring, ECU wake-up, safe harbors. Required before powering any module from the bench supply | $0 favor, or $50 to $100/h (est), budget $200 inside contingency |
| Legal counsel | Pro bono or hourly | 1 to 2 h before Phase 4 | Review refusal list, Clean Air Act and DMCA 1201 exposure, trademark search for "OpenDiag" | Section 3.4 |
| Second maintainer | Recruit by end of M3 (roadmap says by Phase 2) | 3 h/week | Triage issues, merge rights | Volunteer |

### 4.3 Owner time allocation (130 h)

| Activity | M1 | M2 | M3 | Total |
|---|---|---|---|---|
| Hardware buy, unbox, wire bench | 12 | 6 | 2 | 20 |
| Car sessions and captures | 6 | 10 | 8 | 24 |
| Code and design review | 12 | 12 | 12 | 36 |
| Contribution guide, recruiting, forum posts, answering volunteers | 8 | 8 | 8 | 24 |
| Legal, accounts, signing, keys | 2 | 2 | 8 | 12 |
| Buffer and bench debugging | 2 | 6 | 6 | 14 |
| **Total** | **42** | **44** | **44** | **130** |

Reading: the owner is the bottleneck on cars, so M1 hardware work overlaps with Phase 1 coding done by Claude.

## 5. Knowledge resources

### 5.1 Standards: buy or skip

Prices are list prices at the standards body or a reseller on 2026-11-19. Do not copy standard text into the repo. Implement from public summaries, open-source code and captures; use paid standards only to resolve disputes.

| Standard | What for | Price | Buy? | Free alternative |
|---|---|---|---|---|
| ISO 14229-1:2020 (UDS) | Services, NRCs, sessions | CHF 221 (src: iso.org page via search); Amd 1:2022 CHF 18. A DIN page says a 2026-06 edition replaced the 2020 text; price of the new edition not checked | **Yes, one copy**: it settles NRC and timing questions | udsoncan source (MIT), CSS Electronics "UDS Explained" tutorial (readable without paywall; they also sell a PDF guide) |
| ISO 15765-2:2024 (ISO-TP) | Frame timing (STmin, BS, N_As etc.) | CHF 181 (src) | **Yes** (our fuzz and timing gates depend on exact timers) | python-can-isotp source (MIT), Linux can-isotp docs |
| ISO 13400-2:2025 (DoIP, transport and network) | Routing activation, vehicle announcement | CHF 204; 2019 edition CHF 199; Amd 1:2023 CHF 18 (src) | Defer to M2 unless DoIP bugs appear | python-doipclient (MIT) and its docs |
| SAE J1979 (OBD-II modes and PIDs), rev 202505 | Mode 01 to 0A tables | about $193 (Nimonik), 196.90 EUR incl. VAT (DIN Media) (src). SAE site price not found | Optional. Public PID tables on Wikipedia cover Phase 0 | Wikipedia OBD-II PIDs page (unverified current content), open-source PID tables used only as cross-checks |
| ISO 22901-1 (ODX) | Needed only if we write our own ODX reader | CHF 227 (from `open-source-landscape-and-legal.md`, not re-fetched) | No: use odxtools (MIT) | odxtools docs |
| ASAM MCD-2 D | ODX schema | Members or purchase, price not found | No | n/a |
| ISO 13400-3 / ISO 13400-4 (DoIP wired Ethernet pins) | Pin layout | Price not checked | No: python-doipclient primer covers pins | python-doipclient automotive Ethernet primer |
| ISO 15031 series (OBD emissions, including DTC format) | DTC code structure | Price not checked | No | Wikipedia DTC format, SAE J2012 summaries (unverified) |

Recommended purchase: ISO 14229-1 + ISO 15765-2 = CHF 402 (about $450 at roughly 1.12 USD/CHF; exchange rate is an estimate). Not included in the budget tables above as Must because the open-source code is enough for the work in this window; included as a decision in Section 8. If bought, add about $450 to M1.

### 5.2 Books and talks

| Item | Why | Price | Link status |
|---|---|---|---|
| The Car Hacker's Handbook, Craig Smith, No Starch, March 2016, 304 pp | CAN, UDS, tools, bench ECU practice. Dated on newer cars (no DoIP) but still the best starter | $49.99 print + free ebook, $39.99 ebook only (src: nostarch.com/carhacking) | fetched |
| CSS Electronics UDS tutorial | Practical UDS on CAN with ISO-TP, OBD2 vs OBDonUDS comparison | Free to read (src) | fetched |
| Linux kernel CAN docs (can327, can-isotp, SocketCAN) | Clone ELM327 failure modes | Free: https://docs.kernel.org/networking/device_drivers/can/can327.html | in our research docs |
| python-doipclient docs | DoIP and pin primer | Free: https://python-doipclient.readthedocs.io/en/latest/automotive_ethernet.html | in our research docs |
| Scapy HSFZ module docs | BMW HSFZ message layout (third-party description) | Free: https://scapy.readthedocs.io/en/latest/api/scapy.contrib.automotive.bmw.hsfz.html | in our research docs |
| Quantex HSFZ page | Ports, header, addressing | Free: https://quantexlab.com/en/develop/elm327_hsfz.html | in our research docs |
| DEF CON and other car hacking village talks | Practice with owner-side research and responsible disclosure | Free | not verified: pick specific talks in M1 |
| Vector, Kvaser and PEAK app notes on UDS/J2534 | J2534 behavior, differences v04.04 vs v05.00 | Free | Kvaser J2534 intro: https://kvaser.com/about-can/can-standards/j2534/ |

Reading plan: M1 week 1 UDS + ISO-TP tutorials; M1 W3 the Car Hacker's Handbook chapters on CAN and UDS; M2 DoIP primer; M3 J2534 and safety (the failsafe spec in our own repo).

## 6. Total cost by month

Window: M1 Dec 2026, M2 Jan 2027, M3 Feb 2027. Week 0 buys are counted in M1. USD.

### 6.1 Must-only

| Line | M1 | M2 | M3 | Total |
|---|---|---|---|---|
| Hardware (H1 to H9, H11) | 410 | 0 | 0 | 410 |
| Hardware: bench ECU (H10) | 0 | 100 | 0 | 100 |
| Domain | 12 | 0 | 0 | 12 |
| YubiKey x2 | 0 | 0 | 116 | 116 |
| Free services (GitHub, Cloudflare, Supabase, Sentry, Crowdin) | 0 | 0 | 0 | 0 |
| **Total** | **422** | **100** | **116** | **638** |

### 6.2 Must + Should (recommended)

| Line | M1 | M2 | M3 | Total |
|---|---|---|---|---|
| Must items | 422 | 100 | 116 | 638 |
| S1 OBDLink EX | 60 | | | 60 |
| S2 vLinker BM+ and FS | 70 | | | 70 |
| S3 K+DCAN cable | 25 | | | 25 |
| S4 Lab PSU | | 130 | | 130 |
| S5 Pi 5 + HAT + case | | 225 | | 225 |
| S6 Bench ECU #2 and #3 | | 200 | | 200 |
| S7 CTEK MXS 5.0 | | | 105 | 105 |
| Legal review | | | 750 | 750 |
| **Total** | **577** | **655** | **971** | **2,203** |

### 6.3 Full (all tiers)

| Line | M1 | M2 | M3 | Total |
|---|---|---|---|---|
| Must + Should | 577 | 655 | 971 | 2,203 |
| N1 Tactrix OpenPort 2.0 | | 150 | | 150 |
| N4 OBDLink CX | | 80 | | 80 |
| N5 Oscilloscope | | 120 | | 120 |
| N2 PEAK PCAN-USB | | | 239 | 239 |
| N3 Toyota hybrid module | | | 150 | 150 |
| Apple Developer Program | | | 99 | 99 |
| Google Play | | | 25 | 25 |
| Azure Artifact Signing, 1 month fallback | | | 10 | 10 |
| **Total** | **577** | **1,005** | **1,494** | **3,076** |

### 6.4 Not in the tables

| Item | Estimate | Note |
|---|---|---|
| ISO 14229-1 + ISO 15765-2 | about $450 (CHF 402) | Decision D3 |
| Shipping, tax, returns on marketplace items | add 10 to 15% | est |
| Contingency (broken module, wrong cable, mechanic hours) | $200 | est; mechanic time lives here |
| Claude subscription | n/a | Owner's existing plan |
| Supabase Pro, Sentry Team | $25 + $29 per month | Only if triggers in 3.1 hit; not expected |

## 7. Open source to reuse, and the language decision

The user's brief: leverage open source and extend it. Facts below were pulled from the GitHub API and npm registry on 2026-11-19 (no auth). "Last push" is the repo's last push date, a rough proxy for maintenance.

### 7.1 Reuse map

| Project | License | Last push | Use for OpenDiag | Verdict |
|---|---|---|---|---|
| pylessard/python-udsoncan | MIT | 2026-10-26 | UDS service encoding, NRC tables, test vectors | Use as reference and test oracle; port logic with MIT notice if needed |
| pylessard/python-can-isotp | MIT | 2026-11-10 | ISO-TP behavior and timing reference | Use as cross-check for our `isotp.ts` |
| hardbyte/python-can | LGPL-3.0 | 2026-11-15 | Adapter backends, reference for SLCAN/gs_usb quirks | Reference only (TypeScript core); LGPL |
| mercedes-benz/odxtools | MIT | 2026-11-17 | Read user-supplied ODX/PDX in Phase 6 | Use as a separate tool; we never ship OEM ODX |
| jacobschaer/python-doipclient | MIT | 2026-11-09 | DoIP reference and pin primer | Reference for `doip.ts` |
| collin80/SavvyCAN | MIT | 2026-11-17 | GUI sniffing; log formats | Recommend as a companion; export compatible logs |
| commaai/opendbc | MIT | 2026-11-19 | DBC signal definitions (not diagnostics) | Possible source for broadcast signals; check each file's provenance |
| commaai/panda | MIT | 2026-11-19 | Open CAN hardware firmware | Reference; not needed now |
| linux-can/can-utils | BSD-3-Clause + GPL-2.0-only mixed per its LICENSES dir (oss-leverage.md row 5) | 2026-10-14 | candump, isotpsend, canplayer | Use as external tools on the Pi only; never copy source or ship in releases |
| Ircama/ELM327-emulator | CC BY-NC-SA 4.0 per its LICENSE file (API shows NOASSERTION; oss-leverage.md row 26) | 2026-09-17 | Fake ELM327 | Do not use: NonCommercial. We have our own simulator |
| candle-usb/candleLight_fw | "Other" per API (NOASSERTION) | 2026-10-02 | Firmware for CANable-class adapters | Use as installed firmware, not linked |
| eclipse-opensovd/opensovd | Apache-2.0 | 2026-11-19 | Service-oriented vehicle diagnostics API (SOVD); 49 stars | Watch. Align our API naming where cheap. Unverified fit |
| socketcan-rs/socketcan-rs | MIT | 2026-09-05 | Rust SocketCAN bindings if Rust port happens | Later |
| rnd-ash/ecu_diagnostics | GPL-3.0 | 2026-08-21 | Rust UDS/KWP/J2534 library | Study only; GPL-3.0 stays out of an Apache-2.0 core |
| uholeschak/EdiabasLib | GPL-3.0 | 2026-11-19 | BMW EDIABAS replacement | Study architecture only; never copy |
| emdzej/ediabasx | NOASSERTION (custom LICENSE file) | 2026-07-06 | Third-party analysis of BMW ENET interface | Facts only; check license and provenance first. 18 stars |
| secdev/scapy | GPL-2.0 | 2026-11-19 | HSFZ contrib; packet crafting | Study and use as an external test tool, not linked |
| brendan-w/python-OBD | GPL-2.0 | 2025-04-07 | OBD-II over ELM327 | Do not link or copy; stale |
| jakka351/openj2534 | GPL-3.0 | 2026-05-19 | Open J2534 driver | Study only |
| richClubb/python-uds | MIT | 2026-06-02 | Alternative UDS stack | Archived; reference only |

npm packages for the TypeScript core (registry data, same date):

| Package | License | Latest version | Last publish | Role |
|---|---|---|---|---|
| serialport | MIT | 13.0.0 | 2024-12-24 | USB serial / ELM327 over USB, K+DCAN |
| @stoprocent/noble | MIT | 2.8.0 | 2026-08-20 | Desktop BLE central (maintained fork) |
| @abandonware/noble | MIT | 1.9.2-26 | 2025-02-09 | Older BLE fork; prefer the stoprocent fork |
| socketcan | MIT | 4.3.2 | 2026-10-03 | Linux SocketCAN from Node, for the Pi runner |
| @capacitor-community/bluetooth-le | MIT | 8.4.0 | 2026-11-18 | BLE in a Capacitor mobile shell if we go mobile |

### 7.2 What we extend instead of rebuild

- UDS/ISO-TP/DoIP/HSFZ: already written in `packages/core` (about 1,700 lines, 18 files, 2 test files). Extend with test vectors taken from udsoncan and python-can-isotp test suites (MIT) rather than inventing them.
- Simulator: keep our own (`sim.ts`, `sim-net.ts`); optionally run ELM327-emulator side by side as a second opinion once its license is read.
- Data: nothing legal to reuse for BMW/Mercedes/Toyota per-ECU meaning. That stays community-built in `opendiag-packs` with attestation.

### 7.3 Decision: TypeScript or Rust core

| Option | For | Against |
|---|---|---|
| Stay TypeScript (Node 24, no build step) | 1,700 lines already written and tested; Rust not installed; same language as UI; npm ecosystem has serialport, noble, socketcan; fast iteration for a solo dev | No iOS native path without a JS runtime; weaker memory-safety story for write path; WASM story is moot (already JS) |
| Rewrite in Rust now | Matches `architecture.md`; native + WASM; safety types | 2 to 4 weeks lost (est) before parity; toolchain not installed; solo capacity; blocks Phase 1 captures |
| Hybrid: TS now, Rust later for the write-path state machine only | Keeps speed now; limits rewrite to the part where memory safety matters | Needs language-neutral test vectors from day one |

**Recommendation: stay on TypeScript through M3.** Rule: all wire-format fixtures and fault-injection scenarios go in JSON files under `packages/core/test/fixtures` so a Rust port can reuse them. Re-decide at the end of M3 if (a) an iOS app without a JS runtime is required, or (b) the write path needs a language with stronger guarantees. Update `docs/design/architecture.md` section 4 to say "TypeScript core v0, Rust port deferred" (owner to approve the edit).

## 8. Decisions and open questions for the owner

| # | Question | Default if no answer | Impact |
|---|---|---|---|
| D1 | Which cars do you own, and which can you use for captures? | Plan assumes at least one BMW F/G | Drives chassis shortlist and Phase 1 gate M1.2 |
| D2 | Real weekly hours? | 10 h/week | Scales Section 4.3 |
| D3 | Buy ISO 14229-1 + 15765-2 (about $450)? | No, until a timing dispute appears | M1 cash |
| D4 | Approve the TypeScript decision and the architecture doc edit? | Yes, TypeScript through M3 | Architecture doc consistency |
| D5 | Which budget scenario: Must-only $638, recommended $2,203, or full $3,076? | Recommended | Cash plan |
| D6 | OK to create YubiKey-backed signing key in M3 (dev-box rule: ask before creating a key)? | Ask again in M3 | Pack signing milestone M3.4 |
| D7 | Second human for safety review and second maintainer: do you have names? | Recruit in M1 | Roadmap risk "maintainer burnout" |
| D8 | Standalone domain, or subdomain of endyland.com? | Subdomain (free) | $12 and DNS approval |

## Sources

Fetched or searched 2026-11-19. Prices from search snippets are marked "snippet"; open the link to confirm.

Hardware
- OBDLink MX+ ($139.95 Newegg, GBP 129.95 Gendan, snippet): https://www.newegg.com/p/0FB-0ACM-00002 and https://gendan.co.uk/product_OBDLINKMX.html and https://scantool.net/obdlink-mxp/
- OBDLink EX ($59.95, snippet): https://scantool.net/obdlink-ex/
- Vgate vLinker FS/MC+/BM+ prices (undated, snippet): https://www.vgatemall.com/products-detail/i-19
- Tactrix OpenPort 2.0 ($199 backordered, others lower, snippet): https://stmtuned.com/products/tactrix-openport-2-0
- ENET cable ($17.99 Walmart, Bimmergroup 19.89 EUR, snippet): https://bimmergroup.com/ENET
- CANable 2.0 and PCAN-USB (snippet): https://acceptance.reach.dog/shop/openlight-labs/products/canable-2-0 and https://reach.dog/shop/grid-connect/products/can-usb-adapter-pcan-usb
- Raspberry Pi 5 4GB $110 (snippet): https://www.tomshardware.com/raspberry-pi/raspberry-pi-5-price-increases-drastically-as-ai-shortage-bites-16gb-version-now-usd205-second-price-increase-in-three-months-over-70-percent-more-expensive-than-original-msrp
- CTEK MXS 5.0 (snippet): https://ctek.com/en-ca/products/mxs-5-0-na
- Korad KA3005P (snippet): https://www.ebay.com/itm/KORAD-KA3005P-Programmable-Precision-Variable-Adjustable-30V-5A-DC-Linear-/111455671404
- K+DCAN listing style: https://www.turnermotorsport.com/p-8677166-kdcan-cable-ftdi-ft232rl-style-obd2-cable
- Adapter facts (internal): `docs/research/hardware-adapters.md`

Services
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Cloudflare D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/
- Cloudflare Workers limits (via roadmap): https://developers.cloudflare.com/workers/platform/limits/
- Supabase pricing: https://supabase.com/pricing
- Sentry pricing: https://sentry.io/pricing/
- Crowdin pricing (open source option): https://crowdin.com/pricing
- Apple Developer Program: https://developer.apple.com/programs/whats-included/
- Google Play registration: https://support.google.com/googleplay/android-developer/answer/6112435
- SignPath Foundation terms: https://signpath.org/terms and https://about.signpath.io/product/open-source
- Azure Artifact Signing pricing (snippet, official page showed no prices): https://azure.microsoft.com/en-us/pricing/details/trusted-signing/
- YubiKey 5 series (snippet): https://www.yubico.com/au/store/yubikey-5-series/
- GitHub Actions billing (via roadmap): https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions

Standards and books
- ISO 14229-1:2020 CHF 221 (snippet): https://www.iso.org/standard/72439.html
- ISO 15765-2:2024 CHF 181 (snippet): https://www.iso.org/standard/84211.html
- ISO 13400-2:2025 CHF 204 (snippet): https://www.iso.org/standard/13400-2
- SAE J1979 reseller prices (snippet): https://standards.nimonik.com/products/sae/j1979/ and https://www.dinmedia.de/en/standard/sae-j-1979/392739101
- The Car Hacker's Handbook: https://nostarch.com/carhacking
- CSS Electronics UDS tutorial: https://www.csselectronics.com/pages/uds-protocol-tutorial-unified-diagnostic-services
- 37 CFR 201.40: https://www.ecfr.gov/current/title-37/chapter-II/subchapter-A/part-201/section-201.40

Open source (GitHub API, npm registry, 2026-11-19)
- https://github.com/pylessard/python-udsoncan, https://github.com/pylessard/python-can-isotp, https://github.com/hardbyte/python-can, https://github.com/mercedes-benz/odxtools, https://github.com/jacobschaer/python-doipclient, https://github.com/collin80/SavvyCAN, https://github.com/commaai/opendbc, https://github.com/commaai/panda, https://github.com/linux-can/can-utils, https://github.com/Ircama/ELM327-emulator, https://github.com/candle-usb/candleLight_fw, https://github.com/eclipse-opensovd/opensovd, https://github.com/socketcan-rs/socketcan-rs, https://github.com/rnd-ash/ecu_diagnostics, https://github.com/uholeschak/EdiabasLib, https://github.com/emdzej/ediabasx, https://github.com/secdev/scapy, https://github.com/brendan-w/python-OBD, https://github.com/jakka351/openj2534, https://github.com/richClubb/python-uds
- npm: https://www.npmjs.com/package/serialport, https://www.npmjs.com/package/@stoprocent/noble, https://www.npmjs.com/package/@abandonware/noble, https://www.npmjs.com/package/socketcan, https://www.npmjs.com/package/@capacitor-community/bluetooth-le

Internal: `docs/design/roadmap.md`, `docs/design/architecture.md`, `docs/research/*.md`.
