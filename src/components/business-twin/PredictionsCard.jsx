import React from 'react'
import { Zap } from 'lucide-react'

const AwaitingAI = () => (
  <span style={{
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 20,
    background: 'rgba(217,119,6,0.08)',
    color: '#d97706',
  }}>
    Awaiting AI
  </span>
)

// score: 0.0–1.0 float; renders a progress bar + percentage
function ForecastBar({ label, forecast }) {
  if (!forecast || forecast.score == null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '0.5px solid var(--mp-card-border)',
      }}>
        <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>{label}</span>
        <AwaitingAI />
      </div>
    )
  }

  const pct   = Math.round(forecast.score * 100)
  const conf  = forecast.confidence != null ? Math.round(forecast.confidence * 100) : null
  const color = pct >= 70 ? '#059669' : pct >= 45 ? '#0284c7' : '#dc2626'

  return (
    <div style={{
      padding: '8px 0',
      borderBottom: '0.5px solid var(--mp-card-border)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}</span>
          {conf != null && (
            <span style={{ fontSize: 9, color: 'var(--mp-text-muted)' }}>{conf}% conf</span>
          )}
        </div>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: 'var(--mp-a10)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
        }} />
      </div>
    </div>
  )
}

const FORECAST_LABELS = [
  { key: 'revenueForecast',        label: 'Revenue Forecast'         },
  { key: 'demandForecast',         label: 'Demand Forecast'          },
  { key: 'staffingForecast',       label: 'Staffing Forecast'        },
  { key: 'customerGrowthForecast', label: 'Customer Growth Forecast' },
  { key: 'capacityForecast',       label: 'Capacity Forecast'        },
  { key: 'bookingVolumeForecast',  label: 'Booking Volume Forecast'  },
]

export default function PredictionsCard({ predictions = {} }) {
  const hasAnyForecast = FORECAST_LABELS.some(({ key }) => predictions[key]?.score != null)

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
          <span className="mp-label">Predictions</span>
        </div>
        {!hasAnyForecast && (
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 20,
            background: 'var(--mp-a05)',
            color: 'var(--mp-accent)',
            letterSpacing: '0.08em',
          }}>
            AI
          </span>
        )}
      </div>

      <div>
        {FORECAST_LABELS.map(({ key, label }) => (
          <ForecastBar key={key} label={label} forecast={predictions[key]} />
        ))}
      </div>

      {!hasAnyForecast && (
        <p style={{ fontSize: 11, color: 'var(--mp-text-muted)', marginTop: 10, fontStyle: 'italic' }}>
          AI-powered forecasting populates after the first pipeline run.
        </p>
      )}
    </div>
  )
}
