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
export type { RankingEntry, RankingGoal, ReactionType, ReactionCounts } from './RankingsTable';

// Phase 4: Performance Metrics
export { PerformanceScoresSection } from './PerformanceScoresSection';
export { CriticalIssuesTable } from './CriticalIssuesTable';
export { InboxSummary } from './InboxSummary';

// Phase 5: Sentiment Analysis
export { SentimentTrendChart } from './SentimentTrendChart';

// Phase 6: Performance Trend Analysis
export { PerformanceTrendChart } from './PerformanceTrendChart';
export type { PerformanceTrendPoint } from './PerformanceTrendChart';

// Quick Stats Widget for KPI display
export { QuickStatsWidget } from './QuickStatsWidget';

// Quick Insights Widget for performance recommendations
export { QuickInsightsWidget } from './QuickInsightsWidget';
export type { Insight } from './QuickInsightsWidget';

// Best/Worst Calls Panel for performance comparison
export { BestWorstCallsPanel } from './BestWorstCallsPanel';
export type { BestWorstCall } from './BestWorstCallsPanel';

// Performance Score row: Quality Assurance / Compliance / Sentiment & Emotion
export { QualityAssuranceCard } from './QualityAssuranceCard';
export type { QualityAssuranceScore } from './QualityAssuranceCard';
export { ComplianceCard, getComplianceColor } from './ComplianceCard';
export { SentimentEmotionCard, getSentimentBand } from './SentimentEmotionCard';

// Single-table Best/Worst calls view with a Best/Worst segmented control
export { BestWorstCallsTable } from './BestWorstCallsTable';

// Task 2: Burnout Risk Widget for agent wellbeing monitoring
export { default as BurnoutRiskWidget } from './BurnoutRiskWidget';
export type { BurnoutRiskData, BurnoutRiskLevel } from '../types/burnoutRisk';
