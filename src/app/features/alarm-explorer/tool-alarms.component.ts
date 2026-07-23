import { ChangeDetectionStrategy, Component, Input, OnChanges, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlarmStore } from '../../core/state/alarm.store';
import { LoadingComponent } from '../../shared/components/ui.components';
import { BaseBreadcrumbsComponent, BaseDrawerComponent, BaseSelectComponent, BaseSelectOption } from '../../base';
import { DynamicPageComponent } from '../../shared/dynamic/dynamic-page.component';
import { WidgetConfig } from '../../shared/dynamic/widget.model';
import { AlarmCategory, AlarmDefinition } from '../../core/models/models';
import { downloadCsv } from '../../shared/utils/csv.util';
import { AlarmInfoPanelComponent } from './alarm-info-panel.component';

const CAT_BADGE: Record<AlarmCategory, string> = {
  'Equipment Safety': 'bg-red-50 text-red-700 border border-red-200',
  'Attention Flags': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Data Integrity': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Irrecoverable': 'bg-violet-50 text-violet-700 border border-violet-200'
};

const ALL_CATEGORIES = Object.keys(CAT_BADGE) as AlarmCategory[];

/**
 * Tool alarm summary — dynamic table; the selected alarm opens in a
 * <base-drawer> hosting the 'alarm-info-panel' inspector.
 */
@Component({
  selector: 'fam-tool-alarms',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LoadingComponent, DynamicPageComponent,
    BaseBreadcrumbsComponent, BaseSelectComponent, BaseDrawerComponent, AlarmInfoPanelComponent
  ],
  template: `
    <div class="flex flex-wrap items-end gap-x-8 gap-y-3">
      <div>
        <base-breadcrumbs class="block mb-0.5" [items]="crumbs()" />
        <h1 class="text-lg font-bold text-slate-900">
          {{ toolId }}
          <span class="ml-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-1">{{ store.toolAlarms()?.totalAlarms }} Alarms</span>
        </h1>
      </div>
      <div class="flex-1"></div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Alarm ID</label>
        <base-select class="w-36" [options]="alarmIdOptions()" [value]="alarmIdFilter()" (valueChange)="alarmIdFilter.set($event ?? 'All Alarms')" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Category</label>
        <base-select class="w-36" [options]="categoryOptions" [value]="category()" (valueChange)="category.set($event ?? 'All Categories')" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Severity</label>
        <base-select class="w-36" [options]="severityOptions" [value]="severity()" (valueChange)="severity.set($event ?? 'all')" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Recipe</label>
        <base-select class="w-36" [options]="recipeOptions()" [value]="recipe()" (valueChange)="recipe.set($event ?? 'Any Recipe')" />
      </div>
    </div>

    @if (store.toolLoading()) {
      <fam-loading what="tool alarms" />
    } @else {
      <fam-dynamic-page class="block mt-3.5" [widgets]="widgets()" />
    }

    <base-drawer [open]="!!store.inspectedAlarmId()" (openChange)="!$event && store.inspectedAlarmId.set(null)"
                 [showClose]="false" width="460px">
      <fam-alarm-info-panel />
      @if (store.inspectedAlarm(); as a) {
        <div footer class="w-full flex gap-2">
          <button class="btn-primary flex-1" (click)="openEvents(a.alarmId)">View Event Log</button>
          <button class="btn-ghost flex-1 border border-slate-200">Export Alarm Data</button>
        </div>
      }
    </base-drawer>
  `
})
export class ToolAlarmsComponent implements OnChanges {
  @Input({ required: true }) fleetId = '';
  @Input({ required: true }) toolId = '';

  store = inject(AlarmStore);
  private router = inject(Router);

  crumbs(): { label: string; url?: string }[] {
    return [
      { label: 'Alarm Explorer', url: '/alarm-explorer' },
      { label: this.fleetId, url: `/alarm-explorer/fleet/${this.fleetId}` },
      { label: this.toolId }
    ];
  }

  readonly search = signal('');
  readonly severity = signal<'all' | 'Fatal' | 'Non-Fatal'>('all');
  readonly category = signal('All Categories');
  readonly alarmIdFilter = signal('All Alarms');
  readonly recipe = signal('Any Recipe');

  readonly severityOptions: BaseSelectOption<'all' | 'Fatal' | 'Non-Fatal'>[] = [
    { label: 'All severities', value: 'all' },
    { label: 'Fatal', value: 'Fatal' },
    { label: 'Non-Fatal', value: 'Non-Fatal' }
  ];
  readonly categoryOptions: BaseSelectOption<string>[] = [
    { label: 'All Categories', value: 'All Categories' },
    ...ALL_CATEGORIES.map(c => ({ label: c, value: c }))
  ];

  readonly alarmIdOptions = computed<BaseSelectOption<string>[]>(() => [
    { label: 'All Alarms', value: 'All Alarms' },
    ...(this.store.toolAlarms()?.alarms.map(a => ({ label: a.alarmId, value: a.alarmId })) ?? [])
  ]);

  readonly recipeOptions = computed<BaseSelectOption<string>[]>(() => {
    const recipes = [...new Set((this.store.toolAlarms()?.alarms ?? []).map(a => a.recipe).filter((r): r is string => !!r))];
    return [{ label: 'Any Recipe', value: 'Any Recipe' }, { label: 'No Recipe', value: 'No Recipe' }, ...recipes.map(r => ({ label: r, value: r }))];
  });

  private filtered = computed(() => {
    const q = this.search().toLowerCase();
    const sev = this.severity();
    const cat = this.category();
    const alarmId = this.alarmIdFilter();
    const rec = this.recipe();
    return (this.store.toolAlarms()?.alarms ?? []).filter(a =>
      (sev === 'all' || a.severity === sev) &&
      (cat === 'All Categories' || a.category === cat) &&
      (alarmId === 'All Alarms' || a.alarmId === alarmId) &&
      (rec === 'Any Recipe' || (rec === 'No Recipe' ? !a.recipe : a.recipe === rec)) &&
      (!q || a.alarmId.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
    );
  });

  readonly widgets = computed<WidgetConfig[]>(() => {
    const d = this.store.toolAlarms();
    if (!d) return [];
    const rows = this.filtered();

    return [
      {
        id: 'alarm-summary', type: 'table',
        title: `Alarm Summary: ${this.toolId}`,
        subtitle: 'All alarm types recorded on this tool · click row to inspect events',
        search: { placeholder: 'Search alarms…', value: this.search(), onChange: v => this.search.set(v) },
        actions: [{ label: '↓ Export', kind: 'primary', run: () => this.exportCsv() }],
        footer: `Showing 1–${rows.length} of ${d.alarms.length} alarms`,
        columns: [
          { key: 'alarmId', header: 'Alarm ID', kind: 'mono', sortable: true, classFn: () => 'font-bold text-indigo-600' },
          { key: 'description', header: 'Description' },
          {
            key: 'category', header: 'Category', kind: 'badge',
            format: r => `• ${r.category}`,
            badgeClassMap: CAT_BADGE
          },
          {
            key: 'severity', header: 'Severity', kind: 'badge',
            badgeClassMap: {
              'Fatal': 'bg-red-50 text-red-700 border border-red-200',
              'Non-Fatal': 'bg-slate-100 text-slate-500 border border-slate-200'
            }
          },
          { key: 'count', header: 'Count', align: 'right', kind: 'mono', classFn: () => 'font-bold' },
          { key: 'freqPerDay', header: 'Freq/Day', align: 'right', kind: 'mono', format: r => `${(r as AlarmDefinition).freqPerDay.toFixed(2)}/day` },
          { key: 'lastSeen', header: 'Last Seen', kind: 'mono', format: r => (r as AlarmDefinition).lastSeen.slice(0, 10), classFn: () => 'text-slate-400' },
          { key: 'recipe', header: 'Recipe', kind: 'mono', classFn: r => r.recipe ? 'text-indigo-600 font-medium' : 'text-slate-300' },
          {
            key: 'actions', header: 'Actions', align: 'right', kind: 'row-actions',
            rowActions: [{ icon: '👁 Events', title: 'View events', variant: 'button', run: r => this.openEvents((r as AlarmDefinition).alarmId) }]
          }
        ],
        rows,
        trackKey: 'alarmId',
        selectedKey: this.store.inspectedAlarmId(),
        onRowClick: row => this.store.inspectedAlarmId.set((row as AlarmDefinition).alarmId)
      }
    ];
  });

  ngOnChanges(): void {
    if (this.fleetId && this.toolId) this.store.loadTool(this.fleetId, this.toolId);
  }

  openEvents(alarmId: string): void {
    this.router.navigate(['/alarm-explorer/fleet', this.fleetId, 'tool', this.toolId, 'alarm', alarmId]);
  }

  exportCsv(): void {
    const rows = this.filtered();
    downloadCsv(`${this.toolId}-alarms.csv`, [
      ['AlarmID', 'Description', 'Category', 'Severity', 'Count', 'FreqPerDay', 'LastSeen', 'Recipe'],
      ...rows.map(a => [a.alarmId, a.description, a.category, a.severity, a.count, a.freqPerDay, a.lastSeen, a.recipe ?? ''])
    ]);
  }
}
