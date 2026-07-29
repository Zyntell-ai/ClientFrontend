import React from 'react'

export default function EmptyMemoryState() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧠</div>
      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--mp-text)', marginBottom: '6px' }}>
        No memory items yet
      </p>
      <p style={{ fontSize: '13px', color: 'var(--mp-text-muted)', maxWidth: '280px', margin: '0 auto', lineHeight: 1.5 }}>
        Memory items appear here after this customer interacts with your bot.
      </p>
    </div>
  )
}
