import { ActionIcon, Stack, Text } from '@mantine/core';
import {
	IconX,
	IconEdit,
	IconFileText,
	IconSettings,
	IconMessageCircle,
} from '@tabler/icons-react';
import RightSectionCard from '~/components/RightSectionCard/RightSectionCard';
import type { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';
import type { ClientConfig } from '~/models/ClientConfig';
import useCampaignPredefinedParamsStore from '../store/useCampaignPredefinedParamsStore';
import styles from './CampaignPredefinedParamsDetail.module.css';
import CampaignPredefinedParamsForm from '../CampaignPredefinedParamsForm';

interface CampaignPredefinedParamsDetailProps {
	param: CampaignPredefinedParam;
	list: CampaignPredefinedParam[];
	config: ClientConfig | undefined;
}

type Detail = {
	label: string;
	value: React.ReactNode;
};

type SummaryItem = {
	label: string;
	value: string;
};

const CampaignPredefinedParamsDetail: React.FC<
	CampaignPredefinedParamsDetailProps
> = ({ param, list, config }) => {
	const { clearRightComponent, setRightComponent, setMode } =
		useCampaignPredefinedParamsStore();

	const conversationConfig = param.params.conversationConfig;

	const handleEdit = () => {
		setMode('edit');
		setRightComponent(
			<CampaignPredefinedParamsForm param={param} list={list} config={config} />
		);
	};

	const renderDetails = (items: Detail[]) => (
		<div className={styles.detailList}>
			{items.map((detail) => (
				<div key={detail.label} className={styles.detail}>
					<Text className={styles.detailLabel}>{detail.label}</Text>
					<div className={styles.detailValue}>{detail.value}</div>
				</div>
			))}
		</div>
	);

	// Core TTS Details (most important first)
	const coreTtsDetails: Detail[] = conversationConfig?.tts
		? [
				{ label: 'Model', value: conversationConfig.tts.modelId || '—' },
				{
					label: 'Speed',
					value: conversationConfig.tts.speed?.toString() || '—',
				},
				{
					label: 'Stability',
					value: conversationConfig.tts.stability?.toString() || '—',
				},
				{
					label: 'Similarity boost',
					value: conversationConfig.tts.similarityBoost?.toString() || '—',
				},
				{
					label: 'Output format',
					value: conversationConfig.tts.agentOutputAudioFormat || '—',
				},
				{
					label: 'Streaming latency',
					value:
						conversationConfig.tts.optimizeStreamingLatency?.toString() || '—',
				},
			]
		: [];

	// Core Agent Details
	const coreAgentDetails: Detail[] = conversationConfig?.agent
		? [
				{
					label: 'LLM model',
					value: conversationConfig.agent.prompt?.llm || '—',
				},
				{
					label: 'Temperature',
					value:
						conversationConfig.agent.prompt?.temperature?.toString() || '—',
				},
			]
		: [];

	const summaryItems: SummaryItem[] = [
		conversationConfig?.tts?.modelId && {
			label: 'TTS Model',
			value: conversationConfig.tts.modelId,
		},
		conversationConfig?.agent?.prompt?.llm && {
			label: 'LLM',
			value: conversationConfig.agent.prompt.llm,
		},
	]
		.filter(Boolean)
		.slice(0, 6) as SummaryItem[];

	return (
		<Stack gap='xs' className={styles.cards}>
			<RightSectionCard
				title={param.name}
				icon={IconFileText}
				iconColor='var(--mantine-color-blue-6)'
				rightSection={
					<>
						<ActionIcon
							variant='subtle'
							color='blue'
							aria-label='Edit parameter'
							onClick={handleEdit}
							size='sm'
						>
							<IconEdit size={14} />
						</ActionIcon>
						<ActionIcon
							variant='subtle'
							color='gray'
							aria-label='Close details'
							onClick={clearRightComponent}
							size='sm'
							ml='xs'
						>
							<IconX size={14} />
						</ActionIcon>
					</>
				}
			>
				{summaryItems.length > 0 && renderDetails(summaryItems as Detail[])}
			</RightSectionCard>

			{/* Core TTS Settings */}
			{coreTtsDetails.length > 0 && (
				<RightSectionCard
					title='TTS Configuration'
					icon={IconMessageCircle}
					iconColor='var(--mantine-color-cyan-6)'
				>
					{renderDetails(coreTtsDetails)}
				</RightSectionCard>
			)}

			{/* Core Agent Settings */}
			{coreAgentDetails.length > 0 && (
				<RightSectionCard
					title='Agent Configuration'
					icon={IconSettings}
					iconColor='var(--mantine-color-grape-6)'
				>
					{renderDetails(coreAgentDetails)}
				</RightSectionCard>
			)}
		</Stack>
	);
};

export default CampaignPredefinedParamsDetail;
