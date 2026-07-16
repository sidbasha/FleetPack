# FleetPack FAM — Component Documentation

Angular 17+ standalone-component app. Every screen is real UI wired to **mock data**
served through an `HttpInterceptor`, so screens run end-to-end today and only need
the interceptor swapped for a real backend later — no component rewrites.

## 1. Architecture at a glance

```
Component (template + computed signals)
   │  reads
   ▼
Store  (core/state/*.store.ts — signals, createQuery/createPagination)
   │  calls
   ▼
ApiService  (core/services/api.service.ts — typed HttpClient wrapper)
   │  HTTP GET /api/**
   ▼
mockApiInterceptor  (core/mock-api/mock-api.interceptor.ts)
   │  routes path → generator
   ▼
mock-data.ts  (build...() functions — deterministic, seeded fake data)
```

A component never talks to `HttpClient` or mock data directly — it only reads a
`Store`. That's what makes "component + mock data" a clean, swappable delivery: the
same component works unchanged once `mock-data.ts`/the interceptor are replaced by a
real `/api` backend.

| Layer | File(s) | Responsibility |
|---|---|---|
| Models | [core/models/models.ts](../src/app/core/models/models.ts) | Typed response/row shapes — the contract between mock and real API |
| Mock data | [core/mock-api/mock-data.ts](../src/app/core/mock-api/mock-data.ts) | `build...()` generators producing deterministic fake payloads |
| Mock routing | [core/mock-api/mock-api.interceptor.ts](../src/app/core/mock-api/mock-api.interceptor.ts) | Matches `/api/**` paths to a generator, adds artificial latency |
| Service | [core/services/api.service.ts](../src/app/core/services/api.service.ts) | One typed method per endpoint, returns `Observable<T>` |
| Store | [core/state/*.store.ts](../src/app/core/state) | Signal-based state: loading/error/data, caching, pagination |
| Component | [features/**](../src/app/features) | Template + `computed()` widget configs, no data-fetching logic |

---

## 2. Shared widget / component library

The reusable toolkit every screen is built from. New components should be composed
from these rather than hand-rolled markup wherever a fit exists.

### 2.1 Basic UI atoms — `shared/components/ui.components.ts`

| Selector | Purpose | Key inputs |
|---|---|---|
| `<fam-kpi>` | A single KPI tile (label/value/unit/sub, optional accent color) | `label*`, `value*`, `unit`, `sub`, `accent` |
| `<fam-loading>` | Inline spinner + "Loading {what}" row shown while a store query is in flight | `what` |
| `<fam-state-legend>` | Fixed legend chips for the 5 (or 6 with `withGap`) tool states | `withGap` |
| `<fam-trend>` | ▲/▼ percentage pill; color flips via `badWhenUp` (alarms=bad-up, uptime=good-up) | `value*`, `badWhenUp` |

### 2.2 Dynamic widget system — `shared/dynamic/*`

Every feature screen renders a page as **data**, not template: a component computes
a `WidgetConfig[]` and hands it to `<fam-dynamic-page>`. Adding a panel means adding
an object to that array, not writing new HTML.

- **`widget.model.ts`** — the `WidgetConfig` union and shared panel chrome fields
  (`title`, `badge`, `colSpan` 1–6, `legend`, `actions`, `frameless`).
- **`dynamic-page.component.ts`** — `<fam-dynamic-page [widgets]="...">` lays out a
  responsive 6-column grid; `<fam-dynamic-widget>` renders panel chrome + dispatches
  by `widget.type`.
- **`basic-widgets.components.ts`** + **`table-widget.component.ts`** — the concrete
  renderers for each widget type.
- **`widget-registry.ts`** / **`register-widgets.ts`** — lets a `component`-type
  widget reference a component **by string name** instead of importing the class,
  so dynamic pages can embed feature-specific widgets (see §2.3).

| `type` | Interface | Renders | Used for |
|---|---|---|---|
| `kpi-grid` | `KpiGridWidget` | Auto-fit grid of `<fam-kpi>` tiles | KPI rows |
| `chart` | `ChartWidget` | Chart.js canvas (`chartType`, `data`, `options`), optional `onPointClick` drill-down | Trends, bar/line/pareto charts |
| `table` | `TableWidget<Row>` | Sortable columns (`text`/`mono`/`badge`/`dot`/`trend` cell kinds), row grouping, pagination, row actions | Breakdown/summary/event tables |
| `ranked-list` | `RankedListWidget` | Ranked rows with title/subtitle/value/trend pill/progress bar, clickable | "Top 10" drill-down lists |
| `component` | `ComponentWidget` | Arbitrary Angular component, via direct `component: Type<...>` or `name` + registry | Embedding bespoke panels (heatmap, gantt, alarm info) inside a dynamic page |

### 2.3 State store foundation — `core/state/base.store.ts`

Every feature store is composed from three primitives instead of hand-written
loading/error booleans:

- **`createQuery(fetcher, opts)`** — wraps an `Observable`-returning API call with
  `status` (`idle/loading/loaded/error`), TTL cache, in-flight de-dupe, cancellation
  of superseded requests, `refresh()`, `clear()`.
- **`createPagination(source, pageSize)`** — client-side paging over any
  `Signal<T[]>` (`page`, `pageCount`, `paged`, `next/prev/goTo`).
- **`createListFilter(source, initial, predicate)`** — reactive predicate filtering.

Existing stores built this way: `UptimeStore`, `AlarmStore`, `FilterStore`
(`core/state/*.store.ts`). A new feature store is just composition — see §4.

---

## 3. Feature component catalog

### 3.1 Auth

| Component | Selector | Route | Notes |
|---|---|---|---|
| `LoginComponent` | `fam-login` | `/login` | Reactive form, `AuthService.login()`, demo credentials in `AUTH_CONFIG` |

### 3.2 Fleet Up+Time Analysis (`features/uptime-analysis`)

| Component | Selector | Data source | Purpose |
|---|---|---|---|
| `UptimeAnalysisComponent` | `fam-uptime-analysis` | `UptimeStore.analysis()` + `.trend()` | Trend chart (1W/13W rolling + period avg), rolling/tool/SW-version breakdown table, top-10 unavailable tools chart, downtime category table. CSV export. |

Route: `/fleet-availability/up-time/analysis`. Mock endpoints:
`GET /api/uptime/analysis`, `GET /api/uptime/trend`.

### 3.3 Fleet Up+Time Availability (`features/uptime-availability`)

| Component | Selector | Data source | Purpose |
|---|---|---|---|
| `UptimeAvailabilityComponent` | `fam-uptime-availability` | `UptimeStore.availability()` | Page shell: KPI row, trend + top-unavailable widgets, tool selector, routed tabs, downtime category table |
| `StateHeatmapComponent` | `fam-state-heatmap` | `UptimeStore.availability()?.heatmap` | 24h × 14-day state heatmap (registered widget: `state-heatmap`) |
| `ActivityGanttComponent` | `fam-activity-gantt` | `UptimeStore.gantt` / `.ganttSummary` | Per-day Sys/Tool state gantt bars, day-shift mask toggle, paging (registered widget: `activity-gantt`) |
| `EventDetailsComponent` | `fam-event-details` | `UptimeStore.events()` / `.pagedEvents()` | Table of state-change events, grouped by day, paginated (registered widget: `event-details`) |
| `SegmentActivitiesComponent` | `fam-segment-activities` | `UptimeStore.segmentActivities()` / `.pagedSegmentActivities()` | Task/recipe-level activity table correlated with production windows |

Route: `/fleet-availability/up-time/availability` with child tabs `heatmap` / `gantt`
/ `events` / `activities`. Mock endpoints: `GET /api/uptime/availability`,
`GET /api/tools/state-segments`, `GET /api/tools/segment-activities`.

Heatmap, Gantt and Event Details are all **derived from the same underlying
`StateSegment` feed** (see `segment-derivation.util.ts`) so they stay consistent with
each other — not separately mocked.

### 3.4 Alarm Explorer (`features/alarm-explorer`)

| Component | Selector | Route | Purpose |
|---|---|---|---|
| `AlarmHomeComponent` | `fam-alarm-home` | `/alarm-explorer` | Alarm volume chart (trend/pareto toggle), fleet breakdown ranked list → drill into a fleet |
| `FleetDetailComponent` | `fam-fleet-detail` | `/alarm-explorer/fleet/:fleetId` | KPIs, tool-level distribution chart, top alarms, tool summary table → drill into a tool |
| `ToolAlarmsComponent` | `fam-tool-alarms` | `/alarm-explorer/fleet/:fleetId/tool/:toolId` | Searchable/filterable alarm table + `alarm-info-panel` side widget → drill into an alarm |
| `AlarmEventsComponent` | `fam-alarm-events` | `/alarm-explorer/fleet/:fleetId/tool/:toolId/alarm/:alarmId` | Chronological alarm event log, recipe filter, pagination, CSV export |
| `AlarmInfoPanelComponent` | `fam-alarm-info-panel` | *(registered widget: `alarm-info-panel`)* | Inspector panel for the alarm selected in `ToolAlarmsComponent`'s table |

Data source: `AlarmStore` throughout. Mock endpoints: `GET /api/alarms/home`,
`GET /api/alarms/fleets/:fleetId`, `GET /api/alarms/fleets/:fleetId/tools/:toolId`,
`GET /api/alarms/fleets/:fleetId/tools/:toolId/alarms/:alarmId/events`.

### 3.5 Placeholder modules — not yet built

`PlaceholderComponent` (`features/placeholder`) currently serves these routes as a
"scaffolded, coming soon" screen. Each is the next candidate for component-by-component
delivery (see §4):

| Route | Module |
|---|---|
| `/fleet-configuration` | Fleet Configuration |
| `/fleet-productivity` | Fleet Productivity |
| `/tqual` | TQual |
| `/my-reports` | My Reports |
| `/innovation-lab` | Innovation Lab |
| `/engineering-utilities` | Engineering Utilities |

### 3.6 Layout (app shell, not a delivered "feature")

`layout/shell.component.ts`, `topbar.component.ts`, `sidebar.component.ts` — the
persistent frame (nav, fleet/duration filters, breadcrumbs) that every routed
feature renders inside of. Not part of the component-by-component handoff.

---

## 4. Delivering a new component (checklist)

Repeatable process for turning one of the placeholder modules — or any new
screen — into a real, demoable component backed by mock data:

1. **Model** — add response/row interfaces to `core/models/models.ts`.
2. **Mock data** — add a `build...()` generator to `core/mock-api/mock-data.ts`.
3. **Mock route** — add the matching path branch in `mock-api.interceptor.ts`.
4. **Service** — add a typed method to `ApiService` (`core/services/api.service.ts`).
5. **Store** — add or extend a signal `Store` under `core/state/`, composing
   `createQuery` (+ `createPagination`/`createListFilter` if the screen needs paging
   or client-side filtering).
6. **Component** — build the screen, preferring `WidgetConfig`/`<fam-dynamic-page>`
   composition over bespoke templates so it matches the rest of the app.
7. **Route** — replace the placeholder route entry in `app.routes.ts` with the real
   `loadComponent`.

This keeps every delivered component demoable standalone (no backend needed) and
makes the eventual real-API integration a one-file swap (the interceptor) instead of
a component rewrite.

---

## 5. Reference: key domain models

See [core/models/models.ts](../src/app/core/models/models.ts) for the full list.
Grouped by feature area:

- **Global**: `GlobalFilters`, `ToolState`, `AlarmCategory`, `Severity`
- **Up+Time Analysis**: `WeeklyUptimePoint`, `UptimeBreakdownRow`, `UnavailableTool`, `DowntimeCategory`, `UptimeAnalysisResponse`, `UptimeTrendResponse`
- **Up+Time Availability**: `AvailabilityKpis`, `FleetTrendPoint`, `HeatmapDay`, `StateTotals`, `GanttSegment`, `GanttDay`, `ToolEvent`, `AvailabilityResponse`, `StateSegment`, `SegmentActivity`
- **Alarm Explorer**: `FleetAlarmSummary`, `AlarmVolumeWeek`, `ToolAlarmSummary`, `AlarmDefinition`, `AlarmEvent`, `AlarmHomeResponse`, `FleetAlarmDetailResponse`, `ToolAlarmDetailResponse`, `AlarmEventsResponse`
