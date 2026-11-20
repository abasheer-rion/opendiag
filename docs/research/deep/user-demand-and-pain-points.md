# User demand and pain points

Research for OpenDiag. Scope: what car owners, tuners, shops and technicians ask for and complain about, ranked by how often, with the segment that wants each thing.

**Read this first: this document does not meet the brief, and I am not pretending it does.**

The brief asked for 35 or more pages read and a ranking by frequency. I read 11 pages. The reasons:

- The shared web-search budget for this run was already used up. Every search I tried returned "budget used up". I did not work around it with other search engines or proxies.
- Reddit refuses the fetch tool (two attempts, both blocked). No subreddit was readable.
- Bimmerpost returned 403. Bimmerfest redirected to a paid crawler gateway, which I did not follow. F30Post refused the connection. ClubLexus did not resolve. PriusChat returned a server error.
- Three app-store and vendor pages I guessed at returned 404 or empty. I list them in the ledger as failed.

So there are **no frequency counts, no thread counts, and no review counts** in this document. Anything that looks like a ranking is a reasoned ranking from indirect signals, and it is marked that way. Do not treat it as measured demand. A follow-up with search access is needed (see Open questions).

Ledger references look like [L3]. Pages that failed are listed at the end of the ledger as F1 to F13 and are not counted as read.

Some sibling documents in this folder (for example the app market and review one, and the BMW coding demand one) hit the same blocks and cover app-store review themes. I did not re-open those pages and I do not cite them as sources here. They are internal context only.

---

## Summary

1. **Pages actually read: 11.** The target was 35 to 50+. No Reddit, no forum thread, no app review page, no YouTube comments were read.
2. **No measured ranking of needs exists in this document.** Every ranking below is inference from what projects and vendors publish, not from counting user posts.
3. **The open-data side shows real, repeated demand for vehicle-specific data.** Open issues on a popular open OBD library cluster on adapter connectivity (about 7 of 25 visible) and manufacturer-specific data (about 7 of 25) [L9]. That is a small sample of one project.
4. **Adapter and connection trouble is a named, recurring pain.** The OBD library's issues ask for Bluetooth Low Energy support, clone adapter support and serial detection fixes [L9]. A popular phone scanner app links several pages to Bluetooth and Wi-Fi connection troubleshooting [L2].
5. **People want data the standard OBD-II set does not give them.** A volunteer maintains separate PID files for Hyundai, Kia and Genesis EVs so owners can see battery data in a phone app [L11]. A community database of signal definitions has 897 repositories [L4].
6. **Brand-specific tools are gated by who you are.** Toyota's official service site routes security and key functions only to registered professionals, offers a cheaper "Lite" kit for budget shops, and gives emergency responders free access [L6]. Price is on a third-party payment site and I could not read it.
7. **Even the coding app that owners love sells hardware as part of the story.** The OBDLink CX page says it is "Made for BimmerCode", costs $79.95, and was out of stock on the vendor page [L5]. Adapter fit is part of the user experience.
8. **Free tools give code reading, not fixing.** A leading phone scanner tells users to see a service station and says most drivers cannot tell where a fault lies [L2]. This hints at demand for plain-language explanations, but it is a hint, not a count.
9. **Open projects that last have one thing in common: a volunteer who owns the car.** One EV data repository says it is best supported for the car the maintainer owns [L11]. The opendbc project pays bounties of $2000 per brand port and $250 per model port [L3].
10. **The biggest gap for OpenDiag is evidence.** The next step is a proper demand study with search access, not more building on guesses.

---

## What I found

### 1. What I could and could not measure

I could read project pages and vendor pages. I could not read where users actually complain. That means the strongest parts of the original brief (frequency of requests, representative quotes, YouTube comments, app-review mining) are missing. What follows is what the 11 pages do support.

### 2. Recurring needs, with the evidence I have

I use three confidence labels. **Direct** means a user-facing page or issue list shows the need. **Indirect** means a vendor or project page implies it. **Inferred** means I am reasoning without a page that says it.

#### 2.1 Connecting reliably to the adapter (direct, one source)

- The issue list of a widely used open OBD library shows about 7 of the 25 visible issues are about connectivity and adapters. Themes are Bluetooth Low Energy support, asynchronous BLE handling, Bluetooth adapters that do not work, serial port detection failures, support for clone ELM327 devices, and replies from the adapter that do not match what the library expects [L9]. There are 87 open issues in total; I only saw 25.
- The phone scanner app's home page links to separate Bluetooth and Wi-Fi troubleshooting guides and an adapter selection guide [L2]. That tells us connection trouble is common enough to need its own documentation. It does not tell us how common.
- The OBDLink CX page shows how vendors market compatibility: Bluetooth 5.1 BLE, in-app pairing, protocol coverage, and "100% coverage" of BimmerCode vehicles and features [L5]. That is a vendor claim, not an independent test.

This matters to the owner directly. They use a BLE adapter and a Wi-Fi ENET adapter. Both are connection paths that other projects are still asking for fixes on.

#### 2.2 Data beyond standard OBD-II (direct, two sources)

- A maintainer publishes custom PID files so Hyundai, Kia and Genesis EV owners can show vehicle data in a phone app [L11]. He says one car is best supported because it is the one he owns. Another set is "fairly complete". Some codes are expected to match other models but "need to be tested" [L11].
- The OBDb project documents parameters, scalings and trouble codes by make and model, with 897 repositories and a CC BY-SA 4.0 licence [L4]. The Toyota Prius repository has 216 commits and breaks signals down by model year and generation [L8].
- The OBD library issues include requests for extended PIDs, a lambda sensor value with missing fields, odometer retrieval, Mode 6 results, and codes on older cars that show only one fault [L9]. About 7 of 25 visible issues are in this group.

Reading: users want live data the generic standard does not provide, and the data is mapped car by car, volunteer by volunteer. Coverage is uneven and depends on who owns which car.

#### 2.3 Reading codes and knowing what they mean (indirect, one source)

- The phone scanner app describes code reading with descriptions as a way to judge whether a fault is serious [L2]. It also says real-time monitoring can catch a problem before the check-engine light comes on [L2].
- The same page says that in most cases drivers cannot tell where a fault lies, and recommends a service visit [L2]. That limits what the tool promises.
- The free OBDLink app is described as able to monitor live parameters, run diagnostics and clear the check-engine light [L5].

I did not find a page that shows users asking for plain-language explanations in their own words. That request is in the brief, but I have no evidence for or against its frequency. It is plausible and still unmeasured.

#### 2.4 Coding and service functions (direct as supply, no demand counts)

- BimmerCode presents itself as letting owners code BMW, MINI and Toyota Supra cars themselves, with options for the main body module, head unit and instrument cluster [L1]. The page gives no price and no list of limits [L1].
- The phone scanner app lists a "Coding & Service" section, but only for certain brands: Volkswagen group platforms, one Tiguan and Touareg generation, and some Hyundai and Kia service functions [L2].
- The BMW coding side is covered in more depth in a sibling document. I do not repeat it.

What this tells us: the supply of coding tools is real and brand-patchy. Demand frequency is not measured here.

#### 2.5 Reset procedures and official service access (indirect, one source)

- Toyota's official service site describes itself as the service source for most 1990 and later North American Toyota models [L6].
- Security information (key codes, immobilizer and smart-key reset) is limited to professionals on a national registry [L6].
- A "Lite" kit exists for shops that want to use their own PC with the official software [L6].
- Emergency responders and dismantlers get information free [L6].

So for Toyota the gate is explicit. A free tool that offered key or immobilizer functions would run straight into this line. That is both a legal question and a trust question, and I do not offer an opinion on the law.

#### 2.6 Free and open alternatives (direct, three sources)

- opendbc is a community-driven project to read and control cars, and its README says most car support comes from the community with final safety validation by the company [L3]. Bounties are listed at $2000, $250 and $300 for different kinds of work [L3].
- A curated list of open car-hacking tools shows many tools but few for diagnostics. It lists only three UDS libraries, three J2534 entries, DoIP only inside a commercial-style tool, and nothing for variant coding or security access [L10]. Several tools are archived or unmaintained [L10]. This is my reading of the list; the page does not state gaps itself.

This suggests the gap is not in low-level CAN tools. It is in finished, maintained, owner-friendly diagnostic and coding apps.

#### 2.7 Offline use and privacy (no evidence)

I found nothing on offline use or privacy demand. The phone scanner app page makes no offline claim and only links to a privacy policy I could not read [L2]. I cannot rank these. They stay in the brief as unknowns.

#### 2.8 Cross-brand support (indirect)

- The phone scanner app supports a mix of brands for coding but names no general list [L2].
- BimmerCode covers BMW, MINI and Supra only [L1].
- The EV PID repository covers one group of brands and notes that non-Android users have fewer options [L11]. That points to demand for iOS and Windows support, from one maintainer's README.

No page shows owners asking for one tool across brands. Owners who have a BMW, a Mercedes and a Toyota in the family are a guess, not a finding.

### 3. Segments, what each wants, and what each would pay or contribute

Because I have no user posts, this section is **inferred** from the pages above and from common sense. Treat it as a hypothesis to test.

| Segment | Likely wants | Evidence I have | Would pay or contribute |
|---|---|---|---|
| DIY owner | Read code, understand it, clear it, reliable connection | Scanner app and OBDLink pages [L2, L5] | Pays for a cheap adapter, maybe a one-time app. Unlikely to contribute data. |
| Enthusiast tuner | Live data, coding, safe backups, BLE and ENET paths | Open PID projects [L9, L11], BimmerCode [L1] | Pays one-time for coding. Most likely to contribute signal maps for their own car. |
| Independent shop | Official-level coverage, resets, key functions | Toyota's tiered access [L6] | Pays for coverage and uptime. Needs legal safe features. Unlikely to contribute data. |
| Technician | Full OEM function and speed | Toyota's professional gate [L6] | Employer pays. Little interest in free tools unless they match OEM depth. |

The one contribution pattern I can actually see in the sources is the enthusiast who owns the car and writes down what works [L8, L11]. That is the contributor model to design for.

---

## Evidence quality and disagreements

- **Volume:** 11 pages, against a target of 35 to 50+. This is a failure against the brief.
- **Type:** All 11 are vendor pages, project READMEs or issue lists. None is a user complaint thread, review page or comment section.
- **Sample bias:** The one issue list I read belongs to one Python library used by developers, not by ordinary owners [L9]. Its themes do not represent owners.
- **Single-source claims:** The BLE and clone adapter themes come from [L9] only. The "see a service station" statement comes from [L2] only. The Toyota access tiers come from [L6] only.
- **Disagreements:** None found, because there are too few overlapping sources. The OBDLink "100% coverage" claim [L5] and the BimmerCode page [L1] agree that they work together, but both are vendor statements.
- **Unreadable:** The OBDLink page showed the CX out of stock at the time I read it [L5]. That may be temporary.
- **Mercedes:** I read one forum home page [L7]. Only the first part loaded. It shows technical help sections and a few thread titles on keyless diagnosis, a charging port swap and lost engine coding. This is thin and anecdotal.

---

## Implications for OpenDiag

These follow from the evidence above, with confidence labels. None is backed by a measured frequency.

**Build**
- **A connection that just works, across BLE and Wi-Fi ENET.** Connection trouble shows up in an open library [L9] and in an app's docs [L2]. Treat first connect, reconnect and clear error messages as a core feature, not polish. (Medium confidence.)
- **A per-car data layer that anyone can add to.** The model that works for others is one owner, one car, one pull request [L8, L11]. Reuse the open signal format and its licence terms rather than inventing a new one. Respect CC BY-SA obligations [L4]. (Medium.)
- **Readable code explanations.** Plausible and consistent with how apps frame code reading [L2], but unmeasured. Build it small and test it. (Low.)

**Avoid**
- **Key, immobilizer and smart-key reset features.** Toyota restricts them to registered professionals [L6]. Do not build them without legal advice. (High confidence that the gate exists; no view on law.)
- **Promising to fix faults.** Scanner apps themselves say they cannot tell where a fault lies [L2]. Say the same.
- **Depending on a single adapter model.** The out-of-stock CX [L5] is a reminder that adapters come and go.

**Measure (once we have search access)**
- Number of distinct threads and posts per need, per community, over a fixed time window.
- Share of posts about connection failure versus data versus coding.
- Share of posts from each segment.
- Contribution rate: how many users would submit a car map if asked.

---

## Open questions

1. How often do owners ask for each need? Needs Reddit and forum access, or a different method such as an owner survey.
2. Do owners actually want plain-language code explanations, and in what form?
3. How big is the gap between what BimmerCode covers and what BMW owners ask for? The sibling BMW coding document may help.
4. How much do Mercedes and Toyota/Lexus owners want a free tool versus the paid official one? Toyota's price page was not readable [L6].
5. Are offline use and privacy real purchase drivers, or just things an open-source project likes to promise?
6. Would shops pay for anything from a free project, and what?
7. What do app-store reviews of the top scanner and coding apps say, in counts? No review page loaded.
8. What do YouTube comments on diagnostic tool videos ask for? Not attempted; no way to reach them without search.

**Recommended next step:** a follow-up run with search access, or a short owner survey, to replace the inferred ranking with counts.

---

## Source ledger

All rows below were fetched and read in this run. Reliability is about how far the page can be trusted for what I used it for.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| L1 | https://bimmercode.app/ | Vendor page | BimmerCode codes BMW, MINI and Supra, on phone and desktop. Names control units. No price or limits shown. | High for what it offers, low for limits |
| L2 | https://www.carscanner.info/ | Vendor page | Phone scanner app. Live data, code descriptions, recording, coding for VW group, Hyundai and Kia. Links to connection troubleshooting. Says a service visit is usually needed. | Medium |
| L3 | https://github.com/commaai/opendbc | Project README | Community-driven car data and control. Bounties of $2000, $250, $300. Discord and GitHub for coordination. | High |
| L4 | https://github.com/OBDb | Project org page | Community OBD signal and DTC documentation. 897 repositories. CC BY-SA 4.0. | High |
| L5 | https://www.obdlink.com/products/obdlink-cx/ | Vendor page | BLE adapter, $79.95, "Made for BimmerCode", free OBDLink app. Out of stock when read. | Medium (vendor claims) |
| L6 | https://techinfo.toyota.com/ | Official vendor site | Service information gated by role. Lite kit for shops. Free for responders. Price not shown. | High for access tiers |
| L7 | https://www.mbworld.org/forums/ | Forum home | Mercedes forum sections and a few thread titles. Only first 100,000 characters read. | Low (anecdotal) |
| L8 | https://github.com/OBDb/Toyota-Prius | Project README | Prius signal sets by generation. 216 commits. Contribution is fork and pull request. CC-BY-SA-4.0. | High |
| L9 | https://github.com/brendan-w/python-OBD/issues | Issue list | 25 of 87 open issues seen. About 7 on adapters, 7 on vehicle-specific data, 3 on install. | Medium (one project, developer audience) |
| L10 | https://github.com/iDoka/awesome-canbus | Curated list | Categories of open car tools. Few UDS, J2534, DoIP entries. No variant coding. Some unmaintained. Gaps are my inference. | Medium |
| L11 | https://github.com/JejuSoul/OBD-PIDs-for-HKMC-EVs | Project README | Volunteer PID files for Hyundai, Kia and Genesis EVs. Best support for the maintainer's own car. 37 open issues, contents not seen. | Medium |

**Fetched but failed or empty, not counted as read:**

| # | URL | Result |
|---|---|---|
| F1 | https://play.google.com/store/apps/details?id=de.bimmercode.app | 404 |
| F2 | https://play.google.com/store/apps/details?id=com.ovz.carscanner | Page loaded with no rating or reviews |
| F3 | https://www.reddit.com/r/BmwTech/top/?t=year | Blocked by the fetch tool |
| F4 | https://www.reddit.com/r/CarHacking/top/?t=year | Blocked by the fetch tool |
| F5 | https://apps.apple.com/us/app/bimmercode/id1451028230 | 404 (my guessed ID may be wrong) |
| F6 | https://www.bimmerpost.com/ | 403 |
| F7 | https://www.obdlink.com/products/obdlink-app/ | 404 |
| F8 | https://www.carscanner.info/coding-and-service/ | 404 |
| F9 | https://forums.clublexus.com/ | Host did not resolve |
| F10 | https://www.bimmerfest.com/ | Redirected to a paid crawler gateway; not followed |
| F11 | https://www.priuschat.com/ | Server error 522 |
| F12 | https://www.f30post.com/ | Connection refused |
| F13 | Web searches (about ten tried) | Search budget exhausted; none ran |

pagesRead = 11.
