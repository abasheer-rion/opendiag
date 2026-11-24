# RD-2 (Q5): bootmod3, MHD and JB4 with the OBDLink CX, ENET and WiFi adapters

Written 2026-11-24 (sprint day 2). Research only, nothing run on a car. Extends `docs/research/deep/bm3-adapters-and-flashing-transport.md`, `bootmod3-platform.md` and `other-bmw-tuners-mhd-jb4-xhp.md`. It does not repeat their vendor-page findings unless a fact was re-checked or changed.

Status: **PARTIAL.** The BM3 help centre loaded this time (details in the ledger). Bimmerpost, SupraMKV, Spoolstreet, Reddit and the BM3 shop site did not. First-hand thread evidence is therefore thin: 5 threads fully read, a dozen more known only from search summaries.

---

## ANSWER FIRST

1. **No evidence that bootmod3 works with the OBDLink CX.** Every BM3 page I read names only two ways in: BM3's own WiFi adapter, or a wired ENET cable. None lists a Bluetooth adapter (the BM3 connectivity blog only says to turn the phone's Bluetooth off on iOS, because it can interfere). I found no forum thread where anyone flashed BM3 through a CX, and none where anyone tried and failed.
2. **The owner's own experience is the best source for this one.** If BM3 has only ever run on the WiFi ENET adapter, that already matches what BM3 documents.
3. **BM3's charger advice:** an adjustable charger set to 20 to 50 amps, never above 50. Trickle chargers (2 to 6 amps) are called too weak. A line saying "never above 12 volts" is on the same page and is unexplained; do not repeat it.
4. **Interrupted flash:** BM3's official page gives one step: if the connection is stable, retry with the "full flash and unlock, diag only" option on the same map. It gives no recovery for a car that will not start. Real recoveries in threads (MHD, xHP) were bench repairs by specialists.
5. **MHD is stricter than BM3 on the page:** its app blocks a flash when the battery reads low, and asks for a charger on the first flash (4 to 6 minutes). The earlier deep note said the MHD page was silent on this. That was a truncated read.
6. **Adapter table result:** WiFi ENET adapters are the vendor-backed path for all three flashers. Reported failures in threads are mostly one-off, with unclear cause. Nobody publishes a rate. No thread blames a CX.
7. **JB4 is not a flasher.** It talks to its own Bluetooth module, not to an OBD adapter. Its only role for the owner: it must be off or in bypass during a BM3 or MHD flash.
8. **For OpenDiag:** after BM3 WiFi use, the car may refuse a wired session for 20 minutes to over an hour (the two vendors disagree). Plan CAP-A around that. Never connect OpenDiag at the same time as BM3.

---

## Claims table

Confidence is for the claim as worded. "Single" means one page or thread only. Source IDs are in the ledger.

| # | Claim | Source | Conf. | Single? |
|---|---|---|---|---|
| 1 | BM3's own pages list a BM3 WiFi adapter and an ENET cable as the connection options. No BM3 page I read lists a Bluetooth adapter; S6 only advises switching phone Bluetooth and CarPlay off on iOS because they can interfere (re-checked 2026-11-24). | S1, S2, S3, S4, S6 | high for "pages I read"; medium for "BM3 says nothing anywhere" | no, 4 pages |
| 2 | The BM3 install guide calls the BM3 WiFi OBD adapter the recommended wireless option, and a generic OBD-to-Ethernet cable (about $20 to $30) the wired laptop option. | S4 | high | yes |
| 3 | On a Mac, generic USB-to-Ethernet adapters often fail with BM3; an Apple adapter is advised. On Windows, generic ones usually work. | S1, S2, S4 | high | no |
| 4 | BM3's failure page says to confirm a stable connection, then retry with the "FLASH FULL AND UNLOCK - Diag Only" option on the same map. | S5 | high | yes (the page is the source) |
| 5 | BM3's failure page: charger adjustable, set 20 to 50 A, never above 50 A; trickle chargers (2 to 6 A) inadequate; a line in capitals saying not to use "higher than 12 volts" (exact wording re-checked; my earlier "never use a charger above 12 volts" was a paraphrase). | S5 | high that the page says it; low that the 12 V line is right | yes |
| 6 | Same page: drive about 20 minutes if the car has sat, or in an emergency use jumper cables from a running car held near 2,500 rpm. | S5 | high | yes |
| 7 | BM3's failure page lists causes: firewall or Defender, antivirus, piggyback tuners (JB4 and Dinan named), exhaust valve controllers, OBD gauges. A failure before 2 percent or an "ext diag session" error points to something blocking it. | S5 | high | yes |
| 8 | A non-MFi Ethernet adapter on iPhone may connect then drop about 10 seconds later, or drop mid-flash leaving the car in a failed state. Recovery needs an MFi adapter or a laptop. | S6 | high | yes (BM3 blog) |
| 9 | After WiFi use, wired ENET may not work. BM3 says disconnect the battery ground for about 3 minutes, or lock the car and let it sleep over an hour. The "not detected" page (S2) also gives the 3 minutes, says keep the trunk open, and says dealer service or ISTA use can change the settings; the over-an-hour figure is in S6 only. | S6, S2 | high | 3 minutes: no, 2 BM3 pages agree; over an hour: yes, S6 only |
| 10 | A reseller says the changed network settings clear after 20 to 30 minutes of car sleep. | S7 | medium | yes |
| 11 | The BM3 iOS app (listing read 2026-11-24, version 3.3.10) says a flash stops immediately if the OBD Agent disconnects, and shows whether the link is ENET or the WiFi adapter. | S8 | medium | yes (listing; notes repeat across versions) |
| 12 | Same listing: WiFi adapter firmware 3.14.4.6 fixed drops when several adapters were nearby; outdated adapter firmware now updates automatically. | S8 | medium | yes |
| 13 | A reseller says the MHD adapter can flash BM3 (join MHD_XXXX, app shows VIN). xHP's wiki says the BM3 adapter and the MHD UNI adapter both work for xHP. | S7, S9 | medium | no, but both are third parties talking about cross-use |
| 14 | OBDLink says CX and other OBDLink adapters flash only through supported third-party apps on select vehicles (BimmerCode, Carista, AlfaOBD, FORScan, MotoScan named). It does not name bootmod3, MHD or ENET. | S10 | high | yes |
| 15 | BimmerCode's adapter page lists the CX as "Made for BimmerCode", compatible with all series. It also lists ENET WiFi adapters (bm3 and MHD named) for F, G and I series only. It says nothing about tuning. | S11 | high | yes |
| 16 | A review published 2026-09-20 (updated 2026-11-22) says MHD and bootmod3 do not list the CX and advises against it for tune flashing. | S12 | medium | yes, affiliate-style |
| 17 | The CX has a 247-byte maximum transfer size, no queued writes, and needs a response between each write chunk. The usable size depends on the phone (Android default 23-byte MTU; iOS 135 to 185 depending on version). Bonding is open only for the first 5 minutes after power-on. | S13 | high | yes |
| 18 | MHD's flashing page: use an ENET WiFi adapter or ENET cable; battery fully charged and healthy; connect a charger for the first flash (4 to 6 minutes); the app detects a low battery and blocks the flash; no loads on (radio, lights, climate, heated seats); JB4 cannot run alongside; use airplane mode. Re-check on 2026-11-24 confirmed all of these; the seat belt, hotspot and jump-point details in section 3 were not returned by the re-check, so treat them as earlier-read only. | S14 | high (medium for the unconfirmed details) | yes |
| 19 | MHD's connection page recommends only the MHD WiFi Universal adapter and advises against third-party connection methods. The MHD FAQ: some other adapters may work, but not recommended and no support. | S15, S16 | high | no |
| 20 | MHD's flashing page gives no recovery steps for a failed flash. It says Stage 0 (stock) can be restored from the app at any time. | S14 | high | yes |
| 21 | xHP: a weak battery can fall under 11.9 V and interrupt a flash; a roughly 30 A, 13.8 V supply is advised for long DCAN or K-line flashes; xHP blocks flashing if voltage is too low; phone should be above 25 percent. | S9 | high | yes |
| 22 | JB4 phone link: a Bluetooth module that plugs into the JB4's own data port, for phones with Bluetooth 4.0; the page says nothing about OBD adapters or flashing the DME. | S17 | high | yes |
| 23 | JB4 mobile app (iOS) has 15 ratings averaging 3.3 out of 5 and version 3.0.7; the listing mentions no OBD adapter. | S18 | medium (tiny sample) | yes |
| 24 | JB4PRO is a newer in-enclosure Bluetooth adapter, "2020+ systems", usable offline. | search summary of S19 (page rate-limited) | low | yes, snippet-only |
| 25 | MHD thread (E82 135i, JB4 fitted): four different cables failed to reach the DME after a flash stopped; a 40 A charger and a 30-minute battery disconnect did not help; dealer said replace the DME. A reply says a similar failure on his car was a wrong ignition state. | S20 | medium | yes, anecdote |
| 26 | MHD thread (N55 335i, Thor DCAN WiFi adapter): app froze at flash start, DME then unreachable; battery tender used; recovered at a specialist (BimECU) by September 2024. A reply says a tender cannot hold voltage through a long flash. | S21 | medium | yes, anecdote |
| 27 | MHD thread (E90, custom tune, adapter unnamed): flash stopped at 51 percent, retry reached 100 percent, DME then silent; sent to a bench-repair shop; no battery or charger mentioned; outcome not posted. | S22 | medium | yes, anecdote |
| 28 | xHP thread (G80, TCU, adapter unnamed): flash failed near 30 percent several times; dealer quoted $7,500; replies say bench recovery; no one mentioned a charger; CarPlay was off; unresolved. | S23 | medium | yes, anecdote |
| 29 | OEM tooling with a 100 A maintainer and an ICOM also bricked comfort modules on a 2022 X5 during forced programming; cause not established. | S24 | low-medium | yes, anecdote |
| 30 | Snippet-only lead: a search summary of a Bimmerpost MHD thread (title seen in a redirect: "unable to erase memory, DME bricked") says a poster later confirmed the WiFi adapter was the culprit and a wired ENET path flashed fine. | S25 (not opened) | low | yes, snippet-only |
| 31 | Snippet-only lead: a user said the phone died mid-flash on BM3 and a second attempt after charging worked; another suggested checking the adapter is "on the approved list". No official approved list was found. | S26 (not opened) | low | yes, snippet-only |

---

## What I found

### 1. BM3 help centre: retried, loaded, and what it says

The sprint plan said the BM3 help centre failed in the deep run and should be retried through the browser. I did not need the browser. The centre is a Confluence space at `bootmod3.atlassian.net/wiki/spaces/BCS`. A guessed address, `help.bootmod3.com`, did not resolve (DNS not found). The shop site (`bootmod3.com`) returned 403 for two pages. Pages read are in the ledger.

What the help centre says about adapters, in plain words:
- Install guide: a BM3 WiFi OBD adapter is the recommended wireless route, or a plain OBD-to-Ethernet cable on a laptop (S4). Another page lists exactly one cable type to avoid: an OBD-to-USB cable is the wrong kind (S2).
- "OBD Agent not detected" page: eight causes, all about ENET or the WiFi device: stale car network settings, a non-Apple adapter on a Mac, no active Ethernet link, wrong cable type, interfering devices, security software, a loose plug, outdated WiFi device firmware (S2). It never mentions Bluetooth or a phone.
- The v3.0 user manual has a hardware section "8.1 bootmod3 Wi-Fi Adapter" with notes on DHCP leases and firmware, and 8.2 REV2 controller and 8.3 flex-fuel kit. The fetch returned only the contents list, so the body text is unread (S3). **Open: the owner could save section 8.1 as text.**
- Release notes: the visible part lists only map releases (dated Apr 2025 to Jan 2026). Nothing on adapters or connection (S27).
- The FAQ page's readable part covers licences and the OBD Agent being movable between cars. Nothing on adapter types (S28).

What the help centre does **not** say: nothing on Bluetooth, nothing on a third-party adapter list, nothing on OBDLink. A silence in a truncated fetch is weak evidence, so I treat "BM3 does not support Bluetooth adapters" as "BM3 documents none".

**Technical hint (my inference, not a source claim):** the BM3 pages talk about Ethernet links, IP settings and network gateways. That is consistent with BM3's agent needing an IP link to the car. A BLE-only device like the CX has no IP path to the car's Ethernet, so it could not carry that traffic without an adapter-side bridge. No source states this. Only BM3 support could confirm it.

### 2. BM3 advice on chargers, in full (re-read on 2026-11-24)

From the BM3 failure page (S5), paraphrased:
- Battery charge must be stable during the flash.
- If the car has sat, put a charger on it. About 20 minutes of driving can also add charge.
- Emergency option: jumper cables from a running car held at about 2,500 rpm.
- Use a charger with adjustable amps, 20 to 50 A. Never above 50 A.
- Trickle chargers that show no amp setting usually give 2 to 6 A, which is too little.
- A capitalised line saying not to use "higher than 12 volts" is in the same list. Everything else on the page and every other source says a charging supply sits around 13.2 to 13.8 V. I cannot reconcile it. It may mean a charger's low-voltage mode or a typo. It is single-source and unexplained.

The BM3-hosted flash guide (S4) is a community-style guide, flagged on the page as not actively maintained. It calls a charger "highly recommended". It names a 30 A multi-bank charger with engine-start mode and a lithium-capable NOCO unit for an F80, says the author skipped a charger on a car that sat for a week and calls that a risk. It tells you to keep headlights off, doors closed and seatbelt fastened so the modules do not go to sleep, and to turn the car off for about 20 seconds after the flash. These are one author's practice.

I found **no** BM3 statement that its app checks battery voltage and refuses to flash. MHD and xHP both say theirs does (S14, S9). The absence is a search result, not proof; the BM3 manual's body was unread.

### 3. MHD: new facts from the flashing page

The deep note read this page as truncated and silent on chargers. The version I read today is fuller (S14):
- Battery fully charged and healthy; fix charging-system faults first.
- Charger for the first flash (4 to 6 minutes). Later stage flashes take 15 to 20 seconds and need none, but a charger is still recommended.
- Attach at the car's designated jump points in the engine bay (earlier read; not repeated in the re-check).
- The app detects a low battery and blocks the start of the flash.
- Developer takes no responsibility for ECU damage if battery requirements are not met.
- Loads off: radio, headlights, interior lights, climate, heated seats. In-car WiFi hotspot off. Seat belt fastened so the ignition does not cut out. No calls, airplane mode.
- A JB4 cannot run alongside. This matches BM3 listing JB4 as a cause (S5).
- No recovery steps for a failed or interrupted flash. Stock can be restored from the app.

No voltage number is given. So MHD gives a rule of "keep it in range" without a figure, BM3 gives amps, xHP gives 11.9 V and 13.8 V.

### 4. Interrupted flashes: what is documented and what is reported

Documented:
- BM3: retry with "full flash and unlock, diag only" if the link is stable (S5). Non-MFi iPhone drop: use an MFi adapter or a laptop to recover (S6). No ECU state after interruption is described.
- MHD: stock restore button; no recovery steps (S14). MHD's troubleshooting page covers only a failed unlock, performance feedback and "other" (S29).
- xHP: weak battery can interrupt a flash and leave the car unable to start (S9). A xHP reply in a thread told the poster to disconnect the battery 30 minutes and flash an uninstall file (S23).
- BM3 app (current listing): the flash now stops at once if the agent disconnects (S8). It is a transport safety feature. What state the ECU is left in is not said.

Reported in the five threads I read (all anecdote, all older than or around 2024, dates mostly unclear from the pages):
- 3 of 5 ended with the DME or TCU unreachable and bench repair (S21, S22, S23). 1 ended with a dealer replacement quote (S20). 1 recovered by changing laptop serial settings and rerunning (S30).
- In 4 of 5 the adapter was a cable or WiFi device other than the tuner's own, or unnamed. In one (S21) it was a Thor DCAN WiFi adapter. In none was it the CX.
- Voltage is **not** a clean explanation. One thread had a 40 A charger and still failed (S20). One had a tender and failed (S21), though a reply doubts a tender is enough. One had no charger mentioned (S22). One had no charger mentioned and a different cause (S23). One tender case succeeded after changing serial latency (S30).
- Replies suggest other causes: wrong ignition state (S20), app freeze (S21), a file-path error and a retry-from-failure (S22), CarPlay asked about and ruled out (S23).

The rule stays: nobody has a rate. A thread count is a count of people who posted, not of people who flashed.

Snippet-only leads, not opened, not used as evidence: Bimmerpost titles "Bootmod3 flash failed during write", "bootmod3 flash failed - can't start car", "Car won't start after failed Bootmod3 flash" and "Bootmod3 Flash Failed" appeared in a search. A search summary of them says: the phone died mid-flash then a reflash worked; a 10 A charger gave an error halfway; one owner moved to a 70 A charger; another says he flashes at 12.0 to 11.5 V with no charger; reflash with the force option was what BM3 support advised (S26). All of this needs the owner to save those pages as text before it counts.

### 5. MHD and JB4 adapter pages, for comparison

**MHD** (S14, S15, S16, S31):
- Preferred: the MHD ENET WiFi adapter ("fewer cable disconnections, speed").
- Cable path is for troubleshooting or advanced users; vendor will not support cable connection problems. Needs Ethernet-to-USB plus OTG; keep the phone flat (USB stress is named as a cause of failure).
- The connection page says the K+DCAN cable works on Android only and ENET cable on iOS only (S15).
- Android needs a static IP for the cable path; iOS needs flight mode and the local network permission.
- Statement on non-MHD adapters: "may work", "not recommended", no support (S16). The required hardware page does not mention OBDLink, Bluetooth or K+DCAN either way (S31).
- Reseller: an MHD adapter can flash BM3 (S7).

**JB4** (S17, S18, S19):
- A piggyback tuner. It sits in the engine bay on the sensor wiring, and its map changes happen in its own box. It does not rewrite the DME.
- Phone link: a Bluetooth kit that plugs into the JB4's data port. Needs a phone with Bluetooth 4.0. Does not work with the JB4 Windows interface; a wired data cable is used for that.
- The page lists map changes and JB4 firmware updates. It does not say it flashes the DME.
- The iOS app listing mentions no OBD adapter and does not state the link type.
- The JB4PRO adapter (in-enclosure Bluetooth, "2020+") is known from a search summary only; its page was rate-limited.
- JB4's relevance to the owner: it must be off or in bypass when flashing BM3 (S5) or MHD (S14).

**OBDLink** (S10, S13): the CX's own pages never describe a tune-flashing workflow. OBDLink tells people to confirm with the third-party app. That leaves the question with the tuners, who are silent on it.

---

## Adapter x tuner x reported result

Counts are **threads actually opened and read** in this run, then **vendor or reseller pages** that speak to the pair, then snippet-only leads. "0 threads" does not mean "no one has done it". It means I found none I could open.

| Adapter | Tuner / tool | Reported result | Threads read | Vendor / reseller pages | Snippet-only leads |
|---|---|---|---|---|---|
| BM3 WiFi adapter | bootmod3 | Vendor-recommended wireless path. App notes show drops when several adapters are nearby (fixed in 3.3.0). One October 2025 thread says the adapter did not appear in the phone's WiFi list, per a search summary only. | 0 | 4 (S1, S4, S6, S8) | 1 (G87 thread, S32) |
| ENET cable + laptop | bootmod3 | Vendor-supported. Mac needs an Apple adapter. Firewall and antivirus are the named failure causes. | 0 | 4 (S2, S4, S5, S6) | 1 (SupraMKV: switched to laptop, firewall off, flashed, S33) |
| ENET cable + iPhone (non-MFi adapter) | bootmod3 | Vendor says it can drop at about 10 seconds or mid-flash and leave a failed state. | 0 | 1 (S6) | 1 |
| ENET cable + iPhone (MFi adapter, Belkin named) | bootmod3 | Vendor-recommended. No failure reports. | 0 | 1 (S6) | 0 |
| MHD WiFi adapter | bootmod3 | A reseller says it works, join MHD_xxxx. xHP's wiki says BM3 and MHD UNI adapters are both usable for xHP, so they behave alike there. Vendor BM3 pages do not list it. | 0 | 2 (S7, S9) | 0 |
| OBDLink CX (BLE) | bootmod3 | **No source lists it or tests it.** BM3 pages name only WiFi adapter and ENET cable. A 2026 review says it is not listed by BM3. | 0 | 1 negative (S12); BM3 silent | 0 |
| OBDLink CX (BLE) | MHD | MHD docs recommend only their own adapter; they do not name the CX. Review says not listed. | 0 | 3 (S12, S15, S16) | 0 |
| OBDLink CX (BLE) | xHP | xHP's adapter page does not mention OBDLink or Bluetooth. | 0 | 1 (S9) | 0 |
| OBDLink CX (BLE) | BimmerCode (coding) | Listed "Made for BimmerCode", all series. Not a flashing claim. | 0 | 2 (S10, S11) | 0 |
| OBDLink CX (BLE) | JB4 | Not applicable. JB4 has its own phone link and its page names no OBD adapter. | 0 | 2 (S17, S18) | 0 |
| MHD WiFi ENET adapter | MHD | Vendor-preferred. Two posters in two threads had a defective or freezing unit that the seller replaced; one said the replacement then worked. | 2 (S20, S21) | 4 (S14, S15, S16, S31) | 1 (adapter blamed in one bricked-DME thread, S25) |
| Thor DCAN WiFi adapter | MHD | One poster: app froze at flash start, DME then unreachable, recovered by a specialist. A second member with similar trouble used K+DCAN with an OTG cable. | 1 (S21) | 0 | 0 |
| K+DCAN / OBD cables (several brands) | MHD | One poster: four cables could not reach the DME after a stopped flash (E82). Another member says K+DCAN with OTG has recovered failed flashes "every time". | 2 (S20, S21) | 1 (S15) | 1 (S34) |
| Unnamed adapter | MHD (custom tune) | Flash stopped at 51 percent, retry reached 100 percent, DME silent, bench repair. | 1 (S22) | 0 | 0 |
| Unnamed cable (COM port) | WinKFP (OEM-style flasher) | Failed twice with a tender fitted; fixed by serial latency and timeout changes, then flashed. | 1 (S30) | 0 | 0 |
| Unnamed adapter | xHP (TCU) | Flash failed near 30 percent several times; TCU silent; bench recovery advised; dealer quote $7,500. | 1 (S23) | 1 (S9) | 0 |
| ICOM A Next + 100 A maintainer | BMW ISTA forced programming | Comfort modules bricked on a 2022 X5, cause not established. OEM path, so not a tuner result. | 1 (S24) | 0 | 0 |

**Totals across the table:** 5 tuner-related threads read in full for adapter-related results (S20 to S23, S30), plus 1 OEM-tool thread (S24). Zero of these involved BM3 or the CX. That is the finding: the evidence for the owner's own stack (BM3 plus CX or WiFi ENET) is vendor pages only.

### Where the table disagrees with itself or with the sources

- **Cable versus WiFi.** BM3, MHD and xHP all steer to their WiFi adapter first. A snippet-only lead says a WiFi adapter was the cause of one failure and wired ENET fixed it (S25). In S21 a member recovered failed flashes with a K+DCAN cable and OTG. Same hardware class, opposite verdicts. Not resolved.
- **Same adapter, opposite vendor stance.** MHD's FAQ says non-MHD adapters may work (S16). MHD's connection page recommends only the MHD one and advises against third-party methods (S15). MHD's hardware page lists any WiFi ENET adapter that suits, in the deep note's reading of an earlier page. The three stances differ in strength.
- **Does an MHD adapter flash BM3?** One reseller says yes (S7). BM3's own pages do not list it. xHP says both work for xHP (S9). Different tools, so not a conflict, but no BM3 source confirms.
- **Charger size.** BM3: 20 to 50 A, trickle too weak (S5). xHP: about 30 A at 13.8 V (S9). MHD: no figure (S14). Threads: a 6 A, 10 A, 40 A and 70 A charger each appear in a failure or success story (snippets, S20). The numbers describe different things. No thread proves a size works.
- **BM3 "12 V" line versus 13.8 V.** Unresolved (carried from the deep note).
- **Does voltage explain it?** Snippet-only: some flash fine at 12.0 to 11.5 V with no charger; others fail with a 40 A charger (S20). Both cannot be fully voltage-driven.
- **WiFi to ENET reset time.** BM3 blog: over an hour asleep (S6). Reseller: 20 to 30 minutes (S7). BM3's help centre and blog agree on a 3-minute battery ground disconnect.
- **App Store figures.** The deep note read the US listing as 4.9 from about 2,000 ratings. The Canadian listing I read today says 4.8 from 170. Different storefronts; both show version 3.3.8 or later notes. Not a real conflict, but do not quote either as "the" rating.
- **Release notes.** The listing I read says 3.3.10 and that its notes match 3.3.8 and 3.1.25 (the fetch's own remark, S8). The "flash stops if agent disconnects" line is therefore not firmly dated to one version.
- **Support status.** The BM3 flash guide says "recovery is not covered". The BM3 failure page says "no separate recovery steps". The deep note's "BM3 recovery" claims came from other tools. All three agree there is no published BM3 recovery.

---

## What this means for OpenDiag (for the owner to judge)

Not code, not decisions. Inputs to the CAP sessions and the plan.

1. **The CX is a coding and diagnostics adapter in every source.** A BM3 session on the CX is unsupported by BM3's own pages and unreported by users. OpenDiag should not suggest it, and should say so plainly: "this adapter is not listed by your tuner".
2. **One client at a time is documented by BM3 too.** BM3's "not detected" page names interfering devices (piggyback tuners, valve controllers, OBD gauges) as blockers (S2). OpenDiag on the same car at the same time is the same class of risk. The plan's single-client check stands (fact 23 and 25 in the evidence file).
3. **Sequence the captures.** If the owner has used the BM3 WiFi adapter recently, the car may keep changed network settings for 20 minutes to over an hour (S6, S7). A wired ENET attempt in CAP-A could fail for that reason alone. Safest: do not use BM3 for several hours before CAP-A, and if no VIN is returned, do not take the battery-ground advice in a read-only session; wait and retry another day. (Disconnecting the battery is itself a change to the car; the sprint rules say reading only.)
4. **Battery rule check.** The sprint's own rule (12.4 V start, 12.0 V stop, maintainer in supply mode, no high-output charger on boost) is **stricter than** any vendor figure here and does not conflict with BM3's 20 to 50 A advice, which is for flashing, not for a read-only session. A high-amp "engine start" charger setting is the case to avoid; BM3's own guide names a charger with engine-start mode as an example of equipment (S4), which is for flashing, not for our reads.
5. **A safety display worth copying.** MHD blocks the flash on low battery (S14); xHP blocks on low voltage (S9). Both are the only tool-side voltage checks found. If OpenDiag ever writes (bench only, per decision 2), the same refusal pattern applies.
6. **Honest adapter information stays unbuilt.** All the "which adapter holds up" content in the evidence file is vendor opinion. Today's threads add 5 anecdotes, none of which isolates the adapter. A measured table is still new information (supports the direction note).

---

## Disagreements between sources (short list)

1. MHD: any adapter may work (FAQ) versus only the MHD adapter (connection page).
2. BM3 charger "not above 12 V" versus every supply figure at 13.2 to 13.8 V.
3. Cable versus WiFi as the more reliable path (vendors versus a snippet and one thread member).
4. WiFi-to-ENET reset: over an hour (BM3) versus 20 to 30 minutes (reseller).
5. Whether voltage explains failures: charger-fitted failures (40 A, tender) versus no-charger successes (snippets).
6. App Store rating: 4.9 from about 2,000 (US, earlier read) versus 4.8 from 170 (CA, today).

---

## Source ledger

IDs are local to this note. Read = fetched and read in this run. Dates are read dates (2026-11-24).

| ID | URL | Read? | Notes |
|---|---|---|---|
| S1 | https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/361693187/How+to+flash+your+BMW+F+and+G+series+A90+Toyota+Supra+with+bootmod3 | read | Community-style guide on the help centre; says not actively maintained |
| S2 | https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/567705602/OBD+Agent+Not+Detected+VIN+not+detected | read | 8 causes; page ends with a truncation notice |
| S3 | https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/2929819651/bootmod3+v3.0+User+Manual | PARTIAL | Contents list only; hardware section 8.1 body not returned |
| S4 | https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/461596/How+to+install+bootmod3+on+your+vehicle | read | Hardware needed; no battery or Bluetooth text; failure steps not included |
| S5 | https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/572456961/bootmod3+Flash+Failure+Troubleshooting+DME+TCU+Online+Recode | read | Charger 20 to 50 A, trickle, "12 V" line, retry option |
| S6 | https://checkout.bootmod3.com/blogs/news/connectivity-with-bootmod3 | read | Vendor blog; non-MFi, WiFi to ENET reset, Android and laptop notes |
| S7 | https://modeautoconcepts.com/pages/mhd-adapter-wifi-network-settings | read | Reseller how-to; 20 to 30 minute reset; MHD adapter with BM3 |
| S8 | https://apps.apple.com/ca/app/bootmod3/id1170348811 | read | Version 3.3.10, 4.8 from 170, notes on agent disconnect and adapter firmware |
| S9 | https://xautomotive.atlassian.net/wiki/spaces/NW/pages/1712062465/xHP+-+Flash+with+3rd+Party+Adapters | read | Adapter list, 11.9 V, 30 A and 13.8 V, voltage block, 25 percent phone |
| S10 | https://www.obdlink.com/faq/ | read | Third-party-app flashing statement; CX radio spec |
| S11 | https://bimmercode.app/adapters | read | Adapter list; CX "Made for BimmerCode"; bm3 and MHD ENET WiFi named |
| S12 | https://bimmertalk.com/obdlink-cx-bluetooth-5-1-obd2-adapter-for-bimmercode-review | read | Review dated 2026-09-20, updated 2026-11-22 |
| S13 | https://support.obdlink.com/support/solutions/articles/43000746707-obdlink-cx-adapter-notes | read | 247-byte MTU, no queued writes, 5-minute bonding |
| S14 | https://mgflasher.atlassian.net/wiki/spaces/MGFLASHER/pages/25624594/Flashing+procedure | read | Full enough this time: charger, battery block, loads, JB4 |
| S15 | https://mhd-tuning.atlassian.net/wiki/spaces/MFS2/pages/11173892/Connecting+to+Car | read | Recommends only MHD adapter; K+DCAN Android only, ENET iOS only |
| S16 | https://mhdtuning.com/pages/faq | read | Non-MHD adapters not recommended, silent on chargers |
| S17 | https://burgertuning.com/products/jb4-device-connection | read | JB4 Bluetooth kit on the JB4 data port |
| S18 | https://apps.apple.com/cn/app/jb4-mobile/id794841332?l=en | read | JB4 app: 15 ratings, 3.3, no OBD adapter mention |
| S19 | https://burgertuning.com/products/jb4pro-free-app-and-bt-adapter | FAILED | 429 rate limit; JB4PRO detail only from a search summary |
| S20 | https://www.1addicts.com/forums/showthread.php?p=27292412 | read | E82 135i, JB4 and MHD, four cables, 40 A charger, dealer says replace |
| S21 | https://g42.bimmerpost.com/forums/showthread.php?p=31474839 | read | N55 335i, Thor adapter, specialist recovery by 2024-09 |
| S22 | https://www.e90post.com/forums/showthread.php?p=32810664 | read | E90 custom tune, stopped at 51 percent, bench repair |
| S23 | https://g80.bimmerpost.com/forums/showthread.php?p=32720734 | read | G80 xHP TCU failure |
| S24 | https://diag.net/discussion/swyfyxtc04n3ogu9voziez1mem | read | OEM tooling bricking comfort modules with a 100 A maintainer |
| S25 | https://f80.bimmerpost.com/forums/showthread/1953602/mhd-unable-to-erase-memory-dme-bricked-now?p=31140989 | FAILED | Verification wall; only the title (from a redirect) and a search summary |
| S26 | Bimmerpost threads f80 t=1433971, f30 t=1824603, t=1884264, t=1744615 | FAILED | Verification wall; search summary only |
| S27 | https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/485130241/bootmod3+Release+Notes | read | Visible part: map releases only |
| S28 | https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/461476/Frequently+Asked+Questions+-+bootmod3+FAQ | PARTIAL | Truncated; nothing on adapters visible |
| S29 | https://mgflasher.atlassian.net/wiki/spaces/MGFLASHER/pages/28803124/Troubleshooting | read | Three items only |
| S30 | https://g42.bimmerpost.com/forums/showthread.php?p=30547623 | read | WinKFP and serial settings; tender used |
| S31 | https://mgflasher.atlassian.net/wiki/spaces/MGFLASHER/pages/26837002/Required+hardware | read | Adapter types; OBDLink and Bluetooth not mentioned |
| S32 | https://g87.bimmerpost.com/forums/showthread.php?p=32749235 | FAILED | Verification wall; search summary only |
| S33 | https://www.supramkv.com/goto/post?id=281905 | FAILED | 403; search summary only |
| S34 | https://www.supramkv.com/threads/mhd-failed-flash.12230/post-176936 and others | FAILED | 403; search summary only |

Other pages tried and failed: `help.bootmod3.com` (no such host), `bootmod3.com/get-started`, `www.bootmod3.com/faqs` and the BM3 adapter product page (403), `bootmod3.atlassian.net/wiki/x/b4wF` (adapter firmware page, returned empty), JB4PRO and UroTuning V3 adapter pages (429), SupraMKV posts (403), Spoolstreet (403), `old.reddit.com` (blocked by the fetch tool), `f10.bimmerpost.com` and several other Bimmerpost threads (verification wall). I did not try to get past the Bimmerpost "Verifying access" check; that is bot detection and is off limits. Search summaries are leads only and are marked as such throughout.

Clean-room check: only public vendor pages, public forum posts and app listings were read. No leaked OEM files, keys or tuning data were opened or reproduced. No GPL or non-commercial code was read.

---

## Open questions

1. **Owner knowledge (the fastest answer):** which adapter does the owner use with BM3 today, and has the CX ever been tried with BM3, even just to connect? A one-line answer settles Q5.
2. Can the owner save BM3 manual section 8.1 (WiFi adapter) and the BM3 FAQ as text into the private folder? The body text of both was not returned.
3. Does BM3's app check battery voltage before a flash, as MHD and xHP do? Not found. BM3 support could answer; the app's release notes might say it.
4. What state is the DME left in when BM3's "flash stops immediately" safeguard fires mid-write? No page says.
5. Is there an official BM3 list of approved adapters? A snippet mentions "the approved list". No such list was found.
6. How long after BM3 WiFi use does the car accept a wired session? One vendor says over an hour, a reseller says 20 to 30 minutes. CAP-A could measure it, read-only, if the owner records the time since the last BM3 session.
7. The four Bimmerpost BM3 failed-flash threads (S26): the owner could save them as text so they can be counted properly.
8. JB4PRO adapter page (S19) and the BM3 V3 adapter product page: re-fetch after the rate limit clears.
9. Does the BM3 agent need an IP link to the car? Inference only (section 1). BM3 support could confirm; it would explain why no Bluetooth adapter is listed.
