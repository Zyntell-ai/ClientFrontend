/**
 * @file        StaffPage.jsx
 * @module      Staff
 * @project     ClientFrontend
 * @layer       Page
 * @description Provides a CRUD interface for managing staff members, including their roles, contact details, and day-of-week availability for booking assignment.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - React (useState)
 *   - @tanstack/react-query (useQuery, useMutation, useQueryClient)
 *   - ../../api/index (businessApi)
 *   - ../../components/layout/DashboardLayout
 *   - ../../components/ui/index (Button, Modal, Input, EmptyState, Spinner, Avatar)
 *   - lucide-react (Plus, Trash2, Mail, Phone)
 *   - ../../utils/index (DAY_LABELS)
 *   - react-hot-toast
 *   - clsx
 */

/*
 * ╔══════════════════════════════════════════╗
 * ║           SDLC LIFECYCLE STATUS          ║
 * ╠══════════════════════════════════════════╣
 * ║ Planning     : ✅ Complete               ║
 * ║ Design       : ✅ Complete               ║
 * ║ Development  : ✅ Complete               ║
 * ║ Testing      : ⚠️  Partial              ║
 * ║ Deployment   : ✅ Complete               ║
 * ║ Maintenance  : 🔄 Active                ║
 * ╚══════════════════════════════════════════╝
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
// src/pages/staff/StaffPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Modal, Input, EmptyState, Spinner, Avatar } from '../../components/ui/index'
import { Plus, Trash2, Mail, Phone } from 'lucide-react'
import { DAY_LABELS } from '../../utils/index'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// ─────────────────────────────────────────
// CORE LOGIC / HANDLER FUNCTIONS
// ─────────────────────────────────────────

/**
 * @function    StaffForm
 * @purpose     Controlled form for adding a new staff member with day-of-week availability chips.
 * @param  {Function} props.onSubmit - Callback receiving the form payload object
 * @param  {boolean}  props.loading  - Whether the create mutation is in-flight
 * @returns {JSX.Element}
 */
function StaffForm({ onSubmit, loading }) {
  // [STATE]: New staff form initialised with weekday defaults
  const [form, setForm] = useState({ name: '', role: '', specialization: '', email: '', phone: '', availableDays: [1, 2, 3, 4, 5] })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  /**
   * @function    toggleDay
   * @purpose     Toggles a day index in the availableDays array.
   * @param  {number} d - Day index to toggle (0 = Sunday … 6 = Saturday)
   * @returns {void}
   */
  const toggleDay = (d) => set('availableDays', form.availableDays.includes(d) ? form.availableDays.filter(x => x !== d) : [...form.availableDays, d])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Full Name *" placeholder="Dr. Priya Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
        <Input label="Role *" placeholder="Doctor / Stylist / Agent" value={form.role} onChange={e => set('role', e.target.value)} />
        <Input label="Specialization" value={form.specialization} onChange={e => set('specialization', e.target.value)} />
        <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} />
        <div className="col-span-2">
          <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Available Days</p>
        <div className="flex gap-1.5">
          {DAY_LABELS.map((day, idx) => (
            <button key={day} type="button" onClick={() => toggleDay(idx)}
              className={clsx('w-10 h-10 rounded-lg text-xs font-semibold border transition-all',
                form.availableDays.includes(idx) ? 'bg-violet-600 border-violet-600 text-white' : 'border-violet-100 text-slate-500 hover:border-navy-400/70'
              )}>{day.slice(0, 2)}</button>
          ))}
        </div>
      </div>
      <Button className="w-full" loading={loading} onClick={() => onSubmit(form)}>Add Staff Member</Button>
    </div>
  )
}

// ─────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────

/**
 * @function    StaffPage
 * @purpose     Page-level component that lists staff members and orchestrates create and delete mutations via an add-staff modal.
 * @returns {JSX.Element}
 */
export default function StaffPage() {
  const qc = useQueryClient()

  // [STATE]: Add-staff modal visibility
  const [showAdd, setShowAdd] = useState(false)

  // [API CALL]: Fetch the list of staff for the current business
  const { data, isLoading } = useQuery({ queryKey: ['staff'], queryFn: () => businessApi.getStaff(), select: r => r.data.staff })

  // [API CALL]: Create a new staff member
  const createMutation = useMutation({
    mutationFn: businessApi.createStaff,
    onSuccess: () => { toast.success('Staff member added!'); qc.invalidateQueries(['staff']); setShowAdd(false) },
    onError: e => toast.error(e.response?.data?.error || 'Failed'),
  })

  // [API CALL]: Delete a staff member by id
  const deleteMutation = useMutation({
    mutationFn: businessApi.deleteStaff,
    onSuccess: () => { toast.success('Staff removed'); qc.invalidateQueries(['staff']) },
  })

  const staff = data || []

  return (
    <DashboardLayout title="Staff" subtitle="Your team members">
      <div className="flex justify-end mb-5">
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add Staff</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : staff.length === 0 ? (
        <EmptyState icon="👥" title="No staff yet" description="Add team members to assign them to bookings" action={<Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add Staff</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((m) => (
            <div key={m.id} className="glass-card gradient-border p-5 group">
              <div className="flex items-start gap-3 mb-4">
                <Avatar name={m.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-[#1E1B4B]">{m.name}</p>
                  <p className="text-xs text-violet-600 mt-0.5">{m.role}</p>
                  {m.specialization && <p className="text-xs text-slate-500 mt-0.5">{m.specialization}</p>}
                </div>
                {/* [UI]: Delete action revealed on card hover */}
                <button onClick={() => deleteMutation.mutate(m.id)} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {m.phone && <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-1"><Phone className="w-3 h-3" />{m.phone}</p>}
              {m.email && <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3"><Mail className="w-3 h-3" />{m.email}</p>}
              {/* [UI]: Day availability chips */}
              <div className="flex gap-1">
                {DAY_LABELS.map((day, idx) => (
                  <div key={day} className={clsx('w-7 h-7 rounded text-[10px] font-semibold flex items-center justify-center',
                    (m.availableDays || []).includes(idx) ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'
                  )}>{day.slice(0, 2)}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Staff Member">
        <StaffForm onSubmit={createMutation.mutate} loading={createMutation.isPending} />
      </Modal>
    </DashboardLayout>
  )
}
