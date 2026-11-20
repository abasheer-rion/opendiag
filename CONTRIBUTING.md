# Contributing

## Clean-room rule (hard requirement)

Do not submit anything derived from proprietary tools or their data: no ISTA/E-Sys/XENTRY/Techstream files, no leaked SGBD/PRG/CAFD/ODX, no decompiled code, no keygens. Contributions must come from public standards, public documentation, your own captures from your own vehicle, or open-source projects with compatible licenses.

Every data-pack entry needs a `source` and `license` field.

## Workflow

1. Open an issue before large changes.
2. Fork, branch, keep PRs small.
3. CI must pass. Anything that writes to a vehicle must have simulator tests.
4. Anything touching the write pipeline needs two reviews.

## Reporting vehicle results

Say the car (model, year, chassis), the adapter, and the exact steps. Never post VINs.

## License

By contributing you agree your work is licensed under Apache-2.0.
