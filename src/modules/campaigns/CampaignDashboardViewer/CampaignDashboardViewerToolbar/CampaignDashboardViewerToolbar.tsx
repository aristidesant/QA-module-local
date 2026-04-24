import {
	ActionIcon,
	Badge,
	Button,
	Card,
	Group,
	Menu,
	Tooltip,
} from '@mantine/core';
import {
	IconArrowsRightLeft,
	IconCheck,
	IconChevronDown,
	IconDeviceFloppy,
	IconEdit,
	IconLayoutDashboard,
	IconLayoutGrid,
	IconRefresh,
	IconTimeline,
	IconX,
} from '@tabler/icons-react';
import { IconChevronLeft } from '@tabler/icons-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
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
	renderLoading: boolean;
	selectedTimeRange: AnalyticsTimeRange | null;
	period?: DashboardPeriod;
	comparisonPeriod?: { current: DashboardPeriod; previous: DashboardPeriod };
	comparisonEnabled: boolean;
	allowLayoutEditing: boolean;
	showBackButton?: boolean;
	onBackClick?: () => void;
	onAutoOrganize: () => void;
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

const isSameCalendarDay = (startIso: string, endIso: string): boolean => {
	const start = new Date(startIso);
	const end = new Date(endIso);

	return (
		start.getFullYear() === end.getFullYear() &&
		start.getMonth() === end.getMonth() &&
		start.getDate() === end.getDate()
	);
};

const formatDashboardPeriod = (period: DashboardPeriod): string => {
	const startLabel = formatPeriodDate(period.start);

	if (isSameCalendarDay(period.start, period.end)) {
		return startLabel;
	}

	return `${startLabel} – ${formatPeriodDate(period.end)}`;
};

const CampaignDashboardViewerToolbar = ({
	dashboardOptions,
	isFetching,
	isLayoutEditingAvailable,
	isMobile,
	isSavingLayout,
	renderLoading,
	selectedTimeRange,
	period,
	comparisonPeriod,
	comparisonEnabled,
	allowLayoutEditing,
	showBackButton,
	onBackClick,
	onAutoOrganize,
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
	const selectedDashboardId = useCampaignDashboardViewerStore(
		(state) => state.selectedDashboardId
	);
	const setSelectedDashboardId = useCampaignDashboardViewerStore(
		(state) => state.setSelectedDashboardId
	);

	const isControlDisabled = isEditingLayout || isSavingLayout;
	const activeRangeValue = selectedTimeRange ?? 'all';
	const selectedDashboardLabel =
		dashboardOptions.find((option) => option.value === selectedDashboardId)
			?.label ??
		dashboardOptions[0]?.label ??
		t('dashboard.menu.selectDashboard');
	const activeRangeLabel =
		activeRangeValue === 'all'
			? t('dashboard.timeRange.all')
			: t(`dashboard.timeRange.${activeRangeValue}`);

	const handleTimeRangeChange = (value: string) => {
		onTimeRangeChange(value === 'all' ? null : (value as AnalyticsTimeRange));
	};

	const periodLabel = (() => {
		if (comparisonEnabled && comparisonPeriod) {
			return t('dashboard.comparisonPeriod', {
				currentPeriod: formatDashboardPeriod(comparisonPeriod.current),
				previousPeriod: formatDashboardPeriod(comparisonPeriod.previous),
			});
		}
		if (period) {
			return t('dashboard.period', {
				period: formatDashboardPeriod(period),
			});
		}
		return null;
	})();

	return (
		<Card className={styles.card} padding='sm' radius='md'>
			<div className={styles.toolbar}>
				<div className={styles.controlsSlot}>
					<Group gap='xs' wrap='wrap'>
						{showBackButton && onBackClick ? (
							<Tooltip label={t('dashboardBuilder.preview.back')}>
								<ActionIcon
									variant='default'
									className={styles.backButton}
									onClick={onBackClick}
									size='lg'
								>
									<IconChevronLeft size={18} />
								</ActionIcon>
							</Tooltip>
						) : null}
						<Menu
							position='bottom-start'
							withArrow
							shadow='md'
							withinPortal
							disabled={isControlDisabled}
						>
							<Menu.Target>
								<Button
									size='sm'
									variant='default'
									className={styles.triggerButton}
									leftSection={<IconLayoutDashboard size={15} />}
									rightSection={<IconChevronDown size={14} />}
									disabled={isControlDisabled}
								>
									<span className={styles.triggerLabel}>
										{selectedDashboardLabel}
									</span>
								</Button>
							</Menu.Target>
							<Menu.Dropdown className={styles.menuDropdown}>
								<Menu.Label>{t('dashboard.menu.dashboardLabel')}</Menu.Label>
								{dashboardOptions.map((option) => (
									<Menu.Item
										key={option.value}
										onClick={() => setSelectedDashboardId(option.value)}
										leftSection={
											option.value === selectedDashboardId ? (
												<IconCheck size={14} />
											) : undefined
										}
									>
										{option.label}
									</Menu.Item>
								))}
							</Menu.Dropdown>
						</Menu>
						<Menu
							position='bottom-start'
							withArrow
							shadow='md'
							withinPortal
							disabled={isControlDisabled}
						>
							<Menu.Target>
								{periodLabel ? (
									<Tooltip label={periodLabel}>
										<Button
											size='sm'
											variant='default'
											className={styles.triggerButton}
											leftSection={<IconTimeline size={15} />}
											rightSection={<IconChevronDown size={14} />}
											disabled={isControlDisabled}
										>
											<span className={styles.triggerLabel}>
												{activeRangeLabel}
											</span>
										</Button>
									</Tooltip>
								) : (
									<Button
										size='sm'
										variant='default'
										className={styles.triggerButton}
										leftSection={<IconTimeline size={15} />}
										rightSection={<IconChevronDown size={14} />}
										disabled={isControlDisabled}
									>
										<span className={styles.triggerLabel}>
											{activeRangeLabel}
										</span>
									</Button>
								)}
							</Menu.Target>
							<Menu.Dropdown className={styles.menuDropdown}>
								<Menu.Label>{t('dashboard.menu.timeRangeLabel')}</Menu.Label>
								{TIME_RANGE_KEYS.map((key) => {
									const label =
										key === 'all'
											? t('dashboard.timeRange.all')
											: t(`dashboard.timeRange.${key}`);

									return (
										<Menu.Item
											key={key}
											onClick={() => handleTimeRangeChange(key)}
											leftSection={
												activeRangeValue === key ? (
													<IconCheck size={14} />
												) : undefined
											}
										>
											{label}
										</Menu.Item>
									);
								})}
							</Menu.Dropdown>
						</Menu>
						{selectedTimeRange ? (
							<Tooltip label={t('dashboard.comparison.toggle')}>
								<Button
									size='sm'
									variant='default'
									className={clsx(
										styles.compareButton,
										comparisonEnabled && styles['compareButton--active']
									)}
									leftSection={<IconArrowsRightLeft size={15} />}
									onClick={() => onComparisonChange(!comparisonEnabled)}
									disabled={isControlDisabled}
								>
									{t('dashboard.comparison.shortToggle')}
								</Button>
							</Tooltip>
						) : null}
					</Group>
				</div>

				<div className={styles.actionsSlot}>
					<Group gap='xs' wrap='wrap' justify='flex-end'>
						{allowLayoutEditing && isEditingLayout ? (
							<Badge
								size='sm'
								variant='light'
								color='gray'
								radius='sm'
								className={styles.editingBadge}
							>
								{t('dashboard.layoutEditor.editingBadge')}
							</Badge>
						) : null}

						{allowLayoutEditing && isEditingLayout ? (
							<>
								<Tooltip label={t('dashboard.layoutEditor.autoOrganize')}>
									<Button
										size='sm'
										variant='default'
										className={styles.secondaryAction}
										leftSection={<IconLayoutGrid size={16} />}
										onClick={onAutoOrganize}
										disabled={isSavingLayout}
									>
										{t('dashboard.layoutEditor.autoOrganize')}
									</Button>
								</Tooltip>
								<Button
									size='sm'
									variant='default'
									className={styles.secondaryAction}
									leftSection={<IconX size={16} />}
									onClick={onCancelEditing}
									disabled={isSavingLayout}
								>
									{t('dashboard.layoutEditor.cancel')}
								</Button>
								<Button
									size='sm'
									className={styles.primaryAction}
									leftSection={<IconDeviceFloppy size={16} />}
									onClick={onSaveLayout}
									loading={isSavingLayout}
								>
									{t('dashboard.layoutEditor.save')}
								</Button>
							</>
						) : allowLayoutEditing ? (
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
										variant='default'
										className={styles.secondaryAction}
										leftSection={<IconEdit size={16} />}
										onClick={onStartEditing}
										disabled={!isLayoutEditingAvailable || renderLoading}
									>
										{t('dashboard.layoutEditor.edit')}
									</Button>
								</span>
							</Tooltip>
						) : null}

						<Tooltip label={t('dashboard.refresh')}>
							<ActionIcon
								variant='default'
								className={styles.refreshAction}
								onClick={onRefresh}
								loading={isFetching}
								size='md'
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
