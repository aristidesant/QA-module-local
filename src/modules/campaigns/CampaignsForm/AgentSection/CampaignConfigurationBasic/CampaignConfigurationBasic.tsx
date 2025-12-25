// CampaignConfigurationBasic.tsx
import React from 'react';
import { Select, Textarea } from '@mantine/core';
import { IconLanguage, IconSettings } from '@tabler/icons-react';
import { useCampaignFormContext } from '../../../campaignFormFunctions';
import styles from './CampaignConfigurationBasic.module.css';
import SectionCard from '~/components/SectionCard';
import { useTranslation } from 'react-i18next';

const CampaignConfigurationBasic: React.FC = () => {
	const { t } = useTranslation('campaigns');
	const form = useCampaignFormContext();

	const currentLanguage =
		form.values.agentConfig?.conversationConfig?.agent?.language || '';
	const languageOptions = [
		{ value: 'en', label: t('form.agent.basic.languages.en') },
		{ value: 'es', label: t('form.agent.basic.languages.es') },
	];

	const handleLanguageChange = (value: string | null) => {
		if (value) {
			form.setFieldValue(
				'agentConfig.conversationConfig.agent.language',
				value
			);
		}
	};

	return (
		<SectionCard
			icon={IconSettings}
			title={t('form.agent.basic.title')}
			description={t('form.agent.basic.description')}
			className={styles.sectionCard}
			contentSpacing='lg'
		>
			<Select
				label={t('form.agent.basic.language')}
				placeholder={t('form.agent.basic.languagePlaceholder')}
				value={currentLanguage}
				onChange={handleLanguageChange}
				data={languageOptions}
				description={t('form.agent.basic.languageDescription')}
				searchable
				nothingFoundMessage={t('form.agent.basic.noLanguageFound')}
				leftSection={<IconLanguage size={16} />}
			/>
			<Textarea
				placeholder={t('form.agent.basic.firstMessagePlaceholder')}
				rows={4}
				label={t('form.agent.basic.firstMessage')}
				value={
					form.values.agentConfig?.conversationConfig?.agent?.firstMessage ?? ''
				}
				onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
					form.setFieldValue(
						'agentConfig.conversationConfig.agent.firstMessage',
						e.target.value
					)
				}
				description={t('form.agent.basic.firstMessageDescription')}
			/>
		</SectionCard>
	);
};

export default CampaignConfigurationBasic;
