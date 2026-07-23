import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { UptimeStore } from '../../core/state/uptime.store';
import { StateLegendComponent } from '../../shared/components/ui.components';
import { GanttSegment } from '../../core/models/models';

const STATE_BG: Record<string, string> = {
  'Production': 'bg-state-production',
  'Engineering': 'bg-state-engineering',
  'Standby': 'bg-state-standby',
  'Scheduled Downtime': 'bg-state-scheduled',
  'Unscheduled Downtime': 'bg-state-unscheduled'
};

@Component({
  selector: 'fam-activity-gantt',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, NgClass, StateLegendComponent],
  template: `
    <div class="flex flex-wrap items-start gap-x-12 gap-y-3 pb-4 mb-4 border-b border-slate-100">
      <div>
        <span class="kpi-value text-red-600">{{ summary().avgProductionPct | number:'1.1-1' }}%</span>
        <span class="kpi-label block mt-1">Avg Production</span>
      </div>
      <div>
        <span class="kpi-value text-red-600">{{ summary().totalDowntimeHrs | number:'1.1-1' }}</span>
        <span class="kpi-label block mt-1">Total Downtime (hrs)</span>
      </div>
      <div>
        <span class="kpi-value">{{ gantt().length }}</span>
        <span class="kpi-label block mt-1">Days Shown</span>
      </div>
      <div>
        <span class="kpi-value">{{ page() }} /13</span>
        <span class="kpi-label block mt-1">Pages Shown</span>
      </div>
    </div>

    <!-- Hour scale -->
    <div class="flex ml-[150px] mr-[110px] text-[10px] font-mono text-slate-400 mb-1">
      @for (h of hourTicks; track h) { <span class="flex-1">{{ h }}</span> }
    </div>

    <div class="space-y-2.5">
      @for (day of gantt(); track day.date) {
        <div class="flex items-stretch gap-0">
          <!-- Day label -->
          <div class="w-[70px] shrink-0 text-right pr-3">
            <p class="text-xs font-bold text-slate-700">{{ day.day }}</p>
            <p class="text-[10px] text-slate-400 font-mono">{{ day.date }}</p>
            <p class="text-[10px] text-slate-400 font-mono">2026</p>
          </div>
          <!-- Sys / Tool rows -->
          <div class="flex-1 min-w-0 space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-[72px] shrink-0 text-[10px] font-semibold uppercase text-slate-400">Sys E10</span>
              <div class="relative flex-1 h-5 rounded-sm bg-slate-100 overflow-hidden">
                @for (s of day.sysRow; track $index) {
                  <div class="absolute inset-y-0 group" [ngClass]="bg(s)"
                       [style.left.%]="s.startHour / 24 * 100"
                       [style.width.%]="(s.endHour - s.startHour) / 24 * 100"
                       [title]="tooltip(s)">
                    @if (s.label) { <span class="absolute inset-0 grid place-items-center text-[9px] font-semibold text-white/95">{{ s.label }}</span> }
                  </div>
                }
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-[72px] shrink-0 text-[10px] font-semibold uppercase text-slate-400">Tool E10</span>
              <div class="relative flex-1 h-5 rounded-sm bg-slate-100 overflow-hidden">
                @for (s of day.toolRow; track $index) {
                  <div class="absolute inset-y-0" [ngClass]="bg(s)"
                       [style.left.%]="s.startHour / 24 * 100"
                       [style.width.%]="(s.endHour - s.startHour) / 24 * 100"
                       [title]="tooltip(s)">
                    @if (s.label) { <span class="absolute inset-0 grid place-items-center text-[9px] font-semibold text-white/95">{{ s.label }}</span> }
                  </div>
                }
              </div>
            </div>
          </div>
          <!-- Availability -->
          <div class="w-[100px] shrink-0 pl-3 self-center">
            <p class="inline-block text-[11px] font-bold rounded-lg border px-2 py-0.5" [ngClass]="availClass(day.availabilityPct)">
              {{ day.availabilityPct }}% avail.
            </p>
            <p class="text-[10px] text-slate-400 mt-1">{{ day.downtimeHrs | number:'1.1-1' }} h DT</p>
          </div>
        </div>
      }
    </div>

    <div class="mt-4 flex items-center justify-between">
      <fam-state-legend withDayShift />
      <div class="flex items-center gap-1 text-xs text-slate-500">
        <button class="btn-ghost" (click)="prev()">‹</button>
        <span class="font-medium">05-03 → 05-09 ({{ page() }}/13)</span>
        <button class="btn-ghost" (click)="next()">›</button>
      </div>
    </div>
  `
})
export class ActivityGanttComponent {
  private store = inject(UptimeStore);
  hourTicks = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];

  page = signal(1);

  gantt = this.store.gantt;
  summary = this.store.ganttSummary;

  bg(s: GanttSegment): string {
    return STATE_BG[s.state] ?? 'bg-state-gap';
  }
  tooltip(s: GanttSegment): string {
    const base = `${s.state} · ${(s.endHour - s.startHour).toFixed(1)}h`;
    return s.detail ? `${base} · ${s.detail}` : base;
  }
  availClass(pct: number): string {
    if (pct < 75) return 'bg-red-50 text-red-700 border-red-200';
    if (pct < 95) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  prev(): void { this.page.update(p => Math.max(1, p - 1)); }
  next(): void { this.page.update(p => Math.min(13, p + 1)); }
}
