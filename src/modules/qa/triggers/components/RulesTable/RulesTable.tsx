import {
	ActionIcon,
	Badge,
	Group,
	Menu,
	Stack,
	Switch,
	Text,
	ThemeIcon,
} from '@mantine/core';
import {
	IconCopy,
	IconDotsVertical,
	IconEdit,
	IconPlayerPause,
	IconPlayerPlay,
	IconSend,
	IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { TriggerRule, RuleKind } from '~/models/qa';
import BaseTable from '~/components/BaseTable';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import {
	RULE_TYPE_META,
	SEVERITY_COLORS,
} from '~/modules/qa/triggers/constants';
import { describeRule, getRuleArea } from '~/modules/qa/triggers/helpers';
import classes from './RulesTable.module.css';

interface RulesTableProps {
	kind: RuleKind;
	rules: TriggerRule[];
	onRowClick: (rule: TriggerRule) => void;
	onEdit: (rule: TriggerRule) => void;
	onDuplicate: (rule: TriggerRule) => void;
	onDelete: (rule: TriggerRule) => void;
	onToggle: (rule: TriggerRule) => void;
	onSendTest: (rule: TriggerRule) => void;
}

export default function RulesTable({
	kind,
	rules,
	onRowClick,
	onEdit,
	onDuplicate,
	onDelete,
	onToggle,
	onSendTest,
}: RulesTableProps) {
	const { t } = useTranslation('qa.triggers');
	const dateFormatter = useDateFormatter();

	const columns = useMemo<ColumnDef<TriggerRule>[]>(() => {
		const base: ColumnDef<TriggerRule>[] = [
			{
				accessorKey: 'name',
				header: t('rules.columns.name'),
				size: 420,
				cell: (info) => {
					const rule = info.row.original;
					const meta = RULE_TYPE_META[rule.type];
					return (
						<Group gap='sm' wrap='nowrap' className={classes.nameCell}>
							<ThemeIcon
								variant='light'
								color={meta.color}
								size='md'
								radius='md'
								flex='0 0 auto'
							>
								<meta.icon size={16} />
							</ThemeIcon>
							<Stack gap={0} flex='1' className={classes.nameText}>
								<Text size='sm' fw={600} truncate='end'>
									{rule.name}
								</Text>
								<Text size='xs' c='dimmed' lineClamp={1}>
									{describeRule(t, rule)}
								</Text>
							</Stack>
						</Group>
					);
				},
			},
			{
				accessorKey: 'type',
				header: t('rules.columns.type'),
				size: 150,
				cell: (info) => {
					const type = info.getValue() as TriggerRule['type'];
					return (
						<Badge variant='outline' color='gray' size='sm'>
							{t(`types.${type}.label`)}
						</Badge>
					);
				},
			},
			{
				accessorKey: 'area',
				header: t('rules.columns.area'),
				size: 170,
				cell: (info) => {
					const rule = info.row.original;
					const area = getRuleArea(rule);
					return (
						<Badge variant='outline' color='gray' size='sm'>
							{t(`areas.${area}`)}
						</Badge>
					);
				},
			},
		];

		// Severity column for alerts only
		if (kind === 'ALERT') {
			base.push({
				accessorKey: 'severity',
				header: t('rules.columns.severity'),
				size: 110,
				cell: (info) => {
					const severity = info.getValue() as TriggerRule['severity'];
					return (
						<Badge variant='filled' color={SEVERITY_COLORS[severity]} size='sm'>
							{t(`severity.${severity}`)}
						</Badge>
					);
				},
			});
		}

		// Badge column for recognition only
		if (kind === 'RECOGNITION') {
			base.push({
				accessorKey: 'recognition.badgeId',
				header: t('rules.columns.badge'),
				size: 130,
				cell: (info) => {
					const rule = info.row.original;
					if (!rule.recognition?.badgeId) {
						return (
							<Text size='xs' c='dimmed'>
								{t('rules.noBadge')}
							</Text>
						);
					}
					return <Text size='sm'>{rule.recognition.badgeId}</Text>;
				},
			});
		}

		// Last fired column
		base.push({
			accessorKey: 'stats.lastFiredAt',
			header: t('rules.columns.lastFired'),
			size: 120,
			cell: (info) => {
				const date = info.getValue() as string | null;
				if (!date) return <Text size='sm'>{t('rules.never')}</Text>;
				return <Text size='sm'>{dateFormatter.format(new Date(date))}</Text>;
			},
		});

		// Status column
		base.push({
			accessorKey: 'status',
			header: t('rules.columns.status'),
			size: 90,
			cell: (info) => {
				const rule = info.row.original;
				if (rule.status === 'DRAFT') {
					return (
						<Badge color='yellow' variant='light' size='sm'>
							{t('status.DRAFT')}
						</Badge>
					);
				}
				return (
					<Switch
						size='sm'
						checked={rule.status === 'ACTIVE'}
						onChange={() => onToggle(rule)}
						onClick={(e) => e.stopPropagation()}
					/>
				);
			},
		});

		// Actions column
		base.push({
			id: 'actions',
			header: '',
			size: 50,
			cell: (info) => {
				const rule = info.row.original;
				return (
					<Menu withinPortal position='bottom-end'>
						<Menu.Target>
							<ActionIcon
								variant='subtle'
								color='gray'
								onClick={(e) => e.stopPropagation()}
							>
								<IconDotsVertical size={16} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								leftSection={<IconEdit size={14} />}
								onClick={() => onEdit(rule)}
							>
								{t('rules.actions.edit')}
							</Menu.Item>
							<Menu.Item
								leftSection={<IconCopy size={14} />}
								onClick={() => onDuplicate(rule)}
							>
								{t('rules.actions.duplicate')}
							</Menu.Item>
							<Menu.Item
								leftSection={<IconSend size={14} />}
								onClick={() => onSendTest(rule)}
							>
								{t('rules.actions.sendTest')}
							</Menu.Item>
							<Menu.Divider />
							{rule.status !== 'DRAFT' && (
								<Menu.Item
									leftSection={
										rule.status === 'ACTIVE' ? (
											<IconPlayerPause size={14} />
										) : (
											<IconPlayerPlay size={14} />
										)
									}
									onClick={() => onToggle(rule)}
								>
									{rule.status === 'ACTIVE'
										? t('rules.actions.pause')
										: t('rules.actions.activate')}
								</Menu.Item>
							)}
							<Menu.Item
								leftSection={<IconTrash size={14} />}
								color='red'
								onClick={() => onDelete(rule)}
							>
								{t('rules.actions.delete')}
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				);
			},
		});

		return base;
	}, [
		kind,
		t,
		dateFormatter,
		onEdit,
		onDuplicate,
		onDelete,
		onToggle,
		onSendTest,
	]);

	return (
		<BaseTable<TriggerRule>
			data={rules}
			columns={columns}
			getRowId={(rule: TriggerRule) => rule.id}
			onRowClick={onRowClick}
			density='compact'
		/>
	);
}
