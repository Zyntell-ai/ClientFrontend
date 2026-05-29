/**
 * @file        main.jsx
 * @module      Application Entry Point
 * @project     ClientFrontend
 * @layer       Config
 * @description Application bootstrap — mounts React root with QueryClient and StrictMode providers.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - react
 *   - react-dom/client
 *   - @tanstack/react-query (QueryClient, QueryClientProvider)
 *   - ./App.jsx
 *   - ./index.css
 *
 * @sideEffects
 *   - Mounts the React application into the DOM element with id "root"
 *   - Configures global React Query defaults (retry, staleTime, refetchOnWindowFocus)
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

/**
 * @constant    queryClient
 * @purpose     Global React Query client with conservative defaults to reduce unnecessary refetches
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

// [UI]: Mount root — wraps app in StrictMode for development warnings and QueryClientProvider for data fetching
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
