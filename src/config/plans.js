/**
 * @file        plans.js
 * @module      Plan Configuration
 * @project     ClientFrontend
 * @layer       Config
 * @description Single source of truth for all Zyntell subscription plan definitions.
 *
 * NOTE: This is a duplicate of zyntell-backend/config/plans.js (CommonJS version).
 *       Keep BOTH files in sync whenever plan definitions change.
 *
 * @updated     2026-05-30
 * @version     1.0.0
 */

// ─────────────────────────────────────────
// PLAN DEFINITIONS
// ─────────────────────────────────────────

export const PLANS = {
  trial: {
    id: 'trial',
    name: 'Trial',
    price: 0,
    durationDays: 14,
    badge: 'Free',
    description: '14-day free trial to explore Zyntell',
    features: {
      whatsappBot: true,
      virtualNumber: true,
      conversationCap: 50,
      missedCallToWhatsApp: false,
      aiVoiceAgent: false,
      leadQualification: false,
      showupVerification: false,
      analyticsDashboard: false,
      multilingualSupport: false,
      leadAuctionAccess: false,
      customBotPersona: false,
      apiAccess: false,
      customerMemory: false,
      customerDigitalTwin: false,
      businessDigitalTwin: false,
      aiCeoReport: false,
      bookingCommission: 0,
      showupCommission: 0,
    },
  },

  starter: {
    id: 'starter',
    name: 'Starter',
    price: 1999,
    durationDays: 30,
    badge: '₹1,999/mo',
    description: 'WhatsApp bot + missed call automation for growing businesses',
    features: {
      whatsappBot: true,
      virtualNumber: true,
      conversationCap: 200,
      missedCallToWhatsApp: true,
      aiVoiceAgent: false,
      leadQualification: false,
      showupVerification: false,
      analyticsDashboard: false,
      multilingualSupport: false,
      leadAuctionAccess: false,
      customBotPersona: false,
      apiAccess: false,
      customerMemory: false,
      customerDigitalTwin: false,
      businessDigitalTwin: false,
      aiCeoReport: false,
      bookingCommission: 150,
      showupCommission: 250,
    },
  },

  growth: {
    id: 'growth',
    name: 'Growth',
    price: 3999,
    durationDays: 30,
    badge: '₹3,999/mo',
    description: 'Full AI voice + multilingual + analytics for scaling businesses',
    features: {
      whatsappBot: true,
      virtualNumber: true,
      conversationCap: -1,
      missedCallToWhatsApp: true,
      aiVoiceAgent: true,
      leadQualification: true,
      showupVerification: true,
      analyticsDashboard: true,
      multilingualSupport: true,
      leadAuctionAccess: false,
      customBotPersona: false,
      apiAccess: false,
      customerMemory: true,
      customerDigitalTwin: true,
      businessDigitalTwin: true,
      aiCeoReport: true,
      bookingCommission: 150,
      showupCommission: 200,
    },
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    price: 6999,
    durationDays: 30,
    badge: '₹6,999/mo',
    description: 'Everything — lead auction, custom persona, API access',
    features: {
      whatsappBot: true,
      virtualNumber: true,
      conversationCap: -1,
      missedCallToWhatsApp: true,
      aiVoiceAgent: true,
      leadQualification: true,
      showupVerification: true,
      analyticsDashboard: true,
      multilingualSupport: true,
      leadAuctionAccess: true,
      customBotPersona: true,
      apiAccess: true,
      customerMemory: true,
      customerDigitalTwin: true,
      businessDigitalTwin: true,
      aiCeoReport: true,
      bookingCommission: 100,
      showupCommission: 150,
    },
  },

  // Backwards-compat alias: existing DB records with 'plus' → treat as 'starter'
  plus: 'starter',
};

/** Ordered from lowest to highest tier */
export const PLAN_ORDER = ['trial', 'starter', 'growth', 'pro'];

/**
 * @function resolvePlanId
 * Resolves alias plan IDs ('plus') to their canonical counterpart ('starter').
 */
export const resolvePlanId = (planId) => {
  const key = (planId || 'trial').toLowerCase();
  const entry = PLANS[key];
  return typeof entry === 'string' ? entry : (PLAN_ORDER.includes(key) ? key : 'trial');
};

/**
 * @function getPlanConfig
 * Returns the full plan config object for a given plan ID (alias-safe).
 */
export const getPlanConfig = (planId) => {
  const canonical = resolvePlanId(planId);
  return PLANS[canonical] || PLANS.trial;
};

/**
 * @function hasFeature
 * Returns true if the given plan has the specified feature enabled.
 * Used throughout the frontend to conditionally render locked/unlocked UI.
 *
 * @param  {string}  planId     - Business plan from authStore (e.g. 'growth')
 * @param  {string}  featureKey - Feature key (e.g. 'analyticsDashboard')
 * @param  {Object}  [overrides] - Optional featureOverrides map from business document
 * @returns {boolean}
 *
 * @example
 *   hasFeature('starter', 'aiVoiceAgent')              // false
 *   hasFeature('growth',  'analyticsDashboard')        // true
 *   hasFeature('trial',   'aiVoiceAgent', { aiVoiceAgent: true }) // true (admin override)
 */
export const hasFeature = (planId, featureKey, overrides = {}) => {
  // Admin overrides always win
  if (featureKey in overrides) return Boolean(overrides[featureKey]);
  const config = getPlanConfig(planId);
  return Boolean(config.features[featureKey]);
};

/**
 * @function isPlanHigher
 * Returns true if planA is a higher tier than planB.
 */
export const isPlanHigher = (planA, planB) => {
  return PLAN_ORDER.indexOf(resolvePlanId(planA)) > PLAN_ORDER.indexOf(resolvePlanId(planB));
};

/**
 * @function getPlanThatUnlocks
 * Returns the name of the lowest plan that enables a given feature.
 * Used in locked-feature UI to say "Available on Growth plan".
 */
export const getPlanThatUnlocks = (featureKey) => {
  for (const planId of PLAN_ORDER) {
    const config = PLANS[planId];
    if (typeof config === 'string') continue; // skip aliases
    if (config.features[featureKey]) return config.name;
  }
  return 'Pro';
};
