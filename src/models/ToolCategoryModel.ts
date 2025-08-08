export interface ToolCategoryModel {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  userId: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt: string | null;
}
