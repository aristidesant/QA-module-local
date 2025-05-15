import type { PromptGeneratorForm } from "~/config/prompt-generator/generatorForm";

export type PromptFormType = {
  id: number;
  name: string;
  form: PromptGeneratorForm;
  typeId: number;
  userId: number;
  clientId: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt: string | null;
  type: PromptFormType;
};
