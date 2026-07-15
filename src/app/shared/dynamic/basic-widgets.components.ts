import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ActiveElement } from 'chart.js';
import { KpiComponent, TrendPillComponent } from '../components/ui.components';
import { ChartWidget, KpiGridWidget, RankedListWidget } from './widget.model';

// ── KPI grid ──
@Component({
  selector: 'fam-kpi-grid-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KpiComponent],
  template: `
    <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));">
      @for (k of widget.kpis; track k.label) {
        <fam-kpi [label]="k.label" [value]="k.value" [unit]="k.unit ?? ''" [sub]="k.sub ?? ''" [accent]="k.accent ?? false" />
      }
    </div>
  `
})
export class KpiGridWidgetComponent {
  @Input({ required: true }) widget!: KpiGridWidget;
}

// ── Chart.js chart ──
@Component({
  selector: 'fam-chart-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective],
  template: `
    <div class="p-4" [style.height.px]="widget.height ?? 288">
      <canvas baseChart
              [type]="widget.chartType"
              [data]="widget.data"
              [options]="widget.options ?? {}"
              (chartClick)="onClick($event)"></canvas>
    </div>
    @if (widget.footnote) {
      <p class="px-4 pb-3 text-[11px] text-slate-400">{{ widget.footnote }}</p>
    }
  `
})
export class ChartWidgetComponent {
  @Input({ required: true }) widget!: ChartWidget;

  onClick(e: { active?: object[] }): void {
    const active = e.active as ActiveElement[] | undefined;
    const hit = active?.[0];
    if (hit && this.widget.onPointClick) {
      this.widget.onPointClick(hit.datasetIndex, hit.index);
    }
  }
}

// ── Ranked drill-down list ──
@Component({
  selector: 'fam-ranked-list-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TrendPillComponent],
  template: `
    <ul class="divide-y divide-slate-100">
      @for (it of widget.items; track it.key) {
        <li>
          <button class="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors group"
                  [class]="itemClass()"
                  (click)="widget.onItemClick?.(it)">
            @if (it.rank != null) {
              <span class="w-6 h-6 shrink-0 rounded-md bg-slate-100 grid place-items-center text-[11px] font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700">{{ it.rank }}</span>
            }
            <span class="flex-1 min-w-0">
              <span class="block text-xs font-semibold text-slate-700 group-hover:text-indigo-700 truncate">{{ it.title }}</span>
              @if (it.subtitle) { <span class="block text-[10px] text-slate-400 truncate">{{ it.subtitle }}</span> }
              @if (it.barPct != null) {
                <span class="block mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <span class="block h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" [style.width.%]="it.barPct"></span>
                </span>
              }
            </span>
            <span class="text-sm font-bold font-mono text-slate-800">{{ it.value }}</span>
            @if (it.trendPct !== undefined) {
              <fam-trend [value]="it.trendPct ?? null" [badWhenUp]="widget.trendBadWhenUp ?? false" />
            }
            @if (widget.onItemClick) { <span class="text-slate-300 group-hover:text-indigo-500">›</span> }
          </button>
        </li>
      }
    </ul>
    @if (widget.footnote) {
      <p class="px-4 py-3 text-[11px] text-slate-400 border-t border-slate-100">{{ widget.footnote }}</p>
    }
  `
})
export class RankedListWidgetComponent {
  @Input({ required: true }) widget!: RankedListWidget;

  itemClass(): string {
    return this.widget.onItemClick ? 'hover:bg-indigo-50/60 cursor-pointer' : 'cursor-default';
  }
}
