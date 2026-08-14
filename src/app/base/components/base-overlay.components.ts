import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  HostListener,
  Injectable,
  OnInit,
  Renderer2,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { focusDialogOpen, lockBodyScroll, trapTabKey, unlockBodyScroll } from '../utils/dialog-a11y.util';

const ICON_TONE_CLASS: Record<'action' | 'accent' | 'success' | 'warning' | 'error' | 'neutral', string> = {
  action: 'bg-action-surface text-action',
  accent: 'bg-accent-surface text-accent',
  success: 'bg-success-surface text-success',
  warning: 'bg-warning-surface text-warning',
  error: 'bg-error-surface text-error',
  neutral: 'bg-neutral-100 text-neutral-500'
};

/** Interrupts and blocks until the operator resolves it — reach for `<base-drawer>` instead the
 *  moment the task doesn't need to leave the view; interruption is expensive on a monitoring
 *  surface, so use the smallest size that does the job. Footer buttons go in a `<div footer>`
 *  block: `<base-modal [(open)]="show" title="Edit tool"><div footer>...</div></base-modal>` —
 *  for a split footer (a link on the left, the button group on the right), give that div its
 *  own `class="w-full flex items-center justify-between"`.
 *
 *  Focus enters and is trapped inside the dialog (Tab cycles here only), returns to whatever
 *  opened it on close, and the background scroll-locks — `aria-modal="true"` already tells
 *  assistive tech everything outside is inert to browse-mode navigation. A [destructive] modal
 *  focuses the heading instead of the first control, so the danger button is never the default
 *  focus. */
@Component({
  selector: 'base-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-40 flex items-center justify-center p-sp-6">
        <div class="absolute inset-0 bg-ink-900/40" (click)="effectiveCloseOnBackdrop() && close('backdrop')"></div>
        <div #dialogRoot class="relative bg-neutral-0 rounded-r-lg w-full flex flex-col max-h-[88vh] outline-none"
             style="box-shadow: var(--shadow-e4);"
             [class]="sizeClass()" role="dialog" aria-modal="true" tabindex="-1" [attr.aria-label]="title()"
             (keydown.tab)="onTabKey($event)">
          @if (title() || icon() || showClose()) {
            <div class="flex items-start justify-between gap-3 px-sp-5 py-sp-4 border-b border-neutral-100">
              <span class="flex items-center gap-3 min-w-0">
                @if (icon()) {
                  <span class="shrink-0 w-9 h-9 rounded-r-sm inline-flex items-center justify-center" [class]="ICON_TONE_CLASS[iconTone()]">
                    <span class="icon-outline" style="font-size:18px;" aria-hidden="true">{{ icon() }}</span>
                  </span>
                }
                <span class="min-w-0">
                  <span class="font-display text-display-md text-ink-900 block truncate">{{ title() }}</span>
                  @if (subtitle()) { <span class="block text-[11px] text-neutral-400 mt-0.5">{{ subtitle() }}</span> }
                </span>
              </span>
              @if (showClose()) {
                <button type="button" class="shrink-0 text-neutral-300 hover:text-neutral-500 text-sm" (click)="close('button')"
                        aria-label="Close dialog" [disabled]="processing()">✕</button>
              }
            </div>
          }
          <div class="px-sp-5 py-sp-4 overflow-y-auto text-xs text-ink-600">
            <ng-content />
          </div>
          <div class="px-sp-5 py-sp-3 border-t border-neutral-100 empty:hidden flex justify-end gap-sp-2">
            <ng-content select="[footer]" />
          </div>
        </div>
      </div>
    }
  `
})
export class BaseModalComponent {
  /** Two-way bound visibility: [(open)]. Emits (openChange). */
  readonly open = model(false);
  readonly title = input('');
  /** Second line under the title, e.g. "Step 2 of 4 · Placement". */
  readonly subtitle = input('');
  /** Material Symbols name shown in a small tinted square before the title. */
  readonly icon = input('');
  readonly iconTone = input<'action' | 'accent' | 'success' | 'warning' | 'error' | 'neutral'>('action');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');
  readonly closeOnBackdrop = input(true);
  readonly showClose = input(true);
  /** Forces backdrop-dismiss off regardless of [closeOnBackdrop], and focuses the heading
   *  instead of the first control on open, for destructive confirmations. */
  readonly destructive = input(false);
  /** Disables Escape while a submit is in flight; the backdrop is unaffected. */
  readonly processing = input(false);

  /** Fired when the modal closes; reason = 'button' | 'backdrop' | 'escape'. */
  readonly closed = output<string>();

  protected readonly ICON_TONE_CLASS = ICON_TONE_CLASS;
  protected readonly sizeClass = computed(() => ({
    sm: 'max-w-[360px]', md: 'max-w-[440px]', lg: 'max-w-[640px]', xl: 'max-w-[880px]', full: 'max-w-full h-[88vh]'
  }[this.size()]));

  protected readonly effectiveCloseOnBackdrop = computed(() => !this.destructive() && this.closeOnBackdrop());

  private readonly dialogRoot = viewChild<ElementRef<HTMLElement>>('dialogRoot');
  private openerEl: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.openerEl = document.activeElement as HTMLElement | null;
        lockBodyScroll();
        const root = this.dialogRoot()?.nativeElement;
        if (root) focusDialogOpen(root, this.destructive());
      } else {
        unlockBodyScroll();
        this.openerEl?.focus();
        this.openerEl = null;
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open() && !this.processing()) this.close('escape');
  }

  onTabKey(ev: Event): void {
    const root = this.dialogRoot()?.nativeElement;
    if (root) trapTabKey(root, ev as KeyboardEvent);
  }

  close(reason: string): void {
    this.open.set(false);
    this.closed.emit(reason);
  }
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** A tooltip labels — it must never hold anything the operator needs to click; it disappears
 *  the moment the pointer leaves. Hover/focus, ~400ms show delay. Attach to any element:
 *  `<button baseTooltip="Refresh data" tooltipPosition="top">`. Set [tooltipTitle] for the
 *  "rich tooltip" shape — a heading plus a wrapping definition, still no links, still no
 *  buttons — for a metric that needs more than one line to define; reach for `<base-popover>`
 *  instead the moment the content needs to be clickable. */
@Directive({ selector: '[baseTooltip]', standalone: true })
export class BaseTooltipDirective {
  /** Tooltip text — the body when [tooltipTitle] is set, the whole message otherwise. */
  readonly baseTooltip = input.required<string>();
  readonly tooltipPosition = input<'top' | 'bottom' | 'left' | 'right'>('top');
  /** Optional heading — switches to the wider, wrapping "rich tooltip" layout. */
  readonly tooltipTitle = input('');

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private tip: HTMLElement | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;

  @HostListener('mouseenter')
  @HostListener('focus')
  scheduleShow(): void {
    if (this.tip || this.showTimer || !this.baseTooltip()) return;
    this.showTimer = setTimeout(() => this.show(), 400);
  }

  private show(): void {
    this.showTimer = null;
    const tip = this.renderer.createElement('div') as HTMLElement;
    tip.setAttribute('role', 'tooltip');

    const title = this.tooltipTitle();
    if (title) {
      tip.style.cssText =
        'position:fixed;z-index:60;background:var(--color-ink-900);color:#fff;font-size:11px;' +
        'padding:10px 12px;border-radius:8px;pointer-events:none;white-space:normal;opacity:.97;max-width:240px;line-height:1.45';
      const heading = this.renderer.createElement('div') as HTMLElement;
      heading.textContent = title;
      heading.style.cssText = 'font-weight:700;margin-bottom:4px;';
      this.renderer.appendChild(tip, heading);
      const body = this.renderer.createElement('div') as HTMLElement;
      body.textContent = this.baseTooltip();
      body.style.cssText = 'font-weight:400;opacity:.85;';
      this.renderer.appendChild(tip, body);
    } else {
      tip.textContent = this.baseTooltip();
      tip.style.cssText =
        'position:fixed;z-index:60;background:var(--color-ink-900);color:#fff;font-size:11px;font-weight:600;' +
        'padding:4px 8px;border-radius:6px;pointer-events:none;white-space:nowrap;opacity:.97';
    }
    this.renderer.appendChild(document.body, tip);

    const r = this.host.nativeElement.getBoundingClientRect();
    const t = tip.getBoundingClientRect();
    const gap = 6;
    let top = 0, left = 0;
    switch (this.tooltipPosition()) {
      case 'bottom': top = r.bottom + gap; left = r.left + r.width / 2 - t.width / 2; break;
      case 'left': top = r.top + r.height / 2 - t.height / 2; left = r.left - t.width - gap; break;
      case 'right': top = r.top + r.height / 2 - t.height / 2; left = r.right + gap; break;
      default: top = r.top - t.height - gap; left = r.left + r.width / 2 - t.width / 2;
    }
    tip.style.top = `${Math.max(4, top)}px`;
    tip.style.left = `${Math.max(4, left)}px`;
    this.tip = tip;
  }

  @HostListener('mouseleave')
  @HostListener('blur')
  @HostListener('click')
  @HostListener('keydown.escape')
  hide(): void {
    if (this.showTimer) { clearTimeout(this.showTimer); this.showTimer = null; }
    if (this.tip) {
      this.renderer.removeChild(document.body, this.tip);
      this.tip = null;
    }
  }
}

/** Anchored panel for interactive content; traps focus while open. Project the
 *  trigger into `[trigger]` and the panel body into `[panel]`:
 *  `<base-popover><button trigger>...</button><div panel>...</div></base-popover>` */
@Component({
  selector: 'base-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="relative inline-block">
      <span (click)="toggle()"><ng-content select="[trigger]" /></span>
      @if (open()) {
        <div #panel role="dialog" [attr.aria-label]="ariaLabel() || null"
             class="absolute z-30 mt-1 bg-neutral-0 border border-neutral-200 rounded-r-md min-w-48"
             style="box-shadow: var(--shadow-e2);"
             [class.right-0]="align() === 'right'"
             (keydown.tab)="onTab($event)">
          <ng-content select="[panel]" />
        </div>
      }
    </span>
  `
})
export class BasePopoverComponent {
  readonly align = input<'left' | 'right'>('left');
  readonly ariaLabel = input('');

  readonly opened = output<void>();
  readonly closed = output<void>();

  protected readonly open = signal(false);
  private readonly host = inject(ElementRef<HTMLElement>);
  private triggerEl: HTMLElement | null = null;

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(ev.target as Node)) this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.open()) this.close(); }

  toggle(): void {
    if (this.open()) { this.close(); return; }
    this.triggerEl = document.activeElement as HTMLElement;
    this.open.set(true);
    this.opened.emit();
    queueMicrotask(() => {
      const panel = this.host.nativeElement.querySelector('[role="dialog"]') as HTMLElement | null;
      (panel?.querySelector(FOCUSABLE) as HTMLElement | null)?.focus();
    });
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.closed.emit();
    this.triggerEl?.focus();
  }

  /** Manual focus-wrap: Tab past the last focusable element cycles to the
   *  first (and Shift+Tab past the first cycles to the last). */
  onTab(ev: Event): void {
    const kev = ev as KeyboardEvent;
    const panel = kev.currentTarget as HTMLElement;
    const items = Array.from(panel.querySelectorAll(FOCUSABLE)) as HTMLElement[];
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    const active = document.activeElement;
    if (!kev.shiftKey && active === last) { kev.preventDefault(); first.focus(); }
    else if (kev.shiftKey && active === first) { kev.preventDefault(); last.focus(); }
  }
}

/** A preview of an entity — a tool, an operator — reachable from a dense table without leaving
 *  it. Hover-triggered like a tooltip, but (unlike a tooltip) can hold controls, sparingly: a
 *  link out, maybe one action. The hide delay lets the pointer travel from trigger to panel
 *  without the card flickering shut; project the trigger into `[trigger]` and the card body
 *  into `[card]`: `<base-hover-card><a trigger>SP7-04</a><div card>...</div></base-hover-card>` */
@Component({
  selector: 'base-hover-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="relative inline-block" (mouseenter)="scheduleShow()" (mouseleave)="scheduleHide()"
          (focusin)="scheduleShow()" (focusout)="scheduleHide()">
      <ng-content select="[trigger]" />
      @if (open()) {
        <div class="absolute z-30 mt-1 bg-neutral-0 border border-neutral-200 rounded-r-md min-w-64 p-sp-4"
             style="box-shadow: var(--shadow-e2);"
             [class.right-0]="align() === 'right'"
             (mouseenter)="cancelHide()" (mouseleave)="scheduleHide()">
          <ng-content select="[card]" />
        </div>
      }
    </span>
  `
})
export class BaseHoverCardComponent {
  readonly align = input<'left' | 'right'>('left');
  /** Delay before the card appears — deliberately the same order of magnitude as a tooltip. */
  readonly delayMs = input(400);

  protected readonly open = signal(false);
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  scheduleShow(): void {
    this.cancelHide();
    if (this.open() || this.showTimer) return;
    this.showTimer = setTimeout(() => { this.open.set(true); this.showTimer = null; }, this.delayMs());
  }

  scheduleHide(): void {
    if (this.showTimer) { clearTimeout(this.showTimer); this.showTimer = null; }
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.open.set(false), 150);
  }

  cancelHide(): void {
    if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = null; }
  }
}

/** Moves the host element to `document.body` on creation, escaping ancestor
 *  stacking contexts (e.g. a `position: fixed` panel nested in a `position:
 *  sticky` table header). Apply to a popup panel rendered with `@if`:
 *  `<div baseTeleport class="fixed z-30 ...">` — Angular's view bookkeeping
 *  removes it again when the block closes, so no manual cleanup is needed. */
@Directive({ selector: '[baseTeleport]', standalone: true })
export class BaseTeleportDirective implements OnInit {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  ngOnInit(): void {
    this.renderer.appendChild(document.body, this.host.nativeElement);
  }
}

/** Sits next to what it describes; stays until the condition clears. Use `<base-banner>`
 *  instead when the condition affects the whole page, or `BaseToastService` when it's a
 *  transient confirmation of something the operator just did. */
@Component({
  selector: 'base-alert',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (compact()) {
      <div class="flex items-center gap-sp-2 rounded-r-sm border px-sp-3 py-sp-1.5 text-[11px]" [class]="kindClass()" role="status">
        <span class="icon-outline shrink-0" style="font-size:14px;" aria-hidden="true">{{ icon() }}</span>
        <span class="flex-1 min-w-0 truncate opacity-90"><ng-content />{{ message() }}</span>
        @if (actionLabel()) {
          <button type="button" class="shrink-0 font-semibold text-action hover:text-action-hover underline underline-offset-2"
                  (click)="action.emit()">{{ actionLabel() }}</button>
        }
        @if (dismissible()) {
          <button type="button" class="shrink-0 opacity-50 hover:opacity-100" (click)="dismissed.emit()"
                  aria-label="Dismiss">✕</button>
        }
      </div>
    } @else {
      <div class="flex items-start gap-sp-3 rounded-r-md border px-sp-4 py-sp-3 text-xs" [class]="kindClass()" role="alert">
        <span class="icon-outline shrink-0 mt-0.5" style="font-size:18px;" aria-hidden="true">{{ icon() }}</span>
        <div class="flex-1">
          @if (title()) { <p class="font-semibold mb-0.5">{{ title() }}</p> }
          <p class="opacity-90"><ng-content />{{ message() }}</p>
          @if ((actionLabel() && !actionInline()) || secondaryActionLabel()) {
            <div class="mt-sp-2 flex gap-sp-2">
              @if (actionLabel() && !actionInline()) {
                <button type="button" class="text-[11px] font-semibold text-neutral-0 rounded-r-sm px-sp-3 py-1.5 transition-colors"
                        [class]="actionClass()" (click)="action.emit()">{{ actionLabel() }}</button>
              }
              @if (secondaryActionLabel()) {
                <button type="button"
                        class="text-[11px] font-semibold bg-neutral-0 border border-neutral-200 text-ink-700 rounded-r-sm px-sp-3 py-1.5
                               hover:border-action hover:text-action transition-colors"
                        (click)="secondaryAction.emit()">{{ secondaryActionLabel() }}</button>
              }
            </div>
          }
        </div>
        @if (actionLabel() && actionInline()) {
          <button type="button"
                  class="self-center shrink-0 text-[11px] font-semibold bg-neutral-0 border border-neutral-200 text-ink-700
                         rounded-r-sm px-sp-3 py-1.5 hover:border-action hover:text-action transition-colors"
                  (click)="action.emit()">{{ actionLabel() }}</button>
        }
        @if (dismissible()) {
          <button type="button" class="opacity-50 hover:opacity-100 text-xs" (click)="dismissed.emit()"
                  aria-label="Dismiss">✕</button>
        }
      </div>
    }
  `
})
export class BaseAlertComponent {
  readonly kind = input<'info' | 'success' | 'warning' | 'error' | 'neutral'>('info');
  readonly title = input('');
  /** Message text (or project content instead). */
  readonly message = input('');
  readonly dismissible = input(false);
  /** Optional call-to-action button, e.g. "Resolve now" on a critical alert. */
  readonly actionLabel = input('');
  /** Second, lower-emphasis button beside [actionLabel] — e.g. "Discard my change" next to "Reload and compare". */
  readonly secondaryActionLabel = input('');
  /** Renders [actionLabel] as a single bordered button vertically centered at the trailing edge
   *  instead of stacked under the message — the "This tool is archived → Restore" shape. */
  readonly actionInline = input(false);
  /** Denser, single-line layout for table toolbars / card footers — no title, no stacked
   *  buttons; [actionLabel] renders as an inline text link instead. */
  readonly compact = input(false);

  /** Fired when the ✕ is clicked — host removes the alert. */
  readonly dismissed = output<void>();
  /** Fired when the primary action button (or, in compact mode, the link) is clicked. */
  readonly action = output<void>();
  /** Fired when the secondary action button is clicked. */
  readonly secondaryAction = output<void>();

  protected readonly kindClass = computed(() => ({
    info: 'bg-info-surface border-info/30 text-info',
    success: 'bg-success-surface border-success/30 text-success',
    warning: 'bg-warning-surface border-warning/30 text-warning',
    error: 'bg-error-surface border-error/30 text-error-text',
    neutral: 'bg-neutral-100 border-neutral-200 text-ink-600'
  }[this.kind()]));

  protected readonly actionClass = computed(() => ({
    info: 'bg-info hover:bg-info-hover', success: 'bg-success hover:bg-success-hover',
    warning: 'bg-warning hover:bg-warning-hover', error: 'bg-error hover:bg-error-hover',
    neutral: 'bg-ink-600 hover:bg-ink-700'
  }[this.kind()]));

  protected readonly icon = computed(() => ({
    info: 'info', success: 'check_circle', warning: 'warning', error: 'error', neutral: 'inventory_2'
  }[this.kind()]));
}

/** Spans the page — the condition affects the whole product, not one region: a maintenance
 *  window, a degraded feed, a session expiring. Mount at the top of the page/shell, edge to
 *  edge. A persistent banner (no [dismissible]) should only disappear once the condition itself
 *  resolves; a dismissible one must always offer [actionLabel] as a way to reach the detail
 *  first. Use `<base-alert>` instead when the message concerns one region, not the whole page. */
@Component({
  selector: 'base-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-sp-3 px-sp-5 py-sp-3 text-xs" [class]="kindClass()" role="status">
      <span class="icon-outline shrink-0" style="font-size:18px;" aria-hidden="true">{{ icon() }}</span>
      <div class="flex-1 min-w-0">
        @if (title()) { <span class="font-semibold">{{ title() }}</span> }
        <span [class]="title() ? 'ml-1 opacity-90' : 'opacity-90'"><ng-content />{{ message() }}</span>
      </div>
      @if (actionLabel()) {
        <button type="button" class="shrink-0" [class]="actionClass()" (click)="action.emit()">{{ actionLabel() }}</button>
      }
      @if (dismissible()) {
        <button type="button" class="shrink-0 opacity-70 hover:opacity-100 text-xs" (click)="dismissed.emit()"
                aria-label="Dismiss">✕</button>
      }
    </div>
  `
})
export class BaseBannerComponent {
  readonly kind = input<'info' | 'warning' | 'critical' | 'accent'>('info');
  readonly title = input('');
  /** Message text (or project content instead). */
  readonly message = input('');
  readonly actionLabel = input('');
  readonly dismissible = input(false);

  /** Fired when the ✕ is clicked — host removes the banner. */
  readonly dismissed = output<void>();
  /** Fired when the action button/link is clicked. */
  readonly action = output<void>();

  protected readonly kindClass = computed(() => ({
    info: 'bg-info-surface text-ink-900',
    warning: 'bg-warning-surface text-ink-900',
    critical: 'bg-error text-neutral-0',
    accent: 'bg-accent text-neutral-0'
  }[this.kind()]));

  /** Light kinds get a plain text link; dark (solid-fill) kinds get a small white button so the
   *  action still pops against the fill. */
  protected readonly actionClass = computed(() => ({
    info: 'text-info font-semibold underline underline-offset-2 hover:no-underline',
    warning: 'text-[11px] font-semibold bg-neutral-0 border border-neutral-200 text-ink-700 rounded-r-sm px-sp-3 py-1.5 hover:border-warning hover:text-warning transition-colors',
    critical: 'text-[11px] font-semibold bg-neutral-0 text-error rounded-r-sm px-sp-3 py-1.5 hover:bg-neutral-100 transition-colors',
    accent: 'text-[11px] font-semibold bg-neutral-0 text-accent rounded-r-sm px-sp-3 py-1.5 hover:bg-neutral-100 transition-colors'
  }[this.kind()]));

  protected readonly icon = computed(() => ({
    info: 'info', warning: 'warning', critical: 'error', accent: 'campaign'
  }[this.kind()]));
}

/** Determinate progress bar — pass [indeterminate] instead of [value] the moment the shape of
 *  what's coming is genuinely unknown (a bare spinner, `<base-loading>`, is the same call but
 *  icon-only with no track — reach for whichever reads better inline with other bars). */
@Component({
  selector: 'base-progress-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes base-progress-indeterminate {
      0% { left: -40%; }
      100% { left: 100%; }
    }
    .indeterminate-fill { position: absolute; top: 0; bottom: 0; width: 40%; animation: base-progress-indeterminate 1.2s ease-in-out infinite; }
  `],
  template: `
    @if (label()) {
      <div class="flex items-center justify-between mb-1">
        <span class="text-[11px] text-ink-600">{{ label() }}</span>
        @if (showLabel()) {
          <span class="text-[11px] font-semibold text-ink-700 tabular-nums">{{ indeterminate() ? '–' : clamped() + '%' }}</span>
        }
      </div>
    }
    <div class="flex items-center gap-2">
      <div class="relative flex-1 rounded-r-full bg-neutral-100 overflow-hidden" [style.height.px]="height()">
        @if (indeterminate()) {
          <div class="indeterminate-fill rounded-r-full" [class]="color() ? '' : colorClass()" [style.background]="color() || null"></div>
        } @else {
          <div class="h-full rounded-r-full transition-all"
               [style.width.%]="clamped()"
               [class]="color() ? '' : colorClass()"
               [style.background]="color() || null"></div>
        }
      </div>
      @if (!label() && showLabel()) {
        <span class="text-[10px] font-semibold text-neutral-400 tabular-nums">{{ indeterminate() ? '–' : clamped() + '%' }}</span>
      }
    </div>
  `
})
export class BaseProgressBarComponent {
  /** 0–100. Ignored (and not required) when [indeterminate] is set. */
  readonly value = input<number>(0);
  /** Operation name shown above the bar, e.g. "Exporting service_activity.xlsx". */
  readonly label = input('');
  /** Semantic fill color; ignored when [color] is set. */
  readonly tone = input<'action' | 'success' | 'warning' | 'error'>('action');
  /** Arbitrary CSS color override, takes precedence over [tone]. */
  readonly color = input('');
  readonly height = input(6);
  readonly showLabel = input(true);
  /** A sliding fill and an em dash instead of a percentage — the duration/end point isn't known yet. */
  readonly indeterminate = input(false);

  protected readonly clamped = computed(() => Math.min(100, Math.max(0, Math.round(this.value()))));
  protected readonly colorClass = computed(() => ({
    action: 'bg-action', success: 'bg-success', warning: 'bg-warning', error: 'bg-error'
  }[this.tone()]));
}

/** Loading placeholder shaped like its content — rect/circle, or a
 *  table-row/kpi-tile/card/chart preset. */
@Component({
  selector: 'base-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (shape()) {
      @case ('table-row') {
        <div class="flex items-center gap-sp-4 py-sp-2" aria-hidden="true">
          <div class="animate-pulse bg-neutral-100 rounded-r-xs h-3" style="width: 22%"></div>
          <div class="animate-pulse bg-neutral-100 rounded-r-xs h-3" style="width: 15%"></div>
          <div class="animate-pulse bg-neutral-100 rounded-r-xs h-3" style="width: 30%"></div>
          <div class="animate-pulse bg-neutral-100 rounded-r-xs h-3" style="width: 12%"></div>
        </div>
      }
      @case ('kpi-tile') {
        <div class="panel px-sp-5 py-sp-4 flex flex-col gap-sp-2" aria-hidden="true">
          <div class="animate-pulse bg-neutral-100 rounded-r-xs h-2.5 w-16"></div>
          <div class="animate-pulse bg-neutral-100 rounded-r-xs h-6 w-20"></div>
        </div>
      }
      @case ('card') {
        <div class="animate-pulse bg-neutral-100 rounded-r-md" [style.width]="width()" [style.height]="height() === '14px' ? '120px' : height()" aria-hidden="true"></div>
      }
      @case ('chart') {
        <div class="animate-pulse bg-neutral-100 rounded-r-md" [style.width]="width()" [style.height]="height() === '14px' ? '200px' : height()" aria-hidden="true"></div>
      }
      @default {
        <div class="animate-pulse bg-neutral-100"
             [style.width]="width()" [style.height]="height()"
             [class]="shape() === 'circle' ? 'rounded-r-full' : 'rounded-r-xs'" aria-hidden="true"></div>
      }
    }
  `
})
export class BaseSkeletonComponent {
  readonly width = input('100%');
  readonly height = input('14px');
  readonly shape = input<'rect' | 'circle' | 'table-row' | 'kpi-tile' | 'card' | 'chart'>('rect');
}

/** A full-panel error state (404/403/500, or [offline]) — distinct from `<base-empty-state>`:
 *  this is for something that actually went wrong, not an invitation to act on an empty
 *  collection. Recovery is part of the state: always offer at least one way forward, and if a
 *  [traceId] is given it's shown in mono and is click-to-copy — it's the one thing support will
 *  ask for, so it must never be truncated or unselectable. */
@Component({
  selector: 'base-error-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center text-center gap-2 py-10 px-6 max-w-md mx-auto">
      @if (offline()) {
        <span class="icon-outline text-neutral-300" style="font-size:40px;" aria-hidden="true">wifi_off</span>
      } @else {
        <span class="font-display text-5xl font-extrabold tabular-nums" [class]="tone() === 'error' ? 'text-error' : 'text-ink-900'">
          {{ code() }}
        </span>
      }
      <p class="font-display text-display-md text-ink-900 mt-1">{{ title() }}</p>
      @if (message()) { <p class="text-xs text-neutral-500 max-w-sm">{{ message() }}</p> }

      @if (offline()) {
        @if (actionLabel()) {
          <button type="button" class="mt-2 text-xs font-semibold text-action hover:text-action-hover underline underline-offset-2"
                  (click)="action.emit()">{{ actionLabel() }}</button>
        }
        @if (statusNote()) {
          <span class="mt-3 text-[10px] font-bold uppercase tracking-wide text-neutral-400 bg-neutral-100 px-sp-3 py-1 rounded-r-full">
            {{ statusNote() }}
          </span>
        }
      } @else if (actionLabel() || secondaryActionLabel()) {
        <div class="flex items-center gap-2 mt-2">
          @if (actionLabel()) {
            <button type="button" class="text-xs font-semibold text-neutral-0 bg-action hover:bg-action-hover rounded-r-sm px-sp-4 py-2 transition-colors"
                    (click)="action.emit()">{{ actionLabel() }}</button>
          }
          @if (secondaryActionLabel()) {
            <button type="button"
                    class="text-xs font-semibold text-ink-700 bg-neutral-0 border border-neutral-200 hover:border-action hover:text-action
                           rounded-r-sm px-sp-4 py-2 transition-colors"
                    (click)="secondaryAction.emit()">{{ secondaryActionLabel() }}</button>
          }
        </div>
      }

      @if (traceId()) {
        <button type="button"
                class="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] text-neutral-400 hover:text-ink-600 transition-colors select-all"
                (click)="copyTrace()">
          <span class="icon-outline" style="font-size:12px;" aria-hidden="true">{{ copied() ? 'check' : 'content_copy' }}</span>
          {{ copied() ? 'Copied' : traceId() }}
        </button>
      }
    </div>
  `
})
export class BaseErrorPageComponent {
  /** e.g. '404' / '403' / '500'. Ignored when [offline] is set (a "you're offline" state uses
   *  an icon instead — there's no HTTP status code for a dead connection). */
  readonly code = input('');
  /** 'error' reads the code in red — reserve for something actually broken (5xx), not a 4xx
   *  the operator can route around. */
  readonly tone = input<'neutral' | 'error'>('neutral');
  readonly title = input.required<string>();
  readonly message = input('');
  readonly actionLabel = input('');
  readonly secondaryActionLabel = input('');
  /** Swaps the numeric code for a disconnect icon, drops to one centered text-link action, and
   *  adds an optional [statusNote] pill (e.g. "Cached view · 214 tools"). */
  readonly offline = input(false);
  readonly statusNote = input('');
  /** Mono, click-to-copy trace/correlation id — the one thing support will ask for. */
  readonly traceId = input('');

  readonly action = output<void>();
  readonly secondaryAction = output<void>();

  protected readonly copied = signal(false);

  copyTrace(): void {
    const id = this.traceId();
    if (!id) return;
    navigator.clipboard?.writeText(id).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    });
  }
}

export interface BaseToast {
  id: number;
  kind: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  /** Inline action link, e.g. "Undo" — pairs with `onAction`. */
  actionLabel?: string;
  /** Invoked when [actionLabel] is clicked, before the toast dismisses. */
  onAction?: () => void;
}

/** Options for the third argument of info/success/warning/error(). */
export interface BaseToastOptions {
  actionLabel?: string;
  onAction?: () => void;
}

const TOAST_DURATION_MS = 4000;
const TOAST_MAX_VISIBLE = 3;

/** Confirms an action the operator just took, succeeded or failed — never for something they
 *  did not initiate, and never for an error that still needs action (that belongs in
 *  `<base-alert>` or `<base-banner>`, which stay until the condition is resolved). Auto-dismiss
 *  after 4s except errors, which require explicit dismissal. Stacks bottom-right (max 3
 *  visible, rest queue); mount `<base-toast-host />` once near the app root. */
@Injectable({ providedIn: 'root' })
export class BaseToastService {
  private readonly _toasts = signal<BaseToast[]>([]);
  private readonly queue: BaseToast[] = [];
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly remaining = new Map<number, number>();
  private readonly startedAt = new Map<number, number>();
  private seq = 0;

  readonly toasts = this._toasts.asReadonly();

  info(title: string, message?: string, opts?: BaseToastOptions): number { return this.push({ kind: 'info', title, message, ...opts }); }
  success(title: string, message?: string, opts?: BaseToastOptions): number { return this.push({ kind: 'success', title, message, ...opts }); }
  warning(title: string, message?: string, opts?: BaseToastOptions): number { return this.push({ kind: 'warning', title, message, ...opts }); }
  /** Never auto-dismisses; the caller (or the user) must call dismiss(). */
  error(title: string, message?: string, opts?: BaseToastOptions): number { return this.push({ kind: 'error', title, message, ...opts }); }

  push(t: Omit<BaseToast, 'id'>): number {
    const id = ++this.seq;
    const toast: BaseToast = { ...t, id };
    if (this._toasts().length < TOAST_MAX_VISIBLE) {
      this._toasts.update(list => [...list, toast]);
      this.schedule(toast);
    } else {
      this.queue.push(toast);
    }
    return id;
  }

  dismiss(id: number): void {
    this.clearTimer(id);
    this._toasts.update(list => list.filter(t => t.id !== id));
    const next = this.queue.shift();
    if (next) {
      this._toasts.update(list => [...list, next]);
      this.schedule(next);
    }
  }

  /** Clears the whole stack immediately — visible and queued alike. Wired to Esc. */
  dismissAll(): void {
    this._toasts().forEach(t => this.clearTimer(t.id));
    this._toasts.set([]);
    this.queue.length = 0;
  }

  /** Hover-in: freeze the remaining time. */
  pause(id: number): void {
    const timer = this.timers.get(id);
    const started = this.startedAt.get(id);
    if (timer && started !== undefined) {
      clearTimeout(timer);
      const elapsed = Date.now() - started;
      this.remaining.set(id, Math.max(0, (this.remaining.get(id) ?? TOAST_DURATION_MS) - elapsed));
      this.timers.delete(id);
    }
  }

  /** Hover-out: resume the frozen remaining time. */
  resume(id: number): void {
    if (this.timers.has(id)) return;
    const toast = this._toasts().find(t => t.id === id);
    if (!toast || toast.kind === 'error') return;
    const ms = this.remaining.get(id) ?? TOAST_DURATION_MS;
    this.startedAt.set(id, Date.now());
    this.timers.set(id, setTimeout(() => this.dismiss(id), ms));
  }

  /** Pauses every visible toast at once — used while focus sits anywhere inside the stack. */
  pauseAll(): void { this._toasts().forEach(t => this.pause(t.id)); }
  /** Resumes every visible toast at once. */
  resumeAll(): void { this._toasts().forEach(t => this.resume(t.id)); }

  private schedule(t: BaseToast): void {
    if (t.kind === 'error') return; // explicit dismissal only
    this.remaining.set(t.id, TOAST_DURATION_MS);
    this.startedAt.set(t.id, Date.now());
    this.timers.set(t.id, setTimeout(() => this.dismiss(t.id), TOAST_DURATION_MS));
  }

  private clearTimer(id: number): void {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
    this.remaining.delete(id);
    this.startedAt.delete(id);
  }
}

/** Renders the live toast stack from `BaseToastService`. Mount once, e.g. in
 *  the app root: `<base-toast-host />`. */
@Component({
  selector: 'base-toast-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-sp-6 right-sp-6 z-50 flex flex-col-reverse gap-sp-2 w-80 max-w-[calc(100vw-3rem)]"
         aria-live="polite" (focusin)="svc.pauseAll()" (focusout)="svc.resumeAll()">
      @for (t of svc.toasts(); track t.id) {
        <div class="rounded-r-md px-sp-4 py-sp-3 flex items-start gap-sp-3 bg-surface-inverse text-neutral-0"
             style="box-shadow: var(--shadow-e3);"
             (mouseenter)="svc.pause(t.id)" (mouseleave)="svc.resume(t.id)">
          <span class="icon-outline shrink-0 mt-0.5" style="font-size:18px;" [style.color]="iconColor(t.kind)" aria-hidden="true">{{ iconFor(t.kind) }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold">{{ t.title }}</p>
            @if (t.message) { <p class="text-[11px] text-neutral-0/70 mt-0.5">{{ t.message }}</p> }
            @if (t.actionLabel) {
              <button type="button" class="mt-1 text-[11px] font-semibold text-interactive hover:underline"
                      (click)="runAction(t)">{{ t.actionLabel }}</button>
            }
          </div>
          <button type="button" class="text-neutral-0/50 hover:text-neutral-0 text-xs shrink-0" (click)="svc.dismiss(t.id)"
                  aria-label="Dismiss notification">✕</button>
        </div>
      }
    </div>
  `
})
export class BaseToastHostComponent {
  protected readonly svc = inject(BaseToastService);

  /** Esc clears the whole stack while any toast is visible. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.svc.toasts().length) this.svc.dismissAll();
  }

  runAction(t: BaseToast): void {
    t.onAction?.();
    this.svc.dismiss(t.id);
  }

  protected iconFor(kind: BaseToast['kind']): string {
    return { info: 'info', success: 'check_circle', warning: 'warning', error: 'error' }[kind];
  }

  /** Semantic colors are tuned for light surfaces; mixed toward white here so they stay
   *  legible on the toast's dark (surface-inverse) background. */
  protected iconColor(kind: BaseToast['kind']): string {
    const token = { info: 'var(--color-info)', success: 'var(--color-success)', warning: 'var(--color-warning)', error: 'var(--color-error)' }[kind];
    return `color-mix(in srgb, ${token} 55%, white)`;
  }
}
