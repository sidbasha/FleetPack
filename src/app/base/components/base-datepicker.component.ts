import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControl } from './base-form.components';

interface DayCell {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  disabled: boolean;
}

const strip = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date | null, b: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * <base-datepicker>
 * Dependency-free popup calendar.
 *  - two-way [(value)] (Date | null) + ControlValueAccessor (ngModel / forms)
 *  - min / max bounds, custom disabled-date rule, clearable, today shortcut
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'base-datepicker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseDatepickerComponent), multi: true }],
  template: `
    <div class="block relative">
      @if (label()) {
        <span class="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">{{ label() }}</span>
      }
      <button type="button"
              class="w-full border rounded-lg px-3 py-2 text-xs bg-white text-left flex items-center justify-between
                     focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-colors
                     disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
              [class.border-red-300]="!!error()"
              [class.border-slate-200]="!error()"
              [disabled]="disabled() || formDisabled()"
              (click)="toggle()">
        <span [class.text-slate-400]="!value()" [class.text-slate-700]="!!value()">
          {{ displayText() }}
        </span>
        <span class="inline-flex items-center gap-1.5">
          @if (clearable() && value()) {
            <span class="text-slate-300 hover:text-slate-500 text-xs" (click)="clear($event)" role="button" aria-label="Clear date">✕</span>
          }
          <span class="text-slate-300 text-xs">📅</span>
        </span>
      </button>

      @if (open()) {
        <div class="absolute z-30 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-3">
          <div class="flex items-center justify-between mb-2">
            <button type="button" class="btn-ghost" (click)="shiftMonth(-1)" aria-label="Previous month">‹</button>
            <span class="text-xs font-bold text-slate-700">{{ monthLabel() }}</span>
            <button type="button" class="btn-ghost" (click)="shiftMonth(1)" aria-label="Next month">›</button>
          </div>

          <div class="grid grid-cols-7 mb-1">
            @for (d of weekdays; track $index) {
              <span class="text-center text-[10px] font-semibold text-slate-400">{{ d }}</span>
            }
          </div>

          <div class="grid grid-cols-7 gap-y-0.5">
            @for (c of cells(); track $index) {
              <button type="button"
                      class="w-8 h-8 mx-auto rounded-full text-[11px] font-medium transition-colors
                             disabled:opacity-30 disabled:cursor-not-allowed"
                      [class]="dayClass(c)"
                      [disabled]="c.disabled"
                      (click)="pick(c)">{{ c.date.getDate() }}</button>
            }
          </div>

          <div class="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
            <button type="button" class="btn-ghost" (click)="goToday()">Today</button>
            <button type="button" class="btn-ghost" (click)="close()">Close</button>
          </div>
        </div>
      }

      @if (error()) { <span class="mt-1 text-[11px] font-medium text-red-500 block">{{ error() }}</span> }
      @else if (hint()) { <span class="mt-1 text-[11px] text-slate-400 block">{{ hint() }}</span> }
    </div>
  `
})
export class BaseDatepickerComponent extends BaseControl<Date | null> {
  /** Two-way bound selected date: [(value)]. Emits (valueChange). */
  readonly value = model<Date | null>(null);
  readonly label = input('');
  readonly placeholder = input('Select date…');
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false);
  readonly clearable = input(true);
  /** Earliest / latest selectable dates (inclusive). */
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  /** Custom rule — return true to disable a date (e.g. weekends). */
  readonly disabledDates = input<((d: Date) => boolean) | null>(null);
  /** Intl format for the display text. */
  readonly displayFormat = input<Intl.DateTimeFormatOptions>({ dateStyle: 'medium' });
  /** 0 = Sunday, 1 = Monday. */
  readonly weekStart = input<0 | 1>(1);

  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly open = signal(false);
  private readonly viewDate = signal(strip(new Date()));
  private readonly host = inject(ElementRef<HTMLElement>);

  get weekdays(): string[] {
    const base = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return this.weekStart() === 1 ? [...base.slice(1), base[0]] : base;
  }

  readonly displayText = computed(() => {
    const v = this.value();
    return v ? new Intl.DateTimeFormat(undefined, this.displayFormat()).format(v) : this.placeholder();
  });

  readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(this.viewDate())
  );

  readonly cells = computed<DayCell[]>(() => {
    const view = this.viewDate();
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const start = new Date(first);
    const offset = (first.getDay() - this.weekStart() + 7) % 7;
    start.setDate(first.getDate() - offset);

    const today = strip(new Date());
    const out: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push({
        date: d,
        inMonth: d.getMonth() === view.getMonth(),
        isToday: sameDay(d, today),
        disabled: this.isDisabled(d)
      });
    }
    return out;
  });

  private isDisabled(d: Date): boolean {
    const min = this.min(), max = this.max();
    if (min && strip(d) < strip(min)) return true;
    if (max && strip(d) > strip(max)) return true;
    const rule = this.disabledDates();
    return rule ? rule(d) : false;
  }

  dayClass(c: DayCell): string {
    if (sameDay(c.date, this.value())) return 'bg-indigo-600 text-white';
    if (c.isToday) return 'border border-indigo-300 text-indigo-600';
    return c.inMonth ? 'text-slate-600 hover:bg-indigo-50' : 'text-slate-300 hover:bg-slate-50';
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(ev.target as Node)) this.close();
  }

  toggle(): void {
    if (this.open()) { this.close(); return; }
    this.viewDate.set(strip(this.value() ?? new Date()));
    this.open.set(true);
    this.opened.emit();
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.onTouched();
    this.closed.emit();
  }

  shiftMonth(delta: number): void {
    const v = this.viewDate();
    this.viewDate.set(new Date(v.getFullYear(), v.getMonth() + delta, 1));
  }

  goToday(): void {
    this.viewDate.set(strip(new Date()));
  }

  pick(c: DayCell): void {
    if (c.disabled) return;
    this.value.set(c.date);
    this.onChange(c.date);
    this.close();
  }

  clear(ev: Event): void {
    ev.stopPropagation();
    this.value.set(null);
    this.onChange(null);
  }

  writeValue(v: Date | null): void {
    this.value.set(v ? strip(v) : null);
  }
}
