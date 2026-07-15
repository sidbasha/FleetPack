import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { UptimeStore } from '../../core/state/uptime.store';
import { StateLegendComponent } from '../../shared/components/ui.components';
import { ToolState } from '../../core/models/models';

const STATE_BG: Record<string, string> = {
  'Production': 'bg-state-production',
  'Engineering': 'bg-state-engineering',
  'Standby': 'bg-state-standby',
  'Scheduled Downtime': 'bg-state-scheduled',
  'Unscheduled Downtime': 'bg-state-unscheduled',
  'Gap': 'bg-state-gap'
};

@Component({
  selector: 'fam-state-heatmap',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, StateLegendComponent],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
      <div>
        <h3 class="text-sm font-semibold text-slate-800">24-Hour State Heatmap</h3>
        <p class="text-[11px] text-slate-400">Each cell = dominant state · X = days, Y = hour of day · most recent 14 days</p>
      </div>
      <div class="flex items-center gap-3 text-[11px] text-slate-500">
        @for (t of totals(); track t.label) {
          <span class="chip"><i class="chip-dot" [ngClass]="t.cls"></i>{{ t.label }} <b class="text-slate-700">{{ t.value }}</b></span>
        }
      </div>
    </div>

    @if (heatmap().length) {
      <div class="overflow-x-auto">
        <div class="inline-grid gap-1"
             [style.grid-template-columns]="'56px repeat(' + heatmap().length + ', minmax(48px, 1fr))'">
          <!-- header row -->
          <div></div>
          @for (day of heatmap(); track day.date) {
            <div class="text-[10px] font-semibold text-slate-400 text-center pb-1">{{ day.date }}</div>
          }
          <!-- hour rows -->
          @for (h of hourRows; track h; let r = $index) {
            <div class="text-[10px] font-mono text-slate-400 pr-2 text-right leading-6">{{ h }}</div>
            @for (day of heatmap(); track day.date) {
              <div class="h-6 rounded-[3px] cursor-default transition-transform hover:scale-[1.06] hover:ring-2 hover:ring-indigo-300"
                   [ngClass]="bg(day.hours[r])"
                   [title]="day.date + ' ' + h + ' — ' + day.hours[r]"></div>
            }
          }
        </div>
      </div>
      <div class="mt-4"><fam-state-legend withGap /></div>
    } @else {
      <p class="text-xs text-slate-400">No heatmap data for the selected window.</p>
    }
  `
})
export class StateHeatmapComponent {
  private store = inject(UptimeStore);
  hourRows = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

  heatmap = computed(() => this.store.availability()?.heatmap ?? []);

  totals = computed(() => {
    const t = this.store.availability()?.stateTotals;
    if (!t) return [];
    return [
      { label: 'Production', value: t.production, cls: 'bg-state-production' },
      { label: 'Engineering', value: t.engineering, cls: 'bg-state-engineering' },
      { label: 'Standby', value: t.standby, cls: 'bg-state-standby' },
      { label: 'Scheduled DT', value: t.scheduledDT, cls: 'bg-state-scheduled' },
      { label: 'Unscheduled DT', value: t.unscheduledDT, cls: 'bg-state-unscheduled' }
    ];
  });

  bg(state: ToolState): string {
    return STATE_BG[state] ?? 'bg-state-gap';
  }
}
