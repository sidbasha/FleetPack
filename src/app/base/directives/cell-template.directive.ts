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
