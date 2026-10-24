/**
 * @file        ApplicationStatusPage.jsx
 * @module      Auth / Application status
 * @description Shown to a business whose signup application is under review (pending_review) or was not approved
 *              (rejected). It only reads the account's own status (GET /api/auth/me — the one endpoint those accounts
 *              may use); the backend refuses every product endpoint until an admin approves the application.
 *              "Check status" refreshes the profile — once approved, the route guards move the user to the product.
 *
 * @dependencies
 *   - ../../store/authStore (business, updateBusiness, logout)
 *   - ../../api/auth.api   (authApi.me)
 *   - ../../utils/approval (approvalStatusOf, APPROVAL)
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Clock, XCircle, RefreshCw, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth.api'
import { Button, Alert } from '../../components/ui/index'
import { approvalStatusOf, APPROVAL } from '../../utils/approval'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || ''

/**
 * @function    ApplicationStatusPage
 * @purpose     Under-review / not-approved screen with a status refresh and logout
 * @returns {JSX.Element}
 */
export default function ApplicationStatusPage() {
  const { business, updateBusiness, logout } = useAuthStore()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const status = approvalStatusOf(business)
  const rejected = status === APPROVAL.REJECTED

  // [API CALL]: GET /api/auth/me — if the application was approved meanwhile, the route guards redirect
  const checkStatus = async () => {
    setChecking(true)
    setError('')
    try {
      const res = await authApi.me()
      updateBusiness(res.data.business)
      if (approvalStatusOf(res.data.business) === APPROVAL.APPROVED) toast.success('Your application was approved! 🎉')
      else toast('Your application is still being reviewed.', { icon: '⏳' })
    } catch (err) {
      setError(err.response?.data?.error || 'Could not check the status. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  const signOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-navy-950 bg-grid-pattern bg-grid flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <img src="/logo.png" alt="Zyntell" className="w-8 h-8 object-contain" />
          <span className="font-display font-bold text-slate-100">Zyntell</span>
        </div>

        <div className="glass-card gradient-border p-7">
          {error && <div className="mb-5"><Alert type="error">{error}</Alert></div>}

          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-5 ${rejected ? 'bg-red-500/15 text-red-400' : 'bg-brand-blue/15 text-brand-blue'}`}>
            {rejected ? <XCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>

          {rejected ? (
            <>
              <h2 className="font-display text-xl font-bold text-slate-100 mb-2">Application not approved</h2>
              <p className="text-slate-400 text-sm mb-4">
                We reviewed the application for <span className="text-slate-200 font-medium">{business?.name}</span> and
                could not approve it at this time.
              </p>
              {business?.rejectionReason && (
                <div className="mb-4 rounded-lg border border-navy-400/30 bg-navy-800/60 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Reason</p>
                  <p className="text-sm text-slate-300 whitespace-pre-line">{business.rejectionReason}</p>
                </div>
              )}
              <p className="text-slate-400 text-sm mb-6">
                Next step: contact Zyntell support
                {SUPPORT_EMAIL ? <> at <a className="text-brand-blue hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></> : ''} to
                discuss your application — please mention your registered email ({business?.email}).
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold text-slate-100 mb-2">Application under review</h2>
              <p className="text-slate-400 text-sm mb-4">
                Thanks for setting up <span className="text-slate-200 font-medium">{business?.name}</span>! Our team is
                reviewing your application.
              </p>
              <p className="text-slate-400 text-sm mb-6">
                You will get access to your dashboard and your free trial once it is approved — the trial starts
                from the day of approval, so you do not lose any trial days while you wait.
              </p>
            </>
          )}

          <div className="flex flex-wrap gap-3">
            {!rejected && (
              <Button onClick={checkStatus} loading={checking}>
                {!checking && <RefreshCw className="w-4 h-4" />} Check status
              </Button>
            )}
            <Button variant="secondary" onClick={signOut}>
              <LogOut className="w-4 h-4" /> Log out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
