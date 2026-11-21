# UI library and app-shell landscape for a data-dense diagnostic app

Research date: 2026-11-20. Status: **PARTIAL** (see Gaps). Scope: component libraries, charting and live-gauge libraries, table and list virtualisation, app shells (PWA, Tauri 2, Electron, Capacitor, React Native/Expo, Flutter, SwiftUI/Kotlin), and fit with the repo's TypeScript monorepo. Builds on `docs/research/deep2/adapter-and-transport-constraints.md` (which owns the transport facts) and `docs/plan/architecture-12wk.md` (ADR-003 daemon plus browser UI, ADR-004 Electron spike at week 10, ADR-005 Capacitor spike). It does not repeat those.

Confidence tags: **high** = official registry data or an official page read in this run; **medium** = official page read through a summariser, or one primary source plus corroboration; **low** = third-party write-up, inference, or my own reading of numbers. Tool honesty: web search and fetch both worked. Fetches pass through a small summarising model, so wording is second-hand. GitHub's API was rate-limited, so star counts and last-commit dates are mostly **not** available; I used npm publish history instead and say so.

---

## Executive summary

1. **Recommended default stack (medium):** React 19 + Vite + Tailwind v4, **shadcn/ui on Base UI** for components, **TanStack Table v9 + TanStack Virtual** for fault lists, module lists and frame logs, **uPlot** for live traces, and **hand-built SVG gauges** driven by CSS variables. Everything is MIT or Apache-2.0.
2. **Fastest "batteries included" alternative (medium):** **Mantine 9** (MIT, React 19.2 required, built-in dark mode, charts on Recharts). **Blueprint 6** (Apache-2.0) is the one library whose own README says it targets data-dense desktop apps, but it is explicitly not mobile-first.
3. **Two licence traps (high):** **PrimeReact 11** moved from MIT (10.9.x) to a commercial PrimeUI licence with a free tier that is gated by organisation size and revenue (free for small organisations, individuals and non-commercial open source), so it is not an OSI licence and downstream users above the thresholds would have to pay. That conflicts with the repo's permissive-licence intent; whether it technically trips the "no non-commercial licence" gate is a judgement for the owner, because the licence is not itself non-commercial. **flutter_blue_plus** (the main Flutter BLE plugin) requires a paid commercial licence for for-profit use.
4. **Node strip-types has one hard limit for UI work (high):** Node does not run `.tsx` and refuses TypeScript under `node_modules`. The UI therefore always needs Vite (or similar). Shared code (`core` codecs) can stay erasable `.ts` with explicit `.ts` imports and be consumed by Vite unchanged.
5. **Live charts (medium):** uPlot is by far the smallest (about 22 KB gzip, measured through bundlephobia) and its README claims 166,650 points drawn in 25 ms, but its **last npm release is 2025-03-14** and it has no accessibility story. ECharts (about 368 KB gzip whole package) is the heavy, feature-rich, accessible-by-config option for post-session analysis.
6. **App shells (medium):** the plan's order (daemon + browser tab, then Electron, then a Capacitor spike) is sound. Tauri 2 (2.12, 2026-09-26) is real but forces a Node sidecar or a Rust rewrite of the core. React Native/Expo and Flutter would each mean a second implementation of the protocol core. A pure PWA cannot do WiFi ENET at all.
7. **iPhone is the weak spot for everything web (high):** Safari on iOS has no Web Bluetooth or Web Serial (MDN data). A niche third-party app, Bluefy, ships its own browser with Web Bluetooth (App Store page read), so "no iOS browser" is too strong. Users should not be asked to install a special browser, so a phone build should still be a native shell (Capacitor, RN, native) for BLE.
8. **Density and accessibility are not the same thing as "looks dense":** React Aria and Base UI document keyboard and screen-reader work; Carbon documents five table row sizes; I could not verify density controls for most others (see Gaps).
9. **Decision still open for the owner:** (a) shadcn/Base UI versus Mantine, (b) whether the phone UI is the same web UI in Capacitor or a separate native app. Section 11 gives the scored comparison. The next doc (`ui-design-system` style work) should lock tokens before any component is built.

---

## 1. What this app actually needs from a UI layer

Derived from `docs/plan/kpis.md`, `docs/plan/direction.md`, `docs/plan/architecture-12wk.md` and the transport research. These are the requirements I scored against. Inference where marked.

| # | Need | Why (source in repo) | Consequence for the UI stack |
|---|---|---|---|
| R1 | Plain-English fault list across a whole car, filterable and sortable, hundreds of rows | Direction job 1; KPI G6 | Real data table, not a card list |
| R2 | Module tree and per-module detail with raw hex next to decoded values | Direction jobs 2 and 5 (read, inspect, diff) | Dense two-pane layout, monospace, copy buttons |
| R3 | Live values: about 10 channels at quick-read, more later; charts and gauges | KPI G3 (10 live values); direction job 7 | Streaming line charts and numeric tiles; update rates are low (inference, below) |
| R4 | Safety-critical confirm flows: preflight, diff, typed confirm | `ux-teardown-and-safety-ux.md` | Accessible dialogs, focus trap, never colour-only state |
| R5 | Runs on a desktop, a phone, and in a browser tab; works offline | Plan ADR-003, ADR-004, ADR-005 | Responsive web UI first; shell later |
| R6 | Dark mode first (car garage, night use) | Inference; the current `web/index.html` already ships dark and light tokens | Token-based theming, `prefers-color-scheme` |
| R7 | Free, permissive, no dependency with a GPL, AGPL or non-commercial licence | `kpis.md` quality gates | Licence check per dependency (section 9) |
| R8 | Fits Node strip-types monorepo: erasable TS, explicit `.ts` imports, tests via `node --test` | Root `package.json` (`engines.node >=22.18`, scripts run `.ts` directly) | Section 8 |
| R9 | Accessible: keyboard, screen reader, contrast, not colour-only | Safety UX; also store review risk (inference) | Prefer React Aria or Base UI based parts |

**Update-rate arithmetic (low, my inference).** Standard OBD-II over a CAN adapter returns one PID reply per request; the adapter research puts BLE throughput on iOS at roughly 400 to 600 kbit/s in one developer's measurements (`adapter-and-transport-constraints.md`, low-medium). A 10-channel quick read is therefore tens of samples per second at most, not thousands. That means **chart throughput is not the binding constraint**; bundle size, accessibility and safety UX are. A ring buffer of 10 to 50 k points per channel is enough, and uPlot's own caveat (struggles beyond about 100k in-view points) does not bite.

---

## 2. Component libraries

### 2.1 Version, licence and maintenance (all high, from the npm registry on 2026-11-20)

"Releases 12 m" counts all published versions (including pre-releases and canaries) in the 12 months to 2026-11-20; "stable" counts non-pre-release only. A canary-heavy count overstates activity. Registry: `https://registry.npmjs.org/<package>`.

| Library (package) | Latest | Published | Licence | Created on npm | Releases 12 m (stable) | Peer React |
|---|---|---|---|---|---|---|
| shadcn CLI (`shadcn`) | 4.23.0 | 2026-10-27 | MIT | 2024-07-09 | 108 (65) | n/a (copy-in code) |
| Radix Primitives (`radix-ui` umbrella) | 1.8.1 | 2026-10-12 | MIT | (`@radix-ui/react-dialog` 2020-12-15) | 81 (11) on dialog | n/a |
| Base UI (`@base-ui/react`) | 1.9.0 | 2026-10-09 | MIT | 2025-12-11 (renamed from `@base-ui-components/react`) | 13 (11) | 17, 18 or 19 |
| React Aria Components | 1.22.1 | 2026-10-09 | Apache-2.0 | 2018-06-12 | 213 (12) | 16.8 to 19 |
| Mantine (`@mantine/core`) | 9.8.2 | 2026-11-20 | MIT | 2021-01-07 | 51 (40) | 19.2 or newer |
| MUI (`@mui/material`) | 9.5.0 | 2026-10-09 | MIT | 2021-09-02 | 24 (16) | 17 to 19; Emotion peers |
| Chakra UI (`@chakra-ui/react`) | 3.38.0 | 2026-11-03 | MIT | 2020-11-13 | 11 (11) | 18 or newer; Emotion peer |
| Ark UI (`@ark-ui/react`) | 5.40.0 | 2026-10-29 | MIT | 2022-11-06 | 24 (23) | 18 or newer |
| Fluent UI v9 (`@fluentui/react-components`) | 9.75.2 | 2026-11-10 | MIT | 2021-02-24 | 269 (28) | 16.14 to <20 |
| Carbon (`@carbon/react`) | 1.121.0 | 2026-11-18 | Apache-2.0 | 2021-07-30 | 67 (28) | 16.8 to 19; needs Sass |
| Blueprint (`@blueprintjs/core`) | 6.23.2 | 2026-11-19 | Apache-2.0 | 2016-11-11 | 33 (33) | 18 or 19 |
| Ant Design (`antd`) | 6.7.1 | 2026-11-16 | MIT | 2015-06-23 | 44 (43) | 18 or newer |
| PrimeReact (`primereact`) | 11.2.3 | 2026-11-11 | **PrimeUI licence (not OSI)**; 10.9.x was MIT | 2017-03-28 | 15 (8) | n/a checked |
| HeroUI (`@heroui/react`) | 3.2.7 | 2026-10-28 | Apache-2.0 | 2025-01-09 | 58 (20) | 19 or newer; Tailwind 4 |

Notes on the table:

- **Radix.** The primitives repo shows MIT, copyright WorkOS, 19.5k stars and no maintenance or deprecation notice on the page (medium; GitHub page read through a summariser, last-commit date not shown). Release cadence on `@radix-ui/react-dialog` is 81 versions in 12 months but only 11 stable, so most are pre-releases. Not a deprecation signal, but the stable line moves slowly. Source: S1, S2.
- **Base UI.** Stable v1.0.0 is dated 2025-12-11 and the package was renamed to `@base-ui/react`; v1.1.0 followed on 2026-01-15 (S3, medium: one search summary of the official release notes). InfoQ's report says 35 accessible components and a stated long-term maintenance commitment (S4, low-medium, news summary). It is a Radix successor in spirit (the API was reworked from Radix lessons, per the same report).
- **Chakra.** Official blog says v3 kept Emotion and runtime CSS-in-JS and builds on Ark UI, which is built on Zag.js state machines; some third-party posts wrongly say it moved to Panda CSS (S5, medium).
- **MUI.** The v9 banner is confirmed on the MUI site (S6, medium). `@mui/material-pigment-css` appears as a peer dependency in the registry data; whether Emotion is still the default engine was not confirmed from an official page (Gap).
- **PrimeReact.** `LICENSE.md` inside the 11.2.3 tarball says PrimeUI is a family of commercial libraries. A free Community License applies only if the organisation has under USD 1,000,000 revenue, under 5 developers, under 10 employees and under USD 3,000,000 outside funding; individuals, students, non-profits and non-commercial open source also qualify; it needs annual renewal confirmation (S7, high: file read from the registry tarball via unpkg). The first 11.x version on npm was an MIT alpha (2025-06-30); 11.0.0-rc.1 (2026-06-28) and 11.0.0 (2026-07-15) carry the new licence (registry, high). **Verdict: not acceptable for an Apache-2.0 project that wants downstream users with no revenue gate.** PrimeReact 10.9.9 stays MIT (dist-tag `v10-stable`), but freezing on a superseded major is a maintenance cost.
- **HeroUI v3.** Official page: built on Tailwind CSS v4 and React Aria Components, Apache-2.0, designed for React 19 (S8, medium). Registry shows a runtime dependency on `@radix-ui/react-avatar` and a peer dependency on `react-aria` and `react-aria-components` (high).

### 2.2 Bundle size

Measured on 2026-11-20 through the bundlephobia API (`https://bundlephobia.com/api/size?package=<pkg>@<ver>`). **These numbers are for importing the whole package entry, minified and gzipped, with no tree-shaking.** Real apps import a few components and ship far less for the libraries that tree-shake well, so use these as an upper bound and a relative ranking only (confidence: medium; method is mine, source is a third-party service).

| Package | Min (KB) | Gzip (KB) | Deps | Reading |
|---|---|---|---|---|
| `@radix-ui/react-dialog` 1.3.1 (one primitive) | 39 | 13 | 15 | Per-primitive cost; app pays per primitive used |
| `@base-ui/react` 1.9.0 (whole) | 523 | 166 | 5 | Whole-package; tree-shakes by component |
| `react-aria-components` 1.22.1 (whole) | 991 | 279 | 8 | Whole-package; large |
| `@mantine/core` 9.8.2 (whole) | 642 | 193 | 5 | Whole-package; CSS shipped separately |
| `@mui/material` 9.5.0 (whole) | 543 | 157 | 12 | Plus Emotion at runtime |
| `@chakra-ui/react` 3.38.0 (whole) | 1,218 | 331 | 7 | Heavy |
| `@ark-ui/react` 5.40.0 (whole) | 1,073 | 297 | 69 | Heavy; many deps |
| `@fluentui/react-components` 9.75.2 (whole) | 1,265 | 320 | 62 | Heavy; many deps |
| `@blueprintjs/core` 6.23.2 (whole) | 298 | 96 | 9 | Moderate |
| `antd` 6.7.1 (whole) | 1,446 | 461 | 48 | Heaviest of the group |
| `@heroui/react` 3.2.7 (whole) | 266 | 71 | 7 | Moderate; plus React Aria it depends on |
| `@carbon/react` 1.121.0 | build failed on the service | n/a | n/a | Not measured |
| `primereact` 11.2.3 | service error | n/a | n/a | Not measured (and licence disqualifies) |
| `lucide-react` (icons, whole) | 861 | 216 | 0 | Always import per icon |
| `react` 19.3.1 + `react-dom` | 8 + 4 | 3.1 + 1.5 | | The service reports tiny numbers for these; treat as unreliable (the real React DOM payload is larger) |

Reading: for a tool installed once and used on a laptop, bundle size matters much less than for a public web page. It matters for (a) the hosted PWA first load, (b) a Capacitor app's cold start on a mid-range Android phone, and (c) CI install time. I did **not** run a local build with each library, so tree-shaken real sizes are a Gap.

### 2.3 Accessibility, theming, density, dark mode (per library)

Cells say what a source I read states; "n/v" means not verified in this run. Confidence tags follow each row.

| Library | Accessibility evidence | Theming model | Density controls | Dark mode | Source |
|---|---|---|---|---|---|
| **shadcn/ui** (on Base UI or Radix) | Inherits primitives' behaviour. Chart docs say set `accessibilityLayer` on a Recharts chart for keyboard access and screen-reader support | Copy-in components, Tailwind v4 CSS variables; `cn` is now a separate package (Sep 2026); RTL supported (Jan 2026) | You own the code, so you set sizes in the component files; no built-in density switch (n/v) | Via CSS variables (n/v in detail) | S9, S10 (medium) |
| **Base UI** | Docs: follows WAI-ARIA Authoring Practices, keyboard (arrows, Home, End, Enter, Esc), focus management with `initialFocus` and `finalFocus`; says tested across browsers, devices and screen readers but names none; contrast is the developer's job and APCA is suggested | Unstyled | Unstyled, so you decide | Unstyled | S11 (medium) |
| **React Aria** | Built on the ARIA Authoring Practices Guide; "many popular screen readers and devices"; over 30 translation languages, 13 calendar systems, RTL; style-free; over 50 components including **Table with column resizing** | Style-free, data attributes and render props | Unstyled | Unstyled | S12 (medium) |
| **Mantine 9** | Release notes mention ARIA label work on Spoiler only; no overall claim read | CSS variables; `data-mantine-color-scheme` on `<html>`; theme object | Component `size` props exist (n/v scale); `fontWeights` theme option and default radius `md` changed in v9 | `light`, `dark`, `auto`; script avoids flash; transitions suppressed during switch | S13, S14 (medium) |
| **MUI 9** | n/v this run | Emotion-based theme (n/v for v9 default), CSS variables n/v | `size` and `dense` props exist historically (n/v) | n/v | S6 (low) |
| **Chakra 3** | n/v this run | Emotion runtime, recipes and slot recipes, Ark UI parts | n/v | n/v | S5 (medium) |
| **Ark UI** | Zag.js state machines; a11y claims not read | Headless | Headless | Headless | S5 (low) |
| **Fluent UI v9** | n/v (page redirected and was not re-fetched) | Not read | Not read | Not read | none |
| **Carbon** | Data table docs: keyboard operation built in; you must supply an accessible name (`aria-label`, `aria-labelledby` or title); IBM states the data table passes automated tests (self-reported) | Sass-based themes: white, g10, g90, g100 (theme names UNVERIFIED in this run) | **Five table row sizes** from extra small to extra large (large is 48 px) | g90 and g100 dark themes (UNVERIFIED: the usage page read does not mention them; from my prior knowledge) | S15 (medium for row sizes, low for themes) |
| **Blueprint 6** | n/v | Own CSS | Has a `table` package in the monorepo; README says it is optimised for complex, data-dense web interfaces for desktop applications that run in modern browsers, and states it is not a mobile-first toolkit | Not read (n/v) | S16 (medium) |
| **Ant Design 6** | n/v | v6 defaults `@ant-design/cssinjs` to a pure CSS-variables mode and offers a zero-runtime build option via `ConfigProvider theme={{ zeroRuntime: true }}` | Compact algorithm exists historically; not re-verified for v6 | n/v | S17 (low-medium, search summary) |
| **PrimeReact** | n/v | n/v | n/v | n/v | disqualified by licence |
| **HeroUI v3** | Claims WCAG compliance via React Aria (self-reported) | Tailwind utilities, CSS variables, BEM modifiers | n/v | Not on the page read | S8 (medium) |

**The density question.** The only library whose own README leads with "data-dense desktop apps" is Blueprint (high, for the quote; the claim is a vendor's own). Carbon is the only one where I read a concrete density mechanism (five row sizes). For headless or copy-in options (React Aria, Base UI, shadcn) density is a design-token decision the team makes once. That is a point in their favour for this project because the dense table, not the button, is the main surface.

### 2.4 Fit assessment (for this repo)

Scored 1 to 5 against R1 to R9; 5 is best. These are my judgements from the evidence above (low-medium); weights are not applied.

| Library | R1 table | R3 live data | R4 safe dialogs | R5 mobile + desktop | R6 dark | R7 licence | R8 monorepo fit | R9 a11y | Notes |
|---|---|---|---|---|---|---|---|---|---|
| shadcn/ui + Base UI | 5 (TanStack) | 4 (Recharts or custom) | 5 | 4 | 5 | 5 | 5 | 4 | You own the code; Tailwind v4 needed; Base UI young but backed by MUI |
| shadcn/ui + Radix | 5 | 4 | 5 | 4 | 5 | 5 | 5 | 4 | Still supported; shadcn says Radix is not being deprecated (S18) |
| shadcn/ui + React Aria | 5 | 4 | 5 | 4 | 5 | 5 | 5 | 5 | shadcn lists React Aria as a supported base for newer blocks (S9, medium) |
| Mantine 9 | 4 (its own table is thin; `mantine-datatable` 9.8.1 is a community add-on) | 4 (Recharts) | 4 | 3 (desktop-leaning, responsive) | 5 | 5 | 4 (React 19.2 required) | 3 | Fastest to a good-looking UI |
| HeroUI v3 | 3 | 3 | 4 | 4 | 4 | 5 | 4 | 4 | New (v3, created 2025-01); Tailwind 4 required |
| Blueprint 6 | 4 (own table) | 3 | 4 | 2 (README: not mobile-first) | 4 | 5 | 4 | 3 | Right density, wrong form factor for phone |
| Carbon | 4 | 3 (Carbon Charts is a separate package; not read) | 4 | 3 | 5 (g100) | 5 | 3 (Sass) | 4 | Heavy IBM look; Sass build |
| MUI 9 + X | 4 (X Data Grid 9.18.0, MIT community tier; advanced tiers are commercial, n/v for v9) | 4 (`@mui/x-charts` 9.18.1 MIT) | 4 | 4 | 4 | 4 (check X tiers) | 3 (Emotion) | 3 | Mature; Material look; paid tiers exist |
| Chakra 3 / Ark | 2 | 2 | 4 | 3 | 4 | 5 | 3 | 3 | Heavy bundles; table is not their strength |
| Fluent UI v9 | 3 | 2 | 4 | 3 | 4 | 5 | 3 | 4 (n/v) | Large and many dependencies |
| Ant Design 6 | 4 | 3 | 4 | 3 | 4 | 5 | 3 | 3 | Heaviest bundle measured |
| PrimeReact 11 | n/a | n/a | n/a | n/a | n/a | **1** | n/a | n/a | **Excluded by licence** |

---

## 3. Headless and styling layers (the part under the components)

| Piece | Version (npm, high) | Licence | Role | Fit |
|---|---|---|---|---|
| Tailwind CSS | 4.3.5 (2026-11-06) | MIT | Utility CSS, v4 has the Vite plugin `@tailwindcss/vite` 4.3.5 | Needed by shadcn and HeroUI. Tokens map to CSS variables |
| `tailwind-variants` | 4.0.2 (2026-11-10) | MIT | Variant API, used by HeroUI | Optional |
| `class-variance-authority` | 0.7.1 (2024-11-26) | Apache-2.0 | Variant helper used by many shadcn components | Stale since 2024-11 but tiny |
| Panda CSS (`@pandacss/dev`) | 2.6.0 (2026-11-19) | MIT | Build-time CSS-in-JS | Alternative to Tailwind |
| vanilla-extract (`@vanilla-extract/css`) | 1.21.3 (2026-10-08) | MIT | Typed CSS in `.ts` files | Alternative; fits TypeScript-first |
| Vite | 8.3.8 (2026-11-11) | MIT | Dev server and bundler | Required (section 8) |
| `vite-plugin-pwa` | 2.0.0 (2026-10-03) | MIT | Service worker and manifest | PWA tier |
| Icons: `@tabler/icons-react` 3.52.0 (MIT), `@phosphor-icons/react` 2.1.10 (MIT, 2025-05-22), `lucide-react` | | | Icon sets | Import per icon; whole-package lucide measured 216 KB gzip |
| Fonts: `@fontsource-variable/inter` 5.3.0, `@fontsource/jetbrains-mono` 5.3.0 | | OFL-1.1 | Self-hosted fonts; offline friendly | OFL is permissive for bundling; keep the licence file with the font |
| State: `zustand` 5.1.0 (MIT), `jotai` 3.0.2 (MIT), `@preact/signals-react` 3.12.0 (MIT), `@tanstack/react-query` 5.108.2 (MIT) | | | Live-value store; server cache | A tiny store with per-channel subscriptions avoids re-rendering the whole UI at sample rate |
| Storybook | 10.6.8 (2026-11-20, MIT); Playwright test 1.65.1 (Apache-2.0) | | Component catalog and UI tests | Optional but cheap for a safety UI |

All dates are the npm `time[version]` field (high).

---

## 4. Frameworks under the components (React or something else)

| Framework | Version (high) | Licence | Note for this project |
|---|---|---|---|
| React | 19.3.1 (2026-10-14) | MIT | Largest component ecosystem; every library in section 2 targets it. Mantine 9 and HeroUI 3 require React 19 |
| Solid | 2.0.3 (2026-11-19) | MIT | Fine-grained updates suit live channels; component ecosystem is much smaller. Kobalte 0.13.14 (MIT) is its main headless set; measured 68 KB gzip whole |
| Svelte | 5.59.1 (2026-11-20) | MIT | Compiler-based; small output; no verified diagnostic-grade component set read |
| Vue | 3.5.46 (2026-11-20) | MIT | Not researched further |

Decision input: choosing anything but React halves the choice of accessible, dense components and loses the shadcn registry path. For live data the cost of React re-rendering is managed by a per-channel store and `memo`, because the update rate is low (section 1). **Recommendation: React.** Confidence medium; the rendering-cost claim is inference, not a benchmark.

---

## 5. Charts and live gauges

### 5.1 Versions, licences, size (npm and bundlephobia, 2026-11-20)

| Library | Latest | Published | Licence | Whole-package gzip | Releases 12 m | Notes |
|---|---|---|---|---|---|---|
| **uPlot** | 1.6.32 | **2025-03-14** | MIT | **21.9 KB** (min 50.8 KB) | **0** | Canvas 2D; 0 deps |
| **Apache ECharts** | 6.1.0 | 2026-05-19 | Apache-2.0 | 368 KB (min 1.11 MB) | 3 | Canvas or SVG renderer; tree-shakable build exists (not measured) |
| **Recharts** | 3.11.0 | 2026-11-17 | MIT | 177 KB (min 659 KB), 11 deps | 24 | SVG; used by shadcn charts and Mantine charts |
| **visx** (`@visx/xychart`) | 4.0.0 | 2026-06-11 | MIT | 50 KB for xychart; `@visx/shape` 10.7 KB; `@visx/scale` 17.5 KB | 17 (1 stable) | Low-level D3 plus React primitives |
| **lightweight-charts** (TradingView) | 5.3.0 | 2026-11-10 | Apache-2.0 | 61.9 KB | 4 | Canvas, finance-oriented time series |
| **`@mui/x-charts`** | 9.18.1 | 2026-11-16 | MIT | n/m | n/m | Has gauge components (n/v which) |
| **Chart.js** | 4.6.1 | 2026-10-22 | MIT | n/m | n/m | Canvas; not read in depth |
| **Perspective** (`@finos/perspective`) | 3.8.0 | 2025-09-03 | Apache-2.0 | n/m | n/m | WASM streaming grid and charts; heavy; last release over a year old |
| `dygraphs` 2.2.2 (MIT, 2026-07-27), `smoothie` 1.36.1 (MIT, **2022-07-18**), `react-gauge-component` 2.0.29 (MIT, 2026-04-23), `@nivo/core` 0.99.0 (MIT, **2025-05-23**), `d3` 7.9.2 (ISC, 2026-11-03) | | | | | | Listed for completeness; smoothie and nivo look stale |

"n/m" = not measured. Registry data and bundlephobia are high for the number; the interpretation "stale" is mine (medium).

### 5.2 Per-library facts that matter

- **uPlot (S19, medium: GitHub README via a summariser).** README claims an interactive chart of 166,650 points in 25 ms cold start and roughly 100,000 points per millisecond afterwards. Streaming 3,600 points at 60 fps used about 10% CPU and 12.3 MB RAM, against about 40% and 77 MB for Chart.js and about 70% and 85 MB for ECharts in the author's own benchmark. The separate load-time table is dated 2023-03-11 (uPlot 1.6.24, Chart.js 4.2.1, ECharts 5.4.1, Ryzen 7 PRO 5850U, Chrome 113); the README gives no versions or hardware for the streaming comparison, so it is old and unversioned. Self-reported benchmark. It admits it "may begin to struggle beyond 100k in-view points". Size about 50 KB min. MIT. **Limits:** Canvas 2D only, no built-in pan (needs plugins or hooks), no animation, no axis-label collision avoidance, no accessibility notes. 118 open issues, 17 open PRs at read time. **Maintenance risk:** zero npm releases in 12 months and the last release is 2025-03-14; the repo page showed no releases list and no last-commit date. I could not check commit activity (Gap).
- **ECharts (S20, S21, medium).** 6.0 brought a redesigned default theme and runtime theme switching, including following the OS dark mode; a third-party write-up names `chart.setTheme()` (unverified method name). Accessibility is **off by default**: set `aria.show` true and import `AriaComponent`; it auto-generates a text description from title, series and data, and decal patterns exist so series do not rely on colour. For dense charts the docs say to write the description by hand. No official 6.0 performance claim was found (S21).
- **Recharts (S10, S13).** shadcn's chart component composes Recharts 3 directly; `accessibilityLayer` adds keyboard and screen-reader support. Mantine 9 requires Recharts 3 or newer for `@mantine/charts`. SVG-based, so it will slow with many thousands of points (inference from how SVG works; not benchmarked here).
- **visx.** Primitives, not a chart product. 4.0.0 published 2026-06-11, only 1 stable among 17 releases in 12 months (pre-release heavy). Good for custom gauges and trace layouts, but you build every chart.
- **lightweight-charts.** Apache-2.0, small (62 KB gzip), maintained (5.3.0, 2026-11-10), finance-shaped (time axis, crosshair). A decent uPlot alternative for scrolling time series if uPlot's staleness worries you (low-medium; fit not tested).

### 5.3 Gauges

No maintained, accessible, themeable gauge package was verified. `react-gauge-component` 2.0.29 (MIT, 2026-04-23) exists. **Recommendation (medium): draw gauges as SVG** (arc plus needle plus numeric text) with CSS variables, because: (a) a gauge is about 100 lines, (b) a numeric readout must always be present for accessibility, (c) it themes with the same tokens as the rest. Use `role="meter"` with `aria-valuenow/min/max` plus an `aria-label`, and give the numeric text real DOM text. (ARIA `meter` role is from the ARIA spec; not re-fetched this run, so medium.)

### 5.4 Recommended charting split

| Use | Library | Why |
|---|---|---|
| Live scrolling traces in a session (RPM, boost, voltage) | **uPlot** (fallback: lightweight-charts) | Smallest; fastest published claim; low data rate means no risk |
| Post-session analysis, scatter, histograms, heatmaps | **ECharts** loaded lazily | Rich; a11y available but off by default; heavy so lazy-load |
| Dashboard tiles, sparklines, small charts in cards | **Recharts via shadcn chart** or own SVG | Matches shadcn; `accessibilityLayer` |
| Gauges | Own SVG components | Section 5.3 |

---

## 6. Tables and virtualisation

| Library | Version (high) | Published | Licence | Gzip (bundlephobia) | Notes |
|---|---|---|---|---|---|
| `@tanstack/react-table` | 9.3.1 | 2026-10-12 | MIT | 31.6 KB whole | v9 stable announced **2026-08-04**; features are explicit and tree-shakeable; `useReactTable` is now `useTable`; `features` option required; `stockFeatures` restores the v8 set (S22, medium: search summary of official post) |
| `@tanstack/react-virtual` | 3.14.26 | 2026-11-03 | MIT | 10.3 KB | Headless; dynamic sizes; "grid + lanes" and two-axis grids for spreadsheet-like surfaces (S23, medium); 41 stable releases in 12 months |
| `@tanstack/react-query` | 5.108.2 | 2026-11-20 | MIT | 13.4 KB | Server-state cache for daemon calls |
| AG Grid Community | 36.3.0 | 2026-11-04 | MIT | 392 KB | Full grid; heavy; enterprise features are a separate paid product (n/v) |
| MUI X Data Grid | 9.18.0 | 2026-11-13 | MIT (community) | 129 KB | Higher tiers are commercial (n/v) |
| `mantine-datatable` | 9.8.1 | 2026-11-14 | MIT | n/m | Community add-on for Mantine |
| `react-virtuoso` 4.18.24 (MIT, 2026-11-20), `virtua` 0.55.0 (MIT, 2026-11-18), `react-window` 2.5.3 (MIT, 2026-11-01) | | | | | Virtual lists; not read in depth |
| Glide Data Grid `@glideapps/glide-data-grid` | 6.0.3 | **2024-02-03** | MIT | n/m | Canvas grid; stale |
| shadcn "Data Table" | | | MIT | | Built on TanStack Table; guide uses v9; docs read did not mention virtualisation or density (S24, medium) |
| React Aria Table | | | Apache-2.0 | | Accessible table with column resizing (S12) |

**What the diagnostic UI needs from a table.** (1) Fault code list: hundreds of rows, sort and filter by module and status, row expansion for explanation text. (2) CAN or UDS frame log: tens of thousands of rows, monospace, selectable, copyable, fixed row height. (3) Snapshot diff: two columns, changed rows highlighted with an icon and text, not colour only. (4) Module scan results, updating live.

**Recommendation (medium):** TanStack Table v9 for state (sort, filter, selection) with TanStack Virtual for the frame log only; the fault list needs no virtualisation at hundreds of rows, which keeps the accessible semantic table markup. Virtualisation and screen readers conflict (only visible rows exist in the DOM), so use `aria-rowcount` and `aria-rowindex` on the log if it is virtualised (ARIA grid practice; inference, not read this run).

**Pitfall:** TanStack Table v9 was only declared stable on 2026-08-04, so most blog posts and AI-generated examples still use the v8 API (`useReactTable`, no `features`). Pin versions and read the v9 migration guide (S22).

---

## 7. App shells

### 7.1 Overview (versions high from npm and official blogs; platform behaviour as tagged)

| Shell | Latest | Published | Licence | Runs the TS core unchanged? | Adapter reach | Size/overhead | 12 m cadence |
|---|---|---|---|---|---|---|---|
| **PWA** (Vite + `vite-plugin-pwa` 2.0.0) | | | MIT | Pure codecs yes; `node:net` no | Web Bluetooth and Web Serial on Chromium only; no TCP | Smallest | n/a |
| **Tauri 2** | `tauri` 2.12.0 (**2026-09-26**); `@tauri-apps/cli` 2.12.6 (2026-11-18); `@tauri-apps/api` 2.12.5 (2026-11-16) | | Apache-2.0 or MIT | **No.** Core is Node; would need a sidecar or a rewrite | BLE via community plugin; TCP and serial via Rust | System webview; small | 15 `api` releases |
| **Electron** | 45.4.1 | 2026-11-19 | MIT | **Yes** (bundles Node) | Web Bluetooth, WebHID, Web Serial and WebUSB supported, plus Node TCP and `serialport` | Large (bundles Chromium and Node) | 316 releases (213 stable) |
| **Capacitor** | `@capacitor/core` 8.6.2 | 2026-11-12 | MIT | Web UI yes; Node APIs no | BLE plugin; TCP plugin exists | Small plus web view | 308 (37 stable) |
| **React Native + Expo** | RN 0.88.1 (2026-10-27); Expo 58.0.26 (2026-11-17) | | MIT | **No** (Hermes, not Node; separate native modules) | BLE libraries; TCP library | Native app | RN 365 (26 stable) |
| **Flutter** | 3.50 (2026-11-11, Dart 3.14) | | BSD-style (not re-checked) | **No** (Dart) | Plugins; `flutter_blue_plus` is commercial for for-profit use | Native app | n/a |
| **SwiftUI / Kotlin (Compose)** | Compose Multiplatform iOS stable since 1.8.0 (2025); 1.11.0 May 2026 | | Apache-2.0 (not re-checked) | **No** | Full native BLE and TCP | Smallest per platform | n/a |

### 7.2 PWA

- **Capability (high, MDN BCD read from GitHub on 2026-11-20).** `Bluetooth` interface: Chrome 70 desktop with a note that **Linux support is not enabled by default**, Chrome Android 56, Firefox no, Safari no, Safari iOS no; flagged experimental and standard-track. `Serial`: Chrome 89, Chrome Android 148, **Firefox 151**, Safari no. `USB`: Chrome 61; WebView on Android exposes the interface but does not support WebUSB. Edge and Opera entries came back without version numbers in the data I read, so I do not state them from this source (the transport doc gives Edge 79+ for Web Bluetooth from the Chrome guide; medium). Web Bluetooth is HTTPS-only, needs a user gesture, and is not available in Web Workers; Web Serial is available in dedicated workers (S25, S26, medium).
- **Offline (medium).** A service worker and a cache of the built assets work everywhere a PWA works; the diagnostic data store is a separate matter (IndexedDB or OPFS, per ADR "Store" in the architecture doc).
- **Hard gap (high, from the transport research).** No raw TCP in browsers, so ENET and WiFi ELM327 dongles need a local daemon. The plan already says daemon first. A hosted PWA is therefore a "BLE and USB serial on desktop Chrome" tier.
- **iOS (high for Safari, medium for the rest).** No BLE, serial or USB in Safari on iOS. Bluefy (a third-party browser app) does offer Web Bluetooth, so "any iOS browser" was an overclaim. For a mainstream product Capacitor or native remains the practical route on iPhone.
- **Local Network Access.** The plan notes Chrome prompts for public pages calling `127.0.0.1` (unverified there). Serving the UI from the daemon itself, same origin, avoids it (plan ADR-003).

### 7.3 Electron

- **Devices (S27, medium).** Official docs: supports Web Bluetooth (via `select-bluetooth-device`), WebHID, Web Serial and WebUSB; the app, not a browser prompt, picks the device or shows its own picker; `session.setBluetoothPairingHandler()` for PIN pairing on Windows and Linux; `setDevicePermissionHandler()` to persist grants. That lets one web UI call `navigator.bluetooth` in both Chrome and Electron.
- **Support policy (S28, medium).** The latest three stable major versions are supported; only the oldest receives security-only fixes. Latest is 45.4.1 (published 2026-11-19); the docs page I read did not list versions 43 to 46, so the exact support window is a Gap.
- **Tooling (high, npm).** `electron-builder` 26.18.0 (MIT, 2026-10-20); `@electron-forge/cli` 8.0.1 (MIT, 2026-09-29); `@electron/packager` 20.3.0 (BSD-2-Clause, 2026-08-11).
- **Cost.** The shipped app carries Chromium and Node; big download, high RAM. In exchange, it runs the daemon in-process or as a utility process, as ADR-004 plans.
- **macOS permissions.** Per `adapter-and-transport-constraints.md`, a bundled macOS app needs a signed bundle, a usage string and a first-run Local Network permission for ENET and WiFi dongles (TN3179, high there).

### 7.4 Tauri 2

- **State (S29, medium).** Tauri 2.12 announced 2026-09-26; blog listing shows 2.0 stable on 2024-10-02. The official 2024 RC post said not all desktop features and plugins were on mobile yet and that mobile was not meant to be "first class"; a July 2026 third-party review calls mobile newer than desktop with rough edges (S30, low-medium). I found no official 2026 mobile feature matrix.
- **Webviews (S31, medium).** WebView2 on Windows (evergreen), WKWebView on macOS and iOS (updates with the OS), WebKitGTK on Linux (distro-dependent), Android System WebView. **Consequence:** Web Bluetooth is a Chromium API and WKWebView and WebKitGTK are WebKit, so a Tauri UI cannot count on `navigator.bluetooth` (high for the engine fact, medium for the inference). BLE must come from Rust.
- **BLE.** Community plugin `tauri-plugin-blec` (btleplug-based); the JS bindings are `@mnlphlp/plugin-blec` 0.20.0 (MIT or Apache-2.0, 2026-11-11). A search summary says version 0.17.0 moved the client into a separate `blec` crate and ships its own Android backend; iOS needs a Bluetooth usage string and CoreBluetooth framework steps; I found no source confirming real-device iOS test coverage (S32, low-medium). The transport doc records that btleplug's maintainers do not support Tauri issues (medium).
- **Sidecar (S33, medium).** External executables are listed under `bundle.externalBin`, each needs a per-target-triple copy, and the JS side needs `shell:allow-execute` or `shell:allow-spawn` in capabilities. The page does not say whether sidecars work on mobile. Node as a sidecar has its own guide that I did not read. Plugin versions (high, npm): `@tauri-apps/plugin-shell` 2.6.0, `plugin-store` 2.5.1, `plugin-sql` 2.6.0, all MIT or Apache-2.0.
- **Fit.** Matches ADR-004's reasoning: Tauri forces a Node sidecar (bundling Node per target) or a Rust port of the core, and Rust is not installed (architecture doc). Not recommended for the 12-week window; revisit if bundle size becomes a user complaint.

### 7.5 Capacitor

- **BLE plugin (S34, medium).** `@capacitor-community/bluetooth-le` 8.4.0 (MIT, 2026-11-18), versioned to match Capacitor 8. Supports web, Android and iOS; central role only; BLE only (no classic Bluetooth); read, write with and without response, notifications, MTU read on iOS and Android; bonding is Android-only. Limits listed: not usable in the iOS Simulator (needs a real device), `connect()` can fail after a prior connection on some Android devices unless `disconnect()` first, scans need location services on Android. This matches the OBDLink CX (BLE only) and the "iOS fine with BLE" conclusion of the transport research.
- **TCP.** `capacitor-tcp-socket` 8.0.0 (MIT, 2026-11-01) exists on npm (high). Its behaviour, maintenance and iOS Local Network handling were not tested (the plan already says "after verification").
- **Other plugins (high, npm).** `@capacitor-community/sqlite` 8.1.1 (MIT, 2026-08-06); `@capacitor/browser` 8.0.5.
- **Fit.** Best match for "same web UI on a phone". Risks: web-view scroll and touch performance on very dense tables; background BLE behaviour not researched; app-store review (separate research).

### 7.6 React Native and Expo

- **State (high).** RN 0.88.1 (2026-10-27), Expo 58.0.26 (2026-11-17). The RN 0.88 blog says no user-facing breaking changes (S35, medium). Expo SDK 58 targets iOS 27; store-version Expo Go lagged at SDK 58 beta time (S35, low-medium).
- **BLE.** `react-native-ble-plx` 3.5.1 (MIT, 2026-02-18; only 1 release in 12 months). Its README says the Expo config plugin works with Expo SDK 43 and later, was "tested against Expo SDK 49", and cannot run in Expo Go because it needs custom native code (S36, medium); it does not mention the New Architecture. `react-native-ble-manager` 13.0.1 (Apache-2.0, 2026-11-14) is the more recently released alternative (13 releases in 12 months). `react-native-tcp-socket` 6.4.3 (MIT, 2026-09-10).
- **UI libraries.** NativeWind 4.2.7 (MIT), Tamagui core 3.3.3 (MIT), `@shopify/react-native-skia` 2.14.0 (MIT) and `victory-native` 43.1.0 (MIT) exist for charts. None was evaluated deeply.
- **Fit.** TypeScript fits, but the web components (shadcn, TanStack Table DOM) do not carry over, and the protocol core would need to run in Hermes without Node APIs. This is a second UI. Reasonable only if the phone becomes the primary product.

### 7.7 Flutter

- **State (S37, medium).** Flutter 3.50 with Dart 3.14, released 2026-11-11 (page dated 2026-11-17); Material and Cupertino libraries are being formally deprecated in favour of standalone `material_ui` and `cupertino_ui` packages, with a migration guide.
- **BLE licence trap (S38, medium).** `flutter_blue_plus` 2.3.15 on pub.dev: free for non-profit, personal and educational use; for-profit organisations need a paid commercial licence. pub.dev lists the licence as "unknown". For an Apache-2.0 project this fails the "no non-commercial licence" gate if shipped. Alternatives were not researched (Gap).
- **Fit.** Dart means a third implementation of the codecs. Not recommended.

### 7.8 SwiftUI and Kotlin (native)

- **Compose Multiplatform for iOS** reached stable with 1.8.0 in 2025 (S39, medium); 1.11.0 shipped May 2026 with iOS and web improvements. JetBrains lists Compose views on iOS as rendered inside a single UIKit view controller (third-party, low-medium).
- **Swift Charts** exists for iOS 16 and later (my own knowledge; the Apple page body was not returned, so **low**).
- **Fit.** Best BLE, background, Local Network and accessibility behaviour; most cost; no code reuse of the TypeScript core. Only if the product becomes phone-first and a native-skilled contributor appears.

### 7.9 Shell comparison against requirements

| Requirement | PWA | Electron | Tauri 2 | Capacitor | RN/Expo | Flutter | Native |
|---|---|---|---|---|---|---|---|
| Runs TS core unchanged | Partly (codecs only) | **Yes** | No | Partly (web view) | No | No | No |
| BLE on desktop | Chromium only | Yes (Web Bluetooth) | Plugin | n/a | n/a | Plugin (licence) | n/a |
| BLE on iPhone | **No** | n/a | Plugin, unproven | Yes | Yes | Yes (licence) | Yes |
| WiFi ENET (raw TCP) | **No** | Yes | Yes (Rust) | Plugin | Library | Yes | Yes |
| Offline | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Footprint | Smallest | Largest | Small | Small | Medium | Medium | Smallest |
| Dev cost in 12 weeks | Lowest | Low | High (sidecar or rewrite) | Medium | High | High | Highest |
| Matches plan | ADR-003 | ADR-004 | rejected | ADR-005 | alternative | not listed | not listed |

---

## 8. Fit with the Node strip-types TypeScript monorepo

Facts from the Node docs (S40, medium: official page read through a summariser):

- Type stripping is stable (Stability 2): on by default since v22.18.0 and v23.6.0, shipped in v24.12.0 and v25.2.0. The repo requires Node 22.18 or newer, and the machine runs Node 26.5.0 (local `node -v`, high), so it is fine.
- Node strips only erasable syntax and does no type checking. **Unsupported:** `enum`, runtime `namespace`, parameter properties, import aliases, decorators, and **`.tsx` files**.
- File extensions are mandatory in imports (`./file.ts`). Type-only imports need the `type` keyword. Node ignores `tsconfig.json`, so `paths` aliases error; use `#` subpath imports.
- **TypeScript files under `node_modules` are refused.** A published workspace package must ship JavaScript, or be consumed through a bundler.
- The recommended config is TypeScript 5.8 or newer with `erasableSyntaxOnly`, `verbatimModuleSyntax` and `rewriteRelativeImportExtensions`.

What it means for the UI:

| Concern | Consequence | Confidence |
|---|---|---|
| **No `.tsx` in Node** | UI code (React) cannot run under `node --test` unless a transform is used. Test components with Vitest or Playwright component tests, or test logic separately from JSX. Keep logic in plain `.ts` hooks and reducers so the existing `node --test` runner covers them | high (Node doc), medium (advice) |
| Vite handles `.tsx` | The UI app is built by Vite; Vite 8.3.8 is current. Vite also resolves `.ts` imports with explicit extensions, so `apps/web` can import `packages/core` source directly | medium (not re-run here) |
| Existing root `typecheck` uses `tsc` | Type checking JSX needs `jsx` set in a UI-package tsconfig; the root `tsconfig.json` was not changed in this run | medium |
| No enums | Some UI libraries ship `.d.ts` with enums; irrelevant at runtime because Vite compiles | medium |
| Shared packages | Use workspace links (pnpm lock present) and keep `core` free of Node-only imports in the codec files, as the architecture doc already splits `net.ts` from pure codecs | medium |
| Publishing | Compile packages to JS before publishing to npm, because Node refuses `.ts` under `node_modules` | high |
| Dependency licences | Run a licence scan in CI (quality gate in `kpis.md`); this doc's table is not a substitute | high |

**Honest limit:** I did not install or build any UI library in this repo; the monorepo claims above come from Node docs and package metadata, not from a trial.

---

## 9. Licence and sustainability screen (R7)

| Item | Licence | Passes "no GPL, AGPL, non-commercial" | Concern |
|---|---|---|---|
| shadcn/ui (generated code), `shadcn` CLI | MIT | Yes | none |
| Radix, Base UI | MIT | Yes | Radix owned by WorkOS (copyright line); stable-release cadence slow |
| React Aria, Carbon, Blueprint, HeroUI | Apache-2.0 | Yes | Apache requires keeping notices; compatible with Apache-2.0 repo |
| Mantine, MUI, Chakra, Ark, Fluent, Ant | MIT | Yes | MUI X and AG Grid have paid tiers; stay on community packages |
| uPlot, Recharts, visx, TanStack, Chart.js | MIT | Yes | uPlot maintenance (section 5) |
| ECharts, lightweight-charts, Perspective | Apache-2.0 | Yes | none |
| Fontsource Inter and JetBrains Mono | OFL-1.1 | Yes | Keep font licence file |
| **PrimeReact 11** | PrimeUI licence | **No** (revenue and headcount gate, annual renewal) | Excluded |
| **flutter_blue_plus** | Commercial for for-profit | **No** | Excluded |
| `serialport` 13.0.0 | MIT | Yes | Last published 2024-12-24 (registry shows modified 2025-10-16) |
| `@stoprocent/noble` 2.8.0 (MIT, 2026-08-20) vs `@abandonware/noble` 1.9.2-26 (MIT, 2025-02-09) | MIT | Yes | Node BLE for the daemon; the stoprocent fork is newer. Not tested |

---

## 10. Product-level UI decisions to settle before building

These are questions the evidence raises, not decisions. The owner decides.

| # | Decision | Options | Evidence-based lean |
|---|---|---|---|
| U1 | Component base | shadcn on Base UI, shadcn on Radix, shadcn on React Aria, Mantine, Blueprint | shadcn on Base UI: shadcn made Base UI the default in July 2026 and says Radix remains supported (S18); allows swapping later because you own the code |
| U2 | One UI or two | Same web UI in Electron and Capacitor, or native phone app | Same web UI for 12 weeks (ADR-005); revisit after the Capacitor spike |
| U3 | Density | Three modes (comfortable, compact, dense) as tokens | Define in tokens at the start; Carbon's five row sizes are a reference, not a requirement |
| U4 | Charts | uPlot plus ECharts (lazy) plus SVG gauges | Section 5.4 |
| U5 | Table | TanStack v9 plus Virtual | Section 6; pin to v9 API |
| U6 | Dark mode | Dark default with light option, token-based | Matches existing `web/index.html` tokens |
| U7 | Accessibility target | WCAG 2.2 AA for the safety flows | Needs a contrast check on the final tokens; Base UI leaves contrast to the team (S11) |
| U8 | Phone BLE on iPhone | Capacitor BLE plugin | The only verified route; needs a real device test (plugin cannot run in the Simulator) |
| U9 | Shell timing | Daemon and browser tab now, Electron week 10, Capacitor spike week 10 | Matches plan; keeps code in one TypeScript runtime |

---

## 11. Scored shortlist (stacks, not parts)

Same 1 to 5 scale, my judgement from the evidence above (medium-low). Weighted by the first three requirements because they match the KPIs.

| Stack | Table + lists | Live data | Safety dialogs and a11y | Licence | Monorepo fit | Phone | Time to a first usable screen | Notes |
|---|---|---|---|---|---|---|---|---|
| **A. React + shadcn (Base UI) + Tailwind 4 + TanStack + uPlot + SVG gauges** | 5 | 5 | 5 | 5 | 5 | 4 (via Capacitor) | 3 | More assembly; you own every component |
| **B. React + Mantine 9 + Recharts + uPlot for live** | 4 | 4 | 4 | 5 | 4 | 3 | **5** | React 19.2 required; looks consistent out of the box |
| **C. React + Blueprint 6 + own charts** | 4 | 3 | 4 | 5 | 4 | 2 | 4 | Desktop-only look; poor fit with a phone UI |
| **D. React + React Aria Components (own styling)** | 5 | 4 | 5 | 5 | 4 | 4 | 2 | Best a11y story; most styling work |
| **E. React Native + Expo (phone-first)** | 3 | 3 | 4 | 5 | 2 | 5 | 2 | Second codebase and runtime |
| **F. Tauri + web UI** | 4 | 4 | 4 | 5 | 2 | 2 | 2 | Needs sidecar or Rust |

**Recommendation (medium confidence): Stack A, with Mantine 9 as the documented fallback if the first two weeks show component assembly is slowing the KPIs.** The reasoning is in sections 2 to 8; the fallback is chosen because Mantine had the smallest evidence gap on dark mode, theming and charts among the "full" libraries.

---

## 12. What this doc does not decide

- Visual design, typography scale, colour tokens, motion (next doc).
- Whether to publish a mobile app at all (store accounts are a separate plan item, week 10).
- Any decision that changes ADR-003, ADR-004 or ADR-005. It only supplies evidence for them.

---

## Sources

Registry and API data were fetched on 2026-11-20 directly from `registry.npmjs.org` (package metadata and publish times), `bundlephobia.com/api/size` (sizes), `raw.githubusercontent.com/mdn/browser-compat-data` (browser support). Pages were read through the fetch tool (a summariser), so quotes are not verbatim.

| ID | URL | Used for | Tag |
|---|---|---|---|
| S1 | https://github.com/radix-ui/primitives | Radix licence, copyright WorkOS, no maintenance notice | medium |
| S2 | https://registry.npmjs.org/radix-ui | Radix umbrella version and date | high |
| S3 | https://base-ui.com/react/overview/releases/v1-0-0 (via search result) | Base UI v1.0.0 date 2025-12-11, rename | medium |
| S4 | https://www.infoq.com/news/2026/02/baseui-v1-accessible | 35 components, maintenance commitment | low-medium |
| S5 | https://chakra-ui.com/blog/announcing-v3 | Chakra v3 keeps Emotion, built on Ark UI | medium |
| S6 | https://mui.com/material-ui/getting-started/supported-components/ | MUI v9 banner, v9.5.0 | medium |
| S7 | https://unpkg.com/primereact@11.2.3/LICENSE.md | PrimeUI licence terms | high |
| S8 | https://heroui.com/docs/react/getting-started | HeroUI v3: Tailwind 4, React Aria, Apache-2.0 | medium |
| S9 | https://ui.shadcn.com/docs/changelog | shadcn changelog 2026 | medium |
| S10 | https://ui.shadcn.com/docs/components/radix/chart | shadcn chart on Recharts 3, `accessibilityLayer` | medium |
| S11 | https://base-ui.com/react/overview/accessibility | Base UI accessibility approach | medium |
| S12 | https://react-aria.adobe.com/ | React Aria claims, Table, locales | medium |
| S13 | https://mantine.dev/changelog/9-0-0/ | Mantine 9 changes (2026-03-31), requirements | medium |
| S14 | https://mantine.dev/theming/color-schemes/ | Mantine colour scheme mechanism | medium |
| S15 | https://carbondesignsystem.com/components/data-table/usage/ and https://carbondesignsystem.com/components/data-table/accessibility/ | Carbon row sizes, accessibility, g100 | medium |
| S16 | https://raw.githubusercontent.com/palantir/blueprint/develop/README.md | Blueprint purpose, packages, Apache-2.0 | medium |
| S17 | https://dev.to/zombiej/ant-design-60-is-released-bfa and https://ant.design/docs/react/css-variables | Ant Design 6 CSS variables and zero-runtime | low-medium |
| S18 | https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default | Base UI default, Radix still supported | medium |
| S19 | https://github.com/leeoniya/uPlot | uPlot performance claims and limits | medium |
| S20 | https://echarts.apache.org/handbook/en/best-practices/aria/ | ECharts aria module | medium |
| S21 | https://echarts.apache.org/handbook/en/basics/release-note/v6-feature | ECharts 6 theme features | medium |
| S22 | https://tanstack.com/blog/announcing-tanstack-table-v9 | Table v9 stable 2026-08-04, modular | medium |
| S23 | https://tanstack.com/virtual/latest | Virtual: dynamic sizes, grid | medium |
| S24 | https://ui.shadcn.com/docs/components/base/data-table | shadcn data table on TanStack v9 | medium |
| S25 | https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API | Web Bluetooth: secure context, not Baseline, no workers | medium |
| S26 | https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API | Web Serial: workers, SPP | medium |
| S27 | https://www.electronjs.org/docs/latest/tutorial/devices | Electron device APIs | medium |
| S28 | https://electronjs.org/docs/latest/tutorial/electron-timelines | Electron support policy | medium |
| S29 | https://v2.tauri.app/blog/ | Tauri 2.12 on 2026-09-26; 2.0 on 2024-10-02 | high |
| S30 | https://www.mayhemcode.com/2026/07/build-mobile-and-desktop-apps-from-one.html | Mid-2026 review of Tauri mobile | low |
| S31 | https://v2.tauri.app/reference/webview-versions/ | Webview engines per OS | medium |
| S32 | https://docs.rs/crate/tauri-plugin-blec/latest | blec plugin, btleplug base | low-medium |
| S33 | https://v2.tauri.app/develop/sidecar/ | Sidecars | medium |
| S34 | https://github.com/capacitor-community/bluetooth-le | Capacitor BLE plugin features and limits | medium |
| S35 | https://reactnative.dev/blog/2026/10/19/react-native-0.88 and https://expo.dev/changelog/sdk-58 | RN 0.88, Expo SDK 58 | medium |
| S36 | https://github.com/dotintent/react-native-ble-plx | BLE-plx Expo config plugin and limits | medium |
| S37 | https://docs.flutter.dev/release/whats-new | Flutter 3.50 | medium |
| S38 | https://pub.dev/packages/flutter_blue_plus | flutter_blue_plus licence | medium |
| S39 | https://blog.jetbrains.com/kotlin/2025/05/compose-multiplatform-1-8-0-released-compose-multiplatform-for-ios-is-stable-and-production-ready/ | Compose iOS stable | medium |
| S40 | https://nodejs.org/api/typescript.html | Node type stripping limits | medium |
| S41 | https://registry.npmjs.org/ (all package pages named in tables) | Versions, dates, licences, release counts | high |
| S42 | https://bundlephobia.com/api/size?package=uplot@1.6.32 (and the other names in section 2.2) | Bundle sizes | medium |
| S43 | https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/Bluetooth.json (also Serial.json, USB.json) | Browser support data | high |
| local | `docs/plan/architecture-12wk.md`, `docs/research/deep2/adapter-and-transport-constraints.md`, `docs/plan/kpis.md`, root `package.json` | Plan constraints | high |

---

## Gaps (what could not be established)

1. **GitHub activity.** The GitHub API was rate-limited for unauthenticated calls, so I have no star counts, last-commit dates or open-issue counts except those a README page showed (uPlot: 118 issues, 17 PRs). Maintenance judgements rest on npm publish history only. uPlot's staleness (no release since 2025-03-14) might hide an active default branch.
2. **Real tree-shaken bundle sizes.** The sizes are whole-package numbers from a third-party service. I did not build a test app per library. Carbon and PrimeReact failed on the service. React's reported size looks wrong and should be ignored.
3. **Density controls** were verified only for Carbon (five row sizes) and, by README, Blueprint's purpose. MUI, Mantine, Chakra, Fluent, Ant, HeroUI and shadcn density mechanisms are unverified.
4. **Accessibility test evidence.** Claims come from vendor docs. No library's screen-reader results were read. Fluent UI's accessibility page was not read (the fetch redirected and was not re-run).
5. **MUI v9 styling engine** (Emotion versus Pigment CSS default) and MUI X tier terms for v9 were not confirmed.
6. **AG Grid and MUI X commercial tiers** were not read; "community is MIT" comes from the npm licence field only.
7. **Charts:** no head-to-head benchmark was run; uPlot numbers are the author's. ECharts 6 performance claims not found. `@mui/x-charts` gauge details, Chart.js and Perspective not read in depth. No verified accessible gauge library.
8. **Tauri mobile:** no official 2026 mobile feature matrix; BLE plugin iOS real-device status unknown; Node-as-sidecar guide not read; mobile sidecar support unknown.
9. **Electron:** exact Chromium and Node versions for 43 to 46 and end-of-life dates not read.
10. **Capacitor TCP plugin** (`capacitor-tcp-socket` 8.0.0) behaviour, maintainer and iOS Local Network handling untested. Background BLE on iOS and Android not researched.
11. **React Native and Flutter BLE alternatives:** `react-native-ble-plx` New Architecture status not found; non-commercial Flutter BLE options not researched.
12. **Swift Charts and SwiftUI details** come from my own knowledge, not a page read (the Apple page returned no body). Treat as low.
13. **Web Bluetooth Edge and Opera support** came back blank in the MDN data; the transport doc's Edge 79+ stands as medium.
14. **Monorepo fit** was not tested by installing anything in the repo; it rests on Node docs and package metadata. Vite 8's handling of explicit `.ts` imports from a sibling package was not run here.
15. **Real users.** No usability evidence about which UI patterns diagnostics users prefer; the fit scores are design judgements, not tested outcomes.
16. **Fact-check pass (2026-11-20).** Twelve claims were re-fetched against their sources (PrimeReact licence, flutter_blue_plus licence, uPlot README, Blueprint README, Node TypeScript docs, Base UI v1.0.0, Chakra v3, Tauri blog, Carbon row sizes, Mantine 9, Web Bluetooth MDN, shadcn Base UI default) plus npm dates for uPlot, PrimeReact, Base UI and MDN compat data. Most held. Corrected: PrimeReact framing, the iOS "no browser" claim, uPlot streaming benchmark versions, Blueprint wording, Carbon dark-theme claim (now UNVERIFIED). Everything else in the doc not listed here was not re-checked.
