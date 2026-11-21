# OpenDiag: Legal, safety and liability envelope (second pass)

Written 2026-11-20. **Not legal advice.** This is a research note for the project owner. A lawyer who knows US copyright, Clean Air Act and EU type-approval law should review anything before a public release (this is already open item 13 in `docs/research/deep/EVIDENCE.md`).

This note builds on `docs/research/deep/legal-regulatory-landscape-deep.md` (called "first pass" below) and `security-research-and-misuse-prevention.md`. It does not repeat them. It adds primary-source reading the first pass could not do (its web search was capped), plus new topics: the 2026 EU diagnostic-access rules, the EU Cyber Resilience Act and Product Liability Directive, odometer law, the 2026 US enforcement shift, OEM lawsuits, how existing tools word their warnings, and concrete feature gating.

## Executive summary

1. **Reading is safe everywhere we looked. Writing is where the law, the stores and the liability all bite.** Fault reading, live data and read-only backup need only ordinary disclaimers. Coding writes need gating. Emissions, odometer, immobiliser and flash features should not exist in the project.
2. **New in 2026 (EU):** a Commission delegated act (C(2026) 1811, adopted 23 Mar 2026) lets carmakers demand tool and operator authentication for anything that changes the car, but forbids them to gate plain fault-code and VIN reads. A free open tool will not get write credentials on new EU cars by default. [high, primary text read]
3. **New in 2026 (US):** DOJ said in Jan 2026 it will stop criminal Clean Air Act charges for OBD tampering. Civil penalties (EPA lists up to $4,527 per violation, page updated May 2026) and state action (CARB) remain. Treat it as a relief valve, not a green light. [medium-high]
4. **The DMCA 1201 vehicle exemption protects the car owner, not the tool maker.** Our risk is trafficking in circumvention tools, so we ship no lock-breaking, no seed-key material, no OEM keys. Statutory damages are $200 to $2,500 per act or device. [high]
5. **EU liability law is friendlier to free open source than expected, if we stay non-commercial.** The new Product Liability Directive and the Cyber Resilience Act both carve out free open source supplied outside a commercial activity. Charging for the software, or monetising it through data, can flip that. [medium, secondary sources]
6. **Existing tools use three warning styles:** blocking checks (BimmerCode), liability caps (OBDeleven), and "off-road only" waivers (tuners). The waiver style is the weakest legally and we should not copy it. [medium]
7. **App stores have no OBD-specific rule we could find.** The general rules that matter are Apple 1.4 (physical harm), 2.3 (accuracy), 2.5.2 (no downloaded code that changes features) and 5.1 (privacy). [medium]
8. **Recommendation:** ship a "reader" build with no write code. Put writes behind a compile flag, a verified backup, a region and legal check, and a typed confirmation. Keep a hard deny-list (section 12).

Sections marked **PARTIAL** are listed in the Gaps section. Confidence tags are high / medium / low. Source numbers like [S12] point to the Sources section.

---

## 1. Scope and what this note adds

| Topic | First pass said | This note adds |
|---|---|---|
| DMCA 1201 | Exemption renewed 2015 to 2024; protects the user not the tool maker | Primary text of 17 USC 1201(f) and 1203 remedies; the 2027 cycle timeline; what 1201(f) does and does not let us share |
| EU access to repair data | Could not read Reg 2018/858 | UK-retained Art 61 text; the 2026 delegated act annex (authentication, tool cybersecurity, who may be gated); SERMI process |
| Emissions | CAA 7522 and per-part penalties | 2026 DOJ shift, EPA 2020 tampering policy, EPA 2026 repair guidance, CARB executive-order regime and the Weistec settlement |
| Warranty | MMWA outline | FTC 2024 warning letters and the "you cannot tie warranty to brand-name service" rule, and what the first pass said about the exception |
| Liability | Apache-2.0 and README safety section | EU PLD 2024/2853 and CRA 2024/2847 treatment of free open source; how real projects word warnings |
| OEM litigation | None found | Ford v Autel, GM v Autel, Ford v Launch, Ford v AirPro, a Mercedes software piracy plea |
| App stores | Apple and Google policy outline | Specific Apple sections and what they mean for data packs and write features |
| New topics | n/a | Odometer law, safety-device "make inoperative" rule, VIN as personal data, readiness-monitor effects of clearing codes |

---

## 2. US: DMCA section 1201 (deeper)

### 2.1 What the vehicle exemption says (37 CFR 201.40)

| Point | What the text says (paraphrased) | Confidence | Source |
|---|---|---|---|
| (b)(13) repair exemption | Lets a person circumvent access controls on software that is in, and controls, a lawfully acquired land vehicle when that is a necessary step to diagnose, repair or lawfully modify a vehicle function | high | [S1] |
| (b)(14) data exemption | Lets owners, lessees and people acting for them access, store and share operational data, including diagnostic and telematics data | high | [S1] |
| Subscription limit | Programs accessed through a separate subscription service are outside the exemption | high | [S1] |
| Not a safe harbor | Qualifying does not shield anyone from liability under other laws, with Department of Transportation and EPA rules named as examples | high | [S1] |
| Last renewal | October 2024 rule (effective 28 Oct 2024) renewed the vehicle repair exemption and added the vehicle data class | medium (secondary summaries of the Register's recommendation) | [S2] |

### 2.2 Why the exemption does not cover us as a tool maker

- The statute bans making or offering a product that is primarily designed to circumvent an access control, has limited other use, or is marketed for circumvention (three separate tests). [high] [S3]
- Section 1201(f) is the one narrow path for tool builders: someone entitled to use a program may circumvent solely to learn what is needed for an independently made program to interoperate, may build tools for that, and may share what they learn solely to enable interoperability. The sharing must not infringe copyright or break other law. [high] [S3]
- In plain words: **documenting a public protocol and writing our own client is on firm ground. Shipping a bypass for an OEM's seed-key unlock is not.** Under 1201(f) the sharing is only for interoperability, so a "key calculator" package is hard to defend even if the tool maker believes it is for owners.
- The first pass noted the Register states exemptions do not touch trafficking. This note agrees and adds the remedy numbers below.

### 2.3 Remedies and risk size

| Item | Detail | Confidence | Source |
|---|---|---|---|
| Civil damages | Plaintiff may elect statutory damages of $200 to $2,500 per act of circumvention, device, product, component, offer or performance of service, or actual damages plus profits | high | [S4] |
| Repeat violations | Court may raise awards up to triple, but only for a violation within 3 years after a final judgment against the same person for another such violation. Attorney fees to the prevailing party are discretionary (re-checked against 17 USC 1203 on 2026-11-20) | high | [S4] |
| Criminal | Requires willful violation for commercial advantage or private financial gain. Section 1204(b) says the criminal subsection does not apply to a nonprofit library, archives, educational institution or public broadcasting entity (not limited to a first offence). Figures are in the Addendum (re-checked: $500,000 and 5 years first offence, $1,000,000 and 10 years repeat) | high | [S4] |

**Read for OpenDiag:** a free, non-commercial project is far from the criminal trigger, and civil exposure is per distributed device. The practical risk is a takedown demand or suit that costs time, not a large judgment. That risk is still real, so the cleanest answer is to not ship any circumvention.

### 2.4 How hosting platforms react to 1201 claims

- GitHub restored youtube-dl in Nov 2020 after an RIAA 1201 takedown, and said it would have technical and legal experts review every 1201 claim and fund a $1 million defense effort. Forks stayed down for a while. [medium] [S5]
- Meaning for us: a 1201 complaint to GitHub is possible, the process is slower than a normal copyright takedown, and forks can be hit worse than the main repo. Keep a short written "no circumvention" policy in the repo so a reviewer can see the project's intent quickly.

### 2.5 Next rulemaking (relevant to the legal-watch list)

- Tenth triennial proceeding: notice of inquiry 9 Jun 2026, petitions due 24 Aug 2026, renewal comments 28 Sep 2026. Notice of proposed rulemaking 28 Oct 2026 proposes to readopt all existing exemptions except one that drew meaningful opposition. Comments from supporters are due 7 Dec 2026, opposition 22 Feb 2027, replies 22 Mar 2027. Renewed exemptions would run Oct 2027 to Oct 2030. [medium-high] [S6]
- **Not established:** whether the vehicle exemption is the one contested class. The pages read did not name it. A listing of a vehicle-data renewal petition from the Auto Care Association appeared in search results but was not opened. [low]

---

## 3. US: right to repair status (update)

| Item | Status found | Confidence | Source |
|---|---|---|---|
| REPAIR Act (H.R. 1566) | Subcommittee approved 10 Feb 2026 by voice vote. On 21 May 2026 the full Energy and Commerce Committee replaced it with a narrower repair subtitle inside H.R. 7389 (Motor Vehicle Modernization Act), passed 48-1. The subtitle writes the 2014 light-duty and 2015 commercial industry agreements into law with FTC enforcement and drops the telematics access mandate | medium-high | [S7] [S8] |
| Floor action | Reported as possibly folded into a surface transportation bill (H.R. 8870) due by 30 Sep 2026. Whether it passed was **not confirmed** | low | [S8] |
| Dealer lobby position | NADA opposes the original bill and urges keeping the committee version | medium (advocacy) | [S9] |
| Massachusetts data access law | Federal judge dismissed the automakers' challenge on 11 Feb 2025. She read the law as covering only data tied to diagnostics, maintenance and repair, found no federal vehicle safety standard on cybersecurity or data access to preempt it, and described allowed compliance paths. Appeal status **not found** | medium-high | [S10] [S11] |
| NHTSA 2023 | NHTSA told automakers in June 2023 the state law conflicts with federal safety law because of cybersecurity risk, then in Aug 2023 said they may begin adopting its requirements and suggested short-range wireless access would cut the risk | medium (news reports) | [S12] |

**Read for OpenDiag.** Even the narrower House text codifies the 2014 industry agreement, which is about access to service information and tools for independent shops. It does not create a right to write to modules. Do not market OpenDiag as "protected by right to repair". The earlier first-pass sentence that SEMA says it does not cover modification still stands.

**Design hint from the Massachusetts ruling:** the court named short-range options (a standard diagnostic connector with telematics dongles) as an acceptable way for automakers to give secure access. That is the OBD-port path OpenDiag already uses. [medium] [S10]

---

## 4. EU: access to vehicle data, type-approval and SERMI (largest new section)

**PARTIAL.** EUR-Lex returned empty pages for Regulation (EU) 2018/858 and for the delegated act. I worked from two readable sources: the UK-retained text of Article 61 (almost identical in structure) and the Council copy of the Commission's annex to the 2026 delegated act (PDF text extracted locally). Treat article numbers as the annex's own point numbers.

### 4.1 The base rule (Article 61)

| Point | Plain meaning | Confidence | Source |
|---|---|---|---|
| 61(1) | Makers must give independent operators unrestricted, standardised, non-discriminatory access to OBD information, diagnostic equipment and tools, software downloads, and repair information, in machine-readable form, including the remote diagnosis services they offer their own network | high (UK-retained text) | [S13] |
| 61(2) | Makers must provide a standardised, secure, remote facility so independent repairers can do operations that involve the vehicle security system | high | [S13] |
| 61(7) and (8) | Makers of OBD-compatible parts and diagnostic tools get information on non-discriminatory terms | high | [S13] |
| Not found in 61(1)-(11) | A fee rule, an approval process for independent operators, or any naming of generic scan tools. Those sit in Annex X | high | [S13] |

### 4.2 The 2026 delegated act on secure access (C(2026) 1811)

Adopted by the Commission 23 Mar 2026 as Delegated Regulation (EU) 2026/699 (title read on EUR-Lex; the annex doc is C(2026) 1811). It amends Annex X. The application date is "the twentieth day after publication" per a search summary, but the publication date was not found. [medium] [S14] [S15]

What the annex text says (paraphrased, point numbers are the annex's):

| Point | Rule | What it means for an open-source tool |
|---|---|---|
| 3.1 | A maker may require authentication of the **tool maker and the tool** before issuing access credentials, **except** for reading fault codes, reading the VIN, and reading data or clearing codes where unrestricted access by a generic scan tool is required by emissions law or listed UN regulations | Basic read and clear stays open to a generic tool. Everything else can be gated. [high] |
| 3.2 | If access changes the vehicle, the maker may require authentication of the **operator**. Pure read-only monitoring devices that report data without human interaction cannot be made to authenticate the operator | A logger is easier than a coder. [high] |
| 3.3 | If access reprograms vehicle software so behaviour changes and persists, the maker may require authentication of the **individual employee**, unless the tool maker attests, backed by an independent audit under 3 years old, that the operator can identify its staff | Flash and variant coding can need named, audited users. [high] |
| 3.4 | The "changes the vehicle" class includes activating actuators, running functional tests, clearing fault codes, resetting service lights, resetting adaptive learning values, part replacement with initialisation, and reading data by identifier (except for roadworthiness testing) | Even service resets and actuator tests can be gated. [high] |
| 3.5 | Calibration (adjusting parameters as the maker prescribes, without variant coding) also counts | [high] |
| 3.6 and 3.7 | The tool maker may be made to attest the tool's identity, and for changes the operator's pseudonymised identity and compliance with criteria; certificates come from a Trust Centre based on a conformity assessment body | A tool needs a legal entity that can sign attestations. [medium-high] |
| 6.1 | For anything beyond the 3.1 exceptions, the maker may require the tool to meet the Cyber Resilience Act (Regulation 2024/2847) and the tool maker to meet TISAX or ISO 27001 | A hobby project cannot do ISO 27001. [high] |
| 6.2 and 6.3 | For changes, the maker may require compliance with its own security implementation, which must not exceed what it demands of its own tools and suppliers, and must be non-discriminatory | [high] |
| 2.6 and 2.7 | 2.6: cybersecurity measures must not restrict access beyond what is necessary and proportionate under Reg 2019/2144 (Art 4.5(d), Annex II line D4). 2.7: measures against emissions tampering and odometer fraud are limited the same way and tied to Articles 4(7) and 4(8) of Euro 7 (Regulation 2024/1257) | Makers can cite cybersecurity and Euro 7 anti-tampering to justify gating. [high, re-read in annex text] |
| 7.4 | For changes, credentials may be limited to 24 hours | [high] |
| 8.1 | Operator criteria a maker may demand: liability insurance of at least EUR 1 million bodily injury and EUR 0.5 million property damage, and a legitimate business in the automotive sector. No other conditions may be imposed | A private hobbyist does not meet "legitimate business". [high] |
| Amended Annex X point 6.4 (not an Appendix point) | Reprogramming, variant coding and part activation must use non-proprietary hardware that follows ISO 22900-2, SAE J2534-1/-2, RP1210B or ISO/DIS 17978-1 (SOVD). (The Appendix point 6.4 is a different rule on compliance testing.) The earlier "equal access for all operators" wording is not confirmed here | Positive for adapter choice. [high on the hardware rule] |
| Appendix 2, point 3 | Makers must supply the information that generic diagnostic tool makers need, possibly for a reasonable fee | A way to get documented access, but aimed at companies. [high] |
| Amended Annex X point 7.5 | Information must reach independent operators at the latest when the vehicle is placed on the market. (Appendix point 7.5 is a different rule listing which operations the 24-hour limit covers) | [high] |

### 4.3 SERMI (security-related repair information)

- SERMI is the scheme where independent operators (and their staff, and remote service suppliers) get a digital certificate to reach security-related information such as keys, immobilisers and ECU functions. The certificate is issued after an inspection by a conformity assessment body, stored in a wallet app, and replaces brand-by-brand credentials. [medium] [S16]
- Practical requirements seen on certification body pages: company registration, a certificate of good conduct, relevant staff experience, and insurance (EUR 1 million bodily injury, EUR 0.5 million property damage). Example fees on one body's pages were EUR 204 per extra employee and EUR 750 for a remote service supplier plus one employee (prices differ by page). [medium] [S16] [S17]
- **Meaning for OpenDiag:** SERMI is built for businesses. An open-source project has no route to it, but a **shop** using OpenDiag might hold SERMI and pass credentials through. Keep the architecture open to a "credential provider" plug-in so that path is not blocked later (see section 13). That is an inference, not a documented use case. [low]

### 4.4 Euro 7 anti-tampering (Regulation 2024/1257)

- A security consultancy's analysis says Euro 7 for the first time makes anti-tampering a digital matter: makers must show that OBD data, calibrations and update paths cannot be bypassed, suppressed or falsified through software or communications. It names OBD suppression tools (devices that hide fault codes) and rogue calibrations through insecure update paths as concerns. [medium] [S18]
- A copy of the regulation on a legal-text site defines "tampering" as inactivating or modifying the engine, emission controls, traction battery, odometer, or OBD and on-board monitoring systems, including software. I did not verify this against EUR-Lex. [low] [S19]
- The implementing Regulation 2025/1706 is described as covering anti-tampering, security and cybersecurity requirements and as stating that manipulation devices and strategies are prohibited under Euro 7. Not read directly. [low-medium] [S19]
- **Reading for us:** in the EU, a tool that can change OBD behaviour or odometer-related values is not only a repair tool, it is a thing the maker is obliged to defend against. Expect new cars to include checks that reject non-authenticated writers. That is a reason to keep OpenDiag's core value in reading and verifying, as `direction.md` already proposes. [medium, inference]

### 4.5 EU right-to-repair directive (2024/1799)

Member states must apply it from 31 Jul 2026. It covers repair of **goods** with a reference to the 2019 sale-of-goods definition, but a Parliament summary says the scope in practice follows products for which EU law sets reparability requirements, such as washing machines. I found no source that says vehicles are covered or excluded. Vehicle repair information stays under the type-approval rules above. [low] [S20]

### 4.6 National road-use rules

| Country | Rule | Confidence | Source |
|---|---|---|---|
| Germany | Under StVZO 19(2) the operating permit lapses when a change alters the approved type, creates a foreseeable hazard, or worsens emissions or noise. Parts with an approval or expert report avoid that, and inspection bodies say chip tuning needs documents. A June 2025 change ended new issuance of parts reports (old ones run to 19 Jun 2028) and replaced them with a part type-approval. Software-only coding is **not addressed** in what I read | medium | [S21] |
| UK | DVSA says a car that needs a particulate filter and lacks one should fail its MOT. Garages that offer DPF removal or bypass risk losing MOT authorisation. DVSA has prosecuted tuners for illegal exhaust and remap work. Regulation 61 of the Construction and Use Regulations was not read here (first pass did read it) | medium | [S22] |

---

## 5. US: emissions tampering, 2026 picture

### 5.1 What changed in 2026

| Event | Detail | Confidence | Source |
|---|---|---|---|
| DOJ, Jan 2026 | DOJ announced in the week before 23 Jan 2026 (brief post on X by its environment account, reported 23 Jan; the 21 Jan date is unconfirmed) it will stop bringing **criminal** Clean Air Act charges for tampering with on-board diagnostics, and the trade-press article read says it did not say whether ongoing OBD cases would be dropped or paused. Civil enforcement with EPA continues. It did not legalise tampering, and hardware removal such as DPF or EGR was not addressed | medium-high (trade press, primary post not read) | [S23] [S24] |
| EPA penalty page | Civil penalties up to $4,527 per tampering event or defeat-device sale. Page last updated 14 May 2026. It says EPA often uses its Mobile Source Civil Penalty Policy and that cases target manufacturers, importers, distributors and consultants | high | [S25] |
| EPA, Mar 2026 | EPA released guidance letting approved NOx-sensor software updates replace DEF quality sensors without counting as illegal tampering. It says emission standards are not weakened | high | [S26] |
| EPA, 30 Jun 2026 | EPA release says makers must give independent shops the same service and diagnostic information as dealers, including for DEF systems; temporary overrides for repair are allowed in its reading; generic parts are allowed; EPA recognised SEMA's SC-E certification program for aftermarket parts. It does not use the term "defeat device" | high | [S27] |
| EPA tampering policy | The Nov 2020 policy sets how EPA handles civil enforcement. It generally does not pursue a person who holds a documented reasonable basis that a part is compliant. It covers federal law only; many states have their own tampering laws | medium-high (secondary summaries) | [S28] |
| Enforcement scope | EPA's anti-tampering poster says the prohibitions apply to anyone who services emissions-related parts of certified vehicles and to anyone who makes, distributes or installs emissions-related parts. Fueling, timing and OBD software and hardware alterations are listed among defeat-device categories in an EPA presentation | medium | [S29] |

**Read for OpenDiag.**
- The DOJ shift lowers criminal risk to individuals. It does nothing for a civil case, for a state agency, or for a product line that exists mainly to switch off emission controls.
- California is separate. CARB requires an executive order (EO) for aftermarket parts including ECU reflashes, off-the-shelf tunes without one fail smog check, and CARB settled with a tuner (Weistec) in May 2019 for $54 per unit, $6,500 total, for selling ECU calibrations without an EO. The CARB page names no car makes; the BMW and Mercedes link is background knowledge, not from the source (UNVERIFIED). [medium-high] [S30] [S31] [S32]
- California law exempts parts used on a vehicle that is raced only. That is a narrow, factual status, not a disclaimer you can claim by putting words on a box. [medium] [S31]

### 5.2 Clearing fault codes also has emissions side effects

State inspection programs (Texas, New York, Ohio, Vermont, Maryland) say that clearing codes or disconnecting the battery resets "readiness monitors" to "not ready". A car needs normal driving over days (Maryland advises about a week) before it can pass an inspection. CARB advises avoiding clearing codes if possible, and says permanent codes cannot be cleared with a scan tool. Ohio advises leaving codes in place after repair so the check engine light stays on. [medium] [S33]

This matters because a "clear codes" button is the most common write a free app offers. Two policy points follow (section 12): warn that clearing resets readiness monitors, and never present clearing as a way to pass an inspection.

---

## 6. US: other federal and state laws a diagnostics tool can touch

### 6.1 Odometer law

- 49 USC 32703 bans selling, installing or using a device that makes an odometer register a mileage other than actual miles driven, and bans disconnecting or resetting an odometer to change its reading. Section 32704 allows service or replacement if the registered mileage stays the same. [medium-high] [S34]
- Secondary summaries say criminal penalty up to $10,000 and/or three years prison, civil fines up to $10,000 per violation with each altered odometer counted separately, and a private action for three times actual damages or $10,000, whichever is greater. These numbers came from a defense-firm blog and were **not checked** against the statute or inflation adjustment. [low] [S35]
- No source I found speaks to OBD mileage-correction software specifically. EU Euro 7 also names odometer manipulation as a tampering concern (section 4.4).
- **Policy:** never write odometer or mileage values. Reading is fine.

### 6.2 "Make inoperative" safety-device rule

- 49 USC 30122 bars manufacturers, distributors, dealers, rental companies and **motor vehicle repair businesses** from knowingly making inoperative a device or design element installed to meet a federal safety standard. "Repair business" means a person holding itself out to the public to repair for compensation. NHTSA says knowledge of the specific effect is not required for a violation. [high] [S36]
- The statute is aimed at businesses, not private owners. There is no source I found on whether a software change that disables an airbag or driver-assist function counts. [gap]
- **Policy:** a free tool used by shops is where this risk lives. Do not offer coding that disables airbag, restraint, stability-control, brake or driver-assist functions. BimmerCode already does the analogous thing by blocking expert mode on safety-related modules. [medium] [S37]

### 6.3 Computer misuse and contracts

First pass section 4.2 already covers CFAA and terms-of-service risk for OEM back ends. New point: OEM litigation against tool makers has been about copying, scraping and licence abuse, not about owners connecting adapters (section 9).

### 6.4 Privacy and VINs

- The EU Court of Justice held on 9 Nov 2023 (case C-319/22, a dispute involving parts dealers and Scania) that a VIN alone is not personal data, but becomes personal data for anyone who has the means to identify the owner when the owner is a natural person. The Court also treated the obligation to give VINs to independent operators as a legal obligation under the GDPR. Commentators say the "indirect personal data" part is unclear. [medium] [S38]
- **Policy:** treat a VIN together with any account, device or location as personal data. Default to no telemetry, no VIN upload, VIN stored locally, and a redaction step before any shared log (this matches decisions already in the plan; here it gets a legal reason).
- Apple 5.1.1 asks for a privacy policy, consent before collecting even anonymous usage data, and data minimisation. [medium] [S39]

---

## 7. Warranty effects

| Question | Finding | Confidence | Source |
|---|---|---|---|
| Can a carmaker say "use only our service or warranty is void"? | In the US the Magnuson-Moss Warranty Act generally bars warrantors from conditioning a warranty on use of specified parts or service providers, unless they supply them free or get an FTC waiver. FTC staff sent warning letters in July 2024 to eight companies: five over statements that consumers must use specified parts or service providers, three over "void if removed" stickers. None were carmakers (the named firms were air-purifier, health-product and PC-hardware sellers), so it shows FTC policy, not car enforcement. FTC also treats false claims of voided warranties as possibly deceptive | high | [S40] |
| Can a carmaker deny a claim for damage it can attribute to a modification? | The first pass cited an FTC guide that coverage can be refused for damage caused by parts or service the warrantor did not supply. I did not re-read it. Burden-of-proof rules were **not found** | medium (first pass) | [S36 first pass] |
| EPA view | EPA's June 2026 release says that using a non-certified part does not guarantee warranty relief and that makers cannot require their own brand | medium | [S27] |
| Tuner practice | Tuning sellers say flash products may void parts of the factory warranty and may not be legal for highway use, and place the compliance duty on the buyer | medium (reseller listing, not official terms) | [S41] |

**Read for OpenDiag.**
- Reading and backup are not a warranty event in any source found. Coding writes **can** be evidence a dealer uses to dispute a later electronic fault. BMW and other makers can see coding changes and software states. A plain warning in the write flow should say that a dealer may see the change and may refuse coverage for a related fault, and that a restore point exists. [medium, inference on "dealer may see"; the first pass and `bmw-coding-failures-and-recovery` have the detail]
- Do not promise "warranty-safe" anywhere in marketing.

---

## 8. Liability and disclaimers

### 8.1 What the licence gives us

Apache-2.0 sections 7 and 8 provide an as-is warranty disclaimer and a limit on contributor liability, except where law requires liability (for example deliberate or grossly negligent conduct). Section 6 says the licence grants no trademark rights. Section 9 lets a redistributor offer warranties only on their own account. Section 4(d) requires NOTICE attribution. [high] [S42]

**Limits of a disclaimer.** The licence disclaimer is between licensor and licensee. It does not bind a third party (a passenger, a later buyer, a shop's customer), and law can override it for gross negligence or personal injury. I found no case law in this run on an open-source diagnostics author being held liable. That is a gap, not an assurance. [low]

### 8.2 EU Product Liability Directive (2024/2853)

- Software is now a "product". Free and open source software developed or supplied **outside the course of a commercial activity** is carved out in recital 14 and Article 2(2), per law-firm commentary. A price, or personal data used beyond basic purposes, brings it back. Integration by a manufacturer into a commercial product can make that manufacturer liable. [medium] [S43]
- Member states must transpose by 9 Dec 2026. One source says 8 Dec in the consolidated text, so the exact date needs checking. Products placed on the market after the date fall under the new rules. [medium] [S43]

### 8.3 EU Cyber Resilience Act (2024/2847)

- Applies in full from 11 Dec 2027. Vulnerability and incident reporting duties for manufacturers began 11 Sep 2026. Steward duties: sources differ (see section 14); not confirmed. [medium] [S44] [S45]
- Commission guidance of 27 Jul 2026 (reported by a law firm): free software is not placed on the market unless supplied while charging for the software, or used to monetise other products or services, or it needs personal data for purposes beyond security, compatibility or interoperability. A donation link alone does not show profit intent, though donations that work as a de facto fee for the product or features can lead to a commercial-activity presumption. (The personal-data trigger in the first sentence was not in the guidance summary re-read on 2026-11-20: UNVERIFIED.) A natural person offering free software is outside the scope. A **legal person** offering both free and paid versions has steward duties for the free one. [medium] [S44]
- Relevance: the 2026 delegated act (4.2) says makers may require diagnostic tools to meet CRA requirements. The CRA exemption for non-commercial open source may therefore not help a tool that wants write credentials from an automaker, because the maker's rule is its own contract term. [medium, inference]

**Practical rule:** stay non-commercial for the 12 weeks (no price, no paid tier of the same code, no data-for-service). If a foundation or company forms later, ask counsel about steward duties first. Link to `business-models-and-sustainability.md` for the money side.

### 8.4 US product liability (not researched)

I did not find a primary source on how US courts treat free diagnostic or coding software in injury or property claims. Background knowledge, **not verified here**: product liability usually needs a product placed in commerce, and economic-loss rules limit recovery for a bricked module. Both are state law and need counsel. [low]

### 8.5 Safety-case thinking from open source

- openpilot's safety document says the driver stays responsible, the system may disengage without warning, it disclaims fitness for a particular purpose, it limits steering and speed changes so a driver can always take over, and it requires forks to keep the safety checks and not use the openpilot name if they weaken the safety code. [medium-high] [S46]
- The opendbc README describes safety by design: boot in a silent mode, require an explicit safety mode before sending, disable the "allow all" mode in release firmware, 100 percent line coverage on safety unit tests, and mutation testing of the tests. It has **no** separate legal disclaimer beyond the MIT licence. [medium-high] [S47]
- Lesson: the strongest published protection is **engineering gates plus a trademark and fork policy**, not extra legal prose. This fits owner decision 6 (writes compiled out until a reviewer signs off).

---

## 9. OEM legal action against tool makers (new)

| Case | What it was about | Result as far as found | Confidence | Source |
|---|---|---|---|---|
| Ford v Autel (E.D. Mich., 2015) | Ford alleged Autel's tool used its diagnostic data and software and used Ford's logo | Court dismissed DMCA 1201 claims as inadequately pleaded (a pirating purpose was required under the circuit's reading), dismissed the copyright claim for not showing protectable elements were copied (thin protection for a data compilation), but let the **trademark** claim proceed (the summary read does not separate federal from state claims) over the logo on a menu screen, and trade secret claims continued. The court did not reach reverse-engineering defences | medium (one blog summary) | [S48] |
| GM v Autel | GM alleged login credentials for GM and ACDelco sites were used to get and spread copyrighted access software | A court let GM's copyright claims continue (2016 report) | low-medium (snippet) | [S49] |
| Ford v Launch (E.D. Mich.) | Ford alleged Launch hacked diagnostic software and copied data compilations into a rival tool | Docket found, outcome not read | low | [S50] |
| Ford v AirPro | Single-shop OEM subscription allegedly used across several facilities remotely; claim of licence and copyright breach | Court denied AirPro's summary judgment on the copyright and contract claims; AirPro denies reproducing OEM software | medium | [S51] |
| Mercedes pirated software | A Louisiana parts distributor pleaded guilty to making and selling over 800 pirated copies of Mercedes diagnostic software valued above $17 million | Guilty plea. Details from a search snippet of a DOJ page whose body could not be fetched | medium-low | [S52] |

**Patterns.** Every action I found concerned copying software, scraping databases, abusing licences or using OEM logos. None targeted an independent tool that speaks a protocol on its own code and data. The trademark claim in Ford v Autel is the part that survived early. So the single cheapest protection is **no OEM logos or look-alike marks in the UI, icon or marketing.** [medium] First pass 4.3 point 6 already said this.

---

## 10. App-store policy for OBD apps

I found **no** OBD-specific rule or rejection report in this run (search returned only store listings). What follows is the general policy text read, with what it implies.

| Platform and rule | What it says (paraphrased) | Implication for OpenDiag | Confidence | Source |
|---|---|---|---|---|
| Apple 1.4 physical harm | Apps that risk physical harm may be rejected. 1.4.1 gives medical apps extra scrutiny and asks accuracy claims to be disclosed and validated. 1.4.4 and 1.4.5 are about DUI checkpoints and encouraging dangerous activity | No rule names cars. A write feature that can change brake lights or lock a module is the harm the reviewer may ask about. Describe safeguards in Notes for Review. [medium, inference] | medium | [S39] |
| Apple 2.3 accuracy | Features must be described accurately in Notes for Review; misleading marketing may lead to removal; screenshots must show the app in use; names and keywords must not stuff trademarks | Compatibility lists must be backed by real tests. Do not use "BMW" in the name or keywords. [medium] | medium-high | [S39] |
| Apple 2.5.2 downloaded code | Apps must be self-contained and may not download or execute code that adds or changes features | Data packs must be **data**, not scripts. Coding catalogs, DTC text and signal maps are fine if declarative and interpreted by shipped code. A pack format with executable logic is not. [medium-high] | medium-high | [S39] |
| Apple 5.1 privacy | Privacy policy link, consent before collecting data (even anonymised), minimise data, do not require account unless needed | Matches the no-telemetry default. Log sharing must be opt-in, user-initiated. | high | [S39] |
| Apple 3.1.4 | Hardware-dependent features may unlock without in-app purchase | Not an issue for a free app | medium | [S39] |
| Google Play, device and network abuse | Apps may not interfere with other devices or networks without authorisation, may not download executable code outside Play (interpreted code in a VM is exempt) | Same data-not-code rule. The "interfere with other devices" line is one reviewers could cite against a feature that writes to a car; keep the user-initiated, backup-first flow documented. [low, inference] | medium | [S53] |
| Android Bluetooth | Apps targeting Android 12 or later declare BLUETOOTH_CONNECT for paired devices and BLUETOOTH_SCAN for scanning (with an assertion if scan results do not derive location). Requesting them shows the "Nearby devices" prompt | Need a clear in-app explanation and a privacy policy that states Bluetooth use | medium | [S54] |
| Existing apps | Many OBD apps are listed on both stores, mostly read-only or ELM327-based, many warn about clone adapters | The category is accepted. BimmerCode and others do coding on the stores (per earlier docs) | medium | [S55] |

**Open-source fit.** Apache-2.0 is compatible with store distribution. Share-alike data (OBDb, CC-BY-SA) lives in a separate pack per owner decision 1. Check store terms for that pack before shipping it inside an app. [low, not researched]

**Suggested posture:** ship the store apps as the reader build only, with no write code. Keep write-capable builds as signed desktop releases for people who opt in. This also keeps owner decision 6 true by construction.

---

## 11. How existing tools word warnings

Only what I could read is recorded. Several pages blocked automated reads (403) or did not show their legal text.

| Tool | What I could read | Style | Confidence | Source |
|---|---|---|---|---|
| BimmerCode | FAQ lists operational warnings (code with engine off and ignition on; temporary fault codes after coding; expert mode misuse can need a module reflash; restore from backup; expert mode excludes safety-related modules; demo mode does not reflect your car; some options may not work). It **blocks** coding on certain states (a possibly corrupted boot sector in a lighting module, third-party head-unit modifications, air-conditioning pressure fault) and disclaims responsibility for head-unit failures during coding. Site states no affiliation with BMW AG and acknowledges BMW marks. The legal terms page exists (Terms, Legal Disclosure, Refund, Privacy) but its body was not shown | Preventive blocks plus FAQ warnings plus trademark notice | medium | [S37] [S56] |
| OBDeleven | Warranty page caps total liability at what the customer paid for the hardware, disclaims lost data, profits and vehicle damage caused by its hardware or software, says it does not guarantee accurate fault detection and advises seeking professional help. Main terms 403 | Liability cap and professional-help line | medium | [S57] |
| bootmod3 | Official legal page snippet: tuning services designed for off-road use except exempt items; ordering means accepting terms. A reseller listing adds that catalytic monitor removal is for off-road use and that parts may void factory warranty and may not be highway legal | "Off-road only" waiver | medium-low | [S41] |
| Tuner waivers in general | Waivers that put emissions and noise compliance on the buyer, say highway use violates the Clean Air Act, and limit seller liability. EPA enforcement documents also appeared in search results for sellers who used this style | Waiver | medium | [S58] |
| openpilot | See 8.5: driver responsibility, may disengage, fork safety rules, not-for-warranty language | Safety-case statement | medium-high | [S46] |
| opendbc and python-OBD | opendbc: no disclaimer beyond MIT, strong engineering gates. python-OBD: only "support varies from car to car" and "stay safe" | Minimal | medium-high | [S47] [S59] |
| EdiabasLib | No liability text; says it is for experts, no time for support, limited testing; GPL-3.0 | Minimal | medium | [S60] |
| Apache-2.0 / MIT | As-is disclaimers | Licence only | high | [S42] |

**What to take from this.** The best-regarded behaviour (BimmerCode) is **preventing** a risky coding in a known-bad state and telling the user how to recover. The worst legally is the "off-road only" label on a product whose real effect is on road cars; first pass 4.3 point 3 already warned against it, and EPA's enforcement language covers anyone who makes, sells or installs such parts. [medium]

---

## 12. Policy recommendations (concrete)

All of this is a design input for counsel, not legal advice. "Reader build" = no write code compiled in. "Lab build" = write code present, desktop only, off by default.

### 12.1 Feature gating matrix

| # | Feature | Legal and safety exposure | Gate | Warning needed | Public reader build? | Lab build? |
|---|---|---|---|---|---|---|
| 1 | Read fault codes, VIN, live data, freeze frames, readiness status | Lowest. EU rule says generic tools cannot be gated for read of codes and VIN (4.2) | None | One-time notice that data may be incomplete; no repair claim | Yes | Yes |
| 2 | Read-only module backup and diff (no write) | Low; data exemption (b)(14) fits | Voltage and link health check shown | Backup files can contain VIN and coding; stored locally; share only after redaction | Yes | Yes |
| 3 | Clear fault codes | Resets readiness monitors; inspection programs warn about it (5.2). In the EU may be gated by the maker except where emissions law requires open access | Confirm dialog | Say what clearing does: lights go off but the fault may return; monitors need days of driving; it is not a way to pass inspection; permanent codes stay | Yes | Yes |
| 4 | Adaptation and service resets (battery registration, oil service reset) | Writes to the car. In the EU may be gated (3.4). Low harm if the car is healthy | Lab build only until reviewer sign-off | Dealer may see the change; use the right procedure; stop on low voltage | No | Yes, behind backup |
| 5 | Actuator and functional tests (horn, lights, windows) | Safety risk if the car moves or a person is near | Lab only; vehicle stationary and park check | Keep people clear; test stops after a timeout | No | Yes |
| 6 | Comfort coding (chimes, mirror fold, display options) | Writes to the car; (b)(13) "lawful modification". Dealer and warranty effect | Lab only; verified backup; typed confirmation; only on the bench module in the 12 weeks (decision 2) | Full write warning (12.3) | No | Yes (bench only) |
| 7 | Lighting coding (daytime running lights, tail and brake light behaviour) | Road-use law differs by country; Germany's permit rule (4.6); possible safety defect | Lab only plus region check; deny-list entries that remove required lamps | Region warning; "may make the car not road legal" | No | Yes, with deny-list |
| 8 | Safety-system coding (airbag, restraints, stability control, brakes, steering, driver assist) | "Make inoperative" risk for repair businesses (6.2); physical injury | **Do not build** | n/a | No | No |
| 9 | Feature unlocks that change legal behaviour (video in motion, speed-limit tricks) | Distraction and road-use law; three sellers already do it (per `direction.md`), legal edge | Not in scope for 12 weeks; if ever, lab only, region check, "stationary only" wording | Distraction warning; local law | No | No (later decision) |
| 10 | Odometer or mileage write | Federal and EU odometer rules (6.1, 4.4) | **Do not build** | n/a | No | No |
| 11 | Emissions control changes (DPF, EGR, SCR, catalyst, O2 or readiness spoofing, delete maps) | Clean Air Act, state law, Euro 7 (5.1, 4.4) | **Do not build.** Do not host or link tune files | n/a | No | No |
| 12 | ECU flash and calibration writes | Highest physical risk and tuning law exposure; EU makers can demand audited identity (4.2 point 3.3) | **Do not build** in this plan | n/a | No | No |
| 13 | Immobiliser, key learning, gateway or secure-diagnostic bypass | Theft route; SERMI-protected in the EU; trafficking risk in the US (2.2) | **Do not build.** No seed-key material, no bypass guides | n/a | No | No |
| 14 | Cloud upload of logs, VIN, location | GDPR (VIN as personal data), store privacy rules | Off by default; opt-in per upload; redaction preview | Say exactly what is sent | Optional | Optional |
| 15 | Third-party data packs and signed pack updates | Provenance and share-alike; store rule against downloaded code (10) | Data only; signed; provenance fields required (matches the pack linter already planned) | Show pack source and licence | Yes | Yes |

### 12.2 Hard deny-list (code level, not just policy)

1. No write to any identifier, coding block or routine on a module classed as safety-related (airbag, restraint, brakes, steering, stability, driver assist).
2. No odometer or mileage write.
3. No emissions-system change. Keep a maintained list of emissions-related DIDs and routines per platform and refuse them in the write layer.
4. No seed-key material, no OEM keys, no OEM files, no exploit steps. Already a clean-room rule; add a CI check that scans for forbidden artefacts.
5. No OEM trademarks, logos or look-alike icons in the UI or store listing.
6. No tune-file hosting, upload or link directory.
7. No remote execution: a write must be started by a person at the machine, not by a cloud message (supports app-store rules and misuse prevention in `security-research-and-misuse-prevention.md`).

### 12.3 Warning wording (plain, in our own words; adapt with counsel)

| Moment | Draft text |
|---|---|
| First run (all builds) | "OpenDiag reads data from your car. It does not replace a professional repair. Readings can be incomplete or wrong. You are responsible for how you use it and for following the laws where you drive. This is not legal or safety advice." |
| Before enabling Lab build | "Writing to a car module can stop a feature, cause a fault, or make a module unusable. Writes are only tested on bench modules in this project. Do not use on a car you depend on. Changes may be visible to a dealer and may affect warranty coverage. Emissions, safety and road-use laws still apply even where software access is allowed." |
| Before any write | Show: the exact change, the backup file hash, battery voltage and link quality, whether the car is stationary with ignition on and engine off. User types the module name to continue. |
| After clearing codes | "Fault lights are cleared. Emissions monitors are reset and need days of normal driving before an inspection. If the fault returns, get it diagnosed." |
| Region notice (US) | "Changes that affect emissions controls are illegal for road use under federal and state law, including California. This tool does not support them." |
| Region notice (EU and UK) | "Changes can end road-legal status. Some makers require authenticated tools for coding and service functions; OpenDiag may be refused on newer cars." |
| README safety section | No warranty; user responsibility; read-only default; no support for emissions, odometer or immobiliser features; report safety issues to a named contact. Mirrors the first-pass governance advice. |

### 12.4 Governance and process

1. **Trademark policy** separate from the Apache licence (the licence gives no trademark rights, section 6). Say forks that weaken safety checks cannot use the name, modelled on openpilot's fork rule. [medium]
2. **Safety reviewer sign-off** before any write path is compiled into a public artefact (already decision 6). Define sign-off as: deny-list tests pass, backup-before-write tests pass, bench round-trip logs attached.
3. **Provenance log** for every data item (source URL, licence, date, who) so a takedown can be answered in hours. First pass 4.5 and `data-strategy.md` already lean this way.
4. **Takedown playbook**: one page that says who answers a 1201 or copyright complaint, what we show (clean-room statement, no circumvention), and how to move hosting if needed. Use the GitHub 1201 review process as the expected path (2.4).
5. **Stay non-commercial** until counsel advises (8.2, 8.3). That means no sale of the software, no data-for-service, no paid tier of the same code, and donations treated as gifts, not a price.
6. **Legal watch list** with an owner and a date for each: REPAIR Act and H.R. 7389 (3), Massachusetts appeal (3), 1201 NPRM comment dates 7 Dec 2026, 22 Feb and 22 Mar 2027 (2.5), the 2026 delegated act application date and later maker authentication rollouts (4.2), CRA and PLD dates 11 Sep 2026, 9 Dec 2026, 11 Dec 2027 (8), DOJ and EPA enforcement after the Jan 2026 shift (5.1).
7. **Insurance and indemnity**: nothing found. If a lab build is ever distributed to others, ask counsel about project-level insurance and a contributor policy.
8. **Reporting channel**: security and safety issues go to a private contact first (supply-chain advice in `security-research-and-misuse-prevention.md`).

### 12.5 What this changes in the plan

| Plan item | Effect |
|---|---|
| Decision 2 (bench-only writes, mandatory backups) | Confirmed and strengthened. Add the deny-list and typed confirmation as test targets for G5 |
| Decision 6 (writes compiled out of public builds) | Make it a build flag with a CI test that proves the public binary has no write symbols |
| Owner captures (read-only) | Fine. Redact VIN before sharing traces |
| EVIDENCE item 13 (legal gate) | Narrows to: counsel check of OBDb share-alike pack, trademark name, and the deny-list wording. EU Articles 61 to 66 are now partly answered (4) |
| `kpis.md` G5 | Add "writes to deny-listed modules or identifiers: 0 possible" as a sub-check |
| New KPI idea | Share of features that are read-only versus write (first pass 4.4 asked for this) |

---

## 13. Architecture hooks the legal picture suggests

These are options, each flagged as inference.

1. **Credential provider interface.** A plug-in point where an authorised shop could supply a maker or SERMI credential, so OpenDiag does not block a legitimate path. We never store or distribute credentials ourselves. [low, inference]
2. **Capability tiers in code.** Read, Backup, Write-bench, and nothing above. Each tier is a separate package so a store build can omit the higher ones.
3. **Region profile.** A setting (US, California, EU, UK, Germany, other) that changes warnings and hides features per policy. It does not claim to know the law; it only changes wording and defaults.
4. **Audit log.** Every session records adapter, voltage, backups, writes with before and after values, and who confirmed. This helps users restore and helps us answer a dispute.
5. **Declarative data only.** Packs contain tables and mappings. No scripts. This satisfies the store rule on downloaded code and reduces supply-chain risk.

---

## 14. Confidence and disagreements

| Point | Disagreement or weakness |
|---|---|
| DOJ shift date | One report says it is from a post on X reported 23 Jan; a search summary says 21 Jan. Primary post not read |
| Criminal odometer penalties | From a defense-firm blog; unverified |
| PLD application date | 8 Dec versus 9 Dec 2026 across sources |
| CRA steward start | Sources differ between "from 11 Dec 2027" and reporting-only for stewards; article-level text not read |
| NHTSA stance on repair access | The court coverage says the judge cited NHTSA guidance against using cybersecurity to restrict repair; news reports say NHTSA's June 2023 letter argued the opposite. Both can be true at different dates. Read the letters before relying on either |
| First-pass EPA figures | The first pass mentions $4,527 and the older note $4,454. The EPA page says $4,527, updated May 2026 |

---

## Sources

Reliability: high = statute, regulation or official page read directly; medium = law-firm, trade press, advocacy group or partly read; low = snippet only or unverified.

| # | URL | What it gave | Reliability |
|---|---|---|---|
| S1 | https://www.law.cornell.edu/cfr/text/37/201.40 | Vehicle exemptions (b)(13), (b)(14), not a safe harbor | high |
| S2 | https://www.copyright.gov/1201/2024/2024_Section_1201_Registers_Recommendation.pdf and https://govinfo.gov/content/pkg/FR-2024-10-28/pdf/2024-24563.pdf | 2024 rule context (seen via search results; recommendation text not re-read here) | medium |
| S3 | https://www.law.cornell.edu/uscode/text/17/1201 | 1201(a)(2) trafficking tests, 1201(f) interoperability | high |
| S4 | https://www.law.cornell.edu/uscode/text/17/1203 and https://statecodesfiles.justia.com/us/2021/title-17/chapter-12/sec-1204/sec-1204.pdf | Civil remedies and criminal conditions (via search summary) | medium |
| S5 | https://github.blog/news-insights/policy-news-and-insights/standing-up-for-developers-youtube-dl-is-back/ and https://www.eff.org/deeplinks/2020/11/github-reinstates-youtube-dl-after-riaas-abuse-dmca | GitHub 1201 handling | medium |
| S6 | https://www.copyright.gov/newsnet/2026/1097.html and https://www.copyright.gov/1201/2027/index.html | Tenth triennial dates and NPRM | medium-high |
| S7 | https://collisionweek.com/2026/05/26/u-s-house-energy-commerce-codifies-industry-mous-place-full-repair-act/ | Committee replaced REPAIR Act text with MOU subtitle | medium |
| S8 | https://www.autocare.org/news/latest-news/details/2026/02/10/repair-act-(h.r.-1566)-advances-to-full-congressional-committee-hearing | Subcommittee advance (search result, not opened) | low-medium |
| S9 | https://www.nada.org/legislative/oppose-repair-act-hr-1556s-1379 | Dealer association opposition (search result) | low-medium |
| S10 | https://www.repairerdrivennews.com/2025/02/17/federal-judge-cites-plain-language-of-mass-data-access-law-multiple-access-options-as-means-for-oems-to-comply/ | Ruling reasoning | medium |
| S11 | https://www.wbur.org/news/2025/02/12/massachusetts-right-to-repair-carr-law-challenges-dismissed | Dismissal on 11-12 Feb 2025 (search summary) | medium |
| S12 | https://www.autoblog.com/2023/06/14/u-s-tells-automakers-not-to-comply-with-massachusetts-independent-repairs-law/ and https://www.boston.com/news/local-news/2023/06/15/right-to-repair-federal-officials-automakers-not-to-comply-massachusetts-law/ | NHTSA 2023 letters (search summary) | low-medium |
| S13 | https://legislation.gov.uk/eur/2018/858/article/61/2022-12-31?view=plain | UK-retained Article 61 | high (for UK text) |
| S14 | https://data.consilium.europa.eu/doc/document/ST-7952-2026-ADD-1/en/pdf | Annex to C(2026) 1811, read via local text extraction | high |
| S15 | https://eur-lex.europa.eu/eli/reg_del/2026/699/oj/eng | Delegated Regulation (EU) 2026/699 of 23 Mar 2026: title and subject read; application date in the last 2.5k characters not read | medium-high |
| S16 | https://www.digidentity.eu/services/sermi-information/independent-operators | SERMI certificate process (search result) | medium |
| S17 | https://www.kiwa.com/en/nl/services/certification/sermi-certification-extra-employees-independent-operator-ioe/ | Example SERMI fees (search result) | medium |
| S18 | https://www.nccgroup.com/media/h1xako3k/euro-7-antitampering-and-the-expanding-cybe_.pdf | Euro 7 anti-tampering analysis, read via local text extraction | medium |
| S19 | https://lawplayer.com/eu/act/32024R1257 and https://eur-lex.europa.eu/eli/reg_impl/2025/1706/oj/eng/pdf | Euro 7 text and implementing act (search summaries only) | low |
| S20 | https://eur-lex.europa.eu/eli/dir/2024/1799/oj and https://oeil.europarl.europa.eu/oeil/en/procedure-document-summary/pdf?id=1786203 | Repair directive scope (search summary) | low-medium |
| S21 | https://www.tuev-nord.de/de/wissen/ratgeber-und-tipps-mobilitaet/chip-tuning/ and https://www.autozeitung.de/kba-teiletypgenehmigung-ersetzt-teilegutachten-208888.html | German permit-lapse and 2025 parts-report change (search summary) | medium |
| S22 | https://mattersoftesting.blog.gov.uk/diesel-particulate-filters-protecting-the-environment-and-the-mots-integrity/ | DVSA on DPF and MOT (search summary) | medium |
| S23 | https://www.thedrive.com/news/feds-wont-pursue-criminal-charges-against-tuners-for-obdii-tampering-anymore | DOJ criminal policy shift | medium |
| S24 | https://www.fleetmaintenance.com/equipment/emissions-and-efficiency/news/55352642/doj-wont-pursue-jail-time-for-diesel-deleting-civil-penalty-risk-to-remain | Civil risk remains (search result) | low-medium |
| S25 | https://www.epa.gov/enforcement/clean-air-act-vehicle-and-engine-enforcement-case-resolutions | $4,527 per violation, updated 14 May 2026 | high |
| S26 | https://www.epa.gov/node/299368 | EPA 26 Mar 2026 DEF sensor guidance | high |
| S27 | https://www.epa.gov/node/300600 | EPA 30 Jun 2026 repair information and SEMA recognition | high |
| S28 | https://www.epa.gov/sites/production/files/2020-12/documents/epatamperingpolicy-enforcementpolicyonvehicleandenginetampering.pdf | 2020 tampering policy (via search summaries; PDF not opened) | medium |
| S29 | https://epa.gov/system/files/documents/2021-11/antitamperingposter.pdf | Who the tampering rules apply to (search snippet) | medium |
| S30 | https://ww2.arb.ca.gov/weistec-engineering-inc-case-settlement | Weistec settlement | high |
| S31 | https://ww2.arb.ca.gov/sites/default/files/2020-07/Advisory_292_7.10.20.pdf and https://ww2.arb.ca.gov//msprog/aftermkt/aftermkt.htm | CARB EO requirement and racing exception (search summary) | medium |
| S32 | https://www.thedrive.com/news/41606/california-starts-cracking-down-on-non-approved-ecu-tunes-today-heres-why | California smog check on unapproved tunes (2021) | medium |
| S33 | https://www.dps.texas.gov/section/vehicle-inspection/faq/ready-or-not ; https://dmv.ny.gov/what-do-you-mean-my-cars-not-ready ; https://ww2.arb.ca.gov/board-diagnostic-obd-readiness-criteria ; https://dam.assets.ohio.gov/image/upload/epa.ohio.gov/Portals/27/echeck/docs/Readiness-fact-sheet.pdf | Readiness monitors reset after clearing codes (search summary) | medium |
| S34 | https://www.law.cornell.edu/uscode/text/49/32703 | Odometer device ban (search summary) | medium |
| S35 | https://www.shouselaw.com/ca/blog/criminal-defense/odometer-tampering-is-a-federal-crime/ | Odometer penalty figures (not verified) | low |
| S36 | https://www.law.cornell.edu/uscode/text/49/30122 and https://nhtsa.gov/interpretations/30122-make-inoperative-alan-nappier-april-14 | Make-inoperative rule and NHTSA letters (search summary) | medium |
| S37 | https://bimmercode.app/faq/ | BimmerCode warnings and coding blocks | high (as to the page) |
| S38 | https://twobirds.com/en/insights/2023/global/decoding-data-ecjs-verdict-on-vehicle-identification-numbers-as-personal-data | VIN as personal data, C-319/22 | medium |
| S39 | https://developer.apple.com/app-store/review/guidelines/ | Apple review rules (read up to 5.6; 5.2.5 and later parts partly missed) | high |
| S40 | https://search.ftc.gov/news-events/news/press-releases/2024/07/ftc-warns-companies-stop-warranty-practices-harm-consumers-right-repair | FTC warranty tie-in warning letters | high |
| S41 | https://autotalent.com/products/bootmod3-n63t2-tune-for-bmw-g-series-m550-750i-2016-2019 and https://www.bootmod3.com/ru/legal | Reseller and official snippets on off-road and warranty wording (official page returned 403 on fetch) | low-medium |
| S42 | https://www.apache.org/licenses/LICENSE-2.0.txt | Apache-2.0 sections 4, 6, 7, 8, 9 | high |
| S43 | https://www.ibanet.org/European-Product-Liability-Directive-liability-for-software ; https://www.sidley.com/en/insights/newsupdates/2026/10/revised-eu-product-liability-directive ; https://cms.law/en/int/publication/the-new-eu-product-liability-directive-eu-2024-2853 | PLD and open-source carve-out (search summary) | medium |
| S44 | https://www.orrick.com/en/Insights/2026/09/EU-Cyber-Resilience-Act-New-Guidance-Clarifies-Scope-Reporting | CRA guidance on free software and donations | medium |
| S45 | https://opensource.org/blog/eu-ai-act-and-cra-timelines-and-resources ; https://www.traverssmith.com/knowledge/knowledge-container/the-eu-cyber-resilience-acts-vulnerability-and-incident-reporting-requirements-are-now-live/ | CRA dates (search summary) | medium |
| S46 | https://github.com/commaai/openpilot/blob/master/docs/SAFETY.md | openpilot safety wording | medium-high |
| S47 | https://github.com/commaai/opendbc | opendbc safety model | medium-high |
| S48 | https://tushnet.com/2015/10/05/dmca-doesnt-block-reverse-engineering-of-vehicle-diagnosis-software-but-tm-might/ | Ford v Autel ruling summary | medium |
| S49 | https://thompsoncoburn.com/insights/publications/item/2016-04-20/court-preserves-gm-s-copyright-claims-against-autel-and-its-vp | GM v Autel (search snippet) | low-medium |
| S50 | https://docs.justia.com/cases/federal/district-courts/michigan/miedce/2:2017cv12906/323114/50 | Ford v Launch docket (search result) | low |
| S51 | https://www.repairerdrivennews.com/2020/03/02/ford-sues-airpro-alleging-trademark-software-license-violations/ | Ford v AirPro (search snippet) | low-medium |
| S52 | https://www.justice.gov/archives/opa/pr/auto-parts-distributor-pleads-guilty-manufacturing-and-selling-pirated-mercedes-benz-software | Mercedes software piracy plea (page body failed to load; snippet only) | low-medium |
| S53 | https://support.google.com/googleplay/android-developer/answer/9888379 | Google Play device and network abuse policy | high (as to page) |
| S54 | https://developer.android.com/develop/connectivity/bluetooth/bt-permissions | Android Bluetooth permissions (search summary) | medium |
| S55 | https://apps.apple.com/us/app/obd2-car-scanner-eobd-facile/id713921569 and similar listings | OBD apps exist on the store (search result) | medium |
| S56 | https://bimmercode.app/ | BimmerCode footer links and trademark statement | high (as to the page) |
| S57 | https://obdeleven.com/warranty | OBDeleven liability cap and disclaimers (search summary) | medium |
| S58 | https://diyautotune.com/pages/off-road-race-disclaimer ; https://www.epa.gov/sites/default/files/2021-06/documents/streettosandoff-roadllc.pdf | Waiver style and an EPA document about an off-road-style seller (titles only, not opened) | low |
| S59 | https://github.com/brendan-w/python-OBD | python-OBD wording | high (as to page) |
| S60 | https://github.com/uholeschak/ediabaslib | EdiabasLib wording | high (as to page) |
| S61 | docs/research/deep/legal-regulatory-landscape-deep.md and docs/research/deep/security-research-and-misuse-prevention.md | First-pass material not repeated here | in-repo |

---

## Addendum (closes part of Gaps 7)

| Item | Finding | Source | Confidence |
|---|---|---|---|
| 17 USC 1204 criminal penalty | Willful 1201 violation for commercial gain: first offence up to $500,000 and 5 years; repeat up to $1,000,000 and 10 years. Nonprofit libraries, archives, schools and public broadcasters are exempt. A free project is not automatically "nonprofit" in this sense, and the offence needs commercial advantage or private gain. | https://www.law.cornell.edu/uscode/text/17/1204 | high |
| 49 USC 32709 odometer penalties | Civil penalty up to $10,000 per violation, $1,000,000 cap per series. Criminal: knowing and willful violation up to 3 years. Private damages sit in 32710 (not read). | https://www.law.cornell.edu/uscode/text/49/32709 | high (32709), not read (32710) |

Effect: gap 7 is now only open for the 32710 private-damages figure. It reinforces the deny-list: no odometer or mileage writing, ever.

---

## Gaps (what could not be established)

1. **EU Regulation 2018/858 consolidated text** (Articles 61 to 66 and Annex X): EUR-Lex returned empty pages. Only the UK-retained Article 61 and the 2026 annex were read. The exact application date of the 2026 delegated act was not found (the EUR-Lex page for Regulation 2026/699 was readable but its last 2.5k characters were not). Fact-check pass 2026-11-20: annex point numbers were re-read from the Council PDF and several labels corrected; the 3.x and 6.x rows match, but the doc mixes Appendix points and amended Annex X points. **PARTIAL.**
2. **Euro 7 operative text** (Articles 4(7), 4(8), anti-tampering annex) and Implementing Regulation 2025/1706 were not read. The definition of "tampering" came from a low-reliability copy.
3. **US product liability for free diagnostic or coding software**: no source found. No case law found on authors being held liable.
4. **Whether a general coding tool counts as a part "whose principal effect" is bypass** under the Clean Air Act: no source answers it (same as first pass open question 7).
5. **Status of the REPAIR Act and H.R. 7389 after May 2026**, and the **Massachusetts appeal**.
6. **Whether the vehicle 1201 exemption was renewed or contested in the 2027 cycle**: pages read did not name it.
7. **Odometer private-damages figure (49 USC 32710)**: not read. (1204 and 32709 penalties were verified, see Addendum.)
8. **Apple and Google rejection reports for OBD apps that write to cars**: none found. Apple 5.2.5 (trademark) and later parts of the policy were not fully read. Google Play's full policy set (including permissions and "dangerous products") was not read.
9. **Terms pages for BimmerCode, OBDeleven (main terms), bootmod3, MHD, Carista** could not be read in full (403, 404 or content not shown). Their wording is known only from FAQs, warranty pages and snippets.
10. **German and UK treatment of software-only coding** (as opposed to chip tuning or DPF removal): not found.
11. **Whether SERMI or a maker's authentication scheme could ever accommodate an open-source tool maker**: no source. The documented route is for businesses.
12. **Insurance effects** of modifying software (a crash after a coding change): not researched.
13. **Share-alike data (OBDb CC-BY-SA) and app-store terms**: not researched. Owner decision 1 already calls for a short legal check.
14. **UK Regulation 61 and the UK's own diagnostic access rules** were not re-read.
15. Several sources are search summaries, not full-page reads. Items tagged low or medium-low should be re-read before anyone relies on them.
16. **Fact-check pass (2026-11-20) left unverified:** DOJ exact announcement date and whether pending cases were dropped; CRA personal-data trigger and steward timing; Ford v Autel federal/state trademark split; Mercedes piracy plea details (DOJ page body empty); Weistec link to BMW/Mercedes; Apple 2.3 and 5.x text beyond the first 100k characters.
