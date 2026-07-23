import { Type } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';

/**
 * ─────────────────────────────────────────────────────────────
 * Dynamic widget model
 * Every screen is composed of WidgetConfig[] rendered by
 * <fam-dynamic-page>. Adding a new panel = adding a config
 * object, not a new template.
 * ─────────────────────────────────────────────────────────────
 */

export interface LegendItem { label: string; color: string; }

export interface WidgetAction {
  label: string;
  kind?: 'primary' | 'ghost';
  run: () => void;
}

export interface WidgetBase {
  /** Unique per page — used for @for tracking. */
  id: string;
  title?: string;
  subtitle?: string;
  /** Small badge next to the title, e.g. 'FAM'. */
  badge?: string;
  /** Grid span on xl screens (page grid is 6 columns). Default 6 = full width. */
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6;
  legend?: LegendItem[];
  actions?: WidgetAction[];
  /** Render without the panel chrome (header/border). */
  frameless?: boolean;
}

export interface KpiItem {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent?: boolean;
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
  /** Canvas height in px. Default 288. */
  height?: number;
  footnote?: string;
  /** Drill-down hook: fired with (datasetIndex, index) of the clicked element. */
  onPointClick?: (datasetIndex: number, index: number) => void;
}

export type CellKind = 'text' | 'mono' | 'badge' | 'dot' | 'trend';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ColumnDef<Row = any> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  kind?: CellKind;
  width?: string;
  /** Override the raw value (defaults to row[key]). */
  value?: (row: Row) => unknown;
  /** Override the rendered text (defaults to String(value)). */
  format?: (row: Row) => string;
  /** Extra classes for the cell content. */
  classFn?: (row: Row) => string;
  /** kind 'badge': value → classes. */
  badgeClassMap?: Record<string, string>;
  /** kind 'dot': value → dot color class. */
  dotClassMap?: Record<string, string>;
  /** kind 'trend': whether an increase is bad (alarms) vs good (uptime). */
  trendBadWhenUp?: boolean;
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
  /** Property used for row tracking / selection identity. */
  trackKey: string;
  onRowClick?: (row: Row) => void;
  /** Highlight the row whose trackKey value matches. */
  selectedKey?: string | null;
  /** Group rows under sub-header rows (e.g. events by day). */
  groupBy?: (row: Row) => string;
  groupAction?: { label: string; run: (group: string) => void };
  pagination?: PaginationConfig;
  footer?: string;
}

export interface RankedItem {
  key: string;
  rank?: number;
  title: string;
  subtitle?: string;
  value: string | number;
  /** Show a trend pill; null renders '—'. Omit entirely to hide. */
  trendPct?: number | null;
  /** 0–100 progress bar under the title. */
  barPct?: number;
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
  /** Direct component class… */
  component?: Type<unknown>;
  /** …or a name registered in the widget registry. */
  name?: string;
  inputs?: Record<string, unknown>;
}

export type WidgetConfig =
  | KpiGridWidget
  | ChartWidget
  | TableWidget
  | RankedListWidget
  | ComponentWidget;
