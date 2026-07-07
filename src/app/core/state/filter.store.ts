import { Injectable, computed, signal } from '@angular/core';
import { GlobalFilters } from '../models/models';

/**
 * Global cross-module filters (fleet, date range, duration).
 * Any store can react to changes with an effect on `filters()`.
 */
@Injectable({ providedIn: 'root' })
export class FilterStore {
  private readonly _filters = signal<GlobalFilters>({
    fleet: 'INTEL_ARCHER800AIM',
    dateFrom: '2025/04/27',
    dateTo: '2026/04/25',
    duration: 'Last 52 Weeks'
  });

  private readonly _fleets = signal<string[]>([]);

  readonly filters = this._filters.asReadonly();
  readonly fleets = this._fleets.asReadonly();
  readonly fleet = computed(() => this._filters().fleet);
  readonly dateRangeLabel = computed(() => `${this._filters().dateFrom} – ${this._filters().dateTo}`);

  setFleet(fleet: string): void {
    this._filters.update(f => ({ ...f, fleet }));
  }

  setDuration(duration: GlobalFilters['duration']): void {
    this._filters.update(f => ({ ...f, duration }));
  }

  setDateRange(dateFrom: string, dateTo: string): void {
    this._filters.update(f => ({ ...f, dateFrom, dateTo }));
  }

  setFleets(fleets: string[]): void {
    this._fleets.set(fleets);
  }
}
