/**
 * @file        index.js
 * @module      Maps
 * @description The single map/geocoding provider used by the app. Business-location logic depends only on this
 *              interface, so the provider can be swapped without touching the location editor:
 *
 *                isConfigured(): boolean
 *                searchAddress(query, { country, proximity, limit }): Promise<Place[]>
 *                reverseGeocode(latitude, longitude): Promise<Place|null>
 *                createMap(container, { latitude, longitude, zoom, onMarkerMove }): Promise<{ setPosition, destroy }>
 *
 *              Place = { id, label, latitude, longitude, address: { addressLine1, locality, city, state, pincode, country } }
 */
import { mapboxProvider } from './mapboxProvider'

export const mapProvider = mapboxProvider
