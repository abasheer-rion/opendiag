# Adapters and transport for tuning flashes (BM3, MHD, JB4, xHP)

Written 2026-11-20. Replaces an earlier partial draft (16 pages read). This version has 40 pages actually fetched and read, listed in the Source ledger as S1 to S40. Items marked **snippet-only** (tagged L1 to L8) came from search-result summaries of pages I could not open. They are leads, not evidence, and they are not in the ledger.

Limits of this run, stated up front:
- The web search budget ran out partway. Several planned searches (JB4, Reddit, iOS vs Android forum threads) never ran.
- Bimmerpost, E90Post, SpoolStreet, SupraMKV and several shop pages returned 403 or 429. **I read no first-hand forum thread on flash outcomes.** That is the largest gap, and it is why no real-world failure rate appears below.
- No reverse-engineering, proprietary data, seed-key material or circumvention steps were read or are reproduced here. Everything is at the level of "how the transport behaves".

---

## Summary

1. **No source publishes a flash success or failure rate for any adapter.** Across 40 pages (vendor docs, support wikis, reviews, standards overviews) nobody gave a percentage or a count. Any number quoted to the owner would be invented. OpenDiag has to measure this itself (S1 to S40, absence).
2. **bootmod3 recommends its own WiFi adapter on both iOS and Android, and says wired ENET works on phones and laptops.** It lists no BLE adapter for flashing (S2). The same vendor says its V3 adapter has "fastest" flash times, with no benchmark (S4, vendor claim).
3. **The OBDLink CX is a BLE (Bluetooth 5.1) coding and diagnostics adapter. No tuner's documentation I read lists it for flashing.** OBDLink says its adapters flash only through third-party apps on select vehicles and names BimmerCode, not BM3 or MHD (S18). A review states MHD and bootmod3 do not list the CX and advises against it for tune flashing (S21, single third-party source).
4. **The CX has a hard 247-byte MTU ceiling, no queued writes, and needs a response between write chunks** (S14). BLE on phones also gets roughly half of the theoretical maximum because of connection-event limits (S25). No source measured a CX flashing a BMW, so "slow" is an inference, not a finding.
5. **Wired ENET on iPhone has one documented, repeatable failure: a non-MFi Ethernet adapter.** bootmod3 says it can connect, drop about 10 seconds later, or drop mid-flash and leave the car in a failed-flash state (S2). Recovery may need an MFi adapter or a laptop.
6. **Low battery voltage is the one cause every source agrees on.** bootmod3 says charger at 20 to 50 A, never above 50 A, trickle chargers (2 to 6 A) are too weak (S1). xHP says a weak battery can fall below 11.9 V and interrupt the flash, and suggests a roughly 30 A, 13.8 V supply for long flashes (S7).
7. **Phone-side networking causes more "won't connect" cases than adapters do.** CarPlay hijacking the WiFi, mobile data fighting the adapter network, missing iOS local-network permission, Android static IPs (S2, S8, S12, S13).
8. **Other devices on the OBD port or CAN bus break flashes.** Piggyback tuners (JB4), exhaust valve controllers, OBD gauges (S1); throttle boxes, aftermarket head units (S7).
9. **Reported flash times are vendor-quoted, mostly "around 3 minutes first flash, seconds for map changes"** (S6, S5 claims about three minutes). Independent measurements were not readable (L1 to L3).
10. **bootmod3's iOS app now stops a flash immediately if the adapter agent disconnects and shows which connection type is active** (S5, version notes). That is the closest thing to a transport safety feature any source documents.

---

## What I found

### 1. Which adapters each tool actually uses

**bootmod3.** The connectivity guide gives the clearest picture (S2). Two methods:
- **WiFi:** bootmod3's own WiFi adapter, recommended for iOS/iPadOS and Android.
- **ENET cable:** supported on iOS/iPadOS, Android and laptops (Windows, macOS). Phones need an Ethernet adapter.
- Switching from WiFi to ENET is not instant. The car's network gateway has to reset. The fixes given: leave the car locked and asleep for over an hour, or disconnect the battery ground cable for 3 minutes (S2).

The App Store listing confirms the hardware names: an ENET cable connected to the iOS device, and the bootmod3 WiFi Adapter for programming, dashboard, datalogging and diagnostics. It also lists an iOS 15 minimum and a macOS 13 minimum on Apple silicon (S5). The FAQ adds that a hardware "OBD Agent" can run on multiple cars (the licence is per VIN) and that no hardware needs to stay plugged in unless app features are used (S3).

The V3 adapter announcement (March 2023) claims: no VIN locking, over-the-air firmware updates, an ultra low power mode of about 20 mA when left plugged in, and "NO ALARMS" on G-series and Supra. The cheaper V2A can trigger the alarm if left plugged in (S4). These are vendor claims.

A shop listing is older and says the adapter is optional if you use an ENET cable, and repeats "3 minutes" for a flash (S6). Another shop-listing detail: the page says 2019+ cars on November 2019 software need an OBD unlock, and cars built after June 2020 were "not flashable" at the time of that listing (S6). That listing may be out of date.

**MHD (MG Flasher).** Vendor docs say: use an ENET WiFi adapter. A traditional ENET cable is a "legacy fallback for advanced users or troubleshooting", and the vendor will not help with connectivity problems on it (S8). Required hardware: Android 7.1+, iOS 10+ or Windows 10+. For the cable path you need an Ethernet-to-USB adapter plus a matching OTG adapter (S9, S8). Any vendor's ENET WiFi adapter that supports ENET WiFi qualifies per the connection guide (S8). The MHD FAQ is more cautious and does not recommend a non-MHD adapter (S11). Same vendor, two stances; see disagreements.

Setup details from MHD's guides: an Android static IP of 169.254.250.250 with netmask 255.255.0.0 is set once for the cable path, and the device should lie flat during a cable flash because mechanical stress on the USB connection is named as a failure cause (S10). iOS needs flight mode and the local network permission (S8, S12). A reseller page adds that on iOS the MHD adapter's network is called MHD_XXXX and the connection should show a 169.254.x.x address (S13).

**xHP.** The adapter list is the most detailed (S7): DCAN WiFi adapters (THOR, xHP) for E, F, G and Supra; ENET cable and ENET WiFi for F-series; the BM3 WiFi adapter and the MHD UNI WiFi adapter for E, F, G and Supra; a K+DCAN cable for E and F. It recommends one xHP-branded adapter as the fastest and most stable (vendor self-interest). Page caveats: adapters are third-party, so behaviour varies by firmware; the MHD adapter firmware stated as correct is 3.86; WiFi can drop, so set the phone to ignore other WiFi networks and make sure nobody else is on the adapter.

**JB4.** No page I read describes how JB4 connects or flashes. It only appears as a cause of failed bootmod3 flashes when active (S1). This is an open question.

**OBDLink CX and MX+.** See section 2. Neither is named by any flasher as a flashing path.

### 2. OBDLink hardware facts

| Adapter | Radio | Notes | Source |
|---|---|---|---|
| CX | Bluetooth 5.1 BLE only, no Classic | 8 to 18 V operating, surge protection, about 55 mA running, under 1 mA in low power mode, CAN, J1939 and ISO 9141/14230 protocols | S15, S14 |
| MX+ | Bluetooth 3.0 (classic) | Physical pairing button, 128-bit link encryption, about 62 mA running, 2 mA in battery saver, 8 to 18 V | S16, S18 |
| EX | USB 2.0 | Android (OTG) and Windows, 6.5 mA, 8 to 30 V; the page warns the latest production batch "doesn't work correctly" with some computers | S17 |

Disagreements within OBDLink's own pages: the comparison page lists the CX as BLE v5.0 in one table and 5.1 in another (S20); the developer page says 5.1 (S14). Standby current is "under 1 mA" on the product page (S15) while the MX+ is 2 mA (S16). The comparison page also says the CX "is optimized for BMW vehicles" and omits J1850, MS-CAN and SW-CAN (S20).

**What OBDLink says about flashing:** its adapters flash or change ECU configuration only through supported third-party apps on select vehicles, naming AlfaOBD, BimmerCode, Carista, FORScan and MotoScan (S18). OBDLink's marketing says the CX "won't brick your ECU" (S15). That is a vendor claim about coding, not about tune flashing.

**CX BLE transport details (the most useful technical page in this set, S14):**
- Maximum MTU 247 bytes; the phone decides the actual value.
- Android default MTU is 23, leaving 20 bytes per ordinary write unless the app asks for more. iOS negotiates automatically; the page lists historical iOS maximums of 135, 158 and 185 bytes (iOS 8, 9, 10).
- No queued writes. The app must wait for each write response before the next chunk.
- Data comes back as notifications that the app must buffer.
- Bonding is only open for the first 5 minutes after power-on.
- No throughput figure is given.

**Pairing and drop causes (S19, S21):**
- The CX can take 45 to 60 seconds to appear after plugging in.
- It talks to one app at a time. Another OBD app holding it blocks the connection.
- Competing Bluetooth devices streaming from the phone cause intermittent failures.
- Location permission is needed for BLE discovery on some phones.
- A review reports a restart of the phone fixing a connection that worked once and then dropped (secondhand, via Reddit, S21).
- That review calls "not connecting" the most common negative theme and blames phone-side state, not the adapter. It found no source blaming the CX for bricking a module. Treat as one affiliate-style review (S21).

### 3. What BLE can and cannot do (physics, not CX measurements)

No source measured the CX flashing anything. These generic BLE numbers bound the problem.
- Theoretical ATT throughput: about 0.226 Mbps at the default 23-byte MTU, 0.294 Mbps at 185 bytes, 0.301 Mbps at 512 bytes (S26). Data Length Extension raises the ceiling to about 0.8 Mbps (S26).
- Realistic figures: about 90 to 100 kB/s with a phone at one end (S24). That article also says phones often cap connection event time to a fraction of the interval to share the radio with WiFi (S24). A second source says mobile throughput is "closer to half" of the graph's best case (S25).
- iOS: Apple's accessory guideline sets a minimum connection interval of 15 ms for normal accessories, and some iOS devices scale a requested 15 ms to 30 ms (S27). An iPhone SE example in one article gave about 0.10 Mbps at 185-byte MTU (S26).
- Android exposes MTU requests and connection-priority controls in its Bluetooth GATT API (S28; I confirmed those methods exist, but did not extract numbers).
- Write-with-response and indications are slower than write-without-response and notifications (S26). The CX requires acknowledged chunked writes (S14), so it sits on the slow side of that trade.

**Inference (mine, not a source claim):** with 20 to a few hundred bytes per write and a response between each, the CX's ceiling is roughly tens of kB/s at best. That is still fast enough to move a few megabytes in minutes. The bigger risk is not speed but **link loss**: a radio link that can drop silently with a half-written memory region. No evidence either way was found.

**Wired and WiFi ENET bounds.** Classic CAN carries 8 data bytes per frame (S31); ISO-TP reassembles larger messages using flow control with block size and a minimum frame gap (S30). UDS defines the services used for download: session control, security access, request download, transfer data, tester present (S29). A CAN-based flash is therefore bounded by bus speed and flow control, while an ENET flash rides on Ethernet and the ECU's own write speed becomes the limit. This matches the vendor pattern of recommending ENET adapters over DCAN. A UDS tester-present message exists to keep the session alive (S29), so a transport that stalls long enough loses the session.

### 4. Reported flash times

Vendor-quoted or snippet-only. I could not read independent measurements.

| Claim | Source | Status |
|---|---|---|
| bootmod3 calibrates the car "in just 3 minutes", map switch takes seconds | S6 (shop listing), S5 (App Store says "about three minutes") | Vendor claim, read |
| xHP F-series ENET (cable or WiFi): first flash under 2 minutes, updates under 30 seconds | search summary of xHP wiki | L1, snippet-only |
| xHP E/F first flash about 4 minutes; G-series and Supra 8 to 10 minutes | search summary of a tuner wiki | L1, snippet-only |
| Cheap ENET cable roughly doubles flash time; another user says only slightly slower (about 55 s for a small change) | forum summaries | L2, snippet-only, user opinion |
| MHD flash faster on iPhone over ENET cable than WiFi, per one Supra owner | forum summary | L3, snippet-only, opinion |

The xHP page I read in full (S7) did not show times in the visible portion, so the xHP figures remain unverified here. **No read source gave a time for a BLE adapter flashing a BMW.** The honest summary is "a few minutes for a first flash on ENET, much shorter for map changes", and that rests mainly on vendor statements.

### 5. Failure rates

None found. What exists instead:
- A bootmod3 page says a mid-flash drop on a non-MFi adapter can leave the car needing recovery (S2) but gives no frequency.
- A forum post I read describes an older Z4 (Siemens MS45.1, supercharger swap): the owner forgot the charger, voltage fell too low, the write failed, and the ECU was bricked. A cloned ECU then threw an "Irreversible ECU Error" (S38). One story, different car and tool.
- Snippet-only: a Bimmerpost user claims wipers switching off during a flash is a sign voltage dropped, and that a 10 A charger can struggle (L4). An E90Post user said a failure went away when another car's alternator held the voltage (L4). Unverified.
- Generic reprogramming trade articles say "many modules fail" from low voltage and that these failures are "largely avoidable" with a proper power supply, but give no rate (S34, S35).
- bootmod3's own app notes list "flash stops immediately if the OBD agent disconnects" as a 3.3.8 feature, which implies the dropped-link case was serious enough to engineer for (S5).

### 6. BLE vs WiFi vs wired reliability

What the sources support:
- **WiFi ENET adapter:** recommended by bootmod3 (S2), MHD (S8, S9) and listed first by xHP (S7). MHD says it avoids fragile cables and lowers drop risk (S8). Known WiFi problems: no internet on the phone while joined (S8, S2), CarPlay stealing the connection (S2, S13), another client joining the adapter (S7), crowded areas. The bootmod3 iOS app version 3.3.0 fixed "connection drops when several WiFi Adapters were nearby" at crowded events (S5).
- **Wired ENET:** supported everywhere by bootmod3 (S2). Problems: non-MFi adapters on iOS (S2), phones that do not support Ethernet over USB (S9), mechanical stress on the USB connection (S10), a static IP needed on Android (S10). On laptops, antivirus and firewalls are the main risk (S1, S2).
- **BLE (CX):** no flasher lists it. In coding use, trouble is mainly phone-side (S19, S21).
- **Classic Bluetooth (MX+):** same status as the CX. BimmerCode lists it for all series (S23). No flasher lists it.

**The ranking from evidence:** WiFi ENET adapter (vendor consensus), then wired ENET (works, more failure points), then BLE and classic Bluetooth OBD adapters (no vendor support for flashing). It is vendor opinion, not measured data, and two of the vendors sell adapters.

### 7. Battery voltage and charger practice

| Source | Guidance | Notes |
|---|---|---|
| bootmod3 (S1) | Adjustable charger set to 20 to 50 A, never above 50 A. Trickle chargers (2 to 6 A) too weak for a low battery. Drive about 20 minutes if the car sat. Jump from a running car at about 2,500 rpm in an emergency. | Also says "don't use a supply above 12 V". That conflicts with other sources; see below. |
| xHP (S7) | Weak battery can fall under 11.9 V and interrupt a flash. Roughly 30 A, 13.8 V supply on the engine-bay posts for long DCAN or K-line flashes. TCU flash cannot run with the engine running. | Single source for 11.9 V. |
| Chrysler TSB quoted on a forum (S36) | Keep voltage from dropping below 13.2 V and not above 13.5 V during a flash. A practitioner says holding that is hard when fans and solenoids switch. | Different OEM. |
| Clore, trade article (S34, S35) | Floor of 100 A capacity for a "quality" supply; example setpoint 13.7 V; ripple under 100 mV. Loads like blowers can pull 35 A or more. | Vendor of power supplies. |
| BMW voltage reference (S37) | Healthy running voltage 13.8 to 14.8 V; systems start dropping out around 11 V. | Parts-shop blog, unsourced; treat as low-medium. |
| MG Flasher procedure page (S10) | Read portion silent on chargers. | Truncated page. |

**Conflicts.** bootmod3's "never above 12 V" (S1) cannot be reconciled with 13.8 V (S7) or 13.2 to 13.5 V (S36). It may refer to a charger's lower voltage mode or be a typo. I have not resolved it; do not repeat it as a rule. The amps numbers also describe different things (capacity versus a voltage setpoint). The shared message is "use a real regulated supply, not a trickle charger".

Battery type matters: BMW fits AGM batteries from the E90 era onward and lithium (LiFePO4) in some M and G-series cars (S37). The same page says a replaced battery must be registered or charge behaviour is wrong (fault code 00E5E8). The charger section of S37 is not from a flasher vendor; check against BMW service data before relying on it.

OBDLink adapters themselves tolerate 8 to 18 V (S15, S16), so the adapter is not the voltage bottleneck; the ECU is.

### 8. Phone vs laptop, iOS vs Android

- **Laptop:** bootmod3 supports Windows and macOS with ENET (S2). On Windows, Defender, the firewall and antivirus software are the failure risk. On macOS it usually works by default (S2). Failures before about 2% progress or with a diagnostic-session error point to firewalls (S1). MHD and xHP list Windows too (S9, S7). No source compares phone and laptop reliability directly. Laptops are named as a recovery route when a phone connection drops (S2).
- **iPhone/iPad:** MFi Ethernet adapter requirement from iOS 15 (S2). Turn off Bluetooth and CarPlay (S2, S13). Local network permission (S8, S12). Flight mode, then WiFi on (S8). Keep the phone above 25% battery and disable CarPlay and Android Auto (S7).
- **Android:** mobile data drops when joined to an adapter's WiFi; download maps first (S2). Android 11+ uses Ethernet tethering for cable setups; older versions use per-app mobile data (S2). Some old devices cannot run both. Static IP set manually for cable (S10). Accept the USB peripheral prompt, or the app cannot connect (S10). Developer option "Cellular Data Always Active" is a documented trick to keep internet alive on WiFi (S12, with a warning that other developer options may break the app).
- **Both:** a dropped mobile OS app is a flash risk. The bootmod3 iOS app stops a flash if the agent disconnects (S5), but the sources do not say what happens to the ECU state in that case beyond "recovery may be needed" (S2).

### 9. Common errors and their causes

| Symptom | Named cause | Source |
|---|---|---|
| Vehicle not detected | Bluetooth/CarPlay interference, mobile data conflict, non-MFi adapter, wrong WiFi | S2 |
| Fails before about 2% or "extended diagnostic session" error | Firewall, Defender, antivirus | S1 |
| Fails partway | Piggyback tuner not in bypass or map0; exhaust valve controller; OBD gauge not in service mode | S1 |
| Fails partway | Throttle box, aftermarket head unit, CarPlay or Android Auto active | S7 |
| Drops about 10 seconds after connecting, or mid-flash | Non-MFi Ethernet adapter on iOS | S2 |
| Adapter works, then stops | Another device on the adapter's WiFi; old adapter firmware | S7 |
| Cable path has no network after WiFi use | Adapter left network settings in the car; reset by 1+ hour of sleep or 3 minutes with battery ground off | S2, S13 |
| Abort on voltage | Weak battery, small charger, loads switching on | S1, S7, S34 |
| Flash fails mid-write on a fine connection | Voltage sag; retry with the full flash and unlock option once stable | S1 |
| TCU flash fails | Engine running | S7 |
| CX will not connect | 45 to 60 s startup delay, another app, stale pairing, location permission off | S19, S21 |

BimmerCode's own guidance for coding, not flashing: engine off, ignition on; if coding fails, unplug the adapter, restart the phone, enable flight mode, disconnect Bluetooth (including iDrive) and restore from backup (S22). If the body domain controller stops responding, disconnect the 12 V battery for a few minutes, or at least 15 minutes on two-battery cars (S22).

Ignition state is covered only for coding (ignition on, engine off, S22) and for the MHD connection check (engine running or ignition on, S12). xHP says the TCU needs the engine off (S7). No page I read gives a single rule for ignition state during a DME flash.

### 10. Open-source reference points

- EdiabasLib's README (not its source) lists supported transports: FTDI USB D-CAN/K-line, ELM327 Bluetooth and WiFi with specific PIC chips and firmware, a custom Bluetooth D-CAN/K-line adapter, and ENET WiFi adapters for F-series. It says Android uses FTDI USB or Bluetooth Serial Port Profile and does not mention BLE (S39). It calls the tools "expert tools" with little support (S39).
- ELM327 clones are widespread because the v1.4 firmware could be copied (S32).
- opendbc's README shows a safety pattern worth copying: the interface stays silent on power-up until a safety mode is chosen (S40). It gives no electrical specs.
- OBD-II PIDs travel as ISO-TP frames with 8 data bytes (S33).

---

## Evidence quality and disagreements

**Quality tiers.**
- **High:** vendor technical pages describing their own behaviour (S1, S2, S7, S8, S10, S14, S19). Authoritative on what the tool expects.
- **Medium:** vendor comparisons and marketing (S4, S11, S15, S16, S21, S23), reseller how-tos (S13), a single review (S21), Wikipedia and BLE primers (S24 to S33).
- **Low:** unsourced blogs (S37), forum anecdotes (S36, S38), everything marked snippet-only.
- **Missing entirely:** first-hand flash outcome threads. I read none. I cannot say how often CX users have flashed, or whether it works.

**Disagreements.**
1. MHD: any ENET WiFi adapter works (S8) vs non-MHD adapters are not recommended (S11).
2. OBDLink CX Bluetooth version 5.0 (S20 table) vs 5.1 (S14, S15, S18).
3. bootmod3 charger "not above 12 V" (S1) vs 13.8 V (S7) vs 13.2 to 13.5 V (S36).
4. Charger size: 20 to 50 A (S1) vs about 30 A (S7) vs 100 A capacity floor (S34). Trade articles sell supplies.
5. Which connection is best: bootmod3, MHD and xHP all steer to WiFi, but a snippet-only Supra forum post prefers a cable on iPhone for stability (L3). Not reconciled.
6. Flash time: vendor 3 minutes (S5, S6) vs snippet-only 4 to 10 minutes first flash (L1). Likely chassis and map size, not verified.

**Single-source claims** (reuse with a flag): the 11.9 V figure (S7); the claim that MHD and bootmod3 do not list the CX (S21); the 10-second drop timing for non-MFi adapters (S2); the 20 mA idle draw and no-alarm claim for the V3 (S4).

---

## Implications for OpenDiag

**Build**
1. **Treat WiFi ENET (IP transport) as the first-class flashing path, wired ENET second.** All three tuners' docs point there. The transport is an ordinary socket, which keeps the code small and testable.
2. **Treat BLE and classic Bluetooth adapters (CX, MX+) as diagnostics, logging and coding transports in v1.** Block flashing on them with a plain message. No evidence supports flashing over them. Revisit only after the bench test below.
3. **A pre-flight check the app enforces.** From the cause table: battery voltage reading with a hard stop; ignition and engine state; warn about CarPlay and Android Auto; warn about losing internet on adapter WiFi and download everything first; confirm only one client is on the adapter; request local-network permission up front; detect antivirus and firewall on laptops.
4. **Voltage as a live gate during the write.** Read it before and during. Make the threshold configurable; the 11.9 V figure is single-source (S7). Do not hard-code a charger number; show the range and "use a regulated supply, not a trickle charger".
5. **Stop on link loss, refuse to continue blind.** Copy the bootmod3 3.3.8 behaviour of aborting when the agent disconnects (S5). Keep the session alive with periodic keep-alive messages (S29 describes tester present). Save progress after each block so recovery is "resume", not "start again". This part is design guidance, not drawn from a source.
6. **Adapter capability and firmware list.** S7 shows firmware level matters (MHD 3.86). Keep a known-good table with versions.
7. **BLE layer done properly for coding and logging.** Request the largest MTU, wait for write responses, buffer notifications, split writes to the negotiated size (S14). Keep connection-interval needs in mind for iOS (S27).
8. **Start silent.** Copy the opendbc pattern: the interface sends nothing until a mode is explicitly chosen (S40).

**Avoid**
- Claiming a success rate or "safe" status for any adapter. Nothing supports it.
- Quoting one charger number as truth.
- Telling users cheap ELM327 clones are fine for anything beyond read-only use (S21, S32).
- Anything that needs OEM security material. Out of scope.

**Measure** (this is where OpenDiag can beat every doc above)
- Opt-in, anonymous transport telemetry: adapter model and firmware, platform and OS version, chassis, connection type, min and average voltage, bytes per second, retries, drops, outcome. That produces the failure rates nobody publishes.
- A bench plan on the owner's gear: CX over BLE, WiFi ENET adapter, wired ENET from a laptop and a phone. Start with read-only throughput on a real DME. Compare time, retries and drops before any write.
- Log every transport error with a cause class so the table in section 9 can be rebuilt from real data.

---

## Open questions

1. How does JB4 connect and flash? Nothing read answers this.
2. What does the bootmod3 user manual say about adapters and battery? Not readable.
3. First-hand failure and success reports by adapter (Bimmerpost, E90Post, SpoolStreet, Reddit). Blocked.
4. Measured time and drop rate of a BLE adapter flashing a BMW. Nobody has published it that I could find.
5. What does bootmod3 mean by "never use a charger above 12 V" (S1)?
6. Real speed gap between ENET cable and WiFi ENET on F/G cars. Snippet-only numbers conflict.
7. Which Android phones can set the ENET static IP, and does Android 13+ break it?
8. Does the CX's acknowledged-write requirement (S14) or the radio dominate speed for large writes? Needs a lab test.
9. What happens to the ECU when bootmod3 stops a flash after an agent disconnect (S5)? Only "recovery may be needed" is documented (S2).
10. Ignition and engine state rules for a DME flash. Only coding and TCU guidance found.

---

## Unread leads (snippet-only, not counted in pages read)

| ID | Lead | Claimed in a search summary |
|---|---|---|
| L1 | xHP and tuner wikis (rbttuning pages) | First flash under 2 min on ENET, 4 min E/F, 8 to 10 min G-series, updates under 30 s; 3rd-gen 8HP unlock needs a DCAN, BM3 or MHD adapter, not the plain ENET cable |
| L2 | A forum thread on cheap ENET cables | Cheap cable about twice the flash time; another user says 55 s for a small change |
| L3 | SupraMKV posts | Cable on iPhone "more stable and quicker" than WiFi; opinion |
| L4 | Bimmerpost and E90Post threads | Wipers off during flash suggests voltage drop; 10 A charger struggles; other car's alternator fixed a failure |
| L5 | MHD adapter vendor pages | Android 11+ "Ethernet Tethering"; iPhone 15 and newer need USB-C to RJ45; Apple no longer supports non-Apple Lightning Ethernet on iOS 15+ (the last matches S2) |
| L6 | MHD FAQ via search summary | Cable problems: unreliable cables or bad OTG adapter; WiFi problems: many nearby WiFi networks |
| L7 | NHTSA service bulletin (PDF) | A failed-flash/low-battery behaviour; the PDF was binary and unreadable, so nothing used |
| L8 | bootmod3 step-by-step PDF (x-ph.com) | Unreadable compressed PDF; nothing used |

---

## Source ledger

All rows are pages I fetched and read in this run. Reliability is my judgement for this topic.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| S1 | https://bootmod3.atlassian.net/wiki/spaces/BCS/pages/572456961/bootmod3+Flash+Failure+Troubleshooting+DME+TCU+Online+Recode | Vendor support wiki | Failure causes (firewall, piggyback, gauges, battery), charger 20 to 50 A, trickle 2 to 6 A, odd 12 V line | high (one line doubtful) |
| S2 | https://checkout.bootmod3.com/blogs/news/connectivity-with-bootmod3 | Vendor blog | WiFi vs ENET, MFi requirement, non-MFi drops about 10 s, Android tethering, laptop firewall, WiFi to ENET reset | high |
| S3 | https://checkout.bootmod3.com/pages/bootmod3-faq | Vendor FAQ | OBD Agent, per-VIN licence, flash offline once map downloaded | medium |
| S4 | https://checkout.bootmod3.com/blogs/news/new-product-release-bootmod3-wireless-obdii-enet-canbus-adapter | Vendor announcement | V3 adapter claims: fastest flash, no VIN lock, OTA firmware, 20 mA idle, alarm notes | medium (marketing) |
| S5 | https://apps.apple.com/us/app/-/id1170348811 | App Store listing | Hardware names, iOS 15 min, 4.9 from about 2K ratings, version notes (flash stops on agent disconnect, WiFi crowd fix) | medium |
| S6 | https://www.ctsturbo.com/?p=224391 | Shop listing | "3 minutes" claim, ENET cable required, unlock and build-date caveats | low |
| S7 | https://xautomotive.atlassian.net/wiki/spaces/NW/pages/1712062465/xHP+-+Flash+with+3rd+Party+Adapters | Vendor wiki | Adapter matrix, 11.9 V warning, 30 A 13.8 V, 25% phone battery, CAN add-ons, firmware 3.86 (page truncated) | high |
| S8 | https://mgflasher.atlassian.net/wiki/spaces/MGFLASHER/pages/24674327 | Vendor docs | WiFi ENET recommended, cable legacy, setup, no-internet caveat | high |
| S9 | https://mgflasher.atlassian.net/wiki/spaces/MGFLASHER/pages/26837002/Required+hardware | Vendor docs | OS versions, adapters, OTG | high |
| S10 | https://mgflasher.atlassian.net/wiki/spaces/MGFLASHER/pages/25624594/Flashing+procedure | Vendor docs | Android static IP, flat surface, flight mode (truncated) | medium |
| S11 | https://mhdtuning.com/pages/faq | Vendor FAQ | Non-MHD adapter not recommended, unlock check | medium |
| S12 | https://mhd-tuning.atlassian.net/wiki/spaces/MFS2/pages/11173892/Connecting+to+Car | Vendor docs | Adapter connect steps, iOS local network, Android cellular option, airplane mode (truncated) | high |
| S13 | https://modeautoconcepts.com/pages/mhd-adapter-wifi-network-settings | Reseller how-to | MHD adapter for bootmod3, 169.254.x.x, CarPlay interference, IP reset | medium |
| S14 | https://support.obdlink.com/support/solutions/articles/43000746707-obdlink-cx-adapter-notes | Vendor developer notes | CX BLE, 247 MTU, no queued writes, Android and iOS MTU, 5-minute bonding | high |
| S15 | https://www.obdlink.com/products/obdlink-cx/ | Vendor product page | CX specs, 8 to 18 V, current draw, "won't brick" claim | medium |
| S16 | https://www.obdlink.com/products/obdlink-mxp/ | Vendor product page | MX+ Bluetooth 3.0, 62 mA, pair button | medium |
| S17 | https://www.obdlink.com/products/obdlink-ex/ | Vendor product page | EX USB, 8 to 30 V, batch warning | medium |
| S18 | https://www.obdlink.com/faq/ | Vendor FAQ | Flashing only via third-party apps, radio specs, Bluetooth versions | high |
| S19 | https://support.obdsol.com/support/solutions/articles/43000715570-troubleshoot-connection-issues | Vendor support | BLE and Bluetooth connection causes, 45 to 60 s delay | high |
| S20 | https://support.obdsol.com/support/solutions/articles/43000713351-which-obdlink-adapter-is-right-for-me- | Vendor support | Adapter comparison, CX "optimized for BMW", version inconsistency | medium |
| S21 | https://bimmertalk.com/obdlink-cx-bluetooth-5-1-obd2-adapter-for-bimmercode-review | Third-party review | CX not listed by MHD/bootmod3, disconnect causes, clones | medium (affiliate-style) |
| S22 | https://www.bimmercode.app/faq | App vendor FAQ | Coding: engine off ignition on, recovery steps, battery disconnect | high |
| S23 | https://bimmercode.app/adapters | App vendor page | CX the "Made for BimmerCode" adapter, ENET adapters F/G/I only | medium |
| S24 | https://punchthrough.com/ble-throughput-fundamentals/ | BLE engineering article | 90 to 100 kB/s with a phone, event-time limits | medium |
| S25 | https://punchthrough.com/ble-att-mtu-throughput/ | BLE engineering article | MTU, DLE numbers, mobile "closer to half" | medium |
| S26 | https://interrupt.memfault.com/blog/ble-throughput-primer | BLE engineering article | ATT throughput by MTU, iPhone SE example, write types | medium |
| S27 | https://developer.apple.com/library/archive/qa/qa1931/_index.html | Apple technical Q&A | Min 15 ms connection interval and rules | high |
| S28 | https://developer.android.com/reference/android/bluetooth/BluetoothGatt | Android API reference | requestMtu and connection-priority exist (saved output only checked for those names) | high (limited use) |
| S29 | https://en.wikipedia.org/wiki/Unified_Diagnostic_Services | Encyclopedia | UDS service roles for programming | medium |
| S30 | https://en.wikipedia.org/wiki/ISO_15765-2 | Encyclopedia | ISO-TP frames, flow control, STmin | medium |
| S31 | https://en.wikipedia.org/wiki/CAN_bus | Encyclopedia | Bit rates, 8-byte frames, FD (internal bit-rate inconsistency) | medium |
| S32 | https://en.wikipedia.org/wiki/ELM327 | Encyclopedia | Clone background | medium |
| S33 | https://en.wikipedia.org/wiki/OBD-II_PIDs | Encyclopedia | ISO-TP 8 bytes, 7DF/7E8 addressing | medium |
| S34 | https://cloreautomotive.com/?p=48408 | Power-supply vendor blog | Failure causes, 100 A floor, load examples | low-medium (sells supplies) |
| S35 | https://www.vehicleservicepros.com/training-and-resources/guest-blogs/blog/55387934/the-great-reprogramming-uh-oh-ii-how-to-recover-from-a-severe-voltage-drop | Trade article | Recovery by brand, "largely avoidable" with a supply | low-medium |
| S36 | https://diag.net/discussion/sy1ekcxytzcx48zteozx1lm432 | Forum thread | Chrysler TSB 13.2 to 13.5 V, practitioner notes | low-medium (other OEM) |
| S37 | https://europremiumparts.com/en-au/blogs/buying-guides/bmw-charging-malfunction-causes-what-it-means-and-how-to-diagnose-it | Parts-shop blog | BMW running voltage, 11 V dropout, AGM and lithium, registration | low |
| S38 | https://www.hpacademy.com/forum/general-tuning-discussion/show/2003-bmw-z4-2-5i-crank-no-start-condition/ | Forum thread | Forgotten charger bricked an ECU, clone ECU errors | low (anecdote, other car) |
| S39 | https://github.com/uholeschak/ediabaslib | GitHub README only | Supported adapters and transports, no BLE, clone note | medium |
| S40 | https://github.com/commaai/opendbc | GitHub README only | Silent-until-armed safety pattern | medium |

**Pages that failed or gave nothing usable (not counted):** bootmod3 connectivity at bootmod3.com (403, read via checkout mirror S2); bootmod3.com get-started, download (403); bootmod3 short links and wiki pages (empty); xHP and rbttuning wiki pages (redirect, empty or not found); MG Flasher requirements page via short link (empty); Bimmerpost G87, G42 and f-series threads (403); SpoolStreet threads (403); SupraMKV (403); Mode, Palenon, Harry's Euro, ES Performance, UroTuning shop pages (429 or 403); x-ph bootmod3 PDF and NHTSA bulletin PDF (binary, unreadable); PEAK-System and Novelbits URLs (404); Wikipedia DoIP (404); OBDLink MX page variants (404).

Pages read: 40.
