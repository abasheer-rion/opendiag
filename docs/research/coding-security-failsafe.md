# ECU Coding Writes: How They Work, How They Fail, and Failsafe Design for OpenDiag

Scope: clean-room, architecture-level research from public sources only. No OEM key algorithms, data files or leaked tooling are described or linked. Claims not backed by a fetched or searched source are marked "(unverified)".

## Summary

- Coding (changing configuration data in an ECU) and programming (replacing its software) both travel over UDS (ISO 14229), but they carry very different risk. Coding writes small data blocks. Programming erases and rewrites flash.
- Every write is gated by a diagnostic session, an unlock step (SecurityAccess 0x27, or newer certificate-based Authentication 0x29), and often a gateway that blocks unauthenticated tools.
- Bricking is almost always one of four things: power sag during a write, an interrupted write, data for the wrong module variant, or a corrupted bootloader. All four are preventable with tooling discipline.
- OpenDiag cannot and should not ship OEM unlock keys. Where unlock is required and not openly available, the tool must say so and stop. It can still deliver most of the value (read, backup, diff, restore, and write on modules with open access) with strong safety patterns.
- Proposed core design: read-before-write, shadow copy, diff preview, write journal, atomic apply with read-back verification, and automatic revert on failure. Section "Implications" gives the concrete pattern set.

## How it works

### 1. Session and unlock layers (UDS)

A write normally follows this ladder. Service IDs and NRC values are from ISO 14229-1 as summarized in public references.

| Step | Request | Positive reply | Purpose |
|---|---|---|---|
| Enter session | `10 03` (extended) or `10 02` (programming) | `50 03 <P2> <P2*>` | Unlocks services not allowed in the default session |
| Keep alive | `3E 80` (suppress reply) | none | Prevents session timeout (S3 timer, typically about 5 s, ECU-specific) |
| Request seed | `27 01` (odd sub-function) | `67 01 <seed bytes>` | ECU issues a challenge |
| Send key | `27 02 <key bytes>` (even sub-function) | `67 02` | Tester proves it knows the secret |
| Write data | `2E <DID hi> <DID lo> <data...>` | `6E <DID hi> <DID lo>` | WriteDataByIdentifier, the main coding write |
| Routine | `31 01 <RID> <opts>` | `71 01 <RID> <status>` | Start a routine (erase, checksum, calibration) |
| Reset | `11 01` | `51 01` | Hard reset so new config takes effect |

Common negative responses (`7F <SID> <NRC>`): 0x22 conditionsNotCorrect, 0x31 requestOutOfRange, 0x33 securityAccessDenied, 0x35 invalidKey, 0x36 exceededNumberOfAttempts, 0x37 requiredTimeDelayNotExpired, 0x72 generalProgrammingFailure, 0x92/0x93 voltageTooHigh/voltageTooLow. Sources: [Wikipedia UDS](https://en.wikipedia.org/wiki/Unified_Diagnostic_Services), [pyudskit session docs](https://pyudskit.readthedocs.io/en/latest/services/session-management/). The 0x92/0x93 codes are in the standard, but I did not find a fetched page quoting them (unverified in this research pass).

Attempt limiting: after N wrong keys the ECU answers 0x36, then 0x37 until a delay expires. Delay length and N are implementation-defined, and some ECUs need a power cycle to clear the counter. Typical delays range from about 10 s to minutes (not from the standard). Source: [UDS knowledge base](https://uds.readthedocs.io/en/v0.0.2/pages/knowledge_base.html), search summary above.

Practical consequence for a tool: brute-forcing or guessing keys can lock the module for a period. A diagnostic tool must never loop on 0x27 blindly.

### 2. SecurityAccess: categories of algorithm, and why keys are not published

Public research and documentation describe a spectrum:

| Category | What it looks like | Weakness |
|---|---|---|
| Static or trivial transform | Seed XOR/add/rotate with a fixed constant | Recoverable from a few seed/key pairs |
| Custom shift/XOR rounds with mask | Fixed number of rounds, 4-byte output | Reverse-engineerable; effective key space can collapse to 2^8 to 2^12 per [Black Hat Asia 2026 AlgoBuster slides](https://i.blackhat.com/Asia-26/Presentations/BHAS26_Jianchi_AlgoBuster.pdf) |
| Small seed space | 16-bit seeds | Brute force is practical, see [Colorado State seed-key talk](https://www.engr.colostate.edu/~jdaily/presentations/2017%20Seed%20Key%20Exchange.pdf) |
| Implementation bugs | Fixed seed after power-on, constant seed bits | Same sources as above |
| Cryptographic MAC | AES-CMAC or HMAC over the seed with a per-ECU or per-group key | Strong if the key stays secret |
| Certificate-based | UDS 0x29 Authentication with PKI (APCE) or challenge-response | Strong; key material lives with the OEM server and HSM. See [embeddedcomputing overview](https://embeddedcomputing.com/application/automotive/new-uds-authentication-enhanced-security-familiar-challenges) |

Why OEM keys and algorithms are not public:

- Legally, they are trade secrets and anti-circumvention-adjacent material, and tied to type-approval and cybersecurity obligations (UNECE R155, unverified here as to exact clauses).
- Technically, modern schemes are keyed. The algorithm may be public (for example AES-CMAC) but the key is held in OEM backends and in the ECU's secure element. Publishing "the algorithm" would give nothing without the key.
- The older weak schemes are the ones that leaked, and that is exactly why OEMs moved away from them.

OpenDiag stance: it can implement the generic client side (send seed request, call a pluggable "key provider", send key, honor NRC 0x36/0x37). It ships no OEM key providers. A key provider can be user supplied, or backed by an official authorization service where one exists. Reverse-engineering an OEM's secret to ship it is out of scope for this project.

### 3. Coding versus programming

| | Coding (configuration) | Programming (reflash) |
|---|---|---|
| What changes | Parameter blocks: options, country codes, lamp behavior, feature enables | Application and calibration software in flash |
| Typical UDS | 0x10 03, 0x27, 0x2E (or 0x31 with a block), 0x11 | 0x10 02, 0x27 (higher level), 0x34 RequestDownload, 0x36 TransferData, 0x37 TransferExit, 0x31 checksum/erase routines |
| Size | Bytes to a few kB | Hundreds of kB to tens of MB |
| Worst case | Module in odd or non-working state, recoverable by rewriting | Dead module if bootloader or erased flash is left incomplete |
| Recovery | Rewrite the saved block | Needs reflash, sometimes bench or boot-mode access |

### 4. Checksums, CRC and signatures on coding blocks

Public observations:

- BMW-style coding data is stored per module in files commonly called CAFD (definition) and NCD (coded values), and read with "Read Coding Data" to create a backup. Sources: [bimmerpost thread](https://f90.bimmerpost.com/forums/showthread.php?p=30488650).
- Mismatches between the coding definition and the module's software version produce errors such as "incorrect message length / invalid format". Source: [bimmerpost g05 thread](https://g05.bimmerpost.com/beta/showthread?p=32734985).
- Whether the module recomputes a CRC itself, or the tool must, differs per ECU (unverified for specific models). Generic pattern: a block ends with a CRC or checksum field. If the tool changes a bit but does not update it, the ECU either rejects the write (NRC 0x31 or 0x72) or accepts it and then falls back to defaults or sets a fault.
- Newer vehicles sign configuration or software. Signature checks happen inside the ECU, so a tool cannot bypass them and should not try.

Design rule: treat the checksum as part of the data model. The tool must know, per module profile, where the checksum is and how to compute it, or else refuse to write.

### 5. Gateways, firewalls, immobilizer and safety modules

- Stellantis (FCA) Secure Gateway: vendor materials describe it as letting unauthenticated users read codes and live data but blocking intrusive functions like bi-directional controls. Independent tools unlock it through the AutoAuth service, which uses challenge-response and requires a registered tool and account. Sources: [eTools AutoAuth overview](https://etools.org/wp-content/uploads/2024/09/AutoAuth-High-Level-Overview-Ver10.pdf), [Hunter handout](https://globalassets.hunter.com/download/assets/AH08640-00_SecureGateway-Handout_%28RevA_07-26%29.pdf/cfce70107aeb11f1b2450a4934c9f094), [Vehicle Service Pros](https://www.vehicleservicepros.com/service-repair/diagnostics-and-drivability/press-release/21235882/cojali-usa-fca-secure-gateway-is-a-lock-on-increased-vehicle-electronics-security). Note: physical bypass methods exist in aftermarket circles; OpenDiag should not document or support them.
- BMW, Mercedes, Toyota: gateways route diagnostics between bus segments. Newer models may require an online authorization or a certificate before writes (unverified for individual models; search found no public detail).
- SecOC (AUTOSAR) authenticates in-vehicle messages with a MAC and freshness value. It does not encrypt, and it is separate from DoIP's TLS option. Sources: [AUTOSAR SecOC spec](https://www.autosar.org/fileadmin/standards/R23-11/FO/AUTOSAR_FO_PRS_SecOcProtocol.pdf), [Alten overview](https://www.altenpolska.pl/en/2025/07/28/secure-onboard-communication-secoc-in-autosar-architecture-and-practical-implementation/), [aivon summary](https://www.aivon.com/blog/security-devices-systems/autosar-automotive-security-mechanisms/). Implication: a tool that only injects diagnostic frames is unaffected, but coding that changes shared message definitions can desync modules.
- Immobilizer, key and airbag/ABS/steering modules: these hold vehicle-unique secrets (keys, VIN binding, crash data). Replacing or re-coding them typically needs OEM-authorized flows (unverified in detail). OpenDiag should classify them as "blocked by default" with read-only support.

## What is hard

1. **Power.** Programming events assume stable voltage. A vendor article says the vehicle's system voltage can fall below a manufacturer-specific threshold during programming, and that Mercedes modules abort when voltage gets too low ([Vehicle Service Pros, Clore](https://www.vehicleservicepros.com/training-and-resources/guest-blogs/blog/55375852/clore-automotive-the-great-programming-uh-oh-when-voltage-drops-below-the-line)). Tuning-community sources give about 12 V minimum as a rule of thumb, which is not an OEM spec ([ECU recovery manual](https://cdn.shopify.com/s/files/1/0885/5830/files/ECU_Recovery_Manual_PDF.pdf)).
2. **Interrupted writes.** A cut during erase or transfer leaves flash half written. Whether the ECU survives depends on whether its bootloader is separate and protected. A corrupt bootloader can leave a module stuck ([HP Academy thread](https://www.hpacademy.com/forum/reflashing/show/bricked-ecu-recovery/)).
3. **Wrong variant.** Coding or software data built for another module revision or software level. Symptoms: format errors, rejected writes, or worse, accepted but wrong behavior. Restoring an older backup onto a newer software level is reported as risky ([bimmerpost](https://g30.bimmerpost.com/forums/showthread.php?p=31613324)).
4. **Silent partial success.** A write returns positive but the module normalizes or clamps values, or applies them only after reset. Only a read-back after reset proves the result.
5. **Interlocks.** Writes need ignition state, engine off, speed zero, sometimes other modules asleep. NRC 0x22 means this, and tools must report it, not retry.
6. **Variant knowledge.** Knowing which bytes mean what requires a definition file per module and software level. OEM definition files are proprietary. OpenDiag must build its own, from public descriptions and user contribution.
7. **Rollback is not always possible.** Flash rewriting may be one-way (anti-rollback counters, signed images). Coding rollback is usually possible, but only if a full backup exists.
8. **Regulatory pressure.** UNECE R156 expects manufacturers to manage updates, including safe failure handling. Secondary sources say rollback plans are part of good practice, though I did not find the regulation's exact text ([UL summary](https://www.ul.com/sis/insights/software-update-management-systems-according-unece-r156)). A real example: a Volvo bulletin describes a vehicle staying in a safe state after a critical failed update until a workshop procedure releases it ([NHTSA TSB list](https://static.nhtsa.gov/odi/tsbs/2023/MC-10245600-0001.pdf), unverified match).

## Open-source options

| Project | Use for OpenDiag |
|---|---|
| [uds / pyudskit docs](https://uds.readthedocs.io/en/latest/pages/knowledge_base/service.html), [pyudskit](https://pyudskit.readthedocs.io/en/latest/concepts/security-access/) | Reference for service and NRC behavior |
| iso14229 C library | Server and client UDS stack. Note a 2026 CVE in its 0x27 handler (out-of-bounds read on a short request) per [Lutra field guide](https://fieldguide.lutrasecurity.com/CVE-2026-54413/). Fuzz the OpenDiag parser. |
| [RAMN](https://ramn.readthedocs.io/en/latest/userguide/diag_tutorial.html) | Open ECU test bench. Use as a safe target for write-path testing. |
| python-can, python-udsoncan, ISO-TP stacks | Transport and client plumbing (names from general knowledge, license check needed) |
| [Dev.to UDS flashing article](https://dev.to/beefedai/implementing-robust-uds-diagnostics-and-secure-ecu-flashing-2g73) | Sequence reference; secondary source |

A testing ECU simulator with fault injection (drop power mid-write, return 0x37, return 0x72) is a must-build, because real bricking cannot be a test method.

> Evidence update 2026-11-20: field evidence from `research/deep/bmw-coding-failures-and-recovery.md`. BMW's own dealer programming fails and has a recovery team; the head unit is the module BMW documents failing most. Restore from backup is not guaranteed (reports of "coding data invalid"), so keep two verified backups plus an exported bundle. Many "bricked" modules were corrupted coding fixed by rewriting. No source publishes a failure rate for any tool, so OpenDiag has to measure its own.

## Implications for OpenDiag: failsafe design patterns

Principle: every write is a transaction the tool can explain, verify and undo. If it cannot undo, it must say so before starting and require a stronger confirmation.

### Capability tiers

| Tier | Meaning | Default |
|---|---|---|
| T0 Read | DIDs, DTCs, live data, coding read | On |
| T1 Reversible coding | Small blocks, full backup exists, no flash change | On, with safeguards below |
| T2 Coding with side effects | Affects multiple modules, key-related, or needs online auth | Off, per-module opt-in |
| T3 Programming (flash) | Reflash | Off in v1 |
| T4 Immobilizer, airbag, steering, brakes | Safety or theft relevant | Blocked |

### Patterns

1. **Read-before-write.** Before any write, read the full current coding block. Refuse if the read fails or is incomplete.
2. **Shadow copy.** Save the raw bytes, session metadata (ECU ID, software and hardware numbers, VIN, tool version, timestamp) and hash to a local, append-only store before the first write. Never overwrite a prior shadow copy. A backup is only valid once it can be re-read and hash-matched.
3. **Module identity check.** Compare ECU part number, software version and variant to the profile used for the change. Mismatch means hard stop with a plain message, not a warning.
4. **Diff preview.** Show before and after as named fields (from the OpenDiag-authored definition) plus raw byte diff. Highlight changed checksum bytes. The user confirms the diff, not just the feature name.
5. **Dry run.** Run every precondition and step except the final write: session, unlock (if a key provider exists), voltage and state checks, byte-level validation, checksum recomputation. Report "would succeed" or the first blocker.
6. **Preflight gates (all must pass).**
   - Voltage at or above a profile minimum and stable. Use adapter voltage readout where available (for example OBD pin 16 measurement). Recommend a bench supply or battery maintainer for any multi-write job.
   - Ignition state as required, engine off, vehicle stationary, no charging or sleep events (unverified per vehicle).
   - Gateway authenticated, if required.
   - Adapter link quality healthy (no recent frame loss).
7. **Write journal.** An append-only log (one line per request and reply, with timestamps and raw bytes) written to disk and fsynced before each write is sent. If the app or PC dies, the next start sees an open transaction and offers recovery.
8. **Atomic apply.** Treat a coding change as: prepare, write, reset if needed, read back, compare, commit. The transaction is "committed" only after read-back matches the intended bytes. Where the ECU supports a staged write with a validity routine, use it. Where it does not, minimize the write window: one write request per block, no interleaved services.
9. **Voltage and link watchdog during apply.** Abort between requests, never mid-transfer, if voltage drops below threshold. For a flash transfer (T3) there is no safe abort point once erase starts, so T3 requires external power and a second confirmation.
10. **Auto-revert.** If read-back differs, an NRC other than the expected ones arrives, or the module stops responding: wait for it to wake, then rewrite the shadow copy and verify. Cap retries (for example 2) and respect 0x36/0x37 timing so a revert does not lock the module. If revert fails, stop and show exact recovery steps with the saved files.
11. **Recovery mode.** If a module does not respond after an apply, the tool must not keep hammering it. It should power-cycle guidance, wake-up probing at low rate, then show the shadow copy and export bundle.
12. **Rate and attempt limiting.** One 0x27 sequence per attempt, honor delay timers, and abort after the first 0x36. Do not auto-retry key sends.
13. **Profile signing.** Coding profiles (module definitions and change recipes) are signed by project maintainers, versioned, and carry a tested-on list (vehicle, module, software level). Unknown module or level means read-only.
14. **Export bundle.** A one-click archive: shadow copies, journal, diff and a human-readable report, so a user or a workshop can restore from another tool.
15. **Honest scoping.** The UI states plainly which modules and functions are supported, which are blocked and why, and that some changes need OEM authorization OpenDiag does not provide.

### Concrete transaction sketch

```
begin_txn(module, profile)
  assert profile.matches(identity_read(module))
  shadow = read_block(module); save(shadow); verify_reread(shadow)
  new = apply_edit(shadow, change); new = fix_checksum(profile, new)
  show_diff(shadow, new) -> user_confirm
  preflight(voltage, ignition, gateway, link) or abort
  journal.open(txn_id)
  session(extended); unlock_if_needed(key_provider)
  write(new)                      # 2E
  reset_if_required()             # 11 01
  check = read_block(module)
  if check == new: journal.commit(); else: revert(shadow); verify; journal.fail()
```

## Open questions

1. Which target modules allow coding without OEM-issued unlock, and what is the realistic first-release list per brand?
2. Can the supported adapters measure battery voltage accurately enough (and fast enough) to be a reliable gate? What is the sampling rate?
3. Where do checksums live for each initial target module, and does the ECU or the tool compute them? Needs lab verification on a bench ECU.
4. How do we author open definition files without copying proprietary ones? Options: user-contributed captures, community diffs, public documentation. Needs a legal review.
5. Does revert always work on modules with anti-rollback or signed configuration? Probably not; need a per-profile "revertable" flag.
6. What do the regulators (UNECE R155/R156, right-to-repair rules) say about independent tools writing configuration? Need primary-source reading.
7. How should OpenDiag handle OEM online authorization (for example Mercedes SCN-style online coding)? Not verified in this pass; treat as out of scope until researched.

## Sources

- Wikipedia, Unified Diagnostic Services: https://en.wikipedia.org/wiki/Unified_Diagnostic_Services
- pyudskit, session management: https://pyudskit.readthedocs.io/en/latest/services/session-management/
- pyudskit, security access: https://pyudskit.readthedocs.io/en/latest/concepts/security-access/
- UDS knowledge base: https://uds.readthedocs.io/en/v0.0.2/pages/knowledge_base.html
- UDS services reference: https://uds.readthedocs.io/en/latest/pages/knowledge_base/service.html
- RAMN diagnostics tutorial: https://ramn.readthedocs.io/en/latest/userguide/diag_tutorial.html
- Dev.to, robust UDS diagnostics and ECU flashing: https://dev.to/beefedai/implementing-robust-uds-diagnostics-and-secure-ecu-flashing-2g73
- Black Hat Asia 2026, AlgoBuster: https://i.blackhat.com/Asia-26/Presentations/BHAS26_Jianchi_AlgoBuster.pdf
- Colorado State, seed-key exchange: https://www.engr.colostate.edu/~jdaily/presentations/2017%20Seed%20Key%20Exchange.pdf
- Lutra Security, CVE-2026-54413: https://fieldguide.lutrasecurity.com/CVE-2026-54413/
- Embedded Computing, UDS Authentication (0x29): https://embeddedcomputing.com/application/automotive/new-uds-authentication-enhanced-security-familiar-challenges
- AUTOSAR SecOC protocol spec R23-11: https://www.autosar.org/fileadmin/standards/R23-11/FO/AUTOSAR_FO_PRS_SecOcProtocol.pdf
- Alten, SecOC overview: https://www.altenpolska.pl/en/2025/07/28/secure-onboard-communication-secoc-in-autosar-architecture-and-practical-implementation/
- aivon, AUTOSAR security mechanisms: https://www.aivon.com/blog/security-devices-systems/autosar-automotive-security-mechanisms/
- AutoAuth high-level overview: https://etools.org/wp-content/uploads/2024/09/AutoAuth-High-Level-Overview-Ver10.pdf
- Hunter Secure Gateway handout: https://globalassets.hunter.com/download/assets/AH08640-00_SecureGateway-Handout_%28RevA_07-26%29.pdf/cfce70107aeb11f1b2450a4934c9f094
- Vehicle Service Pros, Secure Gateway: https://www.vehicleservicepros.com/service-repair/diagnostics-and-drivability/press-release/21235882/cojali-usa-fca-secure-gateway-is-a-lock-on-increased-vehicle-electronics-security
- Vehicle Service Pros, programming voltage: https://www.vehicleservicepros.com/training-and-resources/guest-blogs/blog/55375852/clore-automotive-the-great-programming-uh-oh-when-voltage-drops-below-the-line
- ECU recovery manual (tuner): https://cdn.shopify.com/s/files/1/0885/5830/files/ECU_Recovery_Manual_PDF.pdf
- HP Academy, bricked ECU thread: https://www.hpacademy.com/forum/reflashing/show/bricked-ecu-recovery/
- Bimmerpost coding threads: https://f90.bimmerpost.com/forums/showthread.php?p=30488650, https://g30.bimmerpost.com/forums/showthread.php?p=31613324, https://g05.bimmerpost.com/beta/showthread?p=32734985
- UL, UNECE R156 SUMS: https://www.ul.com/sis/insights/software-update-management-systems-according-unece-r156
- NHTSA TSB (safe-state example): https://static.nhtsa.gov/odi/tsbs/2023/MC-10245600-0001.pdf
