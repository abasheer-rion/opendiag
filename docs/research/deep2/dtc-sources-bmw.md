# BMW and MINI fault-code (DTC) meaning: legitimate public sources, verified

Research run: 2026-11-20. Status: **PARTIAL** (section 9 lists every fetch that failed). Not legal advice. Extends `dtc-bmw-coverage.md` (its A-numbers are not reused; this note uses BS-nn), `docs/plan/dtc-coverage-strategy.md` and `docs/plan/data-strategy.md`. It does not repeat the format and coverage-estimate work in `dtc-bmw-coverage.md`; read that for code shapes, induced-fault reach and effort numbers.

Rules followed: no fault text is reproduced here, only facts about each source (owner, licence, size, format, access). Nothing was downloaded into the repo. Pages were read with a fetch tool; four small PDFs the tool cached were read locally for shape only. Confidence tags: **high** = read on the primary page this run; **medium** = secondary page or search summary; **low** = inference or a single weak signal. "Not found" means my search or fetch did not surface it, not that it does not exist.

---

## 1. Executive summary

- **No clean, openly licensed list of BMW or MINI manufacturer-specific fault-code meanings exists.** After checking government sites, BMW sites, eight forum networks, GitHub (API searches), Hugging Face, Zenodo, arXiv and the open wikis, every list I found is either unlicensed, copied from BMW's own tool, share-alike or copyleft with unclear origin, or behind a paywall (high). Nothing here changes the plan: manufacturer-specific text is built by us.
- **Biggest new finding: a bulk, government-hosted index of manufacturer bulletins exists.** NHTSA publishes a "Manufacturer Communications" flat file (formerly the TSB file): tab-separated, 14 fields, a 4,000-character summary per record, covering communications NHTSA received since 1 January 1995, split into 5-year chunks, listed as updated 2026-09-03 (BS-02, high). That closes most of Gap 2 in `dtc-bmw-coverage.md` (the data page was blocked then). It carries the summary text, not the full bulletin PDF. Whether BMW summaries contain fault-code hex is **untested** because downloading needs the owner's yes.
- **The bulletin PDFs themselves stay the best per-code source.** They are BMW-authored (copyright "BMW of North America", high, seen on 2025 and 2026 bulletins), hosted by a US agency with no licence field (rights shown only as "public", high). Treat as facts-only, rewrite in our words, cite the bulletin id (BS-01).
- **A federal rule gives a legal reason BMW must publish emissions-related manufacturer codes.** 40 CFR 86.1808-01 paragraph (f)(5)(v) requires manufacturer-specific emissions-related fault codes and related bulletins to be posted on a manufacturer website, at a fair and reasonable price under (f)(7) (BS-06, high, Cornell page). This is an access right for shops, not a licence to republish. BMW's portal is a paid subscription (BS-07). So it informs the "tainted reader" policy, not ingestion.
- **Open GitHub projects with BMW fault text all trace back to BMW's own files.** The three that carry text are BMW-derived (bmw-unified-db, licence field "Other"/unasserted; klartext builds its text database from the user's own ISTA install; hoffman1938/bimmercode has no licence and no stated source). The one properly licensed project with its own-words BMW entries is Klemme15 (GPL-3.0, 203 codes for the E90 family, 396 dash-message explanations): usable to **cross-check**, never to ingest into a CC-BY pack (BS-29). Its README says the meanings are written from public sources; it does not list them per entry in what I read.
- **OBDb is signals only for BMW and MINI.** Directory listings of the BMW and MINI repositories contain no path with "dtc"; the licence files read for MINI and BMW-5-Series say CC BY-SA 4.0; the BMW repository's own licence file was not read (BS-28, high for the two read). The share-alike decision therefore adds live-data signals, not fault meanings (matches the earlier note).
- **Forums are leads, and their stance toward machine reading has hardened.** Of eight forum hosts read: two publish "AI training: no" signals citing EU Directive 2019/790 Article 4 (bimmerforums, spoolstreet); two more block named AI crawlers (bmw-syndikat, northamericanmotoring); two redirect bots to a third-party gateway (bimmerfest, e46fanatics); the Bimmerpost network and xoutpost state nothing on AI (high). Spoolstreet returned HTTP 403 to my fetch. Terms of service were not readable on any forum (PARTIAL). Policy for us: a person opens a thread, notes which codes circulate, and writes our own sentence; no crawling, no pasted text.
- **Two MINI/BMW bulletin facts matter to OpenDiag directly** (BS-01): (1) on MINI F54/F55/F56/F57/F60, aftermarket scan tools could not read stability-control (DSC) faults through the OBD socket until the body-domain controller was reprogrammed (SIM 34 01 20, rev 2, 2020-09-08); (2) a 2026 emissions recall (26E-A01, BMW and MINI) says some stored fault codes and the warning lamp were not cleared automatically because of an implementation error in OBD diagnostics. Both affect what a generic adapter can see and what the app should say.
- **What to do first (ordered by value per hour):** (1) ask the owner to approve one bounded download of the NHTSA flat file and the data dictionary, filter locally for BMW and MINI, and count; (2) build the bulletin-facts reader for the PDF set; (3) keep forums as a frequency signal only; (4) never load bmw-unified-db, klartext databases, archive.org training PDFs, Scribd or SlideShare sheets into any drafting session.
- **Honest ceiling:** public sources cover codes that cause customer complaints. They will not give the full BMW catalogue, and no source states a total (high, absence).

---

## 2. Source table (verdicts)

Verdict key: **ingest** = fact-level extraction, rewrite in own words, record evidence id; **cross-check** = read to find mistakes or frequency, never copy; **manual-read-only** = a person reads, nothing automated, nothing stored; **excluded** = never used, reason given. "Auto" = what the site says about automated reading.

| ID | Source | Owner | Licence or terms (verified?) | Covers | Size | Format | Auto-read rules | Quality | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| BS-01 | NHTSA-hosted BMW and MINI service bulletins (`static.nhtsa.gov/odi/tsbs/<year>/MC-<id>-<seq>.pdf`) | Authored by BMW; hosted by NHTSA | No licence on file; BMW copyright footer (high); dataset rights "public" (high) | BMW and MINI, E-series to 2026 G/U-series; codes in hex with module names for some bulletins | Unknown total; I opened 11 files this run and earlier note opened 6 | PDF, many Flate-compressed | `static.nhtsa.gov/robots.txt` returned 404; `www.nhtsa.gov/robots.txt` returned 403 to my fetch (PARTIAL) | High for what it says, narrow (known defects only) | **ingest** (facts only) |
| BS-02 | NHTSA Manufacturer Communications flat file (`FLAT_TSBS.zip`, dictionary `TSBS.txt`) | NHTSA ODI | Rights "public", no licence field (high) | All makes, since 1995, summary per communication | Not stated; 5-year chunks | TSV (flat) and CSV (keyword subset) in a ZIP | Same NHTSA web policy page returned 403; data.transportation.gov API returned 403 (PARTIAL) | Index quality; omits many bulletins and recall bulletins (stated by NHTSA) | **ingest** (index), after owner approves download |
| BS-03 | NHTSA recalls API (`api.nhtsa.gov/recalls/recallsByVehicle`) | NHTSA | Not stated on the response | Recall campaigns by make, model, year | 6 records for BMW X1 2023 | JSON | API, open endpoint worked; no terms read | Good for campaign text; no fault codes in the sample | **cross-check** |
| BS-04 | NHTSA complaints flat file (`FLAT_CMPL.zip`) | NHTSA | Rights "public", no licence named (high) | Owner complaints, all makes | Not stated | ZIP flat file | Same as BS-02 | Owner prose; may mention codes; unverified | **manual-read-only** (frequency hints), not downloaded |
| BS-05 | Transport Canada Vehicle Recalls Database | Transport Canada | Open Government Licence - Canada (`ca-ogl-lgo`), read from the open.canada.ca catalogue API on 2026-11-21 (high) | Recalls, all makes | Monthly CSV | CSV, XML, API | Not read | Recalls only, no DTC | **cross-check**, low value |
| BS-06 | 40 CFR 86.1808-01 (f)(5)(v), (f)(7), (f)(13) | US federal rule | Public law | Rule text; no code list | n/a | HTML | n/a | Authoritative on duty, not on codes | **cross-check** (legal basis only) |
| BS-07 | BMW TIS: `bmwtechinfo.bmwgroup.com` (also MINI and Rolls-Royce sites) | BMW Group | Paid subscription: 1-day, 30-day, annual (medium, search summary); price not found | Bulletins, repair info, fault documentation | Large | Web app, bulletins as PDF | Login; fetch returned only a loading shell | High, authoritative | **excluded** (paywalled; tainted-reader rule) |
| BS-08 | BMW Aftersales Online (`aos.bmwgroup.com`) and CarData open data platform | BMW Group | Fees by price list in euros (medium, search summary); CarData is consent-based and paid per use (high, page read) | Independent-operator access; telematics | n/a | Portal, API | Registration | n/a for fault text | **excluded** |
| BS-09 | BMW and MINI owner manuals (in-car Integrated Owner's Manual, online copies) | BMW AG | Copyright; no reuse licence found | Check Control messages and lamps, not hex codes | Per model | In-car, web, PDF | Official pages timed out or 404 (PARTIAL) | High for driver-visible symptoms | **manual-read-only** |
| BS-10 | Vehicle Service Pros (Mitchell 1 bulletin column) | Mitchell 1 / trade publisher | Copyright footer, no reuse terms (earlier note, high) | BMW bulletin digests with codes | Dozens of articles | HTML | Not read this run | Medium, secondary to BS-01 | **cross-check** |
| BS-11 | carcomplaints.com per-model bulletin lists | Third party | No licence (earlier note) | Bulletin ids per model and year | Per model | HTML | Not read this run | Index convenience | **cross-check** |
| BS-12 | Bimmerpost network (bimmerpost.com, e90post.com, f30.bimmerpost.com, g-series subdomains) | Bimmerpost | Terms of service not read (403) | Per-chassis forums; user posts | Unknown | HTML (vBulletin-style paths) | robots: one group, ~45 paths disallowed (login, search, profiles, posting); no AI statements (high, bimmerpost.com and e90post.com; f30 same list) | Mixed; many wrong or stale | **manual-read-only** |
| BS-13 | Bimmerforums | Bimmerforums | Terms not read | General BMW forum | Unknown | HTML | robots: crawl allowed, `ai-train=no`, 32 named bots blocked (re-counted 2026-11-21), cites Directive 2019/790 Art. 4 (high) | Mixed | **manual-read-only** |
| BS-14 | Spoolstreet (N54 and N55 code-list threads) | Spoolstreet | Terms not read (403) | N54, N55 engines | Thread-level | HTML | robots: `ai-train=no`, `use=reference` and an Art. 4 reservation seen in the earlier read; bot count and wording not re-verified on 2026-11-21 (medium); thread page returned 403 to my fetch | Often copies of tool tables; origin unstated | **manual-read-only** |
| BS-15 | Bimmerfest | Bimmerfest | Terms not read (redirected) | General BMW forum | Unknown | HTML | Fetch redirected to a third-party bot gateway on a `tollbit.` host (high that it redirects); that host's robots blocks 24 named search/SEO bots and allows all others (high) | Mixed | **manual-read-only** |
| BS-16 | E46Fanatics | E46Fanatics | Terms not read | E46 | Unknown | HTML | Same redirect pattern as Bimmerfest (high that it redirects; robots on that host not read) | Mixed | **manual-read-only** |
| BS-17 | Xoutpost thread "BMW Fault Codes and Their Meaning" (post of 2006-01-09) | Xoutpost member "drex" | No notice; "Contributed by" only | E-series, Z3, M models, MINI R50/R53 | "Over a thousand" visible entries; page truncated | HTML, one post | robots: Googlebot barred from one article page only | Source unstated; likely a copy of a tool table (inference, low) | **manual-read-only**; do not ingest |
| BS-18 | North American Motoring (MINI forum) | NAM | Terms not read | MINI | Unknown | HTML | robots: GPTBot and GoogleOther blocked; others allowed except search, login, tags, some attachments | Mixed | **manual-read-only** |
| BS-19 | bmw-syndikat.de and motor-talk.de (German) | Site owners | Terms not read | German-language BMW forums | Unknown | HTML | bmw-syndikat blocks ClaudeBot, GPTBot and others; motor-talk blocks GPTBot and ChatGPT-User only (high) | Mixed | **manual-read-only** |
| BS-20 | Reddit (r/BMW and related) | Reddit | Could not fetch; 2019 archived user agreement via search summary says automated access outside published interfaces is restricted (low, stale) | Owner posts | Large | HTML, API | Fetch tool refused the host (PARTIAL) | Mixed | **manual-read-only** |
| BS-21 | YouTube explainers and teardown videos | Creators; platform terms | Terms bar access "using any automated means" and downloading (high, page read) | Walkthroughs | Large | Video | Terms forbid scraping except search engines following robots | Mixed | **manual-read-only** |
| BS-22 | OpenMS41 Google Site (Siemens MS41, MS42, MS43; M52TU, M54) | Unnamed | No licence or copyright text (high) | E34, E36, E38, E46 petrol engines | About 209 numbered entries (1 to 255, gaps) | HTML | Google Sites; no robots read | Terse; origin unstated | **cross-check** |
| BS-23 | bmwtuning.co "N54 common fault codes" | BMW Tuning (parts seller) | No licence; no copyright text in capture (high) | N54 | 41 entries, 3 without description | HTML | Not read | Source unstated | **cross-check** |
| BS-24 | Blackcircles guide to BMW fault codes | Blackcircles.com | "© 2026 Blackcircles.com" (high) | Overview; a few codes | Under 10 codes named | HTML | Not read | Consumer-level | **cross-check**, low |
| BS-25 | Haynes per-model OBD fault-code pages (e.g. BMW X4 2014 to 2018, page 2) | Haynes Publishing | No terms in capture; part of a paid catalogue (medium) | Five-character P and U codes; heading says 115 manufacturer-specific codes | 115 on that page (heading); many descriptions replaced by "related products" | HTML | Not read | Commercial; partly gated | **cross-check** |
| BS-26 | AutoNation Mobile Service BMW codes page | AutoNation | Terms not in capture | 7 entries, about 13 codes | Small | HTML | Not read | Generic with a few Valvetronic codes | **cross-check**, low |
| BS-27 | Minimania "Mini Cooper Fault Error Codes" | Minimania | Not read | Gen2 MINI | Unknown | HTML | Not read (HTTP 522 twice) | Unknown | **PARTIAL**, not assessed |
| BS-28 | OBDb: BMW, MINI, BMW-5-Series repositories | OBDb community | CC BY-SA 4.0 (licence file text read for MINI and BMW-5-Series, high) | Live-data signals | MINI tree 12 files, BMW tree 8 files; no path with "dtc" | JSON signalsets | GitHub; open | Good for signals | **excluded for DTC use**; signals only |
| BS-29 | Klemme15 (Expos-AI) | Kindric Castro | GPL-3.0-or-later (high) | E90-family BMW codes in own words, 396 dash messages, 2,066 generic | 203 BMW entries in one JSON | JSON in repo | GitHub | Sourced per entry (sources not listed in docs read) | **cross-check** (copyleft, cannot enter CC-BY) |
| BS-30 | klartext (HadiCherkaoui) | Individual | AGPL-3.0 (high) | F-series diagnostics | n/a | Rust code | GitHub | Text comes from user's ISTA database, not shipped | **excluded** for data |
| BS-31 | bmw-unified-db (gediz) | Individual | Code MIT; data licence "Other/NOASSERTION"; data says it is BMW's copyright (high) | 2,466 decoded ECUs, fault dictionaries (mostly German) | About 653 MB uncompressed, 130 MB compressed | SQLite in release asset | GitHub | Derived from BMW EDIABAS and SGBD data | **excluded** |
| BS-32 | hoffman1938/bimmercode | Individual | No licence, no stated source (high) | E, F, G series, EN/RU/KA | Not stated | Web app plus data | GitHub | Unknown origin | **excluded** |
| BS-33 | EdiabasLib / ediabaslib (uholeschak) | Individual | GPL-3.0 (high) | Interpreter library; no BMW description files | n/a | C# | GitHub | Code only | **excluded** for data; code is reference |
| BS-34 | Hugging Face: CodesList/obd2-codes | Third party | CC BY 4.0, attribution line given (high) | Generic SAE only | 9,414 codes | CSV | API worked | Generic duplicate of OBDex scope | **cross-check** (generic) |
| BS-35 | Hugging Face: RRK1987/automotive-dtc-finetune | Individual | MIT tag, no source stated, no BMW mention (high) | Instruction pairs, OBD-II and UDS | Under 1,000 rows | Parquet | API worked | Unknown origin | **excluded** |
| BS-36 | Zenodo search for BMW diagnostic trouble codes | Zenodo | per record | No relevant BMW fault-code record in the first 10 hits (low; search relevance poor) | n/a | n/a | API worked | n/a | PARTIAL, nothing found |
| BS-37 | arXiv 2602.01109 (BiCarFormer, ICLR 2026 workshop) | Math and Lienhart | Paper CC BY-NC-ND 4.0 (high) | Error-pattern classification, 22,137 error codes, 360 patterns | Dataset size from abstract; the abstract page does not say whether data is released | PDF | arXiv open | Manufacturer not named | **cross-check** (method only) |
| BS-38 | archive.org "BMW Technical Training Documents" | Third-party uploader (2019-08-08) | No licence or rights field shown (high) | Training documents ST034 to ST1601, includes OBD and ISTA topics | Not shown | PDFs | archive.org open | BMW-authored, upload legitimacy unknown | **excluded** until counsel says otherwise |
| BS-39 | Scribd and SlideShare BMW code sheets | Uploaders | All rights reserved style (medium) | DME, DDE, E-series sheets | Varies | Hosted docs | Login walls | Copies of OEM tables, likely | **excluded** |
| BS-40 | workshop-manuals.com BMW pages | Unknown | None seen | Pages that look like BMW TIS service information (medium, search snippets) | Large | HTML | Not read | Copy of OEM content | **excluded** |
| BS-41 | Snap-on "BMW Vehicle Communication Software Manual" (2013) | Snap-on | "All rights reserved" (high) | Which systems the scan tool tests; no code list found (high) | 131 pages | PDF | Open file | Product manual | **manual-read-only**, low value |
| BS-42 | Paid or licensed data: MOTOR, VW-group style commercial feeds, OEM-licence resellers, scan-tool app databases (OBDeleven, BimmerLink, Carly) | Vendors | Commercial | Includes BMW | Large | Apps, feeds | Terms bar extraction | High but licensed | **excluded** |

Totals in this table (recounted 2026-11-21): 42 sources assessed: 2 ingest (BS-01, BS-02), 13 cross-check, 13 manual-read-only, 12 excluded, 2 partial (BS-27, BS-36).

---

## 3. Sources (detail)

### 3.1 Government and regulator sources

**BS-01. NHTSA-hosted BMW and MINI bulletins (high for existence, medium for coverage)**
- URL pattern: `https://static.nhtsa.gov/odi/tsbs/<year>/MC-<8-digit id>-<4-digit seq>.pdf`. Seen: 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2025, 2026 (high).
- Owner: BMW of North America authored; hosted by NHTSA. Footer on 2025 and 2026 PDFs reads "Copyright ©2025 BMW of North America, Inc." (high). No reuse licence.
- Brands: BMW and MINI. MINI bulletins carry a "SIM" prefix (for example SIM 34 01 20, SIM 12 01 26); BMW ones "SIB" (SIB 28 01 23). The older TIS print header "SI M12 08 17" is MINI too (high). The two last digits of the number match the year in all five I read (28 01 23 is 2023, 34 01 20 is 2020, 12 01 26 is 2026, 12 08 17 is 2017, 71 01 19 is 2019). Inference: number is group, sequence, year (medium).
- Revisions: each bulletin states "Revision n replaces ... dated ..." and a "What's New" list. So a citation must carry the revision date (high).
- Contents seen this run (structure only):
  - Applicability table with chassis codes and production date ranges, for example F54, F55, F56, F57, F60 and the 2026 F65, F66, F67, U25 (high).
  - Situation, Cause, Correction, Procedure, Parts and Claims sections (high).
  - Some name the stored fault memory entries and the test plan to run; one lists a Check Control message by number (790) and its trigger conditions (high).
  - They mention the dealer tools AIR, AWP (Aftersales Workplace) and ISTA by version (high).
- Notable facts for OpenDiag:
  - SIM 34 01 20 Rev 2 (2020-09-08), MINI F54, F55, F56, F57, F60: stability-control (DSC) faults could not be read by aftermarket tools over the OBD socket because the body-domain controller did not process the requests; fix is reprogramming with ISTA 4.25.1x or higher (high). Consequence: on these MINIs built before the fix, a generic adapter shows no DSC faults. Record as an applicability rule.
  - Emissions recall 26E-A01 (SIM 12 01 26, Revision 4 dated 2026-04-02 for MINI F65, F66, F67, U25; matching BMW bulletin dated 2026-03-11): an implementation error in OBD diagnostics can leave stored fault codes and the warning lamp uncleared after the cause is gone (high). Tell users a lingering code on affected cars may be this.
  - SIB 28 01 23 Rev 1 (2025-03-21), U10 and U11: Check Control message 790 can appear right after start if the selector is moved during drive-ready; it attaches an owner's manual excerpt (high). Shows that Check Control numbers, not hex codes, are the public handle for some faults.
- Count: not measurable without the index (BS-02). Earlier note: one 2016 bulletin carries 37 distinct four-digit codes; another 2017 to 2018 set carries six-digit DSC and EPS codes.
- Access: robots for `static.nhtsa.gov` returned 404, meaning no stated rules (high); `www.nhtsa.gov/robots.txt` and the web policy page returned 403 (PARTIAL). My fetch tool could read some PDFs as text and others only as binary; local `pdftotext` handled all of them (high).
- How to cite: "BMW of North America, SI B07 03 14, Nov 2016 revision, NHTSA document MC-10146779-9999, static.nhtsa.gov/odi/tsbs/2016/MC-10146779-9999.pdf, read 2026-11-20". Always include revision date and NHTSA document id.
- Quality: authoritative on cause and remedy, but only for defects that reached customers. Lists spurious codes that clear on their own, which is valuable "ignore" knowledge (earlier note).
- Verdict: **ingest** facts (code, module, applicability, cause class, remedy class, bulletin id). Own sentence. Similarity check against local copy.

**BS-02. NHTSA Manufacturer Communications flat file (high)**
- URL: `http://www-odi.nhtsa.dot.gov/downloads/folders/TSBS/FLAT_TSBS.zip`; data dictionary `https://static.nhtsa.gov/odi/ffdd/tsbs/TSBS.txt` (high, read); catalogue entries on data.gov for the TSB and "Recalls, Manufacturer Communications" datasets (high, read); portal pages `data.transportation.gov/d/hczg-qbhf` and `/d/fmyn-qyh5`.
- Owner: NHTSA ODI; contact listed as the NHTSA datahub (high).
- Licence: "Rights: public", access level public, no licence field; Socrata metadata shows no licence or attribution field (high). So: US government data of unstated licence; BMW's authorship of the underlying bulletins still stands.
- Fields (14, tab-separated): NHTSA ID, replacement bulletin number (deprecated), date added, TSB or document id, manufacturer communication date, internal campaign id or software version, communication type, make, model, model year, NHTSA components, manufacturer component system, manufacturer component subsystem, summary (up to 4,000 characters) (high).
- Behaviour: one record per document per value of any multi-valued field, so five products and three components give 15 rows. Model year 9999 means unknown. CSV variant has fewer columns and is for keyword search of the concise summary. Files are split into 5-year chunks by date NHTSA received them (high).
- Change history: renamed from `TSBS.txt` to `MfrComms.txt` on 2024-05-13 with new fields; summary length raised, extra space filled from 2024-06-26; component length changed on 2026-09-15 (the page contradicts itself, 512 vs 516) (high).
- Coverage: communications since 1995; NHTSA states it does not hold every bulletin a manufacturer issues, and recall bulletins are generally excluded (high).
- Size: not stated. Dataset last updated 2026-09-03; catalogue last checked 2026-10-15 (high).
- Access rules: no terms found; the NHTSA policy page was 403 to me. Downloading is a user-permission step.
- Use: build a local index of BMW and MINI documents by year, chassis, component and summary; then fetch only the PDFs that mention fault memory, DSC, EPS, DME, DDE. This sets denominator "B" from `dtc-bmw-coverage.md` section 8.1 without reading everything.
- Limitation to test: the summary field may or may not include code hex. Unknown until a sample is read.
- How to cite: "NHTSA ODI Manufacturer Communications file (FLAT_TSBS), record NHTSA ID <n>, retrieved <date>".
- Verdict: **ingest** (index and summary facts), pending approval.

**BS-03. NHTSA recalls API (high)**
- Endpoint worked without a key: `https://api.nhtsa.gov/recalls/recallsByVehicle?make=BMW&model=X1&modelYear=2023` returned 6 records with fields Manufacturer, NHTSACampaignNumber, parkIt, parkOutSide, overTheAirUpdate, ReportReceivedDate, Component, Summary, Consequence, Remedy, Notes, ModelYear, Make, Model (high). No fault-code terms in that sample (high, one sample only).
- Licence and terms: not stated on the response; NHTSA's API documentation page returned 403 to me (PARTIAL).
- Verdict: **cross-check**. Useful to explain why a driver gets a warning lamp; not a code source.

**BS-04. NHTSA complaints flat file (medium)**
- `http://www-odi.nhtsa.dot.gov/downloads/folders/Complaints/FLAT_CMPL.zip`, dataset page `data.transportation.gov/d/amr3-cz7s`; rights "public", no licence named; updated 2026-09-02 (high). The catalogue page does not describe contents or personal-data handling.
- Why listed: owner narratives sometimes quote a code and what fixed it. Prose is the owner's; nothing licensed. Quality unverified. Not downloaded.
- Verdict: **manual-read-only** for frequency leads after the owner approves a download; never ingest narratives.

**BS-05. Transport Canada Vehicle Recalls Database (low)**
- Open Government Portal listing found; monthly CSV and an API are listed; licence "Open Government Licence - Canada" re-read on the catalogue page 2026-11-21 (high); formats CSV, TXT, XML, JSON, DOCX. Recalls only. Not a fault-code source; listed so nobody searches for it again.

**BS-06. 40 CFR 86.1808-01 (high)**
- Page read: Cornell LII. Paragraph (f)(5)(v) requires manufacturer-specific emissions-related DTCs and related bulletins, troubleshooting guides and repair procedures on manufacturer websites; (f)(3) and (f)(5) cover repair information more broadly; (f)(7) says fair and reasonable price; (f)(13) requires "generic and enhanced" information for tool makers for 1996 and later model years, including data stream information (high).
- A second regulation page (40 CFR 86.010-18) confirmed a standardised data link connector from model year 2013, with detail in a part I could not read (medium).
- Reading: it creates a duty to publish emissions-related manufacturer codes, at a price, with no licence to redistribute. Whether BMW's tool-company information path (the "enhanced" data) is open to an open-source project is **not established**. Ask counsel (add to question list).
- Verdict: **cross-check** (legal basis).

### 3.2 BMW Group sources

**BS-07. BMW TIS (medium)**
- `bmwtechinfo.bmwgroup.com` is the site named in BMW's own system-requirements PDF; MINI at `minitechinfo.bmwgroup.com` per the Techinfo user guide (medium, search summaries). My fetch showed only a loading shell titled "TisUI" (high, nothing more readable).
- Terms seen second-hand: 1-day, 30-day and annual subscriptions; one subscription grants access to the BMW, MINI and Rolls-Royce sites; payment by card or PayPal (I-CAR guide, medium). Price not found. A 2024 forum comment says one-day passes are expensive and articles download as individual PDFs (low).
- Verdict: **excluded** (paywalled). Anyone who reads it is a tainted reader for BMW drafting under `dtc-coverage-strategy.md` section 2.3.

**BS-08. Aftersales Online (AOS) and CarData (medium to high)**
- AOS terms of use: page body unreadable to me. Search summary says fees follow a price list on the portal and are paid in euros (medium).
- CarData for service providers: `bmw-cardata.bmwgroup.com/thirdparty/public/home` (high, from BMW's page). Registration free for companies in the European Economic Area; the provider pays for data used; data only shared with the customer's consent. It is telematics, not fault-text. The page does not describe repair and maintenance information for independent operators (high).
- Verdict: **excluded**. Useful context only.

**BS-09. Owner manuals (medium)**
- Facts: the Integrated Owner's Manual is in the car's iDrive menu; BMW bulletins can attach owner's manual excerpts (high, 2025 bulletin); third-party copies sit on manualslib and similar (medium, search results) which we should not use because the host is not the owner.
- Official BMW or MINI manual pages: bmwusa.com timed out twice; bmw.com timed out; miniusa.com returned 404 (PARTIAL). Not read.
- Content when read: Check Control messages, lamp meanings, "what to do". Not hex codes (earlier note).
- Verdict: **manual-read-only**. A person reads, then writes the "what the driver sees" line in our words.

### 3.3 Trade press and indexes

**BS-10. Vehicle Service Pros** and **BS-11. carcomplaints.com**: carried over from `dtc-bmw-coverage.md` (A2, A13, A14, A15); not re-fetched. Same verdicts: cross-check. Copyright footers, no reuse terms.

### 3.4 Forums and community

Reading rule for all forums: a person opens a thread, notes only which codes circulate and which fixes are claimed, and writes our own sentence with a confirmed second source. No crawler, no pasted text, no table copy. Several sites state machine-reading limits (below).

| Host | Robots result (this run) | AI statement |
|---|---|---|
| bimmerpost.com | One group; ~45 paths disallowed; no allow, no delay | None |
| e90post.com | One group; ~40 PHP files and `/forums/` subfolders disallowed | None |
| f30.bimmerpost.com | Same pattern as above | None |
| bimmerforums.com | Allow all; content signals `search=yes`, `ai-train=no`, `use=reference`; ~35 named AI and scraper bots disallowed | Express reservation citing Article 4 of Directive 2019/790 |
| spoolstreet.com | Same content-signal pattern (`ai-train=no`); ~35 bots disallowed | Same reservation |
| bimmerfest.com | Redirects to a `tollbit.` subdomain; there, 24 named search and SEO crawlers disallowed, all others allowed | None named |
| e46fanatics.com | Redirects to a `tollbit.` subdomain; robots there not read | Unknown |
| xoutpost.com | Only Googlebot disallowed from one article page | None |
| northamericanmotoring.com | GPTBot and GoogleOther disallowed; bingbot delay 1 s; search, login, tags and some attachments disallowed | Partial |
| bmw-syndikat.de | ClaudeBot, GPTBot, Bytespider, several SEO bots disallowed | Partial |
| motor-talk.de | GPTBot and ChatGPT-User disallowed; several scrapers disallowed | Partial |

- The "tollbit." redirect appears to be a bot-licensing gateway (medium; inference from the host name, I did not read its pages). Do not treat it as permission.
- Terms of service: bimmerpost (403), spoolstreet (403), bimmerfest (redirect), others not attempted. **Not read, so not asserted.** Typical forum software terms leave user text with its author and grant the site a licence; this is the default assumption, not a finding.

**BS-12 to BS-16: Bimmerpost, Bimmerforums, Spoolstreet, Bimmerfest, E46Fanatics.** The earlier note named Bimmerfest, Bimmerpost, F30Post and Spoolstreet. This run adds the access rules above. The Spoolstreet "N54 codes list" thread (id 578) and "N55 codes list" thread (id 580) appear in search results; the thread pages returned 403 to my fetch so I could not state count or source (PARTIAL). A search snippet shows a Scribd file "N55 Tech Code List" which suggests thread content may be copied from a tool table (low).

**BS-17. Xoutpost "BMW Fault Codes and Their Meaning" (high for facts below)**
- Post number 81940, dated 2006-01-09 11:05, by member "drex", co-founder, 3,416 posts at capture; scope E-series, Z3, M and MINI R50 and R53; "over a thousand" entries visible; the fetched text was 630,071 characters and I read the first 100,000 (high). No stated source, no notice.
- Origin unknown. Rule R2 and R3 apply. I recommend a person opens it only to see which code shapes exist for early MINI R50/R53, then closes it.

**BS-18 to BS-19: North American Motoring, bmw-syndikat.de, motor-talk.de.** Access rules recorded above. Content not opened.

**BS-20. Reddit.** My fetch tool refused the host. I have no first-hand reading of the current user agreement or API terms; the only text is an archived 2019 agreement summarised in a search result (restricts automated access outside published interfaces) and press coverage of litigation (low). Treat as manual-read-only; do not automate.

**BS-21. YouTube.** The terms page (read, high) says no access "using any automated means" except public search engines following robots, and no reproducing or downloading content without permission. The creator keeps ownership. So: a person may watch and note which code a video decodes; no transcript scraping, no downloads. Quality varies; videos often show a hex code and a repair but not the module version.

### 3.5 Open lists, wikis and small sites

**BS-22. OpenMS41 (Google Sites)**: about 209 numbered entries between 1 and 255 for Siemens MS41, MS42, MS43 and M52TU, M54 engines (E34, E36, E38, E46). No operator, no licence, no date; the page says it is being moved between Google Sites formats (high). Decimal codes. Use to confirm that a decimal code exists on an old engine computer; not a source of text.

**BS-23. bmwtuning.co N54 list**: published 2020-03-28, updated 2024-05-09, byline Zach Mayock; 41 entries (7 misfire, 9 fuelling, 21 oxygen sensor, 4 turbo and boost); BMW hex with decimal in brackets plus two P-codes; links one NHTSA bulletin and a parts retailer but cites no source for the definitions (high). A parts seller's page; cross-check only.

**BS-24 to BS-27: Blackcircles, Haynes, AutoNation, Minimania.** See table. Haynes shows the number "115 manufacturer-specific codes" in a heading for the 2014 to 2018 X4 page 2; many descriptions are replaced by "related products" links (high). Haynes pages exist for BMW and MINI models (X4, Clubman seen). This count is a vendor's page statistic, not a total for any chassis.

**BS-30 (docs).** Wikipedia: searches for BMW fault codes returned the OBD and OBD-II PID pages only (high). Wikibooks: no BMW diagnostic page found (high). No open-licensed BMW fault-code wiki found (medium, matches earlier note).

### 3.6 Open GitHub and datasets (licence checked on the page)

**BS-28. OBDb (BMW, MINI, BMW-5-Series): signals only.**
- BMW repo tree: 8 files, 13 paths, `signalsets/v3/default.json`; MINI repo tree: 12 files including tests; no path contains "dtc" (high, GitHub tree API).
- BMW README: describes a default fallback signal set plus a history of BMW; no licence or DTC mention in the README (high). MINI and BMW-5-Series licence files read as CC BY-SA 4.0 (high). I did not read the BMW repository's licence file text.
- GitHub code-search API returned 401, so I could not search all OBDb for "dtc" (PARTIAL). A repository search `org:OBDb dtc` returned 0 hits (high, but that query matches names and descriptions only).
- Verdict: signals only. Share-alike pack.

**BS-29. Klemme15 (cross-check).**
- Repo `Expos-AI/Klemme15`, GPL-3.0-or-later, copyright 2026 (high). Its own `bmw-codes.json` holds 203 BMW entries for the E90 family with plain meaning, causes, fixes and sources; 396 dash (Check Control) messages explained with severity; all 2,066 standard OBD-II titles from python-OBD (high, README).
- It states it contains no BMW software, SGBD files, fault texts, documents or wiring diagrams. BMW's exact text comes either from the user's own files or from bmw-unified-db, a download the user fetches (high).
- Its own notes say meaning depends on module version, giving the example of one hex code on E90 stability-control modules that differs by version; and that translated text is approximate (high). That supports our schema: key by module, hardware and software level.
- AI-assisted parts disclosed in `docs/LEGAL.md` (high).
- Use: compare our entries to theirs for contradictions. GPL text cannot go in a CC-BY pack. Because the maintainer says BMW text is not included, reading it does not make us a tainted reader; however I did not read the data file, so check before assuming (gap).

**BS-30. klartext.** AGPL-3.0; a Rust tool for F-series over ENET with a read-only MCP server (high). Fault text is built from a SQLite database that the user generates from their own ISTA `DiagDocDb`; the build script decrypts ISTA's database with constants the author calls public (high, README). The repository ships none of it. Verdict: **excluded** as a data source; reading its documentation about record layout is fine but its decryption notes (`docs/sqlite-findings.md`) are exactly what we avoid.

**BS-31. bmw-unified-db.** `gediz/bmw-unified-db`, licence metadata "Other / NOASSERTION", created 2026-06-24, pushed 2026-10-04, 15 stars; 2,466 decoded modules out of 3,083 records (the other 617 are stubs); 47 tables (earlier read, not re-checked); about 653 MB uncompressed and 130 MB download; fault data mostly German; data origin stated as BMW's EDIABAS, SP-DATEN, SGBD and WinKFP data; takedown on request; part of the data is CC BY-SA and GPL-3.0 by row (high). The project itself says its fault texts are BMW's copyright. Verdict: **excluded**. Do not open the release asset on any machine used for drafting.

**BS-32. hoffman1938/bimmercode.** Description "Multilingual BMW DTC database with an AI assistant"; no licence on the repository; README names no data source and no count; languages English, Russian, Georgian (high). **Excluded.**

**BS-33. EdiabasLib.** `uholeschak/ediabaslib`, GPL-3.0, created 2017-04-02, 967 stars, active (pushed 2026-11-21 UTC per the API, high), described as a .NET BMW and VAG Ediabas interpreter. Its docs page on BMW coding does not state where description data comes from or give a licence for it (high). The interpreter runs BMW's description files, which are the sensitive part (matches `data-strategy.md`). Code reference only.

**Other GitHub finds** (API searches, high for the listing): `Expos-AI/Klemme15` (GPL-3.0), `HadiCherkaoui/klartext` (AGPL-3.0), `jonathan-gtd/BimmerData` (GPL-3.0, Android), `TheOnlyLoki/bimmerscope` (GPL-3.0), `arcielao/bimmer-reader` (MIT label; text comes from BMW's description files at run time, not bundled; README does not say so outright), `George-Gabra-Jr/bimmerdiag` (no licence), `pxdelta/zf-8hp-tcu-inspector` (MIT; ZF 8HP transmission tool). The query "bmw dtc" returned 8 repositories, none a licensed fault list. Queries with extra words returned 0, so GitHub search coverage is thin (low confidence that nothing else exists).

**BS-34 to BS-36. Hugging Face and Zenodo.**
- Searches on "dtc", "obd" and "bmw" listed no BMW fault-code dataset (high for the list I read; limited to 30 results per query).
- `CodesList/obd2-codes`: CC BY 4.0, 9,414 generic codes, source obdcodeslist.com (high). Duplicate of OBDex scope.
- `RRK1987/automotive-dtc-finetune`: MIT tag, created 2026-06-15, under 1,000 rows, no source, no BMW mention (high). Excluded for origin.
- `Ichlibitiche/mechanicdb-obd2-repair-sample`: ODbL (known from earlier note; incompatible with our CC-BY packs as far as found).
- Hugging Face BMW datasets found are SEC filings, press releases, images; none is diagnostics (high).
- Zenodo query returned 471 hits but none of the first 10 is a BMW fault-code record (PARTIAL).

**BS-37. arXiv 2602.01109.** "Transforming Vehicle Diagnostics: A Multimodal Approach to Error Patterns Prediction", Hugo Math and Rainer Lienhart, submitted 2026-02-01, ICLR 2026 workshop; real-world dataset of 22,137 error codes and 360 error patterns; manufacturer not named; the abstract page names no release link (not checked in the full paper); paper licence CC BY-NC-ND 4.0 (high). Method reference for predicting repair patterns from code sequences; no data for us.

### 3.7 Excluded, with reasons

**BS-38. archive.org "BMW Technical Training Documents".** Uploaded 2019-08-08 by a private account; collections `manuals_bmw` and `manuals`; no licence URL or rights field shown; titles span ST034 to ST1601 and include engine electronics, OBD and ISTA topics (high). BMW-authored training material uploaded by a third party. Reason for exclusion: no owner permission shown. Unchanged from earlier note. Flag: reading it makes someone a tainted reader.

**BS-39. Scribd and SlideShare code sheets.** Seen: "BMW Code Database", "BMW ERROR CODES", "BMW Fault Codes", "Bmw Error Codes", "N55 Tech Code List", "BMW Code Sheet", "BMW DME M1.1, M1.2, M1.3". Community uploads of unclear origin, often copies of tool tables, with hosts' all-rights-reserved style notices (medium). Excluded.

**BS-40. workshop-manuals.com.** Hosts pages that look like BMW TIS service information for E34, E36, E38, E39, E60, E90 (medium, from search snippets; not opened). A copy of OEM content; excluded.

**BS-41. Snap-on BMW Vehicle Communication Software Manual (Feb 2013).** PDF, 131 pages, FrameMaker, encrypted flag with copying allowed, copyright Snap-on (high). Chapters cover testing engine, transmission, ABS, airbag, throttle, climate, bus, body electronics (ZKE) and anti-theft systems by tool menu; I found no fault-code listing (36 matches for "code" terms, all procedural, high). Verdict: manual-read-only, low value; useful only to learn which E-series systems old tools reached.

**BS-42. Licensed data and scan-tool apps.** MOTOR sells OEM-sourced DTCs under licence (high, product page seen); a commercial feed covers VW-group brands (not BMW); etools.org lists OEM licensing services (not opened). Scan-tool apps (OBDeleven, BimmerLink, Carly) hold fault databases behind the app. Extraction would breach terms; excluded. OBDeleven's BMW fault-code page returned 403 to my fetch.

---

## 4. What each source class can give per chassis era

| Era and module family | Best public source | Gap |
|---|---|---|
| E34 to E46 engine computers (decimal, then 4-hex) | OpenMS41 for decimal existence; old forum threads; bulletins | No licence on lists; text origin unknown |
| E60 to E9x (N5x engines, DSC, EPS) | NHTSA bulletins (4-hex, 6-hex), Klemme15 cross-check | Version dependence; few bulletins per module |
| F-series (F30, F10, F20, MINI F5x) | Bulletins (SIB, SIM); MINI DSC read limit (SIM 34 01 20) | Aftermarket access limits on some MINIs |
| G-series and U-series (G20, G05, U10, U11, MINI F65, F66, F67, U25) | 2025 and 2026 bulletins, Check Control numbers | Few public codes; newer modules gated by BMW |
| Check Control messages (driver-visible) | Owner manual, bulletins quoting message numbers, Klemme15 (396 explained, GPL) | Message numbers differ by model; mapping to hex code needs own capture |

---

## 5. Licence and compatibility notes

- Government hosting does not make a BMW bulletin public domain. Treat BMW authorship as controlling (high for the footer; no licence found).
- US federal data pages show "public" with no licence name. Reuse of the flat file's own fields (ids, dates, make, model) is lower risk than reuse of its summary text. Counsel question: facts extracted from summaries and PDFs.
- OBDb signal data is CC BY-SA 4.0 and goes only to the share-alike pack.
- GPL and AGPL projects (Klemme15, klartext, EdiabasLib) cannot feed CC-BY or CC0 packs; reading them for contradictions is fine, copying text is not.
- Forum posts remain with their authors; robots statements and EU Article 4 reservations are rights signals, not permission (medium; not legal advice).
- bmw-unified-db and ISTA-derived databases: any reader is tainted for BMW; log them under the existing tainted-reader rule.

---

## 6. Recommended ingestion path (our process, not a source claim)

1. **Owner decision:** approve one download of the NHTSA flat-file ZIP and its dictionary into a scratch folder outside the repo, name and size to be stated when asked. The size is unknown today.
2. **Filter locally** for Make in {BMW, MINI}; keep id, dates, model, component and summary; count documents by year and by "fault", "DTC", "fault memory", "test plan" mentions. Report the count as the new denominator B.
3. **Fetch matching PDFs** by NHTSA id (one at a time, after the owner approves a bounded batch), extract facts into a scratch table: bulletin id, revision date, chassis, production range, module, code bytes, cause class, remedy class, "clears itself" flag.
4. **Write our sentence** per code; run the similarity check against the local PDF text; delete the PDFs after extraction or keep outside the repo.
5. **Frequency ordering:** use forum thread titles and NHTSA complaint narratives (read by a person) only to rank which codes to write first.
6. **Cross-check** each entry against Klemme15 (contradiction check only) and OBDex (for the P-code half).
7. **Mark unknown honestly:** a code with no entry keeps showing module, bytes, status and "no description yet".
8. **Per-entry fields to add** to the evidence list: NHTSA document id, bulletin number, revision date, MINI or BMW brand, applicability range, and "tool-read limit" flag for SIM 34 01 20 style gaps.

---

## 7. Open questions for counsel or the owner

| # | Question | Why |
|---|---|---|
| Q1 | May we extract facts (code, module, applicability, cause class, remedy class) from BMW bulletins hosted by NHTSA and cite them? | Core of BS-01; no licence found |
| Q2 | Does 40 CFR 86.1808-01 (f)(13) entitle an open-source tool project to BMW's "enhanced" diagnostic information, and at what price? | Could open a lawful official path (BS-06) |
| Q3 | Is reading a GPL project's own-words fault list for contradictions safe for a CC-BY pack? | BS-29 |
| Q4 | Does exposure to bmw-unified-db or klartext databases taint a contributor? | BS-30, BS-31 |
| Q5 | Do forum "ai-train=no" signals reach a person who reads a thread and writes a fact in their own words? | BS-13, BS-14 |
| Q6 | Owner permission for the flat-file download and a bounded PDF batch | Step 1 and 3 of section 6 |

---

## 8. Numbers recorded in this run (checked)

| Fact | Value | Source |
|---|---|---|
| Fields in NHTSA manufacturer-communications record | 14 | BS-02 |
| Summary length | up to 4,000 characters | BS-02 |
| Date range of file | since 1995-01-01 | BS-02 |
| Dataset last updated (catalogue) | 2026-09-03 | BS-02 |
| BMW X1 2023 recall records via API | 6 | BS-03 |
| OBDb BMW repo files | 8 files, 13 paths | BS-28 |
| OBDb MINI repo files | 12 files, 19 paths | BS-28 |
| Klemme15 BMW entries | 203 (E90 family) | BS-29 |
| Klemme15 dash messages explained | 396 | BS-29 |
| bmw-unified-db modules | 2,466 decoded of 3,083 records | BS-31 |
| OpenMS41 entries | about 209 | BS-22 |
| bmwtuning N54 entries | 41 | BS-23 |
| Haynes X4 2014 to 2018 page 2 heading | 115 manufacturer-specific codes | BS-25 |
| Snap-on BMW manual | 131 pages | BS-41 |
| CodesList/obd2-codes | 9,414 generic | BS-34 |
| arXiv dataset | 22,137 error codes, 360 patterns, release not stated | BS-37 |

---

## 9. Gaps (PARTIAL items)

1. **NHTSA flat file not downloaded.** Size, number of BMW and MINI records, and whether summaries contain code hex are unknown. Needs owner approval (Q6).
2. **NHTSA robots, web policy and API docs returned 403** (`www.nhtsa.gov`); `static.nhtsa.gov` robots was 404; the Socrata resource endpoint returned 403. Automated-reading rules for NHTSA are therefore unverified.
3. **Official BMW and MINI owner-manual pages not read**: bmwusa.com timed out (twice), bmw.com timed out, miniusa.com returned 404. Check Control lists and manual terms unverified.
4. **Forum terms of service not read** for any host; spoolstreet pages 403, bimmerpost terms 403, bimmerfest and e46fanatics redirected, reddit refused by the fetch tool. Forum thread contents were not opened (policy), so counts, authors and sources for the named code-list threads are unconfirmed except Xoutpost post 81940.
5. **tollbit redirect meaning** inferred, not read; robots on the e46fanatics gateway not read.
6. **Minimania, OBDeleven, Rick's Free Auto Repair** pages not read (HTTP 522 or 403).
7. **BMW TIS and AOS price and terms** not found; fetch showed a loading shell and an empty terms page.
8. **Klemme15 data file** (`bmw-codes.json`) not opened; whether its entries are safe to cross-check is taken from its README and legal page only.
9. **OBDb**: GitHub code search needs authentication; only the BMW, MINI and BMW-5-Series trees were checked, not the other 40-plus BMW-named repositories listed by the earlier note.
10. **GitHub and Hugging Face search coverage is thin** (queries with more words returned zero; 30-result caps). Absence of a licensed BMW fault list is likely but not proven.
11. **Academic search is shallow**: one arXiv paper and a Zenodo query with irrelevant top hits; no IEEE, SAE or Springer search. SAE and ISO standards (J2012, 15031-6, 14229) carry no BMW-specific code meanings and are paid.
12. **YouTube and Reddit** were assessed by terms only; no video or thread was opened.
13. **No count of any BMW or MINI total, and no per-chassis total**: still true after this run (high, absence).
14. **Transport Canada and other non-US recall sources** not checked beyond a listing; UK and EU bulletin sources (DVSA, KBA) not searched.
15. **MINI-specific forums** beyond North American Motoring (MotoringFile, MINI2) not examined.

---

## 10. Sources (links read or searched this run)

Government and regulator
- NHTSA TSB static PDFs: https://static.nhtsa.gov/odi/tsbs/2026/MC-11030062-0001.pdf, https://static.nhtsa.gov/odi/tsbs/2026/MC-11031579-0001.pdf, https://static.nhtsa.gov/odi/tsbs/2025/MC-11015855-0001.pdf, https://static.nhtsa.gov/odi/tsbs/2020/MC-10181236-9999.pdf, https://static.nhtsa.gov/odi/tsbs/2019/MC-10168021-9999.pdf, https://static.nhtsa.gov/odi/tsbs/2018/MC-10143574-9999.pdf
- NHTSA data dictionary: https://static.nhtsa.gov/odi/ffdd/tsbs/TSBS.txt
- Data.gov entries: https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-technical-service-bulletins-system-tsbs-downloa, https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-recalls-manufacturer-communications-flat-file, https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-recalls-complaints-flat-file
- NHTSA API sample: https://api.nhtsa.gov/recalls/recallsByVehicle?make=BMW&model=X1&modelYear=2023
- 40 CFR 86.1808-01: https://www.law.cornell.edu/cfr/text/40/86.1808-01
- Transport Canada recalls: https://open.canada.ca/data/en/dataset/1ec92326-47ef-4110-b7ca-959fab03f96d

BMW Group
- https://bmwtechinfo.bmwgroup.com/ ; https://bmwtechinfo.bmwgroup.com/assets/system_requirements.pdf ; https://aos.bmwgroup.com/terms-of-use ; https://www.bmwgroup.com/en/general/regulations/cardata.html

Forums and community
- Robots read: https://www.bimmerpost.com/robots.txt, https://www.e90post.com/robots.txt, https://f30.bimmerpost.com/robots.txt, https://www.bimmerforums.com/robots.txt, https://www.spoolstreet.com/robots.txt, https://tollbit.bimmerfest.com/robots.txt, https://www.xoutpost.com/robots.txt, https://www.northamericanmotoring.com/robots.txt, https://www.bmw-syndikat.de/robots.txt, https://www.motor-talk.de/robots.txt
- Thread: https://xoutpost.com/81940-post1.html ; leads not opened: https://www.spoolstreet.com/threads/n55-codes-list.580, https://bmw.spoolstreet.com/threads/n54-codes-list.578/
- YouTube terms: https://www.youtube.com/t/terms

Small sites and lists
- https://sites.google.com/site/openms41/reverse-engineering/documentation/diagnostic-trouble-codes-dtc ; https://bmwtuning.co/bmw-n54-common-fault-codes/ ; https://www.blackcircles.com/news/a-guide-to-bmw-fault-codes ; https://uk.haynes.com/pages/odb-fault-codes-car-bmw-x4-2014-2018-p2 ; https://www.autonationmobileservice.com/i/estimates/manufacturer-fault-codes/bmw-codes/ ; https://miniracing.minimania.com/Mini_Cooper_Fault_Error_Codes (not read)

GitHub and datasets
- https://github.com/OBDb ; https://api.github.com/repos/OBDb/BMW/git/trees/main?recursive=1 ; https://api.github.com/repos/OBDb/MINI/git/trees/main?recursive=1
- https://github.com/Expos-AI/Klemme15 (README, docs/FAULT-DATA.md, docs/LEGAL.md)
- https://github.com/HadiCherkaoui/klartext ; https://github.com/gediz/bmw-unified-db ; https://github.com/hoffman1938/bimmercode ; https://github.com/uholeschak/ediabaslib ; https://github.com/arcielao/bimmer-reader
- https://huggingface.co/datasets/CodesList/obd2-codes ; https://huggingface.co/datasets/RRK1987/automotive-dtc-finetune ; https://huggingface.co/datasets/jigneshk5/dtc_codes
- https://arxiv.org/abs/2602.01109 ; https://zenodo.org/api/records?q=%22diagnostic%20trouble%20code%22%20BMW

Excluded or gated
- https://archive.org/details/BMWTechnicalTrainingDocuments ; https://www.scribd.com/document/396733555/BMW-Code-Database ; https://www.slideshare.net/simobouala/bmw-fault-code-list ; https://workshop-manuals.com/ (search results only) ; https://www.snapon.com/DiagnosticsManuals/PDF/NA/VCS/BMW.pdf ; https://www.motor.com/products-services/data-products/diagnostic-trouble-codes/ ; https://obdeleven.com/bmw-fault-codes (403)

---

## 11. Addendum, 2026-11-21 re-check (closes part of gaps 2 and 14)

- **BS-05 licence now verified (high).** The open.canada.ca package record for the Vehicle Recalls Database lists licence "Open Government Licence - Canada" (id `ca-ogl-lgo`). Resources: monthly full CSV (`opendatatc.tc.canada.ca/vrdb_full_monthly.csv`), XML, a variables text file and a JSON/XML API on `data.tc.gc.ca`. It is recalls only, no fault codes, so verdict stays **cross-check**. This is the only government source here with a verified open licence; attribution under that licence is required.
- **NHTSA automated-reading rules, re-tested.** `www.nhtsa.gov/robots.txt` is 403 (access denied by the edge, not a robots file). `static.nhtsa.gov/robots.txt` is 404 (no rules stated). `api.nhtsa.gov/robots.txt` is 403 "Missing Authentication Token". So there is still no published crawl policy; keep requests few, identify the client, and use the bulk flat file instead of crawling PDFs one by one (BS-02).
- Gap 14 remains open for UK (DVSA) and EU (KBA) sources; not searched in this pass.
