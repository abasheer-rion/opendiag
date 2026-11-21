# Mercedes-Benz fault-code (DTC) coverage: formats, legitimate sources, achievable coverage

Status: research note, 2026-11-20. Not legal advice. Status of this run: **PARTIAL**. Web search and fetch worked, but several pages were truncated (the two big Mercedes code lists were read only in part), the GitHub search API was rate limited after a few calls, the Mercedes PDF attachment "Control Unit Nomenclature" is an image that was not readable, and no Mercedes DTC database with a clear open licence was found.

Confidence tags: **[high]** read on the primary page or file in this run; **[medium]** read on a secondary page, or inferred from two agreeing sources; **[low]** inference, search snippet only, or from general knowledge. Anything that is a planning number is labelled **ESTIMATE** and is [low].

Rule followed: no fault text is copied from any source. Codes (such as P012D12) appear only as format examples. Only counts, formats, licences and coverage facts are recorded.

Prior docs not repeated: `mercedes-protocols-and-access-control.md` (bus and gateway background, all marked unverified there), `mercedes-forums-and-practice.md` (forum census), `bmw-modules-dtcs-and-addressing.md` (BMW formats), `diagnostic-standards-and-obd-future.md` (ODX/MVCI), `legal-regulatory-landscape-deep.md`. This note adds what those could not: verified Mercedes code shapes from public US government documents, verified open-data status, and a coverage plan.

---

## 1. Executive summary

1. **Shape of a Mercedes code is now confirmed from primary documents.** Newer Mercedes cars show six-character codes such as P012D12, P012800, U030068. That is a 5-character SAE-style code (P012D, P0128, U0300) plus a 2-character suffix. This is consistent with the UDS three-byte DTC (two bytes of code plus one failure-type byte). The suffix is the failure type, not part of the base code. [high for the shape, medium for the failure-type reading, see 3.2]
2. **No open, clearly licensed Mercedes DTC database exists that I could find.** OBDb has about 37 Mercedes repositories (CC-BY-SA-4.0) but the three I opened hold live-data signals only (zero DTC entries; request addresses seen are 7E0, 7E1, 7E2, 7E5 and 60A, re-checked in the fact-check pass). OBDex (CC0) is generic codes only and states manufacturer-specific codes are out of scope. [high]
3. **The legitimate public text about Mercedes fault codes is thin but real.** The best clean source is the US NHTSA technical service bulletin (TSB) archive, where Mercedes bulletins pair a control-unit designator (for example N3/10) with a code number. They give a code-to-control-unit mapping and the platform names, but each bulletin covers one or two codes. The text is Mercedes copyright, so we may learn facts from it but never copy it. [high]
4. **Community lists exist but are not safe to copy.** One wiki list (about 640 entries, 1996 and later, "found on the Internet" plus the dealer tools) and one site (about 1,200 entries, counts on the page disagree) have no licence statement and unclear provenance. Treat them as leads to verify, never as data. [high for what the pages say]
5. **What a generic adapter can reach.** Standard OBD-II reads (stored codes, pending codes, freeze frame, readiness) work on any adapter and give the emissions slice only. Reaching every control unit's fault memory needs UDS reads on the diagnostic CAN or DoIP, which a good adapter can send, but gateway filtering and authorisation on newer cars is not verified in public documents. [medium; gateway behaviour is low]
6. **What is gated.** SCN coding (online server check), flashing (individual user role), key and security work (SERMI route) are all gated. Reading fault memory is not described as gated in the documents I read, but XENTRY itself needs a permanent online connection and a personal login. Our tool should do reads only. [high for the gating of coding and flash, as stated by Mercedes pages]
7. **Achievable coverage (ESTIMATE, low confidence):** about 100% of the *format* (decode any code to class, base number, failure type); about 9,500 generic code meanings from OBDex as a cross-check; a few hundred Mercedes-specific meanings in 12 weeks if we work from induced faults, NHTSA bulletins read-and-rewrite, and owner reports; full Mercedes manufacturer coverage (tens of thousands of code-by-unit combinations, **ESTIMATE**) is not reachable without OEM data, and we should say so in the product.
8. **Recommendation.** Ship a Mercedes reader that decodes any code into plain structure (system letter, base number, failure type, control unit) and shows the generic meaning when one exists. For Mercedes-only codes, show the raw code, the unit that stored it, and "meaning not yet documented, contribute a report". Share-alike data (OBDb) goes in a separate pack only if it carries useful Mercedes data, which today it does for live values, not for faults.

---

## 2. Mercedes code formats

### 2.1 The generic five-character form (base code) [high]

Wikipedia's OBD-II article (read in this run) describes the five-character code: letter P, C, B or U for powertrain, chassis, body or network; a second digit 0 to 3 that says who defines the code (0 generic, 1 manufacturer, and 2 and 3 differ for P versus other classes); a third character for the sub-system; and two final characters that identify the fault, described as part of a hexadecimal number. Source: https://en.wikipedia.org/wiki/On-board_diagnostics (page text was truncated at about 100,000 of 130,609 characters, the DTC section was inside the read part).

The OBD-II PIDs page (read in this run) gives the two-byte layout: the top two bits of the first byte select the letter (00 P, 01 C, 10 B, 11 U), and the remaining 14 bits are the number. It also notes a four-character form that is just the raw hexadecimal value. Source: https://en.wikipedia.org/wiki/OBD-II_PIDs [high].

Consequence for OpenDiag: one decoder serves every make. A code is a 14-bit number plus a class. Mercedes-specific codes are those where the second digit says manufacturer (1, and for non-P classes 2 as well), plus any code the standard leaves for manufacturers.

### 2.2 The six-character form seen on newer Mercedes cars [high shape, medium meaning]

Observed in Mercedes bulletins filed with NHTSA (read in this run with pdftotext):

| Example seen | Base code | Suffix | Where it was stored |
|---|---|---|---|
| P012800 | P0128 | 00 | N3/10 engine electronics, hybrid M274 variant (2022 bulletin) |
| P012D12 | P012D | 12 | N3/10 engine electronics, MED41 on M264 (bulletin dated 19 Dec 2024, re-checked) |
| U030068, U030048, U030005, U030000 | U0300 | 68, 48, 05, 00 | an automatic transmission bulletin (2025), several suffixes under one base code |

Sources: https://static.nhtsa.gov/odi/tsbs/2022/MC-10217151-0001.pdf, https://static.nhtsa.gov/odi/tsbs/2024/MC-11012059-0001.pdf, https://static.nhtsa.gov/odi/tsbs/2025/MC-11022045-0001.pdf (all read; Mercedes-Benz AG copyright).

What this tells us:
- The same base code appears with different suffixes (U0300 with 68, 48, 05, 00). So the suffix is a separate field and our database must key on base code and suffix separately, with a "generic text for the base, extra text for the suffix" model.
- The base codes seen (P0128, P012D, U0300) are in the SAE-defined range (second digit 0 or 1 is the key question). P012D is in a sub-range that Wikipedia says holds hexadecimal-letter endings; Mercedes' use of these as shown above is consistent with the standard's expanding range. I did not verify whether P012D is SAE-assigned or manufacturer-assigned. [low]
- The suffix reading as the SAE J2012-DA "failure type byte" is consistent with the standard's structure: SAE J2012 is technically equal to ISO 15031-6, and the failure-type subtypes are a separate list in J2012-DA that applies only when three-byte DTCs are used. This is stated in the SAE listing snippets (https://saemobilus.sae.org/content/J2012_201303/ and https://saemobilus.sae.org/standards/j2012da_202403-digital-annex-diagnostic-trouble-code-definitions-failure-type-byte-definitions). Which byte carries the suffix, and the value meanings, were not verified from a primary page. The DA is a paid SAE spreadsheet. [medium that suffix is the failure-type byte; the list of values is not public]
- I have not confirmed that Mercedes uses the same suffix values as other makes. The 2025 transmission bulletin shows suffix 05 next to a "programming" style fault title and 00 next to a generic internal fault, which suggests the suffix refines the cause, but that is an observation of two titles, not documentation. [low]

### 2.3 Older Mercedes number-only codes [medium]

- A consumer guide cited in search results describes a Mercedes-specific four-digit number code (example given in the snippet: 2234) that needs a Mercedes-specific tool to interpret. I did not open that guide. [low]
- A Hella technical note (title: conversion of a fault code given as hexadecimal number, https://www.techtips.ie/Hella-Ireland/conversion-of-a-fault-code-given-as-hexadecimal-number.pdf) is returned by search. Its snippet says hexadecimal fault codes must be converted to decimal before being compared with a table, and gives an older Mercedes example of an idle actuator code numbered 138. I did not open the PDF itself. [low]
- The Mercedes wiki list (w220.wiki, read in this run) describes its own format as a letter plus four digits (example P0420): second digit 0 for standardised, 1 for manufacturer; third digit the assembly; last two the component and fault type. Its list has four tables by class. It does not claim hexadecimal. [high for what the page says; medium for correctness, since it is an unlicensed compilation from 2016 or earlier]
- The 1,200-code site (mercedesmedic.com) reports generic-range P codes from about P0100 to P0849 and Mercedes-specific P codes from P1000 upward, some with hex-letter endings (for example P200A to P200F), and sub-code suffixes after a dash (for example P1510-001, re-confirmed present) or bracketed values [1], [2], [4], [8] that look like bit flags. The fetch covered only 100,000 of 184,742 characters. [medium; partially read]
- Reconciling these three families (older four-digit numbers, five-character letter codes with sub-codes, six-character codes with a failure-type suffix) is a real gap. Older cars (pre-UDS, K-line or early CAN) most likely use older tables that a generic adapter cannot reach in full. [low; see Gaps]

### 2.4 Xentry-style presentation [medium]

- Mercedes bulletins print a "Control unit / fault code / fault text" table with the unit designator first (for example N3/10) and a short unit description, then the code, then the text (observed in all three bulletins above). So the human-facing key is **control unit plus code**, not code alone. Our pack must key meaning on the pair.
- In the 2018 StarTuned feature (https://automotivetechinfo.com/wp-content/uploads/2019/01/XENTRY-and-OBD-II-Go-Deep.pdf, read in this run) a XENTRY quick scan lists every control unit found, shows a symbol for units with faults, shows a Mercedes part number per unit, and a unit with no part number "was never fully interrogated". The same article says an ordinary OBD-II scan tool sees only what regulations require, and that the OBD-II connector has manufacturer-use pins that OBD-II tools cannot reach. [high for what the article says; it is a Mercedes-Benz publication]
- XENTRY quick test also stores a "current" versus "stored" state; the status model matches the UDS status byte, which the BMW doc covers (`bmw-modules-dtcs-and-addressing.md` section 4). I did not verify a Mercedes-specific status layout. [low]

---

## 3. Control-unit naming (what the tool must display) [high for the pieces read]

- **Designator style.** Mercedes bulletins name units by a wiring-diagram style designator: N3/10 is the engine electronics, N127 the powertrain control unit, A1 the instrument cluster (all seen in NHTSA bulletins MC-10183255-9999 and MC-11005313-0001 snippets, https://static.nhtsa.gov/odi/tsbs/2020/MC-10183255-9999.pdf and https://static.nhtsa.gov/odi/tsbs/2024/MC-11005313-0001.pdf; the snippets came from search results, not a full read). A fuller list of designators exists inside Mercedes' Control Unit Nomenclature picture, which I could not read. [medium]
- **Four names per unit.** Mercedes' own user guide (LI00.01-P-078887, version 3, dated 2026-01-20, filed as https://static.nhtsa.gov/odi/tsbs/2026/MC-11027782-0001.pdf, read in this run) says each control unit has a name, a number, a short name and a "Diogenes" name that identifies the variant or family. It says the nomenclature is an attachment (an image). [high]
- **Engine unit variants.** The bulletins show the same designator carrying different engine-unit families: 'MED40' on an M274 hybrid, 'MED41' on an M264. So the designator alone does not give the hardware; the variant string does. Our pack must carry designator plus variant. [high]
- **Platform vocabulary.** The same user guide groups series numbers (Baumuster) into architectures: MRA and MRA2 (rear-wheel), MFA and MFA2 (front-wheel), EVA1.5 and EVA2 (electric), MSA (sport), MMA (one series, 174). It also groups them into "Star 1", "Star 2", "Star 3" network architectures. Examples: Star 3 lists 206, 214, 223, 236, 254, 294 to 297, 192, 232, 907. [high; this is a factual grouping, record as hints for applicability and test targeting]
- **Acronyms listed there** that matter to a diagnostic UI: DTC, CU (control unit), CUL (control unit log), SCN (Software Calibration Number), XD (XENTRY Diagnosis), QT (Quicktest), SA Code (option code), TCU (here the telecommunication unit, not the gearbox unit), NAG (automatic gearbox generation). [high]
- **Count of units.** The StarTuned article says one 2011 ML 350 had 36 units in total, and the mercedesmedic page claims up to 47 control units on a Mercedes. The first is a single-case fact from a Mercedes publication [high]; the second is a site claim [low].
- **Name hygiene.** Because designators are Mercedes-assigned, using them as display labels is fine (a name is a fact), but we must write our own plain-English unit names ("engine control", "gearbox control", "instrument cluster") instead of copying the unit description strings. Short descriptive labels are low risk but are listed in the data-strategy as needing counsel review (D5). [medium]

### 3.1 Unit-name field list for the pack (proposal)

Fields: `designator` (N3/10), `variant` (MED41), `plain_name` (own words), `diag_address` (from our own scan), `architecture_hint` (MRA2), `series_hint` (206), `first_seen_in` (provenance ref). Provenance types allowed: NHTSA bulletin fact, owner scan, public Mercedes user guide. [proposal, no confidence tag needed]

---

## 4. Public sources that legitimately describe Mercedes codes

### 4.1 Source ledger table

| # | Source | What it gives | Licence or terms | Usable how | Confidence |
|---|---|---|---|---|---|
| A | NHTSA TSB archive, Mercedes bulletins (static.nhtsa.gov/odi/tsbs) | Code and control-unit pairs, platform names, software update remedies | Mercedes-Benz AG copyright notice printed in each bulletin; US government hosts them | Facts only (pair, class, which software fixed). Read and rewrite. Never copy fault text. | high |
| B | Mercedes user guide LI00.01-P-078887 (same archive) | Unit naming scheme, acronyms, platform groups | Mercedes copyright | Facts only | high |
| C | Mercedes B2B Connect help pages | Access model (XENTRY Diagnosis Lite and Pass Thru), who may buy | Mercedes web terms | Cite facts on gating | high |
| D | Mercedes StarTuned magazine articles (hosted at automotivetechinfo.com) | How XENTRY presents scans, OBD-II limits | Mercedes publication | Concepts | high |
| E | ISO 14229-1, ISO 15031-6, SAE J2012, J2012-DA | Formal code structure and failure types | Paid, copyrighted | Implement structure from public summaries; do not copy tables | medium |
| F | OBDex (foerbsnavi/OBDex) | 9,533 generic codes with rewritten text | Data CC0-1.0, code MIT | Cross-check "does this base code exist" | high |
| G | OBDb Mercedes repositories (about 37) | Live-data signals (mode 22) on a few standard-range addresses | CC-BY-SA-4.0 (LICENSE file read) | Separate share-alike pack for signals; **no DTC content seen** | high |
| H | mercedes-benz/odxtools (MIT, MBition GmbH) | A reader for ODX files the user already holds | MIT code | Local overlay tool only; contains no Mercedes data | high |
| I | w220.wiki list (roughly 640 to 780 entries) | Community list of Mercedes codes by class | No licence stated; "found on the Internet" | Lead only | high that it is unlicensed; medium on count |
| J | mercedesmedic.com fault code page (claimed 1,202 in the earlier read; the claim was not re-found on re-fetch, the page has grown) | Community list incl. Mercedes P1xxx and multi-meaning entries | No licence stated in the read part | Lead only | medium |
| K | Haynes UK fault-code pages, Scribd and blog PDFs (search results only) | Per-model lists, uneven quality | Commercial or unknown | Do not use; provenance cannot be verified | low |
| L | Mercedes-Benz Trucks service-info help cards (search results) | Truck-side tool help; some mention fault code lookup | Mercedes copyright | Not cars; skip | low |

### 4.2 The NHTSA bulletin archive as a fact mine

What I verified:
- The bulletins are PDFs under https://static.nhtsa.gov/odi/tsbs/<year>/MC-<number>-<suffix>.pdf for Mercedes (prefix MC), and SB-<number>-<suffix> for older ones (for example the 2013 and 2014 ones in search results). [high]
- Each lists "Control unit/fault code" tables. The 2025 transmission bulletin lists several fault codes under one control-unit row and several suffixes under one base code. [high]
- Header text carries a date, a topic number (like LI00.01-P-078887), a validity line, a reason for change and a disclaimer. [high]
- Remedies are usually "update software on control unit X, reset adaptations, clear codes" or "check wiring". Those are facts about which codes relate to which unit. [high]

What I could not establish: how many Mercedes bulletins exist in total and how many distinct codes they cover. That number is not known and must not be guessed. A script to walk the NHTSA listing would answer it. [Gap]

Why this source is legitimate: it is a US federal agency site that republishes manufacturer communications for the public. The copyright line stays with Mercedes, so the safe use is: extract facts (code, unit designator, which fix class), write our own text, record the URL as provenance. The "tainted reader" rule in `docs/plan/data-strategy.md` section 8 should apply: the person who reads the bulletin may extract the fact record, a second person writes the user-facing text. [medium; counsel to confirm under decision D5]

### 4.3 What public Mercedes sources do not contain

- Owner's manuals describe warning lamps and messages, not stored fault codes. (General knowledge; the manuals were not fetched in this run.) [low]
- No Mercedes public page I read lists a complete code table with meanings per control unit. The workshop portal content (WIS, XENTRY fault text) is behind the paid B2B Connect access described in section 7. [medium]

---

## 5. Community resources and open datasets

### 5.1 Open datasets (verified from the repositories themselves)

| Dataset | Content | Licence | Mercedes relevance | Verified how |
|---|---|---|---|---|
| OBDex | 9,533 generic codes: P0 3,705; P2 3,495; P3 155; U0 1,055; U3 174; B0 323; C0 626 (sums to 9,533). English and German. 30,875 source links to 244 sites | Data CC0-1.0, code MIT | Entries mention which makers use a code; a keyword search of the JSON for "mercedes" matched 347 of 9,533 entries. README says manufacturer codes such as P1xxx and B1xxx "stay with their makers" | Fetched README, meta.json and generic.min.json on 2026-11-20; counted by script |
| OBDb (organisation) | 897 repositories (page said "showing 10 of 897"), one per make and model, signal definitions in `signalsets/v3/default.json` with optional year files | Mostly CC BY-SA 4.0, README says changed definitions must be shared under the same licence | About 37 Mercedes repositories by search count (E-Class, C-Class, G-Class, CLS, CLA, GLB, GLA, EQA, EQB, EQE, EQS, EQV, Viano, M-Class, A 180, E180 and others). Last pushes between Feb and Nov 2026 | Fetched org page, search API and three repos' default.json and LICENSE |
| peyo/dtc-and-vin-data | DTC lists for generic, Toyota, Honda, GM (P-codes) plus a VIN prefix table | Not stated on page | None (no Mercedes listed) | Fetched repo page |
| todrobbins/dtcdb | Old generic list | MIT (from the earlier data-strategy ledger) | Stale since 2013 | Earlier doc, not re-verified |

### 5.2 OBDb Mercedes: what is actually inside [high]

- E-Class: `signalsets/v3/default.json` has 21 command blocks and **zero** matches for "dtc". Headers used (re-checked): 7E0, 7E1, 7E2 and 7E5; which unit each address maps to was not verified. C-Class uses 60A, 7E0, 7E1, 7E2; G-Class only 7E2. Commands are mode 22 reads (example IDs 0163, 0168, 016B) with scaling and bit positions. C-Class: 17 command blocks, zero DTC matches. G-Class: 2 command blocks.
- Repository file list for E-Class: devcontainer, GitHub config, gitignore, LICENSE, README, generations.yaml, signalsets, tests. No DTC folder.
- The organisation README says the project documents "diagnostic parameters and trouble codes", but I saw no trouble-code file in any Mercedes repo I opened. Other makes might have them; not checked. [medium]
- So the owner decision (use CC-BY-SA data as a separate pack) is useful for Mercedes **live values**, not for fault meanings. [high]
- Coverage pattern: the three repos use a small set of standard-range request addresses (7E0 to 7E5, plus 60A once), not the many addresses of a full scan. Whether a plain adapter reaches all of them was not tested. [medium for the three repos opened]

### 5.3 Community lists (leads, not data)

- **w220.wiki list.** About 640 to 780 entries (two counts disagreed in the fact-check pass; roughly P 390 to 530, B 80 to 90, C 70 to 75, U 90), last edited 12 September 2016, two columns (code, legend), built on MediaWiki, no licence line, says codes were "found on the Internet" plus additions from the dealer tools. Cannot be redistributed. Its value: shows how old-style five-character Mercedes codes were laid out. [high for page facts]
- **mercedesmedic.com list.** Claimed about 1,200 codes in the earlier read (P 1,033; B 46; C 32; U 90); on re-fetch the page was larger (about 517,000 characters) and the figure was not re-found, so treat the count as unverified. Has multi-meaning entries, sub-code suffixes and bit-flag brackets. No licence or source statement in the part read. Cannot be redistributed. [medium]
- **Forums and blogs.** MBWorld has a thread titled for fault code lists (found in search results, not opened). Scribd uploads and blog posts of "Mercedes fault code lists" (several in search results) appear to be copied OEM text and cannot be verified. Per project rules (no leaked or copied OEM text) we do not touch them. [low]
- **Commercial lists.** Haynes UK sells per-model pages of fault codes; search results show the product pages for the 190 series, "M" class years and a BMW X4. Copyrighted. Not for use. [medium]

### 5.4 Open tooling (no data)

- `mercedes-benz/odxtools`, MIT licence, copyright MBition GmbH 2021-2023 (LICENSE file re-read). It reads ODX files (ASAM MCD-2 D, ISO 22901) which the user holds; the project says ODX complements UDS by describing vendor-specific functions per control unit. It ships no Mercedes data. Using it means the user supplies their own ODX, which may fall under a Mercedes licence. Local overlay only, per the earlier data-strategy table. [high]
- `commaai/opendbc`: live signals only, no diagnostics (earlier docs). [medium]

---

## 6. What generic adapters can and cannot cover

### 6.1 Layer one: standard OBD-II (any adapter, any Mercedes since model year 1996 in the US) [high from the StarTuned article, medium for specifics]

- Stored, pending and permanent emissions codes; freeze frame; readiness; mode 09 identity. These are generic base codes (second digit 0) and a limited set of manufacturer emissions codes.
- Mercedes' own article states an OBD-II tool "will have minimal access" to engine and transmission networks and gets only regulation-required data. It also says some connector pins are reserved for the manufacturer. [high]
- Result: for the base code and failure-type suffix on emissions faults, coverage is what OBDex provides, about 9,533 generic base codes, and the structure is public. Mercedes-specific emissions codes beyond that are not covered. [medium]

### 6.2 Layer two: UDS fault-memory reads on non-emissions units [low to medium]

- UDS service 0x19 reads fault memory; the BMW doc already lists subfunctions 0x01, 0x02, 0x03, 0x04, 0x06, 0x0A (`bmw-modules-dtcs-and-addressing.md` section 4, sourced to several UDS pages). The same service is standard for Mercedes since it is ISO 14229. [medium; Mercedes use not directly verified in this run]
- Mercedes confirms it supports DoIP on the newest cars: the XENTRY Pass Thru page names two tested Ethernet adapters (Star Cooperation OBD2 adapter and Softing OBD adapter) for pure DoIP series (introduced with 206 and 223), to be used only with XENTRY Pass Thru. The earlier claim that head-unit and cluster flashing is unavailable without DoIP was not re-found and is dropped. [high for the page; it covers Mercedes' own tool only]
- Whether a generic Wi-Fi or Bluetooth ELM-type adapter can address each Mercedes unit depends on: the central gateway filtering, which CAN IDs and addressing each unit uses, and (on new cars) DoIP activation. None of these is documented in the pages I read. [low]
- The CGW (central gateway) is named by Mercedes as a point where tools had trouble with data association between units (StarTuned 2018). That is the only primary mention found. [medium]
- Practical plan: treat every non-emissions unit as "unknown until probed". Probe with a safe read on the owner's own car (the capture process in the data strategy). Record which units answered and with what code format. Do not assume. [plan]

### 6.3 Layer three: tool-gated (not coverable with generic adapters)

See section 7. Mercedes states each XENTRY diagnosis user must log in personally and anonymous access to vehicles and backend services is not possible; XENTRY needs a permanent online connection. [high] This describes Mercedes' own tool; it does not by itself say a third-party tool cannot read fault memory. The only way to know is to test on a car. [medium]

### 6.4 Coverage matrix (ESTIMATE labels, all [low])

| Code kind | Adapter reach | Our text source | Estimated share of codes a user sees on a typical car |
|---|---|---|---|
| Emissions base codes (P0xxx, P2xxx) | Any OBD-II adapter | OBDex-style own rewrite | ESTIMATE 20% to 40% of stored codes |
| Network lost-communication codes (U0xxx) | Often readable via other units' fault memory (UDS) | Generic text exists in OBDex (1,055 U0 entries) | ESTIMATE 15% to 30% |
| Mercedes-specific powertrain with failure-type suffix | OBD-II if emissions-related, else UDS | Needs Mercedes-specific work | ESTIMATE 15% to 30% |
| Body, chassis, comfort, driver-assist, infotainment (B, C, many U) | UDS only, gateway and access unknown | Almost none public | ESTIMATE 20% to 40% |

These percentages are guesses from the structure of the problem; no usage data was found. They show where effort goes, not a forecast. [low]

---

## 7. SCN and authentication gating (what is gated, what is not)

All statements here come from Mercedes' own pages read in this run unless tagged otherwise.

| Function | Gate | Source | Confidence |
|---|---|---|---|
| SCN coding (Software Calibration Number, per Mercedes acronym list) | Done in XENTRY Diagnosis inside the control unit; a bulletin shows a menu path in the powertrain control unit N127 and says it needs XENTRY Diagnosis of a minimum release | NHTSA bulletin snippet from search results plus the user guide acronym list (MC-11027782) | medium |
| Whether SCN coding needs a Mercedes server round trip | Not shown in anything I read. A bulletin snippet mentions an online release requirement for the XENTRY version, not a server step for SCN itself. The previous Mercedes doc had this as an open question | search snippet | low |
| Reading fault memory (XENTRY) | Needs XENTRY with a StartKey, a contract number, time credits, a personal login, and a permanent online connection | https://b2bconnect.mercedes-benz.com/is/help/faq/software/xentry-pass-thru-eu and the Diagnosis Lite FAQ | high |
| Flashing and control unit commissioning | XENTRY Flash role, individual authorisation applied for through UMAS | same | high |
| Who may buy | Independent operators with a registered office in the EU, Iceland, Liechtenstein, Norway, Switzerland or the UK, in the authorised group under the block exemption regulation; Mercedes may block access otherwise | same | high |
| Hardware | Pass Thru: any device meeting the standard, tested ones named (Actia Passthru+ XS 2G, Bosch KTS 560, ADIS Technology EURO VCI); Diagnosis Lite requires the Mercedes COM kit hardware (purchase only) | same | high |
| Model coverage in Diagnosis Lite | Control units on all model series from 2004, both XENTRY and DAS series; HHTWIN not supported | Diagnosis Lite FAQ | high |
| Functions in Diagnosis Lite | Quick test, basic diagnosis (actual values, actuations), commissioning (flash, code, parameterise), fault memory read and delete, guided and functional diagnosis, repair forecast, key programming and FBS4 services from August 2023 | same | high |
| Pricing | Annual flat user fee plus time credits; time credits bought by mistake are not refunded; contract term 12 months, renews yearly. Actual euro figures were **not found** | same | high for structure, none for amounts |
| Security-related information (keys, immobiliser) | SERMI route through a conformity assessment body; Mercedes Trucks pages say an extra role applies from 1 October 2023 (trucks, car-side may differ) | search result summary | low to medium |

What this means for OpenDiag:
- **Not gated for us, not described as gated in these pages:** reading emissions codes through standard OBD-II.
- **Unknown, to be tested on a real car:** UDS fault-memory reads on non-emissions units through a generic adapter.
- **Gated:** coding, SCN, flash, key and immobiliser work. The data strategy already puts these outside the 12-week scope and "bench modules only for writes" (owner decision 2 in `docs/plan/decisions.md`). No Mercedes write feature should be planned. [high]
- **Do not** try to reproduce what XENTRY's online checks do. That is outside our rules and the earlier legal doc. [high]

---

## 8. Plan: reaching the widest legitimate coverage

### 8.1 Layers of the pack (separate data, separate licences)

1. **Format layer (CC0, our own).** Class letter, base number, suffix, status bits. Pure facts. Tested against the three bulletin shapes above.
2. **Generic meaning layer (CC0, our own rewrite).** Start from the OBDex base-code list as a "does this exist" cross-check and rewrite text ourselves per the data-strategy rule. OBDex's own data is CC0 so copying is legally allowed, but the project rule of writing our own wording stays; the CC0 licence means any overlap is not a legal risk. [medium; keep the similarity helper for BMW/other OEM text, which has no such licence]
3. **Mercedes unit layer (CC-BY).** Designators, variants, plain names, architecture hints; built from the Mercedes user guide, bulletin facts and our scans.
4. **Mercedes code layer (CC-BY).** Entries keyed by (unit, base code, suffix) with own-words text and provenance. Sources in order of preference: our induced-fault captures, NHTSA bulletin facts rewritten, owner reports with capture files.
5. **Share-alike pack (CC-BY-SA, separate).** OBDb Mercedes signals for live values (addresses 7E0 to 7E5 in the repos opened). Not a fault source. Keep strictly separate per owner decision 1. [high]
6. **Local overlay (never uploaded).** User-supplied ODX through odxtools for owners who legally hold it. [high]

### 8.2 Effort and yield (all ESTIMATE, low confidence)

| Work item | Output | Effort ESTIMATE | Needs |
|---|---|---|---|
| Six-character code decoder, test vectors from section 2.2 | Class, base, suffix, status | 1 to 2 days | none |
| Generic base-code import with own wording and similarity check | Up to 9,533 base codes; initial target a few hundred common ones | 2 to 3 days tooling plus review time | OBDex |
| NHTSA bulletin harvester (list, download, extract code and unit pairs, store only facts) | Pair table, count unknown until run | 3 to 4 days | network access, tainted-reader process |
| Control-unit table from the user guide and bulletins | Designator and variant list, plain names | 1 to 2 days | counsel check |
| Mercedes capture on an owner car: scan which units answer to UDS reads | Address and format map for one platform | 1 day per car plus car access | a Mercedes owner |
| Induced harmless faults on one car (washer pump, interior lamp, number plate lamp, door switch) | A handful of verified Mercedes entries per car | 0.5 day per entry set | the car; whitelist from data strategy section 4.4a |
| Community report intake | Slow trickle | ongoing | contributors |

Realistic 12-week yield (ESTIMATE): format layer 100%; generic layer a few hundred curated codes; Mercedes-specific verified entries in the tens to low hundreds. Full coverage of all units in all series is out of reach without OEM data. [low]

### 8.3 Product behaviour for unknown codes

- Show the code, the stored unit, the plain class (engine, network, body), the generic meaning if any, a clear "not yet documented" for the rest, and a "contribute a report" action.
- Never fabricate a meaning. Never match a Mercedes-only code to a generic one without the unit and suffix agreeing.
- Mark each shown meaning with its confidence level (verified, community-reported, experimental) as in the existing data plan.

---

## 9. Legal and rule checks

- No OEM text is stored. Section 4 sources are used for facts only. [rule]
- Community lists in 4.1 (I, J, K) are not copied. [rule]
- OBDb data stays in its own CC-BY-SA pack; our code stays Apache-2.0. The OBDb README says shared modified signal definitions must stay CC BY-SA 4.0 and it does not affect the rest of the app's code (read in the org README). [high]
- Mercedes bulletins carry a Mercedes copyright line; use as above. One short legal check on "extracting facts from bulletins" was already planned (decision D5). [medium]
- XENTRY is a paid, login-bound service. Do not add features that bypass its online checks or personal login. [rule]
- EU regulation basis for independent access is named by Mercedes as 2018/858 for the Lite and Remote products and 715/2007 for Remote Diagnosis eligibility (search result summary). I did not read the regulation text this run. [low]

---

## 10. Sources (fetched or searched on 2026-11-20 unless noted)

Read in full or in part (confidence of the page for the stated facts):
1. https://w220.wiki/M-B_Fault_Error_Codes/Diagnostic_Trouble_Codes_(DTC) : community Mercedes list, format description, roughly 640 to 780 entries, no licence stated. [high for page facts]
2. https://www.mercedesmedic.com/faultcodes/ : community list, about 1,200 claimed earlier, not re-confirmed. [low to medium]
3. https://github.com/OBDb : organisation page, 897 repositories, CC BY-SA 4.0, signalsets layout. [high]
4. https://raw.githubusercontent.com/OBDb/.github/main/profile/README.md : OBDb purpose and licence text. [high]
5. https://raw.githubusercontent.com/OBDb/Mercedes-Benz-E-Class/main/signalsets/v3/default.json : live-data signals, zero DTC matches, headers 7E0, 7E1, 7E2, 7E5 (re-checked). [high]
6. https://raw.githubusercontent.com/OBDb/Mercedes-Benz-E-Class/main/LICENSE : Attribution-ShareAlike 4.0 International. [high]
7. https://raw.githubusercontent.com/OBDb/Mercedes-Benz-C-Class/main/signalsets/v3/default.json and https://raw.githubusercontent.com/OBDb/Mercedes-Benz-G-Class/main/signalsets/v3/default.json : same layout, zero DTC matches; C-Class headers 60A/7E0/7E1/7E2, G-Class 7E2. [high]
8. https://api.github.com/search/repositories (org:OBDb Mercedes, fetched via the page tool) : 37 results, repo names and CC-BY-SA-4.0 licence column, push dates Feb to Nov 2026. [medium; list truncated]
9. https://github.com/foerbsnavi/OBDex , https://raw.githubusercontent.com/foerbsnavi/OBDex/main/README.md , https://foerbsnavi.github.io/OBDex/meta.json , https://foerbsnavi.github.io/OBDex/generic.min.json : counts and licence (CC0-1.0 data, MIT code), manufacturer codes out of scope. [high]
10. https://www.github.com/peyo/dtc-and-vin-data : generic, Toyota, Honda, GM only. [high]
11. https://github.com/mercedes-benz/odxtools and its raw LICENSE and README : MIT, MBition GmbH, ODX reader. [high]
12. https://static.nhtsa.gov/odi/tsbs/2026/MC-11027782-0001.pdf : Mercedes user guide on acronyms, control-unit naming and platforms, version 3, dated 2026-01-20. [high]
13. https://static.nhtsa.gov/odi/tsbs/2022/MC-10217151-0001.pdf , https://static.nhtsa.gov/odi/tsbs/2024/MC-11012059-0001.pdf , https://static.nhtsa.gov/odi/tsbs/2025/MC-11022045-0001.pdf : six-character code shapes and control-unit table layout. [high]
14. https://automotivetechinfo.com/wp-content/uploads/2019/01/XENTRY-and-OBD-II-Go-Deep.pdf : Mercedes StarTuned, June 2018, XENTRY quick scan and OBD-II limits. [high]
15. https://b2bconnect.mercedes-benz.com/is/help/faq/software/xentry-pass-thru-eu : eligibility, requirements, roles, StartKey. [high]
16. https://b2bconnect.mercedes-benz.com/cy/help/faq/software/xentry-diagnosis-lite : Lite scope, functions, time credits. [high]
17. https://en.wikipedia.org/wiki/On-board_diagnostics and https://en.wikipedia.org/wiki/OBD-II_PIDs : DTC structure. [medium to high]

Search results only (not opened, treat as leads):
18. https://static.nhtsa.gov/odi/tsbs/2020/MC-10183255-9999.pdf , https://static.nhtsa.gov/odi/tsbs/2024/MC-11005313-0001.pdf , https://static.nhtsa.gov/odi/tsbs/2013/SB-10096446-5448.pdf , https://static.nhtsa.gov/odi/tsbs/2014/SB-10062573-2280.pdf : further Mercedes bulletins with codes and unit designators. [medium]
19. https://saemobilus.sae.org/content/J2012_201303/ and https://saemobilus.sae.org/standards/j2012da_202403-digital-annex-diagnostic-trouble-code-definitions-failure-type-byte-definitions : SAE J2012 and the digital annex; paid. [medium]
20. https://www.techtips.ie/Hella-Ireland/conversion-of-a-fault-code-given-as-hexadecimal-number.pdf : Hella note on hex fault codes. [low]
21. https://mbworld.org/forums/new-members-check/795638-fault-code-lists-mercedes-benz.html?nojs=1 , Haynes UK pages (uk.haynes.com odb-fault-codes pages), Scribd and blog uploads : unverified lists. [low]
22. https://b2bconnect.mercedes-benz.com/gb/help/faq/order-cancellation/xentry-remote-diagnosis and the Mercedes-Benz Trucks service-info pages : SERMI and regulation basis summaries. [low]

---

## 11. Gaps (what remains unknown or unverified)

1. **Total Mercedes bulletin count and distinct codes in the NHTSA archive.** Not measured. A harvester run would give the number; do not quote one before then.
2. **The meaning of the failure-type suffix on Mercedes cars.** Structure is consistent with the standard's three-byte form; the value list is in the paid J2012-DA and was not read. Needs a primary check or capture evidence.
3. **Whether Mercedes-specific base codes (second digit 1, or manufacturer ranges in the SAE space) in six-character form are common.** Only P012D, P0128, P0191, P2610 and U0300 style examples were seen, all looking like SAE-range bases. No B1xxx or U1xxx example was seen in the six-character form.
4. **The older number-only code scheme (four-digit numbers, hex conversion).** Only snippet-level evidence. Needs the Hella note and an older Mercedes documentation page opened.
5. **The control-unit nomenclature image** referenced by Mercedes' user guide (unreadable here). It likely lists names and short names. Obtain it from the NHTSA bulletin attachment via an image view, not text extraction.
6. **Gateway filtering and DoIP activation on newer cars through a plain adapter.** No primary evidence read. Needs an owner test. Prior doc still marks this as unverified.
7. **Whether SCN coding needs a server round trip.** Not shown in any page read.
8. **XENTRY pricing in euros.** Not found. Structure only (annual flat fee plus time credits).
9. **Licence of the two big community lists.** Page footers (privacy, disclaimer, about) were not read. There may be terms there.
10. **OBDb Mercedes coverage beyond three repos.** Only E-Class, C-Class and G-Class were opened. Other Mercedes repos and other makes might include DTC files. The count of 37 Mercedes repos is from a truncated search result.
11. **Rate limits.** GitHub's API refused further unauthenticated calls after a few requests, so repository counts and dates for the full OBDb Mercedes list were not re-checked.
12. **Search tool limits.** Searches are US-only and several results were Scribd or paywalled pages whose contents could not be seen, so the coverage of that part of the web is incomplete.
13. **Coverage and effort numbers in sections 6.4 and 8.2 are estimates** with no usage data behind them. Replace with measured values after the capture phase.
14. **No Mercedes car was tested.** Everything about adapters reaching units is inference until the owner's car (or a friend's) is scanned.

---

## 12. Next steps (ordered, for the plan)

1. Add the six-character test vectors (section 2.2) to the decoder tests. Cost: under one day. No data risk.
2. Write the NHTSA harvester so it saves only (bulletin id, unit designator, variant, code, suffix, remedy class). Then count. This turns Gap 1 into a number.
3. Open the J2012-DA structure question with a primary source or one capture from a Mercedes car (Gap 2).
4. Decide whether the share-alike pack for OBDb Mercedes signals is worth shipping (live data only) or wait for DTC content. Owner call.
5. If a Mercedes owner is available, run the read-only module probe from the data strategy and record which units answer (Gap 6).
6. Keep Mercedes writes, SCN, flash and key functions out of scope (owner decision 2).
