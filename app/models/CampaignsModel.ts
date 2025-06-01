// src/models/CampaignsModel.ts

export interface Campaign {
  id: number;
  name: string;
  description: string;
  budget: number;
  spent: number;
  roi: number; // Return on investment (percentage)
  leads: number; // Number of leads generated
  type: "OUTBOUND" | "INBOUND";
  status: "ACTIVE" | "INACTIVE" | "PAUSED" | "COMPLETED";
  userId: number;
  clientId: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  startDate?: string; // Optional campaign start date
  endDate?: string; // Optional campaign end date
  tags?: string[]; // Optional tags for campaign categorization
  avatarUrl?: string; // Optional campaign avatar or image
}
