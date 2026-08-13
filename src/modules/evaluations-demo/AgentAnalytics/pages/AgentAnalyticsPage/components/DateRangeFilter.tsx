import React, { useState } from 'react';
import { Checkbox, Group, Stack, Text } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { DateRange } from '../../../types/analyticsTypes';

interface DateRangeFilterProps {
	dateRange: DateRange;
	onDateRangeChange: (range: DateRange) => void;
	compareEnabled: boolean;
	onCompareToggle: (enabled: boolean) => void;
	compareDateRange?: DateRange;
	onCompareDateRangeChange?: (range: DateRange) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
	dateRange,
	onDateRangeChange,
	compareEnabled,
	onCompareToggle,
	compareDateRange,
	onCompareDateRangeChange,
}) => {
	const [showCompareInputs, setShowCompareInputs] = useState(false);

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

	const handleCompareStartDateChange = (value: string | null) => {
		if (value && onCompareDateRangeChange && compareDateRange) {
			onCompareDateRangeChange({
				...compareDateRange,
				startDate: new Date(value),
			});
		}
	};

	const handleCompareEndDateChange = (value: string | null) => {
		if (value && onCompareDateRangeChange && compareDateRange) {
			onCompareDateRangeChange({
				...compareDateRange,
				endDate: new Date(value),
			});
		}
	};

	return (
		<Stack gap='md'>
			<Text fw={600} size='sm'>
				Date Range
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
				label='Compare with period'
				checked={compareEnabled}
				onChange={(e) => {
					onCompareToggle(e.currentTarget.checked);
					setShowCompareInputs(e.currentTarget.checked);
				}}
			/>

			{showCompareInputs && compareEnabled && compareDateRange && (
				<>
					<Text fw={600} size='sm'>
						Comparison Period
					</Text>
					<Group grow>
						<DateInput
							label='Compare Start Date'
							placeholder='Select comparison start date'
							value={compareDateRange.startDate}
							onChange={handleCompareStartDateChange}
							maxDate={compareDateRange.endDate}
						/>
						<DateInput
							label='Compare End Date'
							placeholder='Select comparison end date'
							value={compareDateRange.endDate}
							onChange={handleCompareEndDateChange}
							minDate={compareDateRange.startDate}
						/>
					</Group>
				</>
			)}
		</Stack>
	);
};

export default DateRangeFilter;
