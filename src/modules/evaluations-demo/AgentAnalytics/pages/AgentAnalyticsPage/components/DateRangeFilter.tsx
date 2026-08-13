import React from 'react';
import { Checkbox, Group, Stack, Button, Text } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconX } from '@tabler/icons-react';
import { DateRange } from '../../../types/analyticsTypes';

interface DateRangeFilterProps {
	dateRange: DateRange;
	onDateRangeChange: (range: DateRange) => void;
	compareEnabled: boolean;
	onCompareToggle: (enabled: boolean) => void;
	onReset: () => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
	dateRange,
	onDateRangeChange,
	compareEnabled,
	onCompareToggle,
	onReset,
}) => {
	const handleStartDateChange = (value: string | null) => {
		if (value) {
			onDateRangeChange({
				...dateRange,
				startDate: new Date(value),
			});
		}
	};

	const handleEndDateChange = (value: string | null) => {
		if (value) {
			onDateRangeChange({
				...dateRange,
				endDate: new Date(value),
			});
		}
	};

	return (
		<Stack gap='md'>
			<Text fw={600} size='sm'>
				Date Range & Comparison
			</Text>

			<Group grow>
				<DateInput
					label='Start Date'
					placeholder='Select start date'
					value={dateRange.startDate}
					onChange={handleStartDateChange}
					maxDate={dateRange.endDate}
				/>
				<DateInput
					label='End Date'
					placeholder='Select end date'
					value={dateRange.endDate}
					onChange={handleEndDateChange}
					minDate={dateRange.startDate}
				/>
			</Group>

			<Checkbox
				label='Compare with previous period'
				checked={compareEnabled}
				onChange={(e) => onCompareToggle(e.currentTarget.checked)}
			/>

			<Button
				variant='default'
				size='sm'
				leftSection={<IconX size={16} />}
				onClick={onReset}
				fullWidth
			>
				Reset Filters
			</Button>
		</Stack>
	);
};

export default DateRangeFilter;
