import { ChangeDetectionStrategy, Component, Input, OnChanges, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlarmStore, RecipeFilter } from '../../core/state/alarm.store';
import { KpiComponent, LoadingComponent } from '../../shared/components/ui.components';
import { DynamicPageComponent } from '../../shared/dynamic/dynamic-page.component';
import { WidgetConfig } from '../../shared/dynamic/widget.model';
import { downloadCsv } from '../../shared/utils/csv.util';

@Component({
  selector: 'fam-alarm-events',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, KpiComponent, LoadingComponent, DynamicPageComponent],
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <div>
        <p class="text-[11px] text-slate-400">
          <a routerLink="/alarm-explorer" class="hover:text-indigo-600">Alarm Explorer</a> ›
          <a [routerLink]="['/alarm-explorer/fleet', fleetId]" class="hover:text-indigo-600">{{ fleetId }}</a> ›
          <a [routerLink]="['/alarm-explorer/fleet', fleetId, 'tool', toolId]" class="hover:text-indigo-600">{{ toolId }}</a> › Events
        </p>
        <h1 class="text-lg font-bold text-slate-900">
          <span class="font-mono text-indigo-600">{{ alarmId }}</span>
          <span class="text-slate-500 font-medium text-base ml-1">· {{ store.events()?.alarm?.description }}</span>
          <span class="badge-fam">FAM</span>
        </h1>
      </div>
      <div class="flex-1"></div>
      @if (store.events(); as d) {
        <fam-kpi label="Total Events" [value]="d.total" accent />
        <fam-kpi label="Frequency" [value]="d.alarm.freqPerDay" unit=" / day" />
        <fam-kpi label="Recipe Match" [value]="d.alarm.recipeMatchPct" unit="%" [sub]="d.alarm.recipe ?? 'No recipe context'" />
      }
    </div>

    @if (store.eventsLoading()) {
      <fam-loading what="alarm events" />
    } @else {
      <fam-dynamic-page class="block mt-3.5" [widgets]="widgets()" />
    }
  `
})
export class AlarmEventsComponent implements OnChanges {
  @Input({ required: true }) fleetId = '';
  @Input({ required: true }) toolId = '';
  @Input({ required: true }) alarmId = '';

  store = inject(AlarmStore);

  private recipeFilters: { key: RecipeFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'with', label: 'With recipe' },
    { key: 'without', label: 'No recipe' }
  ];

  readonly widgets = computed<WidgetConfig[]>(() => {
    const d = this.store.events();
    if (!d) return [];
    const page = this.store.eventPage();
    const size = 20;
    const filteredTotal = this.store.filteredEvents().length;

    return [
      {
        id: 'alarm-events', type: 'table', badge: 'FAM',
        title: 'Alarm Events · chronological log',
        footer: `Showing ${filteredTotal === 0 ? 0 : (page - 1) * size + 1}–${Math.min(page * size, filteredTotal)} of ${filteredTotal} events`,
        actions: [
          ...this.recipeFilters.map(f => ({
            label: (this.store.recipeFilter() === f.key ? '● ' : '') + f.label,
            run: () => this.store.setRecipeFilter(f.key)
          })),
          { label: '↓ CSV', run: () => this.exportCsv() }
        ],
        columns: [
          { key: 'seq', header: '#', kind: 'mono', classFn: () => 'text-slate-300' },
          { key: 'timestamp', header: 'Timestamp', kind: 'mono' },
          { key: 'toolId', header: 'Tool', kind: 'mono', classFn: () => 'text-slate-500' },
          { key: 'recipe', header: 'Recipe', kind: 'mono', classFn: r => r.recipe ? 'text-slate-600' : 'text-slate-300' },
          { key: 'workWeek', header: 'Work Week', kind: 'mono', classFn: () => 'text-slate-400' },
          { key: 'swVersion', header: 'SW Version', kind: 'mono', classFn: () => 'text-slate-400' },
          { key: 'duration', header: 'Duration', align: 'right', kind: 'mono' },
          {
            key: 'resolution', header: 'Resolution', kind: 'badge',
            badgeClassMap: {
              'Auto-cleared': 'bg-emerald-50 text-emerald-600',
              'Manual reset': 'bg-amber-50 text-amber-600',
              'Tool downtime': 'bg-red-50 text-red-600'
            }
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
