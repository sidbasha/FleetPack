import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'fam-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <main class="min-h-screen bg-slate-100 grid lg:grid-cols-[minmax(0,1fr)_460px]">
      <section class="hidden lg:flex relative overflow-hidden bg-slate-950 text-white">
        <div class="absolute inset-0 opacity-70">
          <div class="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,.35),transparent_28%),linear-gradient(135deg,#0e1230_0%,#111827_48%,#164e63_100%)]"></div>
        </div>
        <div class="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-lg bg-white text-nexus-950 grid place-items-center font-extrabold">F</span>
            <div>
              <p class="text-sm font-bold tracking-wide">FleetPack FAM</p>
            </div>
          </div>

          <div class="max-w-2xl my-auto">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Secure operations workspace</p>
            <h1 class="mt-4 text-4xl xl:text-5xl font-bold leading-tight">Sign in to monitor fleet health and uptime.</h1>
            <p class="mt-5 text-sm xl:text-base leading-7 text-slate-300">
              Access live availability views, alarm drill-downs, fleet filters, and engineering reports from one authenticated session.
            </p>
          </div>

        </div>
      </section>

      <section class="flex items-center justify-center px-5 py-10">
        <div class="w-full max-w-sm">
          <div class="lg:hidden mb-8 flex items-center gap-3">
            <span class="w-10 h-10 rounded-lg bg-nexus-950 text-white grid place-items-center font-extrabold">F</span>
            <div>
              <p class="text-sm font-bold text-slate-900">FleetPack FAM</p>
              <p class="text-xs text-slate-500">Fleet Availability Module</p>
            </div>
          </div>

          <div class="panel p-6">
            <div>
              <h2 class="text-xl font-bold text-slate-900">Login</h2>
              <p class="mt-1 text-sm text-slate-500">Use the dummy credentials below to enter the dashboard.</p>
            </div>

            <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
              <label class="block">
                <span class="block text-xs font-semibold text-slate-600 mb-1.5">Username</span>
                <input
                  class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-hidden focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  type="text"
                  autocomplete="username"
                  formControlName="username"
                />
              </label>

              <label class="block">
                <span class="block text-xs font-semibold text-slate-600 mb-1.5">Password</span>
                <input
                  class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-hidden focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  type="password"
                  autocomplete="current-password"
                  formControlName="password"
                />
              </label>

              @if (error()) {
                <p class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {{ error() }}
                </p>
              }

              <button
                class="w-full rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                type="submit"
                [disabled]="form.invalid"
              >
                Sign in
              </button>
            </form>

            <div class="mt-5 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
              <p class="font-semibold text-slate-700">Dummy login</p>
              <p class="mt-1">Username: <span class="font-mono">system-admin</span></p>
              <p>Password: <span class="font-mono">admin123</span></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  `
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly error = signal('');
  readonly form = this.fb.group({
    username: ['system-admin', Validators.required],
    password: ['admin123', Validators.required]
  });

  constructor() {
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/');
    }
  }

  submit(): void {
    this.error.set('');

    const { username, password } = this.form.getRawValue();
    if (!this.auth.login(username, password)) {
      this.error.set('Invalid username or password.');
      return;
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    void this.router.navigateByUrl(returnUrl);
  }
}
