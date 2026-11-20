# OpenDiag: Legal and Regulatory Landscape (Deep Pass)

Not legal advice. This is a research note for the project owner. Anything that ships should be reviewed by a lawyer who knows US copyright, Clean Air Act and EU type-approval law.

Date of research: 2026-11-20. References like [L14] point to the Source ledger at the end.

**Important limits of this run (read first)**
- The web search tool hit its budget before any search ran. Every page below was reached by fetching a URL directly, so I could not discover sources by keyword. Many guessed URLs returned 404/403 and are not in the ledger.
- Primary text I did read in full or in large part: the Copyright Office 2021 and 2024 Registers' Recommendations (PDFs, text-extracted), the 2018 and 2021 Federal Register rules (PDF, partly garbled by column layout), 37 CFR 201.40, 17 USC 1201, 42 USC 7522 and 7524, 15 USC 2302 and 1125, Mass. G.L. c.93K s.2, 13 CCR 2222, StVZO s.19, UK C&U reg 61, the Apple and Google Play policies.
- Primary text I could NOT read: Regulation (EU) 2018/858 (EUR-Lex returned empty pages), any SERMI official site (DNS failure or a parked domain), CARB's own aftermarket pages (404), EPA enforcement case lists (404), congress.gov (403), the Massachusetts litigation record, any OEM lawsuit against a diagnostic vendor. Those topics are marked unverified below and must not be treated as established.
- Wikipedia was used for several secondary points. It is marked medium or low reliability in the ledger.

---

## 1. Summary (10 bullets)

1. **Reading and diagnosing is the safest ground.** Reading standard OBD-II/EOBD data and fault codes is what the law itself mandates cars expose; the Copyright Office has renewed an exemption for circumventing software locks to diagnose and repair vehicles in 2015, 2018, 2021 and 2024 [L1, L14, L16, L9].
2. **The DMCA exemption protects the person circumventing, not the tool maker.** The statute separately bans making or selling circumvention tools (trafficking), and the Office states exemptions do not touch that ban [L2, L14]. A tool that bundles lock-breaking is the legal risk, not the act of an owner using it.
3. **The exemption explicitly is not a shield from emissions or safety law.** The 2021 text says eligibility is not a safe harbor from other laws, naming Department of Transportation and EPA rules [L14, L1].
4. **"Lawful modification" is in the exemption, but "lawful" does the work.** Coding comfort features is plainly the intended use. Anything that defeats emissions controls is outside it because the Clean Air Act is a separate law [L7, L1].
5. **The Clean Air Act is the biggest legal danger for tuning.** Making, selling or installing a part whose main effect is to bypass an emissions control is prohibited when the person knows or should know it will be used that way. Penalty is counted per part [L7, L8]. EPA's own page quotes up to $4,527 per tampering event or defeat-device sale [L6].
6. **Tuning tools that can load delete maps are the part to be careful with.** EPA, CARB and private plaintiffs have gone after sellers and installers, not just users. The best primary example I read is a long-running Utah civil case (brought by a physicians' group) with fines and, in October 2025, an arrest for unpaid court-ordered amounts (single secondary source; Wikipedia's dollar figures are inconsistent) [L31].
7. **Right to Repair helps diagnostics, not tuning.** Massachusetts law (2012, expanded 2020) makes automakers give owners and independent shops dealer-equivalent diagnostic information and standard-interface access, plus an open telematics platform from model year 2022 [L30]. The federal REPAIR Act (H.R. 1566) was still in committee as of February 2026 [L55]. SEMA says it does not cover modification [L41].
8. **Warranty law protects owners from blanket "you tuned it, warranty void" claims, but only partly.** The federal warranty statute bars tying warranty to brand-name parts or services, yet the FTC guide says a maker may refuse coverage for damage caused by parts or service it did not supply [L50, L48].
9. **Trademarks are manageable.** Describing "works with BMW" is nominative use if it uses only what is needed and implies no endorsement [L25, L51]. Naming the project, logo or app icon after an OEM is not safe.
10. **App stores are a real gate.** Apple scrutinises apps that could cause physical harm, bans downloaded code that changes features, and requires IP clearance; Google Play lists tools that circumvent security protections on devices as violations [L19, L20]. Coding-style writes need careful positioning.

---

## 2. What I found, by sub-question

### 2.1 US DMCA section 1201 and the vehicle exemptions

**The statute.**
- Circumventing a technical measure that controls access to a copyrighted work is banned unless an exemption applies (1201(a)(1)). Making, importing or selling tools that mainly circumvent, have little other use, or are marketed for circumvention is banned separately (1201(a)(2)) [L2].
- Fair use and other defenses are preserved by (c)(1) [L2].
- Interoperability reverse engineering is allowed in narrow form: a person who lawfully has a copy of a program may circumvent to identify what is needed to make an independent program work with it, and may build tools for that and share the information only to enable interoperability (1201(f)) [L2]. This matters for OpenDiag's own code, which is an independent program talking to car software.
- Good-faith security testing with owner authorisation is excepted (1201(j)), but not if it breaks other law such as the CFAA [L2].
- The page I fetched did not state penalties; it only cross-referenced section 1203 [L2]. Not verified.

**Exemption history for vehicles.** From the Wikipedia DMCA article (secondary) [L12]: 2015 first covered vehicle software for diagnosis, repair and lawful modification, excluding telematics and entertainment; 2018 carried it forward; 2021 added marine vessels and commercial vehicles and added the subscription carve-out; 2024 renewed it and added a new class for vehicle operational and telematics data. I confirmed the 2018, 2021 and 2024 parts against the Copyright Office documents [L14, L16, L17].

**Current regulatory text (37 CFR 201.40).** As summarised from Cornell LII [L1]:
- (b)(13): circumventing technological measures on programs in a lawfully acquired motorized land vehicle or marine vessel, where it is a necessary step to diagnose, repair or lawfully modify a vehicle or vessel function.
- Limits: programs accessed through a separate subscription service are excluded; no circumvention to gain unauthorised access to other copyrighted works (for example entertainment content); and the exemption is not a safe harbor from other laws, with DOT and EPA regulations named. The text does not name the Clean Air Act by that title [L1].
- (b)(14): owners, lessees, or people acting for them may access, store and share operational data including diagnostic and telematics data, with the same subscription, unauthorised-access and other-laws limits [L1].

**What the Copyright Office actually said (primary).**
- 2021 Register's Recommendation: the old text conditioned the exemption on compliance with other laws (the "Illegality Limitation"). Proponents (iFixit, Repair Association) asked to remove it, arguing the DMCA is not a catch-all punishment for violating EPA rules. Auto Innovators wanted it kept. The Office agreed with agencies that had said, in other classes, that it was unnecessary to condition eligibility on other laws, so it replaced the condition with a clarifying sentence: eligibility is not a safe harbor from other laws, naming DOT and EPA [L14]. Practical effect: you no longer lose the DMCA exemption just because you broke emissions law, but you are fully exposed to emissions law.
- 2021: SEMA told the Office about an engine tuning product legal under the land-vehicle exemption that had been challenged for boats [L14]. This is evidence that tuning vendors were already relying on "lawful modification".
- 2021 and 2024: the Alliance for Automotive Innovation (Auto Innovators) did not oppose renewal of the repair exemption, but raised concerns about third-party assistance [L14].
- Third-party help is a grey area. The Office, in a 2021 passage about another class, notes proponents argue that circumvention is "merely ancillary" to repair services, that the Section 1201 Report found "substantial uncertainty" on this, and that exemptions do not change trafficking liability [L14]. This is a different class, so treat it as an analogy, not a ruling on vehicles.
- 2024 Register's Recommendation: MEMA (parts suppliers) and others petitioned for a new data class. The Office considered scope (personal, commercial, agricultural vehicles, marine vessels) and "those acting on their behalf". Proponents offered extra limits: a subscription-service carve-out and a requirement to comply with local and federal laws, and the Register evaluated the proposal with those limits [L16]. MEMA defined operational data as data generated by use of a vehicle, such as performance, status, driver behaviour and environmental data [L16]. The Register concluded circumventing vehicle software to access operational data is likely non-infringing and found causation was met [L16]. The final text in the CFR matches [L1].
- 2018: the Office also addressed telematics and entertainment systems and third-party assistance; the Federal Register PDF I fetched came out as column-garbled text, so I only confirmed those topics were discussed, not the final reasoning [L17].

**Case law on circumvention tools (all secondary, Wikipedia).**
- Chamberlain v. Skylink (Federal Circuit): plaintiff must show access was unauthorised and tie it to infringement (a "critical nexus") [L22].
- MDY v. Blizzard (Ninth Circuit): rejected an infringement-nexus requirement and declined to follow Chamberlain; trafficking liability found [L36].
- Lexmark v. Static Control (Sixth Circuit): no DMCA violation where the program code was readable without a real access barrier, and interoperability reasoning favoured the chip maker [L37].
- Google v. Oracle (Supreme Court 2021): copying API declarations was fair use; the Court assumed without deciding that they are copyrightable [L38]. This supports building independent clients that speak a published or observed interface.
- Sony v. Hotz: DMCA and CFAA claims over publishing console jailbreak material; settled with a permanent injunction, so no court ruling on the merits [L35].
- Takeaway: the circuits disagree (Federal vs Ninth), so a tool maker's risk depends on where they are sued. This is a **disagreement between sources**, noted in section 3.

**CFAA.** Wikipedia says Van Buren (2021) narrowed "exceeds authorised access" to reaching areas of a system that are off limits, not misuse of access you already have [L26]. A car owner using their own vehicle is in a strong position; reaching OEM servers without authorisation is a different story and is where an open tool must not go.

### 2.2 Right to Repair: Massachusetts and federal

**Massachusetts statute (primary).** G.L. c.93K s.2 as fetched [L30]:
- For model year 2002 and later (2013 and later for heavy duty), manufacturers must sell owners and independent shops the same diagnostic and repair information given to dealers, on daily, monthly and yearly subscriptions at fair and reasonable terms.
- Manufacturers must sell diagnostic tools with the same capabilities they give dealers, on fair terms, and give information to aftermarket scan tool companies under licensing or confidentiality agreements, solely to build diagnostic tools and service publications.
- From model year 2018, access must be possible with an off-the-shelf PC and a non-proprietary interface such as SAE J2534, J1939 or ISO 22900. Owners and shops cannot be forced to get manufacturer authorisation to access on-board diagnostics unless a standardised system across all makes is run by an unaffiliated entity.
- Immobiliser and security-module reset information may be withheld, to be obtained through the NASTF secure data release model or similar.
- From model year 2022, vehicles with telematics must have an interoperable, standardised, open access platform for mechanical data, reachable by the owner through a mobile app, and by independent shops with owner authorisation. Authorised parties must be able to send commands to in-vehicle components for maintenance, diagnostics and repair.

**Vote and litigation (secondary and incomplete).**
- The 2020 ballot question passed with 74.97 percent yes [L28].
- Wikipedia's Right to Repair article says that in June 2023 NHTSA told manufacturers to ignore the law, arguing federal preemption and cyber risk, and that Massachusetts disputes this in a lawsuit [L9]. I could not fetch the case record or any ruling, so the current status is **unverified**.
- Auto Care Association's page confirms the 75 percent vote and says data now flows wirelessly "directly and only to the vehicle manufacturer", but does not describe the law or any litigation [L56].
- Effect for OpenDiag: the statute is the best legal argument that standard-interface diagnostic access and shop-level information should be available. It does not obviously give hobby tools access to OEM coding data.

**Federal REPAIR Act.** H.R. 1566 (Rep. Dunn), introduced Feb 25 2025; last listed action was subcommittee forwarding it to full committee by voice vote on Feb 10 2026; Senate companion S. 1379 [L55, L56]. Its principles: no barriers to repair, owner and designee access to vehicle-generated data, no mandated brands or tools [L55]. SEMA says it is neutral, that the bill does not protect modification, and that it lacks calibration information for ADAS after modification [L41]. The Repair Association home page links to the vehicle bill but has little detail [L33]. Whether it passed after Feb 2026 is **unknown to me**.

**Other states.** Wikipedia lists a wave of 2022 to 2025 repair laws (Colorado, Minnesota, California, New York, Oregon, Texas, Washington) but those are mostly consumer electronics and appliances, not vehicles [L9].

### 2.3 EPA and CARB: tampering, defeat devices, tunes

**Statute (primary).** 42 USC 7522(a)(3) [L7]:
- (A) removing or disabling a required emissions device before sale is banned, and knowingly doing so after sale and delivery is banned.
- (B) making, selling, offering or installing a part whose main effect is to bypass, defeat or disable such a device is banned when the person knows or should know it is used for that purpose.
- Exceptions: adjustments under section 7549, temporary removal for repair if reinstalled and working, certified clean-fuel conversions. The section also says owners need not use manufacturer parts for repairs [L7].

**Penalties (primary).** 42 USC 7524 [L8]: base statutory caps of $25,000 for manufacturers and dealers under (a)(3)(A) and $2,500 for other persons under (a)(3)(A) and for (a)(3)(B). Violations of (B) are counted separately per part or component. Administrative penalties are generally capped at $200,000 per violator unless DOJ agrees to more. EPA's current page quotes up to $4,527 per tampering event or defeat-device sale (inflation-adjusted) and says it uses its Mobile Source Civil Penalty Policy for settlements [L6]. Software is a "part or component" in enforcement practice; I did not find a primary page stating that this run, so that point is **inferred**.

**Enforcement posture.**
- EPA's national enforcement initiatives list for FY2024 to 2027 that I fetched does not list aftermarket defeat devices as a named initiative [L18]. I could not fetch the page that previously described the aftermarket defeat device initiative; it returned 404. So I cannot say from primary evidence how priorities have shifted. A March 12 2025 EPA memo told staff to apply initiatives consistently with new executive orders [L18].
- Wikipedia's defeat device article says aftermarket exhausts and chip tuning products count as defeat devices if they inhibit emissions controls, and (single source, unchecked) that in January 2026 the Justice Department said it would stop pursuing criminal Clean Air Act charges based on alleged tampering with onboard diagnostic devices [L11]. Treat this as **unverified until a DOJ primary source is read**. It would matter: criminal exposure for OBD tampering would drop, civil exposure would not.
- Diesel Brothers case (Wikipedia, secondary): a private civil suit from 2016 led to an injunction in 2018, hundreds of violations found in 2020, fines of about $850,000, an appeals court affirmation in 2021 with a recalculation, and a contempt arrest on Oct 7 2025 for unpaid amounts. The article itself shows inconsistent dollar figures [L31]. Lesson: private groups can sue under the Clean Air Act citizen-suit provisions and sellers and installers are targets.
- VW scandal: EPA Notice of Violation 2015, civil settlement up to $14.7 billion, criminal plea and $2.8 billion fine, and prison cases [L21]. This is about OEM defeat devices but shaped how regulators treat "software that changes emissions behaviour".

**SEMA and the RPM Act.** SEMA says the RPM Act (2016 to 2022) would have protected converting street vehicles into dedicated race cars, was a response to an EPA proposed rule and policy statement that treats such conversion as illegal, and that SEMA declined to back a "watered-down" version [L39]. I could not fetch bill text or current status (congress.gov 403). Whether the RPM Act is pending in the current Congress is **unverified**. Relevance: even race-use claims are legally contested, so a "for off-road use only" label is weak protection.

**CARB (California).**
- 13 CCR 2222 [L42]: advertisements for add-on or modified parts that alter a required pollution control device must state exemption limits; parts cannot be advertised or installed as certified unless they are; they cannot be sold or advertised as replacement parts; the Executive Officer can exempt parts after evaluation; sellers and installers of unexempted parts must keep records (date, buyer, vehicle, work) for four years. Catalytic converters and diesel particulate filters have special rules.
- SEMA describes the Executive Order (EO) route: an EO is the document that lets a part be legally sold and used, and SEMA says it helped with about half of the EOs CARB issued over five years [L40]. The page does not mention tuners specifically.
- I could not read CARB's own pages or any specific EO number for a tune; **no EO numbers are cited here**, which the task asked for. This is a real gap.

**Practical read for OpenDiag.** The risk is not reading or coding. The risk is the specific feature that writes or flashes a calibration with emissions controls disabled, or that ships maps for that. bootmod3's front page, when fetched, was an app shell with no legal text [L46], so I cannot describe how the tuner vendor handles this in its own words.

### 2.4 EU, Germany, UK

**EU Regulation 2018/858 and SERMI (unverified).** EUR-Lex returned empty pages and the SERMI sites failed [L52 is only background]. What I can say: Wikipedia's type approval page covers the older Directive 2007/46/EC framework and does not mention 2018/858 or independent operator access [L52]. I recall from background knowledge, **not verified this run**, that 2018/858 requires manufacturers to give independent operators access to vehicle OBD and repair and maintenance information, with a separate accreditation scheme (SERMI) for access to security-related information. The ledger has no primary source for any SERMI detail, so the build team should read Articles 61 to 66 and the SERMI implementing acts directly before relying on this.

**Defeat devices in the EU.** Wikipedia says Euro 6 rules prohibit defeat devices, enforcement outside the US has been weaker, and Germany's KBA treated VW software as illegal and ordered recalls [L11, L21].

**Germany.** StVZO s.19 (primary) [L23]:
- The operating permit expires if a change alters the approved vehicle type, is likely to endanger others, or worsens exhaust or noise behaviour.
- Installing a part does not void the permit if the part has its own permit or an EU or UNECE approval or a vehicle-specific approval, and its conditions are followed.
- After expiry the vehicle cannot be used on public roads except to get a new permit.
- Software changes must follow officially published rules and the state of the art, with exceptions for extensions needing no approval.
- Meaning: in Germany the vehicle-level consequence of a bad tune is losing road legality, a different pressure from US fines.

**UK.** Construction and Use Regulations 1986 reg 61 (primary) [L24]: vehicles must be built and maintained so they do not emit avoidable smoke or vapour; altering diesel fuel or engine settings to increase smoke is banned; Table II sets emission limits by vehicle class and first-use date. I could not fetch the UK government guidance on DPF removal (404). Treat UK DPF and MOT rules as **unverified**.

**UNECE cybersecurity (R155/R156).** My fetch returned 404, so no source. Background knowledge only: these require manufacturers to manage cyber risk and software updates, which is why gateways and authentication keep appearing. Do not cite without reading the regulation.

### 2.5 OEM legal actions against diagnostic tool makers or clone sellers

I did not find or fetch any primary source about an OEM suing a diagnostic tool maker or clone seller. Honest result: **no evidence gathered**. The nearest evidence:
- Sony v. Hotz shows the pattern for tool publishers: a TRO barring distribution, claims under DMCA and CFAA, ending in a settlement and injunction [L35].
- comma.ai: California DMV sent a cease-and-desist and NHTSA asked about FMVSS compliance in 2016; the company cancelled its first product and then open-sourced its software [L43]. This is a regulator-driven change of product shape, not an OEM suit.
- Counterfeit goods: sellers of products using a brand name or logo without authorisation can face trademark liability, and lookalikes that copy appearance but not branding are treated differently, depending on country [L45]. This bears on clone adapters, not on OpenDiag itself.
- Ross-Tech, Tesla litigation and other pages returned 404. I could not check them.

### 2.6 Trademark

- Lanham Act section 43(a) reaches uses likely to cause confusion about affiliation, sponsorship or approval [L51]. Section 43(c)(3) excludes nominative or descriptive fair use from dilution [L51].
- Nominative use test (Wikipedia): the product cannot be readily identified without the mark, only as much of the mark is used as needed, and nothing suggests sponsorship [L25]. Volkswagenwerk v. Church is cited as an early example allowing an independent repair shop to advertise its specialty [L25].
- BimmerCode, a commercial peer, states it is in no way connected to BMW AG and that the BMW name and logo are BMW AG trademarks [L47]. That is the model disclaimer.
- Apple guideline 5.2.1 bars unlicensed use of third-party trademarks and proprietary tool names; and the guidelines expect cleared IP [L19].

### 2.7 Warranty law

- 15 USC 2302(c): a warrantor cannot condition a warranty on the consumer using a particular brand-named article or service, unless the item is free under the warranty or the FTC grants a waiver after showing the product works only with it [L50].
- FTC guide: tie-ins are generally prohibited; the guide places the burden on warrantors to prove duties are reasonable and to prove a waiver is needed; and says a warrantor may disclaim coverage for damage caused by parts or service it did not supply [L48].
- Wikipedia confirms the tie-in language and notes critics who say the Act has underperformed; the FTC sent warning letters in 2024 about repair-restricting warranty practices [L10].
- Net: an owner coding comfort features should not have the whole warranty voided just for that, but the maker can deny a specific repair if it shows the modification caused the failure. This is general; real outcomes depend on facts and dealers. No source I read gives case outcomes for ECU tunes, so I make no claim there.

### 2.8 App stores and open source licensing

- **Apple** [L19]: 1.4 physical harm (extra scrutiny for apps that could cause harm; document safeguards); 2.5.2 (no downloading or executing code that adds or changes features; self-contained); 4.2 minimum functionality; 4.7 downloadable software must follow all guidelines; 2.3 accurate metadata; 5.1 privacy (VIN and location need disclosure); 5.2 IP. The guidelines page was truncated at 5.2.5 in my fetch.
- **Google Play** [L20]: device and network abuse rules cover unauthorised access, apps that facilitate hacking or circumvent security protections, no executable code loaded from outside Play (with exceptions for code in webviews or VMs), service terms, and foreground service declarations for always-on connections. Restricted content, deception and IP sections were not in my fetch.
- **Open source**: Apache 2.0 includes a patent license that ends if a user sues over patents on the work, and is compatible with GPLv3 but not GPLv2 per the Wikipedia article [L27]. It could not confirm the trademark clause from that page. Apache 2.0 section 6 (no trademark license) is from background knowledge, unverified here.
- **Safety-positioned peer**: openpilot's safety doc disclaims warranty, requires forks to keep safety checks, and says forks that modify its safety directory cannot use its trademark [L49]. A useful precedent for how an open project can bind forks to safety behaviour through trademark control rather than code license.

---

## 3. Evidence quality and disagreements

**Strong (primary text I read):** 17 USC 1201; 37 CFR 201.40; 42 USC 7522 and 7524; 15 USC 2302 and 1125; Mass. G.L. c.93K s.2; 13 CCR 2222; StVZO s.19; UK reg 61; Copyright Office 2021 and 2024 Recommendations.

**Medium:** FTC consumer guide, Apple and Google policies (truncated), SEMA and Auto Care pages (advocacy groups with a stake), Cornell LII summaries (the summaries came through an AI summariser step, so wording may be imperfect).

**Weak or secondary:** every Wikipedia page. Case law summaries come only from Wikipedia.

**Disagreements and conflicts**
- **Nexus to infringement.** Federal Circuit (Skylink) needs a link to infringement; Ninth Circuit (MDY) does not [L22, L36]. A tool published from one jurisdiction may be treated differently from another.
- **Penalty size.** Statute says $2,500 base for (a)(3)(B); EPA page says $4,527 per event [L7, L8, L6]. These are consistent if the second is inflation-adjusted, but I did not verify the adjustment rule.
- **Diesel Brothers dollar figures.** The article itself gives four different totals [L31].
- **Does the vehicle exemption cover tuning?** The text says "lawful modification" [L1], and SEMA says a tuning product relies on it [L14], but the Office also says the exemption is not a safe harbor for EPA rules [L14, L1]. Both are true: DMCA permission, CAA still binds.
- **Automaker position on third-party help.** Auto Innovators did not oppose renewal but raised concerns about third-party assistance [L14].
- **Massachusetts preemption.** NHTSA's stance (per Wikipedia) vs Massachusetts's stance; I could not read the court record [L9].
- **SEMA vs Auto Care on the REPAIR Act.** SEMA neutral, wants modification covered [L41]; Auto Care supports [L55].

**Single-source claims (flagged):** DOJ January 2026 policy on OBD tampering criminal charges [L11]; NHTSA June 2023 letter [L9]; Diesel Brothers arrest [L31]; the exact content of 2018 reasoning (garbled PDF) [L17].

---

## 4. Implications for OpenDiag

Not legal advice. These are design inputs to take to counsel.

### 4.1 What is legally safest to build (green)
1. **Standard-protocol diagnostics**: OBD-II/EOBD generic and enhanced reads, fault code read and clear, live data, freeze frames. This is what regulation requires vehicles to expose and what Massachusetts says should be reachable through a non-proprietary interface [L30, L44].
2. **Owner-data features**: logging, export, and sharing of the owner's own vehicle data, in line with the (b)(14) data exemption [L1, L16].
3. **Reading and backing up** the owner's own coding values, with the owner's own vehicle and own adapter.
4. **Coding of comfort and convenience options** (lights, mirrors, chimes) written through documented diagnostic services, after a backup, with an undo.
5. **Independent, clean-room code** and the project's own data. Interoperability reverse engineering has a statutory basis in 1201(f) and Google v. Oracle supports API-level independence [L2, L38]. Document provenance of every table and definition.
6. **Neutral references to brands** in compatibility lists, with the BimmerCode-style disclaimer [L47, L25].

### 4.2 What to avoid or handle with great care (amber)
1. **Anything that writes calibrations or flashes ECUs.** Even without emissions intent this has physical-harm and warranty angles. If ever built, require explicit backup, checksum verification, battery or power checks, and a recovery path.
2. **Shipping OEM-derived data** (coding databases scraped from dealer tools, proprietary parameter names, labels). The 2021 Register treats program access as the issue; data files and databases are separate copyright and contract problems. I have no source for what is safe here, so **treat as blocked until counsel clears it**.
3. **Features that bypass security gateways, authentication or immobiliser protections.** The Mass. statute itself carves immobiliser reset information out of the open-access rule [L30]. The exemption protects an owner's act of circumvention but not distribution of a tool that does it [L2, L14].
4. **Remote or cloud features** that touch OEM back ends. CFAA and terms-of-service risk [L26], plus Google Play rules on service terms [L20].
5. **Telemetry.** VIN, location and driving data raise privacy disclosure duties in both stores [L19, L20].

### 4.3 What to block or warn (red)
1. **No emissions-delete functionality, no delete maps, no DPF/EGR/SCR/catalyst removal flows, no O2 sensor spoofing, no readiness-monitor spoofing.** 42 USC 7522(a)(3)(B) targets parts whose main effect is bypass, with "knows or should know" intent and per-part counting [L7, L8].
2. **Do not ship or host third-party tune files** that disable emissions controls, and do not accept uploads of them.
3. **No "off-road use only" loophole language.** The RPM Act story shows EPA treats conversion of street vehicles as a violation even for race use, and the bill's fate is unverified [L39]. A disclaimer is not a defence.
4. **Warn on any write feature**: show a plain warning that emissions, safety and road-legality laws still apply regardless of copyright exemptions, mirroring the 2021 text [L14]. In Germany, state that modifications can void road legality [L23].
5. **Region-aware messaging:** US (EPA, and CARB for California), Germany (StVZO s.19), UK (reg 61 and emissions tests) [L7, L42, L23, L24].
6. **No OEM logos, no look-alike icons, no names such as "BMW" in the product name** [L51, L19].
7. **No bundled OEM software, keys or seed-key material,** and no instructions for defeating OEM security. This is also the project's own research rule.

### 4.4 Measure and track
- Counsel sign-off log for each feature tier (read, code, write).
- A "legal watch" list with named owners and a review date: REPAIR Act status, RPM Act status, Massachusetts case, DOJ and EPA tampering policy, next Copyright Office rulemaking (the 2027 triennial is the next after October 2024; this timing is inferred from the three-year cycle [L12]).
- App-store rejection log and appeal outcomes.
- Share of user-facing features that are read-only vs write, as a risk indicator.
- Count of compatibility claims that are tested by a real car (to avoid "accuracy" rejection under Apple 1.4 and 2.3 [L19]).

### 4.5 Project governance
- Use Apache 2.0 for the code, with a separate trademark policy and a safety-fork policy modelled on openpilot [L49, L27].
- Add a plain README safety section, no warranty, user responsibility.
- Do not read or copy GPL or non-commercial source; take README-level information only.
- Consider a lawyer review, ideally one who has worked with the Copyright Office process, EFF or SEMA clinics.

---

## 5. Open questions

1. What exactly does Regulation (EU) 2018/858 Articles 61 to 66 and the SERMI implementing act say, and does an open-source hobby tool qualify as an "independent operator"? I could not read either.
2. What is the current status of the Massachusetts preemption lawsuit and any ruling?
3. Did the federal REPAIR Act pass either chamber after Feb 2026? Is the RPM Act reintroduced?
4. Is the January 2026 DOJ statement on OBD tampering real, and what does it cover?
5. Which CARB EO numbers exist for ECU tunes or flash tools for BMW, Mercedes and Toyota platforms? Does any EO cover a BMW tune?
6. Is there any actual OEM lawsuit against diagnostic software makers or clone sellers (BMW, Mercedes, Toyota)? I found none because I could not search.
7. Does a general-purpose coding tool that can toggle emissions-related parameters count as a "part whose main effect" is to bypass controls? No source I read answers this.
8. What do the Apple and Google policies say about ELM327/OBD apps that can write to ECUs, in practice? I need real rejection reports and the rest of the policy pages.
9. What does the 2018 Register's Recommendation say exactly on third-party assistance for vehicles? The Federal Register PDF I fetched was too garbled to quote.
10. What is the statutory penalty range under 17 USC 1203 for DMCA violations? My fetch did not include it.
11. What are the UK rules for DPF removal and what is the MOT position on ECU remaps?
12. What is the legal status of OBD-Ethernet (DoIP) adapters and ENET cables under any right-to-repair provision?

---

## 6. Source ledger

Reliability: high = official or statutory text read directly; med = advocacy group, summary page, or partly truncated; low = Wikipedia, empty or off-topic page. "Fetched" means the page returned usable content.

| # | URL | Type | What it told us | Reliability |
|---|-----|------|-----------------|-------------|
| L1 | https://www.law.cornell.edu/cfr/text/37/201.40 | Regulation | (b)(13) vehicle repair exemption and (b)(14) vehicle data exemption, with limits and other-laws wording | high |
| L2 | https://www.law.cornell.edu/uscode/text/17/1201 | Statute | 1201(a)(1), (a)(2) trafficking, (c)(1), (f) interoperability, (j) security testing | high |
| L3 | https://www.copyright.gov/1201/2024/ | Government page | Landing page for 2024 rulemaking, links to final rule (Oct 28 2024); no vehicle text | med |
| L4 | https://www.copyright.gov/1201/2021/ | Government page | Links to 2021 final rule and Register's Recommendation | med |
| L5 | https://www.copyright.gov/1201/2018/ | Government page | Links to 2018 final rule and FAQs; no vehicle text | med |
| L6 | https://www.epa.gov/enforcement/clean-air-act-vehicle-and-engine-enforcement-case-resolutions | Government page | Up to $4,527 per tampering event or defeat device sale; settlement policy; no case names | med |
| L7 | https://www.law.cornell.edu/uscode/text/42/7522 | Statute | 7522(a)(3) tampering and defeat device prohibitions and exceptions | high |
| L8 | https://www.law.cornell.edu/uscode/text/42/7524 | Statute | Civil penalty caps, per-part counting, administrative cap | high |
| L9 | https://en.wikipedia.org/wiki/Right_to_repair | Encyclopedia | Mass. 2012 and 2020 laws, NHTSA June 2023 letter, 2014 MOU, state law list | low |
| L10 | https://en.wikipedia.org/wiki/Magnuson-Moss_Warranty_Act | Encyclopedia | Tie-in rule, 2019 FTC workshop, 2024 warning letters | low |
| L11 | https://en.wikipedia.org/wiki/Defeat_device | Encyclopedia | Definition, aftermarket tuners count, single-source Jan 2026 DOJ claim | low |
| L12 | https://en.wikipedia.org/wiki/Digital_Millennium_Copyright_Act | Encyclopedia | Triennial process and vehicle exemptions 2015 to 2024 | low |
| L13 | https://www.eff.org/issues/right-to-repair | Advocacy page | EFF stance on DMCA 1201 and cars; no tuner or case detail | med |
| L14 | https://cdn.loc.gov/copyright/1201/2021/2021_Section_1201_Registers_Recommendation.pdf | Government primary | 2021 vehicle exemption, other-laws language change, trafficking caveat, SEMA tuning remark | high |
| L15 | https://www.govinfo.gov/content/pkg/FR-2021-10-28/pdf/2021-23311.pdf | Government primary | 2021 final rule PDF; text extracted but column-garbled, vehicle renewal petitions seen, no further use | med |
| L16 | https://www.copyright.gov/1201/2024/2024_Section_1201_Registers_Recommendation.pdf | Government primary | 2024 vehicle repair renewal, new operational data class, scope and limits | high |
| L17 | https://www.govinfo.gov/content/pkg/FR-2018-10-26/pdf/2018-23241.pdf | Government primary | 2018 final rule; telematics and third-party assistance discussed; reasoning garbled | med |
| L18 | https://www.epa.gov/enforcement/national-enforcement-and-compliance-initiatives | Government page | FY2024 to 2027 NECIs list (no aftermarket defeat device item); March 2025 memo | med |
| L19 | https://developer.apple.com/app-store/review/guidelines/ | Platform policy | Guidelines 1.4, 2.3, 2.5, 4.2, 4.7, 5.1, 5.2 (truncated at 5.2.5) | high |
| L20 | https://support.google.com/googleplay/android-developer/answer/9888379 | Platform policy | Device and network abuse rules; other sections truncated | high |
| L21 | https://en.wikipedia.org/wiki/Volkswagen_emissions_scandal | Encyclopedia | NOV, settlements, criminal cases, KBA recalls | low |
| L22 | https://en.wikipedia.org/wiki/Chamberlain_Group,_Inc._v._Skylink_Technologies,_Inc. | Encyclopedia | Federal Circuit nexus requirement | low |
| L23 | https://www.gesetze-im-internet.de/stvzo_2012/__19.html | Statute (Germany) | s.19 StVZO permit expiry, part approvals, software changes | high |
| L24 | https://www.legislation.gov.uk/uksi/1986/1078/regulation/61 | Statute (UK) | Reg 61 emissions rules | high |
| L25 | https://en.wikipedia.org/wiki/Nominative_use | Encyclopedia | Nominative use test, Volkswagenwerk v. Church, other cases | low |
| L26 | https://en.wikipedia.org/wiki/Computer_Fraud_and_Abuse_Act | Encyclopedia | CFAA scope, Van Buren, Sony v. Hotz mention | low |
| L27 | https://en.wikipedia.org/wiki/Apache_License | Encyclopedia | Patent grant, GPL compatibility; trademark and warranty clauses not shown | low |
| L28 | https://en.wikipedia.org/wiki/2020_Massachusetts_Question_1 | Encyclopedia | Vote result 74.97 percent; page truncated, no provisions or litigation | low |
| L29 | https://en.wikipedia.org/wiki/California_Air_Resources_Board | Encyclopedia | Off-topic for aftermarket parts (mentions only executive orders on climate) | low |
| L30 | https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXV/Chapter93K/Section2 | Statute (MA) | Diagnostic information, tools, standard interfaces, telematics platform from MY2022 | high |
| L31 | https://en.wikipedia.org/wiki/Diesel_Brothers | Encyclopedia | Citizen suit, injunction, fines, 2025 contempt arrest; inconsistent figures | low |
| L32 | https://www.sema.org/ | Advocacy site | Home page; nothing relevant | low |
| L33 | https://www.repair.org/ | Advocacy site | Coalition scope; links to car right to repair items; no REPAIR Act detail | med |
| L34 | https://www.sema.org/advocacy | Advocacy site | Links to RPM Act, CARB, right to repair pages | med |
| L35 | https://en.wikipedia.org/wiki/Sony_Computer_Entertainment_America,_Inc._v._Hotz | Encyclopedia | TRO, DMCA and CFAA claims, settlement and injunction | low |
| L36 | https://en.wikipedia.org/wiki/MDY_Industries,_LLC_v._Blizzard_Entertainment,_Inc. | Encyclopedia | Ninth Circuit no-nexus holding | low |
| L37 | https://en.wikipedia.org/wiki/Lexmark_International,_Inc._v._Static_Control_Components,_Inc. | Encyclopedia | Sixth Circuit holding on authentication sequence and interoperability | low |
| L38 | https://en.wikipedia.org/wiki/Google_LLC_v._Oracle_America,_Inc. | Encyclopedia | API copying fair use, 6 to 2 | low |
| L39 | https://www.sema.org/advocacy/rpm-act | Advocacy page | RPM Act purpose, EPA position on race conversions, SEMA declined weaker bill | med |
| L40 | https://www.sema.org/advocacy/carb | Advocacy page | CARB EO process and SEMA role; no tuner or enforcement detail | med |
| L41 | https://www.sema.org/advocacy/right-to-repair | Advocacy page | SEMA neutral on H.R. 1566, wants modification and ADAS calibration covered | med |
| L42 | https://www.law.cornell.edu/regulations/california/13-CCR-2222 | Regulation (CA) | Add-on and modified parts advertising, exemption, records | high |
| L43 | https://en.wikipedia.org/wiki/Comma.ai | Encyclopedia | DMV cease-and-desist, NHTSA inquiry, comma one cancelled, open-source release | low |
| L44 | https://en.wikipedia.org/wiki/On-board_diagnostics | Encyclopedia | OBD-II mandate dates, EOBD, CARB history, code-clearing warning | low |
| L45 | https://en.wikipedia.org/wiki/Counterfeit_consumer_goods | Encyclopedia | Counterfeit vs lookalike, seller liability varies by country | low |
| L46 | https://www.bootmod3.net/ | Vendor site | Empty app shell; no legal text | low |
| L47 | https://bimmercode.app/ | Vendor site | Not connected to BMW AG disclaimer, trademark notice, legal links | med |
| L48 | https://www.ftc.gov/business-guidance/resources/businesspersons-guide-federal-warranty-law | Government guide | Tie-in ban, FTC waiver, warrantor may disclaim damage from others' parts or service | high |
| L49 | https://github.com/commaai/openpilot/blob/master/docs/SAFETY.md | Project doc | No warranty, fork safety rules, trademark limit for forks | med |
| L50 | https://www.law.cornell.edu/uscode/text/15/2302 | Statute | 2302(c) tying ban and FTC waiver | high |
| L51 | https://www.law.cornell.edu/uscode/text/15/1125 | Statute | 43(a) confusion and sponsorship; 43(c)(3) nominative fair use for dilution | high |
| L52 | https://en.wikipedia.org/wiki/Type_approval | Encyclopedia | Older Directive 2007/46/EC framework only; nothing on 2018/858 or RMI | low |
| L53 | https://en.wikipedia.org/wiki/Chip_tuning | Encyclopedia | ECU tune risk notes; no legal detail | low |
| L54 | https://www.autocare.org/ | Industry site | Home page: links to REPAIR Act and vehicle data pages | med |
| L55 | https://www.autocare.org/government-relations/key-issues/access-to-and-control-of-vehicle-data/the-repair-act | Industry page | H.R. 1566 sponsor, dates, committee status Feb 10 2026, principles | med |
| L56 | https://www.autocare.org/government-relations/key-issues/access-to-and-control-of-vehicle-data/right-to-repair-and-vehicle-data | Industry page | Mass. 75 percent vote, wireless data flows to OEM, S. 1379 | med |

Pages fetched with content: 56. Pages tried that failed (not in ledger): mass.gov right to repair (403), congress.gov H.R. 906 (403), govtrack (403), EPA aftermarket defeat devices pages (404, several), EUR-Lex 2018/858 and 715/2007 (empty), SERMI domains (DNS and parked), CARB aftermarket pages (404), Federal Register and eCFR (redirected to an unblock page I did not follow), Wikipedia pages for REPAIR Act, Alliance v. Campbell, Ross-Tech, Tesla litigation, UNECE R155 (404), gov.uk DPF guidance (404).
