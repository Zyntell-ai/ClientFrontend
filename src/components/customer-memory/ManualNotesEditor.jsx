import React, { useState, useEffect } from 'react'

export default function ManualNotesEditor({ initialValue = '', onSave, saving = false }) {
  const [notes, setNotes] = useState(initialValue)

  useEffect(() => { setNotes(initialValue) }, [initialValue])

  const isDirty = notes !== initialValue

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <p className="mp-label" style={{ marginBottom: '10px' }}>Staff Notes</p>
      <textarea
        className="mp-input"
        rows={4}
        maxLength={1000}
        placeholder="Add private notes about this customer — preferences, sensitivities, special requests…"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
        <span style={{ fontSize: '11px', color: 'var(--mp-text-muted)' }}>
          {notes.length}/1000
        </span>
        <button
          className="mp-btn mp-btn-primary"
          onClick={() => onSave(notes)}
          disabled={!isDirty || saving}
          style={{ padding: '6px 16px', fontSize: '12px' }}
        >
          {saving ? 'Saving…' : 'Save Notes'}
        </button>
      </div>
    </div>
  )
}
