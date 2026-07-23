# Base Module — Reusable Component Library

Self-contained, dependency-free (no chart.js required) set of standalone Angular components.
Everything uses **signal inputs (props)** and **typed outputs (event listeners)**, `OnPush`
change detection, and the new control-flow syntax.

Live demo route: **`/dev/base`** (Component playground with every feature exercised).

## Components

| Selector | Purpose |
|---|---|
| `<base-table>` | Core data table: dynamic columns, pagination, custom cell templates, filters, sticky header + sticky columns, sorting, selection |
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
| `<base-select>` | Custom dropdown with optional search |
| `<base-checkbox>` / `<base-radio-group>` / `<base-toggle>` | Choice controls |
| `<base-datepicker>` | Popup calendar: min/max, disabled-date rule, clearable |
| `<base-breadcrumbs>` | Navigation trail (routerLink or click events) |
| `<base-tabs>` | Headless tab bar (underline or pills) |
| `<base-dropdown-menu>` | Actions menu with icons, dividers, danger items |
| `<base-modal>` | Content-projected dialog with footer slot |
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
<base-breadcrumbs [items]="crumbs" (itemClick)="onCrumb($event)" />
<base-tabs [tabs]="tabs" [(activeId)]="active" />
<base-modal [(open)]="show" title="Edit"> ... <div footer>...</div> </base-modal>
```

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

## Used throughout the app

The whole application renders through this module — treat the features as live examples:

- **All dynamic tables** (Uptime Analysis, Availability events/activities, Alarm Explorer)
  → `<base-table>` + `<base-paginator>` via the `fam-table-widget` adapter
  (`shared/dynamic/table-widget.component.ts`), incl. grouped rows, group actions, highlight.
- **KPI grids / ranked lists** → `<base-kpi-card>`, `<base-trend>`, `<base-progress-bar>`.
- **Top bar** → `<base-breadcrumbs>` route trail + `<base-select>` Fleet/Duration filters.
- **Login** → `<base-text-input formControlName>` (ControlValueAccessor), `<base-button>`, `<base-alert>`.
- **Alarm Explorer pages** → `<base-breadcrumbs>` trails; Tool page uses
  `<base-search-input>`, `<base-select>`, `<base-button>`.
- `fam-kpi` / `fam-loading` / `fam-trend` are **deprecated wrappers** delegating to base —
  new code should import from `src/app/base` directly.

Full prop/event reference: see `Base-Module-Component-Guide.docx` in the handover pack.
