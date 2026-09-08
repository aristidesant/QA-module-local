/**
 * Agent Inbox Notification and Trigger Interfaces
 *
 * Defines the data models for the Agent Inbox & Trigger System (Phase 6).
 * These interfaces are foundational and consumed by mock data, UI components,
 * configuration, and state management layers.
 */

/**
 * AgentNotification
 *
 * Represents a single notification sent to an agent from supervisors, QA managers, or system.
 * Supports conversations via replies, archived state, and action links.
 *
 * @interface AgentNotification
 *
 * @property {string} id - Unique notification identifier
 * @property {string} agentId - ID of the agent receiving this notification
 * @property {string} category - Type of notification (message, alert, warning, recognition, summary)
 * @property {string} priority - Urgency level (CRITICAL, HIGH, NORMAL, LOW)
 * @property {string} title - Short notification title/subject
 * @property {string} message - Main notification message body
 * @property {string} icon - Icon name from @tabler/icons-react (e.g., 'alert', 'heart', 'trending-up')
 * @property {string} sourceRole - Role of the notification sender (SUPERVISOR, QA_MANAGER, SYSTEM)
 * @property {string} [sourceId] - Optional ID of the individual who sent this (if sourceRole is SUPERVISOR or QA_MANAGER)
 * @property {string} [metric] - Optional metric type referenced in this notification (QUALITY_ASSURANCE, SENTIMENT_EMOTION, COMPLIANCE, AUTO_FAILS)
 * @property {boolean} read - Whether the agent has read this notification
 * @property {boolean} archived - Whether the agent has archived this notification
 * @property {boolean} actioned - Whether the agent has taken action on this notification
 * @property {string} [threadId] - Optional ID for grouping related notifications/conversations
 * @property {Array} [replies] - Optional array of conversation replies on this notification
 * @property {string} replies[].id - Reply message ID
 * @property {string} replies[].fromRole - Role of the person replying (AGENT, SUPERVISOR, QA_MANAGER)
 * @property {string} replies[].fromId - ID of the person replying
 * @property {string} replies[].message - Reply message text
 * @property {string} replies[].createdAt - ISO timestamp of reply creation
 * @property {Array} [actions] - Optional array of action buttons/links to take related to this notification
 * @property {string} actions[].label - Label shown on the action button
 * @property {string} actions[].url - URL or route path to navigate to
 * @property {string} actions[].icon - Icon name for the action button
 * @property {string} createdAt - ISO timestamp of notification creation
 * @property {string} [readAt] - ISO timestamp of when the agent read this notification
 * @property {string} [expiresAt] - Optional ISO timestamp after which this notification should be considered expired
 */
export interface AgentNotification {
  id: string;
  agentId: string;
  category: 'DIRECT_MESSAGE' | 'METRIC_ALERT' | 'TREND_WARNING' | 'POSITIVE_RECOGNITION' | 'WEEKLY_SUMMARY';
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  title: string;
  message: string;
  icon: string;
  sourceRole: 'SUPERVISOR' | 'QA_MANAGER' | 'SYSTEM';
  sourceId?: string;
  metric?: 'QUALITY_ASSURANCE' | 'SENTIMENT_EMOTION' | 'COMPLIANCE' | 'AUTO_FAILS';
  read: boolean;
  archived: boolean;
  actioned: boolean;
  threadId?: string;
  replies?: Array<{
    id: string;
    fromRole: 'AGENT' | 'SUPERVISOR' | 'QA_MANAGER';
    fromId: string;
    message: string;
    createdAt: string;
  }>;
  actions?: Array<{
    label: string;
    url: string;
    icon: string;
  }>;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

/**
 * NotificationTrigger
 *
 * Configuration object that defines when and how notifications are sent to agents.
 * Supervisors and QA managers configure triggers to automate notification delivery based on
 * conditions like metric thresholds, trends, achievements, or scheduled times.
 *
 * @interface NotificationTrigger
 *
 * @property {string} id - Unique trigger identifier
 * @property {string} name - Human-readable name for this trigger (e.g., "Quality Drop Alert")
 * @property {string} category - Type of notification this trigger will send
 * @property {string} priority - Priority level for notifications sent by this trigger
 * @property {boolean} enabled - Whether this trigger is active
 * @property {string} scope - Who this trigger applies to (TEAM-scoped or PLATFORM-wide)
 * @property {string} [supervisorId] - Optional ID of the supervisor who owns this trigger (for TEAM scope)
 * @property {string} condition - Type of condition that evaluates to trigger notification (THRESHOLD, TREND, ACHIEVEMENT, SCHEDULED)
 * @property {Object} [metricThreshold] - Optional threshold condition (used when condition === 'THRESHOLD')
 * @property {string} metricThreshold.metric - Which metric to monitor
 * @property {string} metricThreshold.operator - Comparison operator (>, <, >=, <=)
 * @property {number} metricThreshold.value - Threshold value to compare against
 * @property {Object} [trendDetection] - Optional trend condition (used when condition === 'TREND')
 * @property {string} trendDetection.metric - Which metric to monitor for trends
 * @property {string} trendDetection.direction - Trend direction to detect (UP or DOWN)
 * @property {number} trendDetection.windowSize - Number of periods to analyze (e.g., last 5 days)
 * @property {number} trendDetection.threshold - Percentage threshold to trigger (e.g., 15% decline)
 * @property {Object} [achievement] - Optional achievement condition (used when condition === 'ACHIEVEMENT')
 * @property {string} achievement.pattern - Pattern to match (e.g., "5_perfect_calls", "positive_sentiment_streak")
 * @property {number} achievement.value - Target value for the achievement
 * @property {Object} [schedule] - Optional schedule condition (used when condition === 'SCHEDULED')
 * @property {string} schedule.frequency - Scheduling frequency (currently supports WEEKLY)
 * @property {string} schedule.dayOfWeek - Day to send the notification
 * @property {string} schedule.time - Time of day in HH:MM format (24-hour)
 * @property {string} templateId - ID of the notification template to use when sending
 * @property {string} [customMessage] - Optional custom message to override template
 * @property {string} recipients - Who receives notifications from this trigger (AGENT, TEAM, SUPERVISORS)
 */
export interface NotificationTrigger {
  id: string;
  name: string;
  category: 'DIRECT_MESSAGE' | 'METRIC_ALERT' | 'TREND_WARNING' | 'POSITIVE_RECOGNITION' | 'WEEKLY_SUMMARY';
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  enabled: boolean;
  scope: 'TEAM' | 'PLATFORM';
  supervisorId?: string;
  condition: 'THRESHOLD' | 'TREND' | 'ACHIEVEMENT' | 'SCHEDULED';
  metricThreshold?: {
    metric: 'QUALITY_ASSURANCE' | 'SENTIMENT_EMOTION' | 'COMPLIANCE' | 'AUTO_FAILS';
    operator: '>' | '<' | '>=' | '<=';
    value: number;
  };
  trendDetection?: {
    metric: 'QUALITY_ASSURANCE' | 'SENTIMENT_EMOTION' | 'COMPLIANCE' | 'AUTO_FAILS';
    direction: 'UP' | 'DOWN';
    windowSize: number;
    threshold: number;
  };
  achievement?: {
    pattern: string;
    value: number;
  };
  schedule?: {
    frequency: 'WEEKLY';
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    time: string;
  };
  templateId: string;
  customMessage?: string;
  recipients: 'AGENT' | 'TEAM' | 'SUPERVISORS';
}
