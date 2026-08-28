import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  ChartZoomWindow,
  FULL_ZOOM_WINDOW,
  BaseChartZoomBarComponent,
  fracX,
  isZoomedWindow,
  narrowZoomWindow,
  toggleInSet
} from './chart-zoom.util';

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
                          [style.opacity]="cellOpacity(row.label, cell)"
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
        <button type="button" class="flex items-center gap-1.5 bg-transparent border-0 p-0"
                [class.opacity-40]="!isStateActive(s)" [class.cursor-pointer]="filterable()"
                [attr.title]="filterable() ? 'Click to toggle ' + meta(s).label : meta(s).label"
                (click)="toggleStateFilter(s)">
          <i class="inline-block w-2.5 h-2.5 rounded-r-xs" [style.background]="bg(s)"></i>
          <span class="icon-outline" style="font-size:12px;" [style.color]="meta(s).colorVar" aria-hidden="true">{{ meta(s).icon }}</span>
          {{ meta(s).label }}
        </button>
      }
      @if (filterable()) {
        <button type="button" class="text-[11px] font-semibold" [class]="isFiltered() ? 'text-action cursor-pointer' : 'text-ink-500 cursor-default'"
                [disabled]="!isFiltered()" (click)="resetFilter()">
          Reset Filter
        </button>
      }
    </div>
  `
})
export class BaseStateHeatmapComponent {
  readonly rows = input.required<BaseHeatmapRow[]>();
  readonly columns = input.required<string[]>();
  readonly legendStates = input<BaseMachineState[]>(['production', 'engineering', 'standby', 'scheduled-dt', 'unscheduled-dt', 'non-scheduled', 'gap']);
  /** Click a legend state to isolate it (dims every other state's cells); shows a "Reset Filter" link. */
  readonly filterable = input(true);

  protected readonly hover = signal<{ row: string; col: string } | null>(null);
  /** Any number of states can be selected at once — "isolate" means "show only the selected set". */
  protected readonly filteredStates = signal<ReadonlySet<BaseMachineState>>(new Set());
  protected readonly isFiltered = computed(() => this.filteredStates().size > 0);

  meta(s: BaseMachineState) { return BASE_MACHINE_STATE_META[s]; }
  bg(s: BaseMachineState): string { return stateBackground(s); }

  isStateActive(s: BaseMachineState): boolean {
    const f = this.filteredStates();
    return f.size === 0 || f.has(s);
  }

  toggleStateFilter(s: BaseMachineState): void {
    if (!this.filterable()) return;
    this.filteredStates.update(current => toggleInSet(current, s));
  }

  resetFilter(): void {
    this.filteredStates.set(new Set());
  }

  cellOpacity(rowLabel: string, cell: BaseHeatmapCell): number {
    if (!this.isStateActive(cell.state)) return 0.15;
    const h = this.hover();
    return h && h.row === rowLabel && h.col === cell.col ? 1 : 0.92;
  }
}

export interface BaseGanttSegment {
  startHour: number;
  endHour: number;
  state: BaseMachineState;
  label?: string;
}
export interface BaseGanttMarker {
  /** Point in time, same domain units as segment `startHour`/`endHour`. */
  hour: number;
  label?: string;
  /** CSS color or `var(--...)`; defaults to `var(--color-success)`. */
  colorVar?: string;
}
/**
 * One sub-row ("lane") stacked inside a `BaseGanttRow`. Lanes let a single logical row show more
 * than one independent track — e.g. a "System" state lane stacked above a "Tool" state lane for
 * the same day — without merging their segments through `STATE_PRIORITY` collision handling. A
 * lane's own segments/markers are expected to be mutually exclusive in time (they don't overlap
 * each other); different lanes are drawn independently and are free to overlap one another.
 * Use `segments` for a bar-style lane (colored state blocks, same rendering as a single-lane
 * row) or `markers` for a tick-style lane (thin vertical lines at a point in time — events,
 * manual edits, annotations).
 */
export interface BaseGanttLane {
  /** Shown at the trailing edge of this lane, e.g. "System E10". Omit for an unlabeled lane. */
  label?: string;
  segments?: BaseGanttSegment[];
  markers?: BaseGanttMarker[];
  noData?: boolean;
}
export interface BaseGanttRow {
  label: string;
  /** Single-lane rows: segments drawn directly on the row. Ignored once `lanes` is set. */
  segments: BaseGanttSegment[];
  /** Stacked mutually-exclusive sub-rows sharing this row's label — see `BaseGanttLane`. */
  lanes?: BaseGanttLane[];
  badge?: string;
  noData?: boolean;
}

/** Rows without `lanes` behave exactly as before: a single implicit lane over `segments`. */
function rowLanes(row: BaseGanttRow): BaseGanttLane[] {
  return row.lanes?.length ? row.lanes : [{ segments: row.segments, noData: row.noData }];
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

function resolveCssColor(el: Element, colorVar: string): string {
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

function defaultDurationLabel(span: number): string {
  return Number.isInteger(span) ? `${span}h` : `${span.toFixed(1)}h`;
}

function resolveBadgeTone(badge: string): string {
  const pct = parseFloat(badge);
  if (Number.isNaN(pct)) return 'text-ink-600';
  if (pct >= 95) return 'text-success';
  if (pct >= 80) return 'text-warning';
  return 'text-error';
}

function drawGanttRow(
  canvas: HTMLCanvasElement,
  segments: BaseGanttSegment[],
  noData: boolean,
  domainStart: number,
  domainEnd: number,
  tiles: Map<BaseMachineState, HTMLCanvasElement>,
  filteredStates: ReadonlySet<BaseMachineState>
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

  const span = domainEnd - domainStart;
  const buckets: (BaseGanttSegment | null)[] = new Array(cssWidth).fill(null);
  if (!noData && span > 0) {
    const pxPerUnit = cssWidth / span;
    for (const seg of segments) {
      if (seg.endHour <= domainStart || seg.startHour >= domainEnd) continue;
      const startPx = Math.max(0, Math.min(cssWidth - 1, Math.floor((seg.startHour - domainStart) * pxPerUnit)));
      const endPx = Math.max(startPx + 1, Math.min(cssWidth, Math.ceil((seg.endHour - domainStart) * pxPerUnit)));
      for (let px = startPx; px < endPx; px++) {
        const current = buckets[px];
        if (!current || STATE_PRIORITY[seg.state] >= STATE_PRIORITY[current.state]) buckets[px] = seg;
      }
    }

    // The bar doesn't fill the lane edge-to-edge vertically — it stops short of the bottom,
    // leaving a baseline gap under it (matching the reference design). Hit-testing stays keyed
    // on x only, so the inset doesn't affect hover.
    const barHeight = Math.max(1, cssHeight - Math.min(4, Math.max(1, Math.round(cssHeight * 0.18))));

    // A 1px seam between adjacent *different* segments — same-state runs still merge into one
    // unbroken block (nothing changed to show a boundary for), but a genuine state change gets
    // a sliver of the track's background between the two blocks so it reads as two discrete
    // segments rather than one bar that happens to change color, matching the reference design.
    const boundaryGapPx = 1;
    let runStart = 0;
    for (let px = 1; px <= cssWidth; px++) {
      const sameRun = px < cssWidth && buckets[px]?.state === buckets[runStart]?.state;
      if (!sameRun) {
        const seg = buckets[runStart];
        if (seg) {
          const isLastRun = px >= cssWidth;
          const gap = isLastRun ? 0 : boundaryGapPx;
          const width = Math.max(0, (px - runStart) - gap);
          if (width > 0) {
            const tile = tiles.get(seg.state);
            const pattern = tile ? ctx.createPattern(tile, 'repeat') : null;
            ctx.fillStyle = pattern ?? resolveCssColor(canvas, BASE_MACHINE_STATE_META[seg.state].colorVar);
            // Click-to-toggle-a-state (multi-select): everything outside the selected set
            // dims, matching the opacity-based dimming used for row/series filters elsewhere.
            ctx.globalAlpha = filteredStates.size === 0 || filteredStates.has(seg.state) ? 1 : 0.2;
            ctx.fillRect(runStart, 0, width, barHeight);
            ctx.globalAlpha = 1;
          }
        }
        runStart = px;
      }
    }
  }
  return buckets;
}

/** Tick-style lane: thin vertical line per marker instead of filled state blocks. */
function drawGanttMarkers(
  canvas: HTMLCanvasElement,
  markers: BaseGanttMarker[],
  domainStart: number,
  domainEnd: number
): (BaseGanttMarker | null)[] {
  const cssWidth = Math.max(1, Math.round(canvas.clientWidth));
  const cssHeight = Math.max(1, Math.round(canvas.clientHeight));
  const dpr = window.devicePixelRatio || 1;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  const ctx = canvas.getContext('2d');
  const buckets: (BaseGanttMarker | null)[] = new Array(cssWidth).fill(null);
  if (!ctx) return buckets;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const span = domainEnd - domainStart;
  if (span <= 0) return buckets;
  const pxPerUnit = cssWidth / span;
  const tickWidthPx = 2;
  const hitRadiusPx = 3;
  for (const marker of markers) {
    if (marker.hour < domainStart || marker.hour > domainEnd) continue;
    const px = Math.max(0, Math.min(cssWidth - 1, Math.round((marker.hour - domainStart) * pxPerUnit)));
    ctx.fillStyle = resolveCssColor(canvas, marker.colorVar ?? 'var(--color-success)');
    ctx.fillRect(px - tickWidthPx / 2, 0, tickWidthPx, cssHeight);
    for (let dx = -hitRadiusPx; dx <= hitRadiusPx; dx++) {
      const bx = px + dx;
      if (bx >= 0 && bx < cssWidth) buckets[bx] = marker;
    }
  }
  return buckets;
}

interface LaneHover { laneIndex: number; kind: 'segment' | 'marker'; data: BaseGanttSegment | BaseGanttMarker; left: number; }

/**
 * One row's canvas + hover tooltip. Split out from the timeline so `*cdkVirtualFor`
 * can create/destroy/recycle rows independently as the viewport scrolls — the parent
 * no longer needs every row's canvas to exist at once, which is what makes hundreds
 * of rows affordable.
 */
@Component({
  selector: 'base-gantt-row-canvas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #rowRoot class="flex items-stretch gap-sp-3">
      <button type="button"
              class="w-16 shrink-0 self-center text-[11px] font-semibold truncate text-left bg-transparent border-0 p-0"
              [class.text-action]="selected()" [class.text-ink-700]="!selected()"
              [class.cursor-pointer]="filterable()" [disabled]="!filterable()"
              [attr.title]="filterable() ? 'Click to toggle this row' : row().label"
              (click)="labelClick.emit(row().label)">
        {{ row().label }}
      </button>

      <div class="flex-1 min-w-0 flex flex-col justify-center" [style.gap.px]="lanes().length > 1 ? 3 : 0">
        @for (lane of lanes(); track $index; let li = $index) {
          <div class="flex items-center gap-sp-2" [style.height.px]="laneHeightPx()">
            <div class="relative flex-1 h-full rounded-r-xs overflow-hidden bg-neutral-100">
              <canvas #laneCanvas class="absolute inset-0 block w-full h-full"
                      role="img" [attr.aria-label]="laneAriaLabel(lane)"
                      (mousemove)="onLaneMove($event, laneCanvas, li)" (mouseleave)="hover.set(null)"></canvas>
              @if (lane.noData) {
                <div class="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-neutral-400 bg-neutral-200">
                  No telemetry
                </div>
              }
              @if (hover(); as h) {
                @if (h.laneIndex === li) {
                  <div class="absolute pointer-events-none z-10 bg-ink-900 text-neutral-0 text-[11px] font-semibold rounded-r-xs px-sp-2 py-1 mono-data whitespace-nowrap"
                       [style.left.px]="h.left" style="bottom: 100%; margin-bottom: 4px; transform: translateX(-50%);">
                    {{ hoverText(h) }}
                  </div>
                }
              }
            </div>
            @if (lane.label) {
              <span class="w-16 shrink-0 text-[10px] font-semibold text-ink-500 truncate text-right">{{ lane.label }}</span>
            }
          </div>
        }
      </div>

      @if (row().badge) {
        <span class="w-12 shrink-0 self-center text-right text-[11px] font-semibold tabular-nums" style="font-family:var(--font-mono);"
              [class]="badgeTone(row().badge!)">{{ row().badge }}</span>
      }
    </div>
  `
})
export class BaseGanttRowCanvasComponent implements OnDestroy {
  readonly row = input.required<BaseGanttRow>();
  readonly domainStart = input.required<number>();
  readonly domainEnd = input.required<number>();
  readonly tiles = input.required<Map<BaseMachineState, HTMLCanvasElement>>();
  readonly durationFormat = input<(span: number) => string>(defaultDurationLabel);
  readonly selected = input(false);
  readonly filterable = input(true);
  readonly dragging = input(false);
  readonly filteredStates = input<ReadonlySet<BaseMachineState>>(new Set());
  /** Vertical budget shared across this row's lane(s); a single-lane row ignores it (fixed 20px, as before). */
  readonly rowHeight = input(32);
  readonly labelClick = output<string>();

  protected readonly lanes = computed<BaseGanttLane[]>(() => rowLanes(this.row()));

  private readonly rowRootRef = viewChild<ElementRef<HTMLElement>>('rowRoot');
  private readonly laneCanvasRefs = viewChildren<ElementRef<HTMLCanvasElement>>('laneCanvas');
  private laneBuckets: ((BaseGanttSegment | BaseGanttMarker | null)[])[] = [];
  protected readonly hover = signal<LaneHover | null>(null);
  private readonly redrawTick = signal(0);
  private resizeObserver: ResizeObserver | null = null;
  private rafId: number | null = null;

  constructor() {
    effect(() => {
      const ref = this.rowRootRef();
      if (ref && !this.resizeObserver && typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => this.scheduleRedraw());
        this.resizeObserver.observe(ref.nativeElement);
      }
    });

    effect(() => {
      const refs = this.laneCanvasRefs();
      const lanes = this.lanes();
      const start = this.domainStart();
      const end = this.domainEnd();
      const tiles = this.tiles();
      const filteredStates = this.filteredStates();
      this.redrawTick();
      this.laneBuckets = refs.map((ref, i) => {
        const lane = lanes[i];
        if (!lane) return [];
        return lane.markers
          ? drawGanttMarkers(ref.nativeElement, lane.markers, start, end)
          : drawGanttRow(ref.nativeElement, lane.segments ?? [], lane.noData ?? false, start, end, tiles, filteredStates);
      });
    });

    effect(() => {
      if (this.dragging()) this.hover.set(null);
    });
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

  /** Single-lane rows keep the original fixed 20px bar; multi-lane rows split `rowHeight` between lanes. */
  laneHeightPx(): number {
    const n = this.lanes().length;
    if (n <= 1) return 20;
    return Math.max(9, Math.floor((this.rowHeight() - 3 * (n - 1)) / n));
  }

  laneAriaLabel(lane: BaseGanttLane): string {
    const label = lane.label ?? this.row().label;
    const count = lane.markers?.length ?? lane.segments?.length ?? 0;
    return lane.markers ? `${label} timeline, ${count} event(s)` : `${label} timeline, ${count} state change(s)`;
  }

  onLaneMove(ev: MouseEvent, canvas: HTMLCanvasElement, laneIndex: number): void {
    const buckets = this.laneBuckets[laneIndex];
    if (this.dragging() || !buckets?.length) { this.hover.set(null); return; }
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(buckets.length - 1, Math.max(0, Math.floor(ev.clientX - rect.left)));
    const data = buckets[x];
    if (!data) { this.hover.set(null); return; }
    const kind: LaneHover['kind'] = 'startHour' in data ? 'segment' : 'marker';
    this.hover.set({ laneIndex, kind, data, left: x });
  }

  hoverText(h: LaneHover): string {
    if (h.kind === 'segment') {
      const seg = h.data as BaseGanttSegment;
      return `${seg.label || this.meta(seg.state).label} · ${this.durationFormat()(seg.endHour - seg.startHour)}`;
    }
    const marker = h.data as BaseGanttMarker;
    return marker.label ?? 'Event';
  }

  meta(s: BaseMachineState) { return BASE_MACHINE_STATE_META[s]; }
  badgeTone(badge: string): string { return resolveBadgeTone(badge); }
}

@Component({
  selector: 'base-gantt-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, BaseGanttRowCanvasComponent, BaseChartZoomBarComponent],
  template: `
    <div class="relative flex flex-col gap-sp-2"
         (pointerdown)="onDragStart($event)" (pointermove)="onDragMove($event)"
         (pointerup)="onDragEnd()" (pointerleave)="onDragEnd()">
      @if (zoomable() || filterable()) {
        <base-chart-zoom-bar [zoomed]="isZoomed()" [filtered]="isFiltered()" [showFilter]="filterable()"
                              (resetZoom)="resetZoom()" (resetFilter)="resetFilter()" />
      }

      <cdk-virtual-scroll-viewport [itemSize]="rowHeight()" [style.height.px]="viewportHeightPx()" class="gantt-viewport">
        <div *cdkVirtualFor="let row of visibleRows(); trackBy: trackByLabel" [style.height.px]="rowHeight()">
          <base-gantt-row-canvas
            [row]="row" [domainStart]="visibleDomain().start" [domainEnd]="visibleDomain().end"
            [tiles]="tiles()" [durationFormat]="durationFormat() ?? defaultDurationFn" [rowHeight]="rowHeight()"
            [selected]="filteredLabels().has(row.label)" [filterable]="filterable()" [dragging]="isDragging()"
            [filteredStates]="filteredStates()"
            (labelClick)="onLabelClick($event)" />
        </div>
      </cdk-virtual-scroll-viewport>

      <div class="flex items-center gap-sp-3 mt-1">
        <span class="w-16 shrink-0"></span>
        <div #trackRef class="relative flex-1 flex justify-between text-[9px] text-ink-500" style="font-family:var(--font-mono);">
          @for (t of axisTicks(); track $index) { <span>{{ t }}</span> }
        </div>
        <span class="w-12 shrink-0"></span>
      </div>

      @if (zoomable() || filterable()) {
        <base-chart-zoom-bar [zoomed]="isZoomed()" [filtered]="isFiltered()" [showFilter]="filterable()"
                              (resetZoom)="resetZoom()" (resetFilter)="resetFilter()" />
      }

      @if (dragOverlay(); as ov) {
        <div class="absolute inset-y-0 z-20 pointer-events-none bg-action/15 border-x border-action"
             [style.left.px]="ov.left" [style.width.px]="ov.width"></div>
      }
    </div>
    <div class="flex flex-wrap items-center gap-x-sp-4 gap-y-1 mt-sp-3 text-[11px] text-ink-600">
      @for (s of legendStates(); track s) {
        <button type="button" class="flex items-center gap-1.5 bg-transparent border-0 p-0"
                [class.opacity-40]="!isStateActive(s)" [class.cursor-pointer]="filterable()"
                [attr.title]="filterable() ? 'Click to toggle ' + meta(s).label : meta(s).label"
                (click)="toggleStateFilter(s)">
          <i class="inline-block w-2.5 h-2.5 rounded-r-xs" [style.background]="bg(s)"></i>
          <span class="icon-outline" style="font-size:12px;" [style.color]="meta(s).colorVar" aria-hidden="true">{{ meta(s).icon }}</span>
          {{ meta(s).label }}
        </button>
      }
    </div>
  `
})
export class BaseGanttTimelineComponent {
  readonly rows = input.required<BaseGanttRow[]>();
  readonly legendStates = input<BaseMachineState[]>(['production', 'standby', 'scheduled-dt', 'unscheduled-dt']);
  /** Total width of the domain, in the same unit as segment startHour/endHour (hours by default; epoch ms works too). */
  readonly totalHours = input(24);
  /** Absolute offset added to every segment's startHour/endHour — lets segments hold epoch-ms timestamps. */
  readonly domainStart = input(0);
  /**
   * Custom tick formatter: receives the absolute (domainStart-adjusted) tick value and the
   * currently-visible span (post-zoom), so it can vary granularity as the user zooms in.
   * Defaults to HH:MM / "Nh".
   */
  readonly axisTickFormat = input<((v: number, visibleSpan: number) => string) | null>(null);
  /** Custom duration formatter for the hover tooltip, receives the segment span in domain units. */
  readonly durationFormat = input<((span: number) => string) | null>(null);
  /** Click a row label to isolate it; shows a "Reset Filter" link. */
  readonly filterable = input(true);
  /** Drag-select on the timeline to zoom in; shows a "Reset Zoom" link. */
  readonly zoomable = input(true);
  readonly rowHeight = input(32);
  /** Rows viewport caps out at this height and scrolls — keeps hundreds of rows smooth. */
  readonly maxViewportHeight = input(420);

  protected readonly defaultDurationFn = defaultDurationLabel;
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly trackRef = viewChild<ElementRef<HTMLElement>>('trackRef');

  protected readonly zoomWindow = signal<ChartZoomWindow>(FULL_ZOOM_WINDOW);
  /** Any number of rows can be selected at once — "isolate" means "show only the selected set". */
  protected readonly filteredLabels = signal<ReadonlySet<string>>(new Set());
  /** Any number of legend states can be selected at once — every segment outside the set dims across all rows. */
  protected readonly filteredStates = signal<ReadonlySet<BaseMachineState>>(new Set());
  protected readonly isZoomed = computed(() => isZoomedWindow(this.zoomWindow()));
  protected readonly isFiltered = computed(() => this.filteredLabels().size > 0 || this.filteredStates().size > 0);

  protected readonly dragStartFrac = signal<number | null>(null);
  protected readonly dragCurrentFrac = signal<number | null>(null);
  protected readonly isDragging = computed(() => this.dragStartFrac() !== null);
  private dragOffsetLeft = 0;
  private dragTrackWidth = 0;

  protected readonly visibleRows = computed(() => {
    const f = this.filteredLabels();
    const rows = this.rows();
    return f.size === 0 ? rows : rows.filter(r => f.has(r.label));
  });

  protected readonly viewportHeightPx = computed(() =>
    Math.max(this.rowHeight(), Math.min(this.visibleRows().length * this.rowHeight(), this.maxViewportHeight()))
  );

  protected readonly visibleDomain = computed(() => {
    const total = this.totalHours();
    const start0 = this.domainStart();
    const w = this.zoomWindow();
    return { start: start0 + w.start * total, end: start0 + w.end * total };
  });

  protected readonly axisTicks = computed(() => {
    const { start, end } = this.visibleDomain();
    const total = this.totalHours();
    const steps = 6;
    const span = end - start;
    const formatter = this.axisTickFormat() ?? ((v: number, _span: number) => total <= 48 ? this.fmt(((v % 24) + 24) % 24) : `${Math.round(v)}h`);
    return Array.from({ length: steps + 1 }, (_, i) => formatter(start + (span / steps) * i, span));
  });

  protected readonly dragOverlay = computed(() => {
    const s = this.dragStartFrac(), c = this.dragCurrentFrac();
    if (s === null || c === null) return null;
    return { left: this.dragOffsetLeft + Math.min(s, c) * this.dragTrackWidth, width: Math.abs(c - s) * this.dragTrackWidth };
  });

  protected readonly tiles = computed(() => this.buildTiles());

  private buildTiles(): Map<BaseMachineState, HTMLCanvasElement> {
    const tiles = new Map<BaseMachineState, HTMLCanvasElement>();
    const el = this.host.nativeElement;
    for (const state of Object.keys(BASE_MACHINE_STATE_META) as BaseMachineState[]) {
      const meta = BASE_MACHINE_STATE_META[state];
      tiles.set(state, buildPatternTile(meta.pattern, resolveCssColor(el, meta.colorVar)));
    }
    return tiles;
  }

  trackByLabel(_: number, row: BaseGanttRow): string { return row.label; }

  onLabelClick(label: string): void {
    if (!this.filterable()) return;
    this.filteredLabels.update(current => toggleInSet(current, label));
  }

  resetFilter(): void {
    this.filteredLabels.set(new Set());
    this.filteredStates.set(new Set());
  }
  resetZoom(): void { this.zoomWindow.set(FULL_ZOOM_WINDOW); }

  isStateActive(s: BaseMachineState): boolean {
    const f = this.filteredStates();
    return f.size === 0 || f.has(s);
  }

  toggleStateFilter(s: BaseMachineState): void {
    if (!this.filterable()) return;
    this.filteredStates.update(current => toggleInSet(current, s));
  }

  onDragStart(ev: PointerEvent): void {
    if (!this.zoomable() || ev.button !== 0) return;
    const track = this.trackRef()?.nativeElement;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const hostRect = this.host.nativeElement.getBoundingClientRect();
    this.dragOffsetLeft = rect.left - hostRect.left;
    this.dragTrackWidth = rect.width;
    const f = fracX(ev.clientX, rect);
    this.dragStartFrac.set(f);
    this.dragCurrentFrac.set(f);
  }

  onDragMove(ev: PointerEvent): void {
    if (this.dragStartFrac() === null || !this.dragTrackWidth) return;
    const f = Math.max(0, Math.min(1, (ev.clientX - (this.host.nativeElement.getBoundingClientRect().left + this.dragOffsetLeft)) / this.dragTrackWidth));
    this.dragCurrentFrac.set(f);
  }

  onDragEnd(): void {
    const s = this.dragStartFrac(), e = this.dragCurrentFrac();
    if (s !== null && e !== null && Math.abs(e - s) > 0.01) {
      this.zoomWindow.set(narrowZoomWindow(this.zoomWindow(), s, e));
    }
    this.dragStartFrac.set(null);
    this.dragCurrentFrac.set(null);
  }

  meta(s: BaseMachineState) { return BASE_MACHINE_STATE_META[s]; }
  bg(s: BaseMachineState): string { return stateBackground(s); }

  fmt(h: number): string {
    const hh = Math.floor(h).toString().padStart(2, '0');
    const mm = Math.round((h % 1) * 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }
}
