export type StepKey = 'form' | 'agent' | 'conversation' | 'evaluator';

export interface NewEvaluationModalProps {
	opened: boolean;
	onClose: () => void;
	initialCampaignId?: string | null;
	initialAgentId?: string | null;
}
