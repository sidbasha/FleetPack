import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { BasePageEvent } from '../../models/table.model';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * <base-paginator>
 * Standalone pagination control. Used internally by <base-table>, and reusable
 * with any list/grid. Fully controlled: parent owns [page]; the component
 * emits (pageChange) and never mutates state silently.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'base-paginator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
      <span class="text-[11px] text-neutral-400 tabular-nums">
        @if (pageCountOverride() > 0) {
          Page <b class="text-ink-700">{{ page() }}</b> of <b class="text-ink-700">{{ pageCount() }}</b>
        } @else if (total() > 0) {
          Showing <b class="text-ink-700">{{ rangeStart() }}</b>–<b class="text-ink-700">{{ rangeEnd() }}</b> of <b class="text-ink-700">{{ total() }}</b>
        } @else { No records }
      </span>

      <span class="flex items-center gap-1.5">
        @if (showPageSize()) {
          <select class="border border-neutral-200 rounded-r-sm px-1.5 py-1 text-xs text-ink-600 bg-neutral-0"
                  [value]="pageSize()" (change)="onPageSize($event)" aria-label="Rows per page">
            @for (s of pageSizeOptions(); track s) { <option [value]="s">{{ s }} / page</option> }
          </select>
        }
        <button class="btn-ghost" [disabled]="page() <= 1" (click)="go(1)" aria-label="First page">«</button>
        <button class="btn-ghost" [disabled]="page() <= 1" (click)="go(page() - 1)" aria-label="Previous page">‹ Prev</button>
        @for (p of pageWindow(); track p) {
          <button class="rounded-r-sm px-2.5 py-1 text-xs font-semibold transition-colors tabular-nums"
                  [class]="p === page()
                    ? 'bg-action text-neutral-0'
                    : 'text-ink-600 hover:bg-action-surface hover:text-action'"
                  (click)="go(p)">{{ p }}</button>
        }
        <button class="btn-ghost" [disabled]="page() >= pageCount()" (click)="go(page() + 1)" aria-label="Next page">Next ›</button>
        <button class="btn-ghost" [disabled]="page() >= pageCount()" (click)="go(pageCount())" aria-label="Last page">»</button>
      </span>
    </div>
  `
})
export class BasePaginatorComponent {
  /** 1-based current page. */
  readonly page = input.required<number>();
  readonly pageSize = input(10);
  /** Total record count (after filtering). */
  readonly total = input.required<number>();
  /** When the host only knows the page count (not the total), set it here;
   *  the label switches to 'Page X of Y'. 0 = off. */
  readonly pageCountOverride = input(0);
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  readonly showPageSize = input(true);
  /** How many numbered page buttons to show. */
  readonly maxButtons = input(5);

  /** Fired on any page or page-size change. */
  readonly pageChange = output<BasePageEvent>();

  protected readonly pageCount = computed(() =>
    this.pageCountOverride() > 0
      ? this.pageCountOverride()
      : Math.max(1, Math.ceil(this.total() / this.pageSize()))
  );
  protected readonly rangeStart = computed(() => this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1);
  protected readonly rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  protected readonly pageWindow = computed(() => {
    const count = this.pageCount(), max = this.maxButtons();
    let start = Math.max(1, this.page() - Math.floor(max / 2));
    const end = Math.min(count, start + max - 1);
    start = Math.max(1, end - max + 1);
    const out: number[] = [];
    for (let p = start; p <= end; p++) out.push(p);
    return out;
  });

  go(p: number): void {
    const clamped = Math.min(Math.max(1, p), this.pageCount());
    if (clamped !== this.page()) this.pageChange.emit({ page: clamped, pageSize: this.pageSize() });
  }

  onPageSize(ev: Event): void {
    const size = Number((ev.target as HTMLSelectElement).value);
    this.pageChange.emit({ page: 1, pageSize: size });
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * <base-search-input>
 * Debounced text input for quick filtering. Reusable with any list or table.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'base-search-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="relative inline-flex items-center">
      <span class="icon-outline absolute left-2.5 text-neutral-300 pointer-events-none" style="font-size:16px;" aria-hidden="true">search</span>
      <input type="text" [value]="value()" [placeholder]="placeholder()"
             class="h-9 border border-neutral-200 rounded-r-sm pl-8 pr-7 text-xs text-ink-700 bg-neutral-0
                    focus:outline-none focus:ring-2 focus:ring-action-surface focus:border-action w-56"
             (input)="onInput($event)" />
      @if (value()) {
        <button class="absolute right-2 text-neutral-300 hover:text-neutral-500 text-xs" (click)="clear()"
                aria-label="Clear search">✕</button>
      }
    </label>
  `
})
export class BaseSearchInputComponent {
  readonly placeholder = input('Search…');
  /** Debounce in ms before (search) fires. */
  readonly debounceMs = input(250);

  /** Debounced search text. Empty string when cleared. */
  readonly search = output<string>();

  readonly value = signal('');
  private timer: ReturnType<typeof setTimeout> | null = null;

  onInput(ev: Event): void {
    const text = (ev.target as HTMLInputElement).value;
    this.value.set(text);
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.search.emit(text.trim()), this.debounceMs());
  }

  clear(): void {
    this.value.set('');
    if (this.timer) clearTimeout(this.timer);
    this.search.emit('');
  }
}
