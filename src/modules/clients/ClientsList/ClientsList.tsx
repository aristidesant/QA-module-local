import { useMemo } from 'react';
import { Alert, Center, Loader, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable';
import { useGetAllClients } from '~/queries/clientQueries';
import type { ClientModel } from '~/models/ClientModel';
import { getClientDisplayLabel } from '~/utils/clientDisplay';
import useClientsColumns from '../hooks/useClientsColumns';
import classes from './ClientsList.module.css';

interface ClientsListProps {
	search: string;
	onEdit: (id: number) => void;
	onDelete: (client: ClientModel) => void;
}

const ClientsList: React.FC<ClientsListProps> = ({
	search,
	onEdit,
	onDelete,
}) => {
	const { t } = useTranslation('clients');
	const { data: clients, isLoading, isError, error } = useGetAllClients();

	const columns = useClientsColumns({ onEdit, onDelete });

	const filteredData = useMemo(() => {
		if (!clients) return [];
		if (!search.trim()) return clients;
		const query = search.toLowerCase();
		return clients.filter(
			(client) =>
				getClientDisplayLabel(client).toLowerCase().includes(query) ||
				client.name.toLowerCase().includes(query) ||
				client.identifier.toLowerCase().includes(query) ||
				(client.email && client.email.toLowerCase().includes(query))
		);
	}, [clients, search]);

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
				title={t('list.error.title')}
			>
				{error instanceof Error ? error.message : t('errors.unknownError')}
			</Alert>
		);
	}

	if (!filteredData.length) {
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
			<BaseTable<ClientModel>
				data={filteredData}
				columns={columns}
				onRowClick={(client) => onEdit(client.id)}
				getRowClassName={() => classes.tableRow}
				filterMode='client'
				enablePagination={true}
				showPaginationControls={true}
			/>
		</div>
	);
};

export default ClientsList;
