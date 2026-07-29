import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { businessApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { FeatureGate } from '../../components/ui/index'
import { CeoReportPanel } from '../../components/ceo-report/index'

export default function CeoReportPage() {
  const queryClient = useQueryClient()

  // ── Query: load today's CEO Report ─────────────────────────
  const { data: report, isLoading } = useQuery({
    queryKey: ['ceoReport'],
    queryFn:  businessApi.getCeoReport,
    select:   (r) => r.data.report,
    // Auto-refresh every 30s while the pipeline is still running
    refetchInterval: (query) => {
      const status = query.state.data?.metadata?.generationStatus
      return (status === 'pending' || status === 'generating') ? 30_000 : false
    },
  })

  // ── Mutation: manual refresh trigger ───────────────────────
  const { mutate: triggerRefresh, isPending: isRefreshing } = useMutation({
    mutationFn: businessApi.refreshCeoReport,
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['ceoReport'] }),
  })

  const generationStatus = report?.metadata?.generationStatus
  const isActive         = generationStatus === 'pending' || generationStatus === 'generating'

  return (
    <DashboardLayout
      title="CEO Report"
      subtitle="Yesterday's business performance — revenue, bookings, customers, and operations"
    >
      <FeatureGate feature="aiCeoReport" overlay className="rounded-xl">
        {/* Manual refresh button — shown above the panel */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button
            className="mp-btn mp-btn-secondary"
            style={{ gap: 6, fontSize: 12, padding: '6px 14px' }}
            onClick={() => triggerRefresh()}
            disabled={isRefreshing || isActive}
            title="Refresh today's CEO Report"
          >
            <RefreshCw
              style={{
                width: 13,
                height: 13,
                animation: (isRefreshing || isActive) ? 'spin 1s linear infinite' : 'none',
              }}
            />
            {isRefreshing ? 'Refreshing…' : 'Refresh Report'}
          </button>
        </div>

        <CeoReportPanel report={report} isLoading={isLoading} />
      </FeatureGate>
    </DashboardLayout>
  )
}
