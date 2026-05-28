import { Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import CampaignVoicePoolSelector from '~/modules/campaigns/components/CampaignVoicePoolSelector';
import { useCampaignFormContext } from '../../campaignFormFunctions';

const VoicesSection = () => {
	const { t } = useTranslation('campaign.form.voices');
	const form = useCampaignFormContext();

	return (
		<SectionCard
			title={t('section.title')}
			description={t('section.description')}
		>
			<Stack gap='md'>
				<CampaignVoicePoolSelector
					value={form.values.voiceIds ?? []}
					onChange={(nextVoiceIds) =>
						form.setFieldValue('voiceIds', nextVoiceIds)
					}
					label={t('selector.label')}
					description={t('selector.description')}
					placeholder={t('selector.placeholder')}
					hint={t('selector.hint')}
					noVoicesMessage={t('selector.noVoices')}
					noMatchesMessage={t('selector.noMatches')}
					loadErrorTitle={t('selector.loadErrorTitle')}
					loadErrorDescription={t('selector.loadErrorDescription')}
				/>
			</Stack>
		</SectionCard>
	);
};

export default VoicesSection;
