import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, computed, input, output } from '@angular/core';
import { BaseActionTemplateContext } from '../directives/cell-template.directive';
import { BaseColumnDef, BaseHandleActionEvent, BaseRow } from '../models/table.model';
import {
  arrayText,
  badgeClass,
  cellText,
  cellValue,
  dateText,
  dateTimeText,
  dotClass,
  downloadProgress,
  extraClass,
  hasDot,
  numberText,
  progressBarClass,
  progressBarPct,
  progressLabel,
  ResolvedRowAction,
  resolvedActions,
  sparkData,
  statusTextClass,
  textBarPct,
  trendValue
} from '../utils/table-cell.utils';
import { BaseSparklineComponent, BaseTrendComponent } from './base-ui.components';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * <base-table-cell> · Renders one <base-table> cell for its column's built-in
 * `kind` (number, date, badge, dot, trend, image, progress, sparkline, link,
 * row-actions, …). Used whenever the column has no custom `baseCell` template
 * — that override still wins and is resolved by the host table, not here.
 *
 * All rendering is driven purely by `[column]` + `[row]`, i.e. by the props
 * already on `BaseColumnDef` (kind, numberFormat, badgeClassMap, …) — adding
 * a new column feature means adding a prop there and a case here, nothing else.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'base-table-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, BaseTrendComponent, BaseSparklineComponent],
  template: `
    @switch (column().kind ?? 'text') {
      @case ('number') {
        <span class="font-mono tabular-nums" [class]="extra()">{{ display() }}</span>
      }
      @case ('date') {
        <span [class]="extra()">{{ display() }}</span>
      }
      @case ('datetime') {
        <span [class]="extra()">{{ display() }}</span>
      }
      @case ('sno') {
        <span class="text-slate-500 tabular-nums">{{ rowIndex() }}</span>
      }
      @case ('array') {
        <span [class]="extra()">{{ display() }}</span>
      }
      @case ('badge') {
        <span class="text-[10px] font-bold rounded-full px-2 py-0.5" [class]="badge()">{{ display() }}</span>
      }
      @case ('dot') {
        <span class="inline-flex items-center gap-1.5">
          @if (dotVisible()) { <i class="inline-block w-2.5 h-2.5 rounded-full" [class]="dot()"></i> }
          {{ display() }}
        </span>
      }
      @case ('status-text') {
        <span [class]="statusClass()">{{ display() }}</span>
      }
      @case ('trend') {
        <base-trend [value]="trend()" [badWhenUp]="column().trendBadWhenUp ?? false" />
      }
      @case ('image') {
        @if (value(); as src) {
          <img [src]="src" [alt]="column().header" class="rounded-md object-cover border border-slate-200"
               [style.width.px]="column().imageSize ?? 32" [style.height.px]="column().imageSize ?? 32" loading="lazy" />
        } @else { <span class="text-slate-300">—</span> }
      }
      @case ('progress') {
        <span class="inline-flex items-center gap-2 w-full">
          <span class="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden min-w-12">
            <span class="block h-full rounded-full" [class]="barClass()" [style.width.%]="progressPct()"></span>
          </span>
          <span class="text-[10px] font-semibold text-slate-500 tabular-nums">{{ progLabel() }}</span>
        </span>
      }
      @case ('text-bar') {
        <span class="inline-flex flex-col items-start gap-1">
          <span class="font-semibold" [class]="extra()">{{ display() }}</span>
          <span class="h-1 w-16 rounded-full bg-slate-100 overflow-hidden">
            <span class="block h-full rounded-full" [class]="barClass()" [style.width.%]="textBarPctVal()"></span>
          </span>
        </span>
      }
      @case ('sparkline') {
        <base-sparkline [data]="spark()" />
      }
      @case ('link') {
        <a class="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
           [href]="linkHref()" [target]="linkTarget()" rel="noopener"
           (click)="$event.stopPropagation()">{{ display() }}</a>
      }
      @case ('row-actions') {
        <span class="inline-flex items-center gap-3 justify-end w-full">
          @for (a of actionsWithTemplate(); track $index) {
            @if (a.template; as atpl) {
              <ng-container *ngTemplateOutlet="atpl; context: { $implicit: row() }" />
            } @else if (a.type === 'download' && dlProgress() !== null) {
              <span class="text-[10px] font-semibold text-indigo-600 tabular-nums">{{ dlProgress() }}%</span>
            } @else if (a.variant === 'button') {
              <button type="button" class="btn-ghost border border-slate-200 py-1! px-2.5! text-[11px]
                                            disabled:opacity-30 disabled:cursor-not-allowed"
                      [disabled]="a.disabled"
                      [attr.aria-label]="a.title ?? null" [title]="a.title ?? ''"
                      (click)="$event.stopPropagation(); runAction(a)">{{ a.icon }}</button>
            } @else {
              <button type="button" class="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      [disabled]="a.disabled"
                      [attr.aria-label]="a.title ?? null" [title]="a.title ?? ''"
                      (click)="$event.stopPropagation(); runAction(a)">{{ a.icon }}</button>
            }
          }
        </span>
      }
      @default {
        <span [class]="extra()">{{ display() }}</span>
      }
    }
  `
})
export class BaseTableCellComponent<T = BaseRow> {
  readonly column = input.required<BaseColumnDef<T>>();
  readonly row = input.required<T>();
  /** Pre-resolved, page-aware row number for kind 'sno' (the table owns pagination state). */
  readonly rowIndex = input(0);
  /** Resolves a `baseActionTemplate` override for a row-action type, from templates projected into the host table. */
  readonly actionTemplateFor = input<((type: string) => TemplateRef<BaseActionTemplateContext<T>> | null) | null>(null);

  /** Fired whenever a row action (typed or legacy) runs, in addition to its own `run(row)` callback. */
  readonly actionRun = output<BaseHandleActionEvent<T>>();

  protected readonly value = computed(() => cellValue(this.column(), this.row()));
  /** Display text for kinds that render `{{ display() }}` verbatim — dispatches to each kind's own formatter (Intl number/date, deduped array, …), falling back to plain `cellText`. */
  protected readonly display = computed(() => {
    const c = this.column(), row = this.row();
    switch (c.kind) {
      case 'number': return numberText(c, row);
      case 'date': return dateText(c, row);
      case 'datetime': return dateTimeText(c, row);
      case 'array': return arrayText(c, row);
      default: return cellText(c, row);
    }
  });
  protected readonly extra = computed(() => extraClass(this.column(), this.row()));
  protected readonly badge = computed(() => badgeClass(this.column(), this.row()));
  protected readonly dotVisible = computed(() => hasDot(this.column(), this.row()));
  protected readonly dot = computed(() => dotClass(this.column(), this.row()));
  protected readonly statusClass = computed(() => statusTextClass(this.column(), this.row()));
  protected readonly trend = computed(() => trendValue(this.column(), this.row()));
  protected readonly progressPct = computed(() => progressBarPct(this.column(), this.row()));
  protected readonly textBarPctVal = computed(() => textBarPct(this.column(), this.row()));
  protected readonly barClass = computed(() => progressBarClass(this.column(), this.row()));
  protected readonly progLabel = computed(() => progressLabel(this.column(), this.row()));
  protected readonly spark = computed(() => sparkData(this.column(), this.row()));
  protected readonly actions = computed<ResolvedRowAction<T>[]>(() => resolvedActions(this.column(), this.row()));
  /** Each action paired with its `baseActionTemplate` override (if any) — resolved here so the template
   *  never has to conditionally invoke the (possibly null) `actionTemplateFor` function directly. */
  protected readonly actionsWithTemplate = computed(() => {
    const resolve = this.actionTemplateFor();
    return this.actions().map(a => ({ ...a, template: resolve ? resolve(a.type) : null }));
  });
  protected readonly dlProgress = computed(() => downloadProgress(this.row()));
  protected readonly linkHref = computed(() => this.column().linkHref?.(this.row()) ?? '#');
  protected readonly linkTarget = computed(() => (this.column().linkExternal ?? true) ? '_blank' : '_self');

  protected runAction(a: ResolvedRowAction<T>): void {
    a.run(this.row());
    this.actionRun.emit({ actionType: a.type, row: this.row() });
  }
}
