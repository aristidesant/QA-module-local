// Extracted from burnout-risk-widget campaigns pages
// Unified types for the Campaigns feature

export interface Campaign {
  id: string;
  name: string;
  description: string;
  contactLists: number;
  status: 'pending' | 'active' | 'paused';
  callsScored: number;
  evaluationsCompleted: number;
  evaluationType: 'manual' | 'automatic' | 'mixed';
  createdAt: string;
  type: 'external' | 'cmx';
}

export interface CampaignDetail {
  id: string;
  name: string;
  type: 'sales' | 'localization' | 'retention' | 'activation' | 'accounts-receivable';
  responsibleContact: string;
  description: string;
  evaluatorModel?: string;
}

export interface ContactList {
  id: string;
  name: string;
  callCount: number;
  status: 'completed' | 'in-progress';
  startDate: string;
  endDate: string;
}

export interface Evaluation {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'pending';
  type: 'manual' | 'automatic';
  finalScore: number;
  result: 'passed' | 'failed';
  evaluatedPercentage: number;
  agent: string;
  llmModel: string;
  contactListIds: string[];
  createdDate: string;
}

export interface EvaluationItem {
  id: string;
  name: string;
  errorType: 'critical-business' | 'critical-client' | 'critical-compliance';
  answerType: 'yes-no' | 'yes-no-na';
  description?: string;
  valuation?: number;
}

export interface Aspect {
  id: string;
  name: string;
  description: string;
  items: EvaluationItem[];
}

export interface QATest {
  id: string;
  name: string;
  qaType: 'sales' | 'localization' | 'retention' | 'activation' | 'accounts-receivable';
  createdDate: string;
  evaluatedCampaigns: number;
  createdBy: string;
  description?: string;
  aspects?: Aspect[];
  status: 'ready' | 'draft';
}

export interface CallEvaluationResult {
  id: string;
  callId: string;
  filename: string;
  agentName: string;
  aiScore: number;
  finalScore: number;
  delta: number;
  overridden: boolean;
  mode: 'manual' | 'auto';
  evaluatorModel: string;
  evaluatedAt: string;
}


export interface UploadedFile {
  id: string;
  name: string;
  duration: string;
  format: string;
  agentName: string;
}

export interface SelectedQATest {
  id: string;
  name: string;
  qaType: string;
  status: string;
  createdDate: string;
  createdBy: string;
  description?: string;
}

export interface CampaignConfig {
  id: string;
  name: string;
  type: string;
  callDirection?: 'inbound' | 'outbound' | 'mixed';
  responsibleContact: string;
  description: string;
  uploadedFiles: UploadedFile[];
  selectedTests: SelectedQATest[];
  createdAt: string;
  source?: 'external' | 'cmx';
}

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
  score: number;
  errorsFound: number;
  itemsEvaluated: number;
  status: QAStatus;
}

export interface QAItemResult {
  id: string;
  name: string;
  errorType: QAErrorTypeCode;
  answer: QAItemAnswer;
  valuation: number;
  awarded: number;
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
  overallScore: number;
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
  overallScore: number;
  dominantEmotion: Emotion;
  categories: Record<SentimentCategory, number>;
  emotions: EmotionShare[];
}

export interface SentimentRecovery {
  startCategory: SentimentCategory;
  startScore: number;
  lowestCategory: SentimentCategory;
  lowestScore: number;
  lowestAt: string;
  endCategory: SentimentCategory;
  endScore: number;
  recovered: boolean;
  recoveryTimeSeconds: number;
  improvementDelta: number;
}

export interface EmpathyIndicator {
  timestamp: string;
  phrase: string;
  context: string;
}

export interface AgentTone {
  polite: number;
  professional: number;
  empathetic: number;
  consistency: number;
}

export interface SpeechPatterns {
  talkTimeRatio: { agent: number; customer: number };
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
  score: number;
  note?: string;
  evidence?: Evidence;
}

export interface ComplianceAreaResult {
  key: ComplianceAreaKey;
  score: number;
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
  customerId: string;
  date: string;
  durationSeconds: number;
  direction: 'inbound' | 'outbound';
  transcript: TranscriptTurn[];
  qa: CallQAEvaluation;
  sentiment: CallSentimentEvaluation;
  compliance: CallComplianceEvaluation;
  business: CallBusinessEvaluation;
}
