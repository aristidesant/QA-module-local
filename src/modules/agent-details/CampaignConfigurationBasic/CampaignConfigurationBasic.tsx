// CampaignConfigurationBasic.tsx
import React from 'react';
import { Select, Stack, Textarea } from '@mantine/core';
import { IconLanguage, IconMessageDots } from '@tabler/icons-react';
import { useAgentConfigFormContext } from '../../campaigns/campaignFormFunctions';
import styles from './CampaignConfigurationBasic.module.css';
import SectionCard from '~/components/SectionCard';
import { useTranslation } from 'react-i18next';

const CampaignConfigurationBasic: React.FC = () => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const form = useAgentConfigFormContext();

	const languageOptions = [
		{
			value: 'en',
			label: t('form.agent.basic.languages.en'),
		},
		{
			value: 'es',
			label: t('form.agent.basic.languages.es'),
		},
	];

	return (
		<SectionCard
			icon={IconMessageDots}
			title={t('form.agent.basic.firstMessage')}
			description={t('form.agent.basic.firstMessageDescription')}
			className={styles.sectionCard}
			contentSpacing='lg'
		>
			<Stack gap='sm'>
				<Select
					label={t('form.agent.basic.language')}
					placeholder={t('form.agent.basic.languagePlaceholder')}
					leftSection={<IconLanguage size={14} />}
					value={form.values.conversationConfig?.agent?.language || ''}
					onChange={(value) => {
						if (value)
							form.setFieldValue('conversationConfig.agent.language', value);
					}}
					data={languageOptions}
					searchable
					nothingFoundMessage={t('form.agent.basic.noLanguageFound')}
					size='sm'
				/>
				<Textarea
					label={t('form.agent.basic.firstMessage')}
					placeholder={t('form.agent.basic.firstMessagePlaceholder')}
					rows={4}
					value={form.values.conversationConfig?.agent?.firstMessage ?? ''}
					onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
						form.setFieldValue(
							'conversationConfig.agent.firstMessage',
							e.target.value
						)
					}
				/>
			</Stack>
		</SectionCard>
	);
};

export default CampaignConfigurationBasic;
