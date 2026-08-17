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
import { BaseCalendarFilterValue, BaseCheckboxFilterValue, BaseFilterOption, BaseRangeFilterValue } from '../../models/table.model';
import { BaseDatepickerComponent } from '../base-datepicker.component';
import { BaseTeleportDirective } from '../base-overlay.components';

let uid = 0;

export interface FixedPopupPosition {
  top: number;
  left?: number;
  right?: number;
}

/** Viewport-fixed position for a panel anchored below `el` — escapes a
 *  `position: sticky` table header's clipping/stacking-context issues that a
 *  plain `position: absolute` panel would hit. Pair with `baseTeleport` on
 *  the panel itself. */
export function computeFixedPopupPosition(el: HTMLElement, align: 'left' | 'right', gap = 4): FixedPopupPosition {
  const r = el.getBoundingClientRect();
  return align === 'right'
    ? { top: r.bottom + gap, right: Math.max(4, window.innerWidth - r.right) }
    : { top: r.bottom + gap, left: r.left };
}

/** Sentinel value for the synthetic "(No value)" option representing null/undefined/empty cells. */
export const NO_VALUE = '__no_value__';

/** Per-column value-filter dropdown for `<base-table>`: search, checkbox
 *  list, optional sort radios. Self-contained trigger + panel — the host owns
 *  filter/sort state via [selected]/[currentSort]. */
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
            <span class="flex items-center gap-2">
              <button type="button" class="text-[11px] font-semibold text-action hover:text-action-hover"
                      (click)="clearDraft()">Clear</button>
              <button type="button" class="text-neutral-300 hover:text-neutral-500 text-xs leading-none"
                      aria-label="Close filter" (click)="close()">✕</button>
            </span>
          </div>
          <input type="text" [value]="search()" (input)="onSearch($event)" placeholder="Search"
                 class="w-full border border-neutral-200 rounded-r-sm px-2 py-1 text-[11px] mb-2
                        focus:outline-none focus:ring-1 focus:ring-action-surface" />
          <div class="max-h-36 overflow-y-auto mb-2 flex flex-col gap-1">
            @for (o of filteredOptions(); track o.value) {
              <label class="inline-flex items-center gap-1.5 text-[11px] text-ink-600 cursor-pointer"
                     [class.italic]="o.value === NO_VALUE">
                <input type="checkbox" class="cb" [checked]="draftSelected().has(o.value)"
                       (change)="toggleOption(o.value)" />
                <span class="flex-1">{{ o.label }}</span>
                @if (o.count !== undefined) { <span class="text-neutral-300 tabular-nums">{{ o.count }}</span> }
              </label>
            } @empty {
              <span class="text-[11px] text-neutral-300">No matches</span>
            }
          </div>
          @if (options().length > VIRTUALIZE_ABOVE) {
            <div class="text-[10px] text-neutral-300 mb-1">{{ options().length }} values — search to narrow down</div>
          }
          <button type="button" class="btn-primary w-full justify-center" (click)="applyFilter()">Apply</button>
        </div>
      }
    </div>
  `
})
export class BaseCheckboxFilterComponent {
  protected readonly NO_VALUE = NO_VALUE;
  /** Past this many options, the list stops trying to be clever about layout — it's a plain
   *  scrolling+searchable list either way; true windowed virtualization is deliberately out of
   *  scope here (no rendering-perf issue has actually shown up at this list's max realistic size). */
  protected readonly VIRTUALIZE_ABOVE = 200;

  readonly header = input('');
  /** Unique column values to list, each with the record count it would match against every OTHER active filter. */
  readonly options = input.required<BaseFilterOption[]>();
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
  /** Panel is teleported to document.body, so outside-click checks must test it directly too. */
  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;

  /** Ignores clicks/scrolls that originate inside the trigger or the (teleported) panel. */
  private isInside(target: Node): boolean {
    return this.host.nativeElement.contains(target) || (this.panelRef?.nativeElement.contains(target) ?? false);
  }

  private readonly closeOnScrollOrResize = (ev: Event) => {
    if (!this.isInside(ev.target as Node)) this.close();
  };

  private readonly closeOnOutsideClick = (ev: MouseEvent) => {
    if (!this.isInside(ev.target as Node)) this.close();
  };

  protected readonly filteredOptions = computed(() => {
    const q = this.search().toLowerCase();
    return q ? this.options().filter(o => o.label.toLowerCase().includes(q)) : this.options();
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close();
  }

  toggle(): void {
    if (this.open()) { this.close(); return; }
    this.draftSelected.set(new Set(this.selected()));
    this.draftSort.set(this.currentSort());
    this.search.set('');
    this.panelPos.set(computeFixedPopupPosition(this.host.nativeElement, this.align()));
    document.addEventListener('click', this.closeOnOutsideClick, true);
    document.addEventListener('scroll', this.closeOnScrollOrResize, true);
    window.addEventListener('resize', this.closeOnScrollOrResize);
    this.open.set(true);
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    document.removeEventListener('click', this.closeOnOutsideClick, true);
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

/** Per-column date-range filter dropdown — Start/End via two `<base-datepicker>`. */
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
            <span class="flex items-center gap-2">
              <button type="button" class="text-[11px] font-semibold text-action hover:text-action-hover"
                      (click)="clearDraft()">Clear</button>
              <button type="button" class="text-neutral-300 hover:text-neutral-500 text-xs leading-none"
                      aria-label="Close filter" (click)="close()">✕</button>
            </span>
          </div>
          <div class="flex flex-wrap gap-1 mb-2">
            @for (p of PRESETS; track p.label) {
              <button type="button"
                      class="rounded-r-full px-2 py-0.5 text-[10px] font-semibold transition-colors"
                      [class]="draftPreset() === p.label ? 'bg-action text-neutral-0' : 'bg-neutral-100 text-ink-500 hover:bg-action-surface hover:text-action'"
                      (click)="applyPreset(p)">{{ p.label }}</button>
            }
          </div>
          <base-datepicker label="Start Date" [value]="draftStart()" [showTime]="showTime()" [clearable]="true"
                            (valueChange)="onManualDate('start', $event)" />
          <div class="h-2"></div>
          <base-datepicker label="End Date" [value]="draftEnd()" [showTime]="showTime()" [clearable]="true"
                            [min]="draftStart()" (valueChange)="onManualDate('end', $event)" />
          <button type="button" class="btn-primary w-full justify-center mt-2" (click)="applyFilter()">Apply</button>
        </div>
      }
    </div>
  `
})
export class BaseCalendarFilterComponent {
  /** Relative presets — spec-new, one-click: sets both bounds and applies immediately. */
  protected readonly PRESETS = [
    { label: 'Last shift', hours: 8 },
    { label: 'Last 24 hours', hours: 24 },
    { label: 'Last 7 days', hours: 24 * 7 },
    { label: 'Last 30 days', hours: 24 * 30 }
  ];

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
  /** Set by a preset click; cleared the moment either date is hand-edited so a stale preset name never survives a manual tweak. */
  protected readonly draftPreset = signal<string | null>(null);
  protected readonly panelPos = signal<FixedPopupPosition>({ top: 0 });
  private readonly host = inject(ElementRef<HTMLElement>);
  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;

  private isInside(target: Node): boolean {
    return this.host.nativeElement.contains(target) || (this.panelRef?.nativeElement.contains(target) ?? false);
  }

  private readonly closeOnScrollOrResize = (ev: Event) => {
    if (!this.isInside(ev.target as Node)) this.close();
  };


  private readonly closeOnOutsideClick = (ev: MouseEvent) => {
    if (!this.isInside(ev.target as Node)) this.close();
  };

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close();
  }

  toggle(): void {
    if (this.open()) { this.close(); return; }
    this.draftStart.set(this.start());
    this.draftEnd.set(this.end());
    this.draftPreset.set(null);
    this.panelPos.set(computeFixedPopupPosition(this.host.nativeElement, this.align()));
    document.addEventListener('click', this.closeOnOutsideClick, true);
    document.addEventListener('scroll', this.closeOnScrollOrResize, true);
    window.addEventListener('resize', this.closeOnScrollOrResize);
    this.open.set(true);
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    document.removeEventListener('click', this.closeOnOutsideClick, true);
    document.removeEventListener('scroll', this.closeOnScrollOrResize, true);
    window.removeEventListener('resize', this.closeOnScrollOrResize);
  }

  onManualDate(which: 'start' | 'end', value: Date | null): void {
    this.draftPreset.set(null);
    if (which === 'start') this.draftStart.set(value); else this.draftEnd.set(value);
  }

  applyPreset(p: { label: string; hours: number }): void {
    const end = new Date();
    const start = new Date(end.getTime() - p.hours * 3_600_000);
    this.draftStart.set(start);
    this.draftEnd.set(end);
    this.draftPreset.set(p.label);
    this.applyFilter();
  }

  clearDraft(): void {
    this.draftStart.set(null);
    this.draftEnd.set(null);
    this.draftPreset.set(null);
  }

  applyFilter(): void {
    this.apply.emit({ start: this.draftStart(), end: this.draftEnd(), preset: this.draftPreset() });
    this.close();
  }
}

/** Human label for an applied calendar filter — the preset name, or an open-ended/bounded phrase
 *  built from whichever bounds are set. Both bounds are inclusive. */
export function calendarFilterLabel(v: BaseCalendarFilterValue): string {
  if (v.preset) return v.preset;
  const fmt = (d: Date) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d);
  if (v.start && v.end) return `${fmt(v.start)} – ${fmt(v.end)}`;
  if (v.start) return `After ${fmt(v.start)}`;
  if (v.end) return `Before ${fmt(v.end)}`;
  return '';
}

/** Per-column numeric range filter dropdown — From/To with inline validation. */
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
            <span class="flex items-center gap-2">
              <button type="button" class="text-[11px] font-semibold text-action hover:text-action-hover"
                      (click)="clearDraft()">Clear</button>
              <button type="button" class="text-neutral-300 hover:text-neutral-500 text-xs leading-none"
                      aria-label="Close filter" (click)="close()">✕</button>
            </span>
          </div>
          @if (buckets().length > 0) {
            <div class="flex items-end gap-px h-10 mb-2" aria-hidden="true">
              @for (b of buckets(); track $index) {
                <span class="flex-1 rounded-t-xs" [class]="b.inRange ? 'bg-action' : 'bg-neutral-200'"
                      [style.height.%]="b.pct" [title]="b.title"></span>
              }
            </div>
          }
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
  private static readonly BUCKET_COUNT = 12;

  readonly header = input('');
  readonly from = input<number | null>(null);
  readonly to = input<number | null>(null);
  /** All numeric values for this column (full row set) — powers the distribution histogram. Empty = no chart. */
  readonly values = input<number[]>([]);
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

  private readonly closeOnOutsideClick = (ev: MouseEvent) => {
    if (!this.isInside(ev.target as Node)) this.close();
  };

  protected readonly invalid = computed(() => {
    const f = this.draftFrom(), t = this.draftTo();
    return f !== null && t !== null && f > t;
  });

  /** Fixed-bucket histogram of `values()`, each bucket flagged whether it falls within the current
   *  draft [from, to] so the chart previews what the filter would keep before Apply. */
  protected readonly buckets = computed(() => {
    const vals = this.values();
    if (vals.length === 0) return [];
    const min = Math.min(...vals), max = Math.max(...vals);
    if (min === max) return [];
    const n = BaseRangeFilterComponent.BUCKET_COUNT;
    const width = (max - min) / n;
    const counts = new Array(n).fill(0);
    for (const v of vals) counts[Math.min(n - 1, Math.floor((v - min) / width))]++;
    const maxCount = Math.max(...counts);
    const f = this.draftFrom(), t = this.draftTo();
    return counts.map((count, i) => {
      const lo = min + i * width, hi = lo + width;
      const inRange = (f === null || hi >= f) && (t === null || lo <= t);
      return {
        pct: count === 0 ? 2 : Math.max(6, Math.round((count / maxCount) * 100)),
        inRange,
        title: `${lo.toFixed(1)}–${hi.toFixed(1)}: ${count}`
      };
    });
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close();
  }

  toggle(): void {
    if (this.open()) { this.close(); return; }
    this.draftFrom.set(this.from());
    this.draftTo.set(this.to());
    this.panelPos.set(computeFixedPopupPosition(this.host.nativeElement, this.align()));
    document.addEventListener('click', this.closeOnOutsideClick, true);
    document.addEventListener('scroll', this.closeOnScrollOrResize, true);
    window.addEventListener('resize', this.closeOnScrollOrResize);
    this.open.set(true);
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    document.removeEventListener('click', this.closeOnOutsideClick, true);
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
