import { useMemo, useState } from 'react';
import { ActionIcon, Badge, Button, Group, Menu, Select, Stack, Switch, Text, TextInput } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { modals } from '@mantine/modals';
import { IconBolt, IconCopy, IconDots, IconPencil, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import EmptyState from '~/components/EmptyState';
import type { CoachingRule, RuleStatus } from '~/models/qa';
import { describeCondition } from '~/modules/qa/triggers/helpers';
import { EVALUATION_AREAS } from '~/modules/qa/triggers/constants';
import { AreaBadge } from '~/modules/qa/lms/components/Badges';
import { LMS_AREA_META } from '~/modules/qa/lms/constants';

const helper = createColumnHelper<CoachingRule>();

const STATUS_COLOR: Record<RuleStatus, string> = { ACTIVE: 'green', PAUSED: 'gray', DRAFT: 'yellow' };
const STATUS_ORDER: Record<RuleStatus, number> = { ACTIVE: 0, DRAFT: 1, PAUSED: 2 };

interface RulesTabProps {
	rules: CoachingRule[];
	pathTitle: (pathId: string | null) => string;
	onCreate: () => void;
	onEdit: (rule: CoachingRule) => void;
	onOpen: (ruleId: string) => void;
	onDuplicate: (rule: CoachingRule) => void;
	onDelete: (rule: CoachingRule) => void;
	onToggle: (rule: CoachingRule) => void;
	onRunNow: (rule: CoachingRule) => void;
}

export function RulesTab({
	rules,
	pathTitle,
	onCreate,
	onEdit,
	onOpen,
	onDuplicate,
	onDelete,
	onToggle,
	onRunNow,
}: RulesTabProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.triggers', 'qa.lms']);
	const tTriggers = useTranslation('qa.triggers').t;

	const [search, setSearch] = useState('');
	const [area, setArea] = useState<string | null>(null);
	const [status, setStatus] = useState<string | null>(null);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return rules
			.filter((r) => {
				if (q && !r.name.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false;
				if (area && r.area !== area) return false;
				if (status && r.status !== status) return false;
				return true;
			})
			.sort((a, b) => {
				const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
				return s !== 0 ? s : a.name.localeCompare(b.name);
			});
	}, [rules, search, area, status]);

	const confirmDelete = (rule: CoachingRule) =>
		modals.openConfirmModal({
			title: t('rules.confirmDelete.title'),
			children: <Text size='sm'>{t('rules.confirmDelete.message', { name: rule.name })}</Text>,
			labels: { confirm: t('rules.confirmDelete.confirm'), cancel: t('rules.confirmDelete.cancel') },
			confirmProps: { color: 'red' },
			onConfirm: () => onDelete(rule),
		});

	const scopeSummary = (rule: CoachingRule) => {
		if (rule.scope.agentIds.length) return t('rules.scopeSummary.custom');
		if (rule.scope.supervisorIds.length) {
			return t('rules.scopeSummary.team', { team: rule.scope.supervisorIds.length });
		}
		if (rule.scope.linesOfBusiness.length || rule.scope.campaignIds.length) {
			return t('rules.scopeSummary.custom');
		}
		return t('rules.scopeSummary.all');
	};

	const columns: BaseTableColumnDef<CoachingRule>[] = [
		helper.accessor('name', {
			header: t('rules.columns.name'),
			cell: (info) => (
				<Stack gap={2}>
					<Text size='sm' fw={500}>
						{info.getValue()}
					</Text>
					<AreaBadge area={info.row.original.area} size='xs' />
				</Stack>
			),
		}) as BaseTableColumnDef<CoachingRule>,
		helper.display({
			id: 'condition',
			header: t('rules.columns.condition'),
			cell: (info) => {
				const rule = info.row.original;
				const first = rule.conditions[0] ? describeCondition(tTriggers, rule.conditions[0]) : '—';
				return (
					<Stack gap={0}>
						<Text size='xs'>{first}</Text>
						{rule.conditions.length > 1 && (
							<Text size='xs' c='dimmed'>
								+{rule.conditions.length - 1}
							</Text>
						)}
					</Stack>
				);
			},
		}) as BaseTableColumnDef<CoachingRule>,
		helper.display({
			id: 'action',
			header: t('rules.columns.action'),
			cell: (info) => {
				const { action } = info.row.original;
				return (
					<Stack gap={2}>
						<Text size='xs'>
							{action.kind === 'ASSIGN_CONTENT'
								? t('rules.actionSummary.content', { count: action.contentIds.length, days: action.dueInDays })
								: t('rules.actionSummary.path', { path: pathTitle(action.pathId), days: action.dueInDays })}
						</Text>
						{action.scheduleSession && (
							<Badge size='xs' variant='light' color='blue'>
								{t('rules.actionSummary.withSession')}
							</Badge>
						)}
					</Stack>
				);
			},
		}) as BaseTableColumnDef<CoachingRule>,
		helper.display({
			id: 'scope',
			header: t('rules.columns.scope'),
			cell: (info) => (
				<Text size='xs' c='dimmed'>
					{scopeSummary(info.row.original)}
				</Text>
			),
		}) as BaseTableColumnDef<CoachingRule>,
		helper.accessor((r) => r.stats.triggeredLast30Days, {
			id: 'fired',
			header: t('rules.columns.fired'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<CoachingRule>,
		helper.accessor((r) => r.stats.improvedRate, {
			id: 'improved',
			header: t('rules.columns.improved'),
			cell: (info) => (
				<Text size='sm' c={typeof info.getValue() === 'number' && (info.getValue() as number) >= 60 ? 'green' : undefined}>
					{info.getValue() === null ? '—' : `${info.getValue()}%`}
				</Text>
			),
		}) as BaseTableColumnDef<CoachingRule>,
		helper.accessor('status', {
			header: t('rules.columns.status'),
			cell: (info) => (
				<Group gap='xs' wrap='nowrap' onClick={(e) => e.stopPropagation()}>
					<Badge size='xs' color={STATUS_COLOR[info.getValue()]} variant='light'>
						{t(`rules.status.${info.getValue()}`)}
					</Badge>
					<Switch
						size='xs'
						checked={info.getValue() === 'ACTIVE'}
						onChange={() => onToggle(info.row.original)}
						disabled={info.getValue() === 'DRAFT'}
					/>
				</Group>
			),
		}) as BaseTableColumnDef<CoachingRule>,
		helper.accessor('updatedAt', {
			header: t('rules.columns.updated'),
			cell: (info) => <Text size='xs' c='dimmed'>{info.getValue().slice(0, 10)}</Text>,
		}) as BaseTableColumnDef<CoachingRule>,
		helper.display({
			id: 'actions',
			header: '',
			cell: (info) => (
				<Group justify='flex-end' onClick={(e) => e.stopPropagation()}>
					<Menu withinPortal position='bottom-end'>
						<Menu.Target>
							<ActionIcon variant='subtle' size='sm'>
								<IconDots size={16} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEdit(info.row.original)}>
								{t('rules.menu.edit')}
							</Menu.Item>
							<Menu.Item leftSection={<IconCopy size={14} />} onClick={() => onDuplicate(info.row.original)}>
								{t('rules.menu.duplicate')}
							</Menu.Item>
							<Menu.Item leftSection={<IconBolt size={14} />} onClick={() => onRunNow(info.row.original)}>
								{t('rules.menu.runNow')}
							</Menu.Item>
							<Menu.Divider />
							<Menu.Item
								leftSection={<IconTrash size={14} />}
								color='red'
								onClick={() => confirmDelete(info.row.original)}
							>
								{t('rules.menu.delete')}
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			),
		}) as BaseTableColumnDef<CoachingRule>,
	];

	if (rules.length === 0) {
		return (
			<EmptyState
				message={t('rules.empty')}
				description={t('rules.emptyDescription')}
				action={
					<Button leftSection={<IconPlus size={16} />} onClick={onCreate}>
						{t('newRule')}
					</Button>
				}
			/>
		);
	}

	return (
		<SectionCard
			title={t('rules.title')}
			description={t('rules.description')}
			headerActions={
				<Button size='sm' leftSection={<IconPlus size={16} />} onClick={onCreate}>
					{t('newRule')}
				</Button>
			}
		>
			<Stack gap='md'>
				<Group gap='sm' wrap='wrap'>
					<TextInput
						size='sm'
						placeholder={t('rules.filters.search')}
						leftSection={<IconSearch size={16} />}
						value={search}
						onChange={(e) => setSearch(e.currentTarget.value)}
						miw={220}
					/>
					<Select
						size='sm'
						placeholder={t('rules.filters.area')}
						data={EVALUATION_AREAS.map((a) => ({ value: a, label: t(LMS_AREA_META[a].labelKey, { ns: 'qa.lms' }) }))}
						value={area}
						onChange={setArea}
						clearable
						w={190}
					/>
					<Select
						size='sm'
						placeholder={t('rules.filters.status')}
						data={(['ACTIVE', 'PAUSED', 'DRAFT'] as RuleStatus[]).map((s) => ({
							value: s,
							label: t(`rules.status.${s}`),
						}))}
						value={status}
						onChange={setStatus}
						clearable
						w={150}
					/>
					<Button
						size='sm'
						variant='subtle'
						onClick={() => {
							setSearch('');
							setArea(null);
							setStatus(null);
						}}
					>
						{t('rules.filters.clear')}
					</Button>
				</Group>

				<BaseTable<CoachingRule>
					data={filtered}
					columns={columns}
					getRowId={(r) => r.id}
					density='compact'
					emptyMessage={t('rules.empty')}
					onRowClick={(r) => onOpen(r.id)}
				/>
			</Stack>
		</SectionCard>
	);
}
