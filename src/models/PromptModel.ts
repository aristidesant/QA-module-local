export interface Prompt {
	id: number;
	name: string;
	generationInput: GenerationInput;
	generatedPrompt: string;
	status: string;
	typeId?: number;
	userId: number;
	clientId: number;
	promptInstructionId: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: any;
}

export interface GenerationInput {
	agent_goal: string;
	agent_role: string;
	key_messages: string;
	target_audience: string;
	communication_tone: string;
	financial_product_type: string;
}
