import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
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
          <span>KLA Confidential · Need-to-know only</span>
          <span>Session: {{ username }} · v2.26.1.13100</span>
        </footer>
      </div>
    </div>
  `
})
export class ShellComponent {
  private readonly auth = inject(AuthService);

  get username(): string {
    return this.auth.user()?.username ?? 'unknown';
  }
}
