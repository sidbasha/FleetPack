import { Injectable } from '@angular/core';

export interface BaseDraftRow {
  /** String form of the row's track-key (`String(rowTrack(row))`). */
  key: string;
  /** Column key → pending value, only the fields that were actually touched. */
  changes: Record<string, unknown>;
  /** Column key → the server value each field was edited *from*, captured when the draft was parked — the baseline conflict detection compares against on restore. */
  baseline: Record<string, unknown>;
}

export interface BaseDraft {
  savedAt: number;
  rows: BaseDraftRow[];
}

const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const PREFIX = 'base-table-draft:';

/**
 * "Keep draft" storage for `BaseTableComponent`'s unsaved-changes flow —
 * see the Base README's "Where a draft lives" section. One device, one
 * browser, one user: keyed by a caller-supplied table id (`[draftId]`) so
 * multiple tables don't collide, never synced or shared, expires after 7
 * days and is swept on construction (effectively app startup).
 *
 * Degrades to an in-memory Map — this tab, this load, gone on refresh —
 * if `localStorage` throws (private browsing, blocked storage, quota);
 * every write/read is guarded so a blocked store never breaks editing,
 * it just can't survive a reload.
 */
@Injectable({ providedIn: 'root' })
export class BaseEditDraftService {
  private readonly memoryFallback = new Map<string, BaseDraft>();
  private storageBlocked = false;

  constructor() {
    this.sweepExpired();
  }

  private storageKey(tableId: string): string {
    return `${PREFIX}${tableId}`;
  }

  private storage(): Storage | null {
    if (this.storageBlocked) return null;
    try {
      const probe = '__base_draft_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return localStorage;
    } catch {
      this.storageBlocked = true;
      return null;
    }
  }

  save(tableId: string, draft: BaseDraft): void {
    const storage = this.storage();
    if (!storage) {
      this.memoryFallback.set(tableId, draft);
      return;
    }
    try {
      storage.setItem(this.storageKey(tableId), JSON.stringify(draft));
    } catch {
      this.memoryFallback.set(tableId, draft);
    }
  }

  load(tableId: string): BaseDraft | null {
    const storage = this.storage();
    if (!storage) return this.memoryFallback.get(tableId) ?? null;
    try {
      const raw = storage.getItem(this.storageKey(tableId));
      if (!raw) return null;
      const draft = JSON.parse(raw) as BaseDraft;
      if (Date.now() - draft.savedAt > EXPIRY_MS) {
        storage.removeItem(this.storageKey(tableId));
        return null;
      }
      return draft;
    } catch {
      return null;
    }
  }

  clear(tableId: string): void {
    this.memoryFallback.delete(tableId);
    const storage = this.storage();
    if (!storage) return;
    try {
      storage.removeItem(this.storageKey(tableId));
    } catch {
      /* ignore */
    }
  }

  /** Removes every expired draft under our prefix, across all tables — called once, on service construction. */
  private sweepExpired(): void {
    try {
      const now = Date.now();
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (!k?.startsWith(PREFIX)) continue;
        try {
          const draft = JSON.parse(localStorage.getItem(k) ?? 'null') as BaseDraft | null;
          if (!draft || now - draft.savedAt > EXPIRY_MS) localStorage.removeItem(k);
        } catch {
          localStorage.removeItem(k);
        }
      }
    } catch {
      /* storage unavailable entirely — nothing to sweep */
    }
  }
}
