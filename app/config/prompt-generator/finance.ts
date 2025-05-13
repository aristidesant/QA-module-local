import type { PromptGeneratorForm } from "./generatorForm";

export const financeForm: PromptGeneratorForm = {
  type: "FINANCE",
  fields: [
    {
      label: "Agent Name",
      name: "agent_name",
      placeholder: "Example: Virtual Financial Advisor",
      required: true,
      description: "Custom name for the finance agent.",
      type: "text",
    },
    {
      label: "Financial Product Type",
      name: "financial_product_type",
      placeholder: "Example: Credit card, personal loan, etc.",
      required: true,
      description:
        "Select or describe the financial product the agent should sell or advise on.",
      type: "text",
    },
    {
      label: "Target Audience",
      name: "target_audience",
      placeholder: "Example: College students, businesses, families, etc.",
      required: true,
      description: "Describe the target audience for the financial product.",
      type: "text",
    },
    {
      label: "Communication Tone",
      name: "communication_tone",
      placeholder: "Example: Formal, friendly, motivational, educational, etc.",
      required: false,
      description: "Define the tone the agent should use when communicating.",
      type: "text",
    },
    {
      label: "Agent Goal",
      name: "agent_goal",
      placeholder:
        "Example: Increase sales, educate about finance, answer questions, etc.",
      required: true,
      description: "What is the main goal of the finance agent?",
      type: "text",
    },
    {
      label: "Restrictions or Key Messages",
      name: "key_messages",
      placeholder:
        "Example: Do not offer products to minors, highlight benefits, etc.",
      required: false,
      description:
        "Restrictions, key messages, or guidelines the agent should follow.",
      type: "textarea",
    },
  ],
};
