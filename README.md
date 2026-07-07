# FleetPack · FAM — Fleet Availability Module

Angular implementation of the **FAM (Fleet Availability Module)** screens from the Nexus Theme v2 design (KLA FleetPack). Standalone components, signal-based state management, Chart.js visualizations, custom heatmap/Gantt renderers, and a fully mocked REST API — no backend required.

## Quick start

```bash
npm install
npm start          # ng serve --open → http://localhost:4200
```

Requires Node 20.19+ or 22.12+ (Angular 22).

## Screens & routes

| Route | Screen |
|---|---|
| `/fleet-availability/up-time/analysis` | **Fleet Up+Time Analysis** — uptime trend line chart (1W/13W rolling + period average), uptime breakdown table (rolling, tool-wise, grouped by SW version) with toggles + CSV export, Top-10 unavailable tools stacked bar, downtime category details |
| `/fleet-availability/up-time/availability` | **Fleet Up+Time Availability** — KPI strip (13W/4W rolling, current week, MTBr, total downtime), fleet uptime/downtime combo chart, top unavailable tools, downtime categories |
| `…/availability/heatmap` | Tab 1 — **24-Hour State Heatmap** (custom CSS-grid, 14 days × hour blocks, state totals) |
| `…/availability/gantt` | Tab 2 — **Activity Gantt** (Sys E10 / Tool E10 rows per day, segment labels, day-shift mask, daily availability %) |
| `…/availability/events` | Tab 3 — **Event Details** (grouped-by-day table, source/state/JobStatus, paging, Add Event, CSV) |
| `/alarm-explorer` | **Alarm Explorer home** — stacked alarm-volume chart by category (trend/Pareto toggle), fleet breakdown drill-down list |
| `/alarm-explorer/fleet/:fleetId` | **Fleet detail** — tool-level stacked distribution (click a bar to drill down), top alarms, tool summary table |
| `/alarm-explorer/fleet/:fleetId/tool/:toolId` | **Tool alarm summary** — searchable/filterable alarm table + **Alarm Info** side panel (occurrence stats, recipe context, weekly-trend sparkline) |
| `…/tool/:toolId/alarm/:alarmId` | **Alarm events** — chronological event log with recipe filter, resolution badges, pagination, CSV |
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
| `chart` | ChartWidgetComponent | Any Chart.js chart, drill-down via `onPointClick` |
| `table` | TableWidgetComponent | Columns config: text/mono/badge/dot/trend cells, grouping, selection, pagination |
| `ranked-list` | RankedListWidgetComponent | Drill-down lists with rank, trend pill, progress bar |
| `component` | NgComponentOutlet | Any component, by class or by registry `name` |

Custom widgets (`state-heatmap`, `activity-gantt`, `event-details`,
`alarm-info-panel`) are registered by name in `register-widgets.ts`
(bootstrapped via `provideAppInitializer`), so pages — or future server-driven
configs — can reference them as `{ type: 'component', name: 'state-heatmap' }`.

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
