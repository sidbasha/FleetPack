import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { UptimeStore } from '../../core/state/uptime.store';
import { FilterStore } from '../../core/state/filter.store';
import { KpiComponent, LoadingComponent } from '../../shared/components/ui.components';
import { DynamicPageComponent } from '../../shared/dynamic/dynamic-page.component';
import { ColumnDef, WidgetConfig } from '../../shared/dynamic/widget.model';
import { UptimeBreakdownRow } from '../../core/models/models';
import { downloadCsv } from '../../shared/utils/csv.util';

/**
 * Fleet Up+Time Analysis — fully dynamic: the template is a header
 * plus <fam-dynamic-page>; every panel is a WidgetConfig built in
 * the `widgets` computed below.
 */
@Component({
  selector: 'fam-uptime-analysis',
  standalone: true,
  imports: [KpiComponent, LoadingComponent, DynamicPageComponent],
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Fleet Up+Time Analysis <span class="badge-fam">FAM</span></h1>
        <p class="text-xs text-slate-400 mt-0.5">Selected fleet: <span class="font-semibold text-slate-600">{{ filters.fleet() }}</span> · Uptime data · rolling, tool-wise &amp; grouped</p>
      </div>
      <div class="flex-1"></div>
      <fam-kpi label="1W Rolling" [value]="store.analysis()?.kpis?.oneWeekRolling ?? '—'" unit="%" accent />
      <fam-kpi label="13W Rolling" [value]="store.analysis()?.kpis?.thirteenWeekRolling ?? '—'" unit="%" />
      <button class="btn-primary self-center" (click)="exportCsv()">↓ Export</button>
    </div>

    @if (store.analysisLoading()) {
      <fam-loading what="up-time analysis" />
    } @else {
      <fam-dynamic-page [widgets]="widgets()" />
    }
  `
})
export class UptimeAnalysisComponent implements OnInit {
  store = inject(UptimeStore);
  filters = inject(FilterStore);

  readonly includeTools = signal(true);
  readonly includeSw = signal(true);

  private weeks = computed(() => this.store.analysis()?.weekly.map(w => w.workWeek) ?? []);

  private visibleRows = computed(() => {
    const rows = this.store.analysis()?.breakdown ?? [];
    return rows.filter(r =>
      r.group === '1 Week Rolling' || r.group === '13 Week Rolling' ||
      (r.group === 'Tool' && this.includeTools()) ||
      (r.group === 'SW Version' && this.includeSw())
    );
  });

  /** The whole page as data. */
  readonly widgets = computed<WidgetConfig[]>(() => {
    const data = this.store.analysis();
    if (!data) return [];
    const weeks = this.weeks();

    const breakdownColumns: ColumnDef<UptimeBreakdownRow>[] = [
      {
        key: 'label', header: 'Work Week',
        format: r => r.label,
        classFn: () => 'font-semibold'
      },
      ...weeks.map<ColumnDef<UptimeBreakdownRow>>(ww => ({
        key: ww, header: ww, align: 'right', kind: 'mono',
        value: r => r.values[ww],
        format: r => `${r.values[ww].toFixed(1)}%`,
        classFn: r => r.values[ww] < 90 ? 'text-red-500 font-semibold' : r.values[ww] >= 98 ? 'text-emerald-600' : ''
      }))
    ];

    return [
      {
        id: 'uptime-trend', type: 'chart', badge: 'FAM',
        title: 'Up+Time · Uptime Trend',
        legend: [
          { label: '1 Week Rolling', color: '#6366f1' },
          { label: '13 Week Rolling', color: '#a78bfa' },
          { label: 'Period Average', color: '#cbd5e1' }
        ],
        chartType: 'line',
        data: {
          labels: data.weekly.map(w => w.workWeek),
          datasets: [
            { label: '1 Week Rolling', data: data.weekly.map(w => w.oneWeekRolling), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.12)', fill: true, tension: 0.35, pointRadius: 3, borderWidth: 2 },
            { label: '13 Week Rolling', data: data.weekly.map(w => w.thirteenWeekRolling), borderColor: '#a78bfa', tension: 0.35, pointRadius: 0, borderWidth: 2 },
            { label: 'Period Average', data: data.weekly.map(w => w.periodAverage), borderColor: '#cbd5e1', borderDash: [6, 4], pointRadius: 0, borderWidth: 1.5 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
          scales: {
            y: { min: 75, max: 100, ticks: { callback: v => `${v}%`, font: { size: 10 } }, grid: { color: '#f1f5f9' } },
            x: { ticks: { font: { size: 10 } }, grid: { display: false } }
          }
        }
      },
      {
        id: 'uptime-breakdown', type: 'table',
        title: 'Uptime Data · Rolling + Tool + Grouped',
        actions: [
          { label: (this.includeTools() ? '✓ ' : '') + 'Tool-wise', run: () => this.includeTools.update(v => !v) },
          { label: (this.includeSw() ? '✓ ' : '') + 'Grouped SW Version', run: () => this.includeSw.update(v => !v) },
          { label: 'CSV', run: () => this.exportCsv() }
        ],
        columns: breakdownColumns,
        rows: this.visibleRows(),
        trackKey: 'label'
      },
      {
        id: 'top-unavailable', type: 'chart', badge: 'FAM', colSpan: 3,
        title: 'Top 10 Unavailable Tools',
        legend: [
          { label: 'Unscheduled', color: '#ef4444' },
          { label: 'Scheduled', color: '#8b5cf6' },
          { label: 'Non-Scheduled', color: '#94a3b8' }
        ],
        chartType: 'bar', height: 256,
        footnote: 'No additional tools in range · hours over selected period',
        data: {
          labels: data.topUnavailable.map(t => t.toolId),
          datasets: [
            { label: 'Unscheduled', data: data.topUnavailable.map(t => t.unscheduledHrs), backgroundColor: '#ef4444', stack: 's' },
            { label: 'Scheduled', data: data.topUnavailable.map(t => t.scheduledHrs), backgroundColor: '#8b5cf6', stack: 's' },
            { label: 'Non-Scheduled', data: data.topUnavailable.map(t => t.nonScheduledHrs), backgroundColor: '#94a3b8', stack: 's' }
          ]
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { stacked: true, title: { display: true, text: 'Hours', font: { size: 10 } }, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
            y: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } }
          }
        }
      },
      {
        id: 'downtime-categories', type: 'table', badge: 'FAM', colSpan: 3,
        title: 'Downtime Category Details',
        subtitle: 'Distribution by period',
        actions: [{ label: '↓ Download CSV', run: () => this.exportCsv() }],
        columns: [
          { key: 'category', header: 'Category', classFn: () => 'font-medium' },
          { key: 'periodPct', header: 'Period (%) ▼', align: 'right', kind: 'mono', format: r => r.periodPct.toFixed(2), classFn: () => 'font-semibold' },
          { key: 'thirteenWeekPct', header: '13-Week (%)', align: 'right', kind: 'mono', format: r => r.thirteenWeekPct.toFixed(2), classFn: () => 'text-slate-400' },
          { key: 'fourWeekPct', header: '4-Week (%)', align: 'right', kind: 'mono', format: r => r.fourWeekPct.toFixed(2), classFn: () => 'text-slate-400' },
          { key: 'wowDelta', header: 'W/W Δ', align: 'right', kind: 'trend', trendBadWhenUp: true, value: r => r.wowDelta === 0 ? null : r.wowDelta }
        ],
        rows: data.downtimeCategories,
        trackKey: 'category'
      }
    ];
  });

  ngOnInit(): void {
    this.store.loadAnalysis();
  }

  exportCsv(): void {
    const weeks = this.weeks();
    downloadCsv('uptime-analysis.csv', [
      ['Label', 'Group', ...weeks],
      ...this.visibleRows().map(r => [r.label, r.group, ...weeks.map(w => r.values[w])])
    ]);
  }
}
