import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlarmStore } from '../../core/state/alarm.store';
import { FilterStore } from '../../core/state/filter.store';
import { LoadingComponent } from '../../shared/components/ui.components';
import { DynamicPageComponent } from '../../shared/dynamic/dynamic-page.component';
import { BaseSelectComponent, BaseSelectOption } from '../../base';
import { WidgetConfig } from '../../shared/dynamic/widget.model';
import { AlarmCategory, GlobalFilters } from '../../core/models/models';
import { FILTER_OPTIONS } from '../../core/constants/app.constants';

const CAT_COLORS: Record<AlarmCategory, string> = {
  'Equipment Safety': '#ef4444',
  'Attention Flags': '#f59e0b',
  'Data Integrity': '#6366f1',
  'Irrecoverable': '#7c3aed'
};

const ALL_CATEGORIES = Object.keys(CAT_COLORS) as AlarmCategory[];

@Component({
  selector: 'fam-alarm-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoadingComponent, DynamicPageComponent, BaseSelectComponent],
  template: `
    <div class="flex flex-wrap items-end gap-x-8 gap-y-3">
      <h1 class="text-lg font-bold text-slate-900">Alarm Explorer</h1>
      <div class="flex-1"></div>
      <span class="flex flex-col items-end leading-tight">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Date Range</label>
        <span class="text-[11px] font-medium text-slate-600 mt-0.5">{{ filters.dateRangeLabel() }}</span>
      </span>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Model</label>
        <base-select class="w-36" [options]="modelOptions" [value]="model()" (valueChange)="model.set($event ?? 'All Models')" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Fleet</label>
        <base-select class="w-36" [options]="fleetOptions()" [value]="fleet()" (valueChange)="fleet.set($event ?? 'All Fleets')" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Category</label>
        <base-select class="w-36" [options]="categoryOptions" [value]="category()" (valueChange)="category.set($event ?? 'All Categories')" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Duration</label>
        <base-select class="w-32" [options]="durationOptions" [value]="duration()" (valueChange)="duration.set($event ?? durationOptions[0].value)" />
      </div>
    </div>

    @if (store.homeLoading()) {
      <fam-loading what="alarm volume" />
    } @else {
      <fam-dynamic-page class="block mt-3.5" [widgets]="widgets()" />
    }
  `
})
export class AlarmHomeComponent implements OnInit {
  store = inject(AlarmStore);
  filters = inject(FilterStore);
  private router = inject(Router);

  readonly view = signal<'trend' | 'pareto'>('trend');
  readonly model = signal('All Models');
  readonly fleet = signal('All Fleets');
  readonly category = signal('All Categories');
  readonly duration = signal<GlobalFilters['duration']>('Last 13 Weeks');

  readonly modelOptions: BaseSelectOption<string>[] = [{ label: 'All Models', value: 'All Models' }];
  readonly categoryOptions: BaseSelectOption<string>[] = [
    { label: 'All Categories', value: 'All Categories' },
    ...ALL_CATEGORIES.map(c => ({ label: c, value: c }))
  ];
  readonly durationOptions: BaseSelectOption<GlobalFilters['duration']>[] = FILTER_OPTIONS.durations.map(d => ({ label: d, value: d }));

  readonly fleetOptions = computed<BaseSelectOption<string>[]>(() => [
    { label: 'All Fleets', value: 'All Fleets' },
    ...(this.store.home()?.fleets.map(f => ({ label: f.fleetName, value: f.fleetName })) ?? [])
  ]);

  private readonly visibleFleets = computed(() => {
    const all = this.store.home()?.fleets ?? [];
    const fleet = this.fleet();
    return fleet === 'All Fleets' ? all : all.filter(f => f.fleetName === fleet);
  });

  private readonly visibleCategories = computed(() => {
    const cat = this.category();
    return cat === 'All Categories' ? ALL_CATEGORIES : [cat as AlarmCategory];
  });

  readonly widgets = computed<WidgetConfig[]>(() => {
    const home = this.store.home();
    if (!home) return [];

    const cats = this.visibleCategories();
    const pareto = this.view() === 'pareto';
    const fleets = this.visibleFleets();
    const dateRange = { from: this.filters.filters().dateFrom, to: this.filters.filters().dateTo };

    let chartData;
    if (pareto) {
      const sorted = [...fleets].sort((a, b) => b.totalAlarms - a.totalAlarms);
      const total = sorted.reduce((a, f) => a + f.totalAlarms, 0) || 1;
      let cum = 0;
      chartData = {
        labels: sorted.map(f => f.fleetName),
        datasets: [
          {
            type: 'line' as const, label: 'Cumulative %', yAxisID: 'y1',
            data: sorted.map(f => { cum += f.totalAlarms; return Math.round((cum / total) * 1000) / 10; }),
            borderColor: '#0ea5e9', pointRadius: 3, tension: 0.25, borderWidth: 2
          },
          { label: 'Alarms', data: sorted.map(f => f.totalAlarms), backgroundColor: 'rgba(99,102,241,.8)', borderRadius: 4 }
        ]
      };
    } else {
      chartData = {
        labels: home.volume.map(v => v.workWeek),
        datasets: cats.map(cat => ({
          label: cat,
          data: home.volume.map(v => v.byCategory[cat]),
          backgroundColor: CAT_COLORS[cat],
          stack: 'alarms',
          borderRadius: 2
        }))
      };
    }

    return [
      {
        id: 'alarm-volume', type: 'chart', badge: 'FAM', colSpan: 4,
        title: 'Alarm Volume: All Fleets',
        subtitle: 'Fleet Summary',
        dateRange,
        tabs: {
          items: [{ id: 'trend', label: 'Trend' }, { id: 'pareto', label: 'Pareto' }],
          activeId: this.view(),
          onChange: id => this.view.set(id as 'trend' | 'pareto')
        },
        legend: cats.map(c => ({ label: c, color: CAT_COLORS[c] })),
        chartType: 'bar', height: 320,
        data: chartData,
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
          scales: {
            x: { stacked: !pareto, ticks: { font: { size: 10 } }, grid: { display: false } },
            y: { stacked: !pareto, ticks: { font: { size: 10 } }, grid: { color: '#f1f5f9' } },
            y1: { position: 'right', min: 0, max: 100, display: pareto, ticks: { callback: v => `${v}%`, font: { size: 10 } }, grid: { display: false } }
          }
        }
      },
      {
        id: 'fleet-breakdown', type: 'ranked-list', badge: 'FAM', colSpan: 2,
        title: 'Fleet Breakdown',
        subtitle: 'Click a fleet to drill down',
        actions: [{ label: '↓ Export', run: () => void 0 }],
        footnote: 'Click a fleet row to see tool-level breakdown →',
        trendBadWhenUp: true,
        items: fleets.map(f => ({
          key: f.fleetId, rank: f.rank,
          title: f.fleetName, subtitle: `${f.toolCount} tools`,
          value: f.totalAlarms, trendPct: f.trendPct
        })),
        onItemClick: item => this.router.navigate(['/alarm-explorer/fleet', item.key])
      }
    ];
  });

  ngOnInit(): void {
    this.store.loadHome();
  }
}
