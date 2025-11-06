import { useMemo } from 'react';
import { Box, Text, Group, Progress } from '@mantine/core';
import { useCampaignActiveSchedule } from '~/queries/schedulerQueries';
import { useGetContactGroups } from '~/queries/contactGroupQueries';
import { calculateHumanEquivalentValues } from '../../ContactLimits/humanEquivalentCalculations';
import classes from './CapacityProgress.module.css';

export interface CapacityProgressProps {
	campaignId?: string | number;
}

const CapacityProgress = ({ campaignId }: CapacityProgressProps) => {
	const { data: activeSchedule } = useCampaignActiveSchedule(campaignId);
	const { data: contactGroupsData } = useGetContactGroups({
		isActive: true,
		campaignId,
	});

	const calculations = useMemo(
		() =>
			calculateHumanEquivalentValues(
				contactGroupsData?.data || [],
				activeSchedule,
				undefined
			),
		[contactGroupsData?.data, activeSchedule]
	);

	const { usageEquivalent, totalSchedulerCapacity } = calculations;

	const usagePercentage = totalSchedulerCapacity
		? Math.min(
				100,
				Math.round((usageEquivalent / totalSchedulerCapacity) * 100)
			)
		: 0;

	const remainingCapacity = Math.max(
		totalSchedulerCapacity - usageEquivalent,
		0
	);

	const progressIntent =
		usagePercentage >= 90 ? 'high' : usagePercentage >= 70 ? 'medium' : 'low';

	const progressColor =
		progressIntent === 'high'
			? 'red'
			: progressIntent === 'medium'
				? 'orange'
				: 'blue';

	const numberFormatter = useMemo(
		() =>
			new Intl.NumberFormat('en-US', {
				minimumFractionDigits: 0,
				maximumFractionDigits: 2,
			}),
		[]
	);

	if (totalSchedulerCapacity <= 0) {
		return null;
	}

	return (
		<Box className={classes.capacityCard}>
			<Group
				justify='space-between'
				align='center'
				className={classes.capacityHeader}
			>
				<Text size='sm' fw={600} className={classes.capacityTitle}>
					Human Equivalent Usage
				</Text>
				<Box className={classes.percentageBadge} data-intent={progressIntent}>
					<Text className={classes.percentageValue}>{usagePercentage}%</Text>
				</Box>
			</Group>
			<Progress
				value={usagePercentage}
				color={progressColor}
				size='md'
				radius='md'
				className={classes.progressBar}
				classNames={{
					section: classes.progressSection,
				}}
			/>
			<Group justify='space-around' className={classes.capacityDetails}>
				<div className={classes.detailItem}>
					<Text size='xs' c='dimmed' className={classes.detailLabel}>
						Used
					</Text>
					<Text size='sm' fw={600}>
						{numberFormatter.format(usageEquivalent)}
					</Text>
				</div>
				<div className={classes.detailItem}>
					<Text size='xs' c='dimmed' className={classes.detailLabel}>
						Remaining
					</Text>
					<Text size='sm' fw={600}>
						{numberFormatter.format(remainingCapacity)}
					</Text>
				</div>
				<div className={classes.detailItem}>
					<Text size='xs' c='dimmed' className={classes.detailLabel}>
						Total
					</Text>
					<Text size='sm' fw={600}>
						{numberFormatter.format(totalSchedulerCapacity)}
					</Text>
				</div>
			</Group>
		</Box>
	);
};

export default CapacityProgress;
