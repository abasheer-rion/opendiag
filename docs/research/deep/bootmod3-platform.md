# bootmod3 (BM3, Pro Tuning Freaks): platform research

Status: partial. Read 22 pages, not the 35 the brief asked for. See "Evidence quality" for why.

Conventions: [n] points at a row in the Source ledger at the bottom. "(single source)" means only one page backs the claim. "(unfetched)" means it came from a search-result summary that I did not open, so treat it as a lead, not a finding. Nothing here reproduces proprietary data, seed-key material or circumvention steps. Everything about unlock and security is at the level the vendors and retailers themselves publish.

A naming note: the brief calls the maker "Protuner". Every page that names the company calls it Pro Tuning Freaks (PTF) [8][7][13]. I found no page using "Protuner", so this doc uses PTF.

---

## Summary (10 bullets)

1. bootmod3 is a cloud-based flash-tuning platform from Pro Tuning Freaks. It rewrites the factory engine computer (DME) and, on some cars, the transmission computer, over the OBD port. It is not a piggyback box [1][13].
2. It targets BMW F and G series cars on Bosch MEVD17.2 and MG1 engine computers, plus the 2020+ Toyota Supra A90/A91 [8][5]. Engines named across the pages: N55, S55, B58, S58, B48, B46, N20, N26, N13, S63TU, N63TU, N63T3 [20][6][12][18].
3. It is sold as one license per car (per VIN). The license includes one off-the-shelf (OTS) map. More OTS maps, a full OTS bundle, and custom tunes are extras [12][18][20]. List price for a B58 license is $595 in the US [12][20].
4. Maps live on PTF's servers. Once downloaded, a map can be flashed with no internet. The first flash takes about 3 minutes; later map switches take seconds [1][3]. Your stock calibration is backed up to your account at activation (search-result summary only, unfetched).
5. Licenses can be moved to a new VIN once, by the original buyer, and only after the old car is flashed back to stock and re-locked through bootmod3 itself [1][13]. OTS maps and custom tunes do not move.
6. Hardware: ENET cable (laptop) or a WiFi adapter (phone, recommended by the vendor). PTF sells its own WiFi/ENET/CAN adapter for $99 [22] (single source; the vendor announcement [5] gives no price; re-fetch of [22] hit a rate limit on 2026-11-20, so unconfirmed). I could not confirm any official statement about an OBDLink CX, or any Bluetooth LE adapter, working for flashing [gap].
7. Newer cars need the engine computer unlocked before any tuner can write to it. Retailers say post-June-2020 cars need a mail-in bench unlock, costing roughly $800 to $1,600 and one to two weeks without the computer [6][11]. This is the biggest cost and risk surprise for new owners.
8. Flash failures are common enough that PTF has a dedicated troubleshooting page. The listed causes are weak battery, antivirus or firewall, piggyback boxes, and unstable links [2]. I found no first-hand BM3 bricking story I could actually open. Forum pages were blocked.
9. Business model: license plus add-ons plus an independent tuner directory, plus hardware sales through resellers [12][18][20][5]. Retailers carry the legal disclaimers (off-road use, may void warranty, may not be road-legal) [20][22].
10. Competitor MHD is cheaper and modular; BM3 is pricier but adds cloud storage, map editing, flex fuel, anti-lag and a built-in tuner marketplace. Buyers split on which is better, and the comparison pages are mostly written by sellers [6][7][10][11].

---

## What I found

### 1. What BM3 is, and who makes it

- BM3 is described by its own FAQ as a cloud-based tuning platform. It changes tunes through the OBD port from a web page, Windows or macOS software, or iOS and Android apps [1].
- The FAQ draws a line against piggyback boost controllers such as the JB4. BM3 reprograms the factory software and says it keeps the factory failsafes [1]. This is a vendor claim. I found no independent test of it.
- The iOS app lists the developer as PRO TUNING FREAKS INC. and describes the product as a flash tuning platform for BMW F and G series and the A90/A91 Supra [8]. The same page says the supported engine computers are Bosch MEVD17.2 and MG1 [8].
- The app is free, at version 3.3.8 at the time I read it, 4.6 out of 5 from only 10 ratings [8]. That sample is too small to say anything about satisfaction. The one displayed review praised support speed (single source) [8].
- The app store listing carries a "closed-course competition use" disclaimer and says use may affect factory warranty [8]. This matches the retailer language [20][22].
- Privacy label on the app: the developer reports no data collected [8]. That sits oddly beside a cloud platform that stores datalogs and maps per account. I did not resolve this. It may only describe the app binary.

### 2. Supported engines, cars and computers

What the pages say, by engine:

| Engine | Evidence | Note |
|---|---|---|
| N55 | F-series 135i, M235i, 335i, 435i, 535i, 640i, X3, X5, X6, M2, M40i [19]; E30 and E50 blend OTS maps [1] | FAQ dyno examples cover EWG and PWG variants [1] |
| S55 | M3/M4 (F80/F82), M2 Competition [1] | S55 is in the engine list on the bmwmpower247 page [20] |
| B58 | 340i, 440i, M140i, M240i from 2016, 540i, 740i, 640i, X3 M40i, X4 M40i, Z4 M40i, Supra [12][14][20] | Gen1 and Gen2 are different; Gen2 got its own CustomROM [14] |
| S58 | Listed on a retailer page, but the page's vehicle list actually shows B58 cars [18] | Treat S58 coverage as plausible but not confirmed by the pages I read |
| B48, B46, N20, N26, N13 | BM3 covers these; MHD does not [6]. A B38-T0 map was added in app 3.1.x [8] | Four-cylinder coverage is a BM3 selling point |
| S63TU, N63TU, N63T3 | Listed on the bmwmpower247 page [20] | S63TU dyno examples appear in the FAQ [1] |
| MG1, MEVD17.2 | Named as the supported engine computer families [8] | These are computer types, not engines |
| TCU / 8HP | App description says transmission flashing on supported models [8]; adapter allows full transmission flashing on Gen2 BMW and 2020+ Supra without extra cables [5] | Details of which gearbox generations are covered were not on any page I read |

Disagreement: one retailer page says it covers "F- and G-chassis six-cylinders, where either platform can work" [6] while the xHP (gearbox tuner) page snippet, which I did not open, says ENET cannot unlock the third-generation 8HP in G-series and Supra (unfetched). I could not reconcile the two because the xHP page failed to load.

BM3 does not cover the N54 or the E-chassis N55, per one comparison page [6] (single source).

### 3. Tuning stages and what OTS maps are

- OTS maps are pre-made calibrations you pick by fuel octane and hardware. Retailer copy for the B58 lists Stage 1 and Stage 2 on 91 and 93 octane, with aggressive-burble variants, and E30 and race-gas maps shown as "coming soon" [12].
- Claimed gains on the B58 page: Stage 1 up to 18 to 20 percent horsepower and 26 percent torque, Stage 2 up to 24 to 26 percent horsepower and 32 percent torque [12]. These are seller marketing numbers.
- A guide gives an M340i example from about 360 stock to about 415 horsepower at Stage 1 and about 460 at Stage 2. The guide itself is promotional [9].
- Stage 2 generally assumes a downpipe and an E30 blend [9]. The FAQ says full E85 maps are custom work through tuners [1].
- Stage tunes on one retailer page are based on non-MPPK cars [18]. That detail matters for anyone modelling which calibration a car is running.

### 4. Cloud maps, the editor and custom tuning

- Maps are stored in the cloud. Once a given version is downloaded it flashes offline [1]. The App Store listing confirms datalogs and maps live in a central location [8].
- The software includes a map editor. "Save As" on the stock tune lets owners start their own tune while keeping the original [1].
- Custom tuning goes through a Tuner Directory: independent tuners get the base map matching your calibration and edit it [1][12]. A tuner marketplace is a business feature, not just a technical one.
- A comparison page says BM3 stores maps and logs in an online account synced across devices, while MHD keeps them on your phone or laptop [6].
- "CustomROM" is PTF's name for a deeper firmware package. Features tied to it include map switching, anti-lag, flex fuel, in-dash ethanol display, live-adjust exhaust burble, and launch control [8][9][14]. A "Rev2" board and "CustomROM V2" exist for newer cars and, per one seller, cannot run the standard software [11] (single source).
- Gen1 G-series B58 got CustomROM in June 2022 [14]. A CustomROM update for the Supra and Gen2 B58 was announced in March 2023 as covering cars with Femto-unlocked computers without "DME cloning" [14]. I do not know whether it shipped as described.
- Multi-map: up to four maps selectable with the steering wheel cruise buttons (search-result summary, unfetched) and the app lists the same cruise-control switching [8].
- Flex fuel: supported with an ethanol sensor on N55, S55, B58, S58, per a seller [6]; the app description confirms flex-fuel sensor support [8].

### 5. Flashing workflow (user-visible behaviour)

Wireless path, vendor-recommended [3]:
1. Buy a license (an activation key is emailed) and a BM3 WiFi adapter.
2. Install the app, connect the phone to the adapter. The login screen shows the car's VIN.
3. Create an account on the web site, enter the activation key against that VIN.
4. In Maps, open OTS Maps and pick one matching your hardware and fuel.
5. Open it under My Maps, press FLASH, then Flash Now.

Wired path [3]:
1. Buy a license and an OBD-to-Ethernet cable (plus a USB Ethernet dongle if the laptop lacks a port).
2. Install the OBD Agent program and run it.
3. Turn off firewall and antivirus, disable piggyback devices.
4. Connect, register on the web site, choose a map, FLASH.

Other behaviours:
- First flash takes about 3 minutes; later map swaps take seconds [3].
- The OBD Agent is only needed for live app features such as datalogging, not for flashing itself [13]. This conflicts mildly with the wired workflow above, which keeps the agent running. The likely reading: the agent is the bridge for browser and desktop use, and optional when the phone app talks to the adapter directly. Not confirmed.
- Switching a car from WiFi to ENET connectivity may need the battery ground disconnected for 3 minutes [14].
- Flash stops if the OBD Agent disconnects (changed in app 3.3.8) [8]. This is a safety behaviour OpenDiag should copy.
- Buyers of the B58 license through one retailer must submit proof of vehicle ownership with a matching address [12] (single source).
- Dealer installs exist; appointments are needed and labour varies [1].

### 6. Adapters and cables

- PTF sells a wireless OBDII ENET and CAN adapter. Retail $99 on one listing, with a separate handling fee shown at checkout [22]. Features: configurable WiFi password, wireless CAN for transmission flashing on Gen2 BMW and 2020+ Supra, about 20 mA low-power mode, over-the-air updates through the app, no VIN lock [5][22].
- V3 does not trigger alarms when left plugged into G-series and Supra; V2A does [5][14].
- Works with other apps that need ENET or UDS over CAN: ISTA, ESYS, xHP, Bimmercode, Bimmerlink, ProTool [5][22]. Relevant to the owner's BimmerCode use.
- Wired ENET works on iOS only with an Apple MFi-certified adapter; the WiFi adapter is the vendor's recommendation for phones [14].
- Android drops mobile data while joined to a car WiFi network; iOS has a manual-WiFi workaround [14][5].
- Reviews of the adapter on one retailer are tiny and mixed: five reviews, one reporting it never worked until an Ethernet cable was used [22]. Too small to generalise.
- OBDLink CX, OBDLink MX+ and any BLE adapter: no page I opened mentions them. A search summary also found nothing. The vendor's wording ("ENET" and "WiFi adapter") suggests flashing needs an Ethernet-class link, and that Bluetooth LE adapters are not an official flashing path. I cannot prove that. Anyone designing OpenDiag around the OBDLink CX should treat it as a logging and coding option, and verify flash support separately with a car and a second source. See Open questions.

### 7. Logging and diagnostics

- Features listed: over 200 channels available, up to 40 logged at once, Live Dash gauges, diagnostics, a map editor [20]. Another comparison says logging up to 40 channels saved to the cloud [6].
- App changelog shows steady investment in charting: group mode, math channels, datalog comparison, custom calculated gauge fields, a Race Dash layout, datalog sync fixes [8].
- Built-in diagnostics can check and clear trouble codes [9] (single source, promotional).
- Reported weakness: app freezes during logging on some cars [6] (single source). The 3.3.8 notes mention dashboard freezing fixes [8], which is consistent.

### 8. Stock restore, flash counters and license rules

- Stock restore: the "Save As" mechanism keeps the original; a map-revert option returns to stock [1][9]. Returning to stock is also the mandatory first step in a license transfer [1][13].
- Re-lock: after flashing back to stock, the computer is re-locked "through the bootmod3 interface"; other tools are not accepted [1][13]. This implies BM3 changes some lock state on the computer when it first writes, and reverses it on return. The pages do not say what.
- Flash counters: no page I opened gives a flash count limit, a map-credit price per flash, or any dealer-visible flash counter. The FAQ is silent on map credits and flash counts [1][13]. A search summary said some OTS maps need map credits (unfetched). Treat flash-counter policy as unknown.
- Transfer rules: once only, original buyer and order only, contact support with order number and both VINs [1][13]. A comparison page claims MHD has no transfer at all [6] (single source).

### 9. Unlock and security approach (public, behavioural only)

- Newer BMW engine computers are locked by the supplier. Neither BM3 nor MHD can write until the computer is unlocked [6].
- Per one seller: BM3 needs an OBD unlock on some 2016 to 2020 cars and a bench unlock on 2021+ cars, except the F87 M2 Competition and CS; MHD needs a bench unlock on computers built after June 2020 and some earlier ones [6] (single source). Another seller says any BMW built after June 2020 needs a Femto unlock before any tuning software, with the computer shipped to Europe in 5 to 7 business days [11] (single source). These two statements disagree on the exact cut-off and on who needs what.
- Pumaspeed says 2019+ G-series may need a bench unlock to enable OBD flashing [18].
- Cost: a US mail-in unlock is quoted at about $800 to $1,600 with the computer out of the car for one to two weeks; the seller warns it can exceed the license price [6] (single source). Treat as a range from one seller, not a price list.
- Some BM3 licenses require the physical computer to be shipped in; support confirms at activation [1].
- Unlock service provider "Femto" is named by two sellers [6][11]. Beyond that, I did not open any page describing how unlocks work, and I am deliberately not seeking that.
- Retailer text for the B58 says tuning is "not by removing the DME" for the OBD-flash path [12]. For bench-unlock cars, the removal happens once, for the unlock, then flashing goes back to OBD.

### 10. Failure modes and bricked-ECU material

Official PTF guidance [2]:
- Errors right after Flash Now.
- Connection dropping mid-session.
- Failure before 2 percent, or an extended diagnostic session error, which points to something blocking the car.
- Failure partway through.
- Low or unstable battery voltage, especially on a car that sat.

Recommended steps [2]:
1. Check the link is stable.
2. Retry with the "FLASH FULL AND UNLOCK - Diag Only" option, which attempts a full flash.
3. Turn off firewall, Windows Defender and antivirus.
4. Disconnect or bypass piggyback tuners (JB4, Dinan-type), exhaust valve controllers on the OBD wires, and OBD-reading gauges.
5. Stabilise battery: drive about 20 minutes or use a 20 to 50 amp supply; 2 to 6 amp trickle chargers are called inadequate.
6. Open a support ticket.

The key behavioural lesson: most failures are environmental (power, link, interference), and the vendor assumes a retry is safe.

Stories of actual bricks: none opened. The forum threads that came up in search (Supra forum posts about a flash failing at 2 percent and a dealer question about replacing a bricked unit) all returned HTTP 403 when I tried to read them. What I know from them is only from a search summary (unfetched): a user whose flash failed at 2 percent after a Femto unlock was told by support it was likely WiFi or BM3-side, and was advised not to flash back to stock.

Two bricked-ECU pages I did open are about other platforms and are included only as general background on recovery behaviour:
- A tuning-academy thread about a K-TAG boot-mode recovery shows that a corrupt flash can leave the computer stuck in bootloader mode, and that rewriting the bootloader separately from the calibration was suggested. No confirmed fix [15].
- A Tacoma thread shows owners bricking while flashing back to stock with a different tool, blaming bad files and no battery tender, and recovering by bench flashing, or by buying a used computer for about $170 to $175 [16].
- A general note from a search summary says some ECUs have recovery modes and others need a bench read/write (unfetched).

I can say: bench recovery exists as an industry practice. I cannot say how often BM3 users need it.

### 11. Pricing and business model

- License: $595 (US) for B58 [12] and for the multi-engine listing [20]. Other listings (unfetched) put S63TU4 and N63T2 at $895, and UK prices at roughly 478 to 784 pounds ex VAT.
- UK N55 listing: 457.69 pounds [19]. S58 listing on a UK site: USD 549.67 ex VAT, $745.82 "fully fitted" [18]. Currencies differ by seller, which makes these hard to compare.
- Included: one OTS map. A full OTS bundle and custom tunes are optional [12][18]. One comparison puts bundle prices at about $50 to $150 by engine [6] (single source).
- MHD comparison: BM3 around $645 all-in for a B58 owner who wants to flash, log and try several maps, versus about $555 to $560 for MHD (search summary, unfetched); another page says they land within roughly $90 [6].
- Adapter: $99, sold separately [22]. A UK reseller says a free ENET cable ships with each license bought there [7].
- Stage 1 or 2 tunes from a different tuner shop: $500 each (Cedar), with unlocks priced separately [17]. That page did not mention BM3 by name, so it shows the going rate for dealer-style tunes, not BM3 pricing.
- Custom tune pricing is set by each tuner and is not on any page I opened.
- Revenue streams, as inferred: license sales, OTS bundles, tuner-directory commissions (not documented), adapter hardware, retailer channel. The retailer channel carries the legal disclaimers [20][22].
- Retail sales on one page are "all final" [20]; special-order BM3 items were non-returnable with a 20 percent fee on another [19].

### 12. Legal, warranty and emissions

- PTF's FAQ says tuning may let a dealer refuse or void the drivetrain portion of the warranty, and that many dealers are tolerant [1][13].
- Retailer checkout notices require acknowledgment of off-road or competition use and emissions compliance [22]. Another seller says items may void warranty and may not be legal on public roads [20].
- App Store disclaimer: closed-course competition use, may affect warranty [8].
- I could not open any official legal source. EPA, FTC and SEMA URLs I tried returned 404, and the search budget ran out before I could discover correct ones. So: no claim in this doc about specific enforcement actions, state rules, or the RPM Act is supported by a page I read. That is a real hole.
- The Wikipedia page confirms in general that remapping changes timing, fuelling and boost, can cause engine damage if done badly, and makes the engine more sensitive to fuel quality [21].

### 13. Community sentiment

- Direct forum reading failed: Bimmerpost, Supra MKV and similar returned HTTP 403 for every thread. Reddit was never reachable because the search budget ran out first.
- From the comparison pages (seller-written): owner reports are "mixed for both"; BM3 complaints include app freezes while logging, MHD complaints include losing communication mid-flash [6] (single source). Tuner availability often decides the choice [6].
- A search summary quoted forum members on both sides: one preferring BM3 for CustomROM features, another saying MHD is cheaper and easier (unfetched).
- App Store: 4.6 of 5, 10 ratings [8]. Too few to mean anything.
- So there is no statistically useful sentiment evidence in this run.

### 14. Competitors and neighbours

- MHD: modular pricing, a per-engine flasher license of about $120 to $370, covers N54 and E-chassis N55, B58, S55, S58, N13, S63; stores logs locally; some features like anti-lag and flex fuel limited on the first-generation B58 [6][7] (single source for each).
- JB4: piggyback; leaves the factory computer stock. Older back-end-flash setups paired it with MHD (search summary, unfetched) [1].
- xHP: gearbox-only tuner that shares adapters with BM3; a search snippet says ENET is limited for G-series 8HP unlocks and that iOS cannot flash via USB (unfetched).
- EcuTek and vFTuner appear in recovery pages as examples of other platforms [15][16].
- Both BM3 and MHD work with third-party apps xHP, Bimmercode and Bimmergeeks Protool [7].

---

## Evidence quality and disagreements

Honest volume: 22 pages with usable content. Target was 35 to 50. Why short:
- The web search tool hit its shared limit of 200 calls after only a handful of my searches, so I could not discover more pages. No more searches were possible.
- Forum hosts (Bimmerpost, Supra MKV, Bimmerfest and similar) returned HTTP 403 for every fetch. Several official help pages and the main vendor site returned 403 or empty pages (script-rendered).
- Several shop pages returned 429 (rate limiting).

Source mix of what I did read: 3 official vendor pages [1][2][3] plus 3 more vendor-run pages [5][13][14] and the App Store listing [8]. Everything else is retailers, or reseller blogs, with two non-BM3 forum pages and one Wikipedia article. That is not enough independent evidence, and it leans heavily on parties who sell the product.

Disagreements and weak spots:
- Which cars need a bench unlock: one seller says OBD unlock on some 2016 to 2020 and bench on 2021+ [6], another says post-June-2020 for all tuners [11], a third says 2019+ G-series may need bench [18]. They overlap but do not agree. Single-source each.
- Price all-in for BM3 versus MHD: about $90 apart [6] versus about $90 apart in a different framing (search summary). Consistent, but all from sellers.
- Role of the OBD Agent: required for the wired path [3] but only needed for live features, not flashing [13].
- BM3 coverage of S58: listed as an engine [20], but the S58 retailer page shows B58 cars [18].
- OTS bundle price: about $50 to $150 [6] against $150 per map in older listings (unfetched).
- Anything about flash counters or map credits: unknown, conflicting at best.
- No independent measurement of any horsepower claim.
- Safety claims (conservative limits, factory failsafes kept) are vendor or reseller assertions [1][9].
- Single-source flags: unlock cost range [6]; MHD feature limits [7]; license-transfer comparison [6]; tuner pricing [17]; BM3 app freeze complaint [6].

---

## Implications for OpenDiag

Scope guardrails first. OpenDiag is Apache-2.0 and must not ship or fetch OEM calibration data, seed-key material, or unlock methods. BM3 shows the market wants flashing, but the legal and bricking risk is highest there. My read of this evidence:

### What to build
1. **Diagnostics, logging and coding first.** BM3 users also run BimmerCode and similar apps through the same adapter [5][22]. A free logger and coder is a gap OpenDiag can fill without touching write-to-engine-computer territory.
2. **Datalogging that matches BM3 expectations.** Many channels available, tens logged at once, cloud-free by default, charting with math channels and log comparison [8][20]. Make logs portable (open format) so users can move between tools. BM3 and MHD keep logs in their own stores [6].
3. **A transport layer that treats link type as a first-class risk.** Flash failures cluster around unstable links, battery voltage and interfering devices [2]. Even for read-only features, show battery voltage, link quality, and warn on interference.
4. **Safety behaviours copied from BM3's changelog.** Stop an operation if the bridge disconnects [8]. Pre-checks for battery and for known interfering devices (piggyback boxes, gauges) [2].
5. **Adapter compatibility matrix, tested by us.** The vendor lists tested third-party apps but never an OBDLink CX [5][22]. Build and publish a table of which adapters work for what (read, log, code), from our own tests on the owner's BLE and WiFi adapters.
6. **Restore-to-stock and backup as a design principle.** BM3 backs up stock on activation and makes return-to-stock mandatory for transfers [1][13]. Any future write feature needs a verified backup first.

### What to avoid
- Any feature that writes engine or transmission calibrations until backup, recovery and legal review exist. The recovery pages show bench recovery is slow, costly, and sometimes fails [15][16].
- Any unlock tooling. Unlocks are the costliest, riskiest part of the BM3 journey [6][11], and the vendors treat it as a controlled service. This is not a gap to fill.
- Shipping or linking to OEM files or crack tools (project rule).
- Making health, performance or "safe" claims. The BM3 ecosystem leans on unverifiable marketing numbers [9][12].
- Cloud lock-in. BM3 is cloud-heavy by design [1][7]; OpenDiag's advantage is local and open.

### What to measure
- Adapter success rate by transport (BLE, WiFi, ENET) on read, log and coding, on the owner's cars.
- Logging reliability: dropped frames, channel counts and rate, app stability over a 30 minute drive.
- Time-to-first-log on a fresh install.
- Voltage and link-quality at start and end of every session.
- Support burden proxy: how many failures trace to the same causes BM3 lists (power, link, interference) [2].

---

## Open questions

1. Does the OBDLink CX (BLE) or MX+ work for BM3 logging, flashing, or neither? No page answered. Ask BM3 support or test on a car.
2. Does BM3 impose map credits, flash counts or dealer-visible counters? Not on any page I read.
3. What actual brick rate does BM3 have? Needs real forum and Reddit sampling (blocked this run).
4. Exactly which cars need bench unlock versus OBD unlock for each engine and build date? Sellers disagree.
5. What is the current state of S58 and Gen2 B58 CustomROM, and did the March 2023 promise ship [14]?
6. Legal landscape: EPA enforcement against tuners, state emissions rules, the RPM Act, FTC warranty rules. Need primary sources I could not open.
7. Whether tuner-directory revenue is split and how. Not documented in what I read.
8. How BM3 and MHD sentiment compares across 2023 to 2026 forum threads. Needs a second pass.
9. Whether the "no data collected" App Store privacy label is accurate for a cloud product [8].
10. Reliable technical sources for how BM3 reads and writes at the protocol level, without touching proprietary or circumvention material. Conference talks and academic papers were not reached this run.

Recommended follow-up: rerun with a fresh search budget, and use a fetch route that can read Bimmerpost, Reddit and the Atlassian help pages. Until then, this document should be treated as a vendor-and-retailer view with thin independent support.

---

## Source ledger

All rows were fetched and read (22). Reliability is about how far to trust the claims for our purpose.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| 1 | https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/461476 | Official FAQ | Cloud platform, one license per VIN, one-time transfer, stock restore, warranty note, OBD Agent | high |
| 2 | https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/572456961/bootmod3+Flash+Failure+Troubleshooting+DME+TCU+Online+Recode | Official support page | Failure modes and recovery steps; battery, firewall, piggyback advice | high (page was truncated) |
| 3 | https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/461596/How+to+install+bootmod3+on+your+vehicle | Official support page | Wireless and wired workflows, 3 minute first flash | high (truncated; no unlock detail) |
| 4 | https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/567738370/Troubleshooting+articles | Official index | Only two article titles were visible | low (little content) |
| 5 | https://checkout.bootmod3.com/blogs/news/new-product-release-bootmod3-wireless-obdii-enet-canbus-adapter | Vendor blog | Adapter versions V3 and V2A, third-party app support, OTA updates | med |
| 6 | https://onefastshop.com/blogs/blog/bootmod3-vs-mhd-bmw-flash-tuning-platform-comparison | Retailer blog | Engine coverage, price ranges, unlock tiers, owner complaints | med-low (seller view) |
| 7 | https://www.mlperformance.co.uk/blogs/ml-performance-blog/bm3-vs-mhd-which-is-better | Retailer blog | BM3 vs MHD features, maker named Protuning Freaks, free ENET offer | low |
| 8 | https://apps.apple.com/pl/app/bootmod3/id1170348811 | App Store listing | Features, version history, ratings, supported computers, disclaimers | med-high for features, low for sentiment (10 ratings) |
| 9 | https://x-ph.com/blog/unlocking-your-bmws-potential-the-ultimate-guide-to-bootmod3 | Shop blog | Stages, example gains, $595 price, CustomROM, risks | low (promotional) |
| 10 | https://manjiusa.com/blogs/news/mhd-vs-bootmod3-a-comprehensive-comparison-for-bmw-tuning-enthusiasts | Retailer blog | Very general comparison; no prices or engines | low |
| 11 | https://m-techperformance.com/pages/mhd-vs-bootmod3-the-ultimate-bmw-tuning-software-showdown-2025 | Retailer page | Femto unlock claim for post-June-2020, Rev2 and CustomROM V2 | low-med |
| 12 | https://ffperformance.co/product/bootmod3-bmw-b58-tune/ | Retailer product page | $595, B58 car list, stage claims, one OTS map included | med |
| 13 | https://checkout.bootmod3.com/pages/bootmod3-faq | Vendor FAQ (shop) | Transfer rules, warranty, OBD Agent role | high |
| 14 | https://checkout.bootmod3.com/blogs/news | Vendor news archive | CustomROM releases, connectivity tips, adapter news | med-high (page 1 only) |
| 15 | https://www.hpacademy.com/forum/reflashing/show/bricked-ecu-recovery/ | Forum thread (not BM3) | Corrupt flash leaving a computer in bootloader mode; recovery attempts | low (other platform, no outcome) |
| 16 | https://www.tacomaworld.com/posts/29363614 | Forum thread (not BM3) | Bricks while returning to stock; bench flashing; used-ECU cost | low (other platform) |
| 17 | https://cedar-performance.com/?p=10985 | Tuning shop page | $500 stages; unlocks priced separately; no BM3 detail | low |
| 18 | https://pumaspeed.co.uk/product-Pro-Tuning-Freaks-BOOTMOD3-BMW-Tuning-License-BM3-for-S58_21129.jsp | Retailer product page | Prices, bench-unlock note for 2019+ G-series, S58 mismatch | med-low |
| 19 | https://hazmotorsport.co.uk/products/protuning-freaks-bootmod3-n55-m135i-m235i-335i-435i-535i-640i-x3-x5-x6-m2-m40i | Retailer product page | N55 car list, price, return terms | med-low |
| 20 | https://bmwmpower247.com/products/bootmod3-tune | Retailer product page | $595, engine list, logging channel counts, legal disclaimers | med |
| 21 | https://en.wikipedia.org/wiki/Chip_tuning | Encyclopedia | General remapping behaviour and risks | med |
| 22 | https://www.kiesmotorsports.com/products/bootmod3-wireless-obd-wifi-flash-adapter-copy | Retailer product page | $99 adapter, features, third-party app list, small reviews, compliance notice | med |

Pages tried and failed (not counted): bootmod3.com FAQ and Get Started and Download and News (403), the Connectivity news post (403), the "world's first F-series" announcement (403), the xHP supported-hardware page (not found after redirect), six more official Atlassian help pages (returned empty), Bimmerpost threads (403), Supra MKV threads (403), Turner Motorsport pages (403), EcuTek recovery page (empty), the Audizine thread (403), the MHD-vs-BM3 PDF (connection reset), and several retailer pages that returned 429 or a rate-limit safety block (Uro Tuning, M-Tech S55, CenCal Supra, TMC, Harry's Euro). EPA, FTC, SEMA and Google Play URLs I tried returned 404.
