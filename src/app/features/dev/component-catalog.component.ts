import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { KpiComponent, LoadingComponent, StateLegendComponent, TrendPillComponent } from '../../shared/components/ui.components';
import { DynamicPageComponent } from '../../shared/dynamic/dynamic-page.component';
import { ChartWidget, KpiGridWidget, RankedListWidget, TableWidget, WidgetConfig } from '../../shared/dynamic/widget.model';
import { COMPONENT_CATALOG, ComponentCatalogEntry } from '../../core/constants/component-catalog';
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
import {
  BaseAccordionComponent,
  BaseAlertComponent,
  BaseBadgeComponent,
  BaseBarChartComponent,
  BaseBreadcrumbsComponent,
  BaseButtonComponent,
  BaseCalendarFilterComponent,
  BaseChipComponent,
  BaseCheckboxComponent,
  BaseCheckboxFilterComponent,
  BaseComboboxComponent,
  BaseDatepickerComponent,
  BaseDateRangePickerComponent,
  BaseDividerComponent,
  BaseDropdownMenuComponent,
  BaseEmptyStateComponent,
  BaseFileUploadComponent,
  BaseGanttRow,
  BaseGanttTimelineComponent,
  BaseGlobalSearchComponent,
  BaseHeatmapRow,
  BaseHistogramComponent,
  BaseKpiCardComponent,
  BaseListItemComponent,
  BaseLoadingComponent,
  BaseManageColumnsComponent,
  BaseMultiSelectChipsComponent,
  BaseNotificationsPanelComponent,
  BasePaginatorComponent,
  BasePopoverComponent,
  BaseProgressBarComponent,
  BaseRadioGroupComponent,
  BaseRangeFilterComponent,
  BaseScatterChartComponent,
  BaseSearchInputComponent,
  BaseSegmentedControlComponent,
  BaseSelectComponent,
  BaseSkeletonComponent,
  BaseSliderComponent,
  BaseSparklineComponent,
  BaseSplitButtonComponent,
  BaseStatBarComponent,
  BaseStateHeatmapComponent,
  BaseTabsComponent,
  BaseTagComponent,
  BaseTextInputComponent,
  BaseTextareaComponent,
  BaseToggleComponent,
  BaseTooltipDirective,
  BaseTrendChartComponent,
  BaseTrendComponent
} from '../../base';

const SHARED_GROUPS = ['Shared · UI Atoms', 'Shared · Dynamic Widgets'];
const BASE_MODULE_GROUP_PREFIX = 'Base Module';
const BASE_PLAYGROUND_ROUTE = '/dev/base';

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
    PlaceholderComponent,
    BaseAccordionComponent, BaseAlertComponent, BaseBadgeComponent, BaseBarChartComponent,
    BaseBreadcrumbsComponent, BaseButtonComponent, BaseCalendarFilterComponent, BaseChipComponent,
    BaseCheckboxComponent, BaseCheckboxFilterComponent, BaseComboboxComponent, BaseDatepickerComponent,
    BaseDateRangePickerComponent, BaseDividerComponent, BaseDropdownMenuComponent, BaseEmptyStateComponent,
    BaseFileUploadComponent, BaseGanttTimelineComponent, BaseGlobalSearchComponent, BaseHistogramComponent,
    BaseKpiCardComponent, BaseListItemComponent, BaseLoadingComponent, BaseManageColumnsComponent,
    BaseMultiSelectChipsComponent, BaseNotificationsPanelComponent, BasePaginatorComponent, BasePopoverComponent,
    BaseProgressBarComponent, BaseRadioGroupComponent, BaseRangeFilterComponent, BaseScatterChartComponent,
    BaseSearchInputComponent, BaseSegmentedControlComponent, BaseSelectComponent, BaseSkeletonComponent,
    BaseSliderComponent, BaseSparklineComponent, BaseSplitButtonComponent, BaseStatBarComponent,
    BaseStateHeatmapComponent, BaseTabsComponent, BaseTagComponent, BaseTextInputComponent,
    BaseTextareaComponent, BaseToggleComponent, BaseTooltipDirective, BaseTrendChartComponent, BaseTrendComponent
  ],
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Component Catalog <span class="badge-fam">FAM</span></h1>
        <p class="text-xs text-slate-400 mt-0.5">Every component in the app, rendered live with sample data</p>
      </div>
    </div>

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

    <section class="mt-8">
      <h2 class="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Shared · Dynamic Widgets</h2>
      <fam-dynamic-page [widgets]="widgetSamples" />
    </section>

    <div class="flex flex-wrap items-center gap-3 mt-8">
      <div class="flex-1"></div>
      <input
        class="filter-select w-64"
        placeholder="Search name, selector, description…"
        [ngModel]="search()"
        (ngModelChange)="search.set($event)"
      />
    </div>

    <section class="mt-4">
      <h2 class="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Base Module</h2>
      <p class="text-[11px] text-slate-400 mb-4">The UI kit powering every screen above — {{ baseModuleEntries.length }} components. Fully interactive versions live in the <a routerLink="/dev/base" class="font-semibold text-indigo-600 hover:text-indigo-800">Base Playground →</a></p>

      @for (group of groupedBaseModule(); track group.name) {
        <div class="mb-7">
          <h3 class="text-[11px] font-bold text-indigo-800 mb-2.5">{{ group.name }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            @for (c of group.items; track c.selector) {
              <div class="panel p-4 flex flex-col">
                <div class="flex-1 flex items-center">
                  @switch (c.name) {
                    @case ('BaseButtonComponent') { <base-button variant="primary">Save changes</base-button> }
                    @case ('BaseSplitButtonComponent') { <base-split-button [items]="[{id:'a',label:'Duplicate',icon:'⧉'},{id:'b',label:'Archive',danger:true}]">More</base-split-button> }
                    @case ('BaseSegmentedControlComponent') { <base-segmented-control [options]="[{label:'Day',value:'day'},{label:'Week',value:'week'}]" [value]="'week'" /> }

                    @case ('BaseTextInputComponent') { <base-text-input label="Tool ID" placeholder="e.g. KLA-1042" /> }
                    @case ('BaseTextareaComponent') { <base-textarea label="Notes" placeholder="Handover notes…" [rows]="2" /> }
                    @case ('BaseSelectComponent') { <base-select label="Fab" [options]="[{label:'Fab-A',value:'A'},{label:'Fab-B',value:'B'}]" /> }
                    @case ('BaseCheckboxComponent') { <base-checkbox label="Include engineering tools" [checked]="true" /> }
                    @case ('BaseRadioGroupComponent') { <base-radio-group label="Shift" [options]="[{label:'Shift A',value:'A'},{label:'Shift B',value:'B'}]" [value]="'A'" /> }
                    @case ('BaseToggleComponent') { <base-toggle label="Auto-refresh" [checked]="true" /> }
                    @case ('BaseComboboxComponent') { <base-combobox label="Recipe" [options]="[{label:'Recipe A',value:'A'},{label:'Recipe B',value:'B'}]" /> }
                    @case ('BaseMultiSelectChipsComponent') { <base-multi-select-chips label="Fabs" [options]="[{label:'Fab-A',value:'A'},{label:'Fab-B',value:'B'}]" [value]="['A']" /> }
                    @case ('BaseFileUploadComponent') { <base-file-upload label="Attachments" accept="CSV, XLSX" /> }
                    @case ('BaseSliderComponent') { <base-slider label="Threshold" unit="%" [value]="65" /> }
                    @case ('BaseDatepickerComponent') { <base-datepicker label="Maintenance date" /> }
                    @case ('BaseDateRangePickerComponent') { <base-date-range-picker /> }

                    @case ('BaseBadgeComponent') { <base-badge label="PRODUCTION" colorClass="bg-emerald-50 text-emerald-600" [dot]="true" /> }
                    @case ('BaseTagComponent') { <base-tag label="Fleet A" /> }
                    @case ('BaseChipComponent') { <base-chip label="Status: Active" /> }
                    @case ('BaseTrendComponent') { <base-trend [value]="4.2" /> }
                    @case ('BaseKpiCardComponent') { <base-kpi-card label="Fleet Uptime" [value]="94.2" unit="%" [trendPct]="1.8" /> }
                    @case ('BaseStatBarComponent') { <base-stat-bar [stats]="[{value:'94.2%',label:'Uptime'},{value:128,label:'Alarms'}]" /> }
                    @case ('BaseSparklineComponent') { <base-sparkline [data]="[3,7,4,9,6,11,8,14]" color="#0ea5e9" /> }
                    @case ('BaseListItemComponent') { <base-list-item label="Fab-A / CH-1" icon="⚙" meta="3 alarms" [clickable]="true" /> }
                    @case ('BaseAccordionComponent') { <base-accordion title="What counts as a Gap?">A Gap is any interval with no reported machine state.</base-accordion> }
                    @case ('BaseDividerComponent') { <base-divider label="Data display" /> }
                    @case ('BaseLoadingComponent') { <base-loading message="Loading fleet snapshot…" /> }
                    @case ('BaseSkeletonComponent') { <base-skeleton width="70%" /> }
                    @case ('BaseEmptyStateComponent') { <base-empty-state kind="no-results" /> }

                    @case ('BaseBreadcrumbsComponent') { <base-breadcrumbs [items]="[{label:'Home',url:'/'},{label:'Fleet Availability'}]" /> }
                    @case ('BaseTabsComponent') { <base-tabs [tabs]="[{id:'a',label:'Table'},{id:'b',label:'Forms',badge:9}]" [activeId]="'a'" /> }
                    @case ('BaseDropdownMenuComponent') { <base-dropdown-menu label="Bulk actions" [items]="[{id:'export',label:'Export CSV',icon:'📄'}]" /> }
                    @case ('BaseNotificationsPanelComponent') {
                      <div class="bg-surface-inverse rounded-r-md p-3 inline-flex">
                        <base-notifications-panel [notifications]="[{id:'1',title:'3 new alarms',time:'4m ago',read:false}]" />
                      </div>
                    }
                    @case ('BaseGlobalSearchComponent') {
                      <div class="bg-surface-inverse rounded-r-md p-3 inline-flex">
                        <base-global-search [results]="[{id:'1',label:'KLA-1042',type:'Tool'}]" />
                      </div>
                    }

                    @case ('BasePopoverComponent') {
                      <base-popover>
                        <button trigger class="btn-secondary">Column options</button>
                        <div panel class="p-sp-4 text-xs text-ink-600 w-48">Popover content</div>
                      </base-popover>
                    }
                    @case ('BaseAlertComponent') { <base-alert kind="info" message="CDC sync runs every 5 minutes." /> }
                    @case ('BaseProgressBarComponent') { <base-progress-bar [value]="72" /> }
                    @case ('BaseTooltipDirective') { <button class="btn-secondary" baseTooltip="I am a tooltip" tooltipPosition="top">Hover me</button> }

                    @case ('BaseTrendChartComponent') { <base-trend-chart [data]="[{x:'W1',y:92},{x:'W2',y:94},{x:'W3',y:91},{x:'W4',y:97}]" [height]="90" /> }
                    @case ('BaseBarChartComponent') { <base-bar-chart [data]="[{x:'Fab-A',y:18},{x:'Fab-B',y:24},{x:'Fab-C',y:12}]" [height]="90" /> }
                    @case ('BaseScatterChartComponent') { <base-scatter-chart [data]="[{x:20,y:60},{x:45,y:80},{x:70,y:55}]" [height]="90" /> }
                    @case ('BaseHistogramComponent') { <base-histogram [bins]="[{label:'0-1h',count:12},{label:'1-2h',count:18},{label:'2-4h',count:9}]" [height]="90" /> }
                    @case ('BaseStateHeatmapComponent') { <base-state-heatmap [rows]="heatmapRowsSample" [columns]="heatmapColumnsSample" /> }
                    @case ('BaseGanttTimelineComponent') { <base-gantt-timeline [rows]="ganttRowsSample" /> }

                    @case ('BasePaginatorComponent') { <base-paginator [page]="1" [total]="42" /> }
                    @case ('BaseSearchInputComponent') { <base-search-input placeholder="Search tools…" /> }
                    @case ('BaseManageColumnsComponent') { <base-manage-columns [items]="[{key:'a',header:'Tool ID',locked:true},{key:'b',header:'Status',locked:false}]" [visibleKeys]="['b']" /> }
                    @case ('BaseCheckboxFilterComponent') { <base-checkbox-filter header="Status" [options]="[{value:'PRODUCTION',label:'Production'},{value:'DOWN',label:'Down'}]" /> }
                    @case ('BaseCalendarFilterComponent') { <base-calendar-filter header="Last Maint." /> }
                    @case ('BaseRangeFilterComponent') { <base-range-filter header="Alarms" /> }

                    @default {
                      <p class="text-xs text-slate-500">{{ c.description }}</p>
                    }
                  }
                </div>
                <div class="flex items-end justify-between gap-2 mt-3">
                  <p class="text-[11px] font-mono text-slate-400">{{ c.selector }}</p>
                  @if (c.route) {
                    <a [routerLink]="c.route" class="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 shrink-0">Open in app →</a>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
      @if (!groupedBaseModule().length) {
        <p class="px-4 py-6 text-xs text-slate-400 text-center">No Base Module components match “{{ search() }}”.</p>
      }
    </section>

    <section class="mt-8">
      <h2 class="text-xs font-bold uppercase tracking-wide text-slate-400 mb-4">Layout &amp; Feature Screens</h2>

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

  private featureEntries = COMPONENT_CATALOG.filter(c => !SHARED_GROUPS.includes(c.group) && !c.group.startsWith(BASE_MODULE_GROUP_PREFIX));
  readonly baseModuleEntries = COMPONENT_CATALOG.filter(c => c.group.startsWith(BASE_MODULE_GROUP_PREFIX))
    .map(c => ({ ...c, route: c.route ?? BASE_PLAYGROUND_ROUTE }));

  private groupBySearch(entries: ComponentCatalogEntry[]): { name: string; items: ComponentCatalogEntry[] }[] {
    const q = this.search().trim().toLowerCase();
    const matches = q
      ? entries.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.selector.toLowerCase().includes(q) ||
          c.group.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q))
      : entries;

    const byGroup = new Map<string, ComponentCatalogEntry[]>();
    for (const c of matches) {
      const arr = byGroup.get(c.group) ?? [];
      arr.push(c);
      byGroup.set(c.group, arr);
    }
    return [...byGroup.entries()].map(([name, items]) => ({ name, items }));
  }

  readonly groupedBaseModule = computed(() => this.groupBySearch(this.baseModuleEntries));
  readonly groupedFeatures = computed(() => this.groupBySearch(this.featureEntries));

  readonly heatmapColumnsSample = ['00:00', '04:00', '08:00'];
  readonly heatmapRowsSample: BaseHeatmapRow[] = [
    { label: 'CH-1', cells: [{ col: '00:00', state: 'production' }, { col: '04:00', state: 'standby' }, { col: '08:00', state: 'unscheduled-dt' }] }
  ];
  readonly ganttRowsSample: BaseGanttRow[] = [
    { label: 'Tool', segments: [
      { startHour: 0, endHour: 8, state: 'production' },
      { startHour: 8, endHour: 9, state: 'unscheduled-dt' },
      { startHour: 9, endHour: 24, state: 'production' }
    ] }
  ];

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
