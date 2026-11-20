# What BMW owners actually code, and how

Research for OpenDiag. Scope: BimmerCode, E-Sys, NCS Expert, FDL, FSC and related apps; the most requested coding goals by category; which goals an app can do and which need E-Sys; known side effects.

**Read this first: the evidence has a hole.** The plan was to mine long threads on Bimmerpost, F30Post, Bimmerfest and Reddit and count requests. That did not happen.

- Bimmerpost (all chassis sub-sites) returned 403 on every thread page. Its forum archive indexes returned 404.
- Reddit blocks the fetch tool. A Reddit mirror also returned 403.
- Bimmerfest redirects crawlers to a paid-access gateway. I did not use it.
- The shared web-search budget ran out part-way through, so searching stopped early. I did not work around the limit.

So there are **no thread counts**. The demand ranking below is built from indirect signals: what BimmerCode chooses to ship per chassis, what vendors sell, which warnings BimmerCode felt it had to publish, store-review themes, and a few small shop and blog pages. It is a reasoned ranking, not a measured one. Treat it as a hypothesis to test, and see "Open questions" for how.

Ledger references look like [L7]. Search-result snippets I saw but did not open are marked [snippet] and are not counted as pages read.

---

## Summary

1. **Pages actually read: 36.** Almost all are vendor, app-store or reference pages. Zero are long community threads. This is below the 50+ target for a topic this rich, and the reason is stated above.
2. **BimmerCode is the mainstream path.** It is a one-time purchase (about $50 on the US store), rated 4.7 from about 22K ratings on iOS, and covers BMW, MINI and the 2019+ Supra [L5]. A forum user in 2019 valued it as a one-time purchase rather than a subscription [L10].
3. **Its catalog is large and similar across chassis.** F20, F22, F30, F10, F15, G01, G05, G20 and F40 each list roughly 25 to 60 option groups [L2, L7, L8, L17, L18, L19, L33, L35, L36].
4. **Start-stop disable is the one goal where the evidence of demand is strongest.** It is the first thing users mention [L10], it has a dedicated E-Sys how-to [L6], and BimmerCode now publishes a workaround because BMW broke it on petrol cars from i-level 23-3 [L2, L7, L17, L35].
5. **Video in motion is the most commercially validated goal.** Three independent sellers charge money for it: a shop at $25 [L11, L14], a hardware dongle at about 188 euros [L20], and an app subscription tool [L12]. BimmerCode includes it free [L2, L7, L8].
6. **Lights, displays and comfort make up the bulk of the catalog.** Daytime lights, angel eyes, welcome lights, LED conversion, US side markers, mirror fold, seat and wheel heat auto-on, and iDrive display options appear on nearly every chassis page.
7. **App-codable versus E-Sys is a real line, but a moving one.** BimmerCode refuses expert mode on control units with safety functions [L3]. Map updates, light-module retrofits and feature enablement still point to E-Sys or NCS Expert [L15].
8. **The biggest practical risk is software updates, not the coding itself.** A new i-level can silently undo or block a coding (start-stop is the proven case). A store reviewer also reports codings that reverted [L26].
9. **Rare but severe failures exist.** A footwell-module block when its boot sector is corrupt [L3], a reviewer who says brake lights were disabled [L5], and a head unit lockout on a critical i-level [L3]. BimmerCode's answer is automatic backups and hard blocks [L3, L4].
10. **Several goals have a regulatory edge.** Speed warnings and lane-change assist carry legal notes [L7, L17, L35]. Video in motion vendors all carry a legal disclaimer [L12, L16, L20]. In the EU, speed-assistance must be switchable but re-arms at each start [L27].

---

## What I found

### 1. The tools and who uses which

**BimmerCode (phone or desktop app).**
- Free to install and browse. The paid full version unlocks writing [L5].
- It reads a control unit, shows named options, writes, and keeps backups. iOS and desktop make a backup on every read. Android makes one the first time [L4].
- Basic mode covers the popular options. Expert mode exposes raw settings for experienced users and is explicitly unsupported [L4].
- Expert mode is blocked on control units with safety-related functions [L3].
- A 2019 reviewer complained that expert mode was not fully translated to English [L5]. Advanced codes being in German was also mentioned in a forum thread [L10]. Both are single-source.
- Adapters: Bluetooth, Wi-Fi, ENET cable and ENET-over-Wi-Fi. The OBDLink CX is listed as "Made for BimmerCode All Series". Wi-Fi adapters from the tuning world (MHD, bm3) are on the list too [L22]. Not every adapter works on every car [L4, L22].
- Newer G-series body controllers need specific adapters [L2, L4, L22].
- Updates track new models slowly. A 2023 release added G42, G87 and G08 [L5]. A review snippet said new models lag [snippet], single source.

**BimmerLink (same developer).** This is a diagnostics and service app, not a coding app. It reads and clears faults, logs live data, registers batteries, resets services, mutes active sound, and so on [L23, L26]. BimmerCode itself tells users to register a replacement battery in BimmerLink after changing battery coding [L2, L7, L17]. So the real product shape is two apps: coding in one, service and diagnostics in the other.

**E-Sys and NCS Expert.** These are the professional tools. NCS Expert is the older tool for E-series. E-Sys is the tool for F and G series, reached over an ENET cable [L16]. A blog covering E60, F30, M2 and G20 describes both being used, including NCS Expert or E-Sys for light distribution features and E-Sys with FSC codes for navigation map updates [L15]. A shop page lists INPA, NCS Expert, E-Sys and ISTA together as the toolkit [L1]. Single-source for those lists. I did not read any E-Sys documentation, and I did not look at the software itself, per the brief.

**Other paid routes.**
- Carista: video in motion for F-series CIC cars, behind a paid subscription [L12].
- Kufatec: a plug-in dongle for video in motion that is bound to one car once used [L20].
- Local coding shops: "$25 plus one extra code" for video on CIC cars [L11, L14]. Another shop sells remote assistance [L16].
- Carly: I could not load its page (the domain redirected to a sales page), so I say nothing about it.

**Terminology that came up.**
- FDL (the expert-level setting editor in E-Sys) was never explained on a page I could read. I cannot cite a definition.
- FSC (feature unlock certificates) appears only in the map-update post [L15].
- "I-level" is the car's software release stamp. It matters more than anything else for whether a coding works (see section 5).

### 2. Which goals are on offer, by category

This is the supply side: what BimmerCode lists. It is a catalog, not a demand count. But a developer with 22K ratings and years of support mail is a decent filter for what people ask for, so it is a useful second-best signal.

**Lights.**
- Daytime running light on/off and style, on every chassis page [L2, L7, L8, L36].
- Angel eyes brightness and daytime use. Must be set for each headlight separately [L8, L18, L19, L33].
- Welcome and coming-home lights (some only for halogen or xenon) [L8, L19].
- LED conversion options to stop errors and flicker after an LED bulb swap [L8, L9, L19].
- Fog light behaviour: off with high beam, on with parking lights, deactivate if fog lights are removed [L2, L8, L36].
- US side markers on/off [L8, L9, L36].
- Auto light switch behaviour and rain sensor sensitivity [L2, L7].
- Hazards after emergency braking, one-touch turn signal [L2, L7].
- A blog covers mapping a European rear fog light via expert mode [L15]. Single-source.
- The same blog covers enabling variable light distribution and glare-free high beam on cars that have the hardware [L15]. Single-source, and it uses the older tools.

**Daytime running light and the one-touch signal are among the few lighting items with legal edges** (regional rules on DRLs and side markers). No source here discusses that, so I flag it only as an open question.

**Comfort and convenience.**
- Mirrors: fold on lock, unfold on unlock, tilt down in reverse [L2, L7, L8, L35].
- Seat heating and steering wheel heating auto-on, with memory time [L2, L7].
- Air conditioning: auto recirculation, AC on in recirculation, apply auto settings to manual [L2, L18].
- Windows and roof via key fob, and window-stop when a door opens [L1, L2].
- Tailgate opening delay and unlock-only opening [L2, L7].
- Easy entry on F-series [L1, L8, L19].
- Lock after pulling away, and lock delay [L2].
- Fuel reserve warning distances [L2].
- Steering wheel and seat heating, wheel memory [L2].

**Displays.**
- Sport displays (G-meter, power, torque, oil temperature, boost) on F and G chassis [L2, L8, L17]. Two warnings repeat on every page: some cars show the displays but they stay empty because the engine unit does not send the values [L2, L7, L8, L17, L19, L33, L35, L36]. That is the single most repeated caveat in the catalog.
- Cluster options: digital speed in the trip computer, logos and layouts, redline, fuel-consumption scale, M Performance logo [L2, L19, L35].
- iDrive options: start animation, volume at start, volume pop-up, service history, full text messages, tire pressure display, rear camera zoom [L2].
- Camera views at all speeds, listed under F-series iDrive options in a shop's service list [L1]. Single-source.
- CarPlay fullscreen. Works only on two specific iDrive software releases, otherwise a dealer update is needed first [L2, L7, L8, L33, L35, L36].
- HUD options and Assisted Driving View, the latter requiring active cruise control [L2, L8, L35].

**Start-stop.** Present for every chassis page with the option, including E9x [L2, L7, L8, L9, L17, L35, L36]. Two flavours: switch the function off, and make the "off" choice remembered. Also see section 5.

**Sound.**
- Active sound design on or off, with the note that it cannot be added to a car without the factory option [L2, L7, L35].
- Engine sound menu, ready-to-drive sound, signal tones, ringtones [L2].
- Pedestrian protection sounds [L2].
- Exhaust "burble" muting and exhaust flap control sit in BimmerLink, not BimmerCode, and only on some engines [L23].

**Driving mode and drivetrain.**
- Default driving mode at start. This doubles as the start-stop workaround [L2, L7].
- Sport+ added to cars that lack it. BimmerCode warns not to use it if the car already has it, and it only works with automatic transmissions [L18, L19]. A cheat sheet also lists Sport+ and Comfort+ as headline codes [L13]. Partial read only.
- A claimed "M mode" attempt in that cheat sheet had "limited success" because of hardware [L13].

**Warnings and nags.**
- Seat belt reminder and chime: initial reminder, driver, passenger [L1, L2, L34]. Also listed in a shop's list among safety-related items [L1].
- Camera disclaimer, night vision disclaimer, startup legal screen: disable-only [L2, L9, L34].
- Speed limit warning (an audible alert at a chosen speed) [L2, L7, L34].
- Check control messages for brake light, fog and turn signal bulbs [L9, L34], and bulb-out warnings [L1].

**Video and media.**
- Video in motion, video over USB, extra video formats [L2, L7, L8].
- Bluetooth audio streaming, which on CIC cars needs a Combox module [L8, L18].

**Driving assistance.**
- Lane change assist needs coding in three separate units and a specific factory order [L2, L7]. Legal note on both lane change and speed warning in some countries including the EU [L2, L7, L17, L35].

**Convertibles and special hardware.** Several comfort items do not work on convertibles [L8, L19, L35]. Some need factory equipment such as an alarm or folding mirrors [L2, L33, L35].

### 3. What is app-codable versus E-Sys

**Clearly app-codable (named options in basic mode)**: nearly everything in section 2 under lights behaviour, comfort, displays, start-stop, driving mode default, warnings, seat belt reminder, video in motion.

**Needs expert mode or E-Sys (by what I could verify)**:
- Anything on a safety-related control unit. BimmerCode blocks expert mode there [L3].
- Light distribution retrofit features (variable light distribution, glare-free high beam), per one blog, with NCS Expert or E-Sys [L15]. Single-source.
- Map updates, which also involve FSC codes [L15]. Single-source.
- Alarm or other module retrofit (a shop's service list, E-series focus) [L1]. Single-source and commercial.
- Vehicle-order edits and programming new modules: only appears in that same shop list [L1].

**Deliberate and recent changes in the line**:
- Video in motion used to be E-Sys work. A seller and a shop still sell it that way [L16, L20], while BimmerCode now ships it [L2, L7, L8]. The line moves toward the app over time.
- Start-stop is the reverse case: it was easy in either tool, and BMW closed the door on petrol cars [L7].

**One-time-purchase economics.** The paid tool people compare against is a subscription app [L10], and the E-Sys route costs a cable plus time [L6, L16].

### 4. Chassis spread

BimmerCode splits catalogs by body group, not chassis alone.

| Group | What the catalog shows | Ledger |
|---|---|---|
| E60/E61 | Old iDrive (CIC or CCC), warnings (ignition key, speed warning 4 steps, temperature), light module options. Older ECU names [L34] | L34 |
| E90 to E93 | 33 option groups. Check control notifications, convertible roof, key, coming-home lights, panic alarm [L9] | L9 |
| F20, F22, F87 | 50 to 60 groups. Heavy on lights (angel eyes, LED conversion, sidemarkers), Sport+ and sport displays [L19, L36] | L19, L36 |
| F30, F80 | About 50 groups including HUD, side view camera, blind spot, active rear spoiler [L8] | L8 |
| F10 family | Similar to F30 [L18] | L18 |
| F15 | Similar plus HiFi retrofit and speed limit info signs [L33] | L33 |
| G01 | Adds lane departure warning, one-touch signal, 13 ambient colours, ambient lower/upper split [L35] | L35 |
| G05 | A smaller catalog, shifting toward body controller options and G-series adapters [L17] | L17 |
| G20, G21, G80 | About 30 groups. Adds Assisted Driving View, lane change assist, video, brake force display [L7] | L7 |
| F40 | Same pattern as G20, with CarPlay and ambient colour options [L2] | L2 |

Two patterns: G-series moved more lighting into the body controller, which needs a specific adapter [L2, L7]; E-series is still served over a USB cable, with smaller catalogs [L22, L9, L34]. I found no usable source on F8x/G8x differences: the M3 pages errored, and M-car signals are indirect [L36, L15].

### 5. Known side effects and failure modes

**Start-stop and software updates (strongest evidence).**
- BimmerCode's own pages say that on petrol models from i-level 23-3 onward, disabling start-stop by coding no longer works, and the recommended workaround is to default to a Sport Individual driving mode where start-stop is off [L2, L7, L17, L35].
- On F-series, start-stop turns itself back on in Eco Pro even if saved off [L8].
- Search snippets from two forums report the same breakage after a 03/2023 update, support saying there is no quick fix, and the Sport Individual workaround [snippet]. Some owners report the old method still works on certain updates, possibly by country [snippet]. A claim that US-spec cars lost the setting entirely is single-source and unverified [snippet].
- This is a **disagreement** worth knowing about: BimmerCode's pages say "no longer possible" for petrol, while a minority of owners say it still works on their build. See "Evidence quality".

**Updates and dealer visits undo codings.** A 2019 forum thread warns that a dealer reprogramming a module erases that module's custom codes, so owners should write their settings down [L10]. A store reviewer of BimmerLink says some coding changes reverted [L26]. This is a "coding is not permanent" theme from two weak sources.

**Serious but rare failures.**
- A 2019 App Store reviewer reported that certain footwell-module changes disabled the main brake lights [L5]. Single-source and old.
- A 2024 reviewer says a backup-camera warning did not clear even though the app reported success [L5]. Single-source.
- BimmerCode defines hard blocks for: a footwell module whose boot sector is corrupt (it may not restart), a modified head unit (third-party CarPlay or unlocked navigation), a head unit with under 4 GB of RAM, a head unit on a critical i-level, and an AC unit with a stored pressure fault [L3]. Each is an admission of a past failure class.
- The body controller can stop responding. The documented fix is disconnecting the battery for a few minutes, and for two-battery cars, at least fifteen [L3].
- Third-party hardware on the CAN bus can cause failures [L4].
- After coding, temporary errors are normal and usually clear after an ignition cycle. Some units may need time or user settings reset [L4].

**Prerequisites that cause "it didn't work".**
- Ignition on, engine off, parked with brake on, consumers off [L4]. G-series also needs diagnostic mode [L4].
- Battery and adapter quality. One user struggled with a cheap adapter [L10], and BimmerCode warns not every adapter fits every car [L4, L22].
- Missing factory equipment (alarm, folding mirrors, active sound design, halogen versus LED) [L2, L7, L33, L35].

**Video in motion.**
- Sellers and Carista say the feature only removes the lock-out. It does not make a video source work [L12, L20].
- Carista describes a manual iDrive reboot step, with functions briefly unavailable [L12].
- A Supra owner reports the setting resetting after each engine start on a newer head unit [snippet, forum thread that I could not open]. Single-source.
- Kufatec says moving video is prohibited in many countries and puts use at the buyer's risk [L20]. Carista and the E-Sys shop say the same in softer terms [L12, L16].

**Warranty.** I could not find a source on whether dealers can detect coding. The leasehackr thread did not discuss it [L10]. In the US, the Magnuson-Moss Act stops a maker from requiring branded parts to keep a warranty and puts the burden of proof on the maker, but the page I read does not say a software modification is protected [L32]. A separate page notes a DMCA exemption for vehicle software modification by owners and their agents [L30]. Neither is legal advice.

### 6. The ranked demand list

Goals, not raw values. Ranking is by my judgment of demand using the signals shown. Confidence is low to medium for every row because no thread counts were available.

| Rank | Goal | Category | App or E-Sys | Main evidence | Known side effects or limits |
|---|---|---|---|---|---|
| 1 | Turn start-stop off, and have it stay off | Emissions-related | App (broken on new petrol i-levels) | First thing users mention [L10]. Dedicated E-Sys guide [L6]. BimmerCode warns on 5 chassis pages | Breaks on i-level 23-3 and later. Reactivates in Eco Pro on F-series |
| 2 | Watch video while moving | Safety-related | App on newer, E-Sys or dongle on others | Three paid products [L11, L12, L20]. A catalog entry on every page | Legal in few places. Reset after start on some head units [snippet]. Safety disclaimer everywhere |
| 3 | Sport displays (power, torque, boost, g-force) | Displays | App | In the catalog of F and G pages [L2, L8, L17] | Often shows empty values if the engine unit does not send them |
| 4 | Daytime running light and angel eyes behaviour | Lights | App | Every chassis page. Blog posts for M2 and M340i start with DRL [L15] | Per-headlight setting. Some are regional |
| 5 | Make US cars look like European ones: side markers off, rear fog | Lights | App or expert mode | US sidemarkers group on E9x, F-series pages [L8, L9, L36]. Rear fog how-to [L15] | Regional rules. Not discussed in sources |
| 6 | Mirrors fold and tilt with lock and reverse | Comfort | App | Every chassis page [L2, L7, L8] | Not on convertibles |
| 7 | Silence nag screens and chimes (seat belt, camera disclaimer, startup screen) | Safety-related | App | Disable-only entries on all pages [L2, L9, L34] | Seat belt and bulb warnings are real safety aids. Reviewer reported a failed warning clear [L5] |
| 8 | Default drive mode to Sport, and add Sport+ | Driving | App | Catalog and cheat sheet headline [L2, L13, L18] | Sport+ must not be added where it exists. Automatic only |
| 9 | iDrive polish: CarPlay fullscreen, camera at all speeds, start animation, volume at start | Displays | App | [L1, L2, L8] | CarPlay fullscreen limited to two software releases. Head unit must be unmodified [L3] |
| 10 | Louder or quieter exhaust and engine sound | Emissions-related | App (ASD) and BimmerLink (flap, burble) | [L2, L23] | Only with factory sound hardware. Burble muting only on one engine family |
| 11 | Auto-on seat and steering heat, auto recirculation | Comfort | App | [L2, L7] | Needs heated equipment |
| 12 | Auto lock after pulling away, windows and roof via fob, easy entry | Comfort | App | [L1, L2] | Convertible limits. Dealer reflash erases [L10] |
| 13 | Speed warning at a chosen speed | Safety-related | App | [L2, L7, L34] | Legal note on every page |
| 14 | Remove the top speed cap | Emissions and safety | Not in BimmerCode | Search snippet only for G20 [snippet]. BimmerCode lists no speed limiter [L7] | Single weak source. Treat as unverified demand |
| 15 | Lane change assist, assisted driving view, driving assistance enablement | Safety-related | App, 3 units | [L2, L7, L35] | Three-unit coding. Legal note |
| 16 | LED bulb swaps without errors | Lights | App | [L8, L9, L19] | Backup recommended. Fog deactivation if removed |
| 17 | Retrofits (module add-ons, navigation maps, light distribution) | Hardware | E-Sys or NCS Expert | [L1, L15] | Needs hardware, certificates, older tools |

Not in the list because I found no signal: remote start (a snippet mentioned a request but no data), a "launch control" type goal, and ambient lighting colour (present in the catalog, no demand evidence beyond that).

**Gap in the brief's categories.** The brief listed "emissions-related" coding. In practice that means start-stop first, then sound hardware muting. I found no source about owners disabling emissions equipment through coding. Particulate-filter service is a BimmerLink diagnostic function, not a coding goal [L23].

---

## Evidence quality and disagreements

**Quality of the 36 pages.**
- High reliability, first-party: BimmerCode's own pages (FAQ, manual, adapters, per-chassis catalogs) and the App Store listing [L2 to L5, L7 to L9, L17 to L19, L21, L22, L24, L33, L35, L36]. These say what the app does, and what its maker admits breaks. They do not say how many people use each option.
- Medium: Wikipedia reference pages [L27 to L32], the BimmerLink site and listing [L23, L26], seller pages from the people who sell the fix [L11, L14, L16, L20, L12].
- Low: a single-author blog [L15], a forum thread from 2019 [L10], a partial cheat-sheet listing [L13], a shop post covering a single user's service list [L1], a marketplace explainer that looks AI-written [L25].

**Biases to keep in mind.**
- Sellers of video in motion have an interest in making it sound common and safe. Two of them stress the lock-out exists for safety [L12, L16].
- BimmerCode's catalog is supply, not demand. Some options exist because they are easy, not because many people want them.
- App-store reviewers over-represent people with problems, and the 2019 and 2024 reports are single accounts [L5, L26].
- The thread snippets I saw are not counted and not verified. They are mostly Bimmerpost and Supra forum titles.

**Disagreements and conflicts.**
1. **Start-stop.** BimmerCode: no longer possible by coding on petrol from i-level 23-3 [L7, L17, L35]. Forum snippets: some owners still succeed, maybe by region or build [snippet]. Not resolved. The i-level number itself is single-vendor (BimmerCode) sourced.
2. **Video in motion coverage.** Carista describes F-series with CIC head units [L12]. The shop describes CIC only, with USB video only on one variant [L11, L14]. Kufatec covers CIC through ID7 [L20]. BimmerCode lists newer units [L2]. These are different head-unit generations, so they may not truly conflict, but they do not line up neatly.
3. **Sport displays.** BimmerCode says they may be empty. A search result in the G20 context implied coding made them work for fans [snippet]. No direct evidence either way beyond BimmerCode's caveat.
4. **E-series support.** BimmerCode shows E60 and E90 pages [L9, L34], yet the Kufatec dongle explicitly excludes E-series [L20]. They are different products so this is not a contradiction.
5. **Fidelity of "popular".** The AliExpress explainer cites "digital key enablement" as a main coding example [L25]. No BimmerCode catalog page I read lists digital key, so that claim is unsupported and probably wrong. I treat it as low reliability.

**Single-source claims, marked.**
- Brake-light failure report [L5].
- Lists of tools used by a coding shop [L1].
- Blog how-tos for rear fog, variable light distribution and map updates [L15].
- US-spec losing start-stop coding entirely [snippet].
- Video resetting after each start on a Supra head unit [snippet].
- Top-speed removal on G20 [snippet].

---

## Implications for OpenDiag

### What to build

1. **Make the unit of the product a coding goal, not a value.** Name the goal in plain words ("Keep start-stop off", "Fold mirrors when locking"). Hold the chassis, control unit and software-level rules behind it. This matches how BimmerCode and users already speak, and it keeps raw values out of the interface.
2. **Start with the goals that carry the most evidence and the least regulation.** From the ranked list: comfort goals (mirrors, heating, auto-lock), lighting behaviour (DRL style, welcome lights, LED error stop), sport displays, iDrive polish, and the default drive mode. These are in every catalog [L2, L7, L8].
3. **Treat start-stop as a headline feature, and do it honestly.** Offer "reduce start-stop" with a result that depends on the car's software level. Where coding cannot do it, say so and offer the default-mode route that BimmerCode documents [L7]. This one feature is where trust is won or lost.
4. **Record the car's software level on every connection, and key every goal to it.** The start-stop story proves a goal can work on one release and silently fail on the next [L7, snippet]. A goal page should say "last confirmed on" and "known broken on".
5. **Backup before write, by default, and make restore a first-class screen.** Both BimmerCode and users depend on this [L3, L4]. Also warn that a dealer reflash erases custom coding and let the user re-apply a saved set [L10]. A "my changes" list that can be re-applied is an easy, valued feature.
6. **Verify after writing.** Read the setting back, and ask the car to confirm it took. A reviewer reported a "success" that left the warning in place [L5]. Report the real result.
7. **Hard-block known bad states, like BimmerCode does.** Corrupt boot sector, modified head unit, low RAM head unit, critical software level, stored AC fault [L3]. Each of these is a past failure turned into a rule. OpenDiag should keep a public list of them and let the community add to it with evidence.
8. **Pre-flight checklist.** Ignition state, parked, brake on, consumers off, no third-party CAN device, adapter quality, battery state [L4]. Failures often start here.
9. **Support the adapters the owner already has.** The OBDLink CX (BLE) is on BimmerCode's list as made for the app, and Wi-Fi ENET and tuner Wi-Fi adapters are on it too [L22]. Plan for a feature matrix of adapter by chassis, since not every adapter fits every car [L4, L22].
10. **Read-only discovery first.** BimmerCode lets free users see what options a car has [L4]. A free "what can my car do" view is a good funnel and carries no write risk.
11. **A public, evidence-linked catalog.** For each goal: chassis and head unit, software levels tested, who tested, outcome, side effects. This is the open-source advantage. The existing apps keep their catalogs private, and the community lists are scattered.

### What to avoid

- **No video-in-motion as a default or headline.** It is the most commercial goal, but every seller wraps it in a legal and safety disclaimer [L12, L16, L20]. If it is ever offered, it should be an informed, opt-in, clearly region-labelled change that only removes the lock-out. This is a decision for the owner, not an engineering default.
- **No tooling to defeat BMW's security or component protection.** Describing behaviour is fine. Reproducing seed-key work or certificate bypass is out of bounds under the project's own rules and was not researched.
- **No default access to safety-related control units in expert mode.** BimmerCode's line is a good starting point [L3].
- **No silent "disable warnings" goal for seat belt and bulb checks** without a plain-language statement of what protection is lost. Seat belt and camera disclaimers appear as disable-only items [L2, L34], and the downside is easy to forget.
- **Do not promise permanence.** Coding can be erased by updates and dealers [L10, L26].
- **Do not copy BimmerCode's catalog or wording wholesale.** It is their product. Build our own from tested behaviour.
- **Do not imply legal safety.** Warranty and right-to-repair sources I read are general [L30, L32]. No page speaks to coding specifically.

### What to measure

1. **Per goal, per chassis, per software level:** write success, read-back success, and "did the car show it" success.
2. **Reversion rate:** how often a setting is back to default after the next software update or dealer visit [L10, L26].
3. **Hard-block hit rate:** how often pre-flight checks stop a write, and how many were right.
4. **Failure severity:** count any case where a unit stops responding, a warning light appears, or a lamp stops working. This is the number that matters most, and it needs an owner-run beta to collect.
5. **Which goals users open and finish:** the first real demand data OpenDiag will have. Compare against the ranking above.
6. **Adapter success by model:** especially the owner's OBDLink CX (BLE) and the Wi-Fi ENET adapter.

---

## Open questions

1. **How often is each goal actually requested?** I need the thread counts I could not get. Options: owner-assisted export from Bimmerpost and Reddit, a manual sample of top threads per chassis, or a public data source that allows access.
2. **Which software levels break which goals?** Only start-stop has a documented answer. Video in motion resets, sport displays and CarPlay need the same treatment.
3. **What are the real rules by country for the "legal-note" goals** (DRL, side markers, speed warning, lane change, video)? None of my pages go past a general disclaimer.
4. **Can dealers see coding, and does it affect warranty or resale?** No source answered this directly [L10, L32].
5. **How do BM3 or MHD tuning and coding interact** (engine unit changes, sport displays, start-stop, driving modes)? Not found.
6. **How good is BimmerCode's real coverage on F8x and G8x M cars?** The M3 pages did not load. M-specific goals (M drive buttons, M mode, sound) are untested.
7. **How is FDL, FSC and vehicle-order editing used in practice in current threads?** I could not read a definition source, and my descriptions here come from shop and blog pages.
8. **Toyota Supra shares BimmerCode and BMW software** [L5, L26]. Is there a coding demand overlap worth checking for Toyota/Lexus later? No Lexus or Mercedes sources were in scope for this run.
9. **Is the "digital key" claim real** [L25] or marketing fluff? It needs a first-party check.
10. **Do the numbers hold up?** The 4.7 rating from about 22K ratings and the US price are from one dated store snapshot [L5].

---

## Source ledger

Pages in this table were fetched and read. "Partial" means the page was cut off or summarised by the fetch tool. Search results I saw but did not open are not listed.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| L1 | https://bimmerownersclub.com/forums/topic/19268-bmw-coding-support-and-solutions | Forum post, coding shop list (2022) | Feature list by area; tools INPA, NCS Expert, E-Sys, ISTA; chassis limits | Low |
| L2 | https://bimmercode.app/cars/f40 | Vendor catalog (1 Series F40) | Full option list; start-stop i-level warning; video, sport displays, warnings | High (supply) |
| L3 | https://bimmercode.app/faq/ | Vendor FAQ | Expert mode blocked on safety units; hard-block error classes; battery restart tip | High |
| L4 | https://bimmercode.app/manual | Vendor quick start | Workflow, backups per platform, prerequisites, adapter and CAN warnings | High |
| L5 | https://apps.apple.com/us/app/id1130787459 | App store listing | Rating 4.7 (~22K), price, version history, review themes (brake-light and warning reports) | Medium |
| L6 | https://ohptools.com/blogs/news/how-to-code-the-auto-start-stop-function-in-your-bmw-with-e-sys | Seller blog | Start-stop via E-Sys on F-series; dashboard button resets each start | Low |
| L7 | https://bimmercode.app/cars/g20 | Vendor catalog (G20/G21/G80) | Categories, start-stop warning, no speed limiter listed, lane change in 3 units | High (supply) |
| L8 | https://bimmercode.app/cars/f30 | Vendor catalog (F30/F31/F34/F35/F80) | About 50 groups; start-stop reactivates in Eco Pro; video, lights, side markers | High (supply) |
| L9 | https://bimmercode.app/cars/e90 | Vendor catalog (E90 to E93) | 33 groups; warnings group; backups for LED, video | High (supply) |
| L10 | https://forum.leasehackr.com/t/bimmercode-app-reviews/147132 | Forum thread (2019) | Start-stop focus; adapter issues; dealer reprogram erases codes; one-time price valued | Low to medium |
| L11 | https://www.sfbmwcoding.com/bmw-dvdvideo-in-motion-with-cic-based-idrive-units/ | Coding shop page | $25 video in motion on CIC; handbrake and speed thresholds changed | Low (seller) |
| L12 | https://carista.com/blogs/news/how-to-unlock-video-in-motion-on-your-bmw-f | Vendor blog | Video in motion tool in a subscription app; legal and safety text; iDrive reboot | Medium (seller) |
| L13 | https://www.scribd.com/document/507526227/BimmerCode-Some-Cheats-July-2020 | Community cheat sheet (partial view) | Sport+, Comfort+, misc cheat codes; M-mode limited success | Low |
| L14 | https://www.sfbmwcoding.com/did-you-know-you-could-watch-video-on-your-bmw/ | Coding shop page | Disc at $150+ versus $25 coding; default restrictions | Low (seller) |
| L15 | https://bmwgeek.blogspot.com | Personal blog index | Coding posts: M2, M340i, rear fog, light distribution, map updates | Low |
| L16 | https://ohptools.com/blogs/news/how-to-code-the-video-in-motion-on-your-bmw-with-e-sys | Seller blog | E-Sys plus ENET for F and G video in motion; safety remark; paid remote help | Low (seller) |
| L17 | https://bimmercode.app/cars/g05 | Vendor catalog (G05) | Same start-stop warning; sport display values; legal notes | High (supply) |
| L18 | https://bimmercode.app/cars/f10 | Vendor catalog (F07/F10/F11/F18) | About 50 groups; Sport+ caution; Combox note | High (supply) |
| L19 | https://bimmercode.app/cars/f20 | Vendor catalog (F20/F21) | Lights, LED conversion, welcome lights, Sport+ warning | High (supply) |
| L20 | https://www.cars-equipment.com/en/shop/video-in-motion-2/vim-video-in-motion-for-bmw | Hardware seller page (Kufatec) | Dongle price, chassis and head unit list, legal disclaimer, single-car binding | Medium (seller) |
| L21 | https://bimmercode.app/cars | Vendor index | Manufacturer selector only (BMW, Motorrad, MINI, Toyota) | High |
| L22 | https://bimmercode.app/adapters | Vendor adapter list | BLE, Wi-Fi, ENET types; OBDLink CX "Made for BimmerCode"; E and R series USB | High |
| L23 | https://bimmerlink.app | Vendor site | Diagnostics, service functions, ASD mute, exhaust flap | High |
| L24 | https://bimmercode.app/vehicles/bmw | Vendor model list | Models covered; no chassis detail | High |
| L25 | https://www.aliexpress.com/s/wiki-ssr/article/bimmercode-obdlink-cx | Marketplace explainer | CX works with BimmerCode on one F31; "digital key" claim | Low |
| L26 | https://apps.apple.com/gb/app/id1065360416 | App store listing (BimmerLink) | Price, features, review themes including reverted codings | Medium |
| L27 | https://en.wikipedia.org/wiki/Intelligent_speed_assistance | Reference | EU rule: must be switchable, re-arms at each start | Medium |
| L28 | https://en.wikipedia.org/wiki/Start-stop_system | Reference | EPA test treatment gives makers reason to default to on; override behaviour | Medium |
| L29 | https://en.wikipedia.org/wiki/IDrive | Reference | iDrive generations and chassis years, head unit mapping | Medium |
| L30 | https://en.wikipedia.org/wiki/Right_to_repair | Reference (partial) | Massachusetts law, vehicle-software DMCA exemption | Medium |
| L31 | https://en.wikipedia.org/wiki/BMW_3_Series | Reference | Chassis codes and years for 3 Series | Medium |
| L32 | https://en.wikipedia.org/wiki/Magnuson%E2%80%93Moss_Warranty_Act | Reference | Branded-part tie-ins barred; burden on the warrantor | Medium |
| L33 | https://bimmercode.app/cars/f15 | Vendor catalog (F15/F85) | Categories; speed limit info signs; per-headlight settings | High (supply) |
| L34 | https://bimmercode.app/cars/e60 | Vendor catalog (E60/E61) | Warnings group; E-series light module options | High (supply) |
| L35 | https://bimmercode.app/cars/g01 | Vendor catalog (G01/F97) | Start-stop warning; lane departure; ambient colours; legal notes | High (supply) |
| L36 | https://bimmercode.app/cars/f22 | Vendor catalog (F22/F23/F87) | About 60 groups incl. M2; US side markers; Sport+ | High (supply) |

**Count: 36 rows, 36 pages read.**

**Pages that failed or were refused (not counted).** Bimmerpost thread and archive pages (403 or 404); Reddit pages and a Reddit mirror (blocked); a Supra forum (403); an eBay listing (403); NHTSA distracted-driving page (403); Google Play (404); BimmerCode M3 and M2 pages (F80, F87, G80: 404); BimmerCode G30 (connection error); Carly (redirected to a domain sales page); an unrelated cheat-sheet site (connection refused); Bimmerfest (redirected to a paid crawler gateway, not used).
