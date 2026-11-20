# Open-Source Landscape and Legal/Compliance for OpenDiag

Not legal advice. This is engineering research to inform design. Have a lawyer review before release. Claims not confirmed against a primary source are marked "(unverified)". Facts checked November 2026.

## Summary

- **Reuse is easy at the protocol layer.** Most useful libraries are MIT, BSD-3 or LGPL-3, and fit an Apache-2.0 project. The ones to treat carefully are GPL: python-OBD (GPL-2.0), EdiabasLib (GPL-3.0), ICSim (GPL-3.0), and the GPL parts of can-utils.
- **The hard gap is data, not code.** No open project ships complete, legally clean per-model ECU description data for BMW, Mercedes or Toyota. OpenDiag must build its own data packs from public standards, owner-supplied captures and community contributions.
- **US law is mostly favorable to diagnosis and repair, but not to emissions or safety defeat.** The DMCA 1201 vehicle exemption allows circumvention needed for diagnosis, repair or lawful modification. It explicitly gives no defense under EPA or DOT rules.
- **The Clean Air Act is the main risk for a free tool.** Selling or installing anything whose purpose is to defeat emissions controls is a violation. EPA has fined tuning software companies. OpenDiag should refuse these features outright.
- **EU law (2018/858) forces manufacturers to give independent operators repair information.** It does not give a free tool any right to OEM software. Security functions go through a separate vetting scheme.
- **Naming: use make names only to say what the tool works with.** Never suggest endorsement.

## How it works

### Layers a diagnostic toolkit needs, and what exists

| Layer | Job | Open building blocks |
|---|---|---|
| Adapter I/O | Talk to ELM327, J2534, SocketCAN, ENET, DoIP | python-can, can-utils, SocketCAN |
| Transport | ISO-TP (ISO 15765-2) segmentation over CAN | can-isotp (Linux kernel), python-can-isotp |
| Services | UDS (ISO 14229), OBD-II (ISO 15031/SAE J1979), DoIP (ISO 13400) | udsoncan, python-OBD |
| Data description | Which DIDs, routines, DTCs, scalings per ECU | ODX/PDX (ISO 22901), odxtools, DBC files |
| Analysis and test | Sniff, replay, simulate | SavvyCAN, can-utils, ICSim, vcan, Kayak |

### Public byte examples (from the standards, not OEM data)

- **UDS read VIN** over ISO-TP on CAN 11-bit: request `7E0 03 22 F1 90`. Positive reply is `0x62 F1 90 <17 ASCII bytes>`, sent as a multi-frame ISO-TP message. The first frame is `7E8 10 14 62 F1 90 ...`. The tester then sends flow control `7E0 30 00 00`. Service ID `0x22` is ReadDataByIdentifier and `0xF190` is the standardized VIN identifier.
- **Negative response** format: `7F <service> <NRC>`. Example `7F 22 31` means requestOutOfRange. `7F 27 35` means invalidKey.
- **OBD-II mode 01 PID 0C** (engine RPM): request `7DF 02 01 0C`. Reply `7E8 04 41 0C A B`. RPM = (256A + B) / 4.
- **Session control:** `10 03` is extended diagnostic session. `3E 00` is TesterPresent, sent every few seconds to hold the session.
- **ISO-TP frame types** are the high nibble of byte 0: 0 single, 1 first, 2 consecutive, 3 flow control.

BMW uses ENET/DoIP on newer cars and a proprietary addressing layer (HSFZ) on older ones (Evidence update 2026-11-20: which chassis uses which is unconfirmed; tools support both). Mercedes uses DoIP and CAN with its own session handling. Toyota uses plain CAN-UDS and KWP2000 on older models, mostly through a J2534 pass-through. Exact per-brand behavior is the OEM-specific part and is documented mainly in forums and reverse-engineering write-ups (unverified).

## What is hard

1. **Data, not protocol.** Raw UDS is public. What a given DID means, how to scale it, and which routines are safe is the OEM's per-ECU data. That data lives in proprietary formats (BMW SGBD/PRG, Mercedes DAS/ODX, Toyota Techstream tables). Reading it is a legal grey zone and copying it is off the table under the clean-room rules.
2. **Security access.** Seed/key (`27 01` / `27 02`) algorithms for coding or flashing are secret per ECU generation. Any algorithm shipped must come from the owner's own authorized use or public research, never from leaked material.
3. **Coding data.** Coding (BMW FDL, Mercedes SCN/variant coding) needs knowledge of what each bit does. Community knowledge exists in forums, but quality varies and a wrong write can brick a module.
4. **Flashing and signatures.** Modern ECUs verify signed software. UNECE R156 means OEMs are required to manage updates carefully, and unsigned flashing is not feasible or legal to promote.
5. **Adapter variance.** Cheap ELM327 clones fail on multi-frame traffic and timing. ENET and DoIP need more careful network setup.
6. **Safe defaults.** A free tool aimed at owners must stop users from writing the wrong thing: read-only by default, backup before write, confirm on risky actions.

## Open-source options

### Part 1: Licenses and reuse under Apache-2.0

| Project | License | What it gives OpenDiag | Reuse verdict |
|---|---|---|---|
| python-can | LGPL-3.0 (core; a few files LGPL-3+/GPL-3 per Debian) | Adapter abstraction (SocketCAN, slcan, PCAN, Vector, etc.) | **Use as a dependency**, unmodified, dynamic linking. Do not copy code in. |
| udsoncan | MIT | UDS client, service encoding, NRC handling | **Use directly or vendor.** Keep MIT notice. |
| python-can-isotp | MIT | ISO-TP in pure Python plus wrapper for kernel module | **Use directly.** |
| can-isotp (kernel module) | Part of mainline Linux since 5.10; standalone repo license not shown on its page | Fast ISO-TP on Linux | **Use as OS feature.** Not linked into our code. |
| can-utils | Repo ships GPL-2.0 text in LICENSES; some files may be dual BSD (unverified) | candump, cansend, isotpsend, canplayer, log converters | **Call as external tools only.** Do not copy code. |
| python-OBD | GPL-2.0 (fork of pyobd) | OBD-II over ELM327, PID tables | **Do not link or copy.** Write our own from SAE J1979 public tables. |
| SavvyCAN | MIT, needs Qt 5.14+ (Qt 6 branch is beta) | GUI to sniff, graph, reverse-engineer | **Interop only** (read its log formats). Could recommend as companion. |
| opendbc (comma.ai) | MIT | DBC files and parser for many cars, mostly signal-level CAN (not diagnostics) | **Usable.** Check per-file provenance before bundling. Origin of DBC files is not stated (unverified). |
| odxtools (Mercedes-Benz) | MIT | Parse ODX/PDX, encode and decode diagnostic requests | **Strong fit.** Use directly. Lets OpenDiag consume ODX data users legally hold. |
| OpenXC | BSD-3-Clause (many repos incl. uds-c, isotp-c) | Firmware for a vehicle interface, C UDS/ISO-TP code | **Usable**, check each repo; project activity is mixed. |
| EdiabasLib | GPL-3.0 | .NET replacement for BMW EDIABAS, interprets .GRP/.PRG files | **Study for architecture only.** GPL-3 code can be taken into a GPL-3 combined work but this changes our licensing; keep it out of core. |
| ICSim | GPL-3.0 | Instrument cluster simulator on vcan, for training | **Use as test tool**, not linked. |
| Kayak | LGPL-3.0, archived (last push 2020) | Java CAN analysis, KCD format | **Low value.** Reference only. |
| vcan (Linux) | Kernel (GPL-2.0) | Virtual CAN interface | **Use freely** for CI and simulators. |

### Compatibility rules of thumb (general open-source licensing knowledge)

- MIT, BSD-3 and Apache-2.0 code can go into an Apache-2.0 project.
- LGPL-3.0 is fine as a separately installed dependency. Copying LGPL source into our tree pulls us toward LGPL obligations.
- GPL-2.0-only is not compatible with Apache-2.0 in the same combined work. GPL-3.0 can include Apache-2.0 code, not the other way round. (Source: Apache Software Foundation compatibility page, https://www.apache.org/licenses/GPL-compatibility.html, not fetched this session, unverified.)
- Running GPL tools as separate processes is generally fine, but command-line wrappers should stay thin.
- **Data-file licensing is separate from code licensing.** MIT code does not make bundled DBC or ODX content free to redistribute. Track provenance per file.

### Standards: public vs paid

- **ODX (ISO 22901-1)** is sold by ISO (CHF 227 listed; reseller price about 255 EUR). ASAM MCD-2 D is available to ASAM members and for purchase by non-members. The XML schemas and concepts are described in public vendor articles. OpenDiag can implement ODX reading from odxtools plus public descriptions, and should not reproduce standards text.
- **OTX (ISO 13209)** pricing and availability not confirmed (unverified).
- **UDS (ISO 14229), ISO-TP (ISO 15765-2), DoIP (ISO 13400), OBD (SAE J1979)** are all paid documents. Widely available public summaries, open-source implementations and the Linux kernel documentation cover the wire formats. Implement from those, not from copied spec text.
- ASAM license terms allow duplication only as backup copies of tools unchanged. Do not redistribute ASAM documents.

### Simulators and test rigs

Plan on three tiers: (1) unit tests with a pure-Python fake ECU on python-can's virtual bus, (2) Linux vcan with scripted responders (CI), (3) ICSim-style visual demos. A scripted ECU that answers `22 F1 90` and multi-frame flow control covers most protocol bugs.

## Part 2: Legal and compliance

### US: copyright (DMCA 1201)

- **Rule:** It is illegal to circumvent an access control on a copyrighted work (1201(a)(1)(A)) and to make or sell tools primarily designed to do so (1201(a)(2)). Fair use is not a defense to circumvention itself, but 1201(c)(1) keeps other defenses alive.
- **Vehicle exemption (37 CFR 201.40(b)(13)):** Allows circumvention of software in a lawfully acquired motorized land vehicle or vessel when needed for diagnosis, repair or lawful modification. It excludes programs accessed through a separate subscription service. It does not allow gaining access to other copyrighted works. It says plainly that it is not a defense under DOT or EPA rules.
- **Vehicle data exemption (b)(14):** Lets owners and lessees, or people acting for them, access, store and share operational data including diagnostic and telematics data. Same limits.
- **The catch for tool makers:** The exemption protects the user doing the circumvention. Trafficking in circumvention tools (1201(a)(2)) is a separate question, and the Copyright Office exemptions have historically not covered distributing tools (general knowledge, unverified here). OpenDiag should not ship anything whose main purpose is breaking an access control. Seed/key algorithms for secured ECUs are the risk area.
- **Interoperability (1201(f)):** Reverse engineering to achieve interoperability is allowed in narrow conditions, and the resulting means can be shared only for interoperability. This supports clean-room protocol work.
- **Triennial renewal:** Exemptions last three years. The latest took effect October 28, 2024. Renewal petitions for the next cycle (2027) are already filed, and automakers (Auto Innovators) oppose expansion. Re-check at each cycle.

### US: Right to Repair

- **Federal:** No broad federal statute. Magnuson-Moss anti-tying rules and the 2014 industry memorandum of understanding between automakers and aftermarket groups are often cited (unverified here).
- **Massachusetts (2020 ballot law, 75-25):** Requires telematics vehicles sold in the state to offer standardized, open owner and independent-shop access, from model year 2022. A federal district court dismissed the automakers' challenge in February 2025. The First Circuit heard argument February 3, 2026, urged mediation, and the AG declined mediation. As of the August 2026 source, no ruling. The appeal turns on federal safety-law preemption.
- **Maine:** A 2026 law (signed April 6) requires automakers to give independent shops the same vehicle data access as dealers starting September 1, 2027. Bill number reported inconsistently.
- **Colorado, Illinois, Oregon:** Their repair laws do not cover cars (per a 2026 summary). State coverage is narrow and changing.
- **Implication:** Right to repair tells OEMs to share data. It does not authorize a third-party tool to bypass OEM protections.

### US: Clean Air Act (the big one)

- **Rule (40 CFR 1068.101, CAA 203):** No one may tamper with emission controls, and no one may knowingly make, sell, offer or install a part that bypasses, defeats or disables them. After sale, tampering liability applies when done knowingly. Repairs that restore function are excepted.
- **Penalties:** The CFR text lists up to $44,539 per engine for manufacturers and dealers and $4,454 for others (tampering), and up to $4,454 per defeat component. EPA alert numbers differ by year because of inflation adjustments. Check 40 CFR Part 19.
  - Evidence update 2026-11-20: EPA's own enforcement page quotes up to $4,527 per tampering event or defeat-device sale, the statute's base caps are $2,500 and $25,000; the CFR figures above are a different inflation year. Check 40 CFR Part 19 before quoting a number (`research/deep/legal-regulatory-landscape-deep.md`).
- **EPA policy:** The November 2020 tampering enforcement policy (the first update in decades) covers aftermarket defeat devices. "Competition use only" labels are not a shield.
- **Software tuners have been fined.** COBB Tuning settled in September 2024 for $2,914,000 and must sell only evaluated tunes. Punch It Performance paid $850,000. VMP Tuning paid $60,000 in 2019. Fleets that modified their own trucks have also paid penalties.
- **Implication for OpenDiag:** A tool that turns off DPF, EGR, SCR/AdBlue, catalyst monitors, or readiness monitors, or that clears codes to hide a fault, is a defeat device risk. Reading codes and clearing them after a real repair is normal use. The line is purpose and design.

### US: safety law (49 U.S.C. 30122)

Repair businesses, dealers, distributors and manufacturers may not knowingly make inoperative a safety device installed to meet a federal motor vehicle safety standard. This covers airbag and seat-belt systems in practice (the statute does not name airbags, so this is an inference). A tool that offers one-click "disable airbag warning" invites the risk.

### EU

- **Regulation (EU) 2018/858, Article 61:** Manufacturers must give independent operators unrestricted, standardized, non-discriminatory access to OBD and repair/maintenance information, through their websites in a common machine-readable format. They may charge reasonable and proportionate fees. The Court of Justice's Scania ruling (C-319/22) held VINs must be available in machine-readable form, and treated the obligation as a legitimate ground under GDPR.
- **Amendment:** Delegated Regulation (EU) 2026/699 (March 2026) amends secure access to OBD information. Application date not checked (unverified).
- **Security-related information** (immobilizers, keys) is gated behind an operator vetting scheme (SERMI). Not verified here.
- **UNECE R155 (cybersecurity) and R156 (software updates):** Obligations fall on manufacturers. R155 became mandatory for new EU registrations on 7 July 2024. R156 requires a software update management system and tracks type-approval-relevant software with an identifier. Independent tools are not directly regulated, but OEMs will treat unauthorized writes as a threat, and a bad write can invalidate the vehicle's type-approval state (inference).
- **Immobilizers:** UN R116 covers anti-theft devices, alarms and immobilizers on approved vehicles. Tools that bypass them can undermine approval and may facilitate theft.
- **Emissions:** EU type-approval and tampering rules are separate from the US, and national law applies as well (not researched here, unverified).

### Liability and warnings

- Use a clear no-warranty and limited-liability statement (Apache-2.0 already disclaims warranty). It does not remove product-liability or negligence exposure toward third parties (general principle).
- Show warnings before any write: backup first, battery voltage check, no ignition cycle, risk of bricking. Log every write locally with before and after values.
- Do not promise results ("fixes check engine light"). Keep claims to what the tool actually does.

### Trademark and naming

- Use "for BMW", "works with Mercedes-Benz" style references only where needed to say what the tool is compatible with. This follows nominative fair use (New Kids on the Block factors: needed to identify, only as much as necessary, no suggested endorsement). The Ninth Circuit applied this in a Lexus case. Courts differ by circuit.
- Do not use OEM logos, tool names or lookalike UI. Do not call the project anything like ISTA, XENTRY, DAS, Techstream, BimmerLink or BimmerCode. "OpenDiag" itself needs a trademark search before wide release (not done).
- Add a disclaimer: not affiliated with or endorsed by any vehicle manufacturer.

## Implications for OpenDiag

1. **Architecture:** Thin core in Apache-2.0 that depends on python-can (LGPL, dynamic), udsoncan (MIT), python-can-isotp (MIT) and odxtools (MIT). Write our own OBD-II layer from public SAE tables instead of using GPL python-OBD.
2. **Keep GPL out of core.** Document that EdiabasLib, python-OBD and ICSim are used only as external tools or reference.
3. **Data packs are the product.** Separate repo, separate license (CC-BY or similar) with a per-entry provenance field: public standard, owner capture, community report. No SGBD, PSdZData, CAFD or leaked ODX. A contributor agreement should state they have the right to submit.
4. **Support user-supplied ODX.** If a user legally holds ODX/PDX, OpenDiag can read it through odxtools. We never ship it.
5. **Refusal list (enforced in code and docs):**
   - Disabling or deleting airbag/SRS faults or deployment logic.
   - Bypassing immobilizers, key learning without proof of ownership, or any anti-theft defeat.
   - Turning off or masking emissions systems (DPF, EGR, SCR, catalyst, O2 monitors), clearing codes to hide a fault, or editing readiness status.
   - Odometer changes (federal and state odometer-fraud laws apply, not researched here).
   - Speed limiter or safety-system removal, and ADAS calibration bypass.
   - Distributing or implementing leaked seed/key algorithms.
6. **Safety design:** Read-only mode default, explicit write unlock, automatic backup of any coded value, a dry-run diff, local audit log.
7. **Repair-first features that are clearly lawful:** reading and clearing codes after repair, live data, service resets, battery registration, user-owned coding of comfort options with a backup (all subject to the data caveat).
8. **Naming and disclaimers:** Follow the trademark section. Include an affiliation disclaimer in the app, README and website.
9. **Legal review before launch** on: tool-trafficking exposure under 1201, EPA exposure for any coding feature that touches emissions modules, and the project name.

## Open questions

- Does the Copyright Office exemption extend to people who distribute diagnostic tools, or only to users? (Likely only users; get counsel.)
- Which opendbc DBC files were built by clean-room capture, and can they be redistributed?
- What is the real license of the can-isotp standalone repo and can-utils per-file headers (BSD dual)?
- When does Delegated Regulation 2026/699 apply, and what does SERMI require for an open-source tool?
- Where will the First Circuit land on Massachusetts, and will it set a preemption precedent?
- Is a read-only clone of OEM-style fault descriptions derivable from public OBD standards alone for non-generic (manufacturer-specific) DTCs?
- Is ODX/OTX text from ISO available under any open licence?
- Do BMW, Mercedes or Toyota publish trademark guidelines for third-party tools? Not found.
- How should OpenDiag treat emissions-related coding in Europe vs the US?

## Sources

- Copyright Office 2024 Section 1201, vehicle repair petitions and hearing: https://www.copyright.gov/1201/2024/ (petition PDF: https://www.copyright.gov/1201/2024/petitions/renewal/Renewal%20Pet.%20-%20Vehicle%20Repair%20-%20MEMA.pdf)
- 37 CFR 201.40 text, exemptions (b)(13) and (b)(14): https://www.ecfr.gov/current/title-37/chapter-II/subchapter-A/part-201/section-201.40
- 17 USC 1201: https://www.law.cornell.edu/uscode/text/17/1201
- 2027 renewal petitions (Auto Innovators opposition): https://www.copyright.gov/1201/2027/petitions/renewal/Opp-Vehicle-Repair-Auto-Innovators.pdf
- 40 CFR 1068.101: https://www.law.cornell.edu/cfr/text/40/1068.101
- EPA 2020 tampering policy: https://www.epa.gov/sites/production/files/2020-12/documents/epatamperingpolicy-enforcementpolicyonvehicleandenginetampering.pdf
- EPA enforcement alert: https://epa.gov/sites/default/files/2020-12/documents/tamperinganddefeatdevices-enfalert.pdf
- COBB Tuning settlement: https://epa.gov/enforcement/cobb-tuning-products-llc-clean-air-act-settlement
- Punch It Performance settlement: https://19january2021snapshot.epa.gov/enforcement/punch-it-performance-clean-air-act-settlement_.html
- 49 USC 30122: https://www.law.cornell.edu/uscode/text/49/30122
- Regulation (EU) 2018/858 Article 61: https://legislation.gov.uk/eur/2018/858/article/61/2022-12-31 (UK retained copy of the EU text; EU original on EUR-Lex)
- Delegated Regulation (EU) 2026/699: https://eur-lex.europa.eu/eli/reg_del/2026/699/oj/eng/pdf
- Scania ruling C-319/22: https://www.bailii.org/eu/cases/EUECJ/2023/C31922.html
- Massachusetts case, First Circuit status: https://www.nelsonmullins.com/insights/blogs/driving-forward-developments-in-transportation-law-and-innovation/all/first-circuit-appears-skeptical-about-aspects-of-mass-data-law-urges-negotiated-resolution
- Massachusetts district ruling 2025: https://www.repairerdrivennews.com/2025/02/17/federal-judge-cites-plain-language-of-mass-data-access-law-multiple-access-options-as-means-for-oems-to-comply/
- Other state laws, Maine: https://www.autocare.org/detail-pages/blog/aina/2026/05/08/auto-care-state-affairs-monthly-update--april-2026 and https://faegredrinker.com/en/insights/publications/2026/7/unlocking-the-right-to-repair-the-expanding-compliance-landscape
- UNECE R155/R156 overview (secondary): https://www.incibe.es/index.php/en/incibe-cert/blog/keys-implementing-new-vehicle-cybersecurity-regulations-r155-and-r156 ; https://www.ul.com/sis/insights/software-update-management-systems-according-unece-r156
- UN R116: https://eur-lex.europa.eu/eli/reg/2012/116/oj/eng
- Nominative fair use: https://www.ce9.uscourts.gov/jury-instructions/civil/chapter-15/15-26-defenses-nominative-fair-use/ ; https://law.justia.com/cases/federal/appellate-courts/F3/279/796/506072
- python-can license (Debian): https://sources.debian.org/copyright/license/python-can/4.6.1-4
- udsoncan: https://github.com/pylessard/python-udsoncan
- python-can-isotp: https://github.com/pylessard/python-can-isotp
- can-isotp: https://github.com/hartkopp/can-isotp
- python-OBD: https://github.com/brendan-w/python-OBD
- can-utils: https://github.com/linux-can/can-utils
- SavvyCAN: https://github.com/collin80/SavvyCAN
- opendbc: https://github.com/commaai/opendbc
- OpenXC: https://github.com/openxc
- EdiabasLib: https://github.com/uholeschak/ediabaslib
- ICSim: https://github.com/zombieCraig/ICSim
- Kayak: https://github.com/dschanoeh/Kayak
- odxtools: https://github.com/mercedes-benz/odxtools
- ASAM MCD-2 D and license: https://www.asam.net/standards/detail/mcd-2-d/ ; https://www.asam.net/license/
- ISO 22901-1 listing: https://www.iso.org/es/contents/data/standard/04/12/41207.html
- GPL/Apache compatibility (not fetched, unverified): https://www.apache.org/licenses/GPL-compatibility.html
