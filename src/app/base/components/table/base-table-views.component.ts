import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { BaseTableView } from '../../models/table.model';

/**
 * Saved-views tab rail for `<base-table>`. Fully controlled and framework-thin by design,
 * matching every other table sub-component here: the host owns the view list, which one is
 * active, and — critically — what "modified" means. `<base-table-views>` never inspects a
 * view's `state`; the host diffs its own live filter/sort/column snapshot against the active
 * view's saved one and passes the boolean in. This component only renders the rail and emits
 * intent (save/update/reset/copy link/switch) — nothing here persists anything.
 *
 * Two rows: an underline tab strip (so it reads as navigation, not a bank of buttons competing
 * visually with the filter chips below it) plus a "+ Save view" trigger that's always available,
 * and — for whichever view is active — a detail bar naming it, showing the Modified badge, and
 * offering Copy link always, Update/Reset only while modified.
 *
 * "All" (`isDefault: true`) always renders first and is never editable. Up to [maxPinned]
 * further views pin next to it; everything else collapses into a "More views" menu. Both limits
 * are enforced visually only (disabling "+ Save view" / hiding the pin affordance past the cap)
 * — the host's store is the real source of truth for what's actually allowed.
 *
 * Unstyled edge-to-edge: no outer border/radius/background of its own — every row is full-bleed
 * with only a bottom hairline to separate it. That's deliberate so the host can drop this directly
 * above a `<base-table>` inside one shared `.panel` wrapper (`<div class="panel overflow-hidden">`)
 * and have the tab rail, detail bar, filter chips, and table body read as a single joined card with
 * no gap — see `WithSavedViewsRail` in `table.stories.ts` for the reference pairing.
 */
@Component({
  selector: 'base-table-views',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col">
      <div class="flex items-center gap-4 flex-wrap px-4 pt-2 border-b border-neutral-100">
        @for (v of pinnedViews(); track v.id) {
          <button type="button"
                  class="inline-flex items-center gap-1.5 pb-2 pt-1 text-[13px] font-semibold border-b-2 -mb-px transition-colors"
                  [class]="v.id === activeViewId() ? 'text-action border-action' : 'text-ink-600 border-transparent hover:text-ink-900'"
                  (click)="select(v.id)">
            {{ v.label }}
            @if (v.count !== undefined) {
              <span class="text-[10px] font-bold tabular-nums rounded-full px-1.5 py-0.5"
                    [class]="v.id === activeViewId() ? 'bg-action-surface text-action' : 'bg-neutral-100 text-neutral-400'">{{ v.count }}</span>
            }
            @if (v.shared) { <span class="icon-outline text-neutral-300" style="font-size:12px;" aria-hidden="true">group</span> }
            @if (v.readOnly) { <span class="icon-outline text-neutral-300" style="font-size:12px;" aria-hidden="true">lock</span> }
          </button>
        }

        @if (overflowViews().length > 0) {
          <span class="relative inline-block pb-2 -mb-px">
            <button type="button" class="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-500 hover:text-ink-900"
                    (click)="moreOpen.set(!moreOpen())">More views ({{ overflowViews().length }}) <span class="text-[9px]">▾</span></button>
            @if (moreOpen()) {
              <div class="absolute z-20 top-full left-0 mt-1 w-52 bg-neutral-0 border border-neutral-200 rounded-r-lg shadow-lg py-1 max-h-64 overflow-y-auto">
                @for (v of overflowViews(); track v.id) {
                  <button type="button" class="w-full text-left px-3 py-1.5 text-[11px] flex items-center gap-1.5"
                          [class]="v.id === activeViewId() ? 'text-action font-semibold bg-action-surface/50' : 'text-ink-600 hover:bg-neutral-50'"
                          (click)="select(v.id); moreOpen.set(false)">
                    <span class="flex-1">{{ v.label }}</span>
                    @if (v.count !== undefined) { <span class="text-neutral-300 tabular-nums">{{ v.count }}</span> }
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

        @if (!saveOpen()) {
          <button type="button" class="inline-flex items-center gap-1 pb-2 -mb-px text-[13px] font-semibold text-neutral-400 hover:text-action transition-colors"
                  [disabled]="!canSaveNew()" [class.opacity-40]="!canSaveNew()" [attr.title]="canSaveNew() ? '' : maxViews() + ' saved views max'"
                  (click)="openSave()">
            <span class="icon-outline" style="font-size:15px;" aria-hidden="true">add</span> Save view
          </button>
        } @else {
          <span class="inline-flex items-center gap-1 pb-1.5">
            <input type="text" [value]="draftLabel()" (input)="onDraftLabel($event)" placeholder="View name" autofocus
                   class="w-32 border border-neutral-200 rounded-r-sm px-2 py-1 text-[11px]
                          focus:outline-none focus:ring-1 focus:ring-action-surface" />
            <button type="button" class="btn-primary py-1! px-2.5! text-[11px]" [disabled]="!draftLabel().trim()" (click)="confirmSave()">Save</button>
            <button type="button" class="text-neutral-300 hover:text-neutral-500 text-xs" aria-label="Cancel" (click)="saveOpen.set(false)">✕</button>
          </span>
        }
      </div>

      @if (activeView(); as v) {
        <div class="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-neutral-100 bg-neutral-0">
          <span class="flex items-center gap-2 min-w-0">
            <span class="icon-outline text-neutral-400 shrink-0" style="font-size:16px;" aria-hidden="true">bookmark</span>
            <b class="text-[13px] text-ink-900 truncate">{{ v.label }}</b>
            @if (modified()) {
              <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-warning-surface text-warning-hover rounded-full px-2.5 py-1 shrink-0">
                <span aria-hidden="true">●</span> Modified
              </span>
            }
          </span>
          <span class="flex items-center gap-2 shrink-0">
            <button type="button"
                    class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-600 border border-neutral-200 rounded-r-sm px-2.5 py-1.5
                           hover:border-action hover:text-action transition-colors"
                    (click)="copyLink.emit()">
              <span class="icon-outline" style="font-size:14px;" aria-hidden="true">link</span> Copy link
            </button>
            @if (modified() && canModifyActive()) {
              <button type="button" class="text-[11px] font-semibold text-ink-600 border border-neutral-200 rounded-r-sm px-2.5 py-1.5
                                            hover:border-action hover:text-action transition-colors"
                      (click)="reset.emit()">Reset</button>
              <button type="button" class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-0 bg-action hover:bg-action-hover
                                            rounded-r-sm px-3 py-1.5 transition-colors"
                      (click)="update.emit()">
                <span aria-hidden="true">✓</span> Update view
              </button>
            }
          </span>
        </div>
      }
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
  protected readonly activeView = computed(() => this.views().find(v => v.id === this.activeViewId()) ?? null);

  protected readonly canModifyActive = computed(() => {
    const v = this.activeView();
    return !!v && !v.isDefault && !v.readOnly;
  });
  protected readonly canSaveNew = computed(() => this.views().length < this.maxViews());

  select(id: string): void {
    if (id !== this.activeViewId()) this.activeViewIdChange.emit(id);
  }

  openSave(): void {
    if (!this.canSaveNew()) return;
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
