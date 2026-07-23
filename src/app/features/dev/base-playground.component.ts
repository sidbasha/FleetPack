import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  BaseAlertComponent,
  BaseBadgeComponent,
  BaseBreadcrumbsComponent,
  BaseButtonComponent,
  BaseCellDirective,
  BaseCheckboxComponent,
  BaseColumnDef,
  BaseDatepickerComponent,
  BaseDropdownMenuComponent,
  BaseFilterEvent,
  BaseKpiCardComponent,
  BaseModalComponent,
  BasePageEvent,
  BaseProgressBarComponent,
  BaseRadioGroupComponent,
  BaseSelectComponent,
  BaseSkeletonComponent,
  BaseSortEvent,
  BaseSparklineComponent,
  BaseTableComponent,
  BaseTabsComponent,
  BaseTextInputComponent,
  BaseTextareaComponent,
  BaseToggleComponent,
  BaseTooltipDirective,
  BaseTrendComponent
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
      photo: `https://picsum.photos/seed/tool${i}/64/64`
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
    BaseKpiCardComponent,
    BaseBadgeComponent,
    BaseTrendComponent,
    BaseSparklineComponent,
    BaseBreadcrumbsComponent,
    BaseTabsComponent,
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
    BaseTooltipDirective
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
                <div class="flex items-end gap-2">
                  <base-button variant="primary" (clicked)="openModal.set(true)">Open modal</base-button>
                  <base-button variant="secondary" baseTooltip="I am a tooltip" tooltipPosition="top">Hover me</base-button>
                  <base-button variant="danger" [loading]="saving()" (clicked)="fakeSave()">Save</base-button>
                </div>
              </div>
            }
            @case ('feedback') {
              <div class="space-y-3 max-w-xl">
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

      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <base-kpi-card label="Fleet Uptime" [value]="94.2" unit="%" [trendPct]="1.8" [accent]="true" />
        <base-kpi-card label="Active Alarms" [value]="128" [trendPct]="-6.4" [trendBadWhenUp]="true" />
        <base-kpi-card label="Tools In Production" [value]="42" sub="of 60 tools" />
        <base-kpi-card label="MTTR" [value]="3.4" unit="h" [trendPct]="null" [clickable]="true"
                       (cardClick)="log('kpi cardClick', 'MTTR')" />
      </div>

      <!-- toolbar demoing dynamic columns -->
      <div class="panel px-4 py-3 flex flex-wrap items-center gap-3">
        <span class="panel-title">Base Table · all features</span>
        <span class="flex-1"></span>
        <button class="btn-ghost" (click)="toggleColumn('photo')">Toggle Photo col</button>
        <button class="btn-ghost" (click)="toggleColumn('history')">Toggle Chart col</button>
        <button class="btn-ghost" (click)="addDynamicColumn()">+ Add column</button>
      </div>

      <base-table class="panel block overflow-hidden"
        [columns]="columns()"
        [rows]="rows()"
        trackKey="toolId"
        [showFilterRow]="true"
        [stickyHeader]="true"
        maxHeight="440px"
        minWidth="1250px"
        selectable="multiple"
        [initialPageSize]="10"
        (rowClick)="log('rowClick', $event.row.toolId)"
        (cellClick)="log('cellClick', $event.column.key + ' → ' + $event.row.toolId)"
        (sortChange)="onSort($event)"
        (pageChange)="onPage($event)"
        (filterChange)="onFilter($event)"
        (selectionChange)="selectedCount.set($event.length)">

        <!-- CUSTOM CELL TEMPLATE #1: composite cell (image + text + badge) -->
        <ng-template baseCell="toolId" let-row let-value="value">
          <span class="inline-flex items-center gap-2 font-semibold text-slate-700">
            {{ value }}
            @if (row.status === 'DOWN') { <base-badge label="!" colorClass="bg-red-100 text-red-600" /> }
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

  readonly columns = signal<BaseColumnDef<ToolRow>[]>([
    { key: 'toolId', header: 'Tool ID', sticky: 'left', width: '130px', sortable: true, filterable: true },
    { key: 'photo', header: 'Photo', kind: 'image', width: '70px', imageSize: 36 },
    { key: 'fab', header: 'Fab', kind: 'dot', filterable: true,
      dotClassMap: { 'Fab-A': 'bg-indigo-500', 'Fab-B': 'bg-sky-500', 'Fab-C': 'bg-amber-500' } },
    { key: 'chamber', header: 'Chamber', filterable: true },
    { key: 'status', header: 'Status', kind: 'badge', sortable: true, filterable: true,
      badgeClassMap: {
        PRODUCTION: 'bg-emerald-50 text-emerald-600',
        ENGINEERING: 'bg-sky-50 text-sky-600',
        STANDBY: 'bg-amber-50 text-amber-600',
        DOWN: 'bg-red-50 text-red-600'
      } },
    { key: 'uptime', header: 'Uptime', kind: 'progress', width: '150px', sortable: true, align: 'left' },
    { key: 'alarms', header: 'Alarms', kind: 'number', align: 'right', sortable: true,
      cellClass: r => r.alarms > 30 ? 'text-red-600 font-bold' : '' },
    { key: 'trendPct', header: 'WoW', kind: 'trend', align: 'center', trendBadWhenUp: false },
    { key: 'history', header: '8-run trend', kind: 'sparkline', width: '120px' },
    { key: 'lastMaint', header: 'Last Maint.', kind: 'date', sortable: true,
      dateFormat: { day: '2-digit', month: 'short', year: 'numeric' } },
    { key: 'actions', header: 'Actions', sticky: 'right', width: '140px', align: 'right' }
  ]);

  private dynamicCount = 0;

  readonly crumbs = [
    { label: 'Home', icon: '🏠', url: '/' },
    { label: 'Fleet Availability' },
    { label: 'Base Playground' }
  ];
  readonly tabs = [
    { id: 'table', label: 'Table' },
    { id: 'forms', label: 'Form controls', badge: 9 },
    { id: 'feedback', label: 'Feedback' },
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
}
