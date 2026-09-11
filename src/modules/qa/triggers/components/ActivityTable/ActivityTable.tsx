import {
	ActionIcon, Badge, Button, Group, Stack, Text, Tooltip,
} from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { TriggerActivityEntry } from '~/models/qa';
import BaseTable from '~/components/BaseTable';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import { ACTIVITY_STATUS_COLORS } from '~/modules/qa/triggers/constants';
import { formatMetricValue } from '~/modules/qa/triggers/helpers';

interface ActivityTableProps {
	entries: TriggerActivityEntry[];
	compact?: boolean;
	onOpen: (entry: TriggerActivityEntry) => void;
	onAcknowledge: (entry: TriggerActivityEntry) => void;
}

export default function ActivityTable({
	entries, compact = false, onOpen, onAcknowledge,
}: ActivityTableProps) {
	const { t } = useTranslation('qa.triggers');
	const dateFormatter = useDateFormatter();

	const columns = useMemo<ColumnDef<TriggerActivityEntry>[]>(() => [
		{
			accessorKey: 'firedAt',
			header: t('activity.columns.firedAt'),
			cell: (info) => {
				const entry = info.row.original;
				return (
					<Text size="sm">
						{dateFormatter.format(new Date(entry.firedAt))}
					</Text>
				);
			},
		},
		...(compact
			? []
			: [{
				accessorKey: 'ruleName',
				header: t('activity.columns.rule'),
				cell: (info) => {
					const ruleName = info.getValue() as string;
					return (
						<Text size="sm" fw={500}>
							{ruleName}
						</Text>
					);
				},
			}] as ColumnDef<TriggerActivityEntry>[]),
		{
			accessorKey: 'agentName',
			header: t('activity.columns.agent'),
			cell: (info) => {
				const entry = info.row.original;
				return (
					<Stack gap={0}>
						<Text size="sm" fw={500}>
							{entry.agentName}
						</Text>
						<Text size="xs" c="dimmed">
							{entry.supervisorName} · {entry.campaignName}
						</Text>
					</Stack>
				);
			},
		},
		{
			accessorKey: 'observedValue',
			header: t('activity.columns.observed'),
			cell: (info) => {
				const entry = info.row.original;
				return (
					<Stack gap={0}>
						{entry.observedValue !== null && entry.metricId ? (
							<>
								<Text size="sm" fw={600}>
									{formatMetricValue(entry.metricId, entry.observedValue)}
								</Text>
								<Text size="xs" c="dimmed" lineClamp={1}>
									{entry.conditionSummary}
								</Text>
							</>
						) : (
							<Text size="sm" c="dimmed">
								—
							</Text>
						)}
					</Stack>
				);
			},
		},
		{
			accessorKey: 'recipients',
			header: t('activity.columns.recipients'),
			cell: (info) => {
				const recipients = info.getValue() as TriggerActivityEntry['recipients'];
				return (
					<Group gap={4}>
						{recipients.map((r) => (
							<Badge key={r} size="xs" variant="default">
								{t(`recipients.${r}`)}
							</Badge>
						))}
					</Group>
				);
			},
		},
		{
			accessorKey: 'status',
			header: t('activity.columns.status'),
			cell: (info) => {
				const entry = info.row.original;
				const badge = (
					<Badge
						variant="light"
						color={ACTIVITY_STATUS_COLORS[entry.status]}
						size="sm"
					>
						{t(`status.${entry.status}`)}
					</Badge>
				);
				if (entry.status === 'SUPPRESSED') {
					return (
						<Tooltip label={t('activity.suppressedHint')}>
							{badge}
						</Tooltip>
					);
				}
				return badge;
			},
		},
		{
			id: 'actions',
			header: '',
			cell: (info) => {
				const entry = info.row.original;
				return (
					<Group gap="xs" justify="flex-end">
						{(entry.status === 'SENT' || entry.status === 'ESCALATED') && (
							<Button
								size="xs"
								variant="light"
								onClick={(e) => {
									e.stopPropagation();
									onAcknowledge(entry);
								}}
							>
								{t('activity.actions.acknowledge')}
							</Button>
						)}
						<ActionIcon
							variant="subtle"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								onOpen(entry);
							}}
						>
							<IconEye size={16} />
						</ActionIcon>
					</Group>
				);
			},
		},
	], [t, dateFormatter, onOpen, onAcknowledge, compact]);

	return (
		<BaseTable<TriggerActivityEntry>
			data={entries}
			columns={columns}
			getRowId={(r: TriggerActivityEntry) => r.id}
			density="compact"
			emptyMessage=""
		/>
	);
}
