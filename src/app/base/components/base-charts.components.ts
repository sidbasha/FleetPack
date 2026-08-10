import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

export interface BaseChartPoint { x: string; y: number; }

const CHART_FONT = 'font-family:var(--font-mono);font-variant-numeric:tabular-nums;';

/** Rolling-average line chart with optional target band and area fill. */
@Component({
  selector: 'base-trend-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  template: `
    <div class="relative">
      @if (rolling4w().length || rolling13w().length || target() !== undefined) {
        <div class="flex flex-wrap items-center gap-sp-4 mb-sp-2 text-[11px] text-ink-600">
          <span class="flex items-center gap-1.5"><i class="inline-block w-3 h-0.5 bg-action"></i>{{ seriesLabel() }}</span>
          @if (rolling4w().length) { <span class="flex items-center gap-1.5"><i class="inline-block w-3 h-0.5 bg-action" style="border-top:1.5px dashed var(--color-action);background:none;"></i>4W Rolling</span> }
          @if (rolling13w().length) { <span class="flex items-center gap-1.5"><i class="inline-block w-3 h-0.5" style="border-top:1.5px dotted var(--color-accent);"></i>13W Rolling</span> }
          @if (target() !== undefined) { <span class="flex items-center gap-1.5"><i class="inline-block w-3 h-0.5" style="border-top:1.5px dashed var(--color-neutral-400);"></i>{{ targetLabel() }}</span> }
        </div>
      }
      <svg [attr.viewBox]="'0 0 ' + w + ' ' + h" [attr.width]="'100%'" [attr.height]="height()"
           (mousemove)="onMove($event)" (mouseleave)="hoverIndex.set(null)" role="img" [attr.aria-label]="seriesLabel() + ' trend chart'">
        @for (gy of gridLines(); track gy.y) {
          <line [attr.x1]="padL" [attr.x2]="w - padR" [attr.y1]="gy.y" [attr.y2]="gy.y" stroke="var(--color-neutral-200)" stroke-width="1" />
          <text [attr.x]="padL - 6" [attr.y]="gy.y + 3" text-anchor="end" font-size="9" fill="var(--color-ink-500)" [attr.style]="fontStyle">{{ gy.label }}</text>
        }
        @if (areaPoints(); as ap) { <polygon [attr.points]="ap" fill="var(--color-action)" opacity="0.08" /> }
        @if (target() !== undefined) {
          <line [attr.x1]="padL" [attr.x2]="w - padR" [attr.y1]="targetY()" [attr.y2]="targetY()" stroke="var(--color-neutral-400)" stroke-width="1.5" stroke-dasharray="5 3" />
        }
        @if (rolling13w().length) { <polyline [attr.points]="linePoints(rolling13w())" fill="none" stroke="var(--color-accent)" stroke-width="1.5" stroke-dasharray="1 3" stroke-linecap="round" /> }
        @if (rolling4w().length) { <polyline [attr.points]="linePoints(rolling4w())" fill="none" stroke="var(--color-action)" stroke-width="1.5" stroke-dasharray="5 3" stroke-linecap="round" /> }
        <polyline [attr.points]="linePoints(values())" fill="none" stroke="var(--color-action)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

        @if (hoverIndex(); as i) {
          <line [attr.x1]="xAt(i)" [attr.x2]="xAt(i)" [attr.y1]="padT" [attr.y2]="h - padB" stroke="var(--color-neutral-300)" stroke-width="1" />
          <circle [attr.cx]="xAt(i)" [attr.cy]="yAt(values()[i])" r="3.5" fill="var(--color-action)" stroke="var(--color-neutral-0)" stroke-width="1.5" />
        }
      </svg>
      @if (hoverIndex(); as i) {
        <div class="absolute pointer-events-none bg-ink-900 text-neutral-0 text-[11px] font-semibold rounded-r-xs px-sp-2 py-1 mono-data"
             [style.left.px]="xAt(i)" [style.top.px]="yAt(values()[i]) - 34" style="transform: translateX(-50%);">
          {{ data()[i].x }} · {{ data()[i].y | number: '1.1-1' }}%
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
  readonly rolling4w = input<number[]>([]);
  readonly rolling13w = input<number[]>([]);
  /** Optional dash-dot threshold line, e.g. 95 for a 95% target. */
  readonly target = input<number | undefined>(undefined);
  readonly targetLabel = input('Target');
  readonly seriesLabel = input('Actual');
  readonly height = input(180);
  readonly showArea = input(true);

  protected readonly fontStyle = CHART_FONT;
  protected readonly w = 480;
  protected readonly h = 180;
  protected readonly padL = 32; protected readonly padR = 8; protected readonly padT = 8; protected readonly padB = 8;

  protected readonly hoverIndex = signal<number | null>(null);
  protected readonly values = computed(() => this.data().map(d => d.y));

  private readonly domain = computed(() => {
    const all = [...this.values(), ...this.rolling4w(), ...this.rolling13w()];
    if (this.target() !== undefined) all.push(this.target()!);
    const min = Math.min(0, ...all), max = Math.max(100, ...all);
    return { min, max };
  });

  protected readonly gridLines = computed(() => {
    const { min, max } = this.domain();
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const v = min + ((max - min) * i) / steps;
      return { y: this.yAtValue(v), label: `${Math.round(v)}%` };
    });
  });

  protected readonly tickLabels = computed(() => {
    const d = this.data();
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
    const n = this.data().length;
    const step = n > 1 ? (this.w - this.padL - this.padR) / (n - 1) : 0;
    return this.padL + i * step;
  }

  protected linePoints(series: number[]): string {
    return series.map((v, i) => `${this.xAt(i)},${this.yAtValue(v)}`).join(' ');
  }

  protected readonly areaPoints = computed(() => {
    if (!this.showArea()) return '';
    const v = this.values();
    if (!v.length) return '';
    const base = this.h - this.padB;
    return `${this.xAt(0)},${base} ` + v.map((val, i) => `${this.xAt(i)},${this.yAtValue(val)}`).join(' ') + ` ${this.xAt(v.length - 1)},${base}`;
  });

  onMove(ev: MouseEvent): void {
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const px = ((ev.clientX - rect.left) / rect.width) * this.w;
    const n = this.data().length;
    if (!n) return;
    const step = n > 1 ? (this.w - this.padL - this.padR) / (n - 1) : 1;
    const i = Math.round((px - this.padL) / step);
    this.hoverIndex.set(Math.min(n - 1, Math.max(0, i)));
  }
}

/** Category comparison bar chart, e.g. alarms by module. */
@Component({
  selector: 'base-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <svg [attr.viewBox]="'0 0 ' + w + ' ' + h" width="100%" [attr.height]="height()" (mouseleave)="hoverIndex.set(null)" role="img" [attr.aria-label]="'Bar chart'">
        @for (gy of gridLines(); track gy) {
          <line x1="0" [attr.x2]="w" [attr.y1]="gy" [attr.y2]="gy" stroke="var(--color-neutral-200)" stroke-width="1" />
        }
        @for (d of data(); track d.x; let i = $index) {
          <rect [attr.x]="xAt(i)" [attr.y]="yAt(d.y)" [attr.width]="barWidth()" [attr.height]="h - padB - yAt(d.y)"
                [attr.fill]="i === hoverIndex() ? 'var(--color-action-hover)' : 'var(--color-action)'" rx="2"
                (mouseenter)="hoverIndex.set(i)" />
        }
      </svg>
      @if (hoverIndex(); as i) {
        <div class="absolute pointer-events-none bg-ink-900 text-neutral-0 text-[11px] font-semibold rounded-r-xs px-sp-2 py-1 mono-data"
             [style.left.px]="xAt(i) + barWidth() / 2" [style.top.px]="yAt(data()[i].y) - 26" style="transform: translateX(-50%);">
          {{ data()[i].y }}
        </div>
      }
      <div class="flex mt-1 text-[9px] text-ink-500" [style]="fontStyle">
        @for (d of data(); track d.x) { <span class="flex-1 text-center truncate">{{ d.x }}</span> }
      </div>
    </div>
  `
})
export class BaseBarChartComponent {
  readonly data = input.required<BaseChartPoint[]>();
  readonly height = input(160);

  protected readonly fontStyle = CHART_FONT;
  protected readonly w = 320; protected readonly h = 160; protected readonly padB = 4; protected readonly padT = 8;
  protected readonly hoverIndex = signal<number | null>(null);

  private readonly max = computed(() => Math.max(1, ...this.data().map(d => d.y)));
  protected readonly gridLines = computed(() => Array.from({ length: 4 }, (_, i) => this.padT + (i * (this.h - this.padT - this.padB)) / 3));

  protected barWidth = computed(() => {
    const n = this.data().length || 1;
    return (this.w / n) * 0.6;
  });

  protected xAt(i: number): number {
    const n = this.data().length || 1;
    const slot = this.w / n;
    return i * slot + (slot - this.barWidth()) / 2;
  }

  protected yAt(v: number): number {
    return this.h - this.padB - (v / this.max()) * (this.h - this.padT - this.padB);
  }
}

export interface BaseScatterPoint { x: number; y: number; label?: string; }

/** Correlation chart between two metrics, e.g. MTBR vs utilization. */
@Component({
  selector: 'base-scatter-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <svg [attr.viewBox]="'0 0 ' + w + ' ' + h" width="100%" [attr.height]="height()" role="img" aria-label="Scatter chart">
        @for (gy of [0,1,2,3]; track gy) {
          <line x1="0" [attr.x2]="w" [attr.y1]="4 + gy * (h - 8) / 3" [attr.y2]="4 + gy * (h - 8) / 3" stroke="var(--color-neutral-200)" stroke-width="1" />
        }
        @for (p of data(); track $index; let i = $index) {
          <circle [attr.cx]="xAt(p.x)" [attr.cy]="yAt(p.y)" r="4"
                  [attr.fill]="i === hoverIndex() ? 'var(--color-action-hover)' : 'var(--color-action)'" opacity="0.75"
                  (mouseenter)="hoverIndex.set(i)" (mouseleave)="hoverIndex.set(null)" />
        }
      </svg>
      @if (hoverIndex(); as i) {
        <div class="absolute pointer-events-none bg-ink-900 text-neutral-0 text-[11px] font-semibold rounded-r-xs px-sp-2 py-1 mono-data"
             [style.left.px]="xAt(data()[i].x)" [style.top.px]="yAt(data()[i].y) - 30" style="transform: translateX(-50%);">
          {{ data()[i].label ?? (data()[i].x + ', ' + data()[i].y) }}
        </div>
      }
    </div>
  `
})
export class BaseScatterChartComponent {
  readonly data = input.required<BaseScatterPoint[]>();
  readonly height = input(160);

  protected readonly w = 320; protected readonly h = 160;
  protected readonly hoverIndex = signal<number | null>(null);

  private readonly xDomain = computed(() => {
    const xs = this.data().map(p => p.x);
    return { min: Math.min(0, ...xs), max: Math.max(1, ...xs) };
  });
  private readonly yDomain = computed(() => {
    const ys = this.data().map(p => p.y);
    return { min: Math.min(0, ...ys), max: Math.max(1, ...ys) };
  });

  protected xAt(v: number): number {
    const { min, max } = this.xDomain();
    return 8 + ((v - min) / ((max - min) || 1)) * (this.w - 16);
  }
  protected yAt(v: number): number {
    const { min, max } = this.yDomain();
    return this.h - 8 - ((v - min) / ((max - min) || 1)) * (this.h - 16);
  }
}

/** Distribution of one metric into touching bars (no gap), e.g. downtime-duration buckets. */
@Component({
  selector: 'base-histogram',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <svg [attr.viewBox]="'0 0 ' + w + ' ' + h" width="100%" [attr.height]="height()" role="img" aria-label="Histogram">
        @for (b of bins(); track $index; let i = $index) {
          <rect [attr.x]="xAt(i)" [attr.y]="yAt(b.count)" [attr.width]="binWidth()" [attr.height]="h - 4 - yAt(b.count)"
                [attr.fill]="i === hoverIndex() ? 'var(--color-accent-hover)' : 'var(--color-accent)'"
                (mouseenter)="hoverIndex.set(i)" (mouseleave)="hoverIndex.set(null)" />
        }
      </svg>
      @if (hoverIndex(); as i) {
        <div class="absolute pointer-events-none bg-ink-900 text-neutral-0 text-[11px] font-semibold rounded-r-xs px-sp-2 py-1 mono-data"
             [style.left.px]="xAt(i) + binWidth() / 2" [style.top.px]="yAt(bins()[i].count) - 26" style="transform: translateX(-50%);">
          {{ bins()[i].label }}: {{ bins()[i].count }}
        </div>
      }
    </div>
  `
})
export class BaseHistogramComponent {
  readonly bins = input.required<{ label: string; count: number }[]>();
  readonly height = input(140);

  protected readonly w = 320; protected readonly h = 140;
  protected readonly hoverIndex = signal<number | null>(null);
  private readonly max = computed(() => Math.max(1, ...this.bins().map(b => b.count)));

  protected binWidth = computed(() => this.w / (this.bins().length || 1));
  protected xAt(i: number): number { return i * this.binWidth(); }
  protected yAt(v: number): number { return this.h - 4 - (v / this.max()) * (this.h - 8); }
}
