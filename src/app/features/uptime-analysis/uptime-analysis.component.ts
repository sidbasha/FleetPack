import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { UptimeStore } from '../../core/state/uptime.store';
import { FilterStore } from '../../core/state/filter.store';
import { LoadingComponent } from '../../shared/components/ui.components';
import { DynamicPageComponent } from '../../shared/dynamic/dynamic-page.component';
import { ColumnDef, WidgetConfig } from '../../shared/dynamic/widget.model';
import { UptimeBreakdownRow } from '../../core/models/models';
import { downloadCsv } from '../../shared/utils/csv.util';
import { buildCategoryColorMap } from '../../shared/utils/category-colors.util';

type TrendMode = 'uptime' | 'downtime';

/**
 * Fleet Up+Time Analysis — fully dynamic: the template is a header
 * plus <fam-dynamic-page>; every panel is a WidgetConfig built in
 * the `widgets` computed below.
 */
@Component({
  selector: 'fam-uptime-analysis',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoadingComponent, DynamicPageComponent],
  template: `
    <h1 class="text-lg font-bold text-slate-900">Fleet Up+Time Analysis</h1>

    @if (store.analysisLoading() || store.trendLoading()) {
      <fam-loading what="up-time analysis" />
    } @else {
      <fam-dynamic-page class="block mt-3.5" [widgets]="widgets()" />
    }
  `
})
export class UptimeAnalysisComponent implements OnInit {
  store = inject(UptimeStore);
  filters = inject(FilterStore);

  readonly includeTools = signal(true);
  readonly includeSw = signal(true);
  readonly trendMode = signal<TrendMode>('uptime');
  readonly periodOnly = signal(true);
  readonly tableCollapsed = signal(false);

  private weeks = computed(() => this.store.analysis()?.weekly.map(w => w.workWeek) ?? []);

  private visibleRows = computed(() => {
    const rows = this.store.analysis()?.breakdown ?? [];
    return rows.filter(r =>
      r.group === '1 Week Rolling' || r.group === '13 Week Rolling' ||
      (r.group === 'Tool' && this.includeTools()) ||
      (r.group === 'SW Version' && this.includeSw())
    );
  });

  private readonly dateRange = computed(() => {
    const f = this.filters.filters();
    return { from: f.dateFrom, to: f.dateTo };
  });

  // Each panel is its own computed() so an unrelated signal change (e.g.
  // toggling includeTools) only rebuilds the widget(s) that actually
  // depend on it — the two Chart.js widgets keep a stable object
  // reference and skip a needless redraw.

  readonly trendWidget = computed<WidgetConfig>(() => {
    const trend = this.store.trend() ?? [];
    const trend1w = trend.find(w => w.RollingWindow === 1)?.UptimeInfo ?? [];
    const trend13w = trend.find(w => w.RollingWindow === 13)?.UptimeInfo ?? [];
    const periodAvg = trend1w.length
      ? trend1w.reduce((sum, p) => sum + p.UptimePercentage, 0) / trend1w.length
      : 0;

    const mode = this.trendMode();
    const toMode = (v: number) => mode === 'uptime' ? v : 100 - v;
    const scale = mode === 'uptime'
      ? { min: 75, max: 100 }
      : { min: 0, max: 25 };

    return {
      id: 'uptime-trend', type: 'chart', badge: 'FAM',
      titlePrefix: 'Selected Fleet:', title: this.filters.fleet(),
      dateRange: this.dateRange(),
      tabs: {
        items: [{ id: 'uptime', label: 'Uptime Trend' }, { id: 'downtime', label: 'Downtime Trend' }],
        activeId: mode,
        onChange: id => this.trendMode.set(id as TrendMode)
      },
      actions: [{ label: 'Export', kind: 'primary', run: () => this.exportCsv() }],
      legend: [
        { label: '1 Week Rolling', color: '#3b82f6' },
        { label: '13 Week Rolling', color: '#c2410c' },
        { label: 'Period Average', color: '#cbd5e1' }
      ],
      chartType: 'line',
      data: {
        labels: trend1w.map(p => p.GranulariReferencePoint),
        datasets: [
          {
            label: '1 Week Rolling', data: trend1w.map(p => toMode(p.UptimePercentage)),
            borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.12)', fill: true, tension: 0.35,
            pointRadius: 3, pointBackgroundColor: '#3b82f6', pointBorderColor: '#fff', pointBorderWidth: 1.5, borderWidth: 2
          },
          {
            label: '13 Week Rolling', data: trend13w.map(p => toMode(p.UptimePercentage)),
            borderColor: '#c2410c', tension: 0.35,
            pointRadius: 3, pointBackgroundColor: '#c2410c', pointBorderColor: '#fff', pointBorderWidth: 1.5, borderWidth: 2
          },
          {
            label: 'Period Average', data: trend1w.map(() => toMode(periodAvg)),
            borderColor: '#cbd5e1', borderDash: [6, 4], pointRadius: 0, borderWidth: 1.5
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          y: { ...scale, ticks: { callback: v => `${v}%`, font: { size: 10 } }, grid: { color: '#f1f5f9' } },
          x: { title: { display: true, text: 'Work Week', font: { size: 10 } }, ticks: { font: { size: 10 }, maxTicksLimit: 12, autoSkip: true }, grid: { display: false } }
        }
      }
    };
  });

  readonly breakdownWidget = computed<WidgetConfig>(() => {
    const weeks = this.weeks();
    const breakdownColumns: ColumnDef<UptimeBreakdownRow>[] = [
      {
        key: 'label', header: 'Work Week', kind: 'dot',
        dotClassMap: { '1 Week Rolling': 'bg-blue-500', '13 Week Rolling': 'bg-orange-600' },
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

    return {
      id: 'uptime-breakdown', type: 'table',
      title: 'Uptime Data', subtitle: 'Rolling + Tool + Grouped',
      collapsible: true, collapsed: this.tableCollapsed(),
      onToggleCollapse: () => this.tableCollapsed.update(v => !v),
      actionsLabel: 'Include:',
      actions: [
        { label: 'Tool-wise', active: this.includeTools(), run: () => this.includeTools.update(v => !v) },
        { label: 'Grouped', active: this.includeSw(), run: () => this.includeSw.update(v => !v) },
        { label: '⬇', kind: 'ghost', run: () => this.exportCsv() }
      ],
      note: 'SW Version',
      columns: breakdownColumns,
      rows: this.visibleRows(),
      groupBy: r => r.group === 'Tool' ? 'TOOL-WISE BREAKDOWN' : r.group === 'SW Version' ? 'GROUPED BY SW VERSION' : null,
      groupHeaderStyle: 'plain',
      trackKey: 'label'
    };
  });

  readonly topUnavailableWidget = computed<WidgetConfig>(() => {
    const topUnavailable = this.store.analysis()?.topUnavailable ?? [];
    const periodOnly = this.periodOnly();

    const datasets = periodOnly
      ? [
          { label: 'Scheduled', data: topUnavailable.map(t => t.scheduledHrs), backgroundColor: '#8b5cf6', stack: 's' },
          { label: 'UnScheduled', data: topUnavailable.map(t => t.unscheduledHrs), backgroundColor: '#ef4444', stack: 's' },
          { label: 'NonScheduled', data: topUnavailable.map(t => t.nonScheduledHrs), backgroundColor: '#94a3b8', stack: 's' }
        ]
      : [
          { label: 'UnScheduled', data: topUnavailable.map(t => t.unscheduledHrs), backgroundColor: '#ef4444', stack: 's' }
        ];

    return {
      id: 'top-unavailable', type: 'chart', badge: 'FAM', colSpan: 3,
      title: 'Top 10 Unavailable Tools',
      dateRange: this.dateRange(),
      toggle: { label: 'Period', checked: periodOnly, onChange: v => this.periodOnly.set(v) },
      legend: periodOnly
        ? [
            { label: 'Scheduled', color: '#8b5cf6' },
            { label: 'UnScheduled', color: '#ef4444' },
            { label: 'NonScheduled', color: '#94a3b8' }
          ]
        : [{ label: 'UnScheduled', color: '#ef4444' }],
      chartType: 'bar', height: 256,
      footnote: 'No additional tools in range · hours over selected period',
      data: {
        labels: topUnavailable.map(t => t.toolId),
        datasets
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { stacked: true, title: { display: true, text: 'Hours', font: { size: 10 } }, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
          y: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    };
  });

  readonly downtimeCategoriesWidget = computed<WidgetConfig>(() => {
    const rows = this.store.analysis()?.downtimeCategories ?? [];
    const colors = buildCategoryColorMap(rows.map(r => r.category));
    const maxPct = Math.max(...rows.map(r => r.periodPct), 0.01);

    return {
      id: 'downtime-categories', type: 'table', badge: 'FAM', colSpan: 3,
      title: 'Downtime Category Details',
      subtitle: 'Distribution by period',
      dateRange: this.dateRange(),
      actions: [{ label: '↓ Download CSV', run: () => this.exportCsv() }],
      columns: [
        { key: 'category', header: 'Category', kind: 'dot', dotClassMap: colors, classFn: () => 'font-medium' },
        {
          key: 'periodPct', header: 'Period (%) ▼', align: 'right', kind: 'progress', width: '170px',
          format: r => r.periodPct.toFixed(2), progressMax: maxPct * 2.5,
          barClass: r => colors[r.category] ?? 'bg-indigo-500'
        },
        { key: 'thirteenWeekPct', header: '13-Week (%)', align: 'right', kind: 'mono', format: r => r.thirteenWeekPct.toFixed(2), classFn: () => 'text-slate-400' },
        { key: 'fourWeekPct', header: '4-Week (%)', align: 'right', kind: 'mono', format: r => r.fourWeekPct.toFixed(2), classFn: () => 'text-slate-400' },
        { key: 'wowDelta', header: 'W/W Δ', align: 'right', kind: 'trend', trendBadWhenUp: true, value: r => r.wowDelta === 0 ? null : r.wowDelta }
      ],
      rows,
      trackKey: 'category'
    };
  });

  /** The whole page as data. */
  readonly widgets = computed<WidgetConfig[]>(() => {
    if (!this.store.analysis() || !this.store.trend()) return [];
    return [this.trendWidget(), this.breakdownWidget(), this.topUnavailableWidget(), this.downtimeCategoriesWidget()];
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
