
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
  | 'template';

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
}
