import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, computed, signal, viewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ActiveElement } from 'chart.js';
import { BaseKpiCardComponent, BaseProgressBarComponent, BaseTrendComponent, toggleInSet } from '../../base';
import { ChartWidget, KpiGridWidget, LegendItem, RankedListWidget } from './widget.model';

@Component({
  selector: 'fam-kpi-grid-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseKpiCardComponent],
  template: `
    <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));">
      @for (k of widget.kpis; track k.label) {
        <base-kpi-card [label]="k.label" [value]="k.value" [unit]="k.unit ?? ''" [sub]="k.sub ?? ''" [accent]="k.accent ?? false" />
      }
    </div>
  `
})
export class KpiGridWidgetComponent {
  @Input({ required: true }) widget!: KpiGridWidget;
}

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
    @if (widget.legend?.length) {
      <div class="flex items-center justify-between flex-wrap gap-3 px-4 pb-3 border-t border-slate-100 pt-3">
        <div class="flex items-center flex-wrap gap-4">
          @for (l of widget.legend; track l.label) {
            <span class="chip" [class.cursor-pointer]="hasDataset(l)" [class.opacity-40]="isDimmed(l)"
                  [attr.title]="hasDataset(l) ? 'Click to toggle ' + l.label : null"
                  (click)="toggleLegend(l)">
              <i class="chip-dot" [style.background]="l.color"></i>{{ l.label }}
            </span>
          }
        </div>
        @if (hasFilterableDataset()) {
          <button type="button" class="text-[11px] font-semibold" [class]="isFiltered() ? 'text-action cursor-pointer' : 'text-slate-300 cursor-default'"
                  [disabled]="!isFiltered()" (click)="resetFilter()">
            Reset Filter
          </button>
        }
      </div>
    }
    @if (widget.footnote) {
      <p class="px-4 pb-3 text-[11px] text-slate-400">{{ widget.footnote }}</p>
    }
  `
})
export class ChartWidgetComponent implements OnChanges {
  @Input({ required: true }) widget!: ChartWidget;

  private readonly chartRef = viewChild(BaseChartDirective);
  /**
   * Click legend chips to select which datasets show — any number at once, matched by
   * label since legend/dataset order isn't guaranteed to line up (some legend entries
   * have no dataset at all).
   */
  protected readonly filteredLabels = signal<ReadonlySet<string>>(new Set());
  protected readonly isFiltered = computed(() => this.filteredLabels().size > 0);

  ngOnChanges(changes: SimpleChanges): void {
    // A new widget (different data/datasets) starts unfiltered — stale labels could
    // otherwise mismatch a completely different dataset list.
    if (changes['widget']) this.filteredLabels.set(new Set());
  }

  onClick(e: { active?: object[] }): void {
    const active = e.active as ActiveElement[] | undefined;
    const hit = active?.[0];
    if (hit && this.widget.onPointClick) {
      this.widget.onPointClick(hit.datasetIndex, hit.index);
    }
  }

  hasDataset(item: LegendItem): boolean {
    return (this.widget.data.datasets ?? []).some(d => d.label === item.label);
  }

  hasFilterableDataset(): boolean {
    return (this.widget.legend ?? []).some(l => this.hasDataset(l));
  }

  isDimmed(item: LegendItem): boolean {
    const f = this.filteredLabels();
    return f.size > 0 && !f.has(item.label);
  }

  toggleLegend(item: LegendItem): void {
    if (!this.hasDataset(item)) return;
    this.filteredLabels.update(current => toggleInSet(current, item.label));
    this.applyVisibility();
  }

  resetFilter(): void {
    this.filteredLabels.set(new Set());
    this.applyVisibility();
  }

  private applyVisibility(): void {
    const directive = this.chartRef();
    if (!directive) return;
    const f = this.filteredLabels();
    (this.widget.data.datasets ?? []).forEach((d, i) => {
      directive.hideDataset(i, f.size > 0 && !f.has(d.label ?? ''));
    });
    directive.update();
  }
}

@Component({
  selector: 'fam-ranked-list-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseTrendComponent, BaseProgressBarComponent],
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
              <span class="block text-xs font-semibold truncate" [class]="it.titleClass ?? 'text-slate-700 group-hover:text-indigo-700'">{{ it.title }}</span>
              @if (it.subtitle) { <span class="block truncate" [class]="it.subtitleClass ?? 'text-[10px] text-slate-400'">{{ it.subtitle }}</span> }
              @if (it.barPct != null) {
                <span class="block mt-1.5">
                  <base-progress-bar [value]="it.barPct!" [color]="it.barColor ?? '#6366f1'" [showLabel]="false" [height]="8" />
                </span>
              }
            </span>
            <span class="text-sm font-bold font-mono text-slate-800">{{ it.value }}</span>
            @if (it.trendPct !== undefined) {
              <base-trend [value]="it.trendPct ?? null" [badWhenUp]="widget.trendBadWhenUp ?? false" />
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
