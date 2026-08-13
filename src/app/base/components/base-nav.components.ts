import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseTeleportDirective } from './base-overlay.components';

export interface BaseBreadcrumbItem {
  label: string;
  /** Router path. When present, the crumb navigates via routerLink. */
  url?: string;
  /** Optional emoji/char icon shown before the label. */
  icon?: string;
}

/** Drill-down trail; the current (last) segment is always plain text, never a link. */
@Component({
  selector: 'base-breadcrumbs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav aria-label="Breadcrumb" class="flex items-center flex-wrap gap-1 text-xs">
      @for (item of items(); track $index; let last = $last; let i = $index) {
        @if (!last) {
          @if (item.url) {
            <a [routerLink]="item.url"
               class="inline-flex items-center gap-1 text-neutral-400 hover:text-action font-medium transition-colors"
               (click)="itemClick.emit({ item, index: i })">
              @if (item.icon) { <span>{{ item.icon }}</span> } {{ item.label }}
            </a>
          } @else {
            <button type="button"
                    class="inline-flex items-center gap-1 text-neutral-400 hover:text-action font-medium transition-colors"
                    (click)="itemClick.emit({ item, index: i })">
              @if (item.icon) { <span>{{ item.icon }}</span> } {{ item.label }}
            </button>
          }
          <span class="text-neutral-300 mx-0.5 select-none">{{ separator() }}</span>
        } @else {
          <span class="inline-flex items-center gap-1 text-ink-900 font-semibold" aria-current="page">
            @if (item.icon) { <span>{{ item.icon }}</span> } {{ item.label }}
          </span>
        }
      }
    </nav>
  `
})
export class BaseBreadcrumbsComponent {
  /** Ordered trail; the last item is the current page (not clickable). */
  readonly items = input.required<BaseBreadcrumbItem[]>();
  readonly separator = input('›');

  /** Fired when any non-last crumb is clicked (also fires alongside routerLink). */
  readonly itemClick = output<{ item: BaseBreadcrumbItem; index: number }>();
}

export interface BaseTabItem {
  id: string;
  label: string;
  /** Small counter badge. */
  badge?: string | number;
  disabled?: boolean;
}

/** Headless tab strip — host switches content with @if/@switch on [(activeId)]. */
@Component({
  selector: 'base-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="tablist"
         class="flex items-center gap-1"
         [class]="variant() === 'pills' ? '' : 'border-b border-neutral-200'"
         (keydown.arrowright)="moveFocus(1)" (keydown.arrowleft)="moveFocus(-1)">
      @for (t of tabs(); track t.id) {
        <button type="button" role="tab" [id]="'tab-' + t.id"
                [attr.aria-selected]="t.id === activeId()"
                [attr.tabindex]="t.id === activeId() ? 0 : -1"
                class="inline-flex items-center gap-1.5 text-xs font-semibold px-sp-4 py-sp-2 transition-colors outline-none
                       focus-visible:ring-2 focus-visible:ring-action
                       disabled:opacity-40 disabled:cursor-not-allowed"
                [class]="tabClass(t)"
                [disabled]="t.disabled"
                (click)="select(t)">
          {{ t.label }}
          @if (t.badge !== undefined) {
            <span class="text-[10px] font-bold rounded-r-full px-1.5 py-0.5"
                  [class]="t.id === activeId() ? 'bg-action-surface text-action' : 'bg-neutral-100 text-neutral-400'">
              {{ t.badge }}
            </span>
          }
        </button>
      }
    </div>
  `
})
export class BaseTabsComponent {
  readonly tabs = input.required<BaseTabItem[]>();
  /** Two-way bound active tab id: [(activeId)]. Emits (activeIdChange). */
  readonly activeId = model('');
  /** 'underline' (default) or 'pills'. */
  readonly variant = input<'underline' | 'pills'>('underline');

  /** Fired with the full tab object on selection. */
  readonly tabSelect = output<BaseTabItem>();

  private readonly host = inject(ElementRef<HTMLElement>);

  tabClass(t: BaseTabItem): string {
    const active = t.id === this.activeId();
    if (this.variant() === 'pills') {
      return active
        ? 'bg-action text-neutral-0 rounded-r-sm'
        : 'text-neutral-400 hover:text-action hover:bg-action-surface rounded-r-sm';
    }
    return active
      ? 'text-action border-b-2 border-action -mb-px'
      : 'text-neutral-400 hover:text-action border-b-2 border-transparent -mb-px';
  }

  select(t: BaseTabItem): void {
    if (t.disabled) return;
    this.activeId.set(t.id);
    this.tabSelect.emit(t);
  }

  /** Arrow-key roving tabindex to the next/previous enabled tab. */
  moveFocus(dir: 1 | -1): void {
    const list = this.tabs().filter(t => !t.disabled);
    if (!list.length) return;
    const idx = list.findIndex(t => t.id === this.activeId());
    const next = list[(idx + dir + list.length) % list.length];
    this.select(next);
    queueMicrotask(() => (this.host.nativeElement.querySelector(`#tab-${next.id}`) as HTMLElement | null)?.focus());
  }
}

export interface BaseStepperStep {
  id: string;
  label: string;
  /** Optional secondary line under the label (vertical orientation only). */
  description?: string;
  disabled?: boolean;
}

export type BaseStepperStepStatus = 'completed' | 'active' | 'upcoming';

/** Linear progress stepper — horizontal or vertical. Status per step (done /
 *  current / not-yet) is derived purely from where `[(activeId)]` sits in
 *  `[steps]`, so advancing the wizard is just moving `activeId` forward; no
 *  per-step "completed" bookkeeping needed. */
@Component({
  selector: 'base-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (orientation() === 'horizontal') {
      <div class="flex items-center w-full" role="group" [attr.aria-label]="ariaLabel() || null">
        @for (step of steps(); track step.id; let i = $index; let last = $last) {
          <button type="button" class="flex items-center gap-2 shrink-0 outline-none
                         focus-visible:ring-2 focus-visible:ring-action rounded-r-xs
                         disabled:cursor-not-allowed"
                  [disabled]="!isReachable(i)"
                  [attr.aria-current]="statusOf(i) === 'active' ? 'step' : null"
                  (click)="select(step, i)">
            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full border text-[11px] font-bold shrink-0 transition-colors"
                  [class]="circleClass(i)">
              @if (statusOf(i) === 'completed') {
                <span class="icon-outline" style="font-size:14px;" aria-hidden="true">check</span>
              } @else { {{ i + 1 }} }
            </span>
            <span class="text-xs whitespace-nowrap" [class]="labelClass(i)">{{ step.label }}</span>
          </button>
          @if (!last) {
            <span class="flex-1 h-0.5 mx-2 rounded-full transition-colors" [class]="connectorClass(i)" aria-hidden="true"></span>
          }
        }
      </div>
    } @else {
      <div class="flex flex-col" role="group" [attr.aria-label]="ariaLabel() || null">
        @for (step of steps(); track step.id; let i = $index; let last = $last) {
          <div class="flex items-stretch gap-3">
            <div class="flex flex-col items-center">
              <span class="inline-flex items-center justify-center w-6 h-6 rounded-full border text-[11px] font-bold shrink-0 transition-colors"
                    [class]="circleClass(i)">
                @if (statusOf(i) === 'completed') {
                  <span class="icon-outline" style="font-size:14px;" aria-hidden="true">check</span>
                } @else { {{ i + 1 }} }
              </span>
              @if (!last) {
                <span class="w-0.5 flex-1 my-1 min-h-[16px] rounded-full transition-colors" [class]="connectorClass(i)" aria-hidden="true"></span>
              }
            </div>
            <button type="button" class="text-left pb-4 outline-none focus-visible:ring-2 focus-visible:ring-action rounded-r-xs
                           disabled:cursor-not-allowed"
                    [disabled]="!isReachable(i)"
                    [attr.aria-current]="statusOf(i) === 'active' ? 'step' : null"
                    (click)="select(step, i)">
              <span class="block text-xs" [class]="labelClass(i)">{{ step.label }}</span>
              @if (step.description) {
                <span class="block text-[11px] text-neutral-400 mt-0.5">{{ step.description }}</span>
              }
            </button>
          </div>
        }
      </div>
    }
  `
})
export class BaseStepperComponent {
  readonly steps = input.required<BaseStepperStep[]>();
  /** Two-way bound current step id: [(activeId)]. Emits (activeIdChange). */
  readonly activeId = model('');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  /** When true (default), only completed/active steps can be clicked — no
   *  jumping ahead to a step not yet reached. Set false to allow free jumps. */
  readonly linear = input(true);
  readonly ariaLabel = input('');

  /** Fired with the step + index whenever a reachable step is clicked. */
  readonly stepSelect = output<{ step: BaseStepperStep; index: number }>();

  protected readonly activeIndex = computed(() => this.steps().findIndex(s => s.id === this.activeId()));

  protected statusOf(i: number): BaseStepperStepStatus {
    const active = this.activeIndex();
    if (active < 0) return 'upcoming';
    return i < active ? 'completed' : i === active ? 'active' : 'upcoming';
  }

  protected isReachable(i: number): boolean {
    if (this.steps()[i]?.disabled) return false;
    return !this.linear() || this.statusOf(i) !== 'upcoming';
  }

  protected circleClass(i: number): string {
    return {
      completed: 'bg-success border-success text-neutral-0',
      active: 'bg-action border-action text-neutral-0',
      upcoming: 'bg-neutral-0 border-neutral-300 text-neutral-400'
    }[this.statusOf(i)];
  }

  protected labelClass(i: number): string {
    return {
      completed: 'text-ink-900 font-semibold',
      active: 'text-action font-semibold',
      upcoming: 'text-neutral-400 font-medium'
    }[this.statusOf(i)];
  }

  /** Green once the step *leading into* the next one is done, so the filled
   *  portion always reflects progress made rather than the segment ahead. */
  protected connectorClass(i: number): string {
    return this.statusOf(i) === 'completed' ? 'bg-success' : 'bg-neutral-200';
  }

  select(step: BaseStepperStep, index: number): void {
    if (!this.isReachable(index)) return;
    this.activeId.set(step.id);
    this.stepSelect.emit({ step, index });
  }
}

export interface BaseMenuItem {
  id: string;
  label: string;
  icon?: string;
  /** Renders in red (destructive actions). */
  danger?: boolean;
  disabled?: boolean;
  /** Draws a divider line above this item. */
  dividerBefore?: boolean;
}

@Component({
  selector: 'base-dropdown-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-block">
      <button type="button"
              class="inline-flex items-center gap-1 text-xs font-semibold text-ink-600 border border-neutral-200
                     rounded-r-sm px-sp-3 py-1.5 bg-neutral-0 hover:border-action hover:text-action transition-colors
                     outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-1
                     disabled:opacity-50"
              [disabled]="disabled()"
              (click)="toggle()">
        {{ label() }} <span class="text-[9px] text-neutral-400">▼</span>
      </button>

      @if (open()) {
        <div class="absolute z-30 mt-1 min-w-40 bg-neutral-0 border border-neutral-200 rounded-r-md py-1"
             style="box-shadow: var(--shadow-e2);"
             [class.right-0]="align() === 'right'">
          @for (m of items(); track m.id) {
            @if (m.dividerBefore) { <div class="my-1 border-t border-neutral-100"></div> }
            <button type="button"
                    class="w-full text-left px-sp-3 py-1.5 text-xs flex items-center gap-2 transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed"
                    [class]="m.danger ? 'text-error hover:bg-error-surface' : 'text-ink-600 hover:bg-neutral-50'"
                    [disabled]="m.disabled"
                    (click)="pick(m)">
              @if (m.icon) { <span>{{ m.icon }}</span> } {{ m.label }}
            </button>
          }
        </div>
      }
    </div>
  `
})
export class BaseDropdownMenuComponent {
  readonly label = input('Actions');
  readonly items = input.required<BaseMenuItem[]>();
  readonly align = input<'left' | 'right'>('left');
  readonly disabled = input(false);

  /** Fired with the chosen menu item. */
  readonly itemSelect = output<BaseMenuItem>();

  protected readonly open = signal(false);
  private readonly host = inject(ElementRef<HTMLElement>);

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(ev.target as Node)) this.open.set(false);
  }

  toggle(): void { this.open.update(o => !o); }

  pick(m: BaseMenuItem): void {
    if (m.disabled) return;
    this.itemSelect.emit(m);
    this.open.set(false);
  }
}

/** Right-click/overflow-triggered menu with no trigger button of its own —
 *  call `openAt(x, y)` from a host's (contextmenu) handler:
 *  `menu.openAt($event.clientX, $event.clientY)`. */
@Component({
  selector: 'base-context-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseTeleportDirective],
  template: `
    @if (open()) {
      <div baseTeleport role="menu" class="fixed z-50 min-w-40 bg-neutral-0 border border-neutral-200 rounded-r-md py-1"
           style="box-shadow: var(--shadow-e3);" [style.top.px]="pos().y" [style.left.px]="pos().x">
        @for (m of items(); track m.id) {
          @if (m.dividerBefore) { <div class="my-1 border-t border-neutral-100"></div> }
          <button type="button"
                  class="w-full text-left px-sp-3 py-1.5 text-xs flex items-center gap-2 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
                  [class]="m.danger ? 'text-error hover:bg-error-surface' : 'text-ink-600 hover:bg-neutral-50'"
                  [disabled]="m.disabled"
                  (click)="pick(m)">
            @if (m.icon) { <span>{{ m.icon }}</span> } {{ m.label }}
          </button>
        }
      </div>
    }
  `
})
export class BaseContextMenuComponent {
  readonly items = input.required<BaseMenuItem[]>();
  readonly itemSelect = output<BaseMenuItem>();

  protected readonly open = signal(false);
  protected readonly pos = signal({ x: 0, y: 0 });

  /** Opens the menu at a fixed viewport coordinate. */
  openAt(x: number, y: number): void {
    this.pos.set({ x, y });
    this.open.set(true);
  }

  close(): void { this.open.set(false); }

  pick(m: BaseMenuItem): void {
    if (m.disabled) return;
    this.itemSelect.emit(m);
    this.close();
  }

  @HostListener('document:click')
  onDocClick(): void { if (this.open()) this.close(); }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.open()) this.close(); }
}
