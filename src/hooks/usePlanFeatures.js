/**
 * @file        usePlanFeatures.js
 * @module      Hooks / Plan Features
 * @description The authenticated business's plan and feature access from GET /api/billing/plan — the single
 *              runtime source for plan features in the frontend. Every consumer (FeatureGate, Sidebar, Dashboard,
 *              BusinessDetail, BillingPage) shares one React Query cache entry, so the endpoint is requested once
 *              per business and refreshed when BillingPage invalidates ['billing-plan'] after a verified payment.
 */
import { useQuery } from '@tanstack/react-query'
import { billingApi } from '../api/billing.api'
import { useAuthStore } from '../store/authStore'
import { isFeatureAvailable, isFeatureDisabledByOverride, planThatUnlocks } from '../utils/planFeatures'

/**
 * @function    useBillingPlan
 * @purpose     Shared query for /api/billing/plan, keyed per business so a different login never sees cached data
 */
export function useBillingPlan() {
  const { token, business } = useAuthStore()
  return useQuery({
    queryKey: ['billing-plan', business?.id],
    queryFn:  billingApi.plan,
    select:   r => r.data,
    enabled:  Boolean(token && business?.id),
  })
}

/**
 * @function    usePlanFeatures
 * @returns {{ status: 'loading'|'error'|'ready', planData: Object|undefined,
 *             hasFeature: (key: string) => boolean, planThatUnlocks: (key: string) => string|null,
 *             isDisabledByOverride: (key: string) => boolean }}
 *          hasFeature is false until the plan has loaded (fails closed).
 */
export function usePlanFeatures() {
  const { data: planData, isError } = useBillingPlan()
  return {
    status:               planData ? 'ready' : isError ? 'error' : 'loading',
    planData,
    hasFeature:           (key) => isFeatureAvailable(planData, key),
    planThatUnlocks:      (key) => planThatUnlocks(planData, key),
    isDisabledByOverride: (key) => isFeatureDisabledByOverride(planData, key),
  }
}
