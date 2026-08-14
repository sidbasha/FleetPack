import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  effect,
  input,
  model,
  output,
  viewChild
} from '@angular/core';
import { focusDialogOpen, lockBodyScroll, trapTabKey, unlockBodyScroll } from '../utils/dialog-a11y.util';

/** Holds detail beside the work rather than on top of it — the list/page underneath stays
 *  visible and selectable. Reach for `<base-modal>` instead the moment the task truly needs to
 *  block the operator. `side="bottom"` is the compact-breakpoint equivalent of a side drawer —
 *  a picker or action sheet at a width where a side panel would leave nothing else visible.
 *  Same focus-trap / focus-return / scroll-lock contract as `<base-modal>` — see its doc comment.
 *  `<base-drawer [(open)]="show" title="Alarm Info"><div footer>...</div></base-drawer>` */
@Component({
  selector: 'base-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-40 flex" [class]="containerClass()">
        <div class="absolute inset-0 bg-ink-900/40" (click)="closeOnBackdrop() && close('backdrop')"></div>
        <div #dialogRoot class="relative bg-neutral-0 flex flex-col outline-none" style="box-shadow: var(--shadow-e4);"
             [class]="panelClass()"
             [style.width]="side() === 'bottom' ? null : width()"
             role="dialog" aria-modal="true" tabindex="-1" [attr.aria-label]="title()"
             (keydown.tab)="onTabKey($event)">
          @if (side() === 'bottom') {
            <div class="flex justify-center pt-2 pb-1 shrink-0" aria-hidden="true">
              <span class="w-9 h-1 rounded-full bg-neutral-200"></span>
            </div>
          }
          @if (title() || icon() || showClose()) {
            <div class="flex items-center justify-between gap-3 px-sp-5 py-sp-4 border-b border-neutral-100 shrink-0">
              <span class="flex items-center gap-2.5 min-w-0">
                @if (icon()) { <span class="icon-outline text-neutral-400 shrink-0" style="font-size:18px;" aria-hidden="true">{{ icon() }}</span> }
                <span class="font-display text-display-md text-ink-900 truncate">{{ title() }}</span>
              </span>
              @if (showClose()) {
                <button type="button" class="shrink-0 text-neutral-300 hover:text-neutral-500 text-sm" (click)="close('button')"
                        aria-label="Close drawer">✕</button>
              }
            </div>
          }
          <div class="flex-1 min-h-0 overflow-y-auto">
            <ng-content />
          </div>
          <div class="px-sp-5 py-sp-3 border-t border-neutral-100 empty:hidden flex gap-sp-2 shrink-0">
            <ng-content select="[footer]" />
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes drawer-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes drawer-in-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
    @keyframes drawer-in-bottom { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .animate-drawer-in-right { animation: drawer-in-right .2s ease-out; }
    .animate-drawer-in-left { animation: drawer-in-left .2s ease-out; }
    .animate-drawer-in-bottom { animation: drawer-in-bottom .2s ease-out; }
  `]
})
export class BaseDrawerComponent {
  /** Two-way bound visibility: [(open)]. Emits (openChange). */
  readonly open = model(false);
  readonly title = input('');
  /** Material Symbols name shown before the title. */
  readonly icon = input('');
  /** Which edge the drawer slides in from — 'bottom' ignores [width] (always full width, capped
   *  at 80vh) and adds a drag-handle affordance. */
  readonly side = input<'left' | 'right' | 'bottom'>('right');
  /** CSS width for side drawers, e.g. '480px' or '32rem'. Ignored when side="bottom". */
  readonly width = input('480px');
  readonly closeOnBackdrop = input(true);
  readonly showClose = input(true);

  /** Fired when the drawer closes; reason = 'button' | 'backdrop' | 'escape'. */
  readonly closed = output<string>();

  protected containerClass(): string {
    return this.side() === 'bottom' ? 'items-end' : this.side() === 'right' ? 'justify-end' : '';
  }

  protected panelClass(): string {
    if (this.side() === 'bottom') return 'animate-drawer-in-bottom w-full max-h-[80vh] rounded-t-lg';
    return (this.side() === 'left' ? 'animate-drawer-in-left' : 'animate-drawer-in-right') + ' h-full';
  }

  private readonly dialogRoot = viewChild<ElementRef<HTMLElement>>('dialogRoot');
  private openerEl: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.openerEl = document.activeElement as HTMLElement | null;
        lockBodyScroll();
        const root = this.dialogRoot()?.nativeElement;
        if (root) focusDialogOpen(root, false);
      } else {
        unlockBodyScroll();
        this.openerEl?.focus();
        this.openerEl = null;
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close('escape');
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
