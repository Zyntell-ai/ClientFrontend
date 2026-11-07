/**
 * @file        CallsPage.jsx
 * @module      Call Management
 * @project     ClientFrontend
 * @layer       Page
 * @description The business's inbound / AI-handled calls (Exotel) and its assigned virtual number. Data comes only
 *              from GET /api/calls, scoped to this business by the backend. Only reported facts are shown; a missing
 *              duration or status stays "—". Call recordings are not available in the dashboard (admin investigation
 *              only), and no transcript is shown.
 */
import React, { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PhoneCall, PhoneIncoming, PhoneMissed, Bot, RefreshCw } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, Spinner, Alert, Badge, Button, EmptyState } from '../../components/ui/index'
import { callsApi } from '../../api/index'
import { fmt } from '../../utils/index'
import {
  CALL_OUTCOME_META, MISSED_REASON_LABEL, RANGE_PRESETS, formatCallDuration, callReference, presetRange,
  mergeCallPages, assignedNumberLabel,
} from '../../utils/calls'

const PAGE_SIZE = 25

/** One call — a stacked card on phones, a row on wider screens */
function CallRow({ call }) {
  const meta = CALL_OUTCOME_META[call.outcome] || CALL_OUTCOME_META.UNKNOWN
  const Icon = call.outcome === 'MISSED' ? PhoneMissed : PhoneIncoming
  return (
    <li className="py-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4" style={{ borderBottom: '0.5px solid var(--mp-card-border)' }}>
      <div className="flex items-center gap-3 sm:w-56 shrink-0">
        <Icon className="w-4 h-4 shrink-0" style={{ color: 'var(--mp-accent)' }} />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--mp-text)' }}>{fmt.phone(call.callerPhone)}</p>
          <p className="text-[11px]" style={{ color: 'var(--mp-text)', opacity: 0.55 }}>{fmt.datetime(call.startedAt)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap text-xs flex-1" style={{ color: 'var(--mp-text)', opacity: 0.75 }}>
        <Badge color={meta.color}>{meta.label}</Badge>
        {call.aiHandled && <span className="inline-flex items-center gap-1"><Bot className="w-3.5 h-3.5" /> AI receptionist</span>}
        {call.outcome === 'MISSED' && call.missedReason && <span>{MISSED_REASON_LABEL[call.missedReason] || call.missedReason}</span>}
        {call.whatsappFollowUpSent && <span>WhatsApp follow-up sent</span>}
      </div>
      <div className="flex items-center gap-4 text-xs sm:justify-end" style={{ color: 'var(--mp-text)', opacity: 0.6 }}>
        <span title="Duration reported by Exotel">{formatCallDuration(call.durationSeconds)}</span>
        <span className="capitalize">{call.direction || '—'}</span>
        <span title="Call reference">{callReference(call.callSid)}</span>
      </div>
    </li>
  )
}

export default function CallsPage() {
  const [preset, setPreset] = useState('30')
  const [range, setRange] = useState(() => presetRange(30))

  const query = useInfiniteQuery({
    queryKey: ['calls', range.from, range.to],
    queryFn: ({ pageParam }) => callsApi.list({ ...range, cursor: pageParam || undefined, limit: PAGE_SIZE }).then((r) => r.data),
    initialPageParam: null,
    getNextPageParam: (last) => last?.nextCursor || undefined,
  })
  const pages = query.data?.pages || []
  const calls = mergeCallPages(pages)
  const number = assignedNumberLabel(pages[0]?.assignedNumbers)
  const errorMessage = query.error?.response?.data?.error

  const choosePreset = (p) => { setPreset(p.key); setRange(presetRange(p.days)) }
  const setDay = (field) => (e) => { setPreset('custom'); setRange((r) => ({ ...r, [field]: e.target.value })) }

  return (
    <DashboardLayout title="Calls" subtitle="Calls to your Zyntell number — answered by your AI receptionist or your team">
      <Card className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <PhoneCall className="w-5 h-5" style={{ color: 'var(--mp-accent)' }} />
            <div>
              <p className="text-xs" style={{ color: 'var(--mp-text)', opacity: 0.6 }}>Your virtual number</p>
              {query.isLoading ? <p className="text-sm" style={{ color: 'var(--mp-text)' }}>…</p>
                : number ? <p className="text-base font-semibold" style={{ color: 'var(--mp-text)' }}>{number}</p>
                  : <p className="text-sm" style={{ color: 'var(--mp-text)' }}>No active number yet. <Link to="/numbers" style={{ color: 'var(--mp-accent)' }}>Request one →</Link></p>}
            </div>
          </div>
          <p className="text-[11px] max-w-sm" style={{ color: 'var(--mp-text)', opacity: 0.55 }}>
            Call recordings are not available in the dashboard.
          </p>
        </div>
      </Card>

      <div className="flex flex-col md:flex-row md:items-end gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          {RANGE_PRESETS.map((p) => (
            <Button key={p.key} size="sm" variant={preset === p.key ? 'primary' : 'secondary'} onClick={() => choosePreset(p)}>{p.label}</Button>
          ))}
        </div>
        <div className="flex gap-2 items-end">
          <label className="text-xs" style={{ color: 'var(--mp-text)' }}>From
            <input type="date" className="block mt-1 rounded-lg px-2 py-1.5 text-sm" style={{ border: '0.5px solid var(--mp-card-border)', background: 'transparent', color: 'var(--mp-text)' }}
              value={range.from} max={range.to} onChange={setDay('from')} />
          </label>
          <label className="text-xs" style={{ color: 'var(--mp-text)' }}>To
            <input type="date" className="block mt-1 rounded-lg px-2 py-1.5 text-sm" style={{ border: '0.5px solid var(--mp-card-border)', background: 'transparent', color: 'var(--mp-text)' }}
              value={range.to} min={range.from} onChange={setDay('to')} />
          </label>
        </div>
      </div>

      {query.isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : query.isError ? (
        <Card>
          <Alert type="error">{errorMessage || 'Calls could not be loaded.'}</Alert>
          <Button className="mt-4" variant="secondary" onClick={() => query.refetch()} loading={query.isFetching}><RefreshCw className="w-4 h-4" /> Try again</Button>
        </Card>
      ) : !calls.length ? (
        <Card>
          <EmptyState icon="📞" title="No calls in this period"
            description={number ? 'Calls to your Zyntell number will appear here.' : 'Once your Zyntell number is active, calls to it will appear here.'} />
        </Card>
      ) : (
        <Card title={`Calls (${calls.length}${query.hasNextPage ? '+' : ''})`}>
          <ul>{calls.map((c) => <CallRow key={c.id} call={c} />)}</ul>
          {query.hasNextPage && (
            <div className="flex justify-center mt-4">
              <Button variant="secondary" onClick={() => query.fetchNextPage()} loading={query.isFetchingNextPage}>Load more</Button>
            </div>
          )}
          <p className="text-[11px] mt-3" style={{ color: 'var(--mp-text)', opacity: 0.5 }}>
            Duration is shown only when Exotel reported it. Times are in your local time.
          </p>
        </Card>
      )}
    </DashboardLayout>
  )
}
