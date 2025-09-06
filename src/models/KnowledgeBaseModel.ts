/**
 * Knowledge base related types used by the frontend.
 * Mirrors server DTO/entity fields in `agent-service` project.
 */
export enum KnowledgeBaseType {
  FILE = 'FILE',
  URL = 'URL',
  TEXT = 'TEXT',
}

export enum KnowledgeBaseStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  ACTIVE = 'ACTIVE',
  FAILED = 'FAILED',
  INACTIVE = 'INACTIVE',
}

export interface KnowledgeBaseModel {
  id: number;
  name: string;
  description?: string | null;
  type: KnowledgeBaseType;
  sourceUrl?: string | null;
  textContent?: string | null;
  status: KnowledgeBaseStatus;
  identifier?: string | null;
  uploadError?: string | null;
  retryCount?: number;
  lastSyncAt?: string | null; // ISO timestamp
  clientId: number;
  fileId?: number | null;
  file?: import('./FileModel').default | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface KnowledgeBaseAgentAssignment {
  agentId: string;
  agentName: string;
  isActive: boolean;
  assignedAt: string; // ISO timestamp
}

export interface KnowledgeBaseWithAgents {
  id: number;
  name: string;
  status: KnowledgeBaseStatus;
  assignedAgents: KnowledgeBaseAgentAssignment[];
}

export interface UploadFileMetadata {
  typeId?: number;
  codeType?: string;
  description?: string;
  clientId?: number;
}

export default KnowledgeBaseModel;
