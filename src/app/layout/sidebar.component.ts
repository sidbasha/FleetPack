import { ChangeDetectionStrategy, Component, input, model, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_BRAND, APP_ROUTES, NAV_GROUPS, NavGroup, SIDEBAR_TEXT } from '../core/constants/app.constants';

/** The application shell is a fixed dark surface in every theme — an exception to the semantic
 *  layer, matching the shipped product; everything inside it re-themes normally. The rail
 *  collapses to 60px below 1024px, or on demand via the footer toggle. Collapsed items keep a
 *  native `title` so the label is still reachable — an icon alone is not a name. A disabled item
 *  stays visible rather than disappearing, so the operator learns the shape of the product even
 *  where their role has no access.
 *
 *  Pure presentation over `[groups]`/`[brand]`/`[routes]`/`[sidebar]`, all defaulted from
 *  `app.constants.ts` — real usage (`<fam-sidebar />`) needs no inputs at all; only Storybook
 *  overrides them to demo the badge/disabled/nested-children states side by side. */
@Component({
  selector: 'fam-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="shrink-0 h-screen sticky top-0 bg-surface-inverse text-neutral-300 flex flex-col transition-all"
           style="transition-duration: var(--mo-slow);"
           [class]="collapsed() ? 'w-[60px]' : 'w-[60px] lg:w-60'">
      <a [routerLink]="routes().home" class="flex items-center gap-2.5 px-4 h-14 border-b border-white/10 shrink-0" [attr.title]="brand().name">
        <span class="w-8 h-8 rounded-r-sm bg-brand grid place-items-center text-neutral-0 font-extrabold text-sm shrink-0">
          {{ brand().mark }}
        </span>
        <span class="leading-tight" [class]="labelVisibility()">
          <span class="block text-sm font-bold text-neutral-0 tracking-wide whitespace-nowrap">{{ brand().name }}</span>
          <span class="block text-[10px] text-neutral-400 whitespace-nowrap">{{ brand().company }}</span>
        </span>
      </a>

      <nav class="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4 space-y-5">
        <div>
          <a [routerLink]="routes().home" class="nav-link" routerLinkActive="nav-active" [routerLinkActiveOptions]="{exact:true}"
             [attr.title]="sidebar().dashboardLabel">
            <span class="nav-ico">{{ sidebar().dashboardIcon }}</span>
            <span [class]="labelVisibility()">{{ sidebar().dashboardLabel }}</span>
          </a>
        </div>

        @for (group of groups(); track group.heading) {
          <div>
            <p class="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 whitespace-nowrap overflow-hidden"
               [class]="labelVisibility()">{{ group.heading }}</p>
            <ul class="space-y-0.5">
              @for (item of group.items; track item.label) {
                <li>
                  @if (item.children?.length) {
                    <button type="button" class="nav-link w-full" [attr.title]="item.label" (click)="toggleExpanded(item.label)">
                      <span class="nav-ico">{{ item.icon }}</span>
                      <span class="flex-1 text-left whitespace-nowrap" [class]="labelVisibility()">{{ item.label }}</span>
                      <span class="text-[9px] transition-transform shrink-0" [class]="labelVisibility()"
                            [style.transform]="isExpanded(item.label) ? 'rotate(180deg)' : 'rotate(0deg)'" aria-hidden="true">▾</span>
                    </button>
                    @if (isExpanded(item.label) && !collapsed()) {
                      <ul class="mt-0.5 ml-[26px] space-y-0.5 border-l border-white/10 pl-2.5">
                        @for (child of item.children; track child.path) {
                          <li>
                            <a [routerLink]="child.path" routerLinkActive="nav-active" class="nav-link text-[12px]" [attr.title]="child.label">
                              {{ child.label }}
                            </a>
                          </li>
                        }
                      </ul>
                    }
                  } @else if (item.disabled) {
                    <span class="nav-link nav-disabled" [attr.title]="item.label + ' — no access with your current role'">
                      <span class="nav-ico">⊘</span>
                      <span class="flex-1 whitespace-nowrap" [class]="labelVisibility()">{{ item.label }}</span>
                    </span>
                  } @else {
                    <a [routerLink]="item.path" routerLinkActive="nav-active" class="nav-link" [attr.title]="item.label">
                      <span class="nav-ico">{{ item.icon }}</span>
                      <span class="flex-1 whitespace-nowrap" [class]="labelVisibility()">{{ item.label }}</span>
                      @if (item.badge !== undefined) {
                        <span class="nav-badge" [class]="labelVisibility()">{{ item.badge }}</span>
                      }
                    </a>
                  }
                </li>
              }
            </ul>
          </div>
        }
      </nav>

      <div class="px-2.5 py-3 border-t border-white/10 shrink-0">
        <a class="nav-link cursor-pointer" [attr.title]="sidebar().settingsLabel">
          <span class="nav-ico">{{ sidebar().settingsIcon }}</span>
          <span [class]="labelVisibility()">{{ sidebar().settingsLabel }}</span>
        </a>
        <button type="button" class="nav-link w-full" [attr.title]="collapsed() ? 'Expand' : 'Collapse'" (click)="collapsed.set(!collapsed())">
          <span class="nav-ico">{{ collapsed() ? '▶' : '◀' }}</span>
          <span [class]="labelVisibility()">{{ collapsed() ? 'Expand' : 'Collapse' }}</span>
        </button>
        <p class="mt-2 text-[9px] leading-relaxed text-neutral-400 whitespace-nowrap overflow-hidden" [class]="labelVisibility()">
          {{ brand().copyright }}<br />{{ brand().version }}
        </p>
      </div>
    </aside>
  `,
  styles: [`
    .nav-link {
      display: flex; align-items: center; gap: 0.625rem;
      padding: 0.5rem 0.625rem; border-radius: var(--radius-r-sm);
      font-size: 13px; font-weight: 500; color: var(--color-neutral-300);
      transition: color var(--mo-base) ease, background-color var(--mo-base) ease;
    }
    .nav-link:hover { background: rgba(255, 255, 255, .06); color: var(--color-neutral-0); }
    .nav-active, .nav-active:hover { background: var(--color-action); color: var(--color-neutral-0); }
    .nav-ico { width: 1rem; text-align: center; font-size: 12px; opacity: .85; flex-shrink: 0; }
    .nav-disabled { opacity: .4; cursor: not-allowed; }
    .nav-disabled:hover { background: transparent; color: var(--color-neutral-300); }
    .nav-badge {
      flex-shrink: 0; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px;
      background: var(--color-error); color: var(--color-neutral-0);
      font-size: 10px; font-weight: 700; line-height: 18px; text-align: center;
    }
  `]
})
export class SidebarComponent {
  readonly brand = input(APP_BRAND);
  readonly groups = input<NavGroup[]>(NAV_GROUPS);
  readonly routes = input(APP_ROUTES);
  readonly sidebar = input(SIDEBAR_TEXT);

  readonly collapsed = model(false);
  private readonly expandedGroups = signal(new Set<string>());

  toggleExpanded(label: string): void {
    this.expandedGroups.update(set => {
      const next = new Set(set);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  isExpanded(label: string): boolean {
    return this.expandedGroups().has(label);
  }

  labelVisibility(): string {
    return this.collapsed() ? 'hidden' : 'hidden lg:block';
  }
}
