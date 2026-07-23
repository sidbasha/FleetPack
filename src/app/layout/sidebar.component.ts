import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_BRAND, APP_ROUTES, NAV_GROUPS, SIDEBAR_TEXT } from '../core/constants/app.constants';

@Component({
  selector: 'fam-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-60 shrink-0 h-screen sticky top-0 bg-nexus-950 text-slate-300 flex flex-col">
      <a [routerLink]="routes.home" class="flex items-center gap-2.5 px-4 h-14 border-b border-white/10">
        <span class="w-8 h-8 rounded-lg bg-emerald-600 grid place-items-center text-white font-extrabold text-sm">
          {{ brand.mark }}
        </span>
        <span class="leading-tight">
          <span class="block text-sm font-bold text-white tracking-wide">{{ brand.name }}</span>
          <span class="block text-[10px] text-slate-400">{{ brand.company }}</span>
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
            <p class="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ group.heading }}</p>
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
        <p class="mt-2 text-[9px] leading-relaxed text-slate-500">
          {{ brand.copyright }}<br />{{ brand.version }}
        </p>
      </div>
    </aside>
  `,
  styles: [`
    .nav-link {
      display: flex; align-items: center; gap: 0.625rem;
      padding: 0.5rem 0.625rem; border-radius: 0.5rem;
      font-size: 13px; font-weight: 500; color: #cbd5e1;
      transition: color .15s ease, background-color .15s ease;
    }
    .nav-link:hover { background: rgba(255, 255, 255, .05); color: #ffffff; }
    .nav-active, .nav-active:hover { background: rgba(79, 70, 229, .9); color: #ffffff; }
    .nav-ico { width: 1rem; text-align: center; font-size: 12px; opacity: .8; }
  `]
})
export class SidebarComponent {
  readonly brand = APP_BRAND;
  readonly groups = NAV_GROUPS;
  readonly routes = APP_ROUTES;
  readonly sidebar = SIDEBAR_TEXT;
}
