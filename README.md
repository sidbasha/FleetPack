# FleetPack · FAM — Fleet Availability Module

Angular implementation of the **FAM (Fleet Availability Module)** screens from the Nexus Theme v2 design (KLA FleetPack). Standalone components, signal-based state management, Chart.js visualizations, custom heatmap/Gantt renderers, and a fully mocked REST API — no backend required.

## Quick start

```bash
npm install
npm start          # ng serve --open → http://localhost:4200
```

Requires Node 18.19+, 20.11+, or 22.0+ (Angular 20).

## Screens & routes

| Route | Screen |
|---|---|
| `/fleet-availability/up-time/analysis` | **Fleet Up+Time Analysis** — Uptime/Downtime Trend toggle on the rolling line chart (1W/13W + period average), collapsible uptime breakdown table (rolling, tool-wise, grouped by SW version) with chip-style Tool-wise/Grouped toggles + CSV export, Top-10 unavailable tools stacked bar, downtime category details with colored progress bars |
| `/fleet-availability/up-time/availability` | **Fleet Up+Time Availability** — single divided KPI strip (13W/4W rolling, current week, MTBr, total downtime in red), Uptime/Downtime Trend line chart, Top-10 unavailable stacked bar with a Non-Scheduled toggle, downtime categories (colored label + underline bar), a collapsible **Tool-Level Analysis Filter** bar (tool picker + live state-count pills) |
| `…/availability/heatmap` | Tab 1 — **24-Hour State Heatmap** (custom CSS-grid, 14 days × hour blocks; state totals now live in the page-level Tool-Level Analysis Filter bar) |
| `…/availability/gantt` | Tab 2 — **Activity Gantt** (Sys E10 / Tool E10 rows per day, segment labels, colored availability badges, "Day Shift" as a legend swatch, pagination in the footer) |
| `…/availability/events` | Tab 3 — **Event Details** (grouped-by-day table with sortable timestamps, progress-bar duration, outlined state badges, delete/edit row actions, paging, Add Event, CSV) |
| `/alarm-explorer` | **Alarm Explorer home** — Model/Fleet/Category/Duration filter bar, stacked alarm-volume chart by category (Trend/Pareto tabs), fleet breakdown drill-down list |
| `/alarm-explorer/fleet/:fleetId` | **Fleet detail** — Alarm ID/Tools/Category/SW Version filter bar, 5-metric KPI strip, tool-level stacked distribution (Trend/Pareto tabs, click a bar to drill down), top alarms with category-colored bars, tool summary table |
| `/alarm-explorer/fleet/:fleetId/tool/:toolId` | **Tool alarm summary** — Alarm ID/Category/Severity/Recipe filter bar + searchable alarm table; selecting a row opens the **Alarm Info** inspector in a slide-over `<base-drawer>` (occurrence stats, recipe context, weekly-trend chart) |
| `…/tool/:toolId/alarm/:alarmId` | **Alarm events** — Date Range/Recipe/Show/Duration filter bar, 4-metric KPI strip, chronological event log with a recipe tab filter, outlined resolution badges, pagination, CSV |
| `/fleet-configuration`, `/fleet-productivity`, `/tqual`, `/my-reports`, `/innovation-lab`, `/engineering-utilities` | Placeholder modules wired into nav & routing |

## Architecture

```
src/app/
├── core/
│   ├── models/          # Shared TypeScript interfaces (API contracts)
│   ├── mock-api/        # HttpInterceptor serving deterministic mock data
│   ├── services/        # ApiService — the single HTTP gateway
│   └── state/           # base.store.ts primitives + feature stores
├── layout/              # Shell, sidebar, topbar
├── shared/
│   ├── components/      # KPI, loading, legend, trend pill
│   ├── dynamic/         # ★ Dynamic widget system (see below)
│   └── utils/           # CSV export, helpers
└── features/            # Screens = header + WidgetConfig[] (thin)
```

### Dynamic widget system (`shared/dynamic/`)

Every screen is **configuration, not template**. A page component builds a
`computed<WidgetConfig[]>` and renders `<fam-dynamic-page [widgets]="widgets()"/>`.

| Widget type | Renderer | Use |
|---|---|---|
| `kpi-grid` | KpiGridWidgetComponent | KPI strips |
| `chart` | ChartWidgetComponent | Any Chart.js chart, drill-down via `onPointClick`; legend renders below the canvas |
| `table` | TableWidgetComponent | Columns config: text/mono/badge/dot/trend/progress/**text-bar**/**row-actions**/sparkline/link cells, grouping (`groupHeaderStyle`: accent/plain/light), selection, pagination |
| `ranked-list` | RankedListWidgetComponent | Drill-down lists with rank, trend pill, per-item colored progress bar (`barColor`), custom title/subtitle classes |
| `component` | NgComponentOutlet | Any component, by class or by registry `name` |

Every non-frameless widget's panel header can also carry, regardless of type:
`titlePrefix` (muted text before the title), `dateRange` (2-line range top-right),
`tabs` (segmented pill switch, e.g. Trend/Pareto), `toggle` (a single boolean
switch), `search` (inline search box), `collapsible`/`collapsed` (accordion
chevron), and chip-style `actions` (pass `active: boolean` on a `WidgetAction`
to render it as a toggle chip instead of a plain button). See
`shared/dynamic/widget.model.ts` for the full `WidgetBase` contract.

Custom widgets (`state-heatmap`, `activity-gantt`, `event-details`) are
registered by name in `register-widgets.ts` (bootstrapped via
`provideAppInitializer`), so pages — or future server-driven configs — can
reference them as `{ type: 'component', name: 'state-heatmap' }`. The Alarm
Explorer's inspector (`alarm-info-panel`) is imported directly and rendered
inside a `<base-drawer>` by its host page rather than through the registry,
since drawer content needs to sit outside the page's widget grid.

### State management (`core/state/`)

`base.store.ts` provides composable primitives for all current & future modules:

- **`createQuery(fetcher, { cacheTtlMs, keepPreviousData })`** — async server
  state as signals: `data/status/loading/error`, TTL cache keyed by params,
  in-flight de-dupe, request cancellation, `refresh()` (cache-bypass), `clear()`.
- **`createPagination(sourceSignal, pageSize)`** — client paging: `paged/page/pageCount/next/prev/goTo/reset`.
- **`createListFilter(sourceSignal, initial, predicate)`** — reactive filtering.

`UptimeStore` and `AlarmStore` are thin compositions of these primitives and
expose back-compat selectors. `UptimeStore` auto-refetches active queries when
the global fleet filter changes (`effect` + `untracked`).

### Mock API

`mock-api.interceptor.ts` intercepts `/api/**` and returns seeded, deterministic
data (see `mock-data.ts`). **To integrate a real backend, remove the interceptor
from `app.config.ts`** — the full procedure is in the Word developer guide
(`FAM-Developer-Guide.docx`), §API integration.

Endpoints: `/api/fleets`, `/api/uptime/analysis`, `/api/uptime/availability`,
`/api/alarms/home`, `/api/alarms/fleets/:fleetId`,
`/api/alarms/fleets/:fleetId/tools/:toolId`,
`/api/alarms/fleets/:fleetId/tools/:toolId/alarms/:alarmId/events`.

### Charts

ng2-charts 6 + Chart.js 4, registered once via `provideCharts(withDefaultRegisterables())`.
Charts are described entirely by `ChartWidget` configs.

### Styling

Tailwind CSS 4 (CSS-first config): the `nexus`, `state-*` and `alarm-*` palettes
are `@theme` tokens in `src/styles.css`, alongside the component classes
(`panel`, `table-th`, `btn-primary`, …). PostCSS is wired via `.postcssrc.json`.

### Adding a new module (checklist)

1. Define response interfaces in `core/models`.
2. Add endpoint methods to `ApiService` (+ mock handler while backend is pending).
3. Create `MyModuleStore` composing `createQuery` / `createPagination` / `createListFilter`.
4. Create a page component: build `computed<WidgetConfig[]>`, render `<fam-dynamic-page>`.
5. Need a bespoke visual? Build a component, `registerWidget('my-widget', …)`, reference it as a `component` widget.
6. Add the lazy route in `app.routes.ts` and a sidebar entry.

Full walkthrough with code samples and a data-flow chart: **FAM-Developer-Guide.docx**.

## Publishing `@your-scope/fleetpack-base` to a private npm registry

The **Base module** (`src/app/base/`) doubles as a standalone Angular library,
packaged from the exact same source with
[ng-packagr](https://github.com/ng-packagr/ng-packagr). The app keeps
consuming it locally via `src/app/base/index.ts` as before; the npm package
is an ng-packagr build of that same file — see `src/app/base/ng-package.json`,
`src/app/base/package.json`, and `src/app/base/tsconfig.lib*.json`. Nothing
under `components/`, `services/`, `models/`, `directives/`, or `utils/` moved
or changed to make this work.

### One-time setup

1. Copy `.npmrc.template` → `.npmrc` (it merges with the `legacy-peer-deps`
   line already there) and fill in your registry's URL/host in place of
   `YOUR_PRIVATE_REGISTRY_URL` / `YOUR_PRIVATE_REGISTRY_HOST`.
2. Export an auth token for that registry as `NPM_AUTH_TOKEN` in your shell
   (or CI secret store) — never paste a literal token into `.npmrc`.
3. Pick your real npm scope and replace every `@your-scope` placeholder with
   it: `src/app/base/package.json`'s `name`, and the matching line in
   `.npmrc`.
4. If your registry needs an interactive login instead of a static token:
   `npm login --scope=@your-scope --registry=https://YOUR_PRIVATE_REGISTRY_URL/`.

### Build, verify, publish

```bash
npm run build:base     # ng-packagr → dist/fleetpack-base, then compiles src/styles.css into dist/fleetpack-base/styles.css
npm run verify:base    # two-stage install + functional check — see below
npm run pack:base      # optional: produce the .tgz locally for manual inspection
npm run publish:base   # npm publish ./dist/fleetpack-base, via whatever registry .npmrc maps @your-scope to
```

`verify:base` runs two scripts back to back, both against a real packed
`.tgz` (not the source tree):

1. `scripts/verify-lib-install.mjs` — packs, installs into a throwaway
   project, confirms `main`/`module`/`typings`/`style`/`exports` all point
   at files that actually exist. Fast shape check.
2. `scripts/verify-lib-functional.mjs` — scaffolds a real, minimal Angular
   20 app that depends on the tarball, installs it (pulling
   `@angular/core`/`@angular/cdk`/etc. from the registry for real), renders
   `BaseButtonComponent` + `BaseBadgeComponent` + `BaseTableComponent`
   (the last one exercises `@angular/cdk/drag-drop` internally), wires the
   package's `styles.css` into that app's `angular.json`, and runs a real
   production `ng build` — full AOT compile, Ivy partial-compilation
   linking, esbuild bundling, CSS concatenation. It then greps the built
   `main.js` for each component's marker text *and* its compiled
   class-computation logic (`bg-action`), and the built `styles.css` for
   the design tokens (`--p-indigo`) and the generated utility class
   (`.bg-action`) those components actually render with. This is the same
   pipeline a real consumer's `ng build` runs — it doesn't launch a
   browser, so it's not a visual confirmation, but a pass means the
   package's code and CSS both survive a genuine install-and-build.

`build:base` is two steps chained (`ng build fleetpack-base && node
scripts/build-base-styles.mjs`): ng-packagr compiles/bundles the Angular
code, then the second step compiles the app's actual global stylesheet
(`src/styles.css` — same Tailwind v4 config, same design tokens, same
`@source` scan) into a standalone `dist/fleetpack-base/styles.css` and
wires it into the built `package.json`'s `exports`/`style` fields. Bump
`src/app/base/package.json`'s `version` before each publish — ng-packagr
copies it verbatim into the built package. `publish:base` targets
`dist/fleetpack-base` (the *built* package.json, with `main`/`module`/
`typings`/`exports`/`style` filled in), not the repo root.

### Consuming it

```bash
npm install @your-scope/fleetpack-base
```

Requires a `.npmrc` (project- or user-level) mapping the `@your-scope` scope
to your private registry — see `.npmrc.template`. Peer dependencies
(`@angular/core`, `@angular/common`, `@angular/forms`, `@angular/router`,
`@angular/cdk`, all `^20.0.0`) must already be present in the consuming app;
npm installs them automatically if they aren't pinned to a conflicting
version.

**Styling ships with the package.** Add its compiled stylesheet to your
app's global styles — e.g. in `angular.json`:

```json
"styles": ["node_modules/@your-scope/fleetpack-base/styles.css", "src/styles.css"]
```

or `@import '@your-scope/fleetpack-base/styles.css';` at the top of your
own global CSS. That file is a full compile of this repo's `src/styles.css`
(Tailwind v4 output + the Nexus design tokens + every component utility
class Base uses, e.g. `btn-primary`, `panel`, `table-th`) — not a
hand-picked subset, so it's never at risk of missing a class a component
needs. It is *not* tree-shaken per-component; expect the full token/utility
set (~100 kB unminified) regardless of which Base components you actually
use.

### Registry-agnostic by design

`src/app/base/package.json` has no `publishConfig.registry` — the
destination is whatever `.npmrc` maps `@your-scope` to, and `_authToken`
lines use `${NPM_AUTH_TOKEN}` env-var substitution rather than a literal
secret, so `.npmrc` itself is safe to commit. The same setup works unchanged
against Verdaccio, Nexus, JFrog Artifactory, GitHub Packages, Azure
Artifacts, or AWS CodeArtifact — swap the URL/host and token, nothing else
changes.
