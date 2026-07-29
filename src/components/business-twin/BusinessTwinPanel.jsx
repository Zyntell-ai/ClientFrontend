import React from 'react'
import BusinessHealthCard    from './BusinessHealthCard'
import RevenueCard           from './RevenueCard'
import DemandCard            from './DemandCard'
import OperationsCard        from './OperationsCard'
import StaffCard             from './StaffCard'
import CustomersCard         from './CustomersCard'
import MarketingCard         from './MarketingCard'
import PredictionsCard       from './PredictionsCard'
import RecommendationsCard   from './RecommendationsCard'
import MetadataCard          from './MetadataCard'
import BusinessTwinSkeleton  from './BusinessTwinSkeleton'
import EmptyBusinessTwinState from './EmptyBusinessTwinState'

const PENDING_STATUSES = new Set(['pending', 'generating'])

function hasAnyData(twin) {
  return (
    (twin.revenue?.lifetimeRevenue  > 0) ||
    (twin.demand?.totalBookingsAllTime > 0) ||
    (twin.customers?.totalCustomers  > 0) ||
    (twin.staff?.totalStaff          > 0)
  )
}

export default function BusinessTwinPanel({ twin, isLoading }) {
  if (isLoading) return <BusinessTwinSkeleton />

  if (!twin) return <EmptyBusinessTwinState status="empty" />

  const status = twin.metadata?.generationStatus

  if (PENDING_STATUSES.has(status) && !hasAnyData(twin)) {
    return <EmptyBusinessTwinState status={status} />
  }

  if (status === 'error' && !hasAnyData(twin)) {
    return <EmptyBusinessTwinState status="error" />
  }

  return (
    <div className="mp-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Row 1: Revenue + Business Health side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '14px', alignItems: 'start' }}>
        <RevenueCard revenue={twin.revenue} />
        <div style={{ width: 280, flexShrink: 0 }}>
          <BusinessHealthCard businessHealth={twin.businessHealth} />
        </div>
      </div>

      {/* Demand — full width (lots of bars) */}
      <DemandCard demand={twin.demand} />

      {/* Row 3: Operations full width */}
      <OperationsCard operations={twin.operations} />

      {/* Row 4: Staff + Customers side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <StaffCard staff={twin.staff} />
        <CustomersCard customers={twin.customers} />
      </div>

      {/* Row 5: Marketing */}
      <MarketingCard marketing={twin.marketing} />

      {/* Row 6: Predictions + Recommendations side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <PredictionsCard predictions={twin.predictions || {}} />
        <RecommendationsCard recommendations={twin.recommendations} />
      </div>

      {/* Metadata footer */}
      <MetadataCard metadata={twin.metadata} />

    </div>
  )
}
