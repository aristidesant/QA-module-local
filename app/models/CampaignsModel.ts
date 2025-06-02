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
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  tags?: string[]; // Optional tags for campaign categorization
}
