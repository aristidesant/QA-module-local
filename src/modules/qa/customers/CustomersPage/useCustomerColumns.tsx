import { createColumnHelper } from '@tanstack/react-table';
import { Avatar, Badge, Group, Stack, Text } from '@mantine/core';
import type { TFunction } from 'i18next';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import { formatDate } from '~/modules/qa/team/helpers';
import type { CustomerTableRow } from '../types';
import {
	CHURN_META,
	RECEPTIVENESS_META,
	SEGMENT_META,
	STATUS_META,
} from '../constants';

const helper = createColumnHelper<CustomerTableRow>();

/** The only colour the list uses: red text for what needs attention. Adapts to light and dark. */
const ALERT = 'var(--mantine-color-red-text)';

export function useCustomerColumns(
	t: TFunction<'qa.customers'>
): BaseTableColumnDef<CustomerTableRow>[] {
	return [
		helper.accessor('name', {
			header: t('list.columns.customer'),
			cell: (info) => {
				const row = info.row.original;
				return (
					<Group gap='sm' wrap='nowrap'>
						<Avatar name={row.name} color='gray' radius='xl' size='sm' />
						<Stack gap={0}>
							<Group gap={6}>
								<Text size='sm' fw={600}>
									{row.name}
								</Text>
								{row.doNotCall && (
									<Badge size='xs' color='red' variant='light'>
										{t('header.dnc')}
									</Badge>
								)}
							</Group>
							<Text size='xs' c='dimmed'>
								{row.id}
							</Text>
						</Stack>
					</Group>
				);
			},
		}) as BaseTableColumnDef<CustomerTableRow>,
		helper.accessor('segment', {
			header: t('list.columns.segment'),
			cell: (info) => (
				<Text size='sm'>{t(SEGMENT_META[info.getValue()].labelKey)}</Text>
			),
		}) as BaseTableColumnDef<CustomerTableRow>,
		helper.accessor('status', {
			header: t('list.columns.status'),
			cell: (info) => (
				<Text size='sm' c={info.getValue() === 'active' ? undefined : 'dimmed'}>
					{t(STATUS_META[info.getValue()].labelKey)}
				</Text>
			),
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
					<Text size='xs' c='dimmed'>
						{info.row.original.lastAgentName}
					</Text>
				</Stack>
			),
		}) as BaseTableColumnDef<CustomerTableRow>,
		helper.accessor('receptivenessScore', {
			header: t('list.columns.receptiveness'),
			cell: (info) => {
				const row = info.row.original;
				const resistant = row.receptivenessBand === 'resistant';
				return (
					<Group gap={8} wrap='nowrap'>
						<Text size='sm' fw={600} c={resistant ? ALERT : undefined}>
							{info.getValue()}
						</Text>
						<Text size='xs' c={resistant ? ALERT : 'dimmed'}>
							{t(RECEPTIVENESS_META[row.receptivenessBand].labelKey)}
						</Text>
					</Group>
				);
			},
		}) as BaseTableColumnDef<CustomerTableRow>,
		helper.accessor('churnRisk', {
			header: t('list.columns.churn'),
			cell: (info) => {
				const risk = info.getValue();
				return (
					<Text
						size='sm'
						fw={risk === 'high' ? 600 : 400}
						c={risk === 'high' ? ALERT : risk === 'low' ? 'dimmed' : undefined}
					>
						{t(CHURN_META[risk].labelKey)}
					</Text>
				);
			},
		}) as BaseTableColumnDef<CustomerTableRow>,
		helper.accessor('acceptanceRate', {
			header: t('list.columns.acceptance'),
			cell: (info) => <Text size='sm'>{info.getValue()}%</Text>,
		}) as BaseTableColumnDef<CustomerTableRow>,
	];
}
