// Frontend TypeScript definitions for Disposition entities

import type { DispositionNode } from "./DispositionNodeModel";

// Create DTOs
export interface CreateDispositionCatalog {
  name: string;
  description?: string;
  campaignId?: number;
  isDefault?: boolean;
}

export interface UpdateDispositionCatalog {
  name?: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface CreateDispositionCategory {
  name: string;
  description?: string;
  order?: number;
  isProtected?: boolean;
}

export interface UpdateDispositionCategory {
  name?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface CreateDispositionType {
  name: string;
  description?: string;
  order?: number;
}

export interface UpdateDispositionType {
  name?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface CreateDispositionStatus {
  name: string;
  description?: string;
  isInvalidatesNumber?: boolean;
  requiresReschedule?: boolean;
  isFinal?: boolean;
  order?: number;
}

export interface UpdateDispositionStatus {
  name?: string;
  description?: string;
  isInvalidatesNumber?: boolean;
  requiresReschedule?: boolean;
  isFinal?: boolean;
  order?: number;
  isActive?: boolean;
}

// Response DTOs
export interface DispositionStatusModel {
  id: number;
  name: string;
  description?: string;
  isInvalidatesNumber: boolean;
  requiresReschedule: boolean;
  isFinal: boolean;
  order: number;
  isActive: boolean;
  createdAt: string; // or Date, depending on JSON parsing
  updatedAt: string;
}

export interface DispositionTypeModel {
  id: number;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  statuses?: DispositionStatusModel[];
  createdAt: string;
  updatedAt: string;
}

export interface DispositionCategoryModel {
  id: number;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  isProtected: boolean;
  types?: DispositionTypeModel[];
  createdAt: string;
  updatedAt: string;
}

export interface DispositionCatalogModel {
  id: number;
  name: string;
  description?: string;
  clientId: number;
  campaignId?: number;
  isActive: boolean;
  isDefault: boolean;
  dispositionNodes?: DispositionNode[];
  createdAt: string;
  updatedAt: string;
}
