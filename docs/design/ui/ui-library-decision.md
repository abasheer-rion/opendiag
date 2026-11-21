# UI library decision for OpenDiag

Decision date: 2026-11-20. Status: **decision made, one section PARTIAL** (see Gaps). Not legal advice.
Reads: `docs/plan/architecture-v2.md`, `docs/plan/platform-decision.md`, `docs/plan/decisions.md`, `docs/plan/kpis.md`, `docs/research/deep2/ui-library-landscape.md`, `ux-teardown-and-safety-ux.md`, `adapter-and-transport-constraints.md`.
Clean-room: nothing here uses or needs leaked OEM material. All libraries below are public, permissively licensed packages.

Confidence tags: **high** = read on the npm registry (`npm view`, run 2026-11-20) or an official page fetched in this run; **medium** = official page read through a summarising model, or one source plus the repo's own earlier research; **low** = my judgement or inference. Scores are **my judgement**, not measurements.

---

## Executive summary

1. **Winner: shadcn/ui on Base UI, styled with Tailwind CSS v4**, running in React 19 + Vite 8 inside Electron 45. Copy-in components, MIT, no runtime styling library (medium to high).
2. **Runner-up: the same shadcn code on Radix** (`radix-ui` 1.8.1). A one-line base swap, so it is the cheap fallback. **Different-family fallback: React Aria Components 1.22.1** (Apache-2.0) if accessibility fails the week-1 checks. **Emergency fallback: Mantine 9.8.2** only if weeks 3 to 4 slip, per architecture-v2 section 6.4.
3. **Weighted score (out of 100, judgement):** shadcn+Base UI 92.4, shadcn+Radix 90.8, React Aria 86.4, Mantine 77.6, Carbon 75.6, HeroUI 74.8, MUI 72.4, Blueprint 70.0, Ant Design 70.0, Fluent 65.6. PrimeReact is out on licence before scoring.
4. **Tables:** TanStack Table **9.3.1** for state, TanStack Virtual **3.14.26** only for the frame log. Fault and module lists stay plain semantic tables.
5. **Charts:** uPlot **1.6.32** for live traces (smallest, but last release 2025-03-14, no accessibility, so every trace also gets a table view). Hand-built SVG gauges. ECharts **6.1.0** lazy-loaded later, not in the first build.
6. **Icons and fonts:** Lucide (`lucide-react` 1.77.0, ISC plus MIT for Feather-derived icons), Inter variable and JetBrains Mono through Fontsource 5.3.0 (both SIL OFL-1.1). All bundle offline.
7. **Rejected:** PrimeReact 11 (size-gated commercial licence), Ant Design, Fluent, MUI, Chakra, Ark, Carbon, Blueprint as the base, AG Grid, Flutter-style second UI stacks. Reasons in section 9.
8. **Biggest risk:** shadcn on Base UI is young (Base UI stable since 2025-12-11) and the A-versus-B margin of 1.6 points is inside my judgement noise. The proof-of-fit checklist (section 11) is built to catch this in week 1, with a one-day swap to Radix if it fails.
9. **What the owner should know:** nothing here needs money, an account or a signed build. Every package is free. The look-and-feel direction in section 10 is a proposal for the owner to veto.

---

## 1. What the UI has to do (constraints carried in, not reopened)

| # | Constraint | Source | Effect on the choice |
|---|---|---|---|
| C1 | Primary platform is a **desktop app on the owner's Mac**, built as Electron, React web UI built by Vite. Later Windows and Linux. | architecture-v2 section 4.1; platform-decision | The renderer is Chromium, so no WebKit quirks to design around in the main product. |
| C2 | A static **Demo car** build runs in a browser; every screen must work against the simulator. | architecture-v2 section 6.4 | UI must also run in plain Chrome, Firefox and Safari without Electron-only APIs. |
| C3 | No iPhone or Android app in the 12 weeks. One read-only Capacitor memo spike in week 10. | architecture-v2 section 4.2 | The component set should not be hostile to a phone web view, but phone is not a design driver. |
| C4 | Public build is read-only; writes exist only in a Lab build, bench modules only. | decisions #2, #6 | The UI needs a persistent **mode banner**, and write screens must be removable from the public bundle at build time. |
| C5 | Free, no GPL, AGPL or non-commercial dependency in shipped code. | kpis quality gates | Per-package licence check (section 7). |
| C6 | Node strip-types monorepo; Node cannot run `.tsx`; UI always needs Vite. | landscape section 8 | Vite 8 is a fixed part of the stack. |
| C7 | Cash under $200 total (G12). | kpis | No paid component tier, no paid design tool. |
| C8 | One part-time builder plus Claude. | architecture-v2 | Fewer moving parts beats more features. Copy-in code we can read beats a theme engine we cannot. |
| C9 | Safety UX: typed confirmation, diff, preflight, never colour-only status, outcome-named buttons, no preselected destructive button. | ux-teardown D1 to D20, X1 to X18 | Accessible dialogs with focus management are non-negotiable. |
| C10 | Update rates are low (tens of samples per second across 10 channels). | landscape section 1, adapter doc | Chart throughput is not the binding constraint. Accessibility, bundle and safety UX are. |

### 1.1 Screens the library has to carry

From ux-teardown section 9 and the direction doc. This list is what the proof-of-fit tests (section 11) build.

| Screen or part | Needs from a library | Stock in a kit? |
|---|---|---|
| Fault list (hundreds of rows, sort, filter, expand for plain-English text) | Dense semantic table, row expansion, sticky header | Table state: TanStack. Markup: ours. |
| Module list with status chips (verified, unverified, invalid, last snapshot, fault count) | Table or list with status badge component | Badge: yes. Chip logic: ours. |
| Frame or trace log (tens of thousands of rows, monospace, copyable) | Virtualised rows, fixed height, `aria-rowcount` | TanStack Virtual. |
| Live values (about 10 channels) | Numeric tiles, SVG gauges, scrolling traces | Ours plus uPlot. |
| Snapshot diff (option names and raw bytes, old versus new) | Two-column diff viewer, changed rows marked by icon and text | Ours. No kit has one. |
| Write-flow stepper (preflight, snapshot, diff, dry run, typed confirm, apply, verify) | Stepper, accessible dialog, typed-confirm input | Dialog and input: yes. Stepper and typed-confirm: ours. |
| Mode banner ("Read only" or "Bench write enabled") | Persistent, non-dismissible banner | Ours. Trivial. |
| History timeline and audit log | List with timestamps | Ours. |
| Dashboard canvas with user-built gauges | Resizable panels, drag layout | `react-resizable-panels` for panes. Drag-to-arrange is post-window. |
| Adapter capability report | Table or definition list | Ours. |
| Command palette (jump to module, run scan) | Palette | `cmdk` (optional). |

**Reading:** the parts that matter most (diff viewer, stepper, typed-confirm, module row, live status panel, mode banner) are not in any component kit. So the library is chosen for its **primitives** (dialog, popover, tabs, tooltip, select, switch, menus, focus handling) and for **how little it fights us** when we build the custom parts. That favours headless or copy-in options over complete design systems. (Judgement, medium.)

---

## 2. Candidate shortlist

Started from the 15 libraries in `ui-library-landscape.md` section 2.1. Versions below were **re-read from the npm registry on 2026-11-20** and match that doc (high).

### 2.1 Gates applied before scoring

| Gate | Result |
|---|---|
| Licence is OSI-approved permissive (MIT, Apache-2.0, ISC, BSD) | **PrimeReact 11.2.3 fails.** Its licence is a size-gated commercial licence (landscape S7, high: read from the tarball). Excluded. |
| Works with React 19 and Vite | All pass. Mantine 9 requires React 19.2 or newer (registry, high). HeroUI 3 requires React 19 and Tailwind 4 (medium). |
| Can ship offline inside Electron with no network call | All pass. |
| Evidence of active release in the last 90 days | All pass except uPlot (charts, handled separately). |

**Dropped before scoring, with reason:** Chakra UI 3.38.0 and Ark UI 5.40.0 (bundle 331 and 297 KB gzip whole-package, no strength in tables, Emotion runtime for Chakra; landscape 2.2 and 2.4). Everything else enters the scoring.

### 2.2 The ten scored candidates

| ID | Candidate | Version (registry, high) | Licence (registry, high) | Peer React | Shape |
|---|---|---|---|---|---|
| A | **shadcn/ui on Base UI** | `shadcn` 4.23.0, `@base-ui/react` 1.9.0 | MIT, MIT | 17, 18, 19 | Copy-in components over headless primitives, Tailwind v4 |
| B | shadcn/ui on Radix | `shadcn` 4.23.0, `radix-ui` 1.8.1 | MIT, MIT | 16.8 to 19 | Same, different primitives |
| C | React Aria Components (+ own Tailwind styling) | 1.22.1 | Apache-2.0 | 16.8 to 19 | Style-free, strongest a11y documentation |
| D | Mantine 9 | `@mantine/core` 9.8.2 | MIT | 19.2 or newer | Full kit, CSS variables, built-in dark mode |
| E | Blueprint 6 | `@blueprintjs/core` 6.23.2 | Apache-2.0 | 18 or 19 | Own README targets data-dense desktop apps |
| F | Carbon | `@carbon/react` 1.121.0 | Apache-2.0 | 16.8 to 19 | IBM kit, Sass, documents 5 table row sizes |
| G | MUI 9 | `@mui/material` 9.5.0 | MIT | 17 to 19 | Mature, Material look, Emotion |
| H | HeroUI 3 | `@heroui/react` 3.2.7 | Apache-2.0 | 19 or newer | Tailwind 4 plus React Aria, new |
| I | Ant Design 6 | `antd` 6.7.1 | MIT | 18 or newer | Large kit, heaviest bundle measured |
| J | Fluent UI 9 | `@fluentui/react-components` 9.75.2 | MIT | 16.14 to below 20 | Microsoft kit, many dependencies |

Evidence for A's momentum: the shadcn changelog (fetched this run, medium) lists "Base UI as the Default" in July 2026 and shows Base UI, React Aria and Radix variants of newer blocks. The Base UI release page (fetched, medium) shows v1.9.0 dated 2026-10-09 and says canary builds may contain breaking changes, which is why we pin exact stable versions.

---

## 3. Scoring method

Nine criteria, weights sum to 100. Each candidate scores 1 (poor) to 5 (strong). Weighted score = sum(weight x score) / 5, giving a result out of 100.

| # | Criterion | Weight | Why this weight |
|---|---|---|---|
| T | Dense data tables | 18 | The fault list, module list and frame log are the main surface (landscape 2.3 "density question"). |
| G | Live gauges and charts support | 10 | Needed, but data rates are low (C10) and we draw gauges ourselves. |
| DL | Dark and light mode | 8 | Dark first (garage, night use), light required; mostly a token job. |
| A | Accessibility | 14 | Safety dialogs, keyboard, screen reader, never colour-only (C9). |
| L | Licence | 10 | Hard gate already passed; score reflects how clean and simple the notices are. |
| M | Maintenance | 8 | Release cadence, backing, age, deprecation signals. |
| B | Bundle | 6 | Matters less in Electron (no network), more for the Demo car and CI. |
| TH | Theming | 10 | We must own the look; tokens, density and a custom diff and gauge language. |
| P | Fit with the chosen platform | 16 | Electron renderer, Vite, Tailwind, Demo car in a browser, Node monorepo, one builder. |

### 3.1 Scores with one-line reasons

| Candidate | T | G | DL | A | L | M | B | TH | P | Weighted /100 |
|---|---|---|---|---|---|---|---|---|---|---|
| **A shadcn + Base UI** | 5 | 4 | 5 | 4 | 5 | 4 | 4 | 5 | 5 | **92.4** |
| B shadcn + Radix | 5 | 4 | 5 | 4 | 5 | 3 | 4 | 5 | 5 | **90.8** |
| C React Aria Components | 4 | 3 | 4 | 5 | 5 | 5 | 3 | 4 | 5 | **86.4** |
| D Mantine 9 | 3 | 4 | 5 | 3 | 5 | 5 | 3 | 4 | 4 | **77.6** |
| F Carbon | 4 | 3 | 5 | 4 | 5 | 5 | 2 | 3 | 3 | **75.6** |
| H HeroUI 3 | 3 | 3 | 4 | 4 | 5 | 3 | 4 | 4 | 4 | **74.8** |
| G MUI 9 | 4 | 4 | 4 | 3 | 4 | 5 | 3 | 3 | 3 | **72.4** |
| E Blueprint 6 | 4 | 2 | 4 | 3 | 5 | 4 | 4 | 3 | 3 | **70.0** |
| I Ant Design 6 | 4 | 3 | 4 | 3 | 5 | 5 | 1 | 3 | 3 | **70.0** |
| J Fluent UI 9 | 3 | 2 | 4 | 3 | 5 | 5 | 2 | 3 | 3 | **65.6** |
| K PrimeReact 11 | gated out by licence | | | | | | | | | n/a |

Arithmetic check for the top three (weights T18 G10 DL8 A14 L10 M8 B6 TH10 P16):

- A: 90 + 40 + 40 + 56 + 50 + 32 + 24 + 50 + 80 = 462, divided by 5 = 92.4.
- B: 90 + 40 + 40 + 56 + 50 + 24 + 24 + 50 + 80 = 454, divided by 5 = 90.8.
- C: 72 + 30 + 32 + 70 + 50 + 40 + 18 + 40 + 80 = 432, divided by 5 = 86.4.

### 3.2 Reasons behind the scores that matter

| Score | Reason | Evidence | Conf. |
|---|---|---|---|
| A, B table = 5 | The shadcn data-table guide builds on TanStack Table v9 and gives us the markup. We own the row height and density because the code is in our repo. | shadcn data-table docs, fetched 2026-11-20 | medium |
| C table = 4 | React Aria has an accessible Table with column resizing, but we style all of it and there is no ready diagnostic table. | landscape S12 | medium |
| D table = 3 | Mantine's own table is thin; richer tables come from the community add-on `mantine-datatable` 9.8.1. | landscape 2.4 | medium |
| E, F table = 4 | Blueprint's README leads with data-dense desktop apps; Carbon documents five row sizes. Both are good tables in a look we would have to fight. | landscape 2.3 | medium |
| A, B theming = 5 | Tailwind v4 CSS variables as tokens; we own the component source; density is a token and a class, not a prop we cannot change. | shadcn docs; landscape 2.3 | medium |
| F theming = 3 | Sass themes; heavy IBM identity; build needs Sass. | landscape 2.4 | medium |
| A = 4, C = 5 on a11y | Base UI documents WAI-ARIA Authoring Practices behaviour, keyboard handling and focus control, but names no tested screen readers. React Aria documents deeper (APG basis, many screen readers, RTL, 30+ languages). | landscape S11, S12 | medium |
| Mantine a11y = 3 | No overall accessibility claim was read. Score reflects absence of evidence, not evidence of absence. | landscape 2.3 | low |
| A maintenance = 4, B = 3 | Base UI 1.9.0 shipped 2026-10-09 with 13 releases in 12 months (11 stable); `radix-ui` 1.8.1 shipped 2026-10-12 but the dialog package's stable line moves slowly (81 versions, 11 stable). Neither is deprecated; shadcn made Base UI its default in July 2026. | registry, landscape 2.1, shadcn changelog | medium |
| Bundle A, B = 4 | Copy-in and tree-shaken: the app pays only for primitives used (one Radix dialog primitive measured 13 KB gzip; Base UI whole package 166 KB gzip as an upper bound only). | bundlephobia via landscape 2.2 | medium |
| Bundle I = 1 | `antd` whole package 461 KB gzip, 48 dependencies. | landscape 2.2 | medium |
| Platform P for E, F, G, I, J = 3 | They work, but each brings its own design language, its own styling engine (Sass, Emotion or CSS-in-JS) and its own table. We would be overriding them on the three screens that matter. | judgement | low |

### 3.3 Sensitivity: does the winner change if I change the weights?

Re-ran the three leaders with three alternative weightings (arithmetic by hand, same scores).

| Variant | A | B | C | D | Winner |
|---|---|---|---|---|---|
| Base weights | 92.4 | 90.8 | 86.4 | 77.6 | A |
| Accessibility doubled (A=28, others scaled down to keep 100) | about 91 | about 89 | about 90 | about 74 | A narrowly over C |
| Bundle and maintenance doubled, tables halved | about 91 | about 88 | about 89 | about 79 | A |
| Speed-to-first-screen heavily weighted (Mantine P=5, TH=5) | about 90 | about 88 | about 85 | about 83 | A |

I did the "doubled accessibility" line by redistribution and rounding, so treat the numbers as approximate (low). What it shows: **A stays first in every variant I tried, and C closes to within about one point when accessibility is weighted heavily.** That is why C is the named different-family fallback and why section 11 puts accessibility checks first.

### 3.4 Honest limits of this scoring

- I did not build the same screen in each library. Every score is a judgement from documentation, registry data and the earlier research (low to medium).
- A and B differ by 1.6 points, which is inside my noise. The tie-break is: shadcn made Base UI the default in July 2026 (medium), Base UI has the longer stated maintenance commitment per a news summary (low-medium, InfoQ via landscape S4), and the swap to Radix is cheap. If the week-1 checks fail on Base UI, we switch to B without redoing anything else.
- Fluent, Carbon and Blueprint have the weakest evidence in this run (landscape marked their accessibility, theming and density cells as not verified). I have not scored them down for ignorance except where marked.

---

## 4. The decision

### 4.1 Stack, with pinned versions

All versions read from the npm registry on 2026-11-20 (`npm view <pkg> version license`), high confidence unless marked. **Pin exact versions** (no caret) for the first build, bump on Fridays.

| Layer | Package | Pinned version | Licence | Notes |
|---|---|---|---|---|
| UI runtime | `react`, `react-dom` | 19.3.1 | MIT | Registry; published 2026-10-14 |
| Build | `vite` | 8.3.8 | MIT | Published 2026-11-16 per registry modified time. Required (C6). |
| Vite React plugin | `@vitejs/plugin-react` | 6.3.0 | MIT | |
| Styling | `tailwindcss` | 4.3.5 | MIT | |
| Styling build | `@tailwindcss/vite` | 4.3.5 | MIT | Same version as core |
| Components CLI | `shadcn` | 4.23.0 | MIT | Copy-in; components live in our repo. CLI is a dev tool, not shipped |
| Headless base | `@base-ui/react` | 1.9.0 | MIT | Published 2026-10-09 (Base UI release page) |
| Variant helpers | `class-variance-authority` 0.7.1 (Apache-2.0), `clsx` 2.1.1 (MIT), `tailwind-merge` 3.7.1 (MIT) | as listed | | CVA is stale since 2024-11 but tiny; replaceable |
| Animation utilities | `tw-animate-css` | 1.4.0 | MIT | Replaces `tailwindcss-animate` (last published 2023-08-28) |
| Tables | `@tanstack/react-table` | 9.3.1 | MIT | v9 uses `useTable` and a required `features` option; most online examples are v8 |
| Virtualisation | `@tanstack/react-virtual` | 3.14.26 | MIT | Frame log only |
| Server-state cache | `@tanstack/react-query` | 5.108.2 | MIT | For `DiagService` calls; optional in week 1 |
| Live traces | `uplot` | 1.6.32 | MIT | Published 2025-03-14, 0 dependencies |
| Post-session charts | `echarts` | 6.1.0 | Apache-2.0 | Lazy-loaded, not in the first build |
| Icons | `lucide-react` | 1.77.0 | ISC (MIT for Feather-derived icons) | Import per icon |
| Fonts | `@fontsource-variable/inter` | 5.3.0 | OFL-1.1 | UI text |
| Fonts | `@fontsource/jetbrains-mono` | 5.3.0 | OFL-1.1 | Hex, codes, logs. Variable build `@fontsource-variable/jetbrains-mono` 5.3.0 also exists |
| Live-value store | `zustand` | 5.1.0 | MIT | Per-channel subscriptions so the whole UI does not re-render at sample rate |
| Resizable panes | `react-resizable-panels` | 4.24.1 | MIT | Two-pane module layout |
| Palette | `cmdk` | 1.1.1 | MIT | Optional |
| Shell | `electron` | 45.4.1 | MIT | Published 2026-11-19 (registry). Support window not confirmed, see Gaps |
| Language | `typescript` | registry shows 7.0.2 (Apache-2.0) | | **Check compatibility** with the repo's `erasableSyntaxOnly` setup before bumping; landscape recommends 5.8 or newer. Not verified in this run |
| Unit tests | `vitest` | 5.1.1 | MIT | UI component tests; repo's own `node --test` stays for core |
| UI tests | `@playwright/test` | 1.65.1 | Apache-2.0 | Electron and browser |
| Accessibility checks | `@axe-core/playwright` | 4.14.0 | **MPL-2.0** | Dev-only. File-level copyleft, not GPL or AGPL, not shipped. Passes the stated gate; flag to owner |
| Component catalog | `storybook` | 10.6.8 | MIT | Optional, week 2 or later |

### 4.2 Why this and not another path (short)

- **Copy-in code we can read.** One builder, one agent, a safety UI. We want to open the dialog file and see exactly what it does (C8, C9).
- **No runtime styling engine.** Tailwind compiles to CSS at build time; no Emotion, no Sass.
- **Tokens are CSS variables.** Dark and light, density and the safety colour language switch by changing variables on `<html>`.
- **The custom parts are ours in every option.** Diff viewer, stepper, typed-confirm and mode banner exist in no kit, so a kit's visual style is a cost not a benefit.
- **Same code in Electron and the Demo car.** The renderer is plain React and CSS. No Electron-only API sits in components.

### 4.3 Browser floor for the Demo car and the later phone web view

Tailwind v4 core needs Chrome 111, Safari 16.4 or Firefox 128 or newer, and some utilities need newer features such as `@starting-style` and `field-sizing` (Tailwind compatibility page, fetched 2026-11-20, medium to high). In Electron this is moot. For the Demo car it means no support for older browsers, which is acceptable. **Rule: avoid the newer-feature utilities in shared components** so the Demo car and a future phone web view do not break.

---

## 5. Charting, gauges and tables

### 5.1 Live traces

| Option | Version | Licence | Gzip (whole, bundlephobia via landscape) | Last release | Verdict |
|---|---|---|---|---|---|
| **uPlot** | 1.6.32 | MIT | 21.9 KB | **2025-03-14** | **Chosen** for live traces |
| lightweight-charts | 5.3.0 | Apache-2.0 | 61.9 KB | 2026-11-10 | **Named fallback** if uPlot breaks or maintenance worries grow |
| Recharts | 3.11.0 | MIT | 177 KB | 2026-11-17 | Not in first build. Only if we adopt shadcn's chart blocks |
| ECharts | 6.1.0 | Apache-2.0 | 368 KB | 2026-05-19 | Post-session analysis only, lazy |
| visx | 4.0.0 | MIT | 50 KB for xychart | 2026-06-11 | Rejected: we would build every chart |
| Chart.js, dygraphs, smoothie, nivo | various | MIT | n/m | smoothie 2022-07-18, nivo 2025-05-23 | Rejected: stale or not better |

Reasons for uPlot (medium): smallest, canvas, no dependencies, and the README claims far lower CPU than Chart.js and ECharts in the author's own streaming test (self-reported, unversioned; landscape S19). **Risk accepted:** no releases in the 20 months to 2026-11-20 and no accessibility support. Mitigations, all binding:

1. Every live trace has a **table view of the same buffered values** one click away (and a "download CSV").
2. The chart container carries an `aria-label` and a text summary (latest value, min, max, unit).
3. We wrap uPlot in **one thin component of our own** (about 100 lines). We do not take a third-party React wrapper dependency. Whether a maintained wrapper exists was not checked in this run, so the choice here is a policy, not a finding (low).
4. If the checklist item F3 (section 11) fails, swap to lightweight-charts behind the same wrapper interface.

### 5.2 Gauges

No maintained, accessible, themeable gauge package was verified (landscape 5.3). `react-gauge-component` 2.0.29 exists (MIT, 2026-04-23) but we do not adopt it. **Decision: draw gauges as SVG** (arc, needle, numeric text) in our own component, driven by CSS variables.

Rules for every gauge (design rules, medium; ARIA `meter` role from the WAI-ARIA spec, not re-fetched this run):

| Rule | Why |
|---|---|
| Numeric value always present as real DOM text, large | Accessibility and readability at a glance |
| `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` and unit | Screen-reader support |
| Zones (normal, caution, limit) shown with **shape or pattern and a text label**, not colour only | UX rule X-colour; ISTA uses colour only and the teardown flags it |
| Needle motion damped, no continuous animation when value is stable | Motion rule, section 10.6; also saves CPU |
| Respect `prefers-reduced-motion` | Accessibility |
| Gauge never the only place a value appears | Same value appears in the live table |
| Stale data state: dim, show "no data for N s" | The adapter can drop; a frozen needle is a lie |

### 5.3 Tables

| Piece | Decision | Notes |
|---|---|---|
| Table state (sort, filter, selection, expansion, column visibility) | `@tanstack/react-table` 9.3.1 | v9 declared stable 2026-08-04 (landscape S22, medium). Read the v9 migration guide before coding; AI-generated examples are usually v8. |
| Fault list | Plain semantic `<table>`, **no virtualisation** | Hundreds of rows. Keeps native table semantics and screen-reader behaviour. |
| Module list | Same | Tens of rows. |
| Frame or trace log | TanStack Virtual 3.14.26, fixed row height, `aria-rowcount` and `aria-rowindex` set | Only visible rows exist in the DOM, so selection and "copy all" must read from the data array, not the DOM. ARIA grid practice; inference, not re-read (low-medium). |
| Snapshot diff | Our own component, two columns with a gutter icon plus text ("changed", "added", "removed") | No library fits. |
| Column resize, reorder | Defer. TanStack supports it; React Aria's Table is the reference if we need accessible resize | Not in the 12-week must-haves |
| Row height tokens | `--row-h-compact: 28px`, `--row-h-default: 36px`, `--row-h-comfortable: 48px` | Carbon documents 48 px as its large row (landscape 2.3); our numbers are proposals (low) |

**Rejected tables:** AG Grid Community 36.3.0 (MIT, 392 KB gzip; enterprise features are a separate paid product, so a free-tier trap), MUI X Data Grid 9.18.0 (higher tiers commercial), Glide Data Grid 6.0.3 (last release 2024-02-03), `mantine-datatable` (tied to Mantine).

---

## 6. Icons and fonts

### 6.1 Icons

| Option | Version | Licence | Verdict |
|---|---|---|---|
| **Lucide** (`lucide-react`) | 1.77.0 (registry, high) | ISC; MIT for icons derived from Feather (Lucide licence page, fetched 2026-11-20, high) | **Chosen.** shadcn default, consistent stroke style, per-icon imports |
| Tabler Icons (`@tabler/icons-react`) | 3.52.0 | MIT | Fallback if Lucide lacks a car-specific glyph |
| Phosphor (`@phosphor-icons/react`) | 2.1.10 | MIT | Rejected: not needed |

Rules:

1. **Import one icon at a time** (`lucide-react/icons/...` style or named imports with tree-shaking confirmed). The whole package measured 216 KB gzip (landscape 2.2). Add a CI check that the production bundle does not contain the whole set.
2. **Ship a third-party notices file** with the ISC and MIT notices. Both licences require the copyright and permission notice in copies (Lucide licence page, high).
3. **Custom glyphs we need** (battery, OBD port, CAN bus, ECU module, adapter types, bench module): draw ourselves on the same 24 px grid and 2 px stroke and keep them in our repo under Apache-2.0. We do not copy glyphs from OEM or competitor apps (clean-room).
4. **No icon alone carries meaning.** Every status icon has a text label next to it or an accessible name.

### 6.2 Fonts

| Role | Font | Package | Licence | Why |
|---|---|---|---|---|
| UI text | **Inter** (variable) | `@fontsource-variable/inter` 5.3.0 | SIL OFL-1.1 (upstream licence file read 2026-11-20, high) | Neutral, dense-friendly, tabular figures available |
| Hex, codes, logs, VINs | **JetBrains Mono** | `@fontsource/jetbrains-mono` 5.3.0 | SIL OFL-1.1, no Reserved Font Name stated in the licence file read (high) | Distinguishes `0` from `O` and `1` from `l`; vital for DTC codes and hex |

OFL practicalities (from the Inter licence text read, medium to high):

- The font may be bundled with software. Each copy needs the copyright notice and the OFL text, so **ship the licence files** with the app.
- The font **stays under the OFL** inside our Apache-2.0 app. It cannot be relicensed. Our code stays Apache-2.0. Put fonts in a separate folder with their own `LICENSE` and list them in the notices file.
- **Do not modify and rename** fonts without reading the Reserved Font Name clause. We do not modify them.
- Fontsource self-hosts, so **no call to Google Fonts**. This matters for privacy (no request leaves the machine) and for offline use.
- Load only the weights and subsets used (Latin, plus Latin Extended for German option names). Whether Inter's variable file covers all German diacritics we need was not checked; Latin includes ä, ö, ü and ß in standard fonts but I did not test it (low).
- **Numeric rule:** use tabular figures (`font-variant-numeric: tabular-nums`) for every live value so digits do not jitter.
- System-font fallback stack declared in CSS, so a missing font never blocks first paint.

Rejected fonts: Geist and Geist Mono (OFL, available on Fontsource at 5.3.0; fine, but we gain nothing over Inter), IBM Plex (OFL; larger family, not needed). Any commercial font: no (G12).

---

## 7. Licence audit of the chosen stack

Gate: no GPL, AGPL or non-commercial licence in shipped code (kpis). All licence strings below are from the npm registry on 2026-11-20 (high) unless stated.

| Package | Licence | Ships in app? | Gate |
|---|---|---|---|
| react, react-dom, vite, tailwindcss, @tailwindcss/vite, @vitejs/plugin-react, shadcn, @base-ui/react, radix-ui | MIT | Yes (build tools: no) | Pass |
| class-variance-authority | Apache-2.0 | Yes | Pass |
| clsx, tailwind-merge, tw-animate-css | MIT | Yes | Pass |
| @tanstack/react-table, react-virtual, react-query | MIT | Yes | Pass |
| uplot | MIT | Yes | Pass |
| echarts | Apache-2.0 | Later, lazy | Pass |
| lucide-react | ISC (some MIT) | Yes | Pass; notices file |
| Inter, JetBrains Mono (Fontsource) | OFL-1.1 | Yes | Pass; ship OFL text, keep fonts separate from Apache-2.0 code |
| zustand, react-resizable-panels, cmdk | MIT | Yes | Pass |
| electron | MIT | Yes (shell) | Pass; Chromium inside carries its own third-party notices, include them |
| @playwright/test | Apache-2.0 | No (dev) | Pass |
| vitest, storybook | MIT | No (dev) | Pass |
| **@axe-core/playwright** | **MPL-2.0** | No (dev only) | Pass, flagged: weak file-level copyleft, never bundled |
| React Aria Components (fallback) | Apache-2.0 | Only if adopted | Pass |
| Mantine (fallback) | MIT | Only if adopted | Pass |

**Two checks not done in this run (see Gaps):** the transitive dependency tree of each package was not scanned, and Electron's bundled Chromium notices were not read. Add a licence scan to CI (the pack linter and licence-zone checks already planned in G11 cover data, not npm) before the first release.

---

## 8. Platform fit: how the UI sits in the architecture

| Topic | Decision | Source / confidence |
|---|---|---|
| Process model | UI is the Electron **renderer**. It has **no Node access** (`contextIsolation` on, preload exposes the typed client). The UI calls typed `DiagService` methods only and never sends raw frames. | architecture-v2 section 6.4; medium (Electron guidance not re-fetched) |
| Same UI in browser | `apps/web` builds both the Electron renderer bundle and the static Demo car. Components import a `DiagClient` interface, not Electron. | architecture-v2 section 6.4 |
| Write screens | Live in the **Lab** package only. Public build must not contain them; the CI bundle audit greps the built renderer for lab strings and write service IDs. | decisions #6; architecture-v2 section 5 |
| Live data path | Service pushes samples; a Zustand store holds a ring buffer per channel (10 to 50 k points); each tile and chart subscribes to its channel only. | landscape section 1 |
| Persistence | Preferences (theme, density, last panel sizes) in `localStorage` equivalent. Never required for function. Snapshots and journals are files, not UI state. | architecture-v2 section 6.3 |
| Bluetooth in Electron | Web Bluetooth works in Electron through the app's own device handler, so the UI can call the same API in Chrome and Electron. Whether the Node BLE path is used instead is an adapter decision, not a UI one. | landscape 7.3, S27; medium |
| Phone later | Same React UI in a Capacitor web view is possible in principle. Dense tables on a phone were not researched; plan a separate "compact" layout, not shrinking the desktop one. | landscape 7.5; low |
| Electron size | Large download and RAM (bundles Chromium and Node). Accepted. Tauri revisit trigger is in architecture-v2 section 4.2. | landscape 7.3 |
| macOS permissions | Bundled app needs a Bluetooth usage string and Local Network permission handling for ENET; the first-run screen must explain why in plain words. | landscape 7.3; adapter doc, TN3179; high there |
| Performance budget | IPC overhead 1 ms p50 and 5 ms p95 (measured week 3). UI must render a 10-channel update without long frames; measured in the proof-of-fit checklist. | architecture-v2 section 5 |

---

## 9. What we explicitly reject, and why

| Rejected | Reason | Revisit if |
|---|---|---|
| **PrimeReact 11.x** | Moved from MIT (10.9.x) to the PrimeUI commercial licence with a free tier gated by organisation size and revenue; not OSI. Downstream users above the thresholds would have to pay. (landscape S7, high.) | Never for this project |
| **Ant Design 6** | Heaviest bundle measured (461 KB gzip, 48 deps); its own visual language; not dense in the way we need. | No |
| **Fluent UI 9** | 320 KB gzip, 62 deps; tables and gauges not a strength; research cells unverified. | No |
| **MUI 9** | Material look, Emotion peer dependencies, advanced table tiers are commercial (MUI X). | No |
| **Chakra UI 3, Ark UI** | 331 and 297 KB gzip; Chakra keeps Emotion runtime; weak tables. | No |
| **Carbon** | Strong dark themes and density rows, but Sass build, heavy IBM identity, bundle not measurable in the landscape run, and a distinct look we would override. | If we want to copy its row-size model only (we can, as a pattern) |
| **Blueprint 6 as base** | Right density, but README says not mobile-first, and its look is a fixed desktop-tool look. Good reference for table density. | If the phone is dropped for good and we want a faster desktop kit |
| **Mantine 9 as base** | Fast to a good screen, but thin table, React 19.2 minimum, its theme object is another system to learn, and architecture-v2 already chose "fallback only". | Weeks 3 to 4 slip (named trigger) |
| **HeroUI 3** | New (npm created 2025-01), needs Tailwind 4 and React 19; small advantage over A. | No |
| **AG Grid, MUI X Data Grid** | Free tier plus paid tiers; heavy; styling fights ours. | No |
| **Recharts as the main chart library** | SVG slows with many points (inference); 177 KB gzip; only needed for shadcn blocks. | We adopt shadcn chart blocks for dashboards |
| **visx** | We would build every chart; pre-release heavy (1 stable in 17 releases in 12 months). | No |
| **ECharts in the first build** | 368 KB gzip; accessibility off by default (`aria.show` needed). | Post-session analysis in weeks 8 to 12 (lazy) |
| **Smoothie, nivo, Glide Data Grid, Perspective** | Stale (2022, 2025-05, 2024-02, over a year) or heavy. | No |
| **Whole-package icon imports** | 216 KB gzip for Lucide whole. | No |
| **Google Fonts hosted link** | Network call at runtime; breaks offline; privacy. | No |
| **Toast-only error messages** (`sonner` for anything safety related) | Toasts disappear; a failed write must never vanish. `sonner` 2.0.8 allowed for non-critical "copied" confirmations only. | No |
| **Separate native UIs** (React Native, Flutter, SwiftUI) | Each means a second implementation of the protocol core; `flutter_blue_plus` also has a commercial-use licence trap. | Phone becomes the primary product (decision D0) |
| **Tauri shell** | Already deferred in architecture-v2. UI note: WKWebView is not Chromium, so `navigator.bluetooth` cannot be assumed. | Trigger in architecture-v2 4.2 |
| **A CSS-in-JS runtime** (Emotion, styled-components) | Runtime cost, extra moving part, and we do not need it with Tailwind variables. | No |
| **Heavy animation libraries** | Motion budget in section 10.6 is small; CSS does it. | A concrete need appears |

---

## 10. Look and behaviour proposal (for the owner to veto)

This section is **design proposal, unsourced as a whole** except where a cell cites the UX teardown (D and X numbers). It exists so the first build week has one agreed direction. Tokens and exact values get locked in the design-system doc that follows this one.

### 10.1 Personality

A calm workshop instrument, not a game dashboard and not an enterprise form. Plain English first, raw hex one click away. Quiet by default; loud only when something needs a human. Honest: never claim "safe" or "cannot brick" (X4).

### 10.2 Layout

| Area | Proposal |
|---|---|
| Frame | Left rail (car, modules, faults, live, snapshots, history, adapter), main area, optional right detail pane. Top bar: car identity (short VIN tail), adapter state, battery voltage, **mode banner**. |
| Panes | Module list on the left, detail on the right, resizable (`react-resizable-panels`). |
| Navigation depth | Flat and linear like BimmerCode (teardown 4), plus a command palette. |
| First run | Read-only. Scan, fault list, live data, snapshot only (D16). No write UI exists in the public build. |
| Empty and error states | Always say what happened, what we know, what to do next (D14). |
| Desktop window minimum | 1024 x 700 for the main product. Narrower layouts are the Demo car or phone later. |

### 10.3 Density

| Level | Row height | Use |
|---|---|---|
| Compact | 28 px | Frame log, advanced users |
| **Default** | 36 px | Fault and module lists |
| Comfortable | 48 px | Touch, accessibility preference |

Body text 14 px default, 12 px minimum for secondary text, monospace one step smaller than UI text. A single "density" setting changes row height and padding through CSS variables. (Proposal, low.)

### 10.4 Colour, mode and status

| Rule | Detail |
|---|---|
| Dark first, light supported, follows system by default | Tokens on `:root` with `prefers-color-scheme` and a manual override |
| One accent colour | Used for focus, selection and primary actions only |
| Semantic status set | Ok, info, caution, danger, neutral. Each paired with **an icon and a text label** (never colour only) |
| Contrast | Aim for WCAG AA text contrast in both themes; checked in the proof-of-fit run with axe and manual look |
| Mode banner | Persistent, full width, non-dismissible: "Read only" (calm) vs "Bench write enabled" (distinct colour **and** pattern and text) (D19) |
| Destructive actions | Never the default button; outcome-named labels such as "Write 3 options to FEM" and "Keep current coding" (D8, X3) |
| Typed confirm | Only for bench writes and restores; contains module and short VIN tail or bench ID (D7) |

### 10.5 Components we build ourselves (not in any kit)

1. Diff viewer (option and raw-byte, old versus new, reversible for restore: D3, D10).
2. Write-flow stepper with a visible state per step and a "blocked because" line.
3. Typed-confirm dialog.
4. Module row with status chips: coding verified, unverified, invalid; last snapshot; fault count (D11).
5. Live status panel: voltage, link quality, ignition, adapter capability (D1, D15).
6. Gauge, numeric tile, sparkline.
7. Three-state result banner: verified, written but unverified, failed (D9).
8. History timeline with local export (D13).

### 10.6 Behaviour and motion

| Topic | Rule |
|---|---|
| Motion | Short and functional: 100 to 200 ms for panel and dialog transitions; nothing decorative; honour `prefers-reduced-motion` |
| Live numbers | Update at a capped rate (about 4 to 10 per second on screen) even if samples arrive faster, so digits stay readable |
| Long operations | Show progress in plain terms (module X of Y, time so far); cancel visible only where cancel is safe (teardown section 8: safe-cancel points are unknown, so default is no cancel during a write) |
| Keyboard | Everything reachable by keyboard; visible focus ring; palette on Cmd-K |
| Copy | Every hex value, code and VIN fragment is click-to-copy with a text confirmation |
| Errors | Explain the refusal and the next step; never show a bare code (X9) |
| Data provenance | Each fault description shows its source and licence zone in a small "Source" disclosure (supports G11 and the OBDb share-alike zone) |
| Language | Plain English; German option names carry a plain gloss, never raw German alone (D18) |

### 10.7 What stays unknown until someone looks at it

Nothing here has been shown to a user. The teardown found no usability study of any competitor app (ux-teardown exec 9). The week-1 checklist and the first outside testers (G9) are the first evidence we will have.

---

## 11. Proof-of-fit checklist for the first build week

Run in order. Each item is pass or fail. **A fail on items F1 to F6 triggers the named swap, not a debate.** Budget: one day for items F1 to F6, one day for F7 to F12. Suggested dates: Thu Nov 26 to Fri Dec 4 (coding starts Nov 26; G-A is Tue Dec 1).

### 11.1 Setup and licences

| # | Check | Pass when | If fail |
|---|---|---|---|
| F0 | Scaffold: Vite 8.3.8 + React 19.3.1 + Tailwind 4.3.5; `shadcn` init with **Base UI**; add button, dialog, table, tabs, tooltip, select | `pnpm dev` shows a page; production build succeeds; clone to first screen under 15 minutes (G8 week-4 target) | Re-read shadcn docs; check Node and Vite versions |
| F0b | Pin exact versions; run a licence scan over the whole tree | No GPL, AGPL, non-commercial or unknown in shipped output; notices file generated; MPL-2.0 only in dev | Replace the offender |

### 11.2 Accessibility and safety UX (first, because it can flip the choice)

| # | Check | Pass when | If fail |
|---|---|---|---|
| F1 | **Typed-confirm dialog** on Base UI: focus trap, initial focus on the input, focus returns to trigger on close, Esc handled, destructive button never default | Keyboard-only run passes; screen reader (VoiceOver on the Mac) reads title, description and button names | Swap base to Radix (B). If both fail, evaluate React Aria (C) |
| F2 | `axe` run (via `@axe-core/playwright` 4.14.0) on dialog, table and form | Zero serious or critical findings | Fix; if unfixable in primitives, escalate to C |
| F3 | VoiceOver reads a **gauge** (`role="meter"`) and a **uPlot** chart's text summary and table view | Value, unit and range spoken; table view reachable | Swap uPlot to lightweight-charts behind the wrapper; keep table view regardless |
| F4 | Status never by colour alone: render all status chips and gauge zones in greyscale | Every state still distinguishable | Add icon, pattern or text |
| F5 | Contrast check of both themes' tokens | AA for text and for focus ring | Adjust tokens |
| F6 | Mode banner is present on every route and cannot be dismissed | Test fails if missing | Fix layout shell |

### 11.3 Tables and live data

| # | Check | Pass when | If fail |
|---|---|---|---|
| F7 | **Fault table** with 500 simulated rows on TanStack Table 9.3.1: sort, filter by module and status, expand row for plain-English text | Interaction under 100 ms on the owner's Mac; semantic table markup kept | Check v9 `features` setup; as last resort React Aria Table (C) |
| F8 | **Frame log** with 50,000 rows on TanStack Virtual 3.14.26: scroll, select range, copy as text, jump to row | 60 fps scroll on the owner's Mac; "copy all" reads the data array; `aria-rowcount` set | Fixed row height; reduce cell complexity |
| F9 | **Live panel**: 10 simulated channels at 10 Hz, gauges, tiles and two uPlot traces for 30 minutes | No growth in memory beyond the ring buffers; no long frames; CPU low enough that the fan does not spin (observe) | Throttle on-screen rate; per-channel subscriptions; check Zustand selectors |
| F10 | **Diff viewer** prototype: 200 option changes, old versus new, reverse for restore | Readable at 28 and 36 px rows; screen reader reads change type | Simplify; this component is ours either way |

### 11.4 Shell, packaging and theming

| # | Check | Pass when | If fail |
|---|---|---|---|
| F11 | Same bundle loads in **Electron 45.4.1** (via IPC client) and in **Chrome, Firefox and Safari** as the Demo car with the simulator | All screens work in both; no Electron-only import in components | Move the offender behind `DiagClient` |
| F12 | Theme switch dark, light, system with **no flash** on load; density switch updates every table and gauge | One toggle works across the app; reload keeps choice | Fix token ordering and the early inline script |

### 11.5 Size, offline and licence hygiene

| # | Check | Pass when | If fail |
|---|---|---|---|
| F13 | Renderer production bundle size and first paint measured and recorded | Numbers written in the Friday note (no target set yet; set one after measuring, low) | None; record only |
| F14 | **Offline test:** disconnect the network and launch | No fonts, icons or scripts requested from the internet (check network log: zero external requests) | Replace any CDN reference with the Fontsource package |
| F15 | **Icon tree-shake check:** production bundle contains only the icons used | Lucide whole set absent | Switch to per-icon imports |
| F16 | **Lab-code absence:** public renderer bundle contains no write-flow strings or write service IDs | CI grep passes | Fix the build graph |
| F17 | Fonts: OFL files shipped, notices file lists Inter, JetBrains Mono, Lucide | Present in the packaged app | Add |

### 11.6 Gate for moving on

- **Green (F0 to F17 pass or have an accepted swap):** lock the choice in `decisions.md` as a new row, then write the design-system doc (tokens, spacing, type scale, component specs).
- **Swap path:** A to B (Radix) costs about a day; A or B to C (React Aria) costs about three days, my estimate (low). Mantine (D) is only for a schedule emergency in weeks 3 to 4.
- **Report on the Friday scoreboard** under G8 (clone to first screen), G9 (outside testers' feedback on look) and G10 (reliability of live panel).

---

## 12. Risks and how this decision handles them

| Risk | Likelihood | Effect | Handling |
|---|---|---|---|
| Base UI is young; a breaking release lands | Medium | Rework of copied components | Pin exact versions, bump on Fridays; copy-in code means upgrades are our choice |
| shadcn components are copied once and drift from upstream | Medium | Missed fixes | Record the shadcn CLI version in each component header; diff on upgrade days |
| uPlot unmaintained | Medium | Bug we must fix ourselves | Thin wrapper; lightweight-charts as named swap; table view always present |
| TanStack v9 pitfalls from v8 examples | High (documented) | Wasted hours | Read the v9 migration guide first; add a note in the repo |
| Accessibility claims are self-reported by vendors | High | We ship something less accessible than assumed | Items F1 to F5 are our own evidence; test with VoiceOver |
| Electron updates every few weeks | High | Patch churn | Pin; bump monthly; support policy: latest three majors (Electron docs, fetched, medium) |
| Tailwind v4 browser floor | Low | Old browsers unsupported in Demo car | Documented in section 4.3 |
| Owner dislikes the look | Medium | Rework of tokens only | Look is tokens; section 10 is a proposal to veto before week 1 |
| Phone becomes primary (decision D0 flips) | Low | Different stack | Triggers in architecture-v2 4.2; this UI would be reused in a web view or replaced |
| Licence drift in a transitive dependency | Low-medium | Gate failure | CI scan (F0b) |

---

## 13. What this means for the plan (short)

- Add to `architecture-v2.md` section 6.4 once the owner agrees: exact pinned stack from section 4.1, uPlot with mandatory table view, Lucide, Inter, JetBrains Mono.
- Next doc: design system (tokens, type scale, spacing, status language, component specs for the eight custom components in 10.5).
- Add week-1 UI items F0 to F17 to the sprint plan under G8 and G10.
- Cost: $0. No account, no key, no signed build. Nothing in this stack changes the $200 cash cap (G12).

---

## Gaps (what could not be established)

1. **No side-by-side build.** I did not build the same screen in each candidate. All scores are judgement (low to medium). The proof-of-fit week is the real test.
2. **Accessibility evidence is vendor-documented only.** Base UI and React Aria docs describe behaviour; nobody independent was found testing them with screen readers. Mantine, MUI, Fluent, Blueprint and Ant Design accessibility was **not verified** in this or the prior run.
3. **Density controls** were verified for Carbon only (five row sizes). Blueprint, Mantine, MUI and Ant Design density settings were not verified.
4. **Real bundle sizes.** Numbers are whole-package upper bounds from bundlephobia (via the landscape doc), not our tree-shaken build. Carbon and PrimeReact were not measured. A local build per candidate was not run.
5. **GitHub activity** (stars, last commit, issue response) was not re-checked; GitHub's API was rate-limited in the earlier run and I used the npm registry for dates and licences instead.
6. **Electron support window.** The Electron timelines page did not list versions 43 to 46 or their Chromium and Node versions; it states the latest-three-majors policy. Check `https://releases.electronjs.org/schedule` before pinning. Electron 45.4.1 is the registry latest, but whether it is inside the supported set was not confirmed.
7. **TypeScript 7.0.2** shows as latest on the registry. Compatibility with the repo's strip-types settings and with Vite 8 and the shadcn toolchain was not tested. Stay on the repo's current TypeScript until tested.
8. **Transitive licences** and Chromium's bundled notices were not scanned.
9. **Base UI stability claims.** The release page gives no formal breaking-change policy; the maintenance commitment comes from a news summary (low-medium).
10. **No maintained uPlot React wrapper was checked**; policy is to write our own. Whether uPlot works cleanly under React 19 strict mode was not tested.
11. **Fonts:** German diacritic coverage of the Fontsource Inter subsets not tested. Fontsource packaging terms were not read beyond the registry licence field (OFL-1.1) and the upstream font licence files.
12. **Phone layouts.** Dense table behaviour in a Capacitor web view was not researched.
13. **User evidence.** No usability testing of anything here; no competitor usability study exists in the research. Section 10 is a proposal.
14. **Dynamic pages read through a summarising model.** The shadcn, Base UI, Lucide, Tailwind and Electron pages were read through a summariser, so quoted facts are second-hand (medium).

---

## Sources

Registry data was read with `npm view <package>` and the registry JSON on 2026-11-20. Official pages were fetched on the same day.

| ID | Source | Used for | Conf. |
|---|---|---|---|
| R1 | npm registry, `https://registry.npmjs.org/<package>` and `npm view` | Versions, licences, peer React ranges, publish and modified dates for every package named in sections 2, 4, 5, 6 and 7 | high |
| R2 | Lucide licence page, `https://lucide.dev/license` | ISC for Lucide; MIT for Feather-derived icons; notice requirement | high |
| R3 | Inter licence file, `https://github.com/rsms/inter/blob/master/LICENSE.txt` | OFL-1.1; bundling conditions | high |
| R4 | JetBrains Mono licence file, `https://github.com/JetBrains/JetBrainsMono/blob/master/OFL.txt` | OFL-1.1; no Reserved Font Name stated | high |
| R5 | shadcn changelog, `https://ui.shadcn.com/docs/changelog` | "Base UI as the Default" July 2026; Base UI, React Aria and Radix variants; recent entries | medium |
| R6 | shadcn data-table guide, `https://ui.shadcn.com/docs/components/base/data-table` | Built on TanStack Table v9; no mention of virtualisation or density | medium |
| R7 | Base UI releases, `https://base-ui.com/react/overview/releases` | v1.9.0 dated 2026-10-09; canary may break; no formal policy | medium |
| R8 | Tailwind CSS compatibility, `https://tailwindcss.com/docs/compatibility` | Browser floor: Chrome 111, Safari 16.4, Firefox 128 | medium to high |
| R9 | Electron timelines, `https://www.electronjs.org/docs/latest/tutorial/electron-timelines` | Support policy: latest three stable majors; page lacks versions 43 to 46 | medium |
| L1 | `docs/research/deep2/ui-library-landscape.md` | Prior research: bundle sizes, a11y notes, candidates, chart and table data, shell comparison (its own sources S1 to S40) | medium |
| L2 | `docs/research/deep2/ux-teardown-and-safety-ux.md` | Do and do-not patterns D1 to D20, X1 to X18, write flow, components needed | medium |
| L3 | `docs/research/deep2/adapter-and-transport-constraints.md` | Transport limits, Electron and Web Bluetooth notes, macOS permissions | medium to high |
| L4 | `docs/plan/architecture-v2.md`, `platform-decision.md`, `decisions.md`, `kpis.md` | Binding platform, process and licence constraints | high (repo decisions) |
