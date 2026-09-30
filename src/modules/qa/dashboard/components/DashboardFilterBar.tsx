import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Select, SegmentedControl } from '@mantine/core';
import {
	PERFORMANCE_SCORE_PERIODS,
	type PerformanceScorePeriod,
} from '../constants';
import {
	DASHBOARD_LINES_OF_BUSINESS,
	type DashboardLineOfBusiness,
} from '../lineOfBusiness';

interface DashboardFilterBarProps {
	period: PerformanceScorePeriod;
	onPeriodChange: (period: PerformanceScorePeriod) => void;
	/** Omit on dashboards without a Line of Business filter (Agent). */
	lineOfBusiness?: DashboardLineOfBusiness | null;
	onLineOfBusinessChange?: (value: DashboardLineOfBusiness | null) => void;
}

/** One filter row shared by the role dashboards: period first, then Line of Business when the role has it. */
export const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
	period,
	onPeriodChange,
	lineOfBusiness,
	onLineOfBusinessChange,
}) => {
	const { t } = useTranslation('qa.dashboard');

	return (
		<Group justify='space-between' align='flex-end' gap='md'>
			<SegmentedControl
				size='sm'
				aria-label={t('roleDashboard.filters.period')}
				value={period}
				onChange={(value) => onPeriodChange(value as PerformanceScorePeriod)}
				data={PERFORMANCE_SCORE_PERIODS.map((p) => ({
					value: p.value,
					label: t(p.labelKey),
				}))}
			/>
			{onLineOfBusinessChange && (
				<Select
					label={t('roleDashboard.filters.lineOfBusiness')}
					description={t('roleDashboard.filters.lineOfBusinessHint')}
					placeholder={t('roleDashboard.filters.allLines')}
					data={DASHBOARD_LINES_OF_BUSINESS}
					value={lineOfBusiness ?? null}
					onChange={(value) =>
						onLineOfBusinessChange(value as DashboardLineOfBusiness | null)
					}
					clearable
					w={240}
				/>
			)}
		</Group>
	);
};

export default DashboardFilterBar;
