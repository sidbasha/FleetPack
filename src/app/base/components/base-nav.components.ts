import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
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

/** A breadcrumb's current (last) segment is always plain text, never a link
 *  — it duplicates the page the user is already on. Should mirror the
 *  drill-down the user actually took, not the URL structure. */
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

/**
 * Headless tab bar: it renders the strip and manages the active id; the host
 * switches content with @if / @switch on [(activeId)]. Only the active tab
 * is a Tab stop; arrow keys move selection, making every tab reachable in
 * one Tab press.
 */
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

  /** Arrow-key roving tabindex: moves selection to the next/previous
   *  enabled tab and focuses it, without requiring a second Tab press. */
  moveFocus(dir: 1 | -1): void {
    const list = this.tabs().filter(t => !t.disabled);
    if (!list.length) return;
    const idx = list.findIndex(t => t.id === this.activeId());
    const next = list[(idx + dir + list.length) % list.length];
    this.select(next);
    queueMicrotask(() => (this.host.nativeElement.querySelector(`#tab-${next.id}`) as HTMLElement | null)?.focus());
  }
}

export interface BaseMenuItem {
  id: string;
  label: string;
  icon?: string;
  /** Renders in red (destructive actions). */
  danger?: boolean;
  disabled?: boolean;
  /** Draws a divider line above this item — destructive items should
   *  always be separated this way, never placed first in the list. */
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

/**
 * Right-click or overflow-icon triggered; closes on selection, Escape, or
 * outside click. Destructive items are visually separated by a divider and
 * colored, never the first item in the list (reuses `BaseMenuItem`, same
 * rule as `<base-dropdown-menu>`). Unlike the dropdown, it has no trigger
 * button of its own — call `openAt(x, y)` from a host's (contextmenu)
 * handler:
 *   <div (contextmenu)="menu.openAt($event.clientX, $event.clientY); $event.preventDefault()">
 *   <base-context-menu #menu [items]="rowActions" (itemSelect)="onAction($event)" />
 */
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

  /** Opens the menu at a fixed viewport coordinate, e.g. from
   *  `$event.clientX/clientY` inside a (contextmenu) handler. */
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
