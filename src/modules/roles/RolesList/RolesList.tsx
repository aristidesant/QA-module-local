import { useMemo } from 'react';
import { Alert, Center, Skeleton, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable';
import { useGetAllRoles } from '~/queries/roleQueries';
import type { RoleModel } from '~/models/RoleModel';
import useRolesColumns from '../hooks/useRolesColumns';
import classes from './RolesList.module.css';

interface RolesListProps {
	search: string;
	onView: (roleId: number) => void;
	onEdit: (roleId: number) => void;
	onDelete: (role: RoleModel) => void;
}

const RolesList: React.FC<RolesListProps> = ({
	search,
	onView,
	onEdit,
	onDelete,
}) => {
	const { t } = useTranslation('roles');
	const { data, isLoading, isError, error } = useGetAllRoles();

	const columns = useRolesColumns({ onView, onEdit, onDelete });

	const filteredRoles = useMemo(() => {
		const roles = data || [];
		if (!search.trim()) {
			return roles;
		}
		const searchLower = search.toLowerCase();
		return roles.filter(
			(role) =>
				role.name.toLowerCase().includes(searchLower) ||
				role.code.toLowerCase().includes(searchLower) ||
				role.description?.toLowerCase().includes(searchLower)
		);
	}, [data, search]);

	if (isLoading) {
		return (
			<Stack gap='xs' px='xs'>
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} height={44} radius='sm' animate />
				))}
			</Stack>
		);
	}

	if (isError) {
		return (
			<Alert
				icon={<IconInfoCircle size={18} />}
				color='red'
				title={t('list.errorTitle')}
			>
				{error instanceof Error ? error.message : t('list.unknownError')}
			</Alert>
		);
	}

	if (!filteredRoles.length) {
		return (
			<Center py='xl'>
				<Stack align='center' gap='xs'>
					<Text size='sm' fw={600} c='dimmed'>
						{t('list.empty')}
					</Text>
					<Text size='xs' c='dimmed'>
						{search
							? t('list.emptySearch', 'No roles match your search.')
							: t('list.emptyHint', 'Create a role to get started.')}
					</Text>
				</Stack>
			</Center>
		);
	}

	return (
		<div className={classes.root}>
			<BaseTable<RoleModel>
				data={filteredRoles}
				columns={columns}
				onRowClick={(role) => onView(role.id)}
				getRowClassName={() => classes.tableRow}
				filterMode='client'
			/>
		</div>
	);
};

export default RolesList;
