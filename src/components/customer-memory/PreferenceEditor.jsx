import React, { useState, useEffect } from 'react'

const TIME_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'morning',   label: 'Morning'   },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening',   label: 'Evening'   },
]

const LANGUAGE_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi'   },
  { value: 'te', label: 'Telugu'  },
]

export default function PreferenceEditor({ initialPreferences = {}, onSave, saving = false }) {
  const [prefs, setPrefs] = useState({ ...initialPreferences })

  useEffect(() => { setPrefs({ ...initialPreferences }) }, [initialPreferences])

  const isDirty = JSON.stringify(prefs) !== JSON.stringify(initialPreferences)
  const set = (key) => (e) => setPrefs(p => ({ ...p, [key]: e.target.value || null }))

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <p className="mp-label" style={{ marginBottom: '12px' }}>Preferences</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <Field label="Preferred Staff">
          <input
            className="mp-input"
            placeholder="Staff name"
            value={prefs.preferredStaffName || ''}
            onChange={set('preferredStaffName')}
            style={{ fontSize: '12px' }}
          />
        </Field>
        <Field label="Preferred Service">
          <input
            className="mp-input"
            placeholder="Service name"
            value={prefs.preferredServiceName || ''}
            onChange={set('preferredServiceName')}
            style={{ fontSize: '12px' }}
          />
        </Field>
        <Field label="Preferred Time">
          <select
            className="mp-input"
            value={prefs.preferredTimeOfDay || ''}
            onChange={set('preferredTimeOfDay')}
            style={{ fontSize: '12px' }}
          >
            {TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Language">
          <select
            className="mp-input"
            value={prefs.language || ''}
            onChange={set('language')}
            style={{ fontSize: '12px' }}
          >
            {LANGUAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="mp-btn mp-btn-primary"
          onClick={() => onSave(prefs)}
          disabled={!isDirty || saving}
          style={{ padding: '6px 16px', fontSize: '12px' }}
        >
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <p className="mp-label" style={{ marginBottom: '4px', fontSize: '9px' }}>{label}</p>
      {children}
    </div>
  )
}
