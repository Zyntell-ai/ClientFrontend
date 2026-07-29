import React from 'react'

function Block({ h = 9, w = '60%', mb = 0 }) {
  return (
    <div
      className="mp-skeleton"
      style={{ height: h, width: w, marginBottom: mb, borderRadius: 4 }}
    />
  )
}

function CardShell({ children }) {
  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      {children}
    </div>
  )
}

export default function TwinSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Identity */}
      <CardShell>
        <Block h={9} w="80px" mb={14} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i}>
              <Block h={8} w="55%" mb={6} />
              <Block h={13} w="80%" />
            </div>
          ))}
        </div>
      </CardShell>

      {/* Behavior */}
      <CardShell>
        <Block h={9} w="70px" mb={14} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Block h={9} w="35%" />
              <Block h={9} w="20%" />
            </div>
          ))}
        </div>
      </CardShell>

      {/* Relationship scores */}
      <CardShell>
        <Block h={9} w="90px" mb={14} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Block h={9} w="40%" />
                <Block h={9} w="20%" />
              </div>
              <div className="mp-skeleton" style={{ height: 5, borderRadius: 99, width: '100%' }} />
            </div>
          ))}
        </div>
      </CardShell>

      {/* Business value */}
      <CardShell>
        <Block h={9} w="100px" mb={14} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ padding: '10px 12px', background: 'var(--mp-a05)', borderRadius: 8 }}>
              <Block h={8} w="70%" mb={6} />
              <Block h={16} w="60%" />
            </div>
          ))}
        </div>
      </CardShell>

    </div>
  )
}
