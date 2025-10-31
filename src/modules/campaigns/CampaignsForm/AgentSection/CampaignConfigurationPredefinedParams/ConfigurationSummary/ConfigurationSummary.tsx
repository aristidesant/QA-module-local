import React from 'react';
import { Stack } from '@mantine/core';

import type { CampaignPredefinedConversationConfig } from '~/models/CampaignPredefinedParam';
import type { ConversationConfigModel } from '~/models/AgentListObject';
import CampaignVoiceProgressDisplay from '../CampaignVoiceProgressDisplay';

type SummaryConversationConfig =
	| CampaignPredefinedConversationConfig
	| Partial<ConversationConfigModel>
	| null;

interface ConfigurationSummaryProps {
	config?: SummaryConversationConfig;
}

const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({
	config,
}) => {
	return (
		<Stack gap='lg'>
			{config?.tts && (
				<CampaignVoiceProgressDisplay
					stability={config?.tts?.stability || 0}
					speed={config?.tts?.speed || 0}
					similarityBoost={config?.tts?.similarityBoost || 0}
					optimizeLatency={config?.tts?.optimizeStreamingLatency || 0}
					temperature={config.agent?.prompt?.temperature || 0}
				/>
			)}
		</Stack>
	);
};

export default ConfigurationSummary;
