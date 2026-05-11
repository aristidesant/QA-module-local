import React, { useMemo, useState } from 'react';
import SectionCard from '~/components/SectionCard';
import useCampaignsPredefinedParams, {
	CampaignPredefinedParam,
} from '../../useCampaignsPredefinedParams';
import { Stack, Text, Group, Paper, ThemeIcon } from '@mantine/core';
import { useCampaignFormContext } from '~/modules/campaigns/campaignFormFunctions';
import { IconCheck } from '@tabler/icons-react';
import CampaignPredefinedParamsModal from './CampaignPredefinedParamsModal';
import { useTranslation } from 'react-i18next';
import type { ConversationConfigModel } from '~/models/AgentListObject';
import { applyCampaignBehaviorConversationConfig } from '~/modules/campaigns/utils/campaignBehaviorConfig';
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
		config: CampaignPredefinedParam['params']['conversationConfig']
	) => {
		const currentAgentConfig = form.values.agentConfig || {};
		const mergedConfig = applyCampaignBehaviorConversationConfig(
			(currentAgentConfig.conversationConfig || {}) as unknown as Record<
				string,
				unknown
			>,
			config
		) as unknown as ConversationConfigModel;

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
							</div>
						</Group>
					</Paper>
				) : (
					<Paper withBorder p='lg' radius='md' className={styles.emptyPaper}>
						<Stack align='center' gap='xs'>
							<Text size='sm' className={styles.statusText}>
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
