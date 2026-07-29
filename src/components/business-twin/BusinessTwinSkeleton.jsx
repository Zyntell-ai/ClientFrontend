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

function KpiRow({ cols = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '10px' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} style={{ padding: '10px 12px', background: 'var(--mp-a05)', borderRadius: 8 }}>
          <Block h={8} w="65%" mb={6} />
          <Block h={16} w="50%" />
        </div>
      ))}
    </div>
  )
}

function RankedRows({ count = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Block h={9} w={`${55 - i * 5}%`} />
          <div className="mp-skeleton" style={{ flex: 1, height: 5, borderRadius: 99 }} />
          <Block h={9} w="28px" />
        </div>
      ))}
    </div>
  )
}

export default function BusinessTwinSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Identity / header */}
      <CardShell>
        <Block h={9} w="110px" mb={14} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i}>
              <Block h={8} w="50%" mb={5} />
              <Block h={13} w="75%" />
            </div>
          ))}
        </div>
      </CardShell>

      {/* Revenue KPIs */}
      <CardShell>
        <Block h={9} w="70px" mb={14} />
        <KpiRow cols={3} />
        <div style={{ marginTop: 10 }}><KpiRow cols={3} /></div>
      </CardShell>

      {/* Demand bars */}
      <CardShell>
        <Block h={9} w="80px" mb={14} />
        <Block h={9} w="55%" mb={12} />
        <RankedRows count={4} />
      </CardShell>

      {/* Operations bars */}
      <CardShell>
        <Block h={9} w="90px" mb={14} />
        <RankedRows count={4} />
      </CardShell>

      {/* Staff + Customers side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <CardShell>
          <Block h={9} w="55px" mb={14} />
          <KpiRow cols={2} />
        </CardShell>
        <CardShell>
          <Block h={9} w="75px" mb={14} />
          <KpiRow cols={2} />
        </CardShell>
      </div>

      {/* Metadata */}
      <CardShell>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Block h={9} w="80px" />
          <Block h={9} w="130px" />
        </div>
      </CardShell>

    </div>
  )
}
