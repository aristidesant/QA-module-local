import {
	Badge,
	Box,
	Card,
	Group,
	Loader,
	ScrollArea,
	Skeleton,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { IconBuilding, IconCheck, IconSearch } from '@tabler/icons-react';
import { KeyboardEvent, useMemo, useState } from 'react';
import type { ClientSelectOption } from '~/api/authApi';
import EmptyState from '~/components/EmptyState';
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

	const loadingCards = Array.from({ length: 3 });

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

	const renderClientCard = (client: ClientSelectOption) => {
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
				<Stack gap={4} className={classes.cardContent}>
					<Group
						justify='space-between'
						align='flex-start'
						wrap='nowrap'
						gap='sm'
					>
						<Group
							gap='sm'
							wrap='nowrap'
							align='flex-start'
							className={classes.metaGroup}
						>
							<Box className={classes.iconShell} aria-hidden='true'>
								<IconBuilding size={18} stroke={1.7} />
							</Box>

							<Stack gap={3} className={classes.clientMeta}>
								<Text className={classes.clientName} truncate>
									{client.clientName}
								</Text>

								{client.roles.length > 0 && (
									<Group gap={4} mt={2}>
										{client.roles.map((role) => (
											<Badge
												key={role}
												size='xs'
												variant='light'
												color='gray'
												className={classes.roleBadge}
											>
												{role}
											</Badge>
										))}
									</Group>
								)}
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
								color='green'
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
		<Stack gap='sm'>
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
						color='green'
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
					radius='md'
					classNames={{
						input: classes.searchInput,
					}}
					autoFocus
				/>
			)}

			{isLoading ? (
				<Stack gap='xs'>
					{loadingLabel && (
						<Group gap='xs' align='center' className={classes.loadingLabel}>
							<Loader size='xs' />
							<Text size='sm' c='dimmed'>
								{loadingLabel}
							</Text>
						</Group>
					)}

					<Box className={classes.gridShell}>
						<div className={classes.cardsGrid} aria-hidden='true'>
							{loadingCards.map((_, index) => (
								<Card
									key={index}
									withBorder
									padding='md'
									className={classes.clientCard}
								>
									<Group
										justify='space-between'
										align='flex-start'
										wrap='nowrap'
									>
										<Group gap='sm' wrap='nowrap' align='flex-start'>
											<Skeleton height={36} width={36} radius='md' />
											<Stack gap={6} className={classes.clientMeta}>
												<Skeleton height={14} width='62%' radius='xl' />
												<Skeleton height={10} width='48%' radius='xl' />
												<Skeleton height={10} width='72%' radius='xl' />
											</Stack>
										</Group>
										<Skeleton height={22} width={74} radius='xl' />
									</Group>
								</Card>
							))}
						</div>
					</Box>
				</Stack>
			) : (
				<ScrollArea
					h={filteredClients.length > 4 ? 428 : 'auto'}
					type='auto'
					offsetScrollbars
				>
					<Box className={classes.gridShell}>
						{filteredClients.length > 0 ? (
							<div className={classes.cardsGrid} role='listbox'>
								{filteredClients.map(renderClientCard)}
							</div>
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
