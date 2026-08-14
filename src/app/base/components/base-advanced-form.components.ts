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

let uid = 0;
const nextId = (prefix: string) => `${prefix}-${++uid}`;

const LABEL_CLS = `block text-caption text-neutral-400 mb-1`;
const HINT_CLS = `mt-1 text-caption normal-case font-normal text-neutral-400`;

export interface BaseComboOption {
  label: string;
  value: string;
  /** Options are grouped by this field in list order — pre-sort/group the array; the combobox
   *  just inserts a header wherever [group] changes. */
  group?: string;
  /** Right-aligned trailing text, e.g. a tool count or "offline". */
  meta?: string;
  disabled?: boolean;
}

/** Type-ahead field where the typed text is a real value, not just a filter —
 *  options narrow as you type; arrow keys / Enter pick a suggestion. */
@Component({
  selector: 'base-combobox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseComboboxComponent), multi: true }],
  template: `
    <label class="block relative" [attr.for]="id">
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}</span> }
      <span class="relative block">
        <input [id]="id" type="text" [value]="value()" [placeholder]="placeholder()"
               [disabled]="disabled() || formDisabled()"
               class="w-full h-9 border rounded-r-sm px-sp-3 text-xs text-ink-700 bg-neutral-0 transition-colors
                      focus:outline-none focus:ring-2 focus:ring-action-surface focus:border-action
                      disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed"
               [class.border-action]="open()"
               [class.border-neutral-200]="!open()"
               [style.paddingRight]="!open() && confirmedMatch() ? '1.75rem' : null"
               role="combobox" aria-autocomplete="list" [attr.aria-expanded]="open()"
               (input)="onInput($event)" (focus)="onFocus()" (blur)="onBlur()"
               (keydown.arrowdown)="move(1)" (keydown.arrowup)="move(-1)"
               (keydown.enter)="commit()" (keydown.escape)="close()" />
        @if (!open() && confirmedMatch()) {
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-success text-xs" aria-hidden="true">✓</span>
        }
      </span>

      @if (open() && filtered().length) {
        <div class="absolute z-30 mt-1 w-full bg-neutral-0 border border-neutral-200 rounded-r-md py-1 max-h-52 overflow-y-auto" style="box-shadow: var(--shadow-e2);">
          @for (o of filtered(); track o.value; let i = $index) {
            @if (o.group && o.group !== filtered()[i - 1]?.group) {
              <div class="px-sp-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-neutral-400">{{ o.group }}</div>
            }
            <button type="button" [disabled]="o.disabled"
                    class="w-full text-left px-sp-3 py-1.5 text-xs flex items-center justify-between gap-2 transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed"
                    [class]="i === activeIndex() ? 'bg-action-surface text-action font-semibold' : 'text-ink-600 hover:bg-neutral-50'"
                    (mousedown)="pick(o)">
              <span class="truncate inline-flex items-center gap-1.5">
                {{ o.label }}
                @if (o.label === value()) { <span class="text-success" aria-hidden="true">✓</span> }
              </span>
              @if (o.meta) { <span class="shrink-0 text-[10px] text-neutral-400">{{ o.meta }}</span> }
            </button>
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

  /** The current text is an exact, valid pick (not free-typed) — shows the closed-state ✓. */
  protected readonly confirmedMatch = computed(() => this.options().some(o => o.label === this.value() && !o.disabled));

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
    if (i >= 0 && i < list.length && !list[i].disabled) this.pick(list[i]);
    else this.close();
  }

  pick(o: BaseComboOption): void {
    if (o.disabled) return;
    this.value.set(o.label);
    this.onChange(o.label);
    this.optionSelected.emit(o);
    this.close();
  }

  writeValue(v: string): void { this.value.set(v ?? ''); }
}

/** Multi-select field; selected values render as removable chips inline. */
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
      @if (hint()) { <span class="${HINT_CLS}">{{ hint() }}</span> }
    </div>
  `
})
export class BaseMultiSelectChipsComponent extends BaseControl<string[]> {
  readonly options = input.required<BaseComboOption[]>();
  /** Two-way bound array of selected values: [(value)]. */
  readonly value = model<string[]>([]);
  readonly label = input('');
  readonly placeholder = input('Add…');
  readonly hint = input('');

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

/** Drag-and-drop upload zone; each file gets its own row with a progress bar
 *  and a remove control until upload completes. */
@Component({
  selector: 'base-file-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="block">
      @if (label()) { <span class="${LABEL_CLS}">{{ label() }}</span> }
      <label class="flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-r-md px-sp-4 py-sp-6 text-center cursor-pointer transition-colors"
             [class]="dragInvalid() ? 'border-error bg-error-surface' : dragOver() ? 'border-action bg-action-surface' : 'border-neutral-200 hover:border-action'"
             (dragover)="onDragOver($event)" (dragleave)="onDragLeave()" (drop)="onDrop($event)">
        @if (dragInvalid()) {
          <span class="icon-outline text-error" style="font-size:28px;" aria-hidden="true">block</span>
          <span class="text-xs font-semibold text-error">That file type isn't accepted</span>
          @if (accept()) { <span class="text-[11px] text-error/80">{{ label() || 'Files' }} must be {{ accept() }}</span> }
        } @else if (dragOver()) {
          <span class="icon-outline text-action" style="font-size:28px;" aria-hidden="true">upload_file</span>
          <span class="text-xs font-semibold text-action">Release to upload</span>
          <span class="text-[11px] text-action/70">{{ dragCount() }} file{{ dragCount() === 1 ? '' : 's' }} ready</span>
        } @else {
          <span class="icon-outline text-neutral-300" style="font-size:28px;" aria-hidden="true">upload_file</span>
          <span class="text-xs text-ink-600">Drop files or <span class="text-action font-semibold">browse</span></span>
          @if (accept()) { <span class="text-[11px] text-neutral-400">{{ accept() }}@if (maxSizeMb()) { up to {{ maxSizeMb() }}MB }</span> }
        }
        <input type="file" class="sr-only" [multiple]="multiple()" [attr.accept]="accept() || null" (change)="onSelect($event)" />
      </label>

      @if (files().length) {
        <div class="mt-sp-3 flex flex-col gap-sp-2">
          @for (f of files(); track f.name) {
            <div class="flex items-center gap-sp-3 border rounded-r-sm px-sp-3 py-sp-2"
                 [class]="f.error ? 'border-error/30 bg-error-surface' : 'border-neutral-200'">
              <span class="icon-outline shrink-0" [class]="f.error ? 'text-error' : 'text-neutral-400'" style="font-size:18px;" aria-hidden="true">
                {{ f.error ? 'error' : 'description' }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-ink-700 truncate">{{ f.name }} <span class="text-neutral-400 font-normal">{{ formatSize(f.size) }}</span></p>
                @if (f.error) {
                  <p class="text-[11px] text-error">{{ f.error }}</p>
                } @else if (f.progress < 100) {
                  <div class="h-1 rounded-r-full bg-neutral-100 overflow-hidden mt-1"><div class="h-full bg-action rounded-r-full transition-all" [style.width.%]="f.progress"></div></div>
                } @else {
                  <p class="text-[11px] text-success flex items-center gap-1"><span aria-hidden="true">✓</span>Uploaded</p>
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
  /** Display text, e.g. "CSV, XLSX"; only restricts the file picker if it's a valid HTML accept string. */
  readonly accept = input('');
  /** MIME types for the drag-time rejection preview, e.g. ['application/json', 'text/xml'] — a
   *  separate input from [accept] because [accept] is display text, not always a valid MIME
   *  list. Best-effort: the browser only reports a MIME guess during dragover (never the
   *  filename, for security), and some OS/extension pairs report none at all — when it can't
   *  tell, this fails open (no red state) rather than risk a false rejection; the real check
   *  still runs on drop via the native `accept` filter and whatever validation the host applies
   *  to (filesAdded). Leave empty to skip the drag-time preview entirely. */
  readonly acceptTypes = input<string[]>([]);
  readonly maxSizeMb = input(0);
  readonly multiple = input(true);
  /** Controlled list of files + progress; the host owns upload progress updates. */
  readonly files = model<BaseUploadFile[]>([]);

  readonly filesAdded = output<File[]>();
  readonly fileRemoved = output<BaseUploadFile>();

  formatSize(bytes: number): string {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected readonly dragOver = signal(false);
  protected readonly dragInvalid = signal(false);
  protected readonly dragCount = signal(0);

  onDragOver(ev: DragEvent): void {
    ev.preventDefault();
    const dt = ev.dataTransfer;
    const items = dt ? Array.from(dt.items).filter(i => i.kind === 'file') : [];
    this.dragCount.set(items.length);

    const types = this.acceptTypes();
    const invalid = types.length > 0 && items.some(i => i.type && !types.includes(i.type));
    this.dragInvalid.set(invalid);
    this.dragOver.set(!invalid);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
    this.dragInvalid.set(false);
  }

  onDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver.set(false);
    this.dragInvalid.set(false);
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

/** Bounded numeric range slider with a visible current value. Arrow keys step by 1, Page
 *  Up/Down step by 10. Reach for `<base-range-slider>` instead for a from/to pair, or
 *  `<base-numeric-stepper>` once clicking beats dragging (a range too narrow to aim inside). */
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
      <div class="relative pt-5">
        @if (showValueBubble() && focused()) {
          <span class="absolute -top-0.5 -translate-x-1/2 text-[10px] font-semibold text-neutral-0 bg-ink-900 rounded-r-xs px-1.5 py-0.5 pointer-events-none whitespace-nowrap"
                [style.left.%]="pct()">{{ value() }}{{ unit() }}</span>
        }
        <input type="range" [min]="min()" [max]="max()" [step]="step()" [value]="value()"
               [disabled]="disabled()"
               class="w-full h-1.5 rounded-r-full bg-neutral-200 accent-action outline-none
                      focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 disabled:opacity-50"
               (input)="onInput($event)" (focus)="focused.set(true)" (blur)="focused.set(false); onTouched()" />
      </div>
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
  /** Shows a small tooltip with the current value above the thumb while focused/dragging. */
  readonly showValueBubble = input(false);
  /** Two-way bound: [(value)]. */
  readonly value = model(0);

  protected readonly focused = signal(false);
  protected readonly pct = computed(() => {
    const span = this.max() - this.min() || 1;
    return ((this.value() - this.min()) / span) * 100;
  });

  onInput(ev: Event): void {
    const v = Number((ev.target as HTMLInputElement).value);
    this.value.set(v);
    this.onChange(v);
  }

  writeValue(v: number): void { this.value.set(v ?? 0); }
}

export interface BaseRangeValue {
  from: number;
  to: number;
}

/** Two bounded handles over one track — a from/to pair (a maintenance window, a shift). The
 *  two `<input type="range">` overlays only accept pointer input on their own thumb (see the
 *  `[&::-webkit-slider-thumb]`/`[&::-moz-range-thumb]` overrides below), so either handle stays
 *  independently grabbable even when they're side by side. */
@Component({
  selector: 'base-range-slider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="block">
      @if (label()) {
        <div class="flex items-center justify-between mb-1">
          <span class="${LABEL_CLS} mb-0">{{ label() }}</span>
          <span class="text-xs font-semibold text-ink-700 tabular-nums">{{ value().from }}{{ unit() }} – {{ value().to }}{{ unit() }}</span>
        </div>
      }
      <div class="relative h-1.5" [class.opacity-50]="disabled()">
        <div class="absolute inset-0 rounded-r-full bg-neutral-200"></div>
        <div class="absolute h-full rounded-r-full bg-action" [style.left.%]="fromPct()" [style.right.%]="100 - toPct()"></div>
        <input type="range" [min]="min()" [max]="max()" [step]="step()" [value]="value().from" [disabled]="disabled()"
               class="absolute inset-0 w-full h-1.5 m-0 appearance-none bg-transparent pointer-events-none outline-none
                      [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto
                      focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
               aria-label="From" (input)="onFromInput($event)" />
        <input type="range" [min]="min()" [max]="max()" [step]="step()" [value]="value().to" [disabled]="disabled()"
               class="absolute inset-0 w-full h-1.5 m-0 appearance-none bg-transparent pointer-events-none outline-none
                      [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto
                      focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
               aria-label="To" (input)="onToInput($event)" />
      </div>
    </div>
  `
})
export class BaseRangeSliderComponent {
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly unit = input('');
  readonly label = input('');
  readonly disabled = input(false);
  /** Two-way bound {from, to}: [(value)]. */
  readonly value = model<BaseRangeValue>({ from: 0, to: 100 });

  readonly changed = output<BaseRangeValue>();

  protected readonly fromPct = computed(() => this.pct(this.value().from));
  protected readonly toPct = computed(() => this.pct(this.value().to));

  private pct(v: number): number {
    const span = this.max() - this.min() || 1;
    return ((v - this.min()) / span) * 100;
  }

  onFromInput(ev: Event): void {
    const v = Math.min(Number((ev.target as HTMLInputElement).value), this.value().to);
    const next = { ...this.value(), from: v };
    this.value.set(next);
    this.changed.emit(next);
  }

  onToInput(ev: Event): void {
    const v = Math.max(Number((ev.target as HTMLInputElement).value), this.value().from);
    const next = { ...this.value(), to: v };
    this.value.set(next);
    this.changed.emit(next);
  }
}
