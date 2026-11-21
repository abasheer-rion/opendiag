# Adapter and transport constraints, per platform

Research date: 2026-11-20. Status: **PARTIAL** (see Gaps). Scope: hard limits of each way a computer or phone can reach a car (OBDLink CX over BLE, WiFi ENET to HSFZ or DoIP, WiFi and Bluetooth ELM327 clones, USB-serial, USB-CAN) on iOS, Android, macOS, Windows, Linux and in a browser. This note builds on `docs/research/deep/adapter-hardware-and-protocol-teardown.md` and `docs/research/deep/bmw-enet-hsfz-wire-protocol.md` and does not repeat their chip and wire-format detail. Confidence tags: **high** = vendor or platform-owner primary page read in this run; **medium** = one primary page plus partial corroboration, or a primary page read through a summariser; **low** = forum, mailing list, single anecdote or inference.

## Executive summary

1. **The OBDLink CX is fine on iOS, Android, macOS, Windows and Linux, and in Chrome-family browsers.** It is BLE only, so it needs no Apple accessory licence and no classic-Bluetooth stack. Its published limits are: one custom serial-style service, max MTU 247, no queued writes, and bonding only for 5 minutes after power-on [OBDLink CX notes, high].
2. **A pure browser app cannot do WiFi ENET.** Browsers expose no raw TCP socket. HSFZ is raw TCP on 6801 and DoIP is raw TCP/UDP on 13400. The only raw-socket API (Direct Sockets) is limited to Isolated Web Apps [Chrome docs, high]. A claim that it ships to end users on ChromeOS only is **UNVERIFIED** (the Chrome page does not say it and the blink-dev link cited for it was checked and is a different thread). Browser plus ENET needs a local helper program.
3. **iOS cannot use classic-Bluetooth ELM327 clones, and cannot use plain USB-serial cables.** Classic serial needs Apple's accessory licence. Generic FTDI-style cables work on iPad only through a custom driver, not on iPhone [Apple forum and DTS answers, medium].
4. **Safari and Firefox mobile have no Web Bluetooth, Safari has no Web Serial or WebUSB.** On iOS every browser uses Apple's engine, so "browser app" on an iPhone means no direct adapter access at all [caniuse and WebKit position reports, medium].
5. **iOS WiFi dongles work but are flaky.** Apple requires a one-time Local Network permission for any TCP connection to a local address. The phone also likes to leave a "no internet" WiFi. Both are documented failure causes [Apple TN3179 high, Car Scanner troubleshooting low-medium].
6. **Android has two traps the CX hits.** From Android 14 the first MTU request is sent as 517 and later requests are ignored; CX max is 247 [Android docs, high]. Android also routes traffic away from WiFi with no internet unless the app binds to that network [Android docs, medium].
7. **USB-CAN is a desktop story.** Linux is native (SocketCAN), Windows and macOS work through user-space drivers, phones are poor [medium].
8. **Decision input:** native mobile apps (iOS and Android) plus a desktop shell cover every adapter the owner holds. A browser build is a demo or BLE-only tier. Writes and ENET belong in native or desktop.

---

## 0. How this was done

- Tools worked this run: web search and page fetch. About 30 searches and fetches. Several pages came back only as titles or timed out; those are named in Gaps and nothing from them is used as fact.
- Fully read primary pages: OBDLink CX adapter notes (vendor), Apple TN3179 local network privacy (full text), Android Bluetooth permissions, Android 14 behaviour changes, Android WifiNetworkSpecifier guide, Chrome Web Bluetooth guide, Chrome Direct Sockets doc, Chrome LNA blog, MDN Web Serial, Chrome Web Serial, Chrome serial-over-Bluetooth blog, bleak platform docs, caniuse pages.
- Read through search summaries only (treated as medium or low): Apple developer forum threads on throughput, MFi and DriverKit; blink-dev intents; W3C Web Bluetooth issue 383; candleLight and gs_usb project pages; Windows GattSession docs; Electron device docs.
- No leaked or pirated OEM material was opened. Nothing about seed-key or unlocks was searched.

---

## 1. OBDLink CX over BLE

### 1.1 What the vendor documents (high)

Source: OBDLink "OBDLink CX adapter notes" support article.

| Item | Value | Notes |
|---|---|---|
| Device Information service | UUID 0x180A | Manufacturer name, model number, firmware revision (STN chip firmware, example given 5.6.19), software revision (Bluetooth modem firmware, example 1.1.3) |
| Serial-style service | 0xFFF0 | Custom UART. This is the data path |
| Notify characteristic | 0xFFF1 | Adapter to host. Incoming bytes |
| Write characteristic | 0xFFF2 | Host to adapter. Supports Write and Write Without Response |
| Internal service | 0xFEF5 | Reserved. Do not touch |
| Max MTU | 247 bytes | Host must negotiate. Writes bigger than the live MTU fail unless chunked |
| Queued writes | Not supported | Do not use prepared or queued write |
| Bonding | Open only for first 5 minutes after power-on | Vendor line. Outside the window a new bond is not accepted |
| Legacy PIN | 123456 | For older BLE pairing modes. Built-in BLE encryption is always used |
| Pairing trigger | Subscribe to FFF1 or write to FFF2 | After scan, connect, discover services |
| Radio | Bluetooth LE 5.1 only, no classic Bluetooth | |
| Buses | HS-CAN on pins 6 and 14, ISO/KWP on 7 and 15 | Same as the earlier teardown |
| Power | 55 mA running, under 2 mA sleep (this page) | An earlier page in the earlier teardown said under 1 mA; vendor pages disagree |
| Firmware | "Free lifetime updates" claim | NOT found on the notes page in the second check; treat as UNVERIFIED (may come from another vendor page) |

**Host-side rules the vendor spells out** (high):
- Write one chunk at a time and wait for the write response before the next. The adapter pushes data by notification, so the host should queue incoming bytes in a thread-safe buffer.
- Android default MTU is 23 with 3 bytes of overhead, so 20 usable bytes for a write-with-response, and the page says write-without-response has 12 bytes of overhead (that figure is the vendor's; it is not the usual 3-byte ATT header, so treat the number as unexplained). To raise the MTU request 512 and read the result in the callback.
- iOS has no default MTU API. It negotiates automatically to the highest both sides support. The page lists historical caps of 135 (iOS 8), 158 (iOS 9) and 185 (iOS 10). The claim that it warns iOS may report 512 for some "maximum length" properties was not confirmed on re-read (UNVERIFIED); the page does say to read the write-without-response length from the peripheral on iOS 9 and later.

### 1.2 What this means for software

- **Use the live write length, not a constant.** On iOS read the write length reported for the chosen write type after connect. On Android read the value in the MTU-changed callback. On Windows read the session PDU size.
- **Reassemble by prompt, not by notification.** Replies arrive as many notifications. The earlier teardown already records this.
- **Do not hard-code FFF0/FFF1/FFF2 for non-CX adapters.** Other ELM-style BLE dongles use different UUIDs. Search results show a 0xFFF0 convention in some hobby code but also adapters with a different vendor service (an E7810A71-prefixed service on one Vgate model, from a single Stack Overflow question; low). Rule: match on UUID list, fall back to "any service with one notify and one write characteristic", and let the user pick.
- **Bonding window is a UX constraint.** The first-time flow must say "power the adapter, then pair within 5 minutes". After the window, power-cycle (unplug and replug into the car) before pairing again. The vendor page does not say what happens to an already-bonded phone after the window; reports of re-connection working are not verified here (low).
- **Chunking for the largest message.** UDS payload over ISO-TP segments is handled inside the STN chip once the STN ISO-TP commands are used, so the BLE write size limits the length of one text command, not the diagnostic message. A command line is short. The MTU limit matters mostly for batched commands and for receiving long multi-frame replies as hex text.

### 1.3 Throughput ceiling (medium)

| Fact | Value | Source / confidence |
|---|---|---|
| Interval seen in the one thread | A test peripheral that accepted only 15 ms (min and max both 15 ms) ended up at 15 ms; iOS first tried 30 ms and the peripheral refused. The thread does **not** say 15 ms is the shortest iOS allows (an earlier draft of this note claimed a "15 ms floor"; that was unsupported) | Apple forum thread 770717, read (medium) |
| Who controls the connection interval | iOS (the central) decides; the peripheral can only request. DTS says the app cannot influence it by code or user action. DTS also warned iOS may return different parameters depending on device load | Apple DTS, same thread (medium-high) |
| Example measured iOS throughput | About 400 to 600 kbit/s on several iPhones and an M3 MacBook (iOS 16 to 18), against 1000 to 1200 kbit/s on Android, Windows and one 2022 pre-iOS-16 iPhone video; 251-byte packets, 2M PHY, MTU 244 | Single thread, one developer (low-medium) |
| DTS rule of thumb | Roughly 600 kbit/s is "not a bad number" when only MTU, interval and PHY are set (no extended data length, no L2CAP channels). The thread later confirmed extended data length was in use; DTS had estimated that a 512-byte write in one interval should give about 3 times normal throughput, but the developer still measured 400 to 600 kbit/s, so the 3x figure did not show up in practice. The thread does not name write-without-response in that rule | Apple forum (medium) |

What it means for OpenDiag: BLE radio speed (hundreds of kbit/s) is far above what an ELM-style text protocol needs. The earlier teardown found the real limits are the adapter's own waiting and ISO-TP pacing, not radio. So the CX is fine for diagnostics and coding. For any future large transfer the CX adds a second ceiling after ISO-TP: **hex text doubles the byte count** (each byte becomes two characters plus spaces unless spaces are turned off), which halves useful throughput. This doubling is arithmetic from the text protocol, not a measured number (low).

### 1.4 STN command set (what to rely on)

Covered in the earlier teardown (STN family, ST commands, batching, errors). The one new point: the CX reports its **firmware revision in the standard Device Information service** [high]. So a client can read the STN firmware version over GATT before it sends any command, and gate ST commands by version. Command names differ across firmware versions (old names deprecated), per the OBDLink programming manual as summarised in the earlier note.

### 1.5 CX per platform

| Platform | Verdict | Why |
|---|---|---|
| iOS | **Fine** | Core Bluetooth BLE needs no accessory licence. MTU auto. Interval set by iOS, not the app. Foreground use is the safe case; background behaviour not researched |
| Android 12+ | **Fine, with caveats** | Needs Nearby devices permission (BLUETOOTH_SCAN, BLUETOOTH_CONNECT). Android 14 MTU rule below |
| Android 11 and lower | **Fine, with caveats** | Needs location permission for scanning |
| macOS | **Fine** | Core Bluetooth. App bundle needs the Bluetooth usage string (crash without it is likely but unverified). Dev runs from a terminal probably need Terminal granted Bluetooth (low; not on the bleak page) |
| Windows 10/11 | **Fine** | WinRT BLE. MTU is chosen by the OS and cannot be set. Not tested by this run on a real adapter |
| Linux | **Fine, flakier** | BlueZ. Stuck scan state and GATT cache issues documented in bleak docs. Needs a BlueZ new enough |
| Chrome / Edge desktop, Chrome Android | **Fine in principle** | Web Bluetooth. No API for MTU. FFF0 not known to be blocklisted (not verified; blocklist page not read) |
| Safari, Firefox, any iOS browser | **Impossible** | No Web Bluetooth |

---

## 2. Bluetooth platform rules that decide the app shell

### 2.1 Android (high unless marked)

- **Android 12 and up (target 31+):** declare BLUETOOTH_SCAN to find devices and BLUETOOTH_CONNECT to talk to them. They are runtime permissions, shown to the user as "Nearby devices". Set the old BLUETOOTH and BLUETOOTH_ADMIN permissions to maxSdkVersion 30. If the app never derives location from scans, mark the scan permission with the never-for-location flag. The docs warn that this flag filters some beacons out of scan results, which is irrelevant for finding a named adapter [Android Bluetooth permissions page].
- **Android 11 and lower:** location (fine) is required to scan because scans can reveal location [same page].
- **Companion Device Manager (Android 8+):** lets the system show the pairing UI and scan on the app's behalf without a location permission [same page]. This is the lowest-friction path for "pick your adapter" and is a design option, not a requirement.
- **Android 14 MTU change:** the stack now sends 517 as the MTU request the first time any client on that connection calls the MTU request API, and ignores later requests on that link. The final value is the smaller of 517 and what the peripheral answers, so a peripheral that mishandles the exchange can break [Android 14 behaviour page, high]. For the CX the page says max is 247, so a correct peripheral answers with 247. A Nordic forum thread reports a different peripheral failing on Android 14 because it did not handle 517 (single report, low). **Rule: after connect, read the negotiated MTU and cap every write at that value minus the 3-byte header; never assume what you asked for.** Google's page gives the same advice with a 5-byte allowance (min(supported, 517) minus 5) in its example.
- **Background and foreground service rules** for long logging sessions: not researched this run. Gap.

### 2.2 iOS (medium)

- Core Bluetooth is BLE only for ordinary apps. Classic serial (SPP) is not available. Apple staff say the way to talk to a classic accessory is the licensed accessory framework (MFi) [Apple developer forum threads, medium]. The same sources say BLE-only accessories do not need the licence.
- Practical consequence stated by the Car Scanner developer: cheap classic-Bluetooth ELM327 clones do not work with iPhones, and licensed classic adapters are rare. The OBDLink MX+ is named as a licensed classic device that works on iOS (low-medium, forum summary).
- Connection interval is chosen by iOS; the accessory can request values and the app cannot (see 1.3). Apps cannot raise throughput by asking.
- Local-network, USB and background rules are in later sections.
- `maximumWriteValueLength(for:)` returns the largest single write for a write type and can differ between with-response and without-response. The Apple page itself loaded as a title only; the description is general knowledge and an Apple mailing-list reply that ties the 247 MTU to the without-response value (low-medium). Read it after connect.

### 2.3 macOS (medium)

- Core Bluetooth. A bundled app must set the Bluetooth "always" usage description in Info.plist [bleak docs, medium]. That the process is killed without it is general platform knowledge, not stated on the bleak page (low). If the user refused the permission, every access raises a "not available" error and the app cannot re-ask; the user must change it in System Settings [bleak macOS docs, medium].
- Unbundled dev binaries inherit the parent app's permission. Reports (a Qt bug, a Claude Code issue, btleplug docs) say a spawned helper may be killed even if its own plist has the key; the terminal or parent app must hold the permission (low-medium).
- macOS does not expose the Bluetooth address of a peripheral. Apps get a per-Mac UUID that is only valid on the Mac that scanned it, so "remember this adapter by address" must store that UUID per machine [bleak docs, medium].
- Pairing: macOS shows its own pairing prompt the first time a protected characteristic is touched; it can block for a long time, so use long timeouts [bleak docs, medium]. For the CX, which asks to bond on first subscribe or write, expect this prompt.
- Services are cached by the OS; behaviour after a firmware change was not examined by the library docs (medium). Relevant when a CX firmware update changes services.

### 2.4 Windows (medium)

- WinRT BLE API. The MTU is owned by the OS. The docs say apps can read it (PDU size and a change event) but cannot set it; large writes are fragmented by the OS [Microsoft GattSession docs via search, medium]. A W3C thread says Windows raises MTU itself to 255 (low).
- Unpaired BLE connection is supported since the 2017 Creators Update announcement; whether MTU or pairing prompts differ for unpaired links was not verified.
- Threading: a library note says setting the main thread to a single-threaded apartment can stop async BLE calls from completing in a console app [bleak docs, medium]. For a GUI shell this is a known class of bug to test.
- Web Bluetooth on Windows needs Chrome 70+ or Edge per Chrome's guide (medium).

### 2.5 Linux (medium)

- BlueZ. Documented failure modes: scan "in progress" stuck state, fixed in a later BlueZ; stale GATT cache after a peripheral changes its services (remove the device, and before BlueZ 5.62 delete the cache folder by hand); Wi-Fi and Bluetooth sharing one radio on a Raspberry Pi giving intermittent disconnects, cured by a USB Bluetooth dongle [bleak troubleshooting, medium].
- Web Bluetooth on Linux needs an experimental flag per the Chrome guide (medium, guide is old; current state not re-checked).

### 2.6 Cross-platform BLE library facts (medium)

- btleplug (Rust) supports Windows 10, macOS and iOS, Linux and Android, host/central role only, no Bluetooth Classic. Android needs a hybrid Rust and Java setup. Its maintainers state they do not support Tauri issues and point to a community plugin [btleplug docs, medium]. A changelog line adds connection-parameter reading and requesting for Windows and Android only (inference from one line, low).
- Implication: a Rust core with one BLE crate covers desktop. Mobile needs native BLE per platform or a bridge layer. The choice of shell (see section 9) decides this.

---

## 3. Bluetooth Classic and WiFi ELM327 clones

### 3.1 Classic Bluetooth (SPP) clones

| Platform | Verdict | Basis |
|---|---|---|
| iOS | **Impossible** for unlicensed classic adapters | Apple forum answers: classic serial needs the accessory licence (medium) |
| Android | **Fine** | Standard RFCOMM socket. Needs the Nearby devices permission on 12+. Pairing is a system step (PIN 1234 or 0000 is folklore, not sourced here) |
| Windows | **Fine** | Paired adapter shows up as a COM port (general knowledge, not sourced in this run, low) |
| macOS | **Fine** | Paired adapter shows up as a serial device node (general knowledge, low) |
| Linux | **Fine, fiddly** | rfcomm binding. Not sourced here (low) |
| Chrome desktop | **Fine for already-paired adapters** | Web Serial over RFCOMM shipped on desktop in Chrome 117. The blog describes it for paired Bluetooth Classic devices (it does not spell out that unpaired ones are excluded). The standard serial profile is allowed, custom RFCOMM service IDs can be allowed by the page, and other services under the Bluetooth SIG base UUID are blocked [Chrome blog, high] |
| Chrome Android | **Likely fine for paired adapters** | Intent to ship targeted Android 137 for serial over Bluetooth; connect and disconnect events not fully supported on Android [blink-dev, medium] |
| Safari, Firefox | **Impossible** | No Web Serial in Safari. Firefox Web Serial exists in recent desktop builds per caniuse but its Bluetooth behaviour was not verified (low) |

Quality note from earlier research (not re-verified): fake "v1.5" ELM327 units are common and some are not fully ELM compatible. BMW ELM327 use is limited to D-CAN cars from about 2007 on, per an EdiabasLib compatibility page cited in the earlier teardown (single source).

### 3.2 WiFi ELM327 dongles (TCP bridge)

Facts and limits:

- **Connection model:** the dongle is its own access point; the phone joins it, then opens a TCP socket to a fixed address and port. Car Scanner's iOS guide gives 192.168.0.10 and port 35000 as the usual defaults [vendor troubleshooting page, low-medium]. The earlier teardown found a second convention (192.168.4.1 on port 23). So defaults vary per dongle. Software must let the user enter address and port and must try the known pairs.
- **One client at a time.** Car Scanner says only one app or one phone can talk to the adapter at once, and other OBD apps must be closed [same page, low-medium].
- **TCP_NODELAY.** Small request/reply traffic suffers from Nagle plus delayed acknowledgment; set the no-delay option on every adapter socket (earlier teardown, from a networking source).

| Platform | Verdict | Details |
|---|---|---|
| iOS | **Flaky but works** | Local Network permission prompt on first TCP connect (certain, TN3179). iOS may show "no internet" and drift to another network or cellular (Car Scanner; Apple forum threads for the joining API, low-medium). Static IP set in iOS WiFi settings is the vendor workaround |
| Android | **Works with the right code** | Android steers traffic away from a WiFi network without internet. The app must request that network and bind its socket or process to it (Android docs on network binding, medium). Quality varies by device and OS version (one developer report, low) |
| macOS | **Fine** | Join dongle WiFi, open socket. Local network permission applies to app bundles from macOS 15, not to Terminal-launched tools (TN3179, high) |
| Windows | **Fine** | Windows may flag "no internet" but keeps the connection (not sourced, low) |
| Linux | **Fine** | NetworkManager may need the connection set to never route default (not sourced, low) |
| Browser | **Impossible directly** | No raw TCP. A page could only reach the dongle through HTTP or WebSocket on a bridge, and dongles do not speak either |

### 3.3 Joining the dongle's WiFi programmatically

- **iOS:** the only supported way to join a given WiFi network from an app is the hotspot-configuration API, gated by one entitlement. Apple DTS says switching WiFi configuration always requires user approval, and the only latitude is the "join once" flag. User denial returns error code 7. There is no API to configure Personal Hotspot. For networks with no internet, reports are mixed: one says a persistent configuration does not work for no-internet hotspots, another (iOS 26 thread) says with join-once the phone usually stays on the internet WiFi and never joins, another says the phone leaves the accessory network for a saved one mid-session. No official Apple statement resolves it [Apple forum threads, low-medium]. **Treat "app joins the dongle automatically on iOS" as unproven; test on hardware before promising it.**
- **Android 10+:** the network-specifier request API shows a system dialog; once approved for that exact network, later requests skip the dialog. A pattern-based request always re-prompts. The connection made this way does not give the app or the phone internet access [Android docs, high]. That "local only" property is exactly what a dongle needs.
- **Desktop:** the user joins in system settings; nothing to build.

---

## 4. WiFi ENET to a BMW (HSFZ and DoIP)

Wire formats are in the sibling HSFZ document. This section is only about what each platform allows.

### 4.1 Facts used (all from earlier notes or this run)

| Fact | Value | Confidence |
|---|---|---|
| HSFZ transport | TCP 6801 (earlier note: four sources agree on framing) | high-medium |
| HSFZ discovery channel | UDP 6811, request and reply bytes unknown | low (earlier note) |
| DoIP | UDP 13400 for identification (request types 0x0001 to 0x0003, announcement 0x0004), then TCP 13400 with a routing-activation request (0x0005) and response (0x0006) | medium (Scapy docs via search, one Turkish guide that disagrees was rejected) |
| DoIP identification target | Tester sends the request to the broadcast address on 13400 or to a known address; a VIN-specific request is answered only by the matching vehicle | medium |
| DoIP with TLS | Newer revision adds TLS on 3496 | low (one guide) |
| Address style on a direct cable | Link-local 169.254.x.x (earlier notes, low-medium); WiFi ENET adapter products use their own router-style ranges such as 192.168.100.1 (earlier teardown) | low-medium |

### 4.2 Platform rules that apply to ENET traffic

**iOS and iPadOS (Apple TN3179, high):**
- A local network is any IP network on a broadcast-capable interface (WiFi, Ethernet; not cellular or VPN). Outgoing TCP connections, UDP unicast, UDP connect, and all multicast and broadcast sends or receives to local addresses need the Local Network permission. The check sits deep in the network stack, so every networking API is covered, including sockets, Network framework and URLSession.
- The app needs the Info.plist usage string. If it uses multicast or broadcast it also needs the multicast entitlement, which is a restricted capability Apple grants on request (the note says to sign with it; whether Apple approves every request was not researched). **DoIP vehicle discovery by broadcast and any HSFZ UDP discovery by broadcast therefore needs that entitlement on iOS. Unicast to a known IP does not.**
- If the user has not answered yet, the first operation can be denied immediately; use APIs that wait for connectivity or retry. A denied TCP connection waits with an unsatisfied reason "local network denied" and retries on its own if the user later allows it. If the user revokes access, the open TCP connection closes.
- Background apps with undetermined permission are denied without a prompt (not found in the second read of TN3179; UNVERIFIED).
- Simulator does not implement the permission; real device testing is mandatory.
- Do not assume the WiFi interface is named en0; with a USB Ethernet adapter the car link is a different interface. Run discovery on all broadcast-capable interfaces.
- Web content in the system web view or Safari is exempt from the permission. That is relevant to "page served locally" ideas but not to raw TCP.
- Link-local 169.254 addresses: the note defines local network by interface, and the iOS rules list no address-range exemption, so a car-side 169.254 address counts as local (inference from the definition, medium).

**macOS (TN3179, high):** the permission was introduced in macOS 15. Programs started by launchd as daemons, programs running as root, and command-line tools run from Terminal or ssh (with their children) are allowed automatically; bundled apps and agents are blocked until the user allows. Two user defaults let an administrator mark networks such as 169.254.0.0/16 as not local for every program; they need sudo and a restart (the "macOS 15.5" version tag and the "per user account" and "ad hoc signing is unreliable" statements were not confirmed on the second read; UNVERIFIED, treat signing advice as a precaution only). macOS 15.1 fixed several local-network bugs, so retest on 15.1 or later. The multicast entitlement is an iOS requirement; the page says it is not required on macOS. **A desktop shell on macOS needs a signed bundle, a usage string, and a first-run permission screen for ENET and WiFi dongles.**

**Android:** no local-network permission for ordinary sockets in the pages read (not stated either way; gap). The WiFi-without-internet routing issue (section 3.3) applies to WiFi ENET adapters too. USB Ethernet adapters on Android depend on the phone's kernel having the chip driver; one forum case shows the driver binding but no automatic address assigned (low). **Do not promise wired ENET on Android.**

**Windows and Linux:** no per-app local network permission found in this run. Firewall prompts and "unidentified network" classification are known behaviours but were not sourced here (low).

**Browser (Chrome family):**
- Chrome 142 (the blog says the prompt is launching in 142; a release date of Oct 28 2025 came from search summaries and is unverified) asks the user before a public website sends requests to local-network or loopback addresses. It covers fetch, subresources and subframe navigation. The blog says that at the Chrome 138 opt-in stage WebSocket, WebTransport and WebRTC were not yet gated; that they will be gated later is an inference, not stated (UNVERIFIED). In Chrome 145 the permission was reportedly split into loopback and local-network parts (secondary pages, medium-low). Only secure contexts can ask. Local requests by private IP literal or .local name are exempt from mixed-content blocking, so an HTTPS page can call an HTTP device [Chrome LNA blog, high for the 138 to 142 state].
- This governs HTTP-style requests only. **No browser API opens raw TCP or UDP to a car.**
- Direct Sockets (TCP and UDP sockets, multicast with extra policy keys) exists only for Isolated Web Apps with a strict policy. The Chrome page names the policy keys (direct-sockets, cross-origin-isolated, and direct-sockets-multicast for multicast); the page does state that without the direct-sockets key the socket constructors reject with NotAllowedError (high, re-read in the second fact-check pass). A claimed June 2026 notice about shipping on ChromeOS 151 and IWAs being enterprise-only is **UNVERIFIED**: the Chrome page says neither, and the blink-dev thread cited earlier turned out to be the serial-over-Bluetooth-on-Android intent. Treat end-user availability as unknown.
- **Verdict: WiFi ENET from a browser is impossible without a local helper process (for example a small program on 127.0.0.1 speaking WebSocket), and that helper would trigger the loopback permission.**

### 4.3 ENET verdict per platform

| Platform | WiFi ENET adapter | Wired ENET (USB Ethernet plus cable) |
|---|---|---|
| iOS | **Flaky.** Works with permission and manual joining; auto-join unproven | **Flaky.** Works with a supported Ethernet adapter. A bootmod3 page (earlier note) says a non-licensed adapter can drop mid-flash. Not re-verified |
| Android | **Fine with network binding** | **Risky.** Depends on phone kernel driver and IP setup |
| macOS | **Fine** (signed app plus permission) | **Fine** |
| Windows | **Fine** | **Fine** |
| Linux | **Fine** | **Fine** |
| Browser | **Impossible** | **Impossible** |

### 4.4 What a capture still has to settle

Unchanged from earlier notes: HSFZ discovery bytes, length semantics, acknowledge, keepalive and which chassis speak HSFZ versus DoIP. None of the new sources add wire detail. The owner's capture is still the only way.

---

## 5. USB-serial (K+DCAN and FTDI-style cables, ELM USB)

Earlier note: FTDI-based INPA-compatible cables serve BMW-DS2 and BMW-FAST on older cars and D-CAN on ENET-era models; counterfeit FT232R chips cause problems (EdiabasLib, single source).

| Platform | Verdict | Reason |
|---|---|---|
| iPhone | **Impossible** for generic cables | DriverKit not available on iPhone; Apple forum DTS answers say generic FTDI is not possible there (medium). The licensed-accessory route exists (a licensed USB-C serial cable that speaks the accessory protocol) but is a specific hardware product, not a generic cable |
| iPad | **Possible only with a custom driver** | Apple lists the USB driver framework for iPadOS; DTS called it substantial work and prefers a serial adapter plus the licensed route (medium) |
| Android | **Fine with host support** | Android is a USB host on most phones; apps use a user-space serial library. Chrome's Web Serial page says USB serial on Android is possible through WebUSB plus a serial polyfill, only for devices not claimed by a built-in driver (high). The page does not say Chrome lacks native USB serial there; its support section lists only desktop. Native-app USB host use is not sourced this run (medium-low) |
| macOS | **Fine** | Standard USB-serial drivers; the FTDI driver is built in or easy to install (not sourced here, low) |
| Windows | **Fine, with the counterfeit-chip risk** | Earlier note on counterfeit FT232R. Driver behaviour toward fakes not sourced here |
| Linux | **Fine** | Kernel serial drivers exist. Chrome's own detach allowlist names the CDC-ACM and FTDI kernel drivers, which shows Linux binds them by default [Chromium source listing, low-medium] |
| Chrome desktop | **Fine** | Web Serial since Chrome 89 on ChromeOS, Linux, macOS and Windows; user picks the port; permission remembered; buffer size option must be under 16 MB [Chrome docs, high] |
| Chrome Android | **Partial** | Chrome's page says USB serial on Android is possible via WebUSB plus a serial polyfill (only for devices no built-in driver has claimed); the page lists only desktop for the native API. A newer caniuse reading says Chrome Android supports Web Serial in version 157 (probably the Bluetooth path; unverified for USB). A blink-dev note says the policy for allowing USB serial on Android comes later, after Android has system support for wired serial ports (medium) |
| Firefox desktop | **Maybe** | caniuse (read in this run) lists Firefox desktop support starting at version 151. Not verified against a Mozilla page; it contradicts older "harmful" positions. Mark low-medium |
| Safari, all iOS browsers | **Impossible** | No Web Serial; WebKit position reported as opposed (caniuse summary and a 2021 news report, medium) |

Browser permission model for serial (high): secure context only, a user gesture for the picker, the user selects one port, previous grants can be listed, and a site can forget a grant (Chrome 103+). The policy header for serial exists and also covers USB and Bluetooth devices that appear as serial ports (MDN).

WebUSB details (medium): the protected class list (audio, HID, mass storage, smart card, video, wireless controller and similar) cannot be claimed; the separate device blocklist currently holds security keys; CDC and vendor-specific classes are not on the protected list. Operating systems that already bound a kernel driver can still block a claim. An "unrestricted" variant exists only for Isolated Web Apps.

---

## 6. USB-CAN adapters

(A "USB-CAN" adapter gives raw CAN frames; ISO-TP and UDS then run in OpenDiag. This is the right path for D-CAN on BMW and for generic OBD CAN, and the wrong path for ENET-only cars.)

### 6.1 Common families (medium)

- **gs_usb / candleLight / CANable family.** Open firmware for STM32F042/F072 boards (candleLight, cantact, canable and clones, FYSETC UCAN, FalCAN). Linux mainline kernel has the matching driver and it works out of the box on distributions that package it. Recent firmware sends Windows driver-matching descriptors so Windows can use it without a manual driver. macOS support is through libusb in user space (Rust crate lists macOS; python-can lists Windows, Linux, Mac). The commonly cheap STM32F103 boards do **not** work with this firmware because that chip cannot use USB and CAN at once. Older Linux kernels (before 4.5) had a crash on device removal [candleLight firmware page, python-can docs, gs_usb crate docs].
- **CAN FD:** some candleLight boards are CAN FD capable (STM32G0B1) but the firmware readme says mainline does not support those yet (earlier note). Consumer BLE adapters like the CX are classic CAN only (earlier note).
- **J2534 pass-through (Tactrix, Mongoose, Autel, Cardaq):** Windows DLL model. Wikipedia names version 05.00 (Jan 2022) as latest (earlier teardown). Vendor pages for Tactrix and others failed to load in the earlier run and in this one none were read, so macOS and Linux availability for these devices stays unknown (gap). Open-source consumers exist (Rust ecu_diagnostics, OpenVehicleDiag) per the earlier note.
- **SLCAN-style serial CAN** (ASCII over a virtual serial port): works anywhere a serial port works; reachable through Web Serial on desktop Chrome. Not researched for throughput here.

### 6.2 Per platform

| Platform | Verdict | Notes |
|---|---|---|
| Linux | **Fine** | SocketCAN via the kernel. Classic frames 16 bytes, FD frames 72 bytes; FD needs a socket option (earlier note) |
| Windows | **Fine for gs_usb family and J2534** | J2534 DLLs are Windows-first. Zadig may be needed on older firmware |
| macOS | **Works, user-space, less polished** | libusb path. Apple silicon and notarisation of USB access not researched |
| Android | **Possible, thin** | USB host plus libusb-style library; not researched this run (gap) |
| iOS/iPadOS | **Impossible** for generic adapters | Same driver rule as serial |
| Browser | **Partial** | Web Serial for SLCAN adapters on desktop Chrome and Edge. WebUSB can claim gs_usb-style vendor interfaces on desktop and, in principle, Android (not tested or sourced for gs_usb; low). Safari impossible |

---

## 7. Browser capability matrix (all from this run unless marked)

Caniuse reading in this run; versions are as the page printed on 2026-11-20 and should be re-read before relying on them.

| API | Chrome / Edge desktop | Chrome Android | Safari macOS | Safari and all browsers on iOS | Firefox |
|---|---|---|---|---|---|
| Web Bluetooth (BLE) | Yes (Chrome 56+, Edge 79+). Windows 10 from Chrome 70; Linux flag-gated in old guide | Yes per Chrome's guide (Android 6.0+); caniuse lists only version 157 for Chrome Android, so older Android Chrome is unconfirmed | No | No (an installable extension exists, not a native feature) | No |
| Web Serial | Yes (89+) | Listed as supported in 157 (path unclear) | No | No | Desktop 151+ per caniuse (unverified); Android no |
| Serial over Bluetooth classic | Yes, paired devices, Chrome 117 | Targeted 137 | No | No | Unknown |
| WebUSB | Yes (not re-checked on caniuse this run) | Yes (not re-checked) | No | No | No |
| Raw TCP/UDP | Isolated Web Apps only; end-user availability unverified | Not available | No | No | No |
| Local network access from a public page | Chrome 142+ prompt; HTTP-style only | Same family (not verified on Android) | n/a | n/a | n/a |

Key browser rules (high from Chrome guide): HTTPS only, every device picker needs a user gesture, the user picks one device from a chooser, services not named in the filter must be listed as optional or access fails later, GATT objects die on disconnect and must be fetched again, parallel GATT operations can fail on some platforms so queue them. The Web Bluetooth spec issue on MTU says the negotiated MTU is chosen by the OS at connect on Mac, Windows and BlueZ, Android allows an app request, and no API exposes the value to pages (medium). **A web app cannot know or tune the BLE chunk size, so it must stay conservative (for example 20 bytes, or learn it by probing) or accept lower speed.** That was only established via an issue thread (medium).

Standards position (medium-low): WebKit is reported as opposed to Serial, USB and others on fingerprinting and security grounds; Mozilla has labelled WebUSB and Serial harmful in the past. Do not plan on Safari support appearing.

Enterprise or managed browsers can switch these APIs off by policy; a Palo Alto doc for a managed browser lists a Web Serial control (low, not needed beyond noting it).

---

## 8. Impossible, flaky, fine: the master table

Rows are transports. Columns are platforms. **I** = impossible, **F** = fine, **K** = flaky or conditional (reason in a footnote number), **U** = unknown from this research.

| Transport | iOS/iPadOS | Android | macOS | Windows | Linux | Browser (Chrome/Edge desktop) | Browser (iOS Safari or any iOS browser) |
|---|---|---|---|---|---|---|---|
| OBDLink CX (BLE) | F | F (a) | F (b) | F | K (c) | F (d) | I |
| Other BLE ELM clone | F (e) | F (a) (e) | F (e) | F (e) | K (c) (e) | F (d) (e) | I |
| Classic BT ELM327 | **I** (f) | F | F | F | K | F (paired only) | I |
| WiFi ELM327 clone | K (g) | K (h) | F | F | F | **I** (i) | I |
| WiFi ENET adapter (HSFZ/DoIP) | K (g) | K (h) | F (j) | F | F | **I** (i) | I |
| Wired ENET (USB Ethernet + cable) | K (k) | K (l) | F (j) | F | F | **I** (i) | I |
| USB-serial K+DCAN / ELM USB | **I** iPhone, K iPad (m) | F (n) | F | F | F | F (Web Serial) | I |
| USB-CAN (gs_usb family) | **I** | K (n) | K (o) | F | F | K (p) | I |
| J2534 pass-through | **I** | U | U | F | U | I | I |
| DoIP broadcast discovery | K (q) | U | F (j) | F | F | **I** | I |

Footnotes:
- (a) Needs Nearby devices permission on 12+ (high). Android 14 MTU rule means read the negotiated value (high).
- (b) Bundle needs the Bluetooth usage string; terminal runs need the terminal granted access (medium).
- (c) BlueZ stuck-scan and cache problems documented (medium).
- (d) Web Bluetooth. No MTU control. Chooser plus gesture each session (high).
- (e) UUIDs differ per vendor; the FFF0 convention is common but not universal (low).
- (f) Classic serial needs Apple's licensed accessory route (medium).
- (g) Local Network permission plus the "no internet" drift. Auto-join unproven (high for permission, low-medium for drift).
- (h) Must request the adapter's network and bind to it, else traffic goes to cellular (medium).
- (i) No raw sockets in browsers; only a local helper could bridge (high for the API gap).
- (j) Signed bundle and permission screen on macOS 15 and later (high).
- (k) Phone-side Ethernet adapter must be supported; non-licensed adapters dropped mid-flash per one vendor page (earlier note, low).
- (l) Depends on the phone's kernel driver and IP assignment (low).
- (m) iPad needs a custom driver; DTS would prefer a licensed serial adapter (medium).
- (n) Android USB host works for native apps (not sourced here, medium-low); in Chrome, USB serial needs WebUSB plus a polyfill per Chrome's page (high).
- (o) User-space libusb path (medium).
- (p) Needs WebUSB claim of the vendor interface; not verified (low).
- (q) Broadcast and multicast need the multicast entitlement (high from TN3179); unicast to a known address does not.

---

## 9. What this does to the app platform decision

### 9.1 Hard constraints that cannot be designed around

1. **Browser-only product cannot talk to ENET or WiFi ELM dongles.** No raw TCP. The workaround (local helper) turns it into a desktop app with a browser UI.
2. **iPhone cannot use generic USB serial, USB-CAN, J2534 or classic-Bluetooth adapters.** On iPhone the supported set is BLE adapters plus WiFi adapters (with permission) plus a possible wired Ethernet path.
3. **Safari and every iOS browser have no Bluetooth, serial or USB access.** A web-only iOS story is zero hardware.
4. **Writes** (when ever enabled): flaky links are a safety problem. The platforms where the link is least reliable (iOS WiFi dongle, Android WiFi without binding, Linux BlueZ, browser BLE with unknown chunking) should stay read-only. This is a design inference tied to decision 2 (bench writes only), not a sourced fact.

### 9.2 Option comparison

| Option | Adapters it reaches | Main risks | Verdict |
|---|---|---|---|
| Native iOS and Android apps (TypeScript with a native BLE and TCP bridge, or fully native) | CX and other BLE, WiFi dongles, WiFi ENET; Android also classic BT | Two permission models; iOS local network and auto-join; Android MTU and network binding; app-store rules | **Primary for field use** |
| Desktop app (macOS first, then Windows and Linux) in a shell that can run a native core | Everything on the master table except iPhone-only gaps | macOS permission flow; BLE library differences; signing and notarising | **Primary for coding, backup, bench work, and the owner's Mac** |
| Browser app (Chrome and Edge only) | BLE (CX), classic BT and USB serial paths via Web Serial, SLCAN; no ENET | No iOS at all; no MTU control; no raw TCP; per-session pickers | **Demo and BLE-read tier, not a core platform** |
| Browser UI plus local helper on 127.0.0.1 | Adds ENET and WiFi dongles on desktop | Helper trust and install; loopback permission prompt in Chrome; helper must be signed on macOS | Possible later; adds a moving part |

### 9.3 Recommended split (decision input, not a decision)

- **Core diagnostics library in TypeScript with transport adapters behind one interface.** The earlier plan already points this way; the matrix says the transport interface must carry: write length, connection quality, "needs network binding", "needs permission" and "unicast only" flags per adapter.
- **Ship order that matches evidence:** (1) macOS desktop with CX over BLE and ENET (the owner's own gear and the best-behaved platform); (2) Android with CX and WiFi; (3) iOS with CX and, only after hardware testing, WiFi; (4) Windows and Linux; (5) browser demo restricted to BLE.
- **Do not promise on iOS:** classic Bluetooth clones, USB cables of any generic kind, auto-joining a WiFi dongle.
- **Do not promise on Android:** wired ENET.
- **Do not promise in browsers:** anything over raw TCP, and nothing at all on Safari.

---

## 10. Test plan that would settle the flaky cells (cheap, owner hardware)

| # | Test | Settles | Needs |
|---|---|---|---|
| T1 | Enumerate the CX with a BLE scanner; record services, properties, bonded vs unbonded behaviour before and after 5 minutes | Vendor page claims (UUIDs, bonding window, first-connect behaviour) | CX, any phone, read-only |
| T2 | Log negotiated MTU and write length on an iPhone, an Android 13 phone, an Android 14+ phone, a Mac, a Windows PC | Per-platform chunk size, Android 14 behaviour with the real CX | Same |
| T3 | Time 100 identical short commands over BLE on each platform | Real round-trip cost versus WiFi dongle | Same |
| T4 | Join each WiFi dongle on iPhone with manual and automatic methods; note "no internet" drift over 30 minutes | iOS WiFi cell | One WiFi dongle |
| T5 | Android: connect with and without network binding while mobile data is on | Android WiFi cell | Same |
| T6 | macOS: run the same ENET TCP connect from a signed bundle and from Terminal | Permission behaviour | ENET cable (owner reported unsure) |
| T7 | Chrome desktop: Web Bluetooth to the CX, record maximum safe chunk by probing | Browser tier | CX |
| T8 | iPad or iPhone with a USB Ethernet adapter to the car side, only read of identification | iOS wired ENET | Adapter, car; read only (decision 2) |

All tests are read-only and respect the owner's rules (captures on the owner's own car are read-only).

---

## 11. Disagreements and oddities between sources

- **CX sleep current.** This run's vendor page says under 2 mA; the earlier note (another vendor page) says under 1 mA. Not important for design.
- **Android "write without response overhead 12 bytes" (CX page)** versus the usual 3-byte ATT header. The page's number is unexplained. Use measured write length.
- **Android MTU advice.** Google's example subtracts 5 bytes from the supported size; Android's CX note says 3 bytes overhead for a default write. Both can be safe if you take the smaller usable payload. Chosen rule: subtract 3 and verify with a loopback test.
- **Chrome Web Serial on Android.** Chrome's own page lists only desktop for the native API and points Android USB serial to WebUSB plus a polyfill (an earlier draft wrongly said the page states "no native USB serial"); caniuse says supported in 157; blink-dev says Bluetooth serial shipped in 137 while USB serial waits for system support. These are compatible if 157 means the Bluetooth path only. Unresolved for USB.
- **Web Bluetooth on Windows and Linux.** Chrome's guide says Windows 10 from Chrome 70 and Linux behind a flag; an old Electron helper package claims Windows is unsupported. Both are old. Do not rely on either; test.
- **Local Network Access timing.** Search summaries variously say launched in 142 and enforced; the Chrome blog says 142. The split into two permissions in Chrome 145 comes from secondary sources.
- **Firefox Web Serial.** caniuse lists support from 151; older sources say Mozilla opposed it. Primary Mozilla source not read.

---

## 12. Risks for the plan

| Risk | Likelihood | Effect | Mitigation |
|---|---|---|---|
| Plan assumes browser can do everything | Medium | Rework late | Fix the platform split now (section 9.3) |
| iOS WiFi dongle auto-join does not work | Medium-high | Poor first-run experience | Manual join instructions; test T4 early |
| Android 14+ MTU problem with CX | Low (vendor says 247 max and spec requires the peripheral to answer) | Failed writes | Read negotiated value; cap writes; test T2 |
| Multicast entitlement refused or slow on iOS | Unknown | No broadcast discovery on iOS | Use unicast to known IP; manual IP entry |
| macOS permission failures look like "adapter broken" | Medium | Support burden | Clear in-app permission state screen |
| Counterfeit and odd clones | High | Wrong behaviour | Capability probing (earlier note) |
| Linux BlueZ quirks | Medium | Flaky logs | Lower priority platform; document known fixes |

---

## Sources

All fetched or returned by search on 2026-11-20. "Read" means page text loaded; "summary" means a search summary of the page only.

1. OBDLink CX adapter notes (vendor support article), read. https://support.obdlink.com/support/solutions/articles/43000746707-obdlink-cx-adapter-notes
2. Apple TN3179, Understanding local network privacy, read in full. https://developer.apple.com/documentation/technotes/tn3179-understanding-local-network-privacy
3. Android: Bluetooth permissions, read. https://developer.android.com/develop/connectivity/bluetooth/bt-permissions
4. Android 14 behaviour changes (MTU 517 item), read. https://developer.android.com/about/versions/14/behavior-changes-all
5. Android: WifiNetworkSpecifier guide, read. https://developer.android.com/develop/connectivity/wifi/wifi-bootstrap
6. Chrome: Web Bluetooth, read. https://developer.chrome.com/docs/capabilities/bluetooth
7. Chrome: Web Serial, read. https://developer.chrome.com/docs/capabilities/serial
8. Chrome: serial over Bluetooth (RFCOMM), read. https://developer.chrome.com/blog/serial-over-bluetooth
9. Chrome: Local Network Access blog, read. https://developer.chrome.com/blog/local-network-access
10. Chrome: Direct Sockets for Isolated Web Apps, read. https://developer.chrome.com/docs/iwa/direct-sockets
11. blink-dev: https://groups.google.com/a/chromium.org/g/blink-dev/c/BqUGCcurReE is the "Intent to Ship: Web serial over Bluetooth on Android" thread (targets Chrome 137; checked). https://groups.google.com/a/chromium.org/g/blink-dev/c/5R0P_aYBWQI was NOT re-checked and is not relied on; the Direct Sockets ChromeOS shipping claim is UNVERIFIED.
12. MDN Web Serial API, read. https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API
13. caniuse Web Bluetooth, read. https://caniuse.com/web-bluetooth
14. caniuse Web Serial, read. https://caniuse.com/web-serial
15. The Register, Chrome 89 beta (WebKit opposition report), summary. https://www.theregister.com/2021/02/01/chrome_89_beta_brings_desktop/
16. W3C Web Bluetooth issue 383 on MTU exposure, summary. https://github.com/WebBluetoothCG/web-bluetooth/issues/383
17. Apple developer forums, Core Bluetooth throughput thread, read. https://developer.apple.com/forums/thread/770717
18. Apple developer forums, SPP and classic Bluetooth on iOS, summary. https://developer.apple.com/forums/thread/95083
19. Apple developer forums, FTDI and DriverKit on iPadOS and iPhone, summary. https://developer.apple.com/forums/thread/775578 and https://developer.apple.com/forums/thread/803273
20. Apple developer forums, hotspot configuration joining no-internet networks, summary. https://developer.apple.com/forums/thread/848895 and https://developer.apple.com/forums/thread/786689
21. Car Scanner iOS WiFi and BLE troubleshooting, summary. https://www.carscanner.info/?p=394 and https://www.carscanner.info/?p=499
22. bleak troubleshooting and macOS backend docs, read. https://bleak.readthedocs.io/en/latest/troubleshooting.html and https://bleak.readthedocs.io/en/stable/_sources/backends/macos.rst.txt
23. btleplug documentation, summary. https://docs.rs/crate/btleplug/latest
24. Microsoft GattSession.MaxPduSize docs, summary. https://learn.microsoft.com/en-us/uwp/api/windows.devices.bluetooth.genericattributeprofile.gattsession
25. Electron device access tutorial, summary. https://electronjs.org/docs/latest/tutorial/devices
26. WebUSB protected classes and Chromium detach allowlist, summary. https://github.com/WICG/webusb/blob/main/unrestricted-usb-explainer.md and https://chromium.googlesource.com/chromium/src.git/+/lkgr-android-internal/services/device/usb/usb_interface_detach_allowlist.cc
27. candleLight firmware, gs_usb crate, python-can gs_usb docs, summary. https://github.com/candle-usb/candleLight_fw , https://docs.rs/crate/gs_usb/0.1.1 , https://python-can.readthedocs.io/en/v4.3.1/interfaces/gs_usb.html
28. Scapy DoIP module docs (payload types), summary. https://scapy.readthedocs.io/en/stable/api/scapy.contrib.automotive.doip.html
29. Android ConnectivityManager and Wi-Fi device guidance, summary. https://android-developers.googleblog.com/2016/07/connecting-your-app-to-wi-fi-device.html
30. Nordic DevZone thread on Android 14 MTU 517 with a third-party peripheral, summary. https://devzone.nordicsemi.com/f/nordic-q-a/115384/android-14-enforcing-mtu-size-517-causes-ota-issues-with-ble-5-0-device-firmware
31. Earlier repo notes (not re-fetched): `docs/research/deep/adapter-hardware-and-protocol-teardown.md`, `docs/research/deep/bmw-enet-hsfz-wire-protocol.md`, `docs/research/deep/EVIDENCE.md`.

---

## Gaps (what could not be established)

1. **Real CX behaviour was not observed.** No device was connected. UUIDs, MTU, bonding window and queued-write limit are vendor statements. Whether a bonded phone reconnects after the 5-minute window is unverified. Throughput on the CX is not measured.
2. **Apple pages that loaded as titles only** (Core Bluetooth write-length API, hotspot configuration API reference). Their content is from forum threads and general knowledge.
3. **iOS background Bluetooth and WiFi behaviour** (screen lock during a long log) not researched.
4. **Android background and foreground-service rules** for long sessions not researched. Android local-network behaviour for ordinary sockets not established either way.
5. **Wired ENET on iOS and Android** only reached by forum snippets and an earlier vendor page; no tested adapter list. Whether an iPhone assigns a link-local address cleanly to a car gateway is unverified.
6. **HSFZ/DoIP discovery specifics**, chassis split, keepalive and activation-line voltage remain open (unchanged from earlier notes).
7. **Windows and Linux local network and firewall behaviour** not sourced. Windows classic-Bluetooth COM mapping and Linux rfcomm not sourced.
8. **Browser WebUSB and Web Bluetooth rows beyond Chrome desktop** were not re-read on caniuse; the Web Bluetooth GATT service blocklist page was not read, so "FFF0 is not blocked" is untested.
9. **Firefox Web Serial** support claim rests on one caniuse reading and no Mozilla page.
10. **J2534 devices** (Tactrix, Mongoose, Autel, Cardaq) on macOS, Linux and Android: no vendor page could be read.
11. **USB-CAN on Android and iOS** not researched beyond the driver rules; macOS driver notarisation and Apple-silicon issues not researched.
12. **Real-world flake rates** (how often each cell fails) are not published anywhere found; the "flaky" labels are driven by documented causes, not frequencies.
13. **App-store policy** for hardware-companion apps and for Bluetooth or local-network entitlements (multicast approval time) not researched.
14. **Direct Sockets end-user availability** (ChromeOS shipping, enterprise-only IWAs) could not be sourced; earlier text asserting it was removed or marked UNVERIFIED in the fact-check pass.
15. **Fact-check pass (2026-11-20):** 12 claims re-tested against their pages. Corrected: the iOS "15 ms floor" and "accessory controls the interval" claims, the "Chrome has no native USB serial on Android" claim, the 16 MB buffer wording, and the macOS crash-without-plist claim. Softened: Bluetooth serial "paired only", Chrome 142 date. Confirmed as stated: CX UUIDs, MTU 247, bonding 5 minutes, 55 mA, PIN, Android 14 MTU rule, Android permission rules, WifiNetworkSpecifier behaviour, caniuse Firefox 151 and Android 157 readings, TN3179 points. Pages that failed on the first fetch (TN3179 HTML) were re-read through Apple's JSON endpoint.
16. **Second fact-check pass (2026-11-20, adversarial):** 12 claims re-fetched (CX notes, Direct Sockets, Android 14 MTU, serial over Bluetooth, Local Network Access, Web Serial, TN3179, WifiNetworkSpecifier, Android Bluetooth permissions, Apple thread 770717, Web Bluetooth guide plus caniuse, blink-dev serial thread). Corrected: Direct Sockets constructor rejection is stated by Chrome; DTS "3x" figure was an estimate that did not materialise. Softened or marked UNVERIFIED: planned WebSocket gating in Local Network Access, CX "free lifetime updates", CX iOS "512" warning, TN3179 background-denial, 15.5 tag, per-user state and ad hoc signing points, Chrome Android Web Bluetooth breadth. Confirmed: CX UUIDs, MTU 247, queued writes, 5-minute bonding, PIN, BLE 5.1 only, 55 mA and under 2 mA, Android overhead 3 and 12, Android 14 MTU 517 and 5-byte advice, Chrome 117 desktop serial over Bluetooth with SIG-base blocklist, Chrome 142 prompt, mixed-content exemption, Web Serial Chrome 89 and under-16 MB buffer, forget() in 103, caniuse Firefox 151 and Android 157, TN3179 exemptions and entitlement scope, WifiNetworkSpecifier behaviour, Android permission rules, blink-dev 137 and no USB serial yet. No invented URLs found; the blink-dev link 5R0P_aYBWQI remains unchecked and unused.
17. **No forum threads were read at depth** (Bimmerpost, Reddit, Benzworld). Practitioner evidence is thin and mostly one adapter-app vendor's help pages.
