# BMW coding and flashing failures, and how people recover

Research for OpenDiag's failsafe pipeline. Written 2026-11-20.

Method note. Sources were found with web search and then read with a page fetcher. The fetcher summarises pages with a small model, so forum details are second-hand paraphrases, not verbatim reads. BMW service bulletins were downloaded as PDFs from the NHTSA public host and read as text (rows S4-S6, S22-S30). The search tool's daily budget ran out partway, so the last planned queries (bootmod3 forum threads, bench-repair pricing, standards papers) did not run. Bimmerpost, Supra MKV and several other forums returned 403 and could not be read. Details in the ledger and in "Evidence quality".

References like [S12] point to the Source ledger at the end. "Snippet-only" means a claim appeared in a search result summary and the page was never opened; those are listed separately and are not counted as pages read.

---

## Summary

- **Low or unstable battery voltage is the cause BMW itself names, and the one every tool vendor repeats.** BMW bulletins say to always connect an approved charger/power supply [S5, S6, S26]. A programming-equipment guide says low-voltage failures are largely avoidable with a steady supply [S2, S21]. No source gives measured failure rates by voltage.
- **BMW's own factory process fails too.** BMW's internal bulletins describe control units crashing during dealer programming and set up a recovery team (IRAP) for that case [S23, S24]. A dealer-side diagnostician reports modules dying on a forced full-car update, even with a 100 A maintainer and the factory interface [S13]. Nobody supplied a count.
- **The head unit is the module BMW documents failing most.** Bootloader bugs in the NBT EVO head unit cause programming aborts and a blue screen that a battery reset does not fix [S5, S28]. Newer head units (HU-H4 to H6) also have bulletins about going unresponsive [S6, S25, S27, S29].
- **A failed write can lose more than the target module.** Reports include a gateway erased during an aftermarket-tool flash [S15], a car with no power after a DME update [S3], and a stability-control module left dead after a voltage dip [S9].
- **Many "bricked" modules are not dead.** A footwell module's coding was corrupted, not the hardware, and was restored by an independent shop [S18]. A tuning flash recovered by re-flashing stock [S19; S35 is a Ford tuning case recovered with an older tool version]. BimmerCode's own FAQ says its codings cannot permanently brick a unit, though expert mode can force a reflash [S12].
- **Restore-from-backup is the main safeguard in consumer apps, and it does not always work.** BimmerCode support says backups fix interrupted coding [S12], but users report restore failing with "coding data invalid" [S16] and needing a remote session with a developer-grade tool to fix it [S32].
- **Wrong or missing vehicle data causes a separate class of failure.** A replacement front module with no vehicle order blocks the programming tool [S20]. A wrong option code in the vehicle order was a factory-level mistake that needed a recall-style fix [S30]. Mismatched engine and immobiliser data produces a permanent fault [S33].
- **Software-version mismatch is common in coding with developer tools.** A used module with older software has no matching coding file, so the tool refuses [S37]. The answer was to flash the right software first, then code.
- **Cost reports range from about 40 pounds to about 7,500 dollars, with no systematic data.** The extremes are an independent repair of a footwell module [S11] and a dealer transmission-module quote (search snippet, unverified). Typical dealer replacement quotes sit at 1,000 to 3,500 dollars [S8, S9, S14, S18].
- **Nobody publishes how often this happens.** Every frequency claim is "common" or "known" with no count [S13]. OpenDiag should collect its own numbers.

---

## What I found

### 1. What actually fails, by module

**Head unit (NBT / NBT EVO / HU-H4 to H6).** This is the best-documented case, because BMW wrote bulletins about it.

- BMW's NBT EVO bulletin says aborted programming can leave the screen blue, with a battery reset not helping. Cause given: a bug in the head unit's bootloader [S5, S26, S28]. Fix is two steps: factory support rewrites the bootloader remotely (an IRAP session), then ISTA finishes programming. A later revision adds a first step, a "programming abort" service function inside the measures plan, before escalating [S28].
- The same wording appears in a MINI version of the bulletin, so the problem was shared across the group [S26].
- Newer units: bulletins from 2023 and 2025 say the head unit can go black or show only the BMW logo, and take the cluster, audio module and telematics module with it in the diagnostic tool [S6, S25]. The listed first step is a 30-minute battery disconnect [S25]. The later 2025/2026 bulletins describe resets, slow start-up and failed start-up, and say "program the complete vehicle" [S27, S29].
- A separate bulletin says a head unit modified to unlock unauthorised features (for example CarPlay) can have its licence codes wiped when ISTA calculates its measures plan [S7]. This is about licensing, not bricking, but it shows that a "clean" factory update can punish a modified unit.
- A technician reported an M240i head unit stuck on a blue screen after a flash, with no communication and no way to program it [S8]. Single source.

**Footwell module (FRM) on E-series.**

- A poster blamed a battery change for corrupting the original unit's coding; a later flash with a legacy tool failed at about 5 percent with a connection-lost error and erased the replacement's coding too. An independent shop repaired the original, recovered its coding and wrote it to the new unit [S18]. Dealer quote was about 1,500 dollars for replacement plus coding [S18].
- BimmerCode's FAQ says a restart after battery replacement can expose a faulty FRM [S12]. It also blocks coding on some FRMs when it sees a corrupted boot sector, because the unit might not restart [S12].
- Another thread was about lighting and wiper features switching off after a retrofit. The thread's answer was that the tool loaded a default profile instead of preserving existing settings, so nothing was "bricked" [S11]. This is a useful reminder that "my module is dead" is often "my coding was overwritten".
- Repair price quoted for an independent fix of an FRM: about 40 pounds with a lifetime warranty, four days [S11]. Single source and it is not clear which fault it fixed.

**Car access module (CAS) and immobiliser pairing.**

- A 2013 X5 went dark (no dash, no shifter, no start) after a key programmer attempted a method on the CAS without a power supply connected. A dealer fitted a new CAS. Total cost 1,082.73 dollars including tow [S14]. Single source.
- An X5 M lost its engine/immobiliser pairing after repeated key-learning attempts drained the battery. Thread unresolved. Responders disagreed on the cause [S36].
- A 2007 335i had a permanent fault from a mismatch between the engine computer and the CAS (a "power class" check described as a security measure). Fix proposed: put the original parts back, code the footwell module, then re-pair [S33]. Not confirmed solved.
- A shop-level repair of a CAS (sent out, reinstalled) avoided the need to re-pair keys [S34].
- The general description of CAS failure from a diagnostic site lists water damage and low or high voltage as causes, and says a new CAS needs programming after install [S10]. No cost given.

**Engine computer (DME).**

- Official bootmod3 troubleshooting says a stable battery is essential, lists chargers of 20 to 50 amps as the right class, and says small trickle chargers (2 to 6 amps) are unsuitable [S1]. It also names non-battery causes: firewall or antivirus software, a piggyback tuner still active, an exhaust-flap controller, and a third-party OBD gauge [S1]. Steps given: retry with the last map option (full flash with unlock), then disable security software, then remove accessories [S1].
- The page content was cut off before any "DME bricked" section, so what bootmod3 says about unrecoverable cases is unknown [S1, S31].
- On an older M3 DME a custom-bootloader job hung, left the unit stuck in a programming mode, and was recovered by re-flashing stock with the factory-style tool. The cause was a write speed the unit could not take [S19]. After the tune, an immobiliser sync problem remained open. This is a different platform and tool from BM3, so treat as an analogy.
- An X5 (N55) DME update through ISTA/P with a third-party J2534 interface crashed about 10 minutes after the key was removed; the car then had no power. Maintainer held above 13 volts, so voltage was not the cause. Responders blamed the J2534 interface and said an ICOM is needed for BMW [S3]. Outcome unclear.
- Reported cost of a transmission mechatronic quote of 7,500 dollars is snippet-only (see below).

**Stability control (DSC), gateway, A/C, roof module.**

- A 2006 325i's DSC died when voltage dropped during a programming attempt with a common aftermarket scan tool, even with a charger attached. A used unit then failed to take programming, setting VIN or calibration mismatch codes. Unsolved; dealer new unit about 3,000 dollars, best aftermarket about 1,300 [S9].
- A UK X3 had its gateway lose all configuration during an aftermarket-tool flash. A new gateway could not be programmed by that tool or by remote help. Dealer finished it. Question of who pays went unanswered [S15].
- On a 2022 X5 M50i, replacing a radar module led the roof electronics and A/C modules to stop talking during a forced full-car update with the factory interface and a 100 A maintainer. Replacement of those modules let programming complete. About 2,500 dollars lost [S13]. Single source and the poster's causal claim is not backed with data.
- A MINI's climate-control unit stayed in a bad state after a failed BimmerCode write (defrost stuck on, no cooling, battery drain). Restore failed. A BimmerCode staff member later fixed it remotely with a developer coding tool and an ENET cable in about two minutes [S16, S32].

### 2. Root causes, grouped

Compiled from the sources above. Evidence strength in brackets.

1. **Power instability** (strong that it matters, weak on thresholds). BMW tells dealers to use an approved charger every time [S4, S5, S26]. Tuning and coding vendors say the same [S1, S12 partly]. Examples where a charger or maintainer was connected and the failure happened anyway: [S3, S9, S13]. So "connect a charger" is necessary but not sufficient, and a trickle charger is explicitly called out as inadequate [S1, S2].
2. **Link instability.** BMW's recovery bulletin lists network problems, bad interfaces and Ethernet cables, aftermarket chargers, tool bugs, and in-car bus problems as causes [S23, S24]. Bootmod3 lists dropping connections and software that interferes with the link [S1]. Posters say non-BMW interfaces are risky [S3, S15].
3. **Bootloader or firmware bugs in the module itself.** The head unit bulletins say so directly [S5, S28]. Not user-preventable, but recoverable by the factory with a special session.
4. **Tool or data mismatch.** Wrong software version or missing coding file for the installed software [S37]; vehicle order missing on a replacement [S20]; wrong option in the vehicle order [S30]; engine and access-module data mismatch [S33]; coding tool writing a default profile [S11].
5. **Operator procedure.** Key removed or ignition changed during a write [S3]; an unusual procedure attempted with no power supply [S14]; repeated learning attempts draining the battery [S36]; expert-mode edits [S12].
6. **Modified or unusual hardware.** Retrofit or unlocked head units are refused by BimmerCode [S12] and can lose licences in factory updates [S7]. Used modules with old software [S37].
7. **Aftermarket devices on the car's diagnostic port or bus** (tuner boxes, gauges, flap controllers) [S1, S19].

### 3. What recovery looks like when it is public

From mildest to worst:

- **Power cycle.** BimmerCode says disconnect the 12 V battery for a few minutes (15 minutes or more on two-battery cars) for an unresponsive body controller [S12]. BMW tells dealers to disconnect for 30 minutes before reprogramming certain head units [S25]. A general power-supply article says BMW and Mini want power removed from other modules for 30 seconds, with the key on for gateway failures [S2, S21].
- **Retry the flash.** Bootmod3's first step is to retry the full flash [S1].
- **Restore the app's backup.** BimmerCode's documented answer [S12]. Failure reports: restore failing at the very end on one adapter, fixed by updating adapter firmware and the app (search snippet, Supra forum, not opened). A MINI where restore reported "data could not be restored" [S16].
- **Developer-tool reset to factory coding.** The BimmerCode developer did this for a user in a remote session [S32]. This works because the factory coding file for the car can be regenerated.
- **Factory recovery session (IRAP).** BMW dealers open a case, the factory team connects remotely and tries to revive the module, and if that fails they issue a replacement authorisation [S23, S24, S5]. Modules may take "a significant amount of time" [S24]. Independent users cannot do this [S13].
- **Re-flash the module with the dealer tool** (ISTA, programming the whole car). Standard dealer fix [S6, S25, S29].
- **Bench repair by an independent shop.** Multiple threads say shops open the module and rewrite its memory [S3, S18, S34, S9]. Snippet-only: one shop lists a revival service at 799 dollars for the front electronics module (see below).
- **Replace the module and code it.** Dealer quotes: FRM about 1,500 [S18]; head unit about 3,500 [S8]; DSC about 3,000 [S9]; CAS 1,083 total after tow [S14]; five-week dealer stay with 3,800 charged and the replacement still uncodable (snippet-only).
- **Scrap the car.** One poster on an EGS failure ended up scrapping the vehicle [S15]. Another thread says the customer was likely to scrap the car [S9]. Anecdotes.

Counter-cases where tool vendors say "can't be bricked": BimmerCode FAQ states coding cannot permanently brick a control unit, though expert mode can require a reflash [S12]. The evidence in [S16] shows coding can leave a module in a bad state that the app itself cannot undo. Both can be true: the unit is recoverable in principle but not by the user's app.

### 4. Cost and frequency

Costs we can cite (all single-source, forum or vendor):

| Item | Figure | Source |
|---|---|---|
| Independent FRM repair (UK) | about 40 GBP | S11 |
| CAS replacement incl. tow | 1,082.73 USD | S14 |
| Dealer FRM replace + code | about 1,500 USD | S18 |
| Used or aftermarket DSC | about 1,300 USD | S9 |
| Dealer DSC | about 3,000 USD | S9 |
| Dealer head unit | about 3,500 USD | S8 |
| Cost of a dead roof + A/C module pair | about 2,500 USD | S13 |
| Dealer ICOM interface (poster's guess) | about 800 USD | S3 |

Snippet-only figures (not verified): 799 USD bench revival for front electronics modules; 7,500 USD transmission mechatronic; 3,800 USD charged with module uncodable.

**Frequency: unknown.** One technician says it is common [S13]. BimmerCode says body controller non-response is rare [S12]. BMW created a standing recovery programme, which implies it is frequent enough to staff [S23, S24], but no count is published. There is no denominator (successful flashes) anywhere in the evidence.

### 5. Safeguards that would have prevented each cause

This is the bridge to the design. "Prevented" means the safeguard blocks or reduces the harm in that incident as described.

| Incident | Root cause | Safeguard that would have helped |
|---|---|---|
| Module dead after low-voltage write [S9, S10, S2] | Voltage dipped mid-write | Read live voltage before start and every few seconds; refuse to start below a floor; pause or abort cleanly if it sags |
| Charger connected, still failed [S3, S9, S13] | Charger inadequate, or cause was not voltage | Ask for charger class; check voltage under load (ignition on, fans, lights); log all runs so patterns show |
| Interface dropped mid-write [S1, S15, S23] | Link fault | Link health checks before start; chunked writes with resume; refuse flaky adapters; require wired link for flashing |
| Head unit aborts, blue screen [S5, S28] | Module bootloader bug | Do not flash head units in v1; or flag known-risk part numbers and refuse |
| Key removed or ignition changed mid-write [S3] | Operator action | Lock the UI during a write; screen the user through "do not touch" steps; detect ignition change and stop |
| Unusual procedure, no power supply [S14, S36] | Operator procedure | Do not offer key or immobiliser operations at all |
| Coding wrote default profile [S11] | Tool overwrote existing settings | Always read and save the full current coding first; diff before write; write only changed values |
| Restore failed [S16] | Backup incomplete or restore path flawed | Verify the backup by re-reading; test restore logic on bench data; keep two copies; store factory coding for the car as a second fallback |
| Missing vehicle order after module swap [S20] | Procedure skipped | Detect empty vehicle data; block coding until imported |
| Wrong option in vehicle order [S30] | Source data wrong | Cross-check vehicle order against installed modules; warn on option codes the car does not have |
| Used module with old software, no matching coding file [S37] | Version mismatch | Compare software version to coding file before writing; refuse on no match |
| Engine and access-module data mismatch [S33] | Paired data out of step | Do not touch paired security data; warn when swapping paired modules |
| Modified head unit refused or licence wiped [S7, S12] | Unlock hacks | Detect and warn; never offer unlock features |
| Accessory devices on port [S1, S19] | Interference | Ask the user to remove them; detect extra bus traffic where possible |
| Forced full-car update killed unrelated modules [S13] | Wide-blast-radius operation | Never programme the whole car; write one module at a time with a plan the user approves |

---

## Evidence quality and disagreements

**Strong (high reliability).** The BMW service bulletins [S4-S6, S22-S30] are first-party, dated, and specific. They are the best evidence that (a) programming aborts occur on BMW's own process, (b) a battery reset sometimes does not fix them, (c) a factory-side bootloader rewrite exists, and (d) BMW requires an approved charger. They do not give rates, and they cover only the head unit in detail. I could only read the text through PDF extraction; the first two bulletins were read in full, the others to the "situation / cause / correction" sections.

**Medium.** The bootmod3 page [S1] and BimmerCode FAQ [S12] are vendor statements. Both are useful for what the vendor promises, not for what really happens. The Clore articles [S2, S21] are a vendor article that sells power supplies; its general claims fit BMW's, but its voltage and current figures are for its own products.

**Low.** Every forum and Q&A thread is a single anecdote with unverified cause. The fetch tool summarised them with a small model; several diag.net replies were unreadable and the summaries say so. The poster's diagnosis is often a guess, and the thread often ends "unsolved".

**Disagreements and tensions.**

- *Can a coding app brick a module?* BimmerCode: no, but expert mode can force a reflash [S12]. A user report: the climate unit stayed broken after a failed write and restore failed [S16], needing a developer tool to fix [S32]. Consistent only if "brick" means "unrecoverable by any means".
- *Does a charger fix voltage problems?* Vendors and BMW say use one [S1, S5]. Cases exist where a charger or maintainer was connected and the failure happened anyway [S3, S9, S13]. One forum reply in a search summary argues a tender is not enough for a long flash. Charger class matters, not just presence [S1].
- *Is third-party tooling the problem?* Several posters say a genuine ICOM is required [S3, S8, S9 partly]. One poster whose failure occurred with the factory interface says the factory process fails too [S13]. BMW's own bulletin lists equipment and cables as causes [S23, S24] but also software and bus problems, so neither side is cleared.
- *Fixing with a battery reset.* BMW recommends it for some head units [S25, S6]; the NBT EVO bulletin says it does not work for that fault [S5, S28]; BimmerCode recommends it for body controller stalls [S12]; one forum reply doubted it helps with coding stored in memory [S16]. These apply to different faults.
- *Bad "brick" language.* Posters use "bricked" for anything from a feature switch-off [S11] to a dead unit [S9]. Any incident count built from forum titles would overstate real hardware loss.

**Gaps in the evidence.**

- No frequency data. No denominator.
- No Reddit or Bimmerpost threads read (blocked or unreachable).
- Nothing about BM3-specific DME recovery. Official page truncated [S1].
- No coverage of newer security (G-series secure gateway, authentication) from independent sources.
- Cost figures come from posts of different years and countries.
- No academic or standards sources read. The search budget ended before they were queried.

---

## Implications for OpenDiag

### Build

1. **Read-only first.** The v1 pipeline should read, back up, diff and explain before it ever writes. That removes most of the risk by design [S11, S12].
2. **Full-state backup before any write, verified.** Back up the module's current coding, re-read it and compare, then keep two copies. Record the car identity, module part number and software version with it. Tests must prove restore works on recorded real data before shipping, because restore failing is documented [S16].
3. **Preflight gate.** Block the write unless all of these pass:
   - Battery voltage above a floor and steady for a set period, measured from the adapter.
   - User has confirmed a charger class (not a trickle charger) [S1].
   - Link quality checks pass (no dropped frames, stable latency).
   - Module software version has a known matching coding file [S37].
   - Vehicle order is present and sane [S20, S30].
   - No known-risk part (head units, security-paired modules) [S5, S28].
4. **Write protocol with resume and abort.** Write in small chunks, verify each, and refuse to continue if voltage or link degrades. If a write cannot complete, roll back to the saved backup before returning control.
5. **Single-module scope, small diffs.** Change only the values the user chose, nothing else [S11, S13]. Never "update the whole car".
6. **Plain "what went wrong" screen.** If a write fails: tell the user what state the module is in, what was saved, and the first safe step (power cycle per the vendors' guidance [S12, S25]), then the restore. Include the recovery ladder from section 3 in the product, with honest odds.
7. **Local flight recorder.** Log voltage, link stats, every request and response, and the outcome. This is how we get the frequency numbers nobody has. Make it exportable so users can attach it to a bug report. Opt-in for any upload.
8. **Hardware notes.** Per-adapter risk notes: BLE adapters were involved in at least one restore failure [snippet-only; S12 recommends flight mode and disconnecting other Bluetooth links]. Default to wired ENET for anything beyond simple coding.

### Avoid

- Head-unit, gateway and immobiliser/key operations in v1. These were the incidents with the worst outcomes and the least public recovery [S5, S14, S15, S28, S36].
- Anything that unlocks features on modified or retrofitted hardware [S7, S12].
- Full-vehicle programming. The factory's own process kills unrelated modules sometimes [S13].
- Promising "can't brick". BimmerCode's phrasing is defensible only with a definition; ours should say "recoverable in most cases, with these steps" and mean it.
- Offering tools to bypass OEM security. Out of scope and not needed for a failsafe pipeline.

### Measure

- Write attempts, completed, aborted, rolled back, left in a bad state (by module family and adapter).
- Voltage at start, minimum during, ripple during writes.
- Link drop events per run, by adapter type.
- Restore success rate, tested on a bench harness and in the field.
- Time from failure to recovery, by recovery step used.
- Preflight blocks (which check fired) to see which risks users actually hit.

### Test plan implications

- Fault-injection harness: cut power, drop the link, change ignition state, corrupt a response, and check that the pipeline ends in a known-good state each time.
- Replay recorded real sessions (where users consent) against the restore path.
- A "refuse list" test: every known-risk part number must be blocked.

---

## Open questions

1. What fraction of coding and flashing sessions fail, for each tool (BimmerCode, BM3, E-Sys, ISTA)? Needs vendor data or our own logs.
2. What does bootmod3 say about a DME that no longer talks? The page was cut off [S1]; ask support or find a longer source.
3. What is the real minimum safe voltage and sag for each module family? Sources give "above 12.8" or "above 13" (vendor/snippet) and "at least 12.6" [S37], which disagree and are untested.
4. Why do some failures happen with a charger attached [S3, S9, S13]? Link problem, tool bug, or module bug?
5. How well does BimmerCode's restore actually work across adapters? Only a few user reports [S16, S32].
6. What do recent secure-gateway cars (G-series onward) do on a failed write? No independent sources read.
7. How much does a dealer actually charge for a recovery session or for a revived module? Only forum quotes.
8. Do academic papers or standards describe safer update patterns (dual-bank flashing, rollback) that OEMs actually use on these modules? Not searched.
9. Legal side: warranty effect of a failed third-party coding. One forum reply says unrelated systems stay covered [S32]; no authoritative source.

---

## Source ledger

Rows are pages that were fetched and read. "S" numbers are used above. Reliability: high, med, low.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| S1 | https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/572456961/bootmod3+Flash+Failure+Troubleshooting+DME+TCU+Online+Recode | Vendor support page (partial) | Causes of flash failure, charger class (20-50 A), retry steps; page truncated before any bricked-DME section | med |
| S2 | https://www.vehicleservicepros.com/training-and-resources/guest-blogs/blog/55387934/the-great-reprogramming-uh-oh-ii-how-to-recover-from-a-severe-voltage-drop | Trade article (vendor guest blog) | Low voltage aborts programming; per-make recovery; BMW needs power removed 30 s; power supply spec | med |
| S3 | https://diag.net/discussion/sribs6zustmz7d2bcn63qpawgf | Technician forum | X5 N55 DME update crashed, no power; J2534 vs ICOM debate; bench repair advice | low |
| S4 | https://static.nhtsa.gov/odi/tsbs/2020/MC-10181234-9999.pdf | BMW service bulletin (SIB 65 16 20) | Always connect approved charger; ISTA reprograms all modules not at latest level; module failure -> IRAP recovery | high |
| S5 | https://static.nhtsa.gov/odi/tsbs/2019/MC-10163056-9999.pdf | BMW service bulletin (B65 14 19) | NBT EVO programming abort, blue screen, bootloader bug, battery reset ineffective, IRAP then ISTA | high |
| S6 | https://static.nhtsa.gov/odi/tsbs/2025/MC-11022856-0001.pdf | BMW service bulletin (SIB 65 19 25) | HU-H5 unresponsive with cluster/audio/telematics; battery reset then program; charger required | high |
| S7 | https://vehicleservicepros.com/tsbs/article/55089570/mitchell-1-correcting-bmw-programming-glitch | Trade summary of BMW bulletin | Modified HU-H2 loses FSC codes when ISTA runs measures plan; factory reissues codes | med |
| S8 | https://diag.net/discussion/schprutubewvdumn8yyq9h64az | Technician forum | Head unit replacement quote about 3,500 USD; ISTA+ and ICOM need | low |
| S9 | https://diag.net/discussion/seiynes2nynh654zlrayvyhkgm | Technician forum | DSC died after voltage drop with charger attached; used modules failed; cost figures | low |
| S10 | https://www.youcanic.com/wiki/bmw-cas-car-access-system | Diagnostic wiki | CAS failure causes (water, voltage), symptoms, new CAS needs programming | low |
| S11 | https://z4-forum.com/threads/frm-module-corrupted.142696/ | Owner forum | FRM "bricked" was default coding overwrite; 40 GBP repair mention | low |
| S12 | https://bimmercode.app/faq/ | Vendor FAQ | Backups restore after failed coding; cannot permanently brick; BDC non-response fix; blocked codings | med |
| S13 | https://diag.net/discussion/swyfyxtc04n3ogu9voziez1mem | Technician forum | Forced I-level update killed roof and A/C modules with factory kit and 100 A maintainer; about 2,500 USD | low |
| S14 | https://xoutpost.com/bmw-sav-forums/x5-e70-forum/108117-bricked-cautionary-tale-update.html | Owner forum | CAS dead after key-programming attempt with no power supply; dealer replaced; 1,082.73 USD | low |
| S15 | https://diag.net/discussion/sqxlmvitx5ez2ofljx1sdtaue8 | Technician forum | Gateway configuration erased during aftermarket-tool flash; EGS loss and scrapped car mention | low |
| S16 | https://www.insideevsforum.com/community/threads/bimmercode-help.14325 | Owner forum | MINI climate unit left broken after failed BimmerCode write; restore failed | low |
| S17 | https://www.revol.com.sg/case-studies/bmw-case-study-142-523i-battery-replacement/ | Shop case study | Weak battery gave false faults; battery registration needed. Low relevance, no coding failure | low |
| S18 | https://xoutpost.com/bmw-sav-forums/x5-e70-forum/113402-e70-frm3-flashing-problems-please-help.html?nojs=1 | Owner forum | FRM coding corrupted after battery change; flash failed at 5%; independent shop recovered; 1,500 USD dealer quote | low |
| S19 | https://nam3forum.com/forums/forum/special-interests/coding-tuning/317200-dme-is-stuck-in-program-flashing-mode | Enthusiast forum (E46 M3) | DME stuck in programming mode; write-speed cause; recovered by stock reflash | low |
| S20 | https://www.carcomplaints.com/BMW/320/2013/tsb/tsb-610413.shtml | Bulletin summary site | Replacement FEM lacks vehicle order; tool cannot read it | med |
| S21 | https://cloreautomotive.com/?p=48532 | Vendor blog (same article as S2 on vendor's site) | Same content as S2; counted as a separate page, not independent evidence | med |
| S22 | https://static.nhtsa.gov/odi/tsbs/2017/MC-10136738-9999.pdf | BMW service bulletin (B65 09 15) | NBT head unit resets intermittently or permanently; read only the situation section | high |
| S23 | https://static.nhtsa.gov/odi/tsbs/2017/MC-10136331-9999.pdf | BMW service bulletin (B09 01 17) | IRAP control unit recovery pilot; listed causes of programming failures; replacement authorised if recovery fails | high |
| S24 | https://static.nhtsa.gov/odi/tsbs/2018/MC-10143572-9999.pdf | BMW service bulletin (M09 01 18) | IRAP recovery for all models; modules can take long time to recover | high |
| S25 | https://static.nhtsa.gov/odi/tsbs/2023/MC-10244502-0001.pdf | BMW service bulletin (SIB 65 31 23) | HU-H5 and several modules not responding; 30-minute battery reset then program | high |
| S26 | https://static.nhtsa.gov/odi/tsbs/2019/MC-10163066-9999.pdf | MINI service bulletin (M65 01 19) | Same NBT EVO abort bulletin for MINI; approved charger | high |
| S27 | https://static.nhtsa.gov/odi/tsbs/2026/MC-11028927-0001.pdf | BMW service bulletin (SIB 65 27 25 rev 3) | HU-H4 to H6 resets and failed start-up; program whole vehicle; read only top section | high |
| S28 | https://static.nhtsa.gov/odi/tsbs/2019/MC-10166390-9999.pdf | BMW service bulletin (B65 14 19 rev 1) | Adds a service function to run before IRAP escalation | high |
| S29 | https://static.nhtsa.gov/odi/tsbs/2025/MC-11025841-0001.pdf | BMW service bulletin (SIB 65 27 25) | Earlier revision of S27 | high |
| S30 | https://static.nhtsa.gov/odi/tsbs/2020/MC-10171501-9999.pdf | BMW service bulletin (SIB 66 35 19) | Wrong option in vehicle order; fix by changing order and reprogramming | high |
| S31 | https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/567738370/Troubleshooting+articles | Vendor support index | Only article titles visible; no recovery text | med |
| S32 | https://www.insideevsforum.com/community/threads/bimmercode-help.14325/page-2 | Owner forum | BimmerCode developer fixed MINI climate unit remotely with ENET and developer tool | low |
| S33 | https://diag.net/discussion/sxeufjpdzutlgq5rhr7i8vxo30 | Technician forum | DME/CAS data mismatch fault; vehicle order stored in several modules; unconfirmed fixes | low |
| S34 | https://diag.net/discussion/si5tyt5lkzq9il6jaty6udkhuz | Technician forum | CAS sent for repair avoided re-pairing; weak battery can drop out CAS | low |
| S35 | https://forum.hptuners.com/showthread.php?p=232180 | Tuning forum (Ford, other brand) | Interrupted PCM write; recovered with older tool beta; battery theory unproven; no built-in safeguards | low |
| S36 | https://diag.net/discussion/sxuxwygpno2bkukigkbgvj8szf | Technician forum | Repeated key-learning drained battery; pairing data lost; unsolved | low |
| S37 | https://vxdiagshop.blogspot.com/2025/06/how-to-solve-bmw-e-sys-failed-to-get.html | Reseller blog | Software/coding file mismatch on used module; flash right software first; keep voltage at least 12.6 V | low |

### Snippet-only items (search result text, page not opened, not counted)

- RPM Motorsport sells a front-electronics-module revival service at 799 USD (page returned HTTP 429). Low.
- Autel/OBDExpress blog says "Smart Mode" does not back up full memory on FEM/BDC (certificate error on fetch). Low, vendor.
- Supra MKV thread: BimmerCode restore failed at 100 percent; fixed by adapter firmware and app updates (HTTP 403). Low.
- Search summaries of 5series.net and xoutpost threads quoting 7,500 USD mechatronic and 3,800 USD uncodable-module cases. Low.
- A vendor blog claiming CAS can be bricked below about 12.8 V (certificate error on fetch). Low, vendor claim.

### Pages that failed to load

HTTP 403: supramkv.com threads, g42/f44 bimmerpost pages, spoolstreet, diag.net (one thread), 5series.net print page, justanswer, bimmerforums, zhpmafia. Other failures: certificate errors (obdexpress, obdii365), connection refused (romraider, autorepairshq), HTTP 429 (rpmmotorsport), empty page (missiontuning), HTTP 404 (f44 archive), one result unreadable through the redlib mirror, and two fetches rejected by the summariser. Nothing from those pages was used except where marked snippet-only.
