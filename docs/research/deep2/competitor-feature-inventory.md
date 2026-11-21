# Competitor feature inventory, pricing and gaps

Prepared for OpenDiag (Apache-2.0, clean-room). Research run date: 2026-11-20. Status: **PARTIAL** (see "Limits of this run" and "Gaps").

## Executive summary

1. Three business models cover the field: pay once per app (BimmerCode, BimmerLink, Torque, OBD Fusion, Car Scanner), pay every year tied to the vendor's own adapter (Carly, OBDeleven), and pay for a pro tablet plus yearly update fees (Autel, Launch, Foxwell). BMW's own tools (ISTA, E-Sys family) are workshop products with paid access, and the legacy toolset (INPA, NCS Expert, Tool32) is free-to-run but gray-market and unsupported.
2. Only **BimmerCode** (BMW, MINI, Supra coding) and **BimmerLink** (BMW diagnostics and service) pair deep BMW coverage with a one-time price ($49.99 and $39.99 on the US App Store). Both accept third-party adapters. [S3, S4, S5] (high)
3. **Carly** and **OBDeleven** are the subscription and credit leaders. Carly's yearly BMW and MINI plan is $63.99 on the US App Store and it needs Carly's own scanner. OBDeleven's Pro plan is $69.99 a year on the same store and it needs OBDeleven's own device. [S6, S9] (high)
4. Complaints cluster on money and trust, not on features: auto-renewing fees (Carly 40% one-star of 17,650 Trustpilot reviews), credits deducted for failed jobs (OBDeleven), and lapsed pro-tool subscriptions (Autel 58% one-star, small sample). [S11, S12, S24] (medium)
5. Nobody free covers all of: BMW coding with a safety net, BMW diagnostics, Mercedes and Toyota in one app, and any adapter. Among the consumer apps compared, Mercedes is sold by Carly ($28.99) and OBDeleven only (pro tablets such as Autel, Launch and Foxwell packs also cover it). Toyota by Carly ($21.99), OBDeleven, Car Scanner and OBD Fusion packs. [S6, S9, S15, S17] (medium)
6. Top gaps a free tool can win: (1) real backup and one-tap restore for every coding write, (2) free BMW diagnostics plus battery registration and service resets, (3) any adapter, no lock-in, (4) honest "what will this do" explanations for every setting, (5) Mercedes and Toyota basics at no cost, (6) offline, no-account, no-credit use. Full ranked list is at the end.
7. Ten of the fifteen tools could only be read through vendor pages, app-store listings and affiliate review sites. Reddit, Bimmerpost and Google Play pages did not load. Treat complaint rankings as directional.

## Limits of this run

- Search and fetch worked, but many primary pages failed. Failures are listed in Gaps. Where a number comes from an affiliate review site or a reseller, I say so and tag it medium or low.
- App-store numbers (ratings, counts, prices) are as seen on 2026-11-20 on the US store unless noted. Counts drift daily. Prices differ by country.
- Several third-party review pages (obdadvisor.com) show two different "updated" dates on one page (a header date of 2026-11-16 and a footer date from March or May 2026). I treat their data as of early 2026 at best.
- Reviews of coding failures are anecdotes. I did not count threads.
- Clean-room: I did not open or request any BMW installer, data pack, or key. Where I describe E-Sys, INPA, NCS Expert and Tool32, I use vendor documentation, a BMW user guide, and community explanations restated in my own words. I did not link to download pages.
- This document goes beyond `docs/research/deep/obd-app-market-and-reviews.md`, which already covers market structure and Trustpilot for Carista, Carly and OBDeleven. I add: store price ladders, per-tool feature matrix, adapter lists, pro-tool update terms, the BMW legacy toolset, and a ranked gap list.

## 1. The fifteen tools at a glance

| # | Tool | What it is | Platforms | Brands in scope | Who sells it | Price shape |
|---|---|---|---|---|---|---|
| 1 | BimmerCode | BMW and MINI coding (FDL, hidden features), plus Toyota Supra | iOS, Android, Windows 10+, macOS 12+ | BMW, MINI, Supra | SG Software GmbH & Co. KG | One-time in-app unlock |
| 2 | BimmerLink | BMW and MINI diagnostics, live data, service functions | iOS, Android, macOS (M1+) | BMW, MINI, Supra | Same developer as BimmerCode | One-time in-app unlock plus CarPlay add-on |
| 3 | Carly | All-in-one scanner app with coding on some brands | iOS, Android | Many brands, coding only on some | Carly Solutions GmbH | Free app, yearly licence per brand, own scanner |
| 4 | OBDeleven | VAG-first coding app with BMW, Toyota, Mercedes, Ford (US) one-click apps | iOS, Android | VAG, BMW, Toyota, Mercedes, Ford US | OBDeleven (Voltasit) | Free, Pro, Ultimate plans plus credits, own device |
| 5 | Autel | Pro tablet scanners (MaxiCOM, MaxiSys, IM) | Own Android tablet plus VCI | Broad, many makes | Autel | Hardware plus yearly update renewal |
| 6 | Foxwell | Mid-range tablets and dongles (NT510, NT710, NT809) | Own device | Broad, brand packs | Foxwell | Hardware, brand pack, some update fees |
| 7 | Launch | X431 and CRP series scanners | Own tablet or phone-paired dongle | Broad | Launch Tech | Hardware plus yearly update renewal |
| 8 | ISTA (ISTA+, ISTA-D, ISTA-P) | BMW factory diagnostic and programming suite | Windows PC | BMW, MINI, Rolls-Royce | BMW Group | Workshop access, paid |
| 9 | E-Sys | BMW coding and flashing for F, G and I series | Windows PC | BMW, MINI (newer) | BMW Group (engineering tool) | Not sold to the public |
| 10 | Tool32 | Low-level EDIABAS job runner | Windows PC | BMW (E and some F) | BMW Group (legacy) | Legacy, not distributed by BMW |
| 11 | INPA | Older BMW diagnostics front end on EDIABAS | Windows PC | BMW E-series | BMW Group (legacy) | Legacy, not distributed by BMW |
| 12 | NCS Expert | Older BMW coding tool on EDIABAS | Windows PC | BMW E-series | BMW Group (legacy) | Legacy, not distributed by BMW |
| 13 | Torque (Pro) | Generic OBD-II gauge app | Android only | Any OBD-II car, plugins for makes | Ian Hawkins (Torque) | One-time, plugins extra |
| 14 | OBD Fusion | Generic OBD-II app with paid make packs | iOS, Android (plus desktop ObdWiz line) | Generic, plus many makes via packs | OBDSoft / OBDLink family | One-time plus per-family packs |
| 15 | Car Scanner ELM OBD2 | Free-first generic app with growing coding | iOS, Android | Generic, plus profiles and some coding | Stanislav Svistunov | Free with ads, Pro unlock |

Confidence: rows 1, 2, 3, 4, 13, 14, 15 are from store listings or vendor pages (high). Rows 5 to 7 combine vendor and reseller text (medium). Rows 9 to 12 combine a BMW guide and community explanations (medium).

## 2. Per-tool detail

### 2.1 BimmerCode

- **What it does.** Codes and configures BMW, MINI and Toyota Supra to switch on hidden features and personal settings. The site shows control-unit overviews for the front electronic module, head unit and cluster. [S1] (high)
- **Platforms.** iOS (iOS 13+), Android, Windows 10+ (MSIX package), macOS 12+ (Intel and Apple chip). [S1, S3] (high). The desktop builds carry version 1.0.0 in their file names, so they are new. (medium)
- **Latest store version seen.** 4.4 with notes: motorcycle TFT support, more ambient lighting options on G-series, extra languages, a fix for a connection failure when the body domain controller does not answer, and fixes for new model selection such as the 5 Series. [S3] (high). The page shows "Apr 28" without a year.
- **Price.** Free download. In-app "Full Version" $49.99 (US). Separate "Full Version Motorcycle" $19.99. Euro stores show 49.99 EUR, Sweden 599 SEK. One-time, not a subscription. [S3] and a price tracker via search (medium). Google Play price not read (gap).
- **Rating.** 4.7 on iOS from about 22K ratings; 4.8 on Android from about 12K ratings, as quoted on the vendor site. [S1, S3] (medium, vendor-quoted)
- **Adapter lock-in.** None to one brand. A published list covers Bluetooth, Wi-Fi and wired types. Highlights: OBDLink CX (the "Made for BimmerCode" label was not seen on the adapters page re-read, so UNVERIFIED), OBDLink MX+, LX, SX and EX, vLinker BM, BM+, MC, MC+, Veepeak OBDCheck BLE and BLE+, UniCarScan, NEXAS NexLink; Wi-Fi ENET types from MHD, bm3, Exctool, BMDiag, KIES and others for F, G and I series; plain ENET cable for F, G and I; DCAN USB cable for E-series. The page warns that not every adapter fits every series. [S5] (high)
- **Safety design.** A third-party review site (which says it is quoting BimmerCode's FAQ; the FAQ itself was not read) says Standard Mode takes automatic backups before a change and Expert Mode gives full parameter access, with the warning that mistakes can disable safety systems or need a dealer reflash. [S33] (low-medium, review site)
- **Vehicle coverage.** The vendor says BMW, MINI and Supra; the store lists models from "5 Series, M5 (2003+)" as the earliest entry up to "iX2 (2024+)", with MINI (2006+) and Supra (2019+); some entries have closed ranges such as 1 Series (2004-2024). Re-checked on 2026-11-20 against the store page. [S1, S3] (high)
- **Update cadence.** Frequent in the store text (many languages, new models). I could not read a dated changelog. (low)
- **Top complaints.** (a) Features seen before purchase missing after purchase, for example front electronic module coding on one car. (b) A G20 owner could not change auto start-stop memory and Air Circulation and said support blamed BMW firmware with no refund. (c) Adapter detection oddities (body domain controller flagged an adapter on an X3; an MHD Wi-Fi unit took many tries on a Supra forum). (d) Slow connection, no landscape on iPad. [search snippets of S3 reviews and a Supra forum thread] (low-medium; individual anecdotes)
- **Limits stated by third parties.** Newer iDrive 8 and 8.5 cars restrict some changes. Some options appear on iOS before Android. [S33] (low-medium)

### 2.2 BimmerLink

- **What it does.** Reads and clears fault codes from every control unit, live values and a custom dashboard, CSV data logging, exhaust flap and Active Sound Design control (factory-fitted cars only), sound tuning on S55 engines, diesel particulate filter regeneration, battery registration, parking brake service mode, service resets, and reset of short-circuit lock. [S2] (high)
- **Vehicle list.** 1 Series from 2004, 2 Series from 2013, 3 Series from 2005, 5 Series from 2003, 7 Series from 2008, X1 from 2009, X5 from 2006, Z4 from 2009, i3 from 2013, i4 from 2021, i5, i7, iX, iX1, iX2, iX3, XM, MINI from 2006, Toyota Supra from 2019. [S2] (high)
- **Price.** Free download. Full version $39.99. CarPlay add-on $9.99. [S4] (high). A review site says an Android Auto add-on at $9.99 also exists (low).
- **Rating.** 4.7 on iOS from about 9.9K ratings. [S4] (high)
- **Latest store version seen.** 5.1.2 (dated "Sep 26", no year shown): better service reset handling for time and distance; fixed adaptive min and max values on the Dashboard. Needs iOS 15+. [S4] (high)
- **Adapter lock-in.** "A supported OBD adapter or cable is required"; the vendor links to the same adapters page as BimmerCode. [S2, S4] (high). A user in a search snippet said BimmerLink would not work with a vLinker MC+ although BimmerCode did, which hints that the two apps differ in adapter handling. (low)
- **Top complaints.** Few documented in what I could read. UI stutter on long sensor lists with the CarPlay add-on was reported by a review site. [S33] (low). A gap: I could not read its Google Play reviews.

### 2.3 Carly

- **What it does.** Free tier: engine and transmission diagnostics, live data, emissions checks. Premium yearly licence: fault codes in all control units, repair guides, guided maintenance and service resets, battery checks, mileage manipulation detection (used-car check), and coding on selected brands and models. A "Smart Mechanic" add-on exists. [S6, S7] (high)
- **Brands.** Listing names Audi, BMW, Ford, Lexus, Mercedes, MINI, Opel, Porsche, Renault, Seat, Skoda, Toyota, VW and other brands with an OBD2 port. The vendor page says BMW, Mercedes, Audi, VW and Porsche get full diagnostics and deep coding. Toyota, Ford, Renault, Fiat and others get core diagnostics, codes and live data. [S6, S7] (high for the list; medium for depth)
- **Price ladder (US App Store, yearly, auto-renewing).** BMW only $59.99; BMW and MINI $63.99; All Brands $82.99; All Brands plus Smart Mechanic $118.99; All Brands Upgrade $78.99; Smart Mechanic $35.99; BMW and MINI plus Smart Mechanic $99.99; VW, Audi, Seat, Skoda $53.99; Mercedes $28.99; Toyota $21.99. [S6] (high)
- **Adapter lock-in.** Hard. The listing says you need the Carly Universal Scanner. Vendor page: scanner is a one-time 64.80 EUR, "keeps working" if you cancel, with lifetime warranty and 14-day return. [S6, S7] (high). A reviewer's US price of about $85 to $99 is low confidence.
- **Free fallback.** Without a subscription the scanner reads basic codes on any OBD2 car. A free limited trial needs no credit card, per vendor. [S7] (medium, marketing)
- **Rating.** 4.6 on iOS from about 9.9K ratings. [S6] (high). Trustpilot 2.6 of 5 from 17,650 reviews (40% five-star, 40% one-star). [S12] (medium)
- **Update cadence.** Version 41.26.110314 dated "Nov 3" (store shows no year). App size 437 MB. [S6] (high). Release note says it merged all brands into one app with a new dashboard. This is the fastest release stream of the group (low confidence on counting).
- **Top complaints.** (a) Hidden or surprising yearly fees; "useless" without subscription. (b) Compatibility gaps: coding works on some cars, not others; BMW feedback mixed. (c) Refunds hard: a partial 20% offer pre-dispatch. (d) Support: AI-only replies and tickets closed early. (e) Slow scans and dropped connections. [S12] (medium). A review site's reader comments add a subscription that stopped working a month after a $130 purchase and automatic renewal without notice. [S13] (low)

### 2.4 OBDeleven

- **What it does.** One-Click Apps (scripted changes), diagnostics, live data, output tests, resets, and on VAG manual coding and a security-unlock for protected cars. On BMW it is diagnostics plus One-Click Apps only, no manual coding. [S10] (medium, vendor-linked)
- **Brands.** VW Group (full), BMW Group, Toyota Group, Ford US-built (needs OBDeleven 3 device), Mercedes-Benz (named on the App Store). Others: basic OBD2 on CAN cars from 2008. [S9, S10] (medium)
- **Plans.** Since July 2025 plans cover all licensed brands, not only VAG, though the features page lagged. [search snippet of official pages] (medium)
- **Price ladder.** App Store US: Pro subscription $69.99; Ultimate $239.99; credits 10 for $3.99, 100 for $29.99, 500 for $90.99; shadowing credit packs $34.99, $139.99, $269.99. [S9] (high). Official euro pages: Pro 12 months 59.99 EUR, Pro 36 months 149.99 EUR, Ultimate 24 months 329.99 EUR. (medium, search snippet of official shop pages). Affiliate review: Pro about $60 a year and Ultimate about $190 a year direct; bundles with device under $200 (Pro) and under $300 (Ultimate); device alone under $100. [S10] (medium)
- **What Pro versus Ultimate means.** Per the affiliate page, the only functional gap is One-Click Apps: Pro pays credits per use (100 credits included in the pack), Ultimate is unlimited. Credits are said to cost about $15 to $18 per 100, but the App Store shows $29.99 per 100. The two numbers disagree. [S9, S10] (conflict; trust the App Store)
- **Adapter lock-in.** Hard. App only works with OBDeleven's own device. A comparison says owning both OBDeleven and BimmerCode needs two adapters. [S9, search of OBDeleven comparison page] (medium)
- **Rating.** App Store (old VAG app) 4.5 from 7.1K. Trustpilot 3.9 from 4,508 reviews (60% five-star, 16% one-star). [S9, S11] (high)
- **Update cadence.** Old-app version 1.9.75 dated Sep 28 (no year); earlier notes mention a Cupra Born connection fix and a credits overview. The main app is separate and I did not read its version. [S9] (medium)
- **Top complaints.** (a) Credits deducted for functions that did not work, or purchases that did not show. (b) One-Click Apps failing on newest cars. (c) Bluetooth instability and a confusing two-app set-up. (d) Features disappearing after updates. (e) Alleged module damage on Mercedes costing over $2,200 (unverified single claim). (f) Slow support replies. (g) Plan price increases and the end of free daily credits per a forum thread. [S11, search snippets] (medium for a to d, low for e to g)

### 2.5 Autel

- **What it is.** A family of Android tablets with a vehicle interface (VCI). Tiers from MaxiCOM MK808 up to MaxiSys Ultra, IM series with key and immobiliser work. [S21] (medium)
- **Update model.** Most units include one year of free updates; some include two (IM608 Pro II Full Kit, IM508S, MS919). [S21] (medium, reseller). After expiry the vendor says the tablet still works and installed software remains, but some vehicles need server access, plus topology, remote expert and newer coverage. [S22] (high for the statement, vendor)
- **Renewal prices (reseller list, currency not stated).** MK808BT 110 (market 150), MX808 80, MS906 395 (market 495), MS908 795, MS909 969, MS919 990, Maxisys Ultra 1,199, IM608 600, IM508 245. Other reseller snippets: MK808BT $88 to $142; MS906BT family $299 to $495. [S21] (medium-low)
- **Coding and BMW.** Vendor materials say coding and programming functions are limited if not renewed because they depend on Autel servers. [S23, Autel reply quoted there] (medium)
- **Rating.** Trustpilot 1.5 of 5 from 127 reviews, 38% five-star, 58% one-star. Profile unclaimed, so it may not represent buyers. [S24] (low-medium)
- **Top complaints.** (a) Renewal costs (one reviewer said $800 to renew; a Porsche forum thread reported about $700 falling to $435 to $495). (b) Coding stopping after the free period, which some say was not disclosed. (c) Slow support and warranty repair. (d) Factory reset removing software; login problems on used tablets; reseller confusion. [S23, S24] (medium)
- **Counter-view.** Other forum owners say an expired MK808 still reads, clears, shows live data and does basic resets. [S23] (medium)

### 2.6 Foxwell

- **What it is.** Lower-priced scanners. The NT510 Elite ships with one brand package (BMW, Toyota, GM, Honda and so on). A second brand needs another one-time pack. [S26] (high, vendor)
- **Update model.** NT510 Elite: "lifetime free updates for supported models" per the vendor; the qualifier matters. NT809 family: reports differ (18 months free, or 3 years free then about $160 a year; NT809TS renewals listed at $180, $300, $420 for 1, 2, 3 years). [S26, S27] (medium-low, retail and affiliate)
- **BMW features.** BMW pack covers BMW, MINI and Rolls-Royce: battery registration, steering angle, transmission resets and module coding on supported models (re-checked on the vendor page); the bi-directional test examples (fans, fuel pump) were not re-confirmed (UNVERIFIED). The vendor also lists "lifetime free updates for supported models" on every NT510 Elite version. [S26] (medium, vendor). A review says the NT809BT does not support coding. [S27] (low)
- **Rating.** Trustpilot 4.5 of 5 from 111 reviews, 78% five-star. Reviews include BMW and MINI success stories. [S25] (medium; sample is small and recent)
- **Complaints.** Hard updates and a dongle that kept disconnecting for two days; learning curve; a screen freeze; a refund dispute. [S25] (low-medium)

### 2.7 Launch

- **What it is.** X431 line and CRP consumer line. Renewals are activated via renewal card or in-tool serial. [S29] (medium)
- **Update model.** Many listings advertise two years free on current models, then a yearly renewal. Reseller prices for a one-year CRP909 renewal seen: about $100 and $152 (different models). Updates are not offered for units sold outside the North American territory (US retailer note). [S29] (low-medium)
- **Rating.** The one Trustpilot page I could read (x431tool.com) is a reseller-like site with 105 reviews, all five-star, not representative. I found no usable independent rating. [S28] (low)
- **Complaints.** Not established from independent sources. Gap.

### 2.8 BMW ISTA (ISTA+, ISTA-D, ISTA-P)

- **What it is.** BMW's factory diagnosis and programming application. In the aftersales online system, ISTA covers fault code diagnosis, test plans, repair instructions (E30 and newer), technical data, wiring diagrams, and P-code lookup. ISTA has built-in programming for F and G series and newer. ISTA/P handles reprogramming of older E-series and MINI R-series. [S30] (high)
- **Access.** Three tech-info sites (BMW, MINI, Rolls-Royce) for the US and Canada, each needing its own account and active subscription. Other regions use aos.bmwgroup.com. AIR gives repair manuals, wiring, parts and labor data. An ECU validation tool and an RDC tool also sit in the portal. [S30] (high)
- **Interface.** BMW's ICOM (A, B, C modules) is the recommended interface. A J2534 pass-thru is allowed with BMW and vendor drivers, but a wireless or Bluetooth link between pass-thru and PC "must not" be used. Programming needs a regulated power supply, and a charger is not the same. [S30] (high)
- **Network.** At least 4 Mbit/s down, a 100 Mbit/s LAN for programming, and low latency to the server in Munich. [S30] (high)
- **Price.** The BMW portal says information is free or for a fee per a price list shown only inside the portal. [S31] (medium). The repo's earlier research found ticket prices from a Castrol page: 9, 30, 100, 350 and 3,575 EUR for hour, day, week, month and year, single source and undated. [S38] (low-medium)
- **Complaints.** Install weight, Windows set-up, speed, adapter mismatches, and per-time pricing for DIY jobs. See `docs/research/deep/bmw-ista-real-world-usage.md`. [S38]

### 2.9 E-Sys

- **What it is.** The engineering tool for coding (vehicle order, module coding data) and flashing on F, G and I series, over a wired ENET link. [S32 and community explanations] (medium)
- **Access.** Not sold to the public. It relies on BMW data packs. I found no BMW statement on legality of copies and I did not search for download pages. Treat any copy as outside the clean-room rule. [S38 for legal context]
- **Who uses it.** Enthusiasts who want exact control. Typical failure modes are in `docs/research/deep/bmw-coding-failures-and-recovery.md`. [S38]

### 2.10 to 2.12 Tool32, INPA, NCS Expert (legacy toolset on EDIABAS)

| Tool | Role (own words) | Cars | Link | Status |
|---|---|---|---|---|
| EDIABAS | Runtime that talks to modules; the other three sit on top of it | E mostly, some F, G | K+DCAN, ENET | Legacy |
| INPA | Reads fault codes, shows live values, runs service functions; can show coding but not change it | E-series | K+DCAN | Legacy, not actively developed |
| NCS Expert | Changes coding by vehicle order and parameters; offers little guidance so mistakes can kill modules | E-series | K+DCAN | Legacy |
| Tool32 | Runs single EDIABAS jobs against one module with no guided steps or safety checks | E, partial F and G | K+DCAN, ENET, ICOM | Legacy; BMW does not distribute it for general service use |

Confidence medium for Tool32 and EDIABAS, low for INPA and NCS Expert. Source: a community documentation repository (no BMW files seen on the page read). On re-check, [S32] describes only Tool32 and EDIABAS (E-series via D-CAN and K-Line, F and G via ENET and ICOM; largely superseded by ISTA/D and E-Sys; BMW does not distribute it for general service). It mentions INPA and NCS Expert only as "see also" links. The INPA and NCS Expert rows above (role, "can show coding but not change it", "little guidance") therefore come from general community knowledge and are UNVERIFIED against a cited page. The claim that ISTA+ covers dealer-side diagnostics and coding is also UNVERIFIED; [S32] says only that ISTA/D and E-Sys superseded Tool32.

### 2.13 Torque (Pro)

- **What it does.** Customizable gauge dashboards, generic live data, DTC read and clear, custom PIDs with alarm thresholds, GPS trip logging, CSV export. Make-specific data via separate third-party plugins (Ford, GM, Toyota, Honda, BMW, VW and others). [S19] (medium)
- **Price.** Torque Pro $4.95 one-time on Google Play, no ads. Plugins reportedly $1 to $3. Torque Lite is free. A separate iOS app named "Torque OBD 2 & Car Pro" lists at $9.99 and is a different product. [S19] and a search snippet (medium)
- **Platform.** Android only for the original. [S19] (medium)
- **Adapter lock-in.** Needs Bluetooth classic (SPP) adapters; BLE adapters do not work. Cheap Vgate BLE variants fail. [S19] (medium)
- **Update cadence.** The review says updates come via Google Play, with no version or date given. I could not load the Play page or the developer site (error). Treat as unknown. (low)
- **Complaints.** Pairing failures if the dongle is not paired in system settings first; Android 14 background limits interrupt sessions; dated interface; long first set-up; no iOS. [S19] (low-medium; affiliate)

### 2.14 OBD Fusion

- **Price.** Base $9.99 one-time (a Finland store page shows 9.99 EUR); enhanced packs about $9.99 per vehicle family (examples: Ford group, Toyota group). [S17, S18] (medium)
- **Features.** Standard OBD2 codes, live data, freeze frame, readiness, O2 tests, Mode 06, gauges, CSV logging, emailed reports, GPS mapping, limited CarPlay and Android Auto (text only). Enhanced modules ABS, SRS, transmission, 4x4, body on listed makes: Ford family, Toyota family, Nissan, Mitsubishi, Chrysler family, partial Fiat and Alfa; no GM enhanced access. [S17] (medium)
- **Platforms.** iOS 15+, Android 6+. Version 6.13.0 (September 2025) per the review. [S17] (medium)
- **Adapter lock-in.** Soft. iOS needs BLE adapters (Veepeak BLE+, OBDLink MX+ and CX, others). Android supports classic, BLE, Wi-Fi, USB. [S17] (medium)
- **Complaints.** Vehicle profile data erased when switching cars (called the most common store complaint, unresolved); no BMW or Mercedes depth; no trial; lag above four gauges. [S17] (low-medium)
- **BMW or Mercedes.** None found. The pack list has no BMW or Mercedes. [S17] (medium)

### 2.15 Car Scanner ELM OBD2

- **Price.** Free with a small banner ad. App Store lists Pro forever $7.99, 1 year $4.99, 6 months $3.99, plus two $6.99 variants. The store says "a one-time purchase or a subscription is required to unlock all features". A review site says Pro removes ads only and adds no features. The two statements conflict. [S14, S15] (conflict, medium)
- **Rating.** 4.8 from about 33K ratings on iOS. [S14] (high)
- **Features.** Dashboard gauges, DTCs with a description database, freeze frame, Mode 06, readiness, custom PIDs, HUD mode, 0-60 timing, trip computer, fuel stats, connection profiles for many makes, VAG coding on MQB, PQ26 and MLB-EVO, Toyota and Lexus coding (CAN, about 2008 on), some Renault and Dacia, and Hyundai and Kia service functions. EV and hybrid battery data on Tesla, Ioniq and Toyota hybrids. [S14, S15, S16] (medium)
- **Adapters.** Any ELM327-compatible. iOS needs BLE or Wi-Fi. Android also takes classic Bluetooth and USB. Developer names OBDLink, Kiwi 3, Vgate, Carista, LELink and Veepeak as good. [S15, S16] (medium)
- **Update cadence.** Version 2.2.52 "4d ago" (updated profile databases, fixes); 2.2.42 dated Nov 5 added dashboard renaming. Frequent. [S14] (high)
- **BMW or Mercedes.** No BMW coding found. Profiles may unlock some modules. [S15] (low)
- **Complaints.** Clone adapters, iOS Bluetooth classic limits, Wi-Fi cutting off internet on iOS, profile results vary by car, coding marked experimental, one user says it stopped connecting after paying. [S15, search of vendor FAQ] (medium)

## 3. Feature-by-tool matrix

Legend: **Y** yes and documented; **P** partial or limited; **N** no; **?** unknown or not established. All entries refer to BMW unless a brand is named. Source codes are in the section above.

### 3.1 Reading and live data

| Feature | BimmerCode | BimmerLink | Carly | OBDeleven | Autel | Foxwell | Launch | ISTA | Torque | OBD Fusion | Car Scanner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Generic OBD-II codes and live data | N | Y | Y | Y | Y | Y | Y | N | Y | Y | Y |
| BMW-specific codes, all modules | N | Y | Y (paid) | Y | Y | Y (BMW pack) | Y | Y | P (plugin) | N | P (profiles) |
| Live data dashboard | N | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| CSV logging | N | Y | ? | ? | Y | ? | ? | ? | Y | Y | Y |
| Freeze frame, readiness, Mode 06 | N | ? | P | ? | Y | Y | Y | N | Y | Y | Y |
| Wiring diagrams, repair guides | N | N | P (guides) | N | P | N | P | Y | N | N | N |

### 3.2 Service and maintenance

| Feature | BimmerCode | BimmerLink | Carly | OBDeleven | Autel | Foxwell | Launch | ISTA | Torque | OBD Fusion | Car Scanner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Service reset, oil, inspection | N | Y | Y (paid) | P (one-click) | Y | Y | Y | Y | N | N | P (some brands) |
| Battery registration | P (coding of specs) | Y | Y (paid) | P | Y | Y | Y | Y | N | N | N |
| Parking brake service mode | N | Y | Y | ? | Y | Y | Y | Y | N | N | N |
| DPF regeneration | N | Y (diesel) | ? | ? | Y | ? | Y | Y | N | N | ? |
| Exhaust flap, ASD control | N | Y | N | P | N | N | N | P | N | N | N |
| Output tests, bi-directional | N | Y (some) | P | Y | Y | Y | Y | Y | N | N | N |

### 3.3 Coding and programming

| Feature | BimmerCode | BimmerLink | Carly | OBDeleven | Autel | Foxwell | Launch | ISTA | E-Sys | NCS Expert | Tool32 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Coding on BMW (hidden features) | Y | N | Y (selected) | P (one-click only) | P (limited) | P (NT510 and NT710 yes, NT809BT reportedly no) | ? | P (service coding) | Y | Y (E) | P |
| Manual parameter editing | Y (Expert mode) | N | P | N (BMW) | ? | ? | ? | N | Y | Y | P (jobs) |
| Automatic backup before write | Y (Standard mode, per review site) | n/a | ? | ? | ? | ? | ? | n/a | N (user does it) | N | N |
| ECU flashing or programming | N | N | N | N | P (some brands, subscription) | P | P | Y | Y | N (WinKFP) | N |
| Guided procedure, safety checks | Y | n/a | Y | Y | Y | Y | Y | Y | N | N | N |

### 3.4 Brands and platforms

| Tool | BMW | MINI | Mercedes | Toyota and Lexus | VAG | Mac | Windows | iOS | Android |
|---|---|---|---|---|---|---|---|---|---|
| BimmerCode | Y | Y | N | Supra only | N | Y | Y | Y | Y |
| BimmerLink | Y | Y | N | Supra only | N | Y | N | Y | Y |
| Carly | Y | Y | Y ($28.99) | Y ($21.99, core only) | Y | N | N | Y | Y |
| OBDeleven | P (one-click) | P | Y (one-click, per store text) | Y | Y | N | N | Y | Y |
| Autel | Y | Y | Y | Y | Y | N | N | tablet | tablet |
| Foxwell | Y (BMW pack) | Y | Pack | Pack | Pack | N | N | tablet | tablet |
| Launch | Y | Y | Y | Y | Y | N | N | tablet | tablet |
| ISTA | Y | Y | N | N | N | N | Y | N | N |
| Torque | P (plugin) | ? | ? | P (plugin) | P (plugin) | N | N | N | Y |
| OBD Fusion | N | N | N | Y (pack) | N | ? | ? | Y | Y |
| Car Scanner | P | P | P | Y (coding on CAN, 2008+) | Y (MQB and more) | Y (M1+) | N | Y | Y |

## 4. Pricing and licence models

### 4.1 Ladder of what a BMW owner pays (list prices seen, not an offer)

| Setup | Upfront | Year 1 | Year 5 total | Notes |
|---|---|---|---|---|
| BimmerCode plus BimmerLink plus OBDLink CX | $49.99 + $39.99 + $79.95 = $169.93 | $169.93 | $169.93 | One-time, adapter reusable on other apps. iOS US prices; Android prices differ. [S3, S4, S20] |
| Carly BMW and MINI plan plus Carly scanner | 64.80 EUR scanner + $63.99 plan | about $135 to $140 at today's exchange (not computed here) | scanner + 5 x $63.99 = $319.95 plus scanner | Prices held flat for illustration. Renewals reported higher by some sources. [S6, S7] |
| OBDeleven Pro plus device | device (under $100) + $69.99 | about $170 | device + 5 x $69.99 = $349.95 plus credits | Pro still pays credits per one-click app (about 100 included). [S9, S10] |
| Car Scanner Pro forever plus a $20 to $80 adapter | $7.99 | about $28 to $88 | same | No BMW coding. [S14] |
| Torque Pro plus classic Bluetooth adapter | $4.95 | about $30 to $145 | same | Android only; BMW needs plugins. [S19, S20] |
| Autel MK808BT | hardware (not priced here) | free year then about $110 to $130 | renewals only if you want updates | Reseller prices. [S21] |
| ISTA via AOS | BMW price list inside portal | day ticket about 30 EUR in one source | per-time | Low confidence. [S38] |

Currency conversions and the cost of the adapters other than the ones named are not computed. I did not invent exchange rates.

### 4.2 Licence shapes

| Shape | Examples | Strength | Weakness users report |
|---|---|---|---|
| One-time per app | BimmerCode, BimmerLink, Torque, OBD Fusion | Predictable | Features gated by firmware; no refunds after purchase for missing features |
| Yearly licence per brand | Carly | Cheap entry | Auto-renewal surprise, locked to own scanner |
| Plan plus credits plus own hardware | OBDeleven | Many scripted features | Credits lost on failures, plan price rises, hardware lock-in |
| Free with ad, optional pro | Car Scanner | Low cost | Coding marked experimental |
| Hardware plus renewal | Autel, Launch, Foxwell NT809 | Pro workflows | Coding and newer cars need renewals |
| Workshop access by time | ISTA | Official data | Day or year tickets, heavy install |
| No licence, gray market | INPA, NCS Expert, Tool32, E-Sys copies | Free, powerful | Legal risk, no safety net |

## 5. Adapter lock-in map

| Tool | Own hardware required | Third-party adapters | Notes |
|---|---|---|---|
| BimmerCode | No | Yes, published list incl. OBDLink CX, MX+, LX, vLinker, Veepeak BLE+, UniCarScan, ENET cable, DCAN cable | List differs by series [S5] |
| BimmerLink | No | Yes, same list | Quirks vs vLinker MC+ reported (low) [S2] |
| Carly | Yes (Carly scanner) | No | Scanner keeps basic code reading without a plan [S6, S7] |
| OBDeleven | Yes (OBDeleven device) | No | Second adapter needed to use BimmerCode [S9] |
| Autel, Foxwell, Launch | Yes (their VCI) | Mostly no | Pro tablets pair with own VCI (medium) |
| ISTA | BMW ICOM or J2534 | J2534 allowed, no Bluetooth link between tool and PC | [S30] |
| E-Sys, INPA, NCS Expert, Tool32 | ENET or K+DCAN cable | Cable level | Wired only in practice (medium) |
| Torque | No | Classic Bluetooth only; BLE fails | [S19] |
| OBD Fusion | No | iOS BLE only; Android all | [S17] |
| Car Scanner | No | ELM327-compatible; BLE or Wi-Fi on iOS | [S15] |

The adapters worth supporting first, because they appear in competitors' lists: OBDLink CX (BLE, built for BimmerCode), OBDLink MX+, vLinker BM and MC variants, Veepeak OBDCheck BLE and BLE+, wired ENET cable for F, G and I cars, and DCAN cable for E-series. [S5, S20]

## 6. Update cadence

| Tool | Evidence | Reading |
|---|---|---|
| BimmerCode | Version 4.4 notes cover new models and fixes; desktop builds are v1.0.0 | Active (medium) |
| BimmerLink | 5.1.2 with service-reset and dashboard fixes | Active (medium) |
| Carly | 41.26.110314 dated Nov 3; big app (437 MB) | Very active (medium) |
| OBDeleven | Old app at 1.9.75 (Sep 28); main app version not read | Active (low-medium) |
| Car Scanner | 2.2.52 four days old; 2.2.42 on Nov 5 | Very active (high) |
| OBD Fusion | 6.13.0 in September 2025 per a review | Slower (low-medium) |
| Torque | No version or date found; Play and site pages failed | Unknown (low) |
| Autel, Launch, Foxwell | Free year or two then paid; vendors advertise ongoing coverage | Tied to subscription (medium) |
| ISTA | Online system updated by BMW | Official (medium) |
| INPA, NCS Expert, Tool32 | Not actively developed | Frozen (medium) |

## 7. Top complaints by tool (ranked within each)

| Tool | 1 | 2 | 3 | Source |
|---|---|---|---|---|
| BimmerCode | Features missing after purchase | Adapter detection and slow connection | Support will not refund when BMW firmware blocks a setting | search snippets of store reviews (low-medium) |
| BimmerLink | Adapter quirks with some units | UI stutter on long sensor lists | Newer iDrive limits (affects BimmerCode more) | [S33] (low) |
| Carly | Subscription fees and auto-renew | Compatibility gaps | Support (AI-only, tickets closed) and refunds | [S12, S13] (medium) |
| OBDeleven | Credits lost on failed jobs | Bluetooth and set-up friction | Price rises and removed free credits | [S11] (medium) |
| Autel | Renewal price and coding lock after free year | Slow support and warranty | Software or account issues after reset | [S23, S24] (medium) |
| Foxwell | Software updates harder than expected | Learning curve | Few negatives; sample small | [S25] (low-medium) |
| Launch | No independent data found | | | gap |
| ISTA | Heavy set-up and adapter mismatch | Per-time pricing for DIY | Slow | [S38] (medium) |
| E-Sys | No safety net; easy to wreck a module | Data pack versions must match | Legal gray area | [S38] (medium) |
| INPA, NCS Expert, Tool32 | No safety checks | Old Windows stack | Hard to learn | [S32] (medium) |
| Torque | Bluetooth pairing | Dated UI | No iOS | [S19] (low-medium) |
| OBD Fusion | Profile data wiped when switching cars | Lag with many gauges | No GM enhanced; no BMW | [S17] (low-medium) |
| Car Scanner | Clone adapters and iOS limits | Coding is experimental | Pro unlock confusion | [S15] (medium) |

Sentiment ratings seen: BimmerCode 4.7 iOS; BimmerLink 4.7 iOS; Carly 4.6 iOS vs 2.6 Trustpilot; OBDeleven 4.5 iOS (old app) vs 3.9 Trustpilot; Car Scanner 4.8 iOS; Autel 1.5 Trustpilot (small, unclaimed); Foxwell 4.5 Trustpilot (small). Store ratings look kinder than Trustpilot, which is typical because Trustpilot attracts disputes. [S3, S4, S6, S9, S11, S12, S14, S24, S25] (medium)

## 8. New entrant worth watching

**BimmerFix** (iPhone only, 2026): free to download, in-app plans, a 7-day free trial, coding limited to the Pro and Dealer tiers, an "AI fault analysis" feature, 1,800+ F and G coding options browsable offline, and E, F and G coverage. Listed yearly Pro price $199.99 in Canada and $149.99 in Lebanon. One listing shows a single 1.0 review. It shows that an AI-assisted diagnosis story is being tried at a high price. [S34] (low-medium; single store listing, little track record)

## 9. What users cannot get today (feature gaps seen across the matrix)

| Gap | Evidence in this document |
|---|---|
| Coding backup and one-tap restore that works across tools | Only BimmerCode Standard mode is described as auto-backing up, and only by a review site [S33]. OBDeleven users complain about lost restore [S11]. E-Sys and NCS Expert have none [S32]. |
| Free BMW diagnostics and service resets | BimmerLink costs $39.99; Carly needs a yearly plan; Car Scanner and Torque do not do BMW modules well. |
| Any-adapter freedom | Carly and OBDeleven lock to their own devices; Torque rejects BLE. |
| Mercedes and Toyota in a free app | Carly sells them; OBD Fusion packs cost $9.99 each; Car Scanner coding is Toyota CAN 2008+ only. |
| Explaining what a setting does and what can go wrong | Expert coding modes and E-Sys give raw parameters; vendors warn instead of explain. |
| No credits, no account, no ads, works offline | OBDeleven credits; Carly account; Car Scanner ad banner. |
| Cross-platform desktop with the same app | BimmerCode has Windows and Mac; others do not. Torque is Android only. |
| Honest refund and support | Carly, OBDeleven and Autel all draw support and refund complaints. |
| Data portability | OBD Fusion erases profiles on car switch. |
| Guided flashing or write-safety rails | Only pro tools and ISTA offer it, at workshop prices; this plan makes writes bench-only for 12 weeks (decisions #2). |

## 10. Ranked feature gaps a free tool could win on

Scored on three things: how loudly users complain (evidence in section 7), how weak every competitor is, and how cheap it is for OpenDiag to do given the plan (reads before writes, writes on bench modules only). Rank 1 is best.

| Rank | Gap | Why it wins | Who is weakest | Fit with plan |
|---|---|---|---|---|
| 1 | **Verified backup and one-tap restore for every write** | Biggest fear in coding is a dead module; competitors rarely promise recovery | OBDeleven, Carly, E-Sys, NCS Expert | Matches decision #2 (backups mandatory). Strong. |
| 2 | **No lock-in: any supported adapter, documented list** | Carly and OBDeleven force their own dongle | Carly, OBDeleven, Autel | Core to the brief (OBDLink CX, ENET, ELM327/STN, DoIP). Strong. |
| 3 | **Free, honest pricing: no credits, no yearly fee, no ads** | Subscription anger is the top complaint (Carly 40% one-star) | Carly, OBDeleven, Autel | Open source gives this by default. Strong. |
| 4 | **Free BMW diagnostics: all-module codes, live data, battery registration, service resets** | BimmerLink charges $39.99; others charge yearly | BimmerLink, Carly | Reads first in the plan. Strong. |
| 5 | **Plain-language setting explanations plus risk labels** | Existing tools list options with little explanation | BimmerCode (mixed), E-Sys, NCS Expert | Needs data work; medium effort. |
| 6 | **Mercedes and Toyota basics at no cost** | Only Carly and OBDeleven offer Mercedes; Toyota coding limited | Carly ($28.99 Mercedes, $21.99 Toyota) | In the brand order of the brief. Medium. |
| 7 | **Works offline, no account, no cloud dependency** | Autel ties coding to server access; Carly and OBDeleven need accounts | Autel, Carly, OBDeleven | Cheap. Strong. |
| 8 | **Desktop and phone with one data format** | Only BimmerCode has desktop apps | Torque, Carly, OBDeleven | Medium. |
| 9 | **Clear error messages and a connection troubleshooter** | Connection failure is a repeat theme | Car Scanner (clones), BimmerCode, OBDeleven | Cheap, high value. |
| 10 | **Open, exportable logs and coding history** | OBD Fusion loses profiles; vendors keep history in clouds | OBD Fusion, Carly | Cheap. |
| 11 | **Newer-car support transparency (what is blocked and why)** | iDrive 8 and gateway limits; SFD2 on VAG; failures blamed on firmware | BimmerCode, OBDeleven | Honest status page. Cheap. |
| 12 | **Guided flashing with safety rails** | ISTA is expensive; Tool32 has none | ISTA access, E-Sys | Out of scope for 12 weeks (bench only). Later. |

Not winnable cheaply: repair manuals and wiring diagrams (ISTA and AIR sit behind BMW licensing), key and immobiliser work (pro tools, high legal risk), and anything that needs BMW's protected data.

## Sources

| ID | URL | Type | Used for | Confidence |
|---|---|---|---|---|
| S1 | https://www.bimmercode.app/ | Vendor | Platforms, vehicles, rating | medium-high |
| S2 | https://www.bimmerlink.app/ | Vendor | BimmerLink features and vehicle list | high |
| S3 | https://apps.apple.com/us/app/id1130787459 | Store | BimmerCode price, version, notes | high |
| S4 | https://apps.apple.com/us/app/bimmerlink-for-bmw-and-mini/id1065360416 | Store | BimmerLink price, version | high |
| S5 | https://bimmercode.app/adapters/ | Vendor | Adapter list | high |
| S6 | https://apps.apple.com/us/app/id467344155 | Store | Carly prices, version, brands | high |
| S7 | https://www.mycarly.com/blog/carly/how-much-does-carly-actually-cost-2026-edition/ | Vendor blog | Adapter price, tiers, free features | medium |
| S8 | https://www.tomsguide.com/vehicle-tech/carly-obd-scanner-review | Press (via search snippet only) | Renewal range, fallback | low |
| S9 | https://apps.apple.com/us/app/obdeleven-car-diagnostics/id1458334123 | Store | OBDeleven plans, credits, version | high |
| S10 | https://obdadvisor.com/obdeleven-pro-vs-ultimate/ | Affiliate review | Plan differences, brand coverage | medium |
| S11 | https://www.trustpilot.com/review/obdeleven.com | Review site | Rating, themes | medium |
| S12 | https://nz.trustpilot.com/review/www.mycarly.com | Review site | Rating, themes | medium |
| S13 | https://obdadvisor.com/carly-for-bmw-review/ | Affiliate review | BMW models, reader complaints | low-medium |
| S14 | https://apps.apple.com/us/app/car-scanner-elm-obd2/id1259933623 | Store | Prices, version, features | high |
| S15 | https://obdadvisor.com/car-scanner-elm-obd2-review/ | Affiliate review | Features, adapters, complaints | medium |
| S16 | https://www.carscanner.info/ | Vendor | Coding platforms | medium |
| S17 | https://obdadvisor.com/obd-fusion-app-review/ | Affiliate review | OBD Fusion prices, packs | medium |
| S18 | https://apps.apple.com/fi/app/obd-fusion/id650684932 | Store (via search) | 9.99 EUR | low-medium |
| S19 | https://obdadvisor.com/torque-pro-review/ | Affiliate review | Torque features, price, adapter | medium |
| S20 | http://www.obdlink.com/ | Vendor | OBDLink adapter prices | high |
| S21 | https://www.obdprice.com/blogs/faqs/do-you-need-to-update-your-autel-scanner-annually | Reseller | Autel renewal list | medium-low |
| S22 | https://autel.us/?p=22976 | Vendor | What expiry means | high (as claim) |
| S23 | https://rennlist.com/forums/cayenne-9y0-2019/1301547-autel-scam-deceptive-marketing-no-active-subcription-no-coding-no-key-features.html | Forum | Autel coding lock complaints | medium |
| S24 | https://www.trustpilot.com/review/www.autel.com | Review site | Autel rating, themes | low-medium |
| S25 | https://www.trustpilot.com/review/foxwelldiag.com | Review site | Foxwell rating, themes | medium |
| S26 | https://www.foxwelldiag.com/blogs/car-diagnostic/foxwell-nt510-elite-how-to-unlock-brand-specific-diagnostic-depth | Vendor | NT510 packs, BMW functions | medium |
| S27 | https://obdadvisor.com/foxwell-nt809bt-review/ | Affiliate review (via search snippets) | NT809 update model | low |
| S28 | https://www.trustpilot.com/review/x431tool.com | Review site | Launch reseller reviews | low |
| S29 | https://www.jbtools.com/launch-usa-307010011-one-year-software-updates-for-x431-scan-tool/ | Reseller (via search) | Launch renewals | low |
| S30 | https://bmwtechinfo.bmwgroup.com/assets/system_requirements.pdf | Official BMW guide (2022) | ISTA, AOS, interfaces, network | high |
| S31 | https://aos.bmwgroup.com/terms-of-use | Official (via search snippet) | Free or fee per price list | medium |
| S32 | https://github.com/bmcodex/bmw-oem-tools-documentation/blob/main/docs/tools/tool32.md | Community docs | Tool32, EDIABAS, status | medium |
| S33 | https://cartipsdaily.com/bimmercode-vs-bimmerlink | Review site | Standard vs Expert mode, limits | low-medium |
| S34 | https://apps.apple.com/app/id6758517700 | Store (via search) | BimmerFix | low-medium |
| S35 | https://obdeleven.com/products/ultimate-vag-plan-24 | Vendor (via search) | Euro plan prices | medium |
| S36 | https://obdeleven.com/en/obdeleven-vs-carly | Vendor comparison (page 403, search snippet only) | Adapter incompatibility claim | low |
| S37 | https://www.turnermotorsport.com/BMW-F82/m-1310-obdeleven | Retailer (via search) | OBDeleven device price range | low |
| S38 | Repo docs: docs/research/deep/bmw-ista-real-world-usage.md, obd-app-market-and-reviews.md, bmw-coding-failures-and-recovery.md | Internal research | ISTA tickets, market context, failures | medium |

## Gaps (what could not be established)

1. **Google Play pages** for BimmerCode, BimmerLink, OBDeleven, Carly, Car Scanner and Torque returned only a title. So no Android ratings, install counts, or update dates. Torque's developer site returned a server error.
2. **Reddit and Bimmerpost** were not readable (Bimmerpost thread fetch returned 403). So no forum-based complaint counts. The BMW forum statements here come from search snippets and one Supra forum and one Porsche forum thread.
3. **OBDeleven pricing blog and comparison pages** returned 403; the July 2025 plan change was read only through search snippets. The credit price conflicts (App Store $29.99 per 100 vs a review site's $15 to $18).
4. **Carly's own pricing page** did not render; plan prices come from the App Store and a vendor blog that gave no figures.
5. **Launch**: no official update policy, no independent ratings or complaints. Only reseller listings and one reseller-run Trustpilot page.
6. **Autel and Foxwell BMW coding depth**: I could not confirm which tablets can code which BMW modules, nor Autel's BMW-specific coding terms beyond one forum quote. Foxwell NT809 update terms conflict across sources.
7. **E-Sys, INPA, NCS Expert**: the cited community page covers only Tool32 and EDIABAS, so the INPA and NCS Expert descriptions and the E-Sys section rest on uncited general knowledge (UNVERIFIED). No BMW statement on public availability or legality; I deliberately did not search for downloads. Version and data-pack compatibility not documented here.
8. **ISTA pricing**: only a single undated ticket list (via the repo's earlier research); the portal price list is not public.
9. **App-store dates**: several store listings show "Apr 28", "Sep 26", "Sep 28" or "Nov 3" without a year; I assumed they are recent but cannot prove the year.
10. **Mercedes and Toyota depth inside Carly and OBDeleven** (which control units, which functions) is not documented in what I read.
11. **Complaint volume** is not quantified for BimmerCode, BimmerLink, Torque, OBD Fusion or Car Scanner; I have anecdotes only.
12. **Unit prices in euros vs dollars** are not converted. The 5-year table uses US App Store prices where known and flags the rest.
