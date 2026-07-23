import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { UptimeStore } from '../../core/state/uptime.store';
import { DynamicWidgetComponent } from '../../shared/dynamic/dynamic-page.component';
import { TableWidget } from '../../shared/dynamic/widget.model';
import { ToolEvent } from '../../core/models/models';

const STATE_BAR_CLASS: Record<string, string> = {
  'Production': 'bg-state-production', 'Engineering': 'bg-state-engineering', 'Standby': 'bg-state-standby',
  'Scheduled Downtime': 'bg-state-scheduled', 'Unscheduled Downtime': 'bg-state-unscheduled'
};

const STATE_BADGE_CLASS: Record<string, string> = {
  'Production': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Engineering': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Standby': 'bg-violet-50 text-violet-700 border border-violet-200',
  'Scheduled Downtime': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Unscheduled Downtime': 'bg-red-50 text-red-700 border border-red-200'
};

/**
 * Event Details tab — a single dynamic TableWidget with day grouping,
 * pagination from the store's pager, and a group action.
 * Registered in the widget registry as 'event-details'.
 */
@Component({
  selector: 'fam-event-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DynamicWidgetComponent],
  template: `
    <fam-dynamic-widget [widget]="tableWidget()" />
  `
})
export class EventDetailsComponent {
  store = inject(UptimeStore);

  total = computed(() => this.store.events().length);

  readonly tableWidget = computed<TableWidget<ToolEvent>>(() => ({
    id: 'tool-events', type: 'table', frameless: true,
    groupHeaderStyle: 'light', groupCountLabel: 'events',
    footer: `${this.total()} of ${this.total()} records`,
    columns: [
      { key: 'startTime', header: 'Start Time', kind: 'mono', sortable: true },
      { key: 'endTime', header: 'End Time', kind: 'mono', sortable: true },
      {
        key: 'durationHrs', header: 'Duration', align: 'right', kind: 'progress', width: '160px',
        format: r => r.durationHrs.toFixed(2), progressMax: 24,
        barClass: r => STATE_BAR_CLASS[r.state] ?? 'bg-slate-400'
      },
      { key: 'source', header: 'Source', classFn: () => 'text-slate-500' },
      {
        key: 'state', header: 'State', kind: 'badge',
        format: r => `• ${r.state}`,
        badgeClassMap: STATE_BADGE_CLASS
      },
      {
        key: 'details', header: 'Details',
        classFn: r => r.details === 'JobStatus: Fail' ? 'text-red-500 font-semibold' : 'text-slate-400'
      },
      {
        key: 'actions', header: 'Actions', align: 'right', kind: 'row-actions',
        rowActions: [
          { icon: '🗑', title: 'Delete event', run: r => console.info(`[FAM] Delete event ${r.id}`) },
          { icon: '✎', title: 'Edit event', run: r => console.info(`[FAM] Edit event ${r.id}`) }
        ]
      }
    ],
    rows: this.store.pagedEvents(),
    trackKey: 'id',
    groupBy: r => r.date,
    groupAction: { label: '+ Add Event', run: date => console.info(`[FAM] Add Event for ${date}`) },
    pagination: {
      page: this.store.eventPage(),
      pageCount: this.store.eventPageCount(),
      onPrev: () => this.store.prevEventPage(),
      onNext: () => this.store.nextEventPage()
    }
  }));
}
