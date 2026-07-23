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
  /** When set, renders as a segmented chip toggle (filled/empty circle) instead of a plain button. */
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
  /** Unique per page — used for @for tracking. */
  id: string;
  title?: string;
  /** Muted text rendered before `title`, e.g. 'Selected Fleet:'. */
  titlePrefix?: string;
  subtitle?: string;
  /** Small badge next to the title, e.g. 'FAM'. */
  badge?: string;
  /** Grid span on xl screens (page grid is 6 columns). Default 6 = full width. */
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6;
  legend?: LegendItem[];
  /** Muted label rendered before the actions row, e.g. 'Include:'. */
  actionsLabel?: string;
  actions?: WidgetAction[];
  /** Small muted chip rendered after the actions row, e.g. 'SW Version'. */
  note?: string;
  /** Two-line muted date range shown top-right of the header. */
  dateRange?: WidgetDateRange;
  /** Segmented pill switch shown in the header (e.g. Uptime Trend / Downtime Trend). */
  tabs?: WidgetTabs;
  /** Single boolean switch shown in the header (e.g. a "Period" toggle). */
  toggle?: WidgetToggle;
  /** Inline search box shown in the header. */
  search?: WidgetSearch;
  /** Adds a collapse chevron before the title; body hides when `collapsed`. */
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Render without the panel chrome (header/border). */
  frameless?: boolean;
}

export interface KpiItem {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent?: boolean;
  /** Renders the value in red, e.g. a downtime total. */
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
  /** Canvas height in px. Default 288. */
  height?: number;
  footnote?: string;
  /** Drill-down hook: fired with (datasetIndex, index) of the clicked element. */
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
  /** Enable click-to-sort on the header. */
  sortable?: boolean;
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
  /** kind 'progress' | 'text-bar': denominator the raw value is scaled against for bar width. Default 100. */
  progressMax?: number;
  /** kind 'progress' | 'text-bar': per-row bar fill color, e.g. row => 'bg-red-500'. Default indigo. */
  barClass?: (row: Row) => string;
  /** kind 'text-bar': the number driving the bar width, when it isn't the same as the cell's text value. */
  barValue?: (row: Row) => number;
  /** kind 'row-actions': small icon buttons, e.g. [{ icon: '🗑', run: r => … }]. */
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
  /** Property used for row tracking / selection identity. */
  trackKey: string;
  onRowClick?: (row: Row) => void;
  /** Highlight the row whose trackKey value matches. */
  selectedKey?: string | null;
  /** Group rows under sub-header rows (e.g. events by day). Return null to leave a row ungrouped (no header). */
  groupBy?: (row: Row) => string | null;
  /** 'accent' (default): indigo header with row count. 'plain': muted uppercase section divider. 'light': white header, bold label, count pill, solid action button. */
  groupHeaderStyle?: 'accent' | 'plain' | 'light';
  /** Unit label after the row count, e.g. 'row(s)' (default) or 'events'. */
  groupCountLabel?: string;
  groupAction?: { label: string; run: (group: string) => void };
  pagination?: PaginationConfig;
  footer?: string;
}

export interface RankedItem {
  key: string;
  rank?: number;
  title: string;
  /** Extra classes for the title, e.g. 'text-indigo-600 font-mono' to render it link-styled. */
  titleClass?: string;
  subtitle?: string;
  /** Extra classes for the subtitle. Defaults to muted small text. */
  subtitleClass?: string;
  value: string | number;
  /** Show a trend pill; null renders '—'. Omit entirely to hide. */
  trendPct?: number | null;
  /** 0–100 progress bar under the title. */
  barPct?: number;
  /** CSS color for the progress bar, e.g. '#ef4444'. Default indigo. */
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
