import React, { useMemo, useState } from 'react';
import SectionCard from '~/components/SectionCard';
import useCampaignsPredefinedParams, {
	CampaignPredefinedParam,
} from '../../campaigns/CampaignsForm/useCampaignsPredefinedParams';
import { Stack, Text, Group, Paper, ThemeIcon, Code } from '@mantine/core';
import {
	useAgentConfigFormContext,
	useCampaignFormContext,
} from '~/modules/campaigns/campaignFormFunctions';
import { IconCheck } from '@tabler/icons-react';
import CampaignPredefinedParamsModal from './CampaignPredefinedParamsModal';
import { useTranslation } from 'react-i18next';
import type { ConversationConfigModel } from '~/models/AgentListObject';
import {
	applyCampaignBehaviorConversationConfig,
	applyCampaignBehaviorPlatformSettings,
} from '~/modules/campaigns/utils/campaignBehaviorConfig';
import styles from './CampaignConfigurationPredefinedParams.module.css';

const CampaignConfigurationPredefinedParams: React.FC = () => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const predefinedParams = useCampaignsPredefinedParams();

	const campaignForm = useCampaignFormContext();
	const agentConfigForm = useAgentConfigFormContext();
	const [appliedParam, setAppliedParam] =
		useState<CampaignPredefinedParam | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const applyConversationConfig = (
		params: CampaignPredefinedParam['params']
	) => {
		const mergedConfig = applyCampaignBehaviorConversationConfig(
			(agentConfigForm.values.conversationConfig || {}) as unknown as Record<
				string,
				unknown
			>,
			params.conversationConfig
		) as unknown as ConversationConfigModel;
		const mergedPlatformSettings = applyCampaignBehaviorPlatformSettings(
			(agentConfigForm.values.platformSettings || {}) as Record<
				string,
				unknown
			>,
			params.platformSettings
		);

		agentConfigForm.setValues({
			...agentConfigForm.values,
			conversationConfig: mergedConfig,
			platformSettings:
				mergedPlatformSettings as typeof agentConfigForm.values.platformSettings,
		});
	};

	const handleOpenModal = () => {
		setIsModalOpen(true);
	};

	const handleApplyFromModal = (param: CampaignPredefinedParam) => {
		if (param.params?.conversationConfig || param.params?.platformSettings) {
			applyConversationConfig(param.params);
			setAppliedParam(param);
			setIsModalOpen(false);
			campaignForm.setFieldValue('configId', param.id);
			agentConfigForm.setFieldValue('configId', param.id);
		}
	};

	const currentPredefinedParam = useMemo(() => {
		if (!predefinedParams || predefinedParams.length === 0) {
			return null;
		}
		const currentConfigId = campaignForm.values.configId ?? '';
		return predefinedParams.find(
			(param) => String(param.id) === String(currentConfigId)
		);
	}, [predefinedParams, campaignForm.values.configId]);

	const behaviorActionLabel = currentPredefinedParam
		? t('form.agent.behavior.change')
		: t('form.agent.behavior.select');
	const currentConfigId = campaignForm.values.configId ?? '';

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
					<Paper withBorder p='md' radius='md' className={styles.activePaper}>
						<Group align='center' gap='sm' wrap='nowrap'>
							<ThemeIcon size='lg' radius='xl' color='teal' variant='light'>
								<IconCheck size={20} />
							</ThemeIcon>
							<div>
								<Text fw={600} size='sm'>
									{currentPredefinedParam.name}
								</Text>
								<Text size='xs' className={styles.statusText}>
									{t('form.agent.behavior.active')}
								</Text>
								<Text size='xs' c='dimmed' mt={4}>
									configId: <Code>{currentConfigId || 'No configId'}</Code>
								</Text>
							</div>
						</Group>
					</Paper>
				) : (
					<Paper withBorder p='lg' radius='md' className={styles.emptyPaper}>
						<Stack align='center' gap='xs'>
							<Text size='sm' className={styles.statusText}>
								{t('form.agent.behavior.noConfiguration')}
							</Text>
							<Text size='xs' c='dimmed'>
								configId: <Code>{currentConfigId || 'No configId'}</Code>
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
