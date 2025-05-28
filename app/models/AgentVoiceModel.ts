export interface Voice {
  id: string;
  name: string;
  gender: "MALE" | "FEMALE" | string;
  description: string;
  language: string;
  age: string;
  accent: string;
  previewUrl: string;
  status: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AgentVoiceModel {
  id: number;
  voiceId: string;
  clientId: number;
  userId: number;
  voice: Voice;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
