# Diagnostic hardware and adapters for OpenDiag

Clean-room note: this document uses only public sources (vendor docs, kernel docs, forums, standards summaries). No proprietary data files or leaked software were consulted. Claims not backed by a fetched source are marked "(unverified)".

## Summary

- OpenDiag needs three transport families, not one: a serial-style ELM/STN adapter (UART bytes over Bluetooth, BLE, WiFi or USB), an Ethernet path for BMW F/G/I-series cars (ENET/HSFZ and standard DoIP), and optionally J2534 PassThru for Windows power users.
- Cheap ELM327 clones are the main support risk. They lie about version strings, drop frames, and break on long multi-frame transfers. Coding and flashing should be gated to adapters we have tested.
- iOS is the constraint that shapes everything. Classic Bluetooth serial (SPP) is not available to ordinary iOS apps, so iPhone users need a BLE adapter, a WiFi adapter, or an MFi-certified one. Android and desktop are much more permissive.
- BMW Ethernet (ENET) needs no special adapter protocol. It is a plain network cable plus a TCP socket, so it is the cheapest and fastest path to full-vehicle access on newer BMWs.
- Recommendation: Tier 1 = STN-based adapters (OBDLink family) and ENET cables. Tier 2 = Vgate vLinker models and K+DCAN for older BMWs. Tier 3 = generic ELM327 clones, read-only emulator-style use, with warnings.

## How it works

### Adapter layers

| Layer | What it does | Examples |
|---|---|---|
| Host link | Moves bytes between phone/PC and the dongle | Bluetooth Classic SPP, BLE GATT UART, WiFi TCP, USB serial |
| Interpreter | Turns text commands into bus frames and back | ELM327 (AT commands), STN (ST commands plus AT) |
| Bus | Physical vehicle network | CAN on OBD pins 6/14, K-line on pin 7, Ethernet on pins 3/11/12/13 or 1/9/12/13 |
| Transport protocol | Segmentation, flow control | ISO-TP (ISO 15765-2), HSFZ, DoIP |

### ELM327 and clones

The ELM327 is a text-command interpreter chip. The host sends `AT` configuration commands and OBD request hex, and gets hex lines back. Clone limitations documented by the Linux kernel's can327 driver, which had to cope with real clones:

- Version strings are meaningless. Clones may claim any version, including "v1.5", and that does not reflect real features.
- Remote transmission request (RTR) frames are dropped silently on clones.
- Silent monitoring (`AT CSM`) is missing or hard-coded on, so the clone ACKs bus frames and can disturb the bus.
- `AT PB` needs v1.4 or later, `AT CSM` needs v1.4b, and `AT D1` needs v1.3. Unsupported commands reply `?`.
- Heavy bus load overflows the UART buffer and the chip prints `BUFFER FULL`, then stops monitoring.
- No hardware filtering is used, so load cannot be cut at the chip.
- The serial link defaults to 38400 baud, and CAN bitrate must be 500000/n.

Source for all of the above: the kernel can327 documentation (see Sources).

The chip is also half-duplex and request-response only. That is fine for OBD-II mode 01/03/09, but it is a poor fit for UDS flashing, tester-present timing, and any bus where the ECU sends unsolicited frames. (Design observation; the kernel doc says the driver "switches between transmit and receive modes as fast as it can" and is best-effort.)

### STN-based adapters (OBDLink)

STN chips from ScanTool/OBD Solutions are command-compatible supersets of ELM327. The vendor says the STN21xx family uses the same command set as STN11xx, and the STN1110 is not recommended for new designs. Extra "ST" commands cover monitoring, filtering, baud-rate control (for example `STPBR`) and power saving (`STSLU`, `STSLUIT`). The OBDLink MX+ uses the STN2255 chip per a reviewer (unverified against vendor docs). Vendor claim: 16-bit processor and 128 KB flash against 8-bit and 32 KB for ELM327.

OBDLink CX (BLE only) facts from the vendor's developer notes:

- BLE 5.1, no Classic Bluetooth, only BLE model in the OBDLink line.
- Custom UART service FFF0: notify on FFF1, write or write-without-response on FFF2.
- Largest MTU 247 bytes, but the phone's negotiated value may be smaller.
- Supports HS-CAN (pins 6 and 14) and ISO/KWP (pins 7 and 15). That means no MS-CAN, no SW-CAN.
- Bonding is only open for the first 5 minutes after power-on. Encryption is always on.
- Overvoltage protection to 100 V.

### vLinker (Vgate)

Vgate says the vLinker line speaks ELM327/ELM329 AT commands and STN's ST commands. The chip inside is not documented in the sources found, so treat "STN compatible" as a command-set claim, not a chip claim. Observed connection modes:

| Model | Link | Notes |
|---|---|---|
| FS, MS | Bluetooth, MFi on iOS | Firmware updater can reportedly switch FS from MFi to BLE + BT 3.0 |
| MC, MC+ | BLE | Recommended by a reviewer for iOS |
| BM+ | BLE 4.0 | Sold for BMW |
| FD+ | Bluetooth, adds MS-CAN | Vendor listing |

BimmerCode reportedly needs the BLE channel on the FS, and its own supported list names the MC+ but not the FS BT (forum report, unverified).

### BMW ENET, HSFZ and DoIP

An ENET cable is an Ethernet cable from the OBD port to RJ45. There is no adapter protocol. The car runs BMW's HSFZ over TCP, and newer cars also speak standard DoIP.

OBD pin layouts for DoIP (ISO 13400-4), per the python-doipclient primer:

| Option | RX+ | RX- | TX+ | TX- | Activation |
|---|---|---|---|---|---|
| 1 | pin 3 | pin 11 | pin 12 | pin 13 | pin 8 |
| 2 | pin 1 | pin 9 | pin 12 | pin 13 | pin 8 |

- The tester detects which option is fitted by measuring resistance between pin 8 and pin 5 (signal ground).
- The tester requests Ethernet by applying +5 V to pin 8, per the primer. A BimmerPost user reports 12 V on pin 8 with an ENET cable plugged in. These conflict, so measure before building hardware (unverified).
- BMW's ENET cable appears to use Option 1.

HSFZ facts (Quantex and an EDIABAS reimplementation analysis; both are third-party descriptions, not BMW documents):

| Item | Value |
|---|---|
| Diagnostic port | TCP 6801 (0x1A91) |
| Discovery | UDP broadcast, port 6811 (Quantex). The EDIABAS analysis calls 6811 a "control port", so the role is unclear |
| Header | 4-byte length, 2-byte type, then payload |
| Message types seen | 0x01 diagnostic request, 0x02 diagnostic response, 0x10 vehicle ID request, 0x11 vehicle ID response |
| Addressing | 1 byte source, 1 byte target. Tester is 0xF4 in Quantex, 0xF1 in the EDIABAS analysis. ECUs 0x10 to 0xEF, 0xDF functional. |
| Routing activation | Not required, unlike DoIP |
| Max UDS size | 4095 bytes (Quantex) |
| Vehicle IP | Usually link-local 169.254.x.x |

The tester-address discrepancy (0xF4 vs 0xF1) is real in the sources. OpenDiag should make it configurable and test on a car.

Standard DoIP differs: UDP and TCP port 13400 (unverified in fetched sources, from the ISO 13400 standard as widely documented), vehicle announcement and identification over UDP, then a Routing Activation request on TCP before diagnostic messages, with 2-byte addressing.

### J2534 PassThru and RP1210

- J2534-1 is a Windows DLL API standardized by SAE. A program calls open, then `PassThruConnect` for a protocol (ISO 15765, CAN, ISO 9141, ISO 14230, J1850) and gets a channel ID. Revision 05.00 appeared in January 2022. J2534-2 covers optional features and J2534-3 covers conformance tests.
- Version differences bite: Quantex notes v04.04 drivers serialize concurrent calls with a mutex, while v05.00 returns an error for concurrent calls.
- RP1210 is the heavy-truck equivalent (ATA/TMC). One source says PassThru checks message format plausibility, while RP1210 does not. RP1210 is out of scope for OpenDiag unless trucks are added.
- J2534 is the only route to OEM-grade flashing with third-party hardware, but drivers are Windows-only and vendor-specific. Linux/macOS support is patchy (unverified).

### Host link per platform

| Platform | Classic BT SPP | BLE | WiFi | USB |
|---|---|---|---|---|
| iOS | No (MFi only) | Yes, CoreBluetooth | Yes | Effectively no for FTDI-style serial (unverified) |
| Android | Yes | Yes | Yes | Yes via USB host API |
| Windows / macOS / Linux | Yes | Yes | Yes | Yes |
| Browser (Chrome desktop) | No | Web Bluetooth (unverified here) | Via a local bridge | Web Serial from Chrome 89 |

Details:

- iOS: Apple forum answers say SPP exists only in Classic Bluetooth, and to use it you must join the MFi program and use the External Accessory framework with an Apple-approved chip. CoreBluetooth gained a Classic GATT option in iOS 13 per Apple's doc title (unverified beyond the title). Practically, iOS means BLE, WiFi or MFi.
- BLE MTU: on Android the default MTU is 23 bytes, giving 20 usable bytes. Apps should request a larger MTU and chunk writes to fit. On iOS the MTU is negotiated automatically, with documented maxima of 135 (iOS 8), 158 (iOS 9) and 185 (iOS 10), and newer values may be higher (unverified). Wait for each write response before the next write.
- Clone BLE adapters commonly use FFF0/FFF1/FFF2, but the roles of the characteristics vary. Discover them at runtime.
- Web Serial is in desktop Chrome 89+. It is disabled on Android Chrome, and the polyfill over WebUSB only supports CDC-ACM, not FTDI.

## What is hard

1. **Clone detection.** Version strings lie, so OpenDiag must probe behavior: send a battery of AT commands, check `?` replies, test buffer handling, and score the adapter. Store the result as a capability profile.
2. **Throughput and timing.** ISO-TP needs the tester to send flow-control frames within the ECU's timing windows (the standard gives millisecond-scale limits; exact values not verified here). Over a text interpreter with a Bluetooth hop, jitter can break multi-frame transfers. ELM-style adapters hide segmentation, which helps for reads but hinders flashing.
3. **BLE write pacing.** Mixed MTU, write-with-response vs without, and iOS vs Android differences cause truncated commands. Needs a robust queue.
4. **Bluetooth bonding quirks.** The OBDLink CX only accepts bonding for 5 minutes after power-on. Cheap dongles auto-sleep or have fixed PINs (1234, 0000).
5. **Electrical.** ISO 9141/K-line uses 12 V signaling, and CAN uses differential 2.5 V +/- 1 V. Cheap clones with missing protection can brown out on low battery voltage. During coding or flashing, a battery below roughly 12.5 V can cause failed writes, so OpenDiag should read battery voltage (ELM `AT RV`) and block risky operations. The exact threshold is a design choice (unverified).
6. **K+DCAN cables.** They are FTDI-based USB serial cables with a switch between K-line and D-CAN. FTDI driver and latency timer settings matter (a different vendor's manual sets the FTDI latency timer to 1 ms, which shows the setting exists; whether BMW tools need it is unverified). Listings disagree on chip (FT232RL vs FT232RQ). Counterfeit FTDI chips have been a historical driver problem (unverified).
7. **ENET addressing.** Link-local IPs, DHCP-less cars, and the activation line mean the host needs a static or link-local address on the Ethernet port, and iPhones need a Lightning or USB-C Ethernet dongle (unverified).
8. **Pin 8 voltage ambiguity.** Sources disagree (5 V vs 12 V). A DIY activation adapter needs measurement before use.
9. **Safety.** A wrong write on a gateway, body or engine module can brick it. Adapter quality directly affects the risk.

## Open-source options

| Project | Use | Note |
|---|---|---|
| Linux can327 | ELM327 as SocketCAN device | Good catalogue of clone problems; GPL-2.0 or BSD-3 per its header |
| python-doipclient | DoIP client | Docs include the pin primer |
| python-udsoncan, python-uds | UDS stack | Referenced in a J2534 index |
| ediabasx (emdzej) | Reimplementation analysis of BMW ENET | Study for protocol facts only; check license and provenance before reusing any code |
| openj2534 (jakka351) | Open J2534 driver | Listed in an index of J2534 projects (unverified maintenance) |
| gocan | Go CAN library with passthru adapter | MIT per the package page |
| rp1210.Net | RP1210 in .NET | Listed in the same index (unverified) |
| elm327 / elm327-obd2 (npm) | ELM327 libraries | Node-based, not directly browser-ready |

Check each license before linking or copying. Apache-2.0 is compatible with MIT and BSD, but not with GPL-2.0-only for linked code.

## Implications for OpenDiag

### Design

- **Adapter abstraction.** One interface (`open`, `send_frame`, `recv`, `set_filter`, `voltage`) with backends: ELM/STN text, ENET/HSFZ, DoIP, J2534, SocketCAN. Keep the interpreter quirks inside the ELM/STN backend.
- **Capability profile per adapter.** Fields: chip family, firmware, CAN speeds, K-line support, MS-CAN support, max safe write size, BLE MTU, supports flashing (yes/no). Stored locally, shown in the UI.
- **Safety tiers.** Read-only for any adapter. Coding allowed on Tier 1 and 2. Flashing only on ENET, DoIP or J2534.
- **Voltage gate.** Refuse coding when battery voltage is low or unreadable.
- **Transport plugins.** BLE, WiFi TCP, Classic BT (Android/desktop), USB serial, Ethernet.

### Recommended supported-adapter matrix

| Adapter | Link | iOS | Android | Desktop | BMW | Mercedes | Toyota | Tier | Notes |
|---|---|---|---|---|---|---|---|---|---|
| OBDLink MX+ | BT Classic + BLE (BLE per reviewers, unverified) | Yes (reviewer-reported) | Yes | Yes | Read, CAN coding via apps | Read | Read | 1 | STN2255, MS-CAN and SW-CAN claims need vendor verification |
| OBDLink CX | BLE only | Yes | Yes | Yes | Read, coding (HS-CAN only) | Read | Read | 1 | Documented GATT behavior; no MS-CAN |
| OBDLink EX | USB (unverified) | n/a | Android USB (unverified) | Yes | K+DCAN-class use (unverified) | n/a | n/a | 1 (pending) | Not confirmed in sources; verify before listing |
| BMW ENET cable (RJ45) | Ethernet | With Ethernet dongle (unverified) | With USB Ethernet (unverified) | Yes | Full, F/G/I series | No | No | 1 | Cheapest full-access path |
| Vgate vLinker MC+/MC | BLE | Yes | Yes | Yes | Read, coding | Read | Read | 2 | Command-set claim only |
| Vgate vLinker FS/MS | BT (MFi on iOS) | Via MFi | Yes | Yes | Read, coding | Read | Read | 2 | MFi needs the External Accessory path |
| Vgate vLinker FD+ | BT, MS-CAN | Yes | Yes | Yes | Read, coding | Read | Read, Toyota MS-CAN | 2 | MS-CAN helps some Toyotas |
| K+DCAN (FTDI) | USB | No | Android USB host (FTDI) | Yes | E-series, K-line + D-CAN | No | No | 2 | Needs FTDI driver |
| J2534 device | USB | No | No | Windows | Flash | Flash | Flash | 2 (optional) | Vendor DLL needed |
| Generic ELM327 clone | BT / WiFi / BLE | WiFi or BLE only | Yes | Yes | Basic OBD only | Basic OBD | Basic OBD | 3 | Read-only; warn |

Entries marked "(unverified)" or "pending" should not ship as supported until tested on hardware.

### Build order

1. ELM/STN backend with clone probing, over BLE, WiFi and Android Classic BT.
2. ENET/HSFZ backend (TCP 6801) with a configurable tester address, then standard DoIP with routing activation.
3. K+DCAN serial backend for E-series.
4. J2534 backend on Windows.
5. iOS: BLE and WiFi first. Evaluate MFi only if demand justifies the program cost (unverified).

## Open questions

- Which tester source address does a real F-series car accept (0xF4 or 0xF1)? Needs bench testing.
- What is the actual voltage on pin 8 of an ENET cable, and does a car need a 5 V or 12 V activation signal?
- Which chip is inside each vLinker model, and does the "ST command" claim hold for the full STN command set?
- Do OBDLink MX+ and EX behave identically for MS-CAN and SW-CAN? Not confirmed here.
- What MTU do current iPhones and Android versions negotiate with FFF0-style adapters in practice?
- Does Android allow reliable FTDI K+DCAN use with a userspace driver at low latency?
- Which J2534 vendors have Linux or macOS drivers, and under what licenses?
- Does Apple's MFi program allow an open-source project to ship support for third-party MFi dongles without a license? (Likely yes for the app side, hardware side differs; unverified.)

## Sources

- Linux kernel can327 (ELM327) driver docs, clone limitations and AT version notes: https://docs.kernel.org/networking/device_drivers/can/can327.html
- OBD Solutions STN2120 page: https://obdsol.com/solutions/chips/stn2120
- ScanTool product documentation: https://scantool.net/scantool/downloads/product-documentation
- STN1110 vendor page: https://www.obdsol.com/solutions/chips/stn1110/
- OBDLink CX adapter notes (BLE, MTU, services, bonding): https://support.obdlink.com/support/solutions/articles/43000746707-obdlink-cx-adapter-notes
- OBDLink MX+ review (chip, speed claims): https://iamcarhacker.com/obdlink-mx-review/
- BlueDriver vs OBDLink MX+: https://obdadvisor.com/bluedriver-vs-obdlink/
- Vgate vLinker MS review: https://iamcarhacker.com/vgate-vlinker-ms-owners-review/
- Vgate vLinker FS review: https://iamcarhacker.com/vgate-vlinker-fs-review/
- Vgate forum, vLinker FS with BimmerCode on iOS: https://forum.vgatemall.com/showthread.php?pid=4334
- Vgate vLinker MC+: https://vgatemall.com/products-detail/i-5/
- Automotive Ethernet primer (DoIP pins, activation): https://python-doipclient.readthedocs.io/en/latest/automotive_ethernet.html
- Quantex HSFZ description: https://quantexlab.com/en/develop/elm327_hsfz.html
- EDIABAS Ethernet interface analysis (ports, message types): https://emdzej.github.io/ediabasx-docs/reference/interfaces/xenet32-analysis.html
- BimmerPost ENET pin 8 report: https://f30.bimmerpost.com/forums/showthread.php?p=30748289
- Apple developer forums, SPP on iOS: https://developer.apple.com/forums/thread/95083
- Apple developer forums, connecting to Bluetooth: https://developer.apple.com/forums/thread/91997
- Apple, Core Bluetooth Classic: https://developer.apple.com/documentation/corebluetooth/using-core-bluetooth-classic.md
- In The Hand, Bluetooth Classic on iOS: https://inthehand.com/2022/12/15/12-days-of-bluetooth-6-bluetooth-classic-on-ios/
- Kvaser, intro to SAE J2534: https://kvaser.com/about-can/can-standards/j2534/
- Quantex J2534 reference: https://de1.quantexlab.com/en/develop/j2534.html
- IME, PassThru (vs RP1210): https://www.ime-actia.de/en/?p=5173
- J2534 open-source index: https://awesome.ecosyste.ms/projects/github.com%2Fjakka351%2Fopenj2534
- gocan passthru package: https://pkg.go.dev/github.com/entroview-team/gocan/adapter/passthru
- Chrome Web Serial docs: https://developer.chrome.com/articles/serial
- Chromium-dev thread on Web Serial on ARM64 and polyfill: https://groups.google.com/a/chromium.org/g/chromium-dev/c/iS3HhY_Tm6E
- K+DCAN listings (switch, chip variants): https://www.turnermotorsport.com/p-8677166-kdcan-cable-ftdi-ft232rl-style-obd2-cable
- VSCAN manual (FTDI latency timer example): https://cdn.shopify.com/s/files/1/1098/6512/files/VSCAN_Manual.pdf
