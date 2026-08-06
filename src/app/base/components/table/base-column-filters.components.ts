import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { BaseCalendarFilterValue, BaseCheckboxFilterValue, BaseRangeFilterValue } from '../../models/table.model';
import { BaseDatepickerComponent } from '../base-datepicker.component';
import { BaseTeleportDirective } from '../base-overlay.components';

let uid = 0;

export interface FixedPopupPosition {
  top: number;
  left?: number;
  right?: number;
}

/**
 * Viewport-fixed position for a dropdown panel anchored just below `el`. Table column
 * headers can sit inside a `position: sticky` `<th>` within an `overflow-y: auto` scroll
 * container ([stickyHeader] + [maxHeight]) — a plain `position: absolute` panel would get
 * clipped by that container and drift out of sync with the trigger during scroll. Computing
 * a `position: fixed` top/left from `getBoundingClientRect()` escapes both problems, the same
 * technique `BaseTooltipDirective` already uses for tooltips. Pair with `baseTeleport` on the
 * panel so its z-index also escapes the header's `position: sticky` stacking context (a fixed
 * descendant of a stacking-context ancestor only out-ranks *siblings within that ancestor* —
 * it does not out-rank the ancestor's own siblings, e.g. the *next* column's `<th>`).
 */
export function computeFixedPopupPosition(el: HTMLElement, align: 'left' | 'right', gap = 4): FixedPopupPosition {
  const r = el.getBoundingClientRect();
  return align === 'right'
    ? { top: r.bottom + gap, right: Math.max(4, window.innerWidth - r.right) }
    : { top: r.bottom + gap, left: r.left };
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * <base-checkbox-filter>
 * Per-column "Value Filter" dropdown for <base-table>: search box, checkbox list
 * of unique values, optional Sort Asc/Desc radios, Clear link, Apply button.
 * Self-contained trigger + panel (like <base-dropdown-menu>) — the host owns the
 * actual filter/sort state and passes it back in via [selected]/[currentSort].
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'base-checkbox-filter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseTeleportDirective],
  template: `
    <div class="relative inline-block normal-case font-normal">
      <button type="button"
              class="inline-flex items-center justify-center w-5 h-5 rounded-r-xs hover:bg-neutral-100 transition-colors"
              [class.text-action]="active()" [class.text-neutral-300]="!active()"
              [attr.aria-label]="'Filter ' + header()"
              (click)="toggle()">▽</button>

      @if (open()) {
        <div baseTeleport #panel class="fixed z-30 w-52 bg-neutral-0 border border-neutral-200 rounded-r-lg shadow-lg p-3 text-left"
             [style.top.px]="panelPos().top" [style.left.px]="panelPos().left" [style.right.px]="panelPos().right">
          @if (sortable()) {
            <div class="text-[11px] font-semibold text-ink-500 mb-1.5">Sort by</div>
            <div class="flex items-center gap-3 mb-2 pb-2 border-b border-neutral-100">
              <label class="inline-flex items-center gap-1.5 text-[11px] text-ink-600 cursor-pointer">
                <input type="radio" [name]="radioName" class="cb"
                       [checked]="draftSort() === 'asc'" (change)="draftSort.set('asc')" /> Asc
              </label>
              <label class="inline-flex items-center gap-1.5 text-[11px] text-ink-600 cursor-pointer">
                <input type="radio" [name]="radioName" class="cb"
                       [checked]="draftSort() === 'desc'" (change)="draftSort.set('desc')" /> Desc
              </label>
            </div>
          }
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[11px] font-semibold text-ink-500">Filter</span>
            <button type="button" class="text-[11px] font-semibold text-action hover:text-action-hover"
                    (click)="clearDraft()">Clear</button>
          </div>
          <input type="text" [value]="search()" (input)="onSearch($event)" placeholder="Search"
                 class="w-full border border-neutral-200 rounded-r-sm px-2 py-1 text-[11px] mb-2
                        focus:outline-none focus:ring-1 focus:ring-action-surface" />
          <div class="max-h-36 overflow-y-auto mb-2 flex flex-col gap-1">
            @for (o of filteredOptions(); track o.value) {
              <label class="inline-flex items-center gap-1.5 text-[11px] text-ink-600 cursor-pointer">
                <input type="checkbox" class="cb" [checked]="draftSelected().has(o.value)"
                       (change)="toggleOption(o.value)" />
                {{ o.label }}
              </label>
            } @empty {
              <span class="text-[11px] text-neutral-300">No matches</span>
            }
          </div>
          <button type="button" class="btn-primary w-full justify-center" (click)="applyFilter()">Apply</button>
        </div>
      }
    </div>
  `
})
export class BaseCheckboxFilterComponent {
  readonly header = input('');
  /** Unique column values to list. */
  readonly options = input.required<{ value: string; label: string }[]>();
  /** Currently applied selection (seeds the draft when the panel opens). */
  readonly selected = input<string[]>([]);
  /** Show the Sort Asc/Desc radios (when the column is also sortable). */
  readonly sortable = input(false);
  readonly currentSort = input<'asc' | 'desc' | null>(null);
  /** Colors the trigger icon blue when this column has an active filter. */
  readonly active = input(false);
  readonly align = input<'left' | 'right'>('left');

  /** Fired on Apply with the selected values + chosen sort direction. */
  readonly apply = output<BaseCheckboxFilterValue>();

  protected readonly open = signal(false);
  protected readonly search = signal('');
  protected readonly draftSelected = signal<Set<string>>(new Set());
  protected readonly draftSort = signal<'asc' | 'desc' | null>(null);
  protected readonly panelPos = signal<FixedPopupPosition>({ top: 0 });
  protected readonly radioName = `bcf-sort-${++uid}`;
  private readonly host = inject(ElementRef<HTMLElement>);
  /** `baseTeleport` moves the panel to document.body, so outside-click/scroll checks must
   *  also test against it directly — it's no longer a DOM descendant of `host`. */
  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;

  /** Ignores clicks/scrolls that originate inside the trigger or the (teleported) panel. */
  private isInside(target: Node): boolean {
    return this.host.nativeElement.contains(target) || (this.panelRef?.nativeElement.contains(target) ?? false);
  }

  private readonly closeOnScrollOrResize = (ev: Event) => {
    if (!this.isInside(ev.target as Node)) this.close();
  };

  protected readonly filteredOptions = computed(() => {
    const q = this.search().toLowerCase();
    return q ? this.options().filter(o => o.label.toLowerCase().includes(q)) : this.options();
  });

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.open() && !this.isInside(ev.target as Node)) this.close();
  }

  toggle(): void {
    if (this.open()) { this.close(); return; }
    this.draftSelected.set(new Set(this.selected()));
    this.draftSort.set(this.currentSort());
    this.search.set('');
    this.panelPos.set(computeFixedPopupPosition(this.host.nativeElement, this.align()));
    document.addEventListener('scroll', this.closeOnScrollOrResize, true);
    window.addEventListener('resize', this.closeOnScrollOrResize);
    this.open.set(true);
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    document.removeEventListener('scroll', this.closeOnScrollOrResize, true);
    window.removeEventListener('resize', this.closeOnScrollOrResize);
  }

  onSearch(ev: Event): void {
    this.search.set((ev.target as HTMLInputElement).value);
  }

  toggleOption(value: string): void {
    this.draftSelected.update(s => {
      const next = new Set(s);
      if (next.has(value)) next.delete(value); else next.add(value);
      return next;
    });
  }

  /** Resets this panel's own selection/sort draft — does not apply or close. */
  clearDraft(): void {
    this.draftSelected.set(new Set());
    this.draftSort.set(null);
  }

  applyFilter(): void {
    this.apply.emit({ selected: [...this.draftSelected()], sort: this.draftSort() });
    this.close();
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * <base-calendar-filter>
 * Per-column "Calendar / Date-Range Filter" dropdown: Start Date / End Date via
 * two <base-datepicker>, Clear link, Apply button. Dependency-free (no
 * ngx-daterangepicker-bootstrap) — reuses the base module's own datepicker.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'base-calendar-filter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseDatepickerComponent, BaseTeleportDirective],
  template: `
    <div class="relative inline-block normal-case font-normal">
      <button type="button"
              class="inline-flex items-center justify-center w-5 h-5 rounded-r-xs hover:bg-neutral-100 transition-colors"
              [class.text-action]="active()" [class.text-neutral-300]="!active()"
              [attr.aria-label]="'Date filter ' + header()"
              (click)="toggle()">📅</button>

      @if (open()) {
        <div baseTeleport #panel class="fixed z-30 w-56 bg-neutral-0 border border-neutral-200 rounded-r-lg shadow-lg p-3 text-left"
             [style.top.px]="panelPos().top" [style.left.px]="panelPos().left" [style.right.px]="panelPos().right">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-semibold text-ink-500">Date Filter</span>
            <button type="button" class="text-[11px] font-semibold text-action hover:text-action-hover"
                    (click)="clearDraft()">Clear</button>
          </div>
          <base-datepicker label="Start Date" [value]="draftStart()" [showTime]="showTime()" [clearable]="true"
                            (valueChange)="draftStart.set($event)" />
          <div class="h-2"></div>
          <base-datepicker label="End Date" [value]="draftEnd()" [showTime]="showTime()" [clearable]="true"
                            [min]="draftStart()" (valueChange)="draftEnd.set($event)" />
          <button type="button" class="btn-primary w-full justify-center mt-2" (click)="applyFilter()">Apply</button>
        </div>
      }
    </div>
  `
})
export class BaseCalendarFilterComponent {
  readonly header = input('');
  readonly start = input<Date | null>(null);
  readonly end = input<Date | null>(null);
  /** DateTime columns: adds HH:MM boxes to both pickers. */
  readonly showTime = input(false);
  readonly active = input(false);
  readonly align = input<'left' | 'right'>('left');

  readonly apply = output<BaseCalendarFilterValue>();

  protected readonly open = signal(false);
  protected readonly draftStart = signal<Date | null>(null);
  protected readonly draftEnd = signal<Date | null>(null);
  protected readonly panelPos = signal<FixedPopupPosition>({ top: 0 });
  private readonly host = inject(ElementRef<HTMLElement>);
  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;

  private isInside(target: Node): boolean {
    return this.host.nativeElement.contains(target) || (this.panelRef?.nativeElement.contains(target) ?? false);
  }

  private readonly closeOnScrollOrResize = (ev: Event) => {
    if (!this.isInside(ev.target as Node)) this.close();
  };

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.open() && !this.isInside(ev.target as Node)) this.close();
  }

  toggle(): void {
    if (this.open()) { this.close(); return; }
    this.draftStart.set(this.start());
    this.draftEnd.set(this.end());
    this.panelPos.set(computeFixedPopupPosition(this.host.nativeElement, this.align()));
    document.addEventListener('scroll', this.closeOnScrollOrResize, true);
    window.addEventListener('resize', this.closeOnScrollOrResize);
    this.open.set(true);
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    document.removeEventListener('scroll', this.closeOnScrollOrResize, true);
    window.removeEventListener('resize', this.closeOnScrollOrResize);
  }

  clearDraft(): void {
    this.draftStart.set(null);
    this.draftEnd.set(null);
  }

  applyFilter(): void {
    this.apply.emit({ start: this.draftStart(), end: this.draftEnd() });
    this.close();
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * <base-range-filter>
 * Per-column "Numeric Range Filter" dropdown: From/To number inputs, inline
 * validation ("Enter Valid Range" when From > To, Apply disabled), Clear link.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'base-range-filter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseTeleportDirective],
  template: `
    <div class="relative inline-block normal-case font-normal">
      <button type="button"
              class="inline-flex items-center justify-center w-5 h-5 rounded-r-xs hover:bg-neutral-100 transition-colors"
              [class.text-action]="active()" [class.text-neutral-300]="!active()"
              [attr.aria-label]="'Range filter ' + header()"
              (click)="toggle()">▽</button>

      @if (open()) {
        <div baseTeleport #panel class="fixed z-30 w-56 bg-neutral-0 border border-neutral-200 rounded-r-lg shadow-lg p-3 text-left"
             [style.top.px]="panelPos().top" [style.left.px]="panelPos().left" [style.right.px]="panelPos().right">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-semibold text-ink-500">Range Filter</span>
            <button type="button" class="text-[11px] font-semibold text-action hover:text-action-hover"
                    (click)="clearDraft()">Clear</button>
          </div>
          <div class="flex items-center gap-1.5">
            <input type="number" [value]="draftFrom() ?? ''" (input)="onFrom($event)"
                   class="w-16 border border-neutral-200 rounded-r-sm px-1.5 py-1 text-[11px] text-center
                          focus:outline-none focus:ring-1 focus:ring-action-surface" />
            <span class="text-[10px] text-neutral-400 whitespace-nowrap">≤ Value ≤</span>
            <input type="number" [value]="draftTo() ?? ''" (input)="onTo($event)"
                   class="w-16 border border-neutral-200 rounded-r-sm px-1.5 py-1 text-[11px] text-center
                          focus:outline-none focus:ring-1 focus:ring-action-surface" />
          </div>
          @if (invalid()) {
            <div class="text-[10px] font-medium text-error mt-1">Enter Valid Range</div>
          }
          <button type="button" class="btn-primary w-full justify-center mt-2" [disabled]="invalid()"
                  (click)="applyFilter()">Apply</button>
        </div>
      }
    </div>
  `
})
export class BaseRangeFilterComponent {
  readonly header = input('');
  readonly from = input<number | null>(null);
  readonly to = input<number | null>(null);
  readonly active = input(false);
  readonly align = input<'left' | 'right'>('left');

  readonly apply = output<BaseRangeFilterValue>();

  protected readonly open = signal(false);
  protected readonly draftFrom = signal<number | null>(null);
  protected readonly draftTo = signal<number | null>(null);
  protected readonly panelPos = signal<FixedPopupPosition>({ top: 0 });
  private readonly host = inject(ElementRef<HTMLElement>);
  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;

  private isInside(target: Node): boolean {
    return this.host.nativeElement.contains(target) || (this.panelRef?.nativeElement.contains(target) ?? false);
  }

  private readonly closeOnScrollOrResize = (ev: Event) => {
    if (!this.isInside(ev.target as Node)) this.close();
  };

  protected readonly invalid = computed(() => {
    const f = this.draftFrom(), t = this.draftTo();
    return f !== null && t !== null && f > t;
  });

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.open() && !this.isInside(ev.target as Node)) this.close();
  }

  toggle(): void {
    if (this.open()) { this.close(); return; }
    this.draftFrom.set(this.from());
    this.draftTo.set(this.to());
    this.panelPos.set(computeFixedPopupPosition(this.host.nativeElement, this.align()));
    document.addEventListener('scroll', this.closeOnScrollOrResize, true);
    window.addEventListener('resize', this.closeOnScrollOrResize);
    this.open.set(true);
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    document.removeEventListener('scroll', this.closeOnScrollOrResize, true);
    window.removeEventListener('resize', this.closeOnScrollOrResize);
  }

  onFrom(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.draftFrom.set(v === '' ? null : Number(v));
  }

  onTo(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.draftTo.set(v === '' ? null : Number(v));
  }

  clearDraft(): void {
    this.draftFrom.set(null);
    this.draftTo.set(null);
  }

  applyFilter(): void {
    if (this.invalid()) return;
    this.apply.emit({ from: this.draftFrom(), to: this.draftTo() });
    this.close();
  }
}
