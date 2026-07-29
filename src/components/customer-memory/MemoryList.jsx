import React from 'react'
import MemoryCard from './MemoryCard'
import EmptyMemoryState from './EmptyMemoryState'

export default function MemoryList({ memoryItems = [] }) {
  if (memoryItems.length === 0) return <EmptyMemoryState />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {memoryItems.map(item => (
        <MemoryCard key={item.id} item={item} />
      ))}
    </div>
  )
}
