import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { BaseActionTemplateContext } from '../../directives/cell-template.directive';
import { BaseCellEditEvent, BaseColumnDef, BaseHandleActionEvent, BaseRow, BaseTaskProgress } from '../../models/table.model';
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
  heatClass,
  numberCellClass,
  numberFullText,
  numberText,
  progressBarClass,
  progressBarPct,
  progressLabel,
  ResolvedRowAction,
  resolvedActions,
  sparkData,
  statusTextClass,
  taskRingBackground,
  taskValueClass,
  taskValueLabel,
  textBarPct,
  trendValue
} from '../../utils/table-cell.utils';
import { computeFixedPopupPosition, FixedPopupPosition } from './base-column-filters.components';
import { BaseSparklineComponent, BaseTrendComponent } from '../base-ui.components';
import { BaseTeleportDirective, BaseTooltipDirective } from '../base-overlay.components';

const SAFE_ACTION_TYPES = new Set(['view', 'click', 'copy', 'download', 'run', 'history', 'more']);


@Component({
  selector: 'base-table-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, BaseTrendComponent, BaseSparklineComponent, BaseTeleportDirective, BaseTooltipDirective],
  template: `
    @if (isEditingCell()) {
      <span class="inline-flex items-center gap-1 w-full">
        @switch (column().editType ?? 'text') {
          @case ('number') {
            <input type="number" [value]="value()" (input)="onEdit($event)" (click)="$event.stopPropagation()"
                   class="w-full min-w-0 border border-warning rounded-r-sm px-2 py-1 text-xs bg-neutral-0
                          focus:outline-none focus:ring-1 focus:ring-action-surface" />
          }
          @case ('select') {
            <select [value]="value()" (change)="onEdit($event)" (click)="$event.stopPropagation()"
                    class="w-full min-w-0 border border-warning rounded-r-sm px-2 py-1 text-xs bg-neutral-0">
              @for (o of column().editOptions ?? []; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
            </select>
          }
          @default {
            <input type="text" [value]="display()" (input)="onEdit($event)" (click)="$event.stopPropagation()"
                   class="w-full min-w-0 border border-warning rounded-r-sm px-2 py-1 text-xs bg-neutral-0
                          focus:outline-none focus:ring-1 focus:ring-action-surface" />
          }
        }
        <button type="button" class="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-r-xs
                                      text-neutral-400 hover:text-action hover:bg-neutral-100
                                      disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                [disabled]="!fieldDirty()" [attr.aria-label]="'Revert ' + column().header + ' to ' + revertDisplay()"
                [title]="fieldDirty() ? 'Revert to ' + revertDisplay() : 'Unchanged'"
                (click)="$event.stopPropagation(); revert()">
          <span class="icon-outline" style="font-size:14px;" aria-hidden="true">refresh</span>
        </button>
        <button type="button" class="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-r-xs
                                      text-neutral-400 hover:text-error hover:bg-error-surface"
                [attr.aria-label]="'Clear ' + column().header" title="Clear"
                (click)="$event.stopPropagation(); clear()">
          <span class="icon-outline" style="font-size:14px;" aria-hidden="true">close</span>
        </button>
      </span>
    } @else {
      @switch (column().kind ?? 'text') {
        @case ('number') {
          <span class="font-mono tabular-nums" [class]="numClass()" [baseTooltip]="numTooltip()">{{ display() }}</span>
        }
        @case ('date') {
          <span [class]="extra()">{{ display() }}</span>
        }
        @case ('datetime') {
          <span [class]="extra()">{{ display() }}</span>
        }
        @case ('sno') {
          <span class="text-ink-500 tabular-nums">{{ rowIndex() }}</span>
        }
        @case ('array') {
          <span [class]="extra()">{{ display() }}</span>
        }
        @case ('badge') {
          <span class="text-[10px] font-bold rounded-r-full px-2 py-0.5" [class]="badge()">{{ display() }}</span>
        }
        @case ('dot') {
          <span class="inline-flex items-center gap-1.5" [class]="column().textColorClassMap ? statusClass() : ''">
            @if (dotVisible()) { <i class="inline-block w-2.5 h-2.5 rounded-r-full" [class]="dot()"></i> }
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
            <img [src]="src" [alt]="column().header" class="rounded-r-sm object-cover border border-neutral-200"
                 [style.width.px]="column().imageSize ?? 32" [style.height.px]="column().imageSize ?? 32" loading="lazy" />
          } @else { <span class="text-neutral-300">—</span> }
        }
        @case ('progress') {
          <span class="inline-flex items-center gap-2 w-full">
            <span class="flex-1 h-1.5 rounded-r-full bg-neutral-100 overflow-hidden min-w-12">
              <span class="block h-full rounded-r-full" [class]="barClass()" [style.width.%]="progressPct()"></span>
            </span>
            <span class="text-[10px] font-semibold text-ink-500 tabular-nums">{{ progLabel() }}</span>
          </span>
        }
        @case ('text-bar') {
          <span class="inline-flex flex-col items-start gap-1">
            <span class="font-semibold" [class]="extra()">{{ display() }}</span>
            <span class="h-1 w-16 rounded-r-full bg-neutral-100 overflow-hidden">
              <span class="block h-full rounded-r-full" [class]="barClass()" [style.width.%]="textBarPctVal()"></span>
            </span>
          </span>
        }
        @case ('sparkline') {
          <base-sparkline [data]="spark()" />
        }
        @case ('link') {
          <a class="text-action hover:text-action-hover hover:underline font-medium"
             [href]="linkHref()" [target]="linkTarget()" rel="noopener"
             (click)="$event.stopPropagation()">{{ display() }}</a>
        }
        @case ('heat-cell') {
          <span class="block w-full text-center rounded-r-sm px-2 py-1 text-[11px] font-bold tabular-nums" [class]="heat()">{{ display() }}</span>
        }
        @case ('task-progress') {
          @if (taskProgress(); as tp) {
            <span class="inline-flex items-center gap-1.5 min-w-0" [attr.aria-label]="taskLabel() + ' ' + tp.label">
              <span class="relative inline-flex items-center justify-center w-4 h-4 rounded-full shrink-0" [style.background]="taskRing()">
                <span class="absolute inset-0.75 rounded-full bg-neutral-0"></span>
              </span>
              <span class="text-[11px] font-semibold tabular-nums shrink-0" [class]="taskClass()">{{ taskLabel() }}</span>
              <span class="text-[11px] text-ink-500 truncate">{{ tp.label }}</span>
            </span>
          }
        }
        @case ('row-actions') {
          <span class="inline-flex items-center gap-3 justify-end w-full">
            @for (a of shownActions(); track $index) {
              @if (a.template; as atpl) {
                <ng-container *ngTemplateOutlet="atpl; context: { $implicit: row() }" />
              } @else if (a.type === 'download' && dlProgress() !== null) {
                <span class="text-[10px] font-semibold text-action tabular-nums">{{ dlProgress() }}%</span>
              } @else if (a.variant === 'button') {
                <button type="button" class="btn-ghost border border-neutral-200 py-1! px-2.5! text-[11px]
                                              disabled:opacity-30 disabled:cursor-not-allowed"
                        [disabled]="a.disabled"
                        [attr.aria-label]="a.title ?? null" [title]="a.title ?? ''"
                        (click)="$event.stopPropagation(); runAction(a)">{{ a.icon }}</button>
              } @else {
                <button type="button" class="text-neutral-400 hover:text-action disabled:opacity-30 disabled:cursor-not-allowed"
                        [disabled]="a.disabled"
                        [attr.aria-label]="a.title ?? null" [title]="a.title ?? ''"
                        (click)="$event.stopPropagation(); runAction(a)">{{ a.icon }}</button>
              }
            }
            @if (overflowActions().length > 0) {
              <span class="relative inline-block">
                <button type="button" class="inline-flex items-center justify-center w-5 h-5 rounded-r-xs
                                              text-neutral-400 hover:text-action hover:bg-neutral-100 transition-colors"
                        aria-label="More actions" (click)="$event.stopPropagation(); toggleOverflow()">⋯</button>
                @if (overflowOpen()) {
                  <span baseTeleport #panel class="fixed z-30 w-44 bg-neutral-0 border border-neutral-200 rounded-r-lg shadow-lg py-1 text-left block"
                        [style.top.px]="overflowPos().top" [style.left.px]="overflowPos().left" [style.right.px]="overflowPos().right">
                    @for (a of overflowActions(); track a.type) {
                      <button type="button" class="w-full text-left px-3 py-1.5 text-[11px] text-ink-600 hover:bg-neutral-50
                                                    disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                              [disabled]="a.disabled" (click)="$event.stopPropagation(); runAction(a); closeOverflow()">
                        <span class="w-4 text-center">{{ a.icon }}</span>{{ a.title ?? a.type }}
                      </button>
                    }
                  </span>
                }
              </span>
            }
          </span>
        }
        @default {
          <span [class]="extra()">{{ display() }}</span>
        }
      }
    }
  `
})
export class BaseTableCellComponent<T = BaseRow> {
  readonly column = input.required<BaseColumnDef<T>>();
  readonly row = input.required<T>();
  readonly rowIndex = input(0);
  readonly actionTemplateFor = input<((type: string) => TemplateRef<BaseActionTemplateContext<T>> | null) | null>(null);
  readonly maxVisible = input(0);
  readOnly = input(false);
  readonly editingRow = input(false);
  /** Whether this specific field currently differs from its last-saved value — gates the Revert button and its label. */
  readonly fieldDirty = input(false);
  /** The value Revert would restore — shown in its label/tooltip so the difference is readable before it's pressed. */
  readonly revertValue = input<unknown>(undefined);
  /** True while this row's pending changes are being saved — freezes the cell to read-only for the duration, per the edit-state machine. */
  readonly saving = input(false);
  /**
   * `kind: 'task-progress'` only — passed as an explicit input (computed
   * fresh by the parent's template every check, like `editingRow`/
   * `fieldDirty` above) rather than read from `column().taskProgress?.(row())`
   * internally. A host commonly clears a task by mutating `row.task` in
   * place from a *different* column's row action; since that leaves this
   * cell's own `row`/`column` inputs referentially unchanged, OnPush would
   * skip re-checking it unless the changed value arrives via its own input.
   */
  readonly taskProgress = input<BaseTaskProgress | null>(null);

  readonly actionRun = output<BaseHandleActionEvent<T>>();
  readonly cellEdit = output<BaseCellEditEvent<T>>();

  protected readonly value = computed(() => cellValue(this.column(), this.row()));
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
  protected readonly numClass = computed(() => numberCellClass(this.column(), this.row()));
  protected readonly numTooltip = computed(() => this.column().abbreviateNumbers ? numberFullText(this.column(), this.row()) : '');
  protected readonly badge = computed(() => badgeClass(this.column(), this.row()));
  protected readonly dotVisible = computed(() => hasDot(this.column(), this.row()));
  protected readonly dot = computed(() => dotClass(this.column(), this.row()));
  protected readonly statusClass = computed(() => statusTextClass(this.column(), this.row()));
  protected readonly heat = computed(() => heatClass(this.column(), this.row()));
  protected readonly taskRing = computed(() => {
    const tp = this.taskProgress();
    return tp ? taskRingBackground(tp) : '';
  });
  protected readonly taskLabel = computed(() => {
    const tp = this.taskProgress();
    return tp ? taskValueLabel(tp) : '';
  });
  protected readonly taskClass = computed(() => {
    const tp = this.taskProgress();
    return tp ? taskValueClass(tp) : '';
  });
  protected readonly trend = computed(() => trendValue(this.column(), this.row()));
  protected readonly progressPct = computed(() => progressBarPct(this.column(), this.row()));
  protected readonly textBarPctVal = computed(() => textBarPct(this.column(), this.row()));
  protected readonly barClass = computed(() => progressBarClass(this.column(), this.row()));
  protected readonly progLabel = computed(() => progressLabel(this.column(), this.row()));
  protected readonly spark = computed(() => sparkData(this.column(), this.row()));
  protected readonly isEditingCell = computed(() => this.editingRow() && !this.saving() && !!this.column().editable);
  protected readonly revertDisplay = computed(() => {
    const v = this.revertValue();
    if (v === null || v === undefined || v === '') return '(empty)';
    const c = this.column();
    return c.editType === 'select' ? (c.editOptions ?? []).find(o => o.value === v)?.label ?? String(v) : String(v);
  });

  // Plain methods, not computed() — isHidden/isDisabled on a row action
  // read mutable flags (isEditing, etc.) that hosts commonly toggle by
  // mutating the row object in place (see the row-action examples in the
  // dev playground). A computed() keyed on `row()`'s reference would only
  // re-run resolvedActions() when the row *object* changes, not when one
  // of its properties is mutated — exactly the bug that made "Exit edit"
  // appear to do nothing (it flips `isEditing` in place, no new object).
  private rawActions(): ResolvedRowAction<T>[] {
    return resolvedActions(this.column(), this.row());
  }
  protected actionsWithTemplate() {
    const resolve = this.actionTemplateFor();
    const withTpl = this.rawActions().map(a => ({ ...a, template: resolve ? resolve(a.type) : null }));
    return this.readOnly() ? withTpl.filter(a => SAFE_ACTION_TYPES.has(a.type)) : withTpl;
  }
  protected shownActions() {
    const all = this.actionsWithTemplate(), max = this.maxVisible();
    return max > 0 && all.length > max ? all.slice(0, max) : all;
  }
  protected overflowActions() {
    const all = this.actionsWithTemplate(), max = this.maxVisible();
    return max > 0 && all.length > max ? all.slice(max) : [];
  }
  protected readonly dlProgress = computed(() => downloadProgress(this.row()));
  protected readonly linkHref = computed(() => this.column().linkHref?.(this.row()) ?? '#');
  protected readonly linkTarget = computed(() => (this.column().linkExternal ?? true) ? '_blank' : '_self');

  protected readonly overflowOpen = signal(false);
  protected readonly overflowPos = signal<FixedPopupPosition>({ top: 0 });
  private readonly host = inject(ElementRef<HTMLElement>);
  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;

  private isInside(target: Node): boolean {
    return this.host.nativeElement.contains(target) || (this.panelRef?.nativeElement.contains(target) ?? false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.overflowOpen() && !this.isInside(ev.target as Node)) this.closeOverflow();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.overflowOpen()) this.closeOverflow();
  }

  toggleOverflow(): void {
    if (this.overflowOpen()) { this.closeOverflow(); return; }
    this.overflowPos.set(computeFixedPopupPosition(this.host.nativeElement, 'right'));
    this.overflowOpen.set(true);
  }

  closeOverflow(): void {
    this.overflowOpen.set(false);
  }

  protected runAction(a: ResolvedRowAction<T>): void {
    a.run(this.row());
    this.actionRun.emit({ actionType: a.type, row: this.row() });
  }

  protected onEdit(ev: Event): void {
    const target = ev.target as HTMLInputElement | HTMLSelectElement;
    const raw = target.value;
    const value = this.column().editType === 'number' ? (raw === '' ? null : Number(raw)) : raw;
    this.cellEdit.emit({ row: this.row(), column: this.column(), value });
  }

  /** Restores this field to `revertValue()` — an edit like any other, routed through the same `cellEdit` channel the host already handles. Row stays in edit mode. */
  protected revert(): void {
    this.cellEdit.emit({ row: this.row(), column: this.column(), value: this.revertValue() });
  }

  /** Empties this field so a new value can be typed — a change, not an undo, so it dirties the row rather than cleaning it. */
  protected clear(): void {
    this.cellEdit.emit({ row: this.row(), column: this.column(), value: this.column().editType === 'number' ? null : '' });
  }
}
