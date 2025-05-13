import type { PromptInstructionType } from "~/config/prompt-generator/useForm";

export type PromptModel = {
  context: string;
  productDescription: string;
  costumerProfile: string;
  toneStyle: string;
  commonScenarios: string[];
  escalationInstruction: string;
  status: "ACTIVE" | "INACTIVE";
};

export type PromptFullModel = PromptModel & {
  id: number;
  identifier: string;
  generatedPrompt: string;
  userId: number;
  clientId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Prompt = {
  id: number;
  generationInput: Record<string, string>;
  generatedPrompt: string;
  type: PromptInstructionType;
};
