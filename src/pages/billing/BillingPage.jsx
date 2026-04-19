// src/pages/billing/BillingPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { billingApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Card, Badge, StatCard, Alert, Modal, Input } from '../../components/ui/index'
import { fmt } from '../../utils/index'
import { Receipt, CreditCard, DollarSign, Calendar, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PLANS = [
  { id: 'starter', name: 'Starter', price: 0, desc: '14-day trial — 50 conversations', features: ['50 bot conversations', 'WhatsApp bot', 'Basic analytics', 'Email support'] },
  { id: 'plus', name: 'Plus', price: 1500, desc: '₹1,500/month — most popular', features: ['Unlimited conversations', 'Voice bot included', 'Advanced analytics', 'Priority support', 'Lead marketplace access'] },
  { id: 'pro', name: 'Pro', price: 3000, desc: '₹3,000/month — full features', features: ['Everything in Plus', 'Multi-location', 'Custom bot persona', 'Dedicated account manager', 'API access', 'Custom integrations'] },
]

export default function BillingPage() {
  const [showPay, setShowPay] = useState(false)

  const { data: current, isLoading: cl } = useQuery({ queryKey: ['billing-current'], queryFn: billingApi.current, select: r => r.data })
  const { data: invoices, isLoading: il } = useQuery({ queryKey: ['billing-invoices'], queryFn: billingApi.invoices, select: r => r.data.invoices })

  const payMutation = useMutation({
    mutationFn: (d) => billingApi.pay(d),
    onSuccess: () => { toast.success('Payment initiated! You will receive a confirmation shortly.'); setShowPay(false) },
    onError: e => toast.error(e.response?.data?.error || 'Payment failed'),
  })

  return (
    <DashboardLayout title="Billing" subtitle="Plans, invoices & payments">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Current plan */}
        <div className="lg:col-span-2">
          <Card title="Current Plan">
            {cl ? null : current && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-display font-bold text-slate-100 capitalize">{current.plan?.toUpperCase()} Plan</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {current.plan === 'trial' ? 'Free trial — 50 conversations included' :
                        current.plan === 'plus' ? '₹1,500/month' : '₹3,000/month'}
                    </p>
                  </div>
                  <Badge color={current.plan === 'trial' ? 'amber' : current.plan === 'pro' ? 'purple' : 'blue'}>
                    {current.plan === 'trial' ? 'Trial' : current.plan === 'plus' ? 'Plus' : 'Pro'}
                  </Badge>
                </div>
                {current.invoice && (
                  <div className="border border-navy-400/30 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">Current Invoice</p>
                        <p className="text-xs text-slate-500 mt-0.5">{fmt.date(current.invoice.periodStart)} – {fmt.date(current.invoice.periodEnd)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-display font-bold text-amber-400">{fmt.currency(current.invoice.totalAmount)}</p>
                        <Badge color={current.invoice.status === 'PAID' ? 'green' : current.invoice.status === 'OVERDUE' ? 'red' : 'amber'}>
                          {current.invoice.status}
                        </Badge>
                      </div>
                    </div>
                    {current.invoice.status !== 'PAID' && (
                      <Button className="w-full mt-3" onClick={() => setShowPay(true)}>
                        <CreditCard className="w-4 h-4" /> Pay Now
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        <StatCard icon={<DollarSign className="w-5 h-5" />} label="Total Due" value={fmt.currency(current?.invoice?.totalAmount)} color="amber" />
      </div>

      {/* Plans upgrade section */}
      <div className="mb-8">
        <h3 className="font-display font-semibold text-slate-200 mb-4">Upgrade Your Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(({ id, name, price, desc, features }) => (
            <div key={id} className={clsx('glass-card p-5 border transition-all', id === 'plus' ? 'border-brand-blue/40 bg-brand-blue/5' : 'border-navy-400/30 hover:border-navy-400/50')}>
              {id === 'plus' && <div className="text-[10px] text-brand-blue font-bold uppercase tracking-wider mb-2">Most Popular</div>}
              <p className="font-display font-bold text-slate-100 text-lg">{name}</p>
              <p className="text-2xl font-display font-extrabold text-slate-100 mt-1">
                {price === 0 ? 'Free' : fmt.currency(price)}<span className="text-xs text-slate-500 font-400">{price > 0 ? '/mo' : ''}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4">{desc}</p>
              <ul className="space-y-1.5 mb-5">
                {features.map(f => <li key={f} className="text-xs text-slate-400 flex items-center gap-1.5"><span className="text-green-400">✓</span>{f}</li>)}
              </ul>
              <Button variant={id === 'plus' ? 'primary' : 'secondary'} className="w-full" size="sm" onClick={() => setShowPay(true)}>
                {id === 'trial' ? 'Current' : `Upgrade to ${name}`} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice history */}
      <Card title="Invoice History">
        {il ? null : !invoices?.length ? (
          <p className="text-slate-500 text-sm text-center py-6">No invoices yet</p>
        ) : (
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-navy-700/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-200">{fmt.date(inv.periodStart)} – {fmt.date(inv.periodEnd)}</p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">{inv.plan} plan</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-200">{fmt.currency(inv.totalAmount)}</p>
                  <Badge color={inv.status === 'PAID' ? 'green' : inv.status === 'OVERDUE' ? 'red' : 'amber'} className="text-[10px] mt-1">{inv.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showPay} onClose={() => setShowPay(false)} title="Complete Payment">
        <Alert type="info">Payment will be processed via Razorpay. You will be redirected to complete the transaction.</Alert>
        <div className="mt-4 space-y-3">
          <div className="bg-navy-700/40 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Plan Fee</span>
              <span className="text-slate-200">{fmt.currency(current?.invoice?.planFee || 0)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-slate-400">Commissions</span>
              <span className="text-slate-200">{fmt.currency(current?.invoice?.commissionTotal || 0)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-navy-400/30">
              <span className="text-slate-200">Total</span>
              <span className="text-amber-400">{fmt.currency(current?.invoice?.totalAmount || 0)}</span>
            </div>
          </div>
          <Button className="w-full" onClick={() => payMutation.mutate({ invoiceId: current?.invoice?.id })} loading={payMutation.isPending}>
            <CreditCard className="w-4 h-4" /> Pay {fmt.currency(current?.invoice?.totalAmount || 0)}
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
