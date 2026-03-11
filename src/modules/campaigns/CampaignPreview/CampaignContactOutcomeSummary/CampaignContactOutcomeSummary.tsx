import { PieChart } from '@mantine/charts';
import {
	Text,
	ActionIcon,
	Skeleton,
	Button,
	Stack,
	Group,
	Badge,
} from '@mantine/core';
import { IconRefresh, IconChartPie, IconX, IconEye } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { Campaign } from '~/models/CampaignsModel';
import classes from './CampaignContactOutcomeSummary.module.css';
import { useGetCallDispositionReportParents } from '~/queries/callDispositionQueries';
import RightSectionCard from '~/components/RightSectionCard';

interface CCOSummaryProps {
	campaign?: Campaign;
}

const CampaignContactOutcomeSummary: React.FC<CCOSummaryProps> = ({
	campaign,
}) => {
	const { t } = useTranslation('campaign.detail');
	const [dispositionName, setDispositionName] = React.useState<
		string | undefined
	>(undefined);
	const [parentColor, setParentColor] = React.useState<string | undefined>(
		undefined
	);
	// Delay chart rendering until after mount to ensure container has dimensions
	const [isMounted, setIsMounted] = React.useState(false);

	React.useEffect(() => {
		// Use requestAnimationFrame to ensure DOM has been painted
		const raf = requestAnimationFrame(() => {
			setIsMounted(true);
		});
		return () => cancelAnimationFrame(raf);
	}, []);

	const { data, refetch, isLoading } = useGetCallDispositionReportParents({
		campaignId: campaign?.id,
		dispositionName,
	});

	const isCompleted = campaign?.status?.toLowerCase() === 'completed';

	const greenColor = '#66d266ff';
	const orangeColor = '#ec8022ff';
	const redColor = '#d8463eff';

	// Generate distinct colors for child dispositions
	const generateChildColors = (count: number) => {
		const colors = [
			'#3b82f6', // blue
			'#8b5cf6', // purple
			'#ec4899', // pink
			'#f59e0b', // amber
			'#10b981', // emerald
			'#06b6d4', // cyan
			'#f97316', // orange
			'#6366f1', // indigo
			'#14b8a6', // teal
			'#a855f7', // violet
			'#84cc16', // lime
			'#f43f5e', // rose
		];
		return colors.slice(0, count);
	};

	// Function to get color based on disposition name
	const getColorForDisposition = (
		dispositionNameParam: string,
		isChild: boolean = false
	) => {
		// If this is a child disposition (we have a parent selected), use parent color
		if (isChild && parentColor) {
			return parentColor;
		}

		const name = dispositionNameParam.toLowerCase();
		if (name.includes('effective contact') && !name.includes('no effective')) {
			return greenColor;
		}
		if (name.includes('no effective') || name.includes('not effective')) {
			return orangeColor;
		}
		if (name.includes('no contact') || name.includes('not contacted')) {
			return redColor;
		}
		// Default fallback colors
		return name.includes('contact') ? greenColor : orangeColor;
	};

	const PIE_DATA = React.useMemo(() => {
		if (!data?.dispositions) return [];

		const childColors =
			dispositionName && parentColor
				? generateChildColors(data.dispositions.length)
				: [];

		return data.dispositions.map((disposition, index) => ({
			name: disposition.dispositionName,
			value: disposition.count,
			color:
				dispositionName && childColors.length > 0
					? childColors[index]
					: getColorForDisposition(disposition.dispositionName, false),
			'data-index': index,
		}));
	}, [data?.dispositions, dispositionName, parentColor]);

	const LEGEND = React.useMemo(() => {
		return PIE_DATA.map((pieItem, index) => {
			const disposition = data?.dispositions?.[index];
			if (!disposition) return null;

			return {
				label: disposition.dispositionName,
				value: disposition.count,
				percent: disposition.percentage,
				color: pieItem.color,
			};
		}).filter((item): item is NonNullable<typeof item> => item !== null);
	}, [PIE_DATA, data?.dispositions]);

	const hasData = data?.dispositions && data.dispositions.length > 0;

	if (!isLoading && !hasData) {
		return null;
	}

	const handleSelectDisposition = (name: string) => {
		const color = getColorForDisposition(name, false);
		setParentColor(color);
		setDispositionName(name);
	};

	const handleClearFilter = () => {
		setDispositionName(undefined);
		setParentColor(undefined);
	};

	return (
		<RightSectionCard
			title={t('preview.outcomeSummary.title')}
			description={t('preview.outcomeSummary.description')}
			icon={IconChartPie}
			iconColor='var(--mantine-color-blue-6)'
			rightSection={
				<ActionIcon
					variant='subtle'
					color='gray'
					size='sm'
					onClick={() => refetch()}
					disabled={isCompleted}
					aria-label={t('preview.outcomeSummary.refreshData')}
				>
					<IconRefresh size={16} />
				</ActionIcon>
			}
		>
			{isLoading && campaign?.id ? (
				<Stack gap='sm'>
					<div className={classes.chartContainer}>
						<Skeleton circle height={140} width={140} />
					</div>
					<Stack gap={6}>
						{Array.from({ length: 3 }).map((_, index) => (
							<div className={classes.legendItem} key={`skeleton-${index}`}>
								<Group gap={6} style={{ flex: 1 }}>
									<Skeleton circle height={10} width={10} />
									<Skeleton height={14} width='50%' />
								</Group>
								<Skeleton height={18} width={50} />
							</div>
						))}
					</Stack>
					<div className={classes.statsCard}>
						<Skeleton height={11} width='35%' />
						<Skeleton height={20} width='25%' mt={2} />
					</div>
				</Stack>
			) : hasData ? (
				<Stack gap='sm'>
					{dispositionName && parentColor && (
						<Group gap='xs' wrap='nowrap' className={classes.parentBadge}>
							<div
								className={classes.parentDot}
								style={{ backgroundColor: parentColor }}
							/>
							<Text className={classes.parentLabel} fw={600}>
								{dispositionName}
							</Text>
						</Group>
					)}

					<div className={classes.chartContainer}>
						{isMounted ? (
							<PieChart
								data={PIE_DATA}
								size={140}
								strokeWidth={1}
								strokeColor='var(--mantine-color-body)'
								withLabelsLine={!!dispositionName}
								withLabels={!!dispositionName}
							/>
						) : (
							<Skeleton circle height={140} width={140} />
						)}
					</div>

					<Stack gap={6}>
						{LEGEND.map((item, index) => (
							<div
								className={`${classes.legendItem} ${
									dispositionName === item.label ? classes.legendItemActive : ''
								}`}
								key={`${item.label}-${index}`}
							>
								<Group gap={6} style={{ flex: 1, minWidth: 0 }}>
									<div
										className={classes.legendDot}
										style={{ backgroundColor: item.color }}
									/>
									<Text className={classes.legendLabel} truncate>
										{item.label}
									</Text>
								</Group>
								<Group gap={4} wrap='nowrap'>
									<Badge
										variant='light'
										color='gray'
										size='sm'
										className={classes.legendBadge}
									>
										{item.value.toLocaleString()}
									</Badge>
									<ActionIcon
										variant='subtle'
										color='blue'
										size='xs'
										onClick={() => handleSelectDisposition(item.label)}
										aria-label={`View ${item.label}`}
										className={classes.viewButton}
									>
										<IconEye size={14} />
									</ActionIcon>
								</Group>
							</div>
						))}
					</Stack>

					<div className={classes.statsCard}>
						<Text className={classes.statsLabel}>
							{t('preview.outcomeSummary.todaysCalls')}
						</Text>
						<Text className={classes.statsValue}>
							{data?.totalCalls?.toLocaleString() || '0'}
						</Text>
					</div>

					{dispositionName && (
						<Button
							variant='light'
							color='gray'
							size='xs'
							leftSection={<IconX size={14} />}
							onClick={handleClearFilter}
							fullWidth
						>
							{t('preview.outcomeSummary.backToOverview')}
						</Button>
					)}
				</Stack>
			) : (
				<Stack gap='sm'>
					<div className={classes.emptyState}>
						<IconChartPie size={48} className={classes.emptyIcon} />
						<Text className={classes.emptyStateText}>
							{t('preview.outcomeSummary.noData')}
						</Text>
						<Text className={classes.emptyStateSubtext}>
							{t('preview.outcomeSummary.noDataDescription')}
						</Text>
					</div>

					{dispositionName && (
						<Button
							variant='light'
							color='gray'
							size='xs'
							leftSection={<IconX size={14} />}
							onClick={handleClearFilter}
							fullWidth
						>
							{t('preview.outcomeSummary.backToOverview')}
						</Button>
					)}
				</Stack>
			)}
		</RightSectionCard>
	);
};

export default CampaignContactOutcomeSummary;
