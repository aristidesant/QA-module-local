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
}) => (
	<div className={styles.generalLayout}>
		<div className={styles.column}>
			<CampaignBasicsSection />
			<EffectiveContactObjectiveSection />
			<RoutingSection />
		</div>

		<div className={styles.column}>
			<ExecutionDefaultsSection />
			<NoiseCancellationSection />
			<ShowExternalSection />
			<RoleVisibilitySection
				value={roleVisibilityValue}
				onChange={onRoleVisibilityChange}
				disabled={roleVisibilityDisabled}
			/>
		</div>
	</div>
);

export default GeneralSection;
