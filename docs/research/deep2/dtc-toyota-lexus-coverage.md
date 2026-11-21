# Toyota and Lexus fault-code (DTC) coverage: what is public, what an adapter can read, what we can build

Status: research, 2026-11-20. Status flag: **PARTIAL** (see Gaps). Not legal advice.
Scope: widest legitimate Toyota/Lexus DTC coverage with plain-English meanings, no leaked, pirated or copied OEM text.
Owner decision applied: share-alike data (CC-BY-SA) may live in a separate pack; our own packs stay CC0/CC-BY (`docs/plan/decisions.md`, decision 1).
Already covered elsewhere and not repeated here: Toyota protocol and address plan, OBDb signal data, opendbc, Prius/Camry/Supra addressing (`docs/research/deep/toyota-lexus-protocols-and-open-data.md`), forum/practice gaps (`toyota-lexus-forums-and-practice.md`), generic DTC rewrite plan and OBDex baseline (`docs/plan/data-strategy.md` section 3, 4.2).

Confidence tags: **[high]** read on a primary or the project's own page this run; **[medium]** secondary, vendor or single source; **[low]** inference, background knowledge, or unverified. Tool note: pages came through a summarising fetch tool, so every reading is second-hand; counts quoted are the sources' own words, not my counts. No fault text was copied from any source; only counts, formats, licences, ranges and coverage are recorded.

---

## 1. Executive summary

1. **Nobody publishes a free, complete, licensed Toyota/Lexus manufacturer-DTC list.** I found no open dataset (any licence) that holds Toyota P1xxx, hybrid P3xxx, or Toyota B/C/U codes with plain meanings. OBDex states it covers only the generic layer and leaves manufacturer-specific codes (P1xxx, B1xxx) "with their makers" [high] [S1]. OBDb's scope statement includes DTCs, but I found no DTC dataset in it [medium] [S5][S6].
2. **The legitimate official source exists but is paid and not redistributable.** US law requires manufacturers to publish manufacturer-specific emissions-related trouble codes with related bulletins and repair procedures, on a website with short-term (24 to 72 hours), 30-day and 365-day subscriptions, at a "fair and reasonable price" [high] [S10]. Toyota's TIS (techinfo.toyota.com) is that channel for North America [high] [S2][S3]. It is a right to access, not a licence to republish (consistent with `data-strategy.md` 4.6).
3. **What Toyota gives away free, verified from its own page:** emergency responder and dismantler information (Emergency Response Guides, Dismantling Guides, Owner's Manuals) and a VIN safety-recall lookup [high] [S2]. None of that is a DTC list. I could not read a free Toyota owner's-manual page (HTTP 403) so whether owner manuals contain any DTC text is unverified [S24].
4. **Prices are not on Toyota's public page.** Toyota's page text says three levels (Standard, Professional Diagnostic, Security Professional) yet its feature table shows four columns including Keycode, and it shows no price [high] [S2]; the Snap-on-hosted details page also lists Keycode [high] [S3]. A trade article quotes a 2-day ($55) and 1-year ($995) Professional Diagnostic term, but its date is internally inconsistent, so treat as stale [low] [S12]. A 2026 third-party review quotes about $35 for 2 days and $55 monthly; unverified and conflicting [low] [S13]. Do not budget from either. Toyota's own support phone and the subscribe flow are the only reliable price source.
5. **Best legitimate public leads for manufacturer codes:**
   - NHTSA-hosted Toyota technical service bulletins (public PDFs; a bulk summary file exists) [high] [S9][S14]. Facts-only leads, because the PDFs are Toyota documents and the data.gov record states no licence [high] [S14].
   - Third-party commercial sites (MotorData, others) with unstated reuse terms; leads only [medium] [S15].
   - Our own induced-fault captures and owner experience (already in the plan).
6. **A generic adapter reads only part of the problem.** Standard OBD-II reads emission-related powertrain codes (and, per the code format, can carry P1xxx and P3xxx on that same service). Toyota's chassis (ABS/VSC), body, airbag (SRS), smart-key and hybrid-battery codes live in other control units and need per-ECU enhanced requests (Toyota-specific service 0x21/0x22 style, and UDS 0x19 on newer units) [medium] [S7][S17]. Retail guidance agrees that a basic OBD2 reader typically shows engine-side codes only [medium] [S16].
7. **Hybrid codes have a two-level structure.** The hybrid battery master code is a parent and the real information is in additional "information codes" (INF numbers) held in the HV battery ECU, written like "P3000/123" in Toyota's own tip text as summarised by a secondary source [medium] [S18]. Our DTC schema has no sub-code field today (checked `data-schema.md` section 4.3: `code` plus optional `fault_type_byte` only). Add one before building Toyota hybrid entries.
8. **Achievable coverage in 12 weeks (estimate, not a promise):**
   - ~9,500 generic entries inherited as a cross-check baseline from OBDex (CC0) [high] [S1], already planned.
   - 60 to 100 Toyota/Lexus manufacturer-specific entries with plain meanings, mostly hybrid battery block codes and common P1xxx engine, ABS and network codes, rewritten in our own words from public leads and verified by owner captures where possible (estimate).
   - Thousands of Toyota-specific codes exist in the commercial world: MotorData claims "several thousand" Toyota-specific within 60,000+ codes [medium, vendor claim] [S15]. We will not reach that without a paid data licence or a large community. Be honest: Toyota manufacturer-DTC coverage will stay a small fraction (estimate: low single-digit percent of the commercial total) in year one.
9. **Recommendation:** ship generic coverage fast; ship a small, verified Toyota/Lexus pack (hybrid first); show "unknown manufacturer code" gracefully with the raw code, the system it belongs to, and a "where to look" pointer to TIS, rather than guessing a meaning. Never claim a meaning we have not sourced and reviewed.

---

## 2. What is in the Toyota/Lexus DTC space (structure and ranges)

### 2.1 Code format and who controls which range

- A DTC is five characters: a letter (P powertrain, C chassis, B body, U network), then four hex digits [high] [S4].
- Second character: 0 is SAE generic; 1 is manufacturer-specific; 2 is generic for P codes but manufacturer-specific for B, C, U; 3 is jointly defined for P and reserved for B, C, U [high] [S4].
- Third character is the subsystem, 0 to 8 or A to F (A to F used for hybrid) [high] [S4].
- Therefore the Toyota/Lexus-controlled space is: P1xxx; B1xxx and B2xxx; C1xxx and C2xxx; U1xxx and U2xxx. The generic space we can already cover from public regulation-derived work is P0, P2, B0, C0, U0 and part of P3 [high] [S4][S1].
- Hybrid note: the "A" third-digit subsystem exists for hybrid propulsion in the generic range, so some hybrid battery and inverter codes are generic P0Axx codes, not Toyota-specific. Search results describe P0A80 as a standard (generic) companion code and P3xxx as Toyota/Lexus-used [medium] [S18]. Whether every P3xxx block code is formally "joint" or Toyota-defined is not settled by any source I read [low].
- OBDex includes P3 (155 codes, labelled "shared SAE / manufacturer range") and U3 (174 codes, hybrid/fuel cell) [high] [S1], so a few hybrid-adjacent codes are already in the free CC0 baseline. How many of Toyota's hybrid battery block codes appear there is **not verified** [gap].

### 2.2 Families seen in public Toyota material (identifiers only, no meanings copied)

All identifiers below are facts about which code families exist; meanings are deliberately not reproduced.

| Family | Evidence of existence | Confidence | Source |
|---|---|---|---|
| P1xxx engine and VVT-type codes (examples cited: P1604, P1605, P1135, P1141, P1250-series, P1030) | Named in secondary lists | medium | [S15][S19] |
| Hybrid battery master code P3000 and block series P3011 to about P3029 (block count varies by model; sources disagree on the end of the series) | Several parts-seller and forum sources agree on the existence and the parent/child idea | medium | [S18] |
| Hybrid cell-voltage code P3040 and nearby P30xx | Single search result mention | low | [S18] |
| Companion hybrid code P0A80 (generic range) | Same sources | medium | [S18] |
| ABS/VSC chassis code example C1201 | Named in one list | medium | [S15] |
| Communication loss U-codes, e.g. a hybrid control module comms code in a 2010 Prius printout (U0293) | Printout hosted on PriusChat, unofficial | low | [S20] |
| Pre-1996 "flash" blink codes (Toyota diagnostic jumper era) | MotorData mentions Flash codes, scope unclear | low | [S15] |

Not found for Toyota: any source stating a full count of Toyota P1xxx, B1xxx, C1xxx or U1xxx codes, or a model-by-model matrix of which codes exist on which model year [gap].

### 2.3 Toyota "information code" (INF) layering for hybrids

- The hybrid battery system uses a parent DTC with a second identifier. Toyota Tech Tip T-TT-0303-14 (2001 to 2009 Prius) is cited in secondary material as covering "P3000/123"; the secondary source says to diagnose the HV Battery ECU's own codes first [medium] [S18]. I did not open the Toyota tip itself.
- INF numbers are read with Techstream (or a hybrid-capable aftermarket tool such as Dr. Prius) from the HV Battery ECU [medium] [S18].
- One Camry Hybrid source gives different meanings for different INF values under the same parent; I record only that the INF value changes the meaning [low] [S18].
- Sources conflict: some sites present P3000-XX as a sub-code family, while Toyota-derived material treats P3011 to P3029 as standalone block codes [medium] [S18]. We must resolve this by capture on a real hybrid before writing entries.
- **Schema implication:** a DTC entry needs `parent_code` and `info_code` (or a free `sub_code`) fields, and an applicability range by model and year. The current schema lacks both (`data-schema.md` 4.3). **Action: schema change request before Toyota hybrid entries.**

### 2.4 ECU naming (what Techstream and printouts call modules)

- Techstream groups ECUs into Powertrain, Chassis and Body tabs on its system-selection screen [low, from a search-result summary] [S20].
- Names seen in an unofficial 2010 Prius printout: engine control unit, ABS control unit, entry and start / smart key, hybrid control module [low] [S20].
- A Toyota bulletin about configuration software for ECU replacement lists ECU categories such as airbag, body, brake, HV, EMPS, inverter and power distribution box for certain 2023 models [low, summary only] [S21].
- Toyota's older diagnostic data in OBDb uses fixed 11-bit request addresses in the 0x700 to 0x7DF range with replies at request plus 8 (covered in `toyota-lexus-protocols-and-open-data.md`) [high there].
- No official public Toyota table mapping ECU labels to addresses or to DTC families was found [gap]. Our ECU naming must come from our own module scan (read a safe identification service, record who answers) plus the OBDb ECU lists, and we should use neutral plain-English names ("hybrid control", "battery monitor", "brake and stability", "body", "smart key", "airbag") rather than copying Toyota's labels as a catalogue.

---

## 3. Public sources, one by one

### 3.1 Toyota official: techinfo.toyota.com (TIS)

Verified from the Toyota page itself on 2026-11-20 [high] [S2]:
- Describes TIS as the service support source for Toyota-produced vehicles marketed in North America, covering most 1990 and later products.
- Access needs a subscriber login. New users subscribe through a payment site run by a third-party vendor.
- Vehicle security information (key codes, immobiliser/smart reset) is limited to security professionals on the NASTF Vehicle Security Professional Registry, for US and Mexico VINs.
- Three levels in the headline text (Standard, Professional Diagnostic, Security Professional), but the feature table has four columns (adds Keycode), so the page is internally inconsistent. The page links Terms of Use, Privacy Policy and Payments and Refunds; I could not read their contents.
- Free: emergency responder and dismantler information (Emergency Response Guides, Dismantling Guides, Owner's Manuals) and safety-recall/campaign lookup by VIN.

Verified from the Snap-on-hosted subscription detail page [high] [S3]:
- Standard: technical information library for Toyota, Scion and Lexus vehicles sold in North America, search by model and year to maintain, diagnose and repair; generally from model year 1990, some bulletins back to 1987.
- Professional Diagnostic: everything in Standard plus Techstream software download and current ECU calibration files; Techstream use limited to one PC per professional subscription; pairing with Techstream or Mongoose hardware gives scan-tool diagnostics and reprogramming; Supra (2020 and later) wiring diagrams only via ISTA, which needs this tier.
- Security Professional: adds key codes and immobiliser/smart reset; requires current NASTF registry membership.
- Keycode: key codes only; also needs NASTF membership.
- Identifix Direct-Hit access and one assistance call come with annual Professional subscriptions.
- The page does not list DTCs, repair manuals or bulletins by tier. So "does Standard include the DTC diagnosis procedures" is **not verified by this page** [gap].

Toyota Techstream Lite [medium] [S11][S13]:
- A 2019 flyer lists $1,095 (one year) and $2,190 (two years) packages with Direct-Hit; the flyer says pricing may change [medium, search summary].
- Kit contents (Snap-on page) include a J2534 interface (MongoosePro MFC2), not the cheap Mini-VCI [medium, search summary].
- An active TIS subscription is required to use Techstream Lite [medium].
- Multi-factor sign-in was planned from 2025-08-28 [low, one summary].

What this means for OpenDiag: Toyota's own DTC knowledge is behind a login. Free public Toyota material (emergency, dismantler, recall) is not a source of DTC meanings. A paying customer may read the repair information to understand; the plan's tainted-reader rule applies (`data-strategy.md` section 8).

### 3.2 Toyota official: Europe (toyota-tech.eu)

- A search summary says independent operators in Europe register as Registered Independent Operators, certificate valid 2 years, one-off non-refundable fee of EUR 149; Euro 5 information has a minimum charge of EUR 3 for one hour [low, from search snippets; the portal redirected to a login when fetched] [S22].
- An EU Commission decision is cited as describing Toyota's technical information website as the place Toyota committed to publish information for independent repairers, and the Commission found the information seemed still incomplete [medium, secondary] [S22].
- I could not open the portal's public pages (login redirect), so European Toyota/Lexus DTC content and prices are **unverified** [gap].

### 3.3 US law that makes the official information available

- 40 CFR 86.1808-01(f), read from Cornell LII on 2026-11-20 [high] [S10]:
  - Applies to 1996-and-later light-duty vehicles and trucks, and 2005-and-later heavy-duty vehicles up to 14,000 lb GVWR.
  - Manufacturers must give repair shops and the EPA emissions diagnosis and repair information: OBD system details, service manuals, technical service bulletins, recall information, training materials.
  - Trade-secret information may be withheld unless already shared with franchised dealers.
  - Manufacturer website must be full-text searchable, with short-term (24 to 72 hours), 30-day and 365-day subscriptions, each covering the whole site, updated at the same time as dealer sites.
  - Price must be "fair and reasonable"; cost factors named include dealer costs and what independent shops can afford.
  - Manufacturer-specific emissions-related trouble codes must be published along with related bulletins, troubleshooting guides and repair procedures.
  - Manufacturers must provide enhanced service information, including bi-directional control and data stream information, to tool and equipment companies, plus hardware and communication specifications to build generic scan tools.
  - Manufacturers may take reasonable business precautions against misuse of proprietary information.
- Important limits [medium]: the duty is to make information available at a price, not to put it in the public domain; and the obligation is on emissions-related information (non-emissions chassis/body DTCs are not clearly covered by this rule; I did not verify the boundary) [S10]. A 2026 EPA letter (found only as a search snippet) says the duty does not extend to proprietary design or software code [low] [S23].
- The OBD requirements themselves (40 CFR 86.010-18) are a long page; the visible portion did not answer whether manufacturer-specific DTCs must be documented publicly, because the relevant paragraph (k) was truncated [high that I did not read it] [S25]. California's equivalent (13 CCR 1968.2) is the source OBDex cites for generic codes; I did not re-read it this run [S1].
- Right-to-repair legislation is moving; see `legal-regulatory-landscape-deep.md`. Not repeated.

### 3.4 NHTSA: Toyota bulletins and the TSB summary file

- NHTSA hosts individual manufacturer bulletins as PDFs under static.nhtsa.gov (path pattern `/odi/tsbs/<year>/MC-<number>-9999.pdf`). I opened one: a Toyota technical service bulletin whose printed date is 2020-10-21 (revision 2; odd for a file under /2023/, so the date may be the original issue), about ECU flash reprogramming with a security signature for 2022 to 2024 models (86, Corolla Cross, Tundra, others), 20 pages, with links to Toyota's dealer and technical-information sites [high; read by downloading the PDF and extracting its first lines] [S9].
  - Takeaway: public Toyota bulletins are on NHTSA's site and they do refer to Techstream and reprogramming. This one is a procedure document, not a DTC list.
  - Search results also surfaced other Toyota/Lexus bulletins, including ones that appear to concern Prius hybrid battery topics (e.g. a 2014 and a 2015 NHTSA-hosted bulletin) [low; I did not open them] [S18].
- Data.gov record for the NHTSA TSB summary file [high] [S14]:
  - Contains summaries of manufacturers' TSBs organised by single year, make and model; does not include all bulletins and omits safety-recall bulletins.
  - Access level and rights listed as "public"; no specific licence or reuse terms stated.
  - Format CSV in a ZIP; dataset page https://data.transportation.gov/d/hczg-qbhf; data description TXT.
  - Updated 2026-09-03 per the catalog page; no regular update schedule stated.
  - Summaries only, not the full bulletin text.
- **Legal reading (not legal advice, [low]):** a federal agency hosting a file does not make Toyota's bulletin text free to reuse; copyright in the bulletin text is probably Toyota's. Facts in them (which codes exist on which models) are not copyrightable as facts, but our entries must still be our own words. Treat NHTSA bulletins as fact leads, flag them in `SOURCES.md` as "public, third-party-copyright, facts only", and put the NHTSA lead at the same caution level as a forum lead for confidence purposes (needs a capture to go above `low`).
- **Effort/value (estimate):** the bulk summary file is the cheap way to find which bulletins mention which components and DTC families by model; mining it for code identifiers is a script job (see section 8).

### 3.5 Open datasets and repositories

| Source | What it holds | Toyota/Lexus manufacturer DTCs? | Licence | Confidence | Source |
|---|---|---|---|---|---|
| foerbsnavi/OBDex | 9,533 generic codes: P0 3,705; P2 3,495; P3 155; B0 323; C0 626; U0 1,055; U3 174. Rewritten from regulations, manufacturer bulletins and patents (30,875 source links across 244 sites per its page); English and German; 132 PIDs | No: README says manufacturer-specific codes such as P1xxx and B1xxx stay with their makers | Data CC0-1.0, code MIT | high | [S1] |
| OBDb (github.com/OBDb) | 897 repos at fetch time; description says it documents parameters, scalings and DTCs; most text CC-BY-SA-4.0; pinned SAEJ1979 and schemas repos | No DTC dataset seen; Toyota repos hold signal definitions (Toyota-Prius repo is CC-BY-SA-4.0 and its page does not mention DTC data) | CC-BY-SA-4.0 | medium | [S5][S6] |
| peyo/dtc-and-vin-data | A repo of R scripts and JSON DTC data for generic, Toyota, Honda, GM P-codes; links a scraper repo; 34 commits; no licence label or LICENSE file seen in the listing (truncated, so not fully confirmed); data source and row counts not stated | Possibly yes (Toyota P-codes), provenance unknown | None seen: all rights reserved by default (unverified) | low | [S8] |
| todrobbins/dtcdb | `generic.csv`; README lists reference sources for PIDs including Wikipedia, SAE J1979, myscantool and a German DMV list; 5 commits | Not stated; filename suggests generic only | MIT | medium | [S26] |
| Codewise (thefinalmilkman.github.io) | Web decoder, 252 codes (101 P1xxx, 133 P0xxx), says 14 brands but names none | Some, count per brand not given | No licence or data download found | low | [S27] |
| comma.ai opendbc | CAN signals, not DTCs | No | MIT | high | see existing doc |

Decisions:
- OBDex stays the generic baseline and cross-check. No Toyota P1 data there. [high]
- OBDb: allowed as a separate CC-BY-SA pack under owner decision 1, but it contains parameters, not codes, so it does not close the DTC gap [medium].
- peyo/dtc-and-vin-data: **do not use** unless the owner of that repo adds a licence. Without a licence we have no right to copy, and its provenance (a scraper) suggests the underlying text came from a third party site [low]. At most, ask the author which source and licence apply.
- A GitHub repository search for further Toyota DTC datasets could not be run: the API returned an authentication failure from this machine, and an unauthenticated call hit the rate limit [gap]. Re-run `gh search repos` after the token is fixed; see Gaps.

### 3.6 Commercial and community reference sites (leads, not sources)

- **MotorData** (motordata.net): says it holds "more than 60,000 trouble codes across all supported makes, of which several thousand are Toyota-specific", gives Toyota codes by system, and mentions Flash codes (tied on the page to KD/CD diesels and pre-OBD-II, internally inconsistent); footer shows copyright 2026 and a User License Agreement I could not read [medium, vendor claim] [S15]. Treat as a commercial database: no copying; cross-check only if the agreement allows reading for research (unverified).
- **MOTOR (motor.com) Diagnostic Trouble Codes**: commercial product of OEM-based descriptions with diagnostic flowcharts, delivered by API or bulk, licensed by contacting sales; no pricing, no make list on the page [medium] [S28]. This is the real "licence the data" route. A price quote is an owner decision, outside the zero-cost plan; ask only if the owner wants it (section 9).
- **OBDeleven Toyota fault code list**: returned HTTP 403 [gap] [S29].
- **Parts-seller code pages (go-parts and similar), hybrid blogs, Q&A sites**: useful to confirm that a code exists and which hybrid models carry it; their text is promotional and sometimes contradicts Toyota-derived material (see 2.3) [medium] [S18]. Not usable as text sources.
- **IATN** (International Automotive Technicians Network) has a monthly "Diagnostic Trouble Code Index" of its Q&A posts [low, listing only; membership and licence unread] [S30].
- **Forum attachments** (PriusChat, ClubLexus) host scanned Toyota material such as printouts and tip PDFs. These are third-party uploads of Toyota documents; **do not use or link as sources** (copy status unknown, may be unlicensed) [low] [S20][S31].

### 3.7 Official-adjacent public information we should record but not copy

- Owner's manuals: the TIS page says owner's manuals are free [high] [S2]. They normally describe warning lights and basic troubleshooting, not code-by-code DTC tables (background, [low], unverified for current models). If they contain brief warning-light behaviour facts we can use them as facts for "what the dashboard light means", rewritten (read and rewrite, per `data-strategy.md` row "Service procedures").
- Emergency Response Guides: free per Toyota; they cover high-voltage safety for hybrids and electric vehicles and are not a DTC source [medium] [S2].
- Recall and campaign lookups: free by VIN; could provide "this VIN has an open campaign touching hybrid battery software" pointers but not DTC meanings [medium] [S2].

---

## 4. What a generic adapter and the stack can read

### 4.1 Layers

| Layer | What it returns on Toyota/Lexus | Works with a cheap ELM327-class adapter? | Confidence |
|---|---|---|---|
| OBD-II mode 03/07/0A (stored, pending, permanent codes) | Emission-related powertrain ECU codes; includes generic P0/P2 and manufacturer P1 (and P3) codes as the 2-byte code | Yes on any 2008+ US car (CAN on pins 6 and 14, 11-bit, functional request 7DF, replies 7E8 to 7EF) | high [S4][S7]; basic-scanner limit medium [S16] |
| Mode 02 freeze frame, mode 01 status (MIL, monitors) | Same ECU | Yes | high [S4] |
| Toyota hybrid controllers via OBD standard addresses | Hybrid control and battery controller reply at 7E9 to 7EB per Wikipedia; OBDb Prius list uses request addresses 7E2 and 7E3 (conflict of detail noted in the existing doc) | Yes if the adapter can address a specific ECU, not only broadcast | medium [S4][S7] |
| Toyota-specific enhanced services (0x21 read local identifier; 0x22 read by identifier) on addresses such as 7B0, 7C0, 780, 750 | Live data, and on newer units fault memory, per ECU | Yes if the adapter passes arbitrary CAN requests with custom headers and flow control | medium [S4][S5] |
| UDS read DTC by status (0x19) on non-engine ECUs | ABS, SRS, body, smart key codes (B/C/U ranges) on UDS-speaking units | Needs per-ECU physical addressing and ISO-TP; ELM327 clones struggle with long multi-frame traffic (see `adapter-hardware-and-protocol-teardown.md`) | low-medium (background, not source-verified for Toyota) |
| Toyota information codes (INF) for hybrid parent codes | Held in HV battery ECU; Techstream reads them | Not known to be reachable by generic requests; access path unverified | low [S18] |
| Pre-1996 and early OBD flash/blink codes | Read by jumper and light blinks, not an adapter | Out of scope for an adapter tool; note only | medium [S15] |

Verified supporting facts:
- Standard OBD-II codes are of the form letter plus four hex digits, service 03 reads stored codes and 04 clears them [high] [S4][S7].
- Manufacturers may add services above those in J1979, and Wikipedia names service 21 for Toyota as an example [high] [S7].
- A Toyota C1201-type chassis or B1xxx body code sits outside the generic set a basic scanner is expected to interpret; retail guidance says to use a Toyota-specific tool or Techstream [medium, secondary] [S16].
- No source I found says Toyota's DLC3 is blocked behind a secure gateway on 2022+ models; this stays an open question (see `toyota-lexus-protocols-and-open-data.md`) [gap].

### 4.2 Practical meaning for the product

1. **Tier 1 (works everywhere):** Show every stored/pending/permanent engine-side code with generic meaning from our pack. Display P1xxx as "Toyota-specific code" with our meaning if we have it, otherwise show the raw code, the system, and a link-out. [high feasibility]
2. **Tier 2 (Toyota enhanced, read-only):** Probe a per-model list of ECU addresses and ask for fault memory with the same request style OBDb uses for data; display B/C/U and hybrid codes only where we have verified request forms (from our own captures). [medium feasibility; data-driven]
3. **Tier 3 (hybrid INF):** display the parent code plus INF only after a capture proves the request and decode on a real hybrid. [low feasibility now]
4. **Safety classification:** Toyota airbag (SRS), immobiliser, key and hybrid high-voltage codes are `class: safety` by default (schema rule: unknown defaults to safety). We read and explain; we never clear safety-class codes without a warning (existing fault-handling policy, `data-schema.md` 4.3).
5. **Clearing:** clearing hybrid or SRS codes can hide a real fault. Show the plain-English "this can come back" note and require a confirmation.

---

## 5. Licensing and legal position per source family

| Source family | May we read it | May we copy text | May we copy facts (code existence, ranges, counts) | Our action | Confidence |
|---|---|---|---|---|---|
| SAE J2012 / ISO 15031-6 | Public summaries only (paid standard) | No | Code identifiers and structure yes | Rewrite generic text ourselves; OBDex as cross-check | high (matches `data-strategy.md`) |
| OBDex | Yes | CC0 data: permitted; we still rewrite per plan | Yes | Baseline cross-check | high [S1] |
| OBDb | Yes | CC-BY-SA-4.0: only in a separate share-alike pack | Yes | Separate pack, attribution file | high [S5] |
| Toyota TIS | Only as paying subscriber | No (assume no redistribution; terms unread) | Only facts we also verify independently | Tainted-reader rule; short subscription only when blocked on one fact | medium [S2][S3] |
| NHTSA-hosted Toyota TSBs | Yes (public) | No (Toyota copyright, unverified) | Facts yes | Leads, ledger entry, rewrite | low-medium [S9][S14] |
| NHTSA TSB summary CSV | Yes | Rights "public", no licence stated | Yes | Use as an index of leads | medium [S14] |
| Commercial DB (MotorData, MOTOR) | Read for orientation | No | No bulk extraction | Do not scrape; do not copy | medium [S15][S28] |
| Forum attachments of OEM documents | Avoid | No | No | Do not link or rely | low [S20] |
| Community reports | Yes | Own words only | Yes | Weight `low` until captured | high (plan) |
| Owner induced-fault tests | Our data | Yes (our own) | Yes | Primary engine for "verified" | high (plan) |

Legal checks to put in the existing D5 counsel hour (`data-strategy.md`): (a) are facts about which Toyota code exists on which model, taken from a public NHTSA bulletin, safe to record; (b) is a Toyota owner reading TIS and then writing a code meaning in their own words a "tainted reader" problem; (c) the OBDb share-alike pack boundary for a Toyota-specific pack. Also ask whether Toyota's TIS Terms of Use forbid use of its content for building a competing database (terms unread).

---

## 6. Coverage model and achievable numbers (estimates, not facts)

### 6.1 Baseline numbers that are facts

- Generic baseline available free (CC0): 9,533 codes [high] [S1].
- Commercial total claimed by one vendor: 60,000+ codes across all makes, several thousand Toyota-specific [medium, vendor claim] [S15].
- Existing plan target: 200 DTCs total across two chassis families in 12 weeks (`data-strategy.md` 7.1).

### 6.2 Proposed Toyota/Lexus slice (estimate)

| Tier | Content | Count (estimate) | Source mix | Review cost per entry (estimate) | Confidence level reachable |
|---|---|---|---|---|---|
| T-A | Generic codes that apply to Toyota hybrids and engines (inherits the generic pack): P0/P2 rewrite, U0 comms, hybrid P0Axx | 0 extra (inherited from generic pack), plus 20 hybrid P0Axx and P30xx checks | public_standard | 10 minutes | medium |
| T-B | Hybrid battery block codes P3011 to about P3029 as one family, plus master P3000 explanation | 20 entries (one per block) written as a templated family | public leads + capture on hybrid | 15 minutes each, 1 capture session on a hybrid | medium-high if a hybrid is available |
| T-C | Common Toyota P1xxx engine, VVT and start-up codes | 20 to 40 | NHTSA bulletin leads + community + induced test where harmless | 30 to 45 minutes each | low-medium |
| T-D | Toyota C-range ABS/VSC and B-range body/SRS codes | 10 to 20 (SRS read-only, safety class) | bulletin leads only; induced faults not allowed on SRS | 45 minutes each | low |
| T-E | U-range loss-of-communication codes tied to our own module scan | 10 to 20 | owner capture | 15 minutes each | medium |
| **Total new Toyota/Lexus-specific** |  | **about 60 to 100** (estimate) |  | **about 30 to 50 hours of author and review time** (estimate) |  |

- That is under 3 percent of the vendor-claimed "several thousand" Toyota-specific codes, so honest framing is "a verified starter set", not "full Toyota coverage" (estimate).
- With a second hybrid owner and a community contribution call, 150 to 300 entries in 6 months is plausible but not evidenced (estimate, low).
- The Lexus mapping: no Lexus-specific OBDb repos and no Lexus DBC in opendbc (existing doc); Lexus shares Toyota platform codes mostly. We should mark each Toyota entry with an applicability list of models including Lexus siblings only after proof, not by assumption [medium].

### 6.3 Effort summary (estimate)

| Work item | Days | Notes |
|---|---|---|
| Add `parent_code`, `info_code`, model/year applicability to DTC schema and linter | 1 to 2 | schema change in `data-schema.md` 4.3; linter rule |
| Script to mine the NHTSA TSB summary CSV for Toyota/Lexus bulletins that name hybrid battery, VVT, ABS components, outputs a lead list, no text stored | 1 to 2 | facts only; store bulletin IDs and component names |
| Author the 20 P30xx block entries as a family with a template | 1 | plain-English, own words |
| Capture session on a Toyota hybrid: read-only modes 03, 07, 0A, 02, then probe hybrid battery ECU for fault memory | 1 to 2 days of owner time | needs access to a hybrid; the plan's D1 fallback is a Prius |
| 20 to 40 P1xxx entries | 3 to 5 | slowest; plan for 30 to 45 minutes each |
| B/C/SRS read-only entries | 2 to 3 | safety class; stronger review |
| Source ledger rows, similarity check against OBDex and any commercial sites read | 1 | existing tools in `data-strategy.md` section 5 |
| Counsel questions (add to D5 hour) | 0 extra | |
| **Total** | **about 10 to 16 working days** (estimate) | fits inside the existing 12-week data track if cars and a hybrid are available |

### 6.4 What would raise coverage materially

1. **Licence commercial data** (MOTOR or similar): price unknown; cannot be redistributed in a CC pack, so this does not help an open pack [medium, inference] [S28]. Not recommended for an open project.
2. **Community capture programme:** guided induced-fault and capture workflows for Toyota hybrid owners, as in the plan. The Toyota hybrid community is large and active (existing doc, forum evidence thin). Convert a few owners into contributors.
3. **Open call to OBDb** to add a DTC section for Toyota/Lexus under CC-BY-SA: a share-alike pack is acceptable under owner decision 1, but I found no existing DTC structure there [medium].
4. **Ask Toyota** (unlikely): no public sign Toyota publishes an open DTC list; a polite request for permission to reuse short descriptive text would be cheap but I would not plan on it [low].

---

## 7. Risks specific to Toyota/Lexus DTCs

1. **Provenance risk:** most online Toyota code lists trace back to Toyota repair manuals. A near-copy of a list is a copy of Toyota's text. Mitigation: own-words rule, n-gram similarity check against anything read, tainted-reader rule for anyone who read TIS text before authoring.
2. **Accuracy risk:** sources disagree on hybrid structure (2.3). A wrong meaning on a hybrid battery code can push a user to scrap a good battery. Mitigation: confidence tags, `experimental` label, "verify with a qualified technician" note, no replacement advice.
3. **Model-year drift:** the same P1xxx may mean different things on different models. Applicability by model, engine and year is mandatory; a bare code to meaning map is wrong (general fact of manufacturer codes; [medium] from the existence of per-model OBDb gating).
4. **Safety class:** SRS, airbag, immobiliser, hybrid high voltage. Read-only, plain, warning wording; never offer clear for SRS.
5. **Security and gateway changes on 2022+ models:** the 2013 and 2023 research pieces show the direction of travel (existing doc); coverage may shrink for new cars even as old-car coverage grows.
6. **Vendor takedown risk:** low for our own wording; non-zero if a rewrite is too close to a Toyota phrase. Keep a similarity log.

---

## 8. Concrete pack and process proposal

1. **Schema:** add to DTC entry: `parent_code` (optional), `info_code` (optional, string), `applicability` (make, model, years, engine), `source_class` (`public_standard`, `public_bulletin_lead`, `owner_capture`, `community_report`), `plain` (own words), `safety_class`. Flag `confidence`. [change request]
2. **Packs:**
   - `generic` (CC0): OBDex-cross-checked rewrite.
   - `toyota-lexus` (CC-BY-4.0): our own entries, tiers T-B to T-E.
   - `obdb-derived` (CC-BY-SA-4.0): only if we import OBDb signal data; kept separate, never mixed.
3. **Ledger:** one `SOURCES.md` row per source: URL, licence, date checked, what taken (nothing / fact only / text). Rows for NHTSA TSB summary file, OBDex, OBDb, Toyota TIS (fact only), MotorData (read, nothing taken).
4. **Capture playbook for a hybrid owner:** read-only. Steps in order: identify the car (VIN decoded locally), read modes 03/07/0A, read freeze frame, read hybrid ECU (7E2 and 7E3 per the OBDb list, to be confirmed), record raw frames to JSONL, produce draft entries. No clearing, no actuator tests, no induced faults on the high-voltage system.
5. **Induced-fault whitelist for Toyota:** same whitelist as in the plan (interior lamp, number-plate lamp, door contact on a closed door, rear washer pump connector); Toyota-specific additions only after an owner reviews; never anything on the hybrid high-voltage system, SRS, brakes, steering or immobiliser.
6. **Display rule:** if no entry exists: raw code, system, "manufacturer-specific, we do not have a verified meaning yet", link to TIS and a "submit what your car did" form. Do not guess.

---

## 9. Decisions and asks for the owner

| # | Ask | Recommendation | Why |
|---|---|---|---|
| T1 | Approve the schema change (sub-code, applicability, source class) | Yes | Required for Toyota hybrid entries |
| T2 | Is a Toyota hybrid (Prius or similar) available for one read-only capture session | Find one in week 1 | Without one, T-B stays `low` |
| T3 | Buy one short TIS subscription | Only when blocked on a single fact; expected 2-day tier; confirm price on the subscribe page | Price is not public; stale figures disagree |
| T4 | Ask MOTOR for a licence quote | No for the open pack | Data cannot be redistributed in a CC pack (inference) |
| T5 | Add Toyota questions to the counsel hour | Yes (section 5) | Cheap |
| T6 | Fix the GitHub token on this machine | Yes | The CLI token returns "bad credentials", which blocked a repository search |

---

## 10. Sources

Each row: ID, URL, what it was used for, date accessed 2026-11-20 unless noted, confidence in the page's claim.

| ID | URL | Used for | Conf. |
|---|---|---|---|
| S1 | https://github.com/foerbsnavi/OBDex | Generic DTC counts by family, formats, licences, sourcing method, no manufacturer codes | high |
| S2 | https://techinfo.toyota.com | TIS scope, login, tiers, NASTF, free emergency/dismantler/owner's manual content, recall lookup | high |
| S3 | https://techinfo.snapon.com/TIS/SubscriptionTypeDetails.htm | Standard, Professional Diagnostic, Security Professional, Keycode content; Supra ISTA note | high |
| S4 | https://en.wikipedia.org/wiki/On-board_diagnostics | DTC format and range control (P0 to P3, B/C/U) | high |
| S5 | https://github.com/OBDb | OBDb scope (parameters, scalings, DTCs), 897 repos, CC-BY-SA text | medium |
| S6 | https://github.com/OBDb/Toyota-Prius | Toyota-Prius repo: CC-BY-SA-4.0, files, no DTC mention | medium |
| S7 | https://en.wikipedia.org/wiki/OBD-II_PIDs | Services, service 21 for Toyota, hybrid reply IDs, restricted non-standard PIDs | high |
| S8 | https://github.com/peyo/dtc-and-vin-data | Toyota/Honda/GM P-code repo; no licence seen | low |
| S9 | https://static.nhtsa.gov/odi/tsbs/2023/MC-10241404-9999.pdf | Example NHTSA-hosted Toyota bulletin (flash reprogramming with security signature); proof that Toyota bulletins are on NHTSA | high |
| S10 | https://www.law.cornell.edu/cfr/text/40/86.1808-01 | Service information duties, website, subscriptions, manufacturer-specific emissions DTC publication | high |
| S11 | https://techinfo.toyota.com/techInfoPortal/appmanager/t3/ti%3F_pageLabel=ti_ts_lite&_nfpb=true | Techstream Lite page (via search result; price not read) | medium |
| S12 | https://fenderbender.com/running-a-shop/operations/article/33024355/toyota-expands-service-support-for-independent-repair-facilities | Older two-day and one-year Professional Diagnostic prices; date unreliable | low |
| S13 | https://obdadvisor.com/toyota-techstream/ | 2026 third-party review pricing claims (search summary only) | low |
| S14 | https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-technical-service-bulletins-system-tsbs-downloa | NHTSA TSB summary file: public rights, no licence, summaries only, CSV zip | high |
| S15 | https://motordata.net/en_en/articles/dtc/toyota-trouble-codes-reference-how-to-decode-obd-ii-dtcs/ | Vendor claim: 60,000+ codes, several thousand Toyota-specific; flash codes; example P1 and C codes; licence agreement linked | medium |
| S16 | Web search (retail and forum guidance on scanner limits), e.g. https://www.turnermotorsport.com/p-2302733-thinkscan-660/ and https://www.canadiantire.ca/en/pdp/innova-3120rs-obd2-1-code-reader-scan-tool-with-abs-srs-0251009p.html | Basic scanners vs ABS/SRS-capable tools | medium |
| S17 | Existing repo doc `docs/research/deep/toyota-lexus-protocols-and-open-data.md` (S12, S51 to S53 inside) | Toyota 0x21/0x22 and address plan | high |
| S18 | https://thehybridgeek.happyfox.com/kb/article/13-hybrid-battery-system-trouble-codes-explained-what-they-mean-and-what-to-do and https://www.go-parts.com/garage/obd-p3000 and https://attachments.priuschat.com/attachment-files/2025/04/266344_p3011.pdf (snippets only) and https://static.nhtsa.gov/odi/tsbs/2015/MC-10132527-9999.pdf (not opened) | Hybrid parent/child structure, INF idea, block code series, tip T-TT-0303-14 | medium |
| S19 | https://au7o.io/known-issues/dtc/p1300/toyota | Existence of Toyota P13xx page (listing only) | low |
| S20 | https://attachments.priuschat.com/attachment-files/2022/05/221928_2010_prius.pdf (listing only) | Example ECU names in an unofficial printout | low |
| S21 | https://static.nhtsa.gov/odi/tsbs/2023/MC-10247829-9999.pdf (listing only) | Configuration software bulletin ECU categories (snippet) | low |
| S22 | https://www.toyota-tech.eu/e-services.aspx and https://www.legislation.gov.uk/eudn/2007/831/data.html (search results; portal redirected to login) | European independent operator registration and Commission decision | low |
| S23 | https://www3.epa.gov/otaq/datafiles/IACD-2026-08.pdf (snippet only) | EPA letter: no obligation to share proprietary design or software | low |
| S24 | https://www.toyota.com/owners/resources/owners-manuals | Owner manual page: HTTP 403, not read | n/a |
| S25 | https://www.law.cornell.edu/cfr/text/40/86.010-18 | OBD regulation; paragraph (k) not reached | high that unread |
| S26 | https://github.com/todrobbins/dtcdb | Generic CSV, MIT | medium |
| S27 | https://thefinalmilkman.github.io/zero/codewise/codes/ | Small decoder, 252 codes | low |
| S28 | https://www.motor.com/products-services/data-products/diagnostic-trouble-codes/ | Commercial licensed DTC data product, API/bulk, sales-led | medium |
| S29 | https://obdeleven.com/toyota-fault-codes-list | HTTP 403, not read | n/a |
| S30 | https://www.iatn.net/techmail/summaries/2025/05/index-dtc.html | Monthly DTC index of posts (listing only) | low |
| S31 | https://www.clublexus.com/forums/attachments/sc430-2nd-gen-2001-2010/345795d1414710990-need-help-codes-p0101-p0102-on-03-sc430-dtc-toyota-lexus-trouble-codes.pdf | Example of forum-hosted Toyota code PDF; avoided | low |

---

## 11. Gaps (what I could not verify)

Status: **PARTIAL.**

1. **No full-text read of Toyota's TIS Terms of Use**, Payments page, or any TIS content. Whether Standard tier includes DTC diagnostic procedures is unverified. Current prices unverified; only stale or third-party figures exist.
2. **Toyota Europe and other regions** (toyota-tech.eu redirected to login; Lexus pages and OBDeleven blocked with HTTP 403). Non-US coverage and prices unknown.
3. **No complete count** of Toyota/Lexus P1xxx, B1xxx, C1xxx, U1xxx codes from any source; the only figure is a vendor's "several thousand".
4. **GitHub repository searches were not run** (API: bad credentials; unauthenticated rate limit). Other open Toyota DTC repos may exist. Re-run: `gh search repos "toyota dtc"`, "toyota trouble codes", "lexus dtc", "techstream" once the token is fixed. Also check the OBDb org for any Toyota repo containing a fault-code (DTC) file; I only saw README-level scope text and the Prius repo page.
5. **Hybrid structure not confirmed from a Toyota document.** Only secondary descriptions of Toyota's tip. The parent/INF format, the exact end of the block-code series, whether each P3xxx is Toyota-defined or jointly defined, and the HV battery ECU request form are unverified.
6. **NHTSA bulletins:** I opened one PDF only (flash reprogramming). I did not open any hybrid battery or DTC bulletin, and I did not download the TSB summary ZIP to count Toyota/Lexus rows or check which components and DTC identifiers appear. Licence of bulletin text unverified.
7. **Owner's manuals**: whether they carry any DTC or warning-light tables was not checked (HTTP 403 on Toyota and Lexus pages).
8. **Adapter capability claims** for UDS 0x19 and B/C/U reading on Toyota ECUs are background knowledge and retail guidance; no Toyota primary source. Whether Toyota 2022+ cars expose these on DLC3 is unknown.
9. **Lexus**: no Lexus-specific public code list or dataset found; Lexus coverage assumed to follow Toyota platform sharing, unproven.
10. **Commercial licences**: MotorData's license agreement and MOTOR pricing not read. Any claim about their terms is unverified.
11. **Legal**: counsel questions in section 5 remain open; nothing here is legal advice.
12. **Effort numbers** in section 6 are estimates from the existing plan's per-entry assumptions, not measured.
13. The research tool was a summarising fetcher plus a US-only search; pages may have been truncated or mis-summarised. Reconfirm any quoted count before it goes in a public doc.

---

## 12. Next actions (ordered)

1. Fix the GitHub token, rerun the repository searches (Gap 4). 30 minutes.
2. Download the NHTSA TSB summary ZIP and mine Toyota/Lexus rows for component and DTC identifiers; store only bulletin IDs, model years, component names. 0.5 to 1 day.
3. Get the schema change request approved (T1).
4. Line up one hybrid for the read-only capture (T2).
5. Draft the 20-entry hybrid battery block family from the capture, own words, two reviewers.
6. Only if still blocked on one fact: one short TIS subscription, notes as facts and questions only (T3).
