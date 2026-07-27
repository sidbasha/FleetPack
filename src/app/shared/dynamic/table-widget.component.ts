import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  BaseColumnDef,
  BasePageEvent,
  BasePaginatorComponent,
  BaseTableComponent
} from '../../base';
import { ColumnDef, TableWidget } from './widget.model';

type Row = Record<string, unknown>;

/**
 * Adapter: renders the legacy TableWidget config through the BASE MODULE's
 * <base-table> + <base-paginator>. All table rendering (cells, groups,
 * selection highlight, pagination UI) is delegated to the base library.
 */
@Component({
  selector: 'fam-table-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseTableComponent, BasePaginatorComponent],
  template: `
    <base-table
      [columns]="baseColumns()"
      [rows]="widget().rows"
      [trackKey]="widget().trackKey"
      [paginate]="false"
      [showSearch]="false"
      [groupBy]="widget().groupBy ?? null"
      [groupHeaderStyle]="widget().groupHeaderStyle ?? 'accent'"
      [groupCountLabel]="widget().groupCountLabel ?? 'row(s)'"
      [groupActionLabel]="widget().groupAction?.label ?? ''"
      [highlightKey]="widget().selectedKey ?? null"
      emptyTitle="No records"
      emptyHint=""
      (groupAction)="widget().groupAction?.run($event)"
      (rowClick)="widget().onRowClick?.($event.row)" />

    @if (widget().pagination || widget().footer) {
      <div class="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <span class="text-[11px] text-slate-400">{{ widget().footer ?? '' }}</span>
        @if (widget().pagination; as p) {
          <base-paginator
            [page]="p.page"
            [total]="p.total ?? 0"
            [pageCountOverride]="p.pageCount"
            [showPageSize]="false"
            (pageChange)="onPage($event)" />
        }
      </div>
    }
  `
})
export class TableWidgetComponent {
  readonly widget = input.required<TableWidget<Row>>();

  protected readonly baseColumns = computed<BaseColumnDef<Row>[]>(() =>
    this.widget().columns.map(c => this.mapColumn(c))
  );

  private mapColumn(c: ColumnDef<Row>): BaseColumnDef<Row> {
    const mono = c.kind === 'mono';
    return {
      key: c.key,
      header: c.header,
      kind: mono ? 'text' : ((c.kind ?? 'text') as Exclude<import('./widget.model').CellKind, 'mono'>),
      align: c.align === 'right' ? 'right' : 'left',
      width: c.width,
      sortable: c.sortable,
      value: c.value,
      format: c.format ? (row) => c.format!(row) : undefined,
      cellClass: (row) =>
        [mono ? 'font-mono' : '', c.classFn ? c.classFn(row) : ''].join(' ').trim(),
      badgeClassMap: c.badgeClassMap,
      dotClassMap: c.dotClassMap,
      trendBadWhenUp: c.trendBadWhenUp,
      progressMax: c.progressMax,
      barClass: c.barClass,
      barValue: c.barValue,
      rowActions: c.rowActions
    };
  }

  /** Bridge the paginator's absolute page target to the legacy prev/next API. */
  onPage(ev: BasePageEvent): void {
    const p = this.widget().pagination;
    if (!p) return;
    const delta = ev.page - p.page;
    for (let i = 0; i < Math.abs(delta); i++) {
      delta > 0 ? p.onNext() : p.onPrev();
    }
  }
}
