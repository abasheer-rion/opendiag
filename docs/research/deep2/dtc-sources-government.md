# DTC sources: government and standards

Date: 2026-11-20. Status: **PARTIAL** (several official pages blocked automated fetch or were not read in full; see Gaps). Not legal advice.
Extends, does not repeat: `docs/plan/dtc-coverage-strategy.md`, `docs/plan/data-strategy.md`, `docs/research/deep2/dtc-open-generic-datasets.md`. Those already cover CARB 13 CCR 1968.2 incorporation of SAE J2012, EPA 40 CFR 86.1806-05, the NHTSA TSB catalog page, and the J2012-DA price. This note adds field-level layouts, access rules, the other NHTSA files (complaints, recalls), EU annex content, and a verdict per source.

Confidence tags: **high** = read on the official page or file in this run; **medium** = web-search snippet or a secondary copy; **low** = inferred, not read. Nothing below is copied fault text. All records are facts about sources.

## 1. Executive summary

1. **No government or standards body publishes an open list of manufacturer-specific fault-code meanings.** Not CARB, EPA, the EU, UNECE, NHTSA, SAE or ISO. What they publish: how codes are structured, which standard defines them, who must give repair information to whom, and (NHTSA only) free-text bulletins and complaints that mention codes in passing. (high for CARB, EU Annex X, NHTSA; medium for UNECE, EPA.)
2. **The only government source with machine-readable text that can mention manufacturer codes is NHTSA.** Three tab-delimited flat files: manufacturer communications (bulletins, 14 fields, 4,000-character summary), complaints (51 fields, 2,048-character narrative with component), recalls (29 fields, defect and corrective-action text up to 6,000 characters; consequence and notes 2,000). Catalog pages list rights as "public" and access level "public", with no licence field (high). "Public" describes access, not a stated reuse licence; reuse terms are **unconfirmed** until counsel or an NHTSA statement settles them.
3. **None of the NHTSA files has a code column.** A code appears only if a writer typed it into free text. How often that happens for BMW, Mercedes, Toyota is **not measured** in this run (no file downloaded). This is the key open measurement (Gaps G1).
4. **The EU gives a right, not a dataset.** Regulation 2018/858 Annex X point 2.5.6 lists "diagnostic trouble codes, including manufacturer specific codes" as information manufacturers must give independent operators (high, read on a UK-copy page). Delivery is through each manufacturer's portal, for a fee, under portal terms. That is a purchase path for a paying person to understand, not a source we may republish (consistent with `data-strategy.md` 4.6).
5. **Regulations are citable and free to read; the code definitions they point to are paid.** CARB points to SAE J2012 and its Digital Annex; the EU points to ISO 15031-6, which relies on SAE J2012-DA (medium). We cite the regulation for structure, never for meaning.
6. **Academic sources: no released DTC-meaning corpus found.** Papers use closed industrial data (for example about 29,100 unique codes in a private dataset, no release statement; the paper's licence is CC BY-NC-ND 4.0, which forbids reuse of its text in our pack). (high on the paper page; the dataset is not offered.)
7. **Net effect for OpenDiag:** government sources give us (a) the generic structure and legal basis, (b) a large free evidence base of bulletins and complaints to find which manufacturer codes owners actually meet, (c) citation targets. They give us no ingestable meaning text. Verdict counts below: 4 "ingest" (as structured facts or evidence), 8 "cross-check", 6 "manual-read-only", 6 "excluded".

## 2. Source table

Verdict key: ingest = machine-read into the evidence ledger (facts only; our own wording later); cross-check = read to confirm structure or existence; manual-read-only = a person reads, never bulk-copied; excluded = do not use, reason given.

| # | Source | Owner | Licence / terms (as read) | Covers | Format | Size (approx) | Verdict |
|---|---|---|---|---|---|---|---|
| G1 | NHTSA Manufacturer Communications flat file (`MfrComms.txt` layout; data on data.transportation.gov `hczg-qbhf`; zip `FLAT_TSBS.zip`) | US DOT / NHTSA | Rights "public", no licence field (high); reuse terms unconfirmed | Bulletins since 1995, per make/model/year, component fields, summary up to 4,000 chars | Tab text in zip; Socrata view | Not measured | **ingest** (facts: bulletin id, make, model, year, component, a code token if present) |
| G2 | NHTSA Complaints flat file (`CMPL.txt` layout; zip `FLAT_CMPL.zip`; Socrata `jhit-z9cc`) | US DOT / NHTSA | Rights "public", no licence field (high) | Owner complaints since 1995; 51 fields; narrative 2,048 chars | Tab text in zip | Not measured | **ingest** as existence and symptom evidence only; **personal data caution** |
| G3 | NHTSA Recalls flat file (`RCL.txt` layout; Socrata `amr3-cz7s`; the recalls catalog page lists RCL.txt and, as its distribution, the complaints zip, so a separate recalls zip URL is **not confirmed**) | US DOT / NHTSA | Rights "public", no licence field (high) | Recall campaigns; defect and corrective text up to 6,000 chars (consequence, notes 2,000) | Tab text | Not measured | **ingest** (campaign id, component, make/model/year); text cross-check |
| G4 | NHTSA APIs (api.nhtsa.gov usage page; vPIC API) | NHTSA | api.nhtsa.gov page: "not meant" for other applications' bulk VIN lookups; automated rate control (high; policy is about VIN lookups, last updated Jan 2023) | Recalls/complaints search; VIN decode, make/model lists | JSON, XML, CSV | n/a | **cross-check** (vPIC for make/model normalisation only); no DTCs (high) |
| G5 | NHTSA vPIC standalone database download | NHTSA | Terms not read (PARTIAL); page says downloads exist | Vehicle spec catalog from manufacturer submissions | Database download | Not measured | **cross-check** (make/model names) |
| G6 | NHTSA bulletin PDFs on static.nhtsa.gov (OEM documents attached to TSB records) | OEMs, hosted by NHTSA | OEM copyright; hosting is public; no reuse licence (medium; consistent with `dtc-coverage-strategy.md` A5) | Individual bulletins, many mention codes | PDF | Not measured | **manual-read-only**; facts only |
| G7 | CARB 13 CCR 1968.2 (public regulation) | California Air Resources Board / OAL | Law text; LII page shows no reuse notice in the part read (high) | OBD II rules, J2012 incorporation, 2- and 3-byte code rules, approval of manufacturer-defined codes | HTML, PDF | About 772,000 characters on the LII page (per sibling note; not re-measured, medium) | **cross-check** (structure facts; cite) |
| G8 | CARB OBD program pages and rulemaking records (ww2.arb.ca.gov) | CARB | Site terms not read (PARTIAL); robots.txt exists, allows major engines (high) | Regulation history, staff reports, FSOR | HTML, PDF | Not measured | **manual-read-only** |
| G9 | EPA 40 CFR 86.1806-05 and 86.1808-01 (federal OBD and service information rules) | US EPA via GPO/eCFR | Federal regulation; reuse not checked (low; not re-read) | Fault code standard reference; emissions service information availability | HTML, PDF | Small | **cross-check** |
| G10 | EPA guidance letter (reference IACD-2026-08, from a search snippet) | US EPA | Fetch redirected to a generic EPA page; content unverified (low) | Same service information for owners and third parties (snippet only) | PDF | n/a | **manual-read-only**, PARTIAL |
| G11 | EU Regulation (EU) 2018/858 Annex X (OBD and repair information access) | EU (UK copy read on legislation.gov.uk) | EU text; EUR-Lex content under the Commission reuse decision, generally CC BY 4.0 (medium; snippets). UK-copy page showed no licence line (high) | Right to OBD and repair info incl. manufacturer DTCs; portal rules | HTML, PDF | One annex | **cross-check** (legal basis); cite |
| G12 | EU Regulation (EU) 2017/1151 Annex XI and Appendices (OBD in light-duty type approval) | EU | Same as G11 | Malfunction definitions, OBD monitoring, link to UN R83 text | HTML, PDF | Large | **cross-check** |
| G13 | EU delegated regulation 2026/699 (amends 2018/858 Annex X; seen in search snippet) | EU | Not read (low) | OBD information access conditions after cyber-threat concerns | PDF | n/a | **manual-read-only**, PARTIAL |
| G14 | EU Regulation 582/2011 Annex X (heavy-duty OBD, named in 2018/858 point 6.6) | EU | Not read; EU reuse as G11 (medium) | Heavy-duty emission-related DTC consistency | HTML | n/a | **cross-check**, PARTIAL |
| G15 | UN GTR No. 5 (heavy-duty OBD, WWH-OBD) and UN Regulation 83 | UNECE WP.29 | UNECE pages returned 403; UN Digital Library records exist (medium). Terms not read | Technical OBD requirements, heavy-duty | PDF | n/a | **manual-read-only**, PARTIAL |
| G16 | SAE J2012 (and J2012-DA Digital Annex) | SAE International | Paid, copyrighted (high per existing note) | Authoritative generic code definitions and failure types | PDF, Word, Excel (paid) | DA reseller price EUR 840 excl. VAT (medium) | **excluded** as a source of text; cite only |
| G17 | SAE J1979 / J1979-2 | SAE | Paid | OBD services, PIDs | PDF paid | n/a | **excluded** for text; implement from public summaries and our own captures |
| G18 | ISO 15031-6 (DTC definitions) | ISO | Paid; ISO site returned 403 (high on 403; medium on content from reseller snippets) | Code format and relation to J2012-DA | PDF paid | n/a | **excluded** for text; cite |
| G19 | ISO 14229 (UDS) and ISO 15765 | ISO | Paid | Services and transport | PDF paid | n/a | **excluded** for text |
| G20 | CAREP paper, arXiv 2602.01155 (ICLR 2026 workshop) | Authors (affiliations not shown on page) | CC BY-NC-ND 4.0 (high, license icon) | Method on a private dataset, over 29,100 unique codes, 474 error patterns | PDF | 7 pages | **manual-read-only**; data not released (stated: not on page) |
| G21 | MDPI Electronics 14(21):4180 (fault-diagnosis knowledge graph work) | Authors | Page returned 403; licence and data statement unverified | Diagnostic dialogue dataset (per snippet) | HTML, PDF | n/a | **manual-read-only**, PARTIAL |
| G22 | Uni Augsburg OPUS thesis 131256, CEUR-WS Vol-4085 paper 1, Waterloo IEEE Software 2025 paper, SAE 2026-26-0664, Preprints 202503.1268 | Various | Not read | DTC inconsistency, LLM diagnosis studies | PDF | n/a | **manual-read-only**, PARTIAL; none confirmed to release a corpus |
| G23 | OBDex (foerbsnavi/OBDex) | Individual | CC0 data, MIT code (already verified in sibling note) | 9,533 generic codes | JSON | 9,533 | **cross-check** in this note's scope (already rung A in strategy) |
| G24 | MOTOR "Diagnostic Trouble Codes" data product; VW Group "Diagnostics Data" (sold to tool makers) | MOTOR; Volkswagen Group | Commercial sale (search result titles; terms not read) | OBD-I/II codes; VW error codes and reference values | Licensed feed | n/a | **excluded** (paywalled) |
| G25 | Scribd/SlideShare copies of J2012 and tool manuals; Haynes fault-code pages | Third parties | Copies of copyrighted work (medium) | Code lists | Web | n/a | **excluded** (do not load) |
| G26 | SERMI-gated security information | EU / accredited bodies | Certification of company and technician (per `data-strategy.md`) | Keys, immobiliser data | Portal | n/a | **excluded** (security class; owner decision) |

Counts: ingest 3 (G1 to G3), cross-check 9 (G4, G5, G7, G9, G11, G12, G14, G23, partly G6 as evidence), manual-read-only 8 (G6, G8, G10, G13, G15, G20 to G22), excluded 6 (G16 to G19, G24, G25) plus G26. The executive-summary counts are rounded; this table governs.

## 3. Sources (detail)

### 3.1 NHTSA manufacturer communications ("TSB flat file")

- **URLs:** layout `https://static.nhtsa.gov/nhtsa/downloads/Temp/MfrComms.txt` (read, high); older layout `http://www-odi.nhtsa.dot.gov/downloads/folders/TSBS/TSBS.txt` (the catalog's described-by link; not fetched). An earlier draft named a `static.nhtsa.gov/odi/ffdd/tsbs/` path; the catalog does not list it, so it is dropped; catalog `https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-technical-service-bulletins-system-tsbs-downloa` (read, high); Socrata view `https://data.transportation.gov/d/hczg-qbhf`; zip `http://www-odi.nhtsa.dot.gov/downloads/folders/TSBS/FLAT_TSBS.zip` (exact URL listed on the catalog page, plain http, older host; fetch status not tested).
- **Owner:** US Department of Transportation, NHTSA, Office of Defects Investigation.
- **Licence:** catalog shows rights "public" and access level "public"; no licence field (high). Description says: summaries of manufacturer service bulletins by model year, make, model, optional component field; does not include all bulletins; excludes general safety recall bulletins (high).
- **Coverage:** communications received by NHTSA since 1 January 1995 (high, from layout). Dataset last modified 2026-09-03; catalog checked 2026-10-15 (high). Layout change log: 2007-09-14, 2008-08-22, 2008-09-18, 2024-05-03 (rename from TSBS.txt to MfrComms.txt, new fields, reordering) (high).
- **Fields (14):** NHTSA ID; replacement bulletin number (deprecated); date added; TSB/document id; manufacturer communication date; manufacturer campaign id or software version; communication type (SBR, SCA, WPE, OTA, EMI, OTH); make; model; model year (9999 if unknown); NHTSA components (up to five, comma separated); manufacturer component system; manufacturer component subsystem; summary (4,000 characters, expanded from 240 in May 2024) (high).
- **Why it matters:** the summary was 240 characters until May 2024. Older rows are short and rarely hold a code with context; newer rows may be richer. Row-count and code-mention rate by year is therefore needed before planning (Gaps G1).
- **Size:** not measured (file not downloaded in this run).
- **Format:** TAB-delimited text; CSV mime type on the catalog; zip.
- **How to cite:** "NHTSA, Manufacturer Communications flat file, NHTSA ID <id>, file layout dated <date>, retrieved <date>"; record the file's last-modified date and the NHTSA ID plus manufacturer document id. Cite the bulletin, not the file.
- **Access rules:** data.transportation.gov robots.txt (all agents) sets `Crawl-delay: 1` and disallows faceted browse/catalog/page query URLs plus `/OData.svc/`, `/api/odata/`, `/api/collocate*`, `/login`, `/tiles/` and a few others (high, read in full). Bulk-file downloads are not listed; Socrata OData endpoints are, so do not use them. `static.nhtsa.gov` robots.txt returned a not-found error, so no restriction stated (high). `www.nhtsa.gov` blocked automated fetch with a 403 access-denied page (high). Plan: download the zip once per month, never crawl pages.
- **Quality:** real-world, uneven, written by manufacturers; does not include all bulletins (stated). Component fields are structured. Code mentions are free text (medium).
- **Verdict: ingest.** Extract only: ids, make, model, year, component fields, bulletin date, and any code tokens matched by our decoder. Do not store summary text in the pack. Our own sentences are written later from a read of the bulletin.

### 3.2 NHTSA complaints flat file

- **URLs:** layout `https://static.nhtsa.gov/odi/ffdd/cmpl/CMPL.txt` (read, high); catalog `https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-complaints-complaints-flat-file` (read, high); Socrata `https://data.transportation.gov/d/jhit-z9cc`; zip `FLAT_CMPL.zip` (listed). The catalog lists `http://www-odi.nhtsa.dot.gov/downloads/folders/Complaints/FLAT_CMPL.zip` and `.../Complaints/CMPL.txt` (high). A search summary mentioned five-year split zip files; **unverified**, treat as unknown.
- **Licence:** rights "public", no licence field (high). Modified 2026-09-03.
- **Coverage:** safety-related defect complaints since 1995 (medium, from search snippet of the layout intro).
- **Fields (51, max record 2,824):** includes make (MAKETXT, 25), model (256), year (YEARTXT, 9999 if unknown), component description (COMPDESC, 128), narrative (CDESCR, 2,048), miles, crash/fire/injury/death flags, fuel type, transmission type, ABS/cruise flags, repaired flag, plus dealer name, phone, city, state, zip and a partial VIN (CHAR 11), city and state of the owner (high). Fields 50 and 51 were added 2026-04-30; field 51 is a vehicle-operator field, so personal data is present beyond dealer fields 41 to 45, VIN (15), city (13), state (14) (high). May 2021 content change noted; the complaint id is updateable, so a record can change between files (search snippet of the layout, medium).
- **Size:** not measured.
- **How to cite:** "NHTSA complaint <CMPLID>, ODI number <ODINO>, retrieved <date>". Because ids can change, also record file date.
- **Access rules:** as 3.1. The `api.nhtsa.gov` usage page says the API is not meant for other applications' bulk VIN lookups, with automated traffic rate control (high). It addresses VIN lookups only; prefer the flat file for bulk work.
- **Quality:** owner-written, short, unverified; but they name symptoms and sometimes codes that a dealer read out. Narratives can contain personal data and partial VINs.
- **Verdict: ingest as existence and symptom evidence only.** Do not store narrative text, city, state, dealer fields or VIN fragments. Keep make, model, year, component, counts, and code tokens. Privacy review before storing even those at row level; aggregates are safer (counts by make, model-year, code).

### 3.3 NHTSA recalls flat file

- **URLs:** layout `https://static.nhtsa.gov/odi/ffdd/rcl/RCL.txt` (read, high); catalog `https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-recalls-complaints-flat-file` (read, high); Socrata `https://data.transportation.gov/d/amr3-cz7s`; RCL.txt listed at `http://www-odi.nhtsa.dot.gov/downloads/folders/Recalls/RCL.txt`.
- **Licence:** rights "public", no licence field. Modified 2026-09-02 (high).
- **Fields (29):** make (3), model (4), year (5), component name (7), defect summary (20), consequence summary (21), corrective action (22), notes (23), recalled component id (24), manufacturer component name, description and part number (25 to 27), do-not-drive and park-outside flags (28 to 29) (high). May 2025: field 19 reduced, fields 20 and 22 raised to 6,000 characters (high).
- **Why it matters:** recalls give the cleanest public link between a make/model/year, a component and a safety remedy. They seldom name a diagnostic code. Useful to rank which components to explain first and to mark safety-class areas.
- **Quality:** high (regulated filing). Narrow in scope: safety defects only.
- **Verdict: ingest** structured fields; text cross-check only.

### 3.4 NHTSA APIs and vPIC

- **URLs:** `https://api.nhtsa.gov/` fetch in this run returned a usage-policy page: not meant for other applications' bulk VIN lookups, automated rate control, last updated Jan 2023 (high). An earlier draft said the fetch was a 404; that was not reproduced. vPIC: `https://vpic.nhtsa.dot.gov/api/` (read, high).
- **vPIC facts:** VIN decode (standard, flat, extended), batch up to 50 VINs, make/model/type lists, manufacturer and WMI details; JSON, XML or CSV; standalone database download linked from the site; no DTC data mentioned (high). Terms beyond rate control not stated on the page read.
- **Use:** make and model name normalisation so our evidence ledger joins NHTSA rows to our chassis labels. No fault text.
- **Verdict: cross-check** (vPIC for names). Do not use the web API for bulk jobs.

### 3.5 CARB: 13 CCR 1968.2 and OBD program

- **URL:** `https://www.law.cornell.edu/regulations/california/13-CCR-1968.2` (read, first 100,000 of about 772,594 characters in this run; the sibling note read it fully on 2026-11-20).
- **Owner:** California Air Resources Board; page hosted by Cornell LII. No reuse notice in the visible part (high).
- **Covers (per sibling note, high):** standardised fault codes per SAE J2012; incorporation of J2012 (March 2013) and J2012-DA (January 2013); 2-byte codes for J1979 and 3-byte for J1979-2; manufacturer-defined codes with Executive Officer approval. In the first 100,000 characters read here, fault code storage (pending, confirmed) appears in section (d)(2); the manufacturer-code approval and description provisions were not located in that slice (low on location only; the sibling note read them).
- **Programme page:** `https://arb.ca.gov/msprog/obdprog/obdprog.htm` redirects (301) to `https://ww2.arb.ca.gov/sites/default/files/classic/msprog/obdprog/obdprog.htm`; the redirected page fetch returned a 404, so the current OBD programme page URL is **not verified** (high that the old URL path is broken). `ww2.arb.ca.gov/robots.txt` is a standard Drupal-style file with major engines allowed (high on existence; full rule list not read).
- **Format:** HTML on LII; PDF on CARB.
- **How to cite:** "Cal. Code Regs. tit. 13, section 1968.2, as read at LII on <date>, subsection <x>".
- **Quality:** authoritative, legally binding; long.
- **Verdict: cross-check** for structure. No code list exists here (high).

### 3.6 EPA

- **40 CFR 86.1806 (OBD) and 86.1808-01 (maintenance instructions, service information):** GPO PDFs for 2011 and 2014 editions and the LII page for 86.1808-01 exist (search results, medium). Content of the paragraph on web-based service information not read.
- **History:** the 2001 proposal and 2003 final rule required full-text emission-related service information on the web (search snippets, medium). Goal: independent shops get what dealers get.
- **IACD-2026-08:** a search snippet said a 2026 EPA letter says manufacturers must give owners and third parties the same service information they give their own service centres, without proprietary design elements or software code. The fetch of the PDF redirected to the generic EPA air-pollution page; content **unverified**.
- **Access rules:** US federal documents on epa.gov and govinfo.gov; robots not read.
- **Verdict:** G9 cross-check; G10 manual-read-only, PARTIAL.
- **Practical angle (medium):** manufacturers' own emission-related service-information websites exist because of EPA rules. Individual terms of each manufacturer site are not reviewed (see sibling per-make notes and Gaps G6).

### 3.7 EU type-approval

- **2018/858 Annex X:** read on `https://legislation.gov.uk/eur/2018/858/annex/X?view=plain` (a UK retained-law copy, amended by UK instrument S.I. 2022/1273; high). Point 2.5 lists: vehicle identification; service handbooks and records; technical manuals; component and diagnostic data such as theoretical measurement ranges; wiring diagrams; **diagnostic trouble codes including manufacturer specific codes (2.5.6)**; software calibration identification numbers; information delivered through proprietary tools; data record and two-directional test data; standard work units; multi-stage approval information (high). Point 6: website standard and a machine-readable parts database keyed to VIN (6.1); secure-access rules (6.2 to 6.3, 6.7); reprogramming standards (6.4 to 6.5); **6.6 emission-related DTCs must be consistent with the referenced EU annexes (2017/1151 Annex XI, and 582/2011 Annex X)**; alternative fuel retrofit (6.9) (high). Appendix 2 point 3.1.2 covers fault codes that do not follow the standard (high).
- **Current EU text:** the UK copy is dated. A search snippet shows delegated regulation 2026/699 (adopted as C(2026) 1811) amending Annex X; not read (low). Use the EUR-Lex consolidated version before citing.
- **2017/1151:** defines malfunction by reference to its Annex XI; Appendix draws on UN R83 (search snippet, medium). Operative DTC-storage paragraphs not read.
- **ISO 15031-6:** per reseller descriptions, defines DTC format and text descriptors and relies on SAE J2012-DA as the register of standardised codes and failure types (medium). A 1999 directive adopted the ISO 15031-6 P0 code sets (medium).
- **Licence:** Commission Decision 2011/833/EU sets reuse of Commission documents; Commission legal notice says EU-owned web content is generally CC BY 4.0, with exceptions for third-party rights and for other EU institutions' works (medium, search snippets; the decision text itself not read). Legal acts published in the Official Journal are treated separately in EUR-Lex terms (not read). **Cite the OJ reference and ELI; verify the reuse statement on EUR-Lex before bulk copying legal text.** We copy no regulation text into packs anyway.
- **Access rules:** `https://eur-lex.europa.eu/robots.txt` lists `Crawl-delay: 10` and disallows several endpoints (autocomplete, eli-search, export-documents, expert-search-form, print-pdf, smartapi, and `legal-content/<lang>/TXT/DOC/` and `/SIG/` paths); one agent (Sogou) is blocked entirely (high, read in full; which agent group the crawl delay applies to was unclear in the extract). Read single documents by hand at a slow rate; no bulk crawling needed.
- **Verdict:** G11, G12, G14 cross-check; G13 manual-read-only, PARTIAL.
- **What the EU does not give:** a table of manufacturer-specific codes. The right is to obtain them from the manufacturer's portal, per vehicle (high from Annex X wording). Whether any portal content may be republished is a per-portal term; none read for this note.

### 3.8 UNECE

- **UN GTR No. 5 (heavy-duty OBD, WWH-OBD):** UN Digital Library records exist (for example records 664004 and 579592) and WP.29 working documents from 2006 to 2011 describe it, including a Module B corrigendum and an amendment proposal from the EU (search results, medium). Origin: proposed by the US as technical sponsor under the 1998 Global Agreement (medium).
- **Fetch (earlier attempt):** `unece.org` GTR page returned 403 to automated fetch (high). Terms of use not read.
- **UN Regulation 83:** referenced from 2017/1151 (medium).
- **Covers:** technical OBD requirements and test provisions. No DTC meaning table found (medium).
- **Format:** PDF.
- **How to cite:** "UN GTR No. 5, <module>, WP.29 document ECE/TRANS/WP.29/<n>, UN Digital Library record <n>".
- **Verdict: manual-read-only**, PARTIAL. Use only if heavy-duty becomes in scope (it is not in scope today).

### 3.9 SAE and ISO public summaries

- **SAE J2012 and J2012-DA:** definitions are SAE property; DA reseller price EUR 840 excluding VAT for the October 2025 edition (medium, from sibling note). The SAE standards page for J2012 returned only site boilerplate, so no new fact was read.
- **ISO page for the standard (iso.org/standard/66369.html):** 403; the number may not be 15031-6 (not confirmed). Use reseller or national-body pages for the public abstract (BSI, AFNOR, SAI Global, iTeh, EVS appear in search results; medium).
- **What a public summary can give us:** scope statements, edition dates, and the fact that generic code definitions are in a paid register. Not meanings.
- **Verdict:** G16 to G19 excluded as text sources; cite as references.

### 3.10 Academic

- **CAREP (arXiv 2602.01155):** Math, Lorenz, Oelsner, Lienhart; ICLR 2026 workshop, 7 pages; large automotive dataset with over 29,100 unique DTCs and 474 error patterns; dataset release not stated on the page; licence CC BY-NC-ND 4.0 (high). The DTCs are from an industrial source (closed). Not usable.
- **Other hits (not read):** MDPI Electronics 14(21) 4180 (knowledge-graph from diagnostic dialogue dataset; 403); Uni Augsburg thesis; CEUR-WS Vol-4085 paper 1; Waterloo IEEE Software 2025 paper on DTC implementation inconsistencies; SAE paper 2026-26-0664 (sibling note: closed data); Preprints 202503.1268.
- **Search outcome:** no Zenodo, Kaggle or arXiv DTC-meaning corpus under a verified open licence turned up in this run (high that the search did not surface one; not proof none exists). The sibling note found OBDex (CC0) and others.
- **Verdict:** manual-read-only. Possible use: ideas for code-relationship evidence (the DTC inconsistency study suggests manufacturers disagree on naming), not data.

## 4. Machine-readability matrix

| Source | Machine-readable? | Under what licence | Contains code text? |
|---|---|---|---|
| NHTSA bulletins | Yes, tab text, documented layout | "public", no licence field | Free text, sometimes |
| NHTSA complaints | Yes, 51-field layout | Same | Free text, sometimes; personal data present |
| NHTSA recalls | Yes, 29-field layout | Same | Rarely |
| vPIC | Yes, JSON/XML/CSV | Usage policy only | No |
| CARB regulation | HTML/PDF, parseable | Law; no notice seen | No code list |
| EU annexes | HTML/PDF, ELI | Generally CC BY 4.0 (medium) | No code list |
| UNECE | PDF | Not read | No |
| SAE and ISO | Paid files | Paid, copyrighted | Yes, but closed |
| Papers | PDF | Per paper (this one CC BY-NC-ND) | Closed data |

## 5. Ingest recipe (for the harvester in `dtc-coverage-strategy.md` section 4)

1. Download the three NHTSA zips once a month into an empty folder; keep the layout files and record last-modified dates in the ledger.
2. Parse with a script kept in a different folder; run Python with `-I`.
3. Keep only: NHTSA id, document id, dates, make, model, year, component fields, communication type; plus decoded code tokens found in the summary by our own decoder (format-checked), with the offset in the text.
4. Never store summary or narrative text in a pack. A reviewer who opens a bulletin writes the sentence in their own words with an `nhtsa-tsb:<id>` source tag (matches the tag pattern in `dtc-open-generic-datasets.md`).
5. For complaints keep counts only (make, model, year, component, code token, count), no city, state, dealer, VIN fragment, free text.
6. Log the run, file dates and row counts in `SOURCES.md`.

## 6. Risks specific to this set

- **"Public" is not a licence.** The catalog says rights "public". For US federal works the usual reading is no copyright for works by federal employees; but the bulletins are written by manufacturers and hosted by NHTSA, so the manufacturer's copyright can still apply to the text (medium). Hence facts only.
- **Personal data in complaints.** Partial VIN, city, state, dealer phone. Do not retain. Check privacy rules before even aggregate storage by make and year.
- **Code mentions are sparse and inconsistent** (low; unmeasured). A bulletin can name "P0A80" or a manufacturer-specific code in a heading, in a table, or not at all.
- **Edit churn.** Complaint ids are updateable; record file dates.
- **Rate and access.** `www.nhtsa.gov` blocks scripted fetch; use the flat files on `static.nhtsa.gov`, `data.transportation.gov`, and the documented zips only.
- **Regulation text is not a source for meaning.** Quoting a regulation to explain a manufacturer code would be a category error and a copyright risk for the paid standards it incorporates.

## 7. Cross-check use in the pipeline

| Question | Use |
|---|---|
| Does this manufacturer code circulate on this model? | NHTSA bulletin and complaint token counts |
| Which components are safety-critical for this model? | Recall component field |
| Is our decoder shape legal under CARB? | 13 CCR 1968.2 (2-byte versus 3-byte rule) |
| Can an independent shop obtain the code list from the OEM? | EU Annex X 2.5.6 (right) plus the portal's own terms |
| Do two public lists agree because they share a source? | Not answerable from government sources; see sibling note |

## 8. Gaps

- **G1. No NHTSA file was downloaded.** Sizes, row counts, and the share of rows mentioning a diagnostic code (by make, by year, before and after the May 2024 change to 4,000-character summaries) are all unmeasured. First next step: one monthly download in a clean folder, then count tokens matching code shapes for BMW, Mercedes, Toyota, Lexus. Permission to download needed per safety rules (state the filename, source and size when asking).
- **G2. Licence of NHTSA files.** Only "public" with no licence field. Ask NHTSA or check the DOT open-data policy page; counsel to rate the manufacturer-copyright point.
- **G3. CARB programme page.** Old URL redirects to a 404 path; the current OBD programme and mail-out (MAC) pages were not located. The sibling note's CARB rulemaking record links (arb.ca.gov/regact/obd02/fsor.pdf) came from search snippets only.
- **G4. CARB 13 CCR 1968.2.** Only the first 100,000 of about 772,594 characters were read in this run; locations of the manufacturer-code approval and description provisions not re-confirmed here (the sibling note confirmed them).
- **G5. EPA.** IACD-2026-08 not verified; 40 CFR 86.1808-01 service-information paragraph not read; free-of-charge status of emission-related service information websites not verified.
- **G6. Manufacturer service-information sites** (the EPA and EU implementations) were not read for their terms. Needed per OEM: price, scope, automated-reading rules, redistribution terms. Not attempted here.
- **G7. EU:** current consolidated Annex X (post 2026/699), 2017/1151 Annex XI DTC paragraphs, 582/2011 Annex X, and the exact EUR-Lex reuse wording for Official Journal content were not read. UK copy read instead.
- **G8. UNECE and ISO sites returned 403.** GTR No. 5 current consolidated text, UN R83 and ISO catalog pages unverified. No page read confirms the ISO number for 15031-6 beyond reseller snippets.
- **G9. SAE:** terms on use of J2012 titles still unread (also open in sibling note).
- **G10. Academic search was one query plus two fetches.** No systematic search of Zenodo, Kaggle, Hugging Face, figshare or university repositories for DTC corpora under open licences. MDPI paper unread (403). CEUR and Augsburg items unread.
- **G11. Other governments not covered:** UK DVSA/DfT, Transport Canada, Australia (NTI), Japan MLIT, India. UK retained-law copy of EU rules was read only as a convenience.
- **G12. NHTSA investigation, TSB PDFs on static.nhtsa.gov, and ODI "Preliminary Evaluation" files** (which sometimes cite codes) not examined.
- **G13. robots.txt for `www-odi.nhtsa.dot.gov` and `api.nhtsa.gov`** not read; only `static.nhtsa.gov` (no file), `data.transportation.gov` (crawl-delay 1, read in full), `ww2.arb.ca.gov` (partial) and `eur-lex.europa.eu` (crawl-delay 10, read in full) were.
- **G14. Heavy-duty (J1939 SPN/FMI)** government sources not searched beyond GTR No. 5; the sibling note found none.

## 9. Recommendations

1. Run the one-time NHTSA download and measure G1 before spending harvester hours (estimated 3 to 6 hours, low confidence). Decision by owner: allow the download (needs a yes).
2. Cite CARB and EU texts for structure; add rows to `SOURCES.md` marked `law:` not `data:`.
3. Do not put any government text in packs. Evidence ledger only.
4. Ask counsel one question: do bulletins hosted by NHTSA carry the OEM's copyright for the summary field, and may we store code tokens plus ids? (Same hour as strategy section 12.)
5. Defer UNECE, heavy-duty, and non-US governments until light-duty coverage exists.

## 10. URL list (all as seen in this run; status in brackets)

- https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-technical-service-bulletins-system-tsbs-downloa [read]
- https://static.nhtsa.gov/nhtsa/downloads/Temp/MfrComms.txt [read]
- https://data.transportation.gov/d/hczg-qbhf [named by catalog; not fetched]
- http://www-odi.nhtsa.dot.gov/downloads/folders/TSBS/FLAT_TSBS.zip [named by catalog; not fetched]
- http://www-odi.nhtsa.dot.gov/downloads/folders/Complaints/FLAT_CMPL.zip [named by catalog; not fetched]
- https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-complaints-complaints-flat-file [read]
- https://static.nhtsa.gov/odi/ffdd/cmpl/CMPL.txt [read]
- https://data.transportation.gov/d/jhit-z9cc [named; not fetched]
- https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-recalls-complaints-flat-file [read]
- https://static.nhtsa.gov/odi/ffdd/rcl/RCL.txt [read]
- https://data.transportation.gov/d/amr3-cz7s [named; not fetched]
- https://vpic.nhtsa.dot.gov/api/ [read]
- https://api.nhtsa.gov/ [usage text read]
- https://www.nhtsa.gov/nhtsa-datasets-and-apis [403]
- https://www.nhtsa.gov/nhtsa-privacy-policy [403]
- https://www.law.cornell.edu/regulations/california/13-CCR-1968.2 [partly read]
- https://arb.ca.gov/msprog/obdprog/obdprog.htm [301 then 404 on target]
- https://legislation.gov.uk/eur/2018/858/annex/X?view=plain [read; UK copy]
- https://eur-lex.europa.eu/eli/reg_del/2026/699/oj/eng [search result; not read]
- https://eur-lex.europa.eu/robots.txt [read]
- https://data.transportation.gov/robots.txt [read]
- https://ww2.arb.ca.gov/robots.txt [partly read]
- https://commission.europa.eu/legal-notice_en and https://eur-lex.europa.eu/eli/dec/2011/833/oj [search results; not read]
- https://digitallibrary.un.org/record/664004 and /record/579592 [search results; not read]
- https://unece.org/transport/standards/transport/vehicle-regulations-wp29/global-technical-regulations-gtrs [403]
- https://www.govinfo.gov/link/fr/68/38452 and https://www.law.cornell.edu/cfr/text/40/86.1808-01 [search results; not read]
- https://www3.epa.gov/otaq/datafiles/IACD-2026-08.pdf [302 redirect; unverified]
- https://arxiv.org/abs/2602.01155 [read]
- https://www.mdpi.com/2079-9292/14/21/4180 [403]
- https://www.iso.org/standard/66369.html [403]
- https://www.sae.org/standards/content/j2012_202204/ [boilerplate only]
- https://www.motor.com/products-services/data-products/diagnostic-trouble-codes/ and https://drivesomethinggreater.com/products/Diagnostics-Data [search results; commercial]

## 11. Per-source record card (fields the ledger needs)

Each card repeats the minimum the task asks for, in one place, so a `SOURCES.md` row can be written without re-reading section 3.

### NHTSA manufacturer communications
- URL: layout https://static.nhtsa.gov/nhtsa/downloads/Temp/MfrComms.txt ; catalog on catalog.data.gov (section 10).
- Owner: US DOT / NHTSA. Licence: rights "public", no licence field.
- Covers: all makes, bulletins since 1995, not every bulletin. Size: unmeasured. Format: tab text in zip.
- Cite: NHTSA ID plus manufacturer document id plus file date.
- Access: bulk file download; no scripted crawling of www.nhtsa.gov (403 to automation).
- Quality: medium; structured component fields, free-text summary.
- Verdict: ingest (facts only).

### NHTSA complaints
- URL: layout https://static.nhtsa.gov/odi/ffdd/cmpl/CMPL.txt.
- Owner: NHTSA. Licence: "public", no licence field.
- Covers: owner complaints, all makes, since 1995. Size: unmeasured. Format: tab text.
- Cite: complaint id plus ODI number plus file date (ids can change).
- Access: bulk file; API not for bulk use.
- Quality: low to medium; unverified owner narratives; personal data present.
- Verdict: ingest counts only.

### NHTSA recalls
- URL: layout https://static.nhtsa.gov/odi/ffdd/rcl/RCL.txt.
- Owner: NHTSA. Licence: "public", no licence field.
- Covers: safety recalls; component id and manufacturer part number fields. Size: unmeasured. Format: tab text.
- Cite: campaign id, component id, file date.
- Quality: high for scope, narrow.
- Verdict: ingest structured fields.

### CARB 13 CCR 1968.2
- URL: https://www.law.cornell.edu/regulations/california/13-CCR-1968.2.
- Owner: CARB (law); LII hosts. Licence: none shown in text read.
- Covers: light-duty OBD II rules; no code list. Size: about 772,594 characters. Format: HTML.
- Cite: section and subsection plus retrieval date.
- Access: static HTML, ordinary reading.
- Quality: high authority.
- Verdict: cross-check.

### EU 2018/858 Annex X
- URL: https://legislation.gov.uk/eur/2018/858/annex/X?view=plain (UK copy); use EUR-Lex consolidated text for EU citation.
- Owner: EU legislator; UK copy by UK National Archives. Licence: EU content generally CC BY 4.0 (medium); UK copy shows no licence line.
- Covers: right of independent operators to OBD and repair info, including manufacturer DTCs (2.5.6). Size: one annex. Format: HTML, PDF.
- Cite: "Regulation (EU) 2018/858, Annex X, point 2.5.6", ELI, consolidated date.
- Access: EUR-Lex crawl-delay 10; no bulk need.
- Quality: high; right only, not data.
- Verdict: cross-check.

### EPA 40 CFR 86.1806 and 86.1808
- URL: GPO PDFs and LII page (see section 10; not read in full).
- Owner: US EPA via GPO. Licence: federal law (medium). Covers: OBD fault code standard reference; service-information availability. Format: PDF, HTML.
- Cite: CFR section and edition year. Verdict: cross-check.

### UN GTR No. 5 and UN R83
- URL: UN Digital Library records and unece.org (403).
- Owner: UNECE WP.29. Licence: not read. Covers: heavy-duty OBD (GTR 5), light-duty emission approval (R83). Format: PDF.
- Cite: WP.29 document number plus record number. Verdict: manual-read-only, PARTIAL.

### SAE J2012, J2012-DA, J1979
- Owner: SAE. Licence: paid, copyrighted. Format: paid files. Verdict: excluded for text; cite only.

### ISO 15031-6, 14229, 15765
- Owner: ISO. Licence: paid. Verdict: excluded for text; cite only.

### Academic items
- CAREP arXiv 2602.01155: CC BY-NC-ND 4.0; private data; manual-read-only.
- Others: unread; PARTIAL.

## 12. Excluded, with reasons

| Item | Reason |
|---|---|
| SAE J2012 and J2012-DA text, any copy | Paid and copyrighted; SAE wording would carry through |
| Scribd and SlideShare copies of J2012 or tool manuals | Unlicensed copies of copyrighted work; already on the never-load list in `dtc-coverage-strategy.md` 2.3 |
| Haynes fault-code pages | Commercial publisher text |
| MOTOR diagnostic trouble code product | Paid licensed data product (vendor page, terms not read) |
| Volkswagen Group "Diagnostics Data" | Sold to tool makers (page title and snippet); paid |
| ISO 15031-6 and ISO 14229 text | Paid standards |
| Manufacturer repair portals reached through the EU right | The right is to access, not to republish; portal terms per OEM unread; paying customer may read to understand |
| SERMI-gated information | Security class, company certification, out of scope by owner decision |
| CAREP data | Not released; paper licence forbids derivatives |

## 13. Plain-words notes for the owner

- Governments tell us how fault codes are built and who must share repair information. They do not publish a list of what each car maker's own codes mean.
- The best free government material is the US bulletin, complaint and recall files. They are large, free and public, but the code mentions are an unmeasured fraction. One download and one count settles it.
- The EU right-to-repair rule helps a paying repair shop, not an open dataset.
- Nothing here changes the licence plan. No government or standards text goes into our packs.
