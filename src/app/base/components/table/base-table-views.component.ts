import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { BaseTableView } from '../../models/table.model';

/**
 * Saved-views tab rail for `<base-table>` ("New in v2.0"). Fully controlled and framework-thin by
 * design, matching every other table sub-component here: the host owns the view list, which one
 * is active, and — critically — what "modified" means. `<base-table-views>` never inspects a
 * view's `state`; the host diffs its own live filter/sort/column snapshot against the active
 * view's saved one and passes the boolean in. This component only renders the rail and emits
 * intent (save/update/reset/copy link/switch) — nothing here persists anything.
 *
 * "All" (`isDefault: true`) always renders first and is never editable. Up to [maxPinned]
 * further views pin next to it; everything else collapses into a "More views" menu. Both limits
 * are enforced visually only (disabling "Save as new" / hiding the pin affordance past the cap)
 * — the host's store is the real source of truth for what's actually allowed.
 */
@Component({
  selector: 'base-table-views',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-1 flex-wrap px-1 py-1">
      @for (v of pinnedViews(); track v.id) {
        <button type="button"
                class="inline-flex items-center gap-1.5 rounded-r-full px-3 py-1.5 text-[11px] font-semibold transition-colors"
                [class]="v.id === activeViewId() ? 'bg-action text-neutral-0' : 'text-ink-600 hover:bg-neutral-100'"
                (click)="select(v.id)">
          {{ v.label }}
          @if (v.shared) { <span class="icon-outline" style="font-size:12px;" aria-hidden="true">group</span> }
          @if (v.readOnly) { <span class="icon-outline" style="font-size:12px;" aria-hidden="true">lock</span> }
          @if (v.id === activeViewId() && modified()) {
            <span class="text-[9px] font-bold uppercase tracking-wide bg-warning-surface text-warning-hover rounded-r-full px-1.5 py-0.5">Modified</span>
          }
        </button>
      }

      @if (overflowViews().length > 0) {
        <span class="relative inline-block">
          <button type="button" class="inline-flex items-center gap-1 rounded-r-full px-2.5 py-1.5 text-[11px] font-semibold text-ink-500 hover:bg-neutral-100"
                  (click)="moreOpen.set(!moreOpen())">More views ({{ overflowViews().length }}) <span class="text-[9px]">▾</span></button>
          @if (moreOpen()) {
            <div class="absolute z-20 top-full left-0 mt-1 w-52 bg-neutral-0 border border-neutral-200 rounded-r-lg shadow-lg py-1 max-h-64 overflow-y-auto">
              @for (v of overflowViews(); track v.id) {
                <button type="button" class="w-full text-left px-3 py-1.5 text-[11px] flex items-center gap-1.5"
                        [class]="v.id === activeViewId() ? 'text-action font-semibold bg-action-surface/50' : 'text-ink-600 hover:bg-neutral-50'"
                        (click)="select(v.id); moreOpen.set(false)">
                  <span class="flex-1">{{ v.label }}</span>
                  @if (v.shared) { <span class="icon-outline text-neutral-300" style="font-size:12px;" aria-hidden="true">group</span> }
                  @if (v.readOnly) { <span class="icon-outline text-neutral-300" style="font-size:12px;" aria-hidden="true">lock</span> }
                </button>
              } @empty {
                <span class="block px-3 py-2 text-[11px] text-neutral-300">No other saved views</span>
              }
            </div>
          }
        </span>
      }

      <span class="flex-1"></span>

      @if (modified() && canModifyActive()) {
        <button type="button" class="text-[11px] font-semibold text-action hover:text-action-hover" (click)="update.emit()">Update view</button>
        <button type="button" class="text-[11px] font-semibold text-neutral-400 hover:text-ink-600" (click)="reset.emit()">Reset</button>
      }
      @if (modified() && canSaveNew()) {
        @if (!saveOpen()) {
          <button type="button" class="text-[11px] font-semibold text-action hover:text-action-hover" (click)="openSave()">Save as new view</button>
        } @else {
          <span class="inline-flex items-center gap-1">
            <input type="text" [value]="draftLabel()" (input)="onDraftLabel($event)" placeholder="View name" autofocus
                   class="w-32 border border-neutral-200 rounded-r-sm px-2 py-1 text-[11px]
                          focus:outline-none focus:ring-1 focus:ring-action-surface" />
            <button type="button" class="btn-primary py-1! px-2.5! text-[11px]" [disabled]="!draftLabel().trim()" (click)="confirmSave()">Save</button>
            <button type="button" class="text-neutral-300 hover:text-neutral-500 text-xs" aria-label="Cancel" (click)="saveOpen.set(false)">✕</button>
          </span>
        }
      }
      @if (modified() && !canSaveNew() && !canModifyActive()) {
        <span class="text-[10px] text-neutral-300">{{ maxViews() }} saved views max</span>
      }
      <button type="button" class="inline-flex items-center justify-center w-6 h-6 rounded-r-xs text-neutral-400 hover:text-action hover:bg-neutral-100 transition-colors"
              aria-label="Copy link to this view" title="Copy link to this view" (click)="copyLink.emit()">
        <span class="icon-outline" style="font-size:15px;" aria-hidden="true">link</span>
      </button>
    </div>
  `
})
export class BaseTableViewsComponent {
  readonly views = input.required<BaseTableView[]>();
  readonly activeViewId = input.required<string>();
  readonly modified = input(false);
  readonly maxPinned = input(4);
  readonly maxViews = input(20);

  readonly activeViewIdChange = output<string>();
  readonly save = output<string>();
  readonly update = output<void>();
  readonly reset = output<void>();
  readonly copyLink = output<void>();

  protected readonly moreOpen = signal(false);
  protected readonly saveOpen = signal(false);
  protected readonly draftLabel = signal('');

  private readonly allView = computed(() => this.views().find(v => v.isDefault) ?? null);
  protected readonly pinnedViews = computed(() => {
    const all = this.allView();
    const pinned = this.views().filter(v => !v.isDefault && v.pinned).slice(0, this.maxPinned());
    return all ? [all, ...pinned] : pinned;
  });
  protected readonly overflowViews = computed(() => this.views().filter(v => !v.isDefault && !v.pinned));

  protected readonly canModifyActive = computed(() => {
    const v = this.views().find(x => x.id === this.activeViewId());
    return !!v && !v.isDefault && !v.readOnly;
  });
  protected readonly canSaveNew = computed(() => this.views().length < this.maxViews());

  select(id: string): void {
    if (id !== this.activeViewId()) this.activeViewIdChange.emit(id);
  }

  openSave(): void {
    this.draftLabel.set('');
    this.saveOpen.set(true);
  }

  onDraftLabel(ev: Event): void {
    this.draftLabel.set((ev.target as HTMLInputElement).value);
  }

  confirmSave(): void {
    const label = this.draftLabel().trim();
    if (!label) return;
    this.save.emit(label);
    this.saveOpen.set(false);
  }
}
