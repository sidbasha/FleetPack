import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { AuthService, AuthUser } from '../core/auth/auth.service';
import { APP_ROUTES, AUTH_CONFIG, FILTER_OPTIONS, TOPBAR_TEXT } from '../core/constants/app.constants';
import { ApiService } from '../core/services/api.service';
import { GlobalFilters } from '../core/models/models';
import { FilterStore } from '../core/state/filter.store';
import {
  BaseBreadcrumbsComponent,
  BaseDensity,
  BaseDensityService,
  BaseSelectComponent,
  BaseSelectOption,
  BaseThemePreference,
  BaseThemeService
} from '../base';

@Component({
  selector: 'fam-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseSelectComponent, BaseBreadcrumbsComponent],
  template: `
    <header class="h-14 sticky top-0 z-20 bg-neutral-0/90 backdrop-blur-sm border-b border-neutral-200 flex items-center gap-4 px-5">
      <base-breadcrumbs class="min-w-0" [items]="crumbItems()" [separator]="text.breadcrumbSeparator" />

      <div class="flex-1"></div>

      <div class="hidden lg:flex items-center gap-2">
        <span class="flex flex-col items-end leading-tight mr-1">
          <label class="text-[9px] font-bold uppercase tracking-wide text-neutral-400">{{ text.dateRangeLabel }}</label>
          <span class="text-[11px] font-medium text-ink-600">{{ store.dateRangeLabel() }}</span>
        </span>

        <label class="text-[10px] font-bold uppercase tracking-wide text-neutral-400 ml-2">{{ text.fleetLabel }}</label>
        <base-select class="w-36" [options]="fleetOptions()" [value]="store.fleet()"
                     (valueChange)="onFleetPick($event)" />

        <label class="text-[10px] font-bold uppercase tracking-wide text-neutral-400 ml-2">{{ text.durationLabel }}</label>
        <base-select class="w-32" [options]="durationOptions" [value]="store.filters().duration"
                     (valueChange)="onDurationPick($event)" />
      </div>

      <div class="relative flex items-center gap-3 pl-3 border-l border-neutral-200">
        <button class="text-xs font-bold text-neutral-400 hover:text-action" title="{{ text.notificationsTitle }}">
          {{ text.notificationsShortLabel }}
        </button>
        <button class="text-xs font-bold text-neutral-400 hover:text-action" title="{{ text.messagesTitle }}">
          {{ text.messagesShortLabel }}
        </button>
        <button
          type="button"
          class="w-8 h-8 rounded-r-full bg-action-surface text-action-hover grid place-items-center text-[11px] font-bold hover:bg-action/20 transition-colors"
          title="{{ user().username }}"
          (click)="toggleUserPopup($event)"
        >{{ user().initials }}</button>

        @if (showUserPopup()) {
          <div class="absolute right-0 top-full mt-2 w-64 bg-neutral-0 rounded-r-lg border border-neutral-200 p-4 z-30" style="box-shadow: var(--shadow-e3);" (click)="$event.stopPropagation()">
            <div class="flex items-center gap-3 pb-3 border-b border-neutral-100">
              <span class="w-10 h-10 rounded-r-full bg-action-surface text-action-hover grid place-items-center text-sm font-bold">{{ user().initials }}</span>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-ink-700 truncate">{{ user().name }}</p>
                <p class="text-[11px] text-neutral-400 truncate">{{ user().role }}</p>
              </div>
            </div>
            <dl class="pt-3 space-y-1.5 text-xs">
              <div class="flex justify-between gap-2">
                <dt class="text-neutral-400">{{ text.usernameLabel }}</dt>
                <dd class="text-ink-700 font-medium truncate">{{ user().username }}</dd>
              </div>
              <div class="flex justify-between gap-2">
                <dt class="text-neutral-400">{{ text.emailLabel }}</dt>
                <dd class="text-ink-700 font-medium truncate">{{ user().email }}</dd>
              </div>
              <div class="flex justify-between gap-2">
                <dt class="text-neutral-400">{{ text.fleetLabel }}</dt>
                <dd class="text-ink-700 font-medium truncate">{{ store.fleet() }}</dd>
              </div>
            </dl>

            <!-- Density & theme switchers — see Foundations → Density & Themes. Every token on
                 every page re-points live off these two; nothing here is a separate stylesheet. -->
            <div class="pt-3 mt-3 border-t border-neutral-100 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <label class="text-[11px] font-semibold text-ink-600">Density</label>
                <base-select class="w-32" [options]="densityOptions" [value]="density.current()"
                             (valueChange)="onDensityPick($event)" />
              </div>
              <div class="flex items-center justify-between gap-2">
                <label class="text-[11px] font-semibold text-ink-600">Theme</label>
                <base-select class="w-32" [options]="themeOptions" [value]="theme.preference()"
                             (valueChange)="onThemePick($event)" />
              </div>
            </div>
            <button
              type="button"
              class="mt-4 w-full rounded-r-sm border border-neutral-200 px-3 py-2 text-xs font-semibold text-ink-700 hover:border-error/40 hover:bg-error-surface hover:text-error transition-colors"
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

  readonly density = inject(BaseDensityService);
  readonly theme = inject(BaseThemeService);
  readonly densityOptions: BaseSelectOption<BaseDensity>[] = [
    { label: 'Compact', value: 'compact' },
    { label: 'Standard', value: 'standard' },
    { label: 'Comfortable', value: 'comfortable' }
  ];
  readonly themeOptions: BaseSelectOption<BaseThemePreference>[] = [
    { label: 'Auto', value: 'auto' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'High contrast', value: 'high-contrast' }
  ];

  onDensityPick(v: BaseDensity | null): void {
    if (v) this.density.set(v);
  }

  onThemePick(v: BaseThemePreference | null): void {
    if (v) this.theme.set(v);
  }

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

  readonly durationOptions: BaseSelectOption<string>[] = FILTER_OPTIONS.durations.map(d => ({ label: d, value: d }));

  readonly crumbItems = computed(() => this.breadcrumbs().map(label => ({ label })));

  readonly fleetOptions = computed<BaseSelectOption<string>[]>(() =>
    this.store.fleets().map(f => ({ label: f, value: f }))
  );

  onFleetPick(v: string | null): void {
    if (v) this.store.setFleet(v);
  }

  onDurationPick(v: string | null): void {
    if (v) this.store.setDuration(v as GlobalFilters['duration']);
  }

  onFleet(e: Event): void {
    this.store.setFleet((e.target as HTMLSelectElement).value);
  }

  onDuration(e: Event): void {
    this.store.setDuration((e.target as HTMLSelectElement).value as GlobalFilters['duration']);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate([APP_ROUTES.home]);
  }
}
