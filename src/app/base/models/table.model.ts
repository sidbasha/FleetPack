/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BASE MODULE · Table model
 *
 * All types consumed by <base-table>. A table is fully described by:
 *   - BaseColumnDef[]  → dynamic columns (add/remove/reorder at runtime)
 *   - rows: T[]        → any row shape
 *
 * Every cell can render one of the built-in kinds below, OR be completely
 * overridden with a custom <ng-template baseCell="key"> (text, number, image,
 * chart, buttons — anything).
 * ─────────────────────────────────────────────────────────────────────────────
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BaseRow = any;

/** Built-in cell renderers. 'template' is implied when a baseCell template exists. */
export type BaseCellKind =
  | 'text'      // default — String(value)
  | 'number'    // right-aligned, formatted via Intl.NumberFormat
  | 'date'      // formatted via Intl.DateTimeFormat
  | 'badge'     // pill, colored via badgeClassMap
  | 'dot'       // status dot + text, colored via dotClassMap
  | 'trend'     // ▲/▼ % pill (BaseTrendComponent)
  | 'image'     // thumbnail <img>, value = URL
  | 'progress'  // 0–100 progress bar
  | 'sparkline' // mini line chart, value = number[]
  | 'link'      // anchor; href from linkHref(row)
  | 'template'; // custom ng-template (see BaseCellDirective)

export interface BaseColumnDef<T = BaseRow> {
  /** Unique column id. Also the default row property to read. */
  key: string;
  /** Header label. */
  header: string;
  /** Built-in renderer. Default 'text'. Ignored when a custom template is provided for this key. */
  kind?: BaseCellKind;

  // ── layout ──
  align?: 'left' | 'center' | 'right';
  /** Fixed width, e.g. '160px'. REQUIRED when sticky, so pin offsets can be computed. */
  width?: string;
  /** Pin this column while scrolling horizontally. */
  sticky?: 'left' | 'right';
  /** Hide the column without removing it from the config. */
  hidden?: boolean;

  // ── behaviour ──
  /** Enable click-to-sort on the header. */
  sortable?: boolean;
  /** Show a filter input for this column in the filter row. */
  filterable?: boolean;

  // ── value / formatting hooks ──
  /** Override the raw value (defaults to row[key]). */
  value?: (row: T) => unknown;
  /** Override the rendered text (defaults to String(value)). */
  format?: (row: T, value: unknown) => string;
  /** Extra CSS classes for the cell content. */
  cellClass?: (row: T) => string;

  // ── kind-specific options ──
  /** kind 'number': Intl.NumberFormat options, e.g. { maximumFractionDigits: 1 }. */
  numberFormat?: Intl.NumberFormatOptions;
  /** kind 'date': Intl.DateTimeFormat options, e.g. { dateStyle: 'medium' }. */
  dateFormat?: Intl.DateTimeFormatOptions;
  /** kind 'badge': value → tailwind classes. */
  badgeClassMap?: Record<string, string>;
  /** kind 'dot': value → dot color class. */
  dotClassMap?: Record<string, string>;
  /** kind 'trend': treat an increase as bad (e.g. alarm counts). */
  trendBadWhenUp?: boolean;
  /** kind 'image': square thumbnail size in px. Default 32. */
  imageSize?: number;
  /** kind 'link': href builder. */
  linkHref?: (row: T) => string;
  /** kind 'link': open in new tab. Default true. */
  linkExternal?: boolean;
  /** kind 'progress': denominator the raw value is scaled against for bar width. Default 100. */
  progressMax?: number;
  /** kind 'progress': per-row bar fill color, e.g. row => 'bg-red-500'. Default indigo. */
  barClass?: (row: T) => string;
}

export interface BaseSortEvent {
  /** Column key, or null when sorting is cleared. */
  key: string | null;
  direction: 'asc' | 'desc' | null;
}

export interface BasePageEvent {
  /** 1-based page index. */
  page: number;
  pageSize: number;
}

export interface BaseFilterEvent {
  /** Global quick-search text (from [quickFilter] or the built-in search box). */
  quick: string;
  /** Per-column filter texts, keyed by column key. Empty entries are removed. */
  columns: Record<string, string>;
}

export interface BaseCellClickEvent<T = BaseRow> {
  row: T;
  column: BaseColumnDef<T>;
  value: unknown;
  rowIndex: number;
}

export interface BaseRowClickEvent<T = BaseRow> {
  row: T;
  rowIndex: number;
}
