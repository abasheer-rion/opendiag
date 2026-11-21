# OpenDiag UI and interaction spec

Written 2026-11-20. Status: **design proposal for the owner to veto, one section PARTIAL** (see Gaps). Nothing here has been shown to a user. Not legal advice.
Reads: `docs/design/ui/ui-library-decision.md` (UL), `docs/plan/features.md` (F-numbers), `docs/plan/architecture-v2.md` (AV2), `docs/research/deep2/ux-teardown-and-safety-ux.md` (UX, patterns D1 to D20 and X1 to X18), `docs/plan/kpis.md`, `docs/plan/decisions.md`.
Clean-room: no OEM screens, wording, icons or files were used. All microcopy below is written fresh for OpenDiag. Competitor behaviour is cited only from the UX teardown, which read public pages.

Confidence tags: **high** = read on a primary page this run, or a binding repo decision; **medium** = one secondary source, or the repo's own research; **low** = my design judgement. Almost everything in sections 1 to 12 is **low** (design proposal) unless a row cites a source. Contrast ratios in section 10 were **computed by script this run** (high for the arithmetic, medium for the rule that sets the threshold).

---

## Executive summary

1. **One sentence:** a calm workshop instrument that scans the whole car, explains each fault in plain English with its source, and treats every change as something that must be previewed, backed up, verified and undoable.
2. **Two builds, one UI.** Public build: 11 screens, no write UI exists in the bundle (decision 6, AV2 L0). Lab build: adds one flow, "Bench write", on the simulator and a bench module only. Real-car writes are not designed here (decision 2).
3. **Information architecture:** left rail with 7 destinations (Car, Modules, Faults, Live, Snapshots, History, Adapter), top bar with car, adapter, battery voltage and a non-dismissible mode banner, optional right detail pane.
4. **Risky-action flow** has 10 numbered states from preflight to rollback (section 7). The typed-confirm step appears only for bench writes and restores. Buttons name outcomes. No button is preselected. No "safe" or "cannot brick" wording anywhere (UX X4).
5. **Connection loss** is a first-class state in every screen (section 9): the UI never shows frozen data as live, never retries a write, and always says what state the module is in.
6. **Tokens:** light and dark, 5 status colours each paired with an icon and a word. Every text pair in section 10 was computed and passes WCAG AA (4.5:1). Border and focus pairs pass 3:1.
7. **KPI ties:** G6 (plain-English faults), G8 (5-minute clone to first read) and G10 (finish without retry) each have acceptance items and a log event the UI must emit (section 14).
8. **Biggest risks:** fault text will be missing for most BMW codes at first (G6 is data-bound), so "No description yet" must look designed, not broken; the CX may reach few modules (A2), so partial scan results are a core state; whether cancel is safe mid-write is unknown (UX section 8), so the default is no cancel.
9. **Owner decisions needed:** (a) approve the look in section 3 and 10, (b) confirm the typed-confirm string format (section 7.5), (c) clear-faults placement (Q5 in AV2): this spec follows AV2 and shows no clear button in the public build.

---

## 1. Design principles

Ten rules. Each one is testable. Numbers in brackets point to the pattern in UX that supports it.

| # | Principle | What it means on screen | Test |
|---|---|---|---|
| P1 | **Read first, change later** | First run offers scan, faults, live data, snapshot only [D16]. Write UI does not exist in the public build [D19, AV2 L0] | Bundle audit finds no write screen strings (UL F16) |
| P2 | **Say it in plain English, show the code too** | Every fault row: plain sentence first, raw code second. Raw hex one click away. Never a bare code [X9] | Every error and fault component has a `plain` slot that cannot be empty |
| P3 | **Honest about what we do not know** | "No description yet", "Not read", "This adapter cannot reach this module". Never a guessed severity [X11] | No component renders a value without a source or an explicit unknown state |
| P4 | **Nothing is only colour** | Status = icon + word + colour [UL F4]. Greyscale render must remain readable | Greyscale screenshot check passes |
| P5 | **Undo before warning** | Prefer a restorable snapshot over a confirmation dialog [Raskin, via UX 6.4]. Routine reads and snapshots get no confirmation [X1] | No "Are you sure?" on any read action |
| P6 | **Confirm rarely, confirm the target** | Typed confirm only for bench writes and restores, and the typed text contains module and short VIN or bench ID [D7, X2] | Exactly 2 flows use typed confirm |
| P7 | **Buttons name outcomes** | "Write 3 options to FEM", "Keep current coding". No "OK", "Yes", "Continue" in risky dialogs. No default highlight on the destructive one [D8, X3] | Lint on dialog button labels |
| P8 | **Never lie about liveness** | A value that stopped updating is dimmed and labelled with its age. A frozen needle is a lie | Pull the link in the simulator; every live value changes state within 2 s |
| P9 | **A failure never vanishes** | No toast for anything a person might need later. Failures stay in a result banner and in History [UL section 9: toast-only rejected] | No safety-relevant message rendered as a toast |
| P10 | **Local, owned, exportable** | No account, no cloud, no telemetry by default. Snapshots, history and dashboards are files the person can export [D13, D17] | Works with network off (UL F14) |

Not principles, but constraints carried in: free, Apache-2.0 (decisions 1), no GPL dependency, UL stack (React 19, Tailwind 4, shadcn on Base UI, TanStack Table 9, uPlot, Lucide, Inter, JetBrains Mono).

---

## 2. Audience and tone

### 2.1 Who it is for

From `direction.md` segments (via features.md): **S1** BMW enthusiast who codes (the owner), **S2** DIY owner doing light jobs, **S3** cost-resentful scanner user, **S4** tinkerer and contributor. S5 shops and S6 other brands are not targets in the window. Evidence for S1 and S2 is the strongest; S3 and S4 matter for G9. Confidence: medium (direction doc grades).

| Persona (my shorthand, not a research artefact) | Knows | Does not know | UI consequence |
|---|---|---|---|
| **Owner-tinkerer** (S1) | What a module and coding are; has used another coding app | What our app guarantees | Dense by default is fine; raw bytes one click away; never patronising |
| **DIY owner** (S2) | A warning light came on | What a DTC, ECU or UDS is | Plain sentences first; glossary on hover and focus; no jargon in headings |
| **Contributor** (S4) | Git, JSON, hex | Our pack format | Source and licence zone shown per value; "help name this code" path (F35, Could) |

The owner is user number one and one person is not a market (direction doc, relayed in features.md). Persona rows are my shorthand and are not validated (low).

### 2.2 Tone rules

| Rule | Do | Do not |
|---|---|---|
| Plain, specific | "The battery voltage is 11.8 V. Changes are blocked below 12.5 V." | "Voltage requirement not satisfied." |
| No safety promises | "We read the settings twice and they matched. That is how we know the backup is good." | "Safe", "cannot brick", "guaranteed" [X4] |
| No blame | "The adapter stopped answering." | "You disconnected the adapter." |
| No fear, no jokes | State the fact, the state of the module, the next step | Emoji, exclamation marks, puns |
| Honest about limits | "We cannot read this module over this adapter." | Silent omission |
| German option names carry a gloss | "Tagfahrlicht (daytime running lights)" | Raw German alone [D18] |
| Numbers with units, once | "12.6 V", "4.1 s" | "12.6" alone |
| Sentence case, no ALL CAPS except the typed-confirm token | "Write 3 options" | "WRITE NOW" |
| Reading level | Aim for plain words; target is a reader with no car-diagnostics background. Not measured (low) | Internal names (`fan_out`, `dedup_key`) in any visible string |

Microcopy has one owner file (`apps/web/src/strings/en.ts`, proposal) so every string has a key from day one (D18, translation readiness). German gloss strings live in the pack, not the app.

---

## 3. Look and feel, summarised

(Full direction is UL section 10; this restates what the screens depend on.)

| Topic | Decision |
|---|---|
| Personality | Calm instrument. Quiet by default, loud only when a person is needed |
| Theme | Dark first, light supported, follows system, manual override, no flash on load (UL F12) |
| Accent | One accent colour, for focus, selection and primary actions only |
| Density | Compact 28 px, Default 36 px, Comfortable 48 px rows. One setting, CSS variables |
| Type | Inter variable for UI, JetBrains Mono for hex, codes, VINs, logs. Tabular figures on every live number |
| Motion | 100 to 200 ms, functional only, honours reduced motion |
| Icons | Lucide, one glyph at a time, plus our own on the same 24 px grid. Never icon alone |
| Window | Minimum 1024 x 700 for the desktop product. Narrower is the Demo car or later phone web view (section 11) |

---

## 4. Information architecture

### 4.1 Frame

```
+-----------------------------------------------------------------------------+
| MODE BANNER  Read only (public)  |  Bench write enabled - bench module only  |  full width, not dismissible
+-----------------------------------------------------------------------------+
| TOP BAR  Car: 3 Series ...A1B2 | Adapter: WiFi ENET, good | 12.6 V | Search   |
+--------+------------------------------------------------------+-------------+
| RAIL   |  MAIN AREA                                           | DETAIL PANE |
| Car    |  (screen content)                                    | (optional,  |
| Modules|                                                      |  resizable) |
| Faults |                                                      |             |
| Live   |                                                      |             |
| Snapshots                                                     |             |
| History|                                                      |             |
| Adapter|                                                      |             |
+--------+------------------------------------------------------+-------------+
| STATUS STRIP  last event, scan time, trace file, data sources                 |
+-----------------------------------------------------------------------------+
```

### 4.2 Destinations

| Rail item | Screens inside | Needs a connection? | Public | Lab |
|---|---|---|---|---|
| Car | S02 Vehicle overview | Partly (shows last known) | yes | yes |
| Modules | S03 Module list, S07 Inspect | Yes to read, no to browse saved | yes | yes |
| Faults | S04 Fault list | Yes to read, no to browse saved | yes | yes |
| Live | S05 Live data | Yes | yes | yes |
| Snapshots | S06 Backup, S08 Diff | Yes to take, no to browse | yes | yes |
| History | S13 History and audit log | No | yes | yes |
| Adapter | S01 Connect, S14 Capability report | n/a | yes | yes |
| (Lab only) Bench | S09 Bench write flow | Bench or simulator | **absent** | yes |
| Footer links | S10 Settings, S11 Simulator and Demo car, S12 Data sources | no | yes | yes |

Rules:

1. Depth is two levels at most: rail item, then screen with a detail pane. Flat and linear like BimmerCode (UX 4, 2.1).
2. A **command palette** (Cmd-K) jumps to any module, any saved snapshot, any screen, "Scan car", "Take snapshot of <module>". Palette never lists write actions in the public build.
3. **Offline browse**: Faults, Modules, Snapshots and History open from saved files with no car. A banner says "Showing saved data from <date>. Not connected."
4. Last-used rail item and panel sizes are remembered in local preferences (convenience only, UL section 8).
5. The Bench item uses the lab accent (section 10) and a "Lab" tag in the rail, so it can never be confused with the public rail.

### 4.3 Global elements (every screen)

| Element | Behaviour |
|---|---|
| **Mode banner** | Always present, never dismissible, in every route and state, including errors (UL F6). Public text: "Read only. This app cannot change anything on your car." Lab text: "Bench write enabled. Bench modules and the simulator only." Lab banner also uses a striped pattern, not colour alone (D19) |
| **Car chip** | Make, model if known, last 4 of VIN. Click copies the full VIN with text confirmation |
| **Adapter chip** | Adapter name, link type, link quality word (Good, Fair, Poor, Lost) with icon |
| **Voltage chip** | "12.6 V" with age if stale; "Voltage not available" when the adapter cannot report it (never hidden) |
| **Status strip** | Last event in plain words, trace file name, active data pack names. Clickable to Data sources |
| **Source disclosure** | Every explanatory sentence has a small "Source" control showing origin, licence zone, pack version (G11, AV2 9.2) |

---

## 5. Screen inventory

Fifteen screens. IDs are stable and used by the acceptance checklist. "States" lists the states section 8 requires beyond the happy path.

| ID | Screen | Public | Lab | Features | Primary job | KPI |
|---|---|---|---|---|---|---|
| S00 | First run | yes | yes | F22, F04 | Explain, request permissions, pick Demo car or real adapter | G8 |
| S01 | Connect | yes | yes | F01, F02, F03, F04 | Find the adapter, connect, show link and power truth | G8, G10 |
| S02 | Vehicle overview | yes | yes | F05, F06 | One-glance health: car, modules answered, fault count, last snapshot | G1, G6 |
| S03 | Module list | yes | yes | F06, F37 | Every module with answer status, faults, coding state, last snapshot | G1, G7 |
| S04 | Fault list | yes | yes | F09, F10 | Faults in plain English, with source, per module | G6 |
| S05 | Live data | yes | yes | F12, F15 | Numeric tiles, gauges, traces, with table view | G3, G10 |
| S06 | Backup (snapshot) | yes | yes | F26, F27 | Read twice, hash, store; show where it lives | G7, G5 |
| S07 | Inspect module | yes | yes | F26, F29 | Option names and raw bytes of one module, read-only | G7 |
| S08 | Diff | yes | yes | F28, F38 | What changed between two snapshots | G7 |
| S09 | Bench write flow | **no** | yes | F40 to F48 | Preflight to rollback on bench module or simulator | G4, G5 |
| S10 | Settings | yes | yes | n/a | Theme, density, units, data folder, packs, diagnostics | n/a |
| S11 | Simulator and Demo car | yes | yes | F16, F17 | Try everything with a pretend car; inject faults | G8, G9 |
| S12 | Data sources and licences | yes | yes | F23 | Show every pack, zone, licence, source | G11 |
| S13 | History and audit log | yes | yes | F27, F18 | Timeline of sessions, snapshots, changes; export | G7, G9 |
| S14 | Capability report | yes | yes | F02, F20 | What this adapter and car can and cannot do, and why | G8, G9, G10 |

### 5.1 S00 First run

| Aspect | Spec |
|---|---|
| Trigger | No preferences file, or "Show again" in Settings |
| Layout | Single column, 3 steps in one page, not a wizard that blocks: (1) What this app does, (2) Choose how to start, (3) Permissions explained |
| Step 1 copy | Heading: "Read your car. Understand it." Body: "OpenDiag finds the control units in your car, explains their fault codes in plain English, and keeps a backup of their settings. This version only reads. It cannot change anything on your car." |
| Step 2 choices | Two equal cards, no default highlight: "Try the demo car" (no hardware) and "Connect my adapter". Demo path is the G8 fast path |
| Step 3 | Only shown on the real path, one permission at a time with the reason: Bluetooth ("To find your OBDLink CX adapter. Nothing is sent anywhere."), Local network ("To talk to your WiFi ENET adapter on the car's network.") (macOS prompts per AV2 R3 / UL section 8) |
| Skippable | Yes, and the choice is remembered |
| Empty state | n/a |
| Error | Permission refused: "Bluetooth is off for OpenDiag. Without it we cannot find the CX adapter. Open System Settings, then Privacy and Security, then Bluetooth." Button "Open System Settings" (outcome-named). Link "Use the demo car instead" |
| Telemetry | None. First run never asks for an account or email |

### 5.2 S01 Connect

| Aspect | Spec |
|---|---|
| Layout | Left: adapter list (found automatically). Right: link and power truth panel for the selected adapter, then the connect button. Below: troubleshooter checklist, collapsed until a failure |
| Adapter list | Each row: name, link type icon plus word (Bluetooth LE, WiFi network, USB serial, Demo), signal word, "Last used" tag. No raw MAC by default; "Show details" reveals it |
| Link truth panel | Adapter model if identified; link type; MTU or chunk limit in words only when it matters ("This adapter sends one message at a time, so scans take longer"); battery voltage if the adapter reports it, else "Voltage not available from this adapter" |
| Primary action | "Connect to <adapter name>" (outcome-named). Disabled state says why ("Turn Bluetooth on to connect") |
| During connect | Inline progress: "Finding adapter", "Opening link", "Identifying car", "Checking what this adapter can do". Each step shows a tick when done. No spinner alone |
| Success | Auto-navigates to S02 with a summary line: "Connected. 3 Series, VIN ending A1B2. 12.6 V." Capability report available via a link |
| Failure | Section 8.3 row E-CONNECT. Never a bare error code |
| Troubleshooter | Checklist with live detection where the OS permits (F04): Bluetooth on? Other app holding the adapter? Phone hotspot or CarPlay using WiFi? Car ignition on? Each item shows detected / not detected / cannot tell. The page never says "should work" |
| Preflight record | Answers saved in the session log (D1) |
| Keyboard | Arrow keys move through adapters, Enter connects |

Source for troubleshooting content: UX section 5 (wrong radio state is a top failure cause, high). No text is copied from BimmerCode's quick start; the list is restated.

### 5.3 S02 Vehicle overview

| Aspect | Spec |
|---|---|
| Purpose | The answer to "is my car OK" in one screen, without implying more than we know |
| Top card | Car identity (make, series, chassis if known, VIN last 4), scan time ("Scanned in 3.8 s"), session trace file |
| Summary tiles (4) | Modules answered "24 of 31"; Faults "7 stored, 2 pending" with icons; Described "5 of 9 have a plain-English description" (G6 made visible); Last snapshot "3 modules backed up" |
| Next steps list | Up to 3 plain suggestions generated from state, never from guesses: "2 modules did not answer. See why.", "9 faults found. Read them.", "No snapshot yet. Back up your coding settings." |
| Do not | No health score, no traffic light for the whole car, no severity verdict (X11) |
| Empty state | Not connected: shows the last saved car if any, with banner; otherwise a single "Connect" call to action |
| Partial state | When fewer modules answered than expected: the tile reads "24 of 31 answered" with a "Why?" link to S14 (A2 risk) |

### 5.4 S03 Module list

| Aspect | Spec |
|---|---|
| Component | Plain semantic table (UL 5.3), default density, sticky header, TanStack Table 9 for sort and filter |
| Columns | Module (plain name plus short code in mono, e.g. "Body domain controller, BDC"), Status, Faults (count), Coding (Verified, Not read, Unverified, Invalid), Last snapshot (relative time plus date on hover), Actions (kebab, keyboard reachable) |
| Status values | "Answered", "No answer", "Not asked" (adapter cannot reach it), "Skipped by safety rule" (never for reads; only used in lab flow). Each with icon and word [D11] |
| Row click | Opens the right detail pane (module facts, last faults, snapshot list) and a link to S07 Inspect |
| Filter bar | Search; chips: "Has faults", "No answer", "Not backed up". Chips have text and a count |
| Sort | Click header or keyboard; `aria-sort` set |
| Row actions public | Read faults, Take snapshot, Inspect, Copy address |
| Row actions lab | Same plus "Bench write..." only for modules on the bench list. Other modules show no write action at all (AV2 10.3: "the UI offers no button for it") |
| Unknown module | "Unknown module at address 0x40. We read it but have no name for it." Never hidden |
| Loading | Rows appear as they answer during a scan (streamed); header shows "Scanning, 14 of ~40 asked" (the total is an estimate and says so) |
| Empty | "No modules found yet. Connect to your car, then run a scan." |

### 5.5 S04 Fault list

| Aspect | Spec |
|---|---|
| Purpose | The core G6 screen. Each fault: what it means, where the words came from, what to do next if we know |
| Grouping | Default: grouped by module, collapsed groups show count. Toggle "All faults, newest first" |
| Row (collapsed) | Status icon plus word (Stored, Pending, History), plain sentence, code in mono, module name, count of occurrences if known |
| Row (expanded) | 1. Plain explanation (our wording). 2. "What this usually means" only if the pack has it. 3. "What to check next" only if the pack has it. 4. Raw: code, status byte as bits with names, freeze data if read. 5. Source disclosure: pack, version, licence zone, confidence. 6. Copy button for a plain-text summary |
| No-description row | Plain sentence slot reads "No description yet." Beneath: "This code is [P0420 style / manufacturer-specific]. We read it from the <module> and have no explanation we can verify." Link: "Copy this code and its context" (redacted, F35 later). Never a guessed meaning |
| Generic-only row | When only a structural meaning exists (level L0/L1 in the coverage strategy), show it labelled "General meaning for this type of code. The manufacturer's own meaning may differ." |
| Severity | Not shown unless a pack provides it with a source; then shown as text "Source says: <word>" with the source (X11) |
| Clear button | **Not in the public build** (AV2 10.4, features F50). A short note appears once: "This app reads faults. It does not clear them. Clearing also resets the car's self-checks, so we left it out of this version." If owner decides otherwise (Q5), see section 12 |
| Counters | Header shows "9 faults: 5 with a plain-English description, 4 without" for G6 |
| Export | "Copy as text" and "Save report" (redacted VIN by default, D13, X17) |
| Filter | Module, status, "has description" yes/no |
| Loading | Skeleton rows with text "Reading faults from 12 modules (4 done)" |
| Empty (no faults) | "No faults stored in the 24 modules that answered. 7 modules did not answer, so we cannot say about them." Never a bare "All good" |
| Partial read | Modules that failed to read faults are listed in a pinned row: "Could not read faults from 2 modules. Try again." with Retry |

### 5.6 S05 Live data

| Aspect | Spec |
|---|---|
| Layout | Channel picker (left, collapsible), canvas (tiles, gauges, traces), table view toggle |
| Defaults | The 10 standard values (F12): RPM, coolant temperature, speed, load, intake air temperature, throttle, fuel trim, battery voltage, and others available |
| Tile | Large value in mono with tabular figures, unit, name in words, age ("updated 0.2 s ago") |
| Gauge | SVG arc, `role="meter"`, numeric value as real DOM text, zones shown with pattern plus label, per UL 5.2 rules |
| Trace | uPlot in a thin wrapper, with `aria-label` and text summary (latest, min, max). A "Table view" switch shows the same buffered values in a table. "Download CSV" always available (F14 Should) |
| Rate | Display refresh capped at about 4 to 10 Hz (UL 10.6). Setting "Update speed" lets a person slow it |
| Stale | After 2 s without a sample: tile dims, shows "No data for 2 s". After 10 s: shows "Stopped. Last value 92 C at 14:02:11" (P8) |
| Not supported | Channel the car does not report: "This car does not report this value." Never zero |
| Controls | Pause (freezes display, not the log), Record (to trace file, F18), Add channel |
| Empty | "Pick a channel to watch." with the 10 defaults pre-listed |
| Dashboards | User-built layouts saved as files (D17). Drag arrange is post-window; the first build offers a fixed grid plus show/hide (UL 1.1) |
| Reduced motion | Needle jumps rather than sweeps; traces still scroll but at the setting rate |

### 5.7 S06 Backup (snapshot)

Public build. Reads only. This is a read-twice-hash-compare of a module's coding, kept as a local file (F26, F27).

| Aspect | Spec |
|---|---|
| Entry | From S03 row, or palette "Take snapshot of <module>", or "Back up all modules" |
| Layout | Left: module checklist with expected time. Right: current job panel and the **Where it is saved** box |
| Where saved | Always visible: folder path, file name, size, hash (first 12 characters, copy for full), "Show in Finder", "Export copy..." [X6] |
| Retention text | "Snapshots stay until you delete them. We never delete them for you." [X7] |
| States | Section 7.2 gives the exact sequence and microcopy |
| Result | Per module: "Verified: both reads matched", "Not verified: reads differed", "Could not read" |
| Bulk | "Back up 6 modules" shows a queue; one at a time; per-module result; overall "5 verified, 1 not verified" |

### 5.8 S07 Inspect module

| Aspect | Spec |
|---|---|
| Purpose | Read-only view of what a module is set to, in names where we have names and raw bytes always |
| Layout | Two panes. Left: option tree or search. Right: selected option detail |
| Row | Option plain name (with German gloss if applicable), current value in words, raw bytes in mono, source of the name (pack, "from owner capture", or "Unnamed") |
| Unnamed bytes | Grouped as "Unnamed settings (42 bytes)" with offsets. Never invented names (F29) |
| Compare | "Compare with a snapshot" opens S08 with this module preselected |
| Safety | A note on screens for modules in the hard-block class: "This module affects safety. OpenDiag will never offer to change it." (AV2 L4) |
| Copy | Click-to-copy on any hex value with text confirmation "Copied 0x3F" (not a toast; inline for 2 s) |
| Loading | "Reading settings (read 1 of 2)" |

### 5.9 S08 Diff

Used for snapshot compare in the public build and as the preview step in the lab flow.

| Aspect | Spec |
|---|---|
| Header | "Comparing: Snapshot A (14 Nov 2026, 18:02) with Snapshot B (20 Nov 2026, 09:40). Module: BDC." |
| Summary | "17 settings differ. 14 changed, 2 added, 1 removed. 3 look like counters that change on their own." (volatile masking, F28; wording says "look like", never claims) |
| Layout | Two columns old and new, with a centre gutter of change icons plus words ("changed", "added", "removed") |
| Row | Option name and gloss; old value and new value in words; below, bytes with the differing bytes underlined (underline plus bold, not colour only); source of the name |
| Volatile fields | Hidden by default under "3 fields that change on their own (show)". Always shown when expanded, with their evidence ("differed in 4 of 4 readings") |
| Reverse | "Show in reverse" toggles old and new (used by Restore preview) |
| Filters | "Named only", "Unnamed bytes", "Changed only" (default) |
| Export | "Copy as text", "Save as file" |
| Large | 200 changes must remain readable at 28 and 36 px rows (UL F10) |
| Empty | "No differences. Both snapshots are identical." plus both hashes |
| Stale | In lab flow only: if the live re-read no longer matches the snapshot the diff was built from: "The module changed since this preview. Nothing was written. Build a new preview." (UX 6.1, X13) |

### 5.10 S09 Bench write flow (Lab build only)

Detailed in section 7. Single page with a stepper. Present only in the Lab build, only reachable from a module on the bench list, only against the simulator or a bench module (decision 2). Contains no public-build strings.

### 5.11 S10 Settings

| Group | Items |
|---|---|
| Appearance | Theme (System, Dark, Light), Density (Compact, Default, Comfortable), Text size (UI scale 100, 115, 130 percent), Reduce motion (System, On, Off) |
| Units | Temperature C or F, Speed km/h or mph, Pressure kPa or psi, Distance km or mi |
| Data | Data folder path with "Show in Finder"; "Export everything"; "Delete a snapshot" is in S13 and never bulk |
| Data packs | List with zone, version, licence; "Download share-alike pack" (explicit action with licence text, never bundled, AV2 9) |
| Connection | Default adapter, auto-reconnect on/off (default on for reads), "Forget adapter" |
| Privacy | "Redact VIN in exports" default on. "Share anonymous usage" absent (no telemetry exists). Statement "OpenDiag sends nothing off this computer unless you export a file." |
| Diagnostics | "Save a support bundle" (trace plus logs, VIN redacted, preview before saving) |
| Lab (Lab build) | Bench module list, voltage minimum profile (default 12.5 V, AV2 10.2), typed-confirm settings fixed (not configurable) |
| Reset | "Reset appearance to defaults" only. No "reset all data" |

Every setting applies immediately; there is no Save button. Preferences are convenience only (UL section 8).

### 5.12 S11 Simulator and Demo car

| Aspect | Spec |
|---|---|
| Public Demo car | Same UI, scripted car (AV2 11.2 item 4). A persistent chip "Demo car. Nothing here is a real car." beside the mode banner |
| Controls panel (Demo and desktop sim) | "Drop the link", "Make a module silent", "Slow replies (+200 ms)", "Add a fault", "Reset demo" |
| Purpose | Lets every error and loss state in section 8 and 9 be shown and tested without hardware (F17, F45) |
| Demo in browser | Read-only RPC, no write service exists in the bundle (AV2 T3) |
| Scripted guide | Optional "Tour" with 6 stops: scan, read a fault, take a snapshot, compare, lose the link, find the source of a description. Skippable, never modal |
| Banner | Public demo shows "Read only" as everywhere. Lab simulator shows the lab banner |
| Guard against confusion | Demo data uses an obviously fake VIN prefix and the chip is always visible; history entries are tagged "Demo" and are excluded from G1 counts |

### 5.13 S12 Data sources and licences

| Aspect | Spec |
|---|---|
| Table | Pack name, zone (Own wording CC-BY or CC0; Share-alike CC-BY-SA), licence, version, signed (yes/no), date, count of entries used this session |
| Per value | Click through from any "Source" disclosure to the pack row |
| Share-alike pack | Separate section with the attribution text and the licence link, and an explanation in two sentences: "This data is shared under a licence that requires anyone who shares changes to share them under the same terms. It is kept apart from our own data." (AV2 9.1, wording is a restatement; legal check outstanding, Q7) |
| Unsigned or expired pack | Shown with a warning and not used: "This pack is not signed. It was not loaded." |
| Contribution | Link to contribute (post-window) |

### 5.14 S13 History and audit log

| Aspect | Spec |
|---|---|
| Timeline | Newest first: sessions, scans, snapshots, diffs, (lab) write transactions. Each entry has time, car (last 4 of VIN), module, adapter, result with icon plus word |
| Detail | Pane shows everything proposed in UX 6.8: tool version, adapter, voltage at start, snapshot hashes before and after, diff, result, read-back match yes or no. Marked as a design proposal there |
| Audit chain | Header states "This log is chained. Tampering is detectable." (AV2 store). Verify button runs the check and shows "Chain intact, 214 entries" or the first break |
| Export | "Export entry", "Export all" (redacted by default) |
| Delete | Per snapshot only, with a single outcome-named confirm: "Delete snapshot of BDC from 14 Nov. This cannot be undone." Not typed (routine, X2). Audit entries cannot be deleted from the UI |
| Filters | Car, module, type, date |
| No account | Works with no network (X8) |
| Empty | "Nothing here yet. Scans and snapshots you make will be listed with the files they created." |

### 5.15 S14 Capability report

| Aspect | Spec |
|---|---|
| Purpose | What this adapter and car can do, with reasons (D15, F02). Never a bare "unsupported" |
| Table | Capability, result (Yes, No, Unknown), why in plain words, how we know (measured now, or from adapter spec) |
| Rows | Reach ENET modules; reach body modules over this link; voltage reading; speed (messages per second, measured); multi-message in flight; read snapshots; read live data; keepalive stable (measured) |
| Honest example | "Reach body modules: Unknown. The CX adapter has answered 3 of 31 modules so far. We have not yet shown whether it can reach the rest." (A2 is open; the number is an example string, not a result) |
| Newer cars | Includes the transparency note (F20): "This car's gateway may refuse some reads. Reading usually works; changing settings does not on this model." Content depends on a real capture; text is a placeholder until then (GS evidence is low for the reason) |
| Export | "Copy report" for outside testers (G9) |

---

## 6. Component inventory

Stock = from shadcn on Base UI (UL section 4). Custom = ours (UL 10.5). Every component has a state list that includes disabled, focus, and (where relevant) loading, empty, error, stale.

### 6.1 Stock components (copy-in)

| Component | Used in | Notes |
|---|---|---|
| Button (primary, secondary, ghost, danger-outline) | everywhere | No `danger` solid used as a default; destructive buttons are outline until focused or hovered |
| Dialog and AlertDialog | confirmations, errors needing a decision | Focus trap, return focus, Esc handled per section 12 |
| Tabs | Snapshots, Settings | Arrow-key navigation |
| Tooltip | icon-only controls | Never the only label; keyboard focus shows it |
| Popover | source disclosure, glossary | Opens on click and focus, not hover only |
| Select, Combobox | adapter, module, unit pickers | Typeahead |
| Switch, Checkbox, RadioGroup | settings, filters | Label on the right, text always visible |
| Table (shadcn markup over TanStack Table 9) | S03, S04, S13, S14 | Real `<table>` |
| Input, Textarea | search, typed confirm | |
| Toast (sonner) | "Copied" only | Not for results (P9) |
| Resizable panels | detail pane | Keyboard resize with arrow keys |
| Command palette (cmdk) | Cmd-K | Optional per UL |
| Skeleton | loading | With visible text label (section 8) |

### 6.2 Custom components

| ID | Component | Anatomy | States |
|---|---|---|---|
| C1 | **ModeBanner** | Full-width bar, icon, text, pattern in lab | public, lab, demo. Cannot be hidden; test asserts presence on every route |
| C2 | **StatusBadge** | Icon + word (+ colour). Variants: ok, info, caution, danger, neutral, bench | Never renders without both icon and text; compile-time prop type |
| C3 | **ModuleRow** | Name, code, status, fault count, coding state, last snapshot, actions | answered, no answer, not asked, reading, stale-saved, hard-block |
| C4 | **FaultRow** | Status, plain sentence, code, module; expand for explanation, raw, source | with description, generic only, no description, reading, stale-saved |
| C5 | **SourceDisclosure** | Small button "Source" opening pack, version, zone, confidence | closed, open; missing source renders "No source" and logs a lint failure in dev |
| C6 | **LiveStatusPanel** | Link quality, voltage, ignition if known, adapter capability words, age of last message | good, fair, poor, lost, unknown |
| C7 | **NumericTile** | Value, unit, name, age | live, stale (dim, age), stopped, unsupported |
| C8 | **Gauge** | SVG arc, `role="meter"`, zone patterns, DOM text value | live, stale, unsupported; reduced-motion variant |
| C9 | **TraceChart** | uPlot wrapper, text summary, table toggle, CSV | live, paused, stale |
| C10 | **DiffViewer** | Two columns, gutter icons, byte underlines, volatile section, reverse toggle | normal, empty, stale-preview, large |
| C11 | **Stepper** | Ordered steps, current step, done ticks, "blocked because" line | each step: pending, active, done, blocked, failed |
| C12 | **TypedConfirmDialog** | Title naming the target, summary, input, outcome-named buttons | empty, partial, matching, mismatch; confirm disabled until match |
| C13 | **ResultBanner** | Three-state: Verified, Written but not verified, Failed (D9), plus next action | persistent; not auto-dismiss |
| C14 | **PreflightPanel** | Checks with value, threshold, pass/fail words | checking, pass, fail, cannot tell |
| C15 | **ProgressPlain** | "Step 2 of 5: reading twice. 11 s so far." | determinate, indeterminate with elapsed time |
| C16 | **SnapshotCard** | Module, time, hash short, size, location, verified chip, actions | verified, not verified, orphaned |
| C17 | **JournalView** | Ordered list of attempted steps with times and results | live, finished, interrupted |
| C18 | **ConnectionBanner** | Inline banner under top bar for link state changes | degraded, lost, reconnecting, restored |
| C19 | **EmptyState** | Heading, one sentence of what and why, one action | per screen |
| C20 | **CopyValue** | Mono text with copy and inline "Copied" text for 2 s | idle, copied |
| C21 | **Glossary term** | Dotted underline, popover with plain definition | keyboard reachable |

Typing rule: StatusBadge, FaultRow, ModuleRow and ResultBanner take a required `label` prop of type string. A component with colour but no label does not compile (proposal; enforces P4).

---

## 7. Detailed flows for risky actions

"Risky" here means any flow where the app asks a module for something unusual or changes something. In the **public build only 7.1 to 7.3 exist** (backup, diff preview, inspect restore preview as read-only). 7.4 to 7.10 are **Lab build only, bench module or simulator** (decision 2). Nothing in this section is designed for a real car write.

Naming: each state has an ID `W-xx` used by tests and logs. Microcopy is in quotes. Where a number appears it is a placeholder filled by the app.

### 7.0 Flow overview

```
 PREFLIGHT -> BACKUP -> CHOOSE -> DIFF + DRY RUN -> RE-READ CHECK -> TYPED CONFIRM
    W-01       W-02      W-03        W-04               W-05             W-06
                                                                            |
 ROLLBACK <- (fail) <- VERIFY <- APPLY with journal <------------------------+
   W-10         W-09      W-08         W-07
                           |
                         RESULT W-09/W-10  -> AUDIT ENTRY (always)
```

| State | Public | Lab | Can the user leave? | Writes to car |
|---|---|---|---|---|
| W-01 Preflight | yes (as "Check before backup") | yes | Yes | No |
| W-02 Backup | yes | yes | Yes (cancel is safe: reads only) | No |
| W-03 Choose options | no | yes | Yes | No |
| W-04 Diff and dry run | yes (compare only) | yes | Yes | No (code path stops before transport) |
| W-05 Re-read check | no | yes | Yes | No |
| W-06 Typed confirm | no | yes | Yes (Cancel) | No |
| W-07 Apply | no | yes | **No cancel** by default (section 7.7) | Yes (bench or simulator) |
| W-08 Verify | no | yes | No cancel | Reads only |
| W-09 Result | no | yes | Yes | No |
| W-10 Rollback | no | yes | No cancel while running | Yes (bench or simulator) |

### 7.1 W-01 Preflight

Purpose: see everything that could make the next step go badly, before the first request. Pattern D1, D15; voltage gate F46; capability report F02.

Layout: PreflightPanel as a checklist. Each check shows a word result, the value, and the threshold.

| Check | Pass rule | Fail wording | Blocks? |
|---|---|---|---|
| Battery voltage | Readable, and at or above the profile minimum (default 12.5 V in lab; AV2 10.2, medium) | "Battery is 11.8 V. We need at least 12.5 V to change anything. Connect a charger or power supply, then check again." | Lab write: yes. Public backup: no, shows "Low battery may disturb reads" |
| Voltage available | Adapter reports voltage | "This adapter cannot read battery voltage, so we cannot check it." Lab: blocks unless the "on a charger" override is recorded in the audit chain (AV2 10.2) | Lab: yes unless override |
| Link quality | Good or Fair | "The link is poor (about 1 in 5 messages needed a resend). Move the adapter closer or switch to a cable." | Lab: yes on Poor. Public: advice only |
| Adapter capability | Module reachable over this link | "This adapter has not answered this module. Open the capability report." | Yes (cannot back up what you cannot read) |
| Ignition and engine | As reported where readable | "We cannot tell if the ignition is on. Check that it is on and the engine is off." (a checkbox the person ticks, recorded; D1) | Recorded only |
| Other apps and radios | Detected where the OS permits | "Another app may be using this adapter. Close other car apps." | Recorded only |
| Module identity | Identity read matches an allowed class | "We could not identify this module." | Yes |
| Module class | Not in hard-block list | "This module affects safety. OpenDiag will never offer to change it." | Yes, no override (AV2 L4) |
| Bench list (lab) | Module is on the bench list | no button is offered at all | n/a |

Buttons: "Check again" (secondary), "Continue to backup" (primary; disabled with the reason beside it while any blocking check fails). No "Continue anyway" exists for hard blocks. Soft blocks (voltage unreadable on a bench power supply) show "Record that this is on a charger and continue" which writes an audit entry.

Loading: each check shows "Checking..." with a word, not a spinner alone. Total check time target under 5 s; if a check exceeds 10 s: "This check is taking longer than expected" with "Skip this check" only for non-blocking ones.

### 7.2 W-02 Backup (read twice, hash, compare, store)

Rules from decision 2: nothing writes without a verified backup. Public build uses this flow for plain "Back up" (S06).

| Sub-state | Screen text | Notes |
|---|---|---|
| W-02a Start | Heading "Back up BDC". Body "We will read this module's settings twice and compare them. If both reads match, we save a backup on this computer." Primary button "Read BDC twice". Secondary "Cancel" | Cancel is available and safe: reads only |
| W-02b Read 1 | ProgressPlain: "Reading settings, read 1 of 2. 5 s so far." | Elapsed counter, not a fake percentage unless the byte count is known |
| W-02c Read 2 | "Reading settings, read 2 of 2." | |
| W-02d Compare | "Comparing the two reads." (instant) | |
| W-02e Match | ResultBanner Verified: "Both reads matched. Backup saved." Detail: file name, folder, size, short hash, "Show in Finder", "Export copy..." and the retention line from S06 | The hash is shown so a person can note it |
| W-02f Mismatch | ResultBanner caution: "The two reads were different, so we did not keep a backup. Some settings change on their own while the car is on. Nothing was written to the car." Buttons "Read again" (primary), "See what differed" (opens diff of the two reads, volatile masking applied), "Cancel" | Never saves an unverified backup as verified. Option to "Keep both reads as unverified" appears under a disclosure and is marked "Not usable for changes" (public only) |
| W-02g Read failed | ResultBanner danger: "We could not read BDC. The module answered 'not supported in this session' (code 0x22)." (code is a small reference, not the message). "Nothing was changed." Buttons "Try again", "Open capability report" | Per section 8.3 E-READ |
| W-02h Link lost mid-read | ConnectionBanner flow, section 9. Text: "The adapter stopped answering during read 2. No backup was saved. Nothing was written." | |

Extended session note: whether coding reads need an extended session is unknown (features.md Gaps 4). If they do, the pre-read line adds "We will ask the module to enter its service mode for reading. It leaves this mode by itself in about 5 seconds if we stop talking to it." (the 5 s value is a placeholder, not a fact; to be replaced by a measured value). This remains a safety-reviewer decision.

### 7.3 W-04 Diff preview and dry run

Used for: (public) comparing two snapshots; (lab) preview before a write.

| Aspect | Spec |
|---|---|
| Entry | Lab: after W-03 options are chosen. Public: user picks two snapshots |
| Content | DiffViewer (S08) with "Old (backup)" and "New (what would be written)" |
| Dry run line | "Dry run passed. We ran every step up to the point of sending, and stopped there. Nothing was sent to the module." Dry run is real in code: the path stops before the transport (D5, UX 6.1) |
| Summary | "3 options will change on FEM." Each with plain name and gloss |
| Plan hash | Short plan hash shown and copyable, so the same plan is what gets confirmed (immutable plan, AV2 10.1 L2) |
| Reverse view | "Show how restore would look" toggles the reversed diff (D10) |
| Buttons | "Back to options" (secondary), "Continue to final check" (primary, enabled only after the dry run line is shown) |
| Unnamed byte changes | Allowed to display; lab flow offers no way to write unnamed bytes without a separate lab-only "expert" setting that is off (UX X12) and not designed here |

### 7.4 W-05 Re-read check (compare and swap)

| Aspect | Spec |
|---|---|
| Purpose | Make sure the module still matches the backup the diff was built from (UX 6.2, X13) |
| Screen | ProgressPlain "Checking that FEM still matches your backup." |
| Pass | "FEM still matches your backup." and auto-advance to W-06 after the person presses "Continue" (no auto-advance into a confirmation) |
| Fail | ResultBanner caution: "FEM has changed since the backup. Nothing was written. The preview is out of date." Buttons "Back up again" (primary), "Cancel". The old diff is discarded |
| Cache rule | The expected value is a fresh read, never cached state (UX 6.2 trap) |

### 7.5 W-06 Typed confirmation

Only for bench writes (W-07) and restores (W-10 when started manually). Not used anywhere else (P6, X2).

TypedConfirmDialog is an alert dialog (focus per section 12).

| Element | Content |
|---|---|
| Title | "Write 3 options to FEM?" |
| Body (what changes) | "This will change 3 options on the bench module FEM (ID BENCH-02). Old values are in your backup from 20 Nov, 09:40, hash 4f2a91c07b3e." |
| Body (what restore does) | "If something goes wrong you can restore that backup. Restoring is another write and can also fail." (X4, UX 6.4) |
| Body (visibility) | "The change is recorded in History on this computer." |
| Body (dealer note) | Omitted for bench modules (AV2 10.5 requires it for real cars; none in window) |
| Instruction | "To continue, type FEM and BENCH-02 below." The typed string format is `<MODULE> <BENCH ID or last 4 of VIN>` e.g. `FEM BENCH-02`. Placeholder text shows the pattern with the actual value hidden, so the person must read the title (D7) |
| Input | Single field, no paste prevention (accessibility; paste is allowed; a person must still look), `aria-describedby` points to the instruction. Match is case-insensitive, trims whitespace |
| Live check | "Matches" text with check icon when equal; "Does not match yet" otherwise. Not colour only |
| Buttons | Primary "Write 3 options to FEM" (disabled until match), Secondary "Keep current settings". Neither is the initial focus; initial focus is the input (UL F1). Esc triggers "Keep current settings" |
| After click | Button becomes disabled and the dialog switches to W-07 inline. No second confirmation |

Open decision for the owner: typed string content. Default above. Alternative: only the module name. Default chosen because bench module IDs prove the person read the target (D7). Confidence: low (no study measures this; UX gap 10).

### 7.6 W-07 Apply with journal

Cancel is not offered by default (section 7.7). The screen cannot be left; closing the window is allowed but is treated as a kill (W-recover).

| Element | Content |
|---|---|
| Heading | "Writing to FEM" |
| Stepper | Steps from the plan: "1 of 3: option 'Daytime running lights'" etc. Each step: pending, sending, sent, confirmed |
| Journal view | JournalView lists "Step 1 sent 09:41:02" **before** bytes leave (AV2 journal rule). If the app is killed, this list is what recovery reads |
| Live status | LiveStatusPanel in a compact row: voltage, link quality, last answer age |
| Elapsed | "Elapsed 6 s" (no promise of how long, since unknown) |
| Text under stepper | "Do not unplug the adapter or turn off the power supply. If something stops, this app will tell you what state the module is in." |
| Blocking events | Voltage drops below minimum between steps: stop before the next step, go to W-10 offer. Link degrades: pause between steps, never mid-request (AV2 10.2: "abort only between requests") |
| Not offered | Pause, skip step, "force" |

### 7.7 Cancel and abort policy

| Question | Answer in this spec | Basis |
|---|---|---|
| Is there a Cancel during W-07? | **No.** The only way to stop is a failure condition, which stops between requests | Where cancel is safe is not established in any source (UX section 8, gap); default is no cancel until bench testing and the reviewer decide |
| Cancel before W-07 | Always available and safe | Reads only |
| Window close during W-07 | Warning not needed (cannot be prevented); next start shows W-recover | AV2 10.3: "App killed mid-write" |
| Cancel during W-10 | No | Same as W-07 |

### 7.8 W-08 Verify (read back after reset)

| Sub-state | Text |
|---|---|
| W-08a | "Restarting FEM so the new settings take effect." Elapsed counter. A reset is part of the plan; text names it |
| W-08b | "Reading FEM again to check." |
| W-08c Pass | goes to W-09 Verified |
| W-08d Mismatch | goes to W-09 Failed and auto-offers W-10 |
| W-08e No answer after reset | "FEM has not answered since the restart (35 s)." (placeholder duration, to be measured). Shows two buttons: "Keep waiting" and "See options". Does **not** claim failure until the timeout rule fires. Text: "Some modules take a while to start up." |

Commit means read-back matched, not a positive reply from the module (AV2 10.2; D9).

### 7.9 W-09 Result (three states)

ResultBanner persistent, with an audit entry link. Never auto-dismissed (P9).

| State | Banner | Body | Buttons |
|---|---|---|---|
| **Verified** (icon check, word "Verified") | "Verified. FEM now has the 3 new settings." | "We read FEM again after the restart and the settings match what you asked for. The backup from 09:40 is kept." | "Done" (primary), "Restore the old settings" (secondary, opens W-10 preview), "Show details" |
| **Written but not verified** (icon question, "Not verified") | "Written, but we could not confirm it." | "The write finished, but the read-back did not match, or FEM did not answer. We do not know the module's state." | "Restore the old settings" (primary), "Read FEM again", "Show details" |
| **Failed** (icon x, "Failed") | "The change did not complete." | "FEM was left in this state: <known state sentence, e.g. 'unchanged as far as we can tell', 'partly changed after step 2 of 3', 'unknown'>." The state sentence is required; if unknown, it says "Unknown" | "Restore the old settings" (primary), "Show details" |

Rule: the outcome is never described as "success" unless Verified. In the other two states the primary button is the restore, not "Done".

### 7.10 W-10 Rollback (restore)

Rollback is itself a write, so it repeats the safety chain (X4, UX 6.4).

| Sub-state | Text and rule |
|---|---|
| W-10a Preview | DiffViewer reversed: "Restoring the backup from 20 Nov, 09:40 will change 3 options back." Dry run line as in 7.3 |
| W-10b Re-read check | As W-05, against the current module state |
| W-10c Confirm | **Automatic restore after a failed write** (started by the app) needs no typing, only the outcome-named button "Restore FEM from backup" (the person is already in a failure; extra typing adds friction at a bad time). **Manual restore** later from History uses the typed confirm of 7.5. Rationale: low confidence; the owner decides. Alternative: typed confirm for both |
| W-10d Apply | Same as W-07 with the title "Restoring FEM". Max 2 attempts (AV2 10.2). Text: "Attempt 1 of 2." |
| W-10e Verify | As W-08 |
| W-10f Result | Verified: "Restored. FEM matches your backup again." Not verified or failed: "We could not restore FEM automatically. The backup is still on this computer. What to do next:" followed by plain steps (disconnect, power cycle, try again, export the backup and report it). No promise of recovery. The sentence "Restore can fail" has been stated earlier in 7.5 |
| After two failed attempts | "Two restore attempts did not match. We have stopped to avoid making it worse. FEM is in an unknown state." with "Export a report" and "Show journal" |

### 7.11 W-recover (app killed or crashed mid-write)

On next start, before any other screen:

| Element | Content |
|---|---|
| Blocking dialog (not dismissible without a choice) | "An unfinished change was found. On 20 Nov at 09:41 a write to FEM (bench ID BENCH-02) stopped before it finished. We last sent step 2 of 3." |
| Body | "FEM may be unchanged, partly changed, or fully changed. Connect to the same module to find out. No new writes can start until this is resolved." |
| Buttons | "Inspect FEM now" (primary, reads and compares to backup and to plan; read only), "Restore from backup" (secondary, goes to W-10 with typed confirm), "Not now" (allowed; keeps the lock; the banner shows "Unfinished change on FEM" until resolved) |
| Rule | While a transaction is open, the app refuses new writes (AV2 10.2). Reads continue |

### 7.12 Audit entry

Every flow end (including cancelled after backup) writes an entry visible in S13, with the fields of UX 6.8 (proposal, unsourced as a whole). The UI links the result banner to the entry ("Show entry"). No secrets, no full VIN by default (X17).

### 7.13 Public-build read-only equivalents

| Lab step | Public equivalent |
|---|---|
| Preflight | "Check before backup" panel, advice only |
| Backup | Same W-02 |
| Diff and dry run | Compare two snapshots (S08) |
| Typed confirm, apply, verify, rollback | Absent. No placeholder, no disabled button, no "coming soon" (absence is the safety control, AV2 L0) |
| Restore preview | A saved "restore preview" cannot exist, because restore is a write. The public build shows "How to put these settings back: this version cannot write. Export the backup and use it with a tool that can." Not a recommendation of any specific tool |

---

## 8. Empty, loading and error states

### 8.1 Rules

1. Every list and panel defines empty, loading and error. An empty state states what, why and the next step (D14).
2. Loading shows plain words and, where known, counts or elapsed time. A skeleton alone is not enough (screen reader gets text).
3. After 3 s with no progress a screen shows "Still working" with elapsed time. After 15 s it offers the safe action (Cancel for reads, nothing for writes).
4. Errors have three parts: what happened in plain words; what state the module is now in (Known good, Unknown, Needs restore); the one next action [UX 6.9]. A code appears only as a small reference.
5. Retry buttons are labelled by what they retry ("Read faults again", not "Retry").
6. No error is shown as a toast.

### 8.2 Empty states

| Where | Heading | Body | Action |
|---|---|---|---|
| Faults (not connected, no saved) | "No faults to show yet" | "Connect to your car and run a scan." | "Connect" |
| Faults (connected, none) | "No faults stored" | "No faults in the 24 modules that answered. 7 modules did not answer, so we cannot say about them." | "See which modules did not answer" |
| Modules | "No modules found yet" | "Run a scan to find the control units in your car." | "Scan car" |
| Live | "Pick a channel to watch" | "Start with the 10 standard values." | "Add the standard values" |
| Snapshots | "No snapshots yet" | "A snapshot is a backup of one module's settings, kept on this computer." | "Back up a module" |
| History | "Nothing here yet" | "Scans and snapshots you make will be listed here with the files they created." | none |
| Diff | "Pick two snapshots to compare" | "Choose an older and a newer snapshot of the same module." | "Choose snapshots" |
| Data sources | "No packs loaded" | "Without a pack we cannot explain fault codes beyond a general type. The app still works." | "Open settings" |
| Search | "Nothing matches 'xyz'" | "Try a code like P0420 or part of a module name." | "Clear search" |

### 8.3 Error catalogue (user-facing)

Each row is the message set the UI must have. `Ref` is the small code line. `Module state` is one of Known good, Unknown, Needs restore, or Not applicable.

| ID | Trigger | What happened | Module state | Next action (button) | Retry safe? |
|---|---|---|---|---|---|
| E-BT-OFF | Bluetooth off | "Bluetooth is off, so we cannot find your CX adapter." | n/a | "Open System Settings" | Yes |
| E-BT-DENIED | Permission refused | "OpenDiag does not have permission to use Bluetooth." | n/a | "Open System Settings" | Yes |
| E-NET-DENIED | Local network refused | "OpenDiag does not have permission to reach your WiFi adapter on the local network." | n/a | "Open System Settings" | Yes |
| E-NO-ADAPTER | None found | "We could not find an adapter. Check that it is plugged in and its light is on." | n/a | "Search again", "Use demo car" | Yes |
| E-CONNECT | Connect failed | "We found the adapter but could not open a link to it." | n/a | "Try again", "Open troubleshooter" | Yes |
| E-IGNITION | No answer from car | "The adapter connected, but the car did not answer. Is the ignition on?" | n/a | "Check again" | Yes |
| E-HELD | Adapter in use | "Another app may be using this adapter." | n/a | "Check again" | Yes |
| E-NO-ANSWER | Module silent | "BDC did not answer. It may be asleep, or this adapter may not reach it." | Not applicable (read) | "Ask again", "Open capability report" | Yes |
| E-READ | Module refused read | "BDC refused the read. It said: not supported right now (reference 0x22)." | Known good (nothing written) | "Open capability report" | Not blindly. Safety kind never retried automatically (AV2 8.3) |
| E-TIMEOUT | Slow answer | "BDC is taking longer than usual to answer." | n/a | "Keep waiting", "Cancel read" | Yes |
| E-MISMATCH | Reads differ | See W-02f | Known good | "Read again" | Yes |
| E-VOLT-LOW | Low voltage | W-01 text | n/a | "Check again" | Yes |
| E-PACK-BAD | Pack unsigned, expired or wrong zone | "The data pack 'bmw-faults 1.2' was not loaded: it is not signed." | n/a | "Open data sources" | n/a |
| E-DISK | Cannot save | "We could not save the backup: the folder is full or not writable." | Known good | "Choose another folder" | Yes |
| E-LOST | Link lost | Section 9 | Depends on phase | Section 9 | Phase dependent |
| E-CHAIN | Audit chain broken | "The history log has an entry that does not match the one before it (entry 118)." | n/a | "Show entry", "Export" | n/a |
| E-RECOVER | Unfinished write found | W-recover | Unknown | "Inspect FEM now" | n/a |
| E-INTERNAL | App bug | "Something went wrong inside OpenDiag. Nothing was written to your car." (public); lab: "Nothing was sent after the last journal entry." | as stated | "Save a support bundle" | n/a |

The ordering of next action buttons: the first is the recommended next step but is never a destructive action. In errors the destructive-class action (Restore) is never first unless it is the only sensible step (W-09 not verified and failed).

### 8.4 Loading catalogue

| Operation | Text | Progress | Long-wait text (after 15 s) |
|---|---|---|---|
| Scan | "Scanning, 14 of about 40 asked, 3 answered per second" | counts | "Some modules take longer. You can use the results so far." |
| Fault read | "Reading faults from 12 modules (4 done)" | counts | "BDC is slow. We will keep trying for another 20 s." (placeholder value) |
| Live data start | "Starting live data" | indeterminate with elapsed | "No values yet. Check the capability report." |
| Snapshot | W-02 sequence | step counts | W-02 |
| Pack load | "Loading data pack" | indeterminate | "Checking the pack's signature" |

---

## 9. Connection loss and degraded links

The adapter can drop at any time (WiFi hotspot switching, Bluetooth range, a loose cable). The UI treats loss as a normal event. Link states come from the link layer (`connected`, `degraded`, `lost`, AV2 8.1).

### 9.1 State machine shown to the user

| Link state | Word | Icon | Where shown |
|---|---|---|---|
| Connected, good | "Good" | check | Adapter chip |
| Degraded | "Poor" | warning | Adapter chip, ConnectionBanner under top bar: "The link is weak. Some answers are late." |
| Lost | "Lost" | broken link | Adapter chip, ConnectionBanner (persistent), live values stale |
| Reconnecting | "Reconnecting, attempt 2" | refresh | ConnectionBanner |
| Restored | "Back" | check | ConnectionBanner for 5 s then history entry (not a toast: it is in History as well) |

### 9.2 Behaviour by phase (what the app does and says)

| Phase when the link drops | App action | Screen text | Resume rule |
|---|---|---|---|
| Idle, connected | Mark chips; offer reconnect | "The adapter stopped answering. Your saved data is still here." | Auto-reconnect for reads (default on). Up to 5 attempts at growing intervals (placeholder, tune in G10 tests), then stop and offer "Reconnect" |
| Scanning | Keep results so far; mark unknown modules "Not asked yet" | "The scan stopped at 18 of about 40 modules. Results so far are kept." Buttons "Reconnect and continue" (primary), "Keep what we have" | Continue only the modules not yet asked |
| Reading faults | Keep completed modules; mark the rest | "Faults were read from 8 modules before the link dropped. 4 modules were not read." | Same as above |
| Live data | Freeze values, dim, show age; keep ring buffer | "Live data stopped. Last value 92 C at 14:02:11." Banner. Recording continues as a gap marker in the trace | Resume on reconnect; gap visible on the chart (a break in the line, not interpolated) |
| Snapshot reading | Discard the incomplete read; never save as verified | W-02h text | Restart the snapshot from read 1 after reconnect; never resume mid-read |
| Diff preview | No effect (offline data) | none | n/a |
| Re-read check (W-05) | Fail the check | "Could not check FEM before writing. Nothing was written." | Restart at W-05 |
| Apply (W-07) | Stop **between** requests; journal stays | "The link was lost after step 2 of 3. FEM may be partly changed." (state sentence is required) | **Never auto-retry a write.** Reconnect, then offer W-recover style: "Inspect FEM now" or "Restore from backup" |
| Verify (W-08) | Wait up to the timeout; if lost, W-09 not verified | "We lost the link before we could check." | Reconnect then "Read FEM again" |
| Rollback (W-10) | Same as apply | "The link was lost while restoring." | Never auto-retry; offer inspect and restore |

### 9.3 Rules

1. **Reads may auto-reconnect; writes never retry automatically** (AV2 8.3: safety-kind errors are never retried).
2. After any reconnect the app **re-identifies the car**. If the VIN differs: "This is a different car (VIN ending C3D4). Your open results belong to A1B2." Results are not mixed.
3. A stale value never looks live (P8). A "Stopped" tile keeps the last value readable but obviously old.
4. The connection banner does not cover the mode banner and does not steal focus; it is announced politely to assistive tech (section 12).
5. Loss events are written to History as sessions events (G10 depends on this).
6. If the link repeatedly flaps (3 drops in 2 minutes, placeholder), the app suggests the cause list from the troubleshooter and stops auto-reconnect to avoid thrashing the adapter.
7. During bonding-window issues on the CX (UL/AT: bonding window 5 min after power on, high in AT), the reconnect error says "Turn the adapter off and on, then connect within 5 minutes." only if the bonding failure is the detected cause. Otherwise the app does not guess.

---

## 10. Colour and type tokens

### 10.1 Rules

1. Tokens live on `:root`, redefined for dark under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])` and again under `:root[data-theme="dark"]`. A tiny inline script sets `data-theme` before first paint to avoid a flash (UL F12).
2. Components use tokens only. No raw hex in components.
3. Status colours are always used with an icon and a word (P4).
4. Focus ring is its own token.
5. The Lab (bench) accent is distinct from all status colours and always accompanied by a stripe pattern.

### 10.2 Colour tokens (values are proposals; ratios computed by script on 2026-11-20)

Ratios use the WCAG relative-luminance formula. Required: text 4.5:1 (large text 3:1), non-text UI 3:1 (WCAG 2.2 1.4.3 and 1.4.11, read on w3.org this run, high).

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | #FFFFFF | #0F1216 | App background |
| `--surface` | #F6F7F9 | #171B21 | Panels, table header |
| `--raised` | #FFFFFF | #1F242C | Dialogs, popovers |
| `--text` | #14171C | #E8EAED | Body text |
| `--text-muted` | #4A5260 | #A9B0BC | Secondary text (still 4.5:1 or better) |
| `--accent` | #0B5FD1 | #6EA8FF | Focus, selection, primary actions |
| `--border` | #7A8392 | #6B7585 | Control and input borders (3:1) |
| `--ok` | #0F6B3A | #4CC38A | Verified, matched |
| `--info` | #0B5FD1 | #6EA8FF | Information |
| `--caution` | #8A5A00 | #F2B33D | Needs attention |
| `--danger` | #B3261E | #FF8A80 | Failed, blocked |
| `--bench` | #6B2FB3 | #C9A2FF | Lab and bench mode |
| `--ok-bg` | #E6F4EC | #12281D | Status chip backgrounds |
| `--info-bg` | #E8F0FD | #13233F | |
| `--caution-bg` | #FFF3D6 | #2E2410 | |
| `--danger-bg` | #FDECEA | #33161A | |
| `--bench-bg` | #F1E8FB | #261A3A | |
| `--focus-ring` | #0B5FD1 | #6EA8FF | 2 px ring with 2 px offset |

### 10.3 Computed contrast (script output, 2026-11-20)

| Pair | Light | Dark | Needs | Result |
|---|---|---|---|---|
| text on bg | 17.96 | 15.58 | 4.5 | Pass |
| text on surface | 16.76 | 14.34 | 4.5 | Pass |
| text on raised | 17.96 | 12.93 | 4.5 | Pass |
| text-muted on bg | 7.87 | 8.60 | 4.5 | Pass |
| text-muted on surface | 7.35 | 7.92 | 4.5 | Pass |
| text-muted on raised | 7.87 | 7.14 | 4.5 | Pass |
| accent on bg (links, focus) | 5.88 | 7.79 | 4.5 text, 3 ring | Pass |
| accent on surface | 5.48 | 7.17 | 4.5 | Pass |
| border on bg | 3.83 | 4.03 | 3.0 | Pass |
| border on surface | 3.57 | 3.71 | 3.0 | Pass |
| border on raised | 3.83 | 3.35 | 3.0 | Pass |
| ok text on bg | 6.59 | 8.48 | 4.5 | Pass |
| ok text on ok-bg | 5.81 | 7.04 | 4.5 | Pass |
| info text on info-bg | 5.13 | 6.50 | 4.5 | Pass |
| caution text on bg | 5.93 | 10.10 | 4.5 | Pass |
| caution text on caution-bg | 5.37 | 8.21 | 4.5 | Pass |
| danger text on bg | 6.54 | 8.23 | 4.5 | Pass |
| danger text on danger-bg | 5.72 | 7.24 | 4.5 | Pass |
| bench text on bg | 7.83 | 9.03 | 4.5 | Pass |
| bench text on bench-bg | 6.59 | 7.82 | 4.5 | Pass |
| white on accent button (light) | 5.88 | n/a | 4.5 | Pass |
| dark text (#0F1216) on accent button (dark) | n/a | 7.79 | 4.5 | Pass |
| white on danger fill (light) | 6.54 | n/a | 4.5 | Pass |
| dark text on danger fill (dark) | n/a | 8.23 | 4.5 | Pass |

What the numbers do not cover: anti-aliasing at small sizes, user colour filters, the actual rendered pixels (check with axe and by eye, UL F2 and F5), and any colour on the gauge zones, which are patterns plus labels. Confidence: high for arithmetic, medium for threshold interpretation (WCAG 2.2 text fetched, but the page was long and only the first part was read; target size and 3.3.4 text were not reached, see Gaps).

### 10.4 Status language (icon + word + colour)

| Status | Icon (Lucide name, proposal) | Word examples | Colour token | Pattern in greyscale |
|---|---|---|---|---|
| OK, verified, matched | check-circle | "Verified", "Matched", "Good" | `--ok` | filled circle with tick |
| Info | info | "Note", "Saved data" | `--info` | circle with i |
| Caution | alert-triangle | "Check", "Pending", "Not verified" | `--caution` | triangle |
| Danger, failed, blocked | x-octagon | "Failed", "Blocked", "Lost" | `--danger` | octagon |
| Unknown or not read | help-circle | "Not read", "Unknown", "No answer" | `--text-muted` | dashed circle with ? |
| Lab or bench | flask-conical plus stripe | "Bench" | `--bench` | diagonal stripe fill on banner |

Greyscale check from UL F4 applies: render all chips and zones in greyscale; each state must remain distinguishable by shape and word.

### 10.5 Typography

| Token | Value | Use |
|---|---|---|
| `--font-ui` | "Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif | All UI text |
| `--font-mono` | "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace | Hex, codes, VIN, logs |
| `--fs-xs` | 12 px / 16 px line | Minimum size, secondary captions |
| `--fs-sm` | 13 px / 18 px | Table cells in compact density |
| `--fs-md` | 14 px / 20 px | Body default |
| `--fs-lg` | 16 px / 24 px | Panel headings |
| `--fs-xl` | 20 px / 28 px | Screen headings |
| `--fs-2xl` | 28 px / 34 px | Live tile values |
| `--fs-3xl` | 40 px / 44 px | Hero live value in focus mode |
| Mono | One step smaller than UI text at the same row |  |
| Weights | 400 body, 500 labels, 600 headings. No light weights below 14 px |  |
| Numbers | `font-variant-numeric: tabular-nums` on every live value |  |
| Text size setting | 100, 115, 130 percent via root font size; layout must survive 130 percent at 1024 px width |  |
| Line length | Body paragraphs max 72 characters |  |

Font files bundled via Fontsource, no network call (UL section 6.2); OFL notices shipped.

### 10.6 Spacing, radius, elevation, density

| Token | Value |
|---|---|
| Space scale | 4, 8, 12, 16, 24, 32, 48 px |
| Radius | 4 px controls, 8 px panels and dialogs |
| Elevation | Flat panels with 1 px border. Dialogs get a shadow and a scrim at 50 percent |
| Row heights | `--row-h-compact` 28, `--row-h-default` 36, `--row-h-comfortable` 48 (UL 5.3 proposals) |
| Hit target | Minimum 24 x 24 CSS px for any pointer target and 32 x 32 in default density; 44 x 44 in comfortable density (WCAG 2.2 target size minimum is 24 px: from my knowledge of 2.5.8; **not re-read this run, medium**) |
| Focus ring | 2 px `--focus-ring`, offset 2 px, never removed, never clipped by overflow |

### 10.7 Motion tokens

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 100 ms | Hover, toggle |
| `--dur-base` | 150 ms | Panel, popover |
| `--dur-slow` | 200 ms | Dialog |
| Easing | ease-out for entering, ease-in for leaving | |
| Live numbers | Display refresh 4 to 10 Hz; no tweening of digits | |
| Reduced motion | `prefers-reduced-motion: reduce` or setting "On": no sweeps, no slides, fades only at 0 ms | Gauge needle jumps |

---

## 11. Responsive rules

The main product is a desktop app (UL C1). The Demo car in a browser and a later phone web view need layout rules now, so the components do not have to be redone. Phone is not a design driver in the 12 weeks (UL C3); this section is a plan, not a build commitment.

### 11.1 Breakpoints

| Name | Width | Layout |
|---|---|---|
| Phone | under 640 px | Single column. Rail becomes a bottom tab bar (5 items) plus a "More" sheet. Detail pane becomes a full-screen sheet pushed over the list |
| Tablet | 640 to 1023 px | Rail collapsed to icons with labels on hover and focus; detail pane as overlay |
| Desktop | 1024 to 1439 px | Full frame. Detail pane optional, resizable |
| Wide | 1440 px and up | Detail pane docked by default; live canvas shows more tiles |

Desktop window minimum 1024 x 700 (UL 10.2). Below that the Demo car uses the tablet or phone layout.

### 11.2 Per-component rules

| Component | Phone | Desktop |
|---|---|---|
| Mode banner | Same text, wraps to 2 lines, remains visible and fixed at the top | One line |
| Top bar | Car chip and adapter chip only; voltage moves into the Adapter sheet; banner still visible | All chips |
| Module list | Cards instead of rows: name, status badge, fault count; tap opens sheet | Table |
| Fault list | Card per fault: plain sentence first, code and module in a second line, expand in place | Table with expandable rows |
| Live data | One tile per row, 2 columns on wide phones; traces below with table view toggle | Grid |
| Diff | Single column showing old above new inside each row ("Was ... Now ..."); bytes behind a "Show bytes" toggle | Two columns |
| Stepper (lab) | Vertical, one step visible, previous steps collapsed | Horizontal or vertical |
| Typed confirm | Full-screen sheet; input first; keyboard does not cover the buttons (sheet scrolls) | Centered dialog |
| Tables | Phone never shows more than 3 columns; others are in the expanded card | Full columns |
| Dialogs | Full-screen sheets under 640 px | Centered 480 to 640 px |

### 11.3 Rules that hold at every size

1. 16 px side gutter on phone (also an Artifact rule; here chosen for readability).
2. No horizontal scroll of the page. Wide tables scroll inside their own region, which has a visible focus and a text hint "Scroll sideways for more columns" (only if overflow exists).
3. Hit targets per 10.6. Phone default density equals "Comfortable".
4. The mode banner and the connection banner are never hidden by the on-screen keyboard or by sheets.
5. Orientation: both supported; no content depends on landscape.
6. Text can reach 130 percent without clipping or loss of function.
7. No hover-only information. Everything on hover is also on focus and tap.
8. Avoid newer CSS features in shared components so the Demo car works on the Tailwind browser floor (UL 4.3).
9. Dense tables on a phone web view were not researched (UL Gaps 12); the card layout above is a proposal to be tested.

---

## 12. Keyboard and accessibility rules

Basis: WCAG 2.2 (read in part on w3.org this run for 1.4.1, 1.4.3, 1.4.11, 2.4.7, 2.4.11, 2.2.1: high) and the WAI-ARIA Authoring Practices (the alert dialog page defers to the modal dialog pattern and says `aria-describedby` should reference the message: high; the modal dialog keyboard details were not re-fetched, medium). Vendor accessibility claims for Base UI and React Aria are unverified by us (UL Gaps 2); the checks below are ours.

### 12.1 Global rules

| # | Rule | Check |
|---|---|---|
| A1 | Every function is reachable and operable by keyboard alone | Keyboard-only run of every flow in section 7 and 14 |
| A2 | Visible focus indicator on every interactive element, 2 px ring, 3:1 against adjacent colours | Axe plus visual check; computed ring contrast in 10.3 |
| A3 | Focus is never hidden behind a sticky bar or banner (WCAG 2.4.11 intent) | Scroll padding equal to the sticky heights |
| A4 | Tab order follows reading order; no positive `tabindex` | Lint |
| A5 | Skip link "Skip to main content" first in tab order, visible on focus | Test |
| A6 | One `h1` per screen; landmarks: banner, navigation, main, complementary (detail pane), contentinfo (status strip) | Axe |
| A7 | Colour never the only carrier (WCAG 1.4.1); statuses have icon and text | Greyscale check (UL F4) |
| A8 | Text contrast 4.5:1 (3:1 large); UI and focus 3:1 | Section 10.3 and axe |
| A9 | Respect `prefers-reduced-motion` and the in-app override | Test |
| A10 | Respect system dark and light; do not rely on a manual toggle alone | Test |
| A11 | No time limit on any decision; if a timeout exists (token expiry is internal) the user sees none (WCAG 2.2.1 intent) | Review |
| A12 | Language attribute set; strings come from keys for later translation | Lint |
| A13 | Accessible names for all icon-only controls; names match visible labels where there is one | Axe |
| A14 | Zoom to 200 percent and text size 130 percent: no loss of content or function | Manual |
| A15 | Do not trap keyboard outside dialogs; Esc closes non-risky popovers | Test |

### 12.2 Keyboard map (desktop; macOS notation, Windows and Linux use Ctrl)

| Keys | Action | Notes |
|---|---|---|
| Cmd-K | Command palette | Public build lists no write actions |
| Cmd-1 to Cmd-7 | Rail items in order | |
| Cmd-R | Re-read the current screen's data | Read action only, never a write |
| Cmd-, | Settings | |
| Cmd-F | Focus the search field of the current table | |
| / | Same as Cmd-F when not typing | |
| J / K or Down / Up | Move row selection in tables | Arrow keys are primary; J K optional |
| Enter | Open selected row in detail pane | |
| Space | Expand or collapse a fault row | |
| C | Copy the selected value or row as text | Only when a row is focused, not inside inputs |
| Esc | Close popover or detail pane; in dialogs per 12.3 | |
| Tab / Shift-Tab | Move focus; in tables moves between interactive cells, not every cell | |
| ? | Show the shortcut list | |

No shortcut triggers a write or a delete. There is no keyboard shortcut for the typed-confirm button; it is only reached by Tab and Enter after the typed text matches.

### 12.3 Dialog and risky-flow rules

| Rule | Detail |
|---|---|
| Dialog role | Typed confirm and "unfinished change" use `alertdialog` with `aria-labelledby` (title) and `aria-describedby` (what will change). Other confirmations use `dialog` |
| Initial focus | Typed confirm: the input. Dialogs with only buttons: the safe, non-destructive button ("Keep current settings"), never the destructive one (X3) |
| Focus trap | Tab and Shift-Tab cycle inside the dialog |
| Esc | Triggers the safe button. In W-07 to W-10 (apply, verify, rollback) Esc does nothing because there is no cancel |
| Return focus | To the control that opened the dialog, or to the next logical control if it no longer exists (e.g. after a write the opener is replaced) |
| Scroll | Background is inert while the dialog is open |
| Announcements | Step changes in W-07 and W-08 announced politely ("Step 2 of 3 sent"). Failure and result banners announced assertively once (`role="alert"`). Live data values are **not** announced continuously |
| Typed confirm | Label includes the exact string to type; the live "Matches" text is a polite live region so a screen reader user hears the match |
| Disabled buttons | A disabled primary button has the reason as text next to it and in `aria-describedby`; never disabled with no explanation |

### 12.4 Tables, charts and gauges

| Element | Rule |
|---|---|
| Semantic tables | Real `<table>`, `<th scope>`, `aria-sort` on sorted headers. Expand control is a button in the first cell with `aria-expanded` |
| Virtualised frame log | `aria-rowcount` and `aria-rowindex` set; copy all reads from data, not the DOM (UL 5.3) |
| Gauge | `role="meter"` with `aria-valuenow`, `min`, `max`, `aria-label` and unit; numeric text is the primary reading |
| Chart | `aria-label`, text summary, "Table view" and "Download CSV" always one click away (UL 5.1) |
| Status updates | Connection state changes use a polite live region; one message per change, deduplicated |
| Skeletons | Hidden from screen readers; a visible text label ("Reading faults...") carries the status |
| Copy | "Copied" appears as text next to the control and in a polite live region |

### 12.5 Testing the rules

| Check | Tool | When |
|---|---|---|
| Automated | axe via `@axe-core/playwright` 4.14.0 (UL; MPL-2.0, dev only) | Each pull request, on S03, S04, S06, S08, typed confirm, connect |
| Screen reader | VoiceOver on the owner's Mac | Week 1 (UL F1, F3) and before each milestone |
| Keyboard only | Manual script | Weekly on the flows in section 14 |
| Greyscale | Screenshot filter | Weekly |
| Contrast | Script from 10.3 re-run when tokens change | On token change |

Gaps in this: no testing with real assistive-technology users; no non-VoiceOver screen reader (NVDA, JAWS, TalkBack) planned in the window.

---

## 13. Observability the UI must emit (so the KPIs can be measured)

Local only, in the session log and History. No network, no telemetry. Event names are proposals.

| Event | Fields | Used by |
|---|---|---|
| `ui.first_run.started` / `.choice` | timestamp, choice (demo or real) | G8 |
| `ui.first_fault_read` | elapsed since process start, adapter type | G8 |
| `ui.scan.finished` | duration, modules asked, answered, retries | G1, G2, G10 |
| `ui.retry.clicked` | which action, after which error id | G10 |
| `ui.auto_reconnect` | attempt count, result | G10 |
| `ui.fault.render` | code, has_description (yes, generic, no), pack id, zone | G6 |
| `ui.session.summary` | faults seen, described, generic only, undescribed, per module class | G6 |
| `ui.snapshot.result` | module, verified or not | G7 |
| `ui.error.shown` | error id (from 8.3) | G10 |
| `ui.link.state` | state, time | G10 |
| `ui.mode_banner.check` | route, present (test only) | G5 |

These events are written to the trace file (`.odtrace`), so a session counted for G1 and G6 can be recomputed offline. Privacy: VIN is hashed in events; never sent anywhere (P10).

---

## 14. Acceptance checklist tied to KPIs G6, G8, G10

How to use: run on the Friday scoreboard. Each item is pass or fail and names an owner of the check. Where a target number comes from `kpis.md`, it is quoted. Items are mine (low); numbers from `kpis.md` are high.

### 14.1 G6 - explains faults in plain English (target: 30 percent at week 4, 60 at week 8, 80 at week 12; measured over captured sessions)

| # | Check | Pass when | How measured |
|---|---|---|---|
| G6-1 | Every fault row shows one of three description states: described, generic only (labelled), or "No description yet" | No row ever shows only a code, in any screen or export | Test over simulator faults and every saved trace |
| G6-2 | A described row shows the source: pack, version, zone, confidence | Source disclosure opens on every described row | Automated test |
| G6-3 | A row never shows a guessed meaning or a severity without a source | 0 rows with severity and no source | Lint plus test with seeded unknown codes |
| G6-4 | The fault screen header and the session summary show "N faults, D described, U undescribed" | Present on S02, S04, in the exported report | Visual check, snapshot test |
| G6-5 | `ui.session.summary` records described, generic-only, and undescribed counts, per source and per module class | Event present for every session with a trace | Trace inspection (G6 reported per source, per features.md section 9) |
| G6-6 | "No description yet" state is designed: has body text, next step, and no error styling | Looks neutral, not a failure; passes greyscale and reads aloud as an informational state | Manual with a person not on the project |
| G6-7 | Plain wording test: 10 sample fault descriptions are read by 3 non-experts who say what the fault means | At least 8 of 10 understood by all 3 (placeholder threshold) | Manual, outside testers (G9 supply) |
| G6-8 | German option names show a gloss | 0 raw German alone in S07 for named options | Test with pack fixtures |
| G6-9 | Copy as text and Save report include description state and source | Present | File check |
| G6-10 | Plain explanation available offline | Works with network off | UL F14 |
| G6-11 | Milestone mapping: M1 and M2 require G6 at least 30 percent | The percentage shown on S02 matches the percent computed from the trace | Compare UI against script on the same trace |

### 14.2 G8 - others can use it (target: clone to first fault read in 15 minutes at week 4, 10 at week 8, 5 at week 12; timed by a person who is not the author; two paths timed separately per AV2 D-17)

| # | Check | Pass when | How measured |
|---|---|---|---|
| G8-1 | **Demo path**: from first launch to first fault list on the demo car takes at most 3 interactions (choose Demo, run scan, open Faults) | Count of clicks or key presses in a screen recording | Timed run |
| G8-2 | **Real path**: from first launch to first real fault read needs no typed addresses and no settings screen | 0 text fields on the way, steps listed on S00 and S01 only | Timed run |
| G8-3 | First screen offers "Try the demo car" and "Connect my adapter" with equal weight | Visual check; no default highlighted | Review |
| G8-4 | Permission prompts are explained before they appear | S00 step 3 appears before the OS prompt; each says why | Manual |
| G8-5 | A person who is not the author completes the demo path inside the week target | Time recorded by the timer; ends at first fault list visible | Non-author trial; for week 12 target 5 minutes |
| G8-6 | No account, email or licence prompt anywhere | 0 occurrences | Review |
| G8-7 | Every blocking state offers a next action button (no dead ends) | Walk the error catalogue: each E-id has a working button | Test per section 8.3 |
| G8-8 | The mode banner is visible from first launch; first-run copy states the app only reads | Test | UL F6 |
| G8-9 | Downloaded app path and `pnpm demo` clone path are timed separately and both reported | Two numbers on the Friday note | Process |
| G8-10 | Works offline | Zero external requests on launch | UL F14 |
| G8-11 | Fresh-clone docs match the UI labels (words on buttons equal words in the quickstart) | Diff of README steps and string keys | Review |

### 14.3 G10 - reliable (finish without a retry: 90 percent at week 4, 95 at week 8, 98 at week 12; across all adapters)

| # | Check | Pass when | How measured |
|---|---|---|---|
| G10-1 | UI records `ui.retry.clicked` and `ui.auto_reconnect` for every retry and automatic reconnect | Events in the trace | Trace inspection |
| G10-2 | Success rate computed from `ui.scan.finished` and retries | Script reproduces the rate | Script |
| G10-3 | Link drop during idle, scan, faults, live, snapshot behaves as in section 9.2 | Simulator "Drop the link" in each phase gives the specified text and state | Automated simulator test (UL F9, AV2 F45) |
| G10-4 | Reads reconnect automatically without the person doing anything, up to the limit | Auto-reconnect success logged | Simulator and one real session per adapter |
| G10-5 | Partial results are kept after a loss (scan, faults) | Results so far remain and are labelled | Test |
| G10-6 | A write is never retried automatically | 0 automatic write retries in any test | Simulator test (G5 overlap) |
| G10-7 | Stale data is never shown as live (P8) | Within 2 s of loss every live value changes state | Timed test |
| G10-8 | Live panel runs for 30 minutes at 10 Hz and 10 channels without memory growth or long frames | Passes UL F9 | Performance test |
| G10-9 | Each error id in 8.3 has a test that shows its text, module state and button | 100 percent of ids | Test matrix |
| G10-10 | After reconnect the car is re-identified; a different VIN never merges results | Test with two simulator cars | Automated |
| G10-11 | The troubleshooter's detected-versus-cannot-tell states are shown, never guessed | Test | Manual |
| G10-12 | Preflight and capability report prevent known-bad starts (low voltage, unreachable module) | Blocks in lab; advice in public | Test |

### 14.4 Cross-cutting acceptance (supports G5 and G11, owned by other checks)

| # | Check | Pass when |
|---|---|---|
| X-1 | Mode banner on every route and state, including errors and dialogs | Automated route walk (UL F6) |
| X-2 | Public bundle contains no write-flow strings or service ids | CI grep (UL F16, G5) |
| X-3 | Only two flows use typed confirm | Search result 2 |
| X-4 | No "safe" or "cannot brick" string exists in the app | Lint on strings (X4) |
| X-5 | Every status has icon, word, colour | Greyscale test |
| X-6 | Token contrast script passes after any token change | CI |
| X-7 | Every value that has a source shows a Source control | Test |
| X-8 | Failure results never auto-dismiss | Test |
| X-9 | No toast carries a safety message | Lint on toast calls |
| X-10 | Share-alike pack data appears with its zone label | Visual check (G11) |

### 14.5 Friday scoreboard fields

Add three columns to the weekly status note: **G6 described %**, **G8 minutes (demo path, app path)**, **G10 no-retry %**, each with the number from the trace, not from memory.

---

## 15. Build order inside the UI (suggestion, not a commitment)

| Week | UI items | Exit check |
|---|---|---|
| 1 | Tokens, mode banner, frame, S01 skeleton, Demo car wiring, UL proof-of-fit F0 to F6 | G-A Dec 1 |
| 2 | S03 module list, S04 fault list with three description states, E-ids 1 to 10 | First G1 traces |
| 3 | S02 overview, S05 live panel with stale states, S14 capability report, connection banner | G-B Dec 11 |
| 4 | S00 first run, S11 demo controls, G8 trial, G10 event logging | M1 Dec 18 |
| 5 | S06 backup, S07 inspect, S13 history | G7 at 3 modules |
| 6 | S08 diff, S12 data sources, S10 settings | |
| 7 to 8 | Lab-only S09 on the simulator (W-01 to W-11), fault-injection UI | M3 Jan 15 |
| 11 | Bench trial of S09 | M4 Feb 12 |

Cut order follows AV2 section 12: chart polish and Demo polish before the safety UI. Never cut: mode banner, capability report, verified-backup flow, W-recover.

---

## Gaps (what could not be established)

1. **No user has seen any of this.** The UX teardown found no usability study of any competitor app, and nobody outside the project has tested these screens. All layout, wording and flow choices are design proposals (low). The G6-7 and G8-5 tests are the first evidence.
2. **WCAG 2.2 was read in part.** The page returned the first 100,000 of about 270,000 characters. Criteria 1.4.1, 1.4.3, 1.4.11, 2.4.7, 2.4.11 and 2.2.1 were confirmed; **2.5.8 target size, 3.3.4 error prevention and 4.1.3 status messages were not reached**, so the 24 px target size and the status-message rule are from my knowledge (medium).
3. **Modal dialog keyboard details** were not re-fetched. The alert dialog page defers to the modal dialog pattern; focus, Tab trap and Esc rules in 12.3 are standard practice, not re-read this run (medium).
4. **Contrast was computed, not measured on rendered output.** Computed ratios are of the specified hex values. Anti-aliasing, colour filters and actual theme application were not tested. Gauge zones were not given colour values.
5. **Where cancel is safe mid-write is unknown** (UX section 8). 7.7 defaults to no cancel; the reviewer and bench tests must decide.
6. **Extended session need** for coding reads on the owner's cars is unknown (features.md Gaps 4). W-02 text for it is a placeholder and the public allow-list may need a safety-reviewer decision.
7. **Timing and count placeholders:** reconnect attempts (5), flapping rule (3 in 2 minutes), module restart wait (35 s), slow-module wait (20 s), service-mode timeout (5 s) are not measured. They are marked as placeholders and must be replaced by values from G10 tests and bench trials.
8. **ENET and CX behaviours** that shape S01 and S14 (discovery, keepalive, which modules the CX reaches) are unmeasured (A2, EVIDENCE summary 3). The capability report text for those is a template.
9. **Fault text supply.** The "described" counts on S02 depend on pack coverage, which features.md and the coverage strategy estimate as thin for BMW. The UI is designed for most rows to be undescribed at first; that is not a solved problem.
10. **Typed-confirm effectiveness** has no measured evidence (UX gap 10). The string format is a proposal. Whether automatic restore after a failed write should skip typing is also an owner call.
11. **Clear faults** is absent from the public build per AV2 10.4. Legal-safety-liability says a reader build may include it (features.md F50). Owner decision Q5 outstanding; if the owner moves it to the public build, S04 needs an outcome-named button and the plain warning on what stays (about 2 days).
12. **Phone layouts** are rules only. Dense table behaviour in a Capacitor web view was not researched (UL Gaps 12).
13. **Assistive technology coverage:** only VoiceOver and axe are planned. No NVDA, JAWS or TalkBack testing; no testing with disabled users.
14. **German and other languages:** string keys are planned, but German diacritic coverage of the Inter subset is untested (UL Gaps 11), and no translation exists.
15. **Audit log design** (S13, 7.12) rests on the UX teardown's own proposal, which cites no authority (UX gap 9).
16. **Brand and logo, app icon, illustration** are not specified.
17. **Newer-car transparency copy** (S14) needs a real capture before it can be accurate; G-series evidence is low for the reason (features.md Gaps 7).
18. **Dashboards:** drag-to-arrange is excluded from the window, so the "user-built dashboards as files" pattern (D17) is only partly met.
19. **The `direction.md` and `EVIDENCE.md` files** were identified by heading only for audience framing and not re-read line by line; persona statements rely on features.md's relay of them.

---

## Sources

Internal (binding or prior research; confidence per the doc's own tag):

| ID | Source | Used for |
|---|---|---|
| I1 | `docs/design/ui/ui-library-decision.md` | Stack, tokens basis, proof-of-fit checks F0 to F17, component list, density, motion, look proposal |
| I2 | `docs/plan/features.md` | Feature IDs F01 to F60, releases, cut ladder, Gaps |
| I3 | `docs/plan/architecture-v2.md` | Hosts, safety layers L0 to L5, write sequence, journal rules, licence zones, plan weeks |
| I4 | `docs/research/deep2/ux-teardown-and-safety-ux.md` | Patterns D1 to D20, X1 to X18, write flow, error rules, audit proposal |
| I5 | `docs/plan/kpis.md` | G6, G8, G10 targets, milestones, quality gates |
| I6 | `docs/plan/decisions.md` | Owner decisions 1 to 7, bench-only writes |
| I7 | `docs/plan/direction.md` (headings and segment table) | Audience S1 to S6 |

External (fetched this run):

| ID | URL | Used for | Conf. |
|---|---|---|---|
| E1 | https://www.w3.org/TR/WCAG22/ (first 100,000 of about 270,000 characters, read through a summarising model) | Contrast 4.5:1 and 3:1 for large text; non-text contrast 3:1; colour not the only means; focus visible; focus not obscured; timing adjustable | high for those criteria; criteria 2.5.8, 3.3.4, 4.1.3 not reached |
| E2 | https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/ | Alert dialog defers keyboard behaviour to the modal dialog pattern; `aria-describedby` references the message | medium |
| E3 | Local script, run 2026-11-20 (WCAG relative luminance formula) | All ratios in 10.3 | high for arithmetic |

Cited through the UX teardown (not re-fetched here): NN/g confirmation dialogs https://www.nngroup.com/articles/confirmation-dialog/, NN/g error guidelines https://www.nngroup.com/articles/errors-forms-design-guidelines/, Raskin https://alistapart.com/article/neveruseawarning, GitHub repository deletion https://docs.github.com/en/repositories/creating-and-managing-repositories/deleting-a-repository, Terraform plan https://developer.hashicorp.com/terraform/cli/commands/plan, git push https://git-scm.com/docs/git-push, MCUboot https://docs.mcuboot.com/design.html, Google SRE canarying https://sre.google/workbook/canarying-releases/ (all high per the teardown).
