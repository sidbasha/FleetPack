import { Type } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';


export interface LegendItem { label: string; color: string; }

export interface WidgetAction {
  label: string;
  kind?: 'primary' | 'ghost';
  active?: boolean;
  run: () => void;
}

export interface WidgetDateRange { from: string; to: string; }

export interface WidgetTabs {
  items: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
}

export interface WidgetToggle {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface WidgetSearch {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export interface WidgetBase {
  id: string;
  title?: string;
  titlePrefix?: string;
  subtitle?: string;
  badge?: string;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6;
  legend?: LegendItem[];
  actionsLabel?: string;
  actions?: WidgetAction[];
  note?: string;
  dateRange?: WidgetDateRange;
  tabs?: WidgetTabs;
  toggle?: WidgetToggle;
  search?: WidgetSearch;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  frameless?: boolean;
}

export interface KpiItem {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent?: boolean;
  danger?: boolean;
}
export interface KpiGridWidget extends WidgetBase {
  type: 'kpi-grid';
  kpis: KpiItem[];
}

export interface ChartWidget extends WidgetBase {
  type: 'chart';
  chartType: ChartType;
  data: ChartConfiguration['data'];
  options?: ChartConfiguration['options'];
  height?: number;
  footnote?: string;
  onPointClick?: (datasetIndex: number, index: number) => void;
}

export type CellKind = 'text' | 'mono' | 'badge' | 'dot' | 'trend' | 'progress' | 'text-bar' | 'row-actions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ColumnDef<Row = any> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  kind?: CellKind;
  width?: string;
  sortable?: boolean;
  value?: (row: Row) => unknown;
  format?: (row: Row) => string;
  classFn?: (row: Row) => string;
  badgeClassMap?: Record<string, string>;
  dotClassMap?: Record<string, string>;
  trendBadWhenUp?: boolean;
  progressMax?: number;
  barClass?: (row: Row) => string;
  barValue?: (row: Row) => number;
  rowActions?: { icon: string; title?: string; variant?: 'icon' | 'button'; run: (row: Row) => void }[];
}

export interface PaginationConfig {
  page: number;
  pageCount: number;
  total?: number;
  onPrev: () => void;
  onNext: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TableWidget<Row = any> extends WidgetBase {
  type: 'table';
  columns: ColumnDef<Row>[];
  rows: Row[];
  trackKey: string;
  onRowClick?: (row: Row) => void;
  selectedKey?: string | null;
  groupBy?: (row: Row) => string | null;
  groupHeaderStyle?: 'accent' | 'plain' | 'light';
  groupCountLabel?: string;
  groupAction?: { label: string; run: (group: string) => void };
  pagination?: PaginationConfig;
  footer?: string;
}

export interface RankedItem {
  key: string;
  rank?: number;
  title: string;
  titleClass?: string;
  subtitle?: string;
  subtitleClass?: string;
  value: string | number;
  trendPct?: number | null;
  barPct?: number;
  barColor?: string;
}
export interface RankedListWidget extends WidgetBase {
  type: 'ranked-list';
  items: RankedItem[];
  trendBadWhenUp?: boolean;
  footnote?: string;
  onItemClick?: (item: RankedItem) => void;
}

export interface ComponentWidget extends WidgetBase {
  type: 'component';
  component?: Type<unknown>;
  name?: string;
  inputs?: Record<string, unknown>;
}

export type WidgetConfig =
  | KpiGridWidget
  | ChartWidget
  | TableWidget
  | RankedListWidget
  | ComponentWidget;
