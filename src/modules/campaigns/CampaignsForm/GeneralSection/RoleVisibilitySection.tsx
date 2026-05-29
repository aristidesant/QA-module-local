import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import CampaignRoleVisibilitySelector from '../../components/CampaignRoleVisibilitySelector';

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
		<SectionCard
			title={t('general.roleVisibility.title')}
			description={t('general.roleVisibility.description')}
			contentSpacing='sm'
		>
			<CampaignRoleVisibilitySelector
				value={value}
				onChange={onChange}
				label={t('general.roleVisibility.label')}
				description={t('general.roleVisibility.fieldDescription')}
				placeholder={t('general.roleVisibility.placeholder')}
				hint={t('general.roleVisibility.hint')}
				disabled={disabled}
			/>
		</SectionCard>
	);
};

export default RoleVisibilitySection;
