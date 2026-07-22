import type { CreateEvaluatorAgentPayload, EvaluatorAgent } from '~/models/qa';

export interface EvaluatorAgentEditorFormProps {
	evaluatorAgent?: EvaluatorAgent | null;
	loading?: boolean;
	onCancel: () => void;
	onSubmit: (payload: CreateEvaluatorAgentPayload) => Promise<void>;
}
