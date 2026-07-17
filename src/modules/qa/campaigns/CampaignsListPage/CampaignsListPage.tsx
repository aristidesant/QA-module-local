import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Group,
	Select,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import {
	IconAlertTriangle,
	IconChevronRight,
	IconEdit,
	IconPlus,
	IconSearch,
	IconSpeakerphone,
	IconTrash,
} from '@tabler/icons-react';
import type { SortingState } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router';

import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PaginationControls from '~/components/PaginationControls';
import SectionCard from '~/components/SectionCard';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { getCampaignStatusColor } from '~/modules/qa/constants/badgeColors';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import { useListPageState } from '~/modules/qa/hooks/useListPageState';
import type {
	Campaign,
	CampaignListQueryParams,
	CampaignStatus,
} from '~/models/qa';
import {
	campaignsQueryKey,
	useCampaignsQuery,
	useCreateCampaignMutation,
	useDeleteCampaignMutation,
	useUpdateCampaignMutation,
} from '~/queries/qa/campaignsQueries';
import { queryClient } from '~/queries/queryClient';
import { getErrorMessage } from '~/utils/httpClient';
import { notifyError, notifySuccess } from '~/modules/qa/utils/notifications';
import CampaignFormModal from '~/modules/qa/campaigns/components/CampaignFormModal';
import { buildCampaignPayload } from '../campaigns.helpers';
import type { CampaignFormValues } from '../campaigns.types';
import classes from './CampaignsListPage.module.css';

export default function CampaignsListPage() {
	const { t } = useTranslation('qa.campaigns');
	const navigate = useNavigate();
	const {
		page,
		setPage,
		setPageSize,
		limit,
		offset,
		search,
		setSearch,
		debouncedSearch,
		sort,
		setSort,
		resetPage,
		getTotalPages,
	} = useListPageState();
	const [statusFilter, setStatusFilter] = useState<'ALL' | CampaignStatus>(
		'ALL'
	);
	const [createOpen, setCreateOpen] = useState(false);
	const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
	const campaignsQuery = useCampaignsQuery({
		pagination: true,
		limit,
		offset,
		q: debouncedSearch.trim() || undefined,
		status: statusFilter === 'ALL' ? undefined : statusFilter,
		sortBy: sort.field as CampaignListQueryParams['sortBy'],
		orderBy: sort.order,
	});
	const createCampaignMutation = useCreateCampaignMutation();
	const updateCampaignMutation = useUpdateCampaignMutation(
		editingCampaign?.id ?? NaN
	);
	const deleteCampaignMutation = useDeleteCampaignMutation();
	const campaignForm = useForm<CampaignFormValues>({
		initialValues: {
			name: '',
			description: '',
			status: 'ACTIVE',
			source: '',
		},
		validate: {
			name: (value) =>
				value.trim().length === 0 ? t('validation.nameRequired') : null,
		},
	});
	const campaigns = campaignsQuery.data?.data ?? [];
	const total = campaignsQuery.data?.total ?? 0;
	const totalPages = getTotalPages(total);
	const dateFormatter = useDateFormatter('date');

	const closeCampaignModal = () => {
		campaignForm.reset();
		setCreateOpen(false);
		setEditingCampaign(null);
	};

	const openCreateModal = () => {
		campaignForm.setValues({
			name: '',
			description: '',
			status: 'ACTIVE',
			source: '',
		});
		campaignForm.clearErrors();
		setEditingCampaign(null);
		setCreateOpen(true);
	};

	const openEditModal = (campaign: Campaign) => {
		campaignForm.setValues({
			name: campaign.name,
			description: campaign.description ?? '',
			status: campaign.status,
			source: campaign.source ?? '',
		});
		campaignForm.clearErrors();
		setCreateOpen(false);
		setEditingCampaign(campaign);
	};

	const submitCampaign = campaignForm.onSubmit(async (values) => {
		const payload = buildCampaignPayload(values);

		try {
			if (editingCampaign) {
				await updateCampaignMutation.mutateAsync(payload);
				notifySuccess(t('notifications.campaignUpdated'));
			} else {
				const createdCampaign =
					await createCampaignMutation.mutateAsync(payload);
				notifySuccess(t('notifications.campaignCreated'));
				navigate(`/qa/campaigns/${createdCampaign.id}`);
			}

			await queryClient.invalidateQueries({ queryKey: campaignsQueryKey });
			closeCampaignModal();
		} catch (error) {
			notifyError(error);
		}
	});

	const confirmDelete = (campaign: Campaign) => {
		modals.openConfirmModal({
			title: t('delete.title'),
			centered: true,
			labels: {
				confirm: t('delete.actions.confirm'),
				cancel: t('delete.actions.cancel'),
			},
			confirmProps: { color: 'red' },
			children: (
				<Text size='sm'>
					{t('delete.description', {
						name: campaign.name ?? t('delete.fallbackName'),
					})}
				</Text>
			),
			onConfirm: async () => {
				try {
					await deleteCampaignMutation.mutateAsync(campaign.id);
					await queryClient.invalidateQueries({ queryKey: campaignsQueryKey });
					notifySuccess(t('notifications.campaignDeleted'));
				} catch (error) {
					notifyError(error);
				}
			},
		});
	};

	const handleSortingChange = (sorting: SortingState) => {
		const first = sorting[0];
		if (first) {
			setSort({ field: first.id, order: first.desc ? 'DESC' : 'ASC' });
		}
	};

	const columns: BaseTableColumnDef<Campaign>[] = [
		{
			accessorKey: 'name',
			header: t('list.table.name'),
			cell: ({ row }) => (
				<Stack gap={2}>
					<Text fw={700} size='sm'>
						{row.original.name}
					</Text>
					<Text c='dimmed' size='xs'>
						{row.original.description || t('list.table.noDescription')}
					</Text>
				</Stack>
			),
		},
		{
			accessorKey: 'status',
			header: t('list.table.status'),
			cell: ({ row }) => (
				<Badge
					color={getCampaignStatusColor(row.original.status)}
					variant='light'
				>
					{t(`status.${row.original.status.toLowerCase()}`)}
				</Badge>
			),
		},
		{
			accessorKey: 'createdAt',
			header: t('list.table.createdAt'),
			cell: ({ row }) => (
				<Text c='dimmed' size='sm'>
					{row.original.createdAt
						? dateFormatter.format(new Date(row.original.createdAt))
						: t('list.table.noDate')}
				</Text>
			),
		},
		{
			id: 'actions',
			header: t('list.table.actions'),
			enableSorting: false,
			cell: ({ row }) => (
				<Group
					className={classes.actions}
					gap='xs'
					justify='flex-end'
					wrap='nowrap'
				>
					<Tooltip label={t('list.actions.open')}>
						<ActionIcon
							aria-label={t('list.actions.open')}
							component={RouterLink}
							radius='md'
							to={`/qa/campaigns/${row.original.id}`}
							variant='light'
						>
							<IconChevronRight size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={t('list.actions.edit')}>
						<ActionIcon
							aria-label={t('list.actions.edit')}
							onClick={() => openEditModal(row.original)}
							radius='md'
							variant='light'
						>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={t('list.actions.delete')}>
						<ActionIcon
							aria-label={t('list.actions.delete')}
							color='red'
							onClick={() => confirmDelete(row.original)}
							radius='md'
							variant='subtle'
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			),
		},
	];

	return (
		<>
			<CampaignFormModal
				form={campaignForm}
				onClose={closeCampaignModal}
				onSubmit={submitCampaign}
				opened={createOpen || Boolean(editingCampaign)}
				saving={
					createCampaignMutation.isPending || updateCampaignMutation.isPending
				}
				submitIcon={<IconPlus size={16} />}
				submitLabel={
					editingCampaign
						? t('campaignForm.actions.update')
						: t('campaignForm.actions.create')
				}
				title={
					editingCampaign
						? t('campaignForm.editTitle')
						: t('campaignForm.title')
				}
			/>

			<ContentContainer
				contentWidth='full'
				description={t('list.description')}
				title={t('list.title')}
				titleRight={
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={openCreateModal}
						size='sm'
					>
						{t('list.actions.create')}
					</Button>
				}
			>
				<Stack gap='md'>
					<SectionCard>
						<Stack gap='sm'>
							<Group className={classes.toolbar} justify='space-between'>
								<Group gap='xs'>
									<TextInput
										leftSection={<IconSearch size={16} />}
										onChange={(event) => setSearch(event.currentTarget.value)}
										placeholder={t('list.filters.searchPlaceholder')}
										size='sm'
										value={search}
									/>
									<Select
										allowDeselect={false}
										data={[
											{ label: t('list.filters.allStatuses'), value: 'ALL' },
											{ label: t('status.active'), value: 'ACTIVE' },
											{ label: t('status.inactive'), value: 'INACTIVE' },
										]}
										onChange={(value) => {
											setStatusFilter(
												(value ?? 'ALL') as 'ALL' | CampaignStatus
											);
											resetPage();
										}}
										size='sm'
										value={statusFilter}
									/>
								</Group>
								<Text c='dimmed' size='sm'>
									{t('list.filters.count', { count: total })}
								</Text>
							</Group>

							{campaignsQuery.isError ? (
								<Alert
									color='red'
									icon={<IconAlertTriangle size={16} />}
									title={t('states.errorTitle')}
									variant='light'
								>
									{getErrorMessage(campaignsQuery.error)}
								</Alert>
							) : (
								<>
									{!campaignsQuery.isLoading && campaigns.length === 0 ? (
										<EmptyState
											action={
												<Button
													leftSection={<IconPlus size={16} />}
													onClick={openCreateModal}
													size='sm'
													variant='light'
												>
													{t('list.actions.create')}
												</Button>
											}
											description={t('list.empty.description')}
											icon={<IconSpeakerphone size={32} />}
											message={t('list.empty.title')}
										/>
									) : (
										<>
											<BaseTable<Campaign>
												columns={columns}
												data={campaigns}
												filterMode='server'
												getRowId={(campaign) => String(campaign.id)}
												initialSort={[
													{ id: sort.field, desc: sort.order === 'DESC' },
												]}
												isLoading={campaignsQuery.isLoading}
												onSortingChange={handleSortingChange}
												skeletonRowsCount={Math.min(limit, 10)}
											/>
											{!campaignsQuery.isLoading && total > 0 ? (
												<PaginationControls
													currentPage={page}
													itemsPerPage={limit}
													onItemsPerPageChange={(value) => {
														if (value) {
															setPageSize(value);
														}
													}}
													onPageChange={setPage}
													totalItems={total}
													totalPages={totalPages}
												/>
											) : null}
										</>
									)}
								</>
							)}
						</Stack>
					</SectionCard>
				</Stack>
			</ContentContainer>
		</>
	);
}
