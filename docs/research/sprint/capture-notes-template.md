# Capture notes sheet (one per session)

**ANSWER FIRST**
- This is a fill-in form. Copy it into the private folder for each session: `~/Projects/opendiag-captures-private/<date>-<session>/notes.md`. Never fill it in inside the repo.
- Fill it in at the car where you can, and finish it within 30 minutes of the session while it is fresh.
- It follows section 4.5 of `docs/plan/research-sprint.md` and the allowed list in 4.2. Anything not on that list is not done in the sprint.
- Addresses, Wi-Fi names, Bluetooth names and the VIN go in this private copy only. They never go into chat, the repo or a forum.
- Blank means not done. Write "n/a" if a step does not apply, so Claude can tell the difference.
- Sections 1 to 9 apply to both sessions. Section 10 is for CAP-A (WiFi ENET and the CLI). Section 11 is for CAP-B (OBDLink CX).
- Time everything in seconds with the `time` command (CAP-A) or a stopwatch (CAP-B). Round to whole seconds if unsure.
- Stop rules (4.1 rule 8) beat this form. If a stop rule fires, stop, write section 8, and do nothing else.

**Claims table:** not applicable, this is a form and makes no claims. **Disagreements:** none. **Source ledger:** read only `docs/plan/research-sprint.md` sections 4.1 to 4.6 (fully loaded). Nothing failed to load.
**Open questions:** whether the CX vendor app offers a text log export (not known; see 11.4); the exact CLI flag spelling for JSON output (the plan says `--json`; confirm against `pnpm cli --help` in rehearsal).

---

## 0. Session header

| Field | Value |
| --- | --- |
| Session id (CAP-A or CAP-B) |  |
| Date (private copy only) |  |
| Private folder path |  |
| Notes filled in by |  |
| Time notes finished |  |
| Plan version (git commit short hash of research-sprint.md, if known) |  |

## 1. Car and tune

| Field | Value |
| --- | --- |
| Model |  |
| Model year |  |
| Chassis code (for example F30, G20) |  |
| Engine / variant |  |
| Transmission |  |
| Mileage band (round to nearest 10,000 km or mi; do not record exact) |  |
| Tune state (tuned or stock) |  |
| bootmod3 map name or stage (if tuned) |  |
| Last BM3 flash: date and result (clean, interrupted, failed) |  |
| Any known open fault or warning lamp BEFORE the session |  |
| Car stable per 4.1 rule 3 (yes / no) |  |

If the last BM3 flash was interrupted or failed, or the car is not stable: do not run the session. Write the reason here and stop:

> ____________________________________________________________

## 2. Adapter and connection

| Field | Value |
| --- | --- |
| Adapter exact model name |  |
| Adapter firmware or version shown (app or terminal) |  |
| Connection method (WiFi ENET / BLE / other) |  |
| Dongle Wi-Fi name (private only) |  |
| Dongle IP address or BLE address (private only) |  |
| Laptop IP address on the dongle network (private only) |  |
| Laptop interface name used for capture |  |
| Laptop OS and version |  |
| Phone model and OS (CAP-B) |  |
| Cable used (ENET cable make, length) or n/a |  |
| Only one adapter in the OBD socket (yes / no) |  |

## 3. Pre-checks (tick each before plugging in)

- [ ] Repo is clean and I did not run `git pull` or change code during the session
- [ ] Private folder exists, mode 700, outside the repo
- [ ] bootmod3 app closed on every phone and tablet; BM3 adapter not connected; no BM3 log started
- [ ] BimmerCode, OBDLink app, BimmerLink, Carly and any other car app closed (list which ones were installed): ______________________
- [ ] Bluetooth and Wi-Fi permissions for those apps switched off where unsure
- [ ] Background sync on the laptop turned off (CAP-A)
- [ ] Engine off, ignition on, stationary, handbrake on, park or neutral, doors closed, fob inside the car
- [ ] Lights, climate and radio off
- [ ] Parked outdoors or well ventilated
- [ ] I have read the stop rules in the consent sheet and the plan 4.1

## 4. Battery and charger

| Field | Value |
| --- | --- |
| Maintainer or charger connected (yes / no) |  |
| Charger brand and model |  |
| Charger mode used (supply / maintainer / other; must NOT be boost or quick-charge) |  |
| Charger output in amps (if shown) |  |
| Multimeter or adapter voltage reading used (which) |  |

Start only at 12.4 V or more. Without a maintainer: keep the session under 25 minutes and stop below 12.0 V.

### 4.1 Voltage log

Record at start, at least every 5 minutes, and at the end. Add rows as needed. Note what was happening (for example "during scan").

| Clock time (hh:mm) | Minutes since start | Volts | Source (meter / adapter) | What was running |
| --- | --- | --- | --- | --- |
|  |  |  |  | Start (before plug-in) |
|  |  |  |  | After plug-in, ignition on |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  | Before unplug |
|  |  |  |  | After unplug (30 s after ignition off) |

Lowest voltage seen: ______ V at ______ min.  Did it fall below 12.0 V (stop rule)? yes / no

## 5. Session times

| Event | Clock time | Notes |
| --- | --- | --- |
| Session start |  |  |
| Adapter plugged in |  |  |
| Ignition on |  |  |
| Wait of 30 seconds finished |  |  |
| Connected (Wi-Fi joined or BLE connected) |  |  |
| Capture or recording started |  |  |
| First command or read started |  |  |
| Last command or read finished |  |  |
| Capture or recording stopped |  |  |
| Ignition off |  |  |
| Adapter unplugged (30 s after ignition off) |  |  |
| Session end |  |  |

## 6. Apps closed and no-write confirmation

Apps closed: ____________________________________________________________

Confirm each (tick):

- [ ] No write, no coding, no flash was performed
- [ ] No code was cleared (the CLI `clear` command was not used)
- [ ] `backup`, session-change requests and anything needing a security unlock were not used
- [ ] No loop of any command; one request at a time
- [ ] No request outside the allowed list in plan 4.2
- [ ] I did not write to any BLE characteristic (CAP-B)

Signed (type your initials and the time): ______  ______

## 7. Anything unusual (during the session)

Note warning lamps, cluster behaviour, slow replies, disconnects, heat at the socket or adapter, odd sounds, anything you would tell a mechanic.

| Clock time | What happened | Which command or step | Lamp / cluster / adapter / reply / other |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

## 8. If a stop rule fired

Stop rules: a new warning lamp stays lit after you finish; the cluster restarts or behaves strangely; heat or smell at the OBD socket; adapter becomes hot; voltage below 12.0 V; anything surprising.

- [ ] A stop rule fired. Which one: ______________________________
- [ ] I turned ignition off, waited 30 seconds, then unplugged
- [ ] I wrote down what happened below before doing anything else
- [ ] I did not retry the same day
- [ ] I did not clear any faults

What happened, in order, in plain words:

> ____________________________________________________________
> ____________________________________________________________

## 9. After the session

| Field | Value |
| --- | --- |
| Battery voltage at end (V) |  |
| New warning lamps or faults after the session (list; write them down, do not clear) |  |
| Faults present before the session (list, from the dtc read or cluster) |  |
| Any communication faults that look new (modules woken by the scan can log these) |  |
| Files moved to the private folder (yes / no) |  |
| Folder mode is 700 (yes / no) |  |
| Files NOT in the repo, not in any shared cloud folder (yes / no) |  |
| Session ended early (yes / no) and why |  |

File checklist (private folder):

- [ ] `capA.pcap` (CAP-A only)
- [ ] `vin.json`, `dtc.json`, `pids.json`, `scan.json`, `did-*.json`, `probe-*.json`
- [ ] `live.json` (if the `live` read was done)
- [ ] screenshots of BLE services and packet size (CAP-B)
- [ ] screen recording of the vendor app (CAP-B)
- [ ] text log export from the vendor app, if one exists (CAP-B)
- [ ] this notes file
- [ ] photo of the ENET cable resistance reading, if the optional measurement was done (do not photograph the VIN plate)

---

## 10. CAP-A: WiFi ENET and the OpenDiag CLI

Goal: answer Q1 (discovery), Q2 (length rules), Q4 (alive check and tester address) and gather voltage data (Q8).

Adapter flag used: `--adapter enet:<address>` (write the address in section 2 only).

Capture command used (copy the exact line you ran, with the address replaced by `<dongle>`):

> `sudo tcpdump -i <interface> -w capA.pcap -s 0 host <dongle> or udp port 6811`

### 10.1 Timing table, one row per CLI command

Run the commands in this order, one at a time. Type `time` before each one. Record the "real" time from `time`, not the CPU time. "Modules answered" only applies to scan and probe.

| # | Command | Exact line (addresses blanked) | Start clock | Wall time (s) | Result (ok / error) | Error text, if any | Modules answered | JSON file saved | Volts at the time |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | vin | `pnpm cli vin --adapter enet:<dongle> --json` |  |  |  |  | n/a |  |  |
| 2 | dtc | `pnpm cli dtc --adapter enet:<dongle> --json` |  |  |  |  | n/a |  |  |
| 3 | pids | `pnpm cli pids --adapter enet:<dongle> --json` |  |  |  |  | n/a |  |  |
| 4 | live (optional, count 5) | `pnpm cli live --count 5 --adapter enet:<dongle> --json` |  |  |  |  | n/a |  |  |
| 5 | scan 0x10-0x7f (first run) | `pnpm cli scan --range 0x10-0x7f --adapter enet:<dongle> --json` |  |  |  |  |  |  |  |
| 6 | did 0xF190, module 1 | `pnpm cli did --target <A1> --did 0xF190 ...` |  |  |  |  | n/a |  |  |
| 7 | did 0xF190, module 2 | same, target <A2> |  |  |  |  | n/a |  |  |
| 8 | did 0xF190, module 3 | same, target <A3> |  |  |  |  | n/a |  |  |
| 9 | did 0xF190, module 4 | same, target <A4> |  |  |  |  | n/a |  |  |
| 10 | did 0xF190, module 5 | same, target <A5> |  |  |  |  | n/a |  |  |
| 11 | probe 0xF180-0xF19F, module 1 | `pnpm cli probe --target <A1> --range 0xF180-0xF19F ...` |  |  |  |  |  |  |  |
| 12 | probe 0xF180-0xF19F, module 2 | same, target <A2> |  |  |  |  |  |  |  |
| 13 | probe 0xF180-0xF19F, module 3 | same, target <A3> |  |  |  |  |  |  |  |
| 14 | probe 0xF180-0xF19F, module 4 | same, target <A4> |  |  |  |  |  |  |  |
| 15 | probe 0xF180-0xF19F, module 5 | same, target <A5> |  |  |  |  |  |  |  |
| 16 | vin (repeat, second timing sample) | `pnpm cli vin ...` |  |  |  |  | n/a |  |  |
| 17 | scan 0x10-0x7f (repeat, second timing sample) | `pnpm cli scan --range 0x10-0x7f ...` |  |  |  |  |  |  |  |

Rules for this table:
- Never run more than five modules through `did` and `probe`.
- Do not loop. If a command fails, write the error and move on; do not rerun it except the two repeat rows.
- If the CLI cannot find the adapter, do not experiment. Write the error here and stop: Claude will check the transport code against the capture.

Error text for any failed row (copy it exactly, with addresses removed):

> ____________________________________________________________

### 10.2 Scan result: which addresses answered

Write one line per module that answered. Use the diagnostic address in hex. Add the name only if the CLI shows one.

| Address (hex) | Name shown (if any) | Used for did (A1 to A5) | Used for probe | Reply time shown (ms, if any) |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

Total modules answered: ______   First scan wall time: ______ s   Second scan wall time: ______ s   Difference: ______ s

### 10.3 Wi-Fi and network observations

| Field | Value |
| --- | --- |
| Time from plug-in to Wi-Fi visible (s) |  |
| Time from joining Wi-Fi to the first CLI answer (s) |  |
| Did the laptop lose the Wi-Fi at any point (yes / no, when) |  |
| Did the dongle address match the label or manual (yes / no) |  |
| Anything else on the network seen by the laptop (do not write names) |  |
| Capture file size (MB) |  |
| Capture stopped cleanly (yes / no) |  |

### 10.4 Optional: ENET cable resistance (only with a multimeter and the cable, cable NOT plugged into the car)

This is a passive measurement on a cable at rest. Do not probe the car's own socket.

| Between pin 8 and ... | Reading (ohms) | Meter range | Notes |
| --- | --- | --- | --- |
| Signal ground pin of the car-end connector |  |  |  |
| Battery ground pin of the car-end connector |  |  |  |

- [ ] Measurement done   - [ ] Skipped (no meter or no cable)

### 10.5 Questions for Claude to answer from capture A

Write your own questions here before handing the files over. Plan questions already assigned: Q1 discovery bytes, Q2 length semantics, Q4 alive-check frames and tester address, Q8 voltage.

1. ____________________________________________________________
2. ____________________________________________________________
3. ____________________________________________________________

---

## 11. CAP-B: OBDLink CX over Bluetooth Low Energy

Goal: answer Q3 (BLE behaviour) and extend Q4 with a second adapter type. The laptop CLI has no Bluetooth adapter yet, so this session uses the phone.

### 11.1 Apps used

| Field | Value |
| --- | --- |
| BLE inspector app name and version (free, from the official store) |  |
| Vendor app name and version for the CX |  |
| CX firmware version shown |  |
| Phone Bluetooth permission for other car apps off (yes / no) |  |
| Phone screen recorder used |  |

### 11.2 BLE inspector (no writes)

Connect, screenshot, disconnect. Do not write to any characteristic.

| Field | Value |
| --- | --- |
| Time to find the CX in the scan list (s) |  |
| Time to connect (s) |  |
| Number of services shown |  |
| Packet size / MTU shown (bytes) |  |
| Service UUIDs seen (copy; these are adapter identifiers, not personal) |  |
| Characteristic UUIDs seen, with properties (read / write / notify) |  |
| Screenshot file names |  |
| Disconnected cleanly (yes / no) |  |

- [ ] I did not write to any characteristic

### 11.3 Timing table (stopwatch), one row per vendor app action

| # | Action in the vendor app | Start clock | Seconds to finish | Result (ok / error) | Number of items shown | Volts at the time | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Open app and connect to the CX |  |  |  |  |  |  |
| 2 | Read faults (first time) |  |  |  |  |  |  |
| 3 | Read faults (second time, for a timing sample) |  |  |  |  |  |  |
| 4 | Open the supported live values list |  |  |  |  |  |  |
| 5 | Read the supported live values list (count shown) |  |  |  |  |  |  |
| 6 | Read live values for a short period (note how many) |  |  |  |  |  |  |
| 7 | Disconnect |  |  |  |  |  |  |

Allowed in the vendor app: connect, read faults, read supported live values. Not allowed: clear, coding, resets, "apply", any write.

### 11.4 Record of what the vendor app showed

| Field | Value |
| --- | --- |
| Does the app offer a text log or terminal export that needs no write to the car? (yes / no / unknown) |  |
| If yes: file name and how it was saved |  |
| Screen recording file name and length |  |
| Faults shown (list; do not clear) |  |
| Supported live values count |  |
| Any message about firmware, update or licence (write it; do not accept updates during the session) |  |

Do not buy anything to get a log. If there is no text export, the screen recording is the record.

### 11.5 Do not do

- Do not open the BM3 app. Do not test whether BM3 sees the CX. That is answered by reading in RD-2, not by a car test.
- Do not accept firmware updates in the vendor app during the session.

### 11.6 Questions for Claude to answer from capture B

1. ____________________________________________________________
2. ____________________________________________________________

---

## 12. Hand-over to Claude

- [ ] Section 6 confirmation signed
- [ ] All files are in the private folder; none are in the repo
- [ ] I have NOT pasted the VIN, addresses or names into chat
- [ ] I have told Claude only the folder name and which timing rows to read
- [ ] Claude may read this folder for analysis (yes / no): ______
- [ ] Anything Claude produces from this (hex frames, anonymised `.odtrace`) will be shown to me and needs my yes in chat before it is committed or posted

Anonymisation checklist for anything that leaves the private folder (plan 4.6):

- [ ] VIN replaced by a salted hash; salt stays in the private folder
- [ ] MAC and IP addresses, Wi-Fi and Bluetooth names removed or zeroed
- [ ] Only the HSFZ payload as hex is shared; never a raw pcap
- [ ] Owner-identifying values dropped (VIN, mileage-like counters, order, key and dealer data)
- [ ] Timestamps rounded to the second; absolute dates dropped
- [ ] Owner read the final file once and said yes in chat
