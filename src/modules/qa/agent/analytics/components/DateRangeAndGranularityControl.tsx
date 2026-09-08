import React, { useState } from 'react';
import { Stack, Group, TextInput, SegmentedControl, Checkbox, Button, Text } from '@mantine/core';
import { useAgentAnalyticsStore } from '~/stores/qa/agentAnalyticsStore';

interface DateRangeAndGranularityControlProps {
	onApply?: (range: { from: Date; to: Date }, granularity: string, compare: boolean) => void;
}

export const DateRangeAndGranularityControl: React.FC<DateRangeAndGranularityControlProps> = ({
	onApply,
}) => {
	const { dateRange, setDateRange, granularity, setGranularity, compareWithPrevious, toggleComparison } = useAgentAnalyticsStore();

	// Local state for form inputs
	const [fromDate, setFromDate] = useState<string>(dateRange.from.toISOString().split('T')[0]);
	const [toDate, setToDate] = useState<string>(dateRange.to.toISOString().split('T')[0]);
	const [selectedGranularity, setSelectedGranularity] = useState<string>(granularity);
	const [compare, setCompare] = useState<boolean>(compareWithPrevious);

	const handleApply = () => {
		const from = new Date(fromDate);
		const to = new Date(toDate);

		setDateRange({ from, to });
		setGranularity(selectedGranularity as 'per-call' | 'daily' | 'weekly' | 'monthly');

		if (compare !== compareWithPrevious) {
			toggleComparison();
		}

		// Call optional callback
		if (onApply) {
			onApply({ from, to }, selectedGranularity, compare);
		}
	};

	return (
		<Stack gap='md'>
			{/* Date Range Row */}
			<Group grow>
				<TextInput
					label='From Date'
					type='date'
					value={fromDate}
					onChange={(e) => setFromDate(e.currentTarget.value)}
				/>
				<TextInput
					label='To Date'
					type='date'
					value={toDate}
					onChange={(e) => setToDate(e.currentTarget.value)}
				/>
			</Group>

			{/* Granularity Control */}
			<Stack gap='xs'>
				<Text size='sm' fw={500}>Granularity</Text>
				<SegmentedControl
					fullWidth
					data={[
						{ label: 'Per Call', value: 'per-call' },
						{ label: 'Daily', value: 'daily' },
						{ label: 'Weekly', value: 'weekly' },
						{ label: 'Monthly', value: 'monthly' },
					]}
					value={selectedGranularity}
					onChange={setSelectedGranularity}
				/>
			</Stack>

			{/* Comparison Checkbox */}
			<Checkbox
				label='Compare to previous period'
				checked={compare}
				onChange={(e) => setCompare(e.currentTarget.checked)}
			/>

			{/* Apply Button */}
			<Button fullWidth onClick={handleApply}>
				Apply
			</Button>
		</Stack>
	);
};

export default DateRangeAndGranularityControl;
