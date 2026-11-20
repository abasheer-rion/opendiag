# Other BMW tuning ecosystems: MHD, JB4, xHP, Dinan, Alpina, EcuTek (vs bootmod3)

Status: partial. 19 pages were actually read, below the 35-page target. The search budget for the run was used up after a first round of 8 searches. Many retailer and forum pages then returned 403 or 429 errors. Every claim below carries a ledger number. Claims that rest only on search-result snippets are marked "S-" and listed separately, because those pages were never opened.

## Summary

1. **Two technologies exist.** Flash tools rewrite the engine computer (MHD, bootmod3, EcuTek, Dinan software). Piggyback tools sit between the sensors and the computer and leave its software alone (JB4). [L9, L10, L11]
2. **MHD and bootmod3 overlap on the engines this owner cares about.** Both cover F/G-chassis N55, S55, B58, S58. MHD also covers N54 and E-chassis N55. bootmod3 also covers four-cylinders (B46, B48, N20, N26) and has no N54. [L1]
3. **Pricing differs in shape, not just size.** bootmod3 is one license (about $595) with maps extra. MHD sells a flasher license per engine (about $100 to $370) plus separate map packs, logging, and a "Super" bundle. Prices come from retailers and are dated. [L1, L5, L12, L13]
4. **The feature set is nearly the same.** Both advertise four map slots on the steering-wheel cruise buttons, flex fuel, anti-lag, burbles, speed-limiter removal, and logging. Counts differ by source (MHD "80+ channels", bootmod3 "up to 40 channels"). [L1, L5, L13]
5. **Premium flashes need an unlock first.** Newer cars (roughly 2019+ software) need a DME unlock, sometimes a bench job by mail. One retailer quotes $800 to $1,600 in the US. One source says S58 cars built after June 2020 were not flashable at that listing's date. [L1, L5, L13]
6. **Every vendor tells users to fear dealers.** bootmod3 says tuning may lead a dealer to refuse the drivetrain warranty. It also says "back to stock" using any other tool will not be accepted for its license transfer. [L8, L1]
7. **"Undetectable" is contested.** A piggyback article says the JB4 should not be detectable on the engine computer. Forum snippets say flash counters and a tune flag are visible to dealers and the flag cannot be cleared. No BMW statement was found. [L11, S2, S3]
8. **Backups are a basic safety feature everywhere.** MHD and bootmod3 save the stock file before the first flash. One MHD guide author says to back up in-app and use a battery charger. [L1, L12]
9. **xHP is a different product.** It tunes the gearbox computer (ZF 6HP, 8HP, some DCT and Aisin), not the engine. Retailers tell engine-tune buyers to add it. [L3, L4, L5, L16]
10. **Dinan and EcuTek lean on tuner or dealer installs.** Dinan sells warranty tiers (lifetime software warranty, or a 4-year/50k-mile "factory matching" tier). EcuTek needs a separate tune and an installer. Both are search-snippet or retailer-sourced. [L6, S1]

## What I found

### 1. How the technologies differ

**Flash tools** write new software into the engine computer through the diagnostic port. MHD describes itself as an app plus a Wi-Fi adapter or cable that flashes maps and logs data [L17]. bootmod3 is described by a retailer as a cloud-based flash platform with map editor and logging, needing an ENET cable or its own adapter [L13]. A UK retailer says BM3 relies more on the cloud and MHD less so, which makes quick edits on the go easier [L2]. That is a retailer's view and single-source.

**Piggyback (JB4)** changes the sensor signals before the stock computer sees them. The dsport test describes unplugging two sensor connectors, plugging the JB4 in between, and running a cable to the OBD port. The unit intercepts boost-pressure signals so the stock computer raises boost in response [L11]. The test claims it does not change computer maps and so should not be detectable there [L11]. That is the reviewer's claim, not verified by any test I could read.

**Back-end flash (JB4 plus MHD).** One MHD blogger says he runs JB4 together with MHD back-end flashes and that JB4 adds roughly $500 to $600 [L12]. This matches a search snippet from a Supra forum saying MHD was often used with JB4 as a back-end flash [S4]. The mechanism is not explained in any page I read. Single-source in full.

**Transmission tuning (xHP).** xAutomotive's own app listing says it tunes ZF 6HP, ZF 8HP and 7-speed DCT, mainly BMW, MINI and Alpina cars [L4]. Its support page says it covers BMWs with those gearboxes, the Toyota Supra (J29), and some first-generation Aisin MINIs and BMWs [L3]. It does not support second-generation 8HP Aisin or 7-speed DCT in the MINI and Aisin group [L3]. The two xAutomotive pages disagree slightly on breadth (one says BMW, MINI and Alpina; one adds Toyota Supra). They are the same vendor, so I treat this as a scope difference, not a conflict.

### 2. Supported cars and engines

| Tool | Engines covered (per sources read) | Not covered | Source |
|---|---|---|---|
| bootmod3 | F/G N55, S55, B58, S58, GR Supra; B46, B48, N20, N26; N13; S63/N63 TU; many MINIs | N54; E-chassis | L1 |
| MHD | N54; E-chassis N55 (2011 to 2013); F/G N55, B58, S55, S58; N13; S63 | B46, B48, N20, N26; N63 | L1, L12 |
| JB4 | B58, S58, N54, N55, S55, N63, B48 plus Supra, VW/Audi, Ford, Hyundai/Kia and more | n/a | L10, L15 |
| EcuTek | N55 F-series, B58 gens 1 and 2, S55, S58, GR Supra | not stated | L6 |
| xHP | BMW ZF 6HP/8HP, DCT, some Aisin MINI/BMW, Supra J29 | GM automatics, other brands | L3 |

Disagreements:
- The MLP retailer says MHD is "designed for N54 and N55" yet supports a broad range, so its coverage claim is unclear [L2]. The one-fast-shop page and the Speed Logic page both list B58 and S58 for MHD [L1, L5], so I trust those.
- MHD's S58 listing includes M2 G87, M3 G80, M4 G82/83, X3 M, X4 M [L5]. A BM3 retailer page says G80/G82 need a "Femto" unlock and that cars with a production date after June 2020 were "not flashable" at that listing [L13]. The two are about different tools and dates, so no conflict, but it shows support is a moving target.

### 3. Pricing (retailer-quoted, dated, use as ranges)

| Tool | What was quoted | Source |
|---|---|---|
| bootmod3 | About $595 base license including one paid map; bundles of maps $50 to $150; adapter extra. S58 tune listed at US$595 | L1, L13 |
| MHD | Flasher license per engine: about $120 (N54) to $370 (S63); map packs, monitor license, and Super License sold separately (about $370 to $750) | L1 |
| MHD (alt) | Licenses: N54 $99, N55 E-series $199, N55 F/S55/B58/N13 $249; map packs $49 (E) or $99 (F/G). Page last updated 2024 | L12 |
| MHD (installed at shop) | $600 for B58, S55, S58, Supra; $800 for S63; $400 for N54 and E-series N55; adapter +$100 | L5 |
| MHD adapter | MHD wireless adapter about $100 (retailer) | L5 |
| JB4 B58 | $599 (page); an older test cites $429 for another platform plus $140 phone kit | L10, L11 |
| xHP | Combo license (retailer) quoted as 229.99 euro in search results; not fetched | S5 |
| Dinan S58 Stage 1 software | Suggested retail $649.95; Dinan+ tier $1,399.95 to $1,699.95 at retailers; B58 Dinan+ about $1,200 | S1 |
| EcuTek | No official price found. License alone does not include a tune [L6] | L6 |

Conflicts: MHD prices differ widely between the one-fast-shop page (roughly $120 to $370, with a $560 Super License for a B58) [L1] and the 2024 blog ($249 B58) [L12]. The shop page adds map packs and logging licenses on top. I cannot resolve which is current without MHD's own store, which I could not load. MHD bills in euros, so US prices move with exchange rates [L1].

### 4. Features users and vendors highlight

- **Map switching.** bootmod3 advertises up to four slots switched with cruise-control buttons on supported engines [L1, L13]. MHD's CustomROM advertises four switchable maps per slot from the cruise buttons [L5]. EcuTek advertises four-way mode switching (Track, Fast Road, E85, Economy) via its app [L6]. JB4 uses numbered maps and a phone app. A B58 listing shows Map 0 stock, Maps 1 to 3 as +3 to +6 psi tiers, Map 7 water-methanol, Map 8 valet [L10].
- **Flex fuel.** bootmod3 supports it on N55, S55, B58, S58 with an ethanol sensor [L1]. MHD supports it from 0 to E100 without reflashing [L5]. EcuTek advertises self-adjusting flex fuel with a CAN-bus sensor [L6]. JB4 supports E30 to E85 maps [L10]. All four are vendor claims.
- **Launch control and anti-lag.** The one-fast-shop page does not mention launch control [L1]. MHD advertises anti-lag that builds boost stationary or rolling [L5]. EcuTek advertises one-touch anti-lag and rolling launch with time and temperature settings [L6]. bootmod3 offers anti-lag on supported cars [L1, L13].
- **Burbles and exhaust.** MHD has per-slot burble settings and an overrun "brap" [L5]. EcuTek has adjustable burble from soft to hard [L6]. One-fast-shop says both major platforms offer burbles [L1]. One MHD blogger does not recommend the burble option [L12], which hints it is a user-taste feature, not a safety one.
- **Logging.** MHD advertises 80+ RAM channels [L5]. bootmod3 advertises up to 40 channels logged to the cloud [L1]. These are not like-for-like. JB4 logs through the phone app and can read and clear fault codes [L10, L11].
- **Tuner workflow.** bootmod3 has an in-app tuner directory and request flow, and the map editor is for approved tuners [L1]. MHD tuners work via emailed files; the Super License adds real-time tuning [L1]. MHD's CustomROM map editor is described as having close to 5,000 tables [L5].
- **Niceties.** KnockCEL (flashing the warning light at a tuner-set knock level), TCU limiter removal, and no-lift-shift are listed for MHD [L5]. EcuTek adds Valet Mode and display hijack [L6]. Valet or limited-power modes appear on JB4 and EcuTek [L10, L6]. Valet is a feature OpenDiag can respect conceptually.
- **Cross-product.** One retailer says BM3 works with xHP, BimmerCode and BimmerLink through the same adapter [L2]. The xHP app lists support for xHP Wi-Fi, Thor, and MHD Wi-Fi adapters plus standard ENET and INPA USB cables [L4]. So adapters are shared across tools. That matters for OpenDiag.

### 5. Backups, stock return, and safety

- **Stock file saved first.** One-fast-shop says both major platforms save the stock file before the first flash [L1]. The bmwtuning.co guide recommends backing up the ECU in the MHD app before flashing [L12]. The bootmod3 FAQ does not describe a dedicated backup feature. It only suggests "Save As" on the Stock Tune to keep it intact [L8]. This is a small disagreement: L1 says bootmod3 saves stock automatically; L8 describes it as a manual step.
- **License transfer needs stock.** bootmod3 licenses can move once to a new VIN, only after flashing back to stock and relocking through its own interface. OTS and custom maps do not transfer [L8, L1]. MHD licenses are tied to the account and VIN and cannot transfer [L1]. Another retailer says BM3 includes one-time VIN transfer [L2]. The retailer in L2 and the primary FAQ in L8 agree.
- **Battery and procedure.** A low battery is the commonly cited cause of a corrupted flash. Charger use is advised by both L1 and L12. L12 adds airplane mode, ignition on with engine off, and all loads off. An initial flash can take 15 to 40 minutes [L12]. The xHP app added a low-battery warning before flashing in a 4.7 release [L4].
- **Adapter pitfalls.** Cheap K+DCAN cables are called unreliable [L12]. iOS cannot use standard K+DCAN cables because of Apple's restrictions on third-party USB [L12]. xHP lists connection failure as its worst review complaint, and the developer says only adapters in its manual are supported [L4].
- **Piggyback safety.** The JB4 test says it can back off boost when safety is a concern and that it is not suited to track use [L11]. The vendor page shows five-year warranty on the hardware itself and an off-road/motorsport disclaimer [L10]. Those two statements live on the same page.
- **Unlocks.** Newer cars need a DME unlock before apps can write [L1, L13]. Unlock by mail was quoted $800 to $1,600 in the US [L1]. Speed Logic says some S55, B58 and Supra ECUs need a bench unlock after dealer, recall or OTA updates [L5, L6]. The one-fast-shop page says dealer software updates can block bootmod3 activation until support is added [L1].

### 6. Reliability and warranty

- **Owner-reported failures are mixed.** Some owners report long trouble-free use on both platforms. Others report app freezes during logging, DME communication loss mid-flash, slow cold starts, and flash errors on bootmod3, with MHD working first try [L1]. This is one aggregated page; I could not read the underlying threads (blocked). Treat it as anecdote.
- **Post-flash dash warnings** (oil, tire pressure, driver assist, battery) are said to be common and usually clear after a few drives. A persistent check-engine light is not normal [L1].
- **Dealer detection.** One-fast-shop warns that a flash is detectable and BMW may deny engine claims [L1]. The bootmod3 FAQ says tuning may lead a dealer to refuse or void the drivetrain warranty, and also says many dealers are tolerant [L8]. Search snippets of a Reddit thread and Bimmerpost threads say: flash counters rise with any coding or dealer flash, a high count is the giveaway, and the tune flag cannot be removed [S2, S3]. A third snippet claims a CPO buyer's dealer could not find a tune [S3]. These conflict, and none cite BMW. I never opened the forum pages, so the exact wording is unverified.
- **TD1 flag.** I found no page that defines "TD1" as an exact BMW field. The search snippets use "tuning flag" and "flash counter". Treat TD1 as an unverified forum term until read in a primary thread. Open question.
- **Vendor warranty terms.** Dinan sells a limited lifetime software warranty on Stage 1 and a "Dinan+" 4-year/50k-mile factory-matching tier that can cover consequential damage [S1]. JB4 listing shows a five-year product warranty [L10]. bootmod3 links warranty to its own support page and notes tuning may void parts of the factory warranty [L13, L8].

### 7. Dinan, Alpina, EcuTek specifics

- **Dinan.** Only search snippets. Software tunes are flashes (some tuned via shop, some require sending the DME). Listed pricing: S58 Stage 1 suggested $649.95; Dinan+ more [S1]. A power control unit (hardware) exists for S58, with a standard 2-year or 4-year/50k tier [S1]. Dinan's own pages returned 403, so none of this was read first-hand.
- **Alpina.** I found no official Alpina or BMW Alpina software information. Search returned only third-party chip-tuning file shops, which I did not treat as evidence. xHP's app listing mentions Alpina cars as a target, which is the only Alpina link I confirmed [L4]. Alpina remains an unanswered branch for this topic.
- **EcuTek.** Its Supra support page says RaceROM is a package of software features installed in the ECU, with sections on map switching, per-gear limits, burble control, valet mode, vehicle speed override, and app integration [L7]. A shop page says a tune is separate from the license and that some ECUs need a bench unlock [L6]. Prices were not found (S-listing mentions 2020 beta prices of $350 and $595, unreliable) [S6]. EcuTek's tuning guide page loaded only a header, so I cannot report its safety advice [L18].

### 8. xHP in more detail

- Stages 1 to 3 are described by a remap shop: Stage 1 sportier shift points and a 1000 Nm torque limit; Stage 2 about 25% faster upshifts; Stage 3 faster still, blipped downshifts, true manual mode [L16]. No prices on that page.
- The xHP iOS listing is free, rated 4.9 from about 2.8K ratings, supports iPhone, iPad and Apple-silicon Mac, and lists custom functions like Trans-Brake and Torque Punch [L4]. Reviewers praise ease of use and flash times of seconds for setting changes [L4]. One complaint alleged a refund dispute; the developer replied that only adapters in its manual are supported [L4]. Single review, single reply.
- Retailers recommend an xHP tune alongside engine tunes on ZF automatics [L5, L6].

### 9. What users appear to value most

This is inferred from what vendors and reviewers emphasise, not from a survey.
1. Easy install and ability to undo (JB4 "not VIN locked", MHD "easy to install and uninstall") [L10, L12].
2. Map switching on the fly, including a valet or stock option [L5, L10].
3. Logging and gauges in the phone [L5, L10, L11].
4. A good tuner or OTS map per fuel (91, 93, E30, E85) [L13, L10].
5. Price and licensing rules (transferable or not) [L1, L8].
6. Fear of warranty trouble, shown by how often every vendor talks about it [L1, L8, S2].

## Evidence quality and disagreements

- **Mostly retailers.** Of 19 pages, 11 are retailer, blog, or marketing pages [L1, L2, L5, L6, L9, L10, L12 to L15]. Only 4 are primary (xAutomotive support page, xHP app store listing, bootmod3 FAQ, EcuTek support pages) [L3, L4, L7, L8]. Reliability is therefore medium at best.
- **Forum threads were not read.** Bimmerpost, SupraMKV, Reddit mirrors, and the MHD and bootmod3 wiki pages returned 403, empty content, or a TLS error. That is the biggest gap. Statements about detection and reliability rest on search snippets (S-rows) and one aggregator page [L1].
- **Single-source claims** are flagged inline: the back-end flash mechanism, JB4 undetectability, EcuTek launch features (one shop), xHP review complaint.
- **Conflicts found.**
  - Backup: automatic on both (L1) versus manual Save As (L8).
  - MHD price: $120 to $370 by engine (L1) versus $99 to $249 (L12) versus $400 to $800 installed (L5). Different dates and what is bundled.
  - Detectability: "not detectable on the computer" (L11) versus "flash is detectable" (L1) versus snippet claims of flag permanence (S2).
  - MHD scope: "designed for N54/N55" (L2) versus covers B58/S58 (L1, L5).
- **Dates.** Several price pages are dated 2024 or earlier. Today is 2026-11-20. Treat all prices as stale.
- **Search budget.** The search tool refused further queries after 8. Several planned sub-questions were therefore never searched (JB4 vs BM3 forum comparisons, DME unlock cost threads, Alpina official info, MHD wiki).

## Implications for OpenDiag

**Build**
1. **Read-only first.** The most valuable low-risk features seen are logging, gauges, and fault-code read and clear. JB4 users value exactly these and they need no flashing [L10, L11]. Log in an open format (CSV) so users can compare with MHD and bootmod3 logs.
2. **Adapter-friendly.** Adapters are shared across tools: MHD Wi-Fi, ENET, K+DCAN [L4, L12]. Support the owner's OBDLink CX (BLE) and WiFi ENET and document which adapters work, as xHP does in its manual [L4].
3. **Pre-flight checks as a feature.** Show battery voltage, charger reminder, airplane mode, ignition state before any risky operation. Vendors repeat this as the top safety rule [L1, L12]. xHP already added a low-battery warning [L4].
4. **Stock backup and a plain "what's in my car" report.** A saved copy of coding and module data before any write is the one thing every vendor agrees on [L1, L12]. Show flash counters read-only if the car exposes them, with a plain note that detection is unverified.
5. **Coexistence.** Many owners run an engine tune, a gearbox tune and coding on one adapter [L2, L5]. OpenDiag should not fight these. Detect and warn that a tune is present instead of overwriting it.

**Avoid**
1. **Do not build engine flashing, unlock tools, or tune editing.** It is where all the risk, cost, and warranty exposure sits [L1, L8], and it overlaps with paid, established vendors. It would also raise legal questions (off-road disclaimers appear on JB4 pages [L10]).
2. **Do not promise "undetectable" or "back to stock hides it".** The evidence is contested and unsupported by BMW [L1, L8, S2].
3. **Do not copy proprietary map or unlock material.** Stay at the architectural level.
4. **Do not claim anti-lag, launch control, or flex fuel support.** They are paid tuner features and carry real engine risk [L5, L6].

**Measure**
- Share of beta users who also run MHD, bootmod3, JB4 or xHP (so we know coexistence matters).
- Adapter connection success rate by adapter, since connection failure is the top xHP complaint [L4].
- Number of users who save a backup before their first write.
- Time to first successful read-only session on a car already tuned.

## Open questions

1. What exactly do BMW dealer tools show after a flash (counter, flag, software ID), and does flashing back to stock clear it? Needs primary threads or a dealer statement.
2. Is "TD1" a real field name? No primary source seen.
3. Current MHD and bootmod3 prices, and whether MHD has dropped the per-engine license model. Needs the vendors' own stores.
4. How does JB4 back-end flash work with MHD in practice, and is it disclosed to BMW?
5. What Alpina software exists officially, and does it share ECU hardware with BMW's?
6. EcuTek and Dinan: current prices, return-to-stock procedure, install requirements. Dinan and EcuTek core pages returned 403.
7. Failure rates: how often do flashes brick modules, and how are they recovered? No data found.
8. Which unlock methods are legally and safely available, and who bears the risk? Out of scope to describe, but worth a policy decision.

## Source ledger

Fetched and read (19 rows). Reliability: high, med, low. "Yield" notes pages that loaded but gave little.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| L1 | https://onefastshop.com/blogs/blog/bootmod3-vs-mhd-bmw-flash-tuning-platform-comparison | Retailer comparison | Engine coverage, prices, features, backups, transfer rules, unlocks, mixed reliability anecdotes, warranty warning | med |
| L2 | https://www.mlperformance.co.uk/blogs/ml-performance-blog/bm3-vs-mhd-which-is-better | Retailer blog | BM3 cloud-heavy vs MHD app-centred; shared adapters; promotional | low |
| L3 | https://xautomotive.atlassian.net/wiki/spaces/NW/pages/1720221742/xHP+-+Supported+Vehicles | Vendor support doc | Supported and unsupported transmissions, how to check support | high |
| L4 | https://apps.apple.com/us/app/xhp-flashtool/id1475112461 | App store listing | Features, adapters, rating, release notes, review complaints | high (listing), med (reviews) |
| L5 | https://speedlogicauto.com/pages/mhd-flash-tune-for-bmws-and-toyota-supra | Installer shop | Installed prices, MHD CustomROM feature list, bench-unlock note | med |
| L6 | https://speedlogicauto.com/pages/ecutek-tuning | Installer shop | EcuTek RaceROM features, supported cars, tune not included | med |
| L7 | https://ecutek.atlassian.net/wiki/spaces/SUPPORT/pages/382468112/B58+A90+Supra+RaceROM+Supplement | Vendor support doc | Only the intro and table of contents loaded (feature section names) | high (low yield) |
| L8 | https://checkout.bootmod3.com/pages/bootmod3-faq | Vendor FAQ | Save As for stock, transfer rules, warranty warning, no other-tool restore | high |
| L9 | https://x-ph.com/blog/burger-motorsports-the-jb4-tuning-system-that-changed-the-game/ | Retailer blog | JB4 features, vs flashing, unsupported gain claims | low |
| L10 | https://x-ph.com/burger-tuning-bms-jb4-for-bmw-gen1-gen2-b58 | Retailer product page | JB4 B58 price, maps list, hardware, 5-year warranty, off-road disclaimer | med |
| L11 | https://dsportmag.com/?p=32051 | Magazine test | JB4 install by sensor Y-harness, dyno on one car, detectability claim, track caveat | med |
| L12 | https://bmwtuning.co/bmw-mhd-tuning-app-n54-n55-s55-b58-n13-flash-tunes/ | Blog guide | MHD prices, adapters, safety steps, backup advice, JB4 plus MHD | low-med |
| L13 | https://www.ctsturbo.com/?p=224391 | Retailer product page | bootmod3 S58 price, features, production-date and unlock limits | med |
| L14 | https://x-ph.com/blog/from-piggyback-to-powerhouse-how-burger-motorsports-changed-modern-turbo-tuning/ | Retailer blog | Burger Motorsports history (2007), marketing claims | low |
| L15 | https://x-ph.com/blog/burger-tuning-at-xph-jb4-power-plugandplay-performance-turbocharged-upgrades/ | Retailer blog | JB4 platform list, features, no figures | low |
| L16 | https://revolverremaps.squarespace.com/xhp-transmission-flash | Remap shop | xHP stage 1 to 3 descriptions | med |
| L17 | https://www.scribd.com/document/669606643/MHD-User-Guide | Scribd copy of guide | Only intro: app, adapter, Android and iOS | low (yield low) |
| L18 | https://ecutek.atlassian.net/wiki/spaces/SUPPORT/pages/170557464/B58+Tuning+Guide | Vendor support doc | Only header loaded: author, Sept 2023 update, 32-minute read | high (no body) |
| L19 | https://www.carscoops.com/?p=2163468 | News homepage | Nothing on Alpina; irrelevant | low (no yield) |

Search-snippet only (opened by search, not fetched; not counted in the 19):

| # | URL | What the snippet said | Reliability |
|---|---|---|---|
| S1 | https://www.dinancars.com/products/software-tuning/ (and NGP/Turner/Kies listings) | Dinan prices and two warranty tiers | low-med |
| S2 | Reddit thread "what bmw sees when you have a tune" (mirror failed with TLS error) | Tune flag cannot be removed; one CPO anecdote | low |
| S3 | https://f80.bimmerpost.com/forums/showthread.php?p=20761257 (403 on fetch) | Flash counters and dealer detection discussion | low |
| S4 | https://www.supramkv.com/goto/post?id=40154 (403 on fetch) | MHD plus JB4 back-end flash; MHD vs bootmod3 vs proTUNING Freaks | low |
| S5 | https://www.xautomotive.com/products/xhp-enduser-combo-flash-license-map-pack (429) | xHP combo about 229.99 euro | low |
| S6 | https://www.supramkv.com/goto/post?id=74929 and related | EcuTek 2020 beta pricing | low |

Pages that failed to load (not counted): MHD wiki page, xHP wiki pages (empty content), Dinan site (403), Turner Motorsport (403), Bimmerpost threads (403), SupraMKV posts (403), EcuTek homepage page (500), Burger Motorsports retailer pages on Shopify hosts (429 after retries), bmptuning, stickerfab, es-performance, cencalmotorsport, NGP, Kies (429), reach.dog (410), bootmod3 wiki (empty).
