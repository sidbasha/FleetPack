import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
} from '../directives/cell-template.directive';
import {
  AdditionalHeaderGroup,
  BaseCalendarFilterValue,
  BaseCellClickEvent,
  BaseCheckboxFilterValue,
  BaseColumnDef,
  BaseFilterEvent,
  BaseHandleActionEvent,
  BaseManageColumnsEvent,
  BasePageEvent,
  BaseRangeFilterValue,
  BaseRow,
  BaseRowClickEvent,
  BaseScrollEvent,
  BaseSortEvent
} from '../models/table.model';
import { cellText as getCellText, cellValue as getCellValue, rowTooltipText as getRowTooltipText } from '../utils/table-cell.utils';
import { BaseCalendarFilterComponent, BaseCheckboxFilterComponent, BaseRangeFilterComponent } from './base-column-filters.components';
import { BaseManageColumnsComponent, ManageColumnItem } from './base-manage-columns.component';
import { BaseTooltipDirective } from './base-overlay.components';
import { BasePaginatorComponent, BaseSearchInputComponent } from './base-paginator.component';
import { BaseTableCellComponent } from './base-table-cell.component';
import { BaseEmptyStateComponent, BaseLoadingComponent } from './base-ui.components';

interface StickyMeta {
  left?: string;
  right?: string;
}

interface AdditionalHeaderCell {
  group: AdditionalHeaderGroup | null;
  span: number;
  blank: boolean;
  /** Column key, set only on blank (ungrouped) cells — used to mirror that column's sticky state. */
  key?: string;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * <base-table> · Core reusable data table
 *
 * Covers the six core requirements:
 *  1. DYNAMIC COLUMNS   — [columns] is plain data; add/remove/reorder at runtime.
 *  2. PAGINATION        — built-in client-side, or server-side via [serverSide].
 *  3. CUSTOM CELL       — <ng-template baseCell="key"> accepts ANY content
 *     TEMPLATES           (text, number, image, chart, buttons, components…),
 *                          plus built-in cell kinds for zero-template use.
 *  4. FILTERING         — global quick search + per-column text/checkbox/
 *                          calendar/numeric-range filters.
 *  5. STICKY HEADER     — [stickyHeader] + [maxHeight] for vertical scroll.
 *  6. STICKY COLUMNS    — column.sticky = 'left' | 'right' (requires width).
 *
 * Plus: Manage Columns (drag reorder + show/hide), typed row-action registry,
 * merged/additional header rows, header-cell templates, row highlight with
 * auto-scroll, infinite scroll, and several data-type/visual conveniences —
 * see src/app/base/README.md for the full feature list.
 *
 * MODES
 *  Client-side (default): pass all rows; the table filters/sorts/paginates.
 *  Server-side ([serverSide]="true"): the table renders rows as given and only
 *  EMITS (filterChange)/(sortChange)/(pageChange); the host fetches data.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'base-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    BasePaginatorComponent,
    BaseSearchInputComponent,
    BaseTableCellComponent,
    BaseEmptyStateComponent,
    BaseLoadingComponent,
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
    /* Below .bt-head-sticky/.bt-sticky-th (10/12) on purpose — a frozen body column must stay
       UNDER the sticky header while scrolling vertically, not outrank it. */
    .bt-sticky-td { position: sticky; z-index: 1; background: #ffffff; }
    // tr:hover .bt-sticky-td { background: inherit; }
    /* Edge "shadow" is a gradient pinned to the cell's own box (top:0/bottom:0), not a
       box-shadow — box-shadow's blur radius paints a few px past the element's border box,
       which (combined with the sticky column's z-index sitting above plain, non-positioned
       cells) visibly bled onto the row above/below, most noticeably once hover recolors the
       cell and draws the eye to that boundary. A background gradient never paints outside
       the box it's drawn in, so it cannot bleed into a neighboring row regardless of z-index. */
    /* No position: relative needed here — .bt-sticky-th/.bt-sticky-td (always co-applied
       alongside these edge classes) are already position: sticky, which is itself a valid
       containing block for the absolutely positioned ::after below. */
    .bt-sticky-left-edge::after, .bt-sticky-right-edge::after {
      content: ''; position: absolute; top: 0; bottom: 0; width: 6px; pointer-events: none;
    }
    .bt-sticky-left-edge::after { left: 100%; background: linear-gradient(to right, rgba(15, 23, 42, .12), transparent); }
    .bt-sticky-right-edge::after { right: 100%; background: linear-gradient(to left, rgba(15, 23, 42, .12), transparent); }
    /* The WHOLE <thead> sticks together as one unit (not each <th> individually with its own
       top:0) — with an additional merged-header row on top of the normal column-header row,
       two stacked rows each independently pinning to top:0 would collide/overlap once scrolled
       vertically, since sticky offset is computed per-element, not stacked automatically. */
    .bt-head-sticky { position: sticky; top: 0; z-index: 10; }
  `],
  template: `
    @if (showSearch()) {
      <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
        <base-search-input [placeholder]="searchPlaceholder()" (search)="onQuickSearch($event)" />
        <span class="flex items-center gap-3">
          @if (hasActiveFilters() && !readOnly()) {
            <button type="button" class="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                    (click)="clearAllFilters()">Clear All Filters</button>
          }
          <span class="text-[11px] text-slate-400">{{ filteredTotal() }} record(s)</span>
        </span>
      </div>
    }

    <div class="overflow-x-auto" [style.maxHeight]="maxHeight() || null" [style.overflowY]="maxHeight() ? 'auto' : null"
         (scroll)="onScroll($event)">
      <table class="w-full" [style.minWidth]="minWidth() || null">
        <thead [class.bt-head-sticky]="stickyHeader()" class="bg-slate-50">
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
                  <th class="table-th text-center bg-indigo-50/60" [attr.colspan]="cell.span">{{ cell.group!.displayName }}</th>
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
                <input type="checkbox" [checked]="allSelected()" [disabled]="isDisableSelectAll() || readOnly()"
                       (change)="toggleAll($event)" aria-label="Select all rows" />
              </th>
            }
            @for (c of visibleColumns(); track c.key; let first = $first; let last = $last) {
              <th class="table-th select-none"
                  [class.text-right]="c.align === 'right'"
                  [class.text-center]="c.align === 'center'"
                  [class.cursor-pointer]="c.sortable && !readOnly()"
                  [class.bt-sticky-th]="c.sticky"
                  [class]="stickyEdgeClass(c)"
                  [style.width]="c.width ?? null"
                  [style.minWidth]="c.width ?? null"
                  [style.left]="stickyMeta()[c.key]?.left ?? null"
                  [style.right]="stickyMeta()[c.key]?.right ?? null"
                  (click)="c.sortable && !readOnly() && toggleSort(c.key)">
                <span class="inline-flex items-center gap-1.5">
                  @if (manageColumns() && first && !readOnly()) {
                    <base-manage-columns [items]="manageColumnItems()" [visibleKeys]="manageVisibleKeys()"
                                          (apply)="onManageColumns($event)" (click)="$event.stopPropagation()" />
                  }
                  @if (headerTemplateFor(c.key); as ht) {
                    <ng-container *ngTemplateOutlet="ht; context: { column: c }" />
                  } @else if (c.tooltip) {
                    <span [baseTooltip]="c.tooltip" [tooltipPosition]="c.tooltipPosition ?? 'top'" class="cursor-help">{{ c.header }}</span>
                  } @else {
                    {{ c.header }}
                  }
                  @if (c.sortable) {
                    <span class="text-[9px]" [class.text-indigo-500]="sortState().key === c.key">
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
                      }
                      @case ('range') {
                        <base-range-filter [header]="c.header" [from]="rangeFilters()[c.key]?.from ?? null"
                          [to]="rangeFilters()[c.key]?.to ?? null" [active]="!!rangeFilters()[c.key]"
                          [align]="last ? 'right' : 'left'"
                          (apply)="onRangeFilter(c.key, $event)" (click)="$event.stopPropagation()" />
                      }
                    }
                  }
                  @if (last && hasActiveFilters() && !readOnly()) {
                    <button type="button" class="text-[9px] text-indigo-500 hover:text-indigo-700" title="Clear all filters"
                            (click)="$event.stopPropagation(); clearAllFilters()">⟲</button>
                  }
                </span>
              </th>
            }
          </tr>

          @if (showFilterRow() && hasTextFilterableColumn() && !readOnly()) {
            <tr class="bg-white">
              @if (expandable()) { <th class="px-2 py-1.5"></th> }
              @if (selectable() === 'multiple') { <th class="px-2 py-1.5"></th> }
              @for (c of visibleColumns(); track c.key) {
                <th class="px-2 py-1.5 font-normal"
                    [class.bt-sticky-th]="c.sticky"
                    [style.left]="stickyMeta()[c.key]?.left ?? null"
                    [style.right]="stickyMeta()[c.key]?.right ?? null">
                  @if (c.filterable && (!c.filterKind || c.filterKind === 'text')) {
                    <input type="text" [value]="columnFilters()[c.key] || ''"
                           class="w-full border border-slate-200 rounded-md px-2 py-1 text-[11px] text-slate-600
                                  focus:outline-none focus:ring-1 focus:ring-indigo-200"
                           [placeholder]="'Filter ' + c.header"
                           (input)="onColumnFilter(c.key, $event)" />
                  }
                </th>
              }
            </tr>
          }
        </thead>

        <tbody class="divide-y divide-slate-100">
          @for (g of groupedRows(); track g.key) {
            @if (g.key !== null && groupHeaderStyle() === 'plain') {
              <tr class="bg-slate-50">
                <td [attr.colspan]="colspan()"
                    class="px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 border-t border-slate-100">
                  {{ g.key }}
                </td>
              </tr>
            } @else if (g.key !== null && groupHeaderStyle() === 'light') {
              <tr class="bg-white">
                <td [attr.colspan]="groupActionLabel() ? colspan() - 1 : colspan()"
                    class="px-3 py-2.5 text-[13px] font-bold text-slate-800">
                  {{ g.key }}
                  <span class="ml-1.5 text-[10px] font-semibold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5 align-middle">
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
              <tr class="bg-indigo-50/60">
                <td [attr.colspan]="groupActionLabel() ? colspan() - 1 : colspan()"
                    class="px-3 py-1.5 text-[11px] font-bold text-indigo-800">
                  {{ g.key }} <span class="font-medium text-indigo-400">· {{ g.rows.length }} {{ groupCountLabel() }}</span>
                </td>
                @if (groupActionLabel()) {
                  <td class="px-3 py-1.5 text-right">
                    <button type="button" class="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
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
                    <button type="button" class="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-slate-100 text-slate-500"
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

                  <!-- custom template ALWAYS wins -->
                  @if (templateFor(c.key); as tpl) {
                    <ng-container *ngTemplateOutlet="tpl; context: cellContext(row, c, i)" />
                  } @else {
                    <base-table-cell [column]="c" [row]="row" [rowIndex]="snoValue(row)"
                                      [actionTemplateFor]="actionTemplateFor"
                                      (actionRun)="handleAction.emit($event)" />
                  }
                </td>
              }
            </tr>
            @if (expandable() && isExpanded(row) && hasChildren(row)) {
              <tr class="bg-slate-50/60">
                <td [attr.colspan]="colspan()" class="p-0">
                  <div class="pl-9 pr-3 py-2 ml-3 border-l-2 border-indigo-200">
                    <base-table
                      [columns]="childColumns() ?? []"
                      [rows]="childRowsFor(row)"
                      [trackKey]="trackKey()"
                      [paginate]="childPaginate()"
                      [showSearch]="childShowSearch()"
                      (rowClick)="rowClick.emit($event)"
                      (cellClick)="cellClick.emit($event)">
                      <!-- forward any baseChildCell templates so the nested table supports fully custom cells too -->
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
                <base-empty-state [title]="emptyTitle()" [hint]="emptyHint()" />
              </td>
            </tr>
          }
          @if (enableScroll() && scrollLoading()) {
            <tr>
              <td [attr.colspan]="colspan()" class="p-2">
                <base-loading message="Loading more…" />
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (paginate()) {
      <div class="px-4 py-3 border-t border-slate-100">
        <base-paginator
          [page]="page()"
          [pageSize]="pageSize()"
          [total]="filteredTotal()"
          [pageSizeOptions]="pageSizeOptions()"
          (pageChange)="onPage($event)" />
      </div>
    }
  `
})
export class BaseTableComponent<T = BaseRow> {
  /** Dynamic column definitions — plain data; add/remove/reorder at runtime. */
  readonly columns = input.required<BaseColumnDef<T>[]>();
  /** Row objects. In server-side mode, the current page only. */
  readonly rows = input.required<T[]>();
  /** Row property used for tracking and selection identity. */
  readonly trackKey = input('id');

  /** Server-side mode: table renders rows as-is and only emits events. */
  readonly serverSide = input(false);
  /** Server-side mode: total record count for the paginator. */
  readonly totalItems = input(0);

  /** Enable the footer paginator. */
  readonly paginate = input(true);
  readonly initialPageSize = input(10);
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);

  /** Show the built-in global search toolbar. */
  readonly showSearch = input(true);
  readonly searchPlaceholder = input('Search…');
  /** Show the per-column filter row for text-filterable columns (columns with a richer filterKind get a header dropdown instead). */
  readonly showFilterRow = input(false);

  /** Keep the header visible while scrolling vertically (pair with maxHeight). */
  readonly stickyHeader = input(false);
  /** e.g. '420px' — enables vertical scrolling inside the table body. */
  readonly maxHeight = input('');
  /** Force a min table width, e.g. '1100px', so sticky columns have room to matter. */
  readonly minWidth = input('');

  /** Row selection: 'none' | 'single' (click row) | 'multiple' (checkboxes). */
  readonly selectable = input<'none' | 'single' | 'multiple'>('none');
  /** Disables the header "select all" checkbox (rows can still be selected individually). */
  readonly isDisableSelectAll = input(false);

  /** Zebra striping. Skipped while [groupBy] is set (group header rows break simple index parity). */
  readonly striped = input(false);
  /** Group rows under sub-header rows (e.g. events by day). Return null to leave a row ungrouped. */
  readonly groupBy = input<((row: T) => string | null) | null>(null);
  /** When set, group headers get an action button emitting (groupAction). */
  readonly groupActionLabel = input('');
  /** 'accent' (default): indigo header with row count. 'plain': muted uppercase section divider. 'light': white header, bold label, count pill, solid action button. */
  readonly groupHeaderStyle = input<'accent' | 'plain' | 'light'>('accent');
  /** Unit label after the row count, e.g. 'row(s)' (default) or 'events'. */
  readonly groupCountLabel = input('row(s)');
  /** Highlight the row whose trackKey value matches (external selection) and auto-scroll it into view. */
  readonly highlightKey = input<string | null>(null);
  /** CSS classes applied to the highlighted row. Default matches the existing selection color. */
  readonly highlightClass = input('bg-indigo-50');
  readonly emptyTitle = input('No matching records');
  readonly emptyHint = input('Try adjusting filters or search.');

  /** Read-only / "library" mode: hides sort-click, filter dropdowns, and the manage-columns gear. */
  readonly readOnly = input(false);

  /** Merged header row above the normal columns (grouped/spanning labels). */
  readonly additionalHeader = input<AdditionalHeaderGroup[] | null>(null);

  /** Shows a gear-icon "Manage Columns" panel (visibility + drag reorder) on the first column header. */
  readonly manageColumns = input(false);
  /** Initial visible column keys when Manage Columns is used. Defaults to all non-hidden columns. */
  readonly preselectedColumns = input<string[] | null>(null);

  /** Infinite-scroll mode: emits (scrollEvent) as the [maxHeight] container nears its top/bottom edge. */
  readonly enableScroll = input(false);
  /** Shows a spinner row at the bottom while more data is being fetched. */
  readonly scrollLoading = input(false);

  /** Show a first-column toggle button that expands a nested child <base-table> under the row. */
  readonly expandable = input(false);
  /** Column defs for the nested child table. Required when [expandable] is used. */
  readonly childColumns = input<BaseColumnDef<any>[] | null>(null);
  /** Return this row's child rows, or null/undefined/[] to hide the toggle for that row (no children). */
  readonly childRowsOf = input<((row: T) => any[] | null | undefined) | null>(null);
  /** Enable the paginator inside nested child tables. Default off — child tables are usually short. */
  readonly childPaginate = input(false);
  /** Show the search box inside nested child tables. Default off. */
  readonly childShowSearch = input(false);

  readonly rowClick = output<BaseRowClickEvent<T>>();
  readonly cellClick = output<BaseCellClickEvent<T>>();
  readonly sortChange = output<BaseSortEvent>();
  readonly pageChange = output<BasePageEvent>();
  readonly filterChange = output<BaseFilterEvent>();
  readonly selectionChange = output<T[]>();
  /** Fired with the group key when a group-header action button is clicked. */
  readonly groupAction = output<string>();
  /** Fired when a row's expand toggle is clicked. */
  readonly expandChange = output<{ row: T; expanded: boolean }>();
  /** Fired whenever any row action (typed or legacy) runs, in addition to its own `run(row)` callback. */
  readonly handleAction = output<BaseHandleActionEvent<T>>();
  /** Fired with the new visible column keys after the Manage Columns panel's Apply button. */
  readonly manageColumn = output<string[]>();
  /** Infinite-scroll position ('top' | 'mid' | 'bottom') while [enableScroll] is on. */
  readonly scrollEvent = output<BaseScrollEvent>();

  private readonly cellTemplates = contentChildren(BaseCellDirective<T>);
  private readonly headerTemplates = contentChildren(BaseHeaderCellDirective<T>);
  private readonly actionTemplates = contentChildren(BaseActionTemplateDirective<T>);
  private readonly childFooterTemplates = contentChildren(BaseChildFooterDirective<T>);
  /** Custom cell templates for the nested child table's columns (see `BaseChildCellDirective`). */
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
  /** Manage Columns overrides. null = "not customized yet, use authoring order/visibility". */
  private readonly manageOrder = signal<string[] | null>(null);
  private readonly manageHidden = signal<Set<string> | null>(null);

  private readonly host = inject(ElementRef<HTMLElement>);
  private scrollTicking = false;

  constructor() {
    // initialise page size / preselected columns from inputs once they resolve
    queueMicrotask(() => {
      this.pageSize.set(this.initialPageSize());
      const pre = this.preselectedColumns();
      if (pre) this.manageHidden.set(new Set(this.columns().map(c => c.key).filter(k => !pre.includes(k))));
    });

    // auto-scroll the highlighted row into view when highlightKey changes to a match
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
  }

  // derived view pipeline: filter → sort → paginate
  readonly visibleColumns = computed(() => {
    const order = this.manageOrder();
    const hidden = this.manageHidden();
    let cols = this.columns();
    if (order) {
      const byKey = new Map(cols.map(c => [c.key, c]));
      cols = order.map(k => byKey.get(k)).filter((c): c is BaseColumnDef<T> => !!c);
    }
    cols = cols.filter(c => hidden ? !hidden.has(c.key) : !c.hidden);
    // keep authoring order, but pin left-sticky first / right-sticky last so
    // offsets are always well-defined.
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

  /** Merged/grouped header row entries, with colspans resolved against currently visible columns. */
  readonly additionalHeaderRow = computed(() => {
    const groups = this.additionalHeader();
    if (!groups || groups.length === 0) return null;
    const colKeys = this.visibleColumns().map(c => c.key);

    // legacy/manual mode: no group uses `columnIds`, so positions can't be reconciled
    // against the actual column order - render exactly as authored (colSpan totals
    // are the consumer's responsibility) rather than guessing at gaps.
    if (!groups.some(g => g.columnIds)) {
      const manual: AdditionalHeaderCell[] = groups.map(group => ({ group, span: group.colSpan ?? 1, blank: false }));
      return manual.length > 0 ? manual : null;
    }

    // columnIds mode: anchor each group at the first of its visible columns (in actual
    // column order) and auto-fill any column not covered by any group with a plain blank
    // cell (NOT rowspan="2" — the normal header row below always renders one <th> per
    // column regardless, so a rowspan cell here would double-book that column's slot
    // and shove every subsequent header sideways), so both header rows stay column-aligned.
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
      if (consumed.has(key)) continue; // covered by a group anchored at an earlier column
      cells.push({ group: null, span: 1, blank: true, key });
    }
    return cells.length > 0 ? cells : null;
  });

  /** Full column list + lock state (sticky columns), in current order, for <base-manage-columns>. */
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

  /** Combined px width of the leading expand-toggle/checkbox pseudo-columns. */
  private readonly leadingOffset = computed(() =>
    (this.expandable() ? 32 : 0) + (this.selectable() === 'multiple' ? 32 : 0)
  );

  /** Cumulative px offsets for pinned columns. */
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

  private readonly filteredRows = computed(() => {
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
        if (!text) continue;
        const col = cols.find(c => c.key === key);
        if (col && !this.cellText(col, row).toLowerCase().includes(text.toLowerCase())) return false;
      }
      for (const [key, v] of Object.entries(cbF)) {
        if (!v.selected.length) continue;
        const col = cols.find(c => c.key === key);
        if (col && !v.selected.includes(String(this.cellValue(col, row)))) return false;
      }
      for (const [key, v] of Object.entries(calF)) {
        const col = cols.find(c => c.key === key);
        if (!col) continue;
        const raw = this.cellValue(col, row);
        const d = raw instanceof Date ? raw : raw ? new Date(raw as string | number) : null;
        if (!d || isNaN(d.getTime())) return false;
        if (v.start && d < v.start) return false;
        if (v.end && d > v.end) return false;
      }
      for (const [key, v] of Object.entries(rgF)) {
        const col = cols.find(c => c.key === key);
        if (!col) continue;
        const n = Number(this.cellValue(col, row));
        if (isNaN(n)) return false;
        if (v.from !== null && n < v.from) return false;
        if (v.to !== null && n > v.to) return false;
      }
      return true;
    });
  });

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
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb), undefined, { numeric: true }) * dir;
    });
  });

  readonly filteredTotal = computed(() =>
    this.serverSide() ? this.totalItems() : this.filteredRows().length
  );

  readonly page = computed(() => {
    const count = Math.max(1, Math.ceil(this.filteredTotal() / this.pageSize()));
    return Math.min(this.pageState(), count);
  });

  readonly pagedRows = computed(() => {
    if (this.serverSide() || !this.paginate()) return this.sortedRows();
    const start = (this.page() - 1) * this.pageSize();
    return this.sortedRows().slice(start, start + this.pageSize());
  });

  /** pagedRows split into groups when [groupBy] is set. */
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

  /** row trackKey → its 0-based index across all paged rows (for the 'sno' cell kind). */
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

  toggleSort(key: string): void {
    const s = this.sortState();
    const next: BaseSortEvent =
      s.key !== key ? { key, direction: 'asc' } :
      s.direction === 'asc' ? { key, direction: 'desc' } :
      { key: null, direction: null };
    this.sortState.set(next);
    this.sortChange.emit(next);
  }

  onQuickSearch(text: string): void {
    this.quickText.set(text);
    this.pageState.set(1);
    this.emitFilter();
  }

  onColumnFilter(key: string, ev: Event): void {
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
    this.calendarFilters.update(f => {
      const next = { ...f };
      if (!v.start && !v.end) delete next[key]; else next[key] = v;
      return next;
    });
    this.pageState.set(1);
    this.emitFilter();
  }

  /** Numeric range filters are exclusive with all other filters/sorts, per spec. */
  onRangeFilter(key: string, v: BaseRangeFilterValue): void {
    this.quickText.set('');
    this.columnFilters.set({});
    this.checkboxFilters.set({});
    this.calendarFilters.set({});
    this.sortState.set({ key: null, direction: null });
    this.rangeFilters.set(v.from === null && v.to === null ? {} : { [key]: v });
    this.pageState.set(1);
    this.emitFilter();
  }

  clearAllFilters(): void {
    this.quickText.set('');
    this.columnFilters.set({});
    this.checkboxFilters.set({});
    this.calendarFilters.set({});
    this.rangeFilters.set({});
    this.sortState.set({ key: null, direction: null });
    this.pageState.set(1);
    this.emitFilter();
  }

  /** Unique, sorted (value,label) options for a checkbox filter, computed from the full row set. */
  uniqueValuesFor(c: BaseColumnDef<T>): { value: string; label: string }[] {
    const seen = new Map<string, string>();
    for (const row of this.rows()) {
      const v = this.cellValue(c, row);
      if (v === null || v === undefined || v === '') continue;
      const key = String(v);
      if (!seen.has(key)) seen.set(key, this.cellText(c, row));
    }
    return [...seen.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  private emitFilter(): void {
    this.filterChange.emit({ quick: this.quickText(), columns: this.columnFilters() });
  }

  onPage(ev: BasePageEvent): void {
    this.pageState.set(ev.page);
    this.pageSize.set(ev.pageSize);
    this.pageChange.emit(ev);
  }

  onManageColumns(ev: BaseManageColumnsEvent): void {
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
    // still bubble a row click for convenience
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

  /** Left offset (sticky mode) for the leading expand-toggle / checkbox pseudo-columns. */
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

  /** Arrow field (not a method) — passed by reference into `<base-table-cell>`, which calls it detached from `this`. */
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
    const editing = !!(row as BaseRow).isEditing;
    const stripe = this.striped() && !this.groupBy() && index % 2 === 1;
    const bg = highlighted ? this.highlightClass()
      : this.isSelected(row) ? 'bg-indigo-50'
      : editing ? 'bg-amber-50'
      : stripe ? 'bg-slate-50/60'
      : '';
    return `transition-colors hover:bg-indigo-50/50 ${clickable} ${bg}`.trim();
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

  /** CSS class for a blank additional-header-row cell — matches the sticky/edge-shadow
   *  treatment of the real column header below it, so the two header rows stay in sync
   *  during horizontal scroll (a plain, non-sticky blank cell would drift out of position
   *  the moment the sticky column beneath it stays pinned while everything else scrolls). */
  blankHeaderClass(key: string): string {
    const col = this.visibleColumns().find(c => c.key === key);
    if (!col?.sticky) return 'table-th';
    return `table-th bt-sticky-th ${this.stickyEdgeClass(col)}`.trim();
  }

  /** Thin delegates to the shared table-cell utils — kept as instance methods so existing `this.cellValue(...)` call
   *  sites throughout filtering/sorting below don't need to change; `<base-table-cell>` uses the same utils directly. */
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
