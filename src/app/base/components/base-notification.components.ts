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

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BASE MODULE · Navigation — Notifications Center & Global Search
 * See Components → Navigation. Both are header-anchored overlays distinct
 * from the per-page filter search already covered by base-form's
 * `<base-search-input>`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface BaseNotification {
  id: string;
  icon?: string;
  title: string;
  message?: string;
  time: string;
  read: boolean;
}

/** Read state uses text opacity as its cue, not a background change (that's
 *  reserved for §Tables row states). Unread carries a small dot, the same
 *  token as an active nav item. */
@Component({
  selector: 'base-notifications-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-block">
      <button type="button" class="relative inline-flex items-center justify-center w-8 h-8 rounded-r-sm text-neutral-400 hover:bg-white/10 hover:text-neutral-0 transition-colors"
              aria-label="Notifications" (click)="toggle()">
        <span class="icon-outline" style="font-size:20px;" aria-hidden="true">notifications</span>
        @if (unreadCount() > 0) {
          <span class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-error"></span>
        }
      </button>

      @if (open()) {
        <div class="absolute right-0 mt-1 w-80 bg-neutral-0 border border-neutral-200 rounded-r-md overflow-hidden" style="box-shadow: var(--shadow-e3);">
          <div class="flex items-center justify-between px-sp-4 py-sp-3 border-b border-neutral-100">
            <span class="text-xs font-semibold text-ink-900">Notifications</span>
            @if (unreadCount() > 0) {
              <button type="button" class="text-[11px] font-semibold text-action hover:text-action-hover" (click)="markAllRead.emit()">Mark all read</button>
            }
          </div>
          <div class="max-h-80 overflow-y-auto">
            @for (n of notifications(); track n.id) {
              <button type="button" class="w-full flex items-start gap-sp-3 px-sp-4 py-sp-3 text-left border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors"
                      [style.opacity]="n.read ? 0.6 : 1"
                      (click)="itemClick.emit(n)">
                <span class="icon-outline shrink-0 mt-0.5" style="font-size:18px;" [class]="n.read ? 'text-neutral-400' : 'text-action'" aria-hidden="true">{{ n.icon || 'info' }}</span>
                <span class="flex-1 min-w-0">
                  <span class="block text-xs text-ink-700 truncate">{{ n.title }}</span>
                  @if (n.message) { <span class="block text-[11px] text-neutral-400 truncate">{{ n.message }}</span> }
                  <span class="block text-[10px] text-neutral-400 mt-0.5">{{ n.time }}</span>
                </span>
                @if (!n.read) { <span class="w-1.5 h-1.5 rounded-full bg-action mt-1.5 shrink-0"></span> }
              </button>
            } @empty {
              <div class="px-sp-4 py-sp-6 text-center text-[11px] text-neutral-400">No notifications</div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class BaseNotificationsPanelComponent {
  readonly notifications = input.required<BaseNotification[]>();

  readonly markAllRead = output<void>();
  readonly itemClick = output<BaseNotification>();

  protected readonly open = signal(false);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly unreadCount = () => this.notifications().filter(n => !n.read).length;

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(ev.target as Node)) this.open.set(false);
  }

  toggle(): void { this.open.update(o => !o); }
}

export interface BaseSearchResult {
  id: string;
  label: string;
  /** Shown as a tag on the right, e.g. "Tool" / "Module" / "Fleet" / "Alarm". */
  type: string;
}

/** A single global search reachable from the header, distinct from the
 *  per-page filter search. Opens a command-style overlay, not an inline
 *  expand. Results group by type, shown as a tag on the right rather than a
 *  separate section header per group, since most searches return one type. */
@Component({
  selector: 'base-global-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="flex items-center gap-2 h-8 px-sp-3 rounded-r-sm bg-white/10 text-neutral-300 hover:bg-white/15 hover:text-neutral-0 transition-colors text-xs w-64"
            (click)="open.set(true)">
      <span class="icon-outline" style="font-size:16px;" aria-hidden="true">search</span>
      <span class="flex-1 text-left">{{ placeholder() }}</span>
      <span class="text-[10px] opacity-60">esc</span>
    </button>

    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-sp-6" (keydown.escape)="close()">
        <div class="absolute inset-0 bg-ink-900/40" (click)="close()"></div>
        <div class="relative w-full max-w-lg bg-neutral-0 rounded-r-lg overflow-hidden" style="box-shadow: var(--shadow-e4);" role="dialog" aria-modal="true" aria-label="Global search">
          <div class="flex items-center gap-2 px-sp-4 py-sp-3 border-b border-neutral-100">
            <span class="icon-outline text-neutral-400" style="font-size:18px;" aria-hidden="true">search</span>
            <input #searchBox type="text" autofocus [value]="query()" (input)="onQuery($event)"
                   class="flex-1 outline-none text-sm text-ink-700 placeholder:text-neutral-300"
                   [placeholder]="placeholder()" />
            <span class="text-[10px] text-neutral-300 border border-neutral-200 rounded-r-xs px-1.5 py-0.5">esc</span>
          </div>
          <div class="max-h-80 overflow-y-auto py-1">
            @for (r of results(); track r.id) {
              <button type="button" class="w-full flex items-center justify-between px-sp-4 py-sp-2 text-left hover:bg-neutral-50 transition-colors"
                      (click)="pick(r)">
                <span class="text-xs text-ink-700">{{ r.label }}</span>
                <span class="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 bg-neutral-100 rounded-r-xs px-sp-2 py-0.5">{{ r.type }}</span>
              </button>
            } @empty {
              @if (query()) { <div class="px-sp-4 py-sp-6 text-center text-[11px] text-neutral-400">No results for "{{ query() }}"</div> }
            }
          </div>
        </div>
      </div>
    }
  `
})
export class BaseGlobalSearchComponent {
  readonly results = input<BaseSearchResult[]>([]);
  readonly placeholder = input('Search tools, fleets, modules…');

  readonly queryChange = output<string>();
  readonly resultSelect = output<BaseSearchResult>();

  protected readonly open = model(false);
  protected readonly query = signal('');

  onQuery(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.query.set(v);
    this.queryChange.emit(v);
  }

  pick(r: BaseSearchResult): void {
    this.resultSelect.emit(r);
    this.close();
  }

  close(): void {
    this.open.set(false);
    this.query.set('');
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(ev: KeyboardEvent): void {
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') {
      ev.preventDefault();
      this.open.set(true);
    }
  }
}
