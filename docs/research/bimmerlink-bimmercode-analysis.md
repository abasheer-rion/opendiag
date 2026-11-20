# BimmerLink / BimmerCode and similar apps: public-info teardown

Status: research note for OpenDiag (Apache-2.0). Clean-room: built only from public vendor pages, app store listings, forums and one open-source repo. No proprietary data or software was used. Claims not directly supported by a fetched source are marked "(unverified)".

## Summary

- BimmerLink (diagnostics/service functions) and BimmerCode (coding) are two phone/desktop apps from one vendor. They talk to the car through a short list of approved OBD or ENET adapters. Nothing public suggests they need a cloud account.
- Their value is a curated, per-generation catalogue of coding options. Each option names the control unit it needs, the allowed values, and warnings. The catalogue is the moat, not the protocol work.
- Safety comes from four things: automatic backups before the first write, a one-tap restore, blocking known-bad states (for example a modified head unit), and a "basic" mode that hides raw coding.
- OBDeleven, Carly and Carista sell on a different model: a proprietary adapter or subscription, plus credit-priced "one-click" changes, with a server-heavy design.
- Deep OBD (open source library under GPL-3.0) and Car Scanner / Torque style apps cover the free end: generic ELM327 diagnostics and, for Deep OBD, a server-side BMW coding service.
- For OpenDiag, the hard and valuable parts are the community-maintained option catalogue, adapter qualification, and write safety. Protocol framing is the easy part.

## How it works

### UX model (BimmerCode)

Per the Quick Start Guide ([manual](https://bimmercode.app/manual)):

1. Connect via a supported adapter and pick the vehicle.
2. The app identifies the control units fitted.
3. Choose a unit, change options, tap "Code".
4. An "Expert mode" toggle exposes raw coding values. The vendor warns of serious problems and offers no support for it.

The free version can connect and show which control units and options a car supports. Writing needs the paid full version ([manual](https://bimmercode.app/manual), [FAQ](https://bimmercode.app/faq/)).

### Option catalogue

The public per-model pages (example: [G05/F95](https://bimmercode.app/cars/g05)) show the data model clearly:

| Field | Example |
|---|---|
| Category | Lighting, PDC, Mirrors, Tailgate, Warnings |
| Option name and effect | "Ambient lighting color", "Redline tachometer" |
| Allowed values | Active / Not active; 13 colours; 5,000 to 7,500 RPM |
| Required control unit | BDC_BODY3, HU_MGU, DKOMBI4, HKFM2, DME, ACSM_5 |
| Adapter note | "Only with an adapter from the G-series list" |
| Equipment note | Needs alarm system, folding mirrors, etc. |
| Software note | Tied to an I-level (software release), for example an Auto Start Stop option that cannot be disabled from I-level 23-3 on petrol cars |
| Workflow note | "Back up first", or "also enable option X in unit Y" |

The page shows the user can read the car's I-level in the app. The FAQ says availability depends on "vehicle, software and configuration" and lists options at [/vehicles](https://bimmercode.app/vehicles/). It does not say how the catalogue is keyed internally (unverified: likely vehicle series, ECU type and software level).

### BimmerLink feature set

From [bimmerlink.app](https://bimmerlink.app): read/clear fault codes on all control units, live data dashboard, CSV logging, exhaust flap and Active Sound Design control, diesel particulate filter regeneration, battery registration, electric parking brake service mode, service reset, lighting short-circuit lock reset. Features are gated by equipment or engine (for example sound tuning only on S55 engines). The page states no cloud or account.

### Adapters

Per the vendor's [adapter list](https://bimmercode.app/adapters/):

| Type | Examples | Series |
|---|---|---|
| Bluetooth | OBDLink CX / MX+ / LX, vLinker BM/BM+, UniCarScan UCSI-2100, Veepeak OBDCheck BLE | Mostly all series; Veepeak not G |
| Wi-Fi + ENET | MHD ENET Wi-Fi, bm3, KIES, UniCarScan UCSI-3000, xA Ultra | F, G, I |
| Wired | ENET cable (with Lightning / USB-C Ethernet dongle on phones), DCAN USB cable | F/G/I and E/R |

Rules: the app refuses unlisted adapters, and some options need a specific adapter class (the G05 page says certain body and crash module options work only with listed G-series adapters). A retailer guide notes iPhones need an Apple MFi-certified Ethernet adapter ([retailer guide](https://bmwinsights.com/best-obd-adapter-for-bmw-bimmerlink/), seller claim).

### Backups and recovery

- Backup is automatic when a unit's coding is first read (Android, desktop) or on every read (iOS). iOS backups vanish if the app is deleted, so the guide says export first ([manual](https://bimmercode.app/manual)).
- Restore: pick a backup. The oldest entry restores factory coding for that unit.
- Invalid values are marked red in the UI.
- Public failure reports: a Supra owner's BDC and engine restore failed at 100% on an OBDLink LX. A hard reset and firmware update of the adapter plus app reinstall fixed it ([forum](https://www.supramkv.com/threads/2023-supra-mt-bimmercode-recovery-failing.18674/)). Another thread reports an F40 cluster that went black with no reconnect ([r/BimmerCode mirror](https://axebps-redlib.hf.space/r/BimmerCode/comments/17zi4va/error_coding_in_instrument_cluster_screwed_my_car)). No source found for how often a unit is truly bricked.

### Coding safety features (public)

From the [FAQ](https://bimmercode.app/faq/):

| Guard | What it does |
|---|---|
| Error codes BCE-006 to 012 | Block coding when: lighting module boot sector corrupt, head unit not original (third-party CarPlay, unlocked nav), head unit on a critical software level, head unit under 4 GB RAM, air-con pressure fault |
| Expert mode off for safety units | Not offered for control units with safety-related functions |
| Environment advice | Engine off, ignition on; flight mode; disconnect Bluetooth and the car's own phone link |
| Removed options | The app cannot do options BMW removed in software (one-touch turn signal duration) |
| Known stuck state | Body controller may stop answering; workaround is disconnecting the 12 V battery 15+ minutes |

### Cloud, accounts, licensing

- Purchases tie to the Apple ID or Google account. A full-version purchase works on multiple devices on the same platform but cannot move between iOS and Android. Desktop licences bind to one machine ([FAQ](https://bimmercode.app/faq/)).
- No public statement of cloud sync or server-side coding data (unverified whether option data is fetched or bundled in the app).
- Prices were not on the pages I fetched. Not stated here.
- Evidence update 2026-11-20: a store snapshot shows about USD 50 one-time on the US store, 4.7 from about 22K iOS ratings and 4.8 from about 12K on Android (vendor-displayed, one dated snapshot). Restore can fail ("coding data invalid" reports needed a developer-grade remote fix), and a new software level can silently undo a coding. See `research/deep/bmw-coding-demand-and-practice.md` and `bmw-coding-failures-and-recovery.md`.

## Competitor comparison

| App | Model | Hardware | Coding approach | Money | Source |
|---|---|---|---|---|---|
| BimmerCode | Curated catalogue, BMW/MINI/Supra 2005+ | Approved third-party adapters | Basic mode + Expert mode, auto backups | One-off full-version purchase per platform | [FAQ](https://bimmercode.app/faq/) |
| BimmerLink | Service functions + diagnostics | Same adapters | Not coding; adaptations like battery registration | Paid app (price not captured) | [site](https://bimmerlink.app) |
| OBDeleven | One-click apps, VAG-first, BMW/Toyota extra | Own adapter or ELM327 | One-click presets; manual coding on paid plan | Free / PRO / ULTIMATE plus Credits; July 2025 pricing change | [pricing](https://obdeleven.com/pricing-changes-july-2025), [App Store](https://apps.apple.com/us/app/id1643119107) |
| Carly | Subscription, brand packages | Own adapter | Coding, patchy outside VAG per one reviewer | Yearly, BMW tier priced separately | [App Store](https://apps.apple.com/us/app/id467344155), [review](https://iamcarhacker.com/?p=1660) (opinion) |
| Carista | Presets and comfort settings | Own or ELM327 | Preset lists | Subscription, month option | [review](https://iamcarhacker.com/?p=1660) (opinion) |
| Deep OBD | Free-ish, expert-oriented | Replacement-firmware ELM327, FTDI cable, ENET Wi-Fi | Server-side web app builds a work list (F-series+) | Free during beta; licence tied to a vehicle later | [docs](https://uholeschak.github.io/ediabaslib/docs/BMW_Coding.html) |
| Car Scanner ELM | Generic OBD-II, custom PIDs | Any ELM327 | None | Free with paid unlock (unverified) | [store listing](https://apps.apple.com/app/id6461049378) |
| Torque Pro | Gauges, logging, custom PIDs | Any ELM327 | None | Paid | [store listing](https://apps.apple.com/app/id6504351894) |

Notes on OBDeleven: One-click apps cost Credits even on the PRO plan; ULTIMATE makes them unlimited under fair use. Reported store prices were around $3.99 per 10 credits, $69.99 PRO and $239.99 ULTIMATE, but may be stale. Treat reviewer verdicts on Carly and Carista as one tester's opinion.

## What is hard (teardown of reliability)

1. **The catalogue.** Each option is a bit position or value inside a control unit's coding data, and the layout changes by unit generation and software level. Someone has to find it, test it on real cars and write plain-language labels. This is slow, car-by-car work. BimmerCode's pages show it is organised per model and per unit.
2. **Not trusting the car.** The block list (BCE codes) shows what goes wrong in the field: modified head units, low memory, damaged boot data. A robust tool checks unit state before writing.
3. **Write safety.** Read, back up, write, read back, compare, and recover if the link drops. Wi-Fi and Bluetooth drop mid-write. The Supra report shows the adapter firmware can decide whether restore works.
4. **Adapter quality.** The vendor enforces a short approved list because clone ELM327 chips misbehave. Car Scanner's own listing warns of fake ELM327 copies ([listing](https://apps.apple.com/app/id6461049378)).
5. **Software drift.** BMW changes behaviour across releases (the Auto Start Stop option disappearing from I-level 23-3; removed turn signal option). The catalogue needs version-keyed rules.
6. **Descriptions are missing.** Community guides say newer BMW data stripped descriptive text from coding files, making manual research harder (community guides, secondhand, unverified).
7. **Support burden.** Users blame the app for anything that happens after coding. Expert mode comes with no support.
8. **Platform rules.** iOS needs MFi hardware for wired Ethernet; iOS backups vanish on delete.

## Open-source options

| Project | What it gives | Licence | Source |
|---|---|---|---|
| ediabaslib / Deep OBD | A .NET interpreter for BMW diagnostic description files, many serial protocols, ENET, Android app | GPL-3.0 | [repo](https://github.com/uholeschak/ediabaslib) |
| AndrOBD | Open Android OBD-II app | GPL (unverified exact version) | [repo](https://github.com/fr3ts0n/AndrOBD) |
| Community coding notes | F-series notes repos; not code | n/a | [example](https://github.com/jokinawa/bmw-f) |

My search found no open Python library for BMW option coding or I-level handling (unverified; a GitHub topic search would settle it). GPL-3.0 code cannot be copied into an Apache-2.0 project. Reading its public docs to understand behaviour is fine.

## Implications for OpenDiag

- **Own the catalogue as open data.** Define a plain, versioned schema (series, unit, software range, option, values, requirements, warnings, tested-by). Make contributions by pull request, with a "tested on car X, software Y" field. This is the alternative to the paywall.
- **Trust levels per option.** Verified, community-reported, experimental. Hide experimental behind an expert switch.
- **Copy the safety design, not the data.** Mandatory backup before first write; read-back verify; one-tap restore; export backups to a file that survives app deletion; refuse to write when unit state is unknown or modified.
- **Pre-flight checks.** Battery voltage, ignition state, adapter on the qualified list, link quality test.
- **Adapter qualification as code.** A published test suite and a list of passing adapters, including firmware versions. Prefer ENET for F/G/I cars.
- **Do not depend on a server.** Ship the catalogue as signed data that the app can update offline. Avoid Deep OBD's remote-telegram model for write paths.
- **Licensing.** Avoid GPL code in the Apache core. Keep clean-room data written from our own testing.
- **Pricing stance.** Free core with no credits. Optional donations or paid hosted features if ever needed.

## Open questions

- How BimmerCode keys its catalogue internally and how updates ship (bundled vs downloaded). (unverified)
- Exact prices today for BimmerCode, BimmerLink, Carly tiers.
- Which options can be discovered legitimately without proprietary data files (for example by diffing coding data before and after changing an option in the car's own menu).
- Legal view on reading and writing coding data across regions, and warranty impact.
- Toyota/Lexus and Mercedes equivalents: no mainstream curated coding app was covered here, so the catalogue model needs separate research.
- Minimum viable backup guarantees when the link drops during write.

## Sources

- https://bimmercode.app/faq/
- https://bimmercode.app/manual
- https://bimmercode.app/adapters/
- https://bimmercode.app/cars/g05
- https://bimmerlink.app
- https://obdeleven.com/pricing-changes-july-2025 (page returned 403 on direct fetch; facts via search summary only)
- https://apps.apple.com/us/app/id1643119107
- https://apps.apple.com/us/app/id467344155
- https://iamcarhacker.com/?p=1660
- https://uholeschak.github.io/ediabaslib/docs/BMW_Coding.html
- https://github.com/uholeschak/ediabaslib
- https://github.com/fr3ts0n/AndrOBD
- https://apps.apple.com/app/id6461049378
- https://apps.apple.com/app/id6504351894
- https://www.supramkv.com/threads/2023-supra-mt-bimmercode-recovery-failing.18674/
- https://axebps-redlib.hf.space/r/BimmerCode/comments/17zi4va/error_coding_in_instrument_cluster_screwed_my_car
- https://bmwinsights.com/best-obd-adapter-for-bmw-bimmerlink/
- https://github.com/jokinawa/bmw-f
