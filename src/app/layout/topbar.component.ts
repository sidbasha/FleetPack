import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { AuthService, AuthUser } from '../core/auth/auth.service';
import { APP_ROUTES, AUTH_CONFIG, FILTER_OPTIONS, TOPBAR_TEXT } from '../core/constants/app.constants';
import { ApiService } from '../core/services/api.service';
import { GlobalFilters } from '../core/models/models';
import { FilterStore } from '../core/state/filter.store';

@Component({
  selector: 'fam-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="h-14 sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-200 flex items-center gap-4 px-5">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400 min-w-0">
        @for (crumb of breadcrumbs(); track $index; let last = $last) {
          <span [class]="last ? 'font-semibold text-slate-800 truncate' : 'truncate'">{{ crumb }}</span>
          @if (!last) { <span class="text-slate-300">{{ text.breadcrumbSeparator }}</span> }
        }
      </nav>

      <div class="flex-1"></div>

      <div class="hidden lg:flex items-center gap-2">
        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400">{{ text.fleetLabel }}</label>
        <select class="filter-select" [value]="store.fleet()" (change)="onFleet($event)">
          @for (f of store.fleets(); track f) { <option [value]="f">{{ f }}</option> }
        </select>

        <label class="text-[10px] font-bold uppercase tracking-wide text-slate-400 ml-2">{{ text.durationLabel }}</label>
        <select class="filter-select" [value]="store.filters().duration" (change)="onDuration($event)">
          @for (d of durations; track d) { <option [value]="d">{{ d }}</option> }
        </select>

        <span class="ml-2 text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5">
          {{ store.dateRangeLabel() }}
        </span>
      </div>

      <div class="relative flex items-center gap-3 pl-3 border-l border-slate-200">
        <button class="text-xs font-bold text-slate-400 hover:text-indigo-600" title="{{ text.notificationsTitle }}">
          {{ text.notificationsShortLabel }}
        </button>
        <button class="text-xs font-bold text-slate-400 hover:text-indigo-600" title="{{ text.messagesTitle }}">
          {{ text.messagesShortLabel }}
        </button>
        <button
          type="button"
          class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center text-[11px] font-bold hover:bg-indigo-200"
          title="{{ user().username }}"
          (click)="toggleUserPopup($event)"
        >{{ user().initials }}</button>

        @if (showUserPopup()) {
          <div class="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-30" (click)="$event.stopPropagation()">
            <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
              <span class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center text-sm font-bold">{{ user().initials }}</span>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-800 truncate">{{ user().name }}</p>
                <p class="text-[11px] text-slate-400 truncate">{{ user().role }}</p>
              </div>
            </div>
            <dl class="pt-3 space-y-1.5 text-xs">
              <div class="flex justify-between gap-2">
                <dt class="text-slate-400">{{ text.usernameLabel }}</dt>
                <dd class="text-slate-700 font-medium truncate">{{ user().username }}</dd>
              </div>
              <div class="flex justify-between gap-2">
                <dt class="text-slate-400">{{ text.emailLabel }}</dt>
                <dd class="text-slate-700 font-medium truncate">{{ user().email }}</dd>
              </div>
              <div class="flex justify-between gap-2">
                <dt class="text-slate-400">{{ text.fleetLabel }}</dt>
                <dd class="text-slate-700 font-medium truncate">{{ store.fleet() }}</dd>
              </div>
            </dl>
            <button
              type="button"
              class="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors"
              (click)="logout()"
            >
              {{ text.signOutLabel }}
            </button>
          </div>
        }
      </div>
    </header>
  `
})
export class TopbarComponent implements OnInit {
  readonly store = inject(FilterStore);
  readonly text = TOPBAR_TEXT;
  readonly durations: GlobalFilters['duration'][] = [...FILTER_OPTIONS.durations];
  readonly showUserPopup = signal(false);

  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly el = inject(ElementRef);
  private readonly router = inject(Router);

  readonly user = computed<AuthUser>(() => this.auth.user() ?? AUTH_CONFIG.fallbackUser);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly breadcrumbs = computed(() => {
    const segs = this.url().split('?')[0].split('/').filter(Boolean);
    const pretty = (s: string) =>
      decodeURIComponent(s)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .replace('Up Time', this.text.breadcrumbReplacements.upTime)
        .replace('Tqual', this.text.breadcrumbReplacements.tqual);

    return [this.text.rootBreadcrumb, ...segs.map(pretty)];
  });

  ngOnInit(): void {
    this.api.getFleets().subscribe(fleets => this.store.setFleets(fleets));
  }

  toggleUserPopup(e: Event): void {
    e.stopPropagation();
    this.showUserPopup.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event): void {
    if (this.showUserPopup() && !this.el.nativeElement.contains(e.target)) {
      this.showUserPopup.set(false);
    }
  }

  onFleet(e: Event): void {
    this.store.setFleet((e.target as HTMLSelectElement).value);
  }

  onDuration(e: Event): void {
    this.store.setDuration((e.target as HTMLSelectElement).value as GlobalFilters['duration']);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate([APP_ROUTES.login]);
  }
}
