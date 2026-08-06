import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_BRAND, APP_ROUTES, NAV_GROUPS, SIDEBAR_TEXT } from '../core/constants/app.constants';

@Component({
  selector: 'fam-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-60 shrink-0 h-screen sticky top-0 bg-surface-inverse text-neutral-300 flex flex-col">
      <a [routerLink]="routes.home" class="flex items-center gap-2.5 px-4 h-14 border-b border-white/10">
        <span class="w-8 h-8 rounded-r-sm bg-brand grid place-items-center text-neutral-0 font-extrabold text-sm">
          {{ brand.mark }}
        </span>
        <span class="leading-tight">
          <span class="block text-sm font-bold text-neutral-0 tracking-wide">{{ brand.name }}</span>
          <span class="block text-[10px] text-neutral-400">{{ brand.company }}</span>
        </span>
      </a>

      <nav class="flex-1 overflow-y-auto px-2.5 py-4 space-y-5">
        <div>
          <a [routerLink]="routes.home" class="nav-link" routerLinkActive="nav-active" [routerLinkActiveOptions]="{exact:true}">
            <span class="nav-ico">{{ sidebar.dashboardIcon }}</span> {{ sidebar.dashboardLabel }}
          </a>
        </div>

        @for (group of groups; track group.heading) {
          <div>
            <p class="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{{ group.heading }}</p>
            <ul class="space-y-0.5">
              @for (item of group.items; track item.path) {
                <li>
                  <a [routerLink]="item.path" routerLinkActive="nav-active" class="nav-link">
                    <span class="nav-ico">{{ item.icon }}</span> {{ item.label }}
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      </nav>

      <div class="px-4 py-3 border-t border-white/10">
        <a class="nav-link !px-0 cursor-pointer">
          <span class="nav-ico">{{ sidebar.settingsIcon }}</span> {{ sidebar.settingsLabel }}
        </a>
        <p class="mt-2 text-[9px] leading-relaxed text-neutral-400">
          {{ brand.copyright }}<br />{{ brand.version }}
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
    .nav-ico { width: 1rem; text-align: center; font-size: 12px; opacity: .85; }
  `]
})
export class SidebarComponent {
  readonly brand = APP_BRAND;
  readonly groups = NAV_GROUPS;
  readonly routes = APP_ROUTES;
  readonly sidebar = SIDEBAR_TEXT;
}
