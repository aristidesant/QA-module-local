import type {
	Agent,
	CreateAgentPayload,
	UpdateAgentPayload,
} from '~/models/qa';

export interface AgentEditorFormProps {
	agent?: Agent | null;
	loading?: boolean;
	onCancel: () => void;
	onSubmit: (payload: CreateAgentPayload | UpdateAgentPayload) => Promise<void>;
}
