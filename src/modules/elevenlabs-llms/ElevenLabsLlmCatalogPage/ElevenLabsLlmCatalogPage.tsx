import { useMemo, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import {
	Alert,
	Badge,
	Button,
	Center,
	Group,
	Select,
	Stack,
	Switch,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import {
	IconAlertCircle,
	IconDatabaseOff,
	IconRefresh,
	IconSearch,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import {
	useElevenLabsLlms,
	useSyncElevenLabsLlms,
	useUpdateElevenLabsLlmStatus,
} from '~/queries/elevenLabsLlmQueries';
import type {
	ElevenLabsLlm,
	ElevenLabsLlmStatus,
} from '~/models/ElevenLabsLlmModel';
import classes from './ElevenLabsLlmCatalogPage.module.css';

const formatLimit = (value: number | null) =>
	value === null ? '—' : new Intl.NumberFormat().format(value);

const formatDate = (value: string | null) =>
	value
		? new Intl.DateTimeFormat(undefined, {
				dateStyle: 'medium',
				timeStyle: 'short',
			}).format(new Date(value))
		: '—';

const getCapabilityLabels = (llm: ElevenLabsLlm, t: (key: string) => string) =>
	[
		llm.supportsImageInput ? t('capabilities.image') : null,
		llm.supportsDocumentInput ? t('capabilities.document') : null,
		llm.supportsParallelToolCalls ? t('capabilities.parallelTools') : null,
	].filter((label): label is string => Boolean(label));

const ElevenLabsLlmCatalogPage = () => {
	const { t } = useTranslation('elevenlabs-llms');
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<ElevenLabsLlmStatus | null>(null);
	const [debouncedSearch] = useDebouncedValue(search, 250);
	const syncMutation = useSyncElevenLabsLlms();
	const statusMutation = useUpdateElevenLabsLlmStatus();
	const filters = useMemo(
		() => ({
			status: status ?? undefined,
			search: debouncedSearch.trim() || undefined,
		}),
		[debouncedSearch, status]
	);
	const {
		data: llms = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useElevenLabsLlms(filters);

	const handleSync = async () => {
		try {
			const result = await syncMutation.mutateAsync();
			notifications.show({
				title: t('notifications.syncSuccess.title'),
				message: t('notifications.syncSuccess.message', {
					providerModelCount: result.providerModelCount,
					insertedCount: result.insertedCount,
					updatedCount: result.updatedCount,
					activatedCount: result.activatedCount,
					deactivatedCount: result.deactivatedCount,
				}),
				color: 'green',
			});
		} catch {
			notifications.show({
				title: t('notifications.syncError.title'),
				message: t('notifications.syncError.message'),
				color: 'red',
			});
		}
	};

	const handleStatusChange = async (llm: ElevenLabsLlm) => {
		const nextStatus: ElevenLabsLlmStatus =
			llm.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

		try {
			await statusMutation.mutateAsync({
				llm: llm.llm,
				payload: { status: nextStatus },
			});
			notifications.show({
				title: t('notifications.statusSuccess.title'),
				message: t('notifications.statusSuccess.message', {
					llm: llm.llm,
					status: t(`status.${nextStatus.toLowerCase()}`),
				}),
				color: nextStatus === 'ACTIVE' ? 'green' : 'orange',
			});
		} catch {
			notifications.show({
				title: t('notifications.statusError.title'),
				message: t('notifications.statusError.message', { llm: llm.llm }),
				color: 'red',
			});
		}
	};

	const columns = useMemo<BaseTableColumnDef<ElevenLabsLlm>[]>(
		() => [
			{
				accessorKey: 'llm',
				header: t('columns.model'),
				cell: ({ row }) => (
					<Stack gap={2}>
						<Text className={classes.modelName} fw={600}>
							{row.original.llm}
						</Text>
						{row.original.isCheckpoint && (
							<Badge size='xs' variant='light' color='blue' w='fit-content'>
								{t('badges.checkpoint')}
							</Badge>
						)}
					</Stack>
				),
			},
			{
				accessorKey: 'status',
				header: t('columns.status'),
				cell: ({ row }) => (
					<Stack gap={4} align='flex-start'>
						<Badge
							variant='light'
							color={row.original.status === 'ACTIVE' ? 'green' : 'gray'}
						>
							{t(`status.${row.original.status.toLowerCase()}`)}
						</Badge>
						{row.original.isManuallyDisabled && (
							<Text size='xs' c='orange'>
								{t('badges.manuallyDisabled')}
							</Text>
						)}
					</Stack>
				),
			},
			{
				id: 'limits',
				header: t('columns.limits'),
				cell: ({ row }) => (
					<Stack gap={2}>
						<Text size='sm'>
							{t('limits.tokens', {
								value: formatLimit(row.original.maxTokensLimit),
							})}
						</Text>
						<Text size='xs' c='dimmed'>
							{t('limits.context', {
								value: formatLimit(row.original.maxContextLimit),
							})}
						</Text>
					</Stack>
				),
			},
			{
				id: 'capabilities',
				header: t('columns.capabilities'),
				cell: ({ row }) => (
					<Group gap={4} wrap='wrap' maw={260}>
						{getCapabilityLabels(row.original, (key) => t(key)).map((label) => (
							<Badge key={label} size='xs' variant='light' color='blue'>
								{label}
							</Badge>
						))}
						{getCapabilityLabels(row.original, (key) => t(key)).length ===
							0 && (
							<Text size='xs' c='dimmed'>
								{t('capabilities.none')}
							</Text>
						)}
					</Group>
				),
			},
			{
				id: 'deprecation',
				header: t('columns.deprecation'),
				cell: ({ row }) => {
					const info = row.original.deprecationInfo;
					if (!info || !info.isDeprecated) {
						return (
							<Badge size='sm' variant='light' color='green'>
								{t('deprecation.current')}
							</Badge>
						);
					}
					return (
						<Badge size='sm' variant='light' color='orange'>
							{t('deprecation.deprecated')}
						</Badge>
					);
				},
			},
			{
				id: 'lastSyncedAt',
				header: t('columns.lastSynced'),
				cell: ({ row }) => (
					<Text size='sm' c='dimmed' className={classes.dateText}>
						{formatDate(row.original.lastSyncedAt)}
					</Text>
				),
			},
			{
				id: 'actions',
				header: t('columns.actions'),
				cell: ({ row }) => {
					const isUpdating =
						statusMutation.isPending &&
						statusMutation.variables?.llm === row.original.llm;
					return (
						<Tooltip
							label={
								row.original.status === 'ACTIVE'
									? t('actions.disable')
									: t('actions.enable')
							}
						>
							<Switch
								aria-label={t('actions.toggle', { llm: row.original.llm })}
								checked={row.original.status === 'ACTIVE'}
								disabled={isUpdating}
								onChange={() => void handleStatusChange(row.original)}
							/>
						</Tooltip>
					);
				},
			},
		],
		[handleStatusChange, statusMutation.isPending, statusMutation.variables, t]
	);

	const renderExpandedRow = (llm: ElevenLabsLlm) => {
		const deprecation = llm.deprecationInfo;
		const reasoningEfforts = llm.availableReasoningEfforts ?? [];
		return (
			<div className={classes.expandedRow}>
				<div>
					<Text size='xs' fw={700} c='dimmed'>
						{t('details.reasoningEfforts')}
					</Text>
					<Text size='sm'>
						{reasoningEfforts.length > 0
							? reasoningEfforts.join(', ')
							: t('details.none')}
					</Text>
				</div>
				<div>
					<Text size='xs' fw={700} c='dimmed'>
						{t('details.lastSeen')}
					</Text>
					<Text size='sm'>{formatDate(llm.lastSeenAt)}</Text>
				</div>
				<div>
					<Text size='xs' fw={700} c='dimmed'>
						{t('details.surcharge')}
					</Text>
					<Text size='sm'>
						{llm.regionalProcessingSurcharge
							? `×${llm.regionalProcessingSurcharge.multiplier}`
							: t('details.none')}
					</Text>
				</div>
				<div>
					<Text size='xs' fw={700} c='dimmed'>
						{t('details.deprecation')}
					</Text>
					<Text size='sm'>
						{deprecation?.replacementModel
							? t('details.replacement', {
									model: deprecation.replacementModel,
								})
							: deprecation?.isInWarningPeriod
								? t('details.warningPeriod')
								: deprecation?.isInFallbackPeriod
									? t('details.fallbackPeriod', {
											percentage: deprecation.fallbackPercentage,
										})
									: t('details.none')}
					</Text>
				</div>
			</div>
		);
	};

	const hasFilters = Boolean(search.trim() || status);

	return (
		<ContentContainer
			title={t('page.title')}
			description={t('page.description')}
			mainScroll={false}
			titleRight={
				<Button
					leftSection={<IconRefresh size={16} />}
					loading={syncMutation.isPending}
					onClick={() => void handleSync()}
				>
					{t('actions.sync')}
				</Button>
			}
		>
			<SectionCard
				padding='lg'
				className={classes.catalogCard}
				shellClassName={classes.catalogCardShell}
				bodyClassName={classes.catalogCardBody}
				contentClassName={classes.catalogCardContent}
			>
				<div className={classes.filters}>
					<TextInput
						className={classes.searchInput}
						label={t('filters.search.label')}
						placeholder={t('filters.search.placeholder')}
						leftSection={<IconSearch size={16} />}
						value={search}
						onChange={(event) => setSearch(event.currentTarget.value)}
					/>
					<Select
						className={classes.statusFilter}
						label={t('filters.status.label')}
						placeholder={t('filters.status.placeholder')}
						data={[
							{ value: 'ALL', label: t('filters.status.all') },
							{ value: 'ACTIVE', label: t('status.active') },
							{ value: 'INACTIVE', label: t('status.inactive') },
						]}
						value={status ?? 'ALL'}
						onChange={(value) =>
							setStatus(
								value === 'ACTIVE' || value === 'INACTIVE' ? value : null
							)
						}
					/>
				</div>

				{isError ? (
					<div className={`${classes.stateViewport} ${classes.errorState}`}>
						<Alert
							color='red'
							icon={<IconAlertCircle size={18} />}
							title={t('state.errorTitle')}
						>
							<Stack gap='sm'>
								<Text size='sm'>
									{error instanceof Error
										? error.message
										: t('state.errorDescription')}
								</Text>
								<Group>
									<Button
										variant='light'
										color='red'
										leftSection={<IconRefresh size={16} />}
										onClick={() => void refetch()}
									>
										{t('actions.retry')}
									</Button>
								</Group>
							</Stack>
						</Alert>
					</div>
				) : !isLoading && llms.length === 0 ? (
					<div className={classes.stateViewport}>
						<Center>
							<Stack align='center' gap='xs' maw={440}>
								<IconDatabaseOff
									size={48}
									stroke={1.5}
									className={classes.emptyIcon}
								/>
								<Text fw={600} ta='center'>
									{hasFilters ? t('empty.filteredTitle') : t('empty.title')}
								</Text>
								<Text size='sm' c='dimmed' ta='center'>
									{hasFilters
										? t('empty.filteredDescription')
										: t('empty.description')}
								</Text>
								{!hasFilters && (
									<Button
										variant='light'
										leftSection={<IconRefresh size={16} />}
										onClick={() => void handleSync()}
										loading={syncMutation.isPending}
									>
										{t('actions.sync')}
									</Button>
								)}
							</Stack>
						</Center>
					</div>
				) : (
					<div className={classes.tableViewport}>
						<BaseTable
							className={classes.catalogTable}
							rootProps={{
								tabIndex: 0,
								'aria-label': t('table.ariaLabel'),
							}}
							data={llms}
							columns={columns}
							getRowId={(row) => row.llm}
							isLoading={isLoading}
							emptyMessage={t('empty.filteredTitle')}
							enableExpanding
							renderExpandedRow={renderExpandedRow}
						/>
					</div>
				)}
			</SectionCard>
		</ContentContainer>
	);
};

export default ElevenLabsLlmCatalogPage;
