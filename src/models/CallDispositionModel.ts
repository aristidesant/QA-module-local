export interface CallDispositionModel {
  id: number;
  conversationId: number;
  contactId: number;
  agentId: string;
  campaignId: number;
  dispositionName: string;
  dispositionDescription: string;
  notes: string;
  aiMetadata: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}
