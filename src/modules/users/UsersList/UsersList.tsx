import { useMemo, useState } from 'react';
import { Alert, Center, Loader, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable';
import PaginationControls from '~/components/PaginationControls';
import { useGetAllUsers } from '~/queries/userQueries';
import type { UserModel } from '~/models/UserModels';
import useUsersColumns from '../hooks/useUsersColumns';
import classes from './UsersList.module.css';

interface UsersListProps {
	search: string;
	onView: (userId: number) => void;
	onEdit: (userId: number) => void;
	onDelete: (user: UserModel) => void;
}

const UsersList: React.FC<UsersListProps> = ({
	search,
	onView,
	onEdit,
	onDelete,
}) => {
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const { data, isLoading, isError, error } = useGetAllUsers({
		page,
		limit,
		search: search.trim() || undefined,
	});

	const columns = useUsersColumns({ onView, onEdit, onDelete });

	const filteredUsers = useMemo(() => {
		return data?.data || [];
	}, [data?.data]);

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
				title='Unable to load users'
			>
				{error instanceof Error ? error.message : 'Unknown error'}
			</Alert>
		);
	}

	if (!filteredUsers.length) {
		return (
			<Center>
				<Text size='sm' c='dimmed'>
					No users found.
				</Text>
			</Center>
		);
	}

	return (
		<div className={classes.root}>
			<BaseTable<UserModel>
				data={filteredUsers}
				columns={columns}
				onRowClick={(user) => onView(user.id)}
				getRowClassName={() => classes.tableRow}
				filterMode='client'
			/>
			{data && (
				<PaginationControls
					currentPage={page}
					totalPages={data.totalPages}
					onPageChange={setPage}
					onItemsPerPageChange={(value) => {
						setLimit(value ? parseInt(value, 10) : 10);
						setPage(1);
					}}
					totalItems={data.total}
					itemsPerPage={limit}
					isLoading={isLoading}
					itemLabel='users'
				/>
			)}
		</div>
	);
};

export default UsersList;
