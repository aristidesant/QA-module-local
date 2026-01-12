import { useMemo } from 'react';
import { Badge, Text, Tooltip } from '@mantine/core';
import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import type { ConversationsModel } from '~/models/ConversationsModels';
import { useTranslation } from 'react-i18next';

dayjs.extend(relativeTime);
dayjs.extend(timezone);

export const useConversationsColumns = (userTimezone: string) => {
	const { t } = useTranslation(['conversations', 'common']);

	return useMemo<ColumnDef<ConversationsModel>[]>(() => {
		const formatZonedDate = (value?: string | null) => {
			if (!value) return null;
			const parsed = dayjs.utc(value);
			if (!parsed.isValid()) return null;
			return parsed.tz(userTimezone);
		};

		const resolveSimpleStatus = (status?: string | null) => {
			const rawStatus = status ?? 'unknown';
			const normalized = rawStatus.toLowerCase();

			if (
				normalized.includes('complete') ||
				normalized.includes('success') ||
				normalized.includes('done')
			) {
				return { color: 'green', label: t('list.status.done') };
			}
			if (normalized.includes('progress') || normalized.includes('running')) {
				return {
					color: 'blue',
					label: t('list.status.inProgress'),
				};
			}
			if (
				normalized.includes('failed') ||
				normalized.includes('error') ||
				normalized.includes('cancel')
			) {
				return { color: 'red', label: t('list.status.failed') };
			}
			if (
				normalized.includes('pending') ||
				normalized.includes('queued') ||
				normalized.includes('waiting') ||
				normalized.includes('initiated')
			) {
				return {
					color: 'yellow',
					label: t('list.status.pending'),
				};
			}
			return { color: 'gray', label: t('list.status.unknown') };
		};

		const formatDuration = (
			startDate?: string | null,
			endDate?: string | null,
			status?: string | null
		) => {
			if (!startDate) return '—';

			const start = dayjs.utc(startDate);
			if (!start.isValid()) return '—';

			// If no endDate and status is terminal (failed, error, cancelled), show N/A
			const normalizedStatus = (status ?? '').toLowerCase();
			const isTerminalStatus =
				normalizedStatus.includes('failed') ||
				normalizedStatus.includes('error') ||
				normalizedStatus.includes('cancel');

			if (!endDate && isTerminalStatus) {
				return '—';
			}

			// Only use current time for in-progress conversations
			const end = endDate ? dayjs.utc(endDate) : dayjs();
			const diffSeconds = end.diff(start, 'second');

			if (diffSeconds < 0) return '—';

			const days = Math.floor(diffSeconds / 86400);
			const hours = Math.floor((diffSeconds % 86400) / 3600);
			const minutes = Math.floor((diffSeconds % 3600) / 60);
			const seconds = diffSeconds % 60;

			const parts: string[] = [];
			if (days) parts.push(`${days}${t('units.day', { ns: 'common' })}`);
			if (hours) parts.push(`${hours}${t('units.hour', { ns: 'common' })}`);
			if (minutes)
				parts.push(`${minutes}${t('units.minute', { ns: 'common' })}`);
			if (!days && !hours && !minutes)
				parts.push(`${seconds}${t('units.second', { ns: 'common' })}`);

			return parts.join(' ') || '—';
		};

		return [
			{
				id: 'contactName',
				header: t('list.columns.contactName'),
				accessorFn: (row) => row.contactName ?? '',
				enableSorting: true,
				cell: ({ row }) => (
					<Text size='xs' fw={600}>
						{row.original.contactName || '—'}
					</Text>
				),
			},
			{
				id: 'phoneNumber',
				header: t('list.columns.phoneNumber'),
				accessorFn: (row) => row.contactPhoneNumber ?? '',
				enableSorting: false,
				cell: ({ row }) => (
					<Text size='xs' fw={600}>
						{row.original.contactPhoneNumber || '—'}
					</Text>
				),
			},
			{
				id: 'disposition',
				header: t('list.columns.outcome'),
				accessorFn: (row) => row?.dispositions?.dispositionName ?? '',
				enableSorting: true,
				cell: ({ row }) => {
					const color =
						row?.original?.dispositions?.callStatus === 'NEGATIVE'
							? 'red'
							: row?.original?.dispositions?.callStatus === 'POSITIVE'
								? 'green'
								: 'gray';
					return (
						<Badge color={color} size='xs'>
							{row.original?.dispositions?.dispositionName ??
								t('overview.fallbacks.na')}
						</Badge>
					);
				},
			},
			{
				accessorKey: 'status',
				header: t('list.columns.status'),
				cell: ({ getValue }) => {
					const { color, label } = resolveSimpleStatus(getValue<string>());
					return (
						<Badge color={color} size='sm' radius='sm' variant='light'>
							{label}
						</Badge>
					);
				},
				enableSorting: true,
			},
			{
				accessorKey: 'startDate',
				header: t('list.columns.when'),
				enableSorting: true,
				cell: ({ getValue }) => {
					const value = getValue<string>();
					if (!value) return <Text size='xs'>—</Text>;

					const zoned = formatZonedDate(value);
					if (!zoned) return <Text size='xs'>—</Text>;

					const relative = zoned.fromNow();
					const absolute = zoned.format('MMM D, YYYY • HH:mm');

					return (
						<Tooltip
							label={t('list.columns.endedAt', {
								date: absolute,
								timezone: userTimezone,
							})}
						>
							<Text size='xs'>{relative}</Text>
						</Tooltip>
					);
				},
			},
			{
				id: 'duration',
				header: t('list.columns.duration'),
				cell: ({ row }) => {
					const duration = formatDuration(
						row.original.startDate,
						row.original.endDate,
						row.original.status
					);
					const endDate = row.original.endDate;

					if (!endDate) {
						return <Text size='xs'>{duration}</Text>;
					}

					const zonedEnd = formatZonedDate(endDate);
					const endTooltip = zonedEnd
						? t('list.columns.endedAt', {
								date: zonedEnd.format('MMM D, YYYY • HH:mm'),
								timezone: userTimezone,
							})
						: t('list.columns.ended');

					return (
						<Tooltip label={endTooltip}>
							<Text size='xs'>{duration}</Text>
						</Tooltip>
					);
				},
			},
		];
	}, [userTimezone, t]);
};
