import {
	Avatar,
	Text,
	Group,
	Button,
	Badge,
	Loader,
	Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useClientStore } from '~/stores/clientStore';
import { useGetAllClients } from '~/queries/clientQueries';
import { useImpersonateClient } from '~/queries/authQueries';
import classes from './ClientList.module.css';
import { useMemo } from 'react';

export default function ClientList() {
	const { searchQuery } = useClientStore();
	const { data: clients = [], isLoading, error } = useGetAllClients();
	const impersonateClientMutation = useImpersonateClient();

	const filteredClients = useMemo(
		() =>
			clients.filter((client) =>
				client.name.toLowerCase().includes(searchQuery.toLowerCase())
			),
		[clients, searchQuery]
	);

	const handleImpersonateClient = (clientId: number, clientName: string) => {
		modals.openConfirmModal({
			title: 'Impersonate Client',
			children: (
				<Text size='sm'>
					Are you sure you want to switch to <strong>{clientName}</strong>? You
					will be logged in as this client and can return to your master account
					later.
				</Text>
			),
			labels: { confirm: 'Switch to Client', cancel: 'Cancel' },
			confirmProps: { color: 'blue' },
			onConfirm: () => {
				impersonateClientMutation.mutate({ targetClientId: clientId });
			},
		});
	};

	if (isLoading) {
		return (
			<div className={classes.loadingContainer}>
				<Loader size='md' />
				<Text size='sm' c='dimmed'>
					Loading clients...
				</Text>
			</div>
		);
	}

	if (error) {
		return (
			<Alert
				icon={<IconAlertCircle size={16} />}
				title='Error loading clients'
				color='red'
				variant='light'
			>
				Unable to load client data. Please try again later.
			</Alert>
		);
	}

	return (
		<div className={classes.clientList}>
			{filteredClients.map((client) => (
				<div key={client.id} className={classes.clientItem}>
					<Group gap={12} className={classes.clientInfo}>
						<Avatar
							size={40}
							radius='md'
							className={classes.clientLogo}
							color='blue'
						>
							{client.name
								.split(' ')
								.map((word) => word.charAt(0))
								.join('')
								.substring(0, 2)
								.toUpperCase()}
						</Avatar>
						<div className={classes.clientDetails}>
							<Text className={classes.clientName}>{client.name}</Text>
							<Text className={classes.clientType}>
								{client.description || 'Client'}
							</Text>
						</div>
					</Group>

					<Group gap={8} className={classes.clientActions}>
						<Badge
							variant={client.deletedAt ? 'outline' : 'light'}
							color={client.deletedAt ? 'gray' : 'green'}
							size='sm'
							className={classes.statusBadge}
						>
							{client.deletedAt ? 'Inactive' : 'Active'}
						</Badge>
						<Button
							variant='light'
							size='xs'
							onClick={() => handleImpersonateClient(client.id, client.name)}
							disabled={!!client.deletedAt}
						>
							Gestionar
						</Button>
					</Group>
				</div>
			))}
		</div>
	);
}
