export default interface AgentListObject {
  id: string;
  name: string;
  config: {
    getAgentConfig: Record<string, any>;
    createAgentConfig: Record<string, any>;
  };
  clientId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
