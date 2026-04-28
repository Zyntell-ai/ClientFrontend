// src/pages/auth/LoginPage.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth.api'
import { Button, Input, Alert } from '../../components/ui/index'
import { Zap, ArrowRight, Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export default function LoginPage() {
  const navigate    = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
  const [error,  setError]  = useState('')

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
      className="min-h-screen bg-[#FAFAF8] flex"
      style={{
        backgroundImage:
          'radial-gradient(circle at 15% 25%, rgba(124,58,237,0.06) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(192,38,211,0.04) 0%, transparent 40%)',
      }}
    >
      {/* Left panel — dark violet branding (text-white is fine here, dark bg) */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/3" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg">Zyntell</span>
        </div>

        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Your AI bot is<br />
            <span className="text-white/70">ready to work.</span>
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Manage bookings, leads, customers and your AI bot — all from one powerful dashboard.
          </p>

          <div className="mt-10 space-y-3">
            {[
              { icon: '🤖', title: 'AI-Powered WhatsApp Bot',  desc: 'Handles bookings, queries & lead capture 24/7'    },
              { icon: '📊', title: 'Real-time Analytics',      desc: 'Booking rates, customer insights, revenue tracking' },
              { icon: '🎯', title: 'Smart Lead Engine',        desc: 'Exclusive leads + auction system for your category' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3 rounded-xl bg-white/10 border border-white/15">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-white/60 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/30 relative z-10">© 2025 Zyntell. All rights reserved.</p>
      </div>

      {/* Right panel — light bg, dark text */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-[0_4px_12px_rgba(124,58,237,0.35)]">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-[#1E1B4B]">Zyntell</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-[#1E1B4B] mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-7">Sign in to your business dashboard</p>

          {error && <div className="mb-5"><Alert type="error">{error}</Alert></div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@business.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-violet-600 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-700 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-2" loading={isSubmitting} size="lg">
              Sign in <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-violet-600 hover:text-violet-800 font-semibold transition-colors">
              Start free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}