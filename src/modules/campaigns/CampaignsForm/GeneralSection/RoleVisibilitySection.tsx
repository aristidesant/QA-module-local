import { useTranslation } from 'react-i18next';
import CampaignRoleVisibilitySelector from '../../components/CampaignRoleVisibilitySelector';
import styles from './GeneralSection.module.css';

interface RoleVisibilitySectionProps {
	value: number[];
	onChange: (roleIds: number[]) => void;
	disabled?: boolean;
}

const RoleVisibilitySection: React.FC<RoleVisibilitySectionProps> = ({
	value,
	onChange,
	disabled,
}) => {
	const { t } = useTranslation('campaign.form.general');

	return (
		<section className={styles.subsection}>
			<div className={styles.subsectionHeader}>
				<h6 className={styles.subsectionTitle}>
					{t('general.roleVisibility.title')}
				</h6>
			</div>
			<CampaignRoleVisibilitySelector
				value={value}
				onChange={onChange}
				label={t('general.roleVisibility.label')}
				description=''
				placeholder={t('general.roleVisibility.placeholder')}
				hint={t('general.roleVisibility.hint')}
				disabled={disabled}
			/>
		</section>
	);
};

export default RoleVisibilitySection;
