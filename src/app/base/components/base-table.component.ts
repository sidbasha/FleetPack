import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  output,
  signal
} from '@angular/core';
import { BaseCellDirective } from '../directives/cell-template.directive';
import {
  BaseCellClickEvent,
  BaseColumnDef,
  BaseFilterEvent,
  BasePageEvent,
  BaseRow,
  BaseRowClickEvent,
  BaseSortEvent
} from '../models/table.model';
import { BasePaginatorComponent, BaseSearchInputComponent } from './base-paginator.component';
import { BaseEmptyStateComponent, BaseSparklineComponent, BaseTrendComponent } from './base-ui.components';

interface StickyMeta {
  left?: string;
  right?: string;
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
 *                          plus 10 built-in cell kinds for zero-template use.
 *  4. FILTERING         — global quick search + per-column filter row.
 *  5. STICKY HEADER     — [stickyHeader] + [maxHeight] for vertical scroll.
 *  6. STICKY COLUMNS    — column.sticky = 'left' | 'right' (requires width).
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
    BaseTrendComponent,
    BaseSparklineComponent,
    BaseEmptyStateComponent
  ],
  styles: [`
    .bt-sticky-th { position: sticky; z-index: 12; background: #f8fafc; }
    .bt-sticky-td { position: sticky; z-index: 8; background: #ffffff; }
    tr:hover .bt-sticky-td { background: inherit; }
    .bt-sticky-left-edge { box-shadow: 4px 0 6px -4px rgba(15, 23, 42, .12); }
    .bt-sticky-right-edge { box-shadow: -4px 0 6px -4px rgba(15, 23, 42, .12); }
    .bt-head-sticky th { position: sticky; top: 0; z-index: 10; background: #f8fafc; }
    .bt-head-sticky .bt-sticky-th { z-index: 14; top: 0; }
  `],
  template: `
    @if (showSearch()) {
      <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
        <base-search-input [placeholder]="searchPlaceholder()" (search)="onQuickSearch($event)" />
        <span class="text-[11px] text-slate-400">{{ filteredTotal() }} record(s)</span>
      </div>
    }

    <div class="overflow-x-auto" [style.maxHeight]="maxHeight() || null" [style.overflowY]="maxHeight() ? 'auto' : null">
      <table class="w-full" [style.minWidth]="minWidth() || null">
        <thead [class.bt-head-sticky]="stickyHeader()" class="bg-slate-50">
          <tr>
            @if (selectable() === 'multiple') {
              <th class="table-th w-8" [class.bt-sticky-th]="hasLeftSticky()" [style.left]="hasLeftSticky() ? '0px' : null">
                <input type="checkbox" [checked]="allSelected()" (change)="toggleAll($event)" aria-label="Select all rows" />
              </th>
            }
            @for (c of visibleColumns(); track c.key) {
              <th class="table-th select-none"
                  [class.text-right]="c.align === 'right'"
                  [class.text-center]="c.align === 'center'"
                  [class.cursor-pointer]="c.sortable"
                  [class.bt-sticky-th]="c.sticky"
                  [class]="stickyEdgeClass(c)"
                  [style.width]="c.width ?? null"
                  [style.minWidth]="c.width ?? null"
                  [style.left]="stickyMeta()[c.key]?.left ?? null"
                  [style.right]="stickyMeta()[c.key]?.right ?? null"
                  (click)="c.sortable && toggleSort(c.key)">
                <span class="inline-flex items-center gap-1">
                  {{ c.header }}
                  @if (c.sortable) {
                    <span class="text-[9px]" [class.text-indigo-500]="sortState().key === c.key">
                      {{ sortState().key === c.key ? (sortState().direction === 'asc' ? '▲' : '▼') : '↕' }}
                    </span>
                  }
                </span>
              </th>
            }
          </tr>

          @if (showFilterRow() && hasFilterableColumn()) {
            <tr class="bg-white">
              @if (selectable() === 'multiple') { <th class="px-2 py-1.5"></th> }
              @for (c of visibleColumns(); track c.key) {
                <th class="px-2 py-1.5 font-normal"
                    [class.bt-sticky-th]="c.sticky"
                    [style.left]="stickyMeta()[c.key]?.left ?? null"
                    [style.right]="stickyMeta()[c.key]?.right ?? null">
                  @if (c.filterable) {
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
            <tr [class]="rowClassOf(row)" (click)="onRowClick(row, i)">
              @if (selectable() === 'multiple') {
                <td class="table-td w-8" [class.bt-sticky-td]="hasLeftSticky()" [style.left]="hasLeftSticky() ? '0px' : null">
                  <input type="checkbox" [checked]="isSelected(row)"
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
                    (click)="onCellClick(row, c, i, $event)">

                  <!-- custom template ALWAYS wins -->
                  @if (templateFor(c.key); as tpl) {
                    <ng-container *ngTemplateOutlet="tpl; context: cellContext(row, c, i)" />
                  } @else {
                    @switch (c.kind ?? 'text') {
                      @case ('number') {
                        <span class="font-mono tabular-nums" [class]="extraClass(c, row)">{{ numberText(c, row) }}</span>
                      }
                      @case ('date') {
                        <span [class]="extraClass(c, row)">{{ dateText(c, row) }}</span>
                      }
                      @case ('badge') {
                        <span class="text-[10px] font-bold rounded-full px-2 py-0.5" [class]="badgeClass(c, row)">{{ cellText(c, row) }}</span>
                      }
                      @case ('dot') {
                        <span class="inline-flex items-center gap-1.5">
                          @if (hasDot(c, row)) { <i class="inline-block w-2.5 h-2.5 rounded-full" [class]="dotClass(c, row)"></i> }
                          {{ cellText(c, row) }}
                        </span>
                      }
                      @case ('trend') {
                        <base-trend [value]="trendValue(c, row)" [badWhenUp]="c.trendBadWhenUp ?? false" />
                      }
                      @case ('image') {
                        @if (cellValue(c, row); as src) {
                          <img [src]="src" [alt]="c.header" class="rounded-md object-cover border border-slate-200"
                               [style.width.px]="c.imageSize ?? 32" [style.height.px]="c.imageSize ?? 32" loading="lazy" />
                        } @else { <span class="text-slate-300">—</span> }
                      }
                      @case ('progress') {
                        <span class="inline-flex items-center gap-2 w-full">
                          <span class="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden min-w-12">
                            <span class="block h-full rounded-full" [class]="progressBarClass(c, row)" [style.width.%]="progressBarPct(c, row)"></span>
                          </span>
                          <span class="text-[10px] font-semibold text-slate-500 tabular-nums">{{ progressLabel(c, row) }}</span>
                        </span>
                      }
                      @case ('text-bar') {
                        <span class="inline-flex flex-col items-start gap-1">
                          <span class="font-semibold" [class]="extraClass(c, row)">{{ cellText(c, row) }}</span>
                          <span class="h-1 w-16 rounded-full bg-slate-100 overflow-hidden">
                            <span class="block h-full rounded-full" [class]="progressBarClass(c, row)" [style.width.%]="textBarPct(c, row)"></span>
                          </span>
                        </span>
                      }
                      @case ('sparkline') {
                        <base-sparkline [data]="sparkData(c, row)" />
                      }
                      @case ('link') {
                        <a class="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                           [href]="c.linkHref ? c.linkHref(row) : '#'"
                           [target]="(c.linkExternal ?? true) ? '_blank' : '_self'"
                           rel="noopener"
                           (click)="$event.stopPropagation()">{{ cellText(c, row) }}</a>
                      }
                      @case ('row-actions') {
                        <span class="inline-flex items-center gap-3 justify-end w-full">
                          @for (a of c.rowActions ?? []; track $index) {
                            @if (a.variant === 'button') {
                              <button type="button" class="btn-ghost border border-slate-200 py-1! px-2.5! text-[11px]"
                                      [attr.aria-label]="a.title ?? null" [title]="a.title ?? ''"
                                      (click)="$event.stopPropagation(); a.run(row)">{{ a.icon }}</button>
                            } @else {
                              <button type="button" class="text-slate-400 hover:text-indigo-600"
                                      [attr.aria-label]="a.title ?? null" [title]="a.title ?? ''"
                                      (click)="$event.stopPropagation(); a.run(row)">{{ a.icon }}</button>
                            }
                          }
                        </span>
                      }
                      @default {
                        <span [class]="extraClass(c, row)">{{ cellText(c, row) }}</span>
                      }
                    }
                  }
                </td>
              }
            </tr>
          }
          } @empty {
            <tr>
              <td [attr.colspan]="colspan()">
                <base-empty-state [title]="emptyTitle()" [hint]="emptyHint()" />
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
  /** Dynamic column definitions — plain data, changeable at runtime. */
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
  /** Show the per-column filter row (columns with filterable: true). */
  readonly showFilterRow = input(false);

  /** Keep the header visible while scrolling vertically (pair with maxHeight). */
  readonly stickyHeader = input(false);
  /** e.g. '420px' — enables vertical scrolling inside the table body. */
  readonly maxHeight = input('');
  /** Force a min table width, e.g. '1100px', so sticky columns have room to matter. */
  readonly minWidth = input('');

  /** Row selection: 'none' | 'single' (click row) | 'multiple' (checkboxes). */
  readonly selectable = input<'none' | 'single' | 'multiple'>('none');

  /** Zebra striping. */
  readonly striped = input(false);
  /** Group rows under sub-header rows (e.g. events by day). Return null to leave a row ungrouped. */
  readonly groupBy = input<((row: T) => string | null) | null>(null);
  /** When set, group headers get an action button emitting (groupAction). */
  readonly groupActionLabel = input('');
  /** 'accent' (default): indigo header with row count. 'plain': muted uppercase section divider. 'light': white header, bold label, count pill, solid action button. */
  readonly groupHeaderStyle = input<'accent' | 'plain' | 'light'>('accent');
  /** Unit label after the row count, e.g. 'row(s)' (default) or 'events'. */
  readonly groupCountLabel = input('row(s)');
  /** Highlight the row whose trackKey value matches (external selection). */
  readonly highlightKey = input<string | null>(null);
  readonly emptyTitle = input('No matching records');
  readonly emptyHint = input('Try adjusting filters or search.');

  readonly rowClick = output<BaseRowClickEvent<T>>();
  readonly cellClick = output<BaseCellClickEvent<T>>();
  readonly sortChange = output<BaseSortEvent>();
  readonly pageChange = output<BasePageEvent>();
  readonly filterChange = output<BaseFilterEvent>();
  readonly selectionChange = output<T[]>();
  /** Fired with the group key when a group-header action button is clicked. */
  readonly groupAction = output<string>();

  private readonly cellTemplates = contentChildren(BaseCellDirective<T>);

  readonly sortState = signal<BaseSortEvent>({ key: null, direction: null });
  readonly quickText = signal('');
  readonly columnFilters = signal<Record<string, string>>({});
  private readonly pageState = signal(1);
  readonly pageSize = signal(10);
  private readonly selected = signal<Map<unknown, T>>(new Map());

  constructor() {
    // initialise page size from input once it resolves
    queueMicrotask(() => this.pageSize.set(this.initialPageSize()));
  }

  // derived view pipeline: filter → sort → paginate
  readonly visibleColumns = computed(() => {
    const cols = this.columns().filter(c => !c.hidden);
    // keep authoring order, but pin left-sticky first / right-sticky last so
    // offsets are always well-defined.
    const left = cols.filter(c => c.sticky === 'left');
    const mid = cols.filter(c => !c.sticky);
    const right = cols.filter(c => c.sticky === 'right');
    return [...left, ...mid, ...right];
  });

  readonly hasLeftSticky = computed(() => this.visibleColumns().some(c => c.sticky === 'left'));
  readonly hasFilterableColumn = computed(() => this.visibleColumns().some(c => c.filterable));

  /** Cumulative px offsets for pinned columns. */
  readonly stickyMeta = computed<Record<string, StickyMeta>>(() => {
    const meta: Record<string, StickyMeta> = {};
    const cols = this.visibleColumns();
    const checkboxOffset = this.selectable() === 'multiple' ? 32 : 0;
    let left = checkboxOffset;
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

  readonly colspan = computed(() =>
    this.visibleColumns().length + (this.selectable() === 'multiple' ? 1 : 0)
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

  private emitFilter(): void {
    this.filterChange.emit({ quick: this.quickText(), columns: this.columnFilters() });
  }

  onPage(ev: BasePageEvent): void {
    this.pageState.set(ev.page);
    this.pageSize.set(ev.pageSize);
    this.pageChange.emit(ev);
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
    this.selected.update(m => {
      const next = new Map(m);
      const k = this.rowTrack(row);
      if (next.has(k)) next.delete(k); else next.set(k, row);
      return next;
    });
    this.selectionChange.emit([...this.selected().values()]);
  }

  toggleAll(ev: Event): void {
    const checked = (ev.target as HTMLInputElement).checked;
    this.selected.update(m => {
      const next = new Map(m);
      for (const r of this.pagedRows()) {
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

  templateFor(key: string) {
    return this.cellTemplates().find(t => t.baseCell() === key)?.template ?? null;
  }

  cellContext(row: T, column: BaseColumnDef<T>, index: number) {
    return { $implicit: row, value: this.cellValue(column, row), column, index };
  }

  rowTrack(row: T): unknown {
    return (row as BaseRow)[this.trackKey()];
  }

  rowClassOf(row: T): string {
    const clickable = this.selectable() !== 'none' ? 'cursor-pointer' : '';
    const highlighted =
      this.highlightKey() != null && String(this.rowTrack(row)) === this.highlightKey();
    const sel = this.isSelected(row) || highlighted ? 'bg-indigo-50' : '';
    return `transition-colors hover:bg-indigo-50/50 ${clickable} ${sel}`.trim();
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

  cellValue(c: BaseColumnDef<T>, row: T): unknown {
    return c.value ? c.value(row) : (row as BaseRow)[c.key];
  }

  cellText(c: BaseColumnDef<T>, row: T): string {
    const v = this.cellValue(c, row);
    if (c.format) return c.format(row, v);
    return v === null || v === undefined || v === '' ? '—' : String(v);
  }

  numberText(c: BaseColumnDef<T>, row: T): string {
    const v = this.cellValue(c, row);
    if (c.format) return c.format(row, v);
    if (v === null || v === undefined || v === '') return '—';
    return new Intl.NumberFormat(undefined, c.numberFormat).format(Number(v));
  }

  dateText(c: BaseColumnDef<T>, row: T): string {
    const v = this.cellValue(c, row);
    if (c.format) return c.format(row, v);
    if (!v) return '—';
    const d = v instanceof Date ? v : new Date(v as string | number);
    return isNaN(d.getTime())
      ? String(v)
      : new Intl.DateTimeFormat(undefined, c.dateFormat ?? { dateStyle: 'medium' }).format(d);
  }

  extraClass(c: BaseColumnDef<T>, row: T): string {
    return c.cellClass ? c.cellClass(row) : '';
  }

  badgeClass(c: BaseColumnDef<T>, row: T): string {
    return c.badgeClassMap?.[String(this.cellValue(c, row))] ?? 'bg-slate-100 text-slate-500';
  }

  hasDot(c: BaseColumnDef<T>, row: T): boolean {
    return !!c.dotClassMap?.[String(this.cellValue(c, row))];
  }

  dotClass(c: BaseColumnDef<T>, row: T): string {
    return c.dotClassMap?.[String(this.cellValue(c, row))] ?? 'bg-slate-300';
  }

  trendValue(c: BaseColumnDef<T>, row: T): number | null {
    const v = this.cellValue(c, row);
    return v === null || v === undefined ? null : Number(v);
  }

  progressValue(c: BaseColumnDef<T>, row: T): number {
    const v = Number(this.cellValue(c, row));
    return isNaN(v) ? 0 : Math.min(100, Math.max(0, Math.round(v)));
  }

  /**
   * Bar width as a % of `progressMax` (defaults to 100, i.e. the raw value is
   * already 0–100). Any positive value gets a minimum visible sliver — on a
   * skewed dataset (one dominant value, several tiny ones) a strict linear
   * scale would render the small rows as an invisible 0px bar.
   */
  progressBarPct(c: BaseColumnDef<T>, row: T): number {
    return this.barPct(Number(this.cellValue(c, row)), c.progressMax ?? 100);
  }

  /** Same scaling as `progressBarPct`, but reads `barValue` (kind 'text-bar') instead of the cell's own value. */
  textBarPct(c: BaseColumnDef<T>, row: T): number {
    const raw = c.barValue ? c.barValue(row) : this.cellValue(c, row);
    return this.barPct(Number(raw), c.progressMax ?? 100);
  }

  private barPct(v: number, max: number): number {
    if (isNaN(v) || v <= 0) return 0;
    const pct = Math.min(100, (v / max) * 100);
    return Math.max(Math.round(pct), 4);
  }

  progressBarClass(c: BaseColumnDef<T>, row: T): string {
    return c.barClass ? c.barClass(row) : 'bg-indigo-500';
  }

  /** Formatted value when `format` is given (e.g. "2.15"), else the rounded 0–100 value. */
  progressLabel(c: BaseColumnDef<T>, row: T): string {
    return c.format ? this.cellText(c, row) : `${this.progressValue(c, row)}%`;
  }

  sparkData(c: BaseColumnDef<T>, row: T): number[] {
    const v = this.cellValue(c, row);
    return Array.isArray(v) ? (v as number[]) : [];
  }

  private widthPx(c: BaseColumnDef<T>): number {
    const n = parseInt(c.width ?? '', 10);
    return isNaN(n) ? 120 : n;
  }
}
