import {
	Badge,
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
import { generateClientAvatar } from '~/utils/clientAvatar';
import {
	getClientDisplayLabel,
	getClientSecondaryLabel,
} from '~/utils/clientDisplay';
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

const COMPACT_THRESHOLD = 5;

type ViewMode = 'spacious' | 'compact';

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

	const viewMode: ViewMode = useMemo(() => {
		return clients.length >= COMPACT_THRESHOLD ? 'compact' : 'spacious';
	}, [clients.length]);

	const filteredClients = useMemo(() => {
		if (!search.trim()) return clients;

		const query = search.toLowerCase();
		return clients.filter(
			(client) =>
				getClientDisplayLabel({
					name: client.clientName,
					alias: client.clientAlias,
				})
					.toLowerCase()
					.includes(query) ||
				client.clientName.toLowerCase().includes(query) ||
				client.clientAlias?.toLowerCase().includes(query) ||
				client.clientIdentifier.toLowerCase().includes(query)
		);
	}, [clients, search]);

	const loadingCards = Array.from({
		length: viewMode === 'spacious' ? 3 : 6,
	});

	const showSearch = viewMode === 'compact' || clients.length > 1;

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

	const renderAvatarItem = (client: ClientSelectOption) => {
		const isSelected = selectedClientId === client.clientId;
		const isCurrentClient = currentClientId === client.clientId;
		const isDisabled = isMutating || isCurrentClient;
		const clientLabel = getClientDisplayLabel({
			name: client.clientName,
			alias: client.clientAlias,
		});
		const secondaryLabel = getClientSecondaryLabel({
			name: client.clientName,
			alias: client.clientAlias,
		});
		const avatar = generateClientAvatar(clientLabel);
		const statusBadge =
			isSelected && isMutating ? (
				<Loader size='xs' />
			) : isCurrentClient ? (
				<Tooltip
					label={currentClientTooltip}
					disabled={!currentClientTooltip}
					withArrow
				>
					<Badge
						size='xs'
						variant='light'
						color='gray'
						className={classes.stateBadge}
					>
						{currentClientLabel}
					</Badge>
				</Tooltip>
			) : isSelected ? (
				<Badge
					size='xs'
					variant='light'
					color='green'
					leftSection={<IconCheck size={11} stroke={2.4} />}
					className={classes.stateBadge}
				>
					{selectedLabel}
				</Badge>
			) : null;

		return (
			<div
				key={client.clientId}
				className={classes.avatarItem}
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
				<div
					className={classes.avatarCircle}
					// inline-style-allow: gradient is a dynamic per-avatar value with no CSS-variable alternative
					style={{ background: avatar.gradient }}
					aria-hidden='true'
				>
					<span className={classes.avatarInitials}>{avatar.initials}</span>
				</div>

				<div className={classes.avatarMeta}>
					<Text className={classes.clientName} truncate='end'>
						{clientLabel}
					</Text>
					{secondaryLabel && (
						<Text size='xs' className={classes.clientSecondary} truncate='end'>
							{secondaryLabel}
						</Text>
					)}
					{(statusBadge ||
						(viewMode === 'spacious' && client.roles.length > 0)) && (
						<Group
							gap={4}
							mt={6}
							justify='center'
							className={classes.metaFooter}
						>
							{viewMode === 'spacious' &&
								client.roles.map((role) => (
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
							{statusBadge}
						</Group>
					)}
				</div>
			</div>
		);
	};

	const renderLoadingSkeleton = () => {
		const avatarSize = viewMode === 'spacious' ? 72 : 48;

		return (
			<div className={classes.avatarGrid}>
				{loadingCards.map((_, index) => (
					<div key={index} className={classes.avatarItem} aria-hidden='true'>
						<Skeleton height={avatarSize} width={avatarSize} radius='50%' />
						<Stack gap={4} align='center' mt={8}>
							<Skeleton height={12} width='70%' radius='xl' />
							<Skeleton height={8} width='50%' radius='xl' />
						</Stack>
					</div>
				))}
			</div>
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

			{showSearch && (
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
					{renderLoadingSkeleton()}
				</Stack>
			) : (
				<ScrollArea
					h={
						filteredClients.length > (viewMode === 'spacious' ? 4 : 8)
							? 428
							: 'auto'
					}
					type='auto'
					offsetScrollbars
				>
					{filteredClients.length > 0 ? (
						<div
							className={classes.avatarGrid}
							role='listbox'
							data-mode={viewMode}
						>
							{filteredClients.map(renderAvatarItem)}
						</div>
					) : (
						<EmptyState
							icon={<IconBuilding size={30} />}
							message={emptyTitle}
							description={emptyDescription}
							className={classes.emptyState}
						/>
					)}
				</ScrollArea>
			)}
		</Stack>
	);
}
