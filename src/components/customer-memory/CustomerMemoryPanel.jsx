import React from 'react'
import VisitStatisticsCard from './VisitStatisticsCard'
import MemoryMetadataCard from './MemoryMetadataCard'
import AIInsightsCard from './AIInsightsCard'
import MemoryList from './MemoryList'
import ManualNotesEditor from './ManualNotesEditor'
import PreferenceEditor from './PreferenceEditor'
import MemorySkeleton from './MemorySkeleton'

export default function CustomerMemoryPanel({
  memory,
  isLoading,
  onSaveNotes,
  onSavePreferences,
  notesSaving = false,
  prefsSaving  = false,
}) {
  if (isLoading) return <MemorySkeleton />
  if (!memory) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <VisitStatisticsCard metadata={memory.metadata} />
      <PreferenceEditor
        initialPreferences={memory.preferences}
        onSave={onSavePreferences}
        saving={prefsSaving}
      />
      <ManualNotesEditor
        initialValue={memory.manualNotes}
        onSave={onSaveNotes}
        saving={notesSaving}
      />
      <AIInsightsCard aiInsights={memory.aiInsights} />
      <div>
        <p className="mp-label" style={{ marginBottom: '10px' }}>Memory Items</p>
        <MemoryList memoryItems={memory.memoryItems} />
      </div>
      <MemoryMetadataCard memory={memory} />
    </div>
  )
}
