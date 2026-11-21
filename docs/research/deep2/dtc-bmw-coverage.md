# BMW fault-code (DTC) coverage: formats, counts, legitimate sources, induced-fault reach

Research run: 2026-11-20. Status: **PARTIAL** (see Gaps). Not legal advice. Builds on `docs/research/deep/bmw-modules-dtcs-and-addressing.md` (S-numbers there are not reused here), `docs/plan/data-strategy.md` sections 3 to 8, `docs/design/data-schema.md` section 4.3, and `docs/plan/decisions.md`.

Confidence tags: **high** = confirmed on a primary page or repository fetched in this run; **medium** = confirmed on a secondary page or a search snippet; **low** = inference, a single weak source, or an estimate. Every number labelled "estimate" is mine, not a source's. No fault text from any source is reproduced here; only codes, module abbreviations, counts, formats and licences.

---

## 1. Executive summary

- **There is no public total for how many BMW fault codes exist.** A search for an ISTA total found none (medium). Any figure quoted for "all BMW codes" would be a guess. This note therefore measures coverage against defined, checkable denominators (section 8), not against an unknowable "all codes".
- **BMW codes come in at least four shapes**: five-character SAE codes (P0xxx and so on), four-hex-digit codes on older engine computers, six-hex-digit codes (3-byte UDS style, written 0xNNNNNN) on newer modules, and decimal codes on older computers (section 2). The hex number is BMW's own consecutive numbering, not a formula of the SAE code (medium).
- **The first byte is not a reliable module key.** Observed in public bulletins: 0x48xxxx appears on both the stability control module (DSC) and the power steering module (EPS); diagnostic-status timeout faults on the DSC sit at 0xD35Fxx (three codes in one 2018 bulletin, high, section 2.3); an earlier gateway-range claim (0x801Cxx) could not be re-confirmed and is dropped (low). Do not build a prefix-to-module table. Key every code by (module identity, code bytes), as `data-schema.md` already implies.
- **The open sources for BMW manufacturer-specific text are thin.** The only clean, public, per-code explanations are (a) BMW service bulletins that regulators host (NHTSA), which cover a few hundred codes at most and pair each code with a module abbreviation, a cause and a remedy, (b) forum threads, and (c) our own induced-fault captures. The OBDb project (the share-alike source the owner approved) has 49 BMW-named repositories but the one I opened contains signal definitions, not fault codes (section 5.4, high). So the share-alike pack does **not** solve BMW manufacturer-specific codes.
- **Generic SAE codes are already solved** by OBDex (CC0, 9,533 codes, high) and our own rewrite. That covers the P0/P2/P3/U0 layer that BMW modules emit, but OBDex states manufacturer-specific codes stay out of scope (high).
- **Realistic 12-week coverage (estimates, low confidence):**
  - Generic codes BMW engine modules can report: 90 to 100 percent of the standard list (it is the same data every make uses).
  - BMW manufacturer-specific codes: **well under 1 percent of the real universe** in 12 weeks, perhaps 100 to 250 entries from a mix of bulletins and induced faults. The number that matters is not the share of all codes but the share of codes a real owner meets: see section 8.3 for a "what owners actually see" denominator and an estimated 30 to 60 percent hit rate for the top-100 common faults on two chassis families after about 40 to 60 hours of work. Treat every one of these figures as a planning guess.
- **Induced-fault testing reaches a narrow slice**: lamps, washer pump, door contacts, wiper/rain-light-sensor connectors, parking sensors, comfort-module "no communication" faults (unplug a comfort module with ignition off), and audio/telephone antenna faults. It cannot reach engine internals, brakes, steering, airbags, battery management, or emissions monitors, and it must not try (deny classes R9 to R16 in `data-strategy.md`).
- **Recommendation**: build the DTC pack around a stable record shape (module, code bytes, status, optional own-words text, evidence list) and fill it in three tiers: generic rewrite first, then bulletin-derived facts rewritten in our own words with the bulletin ID as evidence, then induced-fault captures. Publish "unknown code, here is what the module reported" as a first-class state so the tool is useful at 0 percent text coverage.

---

## 2. Code formats

### 2.1 What the bus actually carries (high)

- The diagnostic read service (UDS service 0x19) returns, per stored fault, a **3-byte DTC plus 1 status byte**. The 24 bits are conventionally printed as six hex digits (`uds.readthedocs.io`, secondary but consistent with ISO 14229 summaries already cited in the earlier BMW note). The status byte has 8 flag bits: test failed, failed this cycle, pending, confirmed, not completed since clear, failed since clear, not completed this cycle, warning light requested (high, same page).
- For SAE-style codes the top two bits of the first byte pick the letter (00 = P, 01 = C, 10 = B, 11 = U), the next two bits the first digit, and the remaining bits and bytes the rest. The third byte is the "failure type" (symptom) byte in the ISO 15031-6 / SAE J2012-DA scheme (medium; the readthedocs page does not use the term "failure type", the ISO/SAE catalogue pages do).
- The car sends **numbers and status, never words**. Text is stored in the workshop tool's database (`data-strategy.md` section 1, repeated here because it is the root of the whole coverage problem).
- Additional per-fault data is available: snapshot (freeze-frame) records and extended data records via UDS 0x19 sub-functions (high, earlier BMW note). The *layout* of these records is manufacturer-specific and needs captures.

### 2.2 BMW shapes observed in public material

| Shape | Seen as | Era / module family (observed) | Confidence | Source |
|---|---|---|---|---|
| 6 hex digits, written 0xNNNNNN | 0x48082F (DSC, A13), 0x4823E1 (EPS, A2), 0x48078B (DSC) and 0x482394 (EPS) (A3), 0x4822A6 (EPS, A3b), 0xD35F3B / 0xD35F3F / 0xD35F42 (DSC timeout entries, A4) | Networked modules: DSC, EPS (ICM, ACSM and LMV named as silent partners in A4) | high (each re-read on the page or PDF in the fact-check pass); an earlier 0x801C90 gateway example was not found in any source I could re-open and is dropped | A2, A3, A3b, A4, A13 |
| 4 hex digits, written 0xNNNN | 0x6059, 0x4D16, 0x2A15, 0x6EC4 (and 33 more in one bulletin) | A 2016 bulletin (SI B07 03 14, Nov 2016 version) covering E60 to F36 chassis lists 37 distinct values of this width (49 occurrences) | high (recounted from the PDF text in the fact-check pass) | A5 |
| 4 hex digits, older engine tables | "ME 9" table | Hex starts at DDE4 and ME9 generation; earlier modules are decimal | medium | A6 |
| 8 hex digits, written 0xAABBCCDD | 0x01030001 style, listed in community code sheets | DME M1.x / M1.7 era; last byte appears to match a decimal number (inference by the search agent, not documented) | low | A7 |
| Decimal numbers | Older DME/DDE tables up to DDE3 and the early Motronic/MS lines | E36/E34/E39-era | medium | A6 |
| SAE five-character (P/B/C/U) | P0xxx, P1xxx, P2xxx, U0xxx | Any engine/gearbox module since OBD-II/EOBD; manufacturer pairs a BMW hex code with the P-code per ECU | medium | A8 |
| "S" plus four digits, "S 0219" form | Network "no communication with module" style | BMW North America bulletin per the earlier BMW note; single source | low | earlier BMW note |

### 2.3 What the first bytes tell you (and do not)

- **Observed distribution in the one bulletin I could read in full** (A5, 37 distinct 4-digit codes, 49 occurrences): first byte 0x29 appears 17 times, 0x2A 7, 0x60 6, 0x5E 3, then 0x28, 0x2C, 0x5F and 0x6E twice each and a tail of values seen once (for example 0x9D and 0xA6; recounted in the fact-check pass) (high that I counted correctly; the bulletin spans many modules so this shows spread, not a module map). The list for that bulletin is one subject (diagnosing stored faults to avoid repeat visits) across about 28 chassis codes, so it is a sample of what a *shop* sees, not a census.
- **0x48 spans modules.** 0x48078B and 0x48082F are DSC; 0x4823E1 and 0x482394 are EPS (high for 0x48078B and 0x482394 from A3, medium for the others from trade-press pages). So the byte after 0x48 may group by function family, not by module. No source explains the scheme (the earlier note reached the same conclusion; still true after this run).
- **Timeouts and "no communication" faults** appear in their own range: three DSC entries at 0xD35F3B, 0xD35F3F and 0xD35F42 are labelled as diagnostic-status message timeouts for the ICM or ACSM, LMV and EPS respectively (high, A4; an earlier draft wrongly cited A9 and a 0xD0xxxx range). These are the most numerous class by construction: roughly one per (reporting module, silent module) pair. This matters for coverage: see section 6.3.
- **Inference (low):** high-byte ranges may encode the originating software component rather than the hardware module, which would explain why the same prefix shows on two modules. Testable by a data census; not tested here.
- **Design consequence:** store `format` (`sae_5char`, `uds_3byte`, `bmw_4hex`, `bmw_8hex`, `bmw_decimal`), the raw bytes, the reporting module identity (name, address, hardware/software), and the status byte. This matches the schema's `format` and `fault_type_byte` fields in `data-schema.md` 4.3, which need two more format values.

### 2.4 Engine computers (DME, DDE): P-codes and BMW hex side by side

- Engine and diesel computers report both an SAE-style P-code (generic, as OBD requires) and a BMW internal code in hex (medium, A8). Per-ECU lookup tables pair them; no formula exists (medium, same source). A DDE5 listing pairing the two for E46 M47TU/M57TU engines is cited in A8 (the pairing is in a Scribd-hosted file, so treat as a lead, not a source).
- Generic OBD requests (service 0x03 on the OBD port) show only the P-codes. The BMW hex code appears only through the BMW diagnostic path (UDS 0x19 or the older KWP protocol). Implication: OpenDiag's engine-module coverage has two layers and users with a plain ELM327 on the OBD socket see only the first.
- Emissions-related P-codes are in the deny class R11 for *editing or hiding*, but reading and explaining them is allowed. Explaining is the whole point of the pack.

### 2.5 Module-specific ranges (what is known)

| Module family | Range hint | Evidence | Confidence |
|---|---|---|---|
| DSC (stability control) | 0x4807xx, 0x4808xx observed | A3, A4 | medium |
| EPS (power steering) | 0x4823xx observed | A2, A3 | medium |
| ZGM / central gateway | no example re-confirmed; earlier 0x801Cxx claim dropped | none | low |
| DSC timeout entries naming other modules | 0xD35F3B, 0xD35F3F, 0xD35F42 | A4 | high |
| Module naming in fault text | Module abbreviation attached to each code (DSC, EPS, ICM, ACSM, LMV seen); instance-number suffixes not re-confirmed | A2, A3, A4 | medium |
| Test plan references | `Bnn nn nn` pattern, 29 distinct references in one bulletin; three examples (B36 02 11, B16 01 07, B54 17 06) | A5 | high |

These are examples, not ranges. Do not generalise from them.

---

## 3. How many distinct codes exist per family

**Honest answer: no source gives a total for any BMW family.** What exists is partial.

| Family or scope | Count evidence | Confidence | Source |
|---|---|---|---|
| Generic SAE J2012 codes (all makes) | 9,533, with by-family counts P0 3,705, P2 3,495, P3 155 (OBDex meta.json, generated 2026-11-07) | high | A10 |
| Older BMW engine/diesel computers (DME M1.x to DME 9, DDE1 to DDE6) | Each module has its own table; the page says codes from DDE4 onwards are listed in hex and earlier ones in decimal (re-confirmed); table lengths of 100 to 250 entries and the relative length of the ME9 table were not re-confirmed (low); no total available | medium | A6 |
| One 2016 BMW bulletin, 28 chassis codes (E60 to F36) | 37 distinct 4-digit codes, 29 distinct test-plan references (39 occurrences; recounted in the fact-check pass) | high | A5 |
| BMW codes appearing in public bulletins overall | Unknown. OBDex lists 6,861 links in its NHTSA bulletin group across all makes (high) but no per-make split | high for the total, none for BMW | A10 |
| BMW-named OBDb repositories | 49 (GitHub search count for the query "BMW" within the OBDb organisation; first 21 names seen start with BMW) | high | A11 |
| ISTA total | No published figure found | medium (absence in search) | A12 |

### 3.1 Why the real number is large (reasoning, low confidence)

- **Module count**: the earlier BMW note describes dozens of modules per car (E, F, G series). Each reports its own faults. A typical modern ECU stores faults per input, output, plausibility check, supply voltage, network message timeout, and internal error. Network timeouts alone are one per partner module.
- **Variation by hardware and software level**: the same module type on different cars can carry different fault tables. Applicability matching (hardware, software, I-level) is therefore part of the data, not decoration.
- **No count is claimed**. For planning, treat "tens of thousands" per generation as a *hypothesis to test by census* (Gap 1), not as a fact.

### 3.2 Measuring the real number

A census method that stays clean: with the owner's own cars, read the **supported-fault list** (UDS 0x19 sub-function 0x0A, listed in the earlier note as "list all supported DTCs") for each module on each chassis. This returns code numbers only, no text, and no write. It gives us the denominator for that module and hardware level. Whether each module answers it is unknown until tested (low).

---

## 4. How fault text is structured in tools (structure only)

### 4.1 BMW's own tool (ISTA)

- A search found no official BMW document that defines the ISTA fault record layout (medium, absence). The BMW ISTA independent-operator manual exists but sits behind BMW's login; the fetch was redirected to an authentication page (high). I did not authenticate.
- From a Scribd-hosted analysis of one engine-control fault (low; text extraction from a PDF, field order uncertain), a record appears to carry: the code, a short title, a component and sub-component, debounce and "terminal conditions" (voltage, temperature, time), and possible causes such as wiring, sensor, control unit.
- BMW release notes reportedly mark newly added fault patterns with a "NEW" tag (low; search summary only, not re-confirmed, A12). Implication: the knowledge base grows each release, so any frozen copy would also go stale. This is a point in favour of a living, community-corrected pack.
- Some codes are reportedly flagged as not displayed in certain ISTA versions (low; source not re-confirmed). So even the vendor tool does not show everything.

### 4.2 BMW public bulletins (the legitimate structured source)

Seen on the Vehicle Service Pros article (A13) and in NHTSA PDFs (A5), structure only:

| Element | Present? | Note |
|---|---|---|
| Applicability: model, body, engine, years | yes | Gives chassis and sometimes engine code; good for applicability matching |
| Symptom as seen by the driver | yes | Warning lamp or message; useful for "what the driver notices" |
| Cause, stated in general terms | yes | Often software-related |
| Fault codes grouped into numbered scenarios | yes | One scenario to one code pattern |
| Module abbreviation attached to each code | yes | Abbreviation plus instance number |
| Remedy per scenario | yes | Reprogram, test plan, battery disconnect, "do not replace" |
| Test plan ID | yes | Pattern `Bnn nn nn` |
| Short note that a fault is spurious, clears itself | yes (some) | Valuable "ignore this" knowledge |

Reuse terms: the Vehicle Service Pros page shows "© 2026 All rights reserved" and no reuse terms (high). The NHTSA PDFs are hosted by a US government site but are authored by BMW. I found no licence statement on them (medium). **Treat the text as copyrighted; record only facts (code, module, applicability, cause category, remedy category, bulletin ID) and write our own sentence.** This is the same position `data-strategy.md` takes for owner manuals.

### 4.3 Third-party and enthusiast tools

- Mass-market scanners show generic P-codes and cannot interpret BMW hex codes without BMW software (earlier note, medium).
- INPA, EDIABAS, DIS and CARSOFT are named by a parts site as tools that return a number with "little or no explanation" for many modules (A6, medium). That is the user problem OpenDiag solves.
- OBDex stores, per generic code: title in two languages, causes with likelihood, symptoms, flags (MIL, emissions, drive cycle, limp mode), repair estimate, related codes, and sources, each reviewed individually in 195 packages of about 50 (high, A10). This is a good schema reference for our `plain`, `likely_causes` and `class` fields; schema ideas are not copyrightable but their text is, and OBDex's data is CC0 anyway.

### 4.4 A target record for OpenDiag (our own design, no source)

| Field | Purpose | Source of value |
|---|---|---|
| `module` identity | Which module reported it | Own scan |
| `bytes` and `format` | Exact code | Bus |
| `status` bits | Active, pending, confirmed | Bus |
| `text.plain` | One sentence in our words | Contributor |
| `effect` | What the driver notices | Contributor |
| `causes[]` | Likely causes with order | Contributor, bulletin facts |
| `class` | safety, emissions, comfort, network | Reviewer |
| `fix_hint` | Category only: software update, connector, part | Bulletin facts, own repair |
| `evidence[]` | bulletin ID, capture ID, forum link as lead | Ledger |
| `confidence` | high/medium/low per `data-strategy.md` 6.1 | Reviewer |

---

## 5. Public sources that describe BMW fault codes legitimately

Rating: **Use** = fact-extract and rewrite; **Lead** = may point to a test but is not evidence; **No** = avoid.

### 5.1 Regulator-hosted BMW service bulletins (Use, medium)

- NHTSA hosts manufacturer service bulletins as static PDFs under `static.nhtsa.gov/odi/tsbs/<year>/` (A5, A2, A3, A4, A9; high that the files exist and open). BMW bulletins in this set include fault codes in hex, module abbreviations and BMW test plan IDs. Each carries a source stamp pointing to BMW's own bulletin system.
- Dataset page for bulk download: the NHTSA "datasets and APIs" page returned HTTP 403 to my fetch (high). I could not confirm a bulk TSB file or API (gap). A third-party site, carcomplaints.com, lists bulletins per model and year with NHTSA IDs (medium, A14); it is a convenient index but not a licensed dataset.
- PDF text is compressed in some files; my fetch tool could not decode them, but a local text extractor read one (high). So a *local* reader can pull the facts without copying text into a repo.
- Coverage: the bulletins describe codes that cause customer complaints, so they skew to known software bugs. They are a good seed for "common real-world faults" and a poor source for the full catalogue.
- Legal posture: facts only; same tainted-reader logic does not apply because the bulletins are public, but `R3` (no copied or closely paraphrased text) does. Counsel question 2 in `data-strategy.md` D5 should include "facts extracted from public bulletins".

### 5.2 Trade-press digests of bulletins (Lead, medium)

- Vehicle Service Pros (Mitchell 1 TSB column) publishes summaries with codes and remedy structure (A13, A15). Copyright footer, no reuse terms. Use the same way: read, extract facts, write our own.

### 5.3 BMW Technical Training documents on archive.org (No for now, low)

- Search surfaced a collection named "BMWTechnicalTrainingDocuments" on archive.org, including an OBD II fault code list with decimal and hex columns for M52/M62/M73-class engines, and a document on ISTA (A16, A17). I did not open these. They look like BMW-authored training material uploaded by third parties; the licence and the legitimacy of the upload are unknown. **Do not use as a source** until counsel says so. They may still help us *know what to test* if a reader is declared tainted for that family.
- Same for Scribd, SlideShare and similar uploads of BMW code sheets (A7, A18): community compilations of unclear origin, often copies of OEM tables. Rule R2 and R3 apply; treat as No.

### 5.4 OBDb (share-alike, owner-approved) (Use for signals; not for BMW DTC text, high)

- Organization OBDb on GitHub: description "Community documentation for on-board diagnostics (OBD) parameters, scalings, and diagnostic trouble codes (DTCs)"; 897 public repositories (GitHub API, high).
- Licence of the BMW-5-Series repository: CC-BY-SA-4.0 (GitHub API licence field, high). 663 commits; structure `signalsets/v3/default.json`, `tests/test_cases/`, `generations.yaml`, generated from a template (high).
- Contents of `default.json` in BMW-5-Series: 120 command entries and roughly 269 to 270 signals (two counts differed by one), as a fetch and count by me (high). Signal entries use header, request/response address, a request command, bit index, length, unit, name and a suggested metric. A text search for "dtc" in that file returned 0 hits (high). Equivalent files in four other BMW repositories exist at sizes 99,267 bytes (BMW), 72,136 (BMW-3-Series), 28,908 (BMW-X5) and 36,645 (BMW-i3) (high for size, not inspected for DTCs).
- 49 repositories returned by a GitHub search for "BMW" in the OBDb organisation (high); the names I saw start with BMW. I did not open all.
- **Conclusion**: for BMW, OBDb is a live-data (signal) source. It did not yield fault-code text in the one repository I opened. Whether other OBDb repositories (for example generic or MINI) carry DTC files was not verified (gap 3). Because of the owner decision to allow share-alike, that check is cheap and should be done before relying on "OBDb for DTCs".
- The OBDb site obdb.community redirects to `pelican.clutch.engineering/cars` (high, 301). I did not follow it.

### 5.5 OBDex (generic layer only, high)

- Data CC0-1.0, code MIT, 9,533 SAE codes, 30,875 source links to 244 sites, 6,861 links in a group labelled manufacturer service bulletins (NHTSA archive), 11,336 links in a group labelled manufacturer OBD and service documents (the page says "manufacturer", not "OEM"; the listed groups do not sum to the total), English and German; maintainer states manufacturer-specific P1xxx and B1xxx codes "stay with their makers" (A10). Last data generation 2026-11-07.
- 276 chassis and body codes appear in no public J2012 title list the maintainer could check, and 770 codes rest on regulation, patents and reference works alone (high, A10). So even the generic layer has known weak spots; we inherit them if we cross-check only against OBDex.
- Use: baseline "does this code exist" and structure reference. We still rewrite text (data-strategy section 3 row 2).

### 5.6 Forum threads with user-written explanations (Lead, low)

- Forums such as Bimmerfest, Bimmerpost, F30Post, Spoolstreet carry long threads where owners post a hex code and what fixed it. One thread titled "N55 codes list" came up in a search (A19, not opened). I did not open any forum thread this run because of the copy risk and because the answer is rated "lead".
- Value: they show which codes owners hit most, which is the right priority ordering. Do not paste text or tables (`data-strategy.md` 4.5, rule R3). Count and tag a thread as evidence only if it contains *a capture* (code bytes plus module plus version).
- Quality: user-written explanations are often wrong or incomplete. Weight: `low` until a second source confirms.

### 5.7 Owner manuals and public press material (Use, high for what they cover)

- BMW owner manuals describe **Check Control messages and warning lamps**, not hex codes. They map "what the driver sees" to a general instruction (stop, service, safe to continue). That gives the `effect` and a safety hint per symptom, not the code. Not fetched this run (gap 5).
- Value: lets us connect a code to "what the driver sees" through our own capture (fault appears, message shows). Read and rewrite only.

### 5.8 Other open repair wikis (No known BMW fault-code wiki found, medium)

- Searches did not surface an open-licensed BMW fault-code wiki. Wikipedia's OBD page covers the SAE format (medium, earlier note, CC BY-SA text). Do not copy text into CC-BY packs.
- A German/French site exists with per-make code listings (revue-technique-auto.fr BMW page appeared in results, A20). Not opened; unknown licence; treat as Lead.

### 5.9 Paid or login-gated sources (cannot rely on; tainted-reader rules apply)

- BMW ISTA user manual: behind BMW login (high).
- Technical information portals: pricing not found for BMW (earlier note and `data-strategy.md` 4.7).
- EU repair-information rights give independent operators access for a fee, not republication rights (`data-strategy.md` 4.6). Nothing found in this run changes that.

---

## 6. What induced-fault testing can reach

### 6.1 Principle

An induced fault is a controlled, reversible disconnection or condition on a **non-safety** circuit with the ignition off. The module stores a fault; we read the bytes with a read-only tool; the owner writes what happened in their own words; we then clear the fault. Procedure and whitelist: `data-strategy.md` 4.4 and 4.4a.

### 6.2 Reachable (estimate of feasibility, low confidence)

| Circuit | Reachable by | Likely yield (estimate) | Safety class |
|---|---|---|---|
| Rear washer pump, interior lamps, plate lamp, courtesy lights | Unplug connector, ignition off | 1 to 3 codes each | T1 comfort |
| Door contact, trunk lid contact, hood contact (closed vehicle) | Unplug switch | 1 to 2 codes each | T1 |
| Window lifter motors, mirror motors, seat adjusters | Unplug connector | 1 to 3 codes each; motors with pinch protection are borderline, skip | T1 to T2 |
| Parking sensors (PDC) | Unplug one sensor | 1 to 2 codes each | T1 |
| Rain/light sensor, humidity sensor | Unplug | 1 to 2 codes each | T1 |
| Antennas (radio, phone), microphone, USB, speakers in head unit | Unplug | 1 to 3 codes each | T1 |
| Comfort module "no communication" | Unplug a module with ignition off and wait for partners to report | Produces *timeout* codes in **other** modules, one per reporting module | T1 if the module is comfort; never gateway or safety |
| Ambient lights, seat heating, steering wheel heating | Unplug | 1 to 2 each | T1 |
| Battery voltage low or high faults | Not safe on a real car | n/a | exclude |
| Engine sensors (coolant temperature, intake pressure etc.) | Unplug with engine off | Real but engine electronics: emissions class, reads allowed, induced fault borderline on a car that must stay legal and drivable | exclude by default |

### 6.3 Why timeout codes matter for coverage

A "module A silent" code is stored by every module that listens for A. If the car has N listening modules, one unplug produces up to N codes from one action. That is the highest yield per minute. But these codes carry the same meaning and mainly differ by reporter, so they inflate count without adding insight. Report them in a separate bucket ("network timeout, partner X") so the metric is not flattered.

### 6.4 Not reachable (and not to be attempted)

- Anything in R9 to R16 (airbag, immobiliser, emissions defeat, odometer, speed limiter, seed-key, flash, brake/steering). Fault codes in these areas may still be read and explained from public bulletins, but not induced.
- Internal faults (memory, processor, supply regulator): cannot be induced without damage.
- Plausibility faults (sensor reads a value that disagrees with another sensor): need hardware simulators.
- Faults needing road conditions (misfires, knock, boost, traction events).
- Faults specific to hardware the owner does not have (diesel only, PHEV only).

### 6.5 Estimated reach (low confidence, estimate)

| Module type | Share of its stored-fault list that is inducible | Basis |
|---|---|---|
| Comfort/body modules (lighting, doors, windows, mirrors, seats) | 30 to 50 percent | Mostly input/output circuit faults |
| Infotainment/head unit | 20 to 40 percent | Many faults are software or media |
| Parking assist | 40 to 60 percent | One fault per sensor/wire |
| Engine and gearbox electronics | 3 to 10 percent | Most are monitors, plausibility, emissions |
| Chassis (DSC, EPS, ICM) | 0 to 5 percent | Safety class, exclude |
| Gateway | 5 to 15 percent | Mostly network-related and internal |

These are my guesses from how fault tables look in general, not from a BMW table. Replace with measured numbers once the supported-fault census (3.2) runs.

---

## 7. Share-alike pack: what it can and cannot add

- Owner decision (decisions.md #1): OBDb-derived data goes in a separate CC-BY-SA pack. Our own packs stay CC0 or CC-BY.
- For BMW the OBDb data fetched is signal data; no DTC records found (section 5.4). So the SA pack adds live-data coverage, not fault-text coverage, for BMW.
- A SA pack is still a good home for **anything we ingest that carries SA licence**, such as text adapted from a CC BY-SA wiki, with the SA obligation (same licence, attribution) tracked by the ledger. The existing rule R7 already isolates this.
- Risk: mixing SA content into a CC-BY pack contaminates it. The linter must check each entry's source licence, not only the pack licence. This is already in `data-strategy.md` 6.2 but not yet built.

---

## 8. Achievable coverage and effort (estimates)

### 8.1 Denominators

Because "all BMW codes" is unknown, report coverage against these measurable sets:

| Set | Definition | How to build | Known size |
|---|---|---|---|
| G | Generic SAE codes that BMW engine/gearbox modules can report | OBDex plus own filter | 9,533 total generic; BMW subset unknown |
| S | Codes in the supported-fault list of each module on the owner's cars | UDS 0x19 0x0A census | unknown until run |
| B | Codes appearing in public BMW bulletins for target chassis | Read NHTSA bulletins locally | unknown; one bulletin gave 37 |
| C | Codes actually *stored* on cars in the community (field data) | Opt-in uploads | zero today |
| T | "Top 100" codes owners most often see | Forum counting plus C | unknown |

Coverage figures below use B, S and T.

### 8.2 Plan: tiers, yield and effort

Effort per entry comes from `data-strategy.md` 7.4 (rewrite 6 minutes plus review 2 minutes; induced fault 30 minutes). Other times are my estimates.

| Tier | Work | Yield per hour (estimate) | Hours for 100 entries | Evidence class | Confidence of entry |
|---|---|---|---|---|---|
| 1 Generic rewrite | Rewrite generic P-codes BMW reports | about 7 entries (8 min each) | about 14 | public standard | medium |
| 2 Bulletin facts | Read bulletin, extract code, module, cause, remedy; write own words | about 4 to 6 (10 to 15 min) | about 17 to 25 | public bulletin | medium (needs second source for high) |
| 3 Induced fault | Unplug, read, annotate, reconnect, clear, write | about 2 (30 min) | about 50 | owner capture | high with round trip |
| 4 Community report | Review a submission with capture | about 4 (15 min) | about 25 | community | low to medium |
| 5 Supported-fault census | Run once per module | about 1 module per 5 to 10 min plus setup (estimate) | not per entry | owner capture | n/a, gives denominator |

### 8.3 Estimated coverage after 12 weeks (low confidence, estimates; owner solo plus Claude)

| Scope | Estimate | Reasoning |
|---|---|---|
| Generic codes BMW reports on engine/gearbox (set G) | 90 to 100 percent of the BMW-relevant subset | Same task as the existing 120-code plan; OBDex cross-check |
| Codes in public bulletins for the two target chassis (set B) | 50 to 80 percent if all relevant NHTSA bulletins are read | Reading cost is low; unknown size, so cap at about 60 bulletins in 12 weeks (estimate) |
| Network timeout codes on the two cars (part of S) | 70 to 100 percent of those present, bucketed by silent module | One unplug yields many; limited by the whitelist |
| Comfort-module fault codes on the two cars | 20 to 40 percent of the supported list | Section 6.5 range times effort cap |
| Engine, gearbox, chassis modules (manufacturer-specific) | 0 to 5 percent | Mostly out of reach; only bulletin-derived |
| Top-100 owner-seen codes (set T) | 30 to 60 percent | Bulletins skew to common faults; ordering from forum counts |
| **All BMW codes (unknown denominator)** | **below 1 percent** | Unknowable total; stating it avoids false precision |

Plan consistency with the existing target: `data-strategy.md` 7.1 sets 50 manufacturer-specific entries (25 per family) from induced faults and experience. My estimate for what is reachable is **100 to 250**: roughly 50 induced, 30 to 100 from bulletins, 20 to 100 timeout-bucket entries. This is more than the plan only if bulletin reading proceeds; it would not raise the share of all codes meaningfully.

### 8.4 Effort for 200 manufacturer-specific entries (estimate)

| Source | Entries | Hours |
|---|---|---|
| Bulletins | 100 | 17 to 25 |
| Induced fault | 50 | about 25 (with setup) |
| Timeout bucket | 30 | about 5 |
| Community review | 20 | about 5 |
| Review time (two reviewers, 2 minutes each, per entry) | 200 | about 13 |
| **Total** | **200** | **about 65 to 75** |

That fits inside the 90 hours total of `data-strategy.md` 7.4 only if generic rewriting stays at 150 entries; there is little slack. If hours must drop, cut the induced-fault tier first (slowest per entry), keep bulletins.

### 8.5 Things that would move the numbers

- A bulk, licensed NHTSA bulletin dataset (unverified; the data page was blocked). Would cut tier 2 effort.
- Ten contributors with cars on different chassis (the plan's own contributor funnel). Roughly linear gain for tier 3.
- Supported-fault census results. Would replace every estimate in 6.5.
- Counsel advice that extracting bulletin facts is fine. Without it, tier 2 stops.

---

## 9. Recommended workflow (clean-room)

1. **Run the supported-fault census** on every module of the owner's car(s) read-only, store code bytes only. Gives S.
2. **Read bulletins locally** (not committed): download is a user action, so ask first; use a local text extractor; log facts into a scratch table; delete the file after extraction or keep outside the repo. Record bulletin ID and date in the ledger.
3. **Rewrite**: each entry gets a short plain sentence in our own words, produced by a person who did not copy; run the similarity checker (data-strategy section 5) against the bulletin text kept locally.
4. **Induced faults** from the whitelist; round trip (induce, read, restore, clear, read again).
5. **Mark unknown honestly**: a code with no entry shows module, bytes, status and "no description yet, submit one". This is also the community funnel.
6. **Keep the tainted-reader log** for anyone who read ISTA, TIS or the archive.org training files.
7. **Cap**: if after 4 weeks fewer than 50 bulletin-derived entries exist, change the plan toward capturing from cars.

---

## 10. Risks and open legal points

| Risk | Note | Mitigation |
|---|---|---|
| Bulletins copyrighted | No licence found; reuse unclear (medium) | Extract facts only; counsel question |
| Database-right on compiled lists (EU) | Not researched | Ask counsel; build from primary captures |
| Wrong explanation harms user | Plain text claims wrong cause | Confidence tags, "may indicate", safety class on every entry |
| Safety codes explained too confidently | Chassis codes are safety class | Default class `safety`; no repair advice; "see a workshop" |
| Forum-derived error propagation | Low-quality threads | Leads only |
| Format drift between ISTA versions | New patterns added each release (medium) | Version in evidence |

---

## 11. Sources

Confidence = how well the page supports the cited claim.

| ID | URL | What it supports | Confidence |
|---|---|---|---|
| A1 | https://www.tag-parts.com/tips-info/13115.html | Decimal versus hex by ECU generation (hex from DDE4 onwards); module list | medium |
| A2 | https://www.vehicleservicepros.com/tsbs/article/53092697/bmw-power-steering-failures-2019-04-22 | Bulletin structure (codes by scenario, e.g. 0x4823E1 on the EPS); copyright footer (re-read) | high |
| A3 | https://static.nhtsa.gov/odi/tsbs/2017/MC-10146635-9999.pdf | 0x482394 on the EPS control unit and 0x48078B on the DSC control unit (text re-read) | high |
| A4 | https://static.nhtsa.gov/odi/tsbs/2018/MC-10142932-9999.pdf | DSC fault-memory entries 0xD35F3B, 0xD35F3F, 0xD35F42 labelled as diagnostic-status timeouts (text re-read) | high |
| A5 | https://static.nhtsa.gov/odi/tsbs/2016/MC-10146779-9999.pdf | One bulletin (SI B07 03 14, Nov 2016): 28 chassis codes, 37 distinct 4-digit hex codes (49 occurrences), 29 distinct test-plan references (39 occurrences); first-byte distribution; recounted from locally extracted text | high |
| A6 | https://www.tag-parts.com/tips-info/13115.html (same page as A1) | ECU family list DME M1.1 to DME 9; DDE4 onwards hex, earlier decimal (re-confirmed); table lengths not re-confirmed | medium |
| A7 | https://www.scribd.com/document/379202499/Bmw-Code-Sheet-1-1-pdf | Existence of community code sheets with 8-digit hex (search summary only; not opened; origin unknown) | low |
| A8 | https://www.scribd.com/document/580552899/BMW-ERROR-CODES and https://www.revue-technique-auto.fr/codes-defauts-obd/23-bmw/code-specifique-constructeur?p=2 | P-code and BMW hex pairing per ECU, no formula; search summaries only | low |
| A9 | https://static.nhtsa.gov/odi/tsbs/2016/MC-10151068-9999.pdf | Earlier (Feb 2016) version of the same SI B07 03 14 bulletin as A5: 37 distinct 4-digit codes, 28 distinct test-plan references. It does NOT contain ICM timeout codes (earlier draft wrong) | high |
| A3b | https://static.nhtsa.gov/odi/tsbs/2017/MC-10142931-9999.pdf | EPS fault 0x4822A6 | high |
| A10 | https://github.com/foerbsnavi/OBDex and https://foerbsnavi.github.io/OBDex/meta.json | OBDex counts, licences (data CC0-1.0, code MIT), family counts, review process, source counts, scope statement; generated 2026-11-07 | high |
| A11 | https://api.github.com/search/repositories?q=org:OBDb+BMW | 49 BMW repositories in OBDb | high |
| A12 | Web searches for ISTA totals (no URL gives a total) | No published count found; the "NEW" tag in release notes is from a search summary only, not re-confirmed | low |
| A13 | https://www.vehicleservicepros.com/tsbs/article/55273859/mitchell-1-fixing-faulty-bmw-code | Fault 48082F stored in the DSC control unit; copyright footer (re-read) | high |
| A14 | https://www.carcomplaints.com/BMW/535/2016/tsbs/ | Third-party per-model bulletin list with NHTSA IDs | medium |
| A15 | https://www.vehicleservicepros.com | Trade-press bulletin digests exist | medium |
| A16 | https://archive.org/download/BMWTechnicalTrainingDocuments/ST055%20Engine%20Electronics%20%28Archive%201%29/11%20OBD%20II.pdf | Exists (search result); not opened; legitimacy unknown | low |
| A17 | https://archive.org/download/BMWTechnicalTrainingDocuments/ST050%20Technical%20Systems/05a_ISTA.pdf | Exists (search result); not opened | low |
| A18 | https://www.slideshare.net/simobouala/bmw-fault-code-list | Community-uploaded DME code list; not opened | low |
| A19 | https://www.spoolstreet.com/threads/n55-codes-list.580 | Example forum thread; not opened | low |
| A20 | https://www.revue-technique-auto.fr/codes-defauts-obd/23-bmw/code-specifique-constructeur?p=2 | Per-make listing site; not opened | low |
| A21 | https://github.com/OBDb and https://github.com/OBDb/BMW-5-Series | Org description, 897 repositories, licence CC-BY-SA-4.0, repo structure, 663 commits | high |
| A22 | https://raw.githubusercontent.com/OBDb/BMW-5-Series/main/signalsets/v3/default.json | 120 command entries, roughly 269 to 270 signals, zero "dtc" hits | high |
| A23 | https://uds.readthedocs.io/en/stable/pages/knowledge_base/dtc.html | 24-bit DTC layout, letter mapping, 8 status bits | medium |
| A24 | https://saemobilus.sae.org/standards/j2012_201612-diagnostic-trouble-code-definitions and https://www.iso.org/standard/66369.html | J2012 and ISO 15031-6 exist as paid standards; J2012-DA carries standard codes and failure types per search summary | medium |
| A25 | https://onl-osmc-b2i.bmwgroup.com/static/ista/ISTA_UserManual_Independent_Operators_de-DE.pdf | ISTA independent-operator manual exists; redirected to login; not read | high (that it is gated) |
| A26 | https://www.nhtsa.gov/nhtsa-datasets-and-apis | HTTP 403 to my fetch; not confirmed | high (that it was blocked) |
| A27 | https://hella.com/techworld/us/bi/pdf/bmw-series-all-models-driving-dynamics-control-failure-dsc/bmw_alle_modelle_fehlercode_480a66.pdf | Existence of a supplier one-page note for code 480A66; content not readable by my tool | low |

Internal docs read: `docs/plan/data-strategy.md`, `docs/design/data-schema.md`, `docs/plan/decisions.md`, `docs/research/deep/bmw-modules-dtcs-and-addressing.md`. I did not re-read the legal and standards deep notes beyond a keyword search; claims here do not rely on them.

---

## 12. Gaps

1. **No total code count for any BMW family.** Needs the supported-fault census (3.2) on real modules, or a BMW statement. Nothing in this run can supply it.
2. **No bulk bulletin census.** I examined one NHTSA bulletin fully and several by search summary. I did not download further PDFs because downloading needs the owner's permission; the NHTSA datasets page returned 403. A real count of BMW codes in public bulletins is outstanding; ask the owner whether to allow a bounded local download of about 60 bulletins.
3. **OBDb DTC content not verified** beyond one BMW repository and a text search for one string. Other OBDb repositories (generic, MINI, others) were not inspected, and I did not follow the community site redirect.
4. **ISTA fault record layout** is not primary-sourced; the manual is behind a login and I did not authenticate. The record layout in 4.1 rests on a low-confidence search summary.
5. **Owner manuals** (Check Control message lists) not fetched.
6. **Forum threads** not opened; the forum tier is rated from search results and policy only.
7. **archive.org BMW training documents**: existence only; no view of licence or legitimacy.
8. **Hella note on 480A66** and several NHTSA PDFs could not be decoded by the fetch tool; local extraction was done for one only.
9. **First-byte ranges per module** (2.3, 2.5): only a handful of examples; no scheme found; possible that high bytes encode software component. Needs a census.
10. **Coverage and effort numbers are estimates** built on the existing plan's per-entry times and my guesses about inducible share. No BMW fault table was available to measure the inducible share.
11. **Legal**: database-right and bulletin-fact extraction not researched; counsel only.
12. **Newest generations** (G-series, gateway with secure diagnostics) were not examined for how fault reading is restricted; see the existing note on newer cars and secure diagnostics.
13. **Search tool limits**: search returns summaries, not pages; several claims above are "per search summary" and tagged low or medium accordingly.

## 13. Fact-check log (2026-11-20)

Re-checked and confirmed: OBDex counts, licences (data CC0-1.0, code MIT), generation date and review figures; OBDb licence CC-BY-SA-4.0 on BMW-5-Series, 897 organisation repositories, 49 search hits, 663 commits, 120 commands, 269 signals, zero DTC hits, four file sizes; obdb.community 301 redirect; ISTA manual login redirect; UDS 24-bit layout and 8 status bits; A5 counts (37 distinct codes, 29 test plans). Corrected: A9 was mis-described (it is an earlier version of the A5 bulletin); the 0xD0xxxx range was replaced by 0xD35Fxx (A4); the 0x801Cxx gateway claim was dropped as unsupported; first-byte tally fixed; ECU table-length and ISTA "NEW" tag claims softened.
