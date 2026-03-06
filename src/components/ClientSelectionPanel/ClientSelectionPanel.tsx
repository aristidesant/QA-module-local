import {
	Badge,
	Box,
	Card,
	Group,
	Loader,
	ScrollArea,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { IconBuilding, IconCheck, IconSearch } from '@tabler/icons-react';
import { KeyboardEvent, useMemo, useState } from 'react';
import EmptyState from '~/components/EmptyState';
import type { ClientSelectOption } from '~/api/authApi';
import classes from './ClientSelectionPanel.module.css';

interface ClientSelectionPanelProps {
	title: string;
	description: string;
	searchPlaceholder: string;
	countLabel: string;
	selectedLabel: string;
	emptyTitle: string;
	emptyDescription: string;
	loadingLabel?: string;
	currentClientLabel?: string;
	currentClientTooltip?: string;
	clients: ClientSelectOption[];
	selectedClientId?: number | null;
	currentClientId?: number | null;
	isLoading?: boolean;
	isMutating?: boolean;
	onSelect: (client: ClientSelectOption) => void;
}

export default function ClientSelectionPanel({
	title,
	description,
	searchPlaceholder,
	countLabel,
	selectedLabel,
	emptyTitle,
	emptyDescription,
	loadingLabel,
	currentClientLabel,
	currentClientTooltip,
	clients,
	selectedClientId,
	currentClientId,
	isLoading = false,
	isMutating = false,
	onSelect,
}: ClientSelectionPanelProps) {
	const [search, setSearch] = useState('');

	const filteredClients = useMemo(() => {
		if (!search.trim()) return clients;
		const query = search.toLowerCase();
		return clients.filter(
			(client) =>
				client.clientName.toLowerCase().includes(query) ||
				client.clientIdentifier.toLowerCase().includes(query)
		);
	}, [clients, search]);

	const handleCardKeyDown = (
		event: KeyboardEvent<HTMLDivElement>,
		client: ClientSelectOption,
		disabled: boolean
	) => {
		if (disabled) {
			return;
		}

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onSelect(client);
		}
	};

	const getClientCard = (client: ClientSelectOption) => {
		const isSelected = selectedClientId === client.clientId;
		const isCurrentClient = currentClientId === client.clientId;
		const isDisabled = isMutating || isCurrentClient;

		return (
			<Card
				key={client.clientId}
				withBorder
				padding='md'
				className={classes.clientCard}
				data-selected={isSelected}
				data-current={isCurrentClient}
				data-disabled={isDisabled}
				role='option'
				aria-selected={isSelected}
				aria-disabled={isDisabled}
				tabIndex={isDisabled ? -1 : 0}
				onClick={() => {
					if (!isDisabled) {
						onSelect(client);
					}
				}}
				onKeyDown={(event) => handleCardKeyDown(event, client, isDisabled)}
			>
				<Stack gap='sm'>
					<Group justify='space-between' align='flex-start' wrap='nowrap'>
						<Group gap='sm' wrap='nowrap' align='flex-start'>
							<Box className={classes.iconShell}>
								<IconBuilding size={18} stroke={1.6} />
							</Box>
							<Stack gap={2} className={classes.clientMeta}>
								<Text className={classes.clientName} truncate>
									{client.clientName}
								</Text>
								<Text size='xs' className={classes.clientSubtitle} truncate>
									{client.roles.join(' • ')}
								</Text>
							</Stack>
						</Group>

						{isSelected && isMutating ? (
							<Loader size='xs' />
						) : isCurrentClient ? (
							<Tooltip
								label={currentClientTooltip}
								disabled={!currentClientTooltip}
								withArrow
							>
								<Badge
									size='sm'
									variant='light'
									color='gray'
									className={classes.stateBadge}
								>
									{currentClientLabel}
								</Badge>
							</Tooltip>
						) : isSelected ? (
							<Badge
								size='sm'
								variant='light'
								color='blue'
								leftSection={<IconCheck size={12} stroke={2.4} />}
								className={classes.stateBadge}
							>
								{selectedLabel}
							</Badge>
						) : null}
					</Group>
				</Stack>
			</Card>
		);
	};

	return (
		<Stack gap='md'>
			<Stack gap={6} className={classes.hero}>
				<Group justify='space-between' align='flex-start' gap='sm'>
					<Stack gap={4}>
						<Text className={classes.title}>{title}</Text>
						<Text size='sm' className={classes.description}>
							{description}
						</Text>
					</Stack>
					<Badge
						size='md'
						variant='light'
						color='blue'
						className={classes.countBadge}
					>
						{countLabel}
					</Badge>
				</Group>
			</Stack>

			{clients.length > 1 && (
				<TextInput
					value={search}
					onChange={(event) => setSearch(event.currentTarget.value)}
					placeholder={searchPlaceholder}
					leftSection={<IconSearch size={15} stroke={1.8} />}
					size='sm'
					classNames={{
						input: classes.searchInput,
					}}
					autoFocus
				/>
			)}

			{isLoading ? (
				<Group justify='center' py='xl'>
					<Loader size='sm' />
					<Text size='sm' c='dimmed'>
						{loadingLabel}
					</Text>
				</Group>
			) : (
				<ScrollArea
					h={filteredClients.length > 4 ? 428 : 'auto'}
					type='auto'
					offsetScrollbars
				>
					<Box className={classes.gridShell}>
						{filteredClients.length > 0 ? (
							<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='sm' role='listbox'>
								{filteredClients.map(getClientCard)}
							</SimpleGrid>
						) : (
							<EmptyState
								icon={<IconBuilding size={30} />}
								message={emptyTitle}
								description={emptyDescription}
								className={classes.emptyState}
							/>
						)}
					</Box>
				</ScrollArea>
			)}
		</Stack>
	);
}
