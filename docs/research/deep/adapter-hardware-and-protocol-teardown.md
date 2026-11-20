# Adapter hardware and protocol teardown

Scope: what sits between a phone or laptop and the car, and what OpenDiag's software layer must probe and handle to stay robust across those devices. Covers STN chips and the OBDLink CX, ELM327 and clones, vLinker, Carista, BLE, WiFi ELM dongles, WiFi-to-ENET bridges, ENET cabling, K+DCAN, J2534 and CAN FD interfaces.

Research date: 2026-11-20. References like [L12] point to the Source ledger at the end.

## Honesty about how this was done

- The web search budget ran out before any search could run. Every source below was found by fetching a URL I already expected to exist, not by discovery searching. That biases the set toward vendor pages, Wikipedia, GitHub READMEs and standards-style tutorials.
- **No forum thread was read** (Bimmerpost, Bimmerfest, Reddit, Benzworld and so on). The "what fails in the field" part is therefore thin and mostly comes from vendor error-message docs and one BMW-specific open-source project's compatibility notes. Treat all field-failure statements as under-evidenced.
- Several attempted pages failed: Tactrix OpenPort page (HTTP 503), Drew Tech Mongoose pages (empty or 404), vLinker site (certificate error, then an empty page), Carista adapter page (404), ISO and SAE standard pages (403 or empty), Apple Core Bluetooth pages (title only), Bluetooth SIG assigned numbers (403), two OBDLink product pages (404), Wikipedia DoIP and ISO 13400 pages (404). Nothing from those was used.
- Two PDFs were read page by page as images: the ELM327 datasheet (pages 1 to 10 and 87 to 90 of 94) and the OBDLink Family Reference and Programming Manual (pages 1 to 6, 26 to 29 and 49 to 54 of 78). Those are the strongest sources here, and only partly read.
- Nothing about leaked tools, seed-key algorithms or circumvention was opened. Community replacement-firmware documents for clone adapters were read only for what hardware they target, not for how to flash.

## Summary

1. The OBDLink CX is an STN2310-based, Bluetooth 5.1 BLE adapter that speaks the ELM327 command set plus an extended ST command set, and covers high-speed CAN and ISO/KWP only [L2][L4]. It has no single-wire or medium-speed CAN and no CAN FD claim in anything I read.
2. The STN family (STN1110, STN2100, STN2120) are interpreter chips whose old part numbers are listed obsolete by the vendor, while the CX and several other OBDLink devices are listed active [L2][L10][L11][L12]. Software should key off the identity string the device reports, not the chip name.
3. ELM327 is a PIC-based interpreter with a fixed 4 MHz design and a 512-byte transmit buffer in the official datasheet [L1]. The vendor says its own STN buffer is much larger (256 bytes quoted for the ELM327 in the OBDLink manual, which disagrees with the ELM datasheet; see disagreements) [L1][L2].
4. Real ELM327 firmware stops at v2.3 and "v1.5" was never released, so any adapter reporting v1.5 is lying about its version [L3]. Wikipedia attributes this to v1.4 being sold with copy protection off [L3]. That is a single, uncited Wikipedia section.
5. A BMW-specific open-source project says ELM327 adapters only work for BMW over D-CAN, only for cars from about March 2007, and that fake v1.5 units with a PIC18F25K80 will not work [L52]. Single source, but the most specific clone claim I found.
6. BLE is a different transport from the serial Bluetooth that old ELM dongles use. Throughput depends on ATT MTU (default 23), connection interval, data length extension and write type [L9][L22]. iOS typically negotiates 185 bytes [L22]. I could not find the CX's GATT service layout in any source I could read.
7. WiFi ELM dongles are plain serial-over-TCP bridges. The only concrete defaults I found are port 35000 normally, and port 23 for an ESP8266-style adapter at 192.168.4.1 [L54]. The default IP for generic dongles was not confirmed.
8. BMW "ENET WiFi" adapters are not ELM devices. One documented example is a repurposed 3G/4G router running OpenWrt with a built-in DHCP server and default address 192.168.100.1 [L51]. BimmerCode lists many ENET-style WiFi adapters by brand [L40]. For wire details see the sibling HSFZ document, which this ledger does not re-count.
9. J2534 is a Windows-oriented API that passes frames to the car. Wikipedia names version 05.00 (January 2022) as latest [L6]. Open-source projects wrap it for Rust and others, with SocketCAN as the Linux path [L34][L35].
10. CAN FD changes the frame format, with up to 64 data bytes and a second bit rate, and classic CAN nodes raise errors on seeing the FD bit [L7][L24]. A classic-CAN adapter cannot carry it. Linux exposes FD through a separate 72-byte frame structure [L29].

## What I found

### 1. ELM327 baseline behaviour (the contract everything else imitates)

**Command model.** The ELM327 expects text lines ending in carriage return. Commands starting with AT are internal. Anything else must be hex digits for the bus [L1]. It is case-insensitive and ignores spaces and control characters [L1]. A lone carriage return repeats the last command [L1]. The device prints a ">" prompt when idle, and software "should always wait" for that prompt or the busy line before sending the next command [L1].

**Failure modes the datasheet documents** [L1]:
- A bare "?" means "not understood". It does not mean the bus rejected anything, because the chip never judges the OBD payload [L1].
- "BUFFER FULL": the datasheet quotes a 512-byte transmit buffer that can fill, especially on CAN. Suggested fixes are a higher serial speed, headers and spaces off, or CAN filtering [L1].
- "BUS BUSY", "BUS ERROR", "CAN ERROR", "FB ERROR" (output not seen on input, mostly wiring), "DATA ERROR", "<DATA ERROR" (checksum or format problem, including CAN auto-formatting left on for a non-ISO-15765-4 system), "<RX ERROR", "NO DATA", "STOPPED" (a character or RTS interrupted a running operation), "UNABLE TO CONNECT" (no protocol found, often just ignition off), "LV RESET" (brown-out reset), "ACT ALERT" and "LP ALERT" (about to sleep) [L1].
- "ERR94" is a fatal CAN error that forces a full chip reset, returning settings to defaults, and from v1.3a can block further automatic CAN searches until the next reset [L1].
- The datasheet warns that a NULL byte (value 00) may very rarely appear in the output stream, and software should ignore bytes of value 00 [L1]. This is a cheap, real robustness rule.
- If an incomplete command sits for about 20 seconds, the chip aborts it and prints "?" [L1].

**Serial rate.** Default is 9600 or 38400 baud depending on a hardware pin, and it can be raised [L1]. The reset time is about 800 ms for ATZ and about 2 ms for ATWS, per the datasheet table [L1]. Software must wait that long before the first command after reset.

**Version history in the datasheet** [L1]: v1.0 shipped with the first command set. v1.1 added programmable parameters and flow-control control. v1.2 added adaptive timing, J1939 and user-defined CAN protocols B and C. v1.3 added the response-count argument, new CAN receive-address commands, RTR sending and the STOPPED and LV RESET messages. I read only up to part of v1.3; v1.4 onward comes from Wikipedia [L3]. Wikipedia says v1.4 added low power mode and extended CAN addressing, v2.1 added response-pending handling, and v2.3 added an extra filtering layer [L3]. Single source for the later versions.

**Clone relationship.** Wikipedia says v1.4 shipped without code protection, was copied onto cheap chips, and that clones often report a false version string, sometimes a version that never existed [L3]. The same page flags this section as lacking citations [L3], so I rate it medium at best. A separate claim comes from the BMW project: "fake" 1.5 units built on a PIC18F25K80 do not work for it, and ARM-based adapters are often not fully ELM327-compatible [L52]. These two sources do not contradict each other, but they do not prove each other either.

**What a clone typically drops.** I did not find a source that lists which AT commands specific clones lack. The ELM327 emulator project mentions that some real adapters apply a short inter-character timeout and lets users reproduce a 15 ms version of it [L5], which hints at one class of difference but is not a clone census. A GitHub list of CAN projects also warns about clone firmware without detail [L36]. Gap: no dependable clone capability matrix.

### 2. STN chips and the OBDLink family

**Product map from the vendor manual** [L2]:
- Chips: STN1110, STN1170, STN2100 and STN2120 are all listed obsolete in the 2025 manual revision. The STN1110 page itself says it is discontinued and recommends the STN2100 [L11][L12].
- The CX is device ID STN2310, status active, "OBD to BLE with support for HS CAN and ISO/KWP" [L2]. The LX (STN1155) and MX+ (STN2256) are active Bluetooth devices. The MX Wi-Fi (STN1152) is obsolete [L2].
- The manual's own table notes that some devices support iOS [L2]. The CX has an iOS note.

**Chip comparison from the vendor chip pages** [L10][L11][L12]:
- STN1110: ELM327 command set plus extended ST commands, all legislated OBD protocols, J1939, raw CAN, UART up to 10 Mbps.
- STN2100: same pricing but twice the flash and four times the RAM of the STN1110, 16-bit core, claims better stability than the original ELM327.
- STN2120: same firmware family, adds support for GM single-wire CAN and Ford medium-speed CAN, and more memory.
- None of these three pages mention CAN FD or Bluetooth.

These are marketing pages. The memory comparisons are claims. The manual says ST commands and protocol support differ per device and tells developers to consult each device's own datasheet [L2].

**CX product page** [L4]: Bluetooth 5.1 LE, protocols ISO 15765, J1939, raw ISO 11898, ISO 9141 and ISO 14230. 8 to 18 V operating range, 55 mA running and under 1 mA in a battery-saver mode. The page claims full coverage of BimmerCode's vehicles. It does not state the chip, throughput, firmware update path or range. The OBDLink FAQ adds that the CX has a Bluetooth 5.1 BLE module with receive sensitivity quoted at minus 93 dBm, versus a Bluetooth 3.0 module in the MX, MX+ and LX [L39].

**ST command families that matter for a tool like OpenDiag** (from the manual's tables) [L2]:
- Identity and state: STI (identity string), STDI, STRSTNVM (factory reset of saved settings; that command's page says some stored IDs and calibration values survive).
- UART: STBR changes the serial baud in a "software-friendly" handshake: the chip validates the rate to within 3 percent, waits 75 ms, prints its identity at the new rate, and expects a carriage return back, otherwise it reverts [L2]. The older AT baud-rate commands exist too.
- Protocol: STP, STPR, STPRS, STPO, STPC, STPTO (request timeout), STPTOT (transmit timeout), STPTRQ (minimum gap before the next request), STPX (send arbitrary message) [L2].
- CAN: STCAF (addressing format), STCFCPA / STCFCPC (add or clear flow-control address pairs), STCMM (monitor mode), STCSEGR and STCSEGT (ISO-TP segmentation on receive and transmit), STCSTM (STmin delay offset), STCTOR (flow-control and consecutive-frame timeouts), STCTR and STCTRR (CAN timing registers) [L2].
- Monitoring and filtering: STM, STMA, and pass and block filters (STFPA, STFBA, flow-control filters) [L2].
- PowerSave: many sleep and wake triggers (UART inactivity, voltage level, voltage change, protocol activity, external pin) [L2].
- Bluetooth: STBTDN (name), STBTI and STBTIX (device info), STBTPM (pairing mode, classic Bluetooth only) [L2]. The manual's STBTIX example for BLE shows modem ID, firmware version, device address, device name and an appearance value [L2].
- General-purpose I/O, periodic messaging (STPPMA and friends) and batched commands (STBC, STBCOF) [L2].
- Deprecated names exist (STCAFCP replaced by STCFCPA, and so on). Software that sends old names to new firmware, or the reverse, will get "?" [L2].

**STN-specific errors beyond ELM** [L2]: "FC RX TIMEOUT" (no CAN flow-control frame in time; fix by raising STCTOR, allowing the frame through a filter, or adding a custom flow-control pair), "OUT OF MEMORY" (notably when too many periodic messages are added; the manual says code must handle this gracefully and that limits vary by firmware), "UART RX OVERFLOW" (mostly on ISO 9141/14230 when large data arrives while the chip is sending keep-alives), and a "STOPPED" note that the current firmware ignores line-feed characters to avoid accidental interruption. "BUFFER FULL" is described as uncommon because the buffer is larger than the ELM327's 256-byte figure the vendor quotes [L2].

**Batching.** Batched commands let a host send several commands in one line separated by pipes and choose how "OK" replies are shown (verbose, suppress, coalesce) [L2]. This matters on BLE and WiFi because every round trip costs a connection interval or a network hop. It is STN-only, so it must be capability-gated.

### 3. BLE transport behaviour

**Generic facts.** GATT groups characteristics under services, identified by UUIDs. Notifications push data without acknowledgement, indications require one, and a write can be with or without response [L13]. ATT's default MTU is 23 bytes, leaving 20 for data after the 3-byte ATT header (the 23-byte figure is stated in [L9]; the 3-byte header is stated in general terms in [L9] as 2-byte handle plus opcode, so treat "20" as derived). Larger MTUs reduce overhead modestly, about 0 to 15 percent in the Punch Through analysis [L9]. The Memfault primer reports link-layer data length extension raising payload from 27 to 251 bytes and the 2M PHY helping further, with real throughput bounded by packets allowed per connection event [L22]. It says modern iOS typically settles at an ATT MTU of 185 with 15 ms as the shortest connection interval for ordinary apps [L22], and that older Android phones often stuck at the default MTU [L22]. Practical consequence: a diagnostic response of hundreds of bytes arrives in many notifications and the host must reassemble using the prompt character, not packet boundaries.

**Platform rules.**
- Android: discover services after connect, then enable notifications on the characteristic and write the client characteristic configuration descriptor [L30]. Operations are asynchronous with callbacks [L30]. The Android docs also warn that BLE data is visible to all apps on the device [L46].
- iOS: I could not read Apple's pages (title only). The "maximumWriteValueLength" idea is from my own background knowledge and is **unsourced** here. Web Bluetooth docs say parallel reads and writes can fail on some platforms and operations should be queued [L31]. That is the same serialisation rule Android needs.
- Web Bluetooth needs HTTPS, a user gesture, and covers only BLE, not classic RFCOMM [L31].

**What I could not find.** The CX's service UUID, which characteristic is write and which is notify, whether it uses a UART-over-GATT convention, its negotiated MTU, and its real throughput. A search for exactly this was my first planned query and was blocked by the budget. This is the single biggest gap in the topic. Do not hard-code any UUID until it is read from a real device (see Implications).

**Classic Bluetooth contrast.** Wikipedia describes RFCOMM and SPP as a reliable byte stream like a serial cable [L33]. Older OBDLink devices (MX, MX+, LX) use classic Bluetooth [L39]. The EdiabasLib project talks to ELM and similar adapters via serial Bluetooth on Android [L21]. A BLE-only adapter like the CX therefore needs a different code path from the dongles that behave like a serial port.

### 4. WiFi ELM327-style dongles

Evidence here is thin.
- The only concrete default I found: for a WiFi adapter the Deep OBD docs say the app uses port 23 when in hotspot mode or when the address is 192.168.4.1 (ESP8266 style), and otherwise 35000 [L54]. That implies adapters in the wild split between at least two address-and-port conventions. It is a single project's convention list, not a standard.
- The same doc says hotspot mode requires a manually assigned IP, and ESP8266 adapters can be configured to join the phone's hotspot [L54].
- The Deep OBD replacement-firmware page names WiFi Mini variants built on an ESP8266 together with a PIC18F25K80 [L53], which tells us a typical cheap WiFi ELM is two chips: a WiFi module bridging a serial port, plus the ELM-style interpreter.
- TCP behaviour: Nagle's algorithm holds small writes and, combined with delayed ACKs, can add up to about 500 ms to a request and response pattern. The standard fix is TCP_NODELAY [L49]. A diagnostic tool sending short commands should set it [L48][L49].
- Android: an app can bind its process or a socket to a specific network with ConnectivityManager. This matters when the phone prefers cellular because the dongle's WiFi has no internet [L47]. The page I read did not discuss no-internet networks directly, so the exact flags are not confirmed.
- iOS local network permission: the Apple page returned only a title, so the iOS 14 permission prompt is **unsourced** here. The sibling BM3 document records that iOS needs the local network permission for the MHD adapter (reseller and MHD guide sources there).

### 5. WiFi-to-ENET bridges and the ENET cable

**What they are.** The one hardware teardown available: an ENET WiFi adapter documented by EdiabasLib is a 3G/4G router board (MediaTek/Ralink RT5350F, 350 MHz) running OpenWrt with a web interface and DHCP server. Default address 192.168.100.1, SSID "Deep OBD BMW". The doc says the product is no longer sold, a pre-F-series car needs a Bluetooth adapter instead, and recovering from a bad configuration needs the case opened and a reset button pressed [L51]. That means a WiFi ENET adapter is a small Linux router that bridges WiFi to the car's Ethernet pair, not a protocol translator in the ELM sense. Caveat: this is one product, from one project, and it is a community-defined device. Other brands (MHD, bm3, vLinker) may differ.

**Who sells them.** BimmerCode's adapter page lists, under WiFi (ENET-style): UniCarScan UCSI-3000, MHD ENET, bm3 ENET, DITUPA, Exctool ENET, BMDiag ENET and KIES ENET for F, G and I series, xA Ultra for F and G, and MHD Universal Wi-Fi and vLinker BM and MC Wi-Fi for a broader range including E and R series [L40]. Wired, it lists an ENET cable with a Lightning or USB-C Ethernet adapter for F, G and I series, and a DCAN USB cable for E and R series [L40]. It lists OBDLink CX, MX+, LX, EX, UniCarScan UCSI-2100 and vLinker BM+, BM, MC and MC+ under Bluetooth [L40]. Veepeak OBDCheck BLE and BLE+ are listed for E, F, I and R series from 2008 [L40]. The page does not mention clones or latency [L40].

**Latency and IP ranges.** No source I read measured WiFi-to-ENET latency. IP ranges: 192.168.100.1 for the Deep OBD ENET adapter [L51]; car-side 169.254.x.x link-local is recorded in the sibling BM3 and HSFZ documents from reseller and write-up sources of low to medium reliability. The EdiabasLib ENET page says Ethernet cable setups need a manually set APIPA address [L51]. Treat IP defaults as per-adapter, discovered not assumed.

**ENET RJ45 cable and activation line.** Not independently sourced in this document's ledger. The sibling document on BMW ENET and HSFZ records: OBD pin 8 as the Ethernet activation line (three sources agree), two pin layouts for the Ethernet pairs (pins 3 and 11 plus 12 and 13, or pins 1 and 9 plus 12 and 13), and that the exact resistance or voltage a genuine cable puts on pin 8 is unconfirmed. I am not repeating those as findings of this run. The Automotive Ethernet Wikipedia page I read has nothing on OBD pins [L28].

**Wire protocol.** Per the sibling document, BMW's own framing (HSFZ) uses TCP 6801 and UDP 6811, distinct from standard DoIP on port 13400, and newer cars may speak either. The EdiabasLib compatibility page confirms the split: "ENET" adapters are for F-series and newer, which use HSFZ or DoIP [L52]. Because UDS is the layer above, python-udsoncan and the UDS Wikipedia page describe the transport-independent part [L16][L27].

### 6. K+DCAN and older BMW cables

- EdiabasLib's matrix: FTDI-based USB "INPA-compatible" cables work for BMW-DS2 and BMW-FAST and use D-CAN on ENET models; counterfeit FT232R chips cause communication problems [L52]. ELM327-type adapters support only D-CAN, not older K-line or DS2 [L52]. A custom Bluetooth adapter can do both [L52].
- The Deep OBD docs describe a switch between a 500 kbit/s CAN setting and K-line with CAN off, and say separation time and block size default to 0 and should only be changed if communication fails [L54]. That tells us a cable-class adapter has a tiny configuration surface: bus choice, bit rate, and two ISO-TP timing values.
- J1962 pins: CAN high and low on 6 and 14, K-line and L-line on 7 and 15, J1850 on 2 and 10, battery on 16 [L19]. So a K+DCAN cable is physically a CAN transceiver on 6 and 14 plus a K-line driver on pin 7, and an adapter that omits K-line cannot talk to older modules. The page notes the L-line is optional [L19].
- K-line detail (init sequences, baud rates) was not obtainable; the Wikipedia K-Line page was nearly empty [L20]. The ELM datasheet shows protocol support lists (ISO 9141-2, ISO 14230-4 fast and slow init) but I did not read those pages in depth [L1].

### 7. J2534 devices (Tactrix, Mongoose, Autel, Cardaq)

- Standard: Wikipedia's J2534 stub says SAE published universal passthrough requirements in 2004 and lists J2534-1 version 05.00 (January 2022) as the latest [L6]. It does not describe the function list or version differences, so those claims stay unsourced here.
- Tactrix's site only states it makes OpenPort J2534 interfaces and EcuFlash [L18]. The detailed product page returned HTTP 503. Drew Tech (Mongoose), Autel and Cardaq pages could not be read at all.
- Open-source consumers: ecu_diagnostics (Rust) lists J2534 passthrough as a supported path, alongside SocketCAN, SLCAN and PCAN-USB, with D-PDU planned [L34]. OpenVehicleDiag uses J2534-2 and mentions the Macchina M2, and says it removed a parser after a DMCA notice [L35]. A CAN project list mentions a virtual J2534 driver that runs over TCP/IP and a .NET wrapper suite [L36].
- Limits: nothing I read measured J2534 timing, batching or concurrency. Whether a given vendor DLL supports the CAN FD or Ethernet parts of newer API revisions is **not established**.

### 8. CAN FD interfaces

- Frame differences: up to 64 data bytes, DLC values 9 to 15 map to 12 to 64 bytes, FD frames set a format bit, a bit-rate-switch bit moves the data phase to a faster rate (arbitration up to 1 Mbit/s, data roughly 5 to 8 Mbit/s), and CRC length changes with payload [L7][L24].
- Compatibility: classic CAN nodes react to the FD bit with an error frame, so mixed buses need care [L24]. Early Bosch CAN FD is not compatible with the ISO 11898-1:2015 version [L24]. Most loggers can receive both but transmitting requires choosing whether to use bit-rate switching [L24].
- Adoption: first CAN FD cars around 2019 to 2020; the author's company says under 5 percent of its customers use it [L24]. Single commercial source.
- Hardware: comma.ai's panda handles CAN and CAN FD on an STM32H725 [L26]. The candleLight firmware lists CAN FD boards (STM32G0B1) but says mainline firmware does not support them yet [L38]. The CAN project list names several FD-capable devices [L36].
- Linux: a raw socket sees classic frames at 16 bytes and FD frames at 72 bytes, and FD must be enabled by a socket option [L29].
- ELM and STN: nothing in the ELM datasheet pages I read, the STN chip pages, or the CX page claims CAN FD. Consumer BLE adapters should be treated as classic-CAN-only until a device reports otherwise.

### 9. Diagnostic layers an adapter must carry

- OBD over CAN: 11-bit functional request ID 7DF, physical IDs 7E0 to 7E7, replies on 7E8 to 7EF; 29-bit functional 18DB33F1 with replies in 18DAF1xx [L15][L25]. ISO 15765-4 limits tool setup to 250 or 500 kbit/s, 11 or 29 bit IDs and 8-byte frames [L25].
- ISO-TP: single, first, consecutive and flow-control frames; flow control carries block size and STmin; classic length cap of 4095 bytes; padding commonly to 8 bytes [L8][L23]. In practice a fixed flow-control frame is often sent around 50 ms after the request [L25].
- UDS: services such as 0x10, 0x22, 0x27, 0x31 and 0x3E; negative responses are 0x7F plus the request ID plus a code; code 0x78 means "response pending, wait" [L16][L23]. Tester-present keeps a non-default session alive [L16][L23].
- J1939: 29-bit identifiers, transport via BAM or RTS and CTS up to 1785 bytes [L44].
- Linux ecosystem: SocketCAN has raw, broadcast manager and ISO-TP modules [L29]; can-utils includes ISO-TP send and dump tools and an SLCAN daemon [L42]; the udsoncan Python library can run UDS over a SocketCAN ISO-TP connection [L27].
- The ELM327 emulator README lists up to six PIDs per mode 01 request and treats 7DF and 18DB33F1 functional addresses [L5].

## Evidence quality and disagreements

**Strong:** the ELM327 datasheet error list and reset timing [L1]; the OBDLink manual's product table, ST command tables and error messages [L2]; Wikipedia plus CSS Electronics agreement on ISO-TP and CAN IDs [L8][L15][L25]; the Linux kernel CAN documentation [L29]; Android BLE API pages [L30][L46].

**Medium:** vendor chip pages (marketing claims) [L10][L11][L12]; the BimmerCode adapter list (a vendor-curated list, not a test) [L40]; Memfault and Punch Through BLE analyses (good technical writing, but figures are examples) [L9][L22]; EdiabasLib documentation (excellent specifics, one project's viewpoint, partly describes its own firmware) [L21][L51][L52][L53][L54][L55].

**Weak or thin:** the Wikipedia ELM327 clone section (flagged as uncited) [L3]; Wikipedia J2534 stub [L6]; Wikipedia K-Line page [L20]; Tactrix home page [L18]; BimmerCode FAQ [L41]; the ediabaslib docs directory listing [L45]; the Hayes page, included only for the AT convention [L50].

**Disagreements and tensions:**
1. **Buffer size.** The ELM datasheet says a 512-byte internal RS232 transmit buffer [L1]. The OBDLink manual says the ELM327 provides a 256-byte buffer [L2]. They may refer to different things (transmit versus receive, different silicon versions) or one may be an error. Unresolved. Do not rely on either number; test the actual device.
2. **Which "1.5" is real.** Wikipedia says v1.5 was never released [L3]. EdiabasLib recommends "versions 1.4b, 1.5, or original 2.1" using a PIC18F25K80 without an MCP2515, and says "fake" 1.5 units with a PIC18F25K80 will not work [L52]. These can both be true only if some 1.5 string is genuine on specific hardware and others are not; neither source explains how to tell. The only safe conclusion: the version string is not a reliable identity.
3. **ELM327 CPU.** The datasheet notes a PIC18F2480 base [L1] and Wikipedia agrees [L3], while the EdiabasLib guidance treats PIC18F25K80 parts as the relevant newer clone hardware [L52][L53]. Not a contradiction, but it shows clone hardware has moved away from the original chip.
4. **WiFi default port.** Port 35000 versus 23 depends on the adapter [L54]. No standard.
5. **CAN FD in OBDLink.** Silence in every STN page I read is not evidence of absence. I cannot say the CX lacks CAN FD at the firmware level, only that no source I read claims it.
6. **Product status.** The OBDLink manual lists the MX Wi-Fi as obsolete and the MX+ in a mix of active and out-of-production lines [L2], while the FAQ still lists MX+, MX and LX hardware [L39]. Fine, different dates, but the CX product page showed "out of stock" at fetch time [L4].

## Implications for OpenDiag

### What to build

1. **A transport layer split from a protocol layer.** Transport kinds: classic Bluetooth serial, BLE GATT, TCP socket (WiFi ELM), HSFZ or DoIP over TCP and UDP (ENET), USB serial (K+DCAN), J2534, SocketCAN. Above that, one command interface: send bytes, receive bytes with a prompt or length rule.
2. **A capability probe, run on connect and cached per adapter identity.** Steps, in order, each tolerant of "?":
   - Reset and wait about 800 ms, drain bytes, ignore NULL bytes, find the prompt [L1].
   - Read the identity string and the version and device-description commands. Then try the STN identity command; a "?" means an ELM-type device or a clone [L1][L2].
   - Set echo, linefeed, spaces and headers to known values on every connect, and verify by round trip.
   - Test a known-good command from the ELM set and a known-bad one, to see that "?" comes back (some clones reply oddly or not at all). This is design inference, not a sourced test.
   - Check an advanced command that cheap clones are said to lack, such as setting a flow-control header or CAN filter, and record pass or fail. Which commands clones fail on is not established by my sources, so make the set configurable and learn it from real devices.
   - On STN devices, query supported protocols and features rather than assuming from the model name [L2].
3. **A device record, not a model name.** Store: transport, identity string, reported version, probe results, measured round-trip time, measured max payload per notification, and a trust level. Use the record to choose timeouts and to refuse risky operations on untrusted adapters.
4. **Timeouts and retries driven by the adapter's own error vocabulary.** Map "NO DATA", "BUFFER FULL", "FC RX TIMEOUT", "BUS BUSY", "STOPPED", "UNABLE TO CONNECT", "LV RESET", "ERR94" and "UART RX OVERFLOW" to distinct recoveries, such as slowing down, shrinking filters, re-initialising, or telling the user to check ignition or wiring [L1][L2]. Treat "LV RESET" and "ERR94" as "all settings are gone, re-run the probe".
5. **Prompt-driven framing.** Never rely on one notification equalling one response. Assemble until the prompt arrives. Strip NULLs. Handle responses interleaved with unsolicited alerts such as "ACT ALERT" and "LP ALERT" [L1][L2].
6. **One in-flight command at a time per adapter**, and a write queue for BLE (Web Bluetooth and Android both need serialised GATT operations) [L30][L31].
7. **BLE discovery by behaviour, not hard-coded UUID.** After connect, list services and characteristics, pick a pair that has a notify property and a write or write-without-response property, enable notifications, send the reset command, and check for the identity string. Cache the working pair per device. This avoids relying on an unverified UUID (see open questions).
8. **MTU and chunking.** Read the negotiated write size from the platform and chunk writes to it; never assume more than 20 data bytes until negotiated [L9][L22]. Measure end-to-end throughput during the probe and set a "slow link" mode.
9. **TCP settings for WiFi dongles.** Set TCP_NODELAY, use a short connect timeout, bind to the dongle's network where the OS allows it, and support configurable address and port with a small list of known defaults (35000, 23) [L47][L49][L54].
10. **ENET path as its own driver.** UDP discovery, TCP diagnostic channel, address selection, and a per-adapter IP assumption of "unknown until discovered" [L51]. Reuse the HSFZ and DoIP layouts in the sibling document.
11. **ISO-TP in software where the adapter will not do it.** SLCAN and raw CAN adapters leave segmentation to the host [L34][L42]. Keep a small ISO-TP engine with configurable block size, STmin, padding and timeouts (including a response-pending wait for NRC 0x78) [L8][L16][L23]. On STN, prefer the chip's own flow-control pair commands when present [L2].
12. **Pluggable backends** for SocketCAN, J2534 and SLCAN, following the pattern of ecu_diagnostics [L34].
13. **A simulator.** The ELM327 emulator pattern (pseudo-terminal, TCP, scripted ECUs, fault injection, configurable timing quirks) is the right model for CI [L5]. Build an OpenDiag emulator with switchable personalities: genuine ELM, lying v1.5 clone, STN, slow BLE with MTU 23, WiFi with a delayed-ACK stall, NULL-byte injection, mid-session reset.

### What to avoid

- Trusting the version string or the model name for capability decisions [L3][L52].
- Hard-coding the CX's GATT layout, or any UUID, before it is read from a real device.
- Sending STN commands to unidentified adapters, and sending deprecated ST command names to new firmware [L2].
- Assuming CAN FD is available. Mark every consumer adapter as classic CAN until it reports otherwise [L24][L26].
- Writing flash-class or coding-class commands through an adapter whose trust level is "unknown clone". Reading is fine; destructive writes should require a probe pass. This is policy advice, not a sourced finding.
- Using more than a handful of periodic messages on STN, and ignoring "OUT OF MEMORY" [L2].
- Assuming 192.168.0.10 style defaults for WiFi ELM dongles. I found no source for that value.

### What to measure (so the next research round has data)

- Per-adapter: reset time, round-trip for a one-byte request, bytes per notification, negotiated MTU and connection interval, throughput on a long multi-frame read, drop rate over a 10-minute session.
- Per-clone: the pass or fail matrix of the capability probe, found by buying a few cheap adapters and recording results.
- Per-platform: how often BLE connects on the first try on iOS and Android, how often the phone prefers cellular over a no-internet dongle network.
- Error frequency by message type in the field, via opt-in logs.

## Open questions

1. What is the CX's service and characteristic layout, negotiated MTU and real throughput? Not found in any source read.
2. Which commands do common clones actually drop, and how does a genuine v2.1 differ in observable behaviour from a PIC18F25K80 clone claiming v1.5? Needs forum teardowns I could not search for, or hands-on tests.
3. Do Wi-Fi ELM dongles share a default IP, or is it per vendor? Only the port (35000 or 23) was found [L54].
4. What do MHD, bm3 and vLinker ENET adapters really contain (router board, microcontroller, firmware), and what is their added latency?
5. How does the ENET cable wake the car's Ethernet port (resistor or voltage on pin 8)? Unresolved in the sibling HSFZ document too.
6. How do Tactrix, Mongoose, Autel and Cardaq differ in J2534 API revision, batching and concurrency? No readable vendor documentation.
7. Does any consumer BLE adapter pass CAN FD frames? None claimed it in what I read.
8. Apple platform rules for BLE write length and local network permission, which I could not read first-hand.
9. Why do the ELM datasheet (512-byte) and the OBDLink manual (256-byte) quote different buffer sizes?
10. How reliable are K-line initialisation and timing on adapters beyond FTDI cables? K-line detail was not obtained.

## Source ledger

Rows are pages that returned readable content. Where a page was fetched twice or two URLs returned the same page, it is counted once. Failed fetches are listed in the honesty section and are not counted. "Partial" means a long document was only partly read.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| L1 | https://www.elmelectronics.com/wp-content/uploads/2016/07/ELM327DS.pdf | Vendor datasheet (partial: pp1-10, 87-90 of 94) | Command model, prompt rule, NULL byte warning, error messages, reset times, 512-byte buffer, version history through v1.3 | high |
| L2 | https://www.scantool.net/scantool/downloads/682/obdlink_frpm_f.pdf | Vendor manual (partial: pp1-6, 26-29, 49-54 of 78) | Product and chip table, ST command tables, STBR handshake, STN error messages, batching, periodic messaging caution | high |
| L3 | https://en.wikipedia.org/wiki/ELM327 | Encyclopedia | Versions to v2.3, v1.5 never released, v1.4 clone origin, clones misreport versions | medium (clone section uncited) |
| L4 | https://www.obdlink.com/products/obdlink-cx/ | Vendor product page | BLE 5.1, protocol list, power figures, BimmerCode claim, no chip or UUID info | medium |
| L5 | https://github.com/Ircama/ELM327-emulator | GitHub README (partial) | Emulator design, scenarios, AT and some ST support, P4 timer quirk, functional addresses | medium |
| L6 | https://en.wikipedia.org/wiki/SAE_J2534 | Encyclopedia stub | 2004 origin, J2534-1 05.00 as latest | low |
| L7 | https://en.wikipedia.org/wiki/CAN_FD | Encyclopedia | FD frame fields, DLC mapping, rates, CRC | medium |
| L8 | https://en.wikipedia.org/wiki/ISO_15765-2 | Encyclopedia | ISO-TP frame types, flow control, STmin, length limits | medium |
| L9 | http://punchthrough.com/maximizing-ble-throughput-part-2-use-larger-att-mtu/ | Vendor blog | ATT MTU default 23, overhead, iPhone 185 example | medium |
| L10 | https://www.obdsol.com/solutions/chips/stn2120/ | Vendor chip page | STN2120 protocols, same firmware family, MS and SW CAN | medium |
| L11 | https://www.obdsol.com/solutions/chips/stn1110/ | Vendor chip page | STN1110 discontinued, ELM327 set plus ST commands, UART to 10 Mbps | medium |
| L12 | https://www.obdsol.com/solutions/chips/stn2100/ | Vendor chip page | STN2100 vs STN1110 memory, 16-bit core, discontinued | medium |
| L13 | https://en.wikipedia.org/wiki/Bluetooth_Low_Energy | Encyclopedia (partial) | GATT structure, notifications vs indications, write without response, PHY rates | medium |
| L14 | https://github.com/brendan-w/python-OBD | GitHub README | Works with ELM327, Bluetooth connection trouble advice (README only) | low |
| L15 | https://en.wikipedia.org/wiki/OBD-II_PIDs | Encyclopedia | 7DF, 7E0 to 7EF, 0x40 offset, service list, 29-bit mention | medium |
| L16 | https://en.wikipedia.org/wiki/Unified_Diagnostic_Services | Encyclopedia | UDS services, NRC 0x78, tester present, transports | medium |
| L17 | https://www.carista.com/ | Vendor homepage | Carista is app-plus-adapter with paid tiers, brand list; no hardware internals | low for hardware |
| L18 | https://www.tactrix.com/ | Vendor homepage | Makes OpenPort J2534 interfaces and EcuFlash; no details | low |
| L19 | https://en.wikipedia.org/wiki/On-board_diagnostics | Encyclopedia (partial) | J1962 pins, protocols by region, history | medium |
| L20 | https://en.wikipedia.org/wiki/K-line | Encyclopedia stub | Almost nothing on K-line | low |
| L21 | https://github.com/uholeschak/ediabaslib | GitHub README (README only) | Adapter types: FTDI, ELM327 BT and WiFi, replacement firmware, ENET WiFi, serial Bluetooth on Android | medium |
| L22 | https://interrupt.memfault.com/blog/ble-throughput-primer | Engineering blog | Connection interval, DLE, 2M PHY, MTU, iOS 185 and 15 ms, write without response | medium-high |
| L23 | https://www.csselectronics.com/pages/uds-protocol-tutorial-unified-diagnostic-services | Vendor tutorial | UDS over CAN IDs, NRC, ISO-TP, tester present, flow control timing | medium |
| L24 | https://www.csselectronics.com/pages/can-fd-flexible-data-rate-intro | Vendor tutorial | FD vs classic, adoption, mixed-bus errors, non-ISO mode, under 5 percent claim | medium |
| L25 | https://www.csselectronics.com/pages/obd2-explained-simple-intro | Vendor tutorial | ISO 15765-4 limits, IDs for 11 and 29 bit, 50 ms flow control practice | medium |
| L26 | https://github.com/commaai/panda | GitHub README | CAN and CAN FD on STM32H725, USB host access | medium |
| L27 | https://github.com/pylessard/python-udsoncan | GitHub README | UDS client over SocketCAN ISO-TP, MIT licence | medium |
| L28 | https://en.wikipedia.org/wiki/Automotive_Ethernet | Encyclopedia | Automotive Ethernet family only; nothing on OBD pins | low for this topic |
| L29 | https://docs.kernel.org/networking/can.html | Official kernel docs | SocketCAN raw and BCM, ISO-TP module, CAN FD frame struct, 16 vs 72 byte MTU | high |
| L30 | https://developer.android.com/develop/connectivity/bluetooth/ble/transfer-ble-data | Official platform docs | Service discovery, notifications, descriptor write, async callbacks | high |
| L31 | https://developer.chrome.com/docs/capabilities/bluetooth | Official platform docs | Web Bluetooth scope, HTTPS, user gesture, BLE only, queue GATT operations | high |
| L32 | https://en.wikipedia.org/wiki/Controller_area_network | Encyclopedia (partial) | CAN bit rates, arbitration, termination, error counters, bus-off | medium |
| L33 | https://en.wikipedia.org/wiki/Bluetooth | Encyclopedia (partial) | RFCOMM and SPP serial emulation, Classic vs BLE, versions | medium |
| L34 | https://github.com/rnd-ash/ecu_diagnostics | GitHub README | Backends: J2534, SocketCAN, SLCAN, PCAN; UDS, KWP, OBD; D-PDU pending | medium |
| L35 | https://github.com/rnd-ash/OpenVehicleDiag | GitHub README | J2534-2, Macchina M2, Linux SocketCAN, a parser removed after DMCA | medium |
| L36 | https://github.com/iDoka/awesome-canbus | Curated list | Adapter categories, SLCAN, FD-capable boards, ELM clone-firmware warning, virtual J2534 over TCP | low-medium |
| L37 | https://www.bimmercode.app/ | Vendor site | Platforms, tells users to pick a supported adapter; no names on home page | low-medium |
| L38 | https://github.com/candle-usb/candleLight_fw | GitHub README | gs_usb protocol, STM32 boards, CAN FD boards not in mainline | medium |
| L39 | https://www.obdlink.com/faq/ | Vendor FAQ | CX uses BT 5.1 BLE module; MX, MX+, LX use BT 3.0; BimmerCode via OBDLink | medium |
| L40 | https://www.bimmercode.app/adapters | Vendor adapter list | Named adapters by connection type and series coverage | medium |
| L41 | https://www.bimmercode.app/faq | Vendor FAQ | Only says unlisted adapters are unsupported | low |
| L42 | https://github.com/linux-can/can-utils | GitHub README | isotpsend, isotpdump, canfdtest, slcand and SLCAN pty | medium |
| L43 | https://www.kvaser.com/can-protocol-tutorial/ | Vendor tutorial | Bit timing, arbitration, error counters, bus-off, no FD detail | medium |
| L44 | https://www.csselectronics.com/pages/j1939-explained-simple-intro-tutorial | Vendor tutorial | J1939 29-bit ID, PGN, BAM and RTS/CTS, 1785 bytes | medium |
| L45 | https://github.com/uholeschak/ediabaslib/tree/master/docs | GitHub directory listing | File names only: ENET, firmware, adapter-types docs exist | low |
| L46 | https://developer.android.com/develop/connectivity/bluetooth/ble/ble-overview | Official platform docs | GATT/ATT concepts, roles, data visible to all apps | high |
| L47 | https://developer.android.com/reference/android/net/ConnectivityManager | Official platform docs (partial) | bindProcessToNetwork, requestNetwork; nothing on no-internet networks | high |
| L48 | https://en.wikipedia.org/wiki/Transmission_Control_Protocol | Encyclopedia (partial) | Nagle wait example, TCP_NODELAY option | medium |
| L49 | https://en.wikipedia.org/wiki/Nagle%27s_algorithm | Encyclopedia | Nagle plus delayed ACK stall up to about 500 ms, TCP_NODELAY | medium |
| L50 | https://en.wikipedia.org/wiki/Hayes_command_set | Encyclopedia | AT prefix and carriage return convention | low for this topic |
| L51 | https://github.com/uholeschak/ediabaslib/blob/master/docs/ENET_WiFi_Adapter.md | Project doc | ENET WiFi adapter is an OpenWrt router board, 192.168.100.1, no longer sold, reset needs case opened | medium (one product) |
| L52 | https://github.com/uholeschak/ediabaslib/blob/master/docs/AdapterTypes.md | Project doc | Compatibility matrix: ELM327 D-CAN only, FTDI counterfeit warning, fake 1.5 warning, ENET for F-series and newer | medium |
| L53 | https://github.com/uholeschak/ediabaslib/blob/master/docs/Replacement_firmware_for_ELM327.md | Project doc | Which clone hardware exists (PIC18F25K80, BC417, ESP8266), benefits of replacement firmware | medium |
| L54 | https://github.com/uholeschak/ediabaslib/blob/master/docs/Deep_OBD_for_BMW_and_VAG.md | Project doc | Pairing, 500 kbit/s vs K-line switch, ISO-TP defaults 0, WiFi ports 23 and 35000, hotspot mode | medium |
| L55 | https://github.com/uholeschak/ediabaslib/blob/master/docs/Custom_Bluetooth_firmware.md | Project doc | Serial Bluetooth module command interface, default 115200, factory defaults, config-over-Bluetooth | low-medium (niche) |

Total pages read: 55.
