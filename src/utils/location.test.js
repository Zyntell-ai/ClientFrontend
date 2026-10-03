// Run: npm test  (Node's built-in test runner — no extra dependencies)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { isValidPin, validatePincode, compareAddressToPin, fillEmptyAddressFields, toMapboxLngLat, initialMapView } from './location.js'

test('pin validation mirrors the backend (ranges, numbers only, 0,0 unset)', () => {
  assert.equal(isValidPin(17.385, 78.4867), true)
  assert.equal(isValidPin(-90, 180), true)
  assert.equal(isValidPin(90.0001, 10), false)
  assert.equal(isValidPin(10, -180.5), false)
  assert.equal(isValidPin(0, 0), false)
  assert.equal(isValidPin('17', 78), false)
  assert.equal(isValidPin(NaN, 78), false)
})

test('PIN code validation (India: 6 digits, not starting with 0; empty allowed)', () => {
  assert.equal(validatePincode('500034'), '')
  assert.equal(validatePincode(''), '')
  assert.notEqual(validatePincode('050034'), '')
  assert.notEqual(validatePincode('5000'), '')
})

test('address/pin mismatch is detected by PIN code or city — warning only', () => {
  const entered = { city: 'Hyderabad', pincode: '500034' }
  assert.deepEqual(compareAddressToPin(entered, { city: 'Hyderabad', pincode: '500034' }), { mismatch: false, reasons: [] })
  const r = compareAddressToPin(entered, { city: 'Bengaluru', pincode: '560038' })
  assert.equal(r.mismatch, true)
  assert.equal(r.reasons.length, 2)
  // missing data on either side is not a mismatch
  assert.equal(compareAddressToPin({ city: '' }, { city: 'Pune' }).mismatch, false)
  assert.equal(compareAddressToPin(entered, null).mismatch, false)
  // "Secunderabad" vs "Hyderabad" style containment is tolerated only when one contains the other
  assert.equal(compareAddressToPin({ city: 'Hyderabad' }, { city: 'Greater Hyderabad' }).mismatch, false)
})

test('a selected search result fills only EMPTY address fields (typed values are never overwritten)', () => {
  const typed = { addressLine1: 'Plot 7, Road 12', locality: '', city: 'Hyderabad', state: '', pincode: '' }
  const next = fillEmptyAddressFields(typed, { addressLine1: 'Other St', locality: 'Banjara Hills', city: 'Secunderabad', state: 'Telangana', pincode: '500034' })
  assert.deepEqual(next, { addressLine1: 'Plot 7, Road 12', locality: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034' })
})

// ─── Map pin after save → reload (marker must sit exactly on the saved coordinates) ────────────
const DEFAULT_CENTER = { latitude: 17.385, longitude: 78.4867 }

test('Mapbox receives [longitude, latitude] — never [latitude, longitude] — at full precision', () => {
  assert.deepEqual(toMapboxLngLat({ latitude: 17.4486, longitude: 78.3908 }), [78.3908, 17.4486])
  assert.deepEqual(toMapboxLngLat({ latitude: 17.448612345678, longitude: 78.390812345678 }), [78.390812345678, 17.448612345678])
})

test('reload: the initial map centre and marker come from the saved coordinates only', () => {
  const saved = {
    latitude: 17.448612345678, longitude: 78.390812345678,
    // address text that would geocode elsewhere must be ignored
    addressLine1: 'Some other address', city: 'Bengaluru', pincode: '560038',
  }
  const view = initialMapView(saved, DEFAULT_CENTER)
  assert.deepEqual(view, { latitude: 17.448612345678, longitude: 78.390812345678, zoom: 16, hasPin: true })
  assert.deepEqual(toMapboxLngLat(view), [78.390812345678, 17.448612345678])
  assert.notDeepEqual(toMapboxLngLat(view), toMapboxLngLat(DEFAULT_CENTER))
})

test('no saved pin → default view only (flagged hasPin=false, never a saved pin)', () => {
  for (const saved of [undefined, null, {}, { latitude: null, longitude: null }, { latitude: 0, longitude: 0 }, { latitude: 91, longitude: 10 }]) {
    assert.deepEqual(initialMapView(saved, DEFAULT_CENTER), { ...DEFAULT_CENTER, zoom: 11, hasPin: false })
  }
})

test('current location / search result / dragged pin → save → reload round-trip keeps the exact marker position', () => {
  const sources = {
    currentLocation: { latitude: 17.44861234, longitude: 78.39081234 },          // navigator.geolocation coords
    searchResult: { latitude: 12.97159871, longitude: 77.59456123 },             // Mapbox feature [lng, lat] → place
    draggedPin: { latitude: 19.07609912, longitude: 72.87765543 },               // marker.getLngLat() { lat, lng }
  }
  for (const pin of Object.values(sources)) {
    // LocationEditor save payload sends pin.latitude / pin.longitude unchanged; the API echoes the stored values
    const payload = { latitude: pin.latitude, longitude: pin.longitude }
    const reloaded = JSON.parse(JSON.stringify({ location: { ...payload, city: 'X' } })).location
    assert.deepEqual(toMapboxLngLat(initialMapView(reloaded, DEFAULT_CENTER)), [pin.longitude, pin.latitude])
  }
})

// Source-level guards (the client has no browser/React test environment): the editor must initialise the map
// from the saved location via initialMapView — not from the `pin` state, which is still empty on first load —
// and the provider must convert coordinates only through toMapboxLngLat.
test('LocationEditor initialises the map from the saved location (data.location), not from pin state', () => {
  const src = readFileSync(new URL('../components/location/LocationEditor.jsx', import.meta.url), 'utf8')
  assert.match(src, /const start = initialMapView\(data\?\.location, DEFAULT_CENTER\)/)
  assert.doesNotMatch(src, /const start = pin \|\| DEFAULT_CENTER/)
})

test('the Mapbox provider converts coordinates only via toMapboxLngLat', () => {
  const src = readFileSync(new URL('../services/maps/mapboxProvider.js', import.meta.url), 'utf8')
  assert.match(src, /const center = toMapboxLngLat\(\{ latitude, longitude \}\)/)
  assert.match(src, /setLngLat\(center\)/)
  assert.match(src, /setLngLat\(lngLat\)/)
  assert.doesNotMatch(src, /setLngLat\(\[\s*lat/)
  assert.doesNotMatch(src, /center: \[\s*lat/)
})
