import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { UptimeStore } from '../../core/state/uptime.store';
import { DynamicWidgetComponent } from '../../shared/dynamic/dynamic-page.component';
import { TableWidget } from '../../shared/dynamic/widget.model';
import { SegmentActivity } from '../../core/models/models';
import { downloadCsv } from '../../shared/utils/csv.util';
import { formatSegmentDuration, formatSegmentTimelineTick } from '../../core/state/segment-derivation.util';
import { BaseChartFrameComponent, BaseGanttTimelineComponent } from '../../base';

function isFailed(row: SegmentActivity): boolean {
  return String(row.params['Error Code'] ?? '0x0') !== '0x0';
}

/**
 * Segment Activities tab — task/recipe-level detail from getSegmentActivities,
 * correlated with the Production windows behind the Gantt/Event Details tabs.
 * Registered as the 4th routed tab on the Availability page.
 *
 * Offers both a table (grouped by day, paginated) and a swimlane timeline
 * (one row per recipe step, drag-to-zoom on time, click a row to isolate it) —
 * the timeline is what scales to a large number of steps/occurrences.
 */
@Component({
  selector: 'fam-segment-activities',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DynamicWidgetComponent, BaseChartFrameComponent, BaseGanttTimelineComponent],
  template: `
    <div class="flex items-center justify-between mb-3">
      <p class="text-[11px] text-slate-400">{{ total() }} task activities · grouped by day, most recent first</p>
      <button class="btn-ghost" (click)="exportCsv()">↓ Download CSV</button>
    </div>
    <base-chart-frame [(tableView)]="tableView" title="Segment Activities" [subtitle]="total() + ' task activities'">
      <div chart>
        @if (timeline().rows.length) {
          <base-gantt-timeline
            [rows]="timeline().rows"
            [domainStart]="timeline().domainStart"
            [totalHours]="timeline().domainSpan"
            [axisTickFormat]="tickFormat"
            [durationFormat]="durationFormat"
            [legendStates]="['production', 'unscheduled-dt']" />
        } @else {
          <p class="text-[11px] text-slate-400 py-6 text-center">No task activities in range.</p>
        }
      </div>
      <div table>
        <fam-dynamic-widget [widget]="tableWidget()" />
      </div>
    </base-chart-frame>
  `
})
export class SegmentActivitiesComponent {
  store = inject(UptimeStore);

  readonly tableView = signal(false);
  readonly timeline = this.store.segmentTimeline;
  protected readonly tickFormat = formatSegmentTimelineTick;
  protected readonly durationFormat = formatSegmentDuration;

  total = computed(() => this.store.segmentActivities().length);

  readonly tableWidget = computed<TableWidget<SegmentActivity>>(() => ({
    id: 'segment-activities', type: 'table', frameless: true,
    columns: [
      { key: 'eventStart', header: 'Time', kind: 'mono', format: r => new Date(r.eventStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
      { key: 'duration', header: 'Duration', align: 'right', kind: 'mono', format: r => r.duration.toFixed(2) },
      { key: 'SegmentName', header: 'Segment', classFn: () => 'font-medium' },
      { key: 'recipeId', header: 'Recipe ID', kind: 'mono', format: r => String(r.params['Recipe ID'] ?? '—'), classFn: () => 'text-slate-400 text-[11px]' },
      {
        key: 'result', header: 'Result', kind: 'badge',
        value: r => isFailed(r) ? 'Fail' : 'Pass',
        format: r => isFailed(r) ? 'Fail' : 'Pass',
        badgeClassMap: { Pass: 'bg-emerald-50 text-emerald-600', Fail: 'bg-red-50 text-red-500' }
      },
      { key: 'wafers', header: 'Wafers P/F', align: 'right', kind: 'mono', format: r => `${r.params['Wafers Passed'] ?? 0}/${r.params['Wafers Failed'] ?? 0}` },
      {
        key: 'detail', header: 'Detail',
        format: r => isFailed(r) ? `${r.params['Error Code']} · ${r.params['Error Code Description']}` : '',
        classFn: () => 'text-red-500 text-[11px]'
      }
    ],
    rows: this.store.pagedSegmentActivities(),
    trackKey: 'eventStart',
    groupBy: r => new Date(r.eventStart).toISOString().slice(0, 10),
    pagination: {
      page: this.store.segmentActivitiesPage(),
      pageCount: this.store.segmentActivitiesPageCount(),
      onPrev: () => this.store.prevSegmentActivitiesPage(),
      onNext: () => this.store.nextSegmentActivitiesPage()
    }
  }));

  exportCsv(): void {
    const all = this.store.segmentActivities();
    downloadCsv('segment-activities.csv', [
      ['Time', 'DurationHrs', 'SegmentType', 'SegmentName', 'RecipeID', 'ErrorCode', 'WafersPassed', 'WafersFailed'],
      ...all.map(a => [
        a.eventStart, a.duration, a.segmentType, a.SegmentName,
        String(a.params['Recipe ID'] ?? ''), String(a.params['Error Code'] ?? ''),
        String(a.params['Wafers Passed'] ?? ''), String(a.params['Wafers Failed'] ?? '')
      ])
    ]);
  }
}
