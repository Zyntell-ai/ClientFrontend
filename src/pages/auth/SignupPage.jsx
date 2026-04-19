// src/pages/auth/SignupPage.jsx
// Dynamic signup — fetches categories from backend, adapts form fields per category
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth.api'
import { categoriesApi } from '../../api/index'
import { Button, Input, Alert, Spinner } from '../../components/ui/index'
import { Zap, ArrowRight, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// Fallback categories (matches backend's registerSchema enum)
const FALLBACK_CATEGORIES = [
  { id: 'healthcare', label: 'Healthcare', icon: '🏥', subCategories: [
    { id: 'general', label: 'General Practice' }, { id: 'dental', label: 'Dental' },
    { id: 'dermatology', label: 'Dermatology' }, { id: 'ortho', label: 'Orthopaedic' },
    { id: 'eye', label: 'Eye Care' }, { id: 'physio', label: 'Physiotherapy' },
  ]},
  { id: 'realestate', label: 'Real Estate', icon: '🏠', subCategories: [
    { id: 'residential', label: 'Residential' }, { id: 'commercial', label: 'Commercial' },
    { id: 'rental', label: 'Rental' }, { id: 'plots', label: 'Plots' }, { id: 'pg', label: 'PG / Hostel' },
  ]},
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️', subCategories: [
    { id: 'dinein', label: 'Dine-in' }, { id: 'cafe', label: 'Cafe' },
    { id: 'cloudkitchen', label: 'Cloud Kitchen' }, { id: 'catering', label: 'Catering' },
  ]},
  { id: 'salon', label: 'Salon & Spa', icon: '💇', subCategories: [
    { id: 'hair', label: 'Hair Salon' }, { id: 'spa', label: 'Spa' },
    { id: 'nails', label: 'Nail Studio' }, { id: 'beauty', label: 'Beauty Parlour' },
  ]},
  { id: 'coaching', label: 'Coaching', icon: '📚', subCategories: [
    { id: 'academic', label: 'Academic' }, { id: 'competitive', label: 'Competitive Exams' },
    { id: 'music', label: 'Music & Arts' }, { id: 'fitness', label: 'Fitness' },
  ]},
  { id: 'insurance', label: 'Insurance', icon: '🛡️', subCategories: [
    { id: 'life', label: 'Life Insurance' }, { id: 'health', label: 'Health Insurance' },
    { id: 'motor', label: 'Motor Insurance' }, { id: 'property', label: 'Property Insurance' },
  ]},
  { id: 'auto', label: 'Auto Service', icon: '🚗', subCategories: [
    { id: 'workshop', label: 'Workshop' }, { id: 'detailing', label: 'Detailing' },
    { id: 'tyres', label: 'Tyres & Wheels' }, { id: 'electrical', label: 'Auto Electrical' },
  ]},
  { id: 'homeservice', label: 'Home Services', icon: '🔧', subCategories: [
    { id: 'plumbing', label: 'Plumbing' }, { id: 'electrical', label: 'Electrical' },
    { id: 'cleaning', label: 'Cleaning' }, { id: 'ac', label: 'AC Service' },
  ]},
]

// Category-specific extra questions for the form
const CATEGORY_QUESTIONS = {
  healthcare: [
    { id: 'city', label: 'City', placeholder: 'e.g., Hyderabad', required: true },
    { id: 'locality', label: 'Locality / Area', placeholder: 'e.g., Banjara Hills', required: false },
    { id: 'phone', label: 'Clinic Phone Number', placeholder: '+91 98765 43210', required: false },
  ],
  realestate: [
    { id: 'city', label: 'Operating City', placeholder: 'e.g., Hyderabad', required: true },
    { id: 'locality', label: 'Primary Area', placeholder: 'e.g., Gachibowli', required: false },
    { id: 'phone', label: 'Business Phone', placeholder: '+91 98765 43210', required: false },
  ],
  restaurant: [
    { id: 'city', label: 'City', placeholder: 'e.g., Hyderabad', required: true },
    { id: 'locality', label: 'Area / Location', placeholder: 'e.g., Jubilee Hills', required: false },
    { id: 'phone', label: 'Restaurant Phone', placeholder: '+91 98765 43210', required: false },
  ],
  default: [
    { id: 'city', label: 'City', placeholder: 'e.g., Hyderabad', required: true },
    { id: 'locality', label: 'Area / Locality', placeholder: 'e.g., Your area', required: false },
    { id: 'phone', label: 'Business Phone', placeholder: '+91 98765 43210', required: false },
  ],
}

const STEPS = ['Category', 'Business Details', 'Account']

export default function SignupPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [step, setStep] = useState(0) // 0: category, 1: business details, 2: account
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [loadingCats, setLoadingCats] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  // Form state
  const [form, setForm] = useState({
    category: '', subCategory: '',
    name: '', city: '', locality: '', phone: '',
    email: '', password: '',
  })

  // Fetch categories from backend (GET /api/categories — public endpoint)
  useEffect(() => {
    categoriesApi.list()
      .then((res) => {
        if (res.data?.categories?.length) setCategories(res.data.categories)
      })
      .catch(() => {}) // Use fallback silently
      .finally(() => setLoadingCats(false))
  }, [])

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const selectedCategory = categories.find(c => c.id === form.category)
  const extraQuestions = CATEGORY_QUESTIONS[form.category] || CATEGORY_QUESTIONS.default

  const validateStep = () => {
    if (step === 0) {
      if (!form.category) { setError('Please select your business category'); return false }
      if (!form.subCategory) { setError('Please select a sub-category'); return false }
    }
    if (step === 1) {
      if (!form.name?.trim()) { setError('Business name is required'); return false }
      if (!form.city?.trim()) { setError('City is required'); return false }
    }
    if (step === 2) {
      if (!form.email?.trim()) { setError('Email is required'); return false }
      if (!form.password || form.password.length < 8) { setError('Password must be at least 8 characters'); return false }
    }
    setError('')
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setLoading(true)
    setError('')
    try {
      const res = await authApi.register(form)
      const { token, business } = res.data
      setAuth(token, business)
      toast.success('Account created! Let\'s set up your bot 🚀')
      navigate('/onboarding')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 bg-grid-pattern bg-grid flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-slate-100">Zyntell</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, idx) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <div className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300',
                  idx < step ? 'bg-brand-blue border-brand-blue text-white'
                    : idx === step ? 'bg-navy-600 border-brand-blue text-brand-blue'
                      : 'bg-navy-700 border-navy-400/40 text-slate-600'
                )}>
                  {idx < step ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span className={clsx('text-xs font-medium hidden sm:block', idx === step ? 'text-slate-300' : 'text-slate-600')}>{label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={clsx('flex-1 h-px transition-all duration-300', idx < step ? 'bg-brand-blue/50' : 'bg-navy-400/30')} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card gradient-border p-7">
          {error && <div className="mb-5"><Alert type="error">{error}</Alert></div>}

          {/* Step 0 — Category selection */}
          {step === 0 && (
            <div>
              <h2 className="font-display text-xl font-bold text-slate-100 mb-1">What's your business?</h2>
              <p className="text-slate-500 text-sm mb-6">Your bot will be customized for your industry</p>

              {loadingCats ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { update('category', cat.id); update('subCategory', '') }}
                      className={clsx(
                        'flex flex-col items-start gap-1 p-3.5 rounded-xl border text-left transition-all duration-200',
                        form.category === cat.id
                          ? 'border-brand-blue bg-brand-blue/10 shadow-glow'
                          : 'border-navy-400/30 bg-navy-600/30 hover:border-navy-400/60 hover:bg-navy-600/50'
                      )}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className={clsx('text-sm font-semibold', form.category === cat.id ? 'text-brand-blue-light' : 'text-slate-300')}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Sub-category (shown after category selection) */}
              {form.category && selectedCategory && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Sub-category</p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedCategory.subCategories || []).map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => update('subCategory', sub.id)}
                        className={clsx(
                          'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                          form.subCategory === sub.id
                            ? 'bg-brand-blue border-brand-blue text-white'
                            : 'border-navy-400/40 text-slate-400 hover:border-navy-400/70 hover:text-slate-300'
                        )}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1 — Business details (dynamic per category) */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-xl font-bold text-slate-100 mb-1">Business details</h2>
              <p className="text-slate-500 text-sm mb-6">
                Tell us about your {selectedCategory?.label || 'business'}
              </p>

              <div className="space-y-4">
                <Input
                  label={`${selectedCategory?.label || 'Business'} Name`}
                  placeholder={`e.g., ${
                    form.category === 'healthcare' ? 'Dr. Kumar Clinic' :
                    form.category === 'restaurant' ? 'Spice Garden Restaurant' :
                    form.category === 'salon' ? 'Glamour Studio' :
                    form.category === 'realestate' ? 'Prime Properties' :
                    'Your Business Name'
                  }`}
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                />
                {extraQuestions.map((q) => (
                  <Input
                    key={q.id}
                    label={q.label + (q.required ? '' : ' (optional)')}
                    placeholder={q.placeholder}
                    value={form[q.id] || ''}
                    onChange={e => update(q.id, e.target.value)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Account credentials */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-xl font-bold text-slate-100 mb-1">Create your account</h2>
              <p className="text-slate-500 text-sm mb-6">You'll use these to sign in</p>

              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@business.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      className="input-field pr-10"
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPw(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="flex gap-1 mt-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={clsx('h-1 flex-1 rounded-full transition-all',
                          form.password.length > i * 2 + 2 ? 'bg-brand-blue' : 'bg-navy-500'
                        )} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Trial info */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3.5 mt-2">
                  <p className="text-xs text-green-400 font-semibold">🎉 14-day free trial included</p>
                  <p className="text-xs text-green-400/70 mt-0.5">50 bot conversations · No credit card needed</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center gap-3 mt-7">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(s => s - 1)}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            )}
            <Button
              className="flex-1"
              onClick={step === 2 ? handleSubmit : handleNext}
              loading={loading}
            >
              {step === 2 ? 'Create Account' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-blue hover:text-brand-blue-light font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
