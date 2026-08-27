import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Shared drag-to-zoom domain model used by every large-dataset-capable base chart
 * (trend, bar, scatter, histogram, gantt timeline). A zoom window is expressed as
 * fractions [0, 1] over the *full* data domain so it is agnostic to whatever the
 * underlying unit is (index, hours, epoch ms, …).
 */
export interface ChartZoomWindow {
  readonly start: number;
  readonly end: number;
}

export const FULL_ZOOM_WINDOW: ChartZoomWindow = { start: 0, end: 1 };

/** Below this span a further drag-narrow is ignored — keeps a zoom from collapsing to nothing. */
const MIN_ZOOM_SPAN = 0.01;

export function isZoomedWindow(w: ChartZoomWindow): boolean {
  return w.start > 1e-6 || w.end < 1 - 1e-6;
}

export function clampZoomWindow(start: number, end: number): ChartZoomWindow {
  let s = Math.max(0, Math.min(1, Math.min(start, end)));
  let e = Math.max(0, Math.min(1, Math.max(start, end)));
  if (e - s < MIN_ZOOM_SPAN) {
    if (s + MIN_ZOOM_SPAN <= 1) e = s + MIN_ZOOM_SPAN;
    else s = e - MIN_ZOOM_SPAN;
  }
  return { start: s, end: e };
}

/**
 * Narrow the current window by a drag selection expressed as fractions of the
 * *currently visible* span (i.e. both are in [0, 1] relative to what's on screen
 * right now), producing a new absolute window over the full domain.
 */
export function narrowZoomWindow(current: ChartZoomWindow, dragStartFrac: number, dragEndFrac: number): ChartZoomWindow {
  const span = current.end - current.start;
  const start = current.start + Math.min(dragStartFrac, dragEndFrac) * span;
  const end = current.start + Math.max(dragStartFrac, dragEndFrac) * span;
  return clampZoomWindow(start, end);
}

export function windowToIndices(length: number, w: ChartZoomWindow): { startIndex: number; endIndex: number } {
  if (length <= 0) return { startIndex: 0, endIndex: 0 };
  const startIndex = Math.max(0, Math.min(length - 1, Math.floor(w.start * length)));
  const endIndex = Math.max(startIndex + 1, Math.min(length, Math.ceil(w.end * length)));
  return { startIndex, endIndex };
}

/** Slice an array down to what's visible in a zoom window (index-domain charts). */
export function sliceWindow<T>(items: readonly T[], w: ChartZoomWindow): T[] {
  const { startIndex, endIndex } = windowToIndices(items.length, w);
  return items.slice(startIndex, endIndex);
}

/**
 * Immutably toggle membership of `item` in a Set-based multi-select filter — every
 * click-to-isolate filter in the base charts allows selecting more than one item at
 * once, so "isolate" means "show only the selected set" rather than "show only one".
 * Always returns a new Set (signals need a new reference to detect the change).
 */
export function toggleInSet<T>(set: ReadonlySet<T>, item: T): Set<T> {
  const next = new Set(set);
  if (next.has(item)) next.delete(item); else next.add(item);
  return next;
}

/** Fraction (0..1, clamped) of clientX/clientY across a DOMRect — the basis for all drag math. */
export function fracX(clientX: number, rect: DOMRect): number {
  return Math.max(0, Math.min(1, rect.width ? (clientX - rect.left) / rect.width : 0));
}
export function fracY(clientY: number, rect: DOMRect): number {
  return Math.max(0, Math.min(1, rect.height ? (clientY - rect.top) / rect.height : 0));
}

/**
 * "Reset Zoom" / "Reset Filter" link row — mirrors the reference design's persistent
 * top/bottom control bar. Muted (non-interactive-looking) when there is nothing to reset.
 */
@Component({
  selector: 'base-chart-zoom-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between text-[11px] font-semibold select-none">
      @if (showFilter()) {
        <button type="button" class="chart-zoom-link" [disabled]="!filtered()" (click)="resetFilter.emit()">
          Reset Filter
        </button>
      } @else { <span></span> }
      <button type="button" class="chart-zoom-link" [disabled]="!zoomed()" (click)="resetZoom.emit()">
        Reset Zoom
      </button>
    </div>
  `,
  styles: [`
    .chart-zoom-link {
      color: var(--color-action);
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      font: inherit;
    }
    .chart-zoom-link:hover:not(:disabled) { text-decoration: underline; }
    .chart-zoom-link:disabled {
      color: var(--color-ink-500, #94a3b8);
      opacity: 0.6;
      cursor: default;
    }
  `]
})
export class BaseChartZoomBarComponent {
  readonly zoomed = input(false);
  readonly filtered = input(false);
  readonly showFilter = input(false);
  readonly resetZoom = output<void>();
  readonly resetFilter = output<void>();
}
