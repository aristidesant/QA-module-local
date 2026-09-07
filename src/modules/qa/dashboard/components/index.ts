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
