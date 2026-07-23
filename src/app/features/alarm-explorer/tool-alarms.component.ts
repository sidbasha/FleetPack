import { ChangeDetectionStrategy, Component, Input, OnChanges, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlarmStore } from '../../core/state/alarm.store';
import { LoadingComponent } from '../../shared/components/ui.components';
import { BaseBreadcrumbsComponent, BaseButtonComponent, BaseSearchInputComponent, BaseSelectComponent } from '../../base';
import { DynamicPageComponent } from '../../shared/dynamic/dynamic-page.component';
import { WidgetConfig } from '../../shared/dynamic/widget.model';
import { AlarmDefinition } from '../../core/models/models';

/**
 * Tool alarm summary — dynamic table + the 'alarm-info-panel'
 * component widget resolved by name from the widget registry.
 */
@Component({
  selector: 'fam-tool-alarms',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LoadingComponent, DynamicPageComponent,
    BaseBreadcrumbsComponent, BaseSearchInputComponent, BaseSelectComponent, BaseButtonComponent
  ],
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <div>
        <base-breadcrumbs class="block mb-0.5" [items]="crumbs()" />
        <h1 class="text-lg font-bold text-slate-900">
          {{ toolId }}
          <span class="ml-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-1">{{ store.toolAlarms()?.totalAlarms }} alarms</span>
          <span class="badge-fam">FAM</span>
        </h1>
      </div>
      <div class="flex-1"></div>
      <base-search-input placeholder="Search alarms…" (search)="search.set($event)" />
      <base-select class="w-40" [options]="severityOptions" [value]="severity()"
                   (valueChange)="severity.set($event ?? 'all')" />
      <base-button variant="primary" (clicked)="exportCsv()">↓ Export</base-button>
    </div>

    @if (store.toolLoading()) {
      <fam-loading what="tool alarms" />
    } @else {
      <fam-dynamic-page class="block mt-3.5" [widgets]="widgets()" />
    }
  `
})
export class ToolAlarmsComponent implements OnChanges {
  @Input({ required: true }) fleetId = '';

  crumbs(): { label: string; url?: string }[] {
    return [
      { label: 'Alarm Explorer', url: '/alarm-explorer' },
      { label: this.fleetId, url: `/alarm-explorer/fleet/${this.fleetId}` },
      { label: 'Tool' }
    ];
  }
  @Input({ required: true }) toolId = '';

  store = inject(AlarmStore);
  private router = inject(Router);

  readonly search = signal('');
  readonly severity = signal<'all' | 'Fatal' | 'Non-Fatal'>('all');
  readonly severityOptions: { label: string; value: 'all' | 'Fatal' | 'Non-Fatal' }[] = [
    { label: 'All severities', value: 'all' },
    { label: 'Fatal', value: 'Fatal' },
    { label: 'Non-Fatal', value: 'Non-Fatal' }
  ];

  exportCsv(): void { /* hook for the CSV util — wired by the app team */ }

  private filtered = computed(() => {
    const q = this.search().toLowerCase();
    const sev = this.severity();
    return (this.store.toolAlarms()?.alarms ?? []).filter(a =>
      (sev === 'all' || a.severity === sev) &&
      (!q || a.alarmId.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
    );
  });

  readonly widgets = computed<WidgetConfig[]>(() => {
    const d = this.store.toolAlarms();
    if (!d) return [];
    const rows = this.filtered();

    return [
      {
        id: 'alarm-summary', type: 'table', colSpan: 4,
        title: `Alarm Summary · ${this.toolId}`,
        subtitle: 'All alarm types on this tool · click a row to inspect',
        footer: `Showing 1–${rows.length} of ${d.alarms.length} alarms`,
        columns: [
          { key: 'alarmId', header: 'Alarm ID', kind: 'mono', classFn: () => 'font-bold text-indigo-600' },
          { key: 'description', header: 'Description' },
          {
            key: 'category', header: 'Category', kind: 'dot',
            dotClassMap: {
              'Equipment Safety': 'bg-alarm-safety', 'Attention Flags': 'bg-alarm-attention',
              'Data Integrity': 'bg-alarm-integrity', 'Irrecoverable': 'bg-alarm-irrecoverable'
            }
          },
          {
            key: 'severity', header: 'Severity', kind: 'badge',
            badgeClassMap: { 'Fatal': 'bg-red-50 text-red-600', 'Non-Fatal': 'bg-slate-100 text-slate-500' }
          },
          { key: 'count', header: 'Count', align: 'right', kind: 'mono', classFn: () => 'font-bold' },
          { key: 'freqPerDay', header: 'Freq/Day', align: 'right', kind: 'mono', format: r => `${(r as AlarmDefinition).freqPerDay.toFixed(2)}/day` },
          { key: 'lastSeen', header: 'Last Seen', kind: 'mono', format: r => (r as AlarmDefinition).lastSeen.slice(0, 10), classFn: () => 'text-slate-400' },
          { key: 'recipe', header: 'Recipe', kind: 'mono', classFn: () => 'text-slate-500' }
        ],
        rows,
        trackKey: 'alarmId',
        selectedKey: this.store.inspectedAlarmId(),
        onRowClick: row => this.store.inspectedAlarmId.set((row as AlarmDefinition).alarmId)
      },
      {
        id: 'alarm-info', type: 'component', colSpan: 2, frameless: true,
        name: 'alarm-info-panel',
        inputs: { viewEvents: (alarmId: string) => this.openEvents(alarmId) }
      }
    ];
  });

  ngOnChanges(): void {
    if (this.fleetId && this.toolId) this.store.loadTool(this.fleetId, this.toolId);
  }

  openEvents(alarmId: string): void {
    this.router.navigate(['/alarm-explorer/fleet', this.fleetId, 'tool', this.toolId, 'alarm', alarmId]);
  }
}
