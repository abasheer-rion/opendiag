# UX teardown of car-coding apps, and safe-action patterns for OpenDiag

Research run: 2026-11-20. Status: **PARTIAL** (see "Limits of this run" and "Gaps").
Clean-room note: everything below comes from public vendor pages, store listings, public support articles, public government bulletins and public docs of other domains. No leaked or pirated OEM files were opened. The unofficial ISTA manual copies that search surfaced were deliberately not read.

---

## Executive summary

1. **The best incumbent, BimmerCode, is already safety-minded.** It backs up automatically, offers restore from a list, flags broken units with a red dot, hides "expert" options on safety units, and refuses to code in named bad states (error codes BCE-006, 009, 010, 011, 012) [S1, S2]. OpenDiag should match this floor, then go beyond it.
2. **The weak spots are recovery and honesty.** Forum threads show restores that stall or fail, and a claimed OBDeleven gap (no one-step "restore to original", as of 2023) rests on forum snippets only and is UNVERIFIED (the cited thread failed to load on re-check) [S9, S16]. Nobody shows the user a before/after diff of what will change. That is OpenDiag's opening.
3. **Two UX philosophies exist.** Coding apps hide risk behind "one tap" (OBDeleven One-Click Apps, Carly). BimmerCode shows raw options and warns. Generic scanners (Car Scanner, Torque-style, OBD Fusion) are dashboard-first and read-only by nature [S3-S8].
4. **Pricing and paywalls are part of the UX.** Credits, tiers and subscriptions appear inside the flow in OBDeleven and Carly, and reviewers complain [S5, S6]. OpenDiag has none, so it can spend that screen space on safety information.
5. **From other fields, five patterns carry over cleanly:** plan-then-apply with a saved plan (Terraform) [S11], diff before change (kubectl) [S13], compare-and-swap on push (`--force-with-lease`) [S12], test-boot-then-confirm with auto revert (MCUboot, Android A/B) [S18, S19], and hard/soft limits (infusion pumps) [S20].
6. **Typed confirmation works, but only for rare, severe actions.** GitHub and AWS use it for deletes [S10, S14]. NN/g says over-use trains people to click through [S21]. Raskin's rule: prefer undo over warnings [S22].
7. **OpenDiag's own rules already push the right way.** Bench-only writes and mandatory verified backup (owner decisions 2 and 6) mean the "dangerous action" UI can be built and tested without a real car at risk.
8. **Recommended core loop for any write:** Preflight, Snapshot (verified), Diff, Dry run, Typed confirm (bench only), Apply with a live status, Verify by reading back, Keep an undo and an audit entry. Details and do / do-not lists are in sections 6 and 7.
9. **Biggest unknowns:** nothing here was tested on a user. No usability study of any of these apps was found. All screen descriptions are from text listings, not from running the apps.

---

## Limits of this run (read first)

- Search and fetch both worked, but many pages came back thin, blocked or as text-only summaries. A summarising model sat between me and each page, so exact UI wording is secondhand.
- I could **not** run or screenshot any of the apps. Screen layouts below are inferred from descriptions. Where I say "shows", it means the source text says so.
- Blocked or empty: OBDeleven main site (403), the OBDeleven history page (403), Torque Pro Play Store page (empty), OBDLink software page (little detail), a supramkv.com restore thread (403, so only the search snippet), PMC infusion-pump paper (bot check), FDA human-factors guidance (overview only), fwupd docs (403 / 404), Google SRE page worked. Reddit and Bimmerpost threads were reached only as search snippets.
- BMW's own ISTA screens: only indirect evidence (public NHTSA/trade-press service bulletins and a trade article). No official ISTA documentation was read.
- Prices and ratings drift. Treat them as of 2026-11-20 and per-store.

---

## 1. Scope and how to read the tables

Confidence tags: **high** = read on an official or primary page and consistent; **medium** = single secondary source or a search snippet; **low** = inference or memory.

Existing docs already cover the market, pricing and reviews [obd-app-market-and-reviews, bmw-coding-failures-and-recovery, bmw-ista-real-world-usage]. This doc does not repeat them. It looks at **screens, flows and wording**, and then at **safety patterns from other fields**.

---

## 2. App-by-app teardown

### 2.1 BimmerCode (SG Software) - closest peer, BMW/MINI/Supra coding

| Area | What the sources show | Conf. |
|---|---|---|
| Platforms | iOS, Android, Windows 10+, macOS 12+ (Intel and Apple chips) [S1b] | high |
| Price (store) | Free download; Full Version in-app purchase. Listing figures differ by store and date: $49.99 (US page) and $69.99 (CA page) were both returned [S1c, S1d]. Treat as unsettled | medium |
| Rating | 4.6-4.7 on iOS from roughly 2,000 (CA) to 22,000 (US) ratings, depending on store [S1c, S1d] | medium |
| Information architecture | Flat and linear: start screen (adapter type + vehicle) -> connect -> list of control units -> one unit -> option list -> Code. Separate app (BimmerLink) for faults and live data [S1, S1a] | high |
| Onboarding | Heavy, document-based. A long "Quick Start Guide" lists preconditions before the first connect [S1] | high |
| Connection flow | See 2.1.1 | high |
| Module list | Appears after the car is identified. Units with invalid coding data show a **red dot** [S1] | high |
| Fault list | Not in this app. It says it is "only for coding" and points users to BimmerLink for fault read-outs [S1a] | medium |
| Live data | Not in this app (BimmerLink) | medium |
| Coding screen | Basic mode: pick unit, change listed options, tap **Code**; app reports success or failure. Expert mode: toggle per unit, edit raw values, tap Code [S1] | high |
| Backup | Created the first time a unit is read (on iOS, each time). Stored in-app, visible in the iOS Files app; Android has in-app import/export; Desktop uses a folder reachable from settings. Deleting the app deletes backups, so export first [S1] | high |
| Restore | iOS: connect, select unit, Backups, pick one, Done, Start coding. Android/Desktop: select unit, top-right icon, Recovery. To undo everything on iOS, pick the **oldest** backup at the bottom of the list (list is newest first) [S1] | high |
| Error messaging | Numbered "BCE-0xx" codes in the FAQ for blocked states; generic "coding failed" otherwise; FAQ gives a recovery routine (unplug adapter, restart phone, flight mode, disconnect Bluetooth devices, retry, restore) [S1, S2] | high |
| Refusals | Blocks coding when: footwell module boot sector looks corrupted (BCE-006), head unit not original (BCE-009), NBT EVO head unit with critical i-level (BCE-010), head unit with under 4 GB RAM (BCE-011), stored A/C pressure error (BCE-012). Expert mode withheld from safety-related units [S2] | high |
| Claims | FAQ says a control unit cannot be bricked, and that after an interruption or error the coding can be restored from a backup. The same FAQ warns that wrong use of expert mode can cause problems that need a reflash [S2]. These are vendor claims. Forum evidence below (snippets only) suggests restores can still fail | medium |

#### 2.1.1 Connection flow, as documented

1. Car: ignition on (G-series also needs a diagnostic mode), engine off, parked, brake set, loads off, third-party CAN hardware removed, head unit stock [S1].
2. Phone: close other OBD apps, airplane mode on, switch only the radio you need, disable CarPlay, disconnect the phone from iDrive [S1].
3. App: confirm adapter type in settings, tap Connect, grant Bluetooth / local network / USB permissions [S1].
4. If it fails: check adapter LEDs, adapter and car support, restart both, for ENET lock the car and wait 15 min or reset the battery [S1].
5. Vehicle chosen from a list **before** connecting [S1]. The adapters page only says not every adapter works with every supported vehicle [S1e]. That an unlisted adapter will not connect at all is UNVERIFIED (not found on the fetched pages).

**Observations (my analysis, not sourced facts):**

- The preflight lives in a document, not on a screen. A user can skip it. Several steps (airplane mode, CarPlay) are things the app could check or at least show as a checklist.
- Refusal reasons are good but are codes, which means users search the FAQ. Showing the cause in the app is the obvious improvement.
- The oldest-backup-is-at-the-bottom rule for "undo everything" is a convention the user must know.

#### 2.1.2 What reviewers say

- Positive: wide range of options (lighting, drive modes, reminders, comfort access), value, no subscription [S1d].
- Negative: expert mode is not fully translated (German terms remain); one reviewer reported rear brake lights disabled after a body-module change until reverted; one said a warning message stayed on screen after a change [S1d]. Single reviews, so low weight individually.
- Forum anecdotes (search snippets, medium-low): a restore bar reaching 100% and then failing, fixed after resetting and updating the adapter and reinstalling the app; a cluster restore looping back to the connect menu until an app update; "coding data invalid" followed by "restoring failed" with no visible fix; navigation still broken after a restore in one Supra case [S9].

### 2.2 BimmerLink (same developer) - faults, live data, service functions

| Area | What the sources show | Conf. |
|---|---|---|
| Positioning | The diagnostics counterpart to BimmerCode [S3b] | high |
| Features | Read/clear fault codes per control unit; live data on a customisable dashboard; CSV logging; battery registration; parking-brake service mode; service-interval reset; lighting short-circuit-lock reset; exhaust flap and sound-mute controls; DPF status/regeneration; CarPlay add-on; ZF 8HP adaptation values (read) [S3] | high |
| Price | Free download; Full Version $49.99 and CarPlay add-on $12.99 on the CA page; other stores differ [S3] | medium |
| Rating | 4.7 from 931 ratings on the CA page [S3] | medium |
| Language | 13 languages listed, yet reviewers in other storefronts say the UI is mainly German or untranslated for them [S3, S3b] | medium |
| Pain points (reviews) | Parking-brake service mode not confirmed on screen; some exhaust flap functions cannot stay open; mixed results clearing faults; frequent prompts to rate the app [S3, S3b] | medium-low |

**Observations:** "Action done" confirmation is cited as missing for a physical, safety-adjacent action (the parking brake motor). Any service function that moves hardware needs an explicit "this will move X" notice and a visible "it worked / it did not" result.

### 2.3 OBDeleven - one-click apps, credits, history

| Area | What the sources show | Conf. |
|---|---|---|
| Flow | Plug adapter, create an account, connect. Full scan of all control units on supported brands (VAG, BMW/MINI, Toyota/Lexus, some Ford US, Mercedes) [S4] | high |
| Adapters | OBDeleven 3 hardware gets full function; generic ELM327 gets basic diagnostics only [S4] | high |
| Information architecture | Vehicle -> Control Units list -> per-unit functions; plus "One-Click Apps" (pre-built changes), live data with presets and chosen metrics, trip tracker, car health report exportable as PDF or link [S4] | high |
| One-Click Apps | Ready-made changes for supported brands. Paid with credits or covered by higher plans (PRO $69.99, ULTIMATE $239.99, credit packs $3.99 for 10, $29.99 for 100 on the US page) [S4] | high |
| Backup | App creates a backup before applying a change, per OBDeleven's support article. Backups sit in the vehicle history [S5, S5a] | medium-high |
| Failure state | A red **"Needs Restore"** label appears next to a unit after a failed or interrupted one-click activation. Tapping the unit opens a popup saying it lost coding data, with a Restore button that returns the unit to its previous working state (the article does not say which backup is used). The article names the user-visible symptoms (e.g. navigation, hands-free calling, media on a flagged multimedia unit) [S5] | high |
| History | Per-unit history lists change types: gateway coding, coding, long coding, adaptation, basic settings, coding II, diagnostic session, app, backup, fault, full scan; filter by period and type, toggle archived. Needs a logged-in account and an internet connection (history is stored in OBDeleven's system); viewable without a car connected [S5b] | high |
| Restore gap | UNVERIFIED. Forum snippets (not re-confirmed; the S16 thread returned an error page on re-check) suggested no one-step "restore the initial car backup" as of 2023, with a manual copy-paste of the long coding value [S5a, S16] | low |
| Reviews | Trustpilot: some one-click apps unavailable for specific models or needing extra credits; support and refund complaints; one reviewer says newer VAG security blocked paid features on 2024+ cars [S6] | medium |

**Observations:**

- "Needs Restore" is the best-named failure state found. It tells the user what is wrong and what to press. OpenDiag should copy the idea (plain label on the module row), not the name.
- Account login to see history is a trust and offline problem. OpenDiag's history should be local files.
- Credits inside the flow turn a safety moment into a purchase moment. Avoid mixing the two.

### 2.4 Carly - "one app for all brands", subscription

| Area | What the sources show | Conf. |
|---|---|---|
| Positioning | Diagnostics, coding of hidden settings, used-car check (mileage manipulation), repair guides, service reset, battery check [S7] | high |
| Free tier | Basic diagnostics, live data, emissions check [S7, S7a] | high |
| Paid | Yearly subscription per brand or bundle, from about $22 (Toyota) up to about $119 (All Brands + Smart Mechanic) on the US listing [S7] | medium |
| Recent change | All brands merged into one app; dashboard redesigned (listing dated 3 Nov) [S7] | high |
| Backup | Listing does not mention it. Two third-party articles say a backup is made automatically before coding. Carly's own documentation was not found [S7a] | low-medium |
| Warnings | A reviewer criticised how health-status warnings are explained (recurring vs random issues). A review warns coding may affect warranty [S7a] | low |
| Model dependence | Which features appear depends on brand, model, year, hardware [S7a] | medium |

**Observation:** the store listing sells outcomes ("see how serious each problem is"). That severity framing is useful for fault lists, but it needs a source of truth; a made-up severity score would be worse than none.

### 2.5 Car Scanner ELM OBD2 - free generic scanner with a few coding pages

| Area | What the sources show | Conf. |
|---|---|---|
| Features | Fault codes with a large description database, Mode 06 self-test results, live data (including an all-sensors-on-one-screen view), freeze frame, readiness, trip computer, acceleration timer [S8] | high |
| Dashboards | User builds a layout of gauges and charts; HUD mode projects onto the windshield; items can be renamed (recent update) [S8, S8a] | high |
| Profiles | Ships with make-specific connection profiles (e.g. BMW, VW, Toyota, GM, Nissan, Hyundai, Kia) [S8a] | medium |
| Coding | "Encoding functions" for some VAG platforms only. No backup mentioned [S8] | medium |
| Price | Free with ads; Pro as one-time ($7.99) or subscription tiers on the US page [S8] | medium |
| Rating | 4.8 from about 33K ratings (iOS) [S8] | medium |
| Adapters | Needs Wi-Fi or BLE ELM327-compatible adapter on iOS [S8a] | medium |

**Observation:** the winning idea is the **user-built dashboard** and the single all-sensors screen. Both are read-only and low-risk, and they explain the rating. Connection-wizard details were not found.

### 2.6 Torque (and the OBD Fusion / OBDLink family)

| App | What the sources show | Conf. |
|---|---|---|
| Torque | Wiki describes an Android tool with fault codes, dashboards, themes, scripts, plugins and a Track Recorder plugin [existing doc, L35]. The Play Store page returned no content this run, so no fresh UI detail | low |
| OBD Fusion | Custom dashboard pages with resizable gauges, copy/paste between dashboards, HUD; multi-signal graphs; CSV logging, record and playback, GPS trips; freeze frame, VIN, calibration ID, Modes 05/06/09; 250+ PIDs and user-defined PIDs; iCloud/Dropbox sync; CarPlay shows a list, not live gauges; paid enhanced-diagnostics add-ons at $14.99 each for specific Toyota and Ford years that unlock ABS/SRS module reads and clears. $9.99, 4.7 from about 20K ratings; reviewers praise setup ease and gauge customisation and mention Bluetooth reconnection issues and lost vehicle profiles [S23] | high / medium |
| OBDLink app | Works only with OBDLink-branded adapters (MX+, CX, MX WiFi) per the store listing. Reviews: pairing quick for some, confusing for others (conflicting instruction about the Connect button); "clean but a bit overwhelming"; enhanced diagnostics free on MX+ and paid for others; one reviewer says older MX WiFi support was dropped on iPhone; Honda and Hyundai/Kia enhanced reads reported broken and then fixed in a 2025 update [S24] | medium |

**Observations:**

- "Lost vehicle profiles" and "Bluetooth reconnection" are the generic-scanner equivalent of a bad restore: the app forgets what it knew. Saving profiles as exportable files avoids this.
- Contradictory pairing instructions (do/do not press Connect) show why pairing needs one screen with state, not a doc.

### 2.7 ISTA (BMW's own tool) - evidence is indirect

| Area | What the sources show | Conf. |
|---|---|---|
| Main areas | Vehicle identification and management, information research, guided troubleshooting, software repair, programming. Fault memory display and vehicle test are separate topics (index of a user guide cited in search results; page text not read) [S25] | low-medium |
| Identification | A public NHTSA service bulletin describes entering the VIN (last seven digits) to reach test modules that do not need the car, versus "read out vehicle data" for ones that do [S25a] | medium |
| Control-module tree | Modules shown in a tree with colours. A module that did not answer is **yellow** and gets an "S0001 No communication possible" entry; a module that passes the ECU test turns **green** [S26]. A grey state is not in the source (UNVERIFIED) | high (yellow/green) |
| Fault memory | Fault memory screen has a "quick delete". Bulletin says quick delete may clear the codes only briefly, calls this an ISTA error, and says the fix is Vehicle test, select the yellow module, ECU functions, ECU test until "ECU responding" and the module turns **green**. It states ISTA/D 2.19.0 will correct this, so current versions may behave differently [S26] | high |
| Guided troubleshooting | Reads fault memory, then generates a test plan (e.g. power-supply checks for non-responding modules) to work through [S26] | medium |
| Known issues | Per existing research: German screens, size, Windows, rental cost [bmw-ista-real-world-usage]. Not re-verified here | medium |

**Observations:**

- The tree-with-colours (yellow / green in the source) and "run test until green" loop is a good mental model for health. The 2018 bulletin describes quick delete failing to keep these no-communication entries cleared and says a later version fixes it, so treat it as a historic trap, not current behaviour. Lesson: a "clear" button must say what it did and did not clear.
- ISTA's test plans are the "why" that consumer apps skip. OpenDiag's plain-words faults should link to a next step, not just a description.

---

## 3. Cross-app comparison by screen

| Screen | BimmerCode | BimmerLink | OBDeleven | Carly | Car Scanner | OBD Fusion / OBDLink | ISTA |
|---|---|---|---|---|---|---|---|
| Connect | Pick adapter type and vehicle first, then Connect | Same family | Account, adapter, connect | Adapter sold separately, account | Pick adapter, profile | Pairing screen; known confusion | Cable/ICOM, VIN |
| Preflight checklist in-app | No (document) | No (document) | Not found | Not found | Not found | Not found | Voltage etc. per BMW bulletins (not read here) |
| Module list | Yes, red dot on bad data | Yes | Yes, "Needs Restore" label | Yes | Not core | Enhanced add-ons only | Tree with colours |
| Fault list | No (other app) | Yes | Yes | Yes with severity framing | Yes, large text DB | Yes | Yes + test plan |
| Live data | No | Customisable dashboard | Live data with presets | Yes | Custom dashboard, HUD | Custom dashboards | Some |
| Coding | Basic and expert | No (service functions) | One-click apps + manual | Coding by brand | Few VAG pages | No | Programming (out of scope) |
| Pre-change diff shown | No | n/a | Not found | Not found | Not found | n/a | Not found |
| Auto backup | Yes | n/a | Yes (before app) | Third-party claim only | Not found | n/a | n/a |
| Restore UX | List, pick, confirm | n/a | "Needs Restore" popup; manual route for older backups | Not found | Not found | n/a | n/a |
| Change history | Backup list only | n/a | Per-unit history (login) | Not found | Not found | Trip logs | Not found |
| Error wording | BCE codes + FAQ | Mixed; some actions unconfirmed | Plain label + popup | Criticised | Not found | Pairing contradictions | S-codes |
| Money in the flow | One-time unlock | One-time unlock | Credits and tiers | Subscriptions | Pro unlock + ads | Add-ons | Rental/licence |

Cells marked "Not found" mean I could not find it, not that it does not exist.

---

## 4. Information architecture patterns worth keeping

1. **Vehicle first, then modules, then one module at a time.** Every app does this [S1, S4, S26]. It matches how the car is built.
2. **Faults and coding in different places.** BimmerCode and BimmerLink split into two apps. A single OpenDiag app can keep two *modes*: a read side (always safe) and a change side (gated). Keep different colours and a persistent mode indicator.
3. **Dashboards are user-owned files.** Car Scanner and OBD Fusion make dashboards copyable and renamable [S8, S23]. Loss of profiles is a named complaint [S23].
4. **A module row is the main status object.** It can show: name, address, fault count, coding state (verified / unknown / invalid), and last backup. The red dot (BimmerCode) and "Needs Restore" (OBDeleven) are early forms of this [S1, S5].
5. **Severity is a second axis, not a replacement for a code.** Carly frames severity [S7]; ISTA frames by test plan [S26]. OpenDiag should show the raw code too, and mark severity "from vendor data" or "unknown" when it has no source (`data-strategy` already warns fault text has no clean public source).

---

## 5. Onboarding and connection: what works, what fails

| Finding | Evidence | Conf. | Implication |
|---|---|---|---|
| Documents carry the preflight | BimmerCode quick start lists about ten conditions [S1] | high | Put them on a checklist screen that blocks nothing but records answers |
| Wrong radio state is a top failure cause | Airplane mode, CarPlay, other OBD apps listed as things to close [S1] | high | Detect what the OS lets us detect (BLE state, Wi-Fi SSID) and say what is wrong |
| Adapter allow-lists | BimmerCode's adapters page says not every adapter works with every supported vehicle and gives no reason; an outright refusal of unlisted adapters is UNVERIFIED [S1e] | medium (compatibility varies), none (why) | Explain refusals with a capability report, not a bare "unsupported" |
| Pairing instructions contradict | OBDLink reviewer found conflicting guidance on the Connect button [S24] | medium | One guided pairing screen with live state |
| Reconnect loses state | Reviewers of OBD Fusion mention BT reconnection issues and lost profiles [S23] | medium | Persist connection and vehicle profile as local files |
| Preflight reality check | Official BMW service bulletins name low battery voltage as a flash/program risk (existing docs) [bmw-coding-failures-and-recovery] | medium | Show live voltage before any write and refuse below a threshold |
| Language gaps | Expert mode and some BimmerLink screens not fully translated; reviewers cite German [S1d, S3b] | medium | Option names need translation keys from day one; never ship raw German as the only text |

---

## 6. Safe-action patterns from other domains

For each pattern: what it is, source, what it means for OpenDiag.

### 6.1 Diff and plan before apply

| Source | What it does | Confidence |
|---|---|---|
| Terraform `plan` [S11] | Shows what would change without changing anything. A saved plan file can be applied later, but the page says the world can change between plan and apply, so review the final plan. Saved plans can hold sensitive data in cleartext | high |
| `kubectl diff` [S13] | Compares local manifest to the live object, prints a unified diff, exit code 0 no change / 1 differences / above 1 failure; secrets masked by default | high |
| Git push `--dry-run` [S12] | Does everything except send the update | high |
| AWS CLI `--dry-run` [S15] | Checks permissions only; replies with `DryRunOperation` if allowed | high |

**For OpenDiag:** a coding change should show a **byte-level and option-level diff** against the *verified snapshot*, and re-read the module right before applying. If the live value no longer matches the snapshot the diff was built from, abort (same idea as the Terraform plan staleness warning). Dry run must be genuinely dry in code: the write path should not even be reachable.

### 6.2 Compare-and-swap ("lease") on a shared resource

Git's `--force-with-lease` only overwrites if the remote still has the value you last saw; plain `--force` does not check [S12]. The docs also warn a background fetch can silently defeat the lease, and offer `--force-if-includes` as a second check [S12].

**For OpenDiag:** every write carries the **expected current value** (hash of the coding data read in this session). The module rejects or the app aborts if it differs. Beware the equivalent of the "background fetch" trap: a stale cache of module state must never serve as the expected value. Re-read.

### 6.3 Typed confirmation

| Source | Behaviour | Conf. |
|---|---|---|
| GitHub repository deletion [S10] | **Type the repository name** to verify the right repo; eligible repos restorable for up to 90 days (page defers eligibility to another guide). "Danger-zone entry / acknowledge consequences" not re-confirmed | high |
| AWS S3 empty bucket [S14] | Type the bucket name; page states the action cannot be undone | high |
| NN/g [S21] | Reserve typed-word steps for the most dangerous, rare actions or they become habit; use outcome-named buttons; no default is best. The article quotes Don Norman suggesting a different user confirm the most dangerous actions. "Name the specific item" was not confirmed in the re-check (UNVERIFIED) | high |

**For OpenDiag:** the typed string should be something that *proves the user read the target*, e.g. the module name plus the last 4 of the VIN, not the word "CONFIRM". Use it only for bench writes and restores. Routine actions (clear faults) get a plain outcome-named button, not typing.

### 6.4 Undo beats warnings

Raskin's essay argues that people habituate to confirmation dialogs and click through, so the design should allow undo instead. It also says even typed-confirmation warnings stop working for long, which cuts against heavy reliance on typing [S22]. Commenters raised limits: shared data, how many steps, privacy of stored deleted data [S22]. NN/g also lists undo and temporary backups as the first alternative to confirmation [S21]. Git's reflog keeps old branch tips (default 90 days reachable, 30 days unreachable) so mistakes are recoverable; it is local only [S17].

**For OpenDiag:** "undo" for a module is *restore from the verified snapshot taken before the change*. Say plainly that undo is a second write and has its own risk (BimmerCode restores have failed in the wild [S9]). Keep the snapshot until the user deletes it; never auto-expire coding backups the way reflog expires.

### 6.5 Hard limits and soft limits

Smart infusion pumps use a drug library: a **hard limit** blocks entry outside the allowed range, a **soft limit** warns and can be overridden with a deliberate confirmation [S20]. A study cited in search results found alerts were frequently overridden, and ISMP guidance (read only second-hand) warns that excessive limits reduce the value of alerts [S20]. The original paper could not be read (bot check).

**For OpenDiag:** classify every write target into three classes and keep the lists in data, not in code:

| Class | Example | Behaviour |
|---|---|---|
| Hard block | Safety-related modules (airbag, braking, steering), modules with invalid or unverifiable coding, unknown module | No override. Same as BimmerCode withholding expert mode on safety units [S2] |
| Soft block | Head unit not stock, low voltage, unrecognised option | Override only with typed confirm plus an audit entry |
| Free | Reading, snapshot, diff, dry run | No prompts |

Keep the soft list short. If everything is a soft warning, people click through.

### 6.6 Staged apply with auto revert (firmware world)

| Source | Mechanism | Conf. |
|---|---|---|
| MCUboot [S18] | "Test" swap boots the new image provisionally; if it does not confirm itself, the next reset swaps the old image back. A "permanent" swap skips this. Swaps are power-fail safe with progress records | high |
| Android A/B updates [S19] | Write to the unused slot; running system is never modified; new slot marked good only after boot and checks; falls back after several failed boots | high |

**For OpenDiag:** a car module has no second slot, so we cannot copy the mechanism. We can copy the **shape**: (1) write, (2) *read back and compare* before saying done, (3) run a post-write health check (module answers, no new faults), (4) if any step fails, offer one-tap restore of the snapshot, and (5) keep the "provisional" state visible until the user closes the session. Never call it "confirmed" until the read-back matches.

### 6.7 Staged rollout and canaries

Google's SRE workbook: expose a small slice first, compare canary to control, keep one canary at a time, pause or roll back on divergence, and prefer small self-contained releases [S27].

**For OpenDiag, applied to data and code, not to cars:** ship new option definitions (the catalog) as **staged data packs**: first to the maintainer's own bench module, then to opted-in testers, then to everyone. A pack that has not been bench-verified is marked unverified in the UI and cannot enable writes. This fits owner decisions 2 and 6 (bench-only; writes compiled out until a safety reviewer signs off).

### 6.8 Audit log

The sources read here do not give a specific audit-log design to cite, other than that ISTA-like tools and OBDeleven keep history lists of change types [S5b]. I found no authoritative paper on audit logs in the time available (see Gaps). What follows is my own design proposal, labelled as such.

**Proposed minimum entry (design proposal, not sourced):** time, tool version, adapter ID, vehicle ID (hashed VIN by default), module, battery voltage at start, snapshot hash before, snapshot hash after, option-level diff, user action (who clicked what, including override type), result, and read-back match yes/no. Store as an append-only local file the user can export. Never include secrets.

### 6.9 Error messages

NN/g: explicit, human-readable, polite, precise, constructive; placed next to the problem; avoid bare codes; make recovery one step where possible [S21b, S28].

**For OpenDiag:** every error has three parts: what happened (plain words), what state the module is in now (known-good / unknown / needs restore), and the single next action. A code may appear as a small reference, never as the message.

### 6.10 Medical-device human factors

The FDA page covers human-factors and usability engineering for devices to reduce use errors and harm, but the page text I could read was only the overview [S29]. I could not verify details such as critical-task analysis from it. I do not cite more than that.

Lesson I can support: the infusion-pump hard/soft limit idea [S20] is the closest evidence-backed pattern from that field.

---

## 7. Do and do-not patterns for OpenDiag

### 7.1 Do

| # | Pattern | Why (source) |
|---|---|---|
| D1 | **Preflight screen with live checks**: battery voltage, adapter link quality, ignition state, radio/CarPlay state. Record answers in the log | BimmerCode puts these in a document [S1]; BMW bulletins call out low voltage |
| D2 | **Snapshot before any write: read twice, hash, compare, store locally**; refuse to continue if the two reads differ | Owner decision 2; BimmerCode/OBDeleven auto-backup [S1, S5] |
| D3 | **Diff screen** showing option names and raw bytes, old vs new, with module and chassis | Terraform/kubectl pattern [S11, S13]; no teardown app showed one |
| D4 | **Expected-value check at write time** (re-read, compare to snapshot hash) | `--force-with-lease` [S12] |
| D5 | **Real dry run**: the code path must stop before the transport send | AWS and git dry-run [S12, S15] |
| D6 | **Three-class limit lists** (hard block / soft block / free), stored as data | Infusion pumps [S20]; BimmerCode safety-unit rule [S2] |
| D7 | **Typed confirmation containing the target** (module + short VIN tail), for bench writes and restores only | GitHub, AWS [S10, S14]; NN/g on rarity [S21] |
| D8 | **Outcome-named buttons**: "Write 3 options to FEM" and "Keep current coding"; no default highlight | NN/g [S21] |
| D9 | **Read-back verification** and a visible three-state result: verified / written but unverified / failed | MCUboot confirm step [S18]; BimmerLink complaint about unconfirmed actions [S3b] |
| D10 | **One-tap restore from the pre-change snapshot** with the same diff screen shown in reverse | OBDeleven "Needs Restore" [S5]; Raskin undo rule [S22] |
| D11 | **Plain module-row status**: coding verified / unverified / invalid, last snapshot time, fault count | BimmerCode red dot [S1]; ISTA colour tree [S26] |
| D12 | **Say what "clear faults" did and did not clear** | ISTA S-code behaviour [S26] |
| D13 | **Local, exportable history**, no login | OBDeleven history needs an account [S5b]; BimmerCode backups lost on uninstall [S1] |
| D14 | **Explain refusals** in the app with cause and next step | BimmerCode BCE codes live in the FAQ [S2] |
| D15 | **Adapter capability report** instead of a bare allow-list | BimmerCode's adapters page says compatibility varies by vehicle and gives no reason [S1e] |
| D16 | **Read-only first run**: new users and new vehicles start with scan, faults, live data and snapshot only | OpenDiag direction (read, verify, explain) |
| D17 | **User-owned dashboards and profiles as files** | Car Scanner/OBD Fusion praise and profile-loss complaints [S8, S23] |
| D18 | **Translate option names via keys**; fall back to the raw name plus a plain gloss, never raw German alone | Review complaints [S1d, S3b] |
| D19 | **Mode indicator**: persistent colour/banner for "Read only" vs "Bench write enabled" | Own design; supported by the read/code split in the BMW apps [S1a] |
| D20 | **Staged data packs**: unverified catalog entries cannot enable writes | SRE canary [S27] |

### 7.2 Do not

| # | Anti-pattern | Evidence |
|---|---|---|
| X1 | Do not use "Are you sure?" for routine actions | NN/g: trains click-through [S21]; Raskin [S22] |
| X2 | Do not make typed confirmation the default for everything | NN/g [S21] |
| X3 | Do not preselect the destructive button | NN/g [S21] |
| X4 | Do not claim "cannot brick" or "safe" | BimmerCode FAQ makes that claim (while also warning expert mode may need a reflash) [S2]; forum snippets report restores failing [S9]. We have no failure-rate data, so avoid promises |
| X5 | Do not put credits, tiers or upsells inside a write flow | OBDeleven credits in the flow draw complaints [S6] |
| X6 | Do not hide the backup location | Backups vanish with the app on uninstall [S1] |
| X7 | Do not expire coding snapshots automatically | Git reflog expiry is fine for code [S17]; a coding snapshot is the only way back |
| X8 | Do not require an account to see your own history | OBDeleven [S5b] |
| X9 | Do not show only a code | BCE codes, S-codes: users must search [S2, S26] |
| X10 | Do not let an action with physical effect finish silently | BimmerLink parking-brake complaint [S3b] |
| X11 | Do not build a severity score without a source | Carly framing [S7]; fault text data has no clean public source |
| X12 | Do not offer an "expert mode" without a typed gate and a hard-block list | BimmerCode withholds it on safety units [S2] |
| X13 | Do not apply a stale diff | Terraform plan-to-apply warning [S11] |
| X14 | Do not give contradictory pairing text | OBDLink reviewer [S24] |
| X15 | Do not auto-update catalog data into a write-capable state without bench verification | SRE staged rollout [S27] |
| X16 | Do not let a soft block become wallpaper | Alert-override evidence from infusion pumps [S20] |
| X17 | Do not put secrets or full VINs in logs or exports by default | Devbox rules; Terraform saved plans hold sensitive data in clear text [S11] |
| X18 | Do not ship real-car writes in the 12-week window | Owner decision 2 |

---

## 8. Proposed write flow for OpenDiag (design proposal, unsourced as a whole)

Bench-only, behind the compile-time gate (owner decision 6). Each step maps to patterns above.

| Step | Screen / action | Blocks if | Pattern |
|---|---|---|---|
| 0 | Mode banner: "Read only" by default | n/a | D19 |
| 1 | Preflight: voltage, link quality, ignition, adapter capability report | any red | D1, D15 |
| 2 | Identify module; look up in limit lists | hard-block class | D6 |
| 3 | Snapshot: read twice, hash, compare, save locally | reads differ | D2 |
| 4 | Choose options (names, plain gloss, source of each name) | unknown option | D18 |
| 5 | Diff screen (old vs new, bytes and options) and **dry run** | none | D3, D5 |
| 6 | Re-read and compare to snapshot hash | mismatch | D4, X13 |
| 7 | Typed confirm: module + short VIN tail (or bench ID) | typo | D7, D8 |
| 8 | Write with live status, cancel visible only where cancel is safe | link drop, voltage drop | D9 |
| 9 | Read-back and compare, post-write health check | mismatch | D9 |
| 10 | Result: verified / unverified / failed, with one-tap restore | n/a | D10 |
| 11 | Audit entry written; snapshot kept | n/a | 6.8 |

Open design questions: where "cancel" is truly safe mid-write is not established in any source I read. That needs bench testing and the safety reviewer.

---

## 9. Implications for the UI library and look-and-feel work

(Brief, because the next task is the UI library decision.)

- Components needed beyond a stock kit: **diff viewer** (option and byte), **module row** with status chips, **stepper** for the write flow, **typed-confirm dialog**, **live status panel** with voltage and link quality, **history timeline**, **dashboard canvas** with user-built gauges.
- Colour semantics should not rely on colour alone (red/yellow/green is used by ISTA [S26]); pair with icons and text.
- A persistent read-only/write-enabled banner is cheap and works with any library.
- Everything above must run on phone and desktop. BimmerCode ships on four platforms [S1b].

---

## 10. Gaps (what could not be established)

1. **No screens were seen.** I could not capture screenshots or run any app. All layout claims are from text.
2. **Torque Pro current UI**: the Play page returned nothing; only the older wiki summary exists.
3. **ISTA actual screens and wording**: only indirect evidence. The official user guide was not read. Unofficial copies exist online and were intentionally avoided.
4. **Carly and Car Scanner coding/backup UX**: no first-party documentation found. Carly's backup claim is third-party only.
5. **OBDeleven pre-change diff or confirmation screen**: not found. Whether a one-step "restore original" exists is unverified in both directions: the forum thread behind the 2023 claim returned an error page on the fact-check re-fetch.
6. **Video walkthroughs**: none were watched (search tool returns text only).
7. **Review corpora**: Reddit, Bimmerpost and Trustpilot threads were seen only as snippets or not at all. No counting of complaint themes was possible. Forum restore failures are anecdotes; no failure rate exists.
8. **Medical-device evidence**: infusion-pump hard/soft limit idea is supported by secondary sources only; the FDA guidance and the PMC paper were not readable in this run.
9. **Audit log design**: no authoritative source read. Section 6.8 is a proposal.
10. **Usability evidence for typed confirmation** specifically: only NN/g's opinion and the fact that GitHub and AWS use it. No measured effect found.
11. **fwupd and other firmware-tool UX** (battery thresholds, recovery): pages were blocked.
12. **Accessibility** of these apps (screen readers, colour contrast): not researched.
13. **Prices**: BimmerCode appears at $49.99 and $69.99 on different store pages. Not reconciled.
14. **Fact-check pass (2026-11-20)**: 12+ claims re-fetched against sources; corrections applied in place. Not re-checked: store prices and ratings, Trustpilot and forum snippets, Carly and Car Scanner claims, infusion-pump claims, the NHTSA bulletin, ISTA user guide index.
15. **Whether BimmerCode refuses unlisted adapters** outright: not supported by the adapters page.

---

## Sources

Store listings and prices change daily; URLs below are those actually fetched or returned by search this run.

**BimmerCode / BimmerLink**
- [S1] Quick Start Guide, bimmercode.app/manual - https://bimmercode.app/manual (high)
- [S1a] Search summary of BimmerCode coding flow, ECU selection and backups (search result, medium) - https://bimmercode.app/faq/
- [S1b] Home page, platforms and control-unit screens - https://bimmercode.app/ (high)
- [S1c] App Store (CA), BimmerCode listing - https://apps.apple.com/ca/app/id1130787459?l=en-ca (medium)
- [S1d] App Store (US), BimmerCode listing and review themes - https://apps.apple.com/us/app/id1130787459 (medium)
- [S1e] Adapters page - https://bimmercode.app/adapters (says only that not every adapter works with every vehicle)
- [S2] FAQ, error codes BCE-006 to BCE-012, expert mode, risk statements - https://bimmercode.app/faq/ (high)
- [S3] App Store (CA), BimmerLink listing - https://apps.apple.com/ca/app/id1065360416?l=en-ca (medium)
- [S3b] Search results summarising BimmerLink listings and reviews, including tuningblog.eu - https://www.tuningblog.eu/en/categories/tuning-wiki/bimmerlink-365080/ (medium-low)
- [S9] Forum threads on failing restores, via search snippets (not opened): https://www.supramkv.com/threads/2023-supra-mt-bimmercode-recovery-failing.18674/ ; https://www.insideevsforum.com/community/threads/bimmercode-help.14325 (low-medium)

**OBDeleven, Carly, Car Scanner, OBD Fusion / OBDLink**
- [S4] OBDeleven App Store listing - https://apps.apple.com/us/app/id1643119107 (medium-high)
- [S5] OBDeleven support: restore a control unit after a failed One-Click App (BMW) - https://support.obdeleven.com/en/articles/11461436-how-to-restore-a-control-unit-if-a-one-click-app-fails-to-activate-on-a-bmw-vehicle (high)
- [S5a] OBDeleven support: backup and full backup (via search snippets) - https://support.obdeleven.com/en/articles/5608806-backup ; https://support.obdeleven.com/en/articles/5608805-full-backup (medium)
- [S5b] OBDeleven support: control unit history - https://support.obdeleven.com/en/articles/5608800-control-unit-history (high for the change-type list)
- [S6] OBDeleven Trustpilot pages (snippets only) - https://www.trustpilot.com/review/obdeleven.com?page=4 (low-medium)
- [S16] OBDeleven community forum threads on backup and restore (snippets; the first URL returned an error page on re-check, so unverified) - https://forum.obdeleven.com/thread/7063/backup-restore ; https://forum.obdeleven.com/thread/5650/backup (low-medium)
- [S7] Carly App Store listing - https://apps.apple.com/us/app/id467344155?l=en-us (medium-high)
- [S7a] Carly review articles via search (carwitter, fastcar) - https://carwitter.com/2023-carly-obd-fault-code-reader-review/ ; https://www.fastcar.co.uk/tuning-tech-guides/code-your-own-car-with-carly/ (low)
- [S8] Car Scanner ELM OBD2 App Store listing - https://apps.apple.com/app/id1259933623 (medium-high)
- [S8a] Search summary of Car Scanner dashboards and profiles - https://play.google.com/store/apps/details?id=com.bapps.obd (medium)
- [S23] OBD Fusion App Store listing - https://apps.apple.com/app/id650684932 (medium-high)
- [S24] OBDLink App Store listing and reviews via search (The Drive, ToolGuyd, The Gadgeteer) - https://apps.apple.com/us/app/obdlink/id879636351 ; https://www.thedrive.com/gear/42015/obdlink-mx-review ; https://toolguyd.com/i-bought-a-bluetooth-and-app-based-auto-obd2-code-reader (medium)

**ISTA (indirect)**
- [S25] Search result listing of an ISTA user guide index (not opened) and BMW training PDFs on archive.org (not opened) - low-medium
- [S25a] NHTSA service bulletin referenced for VIN-based identification path (via search snippet) - https://static.nhtsa.gov/odi/tsbs/2016/MC-10151068-9999.pdf (medium; the direct fetch of a 2018 variant returned 404)
- [S26] Trade-press summary of a BMW bulletin on S-codes and quick delete in ISTA/D - https://www.vehicleservicepros.com/tsbs/article/53091787/stubborn-bmw-faults-2018-12-03 (high for the quoted behaviour)

**Safety patterns in other domains**
- [S10] GitHub Docs, deleting a repository - https://docs.github.com/en/repositories/creating-and-managing-repositories/deleting-a-repository (high)
- [S11] Terraform CLI, plan command - https://developer.hashicorp.com/terraform/cli/commands/plan (high)
- [S12] Git push documentation (`--force-with-lease`, `--force-if-includes`, `--dry-run`) - https://git-scm.com/docs/git-push (high)
- [S13] kubectl diff reference - https://kubernetes.io/docs/reference/kubectl/generated/kubectl_diff/ (high)
- [S14] Amazon S3, emptying a bucket - https://docs.aws.amazon.com/AmazonS3/latest/userguide/empty-bucket.html (high)
- [S15] AWS CLI ec2 terminate-instances (`--dry-run`, termination protection) - https://docs.aws.amazon.com/cli/latest/reference/ec2/terminate-instances.html (high)
- [S17] Git reflog documentation - https://git-scm.com/docs/git-reflog (high)
- [S18] MCUboot design (test vs permanent swap, revert, power-fail safety) - https://docs.mcuboot.com/design.html (high)
- [S19] Android A/B system updates - https://source.android.com/docs/core/ota/ab (high)
- [S20] Infusion-pump hard/soft limits, via search results (patents, ISMP-related secondary material); the PMC paper https://pmc.ncbi.nlm.nih.gov/articles/PMC3875117 was blocked by a bot check (medium-low)
- [S21] NN/g, confirmation dialogs - https://www.nngroup.com/articles/confirmation-dialog/ (high)
- [S21b] NN/g, error message guidelines - https://www.nngroup.com/articles/errors-forms-design-guidelines/ (high)
- [S22] Aza Raskin, "Never Use a Warning When You Mean Undo", A List Apart, 2007 - https://alistapart.com/article/neveruseawarning (high for the argument; claims are argued, not measured)
- [S27] Google SRE Workbook, canarying releases - https://sre.google/workbook/canarying-releases/ (high)
- [S28] NN/g, ten usability heuristics - https://www.nngroup.com/articles/ten-usability-heuristics/ (high)
- [S29] FDA, human factors and usability engineering for medical devices (overview only) - https://www.fda.gov/regulatory-information/search-fda-guidance-documents/applying-human-factors-and-usability-engineering-medical-devices (medium)

**Existing OpenDiag docs referenced**
- docs/research/deep/obd-app-market-and-reviews.md, bmw-coding-failures-and-recovery.md, bmw-ista-real-world-usage.md, bmw-coding-demand-and-practice.md; docs/plan/decisions.md (owner decisions 2 and 6), docs/plan/direction.md, docs/plan/kpis.md.
