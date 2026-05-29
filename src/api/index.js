/**
 * @file        index.js
 * @module      API Barrel Export
 * @project     ClientFrontend
 * @layer       API
 * @description Barrel re-export for all API modules — provides a single import point for the entire API layer.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./auth.api
 *   - ./categories.api
 *   - ./onboarding.api
 *   - ./business.api
 *   - ./bookings.api
 *   - ./numbers.api
 *   - ./customers.api
 *   - ./commissions.api
 *   - ./billing.api
 *   - ./analytics.api
 *   - ./leads.api
 *
 * @sideEffects
 *   - None
 */

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
export { authApi } from './auth.api'
export { categoriesApi } from './categories.api'
export { onboardingApi } from './onboarding.api'
export { businessApi } from './business.api'
export { bookingsApi } from './bookings.api'
export { numbersApi } from './numbers.api'
export { customersApi } from './customers.api'
export { commissionsApi } from './commissions.api'
export { billingApi } from './billing.api'
export { analyticsApi } from './analytics.api'
export { leadsApi } from './leads.api'
