import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { Alert, Center, Loader, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable';
import PaginationControls from '~/components/PaginationControls';
import { useGetAllUsers } from '~/queries/userQueries';
import type { UserModel } from '~/models/UserModels';
import type { GetAllUsersParams } from '~/api/userApi';
import useUsersColumns from '../hooks/useUsersColumns';
import classes from './UsersList.module.css';

interface UsersListProps {
	search: string;
	onView: (userId: number) => void;
	onEdit: (userId: number) => void;
	onDelete: (user: UserModel) => void;
}

type UsersSortBy = NonNullable<GetAllUsersParams['sortBy']>;

const DEFAULT_USERS_SORT_BY: UsersSortBy = 'updatedAt';
const DEFAULT_USERS_SORT_ORDER: NonNullable<GetAllUsersParams['sortOrder']> =
	'DESC';
const USERS_SORTABLE_FIELDS: UsersSortBy[] = [
	'id',
	'username',
	'email',
	'firstName',
	'lastName',
	'status',
	'createdAt',
	'updatedAt',
];

const isUsersSortBy = (value: string): value is UsersSortBy => {
	return USERS_SORTABLE_FIELDS.includes(value as UsersSortBy);
};

const UsersList: React.FC<UsersListProps> = ({
	search,
	onView,
	onEdit,
	onDelete,
}) => {
	const { t } = useTranslation('users');
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [sortBy, setSortBy] = useState<UsersSortBy>(DEFAULT_USERS_SORT_BY);
	const [sortOrder, setSortOrder] = useState<
		NonNullable<GetAllUsersParams['sortOrder']>
	>(DEFAULT_USERS_SORT_ORDER);

	useEffect(() => {
		setPage(1);
	}, [search]);

	const { data, isLoading, isError, error } = useGetAllUsers({
		page,
		limit,
		search: search.trim() || undefined,
		sortBy,
		sortOrder,
	});

	const columns = useUsersColumns({ onView, onEdit, onDelete });

	const filteredUsers = useMemo(() => {
		return data?.data || [];
	}, [data?.data]);

	const handleSortingChange = useCallback((sorting: SortingState) => {
		const firstSort = sorting[0];

		if (!firstSort || !isUsersSortBy(firstSort.id)) {
			setSortBy(DEFAULT_USERS_SORT_BY);
			setSortOrder(DEFAULT_USERS_SORT_ORDER);
			setPage(1);
			return;
		}

		setSortBy(firstSort.id);
		setSortOrder(firstSort.desc ? 'DESC' : 'ASC');
		setPage(1);
	}, []);

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
				title={t('list.errorTitle')}
			>
				{error instanceof Error ? error.message : t('list.unknownError')}
			</Alert>
		);
	}

	if (!filteredUsers.length) {
		return (
			<Center>
				<Text size='sm' c='dimmed'>
					{t('list.empty')}
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
				filterMode='server'
				initialSort={[{ id: DEFAULT_USERS_SORT_BY, desc: true }]}
				onSortingChange={handleSortingChange}
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
					itemLabel={t('list.itemLabel')}
				/>
			)}
		</div>
	);
};

export default UsersList;
