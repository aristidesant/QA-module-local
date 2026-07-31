import {
	Button,
	Group,
	MultiSelect,
	Select,
	Stack,
	Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useTranslation } from 'react-i18next';

export interface DisputesFiltersProps {
	filters: {
		supervisorIds?: number[];
		agentIds?: number[];
		campaignId?: number;
		dateRangeStart?: string;
		dateRangeEnd?: string;
		sortBy?: 'createdAt' | 'scoreDelta';
		orderBy?: 'ASC' | 'DESC';
	};
	onFiltersChange: (filters: Partial<DisputesFiltersProps['filters']>) => void;
	isLoading?: boolean;
}

// Mock data for demonstration
const MOCK_SUPERVISORS = [
	{ value: '1', label: 'John Smith' },
	{ value: '2', label: 'Maria Garcia' },
	{ value: '3', label: 'Robert Chen' },
];

const MOCK_AGENTS = [
	{ value: '1', label: 'Agent Alpha' },
	{ value: '2', label: 'Agent Beta' },
	{ value: '3', label: 'Agent Gamma' },
];

const MOCK_CAMPAIGNS = [
	{ value: '1', label: 'Q2 Sales Performance' },
	{ value: '2', label: 'Customer Support Quality' },
	{ value: '3', label: 'Outbound Campaign 2026' },
];

export default function DisputesFilters({
	filters,
	onFiltersChange,
	isLoading = false,
}: DisputesFiltersProps) {
	const { t } = useTranslation('qa.disputes');

	const hasActiveFilters =
		(filters.supervisorIds && filters.supervisorIds.length > 0) ||
		(filters.agentIds && filters.agentIds.length > 0) ||
		filters.campaignId ||
		filters.dateRangeStart ||
		filters.dateRangeEnd;

	const sortByOptions = [
		{ value: 'createdAt:DESC', label: t('sortOptions.newestFirst') },
		{ value: 'createdAt:ASC', label: t('sortOptions.oldestFirst') },
		{ value: 'scoreDelta:DESC', label: t('sortOptions.scoreChangeHigh') },
		{ value: 'scoreDelta:ASC', label: t('sortOptions.scoreChangeLow') },
	];

	const currentSortValue =
		filters.sortBy && filters.orderBy
			? `${filters.sortBy}:${filters.orderBy}`
			: 'createdAt:ASC';

	const handleDateChange = (
		field: 'dateRangeStart' | 'dateRangeEnd',
		value: Date | null | string
	) => {
		const dateValue =
			value instanceof Date ? value : value ? new Date(value) : null;
		onFiltersChange({
			[field]: dateValue ? dateValue.toISOString().split('T')[0] : undefined,
		});
	};

	const handleSortChange = (value: string | null) => {
		if (!value) return;
		const [sortBy, orderBy] = value.split(':');
		onFiltersChange({
			sortBy: sortBy as 'createdAt' | 'scoreDelta',
			orderBy: orderBy as 'ASC' | 'DESC',
		});
	};

	const handleClearAll = () => {
		onFiltersChange({
			supervisorIds: undefined,
			agentIds: undefined,
			campaignId: undefined,
			dateRangeStart: undefined,
			dateRangeEnd: undefined,
			sortBy: 'createdAt',
			orderBy: 'ASC',
		});
	};

	const startDate: Date | null =
		filters.dateRangeStart && filters.dateRangeStart !== ''
			? new Date(filters.dateRangeStart + 'T00:00:00Z')
			: null;
	const endDate: Date | null =
		filters.dateRangeEnd && filters.dateRangeEnd !== ''
			? new Date(filters.dateRangeEnd + 'T00:00:00Z')
			: null;

	return (
		<Stack gap='md'>
			<Title order={4} size='sm'>
				Filters
			</Title>

			<Group grow>
				<MultiSelect
					label='Supervisor'
					placeholder='Supervisor'
					data={MOCK_SUPERVISORS}
					value={(filters.supervisorIds || []).map(String)}
					onChange={(values) =>
						onFiltersChange({
							supervisorIds: values.map(Number),
						})
					}
					disabled={isLoading}
					searchable
					clearable
				/>

				<MultiSelect
					label='Agent'
					placeholder='Agent'
					data={MOCK_AGENTS}
					value={(filters.agentIds || []).map(String)}
					onChange={(values) =>
						onFiltersChange({
							agentIds: values.map(Number),
						})
					}
					disabled={isLoading}
					searchable
					clearable
				/>
			</Group>

			<Group grow>
				<Select
					label='Campaign'
					placeholder='Campaign'
					data={MOCK_CAMPAIGNS}
					value={filters.campaignId ? String(filters.campaignId) : null}
					onChange={(value) =>
						onFiltersChange({
							campaignId: value ? Number(value) : undefined,
						})
					}
					disabled={isLoading}
					searchable
					clearable
				/>

				<Select
					label={t('filters.sortBy')}
					placeholder={t('filters.sortBy')}
					data={sortByOptions}
					value={currentSortValue}
					onChange={handleSortChange}
					disabled={isLoading}
				/>
			</Group>

			<Group grow>
				<DateInput
					label='Start Date'
					placeholder='Start Date'
					value={startDate}
					onChange={(date) => handleDateChange('dateRangeStart', date)}
					disabled={isLoading}
					clearable
				/>

				<DateInput
					label='End Date'
					placeholder='End Date'
					value={endDate}
					onChange={(date) => handleDateChange('dateRangeEnd', date)}
					disabled={isLoading}
					minDate={startDate === null ? undefined : startDate}
					clearable
				/>
			</Group>

			<Group justify='space-between'>
				<Button
					variant='light'
					onClick={handleClearAll}
					disabled={isLoading || !hasActiveFilters}
				>
					{t('filters.clearAll')}
				</Button>
				<Button onClick={() => {}} disabled={isLoading}>
					Apply Filters
				</Button>
			</Group>
		</Stack>
	);
}
