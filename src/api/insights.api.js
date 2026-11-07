/**
 * @file        insights.api.js
 * @module      Conversation Insights API
 * @project     ClientFrontend
 * @layer       API
 * @description Conversation insights — questions customers asked the AI (voice + WhatsApp) in the last 30 days, with
 *              conservative outcomes. Always scoped to the logged-in business by the backend.
 */
import apiClient from './apiClient'

export const insightsApi = {
  /** GET /api/insights — totals, outcome / channel breakdowns, frequent questions, unanswered, knowledge gaps, recent */
  summary: () => apiClient.get('/api/insights'),
}
