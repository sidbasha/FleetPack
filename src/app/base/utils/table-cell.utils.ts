import { BaseColumnDef, BaseLegacyRowAction, BaseRow, BaseRowAction, BaseSummaryFn, ROW_ACTION_ICON } from '../models/table.model';


export interface ResolvedRowAction<T> {
  type: string;
  icon: string;
  title?: string;
  variant: 'icon' | 'button';
  disabled: boolean;
  run: (row: T) => void;
}

export function cellValue<T>(c: BaseColumnDef<T>, row: T): unknown {
  return c.value ? c.value(row) : (row as BaseRow)[c.key];
}

export function cellText<T>(c: BaseColumnDef<T>, row: T): string {
  const v = cellValue(c, row);
  if (c.format) return c.format(row, v);
  return v === null || v === undefined || v === '' ? '—' : String(v);
}

export function rowTooltipText<T>(c: BaseColumnDef<T>, row: T): string {
  return c.rowTooltip ? (c.rowTooltip(row) ?? '') : '';
}

export function numberText<T>(c: BaseColumnDef<T>, row: T): string {
  const v = cellValue(c, row);
  if (c.format) return c.format(row, v);
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  return c.abbreviateNumbers ? abbreviateNumber(n) : new Intl.NumberFormat(undefined, c.numberFormat).format(n);
}

export function numberFullText<T>(c: BaseColumnDef<T>, row: T): string {
  const v = cellValue(c, row);
  if (v === null || v === undefined || v === '') return '';
  return new Intl.NumberFormat(undefined, c.numberFormat).format(Number(v));
}

export function abbreviateNumber(n: number): string {
  if (!isFinite(n)) return String(n);
  const abs = Math.abs(n);
  const [div, suffix] =
    abs >= 1_000_000_000 ? [1_000_000_000, 'B'] :
    abs >= 1_000_000 ? [1_000_000, 'M'] :
    abs >= 1_000 ? [1_000, 'K'] : [1, ''];
  if (div === 1) return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
  return `${(n / div).toFixed(1).replace(/\.0$/, '')}${suffix}`;
}

export function numberCellClass<T>(c: BaseColumnDef<T>, row: T): string {
  const base = extraClass(c, row);
  const v = Number(cellValue(c, row));
  return !isNaN(v) && v < 0 ? `${base} text-error`.trim() : base;
}

export function dateText<T>(c: BaseColumnDef<T>, row: T): string {
  const v = cellValue(c, row);
  if (c.format) return c.format(row, v);
  if (!v) return '—';
  const d = v instanceof Date ? v : new Date(v as string | number);
  return isNaN(d.getTime())
    ? String(v)
    : new Intl.DateTimeFormat(undefined, c.dateFormat ?? { dateStyle: 'medium' }).format(d);
}

export function dateTimeText<T>(c: BaseColumnDef<T>, row: T): string {
  const v = cellValue(c, row);
  if (c.format) return c.format(row, v);
  if (!v) return '—';
  const d = v instanceof Date ? v : new Date(v as string | number);
  return isNaN(d.getTime())
    ? String(v)
    : new Intl.DateTimeFormat(undefined, c.dateFormat ?? { dateStyle: 'medium', timeStyle: 'short' }).format(d);
}

export function arrayText<T>(c: BaseColumnDef<T>, row: T): string {
  const v = cellValue(c, row);
  if (c.format) return c.format(row, v);
  if (!Array.isArray(v) || v.length === 0) return '—';
  return [...new Set(v.map(x => String(x)))].join(', ');
}

export function extraClass<T>(c: BaseColumnDef<T>, row: T): string {
  const base = c.cellClass ? c.cellClass(row) : '';
  return c.clickable ? `${base} font-semibold text-indigo-700 cursor-pointer`.trim() : base;
}

export function badgeClass<T>(c: BaseColumnDef<T>, row: T): string {
  return c.badgeClassMap?.[String(cellValue(c, row))] ?? 'bg-slate-100 text-slate-500';
}

export function hasDot<T>(c: BaseColumnDef<T>, row: T): boolean {
  return !!c.dotClassMap?.[String(cellValue(c, row))];
}

export function dotClass<T>(c: BaseColumnDef<T>, row: T): string {
  return c.dotClassMap?.[String(cellValue(c, row))] ?? 'bg-slate-300';
}

export function statusTextClass<T>(c: BaseColumnDef<T>, row: T): string {
  return c.textColorClassMap?.[String(cellValue(c, row))] ?? 'text-slate-600';
}

export function trendValue<T>(c: BaseColumnDef<T>, row: T): number | null {
  const v = cellValue(c, row);
  return v === null || v === undefined ? null : Number(v);
}

function barPct(v: number, max: number): number {
  if (isNaN(v) || v <= 0) return 0;
  const pct = Math.min(100, (v / max) * 100);
  return Math.max(Math.round(pct), 4);
}

export function progressValue<T>(c: BaseColumnDef<T>, row: T): number {
  const v = Number(cellValue(c, row));
  return isNaN(v) ? 0 : Math.min(100, Math.max(0, Math.round(v)));
}

export function progressBarPct<T>(c: BaseColumnDef<T>, row: T): number {
  return barPct(Number(cellValue(c, row)), c.progressMax ?? 100);
}

export function textBarPct<T>(c: BaseColumnDef<T>, row: T): number {
  const raw = c.barValue ? c.barValue(row) : cellValue(c, row);
  return barPct(Number(raw), c.progressMax ?? 100);
}

export function progressBarClass<T>(c: BaseColumnDef<T>, row: T): string {
  return c.barClass ? c.barClass(row) : 'bg-indigo-500';
}

export function progressLabel<T>(c: BaseColumnDef<T>, row: T): string {
  return c.format ? cellText(c, row) : `${progressValue(c, row)}%`;
}

export function sparkData<T>(c: BaseColumnDef<T>, row: T): number[] {
  const v = cellValue(c, row);
  return Array.isArray(v) ? (v as number[]) : [];
}

export function downloadProgress<T>(row: T): number | null {
  const p = (row as BaseRow).fileProgress;
  return typeof p === 'number' && p > 0 ? Math.round(p) : null;
}

export function heatClass<T>(c: BaseColumnDef<T>, row: T): string {
  return c.heatClassMap?.[String(cellValue(c, row))] ?? 'bg-neutral-100 text-ink-500';
}

function summaryNumbers<T>(c: BaseColumnDef<T>, rows: T[]): number[] {
  return rows
    .map(r => Number(cellValue(c, r)))
    .filter(n => !isNaN(n));
}

export function computeSummary<T>(c: BaseColumnDef<T>, rows: T[]): number | null {
  const fn = c.summary;
  if (!fn || fn === 'none') return null;
  if (fn === 'outOfSpec') return c.summaryOutOfSpec ? rows.filter(r => c.summaryOutOfSpec!(r)).length : null;
  if (fn === 'count') return rows.length;
  const nums = summaryNumbers(c, rows);
  if (nums.length === 0) return null;
  switch (fn) {
    case 'total': return nums.reduce((a, b) => a + b, 0);
    case 'mean': return nums.reduce((a, b) => a + b, 0) / nums.length;
    case 'min': return Math.min(...nums);
    case 'max': return Math.max(...nums);
    case 'median': {
      const sorted = [...nums].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
  }
}

export const SUMMARY_LABEL: Record<BaseSummaryFn, string> = {
  total: 'Total', mean: 'Mean', median: 'Median', min: 'Min', max: 'Max',
  count: 'Count', outOfSpec: 'Out of spec', none: ''
};

export function formatSummary<T>(c: BaseColumnDef<T>, value: number): string {
  if (c.summaryFormat) return c.summaryFormat(value);
  return new Intl.NumberFormat(undefined, c.summary === 'outOfSpec' || c.summary === 'count'
    ? { maximumFractionDigits: 0 }
    : (c.numberFormat ?? { maximumFractionDigits: 1 })
  ).format(value);
}

function isTypedAction<T>(a: BaseRowAction<T> | BaseLegacyRowAction<T>): a is BaseRowAction<T> {
  return 'type' in a;
}

export function resolvedActions<T>(c: BaseColumnDef<T>, row: T): ResolvedRowAction<T>[] {
  return (c.rowActions ?? [])
    .filter(a => !(isTypedAction(a) && a.isHidden?.(row)))
    .map(a => isTypedAction(a)
      ? {
          type: a.type as string,
          icon: a.icon ?? ROW_ACTION_ICON[a.type],
          title: a.title,
          variant: a.variant ?? 'icon',
          disabled: a.isDisabled?.(row) ?? false,
          run: a.run
        }
      : { type: a.icon, icon: a.icon, title: a.title, variant: a.variant ?? 'icon', disabled: false, run: a.run });
}
