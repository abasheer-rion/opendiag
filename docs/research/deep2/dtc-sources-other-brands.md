# Legitimate public sources of manufacturer fault codes: VW group, Ford, GM, Stellantis, Honda, Hyundai/Kia, Nissan, Volvo, Subaru, Mazda, Tesla

Research run: 2026-11-20. Topic: other-brands-and-languages. Status: **PARTIAL** (see Gaps). Not legal advice.
Extends, does not repeat: `docs/plan/dtc-coverage-strategy.md` (rungs A/B/C, section 2), `docs/plan/data-strategy.md` (section 3), `docs/research/deep2/dtc-open-generic-datasets.md` (dataset scoreboard), and the BMW, Mercedes, Toyota notes in the same folder.

Method and honesty rules for this note:
- Tools this run: web search (summaries only) and the existing repo notes. I did **not** open the individual portal terms pages, robots.txt files, or the NHTSA bulk files. Every licence or terms line below is therefore "not read" unless it says it came from the existing repo notes.
- Where a search returned a snippet, I say "search snippet". Where a fact comes from an earlier repo note, I say "repo note".
- No fault text was copied. Only facts about the sources are recorded.
- Confidence tags: high = seen on a primary page or repo note that read it; medium = search snippet from a reasonably authoritative page; low = inference or third-party page.
- Today is 2026-11-20. Nothing here was fetched twice; prices and portal names can be stale.

---

## 1. Executive summary

1. **There is no clean, free, per-brand manufacturer fault-code list for any of these 11 brands.** Same finding as for BMW, Mercedes and Toyota (repo notes). The legitimate material is scattered: government bulletin files, paid-but-public manufacturer portals, owner manuals, and forum knowledge (medium-high).
2. **The one source that covers every brand at once is NHTSA's manufacturer-communications and bulletin data.** It is a US government file set, covers all makes sold in the US, and is the same facts-only route already chosen for BMW, Mercedes and Toyota. Search found two datasets: a Manufacturer Communications file (all records since 1 Jan 1995, tab-delimited, with a data dictionary) and a Technical Service Bulletins summary download (by year, make, model, flagged as incomplete) (search snippet, medium). Reuse licence of the underlying bulletin PDFs is OEM copyright (repo note: no reuse licence).
3. **Every major manufacturer sells short-term access to its own service portal.** Examples seen: Ford Motorcraft Service (terms of 72 hours, 30 days, 1 year are search-snippet only; Ford page says TSBs 1994 to present), Honda (portal techinfo.honda.com; prices not verified), HyundaiTechInfo (1 week $40, 1 month $60, 1 year $600 in a 2021 PDF, read), Volvo (72-hour $40.50 on a Jan 2023 page, read), Kia via a Snap-on-run portal, Stellantis TechAuthority, Nissan/Infiniti, BMW/Mini, Genesis (search snippets, medium to low). These portals carry fault-code (DTC) charts. They are **not open data**. Reading one as a paying user is allowed by the portal; copying text out of it is not, and it makes the reader a "tainted reader" for that brand under the existing coverage strategy (section 2.3 rung C).
4. **Tesla is the outlier and the best-documented public source.** `service.tesla.com` hosts public service manuals (Model S 2012-2020, Model X, Roadster issue articles) and `tesla.com/ownersmanual` has a public "Troubleshooting Alerts" page per model. A Model X article dated January 2026 describes DTCs in Service Mode, and says DTCs differ from alerts (search snippet, medium). Tesla does not mainly use classic OBD-II codes, so this does not feed the OBD-II code table; it feeds an "alerts" table (low fit, high clarity).
5. **VW group has the largest free community footprint** (German-language wiki and forum pages, 5-digit VAG decimal codes next to P-codes, scanner-tool sites), but all of it is unlicensed third-party text of unknown origin. Use for "which codes circulate", not for text (medium).
6. **Right-to-repair rules are the legal reason these portals exist, not a licence to republish.** EU Reg 2018/858 Art 61 (repo note), US 40 CFR 86.1808-01 manufacturer-code publication duty with fair price (repo note), Australia's service-information sharing scheme (ACCC announced improvements by Mazda, Kia and BYD, search snippet, medium). Each gives access to information at a reasonable fee. None gives a reuse licence.
7. **Ranking (cheapest clean free coverage after BMW, see section 4):** 1 Ford, 2 Hyundai/Kia, 3 Honda, 4 GM, 5 VW group, 6 Tesla (different shape), 7 Volvo, 8 Stellantis, 9 Nissan, 10 Subaru, 11 Mazda. Confidence in the ranking is low to medium. The ranking is about availability of public facts, not about market size. Nothing here is measured against real bulletin counts.
8. **No source here changes the coverage plan's main stance.** Manufacturer text still comes from our own captures, NHTSA bulletin facts, and owner reports, all written in our own words. This note adds where to look per brand and what to skip.
9. **Other languages help with recall, not with text.** German (VW group, Mercedes, BMW), Japanese (Honda, Nissan, Subaru, Mazda, Toyota), Russian, Spanish and Portuguese communities hold the most real-world "what fixed it" knowledge. Search found one Japanese government PDF and an English-language technical index; no Japanese community code list was found in one search (low). See section 7.
10. **Owner decisions needed:** none new. The existing decision 3 in the coverage strategy (bounded local bulletin download) covers the NHTSA route. One new ask: allow a separate bounded bulletin download for Ford, GM, Honda, Hyundai/Kia (section 9).

---

## 2. Source table (one row per source or source family)

Columns: Owner, Licence/terms (how known), Coverage, Size, Format, Cite as, Automated-access rules, Quality, Verdict.
"NR" = not read in this run. Verdicts: ingest, cross-check, manual-read-only, excluded.

| # | Source | URL | Owner | Licence / terms | Coverage | Size | Format | Verdict |
|---|---|---|---|---|---|---|---|---|
| S1 | NHTSA Manufacturer Communications file | https://static.nhtsa.gov/nhtsa/downloads/Temp/MfrComms.txt | US DOT / NHTSA | Data page lists no named licence (rights marked "public"); fetched 2026-11-20 | All makes, comms since 1995; the file was renamed from TSBS.txt in May 2024, so S1 and S2 are likely the same data lineage | no size stated on page | Tab-delimited text, 14+ columns (incl. make, model, year, component, 4000-char summary) | **ingest (index only)** |
| S2 | NHTSA TSB summary download (ODI) | Catalog entry lists http://www-odi.nhtsa.dot.gov/downloads/folders/TSBS/TSBS.txt and FLAT_TSBS.zip (the static.nhtsa.gov path is NOT confirmed); catalog: https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-technical-service-bulletins-system-tsbs-downloa | NHTSA ODI | No named licence; rights "public"; last updated 2026-09-03 per catalog; says it does not hold all bulletins, excludes safety-recall bulletins | All makes, by year/make/model | not measured | Delimited text, zipped per year | **ingest (index only)** |
| S3 | NHTSA bulletin PDFs | https://static.nhtsa.gov/odi/tsbs/{year}/MC-{id}-{seq}.pdf (pattern seen in repo note) | Each OEM (copyright), hosted by NHTSA | OEM copyright, no reuse licence (repo note) | Per bulletin | Many; not counted | PDF | **ingest facts only** (bounded) |
| S4 | NHTSA manufacturer-communications index and dashboard | https://www-odi.nhtsa.dot.gov/mc/ | NHTSA | NR | Index of comms by manufacturer | not measured | HTML | cross-check (finding aid) |
| S5 | Ford Motorcraft Service (public purchase) | via ford.com help page: https://www.ford.com/support/how-tos/ford-services/parts-and-service/where-can-i-get-self-repair-and-technical-information/ | Ford | Paid subscription; Ford page confirms contents (workshop, wiring, PC/ED, TSBs) but states no durations (72-hour/30-day/1-year is search snippet only); portal terms NR | Vehicle-specific info last 10 model years; limited line coverage and TSBs 1994 to present | not measured | Web/PDF | **manual-read-only** |
| S6 | Ford Quick Guides and owner manuals | https://www.ford.com/support/how-tos/search/manuals/ | Ford | Free to read; reuse terms NR | Ford, recent model years; warning-light level | not measured | PDF/HTML | cross-check |
| S7 | Ford diagnostic trouble codes help page | https://www.ford.com/support/how-tos/search/diagnostic-trouble-codes/ | Ford | NR | Generic explanation | small | HTML | cross-check (orientation) |
| S8 | Honda Service Information System (SIS) | https://techinfo.honda.com | American Honda | Paid; prices NOT verified (the $40/$175 figures came from an unread store snippet); NR | Honda/Acura; I-CAR confirms DTC keyword search on techinfo.honda.com, which the page calls "Service Express" | not measured | Web | **manual-read-only** |
| S9 | HyundaiTechInfo | https://www.hyundaitechinfo.com | Hyundai Motor America | Paid; subscription PDF https://www.hyundaitechinfo.com/external/files/HyundaiTechInfo_Service_Information_Subscriptions.pdf (read in full; dated 2021-10-26: 1 week $40, 1 month $60, 1 year $600; IRF tier 1 week $60). Includes DTC, TSBs, OBDII info | Hyundai/Genesis; shop manuals, DTC data, TSBs | not measured | Web | **manual-read-only** |
| S10 | Kia technical info (Snap-on run) | NR (portal name per search: KiaTechInfo) | Kia | Paid tiers per Opus IVS summary (2026-era); NR | Kia | not measured | Web | manual-read-only |
| S11 | Kia Australia independent-repairer page | https://www.kia.com/au/owners/independent.html | Kia Australia | NR | Kia in Australia | small | HTML | cross-check (access rules) |
| S12 | ACCC scheme news (Mazda, Kia, BYD) | https://www.accc.gov.au/media-release/mazda-kia-and-byd-improve-access-to-service-and-repair-information-after-accc-investigations | Australian regulator | Government page (media release 108/26, 16 Sept 2026, read): mandatory MVIS scheme; Kia now $136/day, BYD $140/day, Mazda undertaking | Australia | 1 page | HTML | cross-check (legal basis) |
| S13 | Volvo service portal (72-hour access) | named on https://www.aa1car.com/library/oemwebsites.htm | Volvo Car USA | Paid; aa1car page (Jan 2023, read) lists https://www.volvotechinfo.com at $40.50/72h, $322.50/month, $3,225/year; may be stale | Volvo | not measured | Web | manual-read-only |
| S14 | Stellantis TechAuthority | named in I-CAR guide https://rts.i-car.com/crn-500.html (ID not matched to a page I read) | Stellantis | Paid; NR | Chrysler/Dodge/Jeep/Ram/Fiat | not measured | Web | manual-read-only |
| S15 | Nissan/Infiniti service info | I-CAR guide https://rts.i-car.com/collision-repair-news/crn-484.html | Nissan | Paid options; NR | Nissan/Infiniti | not measured | Web | manual-read-only |
| S16 | GM service manuals (parts site) | https://www.gmparts.com/technical-resources/service-repair-manuals | General Motors | Paid manuals; NR | GM brands | not measured | Web/print | manual-read-only |
| S17 | Subaru STIS | NR (portal name only, no URL found) | Subaru | Paid; NR | Subaru | unknown | Web | PARTIAL, manual-read-only |
| S18 | Mazda service information | NR (Mazda named in ACCC release only) | Mazda | NR | Mazda | unknown | Web | PARTIAL, manual-read-only |
| S19 | Tesla public service manuals | https://service.tesla.com/docs/ModelS/ServiceManual/en-us/GUID-529D8AAF-DC49-45AB-AD34-062A6518C973.html (Model S 2012-2020), https://service.tesla.com/docs/ModelX/ServiceManual/en-us/GUID-BB78BE60-83DF-49A9-9623-5A2CA9A29A5C.html (DTCs in Service Mode) | Tesla | Terms NR; no copyright/terms notice visible in the first 100k chars of the X page (rest unread); no open licence seen | Model S, X (the X page read covers 2015-2020; update notes 2026-01-22 and 2026-02-20) (Roadster too) | not counted | HTML | **manual-read-only** (best public) |
| S20 | Tesla Roadster issue articles | https://service.tesla.com/docs/Public/Roadster/Toolbox_Articles/Roadster_Issue_Articles.pdf | Tesla | NR | Roadster fault numbers (example 1447, 1470 seen in snippet) | one PDF | PDF | manual-read-only (low value, old car) |
| S21 | Tesla owner manual "Troubleshooting Alerts" | https://www.tesla.com/ownersmanual/modely/en_gb/GUID-9A3F0F72-71F4-433D-B68B-0A472A9359DF.html (also per model) | Tesla | Terms NR | Driver-facing alerts, per model/region | one page per model | HTML | cross-check (alerts, not OBD codes) |
| S22 | AKK "Fehlercodes VAG" PDF | https://www.akk.org/~sledge/auto/Fehlercodes%20VAG%20english.pdf | Unknown personal site | None stated; provenance unknown | VAG and SAE definitions | one PDF | PDF | cross-check (orientation), low |
| S23 | carwiki.de OBD Fehlercodes | https://carwiki.de/obd-fehlercodes | Private site | None seen; NR | VW, Audi, Seat, Skoda per-code pages (search claim) | not counted | HTML | cross-check |
| S24 | Rick's Free Auto Repair Advice lists (VW, Ford, GM) | https://ricksfreeautorepairadvice.com/vw-obd2-codes/ , /obdii-manufacturer-specific-trouble-codes-ford/ , /obdii-manufacturer-specific-trouble-codes-for-gm/ | Private site | None seen; NR | VW, Ford, GM P1xxx partial | not counted | HTML | cross-check, origin unknown |
| S25 | OBDeleven code pages | https://obdeleven.com/de/fehlercodes-auto | OBDeleven (vendor) | Commercial; terms NR | VAG-oriented | not counted | HTML | cross-check, low |
| S26 | IATN DTC index (2006-2012 monthly) | https://www.iatn.net/techmail/summaries/2012/09/index-dtc.html (pattern) | IATN network | Page footer: "Copyright 1995-2017 iATN. All rights reserved"; Terms of Use not read. robots.txt read: disallows only /cgi-bin, /job/, /login, /techmail/summaries/i/latest/ | Which makes a code appears for, by month (page read lists counts, sample definitions, makes) | many pages | HTML | **cross-check** (code-to-make hints) |
| S27 | Japan MLIT PDF on information provision | https://www.mlit.go.jp/jidosha/content/001882145.pdf | Japanese ministry | Government; NR | Per maker, how to get inspection info and contacts | one PDF | PDF | cross-check (legal basis, Japan) |
| S28 | Hitachi Astemo Mazda coverage list | https://www.aftermarket.astemo.com/japan/ja/automotive/assets/docs/8000_MAZDA_car_list_24-01-24.pdf | Hitachi Astemo | Commercial doc; NR | Which Mazda models support code reading | one PDF | PDF | cross-check (which cars) |
| S29 | Haynes fault-code pages | https://us.haynes.com/pages/odb-fault-codes-car-ford | Haynes | Commercial, copyright | Generic explanation | small | HTML | excluded for ingest (paid publisher) |
| S30 | Slideshare / Scribd manufacturer lists | e.g. https://www.slideshare.net/slideshow/ford-manufacturerspecific-obd2-codes-list/251589270 | Uploaders | Unlicensed uploads | Ford, GM, VW, Audi | not counted | Slides | **excluded** |
| S31 | BentleyPublishers Audi DTC table | https://VAGLinks.com/Docs/Audi/BentleyPublishers.com_Audi_DTC_Table.pdf | Bentley (publisher), hosted by third party | Copyright publisher text | Audi | one PDF | PDF | **excluded** |
| S32 | Existing repo-note sets (Wal33D, jseobd, AndrOBD, python-OBD, OBDex, Automotive-9, kierandrewett, OBD2HQ) | see open-generic-datasets note | various | see that note | Includes VW, Audi, Ford, GM brand rows in several | see that note | JSON/CSV/props | see that note; unchanged |

---

## 3. Sources, one by one

Each entry: what, owner, terms, coverage, format, citation form, automated-access rules, quality, verdict, and open points.

### 3.1 NHTSA data (all brands)

**S1 and S2 (index files).**
- Owner: NHTSA (US Department of Transportation).
- What: S1 is the Manufacturer Communications file, "received since January 1, 1995", all records tab-delimited, with a separate data dictionary, in CSV and TSV forms (search snippet, medium). S2 is the older Technical Service Bulletins summary download, by single year, make and model, described by NHTSA as incomplete: bulletins tied to safety recalls are not included, and bulletins that may not pertain to a defect may not be included (search snippet, medium).
- Dates: data.gov entry (read) shows last updated 2026-09-03; the MfrComms file page says it was renamed from TSBS.txt in May 2024. The data.gov entry lists the `www-odi.nhtsa.dot.gov/downloads/folders/TSBS/` path (TSBS.txt, FLAT_TSBS.zip). The `static.nhtsa.gov/odi/ffdd/tsbs/TSBS.txt` path is **unconfirmed**; I did not download either file.
- Terms: no licence named on the data.gov catalog entry (read; rights marked "public"). US federal data is generally public, but the bulletins inside are written by the OEMs, so the OEM text is copyrighted (repo note). Index rows (make, model, year, component, bulletin id, date) are facts. Summary text inside rows is OEM wording: do not copy.
- Format: delimited text. Easy to parse. This is the cheapest bulk step for all 11 brands: filter rows whose summary or component mentions a code pattern, then fetch only the matching PDFs.
- Citation: "NHTSA ODI technical service bulletins, bulletin id MC-xxxxxxxx, accessed date" and the PDF URL.
- Automated reading: NHTSA datasets page was blocked in a prior run (repo note, high). Treat bulk download as an owner-approved, rate-limited job (coverage strategy decision 3). `https://static.nhtsa.gov/robots.txt` returned 404 on 2026-11-20 (no file; this is not permission).
- Quality: high for existence and applicability; medium for completeness (NHTSA says incomplete).
- Verdict: **ingest, index only**. Use to build a per-brand census: how many bulletins mention a manufacturer code, which models, which code ranges.
- Open: counts per brand unknown. I did not download either file.

**S3 (PDF bulletins).**
- Same pattern as the BMW, Mercedes, Toyota notes. URLs seen in repo note: `https://static.nhtsa.gov/odi/tsbs/2016/MC-10146779-9999.pdf` (BMW), `.../2024/MC-11012059-0001.pdf` (Mercedes), `.../2023/MC-10241404-9999.pdf` (Toyota).
- For the other brands the same host and path pattern is **expected** to work but I opened none (low).
- What we take: code, module, model/year/engine applicability, remedy class, bulletin id. What we do not take: sentences.
- Verdict: **ingest facts only**, bounded count, files kept outside the repo.

**S4 (index/dashboard).** `https://www-odi.nhtsa.dot.gov/mc/` lists manufacturer comm indexes. Good for a finding aid (which OEMs file how many). Terms NR. Verdict: cross-check.

### 3.2 Ford

**S5 Motorcraft Service.**
- Owner: Ford. Sells 72-hour, 30-day and 1-year subscriptions for vehicles 1994 and newer (search snippet, medium). Canadian listing says the subscription includes the Workshop Manual, Wiring Diagram Manual, Powertrain Control/Emissions Diagnosis (PC/ED) Manual and Technical Service Bulletins (search snippet, medium).
- Ford help page says vehicle-specific info is limited to the last 10 model years, with limited coverage back to 1994 (search snippet, medium). Hard copy manuals for older years sold through a third party (named "Helm" in the snippet).
- Fit: PC/ED is the Ford book that carries engine DTC logic. It is paid and copyrighted.
- Verdict: **manual-read-only**. A person who subscribes may read it to verify a fact from another source. Whoever reads it becomes a tainted reader for Ford under our rule (strategy 2.3).
- Terms of the portal: **not read**. Automated reading is almost certainly barred by subscriber terms (low, inference).

**S6/S7 Free Ford pages.** Quick Guides and owner manuals are free to read. They stay at warning-light level (what the driver sees). Verdict cross-check only. The Ford "diagnostic trouble codes" help page exists (search result) but is generic.

**Why Ford ranks high:** Ford P1xxx and Ford-specific self-test codes (for example KOER and KOEO test codes) are widely discussed (search snippet from a third-party Slideshare list: P1001 "KOER self test not able to complete"; this is only a pointer, do not use the text). The community has many independent explanations, and NHTSA bulletins for Ford are plentiful (assumption, not counted).

### 3.3 GM

**S16 gmparts.com service manuals.** Page: `https://www.gmparts.com/technical-resources/service-repair-manuals`. Paid (search snippet, low). Terms NR. Verdict manual-read-only.
- GM codes in the P1xxx range plus many GM-specific P0xxx-P2xxx entries exist; the Rick's page for GM lists "P1000 through P1299" and beyond (search snippet, low, origin unknown).
- ACDelco TDS (GM's short-term portal) was searched but no page was returned; **PARTIAL**: portal name, URL and price not verified.
- NHTSA bulletin volume for GM is large (assumption, low; not counted).

### 3.4 Stellantis (Chrysler, Dodge, Jeep, Ram, Fiat, PSA brands)

- Portal name from I-CAR: TechAuthority (search snippet, medium on name, no page read). Subscriptions are bought under a "Tech Authority Subscription" tab. Prices NR.
- Chrysler-specific P1xxx list: **none found** in one search (search result, low).
- PSA (Peugeot, Citroen, Opel) legacy codes appear in jseobd's PSA group (659 codes, repo note) with unknown provenance: cross-check only.
- Verdict: manual-read-only for the portal; NHTSA facts for existence.

### 3.5 Volkswagen group (VW, Audi, Seat, Skoda, Porsche, Bentley, Lamborghini)

- **Official:** ODIS (workshop tool) and the erWin portal exist; price pages not retrieved (**PARTIAL**). Content statement from a vendor page: full reading of P1xxx codes, adaptation values and sub-control units "can only be fully read with ODIS" (search snippet, low, vendor marketing).
- **Formats:** VW/Audi lists mix decimal 5-digit VAG codes (example pattern 17xxx) with P-codes (search snippet, low). Our decoder needs both. Existing repo note records a VW 191-code and Audi 539-code set in jseobd; origin unknown.
- **Community lists (S22, S23, S24, S25, S31):** exist, unlicensed, unknown origin. S31 is a publisher's own table and must be excluded.
- **Other languages:** German pages (carwiki.de, obdeleven.com/de) are the densest. Czech and Spanish pages not searched.
- **Slideshare "OBDCodex" lists** for VW and Audi (S30) are bulk uploads; excluded.
- Audi note from the coverage strategy: a copied-looking Audi text pattern was flagged in Wal33D (41 of 129 lines over 150 characters, repo note). So Audi is the brand most at risk of dirty data.
- Verdict: cross-check only for all community sources; official portals manual-read-only. NHTSA for facts.

### 3.6 Honda and Acura

- S8 `techinfo.honda.com`. Honda prices (30-day about $40, 365-day about $175) are unverified search snippets. I-CAR page (read) confirms DTC info is searchable by typing "DTC" in the Service Info keyword box of techinfo.honda.com.
- Honda's emissions and P1xxx codes are numerous; Honda also uses blink-code style "MIL flash" codes on older cars (assumption, low).
- Japanese-language community and a Japanese-language technical description exist (not found by one search, low).
- Verdict: manual-read-only; NHTSA facts for existence.

### 3.7 Hyundai, Kia, Genesis

- S9: HyundaiTechInfo sells service information (shop manuals, DTC data, TSBs, OBD-II content). Tier list in a 2021 PDF (read): 1 week $40, 1 month $60, 1 year $600; contents include DTC and TSBs.
- S10: Kia through a Snap-on-run portal; an Opus IVS page from the 2026 era describes tiers including DTC charts and wiring diagrams (search snippet, low to medium). A 2006 trade article said Kia's site was free then; likely outdated.
- S11: Kia Australia's independent-repairer page exists (search result, URL only).
- S12: ACCC release (read, 16 Sept 2026): Kia now $136/day, BYD $140/day for diagnostic access; Mazda gave an undertaking.
- Genesis has its own portal named in I-CAR (search snippet, no page read).
- Why this ranks high: short, cheap, per-week access and a documented DTC section make it possible for a **tainted-reader-free path**: a contributor with their own subscription can verify, while the project reads only NHTSA facts. Quantity of public community explanations unknown.

### 3.8 Nissan and Infiniti

- I-CAR confirms subscription options exist (search snippet). Portal name, URL and prices: **not retrieved (PARTIAL)**.
- Nissan CONSULT readouts are a known community topic (assumption, low).
- Verdict: manual-read-only; NHTSA facts.

### 3.9 Volvo

- S13: aa1car OEM site list, updated January 2023, shows 72 hours $40.50, month $322.50, year $3,225 (page read, Jan 2023, stale) at https://www.volvotechinfo.com.
- Volvo uses its own diagnostic codes in addition to OBD-II (assumption, low). No Volvo community list was found in these searches.
- Verdict: manual-read-only.

### 3.10 Subaru

- STIS is the portal name from memory of the brand; **not verified** in this run (no page found). PARTIAL.
- IATN index pages list Subaru among makes for P0131 (search snippet): shows Subaru codes circulate, nothing more.
- Verdict: manual-read-only; PARTIAL.

### 3.11 Mazda

- ACCC release names Mazda (search snippet). Hitachi Astemo (S28) publishes a Mazda coverage list as of 2024-01 naming models, types and engine codes where code reading is supported, "not all systems" (search snippet, medium, Japanese). This is a vehicle-coverage fact, not code text.
- An earlier claim that IATN lists P1506 under Ford and Mazda is UNSUPPORTED: the September 2012 index page I read has no P1506 entry. Removed as a lead.
- Verdict: manual-read-only; PARTIAL.

### 3.12 Tesla

- S19: public service manual for Model S (2012-2020) has a Diagnostic Trouble Codes section (search snippet, medium). The Model X (2015-2020) DTC page (read) has update notes dated 2026-01-22 and 2026-02-20 and says DTCs are confirmed faults needing service, distinct from alerts; DTCs latch and are cleared by a technician.
- A third-party iFixit copy states Tesla's process leans on event-based "alerts" rather than DTCs (search snippet; the document is hosted on iFixit, treat as secondary).
- S20: Roadster issue articles PDF lists numeric faults.
- S21: owner manual "Troubleshooting Alerts" per model with ids like "BMS_a074" and a drive/no-drive hint (search snippet, medium).
- Some manual links point to protected docs (login), so public coverage is partial (search snippet, low).
- Terms: not read. Tesla pages carry copyright; no open licence seen.
- Fit: the alert ids are not OBD-II P-codes. Our decoder would need an "alerts" namespace.
- Verdict: manual-read-only for service manual; cross-check for owner alerts (what the driver sees).

---

## 4. Ranking: where free coverage is cheapest after BMW

Scoring (my judgement, not measured). For each brand, four checks, 0 to 2 points each:
- A. Public bulletin supply (NHTSA) expected volume. All brands share one route, so brand volume is expected from US sales, not counted.
- B. Free official material with code meaning (owner manual, free portal pages).
- C. Cheap short-term portal that lets a contributor verify without copying.
- D. Community knowledge in lists or forums we can use as a lead (not text).

| Rank | Brand | A | B | C | D | Total (of 8) | Main reason | Main risk |
|---|---|---|---|---|---|---|---|---|
| 1 | Ford | 2 | 1 | 2 | 2 | 7 | Cheapest portal terms (72 hours), many US bulletins, big community | Subscription needed to verify; origin of free lists unknown |
| 2 | Hyundai/Kia | 1 | 1 | 2 | 1 | 5 | One-week portal, DTC data advertised, ACCC action | Portal for Kia run by a third party, price unclear |
| 3 | Honda | 2 | 1 | 2 | 1 | 6 | 30-day price low; DTC search in portal; many bulletins | Honda codes are numerous and cluster by engine |
| 4 | GM | 2 | 0 | 1 | 2 | 5 | Large US bulletin volume; widely discussed codes | Portal access details not verified |
| 5 | VW group | 1 | 0 | 1 | 2 | 4 | Largest community footprint, German wiki pages | Dirty community data; decimal and P-code formats; ODIS-only reading |
| 6 | Tesla | 0 | 2 | 0 | 1 | 3 | Public service manual and owner alert pages | Not OBD-II codes; alerts namespace; login-protected parts |
| 7 | Volvo | 1 | 0 | 1 | 0 | 2 | Short portal term seen | Little community data found |
| 8 | Stellantis | 1 | 0 | 1 | 1 | 3 | Many US vehicles | No Chrysler P1xxx list found |
| 9 | Nissan | 1 | 0 | 1 | 1 | 3 | Portal exists | Nothing verified |
| 10 | Subaru | 1 | 0 | 1 | 0 | 2 | Portal exists | Nothing verified |
| 11 | Mazda | 1 | 0 | 1 | 0 | 2 | Coverage list only | Nothing verified |

Order of the table is by my final ranking; the numeric totals do not sort perfectly because Honda scores 6 but sits at 3 for reasons below. Corrected final order for planning: **Ford (7), Honda (6), Hyundai/Kia (5), GM (5), VW group (4), Tesla (3 but different), Stellantis (3), Nissan (3), Volvo (2), Subaru (2), Mazda (2).** Treat ties as ties. Confidence: low to medium.

What the ranking means in practice:
- The ranking is about **public facts and cheap verification**, not about clean text. No brand has clean free text.
- The NHTSA route puts every brand on equal footing for bulletin facts. The real difference is which brand's bulletins mention codes often (not measured; section 8).
- First action for all brands: run the NHTSA index file, count rows by make that mention a code pattern, and re-rank with real numbers (cost est. 2 to 4 hours).

---

## 5. Legal and terms picture for the portals (why "manual-read-only")

- US: manufacturers must publish manufacturer-specific code information for emissions-related codes at a fair price (40 CFR 86.1808-01, repo note). That gives a cheap way to read, not a licence to copy.
- California: 13 CCR 1968.2 requires SAE J2012 and allows manufacturers' own codes with approval (repo note).
- EU: Reg (EU) 2018/858 Art 61 gives independent operators access at a reasonable fee (repo note).
- Australia: the ACCC scheme led Mazda, Kia and BYD to improve access (search snippet, medium).
- Japan: the MLIT PDF (S27) covers how makers provide inspection information and contacts (search snippet, low; I did not open it).
- All portals: subscriber terms, which almost always bar redistribution and bulk automated copying (inference, medium; **no portal terms page was read**).
- Our rule stays: facts only, own words, no screenshots of portal pages, no pasted fragments, and the tainted-reader flag for anyone who read the portal for that brand.

How a contributor can still help legitimately:
1. Pay for a short term (72 hours to 30 days).
2. Use it to **verify** a fact found elsewhere (code exists, applies to this model).
3. Write the result in own words, tag source "own repair" or "manual", never paste.
4. Declare that they read the portal for that brand.

---

## 6. Other-language communities (what exists, what to expect)

Findings from this run are thin. Only one language-specific search per language was run.

| Language | Brands most useful | What was found | Value |
|---|---|---|---|
| German | VW group, Mercedes, BMW, Opel | carwiki.de per-code pages for VW, Audi, Seat, Skoda (search snippet); OBDeleven German pages; German workshop blogs (kfz-dietrich blog result) | Highest for VW group; cross-check only |
| Japanese | Honda, Nissan, Subaru, Mazda, Toyota | MLIT PDF, Hitachi Astemo Mazda support list, English IATN index; **no Japanese forum or wiki list found** | Low in this run; search not exhaustive |
| Russian | VW group, Toyota, Nissan | A Russian-site English page (avtotachki.com) lists Audi/VW/Skoda/Seat codes (search result, low) | Cross-check only |
| Spanish and Portuguese | Ford, GM, VW (LatAm models) | Not searched | **Gap** |
| French and Italian | Stellantis (PSA, Fiat) | Not searched | **Gap** |
| Korean | Hyundai/Kia | Not searched | **Gap** |
| Chinese | BYD and others (out of scope) | Not searched | Gap |

Rules for foreign-language sources:
- Same rule as English: facts and leads only; translate nothing wholesale.
- Machine translation of a forum thread into our text still creates a derivative; write from understanding, not from the translation.
- Record the language in the evidence row so a native reviewer can be recruited.

---

## 7. Per-brand playbook (cheapest next step)

| Brand | Step 1 | Step 2 | Step 3 |
|---|---|---|---|
| Ford | NHTSA index count for Ford rows with code patterns | 72-hour Motorcraft term by a contributor to verify 20 to 50 top codes | Own capture on an owner car if one exists |
| Honda | NHTSA index count | 30-day SIS term for verification | Check Japanese-market codes separately |
| Hyundai/Kia | NHTSA index count | One-week HyundaiTechInfo term | Check Kia AU independent page for access rules |
| GM | NHTSA index count | Find actual short-term portal (not verified) | Own capture |
| VW group | NHTSA count; decide decimal-code schema | Use German pages as leads only | Own capture with a generic reader |
| Tesla | Read public Model S/X DTC pages in full (manual only) | Build "alert" namespace in schema | Verify owner alert list per model |
| Stellantis | NHTSA count | TechAuthority price check | Look for PSA-brand sources in French |
| Nissan, Subaru, Mazda, Volvo | NHTSA count | Locate portal URL and price (not verified) | Decide whether worth any effort |

---

## 8. Excluded sources (with reason)

| Source | Reason |
|---|---|
| Slideshare "OBDCodex/OBDAdvisor" manufacturer lists (VW, Audi, Ford, GM) | Unlicensed uploads of unknown origin; searched results are lists, not licences |
| Scribd uploads (VWCODES, "Scanner-Codes", Obd Coduri Service, ODBII codes) | User uploads of copyrighted material; no licence |
| Bentley Publishers Audi DTC table hosted on a third-party site | Publisher copyright; third-party hosting is not permission |
| Haynes fault-code pages | Commercial publisher text |
| Any ODIS, erWin, Techstream-like, ISTA, XENTRY export | Paid or leaked OEM data; policy R2 in data-strategy |
| Automotive-9 / GhostTypes, kierandrewett, OBD2HQ, hoffman1938, peyo | Already excluded in open-generic-datasets note |
| Third-party "consolidated" code sites with no stated source (for example the "converter.brightcoding.dev" and "avtotachki.com" lists) | Unknown origin; leads only, never loaded into drafting |
| Scraped commercial apps and APK string tables | Scraped commercial apps are excluded by task rule |

---

## 9. Owner decisions and next actions

1. Extend decision 3 (bounded NHTSA download) to also run the **index files** S1 and S2 for all brands (small, structured, facts). Estimated effort 2 to 4 hours (est.).
2. Allow a bounded PDF pull for Ford, Honda, Hyundai/Kia, GM (about 20 bulletins each, est.), files kept outside the repo.
3. Allow one volunteer short-term portal term (72 hours Ford first, price about the cost in S5) as a verification test, to measure how much cross-checking a portal gives per hour. Money decision: owner's.
4. Add schema room for Tesla "alerts" and VAG decimal codes (feeds the coverage strategy section 4 schema list).
5. Do **not** ingest any community list in section 2 rows S22 to S25.

---

## Sources

Used this run (search results unless noted). Conf = confidence.

| # | URL | Used for | Conf |
|---|---|---|---|
| 1 | https://static.nhtsa.gov/nhtsa/downloads/Temp/MfrComms.txt | Manufacturer comms file, existence | medium |
| 2 | https://static.nhtsa.gov/odi/ffdd/tsbs/TSBS.txt | TSB summary file, existence | medium |
| 3 | https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-technical-service-bulletins-system-tsbs-downloa | TSB dataset incomplete note | medium |
| 4 | https://catalog.data.gov/dataset/nhtsa-communications-by-manufacturer | Comms dataset | medium |
| 5 | https://www-odi.nhtsa.dot.gov/mc/ | Comms index | medium |
| 6 | https://www.ford.com/support/how-tos/ford-services/parts-and-service/where-can-i-get-self-repair-and-technical-information/ | Motorcraft terms and coverage | medium |
| 7 | https://www.ford.ca/support/how-tos/ford-services/parts-and-service/workshop-manuals/ | Canada subscription contents | medium |
| 8 | https://www.ford.com/support/how-tos/search/diagnostic-trouble-codes/ | Ford DTC help page, existence | low |
| 9 | https://us.haynes.com/pages/odb-fault-codes-car-ford | Haynes (excluded) | medium |
| 10 | https://store.honda.com and https://rts.i-car.com/crn-877.html | Honda SIS prices; DTC search tip | medium |
| 11 | https://www.hyundaitechinfo.com/external/files/HyundaiTechInfo_Service_Information_Subscriptions.pdf | Hyundai tiers | medium |
| 12 | https://opusivs.com/?p=20089 | Kia tiers (not opened) | low |
| 13 | https://www.fenderbender.com/running-a-shop/operations/article/33022277/honda-reduces-subscription-rates-kia-now-free | Old Kia-free report (stale) | low |
| 14 | https://www.kia.com/au/owners/independent.html | Kia AU page | low |
| 15 | https://www.accc.gov.au/media-release/mazda-kia-and-byd-improve-access-to-service-and-repair-information-after-accc-investigations | Australian scheme | medium |
| 16 | https://www.aa1car.com/library/oemwebsites.htm | Volvo price, OEM site list | low |
| 17 | https://rts.i-car.com/crn-484.html and https://rts.i-car.com/crn-500.html | Nissan, Stellantis portals | low |
| 18 | https://www.gmparts.com/technical-resources/service-repair-manuals | GM manuals | low |
| 19 | https://service.tesla.com/docs/ModelS/ServiceManual/en-us/GUID-529D8AAF-DC49-45AB-AD34-062A6518C973.html | Tesla Model S manual | medium |
| 20 | https://service.tesla.com/docs/ModelX/ServiceManual/en-us/GUID-BB78BE60-83DF-49A9-9623-5A2CA9A29A5C.html | Tesla DTCs in Service Mode | medium |
| 21 | https://service.tesla.com/docs/Public/Roadster/Toolbox_Articles/Roadster_Issue_Articles.pdf | Roadster faults | medium |
| 22 | https://www.tesla.com/ownersmanual/modely/en_gb/GUID-9A3F0F72-71F4-433D-B68B-0A472A9359DF.html | Owner alerts | medium |
| 23 | https://www.akk.org/~sledge/auto/Fehlercodes%20VAG%20english.pdf , https://carwiki.de/obd-fehlercodes , https://obdeleven.com/de/fehlercodes-auto , https://ricksfreeautorepairadvice.com/vw-obd2-codes/ | VW group community lists | low |
| 24 | https://VAGLinks.com/Docs/Audi/BentleyPublishers.com_Audi_DTC_Table.pdf | Excluded publisher table | medium |
| 25 | https://www.iatn.net/techmail/summaries/2012/09/index-dtc.html | Code-to-make hints | medium |
| 26 | https://www.mlit.go.jp/jidosha/content/001882145.pdf and https://www.aftermarket.astemo.com/japan/ja/automotive/assets/docs/8000_MAZDA_car_list_24-01-24.pdf | Japan docs | low |
| 27 | `docs/plan/dtc-coverage-strategy.md`, `docs/plan/data-strategy.md`, `docs/research/deep2/dtc-open-generic-datasets.md` | Rules, rungs, repo-note facts | high |

---

## Gaps

- **No portal terms page or licence text was opened** for any source here, except the pages named as read in the table. Fact check 2026-11-20 corrected S1, S2, S5, S8, S9, S12, S13, S19, S26 and the Mazda P1506 lead. Every "terms NR" is a gap. Do not assume automated access is allowed anywhere.
- **NHTSA files not downloaded.** No counts per brand, no confirmation of the current TSB zip location, no proof the Ford, GM, Honda, Hyundai PDFs follow the same URL pattern.
- **Subaru STIS, Mazda, Nissan, GM ACDelco TDS, Volvo VIDA, VW erWin/ODIS:** portal URLs and current prices not retrieved. Marked PARTIAL.
- **Prices** are from stale or secondary pages (Volvo 2023, Hyundai 2021, Honda store listing); re-check before any purchase.
- **Other-language search** was one query per language at most. Spanish, Portuguese, French, Italian, Korean, Chinese not searched; Japanese found no community list.
- **Ranking scores** are my judgement from search snippets, not measured. Re-run after the NHTSA index count.
- **Tesla:** public coverage per model and which pages need login not mapped; alert id formats seen only in snippets.
- **Free community lists** (carwiki.de, Rick's, AKK) not compared to each other or to OBDex; origin unknown.
- **GitHub/dataset side** for these brands (jseobd groups, Wal33D brand files) is inherited from the open-datasets note and not re-read.
- **Legal:** whether bulletin facts are free of OEM copyright, and whether a contributor's portal reading taints them, remain counsel questions (coverage strategy section 12, item 5).
- **No claim here was verified against a car.**
