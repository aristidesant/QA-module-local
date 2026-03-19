// CampaignConfigurationBasic.tsx
import React from 'react';
import { Textarea } from '@mantine/core';
import { IconMessageDots } from '@tabler/icons-react';
import { useCampaignFormContext } from '../../../campaignFormFunctions';
import styles from './CampaignConfigurationBasic.module.css';
import SectionCard from '~/components/SectionCard';
import { useTranslation } from 'react-i18next';

const CampaignConfigurationBasic: React.FC = () => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const form = useCampaignFormContext();

	return (
		<SectionCard
			icon={IconMessageDots}
			title={t('form.agent.basic.firstMessage')}
			description={t('form.agent.basic.firstMessageDescription')}
			className={styles.sectionCard}
			contentSpacing='lg'
		>
			<Textarea
				placeholder={t('form.agent.basic.firstMessagePlaceholder')}
				rows={4}
				value={
					form.values.agentConfig?.conversationConfig?.agent?.firstMessage ?? ''
				}
				onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
					form.setFieldValue(
						'agentConfig.conversationConfig.agent.firstMessage',
						e.target.value
					)
				}
			/>
		</SectionCard>
	);
};

export default CampaignConfigurationBasic;
