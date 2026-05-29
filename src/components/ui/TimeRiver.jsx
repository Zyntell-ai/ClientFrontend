/**
 * @file        TimeRiver.jsx
 * @module      Time River
 * @project     ClientFrontend
 * @layer       Component
 * @description Horizontal drag-scrollable timeline visualization for daily bookings and leads, with "now" indicator, alternating lane bubbles, and focus-expand on click.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - react
 *   - date-fns (format, differenceInMinutes, startOfDay, addMinutes)
 *   - clsx
 *   - ../../utils/index (toDate)
 *
 * @sideEffects
 *   - Sets a 60-second interval to update the "now" line position
 *   - Reads current time via new Date() on mount and every minute
 */

/*
 * ╔══════════════════════════════════════════╗
 * ║           SDLC LIFECYCLE STATUS          ║
 * ╠══════════════════════════════════════════╣
 * ║ Planning     : ✅ Complete               ║
 * ║ Design       : ✅ Complete               ║
 * ║ Development  : ✅ Complete               ║
 * ║ Testing      : ⚠️  Partial              ║
 * ║ Deployment   : ✅ Complete               ║
 * ║ Maintenance  : 🔄 Active                ║
 * ╚══════════════════════════════════════════╝
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import React, { useRef, useState, useEffect, useCallback } from 'react'
import { format, differenceInMinutes, startOfDay, addMinutes } from 'date-fns'
import clsx from 'clsx'
import { toDate } from '../../utils/index'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

/**
 * @constant    HOUR_PX
 * @purpose     Pixel width representing one hour on the timeline
 */
const HOUR_PX = 120   // pixels per hour

/**
 * @constant    START_H
 * @purpose     Timeline start hour (7 AM)
 */
const START_H = 7     // 7 AM

/**
 * @constant    END_H
 * @purpose     Timeline end hour (10 PM)
 */
const END_H   = 22    // 10 PM

const TOTAL_H = END_H - START_H
const TOTAL_W = TOTAL_H * HOUR_PX + 120

// ─────────────────────────────────────────
// CORE LOGIC / HANDLER FUNCTIONS
// ─────────────────────────────────────────

/**
 * @function    timeToX
 * @purpose     Convert a Date object to a pixel X position on the timeline
 * @param  {Date} date - The date/time to convert
 * @returns {number} Pixel offset from the left edge of the timeline
 */
function timeToX(date) {
  const dayStart = startOfDay(date)
  dayStart.setHours(START_H)
  const mins = differenceInMinutes(date, dayStart)
  return Math.max(0, (mins / 60) * HOUR_PX + 60)
}

/**
 * @function    getNowX
 * @purpose     Get the current time's X position on the timeline
 * @returns {number} Pixel offset representing "now"
 */
function getNowX() {
  const now = new Date()
  return timeToX(now)
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

/**
 * @function    TimeRiver
 * @purpose     Renders a horizontally scrollable timeline with draggable items, "now" line, and expandable bubbles
 * @param  {Array}   props.items     - Array of timeline items (bookings or leads) with id, time, title, subtitle, badge, status/quality
 * @param  {string}  props.mode      - Display mode: "bookings" | "leads" (controls bubble colors)
 * @param  {string}  props.emptyText - Message displayed when items array is empty
 * @returns {JSX.Element} Scrollable timeline visualization or empty state
 */
export default function TimeRiver({ items = [], mode = 'bookings', emptyText = 'Nothing scheduled today' }) {
  // ─────────────────────────────────────────
  // STATE & HOOKS
  // ─────────────────────────────────────────
  const wrapRef   = useRef(null)
  // [STATE]: Track which bubble is currently focused/expanded
  const [focused, setFocused]   = useState(null)
  // [STATE]: Track the pixel position of the "now" line
  const [nowX, setNowX]         = useState(getNowX)
  const isDragging = useRef(false)
  const startX     = useRef(0)
  const scrollLeft = useRef(0)

  // Update "now" line every minute and scroll to current time on mount
  useEffect(() => {
    const t = setInterval(() => setNowX(getNowX()), 60000)
    // [STATE]: Scroll to current time position on initial render
    if (wrapRef.current) {
      wrapRef.current.scrollLeft = Math.max(0, getNowX() - 200)
    }
    return () => clearInterval(t)
  }, [])

  /**
   * @function    onMouseDown
   * @purpose     Initiate drag scroll on mouse press
   */
  const onMouseDown = useCallback(e => {
    isDragging.current = true
    startX.current     = e.pageX - (wrapRef.current?.offsetLeft || 0)
    scrollLeft.current = wrapRef.current?.scrollLeft || 0
    if (wrapRef.current) wrapRef.current.style.cursor = 'grabbing'
  }, [])

  /**
   * @function    onMouseMove
   * @purpose     Scroll the timeline container while dragging
   */
  const onMouseMove = useCallback(e => {
    if (!isDragging.current || !wrapRef.current) return
    e.preventDefault()
    const x    = e.pageX - wrapRef.current.offsetLeft
    const walk = (x - startX.current) * 1.4
    wrapRef.current.scrollLeft = scrollLeft.current - walk
  }, [])

  /**
   * @function    onMouseUp
   * @purpose     End drag scroll and restore default cursor
   */
  const onMouseUp = useCallback(() => {
    isDragging.current = false
    if (wrapRef.current) wrapRef.current.style.cursor = 'grab'
  }, [])

  // [GUARD]: Render empty state when no items are provided
  if (!items.length) {
    return (
      <div className="flex items-center justify-center py-10 text-sm" style={{ color: 'var(--mp-text)', opacity: 0.4 }}>
        {emptyText}
      </div>
    )
  }

  // [DATA TRANSFORM]: Assign vertical lanes (alternating above/below center line)
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
          const x = timeToX(toDate(item.time) || new Date())
          const above = item.lane === 'above'
          const isFocused = focused === item.id

          // [DATA TRANSFORM]: Urgency color for leads based on quality
          let bg = 'var(--mp-accent)'
          if (mode === 'leads') {
            if (item.quality === 'HOT')  bg = '#dc2626'
            else if (item.quality === 'WARM') bg = '#d97706'
            else bg = '#0369a1'
          }
          // [DATA TRANSFORM]: Status color for bookings based on booking status
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
                  {format(toDate(item.time) || new Date(), 'hh:mm a')}
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
