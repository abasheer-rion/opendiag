# BMW ENET / HSFZ wire protocol and vehicle discovery: public evidence review

Status: research, 2026-11-20. Branch: deep-research.

**Honesty note on volume.** The brief asked for at least 35 pages read. I read 22 pages that loaded and told us something (ledger below). The shortfall has three causes. The web search quota ran out partway through the run. Several forum and vendor pages returned 403, 410 or 429. The public record on this topic is also thin: the best material is a handful of vendor and library docs, one academic-style white paper, and one decompilation write-up. No forum thread with a raw Wireshark capture could be opened, so **no byte-level capture evidence is in this document**. Where a claim rests on one page, it is marked single-source. Numbers in square brackets such as [S3] point to the Source ledger at the end.

Search-result snippets that I did not open as pages are not used as evidence. GPL and non-commercial source code (the Wireshark dissector source, Scapy source, EdiabasLib source) was not opened; only documentation pages and READMEs were read.

---

## Summary

- HSFZ is BMW's own Ethernet diagnostic framing. It is not DoIP (ISO 13400). Four independent sources agree on the core shape: a 4-byte length, a 2-byte control word, then 1-byte source and 1-byte target addresses, then a normal UDS message [S1][S2][S3][S17].
- Diagnostic traffic goes over TCP port 6801. This is confirmed by four sources, including a security paper that found a head-unit service listening on 6801 [S1][S2][S6][S17].
- Control word 0x0001 is a diagnostic request or response. 0x0002 is an acknowledge. Two independent sources agree on both [S2][S17]. This resolves the "acknowledge frame" question at the level of the control word.
- A longer control-word list (terminal 15, vehicle ident, alive check, status inquiry, and a set of error codes) exists in only one fetched source, the Scapy docs [S2]. It is not independently confirmed.
- UDP port 6811 is used for vehicle discovery or "control". Two sources agree it exists and is used this way [S1][S6]. The byte format of the discovery request and reply could not be found in any readable public source.
- The default tester address is 0xF4. Three sources agree [S1][S2][S6]. One decompilation write-up says 0xF1, which contradicts them and is rated low reliability [S4].
- Pin 8 on the OBD connector is the Ethernet activation line. Three sources agree on that function [S5][S12][S19]. Only one says the signal is +5 V, and none gave BMW's own spec [S5].
- Which BMW models use HSFZ and which use DoIP is not settled. EdiabasLib supports both and lets you set the order [S6]. No public page I could read gives a per-model table.
- Nothing readable documents HSFZ keepalive timing or what the gateway does with an idle connection. This is the largest open gap.
- Evidence quality is mixed. Library and vendor docs are consistent with each other but are secondary. The one primary-style source with a real capture (the Black Hat paper) covers only the framing, not discovery.

---

## What I found

### 1. Framing: what an HSFZ frame looks like

**Header layout.** Four sources describe the same structure from different angles.

- Quantex, a vendor of ELM327-style firmware with HSFZ support, says the header is 6 bytes: a 4-byte length and a 2-byte control code, with addressing of 1 byte per side [S1].
- The Wireshark field reference lists a 32-bit length, a 16-bit control word, and 8-bit source, target and generic address fields [S3].
- The Scapy HSFZ class has a length field filled in automatically on build, a control field, then source and target fields [S2].
- The Black Hat 2019 paper from Keen Security Lab reverse-engineered a service on a BMW head unit. It found a 4-byte "body size" encoded big-endian, a 2-byte control type, a 1-byte source address, a 1-byte destination address, and then a standard UDS payload [S17].

**Confirmed (two or more independent sources):**
- 4-byte length, then 2-byte control word [S1][S3][S17].
- 1-byte addresses, not 2 [S1][S3][S17].
- The payload after the addresses is plain UDS (ISO 14229) [S2][S17].

**Single-source:**
- Big-endian length. Only the Black Hat paper says so [S17]. Every other source is silent on byte order. It is very likely right, since the paper captured real traffic, but it has no second source here.
- Whether the length counts the two address bytes. The Black Hat paper says the length is the size of the "body", and its body list includes the addresses, but the figure that shows the layout did not extract as text, so I could not confirm exactly what is counted [S17]. The Wireshark field reference does not say [S3]. Treat as unconfirmed until a capture is read.

**Maximum size.** Quantex documents a 4095-byte UDS message limit [S1]. That is a limit of its ELM327 firmware, not necessarily the protocol. Scapy lists a "message too large" error control word [S2], which suggests the gateway enforces some limit, but no value was found.

### 2. Control words

Scapy's documented control-word table is the only complete list I could read [S2]. I converted its decimal values to hex:

| Hex | Scapy name | Confirmed elsewhere? |
|---|---|---|
| 0x0001 | diagnostic request/response | Yes [S17] |
| 0x0002 | acknowledge transfer | Yes [S17] |
| 0x0010 | terminal 15 | No |
| 0x0011 | vehicle ident data | Partly. The decompilation write-up has 0x11 as a vehicle ID response [S4] |
| 0x0012 | alive check | No |
| 0x0013 | status data inquiry | No |
| 0x0040 to 0x0045 | incorrect tester address, incorrect control word, incorrect format, incorrect destination address, message too large, diagnostic application not ready | No |
| 0x00FF | out of memory | No |

Two other sources hint at the error codes. The Wireshark field reference has two fields called "tester address expected" and "tester address received", added in the 4.6 series [S3]. That fits with an "incorrect tester address" error that returns the address the gateway wanted. This is an inference from field names, not something any page states.

**The acknowledge frame.** Two independent sources say 0x0002 is an acknowledge [S2][S17]. The Black Hat paper calls it a flow-control type. What the acknowledge frame carries (the "expected" and "received" fields in Wireshark hint at address bytes, not a sequence number) and whether the tester must send one are not documented anywhere I could read.

### 3. Discovery on UDP 6811

**What is confirmed.**
- UDP 6811 is the discovery port in Quantex's docs, which say that when no gateway IP is set, a UDP broadcast to 6811 finds ECUs and the tool takes the IP and target address from the first reply [S1].
- EdiabasLib's config docs name 6811 as the default "control port" next to 6801 as the "diagnostic port" [S6]. The decompilation write-up agrees on both numbers [S4].
- So two independent sources give 6811 and its role as the non-diagnostic channel [S1][S6]. Calling it "discovery" is confirmed by Quantex only; EdiabasLib and the write-up say "control".

**What Quantex's tool does with replies.** It lists VIN, logical address, IP and MAC for each responder, deduplicates by logical address, keeps up to 16, connects to one, and waits 2 seconds during automatic protocol search [S1]. These are behaviours of that tool, not necessarily protocol rules. The VIN, address, IP and MAC fields hint at what a reply carries, but the byte layout is unknown.

**EdiabasLib's discovery settings.** The config docs describe how EdiabasLib finds a car [S6]:
- `auto` broadcasts to the subnet defined by a "host ident service" netmask. The default netmask is 255.255.255.255, which the docs say changed in EDIABAS 7.6.0. The docs warn it can be unreliable with several network adapters.
- `auto:all` broadcasts on every interface.
- `auto:<name>` broadcasts only on interfaces whose name starts with the given text.
- Setting an IP skips discovery.

The default netmask detail is useful. It implies the stock discovery broadcast goes to the limited broadcast address on each interface. This is an inference.

**What the decompilation write-up adds.** It lists a "vehicle ID request" and "vehicle ID response" pair (0x10 and 0x11) and a link-local address range, "typically" 169.254.x.x [S4]. The 0x10 value conflicts with Scapy, where 0x10 is "terminal 15" [S2]. See the disagreements section.

**Link-local addressing.** Two low-reliability sources agree the car side is usually in 169.254.0.0/16. The write-up says "typically" [S4]. A product-promotion article recommends a static laptop address of 169.254.100.100 with mask 255.255.0.0 when a connection fails [S21]. That is consistent with link-local use, but both are weak. Neither is BMW documentation.

**Not found.** The request bytes sent to 6811, the reply layout, and whether replies are sent to the broadcast address or directly to the sender. This was the core of the question and it stays unresolved. The next step is a controlled capture on the owner's own car, not more reading.

### 4. Tester and target addresses

- Tester (source) address default is 0xF4. Quantex [S1], Scapy's scan helper (source 244) [S2], and EdiabasLib's `EnetTesterAddress` default [S6] agree. Three sources, so confirmed as the conventional value.
- Quantex says it "usually" needs no change [S1]. EdiabasLib exposes it as a setting [S6], so some cars or tools may differ. No public source says which cars reject other values. Scapy's list has an "incorrect tester address" error [S2], so the gateway does check it.
- Target address is the ECU's logical address, one byte. Quantex defaults to 0x00 until discovery fills it in [S1]. The decompilation write-up describes 0xDF as a functional broadcast and 0x10 to 0xEF as ECU physical addresses [S4]. Single-source, low reliability.
- Scapy's `hsfz_scan` tries every target address from 0 to 255 with source 0xF4 and a 0.1 second timeout per request, and returns the ones that answer [S2]. That is a documented, non-OEM way to enumerate ECUs behind the gateway without discovery. It shows a gateway answers for addresses it routes to.
- DoIP uses two-byte addresses. The EdiabasLib defaults are tester 0x0EF3 and gateway 0x0010 [S6]. Quantex and Scapy default to tester 0x0E80 [S10][S13]. This is the DoIP side only.

### 5. Routing activation, connection setup and what a tester must do

- Quantex states that HSFZ does not need routing activation, unlike DoIP [S1]. Single-source. The Scapy docs back this indirectly: the HSFZ socket is a plain TCP stream, while the DoIP socket sends a routing activation request automatically on connect [S2][S13]. Two sources point the same way, but only one says it outright.
- Quantex's connect sequence is: discover if no IP is set, apply IP, addresses and port, open TCP [S1].
- EdiabasLib's connect timeout default is 5000 ms and additional receive timeouts are 1000 ms (standard ENET) and 2000 ms (ICOM) [S6]. These are client-side tool defaults, not gateway behaviour.

### 6. Keepalive, alive check, idle timeout

This is the weakest area.
- Scapy lists an "alive check" control word (0x0012) [S2], but the page does not explain it. No other source I could read mentions an HSFZ keepalive.
- The decompilation write-up says keepalive is not mentioned [S4]. Quantex does not cover it [S1].
- DoIP, by contrast, has a documented alive-check request and response (0x0007 and 0x0008) and a per-socket inactivity timer in the AUTOSAR spec [S18]. Do not assume HSFZ copies those values.

So we know a word called "alive check" exists in one documented list. We do not know who sends it, how often, what the body is, or what happens when it is missed.

### 7. The OBD connector: pin 8 and the activation line

**Function (confirmed).**
- The python-doipclient primer says a tester signals it wants Ethernet by applying +5 V to pin 8 [S5].
- Geotab's install guide labels pin 8 the "DoIP activator" on both OBD layouts [S12].
- A HEX forum admin on a BMW motorcycle thread says pin 8 today enables DoIP, and that older BMW documents listed pin 8 as a second K-line [S19].

Three sources agree that pin 8 is the Ethernet activation signal. Note that two of these speak of DoIP, and BMW's HSFZ cars share the same cable and pin.

**Voltage (single-source).** The +5 V figure appears only in the python-doipclient primer [S5]. Geotab gives no voltage [S12]. Do not hard-code a voltage for a hardware design from this.

**Pin layout options.** The primer lists two layouts. Option 1 is RX on pins 3 and 11, TX on 12 and 13. Option 2 is RX on pins 1 and 9, TX on 12 and 13. Both use pin 8 for activation [S5]. Geotab lists the same two layouts [S12]. Two sources agree. The primer says BMW's ENET cable "appears" to use Option 1 [S5]. That is hedged and single-source.

**Layout detection.** The primer says the tester senses resistance between pins 8 and 5 to learn the layout, gives no values, and calls the algorithm complex [S5]. Single-source.

**Not found.** The exact resistor or voltage a genuine BMW ENET cable puts on pin 8 and what the gateway needs to wake. No BMW document or forum measurement was readable. Cheap-cable folklore about a resistor between pins 8 and 16 appeared in a search snippet only, and I did not open the page, so it is **unconfirmed**.

**Consequence for the owner's adapters.** The OBDLink CX is a Bluetooth LE adapter on the CAN pins. It is not an Ethernet device. The WiFi ENET adapters sold for BMW are a different class. The EdiabasLib docs list "Deep OBD ENET" WiFi adapters as the only adapter type marked fully supported for BMW-FAST-ENET [S7], which suggests those adapters wrap the Ethernet path behind WiFi. How they present the car to a phone (a bridge at the TCP level, or a proxy) is unknown.

### 8. HSFZ versus DoIP: which cars

What the sources say:
- EdiabasLib has settings for both and an ordered protocol list (HSFZ and/or DoIP) [S6]. Its adapter page says ENET covers "F series or higher using HSFZ or DoIP" [S7].
- Scapy's overview says the latest vehicle architectures use "an Ethernet-based diagnostic protocol (DoIP, HSFZ)" via a central gateway [S15].
- A remote-programming service page lists F and G series as "DoIP / Ethernet" and never mentions HSFZ [S9]. That page is a vendor service page and low reliability. It conflicts in tone with the others rather than directly, since it just omits HSFZ.
- A cable vendor lists compatibility with F, G, U and I series from 2008, MINI, Rolls-Royce and the Toyota Supra A90/A91, with no protocol detail [S20]. The Supra listing matters for the later Toyota workstream, but it is a retail claim.
- Geotab says "all models" of BMW and Mercedes-Benz need the Ethernet bypass, and tells installers to verify DoIP on each vehicle [S12]. That supports Ethernet diagnostics being present widely. It does not say which protocol.

**Verdict.** Unconfirmed per model. The reasonable working picture, which I could not support with a per-chassis source, is HSFZ on the F-series and early G-series, and DoIP appearing on later G-series and newer platforms. The sources above only prove that both exist and that tools must support both. The design should detect at run time instead of keying off chassis codes.

### 9. Other facts that came out

- The Black Hat paper says the central gateway is a separate ZGW on older cars and is built into the body domain controller (BDC) or FEM on newer ones [S17]. The paper also says the gateway receives diagnostic requests from the head unit and telematics unit and passes them on to other ECUs, and that the E-NET is the in-vehicle Ethernet reached through the OBD connector [S17]. Single-source for the topology.
- The same paper shows the HSFZ-style framing is used by a service on the head unit itself, listening on 6801 [S17]. So 6801 is not only a gateway port. A scanner should expect more than one responder.
- The Troopers 2022 talk page lists HSFZ and DoIP among the protocols covered by the Scapy-based scanning and fuzzing work [S14]. The page has no protocol detail.
- Scapy's DoIP docs and the AUTOSAR spec describe DoIP: 8-byte header (version, inverse version, 2-byte payload type, 4-byte length), UDP and TCP port 13400, routing activation, alive check [S13][S18]. The AUTOSAR vehicle identification response is VIN (17 bytes), logical address (2), entity ID (6), group ID (6), further-action (1), status (1) [S18]. This gives OpenDiag a clean, standards-backed layout for the DoIP half of discovery.
- Wireshark's own DoIP decoding only works for protocol version 2, according to a Q&A post [S16].

---

## Evidence quality and disagreements

**Strongest sources.** The Black Hat paper [S17] is the only one in the set that describes real captured or reverse-engineered traffic, and it is a named security research team's white paper. The AUTOSAR spec [S18] is authoritative but about DoIP, not HSFZ. The EdiabasLib config docs [S6] are written by the tool's maintainer and describe real defaults.

**Vendor and library docs.** Quantex [S1], Scapy [S2][S13][S15] and the Wireshark field list [S3] are consistent with each other. They are not independent in the strict sense: all describe the same protocol and may have been written from the same captures or from each other. I count them as independent sources for confirmation purposes, but readers should treat that as a soft count.

**Weak sources.** The decompilation write-up [S4] contradicts the others in several places and its own text hedges. The service and retail pages [S9][S20][S21] are marketing. Two forum or Q&A pages [S8][S16][S19] add small pieces.

**Disagreements.**

| Topic | Source A | Source B | My read |
|---|---|---|---|
| Control word 0x02 | Acknowledge [S2][S17] | "Diagnostic response" [S4] | Two against one. Go with acknowledge. |
| Control word 0x10 | Terminal 15 [S2] | "Vehicle ID request" [S4] | Unresolved. The write-up is a decompilation summary of an old Windows library; Scapy models what cars send. |
| Control word 0x11 | Vehicle ident data [S2] | Vehicle ID response [S4] | Agree. Single-source each, but they match. |
| Tester address | 0xF4 [S1][S2][S6] | 0xF1 [S4] | Go with 0xF4. 0xF1 is a common UDS tester value on CAN and the write-up may mix the two. |
| Frame layout | Length, control, source, target [S1][S3][S17] | Length, type, a flags byte, one address byte [S4] | Write-up is inconsistent with itself (it puts the tester byte at two different offsets). Disregard. |
| Meaning of "control port" 6811 | Discovery broadcast [S1] | Control functions [S4][S6] | Probably the same thing seen from two angles. Unconfirmed. |
| Acronym | "High Speed Fahrzeug Zugang" (as given on Wireshark-related material seen in search results, not opened) | "High-Speed Functional Zero" [S4] | Irrelevant to the build. Not used. |
| Activation line on media converter | Needed on tester side [S5] | The same page says not needed on the converter side [S5] | Internal tension on one page. Unresolved. |

**What I could not check.** Forum threads with real captures (Bimmerpost, Bimmerfest) were returned as search hits, but the two I tried opened as 403. No claim here relies on them. There may be better evidence in those threads that a person with a browser can read.

### Precise statements

**Confirmed (two or more independent sources):**
1. HSFZ frames start with a 4-byte length and a 2-byte control word, followed by 1-byte source and 1-byte target addresses [S1][S3][S17].
2. HSFZ diagnostics use TCP port 6801 [S1][S2][S6][S17].
3. Control word 0x0001 carries a diagnostic request or response, and 0x0002 is an acknowledge [S2][S17].
4. The default tester address is 0xF4 [S1][S2][S6].
5. UDP port 6811 exists and is the non-diagnostic channel; it is used to find the car [S1][S6].
6. Pin 8 of the OBD connector is the Ethernet activation line [S5][S12][S19].
7. Both HSFZ and DoIP are in use on BMW Ethernet-capable cars, and tools support both [S6][S7][S15].
8. HSFZ is a different framing from DoIP (different header size, address width and ports) [S1][S13][S18].

**Unconfirmed (one source, or inferred):**
1. Big-endian length [S17].
2. Whether the length includes the address bytes.
3. The remaining control words, including 0x0012 alive check [S2].
4. The UDP 6811 request and reply bytes.
5. No routing activation step for HSFZ [S1] (indirectly supported by [S2][S13]).
6. +5 V on pin 8, and the 8-to-5 resistance sensing [S5].
7. BMW's ENET cable using layout Option 1 [S5].
8. Which chassis uses HSFZ and which DoIP.
9. Any keepalive interval or idle timeout.
10. Link-local 169.254.x.x as the car's address [S4][S21] (two weak sources).
11. The 16-ECU, 2-second discovery behaviour [S1] (that is the tool, not the car).

---

## Implications for OpenDiag

**Build**
- A framing layer with only what is confirmed: length (4), control (2), source (1), target (1), UDS payload. Make byte order and length semantics a single constant that one capture can flip.
- A control-word table in code with the two confirmed words and the rest marked "from Scapy, unverified". Unknown words should be logged and surfaced, never dropped silently.
- Default tester address 0xF4, configurable. Handle the "incorrect tester address" reply by reading the expected address if the frame carries it.
- Discovery with three modes copied from EdiabasLib's design [S6]: explicit IP, broadcast on all interfaces, broadcast on a named interface. Allow a unicast probe too. Do not rely on one adapter being the only one on the host.
- A DoIP client alongside HSFZ using the AUTOSAR layouts [S18], with detection at run time. Try the order the owner's car needs, as EdiabasLib's protocol list does.
- A scanner that mirrors Scapy's address sweep (all 256 targets, short timeout) as a fallback for enumeration [S2].
- A capture-and-replay test harness, so that every unconfirmed item above becomes a fixture once the owner records a trace from their own car.

**Avoid**
- Hard-coding any claim from the unconfirmed list as fact, especially a voltage on pin 8 or a keepalive period.
- Keying behaviour on chassis codes. The public evidence cannot support a per-model table.
- Reading GPL or non-commercial code for the missing byte layouts. The right route is clean-room: capture traffic from the owner's own car and adapter, and write from that.
- Reusing the decompilation write-up's numbers [S4].

**Measure**
- On the owner's cars: the exact discovery request and reply bytes, whether the reply is broadcast or unicast, the length semantics, the acknowledge body, how long an idle TCP connection survives, and whether the gateway sends an alive check on its own.
- Which protocol each of the owner's cars answers (HSFZ on 6801, DoIP on 13400, or both).
- With a WiFi ENET adapter: whether it passes HSFZ through unchanged, and what its own address and discovery behaviour look like.
- Whether the same framing is accepted by more than one responder on 6801 (gateway and head unit) [S17].

**Safety note for the project.** Keep the first release read-only on the bus: discovery, identification, and read services. Writes over HSFZ go through the gateway to real ECUs. Nothing here reduces that risk.

---

## Open questions

1. What are the exact bytes of the 6811 discovery request and reply, and does the reply carry VIN, logical address and MAC in a fixed layout?
2. Does the length field count the two address bytes? Is it big-endian everywhere?
3. What does the acknowledge frame (0x0002) carry, and must a tester send one?
4. Who sends the alive check (0x0012), at what interval, and what ends a session if it is missed?
5. What voltage, resistance or signal does a genuine BMW ENET cable put on pin 8, and what does the gateway require to wake the Ethernet port?
6. Which chassis and model years use HSFZ, DoIP, or both? Does any car answer both on the same connection?
7. How do WiFi ENET adapters bridge: transparent TCP, or a rewritten protocol?
8. What does the gateway do with a second concurrent tester connection?
9. Is 169.254.x.x always the car's address, or does it depend on the car, adapter or cable?
10. Are the "tester address expected / received" fields in Wireshark's recent versions part of the incorrect-tester-address reply, and what values come back?

---

## Source ledger

Rows are pages that loaded and were read. Reliability: high, med, low.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| S1 | https://quantexlab.com/en/develop/elm327_hsfz.html | Vendor docs | 6-byte header, 1-byte addresses, TCP 6801, UDP 6811 discovery, default tester F4, no routing activation, 2 s discovery, 16 ECU limit, 4095-byte limit | med |
| S2 | https://scapy.readthedocs.io/en/latest/api/scapy.contrib.automotive.bmw.hsfz.html | Library API docs | HSFZ fields, control-word table, default port 6801, scan helper (source 0xF4, 0.1 s timeout) | med |
| S3 | https://www.wireshark.org/docs/dfref/h/hsfz.html | Tool field reference | 32-bit length, 16-bit control word, 8-bit addresses, expected/received tester address fields in 4.6 | med |
| S4 | https://emdzej.github.io/ediabasx-docs/reference/interfaces/xenet32-analysis.html | Decompilation write-up | Ports 6801/6811, a different frame diagram, tester 0xF1, vehicle ID 0x10/0x11, link-local note; internally inconsistent | low |
| S5 | https://python-doipclient.readthedocs.io/en/latest/automotive_ethernet.html | Library docs | Pin 8 activation +5 V, two pin layouts, 8-to-5 resistance sensing, BMW ENET "appears" Option 1 | med |
| S6 | https://uholeschak.github.io/ediabaslib/docs/EdiabasLib.config_file.html | Tool maintainer docs | HSFZ/DoIP protocol order, ports 6811/6801, tester F4, DoIP defaults 0EF3/0010/13400, auto-discovery modes, timeouts, ICOM options | high |
| S7 | https://uholeschak.github.io/ediabaslib/docs/AdapterTypes.html | Tool maintainer docs | ENET covers F-series or higher with HSFZ or DoIP; Deep OBD ENET WiFi marked supported | med |
| S8 | https://diag.net/discussion/svd5fhenpndgu3lguqahhmqbpl | Forum thread | Autel F-series programming; Ethernet adapter problems; no protocol or pin 8 content | low |
| S9 | https://elinehub-website.pages.dev/bmw-enet-remote-diagnostics-programming/ | Vendor service page | Lists F/G series as "DoIP / Ethernet", no HSFZ mention | low |
| S10 | https://de1.quantexlab.com/el/develop/elm327_doip.html | Vendor docs | DoIP default port, routing activation types, UDP vehicle identification, tester 0E80 default, same 2 s / 16 entity limits | med |
| S11 | https://github.com/uholeschak/ediabaslib | README (GPL-3.0, README only) | ENET WiFi adapters for F-models; no HSFZ or DoIP detail | med |
| S12 | https://installguides.geotab.com/Guide/DoIP+Ethernet+Bypass+for+16-pin+Harnesses/265 | Vendor install guide | Pin 8 "DoIP activator", the two pin layouts, BMW and Mercedes "all models" need bypass | med |
| S13 | https://scapy.readthedocs.io/en/latest/api/scapy.contrib.automotive.doip.html | Library API docs | DoIP header, payload types, port 13400, default source 0xE80, auto routing activation | med |
| S14 | https://troopers.de/troopers22/talks/g3hgaq | Conference page | Scapy automotive scanning talk lists HSFZ and DoIP; no protocol detail | med |
| S15 | https://scapy.readthedocs.io/en/latest/layers/automotive.html | Library docs | Newest architectures use DoIP or HSFZ to a central gateway; HSFZ classes listed | med |
| S16 | https://ask.wireshark.org/questions/28259/revisions/ | Q&A post | Wireshark decodes only DoIP protocol version 2 | low |
| S17 | https://i.blackhat.com/USA-19/Thursday/us-19-Cai-0-Days-And-Mitigations-Roadways-To-Exploit-And-Secure-Connected-BMW-Cars-wp.pdf | Conference white paper (read via local PDF text extraction) | Head unit TCP 6801 service; 4-byte big-endian size, 2-byte control (1 request/response, 2 acknowledge), 1-byte source and destination, UDS payload; ZGW vs BDC gateway topology | high |
| S18 | https://www.autosar.org/fileadmin/standards/R23-11/CP/AUTOSAR_CP_SWS_DiagnosticOverIP.pdf | Standards spec (read via local PDF text extraction) | DoIP header layout, payload types, vehicle identification response layout, activation line and inactivity timer concepts | high |
| S19 | https://forum.hexcode.co.za/forum/index.php/topic,2242.20/wap2.html | Forum thread | Pin 8 once a second K-line on older BMW; now used to enable DoIP | low |
| S20 | https://bimmergroup.com/ENET | Retail page | Cable compatibility list (F, G, U, I, MINI, Rolls-Royce, Supra A90/A91), no pin or protocol detail | low |
| S21 | https://www.aliexpress.com/s/wiki-ssr/article/e-sys-bmw-coding | Retail promotion article | Static 169.254.100.100/16 suggestion, USB-Ethernet chipset advice | low |
| S22 | https://github.com/brodee227/bmw-f | README (GPL-3.0, README only) | Fork of an F-series coding repo; ENET cable listed as hardware only; no protocol detail | low |

**Attempted and not usable (not counted above):** f30.bimmerpost.com thread (403), g30.bimmerpost.com thread (403), kb.surfsight.net (403), scapy ReadTheDocs DoIP-adjacent pages beyond those listed (not needed), decibel.ni.com (403), supramkv.com (403), club.forged4x4.com (410), obdeleven.com (403), r44performance.com and bavmods.com (429 rate limit), scribd ENET cable build (page body empty), NI documentation link (navigation page only), ovmsdev mailing list message (about plain CAN, not relevant).

**Deliberately not opened:** the Wireshark HSFZ dissector source and any other GPL or non-commercial source; a git repository of what appears to be copied EDIABAS binaries and INI files; BMW training documents on archive.org of unclear provenance.
