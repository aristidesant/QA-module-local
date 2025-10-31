import React, { useMemo, useState } from 'react';
import SectionCard from '~/components/SectionCard';
import useCampaignsPredefinedParams, {
	CampaignPredefinedParam,
} from '../../useCampaignsPredefinedParams';
import { Stack, Text, Group, ActionIcon, Tooltip } from '@mantine/core';
import { useCampaignFormContext } from '~/modules/campaigns/campaignFormFunctions';
import { deepMergeConfig } from '~/utils/objectUtils';
import type { CampaignPredefinedConversationConfig } from '~/models/CampaignPredefinedParam';
import type { ConversationConfigModel } from '~/models/AgentListObject';
import { IconRefresh, IconCheck } from '@tabler/icons-react';
import CampaignPredefinedParamsModal from './CampaignPredefinedParamsModal';
import styles from './CampaignConfigurationPredefinedParams.module.css';

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
		}) as Partial<ConversationConfigModel>;

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
		console.log('predefinedParams:', predefinedParams, form.values.configId);

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
				<Stack gap='md'>
					{currentPredefinedParam ? (
						<div className={styles.appliedConfigCard}>
							<Group
								gap='md'
								align='flex-start'
								wrap='nowrap'
								justify='space-between'
							>
								<Group gap='md' align='flex-start' wrap='nowrap'>
									<div className={styles.checkIconCircle}>
										<IconCheck size={24} stroke={2.5} />
									</div>
									<Stack gap={4} style={{ flex: 1 }}>
										<Text fw={600} fz='lg' c='dark'>
											{currentPredefinedParam.name}
										</Text>
										<Text fz='sm' c='dimmed'>
											Active configuration
										</Text>
										<Text fz='sm' c='dimmed' mt={8}>
											Configuration applied successfully
										</Text>
									</Stack>
								</Group>
								<Tooltip label='Change configuration'>
									<ActionIcon
										variant='subtle'
										size='lg'
										onClick={handleOpenModal}
										aria-label='Change configuration'
									>
										<IconRefresh size={20} />
									</ActionIcon>
								</Tooltip>
							</Group>
						</div>
					) : (
						<div className={styles.emptyConfigCard}>
							<Text fz='sm' c='dimmed' ta='center'>
								No configuration applied
							</Text>
						</div>
					)}
				</Stack>
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
