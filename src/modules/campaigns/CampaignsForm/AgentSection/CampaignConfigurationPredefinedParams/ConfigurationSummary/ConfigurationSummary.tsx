import React from 'react';
import { Stack, Text, SimpleGrid } from '@mantine/core';
import {
	IconMicrophone,
	IconWaveSine,
	IconVolume,
	IconCpu,
	IconFileMusic,
	IconListDetails,
} from '@tabler/icons-react';
import StatCard from '~/components/StatCard';
import type { ConversationConfigModel } from '~/models/AgentListObject';
import CampaignVoiceProgressDisplay from '../CampaignVoiceProgressDisplay';

const formatNumber = (value: number | null | undefined) => {
	if (typeof value !== 'number' || Number.isNaN(value)) {
		return 'N/A';
	}

	return Number.isInteger(value) ? value.toString() : value.toFixed(2);
};

const formatListPreview = (
	values: Array<string | number> | undefined | null,
	limit = 3
) => {
	if (!values || values.length === 0) {
		return 'None';
	}

	const preview = values
		.slice(0, limit)
		.map((value) => value.toString())
		.join(', ');
	return values.length > limit ? `${preview}…` : preview;
};

interface ConfigurationSummaryProps {
	config?: ConversationConfigModel;
}

const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({
	config,
}) => {
	const sections: Array<{
		title: string;
		cards: Array<{
			title: string;
			value: React.ReactNode;
			subtitle?: React.ReactNode;
			icon?: React.ReactNode;
		}>;
	}> = [];

	if (config?.asr) {
		sections.push({
			title: 'Speech Recognition',
			cards: [
				{
					title: 'ASR Provider',
					value: config.asr.provider || 'N/A',
					subtitle: `Quality: ${config.asr.quality || 'N/A'}`,
					icon: <IconMicrophone size={18} />,
				},
				{
					title: 'Audio Format',
					value: config.asr.userInputAudioFormat || 'N/A',
					subtitle: `Keywords: ${formatListPreview(config.asr.keywords)}`,
					icon: <IconWaveSine size={18} />,
				},
				{
					title: 'Keyword Count',
					value: formatNumber(config.asr.keywords?.length ?? 0),
					subtitle: 'Total watch words',
					icon: <IconListDetails size={18} />,
				},
			],
		});
	}

	sections.push({
		title: 'Text To Speech',
		cards: [
			{
				title: 'Voice Engine',
				value: config?.tts?.modelId || 'N/A',
				subtitle: `Model: ${config?.tts?.modelId || 'N/A'}`,
				icon: <IconVolume size={18} />,
			},
			{
				title: 'Output Format',
				value: config?.tts?.agentOutputAudioFormat || 'N/A',
				subtitle: 'Agent audio response format',
				icon: <IconFileMusic size={18} />,
			},
			{
				title: 'LLM',
				value: config?.agent?.prompt?.llm || 'N/A',

				icon: <IconCpu size={18} />,
			},
		],
	});

	return (
		<Stack gap='lg'>
			{sections.map((section) => (
				<Stack key={section.title} gap='sm'>
					<Text size='sm' fw={600}>
						{section.title}
					</Text>
					<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing='md'>
						{section.cards.map((card) => (
							<StatCard
								key={card.title}
								title={card.title}
								value={card.value}
								icon={card.icon}
							/>
						))}
					</SimpleGrid>
				</Stack>
			))}
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
