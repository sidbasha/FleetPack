import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  computed,
  inject,
  input,
  model,
  output
} from '@angular/core';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BASE MODULE · Overlay & feedback components
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── <base-modal> ────────────────────────────────────────────────────────────
/**
 * Content-projected dialog.
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
      <div class="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40" (click)="closeOnBackdrop() && close('backdrop')"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full flex flex-col max-h-[85vh]"
             [class]="sizeClass()" role="dialog" aria-modal="true" [attr.aria-label]="title()">
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <span class="text-sm font-bold text-slate-800">{{ title() }}</span>
            @if (showClose()) {
              <button type="button" class="text-slate-300 hover:text-slate-500 text-sm" (click)="close('button')"
                      aria-label="Close dialog">✕</button>
            }
          </div>
          <div class="px-5 py-4 overflow-y-auto text-xs text-slate-600">
            <ng-content />
          </div>
          <div class="px-5 py-3 border-t border-slate-100 empty:hidden flex justify-end gap-2">
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

  /** Fired when the modal closes; reason = 'button' | 'backdrop' | 'escape'. */
  readonly closed = output<string>();

  readonly sizeClass = computed(() => ({
    sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl'
  }[this.size()]));

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close('escape');
  }

  close(reason: string): void {
    this.open.set(false);
    this.closed.emit(reason);
  }
}

// ── [baseTooltip] directive ─────────────────────────────────────────────────
/** Attach to any element: <button baseTooltip="Refresh data" tooltipPosition="top"> */
@Directive({ selector: '[baseTooltip]', standalone: true })
export class BaseTooltipDirective {
  /** Tooltip text. */
  readonly baseTooltip = input.required<string>();
  readonly tooltipPosition = input<'top' | 'bottom' | 'left' | 'right'>('top');

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private tip: HTMLElement | null = null;

  @HostListener('mouseenter')
  show(): void {
    if (this.tip || !this.baseTooltip()) return;
    const tip = this.renderer.createElement('div') as HTMLElement;
    tip.textContent = this.baseTooltip();
    tip.style.cssText =
      'position:fixed;z-index:60;background:#0f172a;color:#fff;font-size:10px;font-weight:600;' +
      'padding:4px 8px;border-radius:6px;pointer-events:none;white-space:nowrap;opacity:.95';
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
  @HostListener('click')
  hide(): void {
    if (this.tip) {
      this.renderer.removeChild(document.body, this.tip);
      this.tip = null;
    }
  }
}

// ── <base-alert> ────────────────────────────────────────────────────────────
@Component({
  selector: 'base-alert',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-xs" [class]="kindClass()" role="alert">
      <span class="text-sm leading-none mt-0.5">{{ icon() }}</span>
      <div class="flex-1">
        @if (title()) { <p class="font-bold mb-0.5">{{ title() }}</p> }
        <p class="opacity-90"><ng-content />{{ message() }}</p>
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

  /** Fired when the ✕ is clicked — host removes the alert. */
  readonly dismissed = output<void>();

  readonly kindClass = computed(() => ({
    info: 'bg-sky-50 border-sky-200 text-sky-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  }[this.kind()]));

  readonly icon = computed(() => ({
    info: 'ℹ️', success: '✅', warning: '⚠️', error: '⛔'
  }[this.kind()]));
}

// ── <base-progress-bar> ─────────────────────────────────────────────────────
@Component({
  selector: 'base-progress-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-2">
      <div class="flex-1 rounded-full bg-slate-100 overflow-hidden" [style.height.px]="height()">
        <div class="h-full rounded-full transition-all" [style.width.%]="clamped()" [style.background]="color()"></div>
      </div>
      @if (showLabel()) {
        <span class="text-[10px] font-semibold text-slate-500 tabular-nums">{{ clamped() }}%</span>
      }
    </div>
  `
})
export class BaseProgressBarComponent {
  /** 0–100. */
  readonly value = input.required<number>();
  readonly color = input('#6366f1');
  readonly height = input(6);
  readonly showLabel = input(true);

  readonly clamped = computed(() => Math.min(100, Math.max(0, Math.round(this.value()))));
}

// ── <base-skeleton> ─────────────────────────────────────────────────────────
/** Loading placeholder block. Repeat with @for for lists. */
@Component({
  selector: 'base-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="animate-pulse bg-slate-100"
         [style.width]="width()" [style.height]="height()"
         [class]="shape() === 'circle' ? 'rounded-full' : 'rounded-lg'"></div>
  `
})
export class BaseSkeletonComponent {
  readonly width = input('100%');
  readonly height = input('14px');
  readonly shape = input<'rect' | 'circle'>('rect');
}
