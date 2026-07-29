import React, { useState } from 'react'
import { Edit2, Save, X, User } from 'lucide-react'
import { fmt } from '../../utils/index'

const LANGUAGE_LABELS = { te: 'Telugu', en: 'English', hi: 'Hindi' }
const CHANNEL_LABELS  = { whatsapp: 'WhatsApp', voice: 'Voice' }

function InfoRow({ label, value, placeholder = '—' }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '8px 0',
      borderBottom: '0.5px solid var(--mp-card-border)',
      gap: 12,
    }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)', flexShrink: 0 }}>{label}</span>
      <span style={{
        fontSize: 12,
        fontWeight: 600,
        color: value ? 'var(--mp-text)' : 'var(--mp-text-muted)',
        textAlign: 'right',
        opacity: value ? 1 : 0.45,
      }}>
        {value || placeholder}
      </span>
    </div>
  )
}

function FieldGroup({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--mp-accent)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const INPUT_STYLE = {
  width: '100%',
  background: 'white',
  border: '0.5px solid var(--mp-card-border)',
  borderRadius: 8,
  padding: '7px 10px',
  fontSize: 12,
  color: 'var(--mp-text)',
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
}

export default function TwinIdentityCard({ identity = {}, onSave, saving = false }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    preferredStaffName:   identity.preferredStaffName   || '',
    preferredServiceName: identity.preferredServiceName || '',
    preferredLanguage:    identity.preferredLanguage    || '',
    primaryContactMethod: identity.primaryContactMethod || '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    const patch = {}
    if (form.preferredStaffName)   patch.preferredStaffName   = form.preferredStaffName
    if (form.preferredServiceName) patch.preferredServiceName = form.preferredServiceName
    if (form.preferredLanguage)    patch.preferredLanguage    = form.preferredLanguage
    if (form.primaryContactMethod) patch.primaryContactMethod = form.primaryContactMethod
    onSave(patch)
    setEditing(false)
  }

  const handleCancel = () => {
    setForm({
      preferredStaffName:   identity.preferredStaffName   || '',
      preferredServiceName: identity.preferredServiceName || '',
      preferredLanguage:    identity.preferredLanguage    || '',
      primaryContactMethod: identity.primaryContactMethod || '',
    })
    setEditing(false)
  }

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <User style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
          <span className="mp-label">Identity</span>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="mp-btn mp-btn-ghost"
            style={{ fontSize: 11, padding: '4px 10px', gap: 5 }}
            aria-label="Edit identity fields"
          >
            <Edit2 style={{ width: 11, height: 11 }} />
            Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleCancel}
              className="mp-btn mp-btn-ghost"
              style={{ fontSize: 11, padding: '4px 10px' }}
              aria-label="Cancel edit"
            >
              <X style={{ width: 11, height: 11 }} />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="mp-btn mp-btn-primary"
              style={{ fontSize: 11, padding: '4px 12px', gap: 5 }}
              aria-label="Save identity"
            >
              <Save style={{ width: 11, height: 11 }} />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {!editing ? (
        <>
          <InfoRow label="Customer Since"    value={fmt.date(identity.customerSince)} />
          <InfoRow label="Preferred Staff"   value={identity.preferredStaffName} />
          <InfoRow label="Preferred Service" value={identity.preferredServiceName} />
          <InfoRow label="Language"          value={LANGUAGE_LABELS[identity.preferredLanguage] || identity.preferredLanguage} />
          <InfoRow label="Contact Method"    value={CHANNEL_LABELS[identity.primaryContactMethod] || identity.primaryContactMethod} />
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FieldGroup label="Preferred Staff">
            <input
              style={INPUT_STYLE}
              value={form.preferredStaffName}
              onChange={e => set('preferredStaffName', e.target.value)}
              placeholder="Staff member name"
            />
          </FieldGroup>
          <FieldGroup label="Preferred Service">
            <input
              style={INPUT_STYLE}
              value={form.preferredServiceName}
              onChange={e => set('preferredServiceName', e.target.value)}
              placeholder="Service name"
            />
          </FieldGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FieldGroup label="Language">
              <select
                style={{ ...INPUT_STYLE, cursor: 'pointer', appearance: 'none' }}
                value={form.preferredLanguage}
                onChange={e => set('preferredLanguage', e.target.value)}
              >
                <option value="">—</option>
                <option value="te">Telugu</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Contact Method">
              <select
                style={{ ...INPUT_STYLE, cursor: 'pointer', appearance: 'none' }}
                value={form.primaryContactMethod}
                onChange={e => set('primaryContactMethod', e.target.value)}
              >
                <option value="">—</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="voice">Voice</option>
              </select>
            </FieldGroup>
          </div>
        </div>
      )}
    </div>
  )
}
