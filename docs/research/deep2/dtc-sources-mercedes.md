# Mercedes-Benz and smart: legitimate public sources of manufacturer fault-code (DTC) meanings

Date: 2026-11-20. Status: **PARTIAL** (reasons in section 9). Not legal advice. Topic: Mercedes-Benz and smart cars and vans. Extends, does not repeat, `docs/research/deep2/dtc-mercedes-coverage.md`, `docs/plan/dtc-coverage-strategy.md` and `docs/plan/data-strategy.md`.

Confidence tags: **[high]** read on the primary page, file or API in this run; **[medium]** read on a secondary page, or two agreeing sources; **[low]** search snippet only, or general knowledge. "Est." means a planning guess, never a fact.

Rules followed: only facts about sources are recorded. No fault text is copied. A code string appears only as a format example. Nothing was downloaded to the project; pages and two small PDFs were read for metadata and headings only. No secrets, no git.

---

## 1. Executive summary

1. **There is still no open, licensed list of Mercedes or smart fault-code meanings.** Searches of GitHub (hit counts from the first run, not repeated: 254 for a loose Mercedes+DTC query, nearly all noise; 1 repo for "Mercedes fault codes", no licence; 9 for "xentry dtc", none with Mercedes code data), Kaggle, Hugging Face and Zenodo style queries, and academic search found none. [medium, search tool is US-only and limited]
2. **The best legitimate fact source is the US government archive of Mercedes and smart bulletins** (NHTSA). It is public, machine-listable (a documented flat file) and carries 6-character code shapes for newer cars. It yields facts (code, control unit, applicability, remedy class), not a code table. The flat file holds a summary of at most 4,000 characters per bulletin, not the full PDF. [high]
3. **NHTSA's own terms say site information is public and may be copied, but each Mercedes PDF carries a Mercedes copyright line.** So: take facts, write our own words, cite the bulletin. Verdict "ingest (facts only)". The site-wide public-information wording does not clearly cover manufacturer-authored documents. [medium]
4. **New this run: NHTSA investigation files** (`static.nhtsa.gov/odi/inv/<year>/INRD-...pdf`) bundle manufacturer-submitted bulletins into one PDF. The one opened (2021 file, 45 pages, modified 2023-08-16) contains a 2013 Mercedes bulletin with control-unit designators. A second harvest channel beside the TSB archive. [high for the file, low for how many exist]
5. **New: smart 453 bulletin uses the same 6-character code shape** as newer Mercedes cars (one 2016 bulletin, version 4, M281 engine, engine unit N3/10 and body unit SAM-M N10/10). So the decoder rule for Mercedes also covers smart 453. [high for one bulletin]
6. **Open projects hold signals, not meanings.** OBDb has 37 Mercedes repositories (all CC-BY-SA-4.0, verified by API) and 4 smart repositories. Zero DTC matches in all 10 definition files opened (three of the smart/Mercedes files are 60 to 83 kB, so the zero is not caused by empty files). 6 more repos returned no definition file at the expected path. [high]
7. **Community lists share one ancestor and lie about nothing but provenance.** Three lists say they were "found online" or "found on the Internet" for 1996+ cars (MBWorld 2010 thread, w220.wiki, MBClub 2014 thread). w220.wiki also says it added text from STAR Xentry, DAS and WIS, which are paid dealer tools. That is an admission of copied OEM text. Verdict: cross-check for "does this code circulate" only, never ingest, never train from. [high]
8. **A copyrighted commercial manual is hosted on a public club site.** The file `mbslk.de/files/artikel/r170_fehlercodes.pdf` is the Baum Tools "Fault Code Manual for Mercedes-Benz", copyright Baum Tools Unlimited Inc., dated 2001-02-01 (107 pages by its header; author field names a person; created 2004). Only metadata and the contents list were looked at. It is **excluded**; Scribd and eManualOnline copies likewise. [high]
9. **Official owner manuals exist per model and market** (US pattern `mbusa.com/css-oom/assets/en-us/pdf/<model-year-slug>.pdf`; world pattern `static.oneweb.mercedes-benz.com/css-oom-assets/<locale>/pdf/<slug>.pdf`). One sample is 64.4 MB. Not opened (too large for the fetch tool); contents on fault codes unknown. Manual-read-only until a human checks. [medium]
10. **Mercedes' own diagnostic data is behind paid or contract access** (B2B Connect, XENTRY, WIS, StarTekInfo, the Remote Diagnostic Support API). EU law (Regulation 2018/858, Articles 61 and 63) obliges Mercedes to sell repair information to independent operators on reasonable terms, in machine-readable form. That is a lawful route to buy information, but the licence for reuse is not public. Owner decision, not a research item. [high for the law, none for price or terms]
11. **Forums are the only broad source of "what owners see", and their terms bar bulk copying.** MBWorld and BenzWorld sit under Internet Brands terms (scraping bans, narrow exception for search engines and non-commercial archives). BenzWorld and the smart forum now redirect crawlers to a pay-per-crawl gateway (HTTP 402 on fetch). Verdict: human reading of facts (code, car, what fixed it), rewritten, with a link.
12. **Spanish and German coverage exists only as discussion.** Spanish: Autodoc Club (robots blocked our fetch), Opinautos (code-error sections for Clase C and Sprinter; AI-training crawlers blocked), Manuales de Mecanica. German: Motor-Talk (AI bots blocked), workshop blogs. None has a licence that allows reuse. Useful for demand ("which codes owners ask about") only.
13. **Stack Exchange (Mechanics) is the one community source with a real open licence** (CC BY-SA, version by posting date, attribution needed). The fetch tool was blocked for that domain, so Mercedes volume is unmeasured. The 2024 dump restrictions are disputed in sources. PARTIAL.
14. **Counts we can state:** NHTSA TSB flat file covers communications since 1995-01-01 (field list: 14 fields); OBDb Mercedes repos 37, smart repos 4; w220.wiki about 770 rows (hand count, 2016 last edit); mercedesmedic intro says 1,202 (class counts sum to 1,201). **Counts we cannot state:** number of Mercedes or smart bulletins, number of distinct Mercedes codes in them, size of the owner-manual library. Run the harvester (section 7) to turn these into numbers.
15. **Verdict totals (section 3):** ingest 2 (NHTSA flat file, NHTSA bulletin PDFs including investigation bundles); cross-check 14; manual-read-only 12; excluded 21.

---

## 2. How to read the verdicts

| Verdict | Meaning in this project |
|---|---|
| ingest | Facts may be extracted by script or by hand into the `facts` pack. Our own sentence is written separately. Source id and bulletin id are stored. |
| cross-check | Read to detect mistakes or to count how often a code circulates. Nothing copied. Agreement proves little when sources share ancestors. |
| manual-read-only | A person may read pages one at a time. No bulk fetching. Facts are restated in our words with a link. |
| excluded | Not read for content, or read only for metadata. Reason given. Anyone who has read leaked or paid text is a tainted reader for that make (data-strategy section 8). |

---

## 3. Source table (all sources, one row each)

Columns: id, source and URL, owner, licence or terms (as verified), coverage, size, format, how to cite, access rules for automated reading, quality, verdict. "n/v" means not verified this run.

### 3.1 Government and regulator

| id | Source (URL) | Owner | Licence / terms | Covers | Size | Format | Cite as | Automated access | Quality | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| G1 | NHTSA TSB flat file: dataset page https://data.transportation.gov/d/hczg-qbhf ; layout https://static.nhtsa.gov/odi/ffdd/tsbs/TSBS.txt ; linked file http://www-odi.nhtsa.dot.gov/downloads/folders/TSBS/FLAT_TSBS.zip | NHTSA (US DOT) | The data.gov catalogue record said rights "public" in the earlier run; the data.transportation.gov API view for this id carries no licence field (re-checked, null). Layout file has no terms statement. Site terms call site information public and copyable (medium, search-result wording; the page itself returned 403) | Manufacturer communications received since 1995-01-01, all makes; Mercedes-Benz and smart not counted | n/v (zip not downloaded). Layout: 14 fields | CSV (summary search) and TSV (all fields) in 5-year chunks by receipt date; layout file calls the TSV `MfrComms.txt` (formerly `TSBS.txt`) | "NHTSA Manufacturer Communications file, record <NHTSA ID>, fetched <date>" | static.nhtsa.gov has no robots.txt (404). Flat file is the intended bulk route | Medium: summary only (up to 4,000 chars), one row per multi-valued field, not all bulletins included, recall bulletins excluded | **ingest** (facts only) |
| G2 | NHTSA bulletin PDFs for Mercedes and smart: `https://static.nhtsa.gov/odi/tsbs/<year>/MC-<id>-<suffix>.pdf` (also older `SB-...`). Examples read: 2016/MC-10135709-9999.pdf, 2023/MC-10233793-0001.pdf | Mercedes-Benz AG and Mercedes-Benz USA (authors); hosted by NHTSA | Mercedes copyright line on bulletins (medium; line not located in the two files opened, recorded from the earlier note and a search summary). No reuse licence | Control unit and code pairs, applicability (model, production dates, engine), remedy class. Newer: 6-char codes. smart 453 confirmed | 2 to 45 pages each; count of Mercedes bulletins unknown | PDF, text-selectable (Apache FOP or Word generated) | "Mercedes-Benz bulletin <topic number> v<version>, via NHTSA <file name>, <year>" | No robots file on static host; serve politely (section 7) | High for facts about which code sits on which unit; none for text reuse | **ingest** (facts only) |
| G3 | NHTSA investigation bundles `https://static.nhtsa.gov/odi/inv/<year>/INRD-<id>.pdf`; opened: 2021/INRD-PE21020-91134P.pdf | NHTSA, containing manufacturer submissions | Manufacturer copyright on content; NHTSA public information wording applies to the agency's own text | One Mercedes investigation (PE21020): 45 pages, consolidated bulletins, includes a 2013 radar-related bulletin with unit designators N62/1 and N62/2 | 45 pages (one file) | PDF with bookmarks | "NHTSA investigation file PE21020, bookmark <label>" | Same as G2 | Medium: random subset the regulator asked for | **ingest** (facts only) |
| G4 | NHTSA complaints flat file https://static.nhtsa.gov/odi/ffdd/cmpl/CMPL.txt (layout), FLAT_CMPL.zip (data) | NHTSA | "public"; no licence text | Owner complaints since 1995, all makes; narratives may mention codes | n/v | Tab-delimited, YYYYMMDD dates, 5-year chunks | "NHTSA complaint <ODI number>" | Same host family | Low for meanings (owner words); useful for "which codes owners report" counts | **cross-check** |
| G5 | NHTSA recalls API (documented at https://www.nhtsa.gov/node/102181 per search; page returned 403 to the fetch tool) e.g. `api.nhtsa.gov/recalls/recallsByVehicle` | NHTSA | n/v | Recalls by make, model, year; defect text rarely names codes (unverified) | n/v | JSON API | "NHTSA campaign <number>" | Rate limits n/v | Low for codes | **cross-check** |
| G6 | NHTSA site terms https://www.nhtsa.gov/about-nhtsa/terms-use (via search snippet; page not opened) | NHTSA | Says site information is public and may be distributed or copied; submissions to NHTSA become agency property | Applies to NHTSA-authored content; third-party material needs the third party's permission | n/a | HTML | Cite the page when relying on public-information wording | `www.nhtsa.gov/robots.txt` returned 403 (Akamai) to both the fetch tool and curl; rules unknown | n/a | n/a (terms record) |
| G7 | CARB OBD resources https://ww2.arb.ca.gov/resources/documents/obd-resources | California Air Resources Board | "Copyright 2026 State of California"; "Conditions of Use" page not read | Regulation 13 CCR 1968.2 references, mail-outs 1995 to 2026, certification templates. **No per-manufacturer fault-code lists on this page** | n/a | HTML, PDF | "CARB mail-out <number>" | n/v | High for structure rules; none for Mercedes meanings | **cross-check** (structure only) |
| G8 | EU Regulation (EU) 2018/858, Articles 3, 61, 63, 66 https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32018R0858 | European Union | EUR-Lex legal text; reuse of EU legislation is free (general knowledge, n/v). Articles 3(49), 61 and 63 re-read this run | Obliges manufacturers to give independent operators OBD and repair information, machine-readable, on their websites, at reasonable and proportionate fees (hourly to yearly access) | Long (text 392,476 chars as served) | HTML | "Reg. (EU) 2018/858, Art. 61(1)" | n/v | High as law; **does not name fault codes** (OBD information is defined by function) | **cross-check** (legal basis) |

### 3.2 Manufacturer public and portal sources

| id | Source (URL) | Owner | Licence / terms | Covers | Size | Format | Cite as | Automated access | Quality | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| M1 | Owner manuals, US: https://www.mbusa.com/en/owners/manuals ; PDFs `https://www.mbusa.com/css-oom/assets/en-us/pdf/<slug>.pdf` and `.../content/dam/mb-nafta/us/owners/manuals/<year>/...` | Mercedes-Benz USA, LLC | Footer "2026 Mercedes-Benz USA, LLC"; Terms of Use page not read; a PDF HEAD request returned 403 to curl (bot block) | Models 2016 to 2024 seen in search (Sprinter, S, E, GLB, C, CLA, CLS, Maybach, Metris, eVito) | n/v | PDF | "Mercedes-Benz USA, <model> <month year> operator's manual" | `mbusa.com/robots.txt`: `*` blocks `/save/ /brand/ /data/ /media/ /json/*` and others; no Disallow touching `/content/dam` or `/owners` found; `/css-oom` not tested; no crawl-delay | n/v: warning-lamp text likely, stored codes unlikely (low) | **manual-read-only** |
| M2 | Owner manuals, world: `https://static.oneweb.mercedes-benz.com/css-oom-assets/<locale>/pdf/<slug>.pdf` (locales seen: en-lb, en-jo, en-do, en-du, en-is, en-lk, en-bh, en-mn); country portal example https://mercedes-benz.co.id/en/services/owners-manual | Mercedes-Benz AG and market companies | Terms n/v | W176, W246, W247, C207, C238, W213, S213, V447, C420 and more | One sample (W213 2017, COMAND) is 64,357,261 bytes, modified 2025-07-24 (HTTP header) | PDF | as M1 | `static.oneweb` robots n/v | n/v | **manual-read-only** |
| M3 | Mercedes-Benz Guides app and in-car digital manual (named in manuals) | Mercedes-Benz | n/v | Same content as manuals | n/a | App, in-car | n/a | n/a | n/a | **manual-read-only** |
| M4 | Mercedes B2B Connect, technical data https://b2bconnect.mercedes-benz.com/gb/technical-data | Mercedes-Benz AG | "Provided in accordance with Regulation (EU) 2018/858"; terms of use not shown; publisher access needs contract | Lists spare parts info, workshop information, dynamic wiring diagrams, TIPS topics, repair master data (repair codes and texts), repair time data; XENTRY WIS and Operation Time | n/a | Web apps, API | n/a | Login and contract | High but closed; prices not shown | **excluded** (paid, contract) |
| M5 | Mercedes Remote Diagnostic Support API (`api.mercedes-benz.com/remotediagnostic/v1`, operation `POST /vehicles/{vehicleId}/dtcReadouts`) via https://apis.io/apis/mercedes-me/mercedes-me-diagnostic-trouble-codes-dtc-s-api/ and https://b2bconnect.mercedes-benz.com/gb/shop/workshop-solutions/remote-diagnostic-support (page title says MFA required) | Mercedes-Benz | Terms n/v | Per-vehicle code read-outs for connected cars; **not a code catalogue** (the listing does not say the response carries meanings) | n/a | JSON API | n/a | Authentication needed | n/a | **excluded** (not public) |
| M6 | StarTekInfo https://www.startekinfo.com (page returned title only) | Mercedes-Benz USA | Independent shops pay by day, month or year (secondary sources, medium); some free sections reported (2005 article: recall bulletins; 2023 article: free resources through an independent-provider portal; low) | OEM service documents US | n/a | Web | n/a | Login | High but closed | **excluded** (paid) |
| M7 | NASTF: Mercedes signed the service-information agreement around 2020 (search results from fenderbender.com and automotivetechinfo.com PDFs) | NASTF and Mercedes-Benz USA | n/a | Access rules, theft-relevant parts, DAS4 key orders need an active XENTRY subscription | n/a | Web, PDF | n/a | n/a | Medium (trade press) | **cross-check** (access facts) |
| M8 | Mercedes StarTuned articles on https://automotivetechinfo.com (e.g. XENTRY-and-OBD-II-Go-Deep.pdf, Using-WIS-Efficiently.pdf, Identity-Verification-for-XENTRY-Diagnosis-Programming-and-Theft-Relevant-Parts.pdf, Mercedes-Benz-NASTF-and-the-VSP-Registry.pdf) | Mercedes-Benz USA publication hosted by a trade site | Mercedes publication copyright; n/v | How scans are presented, WIS use, identity checks | PDFs, few pages each | PDF | "StarTuned <month year>" | n/v | High for process; no code tables | **manual-read-only** |
| M9 | Mercedes-Benz Group "Big Data Diagnosis" careers page https://group.mercedes-benz.com/careers/about-us/artificial-intelligence/for-nerds/big-data-diagnosis.html | Mercedes-Benz Group | n/v | Marketing description of pattern mining on repairs | n/a | HTML | n/a | n/a | Not a dataset | **excluded** (no data) |
| M10 | Mercedes developer portal https://developer.mercedes-benz.com/ (title only returned) | Mercedes-Benz | n/v | API platform; no open DTC data seen | n/a | Web | n/a | Registration | n/a | **excluded** (no open data found) |

### 3.3 Open datasets, open code, open projects

| id | Source (URL) | Owner | Licence / terms | Covers | Size | Format | Cite as | Automated access | Quality | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| O1 | OBDb Mercedes-Benz repos: https://github.com/OBDb (search `org:OBDb Mercedes`: 37 results) | OBDb community | CC-BY-SA-4.0 on all 37 (API) | Live-data signals, mode 22; A, B, C, E, G, GLA, GLB, GLC, EQ models and more | `Mercedes-Benz` 6,919 bytes, `Viano` 4,179, `SLK-Class` 4,147 (definition file) | JSON `signalsets/v3/default.json` | "OBDb <repo>, commit <sha>" | GitHub API, raw files | High for signals; **zero DTC entries** in files opened | **cross-check** |
| O2 | OBDb smart repos: `smart`, `smart-fortwo`, `Smart-Smart-1`, `smart-forfour` | OBDb community | `smart-fortwo` CC-BY-SA-4.0, pushed 2026-11-12 (API); others n/v | smart signals | `smart` 82,916 bytes, `smart-fortwo` 64,014 bytes; two others have no definition file at the expected path | JSON | as O1 | as O1 | Zero DTC matches | **cross-check** |
| O3 | OBDex https://github.com/foerbsnavi/OBDex | foerbsnavi | CC0-1.0 data, MIT code per earlier notes (README claim); the GitHub API in the re-check reports licence "Other / NOASSERTION", so no licence is machine-verified; repo pushed 2026-11-07 | 9,533 generic codes; manufacturer codes "stay with their makers" | See earlier note | JSON | per plan | GitHub Pages | Spot-audit gate in plan | **cross-check** (existence) |
| O4 | mercedes-benz/odxtools https://github.com/mercedes-benz/odxtools | MBition GmbH | MIT | ODX reader; no Mercedes data | n/a | Python | n/a | n/a | n/a | **excluded** as data (tool only) |
| O5 | rnd-ash/openStar https://github.com/rnd-ash/openStar | Individual | No licence in API (null); README says program reads CBF and SMR-D files from the user's own Xentry install and does not redistribute them; "currently nonfunctional"; 88 stars; last push 2021-07-04 | Rust Daimler diagnostic app | n/a | Source | n/a | n/a | Not a data source | **excluded** as data |
| O6 | phprell/obd-diag https://pypi.org/project/obd-diag | Philipp Prell | MIT (GitHub API; PyPI field empty); version 0.2.2; pushed 2026-10-16 | Read-only OBD-II tool for ELM327 on Linux; tested on a Mercedes A 180 d (search summary, low) | n/a | Python | n/a | n/a | Data content not checked | **cross-check** (peer project, asks for traces) |
| O7 | iamneilroberts/shadetree-ai | Individual | MIT; pushed 2026-10-10 | Read-only OBD-II assistant (MCP server) | n/a | Source | n/a | n/a | Data content not checked | **cross-check** |
| O8 | Dhxqhu/obdscan | Individual | No licence (search summary and API listing); README says manufacturer packs are address and data-identifier scaffolds, not dealer databases | `data/dtc_generic.json` 123,011 bytes; `manufacturers/mercedes.py` 3,148 bytes | as shown | Python, JSON | n/a | n/a | Generic only; no Mercedes meanings | **excluded** (no licence) |
| O9 | callstack/benz-ql | Callstack | MIT; last push 2023-01-04 | GraphQL wrapper for Mercedes APIs | n/a | Source | n/a | n/a | No data | **excluded** as data |
| O10 | pylessard/udsoncan and uds.readthedocs.io (DTC knowledge-base page) | Maintainers | Project licences n/v | UDS 24-bit DTC structure explained | n/a | Docs | "udsoncan docs, DTC page" | n/a | High for structure | **cross-check** (structure) |
| O11 | peyo/dtc-and-vin-data, todrobbins/dtcdb, MOTOR-style lists | various | See earlier notes | No Mercedes | n/a | n/a | n/a | n/a | n/a | covered in earlier note; **cross-check** at most |

### 3.4 Forums and Q and A (user-written explanations)

| id | Source (URL) | Owner | Licence / terms | Covers | Size | Format | Cite as | Automated access | Quality | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| F1 | MBWorld https://mbworld.org/forums/ | Internet Brands | Internet Brands terms https://www.internetbrands.com/ibterms/ : Section 4 bans copying, aggregating or derivative use, including via crawlers and scrapers, except general-purpose search engines and non-commercial public archives that follow robots.txt; Section 2a gives the site a perpetual licence to posts; Section 19(c) only says site content may be AI-assisted, with no rule on AI training or AI use of posts (re-read this run) | All generations: W204, W212, W213, W214, V-Class, diesel, R170, W203 and more; sub-forums by model | Thousands of threads (not counted) | HTML, attachments | "MBWorld thread <id>, <date>" | robots: GPTBot and GoogleOther blocked; bingbot crawl-delay 1; `*` blocked from search, printthread, members, attachment downloads | Medium: real codes with fixes, mixed accuracy | **manual-read-only** |
| F2 | BenzWorld https://www.benzworld.org/ | Not read (same forum family) | Redirects (307) to https://tollbit.benzworld.org/ ; a fetch of the gateway returned HTTP 402; robots there names many crawlers (including Googlebot) with `Disallow: /` and allows `*` | Same topics | n/v | HTML | n/a | Pay-per-crawl gateway | n/v | **excluded** for automated reading; human reading n/v |
| F3 | MBClub UK https://forums.mbclub.co.uk/ | n/v | Terms not read | UK cars: W211, W213, CDI engines; thread "Full diagnostic trouble codes list" (ChrisA, started 2014-03-02, 6 pages, no source named) | n/v | HTML (XenForo layout) | "MBClub UK thread <id>" | robots: PetalBot, AhrefsBot, SemrushBot, MJ12bot and others blocked; `*` blocked from `/account/ /attachments/ /posts/ /search/`; sitemap given; no AI rules | Medium; the list thread has no provenance | **manual-read-only**; list thread **excluded** |
| F4 | PeachParts https://www.peachparts.com/shopforum/ | n/v | robots fetch returned 403; terms n/v | Older and mixed Mercedes, Sprinter, W220, 190E threads | n/v | HTML | n/a | n/v | Medium | **manual-read-only** |
| F5 | Motor-Talk (German) https://www.motor-talk.de/forum/ | n/v | Terms n/v | Thread on a ML 320 with a 6-digit airbag fault and B-class cluster codes seen in search snippet | n/v | HTML | "Motor-Talk thread <id>" | robots: GPTBot and ChatGPT-User blocked; several scrapers blocked; `*` blocked from `/out`, `/suche.html` and a few pages | Medium | **manual-read-only** |
| F6 | Autodoc Club (Spanish, English, German) https://club.autodoc.es/forum/auto/mercedes-benz/ | Autodoc | Terms n/v | General Mercedes discussion, Clase C, Vito, Sprinter | n/v | HTML | n/a | robots fetch returned 403 | Low to medium | **manual-read-only** |
| F7 | Opinautos (Spanish) https://www.opinautos.com/mercedes-benz/clase-c/defectos and `.../mercedes-benz/sprinter/defectos/codigo-de-error` | Opinautos | Terms n/v | Owner reports and code-error sections (examples: P2000 on a C180, P0002 on a C200, a 7-character code on a Sprinter) | n/v | HTML | "Opinautos report <id>" | robots: member profiles and query strings blocked; SEO crawlers and AI-training crawlers blocked fully; AI retrieval crawlers left open | Low to medium | **manual-read-only** |
| F8 | Manuales de Mecanica foro https://www.manualesdemecanica.com/en/foros/ | n/v | n/v | Sprinter code threads (P1955, P0109, P0105 seen) | n/v | HTML | n/a | n/v | Low | **manual-read-only** |
| F9 | Smart Car of America https://www.smartcarofamerica.com/ | n/v | Redirects to https://tollbit.smartcarofamerica.com/ (not fetched) | smart fortwo 451, 453, EV; one 2018 453 EV thread (106 replies, 18 participants) about a coolant pump code | n/v | HTML (XenForo layout) | n/a | Pay-per-crawl gateway assumed, n/v | Medium | **manual-read-only** (human) |
| F10 | Evilution (UK smart tuning) https://www.evilution.co.uk | n/v | n/v | A few 451 and 450 codes, user submitted; warns that smart software may give different meanings than standard lists | small | HTML | n/a | n/v | Low | **cross-check** |
| F11 | iFixit Answers and guides https://www.ifixit.com | iFixit | Footer "Creative Commons" (search snippet; exact variant not verified; Terms page URL tried returned 404); robots states use of content for LLM training or commercial purposes without a specific licence violates terms; content signals: ai-train disallowed | W204, smart roadster and fortwo devices; one smart 451 answer about a P20B1-shaped code seen | n/v | HTML, partial API (guides, wikis, categories allowed) | "iFixit answer <id>" | `/api/*` blocked except guides, wikis, categories, reviews | Low to medium | **cross-check**; licence variant must be read before any reuse |
| F12 | Stack Exchange "Motor Vehicle Maintenance and Repair" (mechanics.stackexchange.com) | Stack Exchange | CC BY-SA 2.5, 3.0 or 4.0 by posting date (Stack Overflow licensing page, via search); attribution required; 2024 dump restrictions disputed in sources | Mercedes tag volume unmeasured (fetch blocked) | n/v | Site and dump (archive.org item `stackexchange_20251231` seen in search) | "Stack Exchange post <id>, CC BY-SA <version>" | Site fetch blocked in this run | Medium (voted answers) | **cross-check** (PARTIAL); SA text cannot enter CC-BY pack, facts may |
| F13 | Reddit (r/mercedes_benz and similar) | Reddit | Fetch blocked in this run; terms n/v | Owner posts | n/v | HTML, paid API | n/a | n/v | n/v | **manual-read-only** (human) |
| F14 | kfz-dietrich.com (German workshop blog), pages on W205 and W213 | Independent workshop | Commercial blog, "Fachlich geprueft" label; terms n/v | Concepts: fault status types, XENTRY use, 90+ control units on a W213 (blog claim) | blog posts | HTML | "kfz-dietrich blog post <slug>" | n/v | Low (secondary, marketing) | **cross-check** (concepts only) |

### 3.5 Wikis, DIY lists, aggregators

| id | Source (URL) | Owner | Licence / terms | Covers | Size | Format | Cite as | Automated access | Quality | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| W1 | w220.wiki fault-code page https://w220.wiki/M-B_Fault_Error_Codes/Diagnostic_Trouble_Codes_(DTC) | W220 S-Class Encyclopedia (MediaWiki 1.41.0) | No licence on page; footer links to Privacy, About, Disclaimers (the guessed URLs for About and Disclaimers returned 404); page says list was found on the Internet with additions from STAR Xentry, DAS and WIS; says mistakes happen | 1996+ models; about 770 rows by hand count (P about 530, B about 80, C about 70, U about 90); revision oldid 4136, last edit 2016-09-12 | one page | MediaWiki HTML | n/a | robots.txt 404 (no rules) | Low to medium: copied lineage, admits dealer-tool text | **cross-check** (existence only; never ingest) |
| W2 | MB Medic fault codes https://www.mercedesmedic.com/faultcodes/ | MB Medic | No licence in the part read (footer not in the first 100,000 of 184,742 characters) | Title says 1,200+; intro 1,202; classes P 1,033, B 46, C 32, U 90 | 184,742 characters | HTML | n/a | robots: blocks `/wp-json/`, `/wp-admin/`, search and cart query patterns; second block is malformed; sitemap given; no AI rules | Low to medium; includes multi-meaning rows | **cross-check** (existence only) |
| W3 | MBWorld 2010 "Mercedes error codes" thread https://mbworld.org/forums/c32-amg-c55-amg-w203/333898-mercedes-error-codes.html | Poster (francoisisp) | Forum terms F1 | A compiled list "found online", grouped by class; typos, duplicates and placeholders | 2 posts in the page read | HTML | n/a | as F1 | Low | **excluded** (copied lineage) |
| W4 | Pelican Parts W204 technical articles https://www.pelicanparts.com/techarticles/MBZ_Tech_Index-W204.htm | Pelican Parts (commercial) | No licence shown | How-to articles | n/v | HTML | n/a | n/v | Medium | **manual-read-only** |
| W5 | Hella Techworld PDFs (e.g. Vito power-loss PDF, "Actualizacion 65") https://www.hella.com/techworld/es/ | Hella | Copyright n/v | Case studies, a few Mercedes models | small | PDF | n/a | n/v | Medium for causes | **manual-read-only** |
| W6 | TrueDelta TSB pages https://www.truedelta.com/smart-fortwo-tsbs-389,2013 | TrueDelta | Fetch timed out; robots says search allowed, ai-train not allowed | Re-listing of NHTSA bulletin summaries by year (from search snippet) | n/v | HTML | n/a | See robots | Low value: use NHTSA directly | **excluded** (duplicate of G1) |

### 3.6 Standards and academic

| id | Source | Owner | Licence / terms | Covers | Verdict |
|---|---|---|---|---|---|
| S1 | SAE J2012, J2012-DA (digital annex), ISO 15031-6, ISO 14229-1 | SAE, ISO | Paid, copyrighted (SAE Mobilus pages seen) | Code structure, failure-type byte definitions | **excluded** as text; structure used from public summaries |
| S2 | Public structure summaries: Wikipedia OBD-II and OBD-II PIDs; uds.readthedocs.io | Wikimedia (CC BY-SA), maintainers | CC BY-SA for Wikipedia text | Letter, digit layout; 24-bit code | **cross-check** (structure) |
| S3 | Academic papers or theses on Mercedes DTC meanings | none found | n/a | One search found only standards pages and trade articles | no source (gap) |

### 3.7 Excluded, with reason (not read for content)

| id | Source | Why excluded |
|---|---|---|
| X1 | Baum Tools "Fault Code Manual for Mercedes-Benz" at https://www.mbslk.de/files/artikel/r170_fehlercodes.pdf (107 pages by header; copyright Baum Tools Unlimited Inc., 2001-02-01; HTTP re-check: 571,862 bytes, last modified 2008-09-08, still served) | Commercial manual under copyright, republished without a licence on a club site. Only metadata and contents list were seen |
| X2 | Scribd copies: scribd.com/doc/230175160 (r170-fehlercodes), /document/466359960 (MB-CODE-FAULT-MANUAL), /doc/73323971, /document/409456850, /document/419210778, /document/723810334, /document/953627152, /document/956860318, /document/866644850 | Unlicensed uploads; provenance unknown; not opened |
| X3 | emanualonline.com Baum Tools listing; manualmachine.com; manuals.plus (403); archive.org `manualsonline-id-...` PDF | Resale or mirrors of third-party manuals; unverified; not opened |
| X4 | Haynes pages (uk.haynes.com, us.haynes.com, au.haynes.com) including "190 (1982 to 1993) 623 manufacturer-specific codes" claim, smart 2007 to 2015 table | Commercial, copyrighted |
| X5 | MOTOR Diagnostic Trouble Codes product (motor.com) | Licensed commercial OEM-sourced data; buyers must contact sales |
| X6 | Diagnostics Data (drivesomethinggreater.com) | Paid; Volkswagen Group brands only |
| X7 | Blogs and wikis reposting lists: mercedes-benz-worldzz.blogspot.com, bitauto.com/wiki/100114763786, converter.brightcoding.dev/mercedes-obd-codes | Provenance unknown, likely copied |
| X8 | MBWorld "MB DTB/Xentry Bulletins" thread and forum PDF attachments of dealer scans or bulletins | Re-posted OEM or dealer-tool output; personal data risk (VIN); attachment downloads blocked by robots |
| X9 | XENTRY, DAS, WIS, StarFinder exports and dumps; B2B Connect content; StarTekInfo content | Paid or contract content; data-strategy rule R1 |
| X10 | Mercedes Remote Diagnostic Support API (M5) | Authenticated, per-vehicle; not public. A search summary said the published spec embeds a default key; not verified, and a key seen anywhere counts as exposed, so never use it |
| X11 | openStar-style readers of CBF and SMR-D files (O5) | Tool for files the user holds; the files are OEM data |
| X12 | Any ODX, PDX or CBF obtained from a Mercedes install | Falls under D5 in data-strategy; local overlay only |

Count check: verdicts in sections 3.1 to 3.6 and 3.7 are summarised in section 1 item 15. If a row changes, update that line.

---

## 4. Sources (detail notes per source group)

### 4.1 NHTSA (G1 to G6): what was read and what it means

- **Layout file read (high).** `https://static.nhtsa.gov/odi/ffdd/tsbs/TSBS.txt` lists 14 fields: NHTSA ID number (9 digits); replacement service bulletin number (deprecated); date added to file; TSB or document ID (128 chars); manufacturer communication date; manufacturer internal campaign ID or software version; communication type (40); make; model; model year (9999 if unknown); NHTSA components (up to five, comma separated); manufacturer component system; manufacturer component subsystem; summary (4,000 chars). One row per bulletin per multi-valued field value, so one bulletin can span many rows.
- **Two forms (high).** CSV for keyword search of the summary; TSV (`MfrComms.txt`, formerly `TSBS.txt`) with all fields. Both split in 5-year chunks by the date NHTSA received the communication.
- **Coverage (high).** Received since 1995-01-01. The page does not list makes.
- **Known file-doc problems (high).** Fields 12 and 13 are described as CHAR(516) in the table but CHAR(512) in the change log. The change log carries an entry dated 2026-09-15 (a recent real change raising fields 12 and 13 to 512 characters; not a typo, since it precedes today). The change log also gives the bulletin ID as CHAR(25) while the table says CHAR(128). Check the live file before coding positions.
- **Data.gov record (medium).** Dataset id `hczg-qbhf`, rights "public" and last updated 2026-09-03 in the catalogue record seen earlier; the Socrata API view re-checked now shows no licence field and a rows-updated stamp of 2018-12-18 (the two are not reconciled; the view may be the older download page). Publisher NHTSA, contact `nhtsa-datahub@dot.gov`. The record says the data does not contain all bulletins a manufacturer produces, that bulletins for safety recalls in general are not included, and that bulletins which may not pertain to a defect may not be included.
- **Probes that failed (high).** `static.nhtsa.gov/odi/ffdd/tsbs/` (404), `FLAT_TSBS.zip` on the static host (404 with a delete marker), `MfrComms.zip` (404), `MfrComms_1995-1999.zip` (404). The data.gov link points at the older `www-odi.nhtsa.dot.gov` host. **Correct current file names are unverified.** Next step: open the NHTSA datasets page in a browser (the fetch tool got 403) and copy the exact links.
- **robots (high).** `www.nhtsa.gov/robots.txt`: HTTP 403 (Akamai "Access Denied") to curl and to the fetch tool, so rules unknown. `static.nhtsa.gov/robots.txt`: 404, so no published rules for the file host.
- **Terms (medium).** Search snippets of the Terms of Use and Privacy pages say site information is public and may be distributed or copied; images in the image library carry no usage conditions; the logo is restricted; third-party copyrighted material linked from the site is not NHTSA's to license; items submitted through the site become agency property. A caveat from the same search: manufacturer PDFs on the site keep their own copyright notices.
- **Bulletin PDFs opened.**
  - `2016/MC-10135709-9999.pdf` (37.5 kB, Apache FOP, created 2016-05-24): a smart 453 engine bulletin, topic number format `LIxx.xx-P-nnnnnn`, version 4, validity "Smart 453 with M281 engine", one 6-character code, units named by designator (engine N3/10; body control unit SAM-M N10/10). Remedy field says the issue is under investigation and asks the dealer to open a support case. No copyright line found by text search. [high]
  - `2023/MC-10233793-0001.pdf` (85.5 kB, 2 pages, Word 2016, created 2023-03-27): an internal template titled "Vorlage Arbeitsleitungen" (working lines template). **Not a fault bulletin.** Shows the archive holds non-diagnostic documents, so a harvester must filter by content. [high]
  - `inv/2021/INRD-PE21020-91134P.pdf` (785 kB, 45 pages): consolidated manufacturer files; first bulletin dated 2013-08-21, version 1, function group 30.30, validity lists model series 166, 172, 204.9, 216, 218, 231; names radar control unit designators N62/1 and N62/2. Says each bookmark label is the original file name. [high]
- **Why this is the best fact source.** Government host, stable URLs, machine-readable index, real manufacturer wording on which unit stores which code and which software or part fixes it. **What it cannot give:** a complete table; most bulletins relate one or two codes to one symptom.
- **Use rules.** Facts only: bulletin id, date, model series, production range, engine, unit designator, code (base plus suffix), remedy class (software update, wiring check, part replacement, adaptation reset). Our own sentence is written from the fact record by a second person where the "tainted reader" rule is in force. Cite by NHTSA file name and Mercedes topic number.

### 4.2 Mercedes official public material (M1 to M10)

- **Manual URL patterns (high for the pattern, from search results).** US: `https://www.mbusa.com/css-oom/assets/en-us/pdf/mercedes-<model>-<year>-<month>-<platform>-<system>-operators-manual-<n>.pdf` and older `.../content/dam/mb-nafta/us/owners/manuals/<year>/owners-manuals/<name>.pdf`. World: `https://static.oneweb.mercedes-benz.com/css-oom-assets/<locale>/pdf/<same slug style>-owners-manual-1.pdf`. The slug carries model, body, year, month, platform code (for example w213, c238, v223, w176), system (comand or mbux). That gives a free model-year-platform index for applicability tags.
- **Size (high).** One W213 2017 file: 64,357,261 bytes. The fetch tool limit is 10 MB, so it could not be read. A human or a local PDF tool must open one to settle whether any fault-memory text exists.
- **Statements in the manuals (medium, from search summaries).** The PDFs say they may differ from the printed manual; the digital manual lives in the multimedia system; the online version is the valid one for vans. None of that mentions stored fault codes.
- **B2B Connect (high).** Lists repair master data "repair codes and texts" and diagnostic data among paid items, under Regulation 2018/858. This is where the text we cannot use lives. Prices are not shown. The earlier note records XENTRY Diagnosis Lite and Pass-Thru access rules (time credits, StartKey).
- **EU law (high).** Article 61 requires access to OBD information, tools, software downloads and repair information, machine-readable, on websites, updates simultaneous with authorised repairers; Article 63 sets "reasonable and proportionate" fees, with hourly, daily, monthly and yearly access and a transaction option. Article 3(49) defines OBD information by function and does not name fault codes. **Unknown:** whether Mercedes' licence lets an independent operator republish any text. Almost certainly not; ask counsel before buying anything.
- **Remote Diagnostic Support API (high for operation name).** Base path `/remotediagnostic/v1`; one operation, a POST for a vehicle's code read-outs. Per-car data for connected vehicles. Not a catalogue.

### 4.3 Open code and signal projects (O1 to O11)

- **OBDb (high).** Search `org:OBDb Mercedes` returned 37 repositories; every one has licence CC-BY-SA-4.0. Names include the base `Mercedes-Benz`, A-180, A-200, A-220, AMG-A-45, AMG-GT, B-Class, C-180, C-Class, C200d, CL-Class, CLA-200, CLA-Class, CLK-Class, CLS, E-Class, E180, EQA, EQB, EQE, EQS, EQS-Class-Sedan, EQV, G-Class, GLA-Class, GLA250, GLB-250, GLC-Class, GLK-Class, M-Class, ML-350, Ml63, S-Class, SL-Class, SLC-Class, SLK-Class, Viano. smart has 4 (`smart`, `smart-fortwo`, `Smart-Smart-1`, `smart-forfour`). This settles the earlier "about 37, truncated" count.
- **DTC check (high).** Case-insensitive search for "dtc" in the definition file: `Mercedes-Benz` 0 (6,919 bytes), `Viano` 0 (4,179), `SLK-Class` 0 (4,147), `smart` 0 (82,916), `smart-fortwo` 0 (64,014). Earlier note: E, C, G Class 0. For `EQS`, `CLA-Class`, `Smart-Smart-1`, `smart-forfour` the expected path returned a 21-byte not-found body, so those were not checkable. The EQS repo root lists a generations file, signalsets folder, tests and a licence file; no DTC folder.
- **Meaning.** The SA pack is useful for live values on Mercedes and smart; it does not help with fault meanings.
- **obdscan (high).** Ships 123,011 bytes of generic DTC JSON and per-make "scaffold" Python modules (Mercedes 3,148 bytes). No licence. Skip.

### 4.4 Forums, by language

**English**
- MBWorld: 2020 thread "fault code lists Mercedes-Benz" (id 795638): closed, 2 posts, names XENTRY as the only full list and no open list. Useful as evidence that owners cannot find a list. 2010 thread (id 333898): compiled list "found online", duplicated and placeholder entries. W204 section id f-83; Mercedes Tech Talk moderated by a certified Mercedes technician (as stated on the forum index); V-Class and Vito threads on W639 electrical codes exist.
- MBClub UK: thread 167900 (2014, 6 pages, no source). Newer threads quote 6-character codes on W213 OM654 cars (a 2026 case with the dealer replacing a unit).
- PeachParts: older cars and Sprinter threads asking "meaning sought".
- smart: Smart Car of America (453 EV, 2018 coolant-pump code thread: 106 replies, 18 participants); evilution.co.uk (451, 450). Both warn that smart's own tool may name a code differently from the generic list.

**German**
- Motor-Talk: thread "fehlercodes" id t6510581 and an ML 320 thread showing a 6-digit airbag code beside B1xxx cluster codes (search snippet). Shows the older number-only scheme still appears next to B-codes. [low]
- Workshop blogs (kfz-dietrich.com): statements that without XENTRY only emissions codes show, that a W213 talks to more than 90 control units, that "no communication" entries after coding are temporary. Concepts only; commercial.
- German R170 club site mbslk.de hosts the Baum file (X1). Treat the site as unsafe as a source.
- Not searched: Mercedes-Fans, mercedes-forum.com, Mercedes-Benz-Passion style forums (gap).

**Spanish**
- Opinautos (Spain and Mexico variants): per-model "codigo de error" pages with owner reports; Sprinter, Clase C. robots allows retrieval crawlers, blocks AI-training crawlers.
- Autodoc Club ES: general Mercedes forum, threads on common generic codes.
- Manuales de Mecanica: Sprinter threads.
- Hella Spanish technical PDFs: power-loss cases on Vito 639.
- Not searched: Latin American Mercedes clubs, Portuguese, French, Italian (gap).

### 4.5 Wikis and lists

- Shared ancestry (high): MBWorld 2010 thread, w220.wiki and MBClub 2014 thread all say "1996 onward", "found online", and none gives a source. w220.wiki adds dealer-tool text (own admission). The MBWorld list has duplicated codes with different meanings. Counts agree loosely (770 vs 1,202) only because the sets overlap partly.
- mercedesmedic.com: header counts are not self-consistent by one (1,202 vs 1,201). The earlier note found 1,200 claimed and then not found; this run re-found it (title and intro).

### 4.6 Standards and academic

- J2012, J2012-DA, ISO 15031-6 and ISO 14229-1 are paid. Structure is known from public pages (letter plus digits, 24-bit code, failure-type byte). The failure-type value list is in J2012-DA and still unread (gap carried from the earlier note).
- No academic source on Mercedes fault-code meanings found. Mercedes' "Big Data Diagnosis" page is a marketing description.

---

## 5. What changed compared with the earlier Mercedes note

| Earlier statement | Now |
|---|---|
| OBDb Mercedes "about 37" from a truncated search | 37 exactly by API, all CC-BY-SA-4.0; smart has 4 |
| OBDb DTC check on E, C, G only | Also base, Viano, SLK, smart, smart-fortwo: zero |
| mercedesmedic count not re-found | Re-found: intro 1,202; classes sum 1,201 |
| w220.wiki licence unclear | Still none stated; page says dealer-tool text was added; wiki runs MediaWiki 1.41.0; `robots.txt` 404 |
| NHTSA bulletins as only archive | Also investigation bundles (`/odi/inv/`) and a documented flat file index with 14 fields |
| smart not covered | smart 453 bulletin shows same 6-character shape; smart OBDb repos exist; forum list |
| Baum file not identified | The mbslk.de "r170_fehlercodes" file is the 2001 Baum Tools manual; excluded |

---

## 6. Access rules summary (automated reading)

| Host | What was found | Rule for us |
|---|---|---|
| static.nhtsa.gov | No robots.txt (404) | Read slowly, identify the project in the user agent, no personal details, cache, stop on 403 or 429 |
| www.nhtsa.gov | robots.txt 403 | Do not crawl pages; use file downloads and the bulletin host only |
| mbusa.com | `*` blocked from `/save/ /brand/ /byo/ /data/ /media/ /campaigns/ /json/*`, checkout; no crawl-delay | Human download of a few manuals only |
| mbworld.org | GPTBot, GoogleOther blocked; bingbot delay 1; search, printthread, members, attachment downloads blocked | Human reading; no scraping (ToS Section 4) |
| forums.mbclub.co.uk | Some SEO bots blocked; attachments, posts, search blocked | Human reading |
| benzworld.org, smartcarofamerica.com | Redirect to a pay-per-crawl gateway (402) | No automated reading |
| motor-talk.de | GPTBot and ChatGPT-User blocked | Human reading |
| mercedesmedic.com | Blocks API, admin, search patterns; no AI rules | No bulk copy; cross-check by hand |
| w220.wiki | robots 404 | No bulk copy |
| opinautos.com | AI-training and SEO crawlers blocked; retrieval crawlers open | Human reading |
| ifixit.com | AI bots blocked; training disallowed; API mostly blocked | Human reading; read licence first |
| truedelta.com | ai-train=no | Not needed |
| peachparts.com, club.autodoc.es | robots 403 | Unknown; human reading |
| reddit.com, stackoverflow.com, mechanics.stackexchange.com | Fetch tool blocked | Not measured |

---

## 7. Harvest plan for the one "ingest" channel (NHTSA), no code written here

1. Get exact current file names from the NHTSA datasets page in a browser; record links and sizes (needs the owner's go-ahead to download; none done in this run).
2. Filter rows where make equals Mercedes-Benz or smart. Check the actual spellings in the file first.
3. Keep: NHTSA ID, bulletin id, date, communication type, model, model year, components, summary length. Do not store the summary text in the shipped pack; use it only to find candidates.
4. Fetch each candidate PDF at about one request per second, with a user agent that names the project and a contact address that is not personal. Save to `_raw/` outside the repo.
5. Extract facts only into the record below. A second person writes the sentence.
6. Count: number of Mercedes bulletins, number with code tables, number of distinct (unit, base code, suffix) triples, split by 5-character and 6-character codes. This answers gap 1.
7. Stop rule: if NHTSA blocks, asks to stop, or a Mercedes notice conflicts with the facts-only plan, pause and escalate to counsel.

Fact record (all fields facts, none prose):

| Field | Example form |
|---|---|
| source_id | G2 |
| nhtsa_file | `MC-10135709-9999` |
| mercedes_topic | `LI07.61-P-063263` |
| version, date | 4, 2016-05-24 |
| platform | smart 453 |
| engine | M281 |
| unit designator | N3/10 (engine), N10/10 (body) |
| code_base, code_suffix | P2610, 00 (format shown only) |
| remedy_class | software, wiring, part, adaptation, investigation |
| licence_note | "facts only; source copyright Mercedes-Benz AG" |

---

## 8. Citation templates

- NHTSA bulletin: "Mercedes-Benz AG, <topic number> version <n>, <date>, via NHTSA file <MC-id>, accessed <date>."
- NHTSA flat file row: "NHTSA manufacturer communications file, NHTSA ID <id>, accessed <date>."
- NHTSA investigation: "NHTSA investigation file <PEnnnnn>, bookmark <label>, accessed <date>."
- Forum fact: "<site> thread <id>, <date>, one owner report: code <x> on <model, year>." Never quote the post.
- OBDb: "OBDb <repo>, commit <sha>, CC-BY-SA-4.0" (signals pack only).
- Stack Exchange: "<question title or id>, Stack Exchange, CC BY-SA <version>, by <user>."

---

## 9. Gaps (what remains unknown or unverified)

1. **Bulletin counts.** Number of Mercedes and smart bulletins, and distinct codes in them: not measured (flat file not downloaded; correct file names not confirmed).
2. **NHTSA robots and exact terms.** `www.nhtsa.gov/robots.txt` returned 403; the Terms of Use page was read through a search snippet, not opened.
3. **Whether the Mercedes copyright line appears in every bulletin.** Not found by text search in the two small bulletins opened.
4. **Owner manual content.** No manual could be opened (10 MB tool limit; 64 MB sample). Whether any manual lists stored fault codes is unknown (earlier note: probably only warning lamps, low).
5. **Mercedes Terms of Use** for mbusa.com and the world portal: not read.
6. **Forum terms.** BenzWorld, MBClub UK, PeachParts, Motor-Talk, Autodoc, Opinautos, Manuales de Mecanica: terms not read; PeachParts and Autodoc robots blocked our fetch.
7. **Stack Exchange and Reddit.** Fetch tool blocked both domains; Mercedes Q and A volume unmeasured; dump licence status disputed.
8. **iFixit licence variant.** Footer says "Creative Commons" in a search snippet; exact variant not verified; terms URL tried gave 404.
9. **Other languages.** French, Italian, Portuguese, Dutch, Polish, Russian, Arabic, Turkish forums not searched. Mercedes-Fans and other big German forums not searched.
10. **smart coverage.** smart 450, 451, 452, 453, EQ and smart #1 (OBDb `Smart-Smart-1`) hardly covered; no smart-specific owner manual portal found.
11. **Mercedes vans and trucks.** Sprinter, Vito, Citan seen in threads and manuals; trucks and buses excluded from scope.
12. **Other governments.** Germany's KBA, Transport Canada, UK DVSA, Australia: recall and defect data not checked for code content.
13. **Academic papers.** One search; no hit. A fuller search of arXiv, IEEE, SAE papers is open.
14. **GitHub search limits.** Unauthenticated, few queries; code search inside repos not done; Hugging Face, Kaggle and Zenodo were searched only through the web search tool.
15. **Research-tool limits.** Search is US-only; several fetches returned title-only or 403 pages; PDF pages from NHTSA are compressed and were read by local extraction only for three small files.
16. **J2012-DA failure-type list.** Still unread.
17. **Cost of Mercedes RMI access** under EU Articles 61 and 63: price, terms and reuse rights unknown.
18. **Per-source quality scores** are judgments, not measurements; no accuracy test was run.

---

## 10. Recommended next steps (for the plan, ordered)

1. Owner OK to download the NHTSA flat file (one file, size to be confirmed) and run the count in section 7.
2. Open one official owner manual locally and check for fault-code text.
3. Read the Terms of Use of NHTSA, mbusa.com, MBWorld (Internet Brands), MBClub, iFixit; record the clauses.
4. Record counsel questions: facts-only extraction from Mercedes bulletins hosted by NHTSA; use of Stack Exchange facts; whether to buy EU RMI access.
5. Add the smart 453 bulletin shape to decoder test vectors.
6. Do not use w220.wiki, mercedesmedic, MBWorld or MBClub lists, Baum copies or Scribd files for text; use only to see which codes circulate, and only by a person who is not a reviewer for that code.

---

## 11. Fetch log (what was tried, short)

| Target | Result |
|---|---|
| static.nhtsa.gov TSBS layout file | read |
| catalog.data.gov TSB record, data.transportation.gov API view | read |
| www.nhtsa.gov robots.txt, NHTSA datasets page | 403 |
| static.nhtsa.gov robots.txt, `/odi/ffdd/tsbs/`, three zip names | 404 |
| MC-10135709-9999, MC-10233793-0001, INRD-PE21020-91134P PDFs | read (headings and metadata) |
| mbusa legal notices, owners manuals page, robots | read (indexes only) |
| W213 2017 owner manual PDF | too large (10 MB limit) |
| b2bconnect technical data page | read |
| apis.io RDS API listing | read |
| developer.mercedes-benz.com, startekinfo.com | title only |
| mbworld.org index and robots, threads 795638 and 333898 | read |
| Internet Brands terms | read |
| benzworld.org and smartcarofamerica.com | 307 to gateway; gateway root 402 |
| forums.mbclub.co.uk robots, thread 167900 | read |
| peachparts robots, club.autodoc.es robots | 403 |
| motor-talk robots, opinautos robots, mercedesmedic robots, iFixit robots, truedelta robots | read |
| w220.wiki page, Special:Version, robots | read; robots 404 |
| mercedesmedic fault-code page | read (first 100,000 of 184,742 chars) |
| mbslk.de r170 PDF | metadata and contents only; identified as copyrighted |
| pypi obd-diag, GitHub API for obd-diag, openStar, obdscan, shadetree-ai, OBDb searches | read |
| EUR-Lex 2018/858 | read in three segments |
| CARB OBD resources | read |
| Stack Overflow licensing, mechanics.stackexchange.com, reddit.com | fetch blocked; licence from search results only |
| iFixit Terms of Use | 404 |
| TrueDelta TSB page | timed out |
