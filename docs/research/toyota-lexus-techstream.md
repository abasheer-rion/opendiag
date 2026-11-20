# Toyota / Lexus diagnostics (Techstream) and what OpenDiag can do about it

Clean-room note: this document is written from public sources only. It describes architecture and public protocol facts. It reproduces no Toyota data files, no leaked software and no keygens. Claims marked "(unverified)" come from vendor pages, forum posts or memory and need a bench check before we rely on them.

## Summary

- Techstream is Toyota's dealer scan tool. It is a Windows application that talks to the car through a J2534 pass-thru box (Mini VCI clone, Mongoose, or Toyota's own VIM). The paywall is on Toyota's online service (TIS) and the data behind it, not on the wire protocols.
- The wire protocols are mostly standard: ISO 15765-4 CAN (OBD-II), older K-line (ISO 9141 / KWP2000 / ISO 14230), and DoIP on the newest cars. Toyota's value-add is its private ECU map: which ECU answers on which address, which manufacturer-specific data IDs exist, how to scale them, and which routines trigger an active test.
- Read-only features (codes, freeze frame, live data, hybrid battery data) are feasible for OpenDiag. Customize settings and Active Tests are feasible per model if we build our own data pack by sniffing and community work.
- Immobilizer work, key registration and ECU reflash are gated by Toyota's online security (security key written from TIS, reset pass-codes, signed calibrations). We should not plan to match these. A read-only core plus a documented, clearly scoped write layer is the realistic goal.

## How it works

### Physical layer: DLC3

The Toyota OBD connector is called DLC3 (the 16-pin SAE J1962 connector). Typical pin use (from memory, standard J1962 plus Toyota extras, unverified for each model):

| Pin | Use |
|---|---|
| 4 / 5 | chassis ground / signal ground |
| 6 / 14 | CAN high / CAN low (diagnostic CAN, 500 kbps on modern cars) |
| 7 | K-line (older cars, ABS and body modules on some models) |
| 13 | TC (test terminal, used by older "blink code" mode) |
| 16 | battery positive |

A hobbyist decode of a 2015 Highlander confirms the diagnostic connector exposes only the 500 kbps powertrain bus (pins 6 and 14). The body bus ran at 250 kbps and was not wired to the connector. Toyota's own manual says body CAN resistance cannot be measured at that connector. [HA forum project]

Newer platforms (TNGA, 2020+) use a central gateway and, per vendor pages, DoIP (Ethernet diagnostics) on the newest models such as the 2024 Grand Highlander (vendor claim, unverified). Toyota's "ECU Security" arrived on TNGA-era cars; one open-source project states its tricks only work on TNGA cars from about 2015-2022 "without Toyota ECU Security". [toyota-can-bus-multitool] One 2026 dealer-equipment handout lists Toyota as one of three OEMs without a "Secure Gateway Module", which is a different mechanism from ECU Security and shows how terminology is muddled. [Hunter handout]
> Evidence update 2026-11-20: no public source found for Toyota DoIP or a Toyota secure gateway on DLC3 (unknown, not "no"). opendbc marks Toyota and Lexus models from about 2021 to 2022 as not compatible because internal CAN messages are authenticated (SecOC). Open signal data shows Toyota using services 0x21 and 0x22 per ECU. See `research/deep/toyota-lexus-protocols-and-open-data.md`.

### Protocols

| Layer | Used by Toyota | Notes |
|---|---|---|
| ISO 15765-4 (CAN 11-bit, 500 kbps) | Most cars 2008+ | OBD-II requests to 0x7DF (functional) or 0x7E0-0x7E7 (physical); replies on 0x7E8-0x7EF. |
| ISO 15765-2 (ISO-TP) | Same | Framing for messages over 8 bytes. |
| KWP2000 / ISO 14230-4 and ISO 9141-2 (K-line, 10.4 kbaud) | Older cars; some modules (ABS, body) on early CAN cars | Seller pages say Mini VCI covers K-line, J1850 PWM/VPW and CAN. Clones are reported buggy on K-line (forum, unverified). |
| UDS (ISO 14229) over CAN | Newer ECUs | openpilot's Toyota code sends a UDS communication-control request to an ECU at 0x750 to disable it. [docs.comma.ai Toyota interface] |
| DoIP (ISO 13400) | Newest platforms | Needs a DoIP-capable J2534 device and the newer GTS+ software (vendor claim). |
| J2534-1/-2 | PC to adapter API | `PassThruConnect`, `PassThruReadMsgs`, `PassThruWriteMsgs`, filters, ISO15765 channel. Public standard. |

Standard OBD-II examples (public SAE J1979):

- Request VIN: `7DF 02 09 02` then reply on `7E8 10 14 49 02 01 ...` (multi-frame, flow control `7E0 30 00 00`).
- Read DTCs: service `03` (stored), `07` (pending), `0A` (permanent).
- Freeze frame: service `02`, PID plus frame number. Toyota stores up to five freeze frames per DTC and Techstream can show all five; Techstream also flags the stored frame with a snowflake icon. [Snap-on, repair manual]

### Toyota-specific behaviour

- DTC states. Techstream shows Current, Pending and History (past) codes, with a general summary of the code. Definitions: current when a continuous or 2-trip monitor fails, pending when a 2-trip monitor fails the first trip, history after later failure. [Techstream part 2 PDF] Toyota-specific codes use P1xxx and, on hybrids, P0Axx/P3xxx ranges (standard generic codes also apply; I found no public Toyota code list, so we author our own text).
- Vehicle Control History. Newer cars log "X" codes without setting a DTC; useful for no-code faults. [vehicleservicepros]
- Customize. Techstream has a Customize menu that changes ECU settings (door lock behaviour, light delays). Forum users say some customize items need no connection to an ECU to browse. How values are stored is ECU-specific. (unverified)
- Active Test. Techstream drives outputs (fans, injectors, solenoids, relays). Under the hood this is typically KWP `0x30` InputOutputControlByLocalIdentifier or UDS `0x2F` / `0x31` routines, with per-ECU identifiers. We found no public Toyota identifier list.
- Enhanced data. Toyota ECUs answer manufacturer-specific data requests beyond the J1979 PIDs.

### Hybrid data

The hybrid system is where the community has done the most work, so it is the best area for an open data pack.

- Gen 2 Prius block voltages, SOC, temperatures: a community Torque Pro PID list exists. [oguchi-rd Gen2 PID PDF, priuschat Gen2 thread]
- Gen 4 Prius: SOC reported as a mode-22 PID `22 7A 76` with formula `A*20/51` (0-100 %), header `747` (forum table, unverified). Mode 21 returned "mode not supported" on a Gen 4 car; mode 22 with two-byte PIDs worked. [priuschat Gen IV thread]
- Gen 2 / PHV: headers `7E2` and `7E3` appear for hybrid ECUs, with a discharge-control PID `2198` scaled `D/2 - 64` (forum, unverified). Corolla hybrid threads suggest `7E0` (engine) and `7D2` (hybrid ECU). The addresses conflict between sources, so the right design is to discover them per VIN and not hard-code.
- Adapter matters: on a Gen 3 car one user saw block 2-14 read about -330 V on one Bluetooth adapter and correct on another. [priuschat Gen 3 thread] This is probably a framing or timing issue in cheap ELM clones.
- Mode 22 supported-PID discovery steps by 256, not 32 (forum note). [priuschat Corolla thread]
- Block voltage range depends on battery chemistry (NiMH vs Li-ion), so alert thresholds must be per pack type.

### Immobilizer, keys, reflash

- ECU Security Key. Newer cars need a security key written into the ECU from TIS before key work or reflash. Toyota's bulletin T-SB-0111-20 says TIS sends the key to Techstream automatically after "Send". [NHTSA TSB]
- Immobilizer / Smart Key Reset. Needs a Reset Pass-Code obtained through TIS with login and extra security steps. Some early ECM-based immobilizers cannot be reset with Techstream at all. Known issues include a Seed Code that is greyed out when the VIN contains lowercase letters, and a failure after a 16-minute countdown when all keys are lost; the technician must keep the car awake by toggling the door-jamb switch about every 1.5 seconds. [Toyota known-issues page]
- Reflash. Toyota says to use Techstream or an approved J2534 interface (not the Diagnostic Tester). Newer cars need "GTS+" and signed calibration files with a security signature (T-SB-0107-20 Rev2). [NHTSA TSB] Reflash needs stable voltage: Toyota's page says hold 13.0-13.5 V for 86 models. [Toyota known-issues page]
- Public limit of registered keys: manuals mention an error indicator when the key limit is exceeded but give no number in the pages I found.

### Access and cost

- TIS access is sold per period. A 2026 third-party review quotes about $35 for two days, $55 per month, $480+ per year, and about $1,200 per year for the security-professional tier (unverified). [OBDAdvisor]
- Techstream Lite kits were sold at $495 without software, with software tied to an active professional TIS subscription and a weekly check-in with TIS. [Toyota flyer via search, Toyota FAQ]
- Toyota's J2534 interfaces named in its docs are Mongoose-Plus MFC3 and MongoosePro MFC2. [Toyota known-issues page, FAQ]

## What is hard

1. Data. The identifiers, scalings, DTC texts and test routines per ECU per model year are Toyota's data, spread over hundreds of ECU types. Public sources cover hybrids well and everything else thinly. For one Highlander the open DBC files decoded only 64 of 115 broadcast CAN IDs (about 56%) according to the author (unverified claim). [HA forum project]
2. Addresses. ECU addresses differ across generations and sources disagree (7E0, 7E2, 7E3, 747, 7D2). We need per-VIN discovery by scanning, not static tables.
3. Security. ECU Security Key, seed/key, server-signed calibrations. Each is a decision to join Toyota's authenticated service. We will not bypass it.
4. Adapters. Cheap ELM327 clones drop multi-frame traffic and cannot do raw ISO-TP timing, flash or K-line properly. Mini VCI clones are reported buggy on K-line (forum). Needs a tested-hardware list.
5. Safety. A wrong write to a customize item or output test can disable a module or set off an alarm. One open Toyota project warns of irreversible ECU configuration changes and an accidental alarm from a door-lock frame. [toyota-can-bus-multitool] A CANable in the wrong mode ACKs frames on the car's bus, which is a real risk. [HA forum project]
6. Legal and licensing. Toyota's data and software are copyrighted. We must not copy them or extract them from Techstream. Sniffing the bus of our own car to learn what an ECU does is the clean path.

## Open-source options

| Project | Use for OpenDiag | License / note |
|---|---|---|
| comma.ai opendbc | Toyota CAN message definitions (broadcast signals, not diagnostics) | MIT. [GitHub opendbc] Home page does not list Toyota models; see docs/CARS.md. |
| openpilot / panda | Reference code for safe CAN transmit gating and a Toyota ECU UDS example | Safety firmware starts silent and needs a safety mode before sending. [GitHub opendbc] |
| python-udsoncan | UDS client | MIT. [awesome.ecosyste.ms listing] |
| python-can-isotp (can-isotp) | ISO-TP | Open source. [same listing] |
| Scapy | Packet crafting for CAN/ISOTP/UDS | Open source. |
| ELM327-emulator | Test harness with a Toyota Auris Hybrid scenario | Open source. [awesome listing] |
| ddt4all | Multi-brand ELM-based diagnostic tool, reference for UI design | Renault focus (unverified). |
| toyota-can-bus-multitool | Reference for Toyota gateway-less tricks, TNGA only | No license stated; do not copy code. |
| Torque / forum PID sheets | Hybrid PID facts | Forum content, license unclear. Use as leads and re-verify on a car. |

No open project documents a Toyota enhanced-PID library or Toyota active-test identifiers (search found none).

## Implications for OpenDiag

Proposed scope in phases:

1. Phase 1, read-only. Standard OBD-II: VIN, DTCs (stored, pending, permanent), all five freeze frames, readiness, live PIDs. Works on any adapter that handles ISO-TP properly. Our own DTC description text.
2. Phase 2, ECU discovery. Scan 0x7E0-0x7E7 plus the extended ranges; read identification data; report which ECUs answer. Store discovered address map per VIN in the data pack.
3. Phase 3, hybrid pack. Community-sourced, bench-verified list of hybrid PIDs (SOC, block voltages, temperatures, inverter and motor data) as a YAML data pack with the car generation, header, request bytes, formula and verification status. Also add battery-health summary: spread between blocks, internal resistance trend. Ship per-chemistry thresholds.
4. Phase 4, simple actions. DTC clear (standard service 04) and a small set of Active Tests and customize items, each reviewed per model, gated by a confirmation dialog, with a read-back and a revert value stored first.
5. Not planned. Immobilizer and key work, ECU security key, reflash with Toyota calibrations. We can offer a "bring your own authorised file" flow later only if the licence of the files allows it.

Architecture points:

- Transport layer: J2534 first (matches how Techstream hardware works, Windows only for most drivers), plus SocketCAN/slcan and a vetted ELM/STN list for read-only use. DoIP later.
- Data packs are original, versioned, signed YAML/JSON, each entry with source and "verified on" notes.
- Read-only default. Writes need an explicit mode, a battery-voltage check, and a log. Interfaces start silent (listen-only) when sniffing.
- Add a "learn mode" that records a session of our own car so contributors can propose pack entries.

## Open questions

- Which Toyota models do the first testers own? Pack effort should follow that, hybrids first.
- Which adapters do we certify? Needs a bench test of Mini VCI clone, a genuine Mongoose, an OBDLink, and a cheap ELM.
- How do 2022+ cars (GTS+, DoIP, ECU Security) behave on a plain OBD-II request? We have only vendor claims.
- Legal review of publishing sniffed identifiers for active tests.
- Does the Toyota diagnostic CAN gateway on new cars block UDS write services unless authenticated? No primary source found.
- What is the maximum registered-key count per model? Not found.
- Is Mode 21 vs Mode 22 vs UDS `0x22` the right default per hybrid generation? Sources conflict.

## Sources

- opendbc repository: https://github.com/commaai/opendbc
- openpilot Toyota interface source (UDS use): https://docs.comma.ai/_modules/selfdrive/car/toyota/interface.html
- Decoding a Toyota's CAN bus (Home Assistant forum): https://community.home-assistant.io/t/project-decoding-my-toyotas-can-bus-from-scratch-to-rebuild-the-factory-app-read-only-in-ha/1020667
- toyota-can-bus-multitool: https://github.com/cydia2020/toyota-can-bus-multitool
- Techstream known issues (v18.00.008): https://one.tis.toyota.com/techInfoPortal/staticcontent/en/techinfo/html/prelogin/tsrss/ts_known_bugs.html
- Techstream Lite flyer: https://one.tis.toyota.com/techInfoPortal/staticcontent/en/techinfo/html/prelogin/docs/tsliteflyertinfo.pdf
- Techstream Lite FAQ: https://one.tis.toyota.com/techInfoPortal/staticcontent/en/techinfo/html/prelogin/docs/tslfaqtinfo.pdf
- Techstream diagnostic functions part 2: https://attachments.priuschat.com/attachment-files/2021/04/204185_Techstream_part_2.pdf
- Snap-on, Toyota multiple freeze frame: https://www.snapon.com/EN/UK/Diagnostics/News-Centre/Technical-Focus-Archive/toyota-multiple-freeze-frame
- Toyota vehicle control history: https://vehicleservicepros.com/service-repair/diagnostics-and-drivability/article/21198694/understanding-toyotas-vehicle-control-history
- Toyota TSB T-SB-0111-20 (ECU security key): https://static.nhtsa.gov/odi/tsbs/2023/MC-10241404-9999.pdf and https://static.nhtsa.gov/odi/tsbs/2020/MC-10184541-9999.pdf (the TSB numbers T-SB-0111-20 and T-SB-0107-20 came from search summaries; check which file holds which)
- Hunter secure gateway handout: https://globalassets.hunter.com/download/assets/AH08640-00_SecureGateway-Handout_%28RevA_07-26%29.pdf/cfce70107aeb11f1b2450a4934c9f094
- Gen 2 Prius PID PDF: https://oguchi-rd.com/Accomplishment/Automobile/07%20Toyota%20Prius/Parameter%20IDs/Toyota%20Gen%202%20Prius%20PIDs.pdf (content not machine-readable in my fetch; cited via search summary only)
- Gen IV Prius custom PIDs thread: https://www.priuschat.com/goto/post?id=2489140
- Gen 2 Prius custom PIDs thread: https://www.priuschat.com/goto/post?id=1755240
- PHV custom PIDs thread: https://www.priuschat.com/goto/post?id=1495300
- Corolla hybrid custom PIDs: https://priuschat.com/posts/3582276
- Clone-cable notes: forum report only; clone-seller blog link removed in review.
- TIS pricing review (third party): https://obdadvisor.com/toyota-techstream/
- Vendor note on GTS+ and DoIP: seller page, link removed; claim remains unverified.
- Awesome CAN bus list (udsoncan, isotp, ELM tools): https://github.com/idoka/awesome-canbus
