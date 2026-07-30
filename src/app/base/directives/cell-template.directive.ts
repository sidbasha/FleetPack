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
