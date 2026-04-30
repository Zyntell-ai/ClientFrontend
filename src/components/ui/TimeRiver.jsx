// src/components/ui/TimeRiver.jsx
// Horizontal drag-scrollable timeline for bookings and leads
import React, { useRef, useState, useEffect, useCallback } from 'react'
import { format, differenceInMinutes, startOfDay, addMinutes } from 'date-fns'
import clsx from 'clsx'

const HOUR_PX = 120   // pixels per hour
const START_H = 7     // 7 AM
const END_H   = 22    // 10 PM
const TOTAL_H = END_H - START_H
const TOTAL_W = TOTAL_H * HOUR_PX + 120

function timeToX(date) {
  const dayStart = startOfDay(date)
  dayStart.setHours(START_H)
  const mins = differenceInMinutes(date, dayStart)
  return Math.max(0, (mins / 60) * HOUR_PX + 60)
}

function getNowX() {
  const now = new Date()
  return timeToX(now)
}

export default function TimeRiver({ items = [], mode = 'bookings', emptyText = 'Nothing scheduled today' }) {
  const wrapRef   = useRef(null)
  const [focused, setFocused]   = useState(null)
  const [nowX, setNowX]         = useState(getNowX)
  const isDragging = useRef(false)
  const startX     = useRef(0)
  const scrollLeft = useRef(0)

  // Update "now" line every minute
  useEffect(() => {
    const t = setInterval(() => setNowX(getNowX()), 60000)
    // Scroll to now on mount
    if (wrapRef.current) {
      wrapRef.current.scrollLeft = Math.max(0, getNowX() - 200)
    }
    return () => clearInterval(t)
  }, [])

  // Drag scroll
  const onMouseDown = useCallback(e => {
    isDragging.current = true
    startX.current     = e.pageX - (wrapRef.current?.offsetLeft || 0)
    scrollLeft.current = wrapRef.current?.scrollLeft || 0
    if (wrapRef.current) wrapRef.current.style.cursor = 'grabbing'
  }, [])

  const onMouseMove = useCallback(e => {
    if (!isDragging.current || !wrapRef.current) return
    e.preventDefault()
    const x    = e.pageX - wrapRef.current.offsetLeft
    const walk = (x - startX.current) * 1.4
    wrapRef.current.scrollLeft = scrollLeft.current - walk
  }, [])

  const onMouseUp = useCallback(() => {
    isDragging.current = false
    if (wrapRef.current) wrapRef.current.style.cursor = 'grab'
  }, [])

  if (!items.length) {
    return (
      <div className="flex items-center justify-center py-10 text-sm" style={{ color: 'var(--mp-text)', opacity: 0.4 }}>
        {emptyText}
      </div>
    )
  }

  // Assign vertical lanes (alternating above/below center line)
  const withLanes = items.map((item, i) => ({ ...item, lane: i % 2 === 0 ? 'above' : 'below' }))

  return (
    <div
      ref={wrapRef}
      className="mp-river-wrap select-none"
      style={{ height: 220, cursor: 'grab' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div style={{ position: 'relative', width: TOTAL_W, height: '100%', minWidth: TOTAL_W }}>

        {/* Hour markers */}
        {Array.from({ length: TOTAL_H + 1 }, (_, i) => {
          const h = START_H + i
          const x = 60 + i * HOUR_PX
          return (
            <React.Fragment key={h}>
              <div
                style={{
                  position: 'absolute',
                  left: x,
                  top: 0,
                  bottom: 0,
                  width: '0.5px',
                  background: 'var(--mp-card-border)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: x + 4,
                  bottom: 8,
                  fontSize: 9,
                  letterSpacing: '0.06em',
                  color: 'var(--mp-text)',
                  opacity: 0.3,
                  fontFamily: 'Lora, Georgia, serif',
                  whiteSpace: 'nowrap',
                }}
              >
                {h === 12 ? '12p' : h < 12 ? `${h}a` : `${h - 12}p`}
              </span>
            </React.Fragment>
          )
        })}

        {/* Centre spine */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: '0.5px',
            background: 'var(--mp-card-border)',
          }}
        />

        {/* "Now" line */}
        <div
          style={{
            position: 'absolute',
            left: nowX,
            top: 0,
            bottom: 0,
            width: 1.5,
            background: 'var(--mp-pop)',
            opacity: 0.7,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 4,
              fontSize: 9,
              color: 'var(--mp-pop)',
              whiteSpace: 'nowrap',
              fontWeight: 600,
              letterSpacing: '0.06em',
            }}
          >
            NOW
          </div>
        </div>

        {/* Bubbles */}
        {withLanes.map((item) => {
          const x = timeToX(new Date(item.time?.toDate ? item.time.toDate() : item.time))
          const above = item.lane === 'above'
          const isFocused = focused === item.id

          // Urgency color for leads
          let bg = 'var(--mp-accent)'
          if (mode === 'leads') {
            if (item.quality === 'HOT')  bg = '#dc2626'
            else if (item.quality === 'WARM') bg = '#d97706'
            else bg = '#0369a1'
          }
          if (mode === 'bookings') {
            if (item.status === 'COMPLETED') bg = '#059669'
            else if (item.status === 'CANCELLED') bg = '#94a3b8'
            else if (item.status === 'PENDING') bg = '#d97706'
          }

          return (
            <div
              key={item.id}
              onClick={() => setFocused(isFocused ? null : item.id)}
              style={{
                position: 'absolute',
                left: x - 50,
                top: above ? '15%' : undefined,
                bottom: above ? undefined : '15%',
                width: isFocused ? 150 : 100,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                zIndex: isFocused ? 10 : 1,
              }}
            >
              {/* Connector line */}
              <div style={{
                position: 'absolute',
                left: 50,
                [above ? 'bottom' : 'top']: '100%',
                width: '0.5px',
                height: 24,
                background: bg,
                opacity: 0.4,
              }} />

              {/* Bubble */}
              <div
                style={{
                  background: bg,
                  borderRadius: 8,
                  padding: isFocused ? '10px 12px' : '7px 10px',
                  color: '#fff',
                  transform: isFocused ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isFocused ? '0 6px 20px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.10)',
                  transition: 'all 0.25s',
                }}
              >
                <p style={{ fontSize: 9, opacity: 0.7, marginBottom: 2, letterSpacing: '0.05em' }}>
                  {format(new Date(item.time?.toDate ? item.time.toDate() : item.time), 'hh:mm a')}
                </p>
                <p style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3 }}>
                  {item.title}
                </p>
                {isFocused && (
                  <>
                    <p style={{ fontSize: 10, opacity: 0.75, marginTop: 3 }}>{item.subtitle}</p>
                    {item.badge && (
                      <span style={{ display: 'inline-block', marginTop: 5, fontSize: 9, background: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: 10 }}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}