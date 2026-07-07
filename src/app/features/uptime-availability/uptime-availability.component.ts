import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { UptimeStore } from '../../core/state/uptime.store';
import { LoadingComponent } from '../../shared/components/ui.components';
import { DynamicPageComponent } from '../../shared/dynamic/dynamic-page.component';
import { WidgetConfig } from '../../shared/dynamic/widget.model';
import { downloadCsv } from '../../shared/utils/csv.util';

/**
 * Fleet Up+Time Availability — dynamic widgets above and below a
 * static "Tool Analysis" shell that hosts the routed tabs
 * (heatmap / gantt / events), which are themselves registered widgets.
 */
@Component({
  selector: 'fam-uptime-availability',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LoadingComponent, DynamicPageComponent],
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Fleet Up+Time Availability <span class="badge-fam">FAM</span></h1>
        <p class="text-xs text-slate-400 mt-0.5">Fleet: <span class="font-semibold text-slate-600">Axion Fleet</span> · 52-week window</p>
      </div>
      <div class="flex-1"></div>
      <button class="btn-primary self-center" (click)="exportCsv()">↓ Export</button>
    </div>

    @if (store.availabilityLoading()) {
      <fam-loading what="fleet availability" />
    } @else {
      <fam-dynamic-page [widgets]="topWidgets()" />

      <!-- Tool level analysis: routed tabs (each tab is a registered widget) -->
      <section class="panel">
        <div class="panel-header !py-2.5 flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <h2 class="panel-title">Tool Analysis: <span class="text-indigo-600">{{ store.selectedTool() }}</span> <span class="badge-fam">FAM</span></h2>
            <select class="filter-select" [value]="store.selectedTool()" (change)="onTool($event)">
              @for (t of toolOptions(); track t) { <option [value]="t">{{ t }}</option> }
            </select>
          </div>
          <nav class="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <a routerLink="heatmap" routerLinkActive="tab-btn-active" class="tab-btn">State Heatmap</a>
            <a routerLink="gantt" routerLinkActive="tab-btn-active" class="tab-btn">Activity Gantt</a>
            <a routerLink="events" routerLinkActive="tab-btn-active" class="tab-btn">Event Details</a>
          </nav>
        </div>
        <div class="p-4">
          <router-outlet />
        </div>
      </section>

      <fam-dynamic-page [widgets]="bottomWidgets()" />
    }
  `
})
export class UptimeAvailabilityComponent implements OnInit {
  store = inject(UptimeStore);

  toolOptions = computed(() => {
    const top = this.store.availability()?.topUnavailable.map(t => t.toolId) ?? [];
    return [...new Set(['Axion_T2500', ...top])];
  });

  readonly topWidgets = computed<WidgetConfig[]>(() => {
    const data = this.store.availability();
    if (!data) return [];
    return [
      {
        id: 'availability-kpis', type: 'kpi-grid', frameless: true,
        kpis: [
          { label: '13W Rolling Avg', value: data.kpis.thirteenWeekRollingAvg, unit: '%', accent: true, sub: '±0 W/W' },
          { label: '4W Rolling Avg', value: data.kpis.fourWeekRollingAvg, unit: '%', sub: 'Last 4-week window' },
          { label: 'Current Week', value: data.kpis.currentWeek, unit: '%', sub: `${data.kpis.currentWeekLabel} · ±0 W/W Δ` },
          { label: 'MTBr Avg', value: data.kpis.mtbrAvgHrs, unit: ' hrs' },
          { label: 'Total Downtime', value: data.kpis.totalDowntimeHrs, unit: ' hrs', sub: '52W period' }
        ]
      },
      {
        id: 'availability-trend', type: 'chart', badge: 'FAM', colSpan: 4,
        title: 'Fleet Uptime / Downtime Trend',
        legend: [
          { label: 'Work Week', color: '#6366f1' },
          { label: '4W Rolling', color: '#a78bfa' },
          { label: '13W Rolling', color: '#38bdf8' },
          { label: '95% Target', color: '#cbd5e1' }
        ],
        chartType: 'bar',
        data: {
          labels: data.trend.map(t => t.workWeek),
          datasets: [
            { type: 'line' as const, label: '4W Rolling', data: data.trend.map(t => t.fourWeekRolling), borderColor: '#a78bfa', tension: 0.35, pointRadius: 0, borderWidth: 2 },
            { type: 'line' as const, label: '13W Rolling', data: data.trend.map(t => t.thirteenWeekRolling), borderColor: '#38bdf8', tension: 0.35, pointRadius: 0, borderWidth: 2 },
            { type: 'line' as const, label: '95% Target', data: data.trend.map(t => t.target), borderColor: '#cbd5e1', borderDash: [6, 4], pointRadius: 0, borderWidth: 1.5 },
            { label: 'Work Week Uptime', data: data.trend.map(t => t.uptimePct), backgroundColor: 'rgba(99,102,241,.75)', borderRadius: 4 }
          ] as ChartConfiguration['data']['datasets']
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
          scales: {
            y: { min: 80, max: 101, ticks: { callback: v => `${v}%`, font: { size: 10 } }, grid: { color: '#f1f5f9' } },
            x: { ticks: { font: { size: 10 } }, grid: { display: false } }
          }
        }
      },
      {
        id: 'top-unavailable', type: 'ranked-list', badge: 'FAM', colSpan: 2,
        title: 'Top 10 Unavailable Tools',
        footnote: 'Unscheduled · Scheduled · Non-Scheduled downtime, ranked',
        items: data.topUnavailable.map((t, i) => ({
          key: t.toolId, rank: i + 1, title: t.toolId,
          value: `${t.hrs.toLocaleString()} hrs`,
          barPct: Math.min(100, (t.hrs / 1400) * 100)
        })),
        onItemClick: item => this.store.selectedTool.set(item.key)
      }
    ];
  });

  readonly bottomWidgets = computed<WidgetConfig[]>(() => {
    const data = this.store.availability();
    if (!data) return [];
    return [
      {
        id: 'downtime-categories', type: 'table', badge: 'FAM',
        title: 'Downtime Category Details',
        subtitle: 'Distribution by period · 25-20 → 26-19',
        footer: '● All states active',
        actions: [{ label: '↓ Download CSV', run: () => this.exportCsv() }],
        columns: [
          { key: 'category', header: 'Category', classFn: () => 'font-medium' },
          { key: 'periodPct', header: 'Period (%)', align: 'right', kind: 'mono', format: r => r.periodPct.toFixed(2), classFn: () => 'font-semibold' },
          { key: 'thirteenWeekPct', header: '13-Week (%)', align: 'right', kind: 'mono', format: r => r.thirteenWeekPct.toFixed(2), classFn: () => 'text-slate-400' },
          { key: 'fourWeekPct', header: '4-Week (%)', align: 'right', kind: 'mono', format: r => r.fourWeekPct.toFixed(2), classFn: () => 'text-slate-400' },
          { key: 'wowDelta', header: 'W/W Δ', align: 'right', format: () => '±0', classFn: () => 'text-slate-400 text-[11px] font-semibold' }
        ],
        rows: data.downtimeCategories,
        trackKey: 'category'
      }
    ];
  });

  ngOnInit(): void {
    this.store.loadAvailability();
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
