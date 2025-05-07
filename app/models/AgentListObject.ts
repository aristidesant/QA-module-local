export default interface AgentListObject {
  id: string;
  name: string;
  config: Record<string, any>;
  clientId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
