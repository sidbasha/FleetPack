import {
  ChangeDetectionStrategy,
  Component,
  Directive,
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
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BASE MODULE · Form controls
 *
 * Every control:
 *  - exposes a two-way [(value)] / [(checked)] model signal (props + events),
 *  - implements ControlValueAccessor, so it ALSO works with ngModel and
 *    Reactive Forms (formControlName) with zero extra code,
 *  - supports label / hint / error / disabled uniformly.
 * ─────────────────────────────────────────────────────────────────────────────
 */

let uid = 0;
const nextId = (prefix: string) => `${prefix}-${++uid}`;

/** Shared CVA plumbing. */
@Directive()
export abstract class BaseControl<T> implements ControlValueAccessor {
  protected onChange: (v: T) => void = () => {};
  protected onTouched: () => void = () => {};
  /** Disabled state pushed by Reactive Forms. Combined with the [disabled] prop. */
  readonly formDisabled = signal(false);

  abstract writeValue(v: T): void;
  registerOnChange(fn: (v: T) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.formDisabled.set(d); }
}

const FIELD_WRAP = `block`;
const LABEL_CLS = `block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1`;
const INPUT_CLS = `w-full border rounded-lg px-3 py-2 text-xs text-slate-700 bg-white transition-colors
  focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300
  disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`;
const HINT_CLS = `mt-1 text-[11px] text-slate-400`;
const ERROR_CLS = `mt-1 text-[11px] font-medium text-red-500`;

@Component({
  selector: 'base-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button [type]="type()" [disabled]="disabled() || loading()"
            class="inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
            [class]="variantClass() + ' ' + sizeClass() + (fullWidth() ? ' w-full' : '')"
            (click)="clicked.emit($event)">
      @if (loading()) {
        <span class="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
      }
      <ng-content />
    </button>
  `
})
export class BaseButtonComponent {
  /** Visual style. */
  readonly variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  /** Shows a spinner and disables the button. */
  readonly loading = input(false);
  /** Stretch to the container width. */
  readonly fullWidth = input(false);

  /** Fired on click (not fired while disabled/loading). */
  readonly clicked = output<MouseEvent>();

  readonly variantClass = computed(() => ({
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700',
    ghost: 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }[this.variant()]));

  readonly sizeClass = computed(() => ({
    sm: 'text-[11px] px-2.5 py-1',
    md: 'text-xs px-3.5 py-2',
    lg: 'text-sm px-5 py-2.5'
  }[this.size()]));
}

@Component({
  selector: 'base-text-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseTextInputComponent), multi: true }],
  template: `
    <label class="${FIELD_WRAP}" [attr.for]="id">
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}@if (required()) {<span class="text-red-400"> *</span>}</span> }
      <span class="relative block">
        @if (prefix()) { <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">{{ prefix() }}</span> }
        <input [id]="id" [type]="type()" [value]="value()" [placeholder]="placeholder()"
               [disabled]="disabled() || formDisabled()"
               [attr.maxlength]="maxLength() || null"
               class="${INPUT_CLS}"
               [class.border-red-300]="!!error()"
               [class.border-slate-200]="!error()"
               [style.paddingLeft]="prefix() ? '2rem' : null"
               [style.paddingRight]="(suffix() || clearable()) ? '2rem' : null"
               (input)="onInput($event)"
               (blur)="onTouched(); blurred.emit()"
               (focus)="focused.emit()"
               (keydown.enter)="enterPressed.emit(value())" />
        @if (clearable() && value()) {
          <button type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-xs"
                  (click)="clear()" aria-label="Clear">✕</button>
        } @else if (suffix()) {
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">{{ suffix() }}</span>
        }
      </span>
      @if (error()) { <span class="${ERROR_CLS}">{{ error() }}</span> }
      @else if (hint()) { <span class="${HINT_CLS}">{{ hint() }}</span> }
    </label>
  `
})
export class BaseTextInputComponent extends BaseControl<string> {
  /** Two-way bound text: [(value)]. Emits (valueChange). */
  readonly value = model('');
  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input<'text' | 'password' | 'email' | 'number' | 'tel' | 'url'>('text');
  readonly hint = input('');
  /** Error message; also switches the border to red. */
  readonly error = input('');
  readonly disabled = input(false);
  readonly required = input(false);
  /** Show an ✕ button to clear the value. */
  readonly clearable = input(false);
  /** Inline text before / after the value, e.g. '₹' or 'kg'. */
  readonly prefix = input('');
  readonly suffix = input('');
  readonly maxLength = input(0);

  readonly enterPressed = output<string>();
  readonly focused = output<void>();
  readonly blurred = output<void>();

  readonly id = nextId('bti');

  onInput(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.value.set(v);
    this.onChange(v);
  }

  clear(): void {
    this.value.set('');
    this.onChange('');
  }

  writeValue(v: string): void { this.value.set(v ?? ''); }
}

@Component({
  selector: 'base-textarea',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseTextareaComponent), multi: true }],
  template: `
    <label class="${FIELD_WRAP}" [attr.for]="id">
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}</span> }
      <textarea [id]="id" [value]="value()" [placeholder]="placeholder()" [rows]="rows()"
                [disabled]="disabled() || formDisabled()"
                [attr.maxlength]="maxLength() || null"
                class="${INPUT_CLS} resize-y"
                [class.border-red-300]="!!error()"
                [class.border-slate-200]="!error()"
                (input)="onInput($event)"
                (blur)="onTouched(); blurred.emit()"></textarea>
      <span class="flex justify-between">
        @if (error()) { <span class="${ERROR_CLS}">{{ error() }}</span> }
        @else if (hint()) { <span class="${HINT_CLS}">{{ hint() }}</span> }
        @else { <span></span> }
        @if (maxLength()) { <span class="${HINT_CLS}">{{ value().length }}/{{ maxLength() }}</span> }
      </span>
    </label>
  `
})
export class BaseTextareaComponent extends BaseControl<string> {
  readonly value = model('');
  readonly label = input('');
  readonly placeholder = input('');
  readonly rows = input(3);
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false);
  readonly maxLength = input(0);

  readonly blurred = output<void>();
  readonly id = nextId('bta');

  onInput(ev: Event): void {
    const v = (ev.target as HTMLTextAreaElement).value;
    this.value.set(v);
    this.onChange(v);
  }

  writeValue(v: string): void { this.value.set(v ?? ''); }
}

export interface BaseSelectOption<V = unknown> {
  label: string;
  value: V;
  disabled?: boolean;
}

@Component({
  selector: 'base-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseSelectComponent), multi: true }],
  template: `
    <div class="${FIELD_WRAP} relative">
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}</span> }
      <button type="button"
              class="${INPUT_CLS} flex items-center justify-between text-left"
              [class.border-red-300]="!!error()"
              [class.border-slate-200]="!error()"
              [disabled]="disabled() || formDisabled()"
              (click)="toggle()">
        <span [class.text-slate-400]="selectedLabel() === null">{{ selectedLabel() ?? placeholder() }}</span>
        @if (showChevron()) { <span class="text-slate-300 text-[10px] ml-2">{{ open() ? '▲' : '▼' }}</span> }
      </button>

      @if (open()) {
        <div class="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          @if (searchable()) {
            <input type="text" class="w-full border-b border-slate-100 px-3 py-2 text-xs focus:outline-none"
                   placeholder="Type to filter…" [value]="query()" (input)="onQuery($event)" />
          }
          <div class="max-h-52 overflow-y-auto py-1">
            @for (o of filteredOptions(); track $index) {
              <button type="button"
                      class="w-full text-left px-3 py-1.5 text-xs transition-colors
                             disabled:opacity-40 disabled:cursor-not-allowed"
                      [class]="isSelected(o) ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'"
                      [disabled]="o.disabled"
                      (click)="pick(o)">{{ o.label }}</button>
            } @empty {
              <div class="px-3 py-2 text-[11px] text-slate-400">No options</div>
            }
          </div>
        </div>
      }

      @if (error()) { <span class="${ERROR_CLS}">{{ error() }}</span> }
      @else if (hint()) { <span class="${HINT_CLS}">{{ hint() }}</span> }
    </div>
  `
})
export class BaseSelectComponent<V = unknown> extends BaseControl<V | null> {
  /** Two-way bound selected value: [(value)]. */
  readonly value = model<V | null>(null);
  readonly options = input.required<BaseSelectOption<V>[]>();
  readonly label = input('');
  readonly placeholder = input('Select…');
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false);
  /** Adds a filter box inside the dropdown. */
  readonly searchable = input(false);
  /** Hides the ▲/▼ chevron, e.g. to look like a plain input box. */
  readonly showChevron = input(true);

  /** Fired with the full option object when a selection is made. */
  readonly optionSelected = output<BaseSelectOption<V>>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly open = signal(false);
  readonly query = signal('');
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly selectedLabel = computed(() => {
    const v = this.value();
    const hit = this.options().find(o => o.value === v);
    return hit ? hit.label : null;
  });

  readonly filteredOptions = computed(() => {
    const q = this.query().toLowerCase();
    return q ? this.options().filter(o => o.label.toLowerCase().includes(q)) : this.options();
  });

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(ev.target as Node)) this.close();
  }

  toggle(): void { this.open() ? this.close() : (this.open.set(true), this.opened.emit()); }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.query.set('');
    this.onTouched();
    this.closed.emit();
  }

  onQuery(ev: Event): void { this.query.set((ev.target as HTMLInputElement).value); }

  isSelected(o: BaseSelectOption<V>): boolean { return o.value === this.value(); }

  pick(o: BaseSelectOption<V>): void {
    this.value.set(o.value);
    this.onChange(o.value);
    this.optionSelected.emit(o);
    this.close();
  }

  writeValue(v: V | null): void { this.value.set(v); }
}

@Component({
  selector: 'base-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseCheckboxComponent), multi: true }],
  template: `
    <label class="inline-flex items-center gap-2 cursor-pointer select-none"
           [class.opacity-50]="disabled() || formDisabled()"
           [class.cursor-not-allowed]="disabled() || formDisabled()">
      <input type="checkbox" [checked]="checked()" [disabled]="disabled() || formDisabled()"
             class="w-3.5 h-3.5 accent-indigo-600"
             (change)="onToggle($event)" (blur)="onTouched()" />
      <span class="text-xs text-slate-700">{{ label() }}</span>
    </label>
  `
})
export class BaseCheckboxComponent extends BaseControl<boolean> {
  /** Two-way bound: [(checked)]. Emits (checkedChange). */
  readonly checked = model(false);
  readonly label = input('');
  readonly disabled = input(false);

  onToggle(ev: Event): void {
    const v = (ev.target as HTMLInputElement).checked;
    this.checked.set(v);
    this.onChange(v);
  }

  writeValue(v: boolean): void { this.checked.set(!!v); }
}

@Component({
  selector: 'base-radio-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseRadioGroupComponent), multi: true }],
  template: `
    <div>
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}</span> }
      <div class="flex gap-x-4 gap-y-1.5" [class.flex-col]="direction() === 'vertical'">
        @for (o of options(); track $index) {
          <label class="inline-flex items-center gap-1.5 cursor-pointer select-none"
                 [class.opacity-50]="o.disabled || disabled() || formDisabled()">
            <input type="radio" [name]="name" [checked]="o.value === value()"
                   [disabled]="o.disabled || disabled() || formDisabled()"
                   class="w-3.5 h-3.5 accent-indigo-600"
                   (change)="pick(o)" (blur)="onTouched()" />
            <span class="text-xs text-slate-700">{{ o.label }}</span>
          </label>
        }
      </div>
    </div>
  `
})
export class BaseRadioGroupComponent<V = unknown> extends BaseControl<V | null> {
  /** Two-way bound selected value: [(value)]. */
  readonly value = model<V | null>(null);
  readonly options = input.required<BaseSelectOption<V>[]>();
  readonly label = input('');
  readonly direction = input<'horizontal' | 'vertical'>('horizontal');
  readonly disabled = input(false);

  readonly name = nextId('brg');

  pick(o: BaseSelectOption<V>): void {
    this.value.set(o.value);
    this.onChange(o.value);
  }

  writeValue(v: V | null): void { this.value.set(v); }
}

@Component({
  selector: 'base-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseToggleComponent), multi: true }],
  template: `
    <label class="inline-flex items-center gap-2 cursor-pointer select-none"
           [class.opacity-50]="disabled() || formDisabled()">
      <button type="button" role="switch" [attr.aria-checked]="checked()"
              class="relative w-9 h-5 rounded-full transition-colors"
              [class]="checked() ? 'bg-indigo-600' : 'bg-slate-200'"
              [disabled]="disabled() || formDisabled()"
              (click)="flip()" (blur)="onTouched()">
        <span class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
              [style.left]="checked() ? '18px' : '2px'"></span>
      </button>
      @if (label()) { <span class="text-xs text-slate-700">{{ label() }}</span> }
    </label>
  `
})
export class BaseToggleComponent extends BaseControl<boolean> {
  /** Two-way bound: [(checked)]. Emits (checkedChange). */
  readonly checked = model(false);
  readonly label = input('');
  readonly disabled = input(false);

  flip(): void {
    const v = !this.checked();
    this.checked.set(v);
    this.onChange(v);
  }

  writeValue(v: boolean): void { this.checked.set(!!v); }
}
