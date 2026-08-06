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
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core';

/**
 * Content-projected dialog. Modals interrupt for a focused decision; reach
 * for a drawer (`<base-drawer>`) instead when the task doesn't need to leave
 * the current view.
 *   <base-modal [(open)]="showEdit" title="Edit tool" size="md">
 *     ...body...
 *     <div footer>...action buttons...</div>
 *   </base-modal>
 */
@Component({
  selector: 'base-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-40 flex items-center justify-center p-sp-6">
        <div class="absolute inset-0 bg-ink-900/40" (click)="effectiveCloseOnBackdrop() && close('backdrop')"></div>
        <div class="relative bg-neutral-0 rounded-r-lg w-full flex flex-col max-h-[88vh]" style="box-shadow: var(--shadow-e4);"
             [class]="sizeClass()" role="dialog" aria-modal="true" [attr.aria-label]="title()">
          <div class="flex items-center justify-between px-sp-5 py-sp-4 border-b border-neutral-100">
            <span class="font-display text-display-md text-ink-900">{{ title() }}</span>
            @if (showClose()) {
              <button type="button" class="text-neutral-300 hover:text-neutral-500 text-sm" (click)="close('button')"
                      aria-label="Close dialog" [disabled]="processing()">✕</button>
            }
          </div>
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
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly closeOnBackdrop = input(true);
  readonly showClose = input(true);
  /** Destructive confirmation modals require an explicit button choice —
   *  set true to force backdrop-dismiss off regardless of [closeOnBackdrop]. */
  readonly destructive = input(false);
  /** Mid-submit "processing" state disables Escape until it completes;
   *  clicking the backdrop is unaffected (already excluded for destructive). */
  readonly processing = input(false);

  /** Fired when the modal closes; reason = 'button' | 'backdrop' | 'escape'. */
  readonly closed = output<string>();

  protected readonly sizeClass = computed(() => ({
    sm: 'max-w-[360px]', md: 'max-w-[440px]', lg: 'max-w-[640px]', xl: 'max-w-4xl'
  }[this.size()]));

  protected readonly effectiveCloseOnBackdrop = computed(() => !this.destructive() && this.closeOnBackdrop());

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open() && !this.processing()) this.close('escape');
  }

  close(reason: string): void {
    this.open.set(false);
    this.closed.emit(reason);
  }
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** A tooltip explains; appears on :hover AND keyboard :focus (never
 *  mouse-only), with a ~400ms show delay. Never the only source of
 *  information — content here must also be reachable another way for
 *  touch/no-hover contexts. Attach to any element:
 *  `<button baseTooltip="Refresh data" tooltipPosition="top">` */
@Directive({ selector: '[baseTooltip]', standalone: true })
export class BaseTooltipDirective {
  /** Tooltip text. */
  readonly baseTooltip = input.required<string>();
  readonly tooltipPosition = input<'top' | 'bottom' | 'left' | 'right'>('top');

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
    tip.textContent = this.baseTooltip();
    tip.setAttribute('role', 'tooltip');
    tip.style.cssText =
      'position:fixed;z-index:60;background:var(--color-ink-900);color:#fff;font-size:11px;font-weight:600;' +
      'padding:4px 8px;border-radius:6px;pointer-events:none;white-space:nowrap;opacity:.97';
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

/**
 * A popover contains interactive content (a button, a checkbox) — if it has
 * one, it's a popover, not a tooltip. Keeps focus inside while open: Tab
 * cycles within the panel, Escape closes it and returns focus to the
 * trigger. Project the trigger into `[trigger]` and the panel body into
 * `[panel]`:
 *   <base-popover>
 *     <button trigger class="btn-secondary">Column options</button>
 *     <div panel class="p-sp-4">...interactive content...</div>
 *   </base-popover>
 */
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

/**
 * Moves the host element to `document.body` as soon as it's created, escaping any
 * ancestor's stacking context / overflow clipping — e.g. a `position: fixed` dropdown
 * panel nested inside a `position: sticky` table header still only out-ranks *siblings
 * within that header cell* for z-index purposes, not the table's other header cells,
 * because z-index comparisons never cross an ancestor's stacking context boundary. Apply
 * directly to a popup panel that's conditionally rendered with `@if`:
 *   `<div baseTeleport #panel class="fixed z-30 ...">`
 * Angular's own view-node bookkeeping (not DOM parentage) is what `@if` uses to remove
 * the element again when the block closes, so moving it here is safe — no manual cleanup
 * needed. The element keeps its Angular template bindings; only its DOM *location* changes.
 */
@Directive({ selector: '[baseTeleport]', standalone: true })
export class BaseTeleportDirective implements OnInit {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  ngOnInit(): void {
    this.renderer.appendChild(document.body, this.host.nativeElement);
  }
}

/** Banners are persistent and page/section-scoped; toasts (`BaseToastService`
 *  below) are transient and global. Neither replaces an inline field error.
 *  A banner is dismissible only if re-triggering the underlying condition
 *  would show it again — a permanent, unfixable condition banner should be
 *  passed [dismissible]="false" by the host. */
@Component({
  selector: 'base-alert',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-start gap-sp-3 rounded-r-md border px-sp-4 py-sp-3 text-xs" [class]="kindClass()" role="alert">
      <span class="icon-outline shrink-0 mt-0.5" style="font-size:18px;" aria-hidden="true">{{ icon() }}</span>
      <div class="flex-1">
        @if (title()) { <p class="font-semibold mb-0.5">{{ title() }}</p> }
        <p class="opacity-90"><ng-content />{{ message() }}</p>
        @if (actionLabel()) {
          <button type="button" class="mt-sp-2 text-[11px] font-semibold text-neutral-0 rounded-r-sm px-sp-3 py-1.5 transition-colors"
                  [class]="actionClass()" (click)="action.emit()">{{ actionLabel() }}</button>
        }
      </div>
      @if (dismissible()) {
        <button type="button" class="opacity-50 hover:opacity-100 text-xs" (click)="dismissed.emit()"
                aria-label="Dismiss">✕</button>
      }
    </div>
  `
})
export class BaseAlertComponent {
  readonly kind = input<'info' | 'success' | 'warning' | 'error'>('info');
  readonly title = input('');
  /** Message text (or project content instead). */
  readonly message = input('');
  readonly dismissible = input(false);
  /** Optional call-to-action button, e.g. "Resolve now" on a critical banner. */
  readonly actionLabel = input('');

  /** Fired when the ✕ is clicked — host removes the alert. */
  readonly dismissed = output<void>();
  /** Fired when the action button is clicked. */
  readonly action = output<void>();

  protected readonly kindClass = computed(() => ({
    info: 'bg-info-surface border-info/30 text-info',
    success: 'bg-success-surface border-success/30 text-success',
    warning: 'bg-warning-surface border-warning/30 text-warning',
    error: 'bg-error-surface border-error/30 text-error-text'
  }[this.kind()]));

  protected readonly actionClass = computed(() => ({
    info: 'bg-info hover:bg-info-hover', success: 'bg-success hover:bg-success-hover',
    warning: 'bg-warning hover:bg-warning-hover', error: 'bg-error hover:bg-error-hover'
  }[this.kind()]));

  protected readonly icon = computed(() => ({
    info: 'info', success: 'check_circle', warning: 'warning', error: 'error'
  }[this.kind()]));
}

/** A determinate progress bar, for an operation with a known duration or
 *  measurable percent complete — distinct from the indeterminate spinner
 *  (`<base-loading>`). Label states the operation, not just a percentage;
 *  the host should throttle [value] updates to at most once per 200ms so it
 *  reads as progress, not flicker. */
@Component({
  selector: 'base-progress-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (label()) {
      <div class="flex items-center justify-between mb-1">
        <span class="text-[11px] text-ink-600">{{ label() }}</span>
        @if (showLabel()) { <span class="text-[11px] font-semibold text-ink-700 tabular-nums">{{ clamped() }}%</span> }
      </div>
    }
    <div class="flex items-center gap-2">
      <div class="flex-1 rounded-r-full bg-neutral-100 overflow-hidden" [style.height.px]="height()">
        <div class="h-full rounded-r-full transition-all"
             [style.width.%]="clamped()"
             [class]="color() ? '' : colorClass()"
             [style.background]="color() || null"></div>
      </div>
      @if (!label() && showLabel()) {
        <span class="text-[10px] font-semibold text-neutral-400 tabular-nums">{{ clamped() }}%</span>
      }
    </div>
  `
})
export class BaseProgressBarComponent {
  /** 0–100. */
  readonly value = input.required<number>();
  /** Operation name shown above the bar, e.g. "Exporting service_activity.xlsx". */
  readonly label = input('');
  /** Semantic fill color; ignored when [color] is set. */
  readonly tone = input<'action' | 'success' | 'warning' | 'error'>('action');
  /** Arbitrary CSS color override (e.g. a widget-config-driven hex), takes precedence over [tone]. */
  readonly color = input('');
  readonly height = input(6);
  readonly showLabel = input(true);

  protected readonly clamped = computed(() => Math.min(100, Math.max(0, Math.round(this.value()))));
  protected readonly colorClass = computed(() => ({
    action: 'bg-action', success: 'bg-success', warning: 'bg-warning', error: 'bg-error'
  }[this.tone()]));
}

/** A skeleton shape per content type, so the placeholder always previews
 *  the real layout rather than a generic gray block. Use [shape]="'rect'"
 *  or [shape]="'circle'" for a custom size, or one of the content-type
 *  presets (table-row / kpi-tile / card / chart) for a ready-made block. */
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

export interface BaseToast {
  id: number;
  kind: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  actionLabel?: string;
}

const TOAST_DURATION_MS = 3500;
const TOAST_MAX_VISIBLE = 3;

/**
 * Transient, global, auto-dismissing after 3.5s; stacks bottom-right, newest
 * on top; hovering pauses the dismiss timer. A fourth concurrent toast
 * queues rather than stacking the viewport into unreadability. Error toasts
 * never auto-dismiss — a deliberate asymmetry with success/info/warning,
 * since a failure the user didn't see acted on is worse than a lingering
 * toast; they require explicit dismissal. Mount `<base-toast-host />` once
 * near the app root, then call this service from anywhere.
 */
@Injectable({ providedIn: 'root' })
export class BaseToastService {
  private readonly _toasts = signal<BaseToast[]>([]);
  private readonly queue: BaseToast[] = [];
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly remaining = new Map<number, number>();
  private readonly startedAt = new Map<number, number>();
  private seq = 0;

  readonly toasts = this._toasts.asReadonly();

  info(title: string, message?: string): number { return this.push({ kind: 'info', title, message }); }
  success(title: string, message?: string): number { return this.push({ kind: 'success', title, message }); }
  warning(title: string, message?: string): number { return this.push({ kind: 'warning', title, message }); }
  /** Never auto-dismisses; the caller (or the user) must call dismiss(). */
  error(title: string, message?: string): number { return this.push({ kind: 'error', title, message }); }

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
    <div class="fixed bottom-sp-6 right-sp-6 z-50 flex flex-col-reverse gap-sp-2 w-80 max-w-[calc(100vw-3rem)]" aria-live="polite">
      @for (t of svc.toasts(); track t.id) {
        <div class="rounded-r-md border px-sp-4 py-sp-3 flex items-start gap-sp-3 bg-neutral-0" [class]="kindClass(t.kind)"
             style="box-shadow: var(--shadow-e3);"
             (mouseenter)="svc.pause(t.id)" (mouseleave)="svc.resume(t.id)">
          <span class="icon-outline shrink-0 mt-0.5" style="font-size:18px;" aria-hidden="true">{{ iconFor(t.kind) }}</span>
          <div class="flex-1">
            <p class="text-xs font-semibold text-ink-900">{{ t.title }}</p>
            @if (t.message) { <p class="text-[11px] text-ink-600 mt-0.5">{{ t.message }}</p> }
          </div>
          <button type="button" class="text-neutral-300 hover:text-neutral-500 text-xs" (click)="svc.dismiss(t.id)"
                  aria-label="Dismiss notification">✕</button>
        </div>
      }
    </div>
  `
})
export class BaseToastHostComponent {
  protected readonly svc = inject(BaseToastService);

  protected kindClass(kind: BaseToast['kind']): string {
    return { info: 'border-info/30', success: 'border-success/30', warning: 'border-warning/30', error: 'border-error/30' }[kind];
  }

  protected iconFor(kind: BaseToast['kind']): string {
    return { info: 'info', success: 'check_circle', warning: 'warning', error: 'error' }[kind];
  }
}
