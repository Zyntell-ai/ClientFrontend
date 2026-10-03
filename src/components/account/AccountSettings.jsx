/**
 * @file        AccountSettings.jsx
 * @module      Settings / Account
 * @description Account information (from GET /api/auth/me — the authenticated business) and Change Password
 *              (POST /api/auth/change-password — the backend verifies the current password and hashes the new one).
 *              Passwords live only in this component's state while typing and are cleared after every attempt;
 *              they are never stored in the auth store, localStorage or sessionStorage.
 */
import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/index'
import { useAuthStore } from '../../store/authStore'
import { Card, Input, Button, Alert, Spinner } from '../ui/index'
import { accountFields, validatePasswordChange, passwordChangeErrorMessage } from '../../utils/account'

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' }

/** Password input with a show/hide toggle */
function PasswordField({ label, value, onChange, error, show, onToggle, autoComplete }) {
  return (
    <div className="relative">
      <Input label={label} type={show ? 'text' : 'password'} value={value} error={error}
        autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} className="pr-10" />
      <button type="button" onClick={onToggle} aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default function AccountSettings() {
  const { data: business, isLoading, isError, refetch } = useQuery({
    queryKey: ['account-me'],
    queryFn: authApi.me,
    select: (r) => r.data.business,
  })

  const [form, setForm] = useState(EMPTY)
  const [show, setShow] = useState({ currentPassword: false, newPassword: false, confirmPassword: false })
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  const changeMutation = useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: (res) => {
      // Keep this session signed in with the fresh token (older sessions are signed out by the backend)
      const { business: current, setAuth } = useAuthStore.getState()
      if (res.data?.token) setAuth(res.data.token, current)
      setForm(EMPTY)
      setErrors({})
      setDone(true)
      toast.success('Password changed')
    },
    onError: (err) => {
      setErrors(passwordChangeErrorMessage(err))
      setForm((f) => ({ ...f, currentPassword: '' }))
    },
  })

  const set = (key) => (value) => { setForm((f) => ({ ...f, [key]: value })); setDone(false) }
  const toggle = (key) => () => setShow((s) => ({ ...s, [key]: !s[key] }))

  const submit = (e) => {
    e.preventDefault()
    const v = validatePasswordChange(form)
    setErrors(v)
    if (Object.keys(v).length) return
    changeMutation.mutate(form)
  }

  const rows = accountFields(business)

  return (
    <div className="space-y-6">
      <Card title="Account Information">
        {isLoading ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : isError ? (
          <Alert type="error">
            We couldn't load your account details.{' '}
            <button className="underline font-semibold" onClick={() => refetch()}>Try again</button>
          </Alert>
        ) : (
          <dl className="divide-y divide-violet-50">
            {rows.map((r) => (
              <div key={r.key} className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-slate-500">{r.label}</dt>
                <dd className="font-medium text-[#1E1B4B] text-right">{r.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {!isLoading && !isError && rows.some((r) => r.key === 'email') && (
          <p className="text-xs text-slate-400 mt-3">Your email is your sign-in ID and can't be changed here. Contact support to change it.</p>
        )}
      </Card>

      <Card title="Security">
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1E1B4B]">
            <KeyRound className="w-4 h-4" /> Change Password
          </div>
          {done && <Alert type="success">Your password was changed. Other devices have been signed out.</Alert>}
          {errors.general && <Alert type="error">{errors.general}</Alert>}
          <PasswordField label="Current password" value={form.currentPassword} onChange={set('currentPassword')}
            error={errors.currentPassword} show={show.currentPassword} onToggle={toggle('currentPassword')} autoComplete="current-password" />
          <PasswordField label="New password" value={form.newPassword} onChange={set('newPassword')}
            error={errors.newPassword} show={show.newPassword} onToggle={toggle('newPassword')} autoComplete="new-password" />
          <PasswordField label="Confirm new password" value={form.confirmPassword} onChange={set('confirmPassword')}
            error={errors.confirmPassword} show={show.confirmPassword} onToggle={toggle('confirmPassword')} autoComplete="new-password" />
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> At least 8 characters, with a letter and a number.
          </p>
          <Button type="submit" className="w-full" loading={changeMutation.isPending} disabled={changeMutation.isPending}>
            Change Password
          </Button>
        </form>
      </Card>
    </div>
  )
}
