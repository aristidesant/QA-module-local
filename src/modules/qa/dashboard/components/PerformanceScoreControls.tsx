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

interface PerformanceScoreControlsProps {
	period: PerformanceScorePeriod;
	onPeriodChange: (period: PerformanceScorePeriod) => void;
	/** Omit on dashboards without a Line of Business filter (Agent). */
	lineOfBusiness?: DashboardLineOfBusiness | null;
	onLineOfBusinessChange?: (value: DashboardLineOfBusiness | null) => void;
}

/** Period (and Line of Business) controls, rendered in the Performance Score header so it is clear they only filter that section. */
export const PerformanceScoreControls: React.FC<
	PerformanceScoreControlsProps
> = ({ period, onPeriodChange, lineOfBusiness, onLineOfBusinessChange }) => {
	const { t } = useTranslation('qa.dashboard');

	return (
		<Group gap='sm' wrap='wrap' justify='flex-end'>
			{onLineOfBusinessChange && (
				<Select
					size='sm'
					aria-label={t('roleDashboard.filters.lineOfBusiness')}
					placeholder={t('roleDashboard.filters.allLines')}
					data={DASHBOARD_LINES_OF_BUSINESS}
					value={lineOfBusiness ?? null}
					onChange={(value) =>
						onLineOfBusinessChange(value as DashboardLineOfBusiness | null)
					}
					clearable
					w={220}
				/>
			)}
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
		</Group>
	);
};

export default PerformanceScoreControls;
