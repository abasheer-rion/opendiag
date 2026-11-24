# Research sprint: Mon Nov 23 to Wed Nov 25, 2026

Status: plan, written 2026-11-20. Owner decision: the first three days of the project are research only. No feature code is written in these days. The 24 deep research notes in `docs/research/deep/` are the starting point; this sprint closes the gaps they list as open, using the owner's own car and adapters (read-only) plus targeted reading. Clean-room rule unchanged: public docs, forum discussion read as discussion, our own captures; no leaked OEM software or data, no seed-key material, no circumvention. Not legal advice.

How this relates to the rest of the plan: week 1 of `project-plan.md` is edited (section 8 below) so that coding starts Thursday Nov 26. Gate G-A moves to Tue Dec 1. Nothing else on the milestone dates moves.

## 1. What the deep run left unanswered

From the "Open questions" of the deep notes, grouped by who can answer them. Items marked * are the ones that change what we build in weeks 2 to 4.

| # | Question | Source note | Best way to answer | Sprint task |
|---|---|---|---|---|
| Q1* | Byte layout of ENET discovery (UDP 6811), whether the length field counts the address bytes, what the acknowledge and alive-check frames carry, which tester address the gateway accepts | bmw-enet-hsfz-wire-protocol | Owner capture on own car | CAP-A, CAP-B |
| Q2* | Does the WiFi ENET dongle pass TCP through unchanged, and what is its default address and open ports | same; adapter-hardware | Owner capture plus a short port check of the dongle | CAP-A |
| Q3* | OBDLink CX: services, characteristics, negotiated packet size, what it does on a BMW OBD socket (which modules answer) | adapter-hardware; bmw-modules | Owner BLE inspection and a read-only session | CAP-C |
| Q4* | Real scan and read times, by adapter, on the owner's car (no published numbers exist) | speed-and-latency | Owner stopwatch plus traces | CAP-A to C |
| Q5* | Does BM3 work with the CX or only with ENET and certain adapters; what does BM3 say about chargers and adapters | bootmod3-platform; bm3-adapters | Reading, owner's own BM3 knowledge | RD-2 |
| Q6 | What the pin 8 activation line expects, 5 V or 12 V (sources conflict) | hsfz; adapter-hardware | Owner measures the cable at rest (only if a multimeter is owned) | CAP-A prep |
| Q7 | G-series gateway behaviour, iDrive 8 and 8.5 coding limits, "gateway locked" reports | bmw-newer-cars | Reading, then chassis decision P3 | RD-3 |
| Q8 | Minimum safe battery voltage and why failures happen with a charger attached (sources disagree: 12.6, 12.8, 13) | bmw-coding-failures | Reading, plus voltage readings we log ourselves | RD-4, CAP-A |
| Q9 | Standards: prices, whether purchase is needed; CARB and EPA dates for J1979-2 | diagnostic-standards | Reading primary pages | RD-5 |
| Q10 | Legal: OBDb share-alike check, EU repair-information rules, US right-to-repair status, name search "OpenDiag" | legal-regulatory | Reading primary sources, then counsel booking | RD-6 |
| Q11 | Claims in `project-plan.md` section 14 marked unverified (node:sqlite on Node 24, build attestation, store fees, free-tier limits) | project-plan | Reading official docs | RD-7 |
| Q12 | Which coding goals people ask for most; which Toyota or Mercedes facts are worth keeping | coding-demand; toyota; mercedes | Thread sampling | RD-8 |

## 2. Rules for everything in this sprint

- Reading only on the car. Nothing is written to any module. Nothing is cleared. Nothing is flashed.
- The repo stays clean: raw captures never go in git. Notes go in `docs/research/sprint/` (new folder, created Monday).
- Every sprint note follows the deep-run format: answer first, a source ledger, single-source claims marked, disagreements named, failed pages listed. Quote at most one short phrase per source.
- Do not open leaked or cracked software, data files or key tools. Do not reproduce proprietary data. GPL or non-commercial code: README only.
- Pages that fail to load (Bimmerpost, Reddit, the BM3 help centre, Spoolstreet and the Haynes pages failed in the deep run): Claude retries once through the browser tool on Monday. If still blocked, the owner saves the page as text into the private folder and Claude reads it from there. Reading is fine; redistribution is not.

## 3. Hour-by-hour plan

O is the owner, C is Claude. Times are local. Owner total: 10.25 h, in line with the week-1 figure of 10 h. Claude total: about 28 agent-hours (parallel agents). Each Claude task writes one note in `docs/research/sprint/`.

### Day 1, Monday Nov 23: set up, inventory, reading. No car.

| Time | Who | Task | Output |
|---|---|---|---|
| 09:00 to 09:30 | O + C | Monday brief. Read sections 3 to 7 of this file. Say no to anything you disagree with. | Approved plan |
| 09:30 to 10:30 | O | Inventory (old W1.11). Write in `inventory.md` in the private folder: car model, year, chassis code; whether it is tuned with BM3 and which map or software; exact model names of the 3 adapters and which one is the WiFi ENET and which cable is ENET; whether you own a multimeter and a battery charger or maintainer (brand, amps, whether it has a "supply" mode); laptop OS. | Inventory |
| 10:30 to 11:15 | O | Decide P1 and P2 (first-48-hours items). Order only what the sprint needs: if no ENET cable is owned, order one now (est $25) so it arrives by Dec 4. Nothing else is bought this week. | P1, P2 recorded |
| 11:15 to 12:00 | O | Prepare the laptop: check that `tcpdump` runs with sudo (it ships with macOS); confirm you can set a static address on the Wi-Fi or Ethernet port; create the private capture folder (below). Rehearse every command in section 4 against the built-in simulator (`--adapter sim`) so Tuesday has no surprises. Do not install anything globally; if you want Wireshark for viewing, tell Claude first (dev-box rule). | Rehearsal log |
| 09:00 to 11:00 | C | Housekeeping and base: run `pnpm typecheck && pnpm test` once (baseline 27 pass, no code change). Draft the consent sheet and the capture notes template (old W1.10). Create `docs/research/sprint/`. | Baseline, templates |
| 09:30 to 13:30 | C | RD-1: HSFZ and ENET in the field. Search and read forum threads and write-ups that show real ENET captures or describe the discovery and tester address behaviour (E90Post, Bimmerpost, Bimmerfest, Reddit r/BMW and r/BMWcoding, GitHub READMEs of HSFZ and DoIP libraries). Read library docs; GPL and non-commercial code is README only. | `rd1-hsfz.md` |
| 13:30 to 17:00 | C | RD-2: bootmod3 with the CX, ENET and WiFi adapters; BM3's own advice on chargers and adapters; flash-interruption reports. Retry the BM3 help centre through the browser tool. | `rd2-bm3-adapters.md` |
| 16:00 to 16:30 | O | Read `rd1-hsfz.md` summary; list any question you want the car to answer. | Question list |

### Day 2, Tuesday Nov 24: reading, rules, first capture (WiFi ENET)

| Time | Who | Task | Output |
|---|---|---|---|
| 09:00 to 09:45 | O | Trademark and name check for "OpenDiag" (USPTO search, a web search, GitHub and package names). Book the counsel scoping call for the week of Dec 7 (P4 brought forward, no cost until the call). | Name note; call booked |
| 09:45 to 10:15 | O | Review the capture procedure (section 4) and consent sheet. Confirm the stop rules. | Approved procedure |
| 09:00 to 13:00 | C | RD-3: G-series gateway, iDrive 8 and 8.5 coding limits, "gateway locked" reports, HSFZ versus DoIP by chassis. | `rd3-newer-cars.md` |
| 09:00 to 12:00 | C | RD-4: coding and flash failures with a charger attached; minimum voltage claims side by side. | `rd4-voltage-failures.md` |
| 13:00 to 16:00 | C | RD-5: standards prices and previews (ISO store, SAE, ASAM, AUTOSAR terms); CARB regulation text and EPA rule for J1979-2 dates. | `rd5-standards.md` |
| 17:00 to 18:30 | C | Prepare the analysis scripts for Wednesday: a small offline script that turns the pcap and CLI JSON into hex frame lists (no network access, reads from the private folder). Not shipped, not committed. | Scratch script |
| 19:00 to 20:30 | O | **CAP-A: WiFi ENET session with the OpenDiag CLI and tcpdump** (section 4.3). | Raw capture A |
| 20:30 to 21:00 | O | Fill the capture notes sheet while it is fresh. Move files into the private folder. | Notes A |

### Day 3, Wednesday Nov 25: second capture, analysis, decisions

| Time | Who | Task | Output |
|---|---|---|---|
| 09:00 to 10:00 | C | Analyse capture A (private folder): discovery bytes, length semantics, acknowledge and alive-check frames, tester address, scan time. Write answers to Q1, Q2, Q4 with the evidence as hex frames (no MAC addresses, no VIN). | `cap-a-findings.md` |
| 09:00 to 15:00 | C | RD-6: legal primary sources (OBDb licence text and README; EU 2018/858 Articles 61 to 66; US federal and Massachusetts status; EPA tuner enforcement). RD-7: unverified plan claims (Node, GitHub attestation, store fees, free-tier limits). RD-8: thread sampling for coding demand and Toyota and Mercedes gap-filling (2 h). | `rd6-legal.md`, `rd7-plan-claims.md`, `rd8-demand-gaps.md` |
| 10:00 to 10:30 | O | Read `cap-a-findings.md`; decide what CAP-B should repeat or add. | CAP-B list |
| 18:30 to 20:00 | O | **CAP-B: OBDLink CX (BLE) session** (section 4.4). | Raw capture B |
| 20:00 to 20:30 | O | Notes sheet B; move files to the private folder. | Notes B |
| 20:30 to 21:00 | C | Analyse capture B quickly (CX read results, timing) and update the findings note. Update `docs/research/sprint/README.md` index. | `cap-b-findings.md` |
| 21:00 to 22:00 | O | **Decision session** (section 6). Answer the checklist. Claude records each answer in `docs/plan/decisions.md` the same night. | Decisions recorded |

Owner hours: Mon 3.5, Tue 3.25, Wed 3.5, total 10.25.

If a car session cannot happen on its night, it moves to the next evening and the decision session moves with it; nothing in section 8 changes except the Thursday start date, which would slip one day. Do not compress a car session to catch up.

## 4. The read-only capture procedure (owner)

### 4.1 Safety rules (read these before every session)

1. **Reading only.** The only requests allowed are the ones in the list in 4.2. If a tool asks to write, code, flash, clear codes, reset adaptations or "apply", stop and do nothing.
2. **One client at a time.** Close bootmod3, BimmerCode, OBDLink, BimmerLink, Carly and any other car app on every phone and tablet. Switch their Bluetooth and Wi-Fi permissions off if unsure. Only one adapter in the OBD socket at a time. Do not run the CLI and a phone app together, even if both connect.
3. **bootmod3 stays out.** Do not open the BM3 app, do not start a log, do not connect the BM3 adapter. If a BM3 flash was interrupted or failed recently, do not do the session until the car is stable and you have confirmed it with BM3.
4. **Never flash. Never code. Never clear.** The CLI command `clear` is banned for this sprint. So are `backup`, requests that change the diagnostic session, and anything that needs a security unlock. New communication faults may appear in the car after a scan because modules were woken: write them down, do not clear them.
5. **Battery.** Measure the resting battery voltage before starting (multimeter at the battery or the adapter's own voltage reading). Start only at 12.4 V or more. Connect a battery maintainer or charger in a low-current "supply" or "maintainer" mode if you have one. Do not use a high-output charger on a boost or quick-charge setting, and do not use a charger of unknown type. If you have no maintainer, keep each session under 25 minutes with the ignition on and stop the session if the voltage you read falls below 12.0 V. These thresholds are our own conservative rule; the deep run found the public advice disagrees (12.6, 12.8 or 13 V) and is unproven, so the sprint records voltage every few minutes to help settle it.
6. **Ignition state.** Engine off, ignition on (the position that lights the dashboard), car stationary, handbrake on, in park or neutral, doors closed, key fob inside the car. Nothing running that draws large current: lights off, climate off, radio off. Do not start the engine during a session.
7. **Place.** Parked outdoors or in a well-ventilated space. If you must end a session, turn the ignition off and wait 30 seconds before unplugging the adapter.
8. **Stop rules.** Stop at once and unplug if: any new warning lamp stays lit after you finish; the cluster restarts or behaves strangely; you smell or see anything hot at the OBD socket; the adapter becomes hot; voltage falls below 12.0 V; or anything surprises you. Then write down what happened before doing anything else. Do not retry the same day.
9. **Rate.** The CLI sends one request at a time. Do not loop a command. Keep each module range small (listed below).
10. **Privacy.** Do not photograph the VIN plate or paste the VIN anywhere. Keep Wi-Fi and BLE names out of notes shared outside the private folder.

### 4.2 Allowed requests

| Allowed | Command or action | What it sends |
|---|---|---|
| Read the VIN | `pnpm cli vin --adapter ...` | Standard read of the VIN identifier |
| Read fault codes | `pnpm cli dtc ...` | Standard read of stored faults |
| List supported live values and read ten | `pnpm cli pids ...`, `pnpm cli live --count 5 ...` | Standard live-data reads |
| Find modules | `pnpm cli scan --range 0x10-0x7f ...` | A "tester present" ping to each address, one at a time, 300 ms timeout each |
| Read one identification item from a module that answered | `pnpm cli did --target A --did 0xF190 ...` | Standard read of one identifier |
| List readable identification items on a few modules | `pnpm cli probe --target A --range 0xF180-0xF19F ...` for at most 5 modules | Standard reads, 32 identifiers each |
| Adapter identity (WiFi ELM only) | Open a plain TCP terminal to the dongle and send identity commands only (`ATZ`, `ATI`, `AT@1`, `ATRV`) | Adapter-only commands, nothing goes to the car |
| Reading app screens (CX session) | Vendor app: connect, read faults, read supported live values; no clear, no coding | Standard reads |

Anything not in this table is not allowed in the sprint.

### 4.3 CAP-A: WiFi ENET adapter and the OpenDiag CLI (Tuesday)

Goal: answer Q1, Q2, Q4 and gather voltage readings (Q8).

Before the car:
1. Create the private folder: `~/Projects/opendiag-captures-private/2026-11-24-capA/` with mode 700. It is outside the repo.
2. Check that the repo is clean and on `main`; do not run `git pull` or change code during the session.
3. Read the dongle's manual or label for its Wi-Fi name and default address. Write them in the notes, not in chat.

In the car, in order:
1. Measure battery voltage (4.1 rule 5). Note it.
2. Connect the maintainer if you have one.
3. Plug the WiFi ENET adapter into the OBD socket. Ignition on, engine off.
4. Wait 30 seconds. Join the dongle's Wi-Fi from the laptop. Note the address the laptop gets and the dongle's address. Do not browse the internet; turn off background sync.
5. In one terminal start the capture on the whole interface: `sudo tcpdump -i <wifi interface> -w capA.pcap -s 0 'tcp port 6801 or udp port 6811 or udp port 13400 or udp port 67 or udp port 68'`. Leave it running.
6. In another terminal run, one after the other, noting the wall-clock time with `time` before each: `vin`, `dtc`, `pids`, `scan --range 0x10-0x7f`, then for up to 5 modules that answered: `did --did 0xF190`, then `probe --range 0xF180-0xF19F`. Use `--adapter enet:<dongle address>`. Save each command's `--json` output to a file (`vin.json`, `dtc.json`, and so on).
7. Repeat `vin` and `scan` once more, for a second timing sample. Then stay connected and idle for 5 minutes (nothing sent), then run `vin` once more. Keep the whole session under 25 minutes if no maintainer is connected.
8. Stop the capture. Turn ignition off. Wait 30 seconds. Unplug the adapter.
9. Note the voltage again and any new lamps or faults.
10. Optional, only if you own a multimeter and the ENET cable (not the dongle): with the cable unplugged from the car, measure resistance between pin 8 and the signal ground and battery ground pins of the car-end connector, and record the numbers. This is a passive measurement on a cable at rest. Do not probe the car's own socket.

If the CLI cannot find the adapter, do not experiment. Write down the error and stop; Claude will check the transport code against the capture.

### 4.4 CAP-B: OBDLink CX over Bluetooth Low Energy (Wednesday)

Goal: answer Q3 and extend Q4 with a second adapter type. The laptop CLI has no Bluetooth adapter yet (it comes in weeks 2 to 3), so this session uses the phone.

1. Same preparation as CAP-A: private folder `2026-11-25-capB/`, voltage reading, maintainer, ignition on, engine off.
2. Before plugging into the car, check that the phone has a free BLE inspector app (for example a generic GATT browser, installed from the official store by you) and the vendor app for the CX. Close every other car app.
3. Plug in the CX. With the ignition on, open the inspector app, find the CX, connect, and screenshot the list of services and characteristics and the packet size shown. Do not write to any characteristic. Disconnect.
4. Open the vendor app. Read faults and read the supported live values. Record the screen with the phone's screen recorder and keep a stopwatch note of the time to connect and the time to finish each read. If the app offers a text log or terminal export that does not require writing to the car, save it; if it does not, the screen recording is the record. (Whether the app offers this is not known to us; do not buy anything for it.)
5. Do not open the BM3 app. Do not test whether BM3 sees the CX; that is a read of the BM3 rules in RD-2, not a car test.
6. Ignition off, wait 30 seconds, unplug, note voltage and lamps.

### 4.5 What to record (notes sheet, one per session)

- Date, start and end times, car model, year, chassis; BM3 tune state (tuned or stock, map name). Head unit generation (iDrive version). Time of your last bootmod3 session (avoid BM3 for several hours before; if no VIN returns, do not disconnect the battery, retry another day).
- Adapter, firmware shown, connection method, address (kept in the private notes only).
- Battery voltage at start, midway and end; whether a maintainer was connected. Multimeter readings at the socket: ignition off, ignition on, with maintainer. Do not start the engine to take one. Stop if voltage falls 0.5 V or more from the start.
- For each command: wall time in seconds, success or error text, number of modules that answered.
- Anything unusual: warning lamps, cluster behaviour, slow replies, disconnects.
- Which apps were closed, and a line confirming that no write, clear or code action was performed.

### 4.6 How to store: raw private, shareable anonymised

Raw material (pcap, JSON, screenshots, screen recordings, notes) stays in `~/Projects/opendiag-captures-private/<date>-<session>/`, mode 700, not backed up to a cloud service that is shared, never committed. Treat it as personal data because it contains the VIN, network addresses and Bluetooth identities.

Format for sharing: `.odtrace`, the JSONL format from task W1.7: request bytes, response bytes, timestamps, adapter model, voltage, and a VIN hash. The recorder is built in week 2; until then Claude converts the raw capture with a one-off script in the scratch folder (Wednesday), and the real converter ships with W1.7 on Fri Nov 27.

Anonymise before anything leaves the private folder:
1. Replace the VIN with a salted hash (salt kept in the private folder; never published).
2. Remove or zero MAC addresses, IP addresses and Wi-Fi or Bluetooth names. Share frames as hex of the HSFZ payload only; never share a raw pcap.
3. Drop any identifier whose value could identify the owner or the car (VIN, mileage-like counters, order data, key data, dealer data). If unsure whether an identifier is personal, leave it out.
4. Round timestamps to the second and drop absolute dates.
5. The owner reads the final file once and says yes in chat before it is committed to `docs/captures/` or posted to a forum. Claude does not publish captures on its own.

Share with: the repo (anonymised `.odtrace` only), the counsel call (description only), and the forum posts of week 1 and week 2 (hex of a few frames to ask a cross-check question).

## 5. Reading plan (Claude, with specific targets)

| Id | Question | Where to read | Done when |
|---|---|---|---|
| RD-1 | Q1, Q2: ENET discovery, length, tester address, alive check | Forum threads that show real ENET traces or explain tester address (E90Post, Bimmerpost, Bimmerfest, r/BMWcoding); README and docs of open HSFZ and DoIP libraries; the Black Hat paper already used; Scapy and Wireshark field docs | 10 or more sources read; a list of 8 byte-level claims to test against capture A |
| RD-2 | Q5: BM3 and adapters, chargers, interrupted flashes | BM3 help centre (retry through browser); Bimmerpost, E90Post, Reddit threads on "OBDLink CX bootmod3", "bootmod3 BLE", "bootmod3 ENET WiFi"; MHD and JB4 adapter pages for comparison | A table: adapter x tuner x reported result, with thread counts and disagreement named |
| RD-3 | Q7: G-series gateway and iDrive 8 | G20, G05, G42 forums; BimmerCode supported-vehicle and release-notes pages; conference talks (DEF CON Car Hacking Village, escar) on BMW gateways at an overview level | 8 sources; what is readable on G-series over ENET and the OBD socket; an explicit "needs authorisation" list |
| RD-4 | Q8: voltage and chargers | Bimmerpost and Reddit threads on failed coding with a charger attached; vendor advice pages; any paper on module update safety | Each claimed threshold laid out with its source; 3 or more failure stories with cause |
| RD-5 | Q9: standards | ISO, SAE, ASAM store pages and previews; CARB 13 CCR 1968.2 text; EPA rule page; AUTOSAR terms of use | Prices recorded; J1979-2 dates confirmed or marked unconfirmed; purchase advice (section 6) |
| RD-6 | Q10: legal | OBDb repository licence and README; EUR-Lex Regulation 2018/858; congress.gov for federal right-to-repair bills; Massachusetts sources; EPA pages on aftermarket tuners | Primary text read for each; share-alike obligations listed in plain words; list of questions for counsel |
| RD-7 | Q11: plan claims | Node.js docs (sqlite status), GitHub docs (attestations), vendor pricing pages | Each of the four items marked verified, changed, or still unknown |
| RD-8 | Q12: demand and gaps | 20 top threads in r/BMWcoding and Bimmerpost coding forums; ClubLexus and MBWorld for gap-filling only | Counts per goal; a keep or drop line for Toyota and Mercedes |

## 6. Decision checklist (Wednesday 21:00)

Answer each in one line; Claude writes the answers to `decisions.md` (rows 7 onward).

| # | Decision | Evidence to use | Default if not decided |
|---|---|---|---|
| D1 | **P3: which two chassis families.** Own car first; which second car or friend | Inventory; RD-3; CAP-A and CAP-B results (how many modules answered) | F-series plus G-series, with the owner's car as family A |
| D2 | **HSFZ, DoIP, both:** what the transport code supports first | CAP-A; RD-1; RD-3 | Keep both, mark behaviour unverified until a second car |
| D3 | **Tester address and length handling:** keep or change in `hsfz.ts` | CAP-A findings | Keep current, record the contradiction as a task |
| D4 | **Standards purchase (ISO 14229-1 and 15765-2).** Rule: buy only if capture plus public summaries leave a named question unanswered that blocks a task, and the price from RD-5 fits G12 | RD-5; D3 | No. Revisit at week 4 |
| D5 | **Adapter plan:** which adapters are in the qualification set; whether to buy a vLinker or OBDLink MX+ | Inventory; CAP-B; RD-2 | Buy nothing beyond the ENET cable until a KPI needs it |
| D6 | **Voltage rule:** the minimum voltage the write engine will demand, and the one that read sessions will warn at | RD-4; logged voltage; CAP-A and CAP-B | Warn below 12.4 V at start, block below 12.0 V on reads; writes (bench only) keep a stricter value set later |
| D7 | **Charger rule:** require a maintainer for any session over 25 minutes | RD-4; inventory | Yes, for coding backups and any bench write |
| D8 | **OBDb pack:** proceed with a separate share-alike pack; list of questions for counsel | RD-6 | Proceed; counsel call (booked Tuesday) covers it |
| D9 | **Legal booking:** call date and cost cap | RD-6; name note | Book as planned, cap per resources.md |
| D10 | **Toyota and Mercedes:** keep deferred past week 12, or add a read-only spike | RD-8 | Deferred |
| D11 | **Plan claims:** any change needed to `project-plan.md` or `architecture-12wk.md` | RD-7 | Edit only the claims that changed |
| D12 | **Second capture night:** is another sprint-style session needed before Dec 2 | CAP-A, CAP-B | No; the Dec 2 capture night proceeds as planned |

Outputs of the session: `docs/plan/decisions.md` rows updated; `docs/research/sprint/README.md` index with one line per note; a list of changes to the week-1 and week-2 plan if any answer changes them.

## 7. Risks of the sprint itself

| Risk | Mitigation |
|---|---|
| The CLI has never run on a real car; it may misbehave | Rehearse on the simulator Monday; allowed requests are read-only by construction; stop rules in 4.1 |
| A pcap or notes leak personal data | Private folder, anonymise rule, owner reads before sharing |
| Capture shows the code's HSFZ assumptions are wrong | That is the point; log it, do not patch during the sprint |
| Forum sites block fetching | Browser retry; owner saves text; failures listed in each note |
| Findings from one car and one adapter are over-read | Mark every capture claim "one car, one adapter" until week 3's second car |
| Owner time lost to a car problem | Section 3 note: the session moves, it is not compressed |

## 8. Resulting edits to the project plan

Applied to `docs/plan/project-plan.md` section 5 (week 1), the hour totals, the decision dates and the status table.

Week 1 now has two parts. Mon to Wed is this sprint. Thu Nov 26 to Fri Nov 27 is the original foundation work, trimmed.

| Old task | Change |
|---|---|
| W1.1 first-48-hours checklist | Done in sprint Monday and Tuesday |
| W1.2 baseline and commits | Baseline Monday; plan docs committed Thursday |
| W1.3 `OdError` | Thursday, unchanged |
| W1.4 package split step 1 | First 4 h Thu to Fri; remaining 4 h Mon Nov 30 |
| W1.5 boundary script, W1.6 licence scan and coverage | Moved to Mon Nov 30 and Tue Dec 1 (week 2) |
| W1.7 `.odtrace` | Split: format and converter for sprint captures Fri (4 h); recorder and replay in week 2 (2 h) |
| W1.8 SOURCES.md and packs repo | Friday, after P3 |
| W1.9 architecture banner | Thursday |
| W1.10 capture protocol and consent sheet | Done in sprint Monday (this file, section 4) |
| W1.11 answer owner questions | Sprint Monday |
| W1.12 reviewer and volunteer post | Friday, with one new line asking for a cross-check of the sprint's HSFZ frames |
| W1.13 review ADR-001 and split PR | Moved to Mon Nov 30 |
| W1.14 first run on own car | Replaced by CAP-A and CAP-B |

Effects: G-A closes Tue Dec 1 instead of Fri Nov 27. Week 1 Claude hours become about 44 (28 research, 16 build), over the 41 capacity, because reading runs in parallel agents. Week 2 adds 12 Claude hours (W1.4 rest, W1.5, W1.6, W1.7 recorder), offset by trimming W2.5 recorder from 12 to 8 hours (format already exists) and moving W2.6 linter skeleton to week 3, so week 2 is about 50. W3.10 capture night 2 drops from 4 to 3 owner hours because the sprint answered the first-contact questions.

KPI edits, minimal: baseline line in `kpis.md` updated to say "baseline of Nov 25 includes sprint timings"; G2 and G3 "Today" cells say "measured Nov 25 (sprint)"; G1 counts sprint sessions only where the CLI `dtc` read ran with a saved trace. No target changes. No milestone date changes.

## 9. Sources for this plan

Internal only: `docs/plan/project-plan.md`, `decisions.md`, `kpis.md`, and the open-question sections of the notes in `docs/research/deep/` named in section 1. No new web pages were read to write this plan. Tool names in section 4 (`tcpdump`, the CLI commands) were checked against the repo's help text on 2026-11-20; the Wi-Fi interface name, the dongle's address, whether the CX vendor app can export a log, and the owner's multimeter and charger are unknown and are asked in the inventory.
