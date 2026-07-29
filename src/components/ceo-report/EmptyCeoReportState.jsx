import React from 'react'
import { Newspaper, RefreshCw, AlertCircle } from 'lucide-react'

const STATES = {
  pending: {
    icon: <Newspaper style={{ width: 28, height: 28, color: 'var(--mp-accent)', opacity: 0.6 }} />,
    title: 'Preparing Your Morning Briefing…',
    description: "Collecting yesterday's bookings, customers, leads, and revenue. This takes a moment on first run.",
    pulse: true,
  },
  generating: {
    icon: <RefreshCw style={{ width: 28, height: 28, color: 'var(--mp-accent)' }} className="mp-spin" />,
    title: 'Assembling Executive Report…',
    description: 'Analysing revenue trends, booking patterns, and customer activity. Refresh in a few seconds.',
    pulse: false,
  },
  error: {
    icon: <AlertCircle style={{ width: 28, height: 28, color: '#dc2626' }} />,
    title: 'Briefing Generation Failed',
    description: 'The CEO Report could not be generated this time. It will retry automatically on the next visit.',
    pulse: false,
  },
  empty: {
    icon: <Newspaper style={{ width: 28, height: 28, color: 'var(--mp-accent)', opacity: 0.35 }} />,
    title: 'No Briefing Available',
    description: 'The CEO Report will populate once your account has booking and customer data.',
    pulse: false,
  },
}

export default function EmptyCeoReportState({ status = 'empty' }) {
  const cfg = STATES[status] || STATES.empty

  return (
    <div
      className="mp-card"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <div style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'var(--mp-a05)',
        border: '0.5px solid var(--mp-card-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: cfg.pulse ? 'blobPulse 2.5s ease-in-out infinite' : undefined,
      }}>
        {cfg.icon}
      </div>
      <p style={{
        fontFamily: 'Lora, Georgia, serif',
        fontWeight: 500,
        fontSize: 14,
        color: 'var(--mp-text)',
        marginTop: 4,
      }}>
        {cfg.title}
      </p>
      <p style={{ fontSize: 12, color: 'var(--mp-text-muted)', maxWidth: 340, lineHeight: 1.6 }}>
        {cfg.description}
      </p>
    </div>
  )
}
