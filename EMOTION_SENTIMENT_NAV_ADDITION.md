# Emotion & Sentiment Navigation Addition

## Summary

Added "Emotion & Sentiment" section to the QA Manager sidebar navigation, providing quick access to emotion and sentiment analysis features.

## Changes Made

### 1. Updated Sidebar Component

**File:** `src/components/Sidebar/Sidebar.tsx`

- **Added Icon Import:** `IconMoodSmile` from `@tabler/icons-react`
- **Added Navigation Item:** New item added to `qaPrimaryItems` array after "Evaluations"
  - Key: `qa-emotion-sentiment`
  - Label: `sidebar.items.qaEmotionSentiment`
  - Route: `/qa/emotion-sentiment`
  - Icon: Smiley face icon (IconMoodSmile)
  - i18n Namespace: `qa.emotionSentiment`

### 2. Updated Translations

#### English Translations

**File:** `src/locales/en/common.json`

- Added: `"qaEmotionSentiment": "Emotion & Sentiment"`

#### Spanish Translations

**File:** `src/locales/es/common.json`

- Added: `"qaEmotionSentiment": "Emoción y Sentimiento"`

## QA Manager Sidebar Navigation Order

The new "Emotion & Sentiment" item appears in this order:

1. 📊 Dashboard
2. ✅ Evaluations
3. **😊 Emotion & Sentiment** ← NEW
4. 📢 Campaigns
5. 📝 Forms
6. 🔀 Disputes
7. 👥 Agents
8. ✓ Evaluator Agents

## Route Information

**Route Path:** `/qa/emotion-sentiment`
**Namespace:** `qa.emotionSentiment`

### Implementation Notes

When implementing the actual page/component for this route, consider:

1. **Purpose:** Dashboard showing emotion and sentiment analysis metrics across evaluations
2. **Key Content:**
   - Sentiment analysis trends over time
   - Emotion distribution across agents
   - Top performing agents (by sentiment)
   - Recent sentiment analysis evaluations
   - Filtering by agent, campaign, date range
3. **Integration:** Could show aggregate data from sentiment analysis evaluations (using the SentimentAnalysisView components created earlier)

## Next Steps

1. Create route handler for `/qa/emotion-sentiment`
2. Create corresponding component (e.g., `EmotionSentimentDashboardPage`)
3. Wire up data fetching for sentiment metrics
4. Integrate with existing sentiment analysis components

## Visual Indicator

The sidebar item uses the `IconMoodSmile` (😊) icon to visually indicate emotion/sentiment functionality, making it distinctive and easy to find for QA managers looking to analyze call sentiment data.

## Accessibility

- Navigation item is fully keyboard accessible
- Proper aria-labels included
- Icon + text combination for clarity
- Tooltip shows full label when sidebar is collapsed

## Multilingual Support

The navigation item supports both English and Spanish:

- **English:** "Emotion & Sentiment"
- **Spanish:** "Emoción y Sentimiento"

Additional languages can be added by updating their respective locale files in `src/locales/[lang]/common.json`.
