import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FilterStore } from './filter.store';
import { createPagination, createQuery } from './base.store';

/**
 * Up-Time module store (Analysis + Availability screens),
 * built on the generic query/pagination primitives.
 * Queries cache per-fleet for 5 minutes and auto-refetch
 * when the global fleet filter changes.
 */
@Injectable({ providedIn: 'root' })
export class UptimeStore {
  private api = inject(ApiService);
  private filterStore = inject(FilterStore);

  // ── Server state ──
  readonly analysisQuery = createQuery(
    (fleet: string) => this.api.getUptimeAnalysis(fleet),
    { cacheTtlMs: 300_000 }
  );
  readonly availabilityQuery = createQuery(
    (fleet: string) => this.api.getAvailability(fleet),
    { cacheTtlMs: 300_000 }
  );

  // Back-compat selectors used by components
  readonly analysis = this.analysisQuery.data;
  readonly analysisLoading = this.analysisQuery.loading;
  readonly availability = this.availabilityQuery.data;
  readonly availabilityLoading = this.availabilityQuery.loading;
  readonly error = computed(() => this.analysisQuery.error() ?? this.availabilityQuery.error());

  // ── UI state ──
  readonly selectedTool = signal<string>('Axion_T2500');

  // ── Derived: event paging ──
  private readonly allEvents = computed(() => this.availability()?.events ?? []);
  readonly eventsPager = createPagination(this.allEvents, 20);
  readonly pagedEvents = this.eventsPager.paged;
  readonly eventPage = this.eventsPager.page;
  readonly eventPageCount = this.eventsPager.pageCount;

  constructor() {
    // Refetch active queries when the global fleet filter changes.
    effect(() => {
      const fleet = this.filterStore.fleet();
      untracked(() => {
        if (this.analysisQuery.status() !== 'idle') this.analysisQuery.load(fleet);
        if (this.availabilityQuery.status() !== 'idle') {
          this.availabilityQuery.load(fleet);
          this.eventsPager.reset();
        }
      });
    });
  }

  loadAnalysis(fleet = this.filterStore.fleet()): void {
    this.analysisQuery.load(fleet);
  }

  loadAvailability(fleet = this.filterStore.fleet()): void {
    this.availabilityQuery.load(fleet);
    this.eventsPager.reset();
  }

  nextEventPage(): void { this.eventsPager.next(); }
  prevEventPage(): void { this.eventsPager.prev(); }
}
