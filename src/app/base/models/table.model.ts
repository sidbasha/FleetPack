
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BaseRow = any;

export type BaseCellKind =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'sno'
  | 'array'
  | 'badge'
  | 'dot'
  | 'status-text'
  | 'trend'
  | 'image'
  | 'progress'
  | 'text-bar'
  | 'sparkline'
  | 'link'
  | 'row-actions'
  | 'heat-cell'
  | 'task-progress'
  | 'template';

/**
 * One of the three kinds of percentage — see the Base README's "The three
 * kinds of percentage" / "The rule" sections. Rendered by `kind:
 * 'task-progress'`: a ring, its value, and the noun naming what's
 * progressing, so a bare number is never left to mean two different things
 * in the same row. Distinct from `'progress'` (a share-of-a-set bar) and
 * `'heat-cell'` (a measurement) — never reuse this for either of those.
 */
export interface BaseTaskProgress {
  /** 0–100. Omit (or leave undefined/null) for a queued task — rendered as a muted ring and "–" rather than "0%". */
  percent?: number | null;
  /** The noun that says what's progressing, e.g. "Log download" — the ring's accessible name is built from this plus the value. */
  label: string;
  status?: 'running' | 'success' | 'failed' | 'queued';
}

export type BaseColumnFilterKind = 'text' | 'checkbox' | 'calendar' | 'range';

export type BaseSummaryFn = 'total' | 'mean' | 'median' | 'min' | 'max' | 'count' | 'outOfSpec' | 'none';

export type RowActionType =
  | 'add' | 'click' | 'copy' | 'delete' | 'download' | 'edit' | 'more' | 'reset'
  | 'run' | 'upload' | 'view' | 'cancel' | 'history' | 'revert' | 'apply' | 'disable' | 'enable';

export const ROW_ACTION_ICON: Record<RowActionType, string> = {
  add: '＋', click: '↗', copy: '⧉', delete: '🗑', download: '⬇', edit: '✎',
  more: '⋯', reset: '↺', run: '▶', upload: '⬆', view: '👁', cancel: '✕',
  history: '🕘', revert: '⎌', apply: '✓', disable: '🚫', enable: '⏻'
};

export interface BaseRowAction<T = BaseRow> {
  type: RowActionType;
  icon?: string;
  title?: string;
  variant?: 'icon' | 'button';
  isDisabled?: (row: T) => boolean;
  isHidden?: (row: T) => boolean;
  run: (row: T) => void;
}

export interface BaseLegacyRowAction<T = BaseRow> {
  icon: string;
  title?: string;
  variant?: 'icon' | 'button';
  run: (row: T) => void;
}

export interface AdditionalHeaderGroup {
  displayName: string;
  colSpan?: number;
  columnIds?: string[];
}

export interface BaseFilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface BaseTableView<S = unknown> {
  id: string;
  label: string;
  pinned?: boolean;
  shared?: boolean;
  readOnly?: boolean;
  isDefault?: boolean;
  count?: number;
  state?: S;
}

export interface BaseColumnDef<T = BaseRow> {
  key: string;
  header: string;
  kind?: BaseCellKind;

  align?: 'left' | 'center' | 'right';
  width?: string;
  sticky?: 'left' | 'right';
  hidden?: boolean;

  sortable?: boolean;
  filterable?: boolean;
  filterKind?: BaseColumnFilterKind;
  filterShowTime?: boolean;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  rowTooltip?: (row: T) => string | null | undefined;
  clickable?: boolean;

  value?: (row: T) => unknown;
  format?: (row: T, value: unknown) => string;
  cellClass?: (row: T) => string;

  numberFormat?: Intl.NumberFormatOptions;
  dateFormat?: Intl.DateTimeFormatOptions;
  badgeClassMap?: Record<string, string>;
  dotClassMap?: Record<string, string>;
  textColorClassMap?: Record<string, string>;
  trendBadWhenUp?: boolean;
  imageSize?: number;
  linkHref?: (row: T) => string;
  linkExternal?: boolean;
  progressMax?: number;
  barClass?: (row: T) => string;
  barValue?: (row: T) => number;
  rowActions?: (BaseRowAction<T> | BaseLegacyRowAction<T>)[];
  heatClassMap?: Record<string, string>;
  heatThresholds?: { max: number; className: string }[];

  /** `kind: 'task-progress'` only. Returns null for rows with nothing in flight — the cell renders empty rather than a stray ring. */
  taskProgress?: (row: T) => BaseTaskProgress | null;
  /** Column width to switch to while any visible row's `taskProgress` is non-null (e.g. `'152px'`) — falls back to `width` once nothing is running. */
  taskProgressWidth?: string;

  abbreviateNumbers?: boolean;

  editable?: boolean;
  editType?: 'text' | 'number' | 'select';
  editOptions?: { label: string; value: string }[];

  summary?: BaseSummaryFn;
  summaryOutOfSpec?: (row: T) => boolean;
  summaryFormat?: (value: number) => string;
}

export interface BaseSortEvent {
  key: string | null;
  direction: 'asc' | 'desc' | null;
}

export interface BasePageEvent {
  page: number;
  pageSize: number;
}

export interface BaseFilterEvent {
  quick: string;
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

export interface BaseHandleActionEvent<T = BaseRow> {
  actionType: RowActionType | string;
  row: T;
}

export interface BaseCheckboxFilterValue {
  selected: string[];
  sort: 'asc' | 'desc' | null;
}

export interface BaseCalendarFilterValue {
  start: Date | null;
  end: Date | null;
  preset?: string | null;
}

export interface BaseRangeFilterValue {
  from: number | null;
  to: number | null;
}

export interface BaseCellEditEvent<T = BaseRow> {
  row: T;
  column: BaseColumnDef<T>;
  value: unknown;
}

export interface BaseScrollEvent {
  position: 'top' | 'mid' | 'bottom';
}

export interface BaseManageColumnsEvent {
  visibleKeys: string[];
  order: string[];
  /** Keys the user pinned left/right from the Manage Columns panel, on top of any column's static `sticky` default. */
  pinned: Record<string, 'left' | 'right'>;
}

/**
 * One row's worth of pending edits, sent to the host in a `saveChanges`
 * batch. `changes` holds only the columns that actually differ from the
 * last server-confirmed snapshot — never the whole row.
 */
export interface BaseRowSaveRequest<T = BaseRow> {
  key: unknown;
  row: T;
  changes: Record<string, unknown>;
}

/** What the host reports back via `BaseTableComponent.reportSaveResult()` once a save settles. */
export interface BaseRowSaveResult {
  key: unknown;
  success: boolean;
  error?: string;
}

/** The four outcomes of `BaseTableComponent.confirmLeave()` — see the "Leaving with work pending" section in the Base README. */
export type BaseLeaveOutcome = 'stay' | 'save-and-leave' | 'keep-draft' | 'discard';

/** One field where a restored draft's value disagrees with the row's current (server) value. */
export interface BaseDraftConflict<T = BaseRow> {
  row: T;
  column: BaseColumnDef<T>;
  draftValue: unknown;
  serverValue: unknown;
}
