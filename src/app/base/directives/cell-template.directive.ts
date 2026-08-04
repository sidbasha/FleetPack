import { Directive, TemplateRef, input } from '@angular/core';
import { BaseColumnDef, BaseRow } from '../models/table.model';

/**
 * Template context available inside a custom cell template:
 *
 * <ng-template baseCell="status" let-row let-value="value" let-col="column" let-i="index">
 *   ...anything: text, numbers, <img>, charts, buttons, other components...
 * </ng-template>
 */
export interface BaseCellContext<T = BaseRow> {
  /** The full row object (let-row). */
  $implicit: T;
  /** Resolved cell value (let-value="value"). */
  value: unknown;
  /** The column definition (let-col="column"). */
  column: BaseColumnDef<T>;
  /** Row index within the current page (let-i="index"). */
  index: number;
}

/**
 * Attach to an <ng-template> inside <base-table> to fully control how one
 * column renders. The directive value is the column key it applies to.
 * A template always wins over the column's built-in `kind`.
 */
@Directive({ selector: 'ng-template[baseCell]', standalone: true })
export class BaseCellDirective<T = BaseRow> {
  /** Column key this template renders. */
  readonly baseCell = input.required<string>();

  constructor(public readonly template: TemplateRef<BaseCellContext<T>>) {}

  static ngTemplateContextGuard<T>(
    _dir: BaseCellDirective<T>,
    ctx: unknown
  ): ctx is BaseCellContext<T> {
    return true;
  }
}

/**
 * Same as `BaseCellDirective`, but for columns of the nested child table shown
 * by `[expandable]`. Declare it inside the outer <base-table> alongside any
 * `baseCell` templates:
 *
 * <ng-template baseChildCell="actions" let-row>
 *   <button (click)="edit(row)">Edit</button>
 * </ng-template>
 *
 * The directive value is a `childColumns` key. `<base-table>` forwards these
 * templates into the nested table it renders per expanded row.
 */
@Directive({ selector: 'ng-template[baseChildCell]', standalone: true })
export class BaseChildCellDirective<T = BaseRow> {
  /** childColumns key this template renders. */
  readonly baseChildCell = input.required<string>();

  constructor(public readonly template: TemplateRef<BaseCellContext<T>>) {}

  static ngTemplateContextGuard<T>(
    _dir: BaseChildCellDirective<T>,
    ctx: unknown
  ): ctx is BaseCellContext<T> {
    return true;
  }
}

/**
 * Attach to an <ng-template> inside <base-table> to fully control one column's
 * HEADER content (the label area, before the sort/filter icons). Falls back to
 * plain `{{ column.header }}` text when no template is given for a column.
 *
 * <ng-template baseHeaderCell="status" let-col="column">
 *   <b>{{ col.header }}</b> <span class="text-slate-400">(live)</span>
 * </ng-template>
 */
export interface BaseHeaderCellContext<T = BaseRow> {
  /** The column definition (let-col="column"). */
  column: BaseColumnDef<T>;
}

@Directive({ selector: 'ng-template[baseHeaderCell]', standalone: true })
export class BaseHeaderCellDirective<T = BaseRow> {
  /** Column key this template renders. */
  readonly baseHeaderCell = input.required<string>();

  constructor(public readonly template: TemplateRef<BaseHeaderCellContext<T>>) {}

  static ngTemplateContextGuard<T>(
    _dir: BaseHeaderCellDirective<T>,
    ctx: unknown
  ): ctx is BaseHeaderCellContext<T> {
    return true;
  }
}

/**
 * Attach to an <ng-template> inside <base-table> to fully control how one
 * row-action TYPE renders across every 'row-actions' column, overriding the
 * default icon button for that type (e.g. a richer download-progress widget).
 *
 * <ng-template baseActionTemplate="download" let-row>
 *   <span>{{ row.fileProgress }}%</span>
 * </ng-template>
 */
export interface BaseActionTemplateContext<T = BaseRow> {
  /** The row object (let-row). */
  $implicit: T;
}

@Directive({ selector: 'ng-template[baseActionTemplate]', standalone: true })
export class BaseActionTemplateDirective<T = BaseRow> {
  /** RowActionType (or custom legacy action icon string) this template renders. */
  readonly baseActionTemplate = input.required<string>();

  constructor(public readonly template: TemplateRef<BaseActionTemplateContext<T>>) {}

  static ngTemplateContextGuard<T>(
    _dir: BaseActionTemplateDirective<T>,
    ctx: unknown
  ): ctx is BaseActionTemplateContext<T> {
    return true;
  }
}

/**
 * Attach to an <ng-template> inside <base-table> to render content BELOW the
 * nested child table shown by [expandable] (e.g. "Add Service Activity" /
 * "Submit" buttons). Presence-only — one instance covers every expanded row.
 *
 * <ng-template baseChildFooter let-row>
 *   <button (click)="addActivity(row)">Add Service Activity</button>
 * </ng-template>
 */
export interface BaseChildFooterContext<T = BaseRow> {
  /** The row object (let-row). */
  $implicit: T;
}

@Directive({ selector: 'ng-template[baseChildFooter]', standalone: true })
export class BaseChildFooterDirective<T = BaseRow> {
  constructor(public readonly template: TemplateRef<BaseChildFooterContext<T>>) {}

  static ngTemplateContextGuard<T>(
    _dir: BaseChildFooterDirective<T>,
    ctx: unknown
  ): ctx is BaseChildFooterContext<T> {
    return true;
  }
}
