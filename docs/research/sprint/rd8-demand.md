# RD-8 (Q12): which coding goals people ask for most, and what to keep for Toyota and Mercedes

Written 2026-11-24 (sprint day 2). Reading only. Not legal advice. Status: **PARTIAL**. Bimmerpost, E90Post and F30Post (one network) returned a bot check or 403, Reddit's own site is blocked for our tools, and Bimmerfest redirects crawlers to a paid-access gateway (not used). What follows rests on a public Reddit archive, Apple App Store review feeds, YouTube search metadata and a handful of search snippets. All samples are small. Read every percentage as a rough size, not a measurement.

---

## ANSWER FIRST

1. **Most-requested goals in BMW coding threads (random sample of 200 posts, r/bimmercode plus r/BMWcoding): lights 18%, adapter and connection trouble 17%, CarPlay and head-unit features 11%, one-off niche features 10%, "something broke after I coded" 8%.** Share of the 166 coding-related posts. 95% range is about plus or minus 5 points on the big ones.
2. **Start-stop off and video in motion are almost absent from forum threads (1 of 200 each) but are why people buy.** About 16 of 500 BimmerCode reviews name start-stop (a re-count with a stricter word match gave 12 to 17, depending on wording), and about 10 of those say it failed or is gone on their car. They are "answered by a video" goals, so thread counts undercount them.
3. **Ranking depends on the source.** Threads say lights and connection. Reviews say price, connection, and "broke after a BMW update". YouTube says "what should I code" lists and sound, then fault codes. No goal is first in all three.
4. **Servable read-only (our window):** connection help, a "what changed after coding" view with backups, and fault codes. Together about 29% of forum posts (17.5 + 8.4 + 3.0). Everything else in the top list is a write.
5. **Toyota: DEFER past week 12.** Demand is real but is mostly about the paid factory tool, key programming and pirated software (roughly a quarter of r/techstream posts ask for keys or activation, by hand labels that were not re-checked; we will not touch it). Keep one line: the A90 Supra rides the BMW stack.
6. **Mercedes: DEFER past week 12.** The 64 coding threads in r/mercedes_benz are mostly "what tool, what can I code" (30 of 64). Nothing there a free read-only tool serves. Keep the existing "this car is locked, here is why" idea only.
7. **Samples are small.** n=200 hand-labelled, 500 reviews, 6 videos per query, 105 to 112 posts per other-brand source. Bimmerpost, the largest source, was not read. Treat D10 (the sprint decision) as "stay deferred" with low-to-medium confidence.

---

## 1. Counts per goal

### 1.1 Method in plain words

- **Pool.** Every post I could pull from r/bimmercode (1,640 posts, Dec 2020 to 24 Nov 2026) and r/BMWcoding (159 posts, 2015 to 2026), joined and de-duplicated: 1,799 posts. Pulled from a public Reddit archive (Arctic Shift), because Reddit itself is blocked for our tools.
- **Random sample.** 200 posts drawn at random (fixed seed 2026) from the 1,799. I read the title and the first 170 characters of the body and gave each one a single main goal. Posts that are spam, removed, blank or off topic are labelled "noise". Non-coding car repair is labelled "mechanical". Both are left out of the percentage base (166 left).
- **Why hand labels.** A word-match pass on titles left about 30% unclassified and mis-tagged generic words, so I hand-labelled instead.
- **Judgement calls.** Single label per post. Perhaps 10 to 15% of labels are borderline (for example "ambient lights not showing after coding" could be lights or broke-after-coding; I used lights unless the post says something broke).
- **Scores are not usable.** The archive stores scores from soon after posting. Almost every post shows 1 or 2. I cannot rank by upvotes.

### 1.2 Table A: random sample, n=200 (the headline table)

| Goal (what the person wants) | Posts | Share of 166 coding posts | 95% range |
|---|---|---|---|
| Lights: daytime lights, angel eyes, ambient colours, LED swap errors, side markers, turn signals, welcome light | 30 | 18.1% | 13.0 to 24.6 |
| Adapter, connection, "which app", "will it work on my car", licence and price questions | 29 | 17.5% | 12.4 to 24.0 |
| CarPlay, full-screen, head unit, nav, radio, Bluetooth | 18 | 10.8% | 7.0 to 16.5 |
| One-off niche feature (TPMS off, ACC tuning, rear camera off, VIN, park assist, remote start, grille flaps) | 16 | 9.6% | 6.0 to 15.1 |
| Something broke after coding, or restore a backup | 14 | 8.4% | 5.1 to 13.7 |
| Cluster, display, drive mode, speed limit info, M layouts | 13 | 7.8% | 4.6 to 12.9 |
| Sound: active sound off, exhaust flap, chimes, audio set-up | 13 | 7.8% | 4.6 to 12.9 |
| Comfort: mirror fold, windows, key fob, handles, seats | 7 | 4.2% | 2.1 to 8.4 |
| Read or explain fault codes and warnings | 5 | 3.0% | 1.3 to 6.9 |
| Retrofit hardware (cameras, screen swap, 360 view) | 5 | 3.0% | 1.3 to 6.9 |
| Battery registration, service or oil reset | 5 | 3.0% | 1.3 to 6.9 |
| General "what should I code on my car" | 5 | 3.0% | 1.3 to 6.9 |
| Tuning (bootmod3, maps, flash) | 4 | 2.4% | 0.9 to 6.0 |
| **Start-stop off** | **1** | **0.6%** | 0.1 to 3.3 |
| **Video in motion** | **1** | **0.6%** | 0.1 to 3.3 |
| Noise (spam, removed, blank, off topic) | 25 | n/a (12.5% of 200) | |
| Mechanical (engine, gearbox, not coding) | 9 | n/a (4.5% of 200) | |

Ranges are Wilson intervals on the sample only. They ignore my labelling error.

### 1.3 Table B: whole pool, word matches (N=1,790, title plus body; one post can hit several rows)

This is a coarse second look at all 1,790 posts (9 removed titles dropped). It does not use hand labels. Several patterns are loose, so some rows overstate. Treat as order of magnitude.

| Goal pattern | Posts mentioning | In the title |
|---|---|---|
| Adapter, ENET, cable, OBDLink, dongle (pattern also catches "cable" and "MHD") | 260 | 91 |
| Expert mode | 143 | 36 |
| iDrive or head-unit generation (ID5 to ID8, NBT, CIC, EVO) | 137 | 62 |
| CarPlay or Android Auto | 136 | 79 |
| Cluster, HUD, M layout | 104 | 49 |
| Daytime lights, angel eyes | 87 | 49 |
| Battery (registration and drain) | 85 | 25 |
| Backup, restore, revert | 75 | 11 |
| Ambient light | 65 | 38 |
| Fault codes, DTC, check engine | 61 | 19 |
| Cannot connect | 59 | 31 |
| LED conversion, flicker, hyperflash | 58 | 25 |
| Mirrors (also catches rear-view mirror) | 57 | 34 |
| Driver assist, lane, park assist, traffic sign | 55 | 26 |
| Retrofit | 53 | 28 |
| Sport plus, drive mode | 50 | 33 |
| Full-screen CarPlay | 48 | 22 |
| Tuning (bootmod3, MHD, JB4) | 45 | 25 |
| Exhaust, active sound | 40 | 25 |
| Speed limit info, digital speedo | 38 | 16 |
| **Start-stop** | **37** | **16** |
| Windows, key fob | 33 | 14 |
| Side markers, amber lights | 26 | 17 |
| TPMS | 14 | 9 |
| Service reset | 11 | 8 |
| **Video in motion** | **6** | **2** |
| DPF | 5 | 2 |

Cross-check against Table A: both say start-stop and video in motion are rare in threads, and both put connection, lights and CarPlay at the top.

### 1.4 Table C: BimmerCode app reviews (US App Store, n=500, newest first) and BimmerLink (n=250)

Sampled with Apple's public review feed, newest first, 10 pages of 50 for BimmerCode (Jan 2021 to Nov 2026) and 5 pages for BimmerLink (Feb 2022 to Nov 2026). **Skew warning:** the newest 500 BimmerCode reviews average 3.2 stars while the whole app is rated 4.68 from 21,789 ratings, so this slice over-represents unhappy people. One review can match several rows.

| Topic in review text | BimmerCode (of 500) | BimmerLink (of 250) |
|---|---|---|
| Price, refund, subscription, "worth it" | 136 | 84 |
| Adapter or connection | 106 | 75 |
| New model, software update, "stopped working" | 65 | 24 |
| Fault codes | 24 | 22 |
| Lights (daytime, angel eyes, LED) | 21 | 2 |
| **Start-stop** | **16** | not counted |
| CarPlay or Android Auto | 12 | 13 |
| Backup or restore | 11 | not counted |
| Mirror fold | 11 | not counted |
| Battery | 11 | 39 |
| Speedo, cluster, HUD | 10 | not counted |
| Chimes, exhaust, sound | 9 | 10 |
| Crash or bug | 6 | 5 |
| Ambient light | 4 | not counted |
| **Video in motion** | **3** | not counted |

Start-stop in the 16 BimmerCode reviews: 5 say it worked (all 4 or 5 stars), 10 say it failed, was removed by a BMW update, or has no option for their car (mostly 1 or 2 stars), 1 is neutral. Two of the failures are a Mini and a Toyota Supra owner.

Battery registration is the BimmerLink story: 39 of 250 reviews (16%) against 11 of 500 for BimmerCode (2%).

### 1.5 Table D: YouTube, 6 results per query, 2026-11-24

Search metadata read with a command-line tool (no video downloaded). "Median" is the median lifetime views of the 6 results. Old videos have had years to collect views, and a single viral or official video can dominate the top, so this is a rough audience size, not a count of people who did the job. Queries were mine, so the ranking depends on my wording.

| Goal (query began "bimmercode" unless noted) | Median views | Top video views | Top result (title as shown) |
|---|---|---|---|
| "Best coding options" lists | 135,556 | 1,254,834 | THE 10 BEST FEATURES TO CODE INTO YOUR BMW WITH BIMMERCODE! |
| "What to code" lists | 105,900 | 1,009,962 | HOW TO USE BIMMERCODE: A BEGINNER'S GUIDE |
| Exhaust flap, active sound off | 109,112 | 193,255 | Make your BMW sound more luxurious using Bimmercode +Exhaust sounds |
| Read and clear fault codes (BimmerLink) | 70,967 | 188,836 | How To Use BIMMERLINK On Your BMW E , F , G Series |
| Ambient lighting | 59,676 | 437,471 | CODING AMBIENT LIGHTING FEATURES! |
| Full-screen CarPlay | 58,965 | 130,291 | CODING FULLSCREEN APPLE CARPLAY INTO MY BMW F30 JUST USING BIMMERCODE |
| Fix problems after coding | 58,554 | 154,071 | How To Clear BMW AFS Adaptive Headlight Error w/ BimmerCode |
| Mirror fold | 50,508 | 1,238,962 | How to Auto Fold BMW Mirrors (BMW USA) |
| Video in motion | 45,319 | 97,195 | BMW Bimmercode: Video In Motion |
| Battery registration (BimmerLink) | 38,117 | 91,210 | BMW Battery Replacement & Register w/BimmerLink DIY |
| ENET cable with laptop | 29,773 | 105,147 | BimmerCode & BimmerLink with a Laptop - Easy Setup with ENET CABLE |
| Digital speedo, M cluster | 23,986 | 113,210 | BMW Digital Speedometer (No Coding) |
| Start-stop off | 21,238 | 73,724 | BIMMERCODE: How To Permanently Disable Auto Start Stop Function On BMW |
| Daytime running lights | 17,680 | 67,450 | CODING DRL REAR LAMPS TO STAY ON |
| OBDLink CX connect | 13,325 | 33,508 | Unlocking Hidden BMW Features with OBDLink MX+ & BimmerCode |

Start-stop and video in motion each have several videos in the tens of thousands of views, but neither tops this list. The earlier sprint note (`docs/research/deep2/user-jobs-and-demand.md`) found a 279,809-view start-stop video with different query words, so the exact order here is query-dependent.

### 1.6 Table E: three keyword-picked samples (cross-check only, not random)

Posts whose titles contain "coding" or "bimmercode" in other subreddits. Same label scheme, hand-labelled, one label per post. They are **biased by how I picked them**: r/BMW "bimmercode" titles are mostly buy-or-adapter questions, r/e90 "coding" titles are older cars with NCS Expert.

| Goal | r/e90, title has "coding" (n=100, 2024 to 2026) | r/BMW, title has "bimmercode" (n=98 labelled of 100) | r/f30, title has "bimmercode" (n=94) |
|---|---|---|---|
| Adapter, connection, which app, worth it | 12 | 42 | 29 |
| Lights | 14 | 9 | 11 |
| CarPlay, head unit, radio (includes CIC retrofit) | 12 | 5 | 7 |
| One-off niche feature | 26 | 4 | 4 |
| "What should I code" general | 2 | 9 | 18 |
| Cluster, display, drive mode | 2 | 9 | 11 |
| Broke after coding | 6 | 6 | 7 |
| Battery or service | 6 | 0 | 1 |
| Charger needed for coding (new row) | 3 | 2 | 0 |
| Sound | 3 | 2 | 2 |
| Fault codes | 2 | 2 | 1 |
| Start-stop | 0 | 1 | 0 |
| Video in motion | 0 | 0 | 0 |
| Noise | 6 | 6 | 1 |

Two more things these show. "Do I need a battery charger or trickle charger to code" appears 5 times in 292 posts (about 1.7%), so the owner's charger worry is a common newcomer worry. Buying and compatibility questions dominate the two BimmerCode-titled samples (42% and 31%).

### 1.7 Bimmerpost, read by search snippet only (n=10, not a sample)

I could not read Bimmerpost threads. One search over its domains returned 10 thread titles. Because I put "start stop", "video in motion" and "DRL" in the query, the titles are what I asked for, not a sample of what people ask. Still, they show the topics exist as dedicated threads: video in motion has its own threads on G05, G07 and G80 boards (4 of the 10 titles), and "top bimmercodes", "coding list" and "bimmercode suggestions" threads exist for G30, G20 and F30. The one G80 thread I later opened (the others did not load) is mixed: one poster says BimmerCode told them it is not possible on iDrive 8, another says the G20 group has it working on iDrive 8 by other means, and a third suggests an Android Auto workaround with no coding. So it is not a clear "cannot be coded". That is one thread, not a count.

---

## 2. Other brands: what the same method gives

### 2.1 Toyota and Lexus (n=105 in r/techstream; n=81 in r/Toyota; n=31 in r/Lexus; 314 Carista reviews)

**r/techstream, all 105 posts the archive holds (Apr 2021 to Nov 2026), hand-labelled, rough.** My labels sum to 100 of 105 (I left five unlabelled). Treat as bands.

| What the post asks | Posts | Share |
|---|---|---|
| Get the software, an activation key, a passcode or "lifetime access" (the factory tool is paid, so this is mostly cracked-software traffic; **not counted as demand we serve; never linked or used**) | about 29 | about 28% |
| Install, driver, cable, "won't connect", bug reports (six are one identical title) | about 27 | about 26% |
| Service procedures (forced DPF regen, brake air bleed, TPMS add, ECM reset, recall, firmware) | about 12 | about 11% |
| Key fob or immobiliser programming | about 8 | about 8% |
| Customise settings (DRL, global open and close, body control coding) | about 4 | about 4% |
| Other | about 20 | about 19% |

**r/Toyota, title has "techstream" (n=81, all the archive returned in one page).** Install and cable questions about 41 (many are "install and activate v18" guide posts), key programming 8, diagnostics (smog readiness, TPMS, cleared codes, live data) 8, customisation 4, procedures 3, other 17. At least 11 titles are install-and-activate guide or promo posts.

**r/Lexus, title has "techstream" (n=31).** Setup 12, key 2, diagnostics 2, customisation 3 (DRL off, remote start without subscription, custom settings), other 12.

**Carista app (US App Store, newest 314 reviews).** 67 of 314 (21%) name a Toyota-family car. Of those 67: customise or settings 33, price or subscription 29, codes 24, beep and chime removal 23, "not supported or not working" 15, TPMS 9, key 3. The recurring jobs are the **reverse beep, seatbelt chime, TPMS relearn, and turning off door-lock or flash settings**. These are all writes. The recurring complaint is "website says my car is supported and it is not" and the subscription.

**YouTube.** "Toyota techstream customise settings": median 72,099 views (top 477,628, a 2015 demo). "Toyota hidden features with an OBD app": median 226,754 (top 353,148 for an OBD2 app, 293,500 for a 5th-gen 4Runner). "A90 Supra BimmerCode hack, code out start-stop": 14,426 views.

### 2.2 Mercedes (n=64 in r/mercedes_benz "coding", n=10 in r/W204 "coding", n=13 "vediamo")

**r/mercedes_benz, title has "coding" (n=64, all the archive returned in one page), hand-labelled.**

| What the post asks | Posts |
|---|---|
| "What tool, what can I code, how do I start, remote coding" (tool and discovery) | 30 |
| Lights (headlight, tail light, DRL, ambient) | 11 |
| Cluster or display (AMG supersport cluster, needles, screen) | 4 |
| Battery registration or coding | 3 |
| AMG menu, CarPlay | 2 |
| Broke after coding | 2 |
| Injector coding (repair) | 2 |
| Ads and training sales (Vediamo and DTS Monaco courses, a coding-account sale) | 3 |
| Other (suspension, gearbox swap, fragrance, retrofit) | 7 |

The 13 "vediamo" titles include several posts selling courses, kits or remote installs (at least 5 by title), and a few asking where to buy a kit. **Xentry** counts: the archive call returned an error, not a zero, so I have no count (do not read it as none).

**YouTube.** "Mercedes coding Vediamo": median 23,972 (top 54,131). "Disable ECO start-stop on Mercedes": top 83,034 views, median 21,435. "Mercedes OBD app hidden features": median 46,282, top 265,795 is an OBDeleven credits video, not Mercedes coding.

### 2.3 Keep or defer (answers D10)

| Brand | Line | Reason in one sentence each |
|---|---|---|
| **Toyota / Lexus** | **DEFER past week 12. Keep one line: the A90 Supra is on BMW's stack and BimmerCode lists it.** | Real demand is for writes (beeps, chimes, TPMS, key fobs) and for the paid factory tool, and about 28% of the main Toyota forum is people asking for keys or activation of cracked software. A read-only tool does not serve those jobs. Supra signal is small: about 4 to 5 of 500 BimmerCode reviews, one a 1-star about broken start-stop. |
| **Mercedes** | **DEFER past week 12. Keep only the "locked car, here is why" screen idea.** | Demand is "what tool and what can I code" (30 of 64), the gate is the factory tool and logins, and the forum sales traffic is courses and cracked kits. No read-only job shows up in the sample. |

If you ever add a spike, the cheapest honest one is generic OBD-II fault reading (works on both brands without brand data). That is already in the plan for any car and needs no Toyota or Mercedes research.

---

## 3. CLAIMS TABLE

"Single-source" means one data source only, not independently repeated. Dates are when I read the source. Archive and feed URLs are the query patterns I used.

| # | Claim | Source URL | Confidence | Single-source |
|---|---|---|---|---|
| C1 | r/bimmercode had 1,640 archived posts (6 in 2020, 86 in 2021, 104 in 2022, 210 in 2023, 278 in 2024, 415 in 2025, 541 so far in 2026) | https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=bimmercode | medium (archive may miss posts) | yes |
| C2 | r/BMWcoding had 159 archived posts, 2015 to 2026 | https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=BMWcoding | medium | yes |
| C3 | In a random 200 of 1,799 posts, lights is the top goal (30 of 166, 18%), connection and compatibility second (29, 17.5%), CarPlay and head unit third (18, 11%) | same archive, hand-labelled by me | medium (my labels, one reader) | yes |
| C4 | Start-stop off and video in motion are 1 post each of 200; across 1,790 posts, 37 mention start-stop and 6 mention video in motion | same archive | medium | yes |
| C5 | "Broke after coding or restore backup" is about 8% of coding posts; 45 posts in the pool match a broke-after-coding pattern | same archive | medium-low (loose pattern) | yes |
| C6 | BimmerCode: 21,789 ratings, 4.68 average, free to install; BimmerLink: 9,902 ratings, 4.68; xHP Flashtool 2,781; bootmod3 2,041 (4.85). So the coder app has about 10 times the ratings of the owner's tuner app | https://itunes.apple.com/search?term=bimmercode&entity=software&country=us | high for the numbers, low for what they mean | yes |
| C7 | Newest 500 BimmerCode reviews average 3.2 stars, so that slice is skewed to complaints; 231 are 5-star and 180 are 1-star | https://itunes.apple.com/us/rss/customerreviews/page=1/id=1130787459/sortby=mostrecent/json | high | yes |
| C8 | 16 of those 500 reviews mention start-stop; 10 report it failing or missing, 5 report success | same feed, pages 1 to 10 | medium | yes |
| C9 | BimmerLink reviews skew to battery registration (39 of 250) far more than BimmerCode (11 of 500) | https://itunes.apple.com/us/rss/customerreviews/page=1/id=1065360416/sortby=mostrecent/json | medium | yes |
| C10 | Price, refund and subscription complaints are the biggest review theme (136 of 500 BimmerCode, 84 of 250 BimmerLink); connection is second (106 and 75) | the two feeds above | medium (word matches) | yes |
| C11 | YouTube medians (6 results each): coding lists 105,900 to 135,556; exhaust and active sound 109,112; fault codes 70,967; start-stop 21,238; video in motion 45,319 | https://www.youtube.com/results?search_query=bimmercode+start+stop+disable (and the 20 sibling queries listed in the ledger) | medium for relative size | yes |
| C12 | Official BMW USA mirror-fold video has 1,238,962 views, which inflates the mirror row; it is not a coding-app video | https://www.youtube.com/results?search_query=bimmercode+mirror+fold | high | yes |
| C13 | r/techstream (105 archived posts) is about 28% requests for software, keys or activation codes, which is mostly pirated factory-tool traffic | https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=techstream | medium (my reading of titles) | yes |
| C14 | About 20% of the newest Carista reviews name a Toyota-family car (67 of 314 when first read; a re-check a day later, with the feed returning fewer pages, gave 54 of 264); the recurring jobs are reverse beep, seatbelt chime, TPMS and key-lock settings | https://itunes.apple.com/us/rss/customerreviews/page=1/id=954363569/sortby=mostrecent/json | medium | yes |
| C15 | r/mercedes_benz titles with "coding" (64) are mostly tool and discovery questions (30) and lights (11) | https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=mercedes_benz&title=coding | medium-low | yes |
| C16 | 5 posts of 292 in three keyword-picked samples ask if a charger is needed for coding | same archive, r/e90, r/BMW, r/f30 title searches | low (small, keyword-picked) | yes |
| C17 | Bimmerpost has dedicated video-in-motion threads on G05, G07 and G80 boards; one opened G80 thread is mixed: one poster says BimmerCode says it is not possible on iDrive 8, another says it works on iDrive 8 on G20 by other means | https://g05.bimmerpost.com/forums/showthread/1868945/video-in-motion ; https://g80.bimmerpost.com/forums/showthread.php?t=2016301 ; https://g07.bimmerpost.com/forums/showthread/1822325/bimmercode-video-in-motion | low (G80 thread read on re-check; G05 and G07 pages hit the bot check and rest on search titles only) | yes |
| C18 | Pirated or cracked tool requests exist in BMW threads too: about 6 of 492 labelled BMW posts (apk unlock, cracked app, ISTA downloads; two are borderline) | same archive | medium-low | yes |

---

## 4. DISAGREEMENTS BETWEEN SOURCES

1. **Start-stop.** Earlier sprint evidence (`deep/bmw-coding-demand-and-practice.md`, `deep2/user-jobs-and-demand.md`) ranks it first or near first, built from video views and comment questions. This note's thread sample ranks it last (1 of 200). Reviews are in between (about 16 of 500) and say it often fails. Reading: it is a high-awareness purchase trigger and a low-thread-volume job, and BMW updates keep breaking it. Neither view is wrong. They count different things.
2. **Video in motion.** Deep run called it "the most commercially validated goal". Here it is 1 of 200 in threads, 3 of 500 in reviews, and mid-pack on YouTube (median 45,319). Commercial evidence (sellers charge for it) and thread volume disagree. Newer iDrive 8 and 8.5 may need no coding, per an earlier note, which would also reduce questions. Not verified here.
3. **Top goal.** Threads say lights. Reviews say price and connection. YouTube says "what to code" lists and exhaust sound. Different populations: threads are people stuck, reviews are people who paid, videos are people browsing.
4. **BimmerCode versus BimmerLink.** Earlier notes use the BimmerLink-to-BimmerCode rating ratio (about 45%) as a market-size hint. This sample shows the two apps are bought for different jobs (coding versus battery and codes), so the ratio is not a size ratio.
5. **Toyota.** Earlier notes called Toyota demand "thin and mostly hypotheses". Here it is not thin. r/techstream and Carista show steady, specific demand, but it is for writes and for the factory tool (including pirated copies), so it does not change the defer call.
6. **Archive versus site.** I cannot compare the archive to Reddit's own site, so I cannot say how many posts the archive misses. Removed posts keep a title but lose the body ("[removed]"), which weakens labels on about 1 in 8 posts.

---

## 5. SOURCE LEDGER

### Read and used

| Source | What I took | Result |
|---|---|---|
| Arctic Shift public Reddit archive, `https://arctic-shift.photon-reddit.com/api/posts/search` (third-party, unofficial) | r/bimmercode (1,640), r/BMWcoding (159), r/e90 "coding" (100), r/e90 "bimmercode" (51), r/f30 "bimmercode" (94), r/BMW "bimmercode" (100), r/techstream (105), r/Toyota "techstream" (81), r/Toyota "coding" (7), r/Toyota "hidden" (48), r/Lexus "techstream" (31), r/Lexus "coding" (5), r/mercedes_benz "coding" (64), "vediamo" (13), "hidden" (36), r/W204 "coding" (10), "xentry" (4) | Worked. Needed retries. Fields title, selftext, score, comment count, date, id |
| Apple iTunes Search API, `https://itunes.apple.com/search` | Ratings and counts for BimmerCode, BimmerLink, xHP Flashtool, bootmod3, Carista, OBDeleven | Worked |
| Apple customer-review RSS, `https://itunes.apple.com/us/rss/customerreviews/page={1..10}/id={app}/sortby=mostrecent/json` | BimmerCode 500, BimmerLink 250, Carista 314 reviews | Worked; feed caps at about 10 pages; Carista returned 314 over all pages |
| YouTube public search metadata, read with a command-line tool, 6 results each, no downloads | 21 queries: start-stop, video in motion, full-screen CarPlay, ambient, DRL, mirror fold, best options, what to code, exhaust and sound, digital speedo, battery registration, fault codes, OBDLink CX connect, ENET cable, fix after coding, Toyota techstream, Toyota GR86 and Supra, Mercedes Vediamo, Mercedes start-stop, Toyota hidden features app, Mercedes hidden features app | Worked; view counts are lifetime and were read on 2026-11-24 |
| Web search with Bimmerpost, E90Post and F30Post domain filter | 10 thread titles with one-line snippets (section 1.7) | Titles and snippets only; threads not opened |
| Web search, general ("BimmerCode what can I code F30 ...") | A few thread titles and a shared F30 coding list mention | Used only to confirm the topics exist |
| Earlier notes in this repo | `docs/plan/research-sprint.md` sections 1, 2, 5; `docs/plan/decisions.md`; `docs/plan/direction.md`; `docs/research/deep/EVIDENCE.md`; `deep/bmw-coding-demand-and-practice.md`; `deep2/user-jobs-and-demand.md`; `deep2/mercedes-and-toyota-reality.md` | Read to avoid repeating; this note adds counts only |

### Failed or not used

| Source | What happened |
|---|---|
| Bimmerpost forum pages (`f30.bimmerpost.com/forums/forumdisplay.php?f=429`, via the built-in browser tool) | On re-check, one G80 thread loaded through the fetch tool but the G05 and G07 thread pages gave the bot check. Earlier: HTTP 403 and a "Verifying access" bot check. I did not try to get past it. PARTIAL |
| Bimmerpost archive index pages (`.../archive/index.php/f-429-p-NN.html`) that a search listed | 404 when fetched |
| Bimmerpost home page | Returned the bot check page only |
| E90Post (`www.e90post.com/forums/forumdisplay.php?f=429`) | 301 redirect to the same Bimmerpost 403 host |
| F30Post | same network as Bimmerpost; not retried |
| Reddit direct (`www.reddit.com`, `old.reddit.com`, `.json`) | Blocked by the fetch tool and the built-in browser ("not allowed due to safety restrictions") |
| Reddit mirror (`redlib.catsarch.com`) | HTTP 429 |
| Bimmerfest (`www.bimmerfest.com/forums/`) | Redirected to `tollbit.bimmerfest.com`, a paid-access gateway for crawlers. Not followed |
| ClubLexus and MBWorld | Not tried this run (time) |
| Google Play review text, Google Trends | Not attempted. App-store review text is iOS only |
| Archive zeros for r/4Runner, r/Tacoma "techstream", r/GR86, r/W205, r/MercedesAMG, r/mercedes_benz "xentry" | The archive returned an error (empty body), not a zero. Not counted. Do not read as "no posts" |
| Several r/BMW and r/BmwTech title searches (for example "coding") | Timed out or returned an error; only "bimmercode" title searches in r/BMW, r/e90, r/f30 worked |
| Pull of r/BmwTech by date | Stopped after about 300 posts (archive error). Not used in any table |

Not used on purpose: any cracked, pirated or leaked tool, key or database. Posts and videos that point to them were counted only as "this kind of request exists" and never opened or linked.

Raw pulls and my labels are in the session scratch folder, outside the repo. No post text is copied into this note beyond short paraphrase.

---

## 6. OPEN QUESTIONS

1. **Bimmerpost counts.** The biggest BMW coding community was not read. If the owner saves two or three coding-forum index pages as text into the private folder (the plan's fallback), I can count titles from a real list. Would change: whether start-stop and video in motion are really this rare in threads, since older chassis boards may differ from the app-era subreddits.
2. **Thread counts versus job size.** A goal people solve from a video (start-stop, video in motion) leaves few threads. Is "searches per month" available? Not reachable here. Keyword-volume tools are paid.
3. **Does read-only connection help earn trust?** Connection trouble is 17.5% of threads and 21% of BimmerCode review text. A "check your adapter and car" tool is read-only and plausible, but nothing here shows people would use a second app for it. Capture sessions A and B on the owner's car (CX over BLE and WiFi ENET) will show real failure modes.
4. **Update-broke-my-coding.** 65 of 500 BimmerCode reviews are about new models or updates, and 10 of 16 start-stop reviews say it failed. A read-only "compare my coding to my last backup" view could address this. Open: is the backup file format readable without the app's own tooling? Needs legal and clean-room review, not guessed here.
5. **Archive completeness.** How many posts does the archive miss? Unknown. One check: ask the owner to count three visible r/bimmercode pages by hand.
6. **Toyota.** Does any Techstream-equivalent open data exist that makes "TPMS relearn" or "beep off" a read-first feature? `deep2/mercedes-and-toyota-reality.md` and the Toyota open-data notes say not confirmed. No new evidence here.
7. **Mercedes.** Archive count for "xentry" threads is missing (error, not zero). Low value, since the defer call does not depend on it.
8. **Sample labelling.** One reader labelled the samples. A second reader on the same 200 would tell us how much the lights and connection rows would move. Cheap to do if the owner wants the ranking to carry a decision.

---

## 7. What this means for the plan (short)

- **No change to the 12-week scope.** Writes stay bench-only, so the top goals (lights, CarPlay, sound, one-offs) remain out of reach on a real car.
- **Best fit for read-only:** adapter and connection help, a before-and-after view of what coding changed, and fault codes. These are the three goals this data supports serving first.
- **Do not build for start-stop or video in motion first.** They are high-awareness and low-thread, and BMW updates keep breaking them.
- **D10 default holds:** Toyota and Mercedes deferred. Add nothing to weeks 1 to 4.

---

## 8. Appendix: how each count was made (so someone can redo it)

1. Pool: page the archive newest-first, 100 per page, until empty, per subreddit. De-duplicate by post id. Drop posts whose title is "[removed]" or "[deleted]" for Table B only.
2. Random sample: sort pool by id, sample 200 with seed 2026. Table A labels are one per post, read from title plus the first 170 characters of body.
3. Table B patterns are case-insensitive word matches over title plus full body. They are deliberately loose and will over-count ("mirror", "battery", "adapter" with "cable").
4. Reviews: the Apple feed, newest first, 50 per page. Topic rows are word matches over title plus body.
5. YouTube: search results page, first 6 results, lifetime view count at read time. "Median" is of those 6.
6. Other-brand tables are hand-labelled the same way, with different goal names (key programming, setup, service procedures, acquisition).
7. Wilson intervals use z of 1.96 on the stated base. They measure sampling noise only.

## 9. Appendix: sample titles, so the labels can be sanity checked

Short paraphrased examples per row of Table A, not copied lists.

- **Lights:** ambient contour not in the menu; anti-dazzle on a US-spec adaptive headlight; hyper-flash blinker after a swap; angel eyes set to 100% and cannot be set back; delete amber side markers.
- **Adapter and connection:** cable will not connect to the phone; adapter reads fine then stops; "is this adapter compatible"; "does iDrive 8.5 work"; full licence resale; "why am I shown the paywall after buying".
- **CarPlay and head unit:** how hard is full-screen CarPlay; software version check for CarPlay; head unit missing after upgrading ID5 to ID6; nav on the digital dash.
- **Niche one-offs:** turn off TPMS; disable rear camera; rear-only park assist; remote start; steering angle sensor calibration; VIN change; open active grille.
- **Broke after coding:** iDrive reboot loop after a start-animation change; heated seats dead after coding; parking-light warning after coding; clock disappeared; headlight modules show "coding data invalid"; backup restore did not bring a setting back.
- **Cluster and display:** M dash on a G20; digital speed position; Sport plus in two places; HUD with RPM from an M3.
- **Sound:** active sound off; exhaust flap always open; chime options missing after a head-unit swap; volume ceiling after coding.
- **Start-stop (the one post):** feature stopped working after a software update cleared codes on a 2023 5 Series.
- **Video in motion (the one post):** option missing on an M140i.
