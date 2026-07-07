import { Type } from '@angular/core';

/**
 * Name → component registry. Lets feature modules render components
 * dynamically by string name (e.g. from server-driven page configs)
 * without importing the class at the call site.
 *
 * Usage:
 *   registerWidget('state-heatmap', StateHeatmapComponent);
 *   … later, in a ComponentWidget config: { type: 'component', name: 'state-heatmap' }
 */
const REGISTRY = new Map<string, Type<unknown>>();

export function registerWidget(name: string, component: Type<unknown>): void {
  if (REGISTRY.has(name)) {
    console.warn(`[widget-registry] '${name}' re-registered — overwriting.`);
  }
  REGISTRY.set(name, component);
}

export function resolveWidget(name: string): Type<unknown> | null {
  const cmp = REGISTRY.get(name) ?? null;
  if (!cmp) console.error(`[widget-registry] no widget registered as '${name}'.`);
  return cmp;
}

export function registeredWidgets(): string[] {
  return [...REGISTRY.keys()];
}
