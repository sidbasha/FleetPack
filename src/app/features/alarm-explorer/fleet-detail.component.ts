import { ChangeDetectionStrategy, Component, Input, OnChanges, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlarmStore } from '../../core/state/alarm.store';
import { FilterStore } from '../../core/state/filter.store';
import { LoadingComponent } from '../../shared/components/ui.components';
import { BaseBreadcrumbsComponent, BaseSelectComponent, BaseSelectOption } from '../../base';
import { DynamicPageComponent } from '../../shared/dynamic/dynamic-page.component';
import { WidgetConfig } from '../../shared/dynamic/widget.model';
import { AlarmCategory } from '../../core/models/models';

const CAT_COLORS: Record<AlarmCategory, string> = {
  'Equipment Safety': '#ef4444',
  'Attention Flags': '#f59e0b',
  'Data Integrity': '#6366f1',
  'Irrecoverable': '#7c3aed'
};

const CAT_BAR_COLOR: Record<AlarmCategory, string> = {
  'Equipment Safety': '#ef4444',
  'Attention Flags': '#f59e0b',
  'Data Integrity': '#3b82f6',
  'Irrecoverable': '#7c3aed'
};

const ALL_CATEGORIES = Object.keys(CAT_COLORS) as AlarmCategory[];

@Component({
  selector: 'fam-fleet-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoadingComponent, DynamicPageComponent, BaseBreadcrumbsComponent, BaseSelectComponent],
  template: `
    <div class="flex flex-wrap items-end gap-x-8 gap-y-3">
      <div>
        <base-breadcrumbs class="block mb-0.5" [items]="crumbs" />
        <h1 class="text-lg font-bold text-slate-900">{{ store.fleetDetail()?.fleet?.fleetName ?? '…' }}</h1>
      </div>
      <div class="flex-1"></div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Alarm ID</label>
        <base-select class="w-36" [options]="alarmIdOptions()" [value]="alarmIdFilter()" (valueChange)="alarmIdFilter.set($event ?? 'All Alarms')" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Tools</label>
        <base-select class="w-36" [options]="toolOptions()" [value]="toolFilter()" (valueChange)="toolFilter.set($event ?? 'All Tools')" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Category</label>
        <base-select class="w-36" [options]="categoryOptions" [value]="categoryFilter()" (valueChange)="categoryFilter.set($event ?? 'All Categories')" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">SW Version</label>
        <base-select class="w-36" [options]="swVersionOptions()" [value]="swVersionFilter()" (valueChange)="swVersionFilter.set($event ?? 'All Versions')" />
      </div>
    </div>

    @if (store.fleetLoading()) {
      <fam-loading what="fleet alarm detail" />
    } @else {
      @if (store.fleetDetail(); as d) {
        <div class="panel mt-4 overflow-hidden">
          <div class="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div class="flex-1 px-5 py-4 min-w-0">
              <span class="kpi-label">Top Category:</span>
              <span class="block text-lg font-bold text-slate-800 mt-1">{{ d.topCategory }}</span>
              <span class="block text-[11px] text-slate-400 mt-0.5">Category observation</span>
            </div>
            <div class="flex-1 px-5 py-4 min-w-0">
              <span class="kpi-label">SW Versions:</span>
              <span class="block text-lg font-bold text-slate-800 mt-1 font-mono">{{ swVersionRange() }}</span>
              <span class="block text-[11px] text-slate-400 mt-0.5">Versions used</span>
            </div>
            <div class="flex-1 px-5 py-4 min-w-0">
              <span class="kpi-label">Tools:</span>
              <span class="block text-2xl font-bold text-slate-800 mt-1">{{ d.tools.length }}</span>
              <span class="block text-[11px] text-slate-400 mt-0.5">Reporting alarms</span>
            </div>
            <div class="flex-1 px-5 py-4 min-w-0">
              <span class="kpi-label">Total Alarms:</span>
              <span class="block text-2xl font-bold text-slate-800 mt-1">{{ d.fleet.totalAlarms }}</span>
              <span class="block text-[11px] text-slate-400 mt-0.5">In records</span>
            </div>
            <div class="flex-1 px-5 py-4 min-w-0">
              <span class="kpi-label">Period Trend:</span>
              <span class="block text-2xl font-bold text-red-600 mt-1">+{{ d.fleet.trendPct }}%</span>
              <span class="block text-[11px] text-slate-400 mt-0.5">vs prior period</span>
            </div>
          </div>
        </div>
      }
      <fam-dynamic-page class="block mt-3.5" [widgets]="widgets()" />
    }
  `
})
export class FleetDetailComponent implements OnChanges {
  @Input({ required: true }) fleetId = '';

  store = inject(AlarmStore);
  filters = inject(FilterStore);
  private router = inject(Router);

  readonly view = signal<'trend' | 'pareto'>('trend');
  readonly alarmIdFilter = signal('All Alarms');
  readonly toolFilter = signal('All Tools');
  readonly categoryFilter = signal('All Categories');
  readonly swVersionFilter = signal('All Versions');

  readonly categoryOptions: BaseSelectOption<string>[] = [
    { label: 'All Categories', value: 'All Categories' },
    ...ALL_CATEGORIES.map(c => ({ label: c, value: c }))
  ];

  get crumbs() {
    return [
      { label: 'Alarm Explorer', url: '/alarm-explorer' },
      { label: this.fleetId }
    ];
  }

  readonly alarmIdOptions = computed<BaseSelectOption<string>[]>(() => [
    { label: 'All Alarms', value: 'All Alarms' },
    ...(this.store.fleetDetail()?.topAlarms.map(a => ({ label: a.alarmId, value: a.alarmId })) ?? [])
  ]);

  readonly toolOptions = computed<BaseSelectOption<string>[]>(() => [
    { label: 'All Tools', value: 'All Tools' },
    ...(this.store.fleetDetail()?.tools.map(t => ({ label: t.toolId, value: t.toolId })) ?? [])
  ]);

  readonly swVersionOptions = computed<BaseSelectOption<string>[]>(() => [
    { label: 'All Versions', value: 'All Versions' },
    ...(this.store.fleetDetail()?.swVersions.map(v => ({ label: v, value: v })) ?? [])
  ]);

  readonly swVersionRange = computed(() => {
    const v = this.store.fleetDetail()?.swVersions ?? [];
    return v.length ? `${v[0]} - ${v[v.length - 1]}` : '—';
  });

  private readonly visibleCategories = computed(() => {
    const cat = this.categoryFilter();
    return cat === 'All Categories' ? ALL_CATEGORIES : [cat as AlarmCategory];
  });

  private readonly visibleTools = computed(() => {
    const d = this.store.fleetDetail();
    if (!d) return [];
    const tool = this.toolFilter();
    const sw = this.swVersionFilter();
    return d.tools.filter(t =>
      (tool === 'All Tools' || t.toolId === tool) &&
      (sw === 'All Versions' || t.swVersion === sw)
    );
  });

  private readonly visibleTopAlarms = computed(() => {
    const d = this.store.fleetDetail();
    if (!d) return [];
    const alarmId = this.alarmIdFilter();
    return alarmId === 'All Alarms' ? d.topAlarms : d.topAlarms.filter(a => a.alarmId === alarmId);
  });

  readonly widgets = computed<WidgetConfig[]>(() => {
    const d = this.store.fleetDetail();
    if (!d) return [];
    const cats = this.visibleCategories();
    const pareto = this.view() === 'pareto';
    const dateRange = { from: this.filters.filters().dateFrom, to: this.filters.filters().dateTo };
    const dist = d.toolDistribution.filter(t =>
      this.toolFilter() === 'All Tools' || t.toolId === this.toolFilter()
    );

    let chartData;
    if (pareto) {
      const totals = dist.map(t => ({ toolId: t.toolId, total: cats.reduce((s, c) => s + t.byCategory[c], 0) }))
        .sort((a, b) => b.total - a.total);
      const grand = totals.reduce((s, t) => s + t.total, 0) || 1;
      let cum = 0;
      chartData = {
        labels: totals.map(t => t.toolId),
        datasets: [
          {
            type: 'line' as const, label: 'Cumulative %', yAxisID: 'y1',
            data: totals.map(t => { cum += t.total; return Math.round((cum / grand) * 1000) / 10; }),
            borderColor: '#0ea5e9', pointRadius: 3, tension: 0.25, borderWidth: 2
          },
          { label: 'Alarms', data: totals.map(t => t.total), backgroundColor: 'rgba(99,102,241,.8)', borderRadius: 4 }
        ]
      };
    } else {
      chartData = {
        labels: dist.map(t => t.toolId),
        datasets: cats.map(cat => ({
          label: cat,
          data: dist.map(t => t.byCategory[cat]),
          backgroundColor: CAT_COLORS[cat],
          stack: 'a',
          borderRadius: 2
        }))
      };
    }

    return [
      {
        id: 'tool-distribution', type: 'chart', badge: 'FAM', colSpan: 4,
        title: 'Tool-level Alarm Distribution',
        subtitle: `${d.fleet.fleetName} · Click bar to drill into tool`,
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
            x: { stacked: !pareto, ticks: { font: { size: 9 } }, grid: { display: false } },
            y: { stacked: !pareto, ticks: { font: { size: 10 } }, grid: { color: '#f1f5f9' } },
            y1: { position: 'right', min: 0, max: 100, display: pareto, ticks: { callback: v => `${v}%`, font: { size: 10 } }, grid: { display: false } }
          }
        },
        onPointClick: (_dataset, index) => this.openTool(dist[index]?.toolId ?? d.toolDistribution[index].toolId)
      },
      {
        id: 'top-alarms', type: 'ranked-list', badge: 'FAM', colSpan: 2,
        title: `Top Alarms: ${d.fleet.fleetName}`,
        subtitle: 'Ranked by frequency · click to inspect',
        items: this.visibleTopAlarms().map(a => ({
          key: a.alarmId, rank: a.rank,
          title: a.alarmId, titleClass: 'text-indigo-600 font-mono font-bold',
          subtitle: a.description, subtitleClass: 'text-xs text-slate-600 whitespace-normal',
          value: a.count, barPct: Math.min(100, (a.count / this.maxTopAlarm()) * 100),
          barColor: CAT_BAR_COLOR[a.category]
        })),
        onItemClick: () => this.openTool(d.tools[0].toolId)
      },
      {
        id: 'tool-summary', type: 'table', badge: 'FAM',
        title: 'Tool Summary',
        subtitle: `All tools in ${d.fleet.fleetName}`,
        actions: [{ label: '↓ Export', kind: 'primary', run: () => void 0 }],
        columns: [
          { key: 'toolId', header: 'Tool ID', kind: 'mono', sortable: true, classFn: () => 'font-semibold text-indigo-600' },
          { key: 'swVersion', header: 'SW Version', kind: 'mono', classFn: () => 'text-slate-500' },
          { key: 'totalAlarms', header: 'Total Alarms', align: 'right', kind: 'mono', classFn: () => 'font-bold' },
          { key: 'equipmentSafety', header: 'Equipment Safety', align: 'right', kind: 'mono', classFn: () => 'text-red-500' },
          { key: 'attentionFlags', header: 'Attention Flags', align: 'right', kind: 'mono', classFn: () => 'text-amber-500' },
          { key: 'dataIntegrity', header: 'Data Integrity', align: 'right', kind: 'mono', classFn: () => 'text-blue-500' },
          { key: 'irrecoverable', header: 'Irrecoverable', align: 'right', kind: 'mono', classFn: () => 'text-violet-500' },
          {
            key: 'trendPct', header: 'Trend', align: 'right', kind: 'trend', trendBadWhenUp: true,
            value: r => r.trendPct
          }
        ],
        rows: this.visibleTools(),
        footer: `Showing 1–${this.visibleTools().length} of ${this.visibleTools().length} tools`,
        trackKey: 'toolId',
        onRowClick: row => this.openTool(row.toolId as string)
      }
    ];
  });

  maxTopAlarm(): number {
    return Math.max(1, ...(this.store.fleetDetail()?.topAlarms.map(a => a.count) ?? [1]));
  }

  ngOnChanges(): void {
    if (this.fleetId) this.store.loadFleet(this.fleetId);
  }

  openTool(toolId: string): void {
    this.router.navigate(['/alarm-explorer/fleet', this.fleetId, 'tool', toolId]);
  }
}
