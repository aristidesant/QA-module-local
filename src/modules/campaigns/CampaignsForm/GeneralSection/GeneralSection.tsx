import { IconPhone, IconSettings } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import CampaignBasicsSection from './CampaignBasicsSection';
import EffectiveContactObjectiveSection from './EffectiveContactObjectiveSection';
import ExecutionDefaultsSection from './ExecutionDefaultsSection';
import styles from './GeneralSection.module.css';
import NoiseCancellationSection from './NoiseCancellationSection';
import RoutingSection from './RoutingSection';
import RoleVisibilitySection from './RoleVisibilitySection';
import ShowExternalSection from './ShowExternalSection';

interface GeneralSectionProps {
	roleVisibilityValue: number[];
	onRoleVisibilityChange: (roleIds: number[]) => void;
	roleVisibilityDisabled?: boolean;
}

const GeneralSection: React.FC<GeneralSectionProps> = ({
	roleVisibilityValue,
	onRoleVisibilityChange,
	roleVisibilityDisabled,
}) => {
	const { t } = useTranslation('campaign.form.general');

	return (
		<div className={styles.generalLayout}>
			<div className={styles.contentGrid}>
				<div className={styles.primaryColumn}>
					<CampaignBasicsSection />
					<SectionCard
						title={t('general.contactAndRouting.title')}
						icon={IconPhone}
						contentSpacing='md'
						contentClassName={styles.groupStack}
					>
						<EffectiveContactObjectiveSection />
						<RoutingSection />
					</SectionCard>
				</div>

				<div className={styles.secondaryColumn}>
					<SectionCard
						title={t('general.operationAndAccess.title')}
						icon={IconSettings}
						contentSpacing='md'
						contentClassName={styles.groupStack}
					>
						<ExecutionDefaultsSection />
						<section className={styles.subsection}>
							<div className={styles.subsectionHeader}>
								<h6 className={styles.subsectionTitle}>
									{t('general.behavior.title')}
								</h6>
							</div>
							<div className={styles.switchList}>
								<NoiseCancellationSection />
								<ShowExternalSection />
							</div>
						</section>
						<RoleVisibilitySection
							value={roleVisibilityValue}
							onChange={onRoleVisibilityChange}
							disabled={roleVisibilityDisabled}
						/>
					</SectionCard>
				</div>
			</div>
		</div>
	);
};

export default GeneralSection;
