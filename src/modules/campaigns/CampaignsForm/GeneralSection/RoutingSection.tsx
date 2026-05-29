import { IconPhone } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
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
		<SectionCard
			title={t('general.routing.title')}
			description={
				isOutbound
					? t('general.routing.description')
					: t('general.routing.descriptionInbound')
			}
			icon={IconPhone}
			contentSpacing='sm'
		>
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
		</SectionCard>
	);
};

export default RoutingSection;
