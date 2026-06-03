import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
	Alert,
	Button,
	Group,
	SimpleGrid,
	Stack,
	Text,
	Textarea,
	Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconFileInvoice, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import SectionCard from '~/components/SectionCard';
import BaseTable from '~/components/BaseTable';
import {
	useGetInvoices,
	useIssueInvoice,
	useVoidInvoice,
	useDownloadInvoice,
} from '~/queries/invoiceQueries';
import { useGetAllClients } from '~/queries/clientQueries';
import { usePagination } from '~/hooks/usePagination';
import type { FilterInvoiceDto, InvoiceResponse } from '~/models/InvoiceModel';
import { buildInvoiceWorkspaceStats } from '~/modules/billing/utils';
import InvoiceFilters from '../components/InvoiceFilters';
import InvoiceTemplateManager from '../components/InvoiceTemplateManager';
import { useInvoiceColumns } from '../hooks/useInvoiceColumns';
import classes from './InvoicesPage.module.css';

const InvoicesPage: React.FC = () => {
	const { t } = useTranslation('billing');
	const navigate = useNavigate();
	const pagination = usePagination({ initialItemsPerPage: 20 });
	const { limit, offset } = pagination.getApiParams();
	const [filters, setFilters] = useState<FilterInvoiceDto>({});

	const handleFiltersChange = useCallback(
		(newFilters: FilterInvoiceDto) => {
			setFilters(newFilters);
			pagination.setCurrentPage(1);
		},
		[pagination]
	);

	const {
		data: invoicesData,
		isLoading,
		isError,
		error,
	} = useGetInvoices({
		...filters,
		limit,
		offset,
	});

	const { data: clients = [], isLoading: isClientsLoading } =
		useGetAllClients();
	const issueMutation = useIssueInvoice();
	const voidMutation = useVoidInvoice();
	const downloadMutation = useDownloadInvoice();

	const total = invoicesData?.total ?? 0;
	const pageCount = pagination.calculateTotalPages(total);
	const invoices = invoicesData?.data ?? [];
	const workspaceStats = buildInvoiceWorkspaceStats(invoices);

	const handleView = useCallback(
		(invoice: InvoiceResponse) => {
			void navigate(`/billing/invoices/${invoice.id}`);
		},
		[navigate]
	);

	const handleIssue = useCallback(
		(invoice: InvoiceResponse) => {
			modals.openConfirmModal({
				title: t('detail.actions.issue'),
				centered: true,
				children: <Text size='sm'>{t('detail.actions.issueConfirm')}</Text>,
				labels: {
					confirm: t('detail.actions.issue'),
					cancel: t('actions.cancel', { ns: 'common' }),
				},
				confirmProps: { color: 'green' },
				onConfirm: async () => {
					try {
						const updated = await issueMutation.mutateAsync(invoice.id);
						notifications.show({
							title: t('notifications.issued.title'),
							message: t('notifications.issued.message', {
								number: updated.invoiceNumber,
							}),
							color: 'green',
						});
					} catch {
						notifications.show({
							title: t('notifications.issueFailed.title'),
							message: t('notifications.issueFailed.message'),
							color: 'red',
						});
					}
				},
			});
		},
		[issueMutation, t]
	);

	const handleVoid = useCallback(
		(invoice: InvoiceResponse) => {
			let reason = '';
			modals.openConfirmModal({
				title: t('detail.actions.voidTitle'),
				centered: true,
				closeOnConfirm: false,
				children: (
					<div>
						<Text size='sm' mb='sm'>
							{t('detail.actions.voidDescription')}
						</Text>
						<Textarea
							label={t('detail.actions.voidReasonLabel')}
							placeholder={t('detail.actions.voidReasonPlaceholder')}
							minRows={3}
							onChange={(e) => {
								reason = e.currentTarget.value;
							}}
						/>
					</div>
				),
				labels: {
					confirm: t('detail.actions.voidConfirm'),
					cancel: t('actions.cancel', { ns: 'common' }),
				},
				confirmProps: { color: 'red' },
				onConfirm: async () => {
					if (!reason.trim()) {
						notifications.show({
							title: t('notifications.voidReasonRequired.title'),
							message: t('notifications.voidReasonRequired.message'),
							color: 'red',
						});
						return;
					}
					try {
						const updated = await voidMutation.mutateAsync({
							id: invoice.id,
							dto: { reason },
						});
						modals.closeAll();
						notifications.show({
							title: t('notifications.voided.title'),
							message: t('notifications.voided.message', {
								number: updated.invoiceNumber,
							}),
							color: 'orange',
						});
					} catch {
						notifications.show({
							title: t('notifications.voidFailed.title'),
							message: t('notifications.voidFailed.message'),
							color: 'red',
						});
					}
				},
			});
		},
		[voidMutation, t]
	);

	const handleDownload = useCallback(
		async (invoice: InvoiceResponse) => {
			try {
				await downloadMutation.mutateAsync(invoice.id);
			} catch (err) {
				const status = (err as Error & { status?: number }).status;
				if (status === 422) {
					notifications.show({
						title: t('notifications.downloadFailed.title'),
						message: t('notifications.downloadFailed.invalidTemplate'),
						color: 'red',
					});
				} else if (status === 404) {
					notifications.show({
						title: t('notifications.downloadFailed.title'),
						message: t('notifications.downloadFailed.noTemplate'),
						color: 'red',
					});
				} else {
					notifications.show({
						title: t('notifications.downloadFailed.title'),
						message: t('notifications.downloadFailed.generic'),
						color: 'red',
					});
				}
			}
		},
		[downloadMutation, t]
	);

	const columns = useInvoiceColumns({
		onView: handleView,
		onIssue: handleIssue,
		onVoid: handleVoid,
		onDownload: handleDownload,
	});

	return (
		<ContentContainer>
			<div className={classes.root}>
				<SectionCard padding='lg'>
					<div className={classes.workspaceHeader}>
						<Stack gap={4}>
							<Group gap='xs'>
								<IconFileInvoice size={20} />
								<Title order={3}>{t('page.title')}</Title>
							</Group>
							<Text size='sm' c='dimmed'>
								{t('page.description')}
							</Text>
						</Stack>
						<Button onClick={() => void navigate('/billing/invoices/new')}>
							{t('page.actions.newInvoice')}
						</Button>
					</div>
					<SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing='sm'>
						<div className={classes.metric}>
							<Text size='xs' c='dimmed'>
								{t('page.summary.loaded')}
							</Text>
							<Text fw={750}>{workspaceStats.loadedCount}</Text>
						</div>
						<div className={classes.metric}>
							<Text size='xs' c='dimmed'>
								{t('page.summary.draft')}
							</Text>
							<Text fw={750}>{workspaceStats.draftCount}</Text>
						</div>
						<div className={classes.metric}>
							<Text size='xs' c='dimmed'>
								{t('page.summary.issued')}
							</Text>
							<Text fw={750}>{workspaceStats.issuedCount}</Text>
						</div>
						<div className={classes.metric}>
							<Text size='xs' c='dimmed'>
								{t('page.summary.voided')}
							</Text>
							<Text fw={750}>{workspaceStats.voidedCount}</Text>
						</div>
						<div className={classes.metric}>
							<Text size='xs' c='dimmed'>
								{t('page.summary.visibleValue')}
							</Text>
							<Text fw={750}>{workspaceStats.visibleTotalFormatted}</Text>
						</div>
					</SimpleGrid>
				</SectionCard>

				<SectionCard padding='md'>
					<InvoiceFilters
						filters={filters}
						clients={clients}
						isLoading={isClientsLoading && clients.length === 0}
						onChange={handleFiltersChange}
					/>
				</SectionCard>

				<InvoiceTemplateManager />

				<SectionCard
					title={t('page.title')}
					description={t('page.description')}
				>
					{isError && (
						<Alert
							icon={<IconInfoCircle size={18} />}
							color='red'
							title={t('list.error.title')}
						>
							{error instanceof Error ? error.message : t('list.error.unknown')}
						</Alert>
					)}
					{!isError && (
						<BaseTable<InvoiceResponse>
							data={invoices}
							columns={columns}
							isLoading={isLoading}
							emptyMessage={t('list.emptyTitle')}
							onRowClick={handleView}
							getRowClassName={() => classes.tableRow}
							filterMode='server'
							pageIndex={pagination.currentPage - 1}
							pageSize={pagination.itemsPerPage}
							pageCount={pageCount}
							onPaginationChange={(pageIndex, pageSize) => {
								pagination.setCurrentPage(pageIndex + 1);
								pagination.setItemsPerPage(pageSize);
							}}
							showPaginationControls={pageCount > 1}
							enablePagination={true}
						/>
					)}
				</SectionCard>
			</div>
		</ContentContainer>
	);
};

export default InvoicesPage;
