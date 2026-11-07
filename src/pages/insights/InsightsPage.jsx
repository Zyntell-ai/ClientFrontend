/**
 * @file        InsightsPage.jsx
 * @module      Conversation Insights
 * @project     ClientFrontend
 * @layer       Page
 * @description What customers asked the AI receptionist (voice) and WhatsApp assistant in the last 30 days, with a
 *              conservative outcome per question, the voice/WhatsApp split, frequent questions, unanswered questions and
 *              knowledge gaps. Data comes only from GET /api/insights (scoped to this business by the backend). Only the
 *              question is shown — never the transcript or the AI's reply.
 */
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Lightbulb, MessageSquareText, Phone, RefreshCw } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, StatCard, Spinner, Alert, Badge, Button, EmptyState } from '../../components/ui/index'
import { insightsApi } from '../../api/index'
import { fmt } from '../../utils/index'
import { OUTCOME_ORDER, OUTCOME_META, CHANNEL_LABEL, percent, conversationLabel, isEmptySummary } from '../../utils/insights'

/** One question row: text, outcome, channel, when, and a short conversation reference */
function QuestionRow({ item }) {
  const meta = OUTCOME_META[item.outcome] || OUTCOME_META.UNCERTAIN
  return (
    <li className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3" style={{ borderBottom: '0.5px solid var(--mp-card-border)' }}>
      <p className="text-sm flex-1 break-words" style={{ color: 'var(--mp-text)' }}>{item.question}</p>
      <div className="flex items-center gap-2 flex-wrap text-[11px]" style={{ color: 'var(--mp-text)', opacity: 0.6 }}>
        <Badge color={meta.color}>{meta.label}</Badge>
        <span>{CHANNEL_LABEL[item.channel] || item.channel}</span>
        <span>{fmt.datetime(item.askedAt)}</span>
        <span>{conversationLabel(item.conversationRef)}</span>
      </div>
    </li>
  )
}

/** A grouped question (asked N times) with its outcome counts */
function GroupRow({ group }) {
  return (
    <li className="py-3" style={{ borderBottom: '0.5px solid var(--mp-card-border)' }}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm break-words" style={{ color: 'var(--mp-text)' }}>{group.question}</p>
        <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--mp-accent)' }}>×{group.count}</span>
      </div>
      <div className="flex gap-1.5 flex-wrap mt-1.5">
        {OUTCOME_ORDER.filter((o) => group.outcomes?.[o]).map((o) => (
          <Badge key={o} color={OUTCOME_META[o].color}>{OUTCOME_META[o].label} {group.outcomes[o]}</Badge>
        ))}
      </div>
    </li>
  )
}

function ListCard({ title, empty, children, count }) {
  return (
    <Card title={title}>
      {count ? <ul>{children}</ul> : <p className="text-sm py-4" style={{ color: 'var(--mp-text)', opacity: 0.55 }}>{empty}</p>}
    </Card>
  )
}

export default function InsightsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['conversation-insights'],
    queryFn: insightsApi.summary,
    select: (r) => r.data,
  })

  return (
    <DashboardLayout title="Conversation Insights" subtitle="What customers asked your AI on calls and WhatsApp — last 30 days">
      <Alert type="info" className="mb-5">
        Questions are kept for 30 days, then deleted automatically. Only the question is stored — never the full conversation.
        “Answered” is shown only when the answer came from your business data; everything the system cannot verify is marked “Not verified”.
      </Alert>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : isError ? (
        <Card>
          <Alert type="error">Conversation insights could not be loaded.</Alert>
          <Button className="mt-4" variant="secondary" onClick={() => refetch()} loading={isFetching}><RefreshCw className="w-4 h-4" /> Try again</Button>
        </Card>
      ) : isEmptySummary(data) ? (
        <Card>
          <EmptyState
            icon="💬"
            title="No questions captured yet"
            description="When customers ask your AI receptionist or WhatsApp assistant a question, it appears here — with whether it could be answered from your business information."
            action={<Link to="/business-knowledge" className="text-sm font-medium" style={{ color: 'var(--mp-accent)' }}>Add business knowledge →</Link>}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard icon={<Lightbulb className="w-5 h-5" />} label="Questions" value={data.total} sub="last 30 days" />
            {OUTCOME_ORDER.map((o) => (
              <StatCard key={o} icon={<span className="text-xs font-bold">{percent(data.byOutcome?.[o] || 0, data.total)}%</span>}
                label={OUTCOME_META[o].label} value={data.byOutcome?.[o] || 0} sub={OUTCOME_META[o].help} />
            ))}
          </div>

          <Card title="Channels" className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['voice', Phone], ['whatsapp', MessageSquareText]].map(([ch, Icon]) => (
                <div key={ch} className="flex items-center gap-3">
                  <Icon className="w-5 h-5" style={{ color: 'var(--mp-accent)' }} />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm" style={{ color: 'var(--mp-text)' }}>
                      <span>{CHANNEL_LABEL[ch]}</span><span>{data.byChannel?.[ch] || 0} ({percent(data.byChannel?.[ch] || 0, data.total)}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full mt-1" style={{ background: 'var(--mp-a05)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${percent(data.byChannel?.[ch] || 0, data.total)}%`, background: 'var(--mp-accent)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ListCard title="Frequently asked" count={data.frequentQuestions?.length} empty="Nothing asked more than once yet.">
              {data.frequentQuestions.map((g) => <GroupRow key={g.question} group={g} />)}
            </ListCard>
            <ListCard title="Improve your business knowledge" count={data.needsKnowledge?.length} empty="No knowledge gaps found — every question was answered from your business data.">
              {data.needsKnowledge.map((g) => <GroupRow key={g.question} group={g} />)}
            </ListCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ListCard title="Questions the AI could not answer" count={data.unanswered?.length} empty="No unanswered questions in the last 30 days.">
              {data.unanswered.map((q) => <QuestionRow key={q.id} item={q} />)}
            </ListCard>
            <ListCard title="Recent questions" count={data.recent?.length} empty="No recent questions.">
              {data.recent.map((q) => <QuestionRow key={q.id} item={q} />)}
            </ListCard>
          </div>
          {data.truncated && <p className="text-xs mt-4" style={{ color: 'var(--mp-text)', opacity: 0.5 }}>Showing the most recent 5,000 questions.</p>}
        </>
      )}
    </DashboardLayout>
  )
}
