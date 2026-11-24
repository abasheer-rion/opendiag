# Capture session runbook (plain words)

One command does the whole car session. It reads, saves everything to a private folder, and (only if you ask, and only at the very end) clears faults once.

Read `docs/plan/research-sprint.md` section 4.1 (safety rules) first. This page is only the steps.

## Before the car

1. Close every other car app on every phone and tablet. No bootmod3, no BimmerCode.
2. Make sure the repo is on `main` with nothing changed. Do not pull or edit code during the session.
3. Pick a NEW private folder outside the repo, for example `~/Projects/opendiag-captures-private/2026-11-24-capA`. The tool creates it (owner-only access). It refuses a folder inside any git repo or one that already has files.
4. Practice once with no car: `pnpm cli session --out ~/Projects/opendiag-captures-private/practice1`. This uses the built-in simulator. Delete the practice folder when done.

## In the car

1. Measure the battery. Write the number down. Start only at 12.4 V or more. Connect a maintainer if you have one.
2. Plug the WiFi adapter in. Ignition on, engine off. Wait 30 seconds. Join the adapter's WiFi on the laptop.
3. Optional: start the packet capture from section 4.3 step 5 in another terminal.
4. Run the read-only session (replace the address with the adapter's; add the clear flags from the next section if you want the clear):

```
pnpm cli session --adapter enet:ADDRESS --out ~/Projects/opendiag-captures-private/2026-11-24-capA --idle 300 --backup
```

   It prints one line per step. It takes about 10 minutes with the 5 minute idle gap. Do not touch anything else while it runs.

5. If it prints `STOPPED`, it has already saved what it had. Turn the ignition off, wait 30 seconds, unplug, write down what happened. Do not retry the same day. Do not clear.

## The one-time clear (last, optional)

Add three flags to the same command if you want the clear. Nothing is cleared until the very end, after the faults are saved and you type `CLEAR`.

```
pnpm cli session --adapter enet:ADDRESS --out ~/Projects/opendiag-captures-private/2026-11-24-capA --idle 300 --backup --clear-target 0x12 --battery-volts 12.6 --yes-clear
```

Use the real battery number you measured just before. When the run reaches the end it shows how many faults it will clear and waits. Look at the car first: no new warning lamp, no odd cluster behaviour. Type `CLEAR` and Enter to go ahead. Anything else cancels and nothing is sent. It clears the one module you named, then reads its faults once more.

It will refuse, and send nothing, if: no battery number or under 12.4, `--yes-clear` missing, the target is not exactly one module, the run stopped early, the module did not answer the scan, its saved fault list is empty, or you did not type `CLEAR`. A refusal is not a problem. Read the message.

The flags are checked before anything is sent to the car, so a typo shows up straight away. The saved faults, the module check and the typed word are checked at the end.

## What to expect

- `vin`, `dtc`, `pids`, `scan` (about 112 quick pings), `did`, `probe` (32 reads on up to 5 modules), then `vin_2` and `scan_2`, the idle gap, `vin_after_idle`.
- Failed steps do not always stop the run. A module saying "not supported" is normal. It stops on: a lost connection, no answer to the first VIN or fault read, or an odd refusal such as "busy", "conditions not correct" or "voltage" from the car.
- `--backup` saves identification data only (part and software numbers and similar). We do not yet know the real coding identifiers, so this is not a coding backup.

## What is in the folder

| File | What it is | Shareable? |
|---|---|---|
| `session.json` | Every step with timing in ms, module list, counts, errors | Yes after you read it (no VIN, no address) |
| `session.shareable.odtrace` | The request and answer trace with VINs hashed and addresses removed | Yes after you read it |
| `session.odtrace` | Raw trace, has the real VIN | Never |
| `dtc.json` | Faults, saved first | Never (private) |
| `clear.json` | Faults before and after the clear | Never (private) |
| `backups/` | Identification backups, has the VIN | Never |
| `salt.private` | Secret used for the hashes | Never |

Keep the whole folder private. Do not back it up to a shared cloud folder.

## What to send back

Tell me in chat (no VIN, no WiFi name, no address):
- Battery voltage at start, middle and end, and whether a maintainer was connected.
- Whether the run finished or printed `STOPPED` (and the line).
- Any new warning lamp, cluster behaviour or smell.
- Whether you ran the clear, and what `dtc` showed afterwards.

Then say yes in chat and I will read `session.json` and `session.shareable.odtrace` from the folder you point me to. Do not paste or upload the other files.
