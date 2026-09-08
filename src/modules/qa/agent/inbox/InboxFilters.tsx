import React from 'react';
import {
	Group,
	Stack,
	TextInput,
	SegmentedControl,
	MultiSelect,
	Button,
	ActionIcon,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconSearch, IconX } from '@tabler/icons-react';
import type { AgentNotification } from '~/models/qa/notifications';
import styles from './InboxFilters.module.css';

export interface InboxFiltersProps {
	status: 'all' | 'read' | 'unread';
	onStatusChange: (status: 'all' | 'read' | 'unread') => void;
	selectedTypes: AgentNotification['category'][];
	onTypesChange: (types: AgentNotification['category'][]) => void;
	dateFrom?: Date | null;
	dateTo?: Date | null;
	onDateChange: (from?: Date | null, to?: Date | null) => void;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onClearFilters: () => void;
}

const NOTIFICATION_TYPES: Array<{
	label: string;
	value: AgentNotification['category'];
}> = [
	{ label: 'Direct Message', value: 'DIRECT_MESSAGE' },
	{ label: 'Metric Alert', value: 'METRIC_ALERT' },
	{ label: 'Trend Warning', value: 'TREND_WARNING' },
	{ label: 'Recognition', value: 'POSITIVE_RECOGNITION' },
	{ label: 'Weekly Summary', value: 'WEEKLY_SUMMARY' },
];

export const InboxFilters: React.FC<InboxFiltersProps> = ({
	status,
	onStatusChange,
	selectedTypes,
	onTypesChange,
	dateFrom,
	dateTo,
	onDateChange,
	searchQuery,
	onSearchChange,
	onClearFilters,
}) => {

	const hasActiveFilters =
		status !== 'all' ||
		selectedTypes.length > 0 ||
		dateFrom != null ||
		dateTo != null ||
		searchQuery.trim() !== '';

	return (
		<Stack gap='md' className={styles.filtersContainer}>
			<Group grow align='flex-end'>
				<TextInput
					placeholder='Search by title or message...'
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => onSearchChange(e.currentTarget.value)}
					rightSection={searchQuery && (
						<ActionIcon
							size='xs'
							color='gray'
							variant='transparent'
							onClick={() => onSearchChange('')}
						>
							<IconX size={14} />
						</ActionIcon>
					)}
					className={styles.searchInput}
				/>
			</Group>

			<Group grow align='flex-end'>
				<div className={styles.filterGroup}>
					<label className={styles.filterLabel}>Status</label>
					<SegmentedControl
						value={status}
						onChange={(value: string) =>
							onStatusChange(value as 'all' | 'read' | 'unread')
						}
						data={[
							{ label: 'All', value: 'all' },
							{ label: 'Unread', value: 'unread' },
							{ label: 'Read', value: 'read' },
						]}
						fullWidth
					/>
				</div>

				<div className={styles.filterGroup}>
					<label className={styles.filterLabel}>Type</label>
					<MultiSelect
						placeholder='Select notification types...'
						data={NOTIFICATION_TYPES}
						value={selectedTypes}
						onChange={(value: string[]) =>
							onTypesChange(
								value as AgentNotification['category'][]
							)
						}
						clearable
						searchable
					/>
				</div>
			</Group>

			<Group grow align='flex-end'>
				<DateInput
					label='From Date'
					placeholder='Select start date'
					value={dateFrom}
					onChange={(value: string | null) => {
						const date = value ? new Date(value) : null;
						onDateChange(date, dateTo);
					}}
					clearable
				/>

				<DateInput
					label='To Date'
					placeholder='Select end date'
					value={dateTo}
					onChange={(value: string | null) => {
						const date = value ? new Date(value) : null;
						onDateChange(dateFrom, date);
					}}
					clearable
				/>

				{hasActiveFilters && (
					<Button
						variant='light'
						leftSection={<IconX size={16} />}
						onClick={onClearFilters}
						className={styles.clearButton}
					>
						Clear Filters
					</Button>
				)}
			</Group>
		</Stack>
	);
};

export default InboxFilters;
