import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  WritableSignal,
  computed,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core';

interface DayCell {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  disabled: boolean;
}

export type DateRangePreset = 'all' | 'last1' | 'last7' | 'last30' | 'custom';

export interface DateRangeTime {
  h: number;
  m: number;
}

export interface DateRangeValue {
  preset: DateRangePreset;
  from: Date | null;
  to: Date | null;
  fromTime?: DateRangeTime;
  toTime?: DateRangeTime;
}

type TimePart = 'fromH' | 'fromM' | 'toH' | 'toM';

const strip = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date | null, b: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const pad2 = (n: number) => String(n).padStart(2, '0');

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'last1', label: 'Last 1 Day' },
  { id: 'last7', label: 'Last 7 Days' },
  { id: 'last30', label: 'Last 30 Days' },
  { id: 'custom', label: 'Custom range' }
];

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * <base-date-range-picker>
 * Dependency-free dropdown: quick-range sidebar (All / Last 1-7-30 Days / Custom
 * range) + dual side-by-side month calendars with per-side HH:MM time boxes.
 *  - two-way [(value)] (DateRangeValue), only committed on Apply (Cancel reverts)
 *  - future dates disabled (strikethrough) unless [disableFuture]="false"
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'base-date-range-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-block">
      <button type="button"
              class="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 border border-neutral-200
                     rounded-r-sm px-3 py-1.5 bg-neutral-0 hover:border-action hover:text-action-hover transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
              [disabled]="disabled()"
              (click)="toggle()">
        <span class="text-neutral-400">📅</span>
        {{ triggerLabel() }}
        <span class="text-[9px] text-neutral-400">▼</span>
      </button>

      @if (open()) {
        <div class="absolute z-30 mt-1 flex bg-neutral-0 border border-neutral-200 rounded-r-lg shadow-lg overflow-hidden w-[600px] max-w-[calc(100vw-1.5rem)]"
             [class.right-0]="align() === 'right'"
             [class.left-0]="align() === 'left'">
          <!-- quick-range sidebar -->
          <div class="w-32 shrink-0 border-r border-neutral-100 py-3 px-2 flex flex-col gap-1">
            @for (p of presets; track p.id) {
              <button type="button"
                      class="text-left text-xs font-semibold rounded-r-sm px-3 py-2.5 transition-colors"
                      [class]="draftPreset() === p.id ? 'bg-action text-white' : 'text-ink-600 hover:bg-neutral-50'"
                      (click)="choosePreset(p.id)">
                {{ p.label }}
              </button>
            }
          </div>

          <!-- calendars -->
          <div class="flex-1 p-3">
            <div class="flex items-start gap-4">
              <!-- left month -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-2">
                  <button type="button" class="btn-ghost px-1.5" (click)="shiftMonths(-1)" aria-label="Previous month">‹</button>
                  <span class="text-xs font-bold text-ink-700">{{ leftMonthLabel() }}</span>
                  <span class="w-4"></span>
                </div>

                <div class="grid grid-cols-7 mb-1">
                  @for (d of weekdays; track $index) {
                    <span class="text-center text-[10px] font-semibold text-neutral-400">{{ d }}</span>
                  }
                </div>
                <div class="grid grid-cols-7 gap-y-0.5">
                  @for (c of leftCells(); track $index) {
                    <button type="button"
                            class="w-8 h-8 mx-auto rounded-r-full text-[11px] font-medium transition-colors
                                   disabled:cursor-not-allowed"
                            [class]="dayClass(c)"
                            [disabled]="c.disabled"
                            (click)="pick(c)">{{ c.date.getDate() }}</button>
                  }
                </div>

                <div class="flex items-center gap-2 mt-3 pt-2 border-t border-neutral-100">
                  <span class="text-[11px] font-semibold text-ink-500">Time :</span>
                  <input type="text" inputmode="numeric" maxlength="2"
                         class="w-9 h-8 border border-neutral-200 rounded-r-sm text-center text-xs text-ink-700
                                focus:outline-none focus:ring-2 focus:ring-action-surface focus:border-action"
                         [value]="fromH()"
                         (input)="onTimeInput('fromH', $event)"
                         (blur)="onTimeBlur('fromH')" />
                  <span class="text-neutral-400">:</span>
                  <input type="text" inputmode="numeric" maxlength="2"
                         class="w-9 h-8 border border-neutral-200 rounded-r-sm text-center text-xs text-ink-700
                                focus:outline-none focus:ring-2 focus:ring-action-surface focus:border-action"
                         [value]="fromM()"
                         (input)="onTimeInput('fromM', $event)"
                         (blur)="onTimeBlur('fromM')" />
                </div>
              </div>

              <!-- right month -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-2">
                  <span class="w-4"></span>
                  <span class="text-xs font-bold text-ink-700">{{ rightMonthLabel() }}</span>
                  <button type="button" class="btn-ghost px-1.5" (click)="shiftMonths(1)" aria-label="Next month">›</button>
                </div>

                <div class="grid grid-cols-7 mb-1">
                  @for (d of weekdays; track $index) {
                    <span class="text-center text-[10px] font-semibold text-neutral-400">{{ d }}</span>
                  }
                </div>
                <div class="grid grid-cols-7 gap-y-0.5">
                  @for (c of rightCells(); track $index) {
                    <button type="button"
                            class="w-8 h-8 mx-auto rounded-r-full text-[11px] font-medium transition-colors
                                   disabled:cursor-not-allowed"
                            [class]="dayClass(c)"
                            [disabled]="c.disabled"
                            (click)="pick(c)">{{ c.date.getDate() }}</button>
                  }
                </div>

                <div class="flex items-center gap-2 mt-3 pt-2 border-t border-neutral-100">
                  <span class="text-[11px] font-semibold text-ink-500">Time :</span>
                  <input type="text" inputmode="numeric" maxlength="2"
                         class="w-9 h-8 border border-neutral-200 rounded-r-sm text-center text-xs text-ink-700
                                focus:outline-none focus:ring-2 focus:ring-action-surface focus:border-action"
                         [value]="toH()"
                         (input)="onTimeInput('toH', $event)"
                         (blur)="onTimeBlur('toH')" />
                  <span class="text-neutral-400">:</span>
                  <input type="text" inputmode="numeric" maxlength="2"
                         class="w-9 h-8 border border-neutral-200 rounded-r-sm text-center text-xs text-ink-700
                                focus:outline-none focus:ring-2 focus:ring-action-surface focus:border-action"
                         [value]="toM()"
                         (input)="onTimeInput('toM', $event)"
                         (blur)="onTimeBlur('toM')" />
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-4 pt-3 border-t border-neutral-100">
              <button type="button"
                      class="text-xs font-semibold text-ink-600 hover:bg-neutral-50 rounded-r-sm px-4 py-1.5 border border-neutral-200 transition-colors"
                      (click)="cancel()">Cancel</button>
              <button type="button" class="btn-primary px-4 py-1.5" (click)="apply()">Apply</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class BaseDateRangePickerComponent {
  /** Two-way bound committed range: [(value)]. Only updated when Apply is clicked. */
  readonly value = model<DateRangeValue>({ preset: 'all', from: null, to: null });
  readonly disabled = input(false);
  /** Disables (strikethrough) any date after `maxDate` (or today, if maxDate is unset). */
  readonly disableFuture = input(true);
  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  /** Which edge of the trigger the panel's edge aligns to. Default 'left' opens rightward
   *  (safe near a page's left edge); pass 'right' for triggers sitting at the far right
   *  of a toolbar, where the panel should extend leftward instead. */
  readonly align = input<'left' | 'right'>('left');

  readonly opened = output<void>();
  readonly closed = output<void>();
  /** Fired with the new value when the user clicks Apply. */
  readonly applied = output<DateRangeValue>();

  protected readonly presets = PRESETS;
  protected readonly weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  protected readonly open = signal(false);
  private readonly viewMonth = signal(strip(new Date()));
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly draftPreset = signal<DateRangePreset>('all');
  private readonly draftFrom = signal<Date | null>(null);
  private readonly draftTo = signal<Date | null>(null);

  protected readonly fromH = signal('00');
  protected readonly fromM = signal('00');
  protected readonly toH = signal('23');
  protected readonly toM = signal('59');

  private readonly effectiveMax = computed(() => this.maxDate() ?? (this.disableFuture() ? strip(new Date()) : null));

  protected readonly triggerLabel = computed(() => {
    const v = this.value();
    if (v.preset !== 'custom') return this.presets.find(p => p.id === v.preset)?.label ?? 'All';
    if (v.from && v.to) {
      const fmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
      return `${fmt.format(v.from)} – ${fmt.format(v.to)}`;
    }
    return 'Custom range';
  });

  private readonly leftMonthDate = computed(() => this.viewMonth());
  private readonly rightMonthDate = computed(() => {
    const v = this.viewMonth();
    return new Date(v.getFullYear(), v.getMonth() + 1, 1);
  });
  protected readonly leftCells = computed(() => this.buildCells(this.leftMonthDate()));
  protected readonly rightCells = computed(() => this.buildCells(this.rightMonthDate()));
  protected readonly leftMonthLabel = computed(() => this.fmtMonth(this.leftMonthDate()));
  protected readonly rightMonthLabel = computed(() => this.fmtMonth(this.rightMonthDate()));

  private fmtMonth(d: Date): string {
    return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(d);
  }

  private buildCells(view: Date): DayCell[] {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());

    const today = strip(new Date());
    const min = this.minDate();
    const max = this.effectiveMax();
    const out: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push({
        date: d,
        inMonth: d.getMonth() === view.getMonth(),
        isToday: sameDay(d, today),
        disabled: (!!min && d < min) || (!!max && d > max)
      });
    }
    return out;
  }

  dayClass(c: DayCell): string {
    const from = this.draftFrom();
    const to = this.draftTo();
    const isEndpoint = sameDay(c.date, from) || sameDay(c.date, to) ||
      (this.draftPreset() === 'all' && !from && !to && c.isToday);
    if (isEndpoint) return 'bg-action text-white';
    if (from && to && c.date > from && c.date < to) return 'bg-action-surface text-action-hover';
    if (c.disabled) return c.inMonth ? 'text-neutral-300 line-through' : 'text-neutral-200 line-through';
    if (c.isToday) return 'border border-action text-action';
    return c.inMonth ? 'text-ink-600 hover:bg-action-surface' : 'text-neutral-300 hover:bg-neutral-50';
  }

  pick(c: DayCell): void {
    if (c.disabled) return;
    if (this.draftPreset() !== 'custom') this.draftPreset.set('custom');
    const from = this.draftFrom();
    const to = this.draftTo();
    if (!from || (from && to)) {
      this.draftFrom.set(c.date);
      this.draftTo.set(null);
    } else if (c.date < from) {
      this.draftFrom.set(c.date);
      this.draftTo.set(null);
    } else {
      this.draftTo.set(c.date);
    }
  }

  choosePreset(id: DateRangePreset): void {
    this.draftPreset.set(id);
    const r = this.computePresetRange(id);
    this.draftFrom.set(r.from);
    this.draftTo.set(r.to);
  }

  private computePresetRange(id: DateRangePreset): { from: Date | null; to: Date | null } {
    const today = strip(new Date());
    switch (id) {
      case 'last1': return { from: today, to: today };
      case 'last7': { const f = new Date(today); f.setDate(f.getDate() - 6); return { from: f, to: today }; }
      case 'last30': { const f = new Date(today); f.setDate(f.getDate() - 29); return { from: f, to: today }; }
      case 'custom': return { from: this.draftFrom(), to: this.draftTo() };
      default: return { from: null, to: null };
    }
  }

  shiftMonths(delta: number): void {
    this.viewMonth.update(v => new Date(v.getFullYear(), v.getMonth() + delta, 1));
  }

  private timeSignal(part: TimePart): WritableSignal<string> {
    return part === 'fromH' ? this.fromH : part === 'fromM' ? this.fromM : part === 'toH' ? this.toH : this.toM;
  }

  onTimeInput(part: TimePart, ev: Event): void {
    const raw = (ev.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 2);
    this.timeSignal(part).set(raw);
  }

  onTimeBlur(part: TimePart): void {
    const max = part.endsWith('H') ? 23 : 59;
    const sig = this.timeSignal(part);
    let n = parseInt(sig(), 10);
    if (isNaN(n)) n = 0;
    n = Math.min(Math.max(n, 0), max);
    sig.set(pad2(n));
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(ev.target as Node)) this.close();
  }

  toggle(): void {
    if (this.open()) { this.close(); return; }
    this.initDraftFromValue();
    this.open.set(true);
    this.opened.emit();
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.closed.emit();
  }

  private initDraftFromValue(): void {
    const v = this.value();
    this.draftPreset.set(v.preset ?? 'all');
    this.draftFrom.set(v.from ?? null);
    this.draftTo.set(v.to ?? null);

    const now = new Date();
    this.fromH.set(pad2(v.fromTime?.h ?? now.getHours()));
    this.fromM.set(pad2(v.fromTime?.m ?? now.getMinutes()));
    this.toH.set(pad2(v.toTime?.h ?? now.getHours()));
    this.toM.set(pad2(v.toTime?.m ?? now.getMinutes()));

    const base = v.from ?? now;
    this.viewMonth.set(new Date(base.getFullYear(), base.getMonth(), 1));
  }

  cancel(): void {
    this.close();
  }

  apply(): void {
    const preset = this.draftPreset();
    const range = this.computePresetRange(preset);
    const next: DateRangeValue = {
      preset,
      from: range.from,
      to: range.to,
      fromTime: { h: +this.fromH(), m: +this.fromM() },
      toTime: { h: +this.toH(), m: +this.toM() }
    };
    this.value.set(next);
    this.applied.emit(next);
    this.close();
  }
}
