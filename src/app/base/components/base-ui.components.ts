import { DecimalPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';

/** Fixed-vocabulary status badge — not interactive. */
@Component({
  selector: 'base-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide rounded-r-full px-sp-2 py-0.5"
          [class]="colorClass()">
      @if (dot()) { <i class="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden="true"></i> }
      @if (icon()) { <span aria-hidden="true">{{ icon() }}</span> }
      {{ label() }}
    </span>
  `
})
export class BaseBadgeComponent {
  /** Text inside the pill. */
  readonly label = input.required<string>();
  /** Tailwind classes for the pill, e.g. 'bg-success-surface text-success'. */
  readonly colorClass = input('bg-neutral-100 text-neutral-400');
  /** Show a small dot before the label. */
  readonly dot = input(false);
  /** Optional leading icon glyph/emoji. */
  readonly icon = input('');
}

/** Static, non-removable classification label. */
@Component({
  selector: 'base-tag',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-1 text-[11px] font-medium text-ink-600 bg-neutral-0 border border-neutral-200 rounded-r-xs px-sp-2 py-0.5">
      @if (icon()) { <span aria-hidden="true">{{ icon() }}</span> }
      {{ label() }}
    </span>
  `
})
export class BaseTagComponent {
  readonly label = input.required<string>();
  readonly icon = input('');
}

/** Removable, user-applied filter chip. */
@Component({
  selector: 'base-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-r-full border pl-sp-3 pr-1.5 py-1 transition-colors"
          [class]="removable() ? 'bg-action-surface text-action-hover border-action/30' : 'bg-neutral-0 text-neutral-400 border-neutral-200'">
      {{ label() }}
      @if (removable()) {
        <button type="button" class="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-action/20 transition-colors"
                (click)="removed.emit()" [attr.aria-label]="'Remove ' + label()">✕</button>
      }
    </span>
  `
})
export class BaseChipComponent {
  readonly label = input.required<string>();
  /** Shows the ✕ remove control and enables (removed). */
  readonly removable = input(true);

  readonly removed = output<void>();
}

/** ▲ / ▼ percentage pill. */
@Component({
  selector: 'base-trend',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, NgClass],
  template: `
    @if (value() === null || value() === undefined) {
      <span class="text-[11px] text-neutral-300 font-medium">—</span>
    } @else {
      <span class="inline-flex items-center gap-0.5 text-[11px] font-semibold rounded-r-full px-sp-2 py-0.5"
            [ngClass]="positive()
              ? 'bg-success-surface text-success'
              : 'bg-error-surface text-error'">
        {{ value()! > 0 ? '▲' : '▼' }} {{ value()! > 0 ? '+' : '' }}{{ value() | number: digits() }}%
      </span>
    }
  `
})
export class BaseTrendComponent {
  /** Percent change. null/undefined renders an em dash. */
  readonly value = input.required<number | null | undefined>();
  /** Colors an increase red instead of green, e.g. for alarm counts. */
  readonly badWhenUp = input(false);
  /** Angular number-pipe digits info. */
  readonly digits = input('1.1-1');

  protected readonly positive = computed(() => {
    const v = this.value() ?? 0;
    return this.badWhenUp() ? v <= 0 : v > 0;
  });
}

/** KPI tile: label, value, optional trend and click target. */
@Component({
  selector: 'base-kpi-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseTrendComponent],
  template: `
    <div class="panel px-sp-5 py-sp-4 flex flex-col justify-center gap-1 transition-colors"
         [class.cursor-pointer]="clickable()"
         [class.hover:border-action]="clickable()"
         [class.ring-2]="selected()"
         [class.ring-action]="selected()"
         (click)="clickable() && cardClick.emit()">
      <span class="flex items-center gap-1 text-caption text-neutral-400">
        {{ label() }}
        @if (infoTooltip()) { <span class="text-neutral-300 cursor-help" [attr.title]="infoTooltip()" aria-hidden="true">ⓘ</span> }
      </span>
      <span class="font-display text-display-lg tabular-nums" [class]="accent() ? 'text-action' : 'text-ink-900'">
        {{ value() }}<span class="text-sm font-semibold text-neutral-400 ml-0.5">{{ unit() }}</span>
      </span>
      <span class="flex items-center gap-2">
        @if (trendPct() !== undefined) { <base-trend [value]="trendPct()!" [badWhenUp]="trendBadWhenUp()" /> }
        @if (sub()) { <span class="text-[11px] text-neutral-400">{{ sub() }}</span> }
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
  /** Selection state (border + implied checkbox) for bulk-select grids. */
  readonly selected = input(false);
  /** Optional info tooltip next to the label. */
  readonly infoTooltip = input('');

  readonly cardClick = output<void>();
}

/** Borderless horizontal row of metrics, lighter than a KPI grid. */
@Component({
  selector: 'base-stat-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-baseline gap-x-sp-8 gap-y-sp-3">
      @for (s of stats(); track s.label) {
        <div class="flex flex-col gap-0.5">
          <span class="mono-data text-display-md font-normal text-ink-900">{{ s.value }}</span>
          <span class="text-caption text-neutral-400">{{ s.label }}</span>
        </div>
      }
    </div>
  `
})
export class BaseStatBarComponent {
  readonly stats = input.required<{ value: string | number; label: string }[]>();
}

@Component({
  selector: 'base-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel p-sp-6 flex items-center gap-3 text-sm text-neutral-400" role="status">
      <span class="w-4 h-4 rounded-full border-2 border-action border-t-transparent animate-spin" aria-hidden="true"></span>
      {{ message() }}
    </div>
  `
})
export class BaseLoadingComponent {
  readonly message = input('Loading…');
}

/** Empty-state placeholder; `kind` picks a default icon + title. */
@Component({
  selector: 'base-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <span class="text-2xl" aria-hidden="true">{{ icon() || defaultIcon() }}</span>
      <p class="font-display text-display-md text-ink-700">{{ title() || defaultTitle() }}</p>
      @if (hint()) { <p class="text-body-sm text-neutral-400 max-w-xs">{{ hint() }}</p> }
      @if (actionLabel()) {
        <button class="btn-ghost mt-1" (click)="action.emit()">{{ actionLabel() }}</button>
      }
    </div>
  `
})
export class BaseEmptyStateComponent {
  readonly kind = input<'no-results' | 'no-access' | 'not-configured' | 'custom'>('no-results');
  readonly icon = input('');
  readonly title = input('');
  readonly hint = input('');
  /** Optional call-to-action button label; enables (action). */
  readonly actionLabel = input('');

  readonly action = output<void>();

  protected readonly defaultIcon = computed(() => ({
    'no-results': '🔍', 'no-access': '🔒', 'not-configured': '🚀', custom: '📭'
  }[this.kind()]));

  protected readonly defaultTitle = computed(() => ({
    'no-results': 'No results', 'no-access': 'No access', 'not-configured': 'Not configured yet', custom: 'No data'
  }[this.kind()]));
}

/** Inline SVG mini line chart — no charting library. */
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
  /** Any CSS color; defaults to the Action token. */
  readonly color = input('var(--color-action)');
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

/** Single-line row with a hairline divider; use a table for multi-column rows. */
@Component({
  selector: 'base-list-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-sp-3 px-sp-3 py-sp-3 border-b border-neutral-100 last:border-b-0 transition-colors"
         [class.cursor-pointer]="clickable()"
         [class.hover:bg-neutral-50]="clickable()"
         (click)="clickable() && itemClick.emit()">
      @if (icon()) { <span class="text-action shrink-0" aria-hidden="true">{{ icon() }}</span> }
      <span class="mono-data flex-1 truncate text-ink-700">{{ label() }}</span>
      @if (meta()) { <span class="text-[11px] text-neutral-400 shrink-0">{{ meta() }}</span> }
      @if (clickable()) { <span class="text-neutral-300 shrink-0" aria-hidden="true">›</span> }
    </div>
  `
})
export class BaseListItemComponent {
  readonly label = input.required<string>();
  readonly icon = input('');
  readonly meta = input('');
  readonly clickable = input(false);

  readonly itemClick = output<void>();
}

/** Collapsible section; siblings are independent, not single-open-only. */
@Component({
  selector: 'base-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="border border-neutral-200 rounded-r-md overflow-hidden">
      <button type="button" [attr.aria-expanded]="open()"
              class="w-full flex items-center justify-between px-sp-4 py-sp-3 text-left bg-neutral-0 hover:bg-neutral-50 transition-colors"
              (click)="toggle()">
        <span class="text-xs font-semibold text-ink-700">{{ title() }}</span>
        <span class="text-neutral-400 transition-transform" style="transition-duration: var(--mo-slow);" [style.transform]="open() ? 'rotate(180deg)' : 'rotate(0deg)'" aria-hidden="true">▾</span>
      </button>
      @if (open()) {
        <div class="px-sp-4 py-sp-3 text-xs text-ink-600 border-t border-neutral-100">
          <ng-content />
        </div>
      }
    </div>
  `
})
export class BaseAccordionComponent {
  readonly title = input.required<string>();
  /** Two-way bound expanded state: [(open)]. */
  readonly open = model(false);

  toggle(): void { this.open.update(o => !o); }
}

/** Plain or labeled horizontal rule. */
@Component({
  selector: 'base-divider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (label()) {
      <div class="flex items-center gap-sp-3 text-[11px] text-neutral-400" role="separator">
        <span class="flex-1 border-t border-neutral-200"></span>
        {{ label() }}
        <span class="flex-1 border-t border-neutral-200"></span>
      </div>
    } @else {
      <hr class="border-t border-neutral-200" role="separator" />
    }
  `
})
export class BaseDividerComponent {
  readonly label = input('');
}
