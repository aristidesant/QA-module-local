// Existing components
export { DashboardMetricCard } from './DashboardMetricCard';
export { AlertsInbox } from './AlertsInbox';
export { ProfileBadge } from './ProfileBadge';
export { DisputesStats } from './DisputesStats';
export { BadgeCollection } from './BadgeCollection';
export { LeaderboardTable } from './LeaderboardTable';
export { TranscriptWithMarkers } from './TranscriptWithMarkers';
export { AudioPlayerWithClipping } from './AudioPlayerWithClipping';
export { AutoTriggersManager } from './AutoTriggersManager';
export { ReportBuilder } from './ReportBuilder';

// Phase 2: Adaptive dashboard pattern and new metric cards
export { AdaptiveDashboardLayout, useCOPCMetrics, useAverageSentiment, useAutoFailCount } from './AdaptiveDashboardLayout';
export { COPCScoreCard } from './COPCScoreCard';
export { SentimentScaleCard } from './SentimentScaleCard';
export { AutoFailsCard } from './AutoFailsCard';
export { AgentInbox } from './AgentInbox';

// Phase 3: Agent & Supervisor features
export { RankingsTable } from './RankingsTable';
export type { RankingEntry } from './RankingsTable';

// Phase 4: Performance Metrics
export { PerformanceScoresSection } from './PerformanceScoresSection';
// TODO: CriticalIssuesTable component is referenced but not yet implemented
// export { CriticalIssuesTable } from './CriticalIssuesTable';

// Phase 5: Sentiment Analysis
export { SentimentTrendChart } from './SentimentTrendChart';

// Phase 6: Performance Trend Analysis
export { PerformanceTrendChart } from './PerformanceTrendChart';
export type { PerformanceTrendPoint } from './PerformanceTrendChart';

// Quick Stats Widget for KPI display
export { QuickStatsWidget } from './QuickStatsWidget';
