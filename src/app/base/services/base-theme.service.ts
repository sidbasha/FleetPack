import { Injectable, effect, signal } from '@angular/core';

/** 'auto' leaves `[data-theme]` unset, so `@media (prefers-contrast: more)` in styles.css can
 *  still resolve High contrast from the OS signal — see Foundations → Density & Themes. Picking
 *  any of the other three is an explicit, persisted choice that always wins over that signal. */
export type BaseThemePreference = 'auto' | 'light' | 'dark' | 'high-contrast';

const STORAGE_KEY = 'base-theme';

function readStored(): BaseThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'auto' || v === 'light' || v === 'dark' || v === 'high-contrast') return v;
  } catch {
    // localStorage unavailable (private browsing, etc.) — fall through to the default.
  }
  return 'auto';
}

/**
 * Applies the user's theme choice as `<html data-theme="…">`, which every semantic token in
 * `styles.css` re-points from — there is no per-component theming logic, and there shouldn't be;
 * a component only ever reads `var(--color-action)` etc. Persisted per user via localStorage,
 * per the "opt-in, persisted per user" requirement called out for Dark specifically.
 */
@Injectable({ providedIn: 'root' })
export class BaseThemeService {
  readonly preference = signal<BaseThemePreference>(readStored());

  constructor() {
    effect(() => {
      const pref = this.preference();
      if (pref === 'auto') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', pref);
      try { localStorage.setItem(STORAGE_KEY, pref); } catch { /* best-effort persistence only */ }
    });
  }

  set(pref: BaseThemePreference): void {
    this.preference.set(pref);
  }
}
