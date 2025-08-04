export interface DispositionNode {
  id: number;
  clientId: number;
  userId?: number;
  name: string;
  description?: string;
  isInvalidatesNumber: boolean;
  requiresReschedule: boolean;
  isFinal: boolean;
  order: number;
  isActive: boolean;
  catalogId?: number;
  parentId?: number;
  parent?: DispositionNode;
  children?: DispositionNode[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt?: string; // ISO date string | undefined
}
