export interface PromptType {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  userId: number;
  clientId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  categoryId?: number;
}
