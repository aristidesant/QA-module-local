import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Group, TextInput, SegmentedControl, Checkbox, Button, Text } from '@mantine/core';
import { useAgentAnalyticsStore } from '~/stores/qa/agentAnalyticsStore';

interface DateRangeAndGranularityControlProps {
	onApply?: (range: { from: Date; to: Date }, granularity: string, compare: boolean) => void;
}

export const DateRangeAndGranularityControl: React.FC<DateRangeAndGranularityControlProps> = ({
	onApply,
}) => {
	const { t } = useTranslation('qa.agent.analytics');
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
					label={t('controls.fromDate')}
					type='date'
					value={fromDate}
					onChange={(e) => setFromDate(e.currentTarget.value)}
				/>
				<TextInput
					label={t('controls.toDate')}
					type='date'
					value={toDate}
					onChange={(e) => setToDate(e.currentTarget.value)}
				/>
			</Group>

			{/* Granularity Control */}
			<Stack gap='xs'>
				<Text size='sm' fw={500}>{t('controls.granularity')}</Text>
				<SegmentedControl
					fullWidth
					data={[
						{ label: t('controls.granularityOptions.perCall'), value: 'per-call' },
						{ label: t('controls.granularityOptions.daily'), value: 'daily' },
						{ label: t('controls.granularityOptions.weekly'), value: 'weekly' },
						{ label: t('controls.granularityOptions.monthly'), value: 'monthly' },
					]}
					value={selectedGranularity}
					onChange={setSelectedGranularity}
				/>
			</Stack>

			{/* Comparison Checkbox */}
			<Checkbox
				label={t('controls.compareCheckbox')}
				checked={compare}
				onChange={(e) => setCompare(e.currentTarget.checked)}
			/>

			{/* Apply Button */}
			<Button fullWidth onClick={handleApply}>
				{t('controls.applyButton')}
			</Button>
		</Stack>
	);
};

export default DateRangeAndGranularityControl;
