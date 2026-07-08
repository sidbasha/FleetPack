import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { APP_BRAND, AUTH_CONFIG } from '../core/constants/app.constants';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';

@Component({
  selector: 'fam-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="flex min-h-screen">
      <fam-sidebar />
      <div class="flex-1 min-w-0 flex flex-col">
        <fam-topbar />
        <main class="flex-1 p-5 space-y-5">
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
