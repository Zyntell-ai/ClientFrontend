import React from 'react'
import TwinIdentityCard       from './TwinIdentityCard'
import TwinBehaviorCard       from './TwinBehaviorCard'
import TwinCommunicationCard  from './TwinCommunicationCard'
import TwinRelationshipCard   from './TwinRelationshipCard'
import TwinBusinessValueCard  from './TwinBusinessValueCard'
import TwinPredictionsCard    from './TwinPredictionsCard'
import TwinObservationsCard   from './TwinObservationsCard'
import TwinMetadataCard       from './TwinMetadataCard'
import TwinSkeleton           from './TwinSkeleton'
import EmptyTwinState         from './EmptyTwinState'

const PENDING_STATUSES = new Set(['pending', 'generating'])

export default function CustomerTwinPanel({
  twin,
  isLoading,
  onSaveIdentity,
  identitySaving = false,
}) {
  if (isLoading) return <TwinSkeleton />

  if (!twin) return <EmptyTwinState status="empty" />

  const status = twin.metadata?.generationStatus

  // Twin exists but has never completed a pipeline run
  if (PENDING_STATUSES.has(status) && !twin.behavior?.totalVisits && !twin.identity?.customerSince) {
    return <EmptyTwinState status={status} />
  }

  if (status === 'error' && !twin.identity?.customerSince && !twin.behavior?.totalVisits) {
    return <EmptyTwinState status="error" />
  }

  return (
    <div className="mp-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <TwinIdentityCard
        identity={twin.identity}
        onSave={onSaveIdentity}
        saving={identitySaving}
      />
      <TwinBehaviorCard      behavior={twin.behavior} />
      <TwinCommunicationCard communication={twin.communication} />
      <TwinRelationshipCard  relationship={twin.relationship} />
      <TwinBusinessValueCard businessValue={twin.businessValue} />
      <TwinPredictionsCard   predictions={twin.predictions} />
      <TwinObservationsCard  intelligence={twin.intelligence} />
      <TwinMetadataCard      metadata={twin.metadata} />
    </div>
  )
}
