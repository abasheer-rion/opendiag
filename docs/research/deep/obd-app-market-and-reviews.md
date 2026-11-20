# The OBD app market: features, pricing, reviews, unmet needs

Prepared for OpenDiag (Apache-2.0). Research run date: 2026-11-20.

**Read this first: limits of this run.** The web search tool hit its call budget before any search ran, so every source here was reached by fetching a known vendor, review-site, Wikipedia or GitHub address. Many guesses failed (see "Pages that failed or were unusable"). Consequences:

- No App Store or Google Play rating pages loaded for Car Scanner, Torque, OBD Fusion, OBDeleven, Carista or Carly. Where ratings appear, they come from vendor sites (self-reported) or Trustpilot.
- Reddit was blocked by the fetch tool. No Reddit, Bimmerpost, Bimmerfest or forum thread was read. Forum-driven claims are therefore absent, not just thin.
- Several vendor pages list no prices. Where price is missing I say so. Anything from memory is tagged **[memory, unverified]**.
- Trustpilot is a biased sample (more on this below).

Ledger references look like [L12]. The table is at the end.

---

## Summary (10 bullets)

1. **The market splits into four business models.** (a) Free or one-time-purchase generic ELM327 apps (Car Scanner, Torque, OBD Fusion, OBDLink app), (b) brand-specific coding apps sold per app or per feature (BimmerCode, BimmerLink), (c) subscription or credit platforms tied to a vendor adapter (Carista, OBDeleven, Carly), and (d) professional scan tools with paid update subscriptions (Autel, Launch, iCarsoft). [L1, L2, L7, L8, L16, L30]
2. **Subscription pushback is the loudest complaint in the data.** Carista holds 1.7/5 on Trustpilot (68% one-star, n=46) and Carly 2.6/5 (40% one-star, n=17,650). Both name recurring fees for functions buyers thought they had bought. [L11, L12]
3. **Ratings are polarised, not mediocre.** Carly is 40% five-star and 40% one-star. OBDeleven is 60% five-star and 16% one-star. Autel is 38% and 58%. People either love the tool or feel trapped by its terms. [L10, L11, L16]
4. **Apple and Google ratings for the BMW-specific apps are high.** The BimmerCode site shows 4.7 on iOS (21,741 reviews at first read; 21,748 on re-check, so counts drift daily) and 4.8 on Android (12,189). BimmerLink shows 4.7 (9,846) and 4.5 (5,770). These are vendor-quoted numbers, so treat as medium reliability. [L2, L7]
5. **The adapter is the bundle lever.** Carly gives its scanner free with Premium. Carista sells an adapter plus 12-month PRO (UK sale price GBP 69.99 against GBP 99.99 list). OBDLink gives its app free with any adapter and makes enhanced diagnostics free on the MX+ only. [L1, L8, L31]
6. **What drives paid conversion is write access, not read access.** Free tiers read and clear standard codes and show live data. Payment starts at manufacturer-specific codes, coding and customisation (Carista) or at extra modules such as ABS and airbag (OBDLink). [L1, L31]
7. **Standard OBD is public. Manufacturer data is not.** The generic PID set is standardised. Everything else is locked behind paid industry membership or reverse engineering. That is the real moat all of these apps sell. [L17, L34]
8. **Open source is fragmented and mostly read-only.** The main GitHub OBD2 repos are libraries, emulators or generic readers. The popular Android reader is archived since 2017. Tools with coding depth (ddt4all) are GPL. Nothing free covers BMW coding with a polished mobile app. [L18, L19, L26, L27, L29]
9. **BMW tuners (MHD) bundle hardware and sell per-engine licences.** The MHD site sells licences "per engine family" plus its own wireless adapter. This is a third template for BMW users alongside BimmerCode's adapter-agnostic approach. [L22, L6]
10. **Trust and safety are open wounds.** Reviews allege bricked modules (OBDeleven on Mercedes, single unverified review), lost credits, unclear refunds, and failed updates removing features. OpenDiag can win on backups, dry runs and transparency. [L10, L12, L16]

---

## What I found

### 1. Market structure and the four models

**Generic ELM327 apps (read-mostly).**

- **Car Scanner ELM OBD2** (carscanner.info). Diagnostics, live PIDs, logs, and coding or service pages for VW/Audi/Skoda/Seat and Hyundai/Kia. The site lists no price and no user counts. The FAQ says there are low, medium and high price tiers that are "identical", i.e. pay-what-you-want style, sold only through the stores. The Pro purchase is per store, not cross-store, and has a restore function. On iOS only Bluetooth LE and Wi-Fi adapters work. A "Bad adapter" warning means the dongle failed init commands. Languages: English and Russian. Android and Huawei AppGallery listings are named. [L4, L32]
- **OBD Fusion** (obdsoftware.net). Price was not on the page, though one buyer review mentions about $10 (single, unreliable). iOS 17+, Android 7+. Dashboards, logs, trips, maps, CarPlay and Android Auto, plus an in-app "Enhanced Diagnostics" purchase for extra modules on supported makes. Generic classic-Bluetooth ELM327 adapters are said to be incompatible on iOS. [L5]
- **OBDLink app.** Free and included with any OBDLink adapter. Enhanced diagnostics (ABS, airbag, transmission, 4x4, body) are free with MX+ and bought in-app for other OBDLink adapters. Enhanced coverage is listed for Ford, Lincoln, Mercury, Mazda, Toyota, Lexus, Scion, Nissan and Infiniti, with no BMW or Mercedes entry. The feature list is nearly the same as OBD Fusion's (same sections, same maps and CarPlay lines), a sign that the two share lineage. That is my inference, not a stated fact. [L3, L31]
- **Torque.** The Torque wiki describes an Android tool with fault codes, dashboards, themes, scripts, plugins and a Track Recorder plugin. The wiki page carries no price or Lite-versus-Pro comparison. The main site and Play page did not load. [L35]
- **DashCommand** (Palmer Performance). Windows, Android and iOS. Windows and iOS are purchases. Android is a free evaluation mode with an unlock via web store or in-app purchase. Dashboards via a scaling technology, data logging with ScanXL export, scripts for boost or fuel use. The page quotes OS support back to Windows 95, which signals a legacy product. No price on the page. [L9]
- **EOBD Facile.** The site did not resolve. No data. Treated as a gap.

**Brand-specific coding apps (BMW).**

- **BimmerCode.** Coding for BMW, MINI and Toyota Supra. Shows control-unit options for the front electronic module, head unit and cluster. iOS, Android, Windows 10+, macOS 12+ (Intel and Apple chips). The site shows no price. Vendor-quoted ratings: iOS 4.7 across 21,741 reviews, Android 4.8 across 12,189. It disclaims any link to BMW AG. The adapter page lists the OBDLink CX as "Made for BimmerCode All Series" and lists ENET cable and several ENET Wi-Fi adapters (including a bm3-branded one) for F, G and I Series. It also lists MHD, UniCarScan, vLinker, Veepeak and NEXAS units, some listed twice with conflicting series coverage. That duplication is a vendor data-quality issue worth noting. [L2, L6, L33]
- **BimmerLink.** Same developer family. Diagnostics, live data on a customisable dashboard, CSV logs, battery registration, DPF regeneration, electromechanical handbrake service mode, service display reset, lighting module short-circuit lock reset, exhaust flap control, Active Sound Design mute, and burble tuning for S55 engines (M2 Competition, M3, M4). Covers BMW from about 2003 to 2024+, MINI 2006+ and Supra 2019+. Vendor-quoted ratings: iOS 4.7 (9,846 reviews), Android 4.5 (5,770). No price on the page. [L7]
- The single Trustpilot page for BimmerCode has one recent review (5 stars, "coding without paying a workshop") and a 3.7 score. It tells us nothing about trend. [L14]
- **What I could not confirm:** the BimmerCode and BimmerLink prices, the model (one-time versus subscription), and update cadence. From memory, both are free to download with paid unlocks **[memory, unverified]**. This must be checked on the store pages.

**Subscription and credit platforms.**

- **Carista.** The UK page shows the EVO bundle (scanner plus 12-month PRO) at GBP 69.99 sale, GBP 99.99 list, and the PRO subscription alone at GBP 41.99 sale, GBP 59.99 list. PRO terms are 1, 12 and 24 months. Free tier covers standard code read and clear, live OBD2 data, readiness checks, ECU info and an acceleration test. Paid tier unlocks manufacturer codes, advanced diagnostics and customisation. Self-reported: 3M+ drivers, 60K+ verified reviews, and conflicting ratings (4.9 from over 8,300, 4.8 average, and 4.60 with 96% satisfaction). Listed brands include BMW, MINI, Toyota, Lexus, Scion, Mazda and many more, but not Mercedes in the FAQ list. [L1]
- **OBDeleven.** The pricing page returned 403 and the help centre index was a stub. We know the help centre has an "Account & plans" collection of 29 articles, and Trustpilot complaints mention credits, a "two-app system" and unclear pricing. We do not have the actual price list. From memory the company uses a credit plus subscription model **[memory, unverified]**. [L10, L21]
- **Carly.** The site shows 43 brands including BMW, Mercedes and Toyota, features (diagnostics, live data, maintenance, coding, "Smart Mechanic"), and a Premium package that includes the scanner free and is non-returnable once bought. The prices page content did not load, so there is no tier pricing. Marketing claims (a TV-presenter endorsement, press logos, "lifetime warranty") come with no supporting evidence. [L8]

**Professional scan tools.**

- **Autel.** Trustpilot 1.5/5 across 127 reviews (58% one-star). The most frequent complaint is renewal fees. Reviewers cite roughly $500 to $800 a year, and one alleges lockout of diagnostic functions after the subscription lapses. One user says a factory reset wiped the software and forced a new subscription. [L16]
- **iCarsoft.** Trustpilot 3.7/5 across 180 reviews (53% five-star, 43% one-star). Complaints centre on advertised service resets that do not work on a given car, slow support and refund friction. The iCarsoft site states "lifetime free software updates on most devices" and no subscription fees, which is a deliberate contrast with Autel. Its marketing shows tablets and handhelds, not a phone app. [L15, L30]
- **Launch.** Its Trustpilot address returned 404 and the corporate domain redirected to an unrelated firm. No data. Gap.

**Tuning (relevant to a BM3 user).**

- **MHD.** Android and iOS app. Licences sold per engine family (N54, N55, S55, B58, S58, S63, N13). Flash times of 3 to 15 minutes on first install, then 10 seconds to 2 minutes for later changes. Stock restore without ECU backup is claimed. Gauge monitors 50+. The page does not say if the licence is one-time or recurring. Sells its own wireless adapter and an unlocker. [L22]
- **bootmod3.** The site loaded only as an offline placeholder. No data. Gap.

### 2. Pricing and adapter bundling, side by side

| Product | Model seen on source | Price seen | Adapter link |
|---|---|---|---|
| Car Scanner ELM | Store purchase, three equal price points | Not stated | Any BLE or Wi-Fi ELM327 on iOS [L32] |
| OBD Fusion | Purchase plus in-app enhanced diagnostics | Not stated (about $10, one buyer) | ELM327 BLE, Wi-Fi, MFi [L5] |
| OBDLink app | Free with adapter, enhanced bought in-app or free with MX+ | Adapters $69.95 to $149.95 [L23] | Tied to OBDLink hardware for best result [L31] |
| Carista | Hardware plus PRO subscription | GBP 41.99 sale PRO, GBP 69.99 sale bundle [L1] | Own scanner |
| Carly | Subscription, scanner free with Premium | Not loaded | Own scanner [L8] |
| BimmerCode / BimmerLink | App-store unlocks | Not stated | Adapter-agnostic list, OBDLink CX recommended [L6, L20] |
| MHD | Per-engine licence | Not stated | Own Wi-Fi unit or others [L22] |
| Autel | Device plus yearly renewal | $500 to $800 a year per reviewers [L16] | Own tablet |
| iCarsoft | Device with lifetime updates | Not stated | Own device [L30] |

**OBDLink CX facts (the owner's adapter).** $79.95 list, out of stock on the vendor page at fetch time with an Amazon link, Bluetooth LE 5.1, a 3-year warranty with a 180-day money-back guarantee, a sleep mode under 1 mA, and a claim of 100% BimmerCode coverage and "won't brick your ECU". The vendor's own recommendation, not independent testing. [L20]

**Observations.**

- Adapter and app are loosely coupled for BMW coding (BimmerCode lists around 30 adapters across series) but tightly coupled for subscriptions (Carista, Carly, OBDeleven). The tight coupling is the source of the "I paid for hardware and now I pay again" complaint. [L1, L6, L12]
- The ENET Wi-Fi adapters listed for F/G/I series include one branded bm3 and one branded MHD. So tuning-company hardware doubles as a coding adapter. For OpenDiag, ENET over Wi-Fi is the primary route to rich BMW access, while OBDLink CX BLE is the OBD-port route. [L6]

### 3. Ratings and recurring complaints

**Trustpilot snapshot (retrieved 2026-11-20).**

| Brand | Score | Reviews | 5-star | 1-star |
|---|---|---|---|---|
| OBDeleven | 3.9 | 4,506 | 60% | 16% |
| Carly | 2.6 | 17,650 | 40% | 40% |
| Carista | 1.7 | 46 | 13% | 68% |
| Autel | 1.5 | 127 | 38% | 58% |
| iCarsoft | 3.7 | 180 | 53% | 43% |
| OBDLink | 2.6 | 4 | 25% | 75% |
| BimmerCode | 3.7 | about 1 recent | n/a | n/a |

Sources: [L10] to [L16]. Carista, Autel, iCarsoft, OBDLink and BimmerCode pages state that the company has not recently invited reviews, and for Carista, Autel and iCarsoft that it does not reply to negative reviews. Small samples (46, 4, 1) are not usable for ranking. Carly's 17,650 and OBDeleven's 4,506 are large enough to take seriously.

**Complaint themes, ranked by how many sources repeat them.**

1. **Paying again for what the buyer thought they owned.** Carly ("annual or monthly fees expensive", a reviewer wants a one-time charge), Carista (fees to read or clear codes, features gone after a free period), Autel (renewals required for updates and new vehicle coverage; lockout claim). Three of five analysed brands. [L11, L12, L16]
2. **Support that does not answer.** OBDeleven (slow replies, "mailbox full"), Carly (tickets closed before reply), Carista (AI chatbot only), iCarsoft, Autel, OBDLink. Every brand. [L10 to L16]
3. **Refunds and delivery.** OBDeleven, Carly, Carista, iCarsoft all report refund difficulty or missing shipments. [L10 to L12, L15]
4. **Misleading compatibility.** Carista (site said supported, support said no), iCarsoft (advertised resets unsupported), OBDeleven (One-Click Apps fail on some 2026 Audi, VW, BMW and Mercedes cars; vehicle misidentified). [L10, L12, L15]
5. **Lost or unexplained credits.** OBDeleven only. Credits charged for failed functions, bought credits not appearing. [L10]
6. **App stability.** Carly (slow scans, freezes, drops mid-log), OBDeleven (Bluetooth instability, features vanish after updates, two apps). [L10, L11]
7. **Damage claims.** One OBDeleven reviewer alleges One-Click Apps on a Mercedes caused module faults costing over $2,200. Single and unverified. Autel has one fire allegation, also single. [L10, L16]
8. **Narrow brand depth.** Carly reviewers say it is strong on German cars and weak elsewhere. Carista reviewers say customisation is thin on VW, Audi and Toyota. [L11, L12]

**Praise themes (for contrast).** Ease of use (all brands), fast and helpful support when it works (OBDeleven), finding faults and avoiding workshop bills (Carly, iCarsoft, BimmerCode), hidden-feature unlocking (OBDeleven), strong BMW, Audi and VW coding (Carly). [L10, L11, L14]

### 4. What drives paid conversion

Evidence is indirect: we have price pages and tier descriptions but no conversion numbers from any vendor.

- **The line is read versus write.** Carista keeps standard read, clear and live data free and charges for manufacturer codes and customisation. OBDLink keeps standard diagnostics free and charges for extra modules. Autel and iCarsoft sell the device, with renewals gating updates. [L1, L31, L16, L30]
- **Hardware pull-through.** Carly bundles its scanner into Premium, and Carista discounts the scanner plus 12 months. The adapter is the customer acquisition vehicle and the subscription is the margin. [L1, L8]
- **Trust seals sell.** Carly leans on celebrity, press and lifetime-warranty marketing; Carista on "3M+ drivers" and "60K+ verified reviews". Neither is backed by evidence on its page. [L1, L8]
- **Coding apps convert on specific desires.** BimmerLink lists burble tuning, exhaust flap, ASD mute and DPF regeneration up front, the "fun" and "maintenance" features that people search for. [L7]
- **Platform spread.** BimmerCode ships to four platforms (iOS, Android, Windows, macOS). A desktop client plus ENET is the path for the more serious owner. [L2]

I could not find any public install-base number except Carista's self-claim (3M+ drivers) and review counts on vendor pages. Review counts are a rough proxy: the BimmerCode iOS count (21,741) is more than twice BimmerLink's (9,846). If a typical review rate were 1% to 3% of users that would suggest over a million installs, but I have no source for the review rate, so this is an illustration, not a finding.

### 5. Update cadence

Almost nothing is visible. Vendor pages did not show release dates or version history. What can be said:

- OBDium (open source) is at 1.5.1 with 255 commits and lists manufacturer PIDs as planned. [L29]
- The widely used open Android OBD reader is archived since 10 November 2017, with its author unreachable. Open source here means "abandoned" more often than "maintained". [L19]
- LTSupportAutomotive, the iOS library, calls itself bugfix-only. [L36]
- OBDeleven reviewers report features vanishing after updates; Autel reviewers report updates removing tests. Updates are therefore a risk as well as a benefit. [L10, L16]

Store version histories are needed to measure cadence properly. That is a follow-up.

### 6. The data moat

- SAE J1979 defines ten diagnostic services and a standard PID set. These are public. Manufacturer PIDs are not: public information is "very limited", the main industry source requires paid membership, and some manufacturers add contracts with annual fees. [L17]
- The OBD specifications lack authentication and rely largely on obscurity, per Wikipedia. That is exactly why coding apps exist, and why a bad write can harm a car. [L34]
- US OBD-II dates from 1996, EU EOBD from 2001 (petrol), which defines the generic-read coverage horizon. [L34]
- ELM327 chips were copied widely. Clones often carry the buggy 1.4 firmware and fake version numbers. That feeds the "Bad adapter" warnings in Car Scanner's FAQ. The original maker announced it was closing in June 2022. [L24, L32]
- iOS cannot use classic Bluetooth adapters except under Apple's accessory programme. BLE is the only practical route. [L36, L32]

### 7. Open-source landscape

- GitHub's OBD2 topic page (first page of 760 results) lists mostly libraries, emulators and hardware projects. Top by stars: awesome-canbus (3.6k), ddt4all (1.9k), ELMduino (949), python-udsoncan (746), ELM327-emulator (707), obdium (478), LTSupportAutomotive (256). [L18]
- Licences: pires Android reader Apache-2.0 (archived); python-udsoncan MIT; LTSupportAutomotive MIT; python-OBD GPL-2.0; ddt4all GPL-3.0-or-later; obdium GPL-3.0; ELM327-emulator shows a CC BY-NC-SA 4.0 badge (non-commercial). Per the project rules, I read READMEs only for the GPL and NC projects. [L19, L37, L36, L26, L27, L29, L25]
- ddt4all targets Renault-style CAN diagnostics and ships with a disclaimer that serious damage is possible. This is the closest open analogue to a coding tool and it is a desktop Python app. [L27]
- FORScan (not open source) shows the free-plus-extended-licence pattern for Ford. Its page says extended licence is needed for configuration and programming on Windows, and it recommends OBDLink MX+ while warning that ELM327 clones may have limited function. [L28]

### 8. Unmet needs (inferred from the evidence)

1. **No fee wall on basics.** Complaints are loudest when people feel locked out of reading or clearing codes. [L11, L12]
2. **Honest compatibility.** A pre-purchase checker that says which functions work on exactly this car, with evidence behind the claim. BimmerCode's site has a checker, and its adapter table duplicates entries with conflicting coverage. [L6, L12, L15]
3. **Safe writes.** Backup before write, dry run, rollback. Reviewers report module damage and feature loss. MHD advertises stock restore without a backup; vendors do not publish write-safety evidence. [L10, L22]
4. **One app, not two.** OBDeleven's "two-app system" is a named annoyance. [L10]
5. **Credit and billing transparency.** Show what a function costs before running it and refund automatically on failure. [L10]
6. **Cross-platform parity.** Only BimmerCode and Car Scanner clearly span phone plus desktop or multiple stores. Purchases do not carry across stores (Car Scanner FAQ). [L2, L32]
7. **Adapter honesty.** Detect clones and warn clearly. [L24, L32]
8. **Mercedes and Toyota/Lexus depth.** Carly lists both, Carista lists Toyota and Lexus. Complaints say the depth is thin outside VAG and BMW. [L1, L8, L11, L12]
9. **Offline use.** Autel reviewers complain about forced online checks. [L16]

---

## Evidence quality and disagreements

- **Trustpilot is not a random sample.** Reviewers skew to the angry and to the delighted, and several pages note the company has not invited reviews. Treat percentages as sentiment polarity, not satisfaction. Small counts (Carista 46, OBDLink 4, BimmerCode 1) are anecdotes. [L10 to L16]
- **Carista's own ratings disagree.** The page shows 4.9, 4.8 and 4.60 from different sections, against 1.7 on Trustpilot. Not reconcilable with what I read. [L1, L12]
- **Warranty conflict on Carista's page.** Two years in one place, one year in the footer. [L1]
- **BimmerCode adapter table is internally inconsistent.** Some adapters appear twice with different series coverage (the page itself shows vLinker BM+ both ways). [L6]
- **Vendor ratings are unverified.** The 4.7 and 4.8 numbers are what the vendor page displays, and I did not check the stores. [L2, L7]
- **Single-source claims.** OBD Fusion's roughly $10 price (one buyer). The $2,200 module repair (one reviewer). The Autel fire allegation (one reviewer). Carly's endorsements. OBDLink's "won't brick your ECU". [L5, L10, L8, L16, L20]
- **AI summaries.** The Trustpilot fetch tool and the page itself generate summaries, and the fetch step also summarises with a small model. Specific numbers I quoted come straight from those summaries and may carry errors. Spot-check anything before it goes into a public document.
- **What the evidence does not show.** No subscription conversion rate, no churn, no revenue, no install counts beyond Carista's self-claim, no Reddit or forum sentiment, no store-review text for any app.

---

## Implications for OpenDiag

**Build**

1. **A free, complete read layer** (standard Mode 01 to 0A, readiness, freeze frame, VIN, live logs with CSV). That is the part vendors paywall and users resent. It is public standard data, so there is no licensing risk. [L17, L1, L11]
2. **BLE and Wi-Fi ENET transport first.** iOS only works with BLE (or Wi-Fi), and the owner's two adapters are an OBDLink CX (BLE) and a Wi-Fi ENET unit. Both are on BimmerCode's supported list, so there is a known-good baseline to compare against. [L6, L20, L36]
3. **Adapter health check on connect.** Detect cloned ELM327 firmware, wrong voltage reports and "bad adapter" conditions, and explain them in plain words. [L24, L32]
4. **A per-car, per-function compatibility ledger** where every claim links to a tested log, instead of a marketing table. This answers the misleading-compatibility complaints. [L10, L12, L15]
5. **Write safety as a feature.** Pre-write snapshot, dry run, explicit "this can brick" confirmation, and a restore path. Make it visible in the app. Reviewers report damage, and vendors do not publish safety evidence. [L10, L22]
6. **One app, desktop plus phone, purchase-free.** Apache-2.0 means no store lock-in, so the cross-store problem disappears. [L32]
7. **A test emulator in the repo.** An ELM327 emulator exists, but its licence looks non-commercial, so write a clean-room simulator or test harness rather than depend on it. [L25]

**Avoid**

1. **Subscriptions or credits** on basic functions. The market's worst scores sit with those models. [L11, L12, L16]
2. **Silent update removals.** Changelogs, versioned feature flags and no removal without notice. [L10, L16]
3. **Unsupported marketing claims** (user counts, celebrity endorsements, "100% coverage"). Publish measured numbers or nothing. [L1, L8, L20]
4. **Copying proprietary data or algorithms.** The moat is paid or reverse-engineered, and the project rules forbid redistributing OEM data or security bypasses. Use only public standards and user-generated logs. [L17]
5. **Reading GPL or non-commercial source** (ddt4all, python-OBD, obdium, ELM327-emulator). READMEs only. [L25 to L27, L29]

**Measure** (suggested, because the market publishes none)

- Compatibility pass rate per car and function, from logged tests.
- Connect success rate per adapter model, with clone detection rate.
- Time from install to first successful scan.
- Write operations with a verified restore, as a share of all writes.
- Crash-free sessions and Bluetooth drop rate per hour of logging (Carly reviewers name drops and freezes). [L11]
- Public issue response time (every vendor above is criticised for support).

**Positioning.** Be the adapter-agnostic app. BimmerCode already lists around 30 adapters, so the demand for adapter freedom is established. OpenDiag adds no fee wall, an open compatibility record and write safety. [L6]

---

## Open questions

1. What do BimmerCode, BimmerLink, OBDeleven, Carly and Car Scanner actually charge today, and is each one-time, subscription or credits? (Store pages and pricing pages did not load.)
2. What are the real Apple and Google ratings and the text of recent one- and two-star reviews for each app? Does the vendor-quoted rating match?
3. What are the real install counts (Google Play tiers) for Car Scanner, Torque, OBD Fusion, Carista, OBDeleven, Carly?
4. What do Reddit, Bimmerpost and Bimmerfest users say about BimmerCode on ENET versus BLE, and about failure modes with the OBDLink CX?
5. How do bootmod3 and MHD licences, flashing and cloud services work and price? (bootmod3 site did not load.)
6. Is the ELM327-emulator licence truly non-commercial, and is there a permissively licensed alternative?
7. What do Autel, Launch and iCarsoft phone apps (Golo and similar) cost and how do reviewers rate them? Launch pages did not load.
8. Does EOBD Facile still exist as a product, and what are its terms? Its site did not resolve.
9. What evidence exists on bricked-module incidents per coding tool, beyond single reviews?
10. What do Mercedes and Toyota/Lexus owners actually need, since only Carista and Carly are shown covering them, and neither with depth?

---

## Pages that failed or were unusable (not in the ledger count)

- Store pages: Google Play for Car Scanner and Torque loaded as empty shells; the App Store listing for BimmerCode returned 404 (guessed ID).
- OBDeleven pricing page: 403. OBDeleven help centre collection: 404. Carista FAQ and pricing paths: 404. Carly plan page loaded with no price content.
- Torque main site: 500. bootmod3 site: offline placeholder only. Launch Trustpilot: 404; Launch corporate domain redirected to an unrelated company. EOBD Facile and Carly group domains: DNS failure.
- Reddit: blocked by the fetch tool. Bimmerpost: 403; F30Post: connection refused.
- One arXiv guess (1912.04467) returned an unrelated complexity-theory paper and is discarded.
- OBD Fusion FAQ path and OBDLink MX+ product path: 404.
- Web search: budget exhausted before the first query ran.

---

## Source ledger

All entries were fetched on 2026-11-20. Reliability: high = primary or well-curated; med = vendor self-report or sampled reviews; low = thin, partial or marketing-heavy.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| L1 | https://carista.com/ | Vendor site | GBP bundle and PRO prices, free vs paid tiers, plans 1/12/24 months, brand list, self-claimed 3M+ drivers, conflicting ratings and warranty | med |
| L2 | https://www.bimmercode.app/ | Vendor site | Features, platforms (iOS, Android, Windows, macOS), vendor-quoted ratings 4.7 (21,741) and 4.8 (12,189), no price | med |
| L3 | https://www.obdlink.com/software/ | Vendor page | OBDLink app and OBDwiz bundled with adapters; adapter list | med |
| L4 | https://www.carscanner.info/ | Vendor site | Car Scanner features, store availability, platforms, languages; no price | med |
| L5 | https://www.obdsoftware.net/software/obdfusion | Vendor site | OBD Fusion features, iOS 17+/Android 7+, enhanced diagnostics add-on, adapter notes, about $10 per one buyer | med |
| L6 | https://www.bimmercode.app/adapters/ | Vendor page | Supported adapter list by series, OBDLink CX "Made for BimmerCode", ENET options, duplicate entries | med |
| L7 | https://www.bimmerlink.app/ | Vendor site | BimmerLink features, coverage years, vendor-quoted ratings 4.7 (9,846) and 4.5 (5,770), no price | med |
| L8 | https://www.mycarly.com/ | Vendor site | 43 brands, features, scanner free with Premium and non-refundable, unevidenced endorsements | low |
| L9 | https://www.palmerperformance.com/products/dashcommand/ | Vendor page | DashCommand platforms, purchase model, features, legacy OS support | med |
| L10 | https://www.trustpilot.com/review/obdeleven.com | Review site | 3.9/5, 4,506 reviews, distribution, complaint and praise themes | med |
| L11 | https://www.trustpilot.com/review/mycarly.com | Review site | 2.6/5, 17,650 reviews, 40% five-star and 40% one-star, subscription complaints | med |
| L12 | https://www.trustpilot.com/review/carista.com | Review site | 1.7/5, 46 reviews, paywall and compatibility complaints | med |
| L13 | https://www.trustpilot.com/review/obdlink.com | Review site | 2.6/5 on 4 reviews, unclaimed profile, anecdotal | low |
| L14 | https://www.trustpilot.com/review/bimmercode.app | Review site | 3.7/5, one recent review, praise only | low |
| L15 | https://www.trustpilot.com/review/icarsoft.com | Review site | 3.7/5, 180 reviews, advertised-function failures, support complaints | med |
| L16 | https://www.trustpilot.com/review/www.autel.com | Review site | 1.5/5, 127 reviews, renewal costs of $500 to $800, lockout allegations | med |
| L17 | https://en.wikipedia.org/wiki/OBD-II_PIDs | Encyclopedia | Standard PIDs public; manufacturer PIDs restricted and paywalled | high |
| L18 | https://github.com/topics/obd2 | Code index | Top OBD2 repos, stars, languages, 760 results | med |
| L19 | https://github.com/pires/android-obd-reader | GitHub README | Apache-2.0, 839 stars, archived 2017 | high |
| L20 | https://www.obdlink.com/products/obdlink-cx/ | Vendor page | $79.95, BLE 5.1, 3-year warranty, BimmerCode claims | med |
| L21 | https://support.obdeleven.com/ | Vendor help index | Help structure only (29 plan articles); no prices | low |
| L22 | https://www.mhdtuning.com/ | Vendor site | Per-engine licences, flash times, adapters, features | med |
| L23 | https://www.obdlink.com/products/ | Vendor page | Adapter prices $69.95 to $149.95 | med |
| L24 | https://en.wikipedia.org/wiki/ELM327 | Encyclopedia | ELM327 history, clones, protocols, closure announced 2020 | high |
| L25 | https://github.com/Ircama/ELM327-emulator | GitHub README | Emulator purpose; NC licence badge (README only) | med |
| L26 | https://github.com/brendan-w/python-OBD | GitHub README | GPL-2.0, 1.3k stars (README only) | high |
| L27 | https://github.com/cedricp/ddt4all | GitHub README | GPL-3.0+, CAN diagnostic app, disclaimers (README only) | high |
| L28 | https://www.forscan.org/home.html | Vendor site | Extended licence for programming, recommended adapters | med |
| L29 | https://github.com/provrb/obdium | GitHub README | GPL-3.0, Rust, v1.5.1, manufacturer PIDs planned (README only) | high |
| L30 | https://www.icarsoft.com/ | Vendor site | Product lines, lifetime-update claim, no subscription | med |
| L31 | https://www.obdlink.com/software/obdlink-app/ | Vendor page | Free app, enhanced diagnostics free with MX+ and paid otherwise, brand coverage | med |
| L32 | https://www.carscanner.info/faq/ | Vendor FAQ | Price tiers identical, per-store purchase, iOS BLE-only, bad-adapter notes | med |
| L33 | https://www.bimmercode.app/vehicles/ | Vendor page | Manufacturers covered; no module counts or limits stated | low |
| L34 | https://en.wikipedia.org/wiki/On-board_diagnostics | Encyclopedia | OBD regulatory timeline, standards, lack of authentication | high |
| L35 | http://wiki.torque-bhp.com/view/Main_Page | Vendor wiki | Torque features, plugins, themes; no pricing | med |
| L36 | https://github.com/mickeyl/LTSupportAutomotive | GitHub README | MIT, iOS BLE guidance, maintenance mode | high |
| L37 | https://github.com/pylessard/python-udsoncan | GitHub README | MIT, UDS in Python, 746 stars | high |

**pagesRead: 37**
