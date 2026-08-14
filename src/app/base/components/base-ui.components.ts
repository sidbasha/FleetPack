import { DecimalPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { BaseButtonComponent } from './base-form.components';

/** Shared semantic tone vocabulary for base-badge/base-chip. Tint = default; solid is reserved
 *  for a count or a state that must dominate the row. */
export type BaseTone = 'neutral' | 'action' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'brand';

const TONE_TINT: Record<BaseTone, string> = {
  neutral: 'bg-neutral-100 text-ink-600',
  action: 'bg-action-surface text-action',
  accent: 'bg-accent-surface text-accent',
  info: 'bg-info-surface text-info',
  success: 'bg-success-surface text-success',
  warning: 'bg-warning-surface text-warning',
  error: 'bg-error-surface text-error-text',
  brand: 'bg-brand-surface text-brand'
};
const TONE_SOLID: Record<BaseTone, string> = {
  neutral: 'bg-ink-700 text-neutral-0',
  action: 'bg-action text-neutral-0',
  accent: 'bg-accent text-neutral-0',
  info: 'bg-info text-neutral-0',
  success: 'bg-success text-neutral-0',
  warning: 'bg-warning text-neutral-0',
  error: 'bg-error text-neutral-0',
  brand: 'bg-brand text-neutral-0'
};
const TONE_DOT: Record<BaseTone, string> = {
  neutral: 'bg-neutral-400', action: 'bg-action', accent: 'bg-accent', info: 'bg-info',
  success: 'bg-success', warning: 'bg-warning', error: 'bg-error', brand: 'bg-brand'
};

/** Reports state the system owns — never clickable or dismissible (that's `<base-chip>`).
 *  Three shapes share this one component: a status pill (label, optionally [dot]/[icon]),
 *  a numeric/notification pill ([count], auto-capped at "99+"), and a bare [dot] with no
 *  label for "something changed" where a number would be noise (e.g. next to a bell icon —
 *  give the *host* control the accessible name: `aria-label="Notifications, 12 unread"`,
 *  and set [hiddenFromA11y] on the badge itself so the count isn't announced twice). */
@Component({
  selector: 'base-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (dot() && !label() && count() === undefined) {
      <i class="inline-block w-2 h-2 rounded-full ring-2 ring-neutral-0" [class]="TONE_DOT[tone()]"
         [attr.aria-hidden]="hiddenFromA11y() ? 'true' : null" aria-hidden="true"></i>
    } @else if (count() !== undefined) {
      <span class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold tabular-nums rounded-r-full"
            [class]="toneClass()" [attr.aria-hidden]="hiddenFromA11y() ? 'true' : null">{{ displayCount() }}</span>
    } @else {
      <span class="inline-flex items-center font-bold uppercase tracking-wide" [class]="toneClass() + ' ' + sizeClass() + ' ' + shapeClass()">
        @if (dot()) { <i class="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70 mr-1.5" aria-hidden="true"></i> }
        @if (icon()) { <span class="mr-1" aria-hidden="true">{{ icon() }}</span> }
        {{ label() }}
      </span>
    }
  `
})
export class BaseBadgeComponent {
  /** Text inside the pill. Leave unset with [count] or a bare [dot] instead. */
  readonly label = input('');
  /** Semantic tone; ignored when [colorClass] is set explicitly. */
  readonly tone = input<BaseTone>('neutral');
  /** Tailwind classes for the pill, e.g. 'bg-success-surface text-success' — overrides [tone]
   *  entirely when set, for callers mapping an arbitrary status vocabulary (see `badgeClassMap`
   *  on `<base-table>`'s `badge` cell kind). */
  readonly colorClass = input('');
  /** Solid fill instead of a tint — reserve for a count or a state that must dominate the row. */
  readonly solid = input(false);
  /** Show a small dot before the label (or, with no [label]/[count], a bare notification dot). */
  readonly dot = input(false);
  /** Optional leading icon glyph/emoji. */
  readonly icon = input('');
  /** Numeric/notification mode — renders a solid, tabular-nums count pill instead of [label].
   *  Values over 99 display as "99+"; past that the exact number stops being actionable. */
  readonly count = input<number | undefined>(undefined);
  readonly shape = input<'pill' | 'square'>('pill');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  /** Hides this badge from assistive tech — set when the host control already carries the full
   *  accessible name (e.g. a bell button labelled "Notifications, 12 unread"). */
  readonly hiddenFromA11y = input(false);

  protected readonly TONE_DOT = TONE_DOT;

  protected readonly toneClass = computed(() => this.colorClass() || (this.solid() || this.count() !== undefined ? TONE_SOLID : TONE_TINT)[this.tone()]);

  protected readonly displayCount = computed(() => {
    const c = this.count();
    return c === undefined ? '' : c > 99 ? '99+' : String(c);
  });

  protected readonly shapeClass = computed(() => this.shape() === 'square' ? 'rounded-r-xs' : 'rounded-r-full');

  protected readonly sizeClass = computed(() => ({
    sm: 'text-[9px] px-sp-1.5 py-0.5', md: 'text-[10px] px-sp-2 py-0.5', lg: 'text-[11px] px-sp-2.5 py-1'
  }[this.size()]));
}

/** Records a label a *person* applied — square-cornered on purpose, so at a glance across a
 *  dense row it's obvious whether a label came from the system (`<base-badge>`, pill-shaped)
 *  or from a person. Not clickable; [removable] only withdraws the applied label, it doesn't
 *  make the tag a filter control (that's `<base-chip selectable>`). */
@Component({
  selector: 'base-tag',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-1 text-[11px] font-medium rounded-r-xs px-sp-2 py-0.5 border transition-colors"
          [class]="disabled() ? 'bg-neutral-50 border-neutral-100 text-neutral-300' : 'bg-neutral-0 border-neutral-200 text-ink-600'">
      @if (dot()) { <i class="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-60" aria-hidden="true"></i> }
      @if (icon()) { <span aria-hidden="true">{{ icon() }}</span> }
      {{ label() }}
      @if (removable() && !disabled()) {
        <button type="button" class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-r-xs text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                (click)="removed.emit()" [attr.aria-label]="'Remove ' + label()">✕</button>
      }
    </span>
  `
})
export class BaseTagComponent {
  readonly label = input.required<string>();
  readonly icon = input('');
  /** Small leading dot — a lighter-weight alternative to [icon]. */
  readonly dot = input(false);
  /** Muted/inert rendering for a label that no longer applies, e.g. "Archived". Suppresses [removable]. */
  readonly disabled = input(false);
  /** Shows a ✕ to withdraw the applied label and enables (removed). */
  readonly removable = input(false);

  readonly removed = output<void>();
}

/** A control: filter chips (multi-select, each independent), choice chips (one of N, mutually
 *  exclusive), and dismissible chips (applied filters). The parent owns selection state either
 *  way — pass [selectable] + [selected] and manage a set (filters) or a single value (choices)
 *  in a `@for`; the default (non-selectable) mode is the plain dismissible chip. */
@Component({
  selector: 'base-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (selectable()) {
      <button type="button" [disabled]="disabled()" [attr.aria-pressed]="selected()"
              class="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-r-full border px-sp-3 py-1 transition-colors
                     outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-1
                     disabled:opacity-40 disabled:cursor-not-allowed"
              [class]="selected() ? 'bg-action-surface text-action-hover border-action/40' : 'bg-neutral-0 text-ink-600 border-neutral-200 hover:border-action hover:text-action'"
              (click)="clicked.emit()">
        @if (selected()) { <span aria-hidden="true">✓</span> }
        {{ label() }}
        @if (count() !== undefined) {
          <span class="inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold rounded-r-full"
                [class]="selected() ? 'bg-action text-neutral-0' : 'bg-neutral-100 text-neutral-500'">{{ count() }}</span>
        }
      </button>
    } @else {
      <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-r-full border pl-sp-3 pr-1.5 py-1 transition-colors"
            [class]="removable() ? 'bg-action-surface text-action-hover border-action/30' : 'bg-neutral-0 text-neutral-400 border-neutral-200'">
        {{ label() }}
        @if (removable()) {
          <button type="button" class="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-action/20 transition-colors"
                  (click)="removed.emit()" [attr.aria-label]="'Remove ' + label()">✕</button>
        }
      </span>
    }
  `
})
export class BaseChipComponent {
  readonly label = input.required<string>();
  /** Shows the ✕ remove control and enables (removed) — the default, dismissible-chip mode. */
  readonly removable = input(true);
  /** Renders a real `<button>` toggle for filter/choice chips instead of the dismissible pill.
   *  Pair with [selected] + (clicked); the component doesn't manage selection state itself. */
  readonly selectable = input(false);
  readonly selected = input(false);
  readonly disabled = input(false);
  /** Optional trailing count, e.g. "Equipment safety 12". */
  readonly count = input<number | undefined>(undefined);

  /** Fired when the ✕ is clicked in dismissible mode. */
  readonly removed = output<void>();
  /** Fired on press when [selectable] is true. */
  readonly clicked = output<void>();
}

/** sm/md/lg sizing shared by `<base-avatar>` and `<base-avatar-group>`. */
function avatarSizeClass(size: 'sm' | 'md' | 'lg'): string {
  return { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-[11px]', lg: 'w-11 h-11 text-sm' }[size];
}

const AVATAR_PALETTE = [
  'bg-neutral-100 text-ink-600',
  'bg-action-surface text-action',
  'bg-accent-surface text-accent',
  'bg-info-surface text-info',
  'bg-success-surface text-success',
  'bg-warning-surface text-warning'
];

/** Deterministic tint from [name]/[initials] unless [colorClass] is set — same identity always
 *  renders the same color across the app. */
function avatarTone(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Person identity chip — initials on a deterministic tint. Use `<base-avatar-group>` to stack
 *  a handful with a "+N" overflow instead of repeating this one. */
@Component({
  selector: 'base-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center justify-center rounded-full font-bold shrink-0 select-none"
          [class]="sizeClass() + ' ' + toneClass()" [attr.title]="name() || null" [attr.aria-label]="name() || null" role="img">
      {{ displayInitials() }}
    </span>
  `
})
export class BaseAvatarComponent {
  /** Full name — initials and tint derive from it unless overridden below. */
  readonly name = input('');
  /** Explicit 1–2 character initials, overriding the ones derived from [name]. */
  readonly initials = input('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  /** Explicit Tailwind classes, overriding the tint derived from [name]. */
  readonly colorClass = input('');

  protected readonly displayInitials = computed(() => this.initials() || deriveInitials(this.name()));
  protected readonly sizeClass = computed(() => avatarSizeClass(this.size()));
  protected readonly toneClass = computed(() => this.colorClass() || avatarTone(this.name() || this.displayInitials()));
}

export interface BaseAvatarItem {
  name?: string;
  initials?: string;
  colorClass?: string;
}

/** Overlapping avatar stack with a "+N" overflow badge past [max]. */
@Component({
  selector: 'base-avatar-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseAvatarComponent],
  template: `
    <div class="flex items-center">
      @for (a of visible(); track $index; let first = $first) {
        <base-avatar [name]="a.name || ''" [initials]="a.initials || ''" [size]="size()" [colorClass]="a.colorClass || ''"
                     [class]="(first ? '' : '-ml-2') + ' ring-2 ring-neutral-0 rounded-full'" />
      }
      @if (overflowCount() > 0) {
        <span class="-ml-2 inline-flex items-center justify-center rounded-full font-bold shrink-0 bg-neutral-100 text-neutral-500 ring-2 ring-neutral-0"
              [class]="sizeClass()">+{{ overflowCount() }}</span>
      }
    </div>
  `
})
export class BaseAvatarGroupComponent {
  readonly items = input.required<BaseAvatarItem[]>();
  /** How many avatars to render before collapsing the rest into "+N". */
  readonly max = input(4);
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected readonly visible = computed(() => this.items().slice(0, this.max()));
  protected readonly overflowCount = computed(() => Math.max(0, this.items().length - this.max()));
  protected readonly sizeClass = computed(() => avatarSizeClass(this.size()));
}

/** ▲ / ▼ percentage pill. Up isn't automatically good — [badWhenUp] declares which direction is
 *  favourable, and the arrow is colored from that, not from the sign alone. */
@Component({
  selector: 'base-trend',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, NgClass],
  template: `
    @if (value() === null || value() === undefined) {
      <span class="text-[11px] text-neutral-300 font-medium">—</span>
    } @else if (value() === 0) {
      <span class="inline-flex items-center gap-0.5 text-[11px] font-semibold rounded-r-full px-sp-2 py-0.5 bg-neutral-100 text-neutral-400">
        → {{ zeroLabel() }}
      </span>
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
  /** Percent change. null/undefined renders an em dash; exactly 0 renders [zeroLabel] neutrally
   *  instead of a false ▼ (0 is not "down"). */
  readonly value = input.required<number | null | undefined>();
  /** Colors an increase red instead of green, e.g. for alarm counts. */
  readonly badWhenUp = input(false);
  /** Angular number-pipe digits info. */
  readonly digits = input('1.1-1');
  /** Label shown for an exact 0 change. */
  readonly zeroLabel = input('No change');

  protected readonly positive = computed(() => {
    const v = this.value() ?? 0;
    return this.badWhenUp() ? v <= 0 : v > 0;
  });
}

const RAIL_CLASS: Record<'none' | 'success' | 'warning' | 'error' | 'info', string> = {
  none: '',
  success: 'border-l-4 border-l-success',
  warning: 'border-l-4 border-l-warning',
  error: 'border-l-4 border-l-error',
  info: 'border-l-4 border-l-info'
};

/** KPI tile: the atom of every dashboard — one number, one direction, one comparison window.
 *  A second number that matters equally is a second tile, never a smaller figure squeezed
 *  underneath. A missing metric is [value]="'—'" with a [sub] reason, never a bare 0 — 0 is a
 *  measurement, missing is not. */
@Component({
  selector: 'base-kpi-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseTrendComponent, BaseButtonComponent],
  template: `
    <div class="panel px-sp-5 py-sp-4 flex flex-col justify-center gap-1 transition-all"
         [class]="(errorMessage() ? 'border-error' : railClass()) + (clickable() && !errorMessage() ? ' cursor-pointer hover:shadow-e2 hover:-translate-y-0.5 hover:border-action' : '')"
         [class.ring-2]="selected()"
         [class.ring-action]="selected()"
         (click)="clickable() && !errorMessage() && cardClick.emit()">
      <span class="flex items-center gap-1 text-caption" [class]="errorMessage() ? 'text-error' : 'text-neutral-400'">
        {{ label() }}
        @if (errorMessage()) {
          <span class="icon-outline" style="font-size:12px;" aria-hidden="true">warning</span>
        } @else if (infoTooltip()) {
          <span class="text-neutral-300 cursor-help" [attr.title]="infoTooltip()" aria-hidden="true">ⓘ</span>
        }
      </span>

      @if (errorMessage()) {
        <span class="font-display text-display-lg text-ink-900">{{ unavailableLabel() }}</span>
        <span class="flex items-center justify-between gap-2">
          <span class="text-[11px] text-error">{{ errorMessage() }}</span>
          <base-button variant="text" size="sm" (clicked)="retry.emit()">{{ retryLabel() }}</base-button>
        </span>
      } @else {
        <span class="font-display text-display-lg tabular-nums" [class]="accent() ? 'text-action' : 'text-ink-900'">
          {{ value() }}<span class="text-sm font-semibold text-neutral-400 ml-0.5">{{ unit() }}</span>
        </span>
        <span class="flex items-center gap-2">
          @if (trendPct() !== undefined) { <base-trend [value]="trendPct()!" [badWhenUp]="trendBadWhenUp()" /> }
          @if (sub()) { <span class="text-[11px] text-neutral-400">{{ sub() }}</span> }
        </span>
      }
    </div>
  `
})
export class BaseKpiCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly unit = input('');
  readonly sub = input('');
  /** Highlight the value itself in the accent color — a single hero tile, not a threshold signal. */
  readonly accent = input(false);
  /** Colored left rail encoding a threshold state without touching the number's own color — a
   *  fleet of tiles reads at a glance without every number turning into a traffic light. */
  readonly railTone = input<'none' | 'success' | 'warning' | 'error' | 'info'>('none');
  /** Optional trend pill. Pass null for '—'; omit to hide; pass 0 for a neutral "no change". */
  readonly trendPct = input<number | null | undefined>(undefined);
  readonly trendBadWhenUp = input(false);
  /** Makes the card clickable and enables (cardClick) — cards sit at e1 and only lift to e2 on
   *  hover when they're actually interactive; a static tile never moves. */
  readonly clickable = input(false);
  /** Selection state (border + implied checkbox) for bulk-select grids. */
  readonly selected = input(false);
  /** Optional info tooltip next to the label. */
  readonly infoTooltip = input('');
  /** Set when this one panel's data failed to load — a page rarely fails all at once, and this
   *  tile shouldn't take the rest of the screen with it. Swaps [value]/[trendPct]/[sub] for
   *  [unavailableLabel] + this message + a retry link, and outlines the whole tile in red
   *  (unlike [railTone], which only touches the left edge). */
  readonly errorMessage = input('');
  readonly unavailableLabel = input('Unavailable');
  readonly retryLabel = input('Retry this panel');

  readonly cardClick = output<void>();
  /** Fired when the retry link is clicked in the error state. */
  readonly retry = output<void>();

  protected readonly railClass = computed(() => RAIL_CLASS[this.railTone()]);
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

/** Generic container that groups content belonging together — an icon+title header, projected
 *  body, and an optional footer row (typically a link on the left, a status badge on the right;
 *  just place both as children, the row is a flex justify-between). Project header-trailing
 *  content (an overflow menu, a "Summary" badge) into `[actions]`.
 *
 *  A card is only [clickable] if the *whole* card leads to one destination — two links inside a
 *  clickable card hides one of them from keyboard users, so don't mix (click) on the card with
 *  focusable links in the body. Cards sit at elevation e1 and only lift to e2 + 2px on hover
 *  when they're actually interactive; a static card never moves. */
@Component({
  selector: 'base-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel flex flex-col transition-all"
         [class]="clickable() ? 'cursor-pointer hover:shadow-e2 hover:-translate-y-0.5 hover:border-action' : ''"
         (click)="clickable() && cardClick.emit()">
      @if (title() || icon()) {
        <div class="flex items-center justify-between gap-2 px-sp-4 pt-sp-4 pb-sp-2">
          <span class="flex items-center gap-2 min-w-0">
            @if (icon()) {
              <span class="shrink-0 w-7 h-7 rounded-r-sm inline-flex items-center justify-center" [class]="iconToneClass()">
                <span class="icon-outline" style="font-size:16px;" aria-hidden="true">{{ icon() }}</span>
              </span>
            }
            <span class="font-semibold text-ink-900 text-xs truncate">{{ title() }}</span>
          </span>
          <ng-content select="[actions]" />
        </div>
      }
      <div class="px-sp-4 pb-sp-3 text-xs text-ink-600 leading-relaxed empty:hidden">
        <ng-content />
      </div>
      <div class="px-sp-4 pb-sp-4 flex items-center justify-between gap-2 empty:hidden">
        <ng-content select="[footer]" />
      </div>
    </div>
  `
})
export class BaseCardComponent {
  readonly title = input('');
  /** Material Symbols name, e.g. 'show_chart' — shown in a small tinted square before the title. */
  readonly icon = input('');
  readonly iconTone = input<BaseTone>('action');
  /** Makes the whole card one click target and enables (cardClick). */
  readonly clickable = input(false);

  readonly cardClick = output<void>();

  protected readonly iconToneClass = computed(() => TONE_TINT[this.iconTone()]);
}

/** A spinner is only correct when the shape of what's coming is genuinely unknown — reach for
 *  `<base-skeleton>` instead the moment that shape is known, so nothing reflows when data
 *  arrives. [compact] drops the panel wrapper for inline use (a row, a card, next to a label). */
@Component({
  selector: 'base-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (compact()) {
      <span class="inline-flex items-center gap-2 text-neutral-400" [class]="sizeClass().text" role="status">
        <ng-container [ngTemplateOutlet]="icon" />
        @if (message()) { {{ message() }} }
      </span>
    } @else {
      <div class="panel p-sp-6 flex items-center gap-3 text-sm text-neutral-400" role="status">
        <ng-container [ngTemplateOutlet]="icon" />
        {{ message() }}
      </div>
    }
    <ng-template #icon>
      @if (variant() === 'dots') {
        <span class="inline-flex items-center gap-0.5" aria-hidden="true">
          <span class="rounded-full bg-current animate-bounce" [class]="sizeClass().dot" style="animation-delay: 0ms"></span>
          <span class="rounded-full bg-current animate-bounce" [class]="sizeClass().dot" style="animation-delay: 150ms"></span>
          <span class="rounded-full bg-current animate-bounce" [class]="sizeClass().dot" style="animation-delay: 300ms"></span>
        </span>
      } @else {
        <span class="rounded-full border-2 border-action border-t-transparent animate-spin shrink-0" [class]="sizeClass().spinner" aria-hidden="true"></span>
      }
    </ng-template>
  `,
  imports: [NgTemplateOutlet]
})
export class BaseLoadingComponent {
  readonly message = input('Loading…');
  readonly variant = input<'spinner' | 'dots'>('spinner');
  readonly size = input<'sm' | 'md'>('md');
  /** Drops the bordered panel wrapper for inline use. */
  readonly compact = input(false);

  protected readonly sizeClass = computed(() => this.size() === 'sm'
    ? { spinner: 'w-3 h-3', dot: 'w-1 h-1', text: 'text-xs' }
    : { spinner: 'w-4 h-4', dot: 'w-1.5 h-1.5', text: 'text-sm' });
}

/** An empty state uses neutral tone and an inviting action — red is reserved for something
 *  that actually went wrong (see `<base-error-page>` for that). `kind` picks a default icon +
 *  title for the three situations that most often get collapsed into one generic screen: a
 *  collection that's genuinely empty ('no-data'), a search/filter that matched nothing
 *  ('no-results'), and a time window with nothing in it ('out-of-range'). */
@Component({
  selector: 'base-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseButtonComponent],
  template: `
    <div class="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <span class="icon-outline text-neutral-300" style="font-size:32px;" aria-hidden="true">{{ icon() || defaultIcon() }}</span>
      <p class="font-display text-display-md text-ink-700">{{ title() || defaultTitle() }}</p>
      @if (hint()) { <p class="text-body-sm text-neutral-400 max-w-xs">{{ hint() }}</p> }
      @if (actionLabel() || secondaryActionLabel()) {
        <div class="flex items-center gap-2 mt-1">
          @if (actionLabel()) {
            <base-button [variant]="actionVariant()" size="sm" (clicked)="action.emit()">{{ actionLabel() }}</base-button>
          }
          @if (secondaryActionLabel()) {
            <base-button variant="secondary" size="sm" (clicked)="secondaryAction.emit()">{{ secondaryActionLabel() }}</base-button>
          }
        </div>
      }
    </div>
  `
})
export class BaseEmptyStateComponent {
  readonly kind = input<'no-results' | 'no-access' | 'no-data' | 'out-of-range' | 'not-configured' | 'custom'>('no-results');
  readonly icon = input('');
  readonly title = input('');
  readonly hint = input('');
  /** Optional call-to-action button label; enables (action). Rendered as [actionVariant]
   *  (default 'secondary' — a recovery action, not a primary one) — pass 'primary' for a
   *  genuine first-time setup action like "Register tool". */
  readonly actionLabel = input('');
  readonly actionVariant = input<'primary' | 'secondary'>('secondary');
  /** Second, lower-emphasis action beside [actionLabel] — e.g. "Clear search" next to "Clear filters". */
  readonly secondaryActionLabel = input('');

  readonly action = output<void>();
  readonly secondaryAction = output<void>();

  protected readonly defaultIcon = computed(() => ({
    'no-results': 'search_off',
    'no-access': 'lock',
    'no-data': 'post_add',
    'out-of-range': 'event_busy',
    'not-configured': 'rocket_launch',
    custom: 'inbox'
  }[this.kind()]));

  protected readonly defaultTitle = computed(() => ({
    'no-results': 'No results',
    'no-access': 'No access',
    'no-data': 'No data yet',
    'out-of-range': 'No data in this window',
    'not-configured': 'Not configured yet',
    custom: 'No data'
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

/** Row with a hairline divider; use a table for multi-column rows. [subLabel] stacks a second
 *  line under [label] (e.g. "Fab 8 · Dresden · 4h 12m"); project a trailing status pill into
 *  `[status]` — typically a `<base-badge>`. */
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
      <span class="flex-1 min-w-0">
        <span class="mono-data block truncate text-ink-700">{{ label() }}</span>
        @if (subLabel()) { <span class="block truncate text-[11px] text-neutral-400 mt-0.5">{{ subLabel() }}</span> }
      </span>
      @if (meta()) { <span class="text-[11px] text-neutral-400 shrink-0">{{ meta() }}</span> }
      <ng-content select="[status]" />
      @if (clickable()) { <span class="text-neutral-300 shrink-0" aria-hidden="true">›</span> }
    </div>
  `
})
export class BaseListItemComponent {
  readonly label = input.required<string>();
  /** Second line under [label] — a row becomes two-line the moment this is set. */
  readonly subLabel = input('');
  readonly icon = input('');
  readonly meta = input('');
  readonly clickable = input(false);

  readonly itemClick = output<void>();
}

/** Collapsible section; siblings are independent, not single-open-only. Project a trailing
 *  status pill into `[status]` — typically a `<base-badge>` — it renders before the chevron. */
@Component({
  selector: 'base-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="border border-neutral-200 rounded-r-md overflow-hidden">
      <button type="button" [attr.aria-expanded]="open()"
              class="w-full flex items-center justify-between gap-2 px-sp-4 py-sp-3 text-left bg-neutral-0 hover:bg-neutral-50 transition-colors"
              (click)="toggle()">
        <span class="flex items-center gap-2 min-w-0">
          @if (icon()) { <span class="text-neutral-400 shrink-0" aria-hidden="true">{{ icon() }}</span> }
          <span class="text-xs font-semibold text-ink-700 truncate">{{ title() }}</span>
        </span>
        <span class="flex items-center gap-2 shrink-0">
          <ng-content select="[status]" />
          <span class="text-neutral-400 transition-transform" style="transition-duration: var(--mo-slow);" [style.transform]="open() ? 'rotate(180deg)' : 'rotate(0deg)'" aria-hidden="true">▾</span>
        </span>
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
  readonly icon = input('');
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
