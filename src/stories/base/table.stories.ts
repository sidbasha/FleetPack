import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  AdditionalHeaderGroup,
  BaseChildCellDirective,
  BaseChildFooterDirective,
  BaseColumnDef,
  BaseRowAction,
  BaseTableComponent,
  BaseTableView,
  BaseTableViewsComponent
} from '../../app/base';

interface ToolRow {
  toolId: string;
  chamber: string;
  fab: string;
  status: 'PRODUCTION' | 'ENGINEERING' | 'STANDBY' | 'DOWN';
  uptime: number;
  alarms: number;
  trendPct: number | null;
  history: number[];
  lastMaint: string;
  photo: string;
  fileProgress?: number;
}

const STATUSES: ToolRow['status'][] = ['PRODUCTION', 'ENGINEERING', 'STANDBY', 'DOWN'];
const FABS = ['Fab-A', 'Fab-B', 'Fab-C'];

/** Deterministic mock data - same shape as `/dev/base`'s playground, but seeded so it doesn't drift between renders. */
function mockRows(n: number): ToolRow[] {
  return Array.from({ length: n }, (_, i) => {
    const uptime = 78 + ((i * 7) % 22);
    return {
      toolId: `KLA-${1000 + i}`,
      chamber: `CH-${(i % 4) + 1}`,
      fab: FABS[i % FABS.length],
      status: STATUSES[i % STATUSES.length],
      uptime,
      alarms: (i * 3) % 40,
      trendPct: i % 7 === 0 ? null : +(((i % 9) - 4) * 0.9).toFixed(1),
      history: Array.from({ length: 8 }, (_, j) => 70 + ((i + j * 5) % 30)),
      lastMaint: new Date(Date.UTC(2026, 5, 1) - i * 86_400_000 * 3).toISOString(),
      photo: `https://picsum.photos/seed/tool${i}/64/64`,
      fileProgress: i % 5 === 0 ? (i * 17) % 100 : 0
    };
  });
}

const ROWS = mockRows(37);

const STATUS_BADGE_MAP: Record<string, string> = {
  PRODUCTION: 'bg-emerald-50 text-emerald-600',
  ENGINEERING: 'bg-sky-50 text-sky-600',
  STANDBY: 'bg-violet-50 text-violet-600',
  DOWN: 'bg-red-50 text-red-600'
};

const STATUS_TEXT_MAP: Record<string, string> = {
  PRODUCTION: 'text-emerald-600 font-semibold',
  ENGINEERING: 'text-sky-600 font-semibold',
  STANDBY: 'text-violet-600 font-semibold',
  DOWN: 'text-red-600 font-semibold underline'
};

const BASIC_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true, filterable: true },
  { key: 'fab', header: 'Fab', filterable: true },
  { key: 'status', header: 'Status', kind: 'badge', badgeClassMap: STATUS_BADGE_MAP },
  { key: 'uptime', header: 'Uptime %', kind: 'number', align: 'right', sortable: true }
];

/** Every built-in `BaseCellKind` in one table - the reference for "what can a column render". */
const ALL_KIND_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'sno', header: '#', kind: 'sno', width: '48px' },
  { key: 'toolId', header: 'Tool', width: '110px', sortable: true },
  { key: 'photo', header: 'Photo', kind: 'image', width: '64px' },
  { key: 'status', header: 'Status', kind: 'badge', badgeClassMap: STATUS_BADGE_MAP, width: '120px' },
  { key: 'status2', header: 'State', kind: 'status-text', value: (r) => r.status, textColorClassMap: STATUS_TEXT_MAP, width: '110px' },
  {
    key: 'chamber', header: 'Chamber', kind: 'dot', width: '110px',
    dotClassMap: { 'CH-1': 'bg-emerald-500', 'CH-2': 'bg-sky-500', 'CH-3': 'bg-violet-500', 'CH-4': 'bg-red-500' }
  },
  { key: 'uptime', header: 'Uptime %', kind: 'number', align: 'right', width: '100px', numberFormat: { maximumFractionDigits: 0 } },
  { key: 'trendPct', header: 'W/W', kind: 'trend', width: '90px' },
  { key: 'uptime2', header: 'Utilization', kind: 'progress', value: (r) => r.uptime, width: '140px' },
  { key: 'alarms', header: 'Alarms (30d)', kind: 'text-bar', value: (r) => r.alarms, progressMax: 40, width: '140px' },
  { key: 'history', header: '7-day', kind: 'sparkline', width: '110px' },
  { key: 'lastMaint', header: 'Last Maintenance', kind: 'date', dateFormat: { dateStyle: 'medium' }, width: '150px' },
  { key: 'lastMaint2', header: 'Last Maint. (w/ time)', kind: 'datetime', value: (r) => r.lastMaint, width: '170px' },
  { key: 'fabs', header: 'Fabs seen', kind: 'array', value: () => FABS, width: '160px' },
  {
    key: 'link', header: '', kind: 'link', width: '80px',
    value: () => 'Open in Grafana', linkHref: () => 'https://example.invalid'
  },
  {
    key: 'actions', header: '', kind: 'row-actions', align: 'right', width: '90px', sticky: 'right',
    rowActions: [
      { icon: '✎', title: 'Edit', variant: 'icon', run: () => {} },
      { icon: '🗑', title: 'Delete', variant: 'icon', run: () => {} }
    ]
  }
];

/** Columns for the nested child table shown under a row when expanded. */
const ALARM_EVENT_COLUMNS: BaseColumnDef<any>[] = [
  { key: 'event', header: 'Alarm Event' },
  { key: 'time', header: 'Time', kind: 'date', dateFormat: { dateStyle: 'short', timeStyle: 'short' } },
  {
    key: 'severity', header: 'Severity', kind: 'badge',
    badgeClassMap: { High: 'bg-red-50 text-red-600', Medium: 'bg-amber-50 text-amber-600', Low: 'bg-slate-100 text-slate-500' }
  },
  {
    key: 'actions', header: '', align: 'right', width: '90px', kind: 'row-actions',
    rowActions: [
      { icon: '✎', title: 'Edit', variant: 'icon', run: () => {} },
      { icon: '🗑', title: 'Delete', variant: 'icon', run: () => {} }
    ]
  }
];

/** Deterministic mock child rows - only tools with `alarms > 0` get an expand toggle. */
function alarmEventsOf(row: ToolRow): Record<string, unknown>[] {
  if (row.alarms === 0) return [];
  const severities = ['High', 'Medium', 'Low'];
  const count = Math.min(row.alarms % 5 || 1, 5);
  return Array.from({ length: count }, (_, i) => ({
    id: `${row.toolId}-EV${i}`,
    event: `Alarm #${i + 1}`,
    time: new Date(Date.UTC(2026, 5, 1) - i * 3_600_000).toISOString(),
    severity: severities[i % severities.length]
  }));
}

const STICKY_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', width: '120px', sticky: 'left' },
  { key: 'chamber', header: 'Chamber', width: '100px' },
  { key: 'fab', header: 'Fab', width: '100px' },
  { key: 'status', header: 'Status', kind: 'badge', badgeClassMap: STATUS_BADGE_MAP, width: '120px' },
  { key: 'uptime', header: 'Uptime %', kind: 'number', align: 'right', width: '110px' },
  { key: 'alarms', header: 'Alarms', kind: 'number', align: 'right', width: '90px' },
  { key: 'lastMaint', header: 'Last Maintenance', kind: 'date', width: '160px' },
  {
    key: 'actions', header: '', width: '90px', sticky: 'right', kind: 'row-actions',
    rowActions: [{ icon: '✎', title: 'Edit', variant: 'icon', run: () => {} }]
  }
];

/** `filterKind: 'checkbox'` swaps the header's filter icon for a search + checklist + sort dropdown. */
const CHECKBOX_FILTER_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true },
  { key: 'fab', header: 'Fab', filterable: true, filterKind: 'checkbox', sortable: true },
  { key: 'status', header: 'Status', kind: 'badge', badgeClassMap: STATUS_BADGE_MAP, filterable: true, filterKind: 'checkbox', sortable: true },
  { key: 'uptime', header: 'Uptime %', kind: 'number', align: 'right', sortable: true }
];

/** `filterKind: 'calendar'` adds a Start/End date-range dropdown (reuses `<base-datepicker>`). */
const CALENDAR_FILTER_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true },
  { key: 'fab', header: 'Fab' },
  { key: 'lastMaint', header: 'Last Maintenance', kind: 'date', filterable: true, filterKind: 'calendar' }
];

/** `filterKind: 'range'` adds a numeric From/To dropdown; applying it clears all other filters/sorts. */
const RANGE_FILTER_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true },
  { key: 'fab', header: 'Fab', filterable: true },
  { key: 'uptime', header: 'Uptime %', kind: 'number', align: 'right', sortable: true, filterable: true, filterKind: 'range' }
];

/** Typed `BaseRowAction[]` - icon auto-resolves from `type`; `download` shows a live % while `row.fileProgress > 0`. */
const TYPED_ACTION_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true },
  { key: 'fab', header: 'Fab' },
  { key: 'status', header: 'Status', kind: 'badge', badgeClassMap: STATUS_BADGE_MAP },
  {
    key: 'actions', header: '', align: 'right', width: '160px', kind: 'row-actions',
    rowActions: [
      { type: 'view', title: 'View', run: () => {} },
      { type: 'edit', title: 'Edit', isDisabled: (r) => r.status === 'DOWN', run: () => {} },
      { type: 'download', title: 'Download', run: () => {} },
      { type: 'delete', title: 'Delete', isHidden: (r) => r.status === 'PRODUCTION', run: () => {} }
    ] satisfies BaseRowAction<ToolRow>[]
  }
];

const ADDITIONAL_HEADER_GROUPS: AdditionalHeaderGroup[] = [
  { displayName: 'Identity', columnIds: ['toolId', 'fab'] },
  { displayName: 'Performance', columnIds: ['uptime', 'alarms'] },
  { displayName: 'Maintenance', columnIds: ['lastMaint'] }
];

/** kind 'number' + `abbreviateNumbers` (1.2K/84K, full value in a tooltip); negative values get
 *  automatic error-toned styling regardless — no per-column opt-in needed for that part. */
const METRIC_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true },
  { key: 'fab', header: 'Fab' },
  {
    key: 'downtimeCost', header: 'Downtime Cost ($)', kind: 'number', align: 'right', sortable: true,
    value: (r) => Math.round((r.alarms - 14) * 1240), abbreviateNumbers: true
  }
];

const HEALTH_HEAT_MAP: Record<string, string> = {
  PRODUCTION: 'bg-success-surface text-success-hover',
  ENGINEERING: 'bg-action-surface text-action-hover',
  STANDBY: 'bg-warning-surface text-warning-hover',
  DOWN: 'bg-error-surface text-error-hover'
};

/** kind 'heat-cell' — a full-cell colored block for a value read against a threshold. Never
 *  color alone: the value text is always shown alongside the tint. */
const HEAT_CELL_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true },
  { key: 'fab', header: 'Fab' },
  { key: 'status', header: 'Health', kind: 'heat-cell', heatClassMap: HEALTH_HEAT_MAP, width: '140px' },
  { key: 'uptime', header: 'Uptime %', kind: 'number', align: 'right' }
];

/** Five typed actions on one row — with `[maxVisibleActions]="2"` only the first two show inline,
 *  the rest collapse into a "⋯" overflow menu. */
const MANY_ACTION_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true },
  { key: 'fab', header: 'Fab' },
  { key: 'status', header: 'Status', kind: 'badge', badgeClassMap: STATUS_BADGE_MAP },
  {
    key: 'actions', header: '', align: 'right', width: '160px', kind: 'row-actions',
    rowActions: [
      { type: 'view', title: 'View', run: () => {} },
      { type: 'edit', title: 'Edit', run: () => {} },
      { type: 'download', title: 'Download', run: () => {} },
      { type: 'history', title: 'History', run: () => {} },
      { type: 'delete', title: 'Delete', run: () => {} }
    ] satisfies BaseRowAction<ToolRow>[]
  }
];

/** [showSummary] pins a real `<tfoot>` aggregate row over the FILTERED set (not just the page). */
const SUMMARY_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true },
  { key: 'fab', header: 'Fab' },
  { key: 'status', header: 'Status', kind: 'badge', badgeClassMap: STATUS_BADGE_MAP, summary: 'count' },
  { key: 'uptime', header: 'Uptime %', kind: 'number', align: 'right', summary: 'mean' },
  { key: 'alarms', header: 'Alarms', kind: 'number', align: 'right', summary: 'total' }
];

/** [editableRows] + `editable`/`editType` per column: while `row.isEditing` is true, those cells
 *  render live controls; the table only reflects/gates state — the host owns save/cancel. */
const EDITABLE_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool' },
  { key: 'fab', header: 'Fab', editable: true, editType: 'select', editOptions: FABS.map((f) => ({ label: f, value: f })) },
  { key: 'uptime', header: 'Uptime %', kind: 'number', align: 'right', editable: true, editType: 'number' },
  {
    key: 'actions', header: '', align: 'right', width: '90px', kind: 'row-actions',
    rowActions: [
      { type: 'edit', title: 'Edit row', isHidden: (r: any) => !!r.isEditing, run: (r: any) => { r.isEditing = true; } },
      { type: 'apply', title: 'Save', isHidden: (r: any) => !r.isEditing, run: (r: any) => { r.isEditing = false; } },
      { type: 'cancel', title: 'Cancel', isHidden: (r: any) => !r.isEditing, run: (r: any) => { r.isEditing = false; } }
    ]
  }
];

/** Own copy, not `ROWS` — the Edit action mutates `row.isEditing` in place, and `ROWS` is shared
 *  across every story in this file. */
const EDITABLE_ROWS: ToolRow[] = ROWS.slice(0, 6).map((r) => ({ ...r }));

const meta: Meta<BaseTableComponent<ToolRow>> = {
  title: 'Base/Tables & Data/Table',
  component: BaseTableComponent,
  tags: ['autodocs'],
  argTypes: {
    selectable: { control: 'select', options: ['none', 'single', 'multiple'] },
    groupHeaderStyle: { control: 'select', options: ['accent', 'plain', 'light'] },
    emptyKind: { control: 'select', options: [null, 'no-results', 'no-access', 'no-data', 'out-of-range', 'not-configured', 'custom'] },
    scrollTriggerPosition: { control: 'select', options: ['top', 'bottom'] },
    groupBy: { control: false },
    childColumns: { control: false },
    childRowsOf: { control: false },
    additionalHeader: { control: false }
  },
  args: {
    columns: BASIC_COLUMNS,
    rows: ROWS,
    trackKey: 'toolId',
    showSearch: true,
    showFilterRow: false,
    stickyHeader: false,
    selectable: 'none',
    isDisableSelectAll: false,
    striped: false,
    readOnly: false,
    paginate: true,
    initialPageSize: 10,
    manageColumns: false,
    enableScroll: false,
    scrollLoading: false,
    scrollTriggerPosition: 'bottom',
    scrollEnd: false,
    highlightKey: null,
    loading: false,
    loadingRowCount: 5,
    error: false,
    errorMessage: '',
    emptyKind: null,
    showSummary: false,
    editableRows: false,
    maxVisibleActions: 2,
    serverSide: false,
    totalItems: 0
  },
  render: (args) => ({
    props: args,
    template: `<base-table class="panel block overflow-hidden"
      [columns]="columns" [rows]="rows" [trackKey]="trackKey"
      [showSearch]="showSearch" [showFilterRow]="showFilterRow" [stickyHeader]="stickyHeader"
      [selectable]="selectable" [isDisableSelectAll]="isDisableSelectAll"
      [striped]="striped" [readOnly]="readOnly" [paginate]="paginate" [initialPageSize]="initialPageSize"
      [groupBy]="groupBy" [groupHeaderStyle]="groupHeaderStyle" [groupActionLabel]="groupActionLabel"
      [maxHeight]="maxHeight" [minWidth]="minWidth" [additionalHeader]="additionalHeader"
      [manageColumns]="manageColumns" [enableScroll]="enableScroll" [scrollLoading]="scrollLoading"
      [scrollTriggerPosition]="scrollTriggerPosition" [scrollEnd]="scrollEnd"
      [highlightKey]="highlightKey"
      [loading]="loading" [loadingRowCount]="loadingRowCount" [error]="error" [errorMessage]="errorMessage"
      [emptyKind]="emptyKind" [showSummary]="showSummary" [editableRows]="editableRows"
      [maxVisibleActions]="maxVisibleActions" [serverSide]="serverSide" [totalItems]="totalItems"
      [expandable]="expandable" [childColumns]="childColumns" [childRowsOf]="childRowsOf"
      [childPaginate]="childPaginate" [childShowSearch]="childShowSearch" />`
  })
};
export default meta;
type Story = StoryObj<BaseTableComponent<ToolRow>>;

export const Default: Story = {};

/** One column per `BaseCellKind` - the reference for choosing a `kind` when defining a column. */
export const AllCellKinds: Story = {
  args: { columns: ALL_KIND_COLUMNS, minWidth: '1550px', showSearch: false }
};

/** `sticky: 'left' | 'right'` + a fixed `width` pins a column while the rest scrolls horizontally —
 *  `toolId` (left) and the actions column (right) are pinned together here, on top of `stickyHeader`,
 *  so all three axes (header, left column, right column) hold at once. Resize the canvas/browser
 *  under ~720px and the right-frozen group unfreezes automatically (left stays pinned). */
export const StickyColumns: Story = {
  args: { columns: STICKY_COLUMNS, minWidth: '900px', maxHeight: '360px', stickyHeader: true, showSearch: false }
};

export const MultiSelect: Story = {
  name: 'Row selection (multiple)',
  args: { selectable: 'multiple' }
};

/** `isDisableSelectAll` greys out the header checkbox; rows keep their own. */
export const SelectAllDisabled: Story = {
  args: { selectable: 'multiple', isDisableSelectAll: true }
};

export const ColumnFilterRow: Story = {
  args: { showFilterRow: true, columns: BASIC_COLUMNS.map((c) => ({ ...c, filterable: true })) }
};

/** `filterKind: 'checkbox'` - click a filter icon in the header for search + checklist + Sort Asc/Desc + Apply. */
export const CheckboxFilter: Story = {
  args: { columns: CHECKBOX_FILTER_COLUMNS, showSearch: false }
};

/** `filterKind: 'calendar'` - Start Date / End Date via `<base-datepicker>`, no external date library. */
export const CalendarFilter: Story = {
  args: { columns: CALENDAR_FILTER_COLUMNS, showSearch: false }
};

/** `filterKind: 'range'` - numeric From/To; Apply clears every other active filter/sort (exclusive). */
export const RangeFilter: Story = {
  args: { columns: RANGE_FILTER_COLUMNS, showSearch: false }
};

/** `[manageColumns]="true"` mounts a gear-icon panel on the first header: search, Select All, drag reorder (frozen/sticky columns locked). */
export const ManageColumns: Story = {
  args: { columns: STICKY_COLUMNS, manageColumns: true, minWidth: '900px', showSearch: false }
};

/** `[additionalHeader]` renders a merged/grouped label row above the normal header; `columnIds`
 *  auto-recomputes the colspan. Each group gets its own hue, rotating through the semantic
 *  surface-tone palette (never repeating one color across groups), and carries `scope="colgroup"`. */
export const AdditionalHeaderRow: Story = {
  args: { additionalHeader: ADDITIONAL_HEADER_GROUPS, showSearch: false }
};

/** Typed `BaseRowAction[]` - icon auto-resolves from `type`, plus `isDisabled`/`isHidden` per row and a `(handleAction)` output. */
export const TypedRowActions: Story = {
  args: { columns: TYPED_ACTION_COLUMNS, showSearch: false }
};

export const Striped: Story = { args: { striped: true } };

/** `[readOnly]="true"` disables sort-click, all filter dropdowns, and the manage-columns gear - inert "library mode". */
export const ReadOnlyLibraryMode: Story = {
  args: { columns: CHECKBOX_FILTER_COLUMNS, manageColumns: true, readOnly: true, showSearch: false }
};

/**
 * `[highlightKey]` marks and auto-scrolls to a matching row (`scrollIntoView`) - here a row
 * far down the list, inside a `[maxHeight]` scroll container so the scroll is visible.
 */
export const HighlightAutoScroll: Story = {
  args: { highlightKey: ROWS[28].toolId, maxHeight: '360px', paginate: false, showSearch: false }
};

/** `[enableScroll]` + `[maxHeight]` emits `(scrollEvent)` near the top/bottom; `[scrollLoading]` shows a spinner row. */
export const InfiniteScroll: Story = {
  args: { enableScroll: true, scrollLoading: true, maxHeight: '360px', paginate: false, showSearch: false }
};

/** `groupBy` returns a group key per row (or `null` to leave it ungrouped); `groupHeaderStyle` controls the header look. */
export const GroupedByStatus: Story = {
  args: {
    groupBy: (r: ToolRow) => r.status,
    groupHeaderStyle: 'accent',
    groupActionLabel: 'Acknowledge all',
    showSearch: false,
    paginate: false
  }
};
export const GroupedPlainHeader: Story = {
  args: { groupBy: (r: ToolRow) => r.status, groupHeaderStyle: 'plain', showSearch: false, paginate: false }
};
export const GroupedLightHeader: Story = {
  args: {
    groupBy: (r: ToolRow) => r.status,
    groupHeaderStyle: 'light',
    groupActionLabel: 'Review',
    showSearch: false,
    paginate: false
  }
};

/**
 * `[expandable]` adds a toggle button as the first column that opens/closes a nested
 * `<base-table>` under the row, driven by `[childColumns]` + `[childRowsOf]`. Rows whose
 * `childRowsOf` returns an empty array (here, tools with no alarms) get no toggle at all.
 */
export const NestedRows: Story = {
  name: 'Expand/collapse nested table',
  args: {
    expandable: true,
    childColumns: ALARM_EVENT_COLUMNS,
    childRowsOf: alarmEventsOf,
    showSearch: false
  }
};

/**
 * `childColumns` accepts a `baseChildCell` template the same way the outer table accepts
 * `baseCell` - declare it inside the outer `<base-table>` and it's forwarded into every
 * nested table. Here it renders a composite cell (dot + text) for the `event` column,
 * alongside the built-in `row-actions` edit/delete column, plus a `baseChildFooter` action row.
 */
export const NestedRowsWithCustomCell: Story = {
  name: 'Nested table · custom cell + edit/delete + footer',
  decorators: [moduleMetadata({ imports: [BaseChildCellDirective, BaseChildFooterDirective] })],
  args: {
    expandable: true,
    childColumns: ALARM_EVENT_COLUMNS,
    childRowsOf: alarmEventsOf,
    showSearch: false
  },
  render: (args) => ({
    props: args,
    template: `<base-table class="panel block overflow-hidden"
      [columns]="columns" [rows]="rows" [trackKey]="trackKey"
      [showSearch]="showSearch" [expandable]="expandable"
      [childColumns]="childColumns" [childRowsOf]="childRowsOf">
      <ng-template baseChildCell="event" let-row let-value="value">
        <span class="inline-flex items-center gap-1.5 font-medium text-slate-700">
          @if (row.severity === 'High') { <i class="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></i> }
          {{ value }}
        </span>
      </ng-template>
      <ng-template baseChildFooter let-row>
        <button class="btn-ghost border border-slate-200 text-[11px]">Add Service Activity for {{ row.toolId }}</button>
      </ng-template>
    </base-table>`
  })
};

/**
 * "New in v2.0" — `<base-table-views>` paired with a real `<base-table>`. Sort a column, filter,
 * or search below and watch the active tab pick up a "Modified" badge; Update/Reset/Save-as-new
 * light up on the rail. The rail is fully controlled (see its own class doc) — this demo's host
 * component owns the view list and derives "modified" off the table's own (sortChange)/
 * (filterChange)/(manageColumn) events, since those are the only pieces of filter/sort state the
 * table currently exposes outward; it does not re-apply a selected view's filters onto the table
 * (that needs the table's internal filter/sort signals to become host-controlled inputs, which is
 * a bigger API change than this component pair takes on today).
 */
@Component({
  selector: 'story-table-with-views-demo',
  standalone: true,
  imports: [BaseTableComponent, BaseTableViewsComponent],
  template: `
    <div class="space-y-3">
      <div class="panel px-2">
        <base-table-views [views]="views()" [activeViewId]="activeViewId()" [modified]="modified()"
                           (activeViewIdChange)="onSwitch($event)" (save)="onSave($event)"
                           (update)="onUpdate()" (reset)="onReset()" (copyLink)="log.set('Copied link to current view')" />
      </div>
      <base-table class="panel block overflow-hidden"
        [columns]="columns" [rows]="rows" trackKey="toolId" maxHeight="360px" minWidth="900px"
        (sortChange)="onStateChanged()" (filterChange)="onStateChanged()" (manageColumn)="onStateChanged()" />
      <p class="text-[11px] text-neutral-400 px-1">{{ log() }}</p>
    </div>
  `
})
class StoryTableWithViewsDemoComponent {
  readonly columns = BASIC_COLUMNS;
  readonly rows = ROWS;

  readonly views = signal<BaseTableView[]>([
    { id: 'all', label: 'All', isDefault: true },
    { id: 'down', label: 'Down tools', pinned: true },
    { id: 'shared-fab-a', label: 'Fab-A only', pinned: true, shared: true, readOnly: true }
  ]);
  readonly activeViewId = signal('all');
  readonly modified = signal(false);
  readonly log = signal('Sort, filter, or search the table below — watch the rail react.');

  onStateChanged(): void {
    if (this.modified()) return;
    this.modified.set(true);
    this.log.set('Live table state changed — active view marked "Modified"');
  }

  onSwitch(id: string): void {
    this.activeViewId.set(id);
    this.modified.set(false);
    this.log.set(`Switched to "${this.views().find((v) => v.id === id)?.label}"`);
  }

  onSave(label: string): void {
    const id = `${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
    this.views.update((v) => [...v, { id, label }]);
    this.activeViewId.set(id);
    this.modified.set(false);
    this.log.set(`Saved new view "${label}"`);
  }

  onUpdate(): void {
    this.modified.set(false);
    this.log.set(`Updated "${this.views().find((v) => v.id === this.activeViewId())?.label}" with the current state`);
  }

  onReset(): void {
    this.modified.set(false);
    this.log.set('Reverted — "modified" cleared (the demo does not restore prior sort/filter values, see class doc)');
  }
}

export const WithSavedViewsRail: StoryObj<StoryTableWithViewsDemoComponent> = {
  decorators: [moduleMetadata({ imports: [StoryTableWithViewsDemoComponent] })],
  render: () => ({ template: `<story-table-with-views-demo />` })
};

export const Empty: Story = { args: { rows: [], showSearch: false } };

/** `emptyKind` auto-picks 'no-results' (with a "Clear all filters" action) when a search/filter is
 *  active, or 'no-data' when there simply isn't any yet — override explicitly via `[emptyKind]`. */
export const EmptyNoDataYet: Story = { args: { rows: [], emptyKind: 'no-data', showSearch: false } };

/** `abbreviateNumbers` shows 1.2K/84K with the exact value in a tooltip; negative values (a
 *  data type behavior, not an opt-in) get error-toned text automatically either way. */
export const AbbreviatedAndNegativeNumbers: Story = {
  args: { columns: METRIC_COLUMNS, showSearch: false }
};

/** kind 'heat-cell' — a full-cell tint read against a threshold, value text always shown alongside it. */
export const HeatCells: Story = { args: { columns: HEAT_CELL_COLUMNS, showSearch: false } };

/** `[maxVisibleActions]="2"` — only the first two typed actions render inline; the rest collapse
 *  into a "⋯" overflow menu (click it in the canvas). */
export const RowActionsOverflow: Story = {
  args: { columns: MANY_ACTION_COLUMNS, maxVisibleActions: 2, showSearch: false }
};

/** `[readOnly]="true"` REMOVES mutating actions (edit/delete/…) from the row entirely rather than
 *  merely greying them out — only view/copy/download/run/history/more survive. */
export const ReadOnlyRemovesMutatingActions: Story = {
  args: { columns: MANY_ACTION_COLUMNS, readOnly: true, showSearch: false }
};

/** No rows yet — skeleton rows sized to the current density, in place of the table body. */
export const LoadingInitial: Story = { args: { loading: true, rows: [], showSearch: false } };

/** Rows already on screen, refreshing in the background — existing rows dim to 60% (not replaced
 *  by skeletons) and the paginator/footer stays put and interactive-looking either way. */
export const LoadingBackgroundRefresh: Story = { args: { loading: true, showSearch: false } };

/** Something actually failed — a recoverable error state (distinct from an empty result), with a
 *  Retry action wired to `(retry)`. */
export const ErrorWithRetry: Story = {
  args: { error: true, errorMessage: 'The fleet service timed out after 3 attempts.', retryLabel: 'Retry', showSearch: false }
};

/** `[showSummary]` pins a real `<tfoot>` aggregate row (never a styled div) over the FILTERED —
 *  not just the current page's — row set. Per-column `summary` picks the function. */
export const SummaryFooter: Story = {
  args: { columns: SUMMARY_COLUMNS, showSummary: true, showSearch: false }
};

/** `[editableRows]` + `editable`/`editType` per column. Click a row's Edit action: its editable
 *  cells swap to live controls, the row tints amber, and sort/filter/paging block with a banner
 *  until every dirty row is saved or cancelled (see the Edit/Save/Cancel row actions). */
export const InlineEdit: Story = {
  args: { columns: EDITABLE_COLUMNS, rows: EDITABLE_ROWS, showSearch: false, paginate: false }
};

/** `[serverSide]="true"` with `[totalItems]="0"` (unknown total): the paginator drops page numbers
 *  for "Showing X–Y" + a Next button gated by a full-page heuristic (or `[hasNextPage]` if the host
 *  knows better) — never a fabricated total. */
export const UnknownTotalServerSide: Story = {
  args: { serverSide: true, totalItems: 0, rows: ROWS.slice(0, 10), paginate: true, showSearch: false }
};

/** `[enableScroll]` + `[scrollEnd]="true"` — once there's nothing left to fetch, the loader row is
 *  replaced by an end-of-list message instead of spinning forever. */
export const InfiniteScrollEnded: Story = {
  args: { enableScroll: true, scrollLoading: false, scrollEnd: true, maxHeight: '360px', paginate: false, showSearch: false }
};

/** `[scrollTriggerPosition]="'top'"` — for "load older items" patterns, the loader/end row renders
 *  above the data instead of below it. */
export const InfiniteScrollTopTrigger: Story = {
  args: { enableScroll: true, scrollLoading: true, scrollTriggerPosition: 'top', maxHeight: '360px', paginate: false, showSearch: false }
};

/** A numeric range filter is exclusive with sort and every other filter — apply one on Uptime %,
 *  then notice the banner and that the search box/other filter icons are inert until it's cleared. */
export const RangeFilterBlocksOtherInteractions: Story = {
  args: { columns: RANGE_FILTER_COLUMNS, showSearch: true }
};
