// src/pages/services/ServicesPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Modal, Input, Card, EmptyState, Spinner, Badge } from '../../components/ui/index'
import { Plus, Trash2, Pencil, Clock, DollarSign } from 'lucide-react'
import { fmt } from '../../utils/index'
import toast from 'react-hot-toast'

function ServiceForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({ name: '', nameRegional: '', description: '', duration: 30, price: '', priceMin: '', priceMax: '', ...initial })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Service Name *" value={form.name} onChange={e => set('name', e.target.value)} />
        <Input label="Regional Name" value={form.nameRegional || ''} onChange={e => set('nameRegional', e.target.value)} />
      </div>
      <Input label="Description" value={form.description || ''} onChange={e => set('description', e.target.value)} />
      <div className="grid grid-cols-3 gap-3">
        <Input label="Duration (min) *" type="number" min="5" value={form.duration} onChange={e => set('duration', e.target.value)} />
        <Input label="Fixed Price (₹)" type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} />
        <Input label="Min Price (₹)" type="number" value={form.priceMin || ''} onChange={e => set('priceMin', e.target.value)} />
      </div>
      <Button className="w-full" loading={loading} onClick={() => onSubmit({
        ...form, duration: Number(form.duration),
        price: form.price ? Number(form.price) : undefined,
        priceMin: form.priceMin ? Number(form.priceMin) : undefined,
        priceMax: form.priceMax ? Number(form.priceMax) : undefined,
      })}>
        Save Service
      </Button>
    </div>
  )
}

export default function ServicesPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [editSvc, setEditSvc] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['services'], queryFn: () => businessApi.getServices(), select: r => r.data.services })

  const createMutation = useMutation({
    mutationFn: (d) => businessApi.createService(d),
    onSuccess: () => { toast.success('Service added!'); qc.invalidateQueries(['services']); setShowAdd(false) },
    onError: e => toast.error(e.response?.data?.error || 'Failed'),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }) => businessApi.updateService(id, d),
    onSuccess: () => { toast.success('Service updated!'); qc.invalidateQueries(['services']); setEditSvc(null) },
    onError: e => toast.error(e.response?.data?.error || 'Failed'),
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => businessApi.deleteService(id),
    onSuccess: () => { toast.success('Service removed'); qc.invalidateQueries(['services']) },
    onError: e => toast.error(e.response?.data?.error || 'Failed'),
  })

  const services = data || []

  return (
    <DashboardLayout title="Services" subtitle="Manage what your bot offers">
      <div className="flex justify-end mb-5">
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add Service</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : services.length === 0 ? (
        <EmptyState icon="🗂️" title="No services yet" description="Add your first service so the bot can start taking bookings" action={<Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add Service</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc) => (
            <div key={svc.id} className="glass-card gradient-border p-5 hover:border-violet-200 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-display font-semibold text-[#1E1B4B] text-sm">{svc.name}</p>
                  {svc.nameRegional && <p className="text-xs hover:text-violet-600 mt-0.5">{svc.nameRegional}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditSvc(svc)} className="p-1.5 hover:text-violet-600 hover:text-violet-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteMutation.mutate(svc.id)} className="p-1.5 hover:text-violet-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {svc.description && <p className="text-xs hover:text-violet-600 mb-3 line-clamp-2">{svc.description}</p>}
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-400"><Clock className="w-3 h-3" />{fmt.duration(svc.duration)}</span>
                {svc.price && <span className="flex items-center gap-1 text-emerald-600 font-semibold"><DollarSign className="w-3 h-3" />{fmt.currency(svc.price)}</span>}
                {svc.priceMin && <span className="text-emerald-600 font-semibold">{fmt.currency(svc.priceMin)}–{fmt.currency(svc.priceMax)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Service">
        <ServiceForm onSubmit={createMutation.mutate} loading={createMutation.isPending} />
      </Modal>
      <Modal open={!!editSvc} onClose={() => setEditSvc(null)} title="Edit Service">
        {editSvc && <ServiceForm initial={editSvc} onSubmit={(d) => updateMutation.mutate({ id: editSvc.id, ...d })} loading={updateMutation.isPending} />}
      </Modal>
    </DashboardLayout>
  )
}
