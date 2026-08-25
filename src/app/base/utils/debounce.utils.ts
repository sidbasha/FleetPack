export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): ((...args: A) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: A): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { timer = null; fn(...args); }, ms);
  };
  debounced.cancel = (): void => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return debounced;
}

export class ActionGuard {
  private lastRunAt = 0;

  allow(ms: number): boolean {
    if (ms <= 0) return true;
    const now = Date.now();
    if (now - this.lastRunAt < ms) return false;
    this.lastRunAt = now;
    return true;
  }

  reset(): void {
    this.lastRunAt = 0;
  }
}
