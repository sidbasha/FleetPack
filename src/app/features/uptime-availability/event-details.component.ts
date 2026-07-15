import { Component, computed, inject } from '@angular/core';
import { UptimeStore } from '../../core/state/uptime.store';
import { DynamicWidgetComponent } from '../../shared/dynamic/dynamic-page.component';
import { TableWidget } from '../../shared/dynamic/widget.model';
import { ToolEvent } from '../../core/models/models';
import { downloadCsv } from '../../shared/utils/csv.util';

/**
 * Event Details tab — a single dynamic TableWidget with day grouping,
 * pagination from the store's pager, and a group action.
 * Registered in the widget registry as 'event-details'.
 */
@Component({
  selector: 'fam-event-details',
  standalone: true,
  imports: [DynamicWidgetComponent],
  template: `
    <div class="flex items-center justify-between mb-3">
      <p class="text-[11px] text-slate-400">{{ total() }} records · grouped by day, most recent first</p>
      <button class="btn-ghost" (click)="exportCsv()">↓ Download CSV</button>
    </div>
    <fam-dynamic-widget [widget]="tableWidget()" />
  `
})
export class EventDetailsComponent {
  store = inject(UptimeStore);

  total = computed(() => this.store.events().length);

  readonly tableWidget = computed<TableWidget<ToolEvent>>(() => ({
    id: 'tool-events', type: 'table', frameless: true,
    columns: [
      { key: 'startTime', header: 'Start Time', kind: 'mono' },
      { key: 'endTime', header: 'End Time', kind: 'mono' },
      { key: 'durationHrs', header: 'Duration', align: 'right', kind: 'mono', format: r => r.durationHrs.toFixed(2) },
      {
        key: 'source', header: 'Source', kind: 'badge',
        badgeClassMap: { MES: 'bg-slate-100 text-slate-500', E10: 'bg-slate-100 text-slate-500', Auto: 'bg-slate-100 text-slate-500', Manual: 'bg-slate-100 text-slate-500' }
      },
      {
        key: 'state', header: 'State', kind: 'dot',
        dotClassMap: {
          'Production': 'bg-state-production', 'Engineering': 'bg-state-engineering', 'Standby': 'bg-state-standby',
          'Scheduled Downtime': 'bg-state-scheduled', 'Unscheduled Downtime': 'bg-state-unscheduled'
        }
      },
      {
        key: 'details', header: 'Details',
        classFn: r => r.details === 'JobStatus: Fail' ? 'text-red-500 font-semibold' : 'text-slate-400'
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

  exportCsv(): void {
    const all = this.store.events();
    downloadCsv('tool-events.csv', [
      ['Date', 'Start', 'End', 'DurationHrs', 'Source', 'State', 'Details'],
      ...all.map(e => [e.date, e.startTime, e.endTime, e.durationHrs, e.source, e.state, e.details])
    ]);
  }
}
