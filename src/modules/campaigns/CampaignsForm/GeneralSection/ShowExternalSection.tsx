import { Switch } from '@mantine/core';
import { IconDeviceMobile } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { useCampaignFormContext } from '../../campaignFormFunctions';

const ShowExternalSection = () => {
	const { t } = useTranslation('campaign.form.general');
	const form = useCampaignFormContext();

	return (
		<SectionCard
			title={t('general.showExternalTitle')}
			description={t('general.showExternalSectionDesc')}
			icon={IconDeviceMobile}
			contentSpacing='sm'
		>
			<Switch
				aria-label={t('general.showExternalLabel')}
				label={t('general.showExternalLabel')}
				description={t('general.showExternalDesc')}
				size='sm'
				checked={form.values.showExternal ?? false}
				onChange={(event) =>
					form.setFieldValue('showExternal', event.currentTarget.checked)
				}
			/>
		</SectionCard>
	);
};

export default ShowExternalSection;
