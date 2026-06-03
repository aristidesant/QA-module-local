import { useMemo } from 'react';
import { ActionIcon, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconEye, IconCheck, IconBan, IconDownload } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { InvoiceResponse } from '~/models/InvoiceModel';
import {
	formatInvoiceDate,
	formatInvoicePeriod,
	getInvoiceTotalDisplay,
} from '~/modules/billing/utils';
import InvoiceStatusBadge from '../components/InvoiceStatusBadge';

interface UseInvoiceColumnsOptions {
	onView: (invoice: InvoiceResponse) => void;
	onIssue: (invoice: InvoiceResponse) => void;
	onVoid: (invoice: InvoiceResponse) => void;
	onDownload: (invoice: InvoiceResponse) => void;
}

export function useInvoiceColumns({
	onView,
	onIssue,
	onVoid,
	onDownload,
}: UseInvoiceColumnsOptions): BaseTableColumnDef<InvoiceResponse>[] {
	const { t } = useTranslation('billing');

	return useMemo(
		() => [
			{
				accessorKey: 'invoiceNumber',
				header: t('list.columns.invoiceNumber'),
				cell: ({ row }) => (
					<Stack gap={2}>
						<Text size='sm' fw={650}>
							{row.original.invoiceNumber}
						</Text>
						<InvoiceStatusBadge status={row.original.status} />
					</Stack>
				),
			},
			{
				id: 'issuer',
				header: t('list.columns.issuer'),
				cell: ({ row }) => (
					<Text size='sm' fw={500}>
						{row.original.snapshot?.issuer?.name ??
							String(row.original.issuerClientId)}
					</Text>
				),
			},
			{
				id: 'receiver',
				header: t('list.columns.receiver'),
				cell: ({ row }) => (
					<Text size='sm'>
						{row.original.snapshot?.receiver?.name ??
							String(row.original.receiverClientId)}
					</Text>
				),
			},
			{
				id: 'period',
				header: t('list.columns.period'),
				cell: ({ row }) =>
					formatInvoicePeriod(row.original.periodStart, row.original.periodEnd),
			},
			{
				accessorKey: 'status',
				header: t('list.columns.status'),
				cell: ({ getValue }) => (
					<InvoiceStatusBadge status={getValue<InvoiceResponse['status']>()} />
				),
			},
			{
				accessorKey: 'currency',
				header: t('list.columns.currency'),
				cell: ({ getValue }) => getValue<string>(),
			},
			{
				id: 'total',
				header: t('list.columns.total'),
				cell: ({ row }) => (
					<Text size='sm' fw={700} ta='right'>
						{getInvoiceTotalDisplay(row.original)}
					</Text>
				),
			},
			{
				id: 'createdAt',
				header: t('list.columns.createdAt'),
				cell: ({ row }) => formatInvoiceDate(row.original.createdAt),
			},
			{
				id: 'actions',
				header: t('list.columns.actions'),
				cell: ({ row }) => {
					const invoice = row.original;
					return (
						<Group gap='xs' wrap='nowrap'>
							<Tooltip label={t('list.actions.view')}>
								<ActionIcon
									variant='subtle'
									size='sm'
									onClick={(e) => {
										e.stopPropagation();
										onView(invoice);
									}}
								>
									<IconEye size={16} />
								</ActionIcon>
							</Tooltip>
							{invoice.status === 'DRAFT' && (
								<Tooltip label={t('list.actions.issue')}>
									<ActionIcon
										variant='subtle'
										color='green'
										size='sm'
										onClick={(e) => {
											e.stopPropagation();
											onIssue(invoice);
										}}
									>
										<IconCheck size={16} />
									</ActionIcon>
								</Tooltip>
							)}
							{invoice.status !== 'VOIDED' && (
								<Tooltip label={t('list.actions.void')}>
									<ActionIcon
										variant='subtle'
										color='red'
										size='sm'
										onClick={(e) => {
											e.stopPropagation();
											onVoid(invoice);
										}}
									>
										<IconBan size={16} />
									</ActionIcon>
								</Tooltip>
							)}
							<Tooltip label={t('list.actions.download')}>
								<ActionIcon
									variant='subtle'
									size='sm'
									onClick={(e) => {
										e.stopPropagation();
										onDownload(invoice);
									}}
								>
									<IconDownload size={16} />
								</ActionIcon>
							</Tooltip>
						</Group>
					);
				},
			},
		],
		[t, onView, onIssue, onVoid, onDownload]
	);
}
