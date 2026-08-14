/** Shared focus/scroll behavior for `<base-modal>` and `<base-drawer>` — both interrupt, so
 *  both need the same three rules: focus enters and is trapped, focus returns to the opener on
 *  close, and the background is inert (scroll-locked; `aria-modal="true"` on the dialog itself
 *  already tells assistive tech everything outside it is inert to browse-mode navigation). */

export const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Tab/Shift+Tab wrap-around within `container` — call from a (keydown.tab) handler on the
 *  dialog root so keyboard focus never leaves an open dialog. */
export function trapTabKey(container: HTMLElement, ev: KeyboardEvent): void {
  const items = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  const active = document.activeElement;
  if (!ev.shiftKey && active === last) { ev.preventDefault(); first.focus(); }
  else if (ev.shiftKey && active === first) { ev.preventDefault(); last.focus(); }
}

/** Moves focus into `container` on open. [preferContainer] focuses `container` itself (give it
 *  `tabindex="-1"`) instead of the first control — for a destructive dialog, so the operator
 *  reads the heading before landing on Cancel/Delete rather than skipping straight past it. */
export function focusDialogOpen(container: HTMLElement, preferContainer: boolean): void {
  queueMicrotask(() => {
    if (preferContainer) { container.focus(); return; }
    const first = container.querySelector(FOCUSABLE_SELECTOR) as HTMLElement | null;
    (first ?? container).focus();
  });
}

let scrollLockCount = 0;
/** Body scroll-lock, reference-counted so one dialog opening another doesn't let the first
 *  dialog's close prematurely re-enable background scroll. */
export function lockBodyScroll(): void {
  if (scrollLockCount === 0) document.body.style.overflow = 'hidden';
  scrollLockCount++;
}

export function unlockBodyScroll(): void {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) document.body.style.overflow = '';
}
