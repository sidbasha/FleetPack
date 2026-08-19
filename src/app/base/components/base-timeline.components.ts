import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChildren
} from '@angular/core';

export type BaseMachineState =
  | 'production' | 'engineering' | 'standby'
  | 'scheduled-dt' | 'unscheduled-dt' | 'non-scheduled' | 'gap';

export type BaseStatePattern = 'solid' | 'hatch-45' | 'hatch-135' | 'dotted';

export const BASE_MACHINE_STATE_META: Record<BaseMachineState, { label: string; colorVar: string; icon: string; pattern: BaseStatePattern }> = {
  production: { label: 'Production', colorVar: 'var(--color-state-production)', icon: 'check_circle', pattern: 'solid' },
  engineering: { label: 'Engineering', colorVar: 'var(--color-state-engineering)', icon: 'build', pattern: 'solid' },
  standby: { label: 'Standby', colorVar: 'var(--color-state-standby)', icon: 'pause_circle', pattern: 'solid' },
  'scheduled-dt': { label: 'Scheduled DT', colorVar: 'var(--color-state-scheduled)', icon: 'event', pattern: 'hatch-45' },
  'unscheduled-dt': { label: 'Unscheduled DT', colorVar: 'var(--color-state-unscheduled)', icon: 'warning', pattern: 'hatch-135' },
  'non-scheduled': { label: 'Non-scheduled', colorVar: 'var(--color-state-non-scheduled)', icon: 'bedtime', pattern: 'dotted' },
  gap: { label: 'Gap / no data', colorVar: 'var(--color-state-gap)', icon: 'help', pattern: 'dotted' }
};

function statePattern(colorVar: string, pattern: BaseStatePattern): string {
  switch (pattern) {
    case 'hatch-45':
      return `repeating-linear-gradient(45deg, ${colorVar} 0 3px, color-mix(in srgb, ${colorVar} 35%, white) 3px 6px)`;
    case 'hatch-135':
      return `repeating-linear-gradient(135deg, ${colorVar} 0 3px, color-mix(in srgb, ${colorVar} 35%, white) 3px 6px)`;
    case 'dotted':
      return `repeating-linear-gradient(45deg, ${colorVar} 0 2px, transparent 2px 6px)`;
    default:
      return colorVar;
  }
}

export function stateBackground(s: BaseMachineState): string {
  const m = BASE_MACHINE_STATE_META[s];
  return statePattern(m.colorVar, m.pattern);
}

export interface BaseHeatmapCell { col: string; state: BaseMachineState; }
export interface BaseHeatmapRow { label: string; cells: BaseHeatmapCell[]; }

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
                          [style.background]="bg(cell.state)"
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
          <i class="inline-block w-2.5 h-2.5 rounded-r-xs" [style.background]="bg(s)"></i>
          <span class="icon-outline" style="font-size:12px;" [style.color]="meta(s).colorVar" aria-hidden="true">{{ meta(s).icon }}</span>
          {{ meta(s).label }}
        </span>
      }
    </div>
  `
})
export class BaseStateHeatmapComponent {
  readonly rows = input.required<BaseHeatmapRow[]>();
  readonly columns = input.required<string[]>();
  readonly legendStates = input<BaseMachineState[]>(['production', 'engineering', 'standby', 'scheduled-dt', 'unscheduled-dt', 'non-scheduled', 'gap']);

  protected readonly hover = signal<{ row: string; col: string } | null>(null);

  meta(s: BaseMachineState) { return BASE_MACHINE_STATE_META[s]; }
  bg(s: BaseMachineState): string { return stateBackground(s); }
}

export interface BaseGanttSegment {
  startHour: number;
  endHour: number;
  state: BaseMachineState;
  label?: string;
}
export interface BaseGanttRow {
  label: string;
  segments: BaseGanttSegment[];
  badge?: string;
  noData?: boolean;
}

const STATE_PRIORITY: Record<BaseMachineState, number> = {
  'unscheduled-dt': 6,
  'scheduled-dt': 5,
  engineering: 4,
  'non-scheduled': 3,
  standby: 2,
  production: 1,
  gap: 0
};

function resolveStateColor(el: Element, colorVar: string): string {
  const match = /^var\((--[\w-]+)\)$/.exec(colorVar);
  const propName = match ? match[1] : colorVar;
  const value = getComputedStyle(el).getPropertyValue(propName).trim();
  return value || '#94a3b8';
}

function buildPatternTile(pattern: BaseStatePattern, resolved: string): HTMLCanvasElement {
  const size = 8;
  const tile = document.createElement('canvas');
  tile.width = size;
  tile.height = size;
  const ctx = tile.getContext('2d')!;
  ctx.fillStyle = resolved;
  ctx.fillRect(0, 0, size, size);
  if (pattern === 'solid') return tile;

  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = pattern === 'dotted' ? 1.5 : 3;
  const step = pattern === 'dotted' ? 4 : 6;
  const flip = pattern === 'hatch-135';
  ctx.beginPath();
  for (let x = -size; x <= size * 2; x += step) {
    ctx.moveTo(x, flip ? size : 0);
    ctx.lineTo(x + size, flip ? 0 : size);
  }
  ctx.stroke();
  return tile;
}

@Component({
  selector: 'base-gantt-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative flex flex-col gap-sp-2">
      @for (row of rows(); track row.label) {
        <div class="flex items-center gap-sp-3">
          <span class="w-16 shrink-0 text-[11px] font-semibold text-ink-700 truncate">{{ row.label }}</span>
          <div class="relative flex-1 h-5 rounded-r-xs overflow-hidden bg-neutral-100">
            <canvas #rowCanvas class="absolute inset-0 block w-full h-full"
                    role="img" [attr.aria-label]="row.label + ' timeline, ' + row.segments.length + ' state change(s)'"
                    (mousemove)="onCanvasMove($event, rowCanvas, row)" (mouseleave)="onCanvasLeave()"></canvas>
            @if (row.noData) {
              <div class="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-neutral-400 bg-neutral-200">
                No telemetry
              </div>
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
          @for (t of axisTicks(); track $index) { <span>{{ t }}</span> }
        </div>
        <span class="w-12 shrink-0"></span>
      </div>
      @if (hover(); as h) {
        <div class="absolute pointer-events-none z-10 bg-ink-900 text-neutral-0 text-[11px] font-semibold rounded-r-xs px-sp-2 py-1 mono-data whitespace-nowrap"
             [style.left.px]="h.left" [style.top.px]="h.top" style="transform: translate(-50%, -100%);">
          {{ h.seg.label || meta(h.seg.state).label }} · {{ durationLabel(h.seg.endHour - h.seg.startHour) }}
        </div>
      }
    </div>
    <div class="flex flex-wrap items-center gap-x-sp-4 gap-y-1 mt-sp-3 text-[11px] text-ink-600">
      @for (s of legendStates(); track s) {
        <span class="flex items-center gap-1.5">
          <i class="inline-block w-2.5 h-2.5 rounded-r-xs" [style.background]="bg(s)"></i>
          <span class="icon-outline" style="font-size:12px;" [style.color]="meta(s).colorVar" aria-hidden="true">{{ meta(s).icon }}</span>
          {{ meta(s).label }}
        </span>
      }
    </div>
  `
})
export class BaseGanttTimelineComponent implements OnDestroy {
  readonly rows = input.required<BaseGanttRow[]>();
  readonly legendStates = input<BaseMachineState[]>(['production', 'standby', 'scheduled-dt', 'unscheduled-dt']);
  readonly totalHours = input(24);

  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly canvasRefs = viewChildren<ElementRef<HTMLCanvasElement>>('rowCanvas');
  private readonly bucketsByRow = new Map<BaseGanttRow, (BaseGanttSegment | null)[]>();
  protected readonly hover = signal<{ seg: BaseGanttSegment; left: number; top: number } | null>(null);
  private readonly redrawTick = signal(0);
  private resizeObserver: ResizeObserver | null = null;
  private rafId: number | null = null;

  protected readonly axisTicks = computed(() => {
    const total = this.totalHours();
    const steps = 6;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const h = (total / steps) * i;
      return total <= 48 ? this.fmt(h % 24) : `${Math.round(h)}h`;
    });
  });

  constructor() {
    effect(() => {
      const canvases = this.canvasRefs();
      const rowsData = this.rows();
      const hours = this.totalHours();
      this.redrawTick();
      this.drawAll(canvases, rowsData, hours);
    });

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.scheduleRedraw());
      this.resizeObserver.observe(this.host.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  private scheduleRedraw(): void {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.redrawTick.update(n => n + 1);
    });
  }

  private drawAll(canvasRefs: readonly ElementRef<HTMLCanvasElement>[], rowsData: BaseGanttRow[], totalHours: number): void {
    this.bucketsByRow.clear();
    if (!canvasRefs.length) return;
    const tiles = this.buildTiles();
    canvasRefs.forEach((ref, i) => {
      const row = rowsData[i];
      if (!row) return;
      const buckets = this.drawRow(ref.nativeElement, row, totalHours, tiles);
      this.bucketsByRow.set(row, buckets);
    });
  }

  private buildTiles(): Map<BaseMachineState, HTMLCanvasElement> {
    const tiles = new Map<BaseMachineState, HTMLCanvasElement>();
    const el = this.host.nativeElement;
    for (const state of Object.keys(BASE_MACHINE_STATE_META) as BaseMachineState[]) {
      const meta = BASE_MACHINE_STATE_META[state];
      tiles.set(state, buildPatternTile(meta.pattern, resolveStateColor(el, meta.colorVar)));
    }
    return tiles;
  }

  private drawRow(
    canvas: HTMLCanvasElement,
    row: BaseGanttRow,
    totalHours: number,
    tiles: Map<BaseMachineState, HTMLCanvasElement>
  ): (BaseGanttSegment | null)[] {
    const cssWidth = Math.max(1, Math.round(canvas.clientWidth));
    const cssHeight = Math.max(1, Math.round(canvas.clientHeight));
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const buckets: (BaseGanttSegment | null)[] = new Array(cssWidth).fill(null);
    if (!row.noData && totalHours > 0) {
      const pxPerHour = cssWidth / totalHours;
      for (const seg of row.segments) {
        const startPx = Math.max(0, Math.min(cssWidth - 1, Math.floor(seg.startHour * pxPerHour)));
        const endPx = Math.max(startPx + 1, Math.min(cssWidth, Math.ceil(seg.endHour * pxPerHour)));
        for (let px = startPx; px < endPx; px++) {
          const current = buckets[px];
          if (!current || STATE_PRIORITY[seg.state] >= STATE_PRIORITY[current.state]) buckets[px] = seg;
        }
      }

      let runStart = 0;
      for (let px = 1; px <= cssWidth; px++) {
        const sameRun = px < cssWidth && buckets[px]?.state === buckets[runStart]?.state;
        if (!sameRun) {
          const seg = buckets[runStart];
          if (seg) {
            const tile = tiles.get(seg.state);
            const pattern = tile ? ctx.createPattern(tile, 'repeat') : null;
            ctx.fillStyle = pattern ?? resolveStateColor(canvas, BASE_MACHINE_STATE_META[seg.state].colorVar);
            ctx.fillRect(runStart, 0, px - runStart, cssHeight);
          }
          runStart = px;
        }
      }
    }
    return buckets;
  }

  onCanvasMove(ev: MouseEvent, canvas: HTMLCanvasElement, row: BaseGanttRow): void {
    const buckets = this.bucketsByRow.get(row);
    if (!buckets || buckets.length === 0) { this.hover.set(null); return; }
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(buckets.length - 1, Math.max(0, Math.floor(ev.clientX - rect.left)));
    const seg = buckets[x];
    if (!seg) { this.hover.set(null); return; }
    const containerRect = this.host.nativeElement.getBoundingClientRect();
    this.hover.set({
      seg,
      left: rect.left - containerRect.left + x,
      top: rect.top - containerRect.top
    });
  }

  onCanvasLeave(): void {
    this.hover.set(null);
  }

  meta(s: BaseMachineState) { return BASE_MACHINE_STATE_META[s]; }
  bg(s: BaseMachineState): string { return stateBackground(s); }

  fmt(h: number): string {
    const hh = Math.floor(h).toString().padStart(2, '0');
    const mm = Math.round((h % 1) * 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  durationLabel(hours: number): string {
    return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
  }

  badgeTone(badge: string): string {
    const pct = parseFloat(badge);
    if (Number.isNaN(pct)) return 'text-ink-600';
    if (pct >= 95) return 'text-success';
    if (pct >= 80) return 'text-warning';
    return 'text-error';
  }
}
