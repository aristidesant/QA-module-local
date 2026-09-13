// Extracted mock data from burnout-risk-widget campaigns pages

// Extracted mock data from burnout-risk-widget campaigns pages

import type {
  Campaign,
  CampaignDetail,
  ContactList,
  Evaluation,
  CallEvaluationResult,
  QATest,
  Aspect,
  CallEvaluationTab,
  CallEvaluationDetail,
  QAErrorTypeCode,
  ComplianceAreaKey,
  BusinessSignalType,
  NonConversionReasonKey,
} from './types';

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


export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Q2 Sales Performance',
    description: 'Evaluate sales calls from Q2 2026',
    contactLists: 8,
    status: 'active',
    callsScored: 45,
    evaluationsCompleted: 8,
    evaluationType: 'automatic',
    createdAt: '2026-06-01',
    type: 'external',
  },
  {
    id: '2',
    name: 'Customer Support Quality',
    description: 'CS team performance evaluation',
    contactLists: 12,
    status: 'active',
    callsScored: 87,
    evaluationsCompleted: 6,
    evaluationType: 'mixed',
    createdAt: '2026-05-15',
    type: 'cmx',
  },
  {
    id: '3',
    name: 'New Hire Training - June',
    description: 'Onboarding evaluation for new agents',
    contactLists: 5,
    status: 'pending',
    callsScored: 12,
    evaluationsCompleted: 2,
    evaluationType: 'manual',
    createdAt: '2026-06-10',
    type: 'external',
  },
  {
    id: '4',
    name: 'Compliance Audit Wave 2',
    description: 'Regulatory compliance evaluation',
    contactLists: 15,
    status: 'active',
    callsScored: 234,
    evaluationsCompleted: 15,
    evaluationType: 'automatic',
    createdAt: '2026-05-01',
    type: 'cmx',
  },
  {
    id: '5',
    name: 'Agent Coaching Program',
    description: 'Performance improvement coaching evaluations',
    contactLists: 4,
    status: 'paused',
    callsScored: 28,
    evaluationsCompleted: 4,
    evaluationType: 'manual',
    createdAt: '2026-04-20',
    type: 'external',
  },
];

export const mockCampaignDetails: Record<string, CampaignDetail> = {
  '1': {
    id: '1',
    name: 'Q2 Sales Performance',
    type: 'sales',
    responsibleContact: 'John Smith',
    description: 'Quarterly evaluation of sales team performance and call quality standards',
    evaluatorModel: 'Pro Sales Evaluator v2.5',
  },
  '2': {
    id: '2',
    name: 'Customer Support Review',
    type: 'retention',
    responsibleContact: 'Sarah Johnson',
    description: 'Ongoing quality assurance for customer support interactions',
    evaluatorModel: 'Customer Service Evaluator v3.0',
  },
  '3': {
    id: '3',
    name: 'Agent Training Q2',
    type: 'activation',
    responsibleContact: 'Mike Wilson',
    description: 'New agent onboarding and training evaluation program',
    evaluatorModel: 'Pro Sales Evaluator v2.3',
  },
};

export const mockContactLists: ContactList[] = [
  {
    id: 'list1',
    name: 'Q2 Sales Performance',
    callCount: 12,
    status: 'completed',
    startDate: '2026-06-15',
    endDate: '2026-06-30',
  },
  {
    id: 'list2',
    name: 'Q2 Sales Performance',
    callCount: 8,
    status: 'in-progress',
    startDate: '2026-07-01',
    endDate: '2026-07-15',
  },
  {
    id: 'list3',
    name: 'Q2 Sales Performance',
    callCount: 10,
    status: 'in-progress',
    startDate: '2026-07-16',
    endDate: '2026-07-31',
  },
  {
    id: 'list4',
    name: 'Q2 Sales Performance',
    callCount: 9,
    status: 'completed',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
  },
];

export const mockEvaluations: Evaluation[] = [
  {
    id: 'eval1',
    name: 'Sales Quality Q2',
    status: 'completed',
    type: 'automatic',
    finalScore: 87,
    result: 'passed',
    evaluatedPercentage: 100,
    agent: 'Claude Sonnet 4.5',
    llmModel: 'claude-sonnet-4-6',
    contactListIds: ['list1', 'list2'],
    createdDate: '2026-06-15',
  },
  {
    id: 'eval2',
    name: 'Compliance Review',
    status: 'completed',
    type: 'automatic',
    finalScore: 0,
    result: 'passed',
    evaluatedPercentage: 65,
    agent: 'Claude Opus',
    llmModel: 'claude-opus-4-6',
    contactListIds: ['list3', 'list4'],
    createdDate: '2026-07-01',
  },
];

export const mockResults: CallEvaluationResult[] = [
  {
    id: '1',
    callId: 'CALL-001',
    filename: 'call_001.mp3',
    agentName: 'John Smith',
    aiScore: 85,
    finalScore: 88,
    delta: 3,
    overridden: true,
    mode: 'auto',
    evaluatorModel: 'claude-sonnet-4-6',
    evaluatedAt: '2026-06-22 14:30',
  },
  {
    id: '2',
    callId: 'CALL-002',
    filename: 'call_002.mp3',
    agentName: 'Sarah Jones',
    aiScore: 92,
    finalScore: 92,
    delta: 0,
    overridden: false,
    mode: 'auto',
    evaluatorModel: 'claude-sonnet-4-6',
    evaluatedAt: '2026-06-22 14:35',
  },
  {
    id: '3',
    callId: 'CALL-003',
    filename: 'call_003.mp3',
    agentName: 'Mike Wilson',
    aiScore: 0,
    finalScore: 78,
    delta: 78,
    overridden: true,
    mode: 'manual',
    evaluatorModel: 'manual',
    evaluatedAt: '2026-06-22 15:00',
  },
  {
    id: '4',
    callId: 'CALL-004',
    filename: 'call_004.mp3',
    agentName: 'John Smith',
    aiScore: 76,
    finalScore: 76,
    delta: 0,
    overridden: false,
    mode: 'auto',
    evaluatorModel: 'claude-sonnet-4-6',
    evaluatedAt: '2026-06-22 15:10',
  },
  {
    id: '5',
    callId: 'CALL-005',
    filename: 'call_005.mp3',
    agentName: 'Sarah Jones',
    aiScore: 88,
    finalScore: 85,
    delta: -3,
    overridden: true,
    mode: 'auto',
    evaluatorModel: 'claude-sonnet-4-6',
    evaluatedAt: '2026-06-22 15:20',
  },
];


export const mockCampaignNames: Record<string, string> = {
  '1': 'Q2 Sales Performance',
  '2': 'Customer Support Review',
  '3': 'Agent Training Q2',
};

const mockEvaluationAspects: Aspect[] = [
  {
    id: 'asp1',
    name: 'Sales Techniques',
    description: 'Evaluation of sales techniques and methodologies',
    items: [
      {
        id: 'item1',
        name: 'Opening Statement',
        errorType: 'critical-business',
        answerType: 'yes-no',
        description: 'Did the agent provide a proper opening statement?',
        valuation: 10,
      },
      {
        id: 'item2',
        name: 'Needs Assessment',
        errorType: 'critical-business',
        answerType: 'yes-no',
        description: 'Did the agent properly assess customer needs?',
        valuation: 15,
      },
    ],
  },
  {
    id: 'asp2',
    name: 'Compliance',
    description: 'Regulatory compliance checks',
    items: [
      {
        id: 'item3',
        name: 'Disclosure Statement',
        errorType: 'critical-compliance',
        answerType: 'yes-no',
        description: 'Was the required disclosure statement provided?',
        valuation: 20,
      },
    ],
  },
];

export const mockQATests: QATest[] = [
  {
    id: 'test1',
    name: 'Sales Quality Q2 2026',
    qaType: 'sales',
    createdDate: '2026-06-01',
    evaluatedCampaigns: 3,
    createdBy: 'Quality Team',
    description: 'Comprehensive quality assurance for Q2 sales campaigns',
    aspects: mockEvaluationAspects,
    status: 'ready',
  },
  {
    id: 'test2',
    name: 'Compliance Audit Q3',
    qaType: 'activation',
    createdDate: '2026-07-01',
    evaluatedCampaigns: 5,
    createdBy: 'Compliance Team',
    description: 'Regulatory compliance evaluation',
    status: 'ready',
  },
];

// ---------- Call detail: tab catalog ----------

export interface CallEvaluationTabMeta {
  key: CallEvaluationTab;
  label: string;
  description: string;
  icon: TablerIcon;
  color: string;
}

export const CALL_EVALUATION_TABS: CallEvaluationTabMeta[] = [
  { key: 'qa', label: 'QA', description: 'Quality Assurance — COPC error types and aspect scores', icon: IconClipboardList, color: 'orange' },
  { key: 'sentiment-emotion', label: 'Sentiment and Emotion', description: 'Sentiment categories and emotions for agent and customer', icon: IconMoodSmile, color: 'violet' },
  { key: 'compliance', label: 'Compliance', description: 'Security, Regulatory and Legal compliance checks', icon: IconShieldCheck, color: 'green' },
  { key: 'business-insights', label: 'Business Insights', description: 'Business signals detected and call outcome', icon: IconTrendingUp, color: 'blue' },
];

// ---------- QA error types (COPC) ----------

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

// ---------- Sentiment categories & emotions ----------

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

// ---------- Compliance areas ----------

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

// ---------- Business signals ----------

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

// ---------- Mock call detail ----------

export const mockCallEvaluationDetail: CallEvaluationDetail = {
  callId: 'call-001',
  fileName: 'call_001_2026-07-20.mp3',
  agentName: 'Sarah Johnson',
  customerName: 'Mr. Doe',
  customerId: 'CUST-001',
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
