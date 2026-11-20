# Mercedes-Benz diagnostics: DAS / XENTRY / Vediamo / DTS Monaco

Research note for OpenDiag. Clean-room: built only from public sources (Mercedes B2B pages, Softing product pages, EU law, open-source READMEs, forum accounts). No proprietary data, leaked software, or bypass methods are described or linked. Claims drawn from forums or vendors are labelled.

## Summary

- Mercedes diagnostics is a layered stack: a workshop application (DAS, then XENTRY) sits on a standards-based diagnostic server, which reads per-ECU description data and talks UDS (ISO 14229) over CAN or DoIP (ISO 13400) through a vehicle interface (SDconnect/C4/C6, or a J2534 Pass Thru device).
- Engineering tools (Vediamo, DTS Monaco) are the same architecture with the guardrails removed: raw access to ECU description files, variant coding, and scripted sequences.
- Since about 2020 the hard part is no longer the wire protocol. It is authorization: personal login, role-based rights, per-session online checks, and server-issued coding data (SCN) for newer cars.
- An open tool can legitimately cover: standard OBD-II/EOBD, UDS reads (VIN, DTCs, live data), and DoIP transport. Write access to security-gated ECUs is not achievable without Mercedes or a licensed intermediary. OpenDiag should not try to circumvent it.
- The EU gives independent operators a legal right to repair information, and a certified route to security-gated functions (SERMI). Those are the legitimate paths for an independent tool.

## How it works

### Software layers

| Layer | Role | Mercedes example | Open/standard analogue |
|---|---|---|---|
| Workshop UI | Guided tests, fault trees, repair info | DAS (older), XENTRY Diagnosis | OpenDiag UI |
| Diagnostic server | Symbolic access to ECUs, session handling | MCD-3D style server (ISO 22900-3) | UDS client library |
| ECU descriptions | Services, parameters, coding fields, variants | CBF, SMR-D (Mercedes formats), ODX | ODX/PDX (ISO 22901-1) |
| Interface API | Talk to the adapter | D-PDU API (ISO 22900-2), J2534 | J2534, SocketCAN, DoIP |
| Transport | Bytes on the bus | ISO-TP over CAN, DoIP over Ethernet | ISO 15765-2, ISO 13400 |
| Application protocol | Services | UDS, older KWP2000 | ISO 14229 |

Softing, the maker of DTS Monaco, publicly lists support for ISO 22901-1 / ASAM MCD-2D (ODX V2.2.0 and 2.0.1), ISO 22900-3 / MCD-3D, ISO 22900-2 D-PDU API over CAN, K-line and Ethernet, and ISO 13209 / OTX. [Softing DTS.monaco](https://automotive.softing.com/products/softing-dts/softing-dtsmonaco.html) Whether Mercedes' own XENTRY uses the same server internally is not publicly confirmed (unverified).

### Tools by purpose

- **DAS** (older, to roughly the W204/W212 era) and **XENTRY** (current): official workshop tools. XENTRY is online by design. Startup checks access rights online, and if that fails, XENTRY will not start. [Mercedes B2B: XENTRY Pass Thru EU](https://b2bconnect.mercedes-benz.com/LT/shop/workshop-solutions/xentry-pass-thru-eu)
- **Vediamo** (Softing-based, released around 2012 per one forum account) and **DTS Monaco** (Softing DTS 8): engineering testers. Forum accounts say both open Mercedes CBF and SMR-D description files, that SMR-D is the newer format, and that Monaco 8.x needs a DoIP or SD-class adapter to use CBF. (forum claims, unverified; links removed because those threads centre on unlicensed copies of the tools).
- **XENTRY Pass Thru (EU)**: Mercedes' official route for independents. Uses any Pass Thru device meeting the standard; Mercedes tested Actia Passthru + XS 2 G, Bosch KTS 560 and ADIS EURO VCI. Coverage is limited to Euro 5/6 cars and vans and pure battery EVs. Full coverage needs the XENTRY Diagnosis Kit. [Mercedes B2B](https://b2bconnect.mercedes-benz.com/LT/shop/workshop-solutions/xentry-pass-thru-eu)

### Description files (CBF, SMR-D, ODX)

- Each ECU variant has a description file listing services, data identifiers, DTC texts, session rules, and coding structure.
- ODX is the open version: XML in a PDX zip, standardised as ASAM MCD-2D / ISO 22901-1. [odxtools](https://github.com/mercedes-benz/odxtools)
- CBF and SMR-D are Mercedes-ecosystem formats. Their internals are not publicly specified (unverified). OpenDiag must not reverse engineer or redistribute them; it should define its own pack format (see Implications).

### Coding concepts

| Term | Meaning | Source quality |
|---|---|---|
| Variant coding | Writing a configuration block into an ECU (options like lighting, start-stop behaviour). In Vediamo: select ECU, read variant, edit parameters, write. | Forum guides |
| SCN coding | Software Calibration Number coding. The car's ECU gets coding data issued by Mercedes' backend after an authenticated online session. Needed when a new part is fitted or software is updated on newer models. | Mercedes pages on post-2020 login; details from forums/vendors |
| Flash / programming | Replacing ECU software. Needs a Flash role, a separate second authentication. | Mercedes B2B |

A German workshop blog claims FBS4 cars (W205, W212 facelift) need online SCN verification with a token lifetime of 60 seconds. This is a single non-Mercedes source (unverified). [kfz-dietrich](https://kfz-dietrich.com/blog/mercedes-diagnose-scn-codierung-erklaert/)

Community-described coding categories (all forum-level, verify per car):

- **Comfort / convenience:** mirror folding, DRL behaviour, chimes, ambient light. Low risk, reversible if the original string is saved.
- **Lighting and display:** headlamp types, cluster layout. Medium risk; may affect homologation.
- **Drivetrain and driver aids:** start-stop memory, speed limiters. Higher risk, and gated by seed/key security access on many ECUs.
- **Safety systems (airbag, ABS/ESP, steering):** gated and legally sensitive. OpenDiag should keep these read-only.
- **Retrofit / part adoption:** new head unit, camera, SAM. Usually needs SCN or equivalent online data.

### Vehicle buses and DoIP

- Classic Mercedes cars use several CAN buses with ISO-TP, reached on OBD pins. Mercedes uses named buses (for example CAN-C for powertrain and CAN-B for body in older models), and a diagnostic gateway on newer cars (naming per forums, unverified).
- DoIP (ISO 13400) is required for full diagnosis and flashing on newer models. One workshop blog says from model year 2017; another vendor says about 2019. The dates disagree, so treat "mid/late 2010s" as the claim (unverified). [kfz-dietrich DoIP](https://kfz-dietrich.com/blog/fahrzeug-diagnose-can-doip-uds-werkstatt-tiefendiagnose/)
- Ethernet appears on OBD pins 3 and 11 on DoIP cars, so a DoIP-capable adapter or activation cable is needed (same blog, unverified).
- Mercedes says a Pass Thru device can use DoIP only if the device itself supports it. Otherwise head unit and cluster flashing on current cars is not possible. [Mercedes B2B](https://b2bconnect.mercedes-benz.com/LT/shop/workshop-solutions/xentry-pass-thru-eu)

Public protocol examples (from ISO 14229 / ISO 13400, widely documented; see doipclient and python-udsoncan):

| Step | Bytes | Meaning |
|---|---|---|
| Read VIN | `22 F1 90` -> `62 F1 90 <17 ASCII>` | ReadDataByIdentifier, standard VIN DID |
| Extended session | `10 03` -> `50 03 ...` | DiagnosticSessionControl |
| Security seed request | `27 01` -> `67 01 <seed>` | SecurityAccess, level 1 |
| Negative reply | `7F <sid> <nrc>` | NRC 0x33 = security access denied; 0x22 = conditions not correct |
| DoIP header | `02 FD <type 2B> <len 4B>` | version 0x02, inverse 0xFD. Port 13400 UDP/TCP |
| Routing activation | payload type `0x0005` | Tester registers with the gateway |
| Diagnostic message | payload type `0x8001` | Carries the UDS request, source and target logical addresses |

## What is hard

1. **Authorization is the product.** Mercedes' security concept since release 06/2020 requires personal login. It was required for model series 213 (model year 2020) and 223. For programming and coding, a second authentication is needed, similar to a TAN for online banking. Standard and Extended Flash roles are granted per user after one-time identification through UMAS. [Mercedes B2B XENTRY Flash](https://b2bconnect.mercedes-benz.com/gb/workshop-solutions/diagnosis/xentry-flash) (as summarised by search; page not directly retrievable).
2. **Write access is bound to a person.** For passenger cars, write authorizations need prior personal authentication at Mercedes-Benz AG or at an independent tool maker that has a data-use agreement with Mercedes. Certificates are bound to an organization or person depending on level. (same source)
3. **Lock-in after coding.** Mercedes states that after SCN coding and programming, these vehicles cannot be repaired or diagnosed without diagnosis access authorization. (same source)
4. **Online dependency.** Pass Thru EU checks a StartKey tied to a hardware ID and time credits online per session. [Mercedes B2B](https://b2bconnect.mercedes-benz.com/LT/shop/workshop-solutions/xentry-pass-thru-eu)
5. **Security gateway.** Newer cars gate theft- and security-relevant functions, and independents need SERMI. In trucks the guide says the role stays valid 12 hours. [Mercedes B2B SERMI FAQ](https://b2bconnect.mercedes-benz.com/gb/help/faq/sermi-authentication/sermi-authentication); [Trucks SERMI quick guide](https://service-info.mercedes-benz-trucks.com/media/wysiwyg/DIAGHW/en_SERMI_Quick_Guide.pdf)
6. **Data licensing.** Description files and coding datasets are proprietary. Without them, an open tool must discover and describe everything itself, which is slow and risky.
7. **Adapter fragmentation.** Some J2534 devices lack DoIP. Forum reports say Monaco with some Pass Thru devices cannot open CBF files while Vediamo can (unverified).
8. **Safety and liability.** A wrong coding write can disable airbags or lights. Backups, checksums and read-back verification are essential.

## Open-source options

| Project | Use | License |
|---|---|---|
| [odxtools](https://github.com/mercedes-benz/odxtools) | Parse ODX/PDX, encode/decode UDS messages, snoop live sessions, compare databases. | MIT |
| [python-doipclient](https://python-doipclient.readthedocs.io/) | Pure Python DoIP client against ISO 13400-2019, built as a transport for udsoncan. Spec version 0x02 is what most ECUs speak. | MIT |
| python-udsoncan | UDS client (pairs with doipclient). | (license not verified here) |
| python-uds | Another UDS stack with a DoIP path via doipclient. | (not verified) |
| SocketCAN / can-isotp (Linux) | CAN and ISO-TP transport. | GPL/LGPL (unverified) |
| SAE J2534 | Pass Thru API spec used by many adapters. | Spec, not code |

Mercedes-Benz itself publishes odxtools through its mercedes-benz GitHub organisation, so ODX-based tooling is a supported open direction.

## Implications for OpenDiag

1. **Support tiers, honestly labelled.**
   - Tier 1 (free, works today): OBD-II/EOBD, UDS reads, DTCs, live data, VIN, over CAN and DoIP.
   - Tier 2 (community packs): reads and low-risk writes on ECUs where no server-issued authorization is needed, using OpenDiag's own data.
   - Tier 3 (gated): anything needing SCN, Flash roles, or SERMI. Out of scope unless OpenDiag partners with a certified route.
2. **Own the data format.** Use ODX as the interchange format where possible (open standard, odxtools exists). Build packs from our own measurements of the user's own car, public standards, and contributor-owned captures. Do not ingest CBF/SMR-D or Mercedes ODX.
3. **Do not bypass access control.** Seed-key calculators and SCN emulation are circumvention of Mercedes' protection and a legal and ethical risk. OpenDiag should detect negative responses (NRC 0x33) and tell the user plainly that the ECU needs manufacturer authorization.
4. **Use the legal route.** EU Regulation 2018/858 Article 61 requires manufacturers to give independent operators OBD and repair information in a standard format. Delegated Regulation 2021/1244 presumes compliance with EN ISO 18541. The EU Court (C-296/22, 2023) held manufacturers cannot add other conditions to that access. [Reg. 2018/858 Art. 61](https://legislation.gov.uk/eur/2018/858/article/61/2022-12-31); [Delegated Reg. 2021/1244](https://eur-lex.europa.eu/eli/reg_del/2021/1244/oj); [C-296/22 summary](https://www.bailii.org/eu/cases/EUECJ/2023/C31922.html)
5. **Adapters.** Target a plain Linux/macOS stack with ENET/DoIP (cheap cable) and SocketCAN, plus J2534 where available. Document that Mercedes only tested specific Pass Thru devices.
6. **Safety.** Every write: read-back, saved original, dry-run diff, and a refuse-list for safety-critical ECUs.
7. **Remote-coding services are a red flag.** Forums show people buy remote SCN sessions via TeamViewer at about $89 using someone else's credentials. That conflicts with Mercedes' personal-login model and is not something OpenDiag should integrate. (forum report, unverified)

## Open questions

- Do any independent tool makers (Autel, Snap-on, Bosch) have publicly documented agreements that an open tool could join? Search found Snap-on and Autel approvals for gateway access via AutoAuth in the US, and Bosch via SingleKey ID, but nothing about SFD itself. [FenderBender](https://www.fenderbender.com/news/latest-news/news/55285322/snap-on-snap-on-approved-for-access-to-mercedes-benz-secured-gateway-vehicles); [Repairer Driven News](https://www.repairerdrivennews.com/2025/02/11/autel-announces-security-gateway-access-to-mercedes-benz-vehicles/); [Bosch](https://boschaftermarket.com/afr/en/news/latest-news/secure-diagnostic-access)
- What is "SFD" exactly in public documents? This search found Mercedes' flash-role documentation but no page using the name SFD directly. (unverified)
- Does the EU draft delegated regulation of 2026 (ST-7952-2026) change Annex X access conditions, and was it adopted? [Council doc](https://data.consilium.europa.eu/doc/document/ST-7952-2026-INIT/en/pdf)
- Which Mercedes model series are DoIP-only, and how do pre-2017 cars behave on a standard ISO-TP stack?
- Can OpenDiag legally publish a coding-parameter map built from owner-contributed reads of their own vehicles (copyright and database-right review needed)?
- Is a certified-partner model (like Pass Thru) viable for a non-profit open project?

## Sources

- Mercedes B2B, XENTRY Pass Thru EU: https://b2bconnect.mercedes-benz.com/LT/shop/workshop-solutions/xentry-pass-thru-eu
- Mercedes B2B, XENTRY Flash (via search summary; direct fetch returned HTTP 500): https://b2bconnect.mercedes-benz.com/gb/workshop-solutions/diagnosis/xentry-flash
- Mercedes B2B, SERMI FAQ: https://b2bconnect.mercedes-benz.com/gb/help/faq/sermi-authentication/sermi-authentication
- Mercedes-Benz Trucks SERMI quick guide: https://service-info.mercedes-benz-trucks.com/media/wysiwyg/DIAGHW/en_SERMI_Quick_Guide.pdf
- Softing DTS.monaco: https://automotive.softing.com/products/softing-dts/softing-dtsmonaco.html
- odxtools: https://github.com/mercedes-benz/odxtools
- python-doipclient docs: https://python-doipclient.readthedocs.io/
- Regulation (EU) 2018/858 Art. 61: https://legislation.gov.uk/eur/2018/858/article/61/2022-12-31
- Delegated Regulation (EU) 2021/1244: https://eur-lex.europa.eu/eli/reg_del/2021/1244/oj
- CJEU C-296/22: https://www.bailii.org/eu/cases/EUECJ/2023/C31922.html
- EU draft Annex X amendment: https://data.consilium.europa.eu/doc/document/ST-7952-2026-INIT/en/pdf
- FenderBender (Snap-on): https://www.fenderbender.com/news/latest-news/news/55285322/snap-on-snap-on-approved-for-access-to-mercedes-benz-secured-gateway-vehicles
- Repairer Driven News (Autel): https://www.repairerdrivennews.com/2025/02/11/autel-announces-security-gateway-access-to-mercedes-benz-vehicles/
- Bosch secure diagnostic access: https://boschaftermarket.com/afr/en/news/latest-news/secure-diagnostic-access
- Workshop blog, SCN: https://kfz-dietrich.com/blog/mercedes-diagnose-scn-codierung-erklaert/
- Workshop blog, DoIP: https://kfz-dietrich.com/blog/fahrzeug-diagnose-can-doip-uds-werkstatt-tiefendiagnose/
- ISO 14229 (UDS), ISO 13400 (DoIP), ISO 15765-2 (ISO-TP), ISO 22901-1 (ODX): standards, protocol byte examples above are from general knowledge of the specs (not individually fetched).
