# Open datasets and apps that hold fault-code meanings: licence, provenance risk, verdicts

Research run: 2026-11-20. Status: **PARTIAL** (see Gaps: Kaggle pages not readable, GitHub search API limited to 10 calls per minute and 60 per hour, Mendeley licence not read, no authenticated search anywhere). Not legal advice.

Extends, does not repeat: `docs/plan/dtc-coverage-strategy.md`, `docs/plan/data-strategy.md`, `docs/research/deep2/dtc-open-generic-datasets.md` (the 22-row scoreboard there is the baseline), `docs/research/deep2/dtc-crowd-curation-model.md`, and the three brand notes (`dtc-bmw-coverage.md`, `dtc-mercedes-coverage.md`, `dtc-toyota-lexus-coverage.md`). Rows that already exist in the generic-datasets note are only re-checked here if something changed or I could add a fact. New rows are marked **NEW**.

Confidence tags: **high** = read on the primary page, file or API in this run; **medium** = search snippet or secondary page; **low** = inference. Records marked "(measured)" are counts I computed from fetched files. No fault text is reproduced in this note. Fetched files were read as data in a scratch folder; no code from them was run.

---

## 1. Executive summary

- **The answer is the same as before, now with more evidence: there is no open dataset of manufacturer fault-code meanings that we can legally ingest.** I searched GitHub, GitLab, Hugging Face, Zenodo, arXiv, OpenAlex and (partly) Kaggle and Mendeley. The only fully clean open data is still generic: OBDex (CC0), plus the NHTSA-derived index below that links codes to bulletins but carries meanings for only 10% of rows (high).
- **One new useful find: karsonmadden / WhichTrim "US vehicle diagnostic trouble codes".** CC BY 4.0, 1,142 codes (778 P, 147 U, 131 B, 86 C), built from NHTSA public bulk files, with counts of bulletin and owner-complaint mentions per code. Only 119 rows (10.4%) have a meaning. It is an index of where codes occur in real bulletins, not a dictionary. Verdict: ingest the **index facts only** (which codes appear, how often, which model years and components). Rated medium risk because the licence is an aggregator's claim over government data and the 119 meanings have no stated source (high, read in this run).
- **The biggest manufacturer-code sets are a mirror chain with no licence and a self-described "proprietary" label.** GitLab `GhostTypes/dtc-codes` (created 2026-11-20, no licence, 0 stars) lists 31,272 codes across 10 makes, BMW 4,781, VW 9,137, GM 5,325. Its README badges point to a GitHub project `MCDxAI/open-source-dtc-databases`, which now returns "not found". GitHub `Automotive-9/dtc-codes` (created 2025-06-07, no licence, pushed 2026-11-20) has the same shape. The BMW file's keys start with bare four-digit hex-style numbers (0001, 0002 ...) and lines of up to 1,047 characters (measured). Rated **critical** (our rating from the signals in section 5, not a finding by anyone else): do not ingest, do not open in a drafting session.
- **A new VAG repo (riz4d/OpenVAG, MIT) claims 995 codes and 1,103 fault variants with symptoms, causes and solutions, but ships no data file and names no source.** Its repo holds only a schema and docs (file list re-checked: the db folder has README.md and schema.sql only). Its structure (variant per code, component letters G/N/J, "special notes" with TSB references) looks like a repair-manual layout, so I rate it **high** risk. Created and last pushed 2026-06-27, 1 star (high).
- **Several "AI datasets" on Hugging Face are scraped or generated and carry licences nobody can back.** Examples: RRK1987/automotive-diagnostics-v2 (MIT, "built from real internet sources using automated text parsing"), jigneshk5/dtc_codes (no card, no licence, tiny), Epitech/obd-codes-fine-tune (no licence). Rated **high** to **critical**.
- **The pattern that holds across every open project: a licence label states what the uploader allows, not where the words came from.** Only OBDex states a review method and a ban on copying; the OBD Codes List files are an attribution-licensed copy of generic standard names (high).
- **Academic datasets: none contains manufacturer fault-code meanings.** The nearest real-world data (BiCarFormer, 22,137 error codes, 360 patterns) is a proprietary fleet set that the paper does not release (high that no release link exists in the PDF text I searched). The open Zenodo and HF hits are tutorials, sensor logs, or flowchart data.
- **What this means for OpenDiag:** our manufacturer layer still has to come from captures, public OEM documents and community reports, written in our own words (matches `dtc-coverage-strategy.md`). New work this note supports: (1) add the NHTSA-derived index as a prioritisation list (which manufacturer codes appear in real US bulletins); (2) add the mirror-chain files to the "never load" fingerprint list; (3) keep OBDex as the only cross-check for generic text.

Headline numbers: 25 table rows (plus one grouped row of earlier finds); ingest 1 (as index only); cross-check 4; manual-read-only 4; excluded 16.

---

## 2. Method and limits

- **GitHub:** unauthenticated REST (search API allows 10 calls per minute here; I used it for 12 queries, then hit 403 on the 13th), raw file reads for LICENSE and README, repo metadata (`license`, `created_at`, `pushed_at`, stars). Licence is taken from the LICENSE file or README where I could read it; GitHub's badge is noted only as a cross-check.
- **GitLab:** public v4 API project search (5 queries), file tree and raw README of the one relevant project, and a count of keys in one data file (no text kept).
- **Hugging Face:** public API search (8 terms), per-dataset API (card, tags, file list, dates) and raw README.
- **Zenodo:** public records API (6 queries), then reading three record pages. No record of a DTC meaning dictionary was found.
- **Academic:** OpenAlex search, arXiv API, PDF text search of one paper. 
- **Kaggle:** the dataset pages are JavaScript pages and returned an empty body to a plain request; the API list endpoint returned nothing without a login. Kaggle facts below come from search snippets and from the dataset owners' own pages on other sites, marked medium.
- **Web fetch tool:** blocked for several domains in this run (GitHub Pages, PyPI); I used direct HTTP requests for those where a public API existed.
- Rate limits and ToS: I did not crawl any website. I fetched one file or one API page per check.
- Today is 2026-11-20. Dates are API dates from this run.

Provenance-risk scale used below:

| Rating | Meaning |
|---|---|
| Low | Stated, checkable, original authorship; licence file read; method documented |
| Medium | Plausibly original or government-derived, but the licence is an aggregator's claim or part of the text is unsourced |
| High | No source statement, or structure and wording that point to a repair manual or commercial tool |
| Critical | Self-labelled proprietary or scraped, no licence, mirrored under several names, or sold commercially elsewhere |

---

## 3. Source table (one row per project)

Verdict key: **ingest** = may go into our packs (facts only, our wording); **cross-check** = read to find gaps and errors, never copy; **manual-read-only** = a person may read it for facts, nothing automated; **excluded** = not used and not loaded.

| # | Project and URL | Owner | Licence (how verified) | Coverage and size | Format | Last activity | Provenance risk | Verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | **NEW** karsonmadden/us-vehicle-trouble-codes, huggingface.co/datasets/karsonmadden/us-vehicle-trouble-codes | WhichTrim (whichtrim.com) | CC BY 4.0 (card and README read); only the DTC and SGO files carry it; their site terms carve out the rest | 1,142 codes P778 U147 B131 C86; 128,336 bulletin mentions; 5,434 owner reports; meaning present on 119 rows (README) | CSV 162 KB, JSON | created and modified 2026-09-22; "regenerated nightly" | Medium | **ingest** (index facts only) |
| 2 | **NEW** CodesList/obd2-codes (HF) and tekseport/obd2-codes (GitHub), site obdcodeslist.com/code-data.html | OBD Codes List (site) | Free incl. commercial with attribution line (site page read); GitHub licence NOASSERTION (API); HF tag cc-by-4.0 (API) | 9,414 generic codes; fields code, description, category, severity; 1.0 MB CSV, 1.6 MB JSON; site says "no signup, no key, no rate limit" | CSV, JSON | 2026-10-06 (repo); file generated 2026-10-12 per site | Medium (site calls them "the short standard name"; whose wording is unstated) | **cross-check** (generic only) |
| 3 | **NEW** riz4d/OpenVAG, github.com/riz4d/OpenVAG | Mohamed Rizad | MIT (LICENSE read) | Claims 995 codes, 1,103 variants, 341 components (README); VAG 5-digit, combined, P, B, C, U formats | SQLite (not in repo), FastAPI | created and pushed 2026-06-27; 1 star | High | **excluded** |
| 4 | **NEW** GhostTypes/dtc-codes (GitLab), gitlab.com/GhostTypes/dtc-codes | GhostTypes | None (API license null) | 31,272 across Alfa Romeo, BMW, Chrysler, Fiat, Ford, GM, Honda, Mitsubishi, Nissan, VW | JSON per make | created 2026-11-20 (API; README on the GitHub twin says the project moved here) | Critical | **excluded** |
| 5 | Automotive-9/dtc-codes (GitHub) | Automotive-9 | None (API license null) | Same README table as row 4 (read); its README says the repo "has moved to GitLab" (row 4) and is no longer updated | JSON | created 2025-06-07, pushed 2026-11-20, 3 stars | Critical | **excluded** |
| 6 | **NEW** AndreyHMkr/ODB2-fault-codes | AndreyHMkr | None | One JSON file `ford_error.json` of 1,934 bytes, Ford P11xx range | JSON | pushed 2026-03-17 | High (no source) | **excluded** |
| 7 | **NEW** lennykean/OBDII.DTC (NuGet) | lennykean | MIT (README states; LICENSE file present) | "Thousands" of generic codes plus a limited set of maker codes (e.g. Honda) as a .NET enum | C# source, NuGet | pushed 2026-10-29; 4 stars | High (no source stated for descriptions) | **cross-check** (code existence only) |
| 8 | **NEW** xinings/DTC-Database | xinings | None | "database of DTC descriptions", size 251 KB | unknown | pushed 2019-03-04; 1 star | High | **excluded** |
| 9 | **NEW** dsoprea/DtcLookup | dsoprea | GPL-2.0 | web page lookup, 292 KB | PHP/JS | pushed 2013-09-09; 12 stars | Medium (old, copyleft) | **excluded** |
| 10 | **NEW** mytrile/obd-trouble-codes | Dimitar Kostov | MIT (API) | Generic codes; README points to obd-codes.com as "more complete" | JSON, CSV, SQLite | single push 2014-05-20; 61 stars | High (README points to obd-codes.com for fuller data; derivation is our inference) | **excluded** |
| 11 | **NEW** phprell/obd-diag (PyPI obd-diag 0.2.2), github.com/phprell/obd-diag | Philipp Prell | MIT; trouble-code texts credited to OBDex (README on PyPI read) | Consumer app, EN and DE; builds its DB with a script from OBDex | Python app | PyPI 0.2.2 | Low (credits CC0 source) | **manual-read-only** (as an example of OBDex reuse) |
| 12 | **NEW** HF fabiovilao/obd2-ptbr | fabiovilao | Tag cc-by-4.0, README empty | Portuguese generic list, JSON with long per-code explanations (first record read: P0001) | JSON | 2025-09-01 | High (translation of unknown origin; long text) | **excluded** |
| 13 | **NEW** HF jigneshk5/dtc_codes | jigneshk5 | None (no card) | Two JSONL files; sample rows are generic P0xxx with short cause and fix | JSONL | 2025-05-24 | High | **excluded** |
| 14 | **NEW** HF RRK1987/automotive-diagnostics-v2 | RRK1987 | MIT tag; README says built from internet text by "automated text parsing" | Under 1,000 chat-format training rows; 8 vehicle variants, 5 templates | Parquet | 2026-07-19 | High (scraped, generated) | **excluded** |
| 15 | **NEW** HF PedroCuisinier2025/OBD2_panel_opel_2012 | PedroCuisinier2025 | cc-by-4.0 tag | 394,406 telemetry rows from an Opel Corsa; no fault text | CSV | 2025-12-06 | Low (own recordings) but not DTC meanings | **excluded** (wrong content) |
| 16 | HF Ichlibitiche/mechanicdb-obd2-repair-sample, MechanicDB-public (GitHub), Kaggle copy | MechanicDB / dataengineered | ODbL v1.0 on sample; full set sold (README: $49 Standard, 9,249 SAE codes; $149 OEM Complete, 15,886 codes). README says definitions originate in SAE J2012/ISO 15031-6 and come from a public MIT-licensed compilation | 90 codes (75 SAE + 15 OEM, 11 makes) | Parquet | HF modified 2026-10-24 | Critical (sold; spine matches Wal33D per prior note) | **excluded** |
| 17 | Wal33D/dtc-database | Wal33D | MIT (per GitHub API; LICENSE read in prior note) | Repo description claims 28,220+ (9,415 generic + 18,805 manufacturer-specific, 33+ brands), unverified; prior note measured 9,415 generic + about 6,650 brand + 2,620 unattributed | SQLite, JSON | created 2025-09-22, pushed 2026-02-16; 64 stars | High | **cross-check** (code existence only) |
| 18 | foerbsnavi/OBDex | foerbsnavi | CC0-1.0 data (LICENSE-DATA) and MIT code (LICENSE-CODE), per README badges; GitHub API shows NOASSERTION because there are two licence files | 9,533 generic codes, EN and DE; README claims every code reviewed with at least two sources (self-reported, not independently checked) | JSON | created 2026-05-01, pushed 2026-11-07 | Low to medium (self-reported review) | **cross-check** (generic) |
| 19 | hoffman1938/bimmercode | hoffman1938 | None (API license null) | "Multilingual BMW DTC database" | not read | created 2026-01-14, pushed 2026-08-13; 9 stars | High | **excluded** |
| 20 | Zenodo 10.5281/zenodo.15626055 "Automotive Faults Dataset for Diagnostic and Maintenance Systems" | Zenodo depositor | CC BY 4.0 (record read) | One JSON (61 KB) of faults, symptoms, procedures + 4 flowchart images; no DTC list stated | JSON, PNG | 2025-06-09 | Medium (unknown authorship of procedures) | **manual-read-only** |
| 21 | Zenodo 10.5281/zenodo.18771497 "Adaptation of LLMs for the Automotive Software Engineering Domain - Datasets" | Academic authors | CC BY 4.0 | Code and docs files from automotive open-source repos, 72 MB and 76 MB | JSONL | 2026-02-25 | Not applicable (software text, no DTC list) | **excluded** (wrong content) |
| 22 | Mendeley Data 10.17632/r98g7g6k5t.1 "Chinese Vehicle Fleet Fault Association Dataset" | Dataset depositors | **Not verified** (page not readable here) | Fault-code events, vehicle metadata, annotations, causal triples; 2020 to 2023 (search snippet) | unknown | listed June 2026 (snippet) | Unknown | **manual-read-only** pending licence check |
| 23 | arXiv 2602.01109 BiCarFormer | Paper authors | Paper on arXiv; no data release found | Proprietary fleet set, 22,137 error codes, 360 error patterns (abstract) | PDF | 2026-02-01 | n/a | **excluded** (no data) |
| 24 | OBDb org (github.com/OBDb) | OBDb contributors | CC-BY-SA-4.0 (prior note) | Signal definitions, no DTC meanings | JSON | active | Low | **excluded** for DTCs (use for signals) |
| 25 | mercedes-benz/odxtools | mercedes-benz GitHub org | MIT (API) | Python ODX tools; no code lists | Python | pushed 2026-11-17; 333 stars | Low | **manual-read-only** (format reference) |
| 26 | python-OBD, AndrOBD, todrobbins/dtcdb, jseobd, obd2-core, Gershy13/dtc-lookup, driveforgelabs/vehicle-db, MCDxAI/ODB2-Visualizer, kierandrewett/obd, peyo/dtc-and-vin-data, aalih34554-ai, sathya1495, Epitech HF, OBD2HQ | various | see prior note section 3 | see prior note | various | see prior note | per prior note | per prior note (unchanged) |

Verdict tally for rows 1 to 25: ingest 1 (row 1); cross-check 4 (rows 2, 7, 17, 18); manual-read-only 4 (rows 11, 20, 22, 25); excluded 16 (the rest). Row 26 groups earlier finds and is not counted.

---

## 4. Detailed entries (new or changed since the baseline note)

### 4.1 karsonmadden / WhichTrim: US vehicle trouble codes (row 1)

- **URL:** https://huggingface.co/datasets/karsonmadden/us-vehicle-trouble-codes. Live files named in the README: whichtrim.com/data/dtc.csv and dtc.json. Archive DOI named in the README: 10.5281/zenodo.22891283 (I could not read the Zenodo record; the API returned a non-JSON reply for that id, so the DOI is unverified).
- **Owner and licence:** the README names WhichTrim as compiler and states CC BY 4.0. It also states that the fuller vehicle compilation, API and search index are not CC BY and points to a carve-out in its terms (whichtrim.com/terms). I did not read those terms; treat the carve-out as unreviewed (medium).
- **Content (README, high):** 1,142 codes. By family: P 778, U 147, B 131, C 86. Columns: code, defined_by (standard or manufacturer-specific), meaning, bulletins (count), owner_reports (count), documents, model_years, components (NHTSA component categories), page (a whichtrim.com URL).
- **Counts:** 128,336 bulletin occurrences and 5,434 owner reports across the corpus.
- **Weak point:** only 119 of 1,142 rows (10.4%) have a meaning, and the README gives no source for that wording. A code that is manufacturer-specific is labelled only "manufacturer-specific", with no make shown in the columns listed; the make is not a column (high). So it cannot tell BMW P1xxx from Ford P1xxx.
- **Why it is still useful:** real-world frequency. It tells us which codes show up in US bulletins and complaints, which is a prioritisation list for our own writing.
- **Cite as:** WhichTrim (2026), US vehicle diagnostic trouble codes linked to manufacturer bulletins and owner reports, CC BY 4.0, via Hugging Face dataset page; keep the date of the copy we read (README says files regenerate nightly).
- **Automated reading:** the file is a public download under CC BY 4.0; no robots issue arises for a single file. Do not scrape whichtrim.com pages.
- **Provenance check done:** the source is NHTSA public bulk files, which are US federal data. The aggregator's value-add (joins and counts) is the licensed part. The 119 meanings are the unverified part. Action: ingest the numbers and code list; ignore the meaning column.

### 4.2 OBD Codes List files (rows 2)

- **URLs:** https://obdcodeslist.com/code-data.html, https://github.com/tekseport/obd2-codes, https://huggingface.co/datasets/CodesList/obd2-codes.
- **Terms read:** "free to use, including commercially" with one condition, an attribution line "Code data from OBD Codes List" linked to the page, not to the file. Site generation date shown: 2026-10-12. GitHub reports the licence as NOASSERTION because the terms are prose, not an SPDX file. The HF card tags cc-by-4.0, which differs in wording from the site's own attribution terms (high).
- **Content:** 9,414 generic codes (note: 119 fewer than OBDex's 9,533). Four columns: code, description, category, severity. The site says descriptions are "the short standard name", The page does not mention SAE. That the wording follows SAE J2012 titles is our inference (medium confidence); `data-strategy.md` already says those titles are SAE-copyrighted wording. Maker-specific codes are not in the file (the README says generic only).
- **Provenance risk: medium.** The site does not say where the titles come from. If they follow SAE wording, an attribution licence cannot lift SAE's rights. We use it only to check that every generic code exists.
- **Verdict:** cross-check for generic code coverage; do not ship its descriptions.

### 4.3 riz4d / OpenVAG (row 3)

- **URL:** https://github.com/riz4d/OpenVAG. MIT LICENSE file read (copyright 2026 Mohamed Rizad). Created 2026-06-27 09:00 UTC; the latest commit that day, within one hour, was 09:50. One star.
- **Claims (README and db/README):** SQLite with 995 unique code and title rows, 1,103 variants, 341 components, 712 code-to-component links, 276 related-code links. Codes appear as 5-digit VAG numbers, a combined "VAG / P-code / internal" form, and P, B, C, U codes. Each variant has symptoms, causes, solutions, special notes with "TSB references".
- **What the repo contains (file listing read):** README, LICENSE, `app/`, `db/` (only README.md 5,198 bytes and schema.sql 4,772 bytes), `docs/`, requirements. **No data file and no source statement.** So the 995 count cannot be checked.
- **Why risk is high (inference, low-medium confidence):** the component naming (G sensors, N valves, J control units) matches the standard VW repair-manual vocabulary, and a "symptoms, causes, solutions" triple per fault subtype is a repair-manual shape, not an owner-written shape. A one-hour creation window for a project that claims about 1,000 curated entries suggests a bulk import from somewhere else. I did not find which source.
- **Verdict:** excluded. If the SQLite file appears later, read nothing from it; the real VAG hex codes we need come from captures and the VW group's own public material (see sibling notes).

### 4.4 GitLab `GhostTypes/dtc-codes` and the GitHub mirror chain (rows 4 and 5)

- **GitLab API, high:** project created 2026-11-20 01:42 UTC (the same day as this run), default branch main, 0 stars, `license: null`, description "A large collection of proprietary DTC codes, grouped by manufacturer". Files: AlfaRomeo.json, BMW.json, Chrysler.json, Fiat.json, Ford.json, GM.json, Honda.json, Mitsubishi.json, Nissan.json, Volkswagen.json, README.md, count_dtcs.py.
- **README, high:** title "Open-Source DTC Databases"; badge "Total DTCs 31,272"; "Manufacturers 10"; table of counts: Alfa Romeo 29, BMW 4,781, Chrysler 665, Fiat 246, Ford 3,315, GM 5,325, Honda 367, Mitsubishi 3,998, Nissan 3,409, Volkswagen 9,137 (sums to 31,272). Badge links go to GitHub `MCDxAI/open-source-dtc-databases`, which now returns not found.
- **BMW file shape (measured on keys only, text discarded):** 4,781 keys. Key prefixes: P0 995, P2 639, U0 299, P1 285, then groups of 100 for bare numeric keys beginning 01, 02, 04, 05. Median value length 44 characters, longest 1,047. So BMW's 4,781 is not a BMW-specific list: about 2,200 are standard-range codes that any generic list holds, and the bare numeric keys look like a decimal or hex BMW-style numbering (inference).
- **Why this matters for our BMW target:** the headline 4,781 BMW figure is mostly generic codes plus a minority of real BMW-format keys. It is not a count of BMW meanings we could use.
- **GitHub twin:** `Automotive-9/dtc-codes`, created 2025-06-07, pushed 2026-11-20, no licence, 3 stars. Its README (read) carries the same text and table and a banner saying the repo moved to the GitLab project above and is no longer updated. So the GitLab project is a move of this repo, not an independent copy, and GitLab's creation date reflects the move. The note `dtc-open-generic-datasets.md` already rated it Avoid.
- **Provenance risk: critical.** No licence, "proprietary" in the project's own description, moved between hosts (GitHub to GitLab), badge-target repo no longer found. It cannot be taken as original. Add the three file names and the 31,272 figure to the fingerprint list in section 7.

### 4.5 Hugging Face scraped and generated sets (rows 12 to 15)

- **jigneshk5/dtc_codes:** two JSONL files, no card, created 2025-05-24, 11 downloads. Sample rows: code, cause, severity, suggested fix for P0101, P0300, P0420 (so it is a tiny demo of common generic codes).
- **fabiovilao/obd2-ptbr:** README empty beyond a licence tag, created 2025-09-01. First record shows a Portuguese title plus a long explanatory paragraph per code. A long paragraph per code in a second language, without a source, is a translation-of-something-else signal (low confidence).
- **RRK1987/automotive-diagnostics-v2:** MIT tag. README says its content is "built from real internet sources using automated text parsing" and lists its sources as GitHub OBD-II documents, UDS reference, ISO 26262 reference and the NHTSA complaint API. That is an admission of scraped input. The "disclaimer" text is for a project exercise. Not a source of meanings.
- **PedroCuisinier2025/OBD2_panel_opel_2012:** CC BY 4.0 telemetry from the owner's own driving (394,406 rows, 28 columns, 2025-04-30 to 2025-12-02). No DTC meanings. Interesting as sample data for our simulator, not as a fault source.

### 4.6 Other GitHub repositories that appeared this run

- **AndreyHMkr/ODB2-fault-codes:** the whole data file is `ford_error.json`, 1,934 bytes, with Ford P11xx powertrain codes for a 1.0 EcoBoost; descriptions are short phrases. No licence, no source. Ford P1xxx wording of this kind matches long-standing public Ford code lists, so the text is probably copied from one (low confidence).
- **lennykean/OBDII.DTC:** MIT, active (pushed 2026-10-29), a .NET library of generic codes plus "a limited set of manufacturer-specific codes" (README example uses Honda). The README cites ISO 15031 and SAE J2012 as the standards defining the generic codes; it does not say how the descriptions were written or licensed (high). Our inference that they follow the paid standard is unverified. Cross-check only for which maker codes exist; never copy descriptions.
- **mytrile/obd-trouble-codes:** MIT, one push in 2014, 61 stars, and the README points to obd-codes.com as the more complete source. A thin copy of a website. Excluded.
- **dsoprea/DtcLookup:** GPL-2.0, 2013. Excluded.
- **xinings/DTC-Database:** no licence, 2019. Excluded.
- **hoffman1938/bimmercode:** no licence (API `license: null`), 9 stars, last push 2026-08-13. Excluded, as in the prior note.
- **driveforgelabs, aon082910/repair-hub (MIT, 2026-11-16, DTC lookup inside a shop app), apiverve/dtclookup-api:** consume other datasets; not primary sources.

### 4.7 Zenodo and academic repositories

- **Search results (high):** the Zenodo API returned no record whose title is a DTC dictionary. The title hits were: a Honda workshop-tools paper (CC BY 4.0), driving-behaviour logs, "DTC" meaning direct torque control in motor drives (a name clash that pollutes searches), and the two datasets in rows 20 and 21.
- **Row 20 (Automotive Faults Dataset):** CC BY 4.0, 2025-06-09, one JSON of 61,270 bytes and four flowchart PNGs. Description: faults, symptoms, diagnostic procedures, outcomes. Not coded by DTC in the description. Use: read to see what a researcher considered a useful fault structure.
- **OpenAlex hits (medium):** several 2020 to 2026 papers on OBD data, fuel use, expert systems (for example one on a BMW 3-Series fault expert system using forward chaining, 2026). None was shown to release a code table. I did not read each full text.
- **Mendeley (row 22):** the dataset title and description came only from a search snippet. Licence not verified. Treat the content as fleet repair events, potentially with real code numbers, but no meanings. If its licence is CC BY 4.0 it could give us frequency data like row 1. Open question for the owner.
- **Row 23 (BiCarFormer):** the paper's own abstract states a "real-world automotive dataset with 22,137 error codes and 360 error patterns". A text search of the PDF for "available", "public", "proprietary" found no release link. So the data is not open.

### 4.8 Format references that may help (not code meaning sources)

- **mercedes-benz/odxtools (MIT, pushed 2026-11-17, 333 stars):** a Python library to interact with ECU diagnostic data in the ODX format. Whether specific makers ship fault lists in ODX is not established by this repo (our inference, unverified). Useful only for reading ODX files a user legitimately owns. Gives us no codes by itself.
- **obd-diag (phprell):** a small Linux app that builds its database from OBDex and says so in its README. Good model for attribution wording.

---

## 5. How text provenance was checked

For each project I looked for these signals, in order:

1. **Licence file present and readable?** Row 4, 5, 6, 8, 13, 19: none.
2. **Source statement present?** Only OBDex, WhichTrim (NHTSA bulk data), obd-diag (credits OBDex) and RRK1987 (admits scraping) say anything. Everyone else is silent.
3. **Self-description:** "proprietary DTC codes" (GitLab row 4) is a red flag in itself.
4. **Creation date against claimed size:** OpenVAG (1,103 variants, one hour), GitLab (31,272 codes, created today).
5. **Structure that matches a paid source:** VAG component letters and per-variant "solutions" (OpenVAG); SAE J2012 titles (OBD Codes List, OBDII.DTC); Ford P11xx phrasing (row 6).
6. **Text length profile (measured, keys and lengths only):** BMW file in row 4 has a long tail up to 1,047 characters against a median 44, which fits copied repair text mixed with short titles. The prior note measured the same pattern for the Audi file in Wal33D.
7. **Duplicates across projects:** the mirror chain (GitHub, GitLab, ODB2-Visualizer, MechanicDB spine) all trace to one or two upstream sets.
8. **Commercial twin exists:** MechanicDB sells the full set and gives away a licensed sample, which is a common way to launder a scraped set into an "open" one.

---

## 6. Activity and quality snapshot (dates from this run)

| Project | Last push or update | Stars or downloads | Maintainers | Quality note |
|---|---|---|---|---|
| OBDex | 2026-11-07 | active | 1 main | review field on 100% per prior note |
| WhichTrim DTC set | 2026-09-22 (HF) | 72 downloads | company | counts credible; text thin |
| OBD Codes List files | 2026-10-06 | 79 HF downloads; GitHub 0 stars | site owner | clean format, titles are standard names |
| Wal33D | 2026-02-16 | 64 stars | 1 | no sources found |
| OBDII.DTC | 2026-10-29 | 4 stars | 1 | CI badge, tests |
| OpenVAG | 2026-06-27 | 1 star | 1 | no data file |
| GitLab dtc-codes | 2026-11-20 | 0 | unknown | created same day |
| Automotive-9 | 2026-11-20 | 3 | unknown | no licence |
| mytrile | 2014-05-20 | 61 | none | stale |
| dsoprea | 2013-09-09 | 12 | none | stale |
| odxtools | 2026-11-17 | 333 | company-backed | high code quality |
| MechanicDB sample on HF | 2026-10-24 | 213 downloads | vendor | marketing funnel |

Quality gap that matters: none of the manufacturer-code sets has a way to report an error or a takedown contact. Compare the contribution rules in `dtc-crowd-curation-model.md`.

---

## 7. Fingerprints to block (for the copy-detection check)

These are facts about the sources, not their text. Use them as the "never load, flag near-copies" list in the data pipeline:

| Item | Fingerprint |
|---|---|
| GitLab GhostTypes/dtc-codes | file names listed in 4.4, the 31,272 total, per-make counts 29 / 4,781 / 665 / 246 / 3,315 / 5,325 / 367 / 3,998 / 3,409 / 9,137 |
| Automotive-9/dtc-codes | same table |
| MCDxAI/open-source-dtc-databases | README badge target (repo gone) |
| Wal33D/dtc-database | brand files and the length profile of the Audi file |
| OpenVAG | schema in `db/schema.sql`; 995, 1,103, 341 counts |
| MechanicDB | 90-code sample and column names `dtc_fixes_joined`, `replacement_parts` |
| OBD Codes List | 9,414-code list (SAE titles) |

---

## 8. What is worth doing with these findings

1. **Ingest** the WhichTrim index as a priority list: for each manufacturer-range code, its bulletin and complaint counts and the NHTSA components. Do not take its meaning column. Record the file date and CC BY 4.0 in the data manifest.
2. **Go to the origin:** NHTSA bulk files are federal data. Rebuild the same index ourselves from the NHTSA file (see the sibling TSB note) so we depend on no aggregator. Treat the WhichTrim set as a cross-check of our own count.
3. **Cross-check** every generic code we write against OBDex, and use OBD Codes List only to confirm code existence (9,414 vs 9,533).
4. **Add the fingerprint list** from section 7 to the legal checks.
5. **Do not mine** GitHub or GitLab for "BMW" or "VAG" lists again. Every hit so far was either tiny, derived or unlicensed.
6. **Open question (owner):** check the Mendeley fleet-fault dataset licence by hand. If it is CC BY 4.0 it could supply frequency data for non-US cars.
7. **Ask for takedown contact details** from nobody: do not message the owners of excluded sets. That would only draw attention to our reading of them.

---

## Sources

Each line: URL, what I read there, and confidence.

- S1. https://huggingface.co/datasets/karsonmadden/us-vehicle-trouble-codes : card, tags, file list, full README read via the HF API and raw file (high).
- S2. https://obdcodeslist.com/code-data.html : terms and file description (high).
- S3. https://github.com/tekseport/obd2-codes : README read, API repo metadata (high).
- S4. https://huggingface.co/datasets/CodesList/obd2-codes : card and README (high).
- S5. https://github.com/riz4d/OpenVAG : README, db/README, LICENSE, file tree, commit list (high).
- S6. https://gitlab.com/GhostTypes/dtc-codes : project API, tree, README, BMW file key shape (high).
- S7. https://github.com/Automotive-9/dtc-codes : repo metadata via API only (high for metadata).
- S8. https://github.com/AndreyHMkr/ODB2-fault-codes : README, file list, head of the JSON (high).
- S9. https://github.com/lennykean/OBDII.DTC : README, file list (high).
- S10. https://github.com/mytrile/obd-trouble-codes : README, API metadata (high).
- S11. https://github.com/dsoprea/DtcLookup and https://github.com/xinings/DTC-Database : API metadata only (medium).
- S12. https://github.com/hoffman1938/bimmercode : API metadata only (medium).
- S13. https://huggingface.co/datasets/jigneshk5/dtc_codes , https://huggingface.co/datasets/fabiovilao/obd2-ptbr , https://huggingface.co/datasets/RRK1987/automotive-diagnostics-v2 , https://huggingface.co/datasets/PedroCuisinier2025/OBD2_panel_opel_2012 , https://huggingface.co/datasets/Ichlibitiche/mechanicdb-obd2-repair-sample , https://huggingface.co/datasets/Epitech/obd-codes-fine-tune : API, card, README, file heads (high).
- S14. https://zenodo.org/records/15626055 and https://zenodo.org/records/18771497 : via the Zenodo records API (high). Zenodo search API queries listed in section 2 (high).
- S15. https://arxiv.org/abs/2602.01109 : abstract through the arXiv API and PDF text search (high that no release link was found in text; medium that none exists).
- S16. https://data.mendeley.com/datasets/r98g7g6k5t/1 : search snippet only (low).
- S17. https://github.com/mercedes-benz/odxtools : API metadata (high).
- S18. https://pypi.org/project/obd-diag and https://github.com/phprell/obd-diag : PyPI JSON metadata and README text (high).
- S19. https://www.kaggle.com/datasets/donnetew/odb2-powertrain-codes : appeared in search; page body could not be read (low). Described there as a four-column powertrain CSV of about 242 kB (snippet).
- S20. https://github.com/MechanicDB/MechanicDB-public and the Kaggle copy named in the HF README : search snippet and HF README (medium).
- S21. Baseline notes in this repo: `docs/research/deep2/dtc-open-generic-datasets.md` and `docs/plan/dtc-coverage-strategy.md`.
- S22. OpenAlex search API (works search), 10 results scanned by title (medium).

---

## Gaps

- **Kaggle:** no dataset page could be read, and no listing was available without a login. Kaggle's own licence labels per dataset are therefore unverified. The Kaggle copies of MechanicDB and donnetew's powertrain list were seen only in search snippets. To close: a logged-in session or the official Kaggle CLI with the owner's own token (needs owner approval, a key is involved).
- **GitHub search:** the unauthenticated search limit (10 per minute) cut my query list. Not run: "fault codes bmw dtc" (blocked by 403), searches for Mercedes, Toyota, Ford and Mazda repos by topic, GitHub code search (needs login) and GitHub topics pages.
- **GitLab:** only project-name search was used. GitLab snippets, groups and self-hosted instances were not searched. Codeberg, SourceHut, Gitee and Bitbucket not searched.
- **Hugging Face:** search terms were limited to 8; Spaces and models that embed code tables were not checked. Some HF sets have only a card and I did not download Parquet files.
- **Zenodo:** only record search; no full-text file search. Figshare, Dryad, OSF, Mendeley Data (beyond one dataset), Harvard Dataverse and the IEEE DataPort not searched.
- **Academic:** only OpenAlex titles were read; no full text except one arXiv paper. Papers that build expert systems from Ross-Tech or VAG data were not traced.
- **Licence of the Mendeley fleet-fault dataset:** unverified.
- **WhichTrim terms page** (carve-out) and the Zenodo DOI 10.5281/zenodo.22891283 were not read.
- **OpenVAG origin of data:** not established; inference only.
- **Upstream of the mirror chain:** the repo `MCDxAI/open-source-dtc-databases` is gone; its original source for the 31,272 codes is unknown. I did not download the JSON files beyond the BMW key and length profile.
- **Wal33D, OBDex, python-OBD, AndrOBD:** not re-measured this run; numbers come from the prior note.
- **Mobile apps and web apps** (store listings, Windows tools) that embed code tables were not examined. Several (for example Android and iOS code readers) only showed up as store links; their text is likely licensed from vendors, so they are excluded by default but not individually checked.
- **Non-English datasets** (Chinese, Russian, Spanish, Portuguese beyond one HF set) not searched in depth.
- **Coverage claims** in repo descriptions (for example "28,220+ codes" for Wal33D) are the owners' claims and were not recounted.

---

## 9. Citation and access rules per source

| Source | How to cite | Automated reading rule | Takedown or contact path found |
|---|---|---|---|
| WhichTrim DTC index | WhichTrim (2026), title as in README, CC BY 4.0, date of copy | One file download is fine; do not crawl whichtrim.com pages; terms carve-out not read | Site terms; not read |
| OBD Codes List files | Attribution line exactly as the site gives it, linked to the page | One file download; site says no signup, key or rate limit | Contact page on site (not read) |
| OBDex | CC0 needs none; we cite anyway with commit date | Static files on GitHub Pages; fetch the released file, not per-code pages | GitHub issues |
| obd-diag | MIT notice | Repo clone is fine | GitHub issues |
| Zenodo automotive faults set | DOI 10.5281/zenodo.15626055, CC BY 4.0 | Zenodo API allows record reads | Zenodo record page |
| odxtools | MIT notice | Repo clone is fine | GitHub issues |
| NHTSA bulk files (via WhichTrim, source of its counts) | Name the NHTSA file and its date | Public federal download | NHTSA site |
| All "excluded" rows | Not cited; kept only as fingerprints in section 7 | Not fetched beyond metadata and key counts | Not contacted |

Rules for our own manifest (one row per source, per `data-strategy.md`): URL, owner, licence text hash, date read, what we took (facts only), who read it, and the verdict from this note.

---

## 10. Checks I would run before trusting any new open set

1. Read the licence file, not the badge. A badge saying MIT or CC BY on a repo means the uploader grants it, nothing more.
2. Find a source statement. If none exists, treat the set as unsourced.
3. Compare creation date with claimed size. A thousand curated entries in an hour is a bulk import.
4. Count key families without reading text: how many keys sit in the generic ranges that every list already holds. The BMW file in section 4.4 is mostly that.
5. Measure text length spread (median against longest). A long tail points to pasted manual text.
6. Check whether a paid twin exists. If someone sells the full set and gives a sample, the sample licence does not clean the full set.
7. Check for a mirror chain: same counts under several owners means one unknown upstream.
8. Check whether the repo's data file is even present. OpenVAG's is not.
9. Never open a Critical or High set inside a drafting session. A writer who has read copied text may reproduce it without noticing.
10. Record the fingerprint (file names, counts, schema), then move on.

---

## 11. What would change a verdict

- A written statement from the owner of an excluded set naming a clean source and a licence we can check would move it to cross-check at most. Even then we would not copy its text.
- A licence verified as CC BY 4.0 on the Mendeley fleet dataset would move it to ingest for frequency data.
- A release of the OpenVAG database with a documented origin (for example the author's own captured data) would move it from excluded to cross-check.
- Proof that the WhichTrim meaning column came from NHTSA text would not help us: we ignore that column either way.
- If SAE or any manufacturer published a machine-readable open code list under an open licence, every row above becomes secondary. None was found.
