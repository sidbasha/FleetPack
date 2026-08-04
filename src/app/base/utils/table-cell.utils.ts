import { BaseColumnDef, BaseLegacyRowAction, BaseRow, BaseRowAction, ROW_ACTION_ICON } from '../models/table.model';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure (column, row) → value/text/class formatters for <base-table> cells.
 * Shared by BaseTableComponent (filtering/sorting/search need the raw value
 * and display text) and BaseTableCellComponent (rendering a single cell) so
 * neither owns its own copy of this logic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Resolved row action ready to render — icon/variant/disabled state settled, typed or legacy alike. */
export interface ResolvedRowAction<T> {
  /** RowActionType for typed actions, or the icon string itself for legacy actions. */
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
  return new Intl.NumberFormat(undefined, c.numberFormat).format(Number(v));
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

/** Adds bold/indigo/pointer styling when the column is `clickable`, on top of any `cellClass`. */
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

/**
 * Bar width as a % of `progressMax` (defaults to 100, i.e. the raw value is
 * already 0–100). Any positive value gets a minimum visible sliver — on a
 * skewed dataset (one dominant value, several tiny ones) a strict linear
 * scale would render the small rows as an invisible 0px bar.
 */
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

/** Same scaling as `progressBarPct`, but reads `barValue` (kind 'text-bar') instead of the cell's own value. */
export function textBarPct<T>(c: BaseColumnDef<T>, row: T): number {
  const raw = c.barValue ? c.barValue(row) : cellValue(c, row);
  return barPct(Number(raw), c.progressMax ?? 100);
}

export function progressBarClass<T>(c: BaseColumnDef<T>, row: T): string {
  return c.barClass ? c.barClass(row) : 'bg-indigo-500';
}

/** Formatted value when `format` is given (e.g. "2.15"), else the rounded 0–100 value. */
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
