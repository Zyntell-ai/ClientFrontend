/**
 * @file        LocationEditor.jsx
 * @module      Location
 * @description Business address + map pin editor (Phase 5).
 *
 *   - Structured address: addressLine1/2, locality, city, state, PIN code (saved as typed — never auto-replaced)
 *   - Map pin: search an address, pick a result, drag the marker, click the map, or use the browser's location
 *   - The pin is authoritative for coordinates. When the typed address and the pin's location disagree the
 *     user is warned, may apply the suggested address, or confirms and saves as is.
 *   - A valid pin is required before the business is ready to go live (shown as a readiness banner).
 *   Provider-agnostic: map/search come from services/maps (Mapbox today).
 *
 * @sideEffects GET/PUT /api/business/location
 */
import React, { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Search, Crosshair, CheckCircle2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { businessApi } from '../../api/index'
import { mapProvider } from '../../services/maps'
import { Card, Input, Button, Alert, Spinner } from '../ui/index'
import { isValidPin, validatePincode, compareAddressToPin, fillEmptyAddressFields, initialMapView } from '../../utils/location'

const EMPTY = { addressLine1: '', addressLine2: '', locality: '', city: '', state: '', pincode: '' }
const DEFAULT_CENTER = { latitude: 17.385, longitude: 78.4867 } // Hyderabad — only the initial map view, never saved

export default function LocationEditor() {
  const queryClient = useQueryClient()
  const mapsEnabled = mapProvider.isConfigured()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['business-location'],
    queryFn: businessApi.getLocation,
    select: (r) => r.data,
  })

  const [address, setAddress] = useState(EMPTY)
  const [pin, setPin] = useState(null) // { latitude, longitude }
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [atPin, setAtPin] = useState(null) // reverse-geocoded place at the pin
  const [confirmMismatch, setConfirmMismatch] = useState(false)
  const [locating, setLocating] = useState(false)
  const [errors, setErrors] = useState({})

  const mapEl = useRef(null)
  const mapRef = useRef(null)

  // [STATE]: Load the saved location
  useEffect(() => {
    if (!data?.location) return
    const l = data.location
    setAddress({
      addressLine1: l.addressLine1 || '', addressLine2: l.addressLine2 || '', locality: l.locality || '',
      city: l.city || '', state: l.state || '', pincode: l.pincode || '',
    })
    setPin(isValidPin(l.latitude, l.longitude) ? { latitude: l.latitude, longitude: l.longitude } : null)
  }, [data])

  // [UI]: Create the map once the saved location is known.
  // The map centre AND the marker come from the canonical saved location (data.location) — NOT from the `pin`
  // state, which is only filled by the effect above in this same commit and is therefore still null here
  // (that race placed the marker at DEFAULT_CENTER after a reload while the saved coordinates were correct).
  useEffect(() => {
    if (!mapsEnabled || isLoading || !mapEl.current || mapRef.current) return undefined
    let cancelled = false
    const start = initialMapView(data?.location, DEFAULT_CENTER)
    mapProvider.createMap(mapEl.current, {
      latitude: start.latitude,
      longitude: start.longitude,
      zoom: start.zoom,
      onMarkerMove: (latitude, longitude) => movePin(latitude, longitude),
    }).then((ctrl) => {
      if (cancelled) ctrl.destroy(); else mapRef.current = ctrl
    }).catch(() => toast.error('The map could not be loaded.'))
    return () => { cancelled = true; mapRef.current?.destroy(); mapRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsEnabled, isLoading])

  // [DATA]: Reverse-geocode the pin to detect address/pin disagreement (warning only)
  useEffect(() => {
    if (!mapsEnabled || !pin) { setAtPin(null); return }
    let stale = false
    mapProvider.reverseGeocode(pin.latitude, pin.longitude)
      .then((place) => { if (!stale) setAtPin(place) })
      .catch(() => { if (!stale) setAtPin(null) })
    return () => { stale = true }
  }, [mapsEnabled, pin])

  const movePin = (latitude, longitude, { fly = false } = {}) => {
    if (!isValidPin(latitude, longitude)) return
    setPin({ latitude, longitude })
    setConfirmMismatch(false)
    if (fly) mapRef.current?.setPosition(latitude, longitude)
  }

  const setField = (key, value) => {
    setAddress((a) => ({ ...a, [key]: value }))
    setConfirmMismatch(false)
  }

  const runSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      setResults(await mapProvider.searchAddress(query, { proximity: pin }))
    } catch {
      toast.error('Address search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const pickResult = (place) => {
    movePin(place.latitude, place.longitude, { fly: true })
    // [RULE]: Only fill address fields that are empty — never overwrite what the user typed
    setAddress((a) => fillEmptyAddressFields(a, place.address))
    setResults([])
    setQuery(place.label)
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error('Location is not available on this device.'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocating(false); movePin(pos.coords.latitude, pos.coords.longitude, { fly: true }) },
      () => { setLocating(false); toast.error('Could not get your location. Please allow location access or search instead.') },
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }

  const comparison = compareAddressToPin(address, atPin?.address)

  const saveMutation = useMutation({
    mutationFn: () => businessApi.updateLocation({
      addressLine1: address.addressLine1.trim() || null,
      addressLine2: address.addressLine2.trim() || null,
      locality: address.locality.trim() || null,
      city: address.city.trim(),
      state: address.state.trim() || null,
      pincode: address.pincode.trim() || null,
      latitude: pin ? pin.latitude : null,
      longitude: pin ? pin.longitude : null,
    }),
    onSuccess: (res) => {
      queryClient.setQueryData(['business-location'], res)
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] })
      toast.success('Location saved')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Could not save the location'),
  })

  const save = () => {
    const next = {}
    if (address.city.trim().length < 2) next.city = 'City is required'
    const pinError = validatePincode(address.pincode.trim())
    if (pinError) next.pincode = pinError
    setErrors(next)
    if (Object.keys(next).length) return
    if (comparison.mismatch && !confirmMismatch) {
      toast.error('Please confirm the map pin or fix the address before saving.')
      return
    }
    saveMutation.mutate()
  }

  if (isLoading) return <Card title="Business Location"><div className="flex justify-center py-8"><Spinner /></div></Card>
  if (isError) return <Card title="Business Location"><Alert type="error">We couldn't load your location. Please refresh the page.</Alert></Card>

  const ready = data?.readiness?.complete
  return (
    <Card title="Business Location">
      <div className="space-y-4">
        {ready ? (
          <Alert type="success">Location complete — your map pin is set.</Alert>
        ) : (
          <Alert type="warning">A map pin is required before your business can go live. Search for your address or drop the pin on your entrance.</Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Input label="Address line 1" value={address.addressLine1} maxLength={200} placeholder="Building, street"
              onChange={(e) => setField('addressLine1', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Input label="Address line 2 (optional)" value={address.addressLine2} maxLength={200} placeholder="Floor, landmark"
              onChange={(e) => setField('addressLine2', e.target.value)} />
          </div>
          <Input label="Locality / area" value={address.locality} maxLength={100} onChange={(e) => setField('locality', e.target.value)} />
          <Input label="City *" value={address.city} maxLength={100} error={errors.city} onChange={(e) => setField('city', e.target.value)} />
          <Input label="State" value={address.state} maxLength={100} onChange={(e) => setField('state', e.target.value)} />
          <Input label="PIN code" value={address.pincode} maxLength={6} inputMode="numeric" error={errors.pincode}
            onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, ''))} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--mp-accent)' }}>Map pin</p>
          {mapsEnabled ? (
            <>
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <Input placeholder="Search your business address" value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); runSearch() } }} />
                </div>
                <Button variant="secondary" onClick={runSearch} loading={searching}><Search className="w-4 h-4" /> Search</Button>
              </div>
              {results.length > 0 && (
                <ul className="mb-2 rounded-lg border border-violet-100 divide-y divide-violet-50 bg-white">
                  {results.map((r) => (
                    <li key={r.id}>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-violet-50" onClick={() => pickResult(r)}>{r.label}</button>
                    </li>
                  ))}
                </ul>
              )}
              <div ref={mapEl} className="w-full rounded-xl overflow-hidden border border-violet-100" style={{ height: 320 }} />
              <p className="text-xs text-slate-500 mt-1.5">Drag the pin or click the map to place it exactly on your entrance.</p>
            </>
          ) : (
            <Alert type="info">The map is not available right now. You can still save your address and use your current location for the pin.</Alert>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={useCurrentLocation} loading={locating}>
              <Crosshair className="w-4 h-4" /> Use my current location
            </Button>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {pin ? `Pin set (${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)})` : 'No pin yet'}
            </span>
          </div>
        </div>

        {/* [RULE]: Address/pin disagreement — warn, suggest, require confirmation; never overwrite silently */}
        {comparison.mismatch && (
          <div className="rounded-lg border p-3 text-xs space-y-2" style={{ borderColor: 'rgba(217,119,6,0.3)', background: 'rgba(217,119,6,0.06)', color: '#92400e' }}>
            <p className="flex items-center gap-1.5 font-semibold"><AlertTriangle className="w-3.5 h-3.5" /> Your map pin appears to be different from the entered address. Please confirm the location before saving.</p>
            <ul className="list-disc pl-5">{comparison.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            {atPin?.label && (
              <div className="flex items-center gap-2 flex-wrap">
                <span>Address at the pin: <strong>{atPin.label}</strong></span>
                <Button size="sm" variant="secondary" onClick={() => { setAddress((a) => ({ ...a, ...Object.fromEntries(Object.entries(atPin.address).filter(([k, v]) => v && k !== 'country')) })); setConfirmMismatch(false) }}>
                  Use suggested address
                </Button>
              </div>
            )}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={confirmMismatch} onChange={(e) => setConfirmMismatch(e.target.checked)} />
              The pin is on my business — save my address as entered
            </label>
          </div>
        )}

        <Button className="w-full" loading={saveMutation.isPending} onClick={save}>
          <CheckCircle2 className="w-4 h-4" /> Save Location
        </Button>
        <p className="text-[11px] text-slate-400">Used to verify customer check-ins and shown to customers. We store only your business location — never your personal location.</p>
      </div>
    </Card>
  )
}
