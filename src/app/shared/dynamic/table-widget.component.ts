import { Component, Input } from '@angular/core';
import { TrendPillComponent } from '../components/ui.components';
import { ColumnDef, TableWidget } from './widget.model';

type Row = Record<string, unknown>;

@Component({
  selector: 'fam-table-widget',
  standalone: true,
  imports: [TrendPillComponent],
  template: `
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-50">
          <tr>
            @for (c of widget.columns; track c.key) {
              <th class="table-th" [class.text-right]="c.align === 'right'" [style.width]="c.width ?? null">{{ c.header }}</th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @for (g of groups(); track g.key) {
            @if (g.key !== NO_GROUP) {
              <tr class="bg-indigo-50/60">
                <td [attr.colspan]="widget.groupAction ? widget.columns.length - 1 : widget.columns.length"
                    class="px-3 py-1.5 text-[11px] font-bold text-indigo-800">
                  {{ g.key }} <span class="font-medium text-indigo-400">· {{ g.rows.length }} rows</span>
                </td>
                @if (widget.groupAction) {
                  <td class="px-3 py-1.5 text-right">
                    <button class="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                            (click)="widget.groupAction!.run(g.key)">{{ widget.groupAction!.label }}</button>
                  </td>
                }
              </tr>
            }
            @for (row of g.rows; track trackOf(row)) {
              <tr [class]="rowClass(row)" (click)="widget.onRowClick?.(row)">
                @for (c of widget.columns; track c.key) {
                  <td class="table-td" [class.text-right]="c.align === 'right'">
                    @switch (c.kind ?? 'text') {
                      @case ('mono') {
                        <span class="font-mono" [class]="extraClass(c, row)">{{ cellText(c, row) }}</span>
                      }
                      @case ('badge') {
                        <span class="text-[10px] font-bold rounded-full px-2 py-0.5" [class]="badgeClass(c, row)">{{ cellText(c, row) }}</span>
                      }
                      @case ('dot') {
                        <span class="inline-flex items-center gap-1.5">
                          <i class="chip-dot rounded-full" [class]="dotClass(c, row)"></i>{{ cellText(c, row) }}
                        </span>
                      }
                      @case ('trend') {
                        <fam-trend [value]="trendValue(c, row)" [badWhenUp]="c.trendBadWhenUp ?? false" />
                      }
                      @default {
                        <span [class]="extraClass(c, row)">{{ cellText(c, row) }}</span>
                      }
                    }
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>

    @if (widget.pagination || widget.footer) {
      <div class="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-3 text-[11px] text-slate-400">
        <span>{{ widget.footer ?? '' }}</span>
        @if (widget.pagination; as p) {
          <span class="flex items-center gap-2 text-xs text-slate-500">
            <button class="btn-ghost" (click)="p.onPrev()" [disabled]="p.page === 1">‹ Prev</button>
            Page <b>{{ p.page }}</b> of {{ p.pageCount }}
            <button class="btn-ghost" (click)="p.onNext()" [disabled]="p.page === p.pageCount">Next ›</button>
          </span>
        }
      </div>
    }
  `
})
export class TableWidgetComponent {
  @Input({ required: true }) widget!: TableWidget<Row>;

  readonly NO_GROUP = '__nogroup__';

  groups(): { key: string; rows: Row[] }[] {
    const { rows, groupBy } = this.widget;
    if (!groupBy) return [{ key: this.NO_GROUP, rows }];
    const map = new Map<string, Row[]>();
    for (const r of rows) {
      const k = groupBy(r);
      const arr = map.get(k) ?? [];
      arr.push(r);
      map.set(k, arr);
    }
    return [...map.entries()].map(([key, rws]) => ({ key, rows: rws }));
  }

  trackOf(row: Row): unknown {
    return row[this.widget.trackKey];
  }

  rowClass(row: Row): string {
    const clickable = this.widget.onRowClick ? 'cursor-pointer hover:bg-indigo-50/50' : '';
    const selected =
      this.widget.selectedKey != null && String(row[this.widget.trackKey]) === this.widget.selectedKey
        ? 'bg-indigo-50'
        : '';
    return `transition-colors ${clickable} ${selected}`.trim();
  }

  private cellValue(c: ColumnDef<Row>, row: Row): unknown {
    return c.value ? c.value(row) : row[c.key];
  }

  cellText(c: ColumnDef<Row>, row: Row): string {
    if (c.format) return c.format(row);
    const v = this.cellValue(c, row);
    return v === null || v === undefined || v === '' ? '—' : String(v);
  }

  extraClass(c: ColumnDef<Row>, row: Row): string {
    return c.classFn ? c.classFn(row) : '';
  }

  badgeClass(c: ColumnDef<Row>, row: Row): string {
    return c.badgeClassMap?.[String(this.cellValue(c, row))] ?? 'bg-slate-100 text-slate-500';
  }

  dotClass(c: ColumnDef<Row>, row: Row): string {
    return c.dotClassMap?.[String(this.cellValue(c, row))] ?? 'bg-state-gap';
  }

  trendValue(c: ColumnDef<Row>, row: Row): number | null {
    const v = this.cellValue(c, row);
    return v === null || v === undefined ? null : Number(v);
  }
}
