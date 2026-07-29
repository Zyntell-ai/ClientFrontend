import React from 'react'

function Block({ h = 9, w = '60%', mb = 0 }) {
  return (
    <div
      className="mp-skeleton"
      style={{ height: h, width: w, marginBottom: mb, borderRadius: 4 }}
    />
  )
}

function CardShell({ children, padding = '16px' }) {
  return (
    <div className="mp-card" style={{ padding }}>
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
          <Block h={18} w="50%" />
        </div>
      ))}
    </div>
  )
}

function RateRows({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Block h={9} w={120} />
          <div className="mp-skeleton" style={{ flex: 1, height: 5, borderRadius: 99 }} />
          <Block h={9} w={28} />
        </div>
      ))}
    </div>
  )
}

export default function CeoReportSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Executive Summary placeholder */}
      <CardShell padding="18px">
        <Block h={9} w={120} mb={12} />
        <Block h={32} w="70%" mb={10} />
        <Block h={9} w="90%" mb={6} />
        <Block h={9} w="75%" />
      </CardShell>

      {/* Yesterday Overview hero */}
      <CardShell padding="18px">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Block h={9} w={130} />
          <Block h={20} w={120} />
        </div>
        <KpiRow cols={3} />
        <div style={{ marginTop: 10 }}>
          <KpiRow cols={5} />
        </div>
      </CardShell>

      {/* Revenue | Health */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '12px' }}>
        <CardShell>
          <Block h={9} w={80} mb={14} />
          <KpiRow cols={2} />
          <div style={{ marginTop: 10 }}><KpiRow cols={2} /></div>
        </CardShell>
        <CardShell>
          <Block h={9} w={110} mb={14} />
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid var(--mp-card-border)' }}>
              <Block h={9} w="45%" />
              <Block h={18} w={60} />
            </div>
          ))}
        </CardShell>
      </div>

      {/* Insights | Risks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <CardShell>
          <Block h={9} w={80} mb={14} />
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ padding: '10px 12px', background: 'var(--mp-a05)', borderRadius: 8, borderLeft: '3px solid var(--mp-a10)', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <Block h={14} w={52} />
                <Block h={9} w={70} />
              </div>
              <Block h={10} w="68%" mb={4} />
              <Block h={8} w="85%" />
            </div>
          ))}
        </CardShell>
        <CardShell>
          <Block h={9} w={95} mb={14} />
          {[1, 2].map((i) => (
            <div key={i} style={{ padding: '10px 12px', background: 'var(--mp-a05)', borderRadius: 8, borderLeft: '3px solid var(--mp-a10)', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <Block h={14} w={44} />
                <Block h={9} w={60} />
              </div>
              <Block h={10} w="60%" mb={4} />
              <Block h={8} w="80%" />
            </div>
          ))}
        </CardShell>
      </div>

      {/* Customers | Operations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <CardShell>
          <Block h={9} w={80} mb={14} />
          <KpiRow cols={3} />
          <div style={{ marginTop: 10 }}><KpiRow cols={2} /></div>
        </CardShell>
        <CardShell>
          <Block h={9} w={90} mb={14} />
          <RateRows count={3} />
        </CardShell>
      </div>

      {/* Staff | Marketing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <CardShell>
          <Block h={9} w={55} mb={14} />
          <KpiRow cols={2} />
        </CardShell>
        <CardShell>
          <Block h={9} w={80} mb={14} />
          <RateRows count={3} />
        </CardShell>
      </div>

      {/* Recommendations */}
      <CardShell>
        <Block h={9} w={130} mb={10} />
        <Block h={9} w="65%" />
      </CardShell>

      {/* Metadata */}
      <CardShell padding="12px 16px">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Block h={20} w={70} />
          <Block h={9} w={140} />
        </div>
      </CardShell>

    </div>
  )
}
