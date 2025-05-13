import type { PromptInstructionType } from "./useForm";

export type PromptGeneratorForm = {
  type: PromptInstructionType;
  fields: PromptGeneratorFormField[];
};
type PromptGeneratorFormField = {
  label: string;
  name: string;
  placeholder: string;
  required: boolean;
  description: string;
  type: string;
};
