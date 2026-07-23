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

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BASE MODULE · Navigation components
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── <base-breadcrumbs> ──────────────────────────────────────────────────────
export interface BaseBreadcrumbItem {
  label: string;
  /** Router path. When present, the crumb navigates via routerLink. */
  url?: string;
  /** Optional emoji/char icon shown before the label. */
  icon?: string;
}

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
               class="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
               (click)="itemClick.emit({ item, index: i })">
              @if (item.icon) { <span>{{ item.icon }}</span> } {{ item.label }}
            </a>
          } @else {
            <button type="button"
                    class="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                    (click)="itemClick.emit({ item, index: i })">
              @if (item.icon) { <span>{{ item.icon }}</span> } {{ item.label }}
            </button>
          }
          <span class="text-slate-300 mx-0.5 select-none">{{ separator() }}</span>
        } @else {
          <span class="inline-flex items-center gap-1 text-slate-800 font-semibold" aria-current="page">
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

// ── <base-tabs> ─────────────────────────────────────────────────────────────
export interface BaseTabItem {
  id: string;
  label: string;
  /** Small counter badge. */
  badge?: string | number;
  disabled?: boolean;
}

/**
 * Headless tab bar: it renders the strip and manages the active id; the host
 * switches content with @if / @switch on [(activeId)].
 */
@Component({
  selector: 'base-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="tablist"
         class="flex items-center gap-1"
         [class]="variant() === 'pills' ? '' : 'border-b border-slate-200'">
      @for (t of tabs(); track t.id) {
        <button type="button" role="tab"
                [attr.aria-selected]="t.id === activeId()"
                class="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
                [class]="tabClass(t)"
                [disabled]="t.disabled"
                (click)="select(t)">
          {{ t.label }}
          @if (t.badge !== undefined) {
            <span class="text-[10px] font-bold rounded-full px-1.5 py-0.5"
                  [class]="t.id === activeId() ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'">
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

  tabClass(t: BaseTabItem): string {
    const active = t.id === this.activeId();
    if (this.variant() === 'pills') {
      return active
        ? 'bg-indigo-600 text-white rounded-lg'
        : 'text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg';
    }
    return active
      ? 'text-indigo-700 border-b-2 border-indigo-600 -mb-px'
      : 'text-slate-500 hover:text-indigo-700 border-b-2 border-transparent -mb-px';
  }

  select(t: BaseTabItem): void {
    if (t.disabled) return;
    this.activeId.set(t.id);
    this.tabSelect.emit(t);
  }
}

// ── <base-dropdown-menu> ────────────────────────────────────────────────────
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
              class="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 border border-slate-200
                     rounded-lg px-3 py-1.5 bg-white hover:border-indigo-300 hover:text-indigo-700 transition-colors
                     disabled:opacity-50"
              [disabled]="disabled()"
              (click)="toggle()">
        {{ label() }} <span class="text-[9px] text-slate-400">▼</span>
      </button>

      @if (open()) {
        <div class="absolute z-30 mt-1 min-w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1"
             [class.right-0]="align() === 'right'">
          @for (m of items(); track m.id) {
            @if (m.dividerBefore) { <div class="my-1 border-t border-slate-100"></div> }
            <button type="button"
                    class="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed"
                    [class]="m.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-600 hover:bg-slate-50'"
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

  readonly open = signal(false);
  private readonly host = inject(ElementRef<HTMLElement>);

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(ev.target as Node)) this.open.set(false);
  }

  toggle(): void { this.open.update(o => !o); }

  pick(m: BaseMenuItem): void {
    this.itemSelect.emit(m);
    this.open.set(false);
  }
}
