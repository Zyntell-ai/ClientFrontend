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
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

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
    <div className="min-h-screen bg-navy-950 bg-grid-pattern bg-grid flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] bg-navy-900/60 border-r border-navy-400/20 p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-slate-100 text-lg">Zyntell</span>
        </div>

        <div>
          <h2 className="font-display text-4xl font-extrabold text-slate-100 leading-tight mb-4">
            Your AI bot is<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              ready to work.
            </span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Manage bookings, leads, customers and your AI bot — all from one powerful dashboard.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: '🤖', title: 'AI-Powered WhatsApp Bot', desc: 'Handles bookings, queries & lead capture 24/7' },
              { icon: '📊', title: 'Real-time Analytics', desc: 'Booking rates, customer insights, revenue tracking' },
              { icon: '🎯', title: 'Smart Lead Engine', desc: 'Exclusive leads + auction system for your category' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3 rounded-lg bg-navy-600/30 border border-navy-400/20">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600">© 2025 Zyntell. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-slate-100">Zyntell</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-slate-100 mb-1">Welcome back</h1>
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
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Password</label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-2" loading={isSubmitting} size="lg">
              Sign in <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-blue hover:text-brand-blue-light font-medium transition-colors">
              Start free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
