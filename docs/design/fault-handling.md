# OpenDiag Fault (DTC) Handling Design

Design note. Grounded in `docs/research/` (cited by file name). Not legal advice. Have counsel review the policy in section 6 before release. Items marked "(unverified)" need confirmation.

## Summary

- OpenDiag reads, explains, saves and clears fault codes. Clearing is gated and always preceded by a saved snapshot.
- "Ignore a fault" is split in two. **Hiding it in OpenDiag's own screens is allowed.** **Stopping the car from recording or showing it is blocked.**
- Emissions and safety faults can be hidden locally only with limits. They still show in reports and never change what the vehicle stores.
- The line comes from the legal research: the Clean Air Act targets defeating emission controls and clearing codes to hide faults, and 49 U.S.C. 30122 covers making safety devices inoperative (`open-source-landscape-and-legal.md`).

## 1. Reading faults

### OBD-II (any car, any adapter)

| Mode | Gives | Request example |
|---|---|---|
| 03 | Stored (confirmed) DTCs | `7DF: 01 03` |
| 07 | Pending DTCs | `7DF: 01 07` |
| 0A | Permanent DTCs (cannot be cleared with mode 04) | `7DF: 01 0A` |
| 02 | Freeze frame | `7DF: 03 02 0C 00` (PID 0C, frame 0) |
| 01 PID 01 | MIL status, DTC count, readiness bits | `7DF: 02 01 01` |

Source for modes: `protocols.md`. The 2-byte DTC decode: top two bits give P, C, B or U, next two bits the first digit, then three nibbles. `01 33` is P0133 (`protocols.md`).

### UDS (manufacturer modules)

| Request | Meaning |
|---|---|
| `19 01 <mask>` | Count DTCs matching the status mask |
| `19 02 <mask>` | List DTCs and status bytes |
| `19 04 <DTC3> <rec>` | Snapshot (freeze-frame style) record for one DTC |
| `19 06 <DTC3> <rec>` | Extended data record (counters, aging) |
| `19 0A` | All DTCs the module supports |

Example from `protocols.md`: `7E0: 03 19 02 08` returns `59 02 FF 03 01 00 09`: availability mask FF, DTC `030100`, status `09`. Mask 0x08 means confirmed. The 19 04/06/0A formats are from general knowledge of ISO 14229 (unverified in this pass).

### Status byte

Decode all 8 bits (testFailed, thisCycle, pending, confirmed, notCompletedSinceClear, failedSinceClear, notCompletedThisCycle, warningIndicator), as listed in `protocols.md`. Map to three user states: **Active** (testFailed set), **Stored** (confirmed, not currently failing), **Pending** (pending only). Toyota's "current, pending, history" (`toyota-lexus-techstream.md`) maps the same way.

### Scan flow

1. Identify the car: VIN (`22 F1 90`), then module identity (`identify` block in the pack, see `data-schema.md`).
2. Functional OBD sweep (0x7DF), then per-module UDS reads for modules in the matching pack.
3. Retry on `0x78` (response pending). Treat other negative replies as "not supported", not errors.
4. Store everything raw plus decoded in a local scan record (section 5).

Gateway note: some cars route modules behind a central gateway and may block reads without authentication (`coding-security-failsafe.md`). Show "module not reachable" with the reason, never try a bypass.

## 2. Freeze frame and snapshot

- OBD mode 02: one frame per DTC. Toyota can hold up to five frames per DTC, each with a frame number (`toyota-lexus-techstream.md`). Request frames 0 to 4 until the ECU says none.
- Show: engine speed, load, coolant temperature, fuel trim, vehicle speed, and the frame's trigger code, using the PID table in the data pack.
- UDS 19 04 snapshot: decode the returned DIDs with the module's DID entries. Unknown DIDs show as raw hex.
- Always save the frame before any clear, since clearing erases it.

Display rule: raw value, decoded value, unit, and "source: pack entry X / unknown". An unknown value is never guessed.

## 3. Explaining a fault

Lookup order, first hit wins:

1. Module-specific entry in the loaded pack, matching the module variant (`dtcs[]` in `data-schema.md`).
2. Generic OBD-II description in `generic/dtc-generic.yaml` (own wording).
3. Standard family text for the code range (for example "P01xx fuel and air metering"). Range names are structural, not copied.
4. Raw code plus status decode and "no description available. Add one?" with a link to contribute.

Each explanation shows:
- Plain sentence (the `plain` field), the technical text, and `likely_causes` as a short list.
- Class tag: emissions, safety, comfort, network, or unknown.
- Provenance chip and confidence (community entries say so).
- Freeze-frame hints.
- A "do not guess" line: causes are hints, not a repair verdict. The tool does not promise to fix a warning light (`open-source-landscape-and-legal.md`, liability).

Safety rule: unknown class is treated as `safety` for policy purposes.

## 4. Clearing faults

### Service

- OBD: mode 04 (`7DF: 01 04`). It erases stored DTCs, freeze frame data and resets readiness monitors. It does not clear permanent DTCs (mode 0A).
- UDS: `14 FF FF FF` clears all groups. Smaller groups are possible per module. Reply `54`.

### Gates (all required)

1. **Snapshot first.** Read and save DTCs, status bytes, freeze frames and readiness. If saving fails, abort.
2. **Explain what clearing does.** One screen: "This erases saved fault info and freeze frames, turns off the warning light until the fault returns, and resets the self-tests (readiness). The fault comes back if the cause is still there."
3. **Intent prompt.** User picks: "I repaired it" or "I want to see if it returns". The choice is logged. There is no option like "hide before an inspection".
4. **Conditions.** Engine state and ignition as the module needs. NRC `0x22` is shown and not retried (`coding-security-failsafe.md`).
5. **Rate limit.** More than 3 clears in 24 hours on one VIN shows a warning that repeated clearing resets readiness. A clear is not repeated automatically.
6. **Verify.** Re-read after clear and show which codes came back immediately (a hard fault).

### Readiness warning

After a clear, readiness monitors show "not ready". The app shows this on the status screen and the export report. It never offers to edit readiness bits or fake them (`open-source-landscape-and-legal.md`, refusal list).

### Safety-class clears

Clearing safety-class faults (airbag/SRS, brakes, steering) is T4: blocked by default, read-only (`coding-security-failsafe.md`, capability tiers). A user can view and export them but clearing needs the module's OEM-authorized flow, which OpenDiag does not provide.

## 5. Local data

SQLite on the user's device, no cloud by default.

```sql
create table scan (id integer primary key, vin text, taken_at text, adapter text, app_version text);
create table fault_event (
  id integer primary key, scan_id integer references scan(id),
  module text, code text, status_byte integer, class text,
  freeze_json text, raw_hex text, source text      -- pack entry id or 'unknown'
);
create table local_mute (
  id integer primary key, vin text, module text, code text, class text,
  muted_at text, expires_at text not null, reason text
);
create table clear_log (id integer primary key, scan_id integer, at text, intent text, scope text);
```

Scans and clear logs are append-only. This matches the write-journal idea in `coding-security-failsafe.md`.

## 6. The "ignore a fault" policy

The request: let users ignore a fault. This section decides what that means. It follows the legal research: the main risk is purpose and design, and the line is "clears codes to hide a fault" or "turns off or masks emissions systems" versus normal diagnosis and repair (`open-source-landscape-and-legal.md`, Clean Air Act and implication 5).

### Allowed: hide locally in the UI

"Mute" changes only what OpenDiag draws on the screen. It sends nothing to the car.

| Rule | Detail |
|---|---|
| Scope | Per VIN, per module, per code. Stored in `local_mute` on the device |
| Expiry | Required. 7, 30 or 90 days, then it returns. No "forever" |
| Visibility | A muted fault moves to a collapsed "Muted (n)" row. The count is always visible |
| Reports | Exports and shared scans list muted faults, marked "muted by user" |
| Reappears | A mute auto-cancels if the status changes from stored to active, if a freeze frame shows new values, or if the code's class changes |
| Emissions class | Can be muted. The status screen still shows MIL on, readiness state, and "emissions fault muted in app" |
| Comfort/network class | Can be muted normally |
| Safety class | Not mutable. The user can acknowledge it for one session ("I have read this") but it stays on screen |
| Unknown class | Treated as safety |

Why this is acceptable: it does not alter the vehicle, hide anything from an inspector, or edit data. The ECU still stores and reports the fault. It is the same as a user ignoring a warning on a scan tool.

### Blocked: change what the vehicle does

These are refused in code and not offered as features. The pack linter rejects them (`data-schema.md`, validation rule 7).

1. Suppress or disable DTC setting or reporting in the ECU. That includes UDS ControlDTCSetting off (`85 02`) outside an OEM-style programming procedure. In v1 there is no flashing, so the service is not exposed at all (`coding-security-failsafe.md`, T3 off in v1).
2. Coding or adaptations that turn off a monitor or fault check: DPF, EGR, SCR/AdBlue, catalyst, O2 sensor monitors, readiness (`open-source-landscape-and-legal.md`).
3. Clear-to-hide: clearing with no repair purpose, or scripts that clear on a timer or before a known inspection. Rate limit and intent prompt in section 4 are the guard.
4. Editing readiness status or fabricating monitor results.
5. Disabling or clearing airbag/SRS, seat-belt, brake or steering fault logic, or the warning lamps of those systems (49 U.S.C. 30122 risk, inferred for airbags, same file).
6. Immobilizer or key faults bypass, and odometer changes.
7. Fake DTC emulation to a scan tool or an inspection station (spoofing readiness or MIL).

### Gray areas and how we decide

| Case | Decision |
|---|---|
| User wants a persistent comfort-system warning gone (for example a tire-pressure message after fitting different wheels) | Local mute only. Coding to disable the check is a pack entry only if class is comfort, `revertable`, and reviewed |
| Aftermarket part triggers an emissions fault | Local mute with expiry, plus a message that the car may fail inspection. No ECU change |
| Fault returns right after clear | Show the freeze frame and causes. Offer export. Do not offer suppression |
| Diagnostic session where a flash requires DTC setting off | Out of v1. Later, only inside a signed programming transaction that re-enables it and logs it |

### Wording in the UI

- Button text is "Mute in OpenDiag" not "Ignore" or "Hide fault".
- A short note: "This only hides it here. Your car still stores it, and a repair shop or inspection will still see it."
- Docs and README state the refusal list and that OpenDiag will not add suppression. This also helps with the trademark and affiliation disclaimers.

### Jurisdiction caveat

US law is described in the research. EU emissions and national tampering rules were not researched (`open-source-landscape-and-legal.md`, open questions). Counsel should confirm whether an emissions-class local mute raises any risk and whether a "no forever mute" rule is needed.

## 7. Tests

- Fake ECU (python-can virtual bus) with scripted answers for 03, 07, 0A, 02, 04, `19 02`, `19 04`, `14`. Include `0x78` delays and a mode 0A DTC that survives a clear.
- Golden decode vectors: `01 33` gives P0133; `59 02 FF 03 01 00 09` decodes to confirmed and testFailed.
- Policy tests: safety-class mute attempt is refused. Mute expires. Clear without snapshot fails. Pack with a monitor-disable entry fails lint.
- Fault injection: ECU returns `0x22` on clear, drops mid-reply. App reports and does not retry blindly.

## Open questions

1. Can all target modules report class (emissions/safety) reliably, or does the pack have to carry it per code? Unknown codes default to safety.
2. Do Mercedes and BMW modules behind gateways allow `19 04` snapshots without authentication (`mercedes-xentry-das.md`, `coding-security-failsafe.md`)? (unverified)
3. Is a 7-90 day mute window the right range, and does the legal review want emissions mutes removed?
4. Should the app show an "inspection readiness" summary, or does that invite clear-before-inspection use?
5. How to treat Toyota "Vehicle Control History" entries that log without a DTC (`toyota-lexus-techstream.md`)?

## Sources

- Research notes: `protocols.md`, `open-source-landscape-and-legal.md`, `coding-security-failsafe.md`, `toyota-lexus-techstream.md`, `mercedes-xentry-das.md`
- 40 CFR 1068.101 (tampering): https://www.law.cornell.edu/cfr/text/40/1068.101
- 49 U.S.C. 30122: https://www.law.cornell.edu/uscode/text/49/30122
- EPA 2020 tampering policy: https://www.epa.gov/sites/production/files/2020-12/documents/epatamperingpolicy-enforcementpolicyonvehicleandenginetampering.pdf
- UDS overview: https://en.wikipedia.org/wiki/Unified_Diagnostic_Services
- Toyota multiple freeze frame (Snap-on): https://www.snapon.com/EN/UK/Diagnostics/News-Centre/Technical-Focus-Archive/toyota-multiple-freeze-frame
- Supabase RLS guide (for the shared-database side): https://supabase.com/docs/guides/database/postgres/row-level-security
