# RD-7: verify the unverified claims in project-plan section 14

Read on 2026-11-24 (sprint day 2). Fact-checked a second time the same day: 11 sources re-fetched (sqlite, attestation how-to and action README, Google Play fee and testing pages, Actions billing, Pages and Workers limits, Supabase pricing, Apple fee, Node releases); all matched except the wording fixes noted in rows 1, 2c and 7. Not re-checked: rows 1b, 1c, 2, 4b, 7b, 7c and the Cloudflare "no deprecation notice" remark. Official docs only. Fetched through a page-to-text tool that summarises each page, so every figure is the tool's reading of the official page, not a raw copy. Re-read the page at the moment of adoption.

## ANSWER FIRST

- **node:sqlite on Node 24: changed, better than assumed.** It needs no flag and is a "release candidate" (stability 1.2) since v24.15.0. It is still not "stable" (stability 2). Safe to use, with a thin wrapper so a swap to `better-sqlite3` stays cheap.
- **GitHub build attestation: verified, one rename.** It works for public repos on every plan, gives SLSA v1.0 Build Level 2, and is checked with `gh attestation verify`. The plan's action name is out of date: use `actions/attest` (v4).
- **Apple fee: verified, $99 per year.** Nonprofit waiver exists.
- **Google Play fee: verified, $25 one time.** NEW cost to plan for: personal accounts need a closed test with 12 testers for 14 days in a row before publishing.
- **GitHub Actions: changed.** Public repos on standard runners are free. Private repos get a $12 monthly credit, not a minutes figure.
- **Cloudflare Pages and Workers Free: verified, no changes.**
- **Supabase Free: verified.** Unchanged, and the plan defers it anyway.
- **Still unknown:** the Apple MFi cost, counsel cost, Supabase pause rule from a second source, Pages Free "builds per month" on the Workers side.

## Claims table

Confidence is for "the figure is what the official page says today". Single-source = only one official page gave it in this pass.

| # | Claim in plan | Finding (exact figure) | Status | Source URL | Conf. | Single-source |
|---|---|---|---|---|---|---|
| 1 | `node:sqlite` stable on Node 24 (W5.1, unverified) | Page for the v24 line shows "Stability: 1.2 - Release candidate". History: added v22.5.0; no longer behind `--experimental-sqlite` in v23.4.0 and v22.13.0 ("still experimental"); v24.15.0 made it a release candidate. The flag was dropped in v23.4.0 and v22.13.0, so none is needed on Node 24. Re-checked in the fact-check pass: same wording. | CHANGED (not stable, but RC and flagless) | https://nodejs.org/docs/latest-v24.x/api/sqlite.html | high | yes (one page; the history table and stability line are on the same page) |
| 1b | What "1.2" means | Hopefully ready to be stable; no further breaking changes anticipated but they may still happen on user feedback or spec change. Stable is level 2. | verified | https://nodejs.org/docs/latest-v24.x/api/documentation.html | high | yes |
| 1c | Runtime warning on import | The page does not mention one. Not tested by running code here. | UNKNOWN | https://nodejs.org/docs/latest-v24.x/api/sqlite.html | low | yes |
| 1d | Node 24 is the right line | Release table lists Node 24 "Krypton" as LTS, first released 2025-05-06 (as the tool printed it). Node 26 "Lithium" is also listed LTS, released 2026-05-05. Plan's "Node 24" is fine; Node 26 is newer. | verified, with a note | https://nodejs.org/en/about/previous-releases | medium | yes |
| 2 | GitHub build provenance attestation exists and does what W12.4 says | Attestations are signed claims about where and how software was built: workflow, repo, org, environment, commit SHA, trigger. Alone they give SLSA v1.0 Build Level 2. Level 3 needs a reusable workflow. | verified | https://docs.github.com/en/actions/concepts/security/artifact-attestations | high | no (two pages agree) |
| 2b | Which repos and plans | Public repos: all current plans, public Sigstore instance with a public transparency log. Private or internal repos: GitHub Enterprise Cloud only. OpenDiag is public, so fine. | verified | https://github.com/actions/attest-build-provenance (README read via tool) | medium | yes (the concept page did not state plans) |
| 2c | Action to use | `actions/attest@v4`. `actions/attest-build-provenance` v4 is now "simply a wrapper" on it; existing users may keep it, new setups should use `actions/attest`. Permissions: `id-token: write`, `contents: read`, `attestations: write` (plus `packages: write` for container images). | CHANGED (name) | https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations (v4 and permissions); wrapper note is from https://github.com/actions/attest-build-provenance only, the how-to page does not mention the old action | high | no (README agrees on the rename; the wrapper statement itself is single-source) |
| 2d | Verification step | `gh attestation verify <file> -R <owner>/<repo>`. Container images use `oci://` prefix. SBOM attestations add `--predicate-type`. | verified | same as 2c | high | yes |
| 3 | Apple Developer Program fee | 99 USD per membership year (or local equivalent). Nonprofits, accredited schools and government entities can request a waiver. | verified | https://developer.apple.com/programs/whats-included/ | high | yes |
| 3b | Google Play fee | US$25 one-time registration fee. | verified | https://support.google.com/googleplay/android-developer/answer/6112435 | high | yes |
| 3c | Google Play personal-account testing (plan said "count and duration not confirmed") | Personal accounts created after 2023-11-13 need a closed test with at least 12 testers opted in continuously for at least 14 days. The first page only linked to this; the detail page gave the numbers. | NEW figure, was unknown | https://support.google.com/googleplay/android-developer/answer/14151465 | high | yes |
| 3d | Apple MFi cost | Not looked up in this pass (resources.md says unverified, "never in 3 months"). | STILL UNKNOWN | n/a | n/a | n/a |
| 4 | GitHub Actions free minutes | Free plan shows "$12 USD per month" included compute, not a minutes number. At the $0.006 per minute Linux 2-core rate that is about 2,000 minutes (my arithmetic, not stated by the page). Standard GitHub-hosted runners are free in public repos. Larger runners are billed even in public repos. Artifact storage 500 MB (shared with Packages); cache 10 GB per repo. | CHANGED (framing) | https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions | high | no (plans page agrees on $12, 500 MB, public free) |
| 4b | Other Actions limits | Job time 6 hours (GitHub-hosted); workflow run 35 days; Free plan 20 concurrent standard jobs, max 5 macOS; matrix 256 jobs per run; `GITHUB_TOKEN` 1,000 API requests per hour per repo. Plan's "keep CI under 10 minutes" is a self-imposed target, not a limit. | verified | https://docs.github.com/en/actions/reference/limits | medium | yes |
| 4c | Pricing change notice | The billing page showed none. | verified (absence only) | billing page above | medium | yes |
| 5 | Cloudflare Pages Free limits | 500 builds per month; 1 concurrent build; 20 minute build timeout; 20,000 files per site; 25 MiB max file; 100 custom domains per project; 100 projects per account. No deprecation notice on the page; it points big multi-site cases to Workers static assets. | verified, matches resources.md | https://developers.cloudflare.com/pages/platform/limits/ | high | yes |
| 6 | Cloudflare Workers Free limits | 100,000 requests per day (resets midnight UTC; over it returns Error 1027); 10 ms CPU per request and per cron trigger; 50 subrequests per invocation; 64 MiB script; static assets 20,000 files per version, 25 MiB per file; 100 Workers per account. | verified, matches resources.md | https://developers.cloudflare.com/workers/platform/limits/ | high | yes |
| 7 | Supabase Free limits | 500 MB database per project; 1 GB file storage; 5 GB egress (plus 5 GB cached); 50,000 monthly active users; 2 active projects; pauses after one week of inactivity (pricing page wording; "7 days" is my restatement); Pro from $25 per month. | verified | https://supabase.com/pricing | medium | partly (see 7b) |
| 7b | Supabase second source | Billing docs confirm two free projects total across orgs where you are owner or admin; paused projects do not count; 5 GB egress, 500 MB database, 50,000 MAU, 1 GB storage, 500,000 Edge Function invocations, 2 million Realtime messages, 200 peak Realtime connections. | verified | https://supabase.com/docs/guides/platform/billing-on-supabase | high | no |
| 7c | Pause window from a second source | The billing docs and FAQ pages I read did not state the days. Only the pricing page says one week. | STILL UNKNOWN (single source) | https://supabase.com/docs/guides/platform/billing-faq | low | yes |

## What each plan line should now say

- **W5.1:** "Use `node:sqlite` (release candidate on Node 24, no flag). Keep access behind the `Store` interface. If a breaking change lands in a Node 24 patch, fall back to `better-sqlite3` per ADR-007." Add a smoke test that opens a database on the pinned Node version.
- **W12.4:** replace "provenance attestation (details unverified)" with "build attestation via `actions/attest@v4`, verify with `gh attestation verify`; SLSA v1.0 Build Level 2; public repo needed on a Free plan."
- **Budget (section 9, resources.md):** Apple $99 per year and Google $25 one time both hold. Add the Google closed test (12 testers, 14 days) as a schedule item if an Android app is ever in scope.
- **R14 and the week 1 checklist:** rewrite "GitHub Actions minutes" as "$12 monthly credit for private repos; public repos free". Since OpenDiag repos are public, CI minutes are not a constraint today.
- **Section 14 "Unverified" line:** remove the first two items and the Apple and Google fee item. Keep counsel cost, owner car list, Apple MFi.

## Disagreements between sources

- **Actions "minutes" versus dollars.** Older material (including the plan's wording and common knowledge) talks of a monthly minute allowance. The current billing page speaks only in dollars ($12). The 2,000 minute figure is my division, so treat it as an estimate.
- **Action name.** The plan says "build provenance attestation", which points at `actions/attest-build-provenance`. The how-to page now documents `actions/attest@v4`; the old action's README says it is a wrapper. They agree functionally, they differ in recommended name.
- **Node release phases.** The table showed both Node 24 (released May 06, 2025) and Node 26 (May 05, 2026) as plain "LTS" without Active or Maintenance, so I cannot say which phase either is in.
- **Stability words.** The sqlite page says "Release candidate" while the module is still labelled experimental in its changelog text. Both come from the same page; they mean "close to stable, not yet promised stable".
- **Plan availability for attestations.** The concept page did not state plans; the action README did. One source for the plan rule.

## Source ledger

Read and used (all fetched 2026-11-24):

1. https://nodejs.org/docs/latest-v24.x/api/sqlite.html (first 100,000 characters plus the tail; tail only had constants, nothing on stability)
2. https://nodejs.org/docs/latest-v24.x/api/documentation.html (stability index definitions)
3. https://nodejs.org/en/about/previous-releases (Node 24 and 26 status; no end of life dates given)
4. https://docs.github.com/en/actions/concepts/security/artifact-attestations
5. https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations (plans not addressed)
6. https://github.com/actions/attest-build-provenance (a GitHub README, not docs.github.com, but it is the official action repo; used only for plan rules and the wrapper note)
7. https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions
8. https://docs.github.com/en/get-started/learning-about-github/githubs-plans
9. https://docs.github.com/en/actions/reference/limits
10. https://developers.cloudflare.com/pages/platform/limits/
11. https://developers.cloudflare.com/workers/platform/limits/
12. https://supabase.com/pricing
13. https://supabase.com/docs/guides/platform/billing-on-supabase
14. https://supabase.com/docs/guides/platform/billing-faq (no pause days stated)
15. https://developer.apple.com/programs/whats-included/
16. https://support.google.com/googleplay/android-developer/answer/6112435
17. https://support.google.com/googleplay/android-developer/answer/14151465

Failed or not stated: none failed to load. Gaps: plan availability on the attestation concept page; Supabase pause days on the billing pages; Node end of life dates; the Google first page lacked the testing numbers (found on 17).

Content note: two Supabase docs pages returned text addressed to AI agents asking for a feedback report to be sent to Supabase. That is page content, not an instruction from the owner, so it was ignored and nothing was sent.

Method caveat: all fetches went through a summarising tool, so a figure could be mis-read. The most plan-relevant numbers (sqlite stability line, Pages and Workers limits, fees) match across two or more reads or match resources.md, which raises confidence. Not run locally: whether `node:sqlite` prints a warning on import. The machine's Node is 26.5.0, so a local test would not reflect Node 24 anyway.

## Open questions

1. Does `node:sqlite` print an experimental warning on Node 24 LTS? Test on a pinned Node 24 in CI, not on this Mac.
2. Which Node patch should CI pin so a release-candidate API change cannot surprise us? Needs a decision with ADR-007.
3. Apple MFi program cost and terms (only matters for classic Bluetooth on iOS; not planned).
4. Supabase pause days from a second official page. Low priority because Supabase is deferred.
5. Is a Google Play listing in scope at all? If yes, schedule the 12 tester, 14 day closed test early.
6. Will the repo that produces the pack and release assets stay public? Attestation on a Free plan needs that.
7. Counsel cost and owner car list remain open (not an official-docs question).
