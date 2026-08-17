import { Injectable, effect, signal } from '@angular/core';

export type BaseDensity = 'compact' | 'standard' | 'comfortable';

const STORAGE_KEY = 'base-density';

function readStored(): BaseDensity {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'compact' || v === 'standard' || v === 'comfortable') return v;
  } catch {
  }
  return 'standard';
}

/**
 * App-wide default table density, set from a density switcher in the shell's utility bar (see
 * Foundations → Density & Themes). `<base-table>` falls back to this when its own `[density]`
 * input is left unset — a module that needs a specific density regardless of the global
 * preference (e.g. an alarm log that's always compact) still can, by binding `[density]` explicitly.
 */
@Injectable({ providedIn: 'root' })
export class BaseDensityService {
  readonly current = signal<BaseDensity>(readStored());

  constructor() {
    effect(() => {
      const d = this.current();
      document.documentElement.setAttribute('data-density', d);
      try { localStorage.setItem(STORAGE_KEY, d); } catch { }
    });
  }

  set(density: BaseDensity): void {
    this.current.set(density);
  }
}
