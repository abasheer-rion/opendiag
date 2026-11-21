# Mercedes-Benz and Toyota/Lexus diagnostics: the practical reality for hobbyists

Written 2026-11-20 for OpenDiag. Not legal advice. Research method: web search and page fetches run on 2026-11-20. Most quotes are paraphrased. Nothing here describes how to defeat a security mechanism, and nothing here relied on leaked or pirated OEM material.

## Executive summary

1. **Both brands run the same model: the factory tool is a paid, online, identity-checked product aimed at workshops. Private owners are mostly outside the official channel.** Mercedes says outright that XENTRY Remote Diagnosis excludes private individuals [M3]. Toyota sells Techstream access through a public subscription page, which is far more open [T1][T2]. Whether any identity or business check applies at signup for the Professional tier was not established; only the Security tier is documented as needing NASTF membership [T1][T3].
2. **Toyota is the cheaper and more open of the two.** Techstream needs a Professional Diagnostic TIS subscription: $80 for 2 days or $1,500 for a year (Snap-on's price table), plus a J2534 cable [T3]. Mercedes sells no private-owner product at all that I could find.
3. **Mercedes newer cars (206 and 223 series onward) are, per vendor and Mercedes workshop-tool sources, gated by personal logins, certificates and DoIP.** Mercedes' own Pass Thru FAQ documents "pure DoIP" series starting with 206 and 223, and a personal login for workshop users since release 06/2020 for 213 (model year 2020) and 223 [M5]. That login is for the workshop tool, not proof of what an unauthenticated OBD tester can read. One W206 forum poster (July 2025) said their coder stopped offering the service after Mercedes tightened OBD access with certificates [F1]. One post only (low).
4. **What a generic adapter reliably reads is the emissions-mandated OBD-II slice.** On Mercedes, forum users report generic ELM327 tools often see only engine and sometimes transmission modules [F2]. On Toyota, forum users report enhanced reads of hybrid, ABS, EPS and SRS on a 2006 Prius with common apps [F3]. Both are forum-level evidence (medium to low).
5. **SCN coding is a server step, not a file you can edit.** Mercedes ties it to the VIN and the Mercedes backend; the one detailed source is a workshop blog (medium to low) [M9].
6. **The legal wind in Europe is blowing toward openness.** Court of Justice case C-296/22 (Oct 2023) and Delegated Regulation 2026/699 (in force 23 June 2026, per one law-firm summary) push against manufacturer-only gates, but they protect independent operators, not private owners [R1][R2].
7. **IP risk is real.** The only open Mercedes diagnostics project with traction (OpenVehicleDiag, about 1,000 stars) lists one component as removed after a DMCA notice [O1]. Proprietary diagnostic description files (CBF, SMR-D) are where the legal heat is.
8. **A free read-only tool can plausibly offer:** standard OBD-II for all makes; Toyota enhanced readings from open signal data; Mercedes older-series module fault reading only if clean-room data can be sourced (not established); and a clear "this car is locked, here is why" screen for the rest.
9. **Biggest unknowns:** Mercedes US consumer access, current Mercedes prices, Toyota DoIP and security-gateway status on 2022+ cars, and exactly what Mercedes lets through an unauthenticated OBD tester today. See Gaps.

---

## 0. How to read this document

- Confidence tags: **high** = a primary or official page read in full for the point; **medium** = a primary page read but the point is thin, or two independent secondary sources agree; **low** = one vendor, blog, forum, or a search snippet only.
- "Fetched" means the tool returned the page text to me. Where a page returned an error or only a search summary, I say so.
- Tags like [M3] point to the Sources section. Forum posts are paraphrased in my own words and never offered as fact beyond "a poster reported".
- This doc does not repeat the protocol groundwork in `docs/research/deep/mercedes-protocols-and-access-control.md`, `mercedes-forums-and-practice.md`, `toyota-lexus-protocols-and-open-data.md` and `toyota-lexus-forums-and-practice.md`. It goes into prices, eligibility, gating mechanics, open-source projects and legal levers, which those marked as unconfirmed.

### Corrections to earlier docs worth making

| Earlier statement | What I found | Confidence |
|---|---|---|
| `mercedes-protocols-and-access-control.md` section 9 frames "SFD and SFD2" as a Mercedes mechanism and expands it as "Secure Diagnostic Flash" (marked [BG], unverified). | A search for SFD2 returned only Volkswagen Group pages. One vendor blog lists "SFD" as the VW group system and describes Mercedes as using "Xentry Lock and Seed & Key" with digital certificates [G3]. No Mercedes source I found uses the term SFD. Treat SFD/SFD2 as VW terms until a Mercedes source says otherwise. | medium |
| Toyota "no source on DoIP or secure gateway". | Still true for official Toyota sources. Only vendor claims exist (see section 4.6). | high (that no official source was found) |
| Techstream is a single product. | Toyota now calls the current software GTS+ in its Techstream Lite FAQ (April 2026) and calls "Techstream Lite" a "supplemental" low-cost platform [T2][T6] (the FAQ does not say Techstream itself is being replaced). Community sources say 2023+ models need GTS+ [T7]. | medium |

---

## 1. The landscape in one table

| Question | Mercedes-Benz | Toyota / Lexus |
|---|---|---|
| Official tool names | XENTRY Diagnosis (newer series), DAS (older series, bundled inside XENTRY), XENTRY Flash (separate right), XENTRY Pass Thru EU, XENTRY Diagnosis Lite, XENTRY Remote Diagnosis, Diagnosis Kit 4 then Kit 5 [M1][M2][M4][M6] | Techstream (older name), GTS+ (current software name in FAQ), Techstream Lite kit, ADVi (dealer system) [T2][T4] |
| Who may buy | Independent operators and workshops under EU type-approval law. Remote Diagnosis excludes private individuals [M1][M3] | Any TIS subscriber. Security functions need NASTF Vehicle Security Professional membership [T3] |
| Price shown publicly | None on Mercedes pages I read. Structure only: annual flat fee plus time credits [M1] | Yes, via Snap-on: $30 to $80 for two days, $580 to $1,500 per year depending on tier [T3] |
| Hardware | Own VCI (Kit) or tested pass-through devices; DoIP-only cars need specific named adapters [M4][M5] | J2534 interface. Toyota recommends Mongoose-Plus MFC3 or MongoosePro MFC2 and "does not recommend or support" others for diagnostics [T2] |
| Needs online | Yes, permanent, checked at start [M1][M4] | Weekly connection to TIS; persistent link not required [T2] |
| Coding | Variant coding (local) plus SCN coding (server) [M9] | "Customize" menu in Techstream [T5][T6] |
| Newer-car gating | Certificates, personal login, DoIP [M5][M7] | Unclear. Community claims of GTS+ and DoIP need; no official statement found [T7][T8] |
| Free read-only reality | OBD-II slice free; deeper modules mixed [F2][M8] | OBD-II slice free; many enhanced reads work on older cars [F3] |

---

## 2. Mercedes-Benz in detail

### 2.1 The official tool family and who it is for

| Product | What it is (per Mercedes pages) | Eligibility and terms | Confidence |
|---|---|---|---|
| **XENTRY Diagnosis Kit 4 / Kit 5** | Rugged laptop plus the XENTRY Diagnosis VCI, the full standard solution for all model series. Kit 4 could no longer be ordered from 01/2026; Kit 5 replaces it. Kit 5 ships with Windows 11, USB-C ports, and an optional USB-to-LAN adapter that lifts transfers from 100 Mbit/s over OBD to up to 300 Mbit/s [M6][M10] | MFA required. No eligibility text or price shown; "request purchase" only [M6] | high |
| **XENTRY Diagnosis Lite** | Software for the buyer's own Windows PC plus a sold-only "COM Kit" with a VCI, Wi-Fi stick, OBD cable and USB cable | Independent operators in the EU, Iceland, Liechtenstein, Norway, Switzerland, UK; buyers must belong to the authorised group under the type-approval block exemption; order only through B2B Connect [M1] | high |
| **XENTRY Pass Thru EU** | Mercedes software on a workshop PC with a "commercially available" pass-through device, covering Euro 5 and 6 cars and vans (roughly from 2011) plus pure battery-electric vehicles. Does not cover older models like the W210 [M4][M5] | Online at every start. Personalised login with a "standard diagnosis role" required. Flash needs its own authorisation [M5] | high |
| **XENTRY Remote Diagnosis** | App for independent service providers to diagnose telematics-capable cars, remotely or at the workshop. Needs the car owner to switch on three Mercedes me services and authorise the workshop with the VIN [M3] | ISPs in the EEA, Switzerland, UK. **Private individuals explicitly not eligible.** Sold with time credits; the FAQ says five credit options each for cars and for commercial vehicles (my earlier "5 time-slice credits" was imprecise) [M3] | high |
| **XENTRY Flash** | Separate "extended" role for control unit commissioning (flashing) [M5] | Applied for through the market channel, then one-time identity check at Mercedes' user portal [M5] | high |
| **DAS** | Older series diagnosis, bundled inside XENTRY Pass Thru EU. Cannot be bought separately from XENTRY [M5] | Same as Pass Thru | high |

How the money works for Diagnosis Lite (primary source, [M1]):
- First contract year has no flat fee. Later years carry an annual flat fee for online operating costs and support.
- Time credits pay for access to diagnostic data. A credit starts when diagnostics opens and keeps running after the session ends. Unused credits are non-refundable but carry over on renewal. If credits run out mid-session, diagnostics can continue until the next vehicle change.
- The page lists minimum PC specs: Windows 11 64-bit, 8 GB RAM, 150 GB disk, always-on internet. Without a connection, XENTRY will not start.
- Price figures are not on the pages I could fetch. **I could not source a current price for any Mercedes product.**

### 2.2 Why it is paywalled and identity-checked (reasons, with sources)

| Reason | Evidence | Confidence |
|---|---|---|
| **EU law says access must go through an authorised, security-protected route.** Regulation 2018/858 Annex X requires manufacturers to give independent operators access to security features "under protection of security technology", and says ISO 20828 certificates are used for mutual authentication [R3 snippet] | A search snippet of the UK-retained text. The full article text did not load for me. | medium |
| **Cybersecurity regulation.** Mercedes says new UNECE rules require protecting the car and that its newer architecture uses user-related security certificates against unauthorised diagnosis [M7 snippet, G1 snippet]. A Hella source adds R155 and R156 duties for new vehicles from July 2024 [G1] | Secondhand snippets of Mercedes and Hella pages. The Mercedes certificate page itself is only a link in what I could fetch. | medium to low |
| **Theft.** SERMI exists because reprogramming theft-relevant parts (control units, electronic keys) needs vetted operators [M11] | Mercedes B2B Connect SERMI FAQ, fetched | high |
| **Revenue and control.** Credits, flat fees, mandatory online start, MFA since 1 April 2025 (per search summary) [M1][M7] | Mercedes pages show the mechanics. The claim that this is "for revenue" is my inference. | high (mechanics), low (motive) |
| **Brick risk.** Mercedes' own flash and coding steps require stable power and uninterrupted links in workshop sources [M9] | Workshop blog, marketing | low |

### 2.3 The security timeline for Mercedes (what is sourced)

| Date | Event | Source | Confidence |
|---|---|---|---|
| Q4 2019 | First Mercedes models with "Seed and Key" protection on the diagnostic route, extended from a standard seed-key idea by a special algorithm. Hella Gutmann also says Mercedes introduced "partial access lock on the vehicle data bus" with VW, needing a digital key from online manufacturer authorisation [G1][G2] | Hella press release (19 Dec 2019); Bosch/tyrepress article (9 Jul 2020) | medium (both are tool vendors) |
| Jun 2020 | Bosch says Mercedes added "two-stage" secure diagnostic access; stage one blocks things like driver-assist calibration while leaving ECU identification, actual values and fault memory read/delete available; stage two planned for later in 2020 [G2][G4] | Bosch press release 23 Jun 2020 | medium |
| Sep 2020 | EU Regulation 2018/858 requires secure diagnostic access for all new vehicle models in Europe (per the Bosch article) [G2] | tyrepress | medium |
| Release 06/2020 | XENTRY introduces a strict security concept; personalised login required for 213 (model year 2020) and 223 [M5] | Mercedes FAQ PDF, fetched, document created Sep 2022 | high |
| Release 03/2021 | Compulsory personal login procedure for workshop users. The FAQ text (written partly in future tense: "in 2021 ... will be extended") says the level was to be extended to all brands and sectors, after which anonymous access to vehicles and backend services is no longer possible [M5]. It describes the diagnostic tool's login, not what an unauthenticated third-party tester can do | Same PDF (text-extracted locally on re-check; the FAQ's creation date was not verified) | high for wording, medium for timing |
| Date not given | Pure DoIP series begin with the introduction of 206 and 223; Mercedes says only its two named, tested adapters should be used with Pass Thru for these [M5]. (An earlier draft said "2022 onward"; the FAQ gives no date) | Same | high for content, none for date |
| Oct 2023 | EU Court of Justice C-296/22 (Carglass/ATU v FCA) rules manufacturers cannot restrict independent operators beyond what 2018/858 allows [R1] | Law-firm and trade summaries, not the judgment text | medium |
| 1 Apr 2025 | MFA mandatory for XENTRY apps (per a search summary of Mercedes pages) [M7] | Search summary only | low |
| Jul 2025 | One poster says their previous coder can no longer offer W206 coding because Mercedes tightened OBD access with live "zenzefi" certificates; coders they contacted quoted 1,400+ USD, versus 250 and 300 euros paid earlier for a 2022 and a 2023 W206. The model year of the car now being quoted is not stated in the thread as I read it [F1] | One forum thread, 4 posts, 20 to 21 July 2025 | low |
| 23 Jun 2026 | Delegated Regulation 2026/699 enters into force; Appendix 4 on secure gateways and OBD access applies from that date; manufacturers may authenticate the tool and tool maker and, where the vehicle is changed, the operator [R2] | Law-firm summary (Noerr). The EUR-Lex page itself returned empty text for me. | medium |
| 01/2026 | Kit 4 stops being orderable; Kit 5 replaces it [M6][M10] | Mercedes B2B pages | high |

### 2.4 Model coverage: what changes by chassis (only what sources say)

I did not find a Mercedes page that publishes a complete "this series needs X" matrix. Piecing it together:

| Series / era | What the sources support | Confidence |
|---|---|---|
| Pre-Euro 5 (for example W210) | Not covered by Pass Thru EU; full scope only on the Kit [M4] | high |
| Euro 5/6 cars (roughly 2011 on) | Covered by Pass Thru EU, which includes DAS for older series inside XENTRY [M4][M5] | high |
| 213 from model year 2020 and 223 | Personalised login required since 06/2020 release [M5] | high |
| 206 and 223 | "Pure DoIP" series. Only named adapters (Star Cooperation OBD2 adapter, Softing OBD adapter on RJ45) are supported for Pass Thru [M5] | high |
| W223 first full rollout of certificate-based diagnosis; all new series and facelifts get it | Search summary of a Mercedes page; primary text not fetched [M7] | low to medium |
| 2024 and newer cars | A poster said third-party coders could not code 2024+ cars with the second-generation MBUX infotainment (a poster's view of a licensing problem) [F4]. An OBDeleven competitor claim says Mercedes built after about 2023 are unsupported [G5 snippet] | low |

### 2.5 SCN coding, variant coding, and what "coding" means on Mercedes

- **Variant coding** sets bits or parameters in a control unit (for example turning a daytime-light option on). Sources agree it is local to the diagnostic tool in principle [M9].
- **SCN (Software Calibration Number) coding** loads a calibration assigned to the VIN from the Mercedes server. One German workshop blog says each request is logged against the workshop and technician and that SCN cannot be simulated offline. It also says retrofits only work if the VIN already has that option; otherwise the server rejects the SCN [M9].
- An older Mercedes service bulletin (2002) says SCN identifies the control module software and the coding for the specific vehicle [G6 snippet].
- A second shop page says SCN is an entry in a signed record tied to VIN, hardware part number and software version. That is **one blog's claim** and I could not verify the signing [G6 snippet].
- Another page from the same workshop clarifies that a Mercedes service document for certain 217-series cars requires SCN coding of the engine electronics and warns this does not generalise to other cars [M9b].
- Offline "SCN" products are sold by third parties for older generations (FBS3, FBS4 era); those claims conflict with the workshop blog and I could not verify either. **Do not plan around any offline SCN claim.**

Implication for a free tool: SCN writes are out. Reading the current coding string and showing it to the owner is a plausible read-only feature on cars where the module answers without a certificate. I could not source whether that read works on any specific series.

### 2.6 The expert tools: Vediamo, DTS Monaco, and the CBF world

| Tool | What it actually is | Who it is for | Licence reality | Confidence |
|---|---|---|---|---|
| **DTS.monaco** | Softing's off-board diagnostic tool for engineering: ECU testing, flashing, variant coding, OBD tests, ODX and OTX, DoIP monitor in generation 9 [E1] | Engineering departments, test benches, HiL, quality assurance, after-sales test preparation [E1] | Commercial. Packages BASE, PRO, TB, OEM-supplier variants. No prices; "contact Softing" [E1] | high |
| **Vediamo** | Daimler development-side diagnostic and coding tool. One secondary source says XENTRY and DAS are based on it; I could not verify that. A 2012 release is called outdated by a forum poster [F5] | Engineers, and in practice hobbyists | Not a public retail product to my knowledge; I found no official Daimler page selling it | low |
| **CBF / SMR-D files** | Daimler's diagnostic description formats, proprietary. CaesarSuite says its CBF parser was reverse engineered from a proprietary library and calls itself "far from production ready" [O3]. OpenVehicleDiag shows its `SMRParser` as removed after a DMCA notice [O1] | Community tools that need the files | The files ship with Daimler software. Redistribution and parsing are the legal pressure points | medium |

What forums show, paraphrased: hobbyists treat DTS Monaco and Vediamo as the way to do offline variant coding on cars up to roughly the W205/W213 era, with XENTRY needed for full SCN [F5][F6]. I am not reproducing how those copies are obtained. Many circulating copies are unlicensed; OpenDiag must not touch them.

### 2.7 DoIP on newer Mercedes

- Mercedes documents DoIP as "generally available" when the Pass Thru device supports it; without that, no flashing of head unit and instrument cluster on series before 206 and 223 [M5].
- For pure DoIP series (206, 223), Mercedes names two tested adapters and says it is not liable for others [M5].
- DoIP basics (UDP discovery on 13400, routing activation, TCP diagnostics) are covered in the earlier doc and in python-doipclient docs. Not repeated here.
- **Not sourced:** which OBD connector pins carry Ethernet on Mercedes, whether an activation line is needed, whether certificates are checked at the gateway or the individual ECU, and which DoIP messages an unauthenticated tester can send. I searched for the pin layout and found nothing authoritative.
- A vendor blog claims Mercedes moved to DoIP "around the 2019 model year" [G7 snippet]. Mercedes' FAQ ties "pure DoIP" to the introduction of series 206 and 223 but gives no model-year dates for that [M5]. Treat any year as unverified; this doc earlier implied 2019 to 2020 and that was not sourced.

### 2.8 What a generic adapter can read on Mercedes

| Layer | What the sources say | Confidence |
|---|---|---|
| Standard OBD-II (J1979, emissions-mandated) | A trade article says an OBD-II tool sees engine and transmission data "required by regulations" and may not reach driver assistance [M8]. A search summary of Mercedes pages says OBD-II functions remain available without restrictions [M7 snippet] | medium |
| Beyond emissions on a generic ELM327 | A guide says generic ELM327 adapters work only for basic engine codes [F7]. MBWorld posters report only seeing engine (and sometimes transmission) modules; other modules returned connection errors [F2] | low (forum, anecdotal) |
| On a protected car with a vendor tool at stage one (2020) | Bosch said without unlocking, access is limited to ECU identification, actual values, and reading or deleting fault memory [G2] | medium |
| Enhanced reads via Mercedes-specific apps | MBito (vendor) claims manufacturer-specific fault code read/clear in its free tier for 2004 to 2024 and coding from 2008 [A1]. Carly's own blog says Mercedes feature coding is not available through Carly, while a competitor says it varies [A2]. | low (vendor claims) |

Practical meaning: "read all modules' faults with a cheap adapter" is only plausible on certain older Mercedes cars and only with an adapter that handles the right buses and manufacturer addressing. I found no source that publishes the Mercedes addressing in a form I can rely on.

### 2.9 Cost to a hobbyist (what is sourced)

| Route | Cost | Evidence | Confidence |
|---|---|---|---|
| Official XENTRY | Not available to a private owner as a product (Remote Diagnosis excludes them; Lite and Pass Thru are for authorised independent operators) [M1][M3] | Mercedes pages | high |
| Third-party "coder" service | 250 and 300 euros paid for two earlier W206s (2022, 2023); over 1,400 USD quoted more recently [F1] | One thread | low |
| Aftermarket Mercedes-capable scanner | A poster uses a Topdon and a Launch unit for a couple of functions and fault checks [F1] | One thread | low |
| Mercedes own dongle | Mercedes sells a "me adapter" for many models since 2002 per a search summary; the page returned HTTP 403, so I could not read it [M12] | search summary | low |
| Reseller "certificate" subscriptions | Sold by several sites; one claims it covers models after 2021 and does not enable SCN or online programming [G8 snippet]. I could not verify any such claim. A different vendor lists a gateway licence at about $1,151 a year [G9 snippet] | vendor marketing | low |

OpenDiag should not integrate or depend on any of those certificate products.

---

## 3. What is paywalled and why: a cross-brand view

| Layer | Typically open | Typically gated | Why (as sourced) |
|---|---|---|---|
| Emissions OBD-II (J1979) | Yes, by law | None | Emissions rules; Mercedes says OBD-II stays unrestricted [M7 snippet] |
| Manufacturer-specific reads (fault memory, live values) | On older cars yes | On newer cars partly (certificate or login) | Cybersecurity regulation; commercial control |
| Actuator tests and service resets | Older cars with vendor tools | Newer cars | A scanner vendor says secure gateways block fault clearing, indicator resets, actuator tests, coding; they leave fault reading and data monitoring [G3] (vendor blog) |
| Variant coding | Older cars with expert tools | Newer cars, certificate | Same as above |
| SCN / software calibration | Never offline per workshop sources | Always server | [M9] |
| Flashing | Mercedes: XENTRY Flash role. Toyota: Professional subscription | Always gated | Brick risk and emissions law |
| Keys and immobiliser | Toyota: Security Professional tier plus NASTF membership. Mercedes: SERMI in the EU | Always gated | Theft [M11][T3][N1] |

---

## 4. Toyota and Lexus in detail

### 4.1 What Toyota actually sells, with prices

Primary sources: Toyota's Techstream Lite FAQ (document v4.0, updated 28 April 2026) [T2]; Toyota's TIS pages [T1][T4]; Snap-on's TIS subscription page, which Toyota's TIS page says handles payment [T3]. Prices in USD.

**TIS subscription price table (Snap-on page, [T3]; date of the table not shown; the FAQ's own figures match the yearly rows):**

| Term | Standard | Professional Diagnostic | Security Professional | Keycode |
|---|---|---|---|---|
| 2 days | $30 | $80 | $80 | Not offered |
| Monthly | $105 | Not offered | Not offered | Not offered |
| Yearly | $580 | $1,500 | $1,500 | Free to subscribe; $20 per key code |

- **Standard** gives library content (service bulletins, repair manuals, training). **Professional Diagnostic** adds Techstream software, ECU calibration files and Identifix Direct-Hit [T3]. Page notes checkmarks are images so the exact per-tier feature mapping is my inference from layout (medium).
- Security Professional requires membership in NASTF's Vehicle Security Professional Registry first [T3][T1].
- The Techstream Lite FAQ confirms the pro yearly figure ($1,500 vs $580, prorated upgrade $2.52 a day) and says "pricing at the time this document was published" [T2].
- **Techstream Lite Kit options (aftermarket, [T2]):** part TSLP3SW01 at $1,785 including the Mongoose-Plus MFC3 interface and a one-year Professional Diagnostic subscription; part TSLP3AM01 at $545 with the interface only (needs a separately active subscription). Plus shipping and tax. The dealer-network flyer lists a dealer kit at $495, and the full ADVi at $4,199 [T6].
- **Conflicting prices:** a review site lists about $35 for 2 days, $55 monthly, $480 annual professional, $1,200 security professional. Those do not match the Snap-on table and the review page carries internal date inconsistencies, so treat them as wrong or stale [T7b]. Older figures from 2009 (two-day $55, one-year $995 launch) show how much the structure has shifted [T9].

### 4.2 Techstream versus GTS+: what changed

- The April 2026 FAQ talks about "GTS+ software", says use is limited to one installation per professional subscription, and says the software stops connecting to a vehicle when the subscription expires [T2].
- A weekly connection to TIS is needed [T2]. Techstream Lite PC requirements in the same FAQ: Windows 11, 8 GB RAM, 256 GB disk, Intel i5 or Ryzen 5 or better, internet at 10 Mbps minimum [T2].
- Toyota recommends only the Mongoose-Plus MFC3 and MongoosePro MFC2/MFC for diagnostics, says other J2534 devices "likely" work but are untested, and says approved third-party devices are approved for reprogramming only [T2].
- Toyota estimates Techstream Lite does "95+%" of functions on a pilot of over 2,000 connections [T2].
- Techstream release notes page (version 18.00.008, updated 15 March 2023) lists 2024 model-year Lexus NX and UX250h and Toyota bZ4X coverage, and a 2023 GR Corolla EMPS limitation. It does not mention DoIP, CAN FD or security [T10][T11].
- **A 2020-and-newer GR Supra needs an additional diagnostic cable** per the Techstream Lite flyer footnote [T6]. The flyer does not say why. Because the Supra shares its architecture with BMW's Z4 (earlier doc), the BMW-style connection is the obvious guess, but **that is my inference, not sourced**.

### 4.3 Hardware reality

| Item | What sources say | Confidence |
|---|---|---|
| Official interface | Mongoose-Plus MFC3 or MongoosePro MFC2/MFC, from Opus IVS [T2] | high |
| Cheap "Mini VCI" cables | Sold for $25 to $60. A 2018 PriusChat list says versions support specific Techstream releases and a 2022 reply notes intermittent faults [T12]. A 2026 review page calls build quality and driver install inconsistent and says they target older Windows [T7b] | medium (forum list, review site) |
| Third-party J2534 devices | Toyota says it has approved a number for reprogramming only, not diagnostics [T2]. Community posts name Tactrix Openport 2 and Mongoose MFC3 as trusted for GTS+ [T7] | medium |
| DoIP-capable devices | A seller listing says a Tabscan J2534 supports D-PDU, CAN FD and DoIP for Toyota [G10 snippet]. Marketing only | low |
| Mac, Linux, phones | Techstream is Windows only [T7b][T2] | medium |

Note the licence angle: Techstream "cracked" copies circulate, and the 2026 review warns that third-party download sites may bundle malware [T7b]. OpenDiag will not use or reference them.

### 4.4 What Techstream does (functions)

From Toyota's Techstream Lite pages and flyer [T5][T6]:
- DTC read and clear, data list, active test, monitor, utility.
- Reprogramming (flash), health check.
- Customize (C-BEST, Toyota's name for owner-adjustable options).
- Calibration files downloaded from TIS with a Professional subscription [T2].

From a review (low confidence, partly affiliate-driven [T7b]): customisation examples include auto-lock, daytime running lights, power windows and smart-key parameters; the review also lists TPMS registration and system initialisation. Treat those as plausible, not verified.

Toyota's own warnings: a failed reprogram can permanently damage a controller; do not interrupt, disconnect, or let the PC sleep [T5].

### 4.5 Why Toyota gates what it gates

| Gate | What gets gated | Evidence |
|---|---|---|
| TIS Professional subscription | Techstream software, calibration files | [T3][T5] |
| TIS Security Professional + NASTF VSP membership | Key codes, immobiliser and smart-key reset | [T1][T3] |
| NASTF Secure Data Release Model | A verification and monitoring framework for security-sensitive functions in aftermarket tools, with business validation, criminal background checks, professional standing, owner authorisation and monitored transactions [N1]. NASTF's pages say a VSP ID is needed to use a participating scan tool for add-a-key, all-keys-lost and immobiliser functions [N2 snippet] | [N1] fetched; [N2] snippet |
| Per-subscription software install | One registered installation per professional subscription [T2] | high |

The May 2026 trade article is framed around vehicle theft, but on re-reading it does not analyse motives and does not mention hobbyists or non-professional users [N1]. It names criminal background checks and proof of owner authority as verification layers. It does not describe a VSP ID format; the "VSP ID needed" statement rests on a snippet only [N2].

### 4.6 DoIP, secure gateway and newer Toyotas: what is established and what is not

| Claim | Source and strength |
|---|---|
| Toyota's TIS release notes for 2023 and 2024 coverage do not mention DoIP, CAN FD or security changes | Fetched Toyota page [T10]; high for what it omits |
| A Toyota security-signed ECU flashing bulletin requires GTS+ version 2023.02.001.02 or later | A search summary of an NHTSA-hosted Toyota bulletin; the PDF itself did not render for me [T13]. low to medium |
| One forum post says any 2023 Toyota or Lexus and newer needs GTS+; another says 2024 vehicles require GTS+ and do not support desktop Techstream | Forum posts, inconsistent [T7]. low |
| A vendor blog says the 2024 Grand Highlander uses DoIP and needs a GTS+-certified J2534 device that supports DoIP | Single vendor, marketing [T8]. low. The same vendor page elsewhere says the Grand Highlander FAQ does not state a DoIP capability [T8b] |
| A scanner vendor blog says "Toyota: Techstream requires validated authentication" and that no widely adopted bypass exists | Vendor blog that sells scanners [G3]. low |
| Toyota CAN message authentication (SecOC) blocks openpilot on bZ4x 2023-25, Camry 2025, Corolla Cross 2022-25, Highlander 2025, RAV4 Prime 2024-25, Sequoia 2023-25, Tundra 2022-25, Venza 2021-25, Lexus NS 2022-25 | opendbc CARS.md, fetched [O4]; high for the list. This is about authenticated control messages on the vehicle bus, **not** proof that diagnostics on those cars are locked |
| opendbc marks RAV4 Prime 2021-23, Sienna 2021-26 and Yaris (non-US) as "Custom" needing a recovered message-signing key | [O4]; high |

**Bottom line:** I found no official Toyota statement about DoIP or a secure gateway on the OBD port. Anything stronger than "newer cars may need GTS+ and a capable interface" is unsupported.

### 4.7 What a generic adapter can read on Toyota

| Area | Evidence | Confidence |
|---|---|---|
| Standard OBD-II | Universal | high (from earlier docs) |
| Enhanced data on older cars with consumer apps | A PriusChat poster reports reaching ECM, hybrid control, HV battery, ABS, EPS and SRS on a 2006 Prius with OBDLink software [F3]. Another reports Car Scanner found ECM, hybrid control and HV battery on a Gen 2 Prius, with ABS and EPS possibly reachable, and no bidirectional functions [F3] | low to medium |
| Add-on pricing | OBD Fusion's Toyota Enhanced add-on listed around $10 on mobile in a 2018 list [T12]. OBDLink's enhanced access terms are disputed across posts [F3] | low |
| Hybrid battery data | Hybrid Assistant (free Android) and others read pack data; developers recommend OBDLink adapters and say a PLX Kiwi 3 fails [T12] | medium (2018 list) |
| Open signal data | OBDb has Toyota repos (earlier doc counted about 60), CC-BY-SA-4.0. The GR Supra repo has one signalset and 38 commits [O5] | high |
| Firmware version queries openpilot uses | KWP and UDS tester-present plus version requests to camera, radar, ABS, EPS, SRS, transmission and HVAC on older platforms. Some ECUs use non-standard data identifiers [O6] | high |

Important mismatch for planning: opendbc proves Toyota ECUs answer standard diagnostic services from a plain tester on many cars. It does not tell us what newer cars do.

---

## 5. Open-source and public tools: what exists today

| Project | Brand | What it does | Licence | Status | Confidence |
|---|---|---|---|---|---|
| **OpenVehicleDiag** (rnd-ash) | Mercedes first | Rust diagnostics via J2534-2 and SocketCAN, parses CBF files into its own JSON schema, university final-year project | GPL-3.0 | Latest release 1.0.5 dated 15 May 2021. About 1,000 stars, 274 commits. SMRParser listed as removed after a DMCA notice [O1] | high |
| **openStar** | Mercedes | Rust app inspired by XENTRY and DAS. Needs an existing XENTRY installation, README says "currently nonfunctional" | Not stated on the page | 14 commits [O2] | high |
| **CaesarSuite** (jglim) | Mercedes | CBF parser, converter, and an ECU coding utility with experimental J2534 writes. Author warns it is "far from production ready"; testing so far bench-only | MIT | 44 commits, 179 stars [O3] | high |
| **odxtools** (mercedes-benz org on GitHub) | Any ODX | Python library to load ODX/PDX diagnostic databases, encode and decode UDS, `snoop` command. Mentions its use cases are partly "aspirational". Provenance: mbition.io imprint, SofDCar research funding acknowledged | MIT | About 1,625 commits, 332 stars [O7] | high |
| **mercedes-hacking-docs** (fork of rnd-ash) | Mercedes | A written guide with nine chapters. No licence shown on the page I fetched, so reuse is not safe | none shown | 18 commits [O8] | medium |
| **opendbc** | Toyota/Lexus and others | DBC and car-port code for openpilot. Toyota and Lexus 80 rows (56 Toyota, 24 Lexus); no Mercedes rows. Mercedes mentioned only for FlexRay "no plans" | MIT | Active [O4] | high |
| **OBDb** | Toyota (about 60 repos), others | Signal sets in JSON. Mercedes coverage not checked in this run | CC-BY-SA-4.0 | Active [O5] | high (Toyota), unknown (Mercedes) |
| **udsoncan, python-doipclient, can-isotp** | Any | UDS client, DoIP client, ISO-TP | MIT / MIT / GPL-family per earlier doc | Covered in earlier docs | medium |

Lessons for OpenDiag (clean-room):
- The Mercedes open-source scene mostly leans on parsing Daimler's proprietary description files. That is exactly where takedown risk sits. **OpenDiag should not ingest CBF, SMR-D or any Daimler diagnostic description file.**
- `odxtools` is an official Mercedes-affiliated project on a public standard (ODX, ISO 22901 per its README). That is a clean, permissive building block for any ODX we are legitimately given, but it does not give us Mercedes car data. I found no evidence Mercedes publishes ODX files for private owners.
- Toyota has far more openly licensed signal data (OBDb, opendbc) than Mercedes does.

---

## 6. Apps and adapters aimed at hobbyists

| App / tool | Brand claim | Detail | Source and confidence |
|---|---|---|---|
| **MBito** | Mercedes 2004 to 2024, coding most comprehensive 2008+ | Free fault read/clear for manufacturer-specific control units (vendor claim); coding unlocks per vehicle; subscription from $7.99 a month for live data, battery registration and more. No adapter named | Vendor marketing [A1]. low |
| **Carly** | Mercedes from 2001 (Carly blog) or 2005 (competitor) | A Carly-affiliated blog says feature coding is not available for Mercedes; competitor says coding varies by model and needs a subscription | [A2]. low |
| **OBDeleven** | Mercedes introduced; competitor claim says Mercedes built after about 2023 unsupported | The OBDeleven page returned HTTP 403; claim comes from a search snippet | low |
| **OBDLink app and adapters** | Toyota enhanced reads | Marketing says enhanced access includes manufacturer codes and parameters for ABS, SRS, TPMS and others; forum posts disagree on pricing | [F3]. low to medium |
| **Car Scanner** | Toyota enhanced PIDs, custom PIDs | Read-only per forum reports | [F3][T12]. low to medium |
| **Hybrid Assistant** | Toyota hybrids | Free Android; developers say use OBDLink LX or MX | [T12]. medium |
| **BimmerCode** | Header lists BMW, MINI and Toyota Supra (from earlier doc) | See earlier doc | earlier doc |
| **Techstream clone + cheap cable** | Toyota | Unlicensed or unsupported; Windows only | [T7b]. medium |

Takeaway: for Mercedes, the app market is thin, vendor-claimed and pivots on proprietary data. For Toyota, enhanced reads for older cars are a mature niche.

---

## 7. Legal and regulatory levers (EU and US)

| Item | What I found | Status | Confidence |
|---|---|---|---|
| EU Regulation 2018/858 Annex X | Requires standardised access to OBD and repair information, security features available to independent operators under security technology, and ISO 20828 certificates for mutual authentication [R3] | In force | medium (snippets from the UK-retained text; I could not load Articles 61 or 65) |
| SERMI | Independent workshops and employees are vetted by a national conformity assessment body, receive an electronic certificate, deposited in a Europe-wide trust centre. Needed for theft-relevant work (control units, electronic keys). Not needed for jobs like a particulate filter change [M11] | In force | high (Mercedes FAQ, fetched) |
| CJEU C-296/22 (5 Oct 2023) | Manufacturers may not restrict independent operators' access to repair and OBD information beyond what 2018/858 permits; case about FCA's security gateway [R1] | Judgment | medium (secondary summaries) |
| Delegated Reg (EU) 2026/699 | Adds Appendix 4 to Annex X on how manufacturers may secure access. Allows authentication of tool and tool maker, and of operator in some cases. Measures must be necessary, proportionate and non-discriminatory. Staggered API and information deadlines through 23 Jun 2028. Responds to Carglass [R2] | In force 23 Jun 2026 (summary) | medium |
| US DMCA 1201 exemptions | Final rule of 25 Oct 2024 (effective 28 Oct 2024) kept an exemption for diagnosis, repair and modification of motorised land vehicles' computer programs and added one for accessing and sharing vehicle operational data; renewal petitions for the next cycle (2027) are filed [R4] | Temporary, reviewed every three years | medium (summaries; I did not read the Federal Register text) |
| NASTF SDRM / VSP | Industry framework for security-sensitive functions; applicants need background checks and owner authorisation [N1] | Voluntary but now common | medium to high |
| DMCA takedown vs open diagnostics | OpenVehicleDiag shows SMRParser removed after a DMCA notice. The claimant is not named anywhere I could find; the Daimler link is inference [O1][G11] | Fact of removal: high. Claimant: unknown | |
| Mazda DMCA case (2023) | Reported by trade press as a takedown against a hobbyist's smart-car tool [G11 snippet] | Not read in full | low |

What this means: the law explicitly protects independent operators and workshops. A private owner using a free tool is not squarely inside those protections in the EU texts I could read. I did not find a source that bans private owners from reading their own OBD data; Mercedes' own statement says OBD-II remains unrestricted [M7 snippet, low to medium].

**Do not read this as legal clearance.** The earlier docs recommend a short legal check before release; that still stands.

---

## 8. What a free, read-only tool can plausibly offer

Scope reminder: owner decisions say no writes on real cars in the 12-week window, and the plan treats writes as bench-only. This section is about read-only.

### 8.1 Feasibility ladder

| Tier | Feature | Mercedes | Toyota / Lexus | Confidence in feasibility |
|---|---|---|---|---|
| T0 | Standard OBD-II: emissions DTCs, live data, freeze frame, readiness, VIN | Yes on all cars sold with OBD-II | Yes | high |
| T0 | "Why you cannot see more" explanation screen, by VIN | Yes: name the series and the known gate (login, certificates, DoIP) | Yes | high that it is buildable; accuracy of the gate depends on sources |
| T1 | Enhanced live data and DTCs for modules on older cars | Not established. Requires Mercedes addressing and message definitions we cannot source cleanly | Yes for many models via open signal sets (OBDb, CC-BY-SA pack) and community notes | medium (Toyota), low (Mercedes) |
| T1 | ECU firmware and identification read (version data) | Bosch said identification stayed open at stage one in 2020 [G2] | opendbc proves it for many older Toyotas [O6] | medium |
| T2 | Hybrid battery health (Toyota hybrids) | n/a | Apps already do it on older cars [T12][F3] | medium |
| T2 | Read current coding or customisation values (display only) | Unproven | Techstream "Customize" values would need Toyota data we do not have | low |
| T3 | Protected-car reads over DoIP | Needs certificates; out | Unknown; out | n/a |
| Out | SCN, flash, coding writes, keys, immobiliser, security gateway or certificate bypass, Techstream or XENTRY emulation | Out | Out | Out of scope |

### 8.2 Brand-specific recommendations

**Mercedes (read-only):**
1. Ship T0 (OBD-II) for every car, plus a clear banner on 206/223-era cars saying that module-level access needs Mercedes-issued certificates and is not offered.
2. Do not ingest CBF, SMR-D, or any file from a XENTRY, DAS, Vediamo or DTS Monaco install. Do not parse or redistribute them.
3. Consider supporting ODX via `odxtools` only for files the user legitimately supplies, with no bundled data.
4. Treat any Mercedes enhanced read as community-contributed, per-car, owner-captured and clean-room. The Bosch 2020 description of what stayed open (ECU ID, actual values, fault memory) is a useful design constraint, not evidence that those reads work with an unauthenticated generic adapter [G2].

**Toyota/Lexus (read-only):**
1. T0 for all cars, plus T1 enhanced reads where a CC-BY-SA signal pack exists (kept in the separate share-alike pack per owner decision 1).
2. Hybrid battery view as a flagship feature on older hybrids, driven by open signal data.
3. A "Techstream-required" panel linking to Toyota's own TIS pricing so owners know the official route, not a clone.
4. On 2022+ cars, show a neutral message ("this model year may need dealer-level tools; support unverified") rather than a claim of a gateway.

### 8.3 What the evidence does NOT support promising

- "Read every module's faults on any Mercedes with a cheap dongle." Only older cars, only with the right adapter, and unproven for us.
- "Toyota 2022+ diagnostics are locked behind a gateway." Unsupported by any official source.
- "Mercedes SCN or variant coding in a free app." Out of scope and server-gated.

---

## 9. Risks specific to these two brands

| Risk | Detail | Mitigation idea |
|---|---|---|
| Copyright takedown | CBF/SMR-D parser removal is the precedent [O1] | Clean-room data only; accept owner-captured traffic |
| Brick risk | Both brands warn about interrupted flashes [T5][M9] | No writes in the window (decision 2) |
| Users following forum "unlock" advice | Many threads are coder advertising, and some touch certificate-licence reselling [F1][G8] | Do not link to them; explain limits |
| Cheap clones and cables | Mini VCI quality, driver issues, malware on download sites [T7b][T12] | Never recommend; refuse to detect or enable clone Techstream |
| Warranty fear | A W206 owner worried coding via a third party would show as unauthorised work [F4] | Read-only default; no persistent writes |
| Regulatory drift | 2026/699 deadlines run to 2028; manufacturers must progressively provide tool-maker information [R2] | Re-check each quarter; consider a future route for tool-maker access (not available to a hobbyist project today) |
| Brand claims in vendor marketing | Most "supports 2024+ Mercedes" claims are from sellers | Only list support that an owner capture confirmed |

---

## 10. Implications for OpenDiag

### Build
- A vehicle-lock explainer keyed on VIN and model year, citing public sources only.
- Toyota-first enhanced reads via open signal data, hybrid battery view, ECU version read.
- A neutral "official route" panel per brand with links to the OEM's own purchase pages.

### Avoid
- CBF, SMR-D, Vediamo or DTS Monaco files, XENTRY or Techstream binaries, and any certificate or seed-key work.
- Recommending cloned interfaces or cracked software.
- Language that implies Toyota 2022+ or Mercedes 206/223 are readable when unverified.

### Measure
- For each captured car: which modules answer a standard tester with no login, recorded by the owner on their own car (read-only, per owner decision 7).
- Whether the OBD-II-only route and the enhanced-read route behave the same across the owner's three adapters.

### Process
- Add a quarterly check of Delegated Regulation 2026/699 milestones (23 Sep 2026, 23 Dec 2026, 23 Jun 2027, 23 Dec 2027, 23 Jun 2028) and any change in what Mercedes and Toyota publish to tool makers [R2].
- Fix the SFD/SFD2 wording in the earlier Mercedes doc.

---

## 11. Gaps: what I could not establish

1. **Current Mercedes prices** for Diagnosis Lite, Pass Thru EU, Kit 5, Remote Diagnosis time credits. Pages describe structure only and point to logged-in shop pages.
2. **Mercedes US consumer or independent access.** I researched EU routes. Whether Mercedes-Benz USA offers anything to independent shops or owners was not covered.
3. **Mercedes certificate-based diagnosis mechanics** from a primary page. The Mercedes pages I fetched only link to it. The description I used comes from search snippets of those pages (medium to low).
4. **What an unauthenticated tester can read on 206 and 223 over DoIP.** No source.
5. **Mercedes OBD connector pins for Ethernet and any activation line.** The search returned nothing authoritative.
6. **Mercedes CAN addressing and wake-up for older cars** in a source I can use. The one community doc I found (mercedes-hacking-docs) returned only its table of contents, with no licence shown.
7. **The text of EU Regulation 2018/858 Articles 61 and 65 and of Delegated Regulation 2026/699.** The EUR-Lex and legislation.gov.uk fetches returned empty. I used secondary summaries and search snippets.
8. **Whether Mercedes sells or licenses Vediamo and DTS Monaco to anyone.** Only Softing's DTS.monaco page is primary; Vediamo has no primary source.
9. **Toyota DoIP, CAN FD and secure-gateway status** on any production model, from an official source.
10. **The NHTSA-hosted Toyota technical instruction** about GTS+ version requirements. The PDF returned as undecoded binary; I relied on a search summary.
11. **The date of Snap-on's price table.** Toyota's FAQ matches the yearly figures, but the table has no date.
12. **Why a 2020 or newer GR Supra needs an extra cable** in Techstream Lite. The flyer states it with no reason.
13. **The OpenVehicleDiag DMCA notice itself** and who filed it. Not found.
14. **OBDb coverage for Mercedes.** Not checked.
15. **Whether the Mercedes "me adapter" page** says anything useful. It returned HTTP 403.
16. **Real forum data on Toyota.** I read two forum posts via PriusChat and one tundras search listing, and no Lexus forum threads. Claims about Lexus-specific tools are unsourced.
17. **Mercedes MFA date (1 April 2025)** and **UMAS portal details** beyond the fetched FAQ PDF.
18. **Re-check scope (2026-11-20, second pass).** Only about a dozen claims were re-fetched: M1, M3, M5 (PDF), M10, T2, T3, T6, O1, O4, R2, N1, F1, M9. All other claims keep their original confidence and were not re-verified. The WebFetch tool cannot decode PDFs, so M5, T2 and T6 were read by saving the PDF and extracting text locally.
19. **Whether Toyota applies any identity or business check** to a Professional Diagnostic subscription purchase. Not established.
20. **Sources where only a snippet or a third-party description was used** (M7, R1, R3, R4, N2, F2 to F6, G5 to G11) were not re-fetched here and remain low to medium.
21. **The model year of the car in the July 2025 W206 quote** [F1]. Not stated in the thread as read; an earlier draft wrongly said 2025.

---

## Sources

Page types: **primary** = the manufacturer, regulator, or tool maker's own page; **secondary** = trade press, law-firm note, review; **forum** = user posts; **snippet** = I only saw the search summary, not the page.

### Mercedes-Benz (M)
- [M1] https://b2bconnect.mercedes-benz.com/gb/help/faq/software/xentry-diagnosis-lite . primary, fetched. Eligibility, fee structure, COM Kit, StartKey, requirements, scope, limits. high.
- [M2] https://b2bconnect.mercedes-benz.com/gb/workshop-solutions/diagnosis/xentry-diagnosis-lite . primary, search snippet. Same product. medium.
- [M3] https://b2bconnect.mercedes-benz.com/gb/help/faq/software/xentry-remote-diagnosis . primary, fetched. Private individuals not eligible, owner authorisation, time slices. high.
- [M4] https://b2bconnect.mercedes-benz.com/GB/shop/workshop-solutions/xentry-pass-thru-eu . primary, fetched. Euro 5/6 scope, online start, tested devices (Actia, Bosch KTS 560, ADIS EURO VCI). high.
- [M5] https://service-info.mercedes-benz-trucks.com/media/wysiwyg/XPTEU/FAQ_XPTEU_EN.pdf . primary, Mercedes service FAQ, converted with a PDF text tool. DAS bundled, DoIP series 206 and 223, named adapters, personal login 06/2020 and 03/2021, UMAS, Flash role, URLs the software uses. high. Also https://b2bconnect.mercedes-benz.com/hr/help/faq/software/xentry-pass-thru-eu (fetched, confirms 213 MY2020 and 223 login, DoIP series).
- [M6] https://b2bconnect.mercedes-benz.com/gb/workshop-solutions/diagnosis/xentry-diagnosis-kit-5 . primary, fetched. Kit 5 hardware, MFA, no price. high.
- [M7] Mercedes B2B certificate-based diagnosis text. Seen only in search summaries of Mercedes pages, not fetched. low to medium.
- [M8] https://automotivetechinfo.com/wp-content/uploads/2019/01/XENTRY-and-OBD-II-Go-Deep.pdf . trade article (Mercedes-Benz StarTuned, June 2018), converted from PDF. OBD-II minimal engine and transmission access; DoIP as a new issue for third-party tools. medium.
- [M9] https://kfz-dietrich.com/blog/sca-codierung-mercedes-was-erlaubt-werkstatt/ . German workshop blog, fetched. SCN explanation. low (shop marketing, AI-assisted per its own disclosure). [M9b] https://kfz-dietrich.com/blog/entheiraten-mercedes-codierung-was-geht/ . same shop, fetched. low.
- [M10] https://b2bconnect.mercedes-benz.com/gb/workshop-solutions/diagnosis/xentry-diagnosis-system . primary, fetched. Kit 4 end of order from 01/2026, 100 Mbit/s OBD limit. high.
- [M11] https://b2bconnect.mercedes-benz.com/bg/help/faq/sermi-authentication . primary, fetched. SERMI process. high.
- [M12] https://www.mercedes-benz.co.nz/passengercars/services/me-adapter.html . HTTP 403, snippet only. low.

### Third-party tool vendors and trade press (G)
- [G1] https://hella.com/press/en/18556.html . Hella Gutmann press release, 19 Dec 2019, fetched. medium (vendor).
- [G2] https://www.tyrepress.com/2020/07/bosch-esitronic-software-allows-work-on-access-protected-mercedes-benz-vehicles/ and https://www.bosch-presse.de/pressportal/de/en/bosch-esitronic-workshop-software-allows-comprehensive-work-on-access-protected-mercedes-benz-vehicles-213760.html . Bosch, June and July 2020, fetched. medium (vendor).
- [G3] https://www.klavkarr.com/blog/56-understanding-secure-gateway . scanner vendor blog, fetched. low (sells bypass products).
- [G4] https://tyrepress.com/2020/10/mahle-offers-mercedes-benz-encoded-obd-access . Mahle, fetched. Certificates via annual subscription, read-only without them. medium (vendor).
- [G5] https://obdeleven.com/introducing-mercedes-benz . HTTP 403; competitor claim via snippet. low.
- [G6] https://kfz-dietrich.com/blog/ and 2002 bulletin hosting via search snippet. low.
- [G7] https://elinehub.com/mercedes-benz-doip-remote-diagnostics-programming/ . vendor snippet. low.
- [G8] https://www.nexus-auto.net/products/mercedes-xentry-zenzefi-certificate and https://techroute66.com/product/add-on-xentry-certificated-for-2022-and-2023-programming-3-months . reseller snippets. low.
- [G9] https://blog.obdii365.com/2024/10/09/how-to-unlock-benz-sgw-gateway-with-launch-x431/ . reseller snippet. low. I did not read or use any method from it.
- [G10] https://www.amazon.com/Tabscan-J2534-Reprogramming-Diagnostics-Programming/dp/B0G42BBKBV . listing snippet. low.
- [G11] https://www.hackster.io/news/ashcon-mohseninia-s-rust-based-open-vehicle-diagnostics-aim-to-break-the-manufacturer-stranglehold-e36fbe80c8ae and https://thedrive.com/news/mazda-slaps-developer-with-cease-and-desist-for-diy-smart-home-integration . snippets only. low.

### Expert tools (E)
- [E1] https://automotive.softing.com/products/softing-dts/softing-dtsmonaco.html . primary (Softing), fetched. high.

### Toyota / Lexus (T)
- [T1] https://techinfo.toyota.com/techInfoPortal/appmanager/t3/ti?_nfpb=true&_pageLabel=ti_subscriptions . primary, fetched. Levels, NASTF requirement, third-party payment, no prices. high.
- [T2] https://one.tis.toyota.com/techInfoPortal/staticcontent/en/techinfo/html/prelogin/docs/tslfaqtinfo.pdf . primary, Techstream Lite FAQ v4.0, updated 28 Apr 2026, converted with a PDF text tool. high.
- [T3] https://techinfo.snapon.com/TIS/Register.aspx . primary payment page for Toyota TIS (per [T1]), fetched. Price table. medium to high (undated).
- [T4] https://techinfo.toyota.com/techInfoPortal/appmanager/t3/ti%3F_pageLabel=ti_ts_lite&_nfpb=true . primary, fetched. Techstream Lite description, warnings, reference documents. high.
- [T5] same as [T4] for functions and warnings.
- [T6] https://one.tis.toyota.com/techInfoPortal/staticcontent/en/techinfo/html/prelogin/docs/tsliteflyertinfo.pdf . primary flyer (rev 02/24), converted. $495 dealer kit, ADVi $4,199, GR Supra footnote. high.
- [T7] https://elinehub-website.pages.dev/toyota-techstream-remote-programming (vendor, fetched, copied-content signs) and the forum posts reported in a search summary (tacomaworld, ih8mud, priuschat). low. [T7b] https://obdadvisor.com/toyota-techstream/ . review/affiliate site, fetched; internal inconsistencies noted. low.
- [T8] vendor blog claim on 2024 Grand Highlander and DoIP, via search summary. low. [T8b] the eLinehub page itself, fetched, which says its Grand Highlander FAQ does not state DoIP. low.
- [T9] https://fenderbender.com/running-a-shop/operations/article/33024355/toyota-expands-service-support-for-independent-repair-facilities . trade article, fetched, apparently from 2009. medium (dated).
- [T10] https://one.tis.toyota.com/techInfoPortal/staticcontent/en/techinfo/html/prelogin/tsrss/ts_new_features.html . primary, fetched. high.
- [T11] https://one.tis.toyota.com/techInfoPortal/staticcontent/en/techinfo/html/prelogin/tsrss/ts_known_bugs.html . primary, fetched. high.
- [T12] https://www.priuschat.com/goto/post?id=3078972 . forum, a 2018 tool list with replies to 2022, fetched. medium to low.
- [T13] https://static.nhtsa.gov/odi/tsbs/2024/MC-11007452-0001.pdf . Toyota technical instruction hosted by NHTSA; text did not decode; only metadata read. low.

### Open source (O)
- [O1] https://github.com/rnd-ash/OpenVehicleDiag . fetched. high.
- [O2] https://github.com/rnd-ash/openStar . fetched. high.
- [O3] https://github.com/jglim/CaesarSuite . fetched. high.
- [O4] https://github.com/commaai/opendbc/blob/master/docs/CARS.md . fetched (also the CAN Bus Security anchor). high.
- [O5] https://github.com/OBDb/Toyota-GR-Supra . fetched; plus counts from the earlier toyota doc. high.
- [O6] https://github.com/commaai/opendbc/blob/master/opendbc/car/toyota/values.py . fetched. high.
- [O7] https://github.com/mercedes-benz/odxtools . fetched. high.
- [O8] https://github.com/Xplatforms/mercedes-hacking-docs . fetched (table of contents only). medium.

### Regulation and law (R) and NASTF (N)
- [R1] https://www.taylorwessing.com/en/insights-and-events/insights/2023/10/access-to-vehicle-data , https://osborneclarke.com/news/ecj-decision-vehicle-manufacturers-may-not-restrict-access-vehicle-data-stream and others; search summaries only. medium.
- [R2] https://www.noerr.com/en/insights/delegated-regulation-eu-2026-699-sets-out-new-guidelines-for-secure-gateways-obd-access-and-rmi . law-firm summary, fetched. medium. EUR-Lex pages (https://eur-lex.europa.eu/eli/reg_del/2026/699/oj/eng) returned empty text.
- [R3] https://legislation.gov.uk/eur/2018/858/annex/X?view=plain and related pages; search snippets only (UK-retained text; full fetch returned empty). medium.
- [R4] https://govinfo.gov/content/pkg/FR-2024-10-28/pdf/2024-24563.pdf and Mondaq/Finnegan summaries; search summaries only. medium.
- [N1] https://www.motor.com/2026/05/nastf-secure-access-system-targets-vehicle-theft/ . trade article, 11 May 2026, fetched. medium to high.
- [N2] https://wp.nastf.org/?p=367 (HTTP 403) and NASTF support pages; search summaries only. medium.

### Forums and apps (F, A)
- [F1] https://mbworld.org/forums/c-class-w206/915977-after-market-coding.html . four posts, July 2025, fetched. low.
- [F2] https://mbworld.org/forums/mercedes-tech-talk/692543-obd2-only-picking-up-powertrain-fault-codes.html and related threads; search summary only. low.
- [F3] PriusChat posts on OBDLink and Car Scanner, via search summary. low to medium.
- [F4] https://mbworld.org/forums/c-class-w206/905526-3rd-party-coding.html . one post, Dec 2024, fetched. low.
- [F5] https://mbworld.org/forums/mercedes-tech-talk/917947-noob-questions-dts-monaco-8-16-a.html and https://mbworld.org/forums/performance-upgrades-tuning/745873-dts-monaco-vediamo-learn-coding-guide.html . search summary only. low.
- [F6] W204 coding thread via search summary. low.
- [F7] https://www.mycarly.com/blog/car-diagnostics/mercedes-diagnostic-tool-the-complete-guide-for-mercedes-benz-owners/ . vendor blog via snippet. low.
- [A1] https://www.mbito.app/post/mbito-vs-carly-for-mercedes-which-obd2-app-is-actually-worth-your-money-in-2026 . vendor marketing, fetched. low.
- [A2] https://obdeleven.com/obdeleven-vs-carly and Carly blog via snippets. low.
