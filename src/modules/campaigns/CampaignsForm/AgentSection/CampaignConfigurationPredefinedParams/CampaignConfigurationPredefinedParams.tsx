import React, { useMemo, useState } from 'react';
import SectionCard from '~/components/SectionCard';
import useCampaignsPredefinedParams, {
	CampaignPredefinedParam,
} from '../../useCampaignsPredefinedParams';
import { Stack, Text, Group, Button, Paper, ThemeIcon } from '@mantine/core';
import { useCampaignFormContext } from '~/modules/campaigns/campaignFormFunctions';
import { deepMergeConfig } from '~/utils/objectUtils';
import type { CampaignPredefinedConversationConfig } from '~/models/CampaignPredefinedParam';
import type { ConversationConfigModel } from '~/models/AgentListObject';
import { IconCheck, IconSettings } from '@tabler/icons-react';
import CampaignPredefinedParamsModal from './CampaignPredefinedParamsModal';

const CampaignConfigurationPredefinedParams: React.FC = () => {
	const predefinedParams = useCampaignsPredefinedParams();

	const form = useCampaignFormContext();
	const [appliedParam, setAppliedParam] =
		useState<CampaignPredefinedParam | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const applyConversationConfig = (
		config: CampaignPredefinedConversationConfig
	) => {
		const currentAgentConfig = form.values.agentConfig || {};
		const baseConversationConfig: Record<string, any> = {
			...(currentAgentConfig.conversationConfig || {}),
		};

		const mergedConfig = deepMergeConfig(baseConversationConfig, {
			...(config.tts
				? {
						tts: {
							...config.tts,
						},
					}
				: {}),
			...(config.asr
				? {
						asr: {
							...config.asr,
						},
					}
				: {}),
			...(config.agent
				? {
						agent: {
							...(baseConversationConfig.agent || {}),
							prompt: {
								...(baseConversationConfig.agent?.prompt || {}),
								...config.agent.prompt,
							},
						},
					}
				: {}),
		}) as ConversationConfigModel;

		form.setValues({
			agentConfig: {
				...currentAgentConfig,
				conversationConfig: mergedConfig,
			},
		});
	};

	const handleOpenModal = () => {
		setIsModalOpen(true);
	};

	const handleApplyFromModal = (param: CampaignPredefinedParam) => {
		if (param.params?.conversationConfig) {
			applyConversationConfig(param.params.conversationConfig);
			setAppliedParam(param);
			setIsModalOpen(false);
			form.setFieldValue('configId', param.id);
		}
	};

	const currentPredefinedParam = useMemo(() => {
		if (!predefinedParams || predefinedParams.length === 0) {
			return null;
		}
		return predefinedParams.find((param) => param.id === form.values.configId);
	}, [predefinedParams, form.values.configId]);

	return (
		<>
			<SectionCard
				title='Active Configuration'
				description='Select and apply predefined conversation configurations for your campaign agent.'
			>
				{currentPredefinedParam ? (
					<Paper withBorder p='md' radius='md' bg='var(--mantine-color-body)'>
						<Group justify='space-between' align='center'>
							<Group gap='sm'>
								<ThemeIcon size='lg' radius='xl' color='teal' variant='light'>
									<IconCheck size={20} />
								</ThemeIcon>
								<div>
									<Text fw={600} size='sm'>
										{currentPredefinedParam.name}
									</Text>
									<Text size='xs' c='dimmed'>
										Active configuration
									</Text>
								</div>
							</Group>
							<Button
								variant='light'
								size='xs'
								onClick={handleOpenModal}
								leftSection={<IconSettings size={14} />}
							>
								Change
							</Button>
						</Group>
					</Paper>
				) : (
					<Paper
						withBorder
						p='lg'
						radius='md'
						bg='var(--mantine-color-gray-0)'
						style={{ borderStyle: 'dashed' }}
					>
						<Stack align='center' gap='xs'>
							<Text size='sm' c='dimmed'>
								No configuration applied
							</Text>
							<Button
								variant='outline'
								size='xs'
								onClick={handleOpenModal}
								leftSection={<IconSettings size={14} />}
							>
								Select Configuration
							</Button>
						</Stack>
					</Paper>
				)}
			</SectionCard>

			<CampaignPredefinedParamsModal
				opened={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				predefinedParams={predefinedParams}
				initialSelectionName={appliedParam?.name ?? null}
				onApply={handleApplyFromModal}
			/>
		</>
	);
};

export default CampaignConfigurationPredefinedParams;
