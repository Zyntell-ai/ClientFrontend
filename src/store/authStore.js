// src/store/authStore.js
// Global auth state — token + business profile persisted to localStorage

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      business: null,
      isAuthenticated: false,

      setAuth: (token, business) => set({ token, business, isAuthenticated: true }),

      updateBusiness: (updates) =>
        set((state) => ({
          business: state.business ? { ...state.business, ...updates } : updates,
        })),

      logout: () => {
        set({ token: null, business: null, isAuthenticated: false })
        localStorage.removeItem('zyntell-auth')
      },

      // Convenience getters
      getCategory: () => get().business?.category,
      isOnboarded: () => get().business?.setupCompleted === true,
      isTrialActive: () => get().business?.isTrialActive === true,
      getPlan: () => get().business?.plan || 'trial',
    }),
    {
      name: 'zyntell-auth',
      partialize: (state) => ({ token: state.token, business: state.business, isAuthenticated: state.isAuthenticated }),
    }
  )
)
