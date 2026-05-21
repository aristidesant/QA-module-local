import type {
	CampaignPredefinedConversationConfig,
	CampaignPredefinedPlatformSettings,
} from '~/models/CampaignPredefinedParam';
import type { ConversationConfigModel } from '~/models/AgentListObject';
import { deepMergeConfig } from '~/utils/objectUtils';

type BehaviorConversationConfig =
	| CampaignPredefinedConversationConfig
	| Partial<ConversationConfigModel>
	| null
	| undefined;

type BehaviorPlatformSettings =
	| CampaignPredefinedPlatformSettings
	| null
	| undefined;

const isRecord = (value: unknown): value is Record<string, unknown> =>
	Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isMergeablePrimitive = (value: unknown): boolean =>
	value !== null &&
	value !== undefined &&
	(typeof value !== 'string' || value.length > 0) &&
	(typeof value !== 'number' || !Number.isNaN(value));

const pruneNullishValues = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		const nextValue = value
			.map((item) => pruneNullishValues(item))
			.filter((item): item is unknown => item !== undefined && item !== null);

		return nextValue.length > 0 ? nextValue : undefined;
	}

	if (!isRecord(value)) {
		return isMergeablePrimitive(value) ? value : undefined;
	}

	const nextValue: Record<string, unknown> = {};

	for (const [key, nestedValue] of Object.entries(value)) {
		const sanitizedValue = pruneNullishValues(nestedValue);
		if (sanitizedValue !== undefined && sanitizedValue !== null) {
			nextValue[key] = sanitizedValue;
		}
	}

	return Object.keys(nextValue).length > 0 ? nextValue : undefined;
};

export const applyCampaignBehaviorConversationConfig = (
	currentConversationConfig: Record<string, unknown>,
	selectedConversationConfig?: BehaviorConversationConfig
): Record<string, unknown> => {
	if (!selectedConversationConfig) {
		return currentConversationConfig;
	}

	const sanitizedSelectedConfig = pruneNullishValues(
		selectedConversationConfig
	);

	if (!isRecord(sanitizedSelectedConfig)) {
		return currentConversationConfig;
	}

	return deepMergeConfig(currentConversationConfig, sanitizedSelectedConfig);
};

export const applyCampaignBehaviorPlatformSettings = (
	currentPlatformSettings: Record<string, unknown>,
	selectedPlatformSettings?: BehaviorPlatformSettings
): Record<string, unknown> => {
	if (!selectedPlatformSettings?.overrides) {
		return currentPlatformSettings;
	}

	return deepMergeConfig(currentPlatformSettings, {
		overrides: selectedPlatformSettings.overrides,
	});
};

export const sanitizeCampaignBehaviorConversationConfig = (
	conversationConfig: Record<string, unknown>
): Record<string, unknown> => {
	return conversationConfig;
};
