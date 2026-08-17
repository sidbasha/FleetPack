import { Type } from '@angular/core';

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
