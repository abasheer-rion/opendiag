# BMW ECU flash security and tuning protection: what public sources say

Scope: architectural and behavioural level only. No keys, no seed-key algorithms, no bypass steps. Source references look like [S7] and point to the ledger at the end.

Honest volume note: I fetched and read 23 pages (the ledger). The brief asked for 35 or more. The shortfall is real. The web search budget ran out partway through, and about 25 further URLs failed (403, 404, 429, expired certificate, rate-limited safety check, empty body, or unreadable PDF). Failed URLs are listed under Evidence quality. Several claims below therefore rest on one or two sources and are marked single-source.

## Summary

- **Modern BMW engine computers (Bosch MG1 and MD1 families, roughly 2017 onward) are locked by design.** They use a hardware security module and secure boot, and have no ordinary open boot mode. [S1] [S14] (S1 is a vendor; S14 is Bosch's generic description, not MG1-specific.)
- **Older MEVD17 and EDC17 units were far more open.** They allowed a physical "boot" or "bench" read and write, and OBD tuning worked on them. [S1] (single source for the generation story)
- **A second lock level appeared in mid-2020.** Newer units block the old bench route and the old OBD flash protocols. Tuners now sell a mail-in or remote "unlock" first. [S1] [S3] [S4] [S6]
- **Dealers can lock an older unit too, through a normal software update.** An unlocked unit can be locked again the same way, and that can erase a tune. [S3] [S4] [S9] [S17]
- **BMW built tuning detection into its dealer tool.** A 2021 bulletin describes a pop-up and a fault entry meaning "suspicion of engine tuning", plus a warranty-clearing process. [S7]
- **A flash counter exists inside the ECU and dealers can read it.** Public detail on exactly what resets it is thin and partly contradictory. [S10] [S13]
- **The academic record shows recurring weakness classes in the diagnostic "seed and key" login:** short seeds, repeated seeds, weak home-made ciphers, and lockouts that do not hold. [S8] [S11] [S12]
- **Even a correct login is not enough once code can be loaded into the ECU.** Research showed that after logging in, an attacker could run their own code in RAM. [S8]
- **Hardware attacks (glitching) against older chips are public and well studied.** They are the reason newer designs rely on a security module and secure boot. [S12] [S18]
- **For OpenDiag, the realistic scope is reading, coding, logging, and clearing faults.** Writing engine calibration to locked units needs a route the owner or OEM authorises, and OpenDiag should not build or ship one.

## What I found

### 1. Generations: MEVD17, EDC17, MG1, MD1

**The older family.** Abrites describes the Bosch EDC17 and MED17 line as built on single-core Infineon TriCore chips with 2 to 4 MB of flash. Those units had a read-protection scheme that could be handled through a board-level "boot mode", or later a "bench mode" through the connector pins. [S1] BMW's MEVD17 is part of that older Bosch lineage, but I found no fetched source that says so in detail. The bootmod3 release notes confirm MEVD units exist in the bootmod3 world and describe their flash counter behaviour. [S13]

**The newer family.** The same source says MG1 and MD1 moved to multi-core chips, mainly Infineon AURIX, with 4 to 8 MB of flash. They added CAN FD, FlexRay and Ethernet, so they can act as central controllers. [S1] They carry what Abrites calls a Cyber Security Module and a secure boot. It says they have no conventional boot mode and are read mainly through the factory bench mode or special OBD protocols. [S1] This is a single vendor's account. I could not corroborate the AURIX claim for BMW's specific units from a second source.

**Gasoline versus diesel.** MG1 is the petrol family and MD1 the diesel one. The unlock vendors treat them together. [S3] [S6] EDC17 is the older diesel family. Nothing I fetched gave a BMW-specific split of which engine codes use which controller, so I do not list one. That is an open question.

**What the chip-level security module is.** Bosch describes a security module inside the microcontroller that holds keys, checks whether a software update is authorised, and supports a secure boot. [S14] At each start the ECU recomputes a reference over its software and compares it to a stored value. [S14] Updates carry a digital signature, checked against a root certificate held in the module. [S14] A chip vendor datasheet for the same chip family says the same in more detail: the module has its own CPU, hardware crypto, true random number generation, and it verifies software before it runs at start-up and before it is flashed. [S15] An industry article says the newer AURIX generation adds a dedicated cybersecurity module, virtual instances, and post-quantum support. [S23] [S20]

Caveat: S14, S15, S20 and S23 describe the chip and Bosch's general approach. None of them says "BMW MG1 does exactly this." The step from "Bosch and Infineon offer this" to "this BMW unit uses it" rests on S1 only.

### 2. Boot mode versus OBD flash

- **OBD flash** means talking to the ECU's own bootloader over the car's diagnostic port using the standard diagnostic protocol (UDS over CAN or Ethernet). The tool asks the ECU to enter a programming session, erases memory, downloads new software, and verifies it. [S11] describes this general flow for a Ford and a Toyota, and notes that the Toyota used a partly proprietary sequence rather than the standard one. [S11]
- **Bench or boot mode** means opening the ECU or using extra pins to reach the chip's own built-in loader, bypassing the car-level software. [S1]
- **Why locked units are hard.** On newer units the vendor-supplied bootloader checks that software is signed. The lock is therefore not just a password in the diagnostic session. Where the real check sits is a hardware-backed signature test, which is why the unlock services have to physically handle the unit. [S1] [S14] [S3]

### 3. Why modern ECUs are locked

Public reasons come from three directions.

- **Regulation and warranty.** A trade write-up from the 2025 Car Hacking Village says manufacturers argue locking protects drivers and emissions compliance, while enthusiasts see it as restricting owners. It also notes that an update can erase a tune. [S17] (single source for that framing; an opinion piece, not a primary document)
- **Engineering reasons.** The academic and Bosch material treats locking as the response to a long history of weak diagnostic logins and extractable firmware. [S12] [S14]
- **Business reasons.** The same S17 article says automakers also want to guard their software against copying. Treat this as the author's view.

I did not fetch the UN vehicle cybersecurity and software update regulations or ISO/SAE 21434 text itself. [S19] and [S23] mention ISO/SAE 21434 as a design standard but I read only abstracts and a trade summary of it. The regulatory story is therefore under-evidenced here (see Open questions).

### 4. The mid-2020 change

Three independent retailers say the same thing about timing.

- ARM Motorsports says BMW started locking DMEs from the factory around 2020, and that the DME's own build date matters more than the car's. [S4]
- Mode Auto Concepts, in its search listing, and a second listing from a European retailer both give June or July 2020 as the cut-off for the "locked" generation. I only saw those two in search snippets. They are not in the ledger. Treat as supporting, not primary.
- Weistec says 2021 and later cars are covered by its unlock, plus dealer-locked pre-2021 units. [S3]
- Abrites says Bosch changed the security in mid-2020 and that earlier units can generally be read and written on the bench or by OBD. [S1]

The sources agree on "mid-2020." The retailers differ slightly on what to call the boundary (June versus July versus model year 2021). That is a labelling difference, not a real disagreement. All of them are sellers of unlock services, so they have a commercial interest in describing the lock as hard.

### 5. How unlocking is described (behaviour only)

- Mail-in. The owner removes the unit, ships it, and gets it back unlocked. Weistec requires a separate unlock per ECU, a receipt in the box, and says the unlock is validated only with its own tools. [S3]
- ARM Motorsports ships the unit back quickly and says V8 engines with two DMEs need both sent. [S4]
- Carbahn says the unit "must be physically unlocked in a secure European facility" and says maps can then be flashed locally. [S6] That is marketing and conflicts with remote-unlock offers seen in search snippets. It is not a technical claim I would rely on.
- The unlock does not include a tune. [S3] [S4]
- Search snippets (not fetched) also mention a "remote unlock" for some MDG1 units. I could not read those pages. Single-source and unverified.
- I did not read, and will not describe, how any unlock works internally.

### 6. Relocking

ARM says BMW can relock an unlocked DME through a remote software update, which may also wipe the tune. [S4] Mode Auto Concepts says late models can lose an aftermarket tune through the Remote Software Upgrade feature, and gives a way to switch that feature off. [S9] Weistec tells owners to tell the dealer not to update tuned cars. [S3] The 2025 Car Hacking Village article repeats that updates can erase a tune. [S17] Four sources, three of them sellers, agree on the behaviour. None gives the technical mechanism.

### 7. Flash counter, tuning detection, checksums

- **Flash counter exists.** HP Academy, a tuning education site, says each reflash increases a counter inside the ECU that a manufacturer or service agent can read. Some owners got warranty claims approved after flashing back to stock, but it is not guaranteed. [S10]
- **bootmod3 says its counter resets when going back to stock.** Its release notes say the flash counter resets when re-flashing to stock or re-locking, for all MEVD DMEs. They also say the last-flash indicator lives on the DME itself and needs no server sync. [S13] This is the vendor's own statement, and it covers MEVD units. It does not say what happens on MG1.
- **Disagreement on whether tunes are detectable.** A search snippet from an older BimmerPost thread had one poster saying a flash is detectable if someone checks the counter, and another quoting a tuner representative saying there is no counter. I could not open the thread. Treat the claim of "no counter" as second-hand and contradicted by S10 and S13. A competitor flasher's marketing page (search snippet only) claims to keep the counter and checksum number untouched. That is not evidence either way.
- **BMW's own tool flags tuning.** BMW of North America Service Information Bulletin 00 04 21 (November 2021) says its dealer tool can now evaluate vehicle data and show a pop-up and a DME fault entry named "suspicion of engine tuning". It asks dealers to run an extra "check engine tuning" test and to open a "Repair Clearing" case for repairs in engine, fuel, cooling, exhaust and drivetrain groups. [S7] This is a primary source and reliable for what it says. It does not say what data the tool inspects, so I cannot say whether the counter is one input.
- **Checksum and signature concept.** A checksum (often called a CVN, calibration verification number) is a value computed over the calibration so emissions regulators can see changes. A signature is a cryptographic proof that the software came from the maker. On older units, tuners fix the checksum themselves after editing. On newer secure-boot units, an edited image fails signature checks unless the lock has been removed. [S14] describes the signature route; no fetched source explains the CVN in BMW terms. I rely on general knowledge for the CVN definition, and flag it as such.

### 8. Classes of weakness in diagnostic login (UDS SecurityAccess)

UDS service 0x27 is a challenge and response. The ECU sends a seed, the tool computes a key using a shared secret and a function, and the ECU compares. [S11] [S12] The public record points to these weakness classes. I describe classes only.

1. **Constant or repeated seed.** IOActive (2013 white paper, DEF CON 21) found one Ford module that returned the same seed every time, so a recorded login could be replayed. Other modules on the same car returned different seeds. [S11]
2. **Short seed or key.** The same paper notes that one Ford seed was 24 bits and could in principle be tried exhaustively. [S11] The 2024 VehicleSec paper cites earlier work finding that seed and key pairs of 8 or 16 bits fall to brute force. [S2] (secondary citation inside S2)
3. **Weak home-made cipher.** Van den Herrewegen and Garcia reverse engineered three diagnostic ciphers from four makers' firmware and found practical weaknesses in all three. [S8] The thesis expands on this: internal state of only 24 bits in one design, and low entropy in key material in others. [S12]
4. **Lockouts that do not hold.** IOActive noted a Toyota ECU changed its seed after several wrong keys and after each restart, which makes online guessing hard. [S11] The thesis notes lockout delays on one ECU could be reset by restarting the session. [S12]
5. **Secrets in the tool.** The IOActive work got Ford and Toyota algorithms by examining the dealer service software, not by attacking the ECU. [S11] This is a policy point: the secret is only as safe as the tool that ships it.
6. **Login protects too little.** The thesis and S8 show that once a login succeeds, diagnostic services can load and run code in ECU RAM, which gives full control. [S8] The login is a single gate in front of a very powerful interface.
7. **Gateway lets diagnostics through.** The 2024 paper shows a truck gateway that blocks injection but allows all diagnostic traffic. So weaknesses in diagnostic services themselves, not only in the login, matter. [S2] That test used heavy trucks, not BMWs.
8. **Standard is not the issue.** A 2022 SAE paper argues the service has a bad reputation but nothing inherent prevents a secure build, even on small ECUs without a hardware security module. [S19] (abstract only)

Search snippets (not fetched, so not ledger rows) also mention a 2026 Black Hat Asia talk claiming most seed-key flaws are implementation errors rather than protocol flaws, and a 2024 journal article observing typical 32-bit seeds. I could not open either. Single-source and unverified.

### 9. Bootloader and hardware attack classes

The Birmingham thesis has a chapter listing design mistakes in small-chip bootloaders. Examples: writing to a protected area, partial leakage of memory, incomplete erase that leaves secrets behind, timing differences that leak passwords, protection that defaults to "off", single unredundant checks that can be glitched, and over-complicated bootloader logic. [S12] It recommends independent review, cryptographic secure boot, and a small attack surface. [S12] A separate public write-up describes voltage glitching combined with serial and CAN access against an MPC5566-based ECU, which is an older, widely used chip. [S18] It does not describe a mitigation. These are the research classes that explain why vendors moved to hardware security modules.

Conference context. DEF CON Car Hacking Village talks on flash bootloaders and firmware updates exist (search snippets only for Lapczynski, DEF CON 26, and Hogan, DEF CON 27, whose pages I could not open). From the pages I did read: the DEF CON 32 village ran a capture-the-flag around secure software updates [S22], and a DEF CON 32 talk argued that ECU security has been long deprioritised [S21]. Neither is BMW-specific.

### 10. Public information on BMW's own programming path

I did not read BMW's own programming documentation. A BMW training PDF mirrored on a public archive turned up in search, but it is OEM internal material hosted without clear permission, so I deliberately did not open it. Everything about BMW's dealer flash path in this document comes from retailers, a BMW North America bulletin [S7], and bootmod3's notes [S13].

## Evidence quality and disagreements

**Strong.**
- BMW NA bulletin 00 04 21 [S7]: primary, specific, dated.
- Academic work [S8] [S11] [S12] [S2]: peer reviewed or institutional, but about other makers and older cars, except S2 which is about trucks.
- Bosch's own security description [S14]: primary but generic.

**Medium.**
- Abrites [S1]: a respected tool maker with technical detail, but it sells ECU services and its MG1 chip claims are single-source.
- bootmod3 notes [S13]: primary for bootmod3 behaviour, but only MEVD counter behaviour is stated and the page was truncated.

**Weak.**
- Unlock retailers [S3] [S4] [S6] [S9]: consistent with one another, but they sell the unlock and have an interest in the lock seeming difficult. Carbahn [S6] makes the strongest and least supported claims.
- Cedar [S5]: nearly empty for this topic. It only confirms that unlocks are priced separately. Listed for honesty, adds almost nothing.
- Opinion and event coverage [S17] [S21] [S22].

**Disagreements and conflicts.**
- Whether a physical lab is mandatory (S6) versus remote or mail-in options (search snippets). Unresolved.
- Whether a counter exists (S10, S13 say yes; a quoted forum claim says no). Weight toward "yes".
- Whether bootmod3 leaves the counter untouched on MG1: not established. S13 covers MEVD only.
- The exact date of the lock boundary: June, July, or model year 2021, depending on the seller. Reconcilable as a labelling difference.

**Pages that failed or that I skipped.** Not counted as read: MG Flasher wiki, bootmod3 wiki page LwAfq (empty), a Springer chapter (login redirect), CORE copy of the ESORICS paper (403), Black Hat Asia 2026 slides (too large), cisoclub DEF CON 26 and 27 pages (403), a Hardwear.io PDF (404), Pelechaty article (403), SAE TRID mirror, Reddit mirror and a BimmerPost G05 thread (errors), two F30Post threads (domain safety check rate-limited), Spoolstreet and 1addicts and Supra forum threads (403 or 500), Autotuner and Mode product pages (429), go-parts (403), obdii365 (certificate expired), MAGIC (500), SRD (403), ECS (403), DEF CON forum (connection reset), and the BMW training PDF (skipped by choice). A search-engine mention of a Spoolstreet "RSA bypass explained" thread was also skipped by choice because it describes circumvention.

## Implications for OpenDiag

**What OpenDiag can realistically do**
- **Read-only diagnostics.** Fault codes, live data, and vehicle identification over standard OBD and the BMW diagnostic protocols. No sources suggest any lock affects this.
- **Coding of body modules** (the BimmerCode category), because it uses data writes on comfort modules rather than engine software. This document does not cover that area deeply, so this claim is by inference and is flagged for the coding research doc.
- **Datalogging** on engine units, read-only.
- **Reading the ECU's identification, software version, and flash counter** where the ECU exposes it through ordinary diagnostic reads. Whether it is exposed on MG1 is unverified here.
- **Showing the owner what a dealer tool could see.** A "what does BMW see" report, built from public behaviour, is useful and honest.

**What needs OEM or owner-authorised routes**
- **Writing engine calibration or software to any secure-boot unit.** The signature check means an open tool cannot do this without a vendor-controlled or owner-authorised unlock path. [S1] [S14] OpenDiag should not build, ship or document a way around a lock.
- **Anything involving seed-key secrets.** Even the public research shows those secrets live in vendor tools. OpenDiag should not ship them and should not host them.

**What to build**
1. **A protocol layer that is honest about state.** Detect the ECU family, software version and lock status, and tell the owner "this unit is locked; OpenDiag will not write calibration to it."
2. **A clear refusal path** for writes OpenDiag cannot do, with the reason in plain words.
3. **A safe-session guard** for any write: battery voltage check, no ignition off, explicit confirmation, and recovery notes. The brick risk is a repeated theme. [S3] [S4]
4. **Update-awareness.** Warn owners that remote software updates can erase an aftermarket flash and show them how to check the setting. [S4] [S9] This is useful even for users of other tuning tools.
5. **A security-reading mode** that reports what the ECU says about its own session security (whether seed-key is required, lockout behaviour), for researchers, on the owner's own car. Keep it observational.

**What to avoid**
- Any code, data file or documentation of seed-key algorithms, signature bypass, boot-mode pinouts for locked units, or unlock procedures.
- Claims about being undetectable. The public evidence says dealer tools can detect tuning [S7] and the counter exists [S10].
- Relying on the vendor claims in S3, S4, S6 as technical truth.

**What to measure**
- Share of OpenDiag test cars that report as locked versus unlocked, by DME build date.
- Rate of failed or aborted writes, and whether any leaves a car needing recovery. Target is zero.
- Number of owners who report losing a tune to a remote update after reading the warning.
- Accuracy of the lock-status detection against the owner's known state.

## Open questions

1. Which BMW engine codes use which Bosch family, and from which build date? No fetched source gives a table.
2. Does a bootmod3 or other OBD flash on MG1 change the flash counter, and what do dealer tools actually read? Only MEVD behaviour is documented in what I read.
3. What exactly does the "suspicion of engine tuning" check inspect? S7 does not say.
4. What do the UN cybersecurity and software update rules and ISO/SAE 21434 require of diagnostic access? I read only secondary mentions. Needs a dedicated pass.
5. What does the US right-to-repair and anti-circumvention law say about owner modification of ECUs? I did not fetch any legal source in this run.
6. Is the unlock really remote on some units, and what does the unit do differently once unlocked? Single-source retailer claims only.
7. What do the DEF CON 26 and 27 flash-bootloader talks and the 2026 Black Hat talk actually contain? Pages failed to open.
8. How does BMW's Ethernet-based programming interact with the lock, compared with CAN? Not covered by anything I fetched.

## Source ledger

All rows below were fetched and read in this run. "Type" and "reliability" are my judgement.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| S1 | https://abrites.com/blog/bosch-mg1-md1-ecus-mysteries-myths-and-legends | Vendor blog | MG1/MD1 versus EDC17/MED17: chips, secure boot, no ordinary boot mode, mid-2020 lock change | Medium |
| S2 | https://www.ndss-symposium.org/wp-content/uploads/vehiclesec2024-46-paper.pdf | Academic paper (VehicleSec 2024) | UDS specification weaknesses on heavy trucks; gateway lets all diagnostics through; cites older seed-key work | High (trucks, not BMW) |
| S3 | https://www.weistec.com/media-events-press/amp/weistec-engineering-now-unlocks-and-tunes-mercedes-and-bmw-bosch-mg1-ecus/ | Tuner press page | Mail-in unlock per ECU; factory lock, dealer lock; 2021+ and some earlier | Medium-low (seller) |
| S4 | https://armmotorsports.com/blogs/news/bmw-dme-locked-here-is-how-to-find-out-and-fix-it | Tuner blog | Locking since about 2020; DME build date matters; relock by remote update; bench unlock service | Medium-low (seller) |
| S5 | https://cedar-performance.com/?p=12360 | Tuner shop page | Almost nothing relevant; unlocks priced separately | Low |
| S6 | https://carbahn.com/blogs/news/buying-guide-understanding-ecu-unlocks-why-some-dmes-require-shipping | Tuner blog | Encrypted bootloaders on MG1/MD1; claims physical unlock facility needed | Low (marketing) |
| S7 | https://static.nhtsa.gov/odi/tsbs/2021/MC-10205598-9999.pdf | OEM bulletin (BMW NA SIB 00 04 21) | Dealer tool detects suspected tuning; fault entry; warranty clearing case process | High |
| S8 | https://research.birmingham.ac.uk/en/publications/beneath-the-bonnet-a-breakdown-of-diagnostic-security/ | Academic abstract page (ESORICS 2018) | Weak diagnostic ciphers in three of four makers' firmware; remote code execution after login | High (abstract only) |
| S9 | https://modeautoconcepts.com/pages/how-to-disable-remote-software-upgrade-on-your-bmw-to-prevent-loss-of-aftermarket-flash-tune | Tuner support page | Remote Software Upgrade can remove a tune; how to switch it off | Medium-low |
| S10 | https://hpacademy.com/courses/practical-reflash-tuning/reflash-basics-warranties | Tuning education page | Flash counter exists and can be read; warranty notes | Medium |
| S11 | https://ioactive.com/pdfs/IOActive_Adventures_in_Automotive_Networks_and_Control_Units.pdf | Conference white paper (DEF CON 21 era) | Seed-key behaviour on a Ford and Toyota: repeated seed, lockout and seed refresh, secrets in dealer tool, programming flow | High (old, other makers) |
| S12 | https://etheses.bham.ac.uk//id/eprint/11516/1/VandenHerrewegen2021PhD.pdf | PhD thesis | Weak ciphers, low entropy, bootloader anti-patterns, secure bootloader design directives | High |
| S13 | https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/1962475521 | Vendor release notes | Flash counter resets on return to stock or relock on MEVD DMEs; indicator stored on DME | Medium-high (vendor, partial page) |
| S14 | https://bosch-mobility.com/en/mobility-topics/cybersecurity/ | OEM-supplier page | Security module as trust anchor, secure boot, signed updates | Medium-high (generic) |
| S15 | https://www.ttcontrol.com/sites/default/files/documents/TTC2000-Security-Package-Datasheet.pdf | Chip/ECU vendor datasheet | Security module features on second-generation AURIX: crypto, random numbers, secure boot and download | Medium (other vendor's product) |
| S16 | https://arxiv.org/pdf/1910.09410 | Academic paper (arXiv) | Skoda Octavia security study; describes chip tuning via OBD flash tool and map editor | Medium (little on security access) |
| S17 | https://pasmag.com/events/event-coverage/car-hacking-village-2025-how-hackers-are-finding-flaws-in-modern-cars | Trade news | Locking versus right-to-repair framing; updates can erase tunes | Low-medium |
| S18 | https://it4sec.substack.com/p/hacking-an-ecu-from-an-undisclosed | Researcher blog | Glitching plus serial and CAN access against an MPC5566-based ECU | Medium-low |
| S19 | https://saemobilus.sae.org/content/2022-01-0132 | Academic abstract (SAE) | Secure UDS SecurityAccess design for constrained ECUs without hardware security | Medium-high (abstract only) |
| S20 | https://international.electronica-azi.ro/infineon-and-etas-collaborate-to-optimize-security-of-next-generation-aurix-microcontrollers-with-escrypt-cycurhsm/ | Trade news | AURIX security module software, ISO/SAE 21434 compliance; little on secure boot | Medium |
| S21 | https://infocondb.org/con/def-con/def-con-32/the-hack-the-crash-and-two-smoking-barrels-and-all-the-times-i-almost-killed-an-engineer | Conference listing | DEF CON 32 talk on automotive ECU security culture; no BMW detail | Medium (abstract) |
| S22 | https://redballoonsecurity.com/category/blog-post/conferences/feed | Security company feed | Car Hacking Village challenges on secure software update systems | Medium (index only) |
| S23 | https://www.eenewseurope.com/en/infineon-adds-more-security-for-aurix-tc4x-controllers | Trade news | Newer AURIX generation: cybersecurity module, virtualised instances, post-quantum support | Medium |
