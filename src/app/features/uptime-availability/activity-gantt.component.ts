import { Component, inject, signal } from '@angular/core';
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
  imports: [DecimalPipe, NgClass, StateLegendComponent],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div class="flex items-end gap-6">
        <div>
          <span class="kpi-value text-indigo-600">{{ summary().avgProductionPct | number:'1.1-1' }}%</span>
          <span class="kpi-label block mt-1">Avg Production</span>
        </div>
        <div>
          <span class="kpi-value">{{ summary().totalDowntimeHrs | number:'1.1-1' }}</span>
          <span class="kpi-label block mt-1">Total Downtime (hrs)</span>
        </div>
        <div>
          <span class="kpi-value">{{ gantt().length }}</span>
          <span class="kpi-label block mt-1">Days shown</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="tab-btn" [ngClass]="dayShift() ? 'tab-btn-active' : ''" (click)="dayShift.set(!dayShift())">Day Shift</button>
        <div class="flex items-center gap-1 text-xs text-slate-500">
          <button class="btn-ghost" (click)="prev()">‹</button>
          <span class="font-medium">05-03 → 05-09 ({{ page() }}/13)</span>
          <button class="btn-ghost" (click)="next()">›</button>
        </div>
      </div>
    </div>

    <!-- Hour scale -->
    <div class="flex ml-[150px] mr-[110px] text-[10px] font-mono text-slate-400 mb-1"
         [class.opacity-60]="dayShift()">
      @for (h of hourTicks; track h) { <span class="flex-1">{{ h }}</span> }
    </div>

    <div class="space-y-2.5">
      @for (day of gantt(); track day.date) {
        <div class="flex items-stretch gap-0">
          <!-- Day label -->
          <div class="w-[70px] shrink-0 text-right pr-3">
            <p class="text-xs font-bold text-slate-700">{{ day.day }}</p>
            <p class="text-[10px] text-slate-400 font-mono">{{ day.date }} 2026</p>
          </div>
          <!-- Sys / Tool rows -->
          <div class="flex-1 min-w-0 space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-[72px] shrink-0 text-[10px] font-semibold text-slate-400">Sys E10</span>
              <div class="relative flex-1 h-5 rounded-sm bg-slate-100 overflow-hidden" [class.shift-mask]="dayShift()">
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
              <span class="w-[72px] shrink-0 text-[10px] font-semibold text-slate-400">Tool E10</span>
              <div class="relative flex-1 h-5 rounded-sm bg-slate-100 overflow-hidden" [class.shift-mask]="dayShift()">
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
            <p class="text-xs font-bold" [ngClass]="day.availabilityPct >= 95 ? 'text-emerald-600' : day.availabilityPct >= 80 ? 'text-slate-700' : 'text-red-500'">
              {{ day.availabilityPct }}% avail.
            </p>
            <p class="text-[10px] text-slate-400">{{ day.downtimeHrs | number:'1.1-1' }} h DT</p>
          </div>
        </div>
      }
    </div>

    <div class="mt-4 flex items-center justify-between">
      <fam-state-legend />
      <span class="text-[11px] text-slate-400">1 / 13 pages shown</span>
    </div>
  `,
  styles: [`
    .shift-mask::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(90deg,
        rgba(15,23,42,.45) 0%, rgba(15,23,42,.45) 29%,
        transparent 29%, transparent 79%,
        rgba(15,23,42,.45) 79%, rgba(15,23,42,.45) 100%);
      pointer-events: none;
    }
  `]
})
export class ActivityGanttComponent {
  private store = inject(UptimeStore);
  hourTicks = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];

  page = signal(1);
  dayShift = signal(false);

  gantt = this.store.gantt;
  summary = this.store.ganttSummary;

  bg(s: GanttSegment): string {
    return STATE_BG[s.state] ?? 'bg-state-gap';
  }
  tooltip(s: GanttSegment): string {
    const base = `${s.state} · ${(s.endHour - s.startHour).toFixed(1)}h`;
    return s.detail ? `${base} · ${s.detail}` : base;
  }
  prev(): void { this.page.update(p => Math.max(1, p - 1)); }
  next(): void { this.page.update(p => Math.min(13, p + 1)); }
}
