# Call Detail — Evaluation Panels (QA · Sentiment & Emotion · Compliance · Business Insights) — Implementation Plan

> **For agentic workers:** Execute tasks **in order**; every task compiles on its own (`npm run typecheck` after each). Steps use checkbox (`- [ ]`) syntax. First step of execution: copy this file verbatim to `docs/superpowers/plans/2026-09-12-call-detail-evaluation-panels.md`.

## Context

The Campaigns prototype (`src/views/Campaigns`, mock data, stakeholder mockup) already has a call-detail page, `ConversationEvaluations.tsx`, with four evaluation-type buttons on top (QA · Sentiment and Emotion · Compliance · Business Insights), an audio player + transcript on the left and an "Evaluation Results" card on the right. The right card currently shows **placeholder** content (one literal score + three generic bullet lines per tab). The user wants the right panel to show the **real metric structure the platform already defines** for each evaluation type, so stakeholders see what each evaluation actually measures on a single call:

- **QA** → the call's score per **COPC error type** (ECN critical business · ENC non-critical · ECC critical compliance · ECUF critical end-user) plus the aspect/item breakdown that produced it.
- **Sentiment & Emotion** → the platform's **5 sentiment categories** (very-negative → very-positive) with their **13 mapped emotions**, evaluated for **both the agent and the customer**, plus extra call-level factors the user picked in brainstorming: **recovery + empathy**, **agent tone**, **speech patterns**.
- **Compliance** → the **3 compliance areas** (Security · Regulatory · Legal) with their catalogued items and per-item status.
- **Business Insights** → the **5 predefined business signals** (Early Objection · Unhandled Objection · Competitor Plus Cost · Mis-targeted Offer · Best Time Frame) with evidence, plus the call **outcome** (conversion, non-conversion reason, competitor, best time frame).

Everything stays mock-only. No API, no store beyond what exists. Result: a navigable, realistic call-detail screen that reuses the platform's own vocabulary.

**User decisions (2026-09-12):** Compliance = 3 sibling areas (Security/Regulatory/Legal) · Sentiment extras = Recovery + Empathy, Agent Tone, Speech Patterns (no timeline/inflection points) · Build **new lightweight components inside `src/views/Campaigns`** aligned to the canonical 13-emotion model (do not reuse `evaluations-demo/SentimentAnalysisView`, it uses a legacy 6-emotion model) · Business Insights = signals **+ outcome**.

**Tech Stack:** React 19, React Router v7, Mantine v9, `@tabler/icons-react`, TypeScript strict. This section (`src/views/Campaigns`) is hardcoded-English mock UI with **2-space indentation** and relative imports — keep that style (no i18n namespace for this prototype).

---

## Reference catalog (existing code the plan mirrors — read, do not modify)

| Concept | Source of truth | What we copy |
|---|---|---|
| COPC error types | `src/models/qa/evaluations.ts:74-85` (`errorCriticoBusiness` ECN, `errorCriticoNonBusiness` ENC, `errorCriticoCompliance` ECC, `errorCriticoEndUser` ECUF) · labels `src/locales/en/qa.triggers.json:46-49` · 4-column layout `src/modules/qa/dashboard/components/COPCScoreCard.tsx:115-160` | codes, labels, 4-card grid |
| Score ring | `src/modules/qa/evaluations/ManualEvaluationPage/components/ScoreSummaryCard.tsx:37-101` (`RingProgress` size 124, thickness 12, `roundCaps`) | ring pattern |
| Sentiment model | `src/modules/qa/emotion-sentiment/types.ts` — `SentimentCategory`, `Emotion` (13), `EMOTION_SENTIMENT_MAP` | **import directly** |
| Sentiment colors/icons | `src/modules/qa/emotion-sentiment/components/SentimentCategoryComparison.tsx:22-63` (`CATEGORY_CONFIG`, `CATEGORY_ORDER`) and `EmotionBreakdownComparison.tsx:39-53` (`EMOTION_COLORS`) — both module-private | copy into our constants |
| Compliance areas & items | `src/modules/qa/agent/analytics/tabs/ComplianceAnalyticsTab.tsx:91-134` (`COMPLIANCE_AREA_CONFIG`, module-private) · area colors `:164-168` (security blue, regulatory orange, legal red) · score ramp `getComplianceColor` `:290-296` | copy catalog + ramp |
| Business signals | `src/models/qa/businessInsightTypes.ts:30-56` `PREDEFINED_BUSINESS_INSIGHTS` | **import directly** |
| Non-conversion reasons | `docs/superpowers/plans/2026-09-10-dashboard-evaluation-views.md:396-421` (`priceTooHigh, noNeed, distrustQuality, thirdPartyDecision, installationRequirements, other`) | copy labels |
| Card wrapper | `src/components/SectionCard` (`title`, `description`, `icon`, `headerActions`, `contentSpacing`, `padding`) | use everywhere |
| Current page | `src/views/Campaigns/pages/ConversationEvaluations.tsx` (305 lines; route `campaigns/:campaignId/calls/:callId` under `/qa`, id `qa.campaigns.conversation`, `src/routes.tsx:1271-1281`) | rewrite in Task 8 |
| Current mocks | `src/views/Campaigns/constants.ts:236-261` (`mockConversationEvaluations` — unused after this plan, `mockCampaignNames`) | extend |

---

## Global Constraints

- **Design-session rules (DESIGN_ROLE.md):** mock only. `npm run typecheck` after each task. Commits are allowed in this session (session override); do them at the end (Task 9) on a feature branch.
- **Dark/light mode is mandatory (CLAUDE.md).** Use Mantine color props (`c`, `bg`, `color`) and theme-aware variables only: `var(--mantine-color-gray-light)`, `var(--mantine-color-<color>-light)`, `var(--mantine-color-default-border)`, `var(--mantine-color-dimmed)`. **Never** `var(--mantine-color-gray-0)` / `-gray-1` / `-blue-0` alone (they break in dark mode) — the current page uses them; replace all of them in Task 8.
- Reuse `SectionCard` for every titled block. Mantine `Card withBorder` only for the small tiles inside grids.
- No new store, no router changes, no i18n files. Hardcoded English strings, 2-space indent, relative imports inside `src/views/Campaigns`, `~/` for shared modules.
- TypeScript strict, no `any`. Do not modify anything under `src/modules/**` or `src/models/**`.

---

## File Structure

### New files
```
src/views/Campaigns/components/call-evaluation/
  scoreColor.ts               — getScoreColor(score) ramp shared by all panels
  EvidenceQuote.tsx           — timestamp + quote + speaker chip (shared)
  QAEvaluationPanel.tsx       — Task 4
  SentimentEmotionPanel.tsx   — Task 5
  CompliancePanel.tsx         — Task 6
  BusinessInsightsPanel.tsx   — Task 7
```

### Modified files
```
src/views/Campaigns/types.ts                              — Task 1 (append call-evaluation types, remove EvaluationType/ConversationEvaluation)
src/views/Campaigns/constants.ts                          — Task 2 (catalogs + mockCallEvaluationDetail, remove mockConversationEvaluations)
src/views/Campaigns/pages/ConversationEvaluations.tsx     — Task 8 (rewrite)
```

---

## Task 1 — Types (`src/views/Campaigns/types.ts`)

- [ ] Delete lines 91-98 (`export type EvaluationType = ...` and `export interface ConversationEvaluation {...}`); nothing else will reference them after Task 2/8.
- [ ] Append the block below at the end of the file.

```ts
import type { Emotion, SentimentCategory } from '~/modules/qa/emotion-sentiment/types';

// ---------- Call detail: evaluation tabs ----------

export type CallEvaluationTab = 'qa' | 'sentiment-emotion' | 'compliance' | 'business-insights';

export type Speaker = 'agent' | 'customer';

export interface TranscriptTurn {
  id: string;
  speaker: Speaker;
  timestamp: string; // m:ss
  text: string;
}

export interface Evidence {
  timestamp: string; // m:ss
  speaker: Speaker;
  quote: string;
}

// ---------- QA (COPC error types) ----------

export type QAErrorTypeCode = 'ECN' | 'ENC' | 'ECC' | 'ECUF';
export type QAItemAnswer = 'yes' | 'no' | 'na';
export type QAStatus = 'good' | 'warning' | 'critical';

export interface QAErrorTypeScore {
  code: QAErrorTypeCode;
  score: number; // 0-100, points earned / points possible for items of this type
  errorsFound: number;
  itemsEvaluated: number;
  status: QAStatus;
}

export interface QAItemResult {
  id: string;
  name: string;
  errorType: QAErrorTypeCode;
  answer: QAItemAnswer;
  valuation: number; // points possible
  awarded: number; // points earned
  evidence?: Evidence;
}

export interface QAAspectResult {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  items: QAItemResult[];
}

export interface CallQAEvaluation {
  overallScore: number; // 0-100
  passed: boolean;
  passThreshold: number;
  autoFailCount: number;
  qaFormName: string;
  errorTypes: QAErrorTypeScore[];
  aspects: QAAspectResult[];
}

// ---------- Sentiment & Emotion ----------

export interface EmotionShare {
  emotion: Emotion;
  percentage: number;
}

export interface SpeakerSentiment {
  overallCategory: SentimentCategory;
  overallScore: number; // 1.0-5.0 (1 = very negative, 5 = very positive)
  dominantEmotion: Emotion;
  categories: Record<SentimentCategory, number>; // percentages, sum 100
  emotions: EmotionShare[]; // sorted desc
}

export interface SentimentRecovery {
  startCategory: SentimentCategory;
  startScore: number;
  lowestCategory: SentimentCategory;
  lowestScore: number;
  lowestAt: string; // m:ss
  endCategory: SentimentCategory;
  endScore: number;
  recovered: boolean;
  recoveryTimeSeconds: number;
  improvementDelta: number; // endScore - startScore
}

export interface EmpathyIndicator {
  timestamp: string;
  phrase: string;
  context: string;
}

export interface AgentTone {
  polite: number; // 0-100
  professional: number;
  empathetic: number;
  consistency: number; // 0-100, how stable the tone stayed
}

export interface SpeechPatterns {
  talkTimeRatio: { agent: number; customer: number }; // percentages
  silenceCount: number;
  totalSilenceSeconds: number;
  longestSilenceSeconds: number;
  avgResponseLatencySeconds: number;
  interruptions: { byAgent: number; byCustomer: number };
  agentWordsPerMinute: number;
}

export interface CallSentimentEvaluation {
  agent: SpeakerSentiment;
  customer: SpeakerSentiment;
  recovery: SentimentRecovery;
  empathyIndicators: EmpathyIndicator[];
  tone: AgentTone;
  speech: SpeechPatterns;
}

// ---------- Compliance ----------

export type ComplianceAreaKey = 'security' | 'regulatory' | 'legal';
export type ComplianceItemStatus = 'compliant' | 'warning' | 'violation';

export interface ComplianceItemResult {
  key: string;
  label: string;
  status: ComplianceItemStatus;
  score: number; // 0-100
  note?: string;
  evidence?: Evidence;
}

export interface ComplianceAreaResult {
  key: ComplianceAreaKey;
  score: number; // 0-100
  items: ComplianceItemResult[];
}

export interface CallComplianceEvaluation {
  overallScore: number;
  status: ComplianceItemStatus;
  violationCount: number;
  warningCount: number;
  areas: ComplianceAreaResult[];
}

// ---------- Business Insights ----------

export type BusinessSignalType =
  | 'EARLY_OBJECTION'
  | 'UNHANDLED_OBJECTION'
  | 'COMPETITOR_PLUS_COST'
  | 'MISTARGETED_OFFER'
  | 'BEST_TIME_FRAME';

export type NonConversionReasonKey =
  | 'priceTooHigh'
  | 'noNeed'
  | 'distrustQuality'
  | 'thirdPartyDecision'
  | 'installationRequirements'
  | 'other';

export interface BusinessSignalResult {
  type: BusinessSignalType;
  detected: boolean;
  evidence?: Evidence;
  note?: string;
}

export interface BusinessOutcome {
  converted: boolean;
  offerPresented: string;
  nonConversionReason?: NonConversionReasonKey;
  competitorMentioned?: string;
  bestTimeFrame?: string;
  followUpRecommended: boolean;
}

export interface CallBusinessEvaluation {
  signals: BusinessSignalResult[];
  outcome: BusinessOutcome;
}

// ---------- Aggregate ----------

export interface CallEvaluationDetail {
  callId: string;
  fileName: string;
  agentName: string;
  customerName: string;
  date: string;
  durationSeconds: number;
  direction: 'inbound' | 'outbound';
  transcript: TranscriptTurn[];
  qa: CallQAEvaluation;
  sentiment: CallSentimentEvaluation;
  compliance: CallComplianceEvaluation;
  business: CallBusinessEvaluation;
}
```

- [ ] `npm run typecheck` — expect errors only in `constants.ts` (`ConversationEvaluation` import) and `ConversationEvaluations.tsx` (`EvaluationType`); Task 2 and Task 8 fix them.

---

## Task 2 — Catalogs + mock data (`src/views/Campaigns/constants.ts`)

- [ ] Remove `ConversationEvaluation` from the type import at the top (lines 3-12) and delete `mockConversationEvaluations` (lines 236-255). Keep `mockCampaignNames`.
- [ ] Extend the type import with: `CallEvaluationTab, CallEvaluationDetail, QAErrorTypeCode, ComplianceAreaKey, BusinessSignalType, NonConversionReasonKey`.
- [ ] Add these imports after the local type import:

```ts
import type { TablerIcon } from '@tabler/icons-react';
import {
  IconClipboardList,
  IconMoodSmile,
  IconMoodSmileBeam,
  IconMoodEmpty,
  IconMoodSad,
  IconMoodAngry,
  IconShieldCheck,
  IconTrendingUp,
} from '@tabler/icons-react';
import type { Emotion, SentimentCategory } from '~/modules/qa/emotion-sentiment/types';
```

- [ ] Append the catalogs (paste-ready):

```ts
// ---------- Call detail: tab catalog ----------

export interface CallEvaluationTabMeta {
  key: CallEvaluationTab;
  label: string;
  description: string;
  icon: TablerIcon;
  color: string; // Mantine color name
}

export const CALL_EVALUATION_TABS: CallEvaluationTabMeta[] = [
  { key: 'qa', label: 'QA', description: 'Quality Assurance — COPC error types and aspect scores', icon: IconClipboardList, color: 'orange' },
  { key: 'sentiment-emotion', label: 'Sentiment and Emotion', description: 'Sentiment categories and emotions for agent and customer', icon: IconMoodSmile, color: 'violet' },
  { key: 'compliance', label: 'Compliance', description: 'Security, Regulatory and Legal compliance checks', icon: IconShieldCheck, color: 'green' },
  { key: 'business-insights', label: 'Business Insights', description: 'Business signals detected and call outcome', icon: IconTrendingUp, color: 'blue' },
];

// ---------- QA error types (COPC) — mirrors src/models/qa/evaluations.ts:74-85 ----------

export interface QAErrorTypeMeta {
  code: QAErrorTypeCode;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
}

export const QA_ERROR_TYPES: Record<QAErrorTypeCode, QAErrorTypeMeta> = {
  ECN: { code: 'ECN', label: 'Critical Business Error', shortLabel: 'Business Critical', description: 'Errors that put the sale, retention or business outcome at risk', color: 'red' },
  ENC: { code: 'ENC', label: 'Non-Critical Error', shortLabel: 'Non-Critical', description: 'Process or soft-skill misses that do not invalidate the call', color: 'orange' },
  ECC: { code: 'ECC', label: 'Critical Compliance Error', shortLabel: 'Compliance', description: 'Missing disclosures, consent or regulatory steps', color: 'grape' },
  ECUF: { code: 'ECUF', label: 'Critical End-User Error', shortLabel: 'End-User', description: 'Errors that harm the customer (misinformation, wrong commitments)', color: 'yellow' },
};

export const QA_ERROR_TYPE_ORDER: QAErrorTypeCode[] = ['ECN', 'ENC', 'ECC', 'ECUF'];

// ---------- Sentiment categories & emotions — mirrors emotion-sentiment/components ----------

export interface SentimentCategoryMeta {
  key: SentimentCategory;
  label: string;
  color: string;
  icon: TablerIcon;
}

export const SENTIMENT_CATEGORY_ORDER: SentimentCategory[] = [
  'very-negative',
  'negative',
  'neutral',
  'positive',
  'very-positive',
];

export const SENTIMENT_CATEGORIES: Record<SentimentCategory, SentimentCategoryMeta> = {
  'very-negative': { key: 'very-negative', label: 'Very Negative', color: 'red', icon: IconMoodAngry },
  'negative': { key: 'negative', label: 'Negative', color: 'orange', icon: IconMoodSad },
  'neutral': { key: 'neutral', label: 'Neutral', color: 'gray', icon: IconMoodEmpty },
  'positive': { key: 'positive', label: 'Positive', color: 'teal', icon: IconMoodSmile },
  'very-positive': { key: 'very-positive', label: 'Very Positive', color: 'green', icon: IconMoodSmileBeam },
};

export const EMOTION_COLORS: Record<Emotion, string> = {
  RAGE: 'red',
  ANGER: 'red',
  FRUSTRATION: 'orange',
  DISAPPOINTMENT: 'orange',
  SADNESS: 'orange',
  FEAR: 'yellow',
  NEUTRAL: 'gray',
  SURPRISE: 'blue',
  RELIEF: 'teal',
  SATISFACTION: 'teal',
  GRATITUDE: 'teal',
  JOY: 'green',
  ELATION: 'green',
};

export const EMOTION_LABELS: Record<Emotion, string> = {
  RAGE: 'Rage',
  ANGER: 'Anger',
  FRUSTRATION: 'Frustration',
  DISAPPOINTMENT: 'Disappointment',
  SADNESS: 'Sadness',
  FEAR: 'Fear',
  NEUTRAL: 'Neutral',
  SURPRISE: 'Surprise',
  RELIEF: 'Relief',
  SATISFACTION: 'Satisfaction',
  GRATITUDE: 'Gratitude',
  JOY: 'Joy',
  ELATION: 'Elation',
};

// ---------- Compliance areas — mirrors ComplianceAnalyticsTab.tsx:91-134 ----------

export interface ComplianceAreaMeta {
  key: ComplianceAreaKey;
  label: string;
  description: string;
  color: string;
  items: { key: string; label: string }[];
}

export const COMPLIANCE_AREAS: Record<ComplianceAreaKey, ComplianceAreaMeta> = {
  security: {
    key: 'security',
    label: 'Security',
    description: 'Customer data handling and mandatory disclosures',
    color: 'blue',
    items: [
      { key: 'dataProtection', label: 'Data Protection' },
      { key: 'disclosureCompliance', label: 'Disclosure Compliance' },
    ],
  },
  regulatory: {
    key: 'regulatory',
    label: 'Regulatory',
    description: 'Regulated billing and transparency obligations',
    color: 'orange',
    items: [
      { key: 'cobranzaRegulada', label: 'Billing Process' },
      { key: 'transparenciaConsentimiento', label: 'Transparency' },
    ],
  },
  legal: {
    key: 'legal',
    label: 'Legal',
    description: 'Legal conduct and contact restrictions',
    color: 'red',
    items: [
      { key: 'amenazasTradicionales', label: 'Threats' },
      { key: 'rrss', label: 'Social Media' },
      { key: 'superintendenciaBancos', label: 'Banking Superintendence' },
      { key: 'noLlamarList', label: 'Do-Not-Call' },
    ],
  },
};

export const COMPLIANCE_AREA_ORDER: ComplianceAreaKey[] = ['security', 'regulatory', 'legal'];

// ---------- Business signals — mirrors src/models/qa/businessInsightTypes.ts ----------

export interface BusinessSignalMeta {
  type: BusinessSignalType;
  label: string;
  description: string;
  tone: 'risk' | 'opportunity';
}

export const BUSINESS_SIGNALS: Record<BusinessSignalType, BusinessSignalMeta> = {
  EARLY_OBJECTION: { type: 'EARLY_OBJECTION', label: 'Early Objection', description: 'Customer shows objection early in the call', tone: 'risk' },
  UNHANDLED_OBJECTION: { type: 'UNHANDLED_OBJECTION', label: 'Unhandled Objection', description: 'Customer objection was not properly addressed', tone: 'risk' },
  COMPETITOR_PLUS_COST: { type: 'COMPETITOR_PLUS_COST', label: 'Competitor Plus Cost', description: 'Customer mentions competitor with better pricing', tone: 'risk' },
  MISTARGETED_OFFER: { type: 'MISTARGETED_OFFER', label: 'Mis-targeted Offer', description: 'Offer was not appropriate for customer needs', tone: 'risk' },
  BEST_TIME_FRAME: { type: 'BEST_TIME_FRAME', label: 'Best Time Frame', description: 'Ideal time frame for customer purchase identified', tone: 'opportunity' },
};

export const BUSINESS_SIGNAL_ORDER: BusinessSignalType[] = [
  'EARLY_OBJECTION',
  'UNHANDLED_OBJECTION',
  'COMPETITOR_PLUS_COST',
  'MISTARGETED_OFFER',
  'BEST_TIME_FRAME',
];

export const NON_CONVERSION_REASON_LABELS: Record<NonConversionReasonKey, string> = {
  priceTooHigh: 'Price too high',
  noNeed: 'No need for the product',
  distrustQuality: 'Distrust in quality / service',
  thirdPartyDecision: 'Decision depends on a third party',
  installationRequirements: 'Installation requirements',
  other: 'Other',
};
```

- [ ] Append the mock call (paste-ready). Numbers are internally consistent: QA awarded 87/100; error-type scores derive from their items; compliance overall = average of area scores.

```ts
// ---------- Mock call detail (used for every :callId in the prototype) ----------

export const mockCallEvaluationDetail: CallEvaluationDetail = {
  callId: 'call-001',
  fileName: 'call_001_2026-07-20.mp3',
  agentName: 'Sarah Johnson',
  customerName: 'Mr. Doe',
  date: '2026-07-20 14:32',
  durationSeconds: 165,
  direction: 'outbound',
  transcript: [
    { id: 't1', speaker: 'agent', timestamp: '0:00', text: 'Good afternoon, this is Sarah from Newtech. Am I speaking with Mr. Doe? This call may be recorded for quality purposes.' },
    { id: 't2', speaker: 'customer', timestamp: '0:09', text: 'Yes, that\'s me.' },
    { id: 't3', speaker: 'agent', timestamp: '0:14', text: 'Great. I see you\'ve been with us on the 200 Mbps plan for two years, thank you for that. I\'m calling because we have a new Premium Fiber 500 bundle with TV included.' },
    { id: 't4', speaker: 'customer', timestamp: '0:41', text: 'Honestly, I\'m not looking to spend more right now.' },
    { id: 't5', speaker: 'agent', timestamp: '0:50', text: 'I completely understand, nobody wants a bigger bill. Can I ask how the current speed is working for you and your family?' },
    { id: 't6', speaker: 'customer', timestamp: '1:05', text: 'It\'s fine mostly, but it slows down at night when everyone is streaming.' },
    { id: 't7', speaker: 'agent', timestamp: '1:15', text: 'That\'s exactly what the 500 plan fixes. For the first six months it would be $49.99, and it includes the TV package.' },
    { id: 't8', speaker: 'customer', timestamp: '1:48', text: 'Claro offers the same speed for less, and I don\'t know what this costs after six months.' },
    { id: 't9', speaker: 'agent', timestamp: '1:58', text: 'I hear you. Let me note that down. Is there a good time for us to follow up?' },
    { id: 't10', speaker: 'customer', timestamp: '2:10', text: 'Call me back after the 15th, when my current contract ends.' },
    { id: 't11', speaker: 'agent', timestamp: '2:22', text: 'Perfect, I\'ll schedule that. Thank you for your time, Mr. Doe, have a great afternoon.' },
    { id: 't12', speaker: 'customer', timestamp: '2:35', text: 'Thanks, you too.' },
  ],
  qa: {
    overallScore: 87,
    passed: true,
    passThreshold: 80,
    autoFailCount: 0,
    qaFormName: 'Sales Call Quality Standards',
    errorTypes: [
      { code: 'ECN', score: 80, errorsFound: 1, itemsEvaluated: 3, status: 'critical' },
      { code: 'ENC', score: 73, errorsFound: 2, itemsEvaluated: 5, status: 'warning' },
      { code: 'ECC', score: 100, errorsFound: 0, itemsEvaluated: 3, status: 'good' },
      { code: 'ECUF', score: 100, errorsFound: 0, itemsEvaluated: 2, status: 'good' },
    ],
    aspects: [
      {
        id: 'asp-opening', name: 'Opening & Identification', score: 15, maxScore: 15,
        items: [
          { id: 'q1', name: 'Greeting and company identification', errorType: 'ENC', answer: 'yes', valuation: 5, awarded: 5 },
          { id: 'q2', name: 'Verified customer identity before discussing the account', errorType: 'ECC', answer: 'yes', valuation: 10, awarded: 10 },
        ],
      },
      {
        id: 'asp-needs', name: 'Needs Assessment', score: 10, maxScore: 15,
        items: [
          { id: 'q3', name: 'Asked discovery questions before presenting the offer', errorType: 'ENC', answer: 'no', valuation: 5, awarded: 0,
            evidence: { timestamp: '0:14', speaker: 'agent', quote: 'I\'m calling because we have a new Premium Fiber 500 bundle with TV included.' } },
          { id: 'q4', name: 'Confirmed current plan and usage', errorType: 'ECN', answer: 'yes', valuation: 10, awarded: 10 },
        ],
      },
      {
        id: 'asp-offer', name: 'Offer Presentation', score: 25, maxScore: 25,
        items: [
          { id: 'q5', name: 'Presented an offer matching the stated need', errorType: 'ECN', answer: 'yes', valuation: 10, awarded: 10 },
          { id: 'q6', name: 'Stated price and terms clearly', errorType: 'ECC', answer: 'yes', valuation: 10, awarded: 10 },
          { id: 'q7', name: 'No misleading claims about the product', errorType: 'ECUF', answer: 'yes', valuation: 5, awarded: 5 },
        ],
      },
      {
        id: 'asp-objections', name: 'Objection Handling', score: 10, maxScore: 15,
        items: [
          { id: 'q8', name: 'Acknowledged the customer\'s objection', errorType: 'ENC', answer: 'yes', valuation: 10, awarded: 10 },
          { id: 'q9', name: 'Resolved the main objection (price / competitor)', errorType: 'ECN', answer: 'no', valuation: 5, awarded: 0,
            evidence: { timestamp: '1:48', speaker: 'customer', quote: 'Claro offers the same speed for less, and I don\'t know what this costs after six months.' } },
        ],
      },
      {
        id: 'asp-closing', name: 'Closing', score: 7, maxScore: 10,
        items: [
          { id: 'q10', name: 'Recapped the offer and next steps', errorType: 'ENC', answer: 'no', valuation: 3, awarded: 0,
            evidence: { timestamp: '2:22', speaker: 'agent', quote: 'Perfect, I\'ll schedule that. Thank you for your time.' } },
          { id: 'q11', name: 'Thanked the customer and closed professionally', errorType: 'ENC', answer: 'yes', valuation: 7, awarded: 7 },
        ],
      },
      {
        id: 'asp-disclosures', name: 'Mandatory Disclosures', score: 20, maxScore: 20,
        items: [
          { id: 'q12', name: 'Recording disclosure given at the start', errorType: 'ECC', answer: 'yes', valuation: 10, awarded: 10 },
          { id: 'q13', name: 'Contract and cancellation terms disclosed', errorType: 'ECUF', answer: 'yes', valuation: 10, awarded: 10 },
        ],
      },
    ],
  },
  sentiment: {
    agent: {
      overallCategory: 'positive',
      overallScore: 4.1,
      dominantEmotion: 'SATISFACTION',
      categories: { 'very-negative': 0, 'negative': 10, 'neutral': 45, 'positive': 45, 'very-positive': 0 },
      emotions: [
        { emotion: 'NEUTRAL', percentage: 45 },
        { emotion: 'SATISFACTION', percentage: 30 },
        { emotion: 'GRATITUDE', percentage: 15 },
        { emotion: 'FRUSTRATION', percentage: 10 },
      ],
    },
    customer: {
      overallCategory: 'negative',
      overallScore: 2.6,
      dominantEmotion: 'FRUSTRATION',
      categories: { 'very-negative': 0, 'negative': 50, 'neutral': 38, 'positive': 12, 'very-positive': 0 },
      emotions: [
        { emotion: 'FRUSTRATION', percentage: 35 },
        { emotion: 'NEUTRAL', percentage: 30 },
        { emotion: 'DISAPPOINTMENT', percentage: 15 },
        { emotion: 'RELIEF', percentage: 12 },
        { emotion: 'SURPRISE', percentage: 8 },
      ],
    },
    recovery: {
      startCategory: 'negative',
      startScore: 2.0,
      lowestCategory: 'negative',
      lowestScore: 1.8,
      lowestAt: '1:48',
      endCategory: 'positive',
      endScore: 3.6,
      recovered: true,
      recoveryTimeSeconds: 57,
      improvementDelta: 1.6,
    },
    empathyIndicators: [
      { timestamp: '0:50', phrase: 'I completely understand, nobody wants a bigger bill.', context: 'After the early price objection' },
      { timestamp: '1:58', phrase: 'I hear you. Let me note that down.', context: 'After the competitor comparison' },
      { timestamp: '2:22', phrase: 'Thank you for your time, Mr. Doe.', context: 'Closing' },
    ],
    tone: { polite: 92, professional: 88, empathetic: 71, consistency: 84 },
    speech: {
      talkTimeRatio: { agent: 58, customer: 42 },
      silenceCount: 3,
      totalSilenceSeconds: 14,
      longestSilenceSeconds: 7,
      avgResponseLatencySeconds: 1.8,
      interruptions: { byAgent: 1, byCustomer: 1 },
      agentWordsPerMinute: 148,
    },
  },
  compliance: {
    overallScore: 95,
    status: 'warning',
    violationCount: 0,
    warningCount: 1,
    areas: [
      {
        key: 'security', score: 100,
        items: [
          { key: 'dataProtection', label: 'Data Protection', status: 'compliant', score: 100, note: 'No sensitive data requested or read aloud' },
          { key: 'disclosureCompliance', label: 'Disclosure Compliance', status: 'compliant', score: 100, note: 'Recording disclosure given at 0:00' },
        ],
      },
      {
        key: 'regulatory', score: 85,
        items: [
          { key: 'cobranzaRegulada', label: 'Billing Process', status: 'compliant', score: 100, note: 'No billing changes applied on the call' },
          { key: 'transparenciaConsentimiento', label: 'Transparency', status: 'warning', score: 70, note: 'Promotional price quoted without stating the regular price after month six',
            evidence: { timestamp: '1:15', speaker: 'agent', quote: 'For the first six months it would be $49.99, and it includes the TV package.' } },
        ],
      },
      {
        key: 'legal', score: 100,
        items: [
          { key: 'amenazasTradicionales', label: 'Threats', status: 'compliant', score: 100 },
          { key: 'rrss', label: 'Social Media', status: 'compliant', score: 100 },
          { key: 'superintendenciaBancos', label: 'Banking Superintendence', status: 'compliant', score: 100 },
          { key: 'noLlamarList', label: 'Do-Not-Call', status: 'compliant', score: 100, note: 'Customer agreed to a follow-up call' },
        ],
      },
    ],
  },
  business: {
    signals: [
      { type: 'EARLY_OBJECTION', detected: true,
        evidence: { timestamp: '0:41', speaker: 'customer', quote: 'Honestly, I\'m not looking to spend more right now.' } },
      { type: 'UNHANDLED_OBJECTION', detected: true, note: 'Agent moved to scheduling a follow-up without answering the price-after-promo question',
        evidence: { timestamp: '1:48', speaker: 'customer', quote: 'I don\'t know what this costs after six months.' } },
      { type: 'COMPETITOR_PLUS_COST', detected: true, note: 'Competitor: Claro',
        evidence: { timestamp: '1:48', speaker: 'customer', quote: 'Claro offers the same speed for less.' } },
      { type: 'MISTARGETED_OFFER', detected: false, note: 'Offer matched the stated need (evening slowdowns)' },
      { type: 'BEST_TIME_FRAME', detected: true,
        evidence: { timestamp: '2:10', speaker: 'customer', quote: 'Call me back after the 15th, when my current contract ends.' } },
    ],
    outcome: {
      converted: false,
      offerPresented: 'Premium Fiber 500 Mbps + TV bundle',
      nonConversionReason: 'priceTooHigh',
      competitorMentioned: 'Claro',
      bestTimeFrame: 'After the 15th (current contract ends)',
      followUpRecommended: true,
    },
  },
};
```

- [ ] `npm run typecheck` — only `ConversationEvaluations.tsx` should still error (fixed in Task 8).

---

## Task 3 — Shared helpers (`src/views/Campaigns/components/call-evaluation/`)

- [ ] `scoreColor.ts` (mirrors `getComplianceColor` ramp):

```ts
export const getScoreColor = (score: number): string => {
  if (score >= 90) return 'green';
  if (score >= 80) return 'lime';
  if (score >= 70) return 'yellow';
  if (score >= 60) return 'orange';
  return 'red';
};

export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};
```

- [ ] `EvidenceQuote.tsx` — props `{ evidence: Evidence }`. Renders a `Paper` (`withBorder`, `radius="sm"`, `p="xs"`, `bg="var(--mantine-color-gray-light)"`) with:
  - top row `Group gap="xs"`: `Badge size="xs" variant="light" color={speaker === 'agent' ? 'blue' : 'gray'}` → "Agent"/"Customer"; `Text size="xs" c="dimmed"` → `evidence.timestamp` prefixed with `IconClock size={12}`.
  - `Text size="sm" fs="italic"` → `“{evidence.quote}”`.

---

## Task 4 — `QAEvaluationPanel.tsx`

Props: `{ qa: CallQAEvaluation }`. Layout (a `Stack gap="md"`):

| Block | Component | Content / behaviour |
|---|---|---|
| Header | `SectionCard` `padding="lg"` | `Group align="center" gap="xl"`: **left** `RingProgress size={124} thickness={12} roundCaps sections=[{ value: overallScore, color: getScoreColor(overallScore) }]` with center `Text fw={700} size="xl"` `{overallScore}%`. **right** `Stack gap={4}`: `Text fw={600}` "QA Score", `Group gap="xs"`: `Badge color={passed ? 'green' : 'red'} variant="filled"` "Passed"/"Failed"; `Badge variant="light" color="gray"` `Threshold {passThreshold}%`; `Badge variant="light" color={autoFailCount ? 'red' : 'green'}` `{autoFailCount} auto-fails`. `Text size="xs" c="dimmed"` `Form: {qaFormName}`. |
| Error types | `SectionCard title="Error Types (COPC)" description="Score per error type across all evaluated items"` | `SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm"`. One `Card withBorder radius="md" p="md"` per `QA_ERROR_TYPE_ORDER` entry (find in `qa.errorTypes`): `Group justify="space-between"`: `Badge color={meta.color} variant="filled"` `{code}` + status icon (`IconCircleCheck` green for good, `IconAlertTriangle` yellow for warning, `IconAlertOctagon` red for critical, size 16). `Text fw={700} size="xl"` `{score}%`. `Text size="xs" c="dimmed"` `{meta.shortLabel}`. `Progress value={score} color={meta.color} size="sm" mt="xs"`. `Text size="xs" c="dimmed" mt={4}` `{errorsFound} error(s) · {itemsEvaluated} items`. `Tooltip label={meta.description}` on the badge. |
| Aspects | `SectionCard title="Aspects" description="Item-level results grouped by aspect"` | `Accordion variant="separated" multiple defaultValue={aspects with score < maxScore → their ids}`. Each `Accordion.Item value={aspect.id}`: `Accordion.Control` → `Group justify="space-between" pr="md"`: `Text fw={600}` name; `Group gap="xs"`: `Text size="sm" c="dimmed"` `{score}/{maxScore} pts`, `Badge color={getScoreColor(pct)} variant="light"` `{pct}%` (pct = round(score/maxScore*100)). `Accordion.Panel` → `Stack gap="xs"`; each item a `Paper withBorder p="sm" radius="sm"`: `Group justify="space-between" align="flex-start" wrap="nowrap"`: left `Stack gap={4}`: `Text size="sm"` name; `Group gap={6}`: `Badge size="xs" color={QA_ERROR_TYPES[item.errorType].color} variant="light"` `{errorType}`, `Badge size="xs" variant="outline" color="gray"` `{valuation} pts`. right `Badge variant="filled" color={answer === 'yes' ? 'green' : answer === 'no' ? 'red' : 'gray'}` → "Yes"/"No"/"N/A" then `Text size="xs" c="dimmed" ta="right"` `{awarded}/{valuation}`. If `item.evidence` → `<EvidenceQuote evidence={item.evidence} />` under the row (`mt="xs"`). |

- [ ] `npm run typecheck`.

---

## Task 5 — `SentimentEmotionPanel.tsx`

Props: `{ sentiment: CallSentimentEvaluation }`. Layout `Stack gap="md"`:

| Block | Component | Content / behaviour |
|---|---|---|
| Speaker cards | `SimpleGrid cols={{ base: 1, md: 2 }} spacing="md"` | One `SectionCard` per speaker (`title="Agent"` with `icon={IconHeadset}`, `title="Customer"` with `icon={IconUser}`). Inside: **headline** `Group gap="md" align="center"`: `ThemeIcon size={48} radius="md" variant="light" color={cat.color}` with `cat.icon size={28}`; `Stack gap={0}`: `Text fw={700} size="lg"` `{cat.label}`, `Text size="sm" c="dimmed"` `Score {overallScore.toFixed(1)} / 5.0 · Dominant: {EMOTION_LABELS[dominantEmotion]}`. **Category distribution** (`Text size="xs" fw={600} c="dimmed" tt="uppercase" mt="md"` "Sentiment categories"): a single `Progress.Root size="lg"` containing one `Progress.Section value={pct} color={SENTIMENT_CATEGORIES[key].color}` per `SENTIMENT_CATEGORY_ORDER` (skip 0), each with `Tooltip label="{label} {pct}%"`. Below it a legend `Group gap="sm"`: for each category with pct > 0 → `Group gap={4}`: `ColorSwatch size={10} color={`var(--mantine-color-${color}-6)`}` + `Text size="xs"` `{label} {pct}%`. **Emotions** (`Text size="xs" fw={600} c="dimmed" tt="uppercase" mt="md"` "Emotions detected"): `Stack gap={6}`; per `emotions[]` row: `Group justify="space-between"`: `Badge variant="light" color={EMOTION_COLORS[emotion]}` `{EMOTION_LABELS[emotion]}` + `Text size="xs" c="dimmed"` `{pct}%`; then `Progress value={pct} color={EMOTION_COLORS[emotion]} size="xs"`. |
| Recovery & Empathy | `SectionCard title="Recovery & Empathy" description="How the customer's sentiment evolved and how the agent responded" icon={IconHeartHandshake}` | `Grid gap="md"`. **Col md=7 "Customer sentiment journey"**: `Group gap="xs" align="center" wrap="nowrap"` with three stat tiles (`Paper withBorder p="sm" radius="sm" style={{ flex: 1 }}`): Start → `Text size="xs" c="dimmed"` "Start", `Badge color={cat.color} variant="light"` label, `Text fw={700}` `{startScore.toFixed(1)}`; Lowest → same with `Text size="xs" c="dimmed"` `at {lowestAt}`; End → same. Between tiles `IconArrowRight size={16}` `c="dimmed"`. Under tiles `Group gap="xs" mt="sm"`: `Badge color={recovered ? 'green' : 'red'} variant="filled" leftSection={recovered ? <IconTrendingUp size={12}/> : <IconTrendingDown size={12}/>}` → "Recovered"/"Not recovered"; `Badge variant="light" color="gray"` `Recovery time {formatDuration(recoveryTimeSeconds)}`; `Badge variant="light" color={improvementDelta >= 0 ? 'teal' : 'red'}` `{improvementDelta >= 0 ? '+' : ''}{improvementDelta.toFixed(1)} pts`. **Col md=5 "Empathy indicators"**: `Text size="xs" fw={600} c="dimmed" tt="uppercase"` "Empathy phrases ({n})"; `Stack gap="xs"`; each indicator → `EvidenceQuote evidence={{ timestamp, speaker: 'agent', quote: phrase }}` followed by `Text size="xs" c="dimmed"` `{context}`. |
| Agent Tone | `SectionCard title="Agent Tone" description="Tone dimensions scored across the call" icon={IconMicrophone2}` | `SimpleGrid cols={{ base: 2, md: 4 }} spacing="md"`: four tiles for `polite` "Polite", `professional` "Professional", `empathetic` "Empathetic", `consistency` "Consistency": `Text size="xs" c="dimmed"` label; `Text fw={700} size="xl"` `{value}`; `Progress value={value} color={getScoreColor(value)} size="sm"`. |
| Speech Patterns | `SectionCard title="Speech Patterns" description="Talk time, silences and responsiveness" icon={IconWaveSine}` | **Talk-time**: `Text size="xs" fw={600} c="dimmed" tt="uppercase"` "Talk time ratio"; `Progress.Root size="xl"`: `Progress.Section value={agent} color="blue"` with `Progress.Label` `Agent {agent}%`, `Progress.Section value={customer} color="gray"` with `Progress.Label` `Customer {customer}%`. **Stats** `SimpleGrid cols={{ base: 2, md: 3 }} spacing="sm" mt="md"`, tiles `Paper withBorder p="sm" radius="sm"` with `Text size="xs" c="dimmed"` + `Text fw={700} size="lg"`: "Silences" `{silenceCount}` (sub `Text size="xs" c="dimmed"` `{totalSilenceSeconds}s total · longest {longestSilenceSeconds}s`); "Avg response latency" `{avgResponseLatencySeconds.toFixed(1)}s`; "Interruptions" `{byAgent + byCustomer}` (sub `agent {byAgent} · customer {byCustomer}`); "Agent pace" `{agentWordsPerMinute} wpm`. |

- [ ] Import `SENTIMENT_CATEGORIES`, `SENTIMENT_CATEGORY_ORDER`, `EMOTION_COLORS`, `EMOTION_LABELS` from `../../constants`; `getScoreColor`, `formatDuration` from `./scoreColor`.
- [ ] `npm run typecheck`.

---

## Task 6 — `CompliancePanel.tsx`

Props: `{ compliance: CallComplianceEvaluation }`. Status meta (local const): `compliant` → green / `IconCircleCheck` / "Compliant"; `warning` → yellow / `IconAlertTriangle` / "Warning"; `violation` → red / `IconAlertOctagon` / "Violation".

| Block | Component | Content / behaviour |
|---|---|---|
| Header | `SectionCard padding="lg"` | Same ring pattern as QA: `RingProgress` with `overallScore` and `getScoreColor`; right side `Text fw={600}` "Compliance Score", `Group gap="xs"`: `Badge variant="filled" color={statusMeta.color}` `{statusMeta.label}`; `Badge variant="light" color={violationCount ? 'red' : 'gray'}` `{violationCount} violations`; `Badge variant="light" color={warningCount ? 'yellow' : 'gray'}` `{warningCount} warnings`. `Text size="xs" c="dimmed"` "Average of Security, Regulatory and Legal area scores". |
| Areas | `Stack gap="md"` | One `SectionCard` per `COMPLIANCE_AREA_ORDER` (find in `compliance.areas`), `title={meta.label}` `description={meta.description}` `icon={IconShieldCheck}` `headerActions={<Badge color={getScoreColor(area.score)} variant="light" size="lg">{area.score}%</Badge>}`. Inside: `Progress value={area.score} color={meta.color} size="sm" mb="sm"`; then `Stack gap="xs"`; each item a `Paper withBorder p="sm" radius="sm"`: `Group justify="space-between" align="flex-start" wrap="nowrap"`: left `Stack gap={2}`: `Group gap="xs"`: status icon (`size={16}` in `statusMeta.color`) + `Text size="sm" fw={500}` label; `Text size="xs" c="dimmed"` note (if any). right `Group gap="xs"`: `Badge variant="light" color={statusMeta.color}` label; `Text size="sm" fw={600}` `{score}%`. If `evidence` → `EvidenceQuote` `mt="xs"`. |

- [ ] `npm run typecheck`.

---

## Task 7 — `BusinessInsightsPanel.tsx`

Props: `{ business: CallBusinessEvaluation }`.

| Block | Component | Content / behaviour |
|---|---|---|
| Summary | `SectionCard padding="lg"` | `Group gap="xl" align="center"`: `ThemeIcon size={56} radius="md" variant="light" color={outcome.converted ? 'green' : 'orange'}` with `IconTargetArrow size={30}`; `Stack gap={2}`: `Text fw={600}` "Call outcome"; `Group gap="xs"`: `Badge variant="filled" color={converted ? 'green' : 'orange'}` "Converted"/"Not converted"; `Badge variant="light" color="blue"` `{detectedCount} of {signals.length} signals detected`; if `followUpRecommended` → `Badge variant="light" color="teal" leftSection={<IconCalendarEvent size={12}/>}` "Follow-up recommended". `Text size="xs" c="dimmed"` `Offer: {offerPresented}`. |
| Signals | `SectionCard title="Business Signals" description="Predefined signals evaluated on this call" icon={IconSparkles}` | `Stack gap="xs"`; one `Paper withBorder p="sm" radius="sm"` per `BUSINESS_SIGNAL_ORDER` (find in `business.signals`); `opacity` **not** used — instead when `!detected` the whole row uses `c="dimmed"`. Row: `Group justify="space-between" align="flex-start" wrap="nowrap"`: left `Stack gap={2}`: `Group gap="xs"`: `ThemeIcon size="sm" radius="xl" variant={detected ? 'filled' : 'light'} color={detected ? (meta.tone === 'risk' ? 'orange' : 'teal') : 'gray'}` with `IconCheck size={12}` (detected) / `IconMinus size={12}` (not); `Text size="sm" fw={600}` `{meta.label}`; `Badge size="xs" variant="outline" color={meta.tone === 'risk' ? 'orange' : 'teal'}` "Risk"/"Opportunity". `Text size="xs" c="dimmed"` `{meta.description}`; if `note` → `Text size="xs"` note. right `Badge variant="light" color={detected ? 'blue' : 'gray'}` "Detected"/"Not detected". If `evidence` → `EvidenceQuote` `mt="xs"`. |
| Outcome details | `SectionCard title="Outcome Details" icon={IconReportAnalytics}` | `SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm"`, tiles `Paper withBorder p="sm" radius="sm"` with `Text size="xs" c="dimmed"` label + `Text size="sm" fw={600}` value: "Offer presented" `{offerPresented}`; "Non-conversion reason" `{NON_CONVERSION_REASON_LABELS[key]}` or "—"; "Competitor mentioned" `{competitorMentioned ?? 'None'}`; "Best time frame" `{bestTimeFrame ?? 'Not identified'}`. |

- [ ] `npm run typecheck`.

---

## Task 8 — Page integration (`src/views/Campaigns/pages/ConversationEvaluations.tsx`)

Rewrite the file. Keep: breadcrumbs row, title block, tab button row, 2-column `Grid`. Change:

- [ ] Imports: `Container, Title, Stack, Group, Button, Badge, Text, Card, Breadcrumbs, Anchor, ActionIcon, Grid, ScrollArea, Paper, Progress` from `@mantine/core`; `IconArrowLeft, IconPlayerPlay, IconPlayerPause, IconVolume2, IconHeadset, IconUser` from tabler; `useNavigate, useParams` from `react-router`; `useState` from react; `type { CallEvaluationTab } from '../types'`; `CALL_EVALUATION_TABS, mockCampaignNames, mockCallEvaluationDetail` from `../constants`; the four panels + `formatDuration` from `../components/call-evaluation/...`. **Remove** the old `getEvaluationTypeInfo`, `EvaluationTabType`, `renderEvaluationContent`, `mockConversationEvaluations`, `EvaluationType`, `Tabs`, `IconClipboardList`, `IconMoodSmile`, `IconShieldCheck`, `IconTrendingUp` imports.
- [ ] State: `const [selectedTab, setSelectedTab] = useState<CallEvaluationTab>('qa'); const [isPlaying, setIsPlaying] = useState(false);` `const call = mockCallEvaluationDetail;` (every `:callId` shows the same mock; breadcrumb still prints the URL `callId`).
- [ ] Headline score per tab (shown as a `Badge` inside each tab button, `variant={isSelected ? 'white' : 'light'}` `color={isSelected ? undefined : meta.color}` `size="sm"` as `rightSection`):
  - `qa` → `${call.qa.overallScore}%`
  - `sentiment-emotion` → `${call.sentiment.customer.overallScore.toFixed(1)}/5`
  - `compliance` → `${call.compliance.overallScore}%`
  - `business-insights` → `${detected}/${total}` signals
- [ ] Title block: `Title order={2}` "Call Evaluation"; `Text size="sm" c="dimmed"` → `{call.fileName} · {call.agentName} · {call.date} · {formatDuration(call.durationSeconds)} · {call.direction === 'outbound' ? 'Outbound' : 'Inbound'}`.
- [ ] Tab row: keep the `Card withBorder` + `Group gap="sm" wrap="wrap"` of `Button`s built from `CALL_EVALUATION_TABS` (`variant={isSelected ? 'filled' : 'light'}`, `color={isSelected ? meta.color : 'gray'}`, `leftSection={<meta.icon size={18} />}`, `rightSection={scoreBadge}`). Under the row: `Text size="xs" c="dimmed" mt="xs"` `{selectedMeta.description}`.
- [ ] Left column `Grid.Col span={{ base: 12, lg: 5 }}`: wrap its `Stack` in a `div` with `style={{ position: 'sticky', top: 16 }}` so player + transcript stay visible while the right panel scrolls. **Player card**: keep the existing mock (Play/Pause button, progress line, `0:57 / {formatDuration(durationSeconds)}`, volume line) but replace `var(--mantine-color-gray-0)` → `var(--mantine-color-gray-light)`, `var(--mantine-color-gray-3)` → `var(--mantine-color-default-border)`, `var(--nt-blue-500)` fills → `var(--mantine-color-blue-6)`. **Transcript card**: `Card withBorder` titled `Conversation Transcript` + `Badge size="sm" variant="light"` `{transcript.length} turns`; `ScrollArea h={420}`; map `call.transcript` → `Paper radius="sm" p="xs"` with `bg={turn.speaker === 'agent' ? 'var(--mantine-color-blue-light)' : 'var(--mantine-color-gray-light)'}`; header `Group gap={6}`: `ThemeIcon size="xs" variant="transparent"` with `IconHeadset`/`IconUser`, `Text size="xs" c="dimmed"` `{speaker === 'agent' ? 'Agent' : 'Customer'} · {timestamp}`; `Text size="sm"` text.
- [ ] Right column `Grid.Col span={{ base: 12, lg: 7 }}`: **no** wrapping card and **no** `ScrollArea` — render the panel directly so the page scrolls naturally:
  ```tsx
  {selectedTab === 'qa' && <QAEvaluationPanel qa={call.qa} />}
  {selectedTab === 'sentiment-emotion' && <SentimentEmotionPanel sentiment={call.sentiment} />}
  {selectedTab === 'compliance' && <CompliancePanel compliance={call.compliance} />}
  {selectedTab === 'business-insights' && <BusinessInsightsPanel business={call.business} />}
  ```
- [ ] Keep the breadcrumb; keep **no** "Back to Calls" button (already removed).
- [ ] `npm run typecheck` → 0 errors in `src/views/Campaigns/**` (pre-existing errors elsewhere, if any, are out of scope).

---

## Task 9 — Verification & commit

- [ ] Open the running preview (server "dev", currently at `http://localhost:8082`) at `/qa/campaigns/1/calls/call-001`.
- [ ] Check each tab: **QA** shows ring 87% · Passed · 4 error-type tiles (ECN 80% critical, ENC 73% warning, ECC 100% good, ECUF 100% good) · 6 aspects, "Needs Assessment", "Objection Handling", "Closing" expanded by default with evidence quotes. **Sentiment and Emotion** shows Agent = Positive 4.1 / Customer = Negative 2.6, stacked category bars, emotion rows, recovery tiles 2.0 → 1.8 (1:48) → 3.6 "Recovered", 3 empathy phrases, 4 tone tiles, talk-time 58/42 and 4 speech stats. **Compliance** shows 95% · Warning · Security 100 / Regulatory 85 (Transparency warning with 1:15 quote) / Legal 100. **Business Insights** shows Not converted · 4 of 5 signals · signal rows with quotes (Mis-targeted Offer dimmed "Not detected") · outcome tiles (Price too high, Claro, After the 15th).
- [ ] Tab badges show `87%`, `2.6/5`, `95%`, `4/5`.
- [ ] Dark mode: `resize_window colorScheme: dark` — no white boxes (all backgrounds via `-light`/`-default-border` variables); light mode again afterwards.
- [ ] Responsive: `resize_window preset: tablet` → columns stack; sticky left column does not overlap.
- [ ] No console errors (`read_console_messages onlyErrors`).
- [ ] Commit on a feature branch from `main`: `git checkout -b feature/call-detail-evaluation-panels` (before Task 1) → single commit `feat(campaigns): add QA, sentiment, compliance and business panels to call detail` with the Co-Authored-By trailer. Merge to `main` only when the user asks.
