import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { APP_BRAND, AUTH_CONFIG } from '../core/constants/app.constants';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';

@Component({
  selector: 'fam-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <a href="#main-content"
       class="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:top-2 focus:left-2 focus:bg-action
              focus:text-neutral-0 focus:px-4 focus:py-2 focus:rounded-r-sm focus:text-xs focus:font-semibold
              focus:outline-none focus:ring-2 focus:ring-neutral-0 focus:ring-offset-2 focus:ring-offset-action">
      Skip to main content
    </a>
    <div class="flex min-h-screen">
      <fam-sidebar />
      <div class="flex-1 min-w-0 flex flex-col">
        <fam-topbar />
        <main id="main-content" tabindex="-1" class="flex-1 p-5 space-y-5 outline-none">
          <router-outlet />
        </main>
        <footer class="px-5 py-3 text-[10px] text-slate-400 border-t border-slate-200 flex justify-between">
          <span>{{ brand.confidentiality }}</span>
          <span>{{ sessionLabel }}</span>
        </footer>
      </div>
    </div>
  `
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  readonly brand = APP_BRAND;

  get username(): string {
    return this.auth.user()?.username ?? AUTH_CONFIG.fallbackUsername;
  }

  get sessionLabel(): string {
    return `${this.brand.sessionPrefix}: ${this.username} · ${this.brand.version}`;
  }
}
