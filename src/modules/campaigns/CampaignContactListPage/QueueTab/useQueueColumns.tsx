import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
	Group,
	Text,
	Badge,
	Avatar,
	ActionIcon,
	Tooltip,
	Checkbox,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconPlayerPause,
	IconPlayerPlay,
	IconX,
	IconRefresh,
	IconPhone,
} from '@tabler/icons-react';
import type { OutboundCallTask } from '~/models/ContactsModel';

const STATUS_COLORS: Record<string, string> = {
	PENDING: 'gray',
	QUEUED: 'blue',
	IN_PROGRESS: 'cyan',
	COMPLETED: 'green',
	FAILED: 'red',
	CANCELLED: 'orange',
	PAUSED: 'yellow',
	RETRY: 'violet',
	SKIPPED: 'gray',
};

interface UseQueueColumnsOptions {
	onPause?: (task: OutboundCallTask) => void;
	onResume?: (task: OutboundCallTask) => void;
	onCancel?: (task: OutboundCallTask) => void;
	onRetry?: (task: OutboundCallTask) => void;
	selectedIds: Set<number>;
	onToggleSelect: (id: number) => void;
	onToggleSelectAll: (taskIds: number[]) => void;
	allTaskIds: number[];
}

export const useQueueColumns = ({
	onPause,
	onResume,
	onCancel,
	onRetry,
	selectedIds,
	onToggleSelect,
	onToggleSelectAll,
	allTaskIds,
}: UseQueueColumnsOptions): ColumnDef<OutboundCallTask, unknown>[] => {
	const { t } = useTranslation('campaign.contact-list');

	return useMemo(
		() => [
			{
				id: 'select',
				header: () => (
					<Checkbox
						size='xs'
						checked={
							allTaskIds.length > 0 &&
							allTaskIds.every((id) => selectedIds.has(id))
						}
						indeterminate={
							allTaskIds.some((id) => selectedIds.has(id)) &&
							!allTaskIds.every((id) => selectedIds.has(id))
						}
						onChange={() => onToggleSelectAll(allTaskIds)}
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						size='xs'
						checked={selectedIds.has(row.original.id)}
						onChange={() => onToggleSelect(row.original.id)}
					/>
				),
				size: 40,
				enableSorting: false,
			},
			{
				accessorKey: 'orderIndex',
				header: t('queue.columns.order'),
				enableSorting: false,
				cell: ({ row }) => (
					<Text size='xs' fw={500} c='dimmed'>
						{row.original.orderIndex}
					</Text>
				),
				size: 60,
			},
			{
				id: 'contactName',
				header: t('queue.columns.contactName'),
				enableSorting: false,
				cell: ({ row }) => {
					const task = row.original;
					const firstName = task.contact?.firstName ?? '';
					const lastName = task.contact?.lastName ?? '';
					const fullName =
						`${firstName} ${lastName}`.trim() || `Contact #${task.contactId}`;
					const initials =
						`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

					return (
						<Group gap={8} wrap='nowrap'>
							<Avatar size='sm' color='blue' radius='xl'>
								{initials}
							</Avatar>
							<Text size='xs' fw={500}>
								{fullName}
							</Text>
						</Group>
					);
				},
				size: 200,
			},
			{
				id: 'phone',
				header: t('queue.columns.phone'),
				enableSorting: false,
				cell: ({ row }) => {
					const phone = row.original.contactPhoneNumber?.phoneNumber;
					if (!phone) {
						return (
							<Text size='xs' c='dimmed'>
								—
							</Text>
						);
					}
					return (
						<Group gap={4} wrap='nowrap'>
							<IconPhone
								size={14}
								stroke={1.6}
								color='var(--mantine-color-dimmed)'
							/>
							<Text size='xs' fw={500}>
								{phone}
							</Text>
						</Group>
					);
				},
				size: 160,
			},
			{
				accessorKey: 'status',
				header: t('queue.columns.status'),
				enableSorting: false,
				cell: ({ row }) => {
					const status = row.original.status;
					return (
						<Badge
							variant='light'
							color={STATUS_COLORS[status] ?? 'gray'}
							size='sm'
							radius='sm'
						>
							{t(`queue.status.${status}`, { defaultValue: status })}
						</Badge>
					);
				},
				size: 120,
			},
			{
				id: 'contactResult',
				header: t('queue.columns.contactResult'),
				enableSorting: false,
				cell: ({ row }) => {
					const result =
						row.original.conversation?.callDisposition?.statusContact;
					if (!result) {
						return (
							<Text size='xs' c='dimmed'>
								—
							</Text>
						);
					}
					const color = result === 'COMPLETED' ? 'green' : 'blue';
					return (
						<Badge variant='light' color={color} size='sm' radius='sm'>
							{result}
						</Badge>
					);
				},
				size: 130,
			},
			{
				id: 'dispositionName',
				header: t('queue.columns.dispositionName'),
				enableSorting: false,
				cell: ({ row }) => {
					const name =
						row.original.conversation?.callDisposition?.dispositionName;
					return (
						<Text size='xs' truncate>
							{name || '—'}
						</Text>
					);
				},
				size: 150,
			},
			{
				id: 'callStatus',
				header: t('queue.columns.callStatus'),
				enableSorting: false,
				cell: ({ row }) => {
					const callStatus =
						row.original.conversation?.callDisposition?.callStatus;
					if (!callStatus) {
						return (
							<Text size='xs' c='dimmed'>
								—
							</Text>
						);
					}
					const colorMap: Record<string, string> = {
						POSITIVE: 'green',
						NEGATIVE: 'red',
					};
					const color = colorMap[callStatus] ?? 'gray';
					return (
						<Badge variant='light' color={color} size='sm' radius='sm'>
							{callStatus}
						</Badge>
					);
				},
				size: 120,
			},
			{
				id: 'isAbandoned',
				header: t('queue.columns.isAbandoned'),
				enableSorting: false,
				cell: ({ row }) => {
					const isAbandoned =
						row.original.conversation?.callDisposition?.isAbandoned;
					if (isAbandoned == null) {
						return (
							<Text size='xs' c='dimmed'>
								—
							</Text>
						);
					}
					return (
						<Badge
							variant='light'
							color={isAbandoned ? 'red' : 'green'}
							size='sm'
							radius='sm'
						>
							{isAbandoned ? 'Yes' : 'No'}
						</Badge>
					);
				},
				size: 100,
			},
			{
				id: 'doNotCall',
				header: t('queue.columns.doNotCall'),
				enableSorting: false,
				cell: ({ row }) => {
					const doNotCall =
						row.original.conversation?.callDisposition?.doNotCall;
					if (doNotCall == null) {
						return (
							<Text size='xs' c='dimmed'>
								—
							</Text>
						);
					}
					return (
						<Badge
							variant='light'
							color={doNotCall ? 'red' : 'green'}
							size='sm'
							radius='sm'
						>
							{doNotCall ? 'Yes' : 'No'}
						</Badge>
					);
				},
				size: 100,
			},
			{
				accessorKey: 'waveNumber',
				header: t('queue.columns.wave'),
				enableSorting: false,
				cell: ({ row }) => (
					<Text size='xs' fw={500}>
						{row.original.waveNumber}
					</Text>
				),
				size: 70,
			},
			{
				accessorKey: 'scheduledAt',
				header: t('queue.columns.scheduledAt'),
				enableSorting: false,
				cell: ({ row }) => {
					const scheduledAt = row.original.scheduledAt;
					if (!scheduledAt) {
						return (
							<Text size='xs' c='dimmed'>
								—
							</Text>
						);
					}
					const date = new Date(scheduledAt);
					return <Text size='xs'>{date.toLocaleString()}</Text>;
				},
				size: 160,
			},
			{
				id: 'actions',
				header: t('queue.columns.actions'),
				enableSorting: false,
				cell: ({ row }) => {
					const task = row.original;
					const status = task.status;
					const canPause =
						status === 'PENDING' || status === 'QUEUED' || status === 'RETRY';
					const canResume = status === 'PAUSED';
					const canCancel =
						status === 'PENDING' ||
						status === 'QUEUED' ||
						status === 'PAUSED' ||
						status === 'RETRY';
					const canRetry = status === 'FAILED';

					return (
						<Group gap={4} wrap='nowrap'>
							{onPause && canPause && (
								<Tooltip label={t('queue.actions.pause')} withArrow>
									<ActionIcon
										variant='subtle'
										color='yellow'
										size='sm'
										onClick={() => onPause(task)}
									>
										<IconPlayerPause size={14} />
									</ActionIcon>
								</Tooltip>
							)}
							{onResume && canResume && (
								<Tooltip label={t('queue.actions.resume')} withArrow>
									<ActionIcon
										variant='subtle'
										color='green'
										size='sm'
										onClick={() => onResume(task)}
									>
										<IconPlayerPlay size={14} />
									</ActionIcon>
								</Tooltip>
							)}
							{onCancel && canCancel && (
								<Tooltip label={t('queue.actions.cancel')} withArrow>
									<ActionIcon
										variant='subtle'
										color='red'
										size='sm'
										onClick={() => onCancel(task)}
									>
										<IconX size={14} />
									</ActionIcon>
								</Tooltip>
							)}
							{onRetry && canRetry && (
								<Tooltip label={t('queue.actions.retry')} withArrow>
									<ActionIcon
										variant='subtle'
										color='violet'
										size='sm'
										onClick={() => onRetry(task)}
									>
										<IconRefresh size={14} />
									</ActionIcon>
								</Tooltip>
							)}
						</Group>
					);
				},
				size: 120,
			},
		],
		[
			t,
			onPause,
			onResume,
			onCancel,
			onRetry,
			selectedIds,
			onToggleSelect,
			onToggleSelectAll,
			allTaskIds,
		]
	);
};
