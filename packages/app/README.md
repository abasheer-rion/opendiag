# OpenDiag app (plain, read-only, simulator)

Run: `pnpm install`, then `pnpm app:dev` and open http://127.0.0.1:5173 . Build: `pnpm app:build`.
Browser build talks only to the built-in simulator. There is no write path: no clear, no coding writes.
Data layer is in `src/data/` (no React) and is tested by `pnpm test`.
