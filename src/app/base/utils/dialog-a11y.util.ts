
export const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function trapTabKey(container: HTMLElement, ev: KeyboardEvent): void {
  const items = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  const active = document.activeElement;
  if (!ev.shiftKey && active === last) { ev.preventDefault(); first.focus(); }
  else if (ev.shiftKey && active === first) { ev.preventDefault(); last.focus(); }
}

export function focusDialogOpen(container: HTMLElement, preferContainer: boolean): void {
  queueMicrotask(() => {
    if (preferContainer) { container.focus(); return; }
    const first = container.querySelector(FOCUSABLE_SELECTOR) as HTMLElement | null;
    (first ?? container).focus();
  });
}

let scrollLockCount = 0;
export function lockBodyScroll(): void {
  if (scrollLockCount === 0) document.body.style.overflow = 'hidden';
  scrollLockCount++;
}

export function unlockBodyScroll(): void {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) document.body.style.overflow = '';
}
