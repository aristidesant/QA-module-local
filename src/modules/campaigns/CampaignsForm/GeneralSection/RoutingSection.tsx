import { useTranslation } from 'react-i18next';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import CampaignObjectiveField from './CampaignObjectiveField';
import { normalizeCampaignType } from './GeneralSection.helpers';
import styles from './GeneralSection.module.css';
import PhoneNumberAssignment from './PhoneNumberAssignment';

const RoutingSection = () => {
	const { t } = useTranslation('campaign.form.general');
	const form = useCampaignFormContext();
	const isOutbound = normalizeCampaignType(form.values.type) !== 'INBOUND';

	return (
		<section className={styles.subsection}>
			<div className={styles.subsectionHeader}>
				<h6 className={styles.subsectionTitle}>{t('general.routing.title')}</h6>
			</div>

			<div className={styles.routingStack}>
				<div className={styles.routingItem}>
					<PhoneNumberAssignment />
				</div>

				{isOutbound && (
					<div className={styles.routingItem}>
						<CampaignObjectiveField />
					</div>
				)}
			</div>
		</section>
	);
};

export default RoutingSection;
