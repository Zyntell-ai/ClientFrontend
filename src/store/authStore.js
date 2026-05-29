/**
 * @file        authStore.js
 * @module      Auth Store
 * @project     ClientFrontend
 * @layer       Store
 * @description Global authentication state — token, business profile, and derived helpers persisted to localStorage via Zustand.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - zustand (create)
 *   - zustand/middleware (persist)
 *
 * @sideEffects
 *   - Reads and writes "zyntell-auth" key in localStorage via Zustand persist middleware
 *   - Explicitly removes "zyntell-auth" from localStorage on logout
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

/**
 * @function    useAuthStore
 * @purpose     Zustand store providing global auth state — token, business profile, and actions for setting, updating, and clearing auth
 * @returns {object} Auth state and action methods: token, business, isAuthenticated, setAuth, updateBusiness, logout, getCategory, isOnboarded, isTrialActive, getPlan
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ─────────────────────────────────────────
      // STATE & HOOKS
      // ─────────────────────────────────────────

      // [AUTH]: Core authentication state
      token: null,
      business: null,
      isAuthenticated: false,

      // ─────────────────────────────────────────
      // CORE LOGIC / HANDLER FUNCTIONS
      // ─────────────────────────────────────────

      /**
       * @function    setAuth
       * @purpose     Persist token and business profile after successful login or signup
       * @param  {string} token    - JWT access token
       * @param  {object} business - Authenticated business profile object
       */
      // [AUTH]: Set token and business on successful login
      setAuth: (token, business) => set({ token, business, isAuthenticated: true }),

      /**
       * @function    updateBusiness
       * @purpose     Merge partial business updates into the existing business profile
       * @param  {object} updates - Partial business fields to merge
       */
      // [STATE]: Merge partial business updates without replacing the full object
      updateBusiness: (updates) =>
        set((state) => ({
          business: state.business ? { ...state.business, ...updates } : updates,
        })),

      /**
       * @function    logout
       * @purpose     Clear all auth state and remove persisted localStorage entry
       */
      // [AUTH]: Clear session state and wipe persisted storage on logout
      logout: () => {
        set({ token: null, business: null, isAuthenticated: false })
        localStorage.removeItem('zyntell-auth')
      },

      // ─────────────────────────────────────────
      // CONSTANTS & CONFIG
      // ─────────────────────────────────────────

      /**
       * @function    getCategory
       * @purpose     Return the current business category string
       * @returns {string|undefined}
       */
      // [DATA TRANSFORM]: Convenience getter for business category
      getCategory: () => get().business?.category,

      /**
       * @function    isOnboarded
       * @purpose     Return whether the business has completed setup
       * @returns {boolean}
       */
      // [GUARD]: Convenience check for setup completion
      isOnboarded: () => get().business?.setupCompleted === true,

      /**
       * @function    isTrialActive
       * @purpose     Return whether the business is currently on an active trial
       * @returns {boolean}
       */
      // [AUTH]: Convenience check for active trial status
      isTrialActive: () => get().business?.isTrialActive === true,

      /**
       * @function    getPlan
       * @purpose     Return the current subscription plan key, defaulting to "trial"
       * @returns {string}
       */
      // [AUTH]: Return current plan or default to "trial"
      getPlan: () => get().business?.plan || 'trial',
    }),
    {
      // [STATE]: Persist only the essential auth fields — token, business, isAuthenticated
      name: 'zyntell-auth',
      partialize: (state) => ({ token: state.token, business: state.business, isAuthenticated: state.isAuthenticated }),
    }
  )
)
