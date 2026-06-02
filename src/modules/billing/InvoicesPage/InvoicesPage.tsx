import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Center, Loader, Text, Textarea } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import SectionCard from '~/components/SectionCard';
import BaseTable from '~/components/BaseTable';
import {
	useGetInvoices,
	useIssueInvoice,
	useVoidInvoice,
	useDownloadDocx,
} from '~/queries/invoiceQueries';
import { useGetAllClients } from '~/queries/clientQueries';
import { usePagination } from '~/hooks/usePagination';
import type { FilterInvoiceDto, InvoiceResponse } from '~/models/InvoiceModel';
import InvoiceFilters from '../components/InvoiceFilters';
import { useInvoiceColumns } from '../hooks/useInvoiceColumns';
import classes from './InvoicesPage.module.css';

const InvoicesPage: React.FC = () => {
	const { t } = useTranslation('billing');
	const navigate = useNavigate();
	const pagination = usePagination({ initialItemsPerPage: 20 });
	const { limit, offset } = pagination.getApiParams();
	const [filters, setFilters] = useState<FilterInvoiceDto>({});

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

	const { data: clients = [] } = useGetAllClients();
	const issueMutation = useIssueInvoice();
	const voidMutation = useVoidInvoice();
	const downloadMutation = useDownloadDocx();

	const total = invoicesData?.total ?? 0;
	const pageCount = pagination.calculateTotalPages(total);
	const invoices = invoicesData?.data ?? [];

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
							title: 'Error',
							message: 'Failed to issue invoice.',
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
							title: 'Error',
							message: 'Reason is required.',
							color: 'red',
						});
						return;
					}
					try {
						const updated = await voidMutation.mutateAsync({
							id: invoice.id,
							dto: { reason },
						});
						notifications.show({
							title: t('notifications.voided.title'),
							message: t('notifications.voided.message', {
								number: updated.invoiceNumber,
							}),
							color: 'orange',
						});
					} catch {
						notifications.show({
							title: 'Error',
							message: 'Failed to void invoice.',
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
						title: 'Error',
						message: t('notifications.downloadFailed.invalidTemplate'),
						color: 'red',
					});
				} else if (status === 404) {
					notifications.show({
						title: 'Error',
						message: t('notifications.downloadFailed.noTemplate'),
						color: 'red',
					});
				} else {
					notifications.show({
						title: 'Error',
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
				<SectionCard>
					<InvoiceFilters
						filters={filters}
						clients={clients}
						onChange={setFilters}
					/>
				</SectionCard>

				<SectionCard
					title={t('page.title')}
					description={t('page.description')}
					onAdd={() => void navigate('/billing/invoices/new')}
				>
					{isLoading && (
						<Center>
							<Loader size='sm' />
						</Center>
					)}
					{isError && (
						<Alert
							icon={<IconInfoCircle size={18} />}
							color='red'
							title={t('list.error.title')}
						>
							{error instanceof Error ? error.message : 'Unknown error'}
						</Alert>
					)}
					{!isLoading && !isError && invoices.length === 0 && (
						<Center>
							<Text size='sm' c='dimmed'>
								{t('list.empty')}
							</Text>
						</Center>
					)}
					{!isLoading && !isError && invoices.length > 0 && (
						<BaseTable<InvoiceResponse>
							data={invoices}
							columns={columns}
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
