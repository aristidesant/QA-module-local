import { useMemo } from 'react';
import { Badge, Text, Tooltip } from '@mantine/core';
import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import type { ConversationsModel } from '~/models/ConversationsModels';

dayjs.extend(relativeTime);
dayjs.extend(timezone);

export const useConversationsColumns = (userTimezone: string) => {
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
				return { color: 'green', label: 'Done' };
			}
			if (normalized.includes('progress') || normalized.includes('running')) {
				return { color: 'blue', label: 'In Progress' };
			}
			if (
				normalized.includes('failed') ||
				normalized.includes('error') ||
				normalized.includes('cancel')
			) {
				return { color: 'red', label: 'Failed' };
			}
			if (
				normalized.includes('pending') ||
				normalized.includes('queued') ||
				normalized.includes('waiting') ||
				normalized.includes('initiated')
			) {
				return { color: 'yellow', label: 'Pending' };
			}
			return { color: 'gray', label: 'Unknown' };
		};

		const formatDuration = (
			startDate?: string | null,
			endDate?: string | null
		) => {
			if (!startDate) return '—';

			const start = dayjs.utc(startDate);
			if (!start.isValid()) return '—';

			const end = endDate ? dayjs.utc(endDate) : dayjs();
			const diffSeconds = end.diff(start, 'second');

			if (diffSeconds < 0) return '—';

			const days = Math.floor(diffSeconds / 86400);
			const hours = Math.floor((diffSeconds % 86400) / 3600);
			const minutes = Math.floor((diffSeconds % 3600) / 60);
			const seconds = diffSeconds % 60;

			const parts: string[] = [];
			if (days) parts.push(`${days}d`);
			if (hours) parts.push(`${hours}h`);
			if (minutes) parts.push(`${minutes}m`);
			if (!days && !hours && !minutes) parts.push(`${seconds}s`);

			return parts.join(' ') || '—';
		};

		return [
			{
				id: 'contactName',
				header: 'Contact Name',
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
				header: 'Phone Number',
				accessorFn: (row) => row.contactPhoneNumber ?? '',
				enableSorting: false,
				cell: ({ row }) => (
					<Text size='xs' fw={600}>
						{row.original.contactPhoneNumber || '—'}
					</Text>
				),
			},
			{
				id: 'dispositionName',
				header: 'Outcome',
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
							{row.original?.dispositions?.dispositionName ?? 'N/A'}
						</Badge>
					);
				},
			},
			{
				accessorKey: 'status',
				header: 'Status',
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
				header: 'When',
				enableSorting: true,
				cell: ({ getValue }) => {
					const value = getValue<string>();
					if (!value) return <Text size='xs'>—</Text>;

					const zoned = formatZonedDate(value);
					if (!zoned) return <Text size='xs'>—</Text>;

					const relative = zoned.fromNow();
					const absolute = zoned.format('MMM D, YYYY • HH:mm');

					return (
						<Tooltip label={`${absolute} (${userTimezone})`}>
							<Text size='xs'>{relative}</Text>
						</Tooltip>
					);
				},
			},
			{
				id: 'duration',
				header: 'Duration',
				cell: ({ row }) => {
					const duration = formatDuration(
						row.original.startDate,
						row.original.endDate
					);
					const endDate = row.original.endDate;

					if (!endDate) {
						return <Text size='xs'>{duration}</Text>;
					}

					const zonedEnd = formatZonedDate(endDate);
					const endTooltip = zonedEnd
						? `ended at ${zonedEnd.format('MMM D, YYYY • HH:mm')} (${userTimezone})`
						: 'ended';

					return (
						<Tooltip label={endTooltip}>
							<Text size='xs'>{duration}</Text>
						</Tooltip>
					);
				},
			},
		];
	}, [userTimezone]);
};
