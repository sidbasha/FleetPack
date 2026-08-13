import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild, computed, inject, signal } from '@angular/core';
import {
  AdditionalHeaderGroup,
  BaseAccordionComponent,
  BaseAlertComponent,
  BaseBadgeComponent,
  BaseBarChartComponent,
  BaseBreadcrumbsComponent,
  BaseButtonComponent,
  BaseCellDirective,
  BaseChartPoint,
  BaseChildCellDirective,
  BaseChipComponent,
  BaseCheckboxComponent,
  BaseColumnDef,
  BaseComboOption,
  BaseComboboxComponent,
  BaseContextMenuComponent,
  BaseDateRangePickerComponent,
  BaseDatepickerComponent,
  BaseDividerComponent,
  BaseDrawerComponent,
  BaseDropdownMenuComponent,
  BaseEmptyStateComponent,
  BaseFileUploadComponent,
  BaseFilterEvent,
  BaseGanttRow,
  BaseGanttTimelineComponent,
  BaseGlobalSearchComponent,
  BaseHandleActionEvent,
  BaseHeatmapRow,
  BaseHistogramComponent,
  BaseKpiCardComponent,
  BaseListItemComponent,
  BaseLoadingComponent,
  BaseMenuItem,
  BaseModalComponent,
  BaseMultiSelectChipsComponent,
  BaseNotification,
  BaseNotificationsPanelComponent,
  BasePageEvent,
  BasePopoverComponent,
  BaseProgressBarComponent,
  BaseRadioGroupComponent,
  BaseRowAction,
  BaseScatterChartComponent,
  BaseScatterPoint,
  BaseSearchResult,
  BaseSegmentedControlComponent,
  BaseSelectComponent,
  BaseSkeletonComponent,
  BaseSliderComponent,
  BaseSortEvent,
  BaseSparklineComponent,
  BaseSplitButtonComponent,
  BaseStateHeatmapComponent,
  BaseStatBarComponent,
  BaseStepperComponent,
  BaseStepperStep,
  BaseTableComponent,
  BaseTabsComponent,
  BaseTagComponent,
  BaseTextInputComponent,
  BaseTextareaComponent,
  BaseToastHostComponent,
  BaseToastService,
  BaseToggleComponent,
  BaseTooltipDirective,
  BaseTrendChartComponent,
  BaseTrendComponent,
  BaseUploadFile,
  DateRangeValue
} from '../../base';

interface ToolRow {
  toolId: string;
  chamber: string;
  fab: string;
  status: 'PRODUCTION' | 'ENGINEERING' | 'STANDBY' | 'DOWN';
  uptime: number;
  alarms: number;
  trendPct: number | null;
  history: number[];
  lastMaint: string;
  photo: string;
  fileProgress: number;
}

const STATUSES: ToolRow['status'][] = ['PRODUCTION', 'ENGINEERING', 'STANDBY', 'DOWN'];
const FABS = ['Fab-A', 'Fab-B', 'Fab-C'];

function mockRows(n: number): ToolRow[] {
  return Array.from({ length: n }, (_, i) => {
    const uptime = 78 + Math.round(Math.random() * 21);
    return {
      toolId: `KLA-${(1000 + i).toString()}`,
      chamber: `CH-${(i % 4) + 1}`,
      fab: FABS[i % FABS.length],
      status: STATUSES[i % STATUSES.length],
      uptime,
      alarms: Math.round(Math.random() * 40),
      trendPct: i % 7 === 0 ? null : +((Math.random() * 8 - 4).toFixed(1)),
      history: Array.from({ length: 8 }, () => 70 + Math.round(Math.random() * 30)),
      lastMaint: new Date(Date.now() - i * 86_400_000 * 3).toISOString(),
      photo: `https://picsum.photos/seed/tool${i}/64/64`,
      fileProgress: i % 6 === 0 ? Math.round(Math.random() * 90) + 5 : 0
    };
  });
}

/**
 * DEV playground for the Base Module. Every core requirement is exercised here:
 * dynamic columns, pagination, custom cell templates (image / chart / buttons),
 * filtering (global + per column), sticky header, sticky left+right columns,
 * sorting, selection, and event listeners with a live event log.
 */
@Component({
  selector: 'fam-base-playground',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    JsonPipe,
    BaseTableComponent,
    BaseCellDirective,
    BaseChildCellDirective,
    BaseKpiCardComponent,
    BaseBadgeComponent,
    BaseTrendComponent,
    BaseSparklineComponent,
    BaseBreadcrumbsComponent,
    BaseTabsComponent,
    BaseStepperComponent,
    BaseButtonComponent,
    BaseTextInputComponent,
    BaseTextareaComponent,
    BaseSelectComponent,
    BaseCheckboxComponent,
    BaseRadioGroupComponent,
    BaseToggleComponent,
    BaseDatepickerComponent,
    BaseDropdownMenuComponent,
    BaseModalComponent,
    BaseAlertComponent,
    BaseProgressBarComponent,
    BaseSkeletonComponent,
    BaseTooltipDirective,
    BaseComboboxComponent,
    BaseMultiSelectChipsComponent,
    BaseFileUploadComponent,
    BaseSliderComponent,
    BaseSegmentedControlComponent,
    BaseDateRangePickerComponent,
    BaseTagComponent,
    BaseChipComponent,
    BaseStatBarComponent,
    BaseListItemComponent,
    BaseAccordionComponent,
    BaseDividerComponent,
    BaseEmptyStateComponent,
    BaseLoadingComponent,
    BaseSplitButtonComponent,
    BaseContextMenuComponent,
    BasePopoverComponent,
    BaseNotificationsPanelComponent,
    BaseGlobalSearchComponent,
    BaseDrawerComponent,
    BaseToastHostComponent,
    BaseTrendChartComponent,
    BaseBarChartComponent,
    BaseScatterChartComponent,
    BaseHistogramComponent,
    BaseStateHeatmapComponent,
    BaseGanttTimelineComponent
  ],
  template: `
    <div class="space-y-5">
      <div class="panel px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <base-breadcrumbs [items]="crumbs" (itemClick)="log('breadcrumb itemClick', $event.item.label)" />
        <base-dropdown-menu label="Bulk actions" align="right" [items]="menuItems"
                            (itemSelect)="log('menu itemSelect', $event.label)" />
      </div>

      <div class="panel px-4 pt-2 pb-4">
        <base-tabs [tabs]="tabs" [(activeId)]="activeTab" (tabSelect)="log('tabSelect', $event.label)" />
        <div class="pt-4">
          @switch (activeTab()) {
            @case ('table') { <p class="text-xs text-slate-500">Table demo below — all six core features live.</p> }
            @case ('forms') {
              <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                <base-text-input label="Tool ID" placeholder="e.g. KLA-1042" [(value)]="toolId"
                                 [clearable]="true" hint="Search by exact id"
                                 (enterPressed)="log('text enterPressed', $event)" />
                <base-text-input label="Threshold" type="number" suffix="%" [(value)]="threshold"
                                 [error]="+threshold() > 100 ? 'Must be ≤ 100' : ''" />
                <base-select label="Fab" [options]="fabOptions" [(value)]="fab" [searchable]="true"
                             (optionSelected)="log('select optionSelected', $event.label)" />
                <base-datepicker label="Maintenance date" [(value)]="maintDate"
                                 [min]="minDate" [disabledDates]="noWeekends"
                                 hint="Weekends disabled"
                                 (valueChange)="log('datepicker valueChange', $event ? $event.toDateString() : 'null')" />
                <base-radio-group label="Shift" [options]="shiftOptions" [(value)]="shift" />
                <div class="flex flex-col gap-2.5 pt-1">
                  <base-checkbox label="Include engineering tools" [(checked)]="includeEng"
                                 (checkedChange)="log('checkbox checkedChange', '' + $event)" />
                  <base-toggle label="Auto-refresh" [(checked)]="autoRefresh"
                               (checkedChange)="log('toggle checkedChange', '' + $event)" />
                </div>
                <base-textarea class="md:col-span-2" label="Notes" [(value)]="notes" [maxLength]="200"
                               placeholder="Handover notes…" [rows]="2" />
                <base-combobox label="Recipe (type-ahead)" [options]="comboOptions" [(value)]="comboValue"
                               placeholder="Type to search…" hint="Accepts free text too"
                               (optionSelected)="log('combobox optionSelected', $event.label)" />
                <base-multi-select-chips label="Fabs" [options]="multiSelectOptions" [(value)]="multiSelectValue" />
                <base-slider label="Alert threshold" [min]="0" [max]="100" unit="%" [(value)]="sliderValue" />
                <base-segmented-control [options]="segmentOptions" [(value)]="segment" ariaLabel="Time bucket" />
                <base-date-range-picker [(value)]="dateRange" (applied)="log('dateRangePicker applied', $event.preset)" />
                <base-file-upload class="md:col-span-2 xl:col-span-3" label="Attachments" accept="CSV, XLSX" [maxSizeMb]="10"
                                  [(files)]="uploadFiles" (filesAdded)="log('fileUpload filesAdded', $event.length + ' file(s)')" />
                <div class="flex items-end gap-2">
                  <base-button variant="primary" (clicked)="openModal.set(true)">Open modal</base-button>
                  <base-button variant="secondary" baseTooltip="I am a tooltip" tooltipPosition="top">Hover me</base-button>
                  <base-button variant="danger" [loading]="saving()" (clicked)="fakeSave()">Save</base-button>
                  <base-split-button [items]="splitButtonItems" (clicked)="log('splitButton clicked', 'primary')"
                                     (itemSelect)="log('splitButton itemSelect', $event.label)">More actions</base-split-button>
                </div>
              </div>
            }
            @case ('feedback') {
              <div class="space-y-5 max-w-2xl">
                <div class="space-y-3">
                  <base-alert kind="info" title="Heads up" message="CDC sync runs every 5 minutes." [dismissible]="true"
                              (dismissed)="log('alert dismissed', 'info')" />
                  <base-alert kind="success" message="Fleet snapshot exported." />
                  <base-alert kind="warning" message="3 tools have stale telemetry." />
                  <base-alert kind="error" title="Connection lost" message="Retrying ClickHouse…" />
                  <base-progress-bar [value]="72" />
                  <div class="flex items-center gap-3">
                    <base-skeleton width="40px" height="40px" shape="circle" />
                    <div class="flex-1 space-y-2">
                      <base-skeleton width="60%" />
                      <base-skeleton width="90%" />
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <base-loading message="Loading fleet snapshot…" />
                    <base-button variant="secondary" (clicked)="showToast()">Show toast</base-button>
                  </div>
                </div>

                <base-divider label="Data display" />

                <div class="flex flex-wrap items-center gap-2">
                  <base-tag label="Fleet A" icon="🏷" />
                  <base-tag label="Q3 Review" />
                  <base-chip label="Status: Active" (removed)="log('chip removed', 'Status: Active')" />
                  <base-chip label="Locked" [removable]="false" />
                </div>

                <base-stat-bar [stats]="statBarSample" />

                <div class="panel divide-y divide-neutral-100">
                  <base-list-item label="Fab-A / CH-1" icon="⚙" meta="3 alarms" [clickable]="true"
                                  (itemClick)="log('listItem itemClick', 'Fab-A / CH-1')" />
                  <base-list-item label="Fab-B / CH-2" icon="⚙" meta="0 alarms" [clickable]="true"
                                  (itemClick)="log('listItem itemClick', 'Fab-B / CH-2')" />
                </div>

                <base-accordion title="What counts as a Gap?">
                  A Gap is any interval with no reported machine state — distinct from Standby, which is a reported state.
                </base-accordion>

                <base-empty-state kind="no-results" hint="Try widening the date range or clearing filters."
                                  actionLabel="Clear filters" (action)="log('emptyState action', 'clear filters')" />
              </div>
            }
            @case ('navigation') {
              <div class="space-y-5 max-w-2xl">
                <div class="panel p-4 space-y-3">
                  <base-stepper [steps]="stepperSteps" [(activeId)]="stepperActiveId"
                                (stepSelect)="log('stepper stepSelect', $event.step.label)" />
                  <div class="flex items-center gap-2">
                    <base-button variant="secondary" [disabled]="stepperIndex() <= 0" (clicked)="stepperBack()">Back</base-button>
                    <base-button variant="primary" [disabled]="stepperIndex() >= stepperSteps.length - 1"
                                 (clicked)="stepperNext()">Next</base-button>
                  </div>
                </div>
                <div class="panel p-4 max-w-xs">
                  <base-stepper [steps]="qualificationSteps" [(activeId)]="qualificationActiveId" orientation="vertical"
                                (stepSelect)="log('stepper stepSelect', $event.step.label)" />
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  <base-popover>
                    <button trigger class="btn-secondary">Column options</button>
                    <div panel class="p-sp-4 w-56 space-y-2">
                      <base-checkbox label="Show photo column" />
                      <base-checkbox label="Show chamber column" />
                    </div>
                  </base-popover>
                  <base-button variant="secondary" (clicked)="drawerOpen.set(true)">Open drawer</base-button>
                </div>

                <div class="border border-dashed border-neutral-200 rounded-r-md px-sp-4 py-sp-6 text-center text-xs text-neutral-400"
                     (contextmenu)="contextMenuRef?.openAt($event.clientX, $event.clientY); $event.preventDefault()">
                  Right-click anywhere in this box to open a context menu
                </div>
                <base-context-menu #contextMenu [items]="contextMenuItems" (itemSelect)="log('contextMenu itemSelect', $event.label)" />

                <div class="bg-surface-inverse p-6 rounded-r-md flex flex-wrap items-center justify-between gap-3">
                  <base-global-search [results]="globalSearchResults" (resultSelect)="log('globalSearch resultSelect', $event.label)" />
                  <base-notifications-panel [notifications]="notifications"
                                            (itemClick)="log('notificationsPanel itemClick', $event.title)"
                                            (markAllRead)="log('notificationsPanel', 'mark all read')" />
                </div>
              </div>
            }
            @case ('charts') {
              <div class="grid md:grid-cols-2 gap-5">
                <div class="panel p-4">
                  <p class="panel-title mb-2">Trend chart</p>
                  <base-trend-chart [data]="trendChartData" [target]="95" seriesLabel="Uptime %" />
                </div>
                <div class="panel p-4">
                  <p class="panel-title mb-2">Bar chart</p>
                  <base-bar-chart [data]="barChartData" />
                </div>
                <div class="panel p-4">
                  <p class="panel-title mb-2">Scatter chart</p>
                  <base-scatter-chart [data]="scatterChartData" />
                </div>
                <div class="panel p-4">
                  <p class="panel-title mb-2">Histogram</p>
                  <base-histogram [bins]="histogramBins" />
                </div>
                <div class="panel p-4 md:col-span-2">
                  <p class="panel-title mb-2">State heatmap</p>
                  <base-state-heatmap [rows]="heatmapRows" [columns]="heatmapColumns" />
                </div>
                <div class="panel p-4 md:col-span-2">
                  <p class="panel-title mb-2">Gantt timeline</p>
                  <base-gantt-timeline [rows]="ganttRows" />
                </div>
              </div>
            }
          }
        </div>
      </div>

      <base-modal [(open)]="openModal" title="Edit tool" size="md" (closed)="log('modal closed', $event)">
        <div class="space-y-3">
          <base-text-input label="Tool ID" [(value)]="toolId" />
          <base-datepicker label="Next maintenance" [(value)]="maintDate" />
        </div>
        <div footer class="flex gap-2">
          <base-button variant="secondary" (clicked)="openModal.set(false)">Cancel</base-button>
          <base-button variant="primary" (clicked)="openModal.set(false); log('modal', 'saved')">Save</base-button>
        </div>
      </base-modal>

      <base-drawer [(open)]="drawerOpen" title="Tool inspector" side="right" width="380px"
                   (closed)="log('drawer closed', $event)">
        <div class="px-sp-5 py-sp-4 space-y-2 text-xs text-ink-600">
          <p><b class="text-ink-900">Tool ID:</b> {{ toolId() }}</p>
          <p>Drawers keep the current view in place — reach for one instead of a modal when the task doesn't need to leave the page.</p>
        </div>
        <div footer class="flex gap-2">
          <base-button variant="secondary" (clicked)="drawerOpen.set(false)">Close</base-button>
        </div>
      </base-drawer>

      <base-toast-host />

      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <base-kpi-card label="Fleet Uptime" [value]="94.2" unit="%" [trendPct]="1.8" [accent]="true" />
        <base-kpi-card label="Active Alarms" [value]="128" [trendPct]="-6.4" [trendBadWhenUp]="true" />
        <base-kpi-card label="Tools In Production" [value]="42" sub="of 60 tools" />
        <base-kpi-card label="MTTR" [value]="3.4" unit="h" [trendPct]="null" [clickable]="true"
                       (cardClick)="log('kpi cardClick', 'MTTR')" />
      </div>

      <!-- toolbar demoing dynamic columns + new spec features -->
      <div class="panel px-4 py-3 flex flex-wrap items-center gap-3">
        <span class="panel-title">Base Table · all features</span>
        <span class="flex-1"></span>
        <button class="btn-ghost" (click)="toggleColumn('photo')">Toggle Photo col</button>
        <button class="btn-ghost" (click)="toggleColumn('history')">Toggle Chart col</button>
        <button class="btn-ghost" (click)="addDynamicColumn()">+ Add column</button>
        <button class="btn-ghost" (click)="highlightRandomRow()">Highlight + scroll to a row</button>
      </div>

      <base-table class="panel block overflow-hidden"
        [columns]="columns()"
        [rows]="rows()"
        trackKey="toolId"
        [showFilterRow]="true"
        [stickyHeader]="true"
        maxHeight="440px"
        minWidth="1350px"
        selectable="multiple"
        [striped]="true"
        [initialPageSize]="10"
        [manageColumns]="true"
        [additionalHeader]="additionalHeader"
        [expandable]="true"
        [childColumns]="childColumns()"
        [childRowsOf]="alarmEventsOf"
        [highlightKey]="highlightedToolId()"
        (rowClick)="log('rowClick', $event.row.toolId)"
        (cellClick)="log('cellClick', $event.column.key + ' → ' + $event.row.toolId)"
        (sortChange)="onSort($event)"
        (pageChange)="onPage($event)"
        (filterChange)="onFilter($event)"
        (selectionChange)="selectedCount.set($event.length)"
        (expandChange)="log('expandChange', $event.row.toolId + ' → ' + $event.expanded)"
        (manageColumn)="log('manageColumn', $event.join(', '))"
        (handleAction)="onHandleAction($event)">

        <!-- CUSTOM CELL TEMPLATE #1: composite cell (image + text + badge) -->
        <ng-template baseCell="toolId" let-row let-value="value">
          <span class="inline-flex items-center gap-2 font-semibold text-slate-700">
            {{ value }}
            @if (row.status === 'DOWN') { <base-badge label="!" colorClass="bg-red-100 text-red-600" /> }
          </span>
        </ng-template>

        <!-- CUSTOM CHILD CELL TEMPLATE: nested table columns accept baseChildCell templates too -->
        <ng-template baseChildCell="event" let-row let-value="value">
          <span class="inline-flex items-center gap-1.5 font-medium text-slate-700">
            @if (row.severity === 'High') { <i class="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></i> }
            {{ value }}
          </span>
        </ng-template>

        <!-- CUSTOM CELL TEMPLATE #2: action buttons -->
        <ng-template baseCell="actions" let-row>
          <span class="inline-flex gap-1">
            <button class="btn-ghost" (click)="log('edit', row.toolId)">Edit</button>
            <button class="btn-ghost text-red-500 hover:text-red-700 hover:bg-red-50"
                    (click)="removeRow(row.toolId)">Delete</button>
          </span>
        </ng-template>
      </base-table>

      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Event log</span>
          <span class="text-[11px] text-slate-400">{{ selectedCount() }} row(s) selected</span>
        </div>
        <div class="p-4 font-mono text-[11px] text-slate-500 space-y-1 max-h-48 overflow-y-auto">
          @for (e of events(); track $index) { <div>{{ e }}</div> }
          @if (events().length === 0) { <div class="text-slate-300">Interact with the table…</div> }
        </div>
      </div>

      <div class="panel p-4 flex flex-wrap items-center gap-4">
        <base-badge label="PRODUCTION" colorClass="bg-emerald-50 text-emerald-600" [dot]="true" />
        <base-badge label="DOWN" colorClass="bg-red-50 text-red-600" [dot]="true" />
        <base-trend [value]="4.2" />
        <base-trend [value]="-2.1" [badWhenUp]="true" />
        <base-sparkline [data]="[3, 7, 4, 9, 6, 11, 8, 14]" color="#0ea5e9" />
        <span class="text-[11px] text-slate-400">last filter: {{ lastFilter() | json }}</span>
      </div>
    </div>
  `
})
export class BasePlaygroundComponent {
  readonly rows = signal<ToolRow[]>(mockRows(57));
  readonly selectedCount = signal(0);
  readonly events = signal<string[]>([]);
  readonly lastFilter = signal<BaseFilterEvent | null>(null);

  readonly additionalHeader: AdditionalHeaderGroup[] = [
    { displayName: 'Identity', columnIds: ['toolId', 'photo', 'fab', 'chamber'] },
    { displayName: 'Health', columnIds: ['status', 'uptime', 'alarms', 'trendPct', 'history'] }
  ];

  readonly columns = signal<BaseColumnDef<ToolRow>[]>([
    { key: 'toolId', header: 'Tool ID', sticky: 'left', width: '130px', sortable: true, filterable: true },
    { key: 'photo', header: 'Photo', kind: 'image', width: '70px', imageSize: 36 },
    { key: 'fab', header: 'Fab', kind: 'dot', filterable: true,
      dotClassMap: { 'Fab-A': 'bg-indigo-500', 'Fab-B': 'bg-sky-500', 'Fab-C': 'bg-amber-500' } },
    { key: 'chamber', header: 'Chamber', filterable: true },
    { key: 'status', header: 'Status', kind: 'badge', sortable: true, filterable: true, filterKind: 'checkbox',
      badgeClassMap: {
        PRODUCTION: 'bg-emerald-50 text-emerald-600',
        ENGINEERING: 'bg-sky-50 text-sky-600',
        STANDBY: 'bg-amber-50 text-amber-600',
        DOWN: 'bg-red-50 text-red-600'
      } },
    { key: 'uptime', header: 'Uptime', kind: 'progress', width: '150px', sortable: true, align: 'left' },
    { key: 'alarms', header: 'Alarms', kind: 'number', align: 'right', sortable: true, filterable: true, filterKind: 'range',
      cellClass: r => r.alarms > 30 ? 'text-red-600 font-bold' : '' },
    { key: 'trendPct', header: 'WoW', kind: 'trend', align: 'center', trendBadWhenUp: false },
    { key: 'history', header: '8-run trend', kind: 'sparkline', width: '120px' },
    { key: 'lastMaint', header: 'Last Maint.', kind: 'date', sortable: true, filterable: true, filterKind: 'calendar',
      dateFormat: { day: '2-digit', month: 'short', year: 'numeric' } },
    { key: 'quickActions', header: 'Quick', width: '130px', align: 'right', kind: 'row-actions',
      rowActions: [
        { type: 'view', title: 'View', run: r => this.log('view', r.toolId) },
        { type: 'edit', title: 'Edit', isDisabled: r => r.status === 'DOWN', run: r => this.log('edit', r.toolId) },
        { type: 'download', title: 'Download', run: r => this.log('download', r.toolId) },
        { type: 'delete', title: 'Delete', isHidden: r => r.status === 'PRODUCTION', run: r => this.removeRow(r.toolId) }
      ] satisfies BaseRowAction<ToolRow>[] },
    { key: 'actions', header: 'Actions', sticky: 'right', width: '140px', align: 'right' }
  ]);

  /** Nested child table: per-tool alarm events (only tools with alarms > 0 get an expand toggle). */
  readonly childColumns = signal<BaseColumnDef<any>[]>([
    { key: 'event', header: 'Alarm Event' },
    { key: 'time', header: 'Time', kind: 'date', dateFormat: { dateStyle: 'short', timeStyle: 'short' } },
    { key: 'severity', header: 'Severity', kind: 'badge',
      badgeClassMap: { High: 'bg-red-50 text-red-600', Medium: 'bg-amber-50 text-amber-600', Low: 'bg-slate-100 text-slate-500' } },
    { key: 'actions', header: '', align: 'right', width: '90px', kind: 'row-actions',
      rowActions: [
        { icon: '✎', title: 'Edit', variant: 'icon', run: r => this.log('edit alarm event', r['id']) },
        { icon: '🗑', title: 'Delete', variant: 'icon', run: r => this.removeAlarmEvent(r['id']) }
      ] }
  ]);

  private readonly alarmEventsCache = new Map<string, Record<string, unknown>[]>();
  /** [childRowsOf] hook — arrow function so `this` stays bound when passed by reference. */
  readonly alarmEventsOf = (row: ToolRow): Record<string, unknown>[] => {
    if (row.alarms === 0) return [];
    if (!this.alarmEventsCache.has(row.toolId)) {
      const severities = ['High', 'Medium', 'Low'];
      const count = Math.min(row.alarms, 5);
      this.alarmEventsCache.set(row.toolId, Array.from({ length: count }, (_, i) => ({
        id: `${row.toolId}-EV${i}`,
        event: `Alarm #${i + 1}`,
        time: new Date(Date.now() - i * 3_600_000).toISOString(),
        severity: severities[i % severities.length]
      })));
    }
    return this.alarmEventsCache.get(row.toolId)!;
  };

  private dynamicCount = 0;

  readonly crumbs = [
    { label: 'Home', icon: '🏠', url: '/' },
    { label: 'Fleet Availability' },
    { label: 'Base Playground' }
  ];
  readonly tabs = [
    { id: 'table', label: 'Table' },
    { id: 'forms', label: 'Form controls', badge: 15 },
    { id: 'feedback', label: 'Feedback & data display', badge: 9 },
    { id: 'navigation', label: 'Navigation & overlay', badge: 7 },
    { id: 'charts', label: 'Charts & timeline', badge: 6 },
    { id: 'disabled', label: 'Disabled', disabled: true }
  ];
  readonly activeTab = signal('forms');
  readonly menuItems = [
    { id: 'export', label: 'Export CSV', icon: '📄' },
    { id: 'refresh', label: 'Refresh', icon: '🔄' },
    { id: 'delete', label: 'Delete selected', icon: '🗑', danger: true, dividerBefore: true }
  ];

  readonly toolId = signal('KLA-1042');
  readonly threshold = signal('85');
  readonly notes = signal('');
  readonly fab = signal<string | null>('Fab-A');
  readonly fabOptions = FABS.map(f => ({ label: f, value: f }));
  readonly shift = signal<string | null>('A');
  readonly shiftOptions = [
    { label: 'Shift A', value: 'A' },
    { label: 'Shift B', value: 'B' },
    { label: 'Night', value: 'N', disabled: true }
  ];
  readonly includeEng = signal(true);
  readonly autoRefresh = signal(false);
  readonly maintDate = signal<Date | null>(null);
  readonly minDate = new Date(2026, 0, 1);
  readonly noWeekends = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
  readonly openModal = signal(false);
  readonly saving = signal(false);
  /** Drives [highlightKey] — set to a row's toolId to highlight + auto-scroll to it. */
  readonly highlightedToolId = signal<string | null>(null);

  // Advanced form control demo state
  readonly comboValue = signal('');
  readonly comboOptions: BaseComboOption[] = FABS.map(f => ({ label: f, value: f }));
  readonly multiSelectValue = signal<string[]>(['Fab-A']);
  readonly multiSelectOptions: BaseComboOption[] = [
    { label: 'Fab-A', value: 'Fab-A' },
    { label: 'Fab-B', value: 'Fab-B' },
    { label: 'Fab-C', value: 'Fab-C' },
    { label: 'Engineering', value: 'Engineering' }
  ];
  readonly sliderValue = signal(65);
  readonly uploadFiles = signal<BaseUploadFile[]>([]);
  readonly segment = signal<string | null>('week');
  readonly segmentOptions = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' }
  ];
  readonly dateRange = signal<DateRangeValue>({ preset: 'last7', from: null, to: null });
  readonly splitButtonItems: BaseMenuItem[] = [
    { id: 'save-as', label: 'Save as new version', icon: '📄' },
    { id: 'duplicate', label: 'Duplicate', icon: '⧉' },
    { id: 'archive', label: 'Archive', icon: '🗄', dividerBefore: true, danger: true }
  ];

  // Feedback / data display demo state
  private readonly toastSvc = inject(BaseToastService);
  readonly statBarSample = [
    { value: '94.2%', label: 'Uptime' },
    { value: 128, label: 'Active alarms' },
    { value: '3.4h', label: 'MTTR' }
  ];

  showToast(): void {
    this.toastSvc.success('Export complete', 'service_activity.xlsx is ready to download.');
  }

  // Navigation & overlay demo state
  @ViewChild('contextMenu') contextMenuRef?: BaseContextMenuComponent;
  readonly drawerOpen = signal(false);
  readonly contextMenuItems: BaseMenuItem[] = [
    { id: 'view', label: 'View details', icon: '👁' },
    { id: 'flag', label: 'Flag for review', icon: '🚩' },
    { id: 'remove', label: 'Remove', icon: '🗑', dividerBefore: true, danger: true }
  ];
  readonly notifications: BaseNotification[] = [
    { id: 'n1', icon: 'warning', title: 'Fab-B uptime dipped below 90%', time: '4m ago', read: false },
    { id: 'n2', icon: 'check_circle', title: 'Weekly export completed', message: 'service_activity.xlsx', time: '1h ago', read: false },
    { id: 'n3', icon: 'info', title: 'Scheduled maintenance tonight', time: 'Yesterday', read: true }
  ];
  readonly globalSearchResults: BaseSearchResult[] = [
    { id: 'r1', label: 'KLA-1042', type: 'Tool' },
    { id: 'r2', label: 'Fab-A', type: 'Fleet' },
    { id: 'r3', label: 'Alarm Explorer', type: 'Module' }
  ];
  readonly stepperSteps: BaseStepperStep[] = [
    { id: 'identity', label: 'Identity' },
    { id: 'placement', label: 'Placement' },
    { id: 'telemetry', label: 'Telemetry' },
    { id: 'review', label: 'Review' }
  ];
  readonly stepperActiveId = signal('telemetry');
  readonly stepperIndex = computed(() => this.stepperSteps.findIndex(s => s.id === this.stepperActiveId()));
  readonly qualificationSteps: BaseStepperStep[] = [
    { id: 'baseline', label: 'Baseline captured', description: 'Reference readings recorded' },
    { id: 'qualification', label: 'Running qualification', description: 'Comparing against tolerance band' },
    { id: 'signoff', label: 'Sign-off', description: 'Engineer approval pending' }
  ];
  readonly qualificationActiveId = signal('qualification');

  stepperNext(): void {
    const next = this.stepperSteps[this.stepperIndex() + 1];
    if (next) this.stepperActiveId.set(next.id);
  }

  stepperBack(): void {
    const prev = this.stepperSteps[this.stepperIndex() - 1];
    if (prev) this.stepperActiveId.set(prev.id);
  }

  // Chart & timeline demo data
  readonly trendChartData: BaseChartPoint[] = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']
    .map((x, i) => ({ x, y: 90 + Math.round(Math.sin(i) * 4 + i * 0.3) }));
  readonly barChartData: BaseChartPoint[] = FABS.map(f => ({ x: f, y: 10 + Math.round(Math.random() * 30) }));
  readonly scatterChartData: BaseScatterPoint[] = Array.from({ length: 18 }, () => ({
    x: 10 + Math.round(Math.random() * 80),
    y: 60 + Math.round(Math.random() * 40)
  }));
  readonly histogramBins = [
    { label: '0-1h', count: 12 },
    { label: '1-2h', count: 18 },
    { label: '2-4h', count: 9 },
    { label: '4-8h', count: 5 },
    { label: '8h+', count: 2 }
  ];
  readonly heatmapColumns = Array.from({ length: 12 }, (_, i) => `${i * 2}:00`);
  readonly heatmapRows: BaseHeatmapRow[] = ['CH-1', 'CH-2', 'CH-3'].map(label => ({
    label,
    cells: this.heatmapColumns.map(col => ({
      col,
      state: (['production', 'engineering', 'standby', 'scheduled-dt', 'unscheduled-dt', 'gap'] as const)[Math.floor(Math.random() * 6)]
    }))
  }));
  readonly ganttRows: BaseGanttRow[] = [
    { label: 'System', badge: '96.2%', segments: [
      { startHour: 0, endHour: 6, state: 'standby' },
      { startHour: 6, endHour: 18, state: 'production' },
      { startHour: 18, endHour: 24, state: 'engineering' }
    ] },
    { label: 'Tool', badge: '91.7%', segments: [
      { startHour: 0, endHour: 8, state: 'production' },
      { startHour: 8, endHour: 9, state: 'unscheduled-dt' },
      { startHour: 9, endHour: 24, state: 'production' }
    ] }
  ];

  fakeSave(): void {
    this.saving.set(true);
    setTimeout(() => { this.saving.set(false); this.log('button', 'save complete'); }, 1200);
  }

  log(name: string, detail: string): void {
    this.events.update(e => [`${new Date().toLocaleTimeString()}  (${name})  ${detail}`, ...e].slice(0, 40));
  }

  onSort(e: BaseSortEvent): void { this.log('sortChange', `${e.key ?? '—'} ${e.direction ?? ''}`); }
  onPage(e: BasePageEvent): void { this.log('pageChange', `page ${e.page} · size ${e.pageSize}`); }
  onFilter(e: BaseFilterEvent): void { this.lastFilter.set(e); this.log('filterChange', JSON.stringify(e)); }
  onHandleAction(e: BaseHandleActionEvent<ToolRow>): void { this.log('handleAction', `${e.actionType} → ${e.row.toolId}`); }

  /** Picks a row further down the list and highlights + auto-scrolls to it (spec #11). */
  highlightRandomRow(): void {
    const rows = this.rows();
    if (rows.length === 0) return;
    const row = rows[Math.min(rows.length - 1, 20 + Math.floor(Math.random() * 10))];
    this.highlightedToolId.set(row.toolId);
  }

  /** Dynamic columns: hide/show at runtime — just data changes. */
  toggleColumn(key: string): void {
    this.columns.update(cols => cols.map(c => c.key === key ? { ...c, hidden: !c.hidden } : c));
  }

  /** Dynamic columns: append a brand-new column at runtime. */
  addDynamicColumn(): void {
    const n = ++this.dynamicCount;
    this.columns.update(cols => [
      ...cols.slice(0, -1),
      { key: `dyn${n}`, header: `Extra ${n}`, value: r => `${r.chamber}/${n}` },
      cols[cols.length - 1]
    ]);
  }

  removeRow(toolId: string): void {
    this.rows.update(r => r.filter(x => x.toolId !== toolId));
    this.log('delete', toolId);
  }

  removeAlarmEvent(id: unknown): void {
    for (const [toolId, events] of this.alarmEventsCache) {
      if (events.some(e => e['id'] === id)) {
        this.alarmEventsCache.set(toolId, events.filter(e => e['id'] !== id));
        this.log('delete alarm event', String(id));
        return;
      }
    }
  }
}
