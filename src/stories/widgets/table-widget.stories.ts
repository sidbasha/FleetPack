import type { Meta, StoryObj } from '@storybook/angular';
import { TableWidgetComponent } from '../../app/shared/dynamic/table-widget.component';
import { ColumnDef, TableWidget } from '../../app/shared/dynamic/widget.model';

// TableWidgetComponent hardcodes its row type to Record<string, unknown> (not generic
// like <base-table>), so stories must match that shape rather than a narrower interface.
type Row = Record<string, unknown>;

const ROWS: Row[] = [
  { toolId: 'KLA-1000', fab: 'Fab-A', status: 'PRODUCTION', uptime: 96, trendPct: 1.2 },
  { toolId: 'KLA-1001', fab: 'Fab-B', status: 'DOWN', uptime: 41, trendPct: -6.4 },
  { toolId: 'KLA-1002', fab: 'Fab-A', status: 'ENGINEERING', uptime: 78, trendPct: 0.3 },
  { toolId: 'KLA-1003', fab: 'Fab-C', status: 'STANDBY', uptime: 0, trendPct: null }
];

const COLUMNS: ColumnDef<Row>[] = [
  { key: 'toolId', header: 'Tool', kind: 'mono', sortable: true },
  { key: 'fab', header: 'Fab' },
  {
    key: 'status', header: 'Status', kind: 'badge',
    badgeClassMap: {
      PRODUCTION: 'bg-emerald-50 text-emerald-600',
      DOWN: 'bg-red-50 text-red-600',
      ENGINEERING: 'bg-sky-50 text-sky-600',
      STANDBY: 'bg-violet-50 text-violet-600'
    }
  },
  { key: 'uptime', header: 'Uptime %', align: 'right' },
  { key: 'trendPct', header: 'W/W', kind: 'trend', trendBadWhenUp: false }
];

const WIDGET: TableWidget<Row> = {
  id: 'tools-table',
  type: 'table',
  columns: COLUMNS,
  rows: ROWS,
  trackKey: 'toolId',
  footer: `${ROWS.length} tools`
};

/** `fam-table-widget` adapts the legacy `TableWidget`/`ColumnDef` config to `<base-table>`. New code should
 * prefer `<base-table>` + `BaseColumnDef` directly (see Base/Tables & Data/Table) - this adapter exists for
 * screens still on the widget-config model. */
const meta: Meta<TableWidgetComponent> = {
  title: 'Widgets/Table (legacy adapter)',
  component: TableWidgetComponent,
  tags: ['autodocs'],
  args: { widget: WIDGET }
};
export default meta;
type Story = StoryObj<TableWidgetComponent>;

export const Default: Story = {};

export const Paginated: Story = {
  args: {
    widget: {
      ...WIDGET,
      pagination: { page: 2, pageCount: 5, total: 47, onPrev: () => {}, onNext: () => {} }
    }
  }
};

export const GroupedByStatus: Story = {
  args: {
    widget: {
      ...WIDGET,
      groupBy: (r: Row) => r['status'] as string,
      groupHeaderStyle: 'light',
      groupAction: { label: 'Review', run: () => {} }
    }
  }
};
