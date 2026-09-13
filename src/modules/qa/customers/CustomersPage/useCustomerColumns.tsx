import { createColumnHelper } from '@tanstack/react-table';
import { Avatar, Badge, Group, Stack, Text } from '@mantine/core';
import { IconMinus, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import type { TFunction } from 'i18next';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import { formatDate, sentimentColor, trendColor } from '~/modules/qa/team/helpers';
import type { CustomerProfile, CustomerTableRow } from '../types';
import { CHURN_META, RECEPTIVENESS_META, SEGMENT_META, STATUS_META } from '../constants';
import { npsBand } from '../helpers';

const helper = createColumnHelper<CustomerTableRow>();

export function useCustomerColumns(
	profiles: Record<string, CustomerProfile>,
	t: TFunction<'qa.customers'>,
): BaseTableColumnDef<CustomerTableRow>[] {
	return [
		helper.accessor('name', {
			header: t('list.columns.customer'),
			cell: (info) => {
				const row = info.row.original;
				const profile = profiles[row.id];
				return (
					<Group gap='sm' wrap='nowrap'>
						<Avatar name={row.name} color={profile?.customer.avatarColor} radius='xl' size='sm' />
						<Stack gap={0}>
							<Group gap={6}>
								<Text size='sm' fw={600}>{row.name}</Text>
								{row.doNotCall && <Badge size='xs' color='red' variant='filled'>{t('header.dnc')}</Badge>}
							</Group>
							<Text size='xs' c='dimmed'>{row.id}</Text>
						</Stack>
					</Group>
				);
			},
		}) as BaseTableColumnDef<CustomerTableRow>,
		helper.accessor('segment', {
			header: t('list.columns.segment'),
			cell: (info) => <Badge variant='light' color={SEGMENT_META[info.getValue()].color}>{t(SEGMENT_META[info.getValue()].labelKey)}</Badge>,
		}) as BaseTableColumnDef<CustomerTableRow>,
		helper.accessor('status', {
			header: t('list.columns.status'),
			cell: (info) => <Badge variant='dot' color={STATUS_META[info.getValue()].color}>{t(STATUS_META[info.getValue()].labelKey)}</Badge>,
		}) as BaseTableColumnDef<CustomerTableRow>,
		helper.accessor('contacts', {
			header: t('list.columns.contacts'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<CustomerTableRow>,
		helper.accessor('lastContactAt', {
			header: t('list.columns.lastContact'),
			cell: (info) => (
				<Stack gap={0}>
					<Text size='sm'>{formatDate(info.getValue())}</Text>
					<Text size='xs' c='dimmed'>{info.row.original.lastAgentName}</Text>
				</Stack>
			),
		}) as BaseTableColumnDef<CustomerTableRow>,
		helper.accessor('receptivenessScore', {
			header: t('list.columns.receptiveness'),
			cell: (info) => {
				const row = info.row.original;
				const meta = RECEPTIVENESS_META[row.receptivenessBand];
				return (
					<Group gap={6} wrap='nowrap'>
						<Badge size='lg' variant='filled' color={meta.color}>{info.getValue()}</Badge>
						<Text size='xs'>{t(meta.labelKey)}</Text>
					</Group>
				);
			},
		}) as BaseTableColumnDef<CustomerTableRow>,
		helper.accessor('churnRisk', {
			header: t('list.columns.churn'),
			cell: (info) => <Badge variant='light' color={CHURN_META[info.getValue()].color}>{t(CHURN_META[info.getValue()].labelKey)}</Badge>,
		}) as BaseTableColumnDef<CustomerTableRow>,
		helper.accessor('avgSentiment', {
			header: t('list.columns.sentiment'),
			cell: (info) => {
				const row = info.row.original;
				const Icon = row.sentimentTrend === 'up' ? IconTrendingUp : row.sentimentTrend === 'down' ? IconTrendingDown : IconMinus;
				return (
					<Group gap={4} wrap='nowrap'>
						<Text size='sm' c={sentimentColor(info.getValue())} fw={600}>{info.getValue().toFixed(1)}/5</Text>
						<Icon size={14} color={`var(--mantine-color-${trendColor(row.sentimentTrend)}-6)`} />
					</Group>
				);
			},
		}) as BaseTableColumnDef<CustomerTableRow>,
		helper.accessor('acceptanceRate', {
			header: t('list.columns.acceptance'),
			cell: (info) => <Text size='sm'>{info.getValue()}%</Text>,
		}) as BaseTableColumnDef<CustomerTableRow>,
		helper.accessor('npsLatest', {
			header: t('list.columns.nps'),
			cell: (info) => {
				const value = info.getValue();
				return value !== undefined
					? <Badge variant='outline' color={npsBand(value).color}>{value}</Badge>
					: <Text size='sm' c='dimmed'>—</Text>;
			},
		}) as BaseTableColumnDef<CustomerTableRow>,
		helper.accessor('bestWindow', {
			header: t('list.columns.bestWindow'),
			cell: (info) => <Text size='xs'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<CustomerTableRow>,
	];
}
