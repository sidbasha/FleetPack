# Base Module — Reusable Component Library

Self-contained, dependency-free (no chart.js required) set of standalone Angular components.
Everything uses **signal inputs (props)** and **typed outputs (event listeners)**, `OnPush`
change detection, and the new control-flow syntax.

Live demo route: **`/dev/base`** (Component playground with every feature exercised).

**Storybook** (`npm run storybook`) is the per-component catalog: every Base component has
its own page with variants, states, and live controls, generated from the JSDoc comments
below via Compodoc. Use `/dev/base` to see components wired together in a real workflow;
use Storybook to review one component in isolation. See `src/stories/foundations/Introduction.mdx`.

## Components

| Selector | Purpose |
|---|---|
| `<base-table>` | Core data table: dynamic columns (text/number/date/datetime/sno/array/badge/dot/status-text/trend/image/progress/text-bar/sparkline/link/row-actions/template cell kinds), pagination or infinite scroll, custom cell/header/action templates, text + checkbox + calendar + numeric-range column filters with a global Clear All, sticky header + sticky columns, tri-state sorting, single/multiple selection (with per-row/disable-all guards), grouped rows (accent/plain/light header styles), merged/additional header rows, expandable nested child tables (with a footer slot), Manage Columns (show/hide + drag reorder), a 16-type row-action registry, and highlighted-row auto-scroll |
| `<base-checkbox-filter>` / `<base-calendar-filter>` / `<base-range-filter>` | Per-column filter dropdowns mounted by `<base-table>` (value checklist+search+sort, Start/End date, numeric From/To) |
| `<base-manage-columns>` | Gear-icon column visibility + drag-reorder panel mounted by `<base-table>` |
| `<base-paginator>` | Standalone pagination control (also used inside the table) |
| `<base-search-input>` | Debounced search box |
| `<base-kpi-card>` | KPI metric card with optional trend + click event |
| `<base-badge>` | Status pill |
| `<base-trend>` | ▲/▼ percentage pill |
| `<base-sparkline>` | Inline SVG mini chart (also the table's `sparkline` cell kind) |
| `<base-loading>` | Spinner row |
| `<base-empty-state>` | Empty placeholder with optional action button |
| `<base-button>` | Button with variants, sizes, loading state |
| `<base-text-input>` | Text/number/password input: label, hint, error, prefix/suffix, clearable |
| `<base-textarea>` | Multiline input with character counter |
| `<base-select>` | Custom dropdown with optional search; `[showChevron]="false"` renders it as a plain input-styled box |
| `<base-checkbox>` / `<base-radio-group>` / `<base-toggle>` | Choice controls |
| `<base-datepicker>` | Popup calendar: min/max, disabled-date rule, clearable, optional `showTime` HH:MM boxes |
| `<base-date-range-picker>` | Dropdown: quick-range sidebar (All / Last 1-7-30 Days / Custom range) + dual month calendars with per-side HH:MM time boxes, Cancel/Apply |
| `<base-breadcrumbs>` | Navigation trail (routerLink or click events) |
| `<base-tabs>` | Headless tab bar (underline or pills) |
| `<base-dropdown-menu>` | Actions menu with icons, dividers, danger items |
| `<base-modal>` | Content-projected dialog with footer slot |
| `<base-drawer>` | Content-projected slide-over panel: left/right `side`, configurable `width`, backdrop dim, ESC/backdrop-to-close, footer slot |
| `[baseTooltip]` | Tooltip directive for any element |
| `<base-alert>` | Info/success/warning/error banner |
| `<base-progress-bar>` | Progress with label |
| `<base-skeleton>` | Loading placeholder |

All form controls expose a two-way `[(value)]` / `[(checked)]` model **and** implement
`ControlValueAccessor`, so they also work with `ngModel` and Reactive Forms
(`formControlName`) out of the box.

```html
<base-text-input label="Tool ID" [(value)]="toolId" [clearable]="true"
                 (enterPressed)="search($event)" />
<base-select label="Fab" [options]="fabOptions" [(value)]="fab" [searchable]="true" />
<base-datepicker label="Maintenance" [(value)]="date" [min]="minDate"
                 [disabledDates]="noWeekends" />
<base-date-range-picker [(value)]="dateRange" (applied)="onRangeApplied($event)" />
<base-breadcrumbs [items]="crumbs" (itemClick)="onCrumb($event)" />
<base-tabs [tabs]="tabs" [(activeId)]="active" />
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

### Server-side mode

Set `[serverSide]="true"` and `[totalItems]="totalFromApi"`. The table stops
filtering/sorting/paginating internally and only emits `(filterChange)`,
`(sortChange)`, `(pageChange)` — fetch data in the host and pass the new page
via `[rows]`.

### Sticky columns

Set `sticky: 'left' | 'right'` **and a fixed `width`** on the column def.
Pinned columns are automatically ordered to the edges and offsets are computed.
Sticky columns are also treated as "frozen" by Manage Columns — locked, undraggable.

### Column filters

`filterable: true` alone keeps the classic text filter-row input. Set
`filterKind: 'checkbox' | 'calendar' | 'range'` to swap that column's header icon for a
richer dropdown instead (unique-value checklist, Start/End date via `<base-datepicker>`
with optional `filterShowTime`, or a numeric From/To range that's exclusive with all
other filters/sorts). `<base-table>` computes unique values and applies the filter
itself — no extra wiring needed beyond the column def.

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
<base-table [columns]="columns" [rows]="rows" [manageColumns]="true"
            (manageColumn)="visibleKeys = $event" (handleAction)="onAction($event)" />
```

## Used throughout the app

The whole application renders through this module — treat the features as live examples:

- **All dynamic tables** (Uptime Analysis, Availability events/activities, Alarm Explorer)
  → `<base-table>` + `<base-paginator>` via the `fam-table-widget` adapter
  (`shared/dynamic/table-widget.component.ts`), incl. grouped rows, group actions, highlight.
- **KPI grids / ranked lists** → `<base-kpi-card>`, `<base-trend>`, `<base-progress-bar>`.
- **Top bar & page filter bars** (Alarm Explorer, Uptime Availability's Tool-Level
  Analysis Filter) → `<base-breadcrumbs>` route trail + `<base-select>` filters,
  several with `[showChevron]="false"` for a plain-input look.
- **Login** → `<base-text-input formControlName>` (ControlValueAccessor), `<base-button>`, `<base-alert>`.
- **Alarm Explorer pages** → `<base-breadcrumbs>` trails; the Tool page uses
  `<base-search-input>`, `<base-select>`, `<base-button>`, and opens its alarm
  inspector in a `<base-drawer>` instead of an inline side panel.
- `fam-kpi` / `fam-loading` / `fam-trend` are **deprecated wrappers** delegating to base —
  new code should import from `src/app/base` directly.
- The `fam-table-widget` adapter currently exposes only a subset of `<base-table>` (grouped
  rows, group actions, highlight). Column filters, Manage Columns, typed row actions,
  additional header rows, and infinite scroll aren't wired through it yet — use
  `<base-table>` directly for those until the adapter is extended.

Full prop/event reference: see `Base-Module-Component-Guide.docx` in the handover pack.
