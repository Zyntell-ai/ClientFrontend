import React from 'react'
import { MessageSquare } from 'lucide-react'

function PendingAI({ label = 'Awaiting AI' }) {
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 20,
      background: 'rgba(217,119,6,0.08)',
      color: '#d97706',
      letterSpacing: '0.03em',
    }}>
      {label}
    </span>
  )
}

function InfoRow({ label, value, valueEl }) {
  const content = valueEl || (
    <span style={{
      fontSize: 12,
      fontWeight: 600,
      color: value != null ? 'var(--mp-text)' : undefined,
      textAlign: 'right',
    }}>
      {value != null ? String(value) : <PendingAI />}
    </span>
  )

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '0.5px solid var(--mp-card-border)',
      gap: 12,
    }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)', flexShrink: 0 }}>{label}</span>
      {content}
    </div>
  )
}

function ChannelBadge({ channel }) {
  if (!channel) return <PendingAI />
  const isWA = channel === 'whatsapp'
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 600,
      padding: '2px 9px',
      borderRadius: 20,
      background: isWA ? 'rgba(5,150,105,0.08)' : 'rgba(124,58,237,0.08)',
      color: isWA ? '#059669' : 'var(--mp-accent)',
      border: `0.5px solid ${isWA ? 'rgba(5,150,105,0.20)' : 'var(--mp-card-border)'}`,
    }}>
      {isWA ? '💬 WhatsApp' : '📞 Voice'}
    </span>
  )
}

const TONE_LABELS = {
  formal:       'Professional & Formal',
  casual:       'Casual & Relaxed',
  warm:         'Warm & Friendly',
}

const STYLE_LABELS = {
  brief:          'Brief',
  detailed:       'Detailed',
  conversational: 'Conversational',
}

export default function TwinCommunicationCard({ communication = {} }) {
  const speedLabel = communication.responseSpeedMinutes != null
    ? communication.responseSpeedMinutes < 60
      ? `${communication.responseSpeedMinutes} min`
      : `${(communication.responseSpeedMinutes / 60).toFixed(1)} hr`
    : null

  const msgLenLabel = communication.averageMessageLength != null
    ? `~${communication.averageMessageLength} chars`
    : null

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <MessageSquare style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
        <span className="mp-label">Communication</span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 9,
          fontWeight: 600,
          padding: '2px 7px',
          borderRadius: 20,
          background: 'var(--mp-a05)',
          color: 'var(--mp-accent)',
          letterSpacing: '0.08em',
        }}>
          AI-ANALYSED
        </span>
      </div>

      <InfoRow label="Preferred Channel" valueEl={<ChannelBadge channel={communication.preferredChannel} />} />
      <InfoRow label="Tone"              value={TONE_LABELS[communication.tone] || null} />
      <InfoRow label="Response Speed"    value={speedLabel} />
      <InfoRow label="Conversation Style" value={STYLE_LABELS[communication.conversationStyle] || null} />
      <InfoRow label="Avg. Message Length" value={msgLenLabel} />
      {communication.languagesMixed && (
        <InfoRow label="Multilingual" valueEl={
          <span style={{ fontSize: 10, fontWeight: 600, color: '#7c3aed', background: 'var(--mp-a05)', padding: '2px 8px', borderRadius: 20 }}>
            Mixed languages
          </span>
        } />
      )}
    </div>
  )
}
