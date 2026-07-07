import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem { label: string; path: string; icon: string; }
interface NavGroup { heading: string; items: NavItem[]; }

@Component({
  selector: 'fam-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-60 shrink-0 h-screen sticky top-0 bg-nexus-950 text-slate-300 flex flex-col">
      <!-- Brand -->
      <a routerLink="/" class="flex items-center gap-2.5 px-4 h-14 border-b border-white/10">
        <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 grid place-items-center text-white font-extrabold text-sm">F</span>
        <span class="leading-tight">
          <span class="block text-sm font-bold text-white tracking-wide">FleetPack</span>
          <span class="block text-[10px] text-slate-400">KLA Corporation</span>
        </span>
      </a>

      <nav class="flex-1 overflow-y-auto px-2.5 py-4 space-y-5">
        <div>
          <a routerLink="/" class="nav-link" routerLinkActive="nav-active" [routerLinkActiveOptions]="{exact:true}">
            <span class="nav-ico">▦</span> Dashboard
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
        <a class="nav-link !px-0 cursor-pointer"><span class="nav-ico">⚙</span> Settings</a>
        <p class="mt-2 text-[9px] leading-relaxed text-slate-500">
          © 2026 KLA Corporation. All Rights Reserved.<br />v2.26.1.13100
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
  groups: NavGroup[] = [
    {
      heading: 'Modules · Fleet Availability',
      items: [
        { label: 'Up+Time Analysis', path: '/fleet-availability/up-time/analysis', icon: '↗' },
        { label: 'Up+Time Availability', path: '/fleet-availability/up-time/availability', icon: '▤' },
        { label: 'Alarm Explorer', path: '/alarm-explorer', icon: '🔔' },
        { label: 'Fleet Configuration', path: '/fleet-configuration', icon: '⚒' },
        { label: 'Fleet Productivity', path: '/fleet-productivity', icon: '▲' }
      ]
    },
    {
      heading: 'Workspace',
      items: [
        { label: 'TQual', path: '/tqual', icon: '✓' },
        { label: 'My Reports', path: '/my-reports', icon: '▧' },
        { label: 'Innovation Lab', path: '/innovation-lab', icon: '✦' },
        { label: 'Engineering Utilities', path: '/engineering-utilities', icon: '⌘' }
      ]
    }
  ];
}
