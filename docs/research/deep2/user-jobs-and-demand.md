# User jobs and demand: who uses coding and diagnostic tools, and for what

Research for OpenDiag, written 2026-11-20. Scope: segments (enthusiasts, DIY owners, small shops, tuners, used-car buyers), the jobs they hire tools for, a ranking of those jobs with evidence, which jobs need writes and which are read-only, and what could ship read-only in the 12-week window (Mon 2026-11-23 to Fri 2027-02-12).

Status of this document: **mostly complete, with named partial areas** (see Gaps). Unlike the earlier deep docs, search and fetch worked this time, and I could reach public YouTube pages (search results, view counts, and the top comments of seven videos). I could not reach Reddit, Bimmerpost (HTTP 403 on every thread I tried), Google Trends, or Google Play store counts. Those holes are marked PARTIAL where they matter.

## Executive summary

1. **The jobs people actually hire a tool for are small and specific, not "coding" in general.** The loudest are: turn off auto start-stop, register a new battery, reset a service or brake light, unlock a handful of hidden options (ambient light, digital speedo, mirror fold, full-screen CarPlay), and read a warning light. Evidence: view counts, top comments, app reviews.
2. **Start-stop and battery registration are the two clearest single-job purchases.** Start-stop top video: 279,809 views; its comment sample is mostly "how do I do this on my model" (38 of 60 comments contain a question). Battery registration top video: 448,154 views, and its comment sample is mostly anger at having to do it and arguments about whether it is needed. [high for demand, medium for ranking]
3. **Almost every top job is a write.** Of the ten ranked jobs below, only three are fully read-only (fault reading, pre-purchase scan, datalogging). Two more can be served read-only as a "show me the current setting" view.
4. **Demand for read-only jobs is real but looks lower-intensity in this data.** Tool-specific BimmerLink fault-code videos reach 105k to 188k views; generic "scan before you buy a used car" videos reach 135k to 492k; BMW-specific pre-purchase scan videos are almost unwatched (under 500 views each in the results I saw). [medium]
5. **Used-car buyers are a large but unfocused audience, not a BMW-coding audience.** A vendor survey says 72% of recent used-car buyers had no third-party inspection (2017, vendor-sponsored, sample not stated). Readiness-monitor checking is the one trick every source repeats. [low-medium]
6. **Small shops are not our users.** Independent BMW shops get ISTA through BMW's own aftersales program with an ICOM or J2534 pass-thru, or buy tools in the thousands of dollars. They need programming, which is out of scope. [medium]
7. **Search-interest data is thin.** No Google Trends series reachable. Wikipedia page views for OBD topics fell roughly 45% to 70% between Jan 2023 and Oct 2026 (re-checked against the statistics service on 2026-11-20), which is almost certainly a general reading-habit change, not a collapse in car-diagnostics interest. [low as demand evidence]
8. **Read-only in 12 weeks can honestly cover:** whole-car fault read, live data and logging, a pre-purchase report, a battery and start-stop "why is this happening" read, and verified snapshots of current coding. It cannot deliver the top-ranked jobs themselves.
9. Biggest unproven assumption: that a read-only tool earns enough trust and use to be the "second tool" next to BimmerCode. This research gives no direct evidence for or against it.

---

## 1. What I read and how far to trust it

### 1.1 Evidence types and reliability

| Type | What I got | Reliability | Caveat |
|---|---|---|---|
| YouTube public search pages (view counts, publish age, channel) | Ranked results for about 50 queries across jobs | Medium-high for relative size; counts are lifetime, so old videos are inflated | Search ranking is YouTube's own relevance, not a demand count. Age matters: a 6-year-old video has had 6 years to collect views. |
| YouTube comments (top-sorted sample) | Up to 60 comments on each of 7 videos, fetched with a public command-line tool | Medium | Sample is "top" sorted (likes), capped at 60. Tallies below are my own keyword counts, not full-thread counts. |
| App store listings (iOS) | Ratings, rating counts, prices, feature lists, 3 to 4 review snippets | Medium | Rating count is a rough proxy for paying users. Review snippets are single voices. |
| Trustpilot | OBDeleven score and complaint themes | Medium | Self-selected reviewers; skews to complaints and refunds. |
| Forum threads | One E60 thread fetched in full detail; several others seen only as search-result snippets | Low-medium | Bimmerpost and similar returned 403. Most forum claims here are search-snippet level, marked "snippet". |
| Vendor blogs and listings | Pre-purchase checklists, battery registration guides, coding shop prices | Low-medium | All sell something. Used for job descriptions and prices, not for demand. |
| Surveys | DIY repair and used-car inspection stats | Low | Company-sponsored, often undated, method not shown. |
| Wikipedia page views | Monthly counts for 5 related articles, pulled straight from the public statistics service | High for the numbers, low for what they mean | Interest in encyclopedia pages, not tool demand; Wikipedia traffic has declined broadly. |

### 1.2 What was not reachable

- Reddit: the fetch returned a web page shell, not data. No subreddit was read. [PARTIAL]
- Bimmerpost and its sister sites: 403 on every thread I tried. I only have search-result snippets of a handful of threads.
- Google Trends: no series available through search or fetch. [PARTIAL]
- Google Play: listing pages returned only navigation text. No Android download counts. [PARTIAL]
- Keyword-volume tools (ad planners, paid SEO tools): not available.
- OBDeleven's own comparison page: 403.

### 1.3 Method for the YouTube data

- I ran about 50 searches on the public YouTube search page, one per job, and recorded the first 6 to 12 results.
- Each row below says what the video is, its lifetime view count on 2026-11-20, and its approximate age.
- Read these as "how large is the audience for videos about this job", not "how many people did this job". A single viral video (for example a 4.6 million view "hidden features" video) can swamp a topic.
- For comments I took the 40 to 60 top-sorted comments from seven videos and counted how many contained a question mark and how many talked about the commenter's own car. That is a rough "people asking for help" signal.

---

## 2. Segments: who actually uses these tools

I keep the earlier plan's segment names where they exist (S1 to S6 in `docs/plan/direction.md`) and add the two it lacked (tuners as their own group, and used-car buyers).

| Segment | What they do | Evidence from this run | Confidence | Target for OpenDiag? |
|---|---|---|---|---|
| **Enthusiast coder** (BMW, MINI, Supra) | Buys BimmerCode once, codes options on their own car, shares tips | 22K iOS ratings for BimmerCode at $49.99 [S3]; top "how to use BimmerCode" video 1,008,958 views [S20]; 4.6M view "hidden features" video [S23] | high | **Yes, as the second tool** |
| **DIY maintainer** | Changes battery, brake pads, oil; needs a reset or registration afterwards | Battery registration videos 448k, 263k, 71k views; brake/service reset videos 117k to 1.19M [S24 to S29]; BimmerLink listing sells the same jobs [S4] | high | Yes for reads; writes out of window |
| **Cost-resentful user** | Annoyed at paying for hardware, credits or a dealer fee for a one-line job | Battery video comments (168 likes on one saying a local person does it for $20; others call it "money making") [S31]; OBDeleven credit complaints [S9] | high | Yes, through licence and no credits |
| **Tuner** (bootmod3, MHD, xHP) | Flashes maps and reads datalogs | Datalog how-tos 27k to 84k views [S36]; Boostline overlap per earlier docs | medium | Read-only logs only |
| **Used-car buyer** | Wants to know if a car has hidden faults before paying | Generic scan-before-you-buy videos 29k, 135k, 492k [S32 to S34]; vendor survey 72% no third-party inspection [S12] | medium-low | Possible read-only wedge, unproven |
| **Independent shop** | Needs OEM-grade diagnostics and programming | ISTA via BMW's aftersales program for independents; Bosch M-VCI; a multi-brand tablet at $3,795 retail [S13 to S15] | medium | **No** |
| **Other-brand DIYer** (Toyota, Mercedes) | Customises settings, disables start-stop, resets TPMS | Techstream demo videos 477k, 148k; Mercedes start-stop video 82k [S40 to S42]; forum jobs list [S16, S17] | low-medium | Not in 12 weeks |

### 2.1 Enthusiasts and DIY mechanics (the core)

What they say they want, from comment samples and app reviews:

- Fix one irritation fast. CORRECTED after fact-check: the claim that reviewers bought BimmerCode mainly for start-stop is UNVERIFIED. The only start-stop review visible on the fetched listing (Dec 2024) says the reviewer could not turn start-stop off and worked around it by setting the start-up drive mode; it does not say they bought the app for that. The full review set is not visible [S3].
- Avoid the dealer fee. The most-liked comment on the 448k-view battery video says the "fraction of the cost" claim fails when a local person charges $20 [S31].
- Understand whether a thing is needed. 37 of 60 comments on that battery video contain a question, and many ask whether registration applies to their specific year or battery type [S31].
- Get one app to do everything. A top comment on the BimmerLink walkthrough (47 likes) objects to having to buy a separate app for coding, calling it "double dipping" [S35].

### 2.2 Tuners

- Evidence of the tuner audience is indirect: how-to videos for bootmod3 datalogging reach 27k (vendor channel, 3 years old) to 84k views (4 years old) [S36].
- The earlier deep docs already established that logs stay inside the tuners' own apps and that Boostline (MIT, TypeScript) overlaps. This run adds no new tuner-specific demand data beyond those view counts. [medium-low]
- Tuners need an adapter that the tuner app is not already using, so a second tool during a flash session is unlikely. Read-only logging while driving is plausible.

### 2.3 Used-car buyers

What the sources say they should do with a scan tool:

- Check whether codes are confirmed, pending or permanent, and read the freeze-frame snapshot [S10, vendor].
- Look at readiness monitors: several "Not Ready" can mean codes were recently cleared [S10, S11].
- Scan all modules, not only the engine, and check the VIN stored in the computer against the windshield [S10].
- Save the report before clearing anything [S10].
- Do not clear codes on a car you do not own [S11].

What the comments add (on a 134,900-view video by a repair shop and a 29,249-view video):

- The "readiness monitors" trick is the one that readers say they already use (42 likes on the top comment of the 135k video) [S33].
- Another reader says "miles driven since code clear" is a useful number to look at (13 likes) [S33]. Not verified by me as available on all cars.
- A viewer on the 29k video asks how to use a scan tool to see if the mileage is correct [S34]. That question is unanswered in the sample, which hints at demand for a mileage cross-check, but it is one comment.
- A vendor-written review (search-result snippet only) says Carly offers a mileage check across modules and treats it as a paid feature [S19]. I did not verify this on Carly's own site. [low]

Size of the audience: an inspection vendor's survey of used-car buyers found 72% had no third-party inspection and 76% did not know such a service existed (published 5 July 2017 by YourMechanic, a company that sells mobile mechanic services; the release says the 72% and 76% come from a second survey of people who bought within the last three years, and gives no sample size for it; the 522-respondent sample belongs to a different, lemon-car survey) [S12]. Separately, a used-car-warranty company's survey found 42% of buyers wished they had done a mechanic inspection [S21, snippet]. These are not neutral.

### 2.4 Small shops

- BMW's own aftersales online system exists for independent workshops and connects through the ICOM interface or a J2534 pass-thru tool [S13, snippet]. A repair-trade write-up recommends ISTA with ICOM interfaces or J2534 with a 20-pin adapter for independents who want to be competent on BMW [S13, snippet].
- Bosch announced its M-VCI tool now supports BMW's ISTA application for the aftermarket (trade article dated 1 Jan 2020, fetched and read; old, so current status unknown) [S14].
- A multi-brand tablet scanner is listed at $3,795 by a retailer [S15, snippet].
- None of this suggests shops want a free read-only tool. They need programming and guided tests. This matches the earlier plan's decision that shops are not a target.

### 2.5 DIY prevalence (background, low confidence)

- A 2025 company-run survey of 1,003 car owners reports that 71% had tried to repair a vehicle rather than use a mechanic. That is attempted repairs, not routine upkeep [S22, snippet].
- A US survey reports only about 36% can do an oil change on their own [S22, snippet].
- A 2024 UK survey (YouGov) found a third of the over-55s say they do no DIY maintenance, against about a quarter for younger groups [S22, snippet].
- These numbers say DIY is a sizeable minority and varies by task. They tell us nothing about BMW coding specifically.

---

## 3. Jobs to be done: the evidence behind the ranking

A job here is something a person hires a tool for. For each, I record the strongest video evidence (view counts from the public search pages), comment signals where I read them, app and review evidence, and commercial signals (people charging money).

### 3.1 Evidence table by job

Views are lifetime counts seen on 2026-11-20 from the public search page. "Top 3" are the top three results by views among the first 6 to 12 returned for the query, not a complete census.

| Job | Query used | Top video views (age) | Other signals |
|---|---|---|---|
| Disable auto start-stop (BMW) | "bmw disable auto start stop" | 279,809 (6y); 77,577 (2y); 73,711 (6y); 73,675 (6y); 67,478 (3y) [S25] | 38 of 60 top comments contain a question; many say their model or year does not work; BMW USA published an official "how to" video with 22,636 views [S25, S26] |
| Disable start-stop (Mercedes) | "mercedes disable start stop coding" | 82,630 (1y); 27,280 (1y) [S41] | A forum guide thread reports the same session also changed the speed limiter and the seatbelt warning [S17] |
| Battery registration | "bmw battery registration" | 448,154 (6y); 263,295 (6y); 71,317 (6y); 55,727 (2y); 45,337 (5y) [S31] | Tools shown: BimmerLink, MHD, Foxwell, Ancel, a budget store-brand scanner, Autel. 37 of 60 top comments contain a question |
| Service / brake / oil reset | "bmw service reset oil light" and "brake pad ... reset" | 554,368 (5y); 356,028 (8y); 278,679 (4y); 1,186,452 (12y, brake light reset) [S27 to S29] | Most of these resets are done in the car's own menu with no tool; so views overstate tool demand |
| "Hidden features" coding (bundle) | "bmw hidden features coding" | 4,612,626 (4y); 1,254,056 (6y); 191,278 (6y); 177,374 (3y) [S23] | Includes ambient light, digital speedo, mirror fold, DRL; top comment pattern is "does this work on my car" |
| Ambient lighting coding | "bmw ambient lighting coding" | 437,117 (7y); 122,875 (3y); 82,173 (5y) [S43] | Often the first example in "top 10" lists |
| Auto mirror fold coding | "bmw mirror fold coding" | 1,237,901 (9y, BMW USA); 108,967 (7y); 49,748 (5y) [S44] | The biggest hit is the official BMW video; counts mix tool and no-tool methods |
| Full-screen CarPlay coding | "bmw apple carplay full screen coding" | 130,119 (4y); 116,607 (2y); 91,975 (4y); 38,781 (3y) [S45] | A forum thread says one tool cannot do it on some software versions (snippet) [S18]; sellers charge for it |
| CarPlay hardware retrofit | "bmw carplay retrofit" | 2,487,998 (6y); 278,240 (5y); 153,579 (1y) [S46] | Hardware retrofit, not pure coding; shows the retrofit-coding market is large |
| Video in motion | "bmw video in motion coding" | 97,134 (7y); 60,245 (7y); 49,461 (5y); 41,067 (5y) [S47] | Coding shop charges $25 per car [S7]; an i4 owner video says no coding is needed on iDrive 8.5 (25,998 views) |
| Read fault codes (BMW-specific) | "bmw check engine light read codes bimmerlink" | 188,102 (5y); 151,587 (4y); 105,573 (6y); 55,602 (5y) [S35] | BimmerLink listing: 4.7 stars, about 9.9K ratings, full version $39.99 [S4] |
| Read codes before buying (generic) | "obd2 scanner before buying used car" | 491,912 (5y); 134,900 (1y); 29,249 (1y); 9,215 (2y) [S32 to S34] | Comments: readiness monitors, "scan before you buy" |
| BMW-specific pre-purchase scan | "bmw pre purchase inspection obd scan" | The only dedicated results were a single inspection firm's videos, each under 500 views [S48] | Near-zero demand visible through YouTube; may reflect that people search differently |
| Full diagnostic software (ISTA) | "bmw ISTA install tutorial" | 435,529 (6y); 353,049 (5y); 267,966 (3y); 159,046 (1y) [S37] | Comments are mostly requests for coding and repair help, plus questions about hardware and PC specs |
| Datalogging (tuned cars) | "bmw m340i bootmod3 datalog" | 84,094 (4y); 70,685 (6y); 32,198 (3y); 27,082 (3y, vendor) [S36] | Tuner-owned apps; read-only |
| Speed limiter / speed warning | "bmw speed limiter remove coding" | 70,122 (1y, not BMW-specific); 55,294 (3y); 15,771 (2y) [S49] | Legal edge (see section 7) |
| Digital speedometer | "bmw digital speedometer coding" | 113,140 (6y, no coding); 60,939 (8y); 32,812 (5y) [S50] | Several results say no coding needed |
| Toyota customisation (Techstream) | "toyota techstream customize settings" | 477,348 (11y); 148,325 (3y); 112,911 (8y); 102,819 (5y) [S42] | Forum jobs list: turn off daytime lights, TPMS reset, key fob, key programming [S16] |
| Supra (BimmerCode) | "toyota supra bimmercode" | 112,007 (5y); 30,834 (3y); 23,964 (6y) [S51] | Same app, same jobs, smaller audience |
| ISTA and "do I need it" | see ISTA row | See above | Not a job, a symptom: people want ISTA-class capability without the install |

### 3.2 What the comments say (my own tallies)

| Video | Views | Sample | Comments with a question mark | Comments mentioning the commenter's own car | Pattern I saw |
|---|---|---|---|---|---|
| Start-stop bypass, a BMW dealership's video [S25] | 279,809 | 60 | 38 | 24 | "How do I do this on my [model]"; a 2021 330e still stops in comfort; many want it off permanently in every mode; one says they cancelled a test drive after learning it exists |
| BMW battery registration, vendor video [S31] | 448,154 | 60 | 37 | 32 | Anger at the requirement; disputes over whether a same-spec battery needs it; some report faults after skipping it (unverified) |
| "Code these features on your G20" [S23-linked] | 205,393 | 60 | 27 | 12 | Many replies correct the creator (some items are already in iDrive settings); failed connection reports; adapter questions |
| BimmerLink walkthrough [S35] | 188,102 | 40 | 16 | 13 | Adapter "not compatible with my car"; connection timeouts; "why a separate app"; request for a battery-registration demo |
| ISTA+ tutorial [S37] | 159,046 | 40 | 24 | 12 | Requests for coding and repair help, hardware questions, "where do I get it" |
| Scan before buying used (small channel) [S34] | 29,249 | 23 | 7 | 4 | Praise; "what do I do if pending codes show up"; mileage check question |
| Scan before buying used (repair shop) [S33] | 134,900 | 40 | 2 | 12 | Shop owners and dealers agree; "readiness monitors" is the favourite trick |

How to read this: the start-stop and battery videos are help-seeking threads (more than half the sampled comments are questions). The used-car video is a lecture (almost no questions). That is consistent with start-stop and battery registration being active jobs and used-car scanning being an awareness topic.

### 3.3 App-store and review evidence

| App | Store data | What it tells us |
|---|---|---|
| BimmerCode (iOS, US) | 4.7 stars, 22K ratings, full version $49.99, motorcycle add-on $19.99 [S3] | Largest paying coding audience in this set. One review says changing a footwell-module setting stopped the two main brake lights working, leaving only the centre third brake light (Nov 2019, MINI Clubman owner, reported three times; single anecdote) [S3] |
| BimmerLink (iOS, US) | 4.7 stars, about 9.9K ratings, full version $39.99, CarPlay add-on $9.99 [S4] | Fewer ratings than BimmerCode (about 45%), so diagnostics-and-resets sells less than coding on this one measure. Listed features: read and clear codes in all modules, live data with CSV logging, battery registration, service resets, parking-brake service mode, ZF 8HP adaptation values |
| OBDeleven (Trustpilot) | 3.9 of 5, 4,508 reviews, 60% five-star, 16% one-star [S9] | Main complaints: credits taken when a function fails, vehicles not recognised, slow support, features gone after updates |
| Carly / Carista | Covered in `obd-app-market-and-reviews.md` | Not re-checked |
| Android installs | Not retrieved | PARTIAL |

Caution on comparing BimmerCode and BimmerLink: both listings are free to install, so the rating counts reflect who rated, not strictly who paid. Treat "2x" as a very rough ratio, not market share.

### 3.4 Commercial signals (who gets paid for which job)

| Job | Who charges | Price seen | Source |
|---|---|---|---|
| Video in motion | A San Francisco coding shop | $25 per car, versus unlock discs at $150 or more | [S7] |
| Full-screen CarPlay coding | Online sellers (USB or cable coding products) | One listing reports 100+ sold in 30 days (vendor-reported, unverified) | [S18, snippet] |
| Battery registration | Dealers, independents, mobile techs | $100 to $200 dealer; $50 to $120 independent (vendor guide); commenters report $20 to $125 | [S30, S31] |
| Hidden features / coding | Remote and bench coders | Not priced in my sources | [S7] |
| Start-stop (hardware dongle, flash) | Third-party devices, xHP flash tool | Not priced; a 2024 X1 thread mentions a device with unconfirmed results | [S2, snippet] |
| Mercedes coding | Developer-access coding services | Forum guides say these are "strongly recommended" for the inexperienced | [S17, snippet] |

---

## 4. Ranked jobs

Ranking method: I weighted four things, with my own judgement on each (this is not a formula): (1) size of the audience in view counts for tool-specific queries, (2) help-seeking intensity in comments, (3) whether someone already charges for it, and (4) whether it recurs (a task you do again, like a battery change, versus once). Where two jobs tie, I prefer the one with comment evidence.

| Rank | Job | Why here | Evidence strength | Needs write? | Notes |
|---|---|---|---|---|---|
| 1 | **Turn off auto start-stop** | Highest help-seeking intensity (about 38 to 40 of 60 top comments are questions; a re-pull on 2026-11-20 gave 40), five videos between 67k and 280k views, an official BMW how-to exists, Mercedes shows the same demand. The earlier claim that app-store reviewers bought a coding app mainly for it is UNVERIFIED (see 2.1). Active arms race: after a software update BimmerCode support told one user coding has no effect (snippet) [S2] | A on demand; B on the current method (forum snippets, behaviour changes by software version) | Yes (mode-memory coding or a flash) | Many fixes are "start the car in Sport" modes saved by coding. Not stable across models and updates |
| 2 | **Register a new battery** | Largest single-topic videos (448k, 263k), mixed-tool market (BimmerLink, MHD, Foxwell, Ancel, Autel), hardware-agnostic job, repeated on every battery change. Cost resentment is loud | A on demand; B on need (disputed) | Yes (writes battery data into the engine computer) | Necessity is argued: a vendor guide says same-spec needs registration only; a forum poster says skipping shortens life but adds no fault code. Also needs verification (some users found Carly registrations missing from ISTA logs, snippet) [S5] |
| 3 | **Unlock a handful of hidden options (bundle)** | 4.6M, 1.25M and several 100k+ videos. Most-shared jobs: ambient light, digital speedometer, mirror fold, DRL | A | Yes | Individually small, collectively the largest audience. App catalog (the moat) matters more than the protocol |
| 4 | **Reset service interval and brake service** | 554k, 356k, 278k, 117k view videos; but most resets are done through the car's own menu without any tool | B | Yes if via tool; no if via menu | Tool demand is smaller than view counts suggest. Electronic parking brake service mode is a stronger tool-only job |
| 5 | **Read and understand fault codes in every module** | 188k, 151k, 105k tool-specific; generic is far larger. Cheap, recurring, low-risk | A for audience; B for BMW-specific | **No (read-only)** | The one top job fully inside the 12-week window |
| 6 | **Full-screen CarPlay and display options** | 130k, 116k, 92k videos; sellers charging; hardware retrofit adjacent (2.49M video) | B | Yes | Method depends on head-unit software version; one tool cannot do it on some builds (snippet) |
| 7 | **Video in motion** | 97k, 60k, 49k, 41k views; $25 shop service; legal disclaimers on every seller | A on demand; lower intensity than start-stop | Yes | Legal edge; some newer iDrive versions need no coding (one video, 25,998 views) |
| 8 | **Check a used car before buying** | Generic videos 135k to 492k; BMW-specific scan is almost absent; a vendor survey suggests most buyers skip inspections | B/C | **No (read-only)** | Audience large, intent high, but one-off per purchase. Evidence for a BMW-specific wedge is weak |
| 9 | **Log live data (tuned or stock)** | 27k to 84k views for tuner datalog how-tos; BimmerLink sells it with CSV export | B | **No (read-only)** | Tuner apps own this for their users. Open, portable logs are the gap |
| 10 | **Get the full diagnostic suite without the pain (ISTA)** | 435k, 353k, 268k, 159k install and use tutorials | B | Partly (ISTA can write) | Comments show people want coding and repair help, not just reading. OpenDiag's read-only tool cannot replace it |
| 11 | **Remove speed limiters and speed warnings** | 70k, 55k views | C | Yes | Strong legal edge; do not target |
| 12 | **Other brands' customisation (Toyota, Mercedes)** | Techstream demos 477k, 148k; Mercedes start-stop 82k | C | Yes | Same pattern as BMW, smaller evidence base here |

Two honesty notes:

- **Rank order within the top four is a judgement call.** Another analyst could put battery registration first: its videos are bigger, though the comment intensity is mostly annoyance, not requests for help.
- **Ranks 1 to 4 and 6 to 7 are all writes.** The earlier plan already says this tension exists; this data confirms it.

---

## 5. Reads versus writes

Definition used: a "write" changes anything stored in a control unit (coding values, adaptations, registrations, resets, clears). A "read" asks and displays. Clearing fault codes is a write by this definition. Under owner decision 2, no write runs on a real car in the 12-week window.

### 5.1 Classification

| Job | Pure read? | What the read-only part could be | What the write part is |
|---|---|---|---|
| Read faults in all modules | Yes | Whole-car scan with plain-English descriptions | Clearing faults (not in window) |
| Pre-purchase scan | Yes | Faults, pending codes, readiness monitors, VIN match, battery voltage; saved report | None |
| Live data and logging | Yes | Standard and manufacturer values as CSV | None |
| Start-stop | No | Show whether start-stop is coded off, its current stored value, battery state and why it may not be acting (inferred use) | Changing the stored mode |
| Battery registration | No | Show battery state and, where possible, the stored registration data and date (identifiers not established; see Gaps) | Writing the registration |
| Service / brake reset | No | Show remaining service intervals and brake wear status where readable | Resetting counters, service mode |
| Hidden options coding | No | Show every option's current value; diff against a saved snapshot | Writing values |
| CarPlay full screen / display | No | Show the current setting | Writing it |
| Video in motion | No | Show the current setting | Writing it; legal edge |
| Datalogging | Yes | Same as live data | None |

### 5.2 Which jobs a read-only tool can still help with

A read-only tool can serve the first half of a job even if it cannot do the second:

- **"Is it set?"** A verified read of the current value ("start-stop is coded to remember Sport mode") lets a user check what their other tool did, after an update, or on a used car.
- **"Did it change?"** A snapshot diff after a software update would answer a documented pain: coding reverted after an update (start-stop is the proven case) [S2, S3].
- **"Do I even need it?"** Battery state and registration status could tell a user whether the "must register" claim applies to their car. The comment sample shows this question dominating the battery video (37 of 60 contain a question).
- **"Why is this not working?"** Comments on the start-stop video include cases such as a new battery with start-stop still failing and a deactivated start-stop causing hard starts. A read-only "why is the system inactive" screen would help (inference: no source says users ask for it by that name).

### 5.3 Risk and legal edge by job

| Job | Risk level (my view) | Reason |
|---|---|---|
| Read-only jobs | Low | No writes; the earlier legal doc says reading is the safest ground |
| Battery registration, service reset | Medium | Normal workshop operations, but a bad write can leave warnings; one forum poster says skipping or botching leads to charging problems (unverified) |
| Start-stop | Medium | Emissions-regulation angle in some regions (start-stop contributes to the type-approval emissions figure); not researched here |
| Hidden options | Medium | Brake-light and lighting changes have a reported single failure (a reviewer says footwell changes altered brake lights) [S3] |
| Video in motion | Medium-high | Every seller carries a disclaimer; local law varies [S7] |
| Speed limiter and speed warnings | High | Legal and safety notes on vendor pages |

---

## 6. What fits read-only in 12 weeks

This is the table the plan needs. "Window fit" is my judgement against the KPI scoreboard in `docs/plan/kpis.md`.

| # | Deliverable | Job it serves (rank) | Reads or writes | Window fit | Dependency or doubt |
|---|---|---|---|---|---|
| R1 | Whole-car fault read with plain-English text | 5 (and 8) | Read | **Yes, core (G1, G6)** | Fault-text data is the bottleneck: the earlier docs say there is no clean public source |
| R2 | Pre-purchase report: faults, pending codes, readiness monitors, VIN match, battery voltage, shareable file | 8 | Read | **Yes, small** | Generic checks are public standard data; BMW all-module part depends on R1. The generic version overlaps free apps (earlier doc: Car Scanner, OBDLink app) |
| R3 | Live data and CSV logging | 9 | Read | **Yes (planned week 9)** | BLE throughput on the owner's adapter is untested (earlier doc) |
| R4 | Coding snapshot: read every coded option the tool can name, store with a hash | 1, 3, 6, 7 (read half) | Read | **Yes (G7)** | Needs a catalog of what each option means; the best open source data is thin and share-alike (decision 1) |
| R5 | Snapshot diff ("what did the update change") | 1, 3 | Read | **Yes after R4** | Depends on at least two snapshots from real cars; owner has own car only |
| R6 | "Why is start-stop or the battery warning acting up": battery voltage, battery registration state, relevant faults | 1, 2 | Read | **Maybe** | Needs identifiers for the registration data; not established in any source I read. Medium-low confidence it can be done in 12 weeks |
| R7 | Adapter and link health display (voltage, drops, speed) | all | Read | **Yes** | Already planned; ties to the most frequent comment pattern: "my adapter does not work with my car" |
| R8 | Service status read (interval remaining, brake wear) | 4 (read half) | Read | **Maybe** | Same identifier question as R6 |
| W1 | Anything that writes (battery registration, resets, start-stop, hidden options) | 1 to 4, 6, 7 | Write | **No** | Owner decision 2: bench modules only |

### 6.1 Fit against the user's own evidence

- R1 and R7 line up with comment patterns: 13 of 40 BimmerLink comments mention the commenter's own car, and several are adapter compatibility reports [S35].
- R4 and R5 line up with the documented pain that updates revert coding. Evidence for that pain comes from earlier docs plus forum snippets [S2]. I did not find a quantified rate.
- R2 is the thinnest evidence. It has the broadest audience (generic scan videos at 135k to 492k views), but a BMW-specific audience is nearly invisible in the YouTube data. I would not expect it to drive BMW-owner adoption.

### 6.2 What I would not build first

- A battery or start-stop wizard that implies it can fix the problem. Without a write, it can only say what is wrong.
- A generic "buyer's report" that competes with free scanner apps unless it adds BMW all-module depth.

---

## 7. Segment-by-segment needs, in the segments' own terms

| Segment | The real question they ask | What a read-only tool answers | What it cannot |
|---|---|---|---|
| Enthusiast coder | "What is my car set to, and did the update change it?" | Current values and diffs | Setting them |
| DIY maintainer | "I changed the battery or pads; did the car notice?" | State and status | The reset itself |
| Cost-resentful user | "Why does a one-line job cost $120?" | Nothing, apart from avoiding fees for the read half | The job |
| Tuner | "What did the engine do on that pull?" | Logs, in a portable format | Flashing; engine-specific channels need data |
| Used-car buyer | "Is this car hiding something?" | Faults, pending codes, monitors, VIN match | Mechanical condition (several sources say a scan cannot see wear items) |
| Shop | "Can I fix the customer's car?" | No | Programming, guided repair |

---

## 8. Search interest (partial)

### 8.1 What I could get

Monthly English Wikipedia page views (all access, user agents), pulled directly from the public statistics service on 2026-11-20. "Last 12" is the sum of the last 12 full months in the range (Nov 2025 to Oct 2026).

| Article | Jan 2023 | Jul 2023 | Jan 2024 | Jul 2024 | Jan 2025 | Jul 2025 | Jan 2026 | Jul 2026 | Oct 2026 | Last 12 months |
|---|---|---|---|---|---|---|---|---|---|---|
| On-board diagnostics | 21,149 | 23,924 | 23,720 | 14,573 | 13,593 | 10,834 | 8,969 | 6,948 | 6,411 | 98,794 |
| OBD-II PIDs | 22,005 | 21,981 | 25,047 | 22,308 | 21,852 | 17,436 | 15,397 | 12,532 | 9,551 | 162,602 |
| Unified Diagnostic Services | 16,804 | 18,586 | 19,755 | 19,599 | 17,878 | 12,210 | 9,923 | 7,214 | 5,678 | 101,945 |
| ELM327 | 3,812 | 4,081 | 4,609 | 3,705 | 4,709 | 3,510 | 3,379 | 2,489 | 2,057 | 34,324 |
| Start-stop system | 8,817 | 9,472 | 10,805 | 7,481 | 7,435 | 6,087 | 5,509 | 4,677 | 4,320 | 74,095 |

[Confidence: high that the numbers are right; low that they measure demand.]

How to read this:

- Every series is declining from a 2023 or 2024 peak. A broad pattern across five unrelated articles suggests a general change in how people read (for example, answers shown directly in search results), not a loss of interest in diagnostics. I cannot separate those with this data.
- ELM327 and "Start-stop system" hold up relatively better than OBD and UDS. Start-stop is the only job-related article. It is small (about 6,000 views a month) next to the OBD ones.
- Nothing here distinguishes BMW or coding jobs.

### 8.2 Other numbers

- One report (an e-commerce analytics site, secondary) says Amazon US weekly search volume for "bimmercode obd2 adapter" was about 189 searches in late June 2026 [S8, snippet]. Method unknown. [low]
- The same site family says "obd2 scanner" is the leading Google term and peaked in September 2025 on a normalised scale, but I could not confirm the underlying data [S8, snippet]. [low]
- Google Trends for "BimmerCode", "OBDeleven" or "start stop disable" were not retrievable. [PARTIAL]

### 8.3 What would close the gap

- A manual check of Google Trends for five terms (BimmerCode, OBDeleven, BimmerLink, "battery registration BMW", "disable start stop") over five years, US and worldwide.
- A pull of YouTube comment counts on the top five videos per job, via the public data API (needs a key, which is a credential and falls under the owner's secrets rules).
- The same query set run in Reddit's own search, by the owner, with results pasted into a file for me to read.

---

## 9. Implications for the plan

1. **The top jobs are writes, and the plan already defers writes.** That means OpenDiag in the window will not do what most people search for. The honest pitch is "see and verify" (R1, R4, R5, R7), not "do".
2. **The read half of each top job is a feature, not a filler.** Show current start-stop and battery state, and the diff after updates. The comment samples show users repeatedly asking whether a setting is on or off for their car.
3. **Do not over-weight the used-car wedge.** The audience is large, but the BMW-specific video evidence is close to zero and generic free tools already cover monitors and codes. Treat R2 as an add-on on top of R1, not as a headline.
4. **Adapter compatibility is the highest-frequency read-only pain.** The BimmerLink comment sample is full of "adapter does not work with my car" and connection timeouts. That supports the existing plan to make adapter reports and link health a first-class feature.
5. **Pricing resentment is real; license is a message.** Three independent places (battery video comments, BimmerLink "double dipping" comment, OBDeleven complaints) show it. "No credits, no separate apps" is a real positioning point.
6. **Data catalog work is the long pole.** Hidden-options demand is large (4.6M-view style content) but depends on knowing each option's meaning per chassis; that data is the incumbents' moat.
7. **Adjust KPI wording if possible.** G6 (80% of fault codes described) and G7 (distinct modules backed up) are well chosen. A new idea for the Friday scoreboard: count how many sampled user questions ("is X set on my car?") the tool can answer without a write. I did not design this and it needs an owner decision.

---

## 10. Per-job detail notes

### 10.1 Auto start-stop

- Demand evidence: top five BMW videos at 67k to 280k; the biggest is a dealership video from six years ago. BMW USA itself has a 22,636-view video on how to switch it off [S25].
- Methods named in comments and forum snippets: a button press each drive; start the car in Sport or Sport Individual using a saved drive-mode memory; coding; a flash tool; a hardware device [S2, S25].
- Problem: a 2023 G30 thread had a BimmerCode support reply stating the coding has no effect on the latest BMW software; a 2024 Supra thread said the only fix on current software is starting in sport mode; one poster claimed all 2024 and updated cars are locked (single user claim) [S2, snippet]. [medium]
- Comment sample: a 2021 330e owner says coding still leaves it stopping in Comfort; a commenter says seeing the feature made them cancel a test drive; many ask for an "off in every mode" solution [S25].
- Mercedes parallel: a Mercedes DIY coding guide on a Mercedes forum reports success in under an hour, plus extra changes (speed limiter, seatbelt warning) [S17, snippet]; 82,630-view video [S41].
- Read-only angle: reading the current stored mode and showing the car's software level would tell users whether coding can work (inference, not tested).

### 10.2 Battery registration

- Demand evidence: 448,154 and 263,295 view videos; seven tools shown across the top results [S31].
- Necessity: a vendor guide says registration is needed when the car has an intelligent battery sensor and is optional for no-sensor cars; same-spec batteries need registration only, and different-capacity or chemistry also need coding [S30]. A forum poster in 2010 argued the main downside of skipping it was possibly shorter battery life (single user) [S6]. Comments report mixed experiences, some with charging faults after skipping (unverified) [S31].
- Cost: $100 to $200 at a dealer, $50 to $120 independent, per a vendor guide (it sells scanners) [S30]. Commenters report $20 to $125.
- Tool reliability: forum snippets say a Carly registration left no record in ISTA for some users, while BimmerLink registrations showed up; BimmerCode alone cannot register but can set battery type [S5, snippet]. [low-medium]
- Read-only angle: confirming registration after the fact is a plausible job, and a verifiable read would address the "did it actually register" doubt. Which values hold the registration is not established here.

### 10.3 Service and brake resets

- Large view counts mask the fact that many of these videos show menu-based resets. The ones involving a scan tool are fewer. [medium]
- BimmerLink lists service resets and parking-brake service mode; a reviewer says the service-mode activation failed repeatedly on their car and a fix was released [S4]. Reliability matters for this job.
- Read-only angle: show service status and brake wear readouts where readable; not established in these sources.

### 10.4 Hidden options bundle

- The biggest raw numbers: 4,612,626 and 1,254,056 views for "hidden features" videos [S23]. Specific options with several 100k-view videos: ambient light, mirror fold, CarPlay full screen [S43 to S45].
- Observed caveat: many comments on the G20 "code these features" video correct the creator, saying some items are already switchable in iDrive or require hardware (alarm option, TPMS sensors) [S23-linked]. A tool that shows what is already available in the car's menu would help.
- Reported risk: one iOS reviewer says changing footwell-module settings led to brake lights acting like running lights (a single report from 2019) [S3].

### 10.5 Video in motion

- Four videos between 41k and 97k; the shop price is $25 per CIC-based iDrive car and takes about five minutes by its own account [S7].
- A video on an i4 says no coding is needed on iDrive 8.5 and has 25,998 views [S47]. Method varies by head unit.
- A forum snippet says one iDrive 8 owner could enable USB video in the app but not the speed lock, while another reply points to a head-unit setting [S47-forum snippet]. [low]

### 10.6 Fault reading

- BimmerLink walkthrough 188,102 views and "read codes for beginners" 105,573 views [S35].
- Comment evidence of related jobs: "error memory versus info memory versus permanent memory", clear a repeating code, adapter compatibility [S35].
- Free generic apps tell users to see a shop; BMW-specific reading in all modules is what dedicated tools sell (a retailer markets reading "soft codes" that do not light the check engine lamp) [S19, snippet].

### 10.7 Pre-purchase

- Mechanics in comments say customers show up for inspection after they have bought, and call readiness monitors their go-to check [S33].
- A generic checklist from a scanner vendor lists codes, freeze frame, monitors, VIN, all-module scan and saving the report [S10].
- The 2017 survey says 72% of recent used-car buyers skipped third-party inspection [S12]. Old and vendor-sponsored.

### 10.8 Tuners

- Datalog how-tos 27k to 84k; vendor's own video 27,082 [S36].
- The population is those with a tuned B58/N55 or similar; earlier docs say logs stay in vendor stores. This run found no direct complaint evidence on that point.

### 10.9 Other brands

- Toyota: a forum thread lists turning off daytime running lights, steering wheel memory, key programming, interior light timers and TPMS sensor programming as Techstream jobs; a poster says a cheap cable can read all modules but cannot program TPMS or keys [S16, S52]. Thread dated 2021.
- Mercedes: start-stop, speed limiter, folding mirrors, front DRL retrofit and AMG menu unlocks are the named jobs; the workflow needs pass-thru hardware and offline coding software, and module replacement needs online sync (forum snippets) [S17].
- Evidence is a few threads and videos. Not enough to rank.

---

## 11. Risks to this research's conclusions

| Risk | Effect on conclusions | How I handled it |
|---|---|---|
| Lifetime views favour old videos | Overweights jobs that were hot 5 to 8 years ago (battery registration, hidden features) | Reported ages; ranked using comment help-seeking where I had it |
| YouTube search ranking is not demand | A video can top the list because of the channel, not the topic | Used the top 5 per query, not just the top 1 |
| Comment samples are "top" sorted and capped at 60 | Biased toward liked comments, not the true mix | Used only coarse tallies and said so |
| Vendor content dominates text sources | Prices and "everyone needs this" claims are inflated | Labelled vendor, used for job descriptions, not demand |
| No Reddit or Bimmerpost reads | Likely misses the most detailed demand discussion | PARTIAL; follow-up in Gaps |
| Search snippets stood in for threads I could not open | Some forum claims are paraphrases of a summary | Marked "snippet" |
| One owner as user number one | Biases toward BMW and read-only | Said so earlier in plan docs; no new data |
| BMW-only evidence | Toyota and Mercedes jobs are barely sampled | Marked low |

---

## Sources

Retrieval date for all: 2026-11-20. "snippet" means I saw the page only as a search-result summary and did not open it (usually because the site blocked fetches). Video IDs are YouTube video IDs; open as `https://www.youtube.com/watch?v=ID`.

| ID | Source | URL | Used for | Confidence |
|---|---|---|---|---|
| S1 | OpenDiag plan and prior deep docs (internal) | `docs/plan/direction.md`, `docs/plan/kpis.md`, `docs/plan/decisions.md`, `docs/research/deep/user-demand-and-pain-points.md`, `docs/research/deep/bmw-coding-demand-and-practice.md` | Segments S1 to S6, KPI wording, prior ranking | high |
| S2 | Bimmerpost threads on start-stop after updates (G30 2023, G20 2024, G05, Supra) | https://g20.bimmerpost.com/forums/showthread.php?p=31526421 and https://g30.bimmerpost.com/forums/showthread.php?p=31195750 (403 on fetch; snippet only) | Start-stop behaviour after software updates | medium (snippet) |
| S3 | BimmerCode iOS listing | https://apps.apple.com/us/app/id1130787459 | 4.7 stars, 22K ratings, $49.99, review snippets | high |
| S4 | BimmerLink iOS listing | https://apps.apple.com/us/app/bimmerlink/id1065360416 | 4.7 stars, 9.9K ratings, $39.99, feature list, complaints | high |
| S5 | Forum search snippets on battery registration tools (M3Post, F48 forum, Bob Is The Oil Guy, Supra forum) | https://www.m3post.com/beta/showthread?p=29911636 , https://bobistheoilguy.com/forums/threads/bmw-battery-registration-success.388976/latest (403) | Carly versus BimmerLink registration reliability | low-medium (snippet) |
| S6 | E60 forum thread "Register Battery DIY?" pages 2 to 3 | https://5series.net/forums/e60-discussion-2/register-battery-diy-96600/page2 | 2010 to 2016 posts on necessity and consequences | medium |
| S7 | San Francisco BMW coding shop, video in motion page | https://www.sfbmwcoding.com/did-you-know-you-could-watch-video-on-your-bmw/ | $25 price, five minutes, disc price comparison | medium (vendor) |
| S8 | E-commerce analytics reports on OBD2 search interest and "bimmercode obd2 adapter" | https://www.accio.com/business/trending-obd2-scanner-diagnostic-tool-2025 and https://www.asinsight.com/report/US/bimmercode-obd2-adapter | Amazon search volume claim, trend peaks | low (snippet) |
| S9 | OBDeleven on Trustpilot | https://www.trustpilot.com/review/obdeleven.com | 3.9 of 5, 4,508 reviews, distribution, complaint themes | medium |
| S10 | THINKCAR vendor article, used-car scan checklist | https://www.mythinkcar.com/blogs/news/used-car-obd2-scan-checklist-what-to-read-before-you-buy | What buyers should read | low-medium (vendor) |
| S11 | Other vendor guides on readiness monitors | https://mythinkcar.com/blogs/news/how-to-use-a-scanner-for-a-pre-purchase-inspection-step-by-step (snippet) | Monitors, do not clear codes on another's car | low (snippet) |
| S12 | YourMechanic survey press release (published 2017-07-05) | https://prnewswire.com/news-releases/two-thirds-of-lemon-cars-start-to-show-symptoms-within-one-month-of-purchase-yourmechanic-survey-finds-300483465.html | 72% no third-party inspection; 76% unaware | low (vendor, old, sample not given for that question) |
| S13 | Independent-shop BMW tooling write-ups | https://www.bmwcoop.com/?p=66088 and https://www.autoinc.org/scan-tool-review-bmwminirolls-royce/ (snippets) | ISTA via ICOM or J2534 for independents | medium (snippet) |
| S14 | Bosch M-VCI supports ISTA (trade press) | https://fenderbender.com/running-a-shop/operations/article/33026892/bosch-m-vci-scan-tool-now-supports-bmws-ista-application | Shop tooling | medium (snippet) |
| S15 | Multi-brand shop tablet at $3,795 (retail listing) | https://www.fcpeuro.com/BMW-parts/Diagnostic-Tools/ (snippet) | Shop price point | low (snippet) |
| S16 | ClubLexus Techstream threads | https://clublexus.com/forums/rx-2nd-gen-2004-2009/964232-what-maintenance-can-only-be-done-with-techstream.html | Jobs listed by one poster, April 2021 | medium |
| S17 | Mercedes forum threads on start-stop and coding | https://mbworld.org/forums/mercedes-tech-talk/824564-diy-how-do-coding-disable-start-stop-eco-dummies.html and https://mbworld.org/forums/c-class-w204/925544-2014-w204-c300-popular-variant-coding-tips.html (snippets) | Mercedes DIY jobs and tools | low-medium (snippet) |
| S18 | CarPlay full-screen forum and seller snippets | https://f30.bimmerpost.com/forums/showthread.php?p=29067787 , https://discussions.apple.com/thread/254922241 | Method and version dependence; seller claims | low (snippet) |
| S19 | BMW scanner buying guide snippets (soft codes, mileage cross-check) | https://obdadvisor.com/bmw-scan-tool/ and https://www.bimmerworld.com/Tools/Foxwell-NT530-OBD-System-Scanner-for-BMWs.html | Marketing claims about all-module scan and mileage cross-check | low (vendor snippet) |
| S20 | YouTube: "HOW TO USE BIMMERCODE: A BEGINNER'S GUIDE" | https://www.youtube.com/watch?v=GYymCCNofVk | 1,008,958 views | high for count |
| S21 | Bumper regret survey (snippet) | https://www.bumper.com/car-advice/buying/buying-blind-how-information-gaps-cost-used-car-buyers-thousands | 42% wish they had a mechanic inspection | low (snippet) |
| S22 | DIY maintenance surveys (YouGov UK/US, FinanceBuzz, company survey) | https://yougov.com/en-us/articles/52196-how-us-car-owners-handle-maintenance-a-look-by-brand-and-age and https://financebuzz.com/americans-unable-basic-car-maintenance-task | DIY background figures | low (snippet) |
| S23 | YouTube: hidden-features videos | https://www.youtube.com/watch?v=rjXge8rRPGE (4,612,626), https://www.youtube.com/watch?v=eCdiCggpXYM (1,254,056), https://www.youtube.com/watch?v=0iPhEJcTUeM (205,393; comments read) | Bundle demand | high for count |
| S24 | YouTube: BMW service reset family | https://www.youtube.com/watch?v=0EcTcsNHeYg (554,368), https://www.youtube.com/watch?v=bmvaKLrcwKQ (356,028), https://www.youtube.com/watch?v=QVYp81Xst9I (278,679) | Reset demand | high for count |
| S25 | YouTube: start-stop videos | https://www.youtube.com/watch?v=hwAEzAZ7yTg (279,809; comments read), https://www.youtube.com/watch?v=ES_-4H37_ho (77,577), https://www.youtube.com/watch?v=TKqvC8jZfFU (73,711), https://www.youtube.com/watch?v=9NTgboIYNDs (73,675), https://www.youtube.com/watch?v=7CiRvVlXfUI (67,478) | Start-stop demand | high for count |
| S26 | YouTube: BMW USA start-stop how-to | https://www.youtube.com/watch?v=2KN_wImz_mQ | 22,636 views | high for count |
| S27 | YouTube: 2019 5 Series reset | https://www.youtube.com/watch?v=f0N4YoMZh_M | 117,867 views | high for count |
| S28 | YouTube: 2021 BMW maintenance resets | https://www.youtube.com/watch?v=E7jWPwgIA_M | 371,482 views | high for count |
| S29 | YouTube: rear brake light reset | https://www.youtube.com/watch?v=92IttwOuRiQ | 1,186,452 views (12 years old) | high for count |
| S30 | YOUCANIC battery registration guide | https://www.youcanic.com/register-a-bmw-battery/ | Necessity, tools, costs (vendor sells a scanner) | low-medium |
| S31 | YouTube: battery registration videos | https://www.youtube.com/watch?v=TFg5l7BkbL4 (448,154; comments read), https://www.youtube.com/watch?v=KxlUE39DSt4 (263,295), https://www.youtube.com/watch?v=Fb6fp-1nGkk (71,317), https://www.youtube.com/watch?v=F19HY2gzmew (55,727), https://www.youtube.com/watch?v=w0DRMyq3Tgs (45,337) | Battery demand | high for count |
| S32 | YouTube: "Here's How Mechanics Check a Used Car" | https://www.youtube.com/watch?v=LkfO9OZ86wM | 491,912 views | high for count |
| S33 | YouTube: "Everyone Should ALWAYS Do This Before Buying A Used Vehicle" | https://www.youtube.com/watch?v=jXDg74STy_Q | 134,900 views; comments read | high for count |
| S34 | YouTube: "Don't Get Scammed! Use This OBD Reader..." | https://www.youtube.com/watch?v=kgwXtl1fTsU | 29,249 views; comments read | high for count |
| S35 | YouTube: BimmerLink walkthroughs | https://www.youtube.com/watch?v=gPywfZuysh8 (188,102; comments read), https://www.youtube.com/watch?v=piZ_ODazyQM (151,587), https://www.youtube.com/watch?v=4GrzBnGYapY (105,573) | Fault reading and BimmerLink demand | high for count |
| S36 | YouTube: bootmod3 datalog videos | https://www.youtube.com/watch?v=48VOOXNtsVo (84,094), https://www.youtube.com/watch?v=DuE3hpage0E (70,685), https://www.youtube.com/watch?v=hGIvwK_yzv0 (27,082) | Tuner demand | high for count |
| S37 | YouTube: ISTA tutorials | https://www.youtube.com/watch?v=rIEx031TVmo (435,529), https://www.youtube.com/watch?v=yP-VAEJKufI (353,049), https://www.youtube.com/watch?v=kjxLakDPG4E (159,046; comments read) | Full-suite demand | high for count |
| S38 | Wikipedia page views | https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/On-board_diagnostics/monthly/20230101/20261031 (and four sibling articles) | Search-interest proxy | high for numbers, low as demand |
| S39 | Not used | | | |
| S40 | YouTube: Techstream demos | https://www.youtube.com/watch?v=KDpldAv0uQE (477,348), https://www.youtube.com/watch?v=MPgM8iIfIBQ (148,325) | Toyota demand | high for count |
| S41 | YouTube: Mercedes start-stop | https://www.youtube.com/watch?v=SvSY82AwwrY (82,630), https://www.youtube.com/watch?v=Pgj2S5uTgCU (27,280) | Mercedes demand | high for count |
| S42 | YouTube: Techstream customise | https://www.youtube.com/watch?v=RXYLQsXDBwA (112,911) | Toyota demand | high for count |
| S43 | YouTube: ambient light | https://www.youtube.com/watch?v=B2NKvZv5-mM (437,117), https://www.youtube.com/watch?v=lXoRrZVsg9o (122,875), https://www.youtube.com/watch?v=-0XYOPO7rwc (82,173) | Option demand | high for count |
| S44 | YouTube: mirror fold | https://www.youtube.com/watch?v=NTz_1AYDqUg (1,237,901), https://www.youtube.com/watch?v=Xoz4-qOolOY (108,967) | Option demand | high for count |
| S45 | YouTube: full-screen CarPlay | https://www.youtube.com/watch?v=Rl0kuL6EvpA (130,119), https://www.youtube.com/watch?v=MZB9fFNaDAE (116,607), https://www.youtube.com/watch?v=HpbZnWGv-x0 (91,975) | Option demand | high for count |
| S46 | YouTube: CarPlay retrofit | https://www.youtube.com/watch?v=qrvyUWDdd44 (2,487,998), https://www.youtube.com/watch?v=tcLox7KjEEg (278,240) | Retrofit scale | high for count |
| S47 | YouTube: video in motion | https://www.youtube.com/watch?v=MA8zIrxrMbQ (97,134), https://www.youtube.com/watch?v=IhFHKS8EqkI (60,245), https://www.youtube.com/watch?v=LGv7O-q_a-I (49,461), https://www.youtube.com/watch?v=TDhv5u1VDXY (41,067), https://www.youtube.com/watch?v=V_1uFX3rF94 (25,998) | Option demand | high for count |
| S48 | YouTube: BMW pre-purchase OBD scan (one inspection firm) | https://www.youtube.com/watch?v=UlQIMHdv77c (472) and siblings | Near-zero BMW-specific demand | high for count |
| S49 | YouTube: speed limiter | https://www.youtube.com/watch?v=sW0l_Axfye4 (70,122), https://www.youtube.com/watch?v=rc93mr9m0Dk (55,294) | Option demand | high for count |
| S50 | YouTube: digital speedometer | https://www.youtube.com/watch?v=Z7lkiKtXFkM (113,140), https://www.youtube.com/watch?v=7EkFtCRtvPU (60,939) | Option demand | high for count |
| S51 | YouTube: Supra and BimmerCode | https://www.youtube.com/watch?v=6naFYaTW_y8 (112,007) | Supra audience | high for count |
| S52 | TacomaWorld and ClubLexus Techstream threads (snippets) | https://www.tacomaworld.com/posts/23129358 , https://clublexus.com/forums/gs-3rd-gen-2006-2011/878634-personalizing-your-lexus-diy-3.html | Customisation jobs, cable limits | low (snippet) |

Quote budget: no direct quotes longer than a short phrase were used; the one short phrase ("double dipping") is from a comment on S35.

---

## Gaps: what could not be established

1. **No Reddit evidence.** The subreddit data was unreachable. A direct count of "how do I" posts by job is the single most valuable missing input. Owner action: run five Reddit searches by hand (battery registration, start-stop, BimmerLink versus BimmerCode, used BMW scan, ISTA) and save the result pages as text.
2. **No Bimmerpost thread text.** 403 on every thread. Only search-result summaries of a handful of threads, so forum statements here are snippet-level.
3. **No search-interest series.** Google Trends and keyword-volume data were not reachable. The Wikipedia numbers are a weak stand-in.
4. **No Android install counts.** Play Store pages returned only navigation text. Android may carry a different mix (BimmerLink and Car Scanner are common there).
5. **YouTube sampling limits.** About 50 searches, 7 comment samples of 23 to 60 comments each, sorted by likes. No per-job comment census. No view-velocity data (views per month), which would separate current demand from old viral hits.
6. **No hard share-of-market numbers.** Rating counts are the only proxy for paying users and they mix platforms and years.
7. **Used-car buyer BMW wedge unmeasured.** No source shows BMW buyers using an all-module scan, or how many do. The pre-purchase survey stats are vendor-sponsored and from 2017.
8. **Small shop needs unmeasured.** Nothing from shop forums or trade surveys on what independents want from a low-cost tool. Prices are retailer listings.
9. **Tuner demand beyond view counts.** No survey, no complaint volume about vendor-locked logs.
10. **Write-job identifiers.** For battery registration, service intervals and start-stop, I did not establish which control units and identifiers hold the values, so I cannot say whether the read-only views R6 and R8 are feasible in 12 weeks. That needs the owner's own captures on a real car (read-only, per the research sprint) or a clean-room source.
11. **Regulatory status of start-stop and video-in-motion by region.** Not researched here; earlier legal doc covers general ground.
12. **Toyota and Mercedes jobs.** One or two forum threads and a few video lists each; not enough to rank.
13. **Time-normalised ranking.** The ranking mixes old viral videos with recent ones. A repeat with views-per-year would be fairer to jobs that grew recently (full-screen CarPlay, iDrive 8 options).
14. **Whether read-only users convert to contributors.** No evidence either way; the plan's G9 (outside people helping) remains the test.
15. **Fact-check pass (2026-11-20).** 12 claims re-tested against their sources. Re-confirmed: store ratings and prices (S3, S4), OBDeleven Trustpilot figures (S9), video-in-motion shop price (S7), battery registration prices (S30), Wikipedia counts (S38), view counts for S20, S25, S31, and the question tallies on S25 and S31 (40 and 37 of 60). Still unchecked: most other YouTube view counts, the other comment tallies, and all snippet-only forum claims. Two claims were not supported and are now marked UNVERIFIED or corrected (start-stop as a purchase reason; "20% to 70%" fall).
