import { Component, Input, OnChanges, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AlarmStore } from '../../core/state/alarm.store';
import { KpiComponent, LoadingComponent } from '../../shared/components/ui.components';
import { DynamicPageComponent } from '../../shared/dynamic/dynamic-page.component';
import { WidgetConfig } from '../../shared/dynamic/widget.model';
import { AlarmCategory } from '../../core/models/models';

const CAT_COLORS: Record<AlarmCategory, string> = {
  'Equipment Safety': '#ef4444',
  'Attention Flags': '#f59e0b',
  'Data Integrity': '#6366f1',
  'Irrecoverable': '#7c3aed'
};

@Component({
  selector: 'fam-fleet-detail',
  standalone: true,
  imports: [RouterLink, KpiComponent, LoadingComponent, DynamicPageComponent],
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <div>
        <p class="text-[11px] text-slate-400"><a routerLink="/alarm-explorer" class="hover:text-indigo-600">Alarm Explorer</a> › Fleet</p>
        <h1 class="text-lg font-bold text-slate-900">{{ store.fleetDetail()?.fleet?.fleetName ?? '…' }} <span class="badge-fam">FAM</span></h1>
      </div>
      <div class="flex-1"></div>
      @if (store.fleetDetail(); as d) {
        <fam-kpi label="Total Alarms" [value]="d.fleet.totalAlarms" accent [sub]="'Period trend +' + d.fleet.trendPct + '%'" />
        <fam-kpi label="Top Category" [value]="d.topCategory" sub="Category observation" />
        <fam-kpi label="SW Versions" [value]="d.swVersions.join(' · ')" [sub]="d.fleet.toolCount + ' tools, ' + d.swVersions.length + ' versions in use'" />
      }
    </div>

    @if (store.fleetLoading()) {
      <fam-loading what="fleet alarm detail" />
    } @else {
      <fam-dynamic-page [widgets]="widgets()" />
    }
  `
})
export class FleetDetailComponent implements OnChanges {
  @Input({ required: true }) fleetId = '';
  store = inject(AlarmStore);
  private router = inject(Router);

  readonly widgets = computed<WidgetConfig[]>(() => {
    const d = this.store.fleetDetail();
    if (!d) return [];
    const cats = Object.keys(CAT_COLORS) as AlarmCategory[];

    return [
      {
        id: 'tool-distribution', type: 'chart', badge: 'FAM', colSpan: 4,
        title: `Tool-level Alarm Distribution · ${d.fleet.fleetName}`,
        subtitle: 'Click a bar to drill into the tool',
        legend: cats.map(c => ({ label: c, color: CAT_COLORS[c] })),
        chartType: 'bar', height: 320,
        data: {
          labels: d.toolDistribution.map(t => t.toolId),
          datasets: cats.map(cat => ({
            label: cat,
            data: d.toolDistribution.map(t => t.byCategory[cat]),
            backgroundColor: CAT_COLORS[cat],
            stack: 'a',
            borderRadius: 2
          }))
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
          scales: {
            x: { stacked: true, ticks: { font: { size: 9 } }, grid: { display: false } },
            y: { stacked: true, ticks: { font: { size: 10 } }, grid: { color: '#f1f5f9' } }
          }
        },
        onPointClick: (_dataset, index) => this.openTool(d.toolDistribution[index].toolId)
      },
      {
        id: 'top-alarms', type: 'ranked-list', badge: 'FAM', colSpan: 2,
        title: `Top Alarms · ${d.fleet.fleetName}`,
        subtitle: 'Ranked by frequency',
        items: d.topAlarms.map(a => ({
          key: a.alarmId, rank: a.rank,
          title: a.alarmId, subtitle: a.description, value: a.count
        })),
        onItemClick: () => this.openTool(d.tools[0].toolId)
      },
      {
        id: 'tool-summary', type: 'table', badge: 'FAM',
        title: `Tool Summary · all tools in ${d.fleet.fleetName}`,
        footer: `Showing 1–${d.tools.length} of ${d.tools.length} tools`,
        actions: [{ label: '↓ Export', run: () => void 0 }],
        columns: [
          { key: 'toolId', header: 'Tool ID', kind: 'mono', classFn: () => 'font-semibold text-indigo-600' },
          { key: 'swVersion', header: 'SW Version', kind: 'mono', classFn: () => 'text-slate-500' },
          { key: 'totalAlarms', header: 'Total Alarms', align: 'right', kind: 'mono', classFn: () => 'font-bold' },
          { key: 'equipmentSafety', header: 'Equipment Safety', align: 'right', kind: 'mono' },
          { key: 'attentionFlags', header: 'Attention Flags', align: 'right', kind: 'mono' },
          { key: 'dataIntegrity', header: 'Data Integrity', align: 'right', kind: 'mono' },
          { key: 'irrecoverable', header: 'Irrecoverable', align: 'right', kind: 'mono' },
          { key: 'trendPct', header: 'Trend', align: 'right', kind: 'trend', trendBadWhenUp: true }
        ],
        rows: d.tools,
        trackKey: 'toolId',
        onRowClick: row => this.openTool(row.toolId as string)
      }
    ];
  });

  ngOnChanges(): void {
    if (this.fleetId) this.store.loadFleet(this.fleetId);
  }

  openTool(toolId: string): void {
    this.router.navigate(['/alarm-explorer/fleet', this.fleetId, 'tool', toolId]);
  }
}
