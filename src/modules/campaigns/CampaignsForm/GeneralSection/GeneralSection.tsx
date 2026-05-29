import CampaignBasicsSection from './CampaignBasicsSection';
import ExecutionDefaultsSection from './ExecutionDefaultsSection';
import styles from './GeneralSection.module.css';
import RoutingSection from './RoutingSection';
import RoleVisibilitySection from './RoleVisibilitySection';

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
			<RoutingSection />
		</div>

		<div className={styles.column}>
			<ExecutionDefaultsSection />
			<RoleVisibilitySection
				value={roleVisibilityValue}
				onChange={onRoleVisibilityChange}
				disabled={roleVisibilityDisabled}
			/>
		</div>
	</div>
);

export default GeneralSection;
