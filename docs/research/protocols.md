# Vehicle Diagnostic Protocol Stack

Clean-room research note for OpenDiag. Only public standards summaries, public docs and open-source projects were used. No proprietary data files were consulted. Claims marked "(unverified)" come from general engineering knowledge and were not confirmed against a fetched source.

## Summary

- Every modern car exposes diagnostics as a layered stack: physical bus, transport (ISO-TP or DoIP), application protocol (UDS, or legacy KWP2000/J1979), then OEM data on top.
- The first three layers are public standards. The fourth (what each data identifier, routine and coding byte means) is where the paywalled tools get their value.
- Emissions OBD-II (SAE J1979) is small and fully public. UDS (ISO 14229) is public in structure; the OEM meaning of identifiers is not.
- BMW uses standard UDS/KWP2000 services but adds its own addressing (extended-address ISO-TP on CAN, HSFZ over Ethernet on older ENET cars, DoIP on newer ones).
- OpenDiag can implement all transport and service layers from standards. The data layer must be built independently (see Implications).

## How it works

### Layer map

| Layer | Standard | Notes |
|---|---|---|
| Physical | ISO 11898 (CAN), ISO 9141-2 / 14230-1 (K-line), 100BASE-T1 / ISO 13400-3 (Ethernet) | OBD connector: CAN on pins 6/14, K-line on pin 7 |
| Data link / transport | ISO 15765-2 (ISO-TP), ISO 13400-2 (DoIP) | Segmentation up to 4095 bytes (classic) |
| Application | SAE J1979 / ISO 15031-5 (OBD), ISO 14229 (UDS), ISO 14230-3 (KWP2000) | Request SID, response SID = request + 0x40 |
| Data | OEM (ODX/MDX, proprietary description files) | Not public |

### OBD-II (SAE J1979)

Modes (services): 01 current data, 02 freeze frame, 03 stored DTCs, 04 clear DTCs, 05 O2 sensor tests (non-CAN only), 06 on-board monitor results, 07 pending DTCs, 08 control component, 09 vehicle info (VIN, calibration IDs), 0A permanent DTCs. [1]

Five physical signalling protocols are allowed: J1850 PWM (41.6 kbit/s), J1850 VPW (10.4), ISO 9141-2 (10.4), ISO 14230 KWP2000 (1.2 to 10.4 kbaud), ISO 15765 CAN (250 or 500 kbit/s). CAN has been mandatory on US cars since 2008. [2]

CAN addressing (11-bit): tester sends functional (broadcast) requests to 0x7DF. ECUs listen on 0x7DF plus one physical ID in 0x7E0 to 0x7E7 and reply on that ID plus 8 (0x7E8 to 0x7EF). [1]

Supported-PID discovery: PID 0x00 returns a 32-bit mask, MSB = PID 0x01. The 0x20, 0x40, ... PIDs cover the next 32 each. Example response data `BE 1F A8 13` means PIDs 01, 03, 04, 05, 06, 07, 0C, 0D, 0E, 0F, 10, 11, 13, 15, 1C, 1F, 20 are supported. [1]

Frame examples (CAN, 8 data bytes, padding 0xCC):

```
Request  RPM:     7DF: 02 01 0C CC CC CC CC CC
Response RPM:     7E8: 04 41 0C 1A F8 CC CC CC     rpm = (256*0x1A + 0xF8)/4 = 1726
Request  coolant: 7DF: 02 01 05 CC CC CC CC CC
Response coolant: 7E8: 03 41 05 7B CC CC CC CC     temp = 0x7B - 40 = 83 C
```

Common formulas: RPM (0x0C) = (256A+B)/4; coolant (0x05) = A-40. [1] Padding value varies by ECU (0x00, 0x55, 0xAA, 0xCC all occur).

### ISO-TP (ISO 15765-2)

CAN frames carry 8 bytes (classic), so longer messages are segmented. The high nibble of the first byte gives the frame type. [3]

| Type | PCI | Content |
|---|---|---|
| Single Frame (SF) | `0L` | L = length 1 to 7 (6 with extended addressing) |
| First Frame (FF) | `1L LL` | 12-bit total length (at least 8), then 6 data bytes |
| Consecutive Frame (CF) | `2N` | N = sequence 1..F, wraps to 0 |
| Flow Control (FC) | `3S BS ST` | S: 0 continue, 1 wait, 2 overflow. BS = block size (0 = send all). STmin: 0x00-0x7F ms, 0xF1-0xF9 = 100-900 microseconds |

Example, 15 bytes (from [3]):

```
Sender   FF: 10 0F 11 22 33 44 55 66
Receiver FC: 30 00 00 00 00 00 00 00
Sender   CF: 21 77 88 99 AA BB CC DD
Sender   CF: 22 EE FF
```

Classic length cap is 4095; the 2016 revision allows up to 2^32-1 via an escape length. [3] Extended addressing puts a target-address byte first in every frame, costing one data byte (see BMW below).

### UDS (ISO 14229-1)

Request = SID + parameters. Positive response SID = SID + 0x40. Negative response is always three bytes: `7F <SID> <NRC>`. [4]

| SID | Service | Typical use |
|---|---|---|
| 0x10 | DiagnosticSessionControl | 01 default, 02 programming, 03 extended |
| 0x11 | ECUReset | 01 hard, 02 key off/on, 03 soft |
| 0x14 | ClearDiagnosticInformation | 3-byte group, FFFFFF = all |
| 0x19 | ReadDTCInformation | sub 01 count, 02 by status mask, 04 snapshot, 06 extended data |
| 0x22 | ReadDataByIdentifier | 2-byte DID(s) |
| 0x27 | SecurityAccess | odd sub = request seed, even = send key |
| 0x2E | WriteDataByIdentifier | coding, VIN, config |
| 0x2F | InputOutputControlByIdentifier | actuator tests |
| 0x31 | RoutineControl | 01 start, 02 stop, 03 results |
| 0x34 / 0x35 | RequestDownload / Upload | start flash / read |
| 0x36 | TransferData | block counter + data |
| 0x37 | RequestTransferExit | end transfer |
| 0x3E | TesterPresent | sub 00, keeps session alive |
| 0x85 | ControlDTCSetting | 01 on, 02 off (used during flashing) |

Source for the SID list: [4]. Sub-function values and use-cases in the right-hand column are from general knowledge (unverified against the fetched page).

Selected NRCs: 0x12 subFunctionNotSupported, 0x22 conditionsNotCorrect, 0x31 requestOutOfRange, 0x33 securityAccessDenied, 0x35 invalidKey, 0x36 exceededNumberOfAttempts, 0x37 requiredTimeDelayNotExpired, 0x78 requestCorrectlyReceived-ResponsePending. [4] On 0x78 the tester must keep waiting (P2* timer) for the real answer. Other NRCs (0x13 incorrectLength, 0x7F service not in active session) are from memory (unverified).

SecurityAccess flow: client requests seed, server returns a random seed, both compute a key with a secret algorithm, client sends key, server compares. Wrong key gives 0x35. [4]

Frame examples (physical request on 0x7E0, reply 0x7E8, ISO-TP SF):

```
Enter extended session:   7E0: 02 10 03             -> 7E8: 06 50 03 00 32 01 F4   (P2=50ms, P2*=500x10ms)
Read VIN DID F190:        7E0: 03 22 F1 90           -> 7E8: 10 14 62 F1 90 57 42 41 ...   (FF, 20 bytes total)
                          7E0: 30 00 00              (FC from tester)
Seed request level 1:     7E0: 02 27 01              -> 7E8: 06 67 01 A1 B2 C3 D4
Send key:                 7E0: 06 27 02 K1 K2 K3 K4  -> 7E8: 02 67 02    (or 03 7F 27 35)
DTCs by status mask 0x08: 7E0: 03 19 02 08           -> 7E8: 07 59 02 FF 03 01 00 09
TesterPresent:            7E0: 02 3E 00              -> 7E8: 02 7E 00
Pending response:         7E8: 03 7F 2E 78
```

The 0x10 response timing bytes and the 19 02 response layout are constructed from the standard's general form (unverified in detail). In the 19 02 example, `59 02 FF` = availability mask FF, then one record: DTC `03 01 00` status `09`.

### DTC formats and status byte

OBD-II DTC is 2 bytes. Top two bits pick the letter (00 P, 01 C, 10 B, 11 U). The next two bits are the second digit 0 to 3 (generic vs manufacturer-specific), then three nibbles. So `01 33` is P0133. [2] (bit layout from general knowledge; the letter set and digit ranges are from [2]).

UDS DTC is 24 bits (3 bytes), commonly shown as six hex digits. One byte after it is the status byte. [5]

| Bit | Name |
|---|---|
| 0 | testFailed |
| 1 | testFailedThisOperationCycle |
| 2 | pendingDTC |
| 3 | confirmedDTC |
| 4 | testNotCompletedSinceLastClear |
| 5 | testFailedSinceLastClear |
| 6 | testNotCompletedThisOperationCycle |
| 7 | warningIndicatorRequested |

Source: [5]. Status mask 0x08 therefore returns confirmed codes; 0x04 pending; 0x80 anything with the warning light requested.

### KWP2000 and K-line

KWP2000 (ISO 14230) is the pre-CAN application protocol on the K-line, 1.2 to 10.4 kbaud, up to 255 data bytes per message. [2] Format: format byte (length plus address-mode bits), optional target and source, data, 1-byte additive checksum. Start-up either by 5-baud slow init (address sent at 5 bit/s, ECU answers 0x55 then keywords) or fast init (25 ms low, 25 ms high wake-up pulse, then StartCommunication 0x81). Details are from general knowledge (unverified). KWP services overlap UDS but differ: 0x1A ReadECUIdentification, 0x21 ReadDataByLocalIdentifier, 0x18 ReadDTCByStatus, 0x31 StartRoutineByLocalIdentifier (unverified). BMW used K-line (with its own addressed framing) up to roughly E46/E39 era (unverified).

### DoIP (ISO 13400)

Diagnostics over TCP/UDP port 13400. Every message has an 8-byte header: protocol version (0x02), inverse version (0xFD), 2-byte payload type, 4-byte payload length. Key payload types (unverified here, standard knowledge):

| Type | Meaning |
|---|---|
| 0x0001 | Vehicle identification request (UDP) |
| 0x0004 | Vehicle announcement / identification response (VIN, logical address, EID, GID) |
| 0x0005 / 0x0006 | Routing activation request / response (response code 0x10 = success) |
| 0x8001 | Diagnostic message (source addr, target addr, UDS bytes) |
| 0x8002 / 0x8003 | Diagnostic message positive / negative ack |

Example (constructed, unverified): read VIN through a gateway at logical address 0x0010, tester 0x0E80.

```
Activate: 02 FD 00 05 00 00 00 07  0E 80 00 00 00 00 00
Diag req: 02 FD 80 01 00 00 00 07  0E 80 00 10  22 F1 90
```

Unlike CAN, UDS payloads are not segmented: TCP carries the whole message. Python reference implementation docs: [6].

### BMW specifics

Buses by generation (all unverified except where cited; widely documented in BMW technical training material):

| Bus | Rate | Role |
|---|---|---|
| K-CAN | 100 kbit/s | body, comfort |
| PT-CAN | 500 kbit/s | powertrain |
| F-CAN | 500 kbit/s | chassis |
| D-CAN | 500 kbit/s | diagnostic CAN on OBD pins 6/14, from about 2007 |
| FlexRay | 10 Mbit/s | chassis/dynamics (first fitted on the E70 at the end of 2006, wider from the 2008 F01; Evidence update 2026-11-20) |
| MOST | 22.5 Mbit/s | infotainment |
| Ethernet | 100 Mbit/s | ENET diagnostics and flashing (F-series on), backbone (G-series) |

BMW has used CAN at 500 kbit/s between engine and transmission controllers since the 1993 740i. [7]

Addressing on CAN, extended-address ISO-TP (unverified): tester sends on CAN ID 0x6F1, with the first data byte the target ECU address. The ECU replies on ID 0x600 + its address, with first byte 0xF1 (the tester address). Example (constructed):

```
Tester -> DME (address 0x12):  6F1: 12 03 22 F1 90 .. .. ..    (target 0x12, SF len 3, ReadDID F190)
DME -> tester:                 612: F1 10 14 62 F1 90 ..       (first byte F1 = tester)
```

Addresses commonly cited: tester 0xF1; DME 0x12, EGS 0x18 (unverified; one search could not confirm). Control-unit names (DME engine, EGS transmission, DSC stability, KOMBI cluster, CAS access/immobilizer) are public in parts lists. [8] The address table itself is not public in a clean form.
> Evidence update 2026-11-20: 0xF1 is the CAN-route tester (replies on 0x600 plus the ECU address, two sources agree); the ENET tester is 0xF4. DME 0x12 and a gateway-style 0x10 have three mentions (two are near-duplicate community lists). EGS 0x18 is still unconfirmed. No public G-series address table exists. See `research/deep/bmw-modules-dtcs-and-addressing.md`.

Ethernet on older ENET cars uses BMW's HSFZ (not DoIP): TCP port 6801, UDP 6811 for discovery, and reportedly no DoIP-style routing activation (sources conflict, unverified; see bmw-ista-architecture.md open questions). Header: 4-byte length, 2-byte control word, then source, target, UDS payload. Control words: 0x0001 diagnostic request/response, 0x0002 acknowledge, 0x0010 terminal 15, 0x0011 vehicle ident, 0x0012 alive check, 0x0013 status inquiry, 0x0040-0x0045 errors. Default tester address in open tooling is 0xF4. [9][10]
> Evidence update 2026-11-20: the four-field framing (4-byte length, 2-byte control word, 1-byte source, 1-byte target, then UDS) has four agreeing sources, 0x0002 as acknowledge has two. The 6811 request and reply bytes, whether the length counts the address bytes, and any keepalive rule are still unknown and need a capture. See `research/deep/bmw-enet-hsfz-wire-protocol.md`.

```
HSFZ read VIN from DME (constructed):
 00 00 00 05  00 01  F4 12  22 F1 90
 length=5     diag   src dst  UDS
```

G-series and newer use DoIP (unverified).
> Evidence update 2026-11-20: still unconfirmed per model. Tools support both and let you set the order; one MIT TypeScript project says F-series HSFZ and G-series DoIP (single source). Detect at run time, never key on chassis code.

## What is hard

- **Data meaning.** UDS tells you how to ask. It does not tell you what DID 0x4010 means. OEM description files are proprietary, which is the core paywall.
- **Security access.** Seed-key algorithms are secret and per-ECU. Coding and flashing need level-gated unlocks. OpenDiag cannot ship these from leaked sources.
- **Timing.** P2/P2* timers, TesterPresent cadence (about every 2 s), STmin on cheap adapters, 0x78 loops during long operations.
- **Adapter quality.** ELM327 clones cannot do extended-address ISO-TP or reliable multi-frame at speed. K+DCAN cables use FTDI chips with a switch for K-line vs D-CAN.
- **Gateways.** Modern BMWs have a central gateway; some buses are reachable only through it. Newer vehicles add authentication (UDS 0x29) and secured diagnostics (unverified).
- **Safety.** Write services can brick modules. Flash needs stable voltage, 0x85 DTC setting off, and exact block sequencing.
- **Per-vehicle variation.** Same ECU address can mean different units across model years.

## Open-source options

| Project | Use |
|---|---|
| python-can, python-udsoncan, python-doipclient | CAN access, UDS client, DoIP client [6] |
| scapy (automotive contrib incl. BMW HSFZ, UDS, ISO-TP) | packet crafting and decode [10] |
| Linux SocketCAN can-isotp kernel module | in-kernel ISO-TP |
| UDSim | learns ECU diagnostic behaviour from traffic and simulates it [11] |
| ELM327-compatible and OBDLink adapters | cheap OBD-II access (capability varies) |
| EDIABAS-reimplementation efforts (e.g. ediabasx docs) | clean reimplementation of BMW job runtime (unverified how clean; review licence before reading) |

## Implications for OpenDiag

1. Build the transport and service layers from the standards. This is clean and fully original: ISO-TP (normal, extended, mixed addressing), UDS client, KWP2000 client, J1979, HSFZ and DoIP.
2. Make addressing pluggable per brand: BMW extended-address CAN (0x6F1 style), HSFZ, DoIP; Mercedes and Toyota use their own IDs.
3. Adapter abstraction: SocketCAN, J2534, ELM327, ENET, serial K-line.
4. Treat the data layer as community-built: OpenDiag-owned JSON/YAML packs for DIDs, DTC text, routines. Start with generic J1979/UDS-standard DIDs (VIN 0xF190, etc.) and decode only what contributors document from their own vehicles.
5. Learning mode: log traffic from a user's own car to create packs, with no import of OEM files.
6. Safety rails: read-only default, explicit unlock for writes, battery voltage check, auto TesterPresent, dry-run/backup before any 0x2E or 0x34.
7. Skip seed-key for now. Support only ECUs where the user supplies their own algorithm or none is needed.

## Open questions

- What are the verified BMW addresses for each ECU family, from public sources only?
- Which BMW series switched HSFZ to DoIP, and does any model support both?
- Can BMW extended-address behaviour be validated on a real car with a standard ENET cable before shipping?
- Legal position on documenting reverse-engineered DIDs from users' own traffic (interoperability exemptions vary by region).
- Which seed-key levels are required for useful coding on each platform, and is any public?
- Are Mercedes (DoIP / UDS on CAN) and Toyota (CAN with Techstream-specific session behaviour) addressing schemes documented publicly enough?

## Sources

1. OBD-II PIDs. https://en.wikipedia.org/wiki/OBD-II_PIDs
2. On-board diagnostics. https://en.wikipedia.org/wiki/On-board_diagnostics
3. ISO 15765-2. https://en.wikipedia.org/wiki/ISO_15765-2
4. Unified Diagnostic Services. https://en.wikipedia.org/wiki/Unified_Diagnostic_Services
5. UDS DTC knowledge base. https://uds.readthedocs.io/en/latest/pages/knowledge_base/dtc.html
6. python-doipclient, Automotive Ethernet primer. https://python-doipclient.readthedocs.io/en/latest/automotive_ethernet.html
7. CiA, first CAN networks in BMW cars. https://old.can-cia.org/fileadmin/resources/documents/publications/cnlm_issues/march_2020/20-1_p20_the_first_can_networks_in_bmw_cars_holger_zeltwanger_cia.pdf
8. BMW control-unit abbreviations list. https://www.mvwautomotive.com/bmw-ista-list-of-control-units-and-legend/
9. HSFZ notes (port 6801, UDP 6811, no routing activation). https://quantexlab.com/en/develop/elm327_hsfz.html
10. Scapy BMW HSFZ contrib. https://scapy.readthedocs.io/en/latest/api/scapy.contrib.automotive.bmw.hsfz.html
11. UDSim. https://github.com/zombieCraig/UDSim
