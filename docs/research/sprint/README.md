# Research sprint notes: index (day 2, 2026-11-24)

Written 2026-11-24 from a full read of the ten files in this folder. This page only points and summarises; every figure lives in the note named. Not legal advice. Status of the whole set: most notes are **PARTIAL** (Bimmerpost, Bimmerfest and Reddit would not load for our tools), and nothing has been run on a car yet.

## ANSWER FIRST

- The reading is done for Q5 and Q9 to Q12. Q1 to Q4 still need the car. Q10 needs a lawyer.
- Biggest surprises: the plan cites withdrawn ISO editions (RD-5); "OpenDiag" is already used by an active open-source adapter project (RD-6); the BM3 adapter pages never list the OBDLink CX (RD-2).
- Tonight's capture should widen its sniff filter, and allow one discovery probe on UDP 6811 and one optional DoIP probe, or three of the eight claims come back "no data" (see the changes list below).
- Four items need your yes: the DoIP probe, the UDP 6811 probe, reading AGPL prose docs, and the Bimmerpost saves.

## One line per note

| Note | What it answers, in one line |
|---|---|
| [rd1-hsfz.md](rd1-hsfz.md) | The HSFZ length field counts the two address bytes (3 sources agree), discovery is a bare 6-byte probe, and the ack and alive-check frames are still unproven. PARTIAL: no real trace was readable. |
| [rd2-bm3-adapters.md](rd2-bm3-adapters.md) | No source says bootmod3 works with the OBDLink CX; BM3 names only its own WiFi adapter and a wired ENET cable. BM3 wants an adjustable 20 to 50 A charger, never trickle. |
| [rd3-newer-cars.md](rd3-newer-cars.md) | Reading is open and writing is not on G-series; the coding catalogue shrinks by car platform more than by iDrive version. "Gateway locked" is not a BMW phrase. HSFZ versus DoIP by chassis is not settled publicly. |
| [rd4-voltage-failures.md](rd4-voltage-failures.md) | The voltage numbers measure different things: 12.5 and 12.0 V are rest health, 13 V and up is a supply level during programming. A charger being attached did not prevent failures (5 of 7 cases). |
| [rd5-standards.md](rd5-standards.md) | ISO prices confirmed (14229-1:2026 is CHF 227); the plan cited withdrawn editions; J1979-2 is required in California from model year 2027 and the federal date is only a proposal. Buy nothing today. |
| [rd6-legal.md](rd6-legal.md) | OBDb use as planned is fine with duties (credit, share-alike on changes); EU repair information is a right to buy, not to republish; the name "OpenDiag" collides with an existing project. Ten questions for counsel. |
| [rd7-plan-claims.md](rd7-plan-claims.md) | The plan's unverified claims mostly hold: node:sqlite is release-candidate and flagless, the attestation action was renamed, Google Play adds a 12-tester 14-day gate, GitHub private-repo minutes became a dollar credit. |
| [rd8-demand.md](rd8-demand.md) | Top coding asks are lights (18%) and connection trouble (17%); only about 29% of posts are servable read-only; Toyota and Mercedes stay deferred. Small samples, Bimmerpost unread. |
| [consent-sheet.md](consent-sheet.md) | One-page read-only promise and consent tick-boxes for the owner, before each capture session. No claims. |
| [capture-notes-template.md](capture-notes-template.md) | Fill-in form per session (sections 1 to 9 shared, 10 for CAP-A, 11 for CAP-B). No claims. Its two open questions: whether the CX app exports a log, and the exact JSON flag spelling. |

## Q1 to Q12 status

Status words: answered, partly, needs capture, needs counsel. The question text is in `docs/plan/research-sprint.md` section 1.

| Q | Status | Answer in one line | Lives in |
|---|---|---|---|
| Q1 | needs capture | Best reading: length counts the two address bytes, discovery probe is `00 00 00 00 00 11`, tester 0xF4; ack and alive-check layout are disputed or single-source until we see them on the wire. | [rd1-hsfz.md](rd1-hsfz.md) |
| Q2 | needs capture | Two apps say MHD and bootmod3 dongles present the same HSFZ path, one with a dated real-car test; nobody documents the dongle's address, ports or what it rewrites. | [rd1-hsfz.md](rd1-hsfz.md) |
| Q3 | needs capture | No source gives the CX services, characteristics or packet size; whether it reaches the head unit and central platform module on a 2023 or newer car is unknown. | [rd3-newer-cars.md](rd3-newer-cars.md), [rd2-bm3-adapters.md](rd2-bm3-adapters.md) |
| Q4 | needs capture | Still no published scan or read times; the only way is our own stopwatch and traces on the owner's car. | [rd1-hsfz.md](rd1-hsfz.md), [capture-notes-template.md](capture-notes-template.md) |
| Q5 | partly | Nothing shows BM3 working with the CX (not even failures); BM3 lists its WiFi adapter and ENET only. The owner's own experience is the missing piece. | [rd2-bm3-adapters.md](rd2-bm3-adapters.md) |
| Q6 | partly | Pin 8 enabling the Ethernet link is high confidence; whether it expects 5 V, a 510 ohm pull-up or about 12 V stays unresolved and a meter on a cable at rest will not settle it. | [rd1-hsfz.md](rd1-hsfz.md), [rd3-newer-cars.md](rd3-newer-cars.md) |
| Q7 | partly | Reads are open, writes are gated, and the gateway-locked idea is not a BMW term; chassis versus HSFZ or DoIP needs the owner's chassis and the capture. | [rd3-newer-cars.md](rd3-newer-cars.md) |
| Q8 | partly | The 12.6, 12.8 and 13 V figures are different things; BMW gives no programming floor; proposal is warn below 12.4 V, stop below 12.0 V on reads, 13.0 V steady for bench writes. No failure rate by voltage exists, so our logs are the only data. | [rd4-voltage-failures.md](rd4-voltage-failures.md) |
| Q9 | answered | ISO prices and withdrawn editions confirmed; SAE prices are reseller-only; J1979-2 is a California requirement from model year 2027, federal 2027 only proposed to move to 2029. | [rd5-standards.md](rd5-standards.md) |
| Q10 | needs counsel | OBDb plan matches its licence; EU 2018/858 and the 2026 amendment read; US right to repair is unsettled; name clash found. Ten questions are written for counsel. | [rd6-legal.md](rd6-legal.md) |
| Q11 | answered | Plan section 14 claims checked against official pages; four changed (sqlite status, action name, Play testing gate, Actions credit) and four stay unknown (Apple MFi cost, counsel cost, Supabase pause, Pages builds). | [rd7-plan-claims.md](rd7-plan-claims.md) |
| Q12 | answered | Lights and connection lead the threads; Toyota and Mercedes deferred (low to medium confidence, small samples). | [rd8-demand.md](rd8-demand.md) |

Counts: answered 3 (Q9, Q11, Q12), partly 4 (Q5 to Q8), needs capture 4 (Q1 to Q4), needs counsel 1 (Q10).

## The eight claims from RD-1 to test in tonight's capture

Source: the last section of [rd1-hsfz.md](rd1-hsfz.md), which has the exact byte patterns and pass or fail rules. Summary:

1. **Length counts the address bytes.** A VIN request (`22 F1 90`) should be 11 bytes on the wire with length 5; replies are 2 plus the UDS bytes.
2. **Every request gets an ack (0x0002) before the answer.** Record its length and payload, and whether tester-present and scan pings get one too.
3. **Source and target swap in the reply.** Reply starts with the target then 0xF4; the ack has 0xF4 first.
4. **Discovery probe and reply on UDP 6811.** Reply text holds `DIAGADR`, `BMWMAC`, `BMWVIN` in that order; record length versus text, DIAGADR digits, VIN length, padding. Needs a probe or a Wireshark catch; otherwise mark "no data".
5. **Alive check 0x0012 present or absent** over at least 5 minutes with idle gaps of 30 seconds or more; two apps disagree.
6. **Tester-present is acknowledged and holds the session.** Note whether the CLI sends `3E 80` or `3E 00` and what comes back.
7. **The dongle does not rewrite HSFZ.** Compare bytes sent and received; note reply source IP, TCP connection count, idle resets, ack delay, DHCP, open ports.
8. **Which destinations answer, and any 0x0040 or 0x0043 error words** from the normal scan. No deliberate wrong-address request tonight.

## Changes the notes imply for the capture procedure (flag only; section 4 not edited)

Where each applies in `docs/plan/research-sprint.md`:

1. **Sniff filter, 4.3 step 5.** The plan filters on `host <dongle address> or udp port 6811`. RD-1 asks for TCP 6801 and UDP 6811 on the whole interface, so broadcast discovery and any traffic not tagged with the dongle's address are not lost. Consider adding UDP 13400 and DHCP (ports 67 and 68) for claims 4 and 7 and the DoIP check.
2. **Discovery probe is not allowed today.** The 4.2 list has no UDP 6811 probe and the CLI has no discovery code. Claim 4 either needs a one-off probe sent by Claude from a scratch script, with your yes first, or Wireshark catching the dongle's own announcement. Decide before the session or accept "no data".
3. **Optional DoIP identification probe (RD-3, D3).** One read-only UDP broadcast on 13400, no routing activation, no TCP. It is outside the 4.2 table ("anything not in this table is not allowed"), so it needs an explicit added line and your yes.
4. **Dongle port check.** Q2 and claim 7 expect a short port check of the dongle. 4.3 has no step for it and 4.2 allows only AT commands over a plain TCP terminal. Either add a bounded, listed port check or drop that part of claim 7.
5. **Idle gaps and duration.** Claim 5 needs at least 5 minutes of connection with 30-second idle gaps. 4.3 runs commands back to back, so add a deliberate idle gap, still inside the 25 minutes no-maintainer limit.
6. **Time since last bootmod3 use (RD-2).** The car may refuse a wired session for 20 minutes to over an hour after BM3 WiFi use (two vendors disagree). Add a notes-sheet field for the time of the last BM3 session, and a line to avoid BM3 for several hours before. If no VIN returns, do not disconnect the battery (that is a change to the car); retry another day.
7. **Voltage logging (RD-4).** The ENET path has no voltage readout, so a multimeter at the socket is the only source in CAP-A. RD-4 wants four readings (ignition off, ignition on, with maintainer, engine running) and a flag when voltage drops 0.5 V or more from the start. The sprint rule has "start and end" plus "every few minutes"; the engine-running reading conflicts with 4.1 rule 6 (do not start the engine), so skip that one tonight. The 12.4 V start and 12.0 V stop rules match RD-4's proposal.
8. **Record chassis, head unit generation and BM3 tune state (RD-3).** P3 cannot be decided without them. 4.5 lists chassis; add head unit generation.
9. **Repo state, 4.3 step 2.** The step says to be on the `deep-research` branch or main. The repo is on main (the earlier research branches were merged), so only "main, no pulls, no code changes" applies.
10. **Pin 8 measurement, 4.3 step 10.** RD-1 says a resistance reading on a cable at rest does not settle 5 V versus 510 ohm versus about 12 V. Keep it optional, or skip it.
11. **The CX voltage check (RD-4).** Whether the CX reports voltage accurately needs a meter comparison; the plan does not schedule one. Add to CAP-B if a meter is on hand.
12. **Open client rule holds.** RD-2 confirms BM3 names piggyback tuners and OBD gauges as blockers; 4.1 rule 2 (one client, no BM3 app) matches and needs no change. The CX is also not a BM3-listed adapter, so do not test it with BM3 (4.4 step 5 already says so).

## Open decisions that need the owner

- Yes or no on the UDP 6811 probe and the optional DoIP probe (items 2 and 3 above).
- Yes or no on reading the AGPL prose docs of klartext (RD-1 left them unopened).
- Chassis, head unit generation and last BM3 use time (items 6 and 8).
- Save the Bimmerpost G05, G60, G70 coding threads and two or three coding index pages as text in the private folder (RD-3, RD-8).
- Name: counsel clearance search, or rename now (RD-6).

## Clean-room and reading notes

- No leaked, cracked or pirated OEM material was used in any note; RD-3 excluded one decompilation-derived page; RD-1 left GPL and AGPL code unopened.
- Every price and date in RD-5 and RD-7 is a list value seen on 2026-11-24 and can change.
- Several notes used a page fetcher that summarises with a small model; those figures are second-hand paraphrases and should be re-read at the moment of adoption.
