import { Switch } from '@mantine/core';
import { IconMicrophoneOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { useCampaignFormContext } from '../../campaignFormFunctions';

const NoiseCancellationSection = () => {
	const { t } = useTranslation('campaign.form.general');
	const form = useCampaignFormContext();

	return (
		<SectionCard
			title={t('general.noiseCancellationTitle')}
			description={t('general.noiseCancellationSectionDesc')}
			icon={IconMicrophoneOff}
			contentSpacing='sm'
		>
			<Switch
				aria-label={t('general.noiseCancellationLabel')}
				label={t('general.noiseCancellationLabel')}
				description={t('general.noiseCancellationDesc')}
				size='sm'
				checked={form.values.noiseCancellation ?? false}
				onChange={(event) =>
					form.setFieldValue('noiseCancellation', event.currentTarget.checked)
				}
			/>
		</SectionCard>
	);
};

export default NoiseCancellationSection;
