import type { AgentConfigModel } from '~/models/AgentListObject';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';

const BACKUP_LLM_MODEL_ALIASES: Record<string, string> = {
	'qwen35-35b-a3b': 'qwen35-397b-a17b',
};

const WORKFLOW_NODE_TYPE_ALIASES: Record<string, string> = {
	updateState: 'update_state',
};

const cloneValue = <T>(value: T): T => {
	try {
		if (typeof structuredClone === 'function') {
			return structuredClone(value);
		}
	} catch {
		// Fall through to JSON cloning for plain payloads.
	}

	return JSON.parse(JSON.stringify(value)) as T;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normalizeModelId = (value: unknown): string | undefined => {
	if (typeof value !== 'string') return undefined;

	const normalized = value.trim();
	if (!normalized) return undefined;

	return BACKUP_LLM_MODEL_ALIASES[normalized] ?? normalized;
};

const sanitizeBackupLlmConfig = (value: unknown): unknown => {
	if (!isRecord(value)) return value;

	const nextValue = cloneValue(value) as Record<string, unknown>;
	const order = nextValue.order;

	if (!Array.isArray(order)) {
		return nextValue;
	}

	const sanitizedOrder = order
		.map(normalizeModelId)
		.filter((item): item is string => Boolean(item));

	if (sanitizedOrder.length === 0) {
		delete nextValue.order;
		return nextValue;
	}

	nextValue.order = sanitizedOrder;
	return nextValue;
};

const sanitizePrompt = (value: unknown): unknown => {
	if (!isRecord(value)) return value;

	const nextValue = cloneValue(value) as Record<string, unknown>;
	const backupConfig = nextValue.backupLlmConfig;

	if (backupConfig !== undefined) {
		const sanitizedBackupConfig = sanitizeBackupLlmConfig(backupConfig);
		if (isRecord(sanitizedBackupConfig)) {
			nextValue.backupLlmConfig = sanitizedBackupConfig;
		}
	}

	return nextValue;
};

const sanitizeConversationConfig = (value: unknown): unknown => {
	if (!isRecord(value)) return value;

	const nextValue = cloneValue(value) as Record<string, unknown>;
	const agent = nextValue.agent;

	if (isRecord(agent)) {
		const nextAgent = cloneValue(agent) as Record<string, unknown>;
		if (nextAgent.prompt !== undefined) {
			nextAgent.prompt = sanitizePrompt(nextAgent.prompt);
		}
		nextValue.agent = nextAgent;
	}

	return nextValue;
};

const sanitizeWorkflowNode = (node: unknown): unknown => {
	if (!isRecord(node)) return node;

	const nextNode = sanitizeNestedPayload(node) as Record<string, unknown>;
	if ('uiMeta' in nextNode) {
		delete nextNode.uiMeta;
	}
	if (typeof nextNode.type === 'string') {
		nextNode.type = WORKFLOW_NODE_TYPE_ALIASES[nextNode.type] ?? nextNode.type;
	}

	return nextNode;
};

const sanitizeWorkflow = (value: unknown): unknown => {
	if (!isRecord(value)) return value;

	const nextValue = cloneValue(value) as Record<string, unknown>;
	if (isRecord(nextValue.nodes)) {
		const nextNodes = cloneValue(nextValue.nodes) as Record<string, unknown>;
		Object.entries(nextNodes).forEach(([nodeId, nodeValue]) => {
			nextNodes[nodeId] = sanitizeWorkflowNode(nodeValue);
		});
		nextValue.nodes = nextNodes;
	}

	return nextValue;
};

const sanitizeNestedPayload = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(sanitizeNestedPayload);
	}

	if (!isRecord(value)) {
		return value;
	}

	const nextValue = cloneValue(value) as Record<string, unknown>;
	Object.entries(nextValue).forEach(([key, nestedValue]) => {
		if (key === 'conversationConfig' || key === 'conversation_config') {
			nextValue[key] = sanitizeConversationConfig(nestedValue);
			return;
		}

		if (key === 'workflow') {
			nextValue[key] = sanitizeWorkflow(nestedValue);
			return;
		}

		nextValue[key] = sanitizeNestedPayload(nestedValue);
	});

	return nextValue;
};

export const sanitizeAgentPayload = <T>(payload: T): T => {
	return sanitizeNestedPayload(payload) as T;
};

export const sanitizeAgentConfig = (
	agentConfig?: Partial<AgentConfigModel> | Record<string, unknown>
): Partial<AgentConfigModel> | Record<string, unknown> | undefined => {
	if (!agentConfig) return agentConfig;
	return sanitizeAgentPayload(agentConfig);
};

export const sanitizeAgentWorkflow = (
	workflow?: AgentWorkflow | Record<string, unknown>
): AgentWorkflow | Record<string, unknown> | undefined => {
	if (!workflow) return workflow;
	return sanitizeWorkflow(workflow) as AgentWorkflow | Record<string, unknown>;
};
