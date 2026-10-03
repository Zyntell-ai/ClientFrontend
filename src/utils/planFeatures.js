/**
 * @file        planFeatures.js
 * @module      Utils / Plan Features
 * @description Feature access for UI gating, computed ONLY from the backend's GET /api/billing/plan response.
 *              Mirrors FinalBackend utils/featureGate.js isFeatureEnabled(): an admin override for the key wins,
 *              otherwise the current plan's feature value, coerced to boolean. The trial is simply the 'trial'
 *              plan, exactly as on the backend.
 *
 *              This is a UI/UX gate only — backend isFeatureEnabled() checks remain authoritative.
 *              Fails closed: with no plan data (loading, error, logged out) every feature is unavailable.
 */

/**
 * @function    isFeatureAvailable
 * @param  {Object|undefined} planData   - /api/billing/plan response body
 * @param  {string}           featureKey - Backend feature key (e.g. 'aiVoiceAgent')
 * @returns {boolean}
 */
export function isFeatureAvailable(planData, featureKey) {
  const features = planData?.planConfig?.features
  if (!features) return false
  const overrides = planData.featureOverrides || {}
  // [BUSINESS RULE]: Admin overrides always take precedence over plan defaults (same as the backend)
  if (Object.prototype.hasOwnProperty.call(overrides, featureKey)) return Boolean(overrides[featureKey])
  return Boolean(features[featureKey])
}

/**
 * @function    isFeatureDisabledByOverride
 * @returns {boolean} true when an admin override explicitly turns the feature off for this business
 */
export function isFeatureDisabledByOverride(planData, featureKey) {
  const overrides = planData?.featureOverrides || {}
  return Object.prototype.hasOwnProperty.call(overrides, featureKey) && !overrides[featureKey]
}

/**
 * @function    planThatUnlocks
 * @purpose     Name of the lowest higher plan (from the backend's `upgrades`, lowest tier first) that includes the feature
 * @returns {string|null} plan name, or null when no upgrade includes it (or plan data is not loaded)
 */
export function planThatUnlocks(planData, featureKey) {
  const upgrade = (planData?.upgrades || []).find(u => Boolean(u?.features?.[featureKey]))
  return upgrade?.name || null
}
