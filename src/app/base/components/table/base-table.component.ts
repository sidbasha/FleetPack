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
  BaseDraftConflict,
  BaseFilterEvent,
  BaseFilterOption,
  BaseHandleActionEvent,
  BaseManageColumnsEvent,
  BasePageEvent,
  BaseRangeFilterValue,
  BaseRow,
  BaseRowClickEvent,
  BaseRowSaveRequest,
  BaseRowSaveResult,
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
import { BaseModalComponent, BaseSkeletonComponent, BaseTooltipDirective } from '../base-overlay.components';
import { BaseDensityService } from '../../services/base-density.service';
import { BaseDraft, BaseDraftRow, BaseEditDraftService } from '../../services/base-edit-draft.service';
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
    BaseModalComponent,
    BaseTableComponent,
    BaseCellDirective
  ],
  styles: [`
    .bt-sticky-th { position: sticky; z-index: 12; background: #f8fafc; }
    .bt-sticky-td { position: sticky; z-index: 1; }
    .bt-sticky-left-edge::after, .bt-sticky-right-edge::after {
      content: ''; position: absolute; top: 0; bottom: 0; width: 6px; pointer-events: none;
    }
    .bt-sticky-left-edge::after { left: 100%; background: linear-gradient(to right, rgba(15, 23, 42, .12), transparent); }
    .bt-sticky-right-edge::after { right: 100%; background: linear-gradient(to left, rgba(15, 23, 42, .12), transparent); }
    .bt-head-sticky { position: sticky; top: 0; z-index: 10; }
  `],
  template: `
    @if (draftBanner(); as banner) {
      <div class="border-b border-info/20 bg-info-surface">
        <div class="flex items-center gap-3 px-4 py-3 text-[11px] text-ink-900">
          <span class="icon-outline shrink-0 text-info" style="font-size:16px;" aria-hidden="true">history</span>
          <span class="flex-1 min-w-0">
            <b>Unsaved changes from your last visit,</b> {{ banner.rowCount }} row{{ banner.rowCount === 1 ? '' : 's' }} on this table.
            <span class="block text-neutral-400 mt-0.5">Saved {{ formatDraftTime(banner.savedAt) }} · Expires in {{ draftDaysLeft(banner.savedAt) }} days</span>
          </span>
          <button type="button" class="shrink-0 text-[11px] font-semibold text-ink-600 hover:text-ink-900" (click)="toggleDraftReview()">Review changes</button>
          <button type="button" class="shrink-0 text-[11px] font-semibold text-error hover:text-error-hover" (click)="discardParkedDraft()">Discard</button>
          <button type="button" class="shrink-0 btn-primary py-1! px-2.5! text-[11px]" (click)="restoreDraft()">
            <span class="icon-outline" style="font-size:13px;" aria-hidden="true">restore</span> Restore
          </button>
        </div>
        @if (reviewOpen()) {
          <div class="px-4 pb-3 text-[11px] text-ink-600">
            <p class="text-neutral-400 mb-1.5">The table is showing saved values. Nothing is applied until Restore.</p>
            <ul class="space-y-1">
              @for (r of pendingDraft()?.rows ?? []; track r.key) {
                <li>Row {{ r.key }} — {{ draftChangeSummary(r) }}</li>
              }
            </ul>
          </div>
        }
      </div>
    }

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
                                  [budgetPercent]="pinBudgetPercent()"
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

    @if (hasDirtyRows()) {
      <div class="flex items-center gap-3 px-4 py-2.5 bg-warning-surface border-b border-warning/30 text-[11px] text-warning-hover font-medium">
        <span class="icon-outline shrink-0" style="font-size:14px;" aria-hidden="true">edit_note</span>
        <span class="flex-1">{{ dirtyCount() }} row{{ dirtyCount() === 1 ? '' : 's' }} edited, not saved</span>
        <button type="button" class="shrink-0 text-[11px] font-semibold text-ink-600 hover:text-ink-900"
                (click)="confirmLeave()">Navigate away</button>
        <button type="button" class="shrink-0 text-[11px] font-semibold text-error hover:text-error-hover"
                (click)="discardAll()">Discard changes</button>
        <button type="button" class="shrink-0 btn-primary py-1! px-2.5! text-[11px]" (click)="saveAll()">
          <span class="icon-outline" style="font-size:13px;" aria-hidden="true">check</span>
          Save {{ dirtyCount() }} change{{ dirtyCount() === 1 ? '' : 's' }}
        </button>
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
                  [attr.aria-label]="columnAriaLabel(c)"
                  (click)="c.sortable && !readOnly() && toggleSort(c.key)">
                <span class="inline-flex items-center gap-1.5">
                  @if (c.sticky) {
                    <span class="icon-outline text-neutral-300" style="font-size:12px;" aria-hidden="true">push_pin</span>
                  }
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
                  <td class="table-td w-8 text-center" [class]="hasLeftSticky() ? 'bt-sticky-td ' + rowStickyBg(row, i) : ''"
                      [style.left]="leadingStickyLeft('expand')">
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
                  <td class="table-td w-8" [class]="hasLeftSticky() ? 'bt-sticky-td ' + rowStickyBg(row, i) : ''"
                      [style.left]="leadingStickyLeft('checkbox')">
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
                      [class]="stickyBodyCellClass(c, row, i)"
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
                                        [fieldDirty]="isFieldDirty(row, c)" [revertValue]="revertTargetFor(row, c)"
                                        [saving]="isRowSaving(row)"
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
                    [class]="c.sticky ? 'bt-sticky-td bg-neutral-50 ' + stickyEdgeClass(c) : ''"
                    [style.left]="stickyMeta()[c.key]?.left ?? null" [style.right]="stickyMeta()[c.key]?.right ?? null">
                  {{ summaryByKey()[c.key] }}
                </td>
              }
            </tr>
          </tfoot>
        }
      </table>
    </div>

    @if (hasDirtyRows()) {
      <div class="flex items-center gap-1.5 px-4 py-1.5 text-[10px] text-neutral-400 border-t border-neutral-100">
        <span class="icon-outline" style="font-size:12px;" aria-hidden="true">lock</span>
        Sorting, filtering, paging and view switching are blocked while {{ dirtyCount() }} change{{ dirtyCount() === 1 ? '' : 's' }}
        {{ dirtyCount() === 1 ? 'is' : 'are' }} pending.
      </div>
    }

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

    @if (conflicts()[0]; as conflict) {
      <base-modal [open]="true" icon="flag" iconTone="warning" size="sm"
                  title="This row changed while your draft was parked"
                  [subtitle]="'Row ' + rowTrack(conflict.row) + ' · ' + conflict.column.header"
                  [showClose]="false" [closeOnBackdrop]="false" [destructive]="true">
        <div class="grid grid-cols-2 gap-2.5 mb-3">
          <div class="border border-action/30 rounded-r-sm p-2.5 bg-action-surface">
            <div class="text-[9px] font-bold uppercase tracking-wide text-action-hover mb-1">Your draft</div>
            <div class="text-xs text-ink-900 wrap-break-word">{{ formatConflictValue(conflict, conflict.draftValue) }}</div>
          </div>
          <div class="border border-neutral-200 rounded-r-sm p-2.5 bg-neutral-50">
            <div class="text-[9px] font-bold uppercase tracking-wide text-neutral-400 mb-1">
              Server{{ draftAuthorOf() && draftAuthorOf()!(conflict.row) ? ' · ' + draftAuthorOf()!(conflict.row) : '' }}
            </div>
            <div class="text-xs text-ink-900 wrap-break-word">{{ formatConflictValue(conflict, conflict.serverValue) }}</div>
          </div>
        </div>
        <p class="text-[11px] text-neutral-500">
          Restoring keeps your value in the editor as an unsaved change. It does not overwrite the server until you press Save.
        </p>
        <div footer class="flex gap-2 w-full">
          <button type="button" class="flex-1 text-xs font-semibold text-ink-600 hover:bg-neutral-50 rounded-r-sm px-3 py-1.5
                                        border border-neutral-200 transition-colors"
                  (click)="resolveConflict(false)">Keep the server value</button>
          <button type="button" class="flex-1 btn-primary justify-center" (click)="resolveConflict(true)">Restore mine as an edit</button>
        </div>
      </base-modal>
    }

    @if (leaveDialogOpen()) {
      <base-modal [open]="true" icon="warning" iconTone="warning" size="sm" [destructive]="true" [showClose]="false"
                  [title]="'Leave with ' + dirtyCount() + ' unsaved change' + (dirtyCount() === 1 ? '' : 's') + '?'"
                  [subtitle]="tableTitle()" (closed)="onLeaveDialogClosed($event)">
        <p>Your edits have not been sent to the server.
          @if (draftId()) { Keeping them stores a draft on this device for 7 days and offers it back the next time you open this table. }
        </p>
        @if (leaveSaveFailed()) {
          <p class="mt-2 text-error-text font-semibold">Save failed — fix the highlighted rows and try again, or choose another option.</p>
        }
        <div footer class="flex flex-wrap gap-2 w-full justify-end">
          <button type="button" class="text-xs font-semibold text-action hover:text-action-hover px-3 py-1.5"
                  (click)="chooseLeave('stay')">Stay on page</button>
          @if (draftId()) {
            <button type="button" class="text-xs font-semibold text-ink-600 hover:bg-neutral-50 rounded-r-sm px-3 py-1.5
                                          border border-neutral-200 transition-colors"
                    (click)="chooseLeave('keep-draft')">Keep draft</button>
          }
          <button type="button" class="text-xs font-semibold text-error hover:bg-error-surface rounded-r-sm px-3 py-1.5
                                        border border-error/30 transition-colors"
                  (click)="chooseLeave('discard')">Discard</button>
          <button type="button" class="btn-primary py-1.5! px-3! text-xs" (click)="chooseLeave('save-and-leave')">Save and leave</button>
        </div>
      </base-modal>
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
  /** % of total column width identity-locked + user-pinned columns may occupy before the Manage Columns budget meter warns. */
  readonly pinBudgetPercent = input(40);

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
  /** Enables the whole-table save bar (Discard/Save), the leave guard, and — set — "Keep draft" persistence. Must be stable and unique per table on the page. */
  readonly draftId = input<string | null>(null);
  /** Optional display label for who last changed a row on the server (e.g. "J. Reyes, 09:12"), shown in the draft-conflict dialog. */
  readonly draftAuthorOf = input<((row: T) => string | null) | null>(null);
  readonly saveChanges = output<BaseRowSaveRequest<T>[]>();
  readonly discardAllChanges = output<void>();
  readonly draftRestored = output<void>();
  readonly draftDiscarded = output<void>();

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
  /** Fires alongside `manageColumn` with the full left/right pin assignment, for hosts persisting table view state. */
  readonly pinChange = output<Record<string, 'left' | 'right'>>();
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
  private readonly managePinned = signal<Record<string, 'left' | 'right'> | null>(null);
  protected readonly viewportNarrow = signal(false);
  protected readonly showLeftEdgeShadow = signal(false);
  protected readonly showRightEdgeShadow = signal(false);

  // --- Edit state (see "The eight-state machine" in the Base README) ---
  // Plain (non-signal) fields, not `signal<Map<...>>` — row edit flags like
  // `isEditing`/`hasEditError` are mutated in place on host-owned row
  // objects, the same established pattern this file already used before
  // this feature (see isRowEditing/rowStateBg below). A computed() keyed
  // off `rows()` would go stale the instant a row is mutated without a
  // fresh array reference, so dirty/saving/failed tracking below reads
  // these with plain methods, evaluated fresh on every template pass.
  private readonly editSnapshots = new Map<unknown, Record<string, unknown>>();
  private readonly savingKeys = new Set<unknown>();
  private readonly saveErrorMessages = new Map<unknown, string>();

  private readonly draftService = inject(BaseEditDraftService);
  protected readonly pendingDraft = signal<BaseDraft | null>(null);
  protected readonly reviewOpen = signal(false);
  protected readonly draftBanner = computed(() => {
    const d = this.pendingDraft();
    return d ? { savedAt: d.savedAt, rowCount: d.rows.length } : null;
  });

  protected readonly leaveDialogOpen = signal(false);
  protected readonly leaveSaveFailed = signal(false);
  private leaveResolve: ((canLeave: boolean) => void) | null = null;
  private leaveAfterSavePending = false;

  protected readonly conflicts = signal<BaseDraftConflict<T>[]>([]);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private scrollTicking = false;

  constructor() {
    queueMicrotask(() => {
      this.pageSize.set(this.initialPageSize());
      const pre = this.preselectedColumns();
      if (pre) this.manageHidden.set(new Set(this.columns().map(c => c.key).filter(k => !pre.includes(k))));

      const id = this.draftId();
      if (id) {
        const draft = this.draftService.load(id);
        if (draft && draft.rows.length > 0) this.pendingDraft.set(draft);
      }
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

    // Re-measure which sticky edge actually has content scrolled behind it
    // whenever the visible/pinned columns change shape (pinning, hiding, or
    // resizing the viewport can all change whether the table overflows).
    effect(() => {
      this.visibleColumns();
      queueMicrotask(() => this.measureHorizontalEdges());
    });
  }

  private measureHorizontalEdges(): void {
    const el: HTMLElement | null = this.host.nativeElement.querySelector('.overflow-x-auto');
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    this.showLeftEdgeShadow.set(el.scrollLeft > 1);
    this.showRightEdgeShadow.set(maxScroll > 1 && el.scrollLeft < maxScroll - 1);
  }

  /** Columns with order/visibility/user-pin overrides applied, but before the narrow-viewport unfreeze — the "real" intended arrangement, used by the Manage Columns panel and the pin budget so a narrow window doesn't make either lie about what's actually pinned. */
  private readonly pinnedColumns = computed(() => {
    const order = this.manageOrder();
    const hidden = this.manageHidden();
    const pinned = this.managePinned();
    let cols = this.columns();
    if (order) {
      const byKey = new Map(cols.map(c => [c.key, c]));
      cols = order.map(k => byKey.get(k)).filter((c): c is BaseColumnDef<T> => !!c);
    }
    cols = cols.filter(c => hidden ? !hidden.has(c.key) : !c.hidden);
    if (pinned) cols = cols.map(c => pinned[c.key] ? { ...c, sticky: pinned[c.key] } : c);
    return cols;
  });

  readonly visibleColumns = computed(() => {
    let cols = this.pinnedColumns();
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
  // Plain methods, not computed() — `isEditing`/dirty state live on mutated
  // row objects (see the block comment above the edit-state fields), so a
  // memoized computed() keyed off the `rows()` signal reference would miss
  // those mutations. Called fresh from the template on every CD pass.
  editingCount(): number {
    return this.editableRows() ? this.rows().filter(r => (r as BaseRow).isEditing).length : 0;
  }
  hasEditingRows(): boolean {
    return this.editingCount() > 0;
  }
  interactionBlocked(): boolean {
    return this.hasEditingRows() || this.hasDirtyRows() || this.hasRangeFilterActive();
  }

  private readonly editableColumns = computed(() => this.columns().filter(c => c.editable));

  private ensureSnapshot(row: T): void {
    const key = this.rowTrack(row);
    if (this.editSnapshots.has(key)) return;
    const snap: Record<string, unknown> = {};
    for (const c of this.editableColumns()) snap[c.key] = this.cellValue(c, row);
    this.editSnapshots.set(key, snap);
  }

  /** Whether this field currently differs from its last-saved value. Gates the per-field Revert button. */
  isFieldDirty(row: T, c: BaseColumnDef<T>): boolean {
    const snap = this.editSnapshots.get(this.rowTrack(row));
    if (!snap || !(c.key in snap)) return false;
    return !Object.is(this.cellValue(c, row), snap[c.key]);
  }

  /** The value Revert would restore this field to. */
  revertTargetFor(row: T, c: BaseColumnDef<T>): unknown {
    return this.editSnapshots.get(this.rowTrack(row))?.[c.key];
  }

  /** Whether any editable field on this row differs from its snapshot — independent of whether the row's editor is currently open, so Exit Edit doesn't clean a dirty row. */
  isDirty(row: T): boolean {
    const snap = this.editSnapshots.get(this.rowTrack(row));
    if (!snap) return false;
    return this.editableColumns().some(c => !Object.is(this.cellValue(c, row), snap[c.key]));
  }

  dirtyRows(): T[] {
    return this.editableRows() ? this.rows().filter(r => this.isDirty(r)) : [];
  }
  dirtyCount(): number {
    return this.dirtyRows().length;
  }
  hasDirtyRows(): boolean {
    return this.dirtyCount() > 0;
  }

  isRowSaving(row: T): boolean {
    return this.savingKeys.has(this.rowTrack(row));
  }
  isRowFailed(row: T): boolean {
    return this.saveErrorMessages.has(this.rowTrack(row));
  }
  rowSaveError(row: T): string {
    return this.saveErrorMessages.get(this.rowTrack(row)) ?? '';
  }

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
    const pinned = this.managePinned();
    return order
      .map(k => byKey.get(k))
      .filter((c): c is BaseColumnDef<T> => !!c)
      .map(c => ({
        key: c.key,
        header: c.header,
        locked: !!c.sticky,
        pin: c.sticky ?? pinned?.[c.key] ?? null,
        widthPx: this.widthPx(c)
      }));
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
    this.managePinned.set(ev.pinned);
    this.manageColumn.emit(ev.visibleKeys);
    this.pinChange.emit(ev.pinned);
  }

  onScroll(ev: Event): void {
    const scrollEl = ev.target as HTMLElement;
    const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
    this.showLeftEdgeShadow.set(scrollEl.scrollLeft > 1);
    this.showRightEdgeShadow.set(maxScroll > 1 && scrollEl.scrollLeft < maxScroll - 1);

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
    const editing = this.editableRows() && !!(row as BaseRow).isEditing;
    if (editing) this.ensureSnapshot(row);
    return editing;
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

  /** The row's state background, e.g. `bg-action-surface` when selected — shared by the row itself and by its sticky cells, so a selected/error/edit tint is never interrupted by a plain cell underneath a pinned column. */
  private rowStateBg(row: T, index: number): string {
    const highlighted = this.highlightKey() != null && String(this.rowTrack(row)) === this.highlightKey();
    if (highlighted) return this.highlightClass();
    if (this.isSelected(row)) return 'bg-action-surface';
    const hasEditError = this.editableRows() && (!!(row as BaseRow).hasEditError || this.isRowFailed(row));
    if (hasEditError) return 'bg-error-surface';
    if (this.editableRows() && this.isDirty(row)) return 'bg-warning-surface';
    if (this.striped() && !this.groupBy() && index % 2 === 1) return 'bg-neutral-50/60';
    return '';
  }

  rowClassOf(row: T, index: number): string {
    const clickable = this.selectable() !== 'none' ? 'cursor-pointer' : '';
    const highlighted = this.highlightKey() != null && String(this.rowTrack(row)) === this.highlightKey();
    const bg = this.rowStateBg(row, index);
    const bgWithBorder = highlighted ? `${bg} border-l-[3px] border-l-action` : bg;
    const saving = this.isRowSaving(row) ? 'opacity-60 pointer-events-none' : '';
    return `transition-colors hover:bg-action-surface/50 ${clickable} ${bgWithBorder} ${saving}`.trim();
  }

  /** Same background as the row itself, defaulting to opaque white — sticky cells need an explicit, opaque background (they sit over scrolled-away siblings), so `''` from rowStateBg would leave them see-through. */
  rowStickyBg(row: T, index: number): string {
    return this.rowStateBg(row, index) || 'bg-neutral-0';
  }

  stickyBodyCellClass(c: BaseColumnDef<T>, row: T, index: number): string {
    if (!c.sticky) return '';
    return `bt-sticky-td ${this.rowStickyBg(row, index)} ${this.stickyEdgeClass(c)}`.trim();
  }

  stickyEdgeClass(c: BaseColumnDef<T>): string {
    if (!c.sticky) return '';
    const cols = this.visibleColumns();
    if (c.sticky === 'left') {
      const lefts = cols.filter(x => x.sticky === 'left');
      return lefts[lefts.length - 1] === c && this.showLeftEdgeShadow() ? 'bt-sticky-left-edge' : '';
    }
    const rights = cols.filter(x => x.sticky === 'right');
    return rights[0] === c && this.showRightEdgeShadow() ? 'bt-sticky-right-edge' : '';
  }

  columnAriaLabel(c: BaseColumnDef<T>): string {
    return c.sticky ? `${c.header}, pinned ${c.sticky}` : c.header;
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

  // --- Whole-table save / discard (the two "whole table, save bar" controls) ---

  /** Emits one `saveChanges` request per dirty row; each row's cells go read-only until `reportSaveResult()` is called. */
  saveAll(): void {
    const dirty = this.dirtyRows();
    if (dirty.length === 0) return;
    const requests: BaseRowSaveRequest<T>[] = dirty.map(row => {
      const key = this.rowTrack(row);
      const snap = this.editSnapshots.get(key) ?? {};
      const changes: Record<string, unknown> = {};
      for (const c of this.editableColumns()) {
        const cur = this.cellValue(c, row);
        if (!Object.is(cur, snap[c.key])) changes[c.key] = cur;
      }
      this.savingKeys.add(key);
      this.saveErrorMessages.delete(key);
      return { key, row, changes };
    });
    this.saveChanges.emit(requests);
  }

  /**
   * Called by the host once a `saveChanges` batch settles. Succeeded rows
   * become the new "Saved" baseline (their current values are the next
   * revert target) and exit edit mode; failed rows keep their values and
   * their dirty state, get the error fill, and stay editable so the user
   * can retry — partial failure never loses or reverts anything.
   */
  reportSaveResult(results: BaseRowSaveResult[]): void {
    let anyFailed = false;
    for (const r of results) {
      this.savingKeys.delete(r.key);
      if (r.success) {
        this.editSnapshots.delete(r.key);
        this.saveErrorMessages.delete(r.key);
        const row = this.rows().find(x => this.rowTrack(x) === r.key);
        if (row) (row as BaseRow).isEditing = false;
      } else {
        anyFailed = true;
        this.saveErrorMessages.set(r.key, r.error ?? 'Save failed');
      }
    }
    if (this.leaveAfterSavePending) {
      this.leaveAfterSavePending = false;
      if (anyFailed) {
        this.leaveSaveFailed.set(true);
      } else {
        this.leaveDialogOpen.set(false);
        this.leaveResolve?.(true);
        this.leaveResolve = null;
      }
    }
  }

  /** Emits a `cellEdit` per touched field to restore it to its snapshot, then clears edit/dirty/error state for every dirty row. Shared by Discard and by Keep-draft (which parks the values first). */
  private revertAllLiveEdits(): void {
    for (const row of this.dirtyRows()) {
      const key = this.rowTrack(row);
      const snap = this.editSnapshots.get(key);
      if (snap) {
        for (const c of this.editableColumns()) {
          if (!Object.is(this.cellValue(c, row), snap[c.key])) {
            this.cellEdit.emit({ row, column: c, value: snap[c.key] });
          }
        }
      }
      this.editSnapshots.delete(key);
      this.saveErrorMessages.delete(key);
      (row as BaseRow).isEditing = false;
    }
  }

  /** Returns every dirty row to its saved state and clears the draft — the only control that destroys work. */
  discardAll(): void {
    this.revertAllLiveEdits();
    const id = this.draftId();
    if (id) this.draftService.clear(id);
    this.discardAllChanges.emit();
  }

  private parkDraft(): void {
    const id = this.draftId();
    if (!id) {
      // Nowhere to park it — Keep draft degrades to Discard rather than silently pretending to save.
      this.discardAll();
      return;
    }
    const draftRows: BaseDraftRow[] = this.dirtyRows().map(row => {
      const key = this.rowTrack(row);
      const snap = this.editSnapshots.get(key) ?? {};
      const changes: Record<string, unknown> = {};
      for (const c of this.editableColumns()) {
        const cur = this.cellValue(c, row);
        if (!Object.is(cur, snap[c.key])) changes[c.key] = cur;
      }
      return { key: String(key), changes, baseline: { ...snap } };
    });
    this.draftService.save(id, { savedAt: Date.now(), rows: draftRows });
    this.revertAllLiveEdits();
  }

  // --- Leaving with work pending (the four-outcome guard) ---

  /**
   * Call from a router `CanDeactivate`/`beforeunload` handler (or any other
   * "may I navigate away" check). Resolves `true` immediately if nothing is
   * dirty; otherwise opens the leave dialog and resolves once the user
   * picks an outcome — `false` for Stay (or a failed Save and leave),
   * `true` for every outcome that actually clears the pending work.
   */
  confirmLeave(): Promise<boolean> {
    if (!this.hasDirtyRows()) return Promise.resolve(true);
    this.leaveSaveFailed.set(false);
    this.leaveDialogOpen.set(true);
    return new Promise<boolean>(resolve => {
      this.leaveResolve = resolve;
    });
  }

  protected chooseLeave(outcome: 'stay' | 'save-and-leave' | 'keep-draft' | 'discard'): void {
    if (outcome === 'stay') {
      this.leaveDialogOpen.set(false);
      this.leaveResolve?.(false);
      this.leaveResolve = null;
      return;
    }
    if (outcome === 'save-and-leave') {
      this.leaveAfterSavePending = true;
      this.saveAll();
      return;
    }
    if (outcome === 'keep-draft') this.parkDraft(); else this.discardAll();
    this.leaveDialogOpen.set(false);
    this.leaveResolve?.(true);
    this.leaveResolve = null;
  }

  /** Escape/backdrop close the dialog without picking a button — treat that the same as Stay, the only outcome that can't lose anything. */
  protected onLeaveDialogClosed(reason: string): void {
    if ((reason === 'escape' || reason === 'backdrop') && this.leaveDialogOpen()) this.chooseLeave('stay');
  }

  // --- Draft recovery banner + conflict resolution ---

  protected toggleDraftReview(): void {
    this.reviewOpen.update(v => !v);
  }

  /**
   * Applies a parked draft back onto the live rows as unsaved edits. Any
   * field whose current (server) value no longer matches the value the
   * draft was taken against is held back as a conflict instead of applied
   * outright — see `resolveConflict()`.
   */
  restoreDraft(): void {
    const draft = this.pendingDraft();
    if (!draft) return;
    const byKey = new Map(this.rows().map(r => [String(this.rowTrack(r)), r]));
    const newConflicts: BaseDraftConflict<T>[] = [];
    for (const dr of draft.rows) {
      const row = byKey.get(dr.key);
      if (!row) continue;
      (row as BaseRow).isEditing = true;
      this.ensureSnapshot(row);
      for (const c of this.editableColumns()) {
        if (!(c.key in dr.changes)) continue;
        const serverNow = this.cellValue(c, row);
        const baselineThen = dr.baseline[c.key];
        if (!Object.is(serverNow, baselineThen)) {
          newConflicts.push({ row, column: c, draftValue: dr.changes[c.key], serverValue: serverNow });
        } else {
          this.cellEdit.emit({ row, column: c, value: dr.changes[c.key] });
        }
      }
    }
    const id = this.draftId();
    if (id) this.draftService.clear(id);
    this.pendingDraft.set(null);
    this.reviewOpen.set(false);
    if (newConflicts.length > 0) this.conflicts.set(newConflicts);
    this.draftRestored.emit();
  }

  discardParkedDraft(): void {
    const id = this.draftId();
    if (id) this.draftService.clear(id);
    this.pendingDraft.set(null);
    this.reviewOpen.set(false);
    this.draftDiscarded.emit();
  }

  /** Resolves the oldest queued conflict — applies the draft's value as an edit if `useMine`, otherwise leaves the server's current value in place. */
  protected resolveConflict(useMine: boolean): void {
    const [current, ...rest] = this.conflicts();
    if (current && useMine) this.cellEdit.emit({ row: current.row, column: current.column, value: current.draftValue });
    this.conflicts.set(rest);
  }

  protected formatDraftTime(savedAt: number): string {
    const d = new Date(savedAt);
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return new Date().toDateString() === d.toDateString() ? `${time} Today` : `${time} ${d.toLocaleDateString()}`;
  }

  protected draftDaysLeft(savedAt: number): number {
    return Math.max(0, 7 - Math.floor((Date.now() - savedAt) / 86_400_000));
  }

  protected draftChangeSummary(r: BaseDraftRow): string {
    const n = Object.keys(r.changes).length;
    return `${n} field${n === 1 ? '' : 's'} changed`;
  }

  protected formatConflictValue(conflict: BaseDraftConflict<T>, value: unknown): string {
    if (value === null || value === undefined || value === '') return '(empty)';
    const c = conflict.column;
    return c.editType === 'select' ? (c.editOptions ?? []).find(o => o.value === value)?.label ?? String(value) : String(value);
  }
}
