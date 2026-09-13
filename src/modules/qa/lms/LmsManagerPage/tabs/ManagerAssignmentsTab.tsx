import { useMemo, useState } from 'react';
import { Alert, Avatar, Badge, Button, Group, Progress, Select, Stack, Switch, Text, TextInput } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { IconAlertTriangle, IconCheck, IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { LmsAcceptanceStatus, LmsAssignmentSource, LmsAssignmentStatus } from '~/models/qa';
import { TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import { LMS_AREAS, LMS_AREA_META } from '../../constants';
import type { AssignmentRow } from '../../helpers';
import { dueLabel, effectiveStatus, isOverdue } from '../../helpers';
import { AcceptanceBadge, AreaBadge, AssignmentStatusBadge, FormatBadge, ImpactBadge } from '../../components/Badges';
import classes from './ManagerAssignmentsTab.module.css';

const helper = createColumnHelper<AssignmentRow>();

const ACCEPTANCE_ORDER: Record<LmsAcceptanceStatus, number> = {
	RESCHEDULE_REQUESTED: 0,
	NO_RESPONSE: 1,
	PENDING: 2,
	ACCEPTED: 3,
	NOT_REQUIRED: 4,
};

const STATUSES: LmsAssignmentStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'];
const ACCEPTANCES: LmsAcceptanceStatus[] = [
	'PENDING',
	'ACCEPTED',
	'RESCHEDULE_REQUESTED',
	'NO_RESPONSE',
	'NOT_REQUIRED',
];
const SOURCES: LmsAssignmentSource[] = ['MANUAL', 'COACHING_RULE', 'LEARNING_PATH', 'SELF'];

interface ManagerAssignmentsTabProps {
	rows: AssignmentRow[];
	role: TeamRole;
	onOpen: (assignmentId: string) => void;
}

export function ManagerAssignmentsTab({ rows, role, onOpen }: ManagerAssignmentsTabProps) {
	const { t } = useTranslation('qa.lms');

	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<string | null>(null);
	const [acceptance, setAcceptance] = useState<string | null>(null);
	const [area, setArea] = useState<string | null>(null);
	const [source, setSource] = useState<string | null>(null);
	const [team, setTeam] = useState<string | null>(null);
	const [mandatoryOnly, setMandatoryOnly] = useState(false);

	const rescheduleCount = rows.filter((r) => r.acceptance.status === 'RESCHEDULE_REQUESTED').length;

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const result = rows.filter((r) => {
			if (q && !r.agentName.toLowerCase().includes(q) && !r.contentTitle.toLowerCase().includes(q)) return false;
			if (status && effectiveStatus(r) !== status) return false;
			if (acceptance && r.acceptance.status !== acceptance) return false;
			if (area && r.area !== area) return false;
			if (source && r.source !== source) return false;
			if (team && r.supervisorId !== team) return false;
			if (mandatoryOnly && !r.mandatory) return false;
			return true;
		});
		return result.sort((a, b) => {
			const acc = ACCEPTANCE_ORDER[a.acceptance.status] - ACCEPTANCE_ORDER[b.acceptance.status];
			if (acc !== 0) return acc;
			const overdue = Number(isOverdue(b)) - Number(isOverdue(a));
			if (overdue !== 0) return overdue;
			return a.dueDate.localeCompare(b.dueDate);
		});
	}, [rows, search, status, acceptance, area, source, team, mandatoryOnly]);

	const clearFilters = () => {
		setSearch('');
		setStatus(null);
		setAcceptance(null);
		setArea(null);
		setSource(null);
		setTeam(null);
		setMandatoryOnly(false);
	};

	const columns: BaseTableColumnDef<AssignmentRow>[] = [
		helper.accessor('agentName', {
			header: t('manager.assignments.columns.agent'),
			cell: (info) => (
				<Group gap='xs' wrap='nowrap'>
					<Avatar size={26} radius='xl' color='blue'>
						{info.getValue()
							.split(' ')
							.map((p) => p[0])
							.join('')
							.slice(0, 2)}
					</Avatar>
					<Stack gap={0}>
						<Text size='sm'>{info.getValue()}</Text>
						<Text size='xs' c='dimmed'>
							{info.row.original.team}
						</Text>
					</Stack>
				</Group>
			),
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.accessor('contentTitle', {
			header: t('manager.assignments.columns.material'),
			cell: (info) => (
				<Stack gap={2}>
					<Text size='sm'>{info.getValue()}</Text>
					<FormatBadge format={info.row.original.format} size='xs' />
				</Stack>
			),
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.display({
			id: 'area',
			header: t('manager.assignments.columns.area'),
			cell: (info) => <AreaBadge area={info.row.original.area} size='xs' />,
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.accessor('assignedAt', {
			header: t('manager.assignments.columns.assigned'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.accessor('dueDate', {
			header: t('manager.assignments.columns.due'),
			cell: (info) => (
				<Text size='sm' c={isOverdue(info.row.original) ? 'red' : undefined}>
					{dueLabel(t, info.row.original)}
				</Text>
			),
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.display({
			id: 'mandatory',
			header: t('manager.assignments.columns.mandatory'),
			cell: (info) =>
				info.row.original.mandatory ? (
					<IconCheck size={16} color='var(--mantine-color-red-6)' />
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				),
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.display({
			id: 'acceptance',
			header: t('manager.assignments.columns.acceptance'),
			cell: (info) => <AcceptanceBadge acceptance={info.row.original.acceptance} size='xs' />,
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.accessor('progress', {
			header: t('manager.assignments.columns.progress'),
			cell: (info) => <Progress value={info.getValue()} size='sm' w={100} radius='xl' />,
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.display({
			id: 'status',
			header: t('manager.assignments.columns.status'),
			cell: (info) => <AssignmentStatusBadge assignment={info.row.original} size='xs' />,
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.display({
			id: 'impact',
			header: t('manager.assignments.columns.impact'),
			cell: (info) => <ImpactBadge impact={info.row.original.impact} size='xs' />,
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.accessor('source', {
			header: t('manager.assignments.columns.source'),
			cell: (info) => (
				<Badge size='xs' variant='outline'>
					{t(`manager.assignments.sourceShort.${info.getValue()}`)}
				</Badge>
			),
		}) as BaseTableColumnDef<AssignmentRow>,
	];

	return (
		<Stack gap='md'>
			{rescheduleCount > 0 && (
				<Alert color='orange' variant='light' icon={<IconAlertTriangle size={18} />}>
					<Group justify='space-between' align='center'>
						<Text size='sm'>{t('manager.assignments.rescheduleBanner', { count: rescheduleCount })}</Text>
						<Button size='xs' variant='light' color='orange' onClick={() => setAcceptance('RESCHEDULE_REQUESTED')}>
							{t('manager.assignments.reviewRequests')}
						</Button>
					</Group>
				</Alert>
			)}

			<SectionCard
				title={t('manager.assignments.title')}
				description={t('manager.assignments.description')}
				headerActions={
					<Text size='sm' c='dimmed'>
						{t('manager.assignments.count', { count: filtered.length })}
					</Text>
				}
			>
				<Stack gap='md'>
					<Group gap='sm' align='center' wrap='wrap'>
						<TextInput
							size='sm'
							placeholder={t('manager.assignments.filters.search')}
							leftSection={<IconSearch size={16} />}
							value={search}
							onChange={(e) => setSearch(e.currentTarget.value)}
							miw={220}
						/>
						<Select
							size='sm'
							placeholder={t('manager.assignments.filters.status')}
							data={STATUSES.map((s) => ({ value: s, label: t(`status.${s}`) }))}
							value={status}
							onChange={setStatus}
							clearable
							w={150}
						/>
						<Select
							size='sm'
							placeholder={t('manager.assignments.filters.acceptance')}
							data={ACCEPTANCES.map((s) => ({ value: s, label: t(`acceptance.${s}`) }))}
							value={acceptance}
							onChange={setAcceptance}
							clearable
							w={180}
						/>
						<Select
							size='sm'
							placeholder={t('manager.assignments.filters.area')}
							data={LMS_AREAS.map((a) => ({ value: a, label: t(LMS_AREA_META[a].labelKey) }))}
							value={area}
							onChange={setArea}
							clearable
							w={180}
						/>
						<Select
							size='sm'
							placeholder={t('manager.assignments.filters.source')}
							data={SOURCES.map((s) => ({ value: s, label: t(`manager.assignments.sourceShort.${s}`) }))}
							value={source}
							onChange={setSource}
							clearable
							w={140}
						/>
						{role === 'qa-manager' && (
							<Select
								size='sm'
								placeholder={t('manager.assignments.filters.team')}
								data={TEAM_SUPERVISORS.map((s) => ({ value: s.id, label: s.team }))}
								value={team}
								onChange={setTeam}
								clearable
								w={140}
							/>
						)}
						<Switch
							size='sm'
							label={t('manager.assignments.filters.mandatoryOnly')}
							checked={mandatoryOnly}
							onChange={(e) => setMandatoryOnly(e.currentTarget.checked)}
						/>
						<Button size='sm' variant='subtle' onClick={clearFilters}>
							{t('manager.assignments.filters.clear')}
						</Button>
					</Group>

					<BaseTable<AssignmentRow>
						data={filtered}
						columns={columns}
						getRowId={(r) => r.id}
						density='compact'
						enablePagination
						pageSize={12}
						showPaginationControls
						emptyMessage={t('manager.assignments.empty')}
						onRowClick={(r) => onOpen(r.id)}
						getRowClassName={(row) =>
							['RESCHEDULE_REQUESTED', 'NO_RESPONSE'].includes(row.original.acceptance.status)
								? classes.rowAttention
								: undefined
						}
					/>
				</Stack>
			</SectionCard>
		</Stack>
	);
}
