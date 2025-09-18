import type { Prompt, GenerationInput } from './PromptModel';

export interface PromptVersion {
	id: number;
	fullFields: Prompt;
	generatedPrompt: string;
	version: number;
	promptId: number;
	userId: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: any;
}

// Re-export GenerationInput for convenience
export type { GenerationInput };
