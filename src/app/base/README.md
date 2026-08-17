# Base Module — Reusable Component Library

Self-contained, dependency-free (no chart.js required) set of standalone Angular components.
Everything uses **signal inputs (props)** and **typed outputs (event listeners)**, `OnPush`
change detection, and the new control-flow syntax.

Live demo route: **`/dev/base`** (Component playground with every feature exercised).
Every component is also listed live at **`/dev/components`** (Component Catalog), grouped the
same way as the tables below.

**Storybook** (`npm run storybook`) is the per-component catalog: every Base component has
its own page with variants, states, and live controls, generated from the JSDoc comments
above each component class via Compodoc. Use `/dev/base` to see components wired together in
a real workflow; use Storybook to review one component in isolation. Design tokens, type
scale, spacing, icons, and the Light/Dark/High-contrast theme system are documented under
**Foundations** in Storybook — see `src/stories/foundations/Introduction.mdx`.

## Components

Grouped the same way as the Component Catalog (`/dev/components`) and Storybook's sidebar.

### Actions

| Selector | Purpose |
|---|---|
| `<base-button>` | Primary command surface — primary/secondary/tertiary/ghost/destructive variants, loading + disabled states |
| `<base-split-button>` | A default action plus a chevron menu of closely related variants |
| `<base-segmented-control>` | A closed set of 2–4 mutually exclusive view options that changes what's shown without navigating |
| `<base-button-group>` | 2–4 related actions that share one bordered silhouette but fire independently — not a single/multi toggle |

### Forms

All form controls expose a two-way `[(value)]` / `[(checked)]` model **and** implement
`ControlValueAccessor`, so they also work with `ngModel` and Reactive Forms
(`formControlName`) out of the box.

| Selector | Purpose |
|---|---|
| `<base-text-input>` | Text/number/password input: label, hint, error, warning, success, prefix/suffix, clearable, loading, read-only |
| `<base-textarea>` | Multiline input with character counter |
| `<base-select>` | Custom dropdown with optional search; `[showChevron]="false"` renders it as a plain input-styled box |
| `<base-checkbox>` | Checkbox with indeterminate support, optional description text |
| `<base-checkbox-group>` | Multi-select where every option stays visible at once — no dropdown to open, no chips to scan |
| `<base-radio-group>` | Radio button group, horizontal or vertical |
| `<base-toggle>` | On/off switch, applies immediately (no Save step) |
| `<base-combobox>` | Type-ahead text field where the typed value is real, not just a filter — narrows options as you type; supports grouped options |
| `<base-multi-select-chips>` | Multi-select field that renders selected values as removable chips inline |
| `<base-selection-cards>` | One of N, presented as cards (label + description + icon) instead of `<base-radio-group>`'s dot+label row |
| `<base-file-upload>` | Drag-and-drop upload zone with a per-file progress row; field-level error/warning tint matches `<base-text-input>` |
| `<base-slider>` | Bounded numeric range slider with a visible current-value bubble |
| `<base-range-slider>` | Dual-handle numeric range slider — a From/To band instead of a single value |
| `<base-numeric-stepper>` | Bounded integer entry via decrement/value/increment, for small counts adjusted a few at a time |
| `<base-otp-input>` | Fixed-length numeric code, one digit per box; auto-advances on entry, steps back on backspace |
| `<base-color-picker>` | Restricted to the design system's own token palette — a swatch picker, not free-form hex entry |
| `<base-time-picker>` | Dropdown list of preset time slots — pick one, don't type one |
| `<base-datepicker>` | Dependency-free popup calendar: min/max, disabled-date rule, clearable, optional `showTime` HH:MM boxes |
| `<base-date-range-picker>` | Dropdown: quick-range sidebar (All / Last 1-7-30 Days / Custom range) + dual month calendars with per-side HH:MM time boxes, Cancel/Apply |

### Data display

| Selector | Purpose |
|---|---|
| `<base-badge>` | States a fixed-vocabulary fact (e.g. "Active"); never interactive |
| `<base-tag>` | Static, non-removable classifier ("Fleet A") |
| `<base-chip>` | Removable, user-applied filter/choice chip, optionally selectable |
| `<base-avatar>` | Person identity chip — initials on a deterministic tint, sm/md/lg/xl |
| `<base-avatar-group>` | Overlapping avatar stack with a "+N" overflow badge past `[max]` |
| `<base-trend>` | ▲/▼ percentage pill; color flips via `[badWhenUp]`; a zero value renders "No change" |
| `<base-kpi-card>` | Label/value/unit/trend/sub KPI tile, optionally clickable/selected, with a partial-failure error+retry state |
| `<base-stat-bar>` | Borderless horizontal row of metrics for a page header |
| `<base-sparkline>` | Dependency-free inline SVG mini line chart (also the table's `sparkline` cell kind) |
| `<base-list-item>` | Full-row click target with hairline divider, for flat single-line collections |
| `<base-accordion>` | Collapsible content section with a chevron toggle |
| `<base-card>` | Generic content card shell — icon/title header, projected body, footer row |
| `<base-divider>` | Plain or labeled horizontal rule |
| `<base-loading>` | Indeterminate spinner or dot variant, with a compact mode |
| `<base-skeleton>` | Loading placeholder shaped like its content (rect/circle/table-row/kpi-tile/card/chart) |
| `<base-empty-state>` | no-results/no-access/no-data/out-of-range/not-configured/custom placeholder with an optional CTA |
| `<base-error-page>` | Full-panel 404/403/500/offline state with a copy-to-clipboard trace id — distinct from `<base-empty-state>`, for something that actually went wrong |

### Navigation

| Selector | Purpose |
|---|---|
| `<base-breadcrumbs>` | Drill-down trail (routerLink or click events); current segment is always plain text |
| `<base-tabs>` | Headless tab bar — underline, pills, or vertical; host switches content on `[(activeId)]` |
| `<base-stepper>` | Linear progress stepper (horizontal or vertical); step status derives from `[(activeId)]`'s position in `[steps]` |
| `<base-dropdown-menu>` | Button-triggered action menu with icons, dividers, danger items, keyboard shortcuts |
| `<base-context-menu>` | Right-click/overflow-triggered menu; opened imperatively via `openAt(x, y)` |
| `<base-notifications-panel>` | Header-anchored notifications overlay with unread state |
| `<base-global-search>` | Header-anchored command-style global search (⌘K) |

### Overlay & feedback

| Selector | Purpose |
|---|---|
| `<base-modal>` | Content-projected dialog for a focused, interrupting decision; sm/md/lg/xl/full sizes, icon header, destructive mode |
| `<base-drawer>` | Content-projected slide-over panel that keeps the current view in place; left/right/bottom `side`, configurable width |
| `<base-popover>` | Anchored panel for interactive content, with focus-trapping |
| `<base-hover-card>` | Hover-triggered rich preview of an entity, reachable from a dense table without leaving it |
| `<base-alert>` | Persistent, section-scoped info/success/warning/error/neutral banner |
| `<base-banner>` | Page-wide condition banner (maintenance window, degraded feed) — use `<base-alert>` instead for one region |
| `<base-progress-bar>` | Determinate progress bar, or `[indeterminate]="true"` for an unknown-duration operation |
| `<base-toast-host>` | Renders the transient, auto-dismissing toast stack from `BaseToastService` |
| `[baseTooltip]` | Hover/focus tooltip directive for any element; `[tooltipTitle]` switches to a richer title+body mode |

### Charts & timeline

| Selector | Purpose |
|---|---|
| `<base-trend-chart>` | Rolling-average line chart with optional target band and area fill |
| `<base-bar-chart>` | Category comparison bar chart — vertical or horizontal, per-point tone, stacked segments |
| `<base-scatter-chart>` | Correlation chart between two metrics |
| `<base-histogram>` | Distribution of one metric into touching bars/buckets |
| `<base-chart-frame>` | Chart panel chrome — title/subtitle, export button, optional table/chart view toggle |
| `<base-state-heatmap>` | Day × hour grid colored by dominant machine state, for spotting recurring patterns |
| `<base-gantt-timeline>` | 24h per-row state segments — the detail view a heatmap cell expands into |

Machine-state color (`BaseMachineState`, `base-timeline.components.ts`) differentiates by hue,
fill pattern (solid up-time / hatched planned-vs-unplanned downtime / dotted non-state), and a
legend glyph together — never hue alone. `non-scheduled` (a real, known state) and `gap`
(telemetry missing) render distinctly even though both are neutral.

### Table

| Selector | Purpose |
|---|---|
| `<base-table>` | Core data table — see **Quick start — table** below for the full feature list |
| `<base-table-views>` | Saved/filtered view tab rail — pinned "All" plus saved views, Modified badge, Save/Update/Reset/Copy link |
| `<base-paginator>` | Standalone, fully-controlled pagination control (also used internally by the table); supports an unknown-total server mode |
| `<base-search-input>` | Debounced quick-filter text input |
| `<base-manage-columns>` | Gear-icon panel to show/hide and drag-reorder table columns; frozen columns lock at the top |
| `<base-checkbox-filter>` | Per-column value-filter dropdown: search, per-option record counts, "(No value)" row, optional sort |
| `<base-calendar-filter>` | Per-column date-range filter dropdown, with one-click relative presets (Last shift/24h/7d/30d) |
| `<base-range-filter>` | Per-column numeric range filter dropdown with a mini distribution histogram |

### Services

| Class | Purpose |
|---|---|
| `BaseToastService` | Imperative toast queue (`show()`/`dismissAll()`/`pauseAll()`/`resumeAll()`) rendered by `<base-toast-host>` |
| `BaseThemeService` | Applies the user's Light/Dark/High-contrast theme choice as `<html data-theme>`, persisted per user |
| `BaseDensityService` | App-wide default table row density, set from the shell's utility-bar switcher; `<base-table>` falls back to it when `[density]` is left unset |

```html
<base-text-input label="Tool ID" [(value)]="toolId" [clearable]="true"
                 (enterPressed)="search($event)" />
<base-select label="Fab" [options]="fabOptions" [(value)]="fab" [searchable]="true" />
<base-datepicker label="Maintenance" [(value)]="date" [min]="minDate"
                 [disabledDates]="noWeekends" />
<base-date-range-picker [(value)]="dateRange" (applied)="onRangeApplied($event)" />
<base-breadcrumbs [items]="crumbs" (itemClick)="onCrumb($event)" />
<base-tabs [tabs]="tabs" [(activeId)]="active" />
<base-stepper [steps]="steps" [(activeId)]="currentStep" orientation="vertical" />
<base-modal [(open)]="show" title="Edit"> ... <div footer>...</div> </base-modal>
<base-drawer [(open)]="showInspector" side="right" width="460px" [showClose]="false">
  <fam-alarm-info-panel />
  <div footer class="w-full flex gap-2">
    <button class="btn-primary flex-1">View Event Log</button>
    <button class="btn-ghost flex-1 border border-slate-200">Export</button>
  </div>
</base-drawer>
```

Note: content passed to `[footer]` must be a **direct child** of `<base-drawer>`
in the host template — Angular content projection doesn't reach through a
nested component's own template, so footer buttons can't live inside
`<fam-alarm-info-panel>` itself if that component is what's projected as the
drawer's body.

## Quick start — table

```ts
import { BaseTableComponent, BaseCellDirective, BaseColumnDef } from '../../base';

columns: BaseColumnDef<Tool>[] = [
  { key: 'toolId', header: 'Tool', sticky: 'left', width: '120px', sortable: true, filterable: true },
  { key: 'photo',  header: 'Photo', kind: 'image' },
  { key: 'uptime', header: 'Uptime %', kind: 'number', align: 'right', sortable: true },
  { key: 'status', header: 'Status', kind: 'badge',
    badgeClassMap: { UP: 'bg-emerald-50 text-emerald-600', DOWN: 'bg-red-50 text-red-600' } },
  { key: 'history', header: '7-day', kind: 'sparkline' },
  { key: 'actions', header: '', sticky: 'right', width: '90px' } // custom template below
];
```

```html
<base-table class="panel block"
  [columns]="columns" [rows]="rows" trackKey="toolId"
  [showFilterRow]="true" [stickyHeader]="true" maxHeight="420px" minWidth="1100px"
  selectable="multiple"
  (rowClick)="open($event.row)"
  (sortChange)="onSort($event)"
  (pageChange)="onPage($event)"
  (filterChange)="onFilter($event)"
  (selectionChange)="selected = $event">

  <!-- CUSTOM CELL TEMPLATE: any content — text, images, charts, buttons -->
  <ng-template baseCell="actions" let-row>
    <button class="btn-ghost" (click)="edit(row)">Edit</button>
  </ng-template>
</base-table>
```

`kind` accepts text / number / date / datetime / sno / array / badge / dot / status-text /
trend / image / progress / text-bar / sparkline / link / row-actions / heat-cell / template.
`number` columns can set `abbreviateNumbers: true` (1.2M/84K with the exact value in a
tooltip); negative values get error-toned styling automatically. `heat-cell` renders a
full-cell tint (via `heatClassMap`) for a value read against a threshold.

### Server-side mode

Set `[serverSide]="true"` and `[totalItems]="totalFromApi"`. The table stops
filtering/sorting/paginating internally and only emits `(filterChange)`,
`(sortChange)`, `(pageChange)` — fetch data in the host and pass the new page
via `[rows]`. When the total is genuinely unknown, leave `[totalItems]` at 0 (or
below): the paginator switches to "Showing X–Y" with a Next button gated by
`[hasNextPage]` (or an auto full-page heuristic) instead of fabricating a total.

### Sticky columns

Set `sticky: 'left' | 'right'` **and a fixed `width`** on the column def.
Pinned columns are automatically ordered to the edges and offsets are computed —
header, left-frozen, and right-frozen all hold at once. Below 720px wide the
right-frozen group automatically unfreezes (left stays pinned, since it's
usually the row's own identity). Sticky columns are also treated as "frozen" by
Manage Columns — locked, undraggable, always visible.

### Column filters

`filterable: true` alone keeps the classic text filter-row input. Set
`filterKind: 'checkbox' | 'calendar' | 'range'` to swap that column's header icon for a
richer dropdown instead:

- **checkbox** — unique-value checklist with search, a per-option record count evaluated
  against every *other* active filter, a synthetic "(No value)" row for nulls, and an
  optional sort. Above 200 values it stays a plain scrolling+searchable list rather than
  adopting windowed virtualization (a deliberate scope call).
- **calendar** — Start/End via `<base-datepicker>` (optional `filterShowTime` for HH:MM
  boxes), plus one-click relative presets (Last shift/24 hours/7 days/30 days) that apply
  immediately.
- **range** — numeric From/To with a mini distribution histogram of the column's values;
  exclusive with every other filter and with sort while active (the table shows a banner
  and blocks the other controls until it's cleared).

`<base-table>` computes unique values/distributions itself — no extra wiring needed beyond
the column def.

### Loading, error and empty states

`[loading]="true"` with no rows yet renders skeleton rows sized to the current `[density]`;
with rows already present it dims them to 60% instead (a background refresh), and the
paginator stays put either way. `[error]="true"` replaces the body with a recoverable error
state (`[errorMessage]`, `(retry)`) instead of the empty state. The empty state itself
(`[emptyKind]`) auto-picks `'no-results'` (with a one-click "Clear all filters" action) when
a search/filter is active, or `'no-data'` otherwise.

### Inline edit

Opt in with `[editableRows]="true"` plus `editable: true` (+ `editType`, `editOptions`) on
each column that should become a live control. A cell only swaps to its control while that
row's `row.isEditing` is true — the host sets this, typically from a row action — and the
table reflects state (amber tint while dirty, red via `row.hasEditError` on a failed save)
and emits `(cellEdit)` on every change; it never commits anything itself. While any row is
editing, sort/filter/page/Manage Columns all block with a dirty-count banner rather than risk
losing track of an unsaved row.

### Column summary footer

`[showSummary]="true"` pins a real `<tfoot>` row over the currently **filtered** (not just
paged) row set. Per column, set `summary: 'total' | 'mean' | 'median' | 'min' | 'max' |
'count' | 'outOfSpec' | 'none'` (`outOfSpec` also needs `summaryOutOfSpec: (row) => boolean`).

### Infinite scroll

`[enableScroll]="true"` + `[maxHeight]` emits `(scrollEvent)` as the container nears its
top/bottom edge (position `'top' | 'mid' | 'bottom'`). `[scrollTriggerPosition]` picks which
edge renders the loader/end row (`'bottom'`, the default, for loading more; `'top'` for
loading older items above the current rows). `[scrollLoading]` shows a spinner row;
`[scrollEnd]="true"` once there's nothing left replaces it with an end-of-list message.

### Manage Columns & typed row actions

```ts
import { RowActionType, BaseRowAction } from '../../base';

rowActions: BaseRowAction<Tool>[] = [
  { type: 'edit', run: r => edit(r) },
  { type: 'delete', isDisabled: r => r.locked, run: r => remove(r) },
  { type: 'download', run: r => download(r) } // shows r.fileProgress% while > 0
];
```

```html
<base-table [columns]="columns" [rows]="rows" [manageColumns]="true" [maxVisibleActions]="2"
            (manageColumn)="visibleKeys = $event" (handleAction)="onAction($event)" />
```

17 built-in row-action types (`RowActionType`) auto-resolve an icon from `type`; more than
`[maxVisibleActions]` (default 2) collapse into a "⋯" overflow menu. `[readOnly]="true"`
**removes** mutating action types (add/edit/delete/reset/revert/apply/disable/enable/cancel/
upload) from the row entirely, rather than merely disabling them — view/copy/download/run/
history/more survive.

### Saved views

`<base-table-views>` is a separate, fully controlled component — it renders the tab rail and
emits intent (switch/save/update/reset/copy-link) but never inspects a view's `state` or
re-applies it onto a table itself; the host owns the view list and derives "modified" by
diffing its own live filter/sort/column snapshot against the active view's saved one. See
`base-table-views.component.ts`'s class doc for the full contract.

## Used throughout the app

The whole application renders through this module — treat the features as live examples:

- **All dynamic tables** (Uptime Analysis, Availability events/activities, Alarm Explorer)
  → `<base-table>` + `<base-paginator>` via the `fam-table-widget` adapter
  (`shared/dynamic/table-widget.component.ts`), incl. grouped rows, group actions, highlight.
- **KPI grids / ranked lists** → `<base-kpi-card>`, `<base-trend>`, `<base-progress-bar>`.
- **Top bar & page filter bars** (Alarm Explorer, Uptime Availability's Tool-Level
  Analysis Filter) → `<base-breadcrumbs>` route trail + `<base-select>` filters,
  several with `[showChevron]="false"` for a plain-input look. The topbar's user menu also
  hosts the density and theme switchers (`BaseDensityService` / `BaseThemeService`).
- **Login** → `<base-text-input formControlName>` (ControlValueAccessor), `<base-button>`, `<base-alert>`.
- **Alarm Explorer pages** → `<base-breadcrumbs>` trails; the Tool page uses
  `<base-search-input>`, `<base-select>`, `<base-button>`, and opens its alarm
  inspector in a `<base-drawer>` instead of an inline side panel.
- `fam-kpi` / `fam-loading` / `fam-trend` are **deprecated wrappers** delegating to base —
  new code should import from `src/app/base` directly.
- The `fam-table-widget` adapter currently exposes only a subset of `<base-table>` (grouped
  rows, group actions, highlight). Column filters, Manage Columns, typed row actions,
  additional header rows, saved views, the summary footer, inline edit, and infinite scroll
  aren't wired through it yet — use `<base-table>` directly for those until the adapter is
  extended.

Full prop/event reference: see `docs/Base-Module-Component-Guide.docx`.
