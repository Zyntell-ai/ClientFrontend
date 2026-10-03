/**
 * @file        mapboxProvider.js
 * @module      Maps / Mapbox provider
 * @description Mapbox implementation of the map provider interface (see ./index.js):
 *                isConfigured, searchAddress, reverseGeocode, createMap
 *              Uses Mapbox Geocoding API v6 and Mapbox GL JS (loaded on demand so other pages stay light).
 *              Token: VITE_MAPBOX_ACCESS_TOKEN — a PUBLIC (pk.*) token, URL-restricted in the Mapbox account.
 */

import { toMapboxLngLat } from '../../utils/location'

const TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''
const GEOCODE_URL = 'https://api.mapbox.com/search/geocode/v6'

/** Maps a Geocoding v6 feature to the app's address shape */
function toPlace(feature) {
  const p = feature?.properties || {}
  const c = p.context || {}
  const [longitude, latitude] = feature?.geometry?.coordinates || []
  const street = [c.address?.address_number, c.street?.name].filter(Boolean).join(' ') || c.address?.name || ''
  return {
    id: p.mapbox_id || feature?.id || `${latitude},${longitude}`,
    label: p.full_address || p.place_formatted || p.name || '',
    latitude,
    longitude,
    address: {
      addressLine1: street || (p.feature_type === 'poi' ? p.name : ''),
      locality: c.locality?.name || c.neighborhood?.name || '',
      city: c.place?.name || c.district?.name || '',
      state: c.region?.name || '',
      pincode: c.postcode?.name || '',
      country: (c.country?.country_code || 'IN').toUpperCase(),
    },
  }
}

async function geocode(path, params) {
  const qs = new URLSearchParams({ ...params, access_token: TOKEN })
  const res = await fetch(`${GEOCODE_URL}/${path}?${qs}`)
  if (!res.ok) throw new Error(`Map search failed (${res.status})`)
  const json = await res.json()
  return (json.features || []).map(toPlace)
}

export const mapboxProvider = {
  name: 'mapbox',

  isConfigured: () => Boolean(TOKEN),

  /** Address search (autocomplete). proximity biases results near the current pin. */
  searchAddress: (query, { country = 'in', proximity = null, limit = 5 } = {}) => {
    if (!TOKEN || !query?.trim()) return Promise.resolve([])
    return geocode('forward', {
      q: query.trim(),
      country,
      limit: String(limit),
      autocomplete: 'true',
      ...(proximity ? { proximity: `${proximity.longitude},${proximity.latitude}` } : {}),
    })
  },

  /** Address at a coordinate (used to warn when the typed address and the pin disagree) */
  reverseGeocode: async (latitude, longitude) => {
    if (!TOKEN) return null
    const [first] = await geocode('reverse', { latitude: String(latitude), longitude: String(longitude), limit: '1' })
    return first || null
  },

  /**
   * Creates an interactive map with one draggable marker.
   * @returns {Promise<{ setPosition: (lat:number, lng:number) => void, destroy: () => void }>}
   */
  createMap: async (container, { latitude, longitude, zoom = 15, onMarkerMove }) => {
    const [{ default: mapboxgl }] = await Promise.all([
      import('mapbox-gl'),
      import('mapbox-gl/dist/mapbox-gl.css'),
    ])
    mapboxgl.accessToken = TOKEN
    const center = toMapboxLngLat({ latitude, longitude })
    const map = new mapboxgl.Map({ container, style: 'mapbox://styles/mapbox/streets-v12', center, zoom })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    const marker = new mapboxgl.Marker({ draggable: true, color: '#7C3AED' }).setLngLat(center).addTo(map)
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLngLat()
      onMarkerMove?.(lat, lng)
    })
    map.on('click', (e) => {
      marker.setLngLat(e.lngLat)
      onMarkerMove?.(e.lngLat.lat, e.lngLat.lng)
    })
    return {
      setPosition: (lat, lng) => {
        const lngLat = toMapboxLngLat({ latitude: lat, longitude: lng })
        marker.setLngLat(lngLat)
        map.flyTo({ center: lngLat, zoom: Math.max(map.getZoom(), zoom) })
      },
      destroy: () => map.remove(),
    }
  },
}
