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
  locked: boolean;
}


@Component({
  selector: 'base-manage-columns',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, CdkDrag, CdkDragHandle, BaseTeleportDirective],
  template: `
    <div class="relative inline-block normal-case font-normal">
      <button type="button"
              class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-600 border border-neutral-200 rounded-r-sm px-2.5 py-1.5
                     hover:border-action hover:text-action transition-colors"
              aria-label="Manage columns" (click)="toggle()">
        <span class="icon-outline" style="font-size:14px;" aria-hidden="true">view_column</span>
        Columns
      </button>

      @if (open()) {
        <div baseTeleport #panel class="fixed z-30 w-72 bg-neutral-0 border border-neutral-200 rounded-r-lg shadow-lg p-3 text-left"
             [style.top.px]="panelPos().top" [style.left.px]="panelPos().left" [style.right.px]="panelPos().right">
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[12px] font-bold text-ink-900">Columns · {{ selectedCount() }} of {{ totalCount() }}</span>
            <button type="button" class="text-[11px] font-semibold text-action hover:text-action-hover" (click)="resetToDefault()">Reset</button>
          </div>

          <div class="relative mb-2">
            <span class="icon-outline absolute left-2 top-1/2 -translate-y-1/2 text-neutral-300" style="font-size:14px;" aria-hidden="true">search</span>
            <input type="text" [value]="search()" (input)="onSearch($event)" placeholder="Search columns"
                   class="w-full border border-neutral-200 rounded-r-sm pl-7 pr-2 py-1.5 text-[11px]
                          focus:outline-none focus:ring-1 focus:ring-action-surface" />
          </div>

          <label class="flex items-center gap-1.5 py-1.5 text-[11px] font-semibold text-ink-600 cursor-pointer
                         border-b border-neutral-100 mb-1">
            <input type="checkbox" class="cb" [checked]="allSelected()" [indeterminate]="someSelected()" (change)="toggleSelectAll()" /> All columns
          </label>

          <div class="max-h-52 overflow-y-auto flex flex-col">
            @for (i of visibleLockedItems(); track i.key) {
              <div class="flex items-center gap-1.5 py-1.5 text-[11px] text-neutral-400 border-b border-neutral-50">
                <span class="w-3.5 shrink-0"></span>
                <input type="checkbox" class="cb shrink-0" checked disabled />
                <span class="icon-outline text-neutral-300 shrink-0" style="font-size:13px;" aria-hidden="true">lock</span>
                <span class="flex-1 truncate cursor-not-allowed">{{ i.header }}</span>
              </div>
            }

            <div cdkDropList (cdkDropListDropped)="drop($event)" class="flex flex-col">
              @for (key of visibleDraggableKeys(); track key) {
                <div cdkDrag class="flex items-center gap-1.5 py-1.5 text-[11px] text-ink-600 border-b border-neutral-50 bg-neutral-0">
                  <span cdkDragHandle class="icon-outline shrink-0 text-neutral-300 cursor-grab" style="font-size:14px;" aria-hidden="true">drag_indicator</span>
                  <label class="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer">
                    <input type="checkbox" class="cb shrink-0" [checked]="draftVisible().has(key)"
                           (change)="toggleVisible(key)" />
                    <span class="truncate">{{ headerOf(key) }}</span>
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
  readonly items = input.required<ManageColumnItem[]>();
  readonly visibleKeys = input<string[]>([]);
  readonly align = input<'left' | 'right'>('left');

  readonly apply = output<BaseManageColumnsEvent>();

  protected readonly open = signal(false);
  protected readonly search = signal('');
  protected readonly draftVisible = signal<Set<string>>(new Set());
  protected readonly draftOrder = signal<string[]>([]);
  protected readonly panelPos = signal<FixedPopupPosition>({ top: 0 });
  private readonly host = inject(ElementRef<HTMLElement>);
  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;

  private isInside(target: Node): boolean {
    return this.host.nativeElement.contains(target) || (this.panelRef?.nativeElement.contains(target) ?? false);
  }

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

  protected readonly someSelected = computed(() => {
    const all = this.nonLockedItems();
    const n = all.filter(i => this.draftVisible().has(i.key)).length;
    return n > 0 && n < all.length;
  });

  protected readonly totalCount = computed(() => this.items().length);
  protected readonly selectedCount = computed(() => this.lockedItems().length + this.draftVisible().size);

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

  resetToDefault(): void {
    const all = this.nonLockedItems().map(i => i.key);
    this.draftVisible.set(new Set(all));
    this.draftOrder.set(all);
    this.search.set('');
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
