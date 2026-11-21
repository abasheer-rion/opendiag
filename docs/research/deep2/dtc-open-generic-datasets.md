# Open and openly licensed DTC datasets: what exists, what the licences really say, what we can ship

Research run: 2026-11-20. Status: **PARTIAL** (see Gaps: GitHub API rate limit hit, Kaggle and several sites unreachable, no authenticated search). Not legal advice.
Builds on `docs/plan/data-strategy.md` (section 3 and 4.2), `docs/plan/decisions.md` (decision 1, share-alike allowed as a separate pack), `docs/design/data-schema.md`, `docs/research/deep/open-source-automotive-code-survey.md`, `docs/research/deep/legal-regulatory-landscape-deep.md`, `docs/research/deep/diagnostic-standards-and-obd-future.md`, `docs/research/deep/bmw-modules-dtcs-and-addressing.md`, and the sibling notes in `docs/research/deep2/` (`dtc-bmw-coverage.md`, `dtc-mercedes-coverage.md`, `dtc-toyota-lexus-coverage.md`). Source numbers (S1, S2 ...) are local to this note.

Confidence tags: **high** = read on the primary page, file or API in this run; **medium** = secondary page, search snippet, or fetch tool summary; **low** = inference or single weak source. Rows marked "(measured)" were computed by me from files I downloaded in this run; they are counts, not copied text. No fault text from any source is reproduced here. Files were downloaded into a scratch folder and read as data only (no code from them was run).

---

## 1. Executive summary

- **The open world has one good generic set and nothing clean for manufacturer codes.** OBDex is the only dataset I found with a verified CC0 licence file, a stated review method, and full coverage of the standard code space: 9,533 generic codes, English and German, with causes, symptoms and links (high) [S1][S2]. Everything else is either small, older, copyleft, unlicensed, scraped, or of unknown origin.
- **Manufacturer-specific codes exist in open repositories, but none has a trustworthy licence story.** The largest MIT-labelled one (Wal33D/dtc-database) has about 6,650 brand-range rows across 32 brand files plus 2,620 unattributed rows, and its author documents no source for any description (high) [S3][S4]. A downstream project that imported it reviewed it and wrote that over a quarter of the Audi rows look like copied repair text; I confirmed the pattern: 41 of 129 Audi lines are over 150 characters, against 0 over 150 in the BMW, Ford and Volkswagen files (measured, high) [S5].
- **Plain meaning of the licence labels.** MIT on a repository only means the uploader gives permission for what the uploader owns. If the text came from a vendor tool or a paid standard, the label does not fix that. This matters most for Wal33D, jseobd, Automotive-9 and kierandrewett's scraped set.
- **The biggest BMW number is the most dangerous.** Automotive-9/dtc-codes (a GitLab project of the same name, GhostTypes/dtc-codes, was created 2026-11-20; whether it is a move or a copy is not established) lists 4,781 BMW entries, 31,272 across 10 makes, with no licence file and no source statement, and a description that calls the content "proprietary DTC codes" (high) [S6]. Do not ingest, and do not even load it into the drafting workflow (tainted-reader risk, see section 9).
- **The generic titles are almost the same everywhere.** After lowercasing and stripping punctuation, 98.8% of Wal33D's generic titles equal OBDex's titles, 65.2% of AndrOBD's and 54.1% of python-OBD's do (measured, high). So the short generic titles are effectively the public J2012 titles, which `data-strategy.md` already says are SAE-copyrighted wording. Our plain-English rewrite should not ship those titles verbatim.
- **Coverage ceiling for generic codes is about 9.5 thousand and is nearly solved.** OBDex lists 9,533; Wal33D's generic files contain 9,415 unique codes of which 9,249 fall in OBDex's code space (measured, high). The remaining gap in generic coverage is text quality and rewrite effort, not code existence.
- **Share-alike gives us almost nothing for DTCs.** The only large CC-BY-SA data I found (OBDb, 897 repos) is signal definitions, and I found no DTC definitions in its schema repository (medium). Wikipedia is CC BY-SA but has no per-code table (measured: zero P0xxx codes in the On-board diagnostics wikitext). The one share-alike DTC set (MechanicDB sample, ODbL) is built on the Wal33D rows and is a different licence, so it is not a fit for the share-alike pack (high).
- **Government sources give rules and evidence, not a code list.** CARB 13 CCR 1968.2 requires SAE J2012 (March 2013) and its Digital Annex (January 2013) and says manufacturers may use their own fault codes with approval (high, read in this run) [S7]. The code definitions themselves are in the paid SAE documents. NHTSA's manufacturer-communications flat file is the best open evidence base for real-world code usage (medium on licence) [S8].
- **Recommended position.** (1) Generic layer: our own plain-English rewrite, cross-checked against OBDex; import only structured facts (family, ranges, flags, related-code links). (2) Manufacturer layer: no bulk import from any open repository found; build from captures, public OEM documents and community reports with per-entry source tags. (3) Add automated checks that block near-copies of every dataset in this note (section 10).

Headline numbers for planning: generic codes 9,533 (OBDex); manufacturer-range rows in the biggest MIT-labelled set about 6,650 (Wal33D, brand files) plus 2,620 unattributed; BMW-labelled rows seen in any open repo: 250 (Wal33D and jseobd, same code set), 4,781 (Automotive-9, do not use). Mercedes: 32 rows (Wal33D). Toyota: 45, Lexus: 49 (Wal33D).

---

## 2. Method and limits

- GitHub: used the unauthenticated REST API (60 calls per hour; budget used up mid-run) for metadata and tree listings, `raw.githubusercontent.com` for LICENSE, README and data files, and GitHub HTML pages through a fetch tool. The local `gh` login failed (invalid token), so no authenticated search was possible.
- Licences were taken from the LICENSE files where I could fetch them, not from GitHub's licence badge. Where a file could not be fetched I say so.
- Other portals: web search plus fetches of Hugging Face, npm, data.gov, datahub.io, TIB/KIT, SAE Mobilus and CARB/Cornell pages. Kaggle, Weblate and dot.report blocked or returned nothing.
- Counts marked (measured) come from downloading the file and counting lines or keys with `jq`, `awk` and a small offline script. The script compared only code identifiers and normalised titles, then discarded the text.
- Today is 2026-11-20. Dates quoted for repositories are API or page dates from this run.

---

## 3. Scoreboard (one row per dataset)

Ship = we may put it in our packs under our licence rules (CC0 or CC-BY for the main packs, CC-BY-SA for the separate share-alike pack). Cross-check = read it to catch missing codes and mistakes, never copy text. Avoid = do not ingest, do not load into authoring tools.

| # | Dataset | Licence (verified how) | Size | Last update | Mfr codes? | Languages | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | foerbsnavi/OBDex | Data CC0-1.0, code MIT (LICENSE-DATA, LICENSE-CODE read) | 9,533 generic codes, 132 PIDs, 31.7 MB JSON | pushed 2026-11-07 | No (by design) | EN, DE (any ISO 639-1 key allowed) | Cross-check; import structured facts only |
| 2 | Wal33D/dtc-database | MIT (LICENSE read); data origin undocumented | 9,415 generic, about 6,650 brand rows, 2,620 unattributed; 3.3 MB SQLite | pushed 2026-02-16 | Yes, 32 brand files | EN (locale column) | Cross-check only; do not ship |
| 3 | driveforgelabs/vehicle-db | MIT; imports Wal33D rows | not shown | not shown | Yes (upstream rows) | EN | Avoid as a source; useful as a legal-process model |
| 4 | MCDxAI/ODB2-Visualizer (zocken) | not stated; Wal33D inside | 8,802 per its page | not shown | Yes (imported) | DE UI | Avoid |
| 5 | MechanicDB-public (and HF/Kaggle copies) | ODbL v1.0 for sample; full set commercial | 90-code sample (75 SAE + 15 OEM); full claimed 15,886 | pushed 2026-11-07 | Sample yes | EN, DE site | Avoid (ODbL, spine is Wal33D) |
| 6 | python-OBD `obd/codes.py` | GPL-2.0 (LICENSE read; file header says GPL v2 or later) | 2,066 codes | repo last push 2025-04 (per earlier note) | No | EN | Cross-check only; GPL |
| 7 | AndrOBD `codes*.properties` | Repo GPL-3.0 (LICENSE read) | 3,584 codes in base file | active repo | No (B0, C0, P0, P2, P3, U0, U3 only) | about 36 translation files, Weblate | Cross-check only; GPL |
| 8 | todrobbins/dtcdb | MIT (LICENSE read) | 467 unique P0 codes | 2013-07-30 | No | EN | Cross-check only; stale, provenance unclear |
| 9 | jseobd (npm) | MIT (LICENSE in package read) | 934 generic + BMW 250, Audi 539, PSA 659, VW 191 | npm 1.0.5, 2022-05-06; GitHub repo now 404 | Yes (5 groups) | EN | Cross-check only; provenance unknown |
| 10 | obd2-core (Rust crate) | MIT OR Apache-2.0 per docs.rs crate page (medium) | about 184 descriptions | 0.2.0 | Mostly generic | EN | Skip |
| 11 | Gershy13/dtc-lookup (Arduino) | MIT per library index (medium) | not stated | 2026-06-06 | Yes (tables) | EN | Skip |
| 12 | Automotive-9 / GhostTypes dtc-codes | No licence file; no source | 31,272 across 10 makes; BMW 4,781 | GitHub state not re-checked (API limit); GitLab project created 2026-11-20 | Yes | EN | **Avoid** |
| 13 | kierandrewett/obd `dtc_codes/` | App MIT; data scraped from dot.report | 21,000+ across 37 makes (claimed) | 60 commits | Yes | EN | **Avoid** (scraped) |
| 14 | aalih34554-ai/vehicle-dtc-database | No licence file found | 55 generic + 28 brand rows (measured) | not shown | Tiny | AR, EN | Avoid (tiny, no source) |
| 15 | peyo/dtc-and-vin-data | No licence file found | not stated | not shown (34 commits) | Toyota, Honda, GM (P codes) | EN | Avoid (scraper output, no licence) |
| 16 | sathya1495/obd2-dtc-database | MIT in file, but built to promote a website | 60 codes | 2026-05-13 | No | EN | Skip (too small) |
| 17 | HF Epitech/obd-codes-fine-tune | None stated, empty README | 3,071 rows | not shown | No (generic) | EN | Avoid |
| 18 | OBD2HQ (datahub.io) | No open licence found; site terms ask for attribution and permission | "10,000+ codes, 48 brands" (site claim) | published 2026-07-22 | Yes (claimed) | EN | Avoid |
| 19 | hoffman1938/bimmercode | No licence | "temporary dataset" | not shown | BMW | EN, RU, KA | Avoid |
| 20 | NHTSA manufacturer communications (TSB flat file) | US federal data; licence field not stated on catalog page (medium) | one record per bulletin and product | file dated 2026-02-04, catalog 2026-09-03 | Text mentions OEM codes | EN | Evidence base, not a code list |
| 21 | CARB 13 CCR 1968.2 (via Cornell LII) | Public regulation | rules, no code list | read 2026-11-20 | Allows manufacturer-defined codes | EN | Rules and structure facts only |
| 22 | OBDb (OBDb org, 897 repos) | CC-BY-SA-4.0 (LICENSE read for .schemas) | signal definitions | active | BMW, Toyota and others (signals) | EN | Signals, not DTCs |

---

## 4. Detailed entries: the useful ones

### 4.1 OBDex (foerbsnavi/OBDex)

- **URL:** https://github.com/foerbsnavi/OBDex. Live search app https://obd.signalwelt.de/ and data browser https://foerbsnavi.github.io/OBDex/ (high) [S1].
- **Licence (verified):** `LICENSE-DATA` is a CC0 1.0 dedication for the data files; `LICENSE-CODE` is MIT. GitHub shows "NOASSERTION" because of the two-file split (high) [S1][S2]. CONTRIBUTING says every pull request is dedicated CC0 for data and MIT for code, and bans verbatim copyrighted text (high) [S1].
- **Size (measured):** the published `generic.min.json` is 31.7 MB and holds 9,533 entries. Families: P0 3,705; P2 3,495; P3 155; B0 323; C0 626; U0 1,055; U3 174. The site `meta.json` reports the same totals and 9,533 of 9,533 "reviewed" (high) [S2].
- **Size of the extras:** 30,875 source links to 244 sites, 33,401 causes, 26,762 symptoms, 46,824 related-code links, 132 PIDs (Mode 01 and Mode 09) (high, `meta.json` and README) [S1][S2].
- **Fields (measured from the JSON):** `code`, `category`, `title` (en, de), `description` (en, de), `affected_components`, `common_causes` (with likelihood), `symptoms`, `repair` (difficulty, DIY flag, cost range in euros, hours), `flags` (MIL, emissions relevance, drive cycle, limp mode), `references`, `related_codes`, `sources`, `reviewed` date (high).
- **Dates:** repository created 2026-05-01, last push 2026-11-07, 308 commits, 18 stars (high, API). The README says all codes were worked through between 2026-10-09 and 2026-11-07 in 195 packages of about 50 (high, self-reported) [S1].
- **Manufacturer-specific codes:** not included on purpose. The README says P1xxx and B1xxx style codes stay with their makers (high).
- **Method claims (self-reported, not independently checked):** each code has at least two sources, one a regulation, bulletin or OEM document; code lists were used only to cross-check titles; forums and AI-generated pages were not used (medium, README). Its own table says 770 codes rest on regulation, patents and reference works alone, and 276 chassis and body codes appear in none of the public J2012 title lists it could check (high, README).
- **Quality notes:**
  - Strong structure and a CI that checks schema, duplicates and links (medium, README).
  - Small project: one visible maintainer, a few named contributors, a very fast review pace (about 9,500 codes in one month). The pace is a reason to spot-audit, not proof of a problem (low).
  - The titles match the common public J2012 titles (measured above), so the title column is not independent wording.
  - Costs are in euros and are editorial estimates; do not import them (low relevance to us).
  - The 31.7 MB single file is heavy for an app bundle; our pack should store only what we use (high, measured).
- **Ship or cross-check:** licence permits shipping. Our rule in `data-strategy.md` is to rewrite anyway; that stays right because of the title overlap and because the project is one month old. Use it to (a) confirm each code exists, (b) find related-code groups, (c) check our own text for factual errors. Import allowed without rewrite: code, family, category, flags, related-code links. Everything prose: rewrite.
- **Attribution:** voluntary under CC0; we should still credit it as a courtesy (the project provides a credit line in `meta.json`) (high).

### 4.2 Wal33D/dtc-database

- **URL:** https://github.com/Wal33D/dtc-database. Licence file: MIT, copyright 2024 Wal33D (high) [S3].
- **Size (measured from the source text files):** 33 files downloaded (32 brand files plus `other_codes.txt`); 9,408 "CODE - description" lines across them. Generic files (`p_codes`, `b_codes`, `c_codes`, `u_codes`): 9,415 unique codes, of which 9,249 are in OBDex's code space and 166 are in manufacturer ranges. Manufacturer-range rows in the brand files (excluding `other`): 6,652 lines, 6,635 unique make-and-code pairs. `other_codes.txt` adds 2,620 unique manufacturer-range rows with no brand (high).
- **Conflicting claims inside the repository:** the GitHub description says "28,220+ codes including 9,415 generic and 18,805 manufacturer-specific"; the README table says 18,805 total rows, 12,128 unique codes, 9,415 generic and 9,390 manufacturer-specific. These cannot all be true at once (high). A downstream vendor says its filtered view has 6,637 OEM codes, which matches my 6,635 (medium). Quote the measured figures, not the badge.
- **Fields:** SQLite table with `code`, `manufacturer`, `description`, `type`, `locale`, `is_generic`, `source_file` (high, `build_database.py`). Wrappers in Python, Java, Android, TypeScript. Only English text is present in the sources (medium).
- **Dates:** created 2025-09-22, last push 2026-02-16, 64 stars; tagged release v0.1.0 on 2025-10-23 (high) [S3].
- **Mfr coverage for our three families (measured line counts, all P1xxx style):** BMW 250, Mercedes 32, Toyota 45, Lexus 49. Other brands for scale: Volkswagen 528, Ford 416, Honda 95, Jaguar 163, Nissan 59 (high). BMW's modern three-byte codes, Mercedes five-character codes and Toyota's full list are absent.
- **Provenance:** none documented. README, release notes and USAGE say nothing about where descriptions came from (high, I searched them). The BMW set has the same 250 codes as jseobd's BMW file, and 117 of the 250 lines are identical to jseobd's (measured). jseobd dates to 2019, so the lineage goes back at least that far and its origin is unknown (medium).
- **Independent evidence of a problem:** driveforgelabs/vehicle-db imported these rows and then wrote in LEGAL.md that the author "does not document how the descriptions were collected", that manufacturer tables are higher risk than generic, and that over a quarter of the Audi entries look like copied repair text (high) [S5]. My measurement agrees: 32% of the Audi lines exceed 150 characters (41 of 129); no other brand file had any (measured).
- **Quality notes:** short, name-like text for most brands (average 42 to 56 characters for BMW, Ford, Toyota, Lexus, Mercedes) which suits cross-checking. No severity, no cause data, no sources per row (high).
- **Ship or cross-check:** **cross-check only.** Reasons: unknown origin, a downstream project's own suspicion, and the Audi evidence. MIT does not cure a copy. It is still useful to confirm that a given P1xxx code is in circulation (an identifier is a fact), and to spot-test our own wording for accidental overlap.
- **Derived and downstream copies (do not treat as independent sources):** MechanicDB (below), driveforgelabs/vehicle-db, and ODB2-Visualizer (zocken) all import Wal33D rows. They add no new provenance.

### 4.3 MechanicDB-public and its copies

- **URL:** https://github.com/MechanicDB/MechanicDB-public; mirror on Hugging Face https://huggingface.co/datasets/Ichlibitiche/mechanicdb-obd2-repair-sample; a vendor page says it is also on Kaggle (not verified) (medium) [S9][S10].
- **Licence (verified from the repository LICENSE):** sample data under ODbL v1.0 (attribution, share-alike, keep open); full databases need a commercial licence. The authored fixes and costs are the vendor's. The DTC code spine is declared as taken from Wal33D/dtc-database, MIT, with the notice preserved (high) [S9].
- **Size:** 90-code sample (75 SAE plus 15 OEM across 11 makes) per the repository; Hugging Face lists 1,191 rows over four tables (dtc_codes 90, diagnostic_fixes 326, replacement_parts 449, joined 326). The vendor claims 15,886 codes, 56,729 procedures and 647 fault families in the full set, with paid tiers of $49 and $149 (medium, vendor claim) [S10].
- **Also has:** a heavy-duty J1939 sample (100 fault rows, 32-row FMI register) with a stated rule that nothing was taken from the SAE J1939 Digital Annex or third-party SPN/FMI tables derived from it (high, SOURCES.md) [S9]. That provenance statement is better than most; it is not usable for us because the ODbL is share-alike under a different licence from CC-BY-SA.
- **Verdict:** avoid for shipping. ODbL is not the same licence as CC-BY-SA 4.0 and I did not find a published compatibility statement (low). The useful lesson is the SOURCES.md pattern (section 10).

### 4.4 python-OBD (`obd/codes.py`)

- **URL:** https://github.com/brendan-w/python-OBD (high). Licence file: GNU GPL version 2; the file header names Donour Sizemore (2004), Secons Ltd (2009), Peter J. Creath (2009) and Brendan Whitfield (2016) and says GPL v2 or later (high, read) [S11].
- **Size (measured):** a Python dictionary `DTC` with 2,066 entries: P0 1,024; P2 645; P3 98; U0 299. No B, C or P1 codes (high).
- **Fields:** code to description string only (high). Used by the decoder `parse_dtc` which returns the code and the description or an empty string (high).
- **Lineage:** derived from pyOBD (2004), so the table is old and copied forward; I could not trace its origin (medium).
- **Overlap (measured):** all 2,066 codes exist in OBDex's code space; 54.1% of titles are identical after normalising (high). Every dtcdb code (467) is also in python-OBD (measured), which suggests a shared ancestor (low).
- **Verdict:** GPL-2.0 means copying text would force copyleft onto what we copy. **Cross-check only, never copy.** Existing note `diagnostic-standards-and-obd-future.md` already says not to use GPL code as a base; this adds that the data table has the same status.

### 4.5 AndrOBD (fault-code resource files)

- **URL:** https://github.com/fr3ts0n/AndrOBD (high). LICENSE read: GNU GPL version 3. The README links a Weblate project for fault-code translations (high). Weblate itself returned 403 (see Gaps) [S12].
- **Location (verified):** `library/src/main/java/com/fr3ts0n/ecu/prot/obd/res/codes.properties` and one `codes_<lang>.properties` per language. The wiki page says the component has about 2,635 translatable strings, which does not match my count of the base file (below) so treat the Weblate figure as stale (medium) [S12].
- **Size (measured):** base file has 3,584 lines, all `CODE=text`: P0 1,481; P2 903; P3 99; B0 359; C0 261; U0 463; U3 18. The German file has 3,585 lines. The folder page lists about 36 `codes_*.properties` files, a count taken from page links (low to medium).
- **Languages:** the widest translation set among the open apps (about 36 per the folder page). The translations are written by volunteers on Weblate and may have their own licence terms; not checked (low).
- **Mfr codes:** none; generic ranges only (measured).
- **Overlap (measured):** 3,276 of its 3,584 codes are in OBDex's space (the other 308 sit in reserved or manufacturer ranges); 65.2% of those titles are identical after normalising; 1,525 of the 2,066 python-OBD codes have identical normalised titles, so the two tables share ancestry (high).
- **Verdict:** GPL-3.0. **Cross-check only.** The multi-language file set is a useful hint for which codes real users meet most often; we do not copy translations.

### 4.6 dtcdb (todrobbins/dtcdb)

- **URL:** https://github.com/todrobbins/dtcdb. MIT (LICENSE read), copyright 2013 trobbins (high).
- **Size (measured):** one `generic.csv` with 490 lines, 467 unique P0 codes, a few header or section lines (high). Created and last pushed 2013-07-30 (API) (high).
- **Fields:** two columns, code and description. English (high).
- **Provenance:** the README lists Wikipedia, SAE J1979, myscantool.com, a Delaware DMV code list PDF, and a law.resource.org PDF of SAE J2012 (2002) as sources (high). The text is therefore derived from third-party lists, not independently written.
- **Overlap (measured):** all 467 codes are in OBDex and python-OBD.
- **Verdict:** stale and small. **Cross-check only, low value.** The README's "OBD-II PIDs" framing also shows it is more a PID idea than a code database.

### 4.7 jseobd (npm package)

- **URL:** https://www.npmjs.com/package/jseobd (page returned 403 to the fetch tool; read through the public registry API instead). Version 1.0.5, last modified 2022-05-06, created 2019-01-28, MIT (package LICENSE read, "Copyright (c) 2019 Julien B"). The GitHub repo it points to (statictoad/jseobd) returns 404 now (high) [S13].
- **Size (measured from the tarball):** generic `dtc.json` 934 entries (B0 125, C0 128, C1 96, P0 584 plus one stray); `dtc-bmw.json` 250; `dtc-audi.json` 539; `dtc-psa.json` 659; `dtc-volkswagen.json` 191. Fields: `dtc` and `msg` only (high).
- **Overlap:** generic set 793 of 933 unique codes are in OBDex's space; the BMW code list is identical to Wal33D's BMW list (250 of 250) and 117 lines have identical text (measured, high).
- **Provenance:** none stated. The package README says only "some manufacturer-specific codes" (high).
- **Verdict:** cross-check only. Nothing in it is a clean source for BMW.

### 4.8 Smaller open code tables (skip, one line each)

- **obd2-core (Rust)**: a `match` table of about 184 generic descriptions with a "~200" comment, no licence note in the file, crate listed as MIT OR Apache-2.0 (medium; docs.rs page) [S14]. Too small.
- **Gershy13/dtc-lookup (Arduino library)**: MIT per the Arduino library index, version 1.0.0 on 2026-06-06, generic J2012 plus user-addable manufacturer tables; code count not given (medium) [S15].
- **sathya1495/obd2-dtc-database**: 60 codes in 3 JSON files, MIT text in LICENSE, but the README exists to push an outside website and the "common causes" are action phrases (high) [S16].
- **PaulMarisOUMary/OBDII** (MIT), **Libre-Diagnosctic** (AGPL-3.0), **ReDrive** (GPL-3.0): app or library projects; I could not confirm that any ships a DTC description table (medium; page text did not say) [S17].

---

## 5. Datasets to avoid (and why)

### 5.1 Automotive-9 / GhostTypes `dtc-codes` ("Open-Source DTC Databases")

- **URLs:** https://github.com/Automotive-9/dtc-codes and https://gitlab.com/GhostTypes/dtc-codes (GitHub state not re-checked; GitLab API shows project created 2026-11-20, no licence, no stars) (high) [S6].
- **Claims:** 31,272 DTCs across 10 makes: Alfa Romeo 29, BMW 4,781, Chrysler 665, Fiat 246, Ford 3,315, GM 5,325, Honda 367, Mitsubishi 3,998, Nissan 3,409, Volkswagen 9,137. Project description: "A large collection of proprietary DTC codes, grouped by manufacturer" (high).
- **Measured from the BMW file:** a JSON object with 4,781 keys; 2,390 keys are four characters long (BMW-style short codes such as the 4-digit hex shape described in `bmw-modules-dtcs-and-addressing.md`) and 2,391 are five characters (P, B, C, U style). Average description length about 47 characters (high). Format shows no sources, no licence, no module or chassis field.
- **Why avoid:** no licence file (404 on LICENSE), no source statement, and the repository's own description calls the content proprietary. The size (4,781 BMW entries, far above what any public forum list holds) is more consistent with an export from a commercial or OEM database than with community work, but I have no proof of origin (low). Under our hard rule, "unknown origin" is enough to exclude.
- **Extra caution:** do not read this file into a prompt or notes while drafting our own BMW text. If the text were OEM-derived, our drafting would be contaminated (see section 9).

### 5.2 kierandrewett/obd (`dtc_codes/` folder)

- **URL:** https://github.com/kierandrewett/obd. Application licence MIT (LICENSE read, copyright 2026 Kieran Drewett) (high).
- **Data:** "21,000+ manufacturer-specific codes across 37 makes" fetched by `scripts/fetch_dtc_codes.js` from the dot.report site; the README gives that source and no licence for it (medium; page summary) [S18].
- **Why avoid:** the MIT licence applies to the app. Scraped pages from a site with its own terms are not licensed by it. dot.report put a bot check in front of my fetch (HTTP 403), and I did not bypass it, so its terms are unread (see Gaps). Its robots.txt disallows a few paths (VIN, plate lookups, bulletin PDFs) but not `/dtc/` (high), which says nothing about copyright or database rights.

### 5.3 Other no-licence or no-provenance sets

- **aalih34554-ai/vehicle-dtc-database:** measured 55 generic rows and 28 brand rows in the two CSVs I could fetch (Toyota, Nissan, Hyundai, BMW, Mercedes, Ford, Volkswagen); Arabic and English; fields include cause and fix; a third file is empty or missing; no LICENSE file at the root (404); README refers to "OEM service information" without naming it (high). Too small to matter.
- **peyo/dtc-and-vin-data:** JSON with `dtc` and `description` for generic, Toyota, Honda and GM P-codes; made with a Scrapy scraper; no licence file found (404 on LICENSE) and sources not named (medium) [S19].
- **Hugging Face Epitech/obd-codes-fine-tune:** 3,071 rows, instruction style (`instruction`, `input`, `output`), 66.4 kB, no licence, empty README (medium) [S20]. A training-prompt set, not a reference.
- **OBD2HQ:** datahub.io page (published 2026-07-22; author "enginak21") lists four JSON resources on obd2hq.com with no licence; the site claims "10,000+ codes and 48 brands", and its terms say not to reproduce datasets or pages without attribution and permission where required (medium) [S21].
- **hoffman1938/bimmercode:** a web app repository with a "temporary dataset" and no licence (medium) [S22].
- **Vendor and phone-app databases:** Car Scanner and OBD Auto Doctor, CodeGuru and EOBD Facile store listings quote database sizes from 15,000 to 18,500 definitions; these are marketing numbers for closed data (medium) [S23]. Torque and Car Scanner do not publish their trouble-code files and I found no open documentation of either format (see Gaps).

### 5.4 Commercial and standards-body sources (the real "ground truth", not open)

- **SAE J2012 and J2012 Digital Annex (J2012DA):** the code definitions CARB points to. A reseller listing shows J2012DA dated 2025-10-24 in Word and Excel at EUR 840 excluding VAT, and a 2024 edition at about EUR 801 (medium, reseller prices) [S24]. The annex is updated several times a year; the December 2018 edition reported 337 new and 150 revised codes (medium). Not open; title wording is SAE-owned.
- **MOTOR Diagnostic Trouble Codes:** licensed OEM-sourced OBD-I and OBD-II codes, generic and manufacturer-specific, delivered as XML, JSON or BSON through a web service (medium, vendor page) [S25].
- **VW Group "Diagnostics Data":** a licensed product containing DTC descriptions for eight Group brands (medium) [S25].

---

## 6. Government, regulatory and standards sources

| Source | What it gives | What it does not give | Confidence |
|---|---|---|---|
| CARB 13 CCR 1968.2 (Cornell LII copy, read in full in this run) | Requires "standardized fault codes conforming to SAE J2012"; incorporates SAE J2012 (March 2013) and J2012-DA (January 2013) in section (g)(1.6); requires 2-byte codes (per SAE J2012) for vehicles on SAE J1979 and 3-byte codes for vehicles on SAE J1979-2 (re-read 2026-11-20); lets manufacturers use manufacturer-defined codes with Executive Officer approval; requires a fault code description in some reports | No table of codes. The definitions sit in the paid SAE documents | high [S7] |
| 40 CFR 86.1806-05 (federal OBD rule) | EPA requires fault codes consistent with SAE J2012 (April 2002 edition in the cited version) | Same: no code list | medium (search snippet of the GPO PDF) [S26] |
| CARB rulemaking records (staff reports, FSOR, 15-day notices) | Reasons and incorporation history; some contain descriptive material | Not a dataset | medium [S26] |
| NHTSA manufacturer communications ("TSB flat file") | One record per bulletin and product with a summary of up to 4,000 characters; CSV and tab-separated "flat file"; layout in `MfrComms.txt` (file dated 2026-02-04; layout lists a change on 2026-09-15 for field lengths); data.gov record modified 2026-09-03 | No code definitions; licence field is blank on the catalog page (rights marked "public"); an earlier search snippet said "us-pd", which I could not confirm | medium [S8] |
| EU: Regulation 2018/858 Art 61 and OBD type-approval rules | Right of independent operators to repair and maintenance information, for a reasonable fee (already covered in `legal-regulatory-landscape-deep.md`) | No open DTC table; code meanings follow ISO 15031-6 which is paid. I found no EU open-data portal entry for DTC definitions | medium (search; no EU portal result) |
| ISO 15031-6 / SAE J2012 relationship | The standardized code space and definitions that both US and EU OBD rules point to | Paid documents | high [S7][S24] |
| EPA heavy-duty OBD and SAE J1939 (SPN/FMI) | Rules exist; compliance test cases are in paid SAE documents | I found no EPA or CARB open table of SPN/FMI meanings. A CARB-funded study appendix maps J1939 variables to SPNs (not DTC text) | medium [S27] |

Practical reading: the regulations tell us how codes are structured and which standard defines them. They do not give an open set of meanings. The NHTSA bulletins are public US government documents and mention real codes with real repair context, which makes them the best open place to check "do people actually see this code on this model". OBDex already cites a large number of them (6,861 links to the NHTSA archive per its README) (high) [S1].

---

## 7. Academic and data-portal results

- **KIT/TIB "Automotive obd-ii dataset" (Weber, 2018 production, 2023 publication):** CC BY 4.0, CSV logs of ten live signals (coolant temperature, manifold pressure, RPM, speed, intake temperature, air flow, throttle, ambient temperature, pedals D and E). No DTCs (high) [S28]. Useful only as test signals for live-data views.
- **arXiv 2412.13041 (error pattern prediction):** models sequences of fault codes (ECU ID, base code, fault byte) on an anonymized 1.7 million sequence set; the search result does not say the data is public (low) [S29].
- **SAE technical paper 2026-26-0664 and Chalmers 2024 thesis:** describe LLM work over proprietary service manuals or a closed failure dataset; neither releases a code corpus (low) [S29].
- **Zenodo, figshare, IEEE DataPort, Kaggle, data.gov:** no open DTC description dataset found by search. A vendor page says its 90-code sample is on Kaggle; I could not open Kaggle to check (medium) [S10].
- **datahub.io:** one result (OBD2HQ, section 5.3) with no open licence.
- **Wikipedia:** the On-board diagnostics article has an "OBD-II diagnostic trouble codes" section that explains the format only; my count of P0xxx codes in the wikitext is zero (measured, high). Text is CC BY-SA, so even if useful it could only go in the share-alike pack (medium). No Wikipedia list of DTCs found.

---

## 8. Signals and other open datasets that are not DTC lists

| Project | Licence | Why it matters | Confidence |
|---|---|---|---|
| OBDb (https://github.com/OBDb, 897 repositories at fetch time) | CC-BY-SA-4.0 for the schema repo (LICENSE file read) and the vehicle repos shown | Signal definitions by make and model, including BMW 3 Series and Toyota Prius. The organisation text mentions DTCs; the schema repository page and README I read mention none, and the BMW 3 Series README describes signal sets only | medium [S30] |
| commaai/opendbc | MIT (per `data-strategy.md`, verified 2026-11-19 there) | Live CAN signals, not diagnostics | medium (earlier note) |
| CSS Electronics PID and DTC converter pages | Website tools | A lookup page for the 2-byte to string format; not a data download | low |

OBDb's relevance to this topic is indirect: it shows a working share-alike community pattern (per-vehicle repositories, schema CI, pull request review) that we could copy for crowd-curated DTC facts, see `dtc-crowd-curation-model.md`.

---

## 9. Licensing reading for our packs

Our packs are CC0 or CC-BY, plus an allowed separate CC-BY-SA pack (decision 1).

| Question | Answer | Confidence |
|---|---|---|
| Can we ship OBDex text under CC-BY? | Yes by licence (CC0 can be relicensed). Attribution is voluntary but we will give it. Titles equal widely circulated J2012 titles, so shipping them verbatim carries the SAE wording risk already noted | high on licence, medium on the SAE point |
| Can we ship any Wal33D-derived text? | No. Origin unknown; downstream reviewer flagged copied-looking text | high |
| Does MIT or GPL on an open-source app protect the DTC table inside it? | MIT does not prove the uploader owned the text. GPL adds copyleft; copying text would put it under GPL | high (principle), no case law reviewed |
| Does CC-BY-SA data fit the separate pack? | CC-BY-SA 4.0 text can go there. ODbL does not (different licence, no compatibility statement found). Nothing DTC-specific under CC-BY-SA found except Wikipedia prose | medium |
| Is the "tainted reader" risk real here? | Yes for Automotive-9 and scraped sets: if text is OEM-derived, reading it while drafting can contaminate our rewrite. Use the same rule as `data-schema.md` rule 3: do not load them | medium (policy choice) |
| EU database right | A downstream project quotes Directive 96/9/EC: the database maker's right can apply to extraction of a substantial part however the entries are reworded (high that the project says so; this is their reading, not verified law) [S5] | low to medium |

---

## 10. What we can build, and the automated guards

### 10.1 Coverage plan by layer

| Layer | Target | Source of meanings | Open dataset role |
|---|---|---|---|
| Generic P0, P2, P3, B0, C0, U0, U3 | all 9,533 | Our plain-English rewrite from CARB structure, public OEM documents and bulletins | OBDex = existence and relation checks; AndrOBD, python-OBD, Wal33D = disagreement spotting only |
| Reserved but unused generic numbers | about 276 chassis/body codes OBDex says have no public title | Mark "defined by the standard, no public wording" with a status field | OBDex flags them (high, README) |
| Manufacturer P1xxx / B1xxx / C1xxx / U1xxx | BMW, Mercedes, Toyota/Lexus first | Own captures, induced faults, public OEM documents, reviewed community reports | None found that is clean. Treat Wal33D rows as "code exists in circulation" hints only |
| BMW 3-byte and 4-hex codes | per chassis | Captures and public bulletins | No clean open set. Do not use the Automotive-9 BMW file |
| Heavy-duty (J1939 SPN/FMI) | out of scope for now | n/a | MechanicDB sample notes the legal pattern only |

### 10.2 Guards to build (match `data-strategy.md` helper "DTC rewrite helper")

1. **Per-dataset denylist for text similarity.** Hash character 5-grams of every description in Wal33D, AndrOBD, python-OBD, jseobd, dtcdb and the OBDex titles; block a pull request if our draft text overlaps above a set threshold. Keep these hashes local, not in the repository.
2. **Title rule.** Our public title must not equal the normalised J2012-style title in 3 or more sources. Measured baseline: 98.8% of Wal33D titles equal OBDex titles, so this check will fire often at first; that is the point.
3. **Source tag per entry.** Use the vehicle-db pattern: `sae-j2012`, `own-capture:<note>`, `manufacturer-doc:<url>`, `upstream:<name>@<rev>`, and add `nhtsa-tsb:<id>`. Reject entries with `upstream:` for anything other than a code-exists flag.
4. **SOURCES.md row.** Per `data-strategy.md` rule: URL, licence verified by reading the file, date checked, what was taken (nothing, fact only, text). Add rows for every dataset in section 3.
5. **Length guard.** Flag any description over 300 characters from an upstream; vehicle-db uses this limit and the Audi case shows why.
6. **Contributor attestation.** Developer Certificate of Origin sign-off as in vehicle-db (high that they require it; adopting it is our choice).

### 10.3 What would actually add manufacturer meanings legitimately

- OBDex's method on the generic side (regulation, bulletins, OEM service documents, patents) can be repeated for OEM ranges where the maker publishes: OBDex cites GM, Ford, Saab, Mitsubishi and Deutz documents for generic codes (high). Whether BMW, Mercedes or Toyota publish equivalent PDFs is covered in the sibling per-make notes and not repeated here.
- NHTSA TSB summaries mention codes for many makes (medium; flat file layout read, contents not sampled for BMW, Mercedes, Toyota in this run). Treat them as evidence of existence and symptom, and rewrite everything.
- Community crowd-curation with attestation (see `dtc-crowd-curation-model.md`).

---

## 11. Overlap analysis (measured; identifiers only)

| Pair | Codes compared | Result |
|---|---|---|
| python-OBD vs OBDex | 2,066 | all 2,066 in OBDex; 1,118 identical normalised titles (54.1%) |
| AndrOBD vs OBDex | 3,584 | 3,276 in OBDex; 2,136 identical titles (65.2% of those) |
| Wal33D generic vs OBDex | 9,415 | 9,249 in OBDex; 9,139 identical titles (98.8%) |
| OBDex minus Wal33D generic | 9,533 | 284 OBDex codes absent from Wal33D's generic files |
| dtcdb vs OBDex | 467 | all 467 in OBDex |
| jseobd generic vs OBDex | 933 | 793 in OBDex |
| jseobd BMW vs Wal33D BMW | 250 | same 250 codes; 117 identical lines |
| Wal33D vs python-OBD (same codes) | 2,066 | 1,093 identical normalised titles |
| AndrOBD vs python-OBD (same codes) | 2,066 | 1,525 identical normalised titles |

Reading: the open generic tables share one or two common ancestors. They are not independent confirmations of each other. Two lists agreeing is weak evidence that a title is correct; it is stronger evidence that both copied a common list. OBDex's claim of cross-checking against "at least two independent code lists" is therefore weaker than it sounds, though its regulation and bulletin sources are real links (low to medium).

Not measured: how many of OBDex's 9,533 descriptions were verified against their linked sources. A sample audit of 50 random codes (open each source link and check the claim) is the cheapest way to size the risk.

---

## 12. Manufacturer coverage matrix for our three families

| Family | Best open count (clean licence) | Best open count (any licence) | Notes |
|---|---|---|---|
| BMW | 0 | 250 (Wal33D, jseobd, same set); 4,781 in Automotive-9 (avoid) | The 250 are P1xxx-style engine codes. No set uses BMW's three-byte form with confirmed text |
| Mercedes-Benz | 0 | 32 (Wal33D) | Plus a few Mercedes rows in a tiny Arabic and English CSV (aalih34554, avoid) |
| Toyota / Lexus | 0 | Toyota 45, Lexus 49 (Wal33D); P-code rows in peyo (count unknown) | Toyota-specific DTC meanings are in Techstream, which is off-limits (see `data-strategy.md`) |

"Clean" means: licence verified from a file, and a documented independent origin for the text. None meets both.

---

## 13. Gaps and what I could not verify

- **Fact-check pass (2026-11-20):** re-read from source and confirmed: OBDex CC0 data and MIT code files and its 9,533 total with family counts; Wal33D, dtcdb, kierandrewett MIT; python-OBD GPL-2.0 (2,066 entries); AndrOBD GPL-3.0 (3,584 lines); OBDb schema CC-BY-SA-4.0; MechanicDB ODbL with a Wal33D MIT note; jseobd MIT, 1.0.5, dates; Automotive-9 BMW 4,781 keys, no licence file in the GitLab tree; Audi 41 of 129 lines over 150 characters and none in BMW, Ford, Volkswagen; CARB J2012 March 2013 and DA January 2013. Not re-checkable (GitHub API limit hit): repository dates, star and commit counts, and Wal33D's 6,650 and 2,620 row figures.

- **GitHub API budget:** the 60-call unauthenticated limit ran out mid-run, so I could not list commit dates, contributor counts or full file trees for several repositories (ReDrive, Libre-Diagnosctic, OBDii by PaulMarisOUMary, hoffman1938/bimmercode, ODB2-Visualizer). Their "no DTC table" or "not stated" notes come from page summaries (medium to low). Local `gh` login is invalid; a valid token would allow a proper code search for DTC files across GitHub. Use the Keychain pattern in DEVBOX_SECURITY; I did not read or print any token.
- **GitHub search coverage:** only a handful of repository searches ran. A full search (topics `dtc`, `obd2`, `diagnostic-trouble-codes`, plus code search for `"P1" "description"` formats) may find more small sets; I expect none better than OBDex but it is unproven.
- **Kaggle and Hugging Face breadth:** Kaggle was not reachable; Hugging Face was checked for two datasets only. A vendor says a MechanicDB sample is on Kaggle; unverified.
- **dot.report terms:** blocked by a bot check; I did not bypass it. Its licence, whether it holds OEM text, and how it got its data are unknown.
- **Weblate (AndrOBD fault codes) and npm page:** returned 403 to the fetch tool, so the exact language count and translation licences are unread. The 36-file figure is from link counts on a GitHub folder page.
- **Torque and Car Scanner:** neither publishes its trouble-code database. I found no open documentation of the format or of any user-extendable DTC file. They are closed products, so I recorded nothing on contents (listed as absent, not as "none exist").
- **OBDex text quality:** I verified the structure, counts, licence and 98.8% title overlap, not the factual accuracy of its prose. No sample audit done.
- **Wal33D origin:** I did not find the upstream site(s). The jseobd link suggests a pre-2019 shared source. Origin remains unknown.
- **NHTSA TSB licence and BMW, Mercedes, Toyota content:** the catalog page shows no licence; the earlier "us-pd" snippet is unconfirmed. I did not sample bulletins to see how many mention OEM-specific codes.
- **EU sources:** no EU open-data portal search beyond web search. Possible type-approval annexes that list code requirements were not read.
- **SAE reuse terms:** I did not read SAE's terms on use of J2012 titles, so the "titles are SAE wording" point rests on the existing note in `data-strategy.md` plus the measured title overlap.
- **Licence compatibility ODbL and CC-BY-SA:** no statement found; flagged low.
- **Legal conclusions:** none are legal advice. Counsel should decide on Wal33D-derived rows, the Automotive-9 question, and whether short generic titles can be copied.

---

## 14. Next actions (small, ordered)

1. Add SOURCES.md rows for every dataset in section 3 with the verdicts above.
2. Run a 50-code sample audit of OBDex prose against its own source links; record the failure rate.
3. Build the similarity check (section 10.2) with local-only hashes from Wal33D, AndrOBD, python-OBD, jseobd, dtcdb and OBDex titles.
4. Restore a valid GitHub token from the Keychain and run the repository and code searches that the rate limit cut short.
5. Sample NHTSA TSB files for BMW, Mercedes, Toyota and Lexus bulletins that mention fault codes; log counts per make as existence evidence only.
6. Ask OBDex's maintainer how titles were chosen and whether prose was machine-assisted (a plain question, no assumption).
7. Do not load Automotive-9, kierandrewett's scraped files or OBD2HQ pages into any drafting step.

---

## Sources

Where a line says "read", I fetched the file or page in this run on 2026-11-20.

| Id | URL | What it is | Used for | Conf |
|---|---|---|---|---|
| S1 | https://github.com/foerbsnavi/OBDex (README, LICENSE-DATA, LICENSE-CODE, CONTRIBUTING.md, CITATION.cff via raw.githubusercontent.com/foerbsnavi/OBDex/main/...) | OBDex repository | licence, method, counts, fields | high |
| S2 | https://foerbsnavi.github.io/OBDex/meta.json and https://foerbsnavi.github.io/OBDex/generic.min.json | OBDex published data | counts, fields, size 31.7 MB | high |
| S3 | https://github.com/Wal33D/dtc-database (README, LICENSE, docs/RELEASE_NOTES.md, build_database.py, data/source-data/*.txt) and https://api.github.com/repos/Wal33D/dtc-database | Wal33D repository | licence, counts, dates, schema | high |
| S4 | https://raw.githubusercontent.com/Wal33D/dtc-database/main/data/source-data/ (bmw, mercedes, toyota, lexus, audi and other brand files) | Source text files | per-brand counts, length stats | high |
| S5 | https://github.com/driveforgelabs/vehicle-db (README, LEGAL.md, THIRD_PARTY_NOTICES.md, CONTRIBUTING.md) | Downstream project with provenance review | Audi and provenance warning, source tags | high |
| S6 | https://github.com/Automotive-9/dtc-codes and https://gitlab.com/GhostTypes/dtc-codes (GitLab API for dates, tree, files) | Per-make JSON collection | counts, no licence, structure | high |
| S7 | https://www.law.cornell.edu/regulations/california/13-CCR-1968.2 | CARB regulation text | SAE J2012 incorporation, fault code rules | high |
| S8 | https://static.nhtsa.gov/nhtsa/downloads/Temp/MfrComms.txt, https://static.nhtsa.gov/odi/ffdd/tsbs/TSBS.txt and https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-technical-service-bulletins-system-tsbs-downloa | NHTSA manufacturer communications layout and catalog | file layout, dates, licence field | high (layout), medium (licence) |
| S9 | https://github.com/MechanicDB/MechanicDB-public (LICENSE, SOURCES.md) | Sample dataset | ODbL, provenance statement | high |
| S10 | https://huggingface.co/datasets/Ichlibitiche/mechanicdb-obd2-repair-sample and https://apify.com/dataengineered/obd2-dtc-code-repair-lookup | Mirror and vendor page | rows, tiers, Kaggle claim | medium |
| S11 | https://github.com/brendan-w/python-OBD (raw obd/codes.py, LICENSE) | python-OBD | GPL-2.0, 2,066 codes | high |
| S12 | https://github.com/fr3ts0n/AndrOBD (raw LICENSE, README, library/.../obd/res/codes.properties), https://github.com/fr3ts0n/AndrOBD/wiki/Language-translation, https://hosted.weblate.org/projects/androbd/fault-codes/ (403) | AndrOBD | GPL-3.0, 3,584 codes, file path | high (file), medium (language count) |
| S13 | https://registry.npmjs.org/jseobd (tarball jseobd-1.0.5) and https://www.npmjs.com/package/jseobd | jseobd package | MIT, counts, dates | high |
| S14 | https://docs.rs/obd2-core/0.2.0/src/obd2_core/protocol/dtc.rs.html | Rust crate source page | about 184 entries | medium |
| S15 | https://www.arduinolibraries.info/libraries/dtc-lookup | Arduino DTC Lookup | MIT, date | medium |
| S16 | https://github.com/sathya1495/obd2-dtc-database | 60-code JSON set | licence, size | high |
| S17 | https://github.com/PaulMarisOUMary/OBDII, https://github.com/Libre-Diagnosctic/libre-automotive-diagnostic, https://github.com/iUnreallx/ReDrive | Apps and libraries | licences as stated, no confirmed DTC tables | medium |
| S18 | https://github.com/kierandrewett/obd | OBD dashboard app | scraped dot.report data, MIT app | medium |
| S19 | https://github.com/peyo/dtc-and-vin-data and https://github.com/aalih34554-ai/vehicle-dtc-database | Small JSON and CSV sets | structure, no licence found | medium |
| S20 | https://huggingface.co/datasets/Epitech/obd-codes-fine-tune | Hugging Face dataset | rows, no licence | medium |
| S21 | https://datahub.io/obd2hq-open-automotive-diagnostic-resources/obd2hq-diagnostic-resources and https://obd2hq.com/en/terms/ | OBD2HQ | no open licence, terms text | medium |
| S22 | https://github.com/hoffman1938/bimmercode | BMW DTC web app | no licence | medium |
| S23 | https://apps.apple.com/us/app/id1259933623 (Car Scanner) and other store listings (OBD Auto Doctor, CodeGuru, EOBD Facile) found by search | Store pages | marketing database sizes | medium |
| S24 | https://saemobilus.sae.org/standards/j2012da_202510-digital-annex-diagnostic-trouble-code-definitions-failure-type-byte-definitions and https://www.dinmedia.de/en/standard/sae-j-2012da/397054650 | SAE and reseller pages | J2012DA editions, price | medium |
| S25 | https://www.motor.com/products-services/data-products/diagnostic-trouble-codes/ and https://drivesomethinggreater.com/products/Diagnostics-Data | Commercial DTC data | what the paid alternatives cover | medium |
| S26 | https://www.gpo.gov/fdsys/pkg/CFR-2012-title40-vol20/pdf/CFR-2012-title40-vol20-sec86-1806-04.pdf and https://arb.ca.gov/regact/obd02/fsor.pdf | Federal and CARB records (search snippets) | J2012 requirement history | medium |
| S27 | https://www.csselectronics.com/pages/j1939-73-dm1-diagnostic-message-dtc and https://saemobilus.sae.org/content/J1939/84_201601 | Heavy-duty references | SPN/FMI, paid standards | medium |
| S28 | https://service.tib.eu/ldmservice/vdataset/rdr-doi-10-35097-1130 | KIT/TIB OBD-II signal dataset | CC BY 4.0, signals only | high |
| S29 | https://arxiv.org/pdf/2412.13041 and https://saemobilus.sae.org/papers/ev-powertrain-systems-diagnostics-prognostics-utilizing-ai-ml-llm-based-approach-2026-26-0664 | Academic and SAE papers | no public DTC corpus found | low |
| S30 | https://github.com/OBDb, https://github.com/OBDb/.schemas, https://raw.githubusercontent.com/OBDb/BMW-3-Series/main/README.md | OBDb organisation | CC-BY-SA-4.0, signals, no DTC data seen | medium |
| S31 | https://en.wikipedia.org/w/api.php?action=parse&page=On-board_diagnostics&prop=wikitext (revision timestamp 2026-11-09) | Wikipedia article text | no per-code table (zero P0xxx codes) | high |

Internal documents consulted: `docs/plan/data-strategy.md`, `docs/design/data-schema.md`, `docs/plan/decisions.md`, `docs/research/deep/open-source-automotive-code-survey.md`, `docs/research/deep/diagnostic-standards-and-obd-future.md`, `docs/research/deep/bmw-modules-dtcs-and-addressing.md`, `docs/research/deep/legal-regulatory-landscape-deep.md`.
