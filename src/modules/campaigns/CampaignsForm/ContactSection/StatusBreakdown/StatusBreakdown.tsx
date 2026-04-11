import { Group, Text, Box, Card, Title, Skeleton } from '@mantine/core';
import styles from './StatusBreakdown.module.css';
import { PieChart } from '@mantine/charts';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useGetContactSummaryGroups } from '~/queries/contactsQueries';
import { ContactStatus } from '~/models/ContactsModel';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const StatusBreakdown = () => {
	const { t } = useTranslation(['campaign.form.contacts', 'common']);
	const selectedCampaign = useCampaignsStore((state) => state.selectedCampaign);

	const { data: summaryData, isLoading } = useGetContactSummaryGroups(
		selectedCampaign?.id || 0
	);

	// Function to generate consistent colors for the chart segments
	const CHART_COLORS: readonly string[] = [
		'green',
		'blue',
		'orange',
		'red',
		'violet',
		'cyan',
		'yellow',
		'pink',
		'indigo',
		'teal',
	] as const;

	const CHART_COLOR_CSS_VARS: readonly string[] = [
		'var(--mantine-color-green-6)',
		'var(--mantine-color-blue-6)',
		'var(--mantine-color-orange-5)',
		'var(--mantine-color-red-6)',
		'var(--mantine-color-violet-6)',
		'var(--mantine-color-cyan-6)',
		'var(--mantine-color-yellow-6)',
		'var(--mantine-color-pink-6)',
		'var(--mantine-color-indigo-6)',
		'var(--mantine-color-teal-6)',
	] as const;

	const getChartColor = (index: number): string => {
		return CHART_COLORS[index % CHART_COLORS.length];
	};

	const getChartColorCssVar = (index: number): string => {
		return CHART_COLOR_CSS_VARS[index % CHART_COLOR_CSS_VARS.length];
	};

	// Function to format status names for display
	const formatStatusName = (status: string): string => {
		return t(`contactListPage.contactsTable.status.${status}`, {
			defaultValue: status
				.toLowerCase()
				.split('_')
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' '),
		});
	};

	// Get all possible statuses from the enum
	const allStatuses = Object.values(ContactStatus);

	// Create a map of status counts from API data
	const statusCountMap = useMemo(() => {
		const map = new Map<string, number>();
		summaryData?.statusBreakdown?.forEach((item) => {
			map.set(item.status, item.count);
		});
		return map;
	}, [summaryData]);

	// Prepare chart data (only statuses with data > 0 for the pie chart)
	const chartData = useMemo(
		() =>
			summaryData?.statusBreakdown
				?.filter((dp) => dp.count > 0)
				?.map((dp) => {
					// Find the index of this status in the allStatuses array to get consistent color
					const statusIndex = allStatuses.indexOf(dp.status as ContactStatus);
					return {
						name: formatStatusName(dp.status),
						value: dp.count,
						color: getChartColor(statusIndex),
					};
				}) || [],
		[summaryData, allStatuses]
	);

	// Prepare complete legend data (all statuses)
	const legendData = useMemo(() => {
		return allStatuses.map((status, index) => ({
			status,
			count: statusCountMap.get(status) || 0,
			color: getChartColorCssVar(index),
			hasData:
				statusCountMap.has(status) && (statusCountMap.get(status) || 0) > 0,
		}));
	}, [statusCountMap]);

	// Check if there is data to display
	const hasData = useMemo(() => chartData.length > 0, [chartData]);

	return (
		<Card className={styles.card}>
			<Title order={5} mb='xs' className={styles.title}>
				{t('form.contacts.statusBreakdown.title')}
			</Title>
			<Text size='xs' c='dimmed' mb='md' className={styles.subtitle}>
				{t('form.contacts.statusBreakdown.subtitle')}
			</Text>

			<div className={styles.container}>
				<div className={styles.chartContainer}>
					{isLoading ? (
						<>
							{/* Skeleton for pie chart */}
							<Skeleton circle height={160} width={160} />

							<div className={styles.statusList}>
								{/* Skeleton for status items */}
								{Array.from({ length: 5 }).map((_, index) => (
									<Group key={index} justify='space-between' mb='xs'>
										<Group gap='xs'>
											<Skeleton circle height={12} width={12} />
											<Skeleton height={12} width={100} />
										</Group>
										<Skeleton height={12} width={30} />
									</Group>
								))}
								<Box className={styles.totalContainer} mt='sm' p='xs'>
									<Group justify='space-between'>
										<Skeleton height={12} width={40} />
										<Skeleton height={12} width={30} />
									</Group>
								</Box>
							</div>
						</>
					) : hasData ? (
						<div className={styles.contentContainer}>
							{/* Chart and Legend Section - Side by Side */}
							<div className={styles.chartSection}>
								<div className={styles.pieChartWrapper}>
									<PieChart
										data={chartData}
										size={160}
										mt='sm'
										withTooltip
										tooltipDataSource='segment'
										strokeWidth={0}
									/>
								</div>
								<div className={styles.legendList}>
									{legendData.map((item, index) => (
										<div
											key={`${item.status}-${index}`}
											className={`${styles.legendItem} ${
												!item.hasData ? styles.legendItemEmpty : ''
											}`}
										>
											<Box
												className={styles.colorDot}
												style={{
													backgroundColor: item.hasData
														? item.color
														: 'var(--mantine-color-gray-3)',
												}}
											/>
											<Text size='xs' className={styles.legendText}>
												{formatStatusName(item.status)}
											</Text>
											<Text size='xs' fw={600} className={styles.legendCount}>
												{item.count}
											</Text>
										</div>
									))}
								</div>
							</div>

							{/* Total Section - Bottom */}
							<div className={styles.totalSection}>
								<Text size='sm' fw={600} className={styles.totalLabel}>
									{t('form.contacts.statusBreakdown.total')}
								</Text>
								<Text size='xl' fw={700} className={styles.totalValue}>
									{summaryData?.totalContacts?.toLocaleString()}
								</Text>
							</div>
						</div>
					) : (
						<div className={styles.noDataContainer}>
							<Text size='sm' c='dimmed' ta='center'>
								{t('form.contacts.statusBreakdown.noData')}
							</Text>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
};
