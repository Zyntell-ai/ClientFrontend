// src/components/layout/DashboardLayout.jsx
import React, { useState } from 'react'
import Sidebar from './Sidebar'
import { Topbar } from './Topbar'
import { Toaster } from 'react-hot-toast'

export default function DashboardLayout({ children, title, subtitle }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-navy-950 bg-grid-pattern bg-grid">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f1f3d',
            color: '#e2e8f0',
            border: '1px solid #1e3a5f',
            fontSize: '14px',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#e2e8f0' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#e2e8f0' } },
        }}
      />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
