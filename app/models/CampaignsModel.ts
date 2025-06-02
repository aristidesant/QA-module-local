// src/models/CampaignsModel.ts

export interface Campaign {
  id: number;
  name: string;
  description: string;
  budget: number;
  spent: number;
  type: "OUTBOUND" | "INBOUND";
  status: "ACTIVE" | "INACTIVE" | "PAUSED" | "COMPLETED";
  userId: number;
  clientId: number;
  promptId?: number; // Optional prompt ID for associated prompt template
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  tags?: string[]; // Optional tags for campaign categorization
}
