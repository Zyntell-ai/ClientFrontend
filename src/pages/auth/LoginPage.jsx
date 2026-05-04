// src/pages/auth/LoginPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth.api'
import { Button, Input, Alert } from '../../components/ui/index'
import { Zap, ArrowRight, Eye, EyeOff, BarChart2, Target, Bot } from 'lucide-react'

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

const fadeIn = {
  hidden: { opacity: 0 },
  show: (i = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.12, duration: 0.6, ease: 'easeOut' },
  }),
}

const features = [
  { icon: Bot,       title: 'AI-Powered WhatsApp Bot',  desc: 'Handles bookings, queries & lead capture 24/7'     },
  { icon: BarChart2, title: 'Real-time Analytics',      desc: 'Booking rates, customer insights, revenue tracking' },
  { icon: Target,    title: 'Smart Lead Engine',        desc: 'Exclusive leads + auction system for your category' },
]

/* ════════════════════════════════════════════════
   PARTICLE CONSTELLATION CANVAS
   • Particles drift and softly bounce off edges
   • Constellation lines form between nearby particles
   • Every particle is magnetically attracted to cursor
   • Bright threads connect particles to the cursor
   • Radial glow aura follows cursor
   Uses refs for mouse — zero re-renders on mousemove
════════════════════════════════════════════════ */
function ParticleCanvas({ count = 52, pColor, lColor, glowRgb, mouseRef }) {
  const canvasRef    = useRef(null)
  const particlesRef = useRef([])
  const rafRef       = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const init = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      particlesRef.current = Array.from({ length: count }, () => ({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r:  Math.random() * 1.6 + 0.5,
        o:  Math.random() * 0.38 + 0.1,
      }))
    }

    init()
    const onResize = () => init()
    window.addEventListener('resize', onResize)

    const loop = () => {
      const W  = canvas.width
      const H  = canvas.height
      const { x: mx, y: my } = mouseRef.current
      const ACTIVE = mx >= 0 && my >= 0

      ctx.clearRect(0, 0, W, H)

      const pts = particlesRef.current

      /* ── 1. Physics update ── */
      pts.forEach(p => {
        /* gentle attraction toward cursor */
        if (ACTIVE) {
          const dx = mx - p.x
          const dy = my - p.y
          const d  = Math.hypot(dx, dy)
          if (d < 190 && d > 0) {
            const f = ((190 - d) / 190) * 0.018
            p.vx += (dx / d) * f
            p.vy += (dy / d) * f
          }
        }
        /* dampen */
        p.vx *= 0.988
        p.vy *= 0.988
        /* speed cap */
        const spd = Math.hypot(p.vx, p.vy)
        if (spd > 1.8) { p.vx = (p.vx / spd) * 1.8; p.vy = (p.vy / spd) * 1.8 }
        /* move */
        p.x += p.vx
        p.y += p.vy
        /* bounce */
        if (p.x < 0) { p.x = 0; p.vx =  Math.abs(p.vx) }
        if (p.x > W) { p.x = W; p.vx = -Math.abs(p.vx) }
        if (p.y < 0) { p.y = 0; p.vy =  Math.abs(p.vy) }
        if (p.y > H) { p.y = H; p.vy = -Math.abs(p.vy) }
      })

      /* ── 2. Particle → particle constellation lines ── */
      const PLINK = 130
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d2 = dx * dx + dy * dy
          if (d2 < PLINK * PLINK) {
            const d = Math.sqrt(d2)
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = lColor
            ctx.globalAlpha = (1 - d / PLINK) * 0.20
            ctx.lineWidth   = 0.55
            ctx.stroke()
          }
        }
      }

      /* ── 3. Particle → cursor threads ── */
      if (ACTIVE) {
        const CLINK = 165
        pts.forEach(p => {
          const d = Math.hypot(p.x - mx, p.y - my)
          if (d < CLINK) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(mx, my)
            ctx.strokeStyle = lColor
            ctx.globalAlpha = (1 - d / CLINK) * 0.50
            ctx.lineWidth   = 0.65
            ctx.stroke()
          }
        })
      }

      /* ── 4. Draw particle dots ── */
      pts.forEach(p => {
        let op = p.o
        if (ACTIVE) {
          const d = Math.hypot(p.x - mx, p.y - my)
          if (d < 110) op = Math.min(1, op + (1 - d / 110) * 0.58)
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle   = pColor
        ctx.globalAlpha = op
        ctx.fill()
      })

      /* ── 5. Cursor aura + dot ── */
      if (ACTIVE) {
        /* outer soft glow */
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 96)
        grd.addColorStop(0, `rgba(${glowRgb},0.13)`)
        grd.addColorStop(1, `rgba(${glowRgb},0)`)
        ctx.beginPath()
        ctx.arc(mx, my, 96, 0, Math.PI * 2)
        ctx.fillStyle   = grd
        ctx.globalAlpha = 1
        ctx.fill()

        /* cursor ring */
        ctx.beginPath()
        ctx.arc(mx, my, 5, 0, Math.PI * 2)
        ctx.strokeStyle = pColor
        ctx.globalAlpha = 0.35
        ctx.lineWidth   = 1
        ctx.stroke()

        /* cursor core */
        ctx.beginPath()
        ctx.arc(mx, my, 2.2, 0, Math.PI * 2)
        ctx.fillStyle   = pColor
        ctx.globalAlpha = 0.80
        ctx.fill()
      }

      ctx.globalAlpha = 1
      rafRef.current  = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [count, pColor, lColor, glowRgb, mouseRef])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      className="pointer-events-none"
    />
  )
}

/* ════════════════════════════════════════════════
   LOGIN PAGE
════════════════════════════════════════════════ */
export default function LoginPage() {
  const navigate    = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
  const [error,  setError]  = useState('')

  /* ── Mouse refs (no re-render on move) ── */
  const leftMouseRef  = useRef({ x: -999, y: -999 })
  const rightMouseRef = useRef({ x: -999, y: -999 })
  const leftPanelRef  = useRef(null)
  const rightPanelRef = useRef(null)

  /* ── Form card 3-D tilt ── */
  const tiltX = useSpring(useMotionValue(0), { stiffness: 75, damping: 16 })
  const tiltY = useSpring(useMotionValue(0), { stiffness: 75, damping: 16 })

  const handleLeftMove = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect()
    leftMouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
  }, [])

  const handleLeftLeave = useCallback(() => {
    leftMouseRef.current = { x: -999, y: -999 }
  }, [])

  const handleRightMove = useCallback((e) => {
    if (!rightPanelRef.current) return
    const r = rightPanelRef.current.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    rightMouseRef.current = { x, y }
    tiltY.set(((x - r.width  / 2) / (r.width  / 2)) * 3.5)
    tiltX.set((-(y - r.height / 2) / (r.height / 2)) * 3.5)
  }, [tiltX, tiltY])

  const handleRightLeave = useCallback(() => {
    rightMouseRef.current = { x: -999, y: -999 }
    tiltX.set(0)
    tiltY.set(0)
  }, [tiltX, tiltY])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setError('')
    try {
      const res = await authApi.login(data)
      const { token, business } = res.data
      setAuth(token, business)
      toast.success(`Welcome back, ${business.name}!`)
      if (!business.setupCompleted) navigate('/onboarding')
      else navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    }
  }

  return (
    <div
      className="min-h-screen bg-[#FAFAF8] flex overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle at 15% 25%, rgba(124,58,237,0.06) 0%, transparent 45%), ' +
          'radial-gradient(circle at 85% 75%, rgba(192,38,211,0.04) 0%, transparent 40%)',
      }}
    >

      {/* ═══════════════════════════════════════
          LEFT PANEL  — dark gradient + white constellation
      ═══════════════════════════════════════ */}
      <motion.div
        ref={leftPanelRef}
        onMouseMove={handleLeftMove}
        onMouseLeave={handleLeftLeave}
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0,   opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col justify-between w-[44%] p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 40%, #9333EA 70%, #C026D3 100%)',
        }}
      >
        {/* ── Canvas constellation ── */}
        <ParticleCanvas
          count={55}
          pColor="rgba(255,255,255,0.88)"
          lColor="rgba(255,255,255,0.75)"
          glowRgb="255,255,255"
          mouseRef={leftMouseRef}
        />

        {/* ── Slow ambient blobs (beneath content) ── */}
        <motion.div
          animate={{ scale: [1, 1.09, 1], opacity: [0.40, 0.62, 0.40] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
            transform: 'translate(40%, -40%)',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.14, 1], opacity: [0.30, 0.55, 0.30] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,0,0,0.12) 0%, transparent 70%)',
            transform: 'translate(-35%, 35%)',
          }}
        />

        {/* ── Logo ── */}
        <motion.div
          variants={fadeIn} initial="hidden" animate="show" custom={1}
          className="relative z-10 flex items-center gap-3"
        >
          <motion.div
            whileHover={{ rotate: 12, scale: 1.12 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <Zap className="w-5 h-5 text-white" />
          </motion.div>
          <span className="font-display font-bold text-white text-lg tracking-tight">Zyntell</span>
        </motion.div>

        {/* ── Headline + features ── */}
        <div className="relative z-10">
          <motion.h2
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="font-display text-4xl font-bold text-white leading-tight mb-4"
          >
            Your AI bot is
            <br />
            <motion.span
              variants={fadeUp} initial="hidden" animate="show" custom={2}
              className="text-white/65"
            >
              ready to work.
            </motion.span>
          </motion.h2>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="text-white/65 text-[15px] leading-relaxed"
          >
            Manage bookings, leads, customers and your AI bot — all from one powerful dashboard.
          </motion.p>

          <div className="mt-10 space-y-3">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                variants={fadeUp} initial="hidden" animate="show" custom={4 + i}
                whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.16)' }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/10 border border-white/12 cursor-default"
              >
                <div className="mt-0.5 w-7 h-7 rounded-lg bg-white/14 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-snug">{title}</p>
                  <p className="text-xs text-white/55 mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          variants={fadeIn} initial="hidden" animate="show" custom={8}
          className="text-xs text-white/28 relative z-10"
        >
          © 2025 Zyntell. All rights reserved.
        </motion.p>
      </motion.div>

      {/* ═══════════════════════════════════════
          RIGHT PANEL  — light bg + violet constellation + tilting form
      ═══════════════════════════════════════ */}
      <div
        ref={rightPanelRef}
        onMouseMove={handleRightMove}
        onMouseLeave={handleRightLeave}
        className="flex-1 flex items-center justify-center p-8 relative overflow-hidden"
      >
        {/* ── Canvas constellation ── */}
        <ParticleCanvas
          count={44}
          pColor="rgba(124,58,237,0.80)"
          lColor="rgba(124,58,237,0.70)"
          glowRgb="124,58,237"
          mouseRef={rightMouseRef}
        />

        {/* ── Tilting form card ── */}
        <motion.div
          style={{
            rotateX: tiltX,
            rotateY: tiltY,
            transformPerspective: 1400,
            transformStyle: 'preserve-3d',
          }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2.5 mb-8 lg:hidden"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-[0_4px_12px_rgba(124,58,237,0.35)]">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-[#1E1B4B]">Zyntell</span>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="font-display text-2xl font-bold text-[#1E1B4B] mb-1"
          >
            Welcome back
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="text-slate-500 text-sm mb-7"
          >
            Sign in to your business dashboard
          </motion.p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.28 }}
                className="mb-5 overflow-hidden"
              >
                <Alert type="error">{error}</Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
              <Input
                label="Email"
                type="email"
                placeholder="you@business.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </motion.div>

            {/* Password */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="show" custom={4}
              className="flex flex-col gap-1.5"
            >
              <label className="text-xs font-semibold text-violet-600 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  {...register('password')}
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.82 }}
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-700 transition-colors"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={showPw ? 'hide' : 'show'}
                      initial={{ opacity: 0, rotate: -18, scale: 0.65 }}
                      animate={{ opacity: 1, rotate: 0,   scale: 1    }}
                      exit={{   opacity: 0, rotate:  18, scale: 0.65 }}
                      transition={{ duration: 0.18 }}
                      className="block"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    key="pw-err"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="text-xs text-rose-500"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}>
              <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.975 }}>
                <Button type="submit" className="w-full mt-2" loading={isSubmitting} size="lg">
                  Sign in <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>

          </form>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={6}
            className="text-center text-sm text-slate-500 mt-6"
          >
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-violet-600 hover:text-violet-800 font-semibold transition-colors"
            >
              Start free trial
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}