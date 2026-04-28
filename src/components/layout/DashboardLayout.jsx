// src/components/layout/DashboardLayout.jsx
import React, { useState } from 'react'
import Sidebar from './Sidebar'
import { Topbar } from './Topbar'
import { Toaster } from 'react-hot-toast'

export default function DashboardLayout({ children, title, subtitle }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAF8] bg-pearl-pattern">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#1E1B4B',
            border: '1px solid rgba(124,58,237,0.12)',
            boxShadow: '0 8px 24px rgba(124,58,237,0.10)',
            fontSize: '14px',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: { iconTheme: { primary: '#059669', secondary: '#FFFFFF' } },
          error:   { iconTheme: { primary: '#E11D48', secondary: '#FFFFFF' } },
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