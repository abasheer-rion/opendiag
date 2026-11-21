# DTC coverage strategy: how far can we get, from where, under which licence

Date: 2026-11-20. Status: **PARTIAL** (inherits the gaps of the five research notes; section 11). Not legal advice. Every number marked "est." is a planning guess, tagged low confidence, not a fact. Built from `docs/research/deep2/` notes: [open datasets](../research/deep2/dtc-open-generic-datasets.md), [BMW](../research/deep2/dtc-bmw-coverage.md), [Mercedes](../research/deep2/dtc-mercedes-coverage.md), [Toyota and Lexus](../research/deep2/dtc-toyota-lexus-coverage.md), [crowd model](../research/deep2/dtc-crowd-curation-model.md). It extends `data-strategy.md` and `decisions.md` (decision 1: share-alike allowed as a separate pack).

## 0. Plain-words summary for the owner

1. Generic fault codes (the ones every car shares, about 9,500) are a solved problem for *existence*. A free, public-domain-style list already exists. The work left is writing our own plain English.
2. Manufacturer codes (BMW, Mercedes, Toyota/Lexus own codes) are the hard part. We found no clean free list for any of them. The big lists on GitHub have unknown or suspect origin, so we do not use them.
3. So we build our own, slowly: from what cars tell us when we scan them, from public repair bulletins (facts only, our own words), and from owners telling us what fixed a code.
4. Honest numbers after 12 weeks (est.): every generic code gets a basic meaning, a few hundred get a polished one; BMW 100 to 250, Toyota/Lexus 60 to 100, Mercedes 30 to 100 manufacturer codes explained.
5. After a year (est.): generic 3,000 to 6,000 polished; BMW 600 to 1,500; Toyota/Lexus 200 to 500; Mercedes 250 to 700. Nobody can say what share of "all" that is, because no one publishes the total.
6. When we do not know a code, the app says so, shows the raw code and which module stored it, and asks the owner to help. It never guesses.
7. The share-alike data you approved helps with live readings, not with fault meanings. Do not expect it to fill the gap.
8. The main danger is accidentally copying paid or leaked text. Section 6 lists the checks that stop it.
9. This plan needs roughly 280 to 545 hours in the first 12 weeks. The current plan budgets about 45 hours for fault codes. Something has to give; section 8 says what to cut first.
10. Decisions needed from you are in section 12 (6 items, one counsel hour).

## 1. Honest answer: what coverage is reachable

### 1.1 How to count (so the numbers cannot flatter us)

Each code gets one level. Only the level counts, never raw submissions.

| Level | Meaning | Who may write it |
|---|---|---|
| L0 | Decoded: class, number, module, status shown | Software |
| L1 | Structural meaning from the code's anatomy (for example "fuel and air metering, circuit range"), our template | Software plus one check |
| L2 | Own plain-English sentence, one reviewer, source tag | Contributor |
| L3 | Verified: capture plus second source or second car, two reviewers | Reviewer |

Denominators (the only honest ones):
- **Generic:** 9,533 codes (OBDex, CC0 data; counts read from its own files) (high).
- **Manufacturer:** no published total for BMW, Mercedes or Toyota/Lexus (high that none was found). A vendor claims "several thousand" Toyota-specific within 60,000+ codes across makes (medium, vendor claim). So report against three measurable sets: codes seen in real sessions, codes in public bulletins, and the supported-fault list read from owner modules (the "census").

### 1.2 Target ranges (all est., low confidence unless stated)

| Scope | Week 12 | Week 26 | Week 52 | What decides the range |
|---|---|---|---|---|
| Decoder (formats) | 100% of known shapes | same | same | Needs 6-char Mercedes, 3-byte, BMW hex shapes (high that they exist) |
| Generic L1 (structural) | 100% of 9,533 | 100% | 100% | Template work, about 2 to 3 days |
| Generic L2 (own sentence) | 300 to 600 | 1,500 to 3,000 | 3,000 to 6,000 | Reviewer hours; ordered by how often owners see the code |
| BMW manufacturer entries (L2+) | 100 to 250 | 250 to 600 | 600 to 1,500 | Bulletins read, cars available, contributors |
| BMW share of "top 100 codes owners see" | 30 to 60% | 50 to 70% | 60 to 85% | Needs a forum and telemetry count; unmeasured |
| Mercedes manufacturer entries | 30 to 100 | 100 to 300 | 250 to 700 | Needs a Mercedes car or owner; no car tested so far |
| Toyota/Lexus manufacturer entries | 60 to 100 | 100 to 250 | 200 to 500 | Needs one hybrid capture; INF sub-code schema |
| Share of all manufacturer codes | unknown; Toyota under 3% of vendor claim at week 12 | unknown | unknown | No denominator exists |

Reasoning: BMW 100 to 250 and Toyota 60 to 100 come from the per-make notes (which used `data-strategy.md` 7.4 per-entry times). Mercedes 30 to 100 is lower because no car has been tested and bulletins give about one or two codes each. Later columns assume a growing contributor base (section 5); if no outside contributors appear, hold week 12 numbers and add about 10 to 15% per quarter (est.).

### 1.3 What the tool shows at 0% text coverage (first-class state)

Raw code, module name, status (active, pending, stored), safety class, generic structural line if it exists, "no description yet", and a "report what you found" button. A wrong meaning is worse than none.

### 1.4 What a generic adapter can reach (limits the real-world value)

- Any adapter: emissions codes, standard OBD-II only (high). Mercedes' own article says an OBD-II tool gets only regulation-required data (high).
- Other modules (ABS, airbag, body, hybrid battery): needs per-module requests; reach on BMW G-series, Mercedes 206/223, Toyota 2022+ is **untested** (low). Coverage claims are about our data, not about what each car lets us read.
- Mercedes and Toyota gate coding, flashing, keys. Out of scope (owner decision 2).

## 2. Source ladder

### 2.1 Rung A: ingest first (licence verified, fact-level)

| # | Source | What we take | Licence read from | Conf |
|---|---|---|---|---|
| A1 | CARB 13 CCR 1968.2 (public regulation) | Structure rules, J2012 incorporation. No code list | law.cornell.edu page | high |
| A2 | OBDex (foerbsnavi/OBDex) | Existence, family, flags, related-code links, audit target. Prose is rewritten, not shipped | `LICENSE-DATA` CC0, `LICENSE-CODE` MIT | high |
| A3 | Own bus captures (read-only), supported-fault census | Code exists on this module and software | ours | high |
| A4 | Own induced faults (whitelist only) | Code plus symptom, round-trip tested | ours | high |
| A5 | NHTSA-hosted OEM bulletins (BMW, Mercedes, Toyota) | Facts only: code, module, applicability, remedy class, bulletin id. Our sentence | OEM copyright, no reuse licence (medium) | medium |
| A6 | Owner repair reports with attestation | Own-words cause and fix | inbound terms | low to medium |
| A7 | Owner manuals and public press (warning-light behaviour) | What the driver sees, rewritten | OEM copyright | low (not fetched) |

### 2.2 Rung B: cross-check only (read to find mistakes, never copy)

Wal33D/dtc-database (MIT label, origin undocumented, downstream review flagged copied-looking Audi text); python-OBD codes (GPL-2.0); AndrOBD code files (GPL-3.0); dtcdb (MIT, 2013); jseobd (MIT, provenance unknown); w220.wiki and mercedesmedic.com lists (no licence); forum threads (counts and "which codes owners hit" only); MotorData pages (orientation, no extraction). Use: "does this code circulate", spot overlap in our own text. Open generic tables share ancestors (measured), so agreement between them proves little (medium).

### 2.3 Rung C: never used, never loaded into a drafting session

- Automotive-9 / GhostTypes `dtc-codes` (4,781 BMW rows, no licence, no source, called "proprietary" by its own description) (high).
- kierandrewett scraped dot.report data; OBD2HQ; hoffman1938/bimmercode; peyo and aalih34554 sets (no licence).
- archive.org "BMW Technical Training" files, Scribd and SlideShare code sheets, Haynes pages, forum-hosted OEM PDFs.
- Paid portals (BMW ISTA, Mercedes XENTRY/WIS, Toyota TIS/Techstream), MOTOR and similar licensed data. Anyone who has read them is a "tainted reader" for that make and does not author or review that make's entries (honesty declaration, counsel to rate its value).
- MechanicDB sample (ODbL, not compatible with our CC-BY-SA pack as far as found; low).

### 2.4 Gate before building on OBDex

OBDex is one month old, reviewed about 9,500 codes in 30 days, and its titles equal common J2012 titles (measured 98.8% against the Wal33D set). Spot-audit 50 random codes against their own source links (3 to 4 hours). Stop-rule: if more than 5 of 50 fail (est. threshold, owner may change), use OBDex for existence only.

## 3. Licence layout

| Pack | Licence | Holds | Never holds |
|---|---|---|---|
| `facts` | CC0 | Code, format, module identity, applicability, flags, relations, counts, evidence ids | Any sentence |
| `generic-text` | CC-BY 4.0 | Own L1 and L2 text for generic codes | Upstream prose |
| `bmw`, `mercedes`, `toyota-lexus` | CC-BY 4.0 | Own L2/L3 text, causes, fix hints, per-entry evidence | OEM text, forum text |
| `signals-sa` | CC-BY-SA 4.0 | OBDb-derived live-data signals | Nothing we want to keep CC-BY |
| Code | Apache-2.0 | Decoder, linter, app | Data |

Rules:
- CC-BY content may be included in an SA work; SA content may never enter a CC0 or CC-BY pack (CC FAQ, medium on the reverse direction). Enforce with a licence field per entry and a build check, not memory.
- **The SA pack does not help with fault text.** OBDb BMW, Mercedes and Toyota repos hold signals; zero DTC entries in the files opened (high for BMW 5 Series, Mercedes E/C/G Class; medium for the rest). Ship it for live data, if at all.
- Inbound terms: contributors dedicate facts CC0 and grant authored text under CC-BY with a project right to relicense to another free licence (OSM and iFixit pattern). OSM lost about 1% of data at its 2012 licence change (high). Counsel to review.
- Wikipedia text (CC BY-SA) is not a source for per-code meanings (no per-code table, measured) and would force SA. Not used.
- Open question: CC0 versus CC-BY for generic text (section 12, item 1).

## 4. Order of work (what to ingest, when)

1. Weeks 1 to 2: ledger rows, schema change, decoder vectors, OBDex audit, L1 templates.
2. Weeks 2 to 6: generic L2 for the codes owners see most; bulletin harvester (facts only); census and read-only captures on owner cars.
3. Weeks 4 to 12: manufacturer entries from captures and bulletins; induced faults on the whitelist; first outside reports through GitHub issue forms.
4. Weeks 13 to 26: in-app report flow, review dashboard, second chassis, a Mercedes and a hybrid capture if not done.
5. Weeks 27 to 52: trusted-submitter tier, quarterly audit, transparency count, re-test cohorts.
Schema needs before manufacturer entries: sub-code and parent-code fields for Toyota hybrid (INF), failure-type suffix for Mercedes 6-char codes, format values for BMW 4-hex, 6-hex, 8-hex and decimal, applicability (model, engine, years, software range), key on (module identity, code bytes) not on prefix (high: 0x48xxxx appears on two BMW modules).

## 5. In-app contribution and review flow

Phase A (weeks 1 to 12): GitHub issue forms and pull-request templates, one entry per submission, batch cap, schema and licence checks in CI. Phase B (after about 50 contributors, est.): in-app flow.

1. After a scan each stored fault shows "report what fixed it". The app prefills code, module, software ids, chassis label, rounded mileage band, adapter, app version. No VIN; a salted hash only for duplicate detection.
2. Contributor adds symptom, what they did, whether the code returned after clearing, own confidence, and a source label (own repair, mechanic told me, forum, manual, not sure). Forum, manual and mechanic sources start at `low` and need an independent confirmation.
3. Rights attestation: own words, nothing pasted from a manual, tool, forum or site. A local "large paste" flag is shown to the user before sending (privacy review needed).
4. States: `draft`, `flagged`, `candidate`, `published`, `quarantined`, `removed`. Author cannot review. Two reviewers for text; one plus automatic log validation for a pure fact ("code seen on module").
5. Reviewer checklist: source tag plausible, own words, similarity ok, code and module match the log, applicability right, no deny-class content (airbag, immobiliser, key learn, odometer, emissions defeat), no unsafe instruction, no personal data.
6. A single report never exceeds `low`. `medium` needs one log plus a matching repair report. `high` needs two independent cars with matching software, or a bus observation plus an induced-fault confirmation by different people. App ladder: high = verified, medium = community-reported, low = experimental (behind an expert switch).
7. Reputation changes review priority and bulk limits, never auto-publishes. No public count leaderboard.
8. Dashboard counts only `published` by level and confidence, per make and chassis, plus "seen but unexplained" (the to-do list). Telemetry for "seen codes" is opt-in, default off, code and module only.

## 6. Anti-copying controls (build in this order)

| # | Control | Cost (est.) | Notes |
|---|---|---|---|
| 1 | Source tag and `SOURCES.md` row on every entry and every dataset; no tag, no merge | 6 to 8 h | Includes rows for every dataset in section 2 |
| 2 | Contributor attestation and inbound terms | 4 h plus counsel | Relicensing clause |
| 3 | Tier A similarity gate: 5-word shingle overlap against OBDex, our own packs, public text; short strings exempt | 16 to 24 h | Machine flags, human decides |
| 4 | Local-only overlap hashes for Wal33D, AndrOBD, python-OBD, jseobd, dtcdb (not committed) | 4 to 6 h | Catches accidental overlap with cross-check sets |
| 5 | Per-entry licence field and build check blocking SA into CC packs | 4 to 6 h | Section 3 |
| 6 | Length guard (flag over 300 characters), paste flag, batch cap, code-order-transcription detector | 6 to 10 h | Audi case: 41 of 129 lines over 150 characters, none in BMW/Ford/VW files |
| 7 | Quarantine, redact-keep-history, revocation list in the pack stream, monitored takedown mailbox | 8 to 12 h | Wikipedia and OSM pattern |
| 8 | Tainted-reader declaration on profiles | 2 h | Honesty-based |
| 9 | Tier B hash fingerprints of commercial text | default OFF | Only if counsel says safe |
| 10 | Quarterly random 10% re-audit | 3 h per quarter | Already in `data-strategy.md` 6.1 |
Title rule: our public title may not equal the normalised J2012-style title in 3 or more sources. It will fire often at first; that is intended.

## 7. Per-make plan in brief

- **Generic:** import facts from OBDex after the audit; L1 for all; L2 in order of how often owners see a code. About 276 chassis and body codes have no public title anywhere OBDex could check (high); mark "defined by the standard, no public wording".
- **BMW:** formats are mixed (5-char, 4-hex, 6-hex, 8-hex, decimal). Census first, then public bulletins for the target chassis (cap about 60 bulletins in 12 weeks, est.), then induced faults on comfort and body circuits only (reach est. 30 to 50% of comfort tables, 0 to 5% of chassis). Network "module silent" timeouts go in a separate bucket so counts are not inflated (high that they multiply).
- **Mercedes:** key on (control unit, base code, suffix). Six-character codes seen in three bulletins (high). Suffix equals failure-type byte is medium. Format layer first; entries only from bulletin facts and captures. No Mercedes write, SCN, flash or key work.
- **Toyota/Lexus:** hybrid battery block family (P3011 to about P3029, sources disagree on the end, medium) as a templated family after one hybrid capture. SRS and hybrid high voltage are read-only, safety class. Lexus entries only after proof, not by assumption.

## 8. Effort in hours (est.; all contributors, incl. review)

| Work item | Wk 1-12 | Wk 13-26 | Wk 27-52 |
|---|---|---|---|
| Ledger, schema, decoder vectors | 24 to 40 | 8 to 16 | 8 to 16 |
| OBDex audit, importer, L1 templates | 23 to 34 | 4 to 8 | 4 to 8 |
| Anti-copying controls (section 6) | 50 to 72 | 15 to 25 | 15 to 25 |
| Bulletin harvester (one tool, facts only) | 24 to 40 | 8 to 12 | 8 to 12 |
| Generic L2 writing and review (5 to 8 min each) | 25 to 80 | 125 to 330 | 150 to 460 |
| BMW entries (about 20 to 30 min each, with review) | 35 to 95 | 55 to 175 | 120 to 450 |
| Mercedes entries (about 30 min each) | 15 to 50 | 35 to 100 | 75 to 225 |
| Toyota/Lexus entries (about 30 min each) | 30 to 50 | 20 to 75 | 50 to 150 |
| Captures and probes (3 cars, 8 to 16 h each) | 24 to 48 | 8 to 24 | 8 to 24 |
| Intake (issue forms, terms) | 16 to 24 | 4 to 8 | 4 to 8 |
| In-app flow and review dashboard | none | 80 to 130 | 20 to 40 |
| Review queue and takedown handling (about 3 h per week) | 12 | 36 | 78 |
| **Total (rounded)** | **280 to 545** | **400 to 940** | **540 to 1,500** |

Check against the plan: `data-strategy.md` 7.4 budgets about 45 hours for DTC work inside 90 owner hours. The low end here is about six times that. Cut order if hours are short: (1) induced faults (slowest per entry), (2) Mercedes entries, (3) generic L2 beyond the top 300, (4) in-app flow, (5) dashboard. Never cut: ledger, similarity gate, source tags, takedown path. Weeks 13 to 52 hours are only reachable with outside contributors; the owner alone caps at about 8 to 12 hours per week (est.).

## 9. KPI wording to replace or refine G6 (proposal; `kpis.md` not edited)

Why change G6: it divides by "fault codes seen in real sessions", which is only the owner's few cars; it counts any description including template text; it does not split generic from manufacturer; and 80% at week 12 is unrealistic for manufacturer codes (est.).

Proposed text:

| # | Goal | KPI | Today | Wk 4 | Wk 8 | Wk 12 | How measured |
|---|---|---|---|---|---|---|---|
| G6a | **It explains common faults in plain English.** | Share of distinct generic codes seen in captured real sessions with a reviewed own-words meaning (L2 or better) | 0% | 30% | 60% | 85% | Count over captured sessions vs published packs |
| G6b | **It is honest about manufacturer codes.** | (i) Share of distinct manufacturer codes seen in real sessions with a published meaning (L2 or better) (ii) Share of unexplained codes shown as "no description yet" with raw code and module, never guessed | (i) 0% (ii) n/a | (i) 0% (ii) 100% | (i) 10% (ii) 100% | (i) 25% (ii) 100% | Session logs plus pack lookup; test with 20 unknown codes |
| G6c | **Explanations are right and clean.** | Confirmed wrong or copied explanations that reached a release, and entries without source tag | 0 | 0 | 0 | 0 | Takedown log; pack linter |

Notes: targets are proposals (est., low confidence) and the owner sets them. G6b (i) is measured only on BMW plus one other family at week 12. The M2 gate "G6 at least 30%" becomes "G6a at least 30% and G6b (ii) at 100%". G6c overlaps G11, which already covers source and licence on every contribution; keep both or merge into G11 (owner's choice).

## 10. Top 8 risks

| # | Risk | Likelihood / impact (est.) | Mitigation |
|---|---|---|---|
| 1 | Copied text hides in an open set (OBDex pace, Wal33D, GPL tables); generic titles equal SAE wording | Medium / high | 50-code audit, title rule, overlap gate, rewrite rule |
| 2 | OEM-derived text enters through a contributor or bulk paste | Medium / high | Attestation, caps, similarity gate, quarantine, takedown, tainted-reader declaration |
| 3 | Manufacturer coverage stays tiny; users see "unknown" most of the time and leave | High / medium | First-class unknown state, report button, honest dashboard, per-chassis focus |
| 4 | A wrong meaning on a safety or hybrid battery code leads to a harmful decision | Low / high | Safety class default, confidence labels, no replace-this-part advice, SRS read-only |
| 5 | Effort exceeds capacity (280 to 545 h against about 45 h budgeted) | High / high | Cut order in section 8; scoreboard each Friday |
| 6 | Legal unknowns: facts from bulletins, EU database right, hash fingerprints, inbound relicensing, tainted-reader value | Medium / high | One counsel hour with these four questions; Tier B off until answered |
| 7 | Access limits: gateway filtering, DoIP, secure diagnostics on newer BMW, Mercedes, Toyota; no Mercedes car tested | High / medium | Capture early, say what is untested, make no coverage promise per car |
| 8 | Too few contributors or reviewers; reviewer bottleneck; SA content leaking into CC packs through a sloppy merge | Medium / medium | Two named reviewers before any promotion, batch caps, per-entry licence field and CI block |

## 11. Gaps (inherited and new)

- **No denominator** for any manufacturer code set. No BMW, Mercedes or Toyota total found; ISTA total not published (medium). All manufacturer shares are unknown.
- **No bulletin census.** Counts of BMW, Mercedes and Toyota codes in NHTSA bulletins not measured; bulk download needs owner permission; NHTSA datasets page blocked (high that it was blocked).
- **OBDex prose accuracy** not audited; only structure, counts, licence checked.
- **GitHub searches incomplete** (rate limit, invalid token on this machine). Other open sets may exist; expect none better than OBDex (unproven).
- **No Mercedes car and no hybrid capture yet.** Suffix meaning, gateway behaviour, Toyota INF layout all unverified (low).
- **OBDb**: DTC content checked in about 10 repos of 897; contributor counts and takedown handling unknown.
- **Licences unread:** Toyota TIS terms, MotorData agreement, NHTSA bulletin reuse, dot.report terms, Weblate translation terms, SAE reuse terms.
- **Legal:** all open (section 10, risk 6). Hash fingerprinting and designated-agent need are unverified.
- **Every hour, count and percentage in sections 1, 8, 9** is an estimate built on `data-strategy.md` per-entry times, not measured. No fault-code crowd contribution rate precedent found.
- This document is a synthesis; it did not re-fetch sources. Re-confirm any quoted count before it goes in a public doc.

## 12. Decisions needed from the owner

| # | Ask | Recommendation |
|---|---|---|
| 1 | Generic text licence: CC0 or CC-BY 4.0 | CC-BY 4.0 for text, CC0 for facts |
| 2 | Approve schema change (sub-code, suffix, applicability, source class, more formats) | Yes, before any manufacturer entry |
| 3 | Allow a bounded local download of about 60 bulletins (BMW, Mercedes, Toyota) | Yes, facts only, files kept outside the repo |
| 4 | Find one hybrid and one Mercedes car for read-only capture in weeks 1 to 6 | Yes; otherwise those families stay `low` |
| 5 | Counsel hour: bulletin facts, hash fingerprints, inbound relicensing, designated agent, EU database right | Yes, add to the existing counsel hour |
| 6 | Accept the hour gap (section 8) or approve the cut order | Approve cut order |

## Sources

All pages were read by the research runs on 2026-11-20; this document did not re-fetch them. Conf = confidence in the cited claim.

| # | URL | Used for | Conf |
|---|---|---|---|
| 1 | https://github.com/foerbsnavi/OBDex , https://foerbsnavi.github.io/OBDex/meta.json | 9,533 codes, CC0 data and MIT code, method, 276 and 770 weak codes | high |
| 2 | https://github.com/Wal33D/dtc-database and https://github.com/driveforgelabs/vehicle-db | MIT label, undocumented origin, downstream legal review, Audi length pattern | high |
| 3 | https://github.com/Automotive-9/dtc-codes and https://gitlab.com/GhostTypes/dtc-codes | 4,781 BMW rows, no licence, no source | high |
| 4 | https://github.com/brendan-w/python-OBD , https://github.com/fr3ts0n/AndrOBD | GPL-2.0 and GPL-3.0 tables, 2,066 and 3,584 codes | high |
| 5 | https://github.com/OBDb and https://github.com/OBDb/BMW-5-Series | CC-BY-SA-4.0, 897 repos, signals only, zero DTC hits | high |
| 6 | https://www.law.cornell.edu/regulations/california/13-CCR-1968.2 and https://www.law.cornell.edu/cfr/text/40/86.1808-01 | J2012 requirement, manufacturer-code publication duty and fair price | high |
| 7 | https://static.nhtsa.gov/odi/tsbs/2016/MC-10146779-9999.pdf , https://static.nhtsa.gov/odi/tsbs/2024/MC-11012059-0001.pdf , https://static.nhtsa.gov/odi/tsbs/2023/MC-10241404-9999.pdf | BMW, Mercedes, Toyota bulletin shapes; OEM copyright | high |
| 8 | https://catalog.data.gov/dataset/nhtsas-office-of-defects-investigation-odi-technical-service-bulletins-system-tsbs-downloa | Bulletin summary file, no licence stated | high |
| 9 | https://b2bconnect.mercedes-benz.com/is/help/faq/software/xentry-pass-thru-eu and https://automotivetechinfo.com/wp-content/uploads/2019/01/XENTRY-and-OBD-II-Go-Deep.pdf | Mercedes gating, OBD-II reach | high |
| 10 | https://techinfo.toyota.com and https://motordata.net/en_en/articles/dtc/toyota-trouble-codes-reference-how-to-decode-obd-ii-dtcs/ | TIS access, vendor "several thousand" claim | high / medium |
| 11 | https://en.wikipedia.org/wiki/Wikipedia:Copyright_violations , https://wiki.openstreetmap.org/wiki/Open_Database_License , https://osmfoundation.org/wiki/Licence/Contributor_Terms , https://www.ifixit.com/Info/Terms_of_Use , https://creativecommons.org/faq/ | Copy detection, takedown, 1% relicensing loss, inbound terms, CC compatibility | high / medium |
| 12 | https://github.com/commaai/opendbc , https://docs.weblate.org/en/latest/workflows.html | Evidence-based review, support tiers, review states | high |
| 13 | https://github.com/MechanicDB/MechanicDB-public | ODbL sample, Wal33D spine | high |
| 14 | `docs/plan/data-strategy.md`, `docs/plan/decisions.md`, `docs/plan/kpis.md`, `docs/design/data-schema.md` | Per-entry times, owner decisions, G6 text, schema | high |
