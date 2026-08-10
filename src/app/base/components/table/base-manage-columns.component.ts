import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList
} from '@angular/cdk/drag-drop';
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
import { BaseManageColumnsEvent } from '../../models/table.model';
import { computeFixedPopupPosition, FixedPopupPosition } from './base-column-filters.components';
import { BaseTeleportDirective } from '../base-overlay.components';

export interface ManageColumnItem {
  key: string;
  header: string;
  /** Sticky/frozen columns: always visible, cannot be hidden or reordered. */
  locked: boolean;
}

/** Gear-icon panel for `<base-table>`'s column manager: search, Select All,
 *  per-column visibility, drag-to-reorder for non-frozen columns. Frozen
 *  columns lock at the top; a guard blocks unchecking the last visible column. */
@Component({
  selector: 'base-manage-columns',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, CdkDrag, CdkDragHandle, BaseTeleportDirective],
  template: `
    <div class="relative inline-block normal-case font-normal">
      <button type="button"
              class="inline-flex items-center justify-center w-5 h-5 rounded-r-xs hover:bg-neutral-100
                     text-neutral-400 hover:text-action transition-colors"
              aria-label="Manage columns" (click)="toggle()">⚙</button>

      @if (open()) {
        <div baseTeleport #panel class="fixed z-30 w-56 bg-neutral-0 border border-neutral-200 rounded-r-lg shadow-lg p-3 text-left"
             [style.top.px]="panelPos().top" [style.left.px]="panelPos().left" [style.right.px]="panelPos().right">
          <input type="text" [value]="search()" (input)="onSearch($event)" placeholder="Search columns"
                 class="w-full border border-neutral-200 rounded-r-sm px-2 py-1 text-[11px] mb-2
                        focus:outline-none focus:ring-1 focus:ring-action-surface" />

          <label class="flex items-center gap-1.5 py-1 text-[11px] font-semibold text-ink-600 cursor-pointer
                         border-b border-neutral-100 mb-1">
            <input type="checkbox" class="cb" [checked]="allSelected()" (change)="toggleSelectAll()" /> Select All
          </label>

          <div class="max-h-52 overflow-y-auto flex flex-col">
            @for (i of visibleLockedItems(); track i.key) {
              <div class="flex items-center gap-1.5 py-1 text-[11px] text-ink-500 border-b border-neutral-50">
                <span class="w-3 text-center text-neutral-300">🔒</span>
                <label class="flex items-center gap-1.5 flex-1 cursor-not-allowed">
                  <input type="checkbox" class="cb" checked disabled /> {{ i.header }}
                </label>
              </div>
            }

            <div cdkDropList (cdkDropListDropped)="drop($event)" class="flex flex-col">
              @for (key of visibleDraggableKeys(); track key) {
                <div cdkDrag class="flex items-center gap-1.5 py-1 text-[11px] text-ink-600 border-b border-neutral-50 bg-neutral-0">
                  <span cdkDragHandle class="w-3 text-center text-neutral-300 cursor-grab">⠿</span>
                  <label class="flex items-center gap-1.5 flex-1 cursor-pointer">
                    <input type="checkbox" class="cb" [checked]="draftVisible().has(key)"
                           (change)="toggleVisible(key)" />
                    {{ headerOf(key) }}
                  </label>
                </div>
              }
            </div>
          </div>

          <div class="flex gap-2 mt-2 pt-2 border-t border-neutral-100">
            <button type="button"
                    class="flex-1 text-xs font-semibold text-ink-600 hover:bg-neutral-50 rounded-r-sm px-3 py-1.5
                           border border-neutral-200 transition-colors"
                    (click)="cancel()">Cancel</button>
            <button type="button" class="flex-1 btn-primary justify-center" (click)="applyChanges()">Apply</button>
          </div>
        </div>
      }
    </div>
  `
})
export class BaseManageColumnsComponent {
  /** All columns in their current display order (locked = sticky/frozen). */
  readonly items = input.required<ManageColumnItem[]>();
  /** Currently visible non-locked keys (locked keys are implicitly always visible). */
  readonly visibleKeys = input<string[]>([]);
  readonly align = input<'left' | 'right'>('left');

  /** Fired on Apply with the new order + visible-key list. */
  readonly apply = output<BaseManageColumnsEvent>();

  protected readonly open = signal(false);
  protected readonly search = signal('');
  protected readonly draftVisible = signal<Set<string>>(new Set());
  protected readonly draftOrder = signal<string[]>([]);
  protected readonly panelPos = signal<FixedPopupPosition>({ top: 0 });
  private readonly host = inject(ElementRef<HTMLElement>);
  /** Panel is teleported to document.body, so outside-click checks must test it directly too. */
  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;

  private isInside(target: Node): boolean {
    return this.host.nativeElement.contains(target) || (this.panelRef?.nativeElement.contains(target) ?? false);
  }

  /** Ignores scroll events from within the panel (its own list, or CDK auto-scroll during drag). */
  private readonly closeOnScrollOrResize = (ev: Event) => {
    if (!this.isInside(ev.target as Node)) this.close();
  };

  protected readonly lockedItems = computed(() => this.items().filter(i => i.locked));
  private readonly nonLockedItems = computed(() => this.items().filter(i => !i.locked));

  protected readonly visibleLockedItems = computed(() => {
    const q = this.search().toLowerCase();
    return this.lockedItems().filter(i => !q || i.header.toLowerCase().includes(q));
  });

  protected readonly visibleDraggableKeys = computed(() => {
    const q = this.search().toLowerCase();
    const headers = new Map(this.items().map(i => [i.key, i.header]));
    return this.draftOrder().filter(k => !q || (headers.get(k) ?? '').toLowerCase().includes(q));
  });

  protected readonly allSelected = computed(() => {
    const all = this.nonLockedItems();
    return all.length > 0 && all.every(i => this.draftVisible().has(i.key));
  });

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.open() && !this.isInside(ev.target as Node)) this.close();
  }

  toggle(): void {
    if (this.open()) { this.close(); return; }
    this.draftVisible.set(new Set(this.visibleKeys().filter(k => !this.isLocked(k))));
    this.draftOrder.set(this.nonLockedItems().map(i => i.key));
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

  cancel(): void {
    this.close();
  }

  onSearch(ev: Event): void {
    this.search.set((ev.target as HTMLInputElement).value);
  }

  headerOf(key: string): string {
    return this.items().find(i => i.key === key)?.header ?? key;
  }

  private isLocked(key: string): boolean {
    return this.items().find(i => i.key === key)?.locked ?? false;
  }

  toggleVisible(key: string): void {
    const willUncheck = this.draftVisible().has(key);
    if (willUncheck && this.lockedItems().length + this.draftVisible().size <= 1) return;
    this.draftVisible.update(s => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  toggleSelectAll(): void {
    const all = this.nonLockedItems().map(i => i.key);
    if (this.allSelected()) {
      this.draftVisible.set(this.lockedItems().length > 0 ? new Set() : new Set(all.slice(0, 1)));
    } else {
      this.draftVisible.set(new Set(all));
    }
  }

  drop(ev: CdkDragDrop<string[]>): void {
    const visible = this.visibleDraggableKeys();
    const movedKey = visible[ev.previousIndex];
    const targetKey = visible[ev.currentIndex];
    if (!movedKey || !targetKey || movedKey === targetKey) return;
    this.draftOrder.update(order => {
      const next = [...order];
      const from = next.indexOf(movedKey);
      next.splice(from, 1);
      const to = next.indexOf(targetKey);
      const insertAt = ev.currentIndex > ev.previousIndex ? to + 1 : to;
      next.splice(insertAt, 0, movedKey);
      return next;
    });
  }

  applyChanges(): void {
    const lockedKeys = this.lockedItems().map(i => i.key);
    const order = [...lockedKeys, ...this.draftOrder()];
    const visibleKeys = [...lockedKeys, ...this.draftOrder().filter(k => this.draftVisible().has(k))];
    this.apply.emit({ visibleKeys, order });
    this.close();
  }
}
