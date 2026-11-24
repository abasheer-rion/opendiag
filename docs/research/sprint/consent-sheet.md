# Capture consent sheet (one page)

**ANSWER FIRST**
- This sheet is for the owner of the car. Read it before each of the two sessions (Tue Nov 24 WiFi ENET, Wed Nov 25 OBDLink CX) and tick yes or no at the end.
- The session reads. Two owner-approved exceptions on 2026-11-24 only: a read-only backup attempt (identification data), and ONE standard clear of the stored fault codes of ONE module at the very end, after the fault list is saved. Nothing is coded or flashed.
- Raw files stay on your laptop in a private folder. Only an anonymised version can leave it, and only after you say yes in chat.
- You can stop at any time. A stop is never a failure.
- Source: sections 4.1 to 4.6 of `docs/plan/research-sprint.md`. Claims table and disagreements: not applicable (a consent form). Source ledger: that file only, read fully. Open question: the voltage limits are our own cautious rule; public advice disagrees (12.6, 12.8 or 13 V) and is unproven.

## 1. The promise: reading only

- We only ask the car questions. We never tell it to change anything.
- No coding, no flashing, no resetting, no security unlock. No clearing except the one approved clear described above.
- The only requests allowed are: read the VIN, read stored faults, list and read a few live values, find which modules answer, read one identification item from a module, list identification items on at most 5 modules, and (WiFi adapter only) ask the dongle for its own identity.
- The clear is allowed once, last, only with battery at 12.4 V or more and your typed CLEAR. Backup is read-only. No other writes.
- Anything not on that list is not done. If a tool asks to write, apply or code, you stop and do nothing.
- One request at a time, no loops.
- The bootmod3 app stays closed. The BM3 adapter stays out. No other car app runs during a session.

## 2. Stop rules (stop and unplug at once if any of these happens)

- A new warning lamp stays lit after you finish.
- The dashboard restarts or behaves strangely.
- You smell or see anything hot at the OBD socket.
- The adapter becomes hot.
- Battery voltage falls below 12.0 V.
- Anything surprises you.

What to do: turn the ignition off, wait 30 seconds, unplug, then write down what happened before anything else. Do not retry the same day. Do not clear faults; new communication faults can appear after a scan because modules were woken. Write them down.

Also before you start: battery at 12.4 V or more; a maintainer in low-current mode if you have one (never a boost or quick-charge mode, never an unknown charger). With no maintainer, keep the session under 25 minutes. If the last bootmod3 flash was interrupted or failed, do not run the session until the car is confirmed stable. Engine off, ignition on, car parked outdoors, handbrake on, doors closed, lights, climate and radio off.

## 3. What is recorded

- Network capture of the traffic between laptop and the WiFi adapter (Tuesday only).
- The command outputs and timings of the OpenDiag tool, saved as files.
- Phone screenshots of the Bluetooth services and a screen recording of the vendor app (Wednesday only).
- Battery voltage every few minutes, session times, any warning lamps, and your notes.
- This data contains the VIN, network addresses and Bluetooth identities, so it counts as personal data.

## 4. How it is stored and anonymised

- Raw files live only in `~/Projects/opendiag-captures-private/<date>-<session>/`, set so only you can open it, outside the repo, never committed, not in a shared cloud folder.
- Claude reads the raw folder only to analyse it, and does not publish captures by itself.
- Before anything leaves the folder: the VIN is replaced by a salted hash (salt stays private); MAC and IP addresses and Wi-Fi and Bluetooth names are removed; only a few frames as hex are shared, never a raw capture; anything that could identify you or the car is left out; times are rounded and dates dropped.
- You read the final file once and say yes in chat before it goes into the repo or a forum. Only anonymised hex, a description for the counsel call, and forum cross-check questions are possible destinations.
- Do not photograph the VIN plate or paste the VIN anywhere.

## 5. Owner choices (tick one box per line)

| # | Question | Yes | No |
|---|---|---|---|
| 1 | I have read sections 1 and 2 and understand the sessions are reading only. | [ ] | [ ] |
| 2 | I agree to the stop rules and will stop at once if one happens. | [ ] | [ ] |
| 3 | I agree to the data in section 3 being recorded. | [ ] | [ ] |
| 4 | I agree to the storage and anonymising rules in section 4. | [ ] | [ ] |
| 5 | Session A, WiFi ENET and the OpenDiag tool (Tue Nov 24), may go ahead. | [ ] | [ ] |
| 6 | Session B, OBDLink CX with the phone (Wed Nov 25), may go ahead. | [ ] | [ ] |
| 7 | Claude may read the private folder to analyse the files. | [ ] | [ ] |
| 8 | Claude may turn the files into an anonymised trace, shown to me first. | [ ] | [ ] |
| 9 | Anonymised hex of a few frames may be used for forum cross-check questions, after I say yes to the exact text. | [ ] | [ ] |
| 10 | I have no unfinished or failed bootmod3 flash, and I will tell Claude if that changes. | [ ] | [ ] |
| 11 | I may withdraw any answer at any time, and then the matching files are moved to a `_to_delete` folder for me to remove. | [ ] | [ ] |

Owner name (typed): ______________________  Date: ____________  Session A time: ________  Session B time: ________

A "no" on line 5 or 6 means that session does not happen. A "no" on line 7 to 9 means the files are used only by you.
