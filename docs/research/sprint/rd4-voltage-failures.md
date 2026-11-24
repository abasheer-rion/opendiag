# RD-4: Battery voltage and chargers, and why flashes fail (sprint Q8)

Written 2026-11-24 (sprint day 2). Reading only. Extends `docs/research/deep/bmw-coding-failures-and-recovery.md` and `docs/research/deep/bm3-adapters-and-flashing-transport.md`; it does not repeat their source lists, it checks the numbers against primary text and adds new stories.

Status: PARTIAL. Fact-checked 2026-11-24: BMW bulletin claims T1 to T6 re-read from the NHTSA PDFs (all held); bootmod3, BimmerCode, Clore, FenderBender and 1addicts re-fetched and corrected below. Bimmerpost returned 403 on the first try and again through the browser tool (Access Denied). Those pages were not read. Several forum and trade pages were read through a page fetcher that summarises with a small model, so those details are second-hand paraphrases. BMW bulletins were downloaded from the public NHTSA host and read as text.

## ANSWER FIRST

- The numbers do not really disagree. They measure different things. 12.5 and 12.0 V are battery health levels at rest. 13 V and above is a supply level held during programming. 10 V is a roadside special case.
- 12.6 V (a reseller blog) and 12.8 V (a vendor claim, not re-read) are weak. Neither is a BMW rule. Do not cite them.
- BMW's own bulletins give no programming voltage floor for normal workshop programming. They say always connect an approved charger or power supply, and nothing more.
- The one BMW-published programming number I could read: the roadside ISTA edition allows programming from 10 V, and says to hurry or add a supply. Regular ISTA "always requires a battery charger".
- Practitioner numbers for flashing a running-class supply are 13.5 to 14.4 V (trade articles) and 13.8 V at 30 A (xHP, second-hand). The F01-era BMW training line "above 13 V, never below 13 V" is only seen through a search summary and its host looks unofficial. Treat as indicative only.
- A charger being connected does not make a flash safe. Of 7 cases below (6 forum posts and 1 BMW bulletin), 5 had a charger, tender or maintainer attached and still failed. Causes named: weak charger (argued), battery sag, the interface, a retry, a software fault after an abort, and unknown.
- Trickle chargers and tenders are the repeated culprit in forum stories. Vendors say a real supply (30 A or more) is needed. No source tested this.
- Nobody publishes a failure rate by voltage. OpenDiag should log voltage and publish its own numbers.
- Proposal (not decided): reads warn below 12.4 V at start, stop below 12.0 V. Writes (bench only) need 13.0 V or more, steady, from a supply, before the first request.

## 1. Claims table: thresholds side by side

Confidence is for the claim as stated, not for the source being honest. "Single" means one independent source found.

| # | Claim (what it measures) | Source | Confidence | Single-source |
|---|---|---|---|---|
| T1 | Letting a BMW 12 V battery sit below 12.0 V at rest shortens its life. Recharge when below 12.5 V (71% charge). Colour bands: green above 12.5, yellow 12.0 to 12.5 (recharge), red below 12.0 (replace battery on new vehicles). This is dealer stock care, not a programming rule. | BMW SIB 61 18 08 rev 21, 2022-03-02 (NHTSA PDF), read as text. https://static.nhtsa.gov/odi/tsbs/2022/MC-10211866-9999.pdf | High (first-party, read in full text) | No (older revisions repeat it) |
| T2 | For charging a battery, BMW says use an approved charger with a recommended charging voltage of 14.8 V. This is charging, not a programming supply setting. | Same bulletin, same URL | High | No |
| T3 | Always connect a BMW-approved charger or power supply (refers to SI B04 23 10) when programming. No voltage number given in the bulletin text. | BMW SI B12 11 21 rev 1, 2024-08-16. https://static.nhtsa.gov/odi/tsbs/2024/MC-11006721-0001.pdf (read as text). Same sentence in MC-10181234-9999 (2020), read as text. | High | No (many bulletins) |
| T4 | Roadside/mobile ISTA edition allows programming "without the need of an external power supply", with only 10 V required. A pop-up allows programming while measured battery voltage is above 10 V. Advice: be quick or provide a supply. | BMW SIB 09 01 21 rev 2, 2022-05-20. https://static.nhtsa.gov/odi/tsbs/2022/MC-10215750-9999.pdf (read as text) | High | Single document (it is the only BMW document with a programming number I could read) |
| T5 | Same SIB: regular ISTA "always requires a battery charger"; workshop prep includes connecting a charger and a 60-minute update window. | Same URL, read as text | High | Single document |
| T6 | Programming can abort on undervoltage "when the vehicle is connected to an approved battery charger/power supply". Other listed causes: lost server link, module termination, ISTA/P termination, ICOM connector falls out. | BMW SI B34 05 14, Dec 2014. https://static.nhtsa.gov/odi/tsbs/2014/MC-10148180-9999.pdf (read as text) | High | Single document, but first-party |
| T7 | Start above 13 V; do not let the system voltage fall below 13 V during programming; approved charger in external supply mode. | A BMW F01-era training PDF on archive.org, seen ONLY as a search-result summary, not opened | Low to medium. I did not open it. Host is a public upload of BMW training material; I cannot confirm it was officially released, so it is not used as evidence here. | Single, unverified |
| T8 | bootmod3: use a charger with an adjustable current of 20 to 50 A, never above 50 A. Trickle chargers (2 to 6 A) that do not show their setting are unsuitable. Drive about 20 minutes if the car sat. | bootmod3 help page. https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/572456961/bootmod3+Flash+Failure+Troubleshooting+DME+TCU+Online+Recode (fetched twice; summary quoted the same amps) | Medium to high (vendor, current page) | No (also in deep notes) |
| T9 | The same bootmod3 page contains a line the fetcher quoted as "DO NOT USE higher than 12 volts", next to the charger amps lines (re-fetched in the fact check, same wording; an earlier fetch showed only amps). Context unclear: it may refer to the jump-start or charger output, and it cannot be reconciled with 13 V or 13.8 V supply figures. Meaning not established. | Same URL | Low (meaning unclear; wording came through a summarising fetcher) | Single |
| T10 | xHP (via a forum post quoting its manual): the car can draw up to 30 A during the flash; use a supply able to give 30 A at 13.8 V; do not want to see below 12 V at the start; a normal tender or charger only pre-charges, it does not stabilise. A weak battery can drop below 11.9 V. | Bimmerpost thread on xHP flash on F36 (search summary only; page 403). https://f30.bimmerpost.com/forums/showthread.php?t=1652694 | Medium for "xHP says"; low for the page text | Single, second-hand |
| T11 | Trade guidance: common programming setpoint about 13.9 V; the range by brand 13.5 to 14.4 V; BMW and Mercedes "often need" 100 A or more (its highlights say 70 to 100 A for European cars). The author is the head of a battery support equipment company; the article sells battery support equipment. | FenderBender article by a maker of battery service equipment. https://fenderbender.com/abrn-on-the-shop-floor/diagnostics-calibration-programming/article/55353785/associated-equipment-why-battery-support-is-critical-during-vehicle-scans-programming-and-adas-calibrations | Low to medium (vendor; says OEMs require exact settings but cites none) | Single |
| T12 | Clore (power supply maker): OE support voltage adjustable 13.1 to 14.9 V in 0.1 V steps; example setpoint 13.7 V; ripple under 100 mV; a quality supply should give at least 100 A; each manufacturer sets its own abort level and many stop programming when voltage goes above or below it. No BMW figures given. | Vehicle Service Pros guest blogs by Clore. https://www.vehicleservicepros.com/training-and-resources/guest-blogs/blog/55375852/clore-automotive-the-great-programming-uh-oh-when-voltage-drops-below-the-line and https://www.vehicleservicepros.com/training-and-resources/guest-blogs/blog/55387934/the-great-reprogramming-uh-oh-ii-how-to-recover-from-a-severe-voltage-drop | Medium (vendor; product specs, not OEM specs) | No (two articles, same author) |
| T13 | Mercedes: programming stops when voltage is too low, usually without bricking the module, and resumes when voltage is acceptable. Nissan and others: a single failure often bricks. | Clore article 1, same URL | Low to medium | Single |
| T14 | "Connect a voltage source to maintain at least 12.6 V" in a step for flashing the ASD ECU and adding coding data. The author calls it practical advice, not a BMW spec. | VXDiagshop blog. https://vxdiagshop.blogspot.com/2025/06/how-to-solve-bmw-e-sys-failed-to-get.html | Low (reseller blog) | Single |
| T15 | "Module can be bricked below about 12.8 V" (CAS). Not re-read: fetch had a certificate error in the deep run. | Carried over from `bmw-coding-failures-and-recovery.md` ledger | Low | Single, unverified |
| T16 | Chrysler TSB quoted on a forum: keep 13.2 to 13.5 V. Different make. A 2025 Dodge TSB seen in a search summary says a charger must support 50 to 60 A during a flash. | Carried over from `bm3-adapters-and-flashing-transport.md` (S36); the 2025 TSB seen in a search summary only | Low to medium; not BMW | Single each |
| T17 | A weak lead-acid battery sags faster; typical rest values: about 12.85 V full, 12.5 V three-quarters, 12.2 V half, 11.9 V a quarter. | A battery maker chart seen in a search summary (Stinger). Matches BMW T1 shape. | Medium (general chemistry) | Single page, but agrees with T1 |
| T18 | BimmerCode: the in-app low-battery warning showed 11.8 V in one user report and "didn't seem to affect coding". The user suspected coding might not take on a low battery. | X-Series forum post, search summary only. https://www.xseries-forum.com/forum/viewtopic.php?p=185247 | Low | Single |
| T19 | BimmerCode FAQ: no mention of chargers or a coding voltage. It mentions disconnecting the 12 V battery only as a reset or after-replacement step. It answers no to bricking and says interrupted coding can be restored from backup, but warns expert-mode misuse may need a reflash. | https://bimmercode.app/faq/ (fetched, summarised) | Medium to high (fetched summary, not full text) | No (in deep notes too) |
| T20 | Ripple and noise: modern electronics tolerate roughly 50 to 100 mV of ripple (trade author, not OEM). One article shows a "dirty" charger with 180 mV pulses and voltage near 16 V. A diag.net technician thread rated supplies by voltage deviation when a fan kicks in, not by ripple. | https://trade.mechanic.com.au/news/is-your-power-supply-dirty and https://diag.net/discussion/sabl2jdxpiyyrdcnogxegalvaa | Low to medium (informal, no controlled tests) | Mostly single |

## 2. Why the numbers differ (my reading, medium confidence)

- **Rest voltage versus supply voltage.** A battery with no charger and the car asleep reads 12.0 to 12.9 V (T1, T17). With a supply on, the car sees whatever the supply holds, 13 V or more (T10, T11, T12). Comparing 12.6 with 13.8 is comparing two different situations.
- **Charging setpoint versus programming setpoint.** BMW's 14.8 V (T2) is for charging a battery. Programming supplies are set lower, around 13.5 to 14 V in the trade pieces (T11, T12). Setting a supply to 14.8 V for a flash is not supported by any programming source I read.
- **Who sells what.** Four of the strongest-looking numbers (T11, T12, T20, part of T10) come from people who sell power supplies or flash tools. They are useful for engineering ranges, weak as proof of failure.
- **BMW says almost nothing numeric.** The only BMW programming number readable in public text is 10 V for roadside use (T4). The "13 V rule" (T7) may be real, but it was not verified.
- **Different cars and tools.** 12.6 V (T14) is a coding step for one module through a reseller's cable guide. 11.9 V (T10) is a tuner's low-battery signal. 13.2 to 13.5 V (T16) is Chrysler.

## 3. Failure stories (7), with cause

All are forum or bulletin reports, not tests. Cause is what the poster, responders or BMW stated, not proven.

**S-A. X5 N55, ISTA/P, third-party J2534 interface, maintainer attached (diag.net).**
- What happened: about 20 to 30 minutes into an engine computer update the mechanic turned the car off and removed the key. About 10 minutes later the session crashed. The car then had no dash lights, no crank, no start. A different scan tool could not talk to it.
- Voltage: a maintainer held the battery above 13 V the whole time, per the poster.
- Cause given: not voltage. Responders blamed the pass-through interface (an ICOM is expected for BMW), a corrupted key-access module, or modules left in transport mode.
- Outcome: modules likely wiped; bench repair considered; no result posted.
- Source: https://diag.net/discussion/sribs6zustmz7d2bcn63qpawgf. Confidence low (forum, second-hand). Also in the deep note as S3; this read adds the 13 V maintainer detail.

**S-B. 2003 Z4 2.5i, Siemens MS45.1, tuner file, no charger (HP Academy).**
- What happened: the owner flashed a new tune with the battery too low because he forgot the charger. The write failed and the engine computer was bricked. Two cloned replacement units both threw an "irreversible ECU error" and the car cranked but would not start. The original unit with its immobiliser reset ran fine.
- Voltage: no readings.
- Cause given: low voltage during the write.
- Outcome: not resolved in the thread.
- Source: https://www.hpacademy.com/forum/general-tuning-discussion/show/2003-bmw-z4-2-5i-crank-no-start-condition/. Confidence low (old car, other ECU, single post).

**S-C. Holden Commodore (labelled E39 by the poster), beta HP Tuners write.**
- What happened: a calibration write timed out three times. The battery read about 12.2 V, then 11.5 V, then 7.3 V across the failed attempts. The module then vanished from the dealer tool and reported "unlicensed".
- Cause given: repeated failed attempts drained the battery; each retry made it worse.
- Recovery: a licensed factory reflash restored the module. After charging the battery the same write worked. The owner now runs a charger at 6 A and suspects the 6 to 8 year old battery.
- Lesson for us: retries drain the battery, so a voltage check must run before every retry, not only the first attempt.
- Source: https://forum.hptuners.com/showthread.php?p=574096. Confidence medium for the numbers (poster's own readings), low for general claims. Different car and tool.

**S-D. 2011 135i (N54), MHD flash attempt, 40 A charger on (1addicts).**
- What happened: the poster was flashing MHD (a back-end flash mode, later asking how to get back to stock); the flash stopped partway. A pump kept running and the dash lit up. After that the tool could not reach the engine computer. Other modules answered on a diagnostic tool.
- Charger: the poster disconnected the battery for 30 minutes, fully charged it, then kept a 40 A charger on during retries. Nothing restored contact (MHD said it could not contact the engine computer). No voltage readings.
- Cause given: not agreed. Candidates: interrupted flash, wrong key position, ignition not on, tuner not in airplane mode, aftermarket head unit, bent pin (unlikely, port tested fine).
- Outcome: dealer said the DME needed replacing; another member said his was restored after a similar failure.
- Source: https://www.1addicts.com/forums/showthread.php?p=27292412. Confidence low.

**S-E. 2011 335i (N55), MHD with a Thor adapter, tender on (Bimmerpost, read via search summary and a second fetch).**
- What happened: the flash froze at the start and later attempts would not connect. Engine computer and key-access module were removed and sent to a recovery shop. A member reported later that the shop recovered it.
- Charger: a battery tender was connected. One member said a tender cannot hold voltage through a long flash and a weak battery may have contributed. No voltage readings.
- Cause given: not settled. Adapter versus tool versus voltage were all argued.
- Source: https://g42.bimmerpost.com/forums/showthread.php?p=31474839 (fetched summary; the same site returned 403 on my later direct tries). Confidence low.

**S-F. E92 325i, Bimmworks online tune, 30 A supply (E90Post, May 2024).**
- What happened: a failed write of the unlock file. The car then cranked but did not start, and contact with the engine computer was lost.
- Charger: the poster said a charger and later a 30 A power supply were connected. Another member advised a 30 A supply.
- Cause given: not stated. Replies were split between "nearly impossible to brick" and members listing losses of $1,200 to $2,200 per unit.
- Source: https://g42.bimmerpost.com/forums/showthread.php?p=31187325 (fetch summary). Confidence low. This story is evidence that a 30 A supply is not a guarantee.

**S-G. BMW's own bulletin: DSC module dead after an aborted programming run.**
- What happened: if programming ends because of undervoltage, lost server link, module termination, ISTA/P termination or the ICOM plug coming out, the DSC module may stop talking to the tool and cannot be reprogrammed.
- Charger: the bulletin explicitly lists undervoltage "when the vehicle is connected to an approved battery charger/power supply".
- Cause given by BMW: DSC software. Fix: disconnect the module, remove charger and battery, reconnect, retry.
- Source: BMW SI B34 05 14, December 2014 (F01, F02, F06, F07, F10, F12, F13, F15). BMW adds that in some cases the reset fails and a replacement DSC module is needed. https://static.nhtsa.gov/odi/tsbs/2014/MC-10148180-9999.pdf. Confidence high that BMW says it. Counts as first-party proof that a charger is not a guarantee, and that a failed run can leave a module unreachable until a reset.

Also seen, no voltage detail: E90 335i with MHD "retry from failed flash" finished fast, reported success, then the engine computer would not answer MHD or ProTool (E90Post, https://www.e90post.com/forums/showthread.php?p=32810664). Cause unknown; responders blamed a file-path error and the retry step, not voltage.

### What the 7 stories add up to

- Charger or maintainer attached and still failed: S-A, S-D, S-E, S-F, S-G (5 of 7). No charger: S-B. Voltage readings given: S-A (above 13 V), S-C only. Failure rate: unknown, no source has one.
- Named causes besides low voltage: interface type (S-A), a retry mode (E90 note), link and plug loss (S-G), an interrupted flash with the car state wrong (S-D).
- A cautious reading: a charger removes one cause. It does not remove the interface, link, car-state, retry or tool-bug causes. This agrees with the deep note.

## 4. Why failures happen with a charger attached (candidates)

Ranked by how many sources point at them. None is proven.

| Candidate cause | Who says it | Evidence quality |
|---|---|---|
| Charger or maintainer cannot deliver the current. Flash with the car awake can draw tens of amps (xHP says 30 A; Dodge TSB says 50 to 60 A; Clore says 100 A floor). A 2 to 10 A unit sags. | bootmod3 (T8), xHP via forum (T10), Bimmerpost member on a tender (S-E), HP Tuners user on a 6 A charger (S-C) | Medium on the principle, weak on the numbers |
| Load surges: cooling fans, pumps, wipers, door or window use. Voltage dips for a moment and the module aborts. | FenderBender (T11), a diag.net technician (T20), Bimmerpost wiper remark in deep note | Low to medium |
| Charger is in a charging mode, not a supply mode. Charging stages move the voltage and some units cycle. Many OEM procedures ask for a "power supply mode". | FenderBender (T11); Midtronics article seen in a search summary | Low (vendors) |
| Ripple and noise on the supply. | Mechanic.com.au and Clore (T12, T20). One technician says ripple is not the main issue. | Low. No test linked a charger's ripple to a failed flash. |
| Connection quality. The poor clamp, the corroded post, or connecting the supply far from the battery. xHP reportedly wants it in the engine bay. | xHP via forum (T10) | Low |
| Not voltage at all: interface (S-A), cable (S-E), link drop, wrong ignition state, a door opened, phone call, antivirus, a retry mode. | BMW bulletin lists (T6), bootmod3 page, several forum stories | Medium |
| Module software error after an abort (DSC case). | BMW (T6) | High |

## 5. Disagreements between sources

- **12.6 V versus 12.8 V versus 13 V.** Unresolved as numbers, but explained in section 2. 12.6 is a reseller coding step (T14). 12.8 is not read. 13 is a training line seen only in a search summary (T7). BMW's bulletins give none of them for programming.
- **13.8 V (xHP, T10) versus 13.2 to 13.5 V (Chrysler, T16) versus 13.1 to 14.9 V adjustable (Clore, T12) versus 13.5 to 14.4 V by brand (FenderBender, T11).** These overlap around 13.5 to 14 V. A supply setpoint of about 13.5 to 13.8 V is inside every range.
- **bootmod3 "DO NOT USE higher than 12 volts" (T9) versus every other source.** Still unresolved. Wording re-confirmed through a summarising fetch, but the subject (charger setting, jump source, or something else) is not clear. The owner should read that line on the page directly. Do not use it.
- **Is a tender enough?** bootmod3 says 2 to 6 A is not (T8). xHP via a forum says a tender only pre-charges (T10). A 1addicts poster ran a 40 A charger and failed anyway (S-D). A HP Tuners user succeeded with a 6 A charger on a good battery (S-C). So "size matters" is supported, "size is sufficient" is not.
- **Is a charger better than a battery alone?** FenderBender says a traditional charger is built to refill a battery, not to power electronics (T11). Another author says a supply should never replace a fully charged battery (T20). One technician thread preferred chargers (Iota 75 A, PowerMAX 55 A) over others. Vendor stake in each.
- **BMW's training line (above 13 V at all times) versus the BMW roadside rule (10 V is fine).** Different contexts (full workshop update versus a short fix of one faulty module). Both could be right.
- **Does a failed flash brick or just stall?** Mercedes via Clore says usually recoverable (T13). BMW bulletins describe modules that need a reset (T6). Forum stories include replaced units (S-D) and recovered ones (S-E). No rates.

## 6. What we can measure ourselves (links to CAP-A and CAP-B)

Nothing here needs a write. All of these are reads.
- Log the battery voltage the adapter reports (OBDLink CX reads pin 16 voltage; the ENET path has no voltage readout, so a multimeter at the socket is the check). One value at start, one every few seconds during the scan, one at the end.
- Four readings are worth having: engine off, ignition off; ignition on; ignition on with the charger or maintainer attached; engine running. This shows how far each differs from the rest numbers in T1.
- Note any session where voltage drops more than 0.5 V from the start value. That is a candidate for the warn rule below.
- Do not drain the battery on purpose to find a floor. Rest values from BMW (T1) are enough for a reads warning.

## 7. Recommended thresholds (PROPOSAL, not decided)

These replace nothing until the owner decides. The existing D6 in `research-sprint.md` already proposes "warn below 12.4 V at start, block below 12.0 V on reads"; the evidence supports keeping those values, with the wording below.

### Read-session warn threshold (proposal)

- Warn if, with the engine off, voltage is below **12.4 V** at session start. Reason: BMW says recharge below 12.5 V and calls below 12.0 V a red state (T1). Using 12.4 V instead of 12.5 V leaves a small margin for adapter measurement error; the 0.1 V margin is my choice, not a source's.
- Stop and ask the user to confirm if voltage is below **12.0 V** (proposal; matches T1 red band and the decision D6 block value).
- Warn if voltage falls **0.5 V or more** below the start reading during a session, or reads under 12.0 V at any point. The 0.5 V figure is my proposal; no source gives it.
- With the engine running, a reading of 13.0 V or above is expected (T17 shape; BMW running voltage not read in a primary source). Do not warn on 13.0 to 14.8 V.
- Do not warn about chargers on a plain read. Mention a maintainer only for sessions over 25 minutes (decision D7).
- Show the number and the rest-state meaning in plain words. Do not say "your car will fail". No source supports a failure link for reads.

### Write-engine threshold (proposal; bench modules only under decision 2)

- Require a regulated supply, not a tender or trickle charger. Ask the user to confirm the supply type and its amps (at least 30 A for anything run on a real car, per xHP via forum; bench modules may need far less, so the bench value is set by measurement).
- Block the start unless voltage is **13.0 V or above** and steady for 30 seconds (proposal: spread under 0.2 V). Basis: the 13 V training line (T7, unverified) sits below every programming setpoint in T10 to T12, so it is the lowest number consistent with all of them.
- Block above **14.9 V** (the top of Clore's adjustable range, T12). Proposal.
- During the write, check voltage between requests. Abort cleanly between requests, never mid-block, if voltage drops under **12.6 V** (proposal; ties to the 12.6 V in T14 as a floor, not as a target). For a flash with no safe abort point, the check happens only at the start and the user is told so.
- Re-check voltage before every retry (S-C shows retries drain the battery). Refuse a retry that begins under the start threshold.
- Log voltage every second to the local record. This builds the first dataset of failures by voltage, which no source has.
- Revisit after CAP-A and CAP-B give real readings, and after the bench module is on the owner's supply: bench modules are not in a car, so car-level sags (fans, pumps) do not apply.

## 8. Clean-room and safety notes

- Everything above comes from public pages, public NHTSA bulletins, vendor pages and forums. No OEM database, key, leaked document or cracked tool was used.
- The BMW training PDF host is a public archive upload. It was not opened. Whether it is officially released is unknown, so it is listed as "seen in a search result only" and not relied on.
- Do not paste the SI B04 23 10 charger list or any BMW bulletin text into the repo. Link only.
- No secrets, no keys, no credentials were touched.

## 9. Source ledger

Read (full text or fetch summary):
- BMW SIB 61 18 08 rev 21 (2022-03-02), NHTSA PDF, extracted with pdftotext. Read the situation, colour band and charging sections. https://static.nhtsa.gov/odi/tsbs/2022/MC-10211866-9999.pdf
- BMW SIB 09 01 21 rev 2 (2022-05-20), NHTSA PDF, pdftotext. https://static.nhtsa.gov/odi/tsbs/2022/MC-10215750-9999.pdf
- BMW SI B34 05 14 (Dec 2014), NHTSA PDF, pdftotext. https://static.nhtsa.gov/odi/tsbs/2014/MC-10148180-9999.pdf
- BMW SI B12 11 21 rev 1 (2024-08-16), NHTSA PDF, pdftotext (charger sentence only). https://static.nhtsa.gov/odi/tsbs/2024/MC-11006721-0001.pdf
- NHTSA MC-10181234-9999 (2020), pdftotext grep (charger sentence only; I did not read the subject block). https://static.nhtsa.gov/odi/tsbs/2020/MC-10181234-9999.pdf
- bootmod3 flash failure page, fetched summary (twice via fetch and a search quote). Wording of the 12 V line is not certain.
- BimmerCode FAQ, fetched summary.
- Vehicle Service Pros / Clore articles (two), fetched summaries.
- FenderBender battery support article, fetched summary.
- Mechanic.com.au "Is your power supply dirty?", fetched summary.
- diag.net threads: X5 programming failure, reprogramming noise thread, fetched summaries.
- HP Academy Z4 thread, HP Tuners thread, E90Post MHD threads (two), 1addicts thread, Bimmerpost 335i thread, VXDiagshop blog: fetched summaries.

Search-summary only (not opened):
- xHP quote and 11.9 V context in the Bimmerpost xHP thread (page 403). Other xHP threads listed in the search (F80 "heart attack", F10 "did I brick my TCU", E90 "XHP flashtool failing", G20 "failure to flash") were returned by the search but their pages were not readable (access check). They are the next reads if the owner can save the pages as text.
- The BMW F01 training PDF (T7); the BMW battery bulletin voltage tables from 2013 to 2015 (the 12.9 V full value); BMW SI B04 23 10 (not public); Midtronics note; a 2024 and a 2025 Chrysler/Dodge TSB; a battery-maker chart (T17); X-Series BimmerCode post (T18).

Failed to load:
- Bimmerpost (f30, f80, f10 pages): HTTP 403, retried once in the browser tool, still "Access Denied". Not bypassed.
- The deep run's earlier failures stand: Reddit, Spoolstreet, Haynes, the BM3 help centre root, Supra MKV thread.

## 10. Open questions

1. What the bootmod3 12 V line refers to (wording "DO NOT USE higher than 12 volts" seen twice via fetcher). Owner can read it on the page.
2. Does BMW publish a programming voltage floor in ISTA or TIS? Not public, so unknown; ask a workshop contact or find a public ISTA user's screenshot of the preparation screen.
3. How much current does a real N54 or B58 draw during a DME flash with the engine off? No source measured it. A clamp meter reading during CAP runs would answer reads only, but it would still help size the supply.
4. Does a tender or trickle charger fail in practice? Only forum opinions. A logged voltage trace from a coding session with and without a tender would settle part of it.
5. Does the OBDLink CX report voltage accurately and often enough for a gate? Needs a multimeter comparison (CAP-C).
6. Are the 12.6 V and 12.8 V figures traced to anything? Not found.
7. What does the ENET path report for voltage? Unknown; HSFZ has no standard voltage field that I read about.
8. Real failure rates by voltage band and charger class: no one has them. OpenDiag's opt-in log could.
