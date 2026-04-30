// src/components/layout/DashboardLayout.jsx
import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { Topbar } from './Topbar'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { applyTheme } from '../../utils/categoryTheme'

export default function DashboardLayout({ children, title, subtitle }) {
  const [collapsed, setCollapsed] = useState(false)
  const { business } = useAuthStore()

  // Apply category theme to CSS variables on every category change
  useEffect(() => {
    applyTheme(business?.category)
  }, [business?.category])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--mp-body)' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: 'var(--mp-text)',
            border: '0.5px solid var(--mp-card-border)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            fontSize: '13px',
            fontFamily: 'DM Sans, sans-serif',
            borderRadius: '8px',
          },
          success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          title={title}
          subtitle={subtitle}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}