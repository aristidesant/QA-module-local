import { TagsInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { useCampaignFormContext } from '~/modules/campaigns/campaignFormFunctions';

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
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const form = useCampaignFormContext();

	const currentKeywords =
		form.values.agentConfig?.conversationConfig?.asr?.keywords ?? [];

	const handleKeywordsChange = (values: string[]) => {
		form.setFieldValue(
			'agentConfig.conversationConfig.asr.keywords',
			normalizeKeywords(values)
		);
	};

	return (
		<SectionCard
			title={t('general.asrKeywords')}
			description={t('general.asrKeywordsDesc')}
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
