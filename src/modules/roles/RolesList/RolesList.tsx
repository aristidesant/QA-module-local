import { useMemo } from 'react';
import { Alert, Center, Loader, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
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
			<Center>
				<Loader size='sm' />
			</Center>
		);
	}

	if (isError) {
		return (
			<Alert
				icon={<IconInfoCircle size={18} />}
				color='red'
				title='Unable to load roles'
			>
				{error instanceof Error ? error.message : 'Unknown error'}
			</Alert>
		);
	}

	if (!filteredRoles.length) {
		return (
			<Center>
				<Text size='sm' c='dimmed'>
					No roles found.
				</Text>
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
