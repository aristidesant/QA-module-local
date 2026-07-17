import { Switch } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import styles from './GeneralSection.module.css';

const ShowExternalSection = () => {
	const { t } = useTranslation('campaign.form.general');
	const form = useCampaignFormContext();

	return (
		<div className={styles.switchRow}>
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
		</div>
	);
};

export default ShowExternalSection;
