# Security research and misuse prevention for a tool that writes to cars

Status: research note for OpenDiag (Apache-2.0, BMW first, then Mercedes-Benz and Toyota/Lexus). Architectural level only. No exploit steps, no seed-key material, no OEM data.

How to read references: `[L12]` points to a row in the Source ledger at the end. "Single-source" means only one fetched page supports the claim. "Background knowledge" means I believe it but did not verify it in this run.

## Run limits, stated up front

- All four planned WebSearch queries were refused because the shared search budget was already used up. No source in this note was found by search. Every page was fetched by direct URL, chosen from my own knowledge of well-known primary sources. That biases coverage toward famous work and away from forum threads.
- I did not read Bimmerpost, Bimmerfest, MBWorld, ClubLexus or Reddit threads. Claims about how BMW/Mercedes/Toyota key-programming theft actually happens in the field therefore rest on general sources (Wikipedia, one blog) and not on forum evidence. This is the largest gap.
- About 13 fetches failed or returned nothing usable (listed under Open questions). They are not in the ledger. The ledger has 42 rows, and each one is a page that loaded and was read (PDFs were converted to text locally and read).
- Wikipedia is used for 14 of the 42 rows. It is useful for orientation but is medium reliability. Where a claim matters for a design decision I say so.

## Summary (10 bullets)

1. Diagnostics is the most powerful door into a car, and the standard gives it weak locks. The 2010 university study found that the diagnostic "tester" role is effectively open to any node on the bus, that seed/key checks use 16-bit values, and that many ECUs ignore the standard's own safety rules [L12]. The standard itself offers only session gating plus a seed/key unlock, no per-user rights [L5, L12].
2. Real attacks mostly reach diagnostics through something else first. BMW's head unit and phone module were rooted through USB, Ethernet-over-USB, Bluetooth and a rogue cellular base station, and then used to send arbitrary diagnostic requests through the central gateway [L10]. The 2015 Jeep attack ended the same way: remote entry, then diagnostic and normal CAN messages [L11]. A write tool is the same capability, only held by the owner.
3. Cars often do not refuse diagnostic writes while driving. BMW's own i3 answered diagnostic requests at road speed [L10]. The 2010 study put engine and transmission modules into reprogramming mode while moving, against the standard's wording [L12]. The Jeep work notes most ECUs ignore diagnostic messages above about 5 to 10 mph, but that this could be worked around [L11].
4. Keyless theft today is mostly not about breaking crypto. Relay attacks forward a valid exchange unchanged, so crypto strength is irrelevant [L6, L30]. CAN injection forges a "key present" message on an exposed bus. It was found on a Toyota RAV4, is described as industry-wide, and the seller's device list included BMW and Lexus [L1].
5. Key programming over the diagnostic port is a known theft route. Wikipedia reports that OBD key-cloning kits and immobiliser bypass tools are used in theft, with London police attributing about half of the city's roughly 20,000 yearly car thefts to them [L21]. This is a single, secondary source for the figure, and on fact-check the Wikipedia sentence had no inline citation, so treat the 50% as an unsupported police attribution. It is still the clearest evidence that a diagnostic write tool needs a hard line around immobiliser and key functions.
6. Brand, cloud and app weak points are as dangerous as in-car ones. The Curry write-up reports BMW and Rolls-Royce staff account takeover through SSO flaws, Mercedes-Benz internal access through a repair-shop tool that shared an employee login directory, and a Toyota Financial record-exposure flaw [L2]. Nissan's app API let anyone act on a car knowing only its VIN [L18]. If OpenDiag ever runs a server, this is its threat model.
7. Vendors fixed things by shrinking access, not by adding secrets. FCA closed network ports and the carrier blocked a port [L11]. BMW pushed configuration updates over the air and offered optional dealer software [L10]. The Toyota CAN-injection author recommends a short-term software check for bus errors and a long-term move to authenticated messages [L1]. None of these is something a third-party tool can supply.
8. Good safety architecture for a write tool already exists in open source. comma.ai keeps safety rules in a separate layer from the code that creates commands, boots in a silent mode, requires an explicit mode before any message goes out, bounds actuator changes, and demands 100% line coverage of the safety unit tests (opendbc README) and, per the panda README, mutation testing; the opendbc page ties mutation testing to its MISRA coverage checks [L3, L4, L14].
9. The supply chain is the quiet risk for an open-source tool. The xz backdoor was a slow social takeover of a lone maintainer plus code hidden in binary test files and a build step that existed only in the release archive [L17]. Defences with real tooling exist: signed provenance, keyless signing with a public log, reproducible builds, update metadata with expiry and rollback protection, and short-lived publishing tokens [L7, L8, L9, L19, L33, L38].
10. Law and policy lean toward repair but not toward theft or emissions tampering. The US anti-circumvention rule has repeatedly exempted diagnosis, repair and lawful modification of vehicle software, while excluding some categories [L25]. Right-to-repair law pushes manufacturers to share diagnostic information, and the one security objection the sources record is a federal agency's concern about hacking [L40]. Defeat-device history (VW) shows what emissions-related ECU software can be used for [L42].

## What I found

### 1. The diagnostic protocol and its built-in protections

What UDS offers [L5, single-source for the summary; Wikipedia]:
- A session system. Each session enables a different set of services, and the ECU is in one session at a time.
- A seed/key unlock for "restricted" services, with attempt limits and a required delay after failures, reported through negative response codes.
- A newer authentication service meant to prove identity in a stronger way.
- Services that matter for writing: routine control, write-by-identifier, the request that starts a download, and ECU reset.

What the 2010 university study found when it tested a real car [L12]:
- The unlock values were small (16 bits each) and the ECUs allowed one try about every 10 seconds, so one ECU could in principle be unlocked in roughly a week by brute force and several in parallel. They did it in about a day and a half.
- The standard says the algorithm must never live in the ECU, and says different ECUs should have different values. The authors observed that many such algorithms were already known in the tuning community. I note this only as evidence that the unlock is not a real access control. I did not look for or record any algorithm.
- Several modules skipped the challenge-response entirely.
- The standard says an engine controller should refuse to enter programming mode while running. The test car did not refuse. The engine stopped when the mode was entered, both on stands and on a closed course.
- The "disable communications" command was accepted at speed.
- Authors' framing: the diagnostic role is like a debugger, powerful by necessity, but the bus has no concept of per-user rights, so the "tester" role is open to any node.

The follow-up 2011 paper (read via text conversion, only skimmed for the relevant parts) added that the factory pass-through device (a laptop plus a small box on the OBD port) is itself an attack surface. A compromised dealer-side tool can pass an attack into the car, and the paper lists wired and Wi-Fi pass-through control connections as ways in [L13]. Single-paper evidence, but strongly relevant: any OpenDiag adapter path (Wi-Fi ENET, BLE) is this same kind of surface.

CAN itself has no authentication. Frames go to every node, and applications must add their own protection [L20]. The same page and the AUTOSAR page say nothing useful about newer message authentication, so I could not source it here [L26 was empty on this point].

### 2. Conference and paper evidence on diagnostics abuse and CAN injection

Jeep, 2015 [L11, plus L37 for context]: The paper shows that normal messages are seen all the time, and diagnostic messages are "more powerful", but ECUs usually ignore diagnostics at speed. The authors found ways around this and demonstrated steering and braking effects. The fix described is closed network ports in the head unit software and a carrier block, and the work led to a 1.4 million vehicle recall. They also report that the diagnostic tool for these cars used no cryptographic signatures on firmware for one component and that its flash scripts were readable once they had the tool. Architectural lesson: the remote entry was in the infotainment network, not in diagnostics. The damage came from diagnostics being reachable from there.

BMW, Keen Lab, 2018 [L10]: The summary report is deliberately light on detail. It reports 14 vulnerabilities across the head unit, the phone/telematics box and the central gateway, seven CVEs, and attack routes by USB, Ethernet-over-USB (a fixed gateway address and no restrictions on the adapter), the OBD port, Bluetooth and a rogue GSM base station. Two findings matter most for OpenDiag:
- The central gateway forwards diagnostic messages from the head unit and the telematics box into other buses. Once either is taken, the attacker can send diagnostic requests to ECUs on other buses.
- The report calls out a "lack of high speed limit" on diagnostics: most ECUs still answered diagnostics at road speed (confirmed on i3).
BMW's response: confirmed on 9 March 2018, mitigations planned 22 March, cellular-path measures in rollout from mid-April through remote configuration updates, and extra fixes as optional dealer software updates. The tested models were i3, X1 (F49), 5 Series (F18) and 7 Series (F02), with BMW confirming the head unit and telematics findings. The authors withheld most details and promised a full paper later. I did not find the full paper in this run.

CAN injection, Toyota RAV4, 2023 [L1]: Single-author write-up by a respected CAN security academic. The attack plugs into the CAN wiring at an easily reached point, impersonates the smart key receiver, sends a forged "key validated" message, relies on the gateway to copy it to the powertrain bus, and disturbs normal traffic so real frames do not collide. The investigation began because the attack leaves many fault codes. The author says the weakness is industry-wide. A device seller advertised many makes, including BMW and several Lexus and Toyota models. Recommended fixes: a gateway or immobiliser check that the bus has been healthy before accepting key messages (temporary), then authenticated messages with per-vehicle secrets (lasting). Both require manufacturer work.

Nothing I fetched covers UDS fuzzing papers directly. The arXiv search returned no results for my query, and my one guessed paper ID turned out to be an unrelated astrophysics paper, which I discarded without using. For fuzzing I only have the Caring Caribou README (below), the 2010 study's use of fuzzing to find unprotected control functions [L12], and the Keen Lab Bluetooth fuzzing note [L10]. UDS fuzzing is therefore a gap (see Open questions).

Caring Caribou [L15]: GPL-3.0 tool with modules for CAN discovery, fuzzing, UDS discovery, security-seed randomness checks, DoIP and XCP memory dumping. The page shows no explicit "authorized use only" warning. I read the README only. This is an existence proof that discovery and fuzzing of diagnostic services is already commoditised, so OpenDiag does not need to treat "can a stranger fuzz an ECU" as something it prevents. What it controls is whether its own product becomes the easiest way to do so.

Pwn2Own Automotive 2024 [L35]: targets were EV chargers, head units from three suppliers, a Tesla modem and Automotive Grade Linux. Bug classes were memory corruption, command injection and chained bugs. Relevance: head units and chargers are the entry points. A diagnostic write tool is downstream.

Car Hacking Village [L27]: an archive of DEF CON talks from 2019 to 2026 and a community. The page contains no rules of responsible testing. I did not read individual talks.

### 3. Vulnerability disclosures by brand

- BMW: Keen Lab 2018 above [L10]. Curry 2023 reports BMW and Rolls-Royce employee-account takeover through an identity service that leaked usernames and exposed a one-time-code endpoint, with dealer portal and internal tool access; the post says it has since been fixed [L2]. Single-source for the Curry claims, but from the researcher himself.
- Mercedes-Benz: Curry reports a repair-shop tool with open self-registration that shared a directory with employee login, giving internal code, chat, build servers and vehicle-related APIs, plus remote code execution on exposed management endpoints. The vendor first misjudged impact and asked for more proof. No fix is described [L2]. A 2025 Bluetooth-stack chain (PerfektBlue) is said to have been demonstrated against Mercedes-Benz, Volkswagen and Skoda units, with patches in 2024 [L37, secondary only].
- Toyota/Lexus: the RAV4 CAN injection with Lexus models on the seller's list [L1]. Curry reports only a Toyota Financial record-exposure flaw (the post does not mention Lexus) [L2]. I found no Toyota-specific diagnostic-tool abuse source in this run.
- Others used as pattern evidence: Nissan app API with VIN-only authorization, a vendor response that took weeks, and the service pulled only after the researcher published [L18]. Honda rolling-code replay weakness, where the vendor first denied the issue, then acknowledged it after a journalist reproduced it, and rated the risk low [L31]. Both show how slow disclosure can be and why a community tool should not depend on vendor goodwill.

### 4. Keyless relay and key programming abuse

Relay [L6, L29, L30]: A relay forwards the legitimate exchange without altering it, so it works regardless of modulation or encryption. One page cites ADAC's 2024 tests where 629 of 698 vehicles could be opened and started with relay equipment, and the ones that resisted used ultra-wideband ranging [L6, Wikipedia, single-source for the figure]. NCC Group showed that Bluetooth LE proximity systems can be relayed at the link layer with about 8 ms added delay, which defeats timing checks and does not need to break encryption. Its advice: do not treat a BLE connection as proof of closeness, ask for confirmation on the phone, or use time-of-flight ranging [L30]. This applies to OpenDiag directly: a BLE adapter link proves nothing about who is near the car.

Replay and rolling codes [L29, L31]: Rolling codes can be defeated by jam-and-capture (2015) or by design flaws in how the counter window resyncs (Honda, with ten models tested 2012 to 2022).

Key programming and immobilisers [L16, L21, L24]: Wikipedia states that programming a new key to the car is faster than cloning an existing one, that the ECU records unauthorized key-coding attempts in its diagnostics, and that OBD key-cloning kits and immobiliser bypass tools are used in theft. The OBD page adds that the OBD specifications lack authentication and authorization and rely largely on obscurity. The London police share is from one secondary page. I could not read primary theft reports or forum posts about BMW, Mercedes or Toyota key programming. I know from background that BMW and others later restricted key programming through newer immobiliser designs and server-side authorization, but I did not verify that here and do not rely on it.

Misuse is not only theft [L24, L42]: clearing fault codes can hide real problems. Emissions-related ECU software can be built to detect tests and change behavior, as VW's defeat device did. A tuning tool is not that, but it is the kind of tool people ask to switch emissions features off.

### 5. What vendors and ecosystems do as safeguards

- Close the remote paths and rely on network and carrier controls [L11].
- Remote configuration updates plus optional dealer updates [L10].
- Gateways that limit what comes from the head unit and phone box. Keen's finding is that BMW's gateway still forwarded diagnostics from them, so the isolation was weaker than designed [L10].
- Authenticated bus messages and key-message health checks [L1].
- Ultra-wideband ranging for relay resistance [L6, L30].
- Regulation: UN R155 (cyber security management) and R156 (software updates) exist as UNECE regulations [L36]. The page gives only titles. I could not read the regulation text or NHTSA guidance (both returned 403).
- Security-specific access programs for locksmiths and repair shops exist in the US, but the NASTF page was blocked, so I cannot describe it. Treat as unverified.
- comma.ai as a third-party example [L3, L4, L14]: silent-by-default firmware, explicit safety mode before any message, per-car safety rules in a separate project, 100% line coverage requirement, static analysis with a MISRA addon, strict compiler flags, hardware-in-the-loop tests, mutation tests. Forks that change the safety rules lose the trademark and may be banned from comma servers. Some modes that allow all output are disabled in release firmware.

### 6. Security practice for an open-source tool

- Provenance levels [L7]: SLSA Build L1 is provenance that is easy to forge, L2 is signed provenance from a hosted builder, L3 is a hardened builder where signing secrets are out of reach of user build steps.
- Keyless signing [L8]: short-lived certificates tied to an identity, with a public append-only log, so there is no long-lived private key for maintainers to lose.
- Update metadata [L9]: TUF protects against rollback (serving old files), freeze (hiding updates), and key compromise, using version numbers, expiry dates, hashes and trusted key lists. The page I read did not explain roles and thresholds, so I do not describe them.
- Reproducible builds [L19]: anyone can rebuild bit-for-bit and compare.
- Trusted publishing [L33]: CI exchanges a workflow identity for a 15-minute token instead of storing a long-lived one.
- Build attestations [L38]: GitHub can attest build provenance and SBOMs and verify them from the CLI. The page makes no SLSA-level claim.
- Scorecard [L22] and Best Practices badge [L39]: checklists covering signed releases, pinned dependencies, branch protection, code review, no binaries in the repo, token permissions, fuzzing, a security policy, 14-day first response to vulnerability reports, no known medium-or-worse unpatched vulnerability older than 60 days.
- NIST SSDF [L34]: four practice groups: prepare, protect, produce, respond.
- xz [L17]: pressure on a lone maintainer, a new "helper" gaining commit rights, obfuscated payload in binary test files, a build script only in the tarball, an ifunc hook. Found by accident by someone noticing slow logins. Lessons directly useful here: review binary fixtures, diff release archives against the repo, treat sudden maintainer additions as events, avoid single maintainers.

### 7. Legal and policy context (not legal advice)

- US anti-circumvention: exemptions in 2015, 2018, 2021 and 2024 for diagnosis, repair and lawful modification of vehicle software, with exclusions for some telematics/entertainment programs in 2015, subscription-service software in 2021, and a requirement not to use circumvention to reach other copyrighted works. A 2024 class adds access to telematics and operational data [L25]. Exemptions cover the user's act, not necessarily the act of distributing a tool, and I did not read anything on that point.
- CFAA: the Supreme Court read "exceeds authorized access" narrowly in 2021, but circumventing a block after notice has been held a violation in other cases [L41]. The page does not say whether car computers count. Treat as unresolved.
- Right to repair: Massachusetts laws of 2012 and 2020 on diagnostic information and vehicle data, with a federal agency stating in 2023 that federal law preempts the 2020 one. The agency's stated worry was hackers [L40].
- Emissions: VW shows regulators treat ECU software that changes emissions behavior as a defeat device [L42]. Not covered: how regulators treat tuning tool makers.

## Evidence quality and disagreements

- Strongest: Keen Lab BMW report [L10] (primary, vendor-confirmed, with CVEs, but a summary with details withheld); the Jeep paper [L11] and the two university papers [L12, L13] (primary, peer-reviewed or conference, but 2010 to 2015 and on non-BMW cars); the CAN injection write-up [L1] (primary, expert, single author, one car); the project READMEs and docs for supply-chain and safety tooling [L3, L4, L7, L8, L14, L22, L33, L38, L39].
- Weakest: the London theft share and the ADAC numbers [L6, L21] (Wikipedia citing others); AUTOSAR [L26] (empty on security); the FCA page [L28] (no relevant content).
- Timing: the diagnostic-at-speed behavior is documented for 2010 test vehicles [L12], a 2015 Jeep [L11] and a 2017 BMW i3 [L10]. Newer BMW (G-series) and the gateway changes are not covered here; the existing file `bmw-newer-cars-gateway-and-secure-diag.md` in this folder should be read alongside this note.
- Disagreement 1: speed gating. The Jeep paper says most ECUs ignore diagnostics above about 5 to 10 mph [L11]. Keen says most BMW ECUs they tested answer at road speed [L10]. The 2010 paper says the standard requires refusal but test cars did not refuse [L12]. These can all be true: vehicles differ, and behavior depends on the ECU. Do not assume a car will protect itself.
- Disagreement 2: how bad is relay theft in practice? One page says real thefts by relay are "not very prevalent" compared with demonstrations, while another cites high ADAC pass rates for relay equipment [L21, L6]. These measure different things (real-world incidents against technical susceptibility). I could not resolve the incidence question.
- Disagreement 3: vendor posture. BMW confirmed fast and shipped remote fixes [L10]. Honda denied then conceded [L31]. Mercedes initially misjudged impact [L2]. Nissan was slow [L18]. Do not generalise from one vendor.
- Single-source claims worth flagging: CAN injection device list including BMW and Lexus [L1]; the Mercedes and Toyota Financial items [L2]; London police share [L21]; ADAC 2024 numbers [L6]; PerfektBlue [L37].
- Source limitations in how I read: WebFetch summaries run through a small model, and two PDFs (Keen, Jeep) plus two university papers were read from converted text. For the university papers I searched for relevant passages instead of reading the whole text.

## Implications for OpenDiag

The aim is a free, honest tool that gives owners their own data and their own coding and tuning, without becoming a better lock-pick than what already exists. The sources support three principles: shrink what the tool can do by default, put the limits where they cannot be flipped by a UI toggle, and make the tool's own supply chain verifiable.

### Design requirements (numbered so they can be tracked)

Safety and write gating
- DR-1. Read-only by default. The first run, every new vehicle and every new adapter start in a mode that sends no write, reset or routine request. A write mode needs a visible switch and a per-session confirmation. (Pattern: silent-by-default firmware [L14].)
- DR-2. One policy layer that every outgoing request must pass, separate from the feature code that creates it, with per-vehicle allow-lists and deny-by-default for anything not listed. Adapter drivers should be unable to bypass it. (Pattern: safety rules in their own project [L3, L4, L14].)
- DR-3. Vehicle-state gating done by the tool, not trusted to the car. Do not send write-class requests unless the tool has independent evidence the vehicle is stationary, ignition state is as expected, and (for flashing) a battery support and power state check passed. Keen, Jeep and the 2010 study all show cars often will not refuse [L10, L11, L12].
- DR-4. Rate and size limits on all bus traffic, and a hard stop on unknown or repeated negative responses, to prevent brute-forcing of unlock services. The unlock attempt counter and delay in the standard exist because attempts were brute-forced in 2010 [L5, L12]. OpenDiag must never include a loop that retries unlock attempts.
- DR-5. Every write is reversible or recoverable, or labelled irreversible. Before any write, read and store the original value, keep a local rollback record, and refuse to proceed if the backup failed. For flashing, require a verified full backup first.
- DR-6. A kill switch and a fail-safe: a visible Stop that aborts the queue, and a default that leaves the car in its previous diagnostic session on error. Do not offer "keep alive" modes that keep the car in an elevated session when the app is closed.
- DR-7. Test the policy layer harder than the rest. Target 100% line coverage on the policy code, static analysis, and mutation testing of its tests, as comma.ai does [L14, L4]. Include a "should-be-blocked" test corpus per vehicle: each blocked operation has a test proving it is blocked.

Misuse prevention
- DR-8. Hard-coded blocked-operations list (below) enforced in the policy layer. It must not be removable through a settings file, a plugin, or a command-line flag in a release build. Forks can change it, but the project's name, signing and release channel should require that the blocked list tests pass. (Pattern: comma.ai fork rules [L3].)
- DR-9. Ownership tie-in without surveillance. For any function that touches theft-relevant systems or emissions, require evidence that the operator is at the car (a VIN read from the car, a fresh read-back, a physical-presence step). Do not collect identity. Store nothing off-device by default.
- DR-10. No remote operation. The tool does not accept commands from the network, does not have a hosted relay mode, and treats a BLE or Wi-Fi adapter link as untrusted. Pair adapters explicitly, show the adapter identity before writing, and do not treat Bluetooth proximity as authorization [L30, L13].
- DR-11. No server in the first version. If one is added later (pack distribution, telemetry, accounts), apply the API-authorization and directory-separation lessons from Nissan and Mercedes: authorize per object and per account, never trust an identifier alone, keep any staff/maintainer login separate from public sign-up [L2, L18].
- DR-12. Emissions and safety systems stay protected. Features that disable emissions controls, speed limiters, or safety restraints are not offered (blocked list). Tuning features limited to documented, reversible parameters, with clear labelling of local law concerns. The tool should not be a defeat-device builder [L42].

Packs and supply chain
- DR-13. Coding/tuning data ships as signed packs. Each pack carries a manifest with version, schema, targets, a hash for every file, an expiry date, and a signature. The app refuses unsigned packs unless an "unsigned local pack" developer mode is on, which never allows blocked operations. (Pattern: TUF metadata with expiry and versions [L9].)
- DR-14. Rollback and freeze resistance. The app remembers the highest pack version it has seen and refuses older ones, and warns if no update metadata has been seen for a set time [L9].
- DR-15. Signed releases with provenance. Build on a hosted CI, sign with keyless signing, publish build attestations and a software bill of materials, and aim for SLSA Build L2 first and L3 later [L7, L8, L38]. Publish with short-lived tokens only [L33].
- DR-16. Reproducible builds as a goal, with a published recipe so third parties can verify [L19].
- DR-17. Maintainer hygiene: at least two maintainers with required review on protected branches; new maintainers added through a written, delayed process; no binary blobs in the repo except reviewed fixtures with a documented origin; a CI check that compares release archives with the git tree [L17, L22].
- DR-18. Public security policy, a private reporting address, a 14-day first-response target, and a 60-day fix target for medium or higher issues, aligned to the Best Practices criteria [L39]. Track the badge and Scorecard results as project metrics [L22].
- DR-19. A contributor rule: no leaked, pirated or cracked OEM material, no seed-key or unlock algorithms, no contributed capabilities in the blocked list. CI scans pull requests for known patterns of this and a human reviews pack changes.

### Blocked-operations list (initial, architectural)

These are categories the policy layer refuses on every supported vehicle, in every build the project signs. They are described by what they do, not how.

1. Creating, adding, deleting or re-pairing vehicle keys or key fobs, and any write to immobiliser or key-authentication data. (Reason: the clearest documented theft route [L16, L21, L24].)
2. Disabling, bypassing or resetting the immobiliser, start-authorisation or anti-theft state, or clearing recorded key-coding attempt history.
3. Reading out or writing secrets used for vehicle authentication (key material, security keys), and any unlock or seed/key brute-force, repeated-attempt or dictionary loop [L12].
4. Injecting or replaying forged messages meant to imitate another control unit (including a key receiver or smart-key module) onto a live bus, and any "bus flooding" that stops other nodes from transmitting [L1, L12].
5. Remote or relayed operation: sending vehicle requests that originated outside the local adapter session, or bridging one adapter to a remote operator [L30, L10].
6. Sending write, reset, routine or flash-start requests unless stationary/state checks pass; never while the engine is running or the vehicle is moving [L12, L10].
7. Putting engine, transmission, brake, steering or airbag/restraint modules into reprogramming mode except through a vendor-defined, tested flash path with backup and power checks; no generic "enter programming mode" button [L12].
8. Turning off or altering safety and emissions functions: airbag/restraint monitoring, brake and stability systems, emissions monitors, particulate or NOx treatment, or speed-limiter and regulatory limits, where doing so is unlawful in many places [L42].
9. Clearing or masking fault codes and readiness monitors for the purpose of hiding a defect or passing an inspection (clearing as part of a documented repair is allowed with a record) [L24].
10. Changing odometer, VIN, or other identity and mileage-record values, and writing to event-recorder or tamper-log areas.
11. Loading unsigned or modified firmware images into modules from outside a verified, signed pack, except through the explicit developer mode that still excludes items 1 to 10.
12. Any function that uses leaked or unauthorized OEM data, cracked software, or third-party service accounts the user does not own [project rule, DR-19].
13. Bulk or fleet operations across many VINs in one session (a theft-ring pattern with no repair use) beyond a small, documented limit.

Allowed with confirmation and record: coding of documented convenience options, tuning maps from signed packs for the owner's own car, module resets as part of a documented repair, reading fault codes and live data without limit.

### What to build first

- A policy layer with the blocked list and its test corpus, before any write feature (DR-2, DR-7, DR-8).
- A read-only mode that is complete and useful on its own (DR-1).
- A pack format with signing, expiry and rollback protection (DR-13, DR-14) and a release pipeline with attestations (DR-15). Do this in month one while the repo is small.
- An audit log of every request and response in a local file the owner can export, with a hash chain so edits are noticeable. Not uploaded anywhere.

### What to avoid

- Any "unlock everything" or "learn the unlock" feature. Do not copy approaches from fuzzers that send random traffic to live cars [L15].
- Trusting adapter proximity or an app-to-adapter link as proof of ownership [L30].
- A hosted service in the first release, and any shared login directory between maintainers and users [L2].
- A plugin system that can add unrestricted operations without going through the policy layer.
- Marketing language about "bypassing" anything. The 2024 repair exemption language is about diagnosis, repair and lawful modification [L25]. The project's public wording should match.

### What to measure

- Blocked-operation test count and 100% pass in CI, plus mutation-test score of the policy tests [L14].
- OpenSSF Scorecard score and Best Practices badge status, tracked per release [L22, L39].
- Share of releases with verified signature, attestation and (eventually) reproducible-build match [L7, L19].
- Time to first response and time to fix for security reports, against the 14- and 60-day targets [L39].
- Number of write sessions aborted by state checks, and count of backup-before-write failures. A rising abort rate means real cars are being protected, or the checks are wrong.
- Number of pack-signature or rollback rejections in the field (opt-in, local counts only).

## Open questions

1. Primary evidence on diagnostic key-programming theft for BMW, Mercedes and Toyota. I have only secondary summaries [L16, L21, L24]. Needed: forum threads, police or insurer reports, and what newer immobiliser generations do. I did not read any forum.
2. UDS fuzzing literature. My arXiv search found nothing and web search was unavailable. Known gap. Next step: read the Car Hacking Village talk archive and academic fuzzing papers [L27].
3. Keen Lab's full technical paper (promised for 2019) was not found.
4. Regulatory text: UN R155/R156, NHTSA guidance, ISO/SAE 21434 and Auto-ISAC best practices. All were blocked or missing (403/404) or too thin [L36]. Needed to confirm what manufacturers must do about aftermarket diagnostic access.
5. Locksmith/technician vetting schemes (NASTF's program page returned 403). If OpenDiag wants an "authorized professional" mode, this is the model to study.
6. Whether newer BMW generations apply server-side authorization to coding and flashing, and how a third-party tool should behave when it is refused. See `bmw-newer-cars-gateway-and-secure-diag.md` in this folder.
7. Legal exposure for distributing a tool (as distinct from using one) under anti-circumvention and computer-misuse laws. Sources here cover users' exemptions only [L25, L41]. This needs a lawyer.
8. Whether a signed-pack scheme is workable for a volunteer project (who holds the root trust, how recovery works if a signer disappears).
9. How effective hard-coded blocked lists are when the tool is open source and forkable. comma.ai's answer is trademark and server access [L3]. OpenDiag has no server. What is the equivalent?
10. Failed fetches (not in ledger): Keen blog page (404), the CCDC mirror of the Jeep paper (404), a Jeep hack Wikipedia page (404), a Wikipedia page on OBD security (404), BMW ConnectedDrive Wikipedia (404), ISO/SAE 21434 Wikipedia (404), Awesome-Car-Hacking GitHub list (404), Auto-ISAC best practices (404), NHTSA 2022 best practices (403), UNECE R155 page (403), NASTF SVRSP (403), arXiv search (no results), a wrongly guessed arXiv ID (unrelated paper, discarded). Several PDFs came back as raw data and were converted to text locally before reading.

## Source ledger

All 42 rows below were fetched and read in this run. Reliability: high, med, low, for the claims I used from them.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| L1 | https://kentindell.github.io/2023/04/03/can-injection/ | Expert blog | How CAN injection theft works on a Toyota RAV4, seller device list incl. BMW/Lexus, short and long-term fixes | med-high (single author, one car) |
| L2 | https://samcurry.net/web-hackers-vs-the-auto-industry/ | Researcher write-up | BMW/Rolls SSO, Mercedes repair-tool SSO and RCE, Toyota Financial IDOR, other brands | med (researcher's own account, fixes mostly unverified) |
| L3 | https://github.com/commaai/openpilot/blob/master/docs/SAFETY.md | Project safety doc | Safety model, bounded actuation, separate safety layer, fork rules | high |
| L4 | https://github.com/commaai/panda | Project README | Safety mode in firmware, testing (static analysis, HIL, mutation) | high |
| L5 | https://en.wikipedia.org/wiki/Unified_Diagnostic_Services | Encyclopedia | UDS sessions, security access, routines, write/download/reset services, negative response codes | med |
| L6 | https://en.wikipedia.org/wiki/Relay_attack | Encyclopedia | Relay attacks independent of crypto, UWB defence, ADAC 2024 figures | med (figures secondary) |
| L7 | https://slsa.dev/spec/v1.0/levels | Standard | SLSA Build L0 to L3 meanings | high |
| L8 | https://docs.sigstore.dev/about/overview/ | Official docs | Keyless signing, short-lived certs, transparency log | high |
| L9 | https://theupdateframework.io/overview/ | Official docs | Update threats and metadata defences (roles/thresholds not covered) | high |
| L10 | https://keenlab.tencent.com/en/whitepapers/Experimental_Security_Assessment_of_BMW_Cars_by_KeenLab.pdf | Vendor-confirmed research report (PDF) | 14 BMW vulns, gateway cross-domain diagnostics, no speed limit on UDS, disclosure timeline | high (summary only) |
| L11 | https://illmatics.com/Remote%20Car%20Hacking.pdf | Conference paper (PDF) | Jeep attack, diagnostic vs normal CAN messages, speed gating, patch and carrier block, 1.4M recall | high |
| L12 | https://www.autosec.org/pubs/cars-oakland2010.pdf | Peer-reviewed paper (PDF) | Weak diagnostic access control, 16-bit unlock, reflash while moving, tester role open | high (2010 car) |
| L13 | https://www.autosec.org/pubs/cars-usenixsec2011.pdf | Peer-reviewed paper (PDF) | Pass-through tool as attack surface, external vectors | high (skimmed, searched not fully read) |
| L14 | https://github.com/commaai/opendbc | Project README | Safety code location, 100% coverage rule, silent default, modes disabled in release | high |
| L15 | https://github.com/CaringCaribou/caringcaribou | Project README (GPL; README only) | Existing discovery and fuzzing modules for CAN/UDS/DoIP/XCP | med-high |
| L16 | https://en.wikipedia.org/wiki/Immobiliser | Encyclopedia | Immobiliser design, weaknesses, key programming vs cloning, logging of attempts | med |
| L17 | https://research.swtch.com/xz-timeline | Expert analysis | xz backdoor timeline and lessons | high |
| L18 | https://www.troyhunt.com/controlling-vehicle-features-of-nissan/ | Researcher blog | VIN-only API authorization flaw, slow vendor response | med-high |
| L19 | https://reproducible-builds.org/docs/definition/ | Project docs | Definition of reproducible builds | high |
| L20 | https://en.wikipedia.org/wiki/Controller_Area_Network | Encyclopedia | CAN has no built-in auth, broadcast, apps must add security | med |
| L21 | https://en.wikipedia.org/wiki/Vehicle_theft | Encyclopedia | OBD key-cloning kits in theft, London share, relay/USB theft, stats | med-low (secondary figures) |
| L22 | https://github.com/ossf/scorecard | Project README | List of supply-chain health checks | high |
| L23 | https://upstream.io/reports/global-automotive-cybersecurity-report/ | Industry report summary page | 2025 incident stats (ransom, telematics/cloud origin); no theft breakdown | med |
| L24 | https://en.wikipedia.org/wiki/On-board_diagnostics | Encyclopedia | OBD lacks auth, key programming theft, dongle risks, code clearing | med |
| L25 | https://en.wikipedia.org/wiki/Digital_Millennium_Copyright_Act | Encyclopedia | Vehicle exemptions 2015 to 2024 | med |
| L26 | https://en.wikipedia.org/wiki/AUTOSAR | Encyclopedia | Almost nothing on security mechanisms (negative result) | low |
| L27 | https://www.carhackingvillage.com/ | Community site | Talk archive 2019 to 2026, no testing rules on page | med |
| L28 | https://en.wikipedia.org/wiki/Fiat_Chrysler_Automobiles | Encyclopedia | No relevant content on 2015 recall in the part read (negative result) | low |
| L29 | https://en.wikipedia.org/wiki/Keyless_entry_system | Encyclopedia | Rolling codes, rolljam, relay, insurer reaction | med |
| L30 | https://www.nccgroup.com/research-blog/technical-advisory-ble-proximity-authentication-vulnerable-to-relay-attacks/ | Vendor advisory | BLE link-layer relay, 8 ms, SIG response, mitigations | high |
| L31 | https://rollingpwn.github.io/rolling-pwn/ | Researcher site | Honda rolling code counter flaw, vendor response | med |
| L32 | https://en.wikipedia.org/wiki/SAE_J2534 | Encyclopedia | Pass-through standard stub; no security content | low |
| L33 | https://docs.pypi.org/trusted-publishers/ | Official docs | Short-lived (15-minute) tokens via OIDC | high |
| L34 | https://csrc.nist.gov/projects/ssdf | Government framework | SSDF four practice groups | high |
| L35 | https://www.zerodayinitiative.com/blog/2024/1/24/pwn2own-automotive-2024-day-one-results | Contest results | Targets and bug classes at Pwn2Own Automotive 2024 | med-high |
| L36 | https://en.wikipedia.org/wiki/World_Forum_for_Harmonization_of_Vehicle_Regulations | Encyclopedia | R155 and R156 exist (titles only) | med |
| L37 | https://en.wikipedia.org/wiki/Automotive_hacking | Encyclopedia | Timeline of notable hacks incl. Jeep, Kia/Hyundai, PerfektBlue | med |
| L38 | https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations/using-artifact-attestations-to-establish-provenance-for-builds | Official docs | Build provenance and SBOM attestations and CLI verification | high |
| L39 | https://www.bestpractices.dev/en/criteria/0 | Official criteria | Passing criteria incl. 14-day response, 60-day fixes | high |
| L40 | https://en.wikipedia.org/wiki/Right_to_repair | Encyclopedia | Massachusetts laws, preemption claim, hacker concern | med |
| L41 | https://en.wikipedia.org/wiki/Computer_Fraud_and_Abuse_Act | Encyclopedia | Case law on authorized access; vehicles not addressed | med |
| L42 | https://en.wikipedia.org/wiki/Dieselgate | Encyclopedia | Defeat device via ECU firmware | med |
