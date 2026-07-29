import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { businessApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { FeatureGate } from '../../components/ui/index'
import { BusinessTwinPanel } from '../../components/business-twin/index'

export default function BusinessTwinPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['businessTwin'],
    queryFn:  businessApi.getTwin,
    select:   (r) => r.data.twin,
    refetchInterval: (query) => {
      const status = query.state.data?.metadata?.generationStatus
      return (status === 'pending' || status === 'generating') ? 30_000 : false
    },
  })

  return (
    <DashboardLayout
      title="Business Twin"
      subtitle="AI-ready model of your business — revenue, demand, operations, and intelligence"
    >
      <FeatureGate feature="businessDigitalTwin" overlay className="rounded-xl">
        <BusinessTwinPanel twin={data} isLoading={isLoading} />
      </FeatureGate>
    </DashboardLayout>
  )
}
