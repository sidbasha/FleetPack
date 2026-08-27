import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FilterStore } from './filter.store';
import { createPagination, createQuery } from './base.store';
import { deriveEvents, deriveGantt, deriveGanttSummary, deriveSegmentTimeline } from './segment-derivation.util';

const FULL_RANGE_START = '1970-01-01T00:00:00.000Z';
const FULL_RANGE_END = '2999-01-01T00:00:00.000Z';

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

  readonly analysisQuery = createQuery(
    (fleet: string) => this.api.getUptimeAnalysis(fleet),
    { cacheTtlMs: 300_000 }
  );
  readonly trendQuery = createQuery(
    (fleet: string) => this.api.getUptimeTrend(fleet),
    { cacheTtlMs: 300_000 }
  );
  readonly availabilityQuery = createQuery(
    (fleet: string) => this.api.getAvailability(fleet),
    { cacheTtlMs: 300_000 }
  );
  readonly segmentsQuery = createQuery(
    (toolId: string) => this.api.getStateSegments(toolId),
    { cacheTtlMs: 300_000 }
  );
  readonly segmentActivitiesQuery = createQuery(
    (toolId: string, pageNumber: number) =>
      this.api.getSegmentActivities(toolId, FULL_RANGE_START, FULL_RANGE_END, pageNumber),
    { cacheTtlMs: 300_000 }
  );

  readonly analysis = this.analysisQuery.data;
  readonly analysisLoading = this.analysisQuery.loading;
  readonly trend = this.trendQuery.data;
  readonly trendLoading = this.trendQuery.loading;
  readonly availability = this.availabilityQuery.data;
  readonly availabilityLoading = this.availabilityQuery.loading;
  readonly segmentsLoading = this.segmentsQuery.loading;
  readonly segmentActivitiesLoading = this.segmentActivitiesQuery.loading;
  readonly error = computed(() =>
    this.analysisQuery.error() ?? this.trendQuery.error() ?? this.availabilityQuery.error()
    ?? this.segmentsQuery.error() ?? this.segmentActivitiesQuery.error()
  );

  readonly selectedTool = signal<string>('Axion_T2500');

  readonly stateSegments = computed(() => this.segmentsQuery.data()?.stateSegments ?? []);
  readonly segmentActivities = computed(() => this.segmentActivitiesQuery.data()?.result ?? []);
  readonly gantt = computed(() => deriveGantt(this.stateSegments(), this.segmentActivities()));
  readonly ganttSummary = computed(() => deriveGanttSummary(this.gantt()));
  readonly events = computed(() => deriveEvents(this.stateSegments(), this.segmentActivities()));
  readonly segmentTimeline = computed(() => deriveSegmentTimeline(this.segmentActivities()));

  readonly eventsPager = createPagination(this.events, 20);
  readonly pagedEvents = this.eventsPager.paged;
  readonly eventPage = this.eventsPager.page;
  readonly eventPageCount = this.eventsPager.pageCount;

  readonly segmentActivitiesPager = createPagination(this.segmentActivities, 20);
  readonly pagedSegmentActivities = this.segmentActivitiesPager.paged;
  readonly segmentActivitiesPage = this.segmentActivitiesPager.page;
  readonly segmentActivitiesPageCount = this.segmentActivitiesPager.pageCount;

  constructor() {
    effect(() => {
      const fleet = this.filterStore.fleet();
      untracked(() => {
        if (this.analysisQuery.status() !== 'idle') this.analysisQuery.load(fleet);
        if (this.trendQuery.status() !== 'idle') this.trendQuery.load(fleet);
        if (this.availabilityQuery.status() !== 'idle') this.availabilityQuery.load(fleet);
      });
    });

    effect(() => {
      const toolId = this.selectedTool();
      untracked(() => {
        if (this.segmentsQuery.status() !== 'idle') this.segmentsQuery.load(toolId);
        if (this.segmentActivitiesQuery.status() !== 'idle') this.segmentActivitiesQuery.load(toolId, 0);
        if (this.segmentsQuery.status() !== 'idle' || this.segmentActivitiesQuery.status() !== 'idle') {
          this.eventsPager.reset();
          this.segmentActivitiesPager.reset();
        }
      });
    });
  }

  loadAnalysis(fleet = this.filterStore.fleet()): void {
    this.analysisQuery.load(fleet);
    this.trendQuery.load(fleet);
  }

  loadAvailability(fleet = this.filterStore.fleet()): void {
    this.availabilityQuery.load(fleet);
    this.segmentsQuery.load(this.selectedTool());
    this.segmentActivitiesQuery.load(this.selectedTool(), 0);
    this.eventsPager.reset();
    this.segmentActivitiesPager.reset();
  }

  nextEventPage(): void { this.eventsPager.next(); }
  prevEventPage(): void { this.eventsPager.prev(); }

  nextSegmentActivitiesPage(): void { this.segmentActivitiesPager.next(); }
  prevSegmentActivitiesPage(): void { this.segmentActivitiesPager.prev(); }
}
