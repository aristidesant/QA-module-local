import { educationForm } from "./education";
import { financeForm } from "./finance";
import { genericForm } from "./generic";
import { salesForm } from "./sales";

export type PromptInstructionType =
  | "FINANCE"
  | "EDUCATION"
  | "SALES"
  | "CLIENT SUPPORT";

export default function usePromptGeneratorFormDefinition(
  type: PromptInstructionType
) {
  switch (type) {
    case "FINANCE":
      return financeForm;
    case "EDUCATION":
      return educationForm;
    case "SALES":
      return salesForm;
    case "CLIENT SUPPORT":
    default:
      return genericForm;
  }
}
