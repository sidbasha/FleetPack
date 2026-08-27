import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import {
  BaseChartZoomBarComponent,
  ChartZoomWindow,
  FULL_ZOOM_WINDOW,
  fracX,
  fracY,
  isZoomedWindow,
  narrowZoomWindow,
  sliceWindow,
  toggleInSet
} from './chart-zoom.util';

export const SERIES_COLOR_ORDER = ['action', 'accent', 'info', 'success', 'warning', 'error'] as const;
export type SeriesTone = typeof SERIES_COLOR_ORDER[number];

const SERIES_COLOR_VAR: Record<SeriesTone, string> = {
  action: 'var(--color-action)',
  accent: 'var(--color-accent)',
  info: 'var(--color-info)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)'
};

export function seriesColor(index: number): string {
  return SERIES_COLOR_VAR[SERIES_COLOR_ORDER[index % SERIES_COLOR_ORDER.length]];
}

export interface BaseChartPoint {
  x: string;
  y: number;
  tone?: SeriesTone;
  segments?: { value: number; tone: SeriesTone; label?: string }[];
}

const CHART_FONT = 'font-family:var(--font-mono);font-variant-numeric:tabular-nums;';

type TrendSeriesKey = string;

/**
 * A rolling-average overlay for `base-trend-chart` — any window length works ("4W Rolling",
 * "13W Rolling", "26W Rolling", "YTD Rolling", …), there's nothing 4/13-specific about it.
 * Points carry their own week label rather than assuming positional alignment with `data`,
 * since a rolling series generally starts later and runs shorter than the main series.
 */
export interface BaseTrendRollingSeries {
  /** Stable identifier for this series — used for the click-to-isolate filter. */
  key: string;
  /** Legend label, e.g. "4W Rolling" or "13W Rolling" — whatever window this series represents. */
  label: string;
  data: BaseChartPoint[];
}

@Component({
  selector: 'base-trend-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, BaseChartZoomBarComponent],
  template: `
    <div class="relative">
      @if (zoomable() || filterable()) {
        <base-chart-zoom-bar [zoomed]="isZoomed()" [filtered]="isFiltered()" [showFilter]="filterable() && hasMultipleSeries()"
                              (resetZoom)="resetZoom()" (resetFilter)="resetFilter()" />
      }
      @if (hasMultipleSeries()) {
        <div class="flex flex-wrap items-center gap-sp-4 mb-sp-2 text-[11px] text-ink-600">
          <span class="flex items-center gap-1.5" [class.opacity-40]="!showSeries('actual')"
                [class.cursor-pointer]="filterable()" (click)="onLegendClick('actual')">
            <i class="inline-block w-3 h-0.5 bg-action"></i>{{ seriesLabel() }}
          </span>
          @for (s of alignedRollingSeries(); track s.key; let i = $index) {
            @if (s.points.length) {
              <span class="flex items-center gap-1.5" [class.opacity-40]="!showSeries(s.key)"
                    [class.cursor-pointer]="filterable()" (click)="onLegendClick(s.key)">
                <i class="inline-block w-3 h-0.5" [style.border-top]="'1.5px ' + dashStyleFor(i) + ' ' + colorFor(i)"></i>{{ s.label }}
              </span>
            }
          }
          @if (target() !== undefined) {
            <span class="flex items-center gap-1.5" [class.opacity-40]="!showSeries('target')"
                  [class.cursor-pointer]="filterable()" (click)="onLegendClick('target')">
              <i class="inline-block w-3 h-0.5" style="border-top:1.5px dashed var(--color-neutral-400);"></i>{{ targetLabel() }}
            </span>
          }
        </div>
      }
      <svg [attr.viewBox]="'0 0 ' + w + ' ' + h" [attr.width]="'100%'" [attr.height]="height()" preserveAspectRatio="none"
           (mousemove)="onMove($event)" (mouseleave)="onLeave()"
           (pointerdown)="onPointerDown($event)" (pointerup)="onPointerUp()"
           role="img" [attr.aria-label]="seriesLabel() + ' trend chart'">
        @for (gy of gridLines(); track gy.y) {
          <line [attr.x1]="padL" [attr.x2]="w - padR" [attr.y1]="gy.y" [attr.y2]="gy.y" stroke="var(--color-neutral-200)" stroke-width="1" />
          <text [attr.x]="padL - 6" [attr.y]="gy.y + 3" text-anchor="end" font-size="9" fill="var(--color-ink-500)" [attr.style]="fontStyle">{{ gy.label }}</text>
        }
        @if (showSeries('actual')) {
          @if (areaPoints(); as ap) { <polygon [attr.points]="ap" fill="var(--color-action)" opacity="0.08" /> }
        }
        @if (showSeries('target') && target() !== undefined) {
          <line [attr.x1]="padL" [attr.x2]="w - padR" [attr.y1]="targetY()" [attr.y2]="targetY()" stroke="var(--color-neutral-400)" stroke-width="1.5" stroke-dasharray="5 3" />
        }
        @for (s of alignedRollingSeries(); track s.key; let i = $index) {
          @if (showSeries(s.key) && s.points.length) {
            <polyline [attr.points]="linePointsAligned(s.points)" fill="none" [attr.stroke]="colorFor(i)" stroke-width="1.5" [attr.stroke-dasharray]="dashArrayFor(i)" stroke-linecap="round" />
          }
        }
        @if (showSeries('actual')) {
          <polyline [attr.points]="linePoints(values())" fill="none" stroke="var(--color-action)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        }

        @if (showSeries('actual') && hoverPoint(); as h2) {
          <line [attr.x1]="xAt(h2.i)" [attr.x2]="xAt(h2.i)" [attr.y1]="padT" [attr.y2]="h - padB" stroke="var(--color-neutral-300)" stroke-width="1" />
          <circle [attr.cx]="xAt(h2.i)" [attr.cy]="yAt(values()[h2.i])" r="3.5" fill="var(--color-action)" stroke="var(--color-neutral-0)" stroke-width="1.5" />
        }
        @if (dragOverlay(); as ov) {
          <rect [attr.x]="ov.x" y="0" [attr.width]="ov.width" [attr.height]="h" fill="var(--color-action)" opacity="0.12" />
        }
      </svg>
      @if (showSeries('actual') && hoverPoint(); as h2) {
        <div class="absolute pointer-events-none bg-ink-900 text-neutral-0 text-[11px] font-semibold rounded-r-xs px-sp-2 py-1 mono-data"
             [style.left.%]="xAt(h2.i) / w * 100" [style.top.%]="(yAt(values()[h2.i]) - 34) / h * 100" style="transform: translateX(-50%);">
          {{ windowedData()[h2.i].x }} · {{ windowedData()[h2.i].y | number: '1.1-1' }}%
        </div>
      }
      <div class="flex justify-between mt-1 text-[9px] text-ink-500" [style]="fontStyle">
        @for (d of tickLabels(); track $index) { <span>{{ d }}</span> }
      </div>
    </div>
  `
})
export class BaseTrendChartComponent {
  readonly data = input.required<BaseChartPoint[]>();
  /**
   * Any number of rolling-average overlays — not fixed to 4-week/13-week, a series can
   * represent any window length. Each point carries its own week label (`x`) rather than
   * assuming positional alignment with `data`, since a rolling average "warms up" late
   * (an N-week rolling value only exists once N weeks of history exist) and generally
   * won't have the same length or start week as the main series or each other. Points are
   * matched to `data`'s x-labels, so a series can start/end on any week and still land in
   * the right place, including after a zoom.
   */
  readonly rollingSeries = input<BaseTrendRollingSeries[]>([]);
  readonly target = input<number | undefined>(undefined);
  readonly targetLabel = input('Target');
  readonly seriesLabel = input('Actual');
  readonly height = input(180);
  readonly showArea = input(true);
  /** Drag-select on the chart to zoom into a range of points; shows a "Reset Zoom" link. */
  readonly zoomable = input(true);
  /** Click legend entries to select which series show (any number at once); shows a "Reset Filter" link. */
  readonly filterable = input(true);

  protected readonly fontStyle = CHART_FONT;
  protected readonly w = 480;
  protected readonly h = 180;
  protected readonly padL = 32; protected readonly padR = 8; protected readonly padT = 8; protected readonly padB = 8;

  protected readonly hoverIndex = signal<number | null>(null);
  protected readonly zoomWindow = signal<ChartZoomWindow>(FULL_ZOOM_WINDOW);
  protected readonly isZoomed = computed(() => isZoomedWindow(this.zoomWindow()));
  protected readonly dragStartFrac = signal<number | null>(null);
  protected readonly dragCurrentFrac = signal<number | null>(null);

  /** Any number of series can be selected at once — "isolate" means "show only the selected set". */
  protected readonly filteredSeries = signal<ReadonlySet<TrendSeriesKey>>(new Set());
  protected readonly isFiltered = computed(() => this.filteredSeries().size > 0);
  protected readonly hasMultipleSeries = computed(() => this.rollingSeries().length > 0 || this.target() !== undefined);

  protected readonly windowedData = computed(() => sliceWindow(this.data(), this.zoomWindow()));
  protected readonly alignedRollingSeries = computed(() =>
    this.rollingSeries().map(s => ({ key: s.key, label: s.label, points: this.alignToWindow(s.data) }))
  );
  protected readonly values = computed(() => this.windowedData().map(d => d.y));

  // Wrapped in an object so index 0 still reads as "present" (a bare number is falsy in @if).
  protected readonly hoverPoint = computed(() => {
    const i = this.hoverIndex();
    return i !== null && i < this.windowedData().length ? { i } : null;
  });

  /**
   * Match each rolling point to the currently-visible week by its own x-label (not by
   * index) — a rolling series can be shorter than `data`, start on a later week, or
   * skip weeks entirely, and this still places every point on the correct tick.
   * Points whose label falls outside the current zoom window are simply dropped,
   * which is exactly right: the rolling line just starts/ends where its data does.
   */
  private alignToWindow(series: BaseChartPoint[]): { index: number; y: number }[] {
    const indexByLabel = new Map(this.windowedData().map((d, i) => [d.x, i]));
    return series
      .filter(p => indexByLabel.has(p.x))
      .map(p => ({ index: indexByLabel.get(p.x)!, y: p.y }))
      .sort((a, b) => a.index - b.index);
  }

  private readonly domain = computed(() => {
    const all = [...this.values(), ...this.alignedRollingSeries().flatMap(s => s.points.map(p => p.y))];
    if (this.target() !== undefined) all.push(this.target()!);
    const min = Math.min(0, ...all), max = Math.max(100, ...all);
    return { min, max };
  });

  /** Cycle the shared series palette for each rolling overlay, offset by 1 so the first doesn't collide with the main (action-colored) line. */
  protected colorFor(i: number): string {
    return seriesColor(i + 1);
  }

  /** Alternate dash patterns so adjacent rolling overlays stay visually distinct even when colors repeat past the palette length. */
  protected dashArrayFor(i: number): string {
    return i % 2 === 0 ? '5 3' : '1 3';
  }

  protected dashStyleFor(i: number): string {
    return i % 2 === 0 ? 'dashed' : 'dotted';
  }

  protected readonly gridLines = computed(() => {
    const { min, max } = this.domain();
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const v = min + ((max - min) * i) / steps;
      return { y: this.yAtValue(v), label: `${Math.round(v)}%` };
    });
  });

  protected readonly tickLabels = computed(() => {
    const d = this.windowedData();
    if (d.length <= 6) return d.map(p => p.x);
    const step = Math.ceil(d.length / 6);
    return d.filter((_, i) => i % step === 0).map(p => p.x);
  });

  private yAtValue(v: number): number {
    const { min, max } = this.domain();
    const span = max - min || 1;
    return this.h - this.padB - ((v - min) / span) * (this.h - this.padT - this.padB);
  }

  protected yAt(v: number): number { return this.yAtValue(v); }
  protected targetY = computed(() => this.target() !== undefined ? this.yAtValue(this.target()!) : 0);

  protected xAt(i: number): number {
    const n = this.windowedData().length;
    const step = n > 1 ? (this.w - this.padL - this.padR) / (n - 1) : 0;
    return this.padL + i * step;
  }

  protected linePoints(series: number[]): string {
    return series.map((v, i) => `${this.xAt(i)},${this.yAtValue(v)}`).join(' ');
  }

  /** Like linePoints(), but each point already carries its own x-index (see alignToWindow) rather than assuming positional order. */
  protected linePointsAligned(points: { index: number; y: number }[]): string {
    return points.map(p => `${this.xAt(p.index)},${this.yAtValue(p.y)}`).join(' ');
  }

  protected readonly areaPoints = computed(() => {
    if (!this.showArea()) return '';
    const v = this.values();
    if (!v.length) return '';
    const base = this.h - this.padB;
    return `${this.xAt(0)},${base} ` + v.map((val, i) => `${this.xAt(i)},${this.yAtValue(val)}`).join(' ') + ` ${this.xAt(v.length - 1)},${base}`;
  });

  protected readonly dragOverlay = computed(() => {
    const s = this.dragStartFrac(), c = this.dragCurrentFrac();
    if (s === null || c === null) return null;
    return { x: Math.min(s, c) * this.w, width: Math.abs(c - s) * this.w };
  });

  onMove(ev: MouseEvent): void {
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    if (this.dragStartFrac() !== null) {
      this.dragCurrentFrac.set(fracX(ev.clientX, rect));
      return;
    }
    const px = ((ev.clientX - rect.left) / rect.width) * this.w;
    const n = this.windowedData().length;
    if (!n) return;
    const step = n > 1 ? (this.w - this.padL - this.padR) / (n - 1) : 1;
    const i = Math.round((px - this.padL) / step);
    this.hoverIndex.set(Math.min(n - 1, Math.max(0, i)));
  }

  onLeave(): void {
    this.hoverIndex.set(null);
  }

  onPointerDown(ev: PointerEvent): void {
    if (!this.zoomable() || ev.button !== 0) return;
    const rect = (ev.currentTarget as Element).getBoundingClientRect();
    const f = fracX(ev.clientX, rect);
    this.dragStartFrac.set(f);
    this.dragCurrentFrac.set(f);
    this.hoverIndex.set(null);
  }

  onPointerUp(): void {
    const s = this.dragStartFrac(), c = this.dragCurrentFrac();
    if (s !== null && c !== null && Math.abs(c - s) > 0.02) {
      this.zoomWindow.set(narrowZoomWindow(this.zoomWindow(), s, c));
    }
    this.dragStartFrac.set(null);
    this.dragCurrentFrac.set(null);
  }

  resetZoom(): void {
    this.zoomWindow.set(FULL_ZOOM_WINDOW);
  }

  showSeries(key: TrendSeriesKey): boolean {
    const f = this.filteredSeries();
    return f.size === 0 || f.has(key);
  }

  onLegendClick(key: TrendSeriesKey): void {
    if (!this.filterable()) return;
    this.filteredSeries.update(current => toggleInSet(current, key));
  }

  resetFilter(): void {
    this.filteredSeries.set(new Set());
  }
}

@Component({
  selector: 'base-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartZoomBarComponent],
  template: `
    @if (orientation() === 'horizontal') {
      <div class="relative">
        @if (zoomable() || filterable()) {
          <base-chart-zoom-bar [zoomed]="isZoomed()" [filtered]="isFiltered()" [showFilter]="filterable()"
                                (resetZoom)="resetZoom()" (resetFilter)="resetFilter()" />
        }
        <div class="relative flex flex-col gap-sp-2.5"
             (pointerdown)="onHPointerDown($event)" (pointermove)="onHPointerMove($event)"
             (pointerup)="onPointerUp()" (pointerleave)="onPointerUp()">
          @for (d of visibleData(); track d.x; let i = $index) {
            <div class="flex items-center gap-sp-2" [class.cursor-pointer]="filterable()" (click)="onBarClick(d.x)">
              <span class="w-24 shrink-0 text-[11px] text-right truncate" [class.text-action]="filteredKeys().has(d.x)" [class.text-ink-600]="!filteredKeys().has(d.x)">{{ d.x }}</span>
              <div class="relative flex-1 h-5 rounded-r-xs overflow-hidden bg-neutral-100">
                @if (d.segments?.length) {
                  @for (seg of d.segments; track $index; let si = $index) {
                    <span class="absolute top-0 h-full" [style.left.%]="hSegStart(d, si)" [style.width.%]="hSegWidth(d, si)"
                          [style.background]="SERIES_COLOR_VAR[seg.tone]"
                          [style.border-left]="si > 0 ? '1px solid var(--color-neutral-0)' : 'none'"
                          [attr.title]="(seg.label || d.x) + ' · ' + seg.value"></span>
                  }
                } @else {
                  <span class="absolute top-0 left-0 h-full rounded-r-xs transition-colors" [style.width.%]="hWidth(d)"
                        [style.background]="toneVar(d)"></span>
                }
              </div>
              <span class="w-12 shrink-0 text-[11px] font-semibold text-ink-900 tabular-nums" style="font-family:var(--font-mono);">
                {{ total(d) }}{{ valueSuffix() }}
              </span>
            </div>
          }
          @if (dragOverlayH(); as ov) {
            <div class="absolute inset-x-0 z-10 pointer-events-none bg-action/12 border-y border-action"
                 [style.top.px]="ov.top" [style.height.px]="ov.height"></div>
          }
        </div>
      </div>
    } @else {
      <div class="relative">
        @if (zoomable() || filterable()) {
          <base-chart-zoom-bar [zoomed]="isZoomed()" [filtered]="isFiltered()" [showFilter]="filterable()"
                                (resetZoom)="resetZoom()" (resetFilter)="resetFilter()" />
        }
        <svg [attr.viewBox]="'0 0 ' + w + ' ' + h" width="100%" [attr.height]="height()" preserveAspectRatio="none" (mouseleave)="hoverIndex.set(null)"
             (pointerdown)="onVPointerDown($event)" (pointermove)="onVPointerMove($event)" (pointerup)="onPointerUp()"
             role="img" [attr.aria-label]="'Bar chart'">
          @for (gy of gridLines(); track gy) {
            <line x1="0" [attr.x2]="w" [attr.y1]="gy" [attr.y2]="gy" stroke="var(--color-neutral-200)" stroke-width="1" />
          }
          @for (d of visibleData(); track d.x; let i = $index) {
            @if (d.segments?.length) {
              @for (seg of d.segments; track $index; let si = $index) {
                <rect [attr.x]="xAt(i)" [attr.y]="vSegY(d, si)" [attr.width]="barWidth()" [attr.height]="vSegHeight(d, si)"
                      [attr.fill]="SERIES_COLOR_VAR[seg.tone]" stroke="var(--color-neutral-0)" stroke-width="1"
                      [style.cursor]="filterable() ? 'pointer' : null" (click)="onBarClick(d.x)" />
              }
            } @else {
              <rect [attr.x]="xAt(i)" [attr.y]="yAt(d.y)" [attr.width]="barWidth()" [attr.height]="h - padB - yAt(d.y)"
                    [attr.fill]="i === hoverPoint()?.i ? 'var(--color-action-hover)' : toneVar(d)" rx="2"
                    [style.cursor]="filterable() ? 'pointer' : null"
                    (mouseenter)="onBarEnter(i)" (click)="onBarClick(d.x)" />
            }
          }
          @if (dragOverlayV(); as ov) {
            <rect [attr.x]="ov.x" y="0" [attr.width]="ov.width" [attr.height]="h" fill="var(--color-action)" opacity="0.12" />
          }
        </svg>
        @if (hoverPoint(); as h2) {
          <div class="absolute pointer-events-none bg-ink-900 text-neutral-0 text-[11px] font-semibold rounded-r-xs px-sp-2 py-1 mono-data"
               [style.left.%]="(xAt(h2.i) + barWidth() / 2) / w * 100" [style.top.%]="(yAt(visibleData()[h2.i].y) - 26) / h * 100" style="transform: translateX(-50%);">
            {{ visibleData()[h2.i].y }}
          </div>
        }
        <div class="flex mt-1 text-[9px] text-ink-500" [style]="fontStyle">
          @for (d of visibleData(); track d.x) { <span class="flex-1 text-center truncate">{{ d.x }}</span> }
        </div>
      </div>
    }
  `
})
export class BaseBarChartComponent {
  readonly data = input.required<BaseChartPoint[]>();
  readonly height = input(160);
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly defaultTone = input<SeriesTone>('action');
  readonly valueSuffix = input('');
  /** Drag-select to zoom into a range of bars/categories; shows a "Reset Zoom" link. */
  readonly zoomable = input(true);
  /** Click bars/categories to select which show (any number at once); shows a "Reset Filter" link. */
  readonly filterable = input(true);

  protected readonly SERIES_COLOR_VAR = SERIES_COLOR_VAR;
  protected readonly fontStyle = CHART_FONT;
  protected readonly w = 320; protected readonly h = 160; protected readonly padB = 4; protected readonly padT = 8;
  protected readonly hoverIndex = signal<number | null>(null);

  protected readonly zoomWindow = signal<ChartZoomWindow>(FULL_ZOOM_WINDOW);
  protected readonly isZoomed = computed(() => isZoomedWindow(this.zoomWindow()));
  /** Any number of categories can be selected at once — "isolate" means "show only the selected set". */
  protected readonly filteredKeys = signal<ReadonlySet<string>>(new Set());
  protected readonly isFiltered = computed(() => this.filteredKeys().size > 0);
  protected readonly visibleData = computed(() => {
    const windowed = sliceWindow(this.data(), this.zoomWindow());
    const f = this.filteredKeys();
    return f.size === 0 ? windowed : windowed.filter(d => f.has(d.x));
  });
  private wasDrag = false;

  // Wrapped in an object so index 0 still reads as "present" (a bare number is falsy in @if),
  // and clamped against visibleData() so a hover set mid-drag can't outlive a zoom that shrinks it.
  protected readonly hoverPoint = computed(() => {
    const i = this.hoverIndex();
    return i !== null && i < this.visibleData().length ? { i } : null;
  });

  protected readonly dragStartFrac = signal<number | null>(null);
  protected readonly dragCurrentFrac = signal<number | null>(null);
  private dragExtentPx = 0;

  private readonly max = computed(() => Math.max(1, ...this.visibleData().map(d => this.total(d))));
  protected readonly gridLines = computed(() => Array.from({ length: 4 }, (_, i) => this.padT + (i * (this.h - this.padT - this.padB)) / 3));

  protected barWidth = computed(() => {
    const n = this.visibleData().length || 1;
    return (this.w / n) * 0.6;
  });

  protected xAt(i: number): number {
    const n = this.visibleData().length || 1;
    const slot = this.w / n;
    return i * slot + (slot - this.barWidth()) / 2;
  }

  protected yAt(v: number): number {
    return this.h - this.padB - (v / this.max()) * (this.h - this.padT - this.padB);
  }

  protected total(d: BaseChartPoint): number {
    return d.segments?.length ? d.segments.reduce((sum, s) => sum + s.value, 0) : d.y;
  }

  protected toneVar(d: BaseChartPoint): string {
    return SERIES_COLOR_VAR[d.tone ?? this.defaultTone()];
  }

  private cumulative(d: BaseChartPoint, uptoExclusive: number): number {
    return d.segments!.slice(0, uptoExclusive).reduce((s, x) => s + x.value, 0);
  }

  protected vSegY(d: BaseChartPoint, si: number): number {
    return this.yAt(this.cumulative(d, si) + d.segments![si].value);
  }
  protected vSegHeight(d: BaseChartPoint, si: number): number {
    return this.yAt(this.cumulative(d, si)) - this.yAt(this.cumulative(d, si) + d.segments![si].value);
  }

  protected hWidth(d: BaseChartPoint): number { return (this.total(d) / this.max()) * 100; }
  protected hSegStart(d: BaseChartPoint, si: number): number { return (this.cumulative(d, si) / this.max()) * 100; }
  protected hSegWidth(d: BaseChartPoint, si: number): number { return (d.segments![si].value / this.max()) * 100; }

  protected readonly dragOverlayH = computed(() => {
    if (this.orientation() !== 'horizontal') return null;
    const s = this.dragStartFrac(), c = this.dragCurrentFrac();
    if (s === null || c === null) return null;
    return { top: Math.min(s, c) * this.dragExtentPx, height: Math.abs(c - s) * this.dragExtentPx };
  });

  protected readonly dragOverlayV = computed(() => {
    if (this.orientation() === 'horizontal') return null;
    const s = this.dragStartFrac(), c = this.dragCurrentFrac();
    if (s === null || c === null) return null;
    return { x: Math.min(s, c) * this.w, width: Math.abs(c - s) * this.w };
  });

  onHPointerDown(ev: PointerEvent): void {
    if (!this.zoomable() || ev.button !== 0) return;
    const rect = (ev.currentTarget as Element).getBoundingClientRect();
    this.dragExtentPx = rect.height;
    const f = fracY(ev.clientY, rect);
    this.dragStartFrac.set(f);
    this.dragCurrentFrac.set(f);
  }

  onHPointerMove(ev: PointerEvent): void {
    if (this.dragStartFrac() === null) return;
    const rect = (ev.currentTarget as Element).getBoundingClientRect();
    this.dragCurrentFrac.set(fracY(ev.clientY, rect));
  }

  onVPointerDown(ev: PointerEvent): void {
    if (!this.zoomable() || ev.button !== 0) return;
    const rect = (ev.currentTarget as Element).getBoundingClientRect();
    this.dragExtentPx = rect.width;
    const f = fracX(ev.clientX, rect);
    this.dragStartFrac.set(f);
    this.dragCurrentFrac.set(f);
    this.hoverIndex.set(null);
  }

  onVPointerMove(ev: PointerEvent): void {
    if (this.dragStartFrac() === null) return;
    const rect = (ev.currentTarget as Element).getBoundingClientRect();
    this.dragCurrentFrac.set(fracX(ev.clientX, rect));
  }

  onPointerUp(): void {
    const s = this.dragStartFrac(), c = this.dragCurrentFrac();
    this.wasDrag = s !== null && c !== null && Math.abs(c - s) > 0.02;
    if (this.wasDrag) {
      this.zoomWindow.set(narrowZoomWindow(this.zoomWindow(), s!, c!));
    }
    this.dragStartFrac.set(null);
    this.dragCurrentFrac.set(null);
    this.hoverIndex.set(null);
  }

  onBarEnter(i: number): void {
    // Ignore hover while a drag-zoom is in progress — mouseenter fires on whatever bar
    // the cursor passes over mid-drag, independent of the pointer-down/up handlers.
    if (this.dragStartFrac() === null) this.hoverIndex.set(i);
  }

  onBarClick(x: string): void {
    // A drag-to-zoom ends with a click on whatever bar the cursor lands on — don't
    // let that also toggle the filter; only a genuine (non-drag) click selects.
    if (!this.filterable() || this.wasDrag) return;
    this.filteredKeys.update(current => toggleInSet(current, x));
  }

  resetFilter(): void {
    this.filteredKeys.set(new Set());
  }

  resetZoom(): void {
    this.zoomWindow.set(FULL_ZOOM_WINDOW);
  }
}

export interface BaseScatterPoint { x: number; y: number; label?: string; }

@Component({
  selector: 'base-scatter-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartZoomBarComponent],
  template: `
    <div class="relative">
      @if (zoomable() || filterable()) {
        <base-chart-zoom-bar [zoomed]="isZoomed()" [filtered]="isFiltered()" [showFilter]="filterable()"
                              (resetZoom)="resetZoom()" (resetFilter)="resetFilter()" />
      }
      <svg [attr.viewBox]="'0 0 ' + w + ' ' + h" width="100%" [attr.height]="height()" preserveAspectRatio="none" role="img" aria-label="Scatter chart"
           (pointerdown)="onPointerDown($event)" (pointermove)="onPointerMove($event)"
           (pointerup)="onPointerUp()" (pointerleave)="onPointerUp()">
        @for (gy of [0,1,2,3]; track gy) {
          <line x1="0" [attr.x2]="w" [attr.y1]="4 + gy * (h - 8) / 3" [attr.y2]="4 + gy * (h - 8) / 3" stroke="var(--color-neutral-200)" stroke-width="1" />
        }
        @for (p of visibleData(); track $index; let i = $index) {
          <circle [attr.cx]="xAt(p.x)" [attr.cy]="yAt(p.y)" r="4"
                  [attr.fill]="i === hoverPoint()?.i ? 'var(--color-action-hover)' : 'var(--color-action)'" opacity="0.75"
                  [style.cursor]="filterable() ? 'pointer' : null"
                  (mouseenter)="onPointEnter(i)" (mouseleave)="hoverIndex.set(null)" (click)="onPointClick(i)" />
        }
        @if (dragOverlay(); as ov) {
          <rect [attr.x]="ov.x" [attr.y]="ov.y" [attr.width]="ov.width" [attr.height]="ov.height" fill="var(--color-action)" opacity="0.12" />
        }
      </svg>
      @if (hoverPoint(); as h2) {
        <div class="absolute pointer-events-none bg-ink-900 text-neutral-0 text-[11px] font-semibold rounded-r-xs px-sp-2 py-1 mono-data"
             [style.left.%]="xAt(visibleData()[h2.i].x) / w * 100" [style.top.%]="(yAt(visibleData()[h2.i].y) - 30) / h * 100" style="transform: translateX(-50%);">
          {{ visibleData()[h2.i].label ?? (visibleData()[h2.i].x + ', ' + visibleData()[h2.i].y) }}
        </div>
      }
    </div>
  `
})
export class BaseScatterChartComponent {
  readonly data = input.required<BaseScatterPoint[]>();
  readonly height = input(160);
  /** Drag-select a rectangle to zoom into that x/y region; shows a "Reset Zoom" link. */
  readonly zoomable = input(true);
  /** Click points to select which show (any number at once); shows a "Reset Filter" link. */
  readonly filterable = input(true);

  protected readonly w = 320; protected readonly h = 160;
  protected readonly hoverIndex = signal<number | null>(null);
  private wasDrag = false;

  protected readonly zoomRect = signal<{ xMin: number; xMax: number; yMin: number; yMax: number } | null>(null);
  protected readonly isZoomed = computed(() => this.zoomRect() !== null);
  /** Any number of points can be selected at once — "isolate" means "show only the selected set". */
  protected readonly filteredPoints = signal<ReadonlySet<BaseScatterPoint>>(new Set());
  protected readonly isFiltered = computed(() => this.filteredPoints().size > 0);
  protected readonly visibleData = computed(() => {
    const z = this.zoomRect();
    const zoomed = !z ? this.data() : this.data().filter(p => p.x >= z.xMin && p.x <= z.xMax && p.y >= z.yMin && p.y <= z.yMax);
    const f = this.filteredPoints();
    return f.size === 0 ? zoomed : zoomed.filter(p => f.has(p));
  });

  // Wrapped in an object so index 0 still reads as "present", and clamped against
  // visibleData() so a hover set mid-drag can't outlive a zoom that shrinks it.
  protected readonly hoverPoint = computed(() => {
    const i = this.hoverIndex();
    return i !== null && i < this.visibleData().length ? { i } : null;
  });

  private readonly fullXDomain = computed(() => {
    const xs = this.data().map(p => p.x);
    return { min: Math.min(0, ...xs), max: Math.max(1, ...xs) };
  });
  private readonly fullYDomain = computed(() => {
    const ys = this.data().map(p => p.y);
    return { min: Math.min(0, ...ys), max: Math.max(1, ...ys) };
  });

  private readonly xDomain = computed(() => {
    const z = this.zoomRect();
    return z ? { min: z.xMin, max: z.xMax } : this.fullXDomain();
  });
  private readonly yDomain = computed(() => {
    const z = this.zoomRect();
    return z ? { min: z.yMin, max: z.yMax } : this.fullYDomain();
  });

  protected xAt(v: number): number {
    const { min, max } = this.xDomain();
    return 8 + ((v - min) / ((max - min) || 1)) * (this.w - 16);
  }
  protected yAt(v: number): number {
    const { min, max } = this.yDomain();
    return this.h - 8 - ((v - min) / ((max - min) || 1)) * (this.h - 16);
  }

  private dataXFromSvgX(sx: number): number {
    const { min, max } = this.xDomain();
    return min + ((sx - 8) / (this.w - 16)) * ((max - min) || 1);
  }
  private dataYFromSvgY(sy: number): number {
    const { min, max } = this.yDomain();
    return min + ((this.h - 8 - sy) / (this.h - 16)) * ((max - min) || 1);
  }

  protected readonly dragStart = signal<{ x: number; y: number } | null>(null);
  protected readonly dragCurrent = signal<{ x: number; y: number } | null>(null);

  protected readonly dragOverlay = computed(() => {
    const a = this.dragStart(), b = this.dragCurrent();
    if (!a || !b) return null;
    return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(b.x - a.x), height: Math.abs(b.y - a.y) };
  });

  onPointerDown(ev: PointerEvent): void {
    if (!this.zoomable() || ev.button !== 0) return;
    const rect = (ev.currentTarget as Element).getBoundingClientRect();
    const p = { x: fracX(ev.clientX, rect) * this.w, y: fracY(ev.clientY, rect) * this.h };
    this.dragStart.set(p);
    this.dragCurrent.set(p);
    this.hoverIndex.set(null);
  }

  onPointEnter(i: number): void {
    // Ignore hover while a drag-select is in progress — mouseenter fires on whatever point
    // the cursor passes over mid-drag, independent of the pointer-down/up handlers.
    if (!this.dragStart()) this.hoverIndex.set(i);
  }

  onPointerMove(ev: PointerEvent): void {
    if (!this.dragStart()) return;
    const rect = (ev.currentTarget as Element).getBoundingClientRect();
    this.dragCurrent.set({ x: fracX(ev.clientX, rect) * this.w, y: fracY(ev.clientY, rect) * this.h });
  }

  onPointerUp(): void {
    const a = this.dragStart(), b = this.dragCurrent();
    this.wasDrag = !!(a && b && Math.hypot(b.x - a.x, b.y - a.y) > 6);
    if (this.wasDrag) {
      const xMin = this.dataXFromSvgX(Math.min(a!.x, b!.x));
      const xMax = this.dataXFromSvgX(Math.max(a!.x, b!.x));
      const yMin = this.dataYFromSvgY(Math.max(a!.y, b!.y));
      const yMax = this.dataYFromSvgY(Math.min(a!.y, b!.y));
      this.zoomRect.set({ xMin, xMax, yMin, yMax });
    }
    this.dragStart.set(null);
    this.dragCurrent.set(null);
    this.hoverIndex.set(null);
  }

  onPointClick(i: number): void {
    // A drag-to-zoom ends with a click on whatever point the cursor lands on — don't
    // let that also toggle the filter; only a genuine (non-drag) click selects.
    if (!this.filterable() || this.wasDrag) return;
    const point = this.visibleData()[i];
    this.filteredPoints.update(current => toggleInSet(current, point));
  }

  resetFilter(): void {
    this.filteredPoints.set(new Set());
  }

  resetZoom(): void {
    this.zoomRect.set(null);
  }
}

@Component({
  selector: 'base-histogram',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartZoomBarComponent],
  template: `
    <div class="relative">
      @if (zoomable() || filterable()) {
        <base-chart-zoom-bar [zoomed]="isZoomed()" [filtered]="isFiltered()" [showFilter]="filterable()"
                              (resetZoom)="resetZoom()" (resetFilter)="resetFilter()" />
      }
      <svg [attr.viewBox]="'0 0 ' + w + ' ' + h" width="100%" [attr.height]="height()" preserveAspectRatio="none" role="img" aria-label="Histogram"
           (pointerdown)="onPointerDown($event)" (pointermove)="onPointerMove($event)"
           (pointerup)="onPointerUp()" (pointerleave)="onPointerUp()">
        @for (b of visibleBins(); track $index; let i = $index) {
          <rect [attr.x]="xAt(i)" [attr.y]="yAt(b.count)" [attr.width]="binWidth()" [attr.height]="h - 4 - yAt(b.count)"
                [attr.fill]="i === hoverPoint()?.i ? 'var(--color-accent-hover)' : 'var(--color-accent)'"
                [style.cursor]="filterable() ? 'pointer' : null"
                (mouseenter)="onBinEnter(i)" (mouseleave)="hoverIndex.set(null)" (click)="onBinClick(b.label)" />
        }
        @if (dragOverlay(); as ov) {
          <rect [attr.x]="ov.x" y="0" [attr.width]="ov.width" [attr.height]="h" fill="var(--color-accent)" opacity="0.14" />
        }
      </svg>
      @if (hoverPoint(); as h2) {
        <div class="absolute pointer-events-none bg-ink-900 text-neutral-0 text-[11px] font-semibold rounded-r-xs px-sp-2 py-1 mono-data"
             [style.left.%]="(xAt(h2.i) + binWidth() / 2) / w * 100" [style.top.%]="(yAt(visibleBins()[h2.i].count) - 26) / h * 100" style="transform: translateX(-50%);">
          {{ visibleBins()[h2.i].label }}: {{ visibleBins()[h2.i].count }}
        </div>
      }
    </div>
  `
})
export class BaseHistogramComponent {
  readonly bins = input.required<{ label: string; count: number }[]>();
  readonly height = input(140);
  /** Drag-select on the chart to zoom into a range of bins; shows a "Reset Zoom" link. */
  readonly zoomable = input(true);
  /** Click bins to select which show (any number at once); shows a "Reset Filter" link. */
  readonly filterable = input(true);

  protected readonly w = 320; protected readonly h = 140;
  protected readonly hoverIndex = signal<number | null>(null);
  private wasDrag = false;

  protected readonly zoomWindow = signal<ChartZoomWindow>(FULL_ZOOM_WINDOW);
  protected readonly isZoomed = computed(() => isZoomedWindow(this.zoomWindow()));
  /** Any number of bins can be selected at once — "isolate" means "show only the selected set". */
  protected readonly filteredKeys = signal<ReadonlySet<string>>(new Set());
  protected readonly isFiltered = computed(() => this.filteredKeys().size > 0);
  protected readonly visibleBins = computed(() => {
    const windowed = sliceWindow(this.bins(), this.zoomWindow());
    const f = this.filteredKeys();
    return f.size === 0 ? windowed : windowed.filter(b => f.has(b.label));
  });

  // Wrapped in an object so index 0 still reads as "present", and clamped against
  // visibleBins() so a hover set mid-drag can't outlive a zoom that shrinks it.
  protected readonly hoverPoint = computed(() => {
    const i = this.hoverIndex();
    return i !== null && i < this.visibleBins().length ? { i } : null;
  });

  private readonly max = computed(() => Math.max(1, ...this.visibleBins().map(b => b.count)));

  protected binWidth = computed(() => this.w / (this.visibleBins().length || 1));
  protected xAt(i: number): number { return i * this.binWidth(); }
  protected yAt(v: number): number { return this.h - 4 - (v / this.max()) * (this.h - 8); }

  protected readonly dragStartFrac = signal<number | null>(null);
  protected readonly dragCurrentFrac = signal<number | null>(null);
  protected readonly dragOverlay = computed(() => {
    const s = this.dragStartFrac(), c = this.dragCurrentFrac();
    if (s === null || c === null) return null;
    return { x: Math.min(s, c) * this.w, width: Math.abs(c - s) * this.w };
  });

  onPointerDown(ev: PointerEvent): void {
    if (!this.zoomable() || ev.button !== 0) return;
    const rect = (ev.currentTarget as Element).getBoundingClientRect();
    const f = fracX(ev.clientX, rect);
    this.dragStartFrac.set(f);
    this.dragCurrentFrac.set(f);
    this.hoverIndex.set(null);
  }

  onPointerMove(ev: PointerEvent): void {
    if (this.dragStartFrac() === null) return;
    const rect = (ev.currentTarget as Element).getBoundingClientRect();
    this.dragCurrentFrac.set(fracX(ev.clientX, rect));
  }

  onPointerUp(): void {
    const s = this.dragStartFrac(), c = this.dragCurrentFrac();
    this.wasDrag = s !== null && c !== null && Math.abs(c - s) > 0.02;
    if (this.wasDrag) {
      this.zoomWindow.set(narrowZoomWindow(this.zoomWindow(), s!, c!));
    }
    this.dragStartFrac.set(null);
    this.dragCurrentFrac.set(null);
    this.hoverIndex.set(null);
  }

  onBinEnter(i: number): void {
    // Ignore hover while a drag-zoom is in progress — mouseenter fires on whatever bin
    // the cursor passes over mid-drag, independent of the pointer-down/up handlers.
    if (this.dragStartFrac() === null) this.hoverIndex.set(i);
  }

  onBinClick(label: string): void {
    // A drag-to-zoom ends with a click on whatever bin the cursor lands on — don't
    // let that also toggle the filter; only a genuine (non-drag) click selects.
    if (!this.filterable() || this.wasDrag) return;
    this.filteredKeys.update(current => toggleInSet(current, label));
  }

  resetFilter(): void {
    this.filteredKeys.set(new Set());
  }

  resetZoom(): void {
    this.zoomWindow.set(FULL_ZOOM_WINDOW);
  }
}

@Component({
  selector: 'base-chart-frame',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel">
      @if (title() || subtitle() || showTableToggle() || exportLabel()) {
        <div class="flex items-start justify-between gap-3 px-sp-4 pt-sp-4 pb-sp-2">
          <span class="min-w-0">
            @if (title()) { <span class="text-xs font-semibold text-ink-900">{{ title() }}</span> }
            @if (subtitle()) { <span class="ml-1.5 text-[11px] text-neutral-400">{{ subtitle() }}</span> }
          </span>
          <span class="flex items-center gap-2 shrink-0">
            @if (showTableToggle()) {
              <button type="button"
                      class="text-[11px] font-semibold text-ink-600 border border-neutral-200 rounded-r-sm px-sp-2 py-1
                             hover:border-action hover:text-action transition-colors inline-flex items-center gap-1"
                      [attr.aria-pressed]="tableView()" (click)="tableView.set(!tableView())">
                <span class="icon-outline" style="font-size:14px;" aria-hidden="true">{{ tableView() ? 'bar_chart' : 'table_view' }}</span>
                {{ tableView() ? 'View as chart' : 'View as table' }}
              </button>
            }
            @if (exportLabel()) {
              <button type="button"
                      class="text-[11px] font-semibold text-ink-600 border border-neutral-200 rounded-r-sm px-sp-2 py-1
                             hover:border-action hover:text-action transition-colors inline-flex items-center gap-1"
                      (click)="exportClick.emit()">
                <span class="icon-outline" style="font-size:14px;" aria-hidden="true">file_download</span>
                {{ exportLabel() }}
              </button>
            }
          </span>
        </div>
      }
      <div class="px-sp-4 pb-sp-4">
        @if (tableView()) { <ng-content select="[table]" /> } @else { <ng-content select="[chart]" /> }
      </div>
      @if (caption()) {
        <div class="px-sp-4 pb-sp-3 pt-sp-2 border-t border-neutral-100 text-[11px] text-neutral-400">{{ caption() }}</div>
      }
    </div>
  `
})
export class BaseChartFrameComponent {
  readonly title = input('');
  readonly subtitle = input('');
  readonly caption = input('');
  readonly exportLabel = input('');
  readonly showTableToggle = input(true);
  readonly tableView = model(false);

  readonly exportClick = output<void>();
}
