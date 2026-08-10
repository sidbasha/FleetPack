import { Signal, computed, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

/**
 * Store foundation for all current & future FAM modules:
 *   createQuery(fetcher, opts)   — async server state (status, TTL cache,
 *                                  in-flight dedupe, cancellation, refresh)
 *   createPagination(source)     — client-side paging over any Signal<T[]>
 *   createListFilter(source, fn) — reactive predicate filtering
 *
 * A feature store is just composition:
 *   @Injectable({ providedIn: 'root' })
 *   export class MyModuleStore {
 *     private api = inject(ApiService);
 *     readonly detailQuery = createQuery((id: string) => this.api.getDetail(id), { cacheTtlMs: 300_000 });
 *     readonly rows = computed(() => this.detailQuery.data()?.rows ?? []);
 *     readonly pager = createPagination(this.rows, 20);
 *   }
 */

export type QueryStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface QueryOptions {
  /** Serve cached data for identical params within this window. 0 = no cache. */
  cacheTtlMs?: number;
  /** Keep showing stale data while a new request is loading. */
  keepPreviousData?: boolean;
}

export interface Query<T, P extends unknown[] = []> {
  data: Signal<T | null>;
  status: Signal<QueryStatus>;
  loading: Signal<boolean>;
  loaded: Signal<boolean>;
  error: Signal<string | null>;
  lastParams: Signal<P | null>;
  /** Load with params — served from cache when fresh. */
  load: (...params: P) => void;
  /** Re-run the last load, bypassing the cache. */
  refresh: () => void;
  /** Reset to idle and drop the cache. */
  clear: () => void;
}

export function createQuery<T, P extends unknown[] = []>(
  fetcher: (...params: P) => Observable<T>,
  opts: QueryOptions = {}
): Query<T, P> {
  const data = signal<T | null>(null);
  const status = signal<QueryStatus>('idle');
  const error = signal<string | null>(null);
  const lastParams = signal<P | null>(null);

  const cache = new Map<string, { value: T; at: number }>();
  const ttl = opts.cacheTtlMs ?? 0;
  let sub: Subscription | null = null;
  let inflightKey: string | null = null;

  const run = (params: P, bypassCache: boolean): void => {
    const key = JSON.stringify(params);
    lastParams.set(params);

    if (!bypassCache && ttl > 0) {
      const hit = cache.get(key);
      if (hit && Date.now() - hit.at < ttl) {
        data.set(hit.value);
        status.set('loaded');
        error.set(null);
        return;
      }
    }

    // De-dupe: identical request already in flight.
    if (inflightKey === key && status() === 'loading') return;

    sub?.unsubscribe(); // cancel superseded request
    inflightKey = key;
    if (!opts.keepPreviousData) data.set(null);
    status.set('loading');
    error.set(null);

    sub = fetcher(...params).subscribe({
      next: value => {
        cache.set(key, { value, at: Date.now() });
        data.set(value);
        status.set('loaded');
        inflightKey = null;
      },
      error: err => {
        error.set(String((err as { message?: string })?.message ?? err));
        status.set('error');
        inflightKey = null;
      }
    });
  };

  return {
    data: data.asReadonly(),
    status: status.asReadonly(),
    loading: computed(() => status() === 'loading'),
    loaded: computed(() => status() === 'loaded'),
    error: error.asReadonly(),
    lastParams: lastParams.asReadonly(),
    load: (...params: P) => run(params, false),
    refresh: () => {
      const p = lastParams();
      if (p) run(p, true);
    },
    clear: () => {
      sub?.unsubscribe();
      cache.clear();
      inflightKey = null;
      data.set(null);
      status.set('idle');
      error.set(null);
      lastParams.set(null);
    }
  };
}

export interface Pagination<T> {
  page: Signal<number>;
  pageSize: Signal<number>;
  total: Signal<number>;
  pageCount: Signal<number>;
  paged: Signal<T[]>;
  next: () => void;
  prev: () => void;
  goTo: (page: number) => void;
  reset: () => void;
  setPageSize: (size: number) => void;
}

export function createPagination<T>(source: Signal<T[]>, initialPageSize = 20): Pagination<T> {
  const page = signal(1);
  const pageSize = signal(initialPageSize);
  const total = computed(() => source().length);
  const pageCount = computed(() => Math.max(1, Math.ceil(total() / pageSize())));
  const paged = computed(() => {
    const p = Math.min(page(), pageCount());
    const start = (p - 1) * pageSize();
    return source().slice(start, start + pageSize());
  });

  return {
    page: page.asReadonly(),
    pageSize: pageSize.asReadonly(),
    total,
    pageCount,
    paged,
    next: () => page.update(p => Math.min(pageCount(), p + 1)),
    prev: () => page.update(p => Math.max(1, p - 1)),
    goTo: (p: number) => page.set(Math.min(Math.max(1, p), pageCount())),
    reset: () => page.set(1),
    setPageSize: (n: number) => {
      pageSize.set(n);
      page.set(1);
    }
  };
}

export interface ListFilter<T, F> {
  criteria: Signal<F>;
  filtered: Signal<T[]>;
  setCriteria: (f: F) => void;
}

export function createListFilter<T, F>(
  source: Signal<T[]>,
  initial: F,
  predicate: (item: T, criteria: F) => boolean
): ListFilter<T, F> {
  const criteria = signal<F>(initial);
  const filtered = computed(() => source().filter(item => predicate(item, criteria())));
  return {
    criteria: criteria.asReadonly(),
    filtered,
    setCriteria: (f: F) => criteria.set(f)
  };
}
