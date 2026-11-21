# Toyota, Lexus, Scion: public sources of manufacturer-specific fault-code (DTC) meanings

Date: 2026-11-20. Status: **PARTIAL** (see section 6). Not legal advice.
Scope: a source-by-source ledger of places where Toyota/Lexus/Scion manufacturer fault-code information is publicly available, with licence/terms, access rules and a verdict. Facts about sources only. No fault text is copied here.
Extends, does not repeat: `docs/research/deep2/dtc-toyota-lexus-coverage.md` (structure, TIS tiers, 40 CFR 86.1808, OBDex, OBDb, MotorData, MOTOR, peyo) and `docs/plan/dtc-coverage-strategy.md` (ladder A/B/C). Where a source is already covered there I give a one-line pointer and only add what is new.

Confidence tags: **[high]** read on the source's own page this run; **[medium]** secondary or search-summary only; **[low]** inference or not opened.
Fact-check pass 2026-11-20: 12 rows (T01 x2 sources, T11 robots, T12, T15 robots, T24, T25, T26, T30, T31, T33, T34) re-fetched; corrections applied in place.
Tool note: pages came through a summarising fetcher (small model, may truncate or mis-state counts) plus a US-only web search. Two of four PDF opens returned only metadata. Re-confirm any count before it goes in a public document.

---

## 1. Executive summary

1. **No legitimately open, licensed, per-code Toyota/Lexus manufacturer-DTC dataset was found.** Every list that has meanings traces to Toyota repair-manual pages (forum posts, hobby sites, parts sellers) or to commercial data. This confirms the earlier note.
2. **One new lead worth a look: `karsonmadden/us-vehicle-trouble-codes` on Hugging Face.** CC BY 4.0, 1,142 rows, columns include `defined_by`, `meaning`, `bulletins`, `model_years`, `components`; compiled by "WhichTrim" from NHTSA public bulk files (recalls, manufacturer communications, complaints), nightly regeneration [high on the page's claims; the claim itself unverified]. The page has no make column (confirmed on re-read), so Toyota share cannot be read directly. Only 119 of 1,142 rows (10.4%) have a meaning, per the page. Verdict: **cross-check only, after an audit** (the `meaning` text is a derived summary of NHTSA material, which for TSBs is OEM-copyrighted; the dataset licence cannot grant rights WhichTrim may not hold). A web search for "WhichTrim" found nothing independent.
3. **Best fact-level public source is the NHTSA manufacturer-communications file** (TSBs): federal download, ZIP/CSV/TSV, 14 documented fields, summary up to 4,000 characters since 2024-06-26, one record per bulletin per product/component [high]. One search result reported a US public-domain label on a third-party catalog record [low; not visible on the data.gov page when re-read], and data.gov's own page says only "public" with no licence [high]. Use as an **index** to find bulletins that name a code, then read the PDF by hand. The PDFs are OEM documents.
4. **Toyota's free public content is not a DTC source.** Owner's manuals are public PDFs on Toyota-run hosts (US `assets.sia.toyota.com`, Canada `toyota.ca`, Australia `toyota.com.au`, UK `toyota.co.uk`, Europe `myportalcontent.toyota-europe.com`) [medium, from search results; none opened]. They hold warning-light and message tables, not code tables (unverified). `robots.txt` on toyota.com and `assets.sia.toyota.com` returned HTTP 403 to my fetcher, so automated-access rules are **unknown**; treat as manual read only.
5. **Forum posts are the richest, least clean source.** The three most useful are all re-typed Toyota manual content: PriusChat "ECU Diagnostic Codes" (Gen 2 hybrid ECU DTCs plus information codes 101 to 352, stated source Toyota repair manual pages DI-199 to DI-205), ECRoSTech's HV ECU page (copyright Graham Davies 2003, ~26 DTCs, ~252 information codes), and ClubLexus "Master List of CEL Trouble Codes" (OBD-I 1 to 85 and P0100 to P1780, copied from troublecodes.net). Use only to confirm that a code exists, on which generation, with the "information code" shape. Rewrite later from our own captures.
6. **Robots/AI rules are mixed.** PriusChat's robots file blocks ClaudeBot, anthropic-ai, GPTBot, CCBot and about 30 more, and sets `ai-train=no`, `search=yes`, `use=reference` for everyone else [high]. ClubLexus blocks GPTBot and GoogleOther and forbids search pages, member pages and attachment downloads [high]. So: **no bulk crawl of forums; human reading and manual note-taking only.**
7. **Excluded outright:** Techstream/TIS exports on Scribd/SlideShare, forum-hosted scans of Toyota repair manuals, scraped OBDeleven/MotorData, GitHub sets with no licence or unknown origin, and all MOTOR data without a licence.
8. **Net effect on the plan:** nothing here raises the 60 to 100 entry week-12 estimate. It adds (a) a cheap bulletin index, (b) a cross-check pool, (c) a list of what to avoid. Real manufacturer coverage still has to come from captures and owner reports.

---

## 2. Source table (one row per source)

Verdict key: **I** ingest (facts, own words) / **X** cross-check only / **M** manual read only, no automation / **E** excluded.
"Auto access" = what robots/ToS say about automated reading, as read this run.

| # | Source | Owner | Licence / terms read | Covers | Size (approx) | Format | Auto access | Quality | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| T01 | NHTSA manufacturer-communications file (TSBs), data.transportation.gov `hczg-qbhf`; flat files at `static.nhtsa.gov/odi/ffdd/tsbs/` | US DOT / NHTSA | data.gov: rights "public", no licence stated [high]; a third-party record was reported to carry a public-domain label [low; not seen on the data.gov page on re-read]; no NHTSA terms found | All makes incl. Toyota, Lexus, Scion; summaries by year/make/model/component; not complete; recall bulletins excluded | Not shown; 5-year chunks; ZIP | CSV (basic) + TSV "flat file" (14 fields) in ZIP | `www.nhtsa.gov/robots.txt` HTTP 403 to my fetcher; bulk download is the intended path | Index quality good, coverage incomplete | **I** (as index, facts only) |
| T02 | NHTSA-hosted Toyota/Lexus bulletin PDFs (`static.nhtsa.gov/odi/tsbs/<year>/MC-<id>-<seq>.pdf`, `SB-...`) | Toyota (author), NHTSA (host) | No licence on the file; OEM copyright assumed [low]; no notice found in readable metadata | Procedures, software updates, symptom/DTC bulletins, some hybrid battery bulletins | Thousands (unmeasured) | PDF, many scanned/OCR | Same as T01 | Mixed: authoritative content but sometimes image-only | **M** then own-words facts |
| T03 | NHTSA recalls API / complaints bulk files | NHTSA | Public; terms not found this run | Recalls, complaints | n/a | JSON API, flat files | Documented API [medium] | Complaints are consumer text; no DTC field | **X** (frequency of symptoms only) |
| T04 | Toyota TIS, `techinfo.toyota.com` | Toyota Motor North America | Login and paid tiers; Terms of Use not read; assume no redistribution | Toyota/Scion/Lexus NA, 1990+ | Not published | HTML/PDF behind login | n/a | Authoritative | **E** for ingest; see prior note for the one-fact subscription rule |
| T05 | Toyota owner's manuals (US): `assets.sia.toyota.com/publications/en/om-s/<OMid>/pdf/<OMid>.pdf` | Toyota Motor North America | OEM copyright; no reuse licence seen | Per model and year; warning lights, messages, "if a warning light turns on" | One PDF per model-year; ~hundreds of pages | PDF | `robots.txt` HTTP 403 [high that it was refused] | Good for what the driver sees; not code tables (unverified) | **M** (rewrite warning-light behaviour) |
| T06 | Toyota owner's manuals (Canada): `toyota.ca/content/dam/toyota/documents/manuals/en/<OMid>/<OMid>.pdf` | Toyota Canada | OEM copyright | Per model/year | One PDF each | PDF | Not read | Same | **M** |
| T07 | Toyota Australia owners page `toyota.com.au/owners/manuals` | Toyota Australia | Not read | Per model; "Browse vehicle manuals" | n/a | HTML + PDF | Not read | Unknown | **M** (pointer) |
| T08 | Toyota UK `toyota.co.uk/owners/vehicle-information`; Ireland FAQ; Europe `myportalcontent.toyota-europe.com/Manuals/...` | Toyota Motor Europe and national units | Not read | EU models (e.g., ProAce, Aygo X) | n/a | PDF/online | Not read | Unknown | **M** (pointer) |
| T09 | Lexus warning-lights page `lexus.com/My-Lexus/resources/warning-lights` | Lexus (Toyota) | Not opened (HTTP 403 on fetch) | Common warning lights; points to owner's manual | n/a | HTML | unknown | Light-level only | **M** |
| T10 | Lexus owner's manuals (hosted as PDFs on `assets.sia.toyota.com`, e.g., a 2026 NX450h+ manual with a "Warning lights and indicators" section) | Lexus / Toyota | OEM copyright | Per model/year | One PDF each | PDF | See T05 | Good for lights, not codes | **M** |
| T11 | PriusChat "ECU Diagnostic Codes" thread (`priuschat.com/threads/ecu-diagnostic-codes.31394`) | Forum user "PriusLove", site by owner of PriusChat | Forum ToS not read; user content; content re-typed from Toyota manual | Gen 2 Prius HV ECU: DTCs B2799, C2692, C2693, P1120, P1520, P1566, P1600, P1780, P3000, P3001, P3004, P3100 to P3145 range; information codes 101 to 352 | 1 post, 2007-04-26 | HTML | robots: ClaudeBot/anthropic-ai/GPTBot/CCBot and 32 named agents in all blocked; default group signals `ai-train=no`, `search=yes` (not AI summaries), `use=reference`; robots is not the site ToS | Faithful copy of Toyota manual (stated); strong provenance risk | **X** + **M** (confirm existence/shape only) |
| T12 | ECRoSTech "Hybrid Vehicle ECU Diagnostic Trouble Codes" `ecrostech.com/prius/GenInfo/DTCs/HVECU.htm` | Graham Davies | Footer: "All material Copyright 2003 Graham Davies"; no reuse grant | Early Prius HV ECU; ~26 DTCs, ~252 information codes numbered 101 to 394 with gaps (counts approximate); page last edited 2003-12-04 | 1 page | HTML | Not read | Re-typed repair manual pages DI-199 to DI-205 | **X** (existence only) |
| T13 | PriusChat other threads: "Code P3000 and P0A84", "P3000 DTC Code in Techstream History", "How to read p3000 sub code", "Explain these battery codes for me", "P0A80 Code- but is it really the hybrid battery", "Meaning of DTC P30001... for 2003 Prius" | Forum users | User content; site ToS not read | Gen 1 to 3 hybrid battery codes, INF behaviour, scan-tool limits | Many threads | HTML | See T11 | Practitioner experience; mixed | **M** (experience, then own words; check against capture) |
| T14 | PriusChat attachments (`attachments.priuschat.com/...221928_2010_prius.pdf`) | Forum user upload | Third-party scan of Toyota material; copy status unknown | Example 2010 Prius printout with ECU names | 1 file | PDF | n/a | Unofficial | **E** (do not link or rely) |
| T15 | ClubLexus "Master List of CEL Trouble Codes" (thread 340604, 2008) | User "labrealiv"; site: Internet Brands (MH Sub I, LLC) | Site ToS on internetbrands.com, not read; page © 2026 MH Sub I, LLC | OBD-I 1 to 85 (~45 entries), OBD-II P0100 to P1780 (~95 entries); no model named; tag "ls400" | 1 post | HTML | robots: GPTBot and GoogleOther blocked; search/members/print/attachment-download paths disallowed | Copied from troublecodes.net (stated); old | **X** (existence only) |
| T16 | ClubLexus attachment PDF "need help codes p0101 p0102 on 03 sc430 dtc toyota lexus trouble codes" | Forum user upload | Third-party upload of a code list; origin not stated; attachment downloads disallowed by robots | SC430 era | 1 file | PDF | Disallowed (`*/attachments/*dl`) | Unknown | **E** |
| T17 | ClubLexus "Engine diagnostic tools and PC tools (includes all trouble codes)" (RX 1st gen, thread 590788) | Forum users | Not opened | RX300 1999-2003 | n/a | HTML | See T15 | Unknown | **M** (not read) |
| T18 | ClubLexus "obd2 trouble codes" (hybrid technology, thread 1001325) | Forum users | Not opened | Hybrid | n/a | HTML | See T15 | Unknown | **M** (not read) |
| T19 | IH8MUD "200 Series Error Codes" (thread 259012) | Users dtt255, sdtash, camino70 | Forum ToS not read | LC200 diesel ECD DTCs (P00AF to P2589 spans), generic Toyota P1100 to P1780, PDF "200 DTC.pdf" for '08 LC and '14 GX (P0010 to P050B) | 2 pages, 20 posts on page 1 | HTML + PDF attachment | robots not read | Practitioner list; sources cited as obd-codes.com and an uploaded PDF | **X**; attachment **E** |
| T20 | Tacoma World "free pdf fault code sheet help needed" (thread 101567) | Forum users | Not opened | Fault-code sheet to P1780 | n/a | HTML | not read | Thread, not a reference | **M** |
| T21 | Toyota Owners Club "List of OBDII fault codes" (thread 43814) | Forum users | Not opened | Toyota codes | n/a | HTML | not read | Unknown | **M** (not read) |
| T22 | SupraMKV (GR Supra) threads, e.g., "Drivetrain malfunction and Cylinder 2 misfire" (35160), "Crankcase ventilation leakage code 16050A" (13360), "B48 JB4 error codes" (25246) | Forum users | Not read | A90 Supra: BMW-origin B58/B48 engine, codes appear as BMW-style hex (e.g., 16050A, 130716) [medium] | Many threads | HTML | not read | Good for symptom/fix; no consolidated list found | **M**, and cross-link to BMW notes |
| T23 | GR86/BRZ forums (GR86 Forum, FT86Club, r/GR86) | Users | Not opened (only named in search suggestion) | Subaru-built FA24 engine; codes likely Subaru-style [low] | n/a | HTML | n/a | Unknown | **M** (not researched; see Gaps) |
| T24 | troublecodes.net/Toyota | BAT Auto (batauto.com) | No terms or copyright notice visible; accuracy disclaimer only | OBD-I 45 entries/40 numbers; 95 common P-codes P0100 to P1780; engine-code tables 1986-2009 | 1 page, ~103 comments | HTML | no robots read | Origin of the list not stated | **X** (existence only; likely derived from Toyota manuals) |
| T25 | obd-codes.com Toyota page | OBD-Codes.com | "All information on this site is copyright protected" [high]; informational-only disclaimer | 41 Toyota-specific P1100 to P1780 on the page; P062F, U0123 etc. in discussion | 1 page | HTML | Not stated | Source of definitions not cited | **X** (read-only; no extraction) |
| T26 | iATN DTC index (monthly) e.g., 2025-05 | iATN | "Copyright 1995-2025 iATN. All rights reserved"; Terms of Use; member-provided information | Most-reported codes by make; Toyota on 13 distinct codes in 2025-05 (U0100, P0010, P0013, P0037, P0301 to P0305, P0328, P060D, P060E, P1604); total code count for the month not re-confirmed | 1 page/month | HTML | Footer links Terms of Use (/terms-of-use), unread; "members-oriented" is inference | Useful only as a frequency signal | **X** (frequency counts only) |
| T27 | MotorData Toyota page | MotorData | Commercial; terms unread (see prior note) | Vendor claim "several thousand" Toyota-specific | n/a | HTML | unread | Commercial | **E** for ingest; orientation only |
| T28 | MOTOR Diagnostic Trouble Codes (data product) | MOTOR (Hearst) | Licensed; sales-led | OEM-based, all makes | n/a | XML/JSON/BSON web services | Licence only | High, paid | **E** (not redistributable) |
| T29 | OBDeleven Toyota fault codes list | OBDeleven | HTTP 403; not read | Toyota | n/a | HTML | Blocked | Unknown | **E** (commercial app content; unread) |
| T30 | `karsonmadden/us-vehicle-trouble-codes` (Hugging Face) | "karsonmadden"; compiled by "WhichTrim" | **CC BY 4.0** [high on page] | 1,142 codes; columns: code, defined_by, meaning, bulletins, owner_reports, documents, model_years, components, page; from NHTSA bulk files; nightly regeneration | 1,142 rows | JSON/CSV (`dtc.json` named) | Open dataset | Only 119 of 1,142 rows (10.4%) carry a meaning, per the page [high]; no make column exists, so Toyota share cannot be read from it | **X** after audit; ingest of facts only |
| T31 | `Wal33D/dtc-database` | Wal33D | MIT label [high]; origin undocumented | "33 manufacturers"; page figures disagree (28,220+ claimed vs 18,805 snapshot rows, of which 9,415 generic and 9,390 manufacturer; 12,128 unique codes; 33 manufacturers excluding generic); no Toyota count shown | 37 source-data files | SQLite + text source | open | Provenance unknown; prior note flagged copied-looking text | **X** (do not ingest) |
| T32 | `peyo/dtc-and-vin-data` | peyo | No licence file seen (prior note); scraper-built | Toyota, Honda, GM P-codes JSON | n/a | JSON, R scripts | open repo | Origin = scraping a third-party site | **E** |
| T33 | `aalih34554-ai/vehicle-dtc-database` | aalih34554-ai | README says "open project-style license unless otherwise stated" and does not name a licence; its tree lists a LICENSE file but the repo root listing showed only data, docs, README.md, so the file is unconfirmed; no sources named; 2 commits | `manufacturer_codes.csv` covers Toyota, Nissan, Hyundai, BMW, Mercedes, Ford, VW; row counts not shown | n/a | CSV | open repo | No provenance | **E** |
| T34 | `MudreaDev/PriusMonitor` (Android app, Romanian UI) | MudreaDev, forked from BETSY (MIT upstream) | README says BETSY's MIT LICENSE and NOTICE are kept; the page states no licence for PriusMonitor's own code and I did not see the files; 0 stars | Toyota hybrid battery and trouble-code scanner over ELM327; Gen 3 decoders; Romanian explanations of "common codes"; reads, does not clear | 122 commits | Source code | open | Reference for decoding approach; text origin unstated | **X** (code reading only; check licence before reuse; do not take Romanian text) |
| T35 | `alrighdee/BETSY` (named as upstream of T34) | Not opened | MIT per T34 page | Prius battery monitor | n/a | Source | n/a | Not read | **X** (not opened) |
| T36 | Other small repos seen in search results: `sathya1495/obd2-dtc-database` (JSON, 60 codes), `xinings/DTC-Database` (XML/JSON), `lucasveneno/dtc` | Individuals | Licence not confirmed | Generic or mixed | tiny | JSON/XML | open | Unknown | **X** only if licence verified; not opened |
| T37 | commaai/opendbc, OBDb Toyota repos, OBDex | Various | See prior note (MIT / CC-BY-SA / CC0) | Signals; generic codes | n/a | files | open | Good | Already decided in prior note; not repeated |
| T38 | Wikipedia (On-board diagnostics; OBD-II PIDs) | Wikimedia | CC BY-SA 4.0 (standard) | Structure only; no per-Toyota-code table | n/a | HTML | API/robots allow polite use | Structure only | **X** for structure; not for meanings (SA) |
| T39 | Toyota Tech Tip T-TT-0303-14, TOYOTAtech bulletin T-SB-0153-13 (as quoted by secondary pages) | Toyota | OEM copyright; I did not open the originals | Gen 1/2 Prius P3000/123; P0A80 and cooling fan debris | 1 doc each | PDF | n/a | Authoritative but only reached via summaries | **M** (find original on NHTSA host if present; otherwise leave) |
| T40 | `automotivetechinfo.com` "Diagnosing Prius Hybrid Battery Pack" | Not identified | Fetch returned only a Toyota logo graphic; the URL does not match the title | n/a | n/a | PDF | n/a | The file I opened is not the document its title suggests | **E** (unverified) |
| T41 | Hybrid-battery shops and parts sellers: `thehybridgeek.happyfox.com` KB, `greenbeanbattery.com/hybrid-vehicle-error-codes`, `go-parts.com/garage/obd-*` | Commercial sellers | Promotional; terms unread | P3000, P3011 to P30xx, P0A80 for Prius/Camry/Prius V | Many pages | HTML | Not read | Marketing text; contradicts Toyota-derived material in places (per prior note) | **X** (existence/model coverage only) |
| T42 | Toyota Europe independent-operator portal `toyota-tech.eu` | Toyota Motor Europe | Registration; fee figures from search summary only | EU models | n/a | login | n/a | Authoritative | **E** (paid; not fetched) |

Total rows: 42. Of these, **ingest (facts)** is only T01 (as an index); the rest are cross-check, manual read, or excluded.

---

## 3. Sources, in detail (only what is new or changes a decision)

### 3.1 Government and regulator sources

#### T01 NHTSA manufacturer-communications file
- **URL:** dataset page `https://data.transportation.gov/d/hczg-qbhf`; catalog record `https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-technical-service-bulletins-system-tsbs-downloa`; field description `https://static.nhtsa.gov/odi/ffdd/tsbs/TSBS.txt`; legacy bulk path `http://www-odi.nhtsa.dot.gov/downloads/folders/TSBS/FLAT_TSBS.zip`.
- **Owner:** US DOT, NHTSA Office of Defects Investigation.
- **Licence:** data.gov: rights "public", access "public", no specific licence [high]. A separate harvest record was reported (search result only) to carry `usa.gov/publicdomain/label/1.0` [low; not seen when the data.gov page was re-read, and it is third-party, not NHTSA]. I found no NHTSA terms page for this file. Treat the file's metadata as public and the underlying bulletin text as OEM-owned.
- **Format and fields (read this run [high]):** CSV (small column set: document id, make, model, model year, concise summary) and TSV "flat file" with 14 fields: NHTSA ID, replacement bulletin number (deprecated), date added, TSB/Document ID, communication date, internal campaign/software id, communication type, make, model, model year, NHTSA components (up to 5), manufacturer component system, subsystem, summary (up to 4,000 chars, extended starting 2024-06-26). Model year 9999 means unknown. Files split in 5-year chunks by NHTSA receipt date. The file was renamed from TSBS.txt to MfrComms.txt in 2024. One record per bulletin per multi-valued element (5 products x 3 components = 15 rows).
- **Quirk to remember:** the field table lists fields 12 and 13 as 516 characters, while the 2026-09-15 change-log entry says they were changed to 512 (from 256). The rename to MfrComms.txt is dated 2024-05-13 in the change log [high, re-read]. Confirm before writing a parser.
- **Coverage:** all makes; "does not contain all bulletins"; recall bulletins mostly excluded [high].
- **Size:** not shown on the pages I read. Count Toyota/Lexus/Scion rows after download (not done this run).
- **How to cite:** "NHTSA, Manufacturer Communications (TSB) flat file, retrieved <date>, bulletin id <id>." Store NHTSA ID and bulletin id, never summary text.
- **Access rules:** download is the intended route. `https://www.nhtsa.gov/robots.txt` returned 403 to my fetcher, so crawl rules are **unknown**; use one bulk download, no scraping of the site.
- **Quality:** good index; summaries sometimes name DTCs in the text. Searching summaries for `P[0-3][0-9A-F]{3}` and `[BCU][0-3][0-9A-F]{3}` with make in (TOYOTA, LEXUS, SCION) yields the bulletin list.
- **Verdict: ingest (index only, facts: bulletin id, model-year range, component, DTC identifier mentioned).**

#### T02 Individual bulletin PDFs on `static.nhtsa.gov`
- Pattern `https://static.nhtsa.gov/odi/tsbs/<year>/MC-<number>-<seq>.pdf` (MC = manufacturer communication; `SB-` prefix also seen). Examples named by search: 2014 `MC-10061270-2273.pdf`, 2015 `MC-10132527-9999.pdf`, 2016 `SB-10092981-5448.pdf`, 2023 `MC-10241404-9999.pdf` and `MC-10247829-9999.pdf` [medium].
- Opened this run: two PDFs returned only metadata. `MC-10132527-9999` (89 KB, one page, Word-made, created 2015-08-12, title "CONDITION"); `MC-10061270-2273` (180 KB, scanned with OCR plug-in, created 2016-03-09). Neither yielded readable DTC text through my tool. **So I cannot say which Toyota models or codes they cover** (search summary says the first relates to Prius hybrid battery topics [low]).
- Owner: Toyota is the author; NHTSA only hosts. No copyright notice found in readable metadata. No reuse licence.
- Access: same as T01.
- Quality: mixed; scans and OCR defeat text search. This is the single most authoritative public Toyota DTC-adjacent material and it is free to read.
- **Verdict: manual read, record facts (code exists, model/year applicability, remedy class), write our own sentence. Never paste.**

#### T03 NHTSA recalls API and complaints
- NHTSA documents a recalls API (`api.nhtsa.gov/recalls/recallsByVehicle?make=...&model=...&modelYear=...`) and vPIC VIN API [medium, from search results; I did not open the datasets page]. No DTC field. Complaints are consumer narratives.
- Use: only to rank how often a symptom appears per model, never to author text.
- **Verdict: cross-check.**

#### Not found
- **EPA / CARB / Transport Canada / UK DVSA / EU:** no regulator-hosted per-code Toyota list located this run. 40 CFR 86.1808-01 (read in prior note) obliges OEMs to *make* emissions-related DTC information available at a price, not to publish it free [high there].
- **Academic:** I searched for Prius or Toyota DTC datasets in academic/lab data and found none in the results (Argonne-style dynamometer data was not searched specifically). **[gap]**

### 3.2 Toyota and Lexus official public material

#### T04 TIS
Already covered. New one-line note: Standard tier content list (from prior note) names "technical information library"; whether it includes DTC procedures remains unverified. Verdict stays **excluded for ingest; tainted-reader rule applies**.

#### T05 to T10 Owner's manuals
- **US host seen in search results:** `https://assets.sia.toyota.com/publications/en/om-s/<OM id>/pdf/<OM id>.pdf` (examples named by search: OM0E233U, OM06246U, OM0E149U, OM76412U for a Lexus model) [medium]. Toyota's own short guides point to `www.toyota.com/owners` and say updated versions are viewable by model and year or via the Toyota app; printed copies from dealers or Helm (helminc.com) [medium, search summary].
- **Canada:** `https://www.toyota.ca/content/dam/toyota/documents/manuals/en/<OM id>/<OM id>.pdf` [medium].
- **Australia:** `https://www.toyota.com.au/owners/manuals` ("Browse vehicle manuals") [medium]. **UK:** `https://toyota.co.uk/owners/vehicle-information` (read online or download) [medium]. **Ireland:** FAQ states free PDF download [medium]. **Europe:** `https://myportalcontent.toyota-europe.com/Manuals/toyota/...` (example: ProAce) [medium].
- **Contents (search-summary level):** each full manual has a "warning lights and indicators" chapter and a troubleshooting chapter "if a warning light turns on or a warning buzzer sounds" and "if a warning message is displayed"; page numbers vary by model [medium]. No evidence that a manual lists fault codes. I did not open one.
- **Licence:** OEM copyright; no reuse licence found. Not open content.
- **Access:** I could not read `robots.txt` (HTTP 403 for toyota.com and assets.sia.toyota.com). Treat as human-read only.
- **Cite as:** "Toyota Motor Sales, Owner's Manual <model> <year>, doc OM<id>, section <name>, page <n>."
- **Use:** what the driver sees (which light, what message, what to do) for our plain-English "what you see" line; not a source of manufacturer codes. **Verdict: manual read only.**

#### T09 Lexus warning-lights page
Appeared in search results; my fetch returned HTTP 403. Search summary says it lists common lights and defers to the owner's manual [medium]. **Verdict: manual read.**

#### T42 Toyota Europe portal
Registration and fees only from search summary (prior note). Not fetched. **Excluded.**

### 3.3 Forums and communities (facts only, rewritten later)

General rules for every forum row:
- Posts are the author's copyright; a forum licence normally grants the site, not us. None of the forums I touched offered an open licence [none seen].
- Many posts re-type Toyota repair-manual text. Copying them copies Toyota's text with a forum in between.
- We may read a thread to learn that a code exists, which model/year it shows up on, and what practitioners say fixed it, then write our own sentence with a `source_class: community_report` tag at confidence `low`.

#### T11 PriusChat "ECU Diagnostic Codes"
- URL: `https://priuschat.com/threads/ecu-diagnostic-codes.31394`. Forum: PriusChat, Gen 2 (2004-2009) section, under Toyota Prius Service Bulletins - TSBs. Opening post 2007-04-26 by "PriusLove"; one post, one like [high].
- Contains: Hybrid Vehicle ECU DTCs and three-digit information codes (101 to 352). Stated sources: Toyota repair manual, Hybrid Vehicle Control System chapter, pages DI-199 to DI-205, and a link to ECRoSTech [high]. Says information codes need the Toyota Hand-Held Tester and cannot be read with a standard scan tool or the Prius Mini-Scanner [high on the post's claim].
- DTCs listed: B2799, C2692, C2693, P1120, P1520, P1566, P1600, P1780, P3000, P3001, P3004, P3100, P3101, P3105 to P3110, P3115, P3120, P3125, P3130, P3135, P3140, P3145 [high].
- Terms: PriusChat robots file allows `*` but blocks AI crawlers by name and signals `ai-train=no`, `use=reference` [high]. Site ToS not read.
- **Verdict: cross-check / manual read.** Value to us: shows the parent-code plus information-code shape and that Gen 1/2 info codes need a Toyota tool. Do not republish the table.

#### T12 ECRoSTech HV ECU page
- URL: `https://ecrostech.com/prius/GenInfo/DTCs/HVECU.htm`. Owner: Graham Davies; footer copyright 2003; "no liability accepted" [high]. ~26 DTCs, ~252 information codes (re-count on a second fetch; the earlier ~251 was off by one) [medium]. Cites repair manual DI-199 to DI-205 and the THHT.
- Verdict: **cross-check (existence).** Reuse not granted.

#### T13 PriusChat practitioner threads
- Threads surfaced by search (all unopened beyond summaries): "Code P3000 and P0A84", "P3000 DTC Code in Techstream History", "How to read p3000 sub code", "Does Torque Pro read P3000?", "Explain these battery codes for me" (thread 259704), "P0A80 Code- but is it really the hybrid battery", "Meaning of DTC P30001, P30002, P30003, P3006 for 2003 Prius" [medium].
- Facts gathered from summaries [medium]: Toyota guidance for 2001 to 2009 Prius says the P3000/123 combination should not be diagnosed directly; diagnose the HV Battery ECU's own DTCs; information codes 125, 388, 389, 603 each have a repair-manual procedure. P0A80 can have causes other than a failed pack (cooling-fan debris per a Toyota bulletin quoted second-hand; weak 12 V battery per users). Drive-cycle behaviour for permanent codes reported by one user [low].
- **Verdict: manual read.** Highest value per minute for the hybrid slice, because it records which fixes actually worked. Quote nothing.

#### T15, T16, T17, T18 ClubLexus
- Platform owned by Internet Brands (footer: MH Sub I, LLC dba Internet Brands, 2026). Terms hosted on internetbrands.com, not read.
- robots: blocks GPTBot and GoogleOther; bingbot crawl-delay 1 s, Applebot 5 s; disallows `/forums/search.php`, `/forums/members/`, `/forums/printthread.php`, `/forums/login.php`, `/forums/tags.php`, `/forums/post_thanks.php`, `/forums/subscription.php`, `/forums/sendmessage.php`, `/articles/misc/`, and `*/attachments/*dl` [high].
- Master list thread: 1 post by "labrealiv", 2008-03-06, OBD-I 1 to 85 and P0100 to P1780, names no model, links troublecodes.net/Toyota/ as origin, and the poster asked moderators whether sharing violates copyright [high].
- Attachment PDF (SC430 thread) and the RX 1st-gen "includes all trouble codes" thread: not opened; attachment downloads are disallowed for crawlers.
- **Verdict:** list thread **cross-check**; attachments **excluded**; other threads **manual read**.

#### T19 IH8MUD "200 Series Error Codes"
- `https://forum.ih8mud.com/threads/200-series-error-codes.259012/`, started 2008-12-29 by dtt255; 2 pages; page 1 read (20 posts through 2021-03-17) [high].
- Contains: diesel "ECD system" DTC list with spans from P00AF to P2589, a generic Toyota P1100 to P1780 selection, replies that point to obd-codes.com, and an uploaded "200 DTC.pdf" for an '08 Land Cruiser and '14 Lexus GX with trouble-area and MIL columns (P0010 to P050B span) [high].
- **Verdict:** thread **cross-check** (confirms the 200 Series diesel DTC families exist); the PDF is **excluded** (likely derived from Toyota manuals).

#### T20, T21 Tacoma World, Toyota Owners Club
Both surfaced by search; I read only the snippets. Tacoma World thread says a fault sheet stops at P1780 and the poster asks about newer Toyota codes [medium]. **Manual read, not opened.**

#### T22 SupraMKV (GR Supra A90, Supra 2019+)
- Threads read as search summaries: DTC-style hex codes such as 16050A (crankcase ventilation leak) and 130716 (VANOS/cam fault) appear [medium]. This matches BMW-style codes because the A90 is built on BMW powertrain and electronics; see `docs/research/deep2/dtc-bmw-coverage.md` and `bmw-g-series-coding-reality.md` for the BMW format question. **[medium: the link of A90 to BMW code format is background knowledge confirmed only by these code shapes]**
- No consolidated Supra DTC list exists on the forum per the search summary.
- **Verdict: manual read, cross-linked to the BMW track; the A90 is a BMW-code problem, not a Toyota-code problem.**

#### T23 GR86 / BRZ forums
Named by a search answer only; I did not open GR86 Forum, FT86Club or r/GR86. The FA24 platform is Subaru-built, so codes may follow Subaru conventions (background, [low]). **Not researched; gap.**

#### Other forums not researched
Toyota Nation, Tacoma World master lists, Lexus forums beyond ClubLexus, 4Runner.org, Land Cruiser forums beyond IH8MUD, Corolla/Camry/RAV4 forums, Reddit r/Prius, r/Toyota, r/Lexus, Scion-focused forums. **[gap; not searched individually].**

### 3.4 Reference and DIY websites

#### T24 troublecodes.net/Toyota
- Owner: "TroubleCodes.net, by BAT Auto" (links batauto.com). Contents: OBD-I table 45 descriptions across 40 numbers (1 to 14, 21 to 28, 31 to 35, 41 to 43, 51 to 54, 71, 72, 78, 81 to 85), 95 generic P-codes P0100 to P1780, engine-code tables (42 entries 1986 to 1995; ~71 entries 1993 to 2009), jumper and flash-reading procedures, ~103 comments [high].
- Terms: no terms or copyright notice visible; accuracy disclaimer only. Source of lists not stated. No notice does not mean permission.
- **Verdict: cross-check (existence); do not copy.** OBD-I flash codes are out of scope for an adapter tool anyway.

#### T25 obd-codes.com
- "All information on this site is copyright protected" [high]. Toyota page lists 41 Toyota-specific P1100 to P1780 [high]. No automated-access rule seen on the page [high that none was visible].
- **Verdict: cross-check by a human; no bulk read.**

#### T26 iATN DTC index
- `https://www.iatn.net/techmail/summaries/2025/05/index-dtc.html`. Monthly list for May 2025; Toyota shown on 13 distinct codes: U0100, P0010, P0013, P0037, P0301 to P0305, P0328, P060D, P060E, P1604 [high, re-read]. The earlier "31 codes in the month" figure was not re-confirmed. Footer copyright 1995-2025 iATN; Terms of Use linked, not read (membership model is inference).
- Value: tells us what real technicians ask about, per make. Counts are tiny (1 to 2 per code).
- **Verdict: cross-check (frequency signal only).**

#### T27 to T29 Commercial references
MotorData, MOTOR, OBDeleven: see prior note. New: the MOTOR product description PDF (`motor.com/wp-content/uploads/2025/10/MOTOR_DiagnosticTroubleCodes.pdf`) exists and describes XML/JSON/BSON web services; licensing via sales [medium, search summary]. Not opened. **Excluded.**

#### T41 Hybrid-battery shops and parts sellers
- The Hybrid Geek knowledge base, Green Bean Battery, and go-parts "garage" pages cover P3000, P3011 to P30xx and P0A80 for Prius, Prius V and Camry Hybrid [medium].
- Terms unread; promotional; prior note found them in conflict with Toyota-derived material on the P3000-sub-code idea.
- **Verdict: cross-check for "does this code appear on this model" only.**

### 3.5 Open data and open source (new since the prior note)

#### T30 `karsonmadden/us-vehicle-trouble-codes`
- URL: `https://huggingface.co/datasets/karsonmadden/us-vehicle-trouble-codes`. Licence CC BY 4.0 [high]. 1,142 rows, nine columns (`code`, `defined_by`, `meaning`, `bulletins`, `owner_reports`, `documents`, `model_years`, `components`, `page`) [high]. Provenance statement: compiled by WhichTrim from NHTSA public bulk files (recall campaigns, manufacturer communications, owner complaints); "nothing is hand-edited"; regenerated nightly; `generated_at` field in `dtc.json` [high on the page's text].
- Unknowns: Toyota/Lexus share (no make column exists; confirmed), accuracy, whether `meaning` is OEM wording, who WhichTrim is. A web search for it found no independent record [medium].
- Risk: a CC BY label on a derivative of OEM bulletins does not clear OEM copyright. Treat `meaning` like any third-party text.
- **Verdict: cross-check after a 50-row audit** (check whether `bulletins` ids resolve in T01; check Toyota rows count). If audit passes, ingest `code`, `model_years`, `components`, bulletin ids as facts into the CC0 `facts` pack and discard `meaning`.

#### T31 Wal33D/dtc-database
MIT label. The README gives inconsistent figures (28,220+ claimed vs a snapshot of 18,805 rows: 9,415 generic, 9,390 manufacturer, 12,128 unique codes; the claim looks double-counted). 33 manufacturers (excluding generic) in the snapshot; Toyota count not shown. Data held as 37 text files with no named external sources [high]. Prior strategy already classes it cross-check. **Unchanged.**

#### T32, T33 peyo and aalih34554
- peyo: no licence found (prior note); built by a scraper (author links an obd-scraper repo [medium]). **Excluded.**
- aalih34554-ai: README says "open project-style license unless otherwise stated", the README lists a LICENSE file but the root listing did not show one (unconfirmed), no provenance, 2 commits. Prior strategy already puts it in Rung C. **Excluded.**

#### T34 PriusMonitor (and upstream BETSY)
- `https://github.com/MudreaDev/PriusMonitor`: Android, over ELM327, reads Toyota hybrid battery data and trouble codes, does not clear; Gen 3 decoders following BETSY; Romanian UI/explanations; 122 commits; 0 stars, 0 forks; the README says LICENSE and NOTICE are kept and names only BETSY's MIT licence; files not opened [high on what the page says].
- Value: a worked example of how a free tool reads Gen 3 hybrid data over a plain adapter; helps our capture design. Not a DTC text source (Romanian, origin unstated).
- **Verdict: cross-check (decoder logic only); check licence file before any code reuse.**

#### T36 small repos
`sathya1495/obd2-dtc-database` (60 JSON codes, licence unconfirmed), `xinings/DTC-Database` (XML/JSON, CSV planned), `lucasveneno/dtc` (a service architecture). Not opened. **Cross-check candidates only if licence verified; low value.**

#### Already decided (do not redo)
OBDex (CC0 generic), OBDb (CC-BY-SA signals), opendbc (MIT), todrobbins/dtcdb (MIT, generic). See prior notes.

### 3.6 Excluded, with reasons

| Item | Reason |
|---|---|
| Scribd "Techstream Part 2" (`scribd.com/document/516526338/...`) | Uploaded copy of a tool manual; uploader rights unknown; paywalled platform |
| SlideShare "Toyota / Lexus PIDs from al tech page" and `alflash.com.ua/OBDII/PIDs.pdf` | Uploads/mirrors of a Russian tech page of Toyota PIDs; origin and rights unknown; PIDs not DTCs |
| `autoscaners.ru/.../toyota-non-usa-coverage...pdf` | Commercial scan-tool coverage sheet; vendor property; coverage claims, not code meanings |
| PriusChat and ClubLexus attachments of Toyota material | Third-party copies of OEM documents; attachment downloads disallowed (ClubLexus robots) |
| Google Groups pages titled "Toyota Obd2 Fault Codes List", "Toyota Fault Codes List Obd1" | Search-engine-spam style posts (the search tool flagged these as spam-like); no owner |
| Netlify and geocities-style pages of Toyota codes (`foxtutor323.netlify.app`, `geocities.ws/dtmcbride/...`) | Anonymous or abandoned copies; origin unknown |
| Toyota TIS, Techstream exports, Toyota Europe portal | Paid; no redistribution |
| MOTOR data, MotorData, OBDeleven lists | Commercial; scraping and copying not allowed |
| peyo, aalih34554 datasets | No clear licence; scraper-built or no provenance |
| `automotivetechinfo.com/.../Diagnosing-Prius-Hybrid-Battery-Pack.pdf` | The file I opened is a Toyota logo graphic, not the titled document; do not cite |

---

## 4. How to cite and record (per verdict)

| Verdict | Citation shape | What goes in `SOURCES.md` |
|---|---|---|
| Ingest (index) | NHTSA manufacturer-communications file, retrieved date, bulletin id | Dataset row, licence "public (no licence stated)", what taken: ids, model-years, components, DTC identifiers; nothing else |
| Cross-check | "Checked against <name>, <date>; not copied" | Row with "no text taken"; local overlap hash only |
| Manual read | Bulletin id or manual doc id and page; forum thread URL and post date | Row per source; per-entry source tag `community_report` or `public_bulletin_lead` |
| Excluded | Not cited | One line in the exclusions list so nobody reintroduces it |

Per-entry source classes (from the prior note): `public_standard`, `public_bulletin_lead`, `owner_manual`, `community_report`, `own_capture`.

---

## 5. Access rules summary (automated reading)

| Host | What I read | Result |
|---|---|---|
| priuschat.com | robots.txt | `*` allowed; 32 named agents (including ClaudeBot, anthropic-ai, GPTBot, CCBot, Google-Extended, Diffbot, Bytespider) fully disallowed; `ai-train=no`, `search=yes`, `use=reference`; no crawl-delay [high] |
| clublexus.com | robots.txt | GPTBot and GoogleOther blocked; search, members, print, tags, login, attachment-download paths disallowed; bingbot 1 s, Applebot 5 s [high] |
| nhtsa.gov | robots.txt | HTTP 403 to my fetcher; unknown |
| toyota.com, assets.sia.toyota.com | robots.txt | HTTP 403; unknown |
| techinfo.toyota.com | Page (prior note) | Login; Terms of Use not read |
| obd-codes.com | Page footer | "All information ... copyright protected"; no automation rule seen |
| troublecodes.net | Page | No terms visible; no automation rule seen |
| iatn.net | Page | Terms of Use linked in footer, not read; no automation rule seen |
| huggingface.co (T30) | Page | CC BY 4.0; ordinary dataset download |
| github.com (T34 etc.) | Repo pages | Standard; per-repo licence must be read from the LICENSE file |

Rule for the project: no crawler against any forum or reference site above. Humans read; we record facts and our own words. Bulk reads are limited to NHTSA's published download and open datasets with a verified licence.

---

## 6. Gaps (what I could not verify)

Status: **PARTIAL.**

1. **No bulletin text read.** Both NHTSA PDFs opened returned metadata only (one single page titled "CONDITION"; one scanned file). I cannot say which Toyota codes or models either covers. The Toyota Tech Tip T-TT-0303-14 and bulletin T-SB-0153-13 are known only through second-hand summaries.
2. **NHTSA terms and robots.** `nhtsa.gov/robots.txt` returned HTTP 403. No NHTSA terms-of-use text for the TSB file was found. The public-domain label came from a search result about a third-party catalogue and was not visible on the data.gov page when re-read.
3. **Toyota/Lexus/Scion row counts in the TSB file** not measured (ZIP not downloaded; downloads need owner approval with filename, source, size).
4. **Owner's manuals not opened.** I did not verify whether any manual contains code tables, nor Lexus-specific hosting or terms. toyota.com and assets.sia.toyota.com robots returned 403.
5. **Lexus pages** (`lexus.com/My-Lexus/resources/warning-lights`, owners.lexus.com) returned 403 or did not surface; Lexus-specific forums other than ClubLexus not searched.
6. **Forums not researched:** Toyota Nation, Tacoma World lists (only a snippet), 4Runner.org, GR86 Forum, FT86Club, Reddit communities, Scion forums, Toyota Owners Club (snippet only). No forum Terms of Service text was read for any site (ClubLexus ToS lives on internetbrands.com; PriusChat ToS not found).
7. **PriusWiki or other Toyota wikis:** searches did not surface a wiki with a Toyota DTC table. I did not check Fandom or MediaWiki-based car wikis directly.
8. **Academic/government research datasets** (Argonne, NREL, SAE papers, arXiv) not searched for Toyota DTC content.
9. **Non-US:** Toyota Europe, Australia, Japan DTC content and licence terms not verified. Right-hand-drive and JDM codes (Toyota Techstream "Generic OBD" in Japan) not covered.
10. **GitHub repository search** was done through the general web search only; `gh` has a known bad token (prior note). A systematic repo/topic search remains to be done once the token is fixed.
11. **T30 dataset not downloaded:** I do not know its Toyota rows (no make column), its accuracy, or what WhichTrim is. No independent confirmation found.
12. **T34/T35 licences:** PriusMonitor's own licence is unstated on the page and its LICENSE/NOTICE files were not opened; BETSY not opened.
13. **Hybrid structure still unconfirmed from a Toyota original.** Gen 1 and 2 information-code behaviour is supported by Toyota-derived forum copies (T11, T12) and quotes of a Toyota tip (T39); Gen 3/4 INF tables not found.
14. **Scion:** no Scion-specific source found; assumed to follow Toyota platform sharing (iQ, FR-S, tC, xB, xD). FR-S shares the Subaru-built FA20; unverified.
15. **Counts in this note** come from summarising fetchers; ECRoSTech's "26 DTCs / ~252 information codes" and the ClubLexus and troublecodes.net entry counts are approximate.
16. **Legal:** none of the verdicts is legal advice; the question of whether recording a code's existence and applicability from an OEM bulletin is safe stays in the counsel hour.

## 7. Next actions

1. Get approval, then download the NHTSA TSB zip (name `FLAT_TSBS.zip` or the 2024+ `MfrComms` files; size unknown) into an empty folder; count Toyota/Lexus/Scion rows; regex for DTC identifiers; keep ids only.
2. Audit 50 random rows of `karsonmadden/us-vehicle-trouble-codes` against T01 bulletin ids; count Toyota rows.
3. Open the three or four most relevant NHTSA hybrid bulletins in a PDF reader (not through a summariser) and record facts (code, model-year, remedy class).
4. Read one current Prius and one Lexus RX/NX owner's manual warning chapter by hand; note what the driver sees.
5. Read ClubLexus (internetbrands.com) and PriusChat terms of use; add to ledger.
6. Add `gh` repo searches ("toyota dtc", "prius battery obd", "techstream open") after the token is fixed.
7. Search the forums listed in gap 6, human reading only.

## 8. Sources (URLs actually used this run)

- https://data.transportation.gov/d/hczg-qbhf (via catalog) and https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-technical-service-bulletins-system-tsbs-downloa
- https://static.nhtsa.gov/odi/ffdd/tsbs/TSBS.txt
- https://static.nhtsa.gov/odi/tsbs/2015/MC-10132527-9999.pdf ; https://static.nhtsa.gov/odi/tsbs/2014/MC-10061270-2273.pdf
- https://www.nhtsa.gov/robots.txt (403) ; https://www.nhtsa.gov/node/102181 (403)
- https://priuschat.com/threads/ecu-diagnostic-codes.31394 ; https://www.priuschat.com/robots.txt
- https://ecrostech.com/prius/GenInfo/DTCs/HVECU.htm
- https://www.clublexus.com/forums/maintenance/340604-master-list-of-cel-trouble-codes.html ; https://www.clublexus.com/robots.txt
- https://forum.ih8mud.com/threads/200-series-error-codes.259012/
- https://www.troublecodes.net/Toyota/ ; https://www.obd-codes.com/trouble_codes/toyota/
- https://www.iatn.net/techmail/summaries/2025/05/index-dtc.html
- https://huggingface.co/datasets/karsonmadden/us-vehicle-trouble-codes
- https://github.com/Wal33D/dtc-database ; https://github.com/MudreaDev/PriusMonitor ; https://github.com/aalih34554-ai/vehicle-dtc-database
- https://www.toyota.com/robots.txt (403) ; https://assets.sia.toyota.com/robots.txt (403) ; https://www.lexus.com/My-Lexus/resources/warning-lights (403)
- https://automotivetechinfo.com/wp-content/uploads/2022/05/Diagnosing-Prius-Hybrid-Battery-Pack.pdf (logo file only)
- Search-result-only (not opened): toyota.com.au/owners/manuals, toyota.co.uk/owners/vehicle-information, myportalcontent.toyota-europe.com/Manuals/..., toyota.ca manual PDFs, tacomaworld.com/threads/free-pdf-fault-code-sheet-help-needed.101567, toyotaownersclub.com/forums/topic/43814-list-of-obdii-fault-codes, supramkv.com threads 35160, 13360, 25246, thehybridgeek.happyfox.com articles 13 and 14, greenbeanbattery.com/hybrid-vehicle-error-codes, go-parts.com/garage pages, motor.com DTC product page and PDF.
