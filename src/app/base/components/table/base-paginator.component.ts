import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { BasePageEvent } from '../../models/table.model';

@Component({
  selector: 'base-paginator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
      <span class="text-[11px] text-neutral-400 tabular-nums">
        @if (unknownTotal()) {
          @if (currentCount() > 0) {
            Showing <b class="text-ink-700">{{ rangeStart() }}</b>–<b class="text-ink-700">{{ rangeEnd() }}</b>
          } @else { No records }
        } @else if (pageCountOverride() > 0) {
          Page <b class="text-ink-700">{{ page() }}</b> of <b class="text-ink-700">{{ pageCount() }}</b>
        } @else if (total() > 0) {
          Showing <b class="text-ink-700">{{ rangeStart() }}</b>–<b class="text-ink-700">{{ rangeEnd() }}</b> of <b class="text-ink-700">{{ total() }}</b>
        } @else { No records }
      </span>

      <span class="flex items-center gap-2.5">
        @if (showPageEntry()) {
          <span class="flex items-center gap-1.5">
            <label class="flex items-center gap-1.5" for="basePaginatorGoTo">
              Go to
              <input id="basePaginatorGoTo" type="number" min="1" [max]="pageCount()" [value]="goToValue()"
                     [disabled]="disabled()"
                     class="w-14 border rounded-r-sm px-1.5 py-1 text-xs text-ink-700 bg-neutral-0 tabular-nums
                            focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed"
                     [class]="goToError() ? 'border-error focus:ring-error' : 'border-neutral-200 focus:ring-action-surface'"
                     (input)="onGoToInput($event)" (keydown.enter)="onGoToSubmit()" (blur)="onGoToSubmit()"
                     aria-label="Go to page" />
            </label>
            of {{ pageCount() }}
          </span>
        }
        @if (showPageSize()) {
          <select class="border border-neutral-200 rounded-r-sm px-1.5 py-1 text-xs text-ink-600 bg-neutral-0
                         disabled:opacity-50 disabled:cursor-not-allowed"
                  [disabled]="disabled()" (change)="onPageSize($event)" aria-label="Rows per page">
            @for (s of pageSizeOptions(); track s) {
              <!-- [selected] per-option, not [value] on the select: a [value] binding on the
                   host can apply before these @for-generated <option>s exist in the DOM, so the
                   browser finds nothing to match and silently shows the first option instead. -->
              <option [value]="s" [selected]="s === pageSize()">{{ s }} / page</option>
            }
          </select>
        }
        @if (showSteps()) {
          <button class="btn-ghost" [disabled]="disabled() || page() <= 1" (click)="go(1)" aria-label="First page">«</button>
          <button class="btn-ghost" [disabled]="disabled() || page() <= 1" (click)="go(page() - 1)" aria-label="Previous page">‹ Prev</button>
          @if (!unknownTotal()) {
            @for (p of pageItems(); track $index) {
              @if (p === '…') {
                <span class="px-1.5 text-neutral-300 select-none" aria-hidden="true">…</span>
              } @else {
                <button class="rounded-r-sm px-2.5 py-1 text-xs font-semibold transition-colors tabular-nums
                               disabled:opacity-50 disabled:cursor-not-allowed"
                        [class]="p === page()
                          ? 'bg-action text-neutral-0'
                          : 'text-ink-600 hover:bg-action-surface hover:text-action'"
                        [disabled]="disabled()"
                        [attr.aria-current]="p === page() ? 'page' : null"
                        (click)="go(p)">{{ p }}</button>
              }
            }
          }
          @if (unknownTotal()) {
            <button class="btn-ghost" [disabled]="disabled() || !hasNext()" (click)="go(page() + 1)" aria-label="Next page">Next ›</button>
          } @else {
            <button class="btn-ghost" [disabled]="disabled() || page() >= pageCount()" (click)="go(page() + 1)" aria-label="Next page">Next ›</button>
            <button class="btn-ghost" [disabled]="disabled() || page() >= pageCount()" (click)="go(pageCount())" aria-label="Last page">»</button>
          }
        }
      </span>
    </div>
    @if (goToError()) {
      <p class="mt-1 text-right text-[11px] text-error-text">{{ goToError() }}</p>
    }
  `
})
export class BasePaginatorComponent {
  readonly page = input.required<number>();
  readonly pageSize = input(10);
  readonly total = input.required<number>();
  readonly pageCountOverride = input(0);
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  readonly showPageSize = input(true);
  readonly maxButtons = input(5);
  /** Page count at/above which the "Go to" direct-entry field appears — repeated clicking through a large result set otherwise. */
  readonly pageEntryThreshold = input(10);
  /** Disables every interactive control (e.g. while unsaved edits block paging) without hiding the footer's summary text. */
  readonly disabled = input(false);

  readonly unknownTotal = input(false);
  readonly currentCount = input(0);
  readonly hasNext = input(true);

  readonly pageChange = output<BasePageEvent>();

  protected readonly pageCount = computed(() =>
    this.pageCountOverride() > 0
      ? this.pageCountOverride()
      : Math.max(1, Math.ceil(this.total() / this.pageSize()))
  );
  /** Total is unknown → entry and page numbers both suppress (nothing to count against). A single known page → the whole stepper (numbers + first/prev/next/last) hides too, not just the entry. */
  protected readonly showPageEntry = computed(() => !this.unknownTotal() && this.pageCount() >= this.pageEntryThreshold());
  protected readonly showSteps = computed(() => this.unknownTotal() || this.pageCount() > 1);

  protected readonly goToValue = signal('');
  protected readonly goToError = signal<string | null>(null);
  protected readonly rangeStart = computed(() =>
    this.unknownTotal() ? (this.currentCount() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1)
    : this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1
  );
  protected readonly rangeEnd = computed(() =>
    this.unknownTotal() ? this.rangeStart() + Math.max(0, this.currentCount() - 1)
    : Math.min(this.page() * this.pageSize(), this.total())
  );

  protected readonly pageItems = computed<(number | '…')[]>(() => {
    const count = this.pageCount(), max = this.maxButtons(), cur = this.page();
    if (count <= max + 2) return Array.from({ length: count }, (_, i) => i + 1);

    const inner = Math.max(1, max - 2);
    let start = Math.max(2, cur - Math.floor(inner / 2));
    let end = Math.min(count - 1, start + inner - 1);
    start = Math.max(2, end - inner + 1);

    const items: (number | '…')[] = [1];
    if (start > 2) items.push('…');
    for (let p = start; p <= end; p++) items.push(p);
    if (end < count - 1) items.push('…');
    items.push(count);
    return items;
  });

  go(p: number): void {
    if (this.disabled()) return;
    const clamped = this.unknownTotal() ? Math.max(1, p) : Math.min(Math.max(1, p), this.pageCount());
    if (clamped !== this.page()) this.pageChange.emit({ page: clamped, pageSize: this.pageSize() });
  }

  onPageSize(ev: Event): void {
    if (this.disabled()) return;
    const size = Number((ev.target as HTMLSelectElement).value);
    // Pass the *current* page through rather than forcing 1 — the host
    // (BaseTableComponent) resolves which page actually keeps the first
    // visible row in view for the new size; this component has no row data
    // of its own to compute that with.
    this.pageChange.emit({ page: this.page(), pageSize: size });
  }

  onGoToInput(ev: Event): void {
    this.goToValue.set((ev.target as HTMLInputElement).value);
    this.goToError.set(null);
  }

  /** Out of range never clamps silently — it reports the bounds and holds the current page. */
  onGoToSubmit(): void {
    if (this.disabled()) return;
    const raw = this.goToValue().trim();
    if (!raw) { this.goToError.set(null); return; }
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 1 || n > this.pageCount()) {
      this.goToError.set(`Only ${this.pageCount()} page${this.pageCount() === 1 ? '' : 's'} available.`);
      return;
    }
    this.goToError.set(null);
    this.goToValue.set('');
    this.go(n);
  }
}

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
  readonly debounceMs = input(250);

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
