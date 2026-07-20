import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { KpiComponent, LoadingComponent, StateLegendComponent, TrendPillComponent } from '../../shared/components/ui.components';
import { DynamicPageComponent } from '../../shared/dynamic/dynamic-page.component';
import { ChartWidget, KpiGridWidget, RankedListWidget, TableWidget, WidgetConfig } from '../../shared/dynamic/widget.model';
import { COMPONENT_CATALOG } from '../../core/constants/component-catalog';
import { TopbarComponent } from '../../layout/topbar.component';
import { SidebarComponent } from '../../layout/sidebar.component';
import { UptimeAnalysisComponent } from '../uptime-analysis/uptime-analysis.component';
import { UptimeAvailabilityComponent } from '../uptime-availability/uptime-availability.component';
import { StateHeatmapComponent } from '../uptime-availability/state-heatmap.component';
import { ActivityGanttComponent } from '../uptime-availability/activity-gantt.component';
import { EventDetailsComponent } from '../uptime-availability/event-details.component';
import { SegmentActivitiesComponent } from '../uptime-availability/segment-activities.component';
import { AlarmHomeComponent } from '../alarm-explorer/alarm-home.component';
import { FleetDetailComponent } from '../alarm-explorer/fleet-detail.component';
import { ToolAlarmsComponent } from '../alarm-explorer/tool-alarms.component';
import { AlarmEventsComponent } from '../alarm-explorer/alarm-events.component';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

const SHARED_GROUPS = ['Shared · UI Atoms', 'Shared · Dynamic Widgets'];

/**
 * Reference screen — every component in the app rendered live wherever it's
 * safe to (each reads the app's real singleton stores, so it shows real mock
 * data, not a description). LoginComponent and ShellComponent are excluded
 * from live embedding — Login redirects on mount when already authenticated,
 * and Shell would nest a second full app frame inside this page.
 * Dev-only: reachable at /dev/components, intentionally not in NAV_GROUPS.
 * Data comes from the hand-maintained COMPONENT_CATALOG (mirrors docs/COMPONENTS.md).
 */
@Component({
  selector: 'fam-component-catalog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, RouterLink,
    KpiComponent, LoadingComponent, StateLegendComponent, TrendPillComponent, DynamicPageComponent,
    TopbarComponent, SidebarComponent,
    UptimeAnalysisComponent, UptimeAvailabilityComponent, StateHeatmapComponent, ActivityGanttComponent,
    EventDetailsComponent, SegmentActivitiesComponent,
    AlarmHomeComponent, FleetDetailComponent, ToolAlarmsComponent, AlarmEventsComponent,
    PlaceholderComponent
  ],
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Component Catalog <span class="badge-fam">FAM</span></h1>
        <p class="text-xs text-slate-400 mt-0.5">Every component in the app, rendered live with sample data</p>
      </div>
    </div>

    <!-- ── Shared UI atoms ── -->
    <section class="mt-6">
      <h2 class="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Shared · UI Atoms</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="panel p-4">
          <fam-kpi label="13W Rolling" value="97.4" unit="%" sub="±0.3 W/W" accent />
          <p class="mt-3 text-[11px] font-mono text-slate-400">&lt;fam-kpi&gt;</p>
        </div>
        <div class="panel p-4">
          <fam-loading what="preview data" />
          <p class="mt-3 text-[11px] font-mono text-slate-400">&lt;fam-loading&gt;</p>
        </div>
        <div class="panel p-4">
          <fam-state-legend withGap />
          <p class="mt-3 text-[11px] font-mono text-slate-400">&lt;fam-state-legend&gt;</p>
        </div>
        <div class="panel p-4">
          <div class="flex items-center gap-2">
            <fam-trend [value]="4.2" />
            <fam-trend [value]="-2.1" [badWhenUp]="true" />
            <fam-trend [value]="null" />
          </div>
          <p class="mt-3 text-[11px] font-mono text-slate-400">&lt;fam-trend&gt;</p>
        </div>
      </div>
    </section>

    <!-- ── Shared dynamic widgets (also demonstrates fam-dynamic-page + fam-dynamic-widget) ── -->
    <section class="mt-8">
      <h2 class="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Shared · Dynamic Widgets</h2>
      <fam-dynamic-page [widgets]="widgetSamples" />
    </section>

    <!-- ── Everything else, grouped, rendered live ── -->
    <section class="mt-8">
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <h2 class="text-xs font-bold uppercase tracking-wide text-slate-400">Layout &amp; Feature Screens</h2>
        <div class="flex-1"></div>
        <input
          class="filter-select w-64"
          placeholder="Search name, selector, description…"
          [ngModel]="search()"
          (ngModelChange)="search.set($event)"
        />
      </div>

      @for (group of groupedFeatures(); track group.name) {
        <div class="mb-8">
          <h3 class="text-[11px] font-bold text-indigo-800 mb-2.5">{{ group.name }}</h3>
          <div class="space-y-5">
            @for (c of group.items; track c.selector) {
              <div class="panel overflow-hidden">
                <div class="panel-header py-2.5!">
                  <h4 class="panel-title text-xs">
                    {{ c.name }} <span class="font-mono font-normal text-slate-400 ml-1">{{ c.selector }}</span>
                  </h4>
                  @if (c.route) {
                    <a [routerLink]="c.route" class="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">Open in app →</a>
                  }
                </div>
                <div class="p-4">
                  @switch (c.name) {
                    @case ('UptimeAnalysisComponent') { <fam-uptime-analysis /> }
                    @case ('UptimeAvailabilityComponent') { <fam-uptime-availability /> }
                    @case ('StateHeatmapComponent') { <fam-state-heatmap /> }
                    @case ('ActivityGanttComponent') { <fam-activity-gantt /> }
                    @case ('EventDetailsComponent') { <fam-event-details /> }
                    @case ('SegmentActivitiesComponent') { <fam-segment-activities /> }
                    @case ('AlarmHomeComponent') { <fam-alarm-home /> }
                    @case ('FleetDetailComponent') { <fam-fleet-detail [fleetId]="sampleFleetId" /> }
                    @case ('ToolAlarmsComponent') { <fam-tool-alarms [fleetId]="sampleFleetId" [toolId]="sampleToolId" /> }
                    @case ('AlarmEventsComponent') { <fam-alarm-events [fleetId]="sampleFleetId" [toolId]="sampleToolId" [alarmId]="sampleAlarmId" /> }
                    @case ('PlaceholderComponent') { <fam-placeholder /> }
                    @case ('TopbarComponent') {
                      <div class="relative h-16 overflow-hidden rounded-lg border border-slate-200">
                        <fam-topbar />
                      </div>
                    }
                    @case ('SidebarComponent') {
                      <div class="relative h-80 overflow-auto rounded-lg border border-slate-200">
                        <fam-sidebar />
                      </div>
                    }
                    @default {
                      <p class="text-xs text-slate-500">{{ c.description }}</p>
                    }
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
      @if (!groupedFeatures().length) {
        <p class="px-4 py-6 text-xs text-slate-400 text-center">No components match “{{ search() }}”.</p>
      }
    </section>
  `
})
export class ComponentCatalogComponent {
  readonly search = signal('');

  readonly sampleFleetId = 'fleet-001';
  readonly sampleToolId = 'TOOL-1140';
  readonly sampleAlarmId = 'ALM-4521';

  private featureEntries = COMPONENT_CATALOG.filter(c => !SHARED_GROUPS.includes(c.group));

  readonly groupedFeatures = computed(() => {
    const q = this.search().trim().toLowerCase();
    const matches = q
      ? this.featureEntries.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.selector.toLowerCase().includes(q) ||
          c.group.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q))
      : this.featureEntries;

    const byGroup = new Map<string, typeof matches>();
    for (const c of matches) {
      const arr = byGroup.get(c.group) ?? [];
      arr.push(c);
      byGroup.set(c.group, arr);
    }
    return [...byGroup.entries()].map(([name, items]) => ({ name, items }));
  });

  // ── Sample widget configs for the Dynamic Widgets showcase ──

  private readonly kpiGridSample: KpiGridWidget = {
    id: 'preview-kpi-grid', type: 'kpi-grid', badge: 'FAM', title: 'KPI Grid', colSpan: 6,
    kpis: [
      { label: 'Uptime', value: 97.4, unit: '%', accent: true, sub: '13W rolling' },
      { label: 'MTBr', value: 42.1, unit: ' hrs' },
      { label: 'Alarms', value: 128, sub: 'last 7 days' }
    ]
  };

  private readonly chartSample: ChartWidget = {
    id: 'preview-chart', type: 'chart', badge: 'FAM', title: 'Chart', height: 220, colSpan: 3,
    chartType: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      datasets: [{ label: 'Uptime %', data: [96, 97, 94, 98, 97], backgroundColor: '#6366f1', borderRadius: 4 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  };

  private readonly rankedListSample: RankedListWidget = {
    id: 'preview-ranked-list', type: 'ranked-list', badge: 'FAM', title: 'Ranked List', colSpan: 3,
    items: [
      { key: 'a', rank: 1, title: 'Axion_T2500', subtitle: '3 tools', value: '1,240 hrs', trendPct: 4.1, barPct: 82 },
      { key: 'b', rank: 2, title: 'Axion_T1800', subtitle: '2 tools', value: '860 hrs', trendPct: -2.3, barPct: 58 }
    ]
  };

  private readonly tableSample: TableWidget = {
    id: 'preview-table', type: 'table', badge: 'FAM', title: 'Table', colSpan: 6,
    columns: [
      { key: 'tool', header: 'Tool', classFn: () => 'font-semibold text-indigo-600' },
      { key: 'state', header: 'State', kind: 'dot', dotClassMap: { Production: 'bg-state-production', Standby: 'bg-state-standby' } },
      { key: 'severity', header: 'Severity', kind: 'badge', badgeClassMap: { Fatal: 'bg-red-50 text-red-600', 'Non-Fatal': 'bg-slate-100 text-slate-500' } },
      { key: 'trend', header: 'Trend', align: 'right', kind: 'trend' }
    ],
    rows: [
      { tool: 'Axion_T2500', state: 'Production', severity: 'Non-Fatal', trend: 3.2 },
      { tool: 'Axion_T1800', state: 'Standby', severity: 'Fatal', trend: -1.4 }
    ],
    trackKey: 'tool'
  };

  readonly widgetSamples: WidgetConfig[] = [this.kpiGridSample, this.chartSample, this.rankedListSample, this.tableSample];
}
