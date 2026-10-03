/**
 * @file        location.js
 * @module      Utils / Location
 * @description Pure helpers for the business-location editor (Phase 5). No provider/map code here.
 *              The backend re-validates everything; these checks only give fast feedback.
 */

/** @returns {boolean} a usable map pin (numbers in range, not 0,0) — mirrors the backend rule */
export function isValidPin(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return false
  return !(latitude === 0 && longitude === 0)
}

/** @returns {string} '' when valid, otherwise a message (India: 6-digit PIN not starting with 0) */
export function validatePincode(pincode, country = 'IN') {
  if (!pincode) return ''
  if (country === 'IN') return /^[1-9][0-9]{5}$/.test(pincode) ? '' : 'Enter a 6-digit PIN code'
  return /^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/.test(pincode) ? '' : 'Enter a valid postal code'
}

const norm = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '')

/**
 * @function    compareAddressToPin
 * @purpose     Detects when the typed address and the reverse-geocoded pin location disagree.
 *              The pin is authoritative for coordinates; this only produces a WARNING — nothing is
 *              overwritten automatically.
 * @param  {Object} entered  - { city, pincode, locality }
 * @param  {Object} atPin    - normalized reverse-geocode result { city, pincode, locality } (may be null)
 * @returns {{ mismatch: boolean, reasons: string[] }}
 */
export function compareAddressToPin(entered, atPin) {
  if (!entered || !atPin) return { mismatch: false, reasons: [] }
  const reasons = []
  if (norm(entered.pincode) && norm(atPin.pincode) && norm(entered.pincode) !== norm(atPin.pincode)) {
    reasons.push(`PIN code ${entered.pincode} vs ${atPin.pincode} at the pin`)
  }
  const ec = norm(entered.city)
  const pc = norm(atPin.city)
  if (ec && pc && !ec.includes(pc) && !pc.includes(ec)) {
    reasons.push(`City ${entered.city} vs ${atPin.city} at the pin`)
  }
  return { mismatch: reasons.length > 0, reasons }
}

/**
 * @function    fillEmptyAddressFields
 * @purpose     Copies suggested address parts ONLY into fields the user left empty (never overwrites typed values)
 */
export function fillEmptyAddressFields(current, suggestion) {
  const next = { ...current }
  for (const key of ['addressLine1', 'locality', 'city', 'state', 'pincode']) {
    if (!next[key] && suggestion?.[key]) next[key] = suggestion[key]
  }
  return next
}

/**
 * @function    toMapboxLngLat
 * @purpose     THE single conversion from the app's { latitude, longitude } to Mapbox's [longitude, latitude].
 *              No rounding — full precision is kept.
 * @returns {[number, number]}
 */
export function toMapboxLngLat({ latitude, longitude }) {
  return [longitude, latitude]
}

/**
 * @function    initialMapView
 * @purpose     Where the map and its marker start, derived ONLY from the canonical saved location
 *              (businesses/{id}.location from GET /api/business/location). Address text, geocoding and
 *              browser location are never used here. Without a valid saved pin the map shows `fallback`
 *              (view only — it is never saved as the business's pin).
 * @returns {{ latitude: number, longitude: number, zoom: number, hasPin: boolean }}
 */
export function initialMapView(savedLocation, fallback) {
  const lat = savedLocation?.latitude
  const lng = savedLocation?.longitude
  if (isValidPin(lat, lng)) return { latitude: lat, longitude: lng, zoom: 16, hasPin: true }
  return { latitude: fallback.latitude, longitude: fallback.longitude, zoom: 11, hasPin: false }
}
