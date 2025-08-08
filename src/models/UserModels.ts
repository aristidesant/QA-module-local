export interface UserModel {
  id: number;
  email: string;
  username: string;
  status: string;
  clientId: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}
