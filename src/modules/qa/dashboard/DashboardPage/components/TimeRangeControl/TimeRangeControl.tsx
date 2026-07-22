import { SegmentedControl } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import {
	useDashboardFilterStore,
	type DashboardTimeRange,
} from '~/stores/qaDashboardFilterStore';
import { DASHBOARD_TIME_RANGES } from '../../DashboardPage.constants';
import classes from './TimeRangeControl.module.css';

export default function TimeRangeControl() {
	const { t } = useTranslation('qa.dashboard');
	const timeRange = useDashboardFilterStore((state) => state.timeRange);
	const setTimeRange = useDashboardFilterStore((state) => state.setTimeRange);

	return (
		<SegmentedControl
			className={classes.control}
			data={DASHBOARD_TIME_RANGES.map((range) => ({
				value: range,
				label: t(`range.${range.toLowerCase()}`),
			}))}
			onChange={(value) => setTimeRange(value as DashboardTimeRange)}
			size='sm'
			value={timeRange}
		/>
	);
}
