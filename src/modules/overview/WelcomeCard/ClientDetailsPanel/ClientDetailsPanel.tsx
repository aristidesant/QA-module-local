import { Text, Group, Avatar, Button, Badge } from '@mantine/core';
import classes from './ClientDetailsPanel.module.css';

const mockClientData = [
	{
		id: 1,
		name: 'Banco Popular Dominicano',
		status: 'Active',
		type: 'Banking',
	},
	{ id: 2, name: 'Claro Dominicana', status: 'Active', type: 'Telecom' },
	{ id: 3, name: 'Banco BHD León', status: 'Active', type: 'Banking' },
	{
		id: 4,
		name: 'Nestlé Dominicana',
		status: 'Active',
		type: 'Consumer Goods',
	},
	{ id: 5, name: 'Grupo Punta Cana', status: 'Active', type: 'Tourism' },
	{ id: 6, name: 'Santo Domingo Motors', status: 'Active', type: 'Automotive' },
	{ id: 7, name: 'Grupo Humano', status: 'Active', type: 'Services' },
	{ id: 8, name: 'Scotiabank', status: 'Active', type: 'Banking' },
	{ id: 9, name: 'Altice Dominicana', status: 'Active', type: 'Telecom' },
	{
		id: 10,
		name: 'Banco Universal Banesco',
		status: 'Inactive',
		type: 'Banking',
	},
	{ id: 11, name: 'Banco Caribe', status: 'Inactive', type: 'Banking' },
];

export default function ClientDetailsPanel() {
	// const { selectedClient } = useClientStore(); // TODO: Use selectedClient for filtering or highlighting

	return (
		<div className={classes.detailsPanel}>
			<div className={classes.header}>
				<Text size='sm' fw={500}>
					Client details overview
				</Text>
				<Text size='xs' c='dimmed'>
					Explore campaigns, performance, and account activity statistics
				</Text>
			</div>

			<div className={classes.clientsList}>
				{mockClientData.map((client) => (
					<div key={client.id} className={classes.clientRow}>
						<Group gap='sm' className={classes.clientInfo}>
							<Avatar size='sm' className={classes.clientAvatar}>
								{client.name.charAt(0)}
							</Avatar>
							<div className={classes.clientText}>
								<Text size='xs' c='dimmed'>
									{client.type}
								</Text>
								<Text size='sm' fw={500}>
									{client.name}
								</Text>
							</div>
						</Group>
						<Group gap='xs'>
							<Badge
								size='xs'
								color={client.status === 'Active' ? 'green' : 'gray'}
								variant='light'
							>
								{client.status}
							</Badge>
							<Button size='xs' variant='light'>
								Gestionar
							</Button>
						</Group>
					</div>
				))}
			</div>
		</div>
	);
}
