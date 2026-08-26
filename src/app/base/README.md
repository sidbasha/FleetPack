# Base Module — Reusable Component Library

Self-contained, dependency-free (no chart.js required) set of standalone Angular components.
Everything uses **signal inputs (props)** and **typed outputs (event listeners)**, `OnPush`
change detection, and the new control-flow syntax.

Also published as the standalone npm package `@your-scope/fleetpack-base`
(built from this exact folder via ng-packagr — see the root `README.md`'s
**Publishing to a private npm registry** section). `index.ts` below is both
the barrel the rest of this app imports from and the package's public API
entry file; peer deps are `@angular/core`, `@angular/common`,
`@angular/forms`, `@angular/router`, `@angular/cdk` (all `^20.0.0`). The
package ships a compiled `styles.css` alongside the components (a full
build of `src/styles.css` — Tailwind output + the tokens/utility classes
below, e.g. `btn-primary`, `panel`, `--p-*`) — consumers add it to their
global styles; see the root README for the exact snippet.

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
| `<base-gantt-timeline>` | Per-row state segments over `[totalHours]` (24h by default, any span — e.g. 168 for a week) — the detail view a heatmap cell expands into |

Machine-state color (`BaseMachineState`, `base-timeline.components.ts`) differentiates by hue,
fill pattern (solid up-time / hatched planned-vs-unplanned downtime / dotted non-state), and a
legend glyph together — never hue alone. `non-scheduled` (a real, known state) and `gap`
(telemetry missing) render distinctly even though both are neutral.

`<base-gantt-timeline>` draws each row to a `<canvas>` instead of one DOM node per segment, so
DOM size stays constant no matter how many segments a row holds. Segments are bucketed to one
slot per device pixel; when several land in the same pixel the most severe state wins
(`unscheduled-dt` > `scheduled-dt` > `engineering` > `non-scheduled` > `standby` > `production` >
`gap`), so a brief unplanned-downtime blip is never silently averaged away by a longer
neighboring segment. This keeps 100,000+ segments (a week of dense per-tool telemetry) smooth to
render and hover — see `HighVolumeWeek` in `gantt-timeline.stories.ts` for a live 50-row ×
2,000-segment stress case. Hover still resolves to the winning segment per pixel via the same
bucket array, so tooltips stay O(1) regardless of the raw segment count.

### Table

| Selector | Purpose |
|---|---|
| `<base-table>` | Core data table — see **Quick start — table** below for the full feature list |
| `<base-table-views>` | Saved/filtered view tab rail — pinned "All" plus saved views, Modified badge, Save/Update/Reset/Duplicate/Copy link |
| `<base-paginator>` | Standalone, fully-controlled pagination control (also used internally by the table); supports an unknown-total server mode |
| `<base-search-input>` | Debounced quick-filter text input |
| `<base-manage-columns>` | "Columns" toolbar button opening a panel to show/hide and drag-reorder table columns; frozen columns lock at the top |
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

### Pagination

`[paginate]="true"` (the default) pages client-side at `[initialPageSize]` (default 10, offered
via `[pageSizeOptions]`, default `[10, 25, 50, 100]`). Changing the page size doesn't just reset to
page 1: the table re-anchors to whichever page now contains the row that was first visible before
the size changed, and prints a note under the paginator saying where it landed ("Page size changed
to 25. Kept `<row>` in view — now on page 2 of 6.") — or, if that row can no longer be found (e.g.
it dropped out from a filter in between), falls back to page 1 and says so instead of failing
silently. The note clears on the next unrelated interaction. Once the page count reaches
`[pageEntryThreshold]` (default 10), the paginator adds a direct "Go to page" field rather than
leaving Prev/Next as the only way through a large result set.

### Sticky columns

Set `sticky: 'left' | 'right'` **and a fixed `width`** on the column def.
Pinned columns are automatically ordered to the edges and offsets are computed —
header, left-frozen, and right-frozen all hold at once. Below 720px wide the
right-frozen group automatically unfreezes (left stays pinned, since it's
usually the row's own identity). Columns defined with `sticky` are treated as
**identity-locked** by Manage Columns — always visible, undraggable out of
their pinned group, shown with a lock icon.

Every other column stays user-pinnable at runtime: `[manageColumns]="true"`'s
panel groups columns into **Pinned left / Scrollable / Pinned right**, and any
non-locked column can move between groups by dragging it across, or via the
per-row pin-left/pin-right buttons (a keyboard-reachable equivalent to
dragging). A budget meter (`[pinBudgetPercent]`, default 40) shows what % of
total column width is currently pinned (identity-locked + user-pinned
combined) and tints past that threshold. The budget is also enforced on
render: a view (or manual pin) that exceeds it un-pins from the right —
outermost user-pinned column first — until back within budget, for that
render only; it never touches the saved pin assignment itself, so switching
away and back (or widening the table) brings the dropped pin(s) straight
back. Identity-locked columns are never candidates — the budget can't unpin
what the host declared load-bearing. Applying emits `(manageColumn)` (visible
keys, unchanged shape), `(pinChange)` (`Record<string, 'left'|'right'>`), and
`(layoutChange)` (`BaseColumnLayout` — order + visible keys + pinned as one
fact) for hosts that persist column state as part of a saved view; the same
layout is available on demand via `getColumnLayout()` and can be restored
with `applyColumnLayout()` (see **User-created views** below). Selected/error/edit-row
tints and the scroll-position edge shadow are preserved across pinned cells
with no seam.

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
and emits `(cellEdit)` on every change; it never commits anything itself.

### The eight-state machine

`[editableRows]="true"` alone is enough to get the whole-table save bar and the leave guard below
— `[draftId]` is optional and only adds cross-visit persistence (see **Where a draft lives**).
Every editable row moves through one of eight states:

| State | Reached when | Look/behavior |
|---|---|---|
| Read-only | default | static cell content |
| Editing, clean | host sets `row.isEditing = true` | live controls, no dirty tint |
| Editing, dirty | a field's value differs from its last-saved snapshot | amber row tint, per-field Revert (`isFieldDirty`/`revertTargetFor`) |
| Saving | `saveAll()` sent this row in a `(saveChanges)` batch | dimmed and inert (`isRowSaving`) until `reportSaveResult()` is called |
| Saved | `reportSaveResult()` reports success for this row | snapshot cleared, `row.isEditing` reset to `false` — back to read-only |
| Save failed | `reportSaveResult()` reports failure for this row | red tint (`isRowFailed`/`rowSaveError`), stays dirty and editable for retry |
| Parked as draft | user chose "Keep draft" while leaving | live edits reverted; values written to storage instead of the server |
| Restored with conflict | a parked draft's field no longer matches the server value it was taken from | held in a queue instead of applied — see the conflict dialog below |

While any row is dirty (`hasDirtyRows()`), a persistent bar reads "N rows edited, not saved" with
**Navigate away** (`confirmLeave()`), **Discard changes** (`discardAll()` — the only control that
destroys work), and **Save N changes** (`saveAll()`); sort/filter/page/Manage Columns/view
switching all block until it clears, the same gate a single mid-edit row already applies.

`saveAll()` emits one `(saveChanges)` request per dirty row (`{ key, row, changes }`, `changes`
holding only the columns that actually differ from the snapshot) and moves every dirty row into
the Saving state. Call `reportSaveResult(results)` once the batch settles: rows reported successful
become the new baseline and exit edit mode; rows reported failed keep their edits and dirty state,
get the error tint, and stay editable — a partial failure never loses or reverts anything.

### Where a draft lives

Set `[draftId]` (a stable id, unique per table on the page) to add "Keep draft" as a leave-dialog
outcome. It parks every dirty row's changes — plus the server value each field was edited *from*,
for conflict detection — into `BaseEditDraftService`, keyed by `[draftId]` in `localStorage`
(falling back to an in-memory `Map`, this tab only, if storage is blocked). Drafts expire after 7
days and are swept on app start. Reopening the table with a pending draft under that id shows a
banner — "Unsaved changes from your last visit, N rows on this table · Expires in D days" — with
**Review changes** (a per-row field-count list; applies nothing), **Discard**
(`discardParkedDraft()` — drops it unopened), and **Restore** (`restoreDraft()`).

Restoring re-applies the parked values as fresh unsaved edits, except any field whose current
server value no longer matches the value it was parked against — that field is queued as a
conflict instead, shown one at a time ("This row changed while your draft was parked", your
draft's value beside the server's current one, labeled via `[draftAuthorOf]` if provided), with
**Keep the server value** or **Restore mine as an edit**.

### Leaving with work pending

Call `confirmLeave()` from a router `CanDeactivate`/`beforeunload` handler. It resolves `true`
immediately if nothing is dirty; otherwise it opens a dialog with **Stay on page** (also what
Escape/backdrop does), **Save and leave** (runs `saveAll()`; a failed save shows "Save failed" and
re-opens the same choice instead of leaving), **Keep draft** (only offered when `[draftId]` is
set), and **Discard**. Every outcome except a failed "Save and leave" resolves the promise `true`.

### Row-level visual indicators

`[rowIndicator]` colour-codes rows by a series/category (`series: (row) => string`,
`colorOf`, required `labelOf`) in one of five forms — a table takes at most one; there's
no array, so a second family isn't a prop you can pass:

| Form | Geometry | Lives in |
|---|---|---|
| `edge-marker` | 3px inset box-shadow, full row height | The row's own leading cell — no extra column |
| `series-key` | 10px swatch, 2px radius, 8px gap | `labelColumnKey`'s cell, before its own content |
| `magnitude-rule` | 3px rule, fully rounded, 4px gap | `labelColumnKey`'s cell, under its own content |
| `inline-bar` | 4px track, 88px max width, 44px value column | `barColumnKey`'s cell, replacing its own content |
| `marker-column` | 16px mark, 12px icon (needs `iconOf`) | `labelColumnKey`'s cell, before its own content |

`magnitude-rule`/`inline-bar` share one scale per column — `max` if set, else the
largest `value` across every row — and print it as a footer legend so the bars are never
read against a maximum the user can't see. `labelOf` never replaces the column's own
cell text (a bare swatch or bar with no label isn't a configuration this supports); it
only names the series in that decoration's accessible name. Row state (selected, dirty,
error) is a `<tr>`/`<td>` background — the mark is foreground content layered on top of
it by ordinary CSS stacking, not something that competes with it for a layer.

### The three kinds of percentage

A bare `45%` doesn't say whether it's rising, falling, or what it belongs to. This module
never reuses one visual mark for two different meanings — pick the `kind` that matches what
the number actually *is*:

| Kind | Means | Rendered as |
|---|---|---|
| Task progress | Something the operator started and can cancel (e.g. "45% of a download") | `kind: 'task-progress'` — ring + value + noun, live, typically beside row actions. Whole number; only rises. |
| Measurement | A property of the tool read against a threshold (e.g. "94.1% up-time") | `kind: 'heat-cell'` — right-aligned, tabular, never animated; keeps the column's own precision and can fall as well as rise. |
| Share of a set | This row's part of a whole (e.g. "2.15% of downtime") | `kind: 'progress'` or `'text-bar'` — a bar against the column maximum. |

`task-progress` takes a `taskProgress: (row) => BaseTaskProgress | null` accessor
(`{ percent, label, status }`, `status` one of `'running' | 'success' | 'failed' | 'queued'`
— omit `percent` for `'queued'`, rendered as a muted ring and "–" rather than "0%"). `label`
is required: the ring's accessible name is built from the value *and* the noun, so it never
reads as a bare number again. Pair it with a `'row-actions'` column whose `isHidden`
predicates key off the same row's task `status` (e.g. show Cancel only while `'running'`) —
see the `TaskProgressTransfersInFlight` story. Set `taskProgressWidth` to widen the column
only while something's actually in flight on the visible page (e.g. `88px` → `152px`).

If a row action on a *different* column clears a task by mutating `row.task` in place
(rather than replacing the row via an immutable update), pass the derived value through
explicitly rather than reading it off the row inside the cell — `BaseTableComponent` already
does this (`taskProgressFor(c, row)`, recomputed every check and passed as the cell's
`[taskProgress]` input). A plain `row.task = null` mutation alone won't reach a sibling
cell whose own `row`/`column` inputs didn't change reference; the freshly-computed
`[taskProgress]` input is what makes OnPush actually re-check it.

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

`[manageColumns]="true"` puts a labeled "Columns" button (with a live X-of-Y visible count) in
the table's own toolbar — not inside a column header. Give that toolbar a label with
`[tableTitle]`/`[tableIcon]` (an `icon-outline` name); once set, a "X of Y columns" count pill
renders next to the title too. `[tableTitle]` takes over the toolbar's search slot, so it's
meant for tables that lead with a title rather than a search box.

17 built-in row-action types (`RowActionType`) auto-resolve an icon from `type`; more than
`[maxVisibleActions]` (default 2) collapse into a "⋯" overflow menu. `[readOnly]="true"`
**removes** mutating action types (add/edit/delete/reset/revert/apply/disable/enable/cancel/
upload) from the row entirely, rather than merely disabling them — view/copy/download/run/
history/more survive.

### User-created views

`<base-table-views>` is a separate, fully controlled component — it renders the tab rail and
emits intent (switch/save/update/reset/copy-link/duplicate) but never inspects a view's `state` or
re-applies it onto a table itself; the host owns the view list and derives "modified" by
diffing its own live filter/sort/column snapshot against the active view's saved one. Update/Reset
only render for a view the host can actually write back to (`!v.isDefault && !v.readOnly`); a
modified shared or read-only view instead offers Reset alongside `(duplicate)`, since Update isn't
available on a view it doesn't own — the host should respond by opening "Save view" pre-filled
with the current live state.

A view's column layout — order, visible keys, and left/right pins as one stored fact
(`BaseColumnLayout`) — is captured from `<base-table>` with `getColumnLayout()` when saving or
updating a view, and restored with `applyColumnLayout(layout)` on switch/open (pass `null` to drop
back to the column defs' own defaults). `<base-table>` also emits this same shape on every column
change via `(layoutChange)`, for hosts that persist it as they go rather than pulling it on save.
Selection, expansion, scroll position, page number and pending edits are deliberately not part of
a view's column layout — a view is a lens on the data, not a session snapshot.

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
