# RD-1: BMW ENET / HSFZ in the field (Q1, Q2)

Fact-check pass 2026-11-24: about 10 decision-relevant claims re-read against sources (F3, F7, C4, A1, A4, A6, D3, K2, K3, K4, W2, W5, W6, D10, Quantex items); corrections applied in place (K3, K4, C3, W2, W5, W6, W11, D7, Quantex row). All other claims in the note remain as first written and were not re-checked.

Status: research note, 2026-11-24 (sprint day 2). **PARTIAL.** No forum thread with a raw trace could be read: Bimmerpost (two threads) sat behind an access check, Bimmerfest returned 402, Reddit is blocked for the fetch tool, one dealer-support page was 404. What replaced them: two open-source BMW apps that publish how their code behaves (one MIT, one AGPL), a vendor firmware page, a security-training knowledge base, a conference white paper, library and tool documentation. Extends `docs/research/deep/bmw-enet-hsfz-wire-protocol.md` and `docs/research/deep2/adapter-and-transport-constraints.md`; does not repeat their port, pin and DoIP sections except where new evidence changes them.

Clean-room status: no leaked, cracked or pirated OEM file was opened. GPL and AGPL code was not opened; only README or documentation pages were read for those (Scapy, Wireshark, EdiabasLib, klartext). The MIT-licensed Boostline source files were read (their licence allows it). One AGPL project's README says it decrypts the owner's own ISTA database; we take nothing from that part (see the ledger).

---

## ANSWER FIRST

- **Length field:** counts everything after the 6-byte header, so it includes the two address bytes (length = 2 + UDS bytes). Three independent reads agree: a security-training page, an open-source app README, and an open-source app's code. The current OpenDiag decoder already does this by accident (its payload contains the addresses). Still unseen on a real wire by us.
- **Discovery (UDP 6811):** the request is a bare 6-byte header with length 0 and control word 0x0011: `00 00 00 00 00 11`. Replies carry the same control word 0x0011 followed by ASCII text shaped `DIAGADR10BMWMAC<12 hex>BMWVIN<17 chars>`. Two sources describe this; both are app authors' beliefs, not captures we can see. Broadcast target and reply-to-sender behaviour are unconfirmed.
- **Acknowledge (0x0002):** one source (a fake gateway written for tests) says the gateway answers every diagnostic frame with an ack that repeats source, target and the request bytes, then sends the real answer. Treat that as a hypothesis. The capture decides it.
- **Alive check (0x0012):** the sources disagree. One app answers gateway-sent 0x0012 frames with payload `F4 00`; another app says its real-car captures contain none, and keeps the session alive with UDS tester-present (`3E 80`) about every 2 seconds. Do not build either until our capture shows which.
- **Tester address:** 0xF4 is confirmed by six sources as the usual value. No source says which other values a real gateway accepts. There is an "incorrect tester address" error word (0x0040) on the gateway side; that is all we know.
- **WiFi dongles:** two apps say MHD and bootmod3 WiFi adapters present the same HSFZ gateway path as a cable, and one has a dated real-car test through an MHD adapter (iPhone, 2026-10-10). Nobody documents what the dongle changes. The maintainer of one app says in a code comment that the bridging is an assumption.
- **Biggest practical risk for our code today:** it silently drops every non-diagnostic frame (acks, errors, alive checks), so a gateway error shows up as a timeout and any needed alive-check answer would be missed.
- **What needs you tonight:** capture A on the WiFi ENET dongle with the sniff filter widened to include UDP 6811 broadcast; then check the 8 numbered claims at the end.

---

## Claims table

Confidence: high = two or more independent sources that did not copy each other, or a primary-style capture; medium = one clear source or two weakly independent; low = single weak source or inference. "Single" means a single-source flag. "App-belief" means the source is an app author's description of its own code, not a capture we can examine.

### Framing and length

| # | Claim | Source | Conf. | Single |
|---|---|---|---|---|
| F1 | A frame is a 6-byte header (4-byte length, 2-byte control word) followed by payload; diagnostic payload begins with 1-byte source then 1-byte target, then UDS | https://quantexlab.com/en/develop/elm327_hsfz.html ; https://munich.dissec.to/kb/chapters/doip/doip.html ; https://raw.githubusercontent.com/clucraft/Boostline/HEAD/src/core/vehicle/hsfz.ts | high | no |
| F2 | Length and control are big-endian | Boostline code (u32 BE, u16 BE); Black Hat paper says the body size is big-endian (https://i.blackhat.com/USA-19/Thursday/us-19-Cai-0-Days-And-Mitigations-Roadways-To-Exploit-And-Secure-Connected-BMW-Cars-wp.pdf, section 3.1.2) | high | no |
| F3 | The length counts the 2 address bytes plus the UDS bytes and excludes the 6-byte header (example: UDS `22 F1 90` gives length 5) | Dissecto page: "payload length plus SRC and DST"; klartext README (https://github.com/HadiCherkaoui/klartext) says LENGTH = 2 + UDS length; Boostline test frame `00 00 00 05 00 01 F4 12 22 F1 90` | high | no (but the two apps may share the same reading; none is a capture we can inspect) |
| F4 | The Black Hat paper's "body size" is ambiguous about whether it counts the addresses; the paper's bullet list places source and destination as separate fields next to the size | Black Hat white paper, section 3.1.2 | medium | yes |
| F5 | Dissecto's own Scapy example reply: length 18 for a read-by-identifier reply, source 0x10, destination 0xF4 (consistent with F3 only if the UDS reply was 16 bytes; the page does not show the bytes) | https://munich.dissec.to/kb/chapters/doip/doip.html | low | yes |
| F6 | Quantex lists a 4095-byte UDS message limit for its firmware; this is a tool limit, not shown to be a gateway limit | https://quantexlab.com/en/develop/elm327_hsfz.html | medium | yes |
| F7 | Boostline rejects any length over 262144 bytes; OpenDiag's decoder rejects over 65536. Both are self-chosen sanity caps | Boostline hsfz.ts; `packages/core/src/hsfz.ts` | high (as to the code) | n/a |
| F8 | HSFZ over TCP needs no routing activation (unlike DoIP) | Quantex page; Boostline connects and sends immediately | medium | no |
| F9 | A TCP stream can carry several frames in one segment and split a frame across segments, so the reader must buffer | Boostline frame reader description (hsfz.ts) and its stream-reassembly test | medium | yes (design note) |

### Control words

| # | Claim | Source | Conf. | Single |
|---|---|---|---|---|
| C1 | 0x0001 = diagnostic request or response | Scapy HSFZ API page (https://scapy.readthedocs.io/en/latest/api/scapy.contrib.automotive.bmw.hsfz.html); Black Hat paper; Dissecto; Boostline | high | no |
| C2 | 0x0002 = acknowledge ("acknowledge_transfer" in Scapy, "echo/ack" on the Dissecto page) | Scapy API; Black Hat; Dissecto; Boostline | high | no |
| C3 | The ack payload repeats source, target and the request's UDS bytes (example `F4 12 22 F1 90`) | Boostline test and its fake gateway (https://raw.githubusercontent.com/clucraft/Boostline/HEAD/test/fakeGateway.ts). The fake gateway has no comment tying it to a real capture. Boostline's client only acts on an ack for requests that expect no reply (source = tester, target = request target), tolerates a missing ack, and ignores a tester-sent echo; so the client does not depend on an ack arriving | low | yes |
| C4 | Control words in Scapy: 0x10 terminal15, 0x11 vehicle_ident_data, 0x12 alive_check, 0x13 status_data_inquiry, 0x40 incorrect_tester_address, 0x41 incorrect_control_word, 0x42 incorrect_format, 0x43 incorrect_dest_address, 0x44 message_too_large, 0x45 diag_app_not_ready, 0xFF out_of_memory | Scapy API page (decimal 16 to 19, 64 to 69, 255) | medium | no (Boostline and klartext corroborate 0x01, 0x02, 0x11, 0x12, 0x40 to 0x45, 0xFF by name) |
| C5 | The 0x11 word is the vehicle-identification word, used on UDP 6811 | Scapy table (name only); Boostline discovery code; klartext README | medium | no |
| C6 | Wireshark's HSFZ field list has an "identification string" field and, from the 4.6 series, "tester address expected" and "tester address received" fields | https://www.wireshark.org/docs/dfref/h/hsfz.html | high (as to field names) | no |
| C7 | The gateway's wrong-tester-address error (0x0040) probably returns the address it wanted and the address it saw. Inference from the Wireshark field names only; nothing states it | Wireshark field list | low | yes |
| C8 | Gateway error words 0x40 to 0x45 and 0xFF fail the pending request in Boostline's code; a wrong-destination request produces 0x43 with the source and target as payload in its fake gateway | Boostline hsfz.ts, fakeGateway.ts | low | yes |
| C9 | An older Windows driver write-up lists 0x10 as "vehicle ID request" and 0x11 as "vehicle ID response" (conflicts with Scapy on 0x10; see disagreements) | https://emdzej.github.io/ediabasx-docs/reference/interfaces/xenet32-analysis.html | low | yes |

### Discovery on UDP 6811

| # | Claim | Source | Conf. | Single |
|---|---|---|---|---|
| D1 | UDP 6811 is the vehicle-discovery port; the tool broadcasts and lists VIN, logical address, IP and MAC of responders | Quantex; Boostline README and code; EdiabasLib calls it the "control port" (https://uholeschak.github.io/ediabaslib/docs/EdiabasLib.config_file.html) | high | no |
| D2 | The discovery request is the 6-byte header with length 0 and control 0x0011, no payload: `00 00 00 00 00 11` | Boostline discovery.ts comment and hsfz test frame `000000000011` | medium | yes (app-belief) |
| D3 | A reply is a 6-byte header with control 0x0011 followed by ASCII text; the text holds `DIAGADR` and 1 to 2 hex digits (example `10`), `BMWMAC` and 12 hex digits, `BMWVIN` and 17 characters | Boostline discovery.ts parser; klartext README marks the layout "confirmed"; Boostline's fake gateway builds `DIAGADR10BMWMAC001A37C0FFEEBMWVIN...` | medium | no (but the two may share a source; klartext claims real F20 and F25 sessions) |
| D4 | Whether the DIAGADR digits are hex is an assumption in Boostline's own code comment; klartext lists the gateway address as 0x10 and Quantex's example output shows `ADDR:10` | Boostline discovery.ts; klartext README; Quantex | medium | no |
| D5 | Quantex's discovery output example (`ADDR:10`, `IP:A9FE0114`, `MAC:001A37B44210`) shows a link-local address 169.254.1.20 and a MAC with prefix 00:1A:37 | Quantex | medium | yes |
| D6 | The MAC prefix 00:1A:37 appears again on Dissecto's DoIP nmap example and in Boostline's test strings | Dissecto page; Boostline fakeGateway | low (may be copy of the same tool output) | no |
| D7 | The request is sent to 255.255.255.255 plus the directed broadcast of each IPv4 interface (Boostline, not re-checked); reply window 1500 ms in Boostline (not re-checked), about 2000 ms in Quantex's automatic protocol search (re-checked) | Boostline discovery.ts; Quantex page | medium | no (these are client defaults, not gateway rules) |
| D8 | On iOS, UDP broadcast discovery is not usable; Boostline probes likely adapter addresses on TCP 6801 instead (connect only, nothing sent, 800 ms) | Boostline docs/ios.md and enet.ts | medium | yes |
| D9 | Quantex deduplicates replies by logical address and keeps at most 16; this is a tool limit | Quantex | medium | yes |
| D10 | EdiabasLib's default vehicle-search mask is 255.255.255.255 (changed in EDIABAS 7.6.0), "auto" uses that, "auto:all" every interface, "auto:<name>" interfaces by name prefix | EdiabasLib config page | high | yes (it is the maintainer's own doc) |
| D11 | EdiabasLib's remote host string is `ip:protocol:diag port:control port`, so ports are configurable; BMW ICOM boxes use other ports (example in the doc: diag 50160, control 50161, diag address 0x10) | EdiabasLib config page | high | yes |

### Addresses and what the gateway accepts

| # | Claim | Source | Conf. | Single |
|---|---|---|---|---|
| A1 | Default tester address 0xF4 | Quantex; Scapy (source 244); EdiabasLib default `0xF4`; Dissecto example; klartext; Boostline (default) | high | no |
| A2 | Gateway (ZGW) logical address 0x10 | Dissecto; klartext; Boostline; EdiabasLib ICOM example | high | no |
| A3 | Engine control module (DME) is 0x12 and a second one 0x13 on N63 and S63 | Boostline README and code | medium | yes |
| A4 | A scan of destination 0x00 to 0xFF over HSFZ with tester 0xF4 and a session-control request got answers from 0x10, 0x40, 0xDF, 0xE0 and 0xF0 on Dissecto's test unit; the 0xF0 answer was negative; timeout 0.05 s. The unit type is not stated | https://munich.dissec.to/kb/chapters/doip/doip.html | low | yes |
| A5 | 0xDF is a functional (broadcast) address | xenet32 write-up; consistent with A4 | low | yes |
| A6 | Scapy's `hsfz_scan` helper uses tester 244 (0xF4) and timeout 0.1 s per destination | Scapy API page | high | no |
| A7 | No source states which tester addresses a production gateway rejects, or whether it checks the source at all beyond the error word | (absence) | n/a | n/a |
| A8 | One older write-up gives 0xF1 as the tester; no other source does; Quantex says 0xF4 "usually needs no change" | xenet32 write-up; Quantex | low | yes |
| A9 | EdiabasLib exposes the tester address as a setting, so some setups differ | EdiabasLib config page | medium | yes |

### Session keeping, timing

| # | Claim | Source | Conf. | Single |
|---|---|---|---|---|
| K1 | klartext holds the session with UDS tester-present `3E 80` about every 2 seconds and says the gateway acknowledges it | klartext README | medium | yes |
| K2 | klartext says its captures on an F20 and an F25 contain no HSFZ 0x12 alive check, so it does not implement it | klartext README | medium | yes |
| K3 | Boostline answers a gateway-sent 0x0012 with payload `F4 00`, at most once per 250 ms; its own code says the reply format is unconfirmed; its fake gateway sends alive checks with no payload | Boostline hsfz.ts; fakeGateway.ts | low | yes (no capture cited; re-checked 2026-11-24) |
| K4 | Boostline enables TCP keepalive at 5000 ms and sends no application-level keepalive in hsfz.ts. The note's earlier "`3E 80` every 2000 ms in the extended session" came from enet.ts and was not re-verified in this check | Boostline hsfz.ts (re-checked); enet.ts (not re-checked) | low for the 3E 80 part, medium for TCP keepalive | yes |
| K5 | Defaults other tools use: TCP connect 5000 ms (EdiabasLib), 3000 ms (Boostline), 20000 ms (EDIABAS.INI as quoted by klartext); extra receive time 1000 ms standard, 2000 ms for ICOM | EdiabasLib config page; Boostline; klartext | medium | no |
| K6 | UDS pending: a negative response with NRC 0x78 means "keep waiting"; Boostline waits 5000 ms and restarts on each one; klartext retries a bounded number of times | Boostline; klartext | medium | no |
| K7 | Boostline sends one request at a time over the wire (FIFO queue) | Boostline hsfz.ts | medium | yes |
| K8 | klartext uses TCP no-delay and notes the gateway reports its own P2 and P2* timings in the response to `10 03` | klartext README | low | yes |

### WiFi ENET dongles and wired ENET

| # | Claim | Source | Conf. | Single |
|---|---|---|---|---|
| W1 | MHD and bootmod3 WiFi adapters are reached as plain ENET gateways at the adapter's IP, using the same HSFZ path | Boostline README, adapter.ts | medium | yes (app-belief) |
| W2 | An MHD WiFi adapter was confirmed on a real car in the 0.3.0 entry dated 2026-10-09 (the entry does not name a platform, so "desktop" is our inference) and in the iOS 0.6.0 entry dated 2026-10-10. The bootmod3 adapter is listed as supported; the changelog shows no real-car test for it ("not yet tested" wording is from docs/ios.md, not re-read) | Boostline CHANGELOG (re-checked), docs/ios.md | medium | yes |
| W3 | The MHD adapter broadcasts two networks, "MHD ENET" and "MHD ECA"; only the first carries diagnostics | Boostline README and CHANGELOG | medium | yes |
| W4 | Boostline's code comment calls the WiFi bridging of HSFZ an assumption and has WiFi-only handling for TCP probing and optional subnet scan | Boostline enet.ts (as summarised) | medium | yes |
| W5 | A WiFi ENET adapter of the older "Deep OBD" type is an OpenWrt router (RT5350F), SSID "Deep OBD BMW", address 192.168.100.1, runs a DHCP server. (The earlier claim that the cable-side port is a LAN port was not found on re-read; dropped) | https://www.github.com/uholeschak/ediabaslib/blob/master/docs/ENET_WiFi_Adapter.md | high (maintainer doc) | yes |
| W6 | That adapter doc lists no ports. For the cable case it tells the user to set the Android LAN adapter (not a laptop) to link-local (example 169.254.1.10 with mask 255.255.0.0) because the car falls back to Auto IP and gives no DHCP over a cable | same | medium | yes |
| W7 | The car's side may use DHCP on the OBD connector, not only link-local (python-doipclient primer says DHCP is "likely"); link-local is the documented fallback | https://python-doipclient.readthedocs.io/en/latest/automotive_ethernet.html | low | yes |
| W8 | The primer warns that production ECUs may filter by MAC address and that ping may not work | same | low | yes |
| W9 | WiFi adapters sold for bootmod3 are described by one vendor as having a custom WiFi password (and others as open); seller claims | https://www.ecstuning.com/b-bootmod3-parts/bm3-wireless-obdii-wifi-enet-canbus-flash-adapter/obd2fa~bm3/ (search snippet only) | low | yes |
| W10 | Boostline's iOS notes: join the adapter network, allow the local-network prompt; the adapter's WiFi has no internet | Boostline docs/ios.md | medium | yes |
| W11 | The EdiabasLib doc describes a Windows PC joining the adapter's WiFi and getting its address by DHCP. The INPA, Tool32 and ISTA-D detail was not found on re-read and is unverified | EdiabasLib ENET_WiFi_Adapter.md | low | yes |

### Pin 8 and physical activation (Q6 side note)

| # | Claim | Source | Conf. | Single |
|---|---|---|---|---|
| P1 | OBD pin 8 enables the Ethernet PHY on HSFZ and DoIP ECUs; without it there is no IP traffic | Dissecto; python-doipclient; Geotab guide (earlier note) | high | no |
| P2 | Dissecto says: pull pin 8 up with 510 ohm | Dissecto | low | yes |
| P3 | python-doipclient says the tester applies +5 V to pin 8 and senses resistance between pins 8 and 5 to pick the layout | python-doipclient primer | low | yes |
| P4 | P2 and P3 conflict (a 510 ohm pull-up to what voltage is not stated). The two could both be true if the pull-up is to 5 V, but no source says so | both | low | n/a |
| P5 | The Black Hat paper also says the car's central gateway is a separate unit on older cars and part of the body domain controller on newer ones | Black Hat paper (earlier note) | medium | yes |

### Other facts worth keeping

| # | Claim | Source | Conf. | Single |
|---|---|---|---|---|
| O1 | HSFZ is "only used by BMW", started 2008 at 10 Mbit, 100 Mbit from 2015 | Dissecto | low | yes |
| O2 | Head units run an HSFZ-style service on TCP 6801 themselves, so more than one device can answer on that port | Black Hat paper | medium | yes |
| O3 | Ethernet-side tools in the wild use `22 F190` (VIN) as the first request, to the DME 0x12 or the gateway 0x10 | Boostline test and enet.ts | medium | yes |
| O4 | Dynamic data identifiers: Boostline starts at 0xF300, 16 entries and 64 bytes per identifier as "conservative guesses" | Boostline enet.ts | low | yes |
| O5 | Scapy and Wireshark can decode HSFZ; Wireshark needs the port set in preferences | BMW-Hacking site (https://antoniovazquezblanco.github.io/BMW-Hacking/diagnostic_protocols) | medium | yes |
| O6 | The Wireshark HSFZ dissector is GPL; not opened | (policy) | n/a | n/a |
| O7 | The OpenDiag transport today drops every non-0x0001 frame: acks, errors (0x40 to 0x45), alive checks, vehicle-ident | `packages/core/src/net.ts` | high (our code) | n/a |
| O8 | The OpenDiag code has no discovery and no keepalive | `packages/core/src` | high (our code) | n/a |

---

## Disagreements between sources

| Topic | A says | B says | Read |
|---|---|---|---|
| HSFZ alive check 0x12 | Boostline answers gateway-sent 0x12 frames with `F4 00` | klartext: no 0x12 in its F20 and F25 captures; session held by `3E 80` | Possibly both true: the gateway may only send 0x12 in some situations (idle, certain tools, ICOM, WiFi bridge). Our capture will show whether any 0x12 appears and in what direction. Neither is a capture we can see. |
| Meaning of 0x10 | Scapy: terminal15 | xenet32 write-up: vehicle ID request | Scapy models real cars and has more independent users; the write-up is a decompilation summary that disagrees with itself on other points. Prefer Scapy. Discovery request uses 0x11 in Boostline, which supports Scapy's table for 0x11. |
| Meaning of 6811 | "Discovery" (Quantex, Boostline) | "Control port" (EdiabasLib, xenet32) | Likely the same port seen from two angles. EdiabasLib's own docs use the same port for the vehicle search broadcast (`HostIdentService`), which fits discovery. |
| Tester address | 0xF4 everywhere | 0xF1 in the xenet32 write-up | Go with 0xF4. |
| Pin 8 | 510 ohm pull-up (Dissecto) | +5 V applied (python-doipclient) | Unresolved. Measurement would settle it. A multimeter reading of a cable at rest does not. Do not design hardware from either. |
| Length counts addresses | Yes (Dissecto, klartext, Boostline) | Black Hat paper is ambiguous | No source says no. Capture will confirm with a real VIN read. |
| Ack content | Boostline fake gateway repeats source, target and request bytes | Dissecto only says "echo/ack" | Compatible; "echo" in Dissecto supports repeating something. Exact extent unknown. |
| Header frame in Quantex's own example | Page says addresses are 1 byte, not 2 as in DoIP | Its H1 (headers-on) display shows each address as a zero high byte plus a low byte | Not necessarily a contradiction: the H1 layout is a firmware display mode, not the HSFZ wire format. The page also does not say whether the length counts the addresses, so Quantex is not a source for F3. Not used. |
| Connect timeout | 5000 ms (EdiabasLib) | 3000 ms (Boostline), 20000 ms (EDIABAS.INI per klartext) | Client defaults; no protocol meaning. |
| Where the car gets its address | Link-local (Quantex example, EdiabasLib doc, Boostline error text) | "DHCP is likely on the OBD connector" (python-doipclient) | Not contradictory if the car does link-local when no DHCP is offered; unconfirmed for G-series. Check what the laptop sees on the WiFi network from the dongle. |
| Who answers on 6801 | Gateway | Head units also listen on 6801 (Black Hat) | Both can be true. Scanning every address needs care. |

---

## Source ledger

### Read (loaded and used)

| # | Source | Kind | Licence note | Used for |
|---|---|---|---|---|
| 1 | https://quantexlab.com/en/develop/elm327_hsfz.html | Vendor firmware docs | No licence text; paraphrased only | header, ports, discovery, defaults, limits |
| 2 | https://scapy.readthedocs.io/en/latest/api/scapy.contrib.automotive.bmw.hsfz.html | Library API docs | Scapy is GPL (code not opened) | control word table, scan helper |
| 3 | https://scapy.readthedocs.io/en/latest/layers/automotive.html | Library docs | same | HSFZ listed; no scan detail |
| 4 | https://www.wireshark.org/docs/dfref/h/hsfz.html | Tool field reference | Wireshark is GPL (code not opened) | field names |
| 5 | https://munich.dissec.to/kb/chapters/doip/doip.html | Training knowledge base (dissecto GmbH, 2023) | No reuse licence stated; paraphrased only | length, type, scan responders, pin 8 pull-up |
| 6 | https://i.blackhat.com/USA-19/Thursday/us-19-Cai-0-Days-And-Mitigations-Roadways-To-Exploit-And-Secure-Connected-BMW-Cars-wp.pdf | Conference white paper (read through local text extraction) | copyrighted; paraphrased | big-endian size, control 1 and 2, head-unit service on 6801 |
| 7 | https://uholeschak.github.io/ediabaslib/docs/EdiabasLib.config_file.html | Maintainer docs | EdiabasLib is GPL-3.0; docs page only | defaults and settings |
| 8 | https://www.github.com/uholeschak/ediabaslib/blob/master/docs/ENET_WiFi_Adapter.md | Maintainer doc | GPL-3.0 repo; doc page only | WiFi adapter facts |
| 9 | https://uholeschak.github.io/ediabaslib/docs/AdapterTypes.html | Maintainer docs | same | ENET definition |
| 10 | https://github.com/HadiCherkaoui/klartext (README) | Open-source app README | AGPL-3.0; README only | length, ident layout, keepalive, absent 0x12 |
| 11 | https://github.com/clucraft/Boostline (README, CHANGELOG, docs/ios.md) | Open-source app docs | MIT | adapters, ports, real-car dates |
| 12 | https://raw.githubusercontent.com/clucraft/Boostline/HEAD/src/core/vehicle/hsfz.ts, discovery.ts, enet.ts, adapter.ts | Open-source code | MIT per README (no per-file header) | framing, discovery bytes, ack and alive handling |
| 13 | https://raw.githubusercontent.com/clucraft/Boostline/HEAD/test/hsfz.test.ts, test/fakeGateway.ts | Open-source tests | MIT per README | hex frames, fake gateway behaviour |
| 14 | https://emdzej.github.io/ediabasx-docs/reference/interfaces/xenet32-analysis.html | Decompilation write-up | unknown; low reliability | conflicting items only |
| 15 | https://python-doipclient.readthedocs.io/en/latest/automotive_ethernet.html | Library primer | page shows copyright to its author; library is MIT per search snippet | pin 8, DHCP, MAC filter warning |
| 16 | https://opus4.kobv.de/opus4-oth-regensburg/files/2988/ESCARPaper.pdf (text extraction) | Academic paper | copyrighted; paraphrased | context only: DoIP and HSFZ via UDP and TCP sockets; keep-alive or activation line needed on test benches. No byte-level HSFZ detail |
| 17 | https://antoniovazquezblanco.github.io/BMW-Hacking/diagnostic_protocols and /diagnostic_port, /esys/connection | Community docs | no licence stated | HSFZ named; tools; no protocol detail |
| 18 | https://github.com/dader34/BMWeb/wiki | Project wiki | GPLv3 project | nothing on HSFZ (K+DCAN, WebRTC only) |
| 19 | https://bmw-icom-a2-wifi.blogspot.com/2018/07/bmw-f-series-ista-failed-to-connect-to-enet-cable-solution.html | Blog | low reliability | only: a "ZGW search" shows IP and VIN when the link is right |

### Searched but result snippets only (not opened, not used as evidence)

Search results listed vendor pages for WiFi ENET adapters (Turner, ECS, UroTuning, Newegg, eBay) and one Scapy-source mirror. Only W9 uses a snippet and is flagged low.

### Failed to load or not usable

| Source | Failure |
|---|---|
| https://f30.bimmerpost.com/forums/showthread.php?p=30748289 | Access check page ("Verifying access") |
| https://g87.bimmerpost.com/forums/showthread.php?p=30218836 | Same |
| https://www.bimmerfest.com/threads/enet-can-diagnostic-messages-for-bench-coding.1398888/ | Redirected to a pay-gate host; 402 |
| https://www.reddit.com/r/BMWcoding/... | Fetch tool refuses Reddit |
| https://desk.zoho.com/portal/obdhawk/... | 404 |
| https://www.turnermotorsport.com/p-33746523-... | 403 |
| https://dspace.zcu.cz/bitstream/11025/42183/1/Rigo_Weiss_2020_2.pdf | 503 |
| https://odr.chalmers.se/... (2011 DoIP thesis) | Loaded as PDF but is a DoIP security thesis with no HSFZ content; not used |
| https://osqa-ask.wireshark.org/questions/58129/car-ecu-talks/ | Loaded; unrelated (non-BMW ECU) |
| https://www.ediabaslib.com/ | No such host |

Planned for Monday retry through the browser tool: the two Bimmerpost pages and the Bimmerfest bench-coding thread. If they still fail, the owner saves them as text to the private folder.

### Deliberately not opened

- Scapy `hsfz.py`, the Wireshark `packet-hsfz.c` and header (GPL).
- EdiabasLib and any other GPL source.
- klartext `docs/` files such as `protocol-reference.md` and `field-findings-2026-07-03.md` (AGPL, not README). They probably contain the byte-level detail we lack. Decide whether you accept reading AGPL prose docs as discussion; until you say yes, they stay unread.
- klartext's ISTA-database decryption script and the "ISTA data" it describes. That is OEM-data decryption and does not fit the clean-room rule; nothing from that part is used.
- Any BMW training PDF on archive.org of unclear provenance, and an unlabeled Google Sheet that showed up in search results.

---

## Open questions

1. **Does the real gateway ever send an HSFZ 0x12 alive check?** Direction, frequency, payload. (The two apps disagree.)
2. **Does an ack always come first?** Does it come for tester-present too? What does it repeat? If the ack repeats the request bytes, how many?
3. **Reply to the discovery probe:** exact length value in the header, payload length, whether text is padded or null-terminated, whether the reply is unicast to the sender or broadcast, whether several cars or several responders (head unit, telematics) answer.
4. **Discovery through the WiFi dongle:** does a UDP broadcast on the dongle's network reach the car at all, or does the dongle answer on its own behalf? Does the dongle change the MAC, IP or the DIAGADR in the reply?
5. **WiFi dongle TCP pass-through:** is there one TCP connection to the car per client, or does the dongle terminate TCP and open its own? Does its address change between runs? Which ports does it listen on besides 6801?
6. **What the gateway checks on the source byte:** does any value other than 0xF4 work? What happens with an unknown source? (A passive capture cannot answer this; see claim 8.)
7. **Idle behaviour:** how long can a connection sit with no traffic before the gateway closes it (no source gives a number).
8. **Pin 8 voltage and resistance** (needs a meter; Q6).
9. **Chassis split:** which of F-series, early G-series and later G-series answer on 6801 versus 13400. The owner's car decides one point only.
10. **Maximum frame size the gateway accepts** (Quantex 4095 is a tool limit).
11. **Does a second TCP connection to 6801 get refused?** (relevant to running a phone app and CLI at once, which the sprint rules forbid anyway.)
12. **Does the car answer on 6811 with the engine off, ignition on, and with the dongle only awake for a moment after plug-in?**

---

## What this changes in the code, if the capture agrees (not coded today)

- Keep: big-endian header, length counts the two address bytes, tester 0xF4, ack 0x0002 as a distinct word.
- Add before week 2 is over: receive-side handling for 0x0002 (match and skip), 0x0040 to 0x0045 and 0x00FF (fail fast with the error code), and 0x0012 (log it; answer only if the capture shows the gateway expects it).
- Add: a discovery probe on UDP 6811 and a reply parser; a fallback that probes TCP 6801 on common dongle addresses (iOS cannot broadcast).
- Add: tester-present every 2 s during long sessions, only if the capture shows the gateway drops idle connections.
- Decision D3 in the sprint (keep or change tester and length handling) is to keep, pending claims 1 to 4 below.

---

## Eight byte-level claims to test against capture A (Nov 24)

Capture filter must include both TCP 6801 and UDP 6811 on the laptop's interface to the dongle, not only traffic to the dongle's IP. Frames below are written as hex without spaces where useful. For each claim, "pass" means the pcap shows it; "fail" means the opposite; "no data" means the situation did not occur. All claims are read-only observations; nothing here needs a new request type beyond what the sprint already allows, apart from claim 8, which is a design check on a later night.

1. **Length counts the two address bytes.** The first diagnostic frame the CLI sends for a VIN read (`22 F1 90` to the gateway 0x10 or to the DME 0x12) should be exactly 11 bytes on the wire: `00 00 00 05 00 01 F4 <target> 22 F1 90`. Pass if the length field is 5. Also check the reply: length = 2 + the reply's UDS bytes (a VIN positive reply starts `62 F1 90` plus 17 ASCII bytes, so length 22 if the reply is `<src> <dst> 62 F1 90 <17 bytes>`).
2. **Every request gets an ack with control 0x0002 before the answer.** For the same VIN request, expect a frame starting `00 00 00 .. 00 02 <F4> <target>` arriving before the control-0x0001 reply, with source F4 then target, and (hypothesis) the request's UDS bytes after them. Record the exact length value and payload of the ack, and whether acks also appear for tester-present and for the scan pings.
3. **Source and target swap in the reply.** The reply frame's first two payload bytes are the original target then 0xF4 (for example `10 F4 62 F1 90 ...`). Also confirm the order in the ack (source F4 first).
4. **Discovery probe and reply on UDP 6811.** When the CLI (or a one-off probe sent by Claude from a script in the scratch folder, only if the owner approves it first) sends `00 00 00 00 00 11` to the broadcast address on port 6811, the reply is a datagram whose first six bytes are `<4-byte length> 00 11` and whose text contains `DIAGADR`, `BMWMAC` and `BMWVIN` in that order. Record: header length value versus the text length, the DIAGADR digits (expect `10`), whether the VIN length is 17, and whether the text ends with padding. The current OpenDiag CLI has no discovery, so this claim needs either a manual probe or Wireshark to catch the dongle's own announcement; if neither happens, mark "no data" rather than improvise.
5. **Alive check 0x0012: present or absent.** Over the whole session (at least 5 minutes of connection including idle gaps of at least 30 seconds between commands), count frames with control `00 12` in either direction. Pass A: none seen (supports klartext). Pass B: some seen from the gateway, with payload length 0 or 2, and record their spacing and any reply (supports Boostline, whose reply is `F4 00`). Our CLI will not answer them, so also note whether the connection survives.
6. **Tester-present is acknowledged and holds the session.** If the CLI sends `3E 80` (the scan uses tester-present pings), check that each is followed by a control-0x0002 frame and no control-0x0001 reply, because the 0x80 bit suppresses the positive answer. If the scan sends `3E 00` instead, expect a `7E 00` reply with control 0x0001. Record which one the CLI used and what came back.
7. **The dongle does not rewrite HSFZ.** Compare the bytes the laptop sends with the bytes the laptop receives and with expected values from claims 1 to 3: same source and target bytes, no extra header, no added or merged frames, no change in the length field. Also record the TCP behaviour on the WiFi side: source IP of the replies equals the dongle's IP, a single TCP connection on 6801, any connection reset when idle, and the time between the request frame and the ack (the dongle's added delay). Additionally note the dongle's IP, whether it hands out DHCP (a DHCP offer visible in the capture) and which UDP and TCP ports it answers on from the plain TCP port check in the sprint plan.
8. **Gateway-only vs whole-car answers by destination (observation only, no new test on Nov 24).** From the scan results already taken (`scan --range 0x10-0x7f`), list which destination bytes answered with control 0x0001 positive replies, which with a negative UDS reply, and which with a gateway error word (0x0043 would mean "incorrect destination address"; 0x0040 would mean "incorrect tester address", which would be a new, important finding at tester 0xF4). Expect at least 0x10 to answer. Compare the answering set against the dissecto scan (0x10, 0x40, 0xDF, 0xE0, 0xF0) and against Boostline's DME address 0x12. A deliberate wrong-tester-address request (for example source 0xF5) is not part of the sprint's allowed list and must not be sent on Nov 24; if the capture shows 0x0040 or 0x0043 frames from the normal scan, that already answers whether the gateway checks source and destination.
