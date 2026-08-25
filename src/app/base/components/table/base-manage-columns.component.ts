import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
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
  /** Current pin side — for locked items this is their fixed, non-negotiable side; for others it's the current user pin, if any. */
  pin?: 'left' | 'right' | null;
  /** Column width in px (parsed from `BaseColumnDef.width`, falling back to the table's default), used only to compute the pin budget meter. */
  widthPx: number;
}

type PinGroup = 'left' | 'scroll' | 'right';

@Component({
  selector: 'base-manage-columns',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, CdkDropListGroup, CdkDrag, CdkDragHandle, NgTemplateOutlet, BaseTeleportDirective],
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
        <div baseTeleport #panel class="fixed z-30 w-80 bg-neutral-0 border border-neutral-200 rounded-r-lg shadow-lg p-3 text-left"
             [style.top.px]="panelPos().top" [style.left.px]="panelPos().left" [style.right.px]="panelPos().right">
          <div class="flex items-center justify-between gap-2 mb-0.5">
            <span class="text-[12px] font-bold text-ink-900">Columns · {{ selectedCount() }} of {{ totalCount() }}</span>
            <button type="button" class="text-[11px] font-semibold text-action hover:text-action-hover" (click)="resetToDefault()">Reset</button>
          </div>
          <p class="text-[10px] text-neutral-400 mb-2">Drag an entry between groups to pin it, or use the pin buttons on each row.</p>

          <ng-template #pinButtons let-key let-group="group">
            <button type="button" class="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-r-xs"
                    [class]="group === 'left' ? 'text-action bg-action-surface' : 'text-neutral-300 hover:text-ink-600 hover:bg-neutral-100'"
                    [attr.aria-pressed]="group === 'left'"
                    [attr.aria-label]="(group === 'left' ? 'Unpin ' : 'Pin left ') + headerOf(key)"
                    title="Pin left" (mousedown)="$event.stopPropagation()" (click)="$event.stopPropagation(); togglePin(key, 'left')">
              <span class="icon-outline" style="font-size:14px;" aria-hidden="true">first_page</span>
            </button>
            <button type="button" class="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-r-xs"
                    [class]="group === 'right' ? 'text-action bg-action-surface' : 'text-neutral-300 hover:text-ink-600 hover:bg-neutral-100'"
                    [attr.aria-pressed]="group === 'right'"
                    [attr.aria-label]="(group === 'right' ? 'Unpin ' : 'Pin right ') + headerOf(key)"
                    title="Pin right" (mousedown)="$event.stopPropagation()" (click)="$event.stopPropagation(); togglePin(key, 'right')">
              <span class="icon-outline" style="font-size:14px;" aria-hidden="true">last_page</span>
            </button>
          </ng-template>

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

          <div class="max-h-64 overflow-y-auto flex flex-col" cdkDropListGroup>
            <div class="shrink-0 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-neutral-400 pt-1.5 pb-1">
              <span>Pinned left</span><span>{{ lockedLeftItems().length + filteredPinnedLeft().length }}</span>
            </div>
            @for (i of lockedLeftItems(); track i.key) {
              <div class="shrink-0 flex items-center gap-1.5 py-1.5 text-[11px] text-neutral-400 border-b border-neutral-50">
                <span class="icon-outline shrink-0" style="font-size:14px; visibility:hidden;" aria-hidden="true">drag_indicator</span>
                <input type="checkbox" class="cb shrink-0" checked disabled />
                <span class="flex-1 truncate cursor-not-allowed">{{ i.header }}</span>
                <span class="icon-outline text-neutral-300 shrink-0" style="font-size:13px;" aria-hidden="true" title="Identity column — always pinned">lock</span>
              </div>
            }
            <div cdkDropList [cdkDropListData]="draftPinnedLeft()" (cdkDropListDropped)="drop($event)" class="shrink-0 flex flex-col min-h-[2px]">
              @for (key of filteredPinnedLeft(); track key) {
                <div cdkDrag [cdkDragData]="key" class="shrink-0 flex items-center gap-1.5 py-1.5 text-[11px] text-ink-600 border-b border-neutral-50 bg-neutral-0">
                  <span cdkDragHandle class="icon-outline shrink-0 text-neutral-300 cursor-grab" style="font-size:14px;" aria-hidden="true">drag_indicator</span>
                  <label class="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer">
                    <input type="checkbox" class="cb shrink-0" [checked]="draftVisible().has(key)" (change)="toggleVisible(key)" />
                    <span class="truncate">{{ headerOf(key) }}</span>
                  </label>
                  <ng-container *ngTemplateOutlet="pinButtons; context: { $implicit: key, group: 'left' }" />
                </div>
              }
            </div>

            <div class="shrink-0 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-neutral-400 pt-2.5 pb-1">
              <span>Scrollable</span><span>{{ filteredScrollable().length }}</span>
            </div>
            <div cdkDropList [cdkDropListData]="draftScrollable()" (cdkDropListDropped)="drop($event)" class="shrink-0 flex flex-col min-h-[2px]">
              @for (key of filteredScrollable(); track key) {
                <div cdkDrag [cdkDragData]="key" class="shrink-0 flex items-center gap-1.5 py-1.5 text-[11px] text-ink-600 border-b border-neutral-50 bg-neutral-0">
                  <span cdkDragHandle class="icon-outline shrink-0 text-neutral-300 cursor-grab" style="font-size:14px;" aria-hidden="true">drag_indicator</span>
                  <label class="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer">
                    <input type="checkbox" class="cb shrink-0" [checked]="draftVisible().has(key)" (change)="toggleVisible(key)" />
                    <span class="truncate">{{ headerOf(key) }}</span>
                  </label>
                  <ng-container *ngTemplateOutlet="pinButtons; context: { $implicit: key, group: 'scroll' }" />
                </div>
              }
            </div>

            <div class="shrink-0 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-neutral-400 pt-2.5 pb-1">
              <span>Pinned right</span><span>{{ lockedRightItems().length + filteredPinnedRight().length }}</span>
            </div>
            <div cdkDropList [cdkDropListData]="draftPinnedRight()" (cdkDropListDropped)="drop($event)" class="shrink-0 flex flex-col min-h-[2px]">
              @for (key of filteredPinnedRight(); track key) {
                <div cdkDrag [cdkDragData]="key" class="shrink-0 flex items-center gap-1.5 py-1.5 text-[11px] text-ink-600 border-b border-neutral-50 bg-neutral-0">
                  <span cdkDragHandle class="icon-outline shrink-0 text-neutral-300 cursor-grab" style="font-size:14px;" aria-hidden="true">drag_indicator</span>
                  <label class="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer">
                    <input type="checkbox" class="cb shrink-0" [checked]="draftVisible().has(key)" (change)="toggleVisible(key)" />
                    <span class="truncate">{{ headerOf(key) }}</span>
                  </label>
                  <ng-container *ngTemplateOutlet="pinButtons; context: { $implicit: key, group: 'right' }" />
                </div>
              }
            </div>
            @for (i of lockedRightItems(); track i.key) {
              <div class="shrink-0 flex items-center gap-1.5 py-1.5 text-[11px] text-neutral-400 border-b border-neutral-50">
                <span class="icon-outline shrink-0" style="font-size:14px; visibility:hidden;" aria-hidden="true">drag_indicator</span>
                <input type="checkbox" class="cb shrink-0" checked disabled />
                <span class="flex-1 truncate cursor-not-allowed">{{ i.header }}</span>
                <span class="icon-outline text-neutral-300 shrink-0" style="font-size:13px;" aria-hidden="true" title="Identity column — always pinned">lock</span>
              </div>
            }
          </div>

          <div class="mt-2.5 pt-2.5 border-t border-neutral-100">
            <div class="flex items-center gap-2 mb-2.5">
              <div class="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                <div class="h-full rounded-full transition-all" [class]="overBudget() ? 'bg-error' : 'bg-action'"
                     [style.width.%]="barWidth()"></div>
              </div>
              <span class="text-[10px] font-semibold whitespace-nowrap" [class.text-error]="overBudget()" [class.text-neutral-500]="!overBudget()">
                {{ draftPinnedPercent() }}% pinned of {{ budgetPercent() }}% budget
              </span>
            </div>
            <div class="flex gap-2">
              <button type="button"
                      class="flex-1 text-xs font-semibold text-ink-600 hover:bg-neutral-50 rounded-r-sm px-3 py-1.5
                             border border-neutral-200 transition-colors"
                      (click)="cancel()">Cancel</button>
              <button type="button" class="flex-1 btn-primary justify-center" (click)="applyChanges()">Apply</button>
            </div>
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
  readonly budgetPercent = input(40);

  readonly apply = output<BaseManageColumnsEvent>();

  protected readonly open = signal(false);
  protected readonly search = signal('');
  protected readonly draftVisible = signal<Set<string>>(new Set());
  protected readonly draftPinnedLeft = signal<string[]>([]);
  protected readonly draftScrollable = signal<string[]>([]);
  protected readonly draftPinnedRight = signal<string[]>([]);
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
  protected readonly lockedLeftItems = computed(() => this.lockedItems().filter(i => i.pin !== 'right'));
  protected readonly lockedRightItems = computed(() => this.lockedItems().filter(i => i.pin === 'right'));

  private matchesSearch(key: string): boolean {
    const q = this.search().toLowerCase();
    return !q || this.headerOf(key).toLowerCase().includes(q);
  }

  protected readonly filteredPinnedLeft = computed(() => this.draftPinnedLeft().filter(k => this.matchesSearch(k)));
  protected readonly filteredScrollable = computed(() => this.draftScrollable().filter(k => this.matchesSearch(k)));
  protected readonly filteredPinnedRight = computed(() => this.draftPinnedRight().filter(k => this.matchesSearch(k)));

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

  private readonly totalWidth = computed(() => this.items().reduce((s, i) => s + i.widthPx, 0));
  protected readonly draftPinnedPercent = computed(() => {
    const total = this.totalWidth();
    if (total <= 0) return 0;
    const pinnedKeys = new Set([...this.lockedItems().map(i => i.key), ...this.draftPinnedLeft(), ...this.draftPinnedRight()]);
    const pinnedWidth = this.items().filter(i => pinnedKeys.has(i.key)).reduce((s, i) => s + i.widthPx, 0);
    return Math.round((pinnedWidth / total) * 100);
  });
  protected readonly overBudget = computed(() => this.draftPinnedPercent() > this.budgetPercent());
  protected barWidth(): number {
    return Math.min(this.draftPinnedPercent(), 100);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.open() && !this.isInside(ev.target as Node)) this.close();
  }

  toggle(): void {
    if (this.open()) { this.close(); return; }
    const nonLocked = this.nonLockedItems();
    const visible = new Set(this.visibleKeys());
    this.draftVisible.set(new Set(nonLocked.filter(i => visible.has(i.key)).map(i => i.key)));
    this.draftPinnedLeft.set(nonLocked.filter(i => i.pin === 'left').map(i => i.key));
    this.draftPinnedRight.set(nonLocked.filter(i => i.pin === 'right').map(i => i.key));
    this.draftScrollable.set(nonLocked.filter(i => i.pin !== 'left' && i.pin !== 'right').map(i => i.key));
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

  protected pinOf(key: string): 'left' | 'right' | null {
    if (this.draftPinnedLeft().includes(key)) return 'left';
    if (this.draftPinnedRight().includes(key)) return 'right';
    return null;
  }

  private groupSignal(group: PinGroup) {
    return group === 'left' ? this.draftPinnedLeft : group === 'right' ? this.draftPinnedRight : this.draftScrollable;
  }

  protected moveTo(key: string, target: PinGroup): void {
    const remove = (arr: string[]) => arr.filter(k => k !== key);
    this.draftPinnedLeft.update(remove);
    this.draftScrollable.update(remove);
    this.draftPinnedRight.update(remove);
    this.groupSignal(target).update(arr => [...arr, key]);
  }

  protected togglePin(key: string, side: 'left' | 'right'): void {
    this.moveTo(key, this.pinOf(key) === side ? 'scroll' : side);
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
    this.draftPinnedLeft.set([]);
    this.draftPinnedRight.set([]);
    this.draftScrollable.set(all);
    this.search.set('');
  }

  drop(ev: CdkDragDrop<string[]>): void {
    if (ev.previousContainer === ev.container) {
      moveItemInArray(ev.container.data, ev.previousIndex, ev.currentIndex);
    } else {
      transferArrayItem(ev.previousContainer.data, ev.container.data, ev.previousIndex, ev.currentIndex);
    }
    // The arrays above were spliced in place by the cdk helpers; re-set each
    // signal to the same (now-mutated) reference so all three re-emit.
    this.draftPinnedLeft.update(a => [...a]);
    this.draftScrollable.update(a => [...a]);
    this.draftPinnedRight.update(a => [...a]);
  }

  applyChanges(): void {
    const lockedLeftKeys = this.lockedLeftItems().map(i => i.key);
    const lockedRightKeys = this.lockedRightItems().map(i => i.key);
    const pinnedLeft = this.draftPinnedLeft();
    const pinnedRight = this.draftPinnedRight();
    const scrollable = this.draftScrollable();

    const order = [...lockedLeftKeys, ...pinnedLeft, ...scrollable, ...pinnedRight, ...lockedRightKeys];
    const visibleKeys = order.filter(k => lockedLeftKeys.includes(k) || lockedRightKeys.includes(k) || this.draftVisible().has(k));
    const pinned: Record<string, 'left' | 'right'> = {};
    for (const k of pinnedLeft) pinned[k] = 'left';
    for (const k of pinnedRight) pinned[k] = 'right';

    this.apply.emit({ visibleKeys, order, pinned });
    this.close();
  }
}
