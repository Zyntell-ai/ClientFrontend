/**
 * @file        BusinessKnowledgePage.jsx
 * @module      Business Knowledge Page
 * @project     ClientFrontend
 * @layer       Page
 * @description Lets the business owner write a business description and extra instructions for the AI receptionist
 *              (phone and WhatsApp). Services, staff, working hours, location and FAQs stay on their own pages and
 *              remain the AI's authoritative source for those details.
 *
 * @dependencies
 *   - ../../api/index (businessApi.getKnowledge / updateKnowledge → GET/PUT /api/business/knowledge)
 *   - ../../utils/businessKnowledge (limits, validation, changed-field payload, error messages)
 *   - ../../hooks/useUnsavedChangesWarning (browser refresh/close warning + sidebar navigation guard)
 */

import React, { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { businessApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Alert, Button, Card, Spinner, Textarea } from '../../components/ui/index'
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning'
import {
  KNOWLEDGE_FIELDS, KNOWLEDGE_MAX_LENGTH, changedKnowledge, isKnowledgeDirty, knowledgeErrorMessage,
  knowledgeFromResponse, validateKnowledge,
} from '../../utils/businessKnowledge'

const QUERY_KEY = ['business-knowledge']

const formatSavedAt = (iso) => {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function BusinessKnowledgePage() {
  const queryClient = useQueryClient()
  // [API CALL]: Saved knowledge (empty strings when never saved)
  const { data: saved, isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: businessApi.getKnowledge,
    select: (r) => knowledgeFromResponse(r.data),
  })

  // [STATE]: Form starts from the saved values once they load; null until then
  const [values, setValues] = useState(null)
  const [saveError, setSaveError] = useState('')
  useEffect(() => {
    if (saved && values === null) setValues({ businessDescription: saved.businessDescription, aiInstructions: saved.aiInstructions })
  }, [saved, values])

  const errors = values ? validateKnowledge(values) : {}
  const hasErrors = Object.keys(errors).length > 0
  const dirty = !!(values && saved && isKnowledgeDirty(values, saved))
  useUnsavedChangesWarning(dirty, 'You have unsaved changes to your Business Knowledge. Leave this page and discard them?')

  // [API CALL]: Save only the fields that changed — the other field is left exactly as saved
  const mutation = useMutation({
    mutationFn: (payload) => businessApi.updateKnowledge(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(QUERY_KEY, response)
      const next = knowledgeFromResponse(response.data)
      setValues({ businessDescription: next.businessDescription, aiInstructions: next.aiInstructions })
      setSaveError('')
      toast.success('Business knowledge saved')
    },
    onError: (err) => setSaveError(knowledgeErrorMessage(err)),
  })

  const setField = (key, value) => {
    setValues((v) => ({ ...v, [key]: value }))
    if (saveError) setSaveError('')
  }

  const handleSave = () => {
    if (!dirty || hasErrors || mutation.isPending) return
    mutation.mutate(changedKnowledge(values, saved))
  }

  const savedAt = formatSavedAt(saved?.updatedAt)

  return (
    <DashboardLayout title="Business Knowledge" subtitle="Tell your AI receptionist about your business">
      {isLoading || (!isError && !values) ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : isError ? (
        <div className="max-w-3xl space-y-3">
          <Alert type="error">Could not load your Business Knowledge. Please try again.</Alert>
          <Button variant="secondary" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : (
        <div className="max-w-3xl space-y-6">
          <Alert type="info">
            Your AI receptionist reads this on every phone call and WhatsApp conversation. Keep services, prices, staff,
            working hours, location and FAQs up to date on their own pages — those stay the AI&apos;s source of truth for
            those details.
          </Alert>

          {KNOWLEDGE_FIELDS.map(({ key, label, help, placeholder }) => {
            const length = values[key].length
            return (
              <Card key={key} title={label}>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 leading-relaxed">{help}</p>
                  <Textarea
                    aria-label={label}
                    value={values[key]}
                    onChange={(e) => setField(key, e.target.value)}
                    placeholder={placeholder}
                    rows={10}
                    error={errors[key]}
                    disabled={mutation.isPending}
                  />
                  <p
                    className={clsx('text-[11px] text-right tabular-nums', errors[key] ? 'text-red-500 font-semibold' : 'text-slate-400')}
                    aria-live="polite"
                  >
                    {length.toLocaleString('en-IN')} / {KNOWLEDGE_MAX_LENGTH.toLocaleString('en-IN')} characters
                  </p>
                </div>
              </Card>
            )
          })}

          {saveError && <Alert type="error">{saveError}</Alert>}

          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400">
              {dirty ? <span className="text-amber-600 font-semibold">Unsaved changes</span> : savedAt ? `Last saved ${savedAt}` : 'Not saved yet'}
            </p>
            <Button loading={mutation.isPending} disabled={!dirty || hasErrors || mutation.isPending} onClick={handleSave}>
              <Save className="w-4 h-4" /> Save Business Knowledge
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
