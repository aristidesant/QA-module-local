import { Switch } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import styles from './GeneralSection.module.css';

const NoiseCancellationSection = () => {
	const { t } = useTranslation('campaign.form.general');
	const form = useCampaignFormContext();

	return (
		<div className={styles.switchRow}>
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
		</div>
	);
};

export default NoiseCancellationSection;
