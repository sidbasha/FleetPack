import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  HostListener,
  QueryList,
  ViewChildren,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseMenuItem } from './base-nav.components';

let uid = 0;
const nextId = (prefix: string) => `${prefix}-${++uid}`;

/** Base class every form control extends — wires ControlValueAccessor so
 *  [(value)]/[(checked)] also work with ngModel and reactive forms. */
@Directive()
export abstract class BaseControl<T> implements ControlValueAccessor {
  protected onChange: (v: T) => void = () => {};
  protected onTouched: () => void = () => {};
  protected readonly formDisabled = signal(false);

  abstract writeValue(v: T): void;
  registerOnChange(fn: (v: T) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.formDisabled.set(d); }
}

const FIELD_WRAP = `block`;
const LABEL_CLS = `block text-caption text-neutral-400 mb-1`;
const INPUT_CLS = `w-full h-9 border rounded-r-sm px-sp-3 text-xs text-ink-700 bg-neutral-0 transition-colors
  focus:outline-none focus:ring-2 focus:ring-action-surface focus:border-action
  disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed`;
const INPUT_CLS_NO_BG = INPUT_CLS.replace('bg-neutral-0 ', '');
const HINT_CLS = `mt-1 text-caption normal-case font-normal text-neutral-400`;
const ERROR_CLS = `mt-1 text-caption normal-case font-normal text-error`;

/** Primary command surface — one primary action per view, the rest secondary/tertiary/ghost.
 *  Triggers one immediate action (save, run, export, delete); never navigates (that's a link)
 *  and never discloses (that's an expander). See stories/base/button.stories.ts for the full matrix. */
@Component({
  selector: 'base-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button [type]="type()" [disabled]="disabled() || loading()"
            [attr.aria-label]="iconOnly() ? ariaLabel() : null"
            class="inline-flex items-center justify-center font-semibold transition-colors
                   outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2
                   disabled:opacity-[0.42] disabled:cursor-not-allowed"
            [class]="variantClass() + ' ' + sizeClass() + ' ' + radiusClass() + (fullWidth() ? ' w-full' : '')"
            (click)="clicked.emit($event)">
      @if (loading()) {
        <span class="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden="true"></span>
      }
      <ng-content />
    </button>
  `
})
export class BaseButtonComponent {
  readonly variant = input<
    'primary' | 'secondary' | 'tertiary' | 'ghost' | 'outline' | 'text' | 'destructive' | 'danger' | 'success' | 'warning'
  >('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);
  readonly iconOnly = input(false);
  readonly ariaLabel = input('');
  readonly shape = input<'default' | 'pill'>('default');

  readonly clicked = output<MouseEvent>();

  protected readonly variantClass = computed(() => ({
    primary: 'bg-action text-neutral-0 hover:bg-action-hover active:bg-action-active',
    secondary: 'bg-neutral-0 text-ink-700 border border-neutral-200 hover:border-action hover:text-action',
    tertiary: 'bg-transparent text-action hover:text-action-hover hover:bg-action-surface',
    outline: 'bg-transparent text-ink-700 border border-neutral-300 hover:border-action hover:text-action hover:bg-action-surface',
    ghost: 'bg-transparent text-ink-700 hover:bg-neutral-100 hover:text-ink-900 active:bg-neutral-200',
    text: 'bg-transparent text-action hover:text-action-hover hover:underline underline-offset-2',
    destructive: 'bg-error text-neutral-0 hover:bg-error-hover',
    danger: 'bg-error text-neutral-0 hover:bg-error-hover',
    success: 'bg-success text-neutral-0 hover:bg-success-hover',
    warning: 'bg-warning text-neutral-0 hover:bg-warning-hover'
  }[this.variant()]));

  protected readonly sizeClass = computed(() => {
    const icon = this.iconOnly();
    if (this.variant() === 'text' && !icon) {
      return { sm: 'h-auto text-[11px] gap-1', md: 'h-auto text-xs gap-1.5', lg: 'h-auto text-sm gap-2' }[this.size()];
    }
    return {
      sm: icon ? 'w-7 h-7 text-[11px] gap-1' : 'h-7 px-sp-2 text-[11px] gap-1',
      md: icon ? 'w-9 h-9 text-xs gap-1.5' : 'h-9 px-sp-3 text-xs gap-1.5',
      lg: icon ? 'w-11 h-11 text-sm gap-2' : 'h-11 px-sp-5 text-sm gap-2'
    }[this.size()];
  });

  protected readonly radiusClass = computed(() => this.shape() === 'pill' ? 'rounded-full shadow-e2 hover:shadow-e3' : 'rounded-r-sm');
}

/** 2–4 mutually exclusive view options; changes what's shown without navigating anywhere. */
@Component({
  selector: 'base-segmented-control',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="radiogroup" [attr.aria-label]="ariaLabel() || null"
         class="inline-flex items-center gap-0.5 bg-neutral-100 border border-neutral-200 rounded-r-sm p-0.5">
      @for (o of options(); track o.value) {
        <button type="button" role="radio" [attr.aria-checked]="o.value === value()"
                class="px-sp-3 h-7 text-[11px] font-semibold rounded-r-xs transition-colors
                       outline-none focus-visible:ring-2 focus-visible:ring-action
                       disabled:opacity-40 disabled:cursor-not-allowed"
                [class]="o.value === value() ? 'bg-neutral-0 text-ink-900 shadow-e1' : 'text-neutral-400 hover:text-ink-700'"
                [disabled]="o.disabled"
                (click)="pick(o)">
          {{ o.label }}
        </button>
      }
    </div>
  `
})
export class BaseSegmentedControlComponent<V = unknown> {
  readonly options = input.required<{ label: string; value: V; disabled?: boolean }[]>();
  readonly value = model<V | null>(null);
  readonly ariaLabel = input('');

  readonly change = output<V>();

  pick(o: { value: V; disabled?: boolean }): void {
    if (o.disabled) return;
    this.value.set(o.value);
    this.change.emit(o.value);
  }
}

const MSG_CLS = `mt-1 flex items-center gap-1 text-caption normal-case font-normal`;

/** Twenty-one controls share this one 36px baseline, one focus treatment, and one validation
 *  grammar: an error/warning/success message never states only that something is wrong (or
 *  right) — it names the rule and the shape of a valid answer, and the signal is never colour
 *  alone (icon + word, every time). Priority when several are set: error › warning › success › hint. */
@Component({
  selector: 'base-text-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseTextInputComponent), multi: true }],
  template: `
    <label class="${FIELD_WRAP}" [attr.for]="id">
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}@if (required()) {<span class="text-error"> *</span>}</span> }
      <span class="relative block">
        @if (prefix()) { <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 pointer-events-none">{{ prefix() }}</span> }
        <input [id]="id" [type]="effectiveType()" [value]="value()" [placeholder]="placeholder()"
               [disabled]="disabled() || formDisabled() || loading()"
               [readOnly]="readOnly()"
               [attr.maxlength]="maxLength() || null"
               [class]="inputClass()"
               [style.paddingLeft]="prefix() ? '2rem' : null"
               [style.paddingRight]="trailingSlot() ? '2rem' : null"
               (input)="onInput($event)"
               (blur)="onTouched(); blurred.emit()"
               (focus)="focused.emit()"
               (keydown.enter)="enterPressed.emit(value())" />
        @switch (trailingSlot()) {
          @case ('password') {
            <button type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 text-xs"
                    (click)="showPassword.set(!showPassword())" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
              {{ showPassword() ? '🙈' : '👁' }}
            </button>
          }
          @case ('loading') {
            <span class="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-neutral-300 border-t-transparent animate-spin" aria-hidden="true"></span>
          }
          @case ('clear') {
            <button type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-400 text-xs"
                    (click)="clear()" aria-label="Clear">✕</button>
          }
          @case ('error') { <span class="absolute right-3 top-1/2 -translate-y-1/2 text-error text-xs" aria-hidden="true">⊗</span> }
          @case ('warning') { <span class="absolute right-3 top-1/2 -translate-y-1/2 text-warning text-xs" aria-hidden="true">⚠</span> }
          @case ('success') { <span class="absolute right-3 top-1/2 -translate-y-1/2 text-success text-xs" aria-hidden="true">✓</span> }
          @case ('suffix') { <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 pointer-events-none">{{ suffix() }}</span> }
        }
      </span>
      @if (error()) { <span class="${MSG_CLS} text-error"><span aria-hidden="true">⊗</span>{{ error() }}</span> }
      @else if (warning()) { <span class="${MSG_CLS} text-warning"><span aria-hidden="true">⚠</span>{{ warning() }}</span> }
      @else if (success()) { <span class="${MSG_CLS} text-success"><span aria-hidden="true">✓</span>{{ success() }}</span> }
      @else if (hint()) { <span class="${HINT_CLS}">{{ hint() }}</span> }
    </label>
  `
})
export class BaseTextInputComponent extends BaseControl<string> {
  readonly value = model('');
  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input<'text' | 'password' | 'email' | 'number' | 'tel' | 'url'>('text');
  readonly hint = input('');
  readonly error = input('');
  readonly warning = input('');
  readonly success = input('');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly readOnly = input(false);
  readonly required = input(false);
  readonly clearable = input(false);
  readonly prefix = input('');
  readonly suffix = input('');
  readonly maxLength = input(0);

  readonly enterPressed = output<string>();
  readonly focused = output<void>();
  readonly blurred = output<void>();

  readonly id = nextId('bti');
  protected readonly showPassword = signal(false);

  protected readonly effectiveType = computed(() => this.type() === 'password' && this.showPassword() ? 'text' : this.type());

  protected readonly inputClass = computed(() => {
    const state = this.error() ? 'border-error bg-error-surface'
      : this.warning() ? 'border-warning bg-warning-surface'
      : this.success() ? 'border-success bg-neutral-0'
      : this.readOnly() ? 'border-neutral-200 bg-neutral-50'
      : 'border-neutral-200 bg-neutral-0';
    return `${INPUT_CLS_NO_BG} ${state}`;
  });

  protected readonly trailingSlot = computed((): '' | 'password' | 'loading' | 'clear' | 'error' | 'warning' | 'success' | 'suffix' => {
    if (this.type() === 'password') return 'password';
    if (this.loading()) return 'loading';
    if (this.clearable() && this.value()) return 'clear';
    if (this.error()) return 'error';
    if (this.warning()) return 'warning';
    if (this.success()) return 'success';
    if (this.suffix()) return 'suffix';
    return '';
  });

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
                class="${INPUT_CLS} h-auto py-sp-2 resize-y"
                [class.border-error]="!!error()"
                [class.border-neutral-200]="!error()"
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
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}@if (required()) {<span class="text-error"> *</span>}</span> }
      <button type="button"
              class="${INPUT_CLS} flex items-center justify-between text-left"
              [class.border-error]="!!error()"
              [class.border-neutral-200]="!error()"
              [disabled]="disabled() || formDisabled()"
              (click)="toggle()">
        <span class="truncate" [class.text-neutral-400]="selectedLabel() === null">{{ selectedLabel() ?? placeholder() }}</span>
        @if (showChevron()) { <span class="text-neutral-300 text-[10px] ml-2 shrink-0">{{ open() ? '▲' : '▼' }}</span> }
      </button>

      @if (open()) {
        <div class="absolute z-30 mt-1 w-full bg-neutral-0 border border-neutral-200 rounded-r-md overflow-hidden" style="box-shadow: var(--shadow-e2);">
          @if (searchable()) {
            <input type="text" class="w-full border-b border-neutral-100 px-sp-3 py-sp-2 text-xs focus:outline-none"
                   placeholder="Type to filter…" [value]="query()" (input)="onQuery($event)" />
          }
          <div class="max-h-52 overflow-y-auto py-1">
            @for (o of filteredOptions(); track $index) {
              <button type="button"
                      class="w-full text-left px-sp-3 py-1.5 text-xs transition-colors
                             disabled:opacity-40 disabled:cursor-not-allowed"
                      [class]="isSelected(o) ? 'bg-action-surface text-action font-semibold' : 'text-ink-600 hover:bg-neutral-50'"
                      [disabled]="o.disabled"
                      (click)="pick(o)">{{ o.label }}</button>
            } @empty {
              <div class="px-sp-3 py-sp-2 text-[11px] text-neutral-400">No options</div>
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
  readonly value = model<V | null>(null);
  readonly options = input.required<BaseSelectOption<V>[]>();
  readonly label = input('');
  readonly placeholder = input('Select…');
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false);
  readonly required = input(false);
  readonly searchable = input(false);
  readonly showChevron = input(true);

  readonly optionSelected = output<BaseSelectOption<V>>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  protected readonly open = signal(false);
  protected readonly query = signal('');
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly selectedLabel = computed(() => {
    const v = this.value();
    const hit = this.options().find(o => o.value === v);
    return hit ? hit.label : null;
  });

  protected readonly filteredOptions = computed(() => {
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

/** A checkbox is part of a form that gets submitted — pressing Save is what commits it. Reach
 *  for `<base-toggle>` instead when the change should take effect immediately, with no Save
 *  step at all: see that component's doc comment for the full rule. */
@Component({
  selector: 'base-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseCheckboxComponent), multi: true }],
  template: `
    <div class="flex flex-col gap-0.5">
      <label class="inline-flex items-center gap-sp-2 cursor-pointer select-none py-0.5"
             [class.opacity-50]="disabled() || formDisabled()"
             [class.cursor-not-allowed]="disabled() || formDisabled()">
        <input type="checkbox" [checked]="checked()" [indeterminate]="indeterminate()" [disabled]="disabled() || formDisabled()"
               class="w-4 h-4 rounded-r-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
               [class]="error() ? 'accent-error focus-visible:ring-error' : 'accent-action focus-visible:ring-action'"
               (change)="onToggle($event)" (blur)="onTouched()" />
        <span class="text-xs text-ink-700">{{ label() }}</span>
      </label>
      @if (description() && !error()) { <span class="pl-6 text-[11px] text-neutral-400">{{ description() }}</span> }
      @if (error()) { <span class="pl-6 text-[11px] font-medium text-error">{{ error() }}</span> }
    </div>
  `
})
export class BaseCheckboxComponent extends BaseControl<boolean> {
  readonly checked = model(false);
  readonly label = input('');
  readonly disabled = input(false);
  readonly indeterminate = input(false);
  readonly description = input('');
  readonly error = input('');

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
          <label class="inline-flex items-center gap-sp-2 cursor-pointer select-none"
                 [class.opacity-50]="o.disabled || disabled() || formDisabled()">
            <input type="radio" [name]="name" [checked]="o.value === value()"
                   [disabled]="o.disabled || disabled() || formDisabled()"
                   class="w-4 h-4 outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                   [class]="error() ? 'accent-error focus-visible:ring-error' : 'accent-action focus-visible:ring-action'"
                   (change)="pick(o)" (blur)="onTouched()" />
            <span class="text-xs text-ink-700">{{ o.label }}</span>
          </label>
        }
      </div>
      @if (error()) { <span class="mt-1 text-[11px] font-medium text-error block">{{ error() }}</span> }
    </div>
  `
})
export class BaseRadioGroupComponent<V = unknown> extends BaseControl<V | null> {
  readonly value = model<V | null>(null);
  readonly options = input.required<BaseSelectOption<V>[]>();
  readonly label = input('');
  readonly direction = input<'horizontal' | 'vertical'>('horizontal');
  readonly disabled = input(false);
  readonly error = input('');

  readonly name = nextId('brg');

  pick(o: BaseSelectOption<V>): void {
    this.value.set(o.value);
    this.onChange(o.value);
  }

  writeValue(v: V | null): void { this.value.set(v); }
}

/** Applies immediately with no Save button — the setting takes effect on click, the same instant
 *  as everywhere it's read. Reach for `<base-checkbox>` instead the moment the change is part of
 *  a form that gets submitted: if the operator has to press Save afterwards, it's a checkbox. */
@Component({
  selector: 'base-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseToggleComponent), multi: true }],
  template: `
    <label class="inline-flex items-center gap-sp-2 cursor-pointer select-none"
           [class.opacity-50]="disabled() || formDisabled()">
      <button type="button" role="switch" [attr.aria-checked]="checked()"
              class="relative rounded-r-full transition-colors outline-none
                     focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-1"
              [class]="sizeClass().track + ' ' + (checked() ? toneClass() : 'bg-neutral-200')"
              [disabled]="disabled() || formDisabled()"
              (click)="flip()" (blur)="onTouched()">
        <span class="absolute top-0.5 rounded-r-full bg-neutral-0 transition-all" style="box-shadow: var(--shadow-e1);"
              [class]="sizeClass().thumb" [style.left]="checked() ? sizeClass().onLeft : '2px'"></span>
      </button>
      @if (label()) { <span class="text-xs text-ink-700">{{ label() }}</span> }
    </label>
  `
})
export class BaseToggleComponent extends BaseControl<boolean> {
  readonly checked = model(false);
  readonly label = input('');
  readonly disabled = input(false);
  readonly size = input<'md' | 'lg'>('md');
  readonly tone = input<'action' | 'success'>('action');

  protected readonly toneClass = computed(() => this.tone() === 'success' ? 'bg-success' : 'bg-action');

  protected readonly sizeClass = computed(() => this.size() === 'lg'
    ? { track: 'w-11 h-6', thumb: 'w-5 h-5', onLeft: '22px' }
    : { track: 'w-9 h-5', thumb: 'w-4 h-4', onLeft: '18px' });

  flip(): void {
    const v = !this.checked();
    this.checked.set(v);
    this.onChange(v);
  }

  writeValue(v: boolean): void { this.checked.set(!!v); }
}

/** Default action plus a chevron menu of related variants. Left segment fires
 *  (clicked) immediately; the chevron opens [items]. */
@Component({
  selector: 'base-split-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-flex">
      <button type="button" [disabled]="disabled()"
              class="inline-flex items-center h-9 px-sp-3 text-xs font-semibold rounded-l-sm transition-colors outline-none
                     focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2
                     disabled:opacity-[0.42] disabled:cursor-not-allowed"
              [class]="leftClass()"
              (click)="clicked.emit($event)">
        <ng-content />
      </button>
      <button type="button" [disabled]="disabled()" aria-label="More options" aria-haspopup="menu"
              class="inline-flex items-center justify-center w-8 h-9 rounded-r-sm transition-colors outline-none
                     focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2
                     disabled:opacity-[0.42] disabled:cursor-not-allowed"
              [class]="rightClass()"
              (click)="toggle()">
        <span class="text-[9px]">▼</span>
      </button>

      @if (open()) {
        <div class="absolute right-0 top-full z-30 mt-1 min-w-40 bg-neutral-0 border border-neutral-200 rounded-r-md py-1" style="box-shadow: var(--shadow-e2);">
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
export class BaseSplitButtonComponent {
  readonly items = input.required<BaseMenuItem[]>();
  readonly disabled = input(false);
  readonly variant = input<'primary' | 'secondary'>('primary');

  readonly clicked = output<MouseEvent>();
  readonly itemSelect = output<BaseMenuItem>();

  protected readonly open = signal(false);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly leftClass = computed(() => this.variant() === 'secondary'
    ? 'bg-neutral-0 text-ink-700 border border-r-0 border-neutral-200 hover:border-action hover:text-action'
    : 'bg-action text-neutral-0 hover:bg-action-hover border-r border-action-active');

  protected readonly rightClass = computed(() => this.variant() === 'secondary'
    ? 'bg-neutral-0 text-ink-700 border border-neutral-200 hover:border-action hover:text-action'
    : 'bg-action text-neutral-0 hover:bg-action-hover');

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

export interface BaseButtonGroupItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'base-button-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="group" [attr.aria-label]="ariaLabel() || null"
         class="inline-flex items-stretch border border-neutral-200 rounded-r-sm overflow-hidden bg-neutral-0">
      @for (o of items(); track o.id; let first = $first) {
        <button type="button" [disabled]="o.disabled"
                [attr.aria-label]="iconOnly() ? o.label : null"
                [attr.aria-current]="o.id === activeId() ? 'true' : null"
                class="inline-flex items-center justify-center gap-1.5 h-9 px-sp-3 text-xs font-semibold transition-colors
                       outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-inset
                       disabled:opacity-[0.42] disabled:cursor-not-allowed"
                [class]="(o.id === activeId() ? 'bg-action-surface text-action' : 'text-ink-600 hover:bg-neutral-50 hover:text-ink-900') + (first ? '' : ' border-l border-neutral-200')"
                (click)="pick(o)">
          @if (o.icon) { <span aria-hidden="true">{{ o.icon }}</span> }
          @if (!iconOnly()) { {{ o.label }} }
        </button>
      }
    </div>
  `
})
export class BaseButtonGroupComponent {
  readonly items = input.required<BaseButtonGroupItem[]>();
  readonly activeId = input<string | null>(null);
  readonly iconOnly = input(false);
  readonly ariaLabel = input('');

  readonly itemClick = output<BaseButtonGroupItem>();

  pick(o: BaseButtonGroupItem): void {
    if (o.disabled) return;
    this.itemClick.emit(o);
  }
}

export interface BaseSelectionCardOption<V = unknown> {
  label: string;
  value: V;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'base-selection-cards',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseSelectionCardComponent), multi: true }],
  template: `
    <div>
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}</span> }
      <div class="grid gap-sp-2" [style.grid-template-columns]="'repeat(' + columns() + ', minmax(0, 1fr))'">
        @for (o of options(); track $index) {
          <label class="relative flex flex-col gap-1 rounded-r-md border px-sp-3 py-sp-3 transition-colors"
                 [class]="cardClass(o)">
            <input type="radio" [name]="name" class="sr-only" [checked]="o.value === value()"
                   [disabled]="o.disabled || disabled() || formDisabled()"
                   (change)="pick(o)" (blur)="onTouched()" />
            <span class="flex items-center gap-1.5 text-xs font-semibold text-ink-900">
              @if (o.icon) { <span class="text-action" aria-hidden="true">{{ o.icon }}</span> }
              {{ o.label }}
              @if (o.value === value()) { <span class="ml-auto text-action" aria-hidden="true">●</span> }
            </span>
            @if (o.description) { <span class="text-[11px] text-neutral-400">{{ o.description }}</span> }
          </label>
        }
      </div>
    </div>
  `
})
export class BaseSelectionCardComponent<V = unknown> extends BaseControl<V | null> {
  readonly options = input.required<BaseSelectionCardOption<V>[]>();
  readonly value = model<V | null>(null);
  readonly label = input('');
  readonly columns = input(3);
  readonly disabled = input(false);

  readonly name = nextId('bsc');

  cardClass(o: BaseSelectionCardOption<V>): string {
    if (o.disabled || this.disabled() || this.formDisabled()) return 'opacity-50 cursor-not-allowed border-neutral-200';
    return (o.value === this.value() ? 'border-action bg-action-surface' : 'border-neutral-200 hover:border-action/50') + ' cursor-pointer';
  }

  pick(o: BaseSelectionCardOption<V>): void {
    if (o.disabled) return;
    this.value.set(o.value);
    this.onChange(o.value);
  }

  writeValue(v: V | null): void { this.value.set(v); }
}

/** Bounded integer entry — decrement/value/increment, for small counts an operator adjusts by
 *  a few at a time (retry limits, batch sizes). Reach for `<base-slider>` instead once the
 *  range is wide enough that dragging beats clicking. */
@Component({
  selector: 'base-numeric-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseNumericStepperComponent), multi: true }],
  template: `
    <div class="block">
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}</span> }
      <div class="inline-flex items-center border border-neutral-200 rounded-r-sm overflow-hidden">
        <button type="button"
                class="w-8 h-9 inline-flex items-center justify-center text-ink-600 hover:bg-neutral-50 transition-colors
                       outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-inset
                       disabled:opacity-40 disabled:cursor-not-allowed"
                [disabled]="disabled() || formDisabled() || value() <= min()"
                (click)="step(-1)" aria-label="Decrease">−</button>
        <input type="text" inputmode="numeric" [value]="value()" [disabled]="disabled() || formDisabled()"
               class="w-12 h-9 text-center text-xs text-ink-700 border-x border-neutral-200 outline-none
                      focus:ring-2 focus:ring-inset focus:ring-action-surface disabled:bg-neutral-50 disabled:text-neutral-400"
               (change)="onManualInput($event)" (blur)="onTouched()" />
        <button type="button"
                class="w-8 h-9 inline-flex items-center justify-center text-ink-600 hover:bg-neutral-50 transition-colors
                       outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-inset
                       disabled:opacity-40 disabled:cursor-not-allowed"
                [disabled]="disabled() || formDisabled() || value() >= max()"
                (click)="step(1)" aria-label="Increase">+</button>
      </div>
    </div>
  `
})
export class BaseNumericStepperComponent extends BaseControl<number> {
  readonly value = model(0);
  readonly min = input(-Infinity);
  readonly max = input(Infinity);
  readonly stepSize = input(1);
  readonly label = input('');
  readonly disabled = input(false);

  step(dir: 1 | -1): void {
    const next = Math.min(this.max(), Math.max(this.min(), this.value() + dir * this.stepSize()));
    this.value.set(next);
    this.onChange(next);
  }

  onManualInput(ev: Event): void {
    let n = Number((ev.target as HTMLInputElement).value);
    if (isNaN(n)) n = this.value();
    n = Math.min(this.max(), Math.max(this.min(), n));
    this.value.set(n);
    this.onChange(n);
  }

  writeValue(v: number): void { this.value.set(v ?? 0); }
}

/** Fixed-length numeric code, one digit per box — auto-advances on entry, steps back on
 *  Backspace from an empty box, and accepts a full paste in one go. */
@Component({
  selector: 'base-otp-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="block">
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}</span> }
      <div class="flex gap-1.5" role="group" [attr.aria-label]="ariaLabel() || 'One-time passcode'">
        @for (i of cellIndexes(); track i) {
          <input #cell type="text" inputmode="numeric" maxlength="1"
                 class="w-9 h-10 text-center text-sm font-semibold rounded-r-sm border outline-none transition-colors
                        focus:ring-2 focus:ring-action-surface focus:border-action disabled:bg-neutral-50 disabled:text-neutral-300"
                 [class]="error() ? 'border-error text-error' : 'border-neutral-200 text-ink-700'"
                 [disabled]="disabled()"
                 [value]="digits()[i]"
                 (input)="onDigit(i, $event)"
                 (keydown.backspace)="onBackspace(i, $event)"
                 (paste)="onPaste($event)" />
        }
      </div>
      @if (error()) { <span class="mt-1 text-[11px] font-medium text-error block">{{ error() }}</span> }
      @else if (hint()) { <span class="mt-1 text-[11px] text-neutral-400 block">{{ hint() }}</span> }
    </div>
  `
})
export class BaseOtpInputComponent {
  readonly length = input(6);
  readonly value = model('');
  readonly label = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false);
  readonly ariaLabel = input('');

  readonly completed = output<string>();

  @ViewChildren('cell') private cells?: QueryList<ElementRef<HTMLInputElement>>;

  protected readonly cellIndexes = computed(() => Array.from({ length: this.length() }, (_, i) => i));
  protected readonly digits = computed(() => Array.from({ length: this.length() }, (_, i) => this.value()[i] ?? ''));

  onDigit(i: number, ev: Event): void {
    const raw = (ev.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1);
    const arr = this.digits();
    arr[i] = raw;
    const next = arr.join('');
    this.value.set(next);
    if (raw && i < this.length() - 1) this.focusCell(i + 1);
    if (next.length === this.length()) this.completed.emit(next);
  }

  onBackspace(i: number, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (!input.value && i > 0) { ev.preventDefault(); this.focusCell(i - 1); }
  }

  onPaste(ev: ClipboardEvent): void {
    ev.preventDefault();
    const text = ev.clipboardData?.getData('text').replace(/\D/g, '').slice(0, this.length()) ?? '';
    if (!text) return;
    this.value.set(text);
    if (text.length === this.length()) this.completed.emit(text);
    else this.focusCell(Math.min(text.length, this.length() - 1));
  }

  private focusCell(i: number): void {
    queueMicrotask(() => this.cells?.get(i)?.nativeElement.focus());
  }
}

export interface BaseColorSwatch {
  value: string;
  colorClass: string;
  label: string;
}

const DEFAULT_COLOR_SWATCHES: BaseColorSwatch[] = [
  { value: 'action', colorClass: 'bg-action', label: 'Cobalt' },
  { value: 'accent', colorClass: 'bg-accent', label: 'Violet' },
  { value: 'success', colorClass: 'bg-success', label: 'Green' },
  { value: 'info', colorClass: 'bg-info', label: 'Teal' },
  { value: 'warning', colorClass: 'bg-warning', label: 'Amber' },
  { value: 'error', colorClass: 'bg-error', label: 'Red' },
  { value: 'brand', colorClass: 'bg-brand', label: 'Indigo' }
];

@Component({
  selector: 'base-color-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseColorPickerComponent), multi: true }],
  template: `
    <div class="block">
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}</span> }
      <div class="flex flex-wrap gap-2" role="radiogroup" [attr.aria-label]="label() || 'Color'">
        @for (s of swatches(); track s.value) {
          <button type="button" role="radio" [attr.aria-checked]="s.value === value()" [attr.aria-label]="s.label"
                  class="w-7 h-7 rounded-full inline-flex items-center justify-center outline-none transition-transform
                         focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action hover:scale-110
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  [class]="s.colorClass" [disabled]="disabled() || formDisabled()"
                  (click)="pick(s)">
            @if (s.value === value()) { <span class="text-neutral-0 text-xs" aria-hidden="true">✓</span> }
          </button>
        }
      </div>
      @if (hint()) { <span class="${HINT_CLS}">{{ hint() }}</span> }
    </div>
  `
})
export class BaseColorPickerComponent extends BaseControl<string> {
  readonly swatches = input<BaseColorSwatch[]>(DEFAULT_COLOR_SWATCHES);
  readonly value = model('');
  readonly label = input('');
  readonly hint = input('');
  readonly disabled = input(false);

  pick(s: BaseColorSwatch): void {
    this.value.set(s.value);
    this.onChange(s.value);
  }

  writeValue(v: string): void { this.value.set(v ?? ''); }
}

/** Multi-select where every option must stay visible at once — no dropdown to open, no chips
 *  to scan. Reach for `<base-multi-select-chips>` instead once the option list is longer than
 *  fits on screen and needs search. */
@Component({
  selector: 'base-checkbox-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseCheckboxGroupComponent), multi: true }],
  template: `
    <div>
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}</span> }
      <div class="flex gap-x-4 gap-y-1.5" [class.flex-col]="direction() === 'vertical'">
        @for (o of options(); track $index) {
          <label class="inline-flex items-center gap-sp-2 cursor-pointer select-none"
                 [class.opacity-50]="o.disabled || disabled() || formDisabled()">
            <input type="checkbox" [checked]="isChecked(o.value)" [disabled]="o.disabled || disabled() || formDisabled()"
                   class="w-4 h-4 accent-action rounded-r-xs outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-1"
                   (change)="toggle(o.value)" (blur)="onTouched()" />
            <span class="text-xs text-ink-700">{{ o.label }}</span>
          </label>
        }
      </div>
    </div>
  `
})
export class BaseCheckboxGroupComponent<V = unknown> extends BaseControl<V[]> {
  readonly options = input.required<BaseSelectOption<V>[]>();
  readonly value = model<V[]>([]);
  readonly label = input('');
  readonly direction = input<'horizontal' | 'vertical'>('vertical');
  readonly disabled = input(false);

  isChecked(v: V): boolean { return this.value().includes(v); }

  toggle(v: V): void {
    const next = this.isChecked(v) ? this.value().filter(x => x !== v) : [...this.value(), v];
    this.value.set(next);
    this.onChange(next);
  }

  writeValue(v: V[]): void { this.value.set(v ?? []); }
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** A dropdown list of preset time slots — pick one, don't type one. Reach for
 *  `<base-datepicker [showTime]="true">` instead when a free HH:MM entry is the better fit. */
@Component({
  selector: 'base-time-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseTimePickerComponent), multi: true }],
  template: `
    <div class="${FIELD_WRAP} relative">
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}</span> }
      <button type="button" class="${INPUT_CLS} flex items-center justify-between text-left border-neutral-200"
              [disabled]="disabled() || formDisabled()" (click)="toggle()">
        <span [class.text-neutral-400]="!value()">{{ value() || placeholder() }}</span>
        <span class="text-neutral-300 text-xs" aria-hidden="true">🕐</span>
      </button>
      @if (open()) {
        <div class="absolute z-30 mt-1 w-full bg-neutral-0 border border-neutral-200 rounded-r-md py-1 max-h-52 overflow-y-auto" style="box-shadow: var(--shadow-e2);">
          @for (t of slots(); track t) {
            <button type="button" class="w-full text-left px-sp-3 py-1.5 text-xs transition-colors"
                    [class]="t === value() ? 'bg-action-surface text-action font-semibold' : 'text-ink-600 hover:bg-neutral-50'"
                    (click)="pick(t)">{{ t }}</button>
          }
        </div>
      }
    </div>
  `
})
export class BaseTimePickerComponent extends BaseControl<string> {
  readonly value = model('');
  readonly label = input('');
  readonly placeholder = input('Select time…');
  readonly stepMinutes = input(30);
  readonly minTime = input('00:00');
  readonly maxTime = input('23:30');
  readonly disabled = input(false);

  protected readonly open = signal(false);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly slots = computed(() => {
    const [minH, minM] = this.minTime().split(':').map(Number);
    const [maxH, maxM] = this.maxTime().split(':').map(Number);
    const start = minH * 60 + minM, end = maxH * 60 + maxM, step = this.stepMinutes();
    const out: string[] = [];
    for (let t = start; t <= end; t += step) out.push(`${pad2(Math.floor(t / 60))}:${pad2(t % 60)}`);
    return out;
  });

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(ev.target as Node)) this.close();
  }

  toggle(): void { this.open() ? this.close() : this.open.set(true); }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.onTouched();
  }

  pick(t: string): void {
    this.value.set(t);
    this.onChange(t);
    this.close();
  }

  writeValue(v: string): void { this.value.set(v ?? ''); }
}
