import type {
	AgentVersionSnapshot,
	AgentVersionUpdatePayload,
} from '~/models/AgentVersioningModel';

export const normalizeAgentVersionSnapshot = (
	snapshot?: AgentVersionSnapshot | null
): AgentVersionUpdatePayload => {
	if (!snapshot) {
		return {};
	}

	const {
		name,
		tags,
		phoneNumbers,
		platformSettings,
		privacy,
		overrides,
		callLimits,
		evaluation,
		dataCollection,
		workspaceOverrides,
		conversationConfig,
		workflow,
	} = snapshot;

	return {
		...(name ? { name } : {}),
		...(tags ? { tags } : {}),
		...(phoneNumbers ? { phoneNumbers } : {}),
		...(platformSettings ? { platformSettings } : {}),
		...(privacy ? { privacy } : {}),
		...(overrides ? { overrides } : {}),
		...(callLimits ? { callLimits } : {}),
		...(evaluation ? { evaluation } : {}),
		...(dataCollection ? { dataCollection } : {}),
		...(workspaceOverrides ? { workspaceOverrides } : {}),
		...(conversationConfig ? { conversationConfig } : {}),
		...(workflow ? { workflow } : {}),
	};
};
