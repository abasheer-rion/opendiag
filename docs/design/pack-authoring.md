# Writing a coding pack

For contributors. A pack is a plain JSON file that says what one setting in a car's module means. It holds data only, never code. The full schema is in [data-schema.md](data-schema.md).

## What you need

- Your own car, a cable, and OpenDiag.
- A way to change exactly one setting in the car's own menu (for example the iDrive settings).
- Nothing copied from another tool, a leaked file, or a paid manual. Write every label in your own words.

## Steps

1. Make a backup: `pnpm cli backup --adapter enet:HOST --target 0x60 --did 0x3000:64`
2. Change ONE setting in the car's menu. Change nothing else.
3. Make a second backup the same way.
4. Compare them: `pnpm cli backups list`, export both with `backups export ID --out a.json`, then `pnpm cli diff a.json b.json --json > diff.json`
5. Start the entry: `pnpm cli pack init --from-diff diff.json --out my-pack.json`. If a checksum byte also moved, add `--ignore 62,63` with its byte numbers.
6. Open `my-pack.json`. The tool filled in what the diff proves: block, byte, bit, length, and the two values. Everything else says `TODO_FILL_IN`. The `unknown_fields` list names what you still owe. Fill those in, then delete the list.
7. Check it: `pnpm cli pack lint my-pack.json`. Fix every message until it says ok.
8. Send it as a pull request.

## What lint checks

| Rule | Why |
|---|---|
| `source_type` is one of: public_standard, vendor_public_doc, owner_capture, community_report, maintainer_lab | We must know where it came from |
| a `source_url` or a `capture_id` | So a reviewer can check it |
| `confidence` is low, medium or high | Be honest. High needs two different people with passing tests |
| `tested_on` has dated pass or fail results | Untested entries stay low and read-only |
| `license` is CC0-1.0 or CC-BY-4.0 | Keeps the main pack free to reuse |
| no `TODO_FILL_IN` left | Unfinished entries never ship |
| no ODX or other vendor-supplied files as a source | Clean-room rule |

CC-BY-SA-4.0 data is allowed only in a separate folder, `packs/share-alike/`. It is loaded into its own namespace and is never merged into the main pack. A main-pack file with a share-alike licence fails lint, and so does a share-alike file with any other licence.

## What we will not accept

These are blocked in code. Lint fails with a clear message, and the app and CLI refuse to load the pack even if you skip lint.

- Anything that hides or switches off emissions faults or the check-engine lamp: particulate filter (DPF), catalyst, EGR, EVAP, oxygen sensors, readiness monitors, MIL.
- Airbags and seat-belt systems.
- ABS, brakes, stability control.
- Steering.
- Immobiliser, keys, transponders.
- Odometer or mileage.
- Speed limiter removal.
- Seed or key material of any kind.

The check looks at the option's id, label, category, module, tags and value labels. It is blunt on purpose. If a harmless option trips it by accident, rename the option; do not ask for the rule to be loosened.

Good targets: lighting, comfort, display, convenience, and "welcome" behaviours.

## Example (trimmed)

```json
{
  "id": "cabin-light-delay",
  "label": "Cabin light stays on after the door closes",
  "category": "lighting",
  "module": "body-example",
  "block": { "did": 12288, "length": 16 },
  "field": { "byte_offset": 2, "bit_offset": 0, "bit_length": 2 },
  "values": [{ "raw": 0, "label": "Short" }, { "raw": 1, "label": "Long" }],
  "default_raw": 0,
  "risk_tier": "T0",
  "provenance": {
    "source_type": "owner_capture",
    "capture_id": "cap-0001",
    "confidence": "medium",
    "tested_on": [{ "date": "2026-10-01", "result": "pass", "chassis": "EXAMPLE", "contributors": ["gh:example"] }]
  },
  "license": "CC0-1.0"
}
```

More samples, good and bad, are in `packages/core/test/fixtures/packs/`.

## Privacy

Never post a VIN. Use `backups export`, which replaces the VIN with a one-way hash and removes serial numbers, before sharing any file.
