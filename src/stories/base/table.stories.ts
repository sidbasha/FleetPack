import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BaseTableComponent, BaseColumnDef, BaseChildCellDirective } from '../../app/base';

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
      photo: `https://picsum.photos/seed/tool${i}/64/64`
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

const BASIC_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', sortable: true, filterable: true },
  { key: 'fab', header: 'Fab', filterable: true },
  { key: 'status', header: 'Status', kind: 'badge', badgeClassMap: STATUS_BADGE_MAP },
  { key: 'uptime', header: 'Uptime %', kind: 'number', align: 'right', sortable: true }
];

/** Every built-in `BaseCellKind` in one table - the reference for "what can a column render". */
const ALL_KIND_COLUMNS: BaseColumnDef<ToolRow>[] = [
  { key: 'toolId', header: 'Tool', width: '110px', sortable: true },
  { key: 'photo', header: 'Photo', kind: 'image', width: '64px' },
  { key: 'status', header: 'Status', kind: 'badge', badgeClassMap: STATUS_BADGE_MAP, width: '120px' },
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

const meta: Meta<BaseTableComponent<ToolRow>> = {
  title: 'Base/Tables & Data/Table',
  component: BaseTableComponent,
  tags: ['autodocs'],
  argTypes: {
    selectable: { control: 'select', options: ['none', 'single', 'multiple'] },
    groupHeaderStyle: { control: 'select', options: ['accent', 'plain', 'light'] },
    groupBy: { control: false },
    childColumns: { control: false },
    childRowsOf: { control: false }
  },
  args: {
    columns: BASIC_COLUMNS,
    rows: ROWS,
    trackKey: 'toolId',
    showSearch: true,
    showFilterRow: false,
    stickyHeader: false,
    selectable: 'none',
    striped: false,
    paginate: true,
    initialPageSize: 10
  },
  render: (args) => ({
    props: args,
    template: `<base-table class="panel block overflow-hidden"
      [columns]="columns" [rows]="rows" [trackKey]="trackKey"
      [showSearch]="showSearch" [showFilterRow]="showFilterRow" [stickyHeader]="stickyHeader"
      [selectable]="selectable" [striped]="striped" [paginate]="paginate" [initialPageSize]="initialPageSize"
      [groupBy]="groupBy" [groupHeaderStyle]="groupHeaderStyle" [groupActionLabel]="groupActionLabel"
      [maxHeight]="maxHeight" [minWidth]="minWidth"
      [expandable]="expandable" [childColumns]="childColumns" [childRowsOf]="childRowsOf"
      [childPaginate]="childPaginate" [childShowSearch]="childShowSearch" />`
  })
};
export default meta;
type Story = StoryObj<BaseTableComponent<ToolRow>>;

export const Default: Story = {};

/** One column per `BaseCellKind` - the reference for choosing a `kind` when defining a column. */
export const AllCellKinds: Story = {
  args: { columns: ALL_KIND_COLUMNS, minWidth: '1250px', showSearch: false }
};

/** `sticky: 'left' | 'right'` + a fixed `width` pins a column while the rest scrolls horizontally. */
export const StickyColumns: Story = {
  args: { columns: STICKY_COLUMNS, minWidth: '900px', maxHeight: '360px', stickyHeader: true, showSearch: false }
};

export const MultiSelect: Story = {
  name: 'Row selection (multiple)',
  args: { selectable: 'multiple' }
};

export const ColumnFilterRow: Story = {
  args: { showFilterRow: true, columns: BASIC_COLUMNS.map((c) => ({ ...c, filterable: true })) }
};

export const Striped: Story = { args: { striped: true } };

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
 * alongside the built-in `row-actions` edit/delete column.
 */
export const NestedRowsWithCustomCell: Story = {
  name: 'Nested table · custom cell + edit/delete',
  decorators: [moduleMetadata({ imports: [BaseChildCellDirective] })],
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
    </base-table>`
  })
};

export const Empty: Story = { args: { rows: [], showSearch: false } };
