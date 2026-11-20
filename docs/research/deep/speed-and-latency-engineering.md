# Speed and latency engineering for OpenDiag

Scope: how fast diagnostics can be made. ISO-TP pacing, CAN bus load, DoIP, BLE, ELM327/STN tuning, parallel scanning, gateway limits, caching, real-world scan and flash times, and target KPIs.

## Read this first: limits of this research

- **The web-search budget ran out before I made a single useful search.** Every search call was refused. I could not use search to discover forum threads, Reddit posts or conference talks.
- **What I did instead:** I fetched 47 pages from URLs I already knew to be stable. These were vendor docs, official platform docs, Wikipedia, protocol tutorials, GitHub READMEs and two PDF manuals read as text. Another 12 fetch attempts failed (404, 403, redirect, oversize); they are listed in the ledger notes below and are not counted as read.
- **What this means:**
  - Hard protocol and platform numbers are well covered.
  - **Real-world full-scan times for ISTA, BimmerCode, Carly, OBDeleven and Autel are NOT covered.** I found no usable timing for any of them. Anything I say about them is a gap, not a finding.
  - Flash times: one vendor page only (MHD). No bootmod3 numbers.
- Numbers marked **(derived)** are my own arithmetic from cited inputs. They are not measurements.
- Source IDs like [S5] point to the ledger at the end.
- No proprietary data, seed-key algorithms or leaked software were opened or used.

---

## Summary

1. **The biggest speed lever is not the radio. It is waiting.** ELM327 waits up to a default 200 ms timeout after the last reply to a request; adaptive timing shortens this, and the datasheet's own example still tops out near 6 reads per second [S25]. (Fact-check 2026-11-20: reworded from "a fixed 200 ms after every request", which overstated the datasheet.) Telling the adapter how many replies to expect, and tuning its timeout, took one ELM example from about 6 to 10-12 reads per second [S25]. The vendor's own numbers.
2. **ISO-TP pacing can cap a transfer at 7 kB/s or less.** STmin of 1 ms means at most one 7-byte frame per millisecond. Unlimited pacing on 500 kbit/s CAN gives about 27-31 kB/s (derived). One public tool report shows about 27 kB/s over 500 kbit/s CAN [S26], which matches.
3. **Block size 0 and STmin 0 are the fast settings,** but the receiver (the car) decides them. The tester can only ignore them if it accepts the risk. The python ISO-TP library has an explicit override for this [S5].
4. **A 500 kbit/s CAN bus can carry roughly 4,000 frames a second at best** (derived from the bit counts in [S12]). Cars already use some of that. Wikipedia says 70-80% load is reachable for well-designed buses before deadlines slip [S12].
5. **BLE round trips are bounded by the connection interval.** iOS will not go below 15 ms for ordinary apps; Android can go to 7.5 ms [S4, S36]. A request and reply therefore costs roughly one to two intervals (derived), about 15-30 ms on iPhone before the ECU does any work.
6. **BLE bulk speed is fine if configured.** With a bigger packet size, newer phones reached about 50 kB/s [S36]. Default settings are far lower. Android 14 now forces a 517-byte MTU request on the first request [S19, S37].
7. **Wired Ethernet (ENET/DoIP) removes the radio and CAN limits,** but I found no measured DoIP throughput. BMW F-series and newer use HSFZ or DoIP over ENET [S45]. DoIP announcement, routing activation and 2 s default timeouts matter for connect time [S33].
8. **Flash speed numbers are thin.** MHD claims first install 3-15 minutes and later changes 10 seconds to 2 minutes, with E-series slower than F/G [S46]. That is one marketing page. CAN FD is said to make flashing more than 4x faster [S22].
9. **Gateways and polite polling disagree.** One source says wait 300-500 ms between OBD2 requests [S14]. The ELM maker says modern vehicles allow the next request right after a complete answer [S25]. This is an open conflict.
10. **Caching and parallelism are mostly untested in public sources.** The one hard hint: EdiabasLib says the first call of a job is slow and later ones are faster [S15]. Everything else on caching and parallel scans in this document is design reasoning, labelled as such.

---

## What I found

### 1. ISO-TP: STmin, block size and what they cost

**How it works.** A long message is split into a first frame and consecutive frames. The receiver sends a flow control frame saying how many frames to send before pausing (block size) and the minimum gap between them (STmin) [S1, S6].

- Single frame carries up to 7 bytes in normal addressing [S1].
- Block size 0 means send everything without further flow control [S1, S5].
- STmin: 0x00-0x7F is 0-127 ms. 0xF1-0xF9 is 100-900 microseconds [S1].
- Separation time is nominally end of one frame to start of next. Wikipedia notes a robust receiver should also accept senders who count start-to-start [S1]. Single source on that point, but it matters for tuning: different ECUs may measure differently.
- A 4095-byte message needs 586 CAN frames [S26]. The 2016 revision allows far larger messages [S1].

**Timeouts.** In the python ISO-TP library, the defaults for waiting on a flow control frame and on the next consecutive frame are both 1000 ms [S5]. A wait-frame limit exists and defaults to 0 (waits unsupported) [S5]. These do not change steady-state speed but decide how long a stall lasts before failure.

**Sender override.** The same library lets the sender override the receiver's STmin ("Setting 0 sends as fast as possible") [S5]. It also offers a rate limiter, and notes that its limit counts payload only, so real bus load is 1-1.5x higher [S5]. That is useful: we can cap our own aggression.

**Tester-side flow control.** CSS Electronics says to send flow control within roughly 0-50 ms of the first frame and that ECUs time out otherwise [S6]. It gives no exact ECU limit. The simplest flow control payload is "30 00 00" meaning continue, no block limit, no delay [S6].

**Derived throughput on 500 kbit/s classical CAN** (derived from [S12] frame sizes and [S1] payload size):

| Case | Frame cost | Payload per frame | Approx rate |
|---|---|---|---|
| Best case, no stuffing | 111 bits (8n+44 plus 3 gap) = 222 microseconds | 7 bytes | about 31 kB/s |
| Worst-case stuffing | about 135 bits = 270 microseconds | 7 bytes | about 26 kB/s |
| STmin = 1 ms | gap dominates | 7 bytes | at most 7 kB/s |
| STmin = 5 ms | gap dominates | 7 bytes | at most 1.4 kB/s |
| Block size 8, 1 ms flow control turn-around | 8 frames about 1.8 ms plus about 1 ms | 56 bytes per block | about 20 kB/s |

The one external check: a README reports roughly 27 kB/s moving a file over a 500 kbit/s CAN link with ISO-TP sockets [S26]. This sits inside the derived range, so the model is believable, but it is one report.

**What this means for OpenDiag.** For reads (fault memory, identification) messages are tiny: tens to a few hundred bytes. Pacing barely matters; the request/response turn-around does. Pacing matters mostly for flashing and large data reads.

### 2. CAN bus load

- A base frame is 8n+44 bits before stuffing, up to 132 bits worst case with 8 data bytes. Extended frames are 8n+64, up to 157 worst case [S12].
- At 500 kbit/s a worst-case base frame is about 264 microseconds, so the ceiling is roughly 1,900-4,500 frames/s depending on size and stuffing (derived).
- Wikipedia: 70-80% bus use is typically reachable before deadlines are missed when IDs are assigned by deadline; early designs needed about 30% [S12]. This is general CAN theory, not a statement about BMW.
- CSS Electronics says OEM-specific broadcast data is typically about 1000-2000 frames/s [S14]. That is already a large share of a 500 kbit/s bus, with an unknown BMW figure.
- A diagnostic tool that stays quiet matters: lost arbitration is non-destructive, but a mismatched or misbehaving node causes error frames, retries and even bus-off [S42]. A tool with slightly wrong bit timing can cause 0-1% frame loss [S42].
- The Linux can-utils README lists a bus load measurement tool [S38]. It does not explain how it computes load. We should measure load ourselves in tests.

**Implication.** Scanning many ECUs at once is not free. Each query plus each response is a few hundred microseconds of bus time, and the car's own traffic is already using the bus. Parallel scanning should be bounded by a load budget, not just by what the adapter can send.

### 3. CAN FD and Ethernet

- CAN FD: data phase can go well above classical CAN. CSS cites practical 5 Mbit/s, with flashing at up to 12 Mbit/s mentioned and flash updates "more than 4x faster" [S22]. Multi-drop buses are typically limited to about 2 Mbit/s over the temperature range [S22]. Wikipedia lists up to 8 Mbit/s in its infobox but cites 5 Mbit/s in the body [S12]. **Minor disagreement between S12 and S22 on the ceiling.**
- Efficiency: classical CAN has over 50% overhead; FD at 64 data bytes reaches about 90% efficiency [S22].
- Automotive Ethernet is a family from 100 Mbit/s up to 10 Gbit/s standards [S21]. The page gives no DoIP or flashing numbers. The 100 Mbit/s figure for ENET is general knowledge I did not verify in a source here.
- **Gap:** no source I read gives measured end-to-end flash throughput over DoIP on a BMW. That needs measurement on the owner's car.

### 4. DoIP and BMW ENET

- DoIP flow, per python-doipclient: vehicle announcement over UDP (sent three times at power-up), optional active identification request, then routing activation on TCP, default port 13400 (3496 for TLS) [S33].
- Most ECUs need routing activation before they answer [S33].
- That client defaults to a 2 second timeout for sending a diagnostic message, and automatically reconnects TCP [S33]. Its author notes timing behaviours that would need threads are "rarely important" for quick scripts [S33]. That is a hint, not a measurement.
- EdiabasLib treats F-series and newer as using HSFZ or DoIP over ENET [S45]. The wireless ENET adapter it documents is an OpenWrt router (350 MHz MediaTek chip) giving a WiFi to Ethernet bridge [S44]. So "WiFi ENET" speed is bounded by a small router's WiFi, not by the car's 100 Mbit link. **That is a source-backed claim about one specific adapter, not all of them.**
- The BimmerCode adapter page lists many ENET WiFi adapters for F, G and I series, plus a plain ENET cable [S40]. No speed claims.

### 5. BLE: what limits it

**Connection interval.** Range 7.5 ms to 4 s [S4]. iOS minimum for normal apps is 15 ms; Android supports 7.5 ms [S4, S36]. One article says gains level off around 15 ms [S36].

**Request/response latency.** Each hop (phone to adapter, adapter to phone) can only happen at a connection event. So a command and its answer take at least one interval and often two (derived). At 15 ms that is 15-30 ms of pure radio wait per query. Over a 100-query scan that is 1.5-3 seconds of radio wait alone, before any ECU time or ELM timeout (derived).

**MTU and packet size.**
- Default ATT MTU is 23 bytes; header overhead about 13% [S3].
- iOS reaches 185-byte MTU [S3, S4]; Android up to 517 [S19, S36].
- Android 14 changed behaviour: the first MTU request becomes 517 and all later requests are ignored [S19, S37]. The page warns that peripherals that accept a bad MTU can break. Practical effect for us: do not assume you got the number you asked for; read back the result.
- MTU alone adds only about 0-15% [S3, S36].

**Data length extension and PHY.**
- Data length extension (BLE 4.2) raises the packet from 27 to 251 bytes [S4, S36]. 2M PHY (BLE 5) roughly doubles raw rate [S4, S20].
- Memfault's calculated (not measured) figures: about 0.30 Mbit/s at 1M PHY without DLE, about 0.80 Mbit/s with DLE, about 1.43 Mbit/s with DLE and 2M PHY [S4].
- Novel Bits calculated up to about 1.3-1.4 Mbit/s with 2M PHY, big MTU and long intervals [S31].
- Punch Through measured about 50 kB/s on newer Android and iOS phones with DLE on 1M PHY [S36].
- Memfault calculates only about 12 kB/s for an iPhone at 15 ms with 7 packets per interval [S4]. That is a calculated figure for older settings. **Disagreement:** 12 kB/s (calculated, older) versus 50 kB/s (measured, newer). The difference is plausible given DLE.

**Does BLE speed matter for diagnostics?** For reads, no: responses are small. 50 kB/s is plenty. What matters is the number of round trips and the interval. For flashing a few megabytes over BLE it would matter, which is why tuners use ENET.

**The OBDLink CX specifically.** It is Bluetooth 5.1 BLE [S10]. The FRPM manual lists it as STN2310, "OBD to BLE" [S41]. The product page gives no throughput or latency figures [S10]. It also does not name the radio chip; the FCC ID it lists suggests a Dialog DA14531 module, but that is my inference, not stated [S10].

**iOS background.** Apps get about 10 seconds when woken in the background and scanning slows when all apps are in the background [S24]. A long scan should not rely on the app being backgrounded.

### 6. ELM327 and STN timing tricks (primary source: the ELM327 datasheet)

All from the manufacturer datasheet [S25] unless noted.

- **Default timeout is 200 ms.** It is also used after every response, to see if more are coming. If a normal response takes 50 ms, the fastest possible scan is only about 4 queries per second.
- **AT ST hh sets the timeout in units of 4 ms.** Setting it near 100 ms almost doubles the rate to about 7 per second.
- **Adaptive timing** (AT AT0/1/2) measures real response times and sets the timeout, never longer than AT ST. Default is AT1; AT2 is more aggressive; J1939 does not support it. Worked example: a slow ECU at 58 ms pushes the timeout to about 90 ms, so about 6 reads/s.
- **Response count digit.** Add a hex digit after the request ("01 00 2") and the adapter returns as soon as that many replies arrive, skipping the final timeout. Their example: from about 6 to 10-12 per second.
- **Caution from the maker:** a count that is too low can leave protocol acknowledgements unsent and create network congestion. Before J1979 (April 2002), requests faster than every 100 ms were forbidden on J1850; after it, the next request may follow once all replies were received. Older cars may not cope [S25].
- **CAF1** (CAN auto formatting, default on) strips ISO-TP framing bytes and reassembles multi-frame data. CAF0 shows raw frames. With H1 and CAF1 together the output formatting is more complicated [S25].
- **Filters and masks** (AT CF, AT CM, AT CRA) restrict which received IDs get passed. AT CRA 7EX lets 7E0-7EF through [S25]. Fewer irrelevant frames means less to parse over a slow serial or radio link.
- **High baud rates:** AT BRD changes the serial rate with a test handshake and falls back if the test fails [S25]. v1.2 adjustable up to 500 kbit/s; v2.0 raised the transmit buffer to 512 bytes [S11].
- **OBD buffer note:** only the first 12 received bytes are stored in the ELM327 OBD buffer [S25].

**STN (OBDLink) extensions** [S41]:
- Compatible with ELM327 AT commands; adaptive timing has three modes with a "safety buffer"; mode 2 uses a smaller buffer and is faster but risks missed frames. **The adapter always waits the full ST/STPTO timeout for the first frame** [S41]. So first-response timeout is the lever for slow ECUs; adaptive timing only trims the tail.
- **STPX** sends a request with header, data, per-command timeout (t) and expected response count (r) in one command [S41]. This is the cleanest way to avoid global timeout changes between different ECUs.
- **CAN segmentation (STCSEGT) and flow control address pairs (STCFCPA)** let the adapter handle multi-frame transmit and flow control. Default separation time is the ECU's STmin from the flow control frame; raw CAN inter-frame delay defaults to 1 ms [S41].
- **STBR** can set the UART up to 2 Mbps on STN2100/2120/1110/1170 class devices; maximum message sizes are 4k (MX+, EX class) or 2k (older) [S41].
- **Pass/block filters (STFPA)** exist for receive filtering [S41].
- **Gap:** I did not find how the OBDLink CX's BLE link is configured (interval, MTU) in any source.

**ELM327 clones.** They reuse the v1.4 firmware, may misreport their version, and inherit its flaws [S11]. EdiabasLib recommends genuine 1.4b, 1.5 or original 2.1, warns that fake 1.5 units fail, and that ARM-based clones are often not fully compatible [S45]. **Implication:** speed tuning cannot be assumed to work on cheap clones.

### 7. UDS timers and the 0x78 response

- UDS NRC 0x78 means "request received, response pending" [S2].
- In udsoncan, defaults are: wait up to 1 s for first answer, 5 s after a 0x78, and a hard 5 s cap [S8]. Servers can announce their own timings in the session control reply, and the client can use those [S8].
- A tester in a non-default session must send tester-present periodically [S6]. Also a timing cost: it takes bus time and a request slot.
- **Implication:** for slow ECUs the fix is not a bigger global timeout. Use per-ECU learned timeouts (see below).

### 8. OBD-II request patterns and gateway politeness

- Functional requests go to 0x7DF; physical to 0x7E0-0x7E7; responses at +8 [S13, S14].
- Physical addressing avoids multiple responders [S14].
- Up to six PIDs can be requested in one Mode 01 message [S14]. CSS advises against it for practical logging [S14]. The reasons given are not fully stated.
- CSS advice: space OBD2 requests by 300-500 ms because flooding may stop ECUs responding [S14]. **Conflict with ELM maker advice** that the next request can go immediately after a complete reply [S25]. The ELM text is about J1850 and J1979 rules; CSS is about logging on CAN. Neither is about BMW-specific diagnostic (UDS) addressing. Unresolved.
- OBD-II is the emission-related layer. BMW-specific coding and fault reads use UDS/BMW-FAST on physical addresses, not 0x7DF [S15, S45].

### 9. Older buses are slow, and that is physics

- K-line (KWP2000 / ISO 9141) runs 1.2-10.4 kbaud and needs timing-critical wakeups [S28, S29]. J1850 is 10.4 or 41.6 kbit/s [S28].
- BMW pre-2007 (E-series with DS2 and K-line) is therefore much slower than D-CAN or ENET cars. EdiabasLib says E-series DS2 cars need an OBD pin 7+8 connection [S45]. MHD says E-series cars flash slower than F and G [S46].
- OBD-II on CAN is 250 or 500 kbit/s [S28]. Do not expect a fix from the adapter on slow-bus cars.

### 10. Parallel scanning and caching (what the sources do and do not say)

**Sources that touch it:** very few.
- EdiabasLib: first job call slow, later ones faster [S15]. It is a software cache effect in one library. No numbers.
- python-obd is request/reply, and its docs say data rate depends on how often you query [S23].
- python-doipclient notes it is not threaded [S33].
- A Linux ISO-TP socket write blocks while a transfer is in progress, and the README lists that as a known limitation [S26]. That means per-socket serialisation is the norm.

**No public source I read reports a full BMW vehicle scan time or compares sequential and parallel scanning.** What follows is design reasoning, not findings.

**Why parallel should help (derived).**
- On ENET each ECU has its own logical address. A sequential scan of N addresses with a timeout T for silent ones costs N x T for the missing ones. With 60 candidate addresses and a 200 ms timeout that is 12 s of dead waiting (derived). Sending to several addresses at once, then waiting once, cuts that to about one timeout.
- Over a single serial or BLE link into CAN there is only one bus and one adapter queue. Parallelism is limited. The win there is **pipelining** (send the next request before the last reply is finished, if the adapter and gateway allow) and **per-request response counts**, not true parallel.
- Caching: the set of modules a car has (the vehicle order) hardly changes between sessions. Remembering it per VIN removes most of the "who is there" probing. Caching identification strings (part numbers, versions) is safe until a flash happens.

**Risks (unsourced reasoning):** a gateway may limit simultaneous tester connections or sessions. Many ECUs reject a second session. I found no source that quantifies this.

### 11. Real-world times reported

| Item | Reported | Source | Quality |
|---|---|---|---|
| ELM327 scan rate at defaults | about 4/s; about 6/s with adaptive; 10-12/s with response count | S25 | High (maker's own numbers, J1850 example) |
| MHD first flash | 3-15 minutes | S46 | Low-medium (vendor marketing, one page) |
| MHD later map/option changes | 10 s to 2 min | S46 | Low-medium |
| E-series vs F/G flashing | E slower | S46 | Low-medium |
| CAN FD flashing | "more than 4x faster" | S22 | Medium (secondary, general) |
| ISO-TP over 500k CAN | about 27 kB/s | S26 | Medium (README report, one case) |
| BLE phone throughput | about 50 kB/s (newer phones, DLE) | S36 | Medium (one author's testing) |
| ISTA / BimmerCode / Carly / OBDeleven / Autel full scan | **Not found** | S17, S18, S47 had none | n/a |
| Bootmod3 flash time | **Not found** (page was an empty web app) | S30 | n/a |

BimmerCode's front page and adapter page give no timing [S17, S40]. Carly's page says it "reads all available vehicle data" at ignition-on with no duration [S18]. Autel's front page gives nothing technical [S47].

---

## Evidence quality and disagreements

**Strongest evidence:**
- The ELM327 datasheet [S25] and OBDLink command manual [S41]. Primary, detailed, numbers given. But they describe the adapters' rules, not BMW ECU behaviour.
- Platform docs for Android BLE [S19, S37]. Primary.
- Wikipedia pages are sound for protocol structure [S1, S2, S12, S13, S28]. They are secondary.

**Weak or single-source:**
- All flash times (one vendor page).
- All "real-world" scan times (none found).
- STmin start-to-start versus end-to-start (one Wikipedia remark).
- DoIP timing (one client's defaults, not the standard).
- The BLE throughput numbers: three sources, but two are calculated and one is a single author's test.

**Disagreements:**
1. **Polite polling.** 300-500 ms between OBD2 requests [S14] versus immediate next request after a full reply [S25]. Different contexts; not resolved.
2. **BLE phone throughput.** Calculated about 12 kB/s on iPhone [S4] versus measured about 50 kB/s [S36]. Likely differences in packet length and phone generation, but unproven.
3. **CAN FD ceiling.** 8 Mbit/s in one place, 5 in another [S12 versus S22 and S12 body]. Not important for us; a BMW tester will see whatever the car uses.

**Not verified anywhere:** that OBDLink CX uses a particular radio chip; BMW gateway request limits; any ISTA scan time; ENET real throughput.


---

## Implications for OpenDiag

### Build

1. **A per-adapter, per-ECU timing profile.**
   - Learn the first-response time of each ECU on first contact and store it.
   - Use the learned value plus margin as that ECU's timeout (STPX supports a per-command timeout and response count [S41]).
   - Keep a fixed slow default (about 200 ms, as the ELM maker uses [S25]) only for unknown ECUs.
2. **Always send the expected response count** where known (single reply for most reads). It removes the final wait [S25, S41].
3. **Vehicle profile cache keyed by VIN.**
   - Cache the list of modules that answered, their addresses, and their identification data.
   - Invalidate after any write, coding or flash.
   - This turns a "who is there" scan into a quick confirm.
4. **Two scan modes.**
   - Fast confirm: only cached modules.
   - Full discovery: probe all candidates, in parallel on ENET and in rate-limited pipelined batches on serial/BLE.
5. **Bus load budget.** A configurable cap on tool-generated traffic (suggested start: stay well under 30% of the bus, treating it as a safety setting rather than a performance setting). Use the python ISO-TP rate limiter idea [S5] as a design reference. The 30% figure is my proposal, not a sourced limit.
6. **Adapter capability probe on connect.**
   - Detect ELM versus STN (ATI/STI), the supported baud, and whether STPX exists.
   - On STN, raise the UART speed with the fallback handshake [S41].
   - Refuse to assume clone behaviour [S11, S45].
7. **BLE session setup:** request high-priority connection parameters on Android [S19], request MTU once and read back what was granted [S37], prefer write-without-response and notifications, queue GATT operations strictly one at a time. On iOS accept the 15 ms floor [S4, S36].
8. **ISO-TP engine (for ENET or CAN direct):** honour the car's STmin and block size by default, expose an expert override [S5], use microsecond STmin codes [S1], and keep the 1 s flow-control timeout default [S5].
9. **0x78 handling:** treat as "keep waiting", with a long ceiling and tester-present as needed [S2, S8].
10. **Prefer ENET for anything large** (flash, big reads). Treat BLE as the convenience path for reads and coding, as coding payloads are tiny.

### Avoid

- **Do not turn off adaptive timing globally,** and do not set a very small fixed timeout [S25].
- **Do not assume faster polling is safe on older cars** [S25]. Gate aggressive pacing on vehicle generation.
- **Do not send raw functional broadcasts and then multi-frame requests to 0x7DF** [S13].
- **Do not trust MTU and interval values you asked for.**
- **Do not build parallel scanning on one BLE/serial adapter and expect a big win.** It is pipelining there.
- **Do not claim "X times faster than ISTA/BimmerCode"** until measured on a real car. No public numbers exist in what I read.

### Measure (target KPIs)

Because I found no competitor numbers, these are **proposed targets to be validated on the owner's car**, with each one's basis stated.

| KPI | Proposed target | Basis |
|---|---|---|
| Single read, request to answer, ENET | under 30 ms median | Derived: no radio, 100 Mbit link; unvalidated |
| Single read, BLE (iPhone), request to answer | under 60 ms median, under 120 ms p95 | Derived: 1-2 x 15 ms interval [S4, S36] plus ECU time |
| Same on Android with high-priority interval | under 40 ms median | Derived: 7.5 ms floor [S36] |
| Cached-vehicle quick scan (module list confirm), ENET | under 3 s | Design target |
| Cached-vehicle quick scan, BLE | under 10 s | Design target |
| First-time full discovery, ENET | under 20 s | Derived: removes the N x T dead wait |
| Fault-code read per module | one request, one count-limited reply | [S25, S41] |
| Wasted wait ratio (time spent in timeouts / total) | under 10% | Directly addresses the 200 ms problem [S25] |
| Tool-generated bus load | measured; hard cap configurable | [S12, S42] |
| Sustained ISO-TP transfer on 500k CAN, STmin 0 | at least 20 kB/s | Derived 26-31 kB/s [S12, S1]; reported 27 [S26] |
| ISO-TP with car's STmin 1 ms | about 7 kB/s (expected, not a failure) | Derived |
| BLE sustained bulk | at least 30 kB/s on a current phone | [S36] reports about 50 |
| Flash, ENET, small map change | match or beat 10 s - 2 min | [S46] (vendor claim) |
| Flash, ENET, first full install | within 3-15 minutes | [S46] (vendor claim) |
| Connect to ready (ENET: announcement plus activation) | under 2 s | [S33] default timeouts are 2 s |

**How to measure honestly:**
- Add a built-in trace that records, per request: send time, first byte, last byte, timeout hit or not, retries, adapter type.
- Log timeouts hit versus timeouts needed. That shows wasted wait directly.
- Run the same scan on the owner's three adapters: OBDLink CX (BLE), WiFi ENET, and wired ENET if available. Run BimmerCode and ISTA on the same car the same day and record their times by stopwatch, since no public numbers exist.
- Record phone model and OS, since MTU and interval depend on them [S37].

---

## Open questions

1. How long does a full ISTA scan, BimmerCode module list, Carly scan, OBDeleven "full scan" and an Autel auto scan take on a BMW F/G car? **No data found.** First measurement task for the owner.
2. What do real bootmod3 flash times look like over ENET versus OBDLink? Not found.
3. What does a BMW gateway do with simultaneous requests: queue, drop, or reject? Not found.
4. Which STmin and block size do common BMW ECUs request? Not found; measure from a capture.
5. DoIP: measured throughput and per-message latency on a BMW ENET link. Not found.
6. What connection interval and MTU does the OBDLink CX actually negotiate with iOS and with Android? Not found.
7. Is the 300-500 ms OBD2 spacing advice [S14] needed on modern BMWs? Needs a test.
8. Does the WiFi ENET adapter (small OpenWrt-class router [S44]) become the bottleneck for bulk transfers? Plausible, unmeasured.
9. Forum evidence (Bimmerpost, Bimmerfest, F30Post, G20, E90Post, Reddit and others) and conference talks: **not reached because search was unavailable.** Rerun this topic once search is back.

---

## Source ledger

All 47 rows were fetched and read (two PDFs were converted to text locally). Reliability is for the specific claims I used.

| # | URL | Type | What it told us | Reliability |
|---|---|---|---|---|
| S1 | https://en.wikipedia.org/wiki/ISO_15765-2 | Encyclopedia | STmin and block size encoding, 7-byte single frame, message size limits, start-to-start remark | Med-high |
| S2 | https://en.wikipedia.org/wiki/Unified_Diagnostic_Services | Encyclopedia | UDS service list, NRC 0x78 and busy codes | Med-high |
| S3 | http://punchthrough.com/maximizing-ble-throughput-part-2-use-larger-att-mtu/ | Engineering blog | Default MTU 23, iOS 185, MTU gain 0-15% | Med |
| S4 | https://interrupt.memfault.com/blog/ble-throughput-primer | Engineering blog | Calculated BLE throughput by MTU, DLE, PHY; 15 ms iOS floor; iOS 7 packets per interval | Med (calculated, one figure inconsistent) |
| S5 | https://can-isotp.readthedocs.io/en/latest/isotp/implementation.html | Library docs | Default STmin, block size, timeouts, override of receiver STmin, rate limiter | High |
| S6 | https://www.csselectronics.com/pages/uds-protocol-tutorial-unified-diagnostic-services | Vendor tutorial | ISO-TP frames, flow control timing guidance, tester present | Med |
| S7 | https://www.csselectronics.com/pages/can-bus-simple-intro-tutorial | Vendor tutorial | CAN bit rates, arbitration, no bus-load figures | Med |
| S8 | https://udsoncan.readthedocs.io/en/latest/udsoncan/client.html | Library docs | Default client timers: 1 s, 5 s, 5 s cap; 0x78 handling | High |
| S9 | https://www.kernel.org/doc/html/latest/networking/can.html | Official docs | SocketCAN filters and timestamps; no ISO-TP details | High (for what it covers) |
| S10 | https://www.obdlink.com/products/obdlink-cx/ | Vendor page | CX is BLE 5.1; no throughput or latency figures | High for specs, none for speed |
| S11 | https://en.wikipedia.org/wiki/ELM327 | Encyclopedia | Clone behaviour, firmware history, baud rates | Med |
| S12 | https://en.wikipedia.org/wiki/CAN_bus | Encyclopedia | Frame bit counts, bit stuffing, bus load guidance, CAN FD rates | Med-high |
| S13 | https://en.wikipedia.org/wiki/OBD-II_PIDs | Encyclopedia | 7DF/7E0/7E8 addressing, Mode 03 | Med-high |
| S14 | https://www.csselectronics.com/pages/obd2-explained-simple-intro | Vendor tutorial | 300-500 ms spacing advice, ID layout, frames per query | Med |
| S15 | https://github.com/uholeschak/ediabaslib | GitHub README | Adapter types, "first job call is slow" | Med |
| S16 | https://github.com/driftregion/iso14229 | GitHub README | UDS library overview; no timing | Med (no speed content) |
| S17 | https://www.bimmercode.app/ | Vendor page | No timing; ratings only | High (that it is empty on speed) |
| S18 | https://www.mycarly.com/ | Vendor page | No scan duration | High (that it is empty on speed) |
| S19 | https://developer.android.com/reference/android/bluetooth/BluetoothGatt | Official docs | High-priority connection request, MTU 517 note | High |
| S20 | https://en.wikipedia.org/wiki/Bluetooth_Low_Energy | Encyclopedia | PHY rates, goodput range | Med |
| S21 | https://en.wikipedia.org/wiki/Automotive_Ethernet | Encyclopedia | Automotive Ethernet family; no DoIP content | Med |
| S22 | https://www.csselectronics.com/pages/can-fd-flexible-data-rate-intro | Vendor tutorial | CAN FD efficiency and flash speedup claims | Med |
| S23 | https://python-obd.readthedocs.io/en/latest/ | Library docs | Request-reply model; no numbers | Med |
| S24 | https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/CoreBluetoothBackgroundProcessingForIOSApps/PerformingTasksWhileYourAppIsInTheBackground.html | Official docs (archive) | iOS background limits, about 10 s wake window | High (archived, may be dated) |
| S25 | https://www.elmelectronics.com/wp-content/uploads/2016/07/ELM327DS.pdf | Vendor datasheet (PDF read as text) | AT ST, adaptive timing, response count digit, scan-rate examples, J1979 pacing caution | High |
| S26 | https://github.com/hartkopp/can-isotp | GitHub README (README only) | 586 frames per 4095 bytes; about 27 kB/s over 500k CAN | Med |
| S27 | https://github.com/commaai/panda | GitHub README | CAN/CAN FD hardware; no latency figures | Med (little relevant) |
| S28 | https://en.wikipedia.org/wiki/On-board_diagnostics | Encyclopedia | Legislated protocols and their bit rates | Med-high |
| S29 | https://en.wikipedia.org/wiki/Keyword_Protocol_2000 | Encyclopedia | K-line 1.2-10.4 kbaud, wakeup sequences | Med |
| S30 | https://www.bootmod3.net/ | Vendor web app | Page loaded but had no content | Low (nothing learned) |
| S31 | https://novelbits.io/bluetooth-5-speed-maximum-throughput/ | Engineering blog | Calculated BLE 5 throughput cases; arithmetic inconsistencies | Low-med |
| S32 | https://github.com/pylessard/python-can-isotp | GitHub README | Library overview only | Med (little relevant) |
| S33 | https://python-doipclient.readthedocs.io/en/latest/ | Library docs | DoIP discovery, routing activation, ports, default timeouts | Med-high |
| S34 | https://developer.android.com/develop/connectivity/bluetooth/ble/transfer-ble-data | Official docs | Basic GATT read/notify flow; no throughput guidance | High (little relevant) |
| S35 | https://github.com/commaai/opendbc | GitHub README | Nothing on diagnostics timing | Med (little relevant) |
| S36 | https://punchthrough.com/ble-throughput-part-4/ | Engineering blog | Interval floors 7.5 ms Android / 15 ms iOS, about 50 kB/s measured with DLE, PHY gains | Med |
| S37 | https://developer.android.com/about/versions/14/behavior-changes-all | Official docs | Android 14 forces 517-byte MTU on first request | High |
| S38 | https://github.com/linux-can/can-utils | GitHub README (README only) | Tool list including bus load and ISO-TP tools | Med |
| S39 | https://github.com/uholeschak/ediabaslib/wiki | GitHub wiki | Same adapter and job-caching remarks | Med |
| S40 | https://www.bimmercode.app/adapters | Vendor page | Adapter list incl. ENET WiFi; no speed claims | High (list), none for speed |
| S41 | https://www.scantool.net/scantool/downloads/682/obdlink_frpm_f.pdf | Vendor manual (PDF read as text) | STN adaptive timing, STPX, segmentation, STBR to 2 Mbps, CX is STN2310 | High |
| S42 | https://www.csselectronics.com/pages/can-bus-errors-intro-tutorial | Vendor tutorial | Error frames, retransmission, bit timing mismatch effects | Med |
| S43 | https://www.obdlink.com/products/obdlink-mxp/ | Vendor page | "Fastest" marketing claim, no figures | Low for speed |
| S44 | https://github.com/uholeschak/ediabaslib/blob/master/docs/ENET_WiFi_Adapter.md | GitHub doc | ENET WiFi adapter is an OpenWrt-class router; setup notes | Med |
| S45 | https://github.com/uholeschak/ediabaslib/blob/master/docs/AdapterTypes.md | GitHub doc | Adapter compatibility; ELM clone warnings; F-series uses HSFZ/DoIP | Med |
| S46 | https://www.mhdtuning.com/ | Tuner vendor page | First flash 3-15 min; later changes 10 s-2 min; E-series slower | Low-med (marketing) |
| S47 | https://www.autel.com/ | Vendor page | No technical or timing claims | High (that it is empty on speed) |

**Fetch attempts that failed (not counted above):** en.wikipedia.org/wiki/Diagnostics_over_IP (404); elmelectronics.com/help/obd/tips/ (404); bimmercode.app/help (404); Apple Accessory Design Guidelines PDF (too large); obdeleven.com (403); support.mycarly.com (403); support.protuningfreaks.com (no such host); en.wikipedia.org/wiki/ISO_13400 (404); obdlink.com/products/obdlink-mx-bluetooth/ (404); Bluetooth 5.2 feature overview PDF (403); elmelectronics.com/ic/elm327/ (404); CSS CAN sniffer tutorial (404). The ELM tips and Apple guideline pages would have been useful for follow-up.
