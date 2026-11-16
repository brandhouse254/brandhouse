"use client";

import { useEffect, useId } from "react";

/**
 * Screens with unsaved edits register here, so automatic refreshes and app
 * updates wait instead of throwing away someone's work.
 */
const open = new Set<string>();

export const hasUnsavedChanges = () => open.size > 0;

export function useUnsavedFlag(dirty: boolean) {
  const id = useId();
  useEffect(() => {
    if (dirty) open.add(id);
    else open.delete(id);
    return () => {
      open.delete(id);
    };
  }, [dirty, id]);
}

/** Someone is typing, has a dialog open, or has unsaved changes: don't refresh under them. */
export function userIsBusy(): boolean {
  if (hasUnsavedChanges()) return true;
  if (typeof document === "undefined") return false;
  const el = document.activeElement as HTMLElement | null;
  if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return true;
  return Boolean(document.querySelector('[role="dialog"][aria-modal="true"]'));
}
