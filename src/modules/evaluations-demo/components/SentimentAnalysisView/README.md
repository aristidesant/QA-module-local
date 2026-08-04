# Sentiment Analysis View Component

This directory contains comprehensive components for displaying sentiment analysis evaluation results with emotion, sentiment, tone, and agent performance data.

## Component Structure

```
SentimentAnalysisView/
├── SentimentAnalysisView.tsx           # Main container component
├── types.ts                             # TypeScript type definitions
├── mockSentimentData.ts                 # Mock data generator
├── components/
│   ├── EmotionTag.tsx                   # Emotion badge component
│   ├── TranscriptWithEmotions.tsx       # Transcript display with emotion tags
│   ├── EmotionTimelineChart.tsx         # Line chart showing emotion progression
│   ├── EmotionDistributionCard.tsx      # Stats grid showing emotion breakdown
│   ├── SentimentPolarityChart.tsx       # Sentiment polarity (positive/neutral/negative)
│   ├── ToneScoreCard.tsx                # Tone & communication metrics
│   ├── RecoveryMetricsCard.tsx          # Emotional recovery metrics
│   ├── AgentPerformanceCard.tsx         # Agent performance scores
│   ├── EmpathyIndicatorsCard.tsx        # Empathetic phrases used
│   ├── KeyMomentsCard.tsx               # Highlights key emotional events
│   └── CSS modules for each component
└── index.ts                             # Exports
```

## Data Layers

The sentiment analysis view displays data across multiple layers:

### 1. Emotion Analysis
- Agent emotion timeline (Recharts line chart)
- Customer emotion timeline (Recharts line chart)
- Emotion distribution (bar chart by emotion type)
- Basic emotions: Satisfaction, Frustration, Anger, Neutral, Excitement, Sadness

### 2. Sentiment Analysis
- Sentiment polarity breakdown (Positive/Neutral/Negative percentages)
- Sentiment trajectory throughout the call
- Individual sentiment scores per turn (-1.0 to +1.0)

### 3. Tone & Communication
- Politeness score (0-100)
- Professionalism score (0-100)
- Empathy score (0-100)

### 4. Agent Performance
- Empathy score
- Response effectiveness (sentiment change after responses)
- Issues acknowledged ratio
- Average tone score
- Key strengths summary

### 5. Conversation Health
- Emotional recovery metrics
  - Start/peak/end sentiment tracking
  - Recovery time
  - Improvement percentage
  - Recovery status
- Empathy indicators (specific empathetic phrases)
- Key moments (issue, peak, turning point, resolution)

## Component Descriptions

### SentimentAnalysisView
Main container that orchestrates the complete sentiment analysis layout:
- Left panel: Transcript with emotion tags
- Right panel: All charts, metrics, and analysis cards
- Responsive grid (4-8 column split on large screens)

### EmotionTag
Displays an emotion as a colored badge with emoji and label.

**Props:**
- `emotion: Emotion` - The emotion type
- `intensity?: number` - Optional intensity value (0-100) for opacity

### TranscriptWithEmotions
Renders the call transcript with emotion tags for each turn.

**Props:**
- `turns: TranscriptTurnWithEmotion[]` - Array of transcript turns with emotion data

### EmotionTimelineChart
Line chart showing emotion intensity over time.

**Props:**
- `data: EmotionData[]` - Array of emotion data points with timestamps
- `title: string` - Chart title
- `avgEmotion: Emotion` - Average emotion for display
- `trend: 'improving' | 'declining' | 'stable'` - Emotion trend

### SentimentPolarityChart
Bar chart displaying positive/neutral/negative sentiment distribution.

**Props:**
- `polarity: SentimentPolarity` - Sentiment percentages

### ToneScoreCard
Progress bars showing agent tone metrics.

**Props:**
- `scores: ToneScores` - Polite, Professional, Empathetic scores

### RecoveryMetricsCard
Visualizes emotional recovery throughout the call.

**Props:**
- `metrics: RecoveryMetrics` - Recovery data with sentiment flow

### AgentPerformanceCard
Displays agent performance across multiple dimensions.

**Props:**
- `performance: AgentPerformance` - Agent empathy, effectiveness, acknowledgment scores

### EmpathyIndicatorsCard
Lists specific empathetic phrases used by the agent.

**Props:**
- `indicators: EmpathyIndicator[]` - Array of empathetic phrases with context

### EmotionDistributionCard
Grid displaying emotion frequency distribution.

**Props:**
- `distribution: EmotionDistribution[]` - Array of emotion counts and percentages

### KeyMomentsCard
Timeline of significant emotional events during the call.

**Props:**
- `moments: KeyMoment[]` - Array of key moments with descriptions

## Type Definitions

```typescript
// Emotion types
type Emotion = 'satisfaction' | 'frustration' | 'anger' | 'neutral' | 'excitement' | 'sadness';

// Core data structures
interface EmotionData {
  timestamp: number;
  emotion: Emotion;
  intensity: number; // 0-100
}

interface SentimentData {
  timestamp: number;
  score: number; // -1.0 to +1.0
  polarity: 'positive' | 'neutral' | 'negative';
}

interface ToneScores {
  polite: number; // 0-100
  professional: number; // 0-100
  empathetic: number; // 0-100
}

interface RecoveryMetrics {
  startSentiment: number;
  peakNegativeSentiment: number;
  endSentiment: number;
  recoveryTime: number; // seconds
  recovered: boolean;
  improvementDelta: number; // percentage
}

interface AgentPerformance {
  empathyScore: number; // 0-100
  responseEffectiveness: number; // -100 to +100
  issuesAcknowledged: number;
  totalIssues: number;
  averageToneScore: number;
}

interface EmpathyIndicator {
  phrase: string;
  timestamp: string;
  context: string;
}
```

## Mock Data

The `mockSentimentData.ts` file provides a `generateMockSentimentAnalysis()` function that creates comprehensive sentiment analysis data including:
- Emotion timelines for agent and customer
- Sentiment scores and polarity
- Tone metrics
- Recovery metrics
- Agent performance scores
- Empathy indicators
- Key moments

## Display Order

The components are displayed in this order (top to bottom):
1. Agent Emotion Timeline
2. Customer Emotion Timeline
3. Sentiment Polarity Chart
4. Tone & Communication Scores
5. Emotion Distribution
6. Emotional Recovery Metrics
7. Agent Performance
8. Empathy Indicators
9. Key Moments

## Dark Mode Support

All components use Mantine CSS variables and dark mode support through:
- `var(--mantine-color-*)` for colors
- `@media (prefers-color-scheme: dark)` for theme-specific styles
- Automatic adaptation based on user's system preference

## Styling

Each component has a corresponding CSS module file using:
- Mantine CSS variables for colors and spacing
- Dark mode media queries
- Responsive design principles
- Accessibility best practices

## Future Enhancements

Possible additions:
- Speech rate and pace analysis
- Customer effort score (CES)
- Issue resolution confirmation
- Escalation risk indicators
- Conversation health score (composite)
- Sentiment prediction (will it escalate?)
- Competitive phrases analysis
- Training recommendations based on performance
