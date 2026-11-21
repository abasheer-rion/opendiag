# DTC crowd-curation model: how open knowledge projects reached coverage, kept quality, stayed legal

Date: 2026-11-20. Status: research, not legal advice. Status of run: **PARTIAL** (see Gaps). Confidence tags: high = read from the project's own page or repository today; medium = read from a secondary or partial page, or inferred from a small sample; low = search snippet only or inference.

Rules followed: no fault text copied from any source; only counts, formats, licences and process facts recorded. Numbers from GitHub APIs were fetched 2026-11-20 unless noted. Part of the GitHub API hit its rate limit mid-run, so some repository facts for Repology and Weblate were not collected.

## 1. Executive summary

- **Nobody has built a large open library of manufacturer fault-code meanings by crowd.** The closest open projects (OBDb, opendbc) are about signals and bus messages, not code text. OBDb's own description says it documents DTCs, but in the six vehicle files I sampled, the only DTC-labelled signals were Toyota and Mazda monitor-status flags, not code-to-meaning tables. Confidence: medium (sample of 6 of 897 repos).
- **Paid repair-fix libraries exist and are closed.** Identifix claims 50M+ technician-submitted fixes keyed to exact VIN (search snippet, low). YOUCANIC runs a "share a fix" form for mechanics; no licence for submissions was shown (medium). The model "I hit this code, here is what fixed it" is proven commercially, never openly.
- **What works in every large open project we studied:** (1) a hard source rule (verifiable or surveyed, never copied), (2) a visible source field on each change, (3) a small trusted reviewer group, (4) automatic checks before humans look, (5) a clear removal path for bad content, (6) one licence chosen on day one with relicensing room built into contributor terms.
- **Licence lesson from OSM:** it moved from CC BY-SA 2.0 to ODbL on 12 Sep 2012 and lost about 1% of data from contributors who did not agree. Build relicensing room into the contributor terms now. Confidence: high.
- **Share-alike lesson (owner decision allows a separate SA pack):** CC BY content can be included in a CC BY-SA work, not the other way round. So our CC0/CC-BY packs can feed a share-alike pack, but OBDb-style SA data can never flow back into them. Keep the pack boundary enforced by tooling, not memory. Confidence: high (CC FAQ).
- **Copy risk is the real threat for fault text.** Wikipedia treats close paraphrase of non-free text as a violation and uses automated web-matching tools plus revision deletion. We need the same: automated similarity checks at submission, human review, a quarantine state, and a takedown path.
- **Proposal in section 9:** in-app "I hit this code, here is what fixed it" report with source tag, confidence tag and rights attestation; a similarity gate against open text sets and against hash-only fingerprints of commercial text; two-reviewer promotion; a public coverage dashboard that counts codes by confidence, never by raw submission volume.
- **Honest expectation:** crowd fix-reports will cover common codes fast and long-tail manufacturer codes slowly. Plan for coverage measured per chassis family, not a single global percentage.

## 2. What was asked and how this relates to existing docs

Existing in-repo material (read, not repeated):
- `docs/plan/data-strategy.md` defines the five legitimate channels, the tainted-reader rule, the 200-DTC bootstrap target, and lists a "DTC rewrite helper" with n-gram overlap as a 2-day task. Confidence: high (read in repo).
- `docs/design/data-schema.md` defines provenance fields, `confidence` (high needs two independent testers), `contributor_attestation`, a `profiles.attested_rights` gate, and a two-reviewer rule. This research extends those with fix-report-specific fields.
- `docs/plan/decisions.md` decision 1: share-alike data (OBDb, CC-BY-SA-4.0) allowed as a separate pack, never mixed into CC-BY/CC0 packs.

This document answers: what do the comparable projects do, and what concretely should OpenDiag build for fix-report submission, similarity checking and a coverage dashboard.

## 3. Project-by-project findings

### 3.1 Wikipedia (review, sourcing, copyright)

| Item | Finding | Confidence |
|---|---|---|
| Contribution flow | Anyone edits. Pending-changes protection hides edits from logged-out and new users until a reviewer checks them; readers see the last accepted version. Used on relatively few articles | high |
| Review rule | The editor who adds material must supply an inline citation to a reliable published source; unsourced material can be removed; no original research | high |
| Source quality | Blogs, forums, social media and most self-published material are generally not reliable sources; sites that copy Wikipedia are not acceptable sources | high |
| Reviewer reputation | Pending-changes reviewer is a user right, requested through a permissions page; trust level about the same as rollback holders; accepting an edit means it passed a quick check, not endorsement | high |
| Licence | Text is CC BY-SA (plus GFDL, per the copyright page) | high |
| Anti-copying | CopyPatrol checks new edits for possible violations and shows a side-by-side comparison; Earwig's Copyvio Detector searches the web for matching text on a page. Close paraphrase that keeps the original's creative wording or structure can also count as a violation | high |
| Takedown handling | Partial infringement: remove text, note source in edit summary, request revision deletion. Whole page: revert to a clean version, rewrite, or delete. Obvious cases speedily deleted; others get a one-week review. Owners can email with page URL and proof of ownership or send a formal notice to the Wikimedia Foundation's designated agent | high |
| Repeat infringers | Warned with templates, then blocked; extensive infringers can be blocked without warning, and major contributions of an established infringer can be removed without case-by-case review | high |
| Growth | English Wikipedia: about 7.27 million articles (7,267,103 when re-read; page says as of November 2026); 37,167 users with more than 5 edits in the last month (month not named); the earlier '12.4 million edited at least once' figure was not re-verified and should be ignored | medium (page banner says it needs updating) |

Lessons for us:
1. Cite-or-remove is the single cheapest quality rule. Our version: no source tag, no merge.
2. The detection tooling is web-matching plus side-by-side diff for a human. Copy ours the same way: machine flags, human decides.
3. Revision deletion keeps history but hides infringing text. Our version: redact the text, keep the row, the code, the author handle and the removal reason.
4. The repeat-infringer policy is what makes the system defensible. Write it into contributor terms from the start.

### 3.2 OpenStreetMap (import rules, provenance, takedown, licence move)

| Item | Finding | Confidence |
|---|---|---|
| Licence | ODbL for the database; contributors grant OSMF a worldwide, perpetual, irrevocable, non-exclusive licence including commercial use and sublicensing; OSMF may use ODbL 1.0 (with DbCL for contents), CC-BY-SA 2.0, or another free and open licence chosen by a vote needing two-thirds of active contributors | high |
| Licence change | Moved from CC BY-SA 2.0 to ODbL, effective 12 Sep 2012. About 1% of data was lost because some contributors did not agree. Pre-change data stays available under the old licence | high (OSM wiki; page says OSMF site is more authoritative) |
| Why it moved | The wiki page links to an OSMF page for reasons but does not state them; the OSMF FAQ URL I tried returned 404, so reasons are not recorded here | medium; gap |
| Contributor warranty | Contributors state, to their knowledge, that they have the right to let OSMF distribute their contributions; contributions must not infringe others' IP; OSMF may delete contributions that appear incompatible with its licences | high |
| Import rules | Imports need licence compatibility, written permission when a licence is not on the compatibility list, a wiki page documenting source, tags, conversion and QA plan, local community buy-in, and a formal forum review of at least 14 days. Data of uncertain origin must not be imported even if the stated licence looks compatible | high |
| Provenance field | `source=*` records where information came from; modern editors put source on the changeset rather than on every object; a source should be given even if it matches an earlier edit | high |
| Takedown | The Data Working Group handles copyright complaints, problematic imports, serious disputes and vandalism. It can revert, block (temporary blocks up to 96 hours), and redact edits. Redacted changesets stay in history but the object data is removed. It removes material that cannot be legally distributed, usually bulk data copied or imported without permission. Complaints go by email with short, specific links. Permanent blocks go through OSM administrators | high |
| Growth | About 10 million registered users and 2.25 million different contributors (2025-Q2); 10 billion nodes (2025-08-12); about 4 million map changes per day (2021-Q4) | medium (stats wiki, dated snapshots) |

Lessons for us:
1. The "uncertain origin" rule is the one to copy for fault text: if a contributor cannot say where a sentence came from, it does not merge.
2. Source on the change (changeset) is better than source scattered in fields; our report should carry one source block per submission.
3. Redaction that keeps history is a good model for takedown.
4. Bulk imports are the big legal risk; one person pasting 500 codes is higher risk than 500 people each adding one. Throttle bulk submissions.
5. OSM's relicensing cost (about 1%) came from contributors who could not or would not agree later. Prevent this with contributor terms that allow relicensing under a defined process.

### 3.3 OBDb (the closest project; share-alike)

Facts (all fetched 2026-11-20, high unless noted):
- GitHub organisation OBDb, created 2022-12-20, 897 public repositories, 663 followers (org page). Description: community documentation of OBD parameters, scalings and DTCs.
- One repository per make or model (examples seen: BMW-3-Series, BMW-M3, BMW-i3, Toyota-Corolla, Mazda-3). BMW has dozens of model repositories (for example 1-Series, 3-Series, 5-Series, i3, iX, M3, X5, Z4 were listed). Mercedes and Lexus repos: the listing I read was partial, so presence is not confirmed (gap).
- Licence: most of the text is CC BY-SA 4.0; the GitHub API reports CC-BY-SA-4.0 for the vehicle repositories I checked and for the `.github` repo. The org README requires credit and says changed signal definitions that you share must also be shared under CC BY-SA 4.0, and that the rest of your app's code is not affected.
- Structure: each vehicle repo holds `signalsets/v3/default.json` plus optional year-range override files; a generation file and a tests folder exist in BMW repos.
- Contribution flow: you need a GitHub account to contribute; if a make or model has no repo you request one with an issue form in the meta repository; contributors fork, branch, commit and open a pull request with a detailed description (BMW-3-Series README).
- Review and automation: the vehicle template runs a JSON validation workflow on push and pull request that checks files against the central schema repository and posts a comment on the pull request. A second workflow named response tests also exists in the template. Branch protection is applied across repositories by scripts in the meta repository (file names seen: a branch-protection script and a protection JSON). Confidence: high for existence, medium for what response tests exactly check.
- Provenance fields: **none required in the signal files that I saw.** Signals carry an id, path, format (bit index, length, scaling, unit) and name. There is no per-signal source, confidence or tested-on field in the sampled files. Provenance is the git history and the pull request text. Confidence: medium (sampled files and schema headings only).
- Scale of one repo: BMW-3-Series `default.json` has 122 command entries and 243 signals; the repo has 709 commits and, from the contributors page count, about 3 contributors (GitHub link-header count). Confidence: high for numbers, medium for interpretation.
- DTC content: BMW-3-Series, BMW-i3, BMW-M3 and Volkswagen-ID.4 files had zero mentions of "dtc". Toyota-Corolla had 44 signals on the DTCs path (examples are monitor-availability flags with a bit index and on/off unit), Toyota-4Runner 26, Mazda-3 3. So the sampled DTC-path content is monitor status, not code meaning tables. Confidence: medium.
- Frontend: Pelican (pelican.clutch.engineering) is an official partner hosting a visual browser of makes and models.
- Anti-copying controls: **none found** (no similarity check, no source ledger, no attestation) in the template workflows I read. Confidence: medium.
- Takedown handling: not documented on the pages read. Gap.

Lessons for us:
1. Per-vehicle repositories scale contribution (897 repos in about 3 years) but per-repo reviewer depth is thin (about 3 contributors on the BMW 3 Series repo). Coverage is wide, depth is uneven.
2. OBDb does not solve fault-code meaning; it is a source for live-data signals and ECU headers. For DTC text it is not a source. Treat as "commands and scalings" supplier only.
3. A schema validator running on every PR is cheap and effective for structure, but it says nothing about legality. We must add the legal gate they lack.
4. Because SA is allowed as a separate pack, OBDb-derived signal data can ship as `packs/obdb-sa/` with its own manifest licence. Needs the short legal check already noted in decisions.md.

### 3.4 openpilot DBC community, opendbc and comma.ai

Facts (high unless noted):
- opendbc: MIT licence, created 2017-05-31, 3,573 stars, 2,408 forks, 378 open issues, last push 2026-11-19. Contributors count (GitHub link-header, incl. anonymous): 262 (re-checked 2026-11-20). Supported-cars list says "405 Known Cars" in its heading (my row tally was about 401).
- openpilot: MIT, created 2016-11-24, 64,187 stars, 11,410 forks, 141 open issues, last push 2026-11-20; description says 300+ supported cars. Contributors count (GitHub link-header, incl. anonymous): 752 (re-checked 2026-11-20).
- Contribution flow: development is coordinated on GitHub and Discord; a "How to Port a Car" guide and a car porting checklist define what a good submission has; the pull request template asks for a **dongle ID and a route** (a recorded drive) as validation evidence.
- Review rules (CONTRIBUTING): merge probability depends on value versus effort to merge; 500+ line PRs, style-only changes, PRs without a clear goal and feature additions are generally not merged; good PRs state purpose, show verification, and pass CI. A bounty project board is the suggested first contribution, and many bounties need no car.
- Provenance and evidence: the porting checklist asks for every observed ECU firmware version in a fingerprints file, harness and bus topology, stock behaviour baseline, and says unknown or ambiguous firmware must not silently select a platform. Evidence is a recorded route, which a reviewer can replay. This is the strongest "evidence over assertion" model in the set.
- Support tiers: the cars list classifies each car as Upstream, Under Review, Custom, Dashcam, Community or Incompatible. This is a public confidence ladder.
- Safety model: the safety firmware starts in a silent mode until a mode is selected, and runs static analysis and MISRA checks in CI. Relevant for our write-gating, not for DTC text.
- Licence choice: MIT for everything, no share-alike. Reciprocity is social and commercial (comma sells hardware), not legal.
- Anti-copying: not described on the pages read. Per-file provenance was a flagged risk already in `data-strategy.md`.
- Takedown handling: not documented on the pages read. Gap.

Lessons for us:
1. Require replayable evidence. Our version: attach the actual diagnostic response log (code number, module address, software id) so a reviewer can check the code exists on that module. No log means low confidence.
2. A public support-level ladder (Upstream, Under Review, Community...) maps to our verified, community-reported, experimental trust levels.
3. "Large PRs are not merged" is a useful rule: cap a submission batch size.
4. Bounties as onboarding. Our version: a public "needs a report" list of high-value uncovered codes per chassis.

### 3.5 iFixit (user guides, licence, takedown)

Facts from the Terms of Use page (high):
- Users keep copyright but grant iFixit a worldwide, perpetual, irrevocable, royalty-free, sublicensable licence; users warrant they have the rights and that the content is accurate and non-infringing; iFixit can edit or remove submissions.
- Reuse by others is under CC BY-NC-SA 3.0 (non-commercial share-alike), unless a commercial licence says otherwise; the terms bar using site content to train machine learning or AI models without written permission.
- DMCA takedown: a valid notice needs signature, identification of the work, location of the material, contact details, a good-faith statement and a statement under penalty of perjury. After a valid notice iFixit removes or disables the content and notifies the poster, who can send a counter notice. The terms warn about liability for knowing misrepresentation. Repeat infringers lose access.
- Community, review, reputation and growth numbers: the community page URL I tried returned 404. Not collected. Gap.

Lessons for us:
1. The inbound grant is broad (so the host can relicense or sublicense) while outbound is narrower. This is the OSM pattern too. Copy it: inbound CC0 for facts, CC-BY for authored text, with relicensing right.
2. NC (non-commercial) terms block our own commercial-friendly goals and are incompatible with CC-BY / CC0 reuse. Do not ingest iFixit guides. Confidence: high on terms.
3. A written notice-and-counter-notice process, with a statement about knowing misrepresentation, is the standard shape. Adopt it, with counsel review (D5).

### 3.6 Repology (matching, rules, hourly refresh)

Facts:
- Tracks and compares package versions in more than 120 package repositories (about page); the statistics page lists about 336,786 projects and 5,104,164 packages (live counters; earlier read gave 336,781 and 5,104,031) and at least 210 repository rows, so the 120+ figure may be old or count differently (the two pages disagree; treat the stat page as the later number). Confidence: medium.
- Gathering: parses index files, git repositories, web pages and JSON API output; aggregates raw data per upstream project mainly by package name; a ruleset (maintained on GitHub with issues and pull requests) merges differently named packages and splits same-named ones. Updated hourly.
- Licence: code GPLv3+; data licence not stated on the page read. Gap.
- Contribution flow: the community finds mismatches and contributes name-transformation rules; the page invites newcomers.
- Repository metadata (stars, contributors) was not collected: GitHub API rate limit. Gap.

Lessons for us:
1. The hard problem is identity: the same thing named differently across sources. For DTCs this is: same code on different modules and software versions. Repology's solution (a small rules layer that maps raw names to a canonical project) maps to our "applicability" matching (chassis, module, software range).
2. Show per-source freshness and per-source coverage on a public dashboard; Repology's value is the comparison. Our dashboard should show per-source counts the same way.
3. Contribution as small rules (one-line mapping) is easy to review. Prefer many small reports over a few large ones.

### 3.7 Weblate-style translation review

Facts from Weblate workflow docs (high):
- Suggestions: any user can propose; other users vote; a suggestion becomes the translation after a set number of votes; suggestions live in Weblate, not in the files.
- Roles: translators edit unapproved strings and can suggest changes to approved ones; reviewers approve, unapprove and edit approved strings. Requires reviews enabled per project.
- States: needs editing, translated (waiting for review), approved. Approved strings are locked against direct translator edits.
- Access control: review permission by team and by language; quality filter controls which translations reach the repository (for example only approved).
- Weblate page for reviewing returned 404; the workflows page was used. Growth numbers not collected.

Lessons for us:
1. The three-state model (needs work, waiting review, approved) maps cleanly to our submission, candidate, published states.
2. Votes plus a threshold can be a cheap second check, but votes alone are gameable; use votes only as a signal for reviewers, not as promotion.
3. Publishing filter: the app only reads "approved" by default, "unreviewed" behind an expert switch (same as our experimental level).

### 3.8 User-submitted fault-code libraries (commercial and informal)

| Source | What was seen | Confidence |
|---|---|---|
| Identifix | Claims 50M+ verified technician-submitted fixes by exact VIN, cross-referenced to codes; paid, closed | low (search snippet) |
| YOUCANIC "share a fix" | Page asks for vehicle year/make/model/engine, symptoms, scanner and tests used, the fix, pro tips and at least five photos; no licence, ownership or review terms on the page | medium |
| MyCarly community | Page read shows no fault-code community features, votes, moderation or counts; copyright notice "all rights reserved" | medium |
| AutoCodes community, OBDFix | Named in search results; not fetched; terms unknown | low |
| Hugging Face "mechanicdb-obd2-repair-sample" | A dataset named with fix-linked fields (fix id, code id, probability rank); origin and licence not verified | low |
| Workshop Data diagnostics, OBD2 code sites | Appear in search; not fetched | low |

Takeaways:
1. The richest field set for a fix report (vehicle, symptoms, tools, tests run, fix, photos) is a good starting form. Our version adds the code evidence and source tag and drops mandatory photos (privacy, size).
2. None of these publish a share-alike or permissive licence for the submitted fixes, so there is no open competitor to copy and no data we may ingest.
3. "Probability rank per fix" (as in the sample dataset name) is a good idea: a code has several possible causes, and frequency of confirmed fixes is the useful number. We can compute it from confirmed reports.

## 4. Comparison tables

### 4.1 Contribution flow and review

| Project | Who can submit | Gate before publish | Reviewer group | Evidence required |
|---|---|---|---|---|
| Wikipedia | anyone | none by default; pending changes on some pages | pending-changes reviewers, admins | inline citation to a reliable source |
| OSM | registered users | none for edits; formal consultation for imports | local community, Data Working Group | source on changeset; survey or compatible open data |
| OBDb | GitHub users | pull request + schema validation + (repo rules) | repo maintainers | pull request description; test files in repo |
| opendbc | GitHub users | pull request, CI, checklist, maintainer review | comma maintainers | recorded route (dongle id + route) |
| iFixit | registered users | moderation (details not collected) | not collected | not collected |
| Repology | GitHub users | pull request for rules | rule maintainers | matching evidence in the PR |
| Weblate | registered users | review state, optional | per-language reviewers | none (linguistic judgement) |

### 4.2 Provenance, anti-copying, takedown, reputation

| Project | Provenance field | Anti-copying control | Takedown path | Reputation |
|---|---|---|---|---|
| Wikipedia | citation per claim, edit summary | CopyPatrol, Earwig tool, templates, blocks | designated agent, email with proof, revision deletion | user rights (reviewer, rollback) |
| OSM | source tag on changeset | import consultation, uncertain-origin ban | Data Working Group redaction | blocks (96 h up to permanent) |
| OBDb | git history only (as sampled) | none found | not documented | none seen |
| opendbc | route + firmware versions | none found | not documented | maintainers |
| iFixit | author attribution | not collected | DMCA notice and counter notice | repeat-infringer termination |
| Repology | rule files in git | not applicable (facts) | not collected | not collected |
| Weblate | per-string history | not applicable | not applicable | role-based (translator, reviewer) |

### 4.3 Licence choices and tradeoffs

| Licence | Used by (verified) | Good for | Cost |
|---|---|---|---|
| CC0 | Wikidata structured data (all contributions are CC0 by condition of use); OBDex data (per `data-strategy.md`) | Pure facts; maximum reuse; no attribution burden; easiest to merge into anything | No attribution flows back; rejects non-CC0 inputs (Wikidata avoids CC BY datasets). Contributors can feel exploited |
| CC BY 4.0 | our CC-BY packs (planned) | Attribution; commercial reuse allowed; can be included in SA works | Attribution burden for downstream apps; datasets with incompatible inputs cannot join |
| CC BY-SA 4.0 | Wikipedia text, OBDb signal data | Keeps improvements open; deters closed forks | Cannot be mixed into CC0/CC-BY packs; adaptation must also be SA; app-level friction (the OBDb README says app code is not affected, but changed definitions are) |
| ODbL + DbCL | OSM | Share-alike aimed at databases; covers database right | Complex; relicensing in 2012 lost about 1% of data |
| CC BY-NC-SA | iFixit reuse terms | Blocks commercial resale | Incompatible with open packs; excluded |
| MIT | opendbc, openpilot | Code | Not for data text; no reciprocity |

Facts behind the table: CC 4.0 licences cover database rights; CC0 is a dedication, not a licence; CC BY works can be included in CC BY-SA works (CC FAQ, high). The FAQ does not directly say the reverse; by the share-alike rule, adaptations of BY-SA content must stay BY-SA, so treat the flow as one-way (medium). Wikidata requires CC0 or public domain for its structured data and says no other licence is compatible with its copyright requirements; whether that is legally necessary or only community policy was not established (medium).

Implication for OpenDiag:
- **Facts-only fields** (code, module address, a code existing on a module, applicability ranges, counts): CC0.
- **Authored text** (plain-English meaning, fix description): CC-BY 4.0 for the main packs.
- **SA pack** (OBDb-derived signals): separate manifest, separate directory and signing identity, CI rule that bans importing SA content into non-SA packs (enforce by a licence field on every entry plus a build check).
- **Inbound terms**: contributors grant the project a perpetual, irrevocable, non-exclusive licence with relicensing allowed to any free and open licence the project steering group approves. This mirrors OSM's contributor terms and iFixit's broad inbound grant, and limits the 2012 problem. Needs counsel (D5).

## 5. Growth numbers collected (with dates)

| Project | Number | Date / source | Confidence |
|---|---|---|---|
| English Wikipedia | about 7.27 million articles (7,267,103 on re-read) | Nov 2026 (Wikipedia:Statistics) | medium |
| English Wikipedia | 37,167 users with more than 5 edits in last month | undated month | medium |
| OSM | 10 million registered users; 2.25 million contributors | 2025-Q2 (OSM wiki Stats) | medium |
| OSM | 10 billion nodes | 2025-08-12 | medium |
| OSM | about 4 million map changes per day | 2021-Q4 | medium |
| OBDb | 897 repositories; 663 followers | 2026-11-20 | high |
| OBDb BMW-3-Series | 122 commands, 243 signals, 709 commits, about 3 contributors | 2026-11-20 | high for counts |
| opendbc | 3,573 stars; 2,408 forks; 262 contributors; about 405 cars in list heading | 2026-11-20 | high (heading), medium (contributor count via link header) |
| openpilot | 64,187 stars; 11,410 forks; 752 contributors; 300+ cars (description) | 2026-11-20 | high / medium |
| Repology | about 336,786 projects; 5,104,164 packages (live counters); page says 120+ repositories | 2026-11-20 | medium |

No growth curve over time was collected for any project (no time series), so I cannot state a rate. Gap.

## 6. Failure modes seen or implied

1. **Thin depth behind wide coverage.** OBDb has many repositories; the one I measured has about 3 contributors. Wide shells with little review risk wrong data that looks official.
2. **Validation without legality.** Schema checks pass format; none of the sampled projects automatically check copying.
3. **Bulk copy.** OSM and Wikipedia both name bulk imports and large copy-paste as the main legal exposure. A fault-code library built by pasting from a scan tool vendor's database is the same shape of problem.
4. **Relicensing loss.** About 1% of OSM data lost in 2012.
5. **Reputation gaming.** Votes (Weblate) and counts can be gamed; Wikipedia gives review rights only to experienced users.
6. **Pending-change fatigue.** Wikipedia keeps pending changes on relatively few pages, because review time does not scale. We should gate only the entries that can matter (published text), not every draft.
7. **Quiet staleness.** Repology refreshes hourly; static JSON packs do not. Our packs need a freshness stamp and a "last re-tested" date.

## 7. Design requirements derived

R1. Every published fault entry has: a source type, a source reference, a confidence tag, an applicability range and a rights attestation. No field blank, or the build fails (extends `data-schema.md` section 5).
R2. Raw submissions are never published directly; they go through states (draft, flagged, candidate, published, quarantined, removed).
R3. A similarity gate runs before a human sees a submission and again before publication.
R4. Reviewers work from a checklist; the author cannot review. Two reviewers for text; one is enough for a pure fact (code exists on module X) if the log evidence validates automatically.
R5. A removal path exists on day one: quarantine in minutes, redact text, keep history rows.
R6. Reputation affects review priority and bulk limits, never publication on its own.
R7. The coverage dashboard counts distinct, reviewed, applicable entries, split by confidence; submission counts are shown separately and never as coverage.
R8. Privacy: submissions never include VIN in the clear; vehicle identity is a hash or a coarse chassis/model-year label (consistent with `data-strategy.md` VIN-hash rule).

## 8. Source and confidence taxonomy for fault entries (proposal)

Source types (extend `data-schema.md` `provenance.source_type`):
- `bus_observation`: the code was read from a module on a real car by our tool; log attached (fact only: code exists on this module/software).
- `induced_fault`: owner caused a harmless fault on the whitelist and read the resulting code.
- `owner_repair_report`: "I hit this code, here is what fixed it", from a person who did the repair; own words.
- `public_regulation_or_standard`: facts from a public regulation or a public summary; rewritten.
- `open_dataset_crosscheck`: compared against a verified-licence open dataset (for example OBDex under its data licence); used as a check, not copied.
- `oem_public_page_lead`: a public manufacturer page used only as a lead; entry must still be proven by one of the first two types.
- `paid_portal_understanding`: tainted-reader channel; never an authoring source (see section 11).

Confidence tags (aligned with `data-strategy.md` 6.1):
- `low`: one report or one log, no second confirmation.
- `medium`: one log plus a repair report that matches (same code, same module family), reviewed by two people.
- `high`: two independent reports on two different cars with matching software ranges, or one bus observation plus one induced-fault confirmation by different people.

Ladder in app: high = "verified", medium = "community-reported", low = "experimental" (hidden behind an expert switch), matching `roadmap.md` trust levels cited in `data-strategy.md`.

## 9. Concrete design for OpenDiag

### 9.1 In-app submission flow ("I hit this code, here is what fixed it")

1. After a scan, each stored fault shows a button "Report what fixed it".
2. The app prefills from the scan: code, module address, module name, software and hardware ids (if readable), mileage band (rounded), chassis and model-year label, adapter id, app version, timestamp. VIN is never sent; a salted hash may be sent for duplicate detection.
3. The user adds: symptom (short free text), what they did (checklist plus free text), whether the code returned after clearing (yes, no, not sure), time to recheck (hours or days or miles), part replaced (free text, optional), source tag (own repair / mechanic told me / forum / manual / not sure), and confidence tag (sure / fairly / guess).
4. Rights attestation: the user confirms the text is in their own words and not copied from any manual, scan tool, forum or website. If they choose "mechanic told me" or "forum" or "manual", the app asks them to describe it in their own words and stores the source label (not the text); entries based on those sources start as `low` and need an independent confirmation.
5. In-app hints at the text box: "Do not paste from manuals or other apps". The app does not read the clipboard, but it records a boolean `pasted_large_block` computed locally (a paste event of more than N characters). Privacy: stored as a flag only, and shown to the user before sending. (Design choice; legal and privacy review needed.)
6. Submit goes to the intake queue (Supabase table per `data-schema.md` section 7, or GitHub issue forms in phase A as already planned). Anonymous browsing allowed; submitting needs the `attested_rights` profile flag already specified.
7. The user sees status: received, under review, published, needs changes, removed.

Submission record (new table `fix_reports`; fields are proposals):

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| code | text | normalised, e.g. 5-char or 6-hex |
| module_addr | text | from scan |
| module_ids | jsonb | part number, software, hardware, coding index |
| vehicle_label | text | chassis family, model year, market; no VIN |
| vehicle_hash | text | salted hash for duplicate detection only |
| symptom_text | text | contributor words |
| fix_text | text | contributor words |
| recheck_result | enum | cleared / returned / unknown |
| source_type | enum | from section 8 |
| source_note | text | own-words description of where it came from; max length cap |
| confidence_self | enum | low / medium / high |
| log_attachment | storage ref | scan response log, size-capped |
| rights_attested | bool | |
| pasted_flag | bool | |
| similarity | jsonb | scores and matched set ids (section 9.2) |
| state | enum | draft, flagged, candidate, published, quarantined, removed |
| reviewer_ids | uuid[] | |
| decision_log | jsonb | checklist ticks, reason codes |
| created_at, updated_at | timestamptz | |

Retention: raw text of removed submissions is deleted; the row keeps code, author id, reason code and dates (mirrors OSM redaction and Wikipedia revision deletion).

### 9.2 Similarity checks against known commercial text

Constraint: to compare against commercial text we must hold something derived from it. Holding OEM or scan-tool text is the exact "tainted" exposure we are avoiding. Proposal with tiers:

Tier A (always on, low risk): compare against open text we may legally hold.
- OBDex data (CC0 data per `data-strategy.md`; licence read in repo form, so re-verify the file before use).
- Our own published packs and pending submissions (catches duplicates and collusion).
- Public-domain regulation text where available.
- Wikipedia-derived code lists only as a check; their text is CC BY-SA, so never copy it into CC-BY packs.

Tier B (hash-only fingerprints of commercial text): a designated, separate "fingerprinter" role generates salted hashes of normalised word 5-shingles from lawfully held reference text (for example text a subscriber lawfully reads) and publishes only the hashes. No text is stored in the repository. Matching: a submission's shingles are hashed with the same normalisation and compared; overlap above a threshold flags it. Open question for counsel: whether creating and distributing such fingerprints is itself risky. I did not verify this; treat as unverified (D5). If counsel says no, drop Tier B and rely on Tier A, human review and takedown.

Tier C (behavioural, privacy-aware): paste flag, submission rate per account, batch size cap, matching style across many reports (for example identical sentence frames from one account), and a "code lists in code order" detector (a sign of transcription from a table).

Algorithm sketch (proposal):
- Normalise: lowercase, strip punctuation, collapse whitespace, drop code identifiers and numbers, stem lightly.
- Shingle: 5-word shingles; compute Jaccard overlap against each set and a longest-common-substring check (words).
- Thresholds (to be tuned on real data; no numbers are claimed here): auto-flag on high overlap; send to review on medium; pass on low. Short strings (under ~8 words) are exempt because short factual titles are naturally similar; the human check handles them.
- Output stored in `similarity`: score per set, top matching set id, matching span length. The reviewer sees the span, not the source text for commercial sets (hash-only has no text).
- Re-run at publication and quarterly on the published corpus (when new fingerprint sets arrive).

Known limits: paraphrase tools defeat n-gram checks; factual short statements ("code means X circuit") are legitimately similar; hashes of commercial text may not be allowed; the check proves neither innocence nor guilt. It is a filter plus audit trail, in line with how Wikipedia uses detection tools to point humans at suspects.

### 9.3 Review and promotion

State machine (Weblate-style three states plus quarantine):
- `draft` (user), `flagged` (auto-check failed or rare cases), `candidate` (passed automatic checks, waiting for reviewers), `published` (two reviewers, checklist ticked), `quarantined` (any maintainer, any time), `removed` (reason code, text redacted).

Rules:
1. Author cannot review own item.
2. Two reviewers for authored text; one reviewer plus automatic log validation for pure facts (code seen on module).
3. Reviewer checklist (extends `data-strategy.md` 6.2): source tag plausible; own words; similarity ok; code and module consistent with log; applicability range correct; no deny-class content (airbag, immobilizer, key learn, odometer, emissions defeat); no instruction that tells the user to do something unsafe (for example "jump the connector"); no personal data.
4. A fix report on its own never exceeds `low`. `medium` and `high` require corroboration per section 8. Aggregation: when several independent reports agree on a cause, the entry shows "reported by N people" with a count; confirmation counts only distinct accounts and distinct vehicle hashes.
5. Publishing target: the pack release. The app reads "published" by default.
6. Quarterly audit: random 10% re-checked (already in `data-strategy.md` 6.1 rule 9).

### 9.4 Reputation (reviewer privileges, not content authority)

- Levels: new, trusted submitter, reviewer, maintainer.
- Trusted submitter: for example a set number of accepted reports with no removals (the numbers are a decision, not researched). Effect: lower sampling for extra checks, higher bulk limit. Effect is never auto-publish.
- Reviewer: granted by maintainers after observed review quality, like Wikipedia's reviewer right; removable.
- Penalties: a removal for copying drops the account to new and caps its bulk limit; repeat copying leads to suspension, as in Wikipedia's and iFixit's repeat-infringer practice. All reasons are recorded.
- Do not publish a public leaderboard that rewards counts (it invites copy-paste volume). Show credit lines per entry instead.

### 9.5 Takedown and quarantine handling

1. Contact: a monitored address and a form in the app and on the site; request needs the entry URL or code, what is claimed, and how the claimant is entitled to act. Format modelled on iFixit's described notice contents and Wikipedia's owner route. Whether we need a formal designated agent registration is a legal question for counsel (unverified; not researched here).
2. On receipt: quarantine the entry immediately (hidden from packs and the app on next sync; the pack release stream includes a revocation list so installed apps drop it). Target response times are a decision, not a researched number.
3. Review: compare the entry with the claimed work. If it matches, redact the text, mark `removed` with reason `third_party_copyright`, and notify the contributor. If not, restore after a counter-notice period.
4. Contributor notice and counter-notice: contributor can respond; the project does not adjudicate beyond whether to publish.
5. Pattern response: if one contributor has a confirmed copying case, review their other published entries (Wikipedia allows removal of an established infringer's major contributions without case-by-case review), and quarantine them in a batch.
6. Records: a log with dates, claim, decision. Publish a transparency count periodically (Wikimedia publishes copyright takedown figures; the page redirected and I did not read the figures).

### 9.6 Coverage dashboard

Purpose: show what is actually known and where the holes are, without inflating numbers.

Public metrics (all computed from published entries only):
- Codes with a published plain-English meaning, per category (generic P, U, B, C; manufacturer-specific by make), as a count and as a percentage of the known universe.
- Denominator: the "known universe" per category is the list of codes that exist. For generic codes use the OBDex list (9,533 per `data-strategy.md`; re-verify). For manufacturer codes there is no verified universe. Say "unknown total" and use only the observed set: codes seen in real scans from consenting users plus codes in public sources. Dashboard shows both "observed in the wild" and "explained".
- Split by confidence: high / medium / low.
- Split by source type.
- Coverage per chassis and module (matrix): rows are modules, columns are chassis families, cells show explained / observed.
- "Most-seen unexplained codes": ranked list of codes that users scanned most and that have no published meaning; this is the contribution to-do list (bounty model from openpilot, minus money).
- Freshness: last re-tested date per entry cohort; oldest cohort age.
- Review queue health: number waiting, median wait, reviewers active in last 30 days.
- Integrity panel: number quarantined, removed (by reason), takedowns received and resolved, similarity-flag rate.
- Contributor panel: distinct contributors, number of first-time contributors this month (no individual ranking).

Telemetry for "observed in the wild" requires opt-in. Send only code, module address, software id range and chassis label; never VIN. Opt-in default off. Privacy review needed.

Anti-gaming: raw submission counts are not coverage; a code counts as covered only at `published`.

### 9.7 Growth plan

Phase A (weeks 1 to 8, matches `data-strategy.md`): GitHub issue forms and PR templates as intake; pack linter and similarity helper; seeded entries from bus observation and induced faults; open the `needs a report` list.
Phase B (after about 50 contributors, per roadmap guess): in-app submission with the `fix_reports` table; review dashboard; opt-in observed-codes telemetry.
Phase C: trusted-submitter tier; quarterly audits; transparency report.

Targets are goals to be set by the owner using the weekly scoreboard (`decisions.md` item 3), not promises. I did not find precedent numbers for fault-code crowd contribution rates, so no forecast is made here.

## 10. Share-alike pack operations

- Directory and manifest: `packs/sa/obdb/` with `license: CC-BY-SA-4.0` in the manifest and an attribution string (the OBDb profile README supplies recommended credit wording; copy it from there).
- No entry in `packs/cc0` or `packs/cc-by` may reference or derive from SA content. CI rule: any file with a licence not in the pack's allowed list fails the build; a path-level check forbids SA files being read by the CC pack builders.
- Our own entries can be offered into the SA pack as well (CC BY into CC BY-SA is allowed), but not the reverse. Do this only if we want the SA pack to carry our content; otherwise keep it as OBDb-derived only.
- App behaviour: app can load multiple packs; where an SA pack changes a signal definition that we share, the changed file stays SA (as OBDb's README states for changed definitions). The rest of our code stays Apache-2.0.
- Legal check before first public release of the SA pack remains open (decisions item 1).
- Do not expect OBDb to give DTC meaning text. It gives commands and scalings; the SA pack is mainly a live-data win.

## 11. Anti-copying controls summary (what to build, in order)

1. Source ledger and mandatory source tag on every entry (cheap, immediate).
2. Rights attestation plus short contributor terms (inbound licence with relicensing room).
3. Tier A similarity check against open sets (about 2 days per `data-strategy.md` estimate; re-estimate).
4. Reviewer checklist and two-reviewer rule.
5. Quarantine and takedown path with a revocation list in the pack stream.
6. Tainted-reader rule: anyone who has read OEM or paid-portal text for a code does not author or review entries for that code. Add a self-declaration field on reviewer and submitter profiles ("I have read OEM text for this make: yes/no") that blocks authoring for that make. This is an honesty-based control; its legal value is a question for counsel.
7. Tier B fingerprints only if counsel agrees.
8. Rate limits and bulk caps (OSM and openpilot both warn about large dumps).

## 12. Risks and open decisions for the owner

| # | Decision | Recommendation |
|---|---|---|
| C1 | Inbound licence for text and facts | CC0 for facts, CC-BY 4.0 for authored text, with a relicensing clause; counsel review |
| C2 | Do we build Tier B hash fingerprints | Decide after counsel; default off |
| C3 | Telemetry opt-in for "observed codes" | Yes, opt-in, default off, code and module only |
| C4 | Public fix reports show submitter handle | Optional per user; default pseudonym |
| C5 | Takedown contact and agent | Set up a monitored mailbox now; agent registration per counsel |
| C6 | Who are the first two reviewers | Owner plus one trusted outsider; until then no promotion beyond candidate |

## 13. Sources

All fetched or queried 2026-11-20 unless stated.

| # | URL | What was used | Confidence |
|---|---|---|---|
| S1 | https://github.com/OBDb | org page: 897 repos, 663 followers, CC BY-SA, structure, how to request a repo | high |
| S2 | https://raw.githubusercontent.com/OBDb/.github/main/profile/README.md | org README: licence statement, attribution text, repo structure | high |
| S3 | https://api.github.com/orgs/OBDb | created 2022-12-20; 897 public repos; description | high |
| S4 | https://api.github.com/repos/OBDb/.github | licence CC-BY-SA-4.0 | high |
| S5 | https://raw.githubusercontent.com/OBDb/.vehicle-template/main/.github/workflows/presubmits.yml | JSON validation workflow against central schema | high |
| S6 | https://raw.githubusercontent.com/OBDb/.schemas/main/signals.json | schema keys; DTCs path name and ECU type enum | high |
| S7 | https://raw.githubusercontent.com/OBDb/BMW-3-Series/main/signalsets/v3/default.json | 122 commands, 243 signals, no DTC mentions | high |
| S8 | https://raw.githubusercontent.com/OBDb/Toyota-Corolla/main/signalsets/v3/default.json (and Mazda-3, Toyota-4Runner, BMW-i3, BMW-M3, Volkswagen-ID.4 equivalents) | DTC-path counts and field shapes | high for counts, medium for generalisation |
| S9 | https://raw.githubusercontent.com/OBDb/BMW-3-Series/main/README.md | contribution steps (fork, branch, PR) | high |
| S10 | https://api.github.com/repos/OBDb/BMW-3-Series (commits and contributors link headers) | 709 commits; about 3 contributors | medium |
| S11 | https://api.github.com/repos/OBDb/.meta/contents | branch protection and bulk-maintenance scripts exist | high |
| S12 | https://github.com/commaai/opendbc and https://api.github.com/repos/commaai/opendbc | MIT; stars, forks, dates; contributor count via link header | high / medium |
| S13 | https://raw.githubusercontent.com/commaai/opendbc/master/README.md | contribution coordination, porting guide, safety model | high |
| S14 | https://raw.githubusercontent.com/commaai/opendbc/master/docs/CAR_PORTING_CHECKLIST.md | porting evidence checklist | high |
| S15 | https://raw.githubusercontent.com/commaai/opendbc/master/.github/pull_request_template.md | dongle ID and route validation | high |
| S16 | https://github.com/commaai/opendbc/blob/master/docs/CARS.md | "405 Known Cars"; support tiers | medium (page-summary tool) |
| S17 | https://raw.githubusercontent.com/commaai/openpilot/master/docs/CONTRIBUTING.md | merge rules, bounties | high |
| S18 | https://api.github.com/repos/commaai/openpilot | MIT; stars, forks; description 300+ cars | high |
| S19 | https://en.wikipedia.org/wiki/Wikipedia:Copyright_violations | detection tools, handling, repeat infringers, owner route | high |
| S20 | https://en.wikipedia.org/wiki/Wikipedia:Verifiability | cite-or-remove, source quality | high |
| S21 | https://en.wikipedia.org/wiki/Wikipedia:Pending_changes | review gate, reviewer right | high |
| S22 | https://en.wikipedia.org/wiki/Wikipedia:Statistics | about 7.27 million articles (7,267,103 on re-read); user counts | medium |
| S23 | https://wiki.openstreetmap.org/wiki/Import/Guidelines | import consultation and licence rules | high |
| S24 | https://wiki.openstreetmap.org/wiki/Open_Database_License | licence move 12 Sep 2012; about 1% data loss | high |
| S25 | https://osmfoundation.org/wiki/Licence/Contributor_Terms | contributor warranties; licence grant; allowed licences | high |
| S26 | https://wiki.openstreetmap.org/wiki/Data_working_group | complaints, redaction, blocks | high |
| S27 | https://wiki.openstreetmap.org/wiki/Key:source | source tag guidance | high |
| S28 | https://wiki.openstreetmap.org/wiki/Stats | user and node figures | medium |
| S29 | https://www.ifixit.com/Info/Terms_of_Use | inbound grant, CC BY-NC-SA reuse, AI-training bar, DMCA process | high |
| S30 | https://repology.org/docs/about | what Repology is; rules; hourly update; GPLv3+ code | high |
| S31 | https://repology.org/repositories/statistics | about 336,786 projects; 5,104,164 packages (live) | medium (page truncated) |
| S32 | https://docs.weblate.org/en/latest/workflows.html | suggestions, reviewer roles, states, access control | high |
| S33 | https://www.wikidata.org/wiki/Wikidata:Licensing | CC0 policy, avoid non-CC0 datasets | high |
| S34 | https://creativecommons.org/faq/ | BY into BY-SA allowed; CC0 is a dedication; 4.0 covers database rights | medium (first 100,000 characters read) |
| S35 | https://www.youcanic.com/submit-a-car-fix/ | fix-report field list; no licence shown | medium |
| S36 | https://www.mycarly.com/obd-codes/community/ | no community fault-code features shown | medium |
| S37 | Web search results (query: user submitted OBD fault code database ...), including workshopdata.us, faultfinder.pages.dev, huggingface.co mechanicdb sample, vehicleservicepros OBDFix item, Identifix claim in snippet | existence of commercial and informal libraries; Identifix 50M+ claim | low |
| S38 | In-repo: `docs/plan/data-strategy.md`, `docs/design/data-schema.md`, `docs/plan/decisions.md` | existing rules referenced | high |

## 13b. Addendum: repository facts collected after the rate limit cleared (2026-11-20)

| Project | Licence (GitHub API) | Stars | Forks | Created | Last push | Source | Confidence |
|---|---|---|---|---|---|---|---|
| WeblateOrg/weblate | GPL-3.0 | 6,176 | 1,388 | 2012-02-27 | 2026-11-20 | https://api.github.com/repos/WeblateOrg/weblate | high |
| repology/repology-updater | GPL-3.0 | 589 | 244 | 2016-09-12 | 2026-11-20 | https://api.github.com/repos/repology/repology-updater | high |

Note: these are the tools' code licences, not the licence of data held in them. Contributor counts for both remain uncollected.

## 14. Gaps (what I did not get)

- **PARTIAL run.** GitHub API rate limit reached mid-run; Repology and Weblate contributor counts were not collected (licence, stars and forks were added in 13b).
- OBDb: total contributors across 897 repos; full-org DTC content count (only 6 repos sampled); whether Mercedes and Lexus repos exist (listing was partial); takedown handling; any similarity or licence-attestation workflow beyond the templates I read; what "response tests" check.
- OSM: reason for CC BY-SA to ODbL (the OSMF FAQ URL returned 404; the wiki page did not state reasons); current ways and changesets counts.
- Wikipedia: Wikimedia Foundation takedown counts (redirected; not read); active-editor total with a stated month.
- iFixit: community page returned 404; no review, reputation or growth numbers. Weblate: reviewing page 404; no growth numbers.
- Wikidata: contributor counts and growth not collected. Mozilla-style or Wikidata-style dispute processes not studied.
- No time-series growth for any project; cannot state growth rates.
- User-submitted fault-code libraries: only search results and two landing pages; terms of service and licence for YOUCANIC, MyCarly, AutoCodes, OBDFix, Identifix not read. No open library of community fix reports found.
- Counsel questions unanswered (all unverified): whether hash-only fingerprints of commercial text are safe to create and ship; whether a designated agent is needed; enforceability of an honesty-based tainted-reader declaration; whether an inbound relicensing clause is sufficient.
- No fetch of the CARB or SAE text; no check whether any DTC meaning set is covered by database rights in the EU for our planned use (unverified).
- Design thresholds (similarity scores, bulk caps, reputation numbers, response times) are not researched; they must be tuned on real submissions.
