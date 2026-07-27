import { DecimalPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BASE MODULE · UI primitives
 * Small, dependency-free building blocks. All props are signal inputs; all
 * events are typed outputs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

@Component({
  selector: 'base-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-1.5 text-[10px] font-bold rounded-full px-2 py-0.5"
          [class]="colorClass()">
      @if (dot()) { <i class="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70"></i> }
      {{ label() }}
    </span>
  `
})
export class BaseBadgeComponent {
  /** Text inside the pill. */
  readonly label = input.required<string>();
  /** Tailwind classes for the pill, e.g. 'bg-emerald-50 text-emerald-600'. */
  readonly colorClass = input('bg-slate-100 text-slate-500');
  /** Show a small dot before the label. */
  readonly dot = input(false);
}

@Component({
  selector: 'base-trend',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, NgClass],
  template: `
    @if (value() === null || value() === undefined) {
      <span class="text-[11px] text-slate-300 font-medium">—</span>
    } @else {
      <span class="inline-flex items-center gap-0.5 text-[11px] font-semibold rounded-full px-2 py-0.5"
            [ngClass]="positive()
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-red-600'">
        {{ value()! > 0 ? '▲' : '▼' }} {{ value()! > 0 ? '+' : '' }}{{ value() | number: digits() }}%
      </span>
    }
  `
})
export class BaseTrendComponent {
  /** Percent change. null/undefined renders an em dash. */
  readonly value = input.required<number | null | undefined>();
  /** When true, an increase is colored red (e.g. alarm counts). */
  readonly badWhenUp = input(false);
  /** Angular number-pipe digits info. */
  readonly digits = input('1.1-1');

  protected readonly positive = computed(() => {
    const v = this.value() ?? 0;
    return this.badWhenUp() ? v <= 0 : v > 0;
  });
}

@Component({
  selector: 'base-kpi-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseTrendComponent],
  template: `
    <div class="panel px-5 py-4 flex flex-col justify-center gap-1"
         [class.cursor-pointer]="clickable()"
         [class.hover:border-indigo-300]="clickable()"
         (click)="clickable() && cardClick.emit()">
      <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ label() }}</span>
      <span class="text-2xl font-bold tracking-tight"
            [class]="accent() ? 'text-indigo-600' : 'text-slate-800'">
        {{ value() }}<span class="text-sm font-semibold text-slate-400 ml-0.5">{{ unit() }}</span>
      </span>
      <span class="flex items-center gap-2">
        @if (trendPct() !== undefined) { <base-trend [value]="trendPct()!" [badWhenUp]="trendBadWhenUp()" /> }
        @if (sub()) { <span class="text-[11px] text-slate-400">{{ sub() }}</span> }
      </span>
    </div>
  `
})
export class BaseKpiCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly unit = input('');
  readonly sub = input('');
  /** Highlight the value in the accent color. */
  readonly accent = input(false);
  /** Optional trend pill. Pass null for '—'; omit to hide. */
  readonly trendPct = input<number | null | undefined>(undefined);
  readonly trendBadWhenUp = input(false);
  /** Makes the card clickable and enables (cardClick). */
  readonly clickable = input(false);

  /** Fired when a clickable card is clicked. */
  readonly cardClick = output<void>();
}

@Component({
  selector: 'base-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel p-6 flex items-center gap-3 text-sm text-slate-400" role="status">
      <span class="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></span>
      {{ message() }}
    </div>
  `
})
export class BaseLoadingComponent {
  readonly message = input('Loading…');
}

@Component({
  selector: 'base-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <span class="text-2xl">{{ icon() }}</span>
      <p class="text-sm font-semibold text-slate-600">{{ title() }}</p>
      @if (hint()) { <p class="text-xs text-slate-400">{{ hint() }}</p> }
      @if (actionLabel()) {
        <button class="btn-ghost mt-1" (click)="action.emit()">{{ actionLabel() }}</button>
      }
    </div>
  `
})
export class BaseEmptyStateComponent {
  readonly icon = input('📭');
  readonly title = input('No data');
  readonly hint = input('');
  /** Optional call-to-action button label; enables (action). */
  readonly actionLabel = input('');

  /** Fired when the call-to-action button is clicked. */
  readonly action = output<void>();
}

/** Dependency-free inline SVG mini chart. Used by the table's 'sparkline' cell
 *  kind, and reusable anywhere on its own. */
@Component({
  selector: 'base-sparkline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="width()" [attr.height]="height()" [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
         class="overflow-visible" aria-hidden="true">
      @if (fill()) {
        <polygon [attr.points]="areaPoints()" [attr.fill]="color()" opacity="0.12" />
      }
      <polyline [attr.points]="linePoints()" fill="none" [attr.stroke]="color()"
                stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      @if (showLast() && last(); as p) {
        <circle [attr.cx]="p.x" [attr.cy]="p.y" r="2" [attr.fill]="color()" />
      }
    </svg>
  `
})
export class BaseSparklineComponent {
  /** Series values, e.g. [92, 95, 91, 97]. */
  readonly data = input.required<number[]>();
  readonly width = input(96);
  readonly height = input(28);
  /** Any CSS color. */
  readonly color = input('#6366f1');
  /** Shade the area under the line. */
  readonly fill = input(true);
  /** Emphasize the most recent point. */
  readonly showLast = input(true);

  private readonly pts = computed(() => {
    const d = this.data();
    if (!d || d.length === 0) return [] as { x: number; y: number }[];
    const w = this.width(), h = this.height(), pad = 2;
    const min = Math.min(...d), max = Math.max(...d);
    const span = max - min || 1;
    const step = d.length > 1 ? (w - pad * 2) / (d.length - 1) : 0;
    return d.map((v, i) => ({
      x: +(pad + i * step).toFixed(2),
      y: +(h - pad - ((v - min) / span) * (h - pad * 2)).toFixed(2)
    }));
  });

  protected readonly linePoints = computed(() => this.pts().map(p => `${p.x},${p.y}`).join(' '));
  protected readonly areaPoints = computed(() => {
    const p = this.pts();
    if (p.length === 0) return '';
    const h = this.height();
    return `${p[0].x},${h} ` + p.map(q => `${q.x},${q.y}`).join(' ') + ` ${p[p.length - 1].x},${h}`;
  });
  protected readonly last = computed(() => {
    const p = this.pts();
    return p.length ? p[p.length - 1] : null;
  });
}
