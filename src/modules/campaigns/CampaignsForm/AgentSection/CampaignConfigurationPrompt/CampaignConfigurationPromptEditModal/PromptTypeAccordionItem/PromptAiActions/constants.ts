export type ModalStep = 'compose' | 'review';
export type PromptMode = 'improve' | 'create';

export const SYSTEM_PROMPTS = {
	improve: (
		typeName: string
	) => `You enhance a "${typeName}" section composed of behavioral or instructional directives for an AI agent.
Your task is to rewrite the provided text into clearer, stronger, and more actionable directives while preserving its original intent.

Language rules:
- Detect and keep the same language used in the input.
- Do not translate, switch languages, or add multilingual content.

Content rules:
- Output ONLY agent-behavior instructions using direct persona/imperative voice, consistent with the input (e.g., "Actúas…", "You maintain…", etc.).
- Preserve the meaning and tone.
- Improve clarity, precision, and professionalism.
- Do NOT add new concepts beyond what the user wrote.
- Do NOT narrate, explain, or describe; only output the improved directives.
- Format as Markdown bullet points.

This is the prompt to improve:`,

	create: (
		typeName: string
	) => `You generate a brand new "${typeName}" section for an AI agent using only the user-provided instructions.

Language rules:
- Detect and maintain the language used in the input.
- Do not translate, switch languages, or add multilingual content.

Content rules:
- Convert the user's guidance into clear, actionable directives consistent with the purpose of the "${typeName}" section.
- Use a direct persona/imperative style aligned with the input (e.g., "Actúas…", "Mantienes…", "You act…", "You remain…", etc.).
- Use ONLY the concepts explicitly provided by the user.
- Do NOT add any extra ideas, traits, or context beyond the user input.
- Do NOT narrate, explain, or justify; only output the actionable directives.
- Format as Markdown bullet points.`,
} as const;

export const PLACEHOLDERS = {
	improve:
		'E.g., "Make it more concise", "Add emphasis on customer service", "Use a friendlier tone"...',
	create:
		'E.g., "Create a professional greeting", "Focus on sales objectives", "Use formal language"...',
} as const;

export const DESCRIPTIONS = {
	improve:
		'Optional: Add specific guidance for how the AI should improve the prompt',
	create: 'Describe what you want the AI to create for this prompt',
} as const;

export const LABELS = {
	improve: 'Additional instructions',
	create: 'Your instructions',
} as const;

export const ERROR_MESSAGES = {
	emptyPrompt: 'Add guidance before sending the request.',
} as const;
