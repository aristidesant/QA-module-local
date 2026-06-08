import { useMemo } from 'react';
import { ActionIcon, Menu, Stack, Text, Tooltip } from '@mantine/core';
import {
	IconDotsVertical,
	IconEye,
	IconCheck,
	IconBan,
	IconDownload,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { timeAgo } from '~/utils/dateUtils';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { InvoiceResponse } from '~/models/InvoiceModel';
import {
	formatInvoicePeriod,
	getInvoiceTotalDisplay,
} from '~/modules/billing/utils';
import InvoiceStatusBadge from '../components/InvoiceStatusBadge';
import classes from '../InvoicesPage/InvoicesPage.module.css';

interface UseInvoiceColumnsOptions {
	onView: (invoice: InvoiceResponse) => void;
	onIssue: (invoice: InvoiceResponse) => void;
	onVoid: (invoice: InvoiceResponse) => void;
	onDownload: (invoice: InvoiceResponse) => void;
}

function dateTooltip(iso?: string | Date | null) {
	if (!iso) return '—';
	const date = typeof iso === 'string' ? new Date(iso) : iso;
	if (Number.isNaN(date.getTime())) return '—';
	return date.toLocaleString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
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
				size: 160,
				cell: ({ row }) => (
					<Stack gap={2}>
						<Text size='sm' fw={600} className={classes.monoText}>
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
					<Text size='sm'>
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
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{formatInvoicePeriod(
							row.original.periodStart,
							row.original.periodEnd
						)}
					</Text>
				),
			},
			{
				id: 'total',
				header: t('list.columns.total'),
				size: 130,
				cell: ({ row }) => (
					<Text size='sm' fw={700} ta='right' className={classes.monoText}>
						{getInvoiceTotalDisplay(row.original)}
					</Text>
				),
			},
			{
				id: 'createdAt',
				header: t('list.columns.createdAt'),
				cell: ({ row }) => (
					<Tooltip
						label={dateTooltip(row.original.createdAt)}
						withArrow
						withinPortal
					>
						<Text size='sm'>{timeAgo(row.original.createdAt)}</Text>
					</Tooltip>
				),
				size: 100,
			},
			{
				id: 'actions',
				header: t('list.columns.actions'),
				size: 60,
				cell: ({ row }) => {
					const invoice = row.original;
					return (
						<Menu shadow='sm' position='bottom-end' withinPortal>
							<Menu.Target>
								<ActionIcon
									variant='subtle'
									size='sm'
									onClick={(e) => e.stopPropagation()}
								>
									<IconDotsVertical size={15} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									leftSection={<IconEye size={15} stroke={1.5} />}
									onClick={(e) => {
										e.stopPropagation();
										onView(invoice);
									}}
								>
									{t('list.actions.view')}
								</Menu.Item>
								{invoice.status === 'DRAFT' && (
									<Menu.Item
										leftSection={<IconCheck size={15} stroke={1.5} />}
										onClick={(e) => {
											e.stopPropagation();
											onIssue(invoice);
										}}
									>
										{t('list.actions.issue')}
									</Menu.Item>
								)}
								<Menu.Item
									leftSection={<IconDownload size={15} stroke={1.5} />}
									onClick={(e) => {
										e.stopPropagation();
										onDownload(invoice);
									}}
								>
									{t('list.actions.download')}
								</Menu.Item>
								{invoice.status !== 'VOIDED' && (
									<>
										<Menu.Divider />
										<Menu.Item
											leftSection={<IconBan size={15} stroke={1.5} />}
											color='red'
											onClick={(e) => {
												e.stopPropagation();
												onVoid(invoice);
											}}
										>
											{t('list.actions.void')}
										</Menu.Item>
									</>
								)}
							</Menu.Dropdown>
						</Menu>
					);
				},
			},
		],
		[t, onView, onIssue, onVoid, onDownload]
	);
}
