import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/** Six-state Machine State color scale (see Foundations → Color). These are
 *  generic, presentational versions for the base library — the live app
 *  screens (`state-heatmap.component.ts`, `activity-gantt.component.ts` in
 *  `features/uptime-availability`) read from real stores and aren't replaced
 *  by these. */
export type BaseMachineState = 'production' | 'engineering' | 'standby' | 'scheduled-dt' | 'unscheduled-dt' | 'gap';

export const BASE_MACHINE_STATE_META: Record<BaseMachineState, { label: string; colorVar: string }> = {
  production: { label: 'Production', colorVar: 'var(--color-state-production)' },
  engineering: { label: 'Engineering', colorVar: 'var(--color-state-engineering)' },
  standby: { label: 'Standby', colorVar: 'var(--color-state-standby)' },
  'scheduled-dt': { label: 'Scheduled DT', colorVar: 'var(--color-state-scheduled)' },
  'unscheduled-dt': { label: 'Unscheduled DT', colorVar: 'var(--color-state-unscheduled)' },
  gap: { label: 'Gap / no data', colorVar: 'var(--color-state-gap)' }
};

const HATCH = 'repeating-linear-gradient(45deg, var(--color-neutral-300) 0 2px, transparent 2px 6px)';

export interface BaseHeatmapCell { col: string; state: BaseMachineState; }
export interface BaseHeatmapRow { label: string; cells: BaseHeatmapCell[]; }

/** Day × hour grid colored by dominant machine state — spots patterns a line chart would average away. */
@Component({
  selector: 'base-state-heatmap',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overflow-x-auto">
      <table class="border-collapse" style="min-width: 480px;">
        <thead>
          <tr>
            <th class="w-16"></th>
            @for (c of columns(); track c) {
              <th class="text-[9px] font-normal text-ink-500 pb-1" style="font-family:var(--font-mono);">{{ c }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track row.label) {
            <tr>
              <td class="text-[10px] text-ink-600 pr-2 text-right whitespace-nowrap">{{ row.label }}</td>
              @for (cell of row.cells; track cell.col; let i = $index) {
                <td class="p-0">
                  <button type="button"
                          class="block w-full outline-none focus-visible:ring-2 focus-visible:ring-action"
                          style="height: 14px; width: 20px;"
                          [style.background]="cell.state === 'gap' ? hatch : meta(cell.state).colorVar"
                          [style.opacity]="hover() && hover()!.row === row.label && hover()!.col === cell.col ? 1 : 0.92"
                          [attr.title]="row.label + ' · ' + cell.col + ' · ' + meta(cell.state).label"
                          (mouseenter)="hover.set({ row: row.label, col: cell.col })"
                          (mouseleave)="hover.set(null)">
                  </button>
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
    <div class="flex flex-wrap items-center gap-x-sp-4 gap-y-1 mt-sp-3 text-[11px] text-ink-600">
      @for (s of legendStates(); track s) {
        <span class="flex items-center gap-1.5">
          <i class="inline-block w-2.5 h-2.5 rounded-r-xs" [style.background]="s === 'gap' ? hatch : meta(s).colorVar"></i>
          {{ meta(s).label }}
        </span>
      }
    </div>
  `
})
export class BaseStateHeatmapComponent {
  readonly rows = input.required<BaseHeatmapRow[]>();
  readonly columns = input.required<string[]>();
  /** Which states to show in the legend; defaults to all six. */
  readonly legendStates = input<BaseMachineState[]>(['production', 'engineering', 'standby', 'scheduled-dt', 'unscheduled-dt', 'gap']);

  protected readonly hatch = HATCH;
  protected readonly hover = signal<{ row: string; col: string } | null>(null);

  meta(s: BaseMachineState) { return BASE_MACHINE_STATE_META[s]; }
}

export interface BaseGanttSegment { startHour: number; endHour: number; state: BaseMachineState; }
export interface BaseGanttRow { label: string; segments: BaseGanttSegment[]; badge?: string; }

/** 24h per-row state segments — the detail view a heatmap cell expands into. */
@Component({
  selector: 'base-gantt-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-sp-2">
      @for (row of rows(); track row.label) {
        <div class="flex items-center gap-sp-3">
          <span class="w-16 shrink-0 text-[11px] font-semibold text-ink-700">{{ row.label }}</span>
          <div class="relative flex-1 h-5 rounded-r-xs overflow-hidden bg-neutral-100">
            @for (seg of row.segments; track $index) {
              <button type="button"
                      class="absolute top-0 h-full outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:z-10"
                      [style.left.%]="(seg.startHour / 24) * 100"
                      [style.width.%]="((seg.endHour - seg.startHour) / 24) * 100"
                      [style.background]="seg.state === 'gap' ? hatch : meta(seg.state).colorVar"
                      [attr.title]="row.label + ' · ' + fmt(seg.startHour) + '–' + fmt(seg.endHour) + ' · ' + meta(seg.state).label">
              </button>
            }
          </div>
          @if (row.badge) {
            <span class="w-12 shrink-0 text-right text-[11px] font-semibold tabular-nums" style="font-family:var(--font-mono);"
                  [class]="badgeTone(row.badge)">{{ row.badge }}</span>
          }
        </div>
      }
      <div class="flex items-center gap-sp-3 mt-1">
        <span class="w-16 shrink-0"></span>
        <div class="relative flex-1 flex justify-between text-[9px] text-ink-500" style="font-family:var(--font-mono);">
          @for (t of ['00:00','04:00','08:00','12:00','16:00','20:00','24:00']; track t) { <span>{{ t }}</span> }
        </div>
        <span class="w-12 shrink-0"></span>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-x-sp-4 gap-y-1 mt-sp-3 text-[11px] text-ink-600">
      @for (s of legendStates(); track s) {
        <span class="flex items-center gap-1.5">
          <i class="inline-block w-2.5 h-2.5 rounded-r-xs" [style.background]="s === 'gap' ? hatch : meta(s).colorVar"></i>
          {{ meta(s).label }}
        </span>
      }
    </div>
  `
})
export class BaseGanttTimelineComponent {
  readonly rows = input.required<BaseGanttRow[]>();
  readonly legendStates = input<BaseMachineState[]>(['production', 'standby', 'scheduled-dt', 'unscheduled-dt']);

  protected readonly hatch = HATCH;

  meta(s: BaseMachineState) { return BASE_MACHINE_STATE_META[s]; }

  fmt(h: number): string {
    const hh = Math.floor(h).toString().padStart(2, '0');
    const mm = Math.round((h % 1) * 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  /** Availability badges read as success/warning/error, same as a KPI trend. */
  badgeTone(badge: string): string {
    const pct = parseFloat(badge);
    if (Number.isNaN(pct)) return 'text-ink-600';
    if (pct >= 95) return 'text-success';
    if (pct >= 80) return 'text-warning';
    return 'text-error';
  }
}
