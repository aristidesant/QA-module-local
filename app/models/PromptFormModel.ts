import type { PromptGeneratorForm } from "~/config/prompt-generator/generatorForm";
import type { PromptType } from "./PromptTypeModel";

export type PromptForm = {
  id: number;
  name: string;
  form: PromptGeneratorForm;
  typeId: number;
  userId: number;
  clientId: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt: string | null;
  type: PromptType;
};
