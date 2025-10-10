// CampaignConfigurationBasic.tsx
import React from 'react';
import { Select, Textarea } from '@mantine/core';
import { IconLanguage, IconSettings } from '@tabler/icons-react';
import { useCampaignFormContext } from '../../../campaignFormFunctions';
import styles from './CampaignConfigurationBasic.module.css';
import SectionCard from '~/components/SectionCard';

const CampaignConfigurationBasic: React.FC = () => {
	const form = useCampaignFormContext();

	const currentLanguage =
		form.values.agentConfig?.conversationConfig?.agent?.language || '';
	const languageOptions = [
		{ value: 'en', label: 'English' },
		{ value: 'es', label: 'Spanish' },
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
			title='Basic Configuration'
			description='Configure the fundamental settings for your campaign agent'
			className={styles.sectionCard}
			contentSpacing='lg'
		>
			<Select
				label='Language'
				placeholder='Select language'
				value={currentLanguage}
				onChange={handleLanguageChange}
				data={languageOptions}
				description="Choose the language for the agent's responses"
				searchable
				nothingFoundMessage='No language found'
				leftSection={<IconLanguage size={16} />}
			/>
			<Textarea
				placeholder='Enter the first message your agent will send...'
				rows={4}
				label='Agent First Message'
				value={
					form.values.agentConfig?.conversationConfig?.agent?.first_message ||
					''
				}
				onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
					form.setFieldValue(
						'agentConfig.conversationConfig.agent.first_message',
						e.target.value
					)
				}
				description='This greeting message will be the first thing users see when they interact with your agent'
			/>
		</SectionCard>
	);
};

export default CampaignConfigurationBasic;
