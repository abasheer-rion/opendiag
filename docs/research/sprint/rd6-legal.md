# RD-6: Legal primary sources (Q10)

Date: 2026-11-24 (sprint day 2). Status: reading only. **Not legal advice**; this is a research note for the counsel call, written by a non-lawyer.
Scope: OBDb licence and README, EU Regulation 2018/858 repair-information articles, US federal and Massachusetts right to repair, EPA aftermarket tuner enforcement, and name risk for "OpenDiag".
Builds on: `docs/research/deep/legal-regulatory-landscape-deep.md` (which could not read EUR-Lex, congress.gov or Massachusetts text) and `docs/plan/decisions.md` item 1.
Overall status: **PARTIAL**. The main EU regulation text itself did not load (EUR-Lex returns an empty page to scripts); I read the adopted text through the UK government's copy and read the 2026 EU amending act directly. Trademark registers were searched only in the US, and only for the exact word. See the source ledger.

---

## ANSWER FIRST

1. **OBDb is safe to use in the planned way, with duties.** 892 of its 898 public repos are CC-BY-SA-4.0. We must credit it, link the licence, say what we changed, and share any changed signal definitions under the same licence. OBDb's own README says the rest of an app's code is not affected.
2. **The plan (separate pack, downloaded by the user, never bundled, never mixed into CC-BY packs) matches the README.** Whether a bundled SA pack would make the app a "combined work" is still an open legal question. Keep the separation. Counsel should confirm.
3. **EU law gives tool makers a right to repair information, at a reasonable fee, but not a right to republish it.** The new 2026 amendment (in force around 23 June 2026) adds access to coding and reprogramming information from **23 December 2026** and lets carmakers require logins, but not for reading fault codes or the VIN.
4. **US: no federal right-to-repair law exists.** A narrowed bill (H.R. 7389) passed committee 48 to 1 on 21 May 2026 and awaits the House floor; I could not confirm a floor vote. Massachusetts has a real law (model year 2002 on; standard-port access from model year 2018; open telematics from 2022). Its court fight is on appeal.
5. **EPA: reading and diagnosing are far from the target. Tune and delete tools are the target.** Civil cases against tuner sellers continue (COBB paid $2.914 million in 2024). DOJ said in January 2026 (by social media post, with an internal memo) it would stop bringing criminal tampering charges; the law did not change.
6. **The name "OpenDiag" has a real problem.** An active open-source OBD2 adapter called **OpenDIAG** (GitHub `maximus64`, a Tindie store named OpenDIAG, $60) uses the exact name in the same field since at least August 2025. A second "OpenDiag" (VW/Audi diagnostic suite) appeared on 13 Nov 2026. No live US trademark was found. Recommend counsel review or a rename before any public release.
7. Ten questions for counsel are at the end.

---

## CLAIMS TABLE

Confidence is my confidence that the claim is true as stated. "Single" = only one source read for it. Dates are as shown on the source.

### A. OBDb licence and README

| # | Claim | Source | Conf. | Single? |
|---|---|---|---|---|
| A1 | The OBDb GitHub organisation lists 898 public repositories. | https://github.com/OBDb ; GitHub API org endpoint (898) | high | no |
| A2 | 892 of 898 repos carry CC-BY-SA-4.0 in GitHub's licence field. One (`vscode-obdb`) is Apache-2.0. Five show no licence field (`.devcontainer`, `.meta`, and three `*.obdb.community` tool repos). | GitHub API search and org repo listing, 2026-11-24 | high | no |
| A3 | The org README says contributors and editors hold copyright in the text, and that "most" of it is under CC BY-SA 4.0 (it also mentions "several" liberal licences). | https://raw.githubusercontent.com/OBDb/.github/main/profile/README.md | high | yes (one README) |
| A4 | The README asks anyone building on the data to credit OBDb and its contributors, link the database, and name and link the CC BY-SA 4.0 licence; it supplies plain-text and HTML credit wording. | same README | high | yes |
| A5 | The README says: if you change signal definitions, say so; changed definitions you share must also be shared under CC BY-SA 4.0; and the rest of your app's code is not affected. | same README | high | yes |
| A6 | Vehicle repos hold JSON signal sets under `signalsets/v3/` (`default.json` plus year-range overrides). Each file has `ecu` and `commands` lists. Commands carry request header, response header, a service request such as `22` plus data, model-year filters and a `signals` list. Signals carry id, path, name, bit position and length, scaling, unit and optional value maps. | https://github.com/OBDb/Toyota-Tacoma/blob/main/signalsets/v3/default.json (first 100k chars) ; BMW-3-Series repo page | medium (structure inferred from the Toyota file; BMW file not opened) | yes |
| A7 | 49 repos have "BMW" in the name (3-Series, 5-Series, X5, i3, M3, E90-family and more); 9 have "MINI". All BMW repos found are CC-BY-SA-4.0. BMW-3-Series has 721 commits and was updated 2026-11-24. | GitHub API search `org:OBDb BMW in:name`; BMW-3-Series repo page | high | no |
| A8 | The BMW-3-Series README says nothing about where the data came from. The org-level repo shows no CONTRIBUTING file or contributor agreement. | https://github.com/OBDb/BMW-3-Series ; https://github.com/OBDb/.github | medium (page captures were partial) | yes |
| A9 | OBDb names Pelican as an official partner that hosts a visual browser for the data. | https://github.com/OBDb (README text) | medium | yes |
| A10 | CC BY-SA 4.0 (legal code, Section 3a): when you share the material, keep the credit, indicate changes, and state the licence with a link. | https://creativecommons.org/licenses/by-sa/4.0/legalcode.en | high | no (also FAQ) |
| A11 | Section 3b: ShareAlike applies only when you share **Adapted Material**. The adapter's licence must be BY-SA (same or later version) or a BY-SA-compatible licence; you must give its text or a link; and you may not add terms or technical locks (DRM) that restrict the rights it grants. | same legal code | high | no |
| A12 | Section 4: where database rights apply (such as the EU's sui generis right), a database containing all or a substantial part of the licensed contents is itself Adapted Material (the database, not its separate contents). | same legal code | high | no |
| A13 | Section 6: breach ends your rights automatically; they come back if you fix the breach within 30 days of finding it. | same legal code | high | no |
| A14 | CC FAQ: facts are not protected by copyright, so the licence adds no duties for pure facts; database rights, where they exist (EU is named), are the exception. | https://creativecommons.org/faq/ | high | no |
| A15 | CC FAQ: a collection of CC works may carry its own licence, but each included work keeps its own terms. | same FAQ | high | no |
| A16 | CC FAQ: CC "recommend[s] against" using CC licences for software; it suggests OSI/FSF licences instead. CC0 is the exception it accepts. | same FAQ | high | no |
| A17 | CC's compatibility page (re-read) lists two licences for BY-SA 4.0 adaptations: Free Art License 1.3 and GPLv3 (GPLv3 is one-way: adaptations may go under GPLv3, not the reverse). The page shows "None yet" under licences evaluated and found incompatible. **Apache-2.0 is not on the list**, and the page does not show it was evaluated. (BY-SA 4.0 itself and later versions are compatible per the legal code, A11, not this page.) | https://creativecommons.org/share-your-work/licensing-considerations/compatible-licenses/ | high | no |

### B. EU Regulation 2018/858, repair and maintenance information

| # | Claim | Source | Conf. | Single? |
|---|---|---|---|---|
| B1 | Article 61: manufacturers must give independent operators open, standardised, non-discriminatory access to OBD information, diagnostic and other equipment, software downloads, and repair and maintenance information, in machine-readable form and kept up to date at the same time as for authorised repairers. | https://legislation.gov.uk/eur/2018/858/chapter/XIV/adopted (EU text as adopted; UK-hosted) | high for substance; medium for exact wording (UK copy, not EUR-Lex) | no (also search snippets) |
| B2 | Article 61 also requires a standardised, secure, remote facility so independent repairers can complete work involving the vehicle security system, plus training material and non-discriminatory access for parts makers and diagnostic-tool makers. | same | high | no |
| B3 | Article 61: manufacturers' central repair records are free to independent repairers, who may also add entries. | same | high | no |
| B4 | Article 63: fees must be reasonable and proportionate, must not deter access, and must reflect actual use. Manufacturers must offer hourly, daily, monthly and yearly access and may also charge per transaction; the repairer chooses if both exist. Free for authorities. | same | high | no |
| B5 | Article 64: the manufacturer must give the approval authority proof of compliance within six months of type-approval. | same | high | yes |
| B6 | Article 65: authorities may check at any time; on a complaint from an independent operator or trade association they must audit and report back within three months; remedies include withdrawing or suspending type-approval and fines. | same | high | yes |
| B7 | Article 66: a Forum on Access to Vehicle Information advises on, among other things, a process for accredited bodies to approve independent operators for security-related information. | same | medium | yes |
| B8 | "Independent operator" (Article 3, point 45) means any person or company other than an authorised dealer or repairer directly or indirectly involved in repair and servicing, expressly including makers of repair equipment, tools and parts, technical information publishers, automobile clubs, roadside assistance, inspection and training providers. | https://legislation.gov.uk/eur/2018/858/article/3/adopted | medium (UK-hosted copy of the adopted text) | yes |
| B9 | Delegated Regulation (EU) 2026/699 (adopted 23 March 2026) amends Annex X. Article 2: enters into force on the twentieth day after publication; published 3 June 2026, so 23 June 2026 by my arithmetic (the page does not state that date). | https://eur-lex.europa.eu/eli/reg_del/2026/699/oj/eng | medium-high (re-read; date derived) | yes |
| B10 | 2026/699: Annex X applies whatever the powertrain; manufacturers must allow **bi-directional** access to the in-vehicle data stream through the standard port and other means (Ethernet, APIs, WLAN) and remote facilities. | same | medium | yes |
| B11 | 2026/699 (Annex X point 6.4a, re-read 2026-11-24): information for **variant coding, part pairing and control unit reprogramming** must be available to independent tool makers from **23 December 2026** for vehicles first type-approved after 1 September 2020. Later dates: 23 June 2027 (vehicles approved after 1 Sep 2020 but before 6 July 2022) and 23 June 2028 (operations that involve software updates). Point 6.4b gives separate API-information dates (23 September 2026, 23 December 2026, 23 June 2027) and hardware-testing information by 23 December 2027. An earlier draft of this row said "VIN-specific packages and an API from 23 June 2027"; that was not supported and is removed. | same (re-read; last 2.4k chars of page unread) | medium-high | yes |
| B12 | 2026/699 (Appendix 4, point 3.1, re-read): carmakers may require authentication of the tool maker and tool, **except for reading fault codes and reading the VIN** (the same exemption also covers certain generic scan-tool reads and clears). The other details in the first draft (30-day credentials, 24-hour option, suspension for misuse, read-only monitoring device exemption, traceability) were **not re-checked** and stay unverified. | same | high for the fault-code/VIN exemption; low for the rest | yes |
| B13 | 2026/699: access must be no more restricted than what carmakers give their own partners; fees may apply under Article 63; tool makers may use non-proprietary hardware for reprogramming. | same | medium | yes |
| B14 | CJEU Case C-319/22 (Scania), 9 Nov 2023: carmakers must make the VIN available to independent operators; a bare VIN is not personal data in itself; the access duty in Article 61 is a legal obligation for GDPR purposes. | https://morganlewis.com/pubs/2023/12/european-court-of-justice-facilitates-access-to-vehicle-data-for-independent-vehicle-repairers ; search summary of the judgment | high on date and VIN point | no |
| B15 | A Council document from the same period says the Court held manufacturers may not add conditions beyond those in the Regulation (the example was cybersecurity-based conditions). I could not read the document (binary PDF). | search result summary of https://data.consilium.europa.eu/doc/document/ST-7952-2026-INIT/en/pdf | low | yes |
| B16 | SERMI (the scheme for security-related information such as keys, ignition, locks, ECU) certifies independent operators, remote service suppliers **and their employees**; rollout is country by country. No hobbyist or open-source exemption is mentioned on the pages read; no page said individuals are outside the scheme either. | https://www.digidentity.eu/products/sermi/sermi-io ; search summary of other certifier pages | medium | no |
| B17 | The right is to obtain information (usually for a fee under each carmaker's portal terms). Nothing read says it lets anyone republish the information. | my reading of B1 and B4; no source states the negative | medium (inference) | yes |

### C. US federal and Massachusetts right to repair

| # | Claim | Source | Conf. | Single? |
|---|---|---|---|---|
| C1 | H.R. 1566 (REPAIR Act) was forwarded by the House Energy and Commerce subcommittee on Commerce, Manufacturing and Trade by voice vote on 10 Feb 2026. Its stated aim is equal access to vehicle-generated data, repair information and tools for owners and independent shops. | https://www.autocare.org/news/latest-news/details/2026/02/10/repair-act-(h.r.-1566)-advances-to-full-congressional-committee-hearing (supporter's press release) | high on date; the bill text was not read | no (several snippets agree) |
| C2 | On 21 May 2026 the full committee voted 48 to 1 for H.R. 7389, the Motor Vehicle Modernization Act of 2026, carrying a **narrowed** repair title instead of the REPAIR Act. | https://www.repairerdrivennews.com/2026/05/26/u-s-house-committee-approves-amended-repair-act-that-backs-2014-mou/ ; https://www.faegredrinker.com/en/insights/publications/2026/7/unlocking-the-right-to-repair-the-expanding-compliance-landscape | high | no |
| C3 | The narrowed text writes the 2014 carmaker and independent-repairer agreement into federal law, with FTC enforcement and civil penalties (enforcement and penalties not re-checked; the "sections 1 to 5" and "under 14,000 lb" details from the first draft were not supported by the RDN article, which states no weight limit, so treat them as unverified). Required wireless telematics data access was removed; broader aftermarket protections and diagnostic tool access were largely moved to an FTC study. | RDN (above); https://www.sema.org/news-media/enews/2026/22/us-house-committee-advances-legislation-enact-right-repair-provisions | high | no |
| C4 | A Section 221 in the bill (the ADAS Functionality and Integrity Act) directs NHTSA to develop guidelines on allowable vehicle modification ranges for driver-assist systems; RDN confirms the section and the topic, "study" wording is unconfirmed. | RDN (above); NADA, SEMA coverage | medium | no |
| C5 | As of the latest dated item I found (NADA memo, 11 Sep 2026) the bill had not passed the House; it is expected to ride on a surface-transportation package (BUILD America 250 Act, H.R. 8870). I found no report of a floor vote and could not check Congress.gov. | search summary; https://www.cbtnews.com and NADA pages (not opened) | low-medium | yes |
| C6 | Faegre Drinker (July 2026): Congress has not enacted a federal repair statute. | Faegre URL above | high | no |
| C7 | A 29 June 2026 presidential memorandum ("Freedom to Fix") told EPA to issue clarifying guidance and consider deprioritising civil tampering enforcement against people who in good faith fix their own vehicle to its original configuration. | https://www.whitehouse.gov/presidential-actions/2026/06/lowering-the-cost-of-living-by-promoting-the-freedom-to-fix/ (title seen; text via law-firm summary) | medium | no |
| C8 | EPA's page says manufacturers of light-duty vehicles and trucks must provide emissions-related service information, training material, OBD data and enhanced diagnostics, pass-through reprogramming information and tools; guidance for aftermarket shops issued 1 July 2026. | https://www.epa.gov/ve-certification/freedom-fix | high | no |
| C9 | The 1 July guidance is said to be numbered IACD-2026-08 and to stop at the emissions envelope (not the full service library). | search summary only | low | yes |
| C10 | Massachusetts G.L. c.93K s.2: manufacturers must sell owners and independent shops the same diagnostic and repair information given to dealers (daily, monthly, yearly terms, fair and reasonable) and the same tools; model year 2002 and later (heavy duty 2013). | https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXV/Chapter93K/Section2 | high | no (matches deep note) |
| C11 | From model year 2018: owners and independent shops must be able to reach on-board diagnostics from a standard PC through a non-proprietary interface (the text names SAE J2534, J1939, ISO 22900, or a standard port such as Ethernet or USB), and manufacturers generally may not require their own authorisation for it. | same statute page | high | yes |
| C12 | Security items (immobiliser and security modules) may be withheld and then released through NASTF's secure data release model or another accepted system. | same | high | yes |
| C13 | From model year 2022: vehicles with telematics need a standardised open-access platform; owners reach mechanical data through a mobile app; with owner consent shops can read it and, when needed for repair, **send commands** to components. | same | high | yes |
| C14 | Litigation: Judge Denise Casper dismissed the carmakers' remaining claims on 11 Feb 2025; the Alliance appealed to the First Circuit in March 2025; Faegre Drinker said in July 2026 the appeal was still pending. | https://www.wbur.org/news/2025/02/12/massachusetts-right-to-repair-carr-law-challenges-dismissed ; Faegre URL | high on dismissal; medium on appeal status | no |
| C15 | The "NHTSA told carmakers to ignore the law, June 2023" claim from the deep note was not confirmed by any source I read this round. | WBUR (mentions only a June 2023 federal message, no detail) | low | yes |
| C16 | Maine has an older vehicle repair law (model year 2002 and later, security items exempt, private damages up to the greater of $10,000 or treble) and enacted L.D. 2211 on 13 April 2026. | Faegre URL | medium | yes |

### D. EPA and aftermarket tuners

| # | Claim | Source | Conf. | Single? |
|---|---|---|---|---|
| D1 | Clean Air Act prohibitions: removing or disabling emissions devices (s.203(a)(3)(A)); making, selling or installing a part whose principal effect is to bypass one when you know or should know (s.203(a)(3)(B)); knowingly falsifying or tampering with a required monitoring device such as OBD (s.113(c)(2)(C), criminal). | https://cleanairnortheast.epa.gov/tampering.html (EPA regional page, updated 15 Sep 2025) | high | no (matches deep note) |
| D2 | EPA says changing engine software or calibrations ("tuning") can be tampering, and that its settlements with tuning companies required them to hand over software and files and stop supporting defeat devices. | same | high | no |
| D3 | EPA's enforcement policy says products that change the ECU, commonly called tuners, might be illegal defeat devices; enforcement focuses on makers and sellers, fleets and shops that routinely delete controls. | https://www.epa.gov/sites/default/files/2020-12/documents/epatamperingpolicy-enforcementpolicyonvehicleandenginetampering.pdf (via search summary; PDF not opened) | medium | yes |
| D4 | Liable parties include sellers, manufacturers, installers (shops, dealers) and owners; there is no exemption for off-road or race use; EPA has long used discretion for vehicles permanently converted for competition and never driven on public roads. | cleanairnortheast page | high | no |
| D5 | COBB Tuning (announced 16 Sep 2024, proposed settlement lodged in W.D. Texas, subject to a 30-day comment period and court approval; final approval not checked): alleged sale of 81,000+ tuners since 2015 that disable controls or change performance; penalty $2,914,000 paid in four instalments over three years, based on inability to pay a larger sum; may keep selling products covered by a CARB Executive Order. (The 8,400 exhaust pipes and the stop-sale, software-update, warranty and marketing terms were in the first draft and were not re-checked this pass.) | https://www.epa.gov/enforcement/cobb-tuning-products-llc-clean-air-act-settlement | high | no |
| D6 | Other tuner cases: Derive Systems (2018, about 363,000 products), Punch It Performance (2020). | search summary of EPA pages | medium | yes |
| D7 | EPA reports 172 civil enforcement cases finalised FY2020 to FY2023 with $55.5 million in penalties, and 17 criminal cases completed. | cleanairnortheast page | medium | yes |
| D8 | DOJ said on 21 Jan 2026 it would stop bringing criminal charges for tampering with OBD and emissions monitoring systems; civil penalties and the statute are unchanged and the policy can be reversed. | https://nationalaglawcenter.org/doj-epa-clarify-stance-on-diesel-vehicles-under-the-caa/ ; https://www.yahoo.com/news/politics/articles/diesel-delete-crackdown-collapsed-2026-223116123.html (Backfire News, 17 Jul 2026) | medium-high | no (two secondary) |
| D9 | The DOJ shift followed a defendant's argument that OBD is not a "monitoring device" under the statute; the Ninth Circuit has not ruled. | National Ag Law Center page | medium | yes |
| D10 | Pardons: one in Nov 2025 and several on 3 July 2026, at least three tied to Clean Air Act convictions. | Backfire News via Yahoo | low-medium | yes |
| D11 | EPA's July 2026 guidance and the presidential memo "add little" to the existing framework in one law firm's view; repairs are lawful if the certified configuration is restored; the 2020 policy's carve-out for OBD-related conduct is not revoked; EPA accepted SEMA's testing programme as meeting the 2020 policy. | https://www.arnoldporter.com/en/perspectives/blogs/environmental-edge/2026/07/new-presidential-memorandum-and-epa-guidance-on-vehicle-tampering | medium (law firm blog) | yes |
| D12 | California needs CARB approval for add-on or modified parts sold, advertised or installed in California; CARB says it averages about 90 days; this stays enforceable. | Arnold & Porter page | medium | yes |
| D13 | EPA proposed a rule on 9 July 2026 to swap engine derates for warnings on new model year 2027 highway engines (diesel emission-sensor faults); not final. | Backfire News via Yahoo | low-medium | yes |

### E. Name "OpenDiag"

| # | Claim | Source | Conf. | Single? |
|---|---|---|---|---|
| E1 | USPTO search (official site, wordmark field, exact term "opendiag") returns **one** record: serial 74168748, OPENDIAG, owner CompuAdd Corporation, class 9 "computer program for testing and analyzing computer hardware", filed 21 May 1991, **abandoned 11 Sep 1992** (no statement of use filed). Dead. | https://tmsearch.uspto.gov (driven through the browser tool, 2026-11-24) ; https://www.trademarkia.com/search/trademarks?query=opendiag (same record) | high | no |
| E2 | My wildcard and two-word searches on the USPTO site did not return a results page (the page stayed on the search screen), so similar marks ("OPEN DIAG", "OPENDIAGNOSTICS", design marks) are **not checked**. | same session | high that they were not checked | n/a |
| E3 | GitHub: the repo name matches many projects. Closest in subject: `maximus64/opendiag-firmware` (created 2025-08-14, pushed 2026-11-18, GPL-3.0, 9 stars), `opendiag-hardware` (CERN-OHL-S-2.0, created 2026-08-23), `opendiag-cli` (Rust, GPL-3.0). | GitHub API 2026-11-24 | high | no |
| E4 | The firmware docs describe "OpenDIAG": an ESP32-S3 OBD-II interface that works as an ELM327-style adapter, a J2534 pass-thru and a raw CAN interface (CAN, K-Line, J1850, SLCAN). No trademark claim is stated. | https://maximus64.github.io/opendiag-firmware/ | high | yes |
| E5 | A Tindie store named **OpenDIAG** (Los Gatos, California) lists "OpenDiag - Open Source OBD2 Interface" at $60 (re-read 2026-11-24). The listing calls it a developer-focused interface for low-level network work, protocol reverse-engineering and firmware testing, with ESP32-S3, two CAN transceivers, K-Line and J1850; it pairs with custom diagnostic software. Shipping rates and trademark claims not rechecked. | https://www.tindie.com/products/opendiag/opendiag-open-source-obd2-interface/ | high | yes |
| E6 | `JoeeDeveloper/OpenDiag` (Rust, GPL-3.0): "open source, cross-platform diagnostic suite for VAG group vehicles... a VCDS alternative"; created 2026-11-13, pushed 2026-11-24. Same product category as ours, different brand family. | GitHub API | high | yes |
| E7 | Other repos using the name: `rcanjos-spec/OpenDiag` (Python framework, no clear licence), `KooshaYeganeh/opendiag` (GPL-3.0, created 2023, last push Jan 2025; language not rechecked), `MadsBjordal/OpenDiag` (Rust, GPL-3.0), `DieselDemi/OpenDiag` (Ford tool, C, 2022, no licence), `UtzPretzelz/opendiag`, `Animal279/Opendiag`. All tiny. | GitHub API | high | no |
| E8 | A GitHub organisation called `OpenDiag` exists since 2018-11-03 with one repo (`opendiagnet`, a static web template, MIT, copyright line names a third party, last pushed 2018-11-04). Effectively dormant. | https://api.github.com/users/opendiag ; https://github.com/OpenDiag/opendiagnet | high | no |
| E9 | The owner's repo `abasheer-rion/opendiag` shows in the same search (Apache-2.0, pushed 2026-11-22). | GitHub API | high | no |
| E10 | Earlier use of the same word: a 2007 Make: magazine item describes "OpenDiag", an open-hardware RS-232 to OBD-II interface for VW-group cars by an individual named Jeff. | https://makezine.com/?p=48084 | medium | yes |
| E11 | Package registries: npm `opendiag`, `open-diag`, `@opendiag/core`, `opendiag-cli` return 404 and npm search for "opendiag" returns 0 hits; PyPI `opendiag` and `open-diag` return 404; crates.io `opendiag` returns 404. So the names are free today. | registry endpoints, 2026-11-24 | high | no |
| E12 | Domains: `opendiag.com` has name servers of a domain broker (for sale; registered since 2011-10-14, expiry 2027-10-14 per WHOIS). `opendiag.org` resolves to an unrelated template page. `opendiag.net` is a "coming soon" page with the tagline "DIAGNOSE. UNDERSTAND. EVOLVE." `opendiag.app` has name servers but no web response. `.io`, `.dev`, `.eu` returned no name servers (not proof they are unregistered). | dig, whois, page fetches | medium | no |
| E13 | I found no company or trademark called "OpenDiag" in a general web search (apart from the hardware project and the repos above). | web search 2026-11-24 | medium | no |

---

## DETAIL BY TOPIC

### 1. OBDb share-alike obligations, in plain words

What you are allowed to do: copy, change, mix and redistribute OBDb signal definitions, including commercially, under CC BY-SA 4.0.

What you must do (A10 to A13):
- **Credit.** Name OBDb and its contributors, give the link, name the licence with a link. OBDb gives ready wording; the plain text is a single sentence ending in the CC BY-SA 4.0 link. Put it on an About or licences screen, which is where OBDb itself suggests (A4).
- **Say what you changed.** If you converted, trimmed or corrected definitions, say so (A5, A10).
- **Share changes alike.** If you share changed (adapted) data, the licence on your version must be CC BY-SA 4.0 or later, or a licence CC lists as compatible. You may not add terms or locks that take away what the licence gives (A11).
- **Keep the licence text or link with it.**
- **Breach has a repair window.** Rights end automatically on breach and come back if fixed within 30 days of finding out (A13).

What stays free of the share-alike rule (per the licensor's own words, A5): the rest of an app's code. That is OBDb's reading. It is a licensor's statement of intent, not a court ruling, and CC's own FAQ says it does not address programs directly (A15). The README statement still helps: it is the copyright holders telling users how they will read their own licence.

How this lines up with the plan (`decisions.md` item 1, `architecture-v2.md` section 9):
- Code stays Apache-2.0. Apache-2.0 is not on CC's compatibility list (A17), so **do not copy OBDb data into Apache-licensed source files**. Keep it in a data file with its own licence header, which is what the separate `opendiag-packs-obdb` repo does.
- CC says it advises against CC licences for software (A16). Our code must not carry CC terms, and the OBDb data must not be pasted into code.
- CC BY content can flow up into a CC BY-SA work but not back down (the plan already says Z3 never flows into Z2). That follows from A11.
- If we convert OBDb JSON into our `.odpack` format, the converted file is almost certainly Adapted Material, so it must be CC BY-SA 4.0 (the plan already says this).
- If a user downloads the SA pack and our app reads it, our app is "using" the data, not changing it. Whether the app plus a bundled pack is one combined work is the open question; downloading on user action keeps them apart, but that is a design choice, not a legal conclusion (also noted in `architecture-v2.md`).
- Contributors hold their own copyright and no contributor agreement was seen (A3, A8). So OBDb itself cannot relicense, and neither can we. Fixes we want to give back must go under CC BY-SA 4.0.

Things the licence does not settle:
- **EU database rights** (A12, A14). In the EU, taking a substantial part of a database can be restricted even when the facts are not copyrightable. CC BY-SA 4.0 licenses those rights too, so OBDb data is usable, but our own pack inherits the share-alike. The US has no such right, so a US-only reading is simpler than an EU one.
- **Provenance.** I found no statement of how OBDb contributors obtained signal definitions (A8). A signal list can be reverse-engineered from the owner's own car or copied from a leaked OEM database. We cannot tell which from the repo. Our own refusal rule R2 (nothing from leaked or cracked OEM material, `data-strategy.md`) means each imported record needs a sampling check or a "contributors attest" line, and counsel should say how much diligence is enough.
- **OBDb is not a company.** There is no known legal entity to warn us if a licence problem is found. Pelican is named as a partner (A9) but no further terms were read.
- **Version drift.** Every vehicle repo is separately licensed in GitHub's metadata, so the licence-ledger row (`SOURCES.md`) must record the licence per repo and the commit hash, not just "OBDb".

### 2. EU Regulation 2018/858, repair information (Articles 61 to 66)

What carmakers owe (B1 to B6):
- Access for independent operators to OBD information, repair and maintenance information, equipment and software downloads, in machine-readable form, non-discriminatory, with updates at the same time as authorised repairers (Art 61).
- A secure remote facility for security-system work (Art 61).
- Fees that are reasonable and proportionate, and time-based or per-transaction models (Art 63).
- Proof of compliance to the approving authority within six months of approval (Art 64).
- A complaint route and possible type-approval consequences (Art 65).
- A Forum on Access to Vehicle Information (Art 66).

Who counts (B8): "independent operator" explicitly includes makers of repair equipment and tools and technical information publishers. An open-source diagnostic tool maker is plausibly inside the definition. Whether an unincorporated hobby project is, I could not find stated anywhere. The right belongs to the operator who asks for the information; it does not pass downstream to our users automatically.

What changed in 2026 (B9 to B13), from the amending act read on EUR-Lex:
- Bi-directional access to the in-vehicle data stream through the standard port, Ethernet, APIs and remote facilities.
- Reprogramming and variant coding information from **23 December 2026** for vehicles approved after 1 September 2020. This is the first EU date that directly touches BMW-style coding. It is four weeks from today. BMW's own portal terms and fees are unread and unknown.
- Carmakers may authenticate tool makers and operators and log activity, but not to read fault codes or the VIN (B12). That is good for a read-only tool: reading DTCs and the VIN is explicitly outside what can be gated.
- Credentials of at least 30 days for tools (24 hours possible for changes to the vehicle).

What it does not do:
- Does not give a right to copy or republish OEM information (B17). Terms of each OEM portal still apply.
- Does not touch non-EU markets. UK retained law has its own copy with different decision-makers (the UK text names a Secretary of State) and a different later history, so UK users need a separate check.
- Does not make OEM data open. Our data rules (`data-strategy.md` rules R2 and the tainted-reader rule) are unchanged.

SERMI (B16): the scheme for key, immobiliser and similar information certifies businesses and their employees. The pages read do not address individuals or open-source tools. Our refusal list already excludes security data, so we should not need it. Counsel should confirm that shipping a tool which never touches security-related information keeps us out of scope.

Scania (B14): the VIN must be provided. That affects how a VIN is treated in our logs (a VIN can be personal data when linked to an owner). This links to privacy rules already in the plan.

### 3. US federal and Massachusetts

Federal (C1 to C9):
- No federal statute yet (C6).
- The narrowed bill codifies an existing voluntary agreement and adds FTC enforcement (C3). That agreement covers repair information and tools available to independent shops; it predates wireless data.
- The telematics access that the original REPAIR Act promised was dropped (C3). SEMA stays neutral; Auto Care and others want more. A floor vote has not been confirmed (C5).
- The executive branch and EPA acted in June and July 2026 (C7 to C9): emissions-related service information, OBD data and pass-through reprogramming information must be available from manufacturers of light-duty vehicles and trucks. This is guidance, not a rule, and stops at emissions-related systems.

Massachusetts (C10 to C14): this is the most concrete US law for diagnostics.
- Standard-port access without a carmaker's authorisation for model year 2018 and later (C11). This directly supports ENET and J2534-style tools on a Massachusetts-sold vehicle.
- Open telematics platform from model year 2022 with command sending for repair (C13). I found no report that carmakers actually comply; the appeal is pending (C14), and I read no compliance reports.
- The security-information carve-out (C12) matches our refusal list.
- Practical effect for OpenDiag: it strengthens the case that owner-led diagnostics through standard ports is lawful and expected, but only in one state and only for information and tools, not for tuning.

What right to repair does not do (consistent with the deep note, claim 7): it does not authorise changing emissions behaviour, it does not make OEM data redistributable, and it does not shield a tool maker from the Clean Air Act.

### 4. EPA and aftermarket tuners

What the agency says it targets (D1 to D4): sellers and makers of tune and delete products, shops that routinely delete, and fleets that tamper. Owners can be liable in theory, but enforcement is aimed at the commercial side.

What happened to tuners (D5, D6): COBB's September 2024 deal is the closest precedent for a BMW-adjacent tuning product: a seven-figure penalty, removal of delete features from software it controls, stop-sale rules, and a route to keep selling products that hold a CARB Executive Order. For the owner's own bootmod3 use, this is background, not a risk created by OpenDiag.

What changed in 2026 (D8 to D13): the federal criminal push was dropped for OBD tampering in January 2026 as a matter of discretion; civil penalties and the statute are unchanged; guidance in July restates that repairs are lawful if the certified configuration is restored. One law firm reads the changes as adding little to the framework, and says the OBD-related conduct carve-out in the 2020 policy still stands (D11).

What this means for OpenDiag, as design hypotheses for counsel (not conclusions):
- Reading codes, live data and freeze frames: nothing in the sources read treats these as defeat devices.
- **Clearing fault codes and resetting readiness monitors** deserve a counsel opinion. Clearing after a repair is normal workshop practice, but a feature that hides a fault from an inspection could look like interference with a monitoring device (s.113(c)(2)(C), D1).
- Any write feature (the Lab build, bench modules only per decision 2) should never touch calibration or emissions-related parameters. The refusal-list design already says this; counsel should read it.
- "Off-road use only" language is no defence (D4); do not use it.
- Penalty figures disagree between sources (see Disagreements).

### 5. Name risk for "OpenDiag" (searches done, not a clearance)

What I found:
1. **No live US federal trademark** for the exact word. The only record is a dead 1991 application by CompuAdd (E1). A dead application confers no rights today.
2. **Unregistered (common-law) use by another party in the same field.** The `OpenDIAG` OBD-II adapter project, with a Tindie store of that name and a firmware repo going back to 2025-08-14, sells a developer-focused OBD2/CAN interface that sits next to our field (the firmware docs, E4, also describe ELM327-style and J2534 modes; that part was not re-read this pass) (E3 to E5). In US law, a trademark can arise from use without registration, so a first user of the name for similar goods can have rights even with no register entry. I cannot judge how strong those rights are; that is a counsel question.
3. **A second, newer collision at the software level.** A VAG diagnostic suite called `OpenDiag` appeared 13 Nov 2026 (E6). It is a hobby repo with 1 star, but it targets the same user need.
4. **Crowded and descriptive name.** At least eight GitHub repos use "opendiag" in various casings (E3, E6, E7). "Open" plus "diag" reads as a plain description of an open diagnostic tool, which usually makes a name weak for registration purposes and weak for stopping others. That cuts both ways: it is hard for us to own, and hard for others to own against us, except for the user who has the clearest first use in our exact market.
5. **Names we can still take:** npm, PyPI, crates.io (E11). The GitHub organisation `OpenDiag` is held by a dormant 2018 account (E8); the owner's repo sits under a personal account (E9).
6. Domains: `.com` is for sale through a broker, `.org` and `.net` are held by others, `.app` is registered (E12). The dev-box rule already puts public services under a subdomain of the owner's own domain, so a vanity domain is not a blocker.

What I did not check:
- US state registers; EUIPO and national EU registers; UK IPO; WIPO Global Brand Database (the TMview page returned nothing without JavaScript; the others were not attempted).
- Similar spellings and phonetic matches ("Open Diag", "OpenDiagnostics", "OpenDiagX").
- Class 9 and 42 goods and services beyond the exact word; app-store name checks (Apple, Google Play).
- Whether maximus64 has an unregistered claim, a pending filing, or plans to expand.

Two ways forward for the owner to choose between (the choice is not made here): (a) ask counsel for a full clearance search on "OpenDiag" and a read of the `OpenDIAG` adapter risk before any public release; (b) pick a distinctive replacement name now, while the project is pre-release and the cost of renaming is a few commits, and run the same checks. Whichever is chosen, the BMW disclaimer language from the deep note (BimmerCode's model) still applies to the manufacturer's marks.

---

## DISAGREEMENTS BETWEEN SOURCES

1. **OBDb licence mix.** The README says OBDb text is under "several" liberal licences, mostly CC BY-SA 4.0. GitHub metadata shows 892 of 898 repos CC-BY-SA-4.0, one Apache-2.0 (a VS Code extension) and five with no licence flag. Resolution: treat vehicle repos as CC BY-SA 4.0; treat the five unlabelled tool repos as unlicensed (do not use them) until checked.
2. **EPA penalty per violation.** The earlier deep note quoted "up to $4,527 per event" from an EPA page; the EPA regional page read today says "over $5,000" per device or per vehicle (updated Sept 2025); a National Agricultural Law Center summary quotes the statute's base caps of $25,000 (manufacturers and dealers) and $2,500 (others). They are consistent only if the figures are for different years or categories (statutory base versus inflation-adjusted). Not resolved. I did not read the statute or the Federal Register adjustment table this round.
3. **REPAIR Act status.** Congress.gov status as reported in search snippets stops at the 10 Feb 2026 subcommittee vote. Other sources report the full committee did not take up the bill but moved a narrowed text through H.R. 7389 on 21 May 2026. These are two different bills, so the sources are consistent: H.R. 1566 itself stays pending; H.R. 7389 carries a reduced version. One report puts "markup" a day or two off (25 May by inference); three sources say 21 May.
4. **Whether the July 2026 EPA guidance reduces enforcement.** The presidential memo says EPA should consider deprioritising civil tampering cases against good-faith self-repair. A law-firm analysis says the 1 July EPA guidance does not expressly do that and does not replace the 2020 policy. Both are accurate descriptions of different documents.
5. **DOJ criminal shift scope.** The Backfire News article describes it as dropping all pending Clean Air Act defeat-device criminal cases; the National Agricultural Law Center page describes it as stopping criminal charges for tampering with OBD and emissions monitoring systems. The two overlap but are not identical. No primary DOJ document was read.
6. **Massachusetts and NHTSA.** The deep note, citing Wikipedia, said NHTSA told carmakers to ignore the law in June 2023. WBUR (2025) mentions a June 2023 federal message and an August 2023 compromise without details. I could not read the underlying letter.
7. **EU text source.** The UK copy of Article 61 currently in force names a Secretary of State and is for UK law; the "adopted" view carries the EU wording. Where a fetch summarised the UK "current" text, I did not use it for EU claims.
8. **2026/699 date.** The fetch said the act enters into force 20 days after publication and gave "3 June 2026" as the publication date, giving about 23 June 2026. The act's own timeline of later dates (23 Dec 2026, 23 June 2027 and 2028) is consistent with this, but I did not read the Official Journal page header myself.

---

## SOURCE LEDGER

### Read successfully

| Source | What it gave | Notes |
|---|---|---|
| https://github.com/OBDb ; https://github.com/OBDb/.github ; raw `profile/README.md` | Org description, 898 repos, README credit and share-alike text | Fetched through a summarising tool |
| https://github.com/OBDb/SAEJ1979 ; https://github.com/OBDb/BMW-3-Series ; https://github.com/OBDb/Toyota-Tacoma/blob/main/signalsets/v3/default.json | Repo licence, structure, file format | Toyota file read to about 100k chars; BMW file not opened |
| GitHub REST API (orgs, repos, search) | Licence counts, BMW repo list, name collisions, repo dates | Unauthenticated; search rate-limited |
| https://creativecommons.org/licenses/by-sa/4.0/legalcode.en | Sections 1, 3, 4, 5, 6 | Summarised by tool, not read verbatim |
| https://creativecommons.org/faq/ (both halves) | Adaptation vs collection, facts, software advice | The "program using SA data" question is not answered there |
| https://creativecommons.org/share-your-work/licensing-considerations/compatible-licenses/ | Compatibility list | Apache-2.0 absent |
| https://legislation.gov.uk/eur/2018/858/chapter/XIV/adopted | Articles 61 to 66 (EU text as adopted) | UK-hosted copy |
| https://legislation.gov.uk/eur/2018/858/article/3/adopted | Definition of independent operator | UK-hosted copy |
| https://legislation.gov.uk/eur/2018/858/article/61 (current UK view) | Used only to compare | UK law, not EU |
| https://eur-lex.europa.eu/eli/reg_del/2026/699/oj/eng | Delegated Reg 2026/699 on Annex X | Loaded on EUR-Lex; last 2.4k chars not read |
| https://morganlewis.com/pubs/2023/12/... | Scania C-319/22 | Law firm summary |
| https://www.digidentity.eu/products/sermi/sermi-io | SERMI audience and security RMI | Commercial certifier page |
| https://www.autocare.org/news/latest-news/details/2026/02/10/... | REPAIR Act subcommittee vote | Supporter's press release |
| https://www.repairerdrivennews.com/2026/05/26/... ; https://www.sema.org/news-media/enews/2026/22/... | H.R. 7389 content and vote | Trade press |
| https://www.faegredrinker.com/en/insights/publications/2026/7/... | Federal status, Massachusetts appeal, Maine | Law-firm article |
| https://www.yahoo.com/news/politics/articles/repair-just-won-congress-dont-175000173.html | Narrowed bill, June and July 2026 actions | Opinionated piece (The Auto Wire, 25 Aug 2026) |
| https://www.epa.gov/ve-certification/freedom-fix | EPA manufacturer duties and 1 July 2026 guidance | Thin page; no tuner content |
| https://www.arnoldporter.com/en/perspectives/blogs/environmental-edge/2026/07/... | EPA and CARB analysis | Law-firm blog |
| https://cleanairnortheast.epa.gov/tampering.html | EPA statement of prohibitions, liability, tuners, penalties | Regional EPA page, 15 Sep 2025 |
| https://www.epa.gov/enforcement/cobb-tuning-products-llc-clean-air-act-settlement | COBB settlement | Primary EPA page |
| https://nationalaglawcenter.org/doj-epa-clarify-stance-on-diesel-vehicles-under-the-caa/ | DOJ Jan 2026 policy | Secondary |
| https://www.yahoo.com/news/politics/articles/diesel-delete-crackdown-collapsed-2026-223116123.html | 2026 enforcement summary | Secondary, critical framing |
| https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXV/Chapter93K/Section2 | Massachusetts statute | Primary |
| https://www.wbur.org/news/2025/02/12/massachusetts-right-to-repair-carr-law-challenges-dismissed | District court dismissal | News |
| https://tmsearch.uspto.gov (browser tool) | Exact-term search result page | Primary register; exact term only |
| https://www.trademarkia.com/search/trademarks?query=opendiag | Same record | Secondary mirror of USPTO |
| Tindie, maximus64 docs site, opendiag.org, opendiag.net, makezine item, npm, PyPI, crates.io, dig, whois | Name checks | Direct |
| Web search results | Used for leads and for Scania, SERMI and REPAIR status snippets; marked single-source where it stood alone | Search summaries, not primary |

### Failed or incomplete

| Source | Result |
|---|---|
| https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0858 and the `eli/reg/2018/858/oj` forms | Empty content to the fetch tool; plain HTTP returned status 202 with no body three times (the site blocks scripts). Used the UK copy instead. **EU text of Articles 61 to 66 is not read from EUR-Lex itself.** |
| https://eur-lex.europa.eu/eli/reg_del/2021/1244/oj (SERMI act) | Empty. SERMI act wording not read. |
| https://data.consilium.europa.eu/doc/document/ST-7952-2026-INIT/en/pdf | Binary PDF, no text extracted. |
| https://www.congress.gov/bill/119th-congress/house-bill/1566 and https://www.govtrack.us/congress/bills/119/hr1566 | HTTP 403. Bill text and official status not read. |
| https://www.bailii.org/eu/cases/EUECJ/2023/C31922.html | HTTP 403. Judgment text not read. |
| https://trademarks.justia.com/search?q=opendiag | HTTP 403. |
| TMview (tmdn.org) | JavaScript page, empty. EU and national registers not searched. |
| EUIPO, UK IPO, WIPO Global Brand Database | Not attempted. |
| https://www.epa.gov/enforcement/national-enforcement-and-compliance-initiative-stopping-aftermarket-defeat-devices-vehicles-and | HTTP 404. EPA's own NECI page not read (the regional page and settlements were read instead). |
| EPA 2020 Tampering Policy PDF; 1 July 2026 guidance letter | Not opened. Content known only from search and law-firm summaries. |
| USPTO wildcard and two-word searches | No results page produced. |
| BMW-3-Series `default.json` signal file | Not opened. |

---

## OPEN QUESTIONS

1. What is the exact text of Article 61 and Annex X on EUR-Lex today, including how the 2026 amendment numbers its points? (Need a browser session that gets past the EUR-Lex check, or the owner saves the page as text.)
2. What does BMW actually offer independent tool makers in the EU under these rules (portal, price, terms), and from what date for coding information? Not found this round.
3. Does an unincorporated open-source project qualify as an "independent operator" and can it ask a carmaker for access?
4. Did the House pass H.R. 7389 or the transport package it rides on? Check Congress.gov on 24 to 26 Nov.
5. What is the exact penalty figure now for tampering and defeat devices (Federal Register inflation table)?
6. Is there any primary DOJ document for the January 2026 policy, and has the Ninth Circuit ruled?
7. Who is behind the `OpenDIAG` adapter (name, entity, filings), and how much use does it have? Is a filing pending anywhere?
8. Do the EU and UK registers hold "OPENDIAG" or similar marks?
9. Where did OBDb BMW definitions come from, and does OBDb screen contributions for leaked OEM material?
10. Does the First Circuit appeal on the Massachusetts law have a hearing or decision date?
11. Does the CARB Executive Order route matter to a tool that never ships a tune? (Probably not; ask counsel.)

---

## TEN QUESTIONS FOR COUNSEL

1. **Share-alike reach.** We plan an Apache-2.0 app plus a separate CC BY-SA 4.0 data pack from OBDb, downloaded by the user and loaded at run time. Does the app, or any bundle we ship, become Adapted Material or a combined work? Does the answer change if the pack is bundled in the installer, or if a converter inside the app produces the pack?
2. **Conversion.** Is converting OBDb JSON to our own pack format (field renaming, splitting, adding our own fields) an adaptation that must be shared under CC BY-SA 4.0? Where is the line between our own-words entries (CC-BY or CC0) and OBDb-derived ones, and what evidence should we keep to show a record is independent?
3. **Provenance diligence.** OBDb states no sourcing policy and uses no contributor agreement we could see. How much checking of BMW signal definitions do we owe so that nothing derived from leaked or licensed-only OEM data enters our pack? Does the licence's no-warranty term protect us, or does our own clean-room policy create a stricter duty?
4. **EU database right.** If we publish an OBDb-derived pack in the EU, do database rights add duties beyond the copyright terms? Does anything in the licence let OBDb or a contributor withdraw rights later?
5. **Right to repair information.** Under Regulation 2018/858 (as amended by 2026/699), can an unincorporated open-source project or an individual maintainer act as an "independent operator" to get BMW coding information after 23 December 2026? What do the portal terms usually prohibit (redistribution, tool building, publication of derived parameter names), and may we publish facts we learn from a lawfully obtained subscription in our own words?
6. **Tool authentication.** If carmakers may require tool makers to authenticate (but not for reading fault codes and VIN), does an open-source tool with no secret keys and no write path stay outside that regime? Does the Lab (bench writes) build change the answer?
7. **Clean Air Act.** Does a diagnostic tool that reads and clears fault codes and resets readiness monitors risk liability under the "monitoring device" or defeat-device provisions? Which wording in our docs, UI and refusal list would you want so that clearing is framed as repair-only? Does the January 2026 DOJ position change advice for a US-based maintainer?
8. **Contributions and personal exposure.** Are we better placed with a contributor licence agreement or a developer certificate of origin for code, and a separate ruling for data? Does the project need a legal entity or fiscal host to limit the owner's personal liability for volunteer contributions and for users who misuse the tool?
9. **Name.** In light of the existing `OpenDIAG` OBD2 adapter (Tindie store and GitHub, active since 2025), the new `OpenDiag` VAG repo, and the single dead 1991 US filing, can we use "OpenDiag" for a diagnostic and coding app? Please run a full clearance (US federal and state, EUIPO, UK, WIPO, app stores), advise on likelihood of confusion between an adapter and an app that is used with adapters, and say whether a rename now is cheaper than a later dispute.
10. **Trademarks of carmakers and distribution.** What disclaimer, wording and screenshot rules do you want for "works with BMW" and similar statements, and for app-store listings? And what limits (terms, liability, region messaging for the US, Germany and the UK) should the licence and user terms contain, given that coding and, later, bench writes carry real risk of harm to a car?

*Reminder (stated once): this note is research for a counsel call and is not legal advice.*
