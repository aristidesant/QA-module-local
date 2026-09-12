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

export type EvaluationType = 'sentiment-analysis' | 'business-insights' | 'compliance';

export interface ConversationEvaluation {
  id: string;
  type: EvaluationType;
  score: number | null;
  status: 'not-evaluated' | 'in-progress' | 'completed';
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
