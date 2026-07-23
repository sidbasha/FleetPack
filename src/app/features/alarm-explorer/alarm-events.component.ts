import { ChangeDetectionStrategy, Component, Input, OnChanges, computed, inject, signal } from '@angular/core';
import { AlarmStore, RecipeFilter } from '../../core/state/alarm.store';
import { FilterStore } from '../../core/state/filter.store';
import { LoadingComponent } from '../../shared/components/ui.components';
import { BaseBreadcrumbsComponent, BaseSelectComponent, BaseSelectOption } from '../../base';
import { DynamicPageComponent } from '../../shared/dynamic/dynamic-page.component';
import { WidgetConfig } from '../../shared/dynamic/widget.model';
import { downloadCsv } from '../../shared/utils/csv.util';
import { GlobalFilters } from '../../core/models/models';
import { FILTER_OPTIONS } from '../../core/constants/app.constants';

const RESOLUTION_BADGE: Record<string, string> = {
  'Auto-cleared': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Manual reset': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Tool downtime': 'bg-red-50 text-red-700 border border-red-200'
};

@Component({
  selector: 'fam-alarm-events',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoadingComponent, DynamicPageComponent, BaseBreadcrumbsComponent, BaseSelectComponent],
  template: `
    <div class="flex flex-wrap items-end gap-x-8 gap-y-3">
      <div>
        <base-breadcrumbs class="block mb-0.5" [items]="crumbs()" />
        <h1 class="text-lg font-bold text-slate-900">
          <span class="font-mono text-indigo-600">{{ alarmId }}</span>
          <span class="text-slate-500 font-medium text-base ml-1">· {{ store.events()?.alarm?.description }}</span>
        </h1>
      </div>
      <div class="flex-1"></div>
      <span class="flex flex-col items-end leading-tight">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Date Range</label>
        <span class="text-[11px] font-medium text-slate-600 mt-0.5">{{ filters.dateRangeLabel() }}</span>
      </span>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Recipe</label>
        <base-select class="w-32" [options]="recipeSelectOptions" [value]="store.recipeFilter()" (valueChange)="store.setRecipeFilter($event ?? 'all')" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Show</label>
        <base-select class="w-32" [options]="pageSizeOptions" [value]="pageSize()" (valueChange)="pageSize.set($event ?? 50)" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Duration</label>
        <base-select class="w-32" [options]="durationOptions" [value]="duration()" (valueChange)="duration.set($event ?? durationOptions[0].value)" />
      </div>
    </div>

    @if (store.eventsLoading()) {
      <fam-loading what="alarm events" />
    } @else {
      @if (store.events(); as d) {
        <div class="panel mt-4 overflow-hidden">
          <div class="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div class="flex-1 px-5 py-4 min-w-0">
              <span class="kpi-label">Tool:</span>
              <span class="block text-lg font-bold text-slate-800 mt-1 font-mono">{{ toolId }}</span>
              <span class="block text-[11px] text-slate-400 mt-0.5">Listed below</span>
            </div>
            <div class="flex-1 px-5 py-4 min-w-0">
              <span class="kpi-label">Severity:</span>
              <span class="block text-lg font-bold mt-1" [class]="d.alarm.severity === 'Fatal' ? 'text-red-600' : 'text-slate-800'">{{ d.alarm.severity }}</span>
              <span class="block text-[11px] text-slate-400 mt-0.5">From recent observation</span>
            </div>
            <div class="flex-1 px-5 py-4 min-w-0">
              <span class="kpi-label">Category:</span>
              <span class="block text-lg font-bold text-slate-800 mt-1">{{ d.alarm.category }}</span>
            </div>
            <div class="flex-1 px-5 py-4 min-w-0 flex items-center justify-between gap-3">
              <span class="min-w-0">
                <span class="kpi-label">Description:</span>
                <span class="block text-lg font-bold text-slate-800 mt-1 truncate">{{ d.alarm.description }}</span>
              </span>
              <button class="btn-ghost border border-slate-200 shrink-0">Edit Details</button>
            </div>
          </div>
        </div>
      }
      <fam-dynamic-page class="block mt-3.5" [widgets]="widgets()" />
    }
  `
})
export class AlarmEventsComponent implements OnChanges {
  @Input({ required: true }) fleetId = '';
  @Input({ required: true }) toolId = '';
  @Input({ required: true }) alarmId = '';

  store = inject(AlarmStore);
  filters = inject(FilterStore);

  readonly pageSize = signal(50);
  readonly duration = signal<GlobalFilters['duration']>('Last 13 Weeks');

  readonly recipeSelectOptions: BaseSelectOption<RecipeFilter>[] = [
    { label: 'All Events', value: 'all' },
    { label: 'With Recipe', value: 'with' },
    { label: 'No Recipe', value: 'without' }
  ];
  readonly pageSizeOptions: BaseSelectOption<number>[] = [10, 20, 50, 100].map(n => ({ label: `${n} per page`, value: n }));
  readonly durationOptions: BaseSelectOption<GlobalFilters['duration']>[] = FILTER_OPTIONS.durations.map(d => ({ label: d, value: d }));

  private recipeTabs: { key: RecipeFilter; label: string }[] = [
    { key: 'all', label: 'All Events' },
    { key: 'with', label: 'With Recipe' },
    { key: 'without', label: 'No Recipe' }
  ];

  crumbs(): { label: string; url?: string }[] {
    return [
      { label: 'Alarm Explorer', url: '/alarm-explorer' },
      { label: this.fleetId, url: `/alarm-explorer/fleet/${this.fleetId}` },
      { label: this.toolId, url: `/alarm-explorer/fleet/${this.fleetId}/tool/${this.toolId}` },
      { label: `${this.alarmId} · Events` }
    ];
  }

  readonly widgets = computed<WidgetConfig[]>(() => {
    const d = this.store.events();
    if (!d) return [];
    const page = this.store.eventPage();
    const size = 20;
    const filteredTotal = this.store.filteredEvents().length;

    return [
      {
        id: 'alarm-events', type: 'table', badge: 'FAM',
        title: `Event Instances — ${this.alarmId}`,
        subtitle: 'Chronological event log · click timestamp to view log context',
        tabs: {
          items: this.recipeTabs.map(f => ({ id: f.key, label: f.label })),
          activeId: this.store.recipeFilter(),
          onChange: id => this.store.setRecipeFilter(id as RecipeFilter)
        },
        actions: [{ label: '↓ CSV', kind: 'ghost', run: () => this.exportCsv() }],
        footer: `Showing ${filteredTotal === 0 ? 0 : (page - 1) * size + 1}–${Math.min(page * size, filteredTotal)} of ${filteredTotal} events`,
        columns: [
          { key: 'seq', header: '#', kind: 'mono', classFn: () => 'text-slate-300' },
          { key: 'timestamp', header: 'Timestamp', kind: 'mono', classFn: () => 'text-indigo-600 font-semibold' },
          { key: 'toolId', header: 'Tool', kind: 'mono', classFn: () => 'text-slate-500' },
          {
            key: 'recipe', header: 'Recipe', kind: 'mono',
            format: r => r.recipe ?? '—',
            classFn: r => r.recipe ? 'text-indigo-600 font-medium' : 'text-slate-300'
          },
          { key: 'workWeek', header: 'Work Week', kind: 'mono', classFn: () => 'text-slate-400' },
          { key: 'swVersion', header: 'SW Version', kind: 'mono', classFn: () => 'text-slate-400' },
          { key: 'duration', header: 'Duration', align: 'right', kind: 'mono' },
          {
            key: 'resolution', header: 'Resolution', kind: 'badge',
            badgeClassMap: RESOLUTION_BADGE
          },
          {
            key: 'viewLog', header: 'View Log', align: 'right', kind: 'row-actions',
            rowActions: [{ icon: '📋 View Log', title: 'View log context', variant: 'button', run: () => void 0 }]
          }
        ],
        rows: this.store.pagedEvents(),
        trackKey: 'seq',
        pagination: {
          page,
          pageCount: this.store.eventPageCount(),
          onPrev: () => this.store.prevEventPage(),
          onNext: () => this.store.nextEventPage()
        }
      }
    ];
  });

  ngOnChanges(): void {
    if (this.fleetId && this.toolId && this.alarmId) {
      this.store.loadEvents(this.fleetId, this.toolId, this.alarmId);
    }
  }

  exportCsv(): void {
    downloadCsv(`${this.alarmId}-events.csv`, [
      ['Seq', 'Timestamp', 'Tool', 'Recipe', 'WorkWeek', 'SWVersion', 'Duration', 'Resolution'],
      ...this.store.filteredEvents().map(e => [e.seq, e.timestamp, e.toolId, e.recipe ?? '', e.workWeek, e.swVersion, e.duration, e.resolution])
    ]);
  }
}
