import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { UptimeStore } from '../../core/state/uptime.store';
import { ToolState } from '../../core/models/models';
import { toggleInSet } from '../../base';

const STATE_BG: Record<string, string> = {
  'Production': 'bg-state-production',
  'Engineering': 'bg-state-engineering',
  'Standby': 'bg-state-standby',
  'Scheduled Downtime': 'bg-state-scheduled',
  'Unscheduled Downtime': 'bg-state-unscheduled',
  'Gap': 'bg-state-gap'
};

const FILTER_STATES: { state: ToolState; label: string; dot: string }[] = [
  { state: 'Production', label: 'Production', dot: 'bg-state-production' },
  { state: 'Engineering', label: 'Engineering', dot: 'bg-state-engineering' },
  { state: 'Standby', label: 'Standby', dot: 'bg-state-standby' },
  { state: 'Scheduled Downtime', label: 'Scheduled DT', dot: 'bg-state-scheduled' },
  { state: 'Unscheduled Downtime', label: 'Unscheduled DT', dot: 'bg-state-unscheduled' },
  { state: 'Gap', label: 'Gap', dot: 'bg-state-gap' }
];

@Component({
  selector: 'fam-state-heatmap',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <div class="mb-3">
      <h3 class="text-sm font-semibold text-slate-800">24-Hour State Heatmap</h3>
      <p class="text-[11px] text-slate-400">Each cell = dominant state · X = days, Y = hour of day · most recent 14 days</p>
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
                   [ngClass]="bg(day.hours[r])" [style.opacity]="isActive(day.hours[r]) ? 1 : 0.2"
                   [title]="day.date + ' ' + h + ' — ' + day.hours[r]"></div>
            }
          }
        </div>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-1.5">
        @for (st of filterStates; track st.state) {
          <button type="button" class="chip-toggle" [class]="isActive(st.state) ? 'chip-toggle-active' : 'chip-toggle-inactive'"
                  [attr.title]="'Click to toggle ' + st.label" (click)="toggleFilter(st.state)">
            <i class="chip-dot" [ngClass]="st.dot"></i>{{ st.label }}
          </button>
        }
        <button type="button" class="text-[11px] font-semibold ml-1" [class]="isFiltered() ? 'text-action cursor-pointer' : 'text-slate-300 cursor-default'"
                [disabled]="!isFiltered()" (click)="resetFilter()">
          Reset Filter
        </button>
      </div>
    } @else {
      <p class="text-xs text-slate-400">No heatmap data for the selected window.</p>
    }
  `
})
export class StateHeatmapComponent {
  private store = inject(UptimeStore);
  hourRows = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
  readonly filterStates = FILTER_STATES;

  heatmap = computed(() => this.store.availability()?.heatmap ?? []);
  /** Click legend states to select which show (any number at once, dims every other state's cells); Reset Filter restores. */
  readonly filteredStates = signal<ReadonlySet<ToolState>>(new Set());
  readonly isFiltered = computed(() => this.filteredStates().size > 0);

  bg(state: ToolState): string {
    return STATE_BG[state] ?? 'bg-state-gap';
  }

  isActive(state: string): boolean {
    const f = this.filteredStates();
    return f.size === 0 || f.has(state as ToolState);
  }
  toggleFilter(state: ToolState): void {
    this.filteredStates.update(current => toggleInSet(current, state));
  }
  resetFilter(): void {
    this.filteredStates.set(new Set());
  }
}
