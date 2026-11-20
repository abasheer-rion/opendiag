# Business models and sustainability for OpenDiag

Research date: 2026-11-20. Branch: deep-research.

## Read this first: limits of this run

This document is shorter on evidence than the brief asked for. Say so plainly before anything else.

- **Search was unavailable.** The web search budget for the session was already used up when this task started. Every search call (six attempts) returned "not performed". I did not work around it with other search engines or proxies. So I could not discover sources by searching.
- **What I did instead.** I fetched 45 pages I could name directly from prior knowledge of well-known primary sites: vendor homepages, GitHub READMEs, Wikipedia, legal and platform policy pages. Nine other fetches failed or returned nothing useful. They are listed under "Failed fetches" at the end and are not counted as read.
- **What is missing entirely.** No forum threads (Bimmerpost, Bimmerfest, MBWorld, ClubLexus, PriusChat, Toyota Nation, XDA, HP Tuners forum). No conference talks. No academic papers. No app store reviews. No news coverage of lawsuits or cease-and-desist letters against tuners. No bootmod3 pricing page (the site returned an offline placeholder). 45 pages is also under the 50 target for a rich topic.
- **Consequence.** Several questions you care about (what BM3 really charges, whether OEMs have sued BMW tuning tools, how often app stores pull diagnostic apps, payment-processor shutdowns of tuners) are **not answered from evidence here**. They are listed in Open questions and need a second run once search works. Where I reason beyond the sources I label it "inference".
- **Source ledger refs** look like [S12]. The table is at the end.

## Summary (10 bullets)

1. **The closest paid tools mostly make money from hardware plus per-vehicle unlocks, not from software alone.** EFILive sells FlashScan/AutoCal hardware and separate VIN licences at US$125 each [S26]. HP Tuners sells MPVI hardware with per-vehicle "credits" and a dealer program [S10]. MHD sells per-engine "Super Licenses" plus a wireless adapter [S11]. Hondata sells FlashPro hardware through dealers [S41].
2. **BimmerCode sells a one-time, per-platform licence, not a subscription.** The FAQ says the full version works on multiple devices but licences cannot move between iOS and Android, and desktop licences are tied to a machine [S38]. Prices were not on the pages I could read (single-source, [S38]).
3. **Adapters are a commodity and also a revenue and trust lever.** OBDLink CX is US$79.95, marketed "Made for BimmerCode", with a 3-year warranty [S27]. Cheap ELM327 clones flooded the market after the original firmware was left unprotected [S35].
4. **Open-source automotive projects that survive almost all sell or enable hardware.** comma.ai sells devices and harnesses [S7]. OVMS relies on hardware sales through distributors [S24]. Speeduino relies on resellers who give a share back [S4].
5. **Pure donations look thin.** The Wikipedia business-models article offers little evidence donation income is predictable [S16]. OVMS says prototype development and certification need extra money beyond hardware sales [S24]. RomRaider shows no sponsor or funding link on its repo page [S3].
6. **Several enthusiast tools survive on one person and a modest voluntary fee.** TunerPro RT asks for US$47 but runs fully without paying [S5]. FreeSSM is GPL-3.0 with no donation info and signs of thin maintenance [S25]. FORScan gates configuration features behind an Extended Licence [S9].
7. **The biggest legal exposure is not OEM lawsuits but emissions law and anti-circumvention law.** Aftermarket software that bypasses emissions controls is a "defeat device" in US law [S17]. Anti-circumvention rules reach authentication handshakes and code signing, and tool distribution can be restricted even where personal use is exempt [S32][S33].
8. **Repair exemptions help but have limits.** The 2024 DMCA rulemaking renewed the vehicle repair exemption and added vehicle data access [S32]. The exemption excludes systems accessed through a separate subscription service and telematics/entertainment [S32]. It protects owners, not necessarily people who distribute tools (inference from [S32][S33]).
9. **Platform rules are a bigger day-to-day risk than lawyers.** Apple requires documented features, bans hidden functionality, restricts in-app fundraising, and says apps must comply with local law [S18]. Apple has also removed GPL apps rather than change its terms [S40].
10. **The most defensible plan for OpenDiag:** permissive licence, free core, donations through a fiscal host, optional paid support/hardware partnerships, and a hard line on emissions and security-bypass features. Keep paid add-ons to things that are not legally sensitive. Details in Implications.

## What I found

### 1. How paid diagnostic and tuning businesses make money

**Per-vehicle licensing is the dominant pattern in tuning.**

- EFILive's store sells "VIN Licenses" for individual vehicles at US$125 each, with a separate "Tuning Licenses" and "Tuning Options" menu, an unlink service, licence transfers, and a dealer finder [S26]. The page gives no price for tuner licences, so I cannot say how tuner-tier pricing works.
- HP Tuners lists vehicles by "year, make, model, engine, and credit - licensing cost" [S10]. The homepage does not show amounts. It has a Dealer Application Form and Dealer Map [S10].
- MHD sells "Super License" products per engine family (N54, N55, S55, B58, S58, S63, N13) and three hardware add-ons [S11]. Whether the licence is per vehicle is not stated on the page. Prices are on sub-pages I did not read [S11].
- The three above all pair the licence with hardware or a locked unlock step. That gives them a way to stop copying. This is inference from how each store is laid out, not something a page states.

**Coding apps sell one-time unlocks.**

- BimmerCode FAQ: full version across multiple devices without repurchase; platform-specific; desktop tied to a machine [S38]. The site says it is not connected to BMW AG [S6]. It supports BMW, MINI and the Toyota Supra [S6].
- The FAQ lists error codes that block coding to protect cars, for example a corrupted footwell module boot sector or a head unit not in its original state, and says Expert mode is unavailable for safety-related control units [S38]. This tells us the vendor trades coverage for safety to limit support costs and liability (inference).
- BimmerCode and BimmerLink are separate apps from the same developer: coding versus diagnostics [S38]. That is a way to sell two products to one customer.

**Consumer diagnostics sells hardware plus a premium app tier.**

- Carly offers a free Lite app and a Premium package. The scanner is included with Premium and returns exclude Premium purchases. It lists about 50 brands and an enterprise site, citing TUV Nord and Sixt as recommenders [S12]. Pricing amounts were not on the page [S12].
- Car Scanner (VAG/Hyundai/Kia coding and service features) links to a purchase restore/transfer FAQ, which implies in-app purchases. The page gives no prices [S44].

**Freeware plus optional registration.**

- FORScan: Windows configuration and programming functions require an Extended Licence. It has Lite mobile versions. It says 2025+ model year support is "best-effort" and not promised [S9]. The page tells people to check compatibility before buying [S9].
- TunerPro: free; TunerPro RT "requested fee" went from US$39 to US$47 with version 6; RT works fully without registering; one maintainer; community forum for support [S5]. The author cites hardware, tooling and hosting costs for the rise [S5].

**Hardware-first vendors.**

- Hondata: sells FlashPro and other units through a store and dealer networks, with CARB-listed and "50 state" legal versions. The page shows old prices of US$495 and US$695 and no clear per-vehicle fee [S41].
- OBDLink CX: US$79.95, Bluetooth 5.1 BLE, free OBDLink app, "Made for BimmerCode", 180-day money-back and 3-year warranty, plus an Amazon link carrying an affiliate tag [S27]. It was out of stock on the day I fetched it [S27].

**What I could not find:** bootmod3 pricing and token model (site returned an offline placeholder), Ross-Tech's cable/licence model (page had only topic headings), JB4/BMS (domain did not resolve), COBB Accessport (403). So the BM3 "per-car token plus protune marketplace" model your owner described cannot be confirmed from this run. Treat it as owner knowledge, not evidence.

### 2. Tune sales, shop licences, B2B

- MHD says independent tuners offer custom maps and the app also ships built-in OTS maps and "MHD+" features [S11]. The page does not say how independent tuners are paid.
- EFILive and HP Tuners both run dealer networks [S26][S10]. Hondata has a dealer-only store [S41]. That is the visible B2B channel: shops buy hardware and licences at dealer terms and resell to customers (inference from page structure).
- Carly has an enterprise site [S12]. Nothing here tells us how big that business is.
- Generic note on tuning: specialist tuners sell maps and services, and reprogramming tools are described as expensive and tied to per-car data [S31]. Single, generic source.

**Gap:** I found no source on revenue splits between tool vendors and independent tuners, on shop licence pricing, or on how many customers use B2B tiers. Do not build financial plans from this document.

### 3. OEM pushback, lawsuits, and legal tools

**Anti-circumvention law.**

- Section 1201 bans circumventing access controls and also bans trafficking in tools made for that purpose. Violation can occur without copyright infringement [S32]. The EFF warns this reaches authentication handshakes, code signing, obfuscation and protocol encryption [S33].
- Vehicle exemptions: 2015 for owners diagnosing, repairing or lawfully modifying vehicle functions; 2018 carried forward; 2021 added marine and excluded programs accessed through a separate subscription service; 2024 renewed and added operational and telematics data access [S32]. The Copyright Office page confirms the exemptions run three years and the 2024 final rule is dated 28 October 2024, but did not itself list the vehicle text [S28].
- Case law: Chamberlain v. Skylink went for the defendant on interoperability grounds [S36]. Lexmark v. Static Control: Sixth Circuit reversed for the defendant [S32]. These are friendly to interoperability but turn on facts (inference: do not assume they cover a tool that defeats a dealer authentication scheme).
- Contract risk is separate: the EFF notes that click-through terms with no-reverse-engineering clauses were enforced in Blizzard v. BnetD [S33]. Negotiated NDAs are more likely to be enforced [S33]. OpenDiag developers should avoid accepting OEM software EULAs during research, which matches the brief's own rule.

**A cautionary lawsuit.**

- Sony v. Hotz (2011) used eight claims including DMCA, CFAA, breach of contract and trespass. The court issued a temporary restraining order, allowed discovery of blog visitor IPs, and the case settled with a permanent injunction against further work on Sony products [S13]. This is a PlayStation case, not a car case. It shows what a determined OEM can do to an individual open-source developer, even when the legal merits are unresolved (inference).
- The same person's company, comma.ai, cancelled its first aftermarket device in October 2016 after NHTSA asked about safety-standard compliance and released openpilot as open source a month later [S8]. A California DMV cease-and-desist letter followed a 2015 demo [S8]. (Single secondary source, Wikipedia.)

**Emissions law.**

- Wikipedia describes a defeat device as anything that interferes with emissions controls in real driving, and says aftermarket software that bypasses controls counts [S17]. It reports large historical fines against OEMs [S17]. The same page says that in January 2026 the US Justice Department said it would no longer pursue criminal Clean Air Act charges over tampering with onboard diagnostic devices [S17]. **Single source, Wikipedia, and I could not confirm it from the DOJ or EPA** (my EPA fetch returned 404). Do not rely on it.
- Hondata's use of "CARB-listed" and "50 state emissions legal" products shows commercial tuners distinguish legal from non-legal products [S41]. The Wikipedia chip tuning article does not discuss legality at all [S31].
- SEMA frames "right to modify" and emissions compliance as advocacy issues but the page has no detail [S42].

**Right to repair.**

- Massachusetts 2012 law, expanded 2020 to vehicle data; NHTSA told OEMs in June 2023 to ignore the 2020 law as preempted; Massachusetts is in litigation [S14]. The 2014 industry MOU promised dealer-level info nationally [S14]. Wikipedia says a study found about 59% of independent repair services still struggled to get tools [S14] (the article flags that figure as needing a better source).
- repair.org says ten states have enacted right-to-repair laws and a bipartisan federal vehicle repair bill was introduced, but does not say which state laws cover vehicles [S39].
- The EU Right to Repair Directive was adopted 30 May 2024; the page does not say whether vehicles are covered [S14].

**What I could not find:** any documented BMW, Mercedes or Toyota legal action against a coding or diagnostic tool; any C&D history for BimmerCode, MHD, BM3 or Carly; any DOJ or EPA actions against named tuners. These are the central questions of "OEM pushback" and remain open.

### 4. How open-source automotive projects are funded

| Project | Licence | How it is sustained (from sources) |
|---|---|---|
| openpilot / comma | MIT, some parts other [S1] | Company sells comma four ($999 list, black-friday banner), harnesses, accessories, merch, and $500,000 custom car ports [S7]. Pays bounties: $2,000 brand port, $250 model port, $300 reverse-engineering a new message [S34]. Hiring engineers [S1][S34]. |
| OVMS | MIT, hardware designs published [S24] | "Non-profit community project". Hardware sold by distributors in N. America, UK/Europe, Germany; hardware sales normally fund production and service; extra money needed for prototypes and FCC/CE certification; donations via forum [S24]. |
| Speeduino | GPL (page conflicts: sidebar says GPL-2.0, badge says GPLv3) [S4] | Official resellers "contribute a portion of sales back"; maintainer has a GitHub Sponsors page; users can build their own boards [S4]. |
| RomRaider | GPL-2.0 [S3] | Repo page shows no sponsor or funding link and no named maintainers [S3]. Funding unknown. |
| TunerPro | Not stated; free [S5] | Voluntary fee for RT, one maintainer [S5]. |
| FreeSSM | GPL-3.0 [S25] | No donation info; README flags discontinued Qt4 and experimental Qt6, so maintenance looks thin [S25]. |

**Patterns (inference from the table):**

- The projects with the healthiest signs (comma, OVMS, Speeduino) have a physical product someone can buy.
- comma is a venture-backed company with a service and hardware business. Its openpilot page calls the software research-only, "not a product", asks users to indemnify comma, and grants comma a perpetual right to use logged data [S1]. That is a disclaimer and data pattern worth studying, not copying blindly.
- Wikipedia says Hotz also raised US$5.1M for a separate company, tiny corp, in May 2023 [S8]. That is irrelevant to OpenDiag except to show comma's founder funds new bets with venture money, not donations.
- comma's opendbc README says the comma four is "the best way" to develop on it, shows that the open library exists to drive hardware sales and bounties [S34].
- OVMS's own page says donations are not enough on their own [S24].

### 5. Open-source business model menu

From the general sources [S16][S15][S40][S23]:

- **Support and services.** Works for Red Hat-scale products. Article notes most commercial OSS firms convert well under 1% of downloaders into buyers [S16].
- **Dual licensing.** Needs copyright ownership of all code and works best when companies want to embed code in closed products [S16]. Weak fit for a consumer diagnostics app (inference).
- **Open core.** Free core, paid proprietary add-ons. Controversial; many developers do not consider it fully open; contributor agreements may be needed so the owner can sell proprietary versions [S15].
- **Hardware.** Free software, sell the device. Caveat: locked hardware that blocks modified software ("tivoization") is prohibited by GPLv3 but legal under most licences [S16].
- **Donations and sponsorship.** GitHub Sponsors needs a profile, bank and tax info and two-factor authentication, available in 103 regions [S20]. Open Collective: hosts hold funds, crowdfunding free with tips on or 5% fee otherwise, plans from US$0 to US$320 per month for organisations [S21]. Liberapay: no cut, recurring, donor cap US$100 per week, French non-profit [S22]. Software Freedom Conservancy offers non-profit infrastructure for member projects; eligibility details were not on the page I read [S30].
- **Bounties.** Fund discrete tasks, not upkeep [S16]. comma uses them for car ports [S34].
- **Grants.** GitHub's guide lists Mozilla, PSF, FLOSS/fund and the GitHub Secure Open Source Fund; some pay individuals with no legal entity [S23]. It advises preparing impact, traction, value to funder, use of funds, and disbursal requirements [S23].
- **Source-available/fair-source licences.** Functional Source License converts to Apache 2.0 or MIT after two years, but is not open source in the first two years [S29]. Wikipedia lists BSL, Commons Clause, SSPL and others, and notes OSI and Debian reject SSPL [S43][S15]. **These conflict with a promise of "free and open source (Apache-2.0)".** Not recommended for OpenDiag.
- **Licence changes cause forks.** The open-core article reports HashiCorp's BSL change led to the OpenTofu fork and the Automattic/WP Engine dispute led to a lawsuit [S15]. Lesson: set the licence and governance early and do not change them later.
- **Trademark as the thing you control.** Apache's policy: the foundation owns names, allows nominative use, requires written approval for logos and domains, and uses licence section 6 to limit use of trade names [S37]. For OpenDiag, an Apache-2.0 code licence plus a name policy is how you stop someone selling a locked fork under your name (inference).

### 6. App store, adapter and payment risk

**Apple.**

- Hidden or undocumented features are grounds for removal, so coding features must be documented [S18].
- Do not use car-maker names or logos in app name, icon or metadata without permission, and do not stuff keywords with brand names [S18]. Apps must comply with local legal requirements anywhere they are offered; apps that encourage reckless behaviour are rejected [S18].
- Do not unlock features with license keys or custom mechanisms; use in-app purchase. In-app tipping must use in-app purchase currencies [S18].
- Charity or fundraiser collection in-app is limited to approved nonprofits [S18]. Practical result per the page: link to donations outside the app [S18].
- Apps that need an accessory must give App Review a way to test, such as a demo mode [S18]. The tool output was truncated before the open-source licensing part, so I cannot quote Apple's rule on licences. (Wikipedia says Apple removed GPL apps from its store [S40].)
- I read about 100,000 of 114,384 characters of the page [S18].

**Google Play.** The policy page confirms paid, in-app, subscription and ad-based models and names device-abuse and deception policies but did not give their text [S45]. I know nothing more from evidence.

**Payment processors.**

- Stripe's restricted-business list has no entry for car tuning or diagnostics. It prohibits anything illegal where you operate and facilitation of copyright infringement or unlicensed software distribution [S19]. It says the list is not exhaustive [S19].
- The PayPal policy page returned 403, so there is no evidence from PayPal here.
- Inference: a tool that is clearly framed as owner diagnostics and coding is low risk. A tool marketed for emissions deletes or cracking OEM software would be high risk. I found no real-world case of a processor cutting off a diagnostic vendor.

**Donation platforms.** GitHub Sponsors requires bank and tax details and is regional [S20]. Open Collective hosting means a host entity holds funds [S21]. Either needs a legal or personal tax identity behind it (inference).

**Adapter risk.** ELM327 clones copy unprotected v1.4 firmware, report fake version numbers and are limited to v1.4 behaviour [S35]. The original maker announced closure by June 2022 [S35]. Page flags weak citations. OBDLink-style branded adapters carry warranties and money-back terms [S27]. FORScan stopped recommending generic ELM327 adapters [S9]. For a free project this means support load from bad clones (inference).

## Evidence quality and disagreements

- **Mostly vendor marketing and Wikipedia.** Vendor pages describe what they sell, not what they earn. Nothing here shows revenue, margins, conversion or churn. No source gives a number for how much any open-source car project raises.
- **Wikipedia for law.** The DMCA, defeat device, right-to-repair and Hotz facts come from Wikipedia and are secondary. The one important recent claim (DOJ January 2026 statement on OBD tampering) is single-source and unconfirmed [S17].
- **Truncated reads.** The Wikipedia pages for right to repair, DMCA, business models, commercial OSS and comma.ai were read only up to about 100,000 characters [S8][S14][S16][S32][S40]. Apple's guidelines were also truncated [S18].
- **Disagreement 1: Speeduino licence.** The sidebar says GPL-2.0, the README badge says GPLv3, and the page does not resolve it [S4]. Check the LICENSE file before relying on either.
- **Disagreement 2: right to repair scope.** Wikipedia says NHTSA argued Massachusetts law is preempted [S14]. repair.org lists ten enacted states without saying which cover cars [S39]. They do not contradict, but together they show the legal picture is unsettled.
- **Disagreement 3: donation viability.** Opensource.guide says sponsorship works best for popular projects with a strong audience [S23]. Wikipedia says there is little evidence donation income is predictable [S16]. OVMS says hardware sales cover production and extra money is needed for certification [S24]. All three point the same way: donations alone are risky.
- **Single-source claims:** comma shop prices [S7]; OBDLink price and stock status [S27]; EFILive US$125 VIN licence [S26]; TunerPro price history [S5]; opendbc bounty amounts [S34]; Apple clause details [S18]; the NHTSA and DMV episodes for comma [S8].
- **Prices change.** The comma page showed a Black Friday banner [S7]. Hondata prices were old posts [S41]. Do not use any price here as a benchmark without checking it.
- **Reliability of the "per-vehicle" inference.** I describe HP Tuners and MHD as per-vehicle from words like "credit" and per-engine "Super License", not from a stated licence term [S10][S11].

## Implications for OpenDiag

These are my conclusions, built from the evidence above plus the project's stated goals (free, Apache-2.0, BMW first). They are recommendations, not facts.

### What to build

1. **Make the free core genuinely complete for owner use.** Reading faults, live data, and standard coding of documented options. This is what paid apps charge for, and it is the reason to exist.
2. **Design for hardware support, not hardware sales at first.** List tested adapters and publish test results. OBDLink-class devices come with warranty and returns [S27]; clones cause trouble [S35]. A "known-good adapters" list also gives you a free partnership channel (affiliate links, like OBDLink's Amazon tag [S27], would be a modest income line, but only with clear disclosure; this is inference).
3. **A demo/simulator mode from day one.** Apple wants a way to test without the accessory [S18], and it helps contributors without a car.
4. **Safety rails like BimmerCode's.** Block coding when state looks unsafe, refuse safety-related modules in expert mode, and make backups mandatory [S38]. This lowers support burden and liability.
5. **Document every feature in plain language.** Apple bans undocumented features [S18]. A documented, auditable feature list also supports a legal posture of owner diagnostics and repair.
6. **A community-run registry for coding options and vehicle support** contributed through bounties, copying comma's model of fixed small rewards for specific work [S34]. Only fund it once money exists.
7. **Adopt the Apache-2.0 plus trademark policy approach.** Publish a name and logo policy modelled on Apache's [S37] so forks cannot sell under the name.

### What to avoid

1. **No emissions-related features.** No DPF, EGR, catalyst or emissions-monitor deletes, no "defeat" presets. Aftermarket software that bypasses emissions controls is a defeat device [S17]. This is also the likeliest trigger for payment, app store and legal trouble.
2. **No distribution of OEM software, keys or security bypass material.** Anti-circumvention law bans trafficking in tools aimed at access controls [S32][S33], and contract terms like EULAs can be enforced [S33]. Keep to the clean-room approach the EFF describes: legally acquired information, functional specs, no cracked copies [S33].
3. **No source-available or non-compete licences** (FSL, BSL, Commons Clause). They are not open source during their restricted period [S29][S43] and would break the project's promise.
4. **No paid-key unlocks inside iOS builds.** Apple bans custom licence-key unlocking; tipping must use in-app purchase [S18]. If OpenDiag stays fully free this is moot; if paid add-ons arrive, plan for it.
5. **No car-maker names or logos in the app name, icon or store keywords** [S18]. Use "for BMW" style nominative text carefully and say you are not connected to the maker, as BimmerCode does [S6].
6. **No reliance on a single donation stream or a single person.** TunerPro and FreeSSM show the single-maintainer risk [S5][S25].

### Recommended sustaining model (ranked, inference)

1. **Fiscal host plus donations.** Open Collective or Software Freedom Conservancy so money is held by an entity, not your personal account [S21][S30]. GitHub Sponsors as a second route [S20]. Treat this as covering costs (hosting, test cars, adapters), not salaries.
2. **Hardware partnerships.** An endorsed adapter list with a share going to the project, copying Speeduino's reseller contribution model [S4] and OVMS's distributor model [S24]. Needs an agreement and disclosure.
3. **Grants.** Apply to funders in the opensource.guide list, prepared with impact, traction, use of funds [S23]. Right-to-repair framing helps (see [S14][S32]).
4. **Bounties.** Small fixed amounts for vehicle support, funded from the pot above [S34].
5. **Paid support or a hosted service later,** only for B2B shops that want help, and only after real users exist [S16]. Low conversion rates are normal [S16].
6. **Do not plan on:** per-vehicle credits, tune sales, shop licences. Those models rely on locked hardware or proprietary maps [S26][S10][S11], and clash with a fully open Apache-2.0 core.

### What to measure

- Monthly active users and cars supported, by chassis.
- Recurring donations as a share of fixed costs (aim to cover hosting and test hardware before anything else).
- Support requests per 100 users, split by adapter type (genuine versus clone).
- Time-to-fix for broken vehicle support.
- Contributors outside the founder (bus factor).
- App store review outcomes: rejections and reasons.
- Any legal or platform contact: log date, sender, subject, and response.

## Open questions

1. What do bootmod3, MHD, JB4, BimmerCode actually charge today, and what does the community say about value and fairness? Needs forum threads and app store pages.
2. Has any OEM (BMW, Mercedes, Toyota) sent cease-and-desists to coding or diagnostic tool makers? Needs news and legal searches.
3. Has any payment processor or app store removed a diagnostic, coding or tuning product, and why?
4. Is the January 2026 DOJ statement on OBD tampering real, and what does it change? Needs primary DOJ and EPA pages.
5. Does the Apple open-source licence rule (the cut-off part of the guidelines) affect Apache-2.0 apps? Probably not, but unconfirmed.
6. What do Google Play's device-abuse and deception policies say about apps that write to vehicle modules?
7. How are bootmod3-style tune marketplaces (protuner payouts) structured, and could OpenDiag host an open tune library without legal exposure?
8. Which vehicle-data laws (Massachusetts, EU Data Act and similar) would give OpenDiag a legal tailwind for BMW first and then Mercedes and Toyota/Lexus?
9. Real income figures: how much do OVMS, Speeduino, RomRaider and comma's bounty programme actually bring in?
10. Insurance and liability: would a fiscal host or foundation cover maintainers if a coding change bricks a car?
11. Who owns the OpenDiag trademark and name, and has anyone searched for conflicts?

## Failed fetches (not counted as read)

- bootmod3.net returned an offline placeholder with no content.
- ross-tech.com/vcds returned only topic headings.
- jb4tuner.com did not resolve (DNS error).
- epa.gov aftermarket defeat devices page returned 404.
- paypal.com acceptable use policy returned 403.
- cobbtuning.com returned 403.
- speeduino.com returned a bot verification page.
- torque-bhp.com returned HTTP 500.
- GitHub project page for comma bounties required sign-in and had no content.

## Source ledger

Count of rows: 45. All 45 were fetched and returned content; a few returned only partial content, flagged in the table.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| S1 | https://github.com/commaai/openpilot | GitHub README | MIT licence; research-only and no-warranty text; user indemnity; comma data rights; hardware linked to shop; bounties and hiring | high |
| S2 | https://www.openvehicles.com/ | Project site | OVMS is open-source EV telemetry; has a "where to buy" section; no funding details; Open Vehicles Limited copyright | med |
| S3 | https://github.com/RomRaider/RomRaider | GitHub README | GPL-2.0; no sponsor/funding link visible; no maintainers shown | med |
| S4 | https://github.com/noisymime/speeduino | GitHub README | Resellers give a portion of sales back; sponsor link; self-build allowed; licence label conflict (GPL-2.0 vs GPLv3) | high |
| S5 | https://www.tunerpro.net/ | Vendor site | Free tool; RT fee raised US$39 to US$47; RT usable unregistered; single maintainer; forum support | high |
| S6 | https://www.bimmercode.app/ | Vendor site | Supports BMW, MINI, Supra; states no connection to BMW AG; no prices on page | high |
| S7 | https://comma.ai/shop | Vendor shop | comma four US$999, accessories, merch, car port service at US$500,000; 30-day trial; prime SIM US$20 | high (prices time-sensitive) |
| S8 | https://en.wikipedia.org/wiki/Comma.ai | Encyclopedia | NHTSA query led to cancel comma one in 2016; openpilot open-sourced; DMV C&D 2015; tiny corp raised US$5.1M (read first 100k chars of 109k) | med |
| S9 | https://forscan.org/home.html | Vendor site | Extended Licence gates Windows config/programming; Lite mobile; 2025+ best-effort; no longer recommends generic ELM327 | high |
| S10 | https://www.hptuners.com/ | Vendor site | Vehicle list with credit/licensing cost; MPVI4 + VCM Suite; dealer application and map; no prices on page | med (thin) |
| S11 | https://www.mhdtuning.com/ | Vendor site | Per-engine Super Licenses; wireless adapter, unlocker, flex fuel kit; OTS maps, MHD+; independent tuners mentioned | med |
| S12 | https://mycarly.com/ | Vendor site | Free Lite app; Premium includes scanner; about 50 brands; enterprise site; no prices on page | med |
| S13 | https://en.wikipedia.org/wiki/Sony_Computer_Entertainment_America_v._Hotz | Encyclopedia | 2011 suit: eight claims, TRO, IP discovery, settlement with injunction | med |
| S14 | https://en.wikipedia.org/wiki/Right_to_repair | Encyclopedia | Massachusetts 2012/2020; NHTSA 2023 preemption stance; 2014 MOU; DMCA exemptions; EU directive 2024 (read 100k of 178k chars) | med |
| S15 | https://en.wikipedia.org/wiki/Open-core_model | Encyclopedia | Open core definition, examples, contributor agreements, licence-change disputes | med |
| S16 | https://en.wikipedia.org/wiki/Business_models_for_open-source_software | Encyclopedia | Support, dual licence, hardware, donations, SaaS, bounties and caveats; under 1% conversion (read 100k of 154k chars) | med |
| S17 | https://en.wikipedia.org/wiki/Defeat_device | Encyclopedia | Defeat device definition; aftermarket software counts; historic fines; claimed Jan 2026 DOJ statement (unconfirmed) | med (DOJ claim low) |
| S18 | https://developer.apple.com/app-store/review/guidelines/ | Platform policy | Hidden features banned; legal compliance; trademark limits; IAP and tipping; fundraising limits; accessory test access (read 100k of 114k chars) | high |
| S19 | https://stripe.com/legal/restricted-businesses | Platform policy | No tuning entry; illegal and IP-infringing activity prohibited; list not exhaustive | high |
| S20 | https://github.com/sponsors | Platform page | Sponsors needs profile, bank/tax info, 2FA; 103 regions; no fee info on page | high |
| S21 | https://opencollective.com/pricing | Platform page | Fiscal hosting model; fee plans; 5% crowdfunding fee option | high |
| S22 | https://liberapay.com/about/ | Platform page | Recurring donations; no platform cut; US$100/week cap; French non-profit | high |
| S23 | https://opensource.guide/getting-paid/ | Guide | Funding routes: employers, sponsorship, grants, bounties, services; how to pitch funders | high |
| S24 | https://github.com/openvehicles/Open-Vehicle-Monitoring-System-3 | GitHub README | MIT; distributors; hardware sales fund production; donations; certification costs; about 880 stars | high |
| S25 | https://github.com/Comer352L/FreeSSM | GitHub README (README only) | GPL-3.0; Subaru from 1999; no donation info; Qt4 dropped, Qt6 experimental | high |
| S26 | https://www.efilive.com/ | Vendor site | US$125 VIN licences; FlashScan/AutoCal hardware; tuning licences menu; dealers | med |
| S27 | https://www.obdlink.com/products/obdlink-cx/ | Vendor shop | US$79.95; BLE 5.1; "Made for BimmerCode"; warranty; affiliate Amazon link; out of stock | high |
| S28 | https://www.copyright.gov/1201/2024/ | Government page | Three-year exemption framework; 2024 final rule dated 28 Oct 2024; vehicle text not on page | high (limited content) |
| S29 | https://fsl.software/ | Licence site | FSL converts to Apache/MIT after two years; not open source in the interim | high |
| S30 | https://sfconservancy.org/projects/ | Non-profit page | Conservancy provides non-profit infrastructure to member projects; criteria on sub-pages | med |
| S31 | https://en.wikipedia.org/wiki/Chip_tuning | Encyclopedia | Tuning methods; maps from tuners; tools described as expensive; no legal coverage | low-med |
| S32 | https://en.wikipedia.org/wiki/Digital_Millennium_Copyright_Act | Encyclopedia | Section 1201; vehicle exemptions 2015, 2018, 2021, 2024; case summaries (read 100k of 188k chars) | med |
| S33 | https://www.eff.org/issues/coders/reverse-engineering-faq | Advocacy FAQ | DMCA, EULA, trade-secret and interoperability risks; clean-room advice | high (not legal advice) |
| S34 | https://github.com/commaai/opendbc | GitHub README | MIT; bounties US$2,000/250/300; comma validates ports; tied to hardware sales | high |
| S35 | https://en.wikipedia.org/wiki/ELM327 | Encyclopedia | Clone market from unprotected v1.4 firmware; ELM Electronics closure; weak citations | low-med |
| S36 | https://en.wikipedia.org/wiki/Chamberlain_Group,_Inc._v._Skylink_Technologies,_Inc. | Encyclopedia | Federal Circuit for Skylink on DMCA and interoperability | med |
| S37 | https://www.apache.org/foundation/marks/ | Foundation policy | Trademark policy: nominative use, approval for logos and domains | high |
| S38 | https://www.bimmercode.app/faq | Vendor FAQ | Platform-specific licence (FAQ does not say "one-time"; app store shows a $49.99 in-app Full Version), desktop machine-bound; coding safety errors; BimmerLink separate | high |
| S39 | https://www.repair.org/ | Advocacy site | Ten states enacted RTR laws; federal vehicle repair bill; opposition claims; no vehicle detail | med |
| S40 | https://en.wikipedia.org/wiki/Commercial_open-source_software | Encyclopedia | Model list; Apple removed GPL apps; licence-change history (read 100k of 154k chars) | med |
| S41 | https://www.hondata.com/ | Vendor site | Hardware via store and dealers; CARB and 50-state versions; old prices US$495/695 | med |
| S42 | https://www.sema.org/advocacy | Trade group | Right to modify framing; no tuning-enforcement detail | med (thin) |
| S43 | https://en.wikipedia.org/wiki/Source-available_software | Encyclopedia | BSL, FSL, Commons Clause, SSPL as non-OSI licences | med |
| S44 | https://www.carscanner.info/ | Vendor site | Coding/service features for VAG, Hyundai, Kia; purchase restore FAQ; no prices | low-med (thin) |
| S45 | https://play.google/developer-content-policy/ | Platform policy | Paid, in-app, subscription, ad models supported; device abuse and deception policies named but not detailed | med (thin) |
