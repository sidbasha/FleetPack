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
  | 'datetime'  // date + time, via Intl.DateTimeFormat (dateStyle + timeStyle)
  | 'sno'       // auto row number (1, 2, 3… page-aware when paginated)
  | 'array'     // value = unknown[] — deduped, comma-joined
  | 'badge'     // pill, colored via badgeClassMap
  | 'dot'       // status dot + text, colored via dotClassMap
  | 'status-text' // colored bold text (no pill/dot), colored via textColorClassMap
  | 'trend'     // ▲/▼ % pill (BaseTrendComponent)
  | 'image'     // thumbnail <img>, value = URL
  | 'progress'  // 0–100 progress bar
  | 'text-bar'  // colored label with a thin proportional bar underneath
  | 'sparkline' // mini line chart, value = number[]
  | 'link'      // anchor; href from linkHref(row)
  | 'row-actions' // small icon buttons, e.g. delete/edit
  | 'template'; // custom ng-template (see BaseCellDirective)

/** Column filter UI. Unset (with `filterable: true`) keeps the classic text filter-row input. */
export type BaseColumnFilterKind = 'text' | 'checkbox' | 'calendar' | 'range';

/** 16 built-in row-action types (icons resolved via ROW_ACTION_ICON below). */
export type RowActionType =
  | 'add' | 'click' | 'copy' | 'delete' | 'download' | 'edit' | 'more' | 'reset'
  | 'run' | 'upload' | 'view' | 'cancel' | 'history' | 'revert' | 'apply' | 'disable' | 'enable';

/** Default glyph per built-in row-action type. Override per-action via `icon`. */
export const ROW_ACTION_ICON: Record<RowActionType, string> = {
  add: '＋', click: '↗', copy: '⧉', delete: '🗑', download: '⬇', edit: '✎',
  more: '⋯', reset: '↺', run: '▶', upload: '⬆', view: '👁', cancel: '✕',
  history: '🕘', revert: '⎌', apply: '✓', disable: '🚫', enable: '⏻'
};

/** Rich, typed row action — icon auto-resolves from `type` unless `icon` overrides it. */
export interface BaseRowAction<T = BaseRow> {
  type: RowActionType;
  /** Override the default icon glyph for this action's type. */
  icon?: string;
  title?: string;
  variant?: 'icon' | 'button';
  /** Return true to grey out (but still render) this action for a given row. */
  isDisabled?: (row: T) => boolean;
  /** Return true to omit this action entirely for a given row. */
  isHidden?: (row: T) => boolean;
  run: (row: T) => void;
}

/** Legacy freeform row action — still supported alongside BaseRowAction. */
export interface BaseLegacyRowAction<T = BaseRow> {
  icon: string;
  title?: string;
  variant?: 'icon' | 'button';
  run: (row: T) => void;
}

/** A merged/grouped header cell spanning several normal columns (additional header row). */
export interface AdditionalHeaderGroup {
  displayName: string;
  /** Explicit colspan. Ignored (recomputed) when `columnIds` is set. */
  colSpan?: number;
  /** When set, colSpan auto-recalculates from how many of these keys are currently visible. */
  columnIds?: string[];
}

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
  /** Pin this column while scrolling horizontally. Also excludes it from Manage Columns drag/hide. */
  sticky?: 'left' | 'right';
  /** Hide the column without removing it from the config. */
  hidden?: boolean;

  // ── behaviour ──
  /** Enable click-to-sort on the header. */
  sortable?: boolean;
  /** Show a filter input for this column in the filter row. */
  filterable?: boolean;
  /** Filter UI shown in the header when `filterable` is true. Default 'text' (classic filter row). */
  filterKind?: BaseColumnFilterKind;
  /** kind 'calendar' filter: adds HH:MM boxes to the Start/End date pickers. */
  filterShowTime?: boolean;
  /** Header tooltip text. */
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Per-row cell tooltip. */
  rowTooltip?: (row: T) => string | null | undefined;
  /** Bold + pointer styling; still emits the existing (cellClick) output. */
  clickable?: boolean;

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
  /** kind 'date' | 'datetime': Intl.DateTimeFormat options, e.g. { dateStyle: 'medium' }. */
  dateFormat?: Intl.DateTimeFormatOptions;
  /** kind 'badge': value → tailwind classes. */
  badgeClassMap?: Record<string, string>;
  /** kind 'dot': value → dot color class. */
  dotClassMap?: Record<string, string>;
  /** kind 'status-text': value → text color class, e.g. { Production: 'text-emerald-600 font-semibold' }. */
  textColorClassMap?: Record<string, string>;
  /** kind 'trend': treat an increase as bad (e.g. alarm counts). */
  trendBadWhenUp?: boolean;
  /** kind 'image': square thumbnail size in px. Default 32. */
  imageSize?: number;
  /** kind 'link': href builder. */
  linkHref?: (row: T) => string;
  /** kind 'link': open in new tab. Default true. */
  linkExternal?: boolean;
  /** kind 'progress' | 'text-bar': denominator the raw value is scaled against for bar width. Default 100. */
  progressMax?: number;
  /** kind 'progress' | 'text-bar': per-row bar fill color, e.g. row => 'bg-red-500'. Default indigo. */
  barClass?: (row: T) => string;
  /** kind 'text-bar': the number driving the bar width, when it isn't the same as the cell's text value. */
  barValue?: (row: T) => number;
  /** kind 'row-actions': typed built-in actions and/or freeform icon buttons. */
  rowActions?: (BaseRowAction<T> | BaseLegacyRowAction<T>)[];
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

/** Emitted whenever any row action (typed or legacy) runs, in addition to its own `run(row)` callback. */
export interface BaseHandleActionEvent<T = BaseRow> {
  actionType: RowActionType | string;
  row: T;
}

/** Emitted by the checkbox column filter's Apply button. */
export interface BaseCheckboxFilterValue {
  selected: string[];
  sort: 'asc' | 'desc' | null;
}

/** Emitted by the calendar column filter's Apply button. */
export interface BaseCalendarFilterValue {
  start: Date | null;
  end: Date | null;
}

/** Emitted by the numeric range column filter's Apply button. */
export interface BaseRangeFilterValue {
  from: number | null;
  to: number | null;
}

/** Infinite-scroll position, emitted by (scrollEvent) when [enableScroll] is on. */
export interface BaseScrollEvent {
  position: 'top' | 'mid' | 'bottom';
}

/** Emitted by (manageColumn) after the Manage Columns panel's Apply button. */
export interface BaseManageColumnsEvent {
  /** Visible column keys, in display order. */
  visibleKeys: string[];
  /** All known column keys, in display order (including hidden ones). */
  order: string[];
}
