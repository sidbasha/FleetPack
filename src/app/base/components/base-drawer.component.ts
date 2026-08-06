import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  model,
  output
} from '@angular/core';

/**
 * Content-projected side drawer (slide-over panel).
 *   <base-drawer [(open)]="showInspector" title="Alarm Info" side="right" width="420px">
 *     ...body...
 *     <div footer>...action buttons...</div>
 *   </base-drawer>
 */
@Component({
  selector: 'base-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-40 flex" [class.justify-end]="side() === 'right'">
        <div class="absolute inset-0 bg-ink-900/40" (click)="closeOnBackdrop() && close('backdrop')"></div>
        <div class="relative bg-neutral-0 h-full flex flex-col" style="box-shadow: var(--shadow-e4);"
             [class]="side() === 'left' ? 'animate-drawer-in-left' : 'animate-drawer-in-right'"
             [style.width]="width()" role="dialog" aria-modal="true" [attr.aria-label]="title()">
          @if (title() || showClose()) {
            <div class="flex items-center justify-between px-sp-5 py-sp-4 border-b border-neutral-100 shrink-0">
              <span class="font-display text-display-md text-ink-900">{{ title() }}</span>
              @if (showClose()) {
                <button type="button" class="text-neutral-300 hover:text-neutral-500 text-sm" (click)="close('button')"
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
    .animate-drawer-in-right { animation: drawer-in-right .2s ease-out; }
    .animate-drawer-in-left { animation: drawer-in-left .2s ease-out; }
  `]
})
export class BaseDrawerComponent {
  /** Two-way bound visibility: [(open)]. Emits (openChange). */
  readonly open = model(false);
  readonly title = input('');
  /** Which edge the drawer slides in from. */
  readonly side = input<'left' | 'right'>('right');
  /** CSS width, e.g. '420px' or '32rem'. */
  readonly width = input('420px');
  readonly closeOnBackdrop = input(true);
  readonly showClose = input(true);

  /** Fired when the drawer closes; reason = 'button' | 'backdrop' | 'escape'. */
  readonly closed = output<string>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close('escape');
  }

  close(reason: string): void {
    this.open.set(false);
    this.closed.emit(reason);
  }
}
