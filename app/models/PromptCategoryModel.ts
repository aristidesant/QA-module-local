export interface PromptCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  userId: number;
  clientId: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
