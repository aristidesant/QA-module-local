import React, { useMemo, useState } from 'react';
import SectionCard from '~/components/SectionCard';
import useCampaignsPredefinedParams, {
	CampaignPredefinedParam,
} from '../../useCampaignsPredefinedParams';
import { Stack, Text, Group, Paper, ThemeIcon, Code } from '@mantine/core';
import { useCampaignFormContext } from '~/modules/campaigns/campaignFormFunctions';
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

	const form = useCampaignFormContext();
	const [appliedParam, setAppliedParam] =
		useState<CampaignPredefinedParam | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const applyConversationConfig = (
		params: CampaignPredefinedParam['params']
	) => {
		const currentAgentConfig = form.values.agentConfig || {};
		const mergedConfig = applyCampaignBehaviorConversationConfig(
			(currentAgentConfig.conversationConfig || {}) as unknown as Record<
				string,
				unknown
			>,
			params.conversationConfig
		) as unknown as ConversationConfigModel;
		const mergedPlatformSettings = applyCampaignBehaviorPlatformSettings(
			(currentAgentConfig.platformSettings || {}) as Record<string, unknown>,
			params.platformSettings
		);

		form.setValues({
			agentConfig: {
				...currentAgentConfig,
				conversationConfig: mergedConfig,
				platformSettings:
					mergedPlatformSettings as typeof currentAgentConfig.platformSettings,
			},
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
			form.setFieldValue('configId', param.id);
			form.setFieldValue('agentConfig.configId', param.id);
		}
	};

	const currentPredefinedParam = useMemo(() => {
		if (!predefinedParams || predefinedParams.length === 0) {
			return null;
		}
		const currentConfigId = form.values.configId ?? '';
		return predefinedParams.find(
			(param) => String(param.id) === String(currentConfigId)
		);
	}, [predefinedParams, form.values.configId]);

	const behaviorActionLabel = currentPredefinedParam
		? t('form.agent.behavior.change')
		: t('form.agent.behavior.select');
	const currentConfigId = form.values.configId ?? '';

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
