import { ActionIcon, Badge, Button, Card, Group, Tooltip } from '@mantine/core';
import {
	IconArrowsRightLeft,
	IconCalendar,
	IconDeviceFloppy,
	IconEdit,
	IconRefresh,
	IconX,
} from '@tabler/icons-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import CampaignDashboardViewerFilter from '../CampaignDashboardViewerFilter';
import useCampaignDashboardViewerStore from '../store/useCampaignDashboardViewerStore';
import type { DashboardOption } from '../types';
import type {
	AnalyticsTimeRange,
	DashboardPeriod,
} from '~/models/AnalyticsDashboard';
import styles from './CampaignDashboardViewerToolbar.module.css';

interface CampaignDashboardViewerToolbarProps {
	dashboardOptions: DashboardOption[];
	isFetching: boolean;
	isLayoutEditingAvailable: boolean;
	isMobile: boolean;
	isSavingLayout: boolean;
	hasDraftChanges: boolean;
	renderLoading: boolean;
	selectedTimeRange: AnalyticsTimeRange | null;
	period?: DashboardPeriod;
	comparisonPeriod?: { current: DashboardPeriod; previous: DashboardPeriod };
	comparisonEnabled: boolean;
	onCancelEditing: () => void;
	onRefresh: () => void;
	onSaveLayout: () => void;
	onStartEditing: () => void;
	onTimeRangeChange: (value: AnalyticsTimeRange | null) => void;
	onComparisonChange: (value: boolean) => void;
}

const TIME_RANGE_KEYS = ['all', 'TODAY', 'WEEK', 'MONTH', 'YEAR'] as const;

const formatPeriodDate = (iso: string): string => {
	return new Date(iso).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
	});
};

const CampaignDashboardViewerToolbar = ({
	dashboardOptions,
	isFetching,
	isLayoutEditingAvailable,
	isMobile,
	isSavingLayout,
	hasDraftChanges,
	renderLoading,
	selectedTimeRange,
	period,
	comparisonPeriod,
	comparisonEnabled,
	onCancelEditing,
	onRefresh,
	onSaveLayout,
	onStartEditing,
	onTimeRangeChange,
	onComparisonChange,
}: CampaignDashboardViewerToolbarProps) => {
	const { t } = useTranslation('campaign.form.dashboards');
	const isEditingLayout = useCampaignDashboardViewerStore(
		(state) => state.isEditingLayout
	);

	const isControlDisabled = isEditingLayout || isSavingLayout;
	const activeRangeValue = selectedTimeRange ?? 'all';

	const handleTimeRangeChange = (value: string) => {
		onTimeRangeChange(value === 'all' ? null : (value as AnalyticsTimeRange));
	};

	const periodLabel = (() => {
		if (comparisonEnabled && comparisonPeriod) {
			return t('dashboard.comparisonPeriod', {
				currentStart: formatPeriodDate(comparisonPeriod.current.start),
				currentEnd: formatPeriodDate(comparisonPeriod.current.end),
				previousStart: formatPeriodDate(comparisonPeriod.previous.start),
				previousEnd: formatPeriodDate(comparisonPeriod.previous.end),
			});
		}
		if (period) {
			return t('dashboard.period', {
				start: formatPeriodDate(period.start),
				end: formatPeriodDate(period.end),
			});
		}
		return null;
	})();

	return (
		<Card className={styles.card} padding='sm' radius='lg'>
			<div className={styles.toolbar}>
				<div className={styles.filterSlot}>
					<CampaignDashboardViewerFilter
						data={dashboardOptions}
						disabled={isControlDisabled}
					/>
				</div>

				<div className={styles.middleSlot}>
					<div className={styles.timeRangePicker}>
						{TIME_RANGE_KEYS.map((key) => (
							<button
								key={key}
								type='button'
								className={clsx(
									styles.rangeBtn,
									activeRangeValue === key && styles['rangeBtn--active']
								)}
								onClick={() => handleTimeRangeChange(key)}
								disabled={isControlDisabled}
							>
								{key === 'all'
									? t('dashboard.timeRange.all')
									: t(`dashboard.timeRange.${key}`)}
							</button>
						))}
					</div>

					{periodLabel ? (
						<div className={styles.periodChip}>
							<IconCalendar size={11} />
							<span>{periodLabel}</span>
						</div>
					) : null}

					{selectedTimeRange ? (
						<button
							type='button'
							className={clsx(
								styles.compareBtn,
								comparisonEnabled && styles['compareBtn--active']
							)}
							onClick={() => onComparisonChange(!comparisonEnabled)}
							disabled={isControlDisabled}
						>
							<IconArrowsRightLeft size={11} />
							<span>{t('dashboard.comparison.toggle')}</span>
						</button>
					) : null}
				</div>

				<div className={styles.actionsSlot}>
					<Group gap='xs' wrap='wrap' justify='flex-end'>
						{isEditingLayout ? (
							<Badge size='sm' variant='light' color='blue'>
								{t('dashboard.layoutEditor.editingBadge')}
							</Badge>
						) : null}

						{isEditingLayout ? (
							<>
								<Button
									size='sm'
									variant='subtle'
									leftSection={<IconX size={16} />}
									onClick={onCancelEditing}
									disabled={isSavingLayout}
								>
									{t('dashboard.layoutEditor.cancel')}
								</Button>
								<Button
									size='sm'
									leftSection={<IconDeviceFloppy size={16} />}
									onClick={onSaveLayout}
									loading={isSavingLayout}
									disabled={!hasDraftChanges}
								>
									{t('dashboard.layoutEditor.save')}
								</Button>
							</>
						) : (
							<Tooltip
								label={
									isMobile
										? t('dashboard.layoutEditor.mobileUnavailable')
										: t('dashboard.layoutEditor.edit')
								}
							>
								<span>
									<Button
										size='sm'
										variant='subtle'
										leftSection={<IconEdit size={16} />}
										onClick={onStartEditing}
										disabled={!isLayoutEditingAvailable || renderLoading}
									>
										{t('dashboard.layoutEditor.edit')}
									</Button>
								</span>
							</Tooltip>
						)}

						<Tooltip label={t('dashboard.refresh')}>
							<ActionIcon
								variant='subtle'
								onClick={onRefresh}
								loading={isFetching}
								size='lg'
								disabled={isEditingLayout || isSavingLayout}
							>
								<IconRefresh size={16} />
							</ActionIcon>
						</Tooltip>
					</Group>
				</div>
			</div>
		</Card>
	);
};

export default CampaignDashboardViewerToolbar;
