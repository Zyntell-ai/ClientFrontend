import React from 'react'
import ExecutiveSummaryCard       from './ExecutiveSummaryCard'
import YesterdayOverviewCard      from './YesterdayOverviewCard'
import RevenueSnapshotCard        from './RevenueSnapshotCard'
import BusinessHealthSnapshotCard from './BusinessHealthSnapshotCard'
import InsightsCard               from './InsightsCard'
import RisksCard                  from './RisksCard'
import CustomerSnapshotCard       from './CustomerSnapshotCard'
import OperationsSnapshotCard     from './OperationsSnapshotCard'
import StaffSnapshotCard          from './StaffSnapshotCard'
import MarketingSnapshotCard      from './MarketingSnapshotCard'
import RecommendationsCard        from './RecommendationsCard'
import ReportMetadataCard         from './ReportMetadataCard'
import CeoReportSkeleton          from './CeoReportSkeleton'
import EmptyCeoReportState        from './EmptyCeoReportState'

const PENDING_STATUSES = new Set(['pending', 'generating'])

function hasReportData(report) {
  const facts = report?.facts || {}
  return (
    (facts.yesterdayRevenue  > 0) ||
    (facts.totalBookings     > 0) ||
    (facts.leadCount         > 0) ||
    (facts.conversationCount > 0)
  )
}

export default function CeoReportPanel({ report, isLoading }) {
  if (isLoading) return <CeoReportSkeleton />

  if (!report) return <EmptyCeoReportState status="empty" />

  const status = report?.metadata?.generationStatus

  if (PENDING_STATUSES.has(status) && !hasReportData(report)) {
    return <EmptyCeoReportState status={status} />
  }

  if (status === 'error' && !hasReportData(report)) {
    return <EmptyCeoReportState status="error" />
  }

  const facts    = report.facts          || {}
  const revenue  = report.revenue        || {}
  const customers = report.customers     || {}
  const operations = report.operations   || {}
  const staff    = report.staff          || {}
  const marketing = report.marketing     || {}

  return (
    <div className="mp-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* 1 — Executive Summary (AI Phase C placeholder) */}
      <ExecutiveSummaryCard executiveSummary={report.executiveSummary} />

      {/* 2 — Yesterday Overview: hero card for Phase B */}
      <YesterdayOverviewCard report={report} />

      {/* 3 + Health — Revenue and Business Health side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '14px', alignItems: 'start' }}>
        <RevenueSnapshotCard revenue={revenue} facts={facts} />
        <BusinessHealthSnapshotCard businessHealth={report.businessHealth} />
      </div>

      {/* 4 + 5 — AI Insights and Risks (below Business Health, above Customers) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <InsightsCard insights={report.insights} />
        <RisksCard    risks={report.risks} />
      </div>

      {/* 6 + 7 — Customers and Operations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <CustomerSnapshotCard customers={customers} facts={facts} />
        <OperationsSnapshotCard operations={operations} />
      </div>

      {/* 8 + 9 — Staff and Marketing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <StaffSnapshotCard staff={staff} />
        <MarketingSnapshotCard marketing={marketing} />
      </div>

      {/* 10 — Recommendations */}
      <RecommendationsCard recommendations={report.recommendations} />

      {/* 11 — Report metadata footer */}
      <ReportMetadataCard
        metadata={report.metadata}
        reportDate={report.reportDate}
        reportVersion={report.metadata?.reportVersion}
      />

    </div>
  )
}
