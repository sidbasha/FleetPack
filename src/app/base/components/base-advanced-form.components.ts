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
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControl } from './base-form.components';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BASE MODULE · Advanced form controls
 * Seven enterprise patterns beyond the core field set (text/select/checkbox/
 * radio/toggle in base-form.components.ts). Date & time pickers already live
 * in base-datepicker.component.ts / base-date-range-picker.component.ts
 * (the latter's per-side HH:MM boxes double as the documented Time Picker);
 * the remaining four — combo box, multi-select with chips, file upload,
 * slider — are defined here. See Components → Forms & Selection.
 * ─────────────────────────────────────────────────────────────────────────────
 */

let uid = 0;
const nextId = (prefix: string) => `${prefix}-${++uid}`;

const LABEL_CLS = `block text-caption text-neutral-400 mb-1`;
const HINT_CLS = `mt-1 text-caption normal-case font-normal text-neutral-400`;

export interface BaseComboOption {
  label: string;
  value: string;
}

/**
 * Unlike Select, the typed text is a real value, not just a filter — you
 * type but an unmatched entry is still accepted if the field allows free
 * text. Options narrow as you type; arrow keys / Enter pick a suggestion.
 */
@Component({
  selector: 'base-combobox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseComboboxComponent), multi: true }],
  template: `
    <label class="block relative" [attr.for]="id">
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}</span> }
      <input [id]="id" type="text" [value]="value()" [placeholder]="placeholder()"
             [disabled]="disabled() || formDisabled()"
             class="w-full h-9 border rounded-r-sm px-sp-3 text-xs text-ink-700 bg-neutral-0 transition-colors
                    focus:outline-none focus:ring-2 focus:ring-action-surface focus:border-action
                    disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed"
             [class.border-action]="open()"
             [class.border-neutral-200]="!open()"
             role="combobox" aria-autocomplete="list" [attr.aria-expanded]="open()"
             (input)="onInput($event)" (focus)="onFocus()" (blur)="onBlur()"
             (keydown.arrowdown)="move(1)" (keydown.arrowup)="move(-1)"
             (keydown.enter)="commit()" (keydown.escape)="close()" />

      @if (open() && filtered().length) {
        <div class="absolute z-30 mt-1 w-full bg-neutral-0 border border-neutral-200 rounded-r-md py-1 max-h-52 overflow-y-auto" style="box-shadow: var(--shadow-e2);">
          @for (o of filtered(); track o.value; let i = $index) {
            <button type="button"
                    class="w-full text-left px-sp-3 py-1.5 text-xs transition-colors"
                    [class]="i === activeIndex() ? 'bg-action-surface text-action font-semibold' : 'text-ink-600 hover:bg-neutral-50'"
                    (mousedown)="pick(o)">{{ o.label }}</button>
          }
        </div>
      }
      @if (hint()) { <span class="${HINT_CLS}">{{ hint() }}</span> }
    </label>
  `
})
export class BaseComboboxComponent extends BaseControl<string> {
  readonly options = input.required<BaseComboOption[]>();
  readonly value = model('');
  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly disabled = input(false);

  readonly optionSelected = output<BaseComboOption>();

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  readonly id = nextId('cbo');

  protected readonly filtered = computed(() => {
    const q = this.value().toLowerCase();
    if (!q) return this.options();
    return this.options().filter(o => o.label.toLowerCase().includes(q));
  });

  onInput(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.value.set(v);
    this.onChange(v);
    this.open.set(true);
    this.activeIndex.set(-1);
  }

  onFocus(): void { this.open.set(true); }
  onBlur(): void { this.onTouched(); this.close(); }
  close(): void { this.open.set(false); }

  move(dir: 1 | -1): void {
    const n = this.filtered().length;
    if (!n) return;
    this.open.set(true);
    this.activeIndex.update(i => (i + dir + n) % n);
  }

  commit(): void {
    const i = this.activeIndex();
    const list = this.filtered();
    if (i >= 0 && i < list.length) this.pick(list[i]);
    else this.close();
  }

  pick(o: BaseComboOption): void {
    this.value.set(o.label);
    this.onChange(o.label);
    this.optionSelected.emit(o);
    this.close();
  }

  writeValue(v: string): void { this.value.set(v ?? ''); }
}

/**
 * Selected values render as chips inside the field itself; removing a chip
 * and removing the value are the same action. The field grows vertically as
 * chips wrap, never scrolls horizontally.
 */
@Component({
  selector: 'base-multi-select-chips',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseMultiSelectChipsComponent), multi: true }],
  template: `
    <div class="block">
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}</span> }
      <div class="w-full min-h-9 border border-neutral-200 rounded-r-sm px-sp-2 py-1.5 flex flex-wrap items-center gap-1.5 bg-neutral-0 focus-within:ring-2 focus-within:ring-action-surface focus-within:border-action transition-colors">
        @for (v of value(); track v) {
          <span class="inline-flex items-center gap-1 text-[11px] font-semibold rounded-r-full bg-action-surface text-action-hover pl-sp-2 pr-1 py-0.5">
            {{ labelFor(v) }}
            <button type="button" class="w-3.5 h-3.5 inline-flex items-center justify-center rounded-full hover:bg-action/20" (click)="remove(v)" [attr.aria-label]="'Remove ' + labelFor(v)">✕</button>
          </span>
        }
        <input type="text" [value]="query()" [placeholder]="value().length ? '' : placeholder()"
               class="flex-1 min-w-20 border-none outline-none text-xs bg-transparent py-0.5"
               (input)="onQuery($event)" (keydown.enter)="commit()" (keydown.backspace)="onBackspace()"
               (focus)="open.set(true)" (blur)="open.set(false)" />
      </div>
      @if (open() && filtered().length) {
        <div class="relative">
          <div class="absolute z-30 mt-1 w-full bg-neutral-0 border border-neutral-200 rounded-r-md py-1 max-h-52 overflow-y-auto" style="box-shadow: var(--shadow-e2);">
            @for (o of filtered(); track o.value) {
              <button type="button" class="w-full text-left px-sp-3 py-1.5 text-xs text-ink-600 hover:bg-neutral-50" (mousedown)="add(o.value)">{{ o.label }}</button>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class BaseMultiSelectChipsComponent extends BaseControl<string[]> {
  readonly options = input.required<BaseComboOption[]>();
  /** Two-way bound array of selected values: [(value)]. */
  readonly value = model<string[]>([]);
  readonly label = input('');
  readonly placeholder = input('Add…');

  protected readonly query = signal('');
  protected readonly open = signal(false);

  protected readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    const selected = new Set(this.value());
    return this.options().filter(o => !selected.has(o.value) && (!q || o.label.toLowerCase().includes(q)));
  });

  labelFor(v: string): string { return this.options().find(o => o.value === v)?.label ?? v; }

  add(v: string): void {
    if (this.value().includes(v)) return;
    this.value.update(list => [...list, v]);
    this.onChange(this.value());
    this.query.set('');
  }

  remove(v: string): void {
    this.value.update(list => list.filter(x => x !== v));
    this.onChange(this.value());
  }

  onQuery(ev: Event): void { this.query.set((ev.target as HTMLInputElement).value); }

  commit(): void {
    const first = this.filtered()[0];
    if (first) this.add(first.value);
  }

  onBackspace(): void {
    if (this.query() === '' && this.value().length) this.remove(this.value()[this.value().length - 1]);
  }

  writeValue(v: string[]): void { this.value.set(v ?? []); }
}

export interface BaseUploadFile {
  name: string;
  size: number;
  progress: number;
  error?: string;
}

/**
 * Drag-and-drop zone doubles as a click target; each accepted file gets its
 * own row with a determinate progress bar (§Feedback) and a remove control
 * until upload completes.
 */
@Component({
  selector: 'base-file-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="block">
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}</span> }
      <label class="flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-r-md px-sp-4 py-sp-6 text-center cursor-pointer transition-colors"
             [class]="dragOver() ? 'border-action bg-action-surface' : 'border-neutral-200 hover:border-action'"
             (dragover)="onDragOver($event)" (dragleave)="dragOver.set(false)" (drop)="onDrop($event)">
        <span class="icon-outline text-neutral-300" style="font-size:28px;" aria-hidden="true">upload_file</span>
        <span class="text-xs text-ink-600">Drop files or <span class="text-action font-semibold">browse</span></span>
        @if (accept()) { <span class="text-[11px] text-neutral-400">{{ accept() }}@if (maxSizeMb()) { up to {{ maxSizeMb() }}MB }</span> }
        <input type="file" class="sr-only" [multiple]="multiple()" [attr.accept]="accept() || null" (change)="onSelect($event)" />
      </label>

      @if (files().length) {
        <div class="mt-sp-3 flex flex-col gap-sp-2">
          @for (f of files(); track f.name) {
            <div class="flex items-center gap-sp-3 border border-neutral-200 rounded-r-sm px-sp-3 py-sp-2">
              <span class="icon-outline text-neutral-400" style="font-size:18px;" aria-hidden="true">description</span>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-ink-700 truncate">{{ f.name }}</p>
                @if (f.error) {
                  <p class="text-[11px] text-error">{{ f.error }}</p>
                } @else if (f.progress < 100) {
                  <div class="h-1 rounded-r-full bg-neutral-100 overflow-hidden mt-1"><div class="h-full bg-action rounded-r-full transition-all" [style.width.%]="f.progress"></div></div>
                }
              </div>
              <button type="button" class="text-neutral-300 hover:text-neutral-500 text-xs shrink-0" (click)="remove(f)" [attr.aria-label]="'Remove ' + f.name">✕</button>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class BaseFileUploadComponent {
  readonly label = input('');
  /** e.g. "CSV, XLSX" — display text only, doesn't restrict the file picker unless [accept] is a valid HTML accept string. */
  readonly accept = input('');
  readonly maxSizeMb = input(0);
  readonly multiple = input(true);
  /** Controlled list of files + progress; the host owns upload progress updates. */
  readonly files = model<BaseUploadFile[]>([]);

  readonly filesAdded = output<File[]>();
  readonly fileRemoved = output<BaseUploadFile>();

  protected readonly dragOver = signal(false);

  onDragOver(ev: DragEvent): void { ev.preventDefault(); this.dragOver.set(true); }

  onDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver.set(false);
    if (ev.dataTransfer?.files?.length) this.addFiles(Array.from(ev.dataTransfer.files));
  }

  onSelect(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (input.files?.length) this.addFiles(Array.from(input.files));
    input.value = '';
  }

  private addFiles(list: File[]): void {
    this.files.update(f => [...f, ...list.map(file => ({ name: file.name, size: file.size, progress: 0 }))]);
    this.filesAdded.emit(list);
  }

  remove(f: BaseUploadFile): void {
    this.files.update(list => list.filter(x => x !== f));
    this.fileRemoved.emit(f);
  }
}

/**
 * Arrow keys step by 1, Page Up/Down step by 10; the current value is
 * always visible as a number, never hidden behind the thumb alone. Reserve
 * for a bounded numeric range with fewer than ~100 discrete steps.
 */
@Component({
  selector: 'base-slider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseSliderComponent), multi: true }],
  template: `
    <div class="block">
      @if (label()) {
        <div class="flex items-center justify-between mb-1">
          <span class="${LABEL_CLS} mb-0">{{ label() }}</span>
          <span class="text-xs font-semibold text-ink-700 tabular-nums">{{ value() }}{{ unit() }}</span>
        </div>
      }
      <input type="range" [min]="min()" [max]="max()" [step]="step()" [value]="value()"
             [disabled]="disabled()"
             class="w-full h-1.5 rounded-r-full bg-neutral-200 accent-action outline-none
                    focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 disabled:opacity-50"
             (input)="onInput($event)" />
    </div>
  `
})
export class BaseSliderComponent extends BaseControl<number> {
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly unit = input('');
  readonly label = input('');
  readonly disabled = input(false);
  /** Two-way bound: [(value)]. */
  readonly value = model(0);

  onInput(ev: Event): void {
    const v = Number((ev.target as HTMLInputElement).value);
    this.value.set(v);
    this.onChange(v);
  }

  writeValue(v: number): void { this.value.set(v ?? 0); }
}
