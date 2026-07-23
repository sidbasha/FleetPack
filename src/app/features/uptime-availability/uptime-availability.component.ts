import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UptimeStore } from '../../core/state/uptime.store';
import { FilterStore } from '../../core/state/filter.store';
import { BaseSelectComponent, BaseSelectOption } from '../../base';
import { LoadingComponent } from '../../shared/components/ui.components';
import { DynamicPageComponent } from '../../shared/dynamic/dynamic-page.component';
import { KpiItem, WidgetConfig } from '../../shared/dynamic/widget.model';
import { downloadCsv } from '../../shared/utils/csv.util';
import { buildCategoryColorMap, buildCategoryTextColorMap } from '../../shared/utils/category-colors.util';

type TrendMode = 'uptime' | 'downtime';

/**
 * Fleet Up+Time Availability — dynamic widgets above and below a
 * static "Tool Analysis" shell that hosts the routed tabs
 * (heatmap / gantt / events), which are themselves registered widgets.
 */
@Component({
  selector: 'fam-uptime-availability',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, RouterLinkActive, RouterOutlet,
    LoadingComponent, DynamicPageComponent, BaseSelectComponent
  ],
  template: `
    <h1 class="text-lg font-bold text-slate-900">Fleet Up+Time Availability</h1>

    @if (store.availabilityLoading() || store.segmentsLoading() || store.segmentActivitiesLoading()) {
      <fam-loading what="fleet availability" />
    } @else {
      <div class="panel mt-4 overflow-hidden">
        <div class="h-1 bg-emerald-600"></div>
        <div class="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          @for (k of availabilityKpis(); track k.label) {
            <div class="flex-1 px-5 py-4 min-w-0">
              <span class="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ k.label }}</span>
              <span class="block text-2xl font-bold tracking-tight"
                    [class]="k.danger ? 'text-red-600' : k.accent ? 'text-indigo-600' : 'text-slate-800'">
                {{ k.value }}<span class="text-sm font-semibold text-slate-400 ml-0.5">{{ k.unit }}</span>
              </span>
              @if (k.sub) { <span class="block text-[11px] text-slate-400 mt-0.5">{{ k.sub }}</span> }
            </div>
          }
        </div>
      </div>

      <fam-dynamic-page class="block mt-3.5" [widgets]="topWidgets()" />

      <!-- Tool-level analysis filter: which tool + a snapshot of state totals -->
      <section class="panel mt-3.5">
        <div class="panel-header py-2.5! flex-wrap gap-3">
          <button type="button" class="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600"
                  (click)="filterBarCollapsed.set(!filterBarCollapsed())">
            <span class="text-xs font-bold leading-none">{{ filterBarCollapsed() ? '+' : '−' }}</span>
            <span class="text-[11px] font-bold uppercase tracking-wide">Tool-Level Analysis Filter</span>
          </button>
          <span class="text-[11px] text-slate-400">All states active</span>
        </div>
        @if (!filterBarCollapsed()) {
          <div class="p-4 flex flex-wrap items-center gap-6">
            <div class="flex items-center gap-2">
              <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Analyze Tool</label>
              <base-select class="w-44" [options]="toolSelectOptions()" [value]="store.selectedTool()" [showChevron]="false"
                           (valueChange)="onToolPick($event)" />
            </div>
            <div class="flex items-center gap-2">
              <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">States</label>
              <div class="flex flex-wrap items-center gap-2">
                @for (s of stateTotalsList(); track s.label) {
                  <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-lg px-2.5 py-1" [class]="s.badgeClass">
                    <i class="inline-block w-2 h-2 rounded-full" [class]="s.dotClass"></i>{{ s.label }} {{ s.value }}
                  </span>
                }
              </div>
            </div>
          </div>
        }
      </section>

      <!-- Tool level analysis: routed tabs (each tab is a registered widget) -->
      <section class="panel mt-3.5">
        <div class="panel-header py-2.5! flex-wrap gap-3">
          <div>
            <h2 class="panel-title inline-flex items-center gap-2">
              <span class="badge-fam ml-0!">FAM</span>
              <span>Tool Analysis: <span class="text-indigo-600">{{ store.selectedTool() }}</span></span>
            </h2>
            <p class="text-[11px] text-slate-400 mt-0.5">Utilization · Activity · Event Details</p>
          </div>
          <button class="btn-primary" (click)="exportCsv()">↓ Download CSV</button>
        </div>
        <nav class="flex items-center gap-6 px-4 bg-slate-50/60 border-b border-slate-100">
          <a routerLink="heatmap" routerLinkActive="text-emerald-700! border-emerald-600!"
             class="text-xs font-semibold px-1 py-2.5 text-slate-500 border-b-2 border-transparent hover:text-emerald-700 transition-colors">State Heatmap</a>
          <a routerLink="gantt" routerLinkActive="text-emerald-700! border-emerald-600!"
             class="text-xs font-semibold px-1 py-2.5 text-slate-500 border-b-2 border-transparent hover:text-emerald-700 transition-colors">Activity Gantt</a>
          <a routerLink="events" routerLinkActive="text-emerald-700! border-emerald-600!"
             class="text-xs font-semibold px-1 py-2.5 text-slate-500 border-b-2 border-transparent hover:text-emerald-700 transition-colors">Event Details</a>
        </nav>
        <div class="p-4">
          <router-outlet />
        </div>
      </section>
    }
  `
})
export class UptimeAvailabilityComponent implements OnInit {
  store = inject(UptimeStore);
  filters = inject(FilterStore);

  readonly filterBarCollapsed = signal(false);
  readonly trendMode = signal<TrendMode>('uptime');
  readonly includeNonScheduled = signal(true);

  toolOptions = computed(() => {
    const top = this.store.availability()?.topUnavailable.map(t => t.toolId) ?? [];
    return [...new Set(['Axion_T2500', ...top])];
  });

  private readonly dateRange = computed(() => {
    const f = this.filters.filters();
    return { from: f.dateFrom, to: f.dateTo };
  });

  readonly availabilityKpis = computed<KpiItem[]>(() => {
    const data = this.store.availability();
    if (!data) return [];
    return [
      { label: '13W Rolling Avg', value: data.kpis.thirteenWeekRollingAvg, unit: '%', accent: true, sub: '±0 W/W' },
      { label: '4W Rolling Avg', value: data.kpis.fourWeekRollingAvg, unit: '%', sub: 'Last 4-week window' },
      { label: 'Current Week', value: data.kpis.currentWeek, unit: '%', sub: `${data.kpis.currentWeekLabel} · ±0 W/W Δ` },
      { label: 'MTBr Avg', value: data.kpis.mtbrAvgHrs, unit: ' hrs', sub: '±0 W/W Δ' },
      { label: 'Total Downtime', value: data.kpis.totalDowntimeHrs, unit: ' hrs', sub: '52W period', danger: true }
    ];
  });

  readonly stateTotalsList = computed(() => {
    const t = this.store.availability()?.stateTotals;
    if (!t) return [];
    return [
      { label: 'Production', value: t.production, dotClass: 'bg-state-production', badgeClass: 'bg-emerald-50 text-emerald-700' },
      { label: 'Engineering', value: t.engineering, dotClass: 'bg-state-engineering', badgeClass: 'bg-blue-50 text-blue-700' },
      { label: 'Standby', value: t.standby, dotClass: 'bg-state-standby', badgeClass: 'bg-violet-50 text-violet-700' },
      { label: 'Scheduled DT', value: t.scheduledDT, dotClass: 'bg-state-scheduled', badgeClass: 'bg-amber-50 text-amber-700' },
      { label: 'Unscheduled DT', value: t.unscheduledDT, dotClass: 'bg-state-unscheduled', badgeClass: 'bg-red-50 text-red-700' }
    ];
  });

  readonly trendWidget = computed<WidgetConfig | null>(() => {
    const data = this.store.availability();
    if (!data) return null;
    const mode = this.trendMode();
    const toMode = (v: number) => mode === 'uptime' ? v : 100 - v;

    return {
      id: 'availability-trend', type: 'chart', badge: 'FAM', colSpan: 6,
      title: 'Fleet Uptime / Downtime Trend',
      subtitle: 'Fleet: Axion Fleet · 52-week window',
      dateRange: this.dateRange(),
      tabs: {
        items: [{ id: 'uptime', label: 'Uptime Trend' }, { id: 'downtime', label: 'Downtime Trend' }],
        activeId: mode,
        onChange: id => this.trendMode.set(id as TrendMode)
      },
      actions: [{ label: 'Export', kind: 'primary', run: () => this.exportCsv() }],
      legend: [
        { label: 'Work Week', color: 'rgba(59,130,246,.3)' },
        { label: '4W Rolling', color: '#c2410c' },
        { label: '13W Rolling', color: '#3b82f6' },
        { label: '95% Target', color: '#cbd5e1' }
      ],
      chartType: 'line',
      data: {
        labels: data.trend.map(t => t.workWeek),
        datasets: [
          {
            label: '13W Rolling', data: data.trend.map(t => toMode(t.thirteenWeekRolling)),
            borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.12)', fill: true, borderDash: [5, 3], tension: 0.35,
            pointRadius: 3, pointBackgroundColor: '#3b82f6', pointBorderColor: '#fff', pointBorderWidth: 1.5, borderWidth: 2
          },
          {
            label: '4W Rolling', data: data.trend.map(t => toMode(t.fourWeekRolling)),
            borderColor: '#c2410c', tension: 0.35,
            pointRadius: 3, pointBackgroundColor: '#c2410c', pointBorderColor: '#fff', pointBorderWidth: 1.5, borderWidth: 2
          },
          {
            label: '95% Target', data: data.trend.map(t => toMode(t.target)),
            borderColor: '#cbd5e1', borderDash: [6, 4], pointRadius: 0, borderWidth: 1.5
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          y: { min: 0, max: 100, ticks: { callback: v => `${v}%`, font: { size: 10 } }, grid: { color: '#f1f5f9' } },
          x: { ticks: { font: { size: 10 } }, grid: { display: false } }
        }
      }
    };
  });

  readonly topUnavailableWidget = computed<WidgetConfig | null>(() => {
    const data = this.store.availability();
    if (!data) return null;
    const includeNonScheduled = this.includeNonScheduled();
    const topUnavailable = data.topUnavailable;

    const datasets = [
      { label: 'Unscheduled', data: topUnavailable.map(t => t.unscheduledHrs), backgroundColor: '#8b5cf6', stack: 's' },
      { label: 'Scheduled', data: topUnavailable.map(t => t.scheduledHrs), backgroundColor: '#ef4444', stack: 's' },
      ...(includeNonScheduled
        ? [{ label: 'NonScheduled', data: topUnavailable.map(t => t.nonScheduledHrs), backgroundColor: '#94a3b8', stack: 's' }]
        : [])
    ];

    return {
      id: 'top-unavailable', type: 'chart', badge: 'FAM', colSpan: 3,
      title: 'Top 10 Unavailable Tools',
      dateRange: this.dateRange(),
      toggle: { label: 'Non-Scheduled', checked: includeNonScheduled, onChange: v => this.includeNonScheduled.set(v) },
      legend: includeNonScheduled
        ? [{ label: 'Unscheduled', color: '#8b5cf6' }, { label: 'Scheduled', color: '#ef4444' }, { label: 'NonScheduled', color: '#94a3b8' }]
        : [{ label: 'Unscheduled', color: '#8b5cf6' }, { label: 'Scheduled', color: '#ef4444' }],
      chartType: 'bar', height: 220,
      data: { labels: topUnavailable.map(t => t.toolId), datasets },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { stacked: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
          y: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      },
      onPointClick: (_datasetIndex, index) => {
        const tool = topUnavailable[index]?.toolId;
        if (tool) this.store.selectedTool.set(tool);
      }
    };
  });

  readonly downtimeCategoriesWidget = computed<WidgetConfig | null>(() => {
    const data = this.store.availability();
    if (!data) return null;
    const rows = data.downtimeCategories;
    const colors = buildCategoryColorMap(rows.map(r => r.category));
    const textColors = buildCategoryTextColorMap(rows.map(r => r.category));
    const maxPct = Math.max(...rows.map(r => r.periodPct), 0.01);

    return {
      id: 'downtime-categories', type: 'table', badge: 'FAM', colSpan: 3,
      title: 'Downtime Category Details',
      subtitle: 'Distribution by period',
      dateRange: this.dateRange(),
      actions: [{ label: '↓ Download CSV', run: () => this.exportCsv() }],
      columns: [
        {
          key: 'category', header: 'Category', kind: 'text-bar', width: '160px',
          classFn: r => textColors[r.category] ?? 'text-slate-700',
          barValue: r => r.periodPct, progressMax: maxPct * 1.1,
          barClass: r => colors[r.category] ?? 'bg-indigo-500'
        },
        { key: 'periodPct', header: '25-20 → 26-19 (%)', align: 'right', kind: 'mono', format: r => r.periodPct.toFixed(2), classFn: () => 'font-semibold' },
        { key: 'thirteenWeekPct', header: '13-Week (%)', align: 'right', kind: 'mono', format: r => r.thirteenWeekPct.toFixed(2), classFn: () => 'text-slate-400' },
        { key: 'fourWeekPct', header: '4-Week (%)', align: 'right', kind: 'mono', format: r => r.fourWeekPct.toFixed(2), classFn: () => 'text-slate-400' },
        { key: 'wowDelta', header: 'W/W Δ', align: 'right', format: () => '±0', classFn: () => 'text-slate-400 text-[11px] font-semibold' }
      ],
      rows,
      trackKey: 'category'
    };
  });

  readonly topWidgets = computed<WidgetConfig[]>(() => {
    const t = this.trendWidget();
    const u = this.topUnavailableWidget();
    const d = this.downtimeCategoriesWidget();
    return t && u && d ? [t, u, d] : [];
  });

  ngOnInit(): void {
    this.store.loadAvailability();
  }

  readonly toolSelectOptions = computed<BaseSelectOption<string>[]>(() =>
    this.toolOptions().map(t => ({ label: t, value: t }))
  );

  onToolPick(v: string | null): void {
    if (v) this.store.selectedTool.set(v);
  }

  onTool(e: Event): void {
    this.store.selectedTool.set((e.target as HTMLSelectElement).value);
  }

  exportCsv(): void {
    const trend = this.store.availability()?.trend ?? [];
    downloadCsv('fleet-availability.csv', [
      ['WorkWeek', 'UptimePct', '4WRolling', '13WRolling', 'UnscheduledHrs', 'ScheduledHrs', 'NonScheduledHrs'],
      ...trend.map(t => [t.workWeek, t.uptimePct, t.fourWeekRolling, t.thirteenWeekRolling, t.unscheduledHrs, t.scheduledHrs, t.nonScheduledHrs])
    ]);
  }
}
