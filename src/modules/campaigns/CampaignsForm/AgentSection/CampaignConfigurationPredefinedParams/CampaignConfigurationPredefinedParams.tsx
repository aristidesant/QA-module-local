import React, { useMemo, useState } from 'react';
import SectionCard from '~/components/SectionCard';
import useCampaignsPredefinedParams, {
	CampaignPredefinedParam,
} from '../../useCampaignsPredefinedParams';
import { Stack, Text, Group, Paper, ThemeIcon } from '@mantine/core';
import { useCampaignFormContext } from '~/modules/campaigns/campaignFormFunctions';
import { deepMergeConfig } from '~/utils/objectUtils';
import type { CampaignPredefinedConversationConfig } from '~/models/CampaignPredefinedParam';
import type { ConversationConfigModel } from '~/models/AgentListObject';
import { IconCheck } from '@tabler/icons-react';
import CampaignPredefinedParamsModal from './CampaignPredefinedParamsModal';
import { useTranslation } from 'react-i18next';

const CampaignConfigurationPredefinedParams: React.FC = () => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
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
		const nextPromptConfig = {
			...(baseConversationConfig.agent?.prompt || {}),
			...config.agent?.prompt,
		};

		if (
			config.agent?.prompt &&
			!Object.prototype.hasOwnProperty.call(
				config.agent.prompt,
				'reasoningEffort'
			)
		) {
			nextPromptConfig.reasoningEffort = undefined;
		}

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
							prompt: nextPromptConfig,
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

	const behaviorActionLabel = currentPredefinedParam
		? t('form.agent.behavior.change')
		: t('form.agent.behavior.select');

	return (
		<React.Fragment>
			<SectionCard
				title={t('form.agent.behavior.title')}
				description={t('form.agent.behavior.description')}
				actions={{
					primary: {
						kind: currentPredefinedParam ? 'change' : 'configure',
						label: behaviorActionLabel,
						onClick: handleOpenModal,
					},
				}}
			>
				{currentPredefinedParam ? (
					<Paper withBorder p='md' radius='md' bg='var(--mantine-color-body)'>
						<Group align='center' gap='sm' wrap='nowrap'>
							<ThemeIcon size='lg' radius='xl' color='teal' variant='light'>
								<IconCheck size={20} />
							</ThemeIcon>
							<div>
								<Text fw={600} size='sm'>
									{currentPredefinedParam.name}
								</Text>
								<Text size='xs' c='dimmed'>
									{t('form.agent.behavior.active')}
								</Text>
							</div>
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
								{t('form.agent.behavior.noConfiguration')}
							</Text>
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
		</React.Fragment>
	);
};

export default CampaignConfigurationPredefinedParams;
