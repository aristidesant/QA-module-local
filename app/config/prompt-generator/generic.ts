import type { PromptGeneratorForm } from "./generatorForm";

export const genericForm: PromptGeneratorForm = {
  type: "CLIENT SUPPORT",
  fields: [
    {
      label: "Agent Name",
      name: "agentName",
      placeholder: "Example: Support Assistant",
      required: true,
      description: "A descriptive name for your AI agent.",
      type: "text",
    },
    {
      label: "Agent Purpose",
      name: "agentPurpose",
      placeholder: "Example: Answer user questions about the platform",
      required: true,
      description: "Briefly describe what the agent is designed to do.",
      type: "text",
    },
    {
      label: "Personality Traits",
      name: "personalityTraits",
      placeholder: "Example: Friendly, concise, professional",
      required: false,
      description: "List any personality traits or tone the agent should have.",
      type: "text",
    },
    {
      label: "Response Language",
      name: "responseLanguage",
      placeholder: "Example: English",
      required: false,
      description: "Specify the language the agent should use in responses.",
      type: "text",
    },
    {
      label: "Special Instructions",
      name: "specialInstructions",
      placeholder: "Example: Always greet the user by name if available.",
      required: false,
      description: "Any additional instructions or guidelines for the agent.",
      type: "text",
    },
  ],
};
