import type { PromptGeneratorForm } from "./generatorForm";

export const salesForm: PromptGeneratorForm = {
  type: "SALES",
  fields: [
    {
      label: "Agent Name",
      name: "agent_name",
      placeholder: "Example: Sales Assistant",
      required: true,
      description: "Custom name for the sales agent.",
      type: "text",
    },
    {
      label: "Product or Service Type",
      name: "product_type",
      placeholder: "Example: Electronics, clothing, software, etc.",
      required: true,
      description:
        "Select or describe the product or service the agent should sell.",
      type: "text",
    },
    {
      label: "Target Audience",
      name: "target_audience",
      placeholder: "Example: Young adults, professionals, families, etc.",
      required: true,
      description: "Describe the target audience for the product or service.",
      type: "text",
    },
    {
      label: "Communication Tone",
      name: "communication_tone",
      placeholder: "Example: Friendly, persuasive, informative, casual, etc.",
      required: false,
      description: "Define the tone the agent should use when communicating.",
      type: "text",
    },
    {
      label: "Sales Goal",
      name: "sales_goal",
      placeholder:
        "Example: Increase sales, promote a new product, gather leads, etc.",
      required: true,
      description: "What is the main goal of the sales agent?",
      type: "text",
    },
    {
      label: "Key Selling Points or Restrictions",
      name: "key_selling_points",
      placeholder: "Example: Highlight discounts, avoid technical jargon, etc.",
      required: false,
      description:
        "Key selling points or restrictions the agent should follow.",
      type: "textarea",
    },
  ],
};
