import { Component, ViewChild, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  AdditionalHeaderGroup,
  BaseBadgeComponent,
  BaseCellDirective,
  BaseCellEditEvent,
  BaseChildCellDirective,
  BaseChildFooterDirective,
  BaseColumnDef,
  BaseRowAction,
  BaseRowSaveRequest,
  BaseRowSaveResult,
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
/** 214 rows / page size 25 → 9 pages, matching the pagination-feature mockup's "Showing 76–100 of 214 tools" exactly. */
const LARGE_ROWS = mockRows(214);

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

const CHECKBOX_FILTER_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true },
  { key: 'fab', header: 'Fab', filterable: true, filterKind: 'checkbox', sortable: true },
  { key: 'status', header: 'Status', kind: 'badge', badgeClassMap: STATUS_BADGE_MAP, filterable: true, filterKind: 'checkbox', sortable: true },
  { key: 'uptime', header: 'Uptime %', kind: 'number', align: 'right', sortable: true }
];

const CALENDAR_FILTER_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true },
  { key: 'fab', header: 'Fab' },
  { key: 'lastMaint', header: 'Last Maintenance', kind: 'date', filterable: true, filterKind: 'calendar' }
];

const RANGE_FILTER_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true },
  { key: 'fab', header: 'Fab', filterable: true },
  { key: 'uptime', header: 'Uptime %', kind: 'number', align: 'right', sortable: true, filterable: true, filterKind: 'range' }
];

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

const HEAT_CELL_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true },
  { key: 'fab', header: 'Fab' },
  { key: 'status', header: 'Health', kind: 'heat-cell', heatClassMap: HEALTH_HEAT_MAP, width: '140px' },
  { key: 'uptime', header: 'Uptime %', kind: 'number', align: 'right' }
];

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

const SUMMARY_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true },
  { key: 'fab', header: 'Fab' },
  { key: 'status', header: 'Status', kind: 'badge', badgeClassMap: STATUS_BADGE_MAP, summary: 'count' },
  { key: 'uptime', header: 'Uptime %', kind: 'number', align: 'right', summary: 'mean' },
  { key: 'alarms', header: 'Alarms', kind: 'number', align: 'right', summary: 'total' }
];

const EDITABLE_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool' },
  { key: 'fab', header: 'Fab', editable: true, editType: 'select', editOptions: FABS.map((f) => ({ label: f, value: f })) },
  { key: 'uptime', header: 'Uptime %', kind: 'number', align: 'right', editable: true, editType: 'number' },
  {
    // No per-row Save action — saving is a whole-table control (the save bar's
    // "Save N changes"), one of the five controls in the edit-state spec.
    key: 'actions', header: '', align: 'right', width: '90px', kind: 'row-actions',
    rowActions: [
      { type: 'edit', title: 'Edit row', isHidden: (r: any) => !!r.isEditing, run: (r: any) => { r.isEditing = true; } },
      { type: 'cancel', title: 'Exit edit', isHidden: (r: any) => !r.isEditing, run: (r: any) => { r.isEditing = false; } }
    ]
  }
];

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
    pinBudgetPercent: { control: { type: 'number', min: 0, max: 100, step: 5 } },
    pageEntryThreshold: { control: { type: 'number', min: 1, max: 50, step: 1 } },
    groupBy: { control: false },
    childColumns: { control: false },
    childRowsOf: { control: false },
    additionalHeader: { control: false }
  },
  args: {
    columns: BASIC_COLUMNS,
    rows: ROWS,
    trackKey: 'toolId',
    tableTitle: '',
    tableIcon: '',
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
    pinBudgetPercent: 40,
    pageEntryThreshold: 10,
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
      [tableTitle]="tableTitle" [tableIcon]="tableIcon"
      [showSearch]="showSearch" [showFilterRow]="showFilterRow" [stickyHeader]="stickyHeader"
      [selectable]="selectable" [isDisableSelectAll]="isDisableSelectAll"
      [striped]="striped" [readOnly]="readOnly" [paginate]="paginate" [initialPageSize]="initialPageSize"
      [groupBy]="groupBy" [groupHeaderStyle]="groupHeaderStyle" [groupActionLabel]="groupActionLabel"
      [maxHeight]="maxHeight" [minWidth]="minWidth" [additionalHeader]="additionalHeader"
      [manageColumns]="manageColumns" [pinBudgetPercent]="pinBudgetPercent" [pageEntryThreshold]="pageEntryThreshold"
      [enableScroll]="enableScroll" [scrollLoading]="scrollLoading"
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

export const AllCellKinds: Story = {
  args: { columns: ALL_KIND_COLUMNS, minWidth: '1550px', showSearch: false }
};

export const StickyColumns: Story = {
  args: { columns: STICKY_COLUMNS, minWidth: '900px', maxHeight: '360px', stickyHeader: true, showSearch: false }
};

export const MultiSelect: Story = {
  name: 'Row selection (multiple)',
  args: { selectable: 'multiple' }
};

export const SelectAllDisabled: Story = {
  args: { selectable: 'multiple', isDisableSelectAll: true }
};

export const ColumnFilterRow: Story = {
  args: { showFilterRow: true, columns: BASIC_COLUMNS.map((c) => ({ ...c, filterable: true })) }
};

export const CheckboxFilter: Story = {
  args: { columns: CHECKBOX_FILTER_COLUMNS, showSearch: false }
};

export const CalendarFilter: Story = {
  args: { columns: CALENDAR_FILTER_COLUMNS, showSearch: false }
};

export const RangeFilter: Story = {
  args: { columns: RANGE_FILTER_COLUMNS, showSearch: false }
};

export const ManageColumns: Story = {
  args: {
    columns: STICKY_COLUMNS, manageColumns: true, minWidth: '900px', showSearch: false,
    tableTitle: 'Software version matrix', tableIcon: 'view_column'
  }
};

/**
 * Same table, but with a tight pin budget — open Manage Columns and pin a
 * couple more scrollable columns (drag them into Pinned left/right, or use
 * the per-row pin buttons) to see the budget meter cross into its warning
 * tone. `toolId`/`actions` are still identity-locked either way.
 */
export const ManageColumnsTightBudget: Story = {
  args: {
    columns: STICKY_COLUMNS, manageColumns: true, minWidth: '900px', showSearch: false,
    tableTitle: 'Software version matrix', tableIcon: 'view_column', pinBudgetPercent: 20
  }
};

export const AdditionalHeaderRow: Story = {
  args: { additionalHeader: ADDITIONAL_HEADER_GROUPS, showSearch: false }
};

export const TypedRowActions: Story = {
  args: { columns: TYPED_ACTION_COLUMNS, showSearch: false }
};

export const Striped: Story = { args: { striped: true } };

export const ReadOnlyLibraryMode: Story = {
  args: { columns: CHECKBOX_FILTER_COLUMNS, manageColumns: true, readOnly: true, showSearch: false }
};

export const HighlightAutoScroll: Story = {
  args: { highlightKey: ROWS[28].toolId, maxHeight: '360px', paginate: false, showSearch: false }
};

export const InfiniteScroll: Story = {
  args: { enableScroll: true, scrollLoading: true, maxHeight: '360px', paginate: false, showSearch: false }
};

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

export const NestedRows: Story = {
  name: 'Expand/collapse nested table',
  args: {
    expandable: true,
    childColumns: ALARM_EVENT_COLUMNS,
    childRowsOf: alarmEventsOf,
    showSearch: false
  }
};

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

const STATE_DOT_MAP: Record<string, string> = {
  PRODUCTION: 'bg-emerald-500', ENGINEERING: 'bg-sky-500', STANDBY: 'bg-violet-500', DOWN: 'bg-red-500'
};

const UPTIME_HEAT_THRESHOLDS = [
  { max: 84, className: 'bg-error-surface text-error-hover' },
  { max: 94, className: 'bg-warning-surface text-warning-hover' },
  { max: 100, className: 'bg-success-surface text-success-hover' }
];

const SAVED_VIEWS_DEMO_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true, width: '110px' },
  { key: 'fab', header: 'Fab', filterable: true, filterKind: 'checkbox', width: '90px' },
  {
    key: 'status', header: 'State', kind: 'dot', width: '140px',
    dotClassMap: STATE_DOT_MAP, textColorClassMap: STATUS_TEXT_MAP,
    filterable: true, filterKind: 'checkbox'
  },
  {
    key: 'uptime', header: 'Up-time %', kind: 'heat-cell', align: 'center', width: '110px',
    heatThresholds: UPTIME_HEAT_THRESHOLDS, format: (_r, v) => `${v}%`,
    sortable: true, filterable: true, filterKind: 'range'
  },
  { key: 'alarms', header: 'Alarms', align: 'center', width: '90px' },
  {
    key: 'lastMaint', header: 'Last Maintenance', kind: 'date', width: '160px',
    sortable: true, filterable: true, filterKind: 'calendar'
  }
];

/**
 * `<base-table-views>` paired with a real `<base-table>`, its filter-chips summary row, and a
 * mixed set of styled cells (threshold heat-cell, badge count, dot + colored text) — sort a
 * column, filter, or search below and watch the active tab pick up a "Modified" badge; Update/
 * Reset light up on the rail's detail bar, and every checkbox/calendar/range filter you set
 * appears as a removable chip beneath the toolbar alongside a non-removable sort chip.
 *
 * The rail and the chip row are both fully controlled (see their own class docs) — this demo's
 * host component owns the view list and derives "modified" off the table's own (sortChange)/
 * (filterChange)/(manageColumn) events, since those are the only pieces of filter/sort state the
 * table currently exposes outward; it does not re-apply a selected view's filters onto the table
 * (that needs the table's internal filter/sort signals to become host-controlled inputs, which is
 * a bigger API change than this component pair takes on today).
 *
 * `<base-table-views>` and `<base-table>` sit inside one shared `.panel overflow-hidden` wrapper
 * with no gap between them, so the tab rail, detail bar, filter chips, and table body read as a
 * single joined card — the pairing pattern to copy wherever a saved-views rail sits above a table.
 */
@Component({
  selector: 'story-table-with-views-demo',
  standalone: true,
  imports: [BaseTableComponent, BaseTableViewsComponent, BaseBadgeComponent, BaseCellDirective],
  template: `
    <div class="space-y-3">
      <div class="panel overflow-hidden">
        <base-table-views [views]="views()" [activeViewId]="activeViewId()" [modified]="modified()"
                           (activeViewIdChange)="onSwitch($event)" (save)="onSave($event)"
                           (update)="onUpdate()" (reset)="onReset()" (copyLink)="log.set('Copied link to current view')" />
        <base-table class="block"
          [columns]="columns" [rows]="rows" trackKey="toolId" maxHeight="420px" minWidth="900px"
          (sortChange)="onStateChanged()" (filterChange)="onStateChanged()" (manageColumn)="onStateChanged()">
          <ng-template baseCell="alarms" let-row>
            <base-badge [count]="row.alarms" [tone]="alarmTone(row.alarms)" />
          </ng-template>
        </base-table>
      </div>
      <p class="text-[11px] text-neutral-400 px-1">{{ log() }}</p>
    </div>
  `
})
class StoryTableWithViewsDemoComponent {
  readonly columns = SAVED_VIEWS_DEMO_COLUMNS;
  readonly rows = ROWS;

  readonly views = signal<BaseTableView[]>([
    { id: 'all', label: 'All tools', isDefault: true, count: ROWS.length },
    { id: 'down', label: 'Down tools', pinned: true, count: ROWS.filter((r) => r.status === 'DOWN').length },
    {
      id: 'shared-fab-a', label: 'Fab-A only', pinned: true, shared: true, readOnly: true,
      count: ROWS.filter((r) => r.fab === 'Fab-A').length
    }
  ]);
  readonly activeViewId = signal('all');
  readonly modified = signal(false);
  readonly log = signal('Sort, filter, or search the table below — watch the rail and the filter chips react.');

  alarmTone(count: number): 'error' | 'warning' | 'neutral' {
    return count >= 20 ? 'error' : count >= 8 ? 'warning' : 'neutral';
  }

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

export const EmptyNoDataYet: Story = { args: { rows: [], emptyKind: 'no-data', showSearch: false } };

export const AbbreviatedAndNegativeNumbers: Story = {
  args: { columns: METRIC_COLUMNS, showSearch: false }
};

export const HeatCells: Story = { args: { columns: HEAT_CELL_COLUMNS, showSearch: false } };

const HEAT_THRESHOLD_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true },
  { key: 'fab', header: 'Fab' },
  {
    key: 'uptime', header: 'Up-time %', kind: 'heat-cell', align: 'center', sortable: true,
    heatThresholds: UPTIME_HEAT_THRESHOLDS, format: (_r, v) => `${v}%`
  }
];

export const HeatCellsThresholds: Story = {
  name: 'Heat cell (threshold bands)',
  args: { columns: HEAT_THRESHOLD_COLUMNS, showSearch: false }
};

export const RowActionsOverflow: Story = {
  args: { columns: MANY_ACTION_COLUMNS, maxVisibleActions: 2, showSearch: false }
};

export const ReadOnlyRemovesMutatingActions: Story = {
  args: { columns: MANY_ACTION_COLUMNS, readOnly: true, showSearch: false }
};

export const LoadingInitial: Story = { args: { loading: true, rows: [], showSearch: false } };

export const LoadingBackgroundRefresh: Story = { args: { loading: true, showSearch: false } };

export const ErrorWithRetry: Story = {
  args: { error: true, errorMessage: 'The fleet service timed out after 3 attempts.', retryLabel: 'Retry', showSearch: false }
};

export const SummaryFooter: Story = {
  args: { columns: SUMMARY_COLUMNS, showSummary: true, showSearch: false }
};

/**
 * A real, stateful host for the edit-state demo below — Storybook args are
 * plain read-only objects, but Revert/Clear/Discard/Save need somewhere to
 * actually apply to, the same way `onCellEdit` does in the dev playground.
 * Row 1's save is scripted to fail, so the partial-failure path (error
 * fill, values kept, still dirty) is there to see without extra clicks.
 */
@Component({
  selector: 'story-editable-table',
  standalone: true,
  imports: [BaseTableComponent],
  template: `
    <base-table class="panel block overflow-hidden"
      [columns]="columns" [rows]="rows()" trackKey="toolId"
      [editableRows]="true" [paginate]="false" [showSearch]="false"
      (cellEdit)="onCellEdit($event)" (saveChanges)="onSaveChanges($event)" #table />
  `
})
class StoryEditableTable {
  @ViewChild('table') tableRef?: BaseTableComponent<ToolRow>;

  readonly columns = EDITABLE_COLUMNS;
  readonly rows = signal<ToolRow[]>(EDITABLE_ROWS.map((r, i) => (i === 0 ? { ...r, isEditing: true } : r)));

  onCellEdit(e: BaseCellEditEvent<ToolRow>): void {
    this.rows.update((rows) => rows.map((r) => (r.toolId === e.row.toolId ? { ...r, [e.column.key]: e.value } : r)));
  }

  /** Row index 1 in whatever batch gets saved always fails, so the partial-failure path (error fill, values kept, still dirty) is easy to see without hand-crafting a specific edit sequence. */
  onSaveChanges(requests: BaseRowSaveRequest<ToolRow>[]): void {
    setTimeout(() => {
      const results: BaseRowSaveResult[] = requests.map((r, i) =>
        i === 1 ? { key: r.key, success: false, error: 'Server rejected the value' } : { key: r.key, success: true }
      );
      this.tableRef?.reportSaveResult(results);
    }, 700);
  }
}

export const InlineEdit: Story = {
  name: 'Inline edit · Revert / Clear / Save bar',
  decorators: [moduleMetadata({ imports: [StoryEditableTable] })],
  render: () => ({ template: `<story-editable-table />` })
};

export const UnknownTotalServerSide: Story = {
  args: { serverSide: true, totalItems: 0, rows: ROWS.slice(0, 10), paginate: true, showSearch: false }
};

/**
 * Large result set (214 rows), threshold lowered to 8 so the "Go to" entry
 * shows on this 9-page set instead of the shipped default of 10. Type a
 * page number and press Enter to jump directly; type one past the last
 * page and it reports the bound instead of clamping. Then change Rows —
 * the page you land on is whichever one still holds the first row you were
 * looking at, not page 1, and the note underneath says which row and page.
 */
export const LargeResultSetGoToPage: Story = {
  name: 'Large result set · Go to page + size-change anchor',
  args: { columns: BASIC_COLUMNS, rows: LARGE_ROWS, initialPageSize: 25, pageEntryThreshold: 8, showSearch: false }
};

export const SinglePageHidesStepper: Story = {
  name: 'Single page · stepper and entry both hide',
  args: { columns: BASIC_COLUMNS, rows: ROWS.slice(0, 5), initialPageSize: 25, showSearch: false }
};

export const InfiniteScrollEnded: Story = {
  args: { enableScroll: true, scrollLoading: false, scrollEnd: true, maxHeight: '360px', paginate: false, showSearch: false }
};

export const InfiniteScrollTopTrigger: Story = {
  args: { enableScroll: true, scrollLoading: true, scrollTriggerPosition: 'top', maxHeight: '360px', paginate: false, showSearch: false }
};

export const RangeFilterBlocksOtherInteractions: Story = {
  args: { columns: RANGE_FILTER_COLUMNS, showSearch: true }
};
