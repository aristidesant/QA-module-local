import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Stack,
	Group,
	TextInput,
	Checkbox,
	Button,
	Select,
} from '@mantine/core';
import { useAgentAnalyticsStore } from '~/stores/qa/agentAnalyticsStore';
import { ANALYTICS_CAMPAIGNS } from '~/modules/qa/dashboard/mockData';

interface DateRangeAndGranularityControlProps {
	onApply?: (
		range: { from: Date; to: Date },
		granularity: string,
		compare: boolean
	) => void;
}

export const DateRangeAndGranularityControl: React.FC<
	DateRangeAndGranularityControlProps
> = ({ onApply }) => {
	const { t } = useTranslation('qa.agent.analytics');
	const {
		dateRange,
		setDateRange,
		granularity,
		compareWithPrevious,
		toggleComparison,
		selectedCampaign,
		setCampaign,
	} = useAgentAnalyticsStore();

	// Local state for form inputs
	const [fromDate, setFromDate] = useState<string>(
		dateRange.from.toISOString().split('T')[0]
	);
	const [toDate, setToDate] = useState<string>(
		dateRange.to.toISOString().split('T')[0]
	);
	const [compare, setCompare] = useState<boolean>(compareWithPrevious);

	const handleApply = () => {
		const from = new Date(fromDate);
		const to = new Date(toDate);

		setDateRange({ from, to });

		if (compare !== compareWithPrevious) {
			toggleComparison();
		}

		// Call optional callback
		if (onApply) {
			onApply({ from, to }, granularity, compare);
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

			{/* Campaign Filter */}
			<Select
				label={t('filters.campaign')}
				placeholder={t('filters.allCampaigns')}
				data={ANALYTICS_CAMPAIGNS.map((c) => ({ value: c.id, label: c.name }))}
				value={selectedCampaign}
				onChange={(value) => setCampaign(value)}
				clearable
				searchable
			/>

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
