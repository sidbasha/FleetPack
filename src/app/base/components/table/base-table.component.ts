import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import {
  BaseActionTemplateDirective,
  BaseCellDirective,
  BaseChildCellDirective,
  BaseChildFooterDirective,
  BaseHeaderCellDirective
} from '../../directives/cell-template.directive';
import {
  AdditionalHeaderGroup,
  BaseCalendarFilterValue,
  BaseCellClickEvent,
  BaseCellEditEvent,
  BaseCheckboxFilterValue,
  BaseColumnDef,
  BaseFilterEvent,
  BaseFilterOption,
  BaseHandleActionEvent,
  BaseManageColumnsEvent,
  BasePageEvent,
  BaseRangeFilterValue,
  BaseRow,
  BaseRowClickEvent,
  BaseScrollEvent,
  BaseSortEvent
} from '../../models/table.model';
import {
  cellText as getCellText,
  cellValue as getCellValue,
  computeSummary,
  formatSummary,
  rowTooltipText as getRowTooltipText,
  SUMMARY_LABEL
} from '../../utils/table-cell.utils';
import { BaseCalendarFilterComponent, BaseCheckboxFilterComponent, BaseRangeFilterComponent, calendarFilterLabel, NO_VALUE } from './base-column-filters.components';
import { BaseManageColumnsComponent, ManageColumnItem } from './base-manage-columns.component';
import { BaseSkeletonComponent, BaseTooltipDirective } from '../base-overlay.components';
import { BaseDensityService } from '../../services/base-density.service';
import { BasePaginatorComponent, BaseSearchInputComponent } from './base-paginator.component';
import { BaseTableCellComponent } from './base-table-cell.component';
import { BaseEmptyStateComponent, BaseLoadingComponent } from '../base-ui.components';

interface StickyMeta {
  left?: string;
  right?: string;
}

interface AdditionalHeaderCell {
  group: AdditionalHeaderGroup | null;
  span: number;
  blank: boolean;
  key?: string;
}

interface FilterChip {
  key: string;
  kind: 'checkbox' | 'calendar' | 'range';
  icon: string;
  label: string;
}

const NARROW_VIEWPORT_PX = 720;

const HEADER_GROUP_HUES = ['bg-action-surface/60', 'bg-accent-surface/60', 'bg-success-surface/60', 'bg-warning-surface/60', 'bg-info-surface/60'];

@Component({
  selector: 'base-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--bt-row-pad.px]': 'densityPad()' },
  imports: [
    NgTemplateOutlet,
    BasePaginatorComponent,
    BaseSearchInputComponent,
    BaseTableCellComponent,
    BaseEmptyStateComponent,
    BaseLoadingComponent,
    BaseSkeletonComponent,
    BaseTooltipDirective,
    BaseCheckboxFilterComponent,
    BaseCalendarFilterComponent,
    BaseRangeFilterComponent,
    BaseManageColumnsComponent,
    BaseTableComponent,
    BaseCellDirective
  ],
  styles: [`
    .bt-sticky-th { position: sticky; z-index: 12; background: #f8fafc; }
    .bt-sticky-td { position: sticky; z-index: 1; background: #ffffff; }
    .bt-sticky-left-edge::after, .bt-sticky-right-edge::after {
      content: ''; position: absolute; top: 0; bottom: 0; width: 6px; pointer-events: none;
    }
    .bt-sticky-left-edge::after { left: 100%; background: linear-gradient(to right, rgba(15, 23, 42, .12), transparent); }
    .bt-sticky-right-edge::after { right: 100%; background: linear-gradient(to left, rgba(15, 23, 42, .12), transparent); }
    .bt-head-sticky { position: sticky; top: 0; z-index: 10; }
  `],
  template: `
    @if (tableTitle() || showSearch() || (manageColumns() && !readOnly())) {
      <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-100">
        @if (tableTitle()) {
          <span class="flex items-center gap-2 min-w-0">
            @if (tableIcon()) {
              <span class="icon-outline text-neutral-400 shrink-0" style="font-size:16px;" aria-hidden="true">{{ tableIcon() }}</span>
            }
            <b class="text-[13px] text-ink-900 truncate">{{ tableTitle() }}</b>
            @if (manageColumns() && !readOnly()) {
              <span class="text-[11px] font-medium text-neutral-400 bg-neutral-100 rounded-full px-2.5 py-0.5 shrink-0 whitespace-nowrap">
                {{ manageVisibleKeys().length }} of {{ columns().length }} columns
              </span>
            }
          </span>
        } @else if (showSearch()) {
          <base-search-input [placeholder]="searchPlaceholder()" (search)="onQuickSearch($event)" />
        } @else {
          <span></span>
        }
        <span class="flex items-center gap-3">
          @if (showSearch() && hasActiveFilters() && !readOnly() && !showFilterChips()) {
            <button type="button" class="text-[11px] font-semibold text-action hover:text-action-hover"
                    (click)="clearAllFilters()">Clear All Filters</button>
          }
          @if (showSearch()) {
            <span class="text-[11px] text-neutral-400">{{ filteredTotal() }} record(s)</span>
          }
          @if (manageColumns() && !readOnly()) {
            <base-manage-columns [items]="manageColumnItems()" [visibleKeys]="manageVisibleKeys()"
                                  align="right" (apply)="onManageColumns($event)" />
          }
        </span>
      </div>
    }

    @if (showFilterChips() && !readOnly() && (filterChips().length > 0 || sortState().key)) {
      <div class="flex items-center gap-2 flex-wrap px-4 py-2 border-b border-neutral-100 bg-neutral-0">
        @for (chip of filterChips(); track chip.kind + chip.key) {
          <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-600 bg-neutral-100 rounded-full pl-2.5 pr-1.5 py-1">
            <span class="icon-outline text-neutral-400" style="font-size:13px;" aria-hidden="true">{{ chip.icon }}</span>
            {{ chip.label }}
            <button type="button" class="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600"
                    [attr.aria-label]="'Remove filter ' + chip.label" (click)="removeChip(chip)">✕</button>
          </span>
        }
        @if (sortState().key) {
          <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-action-hover bg-action-surface rounded-full pl-2.5 pr-2.5 py-1">
            <span class="icon-outline" style="font-size:13px;" aria-hidden="true">swap_vert</span>
            Sorted by {{ sortColumnHeader() }}, {{ sortState().direction === 'asc' ? 'ascending' : 'descending' }}
          </span>
        }
        <button type="button" class="text-[11px] font-semibold text-action hover:text-action-hover ml-1"
                (click)="clearAllFilters()">Clear all</button>
      </div>
    }

    @if (hasEditingRows()) {
      <div class="flex items-center gap-2 px-4 py-2 bg-warning-surface border-b border-warning/30 text-[11px] text-warning-hover font-medium">
        <span class="icon-outline" style="font-size:14px;" aria-hidden="true">edit_note</span>
        {{ editingCount() }} row{{ editingCount() === 1 ? '' : 's' }} being edited — save or cancel before sorting, filtering, or changing pages.
      </div>
    } @else if (hasRangeFilterActive()) {
      <div class="flex items-center gap-2 px-4 py-2 bg-action-surface border-b border-action/20 text-[11px] text-action-hover font-medium">
        <span class="icon-outline" style="font-size:14px;" aria-hidden="true">filter_alt</span>
        Range filter active — other filters and sorting are paused until it's cleared.
      </div>
    }

    <div class="overflow-x-auto" [style.maxHeight]="maxHeight() || null" [style.overflowY]="maxHeight() ? 'auto' : null"
         (scroll)="onScroll($event)">
      <table class="w-full" [style.minWidth]="minWidth() || null">
        <thead [class.bt-head-sticky]="stickyHeader()" class="bg-neutral-50">
          @if (additionalHeaderRow(); as groups) {
            <tr>
              @if (expandable()) {
                <th class="table-th" [class.bt-sticky-th]="hasLeftSticky()" [style.left]="leadingStickyLeft('expand')"></th>
              }
              @if (selectable() === 'multiple') {
                <th class="table-th" [class.bt-sticky-th]="hasLeftSticky()" [style.left]="leadingStickyLeft('checkbox')"></th>
              }
              @for (cell of groups; track $index) {
                @if (cell.blank) {
                  <th [class]="blankHeaderClass(cell.key!)"
                      [style.left]="stickyMeta()[cell.key!]?.left ?? null"
                      [style.right]="stickyMeta()[cell.key!]?.right ?? null"></th>
                } @else {
                  <th [class]="'table-th text-center ' + headerGroupClass(cell.group!)" [attr.colspan]="cell.span"
                      [attr.scope]="'colgroup'">{{ cell.group!.displayName }}</th>
                }
              }
            </tr>
          }
          <tr>
            @if (expandable()) {
              <th class="table-th w-8" [class.bt-sticky-th]="hasLeftSticky()" [style.left]="leadingStickyLeft('expand')"></th>
            }
            @if (selectable() === 'multiple') {
              <th class="table-th w-8" [class.bt-sticky-th]="hasLeftSticky()" [style.left]="leadingStickyLeft('checkbox')">
                <input type="checkbox" [checked]="allSelected()" [indeterminate]="someSelected()"
                       [disabled]="isDisableSelectAll() || readOnly()"
                       (change)="toggleAll($event)" aria-label="Select all rows" />
              </th>
            }
            @for (c of visibleColumns(); track c.key; let last = $last) {
              <th class="table-th select-none"
                  [class.text-right]="c.align === 'right'"
                  [class.text-center]="c.align === 'center'"
                  [class.cursor-pointer]="c.sortable && !readOnly() && !interactionBlocked()"
                  [class.cursor-not-allowed]="c.sortable && !readOnly() && interactionBlocked()"
                  [class.bt-sticky-th]="c.sticky"
                  [class]="stickyEdgeClass(c)"
                  [style.width]="c.width ?? null"
                  [style.minWidth]="c.width ?? null"
                  [style.left]="stickyMeta()[c.key]?.left ?? null"
                  [style.right]="stickyMeta()[c.key]?.right ?? null"
                  (click)="c.sortable && !readOnly() && toggleSort(c.key)">
                <span class="inline-flex items-center gap-1.5">
                  @if (headerTemplateFor(c.key); as ht) {
                    <ng-container *ngTemplateOutlet="ht; context: { column: c }" />
                  } @else if (c.tooltip) {
                    <span [baseTooltip]="c.tooltip" [tooltipPosition]="c.tooltipPosition ?? 'top'" class="cursor-help">{{ c.header }}</span>
                  } @else {
                    {{ c.header }}
                  }
                  @if (c.sortable) {
                    <span class="text-[9px]" [class.text-action]="sortState().key === c.key">
                      {{ sortState().key === c.key ? (sortState().direction === 'asc' ? '▲' : '▼') : '↕' }}
                    </span>
                  }
                  @if (c.filterable && !readOnly()) {
                    @switch (c.filterKind) {
                      @case ('checkbox') {
                        <base-checkbox-filter [header]="c.header" [options]="uniqueValuesFor(c)"
                          [selected]="checkboxFilters()[c.key]?.selected ?? []" [sortable]="!!c.sortable"
                          [currentSort]="checkboxFilters()[c.key]?.sort ?? null" [active]="!!checkboxFilters()[c.key]"
                          [align]="last ? 'right' : 'left'"
                          (apply)="onCheckboxFilter(c.key, $event)" (click)="$event.stopPropagation()" />
                      }
                      @case ('calendar') {
                        <base-calendar-filter [header]="c.header" [start]="calendarFilters()[c.key]?.start ?? null"
                          [end]="calendarFilters()[c.key]?.end ?? null" [showTime]="!!c.filterShowTime"
                          [active]="!!calendarFilters()[c.key]" [align]="last ? 'right' : 'left'"
                          (apply)="onCalendarFilter(c.key, $event)" (click)="$event.stopPropagation()" />
                        @if (calendarFilters()[c.key]) {
                          <span class="text-[9px] font-semibold text-action whitespace-nowrap">{{ calendarLabel(c.key) }}</span>
                        }
                      }
                      @case ('range') {
                        <base-range-filter [header]="c.header" [from]="rangeFilters()[c.key]?.from ?? null"
                          [to]="rangeFilters()[c.key]?.to ?? null" [values]="rangeValuesFor(c)" [active]="!!rangeFilters()[c.key]"
                          [align]="last ? 'right' : 'left'"
                          (apply)="onRangeFilter(c.key, $event)" (click)="$event.stopPropagation()" />
                      }
                    }
                  }
                  @if (last && hasActiveFilters() && !readOnly() && !showFilterChips()) {
                    <button type="button" class="text-[9px] text-action hover:text-action-hover" title="Clear all filters"
                            (click)="$event.stopPropagation(); clearAllFilters()">⟲</button>
                  }
                </span>
              </th>
            }
          </tr>

          @if (showFilterRow() && hasTextFilterableColumn() && !readOnly()) {
            <tr class="bg-neutral-0">
              @if (expandable()) { <th class="px-2 py-1.5"></th> }
              @if (selectable() === 'multiple') { <th class="px-2 py-1.5"></th> }
              @for (c of visibleColumns(); track c.key) {
                <th class="px-2 py-1.5 font-normal"
                    [class.bt-sticky-th]="c.sticky"
                    [style.left]="stickyMeta()[c.key]?.left ?? null"
                    [style.right]="stickyMeta()[c.key]?.right ?? null">
                  @if (c.filterable && (!c.filterKind || c.filterKind === 'text')) {
                    <input type="text" [value]="columnFilters()[c.key] || ''"
                           class="w-full border border-neutral-200 rounded-r-sm px-2 py-1 text-[11px] text-ink-600
                                  focus:outline-none focus:ring-1 focus:ring-action-surface"
                           [placeholder]="'Filter ' + c.header"
                           (input)="onColumnFilter(c.key, $event)" />
                  }
                </th>
              }
            </tr>
          }
        </thead>

        <tbody class="divide-y divide-neutral-100" [class.opacity-60]="dimmed()" [class.pointer-events-none]="dimmed()">
          @if (loading() && rows().length === 0) {
            @for (i of skeletonRows(); track i) {
              <tr>
                @if (expandable()) { <td class="table-td w-8"></td> }
                @if (selectable() === 'multiple') { <td class="table-td w-8"></td> }
                @for (c of visibleColumns(); track c.key) {
                  <td class="table-td"><base-skeleton [height]="skeletonHeight()" /></td>
                }
              </tr>
            }
          } @else if (error()) {
            <tr>
              <td [attr.colspan]="colspan()">
                <base-empty-state kind="custom" icon="error" title="Unable to load data"
                                   [hint]="errorMessage()" [actionLabel]="retryLabel()" (action)="retry.emit()" />
              </td>
            </tr>
          } @else {
            @if (enableScroll() && scrollTriggerPosition() === 'top') {
              @if (scrollLoading()) {
                <tr><td [attr.colspan]="colspan()" class="p-2"><base-loading message="Loading more…" /></td></tr>
              } @else if (scrollEnd()) {
                <tr><td [attr.colspan]="colspan()" class="text-center text-[10px] text-neutral-300 py-2">{{ scrollEndMessage() }}</td></tr>
              }
            }
            @for (g of groupedRows(); track g.key) {
              @if (g.key !== null && groupHeaderStyle() === 'plain') {
                <tr class="bg-neutral-50">
                  <td [attr.colspan]="colspan()"
                      class="px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-neutral-400 border-t border-neutral-100">
                    {{ g.key }}
                  </td>
                </tr>
              } @else if (g.key !== null && groupHeaderStyle() === 'light') {
                <tr class="bg-neutral-0">
                  <td [attr.colspan]="groupActionLabel() ? colspan() - 1 : colspan()"
                      class="px-3 py-2.5 text-[13px] font-bold text-ink-700">
                    {{ g.key }}
                    <span class="ml-1.5 text-[10px] font-semibold text-ink-500 bg-neutral-100 rounded-r-full px-2 py-0.5 align-middle">
                      {{ g.rows.length }} {{ groupCountLabel() }}
                    </span>
                  </td>
                  @if (groupActionLabel()) {
                    <td class="px-3 py-2.5 text-right">
                      <button type="button" class="btn-primary" (click)="groupAction.emit(g.key!)">{{ groupActionLabel() }}</button>
                    </td>
                  }
                </tr>
              } @else if (g.key !== null) {
                <tr class="bg-action-surface/60">
                  <td [attr.colspan]="groupActionLabel() ? colspan() - 1 : colspan()"
                      class="px-3 py-1.5 text-[11px] font-bold text-action-hover">
                    {{ g.key }} <span class="font-medium text-action">· {{ g.rows.length }} {{ groupCountLabel() }}</span>
                  </td>
                  @if (groupActionLabel()) {
                    <td class="px-3 py-1.5 text-right">
                      <button type="button" class="text-[11px] font-semibold text-action hover:text-action-hover"
                              (click)="groupAction.emit(g.key!)">{{ groupActionLabel() }}</button>
                    </td>
                  }
                </tr>
              }
            @for (row of g.rows; track rowTrack(row); let i = $index) {
              <tr [class]="rowClassOf(row, i)" [attr.data-row-key]="rowTrack(row)" (click)="onRowClick(row, i)">
                @if (expandable()) {
                  <td class="table-td w-8 text-center" [class.bt-sticky-td]="hasLeftSticky()" [style.left]="leadingStickyLeft('expand')">
                    @if (hasChildren(row)) {
                      <button type="button" class="inline-flex items-center justify-center w-5 h-5 rounded-r-xs hover:bg-neutral-100 text-ink-500"
                              [attr.aria-label]="isExpanded(row) ? 'Collapse row' : 'Expand row'"
                              [attr.aria-expanded]="isExpanded(row)"
                              (click)="$event.stopPropagation(); toggleExpand(row)">
                        <span class="inline-block transition-transform text-[10px]" [class.rotate-90]="isExpanded(row)">▶</span>
                      </button>
                    }
                  </td>
                }
                @if (selectable() === 'multiple') {
                  <td class="table-td w-8" [class.bt-sticky-td]="hasLeftSticky()" [style.left]="leadingStickyLeft('checkbox')">
                    <input type="checkbox" [checked]="isSelected(row)" [disabled]="isRowCheckboxDisabled(row)"
                           [title]="isRowCheckboxDisabled(row) ? checkboxDisabledReason(row) : ''"
                           (click)="$event.stopPropagation()"
                           (change)="toggleRow(row)" aria-label="Select row" />
                  </td>
                }
                @for (c of visibleColumns(); track c.key) {
                  <td class="table-td"
                      [class.text-right]="c.align === 'right'"
                      [class.text-center]="c.align === 'center'"
                      [class.bt-sticky-td]="c.sticky"
                      [class]="stickyEdgeClass(c)"
                      [style.left]="stickyMeta()[c.key]?.left ?? null"
                      [style.right]="stickyMeta()[c.key]?.right ?? null"
                      [baseTooltip]="rowTooltipText(c, row)" [tooltipPosition]="c.tooltipPosition ?? 'top'"
                      (click)="onCellClick(row, c, i, $event)">

                    @if (templateFor(c.key); as tpl) {
                      <ng-container *ngTemplateOutlet="tpl; context: cellContext(row, c, i)" />
                    } @else {
                      <base-table-cell [column]="c" [row]="row" [rowIndex]="snoValue(row)"
                                        [actionTemplateFor]="actionTemplateFor"
                                        [maxVisible]="maxVisibleActions()" [readOnly]="readOnly()"
                                        [editingRow]="isRowEditing(row)"
                                        (actionRun)="handleAction.emit($event)"
                                        (cellEdit)="cellEdit.emit($event)" />
                    }
                  </td>
                }
              </tr>
              @if (expandable() && isExpanded(row) && hasChildren(row)) {
                <tr class="bg-neutral-50/60">
                  <td [attr.colspan]="colspan()" class="p-0">
                    <div class="pl-9 pr-3 py-2 ml-3 border-l-2 border-action-surface">
                      <base-table
                        [columns]="childColumns() ?? []"
                        [rows]="childRowsFor(row)"
                        [trackKey]="trackKey()"
                        [paginate]="childPaginate()"
                        [showSearch]="childShowSearch()"
                        (rowClick)="rowClick.emit($event)"
                        (cellClick)="cellClick.emit($event)">
                        @for (t of childCellTemplates(); track t.baseChildCell()) {
                          <ng-template [baseCell]="t.baseChildCell()" let-childRow let-value="value" let-column="column" let-index="index">
                            <ng-container *ngTemplateOutlet="t.template; context: { $implicit: childRow, value: value, column: column, index: index }" />
                          </ng-template>
                        }
                      </base-table>
                      @if (childFooterTemplate(); as ft) {
                        <div class="mt-2">
                          <ng-container *ngTemplateOutlet="ft; context: { $implicit: row }" />
                        </div>
                      }
                    </div>
                  </td>
                </tr>
              }
            }
            } @empty {
              <tr>
                <td [attr.colspan]="colspan()">
                  <base-empty-state [kind]="computedEmptyKind()" [title]="emptyTitle()" [hint]="emptyHint()"
                                     [actionLabel]="hasActiveFilters() && !readOnly() ? 'Clear all filters' : ''"
                                     (action)="clearAllFilters()" />
                </td>
              </tr>
            }
            @if (enableScroll() && scrollTriggerPosition() === 'bottom') {
              @if (scrollLoading()) {
                <tr><td [attr.colspan]="colspan()" class="p-2"><base-loading message="Loading more…" /></td></tr>
              } @else if (scrollEnd()) {
                <tr><td [attr.colspan]="colspan()" class="text-center text-[10px] text-neutral-300 py-2">{{ scrollEndMessage() }}</td></tr>
              }
            }
          }
        </tbody>

        @if (showSummary()) {
          <tfoot>
            <tr class="bg-neutral-50 border-t-2 border-neutral-200 font-semibold">
              @if (expandable()) { <td class="table-td"></td> }
              @if (selectable() === 'multiple') { <td class="table-td"></td> }
              @for (c of visibleColumns(); track c.key) {
                <td class="table-td text-[11px] text-ink-600"
                    [class.text-right]="c.align === 'right'" [class.text-center]="c.align === 'center'"
                    [class.bt-sticky-td]="c.sticky" [style.left]="stickyMeta()[c.key]?.left ?? null" [style.right]="stickyMeta()[c.key]?.right ?? null">
                  {{ summaryByKey()[c.key] }}
                </td>
              }
            </tr>
          </tfoot>
        }
      </table>
    </div>

    @if (showPaginator()) {
      <div class="px-4 py-3 border-t border-neutral-100">
        <base-paginator
          [page]="page()"
          [pageSize]="pageSize()"
          [total]="filteredTotal()"
          [pageSizeOptions]="pageSizeOptions()"
          [unknownTotal]="unknownTotal()"
          [currentCount]="rows().length"
          [hasNext]="resolvedHasNext()"
          (pageChange)="onPage($event)" />
      </div>
    }
  `
})
export class BaseTableComponent<T = BaseRow> {
  readonly columns = input.required<BaseColumnDef<T>[]>();
  readonly rows = input.required<T[]>();
  readonly trackKey = input('id');

  readonly serverSide = input(false);
  readonly totalItems = input(0);
  readonly hasNextPage = input<boolean | null>(null);

  readonly paginate = input(true);
  readonly initialPageSize = input(10);
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);

  readonly density = input<'compact' | 'standard' | 'comfortable' | null>(null);
  private readonly densityService = inject(BaseDensityService);
  protected readonly effectiveDensity = computed(() => this.density() ?? this.densityService.current());
  protected readonly densityPad = computed(() => ({ compact: 3, standard: 8, comfortable: 14 }[this.effectiveDensity()]));

  readonly tableTitle = input('');
  readonly tableIcon = input('');

  readonly showSearch = input(true);
  readonly searchPlaceholder = input('Search…');
  readonly showFilterRow = input(false);
  readonly showFilterChips = input(true);

  readonly stickyHeader = input(false);
  readonly maxHeight = input('');
  readonly minWidth = input('');

  readonly selectable = input<'none' | 'single' | 'multiple'>('none');
  readonly isDisableSelectAll = input(false);

  readonly striped = input(false);
  readonly groupBy = input<((row: T) => string | null) | null>(null);
  readonly groupActionLabel = input('');
  readonly groupHeaderStyle = input<'accent' | 'plain' | 'light'>('accent');
  readonly groupCountLabel = input('row(s)');
  readonly highlightKey = input<string | null>(null);
  readonly highlightClass = input('bg-action-surface');
  readonly emptyTitle = input('No matching records');
  readonly emptyHint = input('Try adjusting filters or search.');
  readonly emptyKind = input<'no-results' | 'no-access' | 'no-data' | 'out-of-range' | 'not-configured' | 'custom' | null>(null);

  readonly readOnly = input(false);

  readonly loading = input(false);
  readonly loadingRowCount = input(5);
  readonly error = input(false);
  readonly errorMessage = input('');
  readonly retryLabel = input('Retry');
  readonly retry = output<void>();

  readonly additionalHeader = input<AdditionalHeaderGroup[] | null>(null);

  readonly manageColumns = input(false);
  readonly preselectedColumns = input<string[] | null>(null);

  readonly enableScroll = input(false);
  readonly scrollLoading = input(false);
  readonly scrollTriggerPosition = input<'top' | 'bottom'>('bottom');
  readonly scrollEnd = input(false);
  readonly scrollEndMessage = input("You've reached the end");

  readonly expandable = input(false);
  readonly childColumns = input<BaseColumnDef<any>[] | null>(null);
  readonly childRowsOf = input<((row: T) => any[] | null | undefined) | null>(null);
  readonly childPaginate = input(false);
  readonly childShowSearch = input(false);

  readonly maxVisibleActions = input(2);

  readonly editableRows = input(false);
  readonly cellEdit = output<BaseCellEditEvent<T>>();

  readonly showSummary = input(false);

  readonly rowClick = output<BaseRowClickEvent<T>>();
  readonly cellClick = output<BaseCellClickEvent<T>>();
  readonly sortChange = output<BaseSortEvent>();
  readonly pageChange = output<BasePageEvent>();
  readonly filterChange = output<BaseFilterEvent>();
  readonly selectionChange = output<T[]>();
  readonly groupAction = output<string>();
  readonly expandChange = output<{ row: T; expanded: boolean }>();
  readonly handleAction = output<BaseHandleActionEvent<T>>();
  readonly manageColumn = output<string[]>();
  readonly scrollEvent = output<BaseScrollEvent>();

  private readonly cellTemplates = contentChildren(BaseCellDirective<T>);
  private readonly headerTemplates = contentChildren(BaseHeaderCellDirective<T>);
  private readonly actionTemplates = contentChildren(BaseActionTemplateDirective<T>);
  private readonly childFooterTemplates = contentChildren(BaseChildFooterDirective<T>);
  protected readonly childCellTemplates = contentChildren(BaseChildCellDirective<any>);

  readonly sortState = signal<BaseSortEvent>({ key: null, direction: null });
  readonly quickText = signal('');
  readonly columnFilters = signal<Record<string, string>>({});
  readonly checkboxFilters = signal<Record<string, BaseCheckboxFilterValue>>({});
  readonly calendarFilters = signal<Record<string, BaseCalendarFilterValue>>({});
  readonly rangeFilters = signal<Record<string, BaseRangeFilterValue>>({});
  private readonly pageState = signal(1);
  readonly pageSize = signal(10);
  private readonly selected = signal<Map<unknown, T>>(new Map());
  private readonly expandedKeys = signal<Set<unknown>>(new Set());
  private readonly manageOrder = signal<string[] | null>(null);
  private readonly manageHidden = signal<Set<string> | null>(null);
  protected readonly viewportNarrow = signal(false);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private scrollTicking = false;

  constructor() {
    queueMicrotask(() => {
      this.pageSize.set(this.initialPageSize());
      const pre = this.preselectedColumns();
      if (pre) this.manageHidden.set(new Set(this.columns().map(c => c.key).filter(k => !pre.includes(k))));
    });

    effect(() => {
      const key = this.highlightKey();
      if (key == null) return;
      queueMicrotask(() => {
        const root: HTMLElement = this.host.nativeElement;
        const rows: NodeListOf<HTMLElement> = root.querySelectorAll('tr[data-row-key]');
        for (const el of Array.from(rows)) {
          if (el.dataset['rowKey'] === key) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
          }
        }
      });
    });

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mq = window.matchMedia(`(max-width: ${NARROW_VIEWPORT_PX}px)`);
      this.viewportNarrow.set(mq.matches);
      const onChange = (ev: MediaQueryListEvent) => this.viewportNarrow.set(ev.matches);
      mq.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => mq.removeEventListener('change', onChange));
    }
  }

  readonly visibleColumns = computed(() => {
    const order = this.manageOrder();
    const hidden = this.manageHidden();
    let cols = this.columns();
    if (order) {
      const byKey = new Map(cols.map(c => [c.key, c]));
      cols = order.map(k => byKey.get(k)).filter((c): c is BaseColumnDef<T> => !!c);
    }
    cols = cols.filter(c => hidden ? !hidden.has(c.key) : !c.hidden);
    if (this.viewportNarrow()) cols = cols.map(c => c.sticky === 'right' ? { ...c, sticky: undefined } : c);
    const left = cols.filter(c => c.sticky === 'left');
    const mid = cols.filter(c => !c.sticky);
    const right = cols.filter(c => c.sticky === 'right');
    return [...left, ...mid, ...right];
  });

  readonly hasLeftSticky = computed(() => this.visibleColumns().some(c => c.sticky === 'left'));
  readonly hasTextFilterableColumn = computed(() =>
    this.visibleColumns().some(c => c.filterable && (!c.filterKind || c.filterKind === 'text'))
  );

  readonly hasActiveFilters = computed(() =>
    !!this.quickText()
    || Object.keys(this.columnFilters()).length > 0
    || Object.keys(this.checkboxFilters()).length > 0
    || Object.keys(this.calendarFilters()).length > 0
    || Object.keys(this.rangeFilters()).length > 0
  );

  readonly hasRangeFilterActive = computed(() => Object.keys(this.rangeFilters()).length > 0);

  readonly filterChips = computed<FilterChip[]>(() => {
    const cols = this.visibleColumns();
    const headerOf = (key: string) => cols.find(c => c.key === key)?.header ?? key;
    const chips: FilterChip[] = [];

    for (const [key, v] of Object.entries(this.checkboxFilters())) {
      if (!v.selected.length) continue;
      const values = v.selected.map(s => s === NO_VALUE ? '(No value)' : s);
      const shown = values.length > 2 ? `${values.slice(0, 2).join(', ')} +${values.length - 2} more` : values.join(', ');
      chips.push({ key, kind: 'checkbox', icon: 'filter_alt', label: `${headerOf(key)}: ${shown}` });
    }
    for (const [key, v] of Object.entries(this.calendarFilters())) {
      chips.push({ key, kind: 'calendar', icon: 'event', label: `${headerOf(key)}: ${calendarFilterLabel(v)}` });
    }
    for (const [key, v] of Object.entries(this.rangeFilters())) {
      const header = headerOf(key);
      const label = v.from !== null && v.to !== null ? `${header}: ${v.from}–${v.to}`
        : v.from !== null ? `${header}: ≥ ${v.from}`
        : v.to !== null ? `${header}: ≤ ${v.to}`
        : header;
      chips.push({ key, kind: 'range', icon: 'tune', label });
    }
    return chips;
  });

  readonly sortColumnHeader = computed(() =>
    this.visibleColumns().find(c => c.key === this.sortState().key)?.header ?? this.sortState().key ?? ''
  );
  readonly editingCount = computed(() => this.editableRows() ? this.rows().filter(r => (r as BaseRow).isEditing).length : 0);
  readonly hasEditingRows = computed(() => this.editingCount() > 0);
  readonly interactionBlocked = computed(() => this.hasEditingRows() || this.hasRangeFilterActive());

  readonly additionalHeaderRow = computed(() => {
    const groups = this.additionalHeader();
    if (!groups || groups.length === 0) return null;
    const colKeys = this.visibleColumns().map(c => c.key);

    if (!groups.some(g => g.columnIds)) {
      const manual: AdditionalHeaderCell[] = groups.map(group => ({ group, span: group.colSpan ?? 1, blank: false }));
      return manual.length > 0 ? manual : null;
    }

    const startsAt = new Map<string, { group: AdditionalHeaderGroup; span: number }>();
    const consumed = new Set<string>();
    for (const group of groups) {
      const visibleIds = (group.columnIds ?? []).filter(k => colKeys.includes(k));
      if (visibleIds.length === 0) continue;
      const firstKey = colKeys.find(k => visibleIds.includes(k) && !consumed.has(k));
      if (!firstKey) continue;
      startsAt.set(firstKey, { group, span: visibleIds.length });
      for (const k of visibleIds) consumed.add(k);
    }

    const cells: AdditionalHeaderCell[] = [];
    for (const key of colKeys) {
      const anchored = startsAt.get(key);
      if (anchored) { cells.push({ group: anchored.group, span: anchored.span, blank: false }); continue; }
      if (consumed.has(key)) continue;
      cells.push({ group: null, span: 1, blank: true, key });
    }
    return cells.length > 0 ? cells : null;
  });

  readonly manageColumnItems = computed<ManageColumnItem[]>(() => {
    const order = this.manageOrder() ?? this.columns().map(c => c.key);
    const byKey = new Map(this.columns().map(c => [c.key, c]));
    return order
      .map(k => byKey.get(k))
      .filter((c): c is BaseColumnDef<T> => !!c)
      .map(c => ({ key: c.key, header: c.header, locked: !!c.sticky }));
  });

  readonly manageVisibleKeys = computed<string[]>(() => {
    const order = this.manageOrder() ?? this.columns().map(c => c.key);
    const hidden = this.manageHidden();
    const byKey = new Map(this.columns().map(c => [c.key, c]));
    return order.filter(k => hidden ? !hidden.has(k) : !byKey.get(k)?.hidden);
  });

  private readonly leadingOffset = computed(() =>
    (this.expandable() ? 32 : 0) + (this.selectable() === 'multiple' ? 32 : 0)
  );

  readonly stickyMeta = computed<Record<string, StickyMeta>>(() => {
    const meta: Record<string, StickyMeta> = {};
    const cols = this.visibleColumns();
    let left = this.leadingOffset();
    for (const c of cols) {
      if (c.sticky === 'left') {
        meta[c.key] = { left: `${left}px` };
        left += this.widthPx(c);
      }
    }
    let right = 0;
    for (const c of [...cols].reverse()) {
      if (c.sticky === 'right') {
        meta[c.key] = { right: `${right}px` };
        right += this.widthPx(c);
      }
    }
    return meta;
  });

  private rowsExcluding(excludeKey: string | null): T[] {
    if (this.serverSide()) return this.rows();
    const quick = this.quickText().toLowerCase();
    const colF = this.columnFilters();
    const cbF = this.checkboxFilters();
    const calF = this.calendarFilters();
    const rgF = this.rangeFilters();
    const cols = this.visibleColumns();
    return this.rows().filter(row => {
      if (quick) {
        const hit = cols.some(c => this.cellText(c, row).toLowerCase().includes(quick));
        if (!hit) return false;
      }
      for (const [key, text] of Object.entries(colF)) {
        if (!text || key === excludeKey) continue;
        const col = cols.find(c => c.key === key);
        if (col && !this.cellText(col, row).toLowerCase().includes(text.toLowerCase())) return false;
      }
      for (const [key, v] of Object.entries(cbF)) {
        if (!v.selected.length || key === excludeKey) continue;
        const col = cols.find(c => c.key === key);
        if (col) {
          const raw = this.cellValue(col, row);
          const asStr = raw === null || raw === undefined || raw === '' ? NO_VALUE : String(raw);
          if (!v.selected.includes(asStr)) return false;
        }
      }
      for (const [key, v] of Object.entries(calF)) {
        if (key === excludeKey) continue;
        const col = cols.find(c => c.key === key);
        if (!col) continue;
        const raw = this.cellValue(col, row);
        const d = raw instanceof Date ? raw : raw ? new Date(raw as string | number) : null;
        if (!d || isNaN(d.getTime())) return false;
        if (v.start && d < v.start) return false;
        if (v.end && d > v.end) return false;
      }
      for (const [key, v] of Object.entries(rgF)) {
        if (key === excludeKey) continue;
        const col = cols.find(c => c.key === key);
        if (!col) continue;
        const raw = this.cellValue(col, row);
        if (raw === null || raw === undefined || raw === '') return false;
        const n = Number(raw);
        if (isNaN(n)) return false;
        if (v.from !== null && n < v.from) return false;
        if (v.to !== null && n > v.to) return false;
      }
      return true;
    });
  }

  private readonly filteredRows = computed(() => this.rowsExcluding(null));

  private readonly sortedRows = computed(() => {
    if (this.serverSide()) return this.filteredRows();
    const { key, direction } = this.sortState();
    if (!key || !direction) return this.filteredRows();
    const col = this.visibleColumns().find(c => c.key === key);
    if (!col) return this.filteredRows();
    const dir = direction === 'asc' ? 1 : -1;
    return [...this.filteredRows()].sort((a, b) => {
      const va = this.cellValue(col, a);
      const vb = this.cellValue(col, b);
      if (va == null && vb == null) return 0;
      if (va == null) return dir === 1 ? 1 : -1;
      if (vb == null) return dir === 1 ? -1 : 1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb), undefined, { numeric: true }) * dir;
    });
  });

  readonly filteredTotal = computed(() =>
    this.serverSide() ? this.totalItems() : this.filteredRows().length
  );

  readonly unknownTotal = computed(() => this.serverSide() && this.totalItems() <= 0);
  readonly resolvedHasNext = computed(() => {
    const explicit = this.hasNextPage();
    if (explicit !== null) return explicit;
    return this.unknownTotal() ? this.rows().length >= this.pageSize() : this.page() < this.totalPageCount();
  });
  readonly totalPageCount = computed(() => Math.max(1, Math.ceil(this.filteredTotal() / this.pageSize())));
  readonly showPaginator = computed(() => this.paginate() && (this.unknownTotal() || this.totalPageCount() > 1));

  readonly dimmed = computed(() => this.loading() && this.rows().length > 0);
  readonly skeletonRows = computed(() => Array.from({ length: this.loadingRowCount() }, (_, i) => i));
  readonly skeletonHeight = computed(() => ({ compact: '12px', standard: '14px', comfortable: '16px' }[this.effectiveDensity()]));
  readonly computedEmptyKind = computed(() => this.emptyKind() ?? (this.hasActiveFilters() ? 'no-results' : 'no-data'));

  readonly page = computed(() => {
    const count = this.totalPageCount();
    return Math.min(this.pageState(), count);
  });

  readonly pagedRows = computed(() => {
    if (this.serverSide() || !this.paginate()) return this.sortedRows();
    const start = (this.page() - 1) * this.pageSize();
    return this.sortedRows().slice(start, start + this.pageSize());
  });

  readonly groupedRows = computed<{ key: string | null; rows: T[] }[]>(() => {
    const rows = this.pagedRows();
    const gb = this.groupBy();
    if (rows.length === 0) return [];
    if (!gb) return [{ key: null, rows }];
    const map = new Map<string | null, T[]>();
    for (const r of rows) {
      const k = gb(r);
      const arr = map.get(k) ?? [];
      arr.push(r);
      map.set(k, arr);
    }
    return [...map.entries()].map(([key, rws]) => ({ key, rows: rws }));
  });

  private readonly rowIndexMap = computed(() => {
    const map = new Map<unknown, number>();
    let i = 0;
    for (const grp of this.groupedRows()) {
      for (const r of grp.rows) { map.set(this.rowTrack(r), i); i++; }
    }
    return map;
  });

  readonly colspan = computed(() =>
    this.visibleColumns().length
    + (this.selectable() === 'multiple' ? 1 : 0)
    + (this.expandable() ? 1 : 0)
  );

  readonly allSelected = computed(() => {
    const rows = this.pagedRows();
    return rows.length > 0 && rows.every(r => this.selected().has(this.rowTrack(r)));
  });

  readonly someSelected = computed(() => {
    const rows = this.pagedRows();
    return rows.some(r => this.isSelected(r)) && !this.allSelected();
  });

  readonly summaryByKey = computed<Record<string, string>>(() => {
    if (!this.showSummary()) return {};
    const rows = this.filteredRows();
    const out: Record<string, string> = {};
    for (const c of this.visibleColumns()) {
      if (!c.summary || c.summary === 'none') continue;
      const val = computeSummary(c, rows);
      if (val !== null) out[c.key] = `${SUMMARY_LABEL[c.summary]}: ${formatSummary(c, val)}`;
    }
    return out;
  });

  toggleSort(key: string): void {
    if (this.interactionBlocked()) return;
    const s = this.sortState();
    const next: BaseSortEvent =
      s.key !== key ? { key, direction: 'asc' } :
      s.direction === 'asc' ? { key, direction: 'desc' } :
      { key: null, direction: null };
    this.sortState.set(next);
    this.sortChange.emit(next);
  }

  onQuickSearch(text: string): void {
    if (this.interactionBlocked()) return;
    this.quickText.set(text);
    this.pageState.set(1);
    this.emitFilter();
  }

  onColumnFilter(key: string, ev: Event): void {
    if (this.interactionBlocked()) return;
    const text = (ev.target as HTMLInputElement).value;
    this.columnFilters.update(f => {
      const next = { ...f };
      if (text) next[key] = text; else delete next[key];
      return next;
    });
    this.pageState.set(1);
    this.emitFilter();
  }

  onCheckboxFilter(key: string, v: BaseCheckboxFilterValue): void {
    if (this.interactionBlocked()) return;
    this.checkboxFilters.update(f => {
      const next = { ...f };
      if (v.selected.length === 0 && v.sort === null) delete next[key]; else next[key] = v;
      return next;
    });
    if (v.sort) {
      this.sortState.set({ key, direction: v.sort });
      this.sortChange.emit(this.sortState());
    }
    this.pageState.set(1);
    this.emitFilter();
  }

  onCalendarFilter(key: string, v: BaseCalendarFilterValue): void {
    if (this.interactionBlocked()) return;
    this.calendarFilters.update(f => {
      const next = { ...f };
      if (!v.start && !v.end) delete next[key]; else next[key] = v;
      return next;
    });
    this.pageState.set(1);
    this.emitFilter();
  }

  onRangeFilter(key: string, v: BaseRangeFilterValue): void {
    if (this.hasEditingRows()) return;
    this.quickText.set('');
    this.columnFilters.set({});
    this.checkboxFilters.set({});
    this.calendarFilters.set({});
    this.sortState.set({ key: null, direction: null });
    this.rangeFilters.set(v.from === null && v.to === null ? {} : { [key]: v });
    this.pageState.set(1);
    this.emitFilter();
  }

  removeChip(chip: FilterChip): void {
    if (this.interactionBlocked()) return;
    if (chip.kind === 'checkbox') {
      this.checkboxFilters.update(f => {
        const next = { ...f };
        delete next[chip.key];
        return next;
      });
    } else if (chip.kind === 'calendar') {
      this.calendarFilters.update(f => {
        const next = { ...f };
        delete next[chip.key];
        return next;
      });
    } else {
      this.rangeFilters.set({});
    }
    this.pageState.set(1);
    this.emitFilter();
  }

  clearAllFilters(): void {
    if (this.hasEditingRows()) return;
    this.quickText.set('');
    this.columnFilters.set({});
    this.checkboxFilters.set({});
    this.calendarFilters.set({});
    this.rangeFilters.set({});
    this.sortState.set({ key: null, direction: null });
    this.pageState.set(1);
    this.emitFilter();
  }

  uniqueValuesFor(c: BaseColumnDef<T>): BaseFilterOption[] {
    const others = this.rowsExcluding(c.key);
    const counts = new Map<string, number>();
    for (const row of others) {
      const raw = this.cellValue(c, row);
      const key = raw === null || raw === undefined || raw === '' ? NO_VALUE : String(raw);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const seen = new Map<string, string>();
    let hasNull = false;
    for (const row of this.rows()) {
      const raw = this.cellValue(c, row);
      if (raw === null || raw === undefined || raw === '') { hasNull = true; continue; }
      const key = String(raw);
      if (!seen.has(key)) seen.set(key, this.cellText(c, row));
    }
    const opts: BaseFilterOption[] = [...seen.entries()]
      .map(([value, label]) => ({ value, label, count: counts.get(value) ?? 0 }))
      .sort((a, b) => a.label.localeCompare(b.label));
    if (hasNull) opts.push({ value: NO_VALUE, label: '(No value)', count: counts.get(NO_VALUE) ?? 0 });
    return opts;
  }

  rangeValuesFor(c: BaseColumnDef<T>): number[] {
    return this.rows()
      .map(r => Number(this.cellValue(c, r)))
      .filter(n => !isNaN(n));
  }

  calendarLabel(key: string): string {
    const v = this.calendarFilters()[key];
    return v ? calendarFilterLabel(v) : '';
  }

  headerGroupClass(group: AdditionalHeaderGroup): string {
    const idx = (this.additionalHeader() ?? []).indexOf(group);
    return HEADER_GROUP_HUES[Math.max(0, idx) % HEADER_GROUP_HUES.length];
  }

  private emitFilter(): void {
    this.filterChange.emit({ quick: this.quickText(), columns: this.columnFilters() });
  }

  onPage(ev: BasePageEvent): void {
    if (this.hasEditingRows()) return;
    this.pageState.set(ev.page);
    this.pageSize.set(ev.pageSize);
    this.pageChange.emit(ev);
  }

  onManageColumns(ev: BaseManageColumnsEvent): void {
    if (this.hasEditingRows()) return;
    this.manageOrder.set(ev.order);
    this.manageHidden.set(new Set(ev.order.filter(k => !ev.visibleKeys.includes(k))));
    this.manageColumn.emit(ev.visibleKeys);
  }

  onScroll(ev: Event): void {
    if (!this.enableScroll() || this.scrollTicking) return;
    this.scrollTicking = true;
    requestAnimationFrame(() => {
      this.scrollTicking = false;
      const el = ev.target as HTMLElement;
      const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const position: BaseScrollEvent['position'] = el.scrollTop <= 5 ? 'top' : fromBottom <= 5 ? 'bottom' : 'mid';
      this.scrollEvent.emit({ position });
    });
  }

  onRowClick(row: T, i: number): void {
    if (this.selectable() === 'single') {
      this.selected.set(new Map([[this.rowTrack(row), row]]));
      this.selectionChange.emit([row]);
    }
    this.rowClick.emit({ row, rowIndex: i });
  }

  onCellClick(row: T, column: BaseColumnDef<T>, rowIndex: number, ev: Event): void {
    ev.stopPropagation();
    this.cellClick.emit({ row, column, value: this.cellValue(column, row), rowIndex });
    this.onRowClick(row, rowIndex);
  }

  toggleRow(row: T): void {
    if (this.isRowCheckboxDisabled(row)) return;
    this.selected.update(m => {
      const next = new Map(m);
      const k = this.rowTrack(row);
      if (next.has(k)) next.delete(k); else next.set(k, row);
      return next;
    });
    this.selectionChange.emit([...this.selected().values()]);
  }

  toggleAll(ev: Event): void {
    if (this.isDisableSelectAll()) return;
    const checked = (ev.target as HTMLInputElement).checked;
    this.selected.update(m => {
      const next = new Map(m);
      for (const r of this.pagedRows()) {
        if (this.isRowCheckboxDisabled(r)) continue;
        const k = this.rowTrack(r);
        if (checked) next.set(k, r); else next.delete(k);
      }
      return next;
    });
    this.selectionChange.emit([...this.selected().values()]);
  }

  isSelected(row: T): boolean {
    return this.selected().has(this.rowTrack(row));
  }

  isRowCheckboxDisabled(row: T): boolean {
    return !!(row as BaseRow).isCheckboxDisable;
  }

  checkboxDisabledReason(row: T): string {
    return (row as BaseRow).checkboxDisableReason ?? '';
  }

  isRowEditing(row: T): boolean {
    return this.editableRows() && !!(row as BaseRow).isEditing;
  }

  leadingStickyLeft(kind: 'expand' | 'checkbox'): string | null {
    if (!this.hasLeftSticky()) return null;
    if (kind === 'expand') return '0px';
    return this.expandable() ? '32px' : '0px';
  }

  hasChildren(row: T): boolean {
    const rows = this.childRowsOf()?.(row);
    return !!rows && rows.length > 0;
  }

  isExpanded(row: T): boolean {
    return this.expandedKeys().has(this.rowTrack(row));
  }

  toggleExpand(row: T): void {
    const key = this.rowTrack(row);
    this.expandedKeys.update(set => {
      const next = new Set(set);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    this.expandChange.emit({ row, expanded: this.isExpanded(row) });
  }

  childRowsFor(row: T): any[] {
    return this.childRowsOf()?.(row) ?? [];
  }

  childFooterTemplate() {
    return this.childFooterTemplates()[0]?.template ?? null;
  }

  templateFor(key: string) {
    return this.cellTemplates().find(t => t.baseCell() === key)?.template ?? null;
  }

  headerTemplateFor(key: string) {
    return this.headerTemplates().find(t => t.baseHeaderCell() === key)?.template ?? null;
  }

  readonly actionTemplateFor = (type: string) => this.actionTemplates().find(t => t.baseActionTemplate() === type)?.template ?? null;

  cellContext(row: T, column: BaseColumnDef<T>, index: number) {
    return { $implicit: row, value: this.cellValue(column, row), column, index };
  }

  rowTrack(row: T): unknown {
    return (row as BaseRow)[this.trackKey()];
  }

  rowClassOf(row: T, index: number): string {
    const clickable = this.selectable() !== 'none' ? 'cursor-pointer' : '';
    const highlighted = this.highlightKey() != null && String(this.rowTrack(row)) === this.highlightKey();
    const hasEditError = this.editableRows() && !!(row as BaseRow).hasEditError;
    const editing = this.isRowEditing(row);
    const stripe = this.striped() && !this.groupBy() && index % 2 === 1;
    const bg = highlighted ? `${this.highlightClass()} border-l-[3px] border-l-action`
      : this.isSelected(row) ? 'bg-action-surface'
      : hasEditError ? 'bg-error-surface'
      : editing ? 'bg-warning-surface'
      : stripe ? 'bg-neutral-50/60'
      : '';
    return `transition-colors hover:bg-action-surface/50 ${clickable} ${bg}`.trim();
  }

  stickyEdgeClass(c: BaseColumnDef<T>): string {
    if (!c.sticky) return '';
    const cols = this.visibleColumns();
    if (c.sticky === 'left') {
      const lefts = cols.filter(x => x.sticky === 'left');
      return lefts[lefts.length - 1] === c ? 'bt-sticky-left-edge' : '';
    }
    const rights = cols.filter(x => x.sticky === 'right');
    return rights[0] === c ? 'bt-sticky-right-edge' : '';
  }

  blankHeaderClass(key: string): string {
    const col = this.visibleColumns().find(c => c.key === key);
    if (!col?.sticky) return 'table-th';
    return `table-th bt-sticky-th ${this.stickyEdgeClass(col)}`.trim();
  }

  cellValue(c: BaseColumnDef<T>, row: T): unknown {
    return getCellValue(c, row);
  }

  cellText(c: BaseColumnDef<T>, row: T): string {
    return getCellText(c, row);
  }

  rowTooltipText(c: BaseColumnDef<T>, row: T): string {
    return getRowTooltipText(c, row);
  }

  snoValue(row: T): number {
    const base = this.paginate() ? (this.page() - 1) * this.pageSize() : 0;
    return base + (this.rowIndexMap().get(this.rowTrack(row)) ?? 0) + 1;
  }

  private widthPx(c: BaseColumnDef<T>): number {
    const n = parseInt(c.width ?? '', 10);
    return isNaN(n) ? 120 : n;
  }
}
