export interface PlatformSettingsConversationConfigOverrideValues {
	tts: {
		speed: boolean;
		voiceId: boolean;
		stability: boolean;
		similarityBoost: boolean;
	};
	turn: {
		softTimeoutConfig: {
			message: boolean;
		};
	};
	agent: {
		prompt: {
			llm: boolean;
			prompt: boolean;
			toolIds: boolean;
			knowledgeBase: boolean;
			nativeMcpServerIds: boolean;
		};
		language: boolean;
		firstMessage: boolean;
		maxConversationDurationMessage: boolean;
	};
	conversation: {
		textOnly: boolean;
	};
}

export interface PlatformSettingsOverrides {
	customLlmExtraBody: boolean;
	conversationConfigOverride: PlatformSettingsConversationConfigOverrideValues;
	enableStartingWorkflowNodeIdFromClient: boolean;
	enableConversationInitiationClientDataFromWebhook: boolean;
}

export const DEFAULT_PLATFORM_SETTINGS_OVERRIDES: PlatformSettingsOverrides = {
	customLlmExtraBody: false,
	conversationConfigOverride: {
		tts: {
			speed: false,
			voiceId: false,
			stability: false,
			similarityBoost: false,
		},
		turn: {
			softTimeoutConfig: {
				message: false,
			},
		},
		agent: {
			prompt: {
				llm: false,
				prompt: false,
				toolIds: false,
				knowledgeBase: false,
				nativeMcpServerIds: false,
			},
			language: true,
			firstMessage: true,
			maxConversationDurationMessage: false,
		},
		conversation: {
			textOnly: true,
		},
	},
	enableStartingWorkflowNodeIdFromClient: false,
	enableConversationInitiationClientDataFromWebhook: false,
};

export const clonePlatformSettingsOverrides = (
	values: PlatformSettingsOverrides
): PlatformSettingsOverrides => ({
	customLlmExtraBody: values.customLlmExtraBody,
	conversationConfigOverride: {
		tts: {
			...values.conversationConfigOverride.tts,
		},
		turn: {
			softTimeoutConfig: {
				...values.conversationConfigOverride.turn.softTimeoutConfig,
			},
		},
		agent: {
			prompt: {
				...values.conversationConfigOverride.agent.prompt,
			},
			language: values.conversationConfigOverride.agent.language,
			firstMessage: values.conversationConfigOverride.agent.firstMessage,
			maxConversationDurationMessage:
				values.conversationConfigOverride.agent.maxConversationDurationMessage,
		},
		conversation: {
			...values.conversationConfigOverride.conversation,
		},
	},
	enableStartingWorkflowNodeIdFromClient:
		values.enableStartingWorkflowNodeIdFromClient,
	enableConversationInitiationClientDataFromWebhook:
		values.enableConversationInitiationClientDataFromWebhook,
});
