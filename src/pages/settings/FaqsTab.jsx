/**
 * @file        FaqsTab.jsx
 * @module      Settings / FAQs & Training
 * @project     ClientFrontend
 * @layer       Component
 * @description Business owners add, edit, enable / disable and delete their FAQs. Each FAQ shows whether the AI
 *              receptionist actually uses it (in use / disabled / awaiting admin approval / rejected), the smart-search
 *              preparation state when relevant, and any deterministic conflict with the business's structured
 *              information. Healthcare businesses are told that FAQs need administrator approval first.
 *              Validation mirrors the backend limits; the backend's structured errors are shown per field.
 *              No embeddings or internal index metadata are ever shown.
 */
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2, AlertTriangle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { businessApi } from '../../api/index'
import { Button, Input, Textarea, Toggle, Modal, Alert, EmptyState, Spinner, Badge } from '../../components/ui/index'
import { FAQ_LIMITS, validateFaq, faqErrorFromResponse, faqStatusChip, faqIndexChip, CONFLICT_LABEL } from '../../utils/faqs'

const EMPTY = { question: '', answer: '', category: '' }

/** Add / edit form (shared) */
function FaqForm({ initial, limits, onSubmit, saving, serverErrors }) {
  const [form, setForm] = useState(initial)
  const [touched, setTouched] = useState(false)
  const errors = { ...(touched ? validateFaq(form, limits) : {}), ...serverErrors }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const submit = () => {
    setTouched(true)
    if (Object.keys(validateFaq(form, limits)).length) return
    onSubmit({ question: form.question, answer: form.answer, category: form.category })
  }
  return (
    <div className="space-y-3">
      <Input label="Question *" placeholder="e.g., What are your working hours?" value={form.question} onChange={set('question')} maxLength={limits.questionMax + 50} error={errors.question} />
      <p className="text-[11px] text-slate-400 -mt-2 text-right">{form.question.trim().length}/{limits.questionMax}</p>
      <Textarea label="Answer *" placeholder="e.g., We are open Mon–Sat, 9 AM–7 PM." value={form.answer} onChange={set('answer')} rows={5} maxLength={limits.answerMax + 100} error={errors.answer} />
      <p className="text-[11px] text-slate-400 -mt-2 text-right">{form.answer.trim().length}/{limits.answerMax}</p>
      <Input label="Category (optional)" placeholder="e.g., Pricing, Hours, Services" value={form.category} onChange={set('category')} maxLength={limits.categoryMax + 10} error={errors.category} />
      <Button className="w-full" loading={saving} onClick={submit}>Save FAQ</Button>
    </div>
  )
}

function FaqCard({ faq, onEdit, onToggle, onDelete, busy }) {
  const chip = faqStatusChip(faq)
  const indexChip = faqIndexChip(faq)
  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1E1B4B] flex items-start gap-2 break-words">
            <span className="text-violet-600 text-base font-bold">Q</span>{faq.question}
          </p>
          <p className="text-xs text-slate-500 mt-2 pl-5 leading-relaxed whitespace-pre-line break-words">{faq.answer}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-2 pl-5">
            <Badge color={chip.color}>{chip.label}</Badge>
            {indexChip && <Badge color={indexChip.color}>{indexChip.label}</Badge>}
            {faq.category && <span className="text-[10px] bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded">{faq.category}</span>}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 pl-5">{chip.help}</p>
          {faq.rejectionReason && <p className="text-[11px] text-red-500 mt-1 pl-5">Reason: {faq.rejectionReason}</p>}
          {faq.conflicts?.length > 0 && (
            <div className="mt-2 ml-5 rounded-lg border border-amber-200 bg-amber-50 p-2 space-y-0.5">
              {faq.conflicts.map((c, i) => (
                <p key={i} className="text-[11px] text-amber-700 flex gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
                  <span><b>{CONFLICT_LABEL[c.type] || 'Possible conflict'}:</b> {c.detail} Your service list, prices, staff and hours always take priority.</span>
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Toggle checked={faq.enabled} onChange={(v) => !busy && onToggle(v)} label="" />
          <div className="flex gap-1">
            <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-violet-600" aria-label="Edit FAQ"><Pencil className="w-3.5 h-3.5" /></button>
            <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-rose-500" aria-label="Delete FAQ"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FaqsTab() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null) // null | 'new' | faq
  const [deleting, setDeleting] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['faqs'],
    queryFn: businessApi.getFaqs,
    select: (r) => r.data,
  })
  const faqs = data?.faqs || []
  const limits = data?.limits
    ? { questionMin: data.limits.question.min, questionMax: data.limits.question.max, answerMin: data.limits.answer.min, answerMax: data.limits.answer.max, categoryMax: data.limits.category.max }
    : FAQ_LIMITS
  const refresh = () => qc.invalidateQueries({ queryKey: ['faqs'] })
  const onError = (e) => {
    const { fields, message } = faqErrorFromResponse(e)
    setServerErrors(fields)
    toast.error(message)
  }

  const save = useMutation({
    mutationFn: (body) => (editing && editing !== 'new' ? businessApi.updateFaq(editing.id, body) : businessApi.createFaq(body)),
    onSuccess: (r) => {
      const f = r.data?.faq
      toast.success(f && f.approvalStatus === 'PENDING_APPROVAL' && !f.usedByAi ? 'FAQ saved — awaiting administrator approval' : 'FAQ saved')
      setEditing(null); setServerErrors({}); refresh()
    },
    onError,
  })
  const toggle = useMutation({
    mutationFn: ({ id, enabled }) => businessApi.setFaqEnabled(id, enabled),
    onSuccess: (_r, v) => { toast.success(v.enabled ? 'FAQ enabled' : 'FAQ disabled'); refresh() },
    onError: (e) => toast.error(faqErrorFromResponse(e).message),
  })
  const remove = useMutation({
    mutationFn: (id) => businessApi.deleteFaq(id),
    onSuccess: () => { toast.success('FAQ deleted'); setDeleting(null); refresh() },
    onError: (e) => toast.error(faqErrorFromResponse(e).message),
  })

  const openNew = () => { setServerErrors({}); setEditing('new') }
  const openEdit = (faq) => { setServerErrors({}); setEditing(faq) }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-600">Teach your AI receptionist common questions and answers.</p>
          <p className="text-xs text-slate-400 mt-0.5">Your services, prices, staff and working hours always take priority over FAQ answers.</p>
        </div>
        <Button onClick={openNew} size="sm"><Plus className="w-3.5 h-3.5" /> Add FAQ</Button>
      </div>

      {data?.approvalRequired && (
        <Alert type="info" className="mb-5">
          {data.classification === true
            ? 'Healthcare FAQs are reviewed by a Zyntell administrator before your AI receptionist uses them. Editing an approved FAQ sends it for approval again.'
            : 'Your FAQs are not used by your AI receptionist until our team has completed your business review.'}
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : isError ? (
        <div>
          <Alert type="error">FAQs could not be loaded.</Alert>
          <Button className="mt-3" variant="secondary" onClick={() => refetch()} loading={isFetching}><RefreshCw className="w-4 h-4" /> Try again</Button>
        </div>
      ) : faqs.length === 0 ? (
        <EmptyState icon="💬" title="No FAQs yet" description="Add questions and answers so your AI receptionist can answer customers accurately."
          action={<Button onClick={openNew}><Plus className="w-4 h-4" /> Add First FAQ</Button>} />
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <FaqCard key={faq.id} faq={faq} busy={toggle.isPending}
              onEdit={() => openEdit(faq)}
              onToggle={(enabled) => toggle.mutate({ id: faq.id, enabled })}
              onDelete={() => setDeleting(faq)} />
          ))}
        </div>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing && editing !== 'new' ? 'Edit FAQ' : 'Add FAQ'}>
        {editing && (
          <FaqForm key={editing === 'new' ? 'new' : editing.id} limits={limits} saving={save.isPending} serverErrors={serverErrors}
            initial={editing === 'new' ? EMPTY : { question: editing.question, answer: editing.answer, category: editing.category === 'general' ? '' : editing.category || '' }}
            onSubmit={(body) => { setServerErrors({}); save.mutate(body) }} />
        )}
        {editing && editing !== 'new' && data?.approvalRequired && editing.approvalStatus === 'APPROVED' && (
          <p className="text-[11px] text-amber-600 mt-3">Saving changes sends this FAQ for administrator approval again.</p>
        )}
      </Modal>

      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete FAQ?" size="sm">
        <p className="text-sm text-slate-600 mb-1">“{deleting?.question}”</p>
        <p className="text-xs text-slate-400 mb-4">Your AI receptionist will stop using it immediately.</p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button className="flex-1" loading={remove.isPending} onClick={() => remove.mutate(deleting.id)}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
