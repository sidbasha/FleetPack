import { Directive, TemplateRef, input } from '@angular/core';
import { BaseColumnDef, BaseRow } from '../models/table.model';

export interface BaseCellContext<T = BaseRow> {
  $implicit: T;
  value: unknown;
  column: BaseColumnDef<T>;
  index: number;
}

/**
 * Attach to an <ng-template> inside <base-table> to fully control how one
 * column renders. The directive value is the column key it applies to.
 * A template always wins over the column's built-in `kind`.
 */
@Directive({ selector: 'ng-template[baseCell]', standalone: true })
export class BaseCellDirective<T = BaseRow> {
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
  readonly baseChildCell = input.required<string>();

  constructor(public readonly template: TemplateRef<BaseCellContext<T>>) {}

  static ngTemplateContextGuard<T>(
    _dir: BaseChildCellDirective<T>,
    ctx: unknown
  ): ctx is BaseCellContext<T> {
    return true;
  }
}

export interface BaseHeaderCellContext<T = BaseRow> {
  column: BaseColumnDef<T>;
}

@Directive({ selector: 'ng-template[baseHeaderCell]', standalone: true })
export class BaseHeaderCellDirective<T = BaseRow> {
  readonly baseHeaderCell = input.required<string>();

  constructor(public readonly template: TemplateRef<BaseHeaderCellContext<T>>) {}

  static ngTemplateContextGuard<T>(
    _dir: BaseHeaderCellDirective<T>,
    ctx: unknown
  ): ctx is BaseHeaderCellContext<T> {
    return true;
  }
}

export interface BaseActionTemplateContext<T = BaseRow> {
  $implicit: T;
}

@Directive({ selector: 'ng-template[baseActionTemplate]', standalone: true })
export class BaseActionTemplateDirective<T = BaseRow> {
  readonly baseActionTemplate = input.required<string>();

  constructor(public readonly template: TemplateRef<BaseActionTemplateContext<T>>) {}

  static ngTemplateContextGuard<T>(
    _dir: BaseActionTemplateDirective<T>,
    ctx: unknown
  ): ctx is BaseActionTemplateContext<T> {
    return true;
  }
}

export interface BaseChildFooterContext<T = BaseRow> {
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
