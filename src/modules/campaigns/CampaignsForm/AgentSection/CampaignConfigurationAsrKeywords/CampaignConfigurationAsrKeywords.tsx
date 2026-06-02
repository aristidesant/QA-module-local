import { TagsInput } from '@mantine/core';
import { IconTag } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { useAgentConfigFormContext } from '~/modules/campaigns/campaignFormFunctions';

const normalizeKeywords = (values: string[]) => {
	const uniqueKeywords = new Set<string>();

	values.forEach((value) => {
		const normalizedValue = value.trim();

		if (!normalizedValue) {
			return;
		}

		uniqueKeywords.add(normalizedValue);
	});

	return Array.from(uniqueKeywords);
};

const CampaignConfigurationAsrKeywords: React.FC = () => {
	const { t } = useTranslation([
		'campaign.form.general',
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const form = useAgentConfigFormContext();

	const currentKeywords = form.values.conversationConfig?.asr?.keywords ?? [];

	const handleKeywordsChange = (values: string[]) => {
		form.setFieldValue(
			'conversationConfig.asr.keywords',
			normalizeKeywords(values)
		);
	};

	return (
		<SectionCard
			icon={IconTag}
			title={t('general.asrKeywords')}
			description={t('general.asrKeywordsDesc')}
			contentSpacing='xs'
		>
			<TagsInput
				label={t('general.asrKeywords')}
				placeholder={t('general.asrKeywordsPlaceholder')}
				description={t('general.asrKeywordsHelp')}
				value={currentKeywords}
				onChange={handleKeywordsChange}
				size='sm'
			/>
		</SectionCard>
	);
};

export default CampaignConfigurationAsrKeywords;
