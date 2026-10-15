// Lightweight "unsaved changes" guard for in-app navigation. The app uses <BrowserRouter> (React Router 6.28),
// which has no navigation blocker, so a page with unsaved edits registers a message here and the sidebar asks
// before navigating away. Browser refresh/close is covered separately by the page's beforeunload listener.

let pendingMessage = null

/** Register (string) or clear (null) the unsaved-changes message of the page currently being edited */
export function setUnsavedChangesMessage(message) {
  pendingMessage = message || null
}

/** @returns {boolean} whether a page currently has unsaved changes */
export function hasUnsavedChanges() {
  return pendingMessage !== null
}

/**
 * Ask before leaving a page with unsaved changes.
 * @param  {(message: string) => boolean} [confirmFn] - defaults to window.confirm
 * @returns {boolean} true when navigation may continue
 */
export function confirmLeaveWithUnsavedChanges(confirmFn = (m) => window.confirm(m)) {
  if (!pendingMessage) return true
  const leave = confirmFn(pendingMessage)
  if (leave) pendingMessage = null
  return leave
}
