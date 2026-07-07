import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from '../services/api.service';
import { createListFilter, createPagination, createQuery } from './base.store';

export type RecipeFilter = 'all' | 'with' | 'without';

/**
 * Alarm Explorer drill-down store:
 * home (all fleets) → fleet detail → tool alarms → alarm events.
 * Each level is an independent cached query; UI state (selection,
 * filters, paging) is composed from the shared primitives.
 */
@Injectable({ providedIn: 'root' })
export class AlarmStore {
  private api = inject(ApiService);

  // ── Server state (per-level cached queries) ──
  readonly homeQuery = createQuery(
    () => this.api.getAlarmHome(),
    { cacheTtlMs: 300_000 }
  );
  readonly fleetQuery = createQuery(
    (fleetId: string) => this.api.getFleetAlarmDetail(fleetId),
    { cacheTtlMs: 300_000 }
  );
  readonly toolQuery = createQuery(
    (fleetId: string, toolId: string) => this.api.getToolAlarms(fleetId, toolId),
    { cacheTtlMs: 300_000 }
  );
  readonly eventsQuery = createQuery(
    (fleetId: string, toolId: string, alarmId: string) => this.api.getAlarmEvents(fleetId, toolId, alarmId),
    { cacheTtlMs: 300_000 }
  );

  // Back-compat selectors
  readonly home = this.homeQuery.data;
  readonly homeLoading = this.homeQuery.loading;
  readonly fleetDetail = this.fleetQuery.data;
  readonly fleetLoading = this.fleetQuery.loading;
  readonly toolAlarms = this.toolQuery.data;
  readonly toolLoading = this.toolQuery.loading;
  readonly events = this.eventsQuery.data;
  readonly eventsLoading = this.eventsQuery.loading;
  readonly error = computed(() =>
    this.homeQuery.error() ?? this.fleetQuery.error() ?? this.toolQuery.error() ?? this.eventsQuery.error()
  );

  // ── UI state: inspected alarm side panel ──
  readonly inspectedAlarmId = signal<string | null>(null);
  readonly inspectedAlarm = computed(() =>
    this.toolAlarms()?.alarms.find(a => a.alarmId === this.inspectedAlarmId()) ?? null
  );

  // ── Derived: event filtering + paging ──
  private readonly allEvents = computed(() => this.events()?.events ?? []);
  private readonly recipeFilterCtl = createListFilter(this.allEvents, 'all' as RecipeFilter, (e, f) =>
    f === 'all' ? true : f === 'with' ? !!e.recipe : !e.recipe
  );
  readonly recipeFilter = this.recipeFilterCtl.criteria;
  readonly filteredEvents = this.recipeFilterCtl.filtered;
  readonly eventsPager = createPagination(this.filteredEvents, 20);
  readonly pagedEvents = this.eventsPager.paged;
  readonly eventPage = this.eventsPager.page;
  readonly eventPageCount = this.eventsPager.pageCount;

  // ── Actions ──
  loadHome(): void {
    this.homeQuery.load();
  }

  loadFleet(fleetId: string): void {
    this.fleetQuery.load(fleetId);
  }

  loadTool(fleetId: string, toolId: string): void {
    this.inspectedAlarmId.set(null);
    this.toolQuery.load(fleetId, toolId);
  }

  loadEvents(fleetId: string, toolId: string, alarmId: string): void {
    this.recipeFilterCtl.setCriteria('all');
    this.eventsPager.reset();
    this.eventsQuery.load(fleetId, toolId, alarmId);
  }

  setRecipeFilter(f: RecipeFilter): void {
    this.recipeFilterCtl.setCriteria(f);
    this.eventsPager.reset();
  }

  nextEventPage(): void { this.eventsPager.next(); }
  prevEventPage(): void { this.eventsPager.prev(); }
}
