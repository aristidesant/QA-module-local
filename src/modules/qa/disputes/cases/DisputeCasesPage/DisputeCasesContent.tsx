import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import {
	Badge,
	Group,
	SegmentedControl,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import {
	IconCheck,
	IconClock,
	IconPercentage,
	IconSearch,
	IconX,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import { StatCard } from '~/components/StatCard';
import type { DisputeCase, DisputeStatus } from '~/models/qa/disputeCases';
import { useDisputesStore, selectCases } from '~/stores/qa/disputesStore';
import { inboxRoleFromPath } from '~/modules/qa/inbox/constants';
import { CALL_EVALUATION_TABS } from '~/views/Campaigns/constants';
import { acceptanceRate, casesForRole, fromMockNow } from '../helpers';
import { STATUS_COLOR, TEAMS } from '../constants';
import styles from '../Disputes.module.css';

dayjs.extend(relativeTime);

type StatusFilter = DisputeStatus | 'all';

/**
 * Role-aware dispute list body: KPIs + filters + table. Extracted from
 * DisputeCasesPage so the agent role can render it as a My Calls tab.
 */
export const DisputeCasesContent: React.FC = () => {
	const { t } = useTranslation('qa.disputes');
	const location = useLocation();
	const navigate = useNavigate();
	const role = inboxRoleFromPath(location.pathname);
	const allCases = useDisputesStore(selectCases);

	const scoped = useMemo(() => casesForRole(allCases, role), [allCases, role]);

	const [status, setStatus] = useState<StatusFilter>('all');
	const [type, setType] = useState<string | null>(null);
	const [team, setTeam] = useState<string | null>(null);
	const [search, setSearch] = useState('');

	const counts = useMemo(
		() => ({
			all: scoped.length,
			open: scoped.filter((c) => c.status === 'open').length,
			accepted: scoped.filter((c) => c.status === 'accepted').length,
			rejected: scoped.filter((c) => c.status === 'rejected').length,
		}),
		[scoped]
	);

	const rows = useMemo(() => {
		const term = search.trim().toLowerCase();
		return scoped
			.filter((c) => status === 'all' || c.status === status)
			.filter((c) => !type || c.evaluationType === type)
			.filter((c) => !team || c.team === team)
			.filter((c) => !term || c.agentName.toLowerCase().includes(term))
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	}, [scoped, status, type, team, search]);

	const isManager = role === 'qa-manager';
	const showAgent = role !== 'agent';

	const columns = useMemo(() => {
		const base: BaseTableColumnDef<DisputeCase>[] = [
			{
				accessorKey: 'id',
				header: t('cases.table.columns.id'),
				size: 100,
				cell: ({ row }) => (
					<Text size='sm' fw={600}>
						{row.original.id}
					</Text>
				),
			},
			{
				accessorKey: 'callId',
				header: t('cases.table.columns.call'),
				cell: ({ row }) => (
					<Stack gap={0}>
						<Text size='sm'>{row.original.callId}</Text>
						<Text size='xs' c='dimmed'>
							{row.original.campaignName}
						</Text>
					</Stack>
				),
			},
		];

		if (showAgent) {
			base.push({
				accessorKey: 'agentName',
				header: t('cases.table.columns.agent'),
				cell: ({ row }) => (
					<Stack gap={0}>
						<Text size='sm' fw={500}>
							{row.original.agentName}
						</Text>
						<Text size='xs' c='dimmed'>
							{row.original.team}
						</Text>
					</Stack>
				),
			});
		}

		if (isManager) {
			base.push({
				accessorKey: 'supervisorName',
				header: t('cases.table.columns.supervisor'),
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{row.original.supervisorName}
					</Text>
				),
			});
		}

		base.push(
			{
				accessorKey: 'evaluationType',
				header: t('cases.table.columns.type'),
				size: 160,
				meta: { cellClassName: styles.nowrapCell },
				cell: ({ row }) => {
					const meta = CALL_EVALUATION_TABS.find(
						(tab) => tab.key === row.original.evaluationType
					);
					return (
						<Badge size='sm' variant='light' color={meta?.color ?? 'gray'}>
							{t(`cases.types.${row.original.evaluationType}`)}
						</Badge>
					);
				},
			},
			{
				accessorKey: 'scoreBefore',
				header: t('cases.table.columns.score'),
				size: 120,
				meta: { cellClassName: styles.nowrapCell },
				cell: ({ row }) => {
					const { scoreBefore, scoreAfter } = row.original;
					if (scoreBefore === null)
						return (
							<Text size='sm' c='dimmed'>
								—
							</Text>
						);
					return scoreAfter === null ? (
						<Text size='sm'>{scoreBefore}</Text>
					) : (
						<Group gap={4} wrap='nowrap'>
							<Text size='sm' c='dimmed' td='line-through'>
								{scoreBefore}
							</Text>
							<Text size='sm' fw={700} c='green'>
								{scoreAfter}
							</Text>
						</Group>
					);
				},
			},
			{
				accessorKey: 'status',
				header: t('cases.table.columns.status'),
				size: 120,
				meta: { cellClassName: styles.nowrapCell },
				cell: ({ row }) => (
					<Badge
						size='sm'
						variant='light'
						color={STATUS_COLOR[row.original.status]}
					>
						{t(`cases.status.${row.original.status}`)}
					</Badge>
				),
			},
			{
				accessorKey: 'createdAt',
				header: t('cases.table.columns.opened'),
				size: 130,
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{fromMockNow(row.original.createdAt)}
					</Text>
				),
			},
			{
				accessorKey: 'resolvedAt',
				header: t('cases.table.columns.resolved'),
				size: 130,
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{row.original.resolvedAt
							? dayjs(row.original.resolvedAt).format('DD MMM YYYY')
							: '—'}
					</Text>
				),
			}
		);

		return base;
	}, [t, showAgent, isManager]);

	const rate = acceptanceRate(scoped);

	return (
		<Stack gap='lg'>
			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
				<StatCard
					title={t('cases.kpis.open')}
					value={counts.open}
					icon={<IconClock size={20} />}
					color='blue'
				/>
				<StatCard
					title={t('cases.kpis.accepted')}
					value={counts.accepted}
					icon={<IconCheck size={20} />}
					color='green'
				/>
				<StatCard
					title={t('cases.kpis.rejected')}
					value={counts.rejected}
					icon={<IconX size={20} />}
					color='red'
				/>
				<StatCard
					title={t('cases.kpis.acceptanceRate')}
					value={rate === null ? '—' : `${rate}%`}
					icon={<IconPercentage size={20} />}
					color='grape'
				/>
			</SimpleGrid>

			<SectionCard
				title={t('cases.page.title')}
				description={t('cases.page.description.' + role)}
			>
				<Stack gap='md'>
					<Group gap='sm' wrap='wrap' align='flex-end'>
						<SegmentedControl
							value={status}
							onChange={(value) => setStatus(value as StatusFilter)}
							data={(
								['all', 'open', 'accepted', 'rejected'] as StatusFilter[]
							).map((value) => ({
								value,
								label: `${t(`cases.filters.status.${value}`)} (${counts[value]})`,
							}))}
						/>
						<Select
							placeholder={t('cases.filters.allTypes')}
							aria-label={t('cases.filters.type')}
							data={CALL_EVALUATION_TABS.map((tab) => ({
								value: tab.key,
								label: t(`cases.types.${tab.key}`),
							}))}
							value={type}
							onChange={setType}
							clearable
							className={styles.filterField}
						/>
						{showAgent && (
							<Select
								placeholder={t('cases.filters.allTeams')}
								aria-label={t('cases.filters.team')}
								data={
									isManager
										? TEAMS.map((value) => ({ value, label: value }))
										: [{ value: 'Team 1', label: 'Team 1' }]
								}
								value={team}
								onChange={setTeam}
								clearable={isManager}
								disabled={!isManager}
								className={styles.filterField}
							/>
						)}
						{showAgent && (
							<TextInput
								placeholder={t('cases.filters.agentSearch')}
								leftSection={<IconSearch size={16} />}
								value={search}
								onChange={(e) => setSearch(e.currentTarget.value)}
								className={styles.filterField}
							/>
						)}
					</Group>

					<BaseTable<DisputeCase>
						data={rows}
						columns={columns}
						getRowId={(dispute) => dispute.id}
						onRowClick={(dispute) =>
							navigate(`/qa/${role}/disputes/${dispute.id}`)
						}
						density='compact'
						emptyMessage={t('cases.table.empty')}
					/>
				</Stack>
			</SectionCard>
		</Stack>
	);
};

export default DisputeCasesContent;
