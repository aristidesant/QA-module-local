type StandaloneAgentNodeLike = {
	uiMeta?: {
		variant?: 'transfer' | 'subagent';
		created_by_ui?: boolean;
		createdByUi?: boolean;
	};
	agent_id?: string;
	agentId?: string;
	node_id?: string | null;
	nodeId?: string | null;
	delay_ms?: number;
	delayMs?: number;
	transfer_message?: string | null;
	transferMessage?: string | null;
	enable_transferred_agent_first_message?: boolean;
	enableTransferredAgentFirstMessage?: boolean;
};

const readString = (value: unknown): string => {
	if (typeof value !== 'string') {
		return '';
	}

	return value.trim();
};

const readNumber = (value: unknown): number | undefined => {
	if (typeof value !== 'number' || Number.isNaN(value)) {
		return undefined;
	}

	return value;
};

export const isStandaloneAgentTransferNode = (
	nodeData?: StandaloneAgentNodeLike | null
): boolean => {
	if (!nodeData) {
		return false;
	}

	if (nodeData.uiMeta?.variant === 'transfer') {
		return true;
	}

	return (
		readString(nodeData.agent_id).length > 0 ||
		readString(nodeData.agentId).length > 0
	);
};

export const getStandaloneAgentTransferAgentId = (
	nodeData?: StandaloneAgentNodeLike | null
): string => {
	if (!nodeData) {
		return '';
	}

	return readString(nodeData.agent_id) || readString(nodeData.agentId);
};

export const getStandaloneAgentTransferDelayMs = (
	nodeData?: StandaloneAgentNodeLike | null
): number => {
	if (!nodeData) {
		return 0;
	}

	return readNumber(nodeData.delay_ms) ?? readNumber(nodeData.delayMs) ?? 0;
};

export const getStandaloneAgentTransferMessage = (
	nodeData?: StandaloneAgentNodeLike | null
): string => {
	if (!nodeData) {
		return '';
	}

	return (
		readString(nodeData.transfer_message) ||
		readString(nodeData.transferMessage)
	);
};

export const getStandaloneAgentTransferNodeId = (
	nodeData?: StandaloneAgentNodeLike | null
): string | null => {
	if (!nodeData) {
		return null;
	}

	return nodeData.node_id ?? nodeData.nodeId ?? null;
};

export const getStandaloneAgentTransferFirstMessageEnabled = (
	nodeData?: StandaloneAgentNodeLike | null
): boolean => {
	if (!nodeData) {
		return false;
	}

	return (
		nodeData.enable_transferred_agent_first_message ??
		nodeData.enableTransferredAgentFirstMessage ??
		false
	);
};
