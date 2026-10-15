import { useEffect } from 'react'
import { setUnsavedChangesMessage } from '../utils/unsavedChanges'

/**
 * @function    useUnsavedChangesWarning
 * @purpose     While `when` is true: the browser warns on refresh/close (beforeunload), and the sidebar asks before
 *              navigating to another page (utils/unsavedChanges).
 * @param  {boolean} when    - the page has unsaved changes
 * @param  {string}  message - shown by the sidebar's confirmation dialog
 */
export function useUnsavedChangesWarning(when, message = 'You have unsaved changes. Leave this page and discard them?') {
  useEffect(() => {
    if (!when) return undefined
    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = '' // required by some browsers to show the native prompt
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    setUnsavedChangesMessage(message)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      setUnsavedChangesMessage(null)
    }
  }, [when, message])
}
