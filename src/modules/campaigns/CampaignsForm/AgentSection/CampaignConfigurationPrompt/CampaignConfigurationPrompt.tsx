import React, { useCallback, useState } from 'react';
import { Badge, Group, Stack, Text } from '@mantine/core';
import { IconBrain } from '@tabler/icons-react';
import { useAgentConfigFormContext } from '../../../campaignFormFunctions';
import SectionCard from '~/components/SectionCard';
import { useTranslation } from 'react-i18next';
import styles from './CampaignConfigurationPrompt.module.css';
import CampaignAgentPromptEditModal from './CampaignAgentPromptEditModal';

interface CampaignConfigurationPromptProps {
	onOpenSettings?: () => void;
}

const CampaignConfigurationPrompt: React.FC<
	CampaignConfigurationPromptProps
> = ({ onOpenSettings }) => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const form = useAgentConfigFormContext();
	const [editModalOpen, setEditModalOpen] = useState(false);

	const prompt = form.values.conversationConfig?.agent?.prompt?.prompt || '';

	const handleEdit = useCallback(() => {
		setEditModalOpen(true);
	}, []);

	const hasPrompt = prompt.trim().length > 0;

	return (
		<>
			<SectionCard
				icon={IconBrain}
				title={t('form.agent.prompt.title')}
				description={t('form.agent.prompt.description')}
				className={styles.sectionCard}
				contentSpacing='sm'
				padding='md'
				onEdit={handleEdit}
				onOpenSettings={onOpenSettings}
			>
				<Stack gap='xs' className={styles.promptStack}>
					<Group justify='space-between' align='center'>
						<div>
							<Text size='sm' fw={600}>
								{t('form.agent.prompt.previewTitle')}
							</Text>
							<Text size='xs' c='dimmed'>
								{t('form.agent.prompt.simpleModal.helper')}
							</Text>
						</div>
						<Badge size='sm' variant='light' color='gray'>
							{hasPrompt
								? t('form.agent.prompt.simpleModal.chars', {
										count: prompt.length,
									})
								: t('form.agent.prompt.status.empty')}
						</Badge>
					</Group>
					<div className={styles.promptSummary}>
						<Text size='xs' className={styles.promptPreview} lineClamp={10}>
							{hasPrompt ? prompt : t('form.agent.prompt.simpleModal.empty')}
						</Text>
					</div>
				</Stack>
			</SectionCard>
			{false && null}
			<CampaignAgentPromptEditModal
				opened={editModalOpen}
				onClose={() => setEditModalOpen(false)}
			/>
		</>
	);
};

export default CampaignConfigurationPrompt;
