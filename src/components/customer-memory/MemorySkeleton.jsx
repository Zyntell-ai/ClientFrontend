import React from 'react'

export default function MemorySkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Visit stats skeleton */}
      <div className="mp-card" style={{ padding: '16px' }}>
        <div className="mp-skeleton" style={{ height: '9px', width: '80px', marginBottom: '14px', borderRadius: '4px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ padding: '10px 12px', background: 'var(--mp-a05)', borderRadius: '8px' }}>
              <div className="mp-skeleton" style={{ height: '9px', width: '60%', marginBottom: '8px', borderRadius: '4px' }} />
              <div className="mp-skeleton" style={{ height: '13px', width: '40%', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Preferences skeleton */}
      <div className="mp-card" style={{ padding: '16px' }}>
        <div className="mp-skeleton" style={{ height: '9px', width: '90px', marginBottom: '14px', borderRadius: '4px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i}>
              <div className="mp-skeleton" style={{ height: '9px', width: '70%', marginBottom: '6px', borderRadius: '4px' }} />
              <div className="mp-skeleton" style={{ height: '34px', borderRadius: '8px' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Notes skeleton */}
      <div className="mp-card" style={{ padding: '16px' }}>
        <div className="mp-skeleton" style={{ height: '9px', width: '70px', marginBottom: '14px', borderRadius: '4px' }} />
        <div className="mp-skeleton" style={{ height: '80px', borderRadius: '8px' }} />
      </div>
    </div>
  )
}
