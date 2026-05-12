import { Alert, Loader, MultiSelect, Text } from '@mantine/core';
import { IconAlertCircle, IconUsersGroup } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAllRoles } from '~/queries/roleQueries';
import classes from './CampaignRoleVisibilitySelector.module.css';

interface CampaignRoleVisibilitySelectorProps {
	value: number[];
	onChange: (roleIds: number[]) => void;
	label: string;
	description: string;
	placeholder: string;
	hint: string;
	disabled?: boolean;
}

const CampaignRoleVisibilitySelector: React.FC<
	CampaignRoleVisibilitySelectorProps
> = ({ value, onChange, label, description, placeholder, hint, disabled }) => {
	const { t } = useTranslation(['campaign.form.general', 'campaigns.wizard']);
	const {
		data: roles = [],
		isLoading,
		isError,
	} = useGetAllRoles({ isActive: true });

	const roleOptions = useMemo(
		() =>
			roles
				.filter((role) => role.isActive)
				.map((role) => ({
					value: String(role.id),
					label: role.name,
				})),
		[roles]
	);

	const selectedValues = useMemo(() => value.map(String), [value]);

	return (
		<div className={classes.container}>
			{isError && (
				<Alert
					variant='light'
					color='red'
					icon={<IconAlertCircle size={16} />}
					title={t('general.roleVisibility.loadErrorTitle')}
				>
					{t('general.roleVisibility.loadErrorDescription')}
				</Alert>
			)}

			<MultiSelect
				label={label}
				description={description}
				placeholder={placeholder}
				data={roleOptions}
				value={selectedValues}
				onChange={(nextValues) =>
					onChange(nextValues.map((roleId) => Number(roleId)))
				}
				leftSection={<IconUsersGroup size={16} />}
				rightSection={isLoading ? <Loader size={16} /> : undefined}
				searchable
				clearable
				disabled={disabled || isLoading || isError}
				nothingFoundMessage={t('general.roleVisibility.noRolesFound')}
				size='sm'
			/>

			<Text size='xs' c='dimmed' className={classes.hint}>
				{hint}
			</Text>
		</div>
	);
};

export default CampaignRoleVisibilitySelector;
